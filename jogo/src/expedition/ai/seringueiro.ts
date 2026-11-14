// Zumbi Seringueiro (IA-35–38, Amazônia; comum humano): trabalhador do ciclo da borracha. Controla o espaço com látex.
// - Talho de sangria (attack): facão alto 150 ms, 2 cortes diagonais ≈1,0× no total, alcance 36 px, o 2º corte avança
//   ~8 px. Recarga 1,6 s.
// - Jato de látex (throw): alvo a 70–150 px; puxa o balde pra trás (~500 ms, círculo r 28 marcado no alvo) e lança em
//   arco no quadro `throwAt`. Quem estiver no círculo quando o látex cai: 0,4× de dano + PRESO 1,5 s (stunF, como o
//   laço do peão). Deixa POÇA DE LÁTEX 4 s (LENTO 40%: f.slowT/f.slowK). Enluarado: 1,3× de área; plenilunar: 2
//   círculos. Recarga 7 s.
// - Balde na cara (bucket): braço atrás 200 ms, 0,7× + ATORDOADO 0,4 s, empurra 14 px, alcance 30 px, recarga 3 s.
// - Passivos: de noite/Lua a lamparina vê o alvo a 300 px (de dia 230). Alvo PRESO por ele leva ×1,25 do próximo golpe
//   dele ("gruda").
// - FRAQUEZA: depois do jato fica SEM BALDE 4 s (sem jato) e então faz `refill` (~1,2 s) ABERTO: dano ×1,5.
//   FOGO queima o látex: poça em chamas dá ×1,5 de dano e QUEIMANDO em zumbis em cima dela. Fontes de fogo hoje: o laser
//   (arma 'beam') acertando um seringueiro perto de poça, e a lamparina dele que cai na morte. `igniteAt` fica exportado
//   pra futuras armas de fogo. Bater nas COSTAS ignora a postura: interrompe golpe/refill e conta postura em dobro.
// - Tática: vaga até ver o alvo; de longe usa o jato em quem está mais isolado; de perto talho ou balde; com o jato
//   pronto fica a 90–130 px (atrás da horda); evita ficar em cima da própria poça.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, damageZ } from '../combat';
import { hurtF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

/** Talho: 2 quadros de dano; moveFrame divide por 1,4 → 2 × 0,7/1,4 = 1,0× no total. */
export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 36, dy: 9, cd: 1.6, dmg: 0.7, word: 'TALHO!', lunge: [0, 0, 0, 0, 50, 55, 0, 0, 0] },
  { anim: 'bucket', w: 2, max: 30, dy: 9, cd: 3, dmg: 0.7, push: 14, stun: 0.4, stunTag: 'ATORDOADO', word: 'BLÓNG!' },
];

export const JET_MIN = 70;
export const JET_MAX = 150;
export const JET_R = 28;
export const jetR = (z: Zombie) => (z.form === 'enluarado' ? JET_R * Math.sqrt(1.3) : JET_R);
export const jetCount = (z: Zombie) => (z.form === 'plenilunar' ? 2 : 1);
export const JET_DMG = 0.4;
export const PRESO_T = 1.5;
export const JET_CD = 7;
/** tempo de voo do látex (s) */
export const JET_FLY = 0.32;
export const POOL_T = 4;
export const POOL_SLOW = 0.4;
export const NOBUCKET_T = 4;
export const OPEN_MUL = 1.5;
export const GRUDE_MUL = 1.25;
/** tempo extra (depois do PRESO) em que o alvo continua "grudado" pro ×1,25 */
export const GRUDE_GRACE = 1.5;
export const FIRE_MUL = 1.5;
export const FIRE_T = 3;
export const FIRE_TICK = 0.5;
export const SIGHT_DAY = 230;
export const SIGHT_NIGHT = 300;

const clock = (w: World) => w.clock ?? 0;
const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, (a.y - b.y) * 2);

