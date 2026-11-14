// Bugio Zumbi (Amazônia): urro que chama o bando (+20% velocidade, cancela com golpe, ×1,5 no papo inflado),
// salto de galho com sombra (DERRUBADO / ABERTO se errar), fruto podre que ofusca, arranhão duplo, nasce no alto.
// Mundo mínimo, IA chamada direto (sem REGISTRY/ZOMBIES: o orquestrador registra depois).
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { ZCtx } from '../src/expedition/ai';
import { GUARDS, damageZ } from '../src/expedition/combat';
import { ARM } from '../src/expedition/fighter';
import { stepAnim, type World, type Zombie, type Fighter } from '../src/expedition/world';
import {
  bugio, bugioGuard, BUG, CLAW, LEAP_DMG, FRUIT_DMG, callsOf, canHowl, doHowl, cancelHowl, leapLand, leapTarget, throwFruit, tickFruit, startLeap,
} from '../src/expedition/ai/bugio';

/* ---------- arte real (art-src) carregada sem navegador: só ANIMS/poses, sem desenhar ---------- */
const read = (p: string) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
const ART: any = new Function('self', read('art-src/shared/pix.js') + '\n' + read('art-src/shared/zreact.js') + '\n' + read('art-src/zombies/bugio.js') + '\nreturn BUGIO;')({});
const F: any = { ANIMS: ART.ANIMS, frame: () => null, framePose: () => null };
const K: any = { id: 'bugio', nome: 'Bugio Zumbi', ai: 'bugio', art: 'BUGIO', hp: 70, dmg: 13, xp: 8, ax: 128, G: 204, top: 110, w: 22, F };
const ERR: any = { id: 'errante', nome: 'Errante', ai: 'errante', hp: 80, dmg: 14, ax: 74, G: 142, top: 106, w: 18, F };

function world(): World {
  const w: any = {
    cfg: { dia: 3, mapId: 'amazonia', bonus: { dano: 1 } }, mode: 'noite', cam: 0, W: 384, clock: 0, phase: 'fight', fs: [], zs: [], warns: [], sparks: [], vfx: [], spots: [], proj: [], actors: [], pools: [],
    hitstop: 0, shake: 0, uid: 0, kills: 0, killsBy: {}, keys: {}, bag: {}, boss: null, map: { loot: {} }, ai: 0,
    A: { GORE: { color: () => ['#a00', '#800', '#600', '#400'], hit() {}, burst() {}, stain() {} } },
    fx() {}, log() {}, banner() {}, setIA() {},
  };
  w.zk = { bugio: K, errante: ERR };
  return w as World;
}
function fighter(w: World, x: number, y = 178): Fighter {
  const f: any = { m: { nome: 'T' + w.fs.length, lv: 5 }, x, y, z: 0, face: 1, hp: 5000, maxhp: 5000, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, w: { tipo: 'melee' }, fam: 'bastao', tier: 'comum', rig: 'generic', art: { has: () => false, F: { ANIMS: {} } }, slot: w.fs.length };
  w.fs.push(f); return f;
}
function bug(w: World, x = 200, y = 178, form = 'comum', state = 'keep'): Zombie {
  const z: any = { uid: ++(w as any).uid, kind: 'bugio', K, form, x, y, z: 0, face: -1, hp: 1000, maxhp: 1000, dmgMul: 1, state, anim: 'walk', fi: 0, acc: 0, done: false, cd: 0, stun: 0, poise: 0, dead: false, deadT: 0, down: null, air: null, react: null, flash: 0, boss: false, tg: null, tgT: 0 };
  w.zs.push(z); return z;
}
function upd(w: World, z: Zombie, V: Fighter, dt: number): void {
  if (z.dead || z.state === 'hurt') return;
  const dx = V.x - z.x, dy = V.y - z.y;
  const c: ZCtx = {
    w, z, dt, V, dx, adx: Math.abs(dx), dy,
    step: (wf) => stepAnim(z, z.K.F.ANIMS[z.anim], dt, wf ? (_e, fi) => bugio.onFrame!(c, fi) : undefined),
    chase: (spd, stop) => { if (Math.abs(dx) > stop) z.x += Math.sign(dx) * spd * dt; c.step(); },
  };
  z.cd = Math.max(0, z.cd - dt);
  bugio.update(c);
}
const run = (w: World, z: Zombie, V: Fighter, n: number, dt = 1 / 60, stop?: () => boolean) => { for (let i = 0; i < n; i++) { w.clock += dt; upd(w, z, V, dt); if (stop?.()) return; } };
const ctx = (w: World, z: Zombie, V: Fighter): ZCtx => ({ w, z, dt: 1 / 60, V, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y, step: () => {}, chase: () => {} });

