// O Rei Jacaré (chefe do Pantanal): mordida com aviso, giro da morte (prende, gira, arremessa, fica ZONZO; outro
// lutador solta), rabada atrás (errou = zonzo), mergulho invulnerável com marcador e emersão (2× na fúria), rugido,
// IA por distância sem repetir golpe, fraquezas (barriga, olho cego). Mundo mínimo; IA chamada direto.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import { reijacare, chooseMove, blindSide, BITE, SPIN, TAIL, DIVE, MOUTH, BELLY_MUL, BLIND_MUL, tailCenter } from '../src/expedition/ai/reijacare';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8, { stomp: [2, 6] }), intro: anim(14), bite: anim(10, { warn: [0, 4], hit: [5, 6] }),
    spin: anim(14, { warn: [0, 3], grab: 4, spin: [5, 11], throw: 12 }), tail: anim(10, { warn: [0, 4], hit: [5, 6] }),
    dive: anim(8, { warn: [0, 2] }), emerge: anim(10, { surge: 3, hit: [4, 5], vuln: [5, 6, 7, 8, 9] }), roar: anim(9, { warn: [0, 4], call: 5 }),
    rage: anim(10), dazed: anim(8, { loop: 1.8 }), hurt: anim(4), fall: anim(6), getup: anim(6), death: anim(14), tumble: anim(4), grabbed: anim(4),
    xAgua: anim(4, { prop: true }), xOnda: anim(3, { prop: true }),
  },
};
const K: any = { nome: 'O Rei Jacaré', art: 'REIJACARE', ax: 258, G: 312, top: 150, w: 64, hp: 9200, dmg: 44, ai: 'reijacare', boss: 'chefe', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pantanal', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [], rings: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} }, zk: {},
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 50000, maxhp: 50000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function rei(w: World, x = 250, y = 178, mcd: any = { bite: 99, spin: 99, tail: 99, dive: 99 }): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'reijacare', K, form: 'normal', x, y, z: 0, face: -1, hp: 9200, maxhp: 9200, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0, mcd };
  w.zs.push(z); w.boss = z; return z;
}
/** passo da IA (cópia mínima do updateZombie: só o que o chefe usa) */
function step(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  if (z.dead) return;
  z.cd = Math.max(0, z.cd - dt);
  const c: ZCtx = {
    w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e, fi) => reijacare.onFrame!(c, fi) : undefined),
    chase: () => c.step(),
  };
  reijacare.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, each?: (i: number) => void) => { for (let i = 0; i < n; i++) { w.clock += 1 / 60; each?.(i); for (const f of w.fs) if (f.state === 'stun') { f.stunT -= 1 / 60; if (f.stunT <= 0) f.state = 'idle'; } step(w, z, V); } };

afterEach(() => vi.restoreAllMocks());

