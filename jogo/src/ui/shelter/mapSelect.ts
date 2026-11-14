// Seleção de destino da expedição: cartão por mapa com prévia do cenário e bestiário embaixo
// (zumbis já derrotados aparecem em cor; os ainda não derrotados, só a silhueta).
import { MAPS, type MapDef } from '../../data/maps';
import { ZOMBIES, type ZombieId } from '../../data/zombies';
import { EXP } from '../../art/legacy';
import { frameStore } from '../../art/frameStore';
import type { WarmJob } from '../../expedition/warm';
import { esc } from '../../core/dom';
import type { GameState } from '../../game/state';
import { encounterOdds } from '../../game/encounters';
import { nextIsBloodMoon } from '../../game/bloodmoon';
import { loadPrefs } from './expPlan';
import './bestiary.css';

const SK = 1.25, RS = 2.5;
const cache = new Map<string, string>();

/** Guarda o data URL no cache da sessão e no persistente (IndexedDB, versionado pela arte). */
function keep(key: string, url: string): void {
  cache.set(key, url);
  if (url !== BLANK) frameStore.kvPut('ART_EXP', 'mod|' + key, url);
}
/** Todas as chaves de ícone/prévia que os modais usam. */
function modalKeys(): string[] {
  const out: string[] = [];
  for (const m of Object.values(MAPS)) out.push('map:' + m.id);
  for (const k of Object.keys(ZOMBIES) as ZombieId[]) {
    if (!ZOMBIES[k].art) continue;
    const f = ZOMBIES[k].boss ? 'normal' : 'comum';
    for (const sil of [true, false]) out.push(iconKey(k, sil, 72), iconKey(k, sil, 120, f));
  }
  return out;
}
let modalLoad: Promise<void> | null = null;
/** Carrega do disco os ícones/prévias já feitos em sessões anteriores (uma vez; sem storage, resolve vazio). */
export function preloadModalCache(): Promise<void> {
  if (!modalLoad) {
    const keys = modalKeys().filter((k) => !cache.has(k));
    modalLoad = frameStore.kvGet('ART_EXP', keys.map((k) => 'mod|' + k)).then((got) => {
      for (const [k, u] of Object.entries(got)) { const key = k.slice(4); if (!cache.has(key)) { cache.set(key, u); fill(key, u); } }
    }, () => {});
  }
  return modalLoad;
}

function withExpK<T>(k: number, fn: () => T): T {
  const pix = EXP().PIX, old = pix.getK();
  pix.setK(k);
  try { return fn(); } finally { pix.setK(old); }
}

// ---- geração preguiçosa: o modal abre na hora com placeholders e as imagens chegam em fatias (≤ 8 ms) ----
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const lzq: [string, () => string][] = [];
let lzT = 0;
function fill(key: string, url: string): void {
  document.querySelectorAll(`img[data-lz="${CSS.escape(key)}"]`).forEach((im) => { (im as HTMLImageElement).src = url; im.removeAttribute('data-lz'); });
}
function pumpLazy(): void {
  lzT = 0;
  const t0 = performance.now();
  while (lzq.length && performance.now() - t0 < 6) {
    const [k, gen] = lzq.shift()!;
    let u = cache.get(k);
    if (!u) { try { u = gen(); } catch { u = BLANK; } }
    fill(k, u);
  }
  // ícone pesado (chefe, máquina lenta): espera ~2× o que gastou — no máximo ~1/3 do tempo gerando, a tela segue fluida
  if (lzq.length) lzT = window.setTimeout(pumpLazy, Math.max(16, Math.min(600, (performance.now() - t0) * 2)));
}
/** Atributos src (+ data-lz) de uma imagem gerada sob demanda e cacheada por chave. */
function lazySrc(key: string, gen: () => string): string {
  const hit = cache.get(key);
  if (hit) return `src="${hit}"`;
  if (!lzq.some((q) => q[0] === key)) lzq.push([key, gen]);
  // antes de gerar, o que já existe no disco (sessões anteriores)
  void preloadModalCache().then(() => { if (!lzT && lzq.length) lzT = window.setTimeout(pumpLazy, 30); });
  return `src="${BLANK}" data-lz="${key}"`;
}
const iconKey = (k: ZombieId, silhouette: boolean, px: number, form?: string) => k + (silhouette ? ':s' : ':c') + px + (form ?? '');
/** Igual a zombieIconURL, mas devolve `src="…"` com placeholder enquanto o ícone é gerado em segundo plano. */
export const zombieIconSrc = (k: ZombieId, silhouette: boolean, px = 72, form?: string) => lazySrc(iconKey(k, silhouette, px, form), () => zombieIconURL(k, silhouette, px, form));

