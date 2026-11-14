// Queixada Zumbi (Pantanal, IA-39): investida em faixa que derruba, investida SINCRONIZADA em bando (3+, mesma faixa
// e mesmo aviso), estouro (vizinhas recuam após golpe forte), vulnerável depois da investida (+25%), flanco (+20%),
// estalo que atordoa só nas formas da Lua. Mundo mínimo e factory falsa; não depende de ZOMBIES nem do registro oficial.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import {
  queixada, queixadaGuard, startCharge, chargeStep, snapHit, stampede, isFlank, bandMates, laneEnd, isolatedTarget, QX,
} from '../src/expedition/ai/queixada';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), attack: anim(8, { hit: 3, warn: [0, 2], reach: 32 }),
    charge: anim(10, { warn: [0, 3], run: [4, 8], reach: 240, dur: () => 90 }), snap: anim(6, { hit: 3, warn: [0, 2], reach: 40 }),
    pant: anim(6, { dur: () => 160 }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(7), tumble: anim(4), grabbed: anim(4),
  },
};
const DEF = { nome: 'Queixada Zumbi', art: 'QUEIXADA', ax: 100, G: 130, top: 66, w: 30, hp: 90, dmg: 12, ai: 'queixada', mapa: 'futuro', xp: 8, desc: '' };

