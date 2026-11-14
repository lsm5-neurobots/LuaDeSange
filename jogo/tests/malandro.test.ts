// Zumbi Malandro (variante local da Lapa): ginga só de frente, aberto depois da rasteira, rasteira derruba,
// chapéu bumerangue (vai e volta) — mundo mínimo, sem arte (a factory só é usada pra desenhar).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { ZOMBIES } from '../src/data/zombies';
import { GINGA_CD, OPEN_MUL, malandroGuard, rasteiraHit } from '../src/expedition/ai/malandro';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(10, { hit: [3, 5, 8], reach: 36 }), backhand: anim(7, { hit: 3, reach: 38 }),
    rasteira: anim(9, { hit: 5, reach: 44 }), ginga: anim(7), hatThrow: anim(10, { throwAt: 3, catchAt: 8, reach: 84 }), open: anim(8),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8), tumble: anim(4), grabbed: anim(4), xHat: anim(4, { prop: true }),
  },
};

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'lapa', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { malandro: { ...ZOMBIES.malandro, id: 'malandro', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function mal(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const K = (w.zk as any).malandro;
  const z: any = { uid: ++(w as any).uid, kind: 'malandro', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Malandro', () => {
  it('tem IA, defesa e arte próprias (nada do Percussionista)', () => {
    expect(REGISTRY.malandro).toBeTruthy();
    expect(REGISTRY.malandro).not.toBe(REGISTRY.percussionista);
    expect(GUARDS.malandro).toBe(malandroGuard);
    expect(ZOMBIES.malandro.art).toBe('MALANDRO');
    expect(ZOMBIES.malandro.ai).toBe('malandro');
    expect(ZOMBIES.malandro.mapa).toBe('lapa');
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/malandro.js'), 'utf8');
    expect(src).toMatch(/const MALANDRO=/);
    expect(src).not.toMatch(/PERCUSSIONISTA|surdo|baqueta|drawDrum|STUB/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'rasteira', 'ginga', 'hatThrow', 'open', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xHat']) expect(src).toContain(a + ':{');
  });

  it('ginga: esquiva golpe de FRENTE (sem dano) e nunca de costas', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    const w = world(); const z = mal(w); // olha pra esquerda
    const frente = fighter(w, 170), costas = fighter(w, 230);
    damageZ(w, z, 40, 1, costas);
    expect(z.hp).toBe(960);
    expect(z.state).not.toBe('ginga');
    damageZ(w, z, 40, 1, frente);
    expect(z.hp).toBe(960);
    expect(z.state).toBe('ginga');
  });

  it('ginga tem recarga e chance (golpe de frente com sorteio alto acerta)', () => {
    const w = world(); const z = mal(w); const f = fighter(w, 170);
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    damageZ(w, z, 40, 1, f); expect(z.state).toBe('ginga');
    z.state = 'chase'; z.anim = 'walk';
    damageZ(w, z, 40, 1, f); expect(z.hp).toBe(960); // dentro da recarga: acerta
    w.clock += GINGA_CD + 0.1;
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    damageZ(w, z, 40, 1, f); expect(z.hp).toBe(920); // sorteio alto: acerta
  });

  it('não ginga no meio do golpe', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    const w = world(); const z = mal(w); const f = fighter(w, 170);
    z.state = 'attack'; z.anim = 'attack';
    damageZ(w, z, 40, 1, f);
    expect(z.hp).toBe(960);
  });

  it('rasteira derruba quem está na faixa da frente e deixa o Malandro ABERTO (sem ginga, +30% de dano)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    const w = world(); const z = mal(w); const a = fighter(w, 170), b = fighter(w, 120), c = fighter(w, 230);
    const hit = rasteiraHit(w, z);
    expect(hit).toEqual([a]);
    expect(a.hp).toBeLessThan(5000);
    expect(['kd', 'stun']).toContain(a.state);
    expect(b.hp).toBe(5000); expect(c.hp).toBe(5000);
    // fim da rasteira pela IA -> estado aberto
    z.state = 'attack'; z.anim = 'rasteira'; z.move = 'rasteira'; z.fi = 8; z.acc = 99; z.done = false;
    tick(w, 2);
    expect(z.state).toBe('open');
    expect(z.openT).toBeGreaterThan(1.5);
    const hp0 = z.hp;
    damageZ(w, z, 40, 1, fighter(w, 180));
    expect(hp0 - z.hp).toBe(Math.round(40 * OPEN_MUL)); // de frente, mas aberto: não esquiva
  });

  it('chapéu bumerangue: vai, acerta, volta e some do palco', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const z = mal(w, 200); const f = fighter(w, 140); // 60 px: só o chapéu alcança
    let threw = false, maxA = 0, hpEnd = -1;
    tick(w, 150, 1 / 60, () => { f.x = 140; f.y = 178; if (z.anim === 'hatThrow') threw = true; const n = w.actors!.length; if (maxA && !n && hpEnd < 0) hpEnd = f.hp; maxA = Math.max(maxA, n); });
    expect(threw).toBe(true);
    expect(maxA).toBe(1);
    expect(hpEnd).toBeGreaterThan(0);
    expect(hpEnd).toBeLessThan(5000); // o chapéu acertou (ida e/ou volta), no máximo 2 vezes
    expect(5000 - hpEnd).toBeLessThanOrEqual(ZOMBIES.malandro.dmg * 0.6 * 2 * 1.5);
    expect(w.actors!.length).toBe(0);
  });
});
