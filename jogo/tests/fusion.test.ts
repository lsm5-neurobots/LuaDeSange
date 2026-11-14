import { describe, it, expect } from 'vitest';
import { ALOJAMENTO_VAGAS, FUSAO_PETS, FUSAO_RECRUTAS, NOTA_INICIAL, nextGrade, totalE, type Grade } from '../src/data/grades';
import { NOMES_F, NOMES_M, NOMES_PET, RECRUITS, nomesDe, type RecruitType } from '../src/data/recruits';
import {
  applyEncounters, encounterOdds, planEncounters, choiceLines, thanksLines, ENCOUNTER_CHANCE, ENCOUNTER_CHANCE_LUA, PET_SHARE,
  type EncounterOutcome, type EncounterPlan,
} from '../src/game/encounters';
import { alojar, darCama, destinoRecruta, fundir, fusionGroups } from '../src/game/fusion';
import { migrate, type Recruit, type Pet } from '../src/game/state';
import { novoLoop } from '../src/game/idleLoop';
import { MAPS } from '../src/data/maps';
import { makeRng } from '../src/core/rng';
import { fresh, setStruct } from './helpers';

const MZ = MAPS.marco_zero;
const rec = (id: string, over: Partial<Recruit> = {}): Recruit => ({ id, tipo: 'vigia', skin: 'media', nome: id, lv: 1, xp: 0, nota: 'E', ...over });
const pet = (id: string, over: Partial<Pet> = {}): Pet => ({ id, tipo: 'gato', variante: '', nome: id, nota: 'E', ...over });

describe('nota E fixa no recrutamento', () => {
  it('todo encontro (recruta e pet) chega com nota E, em qualquer mapa, com ou sem Lua', () => {
    expect(NOTA_INICIAL).toBe('E');
    for (const m of Object.values(MAPS)) for (const lua of [false, true]) for (let seed = 1; seed <= 15; seed++) {
      const s = fresh(); s.expedicoes = 3 + seed;
      for (const p of planEncounters(s, m, { lua, rand: makeRng(seed), force: seed % 2 ? 'rec' : 'pet' })) expect(p.nota).toBe('E');
    }
  });
  it('save antigo mantém as notas que já tinha', () => {
    const s = migrate({ ...fresh(), recs: [rec('a', { nota: 'A' })], pets: [pet('p', { nota: 'S' })], alojamento: undefined })!;
    expect(s.recs[0].nota).toBe('A');
    expect(s.pets[0].nota).toBe('S');
    expect(s.alojamento).toEqual([]);
  });
});

