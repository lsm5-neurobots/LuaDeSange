// Consumo do abrigo (upkeep): água e comida dos moradores, provisões de expedição e manutenção das estruturas.
// Regras puras, sem DOM.
import { STRUCT_IDS } from '../data/structures';
import { MAPS } from '../data/maps';
import type { Bag, ResId } from '../data/resources';
import { canPay, pay } from './economy';
import { addLog, type GameState } from './state';
import { rng as defaultRng, type Rng } from '../core/rng';

/** Por dia (1 expedição = 1 dia), por pessoa/pet. */
export const DIA_HUMANO = 1;
export const DIA_PET = 0.5;
/** Em tempo real (idle), por hora: bem mais leve que o consumo diário. */
export const HORA_HUMANO = 0.5;
export const HORA_PET = 0.25;
/** Tempo real máximo cobrado de uma vez (offline), em minutos. */
export const OFFLINE_MAX_MIN = 360;
/** Dias de fome/sede seguidos até os recrutas começarem a ir embora. */
export const DIAS_LIMITE = 3;

export const PEN_PROD = 0.75; // produção, por condição (fome e sede acumulam)
export const PEN_VIDA = 0.85;
export const PEN_DANO = 0.9;

interface Need { agua: number; comida: number }

const humanos = (s: GameState) => 1 + s.recs.length;

/** Consumo diário dos moradores; `fora` = ids no squad (eles comem as provisões da expedição). */
export function consumoDia(s: GameState, fora: string[] = []): Need {
  const fo = fora.filter((id) => id === 'hero' || s.recs.some((r) => r.id === id)).length;
  const n = Math.max(0, humanos(s) - fo) * DIA_HUMANO + s.pets.length * DIA_PET;
  return { agua: n, comida: n };
}

export function consumoHora(s: GameState): Need {
  const n = humanos(s) * HORA_HUMANO + s.pets.length * HORA_PET;
  return { agua: n, comida: n };
}

/** Manutenção diária das estruturas construídas (madeira, sucata, pano). A fogueira nv 1 é grátis. */
export function manutencaoDia(s: GameState): Bag {
  let niveis = 0;
  for (const id of STRUCT_IDS) niveis += s.estruturas[id]?.nv ?? 0;
  niveis = Math.max(0, niveis - 1);
  const b: Bag = {};
  const mad = Math.ceil(niveis / 6), suc = Math.floor(niveis / 8), pan = Math.floor(niveis / 10);
  if (mad > 0) b.madeira = mad;
  if (suc > 0) b.sucata = suc;
  if (pan > 0) b.pano = pan;
  return b;
}

/** Custo de provisões para partir: água + comida por membro; mapas mais longe pedem gasolina/peças. */
export function custoExpedicao(_s: GameState, memberIds: string[], mapId: string): Bag {
  const n = memberIds.length;
  const b: Bag = { agua: n * DIA_HUMANO, comida: n * DIA_HUMANO };
  const nv = MAPS[mapId]?.nivelRecomendado ?? 1;
  if (nv >= 4) b.gasolina = 1;
  if (nv >= 8) b.pecas = 1;
  return b;
}

/**
 * Piso anti-trava: indo SOLO pro 1º mapa (nível 1), a água e a comida que faltarem saem da ração de emergência.
 * Assim a conta nunca fica sem conseguir sair (e a expedição traz recursos de volta). Só na saída manual: o loop
 * offline continua exigindo provisão de verdade (senão farmava de graça pra sempre). Devolve o que a ração cobre.
 */
export function racaoEmergencia(s: GameState, memberIds: string[], mapId: string): Bag {
  if (memberIds.length !== 1 || (MAPS[mapId]?.nivelRecomendado ?? 1) > 1) return {};
  const c = custoExpedicao(s, memberIds, mapId), out: Bag = {};
  for (const k of ['agua', 'comida'] as const) {
    const f = Math.ceil((c[k] ?? 0) - Math.floor(s.res[k] ?? 0));
    if (f > 0) out[k] = f;
  }
  return out;
}

