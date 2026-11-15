import { HUB } from '../../art/legacy';
import { MAPS } from '../../data/maps';
import { mapCardsHtml, mapPreviewSrc, mapPronto } from './mapSelect';
import { openExpPlan } from './expPlan';
// Painéis (modais) do abrigo: construir, reparos, armas, expedição, relatório da Lua de Sangue; roster e diário.
import { h, esc } from '../../core/dom';
import { on } from '../../core/events';
import { go } from '../../core/router';
import { openModal, type ModalHandle } from '../widgets/modal';
import { toast } from '../widgets/toast';
import { G, mutate, type GameState } from '../../game/state';
import { modoRemoto } from '../../services/api';
import { ato, msgErro } from '../../services/intent';
import {
  buildBlock, damagedList, finishObraNow, lvl, maxHp, needsRepair, repair, repairAllCost, repairCost, startBuild,
} from '../../game/shelter';
import { bagText, canPay } from '../../game/economy';
import {
  craft, craftBlock, craftCost, equip, equipped, forcaCap, forcaOf, forja, forjaBlock, forjaCost, holderOf, MAX_COPIAS,
  nextTierOf, oficinaLv, projetosDe, tierCap, upgradeBlock, upgradeCost, upgradeTier,
} from '../../game/weapons';
import {
  equipBlock, equipGolpe, equippedGolpes, golpeNv, memberLv, slotsOf, unequipGolpe, upBlock, upGolpe,
} from '../../game/golpes';
import { GOLPES, GOLPE_IDS, GOLPE_MAX, golpeCd, golpeCusto, golpeDano, golpeNvReq, type GolpeId } from '../../data/golpes';
import { bloqueioExpedicao, faltaExpedicao } from '../../game/upkeep';
import { pickSelectHtml, bindPickSelect, type PickOpt } from '../widgets/pickSelect';
import { provisoesHtml, provisoesAct, faltaLabel } from './provisoes';
import { memberOptions, buildExpedition } from '../../game/team';
import { nextIsBloodMoon, PISO_DEFESA, type AttackReport } from '../../game/bloodmoon';
import { moonChip } from '../widgets/hud';
import { STRUCTS, STRUCT_IDS, type StructCat, type StructId } from '../../data/structures';
import { FORCA_BASE, FORCA_MAX, forcaMaxDe, PROJETOS_TIER, TIERS, TIER_INFO, WEAPONS, forcaMult, recipe, weaponDamage, type WeaponFamily } from '../../data/weapons';
import { PETS, RECRUITS } from '../../data/recruits';
import { gradeOf, petMul, type Grade } from '../../data/grades';
import { gradeBadge } from '../widgets/grade';
import { RESOURCES } from '../../data/resources';
import { heroArt, petArt, portrait, recruitArt, type ActorArt } from '../../art/sprites';
import { golpeImg, weaponImg } from '../../art/items';

export interface PanelHooks { focus(id: StructId): void }
let hooks: PanelHooks = { focus() {} };
export const initPanels = (p: PanelHooks) => { hooks = p; };

const DEBUG = /debug/.test(location.search);
const opened = new Set<ModalHandle>();
export function closeAllPanels(): void { [...opened].forEach((m) => m.close()); }

const wname = (f: WeaponFamily, t: keyof typeof TIER_INFO) => `<span style="color:${TIER_INFO[t].cor}">${WEAPONS[f].nomes[t]}</span>`;

/** Modal que se redesenha sozinho quando o estado muda. */
export function live(
  o: { title: string; kicker?: string; wide?: boolean; onClose?: () => void },
  render: () => string,
  act: (el: HTMLElement, ev: Event, close: () => void) => void,
  tickMs = 0,
): ModalHandle {
  let off = () => {}, timer = 0;
  // eslint-disable-next-line prefer-const
  let m!: ModalHandle;
  const redraw = () => {
    if (!m.el.isConnected) return;
    const box = m.el.querySelector<HTMLElement>('.mbox');
    const top = box?.scrollTop ?? 0;
    m.body.innerHTML = render();
    if (box) box.scrollTop = top;
  };
  m = openModal({
    ...o, html: render(),
    onClose: () => { clearInterval(timer); off(); opened.delete(m); o.onClose?.(); },
  });
  opened.add(m);
  off = on('state:changed', redraw);
  if (tickMs) timer = window.setInterval(redraw, tickMs);
  const handler = (ev: Event) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!t || t.hasAttribute('disabled')) return;
    const isSel = t.tagName === 'SELECT' || (t as HTMLInputElement).type === 'range'; // sliders: só ao soltar
    if (isSel !== (ev.type === 'change')) return;
    act(t, ev, () => m.close());
    redraw();
  };
  m.body.addEventListener('click', handler);
  m.body.addEventListener('change', handler);
  return m;
}

// ---------------- retratos ----------------
const pcache = new Map<string, string>();
function portraitUrl(key: string, mk: () => ActorArt, size = 64): string {
  const k = key + size;
  let u = pcache.get(k);
  if (!u) { u = portrait(mk(), size).toDataURL(); pcache.set(k, u); }
  return u;
}
const heroKey = (s: GameState) => { const w = equipped(s, 'hero'); return 'hero:' + w.familia + w.tier + JSON.stringify(s.hero); };
function memberImg(s: GameState, id: string, size = 64): string {
  if (id === 'hero') return portraitUrl(heroKey(s), () => { const w = equipped(s, 'hero'); return heroArt(s.hero!, { familia: w.familia, tier: w.tier }); }, size);
  const r = s.recs.find((x) => x.id === id)!;
  return portraitUrl('rec:' + r.tipo + r.skin, () => recruitArt(r.tipo, r.skin), size);
}

