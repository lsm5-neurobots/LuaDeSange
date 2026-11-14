// Pelourinho · Salvador (BA): 11 áreas da Cidade Baixa (Farol da Barra) à Cidade Alta (topo do Elevador Lacerda).
// Cenário em ART_EXP.PELOURINHO (mesmo contrato do MAP). Ids das áreas (o cenário usa os mesmos): farol, comercio,
// modelo, plano, ladeiras, largo, rosario, casaroes, terreiro, tome, elevador. Doc: mecanicas2.html, MAP-16 a MAP-21.
import type { MapDef } from './index';
import { ZOMBIES, type ZombieId } from '../zombies';

// Zumbis novos entram aos poucos (arte/IA de outros agentes): só vão para as ondas os que já estão no bestiário com
// arte. Mini boss e chefe caem num substituto do mesmo porte enquanto não existem, para a arena nunca ficar vazia.
const tem = (k: string): boolean => !!(ZOMBIES as Record<string, { art: string | null } | undefined>)[k]?.art;
const z = (k: string, sub?: ZombieId): ZombieId[] => (tem(k) ? [k as ZombieId] : sub ? [sub] : []);
const onda = (...ks: (string | [string, ZombieId])[]): ZombieId[] => ks.flatMap((k) => (Array.isArray(k) ? z(k[0], k[1]) : z(k)));

export const PELOURINHO: MapDef = {
  id: 'pelourinho',
  nome: 'Pelourinho',
  desc: 'Salvador: do Farol da Barra ao topo do Elevador Lacerda, subindo da Cidade Baixa pelo Plano Inclinado até o Largo do Pelourinho. Estreia do Estalador; o Zumbi Percussionista bate o ritmo a partir do Largo. Mini boss no Terreiro de Jesus, chefe no Elevador.',
  art: 'PELOURINHO',
  areas: 11,
  requer: 'olinda',
  nivelRecomendado: 11,
  // 12 tipos: errante, corredor, cuspidor, gritador, barrigudo, saltador, Estalador (estreia), Percussionista, Baiana e Turista (locais)
  // · mini boss O Vendedor de Fitas · chefe O Ascensorista. Rastejante fica de fora (calçada de pedra, não tem onde se esconder).
  ondas: {
    farol: [onda('errante', 'errante', 'corredor', 'turista'), onda('errante', 'corredor', 'corredor', 'errante')],
    comercio: [onda('errante', 'baiana', 'corredor', 'cuspidor'), onda('errante', 'corredor', 'corredor', 'errante', 'gritador')],
    modelo: [onda('errante', 'corredor', 'cuspidor', 'turista', 'barrigudo'), onda('gritador', 'errante', 'corredor', 'corredor', 'errante')],
    plano: [onda('baiana', 'estalador', 'corredor', 'errante', 'saltador'), onda('saltador', 'errante', 'estalador', 'cuspidor', 'barrigudo')],
    ladeiras: [onda('corredor', 'corredor', 'turista', 'estalador', 'errante'), onda('saltador', 'gritador', 'errante', 'estalador', 'errante', 'cuspidor')],
    largo: [onda('baiana', 'percussionista', 'corredor', 'corredor', 'estalador', 'errante'), onda('barrigudo', 'errante', 'estalador', 'corredor', 'cuspidor', 'saltador')],
    rosario: [onda('estalador', 'turista', 'cuspidor', 'errante', 'corredor'), onda('barrigudo', 'corredor', 'percussionista', 'estalador', 'corredor', 'gritador')],
    casaroes: [onda('saltador', 'saltador', 'baiana', 'estalador', 'corredor', 'percussionista'), onda('barrigudo', 'gritador', 'errante', 'cuspidor', 'estalador', 'estalador')],
    terreiro: [onda('baiana', 'estalador', 'corredor', 'percussionista', 'saltador'), onda(['vendedorfitas', 'chorona'])],
    tome: [onda('turista', 'corredor', 'estalador', 'estalador', 'percussionista', 'saltador'), onda('gritador', 'saltador', 'barrigudo', 'percussionista', 'estalador', 'cuspidor', 'estalador')],
    elevador: [onda(['ascensorista', 'meianoite'])],
  },
  arenaPos: { terreiro: [0.5, 0.85], elevador: [0.8] },
  semVasculhar: ['elevador'],
  // MAP-19 pede cocada (cura); enquanto não há recurso próprio, entra como comida extra.
  loot: {
    porArena: { madeira: 2.2, sucata: 2, pano: 1, comida: 1.6, agua: 0.8, pecas: 0.7, gasolina: 0.8 },
    vitoria: { madeira: 18, sucata: 12, pecas: 6, fragmento_lunar: 3, gasolina: 2, comida: 3 },
    miniBoss: { pecas: 4, sucata: 8, remedio: 1, comida: 1, fragmento_lunar: 1 },
    projeto: 0.14,
  },
};
