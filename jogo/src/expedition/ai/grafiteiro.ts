// Zumbi Grafiteiro (IA-61..63, Lapa): controlador de zona — cega com nuvem de spray e marca glifos que atraem zumbis.
// - Nuvem de spray (`cloud`): agita e aponta com aviso no chão (280 ms); no quadro `sprayAt` nasce uma nuvem em cone
//   (70 px, fica 2 s no ar). Quem está no cone OLHANDO PRO GRAFITEIRO fica cego 1,2 s (1,5 s enluarado/plenilunar):
//   -50% de chance de acertar (ver isBlind/blindMiss). De costas ou fora do cone, nada. Não acumula: imune 2 s depois.
//   Dano 0,2x só no borrifo. Recarga 6,5 s. Depois de borrifar ele foge um pouco (ágil e fugidio).
// - Marca no chão (`tag`): agacha e pinta (0,6 s, quadros `crouch`) — FRAQUEZA: leva +50% de dano nessa janela e,
//   se apanhar, o glifo não sai. No quadro `glyphAt` nasce o glifo (raio 36 px, 8 s, 24 px à frente do pé):
//   zumbis a 160 px (180 enluarado) são puxados pro glifo; lutador que pisa fica 20% mais lento. Máx. 1 glifo por
//   grafiteiro (2 no plenilunar). 3 acertos de lutador em cima do glifo, ou 1 golpe de área (special), apagam.
//   Morreu o grafiteiro, os glifos dele somem.
// - Golpe de lata (`hit`): 0,9x, empurra 8 px, recarga 1,8 s.
// - IA-63: acerto durante a nuvem (borrifando ou com a nuvem dele no ar) derruba a lata: 5 s só com golpe de lata (0,6x),
//   sem `cloud`/`tag`. A lata fica caída no chão (adereço xCan).
import type { ZombieAI, ZCtx } from './index';
import { aliveF, aliveZ, clampY, setAnim, spawnFx, RS, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const GRAF = {
  coneR: 70, coneY0: 9, coneYK: 0.22, cloudLife: 2, cloudDmg: 0.2, immune: 2, blindK: 0.5,
  glyphR: 36, glyphLife: 8, glyphDX: 24, glyphHits: 3, lureSpd: 30, slowK: 0.2,
  crouchMul: 1.5, noCanT: 5, noCanMul: 0.6, fleeT: 0.9,
};
export const blindTime = (z: Zombie) => (z.form === 'comum' ? 1.2 : 1.5);
export const attractR = (z: Zombie) => (z.form === 'enluarado' ? 180 : 160);
export const maxGlyphs = (z: Zombie) => (z.form === 'plenilunar' ? 2 : 1);
export const coneLen = (z: Zombie) => GRAF.coneR * (z.form === 'plenilunar' ? 1.25 : 1);

const MOVES: ZMove[] = [
  { anim: 'hit', w: 3, max: 32, dy: 9, cd: 1.8, dmg: 0.9, push: 8, word: 'PLÉC!' },
  { anim: 'cloud', w: 3, min: 16, max: 76, dy: 14, cd: 6.5, dmg: 0, warn: 'lane' },
  { anim: 'tag', w: 2, min: 34, max: 150, dy: 40, cd: 10, dmg: 0 },
];
const NOCAN: ZMove[] = [{ anim: 'hit', w: 1, max: 32, dy: 9, cd: 1.8, dmg: 0.9 * GRAF.noCanMul, push: 6, word: 'PLÉC!' }];

const now = (w: World) => w.clock ?? 0;
// estado por mundo (nuvens e glifos vivos de todos os grafiteiros)
const ST = new WeakMap<World, { clouds: Cloud[]; glyphs: Glyph[] }>();
const st = (w: World) => { let s = ST.get(w); if (!s) { s = { clouds: [], glyphs: [] }; ST.set(w, s); } return s; };

/* ---------- cegueira (estado no lutador; o combate consulta isBlind/blindMiss) ---------- */
/** O lutador está cego agora? */
export const isBlind = (w: World, f: Fighter) => now(w) < (f.blindUntil ?? -1);
/** Sorteio de erro do golpe por cegueira (true = errou). Pra plugar em meleeHit/shoot/fireBeam. */
export const blindMiss = (w: World, f: Fighter, r = Math.random()) => isBlind(w, f) && r < (f.blindK ?? GRAF.blindK);
/** Cega (respeita a imunidade de 2 s depois da cegueira anterior). Retorna true se cegou. */
export function blindF(w: World, f: Fighter, t: number): boolean {
  const T = now(w);
  if (f.down || T < (f.blindImmUntil ?? -1)) return false;
  f.blindUntil = T + t; f.blindImmUntil = T + t + GRAF.immune; f.blindK = GRAF.blindK;
  w.fx('tag', 'CEGO!', f.x, f.y - 90);
  return true;
}

/* ---------- nuvem ---------- */
export interface Cloud { x0: number; y: number; face: 1 | -1; len: number; t: number; life: number; owner: Zombie; actor: ExtraActor; done: boolean }
const clouds = (w: World): Cloud[] => st(w).clouds;
/** nuvens vivas (todas) */
export const cloudsOf = (w: World) => clouds(w).filter((c) => !c.done);

/** O lutador está dentro do cone da nuvem? */
export function inCone(cl: Cloud, f: { x: number; y: number }): boolean {
  const d = (f.x - cl.x0) * cl.face;
  return d >= -4 && d <= cl.len && Math.abs(f.y - cl.y) <= GRAF.coneY0 + d * GRAF.coneYK;
}
/** Olhando pra origem da nuvem (de frente pro spray)? */
export const facingCloud = (cl: Cloud, f: Fighter) => f.face === -cl.face;

export function spawnCloud(w: World, z: Zombie): Cloud {
  const cl: Cloud = { x0: z.x + z.face * 8, y: z.y, face: z.face, len: coneLen(z), t: 0, life: GRAF.cloudLife, owner: z, actor: null as unknown as ExtraActor, done: false };
  cl.actor = {
    x: cl.x0, y: cl.y + 1, w0: 0,
    draw: (c, cam) => {
      if (cl.done) return;
      const F = z.K.F, fi = Math.floor(cl.t * 11) % 4;
      const cv: any = F.framePose ? F.framePose(z.form, 'xCloud', { st: fi }, 'xCloud' + fi) : F.frame(z.form, 'xCloud', fi, 5);
      if (!cv) return;
      const sc = cl.len / GRAF.coneR, a = Math.min(1, (cl.life - cl.t) / 0.5);
      c.save(); c.globalAlpha = 0.85 * Math.max(0, a); c.translate(Math.round(cl.x0 - cam), Math.round(cl.y)); c.scale(cl.face * sc, sc);
      c.drawImage(cv, -(cv._ax ?? 0) / RS, -(cv._gy ?? cv.height) / RS, cv.width / RS, cv.height / RS);
      c.restore();
    },
  };
  clouds(w).push(cl);
  (w.actors ??= []).push(cl.actor);
  // borrifo: dano leve em quem está no cone + cegueira em quem olha de frente
  for (const f of aliveF(w)) {
    if (!inCone(cl, f)) continue;
    hurtF(w, f, z.K.dmg * GRAF.cloudDmg * z.dmgMul);
    if (facingCloud(cl, f)) blindF(w, f, blindTime(z));
  }
  w.fx('burst', 'FSSSH!', cl.x0 + cl.face * 30, cl.y - 60);
  return cl;
}

function dropActor(w: World, a: ExtraActor): void { if (w.actors) { const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); } }

