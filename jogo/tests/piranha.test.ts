// Cardume de Piranhas (Amazônia): só nada na água (poça própria ou w.water), mordida com sangramento que acumula
// até 3, salto de até 70 px que encalha fora d'água, frenesi com lutador sangrando, fraqueza encalhada (×2) e em área
// (×2,5). Mundo mínimo e factory falsa (só ANIMS); não depende de ZOMBIES nem do registro oficial.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import {
  piranha, piranhaGuard, inWater, clampToWater, makePond, applyBleed, tickBleed, leapTarget, beach, biteCd, fishOf,
  BEACH_MUL, AREA_MUL, BLEED_MAX, LEAP_MAX, FRENZY_T, POND_RX,
} from '../src/expedition/ai/piranha';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(6), walk: anim(8), alert: anim(5), bite: anim(7, { hit: 3, reach: 40 }),
    leap: anim(9, { hit: 4, hits3: [4, 5, 6], air: [1, 6], land: 7, reach: 46, z: [0, 2, 10, 16, 20, 18, 10, 2, 0] }),
    frenzy: anim(6, { dur: () => 70 }), beached: anim(6), hurt: anim(3), hurtB: anim(3), fall: anim(4), getup: anim(4), death: anim(6),
    tumble: anim(4), grabbed: anim(4),
  },
};
const DEF = { nome: 'Cardume de Piranhas', art: 'PIRANHA', ax: 100, G: 102, top: 40, w: 44, hp: 75, dmg: 7, ai: 'piranha', mapa: 'amazonia', xp: 9, desc: '' };

