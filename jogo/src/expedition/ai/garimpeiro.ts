// Zumbi Garimpeiro (IA-39..42, variante local da Amazônia): o "cavador". Picareta, bateia de mercúrio e túnel.
// - Picaretada (`attack`): pica alta nas costas (~200 ms), impacto no q. 5: 1,2× de dano, alcance 40 px, empurra 14 px
//   e racha o chão. Recarga 2 s. De perto também usa o cabo (`shove`, revés curto que empurra).
// - Lama de mercúrio (`throw`, IA-40): alvo a 60–130 px. Gira a bateia (~350 ms) com círculo r 30 no alvo; no impacto
//   0,3× de dano + VENENO 3 s e uma POÇA DE MERCÚRIO de 5 s (veneno por tick e OFUSCA 0,3 s quem pisa). Recarga 8 s.
// - Cava e surge (`dig` → `under` → `emerge`, IA-41): some na terra (invulnerável) por 1,2 s, segue o alvo por baixo
//   e nos últimos 0,7 s marca o círculo r 30 onde vai sair (tremor). Explode de baixo: 1,0× + DERRUBADO em quem ficou
//   no círculo (sair do círculo anula). Plenilunar: 2 saídas (a segunda erupção cai no outro lutador). Recarga 9 s.
// - FRAQUEZA (IA-42): depois de surgir fica ABERTO 1,2 s puxando a picareta cravada (dano ×1,5).
//   Crosta de lama: −10% de dano recebido até levar 2 acertos de fogo/ácido (o laser conta como calor).
// - Tática: pica de perto, joga lama em quem está longe, cava quando o squad está agrupado (ou o alvo está longe).
//   Prefere o lutador mais afastado dos aliados.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 40, dy: 9, cd: 2, dmg: 1.2, push: 14, word: 'KRAK!', shake: 0.12, lunge: [0, 0, 0, 40, 60, 0, 0, 0, 0, 0] },
  { anim: 'shove', w: 1.5, max: 34, dy: 9, cd: 3, dmg: 0.7, push: 12, word: 'TUM!' },
  { anim: 'throw', w: 2.5, min: 60, max: 130, dy: 30, cd: 8, dmg: 0 },
  { anim: 'dig', w: 2, min: 40, max: 220, dy: 60, cd: 9, dmg: 0 },
];

/** IA-42: janela aberta depois de surgir (s) e bônus de dano nela */
export const OPEN_T = 1.2;
export const OPEN_MUL = 1.5;
/** armadura de lama: multiplicador e quantos acertos de fogo/ácido derretem a crosta */
export const CRUST_MUL = 0.9;
export const CRUST_HITS = 2;
/** IA-40: lama de mercúrio */
export const MUD_MUL = 0.3;
export const MUD_R = 30;
export const MUD_MIN = 60;
export const MUD_MAX = 130;
export const POISON_T = 3;
/** dano do veneno a cada 0,5 s (× dano base) */
export const POISON_TICK = 0.1;
export const POOL_LIFE = 5;
export const BLIND_T = 0.3;
export const MERC: Record<string, string> = { comum: '#c8d0d6', enluarado: '#7af4ff', plenilunar: '#ffb43a' };
/** IA-41: cava e surge */
export const DIG_MUL = 1.0;
export const DIG_R = 30;
export const UNDER_T = 1.2;
export const WARN_T = 0.7;
/** distância (px, com y×2) pra considerar dois lutadores "agrupados" */
export const GROUP_R = 60;
/** o motor (director) apaga poças com t >= 3,2 s: a vida extra entra como t inicial negativo */
const POOL_T_END = 3.2;

const now = (w: World) => w.clock ?? 0;
const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, (a.y - b.y) * 2);
export const exitsOf = (z: Zombie) => (z.form === 'plenilunar' ? 2 : 1);

/* ---------- estado subterrâneo ---------- */
/** Debaixo da terra (invulnerável): do quadro em que some no `dig` até o quadro do estouro no `emerge`. */
export function isUnder(z: Zombie): boolean {
  if (z.dead || z.state !== 'attack') return false;
  if (z.gph === 'under') return true;
  const A = z.K.F.ANIMS;
  if (z.anim === 'dig') return z.fi >= (A.dig?.sink ?? 6);
  if (z.anim === 'emerge') return z.fi < (A.emerge?.hit ?? 1);
  return false;
}

