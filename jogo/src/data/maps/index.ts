// Registro de mapas. Mapa novo = arquivo novo + entrada em MAPS.
import type { Bag } from '../resources';
import type { ZombieId } from '../zombies';
import { MARCO_ZERO } from './marcoZero';
import { LAPA } from './lapa';
import { OLINDA } from './olinda';
import { PELOURINHO } from './pelourinho';
import { VEROPESO } from './ver-o-peso';
import { AMAZONIA } from './amazonia';
import { PANTANAL } from './pantanal';

export interface MapDef {
  id: string;
  nome: string;
  desc: string;
  /** chave do cenário em ART_EXP (factory com o contrato do MAP) */
  art: string;
  /** id do mapa que precisa ter sido vencido para liberar este (vazio = livre) */
  requer?: string;
  /** nº de áreas (o cenário define as áreas; usado na UI antes de carregar) */
  areas: number;
  nivelRecomendado: number;
  /** id da área → lista de ondas (cada onda = lista de zumbis) */
  ondas: Record<string, ZombieId[][]>;
  arenaPos?: Record<string, number[]>;
  semVasculhar?: string[];
  loot: { porArena: Bag; vitoria: Bag; miniBoss: Bag; projeto: number };
}

export const MAPS: Record<string, MapDef> = {
  [MARCO_ZERO.id]: MARCO_ZERO,
  [OLINDA.id]: OLINDA,
  [PELOURINHO.id]: PELOURINHO,
  [VEROPESO.id]: VEROPESO,
  [LAPA.id]: LAPA,
  [AMAZONIA.id]: AMAZONIA,
  [PANTANAL.id]: PANTANAL,
};

export const DEFAULT_MAP = MARCO_ZERO.id;
