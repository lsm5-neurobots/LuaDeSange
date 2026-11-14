import { describe, it, expect } from 'vitest';
import { applyExpedition, xpToNext } from '../src/game/rewards';
import { makeRng } from '../src/core/rng';
import { fresh, result, setStruct } from './helpers';
import type { Grade } from '../src/data/grades';
import type { EncounterOutcome, EncounterPlan } from '../src/game/encounters';
import { comReforco } from '../src/game/team';
import { setStruct as _ss } from './helpers';

const nunca = () => 0.999;

function outcome(kind: 'rec' | 'pet', ok: boolean, nota: Grade): EncounterOutcome {
  const plan: EncounterPlan = kind === 'rec'
    ? { id: 'e1', kind, recTipo: 'capoeirista', skin: 'media', nome: 'Kel', nota, area: 'alfandega', ate: 'feira', missao: { tipo: 'cacar', alvo: 'errante', n: 3 } }
    : { id: 'e2', kind, petTipo: 'capivara', variante: '', nome: 'Mexerica', nota, area: 'alfandega', ate: 'alfandega', missao: { tipo: 'escolta', hp: 100 } };
  return { plan, ok, progresso: '3/3', motivo: 'missão cumprida', desempenho: 0.8, chance: 0.7, roll: ok ? 0.1 : 0.9 };
}
const XP = 10 * 4 + 3 * 4; // 10 errantes (xp 4) + área 3 * 4

