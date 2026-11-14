// Plano da expedição automática (escolhido no abrigo antes de partir): chaves que abrem baú na hora,
// kits de cura usados sozinhos quando a vida cai, e o que sobra volta pro inventário.
import type { ItemMk } from '../data/market';
import type { PetType, RecruitType } from '../data/recruits';
import { KEY_OF } from '../data/market';
import { aliveF, spawnFx, type World } from './world';

export interface ExpeditionPlan {
  /** aceitar encontros/missões de recrutamento no mapa */
  recrutar: boolean;
  /** abrir baús com chave na hora (sem puzzle) quando tiver a chave */
  usarChaves: boolean;
  /** usar kits de cura automaticamente */
  usarKits: boolean;
  /** vida (0..1) abaixo da qual o kit é usado */
  kitLimiar: number;
  /** bônus em pontos percentuais na chance de recrutar (presentes) */
  isca: number;
  /** itens levados do inventário */
  itens: Partial<Record<ItemMk, number>>;
  /** gatilho do kit: 'um' = alguém abaixo do limiar · 'media' = média do squad abaixo (ausente = 'um') */
  kitModo?: 'um' | 'media';
  /** máximo de kits por arena (0/ausente = sem limite) */
  kitMaxArena?: number;
  /** baú sem chave: tentar o puzzle de 5 s ou passar reto (ausente = puzzle) */
  semChave?: 'puzzle' | 'pular';
  /** ofícios que o squad aceita recrutar (ausente = todos) */
  oficios?: RecruitType[];
  /** pets que o squad aceita (ausente = todos) */
  pets?: PetType[];
  /** só aceita missão se a vida média do squad estiver acima disso (0..1; ausente = 0) */
  recrutarVidaMin?: number;
  /** recua sozinho (guardando o loot) quando a vida média do squad cai abaixo disso e não há kit (0 = nunca; ausente = 0) */
  recuarVida?: number;
}

/** Vida média do squad (caído conta 0). */
export const squadVida = (w: World): number => (w.fs.length ? w.fs.reduce((a, f) => a + (f.down ? 0 : f.hp / f.maxhp), 0) / w.fs.length : 0);
/** O plano manda recuar agora? (em luta, sem kit pra usar) */
export function querRecuar(w: World): boolean {
  // no chefe arrisca mais (limiar ×0,4), igual ao simulador do loop
  const lim = (w.cfg.plano?.recuarVida ?? 0) * (w.boss && !w.boss.dead ? 0.4 : 1);
  return lim > 0 && w.phase === 'fight' && !(w.kits ?? 0) && squadVida(w) < lim && aliveF(w).length > 0;
}

/** O plano aceita esse encontro (ofício/pet na lista)? */
export function aceitaEncontro(p: Pick<ExpeditionPlan, 'recrutar' | 'oficios' | 'pets'> | undefined, e: { kind: 'rec' | 'pet'; recTipo?: RecruitType; petTipo?: PetType }): boolean {
  if (!p || p.recrutar === false) return false;
  if (e.kind === 'rec') return !p.oficios || (!!e.recTipo && p.oficios.includes(e.recTipo));
  return !p.pets || (!!e.petTipo && p.pets.includes(e.petTipo));
}

/** Chaves do plano somadas às chaves grátis do motor. */
export function planKeys(plan: ExpeditionPlan | undefined): Record<string, number> {
  const k: Record<string, number> = { comum: 0, medico: 0, militar: 0, raro: 0 };
  if (!plan) return k;
  for (const [id, n] of Object.entries(plan.itens)) if (KEY_OF[id]) k[KEY_OF[id]] += n ?? 0;
  return k;
}

export function initPlan(w: World): void {
  const p = w.cfg.plano;
  w.planKeys = planKeys(p);
  w.kits = p?.usarKits === false ? 0 : p?.itens.kit_cura ?? 0;
  w.kitsLevados = p?.itens.kit_cura ?? 0;
  w.kitsUsados = 0; w.kitCd = 0; w.kitArena = -1; w.kitArenaN = 0;
}

export function updatePlan(w: World, dt: number): void {
  w.kitCd = Math.max(0, (w.kitCd ?? 0) - dt);
  if (!w.kits || w.kitCd > 0 || (w.phase !== 'fight' && w.phase !== 'warning')) return;
  const p = w.cfg.plano, lim = p?.kitLimiar ?? 0.35;
  if (w.kitArena !== w.ai) { w.kitArena = w.ai; w.kitArenaN = 0; }
  if (p?.kitMaxArena && (w.kitArenaN ?? 0) >= p.kitMaxArena) return;
  const fs = aliveF(w);
  const baixo = p?.kitModo === 'media' ? fs.reduce((a, f) => a + f.hp / f.maxhp, 0) / Math.max(1, fs.length) < lim : fs.some((f) => f.hp < f.maxhp * lim);
  if (!baixo) return;
  w.kits--; w.kitsUsados = (w.kitsUsados ?? 0) + 1; w.kitCd = 2.5; w.kitArenaN = (w.kitArenaN ?? 0) + 1;
  for (const f of fs) {
    f.hp = Math.min(f.maxhp, f.hp + f.maxhp * 0.5);
    spawnFx(w, 'pickup', f.x, f.y - 34, 1, undefined, 24, true);
  }
  w.fx('burst', 'KIT DE CURA!', fs[0].x, fs[0].y - 96);
  w.log(`Kit de cura usado (+50% de vida) · restam ${w.kits}`);
}

/** O que volta pro inventário: kits não usados e chaves do plano que sobraram. */
export function planLeftover(w: World): Partial<Record<ItemMk, number>> {
  const p = w.cfg.plano;
  if (!p) return {};
  const out: Partial<Record<ItemMk, number>> = {};
  const kitsLeft = (w.kitsLevados ?? 0) - (w.kitsUsados ?? 0);
  if (kitsLeft > 0) out.kit_cura = kitsLeft;
  for (const [id, n] of Object.entries(p.itens)) {
    const t = KEY_OF[id];
    if (!t || !n) continue;
    out[id as ItemMk] = Math.max(0, Math.min(n, w.keys[t] ?? 0)); // chaves grátis são gastas antes
  }
  return out;
}
