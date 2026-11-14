// Caixa de diálogo estilo beat 'em up dentro do palco da expedição: retrato, placa com nome + nota,
// texto letra a letra (30 ms), avança sozinho depois de um tempo (idle) e tem botão de pular.
import './dialog.css';
import { esc } from '../../core/dom';
import type { Grade } from '../../data/grades';
import { gradeBadge } from '../widgets/grade';

export interface DialogLine {
  nome: string;
  /** cor de quem fala (placa e borda) */
  cor: string;
  nota?: Grade;
  retrato?: HTMLCanvasElement | null;
  texto: string;
  /** retrato à esquerda (padrão) ou à direita */
  lado?: 'l' | 'r';
}

export interface DialogOpts {
  onEnd?: (skipped: boolean) => void;
  /** enquanto true, o texto e o avanço automático esperam */
  paused?: () => boolean;
  /** multiplicador de ritmo (velocidade do jogo) */
  pace?: () => number;
  /** ms segurando a fala inteira antes de avançar sozinho */
  hold?: number;
  /** rótulo pequeno ao lado do nome (ex.: "Sobrevivente") */
  kicker?: string;
}

export interface DialogHandle { el: HTMLElement; close(): void; next(): void }

const TICK = 30;

export function openDialog(host: HTMLElement, lines: DialogLine[], o: DialogOpts = {}): DialogHandle {
  const el = document.createElement('div');
  el.className = 'xdlg';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `<div class="xdlg-box">
      <div class="xdlg-face"></div>
      <div class="xdlg-main">
        <div class="xdlg-plate"><span class="xdlg-name"></span><span class="xdlg-grade"></span>${o.kicker ? `<small class="xdlg-kick">${esc(o.kicker)}</small>` : ''}</div>
        <p class="xdlg-text"></p>
        <div class="xdlg-foot"><span class="xdlg-dots"></span><i class="xdlg-next" aria-hidden="true">▼</i></div>
      </div>
      <button class="xdlg-skip" type="button" title="Pular conversa">Pular »</button>
    </div>`;
  host.appendChild(el);
  const q = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;
  const box = q('.xdlg-box'), face = q('.xdlg-face'), nameEl = q('.xdlg-name'), gradeEl = q('.xdlg-grade'), textEl = q('.xdlg-text'), dots = q('.xdlg-dots');
  let i = -1, shown = 0, holdT = 0, done = false, timer = 0;
  const pace = () => Math.max(1, Math.min(4, o.pace?.() ?? 1));

  function show(k: number) {
    i = k; shown = 0; holdT = 0;
    const L = lines[i];
    box.style.setProperty('--sc', L.cor);
    box.classList.toggle('r', L.lado === 'r');
    nameEl.textContent = L.nome;
    gradeEl.innerHTML = L.nota ? gradeBadge(L.nota) : '';
    face.innerHTML = '';
    face.classList.toggle('empty', !L.retrato);
    if (L.retrato) { face.appendChild(L.retrato); if (L.nota) face.insertAdjacentHTML('beforeend', gradeBadge(L.nota, 'corner')); }
    textEl.textContent = '';
    box.classList.remove('full');
    dots.textContent = lines.length > 1 ? lines.map((_, j) => (j === i ? '●' : '○')).join(' ') : '';
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  }

  function end(skipped: boolean) {
    if (done) return;
    done = true;
    clearInterval(timer);
    el.classList.add('out');
    setTimeout(() => el.remove(), 220);
    o.onEnd?.(skipped);
  }

  function next() {
    if (done) return;
    const L = lines[i];
    if (shown < L.texto.length) { shown = L.texto.length; textEl.textContent = L.texto; box.classList.add('full'); return; }
    if (i + 1 >= lines.length) end(false); else show(i + 1);
  }

  timer = window.setInterval(() => {
    if (done || o.paused?.()) return;
    const L = lines[i];
    if (shown < L.texto.length) {
      shown = Math.min(L.texto.length, shown + pace());
      textEl.textContent = L.texto.slice(0, shown);
      if (shown >= L.texto.length) box.classList.add('full');
      return;
    }
    holdT += TICK * pace();
    if (holdT >= (o.hold ?? 1700)) next();
  }, TICK);

  box.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('.xdlg-skip')) return; next(); });
  q('.xdlg-skip').addEventListener('click', (e) => { e.stopPropagation(); end(true); });
  show(0);
  return { el, close: () => end(true), next };
}

