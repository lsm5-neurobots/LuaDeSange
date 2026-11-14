// Cardume de Piranhas (IA-47–50 · Amazônia, comum animal em grupo). UM zumbi = UM cardume (3 peixes comum, 5 enluarado,
// 4 plenilunar). Só vive na ÁGUA/LAMA: nasce numa poça (ator de chão com a arte xPond) ou numa zona `w.water` do mapa.
// - IA-47 Mordida (bite): recua 250 ms, dash curto (~40 px), 0,6× do dano + SANGRAMENTO 3 s (acumula até 3).
//   Recarga 1,2 s por peixe (o cardume revezando: 1,2 / nº de peixes × 1,5).
// - IA-48 Salto fora d'água (leap): sombra (círculo) no ponto de queda 0,5 s antes; arco de até 70 px, morde no
//   ápice (0,9×; plenilunar: salto triplo, 3 mordidas de 0,5×). Se cair FORA da água fica ENCALHADO 2 s. Recarga 5 s.
// - IA-49 Frenesi: com lutador SANGRANDO a até 180 px, olhos brilham (0,4 s) e por 4 s: +40% de velocidade e
//   investida dupla (a mordida acerta 2×). Recarga 12 s.
// - IA-50 Encalhado / fraqueza: fora da água (salto errado, arremessado, derrubado longe) debate-se sem atacar
//   e leva DANO ×2; depois de 2 s volta se arrastando pra poça mais perto. Ataque em ÁREA (golpe especial, laser)
//   leva ×2,5 (o cardume se espalha e morre). Frágil: 25 de vida por peixe.
// - Tática: só nada dentro da água (perseguição tática + trava na borda da poça); de longe espera na borda e salta.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, rnd, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF } from '../fighter';
import { endMove, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

/** peixes por forma */
export const FISH: Record<string, number> = { comum: 3, enluarado: 5, plenilunar: 4 };
export const fishOf = (z: Zombie) => FISH[z.form] ?? 3;
/** recarga da mordida: 1,2 s por peixe, revezando no cardume */
export const biteCd = (z: Zombie) => Math.max(0.3, (1.2 / fishOf(z)) * 1.5);

export const MOVES: ZMove[] = [
  { anim: 'bite', w: 4, max: 44, dy: 10, cd: 0.6, dmg: 0.6, word: 'NHAC!', lunge: [-40, -40, 420, 100, 0, -60, -40] },
  { anim: 'leap', w: 2.5, min: 34, max: 70, dy: 16, cd: 5, dmg: 0.9 },
];
export const BITE_MUL = 0.6;
export const LEAP_MUL = 0.9;
export const LEAP3_MUL = 0.5;
export const LEAP_MAX = 70;
/** sangramento: duração, dano total por acúmulo (fração do dano base), máximo de acúmulos */
export const BLEED_T = 3;
export const BLEED_FRAC = 0.3;
export const BLEED_MAX = 3;
/** frenesi */
export const FRENZY_R = 180;
export const FRENZY_T = 4;
export const FRENZY_CD = 12;
export const FRENZY_SPD = 1.4;
/** encalhado */
export const BEACH_T = 2;
export const BEACH_MUL = 2;
export const AREA_MUL = 2.5;
export const FLOP_SPD = 22;
export const SPEED = 30;
/** poça própria (px lógicos) */
export const POND_RX = 70;
export const POND_RY = 17;

export interface Pond { x: number; y: number; rx: number; ry: number; owner?: number; actor?: ExtraActor }
type W = World & { water?: Pond[]; _pirPonds?: Pond[]; _pirBleedT?: number };

/** Zonas de água: as do mapa (w.water, se houver) + as poças dos cardumes. */
export function pondsOf(w: World): Pond[] {
  const X = w as W;
  return [...(X.water ?? []), ...(X._pirPonds ?? [])];
}
const inPond = (p: Pond, x: number, y: number) => ((x - p.x) / p.rx) ** 2 + ((y - p.y) / p.ry) ** 2 <= 1;
export function inWater(w: World, x: number, y: number): boolean {
  return pondsOf(w).some((p) => inPond(p, x, y));
}
/** Poça mais perto (distância normalizada pela elipse). */
export function nearestPond(w: World, x: number, y: number): Pond | null {
  let best: Pond | null = null, bd = 1e9;
  for (const p of pondsOf(w)) { const d = Math.hypot((x - p.x) / p.rx, (y - p.y) / p.ry); if (d < bd) { bd = d; best = p; } }
  return best;
}
/** Ponto dentro da água mais perto de (x, y) (projeta na borda da poça mais perto, com margem). */
export function clampToWater(w: World, x: number, y: number): { x: number; y: number } {
  if (inWater(w, x, y)) return { x, y };
  const p = nearestPond(w, x, y);
  if (!p) return { x, y };
  const dx = (x - p.x) / p.rx, dy = (y - p.y) / p.ry, d = Math.hypot(dx, dy) || 1, k = 0.94 / d;
  return { x: p.x + dx * k * p.rx, y: p.y + dy * k * p.ry };
}

/* ---------- poça (ator de chão) ---------- */
/** Cria uma poça no chão da arena (com a arte xPond). Exportado pros testes. */
export function makePond(w: World, x: number, y: number): Pond {
  const X = w as W, list = (X._pirPonds ??= []);
  // limpa poças de cardumes mortos há tempo
  for (let i = list.length - 1; i >= 0; i--) {
    const P = list[i], o = P.owner != null ? w.zs.find((z) => z.uid === P.owner) : undefined;
    if (P.owner != null && (!o || (o.dead && o.deadT > 2.5))) { list.splice(i, 1); if (P.actor && w.actors) { const j = w.actors.indexOf(P.actor); if (j >= 0) w.actors.splice(j, 1); } }
  }
  const P: Pond = { x, y: clampY(y), rx: POND_RX, ry: POND_RY };
  const owner = () => (P.owner != null ? w.zs.find((z) => z.uid === P.owner) : undefined);
  P.actor = {
    x: P.x, y: P.y - P.ry + 3, w0: 0,
    get hide() { const o = owner(); return !!o && o.dead && o.deadT > 2.5; },
    draw: (cx, cam) => {
      const K = (w.zk as any).piranha, F = K?.F; if (!F?.frame) return;
      const o = owner(), form = o?.form ?? 'comum', fi = Math.floor((w.clock ?? 0) * 5.5) % 4;
      const cv: any = F.framePose ? F.framePose(form, 'xPond', { st: fi }, 'xPond' + fi + '.0') : F.frame(form, 'xPond', fi, 5);
      if (!cv) return;
      cx.drawImage(cv, Math.round(P.x - cam) - (cv._ax ?? cv.width / 2) / RS, Math.round(P.y) - (cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
    },
  };
  (w.actors ??= []).push(P.actor);
  list.push(P);
  return P;
}

/* ---------- sangramento (no lutador, acumula até 3) ---------- */
interface Bleed { st: { t: number; dps: number }[]; acc: number }
export function applyBleed(w: World, f: Fighter, z: Zombie): number {
  const b: Bleed = (f._pirBleed ??= { st: [], acc: 0 });
  const s = { t: BLEED_T, dps: (z.K.dmg * BLEED_FRAC * z.dmgMul) / BLEED_T };
  if (b.st.length >= BLEED_MAX) { b.st.sort((a, c) => a.t - c.t); b.st[0] = s; } else b.st.push(s);
  w.fx('tag', b.st.length > 1 ? 'SANGRANDO x' + b.st.length : 'SANGRANDO', f.x, f.y - 92);
  return b.st.length;
}
export const bleeding = (f: Fighter) => !!(f._pirBleed?.st?.length || f._bleed);
/** Desconta o sangramento (1× por passo do mundo, mesmo com vários cardumes). Não mata (para em 1). */
export function tickBleed(w: World, dt: number): void {
  const X = w as W;
  if (w.clock != null) { if (X._pirBleedT === w.clock) return; X._pirBleedT = w.clock; }
  for (const f of w.fs) {
    const b = f._pirBleed as Bleed | undefined;
    if (!b?.st.length) continue;
    if (f.down) { f._pirBleed = null; continue; }
    for (const s of b.st) { b.acc += s.dps * Math.min(dt, s.t); s.t -= dt; }
    b.st = b.st.filter((s) => s.t > 0);
    if (b.acc >= 1) { const n = Math.floor(b.acc); b.acc -= n; f.hp = Math.max(1, f.hp - n); }
    if (!b.st.length) f._pirBleed = null;
  }
}

/* ---------- defesa / fraqueza ---------- */
export const isBeached = (z: Zombie) => z.state === 'beached';
/** Golpe em área: especial em andamento (f.gr) ou laser. */
export const isArea = (by?: Fighter | null) => !!by && (!!by.gr || by.w?.tipo === 'beam');
export const piranhaGuard: Guard = (_w, z, dmg, _n, by) => {
  let m = 1;
  if (isBeached(z)) m *= BEACH_MUL;
  if (isArea(by)) m *= AREA_MUL;
  return dmg * m;
};
(GUARDS as Record<string, Guard>).piranha = piranhaGuard;

/* ---------- golpes ---------- */
function biteHit(c: ZCtx, mul: number): boolean {
  const { z, V, w } = c, A = z.K.F.ANIMS.bite, reach = A?.reach ?? 40;
  const d = (V.x - z.x) * z.face;
  if (V.down || d < -18 || d > reach || Math.abs(V.y - z.y) > 13) return false;
  const hp0 = V.hp;
  hurtF(w, V, z.K.dmg * mul * z.dmgMul);
  if (V.hp < hp0) applyBleed(w, V, z);
  w.fx('burst', 'NHAC!', (V.x + z.x) / 2, V.y - 50);
  return true;
}
/** Dano do salto: quem estiver perto do ponto onde o cardume está no ápice. */
export function leapHit(w: World, z: Zombie, mul: number): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) if (Math.abs(f.x - z.x) < 26 && Math.abs(f.y - z.y) < 14) { hurtF(w, f, z.K.dmg * mul * z.dmgMul); out.push(f); }
  if (out.length) w.fx('burst', 'CHOMP!', out[0].x, out[0].y - 60);
  return out;
}
interface Leap { x0: number; x1: number; y0: number; y1: number; t: number; T: number }
function airTime(z: Zombie): number {
  const A = z.K.F.ANIMS.leap; if (!A) return 0.5;
  const [a, b] = A.air ?? [1, 6]; let ms = 0;
  for (let i = a; i <= b; i++) ms += Number(A.dur(i)) || 90;
  return ms / 1000;
}
/** Ponto de queda do salto (até 70 px na direção do alvo). Exportado pros testes. */
export function leapTarget(w: World, z: Zombie, V: { x: number; y: number }): { x: number; y: number } {
  const dx = V.x - z.x, d = Math.min(LEAP_MAX, Math.abs(dx));
  return { x: Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x + (Math.sign(dx) || z.face) * d)), y: clampY(z.y + Math.max(-12, Math.min(12, V.y - z.y))) };
}
function startLeap(c: ZCtx, mv: ZMove): void {
  const { z, w, V } = c;
  startMove(c, mv);
  const t = leapTarget(w, z, V);
  z._leap = { x0: z.x, y0: z.y, x1: t.x, y1: t.y, t: 0, T: airTime(z) } as Leap;
  w.warns.push({ kind: 'circle', x: t.x, y: t.y, r: 22, owner: z, c: 'rgba(30,20,40,' } as any); // sombra na queda
}
/** Move o cardume no arco do salto. Exportado pros testes. */
export function leapStep(z: Zombie, dt: number): void {
  const L = z._leap as Leap | undefined; if (!L) return;
  const A = z.K.F.ANIMS.leap, [a, b] = A?.air ?? [1, 6];
  if (z.fi < a) return;
  if (z.fi > b) { z.x = L.x1; z.y = L.y1; return; }
  L.t += dt; const p = Math.min(1, L.t / L.T);
  z.x = L.x0 + (L.x1 - L.x0) * p; z.y = L.y0 + (L.y1 - L.y0) * p;
}

