// Regras puras de recursos (sem DOM).
import { RESOURCES, type Bag, type ResId } from '../data/resources';
import type { GameState } from './state';

export function canPay(s: GameState, c: Bag): boolean {
  return Object.entries(c).every(([k, v]) => (s.res[k as ResId] ?? 0) >= (v ?? 0));
}

export function pay(s: GameState, c: Bag): boolean {
  if (!canPay(s, c)) return false;
  for (const [k, v] of Object.entries(c)) s.res[k as ResId] -= v ?? 0;
  return true;
}

export function gain(s: GameState, b: Bag, mult = 1): void {
  for (const [k, v] of Object.entries(b)) s.res[k as ResId] = (s.res[k as ResId] ?? 0) + Math.round((v ?? 0) * mult);
}

export function scaleBag(b: Bag, k: number): Bag {
  const o: Bag = {};
  for (const [r, v] of Object.entries(b)) o[r as ResId] = Math.max(0, Math.round((v ?? 0) * k));
  return o;
}

export function addBags(a: Bag, b: Bag): Bag {
  const o: Bag = { ...a };
  for (const [r, v] of Object.entries(b)) o[r as ResId] = (o[r as ResId] ?? 0) + (v ?? 0);
  return o;
}

export function bagText(b: Bag, have?: Record<ResId, number>): string {
  const parts = Object.entries(b).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => {
    const r = RESOURCES[k as ResId], ok = !have || (have[k as ResId] ?? 0) >= (v ?? 0);
    return ok ? `${r.nome} ${v}` : `<em>${r.nome} ${v}</em>`;
  });
  return parts.join(' · ') || '—';
}