// ---------------- reparos ----------------
function repairsHtml(s: GameState): string {
  const list = damagedList(s);
  if (!list.length) return '<p class="lbl">Tudo em ordem. Nada danificado.</p>';
  const all = repairAllCost(s);
  const rows = list.map((id) => {
    const e = s.estruturas[id]!, c = repairCost(s, id), ok = canPay(s, c);
    const info = STRUCTS[id].cat === 'defesa' ? `HP ${Math.round(e.hp)}/${maxHp(s, id)}` : 'Danificada · produção parada';
    return `<div class="bitem"><div class="bi-main"><b>${STRUCTS[id].nome}</b> <span class="lv">${info}</span><span class="cost">${bagText(c, s.res)}</span></div>
      <div class="bi-btns"><button class="btn sm${ok ? '' : ' ghost'}" data-act="rep" data-id="${id}" ${ok ? '' : 'disabled'}>Reparar</button></div></div>`;
  }).join('');
  const okAll = canPay(s, all);
  return `${rows}<div class="bi-all"><span class="cost">Tudo: ${bagText(all, s.res)}</span>
    <button class="btn red" data-act="repall" ${okAll ? '' : 'disabled'}>Reparar tudo</button></div>`;
}

function repairAct(el: HTMLElement): boolean {
  const a = el.dataset.act;
  if (a === 'rep') {
    const id = el.dataset.id as StructId;
    if (modoRemoto()) { void ato('reparar', { id }).then((r) => toast(r.ok ? 'Reparado' : (r.erro || 'Faltam recursos'))).catch((e) => toast(msgErro(e))); return true; }
    let ok = false;
    mutate((s) => { ok = repair(s, id); });
    toast(ok ? 'Reparado' : 'Faltam recursos');
    return true;
  }
  if (a === 'repall') {
    if (modoRemoto()) { void ato('repararTudo', {}).then((r) => toast(r.ok ? 'Tudo reparado que deu pra pagar' : (r.erro || 'Nada pra reparar'))).catch((e) => toast(msgErro(e))); return true; }
    mutate((s) => { for (const id of damagedList(s)) repair(s, id); });
    toast('Tudo reparado que deu pra pagar');
    return true;
  }
  return false;
}

export function openRepairs(): void {
  live({ title: 'Reparos', kicker: 'Abrigo' }, () => `<div class="sh-list">${repairsHtml(G())}</div>`, (el) => { repairAct(el); });
}

