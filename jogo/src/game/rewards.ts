// Aplica o resultado de uma expedição no estado (regras puras) e dispara a Lua de Sangue quando for a noite.
import { returnItems } from './market';
import { RECRUITS, PETS, type RecruitType } from '../data/recruits';
import { gradeOf } from '../data/grades';
import { applyEncounters, pct, type EncounterOutcome } from './encounters';
import { ZOMBIES } from '../data/zombies';
import { WEAPONS } from '../data/weapons';
import { xpToNext, xpAbate } from '../data/balance';
import type { Bag } from '../data/resources';
import { rng as defaultRng, type Rng } from '../core/rng';
import type { ExpeditionResult } from '../expedition/types';
import { gain, bagText } from './economy';
import { temRecruta } from './shelter';
import { resolvePendingAttacks, type AttackReport } from './bloodmoon';
import { serverNow } from './worldClock';
import { tickDia } from './upkeep';
import { addLog, type GameState, type Recruit, type Pet } from './state';
import { addFoundWeapon, addProjeto } from './weapons';
import { checkConquistas, checkLembrancas } from './conquistas';
import type { LembrancaDef } from '../data/lembrancas';

export interface RewardSummary {
  xp: number;
  ups: string[];
  loot: Bag;
  novoRecruta: Recruit | null;
  novoPet: Pet | null;
  semCama: RecruitType | null;
  /** o recruta novo entrou no Alojamento de espera (sem cama) */
  alojado?: boolean;
  projetosNovos: string[];
  /** armas achadas (sempre comuns; repetidas demais viram projeto) */
  armasNovas?: string[];
  ataque: AttackReport | null;
  /** encontros do mapa (missão, desempenho, chance e se veio) */
  encontros?: EncounterOutcome[];
  /** lembranças dos mapas achadas nesta expedição */
  lembrancas?: LembrancaDef[];
  /** conquistas batidas nesta expedição (nomes) */
  conquistas?: string[];
}

export { xpToNext } from '../data/balance';

/** `opts.rend`: fração de XP e loot (rodadas offline: OFFLINE_REND). `opts.semAtaque`: quem chama resolve o ataque da Lua por conta própria (simulador offline: 1 por janela).
 *  `opts.now`: relógio do servidor (testes); por padrão serverNow(). */
