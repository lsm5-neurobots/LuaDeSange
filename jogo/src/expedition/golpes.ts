// Golpes especiais no motor da expedição: o auto-combate decide quando usar, executa (investida, onda, esfera...)
// e desenha os efeitos procedurais (pixel na grade de 960×540, contorno escuro, rampas com hue shift).
import { GOLPES, golpeCd, golpeDano, type GolpeId } from '../data/golpes';
import { TIERS } from '../data/weapons';
import { settings } from '../core/settings';
import { damageZ, killZ, knock, launch } from './combat';
import { LMUL, fAnim, setF } from './fighter';
import { RS, aliveF, aliveZ, clampY, rnd, setAnim, spawnFx, stepAnim, type Fighter, type World, type Zombie } from './world';

interface GSlot { id: GolpeId; nv: number; cd: number }
interface GRun { id: GolpeId; nv: number; t: number; fireAt: number; end: number; fired: boolean; tg: Zombie | null; orb?: Eff }

/** Efeito vivo no mundo (onda, raio, esfera, choque no chão...). */
interface Eff { t: number; d: number; x: number; y: number; dir: 1 | -1; upd?: (dt: number) => void; draw: (c: CanvasRenderingContext2D, cam: number) => void; done?: boolean }
const EFFS = new WeakMap<World, Eff[]>();
const effs = (w: World) => { let l = EFFS.get(w); if (!l) { l = []; EFFS.set(w, l); } return l; };

const OUT = '#170b1c';
const slots = (f: Fighter): GSlot[] => (f.gs ??= (f.m.golpes ?? []).map((g) => ({ id: g.id, nv: g.nv, cd: 2.5 + rnd() * 2 })));

/** Estado dos golpes pro HUD: nome, cor e fração da recarga (1 = pronto). */
export function golpeHud(f: Fighter): { id: GolpeId; nome: string; cor: string; pronto: number }[] {
  return slots(f).map((s) => ({ id: s.id, nome: GOLPES[s.id].nome, cor: GOLPES[s.id].cor, pronto: 1 - Math.min(1, s.cd / golpeCd(s.id, s.nv)) }));
}

/** Avança recargas (e, uma vez por passo, os efeitos do mundo). */
export function tickGolpes(w: World, f: Fighter, dt: number): void {
  for (const s of slots(f)) s.cd = Math.max(0, s.cd - dt);
  f.gGap = Math.max(0, (f.gGap ?? 0) - dt);
  if (f !== w.fs[0]) return;
  const l = effs(w);
  for (const e of l) { e.t += dt; e.upd?.(dt); if (e.t >= e.d) e.done = true; }
  if (l.some((e) => e.done)) EFFS.set(w, l.filter((e) => !e.done));
}

// ---------------- decisão ----------------
const inFront = (f: Fighter, z: Zombie, range: number, tol: number) => (z.x - f.x) * f.face > -6 && Math.abs(z.x - f.x) < range && Math.abs(z.y - f.y) < tol;
const ell = (f: { x: number; y: number }, z: Zombie, r: number) => Math.hypot(z.x - f.x, (z.y - f.y) * 2.2) < r + z.K.w / 2;

