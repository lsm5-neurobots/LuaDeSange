// Meta de balanceamento (jogador típico de tools/balanceSim.ts: 2 sessões de 25 min + 8 h de loop offline por dia).
// Roda poucas sementes e poucos dias pra ficar rápido; a tabela completa sai de `npx vite-node tools/balance.ts`.
import { describe, it, expect } from 'vitest';
import { correr, med } from '../tools/balanceSim';
import { ameaca } from '../src/data/balance';

describe('balanceamento · jogador típico', () => {
  const runs = [0, 1, 2, 3].map((i) => correr(1000 + i * 7919, 5));

  it('1ª expedição alcança pelo menos a área 2 (mediana)', () => {
    expect(med(runs.map((r) => r.primeira))).toBeGreaterThanOrEqual(2);
  });

  it('Marco Zero cai por volta do 3º dia real (2,3–4,2), nunca no 1º', () => {
    const dias = runs.map((r) => r.chefe.marco_zero ?? 99);
    expect(Math.min(...dias)).toBeGreaterThan(1.5);
    expect(med(dias)).toBeGreaterThanOrEqual(2.3);
    expect(med(dias)).toBeLessThanOrEqual(4.2);
  });

  it('antes do chefe, a área típica sobe dia a dia', () => {
    const tip = [0, 1, 2].map((d) => med(runs.map((r) => r.linhas[d].tipica)));
    expect(tip[1]).toBeGreaterThan(tip[0]);
    expect(tip[2]).toBeGreaterThanOrEqual(tip[1]);
  });

  it('a dificuldade cresce pelo mapa e pela arena, não pelos dias', () => {
    expect(ameaca('marco_zero', 5)).toBeGreaterThan(ameaca('marco_zero', 0));
    expect(ameaca('olinda', 0)).toBeGreaterThan(ameaca('marco_zero', 0));
    expect(ameaca('veropeso', 0)).toBeGreaterThan(ameaca('pelourinho', 0));
    expect(ameaca('lapa', 0)).toBeGreaterThan(ameaca('veropeso', 0));
  });
});