/** Avança as nuvens do grafiteiro: quem entra no cone olhando pra ela também cega. */
export function tickClouds(w: World, z: Zombie, dt: number): void {
  const L = clouds(w);
  for (const cl of L) {
    if (cl.owner !== z || cl.done) continue;
    cl.t += dt;
    if (cl.t >= cl.life) { cl.done = true; dropActor(w, cl.actor); continue; }
    for (const f of aliveF(w)) if (inCone(cl, f) && facingCloud(cl, f) && !isBlind(w, f)) blindF(w, f, blindTime(z));
  }
  st(w).clouds = L.filter((c) => !c.done);
}
const cloudAlive = (w: World, z: Zombie) => clouds(w).some((c) => c.owner === z && !c.done);

/* ---------- glifo ---------- */
export interface Glyph { x: number; y: number; r: number; t: number; life: number; hits: number; owner: Zombie; actor: ExtraActor; done: boolean; hitCd: Map<Fighter, number> }
const glyphs = (w: World): Glyph[] => st(w).glyphs;
export const glyphsOf = (w: World, z: Zombie) => glyphs(w).filter((g) => g.owner === z && !g.done);

export function spawnGlyph(w: World, z: Zombie): Glyph | null {
  const mine = glyphsOf(w, z);
  if (mine.length >= maxGlyphs(z)) eraseGlyph(w, mine[0], false); // repinta: o mais velho some
  const g: Glyph = { x: z.x + z.face * GRAF.glyphDX, y: clampY(z.y), r: GRAF.glyphR, t: 0, life: GRAF.glyphLife, hits: 0, owner: z, actor: null as unknown as ExtraActor, done: false, hitCd: new Map() };
  g.actor = {
    x: g.x, y: g.y - 40, w0: 0, // y menor: desenhado antes (decalque no chão)
    draw: (c, cam) => {
      if (g.done) return;
      if (g.owner.dead) { eraseGlyph(w, g, true); return; }
      const F = z.K.F, fi = Math.floor(g.t * 8) % 4;
      const cv: any = F.framePose ? F.framePose(z.form, 'xGlyph', { st: fi }, 'xGlyph' + fi) : F.frame(z.form, 'xGlyph', fi, 5);
      if (!cv) return;
      const bloom = Math.min(1, 0.55 + g.t / 0.3 * 0.45), a = Math.min(1, (g.life - g.t) / 1);
      c.save(); c.globalAlpha = Math.max(0, a); c.translate(Math.round(g.x - cam), Math.round(g.y)); c.scale(bloom, bloom);
      c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      c.restore();
    },
  };
  glyphs(w).push(g);
  (w.actors ??= []).push(g.actor);
  w.fx('tag', 'GLIFO!', g.x, g.y - 30);
  return g;
}