function want(w: World, f: Fighter, s: GSlot, zs: Zombie[]): Zombie | true | null {
  const up = zs.filter((z) => !z.dead && z.state !== 'boom');
  const def = GOLPES[s.id];
  if (def.alvo === 'cura') return aliveF(w).some((o) => o.hp < o.maxhp * 0.55) ? true : null;
  if (def.alvo === 'linha') {
    // vira pro lado com mais zumbis na faixa
    const cnt = (d: 1 | -1) => up.filter((z) => (z.x - f.x) * d > -6 && Math.abs(z.x - f.x) < 210 && Math.abs(z.y - f.y) < 16).length;
    const r = cnt(1), l = cnt(-1), d: 1 | -1 = r >= l ? 1 : -1, n = Math.max(r, l);
    const boss = up.some((z) => z.boss && (z.x - f.x) * d > 0 && Math.abs(z.x - f.x) < 210 && Math.abs(z.y - f.y) < 22);
    if (n >= 2 || boss || (n >= 1 && up.length <= 2)) { f.face = d; return true; }
    return null;
  }
  if (def.alvo === 'perto') {
    const c = up.filter((z) => !z.down && Math.abs(z.x - f.x) < 92 && Math.abs(z.y - f.y) < 16).sort((a, b) => Number(b.boss) - Number(a.boss) || Math.abs(a.x - f.x) - Math.abs(b.x - f.x));
    if (!c.length) return null;
    // esfera vale mais em grupo ou no chefe
    if (s.id === 'esfera_espiral' && !c[0].boss && up.filter((z) => ell(c[0], z, 50)).length < 2) return null;
    return c[0];
  }
  const R = s.id === 'meia_lua' ? 58 : 104;
  const n = up.filter((z) => !z.down && ell(f, z, R)).length;
  const boss = up.some((z) => z.boss && ell(f, z, R));
  return n >= 2 || boss ? true : null;
}

/** Zera a espera inicial dos golpes do líder no modo manual (o automático mantém a recarga de abertura). */
export function primeManualGolpes(f: Fighter): void {
  for (const s of slots(f)) s.cd = 0;
}

/**
 * Dispara o golpe equipado no slot (0 = U, 1 = I, 2 = O).
 * A recarga é a do catálogo (`golpeCd`). Sem slot ou em recarga, não faz nada.
 * Não passa pela decisão do auto-combate: o jogador escolhe quando soltar, mesmo no vazio.
 */
export function castEquipped(w: World, f: Fighter, index: number): boolean {
  const s = slots(f)[index];
  if (!s || s.cd > 0) return false;
  if (f.down || f.dodge || f.state === 'golpe' || f.state === 'combo' || f.state === 'special' || f.state === 'hurt' || f.state === 'stun' || f.state === 'kd' || f.state === 'getup') return false;
  let tg: Zombie | null = null, best = 1e9;
  for (const z of aliveZ(w)) {
    if (z.dead || z.state === 'boom') continue;
    const dx = (z.x - f.x) * f.face;
    if (dx < 0 || dx > 150 || Math.abs(z.y - f.y) > 30) continue;
    const d = dx + Math.abs(z.y - f.y) * 2;
    if (d < best) { best = d; tg = z; }
  }
  start(w, f, s, tg);
  return true;
}

/** Tenta usar um golpe pronto. Retorna true se começou. */
export function tryGolpe(w: World, f: Fighter, zs: Zombie[]): boolean {
  if (w.phase !== 'fight' || f.gGap > 0) return false;
  for (const s of slots(f)) {
    if (s.cd > 0) continue;
    const tg = want(w, f, s, zs);
    if (!tg) continue;
    start(w, f, s, tg === true ? null : tg);
    return true;
  }
  return false;
}

const TIMES: Record<GolpeId, [number, number]> = { // [quando dispara, fim] em s
  meia_lua: [0.16, 0.5], grito_frevo: [0.2, 0.62], benzedura: [0.3, 0.7], mao_trovao: [0.22, 0.6],
  tiro_laser: [0.32, 0.66], corte_lunar: [0.2, 0.55], baque_virado: [0.3, 0.7], esfera_espiral: [0.55, 0.9],
};

function start(w: World, f: Fighter, s: GSlot, tg: Zombie | null): void {
  const def = GOLPES[s.id];
  s.cd = golpeCd(s.id, s.nv);
  f.gGap = 1.4;
  const [fireAt, end] = TIMES[s.id];
  f.gr = { id: s.id, nv: s.nv, t: 0, fireAt, end, fired: false, tg } as GRun;
  if (tg) f.face = tg.x >= f.x ? 1 : -1;
  f.state = 'golpe'; f.hold = false; f.dodge = null;
  setF(f, 'special');
  w.fx('bubble golpe', def.grito, f.x + f.face * 24, f.y - 96);
  w.golpeHud?.(f.m.nome, def.nome, def.cor);
  w.setIA(`${f.m.nome}: ${def.nome}!`);
  w.log(`${f.m.nome} usou ${def.nome} (nv ${s.nv})`);
  if (s.id === 'esfera_espiral') f.gr!.orb = orbEff(w, f);
}

