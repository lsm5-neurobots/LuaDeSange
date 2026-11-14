// Tuiuiú Zumbi (Pantanal): alvo aéreo no rasante (imune a corpo a corpo de solo), pouso esparramado (+30%),
// projétil na cabeça (+20%), bicada longa que perfura (ignora 50% da redução) e faz sangrar, rasante só a 120–280 px,
// fuga voando quando ferido. Mundo mínimo e factory falsa (só ANIMS); não depende de ZOMBIES nem do registro oficial.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { ARM } from '../src/expedition/fighter';
import {
  tuiuiu, tuiuiuGuard, isFlying, lungeHit, diveStep, tickBleed, diveTarget,
  LAND_MUL, PROJ_MUL, PIERCE, BLEED_T, BLEED_FRAC, DIVE_PUSH, DIVE_MAX,
} from '../src/expedition/ai/tuiuiu';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(9, { hit: 4, reach: 40 }), lunge: anim(8, { hit: 4, reach: 100 }),
    dive: anim(10, { fly: [4, 8], land: 9, reach: 280, z: [0, 0, 0, 6, 26, 32, 33, 31, 20, 0] }), land: anim(5, { dur: () => 160 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8), tumble: anim(4), grabbed: anim(4),
  },
};
const DEF = { nome: 'Tuiuiú Zumbi', art: 'TUIUIU', ax: 92, G: 158, top: 118, w: 16, hp: 70, dmg: 14, ai: 'tuiuiu', mapa: 'futuro', xp: 9, desc: '' };

if (!(REGISTRY as any).tuiuiu) (REGISTRY as any).tuiuiu = tuiuiu; // o orquestrador registra de verdade depois

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pantanal', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], beams: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} }, TWEEN: { track: (a: number[], fi: number) => a[Math.min(fi, a.length - 1)] } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { tuiuiu: { ...DEF, id: 'tuiuiu', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178, lv = 5): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function bird(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const K = (w.zk as any).tuiuiu;
  const z: any = { uid: ++(w as any).uid, kind: 'tuiuiu', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };
const flying = (z: Zombie, fi = 5) => { z.state = 'attack'; z.anim = 'dive'; z.fi = fi; z.z = 30; };

afterEach(() => vi.restoreAllMocks());

