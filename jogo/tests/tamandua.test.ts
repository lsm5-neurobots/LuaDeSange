// O Tamanduá-Bandeira (mini boss do Pantanal): abraço avisado (levantar-se + círculo r 60) que prende e pulsa, quebra do
// abraço por outro lutador (fica TONTO), ABERTO depois do abraço (+50%), garra em arco que derruba, língua que puxa o mais
// distante, fúria (leque de línguas, cauda atrás, abraço duplo). Mundo mínimo; IA chamada direto (sem ZOMBIES/REGISTRY).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import { tamandua, TAM, TAM_CD, clawHit, grabHug } from '../src/expedition/ai/tamandua';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
// mesmos campos de evento da arte (art-src/zombies/tamandua.js); durações aproximadas
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8, { stomp: [2, 6] }), intro: anim(12), dazed: anim(8), rage: anim(8), open: anim(8),
    stand: anim(8, { warn: [0, 1, 2, 3, 4, 5, 6], dur: () => 88 }),
    hug: anim(12, { warn: [0, 1, 2, 3, 4, 5], grab: 6, tick: [8, 10], dur: (i: number) => (i < 6 ? 60 : 270) }),
    claw: anim(10, { warn: [0, 1, 2, 3], hit: [4, 5], reach: 100 }),
    tongue: anim(10, { warn: [0, 1, 2, 3], hit: 4, pull: [5, 6, 7, 8] }),
    slam: anim(9, { warn: [0, 1, 2, 3], hit: 4 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(6), getup: anim(6), death: anim(12), tumble: anim(4), grabbed: anim(4),
    xLingua: anim(4, { prop: true }), xPoeira: anim(3, { prop: true }),
  },
};
const K: any = { nome: 'O Tamanduá-Bandeira', art: 'TAMANDUA', ax: 210, G: 284, top: 214, w: 36, hp: 4600, dmg: 32, boss: 'mini', ai: 'tamandua', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'pantanal', bonus: { dano: 1, esquiva: 0 } }, mode: 'noite', phase: 'fight', cam: 0, W: 384, clock: 0, ai: 0,
    fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], pools: [], actors: [], rings: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function boss(w: World, x = 200, block: string[] = []): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'tamandua', K, form: 'normal', x, y: 178, z: 0, face: -1, hp: 4600, maxhp: 4600, dmgMul: 1, state: 'walk', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: true, tg: null, tgT: 0, mcd: {} };
  for (const b of block) z.mcd[b] = 999;
  w.zs.push(z); (w as any).boss = z; return z;
}
/** um passo da IA (cópia mínima do updateZombie para chefes; alvo = lutador mais perto) */
function step(w: World, z: Zombie, dt = 1 / 60): void {
  if (z.dead) return;
  z.cd = Math.max(0, z.cd - dt);
  let V = w.fs[0]; let bd = 1e9; for (const f of w.fs) { if (f.down) continue; const d = Math.abs(f.x - z.x) + 2 * Math.abs(f.y - z.y); if (d < bd) { bd = d; V = f; } }
  const c: ZCtx = {
    w, z, dt, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y,
    step: (wf) => stepAnim(z, F.ANIMS[z.anim], dt, wf ? (_e, fi) => tamandua.onFrame!(c, fi) : undefined),
    chase: () => {},
  };
  tamandua.update(c);
}
const run = (w: World, z: Zombie, s: number, each?: () => void) => { for (let i = 0; i < Math.round(s * 60); i++) { w.clock += 1 / 60; each?.(); step(w, z); } };
const until = (w: World, z: Zombie, cond: () => boolean, max = 6) => { let t = 0; while (!cond() && t < max) { run(w, z, 1 / 60); t += 1 / 60; } return t; };

afterEach(() => vi.restoreAllMocks());

