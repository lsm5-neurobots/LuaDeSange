// Modal de Configurações (engrenagem no abrigo e na expedição): presets gráficos + Automático.
import './settings.css';
import { openModal, type ModalHandle } from './modal';
import { settings, type Modo } from '../../core/settings';

/** Engrenagem em pixel art (grade 12×12, cor = currentColor). */
const GEAR_PX = [
  '....XXXX....',
  '..X.XXXX.X..',
  '.XXXXXXXXXX.',
  '..XXXXXXXX..',
  'XXXXX..XXXXX',
  'XXXX....XXXX',
  'XXXX....XXXX',
  'XXXXX..XXXXX',
  '..XXXXXXXX..',
  '.XXXXXXXXXX.',
  '..X.XXXX.X..',
  '....XXXX....',
];
export const GEAR_SVG = `<svg class="ico-gear" viewBox="0 0 12 12" width="18" height="18" aria-hidden="true" shape-rendering="crispEdges">${
  GEAR_PX.flatMap((row, y) => [...row].map((c, x) => (c === 'X' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ''))).join('')}</svg>`;

/** Botão pronto pra barra de ações (abre o modal ao clicar). */
export const gearButton = (cls = 'btn ghost') => `<button class="${cls} gear-btn" type="button" data-settings aria-label="Configurações" title="Configurações">${GEAR_SVG}</button>`;

const OPTS: { id: Modo; nome: string; desc: string }[] = [
  { id: 'auto', nome: 'Automático', desc: 'Começa no máximo e baixa sozinho se o jogo ficar abaixo de 30 quadros por segundo.' },
  { id: 'qualidade', nome: 'Qualidade', desc: 'Tudo ligado: clima, sangue, brilhos de luz, poeira, sombras e céu animado.' },
  { id: 'equilibrado', nome: 'Equilibrado', desc: 'Sem poeira e sem manchas na parede; clima sem poças com reflexo.' },
  { id: 'desempenho', nome: 'Desempenho', desc: 'Só o essencial: sem clima, sangue, brilhos, poeira, faíscas, sombras e céu parado.' },
];
const NOME: Record<string, string> = { qualidade: 'Qualidade', equilibrado: 'Equilibrado', desempenho: 'Desempenho' };

let open: ModalHandle | null = null;
export function openSettings(): void {
  if (open && open.el.isConnected) return;
  const html = () => `<div class="cfg" role="radiogroup" aria-label="Gráficos">
      ${OPTS.map((o) => `<button type="button" class="cfg-opt" role="radio" data-modo="${o.id}" aria-checked="${settings.modo === o.id}">
        <b>${o.nome}${o.id === 'auto' && settings.modo === 'auto' ? ` <span class="cfg-now">usando ${NOME[settings.preset]}</span>` : ''}</b><small>${o.desc}</small></button>`).join('')}
    </div>
    <p class="cfg-note">Nada disso muda as regras: só o que é enfeite. Vale na hora e fica salvo neste navegador.</p>`;
  open = openModal({ title: 'Configurações', kicker: 'Gráficos', html: html(), onClose: () => { open = null; off(); } });
  const m = open;
  m.body.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-modo]') as HTMLElement | null;
    if (b) settings.set(b.dataset.modo as Modo);
  });
  const off = settings.subscribe(() => { m.body.innerHTML = html(); });
}

/** Liga os botões [data-settings] dentro de `root` (delegação). */
export function bindSettings(root: HTMLElement): void {
  root.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-settings]')) openSettings(); });
}
