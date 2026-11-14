import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/data/maps';
import { RARIDADE, ZOMBIES, raridadeDe } from '../src/data/zombies';
import { rolarPresenca, tiposDoMapa } from '../src/game/presenca';

const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

describe('raridade de aparição', () => {
  it('cada zumbi comum tem raridade; base comum sempre vem', () => {
    expect(raridadeDe('errante')).toBe('comum');
    expect(raridadeDe('malandro')).toBe('raro');
    expect(raridadeDe('blindado')).toBe('incomum');
    expect(RARIDADE.comum.chance).toBe(1);
    expect(RARIDADE.raro.chance).toBeLessThan(RARIDADE.incomum.chance);
  });
  it('todos=true mantém as ondas do mapa', () => {
    const m = MAPS.lapa, p = rolarPresenca(m, Math.random, true);
    expect(p.ausentes).toEqual([]);
    expect(p.ondas).toEqual(m.ondas);
  });
  it('ausente é trocado por um presente; tamanho das ondas e chefes ficam iguais', () => {
    const m = MAPS.lapa;
    const p = rolarPresenca(m, seq([0.99, 0.1, 0.7, 0.3, 0.6, 0.95, 0.2])); // 0.99 > tudo: só comuns sobrevivem ao 1º sorteio
    for (const [id, l] of Object.entries(m.ondas)) l.forEach((w, i) => {
      expect(p.ondas[id][i]).toHaveLength(w.length);
      w.forEach((k, j) => { if (ZOMBIES[k].boss) expect(p.ondas[id][i][j]).toBe(k); });
    });
    const usados = new Set(Object.values(p.ondas).flat(2).filter((k) => !ZOMBIES[k].boss));
    for (const a of p.ausentes) expect(usados.has(a)).toBe(false);
    for (const k of usados) expect(p.presentes).toContain(k);
  });
  it('em média ~raros 55%, incomuns 80%', () => {
    const m = MAPS.lapa, n = 2000, cont: Record<string, number> = {};
    for (let i = 0; i < n; i++) for (const k of rolarPresenca(m).presentes) cont[k] = (cont[k] ?? 0) + 1;
    for (const k of tiposDoMapa(m)) expect(Math.abs((cont[k] ?? 0) / n - RARIDADE[raridadeDe(k)].chance)).toBeLessThan(0.06);
  });
});