/** Roda o golpe em andamento (estado 'golpe' do lutador). */
export function updateGolpe(w: World, f: Fighter, dt: number): void {
  const g = f.gr as GRun | null;
  if (!g) { f.state = 'guard'; setF(f, 'guard'); return; }
  g.t += dt;
  stepAnim(f, fAnim(w, f), dt);
  if (f.done) f.hold = true; // segura a pose final até o golpe acabar
  // movimentos antes do disparo
  if (!g.fired && g.tg && !g.tg.dead && (g.id === 'mao_trovao' || g.id === 'esfera_espiral' && g.t > g.fireAt - 0.16)) {
    const tx = g.tg.x - f.face * (12 + g.tg.K.w / 2);
    const v = g.id === 'mao_trovao' ? 420 : 300;
    f.x += Math.sign(tx - f.x) * Math.min(Math.abs(tx - f.x), v * dt);
    f.y = clampY(f.y + Math.sign(g.tg.y - f.y) * Math.min(Math.abs(g.tg.y - f.y), 120 * dt));
    if (g.id === 'mao_trovao' && rnd() < 0.8) w.sparks.push({ x: f.x - f.face * rnd() * 14, y: f.y - 20 - rnd() * 30, vx: -f.face * 40, vy: (rnd() - 0.5) * 50, t: 0.1, c: rnd() < 0.5 ? '#7af0ff' : '#ffffff' });
  }
  if (!g.fired && g.id === 'tiro_laser' && rnd() < 0.8) w.sparks.push({ x: f.x + f.face * (20 + rnd() * 6), y: f.y - 40 + (rnd() - 0.5) * 8, vx: (rnd() - 0.5) * 30, vy: -20 - rnd() * 30, t: 0.2, c: rnd() < 0.5 ? '#ff4a5a' : '#ffd0d4' });
  if (!g.fired && g.t >= g.fireAt) { g.fired = true; fire(w, f, g); }
  if (g.t >= g.end) { f.gr = null; f.hold = false; f.state = 'guard'; setF(f, 'guard'); }
}

// ---------------- efeitos de jogo ----------------
const power = (w: World, f: Fighter, g: GRun) => 9 * LMUL(f) * w.cfg.bonus.dano * golpeDano(g.id, g.nv) * (1 + 0.12 * TIERS.indexOf(f.tier as any));

function stunZ(w: World, z: Zombie, t: number, dmg: number, f: Fighter): void {
  if (z.boss) { damageZ(w, z, dmg * 2, 1, f); return; }
  z.stun = Math.max(z.stun, t);
  z.hp -= dmg;
  w.fx('dmg', String(Math.round(dmg)), z.x, z.y - z.K.top * 0.5);
  if (z.hp <= 0) killZ(w, z, f);
  else if (!z.down && !z.air) { if (z.state !== 'hurt') z.prev = z.state; z.state = 'hurt'; setAnim(z, 'hurt'); }
}

