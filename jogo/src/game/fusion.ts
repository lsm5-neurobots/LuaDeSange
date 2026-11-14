// Camas, Alojamento de espera e FUSÃO de recrutas/pets (regras puras, sem DOM).
//
// FUS-1  N iguais (mesmo tipo + mesma nota) viram 1 da nota seguinte (E→D→C→B→A→S). N = FUSAO_RECRUTAS / FUSAO_PETS.
// FUS-2  O jogador escolhe quem fica (nome, aparência). Ele herda o maior nível/XP do grupo e a arma + golpes
//        equipados de quem tinha o maior nível. Os outros saem do abrigo (armas voltam pro estoque) e liberam cama.
// FUS-3  Recrutas da fusão vêm das camas E do Alojamento. O resultado fica com cama se algum do grupo tinha cama
//        (ou se sobrou cama livre); senão continua no Alojamento.
// CAM-1  Cama = recruta ativo (luta, dá bônus, come). Camas = 2 por nível de Barraca.
// CAM-2  Sem cama, o recruta novo vai pro Alojamento de espera (ALOJAMENTO_VAGAS vagas): não ocupa cama, não come,
//        não luta e não dá bônus; serve pra juntar a fusão. Dá pra trocar cama ↔ alojamento no painel de Recrutas.
// CAM-3  Alojamento cheio não trava o recrutamento se o recém-chegado completa uma fusão (ele entra além do limite).
import { ALOJAMENTO_VAGAS, FUSAO_PETS, FUSAO_RECRUTAS, GRADES, gradeOf, nextGrade, type Grade } from '../data/grades';
import { PETS, RECRUITS, type PetType, type RecruitType } from '../data/recruits';
import { camas } from './shelter';
import { addLog, type GameState, type Pet, type Recruit } from './state';

export type FusKind = 'rec' | 'pet';
export const fusaoN = (k: FusKind, nota: Grade) => (k === 'rec' ? FUSAO_RECRUTAS : FUSAO_PETS)[nota];
export const alojados = (s: GameState): Recruit[] => s.alojamento ?? (s.alojamento = []);

/** Cama livre pra um recruta novo (a 1ª expedição sempre deixa o primeiro entrar, mesmo sem Barraca). */
export const temCama = (s: GameState) => s.recs.length < camas(s) || s.expedicoes === 0;
/** Cama livre de verdade (pra mover do Alojamento pra cama). */
export const camaLivre = (s: GameState) => s.recs.length < camas(s);
export const vagaAlojamento = (s: GameState) => alojados(s).length < ALOJAMENTO_VAGAS;

/** Todos do grupo (camas + alojamento, ou pets) com esse tipo e nota. */
export function grupo(s: GameState, kind: 'rec', tipo: RecruitType, nota: Grade): Recruit[];
export function grupo(s: GameState, kind: 'pet', tipo: PetType, nota: Grade): Pet[];
export function grupo(s: GameState, kind: FusKind, tipo: string, nota: Grade): (Recruit | Pet)[];
export function grupo(s: GameState, kind: FusKind, tipo: string, nota: Grade): (Recruit | Pet)[] {
  const all: (Recruit | Pet)[] = kind === 'rec' ? [...s.recs, ...alojados(s)] : s.pets;
  return all.filter((x) => x.tipo === tipo && gradeOf(x) === nota);
}

/** O recém-chegado (tipo, nota) fecha um grupo de fusão? */
export const completaFusao = (s: GameState, tipo: RecruitType, nota: Grade) =>
  nextGrade(nota) !== null && grupo(s, 'rec', tipo, nota).length + 1 >= FUSAO_RECRUTAS[nota];

/** Pra onde vai um recruta novo: cama, alojamento ou null (sem lugar). */
export function destinoRecruta(s: GameState, tipo: RecruitType, nota: Grade): 'cama' | 'alojamento' | null {
  if (temCama(s)) return 'cama';
  if (vagaAlojamento(s) || completaFusao(s, tipo, nota)) return 'alojamento';
  return null;
}

/** Tipos de recruta que ainda cabem no abrigo (qualquer tipo com cama/vaga; sem vaga, só quem completa fusão). */
export function tiposComLugar(s: GameState, nota: Grade): RecruitType[] {
  const all = Object.keys(RECRUITS) as RecruitType[];
  if (temCama(s) || vagaAlojamento(s)) return all;
  return all.filter((t) => completaFusao(s, t, nota));
}

export interface FusionGroup {
  kind: FusKind;
  tipo: string;
  nota: Grade;
  membros: (Recruit | Pet)[];
  /** iguais necessários */
  n: number;
  /** nota resultante (null = S, não funde mais) */
  prox: Grade | null;
  pronta: boolean;
}

/** Grupos não vazios por tipo (ordem do catálogo) e nota (E→S). */
export function fusionGroups(s: GameState, kind: FusKind): FusionGroup[] {
  const tipos = Object.keys(kind === 'rec' ? RECRUITS : PETS);
  const out: FusionGroup[] = [];
  for (const tipo of tipos) for (const nota of GRADES) {
    const membros = grupo(s, kind, tipo, nota);
    if (!membros.length) continue;
    const prox = nextGrade(nota), n = fusaoN(kind, nota);
    out.push({ kind, tipo, nota, membros, n, prox, pronta: !!prox && membros.length >= n });
  }
  return out;
}

