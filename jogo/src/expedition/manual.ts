// Entrada do modo manual: só existe enquanto a expedição manual está montada.
// O abrigo tem o próprio listener e o tira no dispose; aqui o destroy da expedição faz o mesmo.
import type { World } from './world';
import { esc } from '../core/dom';

export type ManualAct = 'j' | 'k' | 'l' | 'u' | 'i' | 'o';

export interface ManualPad {
  destroy(): void;
  /** -1..1; zero com modal, diálogo, puzzle ou campo de texto focado */
  axes(): { x: number; y: number };
  /** um press (não o repeat). Some se a tela não pode receber o golpe. */
  take(a: ManualAct): boolean;
  /** tem tecla de golpe ainda não lida (não consome) */
  pressed(): boolean;
  /** descarta presses ainda não lidos (vasculhar, baú, modal) */
  flush(): void;
}

type Steer = 'l' | 'r' | 'u' | 'd';

function steerOf(key: string): Steer | null {
  switch (key.toLowerCase()) {
    case 'a': case 'arrowleft': return 'l';
    case 'd': case 'arrowright': return 'r';
    case 'w': case 'arrowup': return 'u';
    case 's': case 'arrowdown': return 'd';
    default: return null;
  }
}

function actOf(key: string): ManualAct | null {
  switch (key.toLowerCase()) {
    case 'j': return 'j';
    case 'k': return 'k';
    case 'l': return 'l';
    case 'u': return 'u';
    case 'i': return 'i';
    case 'o': return 'o';
    default: return null;
  }
}

/** Modal, fala, escolha, puzzle ou digitação: o boneco não anda e o golpe não sai. */
export function manualBlocked(): boolean {
  if (document.querySelector('.modal, .xdlg, .xchoice, .xroll, .xp-overlay.on')) return true;
  const t = document.activeElement;
  if (t instanceof HTMLElement && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return true;
  return false;
}

const PADS = new WeakMap<World, ManualPad>();
export const padOf = (w: World) => PADS.get(w);
export function attachPad(w: World, p: ManualPad): void { PADS.set(w, p); }

export function bindManual(): ManualPad {
  const held = new Set<Steer>();
  const pending = new Set<ManualAct>();
  const drop = () => { held.clear(); pending.clear(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.type === 'keyup') {
      const s = steerOf(e.key);
      if (s) held.delete(s);
      return;
    }
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (manualBlocked()) { pending.clear(); return; }
    const s = steerOf(e.key);
    if (s) { held.add(s); e.preventDefault(); return; }
    // espaço não golpeia; só não deixa a página rolar nem apertar o botão focado
    if (e.key === ' ') { e.preventDefault(); return; }
    const a = actOf(e.key);
    if (a) { pending.add(a); e.preventDefault(); }
  };
  const onVis = () => { if (document.hidden) drop(); };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKey, true);
  window.addEventListener('blur', drop);
  document.addEventListener('visibilitychange', onVis);
  const pad: ManualPad = {
    destroy() {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('blur', drop);
      document.removeEventListener('visibilitychange', onVis);
      drop();
    },
    axes() {
      if (manualBlocked()) { pending.clear(); return { x: 0, y: 0 }; }
      const x = (held.has('r') ? 1 : 0) - (held.has('l') ? 1 : 0);
      const y = (held.has('d') ? 1 : 0) - (held.has('u') ? 1 : 0);
      return { x, y };
    },
    take(a) {
      if (manualBlocked()) { pending.clear(); return false; }
      if (!pending.has(a)) return false;
      pending.delete(a);
      return true;
    },
    pressed() {
      if (manualBlocked()) { pending.clear(); return false; }
      return pending.size > 0;
    },
    flush() { pending.clear(); },
  };
  return pad;
}

const SPEC = ['U', 'I', 'O'] as const;

/** Faixa curta da luta. Some no automático (o engine nem cria o elemento). */
export function manualKeysHtml(
  slots: { nome: string; pronto: number }[],
  interact: string | null,
  cap: number,
): string {
  const j = interact
    ? `<span class="hot"><kbd>J</kbd> ${esc(interact)}</span>`
    : `<span><kbd>J</kbd> leve</span>`;
  const on = slots.slice(0, SPEC.length).map((g, i) => {
    const cls = g.pronto >= 1 ? '' : 'wait';
    return `<span class="${cls}"><kbd>${SPEC[i]}</kbd> ${esc(g.nome)}</span>`;
  }).join('');
  const vazio = slots.length < cap
    ? `<span class="wait">${slots.length ? 'slot vazio: equipa em Golpes, no abrigo' : 'equipa em Golpes, no abrigo'}</span>`
    : '';
  return `<span><kbd>WASD</kbd> <kbd>setas</kbd> andar</span>${j}<span><kbd>K</kbd> pesado</span><span><kbd>L</kbd> esquiva</span>${on}${vazio}`;
}
