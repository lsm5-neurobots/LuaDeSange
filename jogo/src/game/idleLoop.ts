// MODO LOOP (idle): a mesma expedição se repete sozinha (mesmo mapa, squad, pet e plano) e continua OFFLINE
// por até 8 h. Regras puras, sem DOM: estado do loop, início/fim de rodada (reusados pela tela da expedição)
// e o SIMULADOR RÁPIDO que resolve as rodadas de quando o jogador estava fora.
//
// Como o simulador funciona (por rodada = 1 dia, igual ao jogo):
//  1. iniciarRodada: paga as provisões (custoExpedicao), repõe chaves/kits/itens do plano a partir do inventário
//     e monta a ExpeditionConfig com buildExpedition (mesmos bônus de bancada, pet, fome/sede, Lua de Sangue).
//  2. simularRodada: percorre as áreas do mapa em ordem. Em cada área vasculha objetos e abre o baú (com chave;
//     offline ninguém resolve o puzzle) e luta as arenas. Cada arena é um duelo de Lanchester:
//        margem m = (dano/s do squad × vida efetiva do squad) / (vida dos zumbis × dano dos zumbis)
//     e a chance de passar dela é p = 1 / (1 + (M50 / m)^INCL). Kits de cura (se o plano usa) entram quando
//     p fica baixa: cada kit dá +50% de vida efetiva naquela arena. Falhou numa arena = expedição falha ali.
//     Vida/dano dos zumbis seguem combat.ts (zMult por mapa e arena de data/balance.ts, formas da Lua) e o squad segue
//     fighter.ts (VMAX, LMUL, ARM, DODGE, arma × raridade × força, golpes, bônus).
//  3. O ExpeditionResult sintético vai para applyExpedition (o MESMO do jogo): falha = metade do loot (recuo = tudo), XP por
//     abate, bestiário, tickDia (consumo do abrigo + manutenção + deserção) e dia++.
//     Lua de Sangue = RELÓGIO REAL (worldClock.ts: janela de 30 min a cada 12 h, UTC): a rodada que COMEÇA
//     dentro de uma janela roda em modo lua (formas enluaradas, mais loot) e cada janela atravessada no tempo
//     offline gera 1 ataque ao abrigo (attackWindow de bloodmoon.ts: 1 por janela), mesmo depois que o loop parou.
//  4. fecharRodada: conta vitórias/falhas e para o loop com 3 falhas SECAS seguidas (caiu antes da 3ª arena).
//  Rodadas offline rendem OFFLINE_REND (60%) do XP e do loot (data/balance.ts); online rendem 100%.
// Consumo do abrigo: durante o loop o abrigo come via tickDia (1×/rodada), como no jogo online (a tela da
// expedição não roda o tickUpkeep). Por isso o tempo em loop NÃO passa pelo tickUpkeep; só o que sobra depois
// que o loop para (falta de provisão etc.) é cobrado em tempo real com tickUpkeep. Produção das estruturas
// segue o tempo todo (tickProduction, com o teto de cada estrutura).
//
// CALIBRAGEM (E2E real em 8×, build isolado; script fora do repo: scratchpad/e2e/loopcal.mjs). Tempo = relógio
// de jogo w.clock (= tempo em 1×), chaves sobrando (sem puzzle), sem kits, sem Lua. "m" = margem de Lanchester.
//   cenário                                         real: resultado · arenas · tempo  | simulador: chance · tempo · onde cai
//   A MZ dia 1 · herói nv1 bastão comum              falhou na arena 3 · 2 · 88 s       | 0%  · 87 s (2 arenas) · p 75%/47%/47%
//   B MZ dia 15 · herói nv1 bastão comum             falhou na arena 1 · 0 · 16 s       | 0%  · m 0,07 → p 3%
//   G MZ dia 6 · herói nv3 bastão comum              falhou na arena 2 · 1 · 50 s       | 0%  · p 81%/53%
//   C MZ dia 10 · 2× nv5 pistola rara                falhou no Brutamonte · 13 · 478 s  | 10% · 460 s até lá · Brutamonte p 27%
//   E MZ dia 2 · herói nv6 pistola rara ★3           falhou no Brutamonte · 13 · 501 s  | 19% · 455 s até lá · Brutamonte p 28%
//   H MZ dia 4 · 2× nv8 pistola rara ★3              VENCEU · 21 · 702 s                | 97% · 746 s
//   L MZ dia 4 · nv14 laser lunar ★5 + nv12 pistola  VENCEU · 21 · 647 s                | 100% · 697 s
//   F Olinda dia 8 · 2× nv3 bastão incomum           falhou na arena 4 · 3 · 152 s      | 0%  · p 62%/70%/53%/46%
//   D Olinda dia 10 · 2× nv6 pistola rara ★3 + cão   VENCEU · 18 · 707 s                | 34% · 711 s
//   O Olinda dia 12 · nv12 laser raro + nv12 pistola  VENCEU · 18 · 640 s                | 99% · 668 s
// Ajustes que saíram daí: o tempo quase não depende do dano (≈26 s fixos por arena + vida/dano por s), M50 = 0,22,
// zumbis de Olinda bem mais perigosos que vida×dano (ameacaMapa + AMEACA) e chefes com fator próprio (BOSS_K).
// (tabela acima: regra antiga, dificuldade por dia.) REBALANCEAMENTO (data/balance.ts: escala por mapa/arena, sem dia),
// conferido em 8× no dev server (scratchpad/e2e/loopcal2.mjs; "esp." = arenas esperadas pelo simulador):
//   N1 MZ · herói nv1 bastão comum                   falhou na arena 4 · 3 arenas · 140 s | esp. 3,0 · p 98/88/79/47%
//   N2 MZ · 2× nv8 laser comum ★4 (2×)               falhou no Brutamonte · 13 · 467 s    | esp. 13,4 · Brutamonte p 13%
//   N3 MZ · nv11+nv10 laser comum ★4 + cão           falhou na arena 19 · 18 · 684 s      | esp. 16,4 · p 70%/56% ali
//   N4 Olinda · 2× nv13 laser incomum ★4 + cão (3×)  caiu na/antes da Chorona · 10–11 · 390–512 s | esp. 6,6 · Chorona p 11%
// O muro dos chefes bate; nas arenas comuns de Olinda o simulador é um pouco pessimista (squad real vai mais longe).
import { aceitaEncontro } from '../expedition/plan';
import { MAPS, type MapDef } from '../data/maps';
import { zMult, OFFLINE_REND } from '../data/balance';
import { STRUCTS, type StructId } from '../data/structures';
import { ZOMBIES, type ZombieId } from '../data/zombies';
import { WEAPONS, weaponDamage, forcaMult, type WeaponFamily } from '../data/weapons';
import { gradeMul, type Grade } from '../data/grades';
import { RECRUITS, PETS, type PetType, type RecruitType } from '../data/recruits';
import { LOOT_TO_RES, type Bag, type ResId } from '../data/resources';
import type { ItemMk } from '../data/market';
import { makeRng, rng as defaultRng, type Rng } from '../core/rng';
import type { ExpeditionConfig, ExpeditionResult, TeamMember } from '../expedition/types';
import { planKeys, type ExpeditionPlan } from '../expedition/plan';
import { planEncounters, recruitChance, type EncounterOutcome } from './encounters';
import { applyExpedition } from './rewards';
import { buildExpedition } from './team';
import { rolarPresenca, semSorteio } from './presenca';
import { bloqueioExpedicao, custoExpedicao, pagarExpedicao, tickUpkeep } from './upkeep';
import { takeItems } from './market';
import { tickProduction } from './shelter';
import { attackWindow, type AttackReport } from './bloodmoon';
import { bloodMoonAt, bloodMoonWindows } from './worldClock';
import { addLog, type GameState, type Recruit, type Pet } from './state';

