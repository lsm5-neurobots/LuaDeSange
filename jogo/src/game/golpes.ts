// Regras puras dos golpes especiais: liberar, upar, equipar nos slots e montar a lista pra expedição.
import { GOLPES, GOLPE_MAX, golpeCusto, golpeNvReq, golpeSlots, type GolpeId } from '../data/golpes';
import type { Bag } from '../data/resources';
import { canPay, pay } from './economy';
import { addLog, type GameState, type MemberGolpes } from './state';

export type GolpeBlock = 'max' | 'nivel' | 'recursos' | 'membro' | null;

/** Nível do membro ('hero' ou id do recruta); 0 se não existe. */
export function memberLv(s: GameState, memberId: string): number {
  if (memberId === 'hero') return s.hero ? s.heroLv : 0;
  return s.recs.find((r) => r.id === memberId)?.lv ?? 0;
}
const memberNome = (s: GameState, id: string) => (id === 'hero' ? s.hero?.nome ?? 'Herói' : s.recs.find((r) => r.id === id)?.nome ?? '?');

/** Golpes do membro (cria a entrada vazia se precisar). */
export function mg(s: GameState, memberId: string): MemberGolpes {
  s.golpes ??= {};
  return (s.golpes[memberId] ??= { nv: {}, eq: [] });
}
const peek = (s: GameState, memberId: string): MemberGolpes => s.golpes?.[memberId] ?? { nv: {}, eq: [] };

export const golpeNv = (s: GameState, memberId: string, g: GolpeId) => peek(s, memberId).nv[g] ?? 0;
export const slotsOf = (s: GameState, memberId: string) => golpeSlots(memberLv(s, memberId));

export function upCost(s: GameState, memberId: string, g: GolpeId): Bag {
  const n = golpeNv(s, memberId, g) + 1;
  return n > GOLPE_MAX ? {} : golpeCusto(g, n);
}

/** Por que não dá pra liberar/upar (null = pode). */
export function upBlock(s: GameState, memberId: string, g: GolpeId): GolpeBlock {
  const lv = memberLv(s, memberId);
  if (!lv) return 'membro';
  const n = golpeNv(s, memberId, g) + 1;
  if (n > GOLPE_MAX) return 'max';
  if (lv < golpeNvReq(g, n)) return 'nivel';
  if (!canPay(s, golpeCusto(g, n))) return 'recursos';
  return null;
}

/** Libera (nível 1) ou upa o golpe. Ao liberar, equipa sozinho se tiver slot livre. */
export function upGolpe(s: GameState, memberId: string, g: GolpeId): boolean {
  if (upBlock(s, memberId, g)) return false;
  const n = golpeNv(s, memberId, g) + 1;
  pay(s, golpeCusto(g, n));
  const m = mg(s, memberId);
  m.nv = { ...m.nv, [g]: n };
  if (n === 1 && m.eq.length < slotsOf(s, memberId) && !m.eq.includes(g)) m.eq = [...m.eq, g];
  addLog(s, n === 1
    ? `<b>${memberNome(s, memberId)}</b> aprendeu o golpe <b>${GOLPES[g].nome}</b>.`
    : `<b>${GOLPES[g].nome}</b> de ${memberNome(s, memberId)} subiu pro nível ${n}.`);
  return true;
}

export type EquipBlock = 'bloqueado' | 'slots' | null;
export function equipBlock(s: GameState, memberId: string, g: GolpeId): EquipBlock {
  if (!golpeNv(s, memberId, g)) return 'bloqueado';
  const m = peek(s, memberId);
  if (!m.eq.includes(g) && m.eq.length >= slotsOf(s, memberId)) return 'slots';
  return null;
}

export function equipGolpe(s: GameState, memberId: string, g: GolpeId): boolean {
  if (equipBlock(s, memberId, g)) return false;
  const m = mg(s, memberId);
  if (!m.eq.includes(g)) m.eq = [...m.eq, g];
  return true;
}

export function unequipGolpe(s: GameState, memberId: string, g: GolpeId): void {
  const m = mg(s, memberId);
  m.eq = m.eq.filter((x) => x !== g);
}

/** Golpes que vão pra expedição: liberados, equipados e dentro dos slots do nível atual. */
export function equippedGolpes(s: GameState, memberId: string): { id: GolpeId; nv: number }[] {
  const m = peek(s, memberId);
  return m.eq
    .filter((g) => GOLPES[g] && (m.nv[g] ?? 0) > 0)
    .slice(0, slotsOf(s, memberId))
    .map((g) => ({ id: g, nv: m.nv[g]! }));
}
