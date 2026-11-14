// Ruído na expedição (IA-23): quem caça pelo som (Estalador) só percebe o que faz barulho.
// - Ruídos implícitos, lidos do estado do mundo a cada quadro: lutador correndo (> 55 px/s), golpeando,
//   atirando (pistola alto, laser baixo), levando dano; vasculhar, abrir baú e errar o puzzle.
// - Ruídos explícitos (emitNoise): estalo sônico, etc. Valem 2 s.
// Andar devagar (avançar a 46 px/s) e ficar parado = silêncio.
import type { Fighter, World, Zombie } from '../world';

export interface Noise { x: number; y: number; lvl: number; r: number; t: number; f?: Fighter | null }

interface NoiseState { list: Noise[]; amb: Noise[]; ambClock: number; last: Map<Fighter, { x: number; y: number; t: number; v: number }> }
const st = (w: World): NoiseState => ((w as any)._noise ??= { list: [], amb: [], ambClock: -1, last: new Map() });

/** Velocidade a partir da qual o lutador "corre" (px/s). Avançar = 46, andar entre arenas = 64. */
export const RUN_SPEED = 55;
/** Tempo de memória de um ruído (s). */
export const NOISE_MEM = 2;

export function emitNoise(w: World, x: number, y: number, lvl: number, r: number, f?: Fighter | null): void {
  const s = st(w);
  s.list.push({ x, y, lvl, r, t: w.clock, f: f ?? null });
  if (s.list.length > 24) s.list.splice(0, s.list.length - 24);
}

/** Ruído que o lutador está fazendo agora (ou null se está em silêncio). */
export function fighterNoise(w: World, f: Fighter, speed: number): { lvl: number; r: number } | null {
  if (f.down) return null;
  if (f.state === 'shot' || f.state === 'charge') return f.w?.tipo === 'beam' ? { lvl: 0.4, r: 110 } : { lvl: 0.9, r: 240 };
  if (f.state === 'hurt') return { lvl: 0.7, r: 180 };
  if (f.state === 'combo' || f.state === 'golpe' || f.state === 'special') return { lvl: 0.5, r: 130 };
  if (speed > RUN_SPEED || f.dodge) return { lvl: 0.5, r: 140 };
  return null;
}

/** Recalcula os ruídos implícitos 1× por quadro (barato: poucos lutadores e spots). */
function ambient(w: World): Noise[] {
  const s = st(w);
  if (s.ambClock === w.clock) return s.amb;
  const dt = s.ambClock < 0 ? 0 : w.clock - s.ambClock;
  s.ambClock = w.clock;
  const out: Noise[] = [];
  for (const f of w.fs) {
    const L = s.last.get(f);
    let v = L?.v ?? 0;
    if (L && dt > 0) { const inst = Math.hypot(f.x - L.x, f.y - L.y) / dt; v = v * 0.6 + inst * 0.4; }
    s.last.set(f, { x: f.x, y: f.y, t: w.clock, v });
    const n = fighterNoise(w, f, v);
    if (n) { const z: Noise = { x: f.x, y: f.y, lvl: n.lvl, r: n.r, t: w.clock, f }; out.push(z); (f as any)._noisyT = w.clock; }
  }
  for (const sp of w.spots) {
    if (sp.state === 'vasculhando') out.push({ x: sp.x, y: sp.y, lvl: 0.6, r: 160, t: w.clock });
    else if (sp.state === 'abrindo' && (sp.anim ?? 0) < 1) out.push({ x: sp.x, y: sp.y, lvl: 0.8, r: 200, t: w.clock });
    else if (sp.state === 'trancado' && (sp.anim ?? 0) < 1) out.push({ x: sp.x, y: sp.y, lvl: 1, r: 260, t: w.clock });
  }
  s.amb = out;
  return out;
}

/** Lutador fez barulho nos últimos `mem` segundos? */
export function noisyRecently(w: World, f: Fighter, mem = NOISE_MEM): boolean {
  ambient(w);
  const t = (f as any)._noisyT;
  return t != null && w.clock - t <= mem;
}

/**
 * O ruído mais forte que o zumbi ouve agora (intensidade atenuada pela distância; raio × mul).
 * Retorna null se está tudo em silêncio para ele.
 */
export function hear(w: World, z: Zombie, mul = 1): Noise | null {
  const s = st(w);
  s.list = s.list.filter((n) => w.clock - n.t <= NOISE_MEM);
  let best: Noise | null = null, bs = 0;
  for (const n of [...ambient(w), ...s.list]) {
    const d = Math.hypot(n.x - z.x, (n.y - z.y) * 2), R = n.r * mul;
    if (d > R) continue;
    const age = w.clock - n.t, sc = n.lvl * (1 - d / R) * (1 - age / (NOISE_MEM * 1.5));
    if (sc > bs) { bs = sc; best = n; }
  }
  return best;
}