// ---------------- parâmetros ----------------
/** Teto do tempo simulado fora do jogo. O que passar disso é ignorado. */
export const LOOP_MAX_MS = 8 * 3600_000;
/** Ausência mínima para simular (abaixo disso, só retoma). */
export const LOOP_MIN_MS = 60_000;
/** Pausa entre rodadas (tela de resultado com contagem regressiva), em s. */
export const PAUSA_RODADA_S = 6;
/** Falhas "secas" seguidas até o loop parar sozinho. */
export const MAX_FALHAS = 3;
/** Falha seca = caiu antes de limpar este nº de arenas (o squad não aguenta o mapa). Falhas mais fundas não param o
 *  loop: rendem metade do loot e XP e são o jeito normal de progredir num mapa que ainda não dá pra vencer. */
export const FALHA_SECA_ARENAS = 3;
/** Encontros (sobreviventes/pets) acontecem offline com chance reduzida. */
export const ENC_OFFLINE = 0.5;

/** Margem de Lanchester com 50% de chance de vencer a arena e inclinação da curva. */
export const M50 = 0.22;
export const INCL = 3;
/** Tempo fixo por arena (ondas entrando, aviso, GO, cura, andar até a próxima) e por objeto vasculhado, em s
 *  de jogo. Medido: ~37 s por arena quase independente do dano do squad (o ritmo das ondas manda). */
export const T_ARENA = 26;
export const T_OBJ = 2.2;
/** Fator de conversão "dano nominal/s" → dano real por segundo (combos, mira, deslocamento). */
export const DPS_K = 1;
/** Perigo extra de zumbis cujo dano não está no `dmg` (salto, explosão, grito que chama reforço). */
const AMEACA: Partial<Record<ZombieId, number>> = { saltador: 2, gritador: 2.5, barrigudo: 2, percussionista: 1.5, barqueiro: 1.3, malandro: 1.4 };
/** Mapas de nível alto: zumbis mais agressivos do que vida×dano indica (Olinda nv 6 → ×3,25). */
const ameacaMapa = (map: MapDef) => 1 + 0.45 * Math.max(0, map.nivelRecomendado - 1);
/** Chefes: padrões de ataque muito diferentes (Brutamonte derruba squads que passam pela Chorona). */
const BOSS_K: Partial<Record<ZombieId, number>> = { brutamonte: 3, acougueiro: 1.5, chorona: 1, meianoite: 0.5, estivador: 1.5, passista: 1, maquinista: 1.5 };
/** Puzzle de baú sem chave (5 s) e abertura com chave (1,4 s). */
const T_PUZZLE = 5.8, T_CHAVE = 1.6;
/** Golpes especiais: +X de dano por nível equipado. */
const GOLPE_K = 0.06;
/** Cadência efetiva por família (golpes/tiros por segundo × alcance útil). */
const FAM_K: Record<WeaponFamily, number> = { bastao: 1.6, pistola: 1.7, laser: 1.25 };
/** Quando a chance da arena cai abaixo disso, o kit de cura entra (se o plano usa kits). */
const KIT_USO = 0.9;

