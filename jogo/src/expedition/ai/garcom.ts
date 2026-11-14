// Zumbi Garçom (IA-58..60, comum da Lapa): garçom de boteco que "serve a morte". Servidor esquivo.
// - Leque de copos (`fan`, IA-58): arma a bandeja com aviso em cone no chão (3 faixas, 260 ms); no quadro `throwAt`
//   lança 3 tulipas (4 enluarado, 5 plenilunar) espalhadas em ±18°, 0,5x de dano cada. Onde a tulipa acerta ou cai
//   ficam cacos (raio 10 px, 3 s): 0,15x a cada 0,5 s em quem pisa. Recarga 5 s. Alcance 40–110 px.
// - Bandejada (`slam`): golpe chapado com a bandeja de lado, 0,9x, empurra 12 px, recarga 1,8 s.
// - Giro de desvio (`spin`, IA-59): golpe DE FRENTE tem chance de ser esquivado (25% / 30% enluarado / 35% plenilunar;
//   laser metade) — roda com a bandeja e contra-ataca com bandejada se o alvo continuar perto. Recarga 3 s.
//   De costas nunca esquiva.
// - FRAQUEZA (IA-60): depois do leque fica com a BANDEJA VAZIA 1,3 s (anim `empty`): não gira nem ataca e leva +30%.
//   A bandeja quebra depois de 4 acertos de frente: sem giro e sem leque; passa a usar a garrafa (`slamX`) e as
//   anims sem bandeja (`idleX`/`walkX`).
// - Tático: com o leque pronto mantém 55–105 px (recua se o alvo chega perto); sem leque, vai pra bandejada.
// Campos reaproveitados no Zombie: openT (janela vulnerável), gingaReady (recarga do giro), gdir (lado do giro).
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const GARCOM = {
  fanSpread: 18, glassDmg: 0.5, glassSpd: 210, fanMin: 40, fanMax: 110, glassHitX: 9, glassHitY: 7,
  shardR: 10, shardLife: 3, shardTick: 0.5, shardDmg: 0.15,
  spinCd: 3, emptyT: 1.3, emptyMul: 1.3, trayHits: 4,
  keepMin: 55, keepMax: 105,
};
/** copos por leque */
export const glassCount = (z: Zombie) => (z.form === 'plenilunar' ? 5 : z.form === 'enluarado' ? 4 : 3);
/** chance de girar (golpe de frente) */
export const spinChance = (z: Zombie) => (z.form === 'plenilunar' ? 0.35 : z.form === 'enluarado' ? 0.3 : 0.25);

const MOVES: ZMove[] = [
  { anim: 'slam', w: 3, max: 34, dy: 9, cd: 1.8, dmg: 0.9, push: 12, word: 'PLANC!', lunge: [0, 0, 0, 60, 30, 0, 0, 0] },
  { anim: 'fan', w: 3, min: GARCOM.fanMin, max: GARCOM.fanMax, dy: 14, cd: 5, dmg: 0 },
];
const NOTRAY: ZMove[] = [
  { anim: 'slamX', w: 1, max: 32, dy: 9, cd: 1.8, dmg: 0.9, push: 8, word: 'TOINC!', lunge: [0, 0, 60, 30, 0, 0, 0] },
];
const COUNTER = MOVES[0];
const now = (w: World) => w.clock ?? 0;

/** anim respeitando a bandeja quebrada */
export function animFor(z: Zombie, a: 'idle' | 'walk'): string {
  const x = a + 'X';
  return z.trayBroken && z.K.F.ANIMS[x] ? x : a;
}

export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Pode girar agora? (bandeja inteira, fora de golpe/vazio/chão/tontura, recarga ok) */
export function canSpin(w: World, z: Zombie): boolean {
  if (z.dead || z.air || z.down || z.stun > 0 || (z.openT ?? 0) > 0 || z.trayBroken) return false;
  if (['attack', 'empty', 'hurt', 'grabbed', 'spin', 'down', 'boom'].includes(z.state)) return false;
  return now(w) >= (z.gingaReady ?? 0);
}

