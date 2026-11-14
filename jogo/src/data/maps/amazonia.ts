// Floresta Amazônica · Manaus (AM) → floresta: 12 áreas do porto flutuante de Manaus, pelo Mercado Adolpho Lisboa, pelo Teatro Amazonas
// e pelo Encontro das Águas, entrando pela comunidade ribeirinha, pelo igarapé e pela terra firme até a samaúma gigante, o seringal,
// o garimpo, o igapó e a várzea da Cobra-Grande.
// Cenário em ART_EXP.AMAZONIA (art-src/map/amazonia.js, mesmo contrato do MAP). Ids das áreas (o cenário usa os mesmos):
// porto, adolpho, teatro, encontro, ribeirinha, igarape, terrafirme, samauma, seringal, garimpo, igapo, varzea.
import type { MapDef } from './index';
import { ZOMBIES, type ZombieId } from '../zombies';

// Zumbis novos chegam aos poucos (arte/IA de outros agentes): só entram nas ondas os que já têm arte no bestiário.
// Mini boss e chefe caem num substituto do mesmo porte enquanto não existem, para a arena nunca ficar vazia.
const tem = (k: string): boolean => !!(ZOMBIES as Record<string, { art: string | null } | undefined>)[k]?.art;
const z = (k: string, sub?: ZombieId): ZombieId[] => (tem(k) ? [k as ZombieId] : sub ? [sub] : []);
const onda = (...ks: (string | [string, ZombieId])[]): ZombieId[] => ks.flatMap((k) => (Array.isArray(k) ? z(k[0], k[1]) : z(k)));

export const AMAZONIA: MapDef = {
  id: 'amazonia',
  nome: 'Floresta Amazônica',
  desc: 'Manaus e a floresta: do porto flutuante pelo Mercado Adolpho Lisboa, pelo Teatro Amazonas e pelo Encontro das Águas, entrando pela comunidade ribeirinha, pelo igarapé e pela mata de terra firme até a samaúma gigante, o seringal abandonado, o garimpo, o igapó e a várzea. Estreia do Seringueiro, do Garimpeiro, do Bugio e do Cardume de Piranhas. Mini boss A Onça-Pintada na samaúma, chefe A Cobra-Grande na várzea.',
  art: 'AMAZONIA',
  areas: 12,
  requer: 'lapa',
  nivelRecomendado: 22,
  // 12 tipos: novos seringueiro, garimpeiro, bugio, piranha · mini boss A Onça-Pintada · chefe A Cobra-Grande
  // + reaproveitados errante, corredor, cuspidor, rastejante, saltador, barqueiro.
  // MAP-38: piranha só em área com água (encontro, ribeirinha, igarape, igapo, varzea); bugio em área de mata; garimpeiro/seringueiro em dupla no garimpo.
  ondas: {
    porto: [onda('errante', 'errante', 'corredor', 'rastejante', 'errante'), onda('barqueiro', 'errante', 'corredor', 'cuspidor', 'barqueiro')],
    adolpho: [onda('errante', 'seringueiro', 'corredor', 'cuspidor', 'errante'), onda('seringueiro', 'errante', 'cuspidor', 'corredor', 'saltador')],
    teatro: [onda('errante', 'corredor', 'saltador', 'cuspidor', 'errante'), onda('seringueiro', 'corredor', 'garimpeiro', 'errante', 'saltador', 'cuspidor')],
    encontro: [onda('barqueiro', 'errante', 'barqueiro', 'corredor', 'cuspidor'), onda('barqueiro', 'saltador', 'piranha', 'barqueiro', 'corredor', 'cuspidor')],
    ribeirinha: [onda('errante', 'corredor', 'rastejante', 'cuspidor', 'errante'), onda('barqueiro', 'seringueiro', 'piranha', 'corredor', 'saltador', 'cuspidor')],
    igarape: [onda('rastejante', 'errante', 'piranha', 'corredor', 'errante'), onda('piranha', 'piranha', 'seringueiro', 'saltador', 'cuspidor', 'errante')],
    terrafirme: [onda('bugio', 'bugio', 'errante', 'corredor', 'cuspidor'), onda('bugio', 'bugio', 'seringueiro', 'saltador', 'rastejante', 'errante')],
    samauma: [onda('bugio', 'seringueiro', 'corredor', 'saltador', 'errante'), onda(['onca', 'passista'], 'bugio', 'bugio')],
    seringal: [onda('seringueiro', 'seringueiro', 'errante', 'corredor', 'cuspidor'), onda('seringueiro', 'seringueiro', 'saltador', 'bugio', 'rastejante', 'errante')],
    garimpo: [onda('garimpeiro', 'garimpeiro', 'errante', 'corredor', 'cuspidor'), onda('garimpeiro', 'garimpeiro', 'seringueiro', 'saltador', 'rastejante', 'cuspidor')],
    igapo: [onda('piranha', 'piranha', 'barqueiro', 'errante', 'saltador'), onda('piranha', 'piranha', 'seringueiro', 'garimpeiro', 'bugio', 'cuspidor', 'rastejante')],
    varzea: [onda(['cobragrande', 'maquinista'])],
  },
  arenaPos: { samauma: [0.5, 0.85], varzea: [0.8] },
  semVasculhar: ['varzea'],
  // Castanha-do-pará, açaí e látex ainda sem recurso próprio: entram como comida/pano/sucata extra (como o biscoito da Lapa).
  loot: {
    porArena: { madeira: 2.4, sucata: 2.2, pano: 1.4, comida: 2.8, agua: 1.4, pecas: 1.0, gasolina: 0.9 },
    vitoria: { madeira: 28, sucata: 20, pecas: 12, fragmento_lunar: 6, gasolina: 3, comida: 10, pano: 6 },
    miniBoss: { pecas: 7, sucata: 14, remedio: 3, comida: 3, fragmento_lunar: 1, pano: 3 },
    projeto: 0.2,
  },
};
