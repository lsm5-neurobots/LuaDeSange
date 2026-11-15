// Modal de PLANO da expedição automática (depois do squad, antes de partir): explica como a expedição
// vai rodar sozinha e deixa configurar tudo o que o squad decide sem você: cura (limiar, gatilho, teto por arena),
// baús (quantas chaves de cada tipo, o que fazer sem chave), recrutamento (ofícios e pets aceitos, vida mínima,
// presentes), bônus de combate e o loop offline (duração e tolerância a falhas).
import { GOLPES } from '../../data/golpes';
import { MAPS } from '../../data/maps';
import { ITEM_MK, type ItemMk } from '../../data/market';
import { RECRUITS, PETS, type PetType, type RecruitType } from '../../data/recruits';
import { esc } from '../../core/dom';
import { go } from '../../core/router';
import { toast } from '../widgets/toast';
import { G, mutate } from '../../game/state';
import { modoRemoto } from '../../services/api';
import { ato, msgErro, partir } from '../../services/intent';
import { equippedGolpes, slotsOf } from '../../game/golpes';
import { buildExpedition } from '../../game/team';
import { bloqueioExpedicao, faltaExpedicao, pagarExpedicao } from '../../game/upkeep';
import { provisoesHtml, provisoesAct, faltaLabel } from './provisoes';
import { itemCount, takeItems } from '../../game/market';
import type { ExpeditionPlan } from '../../expedition/plan';
import type { ExpeditionConfig } from '../../expedition/types';
import { live } from './panels';
import { openMarket } from './market';
import { itemImg } from '../../art/items';
import { novoLoop, MAX_FALHAS } from '../../game/idleLoop';

interface Sel { ids: string[]; pet: string | null; map: string }

const KEYS: ItemMk[] = ['chave_comum', 'chave_medico', 'chave_militar', 'chave_raro'];
const BOOST: ItemMk[] = ['adrenalina', 'colete'];
const OFICIOS = Object.keys(RECRUITS) as RecruitType[];
const PETLIST = Object.keys(PETS) as PetType[];
const SAVED = 'lds.plano';
/** kits por expedição e presentes (cada presente = +15 pontos na chance de recrutar) */
const KIT_MAX = 10, PRESENTE_MAX = 3, ISCA = 15;

type Prefs = {
  recrutar: boolean; usarChaves: boolean; usarKits: boolean; kitLimiar: number; loop: boolean; manual: boolean;
  kitModo: 'um' | 'media'; kitMaxArena: number; semChave: 'puzzle' | 'pular';
  oficios: RecruitType[]; pets: PetType[]; recrutarVidaMin: number; loopMaxH: number; loopFalhas: number; recuarVida: number;
};
export function loadPrefs(): Prefs {
  const def: Prefs = {
    recrutar: true, usarChaves: true, usarKits: true, kitLimiar: 0.35, loop: false, manual: false,
    kitModo: 'um', kitMaxArena: 0, semChave: 'puzzle', oficios: [...OFICIOS], pets: [...PETLIST], recrutarVidaMin: 0, loopMaxH: 8, loopFalhas: MAX_FALHAS, recuarVida: 0.3,
  };
  try { const p = JSON.parse(localStorage.getItem(SAVED) || 'null'); if (p) return { ...def, ...p }; } catch { /* sem storage */ }
  return def;
}
type TogKey = 'recrutar' | 'usarChaves' | 'usarKits' | 'loop';
const pct = (v: number) => Math.round(v * 100) + '%';
/** textos ao vivo dos sliders (atualizam enquanto arrasta, sem redesenhar o modal) */
const OUT: Record<string, (v: number) => string> = {
  kitLimiar: (v) => pct(v / 100),
  kitMaxArena: (v) => (v ? `${v} por arena` : 'sem limite'),
  recrutarVidaMin: (v) => (v ? `vida ≥ ${v}%` : 'sempre'),
  loopMaxH: (v) => `${v} h`,
  loopFalhas: (v) => `${v} falha${v === 1 ? '' : 's'}`,
  recuarVida: (v) => (v ? `vida < ${v}%` : 'nunca'),
};

