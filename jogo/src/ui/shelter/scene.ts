// Cena do abrigo: pátio 2.5D. Janela 448×252 (16:9, mesmo zoom de antes); o mundo é mais alto que a janela. Câmera em X e Y, herói no WASD/setas.
import { EXP, HUB, withHubK } from '../../art/legacy';
import { frameStore } from '../../art/frameStore';
import { anchor, heroArt, petArt, recruitArt, type ActorArt } from '../../art/sprites';
import { G, type HeroCfg } from '../../game/state';
import { makeCanvas } from '../../core/dom';
import { equipped } from '../../game/weapons';
import { needsRepair, maxHp } from '../../game/shelter';
import type { AttackReport } from '../../game/bloodmoon';
import { STRUCTS, type StructId } from '../../data/structures';
import { RESOURCES } from '../../data/resources';
import { ZOMBIES } from '../../data/zombies';
import { itemAnchor, itemFrame } from '../../art/items';
import type { Ambiente } from '../../game/worldClock';
import { Warmer, BANK_MS, heavyOk } from '../../expedition/warm';
import { settings } from '../../core/settings';
import { modalIconJobs, preloadModalCache, prewarmMapPreviews } from './mapSelect';

const W = 448, H = 252;
/** Janela da câmera (mesmos W/H de art-src/hub/abrigo.js). O pátio é WORLD×WORLDH, mais alto que esta janela. Canvas 1120×630. */
const RS = 2.5, SK = 1.25;
/**
 * Escala de geração dos sprites do hub: com zoom (criação/abertura) o herói sai em resolução maior (detalhe real);
 * Desempenho gera menor e desenha ampliado (drawEnts já escala por K/SK).
 */
export function sceneK(zoom = 1): number {
  const k = settings.q.hubK;
  return zoom > 1.25 ? (k < 1 ? SK : 2.5) : SK * k;
}

type Kind = 'hero' | 'rec' | 'pet' | 'zombie';
interface Ent {
  id: string; kind: Kind; art: ActorArt; key: string;
  x: number; y: number; face: 1 | -1; anim: string; fi: number; acc: number;
  tx: number | null; ty?: number; wait: number; speed: number;
  crouch?: number; alpha?: number; zid?: string;
  /** zumbi: início, parada e se atravessa a defesa */
  delay?: number; stopX?: number; breach?: boolean; arrived?: boolean; started?: boolean;
}
interface Fx { kind: 'spark' | 'smoke' | 'num'; x: number; y: number; vx: number; vy: number; t: number; life: number; text?: string; color?: string }
interface Intro { phase: 'walk' | 'crouch' | 'spark' | 'fire' | 'stand'; t: number; full: boolean }
interface Attack { rep: AttackReport; t: number; total: number; revealed: boolean; chunks: { t: number; id: StructId; v: number; x: number; y: number; done: boolean }[]; cam0: number; cam0y: number; hitT: number }

export interface SceneHooks {
  onStructClick(id: StructId): void;
  onCollect(id: StructId): void;
  onAttackStart(rep: AttackReport): void;
  onAttackEnd(rep: AttackReport): void;
  onIntroEnd(): void;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** passo direto do herói (unidades lógicas por segundo); o clique no chão continua mais lento */
const HERO_WALK = 92;
type Steer = 'l' | 'r' | 'u' | 'd';
function steerOf(key: string): Steer | null {
  switch (key.toLowerCase()) {
    case 'a': case 'arrowleft': return 'l';
    case 'd': case 'arrowright': return 'r';
    case 'w': case 'arrowup': return 'u';
    case 's': case 'arrowdown': return 'd';
    default: return null;
  }
}

export class ShelterScene {
  readonly cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private AB = HUB().ABRIGO;
  private WORLD: number = this.AB.WORLD;
  private WORLDH: number = this.AB.WORLDH ?? H;
  private FLOOR = this.AB.FLOOR as { x0: number; x1: number; y0: number; y1: number } | undefined;
  private slots: { id: string; x: number; largura: number; gy: number }[] = this.AB.SLOTS;
  private FIREX: number;
  private FIREY = 0;
  private LANE: number;
  private GATE_X = 140;
  private GATE_Y = 0;
  cam = 0;
  camY = 0;
  private T = 0;
  private fogoV = 0;
  private fogoOn = true;
  private ents: Ent[] = [];
  private fx: Fx[] = [];
  private intro: Intro | null = null;
  /** quem faz a intro (acende a fogueira): o herói, ou na volta o recruta nº 1 do squad da expedição */
  private introId = 'hero';
  private introEnt(): Ent | undefined { return this.ents.find((e) => e.id === this.introId && e.kind !== 'zombie') ?? this.ents.find((e) => e.kind === 'hero'); }
  /** escuridão da abertura/volta (0 = abrigo iluminado, 1 = breu com só a luz do recruta) */
  private dark = 0;
  private darkTarget = 0;
  private darkLayer = makeCanvas(W * 2.5, H * 2.5);
  /** herói provisório da tela de criação (antes de existir no save) */
  private preview: HeroCfg | null = null;
  /** só o herói na cena (criação) */
  private soloHero = false;
  /** sem arrastar/clicar (criação) */
  locked = false;
  /** zoom de câmera no herói (criação/abertura); 1 = visão normal */
  private zoom = 1;
  private zoomTarget = 1;
  /** raio da luz do herói no breu (criação usa uma luz mais forte pra ver a personalização) */
  private heroLightR = 30;
  /** tela de criação: luz de lanterna forte pra ver bem a personalização */
  private creating = false;
  private attack: Attack | null = null;
  private shake = 0;
  private drag: { x: number; y: number; cx: number; cy: number; moved: boolean } | null = null;
  /** WASD e setas seguras: anda o herói no pátio */
  private held = new Set<Steer>();
  private smokeAcc = 0;
  private camTarget: number | null = null;
  private camYTarget: number | null = null;
  private unbind: (() => void)[] = [];
  /** texto da etiqueta sobre a cena */
  tag = '';
  /** céu e clima do relógio do mundo (null = noite limpa, como na criação) */
  private amb: Ambiente | null = null;
  setAmbiente(a: Ambiente | null): void { this.amb = a; }

  constructor(canvas: HTMLCanvasElement, private hooks: SceneHooks) {
    this.cv = canvas;
    canvas.width = W * RS; canvas.height = H * RS;
    this.g = canvas.getContext('2d')!;
    this.g.imageSmoothingEnabled = false;
    // sprites gerados na escala de alta resolução nesta tela
    HUB().PIX.setK(sceneK()); EXP().PIX.setK(SK);
    const f = this.slots.find((s) => s.id === 'fogueira')!;
    const gate = this.slots.find((s) => s.id === 'portao');
    this.FIREX = Math.round(f.x + f.largura / 2);
    this.FIREY = f.gy;
    this.LANE = this.FIREY + 12;
    this.GATE_X = gate ? Math.round(gate.x + gate.largura * 0.42) : 80;
    this.GATE_Y = gate ? gate.gy : this.LANE;
    this.lookAt(this.FIREX, this.FIREY);
    this.bind();
  }

