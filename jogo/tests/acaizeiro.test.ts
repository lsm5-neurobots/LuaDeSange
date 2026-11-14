// Zumbi Açaizeiro (Ver-o-Peso): rasteira com faixa de aviso que derruba e termina de joelho (+30%), derrame de açaí com
// círculo no alvo e poça roxa (-45%, máx. 2, 5 s / 6 s enluarado, pega zumbis também), paneiro (-30% por trás, quebra
// em 6 golpes: +20% e sem rasteira, solta comida). Mundo mínimo; a IA é registrada aqui no teste.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import {
  acaizeiro, acaizeiroGuard, addPool, poolsOf, tickPools, throwBlobs, tickBlobs, spillTargets, sweepHit, breakBasket,
  BACK_MUL, WOBBLE_MUL, BROKEN_MUL, BASKET_HITS, POOL_MAX, POOL_SLOW, WOBBLE_T,
} from '../src/expedition/ai/acaizeiro';
import type { World, Zombie, Fighter } from '../src/expedition/world';

(REGISTRY as any).acaizeiro = acaizeiro;

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), sweep: anim(9, { hit: 3, reach: 48 }), wobble: anim(6, { dur: () => 200 }),
    bash: anim(8, { hit: 3, reach: 34 }), spill: anim(9, { toss: 4, reach: 90 }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(6), death: anim(8),
    tumble: anim(4), grabbed: anim(4), backhand: anim(7, { hit: 3, reach: 38 }), xBlob: anim(4, { prop: true }), xPool: anim(3, { prop: true }),
  },
};
const K = { nome: 'Zumbi Açaizeiro', art: 'ACAIZEIRO', ai: 'acaizeiro', ax: 96, G: 158, top: 112, w: 26, hp: 120, dmg: 12, F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'veropeso', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], items: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { acaizeiro: K };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function acai(w: World, x = 200, y = 178, form = 'comum', kind = 'acaizeiro'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind, K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: form === 'plenilunar' ? 1.5 : 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: -1e9, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) if (z.kind === 'acaizeiro') updateZombie(w, z, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Açaizeiro', () => {
  it('arte própria com os golpes da ficha e defesa registrada', () => {
    expect(GUARDS['acaizeiro' as keyof typeof GUARDS]).toBe(acaizeiroGuard);
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/acaizeiro.js'), 'utf8');
    expect(src).toMatch(/const ACAIZEIRO=/);
    expect(src).not.toMatch(/stub: arte|const MALANDRO|const PEIXEIRO/);
    for (const a of ['idle', 'walk', 'alert', 'sweep', 'wobble', 'bash', 'spill', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xBlob', 'xPool']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/sweep:\{[^\n]*hit:3,reach:48/);
    expect(src).toMatch(/spill:\{[^\n]*toss:4/);
    expect(src).toMatch(/bash:\{[^\n]*hit:3,reach:34/);
    // avisos da ficha: rasteira 320 ms, paneirada 220 ms, derrame 300 ms até o quadro do golpe
    const until = (name: string, n: number) => { const m = src.match(new RegExp(name + ':\\{[^\\n]*dur:i=>\\[([0-9,]+)\\]')); return m![1].split(',').slice(0, n).map(Number).reduce((a, b) => a + b, 0); };
    expect(until('sweep', 3)).toBe(320);
    expect(until('bash', 3)).toBe(220);
    expect(until('spill', 4)).toBe(300);
  });

  it('paneiro: por trás passa 70% e conta; 6 golpes quebram (+20%, comida no chão, poça)', () => {
    const w = world(); const z = acai(w); // olha pra esquerda
    damageZ(w, z, 40, 1, fighter(w, 170)); // de frente
    expect(z.hp).toBe(960);
    const atras = fighter(w, 230);
    const hp1 = z.hp; damageZ(w, z, 40, 1, atras);
    expect(hp1 - z.hp).toBe(Math.round(40 * BACK_MUL));
    for (let i = 1; i < BASKET_HITS; i++) damageZ(w, z, 10, 1, atras);
    expect(z.broken).toBe(true);
    expect((w as any).items.some((it: any) => it.id === 'comida')).toBe(true);
    expect(poolsOf(z).length).toBe(1);
    const hp2 = z.hp; damageZ(w, z, 40, 1, atras);
    expect(hp2 - z.hp).toBe(Math.round(40 * BROKEN_MUL));
  });

  it('rasteira derruba quem está na faixa baixa; fora da faixa não', () => {
    const w = world(); const z = acai(w, 200, 178);
    const na = fighter(w, 165, 178), fora = fighter(w, 165, 196);
    sweepHit(w, z);
    expect(na.hp).toBeLessThan(5000);
    expect(['stun', 'kd']).toContain(na.state);
    expect(fora.hp).toBe(5000);
  });

  it('IA: rasteira com faixa de aviso, depois fica de joelho 1,2 s levando +30%', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const w = world(); const z = acai(w, 200); const f = fighter(w, 168);
    let warned = false, wob = false, wobDmg = 0;
    tick(w, 150, 1 / 60, () => {
      f.x = 168; f.y = 178;
      if (w.warns.some((t: any) => t.owner === z && t.kind === 'lane')) warned = true;
      if (z.state === 'wobble' && !wob) { wob = true; const hp = z.hp; damageZ(w, z, 40, 1, fighter(w, 170)); wobDmg = hp - z.hp; }
      if (z.state === 'attack' && z.anim !== 'sweep') { z.state = 'chase'; z.anim = 'walk'; } // só a rasteira neste teste
    });
    expect(warned).toBe(true);
    expect(wob).toBe(true);
    expect(wobDmg).toBe(Math.round(40 * WOBBLE_MUL));
    expect(f.hp).toBeLessThan(5000);
  });

  it('desequilibrado dura 1,2 s e volta a perseguir', () => {
    const w = world(); const z = acai(w, 200); fighter(w, 300);
    z.state = 'wobble'; z.anim = 'wobble'; z.wobT = WOBBLE_T;
    tick(w, Math.round(60 * (WOBBLE_T - 0.1)));
    expect(z.state).toBe('wobble');
    tick(w, 20);
    expect(z.state).toBe('chase');
  });

  it('paneiro quebrado: nunca usa a rasteira', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const w = world(); const z = acai(w, 200); const f = fighter(w, 168);
    breakBasket(w, z);
    let swept = false;
    tick(w, 400, 1 / 60, () => { f.x = 168; f.y = 178; if (z.anim === 'sweep') swept = true; });
    expect(swept).toBe(false);
  });

  it('derrame: círculo no alvo, bolo cai, 0,3x em volta e poça; plenilunar faz 2', () => {
    const w = world(); const z = acai(w, 200, 178);
    const alvo = fighter(w, 140, 178), longe = fighter(w, 60, 178);
    z._spillT = spillTargets(w, z, alvo);
    throwBlobs(w, z);
    for (let i = 0; i < 60; i++) tickBlobs(w, z, 1 / 60);
    expect(alvo.hp).toBeLessThan(5000);
    expect(longe.hp).toBe(5000);
    expect(poolsOf(z).length).toBe(1);
    expect(Math.abs(poolsOf(z)[0].x - 140)).toBeLessThan(2);
    const zp = acai(w, 200, 178, 'plenilunar');
    expect(spillTargets(w, zp, alvo).length).toBe(2);
  });

  it('IA: de média distância derrama com círculo de aviso e deixa poça', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const w = world(); const z = acai(w, 200); const f = fighter(w, 130);
    let circle = false;
    tick(w, 200, 1 / 60, () => { f.x = 130; f.y = 178; if (w.warns.some((t: any) => t.owner === z && t.kind === 'circle')) circle = true; });
    expect(circle).toBe(true);
    expect(poolsOf(z).length).toBeGreaterThan(0);
  });

  it('poça: -45% enquanto pisa, pega zumbis (aliados) também, máx. 2, 5 s (6 s enluarado), some quando ele morre', () => {
    const w = world(); const z = acai(w); const f = fighter(w, 100, 178);
    const aliado = acai(w, 104, 180, 'comum', 'errante');
    addPool(w, z, 100, 178); addPool(w, z, 60, 178); addPool(w, z, 30, 178);
    expect(poolsOf(z).length).toBe(POOL_MAX);
    addPool(w, z, 100, 178);
    tickPools(w, z, 0.1);
    expect(f.slowT).toBeGreaterThan(0);
    expect(f.slowK).toBeCloseTo(POOL_SLOW);
    expect(aliado.hasteT).toBeGreaterThan(0);
    expect(aliado.hasteMul).toBeCloseTo(1 - POOL_SLOW);
    const fora = fighter(w, 250, 178); tickPools(w, z, 0.1);
    expect(fora.slowT ?? 0).toBe(0);
    tickPools(w, z, 5);
    expect(poolsOf(z).length).toBe(0);
    const ze = acai(w, 200, 178, 'enluarado'); addPool(w, ze, 100, 178);
    tickPools(w, ze, 5.5); expect(poolsOf(ze).length).toBe(1);
    tickPools(w, ze, 0.6); expect(poolsOf(ze).length).toBe(0);
    const zd = acai(w); const P = addPool(w, zd, 100, 178); zd.dead = true;
    P.actor.draw({ save() {}, restore() {}, translate() {}, scale() {}, drawImage() {} } as any, 0);
    expect(w.actors!.includes(P.actor)).toBe(false);
  });
});
