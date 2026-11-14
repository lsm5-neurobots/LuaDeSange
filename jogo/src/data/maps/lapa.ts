// Lapa · Rio de Janeiro (RJ): 11 áreas da Central do Brasil, pela Cinelândia, Lavradio e Escadaria Selarón, ao Circo Voador,
// à Lapa boêmia, a Santa Teresa e ao mirante, até os Arcos da Lapa.
// Cenário em ART_EXP.LAPA (art-src/map/lapa.js, mesmo contrato do MAP). Ids das áreas (o cenário usa os mesmos):
// central, municipal, catedral, lavradio, selaron, circo, boemia, santateresa, guimaraes, mirante, arcos.
import type { MapDef } from './index';
import { ZOMBIES, type ZombieId } from '../zombies';

// Zumbis novos chegam aos poucos (arte/IA de outros agentes): só entram nas ondas os que já têm arte no bestiário.
// Mini boss e chefe caem num substituto do mesmo porte enquanto não existem, para a arena nunca ficar vazia.
const tem = (k: string): boolean => !!(ZOMBIES as Record<string, { art: string | null } | undefined>)[k]?.art;
const z = (k: string, sub?: ZombieId): ZombieId[] => (tem(k) ? [k as ZombieId] : sub ? [sub] : []);
const onda = (...ks: (string | [string, ZombieId])[]): ZombieId[] => ks.flatMap((k) => (Array.isArray(k) ? z(k[0], k[1]) : z(k)));

export const LAPA: MapDef = {
  id: 'lapa',
  nome: 'Lapa',
  desc: 'Rio de Janeiro: da Central do Brasil pela Cinelândia, pelo Lavradio e pela Escadaria Selarón, passando pelo Circo Voador e pela Lapa boêmia, subindo a Santa Teresa até o mirante e voltando aos Arcos. Estreia do Zumbi Malandro, de navalha e ginga. Mini boss A Passista no Circo Voador, chefe O Maquinista do Bonde nos Arcos da Lapa.',
  art: 'LAPA',
  areas: 11,
  requer: 'veropeso',
  nivelRecomendado: 18,
  // 12 tipos: errante, corredor, cuspidor, saltador, Blindado (volta, tropa de choque), Malandro, Grafiteiro, Seresteiro e Garçom (locais)
  // · mini boss O Vendedor de Fitas (2ª arena da boemia) + A Passista (circo) · chefe O Maquinista do Bonde. Rastejante e Estalador ficam de fora (asfalto e calçada).
  ondas: {
    central: [onda('errante', 'errante', 'corredor', 'cuspidor', 'errante'), onda('corredor', 'errante', 'blindado', 'errante')],
    municipal: [onda('errante', 'malandro', 'corredor', 'cuspidor', 'garcom'), onda('blindado', 'errante', 'corredor', 'saltador', 'errante')],
    catedral: [onda('blindado', 'errante', 'malandro', 'corredor', 'blindado'), onda('saltador', 'cuspidor', 'blindado', 'corredor', 'malandro', 'errante')],
    lavradio: [onda('malandro', 'grafiteiro', 'malandro', 'cuspidor', 'corredor'), onda('saltador', 'malandro', 'blindado', 'garcom', 'malandro', 'corredor')],
    selaron: [onda('malandro', 'saltador', 'saltador', 'grafiteiro', 'cuspidor', 'malandro'), onda('blindado', 'malandro', 'corredor', 'blindado', 'saltador', 'errante')],
    circo: [onda('malandro', 'corredor', 'blindado', 'seresteiro', 'malandro', 'saltador'), onda(['passista', 'vendedorfitas'])],
    boemia: [onda('malandro', 'malandro', 'blindado', 'garcom', 'cuspidor', 'seresteiro'), onda(['vendedorfitas', 'chorona'], 'malandro', 'malandro')],
    santateresa: [onda('blindado', 'malandro', 'saltador', 'corredor', 'corredor', 'cuspidor', 'seresteiro'), onda('blindado', 'blindado', 'malandro', 'blindado', 'saltador', 'malandro')],
    guimaraes: [onda('malandro', 'blindado', 'malandro', 'saltador', 'cuspidor', 'corredor', 'garcom'), onda('blindado', 'malandro', 'saltador', 'corredor', 'cuspidor', 'malandro', 'grafiteiro')],
    mirante: [onda('blindado', 'malandro', 'malandro', 'saltador', 'blindado', 'grafiteiro', 'corredor', 'seresteiro'), onda('blindado', 'blindado', 'malandro', 'saltador', 'blindado', 'corredor', 'malandro')],
    arcos: [onda(['maquinista', 'ascensorista'])],
  },
  arenaPos: { circo: [0.5, 0.85], arcos: [0.8] },
  semVasculhar: ['arcos'],
  // Biscoito de polvilho e mate gelado da Lapa: ainda sem recurso próprio, entram como comida extra.
  loot: {
    porArena: { madeira: 2.6, sucata: 2.4, pano: 1.1, comida: 2, agua: 1.1, pecas: 0.9, gasolina: 0.9 },
    vitoria: { madeira: 26, sucata: 16, pecas: 10, fragmento_lunar: 5, gasolina: 3, comida: 4 },
    miniBoss: { pecas: 6, sucata: 12, remedio: 2, comida: 2, fragmento_lunar: 1 },
    projeto: 0.18,
  },
};