  private get maxCamX() { return Math.max(0, this.WORLD - W); }
  private get maxCamY() { return Math.max(0, this.WORLDH - H); }
  /** Enquadra um ponto do pátio. xBias empurra o alvo pra esquerda da vista (intro andando pra direita). */
  private lookAt(x: number, y: number, xBias = 0): void {
    this.cam = clamp(x - W / 2 + xBias, 0, this.maxCamX);
    this.camY = clamp(y - H * 0.58, 0, this.maxCamY);
  }

  /** Chamadas que geram o que a cena desenha nos primeiros quadros: sprites das estruturas e quadros base dos atores. */
  private firstCalls(): (() => void)[] {
    const out: (() => void)[] = [];
    try {
      const est = G().estruturas as Record<string, { nv: number } | undefined>;
      for (const s of this.slots) if (s.id !== 'fogueira') { const nv = est[s.id]?.nv ?? 0; out.push(() => this.AB.sprite(nv ? s.id : 'vazio', nv || 1)); }
    } catch { /* sem save */ }
    const K = sceneK(this.zoom);
    for (const e of this.ents) {
      const F = e.art.F;
      for (const an of e.kind === 'zombie' ? ['walk'] : ['idle', 'walk', 'fly']) if (F.ANIMS[an]) for (let fi = 0; fi < F.ANIMS[an].n; fi++) out.push(() => withHubK(K, () => e.art.frame(an, fi)));
    }
    return out;
  }

  /**
   * Antes do 1º quadro: traz do cache persistente (IndexedDB) o que já foi gerado em outra sessão e gera o resto dos
   * sprites das estruturas (sem isso o 1º quadro engasga). Resolve em no máximo `maxMs` (o resto chega depois).
   */
  async prepare(maxMs = 700): Promise<void> {
    const calls = this.firstCalls();
    if (frameStore.on) await Promise.race([frameStore.hydrate(calls), new Promise((r) => setTimeout(r, maxMs))]);
    try { const est: Record<string, number> = {}; for (const [id, e] of Object.entries(G().estruturas)) if (e) est[id] = e.nv; this.AB.prewarm?.(est); } catch { /* ok */ }
  }

  get introOn() { return !!this.intro; }
  get attackOn() { return !!this.attack; }

  // ---------------- entrada ----------------
  private bind(): void {
    const c = this.cv;
    const down = (e: PointerEvent) => { this.drag = { x: e.clientX, y: e.clientY, cx: this.cam, cy: this.camY, moved: false }; this.camTarget = null; this.camYTarget = null; try { c.setPointerCapture(e.pointerId); } catch { /* ok */ } };
    const move = (e: PointerEvent) => {
      if (!this.drag) return;
      const dx = ((e.clientX - this.drag.x) * W) / c.clientWidth;
      const dy = ((e.clientY - this.drag.y) * H) / c.clientHeight;
      if (Math.hypot(dx, dy) > 3) this.drag.moved = true;
      if (this.drag.moved && !this.intro && !this.attack && !this.locked) {
        this.cam = clamp(this.drag.cx - dx, 0, this.maxCamX);
        this.camY = clamp(this.drag.cy - dy, 0, this.maxCamY);
      }
    };
    const up = (e: PointerEvent) => {
      const d = this.drag; this.drag = null;
      if (!d || d.moved || this.attack) return;
      const r = c.getBoundingClientRect();
      const wx = ((e.clientX - r.left) * W) / r.width + this.cam;
      const wy = ((e.clientY - r.top) * H) / r.height + this.camY;
      this.click(wx, wy);
    };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', () => { this.drag = null; });
    const onKey = (e: KeyboardEvent) => {
      const k = steerOf(e.key);
      if (!k) return;
      if (e.type === 'keyup') { this.held.delete(k); return; }
      this.held.add(k);
      if (this.canSteer()) e.preventDefault();
    };
    const dropKeys = () => this.held.clear();
    const onVis = () => { if (document.hidden) dropKeys(); };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    window.addEventListener('blur', dropKeys);
    document.addEventListener('visibilitychange', onVis);
    this.unbind.push(() => {
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('blur', dropKeys);
      document.removeEventListener('visibilitychange', onVis);
      this.held.clear();
    });
  }

  dispose(): void {
    this.unbind.forEach((f) => f());
    this.unbind = [];
    this.cv.style.transform = '';
  }

  /** estrutura sob o clique, pelo retângulo do desenho dela (não pela coluna inteira) */
  private hitSlot(wx: number, wy: number): { id: string } | null {
    const st = G();
    const order = [...this.slots].sort((a, b) => b.gy - a.gy);
    for (const s of order) {
      if (wx < s.x || wx >= s.x + s.largura) continue;
      const cx = s.x + s.largura / 2;
      if (s.id === 'fogueira') { if (Math.abs(wx - cx) < 42 && wy > s.gy - 62 && wy < s.gy + 14) return s; continue; }
      const n = st.estruturas[s.id as StructId]?.nv ?? 0, sp = this.AB.sprite(n ? s.id : 'vazio', n || 1);
      const x0 = cx - sp.ax, y0 = s.gy - sp.gy;
      if (wx >= x0 - 3 && wx <= x0 + sp.w + 3 && wy >= y0 - 3 && wy <= y0 + sp.h + 3) return s;
    }
    return null;
  }

  private click(wx: number, wy: number): void {
    if (this.locked) return;
    const s = this.hitSlot(wx, wy);
    if (!s) { // chão livre: o recruta (herói) anda até lá
      const h = this.ents.find((e) => e.kind === 'hero');
      if (h && !this.intro) { const p = this.placeHero(wx, wy); h.tx = p.x; h.ty = p.y; h.speed = 46; }
      return;
    }
    const id = s.id as StructId;
    const st = G();
    const e = st.estruturas[id];
    if (e && e.nv > 0 && STRUCTS[id].prod && !e.danificada && Math.floor(st.prodBuf[id] ?? 0) >= 1) { this.hooks.onCollect(id); return; }
    this.hooks.onStructClick(id);
  }

  /** Fora de texto, modal, intro, ataque e criação. */
  private canSteer(): boolean {
    if (this.locked || this.intro || this.attack || this.creating) return false;
    if (document.querySelector('.modal')) return false;
    const t = document.activeElement;
    if (t instanceof HTMLElement && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return false;
    return true;
  }

  /** Direção do teclado, ou null se nada (ou se os eixos se cancelam). */
  private steer(): { x: number; y: number } | null {
    if (!this.canSteer() || !this.held.size) return null;
    const x = (this.held.has('r') ? 1 : 0) - (this.held.has('l') ? 1 : 0);
    const y = (this.held.has('d') ? 1 : 0) - (this.held.has('u') ? 1 : 0);
    return x || y ? { x, y } : null;
  }

  /** Chão do pátio, contornando o miolo da fogueira pra o herói não sumir atrás das toras. */
  private placeHero(x: number, y: number): { x: number; y: number } {
    const f = this.FLOOR;
    const x0 = f?.x0 ?? 44, x1 = f?.x1 ?? this.WORLD - 44, y0 = f?.y0 ?? this.LANE - 40, y1 = f?.y1 ?? this.LANE + 40;
    let px = clamp(x, x0, x1), py = clamp(y, y0, y1);
    const rx = 46, ry = 26, dx = px - this.FIREX, dy = py - this.FIREY;
    if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1) {
      const ang = Math.atan2(dy || 0.01, dx || 0.01);
      px = clamp(this.FIREX + Math.cos(ang) * rx, x0, x1);
      py = clamp(this.FIREY + Math.sin(ang) * ry, y0, y1);
    }
    return { x: px, y: py };
  }

