// Zumbi Peixeiro (IA-49..51, comum do Ver-o-Peso): peixeiro do Mercado de Peixe, avental de borracha e facão.
// - De perto: facão em duas (2 cortes ≈1,1x no total, avança no 2º) e golpe de cima com finta (cutelada de frente,
//   empurra 8 px).
// - De longe (40–120 px): arremesso de peixe pela cauda com faixa de aviso (320 ms). O peixe voa EM LINHA na faixa
//   (sair da faixa evita tudo) e onde cai/acerta deixa poça de água e escamas (raio 22 px, 6 s): -35% de velocidade
//   e o lutador escorrega (perde tração). No máximo 2 poças ativas por peixeiro. Plenilunar: 2 peixes em leque.
// - FRAQUEZA: depois do arremesso abre o isopor atrás de outro peixe (0,9 s) e leva +25% de dano. Sem peixe
//   (isopor vazio, a cada 3 arremessos) só usa facão por 3 s. O avental segura 10% do golpe de frente.
// - Em grupo alternam: se outro peixeiro está arremessando/abrindo o isopor, este avança em vez de arremessar.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

const MOVES: ZMove[] = [
  { anim: 'chop', w: 3, max: 38, dy: 9, cd: 1.6, dmg: 0.77, word: 'TÁC-TÁC!', lunge: [0, 0, 0, 0, 0, 40, 120, 20, 0] },
  { anim: 'hack', w: 1.5, max: 34, dy: 8, cd: 4, dmg: 1.2, push: 8, word: 'CHAC!', lunge: [20, 0, 0, 60, 0, 0, 0, 0] },
  { anim: 'throw', w: 2.5, min: 40, max: 120, dy: 10, cd: 6.5, dmg: 0, warn: 'lane' },
];
const MELEE = MOVES.filter((m) => m.anim !== 'throw');

/** janela do isopor aberto (s) e bônus de dano nela */
export const RESTOCK_T = 0.9;
export const RESTOCK_MUL = 1.25;
/** avental de borracha: golpe de frente passa 90% */
export const APRON_MUL = 0.9;
/** peixes no isopor antes de esvaziar; tempo só de facão quando vazio */
export const FISH_STOCK = 3;
export const EMPTY_T = 3;
/** poça: raio (px), duração (s), lentidão, máximo por peixeiro */
export const POOL_R = 22;
export const POOL_T = 6;
export const POOL_SLOW = 0.35;
export const POOL_MAX = 2;
/** peixe: velocidade (px/s), alcance mín/máx, dano relativo */
export const FISH_SPD = 230;
export const FISH_DMG = 0.7;

export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Defesa: isopor aberto = +25%; avental segura 10% de frente. */
export const peixeiroGuard: Guard = (_w, z, dmg, _n, by) => {
  if ((z.openT ?? 0) > 0) return dmg * RESTOCK_MUL;
  if (by && fromFront(z, by)) return dmg * APRON_MUL;
  return dmg;
};
(GUARDS as Record<string, Guard>).peixeiro = peixeiroGuard;

/* ---------- poças ---------- */
export interface Pool { x: number; y: number; t: number; end: number; actor: ExtraActor; done: boolean }

function drawProp(w: World, z: Zombie, anim: string, st: number, x: number, y: number, dir: number, c: CanvasRenderingContext2D, cam: number): void {
  const F = z.K.F; if (!F.ANIMS[anim]) return;
  const cv: any = F.framePose ? F.framePose(z.form, anim, { st }, anim + st + '.0') : F.frame(z.form, anim, st, 5);
  if (!cv) return;
  c.save(); c.translate(Math.round(x - cam), Math.round(y)); if (dir < 0) c.scale(-1, 1);
  c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
  c.restore();
}

function removeActor(w: World, a: ExtraActor): void {
  if (!w.actors) return; const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1);
}

export function poolsOf(z: Zombie): Pool[] { return (z._pools ??= []) as Pool[]; }

/** Cria poça (no máximo POOL_MAX por peixeiro: a mais antiga some). Exportado pros testes. */
export function addPool(w: World, z: Zombie, x: number, y: number): Pool {
  const list = poolsOf(z);
  while (list.length >= POOL_MAX) { const o = list.shift()!; o.done = true; removeActor(w, o.actor); }
  const now = w.clock ?? 0;
  const P: Pool = { x, y: clampY(y), t: 0, end: now + POOL_T, done: false, actor: null as unknown as ExtraActor };
  P.actor = {
    x, y: P.y - 10, w0: 0,
    draw: (c, cam) => {
      if (P.done || (w.clock ?? 0) >= P.end) { P.done = true; removeActor(w, P.actor); return; }
      drawProp(w, z, 'xPool', Math.floor((w.clock ?? 0) * 6) % 3, P.x, P.y, 1, c, cam);
    },
  };
  (w.actors ??= []).push(P.actor);
  list.push(P);
  spawnFx(w, 'dust', x, P.y, 1);
  return P;
}

/** Envelhece as poças e aplica o chão escorregadio em quem pisa. */
export function tickPools(w: World, z: Zombie, dt: number): void {
  const list = poolsOf(z);
  for (const P of list) {
    P.t += dt;
    if (P.t >= POOL_T) { P.done = true; removeActor(w, P.actor); continue; }
    for (const f of aliveF(w)) {
      if (Math.hypot(f.x - P.x, (f.y - P.y) * 2) > POOL_R) continue;
      if (!(f.slowT > 0)) w.fx('hurt', 'escorregou', f.x, f.y - 110);
      f.slowT = Math.max(f.slowT ?? 0, 0.4); f.slowK = Math.max(f.slowK ?? 0, POOL_SLOW);
      if (!f.down && f.state !== 'kd') f.x += f.face * 10 * dt; // perde tração: desliza pra onde olha
    }
  }
  z._pools = list.filter((P) => !P.done);
}

