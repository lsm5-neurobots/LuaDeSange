// Worker do cache persistente de quadros: IndexedDB + codificação/decodificação PNG fora da thread principal.
// Banco 'lds-frames': 'm' = metadados {k, v (versão do pacote), sz, t (último uso), p (props do quadro)} com índice por t;
// 'b' = blob PNG (chave k); 'kv' = strings pequenas (ícones/prévias em data URL) {k, v, s}.
// main → {t:'init', vers, cap} · {t:'put', k, v, bmp, p} · {t:'get', rid, keys} · {t:'kvget', rid, keys} · {t:'kvput', k, v, s}
// worker → {t:'init', ok, keys, total} · {t:'put', k, ok} · {t:'got', rid, items:[{k,bmp,p}], miss} · {t:'kv', rid, items} · {t:'evict', keys}
type Meta = { k: string; v: string; sz: number; t: number; p: unknown };
const post = (m: unknown, tr: Transferable[] = []) => (self as unknown as Worker).postMessage(m, tr);
let db: IDBDatabase | null = null;
let vers: Record<string, string> = {};
let cap = 200 * 1024 * 1024;
let total = 0;

const req = <T>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const done = (tx: IDBTransaction) => new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
const bundleOf = (k: string) => k.slice(0, k.indexOf('/'));

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('lds-frames', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('m')) d.createObjectStore('m', { keyPath: 'k' }).createIndex('t', 't');
      if (!d.objectStoreNames.contains('b')) d.createObjectStore('b');
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'k' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('blocked'));
  });
}

async function init(m: { vers: Record<string, string>; cap?: number }) {
  vers = m.vers; if (m.cap) cap = m.cap;
  try {
    db = await open();
    const keys: string[] = [], stale: string[] = [];
    total = 0;
    const tx = db.transaction('m', 'readonly');
    await new Promise<void>((res, rej) => {
      const c = tx.objectStore('m').openCursor();
      c.onsuccess = () => {
        const cur = c.result;
        if (!cur) { res(); return; }
        const r = cur.value as Meta;
        if (vers[bundleOf(r.k)] !== r.v) stale.push(r.k); else { keys.push(r.k); total += r.sz; }
        cur.continue();
      };
      c.onerror = () => rej(c.error);
    });
    post({ t: 'init', ok: true, keys, total });
    // versões antigas da arte: apaga em segundo plano
    if (stale.length) {
      const tx2 = db.transaction(['m', 'b'], 'readwrite');
      for (const k of stale) { tx2.objectStore('m').delete(k); tx2.objectStore('b').delete(k); }
      await done(tx2).catch(() => {});
    }
    // kv de versões antigas
    const tx3 = db.transaction('kv', 'readwrite'), kv = tx3.objectStore('kv');
    const all = (await req(kv.getAll())) as { k: string; v: string }[];
    for (const r of all) if (vers[bundleOf(r.k)] !== r.v) kv.delete(r.k);
    await done(tx3).catch(() => {});
  } catch (e) {
    db = null;
    post({ t: 'init', ok: false, keys: [], total: 0, err: String(e) });
  }
}

let busy = Promise.resolve();
let ready: Promise<void> = Promise.resolve();
async function put(m: { k: string; v: string; bmp: ImageBitmap; p: unknown }) {
  if (!db) { m.bmp.close(); post({ t: 'put', k: m.k, ok: false }); return; }
  try {
    const oc = new OffscreenCanvas(m.bmp.width, m.bmp.height), g = oc.getContext('2d')!;
    g.drawImage(m.bmp, 0, 0); m.bmp.close();
    const blob = await oc.convertToBlob({ type: 'image/png' });
    const sz = blob.size + 200;
    const tx = db.transaction(['m', 'b'], 'readwrite');
    tx.objectStore('b').put(blob, m.k);
    tx.objectStore('m').put({ k: m.k, v: m.v, sz, t: Date.now(), p: m.p } as Meta);
    await done(tx);
    total += sz;
    post({ t: 'put', k: m.k, ok: true });
    if (total > cap) await evict();
  } catch {
    post({ t: 'put', k: m.k, ok: false });
  }
}

