// Páginas de Recrutas e Pets do abrigo: agrupa por tipo e nota, mostra o progresso da FUSÃO ("3/5 para virar D"),
// camas x Alojamento de espera e funde N iguais em 1 da nota seguinte (escolhendo quem fica), com animação curta.
import './recrutas.css';
import { esc } from '../../core/dom';
import { G, mutate, type GameState, type Pet, type Recruit } from '../../game/state';
import { alojados, alojar, camaLivre, darCama, fundir, fusionGroups, vagaAlojamento, type FusionGroup, type FusionResult, type FusKind } from '../../game/fusion';
import { camas } from '../../game/shelter';
import { equipped } from '../../game/weapons';
import { ALOJAMENTO_VAGAS, FUSAO_PETS, FUSAO_RECRUTAS, GRADE_INFO, gradeMul, gradeOf, petMul, type Grade } from '../../data/grades';
import { PETS, RECRUITS, type PetType, type RecruitType } from '../../data/recruits';
import { TIER_INFO, WEAPONS } from '../../data/weapons';
import { petArt, portrait, recruitArt, type ActorArt } from '../../art/sprites';
import { gradeBadge } from '../widgets/grade';
import { toast } from '../widgets/toast';
import { live } from './panels';

const pc = new Map<string, string>();
const num = (v: number) => String(v).replace('.', ',');
/** Retrato justo: recorta o quadro idle pelo alfa e amplia em passo inteiro (pixel limpo); sem leitura, cai no portrait. */
function tight(art: ActorArt, size: number): HTMLCanvasElement {
  const src = art.frame('idle', 0), w = src.width, h = src.height;
  let d: Uint8ClampedArray;
  try { d = src.getContext('2d')!.getImageData(0, 0, w, h).data; } catch { return portrait(art, size); }
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return portrait(art, size);
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, fit = Math.min((size * 0.9) / bh, (size * 0.9) / bw), s = fit >= 1 ? Math.max(1, Math.floor(fit)) : fit;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false;
  const dw = Math.round(bw * s), dh = Math.round(bh * s);
  g.drawImage(src, x0, y0, bw, bh, Math.round((size - dw) / 2), Math.round(size * 0.96 - dh), dw, dh);
  return c;
}
function img(key: string, mk: () => ActorArt, size = 64): string {
  const k = key + ':' + size;
  let u = pc.get(k);
  if (!u) { u = tight(mk(), size).toDataURL(); pc.set(k, u); }
  return u;
}
const recImg = (r: Recruit, size = 64) => img('rec:' + r.tipo + r.skin, () => recruitArt(r.tipo, r.skin), size);
const petImg = (p: Pet, size = 64) => img('pet:' + p.tipo + p.variante, () => petArt(p.tipo, p.variante), size);
const isRec = (x: Recruit | Pet): x is Recruit => 'lv' in x;
const imgOf = (x: Recruit | Pet, size = 64) => (isRec(x) ? recImg(x, size) : petImg(x, size));

/** Quem herda o nível/arma numa fusão (maior nível, depois XP). */
const bestOf = (ms: (Recruit | Pet)[]) => [...ms].filter(isRec).sort((a, b) => b.lv - a.lv || b.xp - a.xp)[0] ?? null;

function armaTxt(s: GameState, id: string): string {
  if (!s.equip[id]) return 'sem arma';
  const w = equipped(s, id);
  return `<span style="color:${TIER_INFO[w.tier].cor}">${esc(WEAPONS[w.familia].nomes[w.tier])}</span>`;
}

function chip(s: GameState, x: Recruit | Pet, kind: FusKind): string {
  if (!isRec(x)) {
    return `<div class="rc-chip"><img class="px" src="${petImg(x)}" alt=""><div><b>${esc(x.nome)}</b><small>bônus ×${num(petMul(gradeOf(x)))}</small></div></div>`;
  }
  const cama = s.recs.includes(x), loopFixo = !!(s.loop?.ativo && s.loop.ids.includes(x.id));
  const act = kind === 'rec'
    ? cama
      ? `<button class="btn ghost xs" data-act="alojar" data-id="${x.id}" ${vagaAlojamento(s) && !loopFixo ? '' : 'disabled'} title="${loopFixo ? 'Está no squad do loop' : 'Libera a cama: vai pro Alojamento de espera'}">Alojar</button>`
      : `<button class="btn ghost xs" data-act="cama" data-id="${x.id}" ${camaLivre(s) ? '' : 'disabled'} title="${camaLivre(s) ? 'Dar uma cama livre' : 'Sem cama livre: evolua a Barraca'}">Dar cama</button>`
    : '';
  return `<div class="rc-chip${cama ? '' : ' aloj'}"><img class="px" src="${recImg(x)}" alt=""><div><b>${esc(x.nome)}</b><small>nv ${x.lv} · ${armaTxt(s, x.id)}</small>
    <span class="rc-tag ${cama ? 'cama' : 'esp'}">${cama ? 'Cama' : 'Alojamento'}</span></div>${act}</div>`;
}

