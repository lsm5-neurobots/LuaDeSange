// Regras puras de armas (Oficina): fabricar a comum, evoluir raridade com projetos, forjar força e equipar.
// Expedições só trazem armas COMUNS (e projetos); raridade e força sobem aqui, limitadas pelo nível da Oficina.
import {
  FORCA_BASE, FORCA_MAX, forcaMaxDe, PROJETOS_TIER, TIERS, WEAPONS, forcaCusto, recipe, type Tier, type WeaponFamily,
} from '../data/weapons';
import type { Bag } from '../data/resources';
import { canPay, pay, scaleBag } from './economy';
import { lvl, temRecruta } from './shelter';
import { addLog, type GameState, type WeaponItem } from './state';

export type CraftBlock = 'projeto' | 'serralheria' | 'recursos' | 'max' | null;
/** Cópias máximas da mesma família no arsenal (o resto vira projeto). */
export const MAX_COPIAS = 2;

const discount = (s: GameState) => (temRecruta(s, 'serralheiro') ? 0.85 : 1);
const newId = () => 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
export const oficinaLv = (s: GameState) => lvl(s, 'serralheria');
export const forcaOf = (w: WeaponItem) => w.nv ?? 1;
export const projetosDe = (s: GameState, f: WeaponFamily) => s.projetosQtd?.[f] ?? 0;
export const copias = (s: GameState, f: WeaponFamily) => s.armas.filter((w) => w.familia === f).length;
export const weaponById = (s: GameState, id: string) => s.armas.find((w) => w.id === id);

export function craftCost(s: GameState, f: WeaponFamily, tier: Tier): Bag {
  return scaleBag(recipe(f, tier).custo, discount(s));
}

export function bestOwned(s: GameState, f: WeaponFamily): WeaponItem | undefined {
  return s.armas.filter((w) => w.familia === f).sort((a, b) => TIERS.indexOf(b.tier) - TIERS.indexOf(a.tier) || forcaOf(b) - forcaOf(a))[0];
}

/** Maior raridade que a Oficina atual deixa chegar nessa família (null = nem a comum). */
export function tierCap(s: GameState, f: WeaponFamily): Tier | null {
  let cap: Tier | null = null;
  for (const t of TIERS) if (oficinaLv(s) >= recipe(f, t).serralheria) cap = t;
  return cap;
}
/** Força máxima permitida pela Oficina: nível + 1 até ★5 (sem Oficina, nada de forja). Com a Oficina no máximo,
 *  uma arma LUNAR passa pela forja lunar até ★10. */
export const forcaCap = (s: GameState, w?: WeaponItem) => {
  const lv = oficinaLv(s);
  if (!lv) return 1;
  if (w?.tier === 'lunar' && lv >= 5) return FORCA_MAX;
  return Math.min(FORCA_BASE, lv + 1);
};

export function nextTierOf(w: WeaponItem): Tier | null {
  const i = TIERS.indexOf(w.tier);
  return i < TIERS.length - 1 ? TIERS[i + 1] : null;
}

// ---------------- fabricar (só a comum) ----------------
export function craftBlock(s: GameState, f: WeaponFamily): CraftBlock {
  if (copias(s, f) >= MAX_COPIAS) return 'max';
  if (WEAPONS[f].precisaProjeto && !s.projetos.includes(f)) return 'projeto';
  if (oficinaLv(s) < recipe(f, 'comum').serralheria) return 'serralheria';
  if (!canPay(s, craftCost(s, f, 'comum'))) return 'recursos';
  return null;
}

/** Fabrica uma arma comum nova dessa família. */
export function craft(s: GameState, f: WeaponFamily): WeaponItem | null {
  if (craftBlock(s, f)) return null;
  pay(s, craftCost(s, f, 'comum'));
  const item: WeaponItem = { id: newId(), familia: f, tier: 'comum', nv: 1 };
  s.armas.push(item);
  addLog(s, `Fabricou na Oficina: <b>${WEAPONS[f].nomes.comum}</b>.`);
  return item;
}

// ---------------- evoluir raridade (projetos + recursos) ----------------
export function upgradeCost(s: GameState, w: WeaponItem): Bag {
  const t = nextTierOf(w);
  return t ? craftCost(s, w.familia, t) : {};
}