// ---------------- estado ----------------
export type Parada = 'provisoes' | 'falhas' | 'squad' | 'mapa' | 'jogador';

export interface LoopPlano {
  recrutar: boolean;
  usarChaves: boolean;
  usarKits: boolean;
  kitLimiar: number;
  /** itens repostos do inventário a cada rodada (chaves, kits, presentes, adrenalina, colete) */
  itens: Partial<Record<ItemMk, number>>;
  kitModo?: 'um' | 'media';
  kitMaxArena?: number;
  semChave?: 'puzzle' | 'pular';
  oficios?: RecruitType[];
  pets?: PetType[];
  recrutarVidaMin?: number;
  recuarVida?: number;
  /** teto do loop offline em horas (1..8; ausente = 8) */
  loopMaxH?: number;
  /** para depois de N falhas secas seguidas (1..5; ausente = MAX_FALHAS) */
  loopFalhas?: number;
}
/** teto do loop offline deste plano */
export const loopMaxMs = (p?: LoopPlano) => Math.max(1, Math.min(8, p?.loopMaxH ?? 8)) * 3600_000;

export interface LoopState {
  ativo: boolean;
  mapId: string;
  ids: string[];
  pet: string | null;
  plano: LoopPlano;
  /** quando o loop foi ligado */
  desde: number;
  rodadas: number;
  vitorias: number;
  falhas: number;
  falhasSeguidas: number;
  /** rodada já paga e em andamento (itens tirados do inventário): se o jogo fechar, o simulador a reaproveita */
  emCurso: { itens: Partial<Record<ItemMk, number>>; t: number } | null;
  /** velocidade escolhida na tela (reaplicada a cada rodada) */
  velocidade?: number;
  /** por que parou (última vez) */
  parada?: { motivo: Parada; msg: string; t: number } | null;
}

export function novoLoop(mapId: string, ids: string[], pet: string | null, plano: LoopPlano, now = Date.now()): LoopState {
  return { ativo: true, mapId, ids: [...ids], pet, plano: { ...plano, itens: { ...plano.itens } }, desde: now, rodadas: 0, vitorias: 0, falhas: 0, falhasSeguidas: 0, emCurso: null, parada: null };
}

export const loopAtivo = (s: GameState): boolean => !!s.loop?.ativo;

const MSG: Record<Parada, string> = {
  provisoes: 'faltaram provisões para partir',
  falhas: `o squad caiu logo no começo ${MAX_FALHAS} vezes seguidas`,
  squad: 'alguém do squad não está mais no abrigo',
  mapa: 'mapa indisponível',
  jogador: 'você parou o loop',
};

export function pararLoop(s: GameState, motivo: Parada, msg = MSG[motivo], now = Date.now()): void {
  const L = s.loop;
  if (!L) return;
  if (L.ativo) addLog(s, `<b>Loop parado</b> depois de ${L.rodadas} rodada${L.rodadas === 1 ? '' : 's'}: ${msg}.`);
  L.ativo = false;
  L.parada = { motivo, msg, t: now };
}

export type Inicio = { config: ExpeditionConfig; parada?: undefined } | { config?: undefined; parada: Parada; msg: string };

/**
 * Começa uma rodada do loop: confere o squad, paga provisões, repõe os itens do plano e monta a config.
 * Se já há uma rodada paga em andamento (`emCurso`, ex.: o jogo fechou no meio), reaproveita sem pagar de novo.
 */
export function iniciarRodada(s: GameState, now = Date.now()): Inicio {
  const L = s.loop;
  if (!L?.ativo) return { parada: 'jogador', msg: MSG.jogador };
  const stop = (p: Parada, msg = MSG[p]): Inicio => { pararLoop(s, p, msg, now); return { parada: p, msg }; };
  if (!MAPS[L.mapId]) return stop('mapa');
  if (L.ids.some((id) => (id === 'hero' ? !s.hero : !s.recs.some((r) => r.id === id)))) return stop('squad');
  if (L.pet && !s.pets.some((p) => p.id === L.pet)) L.pet = null;
  let got: Partial<Record<ItemMk, number>>;
  if (L.emCurso) got = L.emCurso.itens;
  else {
    const bloq = bloqueioExpedicao(s, L.ids, L.mapId, false); // loop: sem ração de emergência
    if (bloq) return stop('provisoes', bloq.replace(/\.\s*Colete.*$/, ''));
    pagarExpedicao(s, L.ids, L.mapId, false);
    got = takeItems(s, L.plano.itens);
  }
  const config = buildExpedition(s, L.ids, L.pet, L.mapId);
  if (got.adrenalina) config.bonus.dano *= 1.15;
  if (got.colete) config.bonus.vida *= 1.15;
  const plano: ExpeditionPlan = {
    recrutar: L.plano.recrutar, usarChaves: L.plano.usarChaves, usarKits: L.plano.usarKits, kitLimiar: L.plano.kitLimiar,
    isca: (got.presente ?? 0) * 15, itens: got,
    kitModo: L.plano.kitModo, kitMaxArena: L.plano.kitMaxArena, semChave: L.plano.semChave,
    oficios: L.plano.oficios, pets: L.plano.pets, recrutarVidaMin: L.plano.recrutarVidaMin, recuarVida: L.plano.recuarVida,
  };
  config.plano = plano;
  L.emCurso = { itens: got, t: now };
  s.ultimoMapa = L.mapId;
  return { config };
}