describe('O Rei Jacaré', () => {
  it('arte própria com as animações e eventos da ficha', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/reijacare.js'), 'utf8');
    expect(src).toMatch(/const REIJACARE=\(function/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'intro', 'bite', 'spin', 'tail', 'dive', 'emerge', 'roar', 'rage', 'dazed', 'hurt', 'fall', 'getup', 'death', 'tumble', 'grabbed', 'xAgua', 'xOnda']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/bite:\{[^\n]*n:10,warn:\[0,4\],hit:\[5,6\]/);
    expect(src).toMatch(/spin:\{[^\n]*n:14,warn:\[0,3\],grab:4,spin:\[5,11\],throw:12/);
    expect(src).toMatch(/tail:\{[^\n]*n:10,warn:\[0,4\],hit:\[5,6\]/);
    expect(src).toMatch(/emerge:\{[^\n]*n:10,surge:3,hit:\[4,5\],vuln:\[5,6,7,8,9\]/);
    expect(src).toMatch(/roar:\{[^\n]*n:9,warn:\[0,4\],call:5/);
    expect(src).toMatch(/walk:\{[^\n]*n:8,stomp:\[2,6\]/);
  });

  it('IA-43: golpe pela distância e nunca o mesmo 2×', () => {
    const w = world(); const z = rei(w, 250, 178, {});
    expect(['spin', 'bite']).toContain(chooseMove(z, 60, false));
    expect(['tail', 'bite']).toContain(chooseMove(z, 120, false));
    expect(chooseMove(z, 200, false)).toBe('dive');
    (z as any).lastMv = 'spin'; expect(chooseMove(z, 60, false)).toBe('bite');
    (z as any).lastMv = 'bite'; expect(chooseMove(z, 60, false)).toBe('spin');
    (z as any).lastMv = 'dive'; expect(chooseMove(z, 200, false)).toBeNull();
    (z as any).lastMv = null; expect(chooseMove(z, 60, true)).toBe('tail');
  });

  it('mordida: aviso na boca antes, 1,4× de dano em quem está na frente, poupa quem está atrás', () => {
    const w = world(); const f = fighter(w, 190); const back = fighter(w, 320); const z = rei(w, 250, 178, { bite: 0, spin: 99, tail: 99, dive: 99 });
    let warned = false;
    run(w, z, f, 20, () => { f.x = 190; if (w.warns.some((t) => t.owner === z)) warned = true; });
    expect((z as any).mv).toBe('bite');
    expect(warned).toBe(true);
    const hp = f.hp;
    run(w, z, f, 60, () => { f.x = 190; f.y = 178; });
    expect(hp - f.hp).toBeGreaterThanOrEqual(K.dmg * BITE.dmg * 0.8);
    expect(back.hp).toBe(back.maxhp);
  });

  it('giro da morte: prende na boca, 3 pulsos, arremessa 80 px e fica ZONZO (+50%)', () => {
    const w = world(); const f = fighter(w, 196); const z = rei(w, 250, 178, { bite: 99, spin: 0, tail: 99, dive: 99 });
    run(w, z, f, 2);
    expect((z as any).mv).toBe('spin');
    expect(w.warns.some((t) => t.kind === 'circle' && t.r === SPIN.r)).toBe(true);
    let held = false, hits = 0, last = f.hp, xAtThrow = 0;
    for (let i = 0; i < 60 * 3; i++) {
      run(w, z, f, 1);
      if ((z as any).held === f) { held = true; expect(f.x).toBeCloseTo(z.x + z.face * MOUTH.x, 0); expect(f.state).toBe('stun'); xAtThrow = f.x; }
      if (f.hp < last) { hits++; last = f.hp; }
      if ((z as any).state === 'zonzo') break;
    }
    expect(held).toBe(true);
    expect(hits).toBe(4); // agarrão + 3 pulsos
    expect(Math.abs(f.x - xAtThrow)).toBeGreaterThanOrEqual(SPIN.throwPx - 1);
    expect((z as any).state).toBe('zonzo');
    expect(z.vuln).toBe(true);
    const hp = z.hp; damageZ(w, z, 100, 1, null);
    expect(hp - z.hp).toBe(150);
  });

  it('giro da morte: golpe forte de outro lutador solta a vítima', () => {
    const w = world(); const f = fighter(w, 196); const ally = fighter(w, 280); const z = rei(w, 250, 178, { bite: 99, spin: 0, tail: 99, dive: 99 });
    run(w, z, f, 60 * 1.2, () => {}); // até prender
    expect((z as any).held).toBe(f);
    damageZ(w, z, 50, 3, ally);
    expect((z as any).held).toBeNull();
    expect((z as any).state).toBe('zonzo');
  });

  it('rabada: vira a cauda pro alvo, acerta e empurra; se erra bate na margem e fica zonzo', () => {
    const w = world(); const f = fighter(w, 130); const z = rei(w, 250, 178, { bite: 99, spin: 99, tail: 0, dive: 99 });
    run(w, z, f, 2);
    expect((z as any).mv).toBe('tail');
    expect(z.face).toBe(1); // cauda pro alvo (à esquerda)
    const t = tailCenter(z); expect(t.x).toBeLessThan(z.x);
    const hp = f.hp, x0 = f.x;
    run(w, z, f, 40);
    expect(hp - f.hp).toBeGreaterThanOrEqual(K.dmg * TAIL.dmg * 0.8);
    expect(f.x).toBeLessThan(x0 - 20);
    // errou
    const w2 = world(); const g = fighter(w2, 130); const z2 = rei(w2, 250, 178, { bite: 99, spin: 99, tail: 0, dive: 99 });
    run(w2, z2, g, 2); g.x = 380; g.y = 206;
    run(w2, z2, g, 70);
    expect((z2 as any).state).toBe('zonzo');
  });

  it('mergulho: invulnerável submerso, marcador 1,0 s antes e emerge no ponto marcado', () => {
    const w = world(); const f = fighter(w, 40, 160); const z = rei(w, 300, 190, { bite: 99, spin: 99, tail: 99, dive: 0 });
    let markT = -1, subSeen = false, emergeT = -1, mark: any = null;
    for (let i = 0; i < 60 * 4; i++) {
      run(w, z, f, 1, () => { f.x = 40; f.y = 160; });
      if ((z as any).sub) { subSeen = true; const hp = z.hp; damageZ(w, z, 500, 3, f); expect(z.hp).toBe(hp); }
      const wn = w.warns.find((t) => t.owner === z && t.r === DIVE.r);
      if (wn && markT < 0) { markT = w.clock; mark = { x: wn.x, y: wn.y }; }
      if (z.anim === 'emerge' && emergeT < 0) emergeT = w.clock;
    }
    expect(subSeen).toBe(true);
    expect(mark).toEqual({ x: 40, y: 160 });
    expect(emergeT - markT).toBeGreaterThanOrEqual(DIVE.mark - 0.05);
    expect(z.x).toBeCloseTo(40, 0);
    expect(f.hp).toBeLessThan(f.maxhp);
  });

  it('fúria: duas emersões em lutadores diferentes', () => {
    const w = world(); const a = fighter(w, 40, 160); const b = fighter(w, 360, 200); const z = rei(w, 200, 180, { bite: 99, spin: 99, tail: 99, dive: 0 });
    (z as any).fury = true; (z as any).form = 'furia'; (z as any).roared = true;
    const marks: any[] = [];
    for (let i = 0; i < 60 * 6; i++) {
      run(w, z, a, 1, () => { a.x = 40; a.y = 160; b.x = 360; b.y = 200; });
      for (const t of w.warns) if (t.owner === z && t.r === DIVE.r && !marks.includes(t)) marks.push(t);
    }
    expect(marks.length).toBe(2);
    expect(marks[0].x).not.toBe(marks[1].x);
  });

  it('fraquezas: olho esquerdo cego (+15%) e barriga na mordida (+25%)', () => {
    const w = world(); const z = rei(w, 250, 178);
    const low = fighter(w, 200, 200), high = fighter(w, 200, 150);
    expect(blindSide(z, low)).toBe(true); // olhando pra esquerda: lado esquerdo é o de baixo
    expect(blindSide(z, high)).toBe(false);
    let hp = z.hp; damageZ(w, z, 100, 1, low); expect(hp - z.hp).toBe(Math.round(100 * BLIND_MUL));
    hp = z.hp; damageZ(w, z, 100, 1, high); expect(hp - z.hp).toBe(100);
    (z as any).state = 'attack'; (z as any).mv = 'bite'; z.anim = 'bite'; z.fi = 2;
    hp = z.hp; damageZ(w, z, 100, 1, high); expect(hp - z.hp).toBe(Math.round(100 * BELLY_MUL));
  });

  it('rugido (fúria, 1×): afasta o squad e chama 2 piranhas', () => {
    const w = world(); (w as any).zk.piranha = { nome: 'Piranha', hp: 75, dmg: 7, ai: 'piranha', ax: 10, G: 10, top: 10, w: 10, F };
    const f = fighter(w, 200); const z = rei(w, 250, 178, { bite: 99, spin: 99, tail: 99, dive: 99 }); (z as any).fury = true;
    const x0 = f.x;
    run(w, z, f, 90, () => {});
    expect(w.zs.filter((o) => o.kind === 'piranha').length).toBe(2);
    expect(f.x).toBeLessThan(x0 - 20);
    expect((z as any).roared).toBe(true);
  });
});
