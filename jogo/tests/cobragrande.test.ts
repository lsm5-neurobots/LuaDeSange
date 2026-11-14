// A Cobra-Grande (chefe da Amazônia): bote com aviso (errar = cabeça atolada, VULNERÁVEL), constrição que PRENDE e
// que os aliados soltam batendo no corpo (TONTA), cauda varrendo que DERRUBA, mergulho invulnerável com bolhas que
// seguem o alvo e ataque por baixo (VULNERÁVEL depois; fúria = 2 mergulhos), Olhar de Lua só na fúria.
// Mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES) e arte fake com os campos de evento de art-src/zombies/cobragrande.js.
import { describe, it, expect } from 'vitest';
import { damageZ } from '../src/expedition/combat';
import { cobragrande, CG } from '../src/expedition/ai/cobragrande';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), intro: anim(16), hurt: anim(4), rage: anim(10), death: anim(16), dazed: anim(8), stuck: anim(8),
    strike: anim(12, { warn: [0, 1, 2, 3, 4], hit: 7, lunge: [5, 6, 7], reach: 148 }),
    coil: anim(14, { warn: [0, 1, 2, 3], throwAt: 4, squeeze: [6, 11], reach: 86 }),
    tail: anim(10, { warn: [0, 1, 2, 3], hit: 5 }),
    dive: anim(10, { goneAt: 8 }), surge: anim(10, { hit: 2 }),
    gaze: anim(10, { warn: [0, 1, 2, 3, 4, 5], hit: 6 }),
    xCoilB: anim(2, { prop: true }), xCoilF: anim(2, { prop: true }), xRipple: anim(3, { prop: true }), xMoon: anim(3, { prop: true }),
  },
};
const DEF = { nome: 'A Cobra-Grande', art: null, ax: 268, G: 408, top: 270, w: 70, hp: 7800, dmg: 42, boss: 'chefe', ai: 'cobragrande', mapa: 'amazonia', xp: 460, desc: '' };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { esquiva: 0 } }, mode: 'noite', phase: 'fight', cam: 0, W: 384, clock: 0, ai: 0,
    fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], pools: [], actors: [], items: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { cobragrande: { ...DEF, id: 'cobragrande', F } };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 1 }, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function boss(w: World, x = 220, block: string[] = []): Zombie {
  const z: any = { uid: ++w.uid, kind: 'cobragrande', K: (w.zk as any).cobragrande, form: 'normal', x, y: 178, z: 0, face: -1, hp: 7800, maxhp: 7800, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0, mcd: { dive: 0, coil: 0, gaze: 0 } };
  for (const b of block) z.mcd[b] = 999;
  w.zs.push(z); w.boss = z; return z;
}
function stepZ(w: World, z: Zombie, dt: number): void {
  const alive = w.fs.filter((f) => !f.down);
  const V = alive.sort((a, b) => Math.abs(a.x - z.x) - Math.abs(b.x - z.x))[0] ?? w.fs[0];
  const A = z.K.F.ANIMS;
  const c: ZCtx = { w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, A[z.anim], dt, wf ? (_e, fi) => cobragrande.onFrame!(c, fi) : undefined), chase() {} };
  z.cd = Math.max(0, z.cd - dt);
  cobragrande.update(c);
}
function stepF(w: World, dt: number): void { for (const f of w.fs) if (f.state === 'stun') { f.stunT -= dt; if (f.stunT <= 0) f.state = 'idle'; } }
const tick = (w: World, z: Zombie, s: number, dt = 1 / 60) => { for (let i = 0; i < Math.round(s / dt); i++) { w.clock += dt; stepF(w, dt); stepZ(w, z, dt); } };
const until = (w: World, z: Zombie, cond: () => boolean, max = 6, dt = 1 / 60) => { let t = 0; while (!cond() && t < max) { tick(w, z, dt, dt); t += dt; } return t; };