function fire(w: World, f: Fighter, g: GRun): void {
  const P = power(w, f, g), def = GOLPES[g.id];
  const zs = aliveZ(w).filter((z) => z.state !== 'boom');
  switch (g.id) {
    case 'corte_lunar': {
      const hit = new Set<Zombie>();
      const e: Eff = { t: 0, d: 0.75, x: f.x + f.face * 18, y: f.y, dir: f.face, draw: (c, cam) => drawCrescent(c, e, cam) };
      e.upd = (dt) => {
        e.x += e.dir * 330 * dt;
        if (rnd() < 0.7) w.sparks.push({ x: e.x - e.dir * 10, y: e.y - 14 - rnd() * 34, vx: -e.dir * 30, vy: -10 - rnd() * 30, t: 0.15, c: rnd() < 0.5 ? '#ff5a6a' : '#ffd0d8' });
        for (const z of aliveZ(w)) {
          if (hit.has(z) || z.state === 'boom' || Math.abs(z.y - e.y) > 18 || Math.abs(z.x - e.x) > z.K.w / 2 + 12) continue;
          hit.add(z);
          damageZ(w, z, P, 3, f);
          spawnFx(w, 'hitspark', z.x, z.y - z.K.top * 0.3, e.dir, { cor: def.cor }, 24, true);
          if (!z.dead && !z.boss) launch(z, e.dir, 170);
        }
      };
      effs(w).push(e);
      w.shake = Math.max(w.shake, 0.15);
      break;
    }
    case 'mao_trovao': {
      const cx = g.tg && !g.tg.dead ? g.tg.x : f.x + f.face * 30, cy = g.tg && !g.tg.dead ? g.tg.y : f.y;
      let n = 0;
      for (const z of zs) if (Math.hypot(z.x - cx, (z.y - cy) * 2.2) < 40 + z.K.w / 2) { n++; damageZ(w, z, P, 3, f); if (!z.dead) stunZ(w, z, 1.1 + 0.2 * g.nv, 0, f); }
      spawnFx(w, 'impactBig', cx, cy - 30, f.face, { cor: '#7af0ff' }, 22, true);
      spawnFx(w, 'hitspark', cx, cy - 30, f.face, { cor: '#ffffff' }, 24, true);
      effs(w).push(boltEff(cx, cy - 30, f.face));
      w.hitstop = 0.08; w.shake = Math.max(w.shake, 0.22);
      if (n) f.sp = Math.min(100, f.sp + 8);
      break;
    }
    case 'esfera_espiral': {
      if (g.orb) g.orb.done = true;
      const cx = g.tg && !g.tg.dead ? g.tg.x : f.x + f.face * 30, cy = g.tg && !g.tg.dead ? g.tg.y : f.y;
      for (const z of zs) {
        if (Math.hypot(z.x - cx, (z.y - cy) * 2.2) > 56 + z.K.w / 2) continue;
        damageZ(w, z, P, 3, f);
        if (!z.dead && !z.boss && !z.air) knock(w, z, Math.sign(z.x - f.x) || f.face);
      }
      spawnFx(w, 'impactBig', cx, cy - 28, f.face, { cor: '#b98cff' }, 18, true);
      effs(w).push(burstEff(cx, cy - 28));
      for (let i = 0; i < 18; i++) { const a = rnd() * Math.PI * 2; w.sparks.push({ x: cx, y: cy - 28, vx: Math.cos(a) * (60 + rnd() * 90), vy: Math.sin(a) * 70 - 30, t: 0, c: ['#b98cff', '#e8dcff', '#6a3ad8'][i % 3] }); }
      w.hitstop = 0.1; w.shake = Math.max(w.shake, 0.32);
      break;
    }
    case 'tiro_laser': {
      const mult = f.fam === 'laser' ? 1.5 : 1, len = 250, x0 = f.x + f.face * 20, y = f.y - 40;
      for (const z of zs) {
        if ((z.x - x0) * f.face < -z.K.w / 2 || (z.x - x0) * f.face > len || Math.abs(z.y - f.y) > 24) continue;
        damageZ(w, z, P * mult, 3, f);
        spawnFx(w, 'laserHit', z.x, y, f.face, { cor: '#ff4a5a' }, 24, true);
      }
      w.beams.push({ x0, x1: x0 + f.face * len, y, t: 0, d: 0.32, wide: true, c: '#ff4a5a' });
      w.beams.push({ x0, x1: x0 + f.face * len, y, t: 0, d: 0.2, wide: false, c: '#fff0f2' });
      spawnFx(w, 'muzzle', x0, y, f.face, undefined, 24, true);
      w.shake = Math.max(w.shake, 0.24); w.hitstop = 0.05;
      break;
    }
    case 'meia_lua': {
      for (const z of zs) {
        if (z.down || !ell(f, z, 54)) continue;
        const d = (Math.sign(z.x - f.x) || f.face) as 1 | -1;
        damageZ(w, z, P, 3, f);
        if (!z.dead && !z.boss) z.x += d * 18;
      }
      effs(w).push(spinEff(f));
      spawnFx(w, 'dust', f.x - 10, f.y, -1); spawnFx(w, 'dust', f.x + 10, f.y, 1);
      w.shake = Math.max(w.shake, 0.12); w.hitstop = 0.05;
      break;
    }
    case 'grito_frevo': {
      let n = 0;
      for (const z of zs) if (!z.down && ell(f, z, 104)) { n++; stunZ(w, z, 1.4 + 0.25 * g.nv, P, f); }
      w.rings.push({ x: f.x + f.face * 8, y: f.y - 70, t: 0 });
      effs(w).push(umbrellaEff(f));
      const C = ['#ff5fa8', '#ffd23f', '#3ad0ff', '#7dff6a', '#ff7a1e', '#ffffff'];
      for (let i = 0; i < 34; i++) w.sparks.push({ x: f.x + (rnd() - 0.5) * 20, y: f.y - 60, vx: (rnd() - 0.5) * 220, vy: -60 - rnd() * 120, t: 0, c: C[i % C.length] });
      w.log(`Frevo! ${n} atordoado(s)`);
      break;
    }
    case 'baque_virado': {
      const hit = new Set<Zombie>();
      const e: Eff = { t: 0, d: 0.5, x: f.x, y: f.y, dir: f.face, draw: (c, cam) => drawShock(c, e, cam) };
      e.upd = () => {
        const r = 8 + (e.t / e.d) * 116;
        for (const z of aliveZ(w)) {
          if (hit.has(z) || z.state === 'boom' || Math.abs(z.y - e.y) > 26 || Math.abs(z.x - e.x) > r) continue;
          hit.add(z);
          damageZ(w, z, P, 1, f);
          if (!z.dead && !z.boss && !z.air) knock(w, z, Math.sign(z.x - e.x) || 1);
        }
      };
      effs(w).push(e);
      for (const d of [-1, 1] as const) { spawnFx(w, 'dust', f.x + d * 14, f.y, d); spawnFx(w, 'rockBreak', f.x + d * 6, f.y - 4, d); }
      w.shake = Math.max(w.shake, 0.35); w.hitstop = 0.06;
      break;
    }
    case 'benzedura': {
      const k = 0.2 + 0.06 * g.nv;
      for (const o of w.fs) if (!o.down) { o.hp = Math.min(o.maxhp, o.hp + o.maxhp * k); spawnFx(w, 'heal', o.x, o.y, 1, undefined, 16, true); w.fx('dmg', '+' + Math.round(o.maxhp * k), o.x, o.y - 70); }
      effs(w).push(leafEff(f));
      for (let i = 0; i < 16; i++) w.sparks.push({ x: f.x + (rnd() - 0.5) * 40, y: f.y - 20 - rnd() * 40, vx: (rnd() - 0.5) * 40, vy: -40 - rnd() * 50, t: 0, c: i % 2 ? '#7dff9a' : '#2f9a52' });
      break;
    }
  }
}

