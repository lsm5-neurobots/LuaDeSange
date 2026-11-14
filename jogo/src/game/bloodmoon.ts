// Lua de Sangue: ciclo, força da horda e resolução do ataque ao abrigo (regras puras).
import { BLOODMOON } from '../data/bloodmoon';
import { DEFENSES, STRUCTS, STRUCT_IDS, type StructId } from '../data/structures';
import { rng as defaultRng, type Rng } from '../core/rng';
import type { ResId } from '../data/resources';
import { lvl, maxHp } from './shelter';
import { addLog, type GameState } from './state';
import { LUA_CICLO_MS, LUA_DURACAO_MS, bloodMoonAt, bloodMoonWindows, nextBloodMoon, serverNow, type Janela } from './worldClock';

export interface AttackReport {
  dia: number;
  forca: number;
  defesa: number;
  /** HP perdido por cada defesa */
  danoDefesas: Partial<Record<StructId, number>>;
  /** defesas que pararam no mínimo de vida (PISO_DEFESA): seguraram a parte delas sem cair abaixo do piso */
  piso?: StructId[];
  /** estruturas internas danificadas (produção parada até reparar) */
  danificadas: StructId[];
  /** recursos roubados quando a horda entra */
  roubado: Partial<Record<ResId, number>>;
  segurou: boolean;
}

// A Lua de Sangue segue o RELÓGIO REAL (worldClock.ts, LUA-01): janela de 30 min a cada 12 h (00:00 e 12:00 UTC).
// A regra antiga "a cada 3 noites/expedições" saiu.
/** A Lua de Sangue está no céu agora (expedição que sai/está em andamento vira modo lua)? */
export const nextIsBloodMoon = (_s?: GameState, now: number = serverNow()): boolean => bloodMoonAt(now);
/** Ms reais até a próxima janela começar (0 se já está numa). */
export const msUntilBloodMoon = (now: number = serverNow()): number => (bloodMoonAt(now) ? 0 : nextBloodMoon(now).inicio - now);

/** Janelas que ainda devem um ataque ao abrigo (LUA-10): 1 por janela, contando no máximo as janelas das
 *  últimas 12 h 30 (um ciclo + a janela) ou as que começaram depois de `desde`. */
export function pendingBloodMoons(s: GameState, now: number = serverNow(), desde = -Infinity): Janela[] {
  const d = Math.max((s.luaAtacada ?? -Infinity) + 1, s.criadoEm, now - LUA_CICLO_MS - LUA_DURACAO_MS, desde);
  return bloodMoonWindows(d, now + 1).filter((j) => j.inicio <= now);
}

/** Resolve o ataque da janela que começa em `inicio`, se ainda não foi resolvido (1 por janela). */
export function attackWindow(s: GameState, inicio: number, r: Rng = defaultRng): AttackReport | null {
  if ((s.luaAtacada ?? -Infinity) >= inicio) return null;
  s.luaAtacada = inicio;
  return resolveAttack(s, r);
}

/** Resolve as janelas pendentes (na ordem) e devolve os relatórios (o último é o que a tela mostra).
 *  Antes da 1ª expedição a horda passa reto (o abrigo ainda não foi achado): a janela só é marcada. */
export function resolvePendingAttacks(s: GameState, now: number = serverNow(), r: Rng = defaultRng, desde = -Infinity): AttackReport[] {
  const out: AttackReport[] = [];
  for (const j of pendingBloodMoons(s, now, desde)) {
    if (s.expedicoes <= 0) { s.luaAtacada = Math.max(s.luaAtacada ?? -Infinity, j.inicio); continue; }
    const rep = attackWindow(s, j.inicio, r);
    if (rep) out.push(rep);
  }
  return out;
}

/** Mínimo de vida das defesas: um ataque nunca derruba uma defesa abaixo desta fração do HP máximo. A defesa
 *  segura com toda a vida atual, mas só perde até o piso (o jogador não perde todo o progresso de uma vez). */
export const PISO_DEFESA = 0.35;
export const pisoHp = (s: GameState, id: StructId): number => Math.round(maxHp(s, id) * PISO_DEFESA);
export const hordeStrength = (dia: number): number => BLOODMOON.forcaBase + BLOODMOON.forcaPorDia * dia;
/** "Dia" usado pela força da horda. Com o loop, o contador de dias corre (1 rodada = 1 dia, dezenas por dia real),
 *  então a horda segue o PROGRESSO: 3 + 8 por mapa vencido + melhor área alcançada (nunca acima do dia de fato).
 *  Marco Zero ≈ 3..15 · depois de vencer os 4 mapas ≈ 47. */
export const hordeDia = (s: GameState): number => Math.min(s.dia, 3 + 8 * (s.vencidos?.length ?? 0) + (s.melhorArea ?? 0));
export const defenseBonus = (s: GameState): number => 1 + 0.1 * lvl(s, 'posto_guarda');

