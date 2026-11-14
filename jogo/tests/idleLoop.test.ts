import { describe, it, expect } from 'vitest';
import { fresh, rich } from './helpers';
import { makeRng } from '../src/core/rng';
import type { GameState } from '../src/game/state';
import { buildExpedition } from '../src/game/team';
import {
  estimar, fecharRodada, iniciarRodada, novoLoop, simulateOffline, simularRodada, LOOP_MAX_MS, MAX_FALHAS, FALHA_SECA_ARENAS, PAUSA_RODADA_S,
} from '../src/game/idleLoop';
import { LUA_CICLO_MS } from '../src/game/worldClock';

const H = 3600_000;
// começa 1 h depois de uma janela de Lua de Sangue (ciclo de 12 h): a próxima nasce em T0 + 11 h
const T0 = LUA_CICLO_MS * 2_500_000 + 1 * H;
const plano = { recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.35, itens: { kit_cura: 2, chave_comum: 1 } };

function setup(opts: { map?: string; lv?: number; dia?: number; rico?: boolean } = {}): GameState {
  const s = opts.rico === false ? fresh() : rich(fresh());
  s.hero = { nome: 'Lia' } as any;
  s.heroLv = opts.lv ?? 14;
  s.dia = opts.dia ?? 2;
  // squad que vence o Marco Zero com folga (calibragem: cenário L/H)
  s.armas = [{ id: 'w', familia: 'laser', tier: 'lunar', nv: 5 }];
  s.equip = { hero: 'w' };
  s.itens = { kit_cura: 50, chave_comum: 50 };
  s.loop = novoLoop(opts.map ?? 'marco_zero', ['hero'], null, plano, T0);
  s.ultimaVisita = T0;
  return s;
}

