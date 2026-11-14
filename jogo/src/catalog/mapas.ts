// Catálogo de todos os mapas do jogo (jogo/mapas.html): o cenário real (ART_EXP) de cada lugar, área por área.
// Só leitura: não toca no save. Rode com `npm run dev` e abra /mapas.html.
import './mapas.css';
import { MAPS, type MapDef } from '../data/maps';
import { ZOMBIES, type ZombieId } from '../data/zombies';

const A = (window as any).ART_EXP;
const ORDEM = ['marco_zero', 'olinda', 'pelourinho', 'veropeso', 'lapa', 'amazonia', 'pantanal'];
const MODOS = [['manha', 'Manhã'], ['tarde', 'Tarde'], ['anoitecer', 'Anoitecer'], ['noite', 'Noite'], ['lua', 'Lua de Sangue']] as const;
type Modo = (typeof MODOS)[number][0];
const VW = 384, VH = 216; // tela do jogo em unidades do mundo
const SPEED = 140; // unidades/s no "percorrer"

interface Area { id: string; name: string; short?: string; len: number; ref?: string; desc?: string; fights?: number[]; x0: number; x1: number; n: number }
const mapas = ORDEM.map((id) => (MAPS as any)[id] as MapDef).filter(Boolean).concat(Object.values(MAPS).filter((m) => !ORDEM.includes(m.id)));
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const lerHash = () => new URLSearchParams(location.hash.slice(1));

let modo: Modo = (lerHash().get('luz') as Modo) || 'noite';
let fg = true, luzes = true;
let atual: MapDef = mapas.find((m) => m.id === lerHash().get('mapa')) ?? mapas[0];
let cam = 0, playing = false;

