// Relógio do mundo (UTC, sem backend por enquanto): hora do mundo, fase do dia, clima e Lua de Sangue.
// Todos os jogadores veem o mesmo céu porque tudo sai do relógio do "servidor" (Date.now() + offset).
// Funções puras recebem `ms` (epoch UTC); só serverNow/setClockOffset/initDebugClock mexem em estado.
//
// Regras (mecanicas2.html, aba Mundo e tempo):
//  - DN-01  1 dia do mundo = 24 min reais (1 h do mundo = 1 min real), alinhado ao epoch UTC. Como 12 h reais
//           são exatamente 30 dias do mundo, a Lua de Sangue sempre nasce à meia-noite do mundo.
//  - LUA-01 Lua de Sangue: janela de 30 min a cada 12 h reais (00:00–00:30 e 12:00–12:30 UTC).
//           (antes: a cada 8 h; o teto do loop offline continua 8 h.)
//  - CLM-04 Clima determinístico por bloco de 6 min reais e por mapa (pesos por mapa e por fase do dia).

export const HORA_MS = 3600_000;
export const LUA_CICLO_MS = 12 * HORA_MS;
export const LUA_DURACAO_MS = 30 * 60_000;
/** Duração de 1 dia do mundo em ms reais (DN-01: 24 min). */
export const DIA_MUNDO_MS = 24 * 60_000;
/** Bloco de clima em ms reais (CLM-04): o tempo pode mudar a cada bloco. */
export const CLIMA_BLOCO_MS = 6 * 60_000;

export interface Janela { inicio: number; fim: number }

// ---------------- relógio do servidor ----------------
let offsetMs = 0;
/** Diferença servidor − aparelho. Quando houver backend, setClockOffset(serverTime − Date.now()). */
export function setClockOffset(ms: number): void { offsetMs = Number.isFinite(ms) ? ms : 0; }
export function getClockOffset(): number { return offsetMs; }

/** Relógio publicado em `world/clock` (janela de 8 h). Ausente no jogo local: a fórmula de sempre vale. */
export interface RelogioPublico { agora: number; janela: number; inicio: number; fim: number }
let publico: RelogioPublico | null = null;
export function setRelogioPublico(r: RelogioPublico | null): void {
  publico = r;
  if (r && Number.isFinite(r.agora)) setClockOffset(r.agora - Date.now());
}
export function relogioPublico(): RelogioPublico | null { return publico; }

/** Contagem da janela de 8 h, se o servidor publicou `world/clock`. Sem isso, devolve null e o jogo usa a fórmula local. */
export function textoContagemLua(now: number, luaAtacada?: number): string | null {
  const p = publico;
  if (!p) return null;
  if (luaAtacada != null && luaAtacada < p.inicio) return '<b>LUA DE SANGUE</b>';
  return `Lua de Sangue em <b>${fmtCountdown(Math.max(0, p.fim - now))}</b>`;
}
/** Agora no relógio do servidor (por enquanto UTC do aparelho + offset). */
export function serverNow(): number { return Date.now() + offsetMs; }

// ---------------- Lua de Sangue ----------------
/** Está em janela de Lua de Sangue nesse instante? */
export function bloodMoonAt(ms: number): boolean {
  const r = ((ms % LUA_CICLO_MS) + LUA_CICLO_MS) % LUA_CICLO_MS;
  return r < LUA_DURACAO_MS;
}

/** Janela atual (se estiver dentro de uma) ou a próxima. */
export function nextBloodMoon(ms: number): Janela {
  const ini = Math.floor(ms / LUA_CICLO_MS) * LUA_CICLO_MS;
  if (ms < ini + LUA_DURACAO_MS) return { inicio: ini, fim: ini + LUA_DURACAO_MS };
  return { inicio: ini + LUA_CICLO_MS, fim: ini + LUA_CICLO_MS + LUA_DURACAO_MS };
}

/** Janela em andamento nesse instante (ou null). */
export function currentBloodMoon(ms: number): Janela | null {
  return bloodMoonAt(ms) ? nextBloodMoon(ms) : null;
}

