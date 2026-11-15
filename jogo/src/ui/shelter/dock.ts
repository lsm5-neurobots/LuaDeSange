// Dock do abrigo: placas com ícone pixel art (MENU_ICON), rótulo curto, atalho 1–9/0 e badges calculados do estado.
// Os ícones são gerados uma vez (cache em memória + persistente via items.ts) e servidos como <img>.
import './dock.css';
import { menuIconURL } from '../../art/items';
import type { GameState } from '../../game/state';
import { buildBlock, damagedList, pendingTotal } from '../../game/shelter';
import { upgradeBlock } from '../../game/weapons';
import { upBlock } from '../../game/golpes';
import { fusionGroups } from '../../game/fusion';
import { buyBlock, marketList } from '../../game/market';
import { msUntilBloodMoon, nextIsBloodMoon } from '../../game/bloodmoon';
import { serverNow, textoContagemLua } from '../../game/worldClock';
import { STRUCT_IDS } from '../../data/structures';
import { GOLPE_IDS } from '../../data/golpes';
import { conqProntas } from '../../game/conquistas';

interface DockItem { a: string; ic: string; nome: string; curto: string; tip: string; ac: string }
const ITEMS: DockItem[] = [
  { a: 'build', ic: 'build', nome: 'Construir', curto: 'Construir', tip: 'Construir e evoluir estruturas', ac: '#ffd23f' },
  { a: 'repair', ic: 'repair', nome: 'Reparos', curto: 'Reparos', tip: 'Consertar estruturas danificadas', ac: '#ff5a6e' },
  { a: 'weapons', ic: 'weapons', nome: 'Armas', curto: 'Armas', tip: 'Oficina: evoluir e equipar armas', ac: '#c8d8ff' },
  { a: 'golpes', ic: 'golpes', nome: 'Golpes', curto: 'Golpes', tip: 'Liberar, upar e equipar golpes especiais', ac: '#ffa040' },
  { a: 'recrutas', ic: 'recrutas', nome: 'Recrutas', curto: 'Recrutas', tip: 'Recrutas: fusão (5 iguais viram 1 da nota seguinte), camas e alojamento', ac: '#7ad0c8' },
  { a: 'pets', ic: 'pets', nome: 'Pets', curto: 'Pets', tip: 'Pets: fusão (5 iguais viram 1 da nota seguinte)', ac: '#f2b468' },
  { a: 'bestiary', ic: 'bestiary', nome: 'Bestiário', curto: 'Bestiário', tip: 'Cartas dos zumbis encontrados', ac: '#b98cff' },
  { a: 'conquistas', ic: 'conquistas', nome: 'Conquistas', curto: 'Conquistas', tip: 'Conquistas e lembranças dos mapas', ac: '#ffd23f' },
  { a: 'market', ic: 'market', nome: 'Mercado', curto: 'Mercado', tip: 'Comprar itens de expedição e armas', ac: '#ff6a70' },
  { a: 'drawer', ic: 'drawer', nome: 'Squad e diário', curto: 'Diário', tip: 'Squad e diário do abrigo', ac: '#e8b070' },
];

/** Tecla do atalho: 1–9 e o 10º item na tecla 0. */
const keyOf = (i: number) => String((i + 1) % 10);

let cssPx = 40, dpr = 1;
const img = (ic: string, css: number) => {
  const px = Math.round(css * dpr);
  return `<img class="dk-n" src="${menuIconURL(ic, px, 'n')}" width="${css}" height="${css}" alt="" draggable="false">`
    + `<img class="dk-h" src="${menuIconURL(ic, px, 'h')}" width="${css}" height="${css}" alt="" draggable="false">`;
};