if (!(REGISTRY as any).queixada) (REGISTRY as any).queixada = queixada; // o orquestrador registra de verdade depois

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pantanal', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], beams: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} }, TWEEN: { track: (a: number[], fi: number) => a[Math.min(fi, a.length - 1)] } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { queixada: { ...DEF, id: 'queixada', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178, lv = 5): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function pig(w: World, x = 200, y = 178, form = 'comum', face: 1 | -1 = -1): Zombie {
  const K = (w.zk as any).queixada;
  const z: any = { uid: ++(w as any).uid, kind: 'queixada', K, form, x, y, z: 0, face, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Queixada Zumbi', () => {
  it('arte própria de quadrúpede com as animações da ficha (sem stub)', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/queixada.js'), 'utf8');
    expect(src).toMatch(/const QUEIXADA=\(function\(\)/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'charge', 'snap', 'pant', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'tumble', 'grabbed']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/run:\[4,8\]/);
    expect(src).toMatch(/blood:\[/); expect(src).toMatch(/acid:\[/);
    expect(src).toMatch(/PIX\.getK\(\)/);
    expect((GUARDS as any).queixada).toBe(queixadaGuard);
  });

  it('investida sozinha: faixa de 24 px até a borda, derruba e empurra 26 px quem cruzar', () => {
    const w = world(); const z = pig(w, 300); const a = fighter(w, 200, 178), b = fighter(w, 220, 196);
    const g = startCharge(w, z, a);
    expect(g).toEqual([z]);
    expect(w.warns.length).toBe(1);
    expect(w.warns[0].x1).toBe(laneEnd(w, 300, -1));
    z.fi = 4;
    let hits: Fighter[] = [];
    for (let i = 0; i < 60; i++) hits = hits.concat(chargeStep(w, z, 1 / 60));
    expect(hits).toEqual([a]);
    expect(a.hp).toBeLessThan(5000); expect(b.hp).toBe(5000);
    expect(['kd', 'stun']).toContain(a.state); // derrubado
    expect(a.x).toBeLessThanOrEqual(200 - QX.push);
    expect(z.x).toBeCloseTo(laneEnd(w, 300, -1), 5);
    expect(Math.abs(300 - z.x)).toBeLessThanOrEqual(260);
  });

  it('bando (3+): investida sincronizada na mesma faixa, mesmo aviso (faixa larga) e todas correm juntas', () => {
    const w = world(); const lead = pig(w, 300, 178), b = pig(w, 330, 190), c = pig(w, 280, 166);
    const f = fighter(w, 120);
    const g = startCharge(w, lead, f);
    expect(g.length).toBe(3);
    for (const z of g) { expect(z.state).toBe('attack'); expect(z.anim).toBe('charge'); expect(z.face).toBe(-1); expect(z._chg.y).toBe(178); expect(z._chg.wide).toBe(true); }
    expect(w.warns.length).toBe(2); // faixa larga (duas faixas coladas), um aviso só, do líder
    expect(w.warns.every((t) => t.owner === lead)).toBe(true);
    // no aviso todas entram na faixa do líder
    for (let i = 0; i < 30; i++) for (const z of g) chargeStep(w, z, 1 / 60);
    expect(b.y).toBe(178); expect(c.y).toBe(178);
    // com 2 só não sincroniza
    const w2 = world(); const p1 = pig(w2, 300), p2 = pig(w2, 320); fighter(w2, 100);
    expect(startCharge(w2, p1, w2.fs[0]).length).toBe(1);
    expect(p2.state).toBe('chase');
    expect(bandMates(w2, p1)).toEqual([p2].filter((o) => o.state !== 'attack'));
  });

  it('bando acerta cada lutador uma vez e a faixa larga pega quem está a 16 px da linha', () => {
    const w = world(); const lead = pig(w, 300, 178), b = pig(w, 320, 178), c = pig(w, 340, 178);
    const f = fighter(w, 200, 194);
    startCharge(w, lead, f);
    for (const z of [lead, b, c]) z.fi = 4;
    let total = 0;
    for (let i = 0; i < 60; i++) for (const z of [lead, b, c]) total += chargeStep(w, z, 1 / 60).length;
    expect(total).toBe(1);
    expect(f.hp).toBeLessThan(5000);
  });

  it('depois da investida fica OFEGANTE: +25% de dano por 1 s; flanco +20%', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = pig(w, 200, 178, 'comum', -1); const front = fighter(w, 170, 178), back = fighter(w, 240, 178);
    damageZ(w, z, 40, 1, front); expect(z.hp).toBe(960);
    damageZ(w, z, 40, 1, back); expect(z.hp).toBe(960 - Math.round(40 * QX.flankMul));
    const deep = fighter(w, 170, 192); expect(isFlank(z, deep)).toBe(true); expect(isFlank(z, front)).toBe(false);
    z.vulnT = 0.5; const hp0 = z.hp;
    damageZ(w, z, 40, 1, front); expect(hp0 - z.hp).toBe(Math.round(40 * QX.vulnMul));
  });

  it('fluxo: investida → ofegante (vulnT ~1 s) → volta a perseguir', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = pig(w, 330); const f = fighter(w, 150);
    let sawCharge = false, sawTired = false, maxV = 0;
    tick(w, 300, 1 / 60, () => { f.x = 150; f.y = 178; if (z.anim === 'charge') sawCharge = true; if (z.state === 'tired') { sawTired = true; maxV = Math.max(maxV, z.vulnT); } });
    expect(sawCharge).toBe(true);
    expect(sawTired).toBe(true);
    expect(maxV).toBeCloseTo(QX.vulnT, 1);
    expect(f.hp).toBeLessThan(5000);
  });

  it('estouro: golpe forte numa queixada faz as vizinhas darem meia-volta e recuarem 1 s', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const hit = pig(w, 200), n1 = pig(w, 230, 182), n2 = pig(w, 180, 172), far = pig(w, 340);
    const f = fighter(w, 170);
    damageZ(w, hit, 300, 3, f); // pesado
    expect(n1.state).toBe('flee'); expect(n2.state).toBe('flee'); expect(far.state).toBe('chase');
    expect(n1.face).toBe(1); // fugindo pra longe do lutador
    const x0 = n1.x;
    tick(w, 30, 1 / 60, () => { f.x = 170; f.y = 178; });
    expect(n1.x).toBeGreaterThan(x0);
    tick(w, 50, 1 / 60, () => { f.x = 170; f.y = 178; });
    expect(n1.state).not.toBe('flee');
    // golpe fraco não espanta
    const w2 = world(); const a = pig(w2, 200), b = pig(w2, 230); const g = fighter(w2, 170);
    damageZ(w2, a, 20, 1, g); expect(b.state).toBe('chase');
    expect(stampede(w2, a, g)).toEqual([b]);
  });

  it('estalo: dano em r 40; só enluarado/plenilunar atordoam', () => {
    const w = world(); const z = pig(w, 200); const a = fighter(w, 180), out = fighter(w, 260);
    snapHit(w, z);
    expect(a.hp).toBeLessThan(5000); expect(out.hp).toBe(5000); expect(a.state).not.toBe('stun');
    const w2 = world(); const e = pig(w2, 200, 178, 'enluarado'); const b = fighter(w2, 180);
    snapHit(w2, e);
    expect(b.state).toBe('stun'); expect(b.stunT).toBeCloseTo(QX.snapStun, 5);
  });

  it('prioriza o lutador isolado; sozinha mantém distância em vez de encostar', () => {
    const w = world(); const z = pig(w, 200);
    const a = fighter(w, 150, 178), b = fighter(w, 140, 180), lone = fighter(w, 260, 178);
    expect(isolatedTarget(w, z)).toBe(lone);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w2 = world(); const s = pig(w2, 300); const f = fighter(w2, 150);
    (s._mv ??= { mcd: { charge: 99, snap: 99 }, mhist: [] });
    let minD = 1e9;
    tick(w2, 240, 1 / 60, () => { f.x = 150; f.y = 178; minD = Math.min(minD, Math.abs(s.x - f.x)); });
    expect(minD).toBeGreaterThan(60);
    void a; void b;
  });
});