type Aba = 'resumo' | 'cura' | 'baus' | 'recr' | 'loop';
/** abas do plano: [id, título, resumo curto que aparece embaixo do título] */
const ABAS: [Aba, string, (p: Prefs, kits: number, keys: number) => string][] = [
  ['resumo', 'Resumo', () => 'como vai rodar'],
  ['cura', 'Cura', (p, k) => (p.usarKits && k ? `${k} kit${k === 1 ? '' : 's'} · < ${pct(p.kitLimiar)}` : 'sem kits')],
  ['baus', 'Baús', (p, _k, c) => (p.usarChaves ? `${c} chave${c === 1 ? '' : 's'}` : 'sem chaves')],
  ['recr', 'Recrutas', (p) => (p.recrutar ? 'aceitando' : 'recusando')],
  ['loop', 'Bônus e loop', (p) => (p.loop ? `loop ${p.loopMaxH} h` : 'uma vez')],
];
const ABA_KEY = 'lds.plano.aba';

const SPEC_K = ['U', 'I', 'O'] as const;

/** Bloco curto do plano quando Quem luta = Manual. Só o que o jogador aperta. */
function manualCtrl(ids: string[]): string {
  const id = ids[0] || 'hero';
  const s = G();
  const eq = equippedGolpes(s, id);
  const cap = slotsOf(s, id);
  const slots = eq.map((g, i) => `<li><kbd>${SPEC_K[i]}</kbd><span><b>${esc(GOLPES[g.id].nome)}</b></span></li>`).join('');
  const aviso = eq.length < cap
    ? `<p class="ep-note">${eq.length ? 'Slot vazio: equipa em Golpes, no abrigo.' : 'Equipa em Golpes, no abrigo.'}</p>`
    : '';
  return `<section class="ep-card ep-ctrl" aria-label="Controles do modo manual">
    <h3>Controles</h3>
    <ul class="ep-keys">
      <li><kbd>WASD</kbd><kbd>setas</kbd><span>andar</span></li>
      <li><kbd>J</kbd><span><b>leve</b><small>no alcance, vasculha, abre, fala ou chama</small></span></li>
      <li><kbd>K</kbd><span>pesado</span></li>
      <li><kbd>L</kbd><span>esquiva</span></li>
      ${slots}
    </ul>
    ${aviso}
  </section>`;
}
let aba: Aba = (() => { try { const v = localStorage.getItem(ABA_KEY) as Aba | null; return v && ABAS.some(([k]) => k === v) ? v : 'resumo'; } catch { return 'resumo'; } })();

/** Editar o plano no meio da expedição: só as decisões (itens já estão na mochila). */
export interface PlanoVivo { plano: ExpeditionPlan; mapId: string; loop: boolean; onClose: () => void }

/** Abre o plano da expedição em andamento (botão "Plano" no topo da tela da expedição). */
export function openPlanoVivo(v: PlanoVivo): void {
  const L = v.loop ? G().loop?.plano : null;
  openExpPlan({ ids: [], pet: null, map: v.mapId }, () => {}, v, L ?? undefined);
}

