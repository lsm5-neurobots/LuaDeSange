import { describe, it, expect } from 'vitest';
import { BLOODMOON } from '../src/data/bloodmoon';
import { DEFENSES, STRUCT_IDS } from '../src/data/structures';
import { makeRng } from '../src/core/rng';
import {
  nextIsBloodMoon, msUntilBloodMoon, pendingBloodMoons, resolvePendingAttacks, attackWindow, hordeStrength, defenseBonus, defenseTotal, resolveAttack, PISO_DEFESA,
} from '../src/game/bloodmoon';
import { fresh, rich, setStruct } from './helpers';

const meio = () => 0.5; // força = exatamente hordeStrength

describe('Lua de Sangue pelo relógio real (LUA-01)', () => {
  const J = Date.UTC(2026, 10, 8, 12, 0, 0); // janela 12:00–12:30 UTC
  it('nextIsBloodMoon e msUntilBloodMoon seguem a janela', () => {
    expect(nextIsBloodMoon(undefined, J)).toBe(true);
    expect(nextIsBloodMoon(undefined, J - 1)).toBe(false);
    expect(nextIsBloodMoon(undefined, J + 30 * 60_000 - 1)).toBe(true);
    expect(nextIsBloodMoon(undefined, J + 30 * 60_000)).toBe(false);
    expect(msUntilBloodMoon(J - 3600_000)).toBe(3600_000);
    expect(msUntilBloodMoon(J + 10)).toBe(0);
    expect(msUntilBloodMoon(J + 30 * 60_000)).toBe(12 * 3600_000 - 30 * 60_000);
  });
  it('1 ataque por janela; antes da 1ª expedição só marca a janela', () => {
    const s = fresh();
    s.criadoEm = J - 3600_000;
    expect(pendingBloodMoons(s, J - 1)).toEqual([]);
    expect(pendingBloodMoons(s, J + 5)).toEqual([{ inicio: J, fim: J + 30 * 60_000 }]);
    expect(resolvePendingAttacks(s, J + 5, meio)).toEqual([]); // sem expedição: horda passa reto
    expect(s.luaAtacada).toBe(J);
    s.expedicoes = 1; s.luaAtacada = undefined;
    expect(resolvePendingAttacks(s, J + 5, meio)).toHaveLength(1);
    expect(resolvePendingAttacks(s, J + 20 * 60_000, meio)).toHaveLength(0);
    expect(attackWindow(s, J, meio)).toBeNull();
    // próxima janela (12 h depois) ataca de novo
    expect(resolvePendingAttacks(s, J + 12 * 3600_000 + 1, meio)).toHaveLength(1);
  });
  it('jogo fechado: no máximo as janelas das últimas 12 h 30', () => {
    const s = fresh();
    s.expedicoes = 3;
    const n = pendingBloodMoons(s, J + 60_000).length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(2);
    expect(resolvePendingAttacks(s, J + 60_000, meio)).toHaveLength(n);
  });
  it('forca da horda cresce com o dia', () => {
    expect(hordeStrength(0)).toBe(BLOODMOON.forcaBase);
    expect(hordeStrength(10)).toBe(BLOODMOON.forcaBase + 10 * BLOODMOON.forcaPorDia);
  });
});

describe('defesa', () => {
  it('bônus do posto e total somam HP das defesas', () => {
    const s = fresh();
    expect(defenseBonus(s)).toBe(1);
    expect(defenseTotal(s)).toBe(0);
    setStruct(s, 'barricada', 1);
    setStruct(s, 'portao', 1);
    expect(defenseTotal(s)).toBe(120 + 200);
    setStruct(s, 'posto_guarda', 2); // hp 140, +20%
    expect(defenseBonus(s)).toBeCloseTo(1.2);
    expect(defenseTotal(s)).toBeCloseTo((120 + 200 + 140) * 1.2);
  });
});

