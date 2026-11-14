// SIMULADOR DE PROGRESSÃO (balanceamento): roda o "jogador típico" por vários dias reais usando as MESMAS regras
// puras do jogo (economia, Oficina, golpes, estruturas, mercado, encontros, applyExpedition) e o simulador rápido
// do idleLoop (simularRodada online, simulateOffline à noite).
//
// Módulo do simulador (sem saída). CLI: tools/balance.ts · teste: tests/balance.test.ts.
//
// JOGADOR TÍPICO (por dia real, horários UTC; a Lua de Sangue nasce 00:00 e 12:00, 30 min):
//  - 2 sessões online de 25 min (13:00 e 19:00) com o loop ligado em 6× (entre 2× e 8×): cada rodada custa
//    duração/6 + 6 s de pausa. Antes de cada rodada ele coleta a produção e gasta de forma GULOSA (lista de
//    prioridades abaixo), guardando 15 de água e comida pras provisões.
//  - 1 loop offline de 8 h (23:00 → 07:00) no mesmo mapa (simulateOffline: rodadas em 1×, rendimento offline).
//  - Mapa: empurra a fronteira (1º mapa não vencido) quando espera limpar ≥ 4 arenas; senão farma o último vencido.
//  - Squad: herói + melhor recruta (nível × nota) + melhor pet; as 2 melhores armas vão pra eles.
//  - Plano do loop: recrutar, usar chaves, kits (2 por rodada se tiver), 1 chave comum.
// Prioridades de gasto: reparar → armas (fabricar pistola/laser, evoluir raridade, forjar força) → Oficina →
// Barraca (cama livre) → Fogueira (quando trava algo) → produção (coletor, horta, toras, coleta, gerador) →
// golpes (herói e recruta do squad) → Bancada → defesas (até segurar a horda) → mercado (kits, chave).
import { newGame, type GameState } from '../src/game/state';
import { makeRng, type Rng } from '../src/core/rng';
import { MAPS } from '../src/data/maps';
import { STRUCTS, type StructId } from '../src/data/structures';
import { WEAPONS, weaponDamage, forcaMult, type WeaponFamily } from '../src/data/weapons';
import { gradeMul, type Grade } from '../src/data/grades';
import { GOLPE_IDS } from '../src/data/golpes';
import type { Bag, ResId } from '../src/data/resources';
import { buildBlock, startBuild, finishObraNow, collect, tickProduction, lvl, damagedList, repair, camas } from '../src/game/shelter';
import { craft, craftBlock, craftCost, upgradeTier, upgradeBlock, upgradeCost, forja, forjaBlock, forjaCost, equip, copias, oficinaLv } from '../src/game/weapons';
import { upGolpe, upBlock, upCost, golpeNv, slotsOf, equipGolpe, mg } from '../src/game/golpes';
import { buy, buyBlock } from '../src/game/market';
import { buildExpedition } from '../src/game/team';
import { planEncounters } from '../src/game/encounters';
import { applyExpedition } from '../src/game/rewards';
import { tickUpkeep, bloqueioExpedicao, pagarExpedicao } from '../src/game/upkeep';
import { resolvePendingAttacks, defenseTotal, hordeStrength, hordeDia } from '../src/game/bloodmoon';
import { arenasDe, squadPower, simularRodada, simulateOffline, novoLoop, M50, INCL, PAUSA_RODADA_S, type LoopPlano } from '../src/game/idleLoop';
import { takeItems } from '../src/game/market';
import { fundir, fusionGroups, type FusKind } from '../src/game/fusion';

const SESS_MIN = 25, SPEED = 6, RESERVA = 15;
const SESSOES = [13, 19], OFF_INI = 23, OFF_H = 8;
const H = 3600_000, D = 24 * H;
const T0 = Date.UTC(2026, 0, 5); // 00:00 UTC (início de janela de Lua)
export const ORDEM = ['marco_zero', 'olinda', 'pelourinho', 'veropeso', 'lapa', 'amazonia', 'pantanal'];
const FAM_K: Record<WeaponFamily, number> = { bastao: 1.6, pistola: 1.7, laser: 1.25 };
const PLANO: LoopPlano = { recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.35, itens: { kit_cura: 2, chave_comum: 1 }, recuarVida: 0.3 }; // recuo padrão do plano (falha sem recuar perde tudo)

