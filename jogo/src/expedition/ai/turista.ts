// Zumbi Turista (Pelourinho, raro; IA-46/47/48): viajante fotógrafo, frágil e fugidio. Atrapalha o squad sem bater forte.
// - Flash (IA-46): ergue a câmera (aviso ~300 ms + faixa/cone no chão) e dispara. Quem está no cone (90 px à frente)
//   OLHANDO pra ele fica ofuscado 1,0 s (1,3 s enluarado): -50% de chance de acertar. Fora do cone ou de costas: nada.
//   Recarga 6 s. Plenilunar: flash duplo em sequência.
// - Foge e fotografa (IA-47): colado (<40 px) foge em 60% das vezes em vez de golpear (senão, mochilada). A cada 9 s
//   foge 1,5 s e volta fotografando: pose parada (~1 s) em que leva +30% de dano; golpe POR TRÁS quebra a pose.
// - Clarão atrai (IA-48): o flash (e o clique da foto) faz até 2 zumbis comuns a 140 px mudarem de alvo para o
//   ponto do clarão por 2 s.
// - Mochilada: gira o corpo e bate com a mochila (0,8× dano, empurra 10 px), recarga 2 s.
// Estado no lutador: f.blindUntil (relógio do mundo) e f.blindK (chance de errar). O motor deve consultar
// `isBlind`/`blindMiss` no acerto do lutador para valer contra QUALQUER zumbi; aqui já vale contra o próprio Turista.
import type { ZombieAI, ZCtx } from './index';
import { aliveF, clampY, setAnim, spawnFx, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const TUR = {
  /** cone do flash: alcance à frente (px), meia-largura vertical na boca e abertura por px */
  coneR: 90, coneY0: 10, coneK: 0.3,
  blindT: { comum: 1.0, enluarado: 1.3, plenilunar: 1.0 } as Record<string, number>,
  /** chance de errar o golpe enquanto ofuscado */
  missK: 0.5,
  flashCd: 6,
  /** plenilunar: segundo flash depois de (s) */
  flash2Dt: 0.35,
  /** foge quando o alvo chega a menos de (px), com chance */
  near: 40, fleeChance: 0.6, fleeSpd: 70, fleeT: 1.5,
  /** a cada (s) foge e volta fotografando */
  snapEvery: 9, snapMul: 1.3,
  /** distância preferida do alvo */
  keepMin: 80, keepMax: 130,
  lureR: 140, lureMax: 2, lureT: 2,
};
/** zumbis "comuns" que o clarão consegue puxar (IA simples de perseguição) */
export const LURE_KINDS = ['errante', 'corredor', 'rastejante', 'cuspidor'];

const MOVES: ZMove[] = [
  { anim: 'bag', w: 2, max: 32, dy: 9, cd: 2, dmg: 0.8, push: 10, word: 'PÁ!', lunge: [0, 0, 0, 40, 30, 0, 0, 0] },
];
const FLASH_MOVE: ZMove = { anim: 'flash', w: 3, min: 20, max: 90, dy: 14, cd: TUR.flashCd, dmg: 0 };

/* ---------- ofuscamento ---------- */
export const isBlind = (w: World, f: Fighter): boolean => (f.blindUntil ?? -1) > (w.clock ?? 0);
/** O golpe do lutador ofuscado erra? (r = sorteio 0..1) */
export const blindMiss = (w: World, f: Fighter, r = Math.random()): boolean => isBlind(w, f) && r < (f.blindK ?? TUR.missK);

/** Está no cone do flash e olhando para o Turista? */
export function inCone(z: Zombie, f: Fighter): boolean {
  const d = (f.x - z.x) * z.face;
  if (d <= 0 || d > TUR.coneR) return false;
  if (Math.abs(f.y - z.y) > TUR.coneY0 + d * TUR.coneK) return false;
  return f.face === (Math.sign(z.x - f.x) || f.face); // de frente pra ele
}

/** Dispara o flash: ofusca quem está no cone e atrai zumbis comuns para o clarão. Retorna os ofuscados. */
export function doFlash(w: World, z: Zombie): Fighter[] {
  const t = TUR.blindT[z.form] ?? TUR.blindT.comum, out: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (!inCone(z, f)) continue;
    f.blindUntil = Math.max(f.blindUntil ?? 0, (w.clock ?? 0) + t); f.blindK = TUR.missK;
    w.fx('tag', 'OFUSCADO', f.x, f.y - 96);
    out.push(f);
  }
  z.flashN = (z.flashN ?? 0) + 1;
  (w as any).whiteT = Math.max((w as any).whiteT ?? 0, out.length ? 0.22 : 0.1); // tela clareia (render: ver relatório)
  w.fx('burst', 'FLASH!', z.x + z.face * 18, z.y - z.K.top * 0.9);
  spawnFx(w, 'impact', z.x + z.face * 14, z.y - z.K.top * 0.82, z.face);
  lureZombies(w, z, z.x + z.face * TUR.coneR * 0.5, z.y);
  if (out.length) w.log(`${z.K.nome} cegou ${out.length} com o flash`);
  return out;
}

