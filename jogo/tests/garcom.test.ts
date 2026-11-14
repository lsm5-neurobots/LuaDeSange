// Zumbi Garçom (Lapa): leque de copos em cone com cacos no chão, giro só de frente (com recarga), bandeja vazia
// (+30%, sem giro) depois do leque, bandeja quebra com 4 acertos de frente.
// Mundo mínimo, sem REGISTRY/ZOMBIES: a IA é chamada direto com um ZCtx montado aqui.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { hurtF } from '../src/expedition/fighter';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import {
  GARCOM, garcom, garcomGuard, glassCount, spinChance, fanAngles, fanLanes, throwGlasses, tickGlasses, glassesOf, shardsOf, tickShards, addShards,
} from '../src/expedition/ai/garcom';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), fan: anim(9, { throwAt: 4, reach: 110 }), slam: anim(8, { hit: 4, reach: 34 }), spin: anim(8),
    empty: anim(6, { dur: () => 217 }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(8), tumble: anim(4), grabbed: anim(4),
    idleX: anim(8), walkX: anim(8), slamX: anim(7, { hit: 3, reach: 32 }), xGlass: anim(4, { prop: true }), xShard: anim(3, { prop: true }),
  },
};
const K = { nome: 'Zumbi Garçom', art: 'GARCOM', ax: 80, G: 150, top: 116, w: 16, hp: 80, dmg: 13, ai: 'garcom', id: 'garcom', F };

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
function gar(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'garcom', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
function run(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  const A = z.K.F.ANIMS, dx = V.x - z.x;
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy: V.y - z.y,
    step: (wf) => stepAnim(z, A[z.anim], dt, wf ? (_e, fi) => garcom.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  garcom.update(c);
}

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Garçom', () => {
  it('arte própria com as animações da ficha e defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/garcom.js'), 'utf8');
    expect(src).toMatch(/const GARCOM=/);
    expect(src).not.toMatch(/STUB|MALANDRO\.|drawHat|drawRazor|drawGuitar/);
    for (const a of ['idle', 'walk', 'alert', 'fan', 'slam', 'spin', 'empty', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'idleX', 'walkX', 'slamX', 'xGlass', 'xShard']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/throwAt:4/);
    // nunca fechar comentário de bloco dentro de comentário
    const blocks = src.match(/\/\*[\s\S]*?\*\//g) ?? [];
    for (const b of blocks) expect(b.slice(2, -2)).not.toContain('*/');
    expect(GUARDS.garcom).toBe(garcomGuard);
  });

  it('leque: 3/4/5 copos por forma, em ±18°, com aviso de cone (3 faixas)', () => {
    const w = world();
    expect(glassCount(gar(w, 200, 178, 'comum'))).toBe(3);
    expect(glassCount(gar(w, 200, 178, 'enluarado'))).toBe(4);
    expect(glassCount(gar(w, 200, 178, 'plenilunar'))).toBe(5);
    expect(fanAngles(3)).toEqual([-18, 0, 18]);
    const z = gar(w); const L = fanLanes(z);
    expect(L.length).toBe(3); expect(L[0]).toBe(z.y); expect(L[1]).toBeLessThan(z.y); expect(L[2]).toBeGreaterThan(z.y);
  });

  it('a IA faz o leque de média distância, avisa antes, lança os copos e fica com a bandeja vazia (+30%, sem giro)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const w = world(); const z = gar(w, 200); const f = fighter(w, 120); // 80 px: só o leque alcança
    let warned = false, threw = 0;
    for (let i = 0; i < 60 && z.state !== 'empty'; i++) { w.clock += 1 / 60; run(w, z, f); if (w.warns.some((t) => t.owner === z)) warned = true; threw = Math.max(threw, glassesOf(z).length); f.x = 120; }
    expect(warned).toBe(true);
    expect(threw).toBe(3);
    expect(z.state).toBe('empty');
    expect(z.openT).toBeCloseTo(GARCOM.emptyT, 1);
    expect(w.warns.filter((t) => t.owner === z).length).toBe(0);
    const hp0 = z.hp;
    damageZ(w, z, 40, 1, fighter(w, 180)); // de frente, sorteio baixo, mas vazio: não gira
    expect(hp0 - z.hp).toBe(Math.round(40 * GARCOM.emptyMul));
    expect(z.state).toBe('empty');
  });

  it('copos acertam quem está no cone (0,5x cada) e deixam cacos que cortam a cada 0,5 s por 3 s', () => {
    const w = world(); const z = gar(w, 200); const a = fighter(w, 140, 178), longe = fighter(w, 140, 205);
    throwGlasses(w, z, a);
    for (let i = 0; i < 90; i++) { w.clock += 1 / 60; tickGlasses(w, z, 1 / 60); }
    expect(glassesOf(z).length).toBe(0);
    const ref = fighter(world(), 0); hurtF(world(), ref, K.dmg * GARCOM.glassDmg);
    expect(5000 - a.hp).toBeCloseTo(5000 - ref.hp, 5); // só o copo do meio pega quem está na faixa
    expect(longe.hp).toBe(5000);
    expect(shardsOf(z).length).toBe(3);
    // cacos: quem pisa leva 0,15x a cada 0,5 s
    const w2 = world(); const z2 = gar(w2, 200); const p = fighter(w2, 100);
    addShards(w2, z2, 100, 178);
    for (let i = 0; i < 60; i++) { w2.clock += 1 / 60; tickShards(w2, z2, 1 / 60); }
    const r2 = fighter(world(), 0), wr = world(); hurtF(wr, r2, K.dmg * GARCOM.shardDmg); hurtF(wr, r2, K.dmg * GARCOM.shardDmg);
    expect(5000 - p.hp).toBeCloseTo(5000 - r2.hp, 5); // 1 s = 2 cortes
    for (let i = 0; i < 180; i++) { w2.clock += 1 / 60; tickShards(w2, z2, 1 / 60); }
    expect(shardsOf(z2).length).toBe(0);
    expect(w2.actors!.length).toBe(0);
  });

  it('giro: esquiva golpe de FRENTE e nunca de costas; recarga de 3 s; chance por forma', () => {
    expect(spinChance({ form: 'comum' } as any)).toBe(0.25);
    expect(spinChance({ form: 'enluarado' } as any)).toBe(0.3);
    expect(spinChance({ form: 'plenilunar' } as any)).toBe(0.35);
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    const w = world(); const z = gar(w); // olha pra esquerda
    const frente = fighter(w, 170), costas = fighter(w, 230);
    damageZ(w, z, 40, 1, costas);
    expect(z.hp).toBe(960); expect(z.state).not.toBe('spin');
    damageZ(w, z, 40, 1, frente);
    expect(z.hp).toBe(960); expect(z.state).toBe('spin');
    z.state = 'chase'; z.anim = 'walk';
    damageZ(w, z, 40, 1, frente); expect(z.hp).toBe(920); // em recarga: acerta
    w.clock += GARCOM.spinCd + 0.1;
    damageZ(w, z, 40, 1, frente); expect(z.state).toBe('spin'); expect(z.hp).toBe(920);
  });

  it('laser gira com metade da chance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2); // < 0,25 mas > 0,125
    const w = world(); const z = gar(w); const f = fighter(w, 170); f.w = { tipo: 'beam' } as any;
    damageZ(w, z, 40, 1, f);
    expect(z.hp).toBe(960);
  });

  it('bandeja quebra com 4 acertos de frente: sem giro, sem leque, golpe com a garrafa', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = gar(w); const f = fighter(w, 170);
    for (let i = 0; i < 3; i++) damageZ(w, z, 10, 1, f);
    expect(z.trayBroken).toBeFalsy();
    damageZ(w, z, 10, 1, fighter(w, 230)); // de costas não conta
    expect(z.trayBroken).toBeFalsy();
    damageZ(w, z, 10, 1, f);
    expect(z.trayBroken).toBe(true);
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const hp0 = z.hp; damageZ(w, z, 10, 1, f);
    expect(z.hp).toBe(hp0 - 10); // não gira mais
    // de média distância não lança leque; de perto usa a garrafada
    const g = fighter(w, 120); z.state = 'chase';
    for (let i = 0; i < 30; i++) { w.clock += 1 / 60; run(w, z, g); }
    expect(z.anim).not.toBe('fan');
    expect(z.anim).toBe('walkX');
    const n = fighter(w, z.x - 20); z.state = 'chase';
    let usedX = false;
    for (let i = 0; i < 60; i++) { w.clock += 1 / 60; run(w, z, n); if (z.anim === 'slamX') usedX = true; }
    expect(usedX).toBe(true);
  });

  it('bandeja quebrada marca formSfx = sem (arte sem bandeja em todas as anims)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = gar(w); const f = fighter(w, 170);
    for (let i = 0; i < 3; i++) damageZ(w, z, 10, 1, f);
    expect((z as any).formSfx).toBeUndefined();
    damageZ(w, z, 10, 1, f); // 4º acerto de frente
    expect(z.trayBroken).toBe(true);
    expect((z as any).formSfx).toBe('sem');
    damageZ(w, z, 10, 1, f);
    expect((z as any).formSfx).toBe('sem'); // não volta
  });

  it('arte aceita a forma com sufixo ~sem (canvas falso)', () => {
    // canvas 2D falso: conta as chamadas de desenho; getImageData devolve buffer zerado do tamanho pedido
    const ops = { n: 0 };
    const mkCtx = (cv: any) => new Proxy({
      canvas: cv,
      getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
      createImageData: (w: any, h: number) => ({ data: new Uint8ClampedArray(Math.max(1, (w.width ? w.width * w.height : w * h) * 4)), width: w.width || w, height: w.height || h }),
      measureText: () => ({ width: 1 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    } as any, { get: (o, k) => (k in o ? o[k] : () => { ops.n++; }), set: (o, k, v) => { o[k] = v; return true; } });
    const mkCanvas = () => { const cv: any = { width: 300, height: 150, style: {} }; let c: any; cv.getContext = () => c || (c = mkCtx(cv)); return cv; };
    const ctx: any = { console, Math, Map, Set, Array, Object, String, Number, JSON, Uint8ClampedArray, Float32Array, Uint8Array, Uint32Array, Date, performance: { now: () => 0 }, document: { createElement: () => mkCanvas() } };
    ctx.window = ctx; ctx.self = ctx;
    vm.createContext(ctx);
    const src = ['shared/pix', 'shared/zreact', 'zombies/garcom'].map((p) => fs.readFileSync(path.resolve(__dirname, '../art-src/' + p + '.js'), 'utf8')).join('\n');
    vm.runInContext(src + '\n;this.GARCOM=GARCOM;', ctx);
    const G = ctx.GARCOM;
    expect(JSON.stringify(G.mats('comum~sem'))).toBe(JSON.stringify(G.mats('comum')));
    expect(JSON.stringify(G.mats('plenilunar~sem'))).toBe(JSON.stringify(G.mats('plenilunar')));
    let n0 = ops.n; expect(() => G.frame('comum', 'hurt', 1)).not.toThrow(); const comBandeja = ops.n - n0;
    n0 = ops.n; expect(() => G.frame('comum~sem', 'hurt', 1)).not.toThrow(); const semBandeja = ops.n - n0;
    expect(semBandeja).toBeLessThan(comBandeja); // bandeja + tulipas não foram desenhadas
    for (const a of ['hurtB', 'fall', 'getup', 'death', 'tumble', 'grabbed']) for (let i = 0; i < G.ANIMS[a].n; i++) expect(() => G.frame('enluarado~sem', a, i)).not.toThrow();
    expect(() => G.framePose('comum~sem', 'hurt', { aBs: -110, aBe: 180 }, 'k1')).not.toThrow();
  });

  it('com o leque pronto, recua de quem chega perto demais', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = gar(w, 200); const f = fighter(w, 164); // 36 px: fora do leque (40) e da bandejada (34)
    const x0 = z.x;
    for (let i = 0; i < 20; i++) { w.clock += 1 / 60; run(w, z, f); }
    expect(z.x).toBeGreaterThan(x0);
  });
});