function rowHtml(s: GameState, g: FusionGroup): string {
  const fr = g.prox ? Math.min(1, g.membros.length / g.n) : 1;
  const prog = g.prox
    ? `<span class="rc-prog"><b>${g.membros.length}/${g.n}</b> para virar ${gradeBadge(g.prox)}</span>`
    : '<span class="rc-prog"><b>Nota máxima</b></span>';
  const btn = g.prox ? `<button class="btn ${g.pronta ? 'cosmic' : 'ghost'} sm" data-act="fusao" data-tipo="${g.tipo}" data-nota="${g.nota}" ${g.pronta ? '' : 'disabled'}>${g.pronta ? `Fundir ${g.n} → ${g.prox}` : 'Fundir'}</button>` : '';
  return `<div class="rc-row${g.pronta ? ' ready' : ''}" style="--gc:${GRADE_INFO[g.nota].cor}">
      <div class="rc-rh">${gradeBadge(g.nota)}<span class="rc-gn">${GRADE_INFO[g.nota].nome} · ${g.kind === 'rec' ? `vida/dano ×${num(gradeMul(g.nota))}` : `bônus ×${num(petMul(g.nota))}`}</span>${prog}${btn}</div>
      ${g.prox ? `<div class="rc-bar"><i style="width:${fr * 100}%"></i></div>` : ''}
      <div class="rc-chips">${g.membros.map((x) => chip(s, x, g.kind)).join('')}</div>
    </div>`;
}

/** Tela de escolha de quem fica na fusão. */
function pickHtml(s: GameState, g: FusionGroup): string {
  const best = bestOf(g.membros);
  const her = g.kind === 'rec' && best
    ? `Quem ficar herda <b>nv ${best.lv}</b> (o maior do grupo) e a arma + golpes de <b>${esc(best.nome)}</b> (${armaTxt(s, best.id)}).`
    : 'Quem ficar mantém o nome e a aparência; o bônus do pet sobe com a nota.';
  return `<div class="rc-pick">
      <div class="rc-pick-h"><span class="lbl">Fusão · ${g.n} ${esc(g.kind === 'rec' ? RECRUITS[g.tipo as RecruitType].nome : PETS[g.tipo as PetType].nome)} ${g.nota} → 1 ${g.prox}</span>
        <button class="btn ghost sm" data-act="cancel">Cancelar</button></div>
      <p class="rc-pick-t"><b>Escolha quem fica.</b> ${her} Os outros ${g.n - 1} saem do abrigo${g.kind === 'rec' ? ', liberam cama e as armas voltam pro estoque' : ''}.</p>
      <div class="rc-pick-l">${g.membros.map((x) => `<button class="rc-pk" data-act="keep" data-id="${x.id}">
          <img class="px" src="${imgOf(x, 96)}" alt="">${gradeBadge(g.nota, 'corner')}<b>${esc(x.nome)}</b><small>${isRec(x) ? `nv ${x.lv}` : PETS[x.tipo].nome}</small></button>`).join('')}</div>
    </div>`;
}

/** Animação de fusão: os N retratos giram até o centro, clarão, e o que ficou aparece com a nota nova. */
export function playFusion(res: FusionResult, imgs: string[], onEnd?: () => void): void {
  const el = document.createElement('div');
  el.className = 'fus-fx';
  el.setAttribute('role', 'status');
  const n = imgs.length;
  el.innerHTML = `<div class="fus-stage">
      ${imgs.map((u, i) => `<img class="px fus-in" src="${u}" alt="" style="--a:${(360 / n) * i}deg;--d:${i * 40}ms">`).join('')}
      <div class="fus-burst"></div>
      <div class="fus-out"><img class="px" src="${imgOf(res.keeper, 128)}" alt="">${gradeBadge(res.para, 'corner lg')}</div>
      <div class="fus-txt"><span class="fus-big">FUSÃO!</span><b>${esc(res.keeper.nome)}</b> virou nota ${gradeBadge(res.para)}</div>
    </div>`;
  document.body.appendChild(el);
  let done = false;
  const end = () => { if (done) return; done = true; el.classList.add('bye'); setTimeout(() => { el.remove(); onEnd?.(); }, 260); };
  el.addEventListener('click', end);
  setTimeout(end, 2300);
}