/** HTML do dock (entra no lugar da antiga barra de ações). `sair` é o texto discreto ao lado de Opções. */
export function dockHtml(opts?: { sair?: boolean }): string {
  const sm = matchMedia('(max-width: 720px)').matches;
  dpr = Math.min(3, Math.max(1, Math.round((window.devicePixelRatio || 1) * 2) / 2));
  cssPx = sm ? 32 : 40;
  const tile = (it: DockItem, i: number) => { const k = keyOf(i); return `<button class="dk" type="button" data-a="${it.a}" data-k="${k}" style="--ac:${it.ac}"
      aria-label="${it.nome}" title="${it.tip} (tecla ${k})"${it.a === 'drawer' ? ' aria-expanded="false"' : ''}>
      <span class="dk-ic">${img(it.ic, cssPx)}</span><span class="dk-lb">${it.curto}</span>
      <kbd class="dk-key" aria-hidden="true">${k}</kbd><span class="dk-bd" hidden></span></button>`; };
  return `<div class="dk-row">${ITEMS.map(tile).join('')}
      <button class="dk dk-cfg" type="button" data-settings style="--ac:#a9c8f0" aria-label="Configurações" title="Configurações">
        <span class="dk-ic">${img('settings', cssPx)}</span><span class="dk-lb">Opções</span></button>
      ${opts?.sair ? '<button class="dk-sair" type="button" data-a="sair" title="Sair da conta">Sair</button>' : ''}
    </div>
    <button class="dk dk-col" type="button" data-a="collect" style="--ac:#7dff9a" hidden aria-label="Coletar tudo" title="Coletar a produção de todas as estruturas">
      <span class="dk-ic">${img('collect', cssPx)}</span><span class="dk-lb">Coletar</span><span class="dk-bd good"></span></button>
    <button class="dk-go" type="button" data-a="exp" aria-label="Expedição">
      <span class="dk-go-ic"><span class="moon-n">${img('exp', sm ? 40 : 52)}</span><span class="moon-b">${img('exp_lua', sm ? 40 : 52)}</span></span>
      <span class="dk-go-tx"><b>Expedição</b><small class="dk-go-sub"></small></span>
      <span class="dk-go-sheen" aria-hidden="true"></span></button>`;
}