/**
 * Rolagem da chance de recrutar: barra com a faixa verde (= chance), marcador corre e para no valor sorteado.
 * Não pausa o jogo. `roll` e `chance` em 0..1; sucesso = roll < chance.
 */
export function showRecruitRoll(host: HTMLElement, o: { nome: string; nota?: Grade; chance: number; roll: number; desempenho: number; onEnd?: () => void }): void {
  const ok = o.roll < o.chance, pct = (v: number) => Math.round(v * 100) + '%';
  const el = document.createElement('div');
  el.className = 'xroll';
  el.innerHTML = `<div class="xroll-box">
      <div class="xroll-head"><b>${esc(o.nome)}</b> ${o.nota ? gradeBadge(o.nota) : ''}<span>desempenho <b>${pct(o.desempenho)}</b></span></div>
      <div class="xroll-lbl">Chance de recrutar <b>${pct(o.chance)}</b></div>
      <div class="xroll-bar"><i class="xroll-zone" style="width:${o.chance * 100}%"></i><i class="xroll-mark"></i></div>
      <div class="xroll-res"></div>
    </div>`;
  host.appendChild(el);
  const mark = el.querySelector('.xroll-mark') as HTMLElement, res = el.querySelector('.xroll-res') as HTMLElement;
  const t0 = performance.now(), dur = 1500;
  const step = (now: number) => {
    if (!el.isConnected) return;
    const t = Math.min(1, (now - t0) / dur);
    // marcador vai e volta algumas vezes desacelerando até parar no valor sorteado
    const ease = 1 - Math.pow(1 - t, 3), sweeps = 2.5 * (1 - ease);
    const base = o.roll + Math.sin(ease * Math.PI * 5) * sweeps * 0.4;
    mark.style.left = Math.max(0, Math.min(100, (t >= 1 ? o.roll : base) * 100)) + '%';
    if (t < 1) { requestAnimationFrame(step); return; }
    res.textContent = ok ? 'RECRUTADO!' : 'NÃO DEU…';
    el.classList.add(ok ? 'ok' : 'bad');
    setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); o.onEnd?.(); }, 260); }, 1300);
  };
  requestAnimationFrame(step);
}

/**
 * Escolha Aceitar/Recusar a missão do encontro. Contagem curta (`segundos`, tempo real) escolhe sozinha o
 * `padrao` (o plano da expedição: recrutar ligado = aceitar). Espera enquanto `paused()`.
 */
export function showChoice(host: HTMLElement, o: {
  titulo: string; texto: string; padrao: boolean; segundos?: number;
  paused?: () => boolean; onPick: (aceitou: boolean, auto: boolean) => void;
}): { el: HTMLElement; pick(aceitou: boolean): void } {
  const el = document.createElement('div');
  el.className = 'xchoice';
  el.setAttribute('role', 'dialog');
  el.innerHTML = `<div class="xchoice-box">
      <div class="xchoice-k">${esc(o.titulo)}</div>
      <p class="xchoice-t">${esc(o.texto)}</p>
      <div class="xchoice-btns">
        <button type="button" class="xchoice-b ok${o.padrao ? ' def' : ''}" data-c="1">Aceitar<span class="cd"></span></button>
        <button type="button" class="xchoice-b no${o.padrao ? '' : ' def'}" data-c="0">Recusar<span class="cd"></span></button>
      </div>
      <div class="xchoice-bar"><i></i></div>
    </div>`;
  host.appendChild(el);
  const total = (o.segundos ?? 4) * 1000, bar = el.querySelector('.xchoice-bar i') as HTMLElement;
  const cdEl = el.querySelector(`.xchoice-b.def .cd`) as HTMLElement;
  let left = total, done = false;
  const pick = (aceitou: boolean, auto = false) => {
    if (done) return;
    done = true; clearInterval(timer);
    el.classList.add('out', aceitou ? 'is-ok' : 'is-no');
    setTimeout(() => el.remove(), 240);
    o.onPick(aceitou, auto);
  };
  const timer = window.setInterval(() => {
    if (done || o.paused?.()) return;
    left -= TICK; // tempo real (não acelera com 4×/8×): dá tempo de o jogador ler e escolher
    bar.style.width = Math.max(0, left / total) * 100 + '%';
    cdEl.textContent = ` (${Math.max(0, Math.ceil(left / 1000))})`;
    if (left <= 0) pick(o.padrao, true);
  }, TICK);
  cdEl.textContent = ` (${Math.ceil(total / 1000)})`;
  el.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-c]'); if (b) pick(b.dataset.c === '1'); });
  return { el, pick: (a) => pick(a) };
}