// ---------------- gasto guloso ----------------
/** Reserva: provisões (água/comida pra rodar, gasolina pros mapas de fora) e, fora das armas, peças. */
const RES_BASE: Partial<Record<ResId, number>> = { agua: RESERVA, comida: RESERVA, gasolina: 6 };
const RES_LUXO: Partial<Record<ResId, number>> = { ...RES_BASE, pecas: 12, fragmento_lunar: 6 };
const podeComReserva = (s: GameState, c: Bag, r = RES_BASE) =>
  (Object.entries(c) as [ResId, number][]).every(([k, v]) => (s.res[k] ?? 0) - (r[k] ?? 0) >= v);

function construir(s: GameState, id: StructId, r = RES_BASE): boolean {
  if (buildBlock(s, id)) return false;
  if (!podeComReserva(s, STRUCTS[id].custo(lvl(s, id) + 1), r)) return false;
  startBuild(s, id, 0); finishObraNow(s);
  return true;
}

const wScore = (w: { familia: WeaponFamily; tier: any; nv?: number }) => weaponDamage(w.familia, w.tier) * forcaMult(w.nv) * FAM_K[w.familia];
const recScore = (r: { lv: number; nota?: Grade }) => r.lv * gradeMul(r.nota);

function squadIds(s: GameState): string[] {
  const best = [...s.recs].sort((a, b) => recScore(b) - recScore(a))[0];
  return best ? ['hero', best.id] : ['hero'];
}
function melhorPet(s: GameState): string | null {
  const ord = ['cachorro', 'capivara', 'jabuti', 'papagaio', 'gato', 'sagui'];
  const p = [...s.pets].sort((a, b) => ord.indexOf(a.tipo) - ord.indexOf(b.tipo) || gradeMul(b.nota) - gradeMul(a.nota))[0];
  return p?.id ?? null;
}
function equiparMelhores(s: GameState): void {
  const ids = squadIds(s), armas = [...s.armas].sort((a, b) => wScore(b) - wScore(a));
  ids.forEach((id, i) => { if (armas[i]) equip(s, id, armas[i].id); });
}

/** Jogador do sim funde todo grupo pronto (fica o de maior nível; pets: o primeiro). */
function fundirTudo(s: GameState): void {
  for (const k of ['rec', 'pet'] as FusKind[]) {
    for (let g = fusionGroups(s, k).find((x) => x.pronta); g; g = fusionGroups(s, k).find((x) => x.pronta)) {
      const keep = [...g.membros].sort((a, b) => ('lv' in b ? b.lv : 0) - ('lv' in a ? a.lv : 0))[0];
      if (!fundir(s, k, keep.id)) break;
    }
  }
}