export function eraseGlyph(w: World, g: Glyph, puff = true): void {
  if (g.done) return;
  g.done = true; dropActor(w, g.actor);
  st(w).glyphs = glyphs(w).filter((x) => !x.done);
  if (puff) { spawnFx(w, 'dust', g.x, g.y, 1); w.fx('tag', 'APAGOU!', g.x, g.y - 24); }
}

/** Golpe de lutador no chão: area = golpe de área (apaga na hora); senão conta 1 dos 3 acertos. Pra plugar no combate. */
export function strikeGlyphs(w: World, x: number, y: number, reach: number, face: 1 | -1, area = false): number {
  let n = 0;
  for (const g of [...glyphs(w)]) {
    if (g.done) continue;
    const d = (g.x - x) * face;
    if (d < -g.r * 0.5 || d > reach + g.r || Math.abs(g.y - y) > g.r * 0.4 + 10) continue;
    n++;
    if (area || ++g.hits >= GRAF.glyphHits) eraseGlyph(w, g);
  }
  return n;
}

const onGlyph = (g: Glyph, p: { x: number; y: number }) => Math.hypot((p.x - g.x) / g.r, (p.y - g.y) / (g.r * 0.4)) <= 1;

/** Vida, atração de zumbis, lentidão de quem pisa e acertos do squad em cima do glifo. */
export function tickGlyphs(w: World, z: Zombie, dt: number): void {
  for (const g of glyphsOf(w, z)) {
    g.t += dt;
    if (g.t >= g.life || z.dead) { eraseGlyph(w, g, false); continue; }
    // atrai OUTROS zumbis (não o squad)
    const R = attractR(z);
    for (const o of aliveZ(w)) {
      if (o === z || o.boss || o.air || o.down || o.state === 'grabbed' || o.state === 'attack') continue;
      const dx = g.x - o.x, dy = g.y - o.y, d = Math.hypot(dx, dy);
      if (d > R || d < g.r * 0.5) continue;
      const k = GRAF.lureSpd * dt / (d || 1);
      o.x += dx * k; o.y = clampY(o.y + dy * k);
      o.lure = g; o.lureT = 0.3;
    }
    for (const f of aliveF(w)) {
      if (onGlyph(g, f)) { f.slowT = Math.max(f.slowT ?? 0, 0.25); f.slowK = Math.max(f.slowK ?? 0, GRAF.slowK); }
      // acertos do squad no glifo (auto-detecção; o combate pode chamar strikeGlyphs pra precisão)
      const cd = (g.hitCd.get(f) ?? 0) - dt; g.hitCd.set(f, cd);
      if (cd > 0 || (f.state !== 'combo' && f.state !== 'special')) continue;
      const d = (g.x - f.x) * f.face;
      if (d < -g.r * 0.5 || d > 46 + g.r * 0.5 || Math.abs(g.y - f.y) > g.r * 0.4 + 8) continue;
      g.hitCd.set(f, 0.3);
      if (f.state === 'special' || ++g.hits >= GRAF.glyphHits) { eraseGlyph(w, g); break; }
    }
  }
}

