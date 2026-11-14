// Combo automático variado do squad: escolhe golpes avulsos marcados na arte (campo `atk` = peso, `fin` = finalizador;
// armas de fogo usam `gunMelee` de perto). Regras: sequência de 3–4 golpes, nunca o mesmo golpe 3× seguidas,
// e o último da sequência é um finalizador que derruba (`knock`) ou lança (`launch`).
import type { AnimDef } from '../art/legacy';
import { rnd, type Fighter, type World } from './world';

type Mem = { chain: number; len: number; hist: string[]; tgt: unknown };
const mem = (f: Fighter): Mem => (f._st ??= { chain: 0, len: 3, hist: [], tgt: null }) as Mem;

function animsOf(w: World, f: Fighter): Record<string, AnimDef> {
  return f.rig === 'vigia' ? w.A.VIGIA.ANIMS : f.art!.F.ANIMS;
}

function weighted(list: [string, number][]): string | null {
  if (!list.length) return null;
  let r = rnd() * list.reduce((s, [, p]) => s + p, 0);
  for (const [a, p] of list) { r -= p; if (r <= 0) return a; }
  return list[list.length - 1][0];
}

/** Reinicia a sequência (alvo caiu, fugiu, lutador apanhou...). */
export function resetStrikes(f: Fighter): void { mem(f).chain = 0; }

/** Ainda no meio de uma sequência? */
export const inChain = (f: Fighter): boolean => mem(f).chain > 0;

/**
 * Próximo golpe da sequência, ou null se o personagem não tem golpes avulsos (usa o combo clássico).
 * Na abertura da sequência às vezes devolve o combo clássico inteiro (`combo`/`comboB`), que já termina pesado.
 */
export function nextStrike(w: World, f: Fighter): string | null {
  const A = animsOf(w, f), m = mem(f);
  const gun = f.fam === 'pistola' || f.fam === 'laser';
  const keys = Object.keys(A).filter((k) => (gun ? A[k].gunMelee : A[k].atk));
  if (!keys.length) return null;
  // trocou de alvo: começa sequência nova (a sequência sobrevive a um passo pra trás/reaproximação no mesmo alvo)
  if (m.tgt !== f.target) { m.chain = 0; m.tgt = f.target; }
  if (gun) { m.chain = 0; m.hist.push(keys[0]); return weighted(keys.map((k) => [k, A[k].gunMelee as number])); }
  if (m.chain === 0) {
    m.len = rnd() < 0.6 ? 5 : 4; // 3–4 golpes + finalizador
    if (rnd() < 0.18) { const cl = A.comboB && rnd() < 0.5 ? 'comboB' : 'combo'; if (A[cl]) { m.hist.push(cl); return cl; } }
  }
  const h = m.hist, rep = h.length >= 2 && h[h.length - 1] === h[h.length - 2] ? h[h.length - 1] : null;
  // finalizador no 3º/4º golpe — ou antes, se o alvo já está quase morto (fecha a sequência com estilo)
  const T = f.target, fin = m.chain >= m.len - 1 || (m.chain >= 1 && !!T && T.hp < T.maxhp * 0.35);
  let pool = keys.filter((k) => !!A[k].fin === fin && k !== rep);
  if (!pool.length) pool = keys.filter((k) => k !== rep);
  // finalizador: lançar só com alvo que pode subir; o resto derruba
  const pick = weighted(pool.map((k) => [k, (A[k].atk as number) * (fin && A[k].fin === 'launch' ? 1.2 : 1)]));
  if (!pick) return null;
  h.push(pick); if (h.length > 6) h.shift();
  m.chain = fin ? 0 : m.chain + 1;
  return pick;
}
