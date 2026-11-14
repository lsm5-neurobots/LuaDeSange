// Olinda (Centro Histórico): 10 áreas de ladeira em ladeira. Cenário em ART_EXP.OLINDA (mesmo contrato do MAP).
// Ids das áreas (o cenário precisa usar os mesmos): carmo, saofrancisco, misericordia, altodase, amparo,
// quatrocantos, ribeira, saobento, bonfim, bonecos.
import type { MapDef } from './index';

export const OLINDA: MapDef = {
  id: 'olinda',
  nome: 'Olinda',
  desc: 'Centro Histórico de Olinda: da Praça do Carmo até a Casa dos Bonecos, subindo e descendo ladeiras. Mini boss nos Quatro Cantos, chefe na Casa dos Bonecos.',
  art: 'OLINDA',
  areas: 10,
  requer: 'marco_zero',
  nivelRecomendado: 6,
  ondas: {
    carmo: [['errante', 'errante', 'corredor', 'gritador'], ['errante', 'cuspidor', 'corredor', 'errante']],
    saofrancisco: [['barrigudo', 'errante', 'errante', 'rastejante'], ['saltador', 'errante', 'corredor', 'errante']],
    misericordia: [['saltador', 'saltador', 'errante', 'corredor'], ['gritador', 'barrigudo', 'errante', 'cuspidor']],
    altodase: [['corredor', 'corredor', 'saltador', 'frevista', 'errante'], ['barrigudo', 'cuspidor', 'cuspidor', 'errante', 'rastejante']],
    amparo: [['gritador', 'errante', 'frevista', 'saltador', 'corredor'], ['barrigudo', 'barrigudo', 'errante', 'corredor']],
    quatrocantos: [['frevista', 'errante', 'saltador', 'cuspidor', 'gritador'], ['chorona']],
    ribeira: [['barrigudo', 'errante', 'errante', 'corredor', 'saltador'], ['rastejante', 'rastejante', 'cuspidor', 'frevista', 'gritador']],
    saobento: [['saltador', 'saltador', 'corredor', 'errante', 'frevista'], ['barrigudo', 'cuspidor', 'errante', 'errante', 'corredor']],
    bonfim: [['corredor', 'corredor', 'corredor', 'saltador'], ['gritador', 'barrigudo', 'saltador', 'cuspidor', 'frevista']],
    bonecos: [['meianoite']],
  },
  arenaPos: { bonecos: [0.8] },
  semVasculhar: ['bonecos'],
  loot: {
    porArena: { madeira: 2, sucata: 2, pano: 1, comida: 1.1, agua: 1, pecas: 0.6, gasolina: 0.8 },
    vitoria: { madeira: 14, sucata: 10, pecas: 4, fragmento_lunar: 2, gasolina: 1 },
    miniBoss: { pecas: 3, sucata: 6, remedio: 1, fragmento_lunar: 1 },
    projeto: 0.12,
  },
};
