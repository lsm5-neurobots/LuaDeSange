// Catálogo de todos os zumbis do jogo (jogo/zumbis.html): arte real (ART_EXP), animações, variações e números.
// Só leitura: não toca no save. Rode com `npm run dev` e abra /zumbis.html.
import './zumbis.css';
import { RARIDADE, ZOMBIES, raridadeDe, type ZombieDef, type ZombieId } from '../data/zombies';
import { MAPS } from '../data/maps';
import { RESOURCES, type ResId } from '../data/resources';

const A = (window as any).ART_EXP;
const K = 0.7; // mesma escala do jogo
A?.PIX?.setK?.(K);

const COMUM = ['comum', 'enluarado', 'plenilunar'], BOSS = ['normal', 'furia'];
const FORM_NOME: Record<string, string> = { comum: 'Comum', enluarado: 'Enluarado', plenilunar: 'Plenilunar', normal: 'Normal', furia: 'Fúria' };
const MAPA_NOME = (m: string) => (MAPS as any)[m]?.nome ?? ({ comum: 'Todos os mapas', futuro: 'Futuro' } as Record<string, string>)[m] ?? m;
const ORDEM_MAPA = ['marco_zero', 'olinda', 'pelourinho', 'veropeso', 'lapa', 'amazonia', 'pantanal', 'comum', 'futuro'];
const LOOP = new Set(['idle', 'walk', 'run', 'crawl', 'fly', 'float']);

type Def = ZombieDef & { id: ZombieId };
const defs: Def[] = (Object.keys(ZOMBIES) as ZombieId[]).map((id) => ({ ...ZOMBIES[id], id }));
const factory = (d: Def) => (d.art ? A?.[d.art] : null);

// ---------- quadros (cache por zumbi|forma|anim|quadro) ----------
const cache = new Map<string, HTMLCanvasElement | null>();
function frame(d: Def, form: string, an: string, fi: number): HTMLCanvasElement | null {
  const key = `${d.id}|${form}|${an}|${fi}`;
  if (cache.has(key)) return cache.get(key)!;
  const F = factory(d);
  let cv: HTMLCanvasElement | null = null;
  try {
    cv = F.framePose && A.TWEEN
      ? F.framePose(form, an, A.TWEEN.poseAt(F, an, fi, 0, LOOP.has(an)), `cat${an}${fi}`)
      : F.frame(form, an, fi, 5);
  } catch (e) { console.warn('quadro falhou', key, e); }
  cache.set(key, cv);
  return cv;
}
/** duração do quadro em ms (as fábricas usam s ou ms dependendo da época) */
function durMs(F: any, an: string, fi: number): number {
  const v = Number(F.ANIMS[an]?.dur?.(fi) ?? 0.1);
  return Math.max(40, v > 5 ? v : v * 1000);
}

// ---------- estado por cartão ----------
interface Card { mw?: number; mh?: number; d: Def; form: string; anim: string; fi: number; acc: number; cv: HTMLCanvasElement; vis: boolean; strip: boolean; el: HTMLElement }
const cards: Card[] = [];
let zoom = 2, play = true, fundo: 'noite' | 'claro' | 'xadrez' = 'noite';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
/** mapas em que o zumbi está nas ondas */
const apareceEm = (id: ZombieId) => ORDEM_MAPA.filter((m) => Object.values((MAPS as any)[m]?.ondas ?? {}).some((ws: any) => ws.some((w: string[]) => w.includes(id))));
const dropTxt = (d: Def) => Object.entries(d.drop ?? {}).map(([r, p]) => `${RESOURCES[r as ResId]?.nome ?? r} ${(p ?? 0) >= 1 ? '×' + p : Math.round((p ?? 0) * 100) + '%'}`).join(' · ') || '—';

