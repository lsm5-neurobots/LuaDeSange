// Pré-aquecimento da arte da expedição: gera antes (tela de carregamento) e em segundo plano (orçamento por quadro)
// os mesmos quadros que o render vai pedir — mesmas chamadas e chaves das factories, então só enche os caches.
import { withHubK } from '../art/legacy';
import { frameStore, HIT } from '../art/frameStore';
import { settings } from '../core/settings';
import { ZOMBIES, type ZombieId } from '../data/zombies';
import { LOOP, SK, type Fighter, type World } from './world';
import type { ActorArt } from '../art/sprites';

/**
 * k = chave única · g = grupo pra estimar custo · c = palpite de custo (ms) enquanto o grupo não tem medida ·
 * again = depois de trazer o quadro do disco ainda precisa rodar (ex.: ícone feito a partir do quadro) ·
 * pr = já sondado no cache persistente (1) / volta do disco falhou, gerar (2)
 */
export interface WarmJob { k: string; g: string; run: () => void; c?: number; again?: boolean; pr?: number }

/** Meta do banco de tempo do segundo plano (ms por quadro): a média fica ≥ ~35 fps enquanto há o que gerar. */
export const BANK_MS = 28;
/**
 * Job maior que a fatia normal só roda se o quadro (JS) não passar disto — sobra ~9 ms pro navegador pintar/compor
 * sem estourar 33 ms (era 28). Mais baixo que isso piora: o job grande não roda antes e o render gera na hora (pico pior).
 */
export const HEAVY_CAP = 24;
/** Política comum (expedição e abrigo): pode rodar um job pesado de custo c com e ms já gastos no quadro? */
export const heavyOk = (bank: number, e: number, c: number) => bank >= c && (e + c <= HEAVY_CAP || e > 12); // quadro já pesado (máquina lenta): vale o banco, a média segue na meta

/** Fila de geração com estimativa de custo por grupo (factory) — roda dentro de um orçamento em ms. */
export class Warmer {
  private q: WarmJob[] = [];
  private seen = new Set<string>();
  private est = new Map<string, number>();
  total = 0;
  done = 0;
  /** ms gastos por grupo (diagnóstico) */
  readonly spent = new Map<string, { n: number; ms: number }>();

