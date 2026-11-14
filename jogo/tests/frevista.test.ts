// Zumbi Frevista (Olinda): giro da sombrinha rebate 1 tiro de frente (60% volta), beam/costas/fechada passam;
// zigue-zague na aproximação; tesoura passa por trás e termina de costas com janela de +25%; borda; derruba só plenilunar.
// Mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES: o orquestrador registra depois).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { ZCtx } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { ARM } from '../src/expedition/fighter';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import {
  frevista, frevistaGuard, tickReb, canTesoura, twirlGuarding, MOVES, REFLECT_MUL, OPEN_MUL, OPEN_T, ZZ_AMP, EDGE,
} from '../src/expedition/ai/frevista';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: (i: number) => (extra.durs ? extra.durs[i] : 100), ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), attack: anim(9, { hit: 4, reach: 34 }),
    twirl: anim(8, { hit: [3, 5], reach: 40, guard: [1, 6], durs: [180, 110, 120, 110, 120, 110, 130, 150] }),
    tesoura: anim(8, { hit: 3, reach: 52, slide: [2, 4], durs: [130, 130, 90, 90, 100, 140, 150, 150] }),
    open: anim(8, { durs: [120, 130, 140, 140, 140, 130, 120, 120] }), hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(5), death: anim(8),
    tumble: anim(4), grabbed: anim(4),
  },
};
const K: any = { id: 'frevista', nome: 'Zumbi Frevista', ai: 'frevista', art: 'FREVISTA', hp: 65, dmg: 11, xp: 7, ax: 98, G: 172, top: 118, w: 16, F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'olinda', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], beams: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { frevista: K };
  return w as World;
}
function fighter(w: World, x: number, y = 178, tipo = 'melee'): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function frev(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'frevista', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
/** um passo da IA (mesmo contrato do updateZombie, sem o REGISTRY; chase simples que mira a faixa do alvo) */
function upd(w: World, z: Zombie, V: Fighter, dt: number): void {
  if (z.dead) return;
  const dx = V.x - z.x, dy = V.y - z.y;
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy,
    step: (wf) => stepAnim(z, z.K.F.ANIMS[z.anim], dt, wf ? (_e, fi) => frevista.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; z.y += Math.sign(dy) * Math.min(Math.abs(dy), spd * 0.6 * dt); z.face = (Math.sign(dx) || z.face) as 1 | -1; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  frevista.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); upd(w, z, V, dt); } };
