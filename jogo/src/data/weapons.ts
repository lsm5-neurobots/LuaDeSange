// Armas: 3 famílias × 4 raridades. Bastão = corpo a corpo; pistola = projétil; laser = feixe que atravessa.
import type { Bag } from './resources';

export type WeaponFamily = 'bastao' | 'pistola' | 'laser';
export type Tier = 'comum' | 'incomum' | 'raro' | 'lunar';
export const TIERS: Tier[] = ['comum', 'incomum', 'raro', 'lunar'];
export const TIER_INFO: Record<Tier, { nome: string; cor: string; mult: number }> = {
  comum: { nome: 'Comum', cor: '#b9b0a0', mult: 1 },
  incomum: { nome: 'Incomum', cor: '#4fb06a', mult: 1.35 },
  raro: { nome: 'Raro', cor: '#4a8fe0', mult: 1.75 },
  lunar: { nome: 'Lunar', cor: '#c8323a', mult: 2.3 },
};

export interface WeaponFamilyDef {
  nome: string;
  tipo: 'melee' | 'ranged' | 'beam';
  desc: string;
  /** dano base por golpe/tiro (multiplicado pela raridade) */
  dano: number;
  /** distância ideal de ataque, em px do mundo */
  alcance: number;
  /** segundos entre disparos (armas à distância) */
  cadencia: number;
  /** precisa de projeto (blueprint) pra fabricar a versão comum */
  precisaProjeto: boolean;
  nomes: Record<Tier, string>;
}

export const WEAPONS: Record<WeaponFamily, WeaponFamilyDef> = {
  bastao: {
    nome: 'Bastão', tipo: 'melee', dano: 8, alcance: 26, cadencia: 0, precisaProjeto: false,
    desc: 'Combo de 3 golpes; o 3º derruba. Especial: apito que atordoa quem está perto.',
    nomes: { comum: 'Cassetete de borracha', incomum: 'Cassetete com pregos', raro: 'Bastão de alumínio', lunar: 'Bastão da Lua de Sangue' },
  },
  pistola: {
    nome: 'Pistola', tipo: 'ranged', dano: 9, alcance: 120, cadencia: 0.55, precisaProjeto: true,
    desc: 'Atira de longe e mantém distância. Fraca contra grupos colados.',
    nomes: { comum: 'Revólver enferrujado', incomum: 'Pistola de policial', raro: 'Pistola com mira', lunar: 'Pistola da Lua de Sangue' },
  },
  laser: {
    nome: 'Laser', tipo: 'beam', dano: 16, alcance: 150, cadencia: 1.4, precisaProjeto: true,
    desc: 'Carrega e dispara um feixe que atravessa a fila inteira de zumbis.',
    nomes: { comum: 'Laser de solda', incomum: 'Cortador industrial', raro: 'Emissor focado', lunar: 'Raio lunar' },
  },
};

export interface WeaponRecipe { custo: Bag; serralheria: number }

/** Receita pra fabricar/evoluir uma arma até a raridade `tier`. */
export function recipe(f: WeaponFamily, tier: Tier): WeaponRecipe {
  const i = TIERS.indexOf(tier);
  const base: Record<WeaponFamily, Bag> = {
    bastao: { madeira: 4, sucata: 4 },
    pistola: { sucata: 8, pecas: 3 },
    laser: { sucata: 10, pecas: 6, gasolina: 1 },
  };
  const custo: Bag = {};
  for (const [k, v] of Object.entries(base[f])) custo[k as keyof Bag] = Math.round((v as number) * (1 + i * 1.2));
  if (tier === 'lunar') custo.fragmento_lunar = f === 'bastao' ? 1 : 2;
  const serrBase: Record<WeaponFamily, number> = { bastao: 1, pistola: 2, laser: 3 };
  return { custo, serralheria: Math.min(5, serrBase[f] + i) };
}

export function weaponDamage(f: WeaponFamily, tier: Tier): number {
  return WEAPONS[f].dano * TIER_INFO[tier].mult;
}

// ---------------- Oficina: força e projetos ----------------
/** Força normal vai até ★5; a FORJA LUNAR (só armas lunares, Oficina nv 5) leva de ★6 a ★10. */
export const FORCA_BASE = 5;
export const FORCA_MAX = 10;
/** Teto de força por raridade: lunar ★10, as outras ★5. */
export const forcaMaxDe = (tier: Tier) => (tier === 'lunar' ? FORCA_MAX : FORCA_BASE);
/** Multiplicador da força da arma: +12% por nível até ★5 (×1,48); forja lunar +10% por estrela (★10 = ×1,98). */
export const forcaMult = (nv = 1) => {
  const n = Math.max(1, Math.min(FORCA_MAX, nv));
  return 1 + 0.12 * (Math.min(n, FORCA_BASE) - 1) + 0.1 * Math.max(0, n - FORCA_BASE);
};
/** Projetos de melhoria gastos pra subir até a raridade `tier`. */
export const PROJETOS_TIER: Record<Tier, number> = { comum: 0, incomum: 2, raro: 5, lunar: 10 };

/** Custo pra levar a força de `nv` pra `nv + 1`. */
export function forcaCusto(f: WeaponFamily, tier: Tier, nv: number): Bag {
  // forja lunar (★5→★6 … ★9→★10): cara em sucata e peças, + fragmentos lunares (1+1+2+2+3 = 9 por arma)
  if (nv >= FORCA_BASE) { const k = nv - FORCA_BASE + 1; return { sucata: 80 * k, pecas: 15 * k, fragmento_lunar: Math.ceil(k / 2) }; }
  const i = TIERS.indexOf(tier);
  const k = nv * (1 + i * 0.5);
  const c: Bag = { sucata: Math.round(4 * k) };
  if (f !== 'bastao' || nv >= 2) c.pecas = Math.max(1, Math.round((f === 'laser' ? 1.5 : 1) * k * 0.5));
  if (f === 'bastao') c.madeira = Math.round(3 * k);
  if (nv >= 4) c.fragmento_lunar = 1;
  return c;
}