/** Alcance de visão: a lamparina enxerga mais de noite/Lua. */
export const sightR = (w: World) => (w.mode === 'noite' || w.mode === 'lua' ? SIGHT_NIGHT : SIGHT_DAY);

/* ---------- poças de látex (no mundo: sobrevivem ao dono) ---------- */
export interface LatexPool { x: number; y: number; r: number; t: number; owner: number; form: string; fire: number; burnAcc: number; done: boolean; actor: ExtraActor }
export const poolsOf = (w: World): LatexPool[] => ((w as any)._latex ??= []) as LatexPool[];
export const inPool = (p: LatexPool, o: { x: number; y: number }) => near(p, o) <= p.r;
const removeActor = (w: World, a: ExtraActor) => { if (!w.actors) return; const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); };

function drawProp(z: Zombie, form: string, anim: string, st: number, x: number, y: number, sx: number, c: CanvasRenderingContext2D, cam: number): void {
  const F = z.K.F; if (!F?.ANIMS?.[anim]) return;
  const cv: any = F.framePose ? F.framePose(form, anim, { st }, anim + st + '.0') : F.frame(form, anim, st, 5);
  if (!cv) return;
  c.save(); c.translate(Math.round(x - cam), Math.round(y)); c.scale(sx, sx);
  c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
  c.restore();
}

/** Cria uma poça de látex (r = raio do círculo do jato). Exportado pros testes. */
export function addPool(w: World, z: Zombie, x: number, y: number, r = jetR(z)): LatexPool {
  const P: LatexPool = { x, y: clampY(y), r, t: 0, owner: z.uid, form: z.form, fire: 0, burnAcc: 0, done: false, actor: null as unknown as ExtraActor };
  P.actor = {
    x, y: P.y - 12, w0: 0,
    draw: (c, cam) => {
      tickLatex(w); // as poças envelhecem mesmo sem seringueiro vivo (relógio do mundo)
      if (P.done) { removeActor(w, P.actor); return; }
      const st = (P.fire > 0 ? 3 : 0) + (Math.floor(clock(w) * 6) % 3);
      drawProp(z, P.form, 'xPool', st, P.x, P.y, P.r / JET_R, c, cam);
    },
  };
  (w.actors ??= []).push(P.actor);
  poolsOf(w).push(P);
  return P;
}

/** Põe fogo nas poças dentro de `r` px de (x,y). Retorna quantas pegaram fogo. */
export function igniteAt(w: World, x: number, y: number, r = 30): number {
  let n = 0;
  for (const p of poolsOf(w)) {
    if (p.done || p.fire > 0 || near(p, { x, y }) > p.r + r) continue;
    p.fire = FIRE_T; p.t = Math.min(p.t, POOL_T - FIRE_T); n++;
    w.fx('burst', 'FOGO!', p.x, p.y - 30);
    spawnFx(w, 'dust', p.x, p.y, 1);
  }
  if (n) w.log(`o látex pegou fogo (${n} poça${n > 1 ? 's' : ''})`);
  return n;
}

/** Avança as poças pelo relógio do mundo (idempotente: só anda o tempo que passou). */
export function tickLatex(w: World): void {
  const W = w as any, now = clock(w), dt = Math.max(0, Math.min(0.1, now - (W._latexClock ?? now)));
  W._latexClock = now;
  if (dt <= 0) return;
  const list = poolsOf(w);
  for (const p of list) {
    if (p.done) continue;
    p.t += dt;
    if (p.fire > 0) {
      p.fire -= dt; p.burnAcc += dt;
      if (p.burnAcc >= FIRE_TICK) {
        p.burnAcc -= FIRE_TICK;
        for (const o of w.zs) {
          if (o.dead || !inPool(p, o)) continue;
          o.burnT = Math.max(o.burnT ?? 0, 1);
          w.fx('tag', 'QUEIMANDO', o.x, o.y - o.K.top - 10);
          damageZ(w, o, Math.max(2, o.K.dmg * 0.25), 1, null);
        }
      }
      if (p.fire <= 0) p.done = true;
    } else {
      for (const f of aliveF(w)) {
        if (!inPool(p, f)) continue;
        if (!(f.slowT > 0)) w.fx('hurt', 'grudou', f.x, f.y - 110);
        f.slowT = Math.max(f.slowT ?? 0, 0.3); f.slowK = Math.max(f.slowK ?? 0, POOL_SLOW);
      }
    }
    if (p.t >= POOL_T) p.done = true;
  }
  for (const p of list) if (p.done) removeActor(w, p.actor);
  W._latex = list.filter((p) => !p.done);
}

