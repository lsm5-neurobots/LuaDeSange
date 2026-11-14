// Zumbi Garimpeiro: picaretada, lama de mercúrio (veneno + poça que ofusca), cava e surge (invulnerável, círculo de
// saída, derruba; plenilunar com 2 saídas), fraqueza ABERTO ×1,5, crosta de lama −10% até 2 acertos de calor.
// Mundo mínimo; IA chamada direto (não depende de ZOMBIES nem do REGISTRY).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import {
  garimpeiro, garimpeiroGuard, isUnder, canDig, isolatedTarget, mudTarget, throwMud, tickMud, mercPools, tickStatus, eruptAt,
  MOVES, OPEN_T, OPEN_MUL, CRUST_MUL, MUD_MUL, POISON_T, DIG_R, UNDER_T, WARN_T,
} from '../src/expedition/ai/garimpeiro';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(10, { hit: 5, reach: 40 }), shove: anim(7, { hit: 3, reach: 38 }),
    throw: anim(9, { throwAt: 4, reach: 130 }), dig: anim(10, { sink: 6 }), under: anim(4), emerge: anim(8, { hit: 1 }), open: anim(8),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8), tumble: anim(4), grabbed: anim(4),
    xMud: anim(4, { prop: true }), xMound: anim(4, { prop: true }),
  },
};
const K: any = { nome: 'Zumbi Garimpeiro', art: 'GARIMPEIRO', ax: 84, G: 154, top: 121, w: 20, hp: 135, dmg: 17, ai: 'garimpeiro', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], rings: [], props: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178, extra: any = {}): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length, ...extra };
  w.fs.push(f); return f;
}
function gar(w: World, x = 200, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'garimpeiro', K, form, x, y: 178, z: 0, face: -1, hp: K.hp, maxhp: K.hp, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const ctx = (w: World, z: Zombie, V: Fighter, dt = 1 / 60): ZCtx => {
  const c: ZCtx = {
    w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e, fi) => garimpeiro.onFrame!(c, fi) : undefined),
    chase: (spd) => { z.x += Math.sign(V.x - z.x) * spd * dt; c.step(); },
  };
  return c;
};
function step(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  if (z.dead) return;
  if (z.state === 'hurt') { stepAnim(z, F.ANIMS[z.anim], dt); if (z.done) { z.state = 'chase'; z.anim = 'walk'; z.fi = 0; z.done = false; } return; }
  z.cd = Math.max(0, z.cd - dt);
  garimpeiro.update(ctx(w, z, V, dt));
}
const run = (w: World, z: Zombie, V: Fighter, n: number, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += 1 / 60; each?.(); step(w, z, V); } };
/** força um golpe (sem sorteio) */
function force(w: World, z: Zombie, V: Fighter, anim: string): void {
  vi.spyOn(Math, 'random').mockReturnValue(0);
  const only = MOVES.filter((m) => m.anim === anim);
  const keep = MOVES.slice(); MOVES.length = 0; MOVES.push(...only);
  try { step(w, z, V); } finally { MOVES.length = 0; MOVES.push(...keep); }
}

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Garimpeiro', () => {
  it('arte própria com as animações e eventos da ficha', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/garimpeiro.js'), 'utf8');
    expect(src).toMatch(/const GARIMPEIRO=\(function/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'throw', 'dig', 'under', 'emerge', 'open', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xMud', 'xMound']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/attack:\{[^\n]*n:10,hit:5,reach:40/);
    expect(src).toMatch(/throw:\{[^\n]*n:9,throwAt:4/);
    expect(src).toMatch(/dig:\{[^\n]*n:10,sink:6/);
    expect(src).toMatch(/emerge:\{[^\n]*n:8,hit:1/);
    // nada de "*/" perdido dentro de comentário de bloco: cada /* fecha uma vez só
    expect(src.split('/*').length).toBe(src.split('*/').length);
  });

  it('picaretada: 1,2× do dano no quadro 5, empurra 14 px', () => {
    const w = world(); const z = gar(w, 200); const V = fighter(w, 170);
    force(w, z, V, 'attack');
    expect(z.anim).toBe('attack');
    const hp0 = V.hp; run(w, z, V, 40);
    expect(hp0 - V.hp).toBeGreaterThan(17 * 1.2 * 0.5); // ARM do lutador reduz um pouco
    expect(V.x).toBeLessThan(170);
  });

  it('lama de mercúrio: 60–130 px, círculo no alvo, 0,3× + VENENO 3 s e poça de 5 s que ofusca', () => {
    const w = world(); const z = gar(w, 250); const V = fighter(w, 150);
    expect(mudTarget(z, { x: 230, y: 178 }).x).toBe(250 - 60); // perto demais: no mínimo 60 px
    expect(mudTarget(z, { x: 0, y: 178 }).x).toBe(250 - 130);
    force(w, z, V, 'throw');
    expect(z.anim).toBe('throw');
    expect(w.warns.some((t) => t.kind === 'circle' && t.x === 150 && t.r === 30)).toBe(true);
    const hp0 = V.hp;
    run(w, z, V, 120);
    expect(mercPools(w)).toHaveLength(1);
    expect(V.venenoUntil).toBeGreaterThan(0);
    expect(V.venenoUntil - 0.6).toBeLessThanOrEqual(w.clock + POISON_T);
    expect(hp0 - V.hp).toBeGreaterThan(17 * MUD_MUL * 0.5);
    const p = mercPools(w)[0];
    expect(3.2 - p.t).toBeGreaterThan(3); // vida de 5 s (sobra > 3 s depois de ~1,5 s)
    // quem pisa na poça fica ofuscado
    expect(V.blindUntil).toBeGreaterThan(w.clock);
  });

  it('veneno tica a cada 0,5 s e acaba em 3 s', () => {
    const w = world(); const z = gar(w, 250); const V = fighter(w, 80);
    V.venenoUntil = 3; V.venenoDmg = 2; V.venenoAcc = 0;
    let ticks = 0; const hurt = V.hp;
    for (let i = 0; i < 240; i++) { w.clock += 1 / 60; const h = V.hp; tickStatus(w, 1 / 60); if (V.hp < h) ticks++; }
    expect(ticks).toBe(6);
    expect(hurt - V.hp).toBeGreaterThan(0);
    void z;
  });

  it('morto com a lama no ar: ela cai e vira poça', () => {
    const w = world(); const z = gar(w, 250); fighter(w, 150);
    z._mudT = { x: 150, y: 178 }; throwMud(w, z);
    expect(w.actors!.length).toBe(1);
    z.hp = 3; damageZ(w, z, 50, 1, null);
    expect(z.dead).toBe(true);
    expect(mercPools(w)).toHaveLength(1);
    expect(w.actors!.length).toBe(0);
    tickMud(w, z, 1);
  });

  it('cava só com o squad agrupado ou o alvo longe', () => {
    const w = world(); const z = gar(w, 250); const V = fighter(w, 170);
    expect(canDig(w, z, V)).toBe(false); // 80 px, sozinho
    fighter(w, 150);
    expect(canDig(w, z, V)).toBe(true); // agrupados
    const w2 = world(); const z2 = gar(w2, 250); const far = fighter(w2, 100);
    expect(canDig(w2, z2, far)).toBe(true); // 150 px
  });

  it('cava e surge: invulnerável na terra, círculo nos últimos 0,7 s, derruba quem ficou e fica ABERTO', () => {
    const w = world(); const z = gar(w, 260); const V = fighter(w, 120);
    force(w, z, V, 'dig');
    expect(z.anim).toBe('dig');
    let sawUnder = false, warnAt = -1, invuln = false;
    for (let i = 0; i < 400 && z.state !== 'open'; i++) {
      w.clock += 1 / 60; step(w, z, V);
      if (isUnder(z)) {
        sawUnder = true;
        const hp = z.hp; damageZ(w, z, 40, 1, V); if (z.hp === hp) invuln = true;
      }
      if (warnAt < 0 && w.warns.some((t) => t.owner === z && t.kind === 'circle')) warnAt = z.ut;
    }
    expect(sawUnder).toBe(true);
    expect(invuln).toBe(true);
    expect(warnAt).toBeCloseTo(UNDER_T - WARN_T, 1);
    expect(z.state).toBe('open');
    expect(Math.abs(z.x - 120)).toBeLessThan(2);
    expect(V.state === 'kd' || V.state === 'stun').toBe(true);
    expect(V.hp).toBeLessThan(5000);
    // fraqueza: ×1,5 (com a crosta, ×0,9)
    expect(garimpeiroGuard(w, z, 100, 1, V)).toBeCloseTo(100 * OPEN_MUL * CRUST_MUL);
    run(w, z, V, Math.ceil(OPEN_T * 60) + 2);
    expect(z.state).not.toBe('open');
    expect(z.openT).toBe(0);
  });

  it('sair do círculo anula o estouro', () => {
    const w = world(); const z = gar(w, 260); const V = fighter(w, 120);
    force(w, z, V, 'dig');
    let moved = false;
    for (let i = 0; i < 400 && z.state !== 'open'; i++) {
      w.clock += 1 / 60; step(w, z, V);
      if (!moved && z._exits) { V.x -= DIG_R + 10; moved = true; }
    }
    expect(moved).toBe(true);
    expect(V.hp).toBe(5000);
    expect(V.state).toBe('idle');
  });

  it('plenilunar: 2 saídas (a segunda estoura no outro lutador)', () => {
    const w = world(); const z = gar(w, 300, 'plenilunar'); const V = fighter(w, 160); const O = fighter(w, 200, 196);
    force(w, z, V, 'dig');
    let exits = 0;
    for (let i = 0; i < 400 && z.state !== 'open'; i++) { w.clock += 1 / 60; step(w, z, V); if (z._exits) exits = z._exits.length; }
    expect(exits).toBe(2);
    expect(V.hp).toBeLessThan(5000);
    expect(O.hp).toBeLessThan(5000);
  });

  it('crosta de lama: −10% até 2 acertos de fogo/ácido (laser conta)', () => {
    const w = world(); const z = gar(w); const melee = fighter(w, 180); const laser = fighter(w, 100, 178, { w: { tipo: 'beam' } });
    expect(garimpeiroGuard(w, z, 100, 1, melee)).toBeCloseTo(90);
    expect(garimpeiroGuard(w, z, 100, 1, melee)).toBeCloseTo(90); // corpo a corpo não derrete
    expect(garimpeiroGuard(w, z, 100, 1, laser)).toBeCloseTo(90);
    expect(garimpeiroGuard(w, z, 100, 1, laser)).toBeCloseTo(90);
    expect(garimpeiroGuard(w, z, 100, 1, melee)).toBe(100); // derreteu
  });

  it('prefere o lutador mais afastado dos aliados', () => {
    const w = world(); const z = gar(w, 200);
    fighter(w, 170); fighter(w, 160, 184); const lone = fighter(w, 60);
    expect(isolatedTarget(w, z)).toBe(lone);
  });

  it('estouro acerta só dentro do raio', () => {
    const w = world(); const z = gar(w); const a = fighter(w, 100); const b = fighter(w, 100 + DIG_R + 4);
    const hit = eruptAt(w, z, { x: 100, y: 178 });
    expect(hit).toEqual([a]);
    expect(b.hp).toBe(5000);
  });
});
