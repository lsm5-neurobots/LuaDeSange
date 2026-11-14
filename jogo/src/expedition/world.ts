// Estado do mundo da expedição + helpers compartilhados por lutadores, IA e render.
// Portado e generalizado do demo "Expedição Marco Zero" (N lutadores, zumbis por dados, mapas por dados).
import type { ArtExp, Factory, AnimDef } from '../art/legacy';
import type { ActorArt } from '../art/sprites';
import type { Bag } from '../data/resources';
import type { MapDef } from '../data/maps';
import type { WeaponFamilyDef } from '../data/weapons';
import type { ZombieDef, ZombieId } from '../data/zombies';
import type { WeaponFamily } from '../data/weapons';
import type { ExpeditionConfig, TeamMember } from './types';

/** Render em alta resolução: a lógica roda em unidades de 384×216 e o canvas tem RS× mais pixels (960×540). */
export const RS = 2.5;
/** Escala de geração dos sprites (px de tela por unidade da arte): personagem comum ≈ 130 px, como na referência. */
export const SK = 1.25;
/** Unidades lógicas por unidade da arte (hitbox, âncoras, alturas). */
export const KS = SK / RS;
export const YMIN = 146, YMAX = 206;
export const LOOP: Record<string, 1> = { idle: 1, walk: 1, guard: 1, advance: 1, run: 1, fly: 1, tumble: 1, grabbed: 1 };

export type Form = 'comum' | 'enluarado' | 'plenilunar' | 'normal' | 'furia';
export const FMUL: Record<Form, { hp: number; dmg: number }> = {
  comum: { hp: 1, dmg: 1 }, enluarado: { hp: 1.3, dmg: 1 }, plenilunar: { hp: 1.6, dmg: 1.5 }, normal: { hp: 1, dmg: 1 }, furia: { hp: 1, dmg: 1 },
};

/** Definição de zumbi já escalada pro mundo. */
export interface ZKind extends ZombieDef { id: ZombieId; F: Factory }

export interface Anim { anim: string; fi: number; acc: number; done: boolean; hold?: boolean }

export interface Zombie extends Anim {
  uid: number;
  kind: ZombieId;
  K: ZKind;
  form: Form;
  x: number; y: number; z: number;
  face: 1 | -1;
  hp: number; maxhp: number; dmgMul: number;
  state: string;
  cd: number; stun: number; poise: number;
  dead: boolean; deadT: number;
  down: { t: number; dir: number } | null;
  /** thrown = arremessado/mandado longe (projétil): by = quem jogou, hit = uids já atingidos, dmg = dano no impacto */
  air: { vz: number; vx: number; spin: number; bounced?: boolean; thrown?: boolean; by?: Fighter; hit?: Set<number>; dmg?: number } | null;
  react: { k: string; t: number; dur: number } | null;
  flash: number;
  boss: boolean;
  fury?: boolean;
  vuln?: boolean;
  /** lutador alvo atual */
  tg: Fighter | null;
  tgT: number;
  [k: string]: any;
}

export interface Fighter extends Anim {
  m: TeamMember;
  /** 'vigia' usa o kit completo do ART_EXP.VIGIA; 'generic' usa ActorArt com aliases */
  rig: 'vigia' | 'generic';
  art: ActorArt | null;
  fam: WeaponFamily;
  w: WeaponFamilyDef;
  tier: string;
  x: number; y: number; z: number;
  face: 1 | -1;
  hp: number; maxhp: number; sp: number;
  state: string;
  down: boolean;
  stunT: number;
  /** an = animação da esquiva · ifr = segundos de invencibilidade (só a esquiva do jogador liga isso) */
  dodge: { dx?: number; dy?: number; t: number; an?: string; ifr?: number } | null;
  checked: any;
  target: Zombie | null;
  cd: number;
  charge: number;
  slot: number;
  [k: string]: any;
}