// ---------------- desenho (pixel art procedural) ----------------
type Pal = string[];
const cache = new Map<string, HTMLCanvasElement>();
/**
 * Rasteriza uma forma na grade de pixel final (1/RS do lógico): fn devolve índice da paleta (0 = mais claro) ou -1.
 * Pixels vazios encostados na forma recebem o contorno escuro.
 */
function bake(key: string, wL: number, hL: number, pal: Pal, fn: (x: number, y: number) => number, outline = true): HTMLCanvasElement {
  let cv = cache.get(key);
  if (cv) return cv;
  const W = Math.ceil(wL * RS), H = Math.ceil(hL * RS);
  cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!, id = new Int8Array(W * H).fill(-1);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) id[j * W + i] = fn((i + 0.5) / RS, (j + 0.5) / RS);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const v = id[j * W + i];
    if (v >= 0) { g.fillStyle = pal[Math.min(pal.length - 1, v)]; g.fillRect(i, j, 1, 1); continue; }
    if (!outline) continue;
    const nb = (a: number, b: number) => a >= 0 && b >= 0 && a < W && b < H && id[b * W + a] >= 0;
    if (nb(i - 1, j) || nb(i + 1, j) || nb(i, j - 1) || nb(i, j + 1)) { g.fillStyle = OUT; g.fillRect(i, j, 1, 1); }
  }
  if (cache.size > 300) cache.clear();
  cache.set(key, cv);
  return cv;
}
function put(c: CanvasRenderingContext2D, cv: HTMLCanvasElement, x: number, y: number, ax: number, ay: number, face: number, alpha = 1, add = false): void {
  c.save();
  c.globalAlpha = alpha;
  if (add) c.globalCompositeOperation = 'lighter';
  c.translate(Math.round(x * RS) / RS, Math.round(y * RS) / RS);
  if (face < 0) c.scale(-1, 1);
  c.drawImage(cv, -ax, -ay, cv.width / RS, cv.height / RS);
  c.restore();
}