/** Alvo falso no ponto do clarão (estado 'kd' = invulnerável: golpes nele não fazem nada). */
function lureTarget(x: number, y: number): Fighter {
  return { x, y: clampY(y), z: 0, face: 1, hp: 1, maxhp: 1, sp: 0, state: 'kd', anim: 'idle', fi: 0, acc: 0, done: false, down: false, stunT: 0, dodge: null, lure: true, m: { nome: 'clarão' } } as unknown as Fighter;
}

/** IA-48: até 2 zumbis comuns a 140 px mudam de alvo para (x,y) por 2 s. */
export function lureZombies(w: World, z: Zombie, x: number, y: number): Zombie[] {
  const near = w.zs.filter((o) => o !== z && !o.dead && !o.boss && !o.down && !o.air && LURE_KINDS.includes(o.kind)
    && Math.hypot(o.x - z.x, (o.y - z.y) * 2) < TUR.lureR)
    .sort((a, b) => Math.abs(a.x - z.x) - Math.abs(b.x - z.x)).slice(0, TUR.lureMax);
  const T = lureTarget(x, y);
  for (const o of near) { o.tg = T; o.tgT = TUR.lureT; w.fx('tag', '!', o.x, o.y - o.K.top - 4); }
  return near;
}

/* ---------- defesa: erro por cegueira, janela da foto ---------- */
export function turistaGuard(w: World, z: Zombie, dmg: number, _n: number, by?: Fighter | null): number | null {
  if (by && blindMiss(w, by)) { w.fx('tag', 'ERROU!', z.x, z.y - z.K.top - 6); return null; }
  if (z.state === 'snap') {
    const behind = !!by && Math.sign(by.x - z.x) === -z.face;
    if (behind) { // quebra a pose
      z.prev = 'keep'; z.state = 'hurt'; setAnim(z, 'hurt');
      w.fx('tag', 'POSE QUEBRADA', z.x, z.y - z.K.top - 8);
    }
    return dmg * TUR.snapMul;
  }
  return dmg;
}
(GUARDS as Record<string, Guard>).turista = turistaGuard;

/* ---------- comportamento ---------- */
function toKeep(z: Zombie): void { z.state = 'keep'; setAnim(z, 'walk'); }
function startFlee(w: World, z: Zombie, V: Fighter, snapAfter: boolean): void {
  z.state = 'flee'; z.fleeT = TUR.fleeT; z.snapAfter = snapAfter; z.fdir = (Math.sign(z.x - V.x) || -z.face) as 1 | -1;
  z.fcurve = z.y < 176 ? 1 : -1; setAnim(z, 'flee'); z.face = z.fdir;
  w.fx('tag', 'FUGIU', z.x, z.y - z.K.top - 6);
}
function startSnap(c: ZCtx): void {
  const { z, w } = c;
  z.state = 'snap'; z.snapClock = 0; z.face = (Math.sign(c.dx) || z.face) as 1 | -1; setAnim(z, 'snap');
  w.fx('bubble', 'XIIS!', z.x, z.y - z.K.top * 0.9);
}

