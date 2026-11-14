import { describe, it, expect } from 'vitest';
import { applyExpedition } from '../src/game/rewards';
import { claimConquista, claimTodas, conqStatus, lembrancaBonus, lembProgresso } from '../src/game/conquistas';
import { CONQUISTAS } from '../src/data/conquistas';
import { LEMBRANCA, LEMBRANCAS } from '../src/data/lembrancas';
import { buildExpedition } from '../src/game/team';
import { migrate } from '../src/game/state';
import { fresh, result } from './helpers';

const nunca = () => 0.999;

describe('conquistas', () => {
  it('ids únicos e textos sem plural quebrado', () => {
    const ids = CONQUISTAS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CONQUISTAS.find((c) => c.id === 'z_corredor_1000')!.desc).toBe('Mate 1.000 Corredores.');
    expect(CONQUISTAS.find((c) => c.id === 'z_percussionista_100')!.desc).toBe('Mate 100 Zumbis Percussionistas.');
    expect(CONQUISTAS.find((c) => c.id === 'b_brutamonte_1')!.desc).toBe('Derrote o Brutamonte.');
  });
  it('bate a meta na expedição, avisa e só paga ao resgatar', () => {
    const s = fresh();
    s.expedicoes = 5;
    s.derrotados = { errante: 95 };
    const r = applyExpedition(s, result({ abatesPorTipo: { errante: 10 } }), nunca);
    expect(r.conquistas).toContain('Caçador de Errantes I');
    expect(conqStatus(s, 'z_errante_100')).toBe('pronta');
    const sucata = s.res.sucata;
    expect(claimConquista(s, 'z_errante_100')).toBe(true);
    expect(s.res.sucata).toBe(sucata + 10);
    expect(conqStatus(s, 'z_errante_100')).toBe('resgatada');
    expect(claimConquista(s, 'z_errante_100')).toBe(false);
    expect(conqStatus(s, 'z_errante_1000')).toBe('aberta');
  });
  it('resgatar todas', () => {
    const s = fresh();
    s.derrotados = { errante: 100, corredor: 100 };
    s.expedicoes = 10;
    expect(claimTodas(s)).toBeGreaterThanOrEqual(4); // errante, corredor, limpa-rua, andarilho
  });
});

describe('lembranças', () => {
  it('chaveiro do Galo: vencer o Açougueiro sem kit', () => {
    const s = fresh();
    s.expedicoes = 3;
    const r1 = applyExpedition(s, result({ chefe: true, kitsUsados: 2 }), nunca);
    expect(r1.lembrancas?.map((l) => l.id) ?? []).not.toContain('lb_galo');
    const r2 = applyExpedition(s, result({ chefe: true, kitsUsados: 0 }), nunca);
    expect(r2.lembrancas!.map((l) => l.id)).toContain('lb_galo');
    expect(s.lembrancas.lb_galo).toBe(s.dia);
  });
  it('outro mapa não conta', () => {
    const s = fresh();
    s.expedicoes = 3;
    applyExpedition(s, result({ mapId: 'olinda', chefe: true, kitsUsados: 0 }), nunca);
    expect(s.lembrancas.lb_galo).toBeUndefined();
    expect(s.lembrancas.lb_boneco).toBeDefined();
  });
  it('sombrinha: 3 vitórias no Marco Zero, com progresso', () => {
    const s = fresh();
    s.expedicoes = 3;
    applyExpedition(s, result(), nunca);
    applyExpedition(s, result({ sucesso: false }), nunca);
    expect(lembProgresso(s, LEMBRANCA.lb_sombrinha)).toEqual([1, 3]);
    applyExpedition(s, result(), nunca);
    applyExpedition(s, result(), nunca);
    expect(s.lembrancas.lb_sombrinha).toBeDefined();
  });
  it('fitinha só em vitória na Lua de Sangue', () => {
    const s = fresh();
    s.expedicoes = 3;
    applyExpedition(s, result({ mapId: 'pelourinho' }), nunca);
    expect(s.lembrancas.lb_fitinha).toBeUndefined();
    applyExpedition(s, result({ mapId: 'pelourinho', lua: true }), nunca);
    expect(s.lembrancas.lb_fitinha).toBeDefined();
  });
  it('bônus entram na expedição', () => {
    const s = fresh();
    const antes = buildExpedition(s, ['hero'], null).bonus;
    s.lembrancas = { lb_galo: 1, lb_torre: 1, lb_fitinha: 1 };
    expect(lembrancaBonus(s)).toMatchObject({ dano: 0.04, vida: 0.04, chaves: 1 });
    const b = buildExpedition(s, ['hero'], null).bonus;
    expect(b.dano).toBeCloseTo(antes.dano + 0.04);
    expect(b.vida).toBeCloseTo(antes.vida + 0.04);
    expect(b.chaves).toBe(antes.chaves + 1);
  });
  it('3 por mapa e save antigo migra vitórias', () => {
    for (const m of ['marco_zero', 'olinda', 'pelourinho', 'veropeso', 'lapa']) expect(LEMBRANCAS.filter((l) => l.mapa === m)).toHaveLength(3);
    const s = migrate({ hero: { nome: 'x' }, vencidos: ['marco_zero'] })!;
    expect(s.statsMapa.marco_zero.vit).toBe(1);
    expect(s.lembrancas).toEqual({});
  });
});
