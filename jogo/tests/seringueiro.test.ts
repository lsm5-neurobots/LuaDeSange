// Zumbi Seringueiro (Amazônia): jato de látex (PRESO + poça LENTO), sem balde → refill aberto (×1,5), grude (×1,25),
// fogo na poça, costas ignoram a postura, visão da lamparina — mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES).
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import {
  seringueiro, seringueiroGuard, addPool, igniteAt, tickLatex, poolsOf, splat, jetR, jetSpots, sightR,
  JET_DMG, PRESO_T, POOL_SLOW, NOBUCKET_T, OPEN_MUL, GRUDE_MUL, FIRE_MUL, JET_CD,
} from '../src/expedition/ai/seringueiro';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(9, { hit: [3, 6], reach: 36 }), throw: anim(10, { throwAt: 5, reach: 150 }),
    bucket: anim(7, { hit: 3, reach: 30 }), refill: anim(8, { dur: () => 150 }), hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8),
    tumble: anim(4), grabbed: anim(4), xBlob: anim(3, { prop: true }), xPool: anim(6, { prop: true }),
  },
};
const K: any = { id: 'seringueiro', nome: 'Zumbi Seringueiro', ai: 'seringueiro', art: 'SERINGUEIRO', hp: 110, dmg: 16, xp: 10, ax: 80, G: 150, top: 122, w: 16, F };

function world(mode = 'noite'): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { dano: 1 } }, mode, cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 1 }, x, y, z: 0, face: -1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function ser(w: World, x = 200, y = 178, form = 'comum', state = 'chase'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'seringueiro', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state, anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
// laço mínimo do motor (o que updateZombie faz antes de chamar a IA), mirando sempre no 1º lutador
function tick(w: World, z: Zombie, n: number, dt = 1 / 60): void {
  for (let i = 0; i < n; i++) {
    w.clock += dt;
    if (z.dead) continue;
    if (z.state === 'hurt') { stepAnim(z, F.ANIMS[z.anim], dt); if (z.done) { z.state = 'chase'; z.anim = 'walk'; } continue; }
    const V = w.fs[0], dx = V.x - z.x, dy = V.y - z.y;
    const c: any = { w, z, dt, V, dx, adx: Math.abs(dx), dy };
    c.step = (wf?: boolean) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e: any, fi: number) => seringueiro.onFrame!(c, fi) : undefined);
    c.chase = (spd: number) => { z.x += Math.sign(dx) * spd * dt; c.step(); };
    z.cd = Math.max(0, z.cd - dt);
    seringueiro.update(c);
  }
}
const runUntil = (w: World, z: Zombie, pred: () => boolean, max = 600) => { for (let i = 0; i < max && !pred(); i++) tick(w, z, 1); };

