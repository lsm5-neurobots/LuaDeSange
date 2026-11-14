// Zumbi Açaizeiro (IA-52..54, comum do Ver-o-Peso): carregador ribeirinho curvado sob o paneiro de açaí. Tanque lento
// (~80% do Errante), fica de frente e "dá as costas" (o paneiro) ao grupo.
// - IA-52 Rasteira do paneiro (`sweep`): faixa baixa de aviso (320 ms), varre 48 px rente ao chão e DERRUBA (0,9 s).
//   Acertando ou não, termina DE JOELHO, desequilibrado por 1,2 s (`wobble`): FRAQUEZA, +30% de dano.
// - Paneirada (`bash`): cotovelada com o paneiro erguido (220 ms de aviso), empurra 12 px.
// - IA-53 Derramar o açaí (`spill`): círculo no chão no ALVO (300 ms), joga um bolo de açaí em arco (30–90 px). No
//   impacto 0,3x de dano em volta e POÇA ROXA (raio 28 px, 5 s; 6 s enluarado): -45% de velocidade enquanto pisa,
//   pra lutadores E zumbis (inclusive ele e os aliados). Máximo 2 poças por açaizeiro (a mais velha some).
//   Plenilunar derrama 2 bolos (2 poças). As poças somem quando ele morre.
// - IA-54 Paneiro: golpe que vem POR TRÁS bate no paneiro e passa só 70%. 6 golpes no paneiro e ele QUEBRA: derrama o
//   açaí (poça aos pés), solta um cacho (comida), passa a levar +20% de dano e perde a rasteira.
// Zumbis na poça: usa os campos de ritmo do Percussionista (hasteT/hasteMul/hasteBy, lidos por hasteK em ai/index.ts).
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { dropItem } from '../pickups';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'sweep', w: 2, min: 6, max: 48, dy: 10, cd: 4.5, dmg: 0, warn: 'lane', lunge: [0, 0, 40, 70, 20, 0, 0, 0, 0] },
  { anim: 'bash', w: 3, max: 34, dy: 9, cd: 2.2, dmg: 0.8, push: 12, word: 'PANEIRADA!', lunge: [0, 0, 60, 30, 0, 0, 0, 0] },
  { anim: 'spill', w: 2, min: 30, max: 90, dy: 30, cd: 7, dmg: 0 },
];

/** IA-52: dano da rasteira, tempo caído (s), janela desequilibrado (s) e bônus de dano nela */
export const SWEEP_DMG = 0.9;
export const SWEEP_KD = 0.9;
export const WOBBLE_T = 1.2;
export const WOBBLE_MUL = 1.3;
/** IA-53: poça roxa */
export const POOL_R = 28;
export const POOL_SLOW = 0.45;
export const POOL_MAX = 2;
export const SPILL_DMG = 0.3;
export const poolLife = (z: Zombie) => (z.form === 'enluarado' ? 6 : 5);
export const blobsOf = (z: Zombie) => (z.form === 'plenilunar' ? 2 : 1);
/** IA-54: paneiro */
export const BACK_MUL = 0.7;
export const BASKET_HITS = 6;
export const BROKEN_MUL = 1.2;
/** velocidade de perseguição (Errante = 19) */
export const SPEED = 15;

export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Quebra o paneiro (exportado pros testes). */
export function breakBasket(w: World, z: Zombie): void {
  if (z.broken) return;
  z.broken = true; z.basketHits = BASKET_HITS;
  w.fx('burst', 'PANEIRO QUEBROU!', z.x, z.y - z.K.top * 0.6);
  w.shake = Math.max(w.shake, 0.1);
  spawnFx(w, 'dust', z.x - z.face * 14, z.y, (-z.face) as 1 | -1);
  dropItem(w, 'comida', 1, z.x - z.face * 12, z.y);
  addPool(w, z, z.x - z.face * 16, z.y);
}

/** Defesa: desequilibrado +30%; paneiro quebrado +20%; por trás o paneiro segura 30% (e conta pra quebrar). */
export const acaizeiroGuard: Guard = (w, z, dmg, _n, by) => {
  let k = 1;
  if ((z.wobT ?? 0) > 0) k *= WOBBLE_MUL;
  if (z.broken) k *= BROKEN_MUL;
  else if (by && !fromFront(z, by)) {
    k *= BACK_MUL;
    z.basketHits = (z.basketHits ?? 0) + 1;
    w.fx('tag', 'PANEIRO ' + z.basketHits + '/' + BASKET_HITS, z.x, z.y - z.K.top - 18);
    if (z.basketHits >= BASKET_HITS) breakBasket(w, z);
  }
  return dmg * k;
};
(GUARDS as Record<string, Guard>).acaizeiro = acaizeiroGuard;

