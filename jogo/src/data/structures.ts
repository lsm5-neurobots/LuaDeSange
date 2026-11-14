// Estruturas do abrigo. Posições e sprites vêm do ABRIGO legado (mesmos ids); regras ficam aqui.
import type { Bag, ResId } from './resources';

export type StructId =
  | 'fogueira' | 'barraca' | 'barricada' | 'muralha' | 'portao' | 'posto_guarda'
  | 'coletor' | 'horta' | 'pilha_toras' | 'ponto_coleta' | 'gerador' | 'serralheria' | 'bancada';

export type StructCat = 'nucleo' | 'alojamento' | 'defesa' | 'producao' | 'oficina';

export interface StructDef {
  nome: string;
  cat: StructCat;
  max: number;
  /** custo do nível n (1..max) */
  custo: (n: number) => Bag;
  /** texto curto do efeito no nível n */
  efeito: (n: number) => string;
  /** vida no nível n (defesas) */
  hp?: (n: number) => number;
  /** produção passiva por minuto no nível n, com teto de estoque */
  prod?: { res: ResId; porMin: (n: number) => number; cap: (n: number) => number; extra?: ResId };
  /** segundos de obra */
  obra: (n: number) => number;
}

const mul = (b: Bag, n: number, k = 1): Bag => {
  const o: Bag = {};
  for (const [r, v] of Object.entries(b)) o[r as ResId] = Math.round((v as number) * (1 + (n - 1) * k));
  return o;
};
const tab = (arr: number[]) => (n: number) => arr[Math.max(0, Math.min(arr.length - 1, n - 1))];

export const STRUCTS: Record<StructId, StructDef> = {
  fogueira: {
    nome: 'Fogueira', cat: 'nucleo', max: 5, obra: (n) => 4 + n * 2,
    custo: (n) => mul({ madeira: 10, sucata: 5 }, n, 1.1),
    efeito: (n) => `Coração do abrigo. Libera nível ${n} das outras estruturas · cura ${[50, 75, 100, 100, 100][n - 1]}% entre expedições`,
  },
  barraca: {
    nome: 'Barraca', cat: 'alojamento', max: 5, obra: (n) => 3 + n * 2,
    custo: (n) => mul({ pano: 4, madeira: 4 }, n, 1),
    efeito: (n) => `${2 * n} camas pra recrutas`,
  },
  barricada: {
    nome: 'Barricada', cat: 'defesa', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 4, sucata: 2 }, n, 0.9),
    hp: tab([120, 220, 360, 550, 800]),
    efeito: (n) => `Segura a horda · ${tab([120, 220, 360, 550, 800])(n)} HP`,
  },
  muralha: {
    nome: 'Muralha', cat: 'defesa', max: 5, obra: (n) => 5 + n * 2,
    custo: (n) => mul({ madeira: 8, sucata: 4 }, n, 1),
    hp: tab([300, 600, 1000, 1600, 2500]),
    efeito: (n) => `${tab([300, 600, 1000, 1600, 2500])(n)} HP`,
  },
  portao: {
    nome: 'Portão', cat: 'defesa', max: 5, obra: (n) => 4 + n * 2,
    custo: (n) => mul({ madeira: 6, sucata: 4 }, n, 1),
    hp: tab([200, 400, 700, 1100, 1700]),
    efeito: (n) => `Saída das expedições · ${tab([200, 400, 700, 1100, 1700])(n)} HP`,
  },
  posto_guarda: {
    nome: 'Posto de guarda', cat: 'defesa', max: 5, obra: (n) => 4 + n,
    custo: (n) => mul({ madeira: 6, sucata: 2 }, n, 1),
    hp: tab([80, 140, 220, 320, 450]),
    efeito: (n) => `+${10 * n}% de defesa contra a Lua de Sangue`,
  },
  coletor: {
    nome: 'Coletor de água', cat: 'producao', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 6, pano: 2 }, n, 1),
    prod: { res: 'agua', porMin: tab([0.6, 1, 1.8, 3.2, 5]), cap: tab([30, 70, 150, 300, 600]) },
    efeito: (n) => `${tab([0.6, 1, 1.8, 3.2, 5])(n)} água/min · guarda ${tab([30, 70, 150, 300, 600])(n)}`,
  },
  horta: {
    nome: 'Horta', cat: 'producao', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 4, agua: 2 }, n, 1),
    prod: { res: 'comida', porMin: tab([0.4, 0.7, 1.1, 1.6, 2.2]), cap: tab([25, 50, 90, 150, 250]) },
    efeito: (n) => `${tab([0.4, 0.7, 1.1, 1.6, 2.2])(n)} comida/min · guarda ${tab([25, 50, 90, 150, 250])(n)}`,
  },
  pilha_toras: {
    nome: 'Pilha de toras', cat: 'producao', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 4, sucata: 1 }, n, 1),
    prod: { res: 'madeira', porMin: tab([0.3, 0.5, 0.8, 1.2, 1.6]), cap: tab([15, 25, 40, 60, 90]) },
    efeito: (n) => `${tab([0.3, 0.5, 0.8, 1.2, 1.6])(n)} madeira/min · guarda ${tab([15, 25, 40, 60, 90])(n)}`,
  },
  ponto_coleta: {
    nome: 'Ponto de coleta', cat: 'producao', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 3, pano: 2 }, n, 1),
    prod: { res: 'sucata', porMin: tab([0.2, 0.4, 0.6, 0.9, 1.2]), cap: tab([12, 20, 32, 48, 70]), extra: 'pano' },
    efeito: (n) => `${tab([0.2, 0.4, 0.6, 0.9, 1.2])(n)} sucata/min + pano · guarda ${tab([12, 20, 32, 48, 70])(n)}`,
  },
  gerador: {
    nome: 'Gerador', cat: 'producao', max: 5, obra: (n) => 5 + n,
    custo: (n) => mul({ pecas: 4, sucata: 8, gasolina: 1 }, n, 1),
    efeito: (n) => `+${10 * n}% de produção em todas as estruturas`,
  },
  serralheria: {
    nome: 'Oficina', cat: 'oficina', max: 5, obra: (n) => 4 + n * 2,
    // balanceamento: a Oficina trava a raridade das armas, então sobe caro (peças e fragmento lunar nos níveis altos)
    custo: (n) => [
      { sucata: 10, madeira: 5 },
      { sucata: 40, madeira: 20, pecas: 4 },
      { sucata: 90, madeira: 45, pecas: 10 },
      { sucata: 160, madeira: 80, pecas: 20, fragmento_lunar: 1 },
      { sucata: 250, madeira: 125, pecas: 35, fragmento_lunar: 3 },
    ][Math.max(0, Math.min(4, n - 1))] as Bag,
    // id 'serralheria' mantido por causa do save e do sprite do ABRIGO
    efeito: (n) => [
      'Fabrica bastão comum · força das armas até 2',
      'Bastão incomum · pistola · força até 3',
      'Laser · pistola incomum · força até 4',
      'Armas raras · força até 5',
      'Armas da Lua de Sangue',
    ][n - 1],
  },
  bancada: {
    nome: 'Bancada', cat: 'oficina', max: 5, obra: (n) => 3 + n,
    custo: (n) => mul({ madeira: 8, sucata: 2 }, n, 1),
    efeito: (n) => `Reparos ${10 * n}% mais baratos · +${5 * n}% vida do squad`,
  },
};

export const STRUCT_IDS = Object.keys(STRUCTS) as StructId[];
export const DEFENSES: StructId[] = STRUCT_IDS.filter((id) => STRUCTS[id].cat === 'defesa');
