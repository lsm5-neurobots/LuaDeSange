// A Onça-Pintada (mini boss da Amazônia): emboscada com pontos de olhos (invulnerável escondida), bote longo com
// aviso que derruba e emenda a mordida na nuca (aliado quebra), bote que erra = ATOLADA (×1,5), patada em arco,
// rugido que atordoa e chama bugios, fúria com pontos falsos e bote duplo, luz forte revela.
// Mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES) e arte fake com os mesmos campos de evento de art-src/zombies/onca.js.
import { describe, it, expect } from 'vitest';
import { damageZ } from '../src/expedition/combat';
import { onca, ONC, revealOnca } from '../src/expedition/ai/onca';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), stalk: anim(8), intro: anim(14), hurt: anim(4), rage: anim(10), death: anim(14), dazed: anim(8), stuck: anim(8),
    fall: anim(6), getup: anim(6),
    vanish: anim(8, { goneAt: 6 }), appear: anim(8),
    pounce: anim(12, { warn: [0, 1, 2, 3], jump: [4, 5, 6, 7], land: 8, z: [0, 0, 0, 0, 8, 24, 30, 20, 4, 0, 0, 0] }),
    claw: anim(9, { warn: [0, 1], hit: [3, 6], reach: 66 }), roar: anim(10, { warn: [0, 1, 2], hit: 5 }), maul: anim(10, { bite: [3, 6] }),
    xEyes: anim(4, { prop: true }),
  },
};
const FB: any = { ANIMS: { idle: anim(8), walk: anim(8), attack: anim(8, { hit: 4 }), hurt: anim(4), death: anim(8) } };
const DEF = { nome: 'A Onça-Pintada', art: null, ax: 190, G: 222, top: 136, w: 36, hp: 4200, dmg: 32, boss: 'mini', ai: 'onca', mapa: 'futuro', xp: 160, desc: '' };

function world(bugio = true): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { esquiva: 0 } }, mode: 'noite', phase: 'fight', cam: 0, W: 384, clock: 0, ai: 0,
    fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], pools: [], actors: [], items: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { onca: { ...DEF, id: 'onca', F } };
  if (bugio) w.zk.bugio = { ...DEF, nome: 'Bugio', boss: undefined, hp: 120, dmg: 10, ai: 'bugio', id: 'bugio', F: FB };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 1 }, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function boss(w: World, x = 200, block: string[] = []): Zombie {
  const z: any = { uid: ++w.uid, kind: 'onca', K: (w.zk as any).onca, form: 'normal', x, y: 178, z: 0, face: -1, hp: 4200, maxhp: 4200, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0, mcd: {} };
  for (const b of block) z.mcd[b] = 999;
  w.zs.push(z); w.boss = z; return z;
}
// passo da IA da onça (o que updateZombie faria, sem depender do registro)
function stepOnca(w: World, z: Zombie, dt: number): void {
  const alive = w.fs.filter((f) => !f.down);
  const V = alive.sort((a, b) => Math.abs(a.x - z.x) - Math.abs(b.x - z.x))[0] ?? w.fs[0];
  const A = z.K.F.ANIMS;
  const c: ZCtx = { w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, A[z.anim], dt, wf ? (_e, fi) => onca.onFrame!(c, fi) : undefined), chase() {} };
  z.cd = Math.max(0, z.cd - dt);
  onca.update(c);
}
// lutadores: só a contagem do atordoamento (como updateFighter)
function stepF(w: World, dt: number): void { for (const f of w.fs) if (f.state === 'stun') { f.stunT -= dt; if (f.stunT <= 0) f.state = 'idle'; } }
const tick = (w: World, z: Zombie, s: number, dt = 1 / 60) => { for (let i = 0; i < Math.round(s / dt); i++) { w.clock += dt; stepF(w, dt); stepOnca(w, z, dt); } };
const until = (w: World, z: Zombie, cond: () => boolean, max = 6, dt = 1 / 60) => { let t = 0; while (!cond() && t < max) { tick(w, z, dt, dt); t += dt; } return t; };