describe('O Tamanduá-Bandeira', () => {
  it('arte própria com as animações e eventos da ficha', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/tamandua.js'), 'utf8');
    expect(src).toMatch(/const TAMANDUA=\(function/);
    expect(src).not.toMatch(/stub/i);
    for (const a of ['idle', 'walk', 'intro', 'stand', 'hug', 'open', 'claw', 'tongue', 'slam', 'dazed', 'rage', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'tumble', 'grabbed', 'xLingua', 'xPoeira']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/stand:\{[^\n]*n:8,warn:\[0,1,2,3,4,5,6\]/);
    expect(src).toMatch(/hug:\{[^\n]*n:12,warn:\[0,1,2,3,4,5\],grab:6,tick:\[8,10\]/);
    expect(src).toMatch(/claw:\{[^\n]*n:10,warn:\[0,1,2,3\],hit:\[4,5\]/);
    expect(src).toMatch(/tongue:\{[^\n]*n:10,warn:\[0,1,2,3\],hit:4,pull:\[5,6,7,8\]/);
    expect(src).toMatch(/slam:\{[^\n]*n:9,warn:\[0,1,2,3\],hit:4/);
  });

  it('abraço: levanta (aviso ~700 ms + círculo r 60), prende 1,6 s com 3 pulsos e depois fica ABERTO (+50%)', () => {
    const w = world(); const f = fighter(w, 160); const z = boss(w, 200, ['claw', 'tongue']);
    run(w, z, 1 / 60);
    expect(z.mv).toBe('hug'); expect(z.anim).toBe('stand');
    const wn = w.warns.find((t) => t.owner === z && t.kind === 'circle')!;
    expect(wn.r).toBe(TAM.hugR);
    const tGrab = until(w, z, () => f.state === 'stun');
    expect(tGrab).toBeGreaterThan(0.65); // levantar-se + descida: aviso legível
    expect(f.hp).toBeLessThan(5000);
    const hp1 = f.hp;
    until(w, z, () => z.state === 'open', 3);
    expect(z.state).toBe('open');
    const pulse = 5000 - hp1; // 1º pulso
    expect(5000 - f.hp).toBeCloseTo(pulse * 3, 0); // 3 pulsos iguais
    expect(w.warns.filter((t) => t.owner === z).length).toBe(0);
    expect(z.vuln).toBe(true);
    const hp0 = z.hp; damageZ(w, z, 100, 1); expect(hp0 - z.hp).toBe(150);
    run(w, z, TAM.openT + 0.05);
    expect(z.state).toBe('walk'); expect(z.vuln).toBeFalsy();
  });

  it('abraço: sair do círculo antes do bote escapa; só levanta com o alvo a ≤ 110 px', () => {
    const w = world(); const f = fighter(w, 160); const z = boss(w, 200, ['claw', 'tongue']);
    run(w, z, 0.2);
    expect(z.anim).toBe('stand');
    f.x = 60; f.y = 150;
    run(w, z, 1.2);
    expect(f.hp).toBe(5000);
    const w2 = world(); fighter(w2, 60); const z2 = boss(w2, 200, ['claw', 'tongue']);
    run(w2, z2, 0.3);
    expect(z2.mv).not.toBe('hug');
  });

  it('abraço: outro lutador quebra com golpe forte e o tamanduá fica TONTO (dano ×1,6)', () => {
    const w = world(); const f = fighter(w, 165); const g = fighter(w, 280); const z = boss(w, 200, ['claw', 'tongue']);
    until(w, z, () => (z.held ?? []).length > 0, 3);
    expect(z.held).toContain(f);
    damageZ(w, z, 30, 3, g);
    expect(z.state).toBe('dazed');
    expect((z.held ?? []).length).toBe(0);
    expect(f.stunT).toBeLessThanOrEqual(0.12);
    const hp0 = z.hp; damageZ(w, z, 100, 1); expect(hp0 - z.hp).toBe(160);
    run(w, z, TAM.dazeT + 0.05); expect(z.state).toBe('walk');
  });

  it('garra em arco: aviso à frente, 140° / 100 px, derruba; quem está atrás não leva', () => {
    const w = world(); const f = fighter(w, 140); const z = boss(w, 200, ['hug', 'tongue']);
    run(w, z, 1 / 60);
    expect(z.mv).toBe('claw');
    expect(w.warns.some((t) => t.owner === z && t.kind === 'circle')).toBe(true);
    until(w, z, () => f.hp < 5000, 2);
    expect(f.hp).toBeLessThan(5000); expect(f.state).toBe('stun');
    // geometria direta
    const w2 = world(); const front = fighter(w2, 130); const back = fighter(w2, 240); const side = fighter(w2, 196, 140); const z2 = boss(w2, 200);
    const hit = clawHit(w2, z2);
    expect(hit).toContain(front); expect(hit).not.toContain(back); expect(hit).not.toContain(side);
    expect(TAM_CD.claw).toEqual([4, 3]);
  });

  it('língua: faixa de aviso, mira o mais distante (60–200 px) e puxa até 30 px', () => {
    const w = world(); const near = fighter(w, 120, 150); const far = fighter(w, 40); const z = boss(w, 200, ['hug', 'claw']);
    run(w, z, 1 / 60);
    expect(z.mv).toBe('tongue');
    const lanes = w.warns.filter((t) => t.owner === z && t.kind === 'lane');
    expect(lanes.length).toBe(1); expect(lanes[0].y).toBe(far.y);
    until(w, z, () => z.state !== 'attack', 3);
    expect(far.hp).toBeLessThan(5000);
    expect(Math.abs(far.x - (z.x - TAM.pullTo))).toBeLessThan(3);
    expect(near.hp).toBe(5000);
  });

  it('fúria: anima a fúria; língua em leque (3 faixas); cauda bate atrás; abraço duplo', () => {
    const w = world(); fighter(w, 40); const z = boss(w, 200, ['hug', 'claw', 'slam']);
    damageZ(w, z, 2400, 1);
    expect(z.fury).toBe(true); expect(z.form).toBe('furia'); expect(z.state).toBe('rage');
    until(w, z, () => z.mv === 'tongue', 3);
    expect(w.warns.filter((t) => t.owner === z && t.kind === 'lane').length).toBe(3);
    // cauda: lutador atrás
    const w2 = world(); const b = fighter(w2, 250); const z2 = boss(w2, 200, ['hug', 'claw', 'tongue']); z2.fury = true; z2.form = 'furia'; z2.face = -1;
    run(w2, z2, 1 / 60);
    expect(z2.mv).toBe('slam');
    until(w2, z2, () => b.hp < 5000, 2);
    expect(b.state).toBe('stun');
    // abraço duplo
    const w3 = world(); const f3 = fighter(w3, 165); const z3 = boss(w3, 200, ['claw', 'tongue', 'slam']); z3.fury = true; z3.form = 'furia';
    let first = 0, waited = false;
    until(w3, z3, () => { if (!first && f3.hp < 5000) first = 5000 - f3.hp; if (z3.hugWait) waited = true; return z3.state === 'open'; }, 8);
    expect(waited).toBe(true);
    expect(z3.state).toBe('open');
    expect(z3.hug2).toBeFalsy();
    expect(5000 - f3.hp).toBeCloseTo(first * 6, 0); // 2 abraços × 3 pulsos
    // grabHug sozinho: círculo vazio não prende ninguém
    const w4 = world(); fighter(w4, 20); const z4 = boss(w4, 200); z4.hugX = 160; z4.hugY = 178;
    expect(grabHug(w4, z4)).toHaveLength(0);
  });
});
