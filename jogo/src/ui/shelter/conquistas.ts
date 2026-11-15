// Conquistas e lembranças: duas abas.
// Conquistas = metas longas com prêmio a resgatar (selo bronze/prata/ouro por nível).
// Lembranças = prateleira de madeira por mapa, 3 nichos cada; não obtida = silhueta com "?" e a missão.
import { CONQUISTAS, CONQ_GRUPOS, type ConqGrupo, type ConquistaDef } from '../../data/conquistas';
import { LEMBRANCAS, bonusTxt, type BonusKey } from '../../data/lembrancas';
import { MAPS } from '../../data/maps';
import type { ResId } from '../../data/resources';
import { esc } from '../../core/dom';
import { G, mutate, type GameState } from '../../game/state';
import { modoRemoto } from '../../services/api';
import { ato, msgErro } from '../../services/intent';
import { claimConquista, claimTodas, conqProntas, conqStatus, lembProgresso, lembrancaBonus, temLembranca } from '../../game/conquistas';
import { itemImg, menuIconURL } from '../../art/items';
import { toast } from '../widgets/toast';
import { live } from './panels';
import './conquistas.css';

type Aba = 'conq' | 'lemb';
type Filtro = 'todas' | ConqGrupo;
const NIVEL = ['bronze', 'prata', 'ouro'] as const;
const NIVEL_NOME = ['Bronze', 'Prata', 'Ouro'];
const ROM = ['I', 'II', 'III'];
const fmt = (n: number) => Math.floor(n).toLocaleString('pt-BR');
const ORDEM = { pronta: 0, aberta: 1, resgatada: 2 } as const;

const premioHtml = (c: ConquistaDef) =>
  Object.entries(c.premio).filter(([, v]) => (v ?? 0) > 0)
    .map(([k, v]) => `<span class="cq-res">${itemImg(k as ResId, 16)}<b>${v}</b></span>`).join('');

function cardConq(s: GameState, c: ConquistaDef): string {
  const st = conqStatus(s, c.id), cur = Math.min(c.stat(s), c.meta), pct = (cur / c.meta) * 100;
  const nv = NIVEL[c.nivel];
  const btn = st === 'pronta' ? `<button class="btn sm cq-claim" data-act="claim" data-id="${c.id}">Resgatar</button>`
    : st === 'resgatada' ? '<span class="cq-done">✓ Resgatada</span>' : '';
  return `<article class="cq-card n-${nv} st-${st}">
    <div class="cq-seal" title="${NIVEL_NOME[c.nivel]}"><span>${ROM[c.nivel]}</span></div>
    <div class="cq-main">
      <b class="cq-nome">${esc(c.nome)}</b>
      <small class="cq-desc">${esc(c.desc)}</small>
      <div class="cq-bar"><i style="width:${pct}%"></i></div>
      <div class="cq-foot"><span class="cq-num">${fmt(cur)} / ${fmt(c.meta)}</span><span class="cq-prem" title="Prêmio">${premioHtml(c)}</span>${btn}</div>
    </div></article>`;
}

function abaConq(s: GameState, filtro: Filtro): string {
  const feitas = CONQUISTAS.filter((c) => conqStatus(s, c.id) !== 'aberta').length, N = CONQUISTAS.length;
  const prontas = conqProntas(s).length;
  const grupos = Object.keys(CONQ_GRUPOS) as ConqGrupo[];
  const cnt = (g: ConqGrupo) => { const l = CONQUISTAS.filter((c) => c.grupo === g); return `${l.filter((c) => conqStatus(s, c.id) !== 'aberta').length}/${l.length}`; };
  const pronta = (g: ConqGrupo) => CONQUISTAS.some((c) => c.grupo === g && conqStatus(s, c.id) === 'pronta');
  const filtros = [`<button class="cq-f" data-act="filtro" data-id="todas" aria-pressed="${filtro === 'todas'}">Todas <span>${feitas}/${N}</span></button>`,
    ...grupos.map((g) => `<button class="cq-f${pronta(g) ? ' dot' : ''}" data-act="filtro" data-id="${g}" aria-pressed="${filtro === g}">${CONQ_GRUPOS[g]} <span>${cnt(g)}</span></button>`)].join('');
  const secs = grupos.filter((g) => filtro === 'todas' || filtro === g).map((g) => {
    const l = CONQUISTAS.filter((c) => c.grupo === g)
      .map((c, i) => ({ c, i, o: ORDEM[conqStatus(s, c.id)] }))
      .sort((a, b) => a.o - b.o || a.i - b.i).map((x) => cardConq(s, x.c)).join('');
    return `${filtro === 'todas' ? `<h3 class="cq-sec">${CONQ_GRUPOS[g]} <span>${cnt(g)}</span></h3>` : ''}${l}`;
  }).join('');
  const pct = N ? (feitas / N) * 100 : 0;
  return `<div class="cq-head">
      <div class="cq-prog"><b>Conquistas</b><span>${feitas} de ${N} · ${Math.floor(pct)}%</span></div>
      ${prontas ? `<button class="btn cq-all" data-act="claimall">Resgatar todas (${prontas})</button>` : ''}
    </div>
    <div class="cq-tbar"><i style="width:${pct}%"></i></div>
    <div class="cq-filtros">${filtros}</div>
    <div class="cq-list">${secs}</div>`;
}