describe('A Onça-Pintada', () => {
  it('entra pela direita, faz a intro e passa a caçar', () => {
    const w = world(); fighter(w, 60);
    const sp = onca.spawn!(w, 0, false);
    expect(sp.state).toBe('enter'); expect(sp.x).toBeGreaterThan(w.cam + w.W);
    const z = boss(w, sp.x); z.state = 'enter';
    until(w, z, () => z.state === 'intro', 8); expect(z.state).toBe('intro');
    until(w, z, () => z.state !== 'intro', 4); expect(['walk', 'attack', 'vanish']).toContain(z.state);
  });

  it('emboscada: some (invulnerável), mostra os olhos onde vai sair e reaparece emendando o bote', () => {
    const w = world(); const f = fighter(w, 60); const z = boss(w, 260, ['pounce', 'claw', 'roar']);
    z.mcd.ambush = 0; tick(w, z, 1 / 60);
    // longe: 50% emboscada, senão bote (bloqueado) → emboscada
    expect(z.state).toBe('vanish');
    until(w, z, () => z.state === 'hidden', 2);
    expect(z.invuln).toBe(true);
    const hp0 = z.hp; damageZ(w, z, 500, 3); expect(z.hp).toBe(hp0); // escondida: nada passa
    until(w, z, () => (z.eyes?.length ?? 0) > 0, 2);
    expect(z.eyes.length).toBe(1); expect(z.eyes[0].real).toBe(true);
    expect(w.actors!.length).toBe(1);
    const d = Math.abs(z.eyes[0].x - f.x); expect(d).toBeGreaterThanOrEqual(ONC.appearMin - 1); expect(d).toBeLessThanOrEqual(ONC.appearMax + 1);
    const ex = z.eyes[0].x;
    until(w, z, () => z.state === 'appear', 2);
    expect(z.x).toBe(ex); expect(z.invuln).toBe(false); expect(w.actors!.length).toBe(0);
    until(w, z, () => z.state === 'attack', 2);
    expect(z.mv).toBe('pounce');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'lane')).toBe(true);
  });

  it('bote que acerta: DERRUBA, dano 1,5× e mordida na nuca; aliado batendo solta e a deixa tonta', () => {
    const w = world(); const a = fighter(w, 100); const b = fighter(w, 40, 200); const z = boss(w, 200, ['ambush', 'claw', 'roar']);
    tick(w, z, 1 / 60);
    expect(z.mv).toBe('pounce');
    until(w, z, () => z.state === 'maul', 3);
    expect(z.state).toBe('maul'); expect(z.prey).toBe(a);
    expect(a.state).toBe('stun'); expect(1000 - a.hp).toBeGreaterThan(32 * 1.5 * 0.9);
    const hpBite = a.hp;
    until(w, z, () => a.hp < hpBite, 1); expect(a.hp).toBeLessThan(hpBite); // mordida
    damageZ(w, z, 50, 1, b); // aliado bate
    tick(w, z, 1 / 60);
    expect(z.state).toBe('dazed'); expect(z.prey).toBeFalsy();
    const h0 = z.hp; damageZ(w, z, 100, 1); expect(h0 - z.hp).toBe(160); // tonta: ×1,6 do motor
  });

  it('bote que erra: ATOLADA 1,8 s, vulnerável (dano ×1,5)', () => {
    const w = world(); const f = fighter(w, 100); const z = boss(w, 200, ['ambush', 'claw', 'roar']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('pounce');
    f.y = 150; // sai da faixa ao ver a cauda chicotear
    until(w, z, () => z.state === 'stuck', 3);
    expect(z.state).toBe('stuck'); expect(z.vuln).toBe(true); expect(f.hp).toBe(1000);
    const h0 = z.hp; damageZ(w, z, 100, 1); expect(h0 - z.hp).toBe(150);
    tick(w, z, 1.5); expect(z.state).toBe('stuck');
    tick(w, z, 0.4); expect(z.state).not.toBe('stuck'); expect(z.vuln).toBe(false);
  });

  it('patada em arco: 2 golpes de 0,9× que empurram', () => {
    const w = world(); const f = fighter(w, 170); const z = boss(w, 200, ['ambush', 'pounce', 'roar']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('claw');
    const x0 = f.x;
    until(w, z, () => z.state !== 'attack', 2);
    expect(1000 - f.hp).toBeGreaterThan(2 * 32 * 0.9 * 0.9);
    expect(f.x).toBeLessThan(x0 - 30);
  });

  it('rugido: aviso em volta, ATORDOA e chama 2 bugios (1× por fase)', () => {
    const w = world(); const f = fighter(w, 170); const g = fighter(w, 230, 190); const z = boss(w, 200, ['ambush', 'pounce', 'claw']);
    tick(w, z, 1 / 60); expect(z.mv).toBe('roar');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'circle' && t.r === ONC.roarR)).toBe(true);
    until(w, z, () => f.state === 'stun', 2);
    expect(f.state).toBe('stun'); expect(g.state).toBe('stun');
    expect(w.zs.filter((o) => o.kind === ('bugio' as any)).length).toBe(2);
    // de novo na mesma fase: não chama mais
    until(w, z, () => z.state === 'walk', 2); z.mcd.roar = 0; z.cd = 0; f.state = 'idle'; g.state = 'idle';
    until(w, z, () => z.mv === 'roar', 1); until(w, z, () => z.state !== 'attack', 2);
    expect(w.zs.filter((o) => o.kind === ('bugio' as any)).length).toBe(2);
  });

  it('fúria a 50%: forma furia, golpes ×1,3, 2 pontos de olhos falsos e bote duplo', () => {
    const w = world(); fighter(w, 40); const z = boss(w, 300, ['claw', 'roar', 'pounce']);
    damageZ(w, z, 2200, 1);
    expect(z.fury).toBe(true); expect(z.form).toBe('furia'); expect(z.state).toBe('rage');
    until(w, z, () => z.state !== 'rage', 3);
    z.mcd.ambush = 0; z.cd = 0; z.rDmg = 9999; // apanhou muito: some
    until(w, z, () => (z.eyes?.length ?? 0) > 0, 4);
    expect(z.eyes.length).toBe(3); expect(z.eyes.filter((s: any) => s.real).length).toBe(1);
    // bote duplo: o primeiro erra (ninguém na faixa) e ela volta
    const w2 = world(); const f2 = fighter(w2, 120); const z2 = boss(w2, 220, ['ambush', 'claw', 'roar']); z2.fury = true; z2.form = 'furia';
    tick(w2, z2, 1 / 60); expect(z2.mv).toBe('pounce'); f2.y = 150;
    until(w2, z2, () => z2.second === true, 3); expect(z2.mv).toBe('pounce');
    until(w2, z2, () => z2.state === 'stuck', 3); expect(z2.state).toBe('stuck');
  });

  it('luz forte (especial de um lutador) revela a onça escondida e a deixa tonta', () => {
    const w = world(); const f = fighter(w, 60); const z = boss(w, 260, ['pounce', 'claw', 'roar']);
    z.rDmg = 9999; tick(w, z, 1 / 60); expect(z.state).toBe('vanish');
    until(w, z, () => z.state === 'hidden', 2);
    f.state = 'special'; tick(w, z, 1 / 60);
    expect(z.state).toBe('dazed'); expect(z.invuln).toBe(false);
    expect(z.x).toBeGreaterThan(w.cam); expect(z.x).toBeLessThan(w.cam + w.W);
    // hook exportado também funciona
    const w3 = world(); fighter(w3, 60); const z3 = boss(w3, 260); z3.state = 'hidden'; z3.invuln = true; z3.ax = 150; z3.ay = 180;
    revealOnca(w3, z3); expect(z3.state).toBe('dazed');
  });
});