  private ran = new Set<string>();
  /** Enfileira (sem repetir). `front`: vai pra frente — inclusive o que já estava na fila e ainda não rodou. Devolve quantos vão rodar. */
  add(jobs: WarmJob[], front = false): number {
    if (front) {
      const fresh = jobs.filter((j) => !this.ran.has(j.k)), keys = new Set(fresh.map((j) => j.k));
      const before = this.q.length;
      this.q = fresh.concat(this.q.filter((j) => !keys.has(j.k)));
      fresh.forEach((j) => this.seen.add(j.k));
      this.total += this.q.length - before;
      return fresh.length;
    }
    const fresh = jobs.filter((j) => !this.seen.has(j.k));
    fresh.forEach((j) => this.seen.add(j.k));
    this.q = this.q.concat(fresh);
    this.total += fresh.length;
    return fresh.length;
  }
  get pending(): number { return this.q.length + this.waitN; }
  /** jobs esperando o quadro voltar do disco (chave do cache persistente → jobs) */
  private wait = new Map<string, WarmJob[]>();
  private waitN = 0;
  /** Busca no disco o lote sondado; o que não voltar volta pra fila (na frente) pra ser gerado. */
  private fetchBatch(keys: string[]): void {
    void frameStore.fetch(keys).then((ok) => {
      const back: WarmJob[] = [];
      for (const k of keys) {
        const js = this.wait.get(k);
        if (!js) continue;
        this.wait.delete(k); this.waitN -= js.length;
        for (const j of js) {
          if (ok.has(k) && !j.again) { this.done++; continue; }
          j.pr = 2; back.push(j);
        }
      }
      if (back.length) this.q = back.concat(this.q);
    });
  }
  /** custo estimado do próximo job (ms), 0 se a fila está vazia */
  /** custo médio por quadro gerado até aqui (ms) — mede a máquina */
  avgCost(): number { let n = 0, ms = 0; for (const [g, v] of this.spent) if (/^(z:|f:|vigia)/.test(g)) { n += v.n; ms += v.ms; } return n ? ms / n : 0; }
  nextCost(): number { const j = this.q[0]; return j ? this.est.get(j.g) ?? j.c ?? this.famCost(j.g) ?? 6 : 0; }
  /** Traz pra frente o 1º job (entre os próximos 24) já sondado/sem cache cujo custo cabe em `room` ms. */
  private pullCheap(room: number): boolean {
    if (room <= 0.5) return false;
    for (let i = 1; i < Math.min(this.q.length, 25); i++) {
      const j = this.q[i];
      if (!j.pr && frameStore.on) continue; // ainda não sondado: a varredura do próximo quadro cuida
      const c = this.est.get(j.g) ?? j.c ?? this.famCost(j.g) ?? 6;
      if (c <= room) { this.q.splice(i, 1); this.q.unshift(j); return true; }
    }
    return false;
  }
  /** grupo ainda sem medida: média dos grupos da mesma família (z:, f:, hub:…) — o palpite fixo subestimava e dava pico */
  private famCost(g: string): number | undefined {
    const i = g.indexOf(':');
    if (i < 0) return undefined;
    const p = g.slice(0, i + 1);
    let n = 0, s = 0;
    for (const [k, v] of this.est) if (k.startsWith(p)) { n++; s += v; }
    return n ? s / n : undefined;
  }
  /**
   * Roda jobs enquanto couber em `ms`. `heavy` = folga acumulada (banco de tempo): se o próximo job é maior que `ms`
   * mas cabe na folga, roda só ele (pico controlado; a média continua dentro da meta).
   */
  run(ms: number, heavy = 0): number {
    const t0 = performance.now();
    let first = true, probed = 0;
    const fk: string[] = [];
    const park = (h: WarmJob, r: string) => {
      this.ran.add(h.k);
      const js = this.wait.get(r);
      if (js) js.push(h); else { this.wait.set(r, [h]); fk.push(r); }
      this.waitN++;
      if (fk.length >= 48) this.fetchBatch(fk.splice(0));
    };
    // varredura: sonda também além da cabeça da fila — um job grande parado na frente (sem orçamento pra gerar)
    // não pode segurar o que só precisa vir do disco
    if (frameStore.on) {
      const lim = t0 + Math.max(0.5, ms * 0.4);
      for (let i = 0; i < this.q.length && performance.now() < lim;) {
        const h = this.q[i];
        if (h.pr) { i++; continue; }
        h.pr = 1;
        const r = frameStore.probe(h.run);
        if (r === HIT) { this.q.splice(i, 1); this.ran.add(h.k); this.done++; }
        else if (typeof r === 'string') { this.q.splice(i, 1); park(h, r); }
        else i++;
      }
    }
    while (this.q.length) {
      // cache persistente: sonda antes de gerar (barato). Já na memória = pronto; no disco = busca em lote.
      const h = this.q[0];
      if (!h.pr && frameStore.on) {
        if (probed++ > 0 && performance.now() - t0 > ms) break;
        h.pr = 1;
        const r = frameStore.probe(h.run);
        if (r === HIT) { this.q.shift(); this.ran.add(h.k); this.done++; continue; }
        if (typeof r === 'string') { this.q.shift(); park(h, r); continue; }
      }
      const spent = performance.now() - t0, c = this.nextCost();
      if (spent + c > ms && !(first && c <= heavy)) {
        // cabeça grande demais pra esta fatia (ex.: quadro de chefe): não segura a fila — puxa um job barato de logo atrás
        if (!this.pullCheap(ms - spent)) break;
        continue;
      }
      const j = this.q.shift()!, s = performance.now();
      this.ran.add(j.k);
      try { j.run(); } catch { /* quadro inválido: ignora */ }
      const d = performance.now() - s;
      this.est.set(j.g, this.est.has(j.g) ? this.est.get(j.g)! * 0.7 + d * 0.3 : d);
      const st = this.spent.get(j.g) ?? { n: 0, ms: 0 }; st.n++; st.ms += d; this.spent.set(j.g, st);
      this.done++;
      first = false;
      if (c > ms) break;
    }
    if (fk.length) this.fetchBatch(fk);
    return performance.now() - t0;
  }
  clear(): void { for (const j of this.q) this.seen.delete(j.k); this.q = []; }
}

