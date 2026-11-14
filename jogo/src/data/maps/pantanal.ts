// Pantanal (MT/MS): 12 áreas da Transpantaneira pela fazenda, pelo curral e pelo campo alagado, entrando no corixo, na baía,
// na salina e na cordilheira, passando pelo ninhal de tuiuiús e por Porto Jofre, até a ponte quebrada e a margem do rio Cuiabá.
// Cenário em ART_EXP.PANTANAL (art-src/map/pantanal.js, mesmo contrato do MAP). Ids das áreas (o cenário usa os mesmos):
// transpantaneira, porteira, curral, campoalagado, corixo, baia, salina, cordilheira, ninhal, jofre, pontequebrada, rio.
import type { MapDef } from './index';
import { ZOMBIES, type ZombieId } from '../zombies';

// Zumbis novos chegam aos poucos (arte/IA de outros agentes): só entram nas ondas os que já têm arte no bestiário.
// Mini boss e chefe caem num substituto do mesmo porte enquanto não existem, para a arena nunca ficar vazia.
const tem = (k: string): boolean => !!(ZOMBIES as Record<string, { art: string | null } | undefined>)[k]?.art;
const z = (k: string, sub?: ZombieId): ZombieId[] => (tem(k) ? [k as ZombieId] : sub ? [sub] : []);
const onda = (...ks: (string | [string, ZombieId])[]): ZombieId[] => ks.flatMap((k) => (Array.isArray(k) ? z(k[0], k[1]) : z(k)));

export const PANTANAL: MapDef = {
  id: 'pantanal',
  nome: 'Pantanal',
  desc: 'O Pantanal na cheia: da estrada de terra da Transpantaneira pela porteira da fazenda e pelo curral, atravessando o campo alagado, o corixo, a baía e a salina, subindo à cordilheira e passando pelo ninhal de tuiuiús e por Porto Jofre, até a ponte quebrada e a margem do rio Cuiabá. Estreia do Peão Pantaneiro, do Tuiuiú, da Queixada e da Ariranha. Mini boss O Tamanduá-Bandeira na cordilheira, chefe O Rei Jacaré no rio.',
  art: 'PANTANAL',
  areas: 12,
  requer: 'amazonia',
  nivelRecomendado: 26,
  // 12 tipos: novos peao, tuiuiu, queixada, ariranha · mini boss O Tamanduá-Bandeira · chefe O Rei Jacaré
  // + reaproveitados errante, corredor, rastejante, piranha, blindado.
  // MAP-35: ariranha e piranha só em área de água (campoalagado, corixo, baia, pontequebrada, rio e as margens do ninhal/jofre);
  // queixada em bando no campo e na cordilheira; tuiuiu no ninhal e nos campos; peão na porteira e no curral.
  ondas: {
    transpantaneira: [onda('errante', 'errante', 'corredor', 'peao', 'queixada'), onda('corredor', 'errante', 'peao', 'tuiuiu', 'errante')],
    porteira: [onda('peao', 'errante', 'queixada', 'corredor', 'peao'), onda('blindado', 'peao', 'errante', 'tuiuiu', 'corredor')],
    curral: [onda('peao', 'peao', 'blindado', 'queixada', 'errante'), onda('queixada', 'queixada', 'peao', 'corredor', 'blindado', 'tuiuiu')],
    campoalagado: [onda('tuiuiu', 'queixada', 'errante', 'ariranha', 'peao'), onda('ariranha', 'tuiuiu', 'piranha', 'blindado', 'peao', 'errante')],
    corixo: [onda('ariranha', 'piranha', 'piranha', 'rastejante', 'errante'), onda('ariranha', 'ariranha', 'peao', 'queixada', 'tuiuiu', 'piranha')],
    baia: [onda('piranha', 'ariranha', 'tuiuiu', 'peao', 'blindado', 'errante'), onda('ariranha', 'piranha', 'queixada', 'tuiuiu', 'rastejante', 'peao')],
    salina: [onda('peao', 'queixada', 'tuiuiu', 'corredor', 'blindado', 'rastejante'), onda('queixada', 'queixada', 'blindado', 'peao', 'tuiuiu', 'corredor')],
    cordilheira: [onda('queixada', 'peao', 'tuiuiu', 'errante', 'blindado', 'corredor'), onda(['tamandua', 'passista'])],
    ninhal: [onda('tuiuiu', 'tuiuiu', 'peao', 'ariranha', 'blindado', 'corredor'), onda('tuiuiu', 'tuiuiu', 'tuiuiu', 'queixada', 'peao')],
    jofre: [onda('peao', 'ariranha', 'piranha', 'blindado', 'tuiuiu', 'queixada', 'errante'), onda('blindado', 'peao', 'ariranha', 'queixada', 'corredor', 'tuiuiu')],
    pontequebrada: [onda('piranha', 'piranha', 'ariranha', 'rastejante', 'peao', 'corredor'), onda('blindado', 'ariranha', 'tuiuiu', 'queixada', 'peao', 'piranha')],
    rio: [onda(['reijacare', 'maquinista'])],
  },
  arenaPos: { cordilheira: [0.45, 0.95], rio: [0.8] },
  semVasculhar: ['rio'],
  // Tereré, piranha defumada, couro pantaneiro e pena de tuiuiú ainda sem recurso próprio: entram como água/comida/pano.
  loot: {
    porArena: { madeira: 2.4, sucata: 1.8, pano: 1.8, comida: 2.4, agua: 1.8, pecas: 1.0, gasolina: 1.1 },
    vitoria: { madeira: 28, sucata: 16, pecas: 12, fragmento_lunar: 6, gasolina: 4, comida: 6 },
    miniBoss: { pecas: 7, pano: 12, remedio: 3, comida: 3, fragmento_lunar: 1 },
    projeto: 0.18,
  },
};