/** Fogo/ácido (o laser conta como calor) */
export const isHeat = (by?: Fighter | null) => !!by && (by.w?.tipo === 'beam' || ['fogo', 'acido'].includes((by as any).elem ?? (by.w as any)?.elem));

/** Defesa (registrada em GUARDS): invulnerável na terra, ABERTO ×1,5, crosta −10%. */
export function garimpeiroGuard(w: World, z: Zombie, dmg: number, _n: number, by?: Fighter | null): number | null {
  if (isUnder(z)) { if (Math.random() < 0.25) w.fx('tag', 'NA TERRA', z.x, z.y - 20); return null; }
  let out = dmg;
  if ((z.openT ?? 0) > 0) out *= OPEN_MUL;
  const crust = z.crust ?? CRUST_HITS;
  if (crust > 0) {
    out *= CRUST_MUL;
    if (isHeat(by)) { z.crust = crust - 1; if (z.crust <= 0) w.fx('tag', 'CROSTA DERRETEU!', z.x, z.y - z.K.top * 0.5 - 14); }
  }
  if (Math.max(1, Math.round(out)) >= z.hp) { for (const B of (z._mud as Blob[] | undefined) ?? []) landMud(w, z, B); z._mud = []; } // o que já está no ar cai
  return out;
}
(GUARDS as Record<string, Guard>).garimpeiro = garimpeiroGuard as Guard;

/* ---------- status no lutador: VENENO e OFUSCADO ---------- */
/** Envenena (renova, não empilha): `dmg` a cada 0,5 s até acabar. */
export function poisonF(w: World, f: Fighter, t: number, dmg: number): void {
  if (f.down) return;
  const active = (f.venenoUntil ?? -1) > now(w);
  if (!active) { f.venenoAcc = 0; w.fx('tag', 'VENENO', f.x, f.y - 100); }
  f.venenoUntil = Math.max(active ? f.venenoUntil : 0, now(w) + t);
  f.venenoDmg = Math.max(dmg, active ? (f.venenoDmg ?? 0) : 0);
}
/** Ofusca (mesma convenção do Turista/Grafiteiro: f.blindUntil/f.blindK); imune 1 s depois. */
export function blindF(w: World, f: Fighter, t: number): boolean {
  if (f.down || now(w) < (f.mercImmUntil ?? -1)) return false;
  f.blindUntil = Math.max(f.blindUntil ?? 0, now(w) + t); f.blindK = Math.max(f.blindK ?? 0, 0.5); f.mercImmUntil = now(w) + 1;
  w.fx('tag', 'OFUSCADO', f.x, f.y - 90);
  return true;
}
/** Tick global (1× por quadro do mundo, mesmo com vários garimpeiros): veneno e brilho das poças. Exportado pros testes. */
export function tickStatus(w: World, dt: number): void {
  const W = w as any;
  if (W._garimpoClock === now(w) && now(w) !== 0) return;
  W._garimpoClock = now(w);
  for (const f of aliveF(w)) {
    if ((f.venenoUntil ?? -1) + 1e-6 > now(w)) {
      f.venenoAcc = (f.venenoAcc ?? 0) + dt;
      if (f.venenoAcc >= 0.5 - 1e-6) { f.venenoAcc -= 0.5; hurtF(w, f, f.venenoDmg ?? 1); w.fx('hurt', 'veneno', f.x, f.y - 96); }
    }
    for (const p of mercPools(w)) if (Math.abs(f.x - p.x) < 18 && Math.abs(f.y - p.y) < 9) { blindF(w, f, BLIND_T); break; }
  }
}

/* ---------- poça de mercúrio ---------- */
interface MPool { x: number; y: number; t: number; c: string; dmg: number; r: number; kind: 'mercurio'; owner: number; tag: string }
export const mercPools = (w: World): MPool[] => (w.pools as MPool[]).filter((p) => p.kind === 'mercurio' && p.t < POOL_T_END);
/** Cria a poça (o director dá p.dmg × 0,5 a cada 0,5 s em quem pisa = VENENO por tick). Exportado pros testes. */
export function addMercPool(w: World, z: Zombie, x: number, y: number): MPool {
  const p: MPool = { x, y: clampY(y), t: POOL_T_END - POOL_LIFE, c: MERC[z.form] || MERC.comum, dmg: 2 * POISON_TICK * z.K.dmg * z.dmgMul, r: MUD_R, kind: 'mercurio', owner: z.uid, tag: 'veneno' };
  w.pools.push(p);
  return p;
}

