// Zumbi Turista (Pelourinho): flash em cone que ofusca só quem olha pra ele, foge de quem cola, foto com janela de
// dano (+30%, quebra por trás), clarão atrai até 2 zumbis comuns. Mundo mínimo; sem ZOMBIES/REGISTRY (testa o módulo).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { stepAnim, setAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import { turista, TUR, doFlash, inCone, isBlind, blindMiss, lureZombies, turistaGuard } from '../src/expedition/ai/turista';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), flash: anim(8, { flashAt: 4, reach: 90 }), bag: anim(8, { hit: 4, reach: 30 }),
    flee: anim(8), snap: anim(7, { snapAt: 4 }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(7), tumble: anim(4), grabbed: anim(4),
  },
};
const K: any = { nome: 'Zumbi Turista', art: 'TURISTA', ax: 80, G: 150, top: 118, w: 14, hp: 55, dmg: 8, ai: 'turista', mapa: 'pelourinho', xp: 7, F };
const KE: any = { nome: 'Errante', ax: 80, G: 150, top: 110, w: 14, hp: 50, dmg: 8, ai: 'errante', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pelourinho', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178, face: 1 | -1 = 1): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function zomb(w: World, kind: string, x: number, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind, K: kind === 'turista' ? K : KE, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'keep', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
/** contexto mínimo (o mesmo que ai/index.ts monta), sem depender do REGISTRY */
function tick(w: World, z: Zombie, V: Fighter, n: number, dt = 1 / 60, each?: () => void) {
  for (let i = 0; i < n; i++) {
    w.clock += dt; each?.();
    const c: ZCtx = { w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
      step: (wf) => stepAnim(z, z.K.F.ANIMS[z.anim], dt, wf ? (_e, fi) => turista.onFrame!(c, fi) : undefined), chase: () => {} };
    if (z.state === 'hurt') { c.step(); if (z.done) { z.state = z.prev ?? 'keep'; setAnim(z, 'walk'); } continue; }
    z.cd = Math.max(0, z.cd - dt);
    turista.update(c);
  }
}

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Turista', () => {
  it('arte própria com todas as animações da ficha e defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/turista.js'), 'utf8');
    expect(src).toMatch(/const TURISTA=/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'flash', 'bag', 'flee', 'snap', 'hurt', 'hurtB', 'fall', 'getup', 'death']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/flashAt:4/); expect(src).toMatch(/snapAt:4/);
    expect((GUARDS as any).turista).toBe(turistaGuard);
  });

  it('flash ofusca só quem está no cone OLHANDO pra ele (1,0 s; 1,3 s enluarado)', () => {
    const w = world(); const z = zomb(w, 'turista', 200); // olha pra esquerda
    const olhando = fighter(w, 150, 178, 1), costas = fighter(w, 160, 178, -1), longe = fighter(w, 90, 178, 1), atras = fighter(w, 240, 178, -1), fora = fighter(w, 170, 200, 1);
    expect(inCone(z, olhando)).toBe(true);
    const hit = doFlash(w, z);
    expect(hit).toEqual([olhando]);
    for (const f of [costas, longe, atras, fora]) expect(isBlind(w, f)).toBe(false);
    w.clock += 0.95; expect(isBlind(w, olhando)).toBe(true);
    w.clock += 0.1; expect(isBlind(w, olhando)).toBe(false);
    const w2 = world(); const z2 = zomb(w2, 'turista', 200, 178, 'enluarado'); const f2 = fighter(w2, 150, 178, 1);
    doFlash(w2, z2); w2.clock += 1.25; expect(isBlind(w2, f2)).toBe(true);
  });

  it('ofuscado erra 50% dos golpes no Turista', () => {
    const w = world(); const z = zomb(w, 'turista', 200); const f = fighter(w, 150, 178, 1);
    doFlash(w, z);
    expect(blindMiss(w, f, 0.3)).toBe(true); expect(blindMiss(w, f, 0.7)).toBe(false);
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    damageZ(w, z, 20, 1, f); expect(z.hp).toBe(1000);
    vi.spyOn(Math, 'random').mockReturnValue(0.8);
    damageZ(w, z, 20, 1, f); expect(z.hp).toBe(980);
  });

  it('IA dispara o flash a média distância, com aviso no chão, e recarrega 6 s', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const w = world(); const z = zomb(w, 'turista', 200); const f = fighter(w, 130, 178, 1);
    let warned = false, blind = false;
    tick(w, z, f, 90, 1 / 60, () => { if (w.warns.some((t) => t.owner === z)) warned = true; if (isBlind(w, f)) blind = true; f.x = 130; });
    expect(warned).toBe(true);
    expect(z.flashN).toBe(1);
    expect(blind).toBe(true);
    tick(w, z, f, 180, 1 / 60, () => { f.x = 130; });
    expect(z.flashN).toBe(1); // ainda em recarga
  });

  it('plenilunar: flash duplo em sequência', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const w = world(); const z = zomb(w, 'turista', 200, 178, 'plenilunar'); const f = fighter(w, 130, 178, 1);
    tick(w, z, f, 100, 1 / 60, () => { f.x = 130; });
    expect(z.flashN).toBe(2);
  });

  it('colado: foge em 60% das vezes (sorteio baixo), senão dá mochilada', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    const w = world(); const z = zomb(w, 'turista', 200); const f = fighter(w, 180, 178, 1);
    (z as any)._mv = { mcd: { flash: 99 }, mhist: [] };
    tick(w, z, f, 1);
    expect(z.state).toBe('flee');
    const x0 = z.x; tick(w, z, f, 30);
    expect(z.x).toBeGreaterThan(x0 + 25); // foge pra longe (direita)
    vi.restoreAllMocks(); vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const w2 = world(); const z2 = zomb(w2, 'turista', 200); const f2 = fighter(w2, 180, 178, 1);
    (z2 as any)._mv = { mcd: { flash: 99 }, mhist: [] };
    tick(w2, z2, f2, 1);
    expect(z2.state).toBe('attack'); expect(z2.anim).toBe('bag');
    tick(w2, z2, f2, 40, 1 / 60, () => { f2.x = 180; });
    expect(f2.hp).toBeLessThan(5000);
  });

  it('a cada 9 s foge e volta fotografando; a foto leva +30% e por trás quebra a pose', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const w = world(); const z = zomb(w, 'turista', 200); const f = fighter(w, 100, 178, 1); // 100 px: fica na distância
    (z as any)._mv = { mcd: { flash: 999 }, mhist: [] };
    const seen = new Set<string>();
    tick(w, z, f, 60 * 11, 1 / 60, () => { seen.add(z.state); });
    expect(seen.has('flee')).toBe(true); expect(seen.has('snap')).toBe(true);
    // janela da foto
    const w2 = world(); const z2 = zomb(w2, 'turista', 200); z2.state = 'snap'; z2.anim = 'snap'; z2.face = -1;
    damageZ(w2, z2, 20, 1, fighter(w2, 170, 178, 1));
    expect(1000 - z2.hp).toBe(Math.round(20 * TUR.snapMul));
    expect(z2.state).toBe('snap');
    damageZ(w2, z2, 20, 1, fighter(w2, 230, 178, -1)); // por trás
    expect(z2.state).toBe('hurt');
  });

  it('clarão atrai no máximo 2 zumbis comuns a 140 px, por 2 s (chefe e longe não)', () => {
    const w = world(); const z = zomb(w, 'turista', 200);
    const a = zomb(w, 'errante', 230), b = zomb(w, 'corredor', 170), c = zomb(w, 'errante', 260), longe = zomb(w, 'errante', 380), chefe = zomb(w, 'errante', 205);
    chefe.boss = true; const bl = zomb(w, 'blindado', 210);
    const got = lureZombies(w, z, 160, 178);
    expect(got.length).toBe(2);
    expect(got).not.toContain(longe); expect(got).not.toContain(chefe); expect(got).not.toContain(bl);
    for (const o of got) { expect((o.tg as any).lure).toBe(true); expect(o.tg!.x).toBe(160); expect(o.tgT).toBe(TUR.lureT); }
    expect([a, b, c].filter((o) => (o.tg as any)?.lure).length).toBe(2);
  });
});