/** Animações comuns de zumbi: vão antes dos golpes raros (claw2, headbutt, grabLow…) na fila de segundo plano. */
const COMMON = ['idle', 'walk', 'attack', 'hurt', 'hurtB', 'death', 'fall', 'getup', 'tumble', 'grabbed', 'alert', 'crawl', 'flee'];

/** ordem de prioridade das animações (o resto vem depois, na ordem da factory) */
const FIRST = ['idle', 'walk', 'run', 'intro', 'attack', 'hurt', 'hurtB', 'death', 'fall', 'getup', 'combo', 'guard'];
const orderAnims = (names: string[]) => [...FIRST.filter((a) => names.includes(a)), ...names.filter((a) => !FIRST.includes(a))];

export function zombieForms(w: World, k: ZombieId): string[] {
  if (ZOMBIES[k].boss) return ['normal', 'furia'];
  return w.mode === 'lua' ? ['enluarado', 'plenilunar', 'comum'] : ['comum'];
}

/** Quadros de zumbi exatamente como render.zFrame pede (2 sub-quadros de tween). */
export function zombieJobs(w: World, k: ZombieId, forms: string[], only?: string[]): WarmJob[] {
  const K = w.zk[k];
  if (!K) return [];
  const F = K.F, T = w.A.TWEEN, out: WarmJob[] = [];
  const anims = orderAnims(Object.keys(F.ANIMS)).filter((a) => !only || only.includes(a));
  const frs = settings.q.tween ? [0, 0.5] : [0]; // Desempenho: só poses-chave (render.zFrame faz o mesmo)
  for (const form of forms) for (const an of anims) for (let fi = 0; fi < F.ANIMS[an].n; fi++) for (const fr of frs) {
    if (!F.framePose && fr) continue;
    out.push({
      k: `z|${k}|${form}|${an}|${fi}|${fr}`, g: 'z:' + k,
      run: () => {
        if (F.framePose) { const P = T.poseAt(F, an, fi, fr, !!LOOP[an]); F.framePose(form, an, P, an + fi + '.' + fr); }
        else F.frame(form, an, fi, 5);
      },
    });
  }
  return out;
}

/** Quadros de um lutador como fighterFrame pede. */
export function fighterJobs(w: World, f: Fighter, only?: string[]): WarmJob[] {
  const out: WarmJob[] = [];
  if (f.rig === 'vigia') {
    const V = w.A.VIGIA, T = w.A.TWEEN, skin = f.m.skin ?? 'media', tier = f.fam === 'bastao' ? f.tier : 'comum';
    const frs = settings.q.tween ? Array.from({ length: T.Q }, (_, i) => i / T.Q) : [0];
    for (const an of orderAnims(Object.keys(V.ANIMS)).filter((a) => !only || only.includes(a))) for (let fi = 0; fi < V.ANIMS[an].n; fi++) for (const fr of (V.ANIMS[an].kf ? [0] : frs)) {
      out.push({ k: `v|${skin}|${tier}|${an}|${fi}|${fr}`, g: 'vigia', run: () => { const P = T.poseAt(V, an, fi, fr, !!LOOP[an]); V.framePose!(skin, tier, P, 5, an + fi + '.' + fr); } });
    }
    return out;
  }
  const art = f.art!, AN = art.F.ANIMS;
  // só o que esta arma usa: assinatura de outra família (fam) e poses de tiro de outra arma (gunKind) ficam de fora
  const usa = (a: string) => (!AN[a].fam || AN[a].fam === f.fam) && (!AN[a].gunKind || AN[a].gunKind === f.fam);
  for (const an of orderAnims(Object.keys(AN)).filter((a) => (!only || only.includes(a)) && usa(a))) for (let fi = 0; fi < AN[an].n; fi++) {
    out.push({ k: `f|${f.m.id}|${f.fam}|${f.tier}|${an}|${fi}`, g: 'f:' + f.m.id, run: () => { withHubK(SK, () => art.frame(an, fi)); } });
  }
  return out;
}