/* ---------- lama voando ---------- */
interface Blob { x0: number; y0: number; x1: number; y1: number; x: number; y: number; h: number; t: number; T: number; done: boolean; actor: ExtraActor }

/** Alvo da lama: posição do lutador presa no começo do golpe, a 60–130 px na frente. */
export function mudTarget(z: Zombie, V: { x: number; y: number }): { x: number; y: number } {
  const d = Math.max(MUD_MIN, Math.min(MUD_MAX, Math.abs(V.x - z.x)));
  return { x: z.x + z.face * d, y: clampY(V.y) };
}

function prepMud(c: ZCtx): void {
  const { w, z, V } = c, T = mudTarget(z, V);
  z._mudT = T;
  w.warns.push({ kind: 'circle', x: T.x, y: T.y, r: MUD_R, owner: z, c: 'rgba(200,210,224,' } as any);
}

/** Lança a lama (quadro throwAt). Exportado pros testes. */
export function throwMud(w: World, z: Zombie): void {
  const t = (z._mudT as { x: number; y: number } | undefined) ?? { x: z.x + z.face * 90, y: z.y };
  const x0 = z.x + z.face * 16, y0 = z.y, list: Blob[] = (z._mud ??= []);
  const B: Blob = { x0, y0, x1: t.x, y1: t.y, x: x0, y: y0, h: 70, t: 0, T: 0.2 + Math.abs(t.x - x0) / 500, done: false, actor: null as unknown as ExtraActor };
  B.actor = {
    x: B.x, y: B.y, w0: 4,
    draw: (cx, cam) => {
      if (B.done) return;
      const F = z.K.F, fi = Math.floor(now(w) * 14) % 4;
      const cv: any = F.framePose ? F.framePose(z.form, 'xMud', { st: fi }, 'xMud' + fi + '.0') : F.frame(z.form, 'xMud', fi, 5);
      if (!cv) return;
      cx.save(); cx.translate(Math.round(B.x - cam), Math.round(B.y - B.h)); if (B.x1 < B.x0) cx.scale(-1, 1);
      cx.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      cx.restore();
    },
  };
  (w.actors ??= []).push(B.actor);
  list.push(B);
  z._mudT = null;
  w.fx('burst', 'SPLOSH!', z.x + z.face * 24, z.y - 70);
}

function landMud(w: World, z: Zombie, B: Blob): void {
  if (B.done) return;
  B.done = true;
  if (w.actors) { const i = w.actors.indexOf(B.actor); if (i >= 0) w.actors.splice(i, 1); }
  w.warns = w.warns.filter((t) => !(t.owner === z && t.kind === 'circle' && Math.abs((t.x ?? 0) - B.x1) < 1 && Math.abs(t.y - B.y1) < 1));
  for (const f of aliveF(w)) {
    if (dist2(f, { x: B.x1, y: B.y1 }) >= MUD_R) continue;
    hurtF(w, f, z.K.dmg * MUD_MUL * z.dmgMul);
    poisonF(w, f, POISON_T, POISON_TICK * z.K.dmg * z.dmgMul);
  }
  addMercPool(w, z, B.x1, B.y1);
  spawnFx(w, 'acidSplash', B.x1, B.y1, 1, { cor: MERC[z.form] || MERC.comum });
  w.fx('burst', 'PLOFT!', B.x1, B.y1 - 34);
}

/** Move a lama no ar (arco) e cria a poça no impacto. Exportado pros testes. */
export function tickMud(w: World, z: Zombie, dt: number): void {
  const list = z._mud as Blob[] | undefined; if (!list?.length) return;
  for (const B of list) {
    if (B.done) continue;
    B.t += dt;
    const p = Math.min(1, B.t / B.T);
    B.x = B.x0 + (B.x1 - B.x0) * p; B.y = B.y0 + (B.y1 - B.y0) * p;
    B.h = 70 * (1 - p) + 4 + 34 * Math.sin(p * Math.PI);
    B.actor.x = B.x; B.actor.y = B.y;
    if (p >= 1) landMud(w, z, B);
  }
  z._mud = list.filter((B) => !B.done);
}

