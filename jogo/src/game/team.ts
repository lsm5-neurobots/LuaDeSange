// Monta a configuração da expedição a partir do estado (time, armas, bônus do abrigo e do pet).
import { applyLembrancaBonus } from './conquistas';
import type { ExpeditionConfig, TeamMember } from '../expedition/types';
import { DEFAULT_MAP, MAPS } from '../data/maps';
import { GRADES, gradeOf, petMul, type Grade } from '../data/grades';
import { planEncounters, type EncounterPlan, type MissionKind, type PlanOpts } from './encounters';
import { lvl, temRecruta } from './shelter';
import { nextIsBloodMoon } from './bloodmoon';
import { equipped } from './weapons';
import { equippedGolpes } from './golpes';
import { combatPenalty } from './upkeep';
import { rolarPresenca, semSorteio } from './presenca';
import { rng as defaultRng } from '../core/rng';
import type { GameState } from './state';

export interface MemberOption { id: string; kind: 'hero' | 'rec'; nome: string; lv: number; nota?: Grade }

export function memberOptions(s: GameState): MemberOption[] {
  return [
    { id: 'hero', kind: 'hero', nome: s.hero?.nome ?? 'Herói', lv: s.heroLv },
    ...s.recs.map((r) => ({ id: r.id, kind: 'rec' as const, nome: r.nome, lv: r.lv, nota: gradeOf(r) })),
  ];
}

export function teamMember(s: GameState, id: string): TeamMember | null {
  if (id === 'hero') {
    if (!s.hero) return null;
    return { id, kind: 'hero', nome: s.hero.nome, lv: s.heroLv, arma: equipped(s, id), hero: s.hero, golpes: equippedGolpes(s, id) };
  }
  const r = s.recs.find((x) => x.id === id);
  if (!r) return null;
  return { id, kind: 'rec', nome: r.nome, lv: r.lv, arma: equipped(s, id), recTipo: r.tipo, skin: r.skin, nota: gradeOf(r), golpes: equippedGolpes(s, id) };
}

/** Debug/E2E: `?encontro=rec|pet&missao=escolta|cacar|coletar|vasculhar|bau&nota=S` força o encontro. */
function debugEncounter(): Pick<PlanOpts, 'force' | 'forceMissao' | 'forceNota'> {
  if (typeof location === 'undefined') return {};
  const q = new URLSearchParams(location.search), e = q.get('encontro'), m = q.get('missao'), n = q.get('nota');
  return {
    force: e === 'rec' || e === 'pet' ? e : null,
    forceMissao: m && ['escolta', 'cacar', 'coletar', 'vasculhar', 'bau'].includes(m) ? (m as MissionKind) : null,
    forceNota: n && (GRADES as readonly string[]).includes(n) ? (n as Grade) : null,
  };
}

/** Squad sem recruta amigo (vaga livre): o sobrevivente recrutado no caminho entra na hora e luta junto (nv 1, mãos nuas). */
export function comReforco(encs: EncounterPlan[], nTeam: number): EncounterPlan[] {
  if (nTeam >= 2) return encs;
  return encs.map((e) => e.kind !== 'rec' || !e.recTipo ? e : {
    ...e,
    reforco: { id: 'enc:' + e.id, kind: 'rec', nome: e.nome, lv: 1, arma: { id: 'mao', familia: 'bastao', tier: 'comum' }, recTipo: e.recTipo, skin: e.skin, nota: e.nota, golpes: [] },
  });
}

export function buildExpedition(s: GameState, memberIds: string[], petId: string | null, mapId = DEFAULT_MAP): ExpeditionConfig {
  const team = memberIds.map((id) => teamMember(s, id)).filter((m): m is TeamMember => !!m).slice(0, 2);
  const p = petId ? s.pets.find((x) => x.id === petId) ?? null : null;
  const bonus = { vida: 1 + 0.05 * lvl(s, 'bancada'), dano: 1, esquiva: 0, loot: 1, cura: 1, chaves: 0 };
  const pen = combatPenalty(s);
  bonus.vida *= pen.vida; bonus.dano *= pen.dano;
  if (temRecruta(s, 'capoeirista')) bonus.esquiva += 0.1;
  applyLembrancaBonus(s, bonus); // lembranças dos mapas na prateleira
  if (memberIds.some((id) => s.recs.find((r) => r.id === id)?.tipo === 'enfermeira')) bonus.cura += 0.5;
  if (p) {
    const k = petMul(gradeOf(p)); // nota do pet escala o bônus (E ×0,5 … S ×2)
    if (p.tipo === 'cachorro') bonus.dano += 0.1 * k;
    if (p.tipo === 'gato') bonus.loot += 0.15 * k;
    if (p.tipo === 'capivara') bonus.vida += 0.15 * k;
    if (p.tipo === 'jabuti') bonus.vida += 0.1 * k;
    if (p.tipo === 'papagaio') bonus.esquiva += 0.1 * k;
    if (p.tipo === 'sagui') bonus.chaves += Math.max(1, Math.round(k));
  }
  const lua = nextIsBloodMoon(s);
  const map0 = MAPS[mapId] ?? MAPS[DEFAULT_MAP];
  const pres = rolarPresenca(map0, defaultRng, semSorteio());
  const map = { ...map0, ondas: pres.ondas };
  return {
    mapId,
    team,
    pet: p ? { tipo: p.tipo, variante: p.variante, nome: p.nome, nota: gradeOf(p) } : null,
    lua,
    dia: s.dia + 1,
    bonus,
    encontros: comReforco(planEncounters(s, map, { lua, ...debugEncounter() }), team.length),
    primeira: (s.expedicoes ?? 0) === 0,
    ondas: pres.ondas,
    ausentes: pres.ausentes,
  };
}
