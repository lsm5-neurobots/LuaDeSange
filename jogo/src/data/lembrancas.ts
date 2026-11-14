// Lembranças dos mapas: 3 objetos por mapa que lembram um ponto turístico. Cada um sai de uma missão do mapa
// (feita numa expedição, online ou no loop offline) e dá um bônus pequeno e permanente ao squad. Ficam na prateleira do abrigo.
import type { ZombieId } from './zombies';

export type BonusKey = 'vida' | 'dano' | 'esquiva' | 'loot' | 'cura' | 'chaves';

/** Missão da lembrança. `chefeSemKit` e `vencerLua` valem numa expedição só; `vitorias` e `abates` acumulam. */
export type LembrancaCond =
  | { k: 'chefeSemKit' }
  | { k: 'vencerLua' }
  | { k: 'vitorias'; n: number }
  | { k: 'abates'; tipo: ZombieId; n: number };

export interface LembrancaDef {
  id: string;
  mapa: string;
  nome: string;
  /** de onde vem (ponto turístico) */
  origem: string;
  missao: string;
  cond: LembrancaCond;
  bonus: Partial<Record<BonusKey, number>>;
}

export const LEMBRANCAS: LembrancaDef[] = [
  // Marco Zero (Recife Antigo)
  { id: 'lb_galo', mapa: 'marco_zero', nome: 'Chaveiro do Galo da Madrugada', origem: 'O maior bloco de Carnaval do mundo, no Recife', missao: 'Derrote O Açougueiro sem usar kit de cura.', cond: { k: 'chefeSemKit' }, bonus: { dano: 0.04 } },
  { id: 'lb_sombrinha', mapa: 'marco_zero', nome: 'Sombrinha de frevo', origem: 'Paço do Frevo, Bairro do Recife', missao: 'Vença o Marco Zero 3 vezes.', cond: { k: 'vitorias', n: 3 }, bonus: { esquiva: 0.03 } },
  { id: 'lb_torre', mapa: 'marco_zero', nome: 'Miniatura da Torre de Cristal', origem: 'Parque das Esculturas, de frente pro Marco Zero', missao: 'Derrote o Brutamonte 5 vezes.', cond: { k: 'abates', tipo: 'brutamonte', n: 5 }, bonus: { vida: 0.04 } },
  // Olinda
  { id: 'lb_boneco', mapa: 'olinda', nome: 'Mini Boneco Gigante', origem: 'Bonecos do Carnaval de Olinda', missao: 'Derrote o Boneco da Meia-Noite sem usar kit de cura.', cond: { k: 'chefeSemKit' }, bonus: { vida: 0.05 } },
  { id: 'lb_azulejo', mapa: 'olinda', nome: 'Azulejo do Alto da Sé', origem: 'Casarios e igrejas do Alto da Sé', missao: 'Vença Olinda 3 vezes.', cond: { k: 'vitorias', n: 3 }, bonus: { loot: 0.05 } },
  { id: 'lb_sino', mapa: 'olinda', nome: 'Sino do Mosteiro de São Bento', origem: 'Mosteiro de São Bento, Olinda', missao: 'Derrote A Chorona 5 vezes.', cond: { k: 'abates', tipo: 'chorona', n: 5 }, bonus: { cura: 0.08 } },
  // Pelourinho (Salvador)
  { id: 'lb_fitinha', mapa: 'pelourinho', nome: 'Fitinha do Senhor do Bonfim', origem: 'Igreja do Bonfim, Salvador', missao: 'Vença o Pelourinho numa noite de Lua de Sangue.', cond: { k: 'vencerLua' }, bonus: { chaves: 1 } },
  { id: 'lb_elevador', mapa: 'pelourinho', nome: 'Miniatura do Elevador Lacerda', origem: 'Liga a Cidade Baixa à Cidade Alta', missao: 'Derrote O Ascensorista sem usar kit de cura.', cond: { k: 'chefeSemKit' }, bonus: { dano: 0.05 } },
  { id: 'lb_berimbau', mapa: 'pelourinho', nome: 'Berimbau de bolso', origem: 'Rodas de capoeira do Terreiro de Jesus', missao: 'Mate 150 Zumbis Percussionistas.', cond: { k: 'abates', tipo: 'percussionista', n: 150 }, bonus: { esquiva: 0.03 } },
  // Ver-o-Peso (Belém)
  { id: 'lb_garrafada', mapa: 'veropeso', nome: 'Garrafada da Erveira', origem: 'Banca das erveiras do Ver-o-Peso', missao: 'Derrote A Erveira 5 vezes.', cond: { k: 'abates', tipo: 'erveira', n: 5 }, bonus: { cura: 0.1 } },
  { id: 'lb_mercado', mapa: 'veropeso', nome: 'Miniatura do Mercado de Ferro', origem: 'Mercado de Peixe, torres de ferro na beira da baía', missao: 'Derrote O Estivador sem usar kit de cura.', cond: { k: 'chefeSemKit' }, bonus: { vida: 0.05 } },
  { id: 'lb_cuia', mapa: 'veropeso', nome: 'Cuia de tacacá', origem: 'Barracas de comida do Ver-o-Peso', missao: 'Vença o Ver-o-Peso 3 vezes.', cond: { k: 'vitorias', n: 3 }, bonus: { loot: 0.05 } },
  // Lapa (Rio de Janeiro)
  { id: 'lb_bonde', mapa: 'lapa', nome: 'Bondinho de Santa Teresa', origem: 'Bonde amarelo que cruza os Arcos da Lapa', missao: 'Derrote O Maquinista do Bonde sem usar kit de cura.', cond: { k: 'chefeSemKit' }, bonus: { dano: 0.05 } },
  { id: 'lb_pluma', mapa: 'lapa', nome: 'Pluma de passista', origem: 'Fantasias de samba e Carnaval do Rio', missao: 'Derrote A Passista 5 vezes.', cond: { k: 'abates', tipo: 'passista', n: 5 }, bonus: { esquiva: 0.03 } },
  { id: 'lb_ladrilho', mapa: 'lapa', nome: 'Azulejo da Escadaria Selarón', origem: 'Degraus de azulejo colorido, entre a Lapa e Santa Teresa', missao: 'Vença a Lapa 3 vezes.', cond: { k: 'vitorias', n: 3 }, bonus: { loot: 0.05 } },
];

export const LEMBRANCA = Object.fromEntries(LEMBRANCAS.map((l) => [l.id, l])) as Record<string, LembrancaDef>;

const BONUS_TXT: Record<BonusKey, (v: number) => string> = {
  vida: (v) => `+${Math.round(v * 100)}% vida`,
  dano: (v) => `+${Math.round(v * 100)}% dano`,
  esquiva: (v) => `+${Math.round(v * 100)}% esquiva`,
  loot: (v) => `+${Math.round(v * 100)}% loot`,
  cura: (v) => `+${Math.round(v * 100)}% cura`,
  chaves: (v) => `+${v} chave grátis por expedição`,
};
export const bonusTxt = (b: LembrancaDef['bonus']) =>
  (Object.entries(b) as [BonusKey, number][]).map(([k, v]) => BONUS_TXT[k](v)).join(' · ');
