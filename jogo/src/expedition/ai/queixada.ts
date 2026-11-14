// Queixada Zumbi (IA-39 · Pantanal, comum animal — porco-do-mato em BANDO). Cada um é fraco; o perigo é o bando.
// - Presada (attack): cabeça baixa (aviso 250 ms, quadros 0–2) e sobe com as presas no quadro 3. 30 px, 1,0× dano.
// - Investida (charge): raspa o chão (aviso 450 ms, quadros 0–3) com FAIXA até a borda da tela; nos quadros 4–8
//   corre reto pela faixa (24 px) DERRUBANDO e empurrando 26 px quem cruzar. Recarga 6 s.
//   EM BANDO (IA-39): com 3+ queixadas por perto, a investida sincroniza: todas entram na MESMA faixa (a do líder),
//   com o MESMO aviso (faixa larga, 36 px) e correm juntas.
// - Estalo (snap): queixo treme (aviso 300 ms) e estala os caninos: 0,4× dano em r 40; enluarado/plenilunar
//   ATORDOAM 0,3 s (comum só machuca). Recarga 5 s.
// - ESTOURO (IA-39): quando uma queixada leva golpe forte (pesado ou ≥ 25% da vida), as vizinhas fazem meia-volta
//   e recuam por 1 s.
// - FRAQUEZA: depois da investida fica OFEGANTE e vulnerável 1,0 s (+25% de dano); golpe no FLANCO (por trás ou
//   vindo de outra faixa de profundidade, ≥ 8 px) leva +20%.
// - Tática: cerca em círculo, investe em bando, prioriza o lutador isolado; sozinha, mantém distância (~90 px) e só
//   volta pro corpo a corpo encurralada, esperando o bando. Plenilunar anda/corre ×1,2.
import type { ZombieAI, ZCtx } from './index';
import { aliveF, clampY, setAnim, spawnFx, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 30, dy: 9, cd: 1.4, dmg: 1.0, word: 'NHAC!', lunge: [0, -20, -30, 170, 60, 0, 0, 0] },
  { anim: 'charge', w: 2.5, min: 50, max: 220, dy: 12, cd: 6, dmg: 1.0 },
  { anim: 'snap', w: 2, max: 40, dy: 12, cd: 5, dmg: 0.4, around: 40 },
];

export const QX = {
  /** queixadas (contando ela) pra investida sincronizada e raio de busca do bando */
  band: 3, bandR: 140, bandDY: 50,
  /** faixa da investida (px) sozinha / em bando; empurrão; velocidade da corrida (px/s) */
  lane: 24, laneWide: 36, push: 26, runSpd: 300,
  /** vulnerável depois da investida */
  vulnT: 1.0, vulnMul: 1.25,
  /** flanco */
  flankMul: 1.2, flankDY: 8,
  /** estalo: raio, dano, atordoamento (só enluarado/plenilunar) */
  snapR: 40, snapDmg: 0.4, snapStun: 0.3,
  /** estouro: raio, duração, velocidade do recuo; golpe forte = fração da vida */
  stampedeR: 100, stampedeT: 1.0, stampedeSpd: 46, hardFrac: 0.25,
  /** sozinha: sem outra queixada neste raio, mantém esta distância */
  soloR: 200, soloKeep: 90,
  /** velocidade de perseguição (trote) */
  spd: 24,
};

const isQ = (o: Zombie) => (o.kind as string) === 'queixada' && !o.dead;
const spdK = (z: Zombie) => (z.form === 'plenilunar' ? 1.2 : 1);
const mcd = (z: Zombie): Record<string, number> => ((z._mv ??= { mcd: {}, mhist: [] }) as { mcd: Record<string, number> }).mcd;
const now = (w: World) => w.clock ?? 0;

