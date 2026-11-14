// Bestiário (livro de cartas de baralho): cada zumbi é uma carta; os pontinhos são as variações
// (comuns: Comum/Enluarado/Plenilunar · chefes: Normal/Fúria). Variação não derrotada = silhueta com "?".
// Clique na carta troca a variação; "Ler registro" abre a página do livro.
import { ZOMBIES, type ZombieId, RARIDADE, raridadeDe } from '../../data/zombies';
import { MAPS } from '../../data/maps';
import { esc } from '../../core/dom';
import { openModal } from '../widgets/modal';
import { G, type GameState } from '../../game/state';
import { live } from './panels';
import { zombieIconSrc } from './mapSelect';
import { EXP } from '../../art/legacy';
import './bestiary.css';

type Cat = 'comum' | 'mini' | 'chefe';
const CAT: Record<Cat, { plural: string; suit: string }> = {
  comum: { plural: 'Zumbis comuns', suit: '†' },
  mini: { plural: 'Mini bosses', suit: '✶' },
  chefe: { plural: 'Chefes', suit: '☾' },
};
const FORMS: Record<Cat, string[]> = { comum: ['comum', 'enluarado', 'plenilunar'], mini: ['normal', 'furia'], chefe: ['normal', 'furia'] };
const FL: Record<string, string> = { comum: 'Comum', enluarado: 'Enluarado', plenilunar: 'Plenilunar', normal: 'Normal', furia: 'Fúria' };
const FORM_NOTE: Record<string, string> = {
  comum: 'Aparece em qualquer noite.',
  enluarado: 'Só nas noites de Lua de Sangue: mais forte, brilho prateado.',
  plenilunar: 'Raro, nas noites de Lua de Sangue: o mais forte, aura dourada.',
  normal: 'Forma de entrada da luta.',
  furia: 'Abaixo de metade da vida: mais rápido e mais forte.',
};

const catOf = (k: ZombieId): Cat => (ZOMBIES[k].boss === 'chefe' ? 'chefe' : ZOMBIES[k].boss === 'mini' ? 'mini' : 'comum');
/** Só entram no livro os zumbis que já existem no jogo (têm arte). */
function species(): ZombieId[] {
  const A = EXP() as any;
  const ids = (Object.keys(ZOMBIES) as ZombieId[]).filter((k) => ZOMBIES[k].art && A[ZOMBIES[k].art!]);
  const rank = { comum: 0, mini: 1, chefe: 2 };
  return ids.sort((a, b) => rank[catOf(a)] - rank[catOf(b)]);
}
const numOf = (k: ZombieId, list: ZombieId[]) => {
  const c = catOf(k), i = list.filter((x) => catOf(x) === c).indexOf(k) + 1;
  return (c === 'comum' ? '' : c === 'mini' ? 'M' : 'C') + String(i).padStart(c === 'comum' ? 3 : 2, '0');
};
const kills = (s: GameState, k: ZombieId, f: string) => s.derrotadosForma?.[k + ':' + f] ?? 0;
/** Saves antigos só têm o total por tipo: conta como a forma básica. */
const seen = (s: GameState, k: ZombieId, f: string) => kills(s, k, f) > 0 || ((f === 'comum' || f === 'normal') && (s.derrotados?.[k] ?? 0) > 0);
const known = (s: GameState, k: ZombieId) => FORMS[catOf(k)].some((f) => seen(s, k, f));
const complete = (s: GameState, k: ZombieId) => FORMS[catOf(k)].every((f) => seen(s, k, f));
const mapsOf = (k: ZombieId) => Object.values(MAPS).filter((m) => Object.values(m.ondas).some((a) => (a ?? []).some((w) => w.includes(k)))).map((m) => m.nome);