/* ---------- jato de látex ---------- */
interface Blob { x0: number; y0: number; x1: number; y1: number; x: number; y: number; h: number; t0: number; done: boolean; actor: ExtraActor }

/** O alvo mais isolado (menos aliados a 50 px) entre os que estão no alcance do jato; senão `V`. */
export function jetTarget(w: World, z: Zombie, V: Fighter): Fighter | null {
  const ok = (f: Fighter) => { const d = Math.abs(f.x - z.x); return !f.down && d >= JET_MIN && d <= JET_MAX && Math.abs(f.y - z.y) <= 40; };
  const list = aliveF(w).filter(ok);
  if (!list.length) return ok(V) ? V : null;
  const crowd = (f: Fighter) => aliveF(w).filter((o) => o !== f && near(o, f) < 50).length;
  return list.reduce((a, b) => (crowd(b) < crowd(a) ? b : a));
}

/** Pontos de queda do jato (1 ou 2 círculos), presos no começo do golpe. */
export function jetSpots(w: World, z: Zombie, T: Fighter): { x: number; y: number }[] {
  const out = [{ x: T.x, y: clampY(T.y) }];
  if (jetCount(z) > 1) {
    const other = aliveF(w).find((f) => f !== T && !f.down && Math.abs(f.x - z.x) >= JET_MIN * 0.6 && Math.abs(f.x - z.x) <= JET_MAX + 20);
    out.push(other ? { x: other.x, y: clampY(other.y) } : { x: T.x - z.face * jetR(z) * 1.6, y: clampY(T.y + (T.y < 176 ? 14 : -14)) });
  }
  return out;
}

function launch(w: World, z: Zombie): void {
  const spots = (z._jet ?? []) as { x: number; y: number }[];
  w.warns = w.warns.filter((t) => t.owner !== z);
  const blobs: Blob[] = (z._blobs ??= []);
  for (const s of spots) {
    const B: Blob = { x0: z.x + z.face * 16, y0: z.y, x1: s.x, y1: s.y, x: z.x, y: z.y, h: 70, t0: clock(w), done: false, actor: null as unknown as ExtraActor };
    B.actor = {
      x: B.x, y: B.y, w0: 4,
      draw: (c, cam) => { tickBlobs(w, z); if (B.done) return; drawProp(z, z.form, 'xBlob', Math.floor(clock(w) * 14) % 3, B.x, B.y - B.h, 1, c, cam); },
    };
    (w.actors ??= []).push(B.actor);
    blobs.push(B);
  }
  // os círculos continuam marcados (sem dono no estado de golpe) até o látex cair
  for (const s of spots) w.warns.push({ kind: 'circle', x: s.x, y: s.y, r: jetR(z), owner: null } as any);
  z._jet = null;
  w.fx('bubble', 'TOMA LÁTEX!', z.x, z.y - z.K.top * 0.6);
}