/** Golpe vem do flanco? (por trás, ou de outra faixa de profundidade) */
export function isFlank(z: Zombie, by: { x: number; y: number }): boolean {
  const d = by.x - z.x;
  return (Math.abs(d) >= 3 && Math.sign(d) !== z.face) || Math.abs(by.y - z.y) >= QX.flankDY;
}

/** Outras queixadas livres por perto (pra sincronizar a investida). */
export function bandMates(w: World, z: Zombie): Zombie[] {
  return w.zs.filter((o) => o !== z && isQ(o) && !o.down && !o.air && !['attack', 'grabbed', 'hurt', 'tired', 'flee', 'boom'].includes(o.state)
    && Math.abs(o.x - z.x) < QX.bandR && Math.abs(o.y - z.y) < QX.bandDY);
}

/** ESTOURO: as vizinhas de `z` fazem meia-volta e recuam (fogem de `from`). Retorna quem recuou. */
export function stampede(w: World, z: Zombie, from: { x: number }): Zombie[] {
  const out: Zombie[] = [];
  for (const o of w.zs) {
    if (o === z || !isQ(o) || o.down || o.air || ['attack', 'grabbed', 'boom'].includes(o.state)) continue;
    if (Math.hypot(o.x - z.x, (o.y - z.y) * 2) > QX.stampedeR) continue;
    o.state = 'flee'; o.fleeT = QX.stampedeT;
    o.face = (Math.sign(o.x - from.x) || (o.x >= z.x ? 1 : -1)) as 1 | -1;
    setAnim(o, 'walk');
    out.push(o);
  }
  if (out.length) w.fx('tag', 'ESTOURO!', z.x, z.y - z.K.top - 14);
  return out;
}

/** Defesa: ofegante +25%, flanco +20%; golpe forte dispara o estouro das vizinhas. */
export const queixadaGuard: Guard = (w, z, dmg, n, by) => {
  let m = 1;
  if ((z.vulnT ?? 0) > 0) m *= QX.vulnMul;
  if (by && isFlank(z, by)) m *= QX.flankMul;
  if ((n === 3 || dmg * m >= z.maxhp * QX.hardFrac) && dmg * m < z.hp) stampede(w, z, by ?? { x: z.x - z.face });
  return dmg * m;
};
(GUARDS as Record<string, Guard>).queixada = queixadaGuard;

/* ---------- investida ---------- */
interface Charge { x0: number; x1: number; y: number; dir: 1 | -1; hit: Set<Fighter>; wide: boolean; lead: boolean; spd: number }

/** Fim da faixa: até a borda da tela na direção da corrida (no máximo LANE_MAX px). */
export const LANE_MAX = 260;
export function laneEnd(w: World, x: number, dir: 1 | -1): number {
  const edge = dir > 0 ? w.cam + w.W - 14 : w.cam + 14;
  return dir > 0 ? Math.min(edge, x + LANE_MAX) : Math.max(edge, x - LANE_MAX);
}
/** Duração (s) dos quadros de corrida da investida. */
function runTime(z: Zombie): number {
  const A = z.K.F.ANIMS.charge; if (!A) return 0.45;
  const r0 = A.run?.[0] ?? 4, r1 = A.run?.[1] ?? 8; let ms = 0;
  for (let i = r0; i <= r1; i++) ms += Number(A.dur(i)) || 90;
  return ms / 1000;
}

function beginCharge(w: World, z: Zombie, dir: 1 | -1, y: number, wide: boolean, lead: boolean): void {
  endMove(w, z);
  z.face = dir; z.state = 'attack'; z.move = 'charge'; z.hit = false; z.hitV = false;
  setAnim(z, 'charge');
  const m = (z._mv ??= { mcd: {}, mhist: [] }) as { mcd: Record<string, number>; mhist: string[] };
  m.mcd.charge = MOVES[1].cd; m.mhist.push('charge'); if (m.mhist.length > 4) m.mhist.shift();
  const x1 = laneEnd(w, z.x, dir);
  z._chg = { x0: z.x, x1, y, dir, hit: new Set(), wide, lead, spd: Math.max(QX.runSpd * spdK(z), Math.abs(x1 - z.x) / runTime(z)) } as Charge;
}