function pageHtml(kind: FusKind, fus: { tipo: string; nota: Grade } | null): string {
  const s = G(), groups = fusionGroups(s, kind), T = kind === 'rec' ? FUSAO_RECRUTAS : FUSAO_PETS, N = `${T.E} E→D · ${T.D} D→C · ${T.C} C→B · ${T.B} B→A · ${T.A} A→S`;
  const tabs = `<div class="seg rc-tabs" role="tablist"><button data-act="tab" data-k="rec" aria-pressed="${kind === 'rec'}">Recrutas</button><button data-act="tab" data-k="pet" aria-pressed="${kind === 'pet'}">Pets</button></div>`;
  const head = kind === 'rec'
    ? `<div class="rc-stats"><span><i>Camas</i><b>${s.recs.length}/${camas(s)}</b></span><span><i>Alojamento</i><b>${alojados(s).length}/${ALOJAMENTO_VAGAS}</b></span>
        <p><b>Fusão:</b> iguais (mesmo tipo e nota) viram 1 da nota seguinte, e notas altas pedem menos: ${N}. Todo recrutado chega nota E.
        <b>Alojamento de espera:</b> recrutas sem cama ficam lá juntando fusão: não ocupam cama, não comem, não lutam e não dão bônus. Alojamento cheio não barra quem completa uma fusão.</p></div>`
    : `<div class="rc-stats"><span><i>Pets</i><b>${s.pets.length}</b></span><p><b>Fusão:</b> pets iguais (mesmo tipo e nota) viram 1 da nota seguinte: ${N}. Pets não usam cama. A nota multiplica o bônus (E ×0,5 … S ×2).</p></div>`;
  if (fus) {
    const g = groups.find((x) => x.tipo === fus.tipo && x.nota === fus.nota && x.pronta);
    if (g) return tabs + pickHtml(s, g);
  }
  const tipos = [...new Set(groups.map((g) => g.tipo))];
  const body = tipos.map((t) => {
    const gs = groups.filter((g) => g.tipo === t), first = gs[0].membros[0];
    const d = kind === 'rec' ? RECRUITS[t as RecruitType] : PETS[t as PetType];
    const sub = kind === 'rec' ? `${(d as typeof RECRUITS[RecruitType]).papel} · ${esc(d.bonus)}` : esc(d.bonus);
    const tot = gs.reduce((a, g) => a + g.membros.length, 0);
    return `<section class="rc-tipo"><header><img class="px" src="${imgOf(first, 72)}" alt=""><div><b>${esc(d.nome)}</b> <small>×${tot}</small><span class="lbl">${sub}</span></div></header>
      ${gs.map((g) => rowHtml(s, g)).join('')}</section>`;
  }).join('');
  const vazio = `<p class="rc-empty">${kind === 'rec' ? 'Nenhum recruta ainda. Aceite missões de sobreviventes nas expedições.' : 'Nenhum pet ainda. Ajude os bichos que aparecem nas expedições.'}</p>`;
  return tabs + head + (body ? `<div class="rc-list">${body}</div>` : vazio);
}

export function openRecrutas(kind: FusKind = 'rec'): void {
  let k = kind, fus: { tipo: string; nota: Grade } | null = null;
  live({ title: 'Recrutas e pets', kicker: 'Fusão e alojamento', wide: true }, () => pageHtml(k, fus), (el) => {
    const a = el.dataset.act, id = el.dataset.id ?? '';
    if (a === 'tab') { k = el.dataset.k as FusKind; fus = null; }
    else if (a === 'fusao') fus = { tipo: el.dataset.tipo!, nota: el.dataset.nota as Grade };
    else if (a === 'cancel') fus = null;
    else if (a === 'alojar') { let ok = false; mutate((s) => { ok = alojar(s, id); }); if (!ok) toast('Não deu pra alojar'); }
    else if (a === 'cama') { let ok = false; mutate((s) => { ok = darCama(s, id); }); if (!ok) toast('Sem cama livre'); }
    else if (a === 'keep' && fus) {
      const s = G(), g = fusionGroups(s, k).find((x) => x.tipo === fus!.tipo && x.nota === fus!.nota);
      if (!g) { fus = null; return; }
      // retratos de quem entra na fusão (o escolhido + os N−1 de maior nível), antes de mudar o estado
      const keep = g.membros.find((x) => x.id === id)!;
      const outros = g.membros.filter((x) => x !== keep).sort((a, b) => (isRec(b) && isRec(a) ? b.lv - a.lv || b.xp - a.xp : 0)).slice(0, g.n - 1);
      const imgs = [keep, ...outros].map((x) => imgOf(x, 80));
      let res: FusionResult | null = null;
      mutate((st) => { res = fundir(st, k, id); });
      fus = null;
      if (res) playFusion(res, imgs); else toast('Fusão não disponível');
    }
  });
}
export const openPets = () => openRecrutas('pet');