describe('A Cobra-Grande', () => {
  it('surge do rio (intro) e passa a caçar', () => {
    const w = world(); fighter(w, 60);
    const sp = cobragrande.spawn!(w, 0, false);
    expect(sp.state).toBe('intro');
    const z = boss(w, sp.x, ['dive', 'coil', 'strike', 'tail', 'gaze']); z.state = 'intro'; z.anim = 'intro';
    until(w, z, () => z.state !== 'intro', 3);
    expect(z.state).toBe('walk');
  });

  it('bote: faixa de aviso, desliza pra frente e acerta 1,2× empurrando', () => {
    const w = world(); const f = fighter(w, 100); const z = boss(w, 220, ['dive', 'coil', 'tail', 'gaze']);
    tick(w, z, 1 / 60);
    expect(z.mv).toBe('strike');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'lane')).toBe(true);
    const x0 = z.x, fx0 = f.x;
    until(w, z, () => z.state !== 'attack', 3);
    expect(z.x).toBeLessThan(x0 - CG.lunge * 0.7);
    expect(1000 - f.hp).toBeGreaterThan(42 * 1.2 * 0.9);
    expect(f.x).toBeLessThan(fx0 - 10);
    expect(z.state).toBe('walk');
  });

  it('bote que erra: cabeça atolada, VULNERÁVEL (×1,5) por 1,2 s', () => {
    const w = world(); const f = fighter(w, 100); const z = boss(w, 220, ['dive', 'coil', 'tail', 'gaze']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('strike');
    f.y = 140; // sai da faixa
    until(w, z, () => z.state === 'stuck', 3);
    expect(z.state).toBe('stuck'); expect(f.hp).toBe(1000); expect(z.vuln).toBe(true);
    const h0 = z.hp; damageZ(w, z, 100, 1); expect(h0 - z.hp).toBe(150);
    tick(w, z, 1.0); expect(z.state).toBe('stuck');
    tick(w, z, 0.3); expect(z.state).not.toBe('stuck'); expect(z.vuln).toBe(false);
  });

  it('constrição: PRENDE o alvo, aperta em ticks e os aliados soltam batendo no corpo (TONTA ×1,6)', () => {
    const w = world(); const a = fighter(w, 120, 178); const b = fighter(w, 40, 210); const z = boss(w, 230, ['dive', 'strike', 'tail', 'gaze']);
    // a está mais isolado? b está longe dela; força o alvo mais isolado entre os dois em alcance
    tick(w, z, 1 / 60);
    expect(z.mv).toBe('coil');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'circle' && t.r === CG.coilR)).toBe(true);
    until(w, z, () => !!z.prey, 2);
    const p = z.prey as Fighter; expect(p).toBe(a);
    expect(p.state).toBe('stun'); expect(w.actors!.length).toBe(2);
    expect(Math.abs(p.x - z.x)).toBeCloseTo(CG.coilAt, 0);
    const hp0 = p.hp; tick(w, z, 1.1); expect(p.hp).toBeLessThan(hp0); expect(p.state).toBe('stun');
    damageZ(w, z, 160, 1, b); // aliado bate no corpo: aperto 150 acaba
    tick(w, z, 1 / 60);
    expect(z.state).toBe('dazed'); expect(z.prey).toBeFalsy(); expect(w.actors!.length).toBe(0);
    const h0 = z.hp; damageZ(w, z, 100, 1); expect(h0 - z.hp).toBe(160);
  });

  it('constrição até o fim: 6 ticks de 0,2× em 3 s e depois fica atolada (VULNERÁVEL)', () => {
    const w = world(); const a = fighter(w, 140); const z = boss(w, 230, ['dive', 'strike', 'tail', 'gaze']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('coil');
    until(w, z, () => !!z.prey, 2); const hp0 = a.hp;
    until(w, z, () => z.state === 'stuck', 4);
    expect(z.state).toBe('stuck'); expect(z.vuln).toBe(true);
    expect(hp0 - a.hp).toBeCloseTo(6 * 42 * 0.2, 0);
  });

  it('constrição que erra: ninguém no círculo, recolhe sem prender', () => {
    const w = world(); const a = fighter(w, 140); const z = boss(w, 230, ['dive', 'strike', 'tail', 'gaze']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('coil');
    a.x = 20; a.y = 210;
    until(w, z, () => z.state !== 'attack', 3);
    expect(z.prey).toBeFalsy(); expect(a.hp).toBe(1000); expect(z.state).toBe('walk');
  });

  it('cauda varrendo: aviso em volta, 1,0× e DERRUBADO em quem estiver no raio', () => {
    const w = world(); const a = fighter(w, 180); const b = fighter(w, 260, 190); const z = boss(w, 220, ['dive', 'coil', 'strike', 'gaze']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('tail');
    expect(w.warns.some((t) => t.owner === z && t.r === CG.tailR)).toBe(true);
    until(w, z, () => a.state === 'stun', 2);
    expect(a.state).toBe('stun'); expect(b.state).toBe('stun');
    expect(1000 - a.hp).toBeGreaterThan(42 * 0.9);
  });

  it('mergulho: invulnerável e fora da tela, bolhas seguem o alvo, círculo e emerge por baixo; VULNERÁVEL depois', () => {
    const w = world(); const f = fighter(w, 40); const z = boss(w, 300, ['coil', 'strike', 'tail', 'gaze']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('dive');
    until(w, z, () => z.state === 'under', 2);
    expect(z.invuln).toBe(true); expect(z.x).toBeLessThan(w.cam);
    const h0 = z.hp; damageZ(w, z, 500, 3); expect(z.hp).toBe(h0);
    expect(w.actors!.length).toBe(1);
    until(w, z, () => w.warns.some((t) => t.owner === z && t.r === CG.diveR), 2);
    f.x = 60; // o lutador continua dentro do círculo (r 40)
    until(w, z, () => z.mv === 'surge', 1);
    expect(z.invuln).toBe(false); expect(Math.abs(z.x - 40)).toBeLessThan(2);
    until(w, z, () => f.state === 'stun', 1);
    expect(1000 - f.hp).toBeGreaterThan(42 * 1.4 * 0.9);
    until(w, z, () => z.state === 'stuck', 2);
    expect(z.vuln).toBe(true);
  });

  it('fúria a 50%: forma furia, Olhar de Lua com 3 círculos que ATORDOAM, e mergulho duplo', () => {
    const w = world(); const fs = [fighter(w, 40), fighter(w, 90, 200), fighter(w, 140, 160)]; const z = boss(w, 330, ['coil', 'strike', 'tail', 'dive']);
    damageZ(w, z, 3950, 1);
    expect(z.fury).toBe(true); expect(z.form).toBe('furia'); expect(z.state).toBe('rage');
    until(w, z, () => z.state !== 'rage', 3);
    z.cd = 0; tick(w, z, 1 / 60);
    expect(z.mv).toBe('gaze');
    expect(w.warns.filter((t) => t.owner === z && t.r === CG.gazeR).length).toBe(3);
    until(w, z, () => fs.every((f) => f.state === 'stun'), 2);
    for (const f of fs) { expect(f.state).toBe('stun'); expect(f.hp).toBeLessThan(1000); }
    // mergulho duplo
    const w2 = world(); fighter(w2, 40); const z2 = boss(w2, 320, ['coil', 'strike', 'tail', 'gaze']); z2.fury = true; z2.form = 'furia';
    tick(w2, z2, 1 / 60); expect(z2.mv).toBe('dive');
    until(w2, z2, () => z2.mv === 'surge', 4); until(w2, z2, () => z2.mv === 'dive', 2);
    expect(z2.second).toBe(true);
    until(w2, z2, () => z2.state === 'stuck', 6); expect(z2.state).toBe('stuck');
  });
});
