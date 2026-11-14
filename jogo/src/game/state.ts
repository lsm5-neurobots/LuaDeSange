// Estado do jogo: tipo, criação, store único com save versionado.
import { emit } from '../core/events';
import { api } from '../services/api';
import type { ResId } from '../data/resources';
import type { StructId } from '../data/structures';
import type { RecruitType, PetType } from '../data/recruits';
import type { Grade } from '../data/grades';
import type { WeaponFamily, Tier } from '../data/weapons';
import type { GolpeId } from '../data/golpes';
import type { AttackReport } from './bloodmoon';

export const SAVE_VERSION = 1;

/** Opções visuais do HEROI (corpo, pele, cabelo...). */
export type HeroCfg = { nome: string } & Record<string, string>;

/** `nota` E..S (data/grades): multiplica vida/dano do recruta e o bônus do pet. Ausente (save antigo) = C. */
export interface Recruit { id: string; tipo: RecruitType; skin: string; nome: string; lv: number; xp: number; nota?: Grade }
export interface Pet { id: string; tipo: PetType; variante: string; nome: string; nota?: Grade }
/** `nv` = força da arma (1..5), evoluída na Oficina. Ausente = 1. */
export interface WeaponItem { id: string; familia: WeaponFamily; tier: Tier; nv?: number }
/** Golpes especiais de um membro: nível de cada golpe liberado + os equipados (ordem dos slots). */
export interface MemberGolpes { nv: Partial<Record<GolpeId, number>>; eq: GolpeId[] }
export interface StructState { nv: number; hp: number; danificada: boolean }
export interface LogEntry { t: number; html: string }

export interface GameState {
  v: number;
  criadoEm: number;
  hero: HeroCfg | null;
  heroLv: number;
  heroXp: number;
  /** recrutas com cama (lutam, dão bônus, comem) */
  recs: Recruit[];
  /** CAM-2: Alojamento de espera: recrutas sem cama aguardando fusão (não ocupam cama, não comem, não lutam, sem bônus) */
  alojamento: Recruit[];
  pets: Pet[];
  res: Record<ResId, number>;
  /** famílias de arma cujo projeto (blueprint) já foi achado */
  projetos: WeaponFamily[];
  /** projetos de melhoria guardados por família (gastos na Oficina pra subir a raridade) */
  projetosQtd: Partial<Record<WeaponFamily, number>>;
  /** golpes especiais por membro ('hero' ou id do recruta) */
  golpes: Record<string, MemberGolpes>;
  armas: WeaponItem[];
  /** id do membro ('hero' ou id do recruta) → id da arma */
  equip: Record<string, string>;
  estruturas: Partial<Record<StructId, StructState>>;
  /** produção acumulada esperando coleta */
  prodBuf: Partial<Record<StructId, number>>;
  obra: { id: StructId; nv: number; fim: number } | null;
  /** dias seguidos sem comida / sem água suficiente */
  fomeDias: number;
  sedeDias: number;
  /** fração de consumo ainda não descontada do estoque */
  upkeepBuf: { agua: number; comida: number };
  /** dias passados (1 expedição = 1 dia) */
  dia: number;
  expedicoes: number;
  vitorias: number;
  /** ids dos mapas já vencidos (libera os próximos) */
  vencidos: string[];
  /** abates por tipo de zumbi (acumulado): mostra o bestiário de cada mapa */
  derrotados: Record<string, number>;
  /** itens de expedição comprados no mercado (chaves, kits, presentes...) */
  itens: Partial<Record<import('../data/market').ItemMk, number>>;
  /** abates por tipo+variação ('errante:enluarado'): cartas do bestiário */
  derrotadosForma: Record<string, number>;
  /** último mapa escolhido na expedição */
  ultimoMapa?: string;
  /** membro 2 sugerido no squad (recruta que entrou no caminho ou o último escolhido) */
  squadPadrao?: string;
  /** maior área alcançada (1..12) */
  melhorArea: number;
  log: LogEntry[];
  ultimaVisita: number;
  ultimoAtaque: AttackReport | null;
  /** início (ms UTC) da última janela de Lua de Sangue já resolvida contra o abrigo (1 ataque por janela) */
  luaAtacada?: number;
  /** missões de sobreviventes/pets encontrados no mapa: cumpridas e falhadas */
  missoes: { ok: number; falhou: number };
  /** modo LOOP: repete a mesma expedição sozinho (e offline, até 8 h). Ver game/idleLoop.ts */
  loop: import('./idleLoop').LoopState | null;
  /** conquistas: 'feita' (bateu a meta, prêmio a resgatar) ou 'resgatada' */
  conquistas: Record<string, 'feita' | 'resgatada'>;
  /** lembranças dos mapas guardadas: id → dia em que achou */
  lembrancas: Record<string, number>;
  /** contadores por mapa (vitórias) */
  statsMapa: Record<string, { vit: number }>;
  /** contadores gerais pras conquistas */
  stats: { luasSeguradas: number };
}