describe('fusão', () => {
  it('tabela decrescente 3/3/3/2/2 (108 E para um S) e cadeia E→D→C→B→A→S', () => {
    expect(FUSAO_RECRUTAS).toEqual({ E: 3, D: 3, C: 3, B: 2, A: 2, S: 0 });
    expect(FUSAO_PETS).toEqual(FUSAO_RECRUTAS);
    expect(totalE('S')).toBe(108);
    expect(totalE('D')).toBe(3);
    expect(['E', 'D', 'C', 'B', 'A', 'S'].map((g) => nextGrade(g as Grade))).toEqual(['D', 'C', 'B', 'A', 'S', null]);
  });
  it('grupos mostram progresso e só ficam prontos com N iguais (mesmo tipo e nota)', () => {
    const s = fresh();
    s.recs = [rec('a'), rec('c', { tipo: 'lenhador' }), rec('d', { nota: 'B' })];
    s.alojamento = [rec('e')];
    const gs = fusionGroups(s, 'rec');
    const vE = gs.find((g) => g.tipo === 'vigia' && g.nota === 'E')!;
    expect(vE.membros).toHaveLength(2);
    expect(vE.n).toBe(3);
    expect(gs.find((g) => g.tipo === 'vigia' && g.nota === 'B')!.n).toBe(2);
    expect(vE.pronta).toBe(false);
    expect(vE.prox).toBe('D');
    expect(fundir(s, 'rec', 'a')).toBeNull();
  });
  it('3 E iguais viram 1 D: quem fica herda o maior nível/XP e arma + golpes do de maior nível; os outros liberam cama', () => {
    const s = fresh();
    setStruct(s, 'barraca', 2); // 4 camas
    s.recs = [rec('a', { nome: 'Zé' }), rec('b', { lv: 7, xp: 30 })];
    s.alojamento = [rec('c', { lv: 3 })];
    s.armas.push({ id: 'w-b', familia: 'pistola', tier: 'comum' });
    s.equip.b = 'w-b';
    s.golpes.b = { nv: {}, eq: [] };
    s.equip.c = 'w-inicial';
    const r = fundir(s, 'rec', 'a')!;
    expect(r).toMatchObject({ de: 'E', para: 'D', cama: true });
    expect(s.recs).toHaveLength(1);
    expect(s.alojamento).toHaveLength(0);
    const k = s.recs[0];
    expect(k).toMatchObject({ id: 'a', nome: 'Zé', nota: 'D', lv: 7, xp: 30 });
    expect(s.equip.a).toBe('w-b');
    expect(s.golpes.a).toBeDefined();
    expect(s.equip.b).toBeUndefined();
    expect(s.equip.c).toBeUndefined(); // arma volta pro estoque
    expect(s.log[0].html).toMatch(/Fusão/);
  });
  it('com mais de N no grupo, usa o escolhido + os N−1 de maior nível; nota S não funde', () => {
    const s = fresh();
    s.recs = [rec('k'), ...Array.from({ length: 4 }, (_, i) => rec('x' + i, { lv: i + 1 }))];
    fundir(s, 'rec', 'k');
    expect(s.recs.find((r) => r.id === 'k')!.lv).toBe(4);
    expect(s.recs.filter((r) => r.nota === 'E').map((r) => r.id).sort()).toEqual(['x0', 'x1']);
    const b = fresh();
    b.recs = [rec('b0', { nota: 'B' }), rec('b1', { nota: 'B' })];
    expect(fundir(b, 'rec', 'b0')!.para).toBe('A');
    const t = fresh();
    t.recs = Array.from({ length: 5 }, (_, i) => rec('s' + i, { nota: 'S' }));
    expect(fundir(t, 'rec', 's0')).toBeNull();
  });
  it('resultado só do Alojamento sem cama livre continua no Alojamento', () => {
    const s = fresh(); // 0 camas
    s.alojamento = Array.from({ length: 3 }, (_, i) => rec('a' + i));
    const r = fundir(s, 'rec', 'a2')!;
    expect(r.cama).toBe(false);
    expect(s.alojamento.map((x) => x.id)).toEqual(['a2']);
    expect(s.alojamento[0].nota).toBe('D');
  });
  it('loop: membro consumido no squad vira quem ficou', () => {
    const s = fresh(); setStruct(s, 'barraca', 3);
    s.recs = Array.from({ length: 3 }, (_, i) => rec('r' + i));
    s.loop = novoLoop('marco_zero', ['hero', 'r2'], null, { recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.3, itens: {} });
    fundir(s, 'rec', 'r0');
    expect(s.loop.ids).toEqual(['hero', 'r0']);
  });
  it('pets: 3 iguais viram 1 da nota seguinte; pet do loop consumido vira o que ficou', () => {
    const s = fresh();
    s.pets = [pet('p0'), pet('p1'), pet('p2'), pet('c', { tipo: 'cachorro' })];
    s.loop = novoLoop('marco_zero', ['hero'], 'p2', { recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.3, itens: {} });
    const r = fundir(s, 'pet', 'p0')!;
    expect(r.para).toBe('D');
    expect(s.pets.map((p) => p.id)).toEqual(['p0', 'c']);
    expect(s.loop.pet).toBe('p0');
  });
});

describe('camas e Alojamento de espera', () => {
  it('sem cama vai pro Alojamento; cheio só entra quem completa uma fusão', () => {
    const s = fresh(); s.expedicoes = 4;
    expect(destinoRecruta(s, 'vigia', 'E')).toBe('alojamento');
    s.alojamento = [rec('a'), rec('b'), rec('c', { tipo: 'catadora' }), rec('d', { tipo: 'agricultor' }), rec('e', { tipo: 'lenhador' }), rec('f', { tipo: 'serralheiro' })];
    expect(s.alojamento.length).toBe(ALOJAMENTO_VAGAS);
    expect(destinoRecruta(s, 'pedreira', 'E')).toBeNull();
    expect(destinoRecruta(s, 'vigia', 'E')).toBe('alojamento'); // 2 vigias E + ele = fusão
    setStruct(s, 'barraca', 1);
    expect(destinoRecruta(s, 'pedreira', 'E')).toBe('cama');
  });
  it('alojar libera a cama; dar cama só com cama livre', () => {
    const s = fresh(); setStruct(s, 'barraca', 1); s.expedicoes = 3;
    s.recs = [rec('a'), rec('b')];
    expect(darCama(s, 'x')).toBe(false);
    expect(alojar(s, 'a')).toBe(true);
    expect(s.recs.map((r) => r.id)).toEqual(['b']);
    expect(darCama(s, 'a')).toBe(true);
    expect(s.recs).toHaveLength(2);
  });
});

