// Encontros no mapa (regras puras, sem DOM): sobreviventes e pets aparecem em algumas áreas da expedição,
// conversam e pedem uma missão (o squad ACEITA ou RECUSA). Aceitou: a missão roda, a chance sobe/desce pelo desempenho;
// no fim, se o personagem sobreviveu, ele agradece e a chance é rolada. Todo recrutado chega com nota E (NOTA_INICIAL).
import { RECRUITS, PETS, NOMES_PET, nomesDe, type RecruitType, type PetType } from '../data/recruits';
import { ZOMBIES, type ZombieId } from '../data/zombies';
import { RESOURCES, type ResId } from '../data/resources';
import { NOTA_INICIAL, type Grade } from '../data/grades';
import type { MapDef } from '../data/maps';
import { rng as defaultRng, pick, type Rng } from '../core/rng';
import { destinoRecruta, tiposComLugar } from './fusion';
import type { GameState, Recruit, Pet } from './state';
import type { TeamMember } from '../expedition/types';

export type Mission =
  /** proteja-me até o fim da área: ele segue o squad e não pode morrer */
  | { tipo: 'escolta'; hp: number }
  /** derrote N zumbis do tipo X */
  | { tipo: 'cacar'; alvo: ZombieId; n: number }
  /** traga N de um recurso (conta o que entrar na mochila depois do encontro) */
  | { tipo: 'coletar'; item: ResId; n: number }
  /** vasculhe N contêineres */
  | { tipo: 'vasculhar'; n: number }
  /** abra o baú da área (sem baú na rota, o motor troca por vasculhar 2) */
  | { tipo: 'bau' };
export type MissionKind = Mission['tipo'];

export interface EncounterPlan {
  id: string;
  kind: 'rec' | 'pet';
  recTipo?: RecruitType;
  skin?: string;
  petTipo?: PetType;
  variante?: string;
  nome: string;
  nota: Grade;
  /** id da área onde ele espera (aparece antes da 1ª arena dela) */
  area: string;
  /** prazo: id da última área (inclusive) pra cumprir a missão */
  ate: string;
  missao: Mission;
  /** squad com vaga (sem recruta amigo): recrutado, entra na hora e luta junto até o fim (buildExpedition preenche) */
  reforco?: TeamMember;
}

export interface EncounterOutcome {
  plan: EncounterPlan;
  /** recrutou (a rolagem caiu dentro da chance) */
  ok: boolean;
  /** "3/3", "vida 62/100"... */
  progresso: string;
  motivo: string;
  /** nota de desempenho da missão 0..1 */
  desempenho: number;
  /** chance final de recrutar 0..1 */
  chance: number;
  /** valor sorteado 0..1 (ok = roll < chance) */
  roll: number;
  /** o squad recusou a missão (não conta como falha) */
  recusada?: boolean;
  /** recrutado e entrou no squad no meio da expedição (ganha o XP dela e já fica no squad) */
  entrou?: boolean;
}

export interface PlanOpts {
  lua: boolean;
  rand?: Rng;
  /** debug/E2E: força um encontro ('rec' ou 'pet') e, opcionalmente, a missão */
  force?: 'rec' | 'pet' | null;
  forceMissao?: MissionKind | null;
  /** debug: força a nota */
  forceNota?: Grade | null;
}

/** ENC-1: chance de ter um encontro numa expedição comum / noite de Lua de Sangue. */
export const ENCOUNTER_CHANCE = 0.4;
export const ENCOUNTER_CHANCE_LUA = 0.55;
/** ENC-2: quando cabem recruta e pet, a fração do encontro que é pet. */
export const PET_SHARE = 0.4;

const hasBoss = (waves: ZombieId[][]) => waves.some((l) => l.some((k) => ZOMBIES[k].boss));
export { temCama } from './fusion';

/** Tipos de recruta que podem aparecer: todos (repetidos alimentam a fusão), desde que caibam (cama/alojamento/fusão). */
export const recruitPool = (s: GameState): RecruitType[] => tiposComLugar(s, NOTA_INICIAL);
/** Pets não ocupam cama: qualquer tipo pode aparecer (repetidos alimentam a fusão). */
export const petPool = (_s: GameState): PetType[] => Object.keys(PETS) as PetType[];