const NOME: Partial<Record<ResId, string>> = { agua: 'água', comida: 'comida', gasolina: 'gasolina', pecas: 'peças' };

/** Mensagem do motivo, ou null se pode partir. */
export function bloqueioExpedicao(s: GameState, memberIds: string[], mapId: string, racao = true): string | null {
  const falta = faltaExpedicao(s, memberIds, mapId, racao);
  if (!falta.length) return null;
  return `Faltam provisões: ${falta.map((f) => `${NOME[f.res] ?? f.res} (${f.tem}/${f.precisa})`).join(', ')}. Colete ou produza mais no abrigo.`;
}

export interface FaltaProvisao { res: ResId; tem: number; precisa: number; falta: number }
/** Recursos de provisão que não fecham a conta (vazio = pode partir). */
export function faltaExpedicao(s: GameState, memberIds: string[], mapId: string, comRacao = true): FaltaProvisao[] {
  const c = custoExpedicao(s, memberIds, mapId), racao = comRacao ? racaoEmergencia(s, memberIds, mapId) : {};
  return (Object.keys(c) as ResId[]).flatMap((k) => {
    const tem = Math.floor(s.res[k] ?? 0), precisa = (c[k] ?? 0) - (racao[k] ?? 0);
    return tem < precisa ? [{ res: k, tem, precisa, falta: Math.ceil(precisa - tem) }] : [];
  });
}

export function pagarExpedicao(s: GameState, memberIds: string[], mapId: string, comRacao = true): boolean {
  const c = custoExpedicao(s, memberIds, mapId), racao: Bag = comRacao ? racaoEmergencia(s, memberIds, mapId) : {};
  for (const [k, v] of Object.entries(racao) as [ResId, number][]) c[k] = Math.max(0, (c[k] ?? 0) - v);
  if (!canPay(s, c)) return false;
  const ok = pay(s, c);
  if (ok && Object.keys(racao).length) addLog(s, `<b>Ração de emergência</b>: faltou ${Object.entries(racao).map(([k, v]) => `${v} de ${NOME[k as ResId] ?? k}`).join(' e ')}, mas a expedição solo saiu mesmo assim. Construa o <b>Coletor</b> e a <b>Horta</b> pra não depender dela.`);
  return ok;
}

export const famintos = (s: GameState): boolean => (s.fomeDias ?? 0) > 0 && (s.res.comida ?? 0) < Math.ceil(consumoDia(s).comida);
export const comSede = (s: GameState): boolean => (s.sedeDias ?? 0) > 0 && (s.res.agua ?? 0) < Math.ceil(consumoDia(s).agua);

/** Multiplicador de produção das estruturas por fome/sede. */
export function prodPenalty(s: GameState): number {
  return (famintos(s) ? PEN_PROD : 1) * (comSede(s) ? PEN_PROD : 1);
}

/** Penalidades de combate nas expedições (multiplicadores). */
export function combatPenalty(s: GameState): { vida: number; dano: number } {
  const n = (famintos(s) ? 1 : 0) + (comSede(s) ? 1 : 0);
  return { vida: Math.pow(PEN_VIDA, n), dano: Math.pow(PEN_DANO, n) };
}

/** Desconta do estoque (a parte fracionária fica no buffer). Diz o que faltou. */
function drain(s: GameState, need: Need): { agua: boolean; comida: boolean } {
  const buf = (s.upkeepBuf ??= { agua: 0, comida: 0 });
  const falta = { agua: false, comida: false };
  for (const k of ['agua', 'comida'] as const) {
    buf[k] += need[k];
    const whole = Math.floor(buf[k]);
    if (whole <= 0) continue;
    const take = Math.min(Math.floor(s.res[k] ?? 0), whole);
    s.res[k] = (s.res[k] ?? 0) - take;
    buf[k] -= whole;
    if (take < whole) { falta[k] = true; buf[k] = 0; }
  }
  return falta;
}

