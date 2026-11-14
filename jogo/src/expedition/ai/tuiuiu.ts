// Tuiuiú Zumbi (IA-37, IA-38 · Pantanal, comum animal — ave). Primeiro ALVO AÉREO do mapa.
// - Bicada (attack): pescoço recua em S (aviso 250 ms) e dispara, 40 px. Plenilunar: bicada dupla (2º acerto no quadro 6).
// - Bicada longa (lunge): faixa FINA na linha do alvo (aviso 400 ms), até 100 px a partir de onde ele estava;
//   PERFURA: ignora metade da redução de dano do lutador (ARM) e causa SANGRAMENTO por 3 s.
// - Voo rasante (dive): só com o alvo a 120–280 px. Aviso = faixa até o fim do trajeto + sombra (500 ms). Decola,
//   plana em linha reta (faixa de 24 px) acertando quem cruzar (empurra 18 px) e pousa. NO VOO é imune a golpe
//   corpo a corpo de solo (só projétil, laser ou golpe de cima acertam; nada o derruba no ar).
// - FRAQUEZA: ao pousar fica ESPARRAMADO 0,8 s levando +30% de dano; a cabeça (alvo grande) leva +20% de projétil.
// - Tática: anda atrás do bando no alcance da bicada longa; ferido (< 40%) foge voando uma vez e volta em rasante.
import type { ZombieAI, ZCtx } from './index';
import { aliveF, clampY, setAnim, spawnFx, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, bleed, killZ, type Guard } from '../combat';
import { ARM, hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 40, dy: 9, cd: 1.6, dmg: 1.0, word: 'CLAC!' },
  { anim: 'lunge', w: 3, min: 28, max: 100, dy: 8, cd: 4.5, dmg: 1.3, warn: 'lane', lunge: [0, 0, 0, -30, 380, 60, 0, 0] },
  { anim: 'dive', w: 2.5, min: 120, max: 280, dy: 10, cd: 7, dmg: 1.1 },
];
export const DIVE_MIN = 120;
export const DIVE_MAX = 280;
/** largura da faixa do rasante (px) e empurrão */
export const DIVE_LANE = 24;
export const DIVE_PUSH = 18;
/** pouso: tempo esparramado e bônus de dano */
export const LAND_T = 0.8;
export const LAND_MUL = 1.3;
/** projétil na cabeça */
export const PROJ_MUL = 1.2;
/** fração da redução de dano ignorada pela bicada longa */
export const PIERCE = 0.5;
/** sangramento: duração e dano total (fração do dano base) */
export const BLEED_T = 3;
export const BLEED_FRAC = 0.3;
/** foge voando abaixo desta fração de vida (1× por zumbi) */
export const FLEE_HP = 0.4;

const mcd = (z: Zombie): Record<string, number> => ((z._mv ??= { mcd: {}, mhist: [] }) as { mcd: Record<string, number> }).mcd;

/** No ar (decolando, planando): quadros 3–8 do rasante. */
export function isFlying(z: Zombie): boolean {
  if (z.state !== 'attack' || z.anim !== 'dive') return false;
  const A = z.K.F.ANIMS.dive, f0 = (A?.fly?.[0] ?? 4) - 1, f1 = A?.fly?.[1] ?? 8;
  return z.fi >= f0 && z.fi <= f1;
}

/** O dano vem de projétil (tiro, laser de longe, arremesso sem dono)? */
export function isProjectile(w: World, z: Zombie, by?: Fighter | null): boolean {
  if (!by) return true;
  if (by.w?.tipo === 'beam' && Math.abs(by.x - z.x) > 30) return true;
  return !!w.proj?.some((p) => p.kind === 'bullet' && !p.done && p.from === by && Math.abs(p.x - z.x) < z.K.w / 2 + 16);
}

/** Defesa (registrada em GUARDS): imune no voo a corpo a corpo de solo; esparramado +30%; projétil +20%. */
export const tuiuiuGuard: Guard = (w, z, dmg, _n, by) => {
  const proj = isProjectile(w, z, by);
  if (isFlying(z)) {
    const above = (by?.z ?? 0) >= 16;
    if (!proj && !above) {
      if ((w.clock ?? 0) >= (z._noArT ?? 0)) { z._noArT = (w.clock ?? 0) + 0.6; w.fx('tag', 'NO AR!', z.x, z.y - (z.z || 0) - z.K.top * 0.5 - 14); }
      return null;
    }
    // acertado no ar: leva o dano mas não sai do voo (nada de derrubar/atordoar lá em cima)
    const d = Math.max(1, Math.round(dmg * (proj ? PROJ_MUL : 1)));
    z.hp -= d; z.flash = 0.035;
    w.fx('dmg', String(d), z.x, z.y - (z.z || 0) - z.K.top - 6);
    bleed(w, z, Math.sign(z.x - (by?.x ?? z.x - 1)) || 1, 0.7);
    if (z.hp <= 0) killZ(w, z, by);
    return null;
  }
  let m = 1;
  if ((z.landT ?? 0) > 0) m *= LAND_MUL;
  if (proj) m *= PROJ_MUL;
  return dmg * m;
};
(GUARDS as Record<string, Guard>).tuiuiu = tuiuiuGuard;

