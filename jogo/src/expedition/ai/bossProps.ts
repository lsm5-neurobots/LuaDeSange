// Adereços dos chefes novos (Estivador, Ascensorista, Vendedor de Fitas, Erveira): objetos do mundo com arte da
// própria factory do chefe (animações com {prop:true}, pré-aquecidas junto com ele). Desenhados como atores extras
// (ordenados por y com o resto do palco). Caixotes bloqueiam o caminho de lutadores e zumbis e quebram com 3 golpes.
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { fa, hurtF, stunF } from '../fighter';
import { dropItem } from '../pickups';

export type PropKind = 'crate' | 'cabin' | 'bottle' | 'lasso' | 'pool' | 'roots';

export interface BossProp {
  kind: PropKind;
  owner: Zombie;
  /** posição no chão (x, y) e altura (z) */
  x: number; y: number; z: number;
  /** voo: origem/destino e duração (s) */
  x0: number; y0: number; z0: number; x1: number; y1: number; arc: number; fly: number;
  t: number; life: number; delay: number;
  st: number; hp: number; rot: number; spin: number;
  done: boolean; landed: boolean;
  onLand?: (p: BossProp) => void;
  actor: ExtraActor;
  warn?: any;
  hitT: Map<Fighter, number>;
  [k: string]: any;
}

const LISTS = new WeakMap<World, BossProp[]>();
export const propsOf = (w: World): BossProp[] => { let l = LISTS.get(w); if (!l) { l = []; LISTS.set(w, l); } return l; };

const ART: Record<PropKind, string> = { crate: 'xCrate', cabin: 'xCabin', bottle: 'xBottle', lasso: 'xLasso', pool: 'xPool', roots: 'xRoots' };

function frameOf(w: World, p: BossProp, fi: number): any {
  const F = p.owner.K.F, an = ART[p.kind], A = F.ANIMS[an];
  if (!A || !F.framePose) return null;
  const i = Math.max(0, Math.min(A.n - 1, fi));
  const P = w.A.TWEEN.poseAt(F, an, i, 0, false);
  return F.framePose('normal', an, P, an + i + '.0');
}

function removeProp(w: World, p: BossProp): void {
  p.done = true;
  if (w.actors) { const i = w.actors.indexOf(p.actor); if (i >= 0) w.actors.splice(i, 1); }
  if (p.warn) w.warns = w.warns.filter((x) => x !== p.warn);
  const l = propsOf(w), j = l.indexOf(p); if (j >= 0) l.splice(j, 1);
}

/** Cria um adereço. Voo: de (x0,y0,z0) até (x1,y1) em `fly` s com arco `arc` (0 = parado/queda). */
export function addProp(w: World, owner: Zombie, kind: PropKind, o: Partial<BossProp>): BossProp {
  const p: BossProp = {
    kind, owner, x: o.x ?? o.x1 ?? 0, y: o.y ?? o.y1 ?? 176, z: o.z ?? 0, x0: o.x0 ?? o.x ?? 0, y0: o.y0 ?? o.y ?? 176, z0: o.z0 ?? 0,
    x1: o.x1 ?? o.x ?? 0, y1: o.y1 ?? o.y ?? 176, arc: o.arc ?? 0, fly: o.fly ?? 0, t: 0, life: o.life ?? 5, delay: o.delay ?? 0,
    st: o.st ?? 0, hp: o.hp ?? 3, rot: 0, spin: o.spin ?? 0, done: false, landed: !(o.fly && o.fly > 0), onLand: o.onLand, warn: o.warn,
    hitT: new Map(), actor: null as unknown as ExtraActor,
  };
  Object.assign(p, o.extra ?? {});
  const actor: ExtraActor = {
    x: p.x, y: p.y, w0: kind === 'crate' ? 12 : kind === 'cabin' ? 16 : kind === 'pool' || kind === 'roots' ? 0 : 3,
    draw: (c, cam) => {
      if (p.done) return;
      if (p.owner.dead && p.owner.deathEnd != null) { removeProp(w, p); return; } // chefe morreu: some junto com o corpo
      if (p.delay > 0) return;
      let fi = p.st;
      if (p.kind === 'bottle' || p.kind === 'lasso') fi = Math.floor(w.clock * 12) % 2;
      if (p.kind === 'pool') fi = Math.floor(w.clock * 4) % 2;
      const cv = frameOf(w, p, fi); if (!cv) return;
      const fade = p.kind === 'pool' ? Math.min(1, p.life * 1.5) : p.st === 2 || (p.kind === 'cabin' && p.st === 1) ? Math.min(1, p.life * 2) : 1;
      c.save(); c.globalAlpha = Math.max(0, fade);
      c.translate(Math.round(p.x - cam), Math.round(p.y - p.z));
      if (p.rot) c.rotate(p.rot);
      if (p.kind === 'lasso' && p.owner.face < 0) c.scale(-1, 1);
      c.drawImage(cv, -cv._ax / RS, -cv._gy / RS, cv.width / RS, cv.height / RS);
      c.restore();
      if (p.kind === 'lasso' && !p.landed) { // fita esticada da mão até o laço
        const z = p.owner, hx = z.x + z.face * 22 - cam, hy = z.y - 74;
        c.fillStyle = '#170b1c'; ribbonLine(c, hx, hy, p.x - cam, p.y - p.z, 2); c.fillStyle = '#f0c63c'; ribbonLine(c, hx, hy, p.x - cam, p.y - p.z, 1);
      }
    },
  };
  p.actor = actor;
  (w.actors ??= []).push(actor);
  propsOf(w).push(p);
  return p;
}

