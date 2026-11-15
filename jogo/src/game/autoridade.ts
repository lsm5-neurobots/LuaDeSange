// Regras autoritativas do servidor. O corpo do pedido só traz a intenção (mapa, squad, estrutura).
// Recurso, loot, dano, hora e "eu venci" são ignorados. As contas são as funções que o jogo já usa.
import { makeRng, type Rng } from '../core/rng';
import { GOLPE_IDS, type GolpeId } from '../data/golpes';
import { PETS, RECRUITS, type PetType, type RecruitType } from '../data/recruits';
import { ITEM_MK, type ItemMk } from '../data/market';
import { MAPS } from '../data/maps';
import { STRUCT_IDS, type StructId } from '../data/structures';
import type { WeaponFamily } from '../data/weapons';
import { WEAPONS } from '../data/weapons';
import type { ExpeditionPlan } from '../expedition/plan';
import type { ExpeditionConfig, ExpeditionResult } from '../expedition/types';
import { attackWindow, type AttackReport } from './bloodmoon';
import { claimConquista, claimTodas } from './conquistas';
import { alojar, darCama, fundir, type FusKind } from './fusion';
import { equipGolpe, unequipGolpe, upGolpe } from './golpes';
import { estimar, fecharRodada, novoLoop, pararLoop, simularRodada, simulateOffline, type LoopPlano, type OfflineReport } from './idleLoop';
import { buy, takeItems } from './market';
import { applyExpedition, type RewardSummary } from './rewards';
import { collect, repair, startBuild, tickObra, tickProduction } from './shelter';
import { addLog, type ExpedicaoServidor, type GameState, type HeroCfg } from './state';
import { buildExpedition } from './team';
import { bloqueioExpedicao, pagarExpedicao, tickUpkeep } from './upkeep';
import { HORA_MS } from './worldClock';
import { craft, equip, forja, upgradeTier } from './weapons';

/** Janela da Lua no servidor: floor(agora UTC / 8 h). Um ataque por janela, em `luaAtacada`. */
export const JANELA_MS = 8 * HORA_MS;

export interface Relogio {
  agora: number;
  janela: number;
  inicio: number;
  fim: number;
}

export interface Saida {
  ok: boolean;
  erro?: string;
  /** o documento do jogador deve ser apagado */
  apagar?: boolean;
  ataques: AttackReport[];
  relogio: Relogio;
  offline?: OfflineReport | null;
  config?: ExpeditionConfig;
  resultado?: ExpeditionResult;
  resumo?: RewardSummary;
  parada?: string | null;
  extra?: Record<string, unknown>;
}

export const relogioDe = (agora: number): Relogio => {
  const janela = Math.floor(agora / JANELA_MS);
  const inicio = janela * JANELA_MS;
  return { agora, janela, inicio, fim: inicio + JANELA_MS };
};

/**
 * Janelas de 8 h que ainda devem um ataque. No máximo a janela corrente
 * (e a anterior, se a ausência cruzou a fronteira). `attackWindow` marca `luaAtacada`.
 */
export function resolverLuas(s: GameState, now: number, _rand?: Rng): AttackReport[] {
  const out: AttackReport[] = [];
  const desde = Math.max((s.luaAtacada ?? -Infinity) + 1, s.criadoEm ?? 0, now - JANELA_MS);
  let inicio = Math.ceil(desde / JANELA_MS) * JANELA_MS;
  if (!Number.isFinite(inicio)) return out;
  for (; inicio <= now; inicio += JANELA_MS) {
    if ((s.expedicoes ?? 0) <= 0) {
      s.luaAtacada = Math.max(s.luaAtacada ?? -Infinity, inicio);
      continue;
    }
    const rep = attackWindow(s, inicio, makeRng(inicio >>> 0));
    if (rep) out.push(rep);
  }
  return out;
}