/* ---------- sangramento (no lutador) ---------- */
export function applyBleed(f: Fighter, total: number): void {
  f._bleed = { t: BLEED_T, dps: total / BLEED_T, acc: 0 };
}
/** Desconta o sangramento dos lutadores (1× por passo do mundo, mesmo com vários tuiuiús). Não mata (para em 1). */
export function tickBleed(w: World, dt: number): void {
  const W = w as World & { _tuiBleedT?: number };
  if (w.clock != null) { if (W._tuiBleedT === w.clock) return; W._tuiBleedT = w.clock; }
  for (const f of w.fs) {
    const b = f._bleed as { t: number; dps: number; acc: number } | undefined;
    if (!b) continue;
    if (f.down) { f._bleed = null; continue; }
    b.t -= dt; b.acc += b.dps * dt;
    if (b.acc >= 1) { const n = Math.floor(b.acc); b.acc -= n; f.hp = Math.max(1, f.hp - n); }
    if (b.t <= 0) f._bleed = null;
  }
}

/* ---------- bicada longa ---------- */
/** Acerta todos na faixa fina à frente (a partir de onde começou o bote), perfura e faz sangrar. */
export function lungeHit(w: World, z: Zombie): Fighter[] {
  const A = z.K.F.ANIMS.lunge, reach = A?.reach ?? 100, x0 = z._lx0 ?? z.x, out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const d = (f.x - x0) * z.face;
    if (d < -6 || d > reach || Math.abs(f.y - z.y) > 8) continue;
    const arm = ARM(f), base = z.K.dmg * 1.3 * z.dmgMul;
    const hp0 = f.hp;
    hurtF(w, f, base * (1 - (1 - arm) * PIERCE) / arm);
    if (f.hp < hp0) applyBleed(f, z.K.dmg * BLEED_FRAC * z.dmgMul);
    out.push(f);
  }
  if (out.length) {
    w.fx('burst', 'PERFUROU!', out[0].x, out[0].y - 60);
    w.fx('tag', 'SANGRANDO', out[0].x, out[0].y - 90);
    w.hitstop = Math.max(w.hitstop ?? 0, 0.05);
  }
  return out;
}

/* ---------- voo rasante ---------- */
interface Dive { x0: number; x1: number; y: number; t: number; T: number; hit: Set<Fighter>; flee: boolean }

function flightTime(z: Zombie): number {
  const A = z.K.F.ANIMS.dive; if (!A) return 0.55;
  const f0 = A.fly?.[0] ?? 4, f1 = A.fly?.[1] ?? 8; let ms = 0;
  for (let i = f0; i <= f1; i++) ms += Number(A.dur(i)) || 100;
  return ms / 1000;
}

/** Ponto de pouso: passa do alvo e vai até 280 px (dentro da tela). */
export function diveTarget(w: World, z: Zombie, adx: number, dir: 1 | -1, flee = false): number {
  const dist = flee ? 160 : Math.max(140, Math.min(DIVE_MAX, adx + 50));
  return Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x + dir * dist));
}

function startDive(c: ZCtx, mv: ZMove | null): void {
  const { z, w } = c;
  const flee = !mv;
  if (mv) startMove(c, mv);
  else { // fuga: sem aviso nem dano, pra longe do alvo
    z.face = (-(Math.sign(c.dx) || z.face)) as 1 | -1;
    z.state = 'attack'; z.move = 'dive'; z.hit = false; setAnim(z, 'dive');
    w.fx('tag', 'FUGIU VOANDO', z.x, z.y - z.K.top * 0.5 - 14);
  }
  const x1 = diveTarget(w, z, c.adx, z.face, flee);
  z._dive = { x0: z.x, x1, y: z.y, t: 0, T: flightTime(z), hit: new Set(), flee } as Dive;
  if (!flee) {
    w.warns.push({ kind: 'lane', x0: z.x, x1, y: z.y, owner: z } as any); // faixa até o fim do trajeto (a sombra é o próprio zumbi no chão)
    w.fx('bubble', 'RASANTE!', z.x, z.y - z.K.top * 0.6);
  }
}