/** HP somado das defesas de pé, já com bônus do posto de guarda. */
export function defenseTotal(s: GameState): number {
  return DEFENSES.reduce((a, id) => a + (s.estruturas[id]?.hp ?? 0), 0) * defenseBonus(s);
}

/** Resolve o ataque e aplica no estado. */
export function resolveAttack(s: GameState, r: Rng = defaultRng): AttackReport {
  const forca = Math.round(hordeStrength(hordeDia(s)) * (0.85 + r() * 0.3));
  const defesa = Math.round(defenseTotal(s));
  const rep: AttackReport = { dia: s.dia, forca, defesa, danoDefesas: {}, piso: [], danificadas: [], roubado: {}, segurou: true };

  // defesas absorvem na ordem: barricada → portão → muralha → posto (o bônus do posto reduz o dano efetivo)
  let restante = forca / defenseBonus(s);
  for (const id of ['barricada', 'portao', 'muralha', 'posto_guarda'] as StructId[]) {
    const e = s.estruturas[id];
    if (!e || e.nv <= 0 || e.hp <= 0 || restante <= 0) continue;
    const d = Math.min(e.hp, restante); // absorve com toda a vida atual...
    const perde = Math.min(d, Math.max(0, e.hp - pisoHp(s, id))); // ...mas só perde até o piso
    if (perde < d) rep.piso!.push(id);
    e.hp = Math.round(e.hp - perde);
    restante -= d;
    if (perde > 0) rep.danoDefesas[id] = Math.round(perde);
  }

  // segurou, mas apanhou muito: a horda arrasta material pelas frestas (≥40% da vida das defesas → 5% a 15%)
  const vidaDef = (['barricada', 'portao', 'muralha', 'posto_guarda'] as StructId[]).reduce((a, id) => a + ((s.estruturas[id]?.nv ?? 0) > 0 ? maxHp(s, id) : 0), 0);
  const perdido = Object.values(rep.danoDefesas).reduce((a, v) => a + (v ?? 0), 0);
  if (restante <= 0 && vidaDef > 0 && perdido / vidaDef >= BLOODMOON.danoPesado) {
    const frac = Math.min(BLOODMOON.rouboPesadoMax, 0.05 + (perdido / vidaDef - BLOODMOON.danoPesado) * 0.5);
    for (const k of ['madeira', 'sucata', 'comida', 'agua', 'pano'] as ResId[]) {
      const q = Math.floor((s.res[k] ?? 0) * frac);
      if (q > 0) { s.res[k] -= q; rep.roubado[k] = q; }
    }
  }

  if (restante > 0) {
    rep.segurou = false;
    // a horda entrou: danifica estruturas internas e rouba recursos
    const internas = STRUCT_IDS.filter((id) => !DEFENSES.includes(id) && id !== 'fogueira' && (s.estruturas[id]?.nv ?? 0) > 0 && !s.estruturas[id]!.danificada);
    let n = Math.max(1, Math.floor((restante * BLOODMOON.vazamento) / BLOODMOON.danoPorEstrutura));
    while (n-- > 0 && internas.length) {
      const id = internas.splice(Math.floor(r() * internas.length), 1)[0];
      s.estruturas[id]!.danificada = true;
      rep.danificadas.push(id);
    }
    const frac = Math.min(0.4, restante / (forca * 2));
    for (const k of ['madeira', 'sucata', 'comida', 'agua'] as ResId[]) {
      const q = Math.floor(s.res[k] * frac);
      if (q > 0) { s.res[k] -= q; rep.roubado[k] = q; }
    }
  }

  s.ultimoAtaque = rep;
  if (rep.segurou) s.stats = { ...(s.stats ?? { luasSeguradas: 0 }), luasSeguradas: (s.stats?.luasSeguradas ?? 0) + 1 };
  const levou = Object.keys(rep.roubado).length > 0;
  addLog(s, rep.segurou
    ? `<b>Lua de Sangue</b> (dia ${s.dia}): a horda bateu nas defesas e recuou${levou ? ', mas castigou tanto que arrastou material' : ''}. Repare o que foi danificado.`
    : `<b>Lua de Sangue</b> (dia ${s.dia}): a horda passou! ${rep.danificadas.map((id) => STRUCTS[id].nome).join(', ') || 'nada'} danificado.`);
  return rep;
}

/** Útil pra UI: defesas com vida cheia × atual. */
export function defenseStatus(s: GameState): { id: StructId; hp: number; max: number }[] {
  return DEFENSES.filter((id) => lvl(s, id) > 0).map((id) => ({ id, hp: s.estruturas[id]!.hp, max: maxHp(s, id) }));
}
