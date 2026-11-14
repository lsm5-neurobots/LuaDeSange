import { newGame, type GameState } from '../src/game/state';
import { STRUCTS, type StructId } from '../src/data/structures';
import type { ExpeditionResult } from '../src/expedition/types';

/** Save novo SEM a Barraca inicial (os testes de mecânica partem de 0 camas; newGame real começa com Barraca nv1). */
export function fresh(): GameState {
  const s = newGame(1_000);
  delete s.estruturas.barraca;
  return s;
}

/** Coloca uma estrutura pronta no nível dado, com HP cheio. */
export function setStruct(s: GameState, id: StructId, nv: number, extra: { hp?: number; danificada?: boolean } = {}): void {
  s.estruturas[id] = { nv, hp: extra.hp ?? STRUCTS[id].hp?.(nv) ?? 0, danificada: extra.danificada ?? false };
}

export function rich(s: GameState): GameState {
  for (const k of Object.keys(s.res) as (keyof GameState['res'])[]) s.res[k] = 1000;
  return s;
}

export function result(over: Partial<ExpeditionResult> = {}): ExpeditionResult {
  return {
    mapId: 'marco_zero', sucesso: true, areaAlcancada: 3, totalAreas: 12, arenasLimpas: 3, totalArenas: 12,
    abates: 10, abatesPorTipo: { errante: 10 }, loot: { madeira: 5, sucata: 5 }, projetos: [],
    miniBoss: false, chefe: false, lua: false, duracao: 100, teamIds: ['hero'], ...over,
  };
}
