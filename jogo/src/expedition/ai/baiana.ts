// Zumbi Baiana do Acarajé (IA-43/44/45, variante local do Pelourinho): zumbi de ZONA, defende espaço com dendê.
// - IA-43 Panela de dendê (`splash`): de 40–110 px ergue a panela e arremessa o dendê fervendo em arco. Círculo de
//   aviso no ALVO desde o começo do golpe; no impacto 0,5x de dano em volta e uma POÇA que queima (raio 24 px, 5 s;
//   6 s enluarado; +25% de raio no plenilunar, que joga 2 panelas). Poça: 0,2x de dano a cada 0,5 s. Máximo de 3
//   poças ativas por baiana (a mais velha some). Poças ficam no chão depois que ela morre.
// - IA-44 Tabuleiro: golpe que vem DE FRENTE leva -25% enquanto o tabuleiro está erguido (idle/walk/bash). Por trás,
//   de lado (fora da frente) e depois do arremesso, dano pleno.
// - IA-45 Reabastecimento (FRAQUEZA): depois do `splash` fica ~1,0 s pondo a panela de volta e mexendo (`refill`),
//   sem atacar, e leva +20% de dano nessa janela. Morta ANTES de arremessar: a poça nasce pequena no próprio chão.
// - De perto: conchada (`attack`) e tabuleirada (`bash`, empurra 16 px). Devagar (~85% do Errante); mantém 60–100 px
//   enquanto a panela está pronta e só encosta quando ela está recarregando.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, rnd, setAnim, spawnFx, type ExtraActor, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 36, dy: 9, cd: 1.5, dmg: 0.9, word: 'TOING!' },
  { anim: 'bash', w: 2, max: 40, dy: 10, cd: 3, dmg: 0.8, push: 16, word: 'PÁ!' },
  { anim: 'splash', w: 2.5, min: 40, max: 110, dy: 30, cd: 7, dmg: 0 },
];

/** IA-44: dano de frente com o tabuleiro erguido */
export const TRAY_MUL = 0.75;
/** IA-45: janela de reabastecimento (s) e bônus de dano nela */
export const REFILL_T = 1.0;
export const REFILL_MUL = 1.2;
/** IA-43: poça de dendê */
export const POOL_R = 24;
export const MAX_POOLS = 3;
export const SPLASH_MUL = 0.5;
export const POOL_TICK_MUL = 0.2;
export const DENDE: Record<string, string> = { comum: '#ec841e', enluarado: '#5ae8d0', plenilunar: '#ff5a1e' };
/** vida da poça (s) por forma */
export const poolLife = (z: Zombie) => (z.form === 'enluarado' ? 6 : 5);
/** raio da poça (px) por forma */
export const poolR = (z: Zombie) => POOL_R * (z.form === 'plenilunar' ? 1.25 : 1);
/** panelas por arremesso */
export const potsOf = (z: Zombie) => (z.form === 'plenilunar' ? 2 : 1);
/** o motor (director) apaga poças com t >= 3,2 s: a vida extra entra como t inicial negativo */
const POOL_T_END = 3.2;

/** O golpe de `by` vem da frente da Baiana (lado para onde ela olha)? */
export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** IA-44: tabuleiro erguido (só parada, andando ou na tabuleirada). */
export function trayUp(z: Zombie): boolean {
  if (z.dead || z.air || z.down || z.state === 'hurt' || z.state === 'grabbed' || z.state === 'refill' || (z.refillT ?? 0) > 0) return false;
  return z.anim === 'idle' || z.anim === 'walk' || z.anim === 'bash';
}

const throwAt = (z: Zombie) => z.K.F.ANIMS.splash?.throwAt ?? 5;
/** Ainda vai arremessar (no meio da preparação do splash)? */
const splashPending = (z: Zombie) => z.state === 'attack' && z.anim === 'splash' && z.fi < throwAt(z);

/* ---------- poças ---------- */
interface DPool { x: number; y: number; t: number; c: string; dmg: number; r: number; life: number; owner: number; kind: 'dende'; tag: string }

/** Poças de dendê ativas desta baiana. */
export const poolsOf = (w: World, z: Zombie): DPool[] => (w.pools as DPool[]).filter((p) => p.kind === 'dende' && p.owner === z.uid && p.t < POOL_T_END);

