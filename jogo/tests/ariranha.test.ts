// Ariranha Zumbi: mordidas em rajada (3; 4 no plenilunar, sangramento no 3º acerto), arrancada que derruba,
// guincho (reforços, máximo 4, interrompível, cancelado se a chamadora morre, vulnerável +30%), mergulho só em
// água (imune, marcador 0,6 s antes, emerge atrás do alvo) e fuga quando sozinha e ferida.
// Mundo mínimo; IA chamada direto (não depende de ZOMBIES nem do REGISTRY).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { damageZ } from '../src/expedition/combat';
import { ARM } from '../src/expedition/fighter';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import {
  ariranha, bite, dashHit, doCall, tickCalls, isUnder, isWater, behindOf, CALL_MAX, CALL_CD, VULN_MUL, BLEED_T, DIVE_T, DIVE_WARN,
} from '../src/expedition/ai/ariranha';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(9, { warn: [0, 2], hit: [3, 5, 7], reach: 30 }),
    dash: anim(8, { warn: [0, 2], run: [3, 6], reach: 120 }), call: anim(8, { warn: [0, 3], call: 4 }),
    dive: anim(6), emerge: anim(7, { hit: 3, reach: 34 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(8), tumble: anim(4), grabbed: anim(4),
  },
};
const K: any = { nome: 'Ariranha Zumbi', art: 'ARIRANHA', ax: 100, G: 132, top: 64, w: 30, hp: 65, dmg: 9, ai: 'ariranha', F };

function world(area = 'corixo'): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'marco_zero', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', ai: 0,
    arenas: [{ cam: 0, area: { id: area }, k: 0, list: [] }],
    fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], rings: [], props: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} }, zk: { ariranha: K },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178, face: 1 | -1 = 1): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function ari(w: World, x = 200, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'ariranha', K, form, x, y: 178, z: 0, face: -1, hp: K.hp, maxhp: K.hp, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0, _callReady: 1e9, _diveReady: 1e9 };
  w.zs.push(z); return z;
}

/** um passo da IA (cópia mínima do updateZombie: hurt cuidado aqui) */
function step(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  if (z.dead) return;
  if (z.state === 'hurt') { stepAnim(z, F.ANIMS[z.anim], dt); if (z.done) { z.state = 'chase'; z.anim = 'walk'; z.fi = 0; z.done = false; } return; }
  z.cd = Math.max(0, z.cd - dt);
  const c: ZCtx = {
    w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e, fi) => ariranha.onFrame!(c, fi) : undefined),
    chase: (spd) => { z.x += Math.sign(V.x - z.x) * spd * dt; c.step(); },
  };
  ariranha.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += 1 / 60; each?.(); step(w, z, V); } };

afterEach(() => vi.restoreAllMocks());

