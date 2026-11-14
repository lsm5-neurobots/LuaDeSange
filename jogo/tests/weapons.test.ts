import { describe, it, expect } from 'vitest';
import {
  craftBlock, craft, equip, equipped, craftCost, bestOwned, tierCap, forcaCap, upgradeBlock, upgradeTier, upgradeCost,
  forjaBlock, forja, forjaCost, addFoundWeapon, addProjeto, MAX_COPIAS, nextTierOf,
} from '../src/game/weapons';
import { recipe, forcaMult, PROJETOS_TIER, FORCA_MAX } from '../src/data/weapons';
import { fresh, rich, setStruct } from './helpers';

describe('oficina: fabricar (só comum)', () => {
  it('craftBlock: oficina, projeto, recursos e cópias', () => {
    const s = rich(fresh());
    expect(craftBlock(s, 'bastao')).toBe('serralheria'); // sem oficina
    setStruct(s, 'serralheria', 5);
    expect(craftBlock(s, 'pistola')).toBe('projeto');
    s.projetos.push('pistola');
    expect(craftBlock(s, 'pistola')).toBeNull();
    expect(craftBlock(s, 'bastao')).toBeNull(); // tem 1, cabe mais 1
    craft(s, 'bastao');
    expect(craftBlock(s, 'bastao')).toBe('max');
    const p = fresh(); setStruct(p, 'serralheria', 5); p.res.sucata = 0;
    expect(craftBlock(p, 'bastao')).toBe('recursos');
  });
  it('craft cria arma comum força 1, cobra e não mexe no equipado', () => {
    const s = fresh();
    setStruct(s, 'serralheria', 1);
    s.res.madeira = 100; s.res.sucata = 100;
    const custo = craftCost(s, 'bastao', 'comum');
    const it = craft(s, 'bastao')!;
    expect(it.tier).toBe('comum');
    expect(it.nv).toBe(1);
    expect(s.armas).toHaveLength(2);
    expect(s.equip.hero).toBe('w-inicial');
    expect(s.res.sucata).toBe(100 - (custo.sucata ?? 0));
  });
  it('craft bloqueado retorna null e não cobra', () => {
    const s = fresh();
    const antes = { ...s.res };
    expect(craft(s, 'bastao')).toBeNull();
    expect(s.res).toEqual(antes);
  });
});

describe('oficina: evoluir raridade com projetos', () => {
  it('tierCap segue o nível da oficina', () => {
    const s = fresh();
    expect(tierCap(s, 'bastao')).toBeNull();
    setStruct(s, 'serralheria', recipe('bastao', 'incomum').serralheria);
    expect(tierCap(s, 'bastao')).toBe('incomum');
    setStruct(s, 'serralheria', 5);
    expect(tierCap(s, 'bastao')).toBe('lunar');
    expect(tierCap(s, 'laser')).toBe('lunar');
  });
  it('upgradeBlock: oficina → projeto → recursos → livre', () => {
    const s = rich(fresh());
    setStruct(s, 'serralheria', recipe('bastao', 'incomum').serralheria - 1);
    expect(upgradeBlock(s, 'w-inicial')).toBe('serralheria');
    setStruct(s, 'serralheria', 5);
    expect(upgradeBlock(s, 'w-inicial')).toBe('projeto');
    addProjeto(s, 'bastao', PROJETOS_TIER.incomum);
    expect(upgradeBlock(s, 'w-inicial')).toBeNull();
    const p = fresh(); setStruct(p, 'serralheria', 5); addProjeto(p, 'bastao', 5); p.res.sucata = 0;
    expect(upgradeBlock(p, 'w-inicial')).toBe('recursos');
  });
  it('upgradeTier mantém id/equipamento, gasta projetos e recursos, para no lunar', () => {
    const s = rich(fresh());
    setStruct(s, 'serralheria', 5);
    addProjeto(s, 'bastao', 17); // incomum 2 + raro 5 + lunar 10
    const custo = upgradeCost(s, s.armas[0]);
    const antes = s.res.sucata;
    const w = upgradeTier(s, 'w-inicial')!;
    expect(w.id).toBe('w-inicial');
    expect(w.tier).toBe('incomum');
    expect(s.equip.hero).toBe('w-inicial');
    expect(s.projetosQtd.bastao).toBe(15);
    expect(s.res.sucata).toBe(antes - (custo.sucata ?? 0));
    upgradeTier(s, 'w-inicial'); // raro (−5)
    upgradeTier(s, 'w-inicial'); // lunar (−10)
    expect(w.tier).toBe('lunar');
    expect(s.projetosQtd.bastao).toBe(0);
    expect(nextTierOf(w)).toBeNull();
    expect(upgradeBlock(s, 'w-inicial')).toBe('max');
    expect(upgradeTier(s, 'w-inicial')).toBeNull();
  });
});

