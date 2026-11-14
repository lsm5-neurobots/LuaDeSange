import { describe, it, expect } from 'vitest';
import {
  upBlock, upGolpe, upCost, golpeNv, equipGolpe, equipBlock, unequipGolpe, equippedGolpes, slotsOf, memberLv,
} from '../src/game/golpes';
import { GOLPES, GOLPE_IDS, GOLPE_MAX, golpeCd, golpeCusto, golpeDano, golpeSlots } from '../src/data/golpes';
import { teamMember } from '../src/game/team';
import { fresh, rich } from './helpers';

const withHero = () => { const s = rich(fresh()); s.hero = { nome: 'Zé' }; return s; };

describe('golpes: dados', () => {
  it('nomes originais, custo e progressão coerentes', () => {
    expect(GOLPE_IDS.length).toBeGreaterThanOrEqual(6);
    for (const id of GOLPE_IDS) {
      expect(golpeCd(id, GOLPE_MAX)).toBeLessThan(golpeCd(id, 1));
      expect(golpeDano(id, 2)).toBeGreaterThanOrEqual(golpeDano(id, 1));
      expect(Object.keys(golpeCusto(id, 1)).length).toBeGreaterThan(0);
    }
    const nomes = GOLPE_IDS.map((id) => GOLPES[id].nome.toLowerCase()).join(' ');
    for (const proibido of ['getsuga', 'chidori', 'rasengan']) expect(nomes).not.toContain(proibido);
  });
  it('slots por nível: 1 · 2 (nv 3) · 3 (nv 6)', () => {
    expect([1, 2, 3, 5, 6, 10].map(golpeSlots)).toEqual([1, 1, 2, 2, 3, 3]);
  });
});

describe('golpes: liberar e upar', () => {
  it('bloqueia por nível do personagem e por recursos', () => {
    const s = withHero();
    s.heroLv = 1;
    expect(upBlock(s, 'hero', 'corte_lunar')).toBe('nivel');
    expect(upBlock(s, 'hero', 'meia_lua')).toBeNull();
    s.heroLv = 10;
    expect(upBlock(s, 'hero', 'corte_lunar')).toBeNull();
    for (const k of Object.keys(s.res) as (keyof typeof s.res)[]) s.res[k] = 0;
    expect(upBlock(s, 'hero', 'corte_lunar')).toBe('recursos');
    expect(upBlock(s, 'ninguem', 'meia_lua')).toBe('membro');
  });
  it('liberar cobra, equipa sozinho no slot livre e upar sobe até o máximo', () => {
    const s = withHero();
    s.heroLv = 20;
    const c = upCost(s, 'hero', 'meia_lua'), antes = s.res.madeira;
    expect(upGolpe(s, 'hero', 'meia_lua')).toBe(true);
    expect(s.res.madeira).toBe(antes - (c.madeira ?? 0));
    expect(golpeNv(s, 'hero', 'meia_lua')).toBe(1);
    expect(equippedGolpes(s, 'hero')).toEqual([{ id: 'meia_lua', nv: 1 }]);
    for (let i = 0; i < 10; i++) upGolpe(s, 'hero', 'meia_lua');
    expect(golpeNv(s, 'hero', 'meia_lua')).toBe(GOLPE_MAX);
    expect(upBlock(s, 'hero', 'meia_lua')).toBe('max');
    expect(upGolpe(s, 'hero', 'meia_lua')).toBe(false);
  });
  it('recrutas têm golpes próprios', () => {
    const s = withHero();
    s.recs.push({ id: 'r1', tipo: 'capoeirista', skin: 'media', nome: 'Mestre', lv: 4, xp: 0 });
    expect(memberLv(s, 'r1')).toBe(4);
    expect(upGolpe(s, 'r1', 'mao_trovao')).toBe(true);
    expect(golpeNv(s, 'r1', 'mao_trovao')).toBe(1);
    expect(golpeNv(s, 'hero', 'mao_trovao')).toBe(0);
  });
});

describe('golpes: equipar nos slots', () => {
  it('respeita slots, troca e monta a lista da expedição', () => {
    const s = withHero();
    s.heroLv = 3; // 2 slots
    expect(slotsOf(s, 'hero')).toBe(2);
    expect(equipBlock(s, 'hero', 'meia_lua')).toBe('bloqueado');
    upGolpe(s, 'hero', 'meia_lua');
    upGolpe(s, 'hero', 'grito_frevo');
    upGolpe(s, 'hero', 'benzedura'); // liberado, mas sem slot: não equipa
    expect(equippedGolpes(s, 'hero').map((g) => g.id)).toEqual(['meia_lua', 'grito_frevo']);
    expect(equipBlock(s, 'hero', 'benzedura')).toBe('slots');
    expect(equipGolpe(s, 'hero', 'benzedura')).toBe(false);
    unequipGolpe(s, 'hero', 'meia_lua');
    expect(equipGolpe(s, 'hero', 'benzedura')).toBe(true);
    expect(equippedGolpes(s, 'hero').map((g) => g.id)).toEqual(['grito_frevo', 'benzedura']);
    // vai pro TeamMember da expedição
    expect(teamMember(s, 'hero')!.golpes).toEqual([{ id: 'grito_frevo', nv: 1 }, { id: 'benzedura', nv: 1 }]);
  });
  it('save antigo sem golpes não quebra', () => {
    const s = withHero();
    delete (s as any).golpes;
    expect(equippedGolpes(s, 'hero')).toEqual([]);
    expect(golpeNv(s, 'hero', 'meia_lua')).toBe(0);
    expect(upGolpe(s, 'hero', 'meia_lua')).toBe(true);
  });
});
