// O Maquinista do Bonde (chefe da Lapa): bonde sem freio na faixa avisada, recarga vulnerável, fúria com 2 bondes,
// faíscas da catenária, sino e vara do trole — mundo mínimo, sem arte (a factory só é usada pra desenhar).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { damageZ } from '../src/expedition/combat';
import { ZOMBIES } from '../src/data/zombies';
import { TRAM, BELL_R } from '../src/expedition/ai/maquinista';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8, { stomp: [0, 4] }), swing: anim(8, { hit: 4 }), pole: anim(10, { hit: 5 }), bell: anim(9, { hit: 4 }),
    spark: anim(10, { castAt: 3 }), bonde: anim(10, { callAt: 5 }), recharge: anim(8, { vuln: [0, 1, 2, 3, 4, 5, 6, 7] }),
    rage: anim(9), hurt: anim(4), intro: anim(12), death: anim(14), xBonde: anim(2, { prop: true }), xFaisca: anim(3, { prop: true }),
  },
};

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'lapa', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { maquinista: { ...ZOMBIES.maquinista, id: 'maquinista', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T', lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function boss(w: World, x = 300, y = 178): Zombie {
  const K = (w.zk as any).maquinista;
  const z: any = { uid: ++(w as any).uid, kind: 'maquinista', K, form: 'normal', x, y, z: 0, face: -1, hp: 6600, maxhp: 6600, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0,
    mcd: { bonde: 0, bell: 99, pole: 99, swing: 99, spark: 99 } };
  w.zs.push(z); w.boss = z; return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };
const lanes = (w: World) => w.warns.filter((t) => t.kind === 'lane' && !t.owner);

afterEach(() => vi.restoreAllMocks());

describe('Maquinista do Bonde', () => {
  it('está registrado com IA e arte próprias (nada do Ascensorista)', () => {
    expect(REGISTRY.maquinista).toBeTruthy();
    expect(REGISTRY.maquinista).not.toBe(REGISTRY.ascensorista);
    expect(ZOMBIES.maquinista.art).toBe('MAQUINISTA');
    expect(ZOMBIES.maquinista.boss).toBe('chefe');
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/maquinista.js'), 'utf8');
    expect(src).toMatch(/const MAQUINISTA=/);
    expect(src).not.toMatch(/ASCENSORISTA|lattice|xCabin|pantogr/);
    for (const a of ['intro', 'idle', 'walk', 'swing', 'pole', 'bell', 'spark', 'bonde', 'recharge', 'hurt', 'rage', 'death', 'xBonde', 'xFaisca']) expect(src).toContain(a + ':{');
  });

  it('bonde sem freio: faixa avisada na linha do alvo, atropela quem fica e poupa quem sai', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const a = fighter(w, 120, 180); const b = fighter(w, 20, 150); const z = boss(w);
    tick(w, 50); // anim do bonde até o quadro do chamado
    expect(z.mv).toBe('bonde');
    const L = lanes(w);
    expect(L.length).toBe(1);
    expect(L[0].y).toBe(a.y);
    const hpA = a.hp, hpB = b.hp;
    tick(w, 60 * 4, 1 / 60, () => { a.x = 120; if (a.state !== 'stun') a.y = Math.max(a.y, 180); });
    expect(a.hp).toBeLessThan(hpA);
    expect(hpA - a.hp).toBeGreaterThanOrEqual(ZOMBIES.maquinista.dmg * 1.2);
    expect(b.hp).toBe(hpB);
    expect(lanes(w).length).toBe(0); // o aviso some quando o bonde sai
  });

  it('depois do bonde recarrega a manivela: VULNERÁVEL (dano ×1,5), parado, e depois volta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); fighter(w, 40, 150); const z = boss(w);
    let sawVuln = false, x0 = 0;
    for (let i = 0; i < 60 * 6 && !sawVuln; i++) { tick(w, 1); if (z.vuln) { sawVuln = true; x0 = z.x; } }
    expect(sawVuln).toBe(true);
    expect(z.anim).toBe('recharge');
    const hp = z.hp; damageZ(w, z, 100, 1, null);
    expect(hp - z.hp).toBe(150);
    tick(w, 60);
    expect(z.x).toBe(x0);
    tick(w, 60 * 2);
    expect(z.vuln).toBeFalsy();
    expect(z.state).toBe('walk');
  });

  it('fúria: o bonde passa duas vezes, ida e volta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); fighter(w, 60, 160); const z = boss(w); (z as any).fury = true; z.form = 'furia';
    const seen = new Set<any>(), dirs = new Set<number>();
    for (let i = 0; i < 60 * 8; i++) { tick(w, 1); for (const t of (z as any).trams ?? []) { if (!t.cosmetic) { seen.add(t); dirs.add(t.dir); } } }
    expect(seen.size).toBe(2);
    expect(dirs.size).toBe(2);
  });

  it('faíscas da catenária: 3 pontos marcados (5 na fúria) que dão choque', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    for (const fury of [false, true]) {
      const w = world(); const f = fighter(w, 100, 170); const z = boss(w, 320);
      (z as any).mcd = { bonde: 99, bell: 99, pole: 99, swing: 99, spark: 0 }; if (fury) { (z as any).fury = true; }
      let maxC = 0; const hp = f.hp;
      for (let i = 0; i < 60 * 3; i++) { tick(w, 1, 1 / 60, () => { f.x = 100; }); maxC = Math.max(maxC, w.warns.filter((t) => t.kind === 'circle' && !t.owner).length); }
      expect(maxC).toBe(fury ? 5 : 3);
      expect(f.hp).toBeLessThan(hp);
    }
  });

  it('badalada do sino atordoa quem está em volta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const f = fighter(w, 250, 178); const far = fighter(w, 300 - BELL_R - 40, 150); const z = boss(w, 300);
    (z as any).mcd = { bonde: 99, bell: 0, pole: 99, swing: 99, spark: 99 };
    let stunned = false;
    for (let i = 0; i < 60 * 1.5; i++) { tick(w, 1, 1 / 60, () => { f.x = 250; f.y = 178; }); if (f.state === 'stun') stunned = true; }
    expect(z.mv).toBe('bell');
    expect(stunned).toBe(true);
    expect(far.hp).toBe(far.maxhp);
  });

  it('o bonde atravessa a tela inteira em menos de 2 s', () => {
    expect((384 + 2 * (TRAM.half + TRAM.margin)) / TRAM.speed).toBeLessThan(2);
  });
});