/** Defesa (registrada em GUARDS): null = girou e saiu do golpe. */
export const garcomGuard: Guard = (w, z, dmg, _n, by) => {
  if (z.state === 'spin' && z.anim === 'spin' && z.fi <= 4) return null; // no meio do giro: passa batido
  if ((z.openT ?? 0) > 0) return dmg * GARCOM.emptyMul;
  if (!by || !fromFront(z, by)) return dmg;
  if (canSpin(w, z)) {
    const ch = spinChance(z) * (by.w?.tipo === 'beam' ? 0.5 : 1);
    if (Math.random() < ch) { spin(w, z, by); return null; } // Math.random direto (simulável nos testes)
  }
  // acerto de frente: a bandeja (escudo) vai amassando
  if (!z.trayBroken) {
    z.trayN = (z.trayN ?? 0) + 1;
    if (z.trayN >= GARCOM.trayHits) breakTray(w, z);
  }
  return dmg;
};
(GUARDS as Record<string, Guard>).garcom = garcomGuard;

export function breakTray(w: World, z: Zombie): void {
  z.trayBroken = true;
  (z as Zombie & { formSfx?: string }).formSfx = 'sem'; // arte sem bandeja/copos em todas as anims (hurt, fall, death...)
  w.fx('tag', 'BANDEJA QUEBROU!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'impact', z.x - z.face * 8, z.y - z.K.top * 0.75, (-z.face) as 1 | -1);
  addShards(w, z, z.x - z.face * 10, z.y);
  if (z.anim === 'idle' || z.anim === 'walk') setAnim(z, animFor(z, z.anim));
  w.log(`${z.K.nome} perdeu a bandeja`);
}

function spin(w: World, z: Zombie, by: Fighter): void {
  endMove(w, z);
  z.gingaReady = now(w) + GARCOM.spinCd;
  z.state = 'spin'; z.hit = false;
  z.face = (Math.sign(by.x - z.x) || z.face) as 1 | -1;
  z.gdir = z.y < 176 ? 1 : -1;
  setAnim(z, z.K.F.ANIMS.spin ? 'spin' : 'idle');
  w.fx('tag', 'GIROU!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1);
  w.log(`${z.K.nome} girou com a bandeja e saiu do golpe`);
}

/* ---------- adereços ---------- */
function removeActor(w: World, a: ExtraActor): void { if (!w.actors) return; const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); }
function drawProp(z: Zombie, anim: string, st: number, x: number, y: number, dir: number, c: CanvasRenderingContext2D, cam: number): void {
  const F = z.K.F; if (!F.ANIMS[anim]) return;
  const cv: any = F.framePose ? F.framePose(z.form, anim, { st }, anim + st + '.0') : F.frame(z.form, anim, st, 5);
  if (!cv) return;
  c.save(); c.translate(Math.round(x - cam), Math.round(y)); if (dir < 0) c.scale(-1, 1);
  c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
  c.restore();
}

/* ---------- cacos no chão ---------- */
export interface Shard { x: number; y: number; t: number; next: Map<Fighter, number>; actor: ExtraActor; done: boolean }
export const shardsOf = (z: Zombie): Shard[] => (z._shards ??= []) as Shard[];

export function addShards(w: World, z: Zombie, x: number, y: number): Shard {
  const S: Shard = { x, y: clampY(y), t: 0, next: new Map(), done: false, actor: null as unknown as ExtraActor };
  const end = now(w) + GARCOM.shardLife;
  S.actor = {
    x, y: S.y - 12, w0: 0, // y menor: desenhado antes (no chão)
    draw: (c, cam) => {
      if (S.done || now(w) >= end) { S.done = true; removeActor(w, S.actor); return; }
      drawProp(z, 'xShard', Math.floor(now(w) * 8) % 3, S.x, S.y, 1, c, cam);
    },
  };
  (w.actors ??= []).push(S.actor);
  shardsOf(z).push(S);
  return S;
}

/** Envelhece os cacos e corta quem pisa (0,15x a cada 0,5 s). */
export function tickShards(w: World, z: Zombie, dt: number): void {
  for (const S of shardsOf(z)) {
    S.t += dt;
    if (S.t >= GARCOM.shardLife) { S.done = true; removeActor(w, S.actor); continue; }
    for (const f of aliveF(w)) {
      if (f.down || Math.hypot(f.x - S.x, (f.y - S.y) * 2) > GARCOM.shardR) continue;
      const nx = S.next.get(f) ?? 0;
      if (S.t < nx) continue;
      S.next.set(f, S.t + GARCOM.shardTick);
      hurtF(w, f, z.K.dmg * GARCOM.shardDmg * z.dmgMul);
      w.fx('hurt', 'cacos!', f.x, f.y - 100);
    }
  }
  z._shards = shardsOf(z).filter((S) => !S.done);
}

/* ---------- tulipas em leque ---------- */
export interface Glass { x: number; y: number; vx: number; vy: number; range: number; gone: number; h: number; actor: ExtraActor; done: boolean }
export const glassesOf = (z: Zombie): Glass[] => (z._glasses ??= []) as Glass[];

/** ângulos do leque (graus) */
export function fanAngles(n: number): number[] {
  if (n <= 1) return [0];
  const s = GARCOM.fanSpread; return Array.from({ length: n }, (_, i) => -s + (2 * s * i) / (n - 1));
}
/** profundidade do chão comprimida (2,5D) */
const DEPTH = 0.55;

/** Faixas do aviso em cone (centro + bordas no meio do caminho). */
export function fanLanes(z: Zombie): number[] {
  const o = Math.tan((GARCOM.fanSpread * Math.PI) / 180) * DEPTH * GARCOM.fanMax * 0.6;
  return [z.y, clampY(z.y - o), clampY(z.y + o)];
}

/** Lança as tulipas (quadro `throwAt`). Exportado pros testes. */
export function throwGlasses(w: World, z: Zombie, V: Fighter | null): Glass[] {
  const range = Math.min(GARCOM.fanMax, Math.max(GARCOM.fanMin, V ? Math.hypot(V.x - z.x, (V.y - z.y) / DEPTH) + 6 : 90)) - 8;
  const out: Glass[] = [];
  for (const a of fanAngles(glassCount(z))) {
    const r = (a * Math.PI) / 180;
    const G: Glass = { x: z.x + z.face * 10, y: z.y, vx: z.face * Math.cos(r) * GARCOM.glassSpd, vy: Math.sin(r) * GARCOM.glassSpd * DEPTH, range, gone: 0, h: 64, done: false, actor: null as unknown as ExtraActor };
    G.actor = {
      x: G.x, y: G.y, w0: 3,
      draw: (c, cam) => {
        if (G.done) { removeActor(w, G.actor); return; }
        drawProp(z, 'xGlass', Math.floor(now(w) * 16) % 4, G.x, G.y - G.h, G.vx, c, cam);
      },
    };
    (w.actors ??= []).push(G.actor);
    glassesOf(z).push(G); out.push(G);
  }
  w.fx('bubble', 'SAINDO UM CHOPE!', z.x, z.y - z.K.top * 0.55);
  return out;
}

/** Move as tulipas; cada uma acerta 1 lutador (0,5x) e vira cacos onde acerta ou cai. */
export function tickGlasses(w: World, z: Zombie, dt: number): void {
  for (const G of glassesOf(z)) {
    if (G.done) continue;
    const dx = G.vx * dt, dy = G.vy * dt; G.x += dx; G.y = clampY(G.y + dy); G.gone += Math.hypot(dx, dy / DEPTH);
    const p = Math.min(1, G.gone / G.range);
    G.h = 64 * (1 - p) + 4 * p + Math.sin(p * Math.PI) * 12;
    G.actor.x = G.x; G.actor.y = G.y;
    for (const f of aliveF(w)) {
      if (f.down || Math.abs(f.y - G.y) >= GARCOM.glassHitY || Math.abs(f.x - G.x) > GARCOM.glassHitX) continue;
      hurtF(w, f, z.K.dmg * GARCOM.glassDmg * z.dmgMul);
      w.fx('burst', 'CRASH!', f.x, f.y - 66);
      spawnFx(w, 'impact', f.x, f.y - 56, (-Math.sign(G.vx) || 1) as 1 | -1);
      addShards(w, z, f.x, G.y);
      G.done = true; break;
    }
    if (!G.done && G.gone >= G.range) { addShards(w, z, G.x, G.y); G.done = true; }
    if (G.done) removeActor(w, G.actor);
  }
  z._glasses = glassesOf(z).filter((G) => !G.done);
}

const fanReady = (z: Zombie) => !z.trayBroken && ((z._mv?.mcd?.fan ?? 0) <= 0) && !!z.K.F.ANIMS.fan;
function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, animFor(z, 'walk')); }