// Corte Lunar: lua crescente vermelha, de pé, correndo pela faixa
const CRES: Pal = ['#fff2f4', '#ffb0b8', '#ff5a6a', '#c8323a', '#6e1430'];
function drawCrescent(c: CanvasRenderingContext2D, e: Eff, cam: number): void {
  const fi = Math.floor(e.t * 24) % 3, R = 26, H = 60, WL = 34;
  const cv = bake('cres' + fi, WL, H, CRES, (x, y) => {
    const cx = 4, cy = H / 2, dx = x - cx, dy = (y - cy) / (H / 2 / R);
    const d1 = Math.hypot(dx, dy), d2 = Math.hypot(dx + 9 + fi, dy);
    if (d1 > R || d2 < R - 1) return -1; // crescente = disco menos disco deslocado
    if (d1 > R - 1.2) return 2; // fio externo saturado
    const t = (d2 - (R - 1)) / (9 + fi); // 0 na borda de dentro → 1 perto do fio (núcleo quente)
    return t > 0.7 ? 0 : t > 0.45 ? 1 : t > 0.2 ? 2 : t > 0.08 ? 3 : 4;
  });
  const a = Math.max(0, 1 - Math.max(0, e.t - e.d + 0.2) / 0.2);
  // rastro (enfeite: fora no Desempenho)
  if (settings.q.vfx2) put(c, cv, e.x - cam - e.dir * 14, e.y - 4, 4, H, e.dir, a * 0.35, true);
  put(c, cv, e.x - cam, e.y - 4, 4, H, e.dir, a);
}

// Mão de Trovão: raios em zigue-zague saindo do ponto do impacto
function boltEff(x: number, y: number, dir: 1 | -1): Eff {
  const seeds = Array.from({ length: 6 }, (_, i) => ({ a: (i / 6) * Math.PI * 2 + rnd() * 0.6, L: 22 + rnd() * 20, s: Math.floor(rnd() * 1000) }));
  return {
    t: 0, d: 0.32, x, y, dir,
    draw(c, cam) {
      const P = 1 / RS, fl = Math.floor(this.t * 30);
      for (const b of seeds) {
        let px = x - cam, py = y, r = 0, k = b.s + fl;
        while (r < b.L) {
          r += 5;
          k = (k * 9301 + 49297) % 233280;
          const j = (k / 233280 - 0.5) * 9;
          const nx = x - cam + Math.cos(b.a) * r - Math.sin(b.a) * j, ny = y + (Math.sin(b.a) * r + Math.cos(b.a) * j) * 0.7;
          line(c, px, py, nx, ny, OUT, P * 3);
          line(c, px, py, nx, ny, '#7af0ff', P * 2);
          line(c, px, py, nx, ny, '#ffffff', P);
          px = nx; py = ny;
        }
      }
    },
  };
}
function line(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, wpx: number): void {
  const P = 1 / RS, n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / P));
  c.fillStyle = col;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
    c.fillRect(Math.round((x - wpx / 2) * RS) / RS, Math.round((y - wpx / 2) * RS) / RS, wpx, wpx);
  }
}

