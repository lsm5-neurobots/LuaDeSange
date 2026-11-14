// Criação do recruta inicial: prévia animada + opções geradas de HEROI.OPT / HEROI.CAT.
import './create.css';
import type { Screen } from '../../core/router';
import { go } from '../../core/router';
import { startLoop, type Loop } from '../../core/loop';
import { h, esc } from '../../core/dom';
import { HUB } from '../../art/legacy';
import { ShelterScene } from '../shelter/scene';
import '../screens/shelter.css';
import { G, addLog, mutate, startNewGame, type HeroCfg } from '../../game/state';

const R = (g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, hh); };

type Group = { key: string; label: string; kind: 'seg' | 'sw'; src: 'OPT' | 'CAT'; from: string };
const GROUPS: Group[] = [
  { key: 'corpo', label: 'Corpo', kind: 'seg', src: 'OPT', from: 'corpo' },
  { key: 'pele', label: 'Tom de pele', kind: 'sw', src: 'CAT', from: 'pele' },
  { key: 'cabelo', label: 'Cabelo', kind: 'seg', src: 'OPT', from: 'cabelo' },
  { key: 'cabeloCor', label: 'Cor do cabelo', kind: 'sw', src: 'CAT', from: 'cabeloCor' },
  { key: 'barba', label: 'Barba', kind: 'seg', src: 'OPT', from: 'barba' },
  { key: 'sobr', label: 'Sobrancelha', kind: 'seg', src: 'OPT', from: 'sobr' },
  { key: 'olhos', label: 'Olhos', kind: 'sw', src: 'CAT', from: 'olhos' },
  { key: 'top', label: 'Parte de cima', kind: 'seg', src: 'OPT', from: 'top' },
  { key: 'topCor', label: 'Cor da roupa', kind: 'sw', src: 'CAT', from: 'roupa' },
  { key: 'calca', label: 'Parte de baixo', kind: 'seg', src: 'OPT', from: 'calca' },
  { key: 'calcaCor', label: 'Cor da calça', kind: 'sw', src: 'CAT', from: 'calcaCor' },
  { key: 'tenis', label: 'Tênis', kind: 'sw', src: 'CAT', from: 'tenis' },
  { key: 'acc', label: 'Acessório', kind: 'seg', src: 'OPT', from: 'acc' },
  { key: 'accCor', label: 'Cor do acessório', kind: 'sw', src: 'CAT', from: 'accCor' },
];

export function createScreen(): Screen {
  let loop: Loop | null = null;
  let scene: ShelterScene | null = null;

  return {
    mount(root) {
      try { G(); } catch { startNewGame(); }
      const H = HUB().HEROI;
      let cfg: HeroCfg = { ...H.DEFAULT, nome: 'Sobrevivente' };

      const optsHtml = GROUPS.map((gr) => {
        const data = H[gr.src][gr.from] as Record<string, string> | string[] | undefined;
        if (!data) return '';
        const entries: [string, string][] = Array.isArray(data) ? data.map((v) => [v, v]) : Object.entries(data);
        const btns = entries.map(([k, v]) => gr.kind === 'seg'
          ? `<button type="button" data-k="${gr.key}" data-v="${esc(k)}" aria-pressed="false">${esc(String(v))}</button>`
          : `<button type="button" data-k="${gr.key}" data-v="${esc(k)}" style="background:${esc(k)}" aria-label="${gr.label} ${esc(k)}" aria-pressed="false"></button>`).join('');
        return `<div class="og"><span class="lbl">${gr.label}</span><div class="${gr.kind}">${btns}</div></div>`;
      }).join('');

      // Tela cheia: o abrigo no breu ocupa a tela; o recruta se personaliza com uma luz fraca em volta.
      // O painel de personalização flutua dentro do jogo. Ao confirmar, ele acende a fogueira (abertura).
      const el = h(`<section class="cr" aria-label="Criação do recruta inicial">
        <div class="sh-stage"><div class="sh-view"><canvas class="pix" width="960" height="540" aria-label="Seu recruta no abrigo escuro"></canvas></div></div>
        <div class="cr-title"><small>Noite 1 · Seu primeiro recruta</small>Quem vai acender a fogueira?</div>
        <aside class="cr-panel">
          <div class="opts" id="opts">
            <div class="og"><label class="lbl" for="nome">Nome</label><input type="text" id="nome" maxlength="16" value="Sobrevivente" autocomplete="off"></div>
            ${optsHtml}
          </div>
          <div class="cr-actions"><button class="btn ghost" type="button" id="rand">Aleatório</button><button class="btn big" type="button" id="enter">Acender a fogueira</button></div>
        </aside>
      </section>`);
      root.appendChild(el);

      const sc = new ShelterScene(el.querySelector('canvas') as HTMLCanvasElement, {
        onStructClick() {}, onCollect() {}, onAttackStart() {}, onAttackEnd() {}, onIntroEnd() {},
      } as any);
      scene = sc;
      sc.startCreation(cfg);

      const nome = el.querySelector<HTMLInputElement>('#nome')!;
      const sync = () => {
        el.querySelectorAll<HTMLButtonElement>('#opts button[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(cfg[b.dataset.k!] === b.dataset.v)));
        sc.setPreview({ ...cfg, nome: nome.value });
      };
      sync();

      el.querySelector('#opts')!.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-k]');
        if (!b) return;
        cfg[b.dataset.k!] = b.dataset.v!;
        sync();
      });
      el.querySelector('#rand')!.addEventListener('click', () => { cfg = { ...H.random(), nome: nome.value }; sync(); });
      el.querySelector('#enter')!.addEventListener('click', () => {
        const n = (nome.value || 'Sobrevivente').trim().slice(0, 16) || 'Sobrevivente';
        mutate((s) => {
          s.hero = { ...cfg, nome: n };
          s.heroLv = 1; s.heroXp = 0;
          addLog(s, `<b>${esc(n)}</b> acendeu a fogueira do abrigo. A primeira noite começou.`);
        });
        go('shelter', { intro: 'acender' });
      });

      // 1º quadro depois de trazer do disco (cache persistente) o herói e o abrigo — senão ele engasga gerando
      const begin = () => { if (scene === sc && !loop) loop = startLoop((dt) => { sc.update(dt); sc.draw(); }); };
      void sc.prepare().then(begin, begin);
    },
    unmount() { loop?.stop(); loop = null; scene?.dispose(); scene = null; },
  };
}
