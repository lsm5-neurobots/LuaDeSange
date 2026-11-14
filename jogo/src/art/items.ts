// Coletáveis: ícones dos recursos (factory ITEMS do pipeline PIX), para HUD, painéis, abrigo e expedição.
// Enquanto a arte não existir, cai num ícone simples na cor do recurso.
import { HUB, withHubK } from './legacy';
import { frameStore } from './frameStore';
import { RESOURCES, type ResId } from '../data/resources';
import type { ItemMk } from '../data/market';

/** Recursos, projeto/chave da expedição e itens do mercado (chaves de baú, kit, presente, adrenalina, colete). */
export type ItemId = ResId | 'projeto' | 'chave' | ItemMk;

const FALLBACK: Record<string, string> = { projeto: '#3a7ad8', chave: '#f2c230' };
const corOf = (id: ItemId) => (id in RESOURCES ? RESOURCES[id as ResId].cor : FALLBACK[id] ?? '#ccc');

export const hasItemArt = () => !!HUB().ITEMS;

/** Quadro do item na escala atual do PIX do hub (para desenhar em canvas de cena). */
export function itemFrame(id: ItemId, fi = 0): HTMLCanvasElement | null {
  const I = HUB().ITEMS;
  if (!I) return null;
  try { return I.frame(id, ((fi % I.N) + I.N) % I.N, 5); } catch { return null; }
}

export function itemAnchor(id: ItemId, cv: HTMLCanvasElement): { ax: number; gy: number } {
  const I = HUB().ITEMS;
  try { return I.ANCHOR(id); } catch { return { ax: cv.width / 2, gy: cv.height }; }
}

/** Ícone simples (fallback): losango com brilho, na cor do recurso. */
function fallbackIcon(id: ItemId, px: number): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = px;
  const g = c.getContext('2d')!, m = px / 2;
  g.fillStyle = '#170b1c'; g.beginPath(); g.moveTo(m, 1); g.lineTo(px - 1, m); g.lineTo(m, px - 1); g.lineTo(1, m); g.fill();
  g.fillStyle = corOf(id); g.beginPath(); g.moveTo(m, 3); g.lineTo(px - 3, m); g.lineTo(m, px - 3); g.lineTo(3, m); g.fill();
  g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(m - 2, 5, 3, 3);
  return c;
}

const iconCache = new Map<string, string>();
// ícones prontos vão pro cache persistente (um registro só, versionado pela arte do hub): na próxima sessão o HUD
// abre sem gerar nada (cada ícone custa uma composição + leitura de pixels)
let kvT = 0;
function remember(key: string, url: string): void {
  iconCache.set(key, url);
  if (!kvT) kvT = window.setTimeout(() => { kvT = 0; frameStore.kvPut('ART_HUB', 'icons', JSON.stringify(Object.fromEntries(iconCache))); }, 2500);
}
/** Carrega os ícones salvos em sessões anteriores (sem storage, não faz nada). */
export async function preloadIcons(): Promise<void> {
  const got = await frameStore.kvGet('ART_HUB', ['icons']);
  if (!got.icons) return;
  try { for (const [k, v] of Object.entries(JSON.parse(got.icons) as Record<string, string>)) if (!iconCache.has(k)) iconCache.set(k, v); } catch { /* registro velho/corrompido */ }
}

/** Data URL de um ícone quadrado (para <img> no HUD/painéis). */
export function itemIconURL(id: ItemId, px = 32): string {
  const key = id + '@' + px + (hasItemArt() ? 'a' : 'f');
  const hit = iconCache.get(key);
  if (hit) return hit;
  let out: HTMLCanvasElement;
  if (hasItemArt()) {
    const I = HUB().ITEMS, k = px / (I.SIZE || 28);
    const cv = withHubK(k, () => I.frame(id, 0, 5)) as HTMLCanvasElement;
    out = document.createElement('canvas'); out.width = out.height = px;
    const g = out.getContext('2d')!; g.imageSmoothingEnabled = false;
    const s = Math.min(1, px / Math.max(cv.width, cv.height));
    g.drawImage(cv, Math.round((px - cv.width * s) / 2), Math.round((px - cv.height * s) / 2), Math.round(cv.width * s), Math.round(cv.height * s));
  } else out = fallbackIcon(id, px);
  const url = out.toDataURL();
  remember(key, url);
  return url;
}

/** <img> pronto pra HTML. */
export const itemImg = (id: ItemId, px = 20, cls = 'ico') => `<img class="${cls}" src="${itemIconURL(id, px * 2)}" width="${px}" height="${px}" alt="">`;

// ---------------- armas e golpes (factories ARMAS_ICON / GOLPES_ICON do hub) ----------------
function cachedURL(key: string, mk: () => HTMLCanvasElement | null | undefined, cor: string, px: number): string {
  const hit = iconCache.get(key);
  if (hit) return hit;
  let cv: HTMLCanvasElement | null | undefined = null;
  try { cv = mk(); } catch { cv = null; }
  if (!cv) { // fallback: losango na cor (sem cache, a arte pode chegar depois)
    const c = document.createElement('canvas'); c.width = c.height = px;
    const g = c.getContext('2d')!, m = px / 2;
    g.fillStyle = '#170b1c'; g.fillRect(m - px / 3, m - px / 3, (px * 2) / 3, (px * 2) / 3);
    g.fillStyle = cor; g.fillRect(m - px / 3 + 2, m - px / 3 + 2, (px * 2) / 3 - 4, (px * 2) / 3 - 4);
    return c.toDataURL();
  }
  const url = cv.toDataURL();
  remember(key, url);
  return url;
}

/** Data URL do sprite da arma (família × raridade). */
export function weaponIconURL(fam: string, tier = 'comum', px = 64): string {
  return cachedURL(`arma:${fam}:${tier}@${px}`, () => (window.ART_HUB ? HUB().ARMAS_ICON?.icon(fam, tier, px) : null), '#8a8a96', px);
}
export const weaponImg = (fam: string, tier = 'comum', px = 40, cls = 'ico') =>
  `<img class="${cls}" src="${weaponIconURL(fam, tier, px * 2)}" width="${px}" height="${px}" alt="">`;

/** Data URL do ícone do golpe especial (moldura de habilidade). */
export function golpeIconURL(id: string, px = 64, cor = '#ff3b55'): string {
  return cachedURL(`golpe:${id}@${px}`, () => (window.ART_HUB ? HUB().GOLPES_ICON?.icon(id, px) : null), cor, px);
}
export const golpeImg = (id: string, px = 32, cls = 'ico') =>
  `<img class="${cls}" src="${golpeIconURL(id, px * 2)}" width="${px}" height="${px}" alt="">`;

// ---------------- ícones do dock do abrigo (factory MENU_ICON do hub) ----------------
/** Data URL do ícone do menu do abrigo; state 'h' = destacado (hover/foco). px = tamanho real em pixels. */
export function menuIconURL(id: string, px = 40, state: 'n' | 'h' = 'n'): string {
  return cachedURL(`menu:${id}:${state}@${px}`, () => (window.ART_HUB ? HUB().MENU_ICON?.icon(id, px, state) : null), '#3d2a62', px);
}