  /** Enquanto anda, a câmera só entra quando o herói chega perto da borda da tela. */
  private steerCam(x: number, y: number, dirX: number, dirY: number): void {
    if (this.drag) return;
    const nx = this.edgeTarget(x, this.cam, dirX, W, 72, this.maxCamX);
    const ny = this.edgeTarget(y, this.camY, dirY, H, 58, this.maxCamY);
    if (nx != null) this.camTarget = nx;
    if (ny != null) this.camYTarget = ny;
  }

  private edgeTarget(pos: number, cam: number, dir: number, view: number, pad: number, max: number): number | null {
    const ahead = Math.sign(dir) * 28;
    const v = pos + ahead - cam;
    if (v >= pad && v <= view - pad) return null;
    const target = v < pad ? pos + ahead - pad : pos + ahead - (view - pad);
    return clamp(target, 0, max);
  }

  panBy(dx: number, dy = 0): void {
    this.camTarget = clamp((this.camTarget ?? this.cam) + dx, 0, this.maxCamX);
    this.camYTarget = clamp((this.camYTarget ?? this.camY) + dy, 0, this.maxCamY);
  }
  focusStruct(id: string): void {
    const s = this.slots.find((x) => x.id === id);
    if (!s) return;
    this.camTarget = clamp(s.x + s.largura / 2 - W / 2, 0, this.maxCamX);
    this.camYTarget = clamp(s.gy - H * 0.62, 0, this.maxCamY);
  }
  slotCenter(id: string): { x: number; gy: number } | null {
    const s = this.slots.find((x) => x.id === id);
    return s ? { x: s.x + s.largura / 2, gy: s.gy } : null;
  }

  // ---------------- atores ----------------
  private artFor(kind: Kind, id: string): { art: ActorArt; key: string } | null {
    const s = G();
    if (kind === 'hero') {
      const hc = this.preview ?? s.hero;
      if (!hc) return null;
      const w = equipped(s, 'hero');
      return { art: heroArt(hc, { familia: w.familia, tier: w.tier }), key: w.familia + w.tier + (this.preview ? JSON.stringify(this.preview) : '') };
    }
    if (kind === 'rec') { const r = s.recs.find((x) => x.id === id); return r ? { art: recruitArt(r.tipo, r.skin), key: '' } : null; }
    const p = s.pets.find((x) => x.id === id);
    return p ? { art: petArt(p.tipo, p.variante), key: '' } : null;
  }

  /** Cria/remove atores pra bater com o estado. mode: onde os novos nascem. */
  syncActors(mode: 'idle' | 'gate' = 'idle'): void {
    const s = G();
    const want: { id: string; kind: Kind }[] = [];
    if (s.hero || this.preview) want.push({ id: 'hero', kind: 'hero' });
    if (!this.soloHero) {
      s.recs.forEach((r) => want.push({ id: r.id, kind: 'rec' }));
      s.pets.forEach((p) => want.push({ id: p.id, kind: 'pet' }));
    }
    this.ents = this.ents.filter((e) => e.kind === 'zombie' || want.some((w) => w.id === e.id));
    let n = 0;
    for (const w of want) {
      n++;
      const cur = this.ents.find((e) => e.id === w.id && e.kind === w.kind);
      const a = this.artFor(w.kind, w.id);
      if (!a) continue;
      if (cur) { if (cur.key !== a.key) { cur.art = a.art; cur.key = a.key; } continue; }
      const idx = this.ents.filter((e) => e.kind === w.kind).length;
      const spot = this.placeHero(this.FIREX + rnd(-90, 90), this.FIREY + rnd(16, 70));
      const ent: Ent = {
        id: w.id, kind: w.kind, art: a.art, key: a.key,
        x: w.kind === 'hero' ? (mode === 'gate' ? this.GATE_X : this.FIREX - 72) : mode === 'gate' ? this.GATE_X - 26 * n : spot.x,
        y: w.kind === 'hero' ? (mode === 'gate' ? this.GATE_Y : this.LANE) : mode === 'gate' ? this.GATE_Y - 8 + (idx % 3) * 10 : spot.y,
        face: 1, anim: 'idle', fi: 0, acc: 0,
        tx: w.kind === 'hero' ? (mode === 'gate' ? this.FIREX - 72 : null) : mode === 'gate' ? spot.x : null,
        ty: w.kind === 'hero' ? (mode === 'gate' ? this.LANE : undefined) : mode === 'gate' ? spot.y : undefined,
        wait: rnd(0, 3), speed: w.kind === 'pet' ? 38 : 28,
      };
      if (mode === 'gate') { ent.speed = w.kind === 'hero' ? 140 : 120; }
      this.ents.push(ent);
    }
  }

  /** Tela de criação: breu total, só o recruta perto da fogueira apagada com uma luz fraca em volta. */
  startCreation(cfg: HeroCfg): void {
    this.preview = { ...cfg }; this.soloHero = true; this.locked = true;
    this.ents = [];
    this.syncActors('idle');
    this.fogoOn = false; this.fogoV = 0;
    this.dark = this.darkTarget = 1;
    this.lookAt(this.FIREX, this.FIREY, 28);
    this.zoom = this.zoomTarget = 2.4; this.heroLightR = 78; this.creating = true;
  }
  /** Atualiza a aparência do recruta durante a personalização. */
  setPreview(cfg: HeroCfg): void {
    this.preview = { ...cfg };
    const a = this.artFor('hero', 'hero'), e = this.ents.find((x) => x.kind === 'hero');
    if (a && e) { e.art = a.art; e.key = a.key; }
  }

  /** Intros: "acender" (abertura: já está na fogueira e acende), "chegada" e "volta" (entram pelo portão e o herói acende a fogueira). */
  startIntro(kind: 'chegada' | 'volta' | 'acender', lider?: string): void {
    this.introId = 'hero';
    this.preview = null; this.soloHero = false; this.locked = false; this.creating = false;
    this.ents = this.ents.filter((e) => e.kind === 'zombie');
    this.fogoOn = false; this.fogoV = 0;
    if (kind === 'acender') {
      this.syncActors('idle');
      this.intro = { phase: 'walk', t: 0, full: true }; // dá uns passos até as pedras e se ajoelha
      this.dark = this.darkTarget = 1;
      this.zoom = this.zoomTarget = 2.4; this.heroLightR = 40;
      this.lookAt(this.FIREX, this.FIREY, 28);
      return;
    }
    this.syncActors('gate');
    if (kind === 'volta' && lider && lider !== 'hero') {
      // o recruta nº 1 da expedição vem na frente da fila e é quem acende; o herói entra logo atrás
      const L = this.ents.find((e) => e.id === lider && e.kind === 'rec'), h = this.ents.find((e) => e.kind === 'hero');
      if (L) { this.introId = lider; L.x = this.GATE_X; L.y = this.GATE_Y; L.speed = 140; L.tx = null; L.ty = undefined; if (h) { h.x = this.GATE_X - 26; h.y = this.GATE_Y; h.tx = this.FIREX - 72; h.ty = this.LANE; } }
    }
    this.intro = { phase: 'walk', t: 0, full: true };
    this.dark = this.darkTarget = kind === 'volta' ? 0.72 : 0.85; // fogueira apagou enquanto o squad estava fora
    const h = this.introEnt();
    if (h) { this.lookAt(h.x, h.y, W * 0.12); }
  }

