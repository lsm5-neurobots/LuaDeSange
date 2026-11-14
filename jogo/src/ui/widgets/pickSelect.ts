// Select customizado com retrato (membros e pets do squad). HTML puro pra usar dentro de `live()`:
// o botão tem data-act="psel" (abre/fecha) e cada opção data-act=<key> data-id=<id>.
// `bindPickSelect` cuida de fechar ao clicar fora, Esc (sem fechar o modal) e setas ↑/↓.
import './pickSelect.css';
import { esc } from '../../core/dom';

export interface PickOpt {
  id: string;
  nome: string;
  img?: string;
  /** HTML extra ao lado do nome (selo de nota) */
  badge?: string;
  /** linha de baixo (nível, arma, espécie...) */
  sub?: string;
  disabled?: boolean;
  /** motivo de estar desabilitado */
  why?: string;
}

const body = (o: PickOpt) =>
  `${o.img ? `<img class="px" src="${o.img}" alt="">` : '<span class="psel-none" aria-hidden="true">—</span>'}
   <span class="psel-tx"><b>${esc(o.nome)} ${o.badge ?? ''}</b>${o.sub ? `<small>${o.sub}</small>` : ''}${o.why ? `<small class="psel-why">${esc(o.why)}</small>` : ''}</span>`;

export function pickSelectHtml(key: string, label: string, opts: PickOpt[], cur: string | null, open: boolean, empty = ''): string {
  const sel = opts.find((o) => o.id === (cur ?? '')) ?? null;
  const list = open
    ? `<div class="psel-list" role="listbox" aria-label="${esc(label)}">${opts.length ? opts.map((o) => {
      const on = o.id === (cur ?? '');
      return `<button type="button" class="psel-opt" role="option" data-act="${key}" data-id="${o.id}" aria-selected="${on}" ${o.disabled ? 'disabled' : ''}>${body(o)}${on ? '<span class="psel-ck" aria-hidden="true">✓</span>' : ''}</button>`;
    }).join('') : `<div class="psel-empty">${empty}</div>`}</div>`
    : '';
  return `<div class="psel${open ? ' open' : ''}">
    <span class="lbl">${esc(label)}</span>
    <button type="button" class="psel-btn" data-act="psel" data-id="${key}" aria-haspopup="listbox" aria-expanded="${open}">
      ${sel ? body(sel) : `<span class="psel-tx"><b>${esc(empty || 'Escolher')}</b></span>`}<span class="psel-car" aria-hidden="true">▾</span>
    </button>${list}</div>`;
}

/** Liga fechar-ao-clicar-fora, Esc e setas. `getOpen/setOpen` = estado do dono (qual select está aberto). */
export function bindPickSelect(root: HTMLElement, getOpen: () => string | null, setOpen: (k: string | null) => void): void {
  const fecharDom = () => {
    setOpen(null);
    root.querySelectorAll('.psel.open').forEach((p) => {
      p.classList.remove('open');
      p.querySelector('.psel-list')?.remove();
      p.querySelector('.psel-btn')?.setAttribute('aria-expanded', 'false');
    });
  };
  // roda depois do handler do live(): se acabou de abrir, foca a opção marcada
  root.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    if (!getOpen()) return;
    if (!t.closest('.psel')) { fecharDom(); return; }
    const o = root.querySelector<HTMLElement>('.psel.open .psel-opt[aria-selected=true]:not(:disabled), .psel.open .psel-opt:not(:disabled)');
    o?.focus({ preventScroll: true });
    o?.scrollIntoView({ block: 'nearest' });
  });
  const onKey = (e: KeyboardEvent) => {
    if (!root.isConnected) { document.removeEventListener('keydown', onKey, true); return; }
    const k = getOpen();
    if (!k) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation();
      fecharDom();
      root.querySelector<HTMLElement>(`.psel-btn[data-id="${k}"]`)?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const os = [...root.querySelectorAll<HTMLElement>('.psel.open .psel-opt:not(:disabled)')];
      if (!os.length) return;
      e.preventDefault();
      const i = os.indexOf(document.activeElement as HTMLElement);
      const n = i < 0 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : -1) + os.length) % os.length;
      os[n].focus();
    }
  };
  document.addEventListener('keydown', onKey, true);
}
