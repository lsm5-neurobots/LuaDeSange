// A Passista (mini boss da Lapa): giro que empurra e deixa TONTA 1,5 s, pisão com aviso, chuva de lantejoulas
// (poças de lentidão + ofuscar), avanço sambando e a ala de Malandros na fúria — mundo mínimo, sem arte.
import { describe, it, expect } from 'vitest';
import { damageZ } from '../src/expedition/combat';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { propsOf } from '../src/expedition/ai/bossProps';
import { PAS } from '../src/expedition/ai/passista';
import { ZOMBIES } from '../src/data/zombies';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
// mesmos campos de evento da arte (art-src/zombies/passista.js)
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), intro: anim(12), hurt: anim(4), rage: anim(8), death: anim(12), dazed: anim(8),
    spin: anim(12, { warn: [0, 1, 2], hit: 5, hit2: 8 }), stomp: anim(9, { warn: [1, 2, 3], hit: 4 }),
    rain: anim(10, { warn: [1, 2, 3], throwAt: 5 }), dash: anim(10, { warn: [0, 1], run: [2, 3, 4, 5, 6, 7] }), summon: anim(9, { callAt: 5 }),
    xPool: anim(2, { prop: true }), xBottle: anim(2, { prop: true }),
  },
};
const FM: any = { ANIMS: { idle: anim(8), walk: anim(8), attack: anim(8, { hit: 4 }), hurt: anim(4), death: anim(8) } };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'lapa', bonus: { esquiva: 0 } }, mode: 'noite', phase: 'fight', cam: 0, W: 384, clock: 0, ai: 0,
    fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], pools: [], actors: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { passista: { ...ZOMBIES.passista, id: 'passista', F }, malandro: { ...ZOMBIES.malandro, id: 'malandro', F: FM } };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T', lv: 1 }, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function boss(w: World, x = 200, block: string[] = []): Zombie {
  const K = (w.zk as any).passista;
  const z: any = { uid: ++w.uid, kind: 'passista', K, form: 'normal', x, y: 178, z: 0, face: -1, hp: 3400, maxhp: 3400, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0, mcd: {} };
  for (const b of block) z.mcd[b] = 999;
  w.zs.push(z); w.boss = z; return z;
}
const tick = (w: World, s: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < Math.round(s / dt); i++) { w.clock += dt; each?.(); for (const z of [...w.zs]) updateZombie(w, z, dt); } };
const until = (w: World, cond: () => boolean, max = 6, dt = 1 / 60) => { let t = 0; while (!cond() && t < max) { tick(w, dt, dt); t += dt; } return t; };

describe('A Passista', () => {
  it('registrada com arte, IA e medidas próprias (não é mais o stub do Vendedor de Fitas)', () => {
    expect(REGISTRY.passista).toBeTruthy();
    expect(REGISTRY.passista).not.toBe(REGISTRY.vendedorfitas);
    const d = ZOMBIES.passista;
    expect(d.art).toBe('PASSISTA'); expect(d.ai).toBe('passista'); expect(d.boss).toBe('mini'); expect(d.mapa).toBe('lapa');
    expect(d.top).toBeGreaterThan(180); expect(d.top).toBeLessThan(200);
  });

  it('giro de plumas: aviso em área, dano e empurrão; depois fica TONTA 1,5 s com dano ×1,6', () => {
    const w = world(); const f = fighter(w, 160); const z = boss(w);
    tick(w, 1 / 60);
    expect(z.state).toBe('attack'); expect(z.mv).toBe('spin');
    expect(w.warns.some((t) => t.kind === 'circle' && t.r === PAS.spinR)).toBe(true);
    const x0 = f.x;
    until(w, () => z.state === 'dazed');
    expect(z.state).toBe('dazed');
    expect(f.hp).toBeLessThan(1000);
    expect(f.x).toBeLessThan(x0 - 20); // empurrada pra longe (ela está à direita)
    const hp0 = z.hp; damageZ(w, z, 100, 1); expect(hp0 - z.hp).toBe(160);
    tick(w, 1.3); expect(z.state).toBe('dazed');
    tick(w, 0.3); expect(z.state).toBe('walk');
  });

  it('pisão de salto: círculo de aviso à frente, acerto atordoa', () => {
    const w = world(); const f = fighter(w, 160); const z = boss(w, 200, ['spin']);
    tick(w, 1 / 60);
    expect(z.mv).toBe('stomp');
    const wn = w.warns.find((t) => t.owner === z && t.kind === 'circle')!;
    expect(wn.r).toBe(PAS.stompR); expect(wn.x!).toBeLessThan(z.x);
    until(w, () => f.state === 'stun', 2);
    expect(f.state).toBe('stun'); expect(f.hp).toBeLessThan(1000);
    expect(w.warns.filter((t) => t.owner === z).length).toBe(0);
  });

  it('chuva de lantejoulas: 3 rajadas em leque, ofusca no acerto direto e deixa poças que deixam lento', () => {
    const w = world(); const f = fighter(w, 90); const z = boss(w, 200, ['spin', 'stomp', 'dash']);
    tick(w, 1 / 60);
    expect(z.mv).toBe('rain');
    expect(w.warns.filter((t) => t.owner === z && t.kind === 'circle').length).toBe(3);
    until(w, () => propsOf(w).filter((p) => p.kind === 'pool').length >= 3, 3);
    expect(propsOf(w).filter((p) => p.kind === 'pool').length).toBe(3);
    expect(f.hp).toBeLessThan(1000); // rajada central mira o alvo: ofusca
    // anda dentro da poça: só 75% do passo vale
    const pool = propsOf(w).find((p) => p.kind === 'pool' && Math.abs(p.x - 90) < 1)!;
    expect(pool).toBeTruthy();
    f.state = 'idle'; f.x = pool.x - 6; f.y = pool.y; tick(w, 1 / 60);
    const xa = f.x; f.x += 4; tick(w, 1 / 60);
    expect(f.x - xa).toBeCloseTo(3, 1);
  });

  it('avanço sambando: aviso de faixa e atravessa a linha batendo', () => {
    const w = world(); const f = fighter(w, 100); const z = boss(w, 220, ['spin', 'stomp', 'rain']);
    tick(w, 1 / 60);
    expect(z.mv).toBe('dash');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'lane')).toBe(true);
    until(w, () => z.state !== 'attack', 3);
    expect(z.x).toBeLessThan(150);
    expect(f.hp).toBeLessThan(1000);
  });

  it('fúria a 50%: anima a fúria e chama a ala (2 Malandros)', () => {
    const w = world(); fighter(w, 40); const z = boss(w, 260, ['spin', 'stomp', 'rain', 'dash']);
    damageZ(w, z, 1800, 1);
    expect(z.fury).toBe(true); expect(z.form).toBe('furia'); expect(z.state).toBe('rage');
    until(w, () => z.mv === 'summon', 2);
    until(w, () => w.zs.filter((o) => o.kind === 'malandro').length > 0, 2);
    expect(w.zs.filter((o) => o.kind === 'malandro').length).toBe(2);
    expect(z.alaN).toBe(1);
    // ala caiu: chama mais uma vez (no máximo 2)
    for (const o of w.zs) if (o.kind === 'malandro') o.dead = true;
    z.mcd.summon = 0; z.state = 'walk'; z.cd = 0;
    until(w, () => z.alaN === 2, 4);
    expect(w.zs.filter((o) => o.kind === 'malandro' && !o.dead).length).toBe(2);
  });
});