/** Move o tuiuiú no trecho de voo e acerta quem estiver na faixa entre a posição anterior e a nova. Exportado pros testes. */
export function diveStep(w: World, z: Zombie, dt: number): Fighter[] {
  const D = z._dive as Dive | undefined, out: Fighter[] = [];
  if (!D) return out;
  const A = z.K.F.ANIMS.dive, f0 = A?.fly?.[0] ?? 4, f1 = A?.fly?.[1] ?? 8;
  if (z.fi < f0) return out;
  const ox = z.x;
  if (z.fi > f1) { z.x = D.x1; }
  else { D.t += dt; const p = Math.min(1, D.t / D.T); z.x = D.x0 + (D.x1 - D.x0) * p; }
  if (D.flee || z.fi > f1) return out;
  const lo = Math.min(ox, z.x) - 8, hi = Math.max(ox, z.x) + 8, dir = (Math.sign(D.x1 - D.x0) || z.face) as 1 | -1;
  for (const f of aliveF(w)) {
    if (D.hit.has(f) || f.x < lo || f.x > hi || Math.abs(f.y - D.y) > DIVE_LANE / 2) continue;
    D.hit.add(f);
    hurtF(w, f, z.K.dmg * 1.1 * z.dmgMul, { push: DIVE_PUSH });
    f.x += dir * DIVE_PUSH; f.y = clampY(f.y);
    w.fx('burst', 'VUUSH!', f.x, f.y - 60);
    spawnFx(w, 'impact', f.x, f.y - 50, (-dir) as 1 | -1);
    out.push(f);
  }
  return out;
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const tuiuiu: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickBleed(w, dt);
    if ((z.landT ?? 0) > 0) z.landT = Math.max(0, z.landT - dt);
    if (z._dive && !(z.state === 'attack' && z.anim === 'dive')) { z._dive = null; w.warns = w.warns.filter((t) => t.owner !== z); }
    if (z.state !== 'attack' && (z.z || 0) > 0 && !z.air) z.z = Math.max(0, z.z - 180 * dt); // interrompido no ar: desce
    if (z.state === 'wander') { c.step(); if (c.adx < 240) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'landed') { // FRAQUEZA: esparramado depois do pouso
      if (z.anim !== 'land') { toChase(z); return; }
      c.step();
      if (z.done && (z.landT ?? 0) <= 0) toChase(z);
      return;
    }
    if (z.state === 'attack') {
      if (z.anim === 'dive') diveStep(w, z, dt); else moveStep(c, MOVES);
      c.step(true);
      if (z.done) {
        const was = z.anim, D = z._dive as Dive | undefined;
        endMove(w, z);
        if (was === 'dive') {
          z._dive = null; z.z = 0;
          if (D?.flee) { mcd(z).dive = 0; z.state = 'cool'; z.cd = 0.3; setAnim(z, 'idle'); }
          else {
            z.landT = LAND_T; z.state = 'landed';
            setAnim(z, z.K.F.ANIMS.land ? 'land' : 'idle');
            w.fx('tag', 'ESPARRAMADO!', z.x, z.y - z.K.top * 0.5 - 14);
          }
        } else { z.state = 'cool'; z.cd = 0.5; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // ferido: foge voando uma vez (depois volta em rasante)
    if (!z._fled && z.hp < z.maxhp * FLEE_HP && c.adx < 140 && z.K.F.ANIMS.dive) { z._fled = true; startDive(c, null); return; }
    if (c.adx < DIVE_MAX + 10 && Math.abs(c.dy) < 14) {
      const mv = pickMove(c, MOVES);
      if (mv) {
        if (mv.anim === 'dive') startDive(c, mv);
        else { startMove(c, mv); z._lx0 = z.x; }
        return;
      }
    }
    // atrás do bando: espera no alcance da bicada longa enquanto ela está pronta; senão encosta pra bicar
    const lungeReady = (mcd(z).lunge ?? 0) <= 0;
    setAnim(z, 'walk');
    c.chase(18, lungeReady ? 70 : 32);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'dive') {
      if (fi === (A?.fly?.[0] ?? 4)) spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1);
      if (fi === (A?.land ?? 9)) { w.warns = w.warns.filter((t) => t.owner !== z); spawnFx(w, 'dust', z.x, z.y, z.face); w.shake = Math.max(w.shake, 0.06); }
      return;
    }
    if (z.anim === 'lunge') {
      if (fi === (A?.hit ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); lungeHit(w, z); z.hit = true; }
      return;
    }
    if (z.anim === 'attack' && fi === 6 && z.form === 'plenilunar') { // bicada dupla
      const d = (V.x - z.x) * z.face;
      if (!V.down && d > -8 && d < (A?.reach ?? 40) && Math.abs(V.y - z.y) < 13) { hurtF(w, V, z.K.dmg * 0.7 * z.dmgMul); w.fx('burst', 'CLAC-CLAC!', V.x, V.y - 60); }
      return;
    }
    moveFrame(c, fi, MOVES);
  },
};
