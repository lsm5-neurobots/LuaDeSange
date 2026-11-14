// Painel de provisões da expedição (squad e plano): cada recurso com tem/precisa e, se faltar,
// um aviso claro do que falta e como resolver (coletar o que está pronto, construir/esperar a produção, ir solo).
import './provisoes.css';
import { RESOURCES, type ResId } from '../../data/resources';
import { STRUCTS, type StructId } from '../../data/structures';
import { mutate, type GameState } from '../../game/state';
import { collect, prodMult } from '../../game/shelter';
import { custoExpedicao, faltaExpedicao, racaoEmergencia, type FaltaProvisao } from '../../game/upkeep';
import { itemImg } from '../../art/items';
import { toast } from '../widgets/toast';
import { openBuild } from './panels';

/** quem produz cada provisão no abrigo */
const FONTE: Partial<Record<ResId, StructId>> = { agua: 'coletor', comida: 'horta' };

const nomeMin = (r: ResId) => RESOURCES[r].nome.toLowerCase();
const lista = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

/** "Falta comida e água" — texto do botão bloqueado. */
export function faltaLabel(f: FaltaProvisao[]): string {
  return `Falta ${lista(f.map((x) => nomeMin(x.res)))}`;
}

function dica(s: GameState, f: FaltaProvisao): string {
  const id = FONTE[f.res];
  if (!id) return `<li>${itemImg(f.res, 18)} <b>${RESOURCES[f.res].nome}</b>: falta <b>${f.falta}</b>. Vem de expedições (baús e vasculhar), não é produzido no abrigo.</li>`;
  const def = STRUCTS[id], e = s.estruturas[id], nv = e?.nv ?? 0;
  const pronto = Math.floor(s.prodBuf[id] ?? 0);
  const btnCol = pronto > 0 ? ` <button class="btn sm" data-act="pv-col" data-id="${id}">Coletar +${pronto} da ${def.nome}</button>` : '';
  let como: string;
  if (nv <= 0) como = `Você ainda não tem ${def.nome}. <button class="btn sm ghost" data-act="pv-build" data-id="${id}">Construir ${def.nome}</button>`;
  else if (e?.danificada) como = `A ${def.nome} está danificada e não produz. <button class="btn sm ghost" data-act="pv-build" data-id="${id}">Reparar</button>`;
  else {
    const porMin = def.prod!.porMin(nv) * prodMult(s, id), resto = Math.max(0, f.falta - pronto);
    como = resto <= 0 ? 'Já tem o suficiente pronto pra coletar.'
      : `A ${def.nome} (nv ${nv}) produz ${porMin.toFixed(1)}/min: ${pronto ? 'depois de coletar, ' : ''}faltam ~<b>${Math.max(1, Math.ceil(resto / porMin))} min</b>.`;
  }
  return `<li>${itemImg(f.res, 18)} <b>${RESOURCES[f.res].nome}</b>: tem ${f.tem}, precisa ${f.precisa} → falta <b>${f.falta}</b>. ${como}${btnCol}</li>`;
}

/** Bloco completo: chips por recurso + alerta com o que falta. */
export function provisoesHtml(s: GameState, ids: string[], mapId: string): string {
  const custo = custoExpedicao(s, ids, mapId), falta = faltaExpedicao(s, ids, mapId), racao = racaoEmergencia(s, ids, mapId);
  const chips = (Object.entries(custo) as [ResId, number][]).filter(([, v]) => v > 0).map(([r, v]) => {
    const tem = Math.floor(s.res[r] ?? 0), rc = racao[r] ?? 0, ok = tem + rc >= v;
    return `<div class="pv-r ${ok ? 'ok' : 'miss'}">${itemImg(r, 24)}<span><b>${RESOURCES[r].nome}</b><small>${tem} / ${v}</small></span><em>${rc ? `ração +${rc}` : ok ? '✓' : `falta ${Math.ceil(v - tem)}`}</em></div>`;
  }).join('');
  const nRacao = Object.keys(racao).length;
  let alerta = '';
  if (falta.length) {
    const solo = ids.length > 1 && !faltaExpedicao(s, [ids[0]], mapId).length;
    alerta = `<div class="pv-alert" role="alert">
      <b class="pv-tt">Não dá pra partir: falta ${lista(falta.map((f) => `<u>${nomeMin(f.res)}</u>`))}.</b>
      <ul>${falta.map((f) => dica(s, f)).join('')}</ul>
      ${solo ? `<p class="pv-solo">Indo <b>solo</b> (sem o membro 2) dá pra partir: ${Object.keys(racaoEmergencia(s, [ids[0]], mapId)).length ? 'no 1º mapa, o que faltar sai da <b>ração de emergência</b>' : 'cada membro gasta 1 de água e 1 de comida'}.</p>` : ''}
    </div>`;
  }
  return `<div class="pv${falta.length ? ' bad' : ''}">
    <div class="pv-h"><span class="lbl">Provisões da expedição (1 dia)</span>${falta.length ? '<span class="pv-st bad">Faltam recursos</span>' : '<span class="pv-st ok">✓ Provisões ok</span>'}</div>
    <div class="pv-rs">${chips || '<span class="lbl">Nada a levar</span>'}</div>${alerta}
    ${nRacao && !falta.length ? '<p class="pv-solo"><b>Ração de emergência:</b> faltam provisões, mas indo solo pro 1º mapa a expedição sai assim mesmo. Construa o Coletor e a Horta pra não depender dela.</p>' : ''}</div>`;
}

/** Trata os botões do painel. Retorna true se era dele. */
export function provisoesAct(el: HTMLElement): boolean {
  const a = el.dataset.act, id = el.dataset.id as StructId;
  if (a === 'pv-col') {
    let got = 0;
    mutate((s) => { const b = collect(s, id); got = Object.values(b).reduce((x, y) => x + (y ?? 0), 0); });
    toast(got ? `Coletou ${got} da ${STRUCTS[id].nome}` : 'Nada pronto pra coletar');
    return true;
  }
  if (a === 'pv-build') { openBuild(id); return true; }
  return false;
}