/** Começa a investida; com bando (3+), puxa as vizinhas pra mesma faixa e o mesmo aviso. Retorna o grupo. */
export function startCharge(w: World, z: Zombie, V: { x: number; y: number }): Zombie[] {
  const dir = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  const mates = bandMates(w, z);
  const group = mates.length + 1 >= QX.band ? [z, ...mates] : [z];
  const wide = group.length >= QX.band;
  const y = z.y;
  for (const o of group) beginCharge(w, o, dir, y, wide, o === z);
  const x0 = dir > 0 ? Math.min(...group.map((o) => o.x)) : Math.max(...group.map((o) => o.x)), x1 = (z._chg as Charge).x1;
  if (wide) {
    w.warns.push({ kind: 'lane', x0, x1, y: y - 6, owner: z } as any, { kind: 'lane', x0, x1, y: y + 6, owner: z } as any);
    w.fx('bubble', 'ESTOURO DO BANDO!', z.x, z.y - z.K.top - 10);
  } else {
    w.warns.push({ kind: 'lane', x0, x1, y, owner: z } as any);
    w.fx('bubble', 'INVESTIDA!', z.x, z.y - z.K.top - 10);
  }
  return group;
}

/** Quadros da investida: alinha na faixa durante o aviso; corre e derruba na corrida. Exportado pros testes. */
export function chargeStep(w: World, z: Zombie, dt: number): Fighter[] {
  const D = z._chg as Charge | undefined, out: Fighter[] = [];
  if (!D) return out;
  const A = z.K.F.ANIMS.charge, r0 = A?.run?.[0] ?? 4, r1 = A?.run?.[1] ?? 8;
  if (z.fi < r0) { // aviso: entra na faixa do líder
    const dy = D.y - z.y; z.y = clampY(z.y + Math.sign(dy) * Math.min(Math.abs(dy), 70 * dt));
    return out;
  }
  if (z.fi > r1) return out;
  const ox = z.x;
  z.y = D.y;
  z.x += D.dir * D.spd * dt;
  if ((z.x - D.x1) * D.dir > 0) z.x = D.x1;
  const half = (D.wide ? QX.laneWide : QX.lane) / 2;
  const lo = Math.min(ox, z.x) - 10, hi = Math.max(ox, z.x) + 10;
  for (const f of aliveF(w)) {
    if (D.hit.has(f) || f.x < lo || f.x > hi || Math.abs(f.y - D.y) > half) continue;
    // o bando acerta cada lutador uma vez só
    if (D.wide && w.zs.some((o) => o !== z && isQ(o) && (o._chg as Charge | undefined)?.hit.has(f))) { D.hit.add(f); continue; }
    D.hit.add(f);
    hurtF(w, f, z.K.dmg * MOVES[1].dmg! * z.dmgMul, { push: QX.push, heavy: true });
    if (!f.down && f.state !== 'kd' && f.state !== 'getup') {
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-D.dir) as 1 | -1; }
      else stunF(w, f, 0.9, 'DERRUBADO');
    }
    f.x += D.dir * QX.push; f.y = clampY(f.y);
    w.fx('burst', 'PRÁ!', f.x, f.y - 56);
    spawnFx(w, 'impact', f.x, f.y - 40, (-D.dir) as 1 | -1);
    w.shake = Math.max(w.shake, 0.12);
    out.push(f);
  }
  return out;
}

/* ---------- estalo ---------- */
/** Estalo dos caninos: dano em volta (r 40); enluarado/plenilunar atordoam. Exportado pros testes. */
export function snapHit(w: World, z: Zombie): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (Math.hypot(f.x - z.x, (f.y - z.y) * 2) >= QX.snapR) continue;
    hurtF(w, f, z.K.dmg * QX.snapDmg * z.dmgMul);
    if (z.form !== 'comum') stunF(w, f, QX.snapStun, 'ATORDOADO');
    out.push(f);
  }
  if (out.length) w.fx('burst', 'CLAC!', out[0].x, out[0].y - 60);
  z.hit = true;
  return out;
}

