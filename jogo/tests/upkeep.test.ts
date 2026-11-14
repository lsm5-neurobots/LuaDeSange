import { describe, it, expect } from 'vitest';
import { fresh, setStruct, result } from './helpers';
import {
  bloqueioExpedicao, combatPenalty, consumoDia, custoExpedicao, famintos, manutencaoDia, pagarExpedicao, racaoEmergencia, tickDia, tickUpkeep,
} from '../src/game/upkeep';
import { applyExpedition } from '../src/game/rewards';
import { buildExpedition } from '../src/game/team';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };
const withRec = (s: ReturnType<typeof fresh>, n = 1) => {
  s.hero = { nome: 'H' } as any;
  for (let i = 0; i < n; i++) s.recs.push({ id: 'r' + i, tipo: 'lenhador', skin: '', nome: 'R' + i, lv: 1, xp: 0 });
  return s;
};

describe('upkeep', () => {
  it('consumo diário soma moradores e pets (squad come as provisões)', () => {
    const s = withRec(fresh(), 1); s.pets.push({ id: 'p', tipo: 'cachorro', variante: '', nome: 'c' });
    expect(consumoDia(s).agua).toBe(2.5);
    expect(consumoDia(s, ['hero']).agua).toBe(1.5);
  });
  it('tickUpkeep desconta só unidades inteiras e nunca fica negativo', () => {
    const s = fresh(); s.res.agua = 1;
    tickUpkeep(s, 30 * 60000);
    expect(s.res.agua).toBe(1);
    tickUpkeep(s, 3 * 3600000);
    expect(s.res.agua).toBe(0);
    tickUpkeep(s, 3 * 3600000);
    expect(s.res.agua).toBe(0);
  });
  it('provisões: custo por membro, bloqueio e pagamento', () => {
    const s = fresh();
    expect(custoExpedicao(s, ['hero', 'r0'], 'marco_zero')).toMatchObject({ agua: 2, comida: 2 });
    expect(custoExpedicao(s, ['hero'], 'olinda').gasolina).toBe(1);
    s.res.agua = 1;
    expect(bloqueioExpedicao(s, ['hero', 'r0'], 'marco_zero')).toMatch(/água/);
    expect(pagarExpedicao(s, ['hero', 'r0'], 'marco_zero')).toBe(false);
    s.res.agua = 4;
    expect(pagarExpedicao(s, ['hero'], 'marco_zero')).toBe(true);
    expect(s.res.agua).toBe(3);
  });
  it('ração de emergência: solo no 1º mapa nunca trava, mesmo zerado', () => {
    const s = withRec(fresh(), 1);
    s.res.agua = 0; s.res.comida = 0;
    expect(racaoEmergencia(s, ['hero'], 'marco_zero')).toEqual({ agua: 1, comida: 1 });
    expect(bloqueioExpedicao(s, ['hero'], 'marco_zero')).toBeNull();
    expect(pagarExpedicao(s, ['hero'], 'marco_zero')).toBe(true);
    expect(s.res.agua).toBe(0); expect(s.res.comida).toBe(0);
    // dupla ou mapa mais difícil continuam pedindo provisão
    expect(racaoEmergencia(s, ['hero', 'r0'], 'marco_zero')).toEqual({});
    expect(bloqueioExpedicao(s, ['hero', 'r0'], 'marco_zero')).toMatch(/água/);
    expect(bloqueioExpedicao(s, ['hero'], 'olinda')).toMatch(/água/);
    // com estoque, paga normal e a ração não entra
    s.res.agua = 3; s.res.comida = 3;
    expect(racaoEmergencia(s, ['hero'], 'marco_zero')).toEqual({});
    pagarExpedicao(s, ['hero'], 'marco_zero');
    expect(s.res.agua).toBe(2);
  });
  it('manutenção cresce com os níveis construídos', () => {
    const s = fresh();
    expect(manutencaoDia(s)).toEqual({});
    setStruct(s, 'barraca', 3); setStruct(s, 'coletor', 2);
    expect(manutencaoDia(s).madeira).toBe(1);
  });
  it('falta de comida: famintos, penalidades e recruta vai embora', () => {
    const s = withRec(fresh(), 2); s.res.comida = 0; s.res.agua = 50;
    tickDia(s, ['hero'], seq(0.9)); expect(s.fomeDias).toBe(1);
    expect(famintos(s)).toBe(true);
    expect(combatPenalty(s).vida).toBeLessThan(1);
    expect(buildExpedition(s, ['hero'], null).bonus.dano).toBeLessThan(1);
    tickDia(s, ['hero'], seq(0.9)); tickDia(s, ['hero'], seq(0.9));
    expect(s.recs.length).toBe(2);
    const r = tickDia(s, ['hero'], seq(0.1, 0));
    expect(r.foram.length).toBe(1);
    expect(s.recs.length).toBe(1);
    s.res.comida = 20; tickDia(s, ['hero']);
    expect(s.fomeDias).toBe(0);
  });
  it('applyExpedition fecha o dia e registra consumo no diário', () => {
    const s = withRec(fresh(), 1);
    s.expedicoes = 5;
    applyExpedition(s, result({ teamIds: ['hero'] }), seq(0.99));
    expect(s.log.some((l) => /consumiu/.test(l.html))).toBe(true);
    expect(s.res.agua).toBe(3);
  });
  it('jogo inicial sustentável com 1-2 moradores (coletor + horta cobrem o dia)', () => {
    const s = withRec(fresh(), 1);
    setStruct(s, 'coletor', 1); setStruct(s, 'horta', 1);
    expect(0.6 * 60).toBeGreaterThan(consumoDia(s).agua * 4);
  });
});