function cardHtml(d: Def): string {
  const F = factory(d);
  const forms = d.boss ? BOSS : COMUM;
  const anims = F ? Object.keys(F.ANIMS) : [];
  const tag = d.boss === 'chefe' ? '<span class="tag chefe">Chefe</span>' : d.boss === 'mini' ? '<span class="tag mini">Mini boss</span>' : '<span class="tag">Comum</span>';
  return `<article class="card${d.boss ? ' boss' : ''}" id="z-${d.id}" data-id="${d.id}">
    <header><h3>${esc(d.nome)}</h3>${tag}</header>
    <div class="stage"><canvas></canvas>${F ? '' : '<p class="noart">Arte ainda não portada</p>'}</div>
    ${F ? `<div class="row forms" role="group" aria-label="Variação">${forms.map((f, i) => `<button data-form="${f}" aria-pressed="${i === 0}">${FORM_NOME[f]}</button>`).join('')}</div>
    <div class="row anims" role="group" aria-label="Animação">${anims.map((a, i) => `<button data-anim="${a}" aria-pressed="${i === 0}" title="${F.ANIMS[a].n} quadros">${esc(F.ANIMS[a].nome ?? a)} <small>${F.ANIMS[a].n}</small></button>`).join('')}</div>` : ''}
    <dl>
      <div><dt>Vida</dt><dd>${d.hp}</dd></div><div><dt>Dano</dt><dd>${d.dmg}</dd></div><div><dt>XP</dt><dd>${d.xp}</dd></div>
      <div class="wide"><dt>Raridade</dt><dd>${d.boss ? 'sempre (chefe da arena)' : `<span style="color:${RARIDADE[raridadeDe(d.id)].cor}">${RARIDADE[raridadeDe(d.id)].nome}</span> · ${Math.round(RARIDADE[raridadeDe(d.id)].chance * 100)}% das expedições`}</dd></div>
      <div class="wide"><dt>Aparece em</dt><dd>${apareceEm(d.id).map((m) => esc(MAPA_NOME(m))).join(' · ') || 'nenhum mapa ainda'}</dd></div>
      <div class="wide"><dt>Drop</dt><dd>${dropTxt(d)}</dd></div>
      <div class="wide"><dt>Arte</dt><dd><code>${d.art ?? '—'}</code> · ${anims.length} anims · ${anims.reduce((a, k) => a + F.ANIMS[k].n, 0) * forms.length} quadros</dd></div>
    </dl>
    <p class="desc">${esc(d.desc)}</p>
    ${F ? '<button class="strip-btn" data-strip>Ver todos os quadros</button><div class="strip" hidden></div>' : ''}
  </article>`;
}

function drawCard(c: Card): void {
  const g = c.cv.getContext('2d')!;
  const f = frame(c.d, c.form, c.anim, c.fi);
  const F = factory(c.d);
  // tamanho fixo por zumbi (maior quadro da arte) pra não pular entre animações
  // tamanho = maior entre a moldura da arte e o quadro gerado (plumas/props podem passar da moldura)
  const w = Math.max(c.mw ?? 0, Math.ceil(F.FW * K), f?.width ?? 0), h = Math.max(c.mh ?? 0, Math.ceil(F.FH * K), f?.height ?? 0);
  c.mw = w; c.mh = h;
  if (c.cv.width !== w || c.cv.height !== h) { c.cv.width = w; c.cv.height = h; }
  c.cv.style.width = w * zoom + 'px'; c.cv.style.height = h * zoom + 'px';
  g.clearRect(0, 0, w, h);
  if (f) g.drawImage(f, Math.round((w - f.width) / 2), Math.round(h - f.height));
}

function drawStrip(c: Card): void {
  const box = c.el.querySelector<HTMLElement>('.strip')!;
  const F = factory(c.d), n = F.ANIMS[c.anim].n;
  box.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const f = frame(c.d, c.form, c.anim, i);
    const fig = document.createElement('figure');
    if (f) { const cv = document.createElement('canvas'); cv.width = f.width; cv.height = f.height; cv.getContext('2d')!.drawImage(f, 0, 0); cv.style.width = f.width * Math.max(1, zoom - 1) + 'px'; fig.appendChild(cv); }
    fig.insertAdjacentHTML('beforeend', `<figcaption>${i + 1} · ${Math.round(durMs(F, c.anim, i))} ms${F.ANIMS[c.anim].hits?.[i] ? ' · golpe' : ''}</figcaption>`);
    box.appendChild(fig);
  }
}

