// Zumbi Peixeiro (Ver-o-Peso): peixe em linha na faixa (sair da faixa evita), poça escorregadia (máx. 2, 6 s),
// isopor aberto depois do arremesso (+25%), isopor vazio (só facão 3 s), avental (-10% de frente), facão em duas.
// Mundo mínimo; a IA é registrada aqui no teste (o orquestrador registra em ai/index.ts e data/zombies.ts depois).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { hurtF } from '../src/expedition/fighter';
import {
  peixeiro, peixeiroGuard, addPool, poolsOf, tickPools, throwFish, tickFish, lanesOf,
  APRON_MUL, RESTOCK_MUL, POOL_MAX, POOL_T, POOL_SLOW, FISH_STOCK, EMPTY_T,
} from '../src/expedition/ai/peixeiro';
import type { World, Zombie, Fighter } from '../src/expedition/world';

(REGISTRY as any).peixeiro = peixeiro;

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), chop: anim(9, { hit: [3, 6], reach: 38 }), throw: anim(9, { toss: 4, reach: 120 }),
    hack: anim(8, { hit: 3, reach: 34 }), restock: anim(6, { dur: () => 160 }), hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8),
    tumble: anim(4), grabbed: anim(4), backhand: anim(7, { hit: 3, reach: 38 }), xFish: anim(4, { prop: true }), xPool: anim(3, { prop: true }),
  },
};
const K = { nome: 'Zumbi Peixeiro', art: 'PEIXEIRO', ai: 'peixeiro', ax: 84, G: 152, top: 108, w: 20, hp: 105, dmg: 15, F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'veropeso', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { peixeiro: K };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function peix(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'peixeiro', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: form === 'plenilunar' ? 1.5 : 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Peixeiro', () => {
  it('arte própria com os golpes da ficha e defesa registrada', () => {
    expect(GUARDS['peixeiro' as keyof typeof GUARDS]).toBe(peixeiroGuard);
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/peixeiro.js'), 'utf8');
    expect(src).toMatch(/const PEIXEIRO=/);
    expect(src).not.toMatch(/stub: arte|const MALANDRO|navalha/i);
    for (const a of ['idle', 'walk', 'alert', 'chop', 'throw', 'hack', 'restock', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xFish', 'xPool']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/throw:\{[^\n]*toss:4/);
    expect(src).toMatch(/chop:\{[^\n]*hit:\[3,6\]/);
  });

  it('avental segura 10% de frente; de costas dano cheio; isopor aberto +25%', () => {
    const w = world(); const z = peix(w); // olha pra esquerda
    damageZ(w, z, 40, 1, fighter(w, 170));
    expect(z.hp).toBe(1000 - Math.round(40 * APRON_MUL));
    const hp1 = z.hp; damageZ(w, z, 40, 1, fighter(w, 230));
    expect(hp1 - z.hp).toBe(40);
    z.openT = 0.5; z.state = 'restock'; z.anim = 'restock';
    const hp2 = z.hp; damageZ(w, z, 40, 1, fighter(w, 170));
    expect(hp2 - z.hp).toBe(Math.round(40 * RESTOCK_MUL));
  });

  it('peixe voa em linha: acerta quem está na faixa, quem saiu da faixa não leva nada', () => {
    const w = world(); const z = peix(w, 200, 178);
    const naFaixa = fighter(w, 120, 178), fora = fighter(w, 140, 192);
    throwFish(w, z, naFaixa);
    for (let i = 0; i < 60; i++) tickFish(w, z, 1 / 60);
    expect(naFaixa.hp).toBeLessThan(5000);
    expect(fora.hp).toBe(5000);
    expect(poolsOf(z).length).toBe(1); // poça onde acertou
    expect(w.actors!.length).toBe(1); // o peixe sumiu, ficou a poça
  });

  it('peixe que não acerta ninguém cai no alcance e deixa poça', () => {
    const w = world(); const z = peix(w, 200, 178); const V = fighter(w, 120, 196);
    throwFish(w, z, V);
    for (let i = 0; i < 60; i++) tickFish(w, z, 1 / 60);
    expect(V.hp).toBe(5000);
    expect(poolsOf(z).length).toBe(1);
    expect(Math.abs(poolsOf(z)[0].x - 120)).toBeLessThan(14);
  });

  it('poça: -35% e escorrega, no máximo 2 por peixeiro, some em 6 s', () => {
    const w = world(); const z = peix(w); const f = fighter(w, 100, 178);
    addPool(w, z, 100, 178); addPool(w, z, 60, 178); addPool(w, z, 30, 178);
    expect(poolsOf(z).length).toBe(POOL_MAX);
    expect(poolsOf(z).some((p) => p.x === 100)).toBe(false); // a mais antiga saiu
    addPool(w, z, 100, 178);
    const x0 = f.x; tickPools(w, z, 0.1);
    expect(f.slowT).toBeGreaterThan(0);
    expect(f.slowK).toBeCloseTo(POOL_SLOW);
    expect(f.x).not.toBe(x0); // perde tração
    tickPools(w, z, POOL_T);
    expect(poolsOf(z).length).toBe(0);
    expect(w.actors!.length).toBe(0);
  });

  it('plenilunar arremessa 2 peixes em leque (duas faixas)', () => {
    const w = world(); const z = peix(w, 200, 178, 'plenilunar');
    expect(lanesOf(z).length).toBe(2);
    expect(throwFish(w, z, fighter(w, 120)).length).toBe(2);
    const zc = peix(w, 200, 178, 'comum');
    expect(lanesOf(zc).length).toBe(1);
  });

  it('IA: de longe arremessa com aviso na faixa, depois abre o isopor (+25%)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const z = peix(w, 200); const f = fighter(w, 110);
    let warned = false, threw = false, restock = false;
    tick(w, 200, 1 / 60, () => { f.x = 110; f.y = 178; if (w.warns.some((t: any) => t.owner === z && t.kind === 'lane')) warned = true; if (z.anim === 'throw') threw = true; if (z.state === 'restock') restock = true; });
    expect(warned).toBe(true);
    expect(threw).toBe(true);
    expect(restock).toBe(true);
    expect(f.hp).toBeLessThan(5000);
  });

  it('isopor vazio: depois do último peixe só usa facão por 3 s', () => {
    const w = world(); const z = peix(w, 200); fighter(w, 110);
    z.fishN = 1; z.state = 'attack'; z.anim = 'throw'; z.move = 'throw'; z.fi = 8; z.acc = 99; z.done = false;
    throwFish(w, z, null);
    expect(z.fishN).toBe(0);
    tick(w, 2);
    expect(z.state).toBe('restock');
    expect(z.noFishT).toBeGreaterThan(EMPTY_T - 0.1);
    z.state = 'chase'; z.openT = 0;
    let threw = false;
    tick(w, 150, 1 / 60, () => { if (z.anim === 'throw') threw = true; });
    expect(threw).toBe(false);
    tick(w, 60 * 2, 1 / 60);
    expect(z.fishN).toBe(FISH_STOCK);
  });

  it('facão em duas: 2 cortes somam ≈1,1x do dano', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const w = world(); const z = peix(w, 200); const f = fighter(w, 176);
    z.state = 'attack'; z.anim = 'chop'; z.move = 'chop'; z.fi = 0; z.acc = 0; z.done = false; z.face = -1;
    const g = fighter(w, 400); hurtF(w, g, 100); const arm = (5000 - g.hp) / 100; // armadura do lutador
    let hits = 0, last = f.hp;
    tick(w, 60, 1 / 60, () => { f.x = 176; f.y = 178; if (f.hp < last) { hits++; last = f.hp; } });
    expect(hits).toBe(2);
    expect((5000 - f.hp) / arm).toBeCloseTo(15 * 1.1, 0);
  });
});