function passarTempo(s: GameState, now: number, rand: Rng, o: { semIdle?: boolean; semLua?: boolean } = {}): { ataques: AttackReport[]; offline: OfflineReport | null } {
  let offline: OfflineReport | null = null;
  const rodadaPaga = s.expedicao?.status === 'ativa';
  if (!o.semIdle && !rodadaPaga && s.loop?.ativo) offline = simulateOffline(s, now, rand, { semAtaque: true });
  if (!offline && !o.semIdle) {
    const mins = Math.min(480, (now - (s.ultimaVisita ?? now)) / 60000);
    if (mins >= 1) {
      const antesA = s.res.agua ?? 0, antesC = s.res.comida ?? 0;
      tickUpkeep(s, mins * 60000);
      const ga = Math.round(antesA - (s.res.agua ?? 0)), gc = Math.round(antesC - (s.res.comida ?? 0));
      if (ga > 0 || gc > 0) addLog(s, `Enquanto você estava fora, o abrigo consumiu ${ga} de água e ${gc} de comida.`);
      tickProduction(s, mins);
    }
  }
  const ataques = o.semLua ? [] : resolverLuas(s, now, rand);
  tickObra(s, now);
  s.ultimaVisita = now;
  return { ataques, offline };
}

function saida(s: GameState, now: number, rand: Rng, o: { semIdle?: boolean; semLua?: boolean } = {}): Saida {
  const passo = passarTempo(s, now, rand, o);
  return { ok: true, ataques: passo.ataques, relogio: relogioDe(now), offline: passo.offline };
}

const falha = (r: Saida, erro: string): Saida => ({ ...r, ok: false, erro });

function texto(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t || t.length > max) return null;
  return t;
}

function corpo(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
}

const ITENS = Object.keys(ITEM_MK) as ItemMk[];
const FAMILIAS: WeaponFamily[] = ['bastao', 'pistola', 'laser'];

function itensDe(raw: unknown): Partial<Record<ItemMk, number>> {
  const src = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const out: Partial<Record<ItemMk, number>> = {};
  for (const k of ITENS) {
    const n = src[k];
    if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) continue;
    out[k] = Math.min(99, Math.floor(n));
  }
  return out;
}

function num(v: unknown, min: number, max: number, falta: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return falta;
  return Math.min(max, Math.max(min, v));
}

/** Plano enviado pelo cliente. `isca` e os bônus saem do inventário do servidor, não do pedido. */
export function planoDe(raw: unknown): { plano: ExpeditionPlan; loop: LoopPlano; want: Partial<Record<ItemMk, number>> } {
  const p = corpo(raw);
  const want0 = itensDe(p.itens);
  const usarChaves = p.usarChaves !== false;
  const usarKits = p.usarKits !== false;
  const recrutar = p.recrutar !== false;
  const want: Partial<Record<ItemMk, number>> = {};
  for (const [k, n] of Object.entries(want0) as [ItemMk, number][]) {
    if (k.startsWith('chave_') && !usarChaves) continue;
    if (k === 'kit_cura' && !usarKits) continue;
    if (k === 'presente' && !recrutar) continue;
    want[k] = n;
  }
  const oficios = Array.isArray(p.oficios)
    ? p.oficios.filter((x): x is RecruitType => typeof x === 'string' && x in RECRUITS).slice(0, 24)
    : undefined;
  const pets = Array.isArray(p.pets)
    ? p.pets.filter((x): x is PetType => typeof x === 'string' && x in PETS).slice(0, 12)
    : undefined;
  const base = {
    recrutar, usarChaves, usarKits,
    kitLimiar: num(p.kitLimiar, 0, 1, 0.35),
    itens: want,
    kitModo: p.kitModo === 'media' ? 'media' as const : 'um' as const,
    kitMaxArena: Math.floor(num(p.kitMaxArena, 0, 20, 0)),
    semChave: p.semChave === 'pular' ? 'pular' as const : 'puzzle' as const,
    oficios,
    pets,
    recrutarVidaMin: num(p.recrutarVidaMin, 0, 1, 0),
    recuarVida: num(p.recuarVida, 0, 1, 0),
  };
  const loop: LoopPlano = { ...base, loopMaxH: Math.floor(num(p.loopMaxH, 1, 8, 8)), loopFalhas: Math.floor(num(p.loopFalhas, 1, 5, 3)) };
  const plano: ExpeditionPlan = { ...base, isca: 0 };
  return { plano, loop, want };
}