export function newGame(now = Date.now()): GameState {
  return {
    v: SAVE_VERSION,
    criadoEm: now,
    hero: null,
    heroLv: 1,
    heroXp: 0,
    recs: [],
    alojamento: [],
    pets: [],
    res: { madeira: 12, sucata: 8, pano: 4, agua: 4, comida: 6, remedio: 1, pecas: 0, gasolina: 0, fragmento_lunar: 0 },
    projetos: [],
    projetosQtd: {},
    golpes: {},
    armas: [{ id: 'w-inicial', familia: 'bastao', tier: 'comum' }],
    equip: { hero: 'w-inicial' },
    estruturas: { fogueira: { nv: 1, hp: 0, danificada: false }, barraca: { nv: 1, hp: 0, danificada: false } },
    prodBuf: {},
    obra: null,
    fomeDias: 0,
    sedeDias: 0,
    upkeepBuf: { agua: 0, comida: 0 },
    dia: 0,
    expedicoes: 0,
    vitorias: 0,
    vencidos: [],
    derrotados: {},
    itens: {},
    derrotadosForma: {},
    melhorArea: 0,
    log: [],
    ultimaVisita: now,
    ultimoAtaque: null,
    missoes: { ok: 0, falhou: 0 },
    loop: null,
    conquistas: {},
    lembrancas: {},
    statsMapa: {},
    stats: { luasSeguradas: 0 },
  };
}

/** Migrações por versão. Adicione um case ao mudar o formato do save. */
export function migrate(raw: any): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const base = newGame(raw.criadoEm ?? Date.now());
  const s = { ...base, ...raw, res: { ...base.res, ...(raw.res ?? {}) } } as GameState;
  s.v = SAVE_VERSION;
  // notas E..S: recrutas e pets de saves antigos sem nota viram C; quem já tinha nota mantém
  s.recs = (s.recs ?? []).map((r) => (r.nota ? r : { ...r, nota: 'C' }));
  s.alojamento = (s.alojamento ?? []).map((r) => (r.nota ? r : { ...r, nota: 'C' }));
  s.pets = (s.pets ?? []).map((p) => (p.nota ? p : { ...p, nota: 'C' }));
  s.missoes = s.missoes ?? { ok: 0, falhou: 0 };
  s.conquistas = s.conquistas ?? {};
  s.lembrancas = s.lembrancas ?? {};
  s.stats = { ...base.stats, ...(s.stats ?? {}) };
  // save antigo sem contador por mapa: cada mapa vencido conta 1 vitória
  if (!raw.statsMapa) s.statsMapa = Object.fromEntries((s.vencidos ?? []).map((id) => [id, { vit: 1 }]));
  return s;
}

// ---------------- store ----------------
let state: GameState | null = null;

export const G = (): GameState => {
  if (!state) throw new Error('jogo não carregado');
  return state;
};
export const hasGame = () => !!state?.hero;

export async function loadGame(): Promise<GameState | null> {
  state = migrate(await api.loadSave());
  return state;
}

export function startNewGame(): GameState {
  state = newGame();
  return state;
}

export function save(): void {
  if (!state) return;
  state.ultimaVisita = Date.now();
  void api.writeSave(state);
}

/** Aplica uma mudança, salva e avisa as telas. */
export function mutate(fn: (s: GameState) => void): void {
  fn(G());
  save();
  emit('state:changed');
}

export async function resetGame(): Promise<void> {
  await api.clearSave();
  state = null;
}

export function addLog(s: GameState, html: string): void {
  s.log.unshift({ t: Date.now(), html });
  s.log = s.log.slice(0, 60);
}