// Esfera Espiral: esfera girando na mão, crescendo enquanto carrega
const ORB: Pal = ['#ffffff', '#e8dcff', '#b98cff', '#7a4ae0', '#3b2c63'];
function orbFrame(fi: number, r: number): HTMLCanvasElement {
  const S = r * 2 + 4;
  return bake(`orb${fi}.${r}`, S, S, ORB, (x, y) => {
    const dx = x - S / 2, dy = y - S / 2, d = Math.hypot(dx, dy);
    if (d > r) return -1;
    const a = Math.atan2(dy, dx), arm = Math.sin(a * 3 + d * 0.9 - fi * 0.8);
    if (d < r * 0.35) return 0;
    return arm > 0.55 ? 1 : d > r - 1.2 ? 4 : d > r * 0.75 ? 3 : 2;
  });
}
function orbEff(w: World, f: Fighter): Eff {
  const e: Eff = {
    t: 0, d: 1.2, x: f.x, y: f.y, dir: f.face,
    draw(c, cam) {
      const r = Math.round(Math.min(9, 3 + e.t * 12)), fi = Math.floor(e.t * 20) % 8, cv = orbFrame(fi, r);
      put(c, cv, f.x + f.face * 18 - cam, f.y - 38, cv.width / RS / 2, cv.height / RS / 2, 1);
    },
  };
  e.upd = () => { if (f.state !== 'golpe' || f.down) e.done = true; if (rnd() < 0.5) w.sparks.push({ x: f.x + f.face * 18 + (rnd() - 0.5) * 20, y: f.y - 38 + (rnd() - 0.5) * 16, vx: -(rnd() - 0.5) * 30, vy: -(rnd() - 0.5) * 30, t: 0.3, c: '#e8dcff' }); };
  effs(w).push(e);
  return e;
}
function burstEff(x: number, y: number): Eff {
  return {
    t: 0, d: 0.36, x, y, dir: 1,
    draw(c, cam) {
      const k = this.t / this.d, r = Math.round(8 + k * 38);
      const cv = bake('ring' + r, r * 2 + 4, r * 2 + 4, ORB, (px, py) => { const d = Math.hypot(px - r - 2, py - r - 2); return d > r || d < r - 3 ? -1 : d > r - 1 ? 2 : 1; });
      put(c, cv, x - cam, y, r + 2, r + 2, 1, 1 - k, true);
    },
  };
}

// Meia-Lua: rastro do chute girando em volta (elipse no chão em perspectiva)
const SPIN: Pal = ['#ffffff', '#fff2a8', '#ffd23f', '#e08a1e'];
function spinEff(f: Fighter): Eff {
  return {
    t: 0, d: 0.3, x: f.x, y: f.y, dir: f.face,
    draw(c, cam) {
      const fi = Math.min(3, Math.floor((this.t / this.d) * 4)), RX = 40, RY = 13;
      const cv = bake('spin' + fi, RX * 2 + 6, RY * 2 + 6, SPIN, (x, y) => {
        const dx = x - RX - 3, dy = (y - RY - 3) * (RX / RY), d = Math.hypot(dx, dy);
        if (d > RX || d < RX - 6) return -1;
        const a = (Math.atan2(dy, dx) + Math.PI * 2.5) % (Math.PI * 2), span = ((fi + 1) / 4) * Math.PI * 2;
        if (a > span) return -1;
        const tail = 1 - a / span;
        return d > RX - 1.5 ? 2 : tail < 0.25 ? 0 : tail < 0.6 ? 1 : 3;
      });
      put(c, cv, f.x - cam, f.y - 30, RX + 3, RY + 3, this.dir, 1 - Math.max(0, this.t - 0.2) / 0.1);
    },
  };
}

