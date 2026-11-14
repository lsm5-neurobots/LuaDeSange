import { describe, it, expect } from 'vitest';
import { GRADES, gradeOf, gradeMul, petMul } from '../src/data/grades';
import {
  planEncounters, missionPerf, recruitChance, rollRecruit, timeScore, makeMission, missionText, progressText,
  CHANCE_MIN, CHANCE_MAX, T_BOM, T_RUIM,
} from '../src/game/encounters';
import { migrate } from '../src/game/state';
import { buildExpedition } from '../src/game/team';
import { MAPS } from '../src/data/maps';
import { makeRng } from '../src/core/rng';
import { fresh, setStruct } from './helpers';

const MZ = MAPS.marco_zero;

describe('notas E..S', () => {
  it('nota multiplica atributos; sem nota = C', () => {
    expect(gradeOf({})).toBe('C');
    expect(gradeMul('S')).toBeGreaterThan(gradeMul('C'));
    expect(gradeMul('E')).toBeLessThan(1);
    expect(petMul('S')).toBe(2);
  });
  it('save antigo: recrutas e pets sem nota viram C', () => {
    const s = migrate({ ...fresh(), recs: [{ id: 'a', tipo: 'vigia', skin: 'media', nome: 'V', lv: 1, xp: 0 }], pets: [{ id: 'p', tipo: 'gato', variante: '', nome: 'Pipoca' }], missoes: undefined })!;
    expect(s.recs[0].nota).toBe('C');
    expect(s.pets[0].nota).toBe('C');
    expect(s.missoes).toEqual({ ok: 0, falhou: 0 });
  });
  it('nota do pet escala o bônus na expedição', () => {
    const mk = (nota: 'E' | 'S') => { const s = fresh(); s.hero = { nome: 'H' }; s.expedicoes = 5; s.pets.push({ id: 'p', tipo: 'cachorro', variante: '', nome: 'C', nota }); return buildExpedition(s, ['hero'], 'p'); };
    expect(mk('S').bonus.dano).toBeCloseTo(1.2);
    expect(mk('E').bonus.dano).toBeCloseTo(1.05);
  });
});

describe('planejamento dos encontros', () => {
  it('1ª expedição sempre tem um sobrevivente com missão fácil, fora da 1ª área e de chefes', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const [p, ...rest] = planEncounters(fresh(), MZ, { lua: false, rand: makeRng(seed) });
      expect(rest).toHaveLength(0);
      expect(p.kind).toBe('rec');
      expect(p.area).toBe('alfandega');
      expect(p.missao.tipo).toBe('cacar');
      expect(p.nota).toBe('E');
    }
  });
  it('2ª expedição sem pet sempre tem pet', () => {
    const s = fresh(); s.expedicoes = 1;
    expect(planEncounters(s, MZ, { lua: false, rand: makeRng(3) })[0].kind).toBe('pet');
  });
  it('depois, só com chance; repetidos podem aparecer; sem cama nem vaga no alojamento só pet', () => {
    const s = fresh(); s.expedicoes = 5;
    expect(planEncounters(s, MZ, { lua: false, rand: () => 0.999 })).toHaveLength(0);
    s.pets = (['cachorro', 'gato', 'capivara', 'jabuti', 'papagaio', 'sagui'] as const).map((t, i) => ({ id: 'p' + i, tipo: t, variante: '', nome: t }));
    // pets repetidos podem aparecer (alimentam a fusão)
    expect(planEncounters(s, MZ, { lua: false, rand: () => 0.01 })[0].kind).toBe('pet');
    // sem cama, mas com vaga no alojamento: recruta pode aparecer
    let rec = 0;
    for (let seed = 1; seed <= 40; seed++) if (planEncounters(s, MZ, { lua: false, rand: makeRng(seed) })[0]?.kind === 'rec') rec++;
    expect(rec).toBeGreaterThan(0);
    // alojamento lotado (tipos variados, nenhum fecha fusão): só pet
    s.alojamento = Array.from({ length: 6 }, (_, i) => ({ id: 'a' + i, tipo: (['vigia', 'serralheiro', 'pedreira', 'lenhador', 'catadora', 'agricultor'] as const)[i], skin: 'media', nome: 'X', lv: 1, xp: 0, nota: 'E' as const }));
    for (let seed = 1; seed <= 40; seed++) expect(planEncounters(s, MZ, { lua: false, rand: makeRng(seed) })[0]?.kind ?? 'pet').toBe('pet');
    setStruct(s, 'barraca', 1);
    rec = 0;
    for (let seed = 1; seed <= 40; seed++) if (planEncounters(s, MZ, { lua: false, rand: makeRng(seed) })[0]?.kind === 'rec') rec++;
    expect(rec).toBeGreaterThan(0);
  });
  it('debug força tipo, missão e nota', () => {
    const s = fresh(); s.expedicoes = 9;
    const [p] = planEncounters(s, MZ, { lua: false, rand: makeRng(1), force: 'pet', forceMissao: 'escolta', forceNota: 'S' });
    expect(p).toMatchObject({ kind: 'pet', nota: 'S' });
    expect(p.missao.tipo).toBe('escolta');
    expect(p.ate).toBe(p.area);
  });
  it('caçada pede um zumbi que existe nas ondas do prazo', () => {
    const ids = Object.keys(MZ.ondas);
    for (let seed = 1; seed <= 20; seed++) {
      const { missao, ate } = makeMission(MZ, ids, 2, 'cacar', makeRng(seed));
      if (missao.tipo !== 'cacar') throw new Error('esperava caçada');
      const waves = [...MZ.ondas[ids[2]], ...MZ.ondas[ate]].flat();
      expect(waves.filter((k) => k === missao.alvo).length).toBeGreaterThanOrEqual(missao.n);
      expect(missionText(missao)).toMatch(/^Derrote \d/);
    }
  });
});

