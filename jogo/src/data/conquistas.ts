// Conquistas: metas longas ("Mate 1000 Errantes"). Cada uma é um contador do save comparado com uma meta;
// ao bater, fica pronta pra resgatar no painel (prêmio em material, maior a cada nível).
import { ZOMBIES, type ZombieId } from './zombies';
import type { Bag } from './resources';
import type { GameState } from '../game/state';
import { LEMBRANCAS } from './lembrancas';

export type ConqGrupo = 'matanca' | 'chefes' | 'lua' | 'expedicoes' | 'abrigo' | 'colecao';
export const CONQ_GRUPOS: Record<ConqGrupo, string> = {
  matanca: 'Matança', chefes: 'Chefes', lua: 'Lua de Sangue', expedicoes: 'Expedições', abrigo: 'Abrigo', colecao: 'Coleção',
};

export interface ConquistaDef {
  id: string;
  grupo: ConqGrupo;
  nome: string;
  desc: string;
  meta: number;
  /** 0, 1 ou 2: define o prêmio e a cor do selo */
  nivel: 0 | 1 | 2;
  stat: (s: GameState) => number;
  premio: Bag;
}

const PREMIOS: Bag[] = [
  { madeira: 15, sucata: 10, comida: 4 },
  { sucata: 20, pecas: 4, fragmento_lunar: 1 },
  { pecas: 8, fragmento_lunar: 3 },
];

const total = (r: Record<string, number> | undefined) => Object.values(r ?? {}).reduce((a, n) => a + (n ?? 0), 0);
const forma = (s: GameState, f: string) => Object.entries(s.derrotadosForma ?? {}).reduce((a, [k, n]) => a + (k.endsWith(':' + f) ? n ?? 0 : 0), 0);
const fmt = (n: number) => n.toLocaleString('pt-BR');

const out: ConquistaDef[] = [];
/** Série de níveis da mesma meta (até 3). */
function serie(base: string, grupo: ConqGrupo, metas: number[], nome: (i: number) => string, desc: (n: string) => string, stat: (s: GameState) => number) {
  metas.forEach((m, i) => out.push({ id: `${base}_${m}`, grupo, nome: nome(i), desc: desc(fmt(m)), meta: m, nivel: Math.min(2, i) as 0 | 1 | 2, stat, premio: PREMIOS[Math.min(2, i)] }));
}
const ROM = ['I', 'II', 'III'];

serie('abates', 'matanca', [100, 1000, 10000], (i) => `Limpa-rua ${ROM[i]}`, (n) => `Mate ${n} zumbis.`, (s) => total(s.derrotados));
const COMUNS: ZombieId[] = ['errante', 'rastejante', 'corredor', 'cuspidor', 'gritador', 'barrigudo', 'saltador', 'estalador', 'percussionista', 'blindado', 'barqueiro'];
const pl = (w: string) => (/[rz]$/.test(w) ? w + 'es' : w + 's');
const plural = (k: ZombieId) => { const n = ZOMBIES[k].nome; return n.startsWith('Zumbi ') ? 'Zumbis ' + pl(n.slice(6)) : pl(n); };
/** "o Brutamonte", "O Açougueiro", "A Chorona" (nome já com artigo fica como está) */
const art = (k: ZombieId) => { const n = ZOMBIES[k].nome; return /^(O|A) /.test(n) ? n : 'o ' + n; };
for (const k of COMUNS) serie(`z_${k}`, 'matanca', [100, 1000], (i) => `Caçador de ${plural(k)} ${ROM[i]}`, (n) => `Mate ${n} ${plural(k)}.`, (s) => s.derrotados?.[k] ?? 0);

const CHEFES: ZombieId[] = ['brutamonte', 'acougueiro', 'chorona', 'meianoite', 'vendedorfitas', 'ascensorista', 'erveira', 'estivador'];
for (const k of CHEFES) serie(`b_${k}`, 'chefes', [1, 25], (i) => (i ? `${ZOMBIES[k].nome} ×25` : `Abateu ${art(k)}`), (n) => (n === '1' ? `Derrote ${art(k)}.` : `Derrote ${art(k)} ${n} vezes.`), (s) => s.derrotados?.[k] ?? 0);

serie('enluarado', 'lua', [50, 500], (i) => `Sob a Lua ${ROM[i]}`, (n) => `Mate ${n} zumbis enluarados.`, (s) => forma(s, 'enluarado'));
serie('plenilunar', 'lua', [10, 100], (i) => `Lua Cheia ${ROM[i]}`, (n) => `Mate ${n} zumbis plenilunares.`, (s) => forma(s, 'plenilunar'));
serie('luas', 'lua', [1, 10, 50], (i) => `Portão de pé ${ROM[i]}`, (n) => `Segure ${n} ${n === '1' ? 'Lua de Sangue' : 'Luas de Sangue'} sem a horda invadir.`, (s) => s.stats?.luasSeguradas ?? 0);

serie('exped', 'expedicoes', [10, 50, 250], (i) => `Andarilho ${ROM[i]}`, (n) => `Faça ${n} expedições.`, (s) => s.expedicoes ?? 0);
serie('vit', 'expedicoes', [1, 25, 100], (i) => `Vencedor ${ROM[i]}`, (n) => `Vença ${n} ${n === '1' ? 'expedição' : 'expedições'}.`, (s) => s.vitorias ?? 0);
serie('missoes', 'expedicoes', [5, 25, 100], (i) => `Bom samaritano ${ROM[i]}`, (n) => `Cumpra ${n} missões de sobreviventes ou pets.`, (s) => s.missoes?.ok ?? 0);
serie('mapas', 'expedicoes', [1, 2, 4], (i) => `Desbravador ${ROM[i]}`, (n) => `Vença ${n} ${n === '1' ? 'mapa' : 'mapas diferentes'}.`, (s) => (s.vencidos ?? []).length);

serie('recs', 'abrigo', [4, 8, 16], (i) => `Comunidade ${ROM[i]}`, (n) => `Tenha ${n} recrutas no abrigo (camas + alojamento).`, (s) => (s.recs?.length ?? 0) + (s.alojamento?.length ?? 0));
serie('heroi', 'abrigo', [5, 15, 30], (i) => `Veterano ${ROM[i]}`, (n) => `Leve o herói ao nível ${n}.`, (s) => s.heroLv ?? 1);

serie('lemb', 'colecao', [1, 6, LEMBRANCAS.length], (i) => `Turista do fim do mundo ${ROM[i]}`, (n) => `Junte ${n} lembranças dos mapas.`, (s) => Object.keys(s.lembrancas ?? {}).length);

export const CONQUISTAS: ConquistaDef[] = out;
export const CONQUISTA = Object.fromEntries(out.map((c) => [c.id, c])) as Record<string, ConquistaDef>;
