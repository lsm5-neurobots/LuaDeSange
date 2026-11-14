// Contrato entre o abrigo e o motor da expedição.
import type { Bag } from '../data/resources';
import type { WeaponFamily } from '../data/weapons';
import type { GolpeId } from '../data/golpes';
import type { ZombieId } from '../data/zombies';
import type { HeroCfg, WeaponItem } from '../game/state';
import type { RecruitType, PetType } from '../data/recruits';
import type { Grade } from '../data/grades';
import type { EncounterPlan, EncounterOutcome } from '../game/encounters';

export interface TeamMember {
  /** 'hero' ou id do recruta */
  id: string;
  kind: 'hero' | 'rec';
  nome: string;
  lv: number;
  arma: WeaponItem;
  hero?: HeroCfg;
  recTipo?: RecruitType;
  skin?: string;
  /** nota do recruta (E..S): multiplica vida e dano */
  nota?: Grade;
  /** golpes especiais equipados no abrigo (usados sozinhos pelo auto-combate) */
  golpes?: { id: GolpeId; nv: number }[];
}

export interface ExpeditionConfig {
  mapId: string;
  team: TeamMember[];
  pet?: { tipo: PetType; variante: string; nome: string; nota?: Grade } | null;
  /** sobreviventes/pets que aparecem no mapa pedindo missão (game/encounters) */
  encontros?: EncounterPlan[];
  /** ondas desta expedição já com o sorteio de raridade (game/presenca); ausente = ondas do mapa */
  ondas?: Record<string, ZombieId[][]>;
  /** tipos do mapa que não vieram nesta expedição */
  ausentes?: ZombieId[];
  /** noite de Lua de Sangue: zumbis enluarados, céu vermelho, mais loot */
  lua: boolean;
  dia: number;
  /** multiplicadores vindos do abrigo (bancada, pets...) */
  bonus: { vida: number; dano: number; esquiva: number; loot: number; cura: number; chaves: number };
  /** plano escolhido antes de partir (recrutar, chaves, kits...) */
  plano?: import('./plan').ExpeditionPlan;
  /** debug/teste: índice da arena inicial */
  inicio?: number;
  /** 1ª expedição do save (onboarding): zumbis mais fracos (PRIMEIRA_FACIL) e, se cair, volta com todo o loot */
  primeira?: boolean;
  /** o jogador controla o líder no teclado. Ausente ou false: o squad luta sozinho (padrão, e o loop offline). */
  manual?: boolean;
}

export interface ExpeditionResult {
  mapId: string;
  sucesso: boolean;
  /** maior área alcançada (1..N) */
  areaAlcancada: number;
  totalAreas: number;
  arenasLimpas: number;
  totalArenas: number;
  abates: number;
  abatesPorTipo: Partial<Record<ZombieId, number>>;
  /** abates por 'tipo:variação' */
  abatesPorForma?: Record<string, number>;
  /** itens do plano que sobraram (voltam pro inventário) */
  itensSobra?: Partial<Record<import('../data/market').ItemMk, number>>;
  /** kits de cura usados */
  kitsUsados?: number;
  loot: Bag;
  projetos: WeaponFamily[];
  /** armas achadas na expedição (sempre raridade comum) */
  armas?: WeaponFamily[];
  miniBoss: boolean;
  chefe: boolean;
  lua: boolean;
  /** era a 1ª expedição do save (onboarding) */
  primeira?: boolean;
  /** o squad recuou a tempo (manual ou pelo plano): falha, mas guarda o loot; cair = perde tudo */
  recuou?: boolean;
  duracao: number;
  teamIds: string[];
  /** encontros do mapa: missão cumprida ou não */
  encontros?: EncounterOutcome[];
}