/** Janelas que COMEÇAM dentro de [desdeMs, ateMs). */
export function bloodMoonWindows(desdeMs: number, ateMs: number): Janela[] {
  const out: Janela[] = [];
  for (let i = Math.ceil(desdeMs / LUA_CICLO_MS) * LUA_CICLO_MS; i < ateMs; i += LUA_CICLO_MS) out.push({ inicio: i, fim: i + LUA_DURACAO_MS });
  return out;
}

/** "3h12", "12min", "45s" (contagem regressiva do HUD). */
export function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s >= 3600) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return `${h}h${String(m).padStart(2, '0')}`; }
  if (s >= 60) return `${Math.ceil(s / 60)}min`;
  return `${s}s`;
}
/** "18:42" (mm:ss) — quanto falta para a janela acabar. */
export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ---------------- hora e fase do dia ----------------
export type DayPhase = 'madrugada' | 'manha' | 'tarde' | 'anoitecer' | 'noite';
/** Céu/luz que os mapas e o abrigo sabem desenhar. 'lua' = noite de Lua de Sangue. */
export type SkyMode = 'manha' | 'tarde' | 'anoitecer' | 'noite' | 'lua';

export const PHASE_NOME: Record<DayPhase, string> = { madrugada: 'Madrugada', manha: 'Manhã', tarde: 'Tarde', anoitecer: 'Anoitecer', noite: 'Noite' };

