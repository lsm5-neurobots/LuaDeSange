import { describe, it, expect } from 'vitest';
import { canPay, pay, gain, scaleBag, addBags } from '../src/game/economy';
import { fresh } from './helpers';

describe('economia', () => {
  it('canPay: suficiente, exato e insuficiente', () => {
    const s = fresh();
    expect(canPay(s, { madeira: 12 })).toBe(true);
    expect(canPay(s, { madeira: 13 })).toBe(false);
    expect(canPay(s, {})).toBe(true);
    expect(canPay(s, { madeira: 1, pecas: 1 })).toBe(false);
  });
  it('pay debita e retorna true', () => {
    const s = fresh();
    expect(pay(s, { madeira: 5, sucata: 2 })).toBe(true);
    expect(s.res.madeira).toBe(7);
    expect(s.res.sucata).toBe(6);
  });
  it('pay sem saldo não altera nada', () => {
    const s = fresh();
    expect(pay(s, { madeira: 5, pecas: 1 })).toBe(false);
    expect(s.res.madeira).toBe(12);
    expect(s.res.pecas).toBe(0);
  });
  it('gain soma e arredonda com multiplicador', () => {
    const s = fresh();
    gain(s, { madeira: 3, pecas: 2 });
    expect(s.res.madeira).toBe(15);
    expect(s.res.pecas).toBe(2);
    gain(s, { madeira: 5 }, 1.5); // 7.5 -> 8
    expect(s.res.madeira).toBe(23);
  });
  it('scaleBag arredonda, nunca negativo, não muta', () => {
    const b = { madeira: 5, sucata: 1 };
    expect(scaleBag(b, 0.5)).toEqual({ madeira: 3, sucata: 1 });
    expect(scaleBag(b, -2)).toEqual({ madeira: 0, sucata: 0 });
    expect(b).toEqual({ madeira: 5, sucata: 1 });
  });
  it('addBags une chaves e não muta os originais', () => {
    const a = { madeira: 1, sucata: 2 }, b = { sucata: 3, pano: 4 };
    expect(addBags(a, b)).toEqual({ madeira: 1, sucata: 5, pano: 4 });
    expect(a).toEqual({ madeira: 1, sucata: 2 });
    expect(b).toEqual({ sucata: 3, pano: 4 });
  });
});