/** Áreas onde um encontro pode esperar: a partir da 2ª, antes da última, sem chefe/mini boss. */
function validAreas(map: MapDef): number[] {
  const ids = Object.keys(map.ondas);
  return ids.map((_, i) => i).filter((i) => i >= 1 && i < ids.length - 1 && !hasBoss(map.ondas[ids[i]]));
}

export interface EncounterOdds {
  /** chance (0..1) de aparecer um recruta / um pet nessa expedição */
  rec: number;
  pet: number;
  /** encontro garantido (1ª expedição: recruta; 2ª sem pet: pet) */
  garantido: 'rec' | 'pet' | null;
}

/**
 * ENC-3 (fonte única): chance de aparecer recruta / pet numa expedição a esse mapa. Mesmas regras de planEncounters:
 * 1ª expedição = recruta garantido; 2ª sem pet = pet garantido; depois ENCOUNTER_CHANCE(_LUA) dividida em
 * pet PET_SHARE / recruta o resto (só recruta se couber no abrigo: cama, Alojamento ou fusão). O encontro aparece mesmo
 * com o plano sem "recrutar" (aí o squad recusa sozinho, a não ser que o jogador aceite na hora).
 */
export function encounterOdds(s: GameState, map: MapDef, o: { lua: boolean }): EncounterOdds {
  const none: EncounterOdds = { rec: 0, pet: 0, garantido: null };
  if (!validAreas(map).length) return none;
  const canRec = recruitPool(s).length > 0, canPet = petPool(s).length > 0;
  let odds: EncounterOdds;
  if (s.expedicoes === 0 && canRec) odds = { rec: 1, pet: 0, garantido: 'rec' };
  else if (s.expedicoes === 1 && !s.pets.length && canPet) odds = { rec: 0, pet: 1, garantido: 'pet' };
  else {
    const c = o.lua ? ENCOUNTER_CHANCE_LUA : ENCOUNTER_CHANCE;
    odds = { rec: canRec ? c * (canPet ? 1 - PET_SHARE : 1) : 0, pet: canPet ? c * (canRec ? PET_SHARE : 1) : 0, garantido: null };
  }
  return odds;
}

/** Monta a missão pra um encontro na área `idx` (ids = áreas do mapa em ordem). */
export function makeMission(map: MapDef, ids: string[], idx: number, kind: MissionKind, rand: Rng, facil = false): { missao: Mission; ate: string } {
  const ate = kind === 'escolta' ? ids[idx] : ids[Math.min(ids.length - 1, idx + 1)];
  if (kind === 'escolta') return { missao: { tipo: 'escolta', hp: Math.round(100 * (1 + 0.1 * (map.nivelRecomendado - 1))) }, ate };
  if (kind === 'cacar') {
    const count: Partial<Record<ZombieId, number>> = {};
    for (let i = idx; i <= ids.indexOf(ate); i++) for (const l of map.ondas[ids[i]] ?? []) for (const k of l) if (!ZOMBIES[k].boss) count[k] = (count[k] ?? 0) + 1;
    const ks = (Object.keys(count) as ZombieId[]).filter((k) => (count[k] ?? 0) >= 2);
    if (!ks.length) return makeMission(map, ids, idx, 'vasculhar', rand, facil);
    const alvo = facil && ks.includes('errante') ? 'errante' : pick(ks, rand);
    const c = count[alvo]!;
    return { missao: { tipo: 'cacar', alvo, n: Math.max(2, Math.min(6, Math.round(c * (facil ? 0.5 : 0.7)))) }, ate };
  }
  if (kind === 'coletar') {
    const its = (Object.entries(map.loot.porArena) as [ResId, number][]).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return { missao: { tipo: 'coletar', item: its.length ? pick(its.slice(0, 2), rand) : 'sucata', n: facil ? 2 : 3 }, ate };
  }
  if (kind === 'vasculhar') return { missao: { tipo: 'vasculhar', n: 2 }, ate };
  return { missao: { tipo: 'bau' }, ate };
}

