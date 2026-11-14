// Regras puras do abrigo: construir, evoluir, produzir, coletar e reparar.
import { STRUCTS, STRUCT_IDS, type StructId } from '../data/structures';
import { BLOODMOON } from '../data/bloodmoon';
import type { Bag, ResId } from '../data/resources';
import { canPay, pay, scaleBag } from './economy';
import { prodPenalty } from './upkeep';
import { addLog, type GameState, type StructState } from './state';

export const lvl = (s: GameState, id: StructId): number => s.estruturas[id]?.nv ?? 0;
export const st = (s: GameState, id: StructId): StructState | undefined => s.estruturas[id];
export const maxHp = (s: GameState, id: StructId): number => STRUCTS[id].hp?.(lvl(s, id)) ?? 0;
export const camas = (s: GameState): number => 2 * lvl(s, 'barraca');
export const populacao = (s: GameState): number => 1 + s.recs.length;
export const temRecruta = (s: GameState, tipo: string): boolean => s.recs.some((r) => r.tipo === tipo);

export type BuildBlock = 'max' | 'fogueira' | 'obra' | 'recursos' | null;

/** Por que não dá pra construir/evoluir (null = pode). */
export function buildBlock(s: GameState, id: StructId): BuildBlock {
  const n = lvl(s, id) + 1, def = STRUCTS[id];
  if (n > def.max) return 'max';
  if (id !== 'fogueira' && n > lvl(s, 'fogueira')) return 'fogueira';
  if (s.obra) return 'obra';
  if (!canPay(s, def.custo(n))) return 'recursos';
  return null;
}

export function startBuild(s: GameState, id: StructId, now = Date.now()): boolean {
  if (buildBlock(s, id)) return false;
  const n = lvl(s, id) + 1;
  pay(s, STRUCTS[id].custo(n));
  s.obra = { id, nv: n, fim: now + STRUCTS[id].obra(n) * 1000 };
  addLog(s, `Começou a obra: <b>${STRUCTS[id].nome}</b> nível ${n}.`);
  return true;
}

/** Conclui a obra se o tempo acabou. Retorna o id concluído. */
export function tickObra(s: GameState, now = Date.now()): StructId | null {
  if (!s.obra || now < s.obra.fim) return null;
  const { id, nv } = s.obra;
  s.obra = null;
  const prev = s.estruturas[id];
  s.estruturas[id] = { nv, hp: STRUCTS[id].hp?.(nv) ?? 0, danificada: false };
  if (prev?.danificada && STRUCTS[id].cat !== 'defesa') s.estruturas[id]!.danificada = false;
  addLog(s, `Obra pronta: <b>${STRUCTS[id].nome}</b> nível ${nv}.`);
  return id;
}

/** Acelera a obra atual (ex.: botão "terminar já" de debug/teste). */
export function finishObraNow(s: GameState): StructId | null {
  if (!s.obra) return null;
  s.obra.fim = 0;
  return tickObra(s, 1);
}

export function prodMult(s: GameState, id: StructId): number {
  let m = (1 + 0.1 * lvl(s, 'gerador')) * prodPenalty(s);
  if (id === 'horta' && temRecruta(s, 'agricultor')) m *= 1.25;
  return m;
}

/** Avança a produção passiva em `minutos`. Estruturas danificadas não produzem. */
export function tickProduction(s: GameState, minutos: number): void {
  if (minutos <= 0) return;
  for (const id of STRUCT_IDS) {
    const def = STRUCTS[id], e = s.estruturas[id];
    if (!def.prod || !e || e.nv <= 0 || e.danificada) continue;
    const cap = def.prod.cap(e.nv), cur = s.prodBuf[id] ?? 0;
    s.prodBuf[id] = Math.min(cap, cur + def.prod.porMin(e.nv) * prodMult(s, id) * minutos);
  }
}

/** Coleta a produção acumulada (de uma estrutura ou de todas). Retorna o que entrou. */
export function collect(s: GameState, only?: StructId): Bag {
  const got: Bag = {};
  for (const id of only ? [only] : STRUCT_IDS) {
    const def = STRUCTS[id], amt = Math.floor(s.prodBuf[id] ?? 0);
    if (!def.prod || amt <= 0) continue;
    s.prodBuf[id] = (s.prodBuf[id] ?? 0) - amt;
    s.res[def.prod.res] += amt;
    got[def.prod.res] = (got[def.prod.res] ?? 0) + amt;
    if (def.prod.extra) {
      const ex = Math.floor(amt / 3);
      if (ex > 0) { s.res[def.prod.extra] += ex; got[def.prod.extra] = (got[def.prod.extra] ?? 0) + ex; }
    }
  }
  return got;
}

export function pendingTotal(s: GameState): number {
  return STRUCT_IDS.reduce((a, id) => a + Math.floor(s.prodBuf[id] ?? 0), 0);
}

// ---------------- reparo ----------------
export function needsRepair(s: GameState, id: StructId): boolean {
  const e = s.estruturas[id];
  if (!e || e.nv <= 0) return false;
  if (STRUCTS[id].cat === 'defesa') return e.hp < maxHp(s, id);
  return e.danificada;
}

export function repairDiscount(s: GameState): number {
  let d = 1 - 0.1 * lvl(s, 'bancada');
  if (temRecruta(s, 'pedreira')) d *= 0.75;
  return Math.max(0.3, d);
}

export function repairCost(s: GameState, id: StructId): Bag {
  const e = s.estruturas[id];
  if (!e || !needsRepair(s, id)) return {};
  if (STRUCTS[id].cat === 'defesa') {
    const lost = maxHp(s, id) - e.hp;
    return scaleBag(BLOODMOON.reparoPor100 as Bag, Math.max(0.34, lost / 100) * repairDiscount(s));
  }
  return scaleBag(BLOODMOON.reparoInterno as Bag, e.nv * repairDiscount(s));
}

export function repair(s: GameState, id: StructId): boolean {
  const e = s.estruturas[id];
  if (!e || !needsRepair(s, id)) return false;
  const c = repairCost(s, id);
  if (!pay(s, c)) return false;
  if (STRUCTS[id].cat === 'defesa') e.hp = maxHp(s, id);
  e.danificada = false;
  addLog(s, `Reparou: <b>${STRUCTS[id].nome}</b>.`);
  return true;
}

export function repairAllCost(s: GameState): Bag {
  const tot: Partial<Record<ResId, number>> = {};
  for (const id of STRUCT_IDS) for (const [k, v] of Object.entries(repairCost(s, id))) tot[k as ResId] = (tot[k as ResId] ?? 0) + (v ?? 0);
  return tot;
}

export const damagedList = (s: GameState): StructId[] => STRUCT_IDS.filter((id) => needsRepair(s, id));
