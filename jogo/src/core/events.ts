// Bus de eventos tipado. Telas e sistemas conversam por aqui sem se importar entre si.
import type { ExpeditionResult } from '../expedition/types';
import type { AttackReport } from '../game/bloodmoon';

export interface GameEvents {
  'state:changed': void;
  'expedition:finished': ExpeditionResult;
  'bloodmoon:attack': AttackReport;
  'toast': { text: string; ms?: number };
}

type Handler<T> = (payload: T) => void;
const handlers: { [K in keyof GameEvents]?: Set<Handler<GameEvents[K]>> } = {};

export function on<K extends keyof GameEvents>(ev: K, fn: Handler<GameEvents[K]>): () => void {
  const set = (handlers[ev] ??= new Set() as any) as Set<Handler<GameEvents[K]>>;
  set.add(fn);
  return () => { set.delete(fn); };
}

export function emit<K extends keyof GameEvents>(ev: K, ...payload: GameEvents[K] extends void ? [] : [GameEvents[K]]): void {
  const set = handlers[ev] as Set<Handler<GameEvents[K]>> | undefined;
  set?.forEach((fn) => fn(payload[0] as GameEvents[K]));
}