export function applyExpedition(s: GameState, r: ExpeditionResult, rand: Rng = defaultRng, opts: { semAtaque?: boolean; now?: number; rend?: number } = {}): RewardSummary {
  // loot (cair perde metade; recuar a tempo e a 1ª saída do save trazem tudo; recrutas coletores dão bônus; rodada offline rende opts.rend)
  const loot: Bag = { ...r.loot };
  if (opts.rend != null && opts.rend !== 1) for (const k of Object.keys(loot) as (keyof Bag)[]) loot[k] = Math.floor((loot[k] ?? 0) * opts.rend);
  const perdeu = !r.sucesso && !r.primeira && !r.recuou;
  if (perdeu) for (const k of Object.keys(loot) as (keyof Bag)[]) loot[k] = Math.floor((loot[k] ?? 0) * 0.5);
  if (temRecruta(s, 'lenhador') && loot.madeira) loot.madeira = Math.round(loot.madeira * 1.2);
  if (temRecruta(s, 'catadora') && loot.sucata) loot.sucata = Math.round(loot.sucata * 1.2);
  gain(s, loot);

  const projetosNovos: string[] = [];
  // cada projeto achado vale 1 projeto de melhoria; o primeiro da família também libera fabricar a comum
  for (const f of r.projetos) {
    if (!s.projetos.includes(f)) s.projetos.push(f);
    addProjeto(s, f);
    projetosNovos.push(WEAPONS[f].nome);
  }
  // expedição só traz arma COMUM; raridade e força sobem na Oficina
  const armasNovas: string[] = [];
  for (const f of r.armas ?? []) {
    const it = addFoundWeapon(s, f);
    armasNovas.push(it ? WEAPONS[f].nomes.comum : `${WEAPONS[f].nome} repetida → projeto`);
  }

  // xp
  const xp = Math.round((Object.entries(r.abatesPorTipo).reduce((a, [k, n]) => a + xpAbate(r.mapId, ZOMBIES[k as keyof typeof ZOMBIES].xp) * (n ?? 0), 0) + r.areaAlcancada * 4) * (opts.rend ?? 1));
  const ups: string[] = [];
  for (const id of r.teamIds) {
    if (id === 'hero') {
      s.heroXp += xp;
      while (s.heroXp >= xpToNext(s.heroLv)) { s.heroXp -= xpToNext(s.heroLv); s.heroLv++; ups.push(`${s.hero?.nome ?? 'Herói'} → nv ${s.heroLv}`); }
    } else {
      const o = s.recs.find((x) => x.id === id);
      if (!o) continue;
      o.xp += xp;
      while (o.xp >= xpToNext(o.lv)) { o.xp -= xpToNext(o.lv); o.lv++; ups.push(`${o.nome} → nv ${o.lv}`); }
    }
  }

  // recrutas / pets vêm dos encontros no mapa (missão → desempenho → chance → rolagem, já feita no motor)
  const encontros = r.encontros ?? [];
  const enc = applyEncounters(s, encontros);
  const novoRecruta: Recruit | null = enc.recrutas[0] ?? null, novoPet: Pet | null = enc.pets[0] ?? null, semCama: RecruitType | null = enc.semCama;
  const alojado = !!novoRecruta && enc.alojados.includes(novoRecruta);
  // quem entrou no squad no caminho lutou junto: ganha o XP da expedição e fica no squad das próximas
  for (const o of encontros) {
    if (!o.entrou) continue;
    const r = enc.recrutas.find((x) => x.nome === o.plan.nome && x.tipo === o.plan.recTipo);
    if (!r || !s.recs.includes(r)) continue;
    r.xp += xp;
    while (r.xp >= xpToNext(r.lv)) { r.xp -= xpToNext(r.lv); r.lv++; ups.push(`${r.nome} → nv ${r.lv}`); }
    s.squadPadrao = r.id;
  }

  s.expedicoes++;
  s.derrotados = { ...(s.derrotados ?? {}) };
  for (const [k, n] of Object.entries(r.abatesPorTipo)) if (n) s.derrotados[k] = (s.derrotados[k] ?? 0) + n;
  returnItems(s, r.itensSobra);
  s.derrotadosForma = { ...(s.derrotadosForma ?? {}) };
  for (const [k, n] of Object.entries(r.abatesPorForma ?? {})) if (n) s.derrotadosForma[k] = (s.derrotadosForma[k] ?? 0) + n;
  s.dia++;
  tickDia(s, r.teamIds, rand);
  if (r.sucesso) { s.vitorias++; s.vencidos = [...new Set([...(s.vencidos ?? []), r.mapId])]; }
  s.melhorArea = Math.max(s.melhorArea, r.areaAlcancada);

  addLog(s, `Expedição ${r.sucesso ? '<b>concluída</b>' : r.primeira ? `<b>recuou</b> na área ${r.areaAlcancada} com todo o loot` : `<b>falhou</b> na área ${r.areaAlcancada}`}: ${r.abates} zumbis · ${bagText(loot)}.`);
  if (projetosNovos.length) addLog(s, `Projeto encontrado: <b>${projetosNovos.join(', ')}</b>. Use na <b>Oficina</b> pra evoluir a raridade.`);
  if (armasNovas.length) addLog(s, `Arma achada: <b>${armasNovas.join(', ')}</b> (comum). Evolua na <b>Oficina</b>.`);
  for (const o of encontros) if (o.recusada) addLog(s, `O squad recusou a missão de <b>${o.plan.nome}</b>.`);
  for (const o of encontros) if (!o.ok && !o.recusada) addLog(s, `<b>${o.plan.nome}</b> não quis vir (missão ${o.progresso}, chance ${pct(o.chance)}).`);
  if (novoRecruta) addLog(s, `<b>${novoRecruta.nome}</b> (${RECRUITS[novoRecruta.tipo].nome}, nota <b>${gradeOf(novoRecruta)}</b>) foi resgatado e se juntou ao abrigo${alojado ? ' (sem cama: está no <b>Alojamento de espera</b>, pronto pra fusão)' : ''}.`);
  if (semCama) addLog(s, `Achou ${RECRUITS[semCama].genero === 'f' ? 'uma' : 'um'} ${RECRUITS[semCama].nome}, mas não tinha cama nem vaga no Alojamento. Evolua a <b>Barraca</b> ou faça uma <b>fusão</b>.`);
  if (novoPet) addLog(s, `Um <b>${PETS[novoPet.tipo].nome}</b> (nota <b>${gradeOf(novoPet)}</b>) seguiu o squad até o abrigo!`);
  ups.forEach((u) => addLog(s, 'Subiu de nível: <b>' + u + '</b>'));
  const lembrancas = checkLembrancas(s, r);
  const conquistas = checkConquistas(s);

  // janela de Lua de Sangue (relógio real) que nasceu durante a expedição e ainda não atacou → ataque ao voltar (LUA-10).
  // Janelas mais antigas (jogo fechado, abrigo aberto) são resolvidas pela tela do abrigo e pelo loop offline.
  const now = opts.now ?? serverNow();
  const ataque = opts.semAtaque ? null : resolvePendingAttacks(s, now, rand, now - (r.duracao || 0) * 1000 - 10_000).pop() ?? null;

  return { xp, ups, loot, novoRecruta, novoPet, semCama, alojado, projetosNovos, armasNovas, ataque, encontros, lembrancas, conquistas };
}
