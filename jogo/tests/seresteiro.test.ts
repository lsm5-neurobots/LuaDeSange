// Zumbi Seresteiro (Lapa): serenata em área que adormece (aviso em círculo, imunidade de 3 s, interrompível),
// acorde que empurra, quebra o violão de perto (4 s sem violão, só soco), giro lento de costas e palco
// (um canta por vez). Mundo mínimo, sem REGISTRY/ZOMBIES: a IA é chamada direto com um ZCtx montado aqui.
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import type { ZCtx } from '../src/expedition/ai';
import { SER, seresteiro, seresteiroGuard, serenadeHit, sleepImmune, singRadius, canSing, unarmed, slowTurn } from '../src/expedition/ai/seresteiro';

const anim = (n: number, extra: any = {}) => ({ nome: 'x', n, dur: () => 100, ...extra });
const F: any = {
  ANIMS: {
    idle: anim(8), walk: anim(8), alert: anim(6), serenata: anim(10, { dur: (i: number) => [120, 140, 140, 110, 110, 120, 120, 140, 150, 160][i], hit: 3, sing: 3, sing2: 5, warnEnd: 3, reach: 80 }),
    strum: anim(8, { hit: 2, reach: 40 }), smash: anim(8, { hit: 3, reach: 34 }), idleNo: anim(6), walkNo: anim(8), punch: anim(6, { hit: 3, reach: 30 }),
    hurt: anim(4), hurtB: anim(4), fall: anim(5), getup: anim(6), death: anim(8), tumble: anim(4), grabbed: anim(4),
  },
};
const K = { nome: 'Zumbi Seresteiro', art: 'SERESTEIRO', ax: 80, G: 150, top: 112, w: 18, hp: 85, dmg: 10, ai: 'seresteiro', id: 'seresteiro', F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'lapa', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} },
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  return w as World;
}
function fighter(w: World, x: number, y = 178, face: 1 | -1 = 1): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => true, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function ser(w: World, x = 200, y = 178, form = 'comum'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'seresteiro', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state: 'chase', anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
/** um passo da IA (como ai/index.ts faz, sem a parte comum) */
function run(w: World, z: Zombie, V: Fighter, dt = 1 / 60): void {
  const A = z.K.F.ANIMS, dx = V.x - z.x;
  if (z.state === 'hurt') { stepAnim(z, A[z.anim], dt); if (z.done) { z.state = 'chase'; z.anim = 'walk'; } return; }
  if (z.stun > 0) { z.stun -= dt; return; }
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy: V.y - z.y,
    step: (wf) => stepAnim(z, A[z.anim], dt, wf ? (_e, fi) => seresteiro.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { z.face = (Math.sign(dx) || z.face) as 1 | -1; if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  seresteiro.update(c);
}
const runFor = (w: World, z: Zombie, V: Fighter, s: number, each?: () => void) => { for (let i = 0; i < Math.round(s * 60); i++) { w.clock += 1 / 60; each?.(); run(w, z, V); } };

afterEach(() => vi.restoreAllMocks());

describe('Zumbi Seresteiro', () => {
  it('arte própria com as animações da ficha e defesa registrada', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../art-src/zombies/seresteiro.js'), 'utf8');
    expect(src).toMatch(/const SERESTEIRO=/);
    expect(src).not.toMatch(/stub|const MALANDRO|drawRazor/i);
    for (const a of ['idle', 'walk', 'alert', 'serenata', 'strum', 'smash', 'idleNo', 'walkNo', 'punch', 'hurt', 'hurtB', 'fall', 'getup', 'death']) expect(src).toContain(a + ':{');
    expect(src).toMatch(/sing:3/); expect(src).toMatch(/sing2:5/);
    // serenata: aviso de 400 ms antes do quadro sing
    const m = src.match(/serenata:\{[^\n]*dur:i=>\[(\d+),(\d+),(\d+)/)!;
    expect(+m[1] + +m[2] + +m[3]).toBe(400);
    expect((GUARDS as any).seresteiro).toBe(seresteiroGuard);
  });

  it('serenata: adormece quem está no círculo (1,0 s), não quem está fora; não acumula (imune 3 s)', () => {
    const w = world(); const z = ser(w);
    const dentro = fighter(w, 150), fora = fighter(w, 110), longeY = fighter(w, 200, 225);
    const hit = serenadeHit(w, z);
    expect(hit).toEqual([dentro]);
    expect(dentro.state).toBe('stun'); expect(dentro.stunT).toBeCloseTo(1.0);
    expect(dentro.hp).toBeLessThan(5000);
    expect(fora.state).not.toBe('stun'); expect(fora.hp).toBe(5000); expect(longeY.hp).toBe(5000);
    // imune: segunda serenata logo em seguida não adormece de novo
    dentro.state = 'idle'; w.clock += 2;
    expect(sleepImmune(w, dentro)).toBe(true);
    expect(serenadeHit(w, z)).toEqual([]); expect(dentro.state).not.toBe('stun');
    w.clock += 2.1; // 1 s de sono + 3 s de imunidade passaram
    expect(serenadeHit(w, z)).toEqual([dentro]);
  });

  it('enluarado: raio maior e sono de 1,5 s; plenilunar solta 2ª onda (só dano)', () => {
    const w = world(); const z = ser(w, 200, 178, 'enluarado');
    expect(singRadius(z)).toBe(SER.singRMoon);
    const f = fighter(w, 200 - 90); serenadeHit(w, z);
    expect(f.state).toBe('stun'); expect(f.stunT).toBeCloseTo(1.5);
    const w2 = world(); const zp = ser(w2, 200, 178, 'plenilunar'); const g = fighter(w2, 170);
    serenadeHit(w2, zp); const hp1 = g.hp; g.state = 'idle';
    expect(serenadeHit(w2, zp, true)).toEqual([]);
    expect(g.hp).toBeLessThan(hp1); expect(g.state).not.toBe('stun');
  });

  it('IA completa: inala com círculo no chão e adormece no quadro sing; o aviso some', () => {
    const w = world(); const z = ser(w); const f = fighter(w, 150);
    run(w, z, f);
    expect(z.state).toBe('attack'); expect(z.anim).toBe('serenata');
    expect(w.warns.length).toBe(1); expect((w.warns[0] as any).kind).toBe('circle'); expect((w.warns[0] as any).r).toBe(SER.singR);
    runFor(w, z, f, 0.36);
    expect(f.state).not.toBe('stun'); // ainda no aviso (400 ms)
    runFor(w, z, f, 0.1);
    expect(f.state).toBe('stun');
    expect(w.warns.length).toBe(0);
  });

  it('FRAQUEZA: golpe forte durante o aviso cancela (DESAFINOU); 25% da vida em 0,4 s também', () => {
    const w = world(); const z = ser(w); const f = fighter(w, 150);
    run(w, z, f); expect(z.anim).toBe('serenata');
    damageZ(w, z, 20, 3, f);
    expect(z.state).toBe('hurt'); expect(w.warns.length).toBe(0);
    // sem a serenata: o lutador não dorme
    runFor(w, z, f, 0.6); expect(f.state).not.toBe('stun');

    const w2 = world(); const z2 = ser(w2); const g = fighter(w2, 150);
    run(w2, z2, g); expect(z2.anim).toBe('serenata');
    damageZ(w2, z2, 130, 1, g); expect(z2.state).toBe('attack');
    w2.clock += 0.2; damageZ(w2, z2, 130, 1, g);
    expect(z2.state).toBe('hurt');

    // espaçado (> 0,4 s) não cancela
    const w3 = world(); const z3 = ser(w3); const h = fighter(w3, 150);
    run(w3, z3, h); z3.fi = 0; z3.acc = -9999; // segura no aviso
    damageZ(w3, z3, 130, 1, h); w3.clock += 0.5; damageZ(w3, z3, 130, 1, h);
    expect(z3.state).toBe('attack');
  });

  it('acuado quebra o violão: depois fica 4 s sem violão (sem serenata/acorde, só soco 0,5x)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z = ser(w); const f = fighter(w, 188);
    z._mv = { mcd: { serenata: 9 }, mhist: [] };
    run(w, z, f);
    expect(z.anim).toBe('smash');
    let hp0 = f.hp; runFor(w, z, f, 0.9, () => { f.x = 188; f.y = 178; });
    expect(hp0 - f.hp).toBeGreaterThan(K.dmg * 1.3 * 0.75); expect(hp0 - f.hp).toBeLessThanOrEqual(K.dmg * 1.3 + 0.01);
    expect(unarmed(w, z)).toBe(true);
    // sem violão: mesmo com a serenata pronta, só soca
    z._mv.mcd.serenata = 0; z.cd = 0; z.state = 'chase';
    const seen = new Set<string>();
    hp0 = f.hp;
    runFor(w, z, f, 2.5, () => { f.x = 188; f.y = 178; f.state = 'idle'; seen.add(z.anim); });
    expect(seen.has('serenata')).toBe(false); expect(seen.has('strum')).toBe(false); expect(seen.has('punch')).toBe(true);
    expect(seen.has('walk') || seen.has('idle')).toBe(false);
    // 4 s depois volta a ter violão
    w.clock += 2; expect(unarmed(w, z)).toBe(false);
  });

  it('sem violão: z.formSfx vira "sem" depois do smash e volta a undefined passado noGuitarT (e some ao morrer)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const w = world(); const z: any = ser(w); const f = fighter(w, 188);
    z._mv = { mcd: { serenata: 9 }, mhist: [] };
    expect(z.formSfx).toBeUndefined();
    run(w, z, f); expect(z.anim).toBe('smash');
    runFor(w, z, f, 0.9, () => { f.x = 188; f.y = 178; });
    expect(unarmed(w, z)).toBe(true); expect(z.formSfx).toBe('sem');
    runFor(w, z, f, SER.noGuitarT + 0.2, () => { f.x = 188; f.y = 178; f.state = 'idle'; });
    expect(unarmed(w, z)).toBe(false); expect(z.formSfx).toBeUndefined();
    // golpe fatal enquanto está sem violão: o campo é limpo antes da morte
    z.noGtrUntil = w.clock + 4; z.state = 'chase'; run(w, z, f); expect(z.formSfx).toBe('sem');
    z.hp = 5; seresteiroGuard(w, z, 50, 1, null); expect(z.formSfx).toBeUndefined();
  });

  it('arte: forma "~sem" desenha todas as anims (hurt, fall, getup, death...) sem erro', () => {
    const bundle = path.resolve(__dirname, '../public/art/art-exp.js');
    if (!fs.existsSync(bundle)) return; // sem build (npm run art), só a parte da IA
    // canvas falso: o teste só confere que a arte aceita o sufixo e devolve um quadro
    const ctx2d = (cv: any): any => new Proxy({} as any, {
      get(t, k) {
        if (k === 'canvas') return cv;
        if (k === 'getImageData' || k === 'createImageData') return (a: any, b: any, c: any, d: any) => { const W = (c ?? a?.width ?? a) | 0 || 1, H = (d ?? a?.height ?? b) | 0 || 1; return { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) }; };
        if (k === 'measureText') return () => ({ width: 0 });
        if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
        if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
        return k in t ? t[k] : () => {};
      },
      set(t, k, v) { t[k] = v; return true; },
    });
    const mkCanvas = () => ({ width: 300, height: 150, _g: null as any, getContext() { return (this._g ??= ctx2d(this)); }, toDataURL: () => '' });
    const win: any = { document: { createElement: mkCanvas }, console, Math, performance: { now: () => 0 } };
    win.window = win; win.self = win;
    vm.createContext(win);
    vm.runInContext(fs.readFileSync(bundle, 'utf8'), win);
    const A = win.ART_EXP.SERESTEIRO;
    const cv = A.frame('comum~sem', 'hurt', 0, 5);
    expect(cv).toBeTruthy(); expect(cv.width).toBeGreaterThan(0);
    for (const form of ['comum~sem', 'enluarado~sem', 'plenilunar~sem'])
      for (const an of ['hurt', 'hurtB', 'fall', 'getup', 'tumble', 'grabbed', 'death', 'idle', 'walk'])
        for (let i = 0; i < A.ANIMS[an].n; i++) expect(A.frame(form, an, i, 5).width).toBeGreaterThan(0);
    // mats aceita o sufixo e usa a paleta da base
    expect(A.mats('plenilunar~sem')).toEqual(A.mats('plenilunar'));
    expect(A.framePose('comum~sem', 'death', A.poseOf('death', 3)).width).toBeGreaterThan(0);
  });

  it('acorde empurra 14 px', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const w = world(); const z = ser(w); const f = fighter(w, 170);
    z._mv = { mcd: { serenata: 9, smash: 12 }, mhist: [] };
    run(w, z, f); expect(z.anim).toBe('strum');
    runFor(w, z, f, 0.3);
    expect(f.x).toBeLessThanOrEqual(170 - 14); expect(f.hp).toBeLessThan(5000);
  });

  it('de costas ele não vira rápido (0,5 s) e não ataca quem está atrás', () => {
    const w = world(); const z = ser(w); // olha pra esquerda
    const f = fighter(w, 230);
    runFor(w, z, f, 0.4);
    expect(z.face).toBe(-1); expect(z.state).not.toBe('attack');
    runFor(w, z, f, 0.15);
    expect(z.face).toBe(1);
    expect(slowTurn(z, 30, 0.01)).toBe(true);
  });

  it('palco: com dois seresteiros, só um canta por vez (o outro espera o fim + 3 s)', () => {
    const w = world(); const a = ser(w, 200); const b = ser(w, 120, 178); b.face = 1; const f = fighter(w, 160);
    run(w, a, f); expect(a.anim).toBe('serenata');
    expect(canSing(w, b)).toBe(false);
    run(w, b, f); expect(b.anim).not.toBe('serenata');
    w.clock += 1.3 + SER.relay + 0.1;
    expect(canSing(w, b)).toBe(true);
  });
});