/** Fecha a rodada (depois do applyExpedition): placar do loop e parada por falhas seguidas. */
export function fecharRodada(s: GameState, r: ExpeditionResult, now = Date.now()): Parada | null {
  const L = s.loop;
  if (!L) return null;
  L.emCurso = null;
  L.rodadas++;
  if (r.sucesso) { L.vitorias++; L.falhasSeguidas = 0; } else { L.falhas++; if (r.arenasLimpas < FALHA_SECA_ARENAS) L.falhasSeguidas++; else L.falhasSeguidas = 0; }
  if (L.ativo && L.falhasSeguidas >= (L.plano.loopFalhas ?? MAX_FALHAS)) { pararLoop(s, 'falhas', `o squad caiu logo no começo ${L.plano.loopFalhas ?? MAX_FALHAS} vezes seguidas`, now); return 'falhas'; }
  return L.ativo ? null : L.parada?.motivo ?? 'jogador';
}

// ---------------- poder do squad × dificuldade ----------------
interface Squad { dps: number; ehp: number }

export function squadPower(team: TeamMember[], bonus: ExpeditionConfig['bonus']): Squad {
  let dps = 0, ehp = 0;
  for (const m of team) {
    const g = gradeMul(m.nota as Grade | undefined), lv = Math.max(1, m.lv);
    const golpes = (m.golpes ?? []).reduce((a, x) => a + x.nv, 0);
    dps += weaponDamage(m.arma.familia, m.arma.tier) * forcaMult(m.arma.nv) * (1 + 0.16 * (lv - 1)) * g * bonus.dano * FAM_K[m.arma.familia] * (1 + GOLPE_K * golpes);
    const hp = (90 + 22 * (lv - 1)) * bonus.vida * g;
    const arm = 1 - Math.min(0.6, 0.032 * (lv - 1)), dodge = Math.min(0.85, 0.15 + 0.035 * lv + bonus.esquiva);
    ehp += (hp / arm / (1 - dodge)) * (1 + 0.15 * (bonus.cura - 1));
  }
  return { dps, ehp };
}

export interface ArenaDef { area: number; areaId: string; list: ZombieId[]; hp: number; dmg: number; boss: 'mini' | 'chefe' | null }

const LUA_HP = 0.5 * 1.3 + 0.3 * 1.6 + 0.2, LUA_DMG = 0.5 + 0.3 * 1.5 + 0.2;

/** Arenas do mapa em ordem, com vida e dano somados dos zumbis (combat.ts: zMult por mapa/arena, Lua).
 *  `_dia` ficou só por compatibilidade: a dificuldade não depende mais dos dias (data/balance.ts). */
export function arenasDe(map: MapDef, _dia: number, lua: boolean): ArenaDef[] {
  const out: ArenaDef[] = [], am = ameacaMapa(map);
  let ai = 0;
  Object.keys(map.ondas).forEach((areaId, idx) => {
    for (const list of map.ondas[areaId]) {
      let hp = 0, dmg = 0, boss: ArenaDef['boss'] = null;
      for (const k of list) {
        const Z = ZOMBIES[k], em = zMult(map.id, ai, Z.boss);
        if (Z.boss) { boss = Z.boss; hp += Z.hp * em.hp; dmg += Z.dmg * em.dmg * 2.2 * (BOSS_K[k] ?? 1.5); }
        else { hp += Z.hp * em.hp * (lua ? LUA_HP : 1); dmg += Math.max(8, Z.dmg) * (AMEACA[k] ?? 1) * am * em.dmg * (lua ? LUA_DMG : 1); }
      }
      out.push({ area: idx + 1, areaId, list, hp, dmg, boss });
      ai++;
    }
  });
  return out;
}

const chanceArena = (m: number) => 1 / (1 + Math.pow(M50 / Math.max(1e-6, m), INCL));
const margem = (sq: Squad, a: ArenaDef, ehpMul = 1) => (sq.dps * sq.ehp * ehpMul) / (a.hp * a.dmg);
const tempoArena = (sq: Squad, a: ArenaDef) => T_ARENA + a.hp / Math.max(1, sq.dps * DPS_K) + (a.boss ? 3.2 : 0);