/**
 * Sorteia os encontros de uma expedição. 1ª expedição sempre tem um sobrevivente (missão fácil);
 * 2ª sem pet sempre tem um pet. Depois, chance por expedição (maior na Lua de Sangue).
 */
export function planEncounters(s: GameState, map: MapDef, o: PlanOpts): EncounterPlan[] {
  const rand = o.rand ?? defaultRng;
  const ids = Object.keys(map.ondas);
  // áreas válidas: a partir da 2ª (o squad precisa chegar andando), sem chefe/mini boss
  const ok = validAreas(map);
  if (!ok.length) return [];
  const rp = recruitPool(s), pp = petPool(s);
  let kind: 'rec' | 'pet' | null = null, facil = false;
  const odds = encounterOdds(s, map, { lua: o.lua });
  if (o.force) kind = o.force;
  else if (odds.garantido) { kind = odds.garantido; facil = true; }
  else if (rand() < odds.rec + odds.pet) kind = rand() < odds.pet / (odds.rec + odds.pet) ? 'pet' : 'rec';
  if (!kind) return [];
  const idx = facil || o.force ? ok[0] : pick(ok, rand); // debug forçado aparece logo na 1ª área válida
  const kinds: MissionKind[] = ['escolta', 'cacar', 'coletar', 'vasculhar', 'bau'];
  const mk: MissionKind = o.forceMissao ?? (facil ? 'cacar' : pick(kinds, rand));
  const { missao, ate } = makeMission(map, ids, idx, mk, rand, facil);
  const nota = o.forceNota ?? NOTA_INICIAL; // todo recrutamento chega nota E (a nota sobe por fusão no abrigo)
  const id = 'e' + Math.floor(rand() * 1e9).toString(36);
  if (kind === 'rec') {
    const tipo = rp.length ? pick(rp, rand) : pick(Object.keys(RECRUITS) as RecruitType[], rand);
    return [{ id, kind, recTipo: tipo, skin: pick(RECRUITS[tipo].skins, rand), nome: nomeNovo(s, nomesDe(tipo), rand), nota, area: ids[idx], ate, missao }];
  }
  const tipo = pp.length ? pick(pp, rand) : pick(Object.keys(PETS) as PetType[], rand);
  // 1º pet do tipo leva o apelido clássico; repetidos sorteiam outro apelido de pet
  const nome = s.pets.some((p) => p.tipo === tipo) ? nomeNovo(s, NOMES_PET, rand) : PETS[tipo].apelido;
  return [{ id, kind, petTipo: tipo, variante: '', nome, nota, area: ids[idx], ate, missao }];
}

/** NOM-2: sorteia um nome da lista evitando repetir quem já está no abrigo (se a lista acabar, repete). */
export function nomeNovo(s: GameState, lista: string[], rand: Rng = defaultRng): string {
  const usados = new Set([...s.recs, ...(s.alojamento ?? []), ...s.pets].map((x) => x.nome));
  const livres = lista.filter((n) => !usados.has(n));
  return pick(livres.length ? livres : lista, rand);
}

// ---------------- progresso da missão ----------------
export interface MissionState { feito: number; meta: number; hp?: number; hpMax?: number }

export function missionMeta(m: Mission): number {
  return m.tipo === 'cacar' || m.tipo === 'coletar' || m.tipo === 'vasculhar' ? m.n : 1;
}

/** Cumprida? (escolta só se resolve no prazo: ver motor) */
export function missionDone(m: Mission, st: MissionState): boolean {
  if (m.tipo === 'escolta') return false;
  return st.feito >= st.meta;
}

/** Falhou de vez? escolta: a vida chegou a 0. */
export function missionFailed(m: Mission, st: MissionState): boolean {
  return m.tipo === 'escolta' && (st.hp ?? 1) <= 0;
}

// ---------------- desempenho → chance de recrutar ----------------
/** Tempo (s de jogo desde o início da missão): até T_BOM vale 100%, cai em linha reta até 0% em T_RUIM. */
export const T_BOM = 30, T_RUIM = 150;
export const timeScore = (t: number) => Math.max(0, Math.min(1, 1 - (t - T_BOM) / (T_RUIM - T_BOM)));