/** LRU: apaga os menos usados até ficar em 85% do teto. */
async function evict() {
  if (!db) return;
  const gone: string[] = [];
  const tx = db.transaction(['m', 'b'], 'readwrite'), ms = tx.objectStore('m'), bs = tx.objectStore('b');
  await new Promise<void>((res, rej) => {
    const c = ms.index('t').openCursor();
    c.onsuccess = () => {
      const cur = c.result;
      if (!cur || total <= cap * 0.85) { res(); return; }
      const r = cur.value as Meta;
      total -= r.sz; gone.push(r.k); bs.delete(r.k); cur.delete();
      cur.continue();
    };
    c.onerror = () => rej(c.error);
  });
  await done(tx).catch(() => {});
  if (gone.length) post({ t: 'evict', keys: gone });
}

async function get(m: { rid: number; keys: string[] }) {
  const items: { k: string; bmp: ImageBitmap; p: unknown }[] = [], miss: string[] = [];
  if (!db) { post({ t: 'got', rid: m.rid, items, miss: m.keys }); return; }
  try {
    const tx = db.transaction(['m', 'b'], 'readwrite'), ms = tx.objectStore('m'), bs = tx.objectStore('b');
    const now = Date.now();
    const rows = await Promise.all(m.keys.map(async (k) => {
      const [meta, blob] = await Promise.all([req(ms.get(k)) as Promise<Meta | undefined>, req(bs.get(k)) as Promise<Blob | undefined>]);
      if (meta && blob) { meta.t = now; ms.put(meta); }
      return { k, meta, blob };
    }));
    await done(tx).catch(() => {});
    await Promise.all(rows.map(async (r) => {
      if (!r.meta || !r.blob) { miss.push(r.k); return; }
      try { items.push({ k: r.k, bmp: await createImageBitmap(r.blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'default' }), p: r.meta.p }); } catch { miss.push(r.k); }
    }));
  } catch {
    for (const k of m.keys) if (!items.some((i) => i.k === k)) miss.push(k);
  }
  post({ t: 'got', rid: m.rid, items, miss }, items.map((i) => i.bmp));
}

async function kvget(m: { rid: number; keys: string[] }) {
  const items: Record<string, string> = {};
  if (db) {
    try {
      const tx = db.transaction('kv', 'readonly'), kv = tx.objectStore('kv');
      await Promise.all(m.keys.map(async (k) => { const r = (await req(kv.get(k))) as { k: string; v: string; s: string } | undefined; if (r && vers[bundleOf(k)] === r.v) items[k] = r.s; }));
    } catch { /* sem cache */ }
  }
  post({ t: 'kv', rid: m.rid, items });
}

async function kvput(m: { k: string; v: string; s: string }) {
  if (!db) return;
  try { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put({ k: m.k, v: m.v, s: m.s }); await done(tx); } catch { /* cheio/privado */ }
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.t === 'init') { ready = init(m); busy = ready; return; }
  // escrita em série (uma codificação por vez: não disputa CPU com o jogo); leituras na hora
  if (m.t === 'put') { busy = busy.then(() => put(m)); return; }
  if (m.t === 'get') { void ready.then(() => get(m)); return; }
  if (m.t === 'kvget') { void ready.then(() => kvget(m)); return; }
  if (m.t === 'kvput') { busy = busy.then(() => kvput(m)); return; }
  if (m.t === 'clear') { busy = busy.then(async () => { if (!db) return; const tx = db.transaction(['m', 'b', 'kv'], 'readwrite'); tx.objectStore('m').clear(); tx.objectStore('b').clear(); tx.objectStore('kv').clear(); await done(tx).catch(() => {}); total = 0; post({ t: 'cleared' }); }); }
};