describe('Zumbi Seringueiro', () => {
  it('arte própria com as animações e eventos da ficha; defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/seringueiro.js'), 'utf8');
    expect(src).toMatch(/const SERINGUEIRO=\(function\(\)\{/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'throw', 'bucket', 'refill', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xBlob', 'xPool']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/attack:\{[^\n]*n:9,hit:\[3,6\],reach:36/);
    expect(src).toMatch(/throw:\{[^\n]*n:10,throwAt:5/);
    expect(src).toMatch(/bucket:\{[^\n]*n:7,hit:3,reach:30/);
    expect((GUARDS as any).seringueiro).toBe(seringueiroGuard);
  });

  it('lamparina: vê o alvo a 300 px de noite/Lua e a 230 px de dia', () => {
    expect(sightR(world('lua'))).toBe(300);
    expect(sightR(world('manha'))).toBe(230);
    const w = world('noite'); fighter(w, 200 - 260); const z = ser(w, 200, 178, 'comum', 'wander');
    tick(w, z, 1); expect(z.state).toBe('alert');
    const d = world('manha'); fighter(d, 200 - 260); const z2 = ser(d, 200, 178, 'comum', 'wander');
    tick(d, z2, 1); expect(z2.state).toBe('wander');
  });

  it('jato de látex: círculo no alvo, 0,4× de dano + PRESO 1,5 s, poça que deixa LENTO 40%', () => {
    const w = world(); const f = fighter(w, 90); const z = ser(w, 200); z.jetCd = 0;
    tick(w, z, 1);
    expect(z.anim).toBe('throw');
    expect(w.warns.some((t: any) => t.kind === 'circle' && Math.abs(t.x - 90) < 1 && t.r === 28)).toBe(true);
    const hp0 = f.hp;
    runUntil(w, z, () => f.state === 'stun');
    expect(f.state).toBe('stun');
    expect(f.stunT).toBeCloseTo(PRESO_T, 1);
    expect(hp0 - f.hp).toBeCloseTo(16 * JET_DMG, 1);
    expect(poolsOf(w).length).toBe(1);
    expect(z.jetCd).toBeGreaterThan(JET_CD - 1.5);
    f.state = 'idle'; f.stunT = 0;
    tick(w, z, 2);
    expect(f.slowT).toBeGreaterThan(0);
    expect(f.slowK).toBe(POOL_SLOW);
    // a poça some em 4 s
    for (let i = 0; i < 260; i++) { w.clock += 1 / 60; tickLatex(w); }
    expect(poolsOf(w).length).toBe(0);
  });

  it('quem sai do círculo antes do látex cair não fica preso', () => {
    const w = world(); const f = fighter(w, 90); const z = ser(w, 200); z.jetCd = 0;
    tick(w, z, 1); expect(z.anim).toBe('throw');
    f.x = 20; // saiu do círculo
    runUntil(w, z, () => poolsOf(w).length > 0);
    expect(f.state).not.toBe('stun');
  });

  it('enluarado: 1,3× de área; plenilunar: 2 círculos', () => {
    const w = world(); const f = fighter(w, 90);
    expect(jetR(ser(w, 200, 178, 'enluarado')) ** 2).toBeCloseTo(28 * 28 * 1.3, 3);
    expect(jetSpots(w, ser(w, 200, 178, 'plenilunar'), f).length).toBe(2);
    expect(jetSpots(w, ser(w, 200, 178, 'comum'), f).length).toBe(1);
  });

  it('FRAQUEZA: depois do jato fica SEM BALDE 4 s (sem jato) e faz refill ABERTO com dano ×1,5', () => {
    const w = world(); const f = fighter(w, 90); const z = ser(w, 200); z.jetCd = 0;
    tick(w, z, 1);
    runUntil(w, z, () => z.needRefill === true);
    expect(z.noBucketT).toBeCloseTo(NOBUCKET_T, 1);
    z.jetCd = 0; f.state = 'idle'; f.stunT = 0;
    tick(w, z, 30);
    expect(z.anim).not.toBe('throw'); // sem balde: nada de jato
    runUntil(w, z, () => z.state === 'refill', 400);
    expect(z.state).toBe('refill');
    expect(z.openT).toBeGreaterThan(1);
    expect(seringueiroGuard(w, z, 100, 1, null)).toBeCloseTo(100 * OPEN_MUL);
    runUntil(w, z, () => z.state !== 'refill');
    expect(z.needRefill).toBe(false);
    expect(seringueiroGuard(w, z, 100, 1, null)).toBe(100);
  });

  it('grude: o próximo golpe contra quem ele prendeu leva ×1,25 (uma vez só)', () => {
    const hit = (grude: boolean) => {
      const w = world(); const f = fighter(w, 180); const z = ser(w, 200);
      if (grude) { f.grudeBy = z.uid; f.grudeUntil = 99; }
      z.state = 'attack'; z.anim = 'attack'; z.face = -1;
      const c: any = { w, z, dt: 1 / 60, V: f, dx: -20, adx: 20, dy: 0 };
      const hp0 = f.hp; seringueiro.onFrame!(c, 3);
      return { d: hp0 - f.hp, f };
    };
    const a = hit(false), b = hit(true);
    expect(b.d / a.d).toBeCloseTo(GRUDE_MUL, 3);
    expect(b.f.grudeUntil).toBeLessThan(0);
  });

  it('splat marca o alvo como grudado por esse seringueiro', () => {
    const w = world(); const f = fighter(w, 100); const z = ser(w, 200);
    expect(splat(w, z, 100, 178)).toContain(f);
    expect(f.grudeBy).toBe(z.uid);
  });

  it('fogo: poça em chamas dá ×1,5 e QUEIMANDO em zumbi em cima dela; laser e lamparina (morte) incendeiam', () => {
    const w = world(); fighter(w, 20); const z = ser(w, 200); const o = ser(w, 300);
    const p = addPool(w, z, 300, 178);
    expect(seringueiroGuard(w, o, 100, 1, null)).toBe(100);
    expect(igniteAt(w, 300, 178)).toBe(1);
    expect(p.fire).toBeGreaterThan(0);
    expect(seringueiroGuard(w, o, 100, 1, null)).toBeCloseTo(100 * FIRE_MUL);
    const hp0 = o.hp;
    for (let i = 0; i < 40; i++) { w.clock += 1 / 60; tickLatex(w); }
    expect(o.hp).toBeLessThan(hp0);
    expect(o.burnT).toBeGreaterThan(0);
    // laser acertando um seringueiro perto de poça
    const p2 = addPool(w, z, 200, 178);
    const laser: any = fighter(w, 150); laser.w = { tipo: 'beam' };
    seringueiroGuard(w, z, 10, 1, laser);
    expect(p2.fire).toBeGreaterThan(0);
    // morte: a lamparina cai
    const w2 = world(); fighter(w2, 20); const z2 = ser(w2, 120); const p3 = addPool(w2, z2, 130, 178);
    z2.hp = 5; damageZ(w2, z2, 50, 1, null);
    expect(z2.dead).toBe(true);
    expect(p3.fire).toBeGreaterThan(0);
  });

  it('bater nas costas ignora a postura: interrompe o golpe', () => {
    const w = world(); const f = fighter(w, 120); const z = ser(w, 200); z.face = -1;
    z.state = 'attack'; z.anim = 'attack';
    const costas: any = fighter(w, 240);
    seringueiroGuard(w, z, 10, 1, f);
    expect(z.state).toBe('attack'); // de frente não interrompe
    seringueiroGuard(w, z, 10, 1, costas);
    expect(z.state).toBe('hurt');
  });

  it('evita ficar em cima da própria poça', () => {
    const w = world(); fighter(w, 20, 178); const z = ser(w, 200, 178); z.jetCd = 5; z.needRefill = false;
    addPool(w, z, 200, 178);
    const x0 = z.x, y0 = z.y;
    tick(w, z, 30);
    expect(Math.hypot(z.x - x0, (z.y - y0) * 2)).toBeGreaterThan(5);
  });
});