describe('applyExpedition', () => {
  it('loot entra no estoque', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result({ loot: { madeira: 5, pecas: 2 } }), nunca);
    expect(s.res.madeira).toBe(17);
    expect(s.res.pecas).toBe(2);
    expect(r.loot).toEqual({ madeira: 5, pecas: 2 });
  });
  it('falha (squad caiu) perde metade (arredondando pra baixo)', () => {
    const s = fresh();
    s.expedicoes = 5;
    applyExpedition(s, result({ sucesso: false, loot: { madeira: 5, sucata: 4 } }), nunca);
    expect(s.res.madeira).toBe(12 + 2);
    expect(s.res.sucata).toBe(8 + 2);
    expect(s.vitorias).toBe(0);
  });
  it('recuar a tempo guarda o loot e as sobras', () => {
    const s = fresh();
    s.expedicoes = 5;
    applyExpedition(s, result({ sucesso: false, recuou: true, loot: { madeira: 5 }, itensSobra: { kit_cura: 2 } }), nunca);
    expect(s.res.madeira).toBe(12 + 5);
    expect(s.itens?.kit_cura ?? 0).toBe(2);
    expect(s.vitorias).toBe(0);
  });
  it('lenhador e catadora dão +20%', () => {
    const s = fresh();
    s.expedicoes = 5;
    s.recs.push({ id: 'a', tipo: 'lenhador', skin: 'media', nome: 'L', lv: 1, xp: 0 }, { id: 'b', tipo: 'catadora', skin: 'media', nome: 'C', lv: 1, xp: 0 });
    applyExpedition(s, result({ loot: { madeira: 10, sucata: 10 } }), nunca);
    expect(s.res.madeira).toBe(12 + 12);
    expect(s.res.sucata).toBe(8 + 12);
  });
  it('não muta o loot do resultado', () => {
    const s = fresh();
    s.expedicoes = 5;
    const res = result({ sucesso: false, loot: { madeira: 10 } });
    applyExpedition(s, res, nunca);
    expect(res.loot).toEqual({ madeira: 10 });
  });
  it('sem encontro no mapa não aparece recruta/pet no fim', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const s = fresh();
      const r = applyExpedition(s, result(), makeRng(seed));
      expect(r.novoRecruta).toBeNull();
      expect(r.novoPet).toBeNull();
      expect(s.recs).toHaveLength(0);
    }
  });
  it('encontro recrutado entra no abrigo com a nota; primeira expedição dispensa cama', () => {
    const s = fresh();
    const r = applyExpedition(s, result({ encontros: [outcome('rec', true, 'A')] }), nunca);
    expect(r.novoRecruta).not.toBeNull();
    expect(s.recs).toHaveLength(1);
    expect(s.recs[0]).toMatchObject({ tipo: 'capoeirista', nota: 'A', lv: 1 });
    expect(r.encontros).toHaveLength(1);
    expect(s.missoes).toEqual({ ok: 1, falhou: 0 });
  });
  it('encontro que não veio (rolagem falhou) não entra', () => {
    const s = fresh();
    const r = applyExpedition(s, result({ encontros: [outcome('rec', false, 'S')] }), nunca);
    expect(r.novoRecruta).toBeNull();
    expect(s.recs).toHaveLength(0);
    expect(s.missoes.falhou).toBe(1);
  });
  it('sem cama, depois da primeira, vai pro Alojamento de espera', () => {
    const s = fresh();
    s.expedicoes = 1;
    s.recs.push({ id: 'a', tipo: 'vigia', skin: 'media', nome: 'V', lv: 1, xp: 0 });
    const r = applyExpedition(s, result({ encontros: [outcome('rec', true, 'C')] }), nunca);
    expect(r.novoRecruta!.tipo).toBe('capoeirista');
    expect(r.alojado).toBe(true);
    expect(s.recs).toHaveLength(1);
    expect(s.alojamento).toHaveLength(1);
  });
  it('sem cama e Alojamento cheio vira "semCama"', () => {
    const s = fresh();
    s.expedicoes = 1;
    s.alojamento = Array.from({ length: 6 }, (_, i) => ({ id: 'a' + i, tipo: 'vigia' as const, skin: 'media', nome: 'V', lv: 1, xp: 0, nota: 'D' as const }));
    const r = applyExpedition(s, result({ encontros: [outcome('rec', true, 'C')] }), nunca);
    expect(r.novoRecruta).toBeNull();
    expect(r.semCama).toBe('capoeirista');
  });
  it('com cama livre, recruta entra', () => {
    const s = fresh();
    s.expedicoes = 1;
    setStruct(s, 'barraca', 1);
    s.recs.push({ id: 'a', tipo: 'vigia', skin: 'media', nome: 'V', lv: 1, xp: 0 });
    const r = applyExpedition(s, result({ encontros: [outcome('rec', true, 'B')] }), nunca);
    expect(r.novoRecruta!.tipo).toBe('capoeirista');
  });
  it('pet recrutado vira pet com nota', () => {
    const s = fresh();
    s.expedicoes = 1;
    const r = applyExpedition(s, result({ encontros: [outcome('pet', true, 'S')] }), nunca);
    expect(r.novoPet).toMatchObject({ tipo: 'capivara', nota: 'S' });
    expect(s.pets).toHaveLength(1);
  });
  it('xp do herói e level up', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result(), nunca);
    expect(r.xp).toBe(XP);
    expect(s.heroLv).toBe(1); // nv 2 custa 150 (curva 150 × nv², data/balance.ts)
    const r2 = applyExpedition(s, result({ abatesPorTipo: { errante: 40 } }), nunca); // 160 + 12
    expect(r2.xp).toBe(172);
    expect(s.heroLv).toBe(2);
    expect(s.heroXp).toBe(XP + 172 - xpToNext(1));
    expect(r2.ups).toHaveLength(1);
  });
  it('vários level ups de uma vez', () => {
    const s = fresh();
    s.expedicoes = 5;
    applyExpedition(s, result({ abatesPorTipo: { errante: 1000 } }), nunca); // 4000 + 12 = 4012 xp
    // custos: 150, 600, 1350 = 2100 -> nv4 com 1912 de sobra (nv 5 pede 2400)
    expect(s.heroLv).toBe(4);
    expect(s.heroXp).toBe(1912);
  });
  it('rodada offline (rend 0,6) rende 60% do xp e do loot', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result({ abatesPorTipo: { errante: 40 }, loot: { madeira: 10 } }), nunca, { rend: 0.6 });
    expect(r.xp).toBe(Math.round(172 * 0.6));
    expect(r.loot.madeira).toBe(6);
  });
  it('mapas seguintes dão mais xp por abate', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result({ mapId: 'olinda', abatesPorTipo: { errante: 10 } }), nunca);
    expect(r.xp).toBe(Math.round(4 * 1.6) * 10 + 12);
  });
  it('xp vai pro recruta no time e ignora ids desconhecidos', () => {
    const s = fresh();
    s.expedicoes = 5;
    s.recs.push({ id: 'rec1', tipo: 'vigia', skin: 'media', nome: 'V', lv: 1, xp: 0 });
    applyExpedition(s, result({ teamIds: ['hero', 'rec1', 'fantasma'], abatesPorTipo: { errante: 40 } }), nunca);
    expect(s.recs[0].lv).toBe(2);
    expect(s.recs[0].xp).toBe(172 - 150);
  });
  it('dia, expedicoes, vitorias e melhorArea', () => {
    const s = fresh();
    s.expedicoes = 5;
    s.melhorArea = 6;
    applyExpedition(s, result({ areaAlcancada: 4 }), nunca);
    expect(s.dia).toBe(1);
    expect(s.expedicoes).toBe(6);
    expect(s.vitorias).toBe(1);
    expect(s.melhorArea).toBe(6);
    applyExpedition(s, result({ areaAlcancada: 9, sucesso: false }), nunca);
    expect(s.melhorArea).toBe(9);
    expect(s.vitorias).toBe(1);
    expect(s.dia).toBe(2);
  });
  it('projetos: libera a família sem duplicar e cada um vira projeto de melhoria', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result({ projetos: ['pistola', 'pistola'] }), nunca);
    expect(s.projetos).toEqual(['pistola']);
    expect(s.projetosQtd.pistola).toBe(2);
    expect(r.projetosNovos).toHaveLength(2);
    applyExpedition(s, result({ projetos: ['pistola'] }), nunca);
    expect(s.projetos).toEqual(['pistola']);
    expect(s.projetosQtd.pistola).toBe(3);
  });
  it('armas achadas na expedição chegam sempre comuns; repetidas demais viram projeto', () => {
    const s = fresh();
    s.expedicoes = 5;
    const r = applyExpedition(s, result({ armas: ['laser', 'bastao', 'bastao'] }), nunca);
    expect(s.armas.filter((w) => w.familia === 'laser').map((w) => w.tier)).toEqual(['comum']);
    expect(s.projetos).toContain('laser');
    expect(s.armas.filter((w) => w.familia === 'bastao')).toHaveLength(2); // inicial + 1
    expect(s.projetosQtd.bastao).toBe(1); // a 3ª virou projeto
    expect(s.armas.every((w) => w.tier === 'comum')).toBe(true);
    expect(r.armasNovas).toHaveLength(3);
  });
  // relógio real (LUA-01): janela 12:00–12:30 UTC de um dia qualquer
  const J = Date.UTC(2026, 10, 8, 12, 0, 0);
  it('fora da janela de Lua de Sangue não dispara ataque', () => {
    const s = fresh();
    s.criadoEm = J - 3600_000; s.luaAtacada = J - 12 * 3600_000;
    s.expedicoes = 5;
    const r = applyExpedition(s, result(), nunca, { now: J - 60_000 });
    expect(r.ataque).toBeNull();
    expect(s.ultimoAtaque).toBeNull();
  });
  it('janela que começou durante a expedição ataca o abrigo na volta (1 vez só)', () => {
    const s = fresh();
    s.criadoEm = J - 3600_000;
    s.expedicoes = 5;
    setStruct(s, 'muralha', 5);
    const r = applyExpedition(s, result({ duracao: 600 }), nunca, { now: J + 5 * 60_000 });
    expect(r.ataque).not.toBeNull();
    expect(s.ultimoAtaque).toBe(r.ataque);
    expect(s.luaAtacada).toBe(J);
    expect(s.estruturas.muralha!.hp).toBeLessThan(2500);
    const r2 = applyExpedition(s, result({ duracao: 600 }), nunca, { now: J + 20 * 60_000 });
    expect(r2.ataque).toBeNull();
  });
  it('ataque usa o rng injetado (determinístico)', () => {
    const mk = () => { const s = fresh(); s.criadoEm = J - 3600_000; s.expedicoes = 5; return s; };
    const a = applyExpedition(mk(), result(), nunca, { now: J + 1000 }).ataque;
    const b = applyExpedition(mk(), result(), nunca, { now: J + 1000 }).ataque;
    expect(a).not.toBeNull();
    expect(a).toEqual(b);
  });
});