/** Consumo em tempo real (idle/offline). Chamar junto de tickProduction. Não causa deserção. */
export function tickUpkeep(s: GameState, dtMs: number): void {
  if (dtMs <= 0) return;
  const horas = Math.min(dtMs, OFFLINE_MAX_MIN * 60000) / 3600000, c = consumoHora(s);
  drain(s, { agua: c.agua * horas, comida: c.comida * horas });
}

export interface DiaReport { consumo: Need; manut: Bag; faltaAgua: boolean; faltaComida: boolean; foram: string[] }

/** Fecha o dia (após uma expedição): quem ficou come e bebe, estruturas pedem manutenção, fome pode expulsar recrutas. */
export function tickDia(s: GameState, squadIds: string[] = [], rand: Rng = defaultRng): DiaReport {
  const c = consumoDia(s, squadIds);
  const falta = drain(s, c);
  s.fomeDias = falta.comida ? (s.fomeDias ?? 0) + 1 : 0;
  s.sedeDias = falta.agua ? (s.sedeDias ?? 0) + 1 : 0;

  const manut = manutencaoDia(s), paga: Bag = {};
  for (const [k, v] of Object.entries(manut) as [ResId, number][]) {
    const t = Math.min(v, Math.floor(s.res[k] ?? 0));
    if (t > 0) { s.res[k] -= t; paga[k] = t; }
  }
  const semMaterial = (Object.keys(manut) as ResId[]).some((k) => (paga[k] ?? 0) < (manut[k] ?? 0));

  const cn = Math.round(c.agua * 10) / 10;
  const mt = Object.entries(paga).map(([k, v]) => `${v} ${k}`).join(', ');
  addLog(s, `Dia ${s.dia}: o abrigo consumiu <b>${cn}</b> de água e <b>${cn}</b> de comida${mt ? ` e gastou ${mt} em manutenção` : ''}.`);
  if (semMaterial) addLog(s, '<b>Faltou material</b> para a manutenção das estruturas.');
  if (falta.comida) addLog(s, `<b>Famintos!</b> Não há comida suficiente (${s.fomeDias} dia${s.fomeDias === 1 ? '' : 's'}). Vida, dano e produção caem.`);
  if (falta.agua) addLog(s, `<b>Com sede!</b> Não há água suficiente (${s.sedeDias} dia${s.sedeDias === 1 ? '' : 's'}). Vida, dano e produção caem.`);

  const foram: string[] = [];
  if (((s.fomeDias ?? 0) >= DIAS_LIMITE || (s.sedeDias ?? 0) >= DIAS_LIMITE) && s.recs.length && rand() < 0.5) {
    const i = Math.floor(rand() * s.recs.length), r = s.recs[i];
    s.recs.splice(i, 1);
    delete s.equip[r.id];
    foram.push(r.nome);
    addLog(s, `<b>${r.nome}</b> abandonou o abrigo, farto de passar necessidade.`);
  }
  return { consumo: c, manut: paga, faltaAgua: falta.agua, faltaComida: falta.comida, foram };
}

export interface ResFlow { porDia: number; dias: number; critico: boolean }

/** Consumo por dia e autonomia de cada recurso que gasta (para o HUD). */
export function fluxo(s: GameState): Partial<Record<ResId, ResFlow>> {
  const c = consumoDia(s), m = manutencaoDia(s), out: Partial<Record<ResId, ResFlow>> = {};
  const add = (k: ResId, porDia: number) => {
    if (porDia <= 0) return;
    const dias = (s.res[k] ?? 0) / porDia;
    out[k] = { porDia, dias, critico: dias <= 1 };
  };
  add('agua', c.agua);
  add('comida', c.comida);
  for (const [k, v] of Object.entries(m) as [ResId, number][]) add(k, v);
  return out;
}

/** Nomes usados pelo modal de plano da expedição. */
export const expeditionCost = custoExpedicao;
export const canAffordExpedition = (s: GameState, memberIds: string[], mapId: string): boolean =>
  bloqueioExpedicao(s, memberIds, mapId) === null;
