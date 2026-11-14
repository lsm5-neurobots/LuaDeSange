// Regras de conquistas e lembranças (puras sobre o GameState).
import { CONQUISTAS, CONQUISTA } from '../data/conquistas';
import { LEMBRANCAS, LEMBRANCA, type LembrancaDef, type BonusKey } from '../data/lembrancas';
import { MAPS } from '../data/maps';
import type { ExpeditionConfig, ExpeditionResult } from '../expedition/types';
import { gain, bagText } from './economy';
import { addLog, type GameState } from './state';

// ---------------- conquistas ----------------
export type ConqStatus = 'aberta' | 'pronta' | 'resgatada';
export const conqStatus = (s: GameState, id: string): ConqStatus =>
  s.conquistas?.[id] === 'resgatada' ? 'resgatada' : CONQUISTA[id] && CONQUISTA[id].stat(s) >= CONQUISTA[id].meta ? 'pronta' : 'aberta';
export const conqProntas = (s: GameState) => CONQUISTAS.filter((c) => conqStatus(s, c.id) === 'pronta');

/** Marca as recém-batidas (pro aviso no diário) e devolve os nomes. */
export function checkConquistas(s: GameState): string[] {
  s.conquistas = s.conquistas ?? {};
  const novas: string[] = [];
  for (const c of CONQUISTAS) {
    if (s.conquistas[c.id] || c.stat(s) < c.meta) continue;
    s.conquistas[c.id] = 'feita';
    novas.push(c.nome);
  }
  if (novas.length) addLog(s, `Conquista${novas.length > 1 ? 's' : ''}: <b>${novas.join('</b>, <b>')}</b>. Resgate o prêmio em <b>Conquistas</b>.`);
  return novas;
}

/** Resgata o prêmio de uma conquista pronta. */
export function claimConquista(s: GameState, id: string): boolean {
  const c = CONQUISTA[id];
  if (!c || conqStatus(s, id) !== 'pronta') return false;
  s.conquistas = { ...(s.conquistas ?? {}), [id]: 'resgatada' };
  gain(s, c.premio);
  addLog(s, `Prêmio da conquista <b>${c.nome}</b>: ${bagText(c.premio)}.`);
  return true;
}
export function claimTodas(s: GameState): number {
  let n = 0;
  for (const c of conqProntas(s)) if (claimConquista(s, c.id)) n++;
  return n;
}

// ---------------- lembranças ----------------
export const temLembranca = (s: GameState, id: string) => !!s.lembrancas?.[id];

/** Progresso da missão: [atual, meta] (missão de uma expedição só = 0/1). */
export function lembProgresso(s: GameState, l: LembrancaDef): [number, number] {
  const c = l.cond;
  if (temLembranca(s, l.id)) return [1, 1];
  if (c.k === 'vitorias') return [Math.min(c.n, s.statsMapa?.[l.mapa]?.vit ?? 0), c.n];
  if (c.k === 'abates') return [Math.min(c.n, s.derrotados?.[c.tipo] ?? 0), c.n];
  return [0, 1];
}

function cumpriu(s: GameState, l: LembrancaDef, r: ExpeditionResult): boolean {
  const c = l.cond;
  if (c.k === 'chefeSemKit') return r.mapId === l.mapa && r.chefe && (r.kitsUsados ?? 0) === 0;
  if (c.k === 'vencerLua') return r.mapId === l.mapa && r.sucesso && r.lua;
  const [a, m] = lembProgresso(s, l);
  return a >= m;
}

/** Depois de aplicar a expedição: conta a vitória no mapa e entrega as lembranças conquistadas. */
export function checkLembrancas(s: GameState, r: ExpeditionResult): LembrancaDef[] {
  s.statsMapa = { ...(s.statsMapa ?? {}) };
  const m = (s.statsMapa[r.mapId] = { vit: s.statsMapa[r.mapId]?.vit ?? 0 });
  if (r.sucesso) m.vit++;
  s.lembrancas = s.lembrancas ?? {};
  const novas = LEMBRANCAS.filter((l) => !s.lembrancas[l.id] && cumpriu(s, l, r));
  for (const l of novas) {
    s.lembrancas[l.id] = s.dia;
    addLog(s, `Lembrança encontrada: <b>${l.nome}</b> (${MAPS[l.mapa]?.nome ?? l.mapa}). Já está na prateleira do abrigo.`);
  }
  return novas;
}

/** Soma os bônus das lembranças guardadas. */
export function lembrancaBonus(s: GameState): Record<BonusKey, number> {
  const b: Record<BonusKey, number> = { vida: 0, dano: 0, esquiva: 0, loot: 0, cura: 0, chaves: 0 };
  for (const id of Object.keys(s.lembrancas ?? {})) {
    const l = LEMBRANCA[id];
    if (l) for (const [k, v] of Object.entries(l.bonus) as [BonusKey, number][]) b[k] += v;
  }
  return b;
}
export function applyLembrancaBonus(s: GameState, bonus: ExpeditionConfig['bonus']): void {
  const b = lembrancaBonus(s);
  bonus.vida += b.vida; bonus.dano += b.dano; bonus.esquiva += b.esquiva; bonus.loot += b.loot; bonus.cura += b.cura; bonus.chaves += b.chaves;
}