export function upgradeBlock(s: GameState, weaponId: string): CraftBlock {
  const w = weaponById(s, weaponId);
  if (!w) return 'max';
  const t = nextTierOf(w);
  if (!t) return 'max';
  if (oficinaLv(s) < recipe(w.familia, t).serralheria) return 'serralheria';
  if (projetosDe(s, w.familia) < PROJETOS_TIER[t]) return 'projeto';
  if (!canPay(s, upgradeCost(s, w))) return 'recursos';
  return null;
}

/** Sobe a raridade da arma (mantém id, força e quem está equipado). */
export function upgradeTier(s: GameState, weaponId: string): WeaponItem | null {
  if (upgradeBlock(s, weaponId)) return null;
  const w = weaponById(s, weaponId)!, t = nextTierOf(w)!;
  pay(s, upgradeCost(s, w));
  s.projetosQtd = { ...s.projetosQtd, [w.familia]: projetosDe(s, w.familia) - PROJETOS_TIER[t] };
  w.tier = t;
  addLog(s, `Oficina: evoluiu para <b>${WEAPONS[w.familia].nomes[t]}</b> (${t}).`);
  return w;
}

// ---------------- forjar força ----------------
export function forjaCost(s: GameState, w: WeaponItem): Bag {
  return scaleBag(forcaCusto(w.familia, w.tier, forcaOf(w)), discount(s));
}

/** 'lunar' = arma no ★5 que ainda não é lunar (a forja lunar ★6–★10 pede raridade lunar). */
export type ForjaBlock = 'max' | 'lunar' | 'serralheria' | 'recursos' | null;
export function forjaBlock(s: GameState, weaponId: string): ForjaBlock {
  const w = weaponById(s, weaponId);
  if (!w || forcaOf(w) >= FORCA_MAX) return 'max';
  if (forcaOf(w) >= forcaMaxDe(w.tier)) return 'lunar';
  if (forcaOf(w) >= forcaCap(s, w)) return 'serralheria';
  if (!canPay(s, forjaCost(s, w))) return 'recursos';
  return null;
}

export function forja(s: GameState, weaponId: string): WeaponItem | null {
  if (forjaBlock(s, weaponId)) return null;
  const w = weaponById(s, weaponId)!;
  pay(s, forjaCost(s, w));
  w.nv = forcaOf(w) + 1;
  addLog(s, `Oficina: <b>${WEAPONS[w.familia].nomes[w.tier]}</b> agora tem força ${w.nv}.`);
  return w;
}

// ---------------- achados da expedição ----------------
/** Arma achada na expedição: sempre comum. Se o arsenal já tem cópias demais, vira projeto. */
export function addFoundWeapon(s: GameState, f: WeaponFamily): WeaponItem | null {
  if (!s.projetos.includes(f) && WEAPONS[f].precisaProjeto) s.projetos.push(f); // achar a arma ensina a fazer
  if (copias(s, f) >= MAX_COPIAS) { addProjeto(s, f); return null; }
  const item: WeaponItem = { id: newId(), familia: f, tier: 'comum', nv: 1 };
  s.armas.push(item);
  return item;
}

export function addProjeto(s: GameState, f: WeaponFamily, n = 1): void {
  s.projetosQtd = { ...s.projetosQtd, [f]: projetosDe(s, f) + n };
}

// ---------------- equipar ----------------
export function equip(s: GameState, memberId: string, weaponId: string): void {
  if (!s.armas.some((w) => w.id === weaponId)) return;
  for (const m of Object.keys(s.equip)) if (s.equip[m] === weaponId && m !== memberId) delete s.equip[m];
  s.equip[memberId] = weaponId;
}

export function equipped(s: GameState, memberId: string): WeaponItem {
  return s.armas.find((w) => w.id === s.equip[memberId]) ?? { id: 'mao', familia: 'bastao', tier: 'comum' };
}

/** Quem está usando essa arma (id do membro) ou null. */
export const holderOf = (s: GameState, weaponId: string) => Object.keys(s.equip).find((m) => s.equip[m] === weaponId) ?? null;