function render(): void {
  const app = document.getElementById('app')!;
  if (!A) { app.innerHTML = '<p class="err">Não achei a arte (art/art-exp.js). Abra esta página pelo servidor do jogo: <code>npm run dev</code> → /zumbis.html</p>'; return; }
  const grupos = ORDEM_MAPA.map((m) => [m, defs.filter((d) => d.mapa === m)] as const).filter(([, l]) => l.length);
  const total = defs.length, comArte = defs.filter((d) => factory(d)).length;
  app.innerHTML = `
    <header class="top">
      <div><small>Lua de Sangue · catálogo de arte</small><h1>Zumbis</h1>
        <p>${total} zumbis · ${comArte} com arte · ${defs.filter((d) => d.boss === 'mini').length} mini bosses · ${defs.filter((d) => d.boss === 'chefe').length} chefes. Arte gerada na hora pela mesma fábrica do jogo.</p></div>
      <div class="ctl">
        <label>Zoom <select id="zoom">${[1, 2, 3, 4].map((z) => `<option ${z === zoom ? 'selected' : ''}>${z}</option>`).join('')}</select></label>
        <label>Fundo <select id="fundo"><option value="noite">Noite</option><option value="claro">Claro</option><option value="xadrez">Xadrez</option></select></label>
        <label>Filtro <select id="filtro"><option value="">Todos</option><option value="comum">Comuns</option><option value="mini">Mini bosses</option><option value="chefe">Chefes</option></select></label>
        <button id="play">❚❚ Pausar</button>
      </div>
      <nav>${grupos.map(([m, l]) => `<a href="#m-${m}">${esc(MAPA_NOME(m))} <small>${l.length} novos · ${defs.filter((d) => apareceEm(d.id).includes(m)).length} tipos</small></a>`).join('')}</nav>
    </header>
    <main>${grupos.map(([m, l]) => `<section id="m-${m}"><h2>${esc(MAPA_NOME(m))} <small class="h2s">estreiam aqui · o mapa tem ${defs.filter((d) => apareceEm(d.id).includes(m)).length} tipos</small></h2><div class="grid">${l.map(cardHtml).join('')}</div></section>`).join('')}</main>`;

  app.querySelectorAll<HTMLElement>('.card').forEach((el) => {
    const d = defs.find((x) => x.id === el.dataset.id)!, F = factory(d);
    if (!F) return;
    const c: Card = { d, form: d.boss ? 'normal' : 'comum', anim: Object.keys(F.ANIMS)[0], fi: 0, acc: 0, cv: el.querySelector('canvas')!, vis: false, strip: false, el };
    cards.push(c);
    el.addEventListener('click', (ev) => {
      const b = (ev.target as HTMLElement).closest('button');
      if (!b) return;
      if (b.dataset.form) { c.form = b.dataset.form; c.fi = 0; el.querySelectorAll('[data-form]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
      else if (b.dataset.anim) { c.anim = b.dataset.anim; c.fi = 0; c.acc = 0; el.querySelectorAll('[data-anim]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
      else if (b.hasAttribute('data-strip')) { c.strip = !c.strip; el.querySelector<HTMLElement>('.strip')!.hidden = !c.strip; b.textContent = c.strip ? 'Esconder quadros' : 'Ver todos os quadros'; }
      if (c.strip) drawStrip(c);
      drawCard(c);
    });
  });
  // só anima o que está na tela (chefes custam ~30 ms por quadro novo)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const c = cards.find((x) => x.el === e.target); if (!c) return;
    c.vis = e.isIntersecting; if (c.vis) drawCard(c);
  }), { rootMargin: '200px' });
  cards.forEach((c) => io.observe(c.el));

  const $ = <T extends HTMLElement>(s: string) => app.querySelector<T>(s)!;
  $('#zoom').addEventListener('change', (e) => { zoom = +(e.target as HTMLSelectElement).value; cards.forEach((c) => { drawCard(c); if (c.strip) drawStrip(c); }); });
  $('#fundo').addEventListener('change', (e) => { fundo = (e.target as HTMLSelectElement).value as typeof fundo; document.body.dataset.fundo = fundo; });
  $('#filtro').addEventListener('change', (e) => {
    const v = (e.target as HTMLSelectElement).value;
    app.querySelectorAll<HTMLElement>('.card').forEach((el) => { const d = ZOMBIES[el.dataset.id as ZombieId]; el.hidden = !!v && (v === 'comum' ? !!d.boss : d.boss !== v); });
    app.querySelectorAll<HTMLElement>('main section').forEach((s) => { s.hidden = ![...s.querySelectorAll<HTMLElement>('.card')].some((c) => !c.hidden); });
  });
  $('#play').addEventListener('click', (e) => { play = !play; (e.target as HTMLElement).textContent = play ? '❚❚ Pausar' : '▶ Animar'; });
  document.body.dataset.fundo = fundo;

  let last = performance.now();
  const tick = (t: number) => {
    const dt = Math.min(200, t - last); last = t;
    if (play) for (const c of cards) {
      if (!c.vis) continue;
      const F = factory(c.d), n = F.ANIMS[c.anim].n;
      c.acc += dt;
      let mudou = false;
      while (c.acc >= durMs(F, c.anim, c.fi)) { c.acc -= durMs(F, c.anim, c.fi); c.fi = (c.fi + 1) % n; mudou = true; }
      if (mudou) drawCard(c);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

render();
