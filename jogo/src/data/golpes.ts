// Golpes especiais: liberados e upados no abrigo, equipados por membro, usados sozinhos pelo auto-combate.
// Todos são criações nossas, com tema brasileiro / Lua de Sangue.
import type { Bag } from './resources';

export type GolpeId =
  | 'meia_lua' | 'grito_frevo' | 'benzedura' | 'mao_trovao'
  | 'tiro_laser' | 'corte_lunar' | 'baque_virado' | 'esfera_espiral';

/** Como o auto-combate decide usar: linha (fila na frente), perto (alvo colado), area (grupo em volta), cura (aliado ferido). */
export type GolpeAlvo = 'linha' | 'perto' | 'area' | 'cura';

export interface GolpeDef {
  nome: string;
  /** frase curta que aparece no balão */
  grito: string;
  desc: string;
  cor: string;
  alvo: GolpeAlvo;
  /** recarga em segundos (cai 6% por nível) */
  cd: number;
  /** multiplicador de dano no nível 1 (+25% por nível) */
  dano: number;
  /** nível do personagem pra liberar (cada nível do golpe pede +1) */
  nvMin: number;
  /** custo base; o nível n custa base × n (+ fragmento lunar nos níveis altos) */
  custo: Bag;
}

export const GOLPE_MAX = 5;

export const GOLPES: Record<GolpeId, GolpeDef> = {
  meia_lua: {
    nome: 'Meia-Lua', grito: 'MEIA-LUA!', cor: '#ffd23f', alvo: 'area', cd: 7, dano: 1.6, nvMin: 1,
    desc: 'Chute giratório de capoeira: acerta todo mundo em volta e empurra pros dois lados.',
    custo: { madeira: 6, pano: 3 },
  },
  grito_frevo: {
    nome: 'Grito de Frevo', grito: 'É FREVO!', cor: '#ff5fa8', alvo: 'area', cd: 13, dano: 0.5, nvMin: 2,
    desc: 'Um grito com confete e sombrinha que atordoa os zumbis próximos.',
    custo: { pano: 6, sucata: 4 },
  },
  benzedura: {
    nome: 'Benzedura', grito: 'BENZE!', cor: '#7dff9a', alvo: 'cura', cd: 18, dano: 0, nvMin: 2,
    desc: 'Reza de benzedeira com ramo de arruda: cura o squad inteiro.',
    custo: { remedio: 2, agua: 4 },
  },
  mao_trovao: {
    nome: 'Mão de Trovão', grito: 'MÃO DE TROVÃO!', cor: '#7af0ff', alvo: 'perto', cd: 10, dano: 2.6, nvMin: 3,
    desc: 'Investida elétrica de perto: avança no alvo, explode em raios e atordoa.',
    custo: { pecas: 2, sucata: 6 },
  },
  tiro_laser: {
    nome: 'Tiro Laser', grito: 'TIRO LASER!', cor: '#ff4a5a', alvo: 'linha', cd: 9, dano: 2.2, nvMin: 3,
    desc: 'Feixe largo que atravessa a fila. Com arma laser equipada, +50% de dano.',
    custo: { pecas: 3, gasolina: 1 },
  },
  corte_lunar: {
    nome: 'Corte Lunar', grito: 'CORTE LUNAR!', cor: '#ff3b55', alvo: 'linha', cd: 11, dano: 2.4, nvMin: 4,
    desc: 'Onda de energia em arco, vermelha como a lua, que corre pela linha e corta tudo no caminho.',
    custo: { sucata: 8, fragmento_lunar: 1 },
  },
  baque_virado: {
    nome: 'Baque Virado', grito: 'BAQUE VIRADO!', cor: '#ffa040', alvo: 'area', cd: 14, dano: 1.5, nvMin: 4,
    desc: 'Pisão no ritmo do maracatu: uma onda de choque pelo chão derruba os zumbis.',
    custo: { madeira: 8, pecas: 2 },
  },
  esfera_espiral: {
    nome: 'Esfera Espiral', grito: 'ESFERA ESPIRAL!', cor: '#b98cff', alvo: 'perto', cd: 15, dano: 3.2, nvMin: 5,
    desc: 'Junta uma esfera de energia girando na mão e estoura no alvo, derrubando quem estiver perto.',
    custo: { pecas: 3, fragmento_lunar: 1 },
  },
};

export const GOLPE_IDS = Object.keys(GOLPES) as GolpeId[];

/** Custo pra chegar no nível n (1 = liberar). */
export function golpeCusto(id: GolpeId, n: number): Bag {
  const out: Bag = {};
  for (const [k, v] of Object.entries(GOLPES[id].custo)) out[k as keyof Bag] = Math.round((v as number) * n);
  if (n >= 4) out.fragmento_lunar = (out.fragmento_lunar ?? 0) + (n - 3);
  return out;
}

/** Nível do personagem exigido pro nível n do golpe. */
export const golpeNvReq = (id: GolpeId, n: number) => GOLPES[id].nvMin + (n - 1);
export const golpeCd = (id: GolpeId, n: number) => GOLPES[id].cd * (1 - 0.06 * (n - 1));
export const golpeDano = (id: GolpeId, n: number) => GOLPES[id].dano * (1 + 0.25 * (n - 1));
/** Slots de golpe por nível do personagem: 1 · 2 (nv 3) · 3 (nv 6). */
export const golpeSlots = (lv: number) => (lv >= 6 ? 3 : lv >= 3 ? 2 : 1);
