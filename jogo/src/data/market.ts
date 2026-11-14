// Mercado do abrigo (feira de troca): paga com recursos, recebe itens de expedição ou armas.
import type { Bag } from './resources';
import type { WeaponFamily } from './weapons';

export type ItemMk =
  | 'chave_comum' | 'chave_medico' | 'chave_militar' | 'chave_raro'
  | 'kit_cura' | 'presente' | 'adrenalina' | 'colete';

export interface MarketItem {
  id: ItemMk | `arma_${WeaponFamily}`;
  nome: string;
  desc: string;
  preco: Bag;
  cat: 'chaves' | 'consumiveis' | 'armas';
  /** cor do selo/borda do card (o ícone é pixel art: itemImg / weaponImg) */
  cor: string;
  /** só aparece depois de vencer este mapa */
  requer?: string;
}

/** Itens consumíveis usados no plano da expedição. */
export const ITEM_MK: Record<ItemMk, { nome: string; desc: string; cor: string }> = {
  chave_comum: { nome: 'Chave de bronze', desc: 'Abre na hora um baú comum, sem puzzle.', cor: '#c8843a' },
  chave_medico: { nome: 'Chave médica', desc: 'Abre na hora um baú médico.', cor: '#ff6a8a' },
  chave_militar: { nome: 'Chave militar', desc: 'Abre na hora um baú militar.', cor: '#7fae5a' },
  chave_raro: { nome: 'Chave de ouro', desc: 'Abre na hora um baú raro.', cor: '#e5b443' },
  kit_cura: { nome: 'Kit de cura', desc: 'Usado sozinho quando alguém do squad fica com pouca vida: cura 50% de todos.', cor: '#6fdc7a' },
  presente: { nome: 'Presente', desc: 'Comida boa e cigarro de palha: +15% de chance de recrutar sobrevivente ou pet na expedição.', cor: '#e8b8ff' },
  adrenalina: { nome: 'Adrenalina', desc: '+15% de dano durante uma expedição.', cor: '#ff5a3a' },
  colete: { nome: 'Colete improvisado', desc: '+15% de vida durante uma expedição.', cor: '#8a9ab0' },
};

export const MARKET: MarketItem[] = [
  { id: 'chave_comum', ...ITEM_MK.chave_comum, preco: { sucata: 6 }, cat: 'chaves' },
  { id: 'chave_medico', ...ITEM_MK.chave_medico, preco: { sucata: 5, remedio: 1 }, cat: 'chaves' },
  { id: 'chave_militar', ...ITEM_MK.chave_militar, preco: { pecas: 3, sucata: 4 }, cat: 'chaves' },
  { id: 'chave_raro', ...ITEM_MK.chave_raro, preco: { fragmento_lunar: 1, pecas: 4 }, cat: 'chaves', requer: 'marco_zero' },
  { id: 'kit_cura', ...ITEM_MK.kit_cura, preco: { pano: 2, remedio: 1 }, cat: 'consumiveis' },
  { id: 'presente', ...ITEM_MK.presente, preco: { comida: 3, agua: 2 }, cat: 'consumiveis' },
  { id: 'adrenalina', ...ITEM_MK.adrenalina, preco: { remedio: 1, pecas: 2 }, cat: 'consumiveis' },
  { id: 'colete', ...ITEM_MK.colete, preco: { pano: 3, sucata: 4 }, cat: 'consumiveis' },
  { id: 'arma_bastao', nome: 'Bastão (comum)', desc: 'Arma corpo a corpo. Evolua a raridade na Oficina.', preco: { madeira: 8, sucata: 4 }, cat: 'armas', cor: '#a8743a' },
  { id: 'arma_pistola', nome: 'Pistola (comum)', desc: 'Tiro à distância. Evolua a raridade na Oficina.', preco: { sucata: 10, pecas: 2 }, cat: 'armas', cor: '#8a8a96' },
  { id: 'arma_laser', nome: 'Laser (comum)', desc: 'Feixe de energia lunar. Evolua a raridade na Oficina.', preco: { pecas: 6, fragmento_lunar: 1 }, cat: 'armas', cor: '#3ed4ff', requer: 'marco_zero' },
];

/** chave do item → tipo de baú do motor (w.keys) */
export const KEY_OF: Record<string, 'comum' | 'medico' | 'militar' | 'raro'> = {
  chave_comum: 'comum', chave_medico: 'medico', chave_militar: 'militar', chave_raro: 'raro',
};