const BONUS_ORD: BonusKey[] = ['vida', 'dano', 'esquiva', 'loot', 'cura', 'chaves'];

function abaLemb(s: GameState): string {
  const b = lembrancaBonus(s);
  const ativos = BONUS_ORD.filter((k) => b[k] > 0).map((k) => `<span class="lb-chip">${bonusTxt({ [k]: b[k] })}</span>`).join('');
  const tem = LEMBRANCAS.filter((l) => temLembranca(s, l.id)).length;
  const mapas = [...new Set(LEMBRANCAS.map((l) => l.mapa))];
  const shelves = mapas.map((mid) => {
    const ls = LEMBRANCAS.filter((l) => l.mapa === mid);
    const nichos = ls.map((l) => {
      const ok = temLembranca(s, l.id);
      const ic = `<img class="lb-ic" src="${menuIconURL(l.id, 128)}" width="64" height="64" alt="" draggable="false">`;
      if (ok) {
        const dia = s.lembrancas?.[l.id];
        return `<div class="lb-nicho ok"><div class="lb-pedestal">${ic}</div>
          <b class="lb-nome">${esc(l.nome)}</b><small class="lb-orig">${esc(l.origem)}</small>
          <span class="lb-bonus">${bonusTxt(l.bonus)}</span>${dia ? `<small class="lb-dia">achada no dia ${dia}</small>` : ''}</div>`;
      }
      const [a, m] = lembProgresso(s, l);
      return `<div class="lb-nicho"><div class="lb-pedestal">${ic}<span class="lb-q">?</span></div>
        <b class="lb-nome">???</b><small class="lb-miss">${esc(l.missao)}</small>
        ${m > 1 ? `<div class="lb-prog"><div class="cq-bar"><i style="width:${(a / m) * 100}%"></i></div><small>${fmt(a)} / ${fmt(m)}</small></div>` : ''}
        <span class="lb-bonus dim">${bonusTxt(l.bonus)}</span></div>`;
    }).join('');
    const n = ls.filter((l) => temLembranca(s, l.id)).length;
    return `<section class="lb-shelf"><header><b>${esc(MAPS[mid]?.nome ?? mid)}</b><span>${n}/${ls.length}</span></header>
      <div class="lb-row">${nichos}</div><div class="lb-tabua" aria-hidden="true"></div></section>`;
  }).join('');
  return `<div class="lb-top">
      <div class="cq-prog"><b>Lembranças</b><span>${tem} de ${LEMBRANCAS.length}</span></div>
      <div class="lb-ativos"><span class="lbl">Bônus ativos no squad</span><div>${ativos || '<span class="lb-none">Nenhum ainda. Cumpra as missões dos mapas.</span>'}</div></div>
    </div>
    <p class="cq-hint">Cada mapa esconde 3 lembranças. A missão vale na expedição normal e no modo loop; o bônus é permanente.</p>
    <div class="lb-estante">${shelves}</div>`;
}

export function openConquistas(aba0: Aba = 'conq'): void {
  let aba: Aba = aba0, filtro: Filtro = 'todas';
  live({ title: 'Conquistas', kicker: 'Metas e lembranças dos mapas', wide: true }, () => {
    const s = G(), pr = conqProntas(s).length;
    const tem = LEMBRANCAS.filter((l) => temLembranca(s, l.id)).length;
    return `<div class="cq">
      <div class="cq-tabs" role="tablist">
        <button role="tab" data-act="aba" data-id="conq" aria-selected="${aba === 'conq'}">Conquistas${pr ? ` <i>${pr}</i>` : ''}</button>
        <button role="tab" data-act="aba" data-id="lemb" aria-selected="${aba === 'lemb'}">Lembranças <span>${tem}/${LEMBRANCAS.length}</span></button>
      </div>
      ${aba === 'conq' ? abaConq(s, filtro) : abaLemb(s)}</div>`;
  }, (el) => {
    const a = el.dataset.act, id = el.dataset.id!;
    if (a === 'aba') aba = id as Aba;
    else if (a === 'filtro') filtro = id as Filtro;
    else if (a === 'claim') {
      if (modoRemoto()) { void ato('conquista', { id }).then((r) => { if (r.ok) toast('Prêmio resgatado'); else if (r.erro) toast(r.erro); }).catch((e) => toast(msgErro(e))); return; }
      let ok = false;
      mutate((s) => { ok = claimConquista(s, id); });
      if (ok) toast('Prêmio resgatado');
    } else if (a === 'claimall') {
      if (modoRemoto()) { void ato('conquistas', {}).then((r) => { const n = Number(r.extra?.n ?? 0); if (n) toast(`${n} prêmio${n > 1 ? 's' : ''} resgatado${n > 1 ? 's' : ''}`); }).catch((e) => toast(msgErro(e))); return; }
      let n = 0;
      mutate((s) => { n = claimTodas(s); });
      if (n) toast(`${n} prêmio${n > 1 ? 's' : ''} resgatado${n > 1 ? 's' : ''}`);
    }
  });
}
