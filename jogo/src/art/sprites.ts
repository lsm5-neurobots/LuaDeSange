// Arte de atores (herói, recrutas, pets) com interface única pra qualquer tela desenhar.
import { HUB, type Factory } from './legacy';
import type { HeroCfg } from '../game/state';
import type { RecruitType, PetType } from '../data/recruits';
import type { WeaponFamily, Tier } from '../data/weapons';

export interface ActorArt {
  F: Factory;
  has(anim: string): boolean;
  frame(anim: string, fi: number): HTMLCanvasElement & { _tip?: { x: number; y: number } };
}

const wrap = (F: Factory, fn: (anim: string, fi: number) => HTMLCanvasElement): ActorArt => ({
  F,
  has: (a) => !!F.ANIMS[a],
  frame: (anim, fi) => {
    const a = F.ANIMS[anim] ? anim : 'idle';
    return fn(a, ((fi % F.ANIMS[a].n) + F.ANIMS[a].n) % F.ANIMS[a].n);
  },
});

export function heroArt(cfg: HeroCfg, arma: { familia: WeaponFamily; tier: Tier } = { familia: 'bastao', tier: 'comum' }): ActorArt {
  const H = HUB().HEROI;
  const c = { ...cfg, arma: arma.familia, tier: arma.tier };
  return wrap(H, (a, i) => H.frame(c, a, i));
}

export function recruitFactory(tipo: RecruitType): Factory {
  const A = HUB();
  return ({ vigia: A.VIGIA, serralheiro: A.SERRALHEIRO, pedreira: A.PEDREIRA, lenhador: A.LENHADOR, catadora: A.CATA, agricultor: A.AGRI, capoeirista: A.CAPO, enfermeira: A.ENFE } as const)[tipo];
}

export function recruitArt(tipo: RecruitType, skin: string): ActorArt {
  const F = recruitFactory(tipo);
  if (tipo === 'vigia') return wrap(F, (a, i) => F.frame(skin, 'comum', a, i));
  if (tipo === 'serralheiro' || tipo === 'pedreira' || tipo === 'lenhador') return wrap(F, (a, i) => F.frame(skin, null, a, i));
  return wrap(F, (a, i) => F.frame(skin, a, i));
}

export function petFactory(tipo: PetType): Factory {
  const A = HUB();
  return ({ cachorro: A.PET_CACHORRO, gato: A.PET_GATO, capivara: A.PET_CAPIVARA, jabuti: A.JABU, papagaio: A.PAPA, sagui: A.SAGU } as const)[tipo];
}

export function petArt(tipo: PetType, variante: string): ActorArt {
  const F = petFactory(tipo);
  const v = variante && F.VARS?.[variante] ? variante : Object.keys(F.VARS ?? {})[0];
  return wrap(F, (a, i) => F.frame(v, a, i));
}

/** Ponto de ancoragem (pé) do canvas, respeitando a escala com que o frame foi gerado. */
export function anchor(F: Factory, cv: HTMLCanvasElement): { ax: number; gy: number } {
  return { ax: F.AX * (cv.width / F.FW), gy: F.GROUND * (cv.height / F.FH) };
}

export function drawActor(
  g: CanvasRenderingContext2D, art: ActorArt, anim: string, fi: number, x: number, y: number, face: 1 | -1,
  opts: { alpha?: number; sy?: number; shadow?: boolean } = {},
): HTMLCanvasElement {
  const cv = art.frame(anim, fi), { ax, gy } = anchor(art.F, cv);
  if (opts.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(Math.round(x) - 10, Math.round(y) - 1, 20, 3); }
  g.save();
  if (opts.alpha != null) g.globalAlpha = opts.alpha;
  g.translate(Math.round(x), Math.round(y));
  if (face < 0) g.scale(-1, 1);
  if (opts.sy && opts.sy !== 1) g.scale(1, opts.sy);
  g.drawImage(cv, -ax, -gy);
  g.restore();
  return cv;
}

/** Retrato quadrado pra cards/HUD. */
export function portrait(art: ActorArt, size = 80): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const cv = art.frame('idle', 0), { ax, gy } = anchor(art.F, cv);
  const s = Math.min((size * 0.88) / cv.height, (size * 0.95) / cv.width);
  g.translate(size / 2, size * 0.95);
  g.scale(s, s);
  g.drawImage(cv, -ax, -gy);
  return c;
}