/* ---------- adereços ---------- */
function drawProp(z: Zombie, anim: string, st: number, x: number, y: number, dir: number, c: CanvasRenderingContext2D, cam: number): void {
  const F = z.K.F; if (!F.ANIMS[anim]) return;
  const form = String(z.form).split('~')[0];
  const cv: any = F.framePose ? F.framePose(form, anim, { st }, anim + st + '.0') : F.frame(form, anim, st, 5);
  if (!cv) return;
  c.save(); c.translate(Math.round(x - cam), Math.round(y)); if (dir < 0) c.scale(-1, 1);
  c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
  c.restore();
}
function removeActor(w: World, a: ExtraActor): void {
  if (!w.actors) return; const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1);
}

/* ---------- poças roxas ---------- */
export interface Pool { x: number; y: number; t: number; life: number; actor: ExtraActor; done: boolean }
export function poolsOf(z: Zombie): Pool[] { return (z._pools ??= []) as Pool[]; }
const inPool = (P: Pool, o: { x: number; y: number }) => Math.hypot(o.x - P.x, (o.y - P.y) * 2) <= POOL_R;

/** Cria poça (no máximo POOL_MAX por açaizeiro: a mais antiga some). */
export function addPool(w: World, z: Zombie, x: number, y: number): Pool {
  const list = poolsOf(z);
  while (list.length >= POOL_MAX) { const o = list.shift()!; o.done = true; removeActor(w, o.actor); }
  const P: Pool = { x, y: clampY(y), t: 0, life: poolLife(z), done: false, actor: null as unknown as ExtraActor };
  P.actor = {
    x, y: P.y - 10, w0: 0,
    draw: (c, cam) => {
      if (P.done || z.dead) { P.done = true; removeActor(w, P.actor); return; }
      drawProp(z, 'xPool', Math.floor((w.clock ?? 0) * 6) % 3, P.x, P.y, 1, c, cam);
    },
  };
  (w.actors ??= []).push(P.actor);
  list.push(P);
  spawnFx(w, 'dust', x, P.y, 1);
  return P;
}

/** Envelhece as poças; quem está dentro (lutador ou zumbi) fica 45% mais lento enquanto pisa. */
export function tickPools(w: World, z: Zombie, dt: number): void {
  const list = poolsOf(z);
  for (const P of list) {
    P.t += dt;
    if (P.t >= P.life) { P.done = true; removeActor(w, P.actor); continue; }
    for (const f of aliveF(w)) {
      if (!inPool(P, f)) continue;
      if (!(f.slowT > 0)) w.fx('hurt', 'grudou', f.x, f.y - 110);
      f.slowT = Math.max(f.slowT ?? 0, 0.15); f.slowK = Math.max(f.slowK ?? 0, POOL_SLOW);
    }
    for (const o of w.zs) {
      if (o.dead || !inPool(P, o)) continue;
      o.hasteT = Math.max(o.hasteT ?? 0, 0.15); o.hasteBy = z; o.hasteMul = Math.min(o.hasteMul ?? 1, 1 - POOL_SLOW);
    }
  }
  z._pools = list.filter((P) => !P.done);
}

/* ---------- bolo de açaí voando ---------- */
export interface Blob { x0: number; y0: number; x1: number; y1: number; x: number; y: number; h: number; t: number; T: number; done: boolean; actor: ExtraActor }
export function blobListOf(z: Zombie): Blob[] { return (z._blobs ??= []) as Blob[]; }

/** Alvos do derrame (presos no começo do golpe; o círculo de aviso aparece neles). */
export function spillTargets(w: World, z: Zombie, V: { x: number; y: number }): { x: number; y: number }[] {
  const d = Math.max(30, Math.min(90, Math.abs(V.x - z.x)));
  const out = [{ x: z.x + z.face * d, y: clampY(V.y) }];
  if (blobsOf(z) > 1) out.push({ x: out[0].x - z.face * 30, y: clampY(out[0].y + (out[0].y < 176 ? 14 : -14)) });
  return out;
}

function prepSpill(c: ZCtx): void {
  const { w, z, V } = c;
  const T = spillTargets(w, z, V);
  z._spillT = T;
  for (const t of T) w.warns.push({ kind: 'circle', x: t.x, y: t.y, r: POOL_R, owner: z, c: 'rgba(170,60,230,' } as any);
  w.fx('bubble', 'OLHA O AÇAÍ!', z.x, z.y - z.K.top * 0.55);
}