afterEach(() => vi.restoreAllMocks());

describe('Bugio Zumbi: arte', () => {
  it('arte própria com as animações da ficha e campos de evento', () => {
    const src = read('art-src/zombies/bugio.js');
    expect(src).toMatch(/const BUGIO=/);
    expect(src).not.toMatch(/stub: arte/);
    for (const a of ['idle', 'walk', 'alert', 'howl', 'leap', 'throw', 'claw', 'hang', 'open', 'hurt', 'hurtB', 'fall', 'getup', 'death', 'xFruit', 'tumble', 'grabbed']) expect(ART.ANIMS[a], a).toBeTruthy();
    const A = ART.ANIMS;
    expect(A.idle.n).toBe(8); expect(A.walk.n).toBe(8); expect(A.howl.n).toBe(12); expect(A.leap.n).toBe(10); expect(A.throw.n).toBe(8); expect(A.claw.n).toBe(7);
    expect(A.howl.callAt).toBe(6); expect(A.throw.toss).toBe(4); expect(A.claw.hit).toEqual([2, 4]); expect(A.leap.land).toBe(8); expect(A.leap.air).toEqual([3, 4, 5, 6, 7]);
    // aviso do urro ~0,8 s (quadros antes do chamado)
    let ms = 0; for (let i = 0; i < A.howl.callAt; i++) ms += A.howl.dur(i);
    expect(ms).toBeGreaterThanOrEqual(750); expect(ms).toBeLessThanOrEqual(900);
    expect(ART.FW).toBe(240); expect(ART.GROUND).toBe(204); expect(ART.FH).toBe(220); expect(ART.AX).toBe(128);
    for (const f of ['comum', 'enluarado', 'plenilunar']) { const m = ART.mats(f); expect(m.blood.length).toBe(4); expect(m.acid ?? m.blood).toBeTruthy(); }
  });
  it('todas as poses são numéricas e finitas', () => {
    for (const [k, A] of Object.entries<any>(ART.ANIMS)) for (let i = 0; i < A.n; i++) {
      const P = ART.poseOf(k, i);
      for (const v of Object.values(P)) expect(Number.isFinite(v as number), k + i).toBe(true);
    }
  });
});