export interface PerfInput {
  m: Mission;
  st: MissionState;
  /** segundos de jogo desde que a missão começou */
  t: number;
  /** vida média do squad 0..1 */
  squadHp: number;
}

/**
 * Nota de desempenho 0..1 da missão.
 * escolta = 70% vida do protegido + 30% vida do squad;
 * demais = 50% progresso + 30% tempo + 20% vida do squad (tempo só conta com progresso).
 */
export function missionPerf(i: PerfInput): number {
  const sq = Math.max(0, Math.min(1, i.squadHp));
  if (i.m.tipo === 'escolta') {
    const hp = Math.max(0, Math.min(1, (i.st.hp ?? 0) / (i.st.hpMax || 1)));
    return hp <= 0 ? 0 : 0.7 * hp + 0.3 * sq;
  }
  const pr = Math.max(0, Math.min(1, i.st.feito / (i.st.meta || 1)));
  return 0.5 * pr + 0.3 * timeScore(i.t) * pr + 0.2 * sq;
}

/** Chance com desempenho 50% por nota: S é o mais difícil de convencer. */
export const CHANCE_MEIO: Record<Grade, number> = { E: 0.75, D: 0.68, C: 0.6, B: 0.5, A: 0.4, S: 0.28 };
export const CHANCE_MIN = 0.05, CHANCE_MAX = 0.95;

/**
 * Chance de recrutar: base da nota ± 70 pontos × (desempenho − 50%) + bônus de isca/presente
 * (`isca` em pontos percentuais, ex.: 10 = +10%). Protegido morto = 0.
 */
export function recruitChance(nota: Grade, perf: number, morto = false, isca = 0): number {
  if (morto) return 0;
  return Math.max(CHANCE_MIN, Math.min(CHANCE_MAX, CHANCE_MEIO[nota] + 0.7 * (perf - 0.5) + Math.max(0, isca) / 100));
}

/** Rolagem: sucesso = roll < chance. */
export function rollRecruit(chance: number, rand: Rng = defaultRng): { ok: boolean; roll: number } {
  const roll = rand();
  return { ok: roll < chance, roll };
}

export const plural = (n: string) => (/[rzs]$/i.test(n) ? n + 'es' : /l$/i.test(n) ? n.slice(0, -1) + 'is' : n + 's');

/** Texto curto do objetivo (HUD/resultado). */
export function missionText(m: Mission, areaNome?: string): string {
  switch (m.tipo) {
    case 'escolta': return areaNome ? `Proteja até o fim de ${areaNome}` : 'Proteja até o fim da área';
    case 'cacar': return `Derrote ${m.n} ${m.n > 1 ? plural(ZOMBIES[m.alvo].nome) : ZOMBIES[m.alvo].nome}`;
    case 'coletar': return `Traga ${m.n} de ${RESOURCES[m.item].nome.toLowerCase()}`;
    case 'vasculhar': return `Vasculhe ${m.n} contêineres`;
    case 'bau': return 'Abra o baú da área';
  }
}

export function progressText(m: Mission, st: MissionState): string {
  if (m.tipo === 'escolta') return `vida ${Math.max(0, Math.round(st.hp ?? 0))}/${st.hpMax ?? 0}`;
  return `${Math.min(st.feito, st.meta)}/${st.meta}`;
}

export const pct = (v: number) => Math.round(v * 100) + '%';

// ---------------- falas ----------------
export interface Fala { quem: 'npc' | 'hero' | 'sys'; texto: string }

const INTRO: Record<RecruitType, string> = {
  vigia: 'Oxe! Calma, visse? Sou vigia, tava segurando esse quarteirão sozinho.',
  serralheiro: 'Caraca, mermão, gente viva! Sou serralheiro: solda e ferro é comigo.',
  pedreira: 'Uai, cês são de verdade? Sou pedreira, levanto muro até de olho fechado.',
  lenhador: 'Bah, tchê! Achei que só tinha morto andando por aqui. Sou lenhador.',
  catadora: 'Ô, mano! Sou catadora: acho coisa boa até no meio do lixo.',
  agricultor: 'Eita, gente! Sou agricultor, planto até em vaso de cimento.',
  capoeirista: 'Iê, camará! Capoeirista. Na ginga eu desvio de qualquer mordida.',
  enfermeira: 'Graças a Deus! Sou enfermeira, tô sem curativo e sem sossego.',
};
const SOM: Record<PetType, string> = {
  cachorro: 'Au! Au! Auuuu!', gato: 'Miau… mrrrr.', capivara: 'Iiik! (mastiga um capim, na maior calma)',
  jabuti: '… (o jabuti te encara bem devagar)', papagaio: 'Curupaco! Lôro quer biscoito!', sagui: 'Tsi-tsi-tsi!',
};

