// Raridade de aparição (BEST-RAR): a cada expedição, cada tipo comum do mapa é sorteado pela raridade dele
// (data/zombies.ts RARIDADE). Quem não veio é trocado nas ondas por outro tipo presente (da mesma onda, se der),
// então a dificuldade fica igual e só o bestiário fica um pouco mais difícil de completar. Chefes sempre vêm.
import type { MapDef } from '../data/maps';
import { RARIDADE, ZOMBIES, raridadeDe, type ZombieId } from '../data/zombies';
import { rng as defaultRng, type Rng } from '../core/rng';

export interface Presenca { ondas: Record<string, ZombieId[][]>; presentes: ZombieId[]; ausentes: ZombieId[] }

/** Tipos comuns (não chefe) que o mapa tem nas ondas. */
export function tiposDoMapa(map: MapDef): ZombieId[] {
  const s = new Set<ZombieId>();
  for (const l of Object.values(map.ondas)) for (const w of l ?? []) for (const k of w) if (!ZOMBIES[k]?.boss) s.add(k);
  return [...s];
}

/** Sorteia quem aparece nesta expedição e reescreve as ondas. `todos` = sem sorteio (debug/testes). */
export function rolarPresenca(map: MapDef, rand: Rng = defaultRng, todos = false): Presenca {
  const tipos = tiposDoMapa(map);
  const presentes = todos ? tipos : tipos.filter((k) => rand() < RARIDADE[raridadeDe(k)].chance);
  // nunca fica vazio: garante pelo menos um tipo comum (o mais frequente do mapa)
  if (!presentes.length && tipos.length) presentes.push(tipos.find((k) => raridadeDe(k) === 'comum') ?? tipos[0]);
  const ok = new Set(presentes), base = presentes.filter((k) => raridadeDe(k) === 'comum');
  const pool = base.length ? base : presentes;
  const ondas: Record<string, ZombieId[][]> = {};
  for (const [id, l] of Object.entries(map.ondas)) {
    ondas[id] = (l ?? []).map((w) => {
      const daOnda = w.filter((k) => ok.has(k));
      return w.map((k) => (ZOMBIES[k]?.boss || ok.has(k) ? k : (daOnda.length ? daOnda : pool)[Math.floor(rand() * (daOnda.length ? daOnda : pool).length)]));
    });
  }
  return { ondas, presentes, ausentes: tipos.filter((k) => !ok.has(k)) };
}

/** Debug: `?todos` desliga o sorteio (todos os tipos vêm). */
export const semSorteio = (): boolean => typeof location !== 'undefined' && /[?&]todos\b/.test(location.search);