/* ---------- cava e surge ---------- */
/** Lutador mais afastado dos outros (alvo preferido). */
export function isolatedTarget(w: World, z: Zombie, range = 260): Fighter | null {
  let best: Fighter | null = null, bs = -1;
  const fs = aliveF(w);
  for (const f of fs) {
    if (Math.abs(f.x - z.x) > range) continue;
    const s = fs.length > 1 ? Math.min(...fs.filter((o) => o !== f).map((o) => dist2(f, o))) : 0;
    const sc = s - Math.abs(f.x - z.x) * 0.15; // empate: o mais perto
    if (sc > bs) { bs = sc; best = f; }
  }
  return best;
}
/** Squad agrupado em volta do alvo? */
export const grouped = (w: World, V: Fighter) => aliveF(w).some((f) => f !== V && dist2(f, V) < GROUP_R);
/** Pode cavar agora? (alvo a 40–220 px e squad agrupado, ou alvo longe) */
export function canDig(w: World, z: Zombie, V: Fighter): boolean {
  const d = Math.abs(V.x - z.x);
  return !!z.K.F.ANIMS.dig && d >= 40 && d <= 220 && (grouped(w, V) || d > 110);
}

/** Marca as saídas (círculos) presas na posição atual dos alvos. Exportado pros testes. */
export function lockExits(w: World, z: Zombie, V: Fighter): { x: number; y: number }[] {
  const out = [{ x: V.x, y: clampY(V.y) }];
  if (exitsOf(z) > 1) {
    const other = aliveF(w).filter((f) => f !== V).sort((a, b) => dist2(a, V) - dist2(b, V))[0];
    out.push(other ? { x: other.x, y: clampY(other.y) } : { x: V.x + (V.x > z.x ? 46 : -46), y: clampY(V.y + (V.y < 176 ? 14 : -14)) });
  }
  z._exits = out;
  for (const e of out) w.warns.push({ kind: 'circle', x: e.x, y: e.y, r: DIG_R, owner: z, c: 'rgba(200,120,50,' } as any);
  w.fx('tag', 'TREMOR!', out[0].x, out[0].y - 30);
  return out;
}

function knockdown(w: World, z: Zombie, f: Fighter): void {
  if (f.down || f.state === 'kd' || f.state === 'getup') return;
  if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (Math.sign(z.x - f.x) || 1) as 1 | -1; }
  else stunF(w, f, 0.9, 'DERRUBADO');
}

/** Estouro de uma saída: dano 1,0× + DERRUBADO em quem estiver no círculo. Exportado pros testes. */
export function eruptAt(w: World, z: Zombie, at: { x: number; y: number }): Fighter[] {
  const hit: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (dist2(f, at) >= DIG_R) continue;
    hurtF(w, f, z.K.dmg * DIG_MUL * z.dmgMul, { heavy: true });
    knockdown(w, z, f);
    hit.push(f);
  }
  spawnFx(w, 'rockBreak', at.x, at.y - 6); spawnFx(w, 'dust', at.x, at.y, 1);
  w.shake = Math.max(w.shake, 0.22);
  if (hit.length) w.fx('burst', 'BRUUM!', at.x, at.y - 60);
  return hit;
}

/** Quadro do estouro do `emerge`: todas as saídas explodem; o garimpeiro aparece na primeira. */
export function emergeHit(w: World, z: Zombie): Fighter[] {
  const ex = (z._exits as { x: number; y: number }[] | undefined) ?? [{ x: z.x, y: z.y }];
  w.warns = w.warns.filter((t) => t.owner !== z);
  const out: Fighter[] = [];
  for (const e of ex) out.push(...eruptAt(w, z, e));
  z._exits = null;
  z.hit = true;
  return out;
}

function startUnder(z: Zombie): void { z.gph = 'under'; z.ut = 0; setAnim(z, z.K.F.ANIMS.under ? 'under' : 'dig'); }