describe('chance de aparecer por mapa (fonte única)', () => {
  it('1ª expedição: recruta garantido; 2ª sem pet: pet garantido; depois a chance base dividida', () => {
    const s = fresh();
    expect(encounterOdds(s, MZ, { lua: false })).toMatchObject({ rec: 1, pet: 0, garantido: 'rec' });
    s.expedicoes = 1;
    expect(encounterOdds(s, MZ, { lua: false })).toMatchObject({ rec: 0, pet: 1, garantido: 'pet' });
    s.expedicoes = 5;
    const o = encounterOdds(s, MZ, { lua: false }), l = encounterOdds(s, MZ, { lua: true });
    expect(o.rec + o.pet).toBeCloseTo(ENCOUNTER_CHANCE);
    expect(o.pet).toBeCloseTo(ENCOUNTER_CHANCE * PET_SHARE);
    expect(l.rec + l.pet).toBeCloseTo(ENCOUNTER_CHANCE_LUA);
  });
  it('sem lugar pra recruta, toda a chance vai pro pet', () => {
    const s = fresh(); s.expedicoes = 5;
    s.alojamento = (['vigia', 'serralheiro', 'pedreira', 'lenhador', 'catadora', 'agricultor'] as RecruitType[]).map((t, i) => rec('a' + i, { tipo: t }));
    expect(encounterOdds(s, MZ, { lua: false })).toMatchObject({ rec: 0, pet: ENCOUNTER_CHANCE });
  });
  it('bate com o sorteio real de planEncounters', () => {
    const s = fresh(); s.expedicoes = 5; setStruct(s, 'barraca', 3);
    const r = makeRng(99), n = 20000, c = { rec: 0, pet: 0 };
    for (let i = 0; i < n; i++) { const p = planEncounters(s, MZ, { lua: true, rand: r })[0]; if (p) c[p.kind]++; }
    const o = encounterOdds(s, MZ, { lua: true });
    expect(c.rec / n).toBeCloseTo(o.rec, 1);
    expect(c.pet / n).toBeCloseTo(o.pet, 1);
  });
});

describe('fluxo do encontro: recusa e agradecimento', () => {
  const plan = (kind: 'rec' | 'pet'): EncounterPlan => ({ id: 'e', kind, recTipo: 'lenhador', petTipo: 'gato', skin: 'media', variante: '', nome: 'Tonho', nota: 'E', area: 'a', ate: 'a', missao: { tipo: 'vasculhar', n: 2 } });
  it('missão recusada não entra nem conta como falha', () => {
    const s = fresh(); s.expedicoes = 3; setStruct(s, 'barraca', 1);
    const o: EncounterOutcome = { plan: plan('rec'), ok: false, recusada: true, progresso: 'recusada', motivo: '', desempenho: 0, chance: 0, roll: 1 };
    const rw = applyEncounters(s, [o]);
    expect(rw).toMatchObject({ ok: 0, falhou: 0 });
    expect(s.recs).toHaveLength(0);
  });
  it('falas de escolha e de agradecimento existem pra recruta e pet', () => {
    expect(choiceLines(plan('rec'), true)[0].quem).toBe('hero');
    expect(choiceLines(plan('rec'), false)).toHaveLength(2);
    expect(thanksLines(plan('rec'))[0].texto).toMatch(/tchê|Bah/);
    expect(thanksLines(plan('pet')).length).toBeGreaterThan(0);
  });
});

describe('nomes por gênero', () => {
  it('cada tipo tem gênero e o encontro sorteia da lista certa', () => {
    expect(RECRUITS.enfermeira.genero).toBe('f');
    expect(RECRUITS.catadora.genero).toBe('f');
    expect(RECRUITS.pedreira.genero).toBe('f');
    expect(RECRUITS.lenhador.genero).toBe('m');
    for (const t of Object.keys(RECRUITS) as RecruitType[]) {
      const lista = RECRUITS[t].genero === 'f' ? NOMES_F : NOMES_M;
      expect(nomesDe(t)).toBe(lista);
      for (let seed = 1; seed <= 20; seed++) {
        const s = fresh(); s.expedicoes = 4;
        const p = planEncounters(s, MZ, { lua: false, rand: makeRng(seed * 13), force: 'rec' })[0];
        if (p.recTipo === t) expect(lista).toContain(p.nome);
      }
    }
    expect(NOMES_M.some((n) => NOMES_F.includes(n))).toBe(false);
  });
  it('pet repetido sorteia apelido de pet; o 1º do tipo leva o clássico', () => {
    const s = fresh(); s.expedicoes = 4;
    const p1 = planEncounters(s, MZ, { lua: false, rand: makeRng(3), force: 'pet' })[0];
    expect(p1.nome).not.toBe('');
    s.pets = (['cachorro', 'gato', 'capivara', 'jabuti', 'papagaio', 'sagui'] as const).map((t, i) => ({ id: 'p' + i, tipo: t, variante: '', nome: 'N' + i, nota: 'E' as const }));
    for (let seed = 1; seed <= 10; seed++) expect(NOMES_PET).toContain(planEncounters(s, MZ, { lua: false, rand: makeRng(seed), force: 'pet' })[0].nome);
  });
  it('saves antigos não são renomeados', () => {
    const s = migrate({ ...fresh(), recs: [rec('a', { nome: 'Russo', tipo: 'enfermeira' })] })!;
    expect(s.recs[0].nome).toBe('Russo');
  });
});