function idsDe(s: GameState, raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 2) return null;
  const ids: string[] = [];
  for (const x of raw) {
    if (typeof x !== 'string' || x.length > 40 || ids.includes(x)) return null;
    if (x === 'hero') { if (!s.hero) return null; ids.push(x); continue; }
    if (!s.recs.some((r) => r.id === x)) return null;
    ids.push(x);
  }
  return ids;
}

export function sincronizar(s: GameState, now: number, rand: Rng = Math.random): Saida {
  return saida(s, now, rand);
}

export function agir(s: GameState, now: number, raw: unknown, rand: Rng = Math.random): Saida {
  const b = corpo(raw);
  const tipo = texto(b.tipo, 40);
  if (tipo === 'reset') return { ok: true, apagar: true, ataques: [], relogio: relogioDe(now) };
  const r = saida(s, now, rand);
  if (!tipo) return falha(r, 'Ação desconhecida.');
  // números de recurso, dano e hora do corpo não são lidos
  switch (tipo) {
    case 'criar': {
      const nome = (texto(b.nome, 16) ?? 'Sobrevivente').replace(/[<>]/g, '');
      const hero: HeroCfg = { nome: nome || 'Sobrevivente' };
      const ap = corpo(b.aparencia);
      let n = 0;
      for (const [k, v] of Object.entries(ap)) {
        if (n >= 24) break;
        if (k === 'nome' || !/^[a-zA-Z]{1,24}$/.test(k) || typeof v !== 'string' || v.length > 32) continue;
        hero[k] = v;
        n++;
      }
      const primeiro = !s.hero;
      s.hero = hero;
      if (primeiro) addLog(s, `<b>${hero.nome}</b> acendeu a fogueira do abrigo. A primeira noite começou.`);
      return r;
    }
    case 'construir': {
      const id = texto(b.id, 40) as StructId | null;
      if (!id || !STRUCT_IDS.includes(id)) return falha(r, 'Estrutura desconhecida.');
      if (!startBuild(s, id, now)) return falha(r, 'Não dá pra construir agora.');
      return r;
    }
    case 'coletar': {
      const id = texto(b.id, 40) as StructId | null;
      if (id && !STRUCT_IDS.includes(id)) return falha(r, 'Estrutura desconhecida.');
      const got = collect(s, id && STRUCT_IDS.includes(id) ? id : undefined);
      r.extra = { got };
      return r;
    }
    case 'reparar': {
      const id = texto(b.id, 40) as StructId | null;
      if (!id || !STRUCT_IDS.includes(id)) return falha(r, 'Estrutura desconhecida.');
      if (!repair(s, id)) return falha(r, 'Não dá pra reparar agora.');
      return r;
    }
    case 'repararTudo': {
      let algum = false;
      for (const id of [...STRUCT_IDS]) if (repair(s, id)) algum = true;
      if (!algum) return falha(r, 'Nada pra reparar.');
      return r;
    }
    case 'equipar': {
      const membro = texto(b.membro, 40), arma = texto(b.arma, 40);
      if (!membro || !arma) return falha(r, 'Faltou quem ou qual arma.');
      if (membro === 'hero' ? !s.hero : !s.recs.some((rec) => rec.id === membro)) return falha(r, 'Esse membro não está no abrigo.');
      const antes = s.equip[membro];
      equip(s, membro, arma);
      if (s.equip[membro] !== arma && antes === s.equip[membro]) return falha(r, 'Essa arma não está no arsenal.');
      return r;
    }
    case 'fabricar': {
      const f = texto(b.familia, 20) as WeaponFamily | null;
      if (!f || !FAMILIAS.includes(f)) return falha(r, 'Arma desconhecida.');
      const it = craft(s, f);
      if (!it) return falha(r, 'Não dá pra fabricar agora.');
      r.extra = { nome: WEAPONS[f].nomes.comum };
      return r;
    }
    case 'evoluir': {
      const id = texto(b.arma, 40);
      if (!id) return falha(r, 'Arma desconhecida.');
      const it = upgradeTier(s, id);
      if (!it) return falha(r, 'Não dá pra evoluir agora.');
      r.extra = { nome: WEAPONS[it.familia].nomes[it.tier] };
      return r;
    }
    case 'forjar': {
      const id = texto(b.arma, 40);
      if (!id) return falha(r, 'Arma desconhecida.');
      const it = forja(s, id);
      if (!it) return falha(r, 'Não dá pra forjar agora.');
      r.extra = { nv: it.nv ?? 1, nome: WEAPONS[it.familia].nomes[it.tier] };
      return r;
    }
    case 'golpeUp':
    case 'golpeEquip':
    case 'golpeTirar': {
      const membro = texto(b.membro, 40), g = texto(b.golpe, 40) as GolpeId | null;
      if (!membro || !g || !GOLPE_IDS.includes(g)) return falha(r, 'Golpe desconhecido.');
      const ok = tipo === 'golpeUp' ? upGolpe(s, membro, g) : tipo === 'golpeEquip' ? equipGolpe(s, membro, g) : (unequipGolpe(s, membro, g), true);
      if (!ok) return falha(r, 'Não dá pra mudar esse golpe agora.');
      return r;
    }
    case 'comprar': {
      const id = texto(b.id, 40);
      if (!id || !buy(s, id)) return falha(r, 'Não dá pra comprar isso agora.');
      return r;
    }
    case 'conquista': {
      const id = texto(b.id, 60);
      if (!id || !claimConquista(s, id)) return falha(r, 'Conquista ainda não está pronta.');
      return r;
    }
    case 'conquistas': {
      const n = claimTodas(s);
      if (!n) return falha(r, 'Nada pra resgatar.');
      r.extra = { n };
      return r;
    }
    case 'alojar': {
      const id = texto(b.id, 40);
      if (!id || !alojar(s, id)) return falha(r, 'Não deu pra alojar.');
      return r;
    }
    case 'cama': {
      const id = texto(b.id, 40);
      if (!id || !darCama(s, id)) return falha(r, 'Sem cama livre.');
      return r;
    }
    case 'fundir': {
      const kind = b.kind === 'pet' ? 'pet' : b.kind === 'rec' ? 'rec' : null;
      const id = texto(b.id, 40);
      if (!kind || !id || !fundir(s, kind as FusKind, id)) return falha(r, 'Fusão não disponível.');
      return r;
    }
    case 'squad': {
      const id = texto(b.id, 40);
      if (!id || !s.recs.some((rec) => rec.id === id)) return falha(r, 'Recruta desconhecido.');
      s.squadPadrao = id;
      return r;
    }
    case 'loopParar': {
      pararLoop(s, 'jogador', undefined, now);
      return r;
    }
    case 'loopPlano': {
      if (!s.loop) return falha(r, 'O loop não está ligado.');
      const { loop } = planoDe(b.plano);
      s.loop.plano = { ...s.loop.plano, ...loop, itens: { ...loop.itens } };
      return r;
    }
    default:
      return falha(r, 'Ação desconhecida.');
  }
}

