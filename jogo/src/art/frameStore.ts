// Cache persistente dos quadros procedurais (IndexedDB, via worker que codifica/decodifica PNG fora da thread principal).
// As factories da arte usam PIX.cache() (Map com ganchos): todo quadro novo vem pra cá (put) e é gravado em segundo
// plano; na sessão seguinte, quem pré-aquece (Warmer, landing) sonda a chave do quadro (probe) e, se está no disco,
// busca em lote (fetch) — o quadro entra no cache da factory como ImageBitmap e vira canvas no 1º uso.
// Chave = pacote/cache|chave da factory (que já inclui forma, animação, quadro e escala K); versão = hash do pacote.
// Tudo é opcional: sem IndexedDB/worker (aba privada, quota cheia, erro), o jogo gera na hora como antes.
import { EXP, HUB } from './legacy';

type PMap = Map<string, unknown> & { id: string };
type Meta = { p?: Record<string, unknown>; o?: Record<string, unknown> };

class ProbeMiss { constructor(readonly key: string) {} }

/** Quadro vindo do disco: vira canvas (com as props _tip/_head/…) no primeiro get() da factory. */
class Holder {
  readonly __h = 1;
  constructor(private bmp: ImageBitmap, private m: Meta | null) {}
  mat(): unknown {
    const b = this.bmp, c = document.createElement('canvas');
    c.width = b.width; c.height = b.height;
    c.getContext('2d')!.drawImage(b, 0, 0);
    b.close();
    if (this.m?.o) return { ...this.m.o, c };
    if (this.m?.p) Object.assign(c, this.m.p);
    return c;
  }
}

export const HIT = 1 as const;
/** teto do disco (LRU no worker) */
const CAP = 200 * 1024 * 1024;
const MAX_PX = 1600 * 1200;

interface QItem { full: string; v: unknown }

class Store {
  on = false;
  probing = false;
  private regs = new Map<string, PMap>();
  private index = new Set<string>();
  private queued = new Set<string>();
  private q: QItem[] = [];
  private inflight = 0;
  private timer = 0;
  private w: Worker | null = null;
  private rid = 0;
  private reqs = new Map<number, (d: any) => void>();
  private vers: Record<string, string> = {};
  /** diagnóstico */
  readonly stats = { put: 0, got: 0, miss: 0, probeHit: 0 };

