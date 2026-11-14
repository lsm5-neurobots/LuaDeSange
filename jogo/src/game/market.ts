// Regras puras do mercado e do inventário de itens de expedição (sem DOM).
import { MARKET, ITEM_MK, type ItemMk, type MarketItem } from '../data/market';
import { WEAPONS, type WeaponFamily } from '../data/weapons';
import { canPay, pay } from './economy';
import { addLog, type GameState } from './state';

export const itemCount = (s: GameState, id: ItemMk) => s.itens?.[id] ?? 0;

export function marketList(s: GameState): MarketItem[] {
  return MARKET.filter((m) => !m.requer || (s.vencidos ?? []).includes(m.requer) || (m.requer === 'marco_zero' && s.vitorias > 0));
}

export function buyBlock(s: GameState, id: string): string | null {
  const m = marketList(s).find((x) => x.id === id);
  if (!m) return 'indisponível';
  if (!canPay(s, m.preco)) return 'recursos';
  return null;
}

/** Compra 1 unidade. Itens vão pro inventário; armas entram no arsenal (raridade comum). */
export function buy(s: GameState, id: string): boolean {
  if (buyBlock(s, id)) return false;
  const m = MARKET.find((x) => x.id === id)!;
  pay(s, m.preco);
  if (id.startsWith('arma_')) {
    const f = id.slice(5) as WeaponFamily;
    s.armas.push({ id: 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), familia: f, tier: 'comum', nv: 1 } as any);
    addLog(s, `Comprou no mercado: <b>${WEAPONS[f].nomes.comum}</b>.`);
  } else {
    s.itens = { ...(s.itens ?? {}) };
    s.itens[id as ItemMk] = (s.itens[id as ItemMk] ?? 0) + 1;
    addLog(s, `Comprou no mercado: <b>${ITEM_MK[id as ItemMk].nome}</b>.`);
  }
  return true;
}

/** Tira itens do inventário para levar na expedição (devolve o que conseguiu tirar). */
export function takeItems(s: GameState, want: Partial<Record<ItemMk, number>>): Partial<Record<ItemMk, number>> {
  const got: Partial<Record<ItemMk, number>> = {};
  s.itens = { ...(s.itens ?? {}) };
  for (const [k, n] of Object.entries(want)) {
    const q = Math.max(0, Math.min(n ?? 0, s.itens[k as ItemMk] ?? 0));
    if (q) { s.itens[k as ItemMk]! -= q; got[k as ItemMk] = q; }
  }
  return got;
}

/** Devolve ao inventário o que sobrou da expedição. */
export function returnItems(s: GameState, left: Partial<Record<ItemMk, number>> | undefined): void {
  if (!left) return;
  s.itens = { ...(s.itens ?? {}) };
  for (const [k, n] of Object.entries(left)) if (n) s.itens[k as ItemMk] = (s.itens[k as ItemMk] ?? 0) + n;
}
