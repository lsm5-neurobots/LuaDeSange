import { describe, it, expect } from 'vitest';
import { STRUCTS } from '../src/data/structures';
import { BLOODMOON } from '../src/data/bloodmoon';
import { scaleBag } from '../src/game/economy';
import {
  buildBlock, startBuild, tickObra, tickProduction, collect, pendingTotal,
  repairCost, repair, needsRepair, repairDiscount, maxHp,
} from '../src/game/shelter';
import type { Bag } from '../src/data/resources';
import { fresh, rich, setStruct } from './helpers';

describe('buildBlock', () => {
  it('liberado quando há recursos', () => {
    expect(buildBlock(fresh(), 'barraca')).toBeNull();
  });
  it('max', () => {
    const s = rich(fresh());
    setStruct(s, 'fogueira', 5);
    setStruct(s, 'barraca', 5);
    expect(buildBlock(s, 'barraca')).toBe('max');
  });
  it('trava da fogueira: nível não pode passar da fogueira', () => {
    const s = rich(fresh());
    setStruct(s, 'barraca', 1);
    expect(buildBlock(s, 'barraca')).toBe('fogueira');
    expect(buildBlock(s, 'fogueira')).toBeNull(); // a própria fogueira evolui
  });
  it('obra em andamento bloqueia', () => {
    const s = rich(fresh());
    s.obra = { id: 'barraca', nv: 1, fim: 9e15 };
    expect(buildBlock(s, 'horta')).toBe('obra');
  });
  it('recursos insuficientes', () => {
    const s = fresh();
    s.res.madeira = 0;
    expect(buildBlock(s, 'barraca')).toBe('recursos');
  });
});

describe('obra', () => {
  it('startBuild cobra e agenda; bloqueado não cobra', () => {
    const s = fresh();
    const custo = STRUCTS.barraca.custo(1);
    expect(startBuild(s, 'barraca', 10_000)).toBe(true);
    expect(s.res.pano).toBe(4 - (custo.pano ?? 0));
    expect(s.res.madeira).toBe(12 - (custo.madeira ?? 0));
    expect(s.obra).toEqual({ id: 'barraca', nv: 1, fim: 10_000 + STRUCTS.barraca.obra(1) * 1000 });
    const antes = { ...s.res };
    expect(startBuild(s, 'horta', 10_000)).toBe(false); // obra em andamento
    expect(s.res).toEqual(antes);
  });
  it('tickObra: antes do fim nada acontece, depois conclui', () => {
    const s = fresh();
    startBuild(s, 'barraca', 0);
    const fim = s.obra!.fim;
    expect(tickObra(s, fim - 1)).toBeNull();
    expect(s.obra).not.toBeNull();
    expect(s.estruturas.barraca).toBeUndefined();
    expect(tickObra(s, fim)).toBe('barraca');
    expect(s.obra).toBeNull();
    expect(s.estruturas.barraca).toEqual({ nv: 1, hp: 0, danificada: false });
  });
  it('defesas nascem com HP cheio e evoluir reseta o HP', () => {
    const s = rich(fresh());
    startBuild(s, 'barricada', 0);
    tickObra(s, 1e9);
    expect(s.estruturas.barricada).toEqual({ nv: 1, hp: STRUCTS.barricada.hp!(1), danificada: false });
    setStruct(s, 'fogueira', 2);
    s.estruturas.barricada!.hp = 10;
    startBuild(s, 'barricada', 0);
    tickObra(s, 1e9);
    expect(s.estruturas.barricada).toEqual({ nv: 2, hp: STRUCTS.barricada.hp!(2), danificada: false });
  });
  it('evoluir estrutura interna danificada a conserta', () => {
    const s = rich(fresh());
    setStruct(s, 'fogueira', 2);
    setStruct(s, 'coletor', 1, { danificada: true });
    startBuild(s, 'coletor', 0);
    tickObra(s, 1e9);
    expect(s.estruturas.coletor!.danificada).toBe(false);
  });
});

describe('produção', () => {
  it('acumula por minuto', () => {
    const s = fresh();
    setStruct(s, 'coletor', 1);
    tickProduction(s, 10);
    expect(s.prodBuf.coletor).toBeCloseTo(6);
  });
  it('respeita o cap', () => {
    const s = fresh();
    setStruct(s, 'coletor', 1);
    tickProduction(s, 10_000);
    expect(s.prodBuf.coletor).toBe(STRUCTS.coletor.prod!.cap(1));
  });
  it('minutos <= 0 não faz nada', () => {
    const s = fresh();
    setStruct(s, 'coletor', 1);
    tickProduction(s, 0);
    tickProduction(s, -5);
    expect(s.prodBuf.coletor).toBeUndefined();
  });
  it('estrutura danificada não produz', () => {
    const s = fresh();
    setStruct(s, 'coletor', 1, { danificada: true });
    tickProduction(s, 10);
    expect(s.prodBuf.coletor ?? 0).toBe(0);
  });
  it('estrutura sem produção (barraca) ignorada', () => {
    const s = fresh();
    setStruct(s, 'barraca', 1);
    tickProduction(s, 10);
    expect(s.prodBuf.barraca).toBeUndefined();
  });
  it('bônus do gerador (+10% por nível)', () => {
    const s = fresh();
    setStruct(s, 'coletor', 1);
    setStruct(s, 'gerador', 2);
    tickProduction(s, 10);
    expect(s.prodBuf.coletor).toBeCloseTo(7.2);
  });
  it('agricultor dá +25% só na horta', () => {
    const s = fresh();
    s.recs.push({ id: 'r1', tipo: 'agricultor', skin: 'media', nome: 'X', lv: 1, xp: 0 });
    setStruct(s, 'horta', 1);
    setStruct(s, 'coletor', 1);
    tickProduction(s, 10);
    expect(s.prodBuf.horta).toBeCloseTo(0.4 * 10 * 1.25);
    expect(s.prodBuf.coletor).toBeCloseTo(6);
  });
});