/** Joga os bolos de açaí (quadro `toss` da arte). Exportado pros testes. */
export function throwBlobs(w: World, z: Zombie): Blob[] {
  const T = (z._spillT as { x: number; y: number }[] | undefined) ?? [{ x: z.x + z.face * 60, y: z.y }];
  const out: Blob[] = [];
  T.forEach((t, k) => {
    const x0 = z.x + z.face * 10, y0 = z.y, dist = Math.abs(t.x - x0);
    const B: Blob = { x0, y0, x1: t.x, y1: t.y, x: x0, y: y0, h: 96, t: -k * 0.08, T: 0.22 + dist / 480, done: false, actor: null as unknown as ExtraActor };
    B.actor = {
      x: B.x, y: B.y, w0: 4,
      draw: (c, cam) => {
        if (B.done || z.dead) { B.done = true; removeActor(w, B.actor); return; }
        if (B.t < 0) return;
        drawProp(z, 'xBlob', Math.floor((w.clock ?? 0) * 14) % 4, B.x, B.y - B.h, B.x1 - B.x0, c, cam);
      },
    };
    (w.actors ??= []).push(B.actor);
    blobListOf(z).push(B); out.push(B);
  });
  z._spillT = null;
  return out;
}

/** Move os bolos em arco; no chão: 0,3x de dano em volta e poça. */
export function tickBlobs(w: World, z: Zombie, dt: number): void {
  for (const B of blobListOf(z)) {
    if (B.done) continue;
    B.t += dt; if (B.t < 0) continue;
    const p = Math.min(1, B.t / B.T);
    B.x = B.x0 + (B.x1 - B.x0) * p; B.y = B.y0 + (B.y1 - B.y0) * p;
    B.h = 96 * (1 - p) + Math.sin(p * Math.PI) * 30;
    B.actor.x = B.x; B.actor.y = B.y;
    if (p >= 1) {
      B.done = true; removeActor(w, B.actor);
      for (const f of aliveF(w)) if (inPool({ x: B.x1, y: B.y1 } as Pool, f)) hurtF(w, f, z.K.dmg * SPILL_DMG * z.dmgMul);
      w.fx('burst', 'SPLOSH!', B.x1, B.y1 - 30);
      addPool(w, z, B.x1, B.y1);
    }
  }
  z._blobs = blobListOf(z).filter((B) => !B.done);
}

/* ---------- rasteira ---------- */
/** Acerta a faixa baixa na frente e derruba (0,9 s). Exportado pros testes. */
export function sweepHit(w: World, z: Zombie): Fighter[] {
  const reach = z.K.F.ANIMS.sweep?.reach ?? 48, out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const d = (f.x - z.x) * z.face;
    if (d < -8 || d > reach || Math.abs(f.y - z.y) > 12) continue;
    hurtF(w, f, z.K.dmg * SWEEP_DMG * z.dmgMul, { heavy: true });
    if (!f.down && f.state !== 'kd' && f.state !== 'getup') {
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-z.face) as 1 | -1; }
      else stunF(w, f, SWEEP_KD, 'DERRUBADO');
    }
    out.push(f);
  }
  if (out.length) { w.fx('burst', 'RASTEIRA!', out[0].x, out[0].y - 50); w.shake = Math.max(w.shake, 0.14); w.hitstop = Math.max(w.hitstop ?? 0, 0.05); }
  spawnFx(w, 'dust', z.x + z.face * 30, z.y, z.face);
  return out;
}

function movesFor(z: Zombie): ZMove[] {
  return z.broken ? MOVES.filter((m) => m.anim !== 'sweep') : MOVES;
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const acaizeiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickBlobs(w, z, dt);
    tickPools(w, z, dt);
    if ((z.wobT ?? 0) > 0) z.wobT = Math.max(0, z.wobT - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 220) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'wobble') { // FRAQUEZA: de joelho, desequilibrado
      if (z.anim !== 'wobble' && z.K.F.ANIMS.wobble) setAnim(z, 'wobble');
      c.step();
      if ((z.wobT ?? 0) <= 0) { z.wobT = 0; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'sweep') {
          z.state = 'wobble'; z.wobT = WOBBLE_T; setAnim(z, z.K.F.ANIMS.wobble ? 'wobble' : 'idle');
          w.fx('tag', 'DESEQUILIBRADO!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = 0.6; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    if (c.adx < 96 && Math.abs(c.dy) < 32) {
      const mv = pickMove(c, movesFor(z));
      if (mv) { startMove(c, mv); if (mv.anim === 'spill') prepSpill(c); return; }
    }
    setAnim(z, 'walk');
    c.chase(SPEED, 30);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'spill') {
      if (fi === (A?.toss ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); throwBlobs(w, z); z.hit = true; }
      return;
    }
    if (z.anim === 'sweep') {
      if (fi === (A?.hit ?? 3)) { w.warns = w.warns.filter((t) => t.owner !== z); sweepHit(w, z); z.hit = true; }
      return;
    }
    if (z.anim === 'bash' && fi === A?.hit) { w.shake = Math.max(w.shake, 0.06); spawnFx(w, 'dust', z.x + z.face * 18, z.y, z.face); }
    moveFrame(c, fi, MOVES);
  },
};