describe('desempenho → chance de recrutar', () => {
  const cacar = { tipo: 'cacar', alvo: 'errante', n: 4 } as const;
  it('tempo: 100% até T_BOM, 0% em T_RUIM', () => {
    expect(timeScore(0)).toBe(1);
    expect(timeScore(T_BOM)).toBe(1);
    expect(timeScore((T_BOM + T_RUIM) / 2)).toBeCloseTo(0.5);
    expect(timeScore(T_RUIM + 10)).toBe(0);
  });
  it('caçada: rápido e com vida cheia = 100%; incompleta e lenta cai', () => {
    expect(missionPerf({ m: cacar, st: { feito: 4, meta: 4 }, t: 10, squadHp: 1 })).toBeCloseTo(1);
    const meia = missionPerf({ m: cacar, st: { feito: 2, meta: 4 }, t: 200, squadHp: 0.5 });
    expect(meia).toBeCloseTo(0.25 + 0 + 0.1);
    expect(missionPerf({ m: cacar, st: { feito: 4, meta: 4 }, t: 200, squadHp: 1 })).toBeLessThan(1);
  });
  it('escolta: vida do protegido pesa 70%; morto = 0', () => {
    const m = { tipo: 'escolta', hp: 100 } as const;
    expect(missionPerf({ m, st: { feito: 0, meta: 1, hp: 100, hpMax: 100 }, t: 0, squadHp: 1 })).toBeCloseTo(1);
    expect(missionPerf({ m, st: { feito: 0, meta: 1, hp: 50, hpMax: 100 }, t: 0, squadHp: 0 })).toBeCloseTo(0.35);
    expect(missionPerf({ m, st: { feito: 0, meta: 1, hp: 0, hpMax: 100 }, t: 0, squadHp: 1 })).toBe(0);
    expect(progressText(m, { feito: 0, meta: 1, hp: 62.4, hpMax: 100 })).toBe('vida 62/100');
  });
  it('chance sobe com o desempenho, S é mais difícil que E, limites 5%..95%', () => {
    expect(recruitChance('C', 0.9)).toBeGreaterThan(recruitChance('C', 0.4));
    expect(recruitChance('S', 0.8)).toBeLessThan(recruitChance('E', 0.8));
    expect(recruitChance('C', 0.5)).toBeCloseTo(0.6);
    expect(recruitChance('E', 1)).toBe(CHANCE_MAX);
    expect(recruitChance('S', 0)).toBe(CHANCE_MIN);
    expect(recruitChance('E', 1, true)).toBe(0);
  });
  it('isca/presente soma pontos percentuais, respeitando o teto', () => {
    expect(recruitChance('C', 0.5, false, 10)).toBeCloseTo(0.7);
    expect(recruitChance('E', 1, false, 50)).toBe(CHANCE_MAX);
    expect(recruitChance('S', 0, true, 50)).toBe(0);
  });
  it('rolagem: sucesso quando o sorteio cai dentro da chance', () => {
    expect(rollRecruit(0.6, () => 0.59).ok).toBe(true);
    expect(rollRecruit(0.6, () => 0.6).ok).toBe(false);
    const r = makeRng(7); let ok = 0;
    for (let i = 0; i < 10000; i++) if (rollRecruit(0.3, r).ok) ok++;
    expect(ok / 10000).toBeGreaterThan(0.27);
    expect(ok / 10000).toBeLessThan(0.33);
  });
});