  setFire(on: boolean, instant = true): void { this.fogoOn = on; if (instant) this.fogoV = on ? 1 : 0; }

  // ---------------- ataque ----------------
  startAttack(rep: AttackReport): void {
    const ex = EXP();
    const zf = [{ id: 'errante', F: ex.ERR, w: 40 }, { id: 'corredor', F: ex.COR, w: 25 }, { id: 'rastejante', F: ex.RAS, w: 20 }, { id: 'cuspidor', F: ex.CUSP, w: 15 }];
    const total = clamp(Math.round(rep.forca / 45), 8, 24);
    const bar = this.slots.find((s) => s.id === 'barricada');
    const defX = bar ? bar.x + 16 : this.GATE_X + 120;
    const cam0 = clamp(this.GATE_X - W * 0.42, 0, this.maxCamX);
    const cam0y = clamp(this.GATE_Y - H * 0.62, 0, this.maxCamY);
    this.cam = cam0; this.camY = cam0y; this.camTarget = null; this.camYTarget = null;
    const nBreach = rep.segurou ? 0 : Math.max(3, Math.round(total * 0.4));
    for (let i = 0; i < total; i++) {
      let r = Math.random() * 100, pick = zf[0];
      for (const z of zf) { if (r < z.w) { pick = z; break; } r -= z.w; }
      const F = pick.F;
      const art: ActorArt = {
        F, has: (a) => !!F.ANIMS[a],
        frame: (a, fi) => { const an = F.ANIMS[a] ? a : 'idle', n = F.ANIMS[an].n; return F.frame('enluarado', an, ((fi % n) + n) % n, 5); },
      };
      this.ents.push({
        id: 'z' + i, kind: 'zombie', zid: pick.id, art, key: '',
        x: -20 - rnd(0, 36) - i * 5, y: this.GATE_Y - 16 + rnd(0, 36), face: 1, anim: 'walk', fi: (Math.random() * 6) | 0, acc: 0,
        tx: null, wait: 0, speed: rnd(48, 78), delay: 0.5 + i * 0.13, stopX: defX - rnd(0, 34), breach: i < nBreach, alpha: 1,
      });
    }
    const chunks: Attack['chunks'] = [];
    for (const [id, dano] of Object.entries(rep.danoDefesas) as [StructId, number][]) {
      if (!dano) continue;
      const c = this.slotCenter(id);
      const p = c ? { x: c.x, y: c.gy - 36 } : { x: this.GATE_X, y: this.GATE_Y - 40 };
      for (let k = 0; k < 4; k++) chunks.push({ t: 2.7 + k * 0.5 + rnd(0, 0.3), id, v: Math.max(1, Math.round(dano / 4)), x: p.x + rnd(-14, 14), y: p.y + rnd(-6, 6), done: false });
    }
    this.attack = { rep, t: 0, total: 7.6, revealed: false, chunks, cam0, cam0y, hitT: 0 };
    this.hooks.onAttackStart(rep);
  }

  skipAttack(): void { if (this.attack) this.endAttack(); }

  private endAttack(): void {
    const a = this.attack;
    if (!a) return;
    this.attack = null;
    this.ents = this.ents.filter((e) => e.kind !== 'zombie');
    this.shake = 0; this.cv.style.transform = '';
    this.camTarget = clamp(this.FIREX - W / 2, 0, this.maxCamX);
    this.camYTarget = clamp(this.FIREY - H * 0.58, 0, this.maxCamY);
    this.hooks.onAttackEnd(a.rep);
  }

  // ---------------- update ----------------
  private stepAnim(e: Ent, dt: number): void {
    const F = e.art.F, A = F.ANIMS[e.art.has(e.anim) ? e.anim : 'idle'];
    e.acc += dt * 1000;
    let d = A.dur(e.fi % A.n);
    let guard = 8;
    while (e.acc >= d && guard-- > 0) { e.acc -= d; e.fi++; d = A.dur(e.fi % A.n); }
  }

  private petWalk(e: Ent): string { return e.art.has('walk') ? 'walk' : e.art.has('fly') ? 'fly' : 'idle'; }