export function openExpPlan(sel: Sel, back: () => void, vivo?: PlanoVivo, loopPlano?: { loopMaxH?: number; loopFalhas?: number }): void {
  const pref = loadPrefs();
  const s0 = G();
  // por padrão leva o que tem de chaves e até 3 kits; presentes e bônus começam zerados
  const take: Partial<Record<ItemMk, number>> = {};
  for (const k of KEYS) take[k] = itemCount(s0, k);
  take.kit_cura = Math.min(3, itemCount(s0, 'kit_cura'));
  take.presente = 0;
  for (const b of BOOST) take[b] = 0;
  if (vivo) { // em andamento: parte do plano que está valendo e da mochila que foi levada
    const p = vivo.plano;
    Object.assign(pref, {
      recrutar: p.recrutar, usarChaves: p.usarChaves, usarKits: p.usarKits, kitLimiar: p.kitLimiar, loop: vivo.loop,
      kitModo: p.kitModo ?? 'um', kitMaxArena: p.kitMaxArena ?? 0, semChave: p.semChave ?? 'puzzle',
      oficios: p.oficios ? [...p.oficios] : [...OFICIOS], pets: p.pets ? [...p.pets] : [...PETLIST],
      recrutarVidaMin: p.recrutarVidaMin ?? 0, recuarVida: p.recuarVida ?? 0,
      loopMaxH: loopPlano?.loopMaxH ?? pref.loopMaxH, loopFalhas: loopPlano?.loopFalhas ?? pref.loopFalhas,
    });
    for (const k of Object.keys(take) as ItemMk[]) take[k] = p.itens[k] ?? 0;
  }

  const stepper = (id: ItemMk, lim = 99, extra = '') => {
    if (vivo) { // itens já foram pra mochila: só mostra quanto levou
      const n = take[id] ?? 0, info = ITEM_MK[id];
      return n ? `<div class="ep-item"><span class="ep-ic" style="--c:${info.cor}">${itemImg(id, 34)}</span><span class="ep-nm"><b>${esc(info.nome)}</b><small>levou ${n} nesta expedição</small></span></div>` : '';
    }
    const have = itemCount(G(), id), n = take[id] ?? 0, info = ITEM_MK[id];
    return `<div class="ep-item${have ? '' : ' none'}"><span class="ep-ic" style="--c:${info.cor}">${itemImg(id, 34)}</span>
      <span class="ep-nm"><b>${esc(info.nome)}</b><small>${extra || esc(info.desc)}</small></span>
      <span class="ep-st"><button class="btn sm ghost" data-act="dec" data-id="${id}" ${n <= 0 ? 'disabled' : ''} aria-label="menos">−</button>
      <b>${n}</b><small>/${Math.min(have, lim)}</small>
      <button class="btn sm ghost" data-act="inc" data-id="${id}" data-lim="${lim}" ${n >= Math.min(have, lim) ? 'disabled' : ''} aria-label="mais">+</button></span></div>`;
  };
  const tog = (k: TogKey, label: string, sub: string) => vivo && k === 'loop' ? `<p class="lbl">${vivo.loop ? 'Loop ligado: dá pra ajustar o tempo e as falhas. Pra desligar, use "Parar loop" no topo.' : 'O loop só liga antes de partir, no abrigo.'}</p>` :
    `<button class="ep-tog" data-act="tog" data-id="${k}" aria-pressed="${pref[k]}"><span class="sw"></span><span><b>${label}</b><small>${sub}</small></span></button>`;
  const slider = (k: keyof typeof OUT, label: string, min: number, max: number, step: number, v: number, hint: string) =>
    `<label class="ep-sl"><span class="ep-sl-h"><b>${label}</b><output data-out="${k}">${OUT[k](v)}</output></span>
      <input type="range" data-act="sl" data-id="${k}" min="${min}" max="${max}" step="${step}" value="${v}" aria-label="${esc(label)}">
      <small>${hint}</small></label>`;
  const seg = (id: string, cur: string, opts: [string, string][]) =>
    `<div class="ep-seg" role="group">${opts.map(([v, l]) => `<button class="btn sm ${cur === v ? '' : 'ghost'}" data-act="seg" data-id="${id}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
  const chips = (kind: 'of' | 'pet', all: string[], on: string[], name: (k: string) => string) =>
    `<div class="ep-chips">${all.map((k) => `<button class="ep-chip" data-act="chip" data-id="${kind}" data-v="${k}" aria-pressed="${on.includes(k)}">${esc(name(k))}</button>`).join('')}
      <button class="btn sm ghost" data-act="chipall" data-id="${kind}">${on.length === all.length ? 'Nenhum' : 'Todos'}</button></div>`;

  const m = live({ title: 'Plano da expedição', kicker: vivo ? 'Em andamento · expedição pausada' : 'Antes de partir', wide: true, onClose: vivo?.onClose }, () => {
    const s = G(), M = MAPS[sel.map];
    const falta = faltaExpedicao(s, sel.ids, sel.map);
    const nKeys = KEYS.reduce((a, k) => a + (take[k] ?? 0), 0), nKits = take.kit_cura ?? 0, isca = (take.presente ?? 0) * ISCA;
    const recTxt = !pref.recrutar ? 'o squad <b>recusa</b> todas as missões (olhando, você ainda pode aceitar na hora)'
      : `o squad aceita ${pref.oficios.length === OFICIOS.length ? 'qualquer ofício' : pref.oficios.length ? `só <b>${pref.oficios.map((k) => RECRUITS[k].nome).join(', ')}</b>` : '<b>nenhum recruta</b>'} e ${pref.pets.length === PETLIST.length ? 'qualquer pet' : pref.pets.length ? `os pets <b>${pref.pets.map((k) => PETS[k].nome).join(', ')}</b>` : '<b>nenhum pet</b>'}${pref.recrutarVidaMin ? `, se a vida do squad estiver acima de <b>${pct(pref.recrutarVidaMin)}</b>` : ''}${isca ? ` · <b>+${isca}%</b> de chance pelos presentes` : ''}`;
    const PANE: Record<Aba, string> = {
      resumo: `<section class="ep-how">
        <div class="lbl">Resumo do plano · ${esc(M.nome)} (${M.areas} áreas)</div>
        <ol>
          <li><b>Controle:</b> ${pref.loop ? 'loop no <b>automático</b>. As rodadas sem você na tela seguem com o squad lutando sozinho.' : pref.manual ? '<b>manual</b>: você anda e bate com o líder. Recruta, pet e zumbis lutam ao lado.' : '<b>automático</b>: o squad luta sozinho.'}</li>
          <li><b>Cura:</b> ${pref.usarKits && nKits ? `${nKits} kit${nKits === 1 ? '' : 's'}; usa quando ${pref.kitModo === 'media' ? 'a <b>média</b> do squad' : '<b>alguém</b>'} ficar abaixo de <b>${pct(pref.kitLimiar)}</b>${pref.kitMaxArena ? `, no máximo ${pref.kitMaxArena} por arena` : ''}.` : 'sem kits: se o squad cair, volta com metade do loot.'}</li>
          <li><b>Recuo:</b> ${pref.recuarVida ? `sem kits e com a vida média abaixo de <b>${pct(pref.recuarVida)}</b>, volta com todo o loot (cair traz metade).` : 'nunca recua: luta até cair (traz metade do loot).'}</li>
          <li><b>Baús:</b> ${pref.usarChaves ? `${nKeys} chave${nKeys === 1 ? '' : 's'} na mochila (abre na hora)` : 'chaves guardadas'}; sem chave, ${pref.semChave === 'pular' ? '<b>passa reto</b>' : 'tenta o <b>puzzle de 5 s</b>'}.</li>
          <li><b>Recrutamento:</b> ${recTxt}.</li>
          <li><b>Loop:</b> ${pref.loop ? `repete por até <b>${pref.loopMaxH} h</b> offline e para depois de <b>${pref.loopFalhas}</b> falha${pref.loopFalhas === 1 ? '' : 's'} seguida${pref.loopFalhas === 1 ? '' : 's'} ou sem provisão.` : 'uma expedição só.'} O que sobrar de chaves e kits volta pro abrigo.</li>
        </ol>
      </section>`,
      cura: `<section class="ep-card ep-tabc">
          ${tog('usarKits', 'Usar kits de cura', 'Cada kit cura 50% da vida de todo o squad')}
          ${pref.usarKits ? `
            ${slider('kitLimiar', 'Usar kit abaixo de', 10, 80, 5, Math.round(pref.kitLimiar * 100), 'Mais alto = cura antes e gasta mais kits; mais baixo = economiza e arrisca.')}
            <div class="ep-row"><span class="lbl">Quem dispara</span>${seg('kitModo', pref.kitModo, [['um', 'Qualquer um'], ['media', 'Média do squad']])}</div>
            ${slider('kitMaxArena', 'Teto por arena', 0, 5, 1, pref.kitMaxArena, 'Guarda kits pro chefe: limita quantos podem sair numa arena só.')}
            ${stepper('kit_cura', KIT_MAX, `Levar até ${KIT_MAX} por expedição`)}` : ''}
          ${slider('recuarVida', 'Recuar com o loot', 0, 60, 5, Math.round(pref.recuarVida * 100), 'Sem kits e com a vida média abaixo disso, o squad volta com <b>todo</b> o loot. Cair traz só metade. No chefe ele arrisca mais.')}
        </section>`,
      baus: `<section class="ep-card ep-tabc">
          ${tog('usarChaves', 'Usar chaves nos baús', 'Abre na hora, sem puzzle')}
          <div class="ep-row"><span class="lbl">Baú sem chave</span>${seg('semChave', pref.semChave, [['puzzle', 'Tentar o puzzle'], ['pular', 'Passar reto']])}</div>
          ${pref.usarChaves && !vivo ? `<div class="ep-row"><span class="lbl">Quantas chaves levar</span><span><button class="btn sm ghost" data-act="keysall">Todas</button> <button class="btn sm ghost" data-act="keysnone">Nenhuma</button></span></div>
            ${KEYS.map((k) => stepper(k)).join('')}` : pref.usarChaves ? KEYS.map((k) => stepper(k)).join('') : ''}
        </section>`,
      recr: `<section class="ep-card ep-tabc">
          ${tog('recrutar', 'Aceitar missões no caminho', 'Sobreviventes e pets pedindo ajuda; todo recrutado chega com nota E')}
          ${pref.recrutar ? `
            <div class="lbl">Ofícios que o squad aceita</div>${chips('of', OFICIOS, pref.oficios, (k) => RECRUITS[k as RecruitType].nome)}
            <div class="lbl">Pets que o squad aceita</div>${chips('pet', PETLIST, pref.pets, (k) => PETS[k as PetType].nome)}
            ${slider('recrutarVidaMin', 'Só aceitar com o squad', 0, 90, 10, Math.round(pref.recrutarVidaMin * 100), 'Missão com o squad machucado pode custar a expedição.')}
            ${stepper('presente', PRESENTE_MAX, `Isca: +${ISCA}% de chance de recrutar cada (até ${PRESENTE_MAX})`)}` : ''}
        </section>`,
      loop: `<section class="ep-card ep-tabc">
          ${BOOST.map((b) => stepper(b, 1)).join('')}
          <h3 class="ep-h-loop">Loop</h3>
          ${tog('loop', 'Repetir em loop', 'Ao terminar, paga as provisões, repõe chaves/kits do inventário e parte de novo, mesmo offline')}
          ${pref.loop && (!vivo || vivo.loop) ? `
            ${slider('loopMaxH', 'Rodar offline por até', 1, 8, 1, pref.loopMaxH, 'Depois disso o loop para e espera você voltar.')}
            ${slider('loopFalhas', 'Parar depois de', 1, 5, 1, pref.loopFalhas, 'Falhas seguidas caindo logo no começo (sinal de que o mapa está forte demais).')}` : ''}
        </section>`,
    };
    const tabs = ABAS.map(([k, l, d]) => `<button class="ep-tab" role="tab" data-act="aba" data-id="${k}" aria-selected="${aba === k}"><b>${l}</b><small>${d(pref, nKits, nKeys)}</small></button>`).join('');
    const modoOn = !!pref.manual && !pref.loop;
    const modo = vivo ? '' : `<section class="ep-card ep-modo">
      <div class="ep-row"><span class="lbl">Quem luta</span>
        <div class="ep-seg" role="group" aria-label="Quem controla o líder">
          <button class="btn sm ${modoOn ? 'ghost' : ''}" data-act="seg" data-id="modo" data-v="auto" aria-pressed="${!modoOn}">Automático</button>
          <button class="btn sm ${modoOn ? '' : 'ghost'}" data-act="seg" data-id="modo" data-v="manual" aria-pressed="${modoOn}" ${pref.loop ? 'disabled' : ''}>Manual</button>
        </div>
      </div>
      <p class="lbl">${pref.loop
        ? 'O loop fica no automático: as rodadas sem você na tela não têm jogador. O manual volta quando o loop estiver desligado.'
        : modoOn
          ? 'Você anda e bate com o líder. Recruta, pet e zumbis lutam sozinhos.'
          : 'O squad luta sozinho, como hoje.'}</p>
    </section>${modoOn ? manualCtrl(sel.ids) : ''}`;
    const partir = !pref.loop && pref.manual ? `Partir no manual para ${esc(M.nome)}` : `Partir para ${esc(M.nome)}`;
    return `<div class="ep">
      ${modo}
      <div><div class="ep-tabs" role="tablist" aria-label="Partes do plano">${tabs}</div>
      <div class="ep-pane" role="tabpanel">${PANE[aba]}</div></div>

      ${vivo ? `<div class="sh-go"><span class="lbl">Vale na hora pro resto desta expedição${vivo.loop ? ' e pras próximas rodadas do loop' : ''}.</span>
        <button class="btn big" data-act="aplicar">Aplicar e continuar</button></div>` : `
      <div class="ep-foot">
        <span class="lbl">Mochila</span> <button class="btn sm ghost" data-act="market">Comprar no Mercado</button>
      </div>
      ${provisoesHtml(s, sel.ids, sel.map)}
      <div class="sh-go"><button class="btn ghost" data-act="back">← Squad</button>
        ${falta.length ? `<button class="btn big pv-falta" data-act="go" disabled>${esc(faltaLabel(falta))}</button>`
          : `<button class="btn big" data-act="go">${partir}</button>`}</div>`}
    </div>`;
  }, (el, _e, close) => {
    const a = el.dataset.act, id = el.dataset.id ?? '';
    if (a === 'aba') { aba = id as Aba; try { localStorage.setItem(ABA_KEY, aba); } catch { /* sem storage */ } }
    else if (a === 'tog') { const k = id as TogKey; pref[k] = !pref[k]; }
    else if (a === 'sl') {
      const v = Number((el as HTMLInputElement).value);
      if (id === 'kitLimiar') pref.kitLimiar = v / 100;
      else if (id === 'recrutarVidaMin') pref.recrutarVidaMin = v / 100;
      else if (id === 'kitMaxArena') pref.kitMaxArena = v;
      else if (id === 'loopMaxH') pref.loopMaxH = v;
      else if (id === 'loopFalhas') pref.loopFalhas = v;
      else if (id === 'recuarVida') pref.recuarVida = v / 100;
    }
    else if (a === 'seg') {
      if (id === 'kitModo') pref.kitModo = el.dataset.v as Prefs['kitModo'];
      else if (id === 'semChave') pref.semChave = el.dataset.v as Prefs['semChave'];
      else if (id === 'modo' && !(el.dataset.v === 'manual' && pref.loop)) pref.manual = el.dataset.v === 'manual';
    }
    else if (a === 'chip') {
      const v = el.dataset.v!, list = id === 'of' ? pref.oficios as string[] : pref.pets as string[];
      const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v);
    }
    else if (a === 'chipall') {
      if (id === 'of') pref.oficios = pref.oficios.length === OFICIOS.length ? [] : [...OFICIOS];
      else pref.pets = pref.pets.length === PETLIST.length ? [] : [...PETLIST];
    }
    else if (a === 'keysall') for (const k of KEYS) take[k] = itemCount(G(), k);
    else if (a === 'keysnone') for (const k of KEYS) take[k] = 0;
    else if (a === 'inc') take[id as ItemMk] = Math.min(Number(el.dataset.lim ?? 99), (take[id as ItemMk] ?? 0) + 1);
    else if (a === 'dec') take[id as ItemMk] = Math.max(0, (take[id as ItemMk] ?? 0) - 1);
    else if (a === 'market') openMarket();
    else if (provisoesAct(el)) { /* coletar/construir provisão */ }
    else if (a === 'back') { close(); back(); }
    else if (a === 'aplicar' && vivo) {
      const filtros = {
        kitModo: pref.kitModo, kitMaxArena: pref.kitMaxArena, semChave: pref.semChave, recrutarVidaMin: pref.recrutarVidaMin, recuarVida: pref.recuarVida,
        oficios: pref.oficios.length === OFICIOS.length ? undefined : [...pref.oficios],
        pets: pref.pets.length === PETLIST.length ? undefined : [...pref.pets],
      };
      const dec = { recrutar: pref.recrutar, usarChaves: pref.usarChaves, usarKits: pref.usarKits, kitLimiar: pref.kitLimiar, ...filtros };
      Object.assign(vivo.plano, dec); // o motor lê w.cfg.plano a cada decisão: vale na hora
      try { localStorage.setItem(SAVED, JSON.stringify({ ...loadPrefs(), ...pref, loop: loadPrefs().loop })); } catch { /* sem storage */ }
      if (vivo.loop && modoRemoto()) void ato('loopPlano', { plano: { ...dec, loopMaxH: pref.loopMaxH, loopFalhas: pref.loopFalhas } }).catch((e) => toast(msgErro(e)));
      else if (vivo.loop) mutate((st) => { if (st.loop) Object.assign(st.loop.plano, dec, { loopMaxH: pref.loopMaxH, loopFalhas: pref.loopFalhas }); });
      close();
    }
    else if (a === 'go') {
      const s = G();
      if (bloqueioExpedicao(s, sel.ids, sel.map)) return;
      try { localStorage.setItem(SAVED, JSON.stringify(pref)); } catch { /* sem storage */ }
      const want: Partial<Record<ItemMk, number>> = {};
      for (const [k, n] of Object.entries(take)) {
        if (!n) continue;
        if (KEYS.includes(k as ItemMk) && !pref.usarChaves) continue;
        if (k === 'kit_cura' && !pref.usarKits) continue;
        if (k === 'presente' && !pref.recrutar) continue;
        want[k as ItemMk] = n;
      }
      // listas completas = "todos" (undefined): ofício/pet novo no jogo entra sem mexer no plano salvo
      const filtros = {
        kitModo: pref.kitModo, kitMaxArena: pref.kitMaxArena, semChave: pref.semChave, recrutarVidaMin: pref.recrutarVidaMin, recuarVida: pref.recuarVida,
        oficios: pref.oficios.length === OFICIOS.length ? undefined : [...pref.oficios],
        pets: pref.pets.length === PETLIST.length ? undefined : [...pref.pets],
      };
      if (modoRemoto()) {
        void partir({
          mapId: sel.map, ids: sel.ids, pet: sel.pet,
          manual: !!pref.manual && !pref.loop, loop: !!pref.loop,
          plano: {
            recrutar: pref.recrutar, usarChaves: pref.usarChaves, usarKits: pref.usarKits, kitLimiar: pref.kitLimiar,
            itens: want, ...filtros, loopMaxH: pref.loopMaxH, loopFalhas: pref.loopFalhas,
          },
        }).then((r) => {
          if (!r.ok || !r.config) { toast(r.erro || 'Não deu pra partir'); return; }
          close();
          go('expedition', { config: r.config as ExpeditionConfig, loop: pref.loop });
        }).catch((e) => toast(msgErro(e)));
        return;
      }
      const config = buildExpedition(s, sel.ids, sel.pet, sel.map);
      let got: Partial<Record<ItemMk, number>> = {};
      mutate((st) => { st.ultimoMapa = sel.map; pagarExpedicao(st, sel.ids, sel.map); got = takeItems(st, want); });
      // modo loop: guarda mapa/squad/pet/plano; os itens escolhidos viram a reposição de cada rodada
      mutate((st) => {
        st.loop = pref.loop ? novoLoop(sel.map, sel.ids, sel.pet, { recrutar: pref.recrutar, usarChaves: pref.usarChaves, usarKits: pref.usarKits, kitLimiar: pref.kitLimiar, itens: want, ...filtros, loopMaxH: pref.loopMaxH, loopFalhas: pref.loopFalhas }) : null;
        if (st.loop) st.loop.emCurso = { itens: got, t: Date.now() };
      });
      if (got.adrenalina) config.bonus.dano *= 1.15;
      if (got.colete) config.bonus.vida *= 1.15;
      const plano: ExpeditionPlan = { recrutar: pref.recrutar, usarChaves: pref.usarChaves, usarKits: pref.usarKits, kitLimiar: pref.kitLimiar, isca: (got.presente ?? 0) * ISCA, itens: got, ...filtros };
      config.plano = plano;
      config.manual = !!pref.manual && !pref.loop;
      close();
      go('expedition', { config, loop: pref.loop });
    }
    // não deixar levar mais do que tem
    for (const k of Object.keys(take) as ItemMk[]) take[k] = Math.min(take[k] ?? 0, itemCount(G(), k));
  });
  // sliders: o número ao lado acompanha enquanto arrasta (o resto atualiza ao soltar)
  m.body.addEventListener('input', (ev) => {
    const t = ev.target as HTMLInputElement;
    if (t.type !== 'range') return;
    const o = m.body.querySelector(`output[data-out="${t.dataset.id}"]`);
    if (o && OUT[t.dataset.id!]) o.textContent = OUT[t.dataset.id!](Number(t.value));
  });
}