/** Movimento por baixo da terra (1,2 s): segue o alvo, trava as saídas nos últimos 0,7 s e surge. Exportado pros testes. */
export function tickUnder(c: ZCtx): void {
  const { z, w, dt, V } = c;
  const t0 = z.ut ?? 0; z.ut = t0 + dt;
  const lockAt = UNDER_T - WARN_T;
  if (t0 < lockAt && z.ut >= lockAt) lockExits(w, z, V);
  const ex = z._exits as { x: number; y: number }[] | undefined;
  const goal = ex?.[0] ?? V, left = Math.max(dt, UNDER_T - z.ut);
  const spd = ex ? Math.max(90, Math.hypot(goal.x - z.x, goal.y - z.y) / left) : 90;
  const dx = goal.x - z.x, dy = goal.y - z.y, L = Math.hypot(dx, dy) || 1, s = Math.min(L, spd * dt);
  z.x += (dx / L) * s; z.y = clampY(z.y + (dy / L) * s);
  if (Math.abs(dx) > 1) z.face = (Math.sign(dx) || z.face) as 1 | -1;
  if (z.anim === 'under' && z.done) { z.anim = ''; setAnim(z, 'under'); } // terra se mexendo em loop
  else if (z.anim !== 'under' && z.K.F.ANIMS.under) setAnim(z, 'under');
  else c.step();
  if (z.ut >= UNDER_T) {
    if (ex) { z.x = ex[0].x; z.y = ex[0].y; }
    z.gph = 'emerge'; setAnim(z, 'emerge');
    spawnFx(w, 'dust', z.x, z.y, z.face);
  }
}

function toChase(z: Zombie): void { z.state = 'chase'; z.gph = null; setAnim(z, 'walk'); }

export const garimpeiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickMud(w, z, dt);
    tickStatus(w, dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    if (z.state !== 'attack') z.gph = null;
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'open') { // FRAQUEZA: puxando a picareta cravada
      if (z.anim !== 'open') setAnim(z, z.K.F.ANIMS.open ? 'open' : 'idle');
      const f0 = z.fi; c.step();
      if (z.fi !== f0 && z.fi % 2 === 1) spawnFx(w, 'dust', z.x + z.face * 26, z.y, z.face);
      if ((z.openT ?? 0) <= 0) toChase(z);
      return;
    }
    if (z.state === 'attack') {
      if (z.gph === 'under') { tickUnder(c); return; }
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim;
        if (was === 'dig') { startUnder(z); return; }
        endMove(w, z);
        if (was === 'emerge') {
          z.gph = null; z.state = 'open'; z.openT = OPEN_T; setAnim(z, z.K.F.ANIMS.open ? 'open' : 'idle');
          w.fx('tag', 'ABERTO!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = was === 'throw' ? 0.4 : 0.6; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // alvo preferido: o lutador mais isolado (reavaliado a cada 1,2 s)
    if (now(w) >= (z._isoT ?? 0)) { const f = isolatedTarget(w, z); if (f) { z.tg = f; z.tgT = 0.6; } z._isoT = now(w) + 1.2; }
    if (c.adx < 222 && Math.abs(c.dy) < 60) {
      const ok = MOVES.filter((m) => m.anim !== 'dig' || canDig(w, z, c.V));
      const mv = pickMove(c, ok);
      if (mv) {
        startMove(c, mv);
        if (mv.anim === 'throw') { prepMud(c); w.fx('bubble', 'OLHA O MERCÚRIO!', z.x, z.y - z.K.top * 0.55); }
        if (mv.anim === 'dig') { z.gph = 'dig'; w.fx('tag', 'CAVANDO!', z.x, z.y - z.K.top * 0.5 - 14); }
        return;
      }
    }
    setAnim(z, 'walk');
    c.chase(19, 30);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'throw') { if (fi === (A?.throwAt ?? 4)) throwMud(w, z); return; }
    if (z.anim === 'dig') {
      if (fi === 2) { spawnFx(w, 'rockBreak', z.x + z.face * 18, z.y - 4); w.shake = Math.max(w.shake, 0.08); }
      if (fi === (A?.sink ?? 6)) { spawnFx(w, 'dust', z.x, z.y, z.face); w.fx('tag', 'SUMIU!', z.x, z.y - 40); }
      return;
    }
    if (z.anim === 'emerge') { if (fi === (A?.hit ?? 1)) emergeHit(w, z); return; }
    if (moveFrame(c, fi, MOVES) && z.anim === 'attack') spawnFx(w, 'rockBreak', z.x + z.face * 36, z.y - 2);
    else if (z.anim === 'attack' && fi === (A?.hit ?? 5)) spawnFx(w, 'dust', z.x + z.face * 36, z.y, z.face);
  },
};