describe('recruta que entra no squad no caminho', () => {
  it('comReforco: só com vaga no squad e só recruta (pet não)', () => {
    const rec = outcome('rec', true, 'E').plan, pet = outcome('pet', true, 'E').plan;
    const [r1, p1] = comReforco([rec, pet], 1);
    expect(r1.reforco).toMatchObject({ kind: 'rec', recTipo: 'capoeirista', nome: 'Kel', lv: 1, nota: 'E' });
    expect(p1.reforco).toBeUndefined();
    expect(comReforco([rec], 2)[0].reforco).toBeUndefined();
  });
  it('entrou: ganha o XP da expedição e vira o membro 2 padrão', () => {
    const s = fresh();
    _ss(s, 'barraca', 1);
    s.expedicoes = 5;
    const o = { ...outcome('rec', true, 'E'), entrou: true };
    const r = applyExpedition(s, result({ encontros: [o] }), nunca);
    expect(r.novoRecruta).toBeTruthy();
    const kel = s.recs.find((x) => x.nome === 'Kel')!;
    expect(kel.lv > 1 || kel.xp > 0).toBe(true);
    expect(s.squadPadrao).toBe(kel.id);
  });
  it('recrutado sem entrar no squad chega com 0 de XP', () => {
    const s = fresh();
    _ss(s, 'barraca', 1);
    s.expedicoes = 5;
    applyExpedition(s, result({ encontros: [outcome('rec', true, 'E')] }), nunca);
    const kel = s.recs.find((x) => x.nome === 'Kel')!;
    expect(kel.xp).toBe(0); expect(kel.lv).toBe(1);
    expect(s.squadPadrao).toBeUndefined();
  });
});
