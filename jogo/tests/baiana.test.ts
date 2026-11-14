// Zumbi Baiana do Acarajé (Pelourinho): tabuleiro de frente (-25%), panela de dendê com aviso e poça que queima
// (máx. 3), reabastecimento aberto (+20%), poça pequena se morrer antes de arremessar.
// Mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES: o orquestrador registra depois).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { ZCtx } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { updateProj } from '../src/expedition/director';
import { ARM } from '../src/expedition/fighter';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import {
  baiana, baianaGuard, addPool, poolsOf, splashTargets, tickDende, MAX_POOLS, POOL_R, REFILL_MUL, REFILL_T, TRAY_MUL, SPLASH_MUL, poolLife, poolR,
} from '../src/expedition/ai/baiana';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), attack: anim(8, { hit: 3, reach: 36 }), bash: anim(8, { hit: 3, reach: 40 }),
    splash: anim(9, { throwAt: 5, reach: 110 }), refill: anim(8), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(6), death: anim(8),
    tumble: anim(4), grabbed: anim(4), xDende: anim(4, { prop: true }),
  },
};
const K: any = { id: 'baiana', nome: 'Zumbi Baiana do Acarajé', ai: 'baiana', art: 'BAIANA', hp: 100, dmg: 12, xp: 8, ax: 92, G: 154, top: 124, w: 22, F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pelourinho', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { baiana: K };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function bai(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'baiana', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
/** um passo da IA (mesmo contrato do updateZombie, sem o REGISTRY) */
function upd(w: World, z: Zombie, V: Fighter, dt: number): void {
  if (z.dead) return;
  const dx = V.x - z.x, dy = V.y - z.y;
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy,
    step: (wf) => stepAnim(z, z.K.F.ANIMS[z.anim], dt, wf ? (_e, fi) => baiana.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; z.face = (Math.sign(dx) || z.face) as 1 | -1; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  baiana.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); upd(w, z, V, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Baiana do Acarajé', () => {
  it('arte própria, com o kit da ficha e sem elementos religiosos', () => {
    expect(GUARDS['baiana' as keyof typeof GUARDS]).toBe(baianaGuard);
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/baiana.js'), 'utf8');
    expect(src).toMatch(/const BAIANA=\(function\(\)/);
    expect(src).not.toMatch(/STUB|stub: arte/);
    expect(src).not.toMatch(/orix|candombl|terreiro|iemanj|ians[aã]|oxum|xang[oô]|guia de/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'bash', 'splash', 'refill', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xDende']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/throwAt:5/);
  });

  it('IA-44 tabuleiro: de frente -25%, por trás dano pleno; reabastecendo +20% sem tabuleiro', () => {
    const w = world(); const z = bai(w); z.anim = 'walk'; // olha pra esquerda
    const frente = fighter(w, 170), costas = fighter(w, 230);
    damageZ(w, z, 40, 1, frente); expect(1000 - z.hp).toBe(Math.round(40 * TRAY_MUL));
    const h1 = z.hp; damageZ(w, z, 40, 1, costas); expect(h1 - z.hp).toBe(40);
    z.state = 'attack'; z.anim = 'attack'; // conchada: tabuleiro não está erguido
    const h2 = z.hp; damageZ(w, z, 40, 1, frente); expect(h2 - z.hp).toBe(40);
    z.state = 'refill'; z.anim = 'refill'; z.refillT = 0.5;
    const h3 = z.hp; damageZ(w, z, 40, 1, frente); expect(h3 - z.hp).toBe(Math.round(40 * REFILL_MUL));
  });

  it('IA-43 panela: círculo no alvo, arco, 0,5x no impacto e poça que queima; depois reabastece ~1 s (IA-45)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    const w = world(); const z = bai(w, 200); const f = fighter(w, 120); // 80 px: zona da panela
    let warned = false, landed = -1, sawRefill = false, refillT0 = -1;
    run(w, z, f, 240, 1 / 60, () => {
      f.x = 120; f.y = 178;
      if (z.anim === 'splash' && w.warns.some((t) => t.kind === 'circle' && t.owner === z && Math.abs(t.x! - 120) < 1 && t.r === POOL_R)) warned = true;
      if (landed < 0 && w.pools.length) landed = 5000 - f.hp;
      if (z.state === 'refill') { if (!sawRefill) refillT0 = w.clock; sawRefill = true; }
    });
    expect(warned).toBe(true);
    expect(landed).toBeCloseTo(12 * SPLASH_MUL * ARM(f), 5);
    const P = poolsOf(w, z);
    expect(P.length).toBe(1);
    expect(P[0].x).toBeCloseTo(120, 0);
    expect(P[0].r).toBe(POOL_R);
    expect(P[0].life).toBe(5);
    expect(sawRefill).toBe(true);
    expect(refillT0).toBeGreaterThan(0);
    expect(w.actors!.length).toBe(0); // o dendê voador saiu do palco
  });

  it('reabastecimento dura ~1 s, sem atacar, e volta a perseguir', () => {
    const w = world(); const z = bai(w, 200); const f = fighter(w, 180); // colado: atacaria se pudesse
    z.state = 'refill'; z.anim = 'refill'; z.refillT = REFILL_T;
    const h0 = f.hp;
    let t = 0; while (z.state === 'refill' && t < 3) { run(w, z, f, 1); t += 1 / 60; }
    expect(t).toBeGreaterThan(REFILL_T - 0.05);
    expect(t).toBeLessThan(REFILL_T + 0.1);
    expect(f.hp).toBe(h0);
    expect(z.state).not.toBe('refill');
  });

  it('poça: dura 5 s no motor (6 s enluarado), queima 0,2x a cada 0,5 s, no máximo 3 por baiana', () => {
    const w = world(); const z = bai(w, 200); const f = fighter(w, 120);
    const p = addPool(w, z, 120, 178);
    const h0 = f.hp; let burns = 0; w.fx = ((k: string, t: string) => { if (k === 'hurt' && t !== 'lento' && !t.startsWith('-')) burns++; }) as any;
    let alive = 0; for (let i = 0; i < 400 && w.pools.includes(p as any); i++) { updateProj(w, 1 / 60); alive += 1 / 60; f.x = 120; f.y = 178; }
    expect(alive).toBeGreaterThan(4.9); expect(alive).toBeLessThan(5.1);
    expect(burns).toBeGreaterThanOrEqual(9); // ~10 queimaduras em 5 s
    expect((h0 - f.hp) / burns).toBeCloseTo(12 * 0.2 * ARM(f), 5);
    // máximo de 3 ativas
    for (let i = 0; i < 5; i++) addPool(w, z, 100 + i * 30, 178);
    expect(poolsOf(w, z).length).toBe(MAX_POOLS);
    // outras formas
    const zl = bai(w, 200, 178, 'enluarado'), zp = bai(w, 200, 178, 'plenilunar');
    expect(poolLife(zl)).toBe(6);
    expect(poolR(zp)).toBeCloseTo(POOL_R * 1.25);
    expect(splashTargets(w, zp, f).length).toBe(2);
    expect(splashTargets(w, z, f).length).toBe(1);
  });

  it('morta ANTES de arremessar: a poça nasce pequena no próprio chão; poças ficam depois da morte', () => {
    const w = world(); const z = bai(w, 200); const f = fighter(w, 120);
    addPool(w, z, 100, 178);
    z.hp = 20; z.state = 'attack'; z.anim = 'splash'; z.fi = 2; z._splashT = [{ x: 120, y: 178 }];
    damageZ(w, z, 40, 1, fighter(w, 230)); // por trás, fatal
    expect(z.dead).toBe(true);
    const P = poolsOf(w, z);
    expect(P.length).toBe(2);
    const small = P.find((p) => p.r < POOL_R)!;
    expect(small).toBeTruthy();
    expect(Math.abs(small.x - z.x)).toBeLessThan(10);
    expect(f.hp).toBe(5000);
  });

  it('dendê já no ar cai mesmo se ela morrer', () => {
    const w = world(); const z = bai(w, 200); const f = fighter(w, 130);
    z.state = 'attack'; z.anim = 'splash'; z.fi = 5; z._splashT = [{ x: 130, y: 178 }];
    baiana.onFrame!({ w, z, V: f, dt: 0, dx: -70, adx: 70, dy: 0, step() {}, chase() {} } as any, 5);
    expect(w.actors!.length).toBe(1);
    tickDende(w, z, 0.05);
    z.hp = 5; z.fi = 6;
    damageZ(w, z, 40, 1, f);
    expect(w.actors!.length).toBe(0);
    expect(poolsOf(w, z).length).toBe(1);
    expect(f.hp).toBeLessThan(5000);
  });

  it('de perto, com a panela recarregando: conchada ou tabuleirada (empurra)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    const w = world(); const z = bai(w, 200); const f = fighter(w, 176);
    (z as any)._mv = { mcd: { splash: 99 }, mhist: [] };
    const seen = new Set<string>();
    run(w, z, f, 600, 1 / 60, () => { f.y = 178; if (z.state === 'attack') seen.add(z.anim); });
    expect(seen.has('splash')).toBe(false);
    expect([...seen].some((a) => a === 'attack' || a === 'bash')).toBe(true);
    expect(f.hp).toBeLessThan(5000);
  });
});
