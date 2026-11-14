// Ponte com a arte procedural legada (public/art/*.js, gerados por tools/extract-art.mjs).
// Todo `any` da arte fica contido aqui; o resto do jogo usa os tipos abaixo.

export interface AnimDef {
  nome: string;
  n: number;
  dur: (i: number) => number;
  /** frame → número do golpe (1..3) */
  hits?: Record<number, number>;
  /** frame → dados do golpe (kit do Vigia) */
  hitsx?: Record<number, any>;
  move?: number[];
  [k: string]: any;
}

export interface Factory {
  FW: number;
  FH: number;
  GROUND: number;
  AX: number;
  ANIMS: Record<string, AnimDef>;
  frame: (...args: any[]) => HTMLCanvasElement & { _tip?: { x: number; y: number }; _head?: { x: number; y: number } };
  framePose?: (...args: any[]) => HTMLCanvasElement;
  VARS?: Record<string, any>;
  SKINS?: Record<string, any>;
  [k: string]: any;
}

export interface ArtExp {
  PIX: any; TWEEN: any; GORE: any; BATON: any; VIGIA: Factory;
  ERR: Factory; RAS: Factory; COR: Factory; CUSP: Factory; GRIT: Factory; BARR: Factory; SALT: Factory;
  BRUT: Factory; ACOU: Factory; OBJ: any; BAU: any; PUZZLE: any; MAP: any;
  /** coletáveis (recursos, projeto, chave) — opcional até a arte existir */
  ITEMS?: any;
}

export interface ArtHub {
  PIX: any; BATON: any; GUN: any; HEROI: Factory & { CAT: any; OPT: any; DEFAULT: any; random: () => any };
  VIGIA: Factory; SERRALHEIRO: Factory; PEDREIRA: Factory; LENHADOR: Factory; CATA: Factory; AGRI: Factory; CAPO: Factory; ENFE: Factory;
  PET_CACHORRO: Factory; PET_GATO: Factory; PET_CAPIVARA: Factory; JABU: Factory; PAPA: Factory; SAGU: Factory;
  CUSP: Factory; GRIT: Factory; BARR: Factory; ABRIGO: any;
  ITEMS?: any;
  /** ícone de arma por família × raridade: icon(fam, tier, px) */
  ARMAS_ICON?: { icon: (fam: string, tier: string, px: number) => HTMLCanvasElement };
  /** ícone de golpe especial (moldura de habilidade): icon(id, px) */
  GOLPES_ICON?: { icon: (id: string, px: number) => HTMLCanvasElement; IDS: string[] };
  /** ícones do dock do abrigo: icon(id, px, 'n' | 'h') */
  MENU_ICON?: { icon: (id: string, px: number, state: 'n' | 'h') => HTMLCanvasElement; IDS: string[]; ACC: Record<string, string> };
}

declare global {
  interface Window { ART_EXP?: ArtExp; ART_HUB?: ArtHub }
}

export function artReady(): boolean {
  return !!(window.ART_EXP && window.ART_HUB);
}

export const EXP = (): ArtExp => {
  if (!window.ART_EXP) throw new Error('arte da expedição não carregou (public/art/art-exp.js)');
  return window.ART_EXP;
};
export const HUB = (): ArtHub => {
  if (!window.ART_HUB) throw new Error('arte do hub não carregou (public/art/art-hub.js)');
  return window.ART_HUB;
};

/** Escala padrão do jogo (0,7 = mesma dos protótipos). */
export const GAME_K = 0.7;

export function initArt(): void {
  HUB().PIX.setK(GAME_K);
  EXP().PIX.setK(GAME_K);
}

/** Roda fn com outra escala no PIX do hub (ex.: prévia da criação em K=1). */
export function withHubK<T>(k: number, fn: () => T): T {
  const pix = HUB().PIX, old = pix.getK();
  pix.setK(k);
  try { return fn(); } finally { pix.setK(old); }
}