/** Hora do mundo (0 ≤ h < 24, fracionária). */
export function worldHour(ms: number): number {
  const r = ((ms % DIA_MUNDO_MS) + DIA_MUNDO_MS) % DIA_MUNDO_MS;
  return (r / DIA_MUNDO_MS) * 24;
}
/** "07:30" da hora do mundo. */
export function fmtWorldHour(ms: number): string {
  const h = worldHour(ms), hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Faixas (horas do mundo): madrugada 0–5 · manhã 5–12 · tarde 12–17 · anoitecer 17–19h30 · noite 19h30–24. */
export function phaseOfHour(h: number): DayPhase {
  if (h < 5) return 'madrugada';
  if (h < 12) return 'manha';
  if (h < 17) return 'tarde';
  if (h < 19.5) return 'anoitecer';
  return 'noite';
}
export const dayPhase = (ms: number): DayPhase => phaseOfHour(worldHour(ms));

/** Céu a desenhar: a Lua de Sangue manda por cima de tudo (DN-02); madrugada usa o céu da noite. */
export function skyMode(ms: number): SkyMode {
  if (bloodMoonAt(ms)) return 'lua';
  const p = dayPhase(ms);
  return p === 'madrugada' ? 'noite' : p;
}
/** Ms reais até a próxima troca de fase do dia (para pré-aquecer a arte antes). */
export function msToNextPhase(ms: number): number {
  const h = worldHour(ms), bounds = [5, 12, 17, 19.5, 24], nb = bounds.find((b) => b > h + 1e-9) ?? 24;
  return ((nb - h) / 24) * DIA_MUNDO_MS;
}
/** É escuro (postes e janelas acesos)? anoitecer, noite, madrugada e Lua de Sangue. */
export const isDark = (m: SkyMode): boolean => m === 'anoitecer' || m === 'noite' || m === 'lua';

// ---------------- clima ----------------
export type Clima = 'limpo' | 'nublado' | 'chuva' | 'tempestade' | 'neblina';
export const CLIMAS: readonly Clima[] = ['limpo', 'nublado', 'chuva', 'tempestade', 'neblina'];
export const CLIMA_NOME: Record<Clima, string> = { limpo: 'Céu limpo', nublado: 'Nublado', chuva: 'Chuva', tempestade: 'Tempestade', neblina: 'Neblina' };

/** Pesos por mapa (Recife/Olinda: tropical, chuva de verão frequente e rápida). 'abrigo' fica no Recife. */
export const CLIMA_PESOS: Record<string, Record<Clima, number>> = {
  marco_zero: { limpo: 36, nublado: 22, chuva: 28, tempestade: 7, neblina: 7 },
  olinda: { limpo: 34, nublado: 24, chuva: 26, tempestade: 6, neblina: 10 },
  veropeso: { limpo: 24, nublado: 22, chuva: 34, tempestade: 10, neblina: 10 }, // Belém: chuva da tarde quase todo dia, neblina de rio
  lapa: { limpo: 32, nublado: 24, chuva: 24, tempestade: 8, neblina: 12 }, // Rio: mormaço, pancada de verão e neblina no morro
  abrigo: { limpo: 36, nublado: 22, chuva: 28, tempestade: 7, neblina: 7 },
};
const PESO_PADRAO: Record<Clima, number> = { limpo: 40, nublado: 25, chuva: 22, tempestade: 5, neblina: 8 };

/** Hash determinístico 0..1 de (bloco, semente do mapa). */
function hash01(a: number, b: number): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function seedOf(mapId: string): number { let s = 7; for (let i = 0; i < mapId.length; i++) s = (Math.imul(s, 31) + mapId.charCodeAt(i)) | 0; return s; }

/** Índice do bloco de clima de um instante. */
export const climaBlock = (ms: number): number => Math.floor(ms / CLIMA_BLOCO_MS);

/** Clima do mapa nesse instante: sorteio fixo por bloco de 6 min. Neblina só de madrugada e de manhã (senão vira nublado). */
export function weatherAt(ms: number, mapId: string): Clima {
  const w = CLIMA_PESOS[mapId] ?? PESO_PADRAO, b = climaBlock(ms);
  const tot = CLIMAS.reduce((a, k) => a + w[k], 0);
  let r = hash01(b, seedOf(mapId)) * tot, c: Clima = 'limpo';
  for (const k of CLIMAS) { if (r < w[k]) { c = k; break; } r -= w[k]; }
  if (c === 'neblina') { const p = dayPhase(b * CLIMA_BLOCO_MS + CLIMA_BLOCO_MS / 2); if (p !== 'madrugada' && p !== 'manha') c = 'nublado'; }
  return c;
}

/** Efeitos leves do clima na expedição (documentados em CLM-15). */
export const CLIMA_EFEITO: Record<Clima, { alcanceCuspe: number; texto: string }> = {
  limpo: { alcanceCuspe: 1, texto: '' },
  nublado: { alcanceCuspe: 1, texto: '' },
  chuva: { alcanceCuspe: 0.9, texto: 'chuva: cuspidores enxergam 10% menos' },
  tempestade: { alcanceCuspe: 0.9, texto: 'tempestade: relâmpagos atordoam zumbis perto do squad' },
  neblina: { alcanceCuspe: 0.8, texto: 'neblina: cuspidores enxergam 20% menos' },
};

// ---------------- ambiente pronto pra desenhar ----------------
export interface Ambiente { ms: number; hora: number; fase: DayPhase; ceu: SkyMode; clima: Clima; lua: Janela | null }
let climaForcado: Clima | null = null;
/** Debug/E2E: força o clima (null = volta ao sorteio). */
export function forceWeather(c: Clima | null): void { climaForcado = c; }
export function ambienteAt(ms: number, mapId: string): Ambiente {
  return { ms, hora: worldHour(ms), fase: dayPhase(ms), ceu: skyMode(ms), clima: climaForcado ?? weatherAt(ms, mapId), lua: currentBloodMoon(ms) };
}

/** Debug/E2E: `?relogio=<ms|ISO>` fixa o relógio do servidor nesse instante (e segue andando);
 *  `?hora=HH[.f]` pula para essa hora do mundo; `?clima=chuva` força o clima. */
export function initDebugClock(search: string): void {
  const q = new URLSearchParams(search);
  const r = q.get('relogio');
  if (r) { const t = /^\d+$/.test(r) ? Number(r) : Date.parse(r); if (Number.isFinite(t)) setClockOffset(t - Date.now()); }
  const h = q.get('hora');
  if (h != null && h !== '' && Number.isFinite(+h)) {
    const now = serverNow(), dia0 = Math.floor(now / DIA_MUNDO_MS) * DIA_MUNDO_MS;
    let t = dia0 + ((+h % 24) / 24) * DIA_MUNDO_MS;
    if (bloodMoonAt(t) && !r) t += DIA_MUNDO_MS; // fugir da janela da lua se só a hora foi pedida
    while (bloodMoonAt(t) && !r) t += DIA_MUNDO_MS;
    setClockOffset(getClockOffset() + (t - now));
  }
  const c = q.get('clima');
  if (c && (CLIMAS as readonly string[]).includes(c)) forceWeather(c as Clima);
}