export const garcom: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickGlasses(w, z, dt);
    tickShards(w, z, dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 220) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert && !z.trayBroken ? 'alert' : animFor(z, 'idle')); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'spin') {
      if (z.anim !== 'spin') { toChase(z); return; }
      if (z.fi >= 1 && z.fi <= 5) { z.y = clampY(z.y + (z.gdir ?? 1) * 30 * dt); z.x -= z.face * 26 * dt; }
      c.step();
      if (z.done) {
        z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
        if (c.adx < 40 && Math.abs(c.dy) < 12 && z.K.F.ANIMS.slam && !z.trayBroken) { startMove(c, COUNTER); w.fx('tag', 'CONTRA!', z.x, z.y - z.K.top * 0.5 - 14); }
        else toChase(z);
      }
      return;
    }
    if (z.state === 'empty') { // FRAQUEZA: bandeja vazia
      if (z.anim !== 'empty' && z.K.F.ANIMS.empty) { z.openT = 0; toChase(z); return; }
      c.step();
      if (z.done || (z.openT ?? 0) <= 0) { z.openT = 0; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      moveStep(c, z.trayBroken ? NOTRAY : MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'fan') {
          z.state = 'empty'; z.openT = GARCOM.emptyT; setAnim(z, z.K.F.ANIMS.empty ? 'empty' : animFor(z, 'idle'));
          w.fx('tag', 'BANDEJA VAZIA!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = 0.5; setAnim(z, animFor(z, 'idle')); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    const list = z.trayBroken ? NOTRAY : MOVES;
    if (c.adx < 116 && Math.abs(c.dy) < 16) {
      const mv = pickMove(c, list);
      if (mv) {
        startMove(c, mv);
        if (mv.anim === 'fan') for (const y of fanLanes(z)) w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * (GARCOM.fanMax + 6), y, owner: z } as any);
        return;
      }
    }
    // mantém distância de leque quando ele está pronto
    if (fanReady(z) && c.adx < GARCOM.keepMin && Math.abs(c.dy) < 30) {
      z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
      z.x -= z.face * 20 * dt; z.x = Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x));
      setAnim(z, animFor(z, 'walk')); c.step();
      return;
    }
    setAnim(z, animFor(z, 'walk'));
    c.chase(20, fanReady(z) ? GARCOM.keepMax - 20 : 26);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'fan') {
      if (fi === (A?.throwAt ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); throwGlasses(w, z, V); z.hit = true; }
      return;
    }
    if ((z.anim === 'slam' || z.anim === 'slamX') && fi === A?.hit) w.shake = Math.max(w.shake, 0.05);
    moveFrame(c, fi, z.trayBroken ? NOTRAY : MOVES);
  },
};