export interface FusionResult {
  kind: FusKind;
  keeper: Recruit | Pet;
  /** nomes de quem foi consumido */
  consumidos: string[];
  de: Grade;
  para: Grade;
  /** recruta: ficou com cama? */
  cama?: boolean;
}

const plural = (n: string) => (/[rzs]$/i.test(n) ? n + 'es' : /l$/i.test(n) ? n.slice(0, -1) + 'is' : n + 's');
const byLv = (a: Recruit, b: Recruit) => b.lv - a.lv || b.xp - a.xp;

/**
 * Funde o grupo do `keeperId` (FUS-1..3). Usa o escolhido + os N−1 de maior nível do mesmo tipo e nota.
 * Retorna null se não dá (grupo pequeno, nota S, id inválido).
 */
export function fundir(s: GameState, kind: FusKind, keeperId: string): FusionResult | null {
  if (kind === 'pet') {
    const k = s.pets.find((p) => p.id === keeperId);
    if (!k) return null;
    const de = gradeOf(k), para = nextGrade(de);
    const g = grupo(s, 'pet', k.tipo, de), n = fusaoN(kind, de);
    if (!para || g.length < n) return null;
    const outros = g.filter((p) => p.id !== k.id).slice(0, n - 1), ids = new Set(outros.map((p) => p.id));
    s.pets = s.pets.filter((p) => !ids.has(p.id));
    k.nota = para;
    if (s.loop?.pet && ids.has(s.loop.pet)) s.loop.pet = k.id;
    addLog(s, `<b>Fusão:</b> ${n} ${plural(PETS[k.tipo].nome)} nota ${de} viraram <b>${k.nome}</b> nota <b>${para}</b>.`);
    return { kind, keeper: k, consumidos: outros.map((p) => p.nome), de, para };
  }
  const aloj = alojados(s);
  const k = s.recs.find((r) => r.id === keeperId) ?? aloj.find((r) => r.id === keeperId);
  if (!k) return null;
  const de = gradeOf(k), para = nextGrade(de);
  const g = grupo(s, 'rec', k.tipo, de), n = fusaoN(kind, de);
  if (!para || g.length < n) return null;
  const outros = g.filter((r) => r.id !== k.id).sort(byLv).slice(0, n - 1), ids = new Set(outros.map((r) => r.id));
  const usados = [k, ...outros], best = [...usados].sort(byLv)[0];
  const tinhaCama = usados.some((r) => s.recs.includes(r));
  // herança: maior nível/XP; arma e golpes de quem tinha o maior nível
  if (best !== k) {
    k.lv = best.lv; k.xp = best.xp;
    if (s.equip[best.id]) s.equip[k.id] = s.equip[best.id];
    if (s.golpes[best.id]) s.golpes[k.id] = s.golpes[best.id];
  }
  for (const id of ids) { delete s.equip[id]; delete s.golpes[id]; }
  k.nota = para;
  s.recs = s.recs.filter((r) => !ids.has(r.id));
  s.alojamento = aloj.filter((r) => !ids.has(r.id));
  // FUS-3: resultado fica com cama se o grupo tinha cama ou se sobrou cama
  let cama = s.recs.includes(k);
  if (!cama && (tinhaCama || camaLivre(s))) {
    s.alojamento = s.alojamento.filter((r) => r !== k);
    s.recs.push(k); cama = true;
  }
  // loop: quem saiu do squad vira o que ficou
  if (s.loop) {
    const L = s.loop, novo: string[] = [];
    for (const id of L.ids) { const v = ids.has(id) ? k.id : id; if (!novo.includes(v)) novo.push(v); }
    L.ids = cama ? novo : novo.filter((id) => id !== k.id);
    if (!L.ids.length) L.ids = ['hero'];
  }
  addLog(s, `<b>Fusão:</b> ${n} ${plural(RECRUITS[k.tipo].nome)} nota ${de} viraram <b>${k.nome}</b> nota <b>${para}</b> (nv ${k.lv}).${cama ? '' : ' Ficou no Alojamento.'}`);
  return { kind, keeper: k, consumidos: outros.map((r) => r.nome), de, para, cama };
}

/** CAM-2: tira um recruta da cama e manda pro Alojamento (não pode se estiver no squad do loop ligado). */
export function alojar(s: GameState, id: string): boolean {
  const r = s.recs.find((x) => x.id === id);
  if (!r || !vagaAlojamento(s) || (s.loop?.ativo && s.loop.ids.includes(id))) return false;
  s.recs = s.recs.filter((x) => x !== r);
  alojados(s).push(r);
  return true;
}

/** CAM-2: dá uma cama livre pra quem está no Alojamento. */
export function darCama(s: GameState, id: string): boolean {
  const aloj = alojados(s), r = aloj.find((x) => x.id === id);
  if (!r || !camaLivre(s)) return false;
  s.alojamento = aloj.filter((x) => x !== r);
  s.recs.push(r);
  return true;
}