describe('resolveAttack', () => {
  it('defesa forte segura: só HP das defesas cai', () => {
    const s = rich(fresh());
    s.dia = 3;
    setStruct(s, 'fogueira', 5);
    setStruct(s, 'barricada', 1);
    setStruct(s, 'muralha', 5);
    setStruct(s, 'coletor', 3);
    setStruct(s, 'barraca', 2);
    const res0 = { ...s.res };
    const rep = resolveAttack(s, meio);
    expect(rep.segurou).toBe(true);
    expect(rep.forca).toBe(hordeStrength(3));
    expect(rep.danificadas).toEqual([]);
    expect(rep.roubado).toEqual({});
    expect(s.res).toEqual(res0);
    expect(s.estruturas.coletor!.danificada).toBe(false);
    expect(s.estruturas.barraca!.danificada).toBe(false);
    // barricada absorve primeiro (120), mas só perde até o piso de 35% (42 HP); sobra pra muralha
    expect(s.estruturas.barricada!.hp).toBe(42);
    expect(rep.danoDefesas.barricada).toBe(78);
    expect(rep.piso).toEqual(['barricada']);
    expect(s.estruturas.muralha!.hp).toBe(2500 - Math.round(hordeStrength(3) - 120));
    expect(s.ultimoAtaque).toBe(rep);
  });
  it('mínimo de vida: defesa nunca cai abaixo de PISO_DEFESA, mesmo quando a horda passa', () => {
    const s = fresh();
    s.dia = 40; s.vencidos = ['marco_zero', 'olinda', 'pelourinho', 'veropeso', 'lapa']; // horda pelo progresso (hordeDia)
    setStruct(s, 'barricada', 2); // 220 HP → piso 77
    setStruct(s, 'portao', 1); // 200 HP → piso 70
    const rep = resolveAttack(s, meio);
    expect(rep.segurou).toBe(false);
    expect(s.estruturas.barricada!.hp).toBe(Math.round(220 * PISO_DEFESA));
    expect(s.estruturas.portao!.hp).toBe(Math.round(200 * PISO_DEFESA));
    expect(rep.piso).toEqual(['barricada', 'portao']);
    // já no piso: segura com o que tem e não perde mais nada
    const rep2 = resolveAttack(s, meio);
    expect(s.estruturas.barricada!.hp).toBe(77);
    expect(rep2.danoDefesas.barricada).toBeUndefined();
  });
  it('defesa absorve só o necessário', () => {
    const s = fresh();
    s.dia = 1; // força 205
    setStruct(s, 'muralha', 5);
    const rep = resolveAttack(s, meio);
    expect(rep.segurou).toBe(true);
    expect(s.estruturas.muralha!.hp).toBe(2500 - 205);
    expect(rep.danoDefesas).toEqual({ muralha: 205 });
  });
  it('sem defesa: danifica internas e rouba recursos', () => {
    const s = rich(fresh());
    s.dia = 3; // força ~295 -> ~3 estruturas danificadas
    setStruct(s, 'fogueira', 3);
    for (const id of ['barraca', 'coletor', 'horta', 'bancada', 'serralheria'] as const) setStruct(s, id, 1);
    const rep = resolveAttack(s, makeRng(42));
    expect(rep.segurou).toBe(false);
    expect(rep.defesa).toBe(0);
    expect(rep.danificadas).toHaveLength(Math.floor(rep.forca / BLOODMOON.danoPorEstrutura));
    for (const id of rep.danificadas) expect(s.estruturas[id]!.danificada).toBe(true);
    expect(new Set(rep.danificadas).size).toBe(rep.danificadas.length);
    const danificadasTotal = STRUCT_IDS.filter((id) => s.estruturas[id]?.danificada);
    expect([...danificadasTotal].sort()).toEqual([...rep.danificadas].sort());
    expect(Object.keys(rep.roubado).length).toBeGreaterThan(0);
    for (const [k, q] of Object.entries(rep.roubado)) {
      expect(q).toBeGreaterThan(0);
      expect(s.res[k as keyof typeof s.res]).toBe(1000 - q!);
    }
    expect(s.res.pecas).toBe(1000); // só madeira/sucata/comida/agua são roubadas
  });
  it('roubo limitado a 40% do estoque', () => {
    const s = rich(fresh());
    s.dia = 10;
    resolveAttack(s, meio);
    expect(s.res.madeira).toBe(600);
  });
  it('fogueira nunca é danificada, nem defesas ficam "danificadas"', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = rich(fresh());
      s.dia = 30;
      setStruct(s, 'fogueira', 5);
      setStruct(s, 'barricada', 1);
      for (const id of STRUCT_IDS) if (!s.estruturas[id]) setStruct(s, id, 1);
      resolveAttack(s, makeRng(seed));
      expect(s.estruturas.fogueira!.danificada).toBe(false);
      for (const d of DEFENSES) expect(s.estruturas[d]!.danificada).toBe(false);
    }
  });
  it('nunca HP negativo nem recursos negativos (vários dias/sementes)', () => {
    for (let dia = 0; dia <= 60; dia += 3) {
      for (let seed = 1; seed <= 5; seed++) {
        const s = fresh();
        s.dia = dia;
        setStruct(s, 'barricada', 2);
        setStruct(s, 'portao', 1);
        setStruct(s, 'posto_guarda', 3);
        setStruct(s, 'coletor', 1);
        resolveAttack(s, makeRng(seed));
        for (const id of STRUCT_IDS) expect(s.estruturas[id]?.hp ?? 0).toBeGreaterThanOrEqual(0);
        for (const v of Object.values(s.res)) expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('mesmo seed produz mesmo resultado', () => {
    const a = fresh(), b = fresh();
    a.dia = b.dia = 9;
    setStruct(a, 'coletor', 1); setStruct(b, 'coletor', 1);
    expect(resolveAttack(a, makeRng(7))).toEqual(resolveAttack(b, makeRng(7)));
  });
  it('posto de guarda reduz o dano efetivo às defesas', () => {
    const a = fresh(), b = fresh();
    a.dia = b.dia = 1;
    setStruct(a, 'muralha', 5);
    setStruct(b, 'muralha', 5);
    setStruct(b, 'posto_guarda', 5); // +50%
    resolveAttack(a, meio);
    resolveAttack(b, meio);
    expect(b.estruturas.muralha!.hp).toBeGreaterThan(a.estruturas.muralha!.hp);
  });
  it('adiciona entrada no log', () => {
    const s = fresh();
    resolveAttack(s, meio);
    expect(s.log.length).toBe(1);
  });
});
