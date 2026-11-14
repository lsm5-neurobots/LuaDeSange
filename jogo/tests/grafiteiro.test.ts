// Zumbi Grafiteiro (Lapa): nuvem de spray que cega só de frente e dentro do cone (com imunidade), glifo que atrai
// zumbis (não o squad) e é apagável, +50% de dano ajoelhado pintando, lata derrubada durante a nuvem.
// Mundo mínimo, sem REGISTRY/ZOMBIES: a IA é chamada direto com um ZCtx montado aqui.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import {
  GRAF, grafiteiro, grafiteiroGuard, spawnCloud, tickClouds, isBlind, blindMiss, spawnGlyph, tickGlyphs, cloudsOf, glyphsOf, strikeGlyphs, inCone,
} from '../src/expedition/ai/grafiteiro';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), cloud: anim(9, { sprayAt: 3, sprayEnd: 6, reach: 70 }), tag: anim(9, { crouch: [2, 6], glyphAt: 6 }),
    hit: anim(8, { hit: 4, reach: 30 }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(8), tumble: anim(4), grabbed: anim(4),
    xCloud: anim(4, { prop: true }), xGlyph: anim(4, { prop: true }), xCan: anim(2, { prop: true }),
  },
};
const K = { nome: 'Zumbi Grafiteiro', art: 'GRAFITEIRO', ax: 80, G: 150, top: 108, w: 16, hp: 75, dmg: 9, ai: 'grafiteiro', id: 'grafiteiro', F };
const KE = { nome: 'Errante', art: 'ERR', ax: 74, G: 142, top: 106, w: 18, hp: 80, dmg: 14, ai: 'errante', id: 'errante', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'lapa', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
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
function zomb(w: World, kind: 'grafiteiro' | 'errante', x: number, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind, K: kind === 'grafiteiro' ? K : KE, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
/** um passo da IA (como ai/index.ts faz, sem a parte comum) */
function run(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  const A = z.K.F.ANIMS, dx = V.x - z.x;
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy: V.y - z.y,
    step: (wf) => stepAnim(z, A[z.anim], dt, wf ? (_e, fi) => grafiteiro.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  grafiteiro.update(c);
}

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Grafiteiro', () => {
  it('arte própria com as animações da ficha e defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/grafiteiro.js'), 'utf8');
    expect(src).toMatch(/const GRAFITEIRO=/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'cloud', 'tag', 'hit', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xCloud', 'xGlyph', 'xCan']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/sprayAt:3/); expect(src).toMatch(/glyphAt:6/); expect(src).toMatch(/crouch:\[2,6\]/);
    expect((GUARDS as any).grafiteiro).toBe(grafiteiroGuard);
  });

  it('nuvem: cega quem está no cone OLHANDO pro spray; de costas ou fora do cone não', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200); // olha pra esquerda
    const frente = fighter(w, 160, 178, 1), costas = fighter(w, 150, 178, -1), longe = fighter(w, 100, 178, 1), fora = fighter(w, 170, 205, 1);
    spawnCloud(w, z);
    expect(isBlind(w, frente)).toBe(true);
    expect(isBlind(w, costas)).toBe(false);
    expect(isBlind(w, longe)).toBe(false);
    expect(isBlind(w, fora)).toBe(false);
    expect(frente.hp).toBeLessThan(5000); expect(costas.hp).toBeLessThan(5000); // borrifo dá dano leve no cone
    expect(longe.hp).toBe(5000);
    // cegueira: -50% de acerto
    expect(blindMiss(w, frente, 0.3)).toBe(true); expect(blindMiss(w, frente, 0.7)).toBe(false); expect(blindMiss(w, costas, 0.1)).toBe(false);
    // dura 1,2 s (comum)
    w.clock += 1.25; expect(isBlind(w, frente)).toBe(false);
  });

  it('nuvem fica 2 s no ar: quem vira de frente dentro dela cega; não acumula (imune 2 s)', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200);
    const f = fighter(w, 160, 178, -1);
    spawnCloud(w, z);
    expect(isBlind(w, f)).toBe(false);
    f.face = 1; w.clock += 0.1; tickClouds(w, z, 0.1);
    expect(isBlind(w, f)).toBe(true);
    const until = f.blindUntil;
    w.clock += 1.3; tickClouds(w, z, 1.3); // cegueira acabou mas está imune
    expect(isBlind(w, f)).toBe(false); expect(f.blindUntil).toBe(until);
    // nuvem some em 2 s
    w.clock += 0.7; tickClouds(w, z, 0.7);
    expect(cloudsOf(w).length).toBe(0);
    expect(w.actors!.length).toBe(0);
  });

  it('enluarado cega por 1,5 s; plenilunar tem nuvem maior', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200, 178, 'enluarado'); const f = fighter(w, 160, 178, 1);
    spawnCloud(w, z); w.clock += 1.4; expect(isBlind(w, f)).toBe(true); w.clock += 0.2; expect(isBlind(w, f)).toBe(false);
    const w2 = world(); const zp = zomb(w2, 'grafiteiro', 200, 178, 'plenilunar'); const cl = spawnCloud(w2, zp);
    expect(cl.len).toBeGreaterThan(GRAF.coneR); expect(inCone(cl, { x: 200 - 82, y: 178 })).toBe(true);
  });

  it('IA completa: avisa no chão, borrifa no quadro sprayAt e depois foge', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // pickMove escolhe a nuvem entre os válidos a 50 px
    const w = world(); const z = zomb(w, 'grafiteiro', 200); const f = fighter(w, 150, 178, 1);
    run(w, z, f);
    expect(z.state).toBe('attack');
    const mv = z.anim;
    if (mv === 'cloud') {
      expect(w.warns.length).toBe(1);
      let born = false;
      for (let i = 0; i < 120 && z.state === 'attack'; i++) { w.clock += 1 / 60; run(w, z, f); if (cloudsOf(w).length) born = true; }
      expect(born).toBe(true); expect(isBlind(w, f)).toBe(true); expect(w.warns.length).toBe(0);
      expect(z.state).toBe('flee');
    } else expect(['tag', 'cloud']).toContain(mv);
  });

  it('pintando o glifo ajoelhado leva +50% de dano', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200); const f = fighter(w, 170);
    z.state = 'attack'; z.anim = 'tag'; z.fi = 3;
    damageZ(w, z, 40, 1, f);
    expect(z.hp).toBe(1000 - 60);
    const z2 = zomb(w, 'grafiteiro', 260); z2.state = 'chase'; z2.anim = 'walk';
    damageZ(w, z2, 40, 1, f); expect(z2.hp).toBe(960);
  });

  it('acerto durante a nuvem derruba a lata: 5 s só golpe de lata (0,6x), sem cloud/tag', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const z = zomb(w, 'grafiteiro', 200); const f = fighter(w, 160, 178, 1);
    z.state = 'attack'; z.anim = 'cloud'; z.fi = 4;
    damageZ(w, z, 10, 1, f);
    expect(z.noCanT).toBe(GRAF.noCanT);
    expect(w.actors!.length).toBeGreaterThan(0); // lata caída no chão
    // sem lata: a 60 px não tem cloud/tag pra escolher; colado só usa o golpe de lata
    z.state = 'chase'; z.anim = 'walk'; z.stun = 0;
    run(w, z, f);
    expect(z.state).not.toBe('attack');
    const g = fighter(w, 180, 178, 1); z.x = 200;
    run(w, z, g);
    expect(z.state).toBe('attack'); expect(z.anim).toBe('hit');
    for (let i = 0; i < 60 && z.state === 'attack'; i++) run(w, z, g, 1 / 30);
    expect(5000 - g.hp).toBeGreaterThan(0); expect(5000 - g.hp).toBeLessThanOrEqual(9 * 0.9 * 0.6 + 1e-6); // 0,6x (antes da armadura)
    // depois de 5 s volta a ter lata
    for (let i = 0; i < 400; i++) run(w, z, f, 1 / 60);
    expect(z.noCanT).toBe(0);
  });

  it('glifo atrai OUTROS zumbis a 160 px (não o squad) e deixa lento quem pisa', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200); z.face = 1;
    const g = spawnGlyph(w, z)!;
    expect(g.x).toBe(200 + GRAF.glyphDX);
    const perto = zomb(w, 'errante', g.x + 120), longe = zomb(w, 'errante', g.x + 200);
    const f = fighter(w, g.x + 60), pisa = fighter(w, g.x + 4);
    const x0 = perto.x, xl = longe.x, fx = f.x;
    for (let i = 0; i < 60; i++) tickGlyphs(w, z, 1 / 60);
    expect(perto.x).toBeLessThan(x0 - 20);
    expect(longe.x).toBe(xl);
    expect(f.x).toBe(fx);
    expect(pisa.slowT).toBeGreaterThan(0); expect(pisa.slowK).toBeCloseTo(GRAF.slowK);
    expect(f.slowT ?? 0).toBe(0);
  });

  it('glifo: 3 acertos ou golpe de área apagam; dura 8 s; máx. 1 (2 no plenilunar); some se ele morre', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200); z.face = 1;
    let g = spawnGlyph(w, z)!;
    strikeGlyphs(w, g.x - 30, g.y, 40, 1); strikeGlyphs(w, g.x - 30, g.y, 40, 1);
    expect(g.done).toBe(false);
    strikeGlyphs(w, g.x - 30, g.y, 40, 1);
    expect(g.done).toBe(true);
    g = spawnGlyph(w, z)!; strikeGlyphs(w, g.x - 30, g.y, 40, 1, true); expect(g.done).toBe(true);
    g = spawnGlyph(w, z)!; spawnGlyph(w, z);
    expect(glyphsOf(w, z).length).toBe(1); expect(g.done).toBe(true);
    for (let i = 0; i < 9; i++) tickGlyphs(w, z, 1);
    expect(glyphsOf(w, z).length).toBe(0);
    const zp = zomb(w, 'grafiteiro', 100, 178, 'plenilunar'); spawnGlyph(w, zp); spawnGlyph(w, zp); spawnGlyph(w, zp);
    expect(glyphsOf(w, zp).length).toBe(2);
    zp.dead = true; tickGlyphs(w, zp, 0.1);
    expect(glyphsOf(w, zp).length).toBe(0);
  });

  it('auto-detecção: lutador batendo em cima do glifo (combo) apaga em 3 acertos; special apaga na hora', () => {
    const w = world(); const z = zomb(w, 'grafiteiro', 200); z.face = 1;
    const g = spawnGlyph(w, z)!; const f = fighter(w, g.x - 30, g.y, 1);
    f.state = 'combo';
    for (let i = 0; i < 120 && !g.done; i++) tickGlyphs(w, z, 1 / 60);
    expect(g.done).toBe(true); expect(g.hits).toBe(3);
    const g2 = spawnGlyph(w, z)!; f.state = 'special'; tickGlyphs(w, z, 1 / 60); expect(g2.done).toBe(true);
  });
});
