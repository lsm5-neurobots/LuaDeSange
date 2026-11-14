// Modal simples: overlay + painel. Fecha com Esc ou clique fora (se closable).
import { h } from '../../core/dom';

export interface ModalHandle { el: HTMLElement; body: HTMLElement; close(): void }

export function openModal(opts: { title: string; kicker?: string; html?: string; closable?: boolean; wide?: boolean; onClose?: () => void }): ModalHandle {
  const el = h(`<div class="modal on" role="dialog" aria-modal="true">
    <div class="mbox${opts.wide ? ' wide' : ''}">
      <h2>${opts.kicker ? `<small>${opts.kicker}</small>` : ''}${opts.title}</h2>
      <div class="mbody">${opts.html ?? ''}</div>
      ${opts.closable === false ? '' : '<button class="btn ghost mclose" type="button">Fechar</button>'}
    </div></div>`);
  document.body.appendChild(el);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && opts.closable !== false) close(); };
  const close = () => {
    el.remove();
    document.removeEventListener('keydown', onKey);
    opts.onClose?.();
  };
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => { if (e.target === el && opts.closable !== false) close(); });
  el.querySelector('.mclose')?.addEventListener('click', close);
  return { el, body: el.querySelector('.mbody') as HTMLElement, close };
}