export interface Proj { kind: 'acid' | 'rock' | 'hook' | 'bullet'; t: number; d: number; x0: number; y0: number; x1: number; y1: number; x: number; y: number; c?: string; dmg: number; owner?: any; hit?: boolean; done?: boolean; ly?: number; vx?: number; range?: number; from?: Fighter }
export interface Warn { kind: 'circle' | 'lane'; x?: number; y: number; r?: number; x0?: number; x1?: number; owner?: Zombie; c?: string }
export interface Spot { t: 'obj' | 'bau'; kind?: string; tipo?: string; x: number; y: number; state: string; done: boolean; anim?: number; tm?: number; closed?: boolean; bonus?: boolean }
export interface Arena { cam: number; area: any; k: number; list: ZombieId[] }
/** Coletável físico no chão (visual: o recurso já entrou na mochila quando ele nasce). */
/** Efeito visual animado (arte FX): impacto, poeira, faíscas, clarão... */
export interface Vfx { kind: string; x: number; y: number; t: number; fps: number; face: 1 | -1; opts?: any; add?: boolean; ground?: boolean }
export interface Pickup { id: string; n: number; x: number; y: number; z: number; vx: number; vz: number; t: number; fi: number; state: 'pop' | 'rest' | 'magnet' }

/** Ator extra no palco (desenhado pelo render junto das entidades, em coordenadas lógicas). */
export interface ExtraActor { x: number; y: number; w0: number; hide?: boolean; draw(c: CanvasRenderingContext2D, cam: number): void }

export type Phase = 'fight' | 'go' | 'walk' | 'approach' | 'search' | 'chest' | 'warning' | 'failed' | 'victory' | 'done';

export interface World {
  cfg: ExpeditionConfig;
  map: MapDef;
  A: ArtExp;
  MAP: any;
  W: number; H: number; BASE: number;
  /** céu/luz do cenário (worldClock.SkyMode): manhã, tarde, anoitecer, noite ou Lua de Sangue */
  mode: 'manha' | 'tarde' | 'anoitecer' | 'noite' | 'lua';
  /** relógio do mundo (hora, fase, clima, janela da lua) — expedition/ambiente.ts */
  amb?: import('../game/worldClock').Ambiente;
  /** camadas de clima (art-src/shared/clima.js) */
  wx?: any; wxMode?: string;
  /** multiplicador do alcance de cuspe pelo clima (chuva/neblina) */
  alcCuspe?: number;
  zk: Partial<Record<ZombieId, ZKind>>;
  cam: number;
  clock: number;
  phase: Phase; phaseT: number;
  hitstop: number; shake: number; fade: number;
  speed: number; paused: boolean; pzOpen: boolean;
  fs: Fighter[];
  zs: Zombie[];
  proj: Proj[]; pools: any[]; warns: Warn[]; rings: any[]; sparks: any[]; beams: any[];
  items: Pickup[];
  vfx: Vfx[];
  spots: Spot[];
  arenas: Arena[];
  ai: number;
  boss: Zombie | null;
  pendingWave: Arena | null;
  /** vasculhar/baú: o lutador vai até o objeto antes de começar (nada de vasculhar de longe) */
  appr?: { sp: Spot; f: Fighter; t: number } | null;
  kills: number;
  killsBy: Partial<Record<ZombieId, number>>;
  /** abates por 'tipo:variação' (bestiário) */
  killsForm?: Record<string, number>;
  /** plano da expedição (plan.ts) */
  planKeys?: Record<string, number>; kits?: number; kitsLevados?: number; kitsUsados?: number; kitCd?: number; kitArena?: number; kitArenaN?: number;
  bag: Bag;
  /** loot da arena atual ainda não solto: sai aos poucos dos corpos (pickups.arenaDrop) */
  arenaLoot?: Bag; arenaKillsLeft?: number; lastKillAt?: { x: number; y: number };
  /** luta em curso é emboscada do vasculhar (não conta como arena) · áreas que já tiveram emboscada */
  emb?: boolean; embAreas?: string[];
  projetos: WeaponFamily[];
  /** armas comuns achadas em baús nesta expedição */
  armasAchadas?: WeaponFamily[];
  keys: Record<string, number>;
  miniBoss: boolean; chefe: boolean;
  cleared: number;
  maxArea: number;
  uid: number;
  /** atores extras desenhados ordenados por y (sobreviventes/pets dos encontros) */
  actors?: ExtraActor[];
  /** põe um membro novo no squad no meio da expedição (recruta resgatado com vaga livre); o engine injeta */
  addFighter?: (m: TeamMember, x: number, y: number) => boolean;
  /** manual: verbo do J se houver interação no alcance; commit dispara (vasculhar, abrir, falar) */
  manualJ?: (f: Fighter, commit: boolean) => string | null;
  // hooks de UI (o engine injeta)
  fx: (kind: string, text: string, wx: number, y: number) => void;
  log: (t: string) => void;
  banner: (t: string, d: number, cls?: string) => void;
  warning: (title: string, sub: string) => void;
  setIA: (t: string) => void;
  /** HUD: avisa que um golpe especial foi usado (quem, nome do golpe, cor) */
  golpeHud?: (quem: string, golpe: string, cor: string) => void;
  openPuzzle: (tipo: string, nome: string, done: (ok: boolean, skip: boolean) => void) => void;
}

