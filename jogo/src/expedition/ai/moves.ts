// Repertório de ataques dos zumbis: cada IA declara uma lista de golpes (anim da arte + regras) e
// pickMove escolhe por distância, peso e recarga, sem repetir o mesmo golpe 3× seguidas.
// O quadro do dano (`hit`), o alcance (`reach`) e o aviso (`warn`) vêm da própria animação (art-src/zombies/*.js).
import type { ZCtx } from './index';
import { hurtF, stunF } from '../fighter';
import { clampY, rnd, setAnim, type Fighter, type World, type Zombie } from '../world';

export interface ZMove {
  /** nome da animação na factory do zumbi */
  anim: string;
  /** peso na escolha aleatória */
  w: number;
  /** janela de distância horizontal até o alvo (px) */
  min?: number; max: number;
  /** tolerância vertical (faixa) */
  dy?: number;
  /** recarga própria do golpe (s) */
  cd: number;
  /** multiplicador do dano base do zumbi */
  dmg?: number;
  /** dano fixo somado (pra zumbis sem dano base, ex.: gritador) */
  flat?: number;
  word?: string;
  /** empurra (+) ou puxa (−) o lutador no acerto, em px */
  push?: number;
  stun?: number; stunTag?: string;
  /** acerta todos os lutadores no alcance (cone/área) em vez de só o alvo */
  area?: boolean;
  /** área em volta do próprio zumbi (pisão), raio em px */
  around?: number;
  /** aviso no chão enquanto prepara: faixa na frente ou círculo */
  warn?: 'lane' | 'circle';
  /** deslocamento pra frente (px/s) por quadro */
  lunge?: number[];
  /** tremida de tela no acerto */
  shake?: number;
}

type Mem = { mcd: Record<string, number>; mhist: string[] };
const mem = (z: Zombie): Mem => (z._mv ??= { mcd: {}, mhist: [] }) as Mem;

/** Desconta as recargas por golpe (chamar 1× por update). */
export function tickMoves(z: Zombie, dt: number): void {
  const m = mem(z);
  for (const k in m.mcd) m.mcd[k] = Math.max(0, m.mcd[k] - dt);
}

/** Escolhe um golpe válido pra situação atual (ou null). */
export function pickMove(c: ZCtx, moves: ZMove[]): ZMove | null {
  const { z } = c, A = z.K.F.ANIMS, m = mem(z);
  const h = m.mhist, rep = h.length >= 2 && h[h.length - 1] === h[h.length - 2] ? h[h.length - 1] : null;
  const ok = moves.filter((mv) => A[mv.anim] && (m.mcd[mv.anim] ?? 0) <= 0 && c.adx >= (mv.min ?? 0) && c.adx <= mv.max
    && Math.abs(c.dy) <= (mv.dy ?? 9) && mv.anim !== rep);
  if (!ok.length) return null;
  let r = rnd() * ok.reduce((s, mv) => s + mv.w, 0);
  for (const mv of ok) { r -= mv.w; if (r <= 0) return mv; }
  return ok[ok.length - 1];
}

/** Entra no golpe: estado 'attack', anima, recarga, histórico e aviso no chão. */
export function startMove(c: ZCtx, mv: ZMove): void {
  const { z, w } = c, m = mem(z), A = z.K.F.ANIMS[mv.anim];
  z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
  z.state = 'attack'; z.move = mv.anim; z.hit = false; z.hitV = false;
  setAnim(z, mv.anim);
  m.mcd[mv.anim] = mv.cd;
  m.mhist.push(mv.anim); if (m.mhist.length > 4) m.mhist.shift();
  const reach = A?.reach ?? 32;
  if (mv.warn === 'lane') w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * (reach + 10), y: z.y, owner: z } as any);
  if (mv.warn === 'circle') w.warns.push({ kind: 'circle', x: z.x + z.face * 8, y: z.y, r: mv.around ?? reach, owner: z } as any);
}

/** Movimento durante o golpe (avanço por quadro). */
export function moveStep(c: ZCtx, moves: ZMove[]): void {
  const { z, dt, w } = c, mv = moves.find((m) => m.anim === z.anim);
  if (!mv?.lunge) return;
  z.x += z.face * (mv.lunge[z.fi] || 0) * dt;
  z.x = Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x));
}

/** Limpa os avisos do zumbi (fim do golpe). */
export function endMove(w: World, z: Zombie): void {
  w.warns = w.warns.filter((t) => t.owner !== z);
  if (!z.air && z.state !== 'grabbed') z.z = 0; // golpes com pulo (peixinho, mortal) voltam pro chão
  z.move = null;
}

const hitFrames = (h: unknown): number[] => (Array.isArray(h) ? h : h != null ? [h as number] : []);

/** Evento de quadro: aplica o dano do golpe atual no quadro `hit` da animação. Retorna true se acertou alguém. */
export function moveFrame(c: ZCtx, fi: number, moves: ZMove[]): boolean {
  const { z, V, w } = c, mv = moves.find((m) => m.anim === z.anim);
  if (!mv) return false;
  const A = z.K.F.ANIMS[z.anim], hf = hitFrames(A.hit ?? A.hitAt ?? (z.anim === 'attack' ? 4 : null));
  if (!hf.includes(fi)) return false;
  const reach = A.reach ?? 32, dyT = (mv.dy ?? 9) + 4;
  const inReach = (f: Fighter) => {
    if (f.down) return false;
    if (mv.around) return Math.hypot(f.x - z.x, (f.y - z.y) * 2) < mv.around;
    const d = (f.x - z.x) * z.face;
    return d > -8 && d < reach && Math.abs(f.y - z.y) < dyT;
  };
  const tg = mv.area || mv.around ? w.fs.filter(inReach) : inReach(V) ? [V] : [];
  if (!tg.length) return false;
  const multi = hf.length;
  for (const f of tg) {
    hurtF(w, f, (z.K.dmg * (mv.dmg ?? 1) + (mv.flat ?? 0)) * z.dmgMul / (multi > 1 ? multi * 0.7 : 1), { push: mv.push, heavy: (mv.shake ?? 0) >= 0.1 || (mv.dmg ?? 1) >= 1.4 });
    if (mv.push) f.x += z.face * mv.push;
    if (mv.stun && !f.down) stunF(w, f, mv.stun, mv.stunTag ?? 'TONTO');
    f.y = clampY(f.y);
  }
  if (mv.word) w.fx('burst', mv.word, (tg[0].x + z.x) / 2, tg[0].y - 60);
  if (mv.shake) w.shake = Math.max(w.shake, mv.shake);
  z.hit = true;
  return true;
}