function ribbonLine(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, s: number): void {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1));
  for (let k = 0; k <= n; k++) { const t = k / n; c.fillRect(Math.round(x0 + (x1 - x0) * t - s / 2), Math.round(y0 + (y1 - y0) * t + Math.sin(t * 9) * 1.2 - s / 2), s, s); }
}

// ---------------- caixotes ----------------
const CW = 15, CD = 7;
export const cratesOf = (w: World) => propsOf(w).filter((p) => p.kind === 'crate' && p.landed && p.st < 2 && !p.done);

/** Caixote no caminho entre a e b na mesma faixa? Devolve o x da borda onde o puxão para. */
export function crateBetween(w: World, ax: number, bx: number, y: number): number | null {
  let best: number | null = null;
  for (const c of cratesOf(w)) {
    if (Math.abs(c.y - y) > CD + 3) continue;
    if ((c.x - ax) * (c.x - bx) >= 0) continue;
    const edge = c.x + Math.sign(ax - bx) * (CW + 2);
    if (best == null || Math.abs(edge - ax) < Math.abs(best - ax)) best = edge;
  }
  return best;
}

export function hitCrate(w: World, c: BossProp, n = 1): void {
  if (c.st >= 2 || c.done) return;
  c.hp -= n;
  w.shake = Math.max(w.shake, 0.06);
  spawnFx(w, 'hitspark', c.x, c.y - 10, 1);
  for (let i = 0; i < 5; i++) w.sparks.push({ x: c.x + (Math.random() - 0.5) * 16, y: c.y - 10, vx: (Math.random() - 0.5) * 90, vy: -30 - Math.random() * 50, t: 0, c: '#ae8650' });
  if (c.hp <= 0) breakCrate(w, c, true);
  else c.st = 1;
}
export function breakCrate(w: World, c: BossProp, loot: boolean): void {
  if (c.st >= 2) return;
  c.st = 2; c.life = 0.8;
  w.fx('burst', 'KRAK!', c.x, c.y - 26);
  spawnFx(w, 'rockBreak', c.x, c.y - 6);
  for (let i = 0; i < 10; i++) w.sparks.push({ x: c.x, y: c.y - 8, vx: (Math.random() - 0.5) * 130, vy: -30 - Math.random() * 70, t: 0, c: i % 2 ? '#ae8650' : '#e8c286' });
  if (loot && Math.random() < 0.3) { w.bag.sucata = (w.bag.sucata ?? 0) + 1; dropItem(w, 'sucata', 1, c.x, c.y); }
}
/** Quebra caixotes dentro de um círculo (golpes do próprio chefe). */
export function smashCrates(w: World, x: number, y: number, r: number): void {
  for (const c of cratesOf(w)) if (Math.hypot(c.x - x, (c.y - y) * 2) < r + CW) breakCrate(w, c, false);
}

// ---------------- poças de fitas (lentidão) ----------------
const LAST = new WeakMap<Fighter, { x: number; y: number }>();