/** Cria uma poça de dendê (respeita o máximo de 3 por baiana: a mais velha some). Exportado pros testes. */
export function addPool(w: World, z: Zombie, x: number, y: number, small = false): DPool {
  const mine = poolsOf(w, z);
  while (mine.length >= MAX_POOLS) {
    const old = mine.reduce((a, b) => (b.t > a.t ? b : a));
    w.pools.splice(w.pools.indexOf(old), 1); mine.splice(mine.indexOf(old), 1);
  }
  const life = small ? 3 : poolLife(z);
  // o director dá p.dmg × 0,5 a cada 0,5 s em quem pisa: p.dmg = 2 × 0,2x do dano base
  const p: DPool = { x, y: clampY(y), t: POOL_T_END - life, c: DENDE[z.form] || DENDE.comum, dmg: 2 * POOL_TICK_MUL * z.K.dmg * z.dmgMul, r: poolR(z) * (small ? 0.5 : 1), life, owner: z.uid, kind: 'dende', tag: 'queima' };
  w.pools.push(p);
  return p;
}

/* ---------- dendê voando ---------- */
interface Blob { x0: number; y0: number; x1: number; y1: number; x: number; y: number; h: number; t: number; T: number; done: boolean; actor: ExtraActor }

/** Alvos do arremesso (1 ou 2 panelas), presos no começo do golpe (o círculo de aviso aparece neles). */
export function splashTargets(w: World, z: Zombie, V: { x: number; y: number }): { x: number; y: number }[] {
  const d = Math.max(40, Math.min(110, Math.abs(V.x - z.x)));
  const out = [{ x: z.x + z.face * d, y: clampY(V.y) }];
  if (potsOf(z) > 1) {
    const other = aliveF(w).find((f) => f !== V && (f.x - z.x) * z.face > 30 && Math.abs(f.x - z.x) < 120);
    out.push(other ? { x: z.x + z.face * Math.max(40, Math.min(110, Math.abs(other.x - z.x))), y: clampY(other.y) } : { x: out[0].x - z.face * 26, y: clampY(out[0].y + (out[0].y < 176 ? 14 : -14)) });
  }
  return out;
}

function prepSplash(c: ZCtx): void {
  const { w, z, V } = c;
  const T = splashTargets(w, z, V), r = poolR(z);
  z._splashT = T;
  for (const t of T) w.warns.push({ kind: 'circle', x: t.x, y: t.y, r, owner: z, c: 'rgba(255,140,30,' } as any);
  w.fx('bubble', 'OLHA O DENDÊ!', z.x, z.y - z.K.top * 0.55);
}

function throwDende(w: World, z: Zombie): void {
  const T = (z._splashT as { x: number; y: number }[] | undefined) ?? [{ x: z.x + z.face * 70, y: z.y }];
  const list: Blob[] = (z._dende ??= []);
  T.forEach((t, k) => {
    const x0 = z.x + z.face * 14, y0 = z.y, dist = Math.abs(t.x - x0);
    const B: Blob = { x0, y0, x1: t.x, y1: t.y, x: x0, y: y0, h: 64, t: -k * 0.08, T: 0.2 + dist / 520, done: false, actor: null as unknown as ExtraActor };
    B.actor = {
      x: B.x, y: B.y, w0: 4,
      draw: (cx, cam) => {
        if (B.done || B.t < 0) return;
        const F = z.K.F, fi = Math.floor((w.clock ?? 0) * 14) % 4;
        const cv: any = F.framePose ? F.framePose(z.form, 'xDende', { st: fi }, 'xDende' + fi + '.0') : F.frame(z.form, 'xDende', fi, 5);
        if (!cv) return;
        cx.save(); cx.translate(Math.round(B.x - cam), Math.round(B.y - B.h)); if (B.x1 < B.x0) cx.scale(-1, 1);
        cx.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
        cx.restore();
      },
    };
    (w.actors ??= []).push(B.actor);
    list.push(B);
  });
  z._splashT = null;
}