export function openBestiary(): void {
  const cur: Record<string, number> = {};
  let tab: 'todos' | Cat = 'todos';
  const list = species();
  const total = list.reduce((a, k) => a + FORMS[catOf(k)].length, 0);

  const card = (s: GameState, k: ZombieId) => {
    const c = catOf(k), fs = FORMS[c], fi = cur[k] ?? 0, f = fs[fi], ok = seen(s, k, f), kn = known(s, k), d = ZOMBIES[k], n = numOf(k, list);
    const dots = fs.map((g, i) => `<span class="${seen(s, k, g) ? 'on' : ''}${i === fi ? ' cur' : ''}" title="${FL[g]}"></span>`).join('');
    return `<article class="bc ${ok ? 'v-' + f : 'unk'}${kn ? '' : ' unknown'}" data-act="cycle" data-id="${k}" tabindex="0" aria-label="${kn ? esc(d.nome) : 'Criatura desconhecida'}, variação ${FL[f]}">
      <div class="corner tl"><span>${n}</span><i>${CAT[c].suit}</i></div>
      <div class="corner br"><span>${n}</span><i>${CAT[c].suit}</i></div>
      ${complete(s, k) ? '<span class="seal"><b>✓</b>COMPLETO</span>' : ''}
      <span class="ribbon">${FL[f]}${ok ? '' : ' ?'}</span>
      <div class="portrait ${ok ? 'f-' + f : 'f-unk'}"><img class="px" alt="" ${zombieIconSrc(k, !ok, 120, f)}>${ok ? '' : '<span class="qmark">?</span>'}</div>
      <h3>${kn ? esc(d.nome) : '???'}</h3>
      <div class="meta"><span class="dots">${dots}</span><span>${ok ? '×' + Math.max(kills(s, k, f), f === 'comum' || f === 'normal' ? 1 : 0) : 'não registrado'}</span></div>
      <button class="read" data-act="read" data-id="${k}" ${kn ? '' : 'disabled'}>Ler registro</button>
    </article>`;
  };

  live({ title: 'Bestiário', kicker: 'Livro dos mortos-vivos', wide: true }, () => {
    const s = G();
    const regs = list.reduce((a, k) => a + FORMS[catOf(k)].filter((f) => seen(s, k, f)).length, 0);
    const pct = total ? (regs / total) * 100 : 0;
    const cnt = (c?: Cat) => { const l = c ? list.filter((k) => catOf(k) === c) : list; return `${l.reduce((a, k) => a + FORMS[catOf(k)].filter((f) => seen(s, k, f)).length, 0)}/${l.reduce((a, k) => a + FORMS[catOf(k)].length, 0)}`; };
    const tabs = ([['todos', 'Todos', cnt()], ...(['comum', 'mini', 'chefe'] as Cat[]).map((c) => [c, CAT[c].plural, cnt(c)])] as [string, string, string][])
      .map(([k, l, n]) => `<button class="btab" data-act="tab" data-id="${k}" aria-selected="${tab === k}">${l} <span>${n}</span></button>`).join('');
    let grid = '';
    (['comum', 'mini', 'chefe'] as Cat[]).forEach((c) => {
      if (tab !== 'todos' && tab !== c) return;
      const ks = list.filter((k) => catOf(k) === c);
      if (!ks.length) return;
      if (tab === 'todos') grid += `<h3 class="bsec">${CAT[c].suit} ${CAT[c].plural}</h3>`;
      grid += ks.map((k) => card(s, k)).join('');
    });
    return `<div class="bbook">
      <div class="bprog"><b>Registros</b><span>${regs} de ${total} · ${Math.floor(pct)}%</span></div>
      <div class="bbar"><i style="width:${pct}%"></i></div>
      <p class="bhint">Derrote cada variação para completar a carta. Enluarados e Plenilunares só aparecem nas noites de Lua de Sangue; a Fúria dos chefes aparece abaixo de metade da vida. Toque na carta para ver as variações.</p>
      <div class="btabs">${tabs}</div>
      <div class="bgrid">${grid}</div></div>`;
  }, (el) => {
    const a = el.dataset.act, id = el.dataset.id as ZombieId;
    if (a === 'tab') tab = id as any;
    else if (a === 'cycle') cur[id] = ((cur[id] ?? 0) + 1) % FORMS[catOf(id)].length;
    else if (a === 'read') openPage(id, list);
  });
}

function openPage(k: ZombieId, list: ZombieId[]): void {
  const s = G(), d = ZOMBIES[k], c = catOf(k), fs = FORMS[c];
  const forms = fs.map((f) => {
    const ok = seen(s, k, f);
    return `<figure class="pform ${ok ? 'f-' + f : 'f-unk'}"><img class="px" alt="" ${zombieIconSrc(k, !ok, 120, f)}><figcaption><b>${FL[f]}</b><small>${ok ? '×' + Math.max(kills(s, k, f), 1) + ' abatidos' : 'não registrado'}</small><small>${FORM_NOTE[f]}</small></figcaption></figure>`;
  }).join('');
  openModal({
    title: esc(d.nome), kicker: `${numOf(k, list)} · ${c === 'comum' ? 'Zumbi comum' : c === 'mini' ? 'Mini boss' : 'Chefe'}`, wide: true,
    html: `<div class="bpage">
      <div class="pforms">${forms}</div>
      <div class="ptext">
        <p>${esc(d.desc)}</p>
        <dl><dt>Vida</dt><dd>${d.hp}</dd><dt>Dano</dt><dd>${d.dmg}</dd><dt>XP</dt><dd>${d.xp}</dd><dt>Onde</dt><dd>${esc(mapsOf(k).join(', ') || '—')}</dd><dt>Raridade</dt><dd>${d.boss ? 'Sempre na arena dele' : `<span style="color:${RARIDADE[raridadeDe(k)].cor}">${RARIDADE[raridadeDe(k)].nome}</span> · vem em ${Math.round(RARIDADE[raridadeDe(k)].chance * 100)}% das expedições`}</dd><dt>Total abatido</dt><dd>${s.derrotados?.[k] ?? 0}</dd></dl>
        ${complete(s, k) ? '<p class="pdone">✓ Registro completo.</p>' : `<p class="pmiss">Faltam ${fs.filter((f) => !seen(s, k, f)).map((f) => FL[f]).join(', ')}.</p>`}
      </div></div>`,
  });
}