function pedido(m: Mission, areaNome: string): string {
  switch (m.tipo) {
    case 'escolta': return `Me leva inteiro até o fim de ${areaNome}? Se eu chegar vivo, tô dentro do abrigo!`;
    case 'cacar': return `Antes, derruba ${m.n} ${plural(ZOMBIES[m.alvo].nome)} pra mim. Esses bichos comeram meu juízo!`;
    case 'coletar': return `Tô zerado de ${RESOURCES[m.item].nome.toLowerCase()}. Junta ${m.n} aí na mochila que eu vou com vocês.`;
    case 'vasculhar': return `Vasculha ${m.n} cantos por aqui comigo? Tem coisa boa escondida, visse.`;
    case 'bau': return 'Tem um baú mais na frente. Abre ele que eu topo ir pro abrigo.';
  }
}

/** Falas de abertura (antes da escolha Aceitar/Recusar). */
export function encounterLines(p: EncounterPlan, _heroNome: string, areaNome: string): Fala[] {
  if (p.kind === 'rec') return [{ quem: 'npc', texto: INTRO[p.recTipo!] }, { quem: 'npc', texto: pedido(p.missao, areaNome) }];
  return [
    { quem: 'npc', texto: SOM[p.petTipo!] },
    { quem: 'sys', texto: `${p.nome} tá sozinho e com fome. Missão pra ele confiar no squad: ${missionText(p.missao, areaNome).toLowerCase()}.` },
  ];
}

/** Resposta do herói + reação depois da escolha. */
export function choiceLines(p: EncounterPlan, aceitou: boolean): Fala[] {
  if (p.kind === 'rec') {
    return aceitou
      ? [{ quem: 'hero', texto: `Fechado, ${p.nome}! Cola com a gente.` }]
      : [{ quem: 'hero', texto: `Hoje não dá, ${p.nome}. Se cuida.` }, { quem: 'npc', texto: RECUSA[p.recTipo!] }];
  }
  return aceitou
    ? [{ quem: 'hero', texto: `Vem cá, ${p.nome}! A gente cuida de tu.` }]
    : [{ quem: 'hero', texto: `Agora não, ${p.nome}…` }, { quem: 'npc', texto: '(abaixa as orelhas e some no escuro)' }];
}

const RECUSA: Record<RecruitType, string> = {
  vigia: 'Oxe, tá certo. Vou ficar de olho daqui, visse?',
  serralheiro: 'Pô, mermão… beleza, fica pra próxima.',
  pedreira: 'Uai, sem problema. Eu me viro aqui, sô.',
  lenhador: 'Bah, que pena, tchê. Boa estrada pra vocês.',
  catadora: 'Firmeza, mano. Se mudar de ideia, cês sabem onde me achar.',
  agricultor: 'Eita, tá bom. Vou cuidar da minha rocinha.',
  capoeirista: 'Ê, camará… a roda gira. A gente se esbarra.',
  enfermeira: 'Tudo bem, meu filho. Vão com Deus.',
};