/** bala de `f` encostando no zumbi (como em updateBullets: damageZ antes de marcar done) */
function shot(w: World, z: Zombie, f: Fighter, dmg: number): void {
  const p: any = { kind: 'bullet', t: 0, d: 1, x0: f.x, y0: f.y - 52, x1: 0, y1: 0, x: z.x - Math.sign(z.x - f.x) * 6, y: f.y - 52, ly: f.y, vx: Math.sign(z.x - f.x) * 430, dmg, range: 300, from: f };
  w.proj.push(p); damageZ(w, z, dmg, 1, f); p.done = true; w.proj = w.proj.filter((q: any) => !q.done);
}

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Frevista', () => {
  it('arte própria, com o kit da ficha', () => {
    expect(GUARDS['frevista' as keyof typeof GUARDS]).toBe(frevistaGuard);
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/frevista.js'), 'utf8');
    expect(src).toMatch(/const FREVISTA=\(function\(\)/);
    expect(src).not.toMatch(/stub: arte/);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'twirl', 'tesoura', 'open', 'hurt', 'hurtB', 'fall', 'getup', 'death']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/guard:\[1,6\]/);
    expect(src).toMatch(/slide:\[2,4\]/);
    expect(MOVES.map((m) => m.anim)).toEqual(['attack', 'twirl', 'tesoura']);
  });

  it('IA-40: giro aberto rebate 1 tiro de frente (60% volta pro atirador); o 2º no mesmo giro passa', () => {
    const w = world(); const z = frev(w, 200); const g = fighter(w, 90, 178, 'pistola');
    z.state = 'attack'; z.anim = 'twirl'; z.fi = 3; z.face = -1;
    expect(twirlGuarding(z)).toBe(true);
    shot(w, z, g, 30);
    expect(z.hp).toBe(1000);
    expect(w.actors!.length).toBe(1);
    for (let i = 0; i < 60; i++) tickReb(w, z, 1 / 60);
    expect(5000 - g.hp).toBeCloseTo(30 * REFLECT_MUL * ARM(g), 5);
    expect(w.actors!.length).toBe(0);
    shot(w, z, g, 30); // limite 1 por giro
    expect(1000 - z.hp).toBe(30);
  });

  it('IA-40: beam/laser, por trás, corpo a corpo e sombrinha fechada (quadros 1 e 8) levam dano normal', () => {
    const w = world(); const z = frev(w, 200); z.state = 'attack'; z.anim = 'twirl'; z.fi = 3; z.face = -1;
    const laser = fighter(w, 90, 178, 'beam'); damageZ(w, z, 30, 3, laser); expect(1000 - z.hp).toBe(30);
    const atras = fighter(w, 320, 178, 'pistola'); let h = z.hp; shot(w, z, atras, 30); expect(h - z.hp).toBe(30);
    const melee = fighter(w, 180); h = z.hp; damageZ(w, z, 30, 1, melee); expect(h - z.hp).toBe(30);
    const g = fighter(w, 90, 178, 'pistola');
    for (const fi of [0, 7]) { z.fi = fi; z.reflected = false; h = z.hp; shot(w, z, g, 30); expect(h - z.hp).toBe(30); }
  });

  it('IA-40: janela do giro ~0,7 s (1,2x no enluarado)', () => {
    const win = (form: string) => {
      const w = world(); const z = frev(w, 200, 178, form); const f = fighter(w, 180);
      z.state = 'attack'; z.anim = 'twirl'; z.fi = 0; z.acc = 0; z.done = false;
      let t = 0; for (let i = 0; i < 400 && z.state === 'attack'; i++) { if (twirlGuarding(z)) t += 1 / 120; f.x = 180; upd(w, z, f, 1 / 120); }
      return t;
    };
    const tc = win('comum'), te = win('enluarado');
    expect(tc).toBeGreaterThan(0.66); expect(tc).toBeLessThan(0.74);
    expect(te / tc).toBeCloseTo(1.2, 1);
  });

  it('IA-40: tiro vindo de longe faz abrir o giro na direção do atirador', () => {
    const w = world(); const z = frev(w, 200); const f = fighter(w, 60, 178, 'pistola');
    w.proj.push({ kind: 'bullet', t: 0, d: 1, x0: 90, y0: 126, x1: 0, y1: 0, x: 100, y: 126, ly: 178, vx: 430, dmg: 20, range: 300, from: f } as any);
    run(w, z, f, 1);
    expect(z.state).toBe('attack'); expect(z.anim).toBe('twirl'); expect(z.face).toBe(-1);
  });

  it('IA-41: na aproximação troca de faixa ±8 px a cada 0,6 s; perto não zigue-zagueia', () => {
    const w = world(); const z = frev(w, 360); const f = fighter(w, 40);
    let lo = 0, hi = 0;
    run(w, z, f, 240, 1 / 60, () => { f.x = Math.min(f.x, z.x - 160); const d = z.y - f.y; lo = Math.min(lo, d); hi = Math.max(hi, d); });
    expect(hi).toBeGreaterThan(ZZ_AMP - 1.5); expect(lo).toBeLessThan(-(ZZ_AMP - 1.5));
    expect(Math.max(hi, -lo)).toBeLessThanOrEqual(ZZ_AMP + 0.01);
  });

  it('IA-42: tesoura passa por trás do alvo, acerta 0,8x e termina de costas com +25% por ~1 s', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // pickMove escolhe o último válido (tesoura)
    const w = world(); const z = frev(w, 200); const f = fighter(w, 160);
    (z as any)._mv = { mcd: { attack: 99, twirl: 99 }, mhist: [] };
    let sawLane = false, openAt = -1;
    run(w, z, f, 80, 1 / 60, () => { f.x = 160; f.y = 178; if (w.warns.some((t) => t.kind === 'lane' && t.owner === z)) sawLane = true; if (openAt < 0 && z.state === 'open') openAt = w.clock; });
    expect(sawLane).toBe(true);
    expect(openAt).toBeGreaterThan(0);
    expect(z.x).toBeLessThan(f.x - 10); // passou pro outro lado
    expect(5000 - f.hp).toBeCloseTo(11 * 0.8 * ARM(f), 5);
    expect(f.state).not.toBe('kd');
    // de costas e frágil
    expect(z.state).toBe('open'); expect(z.face).toBe(-1);
    const h = z.hp; damageZ(w, z, 40, 1, f); expect(h - z.hp).toBe(Math.round(40 * OPEN_MUL));
    // a janela dura ~1 s
    const w2 = world(); const z2 = frev(w2, 200); const f2 = fighter(w2, 260); z2.state = 'open'; z2.anim = 'open'; (z2 as any).openT = OPEN_T;
    let t = 0; while (z2.state === 'open' && t < 3) { run(w2, z2, f2, 1); t += 1 / 60; }
    expect(t).toBeGreaterThan(OPEN_T - 0.05); expect(t).toBeLessThan(OPEN_T + 0.1);
  });

  it('IA-42: sem tesoura a menos de 20 px da borda; plenilunar derruba', () => {
    const w = world(); const z = frev(w, 60); const f = fighter(w, 20);
    expect(canTesoura(w, z, f)).toBe(false); // chegaria em x = -4
    expect(canTesoura(w, frev(w, 200), fighter(w, 160))).toBe(true);
    expect(EDGE).toBe(20);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w2 = world(); const zp = frev(w2, 200, 178, 'plenilunar'); const f2 = fighter(w2, 160);
    (zp as any)._mv = { mcd: { attack: 99, twirl: 99 }, mhist: [] };
    run(w2, zp, f2, 120);
    expect(f2.state).toBe('kd');
    expect(f2.hp).toBeLessThan(5000);
  });
});