function gastar(s: GameState): void {
  fundirTudo(s);
  collect(s);
  for (let it = 0; it < 300; it++) {
    let fez = false;
    for (const id of damagedList(s)) if (repair(s, id)) fez = true;
    const ids = squadIds(s);
    // comida/água primeiro: sem provisão não há expedição
    if ((lvl(s, 'coletor') === 0 || (s.res.agua ?? 0) < 25) && construir(s, 'coletor')) continue;
    if ((lvl(s, 'horta') === 0 || (s.res.comida ?? 0) < 25) && construir(s, 'horta')) continue;
    // armas
    for (const f of ['laser', 'pistola'] as WeaponFamily[]) if (copias(s, f) < Math.min(2, ids.length) && !craftBlock(s, f) && podeComReserva(s, craftCost(s, f, 'comum'))) { if (craft(s, f)) fez = true; }
    const todas = [...s.armas].sort((a, b) => wScore(b) - wScore(a)), top = todas.slice(0, ids.length);
    // evolui só as armas que vão pro squad (as 2 melhores) + a melhor de cada família à distância (candidatas)
    const cand = new Set([...top, ...(['laser', 'pistola'] as WeaponFamily[]).map((f) => todas.find((w) => w.familia === f)).filter((w): w is NonNullable<typeof w> => !!w)]);
    for (const w of cand) if (!upgradeBlock(s, w.id) && podeComReserva(s, upgradeCost(s, w))) { if (upgradeTier(s, w.id)) fez = true; }
    for (const w of top) if (!forjaBlock(s, w.id) && podeComReserva(s, forjaCost(s, w))) { if (forja(s, w.id)) fez = true; }
    if (fez) continue;
    if (construir(s, 'serralheria')) continue;
    if (s.recs.length >= camas(s) - 1 && construir(s, 'barraca')) continue;
    const quer: StructId[] = ['serralheria', 'coletor', 'horta', 'barraca', 'bancada'];
    if (quer.some((id) => buildBlock(s, id) === 'fogueira') && construir(s, 'fogueira')) continue;
    if (defenseTotal(s) < hordeStrength(hordeDia(s)) * 1.15 && ['barricada', 'portao', 'muralha', 'posto_guarda'].some((id) => construir(s, id as StructId))) continue;
    if (['coletor', 'horta', 'pilha_toras', 'ponto_coleta'].some((id) => construir(s, id as StructId))) continue;
    if (lvl(s, 'gerador') < lvl(s, 'fogueira') - 1 && construir(s, 'gerador', RES_LUXO)) continue;
    // golpes: enche os slots com golpes novos; depois upa os equipados (o de menor nível primeiro)
    let g = false;
    for (const id of ids) {
      const m = mg(s, id), livre = m.eq.length < slotsOf(s, id);
      const cand = GOLPE_IDS.filter((x) => (livre ? !golpeNv(s, id, x) : m.eq.includes(x)) && !upBlock(s, id, x) && podeComReserva(s, upCost(s, id, x), RES_LUXO));
      const prefer = cand.sort((a, b) => golpeNv(s, id, a) - golpeNv(s, id, b))[0];
      if (prefer && upGolpe(s, id, prefer)) {
        if (!m.eq.includes(prefer) && m.eq.length < slotsOf(s, id)) equipGolpe(s, id, prefer);
        g = true; break;
      }
    }
    if (g) continue;
    if (construir(s, 'bancada')) continue;
    if ((s.itens.kit_cura ?? 0) < 4 && (s.res.remedio ?? 0) >= 1 && !buyBlock(s, 'kit_cura') && buy(s, 'kit_cura')) continue;
    if ((s.itens.chave_comum ?? 0) < 3 && (s.res.sucata ?? 0) > 40 && !buyBlock(s, 'chave_comum') && buy(s, 'chave_comum')) continue;
    break;
  }
  equiparMelhores(s);
}

// ---------------- escolha de mapa ----------------
const fronteira = (s: GameState) => ORDEM.find((id) => !(s.vencidos ?? []).includes(id)) ?? ORDEM[ORDEM.length - 1];
function arenasEsperadas(s: GameState, mapId: string): number {
  const cfg = buildExpedition(s, squadIds(s), melhorPet(s), mapId);
  const sq = squadPower(cfg.team, cfg.bonus);
  let p = 1, e = 0;
  for (const a of arenasDe(MAPS[mapId], cfg.dia, false)) { const m = (sq.dps * sq.ehp) / (a.hp * a.dmg); p *= 1 / (1 + Math.pow(M50 / Math.max(1e-6, m), INCL)); e += p; }
  return e;
}
function escolherMapa(s: GameState): string {
  const f = fronteira(s);
  const venc = ORDEM.filter((id) => (s.vencidos ?? []).includes(id)).pop();
  if (!venc || (s.vencidos ?? []).includes(f)) return f;
  // sem gasolina/peças pra ir longe: farma o vencido mais avançado que dá pra pagar
  const farm = ORDEM.filter((id) => (s.vencidos ?? []).includes(id) && !bloqueioExpedicao(s, squadIds(s), id)).pop() ?? venc;
  if (bloqueioExpedicao(s, squadIds(s), f)) return farm;
  return arenasEsperadas(s, f) >= 4 ? f : farm;
}