/** AGR-1: agradecimento (com sotaque) quando a missão acaba e o personagem sobreviveu; vem antes da rolagem. */
const AGRADECE: Record<RecruitType, [string, string]> = {
  vigia: ['Oxente, que pisa vocês deram nesses bichos! Tô devendo uma, visse?', 'Deixa eu pensar se vou mermo… meu quarteirão vai sentir falta.'],
  serralheiro: ['Caraca, mermão, sinistro demais! Valeu pela moral.', 'Vou ver aqui se encaro esse abrigo de vocês…'],
  pedreira: ['Uai, sô, cês são bão demais da conta! Brigada, viu?', 'Deixa eu matutar um cadinho antes de ir…'],
  lenhador: ['Bah, tchê, barbaridade! Trabalho tri bem feito!', 'Deixa eu pensar com calma, chê…'],
  catadora: ['Ô, mano, vocês são da hora! Muito obrigada, de coração.', 'Vou ver se compensa largar meu canto, tá ligado?'],
  agricultor: ['Eita, gente boa! Deus lhe pague, viu? Salvaram minha pele.', 'Vou só pensar um tiquinho se largo a roça…'],
  capoeirista: ['Iê, camará! Que ginga, que axé! Valeu demais, irmão.', 'A roda tá girando… deixa eu sentir se é a hora.'],
  enfermeira: ['Ai, graças a Deus! Obrigada, meus filhos, vocês são uns anjos.', 'Deixa eu ver se dou conta de mais um abrigo pra cuidar…'],
};
const AGRADECE_PET: Record<PetType, string> = {
  cachorro: '(abana o rabo sem parar e lambe a mão do squad)', gato: '(se esfrega na perna do squad, ronronando alto)',
  capivara: '(deita do lado do squad, na maior paz do mundo)', jabuti: '(estica o pescoço devagarinho, quase um sorriso)',
  papagaio: 'Curupaco! Valeu, valeu! Lôro agradece!', sagui: '(pula no ombro do squad e faz tsi-tsi feliz)',
};

export function thanksLines(p: EncounterPlan): Fala[] {
  if (p.kind === 'rec') { const [a, b] = AGRADECE[p.recTipo!]; return [{ quem: 'npc', texto: a }, { quem: 'npc', texto: b }]; }
  return [{ quem: 'npc', texto: AGRADECE_PET[p.petTipo!] }, { quem: 'sys', texto: `${p.nome} tá decidindo se confia no squad…` }];
}

export function outcomeLine(p: EncounterPlan, ok: boolean): Fala {
  if (p.kind === 'rec') return { quem: 'npc', texto: ok ? 'Arretado! Tô dentro, bora pro abrigo!' : 'Ah, deixa pra lá… vou me virar sozinho.' };
  return { quem: 'npc', texto: ok ? `${SOM[p.petTipo!]} (cola no squad todo feliz)` : '(foge assustado pro meio dos escombros)' };
}

// ---------------- recompensa ----------------
export interface EncounterReward {
  recrutas: Recruit[]; pets: Pet[]; semCama: RecruitType | null; ok: number; falhou: number;
  /** recrutas que entraram no Alojamento de espera (sem cama) */
  alojados: Recruit[];
}

/** Aplica os encontros resolvidos: recrutado = cama, ou Alojamento de espera (CAM-2/3), ou sem lugar; pet sempre entra. */
export function applyEncounters(s: GameState, outs: EncounterOutcome[], now = Date.now()): EncounterReward {
  const rw: EncounterReward = { recrutas: [], pets: [], semCama: null, ok: 0, falhou: 0, alojados: [] };
  outs.forEach((o, i) => {
    if (o.recusada) return;
    if (!o.ok) { rw.falhou++; return; }
    rw.ok++;
    const p = o.plan;
    if (p.kind === 'rec' && p.recTipo) {
      const dest = destinoRecruta(s, p.recTipo, p.nota);
      if (!dest) { rw.semCama = p.recTipo; return; }
      const r: Recruit = { id: 'r' + now.toString(36) + i, tipo: p.recTipo, skin: p.skin ?? RECRUITS[p.recTipo].skins[0], nome: p.nome, lv: 1, xp: 0, nota: p.nota };
      if (dest === 'cama') s.recs.push(r); else { (s.alojamento ??= []).push(r); rw.alojados.push(r); }
      rw.recrutas.push(r);
    } else if (p.kind === 'pet' && p.petTipo) {
      const pt: Pet = { id: 'p' + now.toString(36) + i, tipo: p.petTipo, variante: p.variante ?? '', nome: p.nome, nota: p.nota };
      s.pets.push(pt); rw.pets.push(pt);
    }
  });
  s.missoes = { ok: (s.missoes?.ok ?? 0) + rw.ok, falhou: (s.missoes?.falhou ?? 0) + rw.falhou };
  return rw;
}