describe('collect', () => {
  it('coleta só a parte inteira e mantém a fração no buffer', () => {
    const s = fresh();
    s.prodBuf.coletor = 6.7;
    const agua = s.res.agua;
    const got = collect(s);
    expect(got).toEqual({ agua: 6 });
    expect(s.res.agua).toBe(agua + 6);
    expect(s.prodBuf.coletor).toBeCloseTo(0.7);
    expect(Number.isInteger(s.res.agua)).toBe(true);
  });
  it('abaixo de 1 não coleta nada', () => {
    const s = fresh();
    s.prodBuf.coletor = 0.99;
    expect(collect(s)).toEqual({});
    expect(s.prodBuf.coletor).toBe(0.99);
  });
  it('ponto de coleta rende pano extra (1 a cada 3)', () => {
    const s = fresh();
    s.prodBuf.ponto_coleta = 7;
    const got = collect(s);
    expect(got).toEqual({ sucata: 7, pano: 2 });
    expect(s.res.pano).toBe(4 + 2);
  });
  it('coleta de uma estrutura só mexe nela', () => {
    const s = fresh();
    s.prodBuf.coletor = 5;
    s.prodBuf.horta = 5;
    collect(s, 'coletor');
    expect(s.prodBuf.coletor).toBe(0);
    expect(s.prodBuf.horta).toBe(5);
  });
  it('pendingTotal soma as partes inteiras', () => {
    const s = fresh();
    s.prodBuf.coletor = 2.9;
    s.prodBuf.horta = 3.5;
    expect(pendingTotal(s)).toBe(5);
  });
});

describe('reparo', () => {
  it('defesa intacta ou inexistente não precisa de reparo', () => {
    const s = fresh();
    expect(needsRepair(s, 'barricada')).toBe(false);
    setStruct(s, 'barricada', 1);
    expect(needsRepair(s, 'barricada')).toBe(false);
    expect(repairCost(s, 'barricada')).toEqual({});
    expect(repair(s, 'barricada')).toBe(false);
  });
  it('defesa com HP perdido: custo proporcional e repara até o máximo', () => {
    const s = rich(fresh());
    setStruct(s, 'barricada', 1, { hp: 70 }); // perdeu 50
    expect(needsRepair(s, 'barricada')).toBe(true);
    const esperado = scaleBag(BLOODMOON.reparoPor100 as Bag, 0.5);
    expect(repairCost(s, 'barricada')).toEqual(esperado);
    const antes = s.res.madeira;
    expect(repair(s, 'barricada')).toBe(true);
    expect(s.estruturas.barricada!.hp).toBe(maxHp(s, 'barricada'));
    expect(s.res.madeira).toBe(antes - (esperado.madeira ?? 0));
  });
  it('custo mínimo de 0.34 de 100 HP para perdas pequenas', () => {
    const s = fresh();
    setStruct(s, 'barricada', 1, { hp: 119 });
    expect(repairCost(s, 'barricada')).toEqual(scaleBag(BLOODMOON.reparoPor100 as Bag, 0.34));
  });
  it('interna danificada: custo base × nível, e volta a produzir', () => {
    const s = rich(fresh());
    setStruct(s, 'coletor', 2, { danificada: true });
    expect(needsRepair(s, 'coletor')).toBe(true);
    expect(repairCost(s, 'coletor')).toEqual(scaleBag(BLOODMOON.reparoInterno as Bag, 2));
    expect(repair(s, 'coletor')).toBe(true);
    expect(s.estruturas.coletor!.danificada).toBe(false);
    expect(needsRepair(s, 'coletor')).toBe(false);
  });
  it('sem recursos: repair falha e não altera nada', () => {
    const s = fresh();
    s.res.madeira = 0;
    setStruct(s, 'coletor', 1, { danificada: true });
    expect(repair(s, 'coletor')).toBe(false);
    expect(s.estruturas.coletor!.danificada).toBe(true);
    expect(s.res.agua).toBe(4);
  });
  it('desconto da bancada (10%/nível) e da pedreira (x0.75), com piso 0.3', () => {
    const s = fresh();
    expect(repairDiscount(s)).toBe(1);
    setStruct(s, 'bancada', 2);
    expect(repairDiscount(s)).toBeCloseTo(0.8);
    setStruct(s, 'coletor', 5, { danificada: true });
    expect(repairCost(s, 'coletor')).toEqual(scaleBag(BLOODMOON.reparoInterno as Bag, 5 * 0.8));
    s.recs.push({ id: 'r1', tipo: 'pedreira', skin: 'media', nome: 'P', lv: 1, xp: 0 });
    expect(repairDiscount(s)).toBeCloseTo(0.6);
    setStruct(s, 'bancada', 5);
    expect(repairDiscount(s)).toBeCloseTo(0.375);
    s.recs[0].tipo = 'vigia';
    expect(repairDiscount(s)).toBeCloseTo(0.5);
  });
});