describe('Tuiuiú Zumbi', () => {
  it('arte própria de ave com as animações da ficha (sem stub)', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/tuiuiu.js'), 'utf8');
    expect(src).toMatch(/const TUIUIU=\(function\(\)/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'attack', 'lunge', 'dive', 'land', 'hurt', 'hurtB', 'fall', 'getup', 'death']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/ZREACT\.add/); // tumble + grabbed
    expect(src).toMatch(/blood:\[/); expect(src).toMatch(/acid:\[/);
    expect((GUARDS as any).tuiuiu).toBe(tuiuiuGuard);
  });

  it('no voo: imune a corpo a corpo de solo; projétil acerta (+20%) e não derruba do voo', () => {
    const w = world(); const z = bird(w); flying(z);
    expect(isFlying(z)).toBe(true);
    const melee = fighter(w, 180);
    damageZ(w, z, 50, 3, melee);
    expect(z.hp).toBe(1000);
    const gun = fighter(w, 60); gun.w = { tipo: 'pistola' } as any;
    w.proj.push({ kind: 'bullet', t: 0, d: 1, x0: 0, y0: 0, x1: 0, y1: 0, x: 198, y: 120, ly: 178, vx: 430, dmg: 50, range: 100, from: gun } as any);
    damageZ(w, z, 50, 1, gun);
    expect(z.hp).toBe(1000 - Math.round(50 * PROJ_MUL));
    expect(z.state).toBe('attack'); expect(z.anim).toBe('dive'); // continua voando
    const jumper = fighter(w, 190); jumper.z = 24; // golpe de cima
    damageZ(w, z, 40, 1, jumper);
    expect(z.hp).toBe(1000 - 60 - 40);
  });

  it('pousado e esparramado leva +30%; no chão o corpo a corpo acerta normal', () => {
    const w = world(); const z = bird(w); const f = fighter(w, 180);
    damageZ(w, z, 40, 1, f); expect(z.hp).toBe(960);
    z.landT = 0.5;
    damageZ(w, z, 40, 1, f); expect(z.hp).toBe(960 - Math.round(40 * LAND_MUL));
  });

  it('bicada longa: faixa fina, perfura metade da redução de dano e faz sangrar 3 s', () => {
    const w = world(); const z = bird(w, 200); z._lx0 = 200;
    const a = fighter(w, 120, 178, 11), b = fighter(w, 140, 190), c = fighter(w, 60);
    const hit = lungeHit(w, z);
    expect(hit).toEqual([a]);
    const arm = ARM(a), exp = 14 * 1.3 * (1 - (1 - arm) * PIERCE);
    expect(5000 - a.hp).toBeCloseTo(exp, 5);
    expect(5000 - a.hp).toBeGreaterThan(14 * 1.3 * arm); // mais do que um golpe normal
    expect(b.hp).toBe(5000); expect(c.hp).toBe(5000);
    expect(a._bleed).toBeTruthy();
    const hp0 = a.hp;
    for (let i = 0; i < 200; i++) { w.clock += 1 / 60; tickBleed(w, 1 / 60); }
    expect(a._bleed).toBeFalsy();
    expect(hp0 - a.hp).toBeGreaterThanOrEqual(Math.floor(14 * BLEED_FRAC) - 1);
    expect(hp0 - a.hp).toBeLessThanOrEqual(Math.ceil(14 * BLEED_FRAC));
    expect(BLEED_T).toBe(3);
  });

  it('rasante: acerta e empurra quem cruza a faixa de 24 px; fora dela passa batido', () => {
    const w = world(); const z = bird(w, 300); z.face = -1;
    const a = fighter(w, 200, 178), b = fighter(w, 220, 198);
    z.state = 'attack'; z.anim = 'dive'; z.fi = 4;
    z._dive = { x0: 300, x1: 100, y: 178, t: 0, T: 0.5, hit: new Set(), flee: false };
    let hits: Fighter[] = [];
    for (let i = 0; i < 40; i++) hits = hits.concat(diveStep(w, z, 1 / 60));
    expect(hits).toEqual([a]);
    expect(a.hp).toBeLessThan(5000); expect(b.hp).toBe(5000);
    expect(a.x).toBeLessThanOrEqual(200 - DIVE_PUSH); // empurrão do rasante (+ recuo da reação do hurtF)
    expect(z.x).toBeCloseTo(100, 5);
    expect(diveTarget(w, z, 400, -1)).toBeGreaterThanOrEqual(w.cam + 14);
    expect(Math.abs(diveTarget(w, bird(w, 200), 600, -1) - 200)).toBeLessThanOrEqual(DIVE_MAX);
  });

  it('fluxo: com o alvo a ~200 px decola (alvo aéreo, z>0), acerta no voo e pousa esparramado', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = bird(w, 330); const f = fighter(w, 130);
    let sawFly = false, sawLanded = false, maxZ = 0;
    tick(w, 240, 1 / 60, () => { f.x = 130; f.y = 178; if (isFlying(z)) sawFly = true; maxZ = Math.max(maxZ, z.z || 0); if (z.state === 'landed') sawLanded = true; });
    expect(sawFly).toBe(true);
    expect(maxZ).toBeGreaterThan(24); // acima do alcance vertical do corpo a corpo de solo
    expect(sawLanded).toBe(true);
    expect(f.hp).toBeLessThan(5000);
  });

  it('rasante só a 120–280 px: colado no alvo nunca decola', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = bird(w, 200); const f = fighter(w, 170);
    let dove = false;
    tick(w, 600, 1 / 60, () => { f.x = 170; f.y = 178; f.hp = 5000; f.state = 'idle'; if (z.anim === 'dive') dove = true; });
    expect(dove).toBe(false);
  });

  it('ferido (< 40%) foge voando pra longe sem dano e depois o rasante fica pronto', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = bird(w, 200); const f = fighter(w, 170);
    z.hp = 300; (z._mv ??= { mcd: { dive: 5 }, mhist: [] });
    let fled = false, maxX = 0, cdAfter = -1, hpFled = -1;
    tick(w, 150, 1 / 60, () => {
      f.x = 170; f.y = 178;
      if (z._dive?.flee) { fled = true; maxX = Math.max(maxX, z.x); }
      if (fled && z.state === 'cool' && cdAfter < 0) { cdAfter = z._mv.mcd.dive ?? 0; hpFled = f.hp; }
    });
    expect(fled).toBe(true);
    expect(maxX).toBeGreaterThan(330);
    expect(z._fled).toBe(true);
    expect(cdAfter).toBe(0);
    expect(hpFled).toBe(5000); // a fuga não bate em ninguém
  });
});
