import { describe, it, expect } from 'vitest';
import { fresh, result } from './helpers';
import { buy, buyBlock, itemCount, marketList, takeItems, returnItems } from '../src/game/market';
import { planKeys } from '../src/expedition/plan';
import { applyExpedition } from '../src/game/rewards';

describe('mercado', () => {
  it('compra item com recursos e guarda no inventário', () => {
    const s = fresh(); s.res.sucata = 12;
    expect(buy(s, 'chave_comum')).toBe(true);
    expect(itemCount(s, 'chave_comum')).toBe(1);
    expect(s.res.sucata).toBe(6);
  });
  it('bloqueia sem recursos', () => {
    const s = fresh(); s.res.sucata = 0;
    expect(buyBlock(s, 'chave_comum')).toBe('recursos');
    expect(buy(s, 'chave_comum')).toBe(false);
  });
  it('arma comprada entra no arsenal como comum', () => {
    const s = fresh(); s.res.madeira = 20; s.res.sucata = 20;
    const n = s.armas.length;
    expect(buy(s, 'arma_bastao')).toBe(true);
    expect(s.armas.length).toBe(n + 1);
    expect(s.armas[s.armas.length - 1].tier).toBe('comum');
  });
  it('itens que pedem mapa vencido ficam escondidos', () => {
    const s = fresh();
    expect(marketList(s).some((m) => m.id === 'chave_raro')).toBe(false);
    s.vencidos = ['marco_zero'];
    expect(marketList(s).some((m) => m.id === 'chave_raro')).toBe(true);
  });
  it('levar e devolver itens da expedição', () => {
    const s = fresh(); s.itens = { kit_cura: 2, chave_comum: 3 };
    const got = takeItems(s, { kit_cura: 5, chave_comum: 1 });
    expect(got).toEqual({ kit_cura: 2, chave_comum: 1 });
    expect(itemCount(s, 'kit_cura')).toBe(0);
    returnItems(s, { kit_cura: 1 });
    expect(itemCount(s, 'kit_cura')).toBe(1);
  });
  it('chaves do plano viram chaves do motor', () => {
    expect(planKeys({ recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.35, isca: 0, itens: { chave_comum: 2, chave_militar: 1 } }))
      .toEqual({ comum: 2, medico: 0, militar: 1, raro: 0 });
  });
  it('o que sobrou volta ao inventário no resultado', () => {
    const s = fresh(); s.hero = { nome: 'H' } as any;
    applyExpedition(s, result({ itensSobra: { kit_cura: 2 } } as any));
    expect(itemCount(s, 'kit_cura')).toBe(2);
  });
});