  async init(): Promise<void> {
    try {
      if (typeof indexedDB === 'undefined' || typeof Worker === 'undefined' || typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') return;
      for (const P of [EXP().PIX, HUB().PIX]) {
        if (!P?.CACHES || !P.VER) return;
        this.vers[P.BUNDLE] = P.VER;
        for (const m of P.CACHES as PMap[]) this.regs.set(m.id, m);
      }
      const w = new Worker(new URL('./frameStore.worker.ts', import.meta.url), { type: 'module' });
      this.w = w;
      const ok = await new Promise<boolean>((res) => {
        const to = setTimeout(() => res(false), 4000);
        w.onmessage = (e) => {
          const d = e.data;
          if (d.t === 'init') { clearTimeout(to); if (d.ok) for (const k of d.keys as string[]) this.index.add(k); res(!!d.ok); return; }
          this.onMsg(d);
        };
        w.onerror = () => { clearTimeout(to); res(false); };
        w.postMessage({ t: 'init', vers: this.vers, cap: CAP });
      });
      if (!ok) { w.terminate(); this.w = null; this.q = []; this.queued.clear(); return; }
      this.on = true;
      this.schedule();
    } catch {
      this.on = false; this.w = null;
    }
  }

  /** quantos quadros há no disco (diagnóstico) */
  get size(): number { return this.index.size; }

  private onMsg(d: any): void {
    if (d.t === 'put') { this.inflight--; this.queued.delete(d.k); if (d.ok) { this.index.add(d.k); this.stats.put++; } this.schedule(); return; }
    if (d.t === 'evict') { for (const k of d.keys as string[]) this.index.delete(k); return; }
    if (d.t === 'got' || d.t === 'kv') { const f = this.reqs.get(d.rid); this.reqs.delete(d.rid); f?.(d); }
  }

  // ---- ganchos chamados por PIX.cache() ----
  miss(map: PMap, k: string): never { throw new ProbeMiss(map.id + '|' + k); }
  put(map: PMap, k: string, v: unknown): void {
    if (!this.w) return;
    const full = map.id + '|' + k;
    if (this.index.has(full) || this.queued.has(full)) return;
    this.queued.add(full);
    this.q.push({ full, v });
    this.schedule();
  }

  private schedule(): void {
    if (this.timer || !this.on || !this.q.length) return;
    this.timer = window.setTimeout(() => this.pump(), 60);
  }

  /** grava em segundo plano: fatias curtas, poucas codificações em voo (o worker faz uma por vez) */
  private pump(): void {
    this.timer = 0;
    const t0 = performance.now();
    while (this.q.length && this.inflight < 4 && performance.now() - t0 < 2) {
      const it = this.q.shift()!;
      if (this.index.has(it.full)) { this.queued.delete(it.full); continue; }
      const v = it.v as any, cv: HTMLCanvasElement | null = v instanceof HTMLCanvasElement ? v : v?.c instanceof HTMLCanvasElement ? v.c : null;
      if (!cv || !cv.width || !cv.height || cv.width * cv.height > MAX_PX) { this.queued.delete(it.full); continue; }
      let meta: Meta | null = null;
      try {
        if (cv === v) { const p: Record<string, unknown> = {}; let n = 0; for (const key of Object.keys(cv)) if (key[0] === '_' && key !== '_img') { p[key] = (cv as any)[key]; n++; } if (n) meta = { p }; }
        else { const o: Record<string, unknown> = {}; for (const key of Object.keys(v)) if (key !== 'c') o[key] = v[key]; meta = { o }; }
        structuredClone(meta);
      } catch { this.queued.delete(it.full); continue; }
      const bundle = it.full.slice(0, it.full.indexOf('/'));
      this.inflight++;
      createImageBitmap(cv).then((bmp) => {
        if (!this.w) { bmp.close(); return; }
        this.w.postMessage({ t: 'put', k: it.full, v: this.vers[bundle], bmp, p: meta }, [bmp]);
      }, () => { this.inflight--; this.queued.delete(it.full); });
    }
    this.schedule();
  }

  /**
   * Roda fn em modo sonda: HIT = tudo já está na memória; string = chave do quadro que falta e está no disco;
   * null = precisa gerar (não está no disco ou store desligado).
   */
  probe(fn: () => void): typeof HIT | string | null {
    if (!this.on) return null;
    this.probing = true;
    try { fn(); return HIT; } catch (e) {
      if (e instanceof ProbeMiss) { if (this.index.has(e.key)) return e.key; this.stats.miss++; return null; }
      return null;
    } finally { this.probing = false; }
  }

  private pend = new Set<string>();
  private pendQ: string[] = [];
  /**
   * Pro render (quadro pedido na hora): { v } = já está na memória; 'wait' = está no disco e foi pedido (desenhe um
   * substituto, ex.: o quadro anterior); null = não existe em lugar nenhum, gere.
   */
  peek<T>(fn: () => T): { v: T } | 'wait' | null {
    if (!this.on) return null;
    this.probing = true;
    try { return { v: fn() }; } catch (e) {
      if (!(e instanceof ProbeMiss) || !this.index.has(e.key)) return null;
      if (!this.pend.has(e.key)) {
        this.pend.add(e.key);
        if (!this.pendQ.length) setTimeout(() => { const ks = this.pendQ.splice(0); void this.fetch(ks).then(() => { for (const k of ks) this.pend.delete(k); }); }, 0);
        this.pendQ.push(e.key);
      }
      return 'wait';
    } finally { this.probing = false; }
  }

  /** Busca quadros do disco (lote). Resolve com as chaves que entraram nos caches. */
  fetch(keys: string[]): Promise<Set<string>> {
    const okSet = new Set<string>();
    if (!this.w || !keys.length) return Promise.resolve(okSet);
    const rid = ++this.rid;
    return new Promise((res) => {
      this.reqs.set(rid, (d) => {
        for (const it of d.items as { k: string; bmp: ImageBitmap; p: Meta | null }[]) {
          const i = it.k.indexOf('|'), map = this.regs.get(it.k.slice(0, i)), k = it.k.slice(i + 1);
          if (!map) { it.bmp.close(); continue; }
          if (!Map.prototype.has.call(map, k)) Map.prototype.set.call(map, k, new Holder(it.bmp, it.p));
          else it.bmp.close();
          okSet.add(it.k); this.stats.got++;
        }
        for (const k of d.miss as string[]) this.index.delete(k);
        res(okSet);
      });
      this.w!.postMessage({ t: 'get', rid, keys });
    });
  }

  /** Sonda uma lista de chamadas em fatias (sem travar) e traz do disco o que houver. */
  async hydrate(fns: (() => void)[], sliceMs = 3): Promise<number> {
    if (!this.on) return 0;
    const keys: string[] = [], waits: Promise<Set<string>>[] = [];
    let i = 0, n = 0;
    while (i < fns.length) {
      const t0 = performance.now();
      while (i < fns.length && performance.now() - t0 < sliceMs) {
        const r = this.probe(fns[i++]);
        if (typeof r === 'string' && !keys.includes(r)) keys.push(r);
        if (keys.length >= 32) { waits.push(this.fetch(keys.splice(0))); }
      }
      if (i < fns.length) await new Promise((r) => setTimeout(r, 0));
    }
    if (keys.length) waits.push(this.fetch(keys));
    for (const s of await Promise.all(waits)) n += s.size;
    return n;
  }

  // ---- strings pequenas (ícones/prévias dos modais em data URL), versionadas pelo pacote ----
  kvGet(bundle: 'ART_EXP' | 'ART_HUB', keys: string[]): Promise<Record<string, string>> {
    if (!this.w || !keys.length) return Promise.resolve({});
    const rid = ++this.rid;
    return new Promise((res) => {
      const to = setTimeout(() => { this.reqs.delete(rid); res({}); }, 3000);
      this.reqs.set(rid, (d) => {
        clearTimeout(to);
        const out: Record<string, string> = {};
        for (const [k, s] of Object.entries(d.items as Record<string, string>)) out[k.slice(bundle.length + 1)] = s;
        res(out);
      });
      this.w!.postMessage({ t: 'kvget', rid, keys: keys.map((k) => bundle + '/' + k) });
    });
  }
  kvPut(bundle: 'ART_EXP' | 'ART_HUB', k: string, s: string): void {
    if (!this.w || !this.vers[bundle]) return;
    this.w.postMessage({ t: 'kvput', k: bundle + '/' + k, v: this.vers[bundle], s });
  }

  /** esvazia o cache (diagnóstico/testes) */
  clear(): void { this.index.clear(); this.w?.postMessage({ t: 'clear' }); }
}

export const frameStore = new Store();

declare global { interface Window { __ARTSTORE?: Store } }

/** Liga o cache persistente (não lança; sem suporte, segue sem cache). */
export async function initFrameStore(timeoutMs = 2500): Promise<void> {
  window.__ARTSTORE = frameStore;
  await Promise.race([frameStore.init(), new Promise((r) => setTimeout(r, timeoutMs))]);
}