const fmt = (ms: number) => {
  const m = Math.max(0, Math.ceil(ms / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m} min`;
};

interface Badge { t: string; cls: string; aria: string }
/** Badges a partir do estado (só o que as regras já calculam). */
export function dockBadges(s: GameState): Record<string, Badge | null> {
  const out: Record<string, Badge | null> = {};
  if (s.obra) out.build = { t: fmt(s.obra.fim - Date.now()), cls: 'time', aria: `obra em andamento, falta ${fmt(s.obra.fim - Date.now())}` };
  else {
    const n = STRUCT_IDS.filter((id) => buildBlock(s, id) === null).length;
    out.build = n ? { t: String(n), cls: 'gold', aria: `${n} ${n > 1 ? 'obras disponíveis' : 'obra disponível'}` } : null;
  }
  const d = damagedList(s).length;
  out.repair = d ? { t: String(d), cls: 'red', aria: `${d} ${d > 1 ? 'estruturas danificadas' : 'estrutura danificada'}` } : null;
  const w = s.armas.filter((x) => upgradeBlock(s, x.id) === null).length;
  out.weapons = w ? { t: String(w), cls: 'cyan', aria: `${w} ${w > 1 ? 'armas podem evoluir' : 'arma pode evoluir'}` } : null;
  const membros = ['hero', ...s.recs.map((r) => r.id)];
  const up = membros.some((m) => GOLPE_IDS.some((g) => upBlock(s, m, g) === null));
  out.golpes = up ? { t: 'UP', cls: 'gold', aria: 'tem golpe pra liberar ou upar' } : null;
  out.recrutas = fusionGroups(s, 'rec').some((g) => g.pronta) ? { t: 'FUSÃO', cls: 'cyan', aria: 'fusão pronta' } : null;
  out.pets = fusionGroups(s, 'pet').some((g) => g.pronta) ? { t: 'FUSÃO', cls: 'cyan', aria: 'fusão pronta' } : null;
  const cq = conqProntas(s).length;
  out.conquistas = cq ? { t: String(cq), cls: 'gold', aria: `${cq} ${cq > 1 ? 'conquistas prontas pra resgatar' : 'conquista pronta pra resgatar'}` } : null;
  const m = marketList(s).filter((x) => buyBlock(s, x.id) === null).length;
  out.market = m ? { t: String(m), cls: 'soft', aria: `${m} ${m > 1 ? 'itens compráveis' : 'item comprável'}` } : null;
  return out;
}

const last = new WeakMap<HTMLElement, string>();
/** Atualiza badges, coletar, expedição e o estado "aberto" (barato: só mexe no DOM quando o texto muda). */
export function updateDock(nav: HTMLElement, s: GameState): void {
  const b = dockBadges(s);
  for (const it of ITEMS) {
    const btn = nav.querySelector<HTMLElement>(`.dk[data-a="${it.a}"]`);
    if (!btn) continue;
    const bd = b[it.a] ?? null, key = bd ? bd.t + bd.cls : '';
    if (last.get(btn) === key) continue;
    last.set(btn, key);
    const el = btn.querySelector<HTMLElement>('.dk-bd')!;
    el.hidden = !bd;
    if (bd) { el.textContent = bd.t; el.className = 'dk-bd ' + bd.cls; }
    btn.setAttribute('aria-label', bd ? `${it.nome}: ${bd.aria}` : it.nome);
  }
  const col = nav.querySelector<HTMLButtonElement>('[data-a=collect]')!, n = pendingTotal(s);
  col.hidden = n <= 0;
  const cb = col.querySelector<HTMLElement>('.dk-bd')!;
  if (cb.textContent !== String(n)) { cb.textContent = String(n); col.setAttribute('aria-label', `Coletar tudo: ${n} prontos`); }
  const go = nav.querySelector<HTMLElement>('.dk-go')!;
  const remoto = textoContagemLua(serverNow(), s.luaAtacada);
  const blood = remoto ? remoto.includes('LUA DE SANGUE') : nextIsBloodMoon(s);
  const ms = blood ? 0 : msUntilBloodMoon();
  const sub = remoto ? remoto.replace(/<[^>]+>/g, '') : blood ? 'Lua de Sangue no céu' : `Lua de Sangue em ${fmt(ms)}`;
  const soon = !blood && ms < 30 * 60000;
  const k = sub + blood + soon;
  if (last.get(go) !== k) {
    last.set(go, k);
    go.classList.toggle('blood', blood);
    go.classList.toggle('soon', soon);
    go.querySelector('.dk-go-sub')!.textContent = sub;
    go.setAttribute('aria-label', `Expedição. ${sub}`);
  }
  // estado ativo: o botão cujo painel está aberto (o modal some ao fechar)
  const on = nav.querySelector<HTMLElement>('.dk.on');
  if (on && on.dataset.a !== 'drawer' && !document.querySelector('.modal')) on.classList.remove('on');
}

/** Marca o botão clicado como aberto. */
export function markDock(nav: HTMLElement, a: string, open = true): void {
  nav.querySelectorAll('.dk.on').forEach((x) => x.classList.remove('on'));
  if (open) nav.querySelector(`.dk[data-a="${a}"]`)?.classList.add('on');
}

/** Atalhos 1–9 e 0 (fora de campos de texto, sem modal aberto e com o dock ativo). Devolve o desligador. */
export function bindDockKeys(nav: HTMLElement): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (!/^[0-9]$/.test(e.key)) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (nav.hasAttribute('inert') || document.querySelector('.modal')) return;
    const btn = nav.querySelector<HTMLButtonElement>(`.dk[data-k="${e.key}"]`);
    if (!btn) return;
    e.preventDefault();
    btn.classList.add('press');
    window.setTimeout(() => btn.classList.remove('press'), 140);
    btn.click();
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
