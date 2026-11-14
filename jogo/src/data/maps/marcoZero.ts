// Marco Zero (Recife Antigo): 12 áreas, ondas por área. A arte/cenário vem de ART_EXP.MAP (mesmos ids de área).
import type { MapDef } from './index';

export const MARCO_ZERO: MapDef = {
  id: 'marco_zero',
  nome: 'Marco Zero',
  desc: 'Recife Antigo: da Ponte Maurício de Nassau ao Molhe. 12 áreas, mini boss no Arsenal, chefe no fim do Molhe.',
  art: 'MAP',
  areas: 12,
  nivelRecomendado: 1,
  // 8 tipos: errante, rastejante, corredor, cuspidor; depois do Arsenal chegam o barrigudo e o gritador (prévia de
  // Olinda) · mini boss Brutamonte · chefe O Açougueiro
  ondas: {
    ponte: [['errante', 'errante', 'corredor'], ['errante', 'rastejante', 'corredor', 'errante']],
    alfandega: [['errante', 'errante', 'rastejante', 'cuspidor'], ['errante', 'corredor', 'corredor', 'errante']],
    feira: [['rastejante', 'rastejante', 'errante', 'errante'], ['cuspidor', 'errante', 'errante', 'corredor']],
    bomjesus: [['errante', 'corredor', 'errante', 'cuspidor'], ['rastejante', 'errante', 'errante', 'corredor', 'cuspidor']],
    apolo: [['cuspidor', 'errante', 'errante', 'rastejante'], ['corredor', 'errante', 'errante', 'corredor']],
    moeda: [['corredor', 'corredor', 'errante', 'errante', 'rastejante'], ['cuspidor', 'cuspidor', 'errante', 'errante']],
    arsenal: [['errante', 'errante', 'corredor', 'cuspidor', 'rastejante'], ['brutamonte']],
    riobranco: [['errante', 'errante', 'corredor', 'corredor', 'cuspidor'], ['rastejante', 'barrigudo', 'errante', 'cuspidor', 'errante']],
    marco: [['errante', 'errante', 'gritador', 'corredor', 'rastejante'], ['cuspidor', 'barrigudo', 'errante', 'errante', 'corredor']],
    sertao: [['corredor', 'corredor', 'errante', 'gritador', 'cuspidor'], ['errante', 'corredor', 'barrigudo', 'errante', 'rastejante']],
    travessia: [['corredor', 'corredor', 'corredor']],
    molhe: [['acougueiro']],
  },
  /** posição relativa (0..1) de cada arena dentro da área; padrão [0.5, 1] */
  arenaPos: { travessia: [0.55], molhe: [1] },
  semVasculhar: ['travessia', 'molhe'],
  loot: {
    porArena: { madeira: 1.6, sucata: 1.4, pano: 0.5, comida: 1, agua: 0.9 },
    vitoria: { madeira: 8, sucata: 6, pecas: 2, fragmento_lunar: 1, gasolina: 2 },
    miniBoss: { pecas: 2, sucata: 4 },
    /** chance de achar um projeto (blueprint) em baú */
    projeto: 0.1,
  },
};