/* ---------- lata caída ---------- */
function dropCan(w: World, z: Zombie): void {
  z.noCanT = GRAF.noCanT;
  const x = z.x - z.face * 10, y = z.y;
  const a: ExtraActor = {
    x, y: y - 1, w0: 0,
    draw: (c, cam) => {
      if ((z.noCanT ?? 0) <= 0 || z.dead) { dropActor(w, a); return; }
      const F = z.K.F, fi = Math.floor(now(w) * 4) % 2;
      const cv: any = F.framePose ? F.framePose(z.form, 'xCan', { st: fi }, 'xCan' + fi) : F.frame(z.form, 'xCan', fi, 5);
      if (!cv) return;
      c.drawImage(cv, Math.round(x - cam) - (cv._ax ?? 0) / RS, Math.round(y) - (cv._gy ?? 0) / RS, cv.width / RS, cv.height / RS);
    },
  };
  (w.actors ??= []).push(a);
  w.fx('tag', 'SEM LATA!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'dust', x, y, z.face);
}

/* ---------- defesa ---------- */
export const crouching = (z: Zombie) => {
  const A = z.K.F.ANIMS.tag, cr: number[] = A?.crouch ?? [2, 6];
  return z.state === 'attack' && z.anim === 'tag' && z.fi >= cr[0] && z.fi <= cr[1];
};
export const spraying = (w: World, z: Zombie) => (z.state === 'attack' && z.anim === 'cloud') || cloudAlive(w, z);

export const grafiteiroGuard: Guard = (w, z, dmg) => {
  if (crouching(z)) { w.fx('tag', 'AJOELHADO!', z.x, z.y - z.K.top * 0.5 - 14); dmg *= GRAF.crouchMul; }
  if ((z.noCanT ?? 0) <= 0 && spraying(w, z)) { if (z.state === 'attack') endMove(w, z); dropCan(w, z); }
  return dmg;
};
(GUARDS as Record<string, Guard>).grafiteiro = grafiteiroGuard;

/* ---------- comportamento ---------- */
function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const grafiteiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickClouds(w, z, dt);
    tickGlyphs(w, z, dt);
    if ((z.noCanT ?? 0) > 0) z.noCanT = Math.max(0, z.noCanT - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'flee') { // dá o fora depois do borrifo
      z.fleeT = (z.fleeT ?? 0) - dt;
      z.face = (-(Math.sign(c.dx) || 1)) as 1 | -1;
      z.x += z.face * 34 * dt; z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x));
      c.step();
      if (z.fleeT <= 0) { z.face = (Math.sign(c.dx) || 1) as 1 | -1; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      const list = (z.noCanT ?? 0) > 0 ? NOCAN : MOVES;
      moveStep(c, list); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'cloud') { z.state = 'flee'; z.fleeT = GRAF.fleeT; setAnim(z, 'walk'); }
        else { z.state = 'cool'; z.cd = was === 'tag' ? 0.3 : 0.5; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    const noCan = (z.noCanT ?? 0) > 0;
    if (c.adx < 160 && Math.abs(c.dy) < 42) {
      let list = noCan ? NOCAN : MOVES;
      if (!noCan && glyphsOf(w, z).length >= maxGlyphs(z)) list = list.filter((m) => m.anim !== 'tag');
      const mv = pickMove(c, list);
      if (mv) { startMove(c, mv); return; }
    }
    setAnim(z, 'walk');
    c.chase(25, noCan ? 26 : 48); // mantém meia distância (controlador de zona)
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'cloud') {
      if (fi === (A?.sprayAt ?? 3)) { w.warns = w.warns.filter((t) => t.owner !== z); if ((z.noCanT ?? 0) <= 0) spawnCloud(w, z); z.hit = true; }
      return;
    }
    if (z.anim === 'tag') {
      const cr: number[] = A?.crouch ?? [2, 6];
      if (fi >= cr[0] && fi < (A?.glyphAt ?? 6) && fi % 2 === 0) spawnFx(w, 'dust', z.x + z.face * GRAF.glyphDX, z.y, z.face);
      if (fi === (A?.glyphAt ?? 6)) spawnGlyph(w, z);
      return;
    }
    moveFrame(c, fi, (z.noCanT ?? 0) > 0 ? NOCAN : MOVES);
  },
};