/** Resolve a queda de um jato em (x,y): PRESO + dano em quem estiver no círculo, poça. Exportado pros testes. */
export function splat(w: World, z: Zombie, x: number, y: number): Fighter[] {
  const r = jetR(z), got: Fighter[] = [];
  w.warns = w.warns.filter((t) => !(t.kind === 'circle' && t.owner == null && Math.abs((t.x ?? 0) - x) < 0.5 && Math.abs(t.y - y) < 0.5));
  for (const f of aliveF(w)) {
    if (near(f, { x, y }) > r) continue;
    hurtF(w, f, z.K.dmg * JET_DMG * z.dmgMul);
    stunF(w, f, PRESO_T, 'PRESO!');
    f.grudeBy = z.uid; f.grudeUntil = clock(w) + PRESO_T + GRUDE_GRACE;
    got.push(f);
  }
  addPool(w, z, x, y, r);
  spawnFx(w, 'dust', x, y, z.face);
  if (got.length) { w.fx('burst', 'GRUDOU!', got[0].x, got[0].y - 70); w.shake = Math.max(w.shake, 0.06); w.log(`${z.K.nome} grudou ${got.length} no látex`); }
  return got;
}

/** Move os jatos em voo (arco, pelo relógio do mundo: segue voando mesmo com o dono tonto/morto) e resolve a queda. */
export function tickBlobs(w: World, z: Zombie): void {
  const list = (z._blobs ?? []) as Blob[];
  for (const B of list) {
    if (B.done) continue;
    const p = Math.min(1, (clock(w) - B.t0) / JET_FLY);
    B.x = B.x0 + (B.x1 - B.x0) * p; B.y = B.y0 + (B.y1 - B.y0) * p;
    B.h = 66 * (1 - p) + 34 * Math.sin(p * Math.PI);
    B.actor.x = B.x; B.actor.y = B.y;
    if (p >= 1) { B.done = true; removeActor(w, B.actor); splat(w, z, B.x1, B.y1); }
  }
  z._blobs = list.filter((B) => !B.done);
}

/* ---------- defesa (GUARDS): refill aberto, fogo, costas ---------- */
export function fromBack(z: Zombie, by?: { x: number } | null): boolean {
  if (!by) return false;
  const d = by.x - z.x;
  return Math.abs(d) >= 3 && Math.sign(d) !== z.face;
}

function interrupt(w: World, z: Zombie): void {
  endMove(w, z); z._jet = null; z.openT = 0;
  z.state = 'hurt'; z.prev = 'chase'; setAnim(z, 'hurt');
  w.fx('tag', 'PELAS COSTAS!', z.x, z.y - z.K.top * 0.5 - 14);
}

export function seringueiroGuard(w: World, z: Zombie, dmg: number, _n: number, by?: Fighter | null): number | null {
  tickLatex(w);
  if ((z.openT ?? 0) > 0) dmg *= OPEN_MUL;
  if (poolsOf(w).some((p) => p.fire > 0 && !p.done && inPool(p, z))) dmg *= FIRE_MUL;
  // laser incendeia o látex em volta (e o do balde: a poça embaixo dele)
  if (by?.w?.tipo === 'beam') igniteAt(w, z.x, z.y, 16);
  if (fromBack(z, by)) {
    z.poise += dmg; // postura ignorada: conta em dobro (damageZ soma a outra metade)
    if (z.state === 'attack' || z.state === 'refill') interrupt(w, z);
  }
  // morreu: a lamparina cai e incendeia o látex por perto
  if (z.hp - dmg <= 0) igniteAt(w, z.x, z.y, 34);
  return dmg;
}
(GUARDS as Record<string, unknown>).seringueiro = seringueiroGuard;

/* ---------- comportamento ---------- */
function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

/** Golpes com o bônus "grudado" (×1,25 no próximo golpe contra quem ele prendeu). */
function grudeMoves(w: World, z: Zombie, V: Fighter): ZMove[] {
  if (V.grudeBy !== z.uid || clock(w) > (V.grudeUntil ?? -1)) return MOVES;
  return MOVES.map((m) => ({ ...m, dmg: (m.dmg ?? 1) * GRUDE_MUL }));
}