/** Avança todos os adereços do chefe (chamado no update dele). */
export function tickProps(w: World, z: Zombie, dt: number): void {
  const list = propsOf(w).filter((p) => p.owner === z);
  for (const p of list) {
    if (p.delay > 0) { p.delay -= dt; if (p.delay > 0) continue; }
    p.t += dt;
    if (!p.landed) {
      const u = Math.min(1, p.t / p.fly);
      p.x = p.x0 + (p.x1 - p.x0) * u; p.y = p.y0 + (p.y1 - p.y0) * u;
      p.z = p.z0 * (1 - u) + Math.sin(u * Math.PI) * p.arc;
      p.rot += p.spin * dt;
      if (u >= 1) { p.landed = true; p.z = 0; p.rot = 0; p.t = 0; if (p.warn) { w.warns = w.warns.filter((x) => x !== p.warn); p.warn = undefined; } p.onLand?.(p); }
    } else {
      p.life -= dt;
      if (p.kind === 'roots') p.st = p.t < 0.12 ? 0 : p.life > 0.35 ? 1 : 2;
      if (p.kind === 'crate' && p.st < 2 && p.life <= 0) breakCrate(w, p, false);
      else if (p.life <= 0) { removeProp(w, p); continue; }
    }
    p.actor.x = p.x; p.actor.y = p.y;
  }
  // caixotes: bloqueiam lutadores e zumbis; lutador preso atrás de um caixote passa a quebrá-lo
  const crates = cratesOf(w).filter((c) => c.owner === z);
  if (crates.length) {
    for (const f of aliveF(w)) {
      for (const c of crates) {
        const dx = f.x - c.x, dy = f.y - c.y;
        if (Math.abs(dx) >= CW || Math.abs(dy) >= CD) { if (Math.abs(dx) > CW + 8 || Math.abs(dy) > CD + 4) c.hitT.delete(f); continue; }
        // empurra pra fora pelo lado mais próximo
        if (CW - Math.abs(dx) < (CD - Math.abs(dy)) * 2) f.x = c.x + Math.sign(dx || -1) * CW;
        else f.y = clampY(c.y + Math.sign(dy || 1) * CD);
        const ct = (c.hitT.get(f) ?? 0) + dt; c.hitT.set(f, ct);
        const busy = f.state === 'stun' || f.state === 'hurt' || f.state === 'golpe' || f.dodge;
        if (!busy && ct > 0.35 && f.state !== 'combo') { f.face = (c.x >= f.x ? 1 : -1); f.state = 'combo'; f.anim = ''; setAnim(f, fa(f, 'combo')); }
        if (f.state === 'combo' && ct > 0.35 && (f._crT ?? 0) <= 0) { f._crT = 0.45; hitCrate(w, c); }
      }
      if (f._crT) f._crT = Math.max(0, f._crT - dt);
    }
    for (const o of w.zs) {
      if (o.dead || o.boss || o.air) continue;
      for (const c of crates) { const dx = o.x - c.x, dy = o.y - c.y; if (Math.abs(dx) < CW && Math.abs(dy) < CD) o.x = c.x + Math.sign(dx || 1) * CW; }
    }
  }
  // poças de fitas: lentidão de 25% pra quem pisa
  const pools = list.filter((p) => p.kind === 'pool' && p.landed);
  for (const f of aliveF(w)) {
    const L = LAST.get(f);
    if (L && pools.some((p) => Math.abs(f.x - p.x) < 18 && Math.abs(f.y - p.y) < 8)) { f.x = L.x + (f.x - L.x) * 0.75; f.y = L.y + (f.y - L.y) * 0.75; }
    LAST.set(f, { x: f.x, y: f.y });
  }
}

/** Puxões de gancho em andamento (fighter arrastado até o chefe; caixote no caminho segura o puxão). */
export interface Pull { f: Fighter; tx: number; ty: number }
export function tickPulls(w: World, z: Zombie, dt: number): void {
  const pulls: Pull[] = z.pulls ?? (z.pulls = []);
  for (const pl of pulls) {
    const f = pl.f;
    if (f.down) { pl.tx = f.x; continue; }
    const d = pl.tx - f.x, step = Math.sign(d) * Math.min(Math.abs(d), 300 * dt);
    f.x += step; f.y = clampY(f.y + Math.sign(pl.ty - f.y) * Math.min(Math.abs(pl.ty - f.y), 120 * dt));
    if (f.state !== 'stun') stunF(w, f, 0.5, 'AGARROU!');
    else f.stunT = Math.max(f.stunT, 0.25);
  }
  z.pulls = pulls.filter((pl) => Math.abs(pl.tx - pl.f.x) > 1 && !pl.f.down);
}

/** Dano em área circular (y achatado pela perspectiva). */
export function hitCircle(w: World, x: number, y: number, r: number, dmg: number, stun = 0, tag = 'TONTO', push = 0, fromX = x): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) if (Math.hypot(f.x - x, (f.y - y) * 2) < r) {
    hurtF(w, f, dmg); out.push(f);
    if (push) f.x += Math.sign(f.x - fromX || 1) * push;
    if (stun && !f.down) stunF(w, f, stun, tag);
  }
  return out;
}
/** Dano numa faixa à frente (x0→x1 na linha y). */
export function hitLane(w: World, x0: number, x1: number, y: number, tol: number, dmg: number, stun = 0, tag = '', push = 0, dir = 1): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) if ((f.x - x0) * (f.x - x1) <= 0 && Math.abs(f.y - y) < tol) {
    hurtF(w, f, dmg); out.push(f);
    if (push) f.x += dir * push;
    if (stun && !f.down) stunF(w, f, stun, tag);
  }
  return out;
}
