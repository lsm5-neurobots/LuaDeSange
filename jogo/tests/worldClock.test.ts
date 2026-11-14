import { describe, it, expect, afterEach } from 'vitest';
import {
  bloodMoonAt, nextBloodMoon, currentBloodMoon, bloodMoonWindows, LUA_CICLO_MS, LUA_DURACAO_MS, DIA_MUNDO_MS, CLIMA_BLOCO_MS,
  worldHour, dayPhase, phaseOfHour, skyMode, msToNextPhase, weatherAt, climaBlock, CLIMAS, fmtCountdown, fmtClock, fmtWorldHour,
  setClockOffset, serverNow, initDebugClock, forceWeather, ambienteAt, type Clima,
} from '../src/game/worldClock';

const D = Date.UTC(2026, 10, 8); // 08/11/2026 00:00 UTC
const H = 3600_000, MIN = 60_000;

afterEach(() => { setClockOffset(0); forceWeather(null); });

describe('janelas da Lua de Sangue (00:00 e 12:00 UTC, 30 min)', () => {
  it('fronteiras exatas', () => {
    for (const h of [0, 12, 24]) {
      const t = D + h * H;
      expect(bloodMoonAt(t - 1)).toBe(false);
      expect(bloodMoonAt(t)).toBe(true);
      expect(bloodMoonAt(t + LUA_DURACAO_MS - 1)).toBe(true);
      expect(bloodMoonAt(t + LUA_DURACAO_MS)).toBe(false);
    }
    expect(bloodMoonAt(D + 4 * H)).toBe(false);
    expect(bloodMoonAt(D + 8 * H)).toBe(false); // 08:00 e 16:00 não têm mais lua
    expect(bloodMoonAt(D + 16 * H)).toBe(false);
    expect(bloodMoonAt(D + 23 * H + 59 * MIN)).toBe(false);
  });
  it('nextBloodMoon devolve a atual ou a próxima', () => {
    expect(nextBloodMoon(D + 10 * MIN)).toEqual({ inicio: D, fim: D + 30 * MIN });
    expect(nextBloodMoon(D + 30 * MIN)).toEqual({ inicio: D + 12 * H, fim: D + 12 * H + 30 * MIN });
    expect(nextBloodMoon(D + 12 * H - 1)).toEqual({ inicio: D + 12 * H, fim: D + 12 * H + 30 * MIN });
    expect(currentBloodMoon(D + 9 * H)).toBeNull();
    expect(currentBloodMoon(D + 12 * H + 1)).toEqual({ inicio: D + 12 * H, fim: D + 12 * H + 30 * MIN });
  });
  it('bloodMoonWindows lista as que começam no intervalo [desde, ate)', () => {
    expect(bloodMoonWindows(D, D + 24 * H).map((j) => (j.inicio - D) / H)).toEqual([0, 12]);
    expect(bloodMoonWindows(D + 1, D + 12 * H)).toEqual([]);
    expect(bloodMoonWindows(D + 1, D + 12 * H + 1)).toHaveLength(1);
    expect(bloodMoonWindows(D - 24 * H, D)).toHaveLength(2);
    for (const j of bloodMoonWindows(D, D + 72 * H)) { expect(j.fim - j.inicio).toBe(LUA_DURACAO_MS); expect(j.inicio % LUA_CICLO_MS).toBe(0); }
  });
});