/* ---------- peixe arremessado (projétil em linha na faixa) ---------- */
export interface Fish { x: number; y: number; vx: number; range: number; gone: number; h: number; actor: ExtraActor; done: boolean }

export function fishOf(z: Zombie): Fish[] { return (z._fish ??= []) as Fish[]; }

/** Faixas do arremesso (plenilunar: 2 peixes em leque). */
export function lanesOf(z: Zombie): number[] {
  if (z.form !== 'plenilunar') return [z.y];
  const off = z.y < 176 ? 12 : -12;
  return [z.y, clampY(z.y + off)];
}

/** Lança os peixes (quadro `toss` da arte). Exportado pros testes. */
export function throwFish(w: World, z: Zombie, V: Fighter | null): Fish[] {
  const range = Math.min(120, Math.max(40, V ? Math.abs(V.x - z.x) : 90)) - 10; // medido da mão (14 px à frente)
  const out: Fish[] = [];
  for (const y of lanesOf(z)) {
    const F: Fish = { x: z.x + z.face * 14, y, vx: z.face * FISH_SPD, range, gone: 0, h: 58, done: false, actor: null as unknown as ExtraActor };
    F.actor = {
      x: F.x, y: F.y, w0: 4,
      draw: (c, cam) => {
        if (F.done || z.dead) { F.done = true; removeActor(w, F.actor); return; }
        drawProp(w, z, 'xFish', Math.floor((w.clock ?? 0) * 16) % 4, F.x, F.y - F.h, F.vx, c, cam);
      },
    };
    (w.actors ??= []).push(F.actor);
    fishOf(z).push(F); out.push(F);
  }
  z.fishN = (z.fishN ?? FISH_STOCK) - 1;
  w.fx('bubble', 'OLHA O PEIXE!', z.x, z.y - z.K.top * 0.55);
  return out;
}

/** Move os peixes; acerta quem estiver NA FAIXA (|dy| < 9) e deixa poça onde acerta ou cai. */
export function tickFish(w: World, z: Zombie, dt: number): void {
  for (const F of fishOf(z)) {
    if (F.done) continue;
    const dx = F.vx * dt; F.x += dx; F.gone += Math.abs(dx);
    const p = Math.min(1, F.gone / F.range);
    F.h = 58 * (1 - p) + 6 * p + Math.sin(p * Math.PI) * 10;
    F.actor.x = F.x; F.actor.y = F.y;
    for (const f of aliveF(w)) {
      if (f.down || Math.abs(f.y - F.y) >= 9 || Math.abs(f.x - F.x) > 10) continue;
      hurtF(w, f, z.K.dmg * FISH_DMG * z.dmgMul);
      w.fx('burst', 'PLOFT!', f.x, f.y - 66);
      spawnFx(w, 'impact', f.x, f.y - 50, (-Math.sign(F.vx) || 1) as 1 | -1);
      addPool(w, z, f.x, F.y);
      F.done = true; break;
    }
    if (!F.done && F.gone >= F.range) { addPool(w, z, F.x, F.y); F.done = true; }
    if (F.done) removeActor(w, F.actor);
  }
  z._fish = fishOf(z).filter((F) => !F.done);
}

/** Outro peixeiro já está arremessando / abrindo o isopor? (alternam em grupo) */
function partnerThrowing(w: World, z: Zombie): boolean {
  return w.zs.some((o) => o !== z && !o.dead && o.kind === z.kind && (o.move === 'throw' || o.state === 'restock') && Math.abs(o.x - z.x) < 200);
}

function movesFor(w: World, z: Zombie): ZMove[] {
  if ((z.noFishT ?? 0) > 0 || partnerThrowing(w, z)) return MELEE;
  return MOVES;
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const peixeiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickFish(w, z, dt);
    tickPools(w, z, dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    if ((z.noFishT ?? 0) > 0) { z.noFishT = Math.max(0, z.noFishT - dt); if (z.noFishT === 0) z.fishN = FISH_STOCK; }
    if (z.state === 'wander') { c.step(); if (c.adx < 220) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'restock') {
      if (z.anim !== 'restock' && z.K.F.ANIMS.restock) { z.openT = 0; toChase(z); return; }
      c.step();
      if (z.done || (z.openT ?? 0) <= 0) { z.openT = 0; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'throw') { // FRAQUEZA: abre o isopor atrás de outro peixe
          z.state = 'restock'; z.openT = RESTOCK_T; setAnim(z, z.K.F.ANIMS.restock ? 'restock' : 'idle');
          w.fx('tag', 'ABRIU O ISOPOR!', z.x, z.y - z.K.top * 0.5 - 14);
          if ((z.fishN ?? FISH_STOCK) <= 0) { z.noFishT = EMPTY_T; w.fx('tag', 'ISOPOR VAZIO!', z.x, z.y - z.K.top * 0.5 - 26); }
        } else { z.state = 'cool'; z.cd = 0.55; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    if (c.adx < 124 && Math.abs(c.dy) < 14) {
      const mv = pickMove(c, movesFor(w, z));
      if (mv) {
        startMove(c, mv);
        if (mv.anim === 'throw') for (const y of lanesOf(z).slice(1)) w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 130, y, owner: z } as any);
        return;
      }
    }
    setAnim(z, 'walk');
    c.chase(19, 26);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'throw') {
      if (fi === (A?.toss ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); throwFish(w, z, V); z.hit = true; }
      return;
    }
    if (z.anim === 'hack' && fi === A?.hit) { w.shake = Math.max(w.shake, 0.06); spawnFx(w, 'dust', z.x + z.face * 20, z.y, z.face); }
    moveFrame(c, fi, MOVES);
  },
};