describe('oficina: forjar força', () => {
  it('forcaCap = nível da oficina + 1 (máx 5 fora da forja lunar)', () => {
    const s = fresh();
    expect(forcaCap(s)).toBe(1);
    setStruct(s, 'serralheria', 2);
    expect(forcaCap(s)).toBe(3);
    setStruct(s, 'serralheria', 5);
    expect(forcaCap(s)).toBe(5);
  });
  it('forja sobe a força até o teto da oficina e cobra', () => {
    const s = rich(fresh());
    expect(forjaBlock(s, 'w-inicial')).toBe('serralheria');
    setStruct(s, 'serralheria', 1);
    const c = forjaCost(s, s.armas[0]), antes = s.res.sucata;
    expect(forja(s, 'w-inicial')!.nv).toBe(2);
    expect(s.res.sucata).toBe(antes - (c.sucata ?? 0));
    expect(forjaBlock(s, 'w-inicial')).toBe('serralheria');
    setStruct(s, 'serralheria', 5);
    forja(s, 'w-inicial'); forja(s, 'w-inicial'); forja(s, 'w-inicial');
    expect(s.armas[0].nv).toBe(5);
    expect(forjaBlock(s, 'w-inicial')).toBe('lunar'); // ★6+ só com a arma lunar
  });
  it('forja lunar: arma lunar com Oficina nv 5 vai de ★5 a ★10, cobrando fragmentos', () => {
    const s = rich(fresh());
    s.armas[0] = { id: 'w-inicial', familia: 'laser', tier: 'lunar', nv: 5 };
    s.res.sucata = 5000; // forja lunar: 80 × k de sucata (1200 no total)
    setStruct(s, 'serralheria', 4);
    expect(forcaCap(s, s.armas[0])).toBe(5);
    expect(forjaBlock(s, 'w-inicial')).toBe('serralheria');
    setStruct(s, 'serralheria', 5);
    expect(forcaCap(s, s.armas[0])).toBe(FORCA_MAX);
    expect(forjaCost(s, s.armas[0]).fragmento_lunar).toBe(1);
    const frag = s.res.fragmento_lunar;
    for (let i = 0; i < 5; i++) forja(s, 'w-inicial');
    expect(s.armas[0].nv).toBe(10);
    expect(frag - s.res.fragmento_lunar).toBe(1 + 1 + 2 + 2 + 3);
    expect(forjaBlock(s, 'w-inicial')).toBe('max');
    expect(forcaMult(10)).toBeCloseTo(1.98);
  });
  it('forcaMult cresce com o nível', () => {
    expect(forcaMult(undefined)).toBe(1);
    expect(forcaMult(3)).toBeGreaterThan(forcaMult(2));
    expect(forcaMult(99)).toBe(forcaMult(FORCA_MAX));
    expect(forcaMult(5)).toBeCloseTo(1.48);
  });
});

describe('armas achadas e equipar', () => {
  it('addFoundWeapon: sempre comum; acima do limite vira projeto', () => {
    const s = fresh();
    const a = addFoundWeapon(s, 'pistola')!;
    expect(a.tier).toBe('comum');
    expect(s.projetos).toContain('pistola');
    addFoundWeapon(s, 'pistola');
    expect(s.armas.filter((w) => w.familia === 'pistola')).toHaveLength(MAX_COPIAS);
    expect(addFoundWeapon(s, 'pistola')).toBeNull();
    expect(s.projetosQtd.pistola).toBe(1);
  });
  it('bestOwned pega a maior raridade', () => {
    const s = fresh();
    s.armas.push({ id: 'r', familia: 'bastao', tier: 'raro' });
    expect(bestOwned(s, 'bastao')!.id).toBe('r');
  });
  it('serralheiro reduz o custo', () => {
    const s = fresh();
    const base = craftCost(s, 'bastao', 'incomum');
    s.recs.push({ id: 'r', tipo: 'serralheiro', skin: 'media', nome: 'S', lv: 1, xp: 0 });
    const desc = craftCost(s, 'bastao', 'incomum');
    expect(desc.sucata!).toBeLessThan(base.sucata!);
  });
  it('equip: atribui, ignora arma inexistente e move de dono', () => {
    const s = fresh();
    s.armas.push({ id: 'x', familia: 'bastao', tier: 'raro' });
    equip(s, 'r1', 'inexistente');
    expect(s.equip.r1).toBeUndefined();
    equip(s, 'r1', 'x');
    expect(s.equip.r1).toBe('x');
    equip(s, 'hero', 'x');
    expect(s.equip.hero).toBe('x');
    expect(s.equip.r1).toBeUndefined();
  });
  it('equipped devolve arma ou a mão padrão', () => {
    const s = fresh();
    expect(equipped(s, 'hero').id).toBe('w-inicial');
    expect(equipped(s, 'ninguem').id).toBe('mao');
  });
});