/* ---------- estados ---------- */
function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }
/** Entra em ENCALHADO (fora d'água). Exportado pros testes. */
export function beach(w: World, z: Zombie, t = BEACH_T): void {
  endMove(w, z); z._leap = null;
  z.state = 'beached'; z.beachT = t; setAnim(z, z.K.F.ANIMS.beached ? 'beached' : 'idle');
  w.fx('tag', 'ENCALHADAS!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'dust', z.x, z.y, z.face);
}

export const piranha: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickBleed(w, dt);
    const M = (z._mv ??= { mcd: {}, mhist: [] }).mcd as Record<string, number>;
    if (!z._pond && !pondsOf(w).length) { const P = makePond(w, z.x, z.y); P.owner = z.uid; z._pond = P; } // sem água no mapa: traz a poça
    else if (!z._pond) { const P = nearestPond(w, z.x, z.y); if (P && P.owner == null) P.owner = z.uid; z._pond = P; }
    if ((z.frenzyT ?? 0) > 0) z.frenzyT = Math.max(0, z.frenzyT - dt);
    if (z._leap && !(z.state === 'attack' && z.anim === 'leap')) { z._leap = null; w.warns = w.warns.filter((t) => t.owner !== z); }

    if (z.state === 'emerge') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'beached') { // FRAQUEZA: debate-se, não ataca; depois se arrasta pra água
      if (z.anim !== 'beached' && z.K.F.ANIMS.beached) setAnim(z, 'beached');
      c.step();
      z.beachT = Math.max(0, (z.beachT ?? 0) - dt);
      if (z.beachT <= 0) {
        const t = clampToWater(w, z.x, z.y), dx = t.x - z.x, dy = t.y - z.y, d = Math.hypot(dx, dy);
        if (d < 2 || inWater(w, z.x, z.y)) { toChase(z); spawnFx(w, 'dust', z.x, z.y, z.face); return; }
        z.x += (dx / d) * FLOP_SPD * dt; z.y = clampY(z.y + (dy / d) * FLOP_SPD * dt);
      }
      return;
    }
    if (z.state === 'frenzy') { c.step(); if (z.done || !z.K.F.ANIMS.frenzy) { z.frenzyT = FRENZY_T; w.fx('tag', 'FRENESI!', z.x, z.y - z.K.top * 0.5 - 14); toChase(z); } return; }
    if (z.state === 'attack') {
      if (z.anim === 'leap') leapStep(z, dt);
      else { moveStep(c, MOVES); const t = clampToWater(w, z.x, z.y); z.x = t.x; z.y = t.y; } // a mordida não sai da água
      c.step(true);
      if (z.done) {
        const was = z.anim;
        endMove(w, z);
        if (was === 'leap') { z._leap = null; if (!inWater(w, z.x, z.y)) { beach(w, z); return; } }
        z.state = 'cool'; z.cd = 0.35; setAnim(z, 'idle');
      }
      return;
    }
    // fora d'água (arremessado, derrubado longe): encalha
    if (!inWater(w, z.x, z.y)) { beach(w, z); return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // frenesi: cheiro de sangue
    if ((M.frenzy ?? 0) <= 0 && z.K.F.ANIMS.frenzy && aliveF(w).some((f) => bleeding(f) && Math.abs(f.x - z.x) < FRENZY_R)) {
      M.frenzy = FRENZY_CD; z.state = 'frenzy'; setAnim(z, 'frenzy');
      w.fx('bubble', 'SANGUE!', z.x, z.y - z.K.top * 0.6);
      return;
    }
    if (c.adx < LEAP_MAX + 6 && Math.abs(c.dy) < 18) {
      const mv = pickMove(c, MOVES);
      if (mv) {
        if (mv.anim === 'leap') startLeap(c, mv);
        else { startMove(c, mv); M.bite = biteCd(z) * ((z.frenzyT ?? 0) > 0 ? 0.5 : 1); }
        return;
      }
    }
    // nada atrás do alvo sem sair da água (cerco tático + trava na borda)
    const spd = SPEED * ((z.frenzyT ?? 0) > 0 ? FRENZY_SPD : 1);
    setAnim(z, 'walk');
    c.chase(spd, 30);
    const t = clampToWater(w, z.x, z.y); z.x = t.x; z.y = t.y;
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'bite') {
      if (fi === (A?.hit ?? 3) && biteHit(c, BITE_MUL)) z.hit = true;
      if (fi === (A?.hit ?? 3) + 1 && (z.frenzyT ?? 0) > 0) biteHit(c, BITE_MUL); // investida dupla
      return;
    }
    if (z.anim === 'leap') {
      const air = A?.air ?? [1, 6];
      if (fi === air[0]) spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1);
      const tri = z.form === 'plenilunar', hits: number[] = tri ? (A?.hits3 ?? [4, 5, 6]) : [A?.hit ?? 4];
      if (hits.includes(fi)) { if (leapHit(w, z, tri ? LEAP3_MUL : LEAP_MUL).length) z.hit = true; }
      if (fi === (A?.land ?? 7)) { w.warns = w.warns.filter((t) => t.owner !== z); spawnFx(w, 'dust', z.x, z.y, z.face); }
    }
  },
  spawn(w: World, i: number, fromLeft: boolean) {
    // aparece na água: numa zona do mapa perto da câmera, ou numa poça nova dentro da tela
    const X = w as W, map = (X.water ?? []).filter((p) => p.x > w.cam && p.x < w.cam + w.W);
    if (map.length) { const p = map[i % map.length], a = rnd() * Math.PI * 2; return { x: p.x + Math.cos(a) * p.rx * 0.5, y: clampY(p.y + Math.sin(a) * p.ry * 0.5), face: fromLeft ? 1 : -1, state: 'emerge', anim: 'alert' }; }
    const lo = w.cam + POND_RX + 8, hi = w.cam + w.W - POND_RX - 8;
    let x = fromLeft ? w.cam + w.W * 0.3 : w.cam + w.W * (0.62 + 0.14 * (i % 2));
    const used = X._pirPonds ?? [];
    for (let k = 0; k < 6 && used.some((p) => Math.abs(p.x - x) < POND_RX * 1.2 && !(w.zs.find((z) => z.uid === p.owner)?.dead)); k++) x += (fromLeft ? 1 : -1) * POND_RX * 1.3;
    x = Math.max(lo, Math.min(hi, x));
    const y = clampY(168 + ((i * 13) % 24));
    makePond(w, x, y);
    spawnFx(w, 'dust', x, y, 1);
    return { x, y, face: fromLeft ? 1 : -1, state: 'emerge', anim: 'alert' };
  },
};