// ---------- render (mesma composição do jogo: céu → cenário com tinta → janelas/halos → primeiro plano) ----------
const mk = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; return [c, g] as const; };
const [bgC, BG] = mk(960, 540), [fgC, FG] = mk(960, 540);
function render(M: any, mode: Modo, x: number, g: CanvasRenderingContext2D): void {
  const RS = M.RS || 2.5;
  M.setLight(mode, true);
  BG.setTransform(1, 0, 0, 1, 0, 0); BG.clearRect(0, 0, 960, 540);
  M.drawMid(BG, x); // antes do céu: avisa o cenário que o mid é desenhado à parte (senão o céu desenha de novo)
  const tint = M.TINT?.[mode];
  if (tint) { BG.globalCompositeOperation = 'source-atop'; BG.fillStyle = tint; BG.fillRect(0, 0, 960, 540); BG.globalCompositeOperation = 'source-over'; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 960, 540);
  M.drawSky(g, mode, x, 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bgC, 0, 0);
  if (luzes) {
    if (mode !== 'manha' && mode !== 'tarde') {
      g.save(); g.setTransform(RS, 0, 0, RS, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = mode === 'lua' ? 'rgba(255,90,60,.55)' : 'rgba(255,214,120,.55)';
      for (const w of M.WINDOWS ?? []) { const wx = w.x - x; if (w.lit && wx > -20 && wx < VW + 20) g.fillRect(wx, w.y, w.w, w.h); }
      g.restore();
    }
    g.save(); g.setTransform(RS, 0, 0, RS, 0, 0); M.drawLights?.(g, x, mode, 0); g.restore();
  }
  if (fg && M.drawFG) {
    FG.setTransform(1, 0, 0, 1, 0, 0); FG.clearRect(0, 0, 960, 540); FG.setTransform(RS, 0, 0, RS, 0, 0); M.drawFG(FG, x); FG.setTransform(1, 0, 0, 1, 0, 0);
    if (tint) { FG.globalCompositeOperation = 'source-atop'; FG.fillStyle = tint; FG.fillRect(0, 0, 960, 540); FG.globalCompositeOperation = 'source-over'; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(fgC, 0, 0);
  }
}

// ---------- fila de render (um quadro por vez; o cenário gera tiles sob demanda e é pesado) ----------
type Job = { key: string; run: () => void };
const fila: Job[] = []; let ocupado = false;
function enfileirar(key: string, run: () => void): void {
  const i = fila.findIndex((j) => j.key === key); if (i >= 0) fila.splice(i, 1);
  fila.push({ key, run }); bomba();
}
function bomba(): void {
  if (ocupado) return; const j = fila.shift(); if (!j) { $busy().hidden = true; return; }
  ocupado = true; $busy().hidden = false;
  setTimeout(() => { try { j.run(); } catch (e) { console.warn('render falhou', j.key, e); } ocupado = false; bomba(); }, 0);
}

// ---------- página ----------
const app = document.getElementById('app')!;
const $ = <T extends Element>(s: string) => app.querySelector(s) as T;
const $busy = () => $<HTMLElement>('.busy');
const modulo = (m: MapDef) => A?.[m.art];
const areasDe = (M: any): Area[] => (M?.AREAS ?? []) as Area[];
const zumbisDa = (m: MapDef, id: string) => [...new Set((m.ondas?.[id] ?? []).flat())] as ZombieId[];
const nomeZ = (z: ZombieId) => ZOMBIES[z]?.nome ?? z;
const ehArena = (m: MapDef, id: string) => zumbisDa(m, id).some((z) => ZOMBIES[z]?.boss);

function shell(): void {
  app.innerHTML = `<div class="top">
      <div><small>Lua de Sangue · catálogo de arte</small><h1>Mapas</h1>
        <p>${mapas.length} mapas, ${mapas.reduce((a, m) => a + areasDe(modulo(m)).length, 0)} áreas. Cenário gerado na hora pela mesma arte do jogo. <span class="links">· <a href="./zumbis.html">ver zumbis</a></span></p></div>
      <div class="ctl">
        <span>Luz</span>${MODOS.map(([k, n]) => `<button data-modo="${k}" aria-pressed="${k === modo}">${n}</button>`).join('')}
        <label><input type="checkbox" data-fg ${fg ? 'checked' : ''}> Primeiro plano</label>
        <label><input type="checkbox" data-luzes ${luzes ? 'checked' : ''}> Luzes</label>
      </div>
      <nav>${mapas.map((m) => `<a href="#mapa=${m.id}" data-mapa="${m.id}" aria-current="${m.id === atual.id}">${esc(m.nome)} <small>${areasDe(modulo(m)).length} áreas</small></a>`).join('')}</nav>
    </div><main></main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-modo]').forEach((b) => b.onclick = () => { modo = b.dataset.modo as Modo; app.querySelectorAll('[data-modo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); salvarHash(); redesenharTudo(); });
  $<HTMLInputElement>('[data-fg]').onchange = (e) => { fg = (e.target as HTMLInputElement).checked; redesenharTudo(); };
  $<HTMLInputElement>('[data-luzes]').onchange = (e) => { luzes = (e.target as HTMLInputElement).checked; redesenharTudo(); };
  app.querySelectorAll<HTMLAnchorElement>('[data-mapa]').forEach((a) => a.onclick = (e) => { e.preventDefault(); const m = mapas.find((x) => x.id === a.dataset.mapa); if (m) abrir(m); });
}

function salvarHash(): void { history.replaceState(null, '', `#mapa=${atual.id}&luz=${modo}`); }

let thumbs: { a: Area; cv: HTMLCanvasElement; vis: boolean; feito: string }[] = [];
let io: IntersectionObserver | null = null;

function abrir(m: MapDef): void {
  atual = m; playing = false; salvarHash();
  app.querySelectorAll('[data-mapa]').forEach((a) => a.setAttribute('aria-current', String((a as HTMLElement).dataset.mapa === m.id)));
  const M = modulo(m), areas = areasDe(M), main = $<HTMLElement>('main');
  fila.length = 0;
  if (!M) { main.innerHTML = `<p class="err">Cenário <code>${esc(m.art)}</code> não está no pacote de arte (rode <code>npm run art</code>).</p>`; return; }
  const world = M.WORLD ?? (areas.at(-1)?.x1 ?? VW), maxCam = Math.max(0, world - VW);
  cam = 0;
  main.innerHTML = `<section class="mapa-head"><h2>${esc(m.nome)}</h2><p>${esc(m.desc)}</p>
      <div class="meta">${areas.length} áreas · percurso de ${Math.round(world)} unidades (~${Math.round(world / VW)} telas) · nível recomendado ${m.nivelRecomendado}${m.requer ? ` · libera após ${esc((MAPS as any)[m.requer]?.nome ?? m.requer)}` : ''}</div></section>
    <section class="viewer">
      <div class="screen"><canvas class="big" width="960" height="540"></canvas><div class="hud"></div><div class="busy" hidden>gerando cenário…</div></div>
      <div class="scrub"><input type="range" min="0" max="${Math.round(maxCam)}" step="1" value="0" aria-label="Posição no mapa">
        <div class="ticks">${areas.map((a, i) => `<button data-ir="${i}" style="left:${(a.x0 / world) * 100}%" title="${esc(a.name)}">${esc(a.short ?? a.name)}</button>`).join('')}</div></div>
      <div class="vrow"><button data-play>▶ Percorrer</button><button data-prev>◀ Área anterior</button><button data-next>Próxima área ▶</button><span>Arraste a barra ou use ← → (Shift = tela inteira).</span></div>
    </section>
    <section class="areas">${areas.map((a, i) => {
      const zs = zumbisDa(m, a.id), arena = ehArena(m, a.id);
      return `<article class="area${arena ? ' arena' : ''}" data-i="${i}"><header><h3>${i + 1}. ${esc(a.name)}</h3>${arena ? '<span class="tag chefe">Arena do chefe</span>' : `<span class="tag">${(a.fights ?? []).length} lutas</span>`}</header>
        <canvas class="thumb" width="480" height="270" title="Ver no visor"></canvas>
        ${a.ref ? `<p class="ref">${esc(a.ref)}</p>` : ''}<p class="desc">${esc(a.desc ?? '')}</p>
        <p class="zs"><b>Zumbis</b>${zs.length ? zs.map((z) => esc(nomeZ(z))).join(' · ') : '—'}</p></article>`; }).join('')}</section>`;

  const big = $<HTMLCanvasElement>('canvas.big'), bg = big.getContext('2d')!, range = $<HTMLInputElement>('input[type=range]'), hud = $<HTMLElement>('.hud');
  const areaEm = (x: number) => Math.max(0, areas.findIndex((a) => x + VW / 2 >= a.x0 && x + VW / 2 < a.x1));
  const pintarBig = () => enfileirar('big', () => {
    render(M, modo, cam, bg);
    const i = areaEm(cam); hud.textContent = `${i + 1}/${areas.length} · ${areas[i]?.name ?? ''}`;
    app.querySelectorAll('.ticks button').forEach((b, k) => b.classList.toggle('on', k === i));
  });
  const irPara = (x: number) => { cam = Math.max(0, Math.min(maxCam, Math.round(x))); range.value = String(cam); pintarBig(); };
  const irArea = (i: number) => { const a = areas[Math.max(0, Math.min(areas.length - 1, i))]; irPara(a.x0 + Math.max(0, (a.x1 - a.x0 - VW) / 2)); };
  range.oninput = () => irPara(+range.value);
  app.querySelectorAll<HTMLButtonElement>('[data-ir]').forEach((b) => b.onclick = () => irArea(+b.dataset.ir!));
  $<HTMLButtonElement>('[data-prev]').onclick = () => irArea(areaEm(cam) - 1);
  $<HTMLButtonElement>('[data-next]').onclick = () => irArea(areaEm(cam) + 1);
  const pb = $<HTMLButtonElement>('[data-play]');
  pb.onclick = () => { playing = !playing; pb.textContent = playing ? '❚❚ Pausar' : '▶ Percorrer'; if (playing) loop(); };
  let t0 = 0;
  const loop = () => { if (!playing || atual !== m) return; requestAnimationFrame((t) => {
    if (!t0) t0 = t; const dt = Math.min(0.1, (t - t0) / 1000); t0 = t;
    if (!ocupado) { cam += SPEED * dt; if (cam >= maxCam) { cam = maxCam; playing = false; pb.textContent = '▶ Percorrer'; } range.value = String(Math.round(cam)); render(M, modo, cam, bg); const i = areaEm(cam); hud.textContent = `${i + 1}/${areas.length} · ${areas[i]?.name ?? ''}`; }
    M.idle?.(6); loop(); }); };
  window.onkeydown = (e) => { if (atual !== m || (e.target as HTMLElement)?.tagName === 'INPUT' && (e.target as HTMLInputElement).type !== 'range') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); irPara(cam + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? VW : 48)); } };

  // galeria: cada área renderizada uma vez por luz, só quando aparece na tela
  io?.disconnect();
  thumbs = [...app.querySelectorAll<HTMLElement>('.area')].map((el) => {
    const a = areas[+el.dataset.i!], cv = el.querySelector('canvas')!;
    cv.onclick = () => { irArea(+el.dataset.i!); $<HTMLElement>('.viewer').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    return { a, cv, vis: false, feito: '' };
  });
  io = new IntersectionObserver((es) => { for (const e of es) { const t = thumbs.find((x) => x.cv === e.target); if (t) { t.vis = e.isIntersecting; if (t.vis) pintarThumb(t); } } }, { rootMargin: '300px' });
  thumbs.forEach((t) => io!.observe(t.cv));
  pintarBig();
  function pintarThumb(t: (typeof thumbs)[number]): void {
    const chave = `${modo}|${fg}|${luzes}`; if (t.feito === chave) return;
    enfileirar('t' + t.a.id, () => { if (atual !== m) return; const [c, g] = mk(960, 540); render(M, modo, t.a.x0 + Math.max(0, (t.a.x1 - t.a.x0 - VW) / 2), g);
      const tg = t.cv.getContext('2d')!; tg.imageSmoothingEnabled = true; tg.drawImage(c, 0, 0, 480, 270); t.feito = chave; });
  }
  redesenharThumbs = () => thumbs.filter((t) => t.vis).forEach(pintarThumb);
  redesenharBig = pintarBig;
}
let redesenharThumbs = () => {}, redesenharBig = () => {};
function redesenharTudo(): void { thumbs.forEach((t) => (t.feito = '')); redesenharBig(); redesenharThumbs(); }

if (!A) app.innerHTML = '<p class="err">Pacote de arte não carregou (public/art/art-exp.js). Rode <code>npm run art</code>.</p>';
else { shell(); abrir(atual); }