// ---------------- construir ----------------
const IMG = new Map<string, string>();
/** desenho da construção (o mesmo sprite do abrigo), recortado na área pintada; gerado uma vez por nível */
function structImg(id: StructId, nv: number): string {
  const k = id + ':' + nv, hit = IMG.get(k);
  if (hit) return hit;
  let u = '';
  try {
    const sp = HUB().ABRIGO.sprite(id, nv), c = sp.c as HTMLCanvasElement, D = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (D[(y * c.width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 > x0 && y1 > y0) {
      const w = x1 - x0 + 2, hh = y1 - y0 + 2, o = document.createElement('canvas'); o.width = w; o.height = hh;
      o.getContext('2d')!.drawImage(c, x0, y0, w, hh, 0, 0, w, hh); u = o.toDataURL();
    }
  } catch { /* sem arte: o cartão fica só com o título */ }
  IMG.set(k, u);
  return u;
}

const CATS: [StructCat, string][] = [['nucleo', 'Núcleo'], ['alojamento', 'Alojamento'], ['defesa', 'Defesa'], ['producao', 'Produção'], ['oficina', 'Oficina']];
const WHY: Record<string, string> = { max: 'Nível máximo', fogueira: 'Evolua a Fogueira', obra: 'Obra em andamento', recursos: 'Faltam recursos' };

export function openBuild(focus?: StructId): void {
  const render = () => {
    const s = G();
    const head = s.obra
      ? `<div class="sh-note">Obra: <b>${STRUCTS[s.obra.id].nome}</b> nv ${s.obra.nv} · ${Math.max(0, Math.ceil((s.obra.fim - Date.now()) / 1000))} s${DEBUG ? ' <button class="btn sm ghost" data-act="finish">terminar obra (debug)</button>' : ''}</div>` : '';
    const dbg = DEBUG ? '<div class="sh-note">debug: <button class="btn sm ghost" data-act="dbgres">+50 de tudo</button></div>' : '';
    const groups = CATS.map(([cat, label]) => {
      const rows = STRUCT_IDS.filter((id) => STRUCTS[id].cat === cat).map((id) => {
        const def = STRUCTS[id], nv = lvl(s, id), next = nv + 1, blk = buildBlock(s, id);
        const cost = nv < def.max ? def.custo(next) : null;
        const hp = def.hp && nv > 0 ? ` · HP ${Math.round(s.estruturas[id]?.hp ?? 0)}/${maxHp(s, id)}` : '';
        const dmg = needsRepair(s, id);
        const rc = dmg ? repairCost(s, id) : null;
        // cartão: desenho da construção (nível atual; a não construída mostra como fica no nível 1), título e ação
        return `<article class="bcard${focus === id ? ' focus' : ''}${dmg ? ' dmg' : ''}${nv ? '' : ' novo'}">
          <div class="bc-img"><img alt="" src="${structImg(id, nv || 1)}"><span class="bc-lv">${nv ? `Nv ${nv}/${def.max}` : 'Não construída'}</span><span class="bc-cat">${label}</span></div>
          <div class="bc-body"><h3>${def.nome}</h3>
            <p class="bc-fx">${nv < def.max ? `<i>Nv ${next}</i> ${def.efeito(next)}` : def.efeito(nv)}</p>
            ${hp ? `<span class="bc-hp">${hp.slice(3)}</span>` : ''}
            ${cost ? `<span class="cost">${bagText(cost, s.res)} · ${def.obra(next)} s</span>` : ''}
            ${blk && blk !== 'max' ? `<span class="why">${WHY[blk]}</span>` : ''}
            ${dmg ? `<span class="why">Danificada · reparo: ${bagText(rc!, s.res)}</span>` : ''}</div>
          <div class="bc-btns">
            ${nv < def.max ? `<button class="btn sm${blk ? ' ghost' : ''}" data-act="build" data-id="${id}" ${blk ? 'disabled' : ''}>${nv ? 'Evoluir' : 'Construir'}</button>` : '<span class="bc-max">Nível máximo</span>'}
            ${dmg ? `<button class="btn sm red" data-act="rep" data-id="${id}" ${canPay(s, rc!) ? '' : 'disabled'}>Reparar</button>` : ''}
          </div></article>`;
      }).join('');
      return rows;
    }).join('');
    return `${head}${dbg}<div class="bcards">${groups}</div>`;
  };
  const m = live({ title: 'Construir', kicker: 'Abrigo', wide: true }, render, (el, _e, close) => {
    const a = el.dataset.act;
    if (a === 'build') {
      const id = el.dataset.id as StructId;
      if (modoRemoto()) {
        void ato('construir', { id }).then((r) => {
          if (r.ok) { toast(`Obra iniciada: ${STRUCTS[id].nome}`); hooks.focus(id); close(); } else toast(r.erro || 'Não dá pra construir agora');
        }).catch((e) => toast(msgErro(e)));
        return;
      }
      let ok = false;
      mutate((s) => { ok = startBuild(s, id); });
      if (ok) { toast(`Obra iniciada: ${STRUCTS[id].nome}`); hooks.focus(id); close(); } else toast('Não dá pra construir agora');
    } else if (a === 'finish') {
      if (modoRemoto()) { toast('Terminar a obra na hora só existe no jogo local.'); return; }
      mutate((s) => { finishObraNow(s); });
    } else if (a === 'dbgres') {
      if (modoRemoto()) { toast('O servidor não aceita recurso inventado.'); return; }
      mutate((s) => { for (const k of Object.keys(s.res) as (keyof typeof s.res)[]) s.res[k] += 50; });
    } else repairAct(el);
  }, 1000);
  m.el.querySelector('.focus')?.scrollIntoView({ block: 'nearest' });
}

// ---------------- oficina (armas) ----------------
const FAMS: WeaponFamily[] = ['bastao', 'pistola', 'laser'];
const CB: Record<string, string> = {
  projeto: 'Faltam projetos (ache em baús nas expedições)', serralheria: 'Evolua a Oficina', recursos: 'Faltam recursos', max: 'No máximo',
};
/** ★1–★5 em vermelho; ★6–★10 (forja lunar) em dourado. Apagadas = o que falta até o teto. */
const stars = (n: number, max = FORCA_BASE) => {
  const base = Math.min(n, FORCA_BASE), lun = Math.max(0, n - FORCA_BASE);
  const offB = Math.max(0, Math.min(max, FORCA_BASE) - base), offL = Math.max(0, max - FORCA_BASE - lun);
  return `<span class="of-stars">${'★'.repeat(base)}<i>${'★'.repeat(offB)}</i>${max > FORCA_BASE ? `<span class="of-lunar">${'★'.repeat(lun)}<i>${'★'.repeat(offL)}</i></span>` : ''}</span>`;
};

type OfAba = 'arsenal' | 'equipar' | 'fabricar' | 'como';
const OF_ABAS: [OfAba, string][] = [['arsenal', 'Arsenal'], ['equipar', 'Equipar'], ['fabricar', 'Fabricar'], ['como', 'Como funciona']];
const OF_KEY = 'lds.oficina.aba';
let ofAba: OfAba = (() => { try { const v = localStorage.getItem(OF_KEY) as OfAba | null; return v && OF_ABAS.some(([k]) => k === v) ? v : 'arsenal'; } catch { return 'arsenal'; } })();

function oficinaHtml(s: GameState): string {
  const nv = oficinaLv(s), def = STRUCTS.serralheria, blk = buildBlock(s, 'serralheria');
  const caps = FAMS.map((f) => { const c = tierCap(s, f); return `${WEAPONS[f].nome}: ${c ? `<span style="color:${TIER_INFO[c].cor}">${TIER_INFO[c].nome}</span>` : '—'}`; }).join(' · ');
  const head = `<div class="bitem of-head"><div class="bi-main"><b>Oficina</b> <span class="lv">${nv ? `nv ${nv}/${def.max}` : 'não construída'}</span>
      <small>Raridade máxima: ${caps} · força até ${stars(forcaCap(s))}${nv >= 5 ? ` · <b>forja lunar</b> ★6–★${FORCA_MAX} em armas lunares` : ''}</small>
      ${nv < def.max ? `<span class="cost">Nv ${nv + 1}: ${def.efeito(nv + 1)} · ${bagText(def.custo(nv + 1), s.res)}</span>` : ''}
      ${s.obra?.id === 'serralheria' ? '<span class="why">Obra da Oficina em andamento</span>' : blk && nv < def.max ? `<span class="why">${WHY[blk]}</span>` : ''}</div>
    <div class="bi-btns">${nv < def.max ? `<button class="btn sm${blk ? ' ghost' : ''}" data-act="buildof" ${blk ? 'disabled' : ''}>${nv ? 'Evoluir Oficina' : 'Construir Oficina'}</button>` : ''}</div></div>`;
  const proj = FAMS.map((f) => `<span><b>${projetosDe(s, f)}</b> ${WEAPONS[f].nome.toLowerCase()}</span>`).join('');
  const how = `<div class="of-how"><b>Como ter projetos</b>
      <ul><li>Abra <b>baús</b> nas expedições (com chave ou resolvendo o puzzle). Baús <b>militares</b> e <b>raros</b> dão mais projetos.</li>
      <li>Expedição só traz arma <b>comum</b>. Arma repetida (mais de ${MAX_COPIAS} da mesma família) vira <b>projeto</b>.</li>
      <li>Aqui na Oficina cada raridade gasta projetos da família: incomum ${PROJETOS_TIER.incomum} · raro ${PROJETOS_TIER.raro} · lunar ${PROJETOS_TIER.lunar}. A <b>força</b> (★) só gasta recursos.</li>
      <li><b>Forja lunar:</b> com a Oficina no nível máximo, armas <b>lunares</b> passam do ★${FORCA_BASE} até o ★${FORCA_MAX} (+10% de dano por estrela), pagando peças e <b>fragmentos lunares</b>.</li></ul>
      <div class="of-proj">Projetos guardados: ${proj}</div></div>`;
  const arsenal = s.armas.length ? [...s.armas].sort((a, b) => FAMS.indexOf(a.familia) - FAMS.indexOf(b.familia) || TIERS.indexOf(b.tier) - TIERS.indexOf(a.tier)).map((w) => {
    const t = nextTierOf(w), ub = upgradeBlock(s, w.id), fb = forjaBlock(s, w.id), who = holderOf(s, w.id);
    const whoName = who ? memberOptions(s).find((m) => m.id === who)?.nome ?? '' : '';
    const dmg = Math.round(weaponDamage(w.familia, w.tier) * forcaMult(w.nv));
    const up = t ? `<span class="cost">→ ${wname(w.familia, t)}: ${bagText(upgradeCost(s, w), s.res)} + <b class="${projetosDe(s, w.familia) >= PROJETOS_TIER[t] ? '' : 'miss'}">${PROJETOS_TIER[t]} projeto${PROJETOS_TIER[t] > 1 ? 's' : ''}</b> · Oficina nv ${recipe(w.familia, t).serralheria}</span>` : '';
    const fmax = forcaMaxDe(w.tier);
    const fo = forcaOf(w) < fmax ? `<span class="cost">${forcaOf(w) >= FORCA_BASE ? 'Forja lunar ' : 'Força '}★${forcaOf(w) + 1}: ${bagText(forjaCost(s, w), s.res)}</span>` : '';
    return `<div class="bitem of-w" data-w="${w.id}" style="--tc:${TIER_INFO[w.tier].cor}"><span class="of-ic${forcaOf(w) > FORCA_BASE ? ' of-forjada' : ''}" ${forcaOf(w) > FORCA_BASE ? `title="Forja lunar ★${forcaOf(w)}"` : ''}>${weaponImg(w.familia, w.tier, 56)}${forcaOf(w) > FORCA_BASE ? `<b class="of-fl">★${forcaOf(w)}</b>` : ''}</span><div class="bi-main"><b>${wname(w.familia, w.tier)}</b> <span class="lv">${TIER_INFO[w.tier].nome} · dano ${dmg}</span>
        <small>${stars(forcaOf(w), fmax)} ${whoName ? `· com <b>${esc(whoName)}</b>` : '· no arsenal'}</small>${up}${fo}
        ${t && ub && ub !== 'max' ? `<span class="why">Raridade: ${CB[ub]}</span>` : ''}${fb && fb !== 'max' && fb !== 'lunar' ? `<span class="why">Força: ${fb === 'serralheria' ? (forcaOf(w) >= FORCA_BASE ? 'forja lunar pede a Oficina nv 5' : 'evolua a Oficina') : CB[fb]}</span>` : ''}${fb === 'lunar' ? `<span class="lbl">★${FORCA_BASE} · evolua pra lunar pra liberar a forja lunar</span>` : ''}</div>
      <div class="bi-btns">${t ? `<button class="btn sm${ub ? ' ghost' : ''}" data-act="upw" data-id="${w.id}" ${ub ? 'disabled' : ''}>Evoluir raridade</button>` : '<span class="lbl">raridade máx.</span>'}
        ${forcaOf(w) < fmax ? `<button class="btn sm ghost${forcaOf(w) >= FORCA_BASE ? ' of-lunar-btn' : ''}" data-act="forja" data-id="${w.id}" ${fb ? 'disabled' : ''}>${forcaOf(w) >= FORCA_BASE ? 'Forja lunar ★' : 'Forjar ★'}</button>` : ''}</div></div>`;
  }).join('') : '<p class="lbl">Arsenal vazio.</p>';
  const fab = FAMS.map((f) => {
    const b = craftBlock(s, f), d = WEAPONS[f];
    const why = b === 'max' ? `Já tem ${MAX_COPIAS}` : b === 'projeto' ? 'Precisa achar 1 projeto ou a arma' : b ? CB[b] : '';
    return `<div class="bitem of-w" style="--tc:${TIER_INFO.comum.cor}"><span class="of-ic">${weaponImg(f, 'comum', 56)}</span><div class="bi-main"><b>${d.nomes.comum}</b> <span class="lv">${d.tipo === 'melee' ? 'corpo a corpo' : d.tipo === 'ranged' ? 'à distância' : 'feixe'}</span>
        <small>${d.desc}</small><span class="cost">${bagText(craftCost(s, f, 'comum'), s.res)} · Oficina nv ${recipe(f, 'comum').serralheria}</span>${why ? `<span class="why">${why}</span>` : ''}</div>
      <div class="bi-btns"><button class="btn sm${b ? ' ghost' : ''}" data-act="craft" data-f="${f}" ${b ? 'disabled' : ''}>Fabricar comum</button></div></div>`;
  }).join('');
  const members = memberOptions(s).map((mo) => {
    const cur = equipped(s, mo.id);
    const opts = s.armas.map((w) => `<option value="${w.id}"${w.id === cur.id ? ' selected' : ''}>${WEAPONS[w.familia].nomes[w.tier]} (${TIER_INFO[w.tier].nome} ★${forcaOf(w)})</option>`).join('');
    return `<label class="eq"><img class="px" src="${memberImg(s, mo.id, 48)}" alt=""><span><b>${esc(mo.nome)}</b> <span class="lbl">nv ${mo.lv}</span></span>
      <select data-act="equip" data-m="${mo.id}">${cur.id === 'mao' ? '<option value="" selected disabled>mãos nuas</option>' : ''}${opts}</select></label>`;
  }).join('');
  const nFab = FAMS.filter((f) => !craftBlock(s, f)).length, nProj = FAMS.reduce((a, f) => a + projetosDe(s, f), 0);
  const nUp = s.armas.filter((w) => (nextTierOf(w) && !upgradeBlock(s, w.id)) || (forcaOf(w) < forcaMaxDe(w.tier) && !forjaBlock(s, w.id))).length;
  const sub: Record<OfAba, string> = {
    arsenal: `${s.armas.length} arma${s.armas.length === 1 ? '' : 's'}${nUp ? ` · ${nUp} pra evoluir` : ''}`,
    equipar: `${memberOptions(s).length} membro${memberOptions(s).length === 1 ? '' : 's'}`,
    fabricar: nFab ? `${nFab} disponíve${nFab === 1 ? 'l' : 'is'}` : 'nada agora',
    como: `${nProj} projeto${nProj === 1 ? '' : 's'}`,
  };
  const pane: Record<OfAba, string> = {
    arsenal: `<div class="sh-group"><div class="lbl">Evoluir raridade e força</div>${arsenal}</div>`,
    equipar: `<div class="sh-group"><div class="lbl">Arma de cada membro</div>${members}</div>`,
    fabricar: `<div class="sh-group"><div class="lbl">Fabricar (sempre comum)</div>${fab}</div>`,
    como: how,
  };
  const tabs = OF_ABAS.map(([k, l]) => `<button class="ep-tab" role="tab" data-act="ofaba" data-id="${k}" aria-selected="${ofAba === k}"><b>${l}</b><small>${sub[k]}</small></button>`).join('');
  return `${head}
    <div><div class="ep-tabs" role="tablist" aria-label="Partes da Oficina">${tabs}</div>
    <div class="of-pane" role="tabpanel">${pane[ofAba]}</div></div>`;
}

/** Painel da Oficina: evoluir/forjar armas com projetos e recursos, fabricar comuns e equipar. */
export function openOficina(): void {
  live({ title: 'Oficina', kicker: 'Armas', wide: true }, () => `<div class="sh-list">${oficinaHtml(G())}</div>`, (el) => {
    const a = el.dataset.act;
    if (a === 'ofaba') { ofAba = el.dataset.id as OfAba; try { localStorage.setItem(OF_KEY, ofAba); } catch { /* sem storage */ } }
    else if (a === 'craft') {
      const familia = el.dataset.f as WeaponFamily;
      if (modoRemoto()) { void ato('fabricar', { familia }).then((r) => toast(r.ok ? `Fabricou: ${r.extra?.nome ?? ''}` : (r.erro || 'Não dá pra fabricar agora'))).catch((e) => toast(msgErro(e))); return; }
      let it: ReturnType<typeof craft> = null;
      mutate((s) => { it = craft(s, familia); });
      const x = it as ReturnType<typeof craft>;
      toast(x ? `Fabricou: ${WEAPONS[x.familia].nomes.comum}` : 'Não dá pra fabricar agora');
    } else if (a === 'upw') {
      const arma = el.dataset.id!;
      if (modoRemoto()) { void ato('evoluir', { arma }).then((r) => toast(r.ok ? `Evoluiu: ${r.extra?.nome ?? ''}` : (r.erro || 'Não dá pra evoluir agora'))).catch((e) => toast(msgErro(e))); return; }
      let it: ReturnType<typeof upgradeTier> = null;
      mutate((s) => { it = upgradeTier(s, arma); });
      const x = it as ReturnType<typeof upgradeTier>;
      toast(x ? `Evoluiu: ${WEAPONS[x.familia].nomes[x.tier]} (${TIER_INFO[x.tier].nome})` : 'Não dá pra evoluir agora');
    } else if (a === 'forja') {
      const arma = el.dataset.id!;
      if (modoRemoto()) { void ato('forjar', { arma }).then((r) => toast(r.ok ? `Força ${r.extra?.nv}: ${r.extra?.nome ?? ''}` : (r.erro || 'Não dá pra forjar agora'))).catch((e) => toast(msgErro(e))); return; }
      let it: ReturnType<typeof forja> = null;
      mutate((s) => { it = forja(s, arma); });
      const x = it as ReturnType<typeof forja>;
      toast(x ? `Força ${x.nv}: ${WEAPONS[x.familia].nomes[x.tier]}` : 'Não dá pra forjar agora');
    } else if (a === 'buildof') {
      if (modoRemoto()) {
        void ato('construir', { id: 'serralheria' }).then((r) => { if (r.ok) { toast('Obra iniciada: Oficina'); hooks.focus('serralheria'); } else toast(r.erro || 'Não dá pra construir agora'); }).catch((e) => toast(msgErro(e)));
        return;
      }
      let ok = false;
      mutate((s) => { ok = startBuild(s, 'serralheria'); });
      if (ok) { toast('Obra iniciada: Oficina'); hooks.focus('serralheria'); } else toast('Não dá pra construir agora');
    } else if (a === 'equip') {
      const v = (el as HTMLSelectElement).value;
      if (!v) return;
      if (modoRemoto()) { void ato('equipar', { membro: el.dataset.m!, arma: v }).catch((e) => toast(msgErro(e))); return; }
      mutate((s) => equip(s, el.dataset.m!, v));
    }
  }, 1000);
}
/** Atalho antigo ("Armas") → Oficina. */
export const openWeapons = openOficina;

// ---------------- golpes especiais ----------------
const GB: Record<string, string> = { max: 'Nível máximo', nivel: 'Nível do personagem baixo', recursos: 'Faltam recursos', membro: '' };
let golpeSel = 'hero';

function golpesHtml(s: GameState, mid: string): string {
  const ms = memberOptions(s);
  const tabs = ms.map((m) => `<button class="pick" data-act="gm" data-id="${m.id}" aria-pressed="${m.id === mid}"><img class="px" src="${memberImg(s, m.id)}" alt=""><span>${esc(m.nome)}<small>nv ${m.lv} · ${slotsOf(s, m.id)} slot${slotsOf(s, m.id) > 1 ? 's' : ''}</small></span></button>`).join('');
  const lv = memberLv(s, mid), nSlots = slotsOf(s, mid), eq = equippedGolpes(s, mid);
  const slotEls = Array.from({ length: 3 }, (_, i) => {
    if (i >= nSlots) return `<div class="gp-slot lock"><small>slot ${i + 1}</small>nv ${i === 1 ? 3 : 6}</div>`;
    const g = eq[i];
    return g ? `<button class="gp-slot on" style="--gc:${GOLPES[g.id].cor}" data-act="gun" data-g="${g.id}" title="Tirar do slot">${golpeImg(g.id, 40)}<span><small>slot ${i + 1}</small>${GOLPES[g.id].nome} <i>nv ${g.nv}</i></span></button>`
      : `<div class="gp-slot"><small>slot ${i + 1}</small>vazio</div>`;
  }).join('');
  const list = GOLPE_IDS.map((id) => {
    const d = GOLPES[id], n = golpeNv(s, mid, id), ub = upBlock(s, mid, id), eb = equipBlock(s, mid, id);
    const on_ = eq.some((g) => g.id === id), cur = Math.max(1, n);
    const pips = Array.from({ length: GOLPE_MAX }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
    const nextReq = n < GOLPE_MAX ? golpeNvReq(id, n + 1) : 0;
    return `<div class="bitem gp${n ? '' : ' locked'}${on_ ? ' focus' : ''}" style="--gc:${d.cor}"><span class="gp-ic">${golpeImg(id, 56)}</span><div class="bi-main">
        <b class="gp-name">${d.nome}</b> <span class="lv">${n ? `nv ${n}/${GOLPE_MAX}` : `bloqueado · nv ${d.nvMin}+`}</span>
        <span class="gp-pips">${pips}</span>
        <small>${d.desc}</small>
        <span class="cost">Recarga ${golpeCd(id, cur).toFixed(1)} s${d.dano ? ` · dano ×${golpeDano(id, cur).toFixed(2)}` : ''}</span>
        ${n < GOLPE_MAX ? `<span class="cost">${n ? 'Upar' : 'Liberar'}: ${bagText(golpeCusto(id, n + 1), s.res)} · personagem nv ${nextReq}${lv < nextReq ? ' <em>(falta)</em>' : ''}</span>` : ''}
        ${ub && ub !== 'max' && GB[ub] ? `<span class="why">${GB[ub]}</span>` : ''}</div>
      <div class="bi-btns">
        ${n < GOLPE_MAX ? `<button class="btn sm${ub ? ' ghost' : ''}" data-act="gup" data-g="${id}" ${ub ? 'disabled' : ''}>${n ? 'Upar' : 'Liberar'}</button>` : ''}
        ${n ? (on_ ? `<button class="btn sm ghost" data-act="gun" data-g="${id}">Tirar</button>` : `<button class="btn sm ghost" data-act="geq" data-g="${id}" ${eb ? 'disabled' : ''} title="${eb === 'slots' ? 'Slots cheios' : ''}">Equipar</button>`) : ''}
      </div></div>`;
  }).join('');
  return `<div class="picks">${tabs}</div>
    <div class="sh-note">Golpes equipados saem sozinhos no auto-combate quando a recarga termina e a situação pede (grupo perto, fila na frente, aliado ferido...). Slots: 1 · 2 no nv 3 · 3 no nv 6.</div>
    <div class="gp-slots">${slotEls}</div>
    <div class="sh-list">${list}</div>`;
}

/** Painel de golpes especiais: liberar, upar e equipar por membro. */
export function openGolpes(memberId?: string): void {
  const ids = memberOptions(G()).map((m) => m.id);
  golpeSel = memberId && ids.includes(memberId) ? memberId : ids.includes(golpeSel) ? golpeSel : 'hero';
  live({ title: 'Golpes', kicker: 'Treino no abrigo', wide: true }, () => golpesHtml(G(), golpeSel), (el) => {
    const a = el.dataset.act, g = el.dataset.g as GolpeId;
    if (a === 'gm') golpeSel = el.dataset.id!;
    else if (a === 'gup') {
      if (modoRemoto()) { void ato('golpeUp', { membro: golpeSel, golpe: g }).then((r) => toast(r.ok ? GOLPES[g].nome : (r.erro || 'Não dá pra upar agora'))).catch((e) => toast(msgErro(e))); return; }
      let ok = false;
      mutate((s) => { ok = upGolpe(s, golpeSel, g); });
      toast(ok ? `${GOLPES[g].nome}: nv ${golpeNv(G(), golpeSel, g)}` : 'Não dá pra upar agora');
    } else if (a === 'geq') {
      if (modoRemoto()) { void ato('golpeEquip', { membro: golpeSel, golpe: g }).then((r) => { if (!r.ok) toast(r.erro || 'Slots cheios: tire um golpe primeiro'); }).catch((e) => toast(msgErro(e))); return; }
      let ok = false;
      mutate((s) => { ok = equipGolpe(s, golpeSel, g); });
      if (!ok) toast('Slots cheios: tire um golpe primeiro');
    } else if (a === 'gun') {
      if (modoRemoto()) { void ato('golpeTirar', { membro: golpeSel, golpe: g }).catch((e) => toast(msgErro(e))); return; }
      mutate((s) => unequipGolpe(s, golpeSel, g));
    }
  });
}

// ---------------- expedição ----------------
/** Passo 1: escolher o mapa (cartões com prévia e bestiário). Passo 2: montar o squad. */
export function openExpedition(): void {
  let pick = (G().vencidos ?? []).length && G().ultimoMapa && MAPS[G().ultimoMapa!] ? G().ultimoMapa! : 'marco_zero';
  live({ title: 'Expedição', kicker: 'Escolha o destino', wide: true }, () => {
    const s = G();
    return `<div class="mapcards">${mapCardsHtml(s, pick)}</div>
      <div class="sh-go"><span class="lbl">Destino: ${esc(MAPS[pick].nome)}</span><button class="btn big" data-act="next">Montar squad →</button></div>`;
  }, (el, _e, close) => {
    const a = el.dataset.act;
    if (a === 'pickmap') pick = el.dataset.id!;
    else if (a === 'next') { close(); openSquad(pick); }
  });
}

function openSquad(mapId: string): void {
  const sel: { a: string; b: string | null; pet: string | null; map: string } = { a: 'hero', b: null, pet: null, map: mapId };
  { // membro 2 já vem preenchido (recruta que entrou no caminho / último escolhido), se as provisões da dupla fecham
    const s0 = G(), b = s0.recs.find((r) => r.id === s0.squadPadrao)?.id ?? s0.recs[0]?.id ?? null;
    if (b && !faltaExpedicao(s0, ['hero', b], mapId).length) sel.b = b;
  }
  let dd: string | null = null; // select aberto: 'a' | 'b' | 'pet'
  const ids = () => [sel.a, sel.b].filter((x): x is string => !!x);
  const render = () => {
    const s = G(), ms = memberOptions(s);
    const membro = (m: typeof ms[number], outro: string | null): PickOpt => {
      const w = equipped(s, m.id);
      return {
        id: m.id, nome: m.nome, img: memberImg(s, m.id), badge: m.nota ? gradeBadge(m.nota) : '',
        sub: `nv ${m.lv} · ${w.id === 'mao' ? 'mãos nuas' : wname(w.familia, w.tier)}${m.kind === 'hero' ? ' · líder' : ''}`,
        disabled: m.id === outro, why: m.id === outro ? 'Já está no outro slot' : undefined,
      };
    };
    const optsA = ms.map((m) => membro(m, null));
    const optsB: PickOpt[] = [{ id: '', nome: 'Ninguém (solo)', sub: 'Gasta metade das provisões' }, ...ms.map((m) => membro(m, sel.a))];
    const optsPet: PickOpt[] = [{ id: '', nome: 'Sem pet', sub: s.pets.length ? 'Pet dá bônus no combate' : 'Ache pets nas expedições' },
      ...s.pets.map((p) => ({ id: p.id, nome: p.nome, img: portraitUrl('pet:' + p.tipo + p.variante, () => petArt(p.tipo, p.variante)), badge: gradeBadge(p), sub: `${PETS[p.tipo].nome} · ${esc(PETS[p.tipo].bonus)}${petMul(gradeOf(p)) !== 1 ? ` (força ×${petMul(gradeOf(p))})` : ''}` }))];
    const falta = faltaExpedicao(s, ids(), sel.map);
    const M = MAPS[sel.map], mapNome = M.nome, prev = mapPronto(M) ? mapPreviewSrc(M) : null; // prévia do cache/worker: sem gerar o cenário na hora (travava a abertura)
    const lua = nextIsBloodMoon(s)
      ? `<div class="sh-warn"><b>A LUA DE SANGUE ESTÁ NO CÉU</b><br>${moonChip()}. Zumbis enluarados e plenilunares, mais loot, e a horda ataca o abrigo uma vez por Lua (se ainda não atacou). Confira as defesas antes de sair.</div>` : '';
    return `${lua}
      <div class="sq-dest">${prev ? `<img ${prev} alt="">` : ''}<div><span class="lbl">Destino</span><b>${esc(mapNome)}</b><small>${M.areas} áreas · nível ${M.nivelRecomendado}+</small></div><button class="btn ghost" data-act="back">Trocar mapa</button></div>
      <div class="sq-team">
        ${pickSelectHtml('a', 'Membro 1', optsA, sel.a, dd === 'a')}
        ${pickSelectHtml('b', 'Membro 2 (opcional)', optsB, sel.b, dd === 'b', 'Ninguém (solo)')}
        ${pickSelectHtml('pet', 'Pet (bônus)', optsPet, sel.pet, dd === 'pet', 'Sem pet')}
      </div>
      ${provisoesHtml(s, ids(), sel.map)}
      <div class="sh-go"><span class="lbl">${sel.b ? 'Dupla' : 'Solo'}${sel.pet ? ' + pet' : ''} · ${esc(mapNome)}</span>
        ${falta.length ? `<button class="btn big pv-falta" data-act="go" disabled title="${esc(faltaLabel(falta))}">${esc(faltaLabel(falta))}</button>`
          : `<button class="btn big${lua ? ' red' : ''}" data-act="go">Plano da expedição →</button>`}</div>`;
  };
  const m = live({ title: 'Expedição', kicker: 'Monte o squad', wide: true }, render, (el, _e, close) => {
    const a = el.dataset.act, id = el.dataset.id ?? '';
    if (a === 'psel') { dd = dd === id ? null : id; return; }
    if (a === 'a' || a === 'b' || a === 'pet') dd = null;
    if (a === 'a') { if (sel.b === id) sel.b = sel.a; sel.a = id; } // escolher o membro 2 como 1 troca os dois
    else if (a === 'b') sel.b = id || null;
    else if (a === 'pet') sel.pet = id || null;
    else if (a === 'back') { close(); openExpedition(); }
    else if (a === 'go') {
      if (bloqueioExpedicao(G(), ids(), sel.map)) return;
      const abrir = () => { close(); openExpPlan({ ids: ids(), pet: sel.pet, map: sel.map }, () => openSquad(sel.map)); };
      if (modoRemoto()) {
        if (sel.b) void ato('squad', { id: sel.b }).then(abrir).catch((e) => toast(msgErro(e)));
        else abrir();
        return;
      }
      if (sel.b) mutate((st) => { st.squadPadrao = sel.b!; });
      abrir();
    } else provisoesAct(el);
  });
  bindPickSelect(m.body, () => dd, (k) => { dd = k; });
}

// ---------------- relatório da Lua de Sangue ----------------
export function openAttackReport(rep: AttackReport): void {
  const render = () => {
    const s = G(), mx = Math.max(rep.forca, rep.defesa, 1);
    const dano = Object.entries(rep.danoDefesas).filter(([, v]) => (v ?? 0) > 0)
      .map(([id, v]) => `<li>${STRUCTS[id as StructId].nome}: <em>-${v} HP</em> <span class="lbl">(${Math.round(s.estruturas[id as StructId]?.hp ?? 0)}/${maxHp(s, id as StructId)})</span>${rep.piso?.includes(id as StructId) ? ` <span class="lbl">· parou no mínimo de ${Math.round(PISO_DEFESA * 100)}%</span>` : ''}</li>`).join('')
      + (rep.piso ?? []).filter((id) => !rep.danoDefesas[id]).map((id) => `<li>${STRUCTS[id].nome}: <em>0 HP</em> <span class="lbl">· já estava no mínimo de ${Math.round(PISO_DEFESA * 100)}% e segurou assim mesmo</span></li>`).join('');
    const danif = rep.danificadas.map((id) => STRUCTS[id].nome).join(', ');
    const rouba = Object.entries(rep.roubado).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => `${RESOURCES[k as keyof typeof RESOURCES].nome} ${v}`).join(' · ');
    return `<div class="rp-head ${rep.segurou ? 'ok' : 'bad'}">${rep.segurou ? 'As defesas seguraram a horda.' : 'A horda atravessou as defesas!'}</div>
      <div class="rp-bars">
        <div><span class="lbl">Horda · força ${rep.forca}</span><div class="bar"><i class="red" style="width:${(rep.forca / mx) * 100}%"></i></div></div>
        <div><span class="lbl">Defesa · ${rep.defesa}</span><div class="bar"><i class="cyan" style="width:${(rep.defesa / mx) * 100}%"></i></div></div>
      </div>
      <div class="lbl">Dano nas defesas</div><ul class="rp-list">${dano || '<li>Nenhuma defesa foi atingida.</li>'}</ul>
      ${danif ? `<div class="lbl">Danificadas (produção parada)</div><p>${danif}</p>` : ''}
      ${rouba ? `<div class="lbl">Recursos roubados</div><p><em>${rouba}</em></p>` : ''}
      <div class="lbl">Reparos</div><div class="sh-list">${repairsHtml(s)}</div>`;
  };
  live({ title: 'Relatório do ataque', kicker: `Lua de Sangue · dia ${rep.dia}`, wide: true }, render, (el) => { repairAct(el); });
}

// ---------------- roster e diário ----------------
export function renderRoster(el: HTMLElement): void {
  const s = G();
  el.innerHTML = '';
  const add = (art: ActorArt, nome: string, sub: string, extra: string, nota?: Grade) => {
    const d = h(`<div class="card"><div class="cv" style="position:relative">${nota ? gradeBadge(nota, 'corner') : ''}</div><b>${esc(nome)}</b><span class="lbl">${sub}</span><small>${extra}</small></div>`);
    d.querySelector('.cv')!.prepend(portrait(art, 72));
    el.appendChild(d);
  };
  if (s.hero) {
    const w = equipped(s, 'hero');
    add(heroArt(s.hero, { familia: w.familia, tier: w.tier }), s.hero.nome, `Líder · nv ${s.heroLv}`, wname(w.familia, w.tier));
  }
  for (const r of s.recs) {
    const w = equipped(s, r.id), d = RECRUITS[r.tipo];
    add(recruitArt(r.tipo, r.skin), r.nome, `${d.nome} · ${d.papel} · nv ${r.lv}`, wname(w.familia, w.tier), gradeOf(r));
  }
  for (const p of s.pets) add(petArt(p.tipo, p.variante), p.nome, `${PETS[p.tipo].nome} · pet`, `${PETS[p.tipo].bonus} (×${petMul(gradeOf(p))})`, gradeOf(p));
  const al = s.alojamento?.length ?? 0;
  if (al) el.appendChild(h(`<p class="lbl" style="grid-column:1/-1">Alojamento de espera: ${al} recruta${al === 1 ? '' : 's'} aguardando fusão (veja Recrutas)</p>`));
}

export function renderLog(el: HTMLElement): void {
  const log = G().log;
  el.innerHTML = log.length ? log.slice(0, 20).map((l) => `<li>${l.html}</li>`).join('') : '<li class="lbl">Nada aconteceu ainda.</li>';
}