// ---------------- helpers ----------------
export const clampY = (y: number) => Math.max(YMIN, Math.min(YMAX, y));
/** onde o lutador para pra vasculhar: colado no objeto, um pouco à frente (y maior) pra ficar desenhado na frente dele */
export function sprTarget(sp: Spot): { x: number; y: number } { return { x: sp.x - (sp.t === 'bau' ? 16 : 10), y: clampY(sp.y + 8) }; }

export const rnd = Math.random;

export function animDefOf(F: Factory | ActorArt['F'], e: Anim): AnimDef | undefined {
  return F.ANIMS[e.anim];
}

export function setAnim(e: Anim, a: string): void {
  if (e.anim !== a) { e.anim = a; e.fi = 0; e.acc = 0; e.done = false; }
}

/** Avança a animação. onFrame é chamado a cada quadro novo (golpes, cuspes...). */
export function stepAnim<E extends Anim>(e: E, A: AnimDef | undefined, dt: number, onFrame?: (e: E, fi: number) => void): void {
  if (!A || e.hold) return;
  e.acc += dt * 1000;
  let d = A.dur(e.fi) || 100;
  while (e.acc >= d) {
    e.acc -= d;
    if (e.fi + 1 >= A.n) {
      if (LOOP[e.anim]) e.fi = 0;
      else { e.done = true; e.acc = 0; break; }
    } else e.fi++;
    d = A.dur(e.fi) || 100;
    onFrame?.(e, e.fi);
  }
}

export function animFrac(e: Anim, A: AnimDef | undefined): number {
  if (!A || e.hold) return 0;
  const d = A.dur(e.fi) || 100;
  return Math.max(0, Math.min(0.999, e.acc / d));
}

export const aliveZ = (w: World) => w.zs.filter((z) => !z.dead);
export const aliveF = (w: World) => w.fs.filter((f) => !f.down);

/** Lutador mais perto do zumbi (reavaliado a cada 0,6 s). */
export function targetOf(w: World, z: Zombie, dt: number): Fighter | null {
  z.tgT -= dt;
  if (!z.tg || z.tg.down || z.tgT <= 0) {
    z.tgT = 0.6;
    let best: Fighter | null = null, bd = 1e9;
    for (const f of aliveF(w)) { const d = Math.abs(f.x - z.x) + 2 * Math.abs(f.y - z.y); if (d < bd) { bd = d; best = f; } }
    z.tg = best;
  }
  return z.tg;
}

/** Dispara um efeito da arte FX no mundo (x/y lógicos; y = ponto do efeito). */
export function spawnFx(w: World, kind: string, x: number, y: number, face: 1 | -1 = 1, opts?: any, fps = 22, add = false): void {
  w.vfx.push({ kind, x, y, t: 0, fps, face, opts, add, ground: ['dust', 'dustRun', 'acidSplash'].includes(kind) });
}

export const curArena = (w: World) => w.arenas[Math.min(w.ai, w.arenas.length - 1)];

/** Segundos desde que o corpo "assentou" (com animação de morte, conta só depois que ela termina). */
export const corpseT = (z: Zombie) => (z.anim === 'death' && !z.done ? 0 : z.deadT - (z.deathEnd ?? 0));