describe('idleLoop · simulador offline', () => {
  it('limita a 8 h: 12 h fora simula o mesmo que 8 h e marca o corte', () => {
    const a = setup(), b = setup();
    const ra = simulateOffline(a, T0 + 12 * H, makeRng(7))!;
    const rb = simulateOffline(b, T0 + 8 * H, makeRng(7))!;
    expect(ra.cortado).toBe(true);
    expect(rb.cortado).toBe(false);
    expect(ra.simuladoMs).toBe(LOOP_MAX_MS);
    expect(ra.rodadas).toBe(rb.rodadas);
    expect(ra.rodadas).toBeGreaterThan(5);
    expect(a.dia).toBe(b.dia);
    expect(a.res).toEqual(b.res);
    // as rodadas cabem no tempo simulado
    expect(ra.rodadas * (ra.duracaoMedia + PAUSA_RODADA_S) * 1000).toBeLessThanOrEqual(LOOP_MAX_MS + 1);
  });

  it('para sozinho quando faltam provisões', () => {
    const s = setup({ rico: false });
    s.res.agua = 2; s.res.comida = 0; // dá pra 0 rodadas (custa 1 de cada por membro)
    const rep = simulateOffline(s, T0 + 8 * H, makeRng(3))!;
    expect(rep.parada?.motivo).toBe('provisoes');
    expect(s.loop!.ativo).toBe(false);
    expect(rep.rodadas).toBe(0);
    expect(rep.provisoes.agua ?? 0).toBe(0);
    expect(s.res.agua).toBeLessThanOrEqual(2); // o abrigo parado ainda come em tempo real (tickUpkeep)
    // com provisão para 2 rodadas e um squad que não traz comida (falha logo), para por provisão ou falhas
    const w = setup({ rico: false, lv: 1 });
    w.armas = [{ id: 'w', familia: 'bastao', tier: 'comum' }];
    w.res.agua = 2; w.res.comida = 2;
    const r2 = simulateOffline(w, T0 + 8 * H, makeRng(3))!;
    expect(r2.parada?.motivo).toBe('provisoes');
    expect(r2.rodadas).toBe(2);
    expect(r2.provisoes.agua).toBe(2);
  });

  it(`para depois de ${MAX_FALHAS} falhas seguidas`, () => {
    const s = setup({ map: 'olinda', lv: 1, dia: 30 });
    s.armas = [{ id: 'w', familia: 'bastao', tier: 'comum' }];
    s.itens = {};
    const rep = simulateOffline(s, T0 + 8 * H, makeRng(11))!;
    expect(rep.parada?.motivo).toBe('falhas');
    expect(rep.falhas).toBe(MAX_FALHAS);
    expect(rep.rodadas).toBe(MAX_FALHAS);
    expect(s.loop!.falhasSeguidas).toBe(MAX_FALHAS);
  });

  it('é determinístico com o mesmo Rng', () => {
    const a = setup(), b = setup();
    const ra = simulateOffline(a, T0 + 5 * H, makeRng(42))!;
    const rb = simulateOffline(b, T0 + 5 * H, makeRng(42))!;
    expect(ra.rodadas).toBe(rb.rodadas);
    expect(ra.loot).toEqual(rb.loot);
    expect(a.res).toEqual(b.res);
    expect(a.derrotados).toEqual(b.derrotados);
    expect(a.recs.map((r) => r.id)).toEqual(b.recs.map((r) => r.id));
  });

  it('não simula o mesmo intervalo duas vezes', () => {
    const s = setup();
    const r1 = simulateOffline(s, T0 + 3 * H, makeRng(1))!;
    expect(r1.rodadas).toBeGreaterThan(0);
    expect(s.ultimaVisita).toBe(T0 + 3 * H);
    const dia = s.dia, res = { ...s.res };
    expect(simulateOffline(s, T0 + 3 * H, makeRng(1))).toBeNull();
    expect(s.dia).toBe(dia);
    expect(s.res).toEqual(res);
  });

  it('sem loop ativo ou ausência curta não faz nada', () => {
    const s = setup();
    expect(simulateOffline(s, T0 + 30_000)).toBeNull();
    s.loop!.ativo = false;
    expect(simulateOffline(s, T0 + 3 * H)).toBeNull();
    expect(s.ultimaVisita).toBe(T0);
  });

  it('cada janela de Lua de Sangue atravessada gera 1 ataque ao abrigo', () => {
    const s = setup();
    s.ultimaVisita = T0 + 4 * H; // 8 h fora, de T0+4 h a T0+12 h: atravessa a janela de T0+11 h
    const rep = simulateOffline(s, T0 + 12 * H, makeRng(5))!;
    expect(rep.ataques.length).toBe(1);
    expect(simulateOffline(setup(), T0 + 8 * H, makeRng(5))!.ataques.length).toBe(0); // T0..T0+8 h: nenhuma
    const s2 = setup();
    s2.ultimaVisita = T0 + 2 * H; // janela seguinte começa 9 h depois: em 2 h não atravessa nenhuma
    expect(simulateOffline(s2, T0 + 4 * H, makeRng(5))!.ataques.length).toBe(0);
  });

  it('rodada em andamento (emCurso) não paga provisões de novo', () => {
    const s = setup();
    const ini = iniciarRodada(s, T0);
    expect(ini.config).toBeTruthy();
    const agua = s.res.agua;
    const again = iniciarRodada(s, T0);
    expect(s.res.agua).toBe(agua);
    expect(again.config?.plano?.itens).toEqual(ini.config?.plano?.itens);
  });

  it('squad forte vence mais e é mais rápido que squad fraco (estimativa)', () => {
    const forte = setup(), fraco = setup({ lv: 1 });
    fraco.armas = [{ id: 'w', familia: 'bastao', tier: 'comum' }];
    const ef = estimar(buildExpedition(forte, ['hero'], null, 'marco_zero'));
    const ew = estimar(buildExpedition(fraco, ['hero'], null, 'marco_zero'));
    expect(ef.chance).toBeGreaterThan(ew.chance);
    expect(ef.duracao).toBeLessThan(ew.duracao);
  });

  it('falha devolve metade do loot (via applyExpedition) e conta falhas seguidas', () => {
    const s = setup({ map: 'olinda', lv: 1, dia: 30 });
    const ini = iniciarRodada(s, T0);
    const rod = simularRodada(ini.config!, makeRng(2));
    expect(rod.r.sucesso).toBe(false);
    expect(rod.r.loot.fragmento_lunar ?? 0).toBe(0); // sem loot de vitória
    expect(fecharRodada(s, rod.r, T0)).toBeNull();
    expect(s.loop!.falhasSeguidas).toBe(1);
  });

  it('falha funda (≥ FALHA_SECA_ARENAS arenas) não conta pra parar o loop: é progresso', () => {
    const s = setup();
    const r = simularRodada(iniciarRodada(s, T0).config!, makeRng(2)).r;
    for (let i = 0; i < MAX_FALHAS + 2; i++) fecharRodada(s, { ...r, sucesso: false, arenasLimpas: FALHA_SECA_ARENAS }, T0);
    expect(s.loop!.ativo).toBe(true);
    expect(s.loop!.falhasSeguidas).toBe(0);
    for (let i = 0; i < MAX_FALHAS; i++) fecharRodada(s, { ...r, sucesso: false, arenasLimpas: FALHA_SECA_ARENAS - 1 }, T0);
    expect(s.loop!.ativo).toBe(false);
    expect(s.loop!.parada?.motivo).toBe('falhas');
  });
});