// prévias de mapa: no worker (OffscreenCanvas), sem travar a página; sem worker, cai na geração normal em fatia própria
let worker: Worker | null | undefined;
function prevWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = typeof OffscreenCanvas !== 'undefined' ? new Worker(new URL('art/art-worker.js', document.baseURI)) : null;
    worker?.addEventListener('message', (e) => { const d = e.data; if (d?.t !== 'prev') return; const key = 'map:' + d.id; if (d.url) { keep(key, d.url); fill(key, d.url); } else { const m = MAPS[d.id as keyof typeof MAPS]; if (m) lazySrc(key, () => mapPreviewURL(m) ?? BLANK); } });
  } catch { worker = null; }
  return worker;
}
const asked = new Set<string>();
/** `src="…"` da prévia do mapa: do cache, ou placeholder enquanto o worker gera (nunca gera na thread da página). */
export function mapPreviewSrc(m: MapDef): string {
  const key = 'map:' + m.id, hit = cache.get(key);
  if (hit) return `src="${hit}"`;
  const wk = prevWorker();
  if (!wk) return lazySrc(key, () => mapPreviewURL(m) ?? BLANK);
  if (!asked.has(m.id)) {
    asked.add(m.id);
    void preloadModalCache().then(() => { const u = cache.get(key); if (u) fill(key, u); else wk.postMessage({ t: 'prev', id: m.id, art: m.art, k: SK, rs: RS }); });
  }
  return `src="${BLANK}" data-lz="${key}"`;
}

/**
 * Pré-geração dos ícones dos modais (cartões de mapa e bestiário) no tempo livre do abrigo, pra abrir sem engasgo.
 * Gera as duas variantes (cor/silhueta): o quadro do zumbi é o mesmo, a variante custa pouco.
 */
export function modalIconJobs(): WarmJob[] {
  const out: WarmJob[] = [];
  const first = (k: ZombieId) => (ZOMBIES[k].boss ? 'normal' : 'comum');
  const ks = new Set<ZombieId>();
  for (const m of Object.values(MAPS)) for (const k of mapZombies(m)) ks.add(k);
  for (const k of Object.keys(ZOMBIES) as ZombieId[]) if (ZOMBIES[k].art) ks.add(k);
  for (const k of ks) {
    if (!ZOMBIES[k].art) continue;
    const c = ZOMBIES[k].boss ? 45 : 12, g = ZOMBIES[k].boss ? 'iconb' : 'icon'; // quadro + leitura + PNG
    for (const sil of [true, false]) {
      // again: se o quadro vier do disco, ainda falta montar o ícone (barato); ícone já salvo nem entra
      if (!cache.has(iconKey(k, sil, 72))) out.push({ k: 'ic|' + iconKey(k, sil, 72), g, c, again: true, run: () => { zombieIconURL(k, sil); } });
      if (!cache.has(iconKey(k, sil, 120, first(k)))) out.push({ k: 'ic|' + iconKey(k, sil, 120, first(k)), g, c, again: true, run: () => { zombieIconURL(k, sil, 120, first(k)); } });
    }
  }
  return out;
}
/** Pede ao worker as prévias de mapa que ainda não existem (sem custo na página). */
export function prewarmMapPreviews(): void { for (const m of Object.values(MAPS)) if ((EXP() as any)[m.art]) mapPreviewSrc(m); }