describe('hora e fase do dia (1 dia do mundo = 24 min reais)', () => {
  it('a Lua de Sangue nasce à meia-noite do mundo', () => {
    expect(LUA_CICLO_MS % DIA_MUNDO_MS).toBe(0);
    expect(worldHour(D + 12 * H)).toBe(0);
    expect(worldHour(D + MIN)).toBeCloseTo(1); // 1 min real = 1 h do mundo
    expect(worldHour(D + 12 * MIN)).toBeCloseTo(12);
    expect(fmtWorldHour(D + 7 * MIN + 30_000)).toBe('07:30');
  });
  it('faixas', () => {
    expect(phaseOfHour(0)).toBe('madrugada');
    expect(phaseOfHour(4.99)).toBe('madrugada');
    expect(phaseOfHour(5)).toBe('manha');
    expect(phaseOfHour(12)).toBe('tarde');
    expect(phaseOfHour(17)).toBe('anoitecer');
    expect(phaseOfHour(19.49)).toBe('anoitecer');
    expect(phaseOfHour(19.5)).toBe('noite');
    expect(dayPhase(D + 2 * H + 9 * MIN)).toBe('manha'); // fora da janela: 09h do mundo
  });
  it('céu: Lua de Sangue manda por cima; madrugada usa o céu da noite', () => {
    expect(skyMode(D + 5 * MIN)).toBe('lua');
    expect(skyMode(D + 2 * H + 2 * MIN)).toBe('noite'); // 02h
    expect(skyMode(D + 2 * H + 8 * MIN)).toBe('manha');
    expect(skyMode(D + 2 * H + 14 * MIN)).toBe('tarde');
    expect(skyMode(D + 2 * H + 18 * MIN)).toBe('anoitecer');
    expect(skyMode(D + 2 * H + 21 * MIN)).toBe('noite');
  });
  it('msToNextPhase aponta a próxima troca', () => {
    const t = D + 2 * H + 10 * MIN; // 10h → tarde às 12h = 2 min reais
    expect(msToNextPhase(t)).toBeCloseTo(2 * MIN, -1);
    expect(dayPhase(t + msToNextPhase(t) + 1)).toBe('tarde');
  });
});

describe('clima determinístico por bloco e mapa', () => {
  it('mesmo bloco = mesmo clima; varia entre blocos', () => {
    const t = D + 3 * H;
    for (const m of ['marco_zero', 'olinda', 'abrigo']) {
      const c = weatherAt(t, m);
      expect(weatherAt(t + 1000, m)).toBe(c);
      expect(weatherAt(climaBlock(t) * CLIMA_BLOCO_MS, m)).toBe(c);
      expect(CLIMAS).toContain(c);
    }
    const seen = new Set<Clima>();
    for (let i = 0; i < 400; i++) seen.add(weatherAt(D + i * CLIMA_BLOCO_MS, 'marco_zero'));
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });
  it('Recife é tropical: chuva frequente; neblina só de madrugada/manhã', () => {
    const n: Record<string, number> = {};
    for (let i = 0; i < 4000; i++) {
      const t = D + i * CLIMA_BLOCO_MS, c = weatherAt(t, 'marco_zero');
      n[c] = (n[c] ?? 0) + 1;
      if (c === 'neblina') expect(['madrugada', 'manha']).toContain(dayPhase(climaBlock(t) * CLIMA_BLOCO_MS + CLIMA_BLOCO_MS / 2));
    }
    expect((n.chuva ?? 0) + (n.tempestade ?? 0)).toBeGreaterThan(4000 * 0.25);
    expect(n.limpo ?? 0).toBeGreaterThan(4000 * 0.25);
  });
  it('mapas diferentes não andam juntos', () => {
    let diff = 0;
    for (let i = 0; i < 200; i++) if (weatherAt(D + i * CLIMA_BLOCO_MS, 'marco_zero') !== weatherAt(D + i * CLIMA_BLOCO_MS, 'olinda')) diff++;
    expect(diff).toBeGreaterThan(40);
  });
});

describe('relógio do servidor e debug', () => {
  it('offset e ?relogio / ?hora / ?clima', () => {
    setClockOffset(5 * H);
    expect(Math.abs(serverNow() - (Date.now() + 5 * H))).toBeLessThan(50);
    setClockOffset(0);
    initDebugClock('?relogio=' + (D + 12 * H + 18 * MIN + 42_000));
    expect(bloodMoonAt(serverNow())).toBe(true);
    setClockOffset(0);
    initDebugClock('?hora=14');
    expect(dayPhase(serverNow())).toBe('tarde');
    expect(bloodMoonAt(serverNow())).toBe(false);
    initDebugClock('?clima=tempestade');
    expect(ambienteAt(serverNow(), 'olinda').clima).toBe('tempestade');
  });
  it('formatos do HUD', () => {
    expect(fmtCountdown(3 * H + 12 * MIN)).toBe('3h12');
    expect(fmtCountdown(11 * MIN + 1000)).toBe('12min');
    expect(fmtCountdown(45_000)).toBe('45s');
    expect(fmtClock(18 * MIN + 42_000)).toBe('18:42');
  });
});