export const med = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : NaN; };
export const abrev: Record<string, string> = { marco_zero: 'MZ', olinda: 'OL', pelourinho: 'PE', veropeso: 'VP', lapa: 'LA' };
// ---------------- uma corrida ----------------
export interface Linha {
  dia: number; lv: number; recs: number; recLv: number; arma: string; golpes: number; oficina: number; fogueira: number;
  area: Record<string, number>; vencidos: number; P: number; tipica: number; fr: string; rodOn: number; rodOff: number; vit: number; res: Bag; ataquesPerdidos: number; mapa: string;
}
export interface Corrida { linhas: Linha[]; chefe: Record<string, number | null>; primeira: number }

export function correr(seed: number, DIAS = 16): Corrida {
  const rand: Rng = makeRng(seed);
  const s = newGame(T0);
  s.hero = { nome: 'Lia' } as any;
  const area: Record<string, number> = {}, chefe: Record<string, number | null> = Object.fromEntries(ORDEM.map((m) => [m, null]));
  let rodOn = 0, rodOff = 0, vit = 0, ataquesPerdidos = 0, primeira = 0, ultimoT = T0 + SESSOES[0] * H;
  const linhas: Linha[] = [];
  const marcar = (mapId: string, r: { areaAlcancada: number; sucesso: boolean }, t: number) => {
    area[mapId] = Math.max(area[mapId] ?? 0, r.sucesso ? MAPS[mapId].areas + 1 : r.areaAlcancada);
    if (r.sucesso && chefe[mapId] == null) chefe[mapId] = (t - T0 - SESSOES[0] * H) / D;
  };
  const passar = (ate: number) => {
    const dt = ate - ultimoT;
    if (dt > 0) { tickProduction(s, dt / 60000); tickUpkeep(s, dt); }
    for (const a of resolvePendingAttacks(s, ate, rand)) if (!a.segurou) ataquesPerdidos++;
    ultimoT = ate;
  };

  for (let d = 0; d < DIAS; d++) {
    const areasDia: number[] = [], frId = fronteira(s), fr0 = frId; // área típica: só rodadas no mapa que era a fronteira no começo do dia
    for (const hs of SESSOES) {
      let t = T0 + d * D + hs * H;
      passar(t);
      const fim = t + SESS_MIN * 60_000;
      while (t < fim) {
        gastar(s);
        const ids = squadIds(s), mapId = escolherMapa(s);
        const bq = bloqueioExpedicao(s, ids, mapId);
        if (bq) { if (process.env.DBG) console.log(`d${d + 1} ${hs}h PAROU: ${bq}`); break; }
        pagarExpedicao(s, ids, mapId);
        const got = takeItems(s, PLANO.itens);
        const cfg = buildExpedition(s, ids, melhorPet(s), mapId);
        cfg.lua = false;
        cfg.encontros = planEncounters(s, MAPS[mapId], { lua: false, rand });
        cfg.plano = { ...PLANO, isca: 0, itens: got };
        const rod = simularRodada(cfg, rand, { online: true });
        const sum = applyExpedition(s, rod.r, rand, { semAtaque: true });
        // ids determinísticos (applyEncounters usa Date.now: rodadas no mesmo ms dariam ids repetidos)
        if (sum.novoRecruta) sum.novoRecruta.id = `r${seed}-${rodOn}`;
        if (sum.novoPet) sum.novoPet.id = `p${seed}-${rodOn}`;
        if (rodOn === 0) primeira = rod.r.areaAlcancada;
        if (process.env.DBG) console.log(`d${d + 1} ${hs}h ${mapId} lv${s.heroLv} ${JSON.stringify(cfg.team.map((m) => [m.lv, m.arma.familia, m.arma.tier, m.arma.nv]))} → área ${rod.r.areaAlcancada} ${rod.r.sucesso ? 'VENCEU' : ''} t=${Math.round(rod.tempo)} res=${JSON.stringify(s.res)}`);
        rodOn++; if (rod.r.sucesso) vit++;
        marcar(mapId, rod.r, t);
        if (mapId === frId) areasDia.push(rod.r.sucesso ? MAPS[mapId].areas + 1 : rod.r.areaAlcancada);
        t += (rod.tempo / SPEED + PAUSA_RODADA_S) * 1000;
        tickProduction(s, (rod.tempo / SPEED + PAUSA_RODADA_S) / 60);
        ultimoT = t;
      }
    }
    // noite: loop offline de 8 h, em blocos de 2 h (pra saber quando venceu)
    let t = T0 + d * D + OFF_INI * H;
    passar(t);
    gastar(s);
    const mapId = escolherMapa(s);
    s.loop = novoLoop(mapId, squadIds(s), melhorPet(s), PLANO, t);
    for (let b = 0; b < OFF_H / 2; b++) {
      s.ultimaVisita = t;
      const vit0 = s.loop?.vitorias ?? 0;
      const rep = simulateOffline(s, t + 2 * H, rand);
      if (rep) {
        rodOff += rep.rodadas; vit += rep.vitorias;
        for (const a of rep.ataques) if (!a.segurou) ataquesPerdidos++;
        if (rep.vitorias > 0 && vit0 === 0) marcar(mapId, { areaAlcancada: MAPS[mapId].areas, sucesso: true }, t + H);
        else if (rep.rodadas) area[mapId] = Math.max(area[mapId] ?? 0, s.melhorArea && mapId === fronteira(s) ? Math.min(MAPS[mapId].areas, s.melhorArea) : 0);
      } else { tickProduction(s, 120); tickUpkeep(s, 2 * H); }
      t += 2 * H;
    }
    // melhor área offline: estimativa direta (o relatório não traz a área de cada rodada)
    if (process.env.DBG) console.log(`FIM d${d + 1}: loop ${JSON.stringify(s.loop?.parada)} armas ${JSON.stringify(s.armas)} proj ${JSON.stringify(s.projetosQtd)} ${s.projetos} ofic ${oficinaLv(s)} estr ${JSON.stringify(Object.fromEntries(Object.entries(s.estruturas).map(([k, v]) => [k, v!.nv + (v!.danificada ? '!' : '')])))} res ${JSON.stringify(s.res)}`);
    s.loop = null; ultimoT = t;
    const lin: Linha = {
      dia: d + 1, lv: s.heroLv, recs: s.recs.length, recLv: Math.max(0, ...s.recs.map((r) => r.lv)),
      arma: (() => { const w = s.armas.find((x) => x.id === s.equip.hero); return w ? `${w.familia[0]}${w.tier[0]}${w.nv ?? 1}` : '-'; })(),
      golpes: Object.values(s.golpes?.hero?.nv ?? {}).reduce((a, b) => a + (b ?? 0), 0), oficina: oficinaLv(s), fogueira: lvl(s, 'fogueira'),
      area: { ...area }, vencidos: (s.vencidos ?? []).length, tipica: med(areasDia.length ? areasDia : [0]), fr: abrev[fr0], P: (() => { const c = buildExpedition(s, squadIds(s), melhorPet(s), 'marco_zero'); const q = squadPower(c.team, c.bonus); return Math.round(q.dps * q.ehp / 1000); })(), rodOn, rodOff, vit, res: { ...s.res }, ataquesPerdidos, mapa: mapId,
    };
    linhas.push(lin);
  }
  return { linhas, chefe, primeira };
}