export interface Estimativa { chance: number; duracao: number; margemMin: number; arenas: number }

/** Chance de vencer e duração esperada (s em 1×) de uma expedição, sem rolar nada. */
export function estimar(cfg: ExpeditionConfig): Estimativa {
  const map = MAPS[cfg.mapId], sq = squadPower(cfg.team, cfg.bonus), ars = arenasDe(map, cfg.dia, cfg.lua);
  let chance = 1, dur = 0, mMin = Infinity;
  for (const a of ars) { const m = margem(sq, a); mMin = Math.min(mMin, m); chance *= chanceArena(m); dur += tempoArena(sq, a); }
  const areas = Object.keys(map.ondas).filter((id) => !(map.semVasculhar ?? []).includes(id)).length;
  dur += areas * (3.5 * T_OBJ + T_CHAVE) + 6;
  return { chance, duracao: dur, margemMin: mMin, arenas: ars.length };
}

// ---------------- uma rodada simulada ----------------
/** Itens que saem de objetos vasculhados (art-src/objects/obj.js via LOOT_TO_RES; desconhecido vira sucata). */
const OBJ_LOOT: [ResId, number][] = [['sucata', 0.42], ['comida', 0.16], ['pano', 0.12], ['agua', 0.1], ['madeira', 0.08], ['pecas', 0.08], ['gasolina', 0.02], ['remedio', 0.02]];
const pickW = (rand: Rng): ResId => { let r = rand(); for (const [k, w] of OBJ_LOOT) { r -= w; if (r < 0) return k; } return 'sucata'; };

export interface Rodada { r: ExpeditionResult; tempo: number; kitsUsados: number; chavesUsadas: number; trancados: number }

/** `o.online`: rodada jogada com a tela aberta (ferramenta de balanceamento): encontros vêm de cfg.encontros, sem o
 *  corte ENC_OFFLINE. Offline (padrão) os encontros são sorteados pelo estado do simulateOffline. */
