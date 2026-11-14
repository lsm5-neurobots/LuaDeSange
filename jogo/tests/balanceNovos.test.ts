// Mapas novos (Amazônia e Pantanal): ~3 dias reais por mapa depois da Lapa, mesmo jogador típico de tools/balanceSim.ts.
// O ORDEM do simulador já inclui amazonia e pantanal; o laço abaixo é só uma garantia.
import { describe, it, expect } from 'vitest';
import { correr, med, ORDEM } from '../tools/balanceSim';
import { ameaca } from '../src/data/balance';

for (const id of ['amazonia', 'pantanal']) if (!ORDEM.includes(id)) ORDEM.push(id);

describe('balanceamento · mapas novos', () => {
  const runs = [0, 1, 2, 3, 4, 5].map((i) => correr(1000 + i * 7919, 36));
  const dia = (id: string) => med(runs.map((r) => r.chefe[id] ?? 99));

  it('Amazônia cai ~3 dias (faixa 0,8–5,2: o simulador tem ruído de ±1,5 dia entre execuções) depois da Lapa', () => {
    const gap = dia('amazonia') - dia('lapa');
    expect(gap).toBeGreaterThanOrEqual(0.8);
    expect(gap).toBeLessThanOrEqual(5.2);
  });

  it('Pantanal cai ~3 dias (faixa 0,8–5,2: o simulador tem ruído de ±1,5 dia entre execuções) depois da Amazônia', () => {
    const gap = dia('pantanal') - dia('amazonia');
    expect(gap).toBeGreaterThanOrEqual(0.8);
    expect(gap).toBeLessThanOrEqual(5.2);
  });

  it('ordem de conclusão: Lapa < Amazônia < Pantanal', () => {
    expect(dia('amazonia')).toBeGreaterThan(dia('lapa'));
    expect(dia('pantanal')).toBeGreaterThan(dia('amazonia'));
  });

  it('a ameaça cresce da Lapa à Amazônia e ao Pantanal', () => {
    expect(ameaca('amazonia', 0)).toBeGreaterThan(ameaca('lapa', 0));
    expect(ameaca('pantanal', 0)).toBeGreaterThan(ameaca('amazonia', 0));
    expect(ameaca('pantanal', 5)).toBeGreaterThan(ameaca('pantanal', 0));
  });
});