export function partirExpedicao(s: GameState, now: number, raw: unknown, rand: Rng = Math.random): Saida {
  const b = corpo(raw);
  const exp = s.expedicao;
  const r = saida(s, now, rand, { semIdle: exp?.status === 'ativa' });
  if (exp?.status === 'ativa') return falha(r, 'Já há uma expedição no relógio do servidor.');
  if (exp?.status === 'resolvida' && now < exp.fim) return falha(r, 'A expedição anterior ainda não acabou no relógio do servidor.');
  const mapId = texto(b.mapId, 40);
  if (!mapId || !MAPS[mapId]) return falha(r, 'Mapa indisponível.');
  const map = MAPS[mapId];
  if (map.requer && !(s.vencidos ?? []).includes(map.requer)) return falha(r, 'Esse mapa ainda não está liberado.');
  const ids = idsDe(s, b.ids);
  if (!ids) return falha(r, 'O squad não está no abrigo.');
  const pet = b.pet == null || b.pet === '' ? null : texto(b.pet, 40);
  if (pet && !s.pets.some((p) => p.id === pet)) return falha(r, 'Esse pet não está no abrigo.');
  const { plano, loop, want } = planoDe(b.plano);
  const bloq = bloqueioExpedicao(s, ids, mapId, true);
  if (bloq) return falha(r, bloq);
  if (!pagarExpedicao(s, ids, mapId, true)) return falha(r, 'Faltam provisões.');
  const got = takeItems(s, want);
  const config = buildExpedition(s, ids, pet, mapId);
  if (got.adrenalina) config.bonus.dano *= 1.15;
  if (got.colete) config.bonus.vida *= 1.15;
  config.plano = { ...plano, isca: (got.presente ?? 0) * 15, itens: got };
  const querLoop = b.loop === true;
  config.manual = b.manual === true && !querLoop;
  s.ultimoMapa = mapId;
  if (ids[1]) s.squadPadrao = ids[1];
  if (querLoop) {
    if (b.continuar === true && s.loop?.ativo) {
      s.loop.ids = [...ids];
      s.loop.pet = pet;
      s.loop.plano = { ...loop, itens: want };
      s.loop.emCurso = { itens: got, t: now };
    } else {
      s.loop = novoLoop(mapId, ids, pet, { ...loop, itens: want }, now);
      s.loop.emCurso = { itens: got, t: now };
    }
  } else s.loop = null;
  const seed = Math.floor(rand() * 0x7fffffff);
  const dur = Math.max(1000, Math.round(estimar(config).duracao * 1000));
  const expedicao: ExpedicaoServidor = {
    id: 'e' + now.toString(36) + seed.toString(36),
    status: 'ativa', inicio: now, fim: now + dur, seed, manual: !!config.manual, cfg: config,
  };
  s.expedicao = expedicao;
  r.config = config;
  return r;
}

