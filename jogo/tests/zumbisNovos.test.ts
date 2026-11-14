// Estalador (percepção por som) e Blindado (escudo frontal/traseiro) — mundo mínimo, sem arte.
import { describe, it, expect } from 'vitest';
import { damageZ } from '../src/expedition/combat';
import { REGISTRY, updateZombie } from '../src/expedition/ai';
import { hear, emitNoise } from '../src/expedition/ai/noise';
import { perceive } from '../src/expedition/ai/estalador';
import { ZOMBIES } from '../src/data/zombies';
import type { World, Zombie, Fighter } from '../src/expedition/world';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(7), attack: anim(8, { hit: 4, reach: 34 }), grab: anim(10, { hit: 5, reach: 36 }), screech: anim(9, { hit: 4, reach: 70 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(8),
    block: anim(4), bash: anim(8, { hit: 4, reach: 40 }), rush: anim(9, { hit: 4, reach: 30 }), turn: anim(5), shieldBreak: anim(8),
  },
};
F.N = { ANIMS: { ...F.ANIMS, baton: anim(8, { hit: [3, 5], reach: 36 }), kick: anim(7, { hit: 3, reach: 34 }) } };

function world(): World {
  const w: any = {
    cfg: { dia: 3 }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = {
    estalador: { ...ZOMBIES.estalador, id: 'estalador', F },
    blindado: { ...ZOMBIES.blindado, id: 'blindado', F },
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178, extra: Partial<Fighter> = {}): Fighter {
  const f: any = { m: { nome: 'T', lv: 5 }, x, y, z: 0, face: 1, hp: 100, maxhp: 100, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true }, slot: w.fs.length, ...extra };
  w.fs.push(f); return f;
}
function zombie(w: World, kind: 'estalador' | 'blindado', x: number, face: 1 | -1, state: string): Zombie {
  const K = (w.zk as any)[kind];
  const z: any = { uid: ++w.uid, kind, K, form: 'comum', x, y: 178, z: 0, face, hp: 200, maxhp: 200, dmgMul: 1, state, anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
const tick = (w: World, n: number, dt = 1 / 60, each?: () => void) => { for (let i = 0; i < n; i++) { w.clock += dt; each?.(); for (const z of w.zs) updateZombie(w, z, dt); } };

describe('Estalador: percepção por som', () => {
  it('está registrado e com arte/medidas próprias', () => {
    expect(REGISTRY.estalador).toBeTruthy();
    expect(ZOMBIES.estalador.art).toBe('ESTALADOR');
    expect(ZOMBIES.estalador.ai).toBe('estalador');
  });
  it('ignora quem fica parado ou anda devagar', () => {
    const w = world(); const f = fighter(w, 120); const z = zombie(w, 'estalador', 220, -1, 'wander');
    tick(w, 60, 1 / 60, () => { f.x += 40 / 60; }); // avançando a 40 px/s
    expect(hear(w, z)).toBeNull();
    expect(z.state).toBe('wander');
  });
  it('ouve quem corre perto e caça o barulhento', () => {
    const w = world(); const f = fighter(w, 120); const z = zombie(w, 'estalador', 220, -1, 'wander');
    tick(w, 40, 1 / 60, () => { f.x += 90 / 60; }); // correndo a 90 px/s
    expect(['hear', 'hunt']).toContain(z.state);
    expect(z.snd?.f).toBe(f);
  });
  it('golpe e tiro perto fazem barulho; tiro de longe mais que laser', () => {
    const w = world(); const f = fighter(w, 60); const z = zombie(w, 'estalador', 260, -1, 'wander');
    f.state = 'shot'; f.w = { tipo: 'gun' } as any;
    w.clock += 0.02; expect(hear(w, z)).not.toBeNull();
    const w2 = world(); const g = fighter(w2, 60); const z2 = zombie(w2, 'estalador', 260, -1, 'wander');
    g.state = 'shot'; g.w = { tipo: 'beam' } as any;
    w2.clock += 0.02; expect(hear(w2, z2)).toBeNull();
    const w3 = world(); const h = fighter(w3, 150); const z3 = zombie(w3, 'estalador', 250, -1, 'wander');
    h.state = 'combo'; w3.clock += 0.02; expect(hear(w3, z3)?.f).toBe(h);
  });
  it('vasculhar e baú fazem barulho; tato a 28 px reconhece', () => {
    const w = world(); const z = zombie(w, 'estalador', 200, -1, 'wander');
    w.spots.push({ t: 'obj', x: 250, y: 160, state: 'vasculhando', done: false } as any);
    w.clock += 0.02; expect(hear(w, z)).not.toBeNull();
    const w2 = world(); const f = fighter(w2, 220); const z2 = zombie(w2, 'estalador', 200, -1, 'wander');
    w2.clock += 0.02; const c: any = { w: w2, z: z2, dt: 1 / 60, V: f, dx: 20, adx: 20, dy: 0, step() {}, chase() {} };
    expect(perceive(c)).toBe(f);
  });
  it('estalo sônico de outro Estalador atrai; raio maior no plenilunar', () => {
    const w = world(); const z = zombie(w, 'estalador', 100, 1, 'wander');
    emitNoise(w, 380, 178, 1, 260);
    expect(hear(w, z, 1)).toBeNull();
    expect(hear(w, z, 1.5)).not.toBeNull();
  });
});

describe('Blindado: escudo frontal', () => {
  it('está registrado com vista sem escudo', () => {
    expect(REGISTRY.blindado).toBeTruthy();
    expect(ZOMBIES.blindado.art).toBe('BLINDADO');
  });
  it('de frente o dano é quase zero; por trás é integral', () => {
    const w = world(); const z = zombie(w, 'blindado', 200, -1, 'chase');
    const frente = fighter(w, 170), costas = fighter(w, 230);
    damageZ(w, z, 30, 1, frente);
    expect(z.hp).toBeGreaterThanOrEqual(199);
    expect(z.shieldHP).toBe(2);
    damageZ(w, z, 30, 1, costas);
    expect(z.hp).toBeLessThanOrEqual(170);
    expect(z.shieldHP).toBe(2);
  });
  it('3 golpes no escudo derrubam o escudo e o dano passa a valer de frente', () => {
    const w = world(); const z = zombie(w, 'blindado', 200, -1, 'chase');
    const frente = fighter(w, 170);
    for (let i = 0; i < 3; i++) damageZ(w, z, 20, 1, frente);
    expect(z.shielded).toBe(false);
    expect(z.state).toBe('break');
    expect(z.K.F).toBe(F.N);
    const hp = z.hp; damageZ(w, z, 20, 1, frente);
    expect(z.hp).toBeLessThan(hp - 10);
  });
  it('golpe pesado conta 2; laser perfura pela metade', () => {
    const w = world(); const z = zombie(w, 'blindado', 200, -1, 'chase');
    const f = fighter(w, 170);
    damageZ(w, z, 20, 3, f);
    expect(z.shieldHP).toBe(1);
    const l = fighter(w, 160, 178, { w: { tipo: 'beam' } as any });
    const hp = z.hp; damageZ(w, z, 20, 3, l);
    expect(z.shielded).toBe(false);
    expect(hp - z.hp).toBe(10);
  });
  it('não vira na hora: só depois de 0,8 s com o alvo atrás', () => {
    const w = world(); const z = zombie(w, 'blindado', 200, -1, 'chase');
    fighter(w, 240);
    tick(w, 30);
    expect(z.face).toBe(-1);
    tick(w, 120);
    expect(z.face).toBe(1);
  });
});
