// Ver-o-Peso · Belém (PA): 11 áreas da Praça do Relógio, pela feira e pelo Mercado de Ferro, às docas e ao porto.
// Cenário em ART_EXP.VEROPESO (art-src/map/ver-o-peso.js, mesmo contrato do MAP). Ids das áreas (o cenário usa os
// mesmos): relogio, acai, ervas, ferro, doca, barcos, presepio, docas, armazem, porto, cais. Doc: mecanicas2.html, MAP-22 a MAP-27.
import type { MapDef } from './index';
import { ZOMBIES, type ZombieId } from '../zombies';

// Zumbis novos chegam aos poucos (arte/IA de outros agentes): só entram nas ondas os que já têm arte no bestiário.
// Mini boss e chefe caem num substituto do mesmo porte enquanto não existem, para a arena nunca ficar vazia.
const tem = (k: string): boolean => !!(ZOMBIES as Record<string, { art: string | null } | undefined>)[k]?.art;
const z = (k: string, sub?: ZombieId): ZombieId[] => (tem(k) ? [k as ZombieId] : sub ? [sub] : []);
const onda = (...ks: (string | [string, ZombieId])[]): ZombieId[] => ks.flatMap((k) => (Array.isArray(k) ? z(k[0], k[1]) : z(k)));

export const VEROPESO: MapDef = {
  id: 'veropeso',
  nome: 'Ver-o-Peso',
  desc: 'Belém: da Praça do Relógio, pela feira do açaí e pelo Mercado de Ferro, às docas, à Estação das Docas e ao porto dos guindastes. Estreia do Blindado; o Zumbi Barqueiro guarda as docas e os barcos. Mini boss na Feira das Ervas, chefe no cais do guindaste.',
  art: 'VEROPESO',
  areas: 11,
  requer: 'pelourinho',
  nivelRecomendado: 14,
  // 12 tipos: errante, rastejante (lodo das docas), corredor, cuspidor, saltador, Barqueiro, Peixeiro e Açaizeiro (locais), Blindado
  // (estreia) · mini boss A Erveira · chefe O Estivador. Gritador e Estalador ficam nos mapas anteriores.
  ondas: {
    relogio: [onda('errante', 'errante', 'corredor', 'errante'), onda('errante', 'rastejante', 'corredor', 'cuspidor', 'errante')],
    acai: [onda('acaizeiro', 'rastejante', 'cuspidor', 'errante', 'corredor'), onda('corredor', 'errante', 'saltador', 'acaizeiro', 'barqueiro')],
    ervas: [onda('peixeiro', 'cuspidor', 'rastejante', 'errante', 'saltador'), onda(['erveira', 'chorona'])],
    ferro: [onda('peixeiro', 'corredor', 'corredor', 'cuspidor', 'acaizeiro', 'cuspidor'), onda('saltador', 'saltador', 'errante', 'rastejante', 'rastejante', 'corredor')],
    doca: [onda('corredor', 'peixeiro', 'barqueiro', 'cuspidor', 'barqueiro', 'corredor'), onda('cuspidor', 'rastejante', 'barqueiro', 'saltador', 'corredor', 'errante')],
    barcos: [onda('saltador', 'barqueiro', 'saltador', 'rastejante', 'corredor', 'peixeiro'), onda('corredor', 'corredor', 'cuspidor', 'barqueiro', 'rastejante', 'barqueiro')],
    presepio: [onda('saltador', 'acaizeiro', 'corredor', 'cuspidor', 'corredor', 'barqueiro'), onda('corredor', 'errante', 'errante', 'rastejante', 'blindado', 'saltador')],
    docas: [onda('blindado', 'peixeiro', 'barqueiro', 'corredor', 'cuspidor'), onda('blindado', 'saltador', 'cuspidor', 'errante', 'saltador', 'corredor')],
    armazem: [onda('blindado', 'blindado', 'acaizeiro', 'cuspidor', 'corredor', 'barqueiro'), onda('blindado', 'saltador', 'corredor', 'blindado', 'errante', 'saltador', 'corredor')],
    porto: [onda('blindado', 'corredor', 'corredor', 'rastejante', 'peixeiro', 'cuspidor', 'errante'), onda('blindado', 'blindado', 'saltador', 'corredor', 'rastejante', 'cuspidor', 'errante')],
    cais: [onda(['estivador', 'acougueiro'])],
  },
  arenaPos: { ervas: [0.5, 0.85], cais: [0.8] },
  semVasculhar: ['cais'],
  // MAP-25 pede açaí (cura); enquanto não há recurso próprio, entra como comida extra.
  loot: {
    porArena: { madeira: 2.4, sucata: 2.2, pano: 1, comida: 1.8, agua: 1, pecas: 0.8, gasolina: 0.8 },
    vitoria: { madeira: 22, sucata: 14, pecas: 8, fragmento_lunar: 4, gasolina: 3, comida: 3 },
    miniBoss: { pecas: 5, sucata: 10, remedio: 2, comida: 1, fragmento_lunar: 1 },
    projeto: 0.16,
  },
};
