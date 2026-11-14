// Zumbi Peão Pantaneiro: laço (alcance, linha de visão, puxa, cancela com golpe forte), berrante (≥ 2 aliados,
// interrompido por dano, buff sem empilhar, comum só 1×), fraqueza depois do sopro, facada em 2 cortes.
// Mundo mínimo; IA chamada direto (não depende de ZOMBIES nem do REGISTRY).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import { propsOf } from '../src/expedition/ai/bossProps';
import {
  peao, peaoGuard, canLaco, throwLaco, applyHerd, alliesNear, LACO_CD, PULL_TO, WEAK_MUL, HERD_DMG, herdSpd, BERRANTE_CD,
} from '../src/expedition/ai/peao';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(9, { hit: [4, 7], reach: 34 }),
    laco: anim(10, { warn: [0, 3], throwAt: 4, pull: [5, 8], reach: 180 }), berrante: anim(9, { warn: [0, 3], call: 4 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8), tumble: anim(4), grabbed: anim(4),
    xLaco: anim(4, { prop: true }), xBerrante: anim(3, { prop: true }),
  },
};
const K: any = { nome: 'Zumbi Peão Pantaneiro', art: 'PEAO', ax: 82, G: 152, top: 116, w: 16, hp: 110, dmg: 15, ai: 'peao', F };
const KE: any = { nome: 'Errante', ax: 74, G: 142, top: 106, w: 18, hp: 80, dmg: 14, ai: 'errante', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pantanal', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], rings: [], props: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function zomb(w: World, kind: string, KK: any, x: number, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind, K: KK, form, x, y, z: 0, face: -1, hp: KK.hp, maxhp: KK.hp, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const pe = (w: World, x = 200, form = 'comum') => zomb(w, 'peao', K, x, 178, form);

/** um passo da IA do peão (cópia mínima do updateZombie: hurt e cool cuidados aqui) */
function step(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  if (z.dead) return;
  if (z.state === 'hurt') { stepAnim(z, F.ANIMS[z.anim], dt); if (z.done) { z.state = 'chase'; z.anim = 'walk'; z.fi = 0; z.done = false; } return; }
  z.cd = Math.max(0, z.cd - dt);
  const c: ZCtx = {
    w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e, fi) => peao.onFrame!(c, fi) : undefined),
    chase: (spd) => { z.x += Math.sign(V.x - z.x) * spd * dt; c.step(); },
  };
  peao.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += 1 / 60; each?.(); step(w, z, V); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Peão Pantaneiro', () => {
  it('arte própria com as animações e eventos da ficha', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/peao.js'), 'utf8');
    expect(src).toMatch(/const PEAO=\(function/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'laco', 'berrante', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xLaco', 'xBerrante']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/laco:\{[^\n]*n:10,warn:\[0,3\],throwAt:4,pull:\[5,8\]/);
    expect(src).toMatch(/berrante:\{[^\n]*n:9,warn:\[0,3\],call:4/);
    expect(src).toMatch(/attack:\{[^\n]*n:9,hit:\[4,7\],reach:34/);
  });

  it('laço: só de 50 a 180 px (220 no plenilunar) e com linha de visão', () => {
    const w = world(); const z = pe(w, 200);
    expect(canLaco(w, z, fighter(w, 170))).toBe(false); // 30 px: perto demais
    expect(canLaco(w, z, fighter(w, 100))).toBe(true); // 100 px
    expect(canLaco(w, z, fighter(w, 0))).toBe(false); // 200 px
    const zp = pe(w, 200, 'plenilunar');
    expect(canLaco(w, zp, w.fs[2])).toBe(true); // 200 px no plenilunar
    propsOf(w).push({ kind: 'crate', x: 150, y: 178, hp: 3, st: 0, landed: true, done: false, owner: z, hitT: new Map() } as any);
    expect(canLaco(w, z, w.fs[1])).toBe(false); // caixote no meio
  });

  it('laço: gira com aviso, laça quem ficou no círculo, prende e puxa até ~40 px', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = pe(w, 220); const f = fighter(w, 100);
    z.hornCd = 99; z.lacoCd = 0;
    let warned = false, caughtAt = -1;
    run(w, z, f, 120, () => { if (w.warns.some((t) => t.owner === z && t.kind === 'circle')) warned = true; if (f.hp < 5000 && caughtAt < 0) caughtAt = Math.abs(f.x - z.x); });
    expect(warned).toBe(true);
    expect(f.hp).toBeLessThan(5000); expect(f.hp).toBeGreaterThan(5000 - 15 * 0.5 - 0.01); // 0,5× (menos a armadura)
    expect(caughtAt).toBeGreaterThan(100);
    expect(Math.abs(f.x - z.x)).toBeLessThanOrEqual(PULL_TO + 2);
    expect(w.actors!.length).toBe(0); // corda recolhida
  });

  it('laço: quem saiu do círculo antes do lançamento escapa', () => {
    const w = world(); const z = pe(w, 220); const f = fighter(w, 100);
    z.hornCd = 99; z.lacoCd = 0;
    run(w, z, f, 18); // começou o giro
    expect(z.anim).toBe('laco');
    f.y = 150; f.x = 60;
    run(w, z, f, 40);
    expect(f.hp).toBe(5000);
    expect(Math.abs(f.x - 60)).toBeLessThan(1);
  });

  it('laço: golpe forte (≥ 25% da vida) cancela a puxada; golpe fraco não', () => {
    const w = world(); const z = pe(w, 220); const f = fighter(w, 100);
    z.state = 'attack'; z.anim = 'laco'; z.fi = 5;
    expect(peaoGuard(w, z, 10)).toBe(10);
    expect(z.anim).toBe('laco');
    peaoGuard(w, z, 0.3 * z.maxhp);
    expect(z.anim).toBe('hurt');
    void f;
  });

  it('berrante: precisa de ≥ 2 aliados a 220 px; buff +velocidade e +10% de dano por 6 s, sem empilhar', () => {
    const w = world(); const z = pe(w, 200); const f = fighter(w, 60);
    z.lacoCd = 99;
    const a = zomb(w, 'errante', KE, 260);
    run(w, z, f, 30);
    expect(z.anim).not.toBe('berrante'); // só 1 aliado
    const b = zomb(w, 'errante', KE, 150);
    const far = zomb(w, 'errante', KE, 200 + 260);
    expect(alliesNear(w, z)).toHaveLength(2);
    let started = false;
    run(w, z, f, 60, () => { if (z.anim === 'berrante') started = true; });
    expect(started).toBe(true);
    expect(z.blew).toBe(true);
    for (const o of [a, b]) { expect(o.hasteMul).toBeCloseTo(herdSpd(z)); expect(o.dmgMul).toBeCloseTo(HERD_DMG); }
    expect(far.dmgMul).toBe(1);
    applyHerd(w, z); // de novo: não empilha
    expect(a.dmgMul).toBeCloseTo(HERD_DMG); expect(a.hasteMul).toBeCloseTo(1.25);
    w.clock += 6.1;
    expect(a.dmgMul).toBe(1); // acabou sozinho
    // comum: só 1× na vida
    z.hornCd = 0; z.state = 'chase';
    run(w, z, f, 30);
    expect(z.anim).not.toBe('berrante');
    expect(BERRANTE_CD).toBe(20);
  });

  it('berrante: qualquer dano antes do sopro interrompe (sem buff); depois do sopro +30% de dano por 0,8 s', () => {
    const w = world(); const z = pe(w, 200); const f = fighter(w, 60);
    z.lacoCd = 99; z.hornCd = 0;
    const a = zomb(w, 'errante', KE, 230); zomb(w, 'errante', KE, 170);
    run(w, z, f, 10);
    expect(z.anim).toBe('berrante');
    damageZ(w, z, 1, 1, f);
    expect(z.anim).toBe('hurt');
    expect(a.dmgMul).toBe(1);
    // enluarado sopra de novo depois da recarga; testa a fraqueza
    const w2 = world(); const z2 = pe(w2, 200, 'enluarado'); const f2 = fighter(w2, 60);
    z2.lacoCd = 99; z2.hornCd = 0; const a2 = zomb(w2, 'errante', KE, 230); zomb(w2, 'errante', KE, 170);
    run(w2, z2, f2, 40, () => {});
    expect(z2.called).toBe(true);
    expect(a2.hasteMul).toBeCloseTo(1.4);
    expect(z2.weakT).toBeGreaterThan(0);
    const hp0 = z2.hp;
    damageZ(w2, z2, 10, 1, f2);
    expect(hp0 - z2.hp).toBe(Math.round(10 * WEAK_MUL));
  });

  it('facada: 2 cortes somando ≈1,1× do dano', () => {
    const w = world(); const z = pe(w, 200); const f = fighter(w, 175);
    z.lacoCd = 99; z.hornCd = 99;
    const hits: number[] = []; let last = 5000;
    run(w, z, f, 70, () => { f.x = z.x - 25; if (f.hp < last) { hits.push(last - f.hp); last = f.hp; } });
    expect(hits.length).toBe(2);
    expect(hits[0]).toBeCloseTo(hits[1], 5);
    expect(hits[0] + hits[1]).toBeLessThanOrEqual(15 * 1.1 + 0.01); // 2 × 0,77/1,4 = 1,1× (antes da armadura)
    expect(hits[0] + hits[1]).toBeGreaterThan(15 * 1.1 * 0.6);
  });

  it('sozinho mantém distância (não encosta) e o laço tem recarga de 8 s', () => {
    const w = world(); const z = pe(w, 200); const f = fighter(w, 150);
    z.lacoCd = 99; z.hornCd = 99;
    run(w, z, f, 120, () => { f.x = 150; });
    expect(Math.abs(z.x - f.x)).toBeGreaterThan(80);
    expect(LACO_CD).toBe(8);
  });

  it('throwLaco sem laço ativo não quebra', () => {
    const w = world(); const z = pe(w);
    expect(throwLaco(w, z)).toBeNull();
  });
});