export const turista: ZombieAI = {
  rest: 'keep',
  update(c: ZCtx) {
    const { z, w, dt, V } = c;
    tickMoves(z, dt);
    z.snapClock = (z.snapClock ?? 0) + dt;
    z.nearCd = Math.max(0, (z.nearCd ?? 0) - dt);
    if (z.flash2 != null && (w.clock ?? 0) >= z.flash2) { z.flash2 = null; doFlash(w, z); }
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toKeep(z); return; }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = 0.4; setAnim(z, 'idle'); }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toKeep(z); return; }
    if (z.state === 'flee') {
      if (z.anim !== 'flee') setAnim(z, 'flee');
      z.fleeT = (z.fleeT ?? 0) - dt;
      z.face = z.fdir ?? z.face;
      z.x = Math.max(w.cam + 18, Math.min(w.cam + w.W - 18, z.x + z.face * TUR.fleeSpd * dt));
      z.y = clampY(z.y + (z.fcurve ?? 1) * 22 * Math.cos(((TUR.fleeT - z.fleeT) / TUR.fleeT) * Math.PI) * dt); // semicurva
      c.step();
      if (z.fleeT <= 0) { if (z.snapAfter) startSnap(c); else toKeep(z); }
      return;
    }
    if (z.state === 'snap') {
      if (z.anim !== 'snap') { toKeep(z); return; }
      c.step(true);
      if (z.done) { z.state = 'cool'; z.cd = 0.3; setAnim(z, 'idle'); }
      return;
    }
    // ---- 'keep': mantém 80–130 px, flash quando der, foge de quem cola ----
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (c.adx < TUR.near && Math.abs(c.dy) < 14 && z.nearCd <= 0) {
      z.nearCd = 1.2;
      if (Math.random() < TUR.fleeChance) { startFlee(w, z, V, false); return; }
      const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; }
    }
    if (z.snapClock >= TUR.snapEvery) { startFlee(w, z, V, true); return; }
    if (c.adx <= FLASH_MOVE.max && c.adx >= (FLASH_MOVE.min ?? 0) && Math.abs(c.dy) <= (FLASH_MOVE.dy ?? 9) && !(z._mv?.mcd?.flash > 0)) {
      startMove(c, FLASH_MOVE);
      const R = TUR.coneR;
      w.warns.push({ kind: 'lane', x0: z.x + z.face * 6, x1: z.x + z.face * R, y: z.y, owner: z, c: '#fff2cc' } as any); // cone de luz no chão
      w.fx('bubble', 'OLHA O PASSARINHO!', z.x, z.y - z.K.top * 0.9);
      return;
    }
    const want = c.adx > TUR.keepMax ? 1 : c.adx < TUR.keepMin ? -1 : 0;
    const vy = Math.abs(c.dy) > 3 ? Math.sign(c.dy) * 14 : 0;
    z.x = Math.max(w.cam + 18, Math.min(w.cam + w.W - 18, z.x + Math.sign(c.dx) * want * (want > 0 ? 24 : 28) * dt));
    z.y = clampY(z.y + vy * dt);
    setAnim(z, want !== 0 || vy !== 0 ? 'walk' : z.K.F.ANIMS.idle ? 'idle' : 'walk');
    c.step();
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'flash') {
      if (fi === (A?.flashAt ?? 4)) {
        w.warns = w.warns.filter((t) => t.owner !== z);
        doFlash(w, z);
        if (z.form === 'plenilunar') z.flash2 = (w.clock ?? 0) + TUR.flash2Dt;
      }
      return;
    }
    if (z.anim === 'snap') {
      if (fi === (A?.snapAt ?? 4)) { lureZombies(w, z, z.x + z.face * 40, z.y); w.fx('burst', 'CLIC!', z.x + z.face * 16, z.y - z.K.top * 0.8); }
      return;
    }
    moveFrame(c, fi, MOVES);
  },
  spawn(w, i, fromLeft) {
    return { x: fromLeft ? w.cam - 24 - i * 14 : w.cam + w.W + 24 + i * 14, y: 150 + Math.random() * 50, face: fromLeft ? 1 : -1, state: 'keep', anim: 'walk' };
  },
};