export function petJobs(art: ActorArt, id: string): WarmJob[] {
  const out: WarmJob[] = [];
  for (const an of ['idle', 'walk', 'fly']) {
    const A = art.F.ANIMS[an];
    if (!A) continue;
    for (let fi = 0; fi < A.n; fi++) out.push({ k: `p|${id}|${an}|${fi}`, g: 'pet', run: () => { withHubK(SK, () => art.frame(an, fi)); } });
  }
  return out;
}

/** Objetos vasculháveis, baús, itens e FX sem opções (baratos, mas cada um custa uma composição). */
export function propJobs(w: World, x0: number, x1: number): WarmJob[] {
  const out: WarmJob[] = [];
  const O = w.A.OBJ, B = w.A.BAU;
  for (const sp of w.spots) {
    if (sp.x < x0 || sp.x > x1) continue;
    if (sp.t === 'obj' && O) for (const st of ['fechado', 'vasculhando', 'vasculhado']) for (let fi = 0; fi < 4; fi++) out.push({ k: `o|${sp.kind}|${st}|${fi}`, g: 'obj', run: () => O.frame(sp.kind, st, fi, 5) });
    if (sp.t === 'bau' && B) {
      for (let fi = 0; fi < 5; fi++) out.push({ k: `b|${sp.tipo}|abrindo|${fi}`, g: 'bau', run: () => B.frame(sp.tipo, 'abrindo', fi, 5) });
      for (let fi = 0; fi < 3; fi++) out.push({ k: `b|${sp.tipo}|trancado|${fi}`, g: 'bau', run: () => B.frame(sp.tipo, 'trancado', fi, 5) });
    }
  }
  return out;
}

export function fxItemJobs(w: World): WarmJob[] {
  const out: WarmJob[] = [];
  const FX = (w.A as any).FX, I = w.A.ITEMS;
  if (FX) for (const kind of ['dustRun', 'dust', 'hitspark', 'impact', 'impactBig', 'stun', 'muzzle', 'laserHit', 'heal', 'pickup', 'rock', 'rockBreak', 'whistle', 'levelup', 'bullet', 'hook', 'chain']) {
    const n = FX.N[kind] || 0;
    for (let fi = 0; fi < n; fi++) out.push({ k: `fx|${kind}|${fi}`, g: 'fx', run: () => FX.frame(kind, fi, undefined) });
  }
  if (I) for (const id of Object.keys(w.map.loot.porArena).concat(['chave', 'projeto'])) for (let fi = 0; fi < I.N; fi++) out.push({ k: `i|${id}|${fi}`, g: 'item', run: () => I.frame(id, fi, 5) });
  return out;
}

/**
 * Monta a fila da expedição a partir da arena inicial.
 * essencial: o que aparece nos primeiros segundos (squad/pet/zumbis da 1ª arena parados e andando, FX, objetos da tela).
 * resto: demais animações, próximas arenas em ordem (chefes quando a rota chega neles).
 */