  update(dt: number): void {
    this.T += dt;
    if (this.camTarget != null && !this.intro && !this.drag) {
      this.cam += (this.camTarget - this.cam) * Math.min(1, dt * 6);
      if (Math.abs(this.camTarget - this.cam) < 0.5) { this.cam = this.camTarget; this.camTarget = null; }
    }
    if (this.camYTarget != null && !this.intro && !this.drag) {
      this.camY += (this.camYTarget - this.camY) * Math.min(1, dt * 6);
      if (Math.abs(this.camYTarget - this.camY) < 0.5) { this.camY = this.camYTarget; this.camYTarget = null; }
    }
    this.fogoV = this.fogoOn ? Math.min(1, this.fogoV + dt * 1.5) : Math.max(0, this.fogoV - dt * 2);
    this.dark += (this.darkTarget - this.dark) * Math.min(1, dt * (this.darkTarget < this.dark ? 0.9 : 3));
    this.zoom += (this.zoomTarget - this.zoom) * Math.min(1, dt * 0.9);
    if (Math.abs(this.zoom - this.zoomTarget) < 0.002) this.zoom = this.zoomTarget;
    // com zoom, o herói é gerado em resolução maior (detalhe real, não pixel ampliado)
    const wantK = sceneK(this.zoom);
    if (HUB().PIX.getK() !== wantK) HUB().PIX.setK(wantK);
    if (this.attack) this.updAttack(dt);
    this.updEnts(dt);
    this.updFx(dt);
    this.spawnDamageFx(dt);
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 14);
      const m = this.shake;
      this.cv.style.transform = m > 0.05 ? `translate(${((Math.random() - 0.5) * m * 3).toFixed(1)}px, ${((Math.random() - 0.5) * m * 3).toFixed(1)}px)` : '';
    }
    this.refreshTag();
  }

  private updEnts(dt: number): void {
    const intro = this.intro;
    for (const e of this.ents) {
      if (e.kind === 'zombie') continue;
      if (intro && e === this.introEnt()) { this.stepIntro(e, intro, dt); if (e.anim !== 'acender') this.stepAnim(e, dt); continue; }
      if (e.kind === 'hero') { // parado na fogueira; anda no teclado ou quando o jogador toca no chão
        const mv = this.steer();
        if (mv) {
          e.tx = null; e.ty = undefined;
          const len = Math.hypot(mv.x, mv.y);
          const p = this.placeHero(e.x + (mv.x / len) * HERO_WALK * dt, e.y + (mv.y / len) * HERO_WALK * dt);
          e.x = p.x; e.y = p.y;
          if (mv.x) e.face = mv.x > 0 ? 1 : -1;
          e.anim = 'walk';
          this.steerCam(e.x, e.y, mv.x, mv.y);
        } else if (e.tx != null) {
          const dx = e.tx - e.x, dy = (e.ty ?? e.y) - e.y, d = Math.hypot(dx, dy);
          if (d < 1.5) { e.tx = null; e.ty = undefined; e.anim = 'idle'; }
          else { const v = Math.min(d, e.speed * dt); e.x += (dx / d) * v; e.y += (dy / d) * v; if (Math.abs(dx) > 0.5) e.face = dx >= 0 ? 1 : -1; e.anim = 'walk'; }
        } else e.anim = 'idle';
        this.stepAnim(e, dt); continue;
      }
      if (e.tx === null) {
        e.wait -= dt; e.anim = 'idle';
        if (e.wait <= 0) { const p = this.placeHero(this.FIREX + rnd(-120, 120), this.FIREY + rnd(-40, 90)); e.tx = p.x; e.ty = p.y; }
      } else {
        const dx = e.tx - e.x, dy = (e.ty ?? e.y) - e.y, d = Math.hypot(dx, dy);
        if (d < 2) { e.tx = null; e.ty = undefined; e.wait = 2 + Math.random() * 4; if (e.speed > 60) e.speed = e.kind === 'pet' ? 38 : 28; }
        else {
          const v = Math.min(d, e.speed * dt);
          e.x += (dx / d) * v; e.y += (dy / d) * v;
          if (Math.abs(dx) > 0.5) e.face = dx >= 0 ? 1 : -1;
          e.anim = e.kind === 'pet' ? this.petWalk(e) : 'walk';
        }
      }
      this.stepAnim(e, dt);
    }
    if (intro) {
      const h = this.introEnt();
      if (h) {
        this.cam += (clamp(h.x - W * 0.34, 0, this.maxCamX) - this.cam) * Math.min(1, dt * 8);
        this.camY += (clamp(h.y - H * 0.62, 0, this.maxCamY) - this.camY) * Math.min(1, dt * 8);
      }
    }
    // zumbis
    const a = this.attack;
    if (a) for (const z of this.ents) if (z.kind === 'zombie') this.stepZombie(z, a, dt);
  }

  private stepIntro(e: Ent, intro: Intro, dt: number): void {
    intro.t += dt;
    // abertura completa: chega perto das pedras e acende de verdade (anim 'acender' do herói, quadros por fase)
    const destX = intro.full ? this.FIREX - 54 : this.FIREX - 72;
    const destY = intro.full ? this.FIREY + 8 : this.LANE;
    const AC = (fi: number) => { e.anim = 'acender'; e.fi = fi; e.acc = 0; };
    if (intro.phase === 'walk') {
      const dx = destX - e.x, dy = destY - e.y, d = Math.hypot(dx, dy);
      e.anim = 'walk';
      if (Math.abs(dx) > 0.5) e.face = dx >= 0 ? 1 : -1;
      if (d < 3) {
        e.x = destX; e.y = destY; e.anim = 'idle'; e.fi = 0; intro.t = 0;
        if (intro.full) intro.phase = 'crouch'; else this.endIntro(e);
      } else {
        const v = Math.min(d, e.speed * dt);
        e.x += (dx / d) * v; e.y += (dy / d) * v;
      }
    } else if (intro.phase === 'crouch') {
      // 0-2: dobra os joelhos até ajoelhar numa perna; 3: tira o fósforo
      AC(intro.t < 0.11 ? 0 : intro.t < 0.22 ? 1 : intro.t < 0.4 ? 2 : 3);
      if (intro.t > 0.55) { intro.phase = 'spark'; intro.t = 0; }
    } else if (intro.phase === 'spark') {
      // risca (4: chama alta), aproxima da lenha e a chama tremula (5/6)
      const t = intro.t; AC(t < 0.14 ? 4 : 5 + (Math.floor((t - 0.14) / 0.12) % 2));
      if (t > 0.14 && Math.random() < 0.7) this.fx.push({ kind: 'spark', x: this.FIREX - 30 + Math.random() * 12, y: this.LANE - 6, vx: 0, vy: -12 - Math.random() * 22, t: 0, life: 0.7 });
      if (intro.t > 0.9) { intro.phase = 'fire'; intro.t = 0; this.fogoOn = true; this.darkTarget = 0; this.zoomTarget = 1; }
    } else if (intro.phase === 'fire') {
      AC(7); // sopra a brasa enquanto o fogo pega
      if (intro.t > 0.9) { intro.phase = 'stand'; intro.t = 0; }
    } else {
      AC(intro.t < 0.16 ? 8 : 9);
      if (intro.t > 0.36) { e.anim = 'idle'; e.fi = 0; this.endIntro(e); }
    }
  }

  private endIntro(e: Ent): void {
    this.intro = null; e.tx = null; e.ty = undefined;
    for (const x of this.ents) if (x.kind !== 'zombie' && x.speed > 60) x.speed = x.kind === 'pet' ? 38 : 28;
    this.camTarget = clamp(this.FIREX - W / 2, 0, this.maxCamX);
    this.camYTarget = clamp(this.FIREY - H * 0.58, 0, this.maxCamY);
    this.hooks.onIntroEnd();
  }

  private stepZombie(z: Ent, a: Attack, dt: number): void {
    const t = a.t;
    if (t < (z.delay ?? 0)) { z.alpha = 0; return; }
    if (!z.started) { z.started = true; z.alpha = 1; }
    const fadeT = 6.3;
    if (t >= fadeT) {
      z.alpha = Math.max(0, (z.alpha ?? 1) - dt / 1.0);
      if (z.breach && z.x < this.FIREX - 90) { z.x += z.speed * dt; z.anim = 'walk'; } else z.anim = z.art.has('hurt') ? 'hurt' : 'idle';
    } else if (z.breach && t > 4.6) {
      z.anim = 'walk'; z.x += z.speed * 1.25 * dt;
    } else if (z.x < (z.stopX ?? 300)) {
      z.anim = 'walk'; z.x += z.speed * dt;
      if (z.x >= (z.stopX ?? 300)) { z.x = z.stopX ?? 300; z.arrived = true; z.anim = 'attack'; z.fi = 0; }
    } else { z.anim = 'attack'; }
    this.stepAnim(z, dt);
  }

  private updAttack(dt: number): void {
    const a = this.attack!;
    a.t += dt;
    for (const c of a.chunks) {
      if (c.done || a.t < c.t) continue;
      c.done = true; this.shake = 1;
      this.fx.push({ kind: 'num', x: c.x, y: c.y, vx: 0, vy: -16, t: 0, life: 1.1, text: '-' + c.v, color: '#ff4d5e' });
      for (let k = 0; k < 4; k++) this.fx.push({ kind: 'spark', x: c.x + rnd(-8, 8), y: c.y + 12, vx: rnd(-20, 20), vy: -rnd(8, 30), t: 0, life: 0.5 });
    }
    // câmera: segue a horda quando passa
    if (!a.rep.segurou && a.t > 4.6) {
      const k = clamp((a.t - 4.6) / 1.6, 0, 1);
      const tx = clamp(this.FIREX - W * 0.35, 0, this.maxCamX);
      const ty = clamp(this.FIREY - H * 0.5, 0, this.maxCamY);
      this.cam = a.cam0 + (tx - a.cam0) * k;
      this.camY = a.cam0y + (ty - a.cam0y) * k;
    } else { this.cam = a.cam0; this.camY = a.cam0y; }
    if (!a.revealed && a.t > (a.rep.segurou ? 3.2 : 5.3)) {
      a.revealed = true;
      for (const id of a.rep.danificadas) {
        const c = this.slotCenter(id);
        if (c) for (let k = 0; k < 14; k++) this.fx.push({ kind: 'smoke', x: c.x + rnd(-30, 30), y: c.gy - rnd(20, 50), vx: rnd(-4, 4), vy: -rnd(10, 24), t: 0, life: rnd(1, 2) });
      }
    }
    // "tremor" suave enquanto a horda bate
    if (a.t > 2.4 && a.t < 5.8 && Math.random() < dt * 3) this.shake = Math.max(this.shake, 0.5);
    if (a.t >= a.total) this.endAttack();
  }

  /** fumaça e faíscas contínuas nas estruturas danificadas */
  private spawnDamageFx(dt: number): void {
    this.smokeAcc += dt;
    if (this.smokeAcc < 0.12) return;
    this.smokeAcc = 0;
    const s = G();
    for (const sl of this.slots) {
      const id = sl.id as StructId;
      if (!this.isDamaged(id)) continue;
      const cx = sl.x + sl.largura / 2;
      if (Math.abs(cx - this.cam - W / 2) > W || Math.abs(sl.gy - this.camY - H / 2) > H) continue;
      this.fx.push({ kind: 'smoke', x: cx + rnd(-26, 26), y: sl.gy - rnd(24, 44), vx: rnd(-3, 3), vy: -rnd(8, 18), t: 0, life: rnd(1.2, 2.2) });
      if (Math.random() < 0.25) this.fx.push({ kind: 'spark', x: cx + rnd(-24, 24), y: sl.gy - rnd(20, 40), vx: rnd(-14, 14), vy: -rnd(10, 26), t: 0, life: 0.6 });
    }
    void s;
  }

  private isDamaged(id: StructId): boolean {
    const s = G();
    if (!needsRepair(s, id)) return false;
    if (this.attack && !this.attack.revealed && this.attack.rep.danificadas.includes(id)) return false;
    // defesas só "pegam fogo" se perderam bastante vida
    if (STRUCTS[id].cat === 'defesa') return (s.estruturas[id]?.hp ?? 0) < maxHp(s, id) * 0.6;
    return true;
  }

  private updFx(dt: number): void {
    for (const f of this.fx) {
      f.t += dt; f.y += f.vy * dt;
      f.x += f.kind === 'spark' ? f.vx * dt : f.kind === 'smoke' ? f.vx * dt + Math.sin(f.t * 3) * 0.2 : Math.sin(f.t * 8) * 0.2;
      if (f.kind === 'spark') f.vy += 40 * dt * (f.vx !== 0 ? 1 : 0);
    }
    this.fx = this.fx.filter((f) => f.t < f.life);
    if (this.fx.length > 260) this.fx.splice(0, this.fx.length - 260);
  }

  private refreshTag(): void {
    const s = G();
    const nome = s.hero?.nome ?? 'Herói';
    if (this.attack) this.tag = '<b>LUA DE SANGUE</b> · a horda ataca o abrigo!';
    else if (this.intro) this.tag = this.intro.phase === 'walk' ? `<b>${nome}</b> ${this.intro.full ? 'chegando…' : 'e o squad voltando…'}` : this.intro.phase === 'stand' ? `<b>${nome}</b>: lar, doce lar.` : `<b>${nome}</b> acendendo a fogueira`;
    else if (s.obra) this.tag = `Obra: <b>${STRUCTS[s.obra.id].nome}</b> nv ${s.obra.nv} · ${Math.max(0, Math.ceil((s.obra.fim - Date.now()) / 1000))} s`;
    else this.tag = 'Abrigo · <b>Marco Zero</b> · WASD ou setas pra andar · toque numa estrutura';
  }

  // ---------------- desenho ----------------
  // pré-geração dos quadros dos atores (todas as animações) em fatias pequenas, pra troca de animação não travar
  private warm = new Warmer();
  private warmed = new WeakSet<ActorArt>();
  private modalsQ = false;
  private bank = 0;
  private warm0 = 0;
  private lastDraw = 0;
  private warmStep(t0: number): void {
    // ícones dos modais (mapa/bestiário): no tempo livre, depois dos atores
    if (!this.warm0) this.warm0 = t0;
    if (!this.modalsQ && !this.preview && t0 - this.warm0 > 2500) { this.modalsQ = true; prewarmMapPreviews(); void preloadModalCache().then(() => this.warm.add(modalIconJobs())); } // depois da abertura, no fim da fila
    for (const e of this.ents) {
      if (this.warmed.has(e.art)) continue;
      this.warmed.add(e.art);
      if (this.preview && e.kind === 'hero') this.warm.clear(); // criação: só a aparência atual importa
      const art = e.art, F = art.F, K = HUB().PIX.getK(), core = e.kind === 'zombie' ? ['walk', 'attack', 'idle', 'hurt'] : ['idle', 'walk', 'fly'];
      const mk = (names: string[]) => names.filter((a) => F.ANIMS[a]).flatMap((an) => Array.from({ length: F.ANIMS[an].n }, (_, fi) => ({ k: e.kind + e.id + e.key + an + fi + '@' + K, g: e.kind, run: () => { art.frame(an, fi); } })));
      this.warm.add(mk(core), true); // o que cada ator usa já vai na frente; o resto do kit depois
      // criação: só aparece parado — o kit inteiro em resolução de zoom seria trabalho (e engasgo) à toa
      if (e.kind !== 'zombie' && !this.preview) this.warm.add(mk(Object.keys(F.ANIMS).filter((a) => !core.includes(a))));
    }
    // banco de tempo (meta 30 ms/quadro), igual à expedição: em máquina lenta ainda avança sem derrubar a média
    const dt = this.lastDraw ? t0 - this.lastDraw : 16; this.lastDraw = t0;
    this.bank = Math.max(-100, Math.min(150, this.bank + BANK_MS - dt));
    if (!this.warm.pending || this.bank <= 0) return;
    const el = performance.now() - t0, c = this.warm.nextCost();
    this.bank -= this.warm.run(Math.max(0, Math.min(8, this.bank, 22 - el)), heavyOk(this.bank, el, c) ? this.bank : 0);
  }

  draw(): void {
    const t0 = performance.now();
    const s = G();
    const estruturas: Record<string, number> = {};
    for (const [id, e] of Object.entries(s.estruturas)) if (e) estruturas[id] = e.nv;
    // com zoom (criação/abertura) fica a noite limpa; senão, hora e clima do mundo; ataque = Lua de Sangue
    const a = this.zoom > 1.01 || this.dark > 0.5 ? null : this.amb;
    const Q = settings.q; // preset gráfico: clima e brilhos são só enfeite
    this.AB.setFireFps?.(Q.fireFps);
    const state = { estruturas, fogo: this.fogoV, noite: true, lua: !!this.attack || a?.ceu === 'lua', ceu: a?.ceu, clima: Q.clima ? a?.clima : undefined, noGlow: !Q.glow, obra: s.obra ? { id: s.obra.id } : null, camY: this.camY };
    const g = this.g;
    g.setTransform(...this.view()); // unidades lógicas (com zoom no herói na criação/abertura)
    try {
      this.AB.draw(g, this.cam, state, this.T, { drawActors: (gg: CanvasRenderingContext2D, c: number, lo = -1e9, hi = 1e9) => this.drawEnts(gg, c, lo, hi) });
    } catch (err) { console.error(err); }
    if (this.dark > 0.01) this.drawDark(g);
    this.drawOverlays(g, s);
    if (this.attack) this.drawAttackTint(g);
    this.warmStep(t0);
  }

  /** Matriz de desenho: escala RS e, com zoom, o herói fica grande à esquerda da tela. */
  private view(): [number, number, number, number, number, number] {
    const z = this.zoom;
    if (z <= 1.001) return [RS, 0, 0, RS, 0, 0];
    const hero = this.ents.find((e) => e.kind === 'hero'), hx = (hero ? hero.x : this.FIREX) - this.cam, hy = ((hero ? hero.y : this.LANE) - this.camY) - 34;
    const k = (z - 1) / 1.4; // 0..1 (zoom 1 → 2.4)
    const fx = W / 2 + (W * 0.3 - W / 2) * Math.min(1, k), fy = H / 2 + (H * 0.56 - H / 2) * Math.min(1, k);
    return [RS * z, 0, 0, RS * z, (fx - hx * z) * RS, (fy - hy * z) * RS];
  }

  private drawEnts(g: CanvasRenderingContext2D, cam: number, lo = -1e9, hi = 1e9): void {
    const list = this.ents.filter((e) => e.y >= lo && e.y < hi).sort((a, b) => a.y - b.y);
    for (const e of list) {
      const x = Math.round(e.x - cam), y = Math.round(e.y - this.camY);
      if (x < -90 || x > W + 90 || y < -90 || y > H + 90) continue;
      if (e.kind === 'zombie') { this.drawZombie(g, e, x, y); continue; }
      const fly = e.kind === 'pet' && e.anim === 'fly' ? -18 : 0;
      const cv = e.art.frame(e.anim, e.fi), a = anchor(e.art.F, cv), d = RS * (HUB().PIX.getK() / SK);
      if (settings.q.shadows) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x - 10, y - 1, 20, 3); }
      g.save(); g.translate(x, y + fly); if (e.face < 0) g.scale(-1, 1);
      g.drawImage(cv, -a.ax / d, -a.gy / d, cv.width / d, cv.height / d);
      // fósforo dos recrutas acendendo (o herói já desenha o dele no sprite)
      const hd = (cv as any)._hand;
      if (e.anim === 'acender' && e.kind !== 'hero' && hd && e.fi >= 3 && e.fi <= 6) this.drawMatch(g, (hd.x - a.ax) / d, (hd.y - a.gy) / d, e.fi === 3 ? 0 : e.fi === 5 ? 1 : 2);
      g.restore();
    }
  }

  /** palito + chama (0 só palito, 1 chama, 2 chama alta) em unidades lógicas, relativo à mão */
  private drawMatch(g: CanvasRenderingContext2D, hx: number, hy: number, st: number): void {
    const px = (c: string, x: number, y: number, w: number, h: number) => { g.fillStyle = c; g.fillRect(Math.round((hx + x) * 2) / 2, Math.round((hy + y) * 2) / 2, w, h); };
    px('#e8d8b0', 1, -3.5, 1, 3.5); px('#c83a2a', 0.5, -4.5, 2, 1.2);
    if (!st) return;
    const big = st >= 2, fh = big ? 5 : 3.5;
    px('#ff7a2a', big ? -0.5 : 0, -4.5 - fh, big ? 4 : 3, fh); px('#ffd23f', big ? 0.5 : 0.5, -4 - fh * 0.75, big ? 2 : 2, fh * 0.7); px('#fffbe8', 1, -5.5, 1, 1.5);
  }

  private drawZombie(g: CanvasRenderingContext2D, e: Ent, x: number, y: number): void {
    if (!e.alpha) return;
    const cv = e.art.frame(e.anim, e.fi);
    let ax: number, gy: number;
    if (e.art.F.AX != null) ({ ax, gy } = anchor(e.art.F, cv));
    else { const d = ZOMBIES[e.zid as keyof typeof ZOMBIES], k = SK; ax = d.ax * k; gy = d.G * k; }
    if (settings.q.shadows) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x - 10, y - 1, 20, 3); }
    g.save();
    g.globalAlpha = e.alpha;
    g.translate(x, y);
    if (e.face < 0) g.scale(-1, 1);
    g.drawImage(cv, -ax / RS, -gy / RS, cv.width / RS, cv.height / RS);
    g.restore();
  }

  /** Breu com uma bola de luz fraca em volta do herói (e faíscas da fogueira quando está acendendo). */
  private drawDark(g: CanvasRenderingContext2D): void {
    const [dc, dg] = this.darkLayer;
    dg.setTransform(1, 0, 0, 1, 0, 0);
    dg.globalCompositeOperation = 'source-over';
    dg.clearRect(0, 0, dc.width, dc.height);
    dg.fillStyle = `rgba(3,2,9,${(0.975 * this.dark).toFixed(3)})`;
    dg.fillRect(0, 0, dc.width, dc.height);
    dg.setTransform(...this.view());
    dg.globalCompositeOperation = 'destination-out';
    const hole = (x: number, y: number, r: number, a: number) => {
      const gr = dg.createRadialGradient(x, y, 0, x, y, r);
      if (this.creating) { gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.62, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
      else { gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
      dg.fillStyle = gr; dg.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const hero = this.intro ? this.introEnt() : this.ents.find((e) => e.kind === 'hero');
    const fl = 1 + 0.06 * Math.sin(this.T * 7) + 0.03 * Math.sin(this.T * 13);
    if (hero) hole(hero.x - this.cam, hero.y - this.camY - (this.creating ? 34 : 30), this.heroLightR * (this.creating ? 1 + (fl - 1) * 0.3 : fl), this.creating ? 1 : 0.95);
    if (this.intro && (this.intro.phase === 'spark' || this.intro.phase === 'crouch')) hole(this.FIREX - this.cam, this.FIREY - this.camY - 8, 10 + Math.random() * 10, 0.7);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(dc, 0, 0); g.restore();
    if (hero) { // luz quente bem fraca
      const x = hero.x - this.cam, y = hero.y - this.camY - 30, r = this.heroLightR * 0.85 * fl;
      g.save(); g.setTransform(...this.view()); g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(255,190,120,${((this.creating ? 0.2 : 0.12) * this.dark).toFixed(3)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      if (this.creating) { // lanterna pendurada acima: cone de luz fria-neutra de cima pra baixo + chão iluminado
        const top = y - 70, fy = hero.y - this.camY + 2;
        const cone = g.createLinearGradient(x, top, x, fy);
        cone.addColorStop(0, 'rgba(255,236,200,0.16)'); cone.addColorStop(1, 'rgba(255,236,200,0.04)');
        g.fillStyle = cone; g.beginPath(); g.moveTo(x - 8, top); g.lineTo(x + 8, top); g.lineTo(x + 46, fy); g.lineTo(x - 46, fy); g.closePath(); g.fill();
        const pool = g.createRadialGradient(x, fy, 0, x, fy, 48);
        pool.addColorStop(0, 'rgba(255,230,190,0.18)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = pool; g.save(); g.translate(x, fy); g.scale(1, 0.28); g.translate(-x, -fy); g.fillRect(x - 48, fy - 48, 96, 96); g.restore();
      }
      g.restore();
    }
  }

  private drawAttackTint(g: CanvasRenderingContext2D): void {
    const a = this.attack!;
    const pulse = 0.03 + 0.03 * Math.sin(this.T * 6) + (this.shake > 0.3 ? 0.06 : 0); // o cenário já pinta a Lua de Sangue
    g.fillStyle = `rgba(160,10,30,${pulse.toFixed(3)})`;
    g.fillRect(0, 0, W, H);
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.65);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,0,10,.3)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    void a;
  }

  private drawOverlays(g: CanvasRenderingContext2D, s: ReturnType<typeof G>): void {
    const cam = Math.round(this.cam);
    // partículas
    const sparks = settings.q.sparks;
    for (const f of this.fx) {
      const x = Math.round(f.x - cam), y = Math.round(f.y - this.camY), k = f.t / f.life;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 30) continue;
      if (!sparks && f.kind !== 'num') continue; // Desempenho: sem faíscas/fumaça (números de dano ficam)
      if (f.kind === 'spark') { g.fillStyle = k < 0.4 ? '#ffd23f' : '#ff6a2a'; g.globalAlpha = 1 - k; g.fillRect(x, y, 1, 1); }
      else if (f.kind === 'smoke') { const r = 2 + k * 5; g.globalAlpha = (1 - k) * 0.45; g.fillStyle = k < 0.5 ? '#4a4452' : '#2e2a34'; g.fillRect(x - r, y - r, r * 2, r * 2); }
      else {
        g.globalAlpha = 1 - k * k; g.font = 'bold 11px "LDS Digitos", "Pixelify Sans", monospace'; g.textAlign = 'center';
        g.fillStyle = '#000'; g.fillText(f.text ?? '', x + 1, y + 1); g.fillStyle = f.color ?? '#fff'; g.fillText(f.text ?? '', x, y);
      }
      g.globalAlpha = 1;
    }
    if (this.attack) return;
    // obra: andaime + contagem
    if (s.obra) {
      const sl = this.slots.find((x) => x.id === s.obra!.id);
      if (sl) {
        const cx = Math.round(sl.x + sl.largura / 2 - cam), gy = sl.gy - this.camY;
        if (cx > -80 && cx < W + 80 && gy > -20 && gy < H + 40) {
          g.fillStyle = '#6a4e30';
          g.fillRect(cx - 28, gy - 46, 2, 46); g.fillRect(cx + 26, gy - 46, 2, 46);
          g.fillStyle = '#8a6a42';
          g.fillRect(cx - 30, gy - 44, 60, 2); g.fillRect(cx - 30, gy - 26, 60, 2); g.fillRect(cx - 30, gy - 8, 60, 2);
          for (let i = 0; i < 4; i++) g.fillRect(cx - 28 + i * 14, gy - 44 + i * 4, 2, 12);
          const secs = Math.max(0, Math.ceil((s.obra.fim - Date.now()) / 1000));
          this.chip(g, cx, gy - 58, `${secs}s`, '#ffd23f');
        }
      }
    }
    // ícones por estrutura
    for (const sl of this.slots) {
      const id = sl.id as StructId, e = s.estruturas[id];
      if (!e || e.nv <= 0) continue;
      const cx = Math.round(sl.x + sl.largura / 2 - cam);
      const gy = sl.gy - this.camY;
      if (cx < -30 || cx > W + 30 || gy < -10 || gy > H + 40) continue;
      const top = Math.max(18, gy - 74);
      if (this.isDamaged(id)) { this.warnIcon(g, cx, top + Math.sin(this.T * 4) * 2); continue; }
      const def = STRUCTS[id];
      if (def.prod && Math.floor(s.prodBuf[id] ?? 0) >= 1) {
        const amt = Math.floor(s.prodBuf[id] ?? 0), r = RESOURCES[def.prod.res];
        const by = Math.round(top + Math.sin(this.T * 3 + sl.x) * 2.5);
        const res = def.prod.res, icv = withHubK(SK, () => itemFrame(res, Math.floor(this.T * 8))); // desenhado a 1:1 (/RS): sempre na escala padrão
        if (icv) { const a = itemAnchor(def.prod.res, icv); g.drawImage(icv, cx - a.ax / RS, by + 6 - a.gy / RS, icv.width / RS, icv.height / RS); }
        else { g.fillStyle = '#000'; g.fillRect(cx - 6, by - 6, 12, 12); g.fillStyle = r.cor; g.fillRect(cx - 5, by - 5, 10, 10); }
        this.chip(g, cx, by + 15, '+' + amt, '#fff');
      }
    }
  }

  private chip(g: CanvasRenderingContext2D, cx: number, y: number, text: string, color: string): void {
    g.font = 'bold 9px "LDS Digitos", "Pixelify Sans", monospace'; g.textAlign = 'center';
    const w = Math.ceil(g.measureText(text).width) + 6;
    g.fillStyle = 'rgba(10,4,20,.8)'; g.fillRect(cx - w / 2, y - 9, w, 12);
    g.fillStyle = color; g.fillText(text, cx, y);
  }

  private warnIcon(g: CanvasRenderingContext2D, cx: number, y: number): void {
    const p = 0.65 + 0.35 * Math.sin(this.T * 6);
    y = Math.round(y);
    g.globalAlpha = p;
    for (let r = 0; r < 11; r++) { g.fillStyle = '#000'; g.fillRect(cx - r - 1, y + r - 5, r * 2 + 3, 1); }
    for (let r = 1; r < 10; r++) { g.fillStyle = '#ffb030'; g.fillRect(cx - r, y + r - 5, r * 2 + 1, 1); }
    g.fillStyle = '#1a0d00'; g.fillRect(cx, y + 1, 1, 4); g.fillRect(cx, y + 6, 1, 1);
    g.globalAlpha = 1;
  }
}