export function simularRodada(cfg: ExpeditionConfig, rand: Rng = defaultRng, o: { online?: boolean } = {}): Rodada {
  // ondas já sorteadas pela raridade (buildExpedition): o offline mata os mesmos tipos que viriam online
  const map = cfg.ondas ? { ...MAPS[cfg.mapId], ondas: cfg.ondas } : MAPS[cfg.mapId], sq = squadPower(cfg.team, cfg.bonus), ars = arenasDe(map, cfg.dia, cfg.lua);
  const plano = cfg.plano, lua = cfg.lua;
  const lootM = cfg.bonus.loot * (lua ? 1.5 : 1), itemM = cfg.bonus.loot * (lua ? 1.25 : 1);
  const pk = planKeys(plano);
  const keys: Record<string, number> = { comum: 1 + cfg.bonus.chaves + pk.comum, medico: pk.medico, militar: pk.militar, raro: pk.raro };
  const kitsLevados = plano?.itens.kit_cura ?? 0;
  let kits = plano?.usarKits === false ? 0 : kitsLevados, kitsUsados = 0, chavesUsadas = 0, trancados = 0;
  const bag: Bag = {}, killsBy: Partial<Record<ZombieId, number>> = {}, killsForm: Record<string, number> = {};
  const projetos: WeaponFamily[] = [], armas: WeaponFamily[] = [];
  const add = (k: ResId, q: number) => { if (q > 0) bag[k] = (bag[k] ?? 0) + q; };
  const item = (k: ResId, n: number) => add(k, Math.max(1, Math.round(n * itemM)));
  let tempo = 0, cleared = 0, maxArea = 1, ok = true, miniBoss = false, chefe = false, abates = 0, recuou = false;
  const areaIds = Object.keys(map.ondas);
  const pas: number[] = [];

  for (let idx = 0; idx < areaIds.length && ok; idx++) {
    const id = areaIds[idx];
    maxArea = idx + 1;
    if (!(map.semVasculhar ?? []).includes(id)) {
      const spots = 3 + ((idx + 1) % 2);
      for (let i = 0; i < spots; i++) {
        tempo += T_OBJ;
        if (rand() < (cfg.pet?.tipo === 'gato' ? 0.95 : 0.85)) item(pickW(rand), 1);
        if (rand() < 0.12) keys.comum++;
      }
      const tipo = (idx + 1) % 4 === 0 ? 'militar' : 'comum';
      if (plano?.usarChaves !== false && (keys[tipo] ?? 0) > 0) {
        keys[tipo]--; chavesUsadas++;
        tempo += plano?.usarChaves ? T_CHAVE : T_PUZZLE;
        item('sucata', 2);
        const pp = map.loot.projeto * (tipo === 'militar' ? 1.6 : 0.6);
        if (rand() < pp) { const r = rand(); projetos.push(r < 0.45 ? 'pistola' : r < 0.75 ? 'laser' : 'bastao'); }
        if (rand() < (tipo === 'militar' ? 0.3 : 0.1)) { const r = rand(); armas.push(r < 0.45 ? 'pistola' : r < 0.7 ? 'bastao' : 'laser'); }
      } else { trancados++; tempo += plano?.semChave === 'pular' ? 0.8 : T_PUZZLE; }
    }
    for (const a of ars.filter((x) => x.areaId === id)) {
      let mul = 1, p = chanceArena(margem(sq, a));
      // kit entra quando a arena fica arriscada; limiar mais alto = entra antes; teto por arena do plano
      const kitUso = KIT_USO + ((plano?.kitLimiar ?? 0.35) - 0.35) * 0.2, cap = plano?.kitMaxArena || Infinity;
      for (let nk = 0; kits > 0 && p < kitUso && nk < cap; nk++) { kits--; kitsUsados++; mul += 0.5; p = chanceArena(margem(sq, a, mul)); }
      // plano com recuo: arena arriscada demais e sem kit → volta com o loot (limiar 30% = recua quando a chance da arena < 30%)
      const rv = plano?.recuarVida ?? 0;
      if (rv > 0 && kits === 0 && p < (a.list.some((k) => ZOMBIES[k].boss) ? rv * 0.4 : rv)) { recuou = true; ok = false; break; } // no chefe arrisca mais
      pas.push(p);
      const ta = tempoArena(sq, a);
      if (rand() >= p) { tempo += ta * (0.3 + 0.5 * rand()); ok = false; break; }
      tempo += ta;
      const ai = cleared;
      cleared++;
      for (const k of a.list) {
        const Z = ZOMBIES[k];
        abates++;
        killsBy[k] = (killsBy[k] ?? 0) + 1;
        const form = Z.boss ? 'normal' : !lua ? 'comum' : (() => { const r = rand(); return r < 0.45 ? 'enluarado' : r < 0.7 ? 'plenilunar' : 'comum'; })(); // = combat.formFor (LUA-08)
        killsForm[k + ':' + form] = (killsForm[k + ':' + form] ?? 0) + 1;
        for (const [res, pr] of Object.entries(Z.drop ?? {})) if (rand() < (pr ?? 0)) add(LOOT_TO_RES[res] ?? (res as ResId), (pr ?? 0) >= 1 ? Math.round(pr!) : 1);
        if (Z.boss === 'mini') { miniBoss = true; keys.militar++; for (const [r, v] of Object.entries(map.loot.miniBoss)) add(r as ResId, v ?? 0); }
        if (Z.boss === 'chefe') chefe = true;
      }
      const m = (1 + ai * 0.06) * lootM;
      for (const [r, v] of Object.entries(map.loot.porArena)) add(r as ResId, Math.floor((v ?? 0) * m * (0.6 + rand() * 0.8)));
    }
  }
  tempo += ok ? 6 : 3.5;
  const sucesso = ok && chefe;
  if (sucesso) for (const [k, v] of Object.entries(map.loot.vitoria)) add(k as ResId, v ?? 0);

  // sobras do plano (engine: planLeftover): kits não usados e chaves do plano que não foram gastas (grátis primeiro)
  const itensSobra: Partial<Record<ItemMk, number>> = {};
  if (kitsLevados - kitsUsados > 0) itensSobra.kit_cura = kitsLevados - kitsUsados;
  const KT: Record<string, string> = { chave_comum: 'comum', chave_medico: 'medico', chave_militar: 'militar', chave_raro: 'raro' };
  for (const [idk, n] of Object.entries(plano?.itens ?? {})) if (KT[idk] && n) itensSobra[idk as ItemMk] = Math.max(0, Math.min(n, keys[KT[idk]] ?? 0));

  // encontros: só com "recrutar" ligado, chance reduzida, missão resolvida pelo desempenho estimado
  const encontros: EncounterOutcome[] = [];
  if (plano?.recrutar) {
    for (const p of o.online ? cfg.encontros ?? [] : cfgEncounters(cfg, rand)) {
      if (!o.online && rand() >= ENC_OFFLINE) continue;
      if (!aceitaEncontro(plano, p)) continue; // ofício/pet fora da lista do plano
      const ate = areaIds.indexOf(p.ate);
      const feita = sucesso || maxArea - 1 > ate;
      const pm = pas.length ? pas.reduce((x, y) => x + y, 0) / pas.length : 0.5;
      const desempenho = feita ? Math.max(0.1, Math.min(0.95, 0.4 + 0.9 * (pm - 0.85) + (rand() - 0.5) * 0.2)) : 0.1;
      const chance = feita ? recruitChance(p.nota, desempenho, false, plano.isca) : 0;
      const roll = rand();
      encontros.push({ plan: p, ok: roll < chance, progresso: feita ? 'cumprida' : 'não deu tempo', motivo: 'simulado', desempenho, chance, roll });
    }
  }

  const r: ExpeditionResult = {
    mapId: cfg.mapId, sucesso, areaAlcancada: maxArea, totalAreas: areaIds.length, arenasLimpas: cleared, totalArenas: ars.length,
    abates, abatesPorTipo: killsBy, abatesPorForma: killsForm, itensSobra, kitsUsados, loot: bag, projetos, armas,
    miniBoss, chefe, lua, recuou: !sucesso && recuou, duracao: tempo, teamIds: cfg.team.map((m) => m.id), encontros,
  };
  return { r, tempo, kitsUsados, chavesUsadas, trancados };
}