if (!(REGISTRY as any).piranha) (REGISTRY as any).piranha = piranha; // o orquestrador registra de verdade depois

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], beams: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} }, TWEEN: { track: (a: number[], fi: number) => a[Math.min(fi, a.length - 1)] } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { piranha: { ...DEF, id: 'piranha', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178, lv = 5): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function shoal(w: World, x = 200, y = 178, form = 'comum', pond = true): Zombie {
  const K = (w.zk as any).piranha;
  if (pond) makePond(w, x, y);
  const z: any = { uid: ++(w as any).uid, kind: 'piranha', K, form, x, y, z: 0, face: -1, hp: 75, maxhp: 75, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };

afterEach(() => vi.restoreAllMocks());

describe('Cardume de Piranhas', () => {
  it('arte própria do cardume com as animações da ficha (sem stub) e defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/piranha.js'), 'utf8');
    expect(src).toMatch(/const PIRANHA=\(function\(\)/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'alert', 'bite', 'leap', 'frenzy', 'beached', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'tumble', 'grabbed', 'xPond']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/blood:\[/); expect(src).toMatch(/acid:\[/);
    expect(src).toMatch(/COUNT=\{comum:3, enluarado:5, plenilunar:4\}/);
    expect((GUARDS as any).piranha).toBe(piranhaGuard);
    expect([fishOf({ form: 'comum' } as any), fishOf({ form: 'enluarado' } as any), fishOf({ form: 'plenilunar' } as any)]).toEqual([3, 5, 4]);
    expect(biteCd({ form: 'enluarado' } as any)).toBeLessThan(biteCd({ form: 'comum' } as any)); // mais peixes, mais mordidas
  });

  it('spawn cria a poça na tela e o cardume nasce emergindo dentro dela', () => {
    const w = world();
    const s = piranha.spawn!(w, 0, false);
    expect(s.state).toBe('emerge');
    expect(inWater(w, s.x, s.y)).toBe(true);
    expect(s.x - POND_RX).toBeGreaterThanOrEqual(w.cam);
    expect(s.x + POND_RX).toBeLessThanOrEqual(w.cam + w.W);
    expect(w.actors!.length).toBe(1); // poça desenhada como ator de chão
    const s2 = piranha.spawn!(w, 1, false);
    expect(Math.abs(s2.x - s.x)).toBeGreaterThan(POND_RX); // 2º cardume, outra poça
  });

  it('nunca sai da água perseguindo um alvo em terra: espera na borda', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = shoal(w, 250, 178); const f = fighter(w, 60, 178);
    let out = false;
    tick(w, 400, 1 / 60, () => { f.x = 60; f.y = 178; if (z.state !== 'attack' && z.state !== 'beached' && !inWater(w, z.x, z.y)) out = true; });
    expect(out).toBe(false);
    expect(z.x).toBeLessThan(250 - POND_RX * 0.8); // encostou na borda do lado do alvo
  });

  it('mordida: 0,6× do dano e SANGRAMENTO que acumula até 3; o sangramento não mata', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const w = world(); const z = shoal(w, 200, 178); const f = fighter(w, 175, 178, 1);
    let sawBite = false;
    tick(w, 90, 1 / 60, () => { f.x = 175; f.y = 178; f.state = 'idle'; if (z.anim === 'bite') sawBite = true; });
    expect(sawBite).toBe(true);
    expect(f._pirBleed?.st?.length).toBeGreaterThanOrEqual(1);
    const g = fighter(w, 0); for (let i = 0; i < 5; i++) applyBleed(w, g, z);
    expect(g._pirBleed.st.length).toBe(BLEED_MAX);
    g.hp = 3;
    for (let i = 0; i < 400; i++) { w.clock += 1 / 60; tickBleed(w, 1 / 60); }
    expect(g.hp).toBe(1); expect(g._pirBleed).toBeFalsy();
  });

  it('salto: queda a no máximo 70 px; caindo fora da água ENCALHA e leva ×2', () => {
    const w = world(); const z = shoal(w, 200, 178);
    const t = leapTarget(w, z, { x: 20, y: 178 });
    expect(200 - t.x).toBeLessThanOrEqual(LEAP_MAX);
    // força um salto até a terra: a poça vai de 142 a 258
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const f = fighter(w, 130, 178);
    let beached = false;
    tick(w, 240, 1 / 60, () => { f.x = 130; f.y = 178; f.state = 'idle'; if (z.state === 'beached') beached = true; });
    expect(beached || z.anim === 'leap' || (z._mv?.mcd?.leap ?? 0) > 0).toBe(true);
    // fraqueza: encalhado leva ×2
    const w2 = world(); const z2 = shoal(w2, 200, 178); const by = fighter(w2, 180);
    beach(w2, z2);
    damageZ(w2, z2, 10, 1, by);
    expect(z2.hp).toBe(75 - 10 * BEACH_MUL);
  });

  it('encalhado não ataca e depois de 2 s volta se arrastando pra água', () => {
    const w = world(); const z = shoal(w, 200, 178); const f = fighter(w, 380, 178);
    z.x = 275; beach(w, z);
    expect(inWater(w, z.x, z.y)).toBe(false);
    let attackedBeached = false, back = false;
    tick(w, 60 * 5, 1 / 60, () => { f.x = 380; if (w.clock < 2 && z.state !== 'beached') attackedBeached = true; if (inWater(w, z.x, z.y)) back = true; });
    expect(attackedBeached).toBe(false);
    expect(back).toBe(true);
    expect(f.hp).toBe(5000);
  });

  it('golpe em área (especial em andamento ou laser) leva ×2,5', () => {
    const w = world(); const z = shoal(w); const f = fighter(w, 180);
    damageZ(w, z, 10, 1, f); expect(z.hp).toBe(65);
    (f as any).gr = { id: 'meia_lua' };
    damageZ(w, z, 10, 3, f); expect(z.hp).toBe(65 - 10 * AREA_MUL);
  });

  it('frenesi: com lutador sangrando perto, olhos brilham e ganha velocidade por 4 s', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const w = world(); const z = shoal(w, 200, 178); const f = fighter(w, 120, 178);
    applyBleed(w, f, z);
    let sawFrenzy = false, maxT = 0;
    tick(w, 60, 1 / 60, () => { f.x = 120; if (z.state === 'frenzy') sawFrenzy = true; maxT = Math.max(maxT, z.frenzyT ?? 0); });
    expect(sawFrenzy).toBe(true);
    expect(maxT).toBeGreaterThan(FRENZY_T - 0.5);
  });

  it('clampToWater projeta na borda da poça mais perto', () => {
    const w = world(); makePond(w, 200, 178);
    const p = clampToWater(w, 20, 178);
    expect(inWater(w, p.x, p.y)).toBe(true);
    expect(p.x).toBeLessThan(150);
  });
});