function landBlob(w: World, z: Zombie, B: Blob): void {
  if (B.done) return;
  B.done = true;
  if (w.actors) { const i = w.actors.indexOf(B.actor); if (i >= 0) w.actors.splice(i, 1); }
  w.warns = w.warns.filter((t) => !(t.owner === z && t.kind === 'circle' && Math.abs((t.x ?? 0) - B.x1) < 1 && Math.abs(t.y - B.y1) < 1));
  const r = poolR(z);
  for (const f of aliveF(w)) if (Math.hypot(f.x - B.x1, (f.y - B.y1) * 2) < r) hurtF(w, f, z.K.dmg * SPLASH_MUL * z.dmgMul);
  addPool(w, z, B.x1, B.y1);
  spawnFx(w, 'acidSplash', B.x1, B.y1, 1, { cor: DENDE[z.form] || DENDE.comum });
  w.fx('burst', 'TCHÁ!', B.x1, B.y1 - 34);
}

/** Move o dendê no ar (arco) e cria a poça no impacto. Exportado pros testes. */
export function tickDende(w: World, z: Zombie, dt: number): void {
  const list = z._dende as Blob[] | undefined; if (!list?.length) return;
  for (const B of list) {
    if (B.done) continue;
    B.t += dt; if (B.t < 0) continue;
    const p = Math.min(1, B.t / B.T);
    B.x = B.x0 + (B.x1 - B.x0) * p; B.y = B.y0 + (B.y1 - B.y0) * p;
    B.h = 64 * (1 - p) + 4 + 30 * Math.sin(p * Math.PI);
    B.actor.x = B.x; B.actor.y = B.y;
    if (p >= 1) landBlob(w, z, B);
  }
  z._dende = list.filter((B) => !B.done);
}

/** Defesa (registrada em GUARDS): tabuleiro de frente (-25%), reabastecendo (+20%), morte antes de arremessar. */
export function baianaGuard(w: World, z: Zombie, dmg: number, _n: number, by?: { x: number } | null): number {
  let out = dmg;
  if (z.state === 'refill' || (z.refillT ?? 0) > 0) out = dmg * REFILL_MUL;
  else if (by && trayUp(z) && fromFront(z, by)) out = dmg * TRAY_MUL;
  if (Math.max(1, Math.round(out)) >= z.hp) { // golpe fatal
    for (const B of (z._dende as Blob[] | undefined) ?? []) landBlob(w, z, B); // o que já está no ar cai
    z._dende = [];
    if (splashPending(z)) { addPool(w, z, z.x + z.face * 6, z.y, true); z._splashT = null; w.warns = w.warns.filter((t) => t.owner !== z); }
  }
  return out;
}
(GUARDS as Record<string, Guard>).baiana = baianaGuard as Guard;

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }
const splashReady = (z: Zombie) => ((z._mv as { mcd: Record<string, number> } | undefined)?.mcd?.splash ?? 0) <= 0;

export const baiana: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickDende(w, z, dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'refill') { // IA-45: aberta, mexendo o tacho
      z.refillT = Math.max(0, (z.refillT ?? 0) - dt);
      if (z.anim !== 'refill' && z.anim !== 'idle') setAnim(z, z.K.F.ANIMS.refill ? 'refill' : 'idle');
      c.step();
      if (z.refillT <= 0) { z.refillT = 0; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'splash') {
          z.state = 'refill'; z.refillT = REFILL_T; setAnim(z, z.K.F.ANIMS.refill ? 'refill' : 'idle');
          w.fx('tag', 'REABASTECENDO!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = 0.6; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    const ready = splashReady(z) && !!z.K.F.ANIMS.splash;
    if ((ready ? c.adx <= 112 : c.adx < 50) && Math.abs(c.dy) < (ready ? 30 : 14)) {
      const mv = pickMove(c, MOVES);
      if (mv) { startMove(c, mv); if (mv.anim === 'splash') prepSplash(c); return; }
    }
    if (ready && c.adx < 56 && Math.abs(c.dy) < 16) { // panela pronta e alvo colado: recua pra abrir 60–100 px
      z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
      z.x -= z.face * 13 * dt; z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x));
      z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 10 * dt));
      setAnim(z, 'walk'); c.step(); return;
    }
    setAnim(z, 'walk');
    c.chase(16, ready ? 80 : 26);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c;
    if (z.anim === 'splash') {
      if (fi === throwAt(z)) { throwDende(w, z); spawnFx(w, 'dust', z.x + z.face * 8, z.y, z.face); }
      else if (fi === 2 && rnd() < 0.5) w.fx('tag', 'FERVENDO', z.x, z.y - z.K.top * 0.5 - 10);
      return;
    }
    moveFrame(c, fi, MOVES);
  },
};