/** Lutador mais isolado (menos aliados a 60 px) entre os que estão a até 260 px. */
export function isolatedTarget(w: World, z: Zombie): Fighter | null {
  let best: Fighter | null = null, bs = 1e9;
  for (const f of aliveF(w)) {
    const d = Math.abs(f.x - z.x) + 2 * Math.abs(f.y - z.y);
    if (d > 260) continue;
    const near = aliveF(w).filter((o) => o !== f && Math.abs(o.x - f.x) < 60 && Math.abs(o.y - f.y) < 24).length;
    const s = near * 1000 + d;
    if (s < bs) { bs = s; best = f; }
  }
  return best;
}

const isSolo = (w: World, z: Zombie) => !w.zs.some((o) => o !== z && isQ(o) && Math.abs(o.x - z.x) < QX.soloR);

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const queixada: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    if ((z.vulnT ?? 0) > 0) z.vulnT = Math.max(0, z.vulnT - dt);
    if (z._chg && !(z.state === 'attack' && z.anim === 'charge')) { z._chg = null; w.warns = w.warns.filter((t) => t.owner !== z); }
    // prioriza o lutador isolado (reavalia a cada 1,2 s)
    if (now(w) >= (z._isoT ?? 0)) { z._isoT = now(w) + 1.2; const t = isolatedTarget(w, z); if (t) { z.tg = t; z.tgT = 1.2; } }
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'flee') { // estouro: meia-volta e recua
      z.fleeT = (z.fleeT ?? 0) - dt;
      if (z.anim !== 'walk') setAnim(z, 'walk');
      z.x += z.face * QX.stampedeSpd * spdK(z) * dt;
      z.x = Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x));
      c.step();
      if (z.fleeT <= 0) { z.face = (Math.sign(c.dx) || z.face) as 1 | -1; toChase(z); }
      return;
    }
    if (z.state === 'tired') { // FRAQUEZA: ofegante depois da investida
      c.step();
      if (z.done) { if ((z.vulnT ?? 0) > 0) setAnim(z, z.K.F.ANIMS.pant ? 'pant' : 'idle'); else toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      if (z.anim === 'charge') chargeStep(w, z, dt); else moveStep(c, MOVES);
      c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'charge') {
          z._chg = null;
          z.vulnT = QX.vulnT; z.state = 'tired'; setAnim(z, z.K.F.ANIMS.pant ? 'pant' : 'idle');
          w.fx('tag', 'OFEGANTE!', z.x, z.y - z.K.top - 14);
        } else { z.state = 'cool'; z.cd = 0.45; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    const solo = isSolo(w, z);
    if (c.adx < 230 && Math.abs(c.dy) < 14) {
      // sozinha só morde encurralada (alvo colado); investida e estalo sempre valem
      const mv = pickMove(c, solo && c.adx > 26 ? MOVES.filter((m) => m.anim !== 'attack') : MOVES);
      if (mv) {
        if (mv.anim === 'charge') startCharge(w, z, c.V);
        else startMove(c, mv);
        return;
      }
    }
    setAnim(z, 'walk');
    c.chase(QX.spd * spdK(z), solo ? QX.soloKeep : 24);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'charge') {
      if (fi === (A?.run?.[0] ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1); }
      if (fi === 1 || fi === 3) spawnFx(w, 'dust', z.x + z.face * 14, z.y, (-z.face) as 1 | -1);
      return;
    }
    if (z.anim === 'snap') { if (fi === (A?.hit ?? 3)) snapHit(w, z); return; }
    moveFrame(c, fi, MOVES);
  },
};