/** Zumbis do mapa na ordem em que aparecem: comuns, depois mini boss, depois chefe. */
export function mapZombies(m: MapDef): ZombieId[] {
  const seen: ZombieId[] = [];
  for (const area of Object.values(m.ondas)) for (const wave of area ?? []) for (const k of wave) if (!seen.includes(k as ZombieId)) seen.push(k as ZombieId);
  const rank = (k: ZombieId) => (ZOMBIES[k].boss === 'chefe' ? 2 : ZOMBIES[k].boss === 'mini' ? 1 : 0);
  return seen.sort((a, b) => rank(a) - rank(b));
}

/** Ícone do zumbi (quadro parado). Silhueta = mesmo recorte pintado de escuro com borda roxa. */
export function zombieIconURL(k: ZombieId, silhouette: boolean, px = 72, form?: string): string {
  const key = k + (silhouette ? ':s' : ':c') + px + (form ?? '');
  const hit = cache.get(key);
  if (hit) return hit;
  const d = ZOMBIES[k], F = d.art ? (EXP() as any)[d.art] : null;
  const out = document.createElement('canvas'); out.width = out.height = px;
  const g = out.getContext('2d')!; g.imageSmoothingEnabled = false;
  if (F) {
    const cv: HTMLCanvasElement = withExpK(SK, () => F.frame(form ?? (d.boss ? 'normal' : 'comum'), 'idle', 0, 5));
    // recorta só a área com pixels (quadros de chefe têm muita margem)
    const c = cv.getContext('2d')!, D = c.getImageData(0, 0, cv.width, cv.height).data;
    let x0 = cv.width, y0 = cv.height, x1 = 0, y1 = 0;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (D[(y * cv.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= x0) {
      const w = x1 - x0 + 1, h = y1 - y0 + 1, s = Math.min((px * 0.92) / h, (px * 0.92) / w);
      const dw = Math.round(w * s), dh = Math.round(h * s), dx = Math.round((px - dw) / 2), dy = px - dh - Math.round(px * 0.03);
      if (silhouette) {
        // borda clara (desenha deslocado em 4 direções) e depois o recorte preenchido de escuro
        const tmp = document.createElement('canvas'); tmp.width = tmp.height = px;
        const t = tmp.getContext('2d')!; t.imageSmoothingEnabled = false;
        t.drawImage(cv, x0, y0, w, h, dx, dy, dw, dh);
        t.globalCompositeOperation = 'source-in'; t.fillStyle = '#6b4fa0'; t.fillRect(0, 0, px, px);
        for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(tmp, ox, oy);
        t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, px, px);
        t.drawImage(cv, x0, y0, w, h, dx, dy, dw, dh);
        t.globalCompositeOperation = 'source-in'; t.fillStyle = '#0c0716'; t.fillRect(0, 0, px, px);
        g.drawImage(tmp, 0, 0);
      } else g.drawImage(cv, x0, y0, w, h, dx, dy, dw, dh);
    }
  }
  const u = out.toDataURL();
  keep(key, u);
  return u;
}

/** Prévia do cenário (área do meio do mapa, noite). null se a arte do mapa ainda não existe. */
export function mapPreviewURL(m: MapDef): string | null {
  const MAP = (EXP() as any)[m.art];
  if (!MAP) return null;
  const hit = cache.get('map:' + m.id);
  if (hit) return hit;
  const u = withExpK(SK, () => {
    if (!MAP._built) { MAP.build(); MAP._built = true; }
    const W = MAP.W ?? 384, H = MAP.H ?? 216, ar = MAP.AREAS?.[Math.floor((MAP.AREAS.length - 1) / 2)];
    const cam = Math.max(0, (m.id === 'marco_zero' && MAP.AID?.marco ? MAP.AID.marco.x0 + 80 : ar?.x0 ?? 0));
    const cv = document.createElement('canvas'); cv.width = W * RS; cv.height = H * RS;
    const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
    g.setTransform(RS, 0, 0, RS, 0, 0);
    MAP.setLight?.('noite', true);
    MAP.drawSky(g, 'noite', cam, 0);
    if (MAP.drawMid) MAP.drawMid(g, cam);
    if (MAP.TINT?.noite) { g.fillStyle = MAP.TINT.noite; g.fillRect(0, 0, W, H); }
    if (MAP.drawLights) MAP.drawLights(g, cam, 'noite', 0);
    if (MAP.drawFG) MAP.drawFG(g, cam);
    // reduz pra um cartão leve
    const sm = document.createElement('canvas'); sm.width = 480; sm.height = 270;
    const s = sm.getContext('2d')!; s.imageSmoothingEnabled = true; s.drawImage(cv, 0, 0, 480, 270);
    return sm.toDataURL('image/jpeg', 0.85);
  });
  keep('map:' + m.id, u);
  return u;
}

export const mapLivre = (s: GameState, m: MapDef) => !m.requer || (s.vencidos ?? []).includes(m.requer) || (m.requer === 'marco_zero' && s.vitorias > 0);
export const mapPronto = (m: MapDef) => !!(EXP() as any)[m.art];

/** HTML dos cartões de mapa (data-act="pickmap"). */
export function mapCardsHtml(s: GameState, selected: string): string {
  const lua = nextIsBloodMoon(s), recrutar = loadPrefs().recrutar;
  return Object.values(MAPS).map((m) => {
    const livre = mapLivre(s, m), pronto = mapPronto(m), ok = livre && pronto;
    const prev = pronto && (EXP() as any)[m.art] ? mapPreviewSrc(m) : null;
    const venceu = (s.vencidos ?? []).includes(m.id);
    const tag = !pronto ? 'EM CONSTRUÇÃO' : !livre ? `Trancado · vença ${esc(MAPS[m.requer!].nome)}` : venceu ? 'Vencido' : 'Novo';
    const zs = mapZombies(m).map((k) => {
      const d = ZOMBIES[k], known = (s.derrotados?.[k] ?? 0) > 0;
      const cls = 'mz' + (d.boss ? ' ' + d.boss : '') + (known ? '' : ' unk');
      const label = known ? `${d.nome}${d.boss === 'mini' ? ' · mini boss' : d.boss === 'chefe' ? ' · chefe' : ''} · ${s.derrotados[k]} abatidos` : '??? · ainda não derrotado';
      return `<figure class="${cls}" title="${esc(label)}"><img class="px" ${zombieIconSrc(k, !known)} alt=""${esc(known ? d.nome : 'Zumbi desconhecido')}"><figcaption>${known ? esc(d.nome) : '???'}</figcaption></figure>`;
    }).join('');
    const known = mapZombies(m).filter((k) => (s.derrotados?.[k] ?? 0) > 0).length, total = mapZombies(m).length;
    return `<button class="mapcard${ok ? '' : ' locked'}" data-act="pickmap" data-id="${m.id}" aria-pressed="${selected === m.id}" ${ok ? '' : 'disabled'}>
      <div class="mc-img">${prev ? `<img ${prev} alt="">` : '<div class="mc-void"></div>'}<span class="mc-tag">${tag}</span></div>
      <div class="mc-body">
        <div class="mc-head"><b>${esc(m.nome)}</b><small>${m.areas} áreas · nível ${m.nivelRecomendado}+</small></div>
        <p>${esc(m.desc)}</p>
        ${encOddsHtml(s, m, lua, recrutar)}
        <div class="lbl">Zumbis · ${known}/${total} descobertos</div>
        <div class="mc-zs">${zs}</div>
      </div>
    </button>`;
  }).join('');
}

/** ENC-3 no cartão: chance de aparecer recruta / pet por expedição (fonte: encounterOdds). */
function encOddsHtml(s: GameState, m: MapDef, lua: boolean, recrutar: boolean): string {
  const o = encounterOdds(s, m, { lua }), p = (v: number) => Math.round(v * 100) + '%';
  const nota = o.garantido ? 'garantido nesta expedição' : lua ? 'Lua de Sangue: mais encontros' : 'por expedição';
  return `<div class="mc-enc" title="Chance de aparecer um sobrevivente ou pet pedindo ajuda numa expedição a este mapa. Todo recrutado chega nota E.">
    <span class="mc-encr"><i>Recruta</i><b data-enc="rec">${p(o.rec)}</b></span><span class="mc-encp"><i>Pet</i><b data-enc="pet">${p(o.pet)}</b></span>
    <small>${nota}${recrutar ? '' : ' · plano: recusar missões'}</small></div>`;
}