export function resolverExpedicao(s: GameState, now: number, _corpo: unknown, _rand: Rng = Math.random): Saida {
  const exp = s.expedicao;
  if (!exp) return falha(saida(s, now, _rand, { semIdle: true }), 'Nenhuma expedição para resolver.');
  if (exp.status === 'resolvida') {
    const r = saida(s, now, _rand, { semIdle: true });
    r.resultado = exp.resultado;
    r.resumo = exp.resumo;
    r.parada = exp.parada ?? null;
    r.config = exp.cfg;
    return r;
  }
  const r = saida(s, now, _rand, { semIdle: true, semLua: true });
  // o corpo pode trazer dano, loot ou sucesso: a simulação do cfg congelado é que vale
  const rod = simularRodada(exp.cfg, makeRng(exp.seed >>> 0), { online: true });
  const resumo = applyExpedition(s, rod.r, makeRng((exp.seed ^ 0x9e3779b9) >>> 0), { semAtaque: true, now });
  r.ataques = resolverLuas(s, now, _rand);
  const parada = s.loop ? fecharRodada(s, rod.r, now) : null;
  exp.status = 'resolvida';
  exp.resultado = rod.r;
  exp.resumo = resumo;
  exp.parada = parada;
  r.resultado = rod.r;
  r.resumo = resumo;
  r.parada = parada;
  r.config = exp.cfg;
  return r;
}
