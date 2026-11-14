// Notas (raridade/qualidade) de recrutas e pets: E, D, C, B, A, S.
// Todo recrutamento (recruta ou pet) chega com nota E (NOTA_INICIAL). A nota sobe por FUSÃO no abrigo:
// N iguais (mesmo tipo e mesma nota) viram 1 da nota seguinte (E→D→C→B→A→S). A nota multiplica atributos.

export type Grade = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export const GRADES: readonly Grade[] = ['E', 'D', 'C', 'B', 'A', 'S'];

export const GRADE_INFO: Record<Grade, { cor: string; nome: string; /** vida e dano do recruta */ mul: number; /** força do bônus do pet */ pet: number }> = {
  E: { cor: '#c0705e', nome: 'Fraco', mul: 0.85, pet: 0.5 },
  D: { cor: '#9aa0a6', nome: 'Comum', mul: 0.93, pet: 0.75 },
  C: { cor: '#5fd17a', nome: 'Bom', mul: 1, pet: 1 },
  B: { cor: '#4fa3ff', nome: 'Ótimo', mul: 1.1, pet: 1.25 },
  A: { cor: '#b57bff', nome: 'Raro', mul: 1.22, pet: 1.6 },
  S: { cor: '#f5c542', nome: 'Lendário', mul: 1.4, pet: 2 },
};

/** Nota com que todo recruta/pet chega do encontro no mapa. */
export const NOTA_INICIAL: Grade = 'E';

/**
 * FUS-1: quantos iguais (mesmo tipo + mesma nota) viram 1 da nota seguinte, pela nota de ORIGEM.
 * Decrescente: notas altas pedem menos cópias (E→D 3, D→C 3, C→B 3, B→A 2, A→S 2 = 108 E para um S).
 */
export const FUSAO_RECRUTAS: Record<Grade, number> = { E: 3, D: 3, C: 3, B: 2, A: 2, S: 0 };
/** FUS-1: mesma tabela para pets. */
export const FUSAO_PETS: Record<Grade, number> = { E: 3, D: 3, C: 3, B: 2, A: 2, S: 0 };
/** Quantos E são necessários para chegar à nota `g` (produto da tabela). */
export const totalE = (g: Grade, t: Record<Grade, number> = FUSAO_RECRUTAS) => GRADES.slice(0, GRADES.indexOf(g)).reduce((a, x) => a * t[x], 1);
/** CAM-2: vagas do Alojamento de espera (recrutas sem cama aguardando fusão; não ocupam cama, não comem, não lutam). */
export const ALOJAMENTO_VAGAS = 6;

/** Nota seguinte na fusão (S não sobe: null). */
export const nextGrade = (g: Grade): Grade | null => GRADES[GRADES.indexOf(g) + 1] ?? null;

/** Saves antigos sem nota: vira C (quem já tinha nota mantém a sua). */
export const gradeOf = (x: { nota?: Grade } | null | undefined): Grade => (x?.nota && GRADE_INFO[x.nota] ? x.nota : 'C');
export const gradeMul = (g: Grade | undefined) => GRADE_INFO[g ?? 'C'].mul;
export const petMul = (g: Grade | undefined) => GRADE_INFO[g ?? 'C'].pet;