export function expeditionJobs(w: World, pet: { art: ActorArt; id: string } | null): { essential: WarmJob[]; extended: WarmJob[]; rest: WarmJob[] } {
  const essential: WarmJob[] = [], extended: WarmJob[] = [], rest: WarmJob[] = [];
  // essencial = o que aparece logo de cara: squad parado/correndo, zumbis chegando (andando; chefe: intro/parado/andando)
  // luta da 1ª arena na carga (combo, ataque, dano): senão o primeiro golpe gera sprite no meio do quadro
  for (const f of w.fs) essential.push(...fighterJobs(w, f, f.rig === 'vigia' ? ['idle', 'run', 'guard', 'advance', 'combo', 'hurt'] : ['idle', 'walk', 'run', 'guard', 'combo', 'hurt']));
  if (w.cfg.manual && w.fs[0]) essential.push(...fighterJobs(w, w.fs[0], ['atkH', 'atkV', 'atkS', 'atkK', 'atkSpin', 'roll', 'backstep', 'jump', 'jumpKick', 'dash', 'dive', 'launcher', 'atkFin', 'grab', 'throw', 'areaSpin', 'shoot', 'shoot2', 'burst', 'whip', 'charge', 'fire']));
  if (pet) essential.push(...petJobs(pet.art, pet.id));
  const kinds0 = arenaKinds(w, w.ai);
  for (const k of kinds0) essential.push(...zombieJobs(w, k, zombieForms(w, k).slice(0, ZOMBIES[k].boss ? 1 : 1), ZOMBIES[k].boss ? ['intro', 'idle', 'walk'] : ['walk', 'idle', 'attack', 'hurt']));
  essential.push(...fxItemJobs(w).filter((j) => j.g === 'fx'));
  // estendido (máquina lenta espera na carga): golpes do squad e ataques/reações da 1ª arena
  for (const f of w.fs) extended.push(...fighterJobs(w, f, f.rig === 'vigia' ? ['guard', 'advance', 'combo', 'hurt'] : ['combo', 'guard', 'hurt']));
  for (const k of kinds0) extended.push(...zombieJobs(w, k, zombieForms(w, k).slice(0, 1), ['idle', 'attack', 'hurt', 'death']));
  // resto: objetos da tela, demais formas, depois arena por arena
  for (const k of kinds0) rest.push(...zombieJobs(w, k, zombieForms(w, k).slice(0, ZOMBIES[k].boss ? 1 : 3), ['idle', 'attack', 'hurt', 'hurtB', 'death']));
  rest.push(...propJobs(w, w.cam - 40, w.cam + w.W + 120));
  rest.push(...fxItemJobs(w).filter((j) => j.g !== 'fx'));
  for (const k of kinds0) rest.push(...zombieJobs(w, k, zombieForms(w, k).slice(0, 1), COMMON));
  for (const f of w.fs) rest.push(...fighterJobs(w, f));
  for (const k of kinds0) if (!ZOMBIES[k].boss) rest.push(...zombieJobs(w, k, zombieForms(w, k), COMMON));
  // por último, golpes raros (primeiro a forma mais comum): sob demanda eles dão pico; aqui ficam prontos com folga
  for (const k of kinds0) if (!ZOMBIES[k].boss) rest.push(...zombieJobs(w, k, zombieForms(w, k)));
  for (let i = w.ai + 1; i < w.arenas.length; i++) rest.push(...arenaJobs(w, i, false));
  return { essential, extended, rest };
}

/** Tipos de zumbi de uma arena, incluindo os que entram chamados (grito, mini boss, Chorona). */
export function arenaKinds(w: World, i: number): ZombieId[] {
  const A = w.arenas[i];
  if (!A) return [];
  const s = new Set<ZombieId>(A.list);
  for (const k of A.list) { if (k === 'gritador' || ZOMBIES[k].boss === 'mini') s.add('errante'); if (k === 'chorona') s.add('rastejante'); if (k === 'passista' || k === 'vendedorfitas') s.add('malandro'); }
  return [...s];
}

/**
 * Jobs de uma arena. Chefes/mini bosses (quadros grandes, ~1 MB cada) só entram com `bosses` — o motor pede
 * quando a rota chega na arena anterior, pra não segurar memória à toa.
 */
export function arenaJobs(w: World, i: number, bosses: boolean): WarmJob[] {
  const A = w.arenas[i], out: WarmJob[] = [];
  if (!A) return out;
  for (const k of arenaKinds(w, i)) {
    if (ZOMBIES[k].boss && !bosses) continue;
    const forms = zombieForms(w, k), only = ZOMBIES[k].boss ? undefined : COMMON;
    out.push(...zombieJobs(w, k, forms.slice(0, 1), only));
    if (!ZOMBIES[k].boss) out.push(...zombieJobs(w, k, forms, only), ...zombieJobs(w, k, forms));
  }
  out.push(...propJobs(w, A.cam - 40, A.cam + w.W + 40));
  return out;
}

/** Forma de fúria do chefe (só quando a luta começa). */
export function furyJobs(w: World, k: ZombieId): WarmJob[] {
  return ZOMBIES[k].boss ? zombieJobs(w, k, ['furia']) : [];
}