describe('Ariranha Zumbi', () => {
  it('arte própria com as animações e eventos da ficha', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/ariranha.js'), 'utf8');
    expect(src).toMatch(/const ARIRANHA=\(function/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'dash', 'call', 'dive', 'emerge', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'tumble', 'grabbed']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/attack:\{[^\n]*n:9,warn:\[0,2\],hit:\[3,5,7\],reach:30/);
    expect(src).toMatch(/dash:\{[^\n]*n:8,warn:\[0,2\],run:\[3,6\]/);
    expect(src).toMatch(/call:\{[^\n]*n:8,warn:\[0,3\],call:4/);
  });

  it('mordidas: 3 acertos somam ≈1× o dano; o 3º faz sangrar 2 s', () => {
    const w = world(); const z = ari(w, 200); const V = fighter(w, 180);
    for (let k = 0; k < 3; k++) expect(bite(w, z, V, k)).toBe(true);
    expect(5000 - V.hp).toBeCloseTo(9 * ARM(V), 1); // 1,0× o dano base (antes da armadura)
    expect(V._bleed?.t).toBe(BLEED_T);
  });

  it('plenilunar morde 4 vezes na animação (quadros 3,5,7,8)', () => {
    const w = world(); const z = ari(w, 200, 'plenilunar'); const V = fighter(w, 178);
    z.state = 'chase'; (z as any)._mv = { mcd: { dash: 99 }, mhist: [] };
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    let bites = 0; const hp = () => V.hp; let last = hp();
    run(w, z, V, 120, () => { if (hp() < last) bites++; last = hp(); });
    expect(z.anim === 'attack' || bites > 0).toBe(true);
    expect(bites).toBeGreaterThanOrEqual(4);
  });

  it('arrancada derruba quem está na frente, uma vez por lutador', () => {
    const w = world(); const z = ari(w, 200); z.face = -1; const V = fighter(w, 186);
    expect(dashHit(w, z)).toHaveLength(1);
    expect(['kd', 'stun']).toContain(V.state);
    expect(dashHit(w, z)).toHaveLength(0);
  });

  it('guincho: comum chama 1, enluarado 2; nunca passa de 4 vivas', () => {
    const w = world(); const z = ari(w, 200); fighter(w, 100);
    expect(doCall(w, z)).toBe(1);
    w.clock = 3.1; tickCalls(w, z);
    expect(w.zs.filter((o) => (o.kind as string) === 'ariranha')).toHaveLength(2);
    const ze = ari(w, 220, 'enluarado');
    expect(doCall(w, ze)).toBe(1); // 3 vivas → só cabe mais 1
    w.clock = 7; tickCalls(w, ze);
    expect(w.zs.filter((o) => (o.kind as string) === 'ariranha' && !o.dead)).toHaveLength(CALL_MAX);
    const w2 = world(); const z2 = ari(w2, 200, 'enluarado');
    expect(doCall(w2, z2)).toBe(2);
  });

  it('matar a chamadora antes de o reforço chegar cancela', () => {
    const w = world(); const z = ari(w, 200, 'enluarado'); fighter(w, 100);
    doCall(w, z); w.clock = 1.6; tickCalls(w, z);
    expect(w.zs).toHaveLength(2); // o 1º chegou
    z.dead = true; w.clock = 5; tickCalls(w, z);
    expect(w.zs).toHaveLength(2); // o 2º não vem
  });

  it('guincho: dano ≥ 15% no aviso interrompe; depois do guincho leva +30% por 0,8 s', () => {
    const w = world(); const z = ari(w, 200); const V = fighter(w, 120);
    z._callReady = 0; step(w, z, V);
    expect(z.anim).toBe('call');
    damageZ(w, z, 11, 1, V); // 17% de 65
    expect(z.state).toBe('hurt');
    expect(z._calls ?? []).toHaveLength(0);
    const z2 = ari(w, 260); z2.hp = z2.maxhp = 1000;
    doCall(w, z2);
    const hp0 = z2.hp; damageZ(w, z2, 10, 1, V);
    expect(hp0 - z2.hp).toBe(Math.round(10 * VULN_MUL));
    w.clock += 0.9; const hp1 = z2.hp; damageZ(w, z2, 10, 1, V);
    expect(hp1 - z2.hp).toBe(10);
    expect(CALL_CD).toBe(14);
  });

  it('mergulho só em área de água; submersa é imune e emerge atrás do alvo (bolhas 0,6 s antes)', () => {
    const wd = world('salina'); const zd = ari(wd, 200); zd._diveReady = 0; const Vd = fighter(wd, 100);
    step(wd, zd, Vd); expect(zd.anim).not.toBe('dive');
    expect(isWater(world('corixo'))).toBe(true);

    const w = world('corixo'); const z = ari(w, 300); z._diveReady = 0; const V = fighter(w, 150, 178, 1);
    step(w, z, V); expect(z.anim).toBe('dive');
    let marked = -1, t = 0;
    for (let i = 0; i < 400 && z.anim !== 'emerge'; i++) {
      w.clock += 1 / 60; step(w, z, V);
      if (z.state === 'under') { t += 1 / 60; expect(isUnder(z)).toBe(true); const h = z.hp; damageZ(w, z, 50, 3, V); expect(z.hp).toBe(h); }
      if (marked < 0 && w.warns.some((k: any) => k.owner === z && k.kind === 'circle')) marked = t;
    }
    expect(z.anim).toBe('emerge');
    expect(marked).toBeGreaterThan(DIVE_T - DIVE_WARN - 0.05);
    expect(marked).toBeLessThan(DIVE_T - DIVE_WARN + 0.05);
    expect(z.x).toBeCloseTo(behindOf(w, V).x, 0);
    expect(z.x).toBeLessThan(V.x); // atrás (o alvo olha pra direita)
    const hp0 = V.hp; run(w, z, V, 40);
    expect(V.hp).toBeLessThan(hp0);
  });

  it('sozinha e ferida foge do alvo; em grupo não', () => {
    const w = world('salina'); const z = ari(w, 200); z.hp = 20; const V = fighter(w, 160);
    const x0 = z.x; run(w, z, V, 30);
    expect(z.x).toBeGreaterThan(x0);
    const w2 = world('salina'); const z2 = ari(w2, 200); z2.hp = 20; ari(w2, 330); const V2 = fighter(w2, 120);
    const x1 = z2.x; run(w2, z2, V2, 30);
    expect(z2.x).toBeLessThan(x1);
  });
});