/** Encontros planejados pela rodada simulada (o simulador sorteia com o próprio Rng). */
let encState: GameState | null = null;
function cfgEncounters(cfg: ExpeditionConfig, rand: Rng) {
  if (!encState) return [];
  return planEncounters(encState, MAPS[cfg.mapId], { lua: cfg.lua, rand });
}

// ---------------- simulação offline ----------------
export interface OfflineReport {
  /** ausência real e tempo efetivamente simulado (ms) */
  ausenteMs: number;
  simuladoMs: number;
  /** passou do teto de 8 h (o resto foi ignorado) */
  cortado: boolean;
  mapId: string;
  rodadas: number;
  vitorias: number;
  falhas: number;
  diaInicio: number;
  diaFim: number;
  loot: Bag;
  /** provisões pagas nas partidas */
  provisoes: Bag;
  /** saldo final do estoque (depois − antes) */
  saldo: Bag;
  /** produção das estruturas acumulada (esperando coleta) */
  producao: Bag;
  xp: number;
  niveis: { nome: string; de: number; para: number }[];
  abates: number;
  abatesPorTipo: Partial<Record<ZombieId, number>>;
  recrutas: Recruit[];
  pets: Pet[];
  encontrosFalhos: number;
  /** lembranças dos mapas e conquistas batidas no loop (nomes) */
  lembrancas?: string[];
  conquistas?: string[];
  semCama: RecruitType[];
  projetos: string[];
  armas: string[];
  itensUsados: Partial<Record<ItemMk, number>>;
  ataques: AttackReport[];
  desertores: string[];
  chanceMedia: number;
  duracaoMedia: number;
  /** null = o loop seguiu até o fim do tempo */
  parada: { motivo: Parada; msg: string } | null;
}

const addBag = (a: Bag, b: Bag, k = 1) => { for (const [r, v] of Object.entries(b)) if (v) a[r as ResId] = (a[r as ResId] ?? 0) + v * k; };

/**
 * Simula o tempo fora (de `s.ultimaVisita` até `now`, no máx. 8 h) com o loop ligado e aplica no estado.
 * Retorna null se não há loop ativo ou a ausência é curta. Marca `ultimaVisita = now`: chamar de novo não
 * simula o mesmo intervalo duas vezes.
 */
