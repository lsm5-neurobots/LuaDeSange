import { on } from '../../core/events';

let timer = 0;
export function toast(text: string, ms = 1800): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('on', !!text);
  clearTimeout(timer);
  if (text) timer = window.setTimeout(() => el.classList.remove('on'), ms);
}
on('toast', ({ text, ms }) => toast(text, ms));