// Baque Virado: onda de choque no chão + rachaduras
const SHOCK: Pal = ['#fff2cc', '#ffc070', '#ffa040', '#a85a20', '#5a2c18'];
function drawShock(c: CanvasRenderingContext2D, e: Eff, cam: number): void {
  const k = e.t / e.d, r = Math.round(8 + k * 116), ry = Math.max(3, Math.round(r * 0.22));
  const cv = bake(`shock${r}`, r * 2 + 4, ry * 2 + 4, SHOCK, (x, y) => {
    const dx = x - r - 2, dy = (y - ry - 2) * (r / ry), d = Math.hypot(dx, dy);
    if (d > r || d < r - 7) return -1;
    return d > r - 2 ? 1 : d > r - 4 ? 2 : 3;
  }, false);
  put(c, cv, e.x - cam, e.y, r + 2, ry + 2, 1, 1 - k * 0.8);
}

// Grito de Frevo: sombrinha de frevo girando no alto
const FREVO = ['#ff3b55', '#ffd23f', '#3ad0ff', '#7dff6a', '#ff7a1e', '#b98cff'];
function umbrellaEff(f: Fighter): Eff {
  return {
    t: 0, d: 0.62, x: f.x, y: f.y, dir: f.face,
    draw(c, cam) {
      const fi = Math.floor(this.t * 16) % 6, R = 14;
      const cv = bake('frevo' + fi, R * 2 + 4, R + 8, ['#ffffff', ...FREVO, '#8a6a4a'], (x, y) => {
        const dx = x - R - 2, dy = R + 2 - y;
        if (Math.abs(dx) < 0.6 && dy < 0 && dy > -5) return 7; // cabo
        const d = Math.hypot(dx, dy);
        if (dy < 0 || d > R) return -1;
        if (d < 1.4) return 0;
        const seg = Math.floor(((Math.atan2(dy, dx) / Math.PI) * 6 + fi) % 6);
        return 1 + seg;
      });
      put(c, cv, f.x - cam, f.y - 74 - Math.sin(this.t * 10) * 2, R + 2, R + 2, 1, 1 - Math.max(0, this.t - 0.5) / 0.12);
    },
  };
}

// Benzedura: ramo de arruda subindo e girando
function leafEff(f: Fighter): Eff {
  const LEAF: Pal = ['#c8ffb0', '#7dff9a', '#2f9a52', '#1c5a34'];
  return {
    t: 0, d: 0.7, x: f.x, y: f.y, dir: f.face,
    draw(c, cam) {
      for (let i = 0; i < 5; i++) {
        const a = this.t * 6 + (i / 5) * Math.PI * 2, cv = bake('leaf' + (i % 2), 7, 4, LEAF, (x, y) => { const d = Math.hypot((x - 3.5) / 3.5, (y - 2) / 1.6); return d > 1 ? -1 : y < 1.6 ? 1 : 2; });
        put(c, cv, f.x - cam + Math.cos(a) * 18, f.y - 20 - this.t * 50 + Math.sin(a) * 5, 3.5, 2, Math.cos(a) > 0 ? 1 : -1, 1 - this.t / this.d);
      }
    },
  };
}

/** Desenha os efeitos de golpe (chamado pelo renderer, em coordenadas lógicas). */
export function drawGolpes(c: CanvasRenderingContext2D, w: World, cam: number): void {
  for (const e of effs(w)) if (!e.done) e.draw(c, cam);
}