describe('Bugio Zumbi: IA', () => {
  it('defesa registrada; papo inflado ×1,5 e golpe no aviso cancela o urro', () => {
    expect((GUARDS as any).bugio).toBe(bugioGuard);
    const w = world(); const z = bug(w); const V = fighter(w, 120);
    z.state = 'howl'; z.anim = 'howl'; z.fi = 2; (w as any)._bugioHowlBy = z;
    w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: BUG.howlR, owner: z } as any);
    damageZ(w, z, 20, 1, V);
    expect(z.hp).toBe(1000 - 30);
    expect(z.state).toBe('hurt');
    expect(w.warns.length).toBe(0);
    expect((z as any).calls ?? 0).toBe(0); // não chamou ninguém
    expect(w.zs.length).toBe(1);
  });
  it('urro: chama 2 bugios (3 no enluarado) no alto e acelera +20% os zumbis no círculo por 6 s', () => {
    const w = world(); const z = bug(w, 200);
    const perto: any = bug(w, 250); perto.kind = 'errante'; const longe: any = bug(w, 380, 178); longe.kind = 'errante';
    const novos = doHowl(w, z);
    expect(novos.length).toBe(2);
    for (const n of novos) { expect(n.state).toBe('perch'); expect(n.z).toBe(BUG.perchZ); expect((n as any).summoned).toBe(true); }
    expect(perto.hasteMul).toBeCloseTo(1.2); expect(perto.hasteT).toBe(6);
    expect(longe.hasteT ?? 0).toBe(0);
    const w2 = world(); const z2 = bug(w2, 200, 178, 'enluarado');
    expect(callsOf(z2)).toBe(3); expect(doHowl(w2, z2).length).toBe(3);
  });
  it('só urra com menos de 3 aliados, 1 urro ativo por área e chamados não urram', () => {
    const w = world(); const z = bug(w); (z as any)._bcd = { howl: 0, leap: 9, fruit: 9 };
    expect(canHowl(w, z)).toBe(true);
    bug(w, 300); bug(w, 320); bug(w, 340);
    expect(canHowl(w, z)).toBe(false); // 3 aliados
    w.zs.splice(1, 3);
    (w as any)._bugioHowlUntil = w.clock + 3;
    expect(canHowl(w, z)).toBe(false); // outro urro ativo
    (w as any)._bugioHowlUntil = 0; (z as any).summoned = true;
    expect(canHowl(w, z)).toBe(false);
  });
  it('a IA começa o urro sozinha com aviso em círculo e chama no quadro callAt', () => {
    const w = world(); const z = bug(w, 200); const V = fighter(w, 60); (z as any)._bcd = { howl: 0, leap: 9, fruit: 9 };
    run(w, z, V, 1);
    expect(z.state).toBe('howl');
    expect(w.warns.some((t: any) => t.kind === 'circle' && t.r === BUG.howlR)).toBe(true);
    run(w, z, V, 120, 1 / 60, () => w.zs.length > 1);
    expect(w.zs.length).toBe(3);
    expect(w.warns.length).toBe(0);
  });
  it('salto: sombra no ponto de queda, pouso derruba quem está no círculo', () => {
    const w = world(); const z = bug(w, 250); const V = fighter(w, 120);
    expect(leapTarget(z, V).x).toBe(120);
    expect(leapTarget(z, { x: -100, y: 178 }).x).toBe(250 - BUG.leapMax);
    startLeap(ctx(w, z, V));
    expect(z.state).toBe('leap');
    expect(w.warns.some((t: any) => t.kind === 'circle' && t.x === 120 && t.r === BUG.leapR)).toBe(true);
    let peak = 0;
    run(w, z, V, 200, 1 / 60, () => { peak = Math.max(peak, z.z); return z.hitV === true; });
    expect(peak).toBeGreaterThan(30);
    expect(z.z).toBe(0);
    expect(V.hp).toBeCloseTo(5000 - 13 * LEAP_DMG * ARM(V), 3);
    expect(['stun', 'kd']).toContain(V.state);
  });
  it('salto errado: fica ABERTO 0,8 s e leva ×1,5', () => {
    const w = world(); const z = bug(w, 250); const V = fighter(w, 120);
    startLeap(ctx(w, z, V));
    V.y = 206; V.x = 300; // saiu da sombra
    leapLand(w, z);
    expect(V.hp).toBe(5000);
    expect(z.state).toBe('open');
    expect(z.openT).toBeCloseTo(BUG.missOpen);
    damageZ(w, z, 20, 1, V);
    expect(z.hp).toBe(1000 - 30);
  });
  it('lá no alto (pendurado ou no ar) fica fora do alcance', () => {
    const w = world(); const z = bug(w, 200, 178, 'comum', 'perch'); z.z = BUG.perchZ; z.anim = 'hang';
    damageZ(w, z, 50, 1, fighter(w, 180));
    expect(z.hp).toBe(1000);
  });
  it('nasce pendurado e desce em salto', () => {
    const w = world(); const s = bugio.spawn!(w, 0, true);
    expect(s.state).toBe('perch'); expect(s.anim).toBe('hang');
    const z = bug(w, s.x, s.y, 'comum', 'perch'); z.anim = 'hang'; const V = fighter(w, s.x + 100);
    run(w, z, V, 1);
    expect(z.z).toBe(BUG.perchZ);
    run(w, z, V, 400, 1 / 60, () => z.state === 'leap');
    expect(z.state).toBe('leap');
    run(w, z, V, 200, 1 / 60, () => z.hitV === true);
    expect(z.z).toBe(0);
  });
  it('fruto podre: arco até onde o alvo estava; acerta = 0,7× + OFUSCADO; quem saiu desvia', () => {
    const w = world(); const z = bug(w, 250); const V = fighter(w, 120); const O = fighter(w, 160, 206);
    throwFruit(w, z, { x: 120, y: 178 });
    expect(w.actors!.length).toBe(1);
    for (let i = 0; i < 90; i++) tickFruit(w, z, 1 / 60);
    expect(V.hp).toBeCloseTo(5000 - 13 * FRUIT_DMG * ARM(V), 3);
    expect(V.state).toBe('stun');
    expect(O.hp).toBe(5000);
    expect(w.actors!.length).toBe(0);
  });
  it('arranhão duplo: 2 acertos de ~0,45× a 30 px', () => {
    expect(CLAW.max).toBe(30);
    const w = world(); const z = bug(w, 150); const V = fighter(w, 128); (z as any)._bcd = { howl: 99, leap: 99, fruit: 99 };
    (z as any).calls = 9;
    run(w, z, V, 1);
    expect(z.anim).toBe('claw');
    run(w, z, V, 60);
    expect(5000 - V.hp).toBeCloseTo(2 * 13 * 0.45 * ARM(V), 3);
  });
  it('com horda na tela mantém distância (~120 px) em vez de colar', () => {
    const w = world(); const z = bug(w, 190); const V = fighter(w, 120); const e: any = bug(w, 140); e.kind = 'errante';
    (z as any)._bcd = { howl: 99, leap: 99, fruit: 99 }; (z as any).calls = 9;
    run(w, z, V, 120);
    expect(z.x - V.x).toBeGreaterThan(90);
  });
});