export function simulateOffline(s: GameState, now = Date.now(), rand: Rng = defaultRng): OfflineReport | null {
  const L = s.loop;
  const ausenteMs = Math.max(0, now - (s.ultimaVisita ?? now));
  if (!L?.ativo || ausenteMs < LOOP_MIN_MS) return null;
  const janela = Math.min(ausenteMs, loopMaxMs(L.plano));
  const rep: OfflineReport = {
    ausenteMs, simuladoMs: janela, cortado: ausenteMs > loopMaxMs(L.plano), mapId: L.mapId, rodadas: 0, vitorias: 0, falhas: 0,
    diaInicio: s.dia, diaFim: s.dia, loot: {}, provisoes: {}, saldo: {}, producao: {}, xp: 0, niveis: [], abates: 0, abatesPorTipo: {},
    recrutas: [], pets: [], encontrosFalhos: 0, lembrancas: [], conquistas: [], semCama: [], projetos: [], armas: [], itensUsados: {}, ataques: [], desertores: [],
    chanceMedia: 0, duracaoMedia: 0, parada: null,
  };
  const res0 = { ...s.res };
  const lv0 = new Map<string, { nome: string; lv: number }>([['hero', { nome: s.hero?.nome ?? 'Herói', lv: s.heroLv }], ...s.recs.map((r) => [r.id, { nome: r.nome, lv: r.lv }] as [string, { nome: string; lv: number }])]);
  const prod0 = { ...s.prodBuf };
  let t = 0, somaChance = 0, somaDur = 0;
  const t0 = now - ausenteMs; // conta as PRIMEIRAS 8 h da ausência (o resto é ignorado)
  // janelas de Lua de Sangue no intervalo simulado: 1 ataque por janela, aplicado na ordem do tempo
  const janelas = bloodMoonWindows(t0, now);
  let jw = 0;
  const ataquesAte = (ms: number) => { while (jw < janelas.length && janelas[jw].inicio <= ms) { const a = attackWindow(s, janelas[jw++].inicio, rand); if (a) rep.ataques.push(a); } }; // attackWindow: 1 por janela (marca s.luaAtacada)
  encState = s;
  try {
    while (L.ativo) {
      const gratis = !!L.emCurso;
      // custo antes de pagar (para o relatório)
      const custo = gratis ? {} : custoExpedicao(s, L.ids, L.mapId);
      const recs0 = s.recs.map((r) => r.id);
      // a rodada só começa se cabe no tempo (estimativa com a config de agora)
      const pre = buildExpedition(s, L.ids, L.pet, L.mapId);
      pre.lua = bloodMoonAt(t0 + t);
      const est = estimar(pre);
      const dur = (est.duracao + PAUSA_RODADA_S) * 1000;
      if (t + dur > janela) break;
      ataquesAte(t0 + t);
      const ini = iniciarRodada(s, now);
      if (!ini.config) break;
      ini.config.lua = bloodMoonAt(t0 + t);
      if (!gratis) addBag(rep.provisoes, custo);
      for (const [k, n] of Object.entries(ini.config.plano?.itens ?? {})) if (n) rep.itensUsados[k as ItemMk] = (rep.itensUsados[k as ItemMk] ?? 0) + n;
      { const pr = rolarPresenca(MAPS[ini.config.mapId], makeRng(Math.floor(t0 + t) ^ (rep.rodadas * 7919)), semSorteio()); ini.config.ondas = pr.ondas; ini.config.ausentes = pr.ausentes; } // raridade: Rng próprio derivado do relógio da simulação (determinístico, não consome o rand)
      const rod = simularRodada(ini.config, rand);
      for (const [k, n] of Object.entries(rod.r.itensSobra ?? {})) if (n) rep.itensUsados[k as ItemMk] = (rep.itensUsados[k as ItemMk] ?? 0) - n;
      const sum = applyExpedition(s, rod.r, rand, { semAtaque: true, rend: OFFLINE_REND });
      // ids únicos e determinísticos para quem entrou (applyEncounters usa Date.now)
      const tag = (now + rep.rodadas).toString(36);
      if (sum.novoRecruta) { sum.novoRecruta.id = 'r' + tag; rep.recrutas.push(sum.novoRecruta); }
      if (sum.novoPet) { sum.novoPet.id = 'p' + tag; rep.pets.push(sum.novoPet); }
      if (sum.semCama) rep.semCama.push(sum.semCama);
      rep.encontrosFalhos += (sum.encontros ?? []).filter((o) => !o.ok).length;
      addBag(rep.loot, sum.loot);
      rep.xp += sum.xp;
      rep.abates += rod.r.abates;
      for (const [k, n] of Object.entries(rod.r.abatesPorTipo)) rep.abatesPorTipo[k as ZombieId] = (rep.abatesPorTipo[k as ZombieId] ?? 0) + (n ?? 0);
      rep.projetos.push(...sum.projetosNovos);
      rep.armas.push(...(sum.armasNovas ?? []));
      rep.lembrancas!.push(...(sum.lembrancas ?? []).map((l) => l.nome));
      rep.conquistas!.push(...(sum.conquistas ?? []));
      for (const id of recs0) if (!s.recs.some((r) => r.id === id)) rep.desertores.push(lv0.get(id)?.nome ?? id);
      rep.rodadas++;
      if (rod.r.sucesso) rep.vitorias++; else rep.falhas++;
      somaChance += est.chance; somaDur += est.duracao;
      t += dur;
      fecharRodada(s, rod.r, now);
    }
  } finally { encState = null; }
  if (!L.ativo && L.parada) rep.parada = { motivo: L.parada.motivo, msg: L.parada.msg };
  // o loop parou antes do fim: o resto do tempo o abrigo ficou parado comendo em tempo real
  if (!L.ativo && janela > t) tickUpkeep(s, janela - t);
  ataquesAte(t0 + janela - 1);
  tickProduction(s, janela / 60000);
  for (const [k, v] of Object.entries(s.prodBuf)) {
    const def = STRUCTS[k as StructId]?.prod, d = Math.floor((v ?? 0) - (prod0[k as StructId] ?? 0));
    if (def && d > 0) rep.producao[def.res] = (rep.producao[def.res] ?? 0) + d; // estrutura → recurso
  }
  for (const k of Object.keys(s.res) as ResId[]) { const d = Math.round((s.res[k] ?? 0) - (res0[k] ?? 0)); if (d) rep.saldo[k] = d; }
  for (const [id, o] of lv0) {
    const lv = id === 'hero' ? s.heroLv : s.recs.find((r) => r.id === id)?.lv;
    if (lv && lv > o.lv) rep.niveis.push({ nome: o.nome, de: o.lv, para: lv });
  }
  rep.diaFim = s.dia;
  rep.chanceMedia = rep.rodadas ? somaChance / rep.rodadas : estimar(buildExpedition(s, L.ids, L.pet, L.mapId)).chance;
  rep.duracaoMedia = rep.rodadas ? somaDur / rep.rodadas : 0;
  addLog(s, `<b>Loop offline</b> (${fmtDur(janela)}): ${rep.rodadas} rodada${rep.rodadas === 1 ? '' : 's'}, ${rep.vitorias} vitória${rep.vitorias === 1 ? '' : 's'}.`);
  s.ultimaVisita = now;
  return rep;
}

export function fmtDur(ms: number): string {
  const m = Math.round(ms / 60000), h = Math.floor(m / 60);
  return h ? `${h} h${m % 60 ? ' ' + String(m % 60).padStart(2, '0') + ' min' : ''}` : `${m} min`;
}

/** Nomes legíveis (UI). */
export const nomeRecruta = (r: Recruit) => `${r.nome} (${RECRUITS[r.tipo].nome})`;
export const nomePet = (p: Pet) => `${p.nome} (${PETS[p.tipo].nome})`;
export const nomeArma = (f: WeaponFamily) => WEAPONS[f].nome;
