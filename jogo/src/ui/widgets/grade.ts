// Selo colorido da nota (E..S) pra colocar no canto do retrato em qualquer tela.
import './grade.css';
import { GRADE_INFO, gradeOf, type Grade } from '../../data/grades';

/** HTML do selo. `x` pode ser a nota ou um recruta/pet (sem nota = C). */
export function gradeBadge(x: Grade | { nota?: Grade } | null | undefined, cls = ''): string {
  const g = typeof x === 'string' ? x : gradeOf(x);
  return `<span class="grade g-${g}${cls ? ' ' + cls : ''}" title="Nota ${g} · ${GRADE_INFO[g].nome}" style="--gc:${GRADE_INFO[g].cor}">${g}</span>`;
}