function startRefill(w: World, z: Zombie): void {
  z.state = 'refill'; setAnim(z, z.K.F.ANIMS.refill ? 'refill' : 'idle');
  const A = z.K.F.ANIMS.refill; let ms = 0;
  if (A) for (let i = 0; i < A.n; i++) ms += Number(A.dur(i));
  z.openT = ms > 5 ? ms / 1000 : 1.2;
  w.fx('tag', 'ABERTO!', z.x, z.y - z.K.top * 0.5 - 14);
}

export const seringueiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt, V } = c;
    tickMoves(z, dt);
    tickLatex(w);
    tickBlobs(w, z);
    z.jetCd = Math.max(0, (z.jetCd ?? 2) - dt);
    if ((z.noBucketT ?? 0) > 0) z.noBucketT = Math.max(0, z.noBucketT - dt);
    if ((z.openT ?? 0) > 0 && z.state !== 'refill') z.openT = 0;
    if (z.state === 'wander') { c.step(); if (c.adx < sightR(w)) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'refill') {
      if (z.anim !== 'refill' && z.K.F.ANIMS.refill) { z.openT = 0; toChase(z); return; }
      z.openT = Math.max(0, (z.openT ?? 0) - dt);
      c.step();
      if (z.done || (!z.K.F.ANIMS.refill && z.openT <= 0)) { z.openT = 0; z.needRefill = false; toChase(z); w.fx('tag', 'ENCHEU', z.x, z.y - z.K.top * 0.5 - 14); }
      return;
    }
    if (z.state === 'attack') {
      if (z.anim !== 'throw') moveStep(c, MOVES);
      c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'throw') { z.needRefill = true; z.noBucketT = NOBUCKET_T; w.fx('tag', 'SEM BALDE', z.x, z.y - z.K.top * 0.5 - 14); }
        z.state = 'cool'; z.cd = was === 'attack' ? 0.5 : 0.35; setAnim(z, 'idle');
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // fraqueza: acabou o "sem balde" → vai encher (aberto)
    if (z.needRefill && (z.noBucketT ?? 0) <= 0) { startRefill(w, z); return; }
    // jato: de longe, no alvo mais isolado
    const T = !z.needRefill && z.jetCd <= 0 && z.K.F.ANIMS.throw ? jetTarget(w, z, V) : null;
    if (T) {
      z.face = (Math.sign(T.x - z.x) || z.face) as 1 | -1;
      z.state = 'attack'; z.move = 'throw'; z.hit = false; setAnim(z, 'throw');
      z.jetCd = JET_CD;
      z._jet = jetSpots(w, z, T);
      for (const s of z._jet) w.warns.push({ kind: 'circle', x: s.x, y: s.y, r: jetR(z), owner: z } as any);
      return;
    }
    if (c.adx < 40 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    // não fica em cima da própria poça
    const mine = poolsOf(w).find((p) => p.owner === z.uid && !p.done && inPool(p, z));
    if (mine) { setAnim(z, 'walk'); z.y = clampY(z.y + (z.y < mine.y ? -1 : 1) * 30 * dt); z.x += (Math.sign(z.x - mine.x) || 1) * 14 * dt; c.step(); return; }
    // com o jato quase pronto fica atrás da horda (90–130 px); senão entra de facão
    if (!z.needRefill && z.jetCd < 2 && c.adx < 140) {
      z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
      setAnim(z, 'walk');
      const want = c.adx < 90 ? -1 : c.adx > 130 ? 1 : 0;
      z.x += Math.sign(c.dx) * want * 18 * dt;
      z.y = clampY(z.y + Math.sign(V.y - z.y) * Math.min(Math.abs(V.y - z.y), 14 * dt));
      c.step();
      return;
    }
    setAnim(z, 'walk');
    c.chase(19, 28);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'throw') { if (fi === (A?.throwAt ?? 5)) launch(w, z); return; }
    if (z.anim === 'attack' && fi === 4) spawnFx(w, 'dust', z.x, z.y, z.face);
    const mv = grudeMoves(w, z, V);
    if (moveFrame(c, fi, mv) && mv !== MOVES) V.grudeUntil = -1; // o "grude" vale só pro próximo golpe
  },
};
