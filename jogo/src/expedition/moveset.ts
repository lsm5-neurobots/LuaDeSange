// Moveset de beat 'em up do squad (lado do motor): escolha de golpe do auto-combate, agarrão/arremesso,
// juggle, golpes com efeitos novos (área, costas, puxão, onda, atordoar, mandar longe), reações do lutador
// (empurrado, lançado + levantar) e zumbis arremessados que derrubam os outros.
// A arte declara os golpes (art-src/shared/moveset.js: kind, z, hitsx, grab/hold/release…); aqui só se lê.
import type { AnimDef } from '../art/legacy';
import { aliveZ, animFrac, clampY, rnd, setAnim, spawnFx, type Fighter, type World, type Zombie } from './world';
import { damageZ, knock, launch } from './combat';

type Mem = { cd: Record<string, number>; hist: string[]; apT: number; tauntCd: number };
const mem = (f: Fighter): Mem => (f._mv ??= { cd: {}, hist: [], apT: 0, tauntCd: 4 }) as Mem;

export const animsOf = (w: World, f: Fighter): Record<string, AnimDef> => (f.rig === 'vigia' ? w.A.VIGIA.ANIMS : f.art!.F.ANIMS);
/** diagnóstico (A/B de desempenho): window.__mvOff = true volta ao combo clássico */
const off = () => typeof window !== 'undefined' && !!(window as any).__mvOff;
const clampX = (w: World, x: number) => Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, x));

/** Diagnóstico/E2E: quantas vezes cada tipo de golpe/evento aconteceu nesta expedição. */
export function logMv(w: World, k: string): void { const L = ((w as any).mvLog ??= {}) as Record<string, number>; L[k] = (L[k] ?? 0) + 1; }

/** zumbi comum que pode ser agarrado (chefes, rastejante e escudo erguido não) */
export const grabbable = (z: Zombie) => !z.boss && z.kind !== 'rastejante' && !z.shielded && !z.air && !z.down && !z.dead
  && z.state !== 'boom' && z.state !== 'grabbed' && z.state !== 'leap';

/** Desconta recargas e sincroniza a altura do pulo (trilha z da anim) — 1× por update do lutador. */
export function tickMoveset(w: World, f: Fighter, dt: number, A: AnimDef | undefined): void {
  const m = mem(f);
  for (const k in m.cd) m.cd[k] = Math.max(0, m.cd[k] - dt);
  m.apT = Math.max(0, m.apT - dt); m.tauntCd = Math.max(0, m.tauntCd - dt);
  f.z = A?.z ? w.A.TWEEN.track(A.z, f.fi, animFrac(f, A), 0) : 0;
}

type Opt = [anim: string, w: number, kind: string, cd: number];
function pick(f: Fighter, opts: Opt[]): Opt | null {
  const h = mem(f).hist, rep = h.length >= 2 && h[h.length - 1] === h[h.length - 2] ? h[h.length - 1] : null;
  const ok = opts.filter((o) => o[1] > 0 && o[2] !== rep && (mem(f).cd[o[0]] ?? 0) <= 0);
  if (!ok.length) return null;
  let r = rnd() * ok.reduce((s, o) => s + o[1], 0);
  for (const o of ok) { r -= o[1]; if (r <= 0) return o; }
  return ok[ok.length - 1];
}
function record(w: World, f: Fighter, o: Opt): string {
  const m = mem(f);
  m.hist.push(o[2]); if (m.hist.length > 6) m.hist.shift();
  if (o[3]) m.cd[o[0]] = o[3];
  logMv(w, 'k:' + o[2]); if (o[0] !== 'COMBO') logMv(w, 'a:' + o[0]);
  return o[0];
}

const near = (w: World, f: Fighter, side: 1 | -1, r = 50) => aliveZ(w).filter((z) => !z.down && z.state !== 'boom' && z.state !== 'grabbed'
  && Math.sign(z.x - f.x) === side && Math.abs(z.x - f.x) < r + z.K.w / 2 && Math.abs(z.y - f.y) < 14).length;

/**
 * Chegando no alvo (fora do alcance): investida correndo, chute voador ou mergulho (bom contra grupo).
 * Rola no máximo a cada 0,4 s; devolve a anim ou null (continua andando).
 */
export function chooseApproach(w: World, f: Fighter, T: Zombie, dx: number, dy: number): string | null {
  const m = mem(f), A = animsOf(w, f);
  if (off() || m.apT > 0 || f.w.tipo !== 'melee') return null;
  m.apT = 0.4;
  if (rnd() > 0.5) return null;
  const crowd = aliveZ(w).filter((z) => z !== T && !z.down && Math.abs(z.x - T.x) < 50 && Math.abs(z.y - T.y) < 16).length;
  const opts: Opt[] = [];
  if (A.dash && dx > 56 && dx < 112 && Math.abs(dy) < 6) opts.push(['dash', 2, 'dash', 3]);
  if (A.jumpKick && dx > 44 && dx < 96 && Math.abs(dy) < 10) opts.push(['jumpKick', 1.6, 'jump', 3.5]);
  if (A.dive && dx > 50 && dx < 104 && Math.abs(dy) < 10) opts.push(['dive', crowd >= 1 ? 2.4 : 0.6, 'dive', 5]);
  const o = pick(f, opts);
  return o ? record(w, f, o) : null;
}

/**
 * Colado no alvo: combo (sequência de golpes avulsos), giro em área se cercado, juggle se o alvo está no ar,
 * lançador, agarrão (zumbi comum), golpes assinatura e — arma de fogo — salto pra trás pra abrir distância.
 * 'COMBO' = deixa o combo clássico/sequência variada escolher; 'DODGE' = salto pra trás.
 */
export function chooseClose(w: World, f: Fighter, T: Zombie): string {
  if (off()) return 'COMBO';
  const A = animsOf(w, f), gun = f.w.tipo !== 'melee', boss = T.boss;
  const opts: Opt[] = [['COMBO', gun ? 3 : 5, 'combo', 0]]; // o combo é a base; o resto tempera
  const both = near(w, f, 1) > 0 && near(w, f, -1) > 0;
  if (A.areaSpin && both) opts.push(['areaSpin', 5, 'area', 3.5]);
  if (!gun && A.airCombo && T.air && Math.abs(T.x - f.x) < 70) opts.push(['airCombo', 3.5, 'juggle', 0]);
  if (!gun && !boss && T.kind !== 'rastejante' && A.launcher) opts.push(['launcher', 1, 'launcher', 5]);
  if (!gun && !boss && f.rig === 'vigia' && A.jump && A.air && (T.kind === 'corredor' || T.kind === 'cuspidor')) opts.push(['jump', 1, 'jump', 4]);
  if (A.grab && grabbable(T)) {
    const others = aliveZ(w).filter((z) => z !== T && !z.down && Math.abs(z.x - f.x) < 160).length;
    opts.push(['grab', 1.2 + (others ? 0.9 : 0), 'grab', 5.5]);
  }
  for (const k in A) {
    const a = A[k];
    if (a.kind !== 'sig' || (a.fam && a.fam !== f.fam)) continue;
    if (boss && a.hitsx && Object.values(a.hitsx).some((h: any) => h.fling || h.pull)) continue;
    opts.push([k, (a.sig ?? 1) * 1.1, 'sig:' + k, a.cd ?? 7]);
  }
  if (gun && A.backstep) opts.push(['DODGE', 1.6, 'dodge', 2.5]);
  const o = pick(f, opts);
  return o ? record(w, f, o) : 'COMBO';
}

/** Fora de luta por um instante (ninguém perto): às vezes provoca. */
export function wantTaunt(w: World, f: Fighter, dist: number): boolean {
  const m = mem(f), A = animsOf(w, f);
  if (!A.taunt || m.tauntCd > 0 || dist < 150) return false;
  m.tauntCd = 7 + rnd() * 5;
  if (rnd() > 0.45) return false;
  logMv(w, 'a:taunt');
  return true;
}

// ---------------- golpes com efeitos novos ----------------
export interface HitX { m: number; reach?: number; heavy?: boolean; knock?: boolean; launch?: boolean; air?: boolean; juggle?: boolean; spike?: boolean;
  both?: boolean; around?: number; held?: boolean; fling?: boolean; stun?: number; wave?: boolean; pull?: boolean; slam?: boolean; hi?: boolean }
const XK = ['both', 'around', 'held', 'fling', 'stun', 'wave', 'pull', 'juggle', 'spike', 'slam', 'hi'];
/** O golpe usa algum efeito que o meleeHit clássico não conhece? */
export const isX = (h: any) => !!h && typeof h === 'object' && XK.some((k) => h[k]);

export function meleeHitX(w: World, f: Fighter, h: HitX, base: number): void {
  const n = h.heavy ? 3 : 1, lunar = w.mode === 'lua' && f.tier === 'lunar' ? 1.25 : 1, dmg = base * h.m * lunar;
  if (h.held) {
    const z = f.held as Zombie | null;
    // joelhada não mata: o agarrado sempre chega inteiro no arremesso (o arremesso é o golpe final)
    if (z && !z.dead) { if (z.hp >= 2.5) damageZ(w, z, Math.min(dmg, Math.floor(z.hp - 1)), n, f); else z.flash = 0.035; w.hitstop = 0.05; w.shake = Math.max(w.shake, 0.06); f.sp = Math.min(100, f.sp + 4); logMv(w, 'e:joelhada'); }
    return;
  }
  const reach = h.reach || 40, fz = f.z || 0;
  let any = false;
  for (const z of aliveZ(w)) {
    if (z.down || z.state === 'boom' || z.state === 'grabbed') continue;
    if (Math.abs((z.z || 0) - fz) > (h.air ? 44 : 24)) continue;
    const zw = z.K.w, dy = Math.abs(z.y - f.y);
    let inside: boolean;
    if (h.around) { const cx = f.x + f.face * reach * 0.5; inside = Math.hypot(z.x - cx, (z.y - f.y) * 2) < h.around + zw / 2; }
    else {
      const d = (z.x - f.x) * f.face;
      const front = d > -6 - zw / 2 && d < reach + zw / 2, back = !!h.both && d <= 6 + zw / 2 && d > -reach * 0.9 - zw / 2;
      inside = (front || back) && dy < (z.boss ? 20 : 14);
    }
    if (!inside) continue;
    any = true;
    const wasAir = !!z.air;
    damageZ(w, z, dmg * (z.state === 'miss' ? 2 : 1), n, f);
    if (z.boss || z.dead) continue;
    const dir = (Math.sign(z.x - f.x) || f.face) as 1 | -1;
    if (h.pull) { z.x = f.x + f.face * (16 + zw / 2); z.y = clampY(z.y + (f.y - z.y) * 0.7); z.stun = Math.max(z.stun, 0.5); logMv(w, 'e:puxao'); }
    if (h.fling && z.kind !== 'rastejante') { flingZ(w, z, f, dir, 235, 95, dmg * 0.8); logMv(w, 'e:mandouLonge'); }
    else if (h.spike && wasAir && z.air) { z.air.vz = -300; z.air.vx = dir * 20; logMv(w, 'e:cravada'); }
    else if (h.juggle && wasAir && z.air) { z.air.vz = 150; z.air.vx = dir * 16; logMv(w, 'e:juggle'); }
    else if (h.launch) { launch(z, dir, h.hi ? 260 : 200); if (z.air) logMv(w, 'e:lancado'); }
    else if (h.knock && !z.air && !z.down) knock(w, z, dir);
    else if (z.air) z.air.vz = Math.max(z.air.vz, 110);
    if (h.stun && !z.air && !z.down) { z.stun = Math.max(z.stun, h.stun); w.fx('tag', 'TONTO', z.x, z.y - z.K.top * 0.5 - 10); logMv(w, 'e:atordoou'); }
  }
  if (h.slam) { // pancada no chão: poeira e tremida mesmo sem acertar
    const gx = f.x + f.face * reach * 0.6;
    spawnFx(w, 'dust', gx - 8, f.y, -1); spawnFx(w, 'dust', gx + 8, f.y, 1); spawnFx(w, 'impactBig', gx, f.y - 4, f.face, undefined, 22);
    w.shake = Math.max(w.shake, 0.2);
  }
  if (h.wave) { ((w as any)._waves ??= []).push({ x: f.x + f.face * 20, y: f.y, dir: f.face, t: 0, dmg: dmg * 0.9, by: f, hit: new Set<number>(), fx: 0 }); logMv(w, 'e:onda'); }
  if (any) {
    f.sp = Math.min(100, f.sp + 6);
    w.hitstop = h.heavy ? 0.075 : 0.04;
    w.shake = Math.max(w.shake, h.heavy ? 0.14 : 0.05);
    if (h.launch) f.juggle = 1;
  }
}

/** Vira projétil: voa girando e derruba quem estiver no caminho (arremesso, rebatida). */
export function flingZ(w: World, z: Zombie, by: Fighter, dir: 1 | -1, vx: number, vz: number, dmg: number): void {
  z.air = { vz, vx: dir * vx, spin: 0, thrown: true, by, hit: new Set<number>(), dmg } as any;
  z.z = Math.max(z.z || 0, 4); z.state = 'air'; z.down = null; z.stun = 0; z.react = null;
  if (z.K.F.ANIMS.tumble) setAnim(z, 'tumble');
}

/** Ondas de choque no chão (Pilão da pedreira): andam pela faixa e lançam quem pegam. */
export function updateWaves(w: World, dt: number): void {
  const L = (w as any)._waves as any[] | undefined;
  if (!L?.length) return;
  for (const v of L) {
    v.t += dt; v.x += v.dir * 250 * dt; v.fx -= dt;
    if (v.fx <= 0) { v.fx = 0.05; spawnFx(w, 'dust', v.x, v.y, v.dir); spawnFx(w, 'rockBreak', v.x, v.y - 2, v.dir, undefined, 26); }
    for (const z of aliveZ(w)) {
      if (v.hit.has(z.uid) || z.down || z.air || z.state === 'boom' || z.state === 'grabbed') continue;
      if (Math.abs(z.y - v.y) < 14 && Math.abs(z.x - v.x) < 12 + z.K.w / 2) { v.hit.add(z.uid); damageZ(w, z, v.dmg, 3, v.by); if (!z.dead && !z.boss) launch(z, v.dir, 170); w.shake = Math.max(w.shake, 0.1); }
    }
  }
  (w as any)._waves = L.filter((v) => v.t < 0.5 && v.x > w.cam - 20 && v.x < w.cam + w.W + 20);
}

// ---------------- agarrão e arremesso ----------------
/** Evento de quadro do golpe: fecha o agarrão, solta o arremesso. */
export function moveFrameX(w: World, f: Fighter, A: AnimDef, fi: number, base: number): void {
  if (A.grab === fi && !f.held) {
    const z = aliveZ(w).find((o) => grabbable(o) && (o.x - f.x) * f.face > -4 && (o.x - f.x) * f.face < 30 + o.K.w / 2 && Math.abs(o.y - f.y) < 12);
    if (z) {
      f.held = z; z.state = 'grabbed'; z.grabbedBy = f; z.react = null; z.stun = 0; z.move = null;
      w.warns = w.warns.filter((t) => t.owner !== z);
      setAnim(z, z.K.F.ANIMS.grabbed ? 'grabbed' : 'hurt');
      w.fx('burst', 'AGARROU!', (z.x + f.x) / 2, f.y - 70);
      w.hitstop = 0.05; logMv(w, 'e:agarrou');
    } else { f.fi = A.n - 1; f.acc = 0; } // errou o agarrão: só a recuperação
  }
  if (A.release === fi && f.held) {
    const z = f.held as Zombie, t = A.toss ?? { vx: 170, vz: 120 };
    f.held = null; z.grabbedBy = null;
    flingZ(w, z, f, f.face, t.vx, t.vz, base * 1.7);
    w.fx('burst', 'ARREMESSO!', z.x, f.y - 80); w.shake = Math.max(w.shake, 0.12);
    logMv(w, 'e:arremessou');
  }
}

/** Mantém o zumbi agarrado na mão (trilha hold da anim) ou solta se o lutador perdeu a pegada. */
export function updateHeld(w: World, f: Fighter, A: AnimDef | undefined): void {
  const z = f.held as Zombie | null;
  if (!z) return;
  if (z.dead || z.state !== 'grabbed' || f.down || f.state !== 'combo' || !A?.hold) { releaseZ(z); f.held = null; return; }
  const H = A.hold as number[][], a = H[Math.min(f.fi, H.length - 1)], b = H[Math.min(f.fi + 1, H.length - 1)], t = animFrac(f, A);
  const dx = a[0] + (b[0] - a[0]) * t, hz = a[1] + (b[1] - a[1]) * t;
  z.x = clampX(w, f.x + f.face * dx); z.y = f.y + (dx < 0 ? -0.5 : 0.5); z.z = hz + (f.z || 0); z.face = -f.face as 1 | -1;
}

export function releaseZ(z: Zombie): void {
  if (z.state !== 'grabbed') return;
  z.grabbedBy = null; z.z = 0; z.state = 'hurt'; z.prev = undefined; setAnim(z, 'hurt');
}

/** Fim de um golpe: emenda (agarrão → arremesso na direção com mais zumbis; lançador → juggle). Retorna a anim emendada. */
export function chainAfter(w: World, f: Fighter, A: AnimDef | undefined): string | null {
  const An = animsOf(w, f);
  if (A?.kind === 'grab' && f.held && An.throw) {
    const z = f.held as Zombie;
    const side = (s: number) => aliveZ(w).filter((o) => o !== z && !o.down && Math.sign(o.x - f.x) === s && Math.abs(o.x - f.x) < 200).length;
    const l = side(-1), r = side(1);
    if (l !== r) f.face = (r > l ? 1 : -1) as 1 | -1;
    return 'throw';
  }
  const launched = A?.kind === 'launcher' || A?.fin === 'launch' || (A?.hitsx && Object.values(A.hitsx).some((h: any) => h.launch));
  if (launched && f.juggle && An.airCombo && f.w.tipo === 'melee') {
    f.juggle = 0;
    const tz = aliveZ(w).find((z) => z.air && !z.air.thrown && Math.abs(z.x - f.x) < 80 && Math.abs(z.y - f.y) < 16);
    if (tz && rnd() < 0.8) { f.target = tz; f.face = (tz.x >= f.x ? 1 : -1) as 1 | -1; logMv(w, 'a:airCombo'); logMv(w, 'k:juggle'); return 'airCombo'; }
  }
  return null;
}

// ---------------- zumbi arremessado ----------------
/** Zumbi voando como projétil: acerta os outros no caminho (dano + lança). */
export function thrownHits(w: World, z: Zombie): void {
  const a = z.air as any;
  if (!a?.thrown || (z.z || 0) > 40) return;
  for (const o of w.zs) {
    if (o === z || o.dead || o.down || o.air || o.state === 'boom' || o.state === 'grabbed' || a.hit.has(o.uid)) continue;
    if (Math.abs(o.x - z.x) < (o.K.w + z.K.w) * 0.4 + 4 && Math.abs(o.y - z.y) < 14) {
      a.hit.add(o.uid);
      damageZ(w, o, a.dmg ?? 10, 3, a.by);
      if (!o.dead && !o.boss) launch(o, Math.sign(a.vx) || 1, 150);
      spawnFx(w, 'impactBig', (o.x + z.x) / 2, z.y - 24, a.vx > 0 ? 1 : -1, undefined, 20);
      w.hitstop = 0.06; w.shake = Math.max(w.shake, 0.16);
      logMv(w, 'e:arremessoAcertou');
    }
  }
}

// ---------------- reações do lutador ----------------
/** Lançado / levantando (com invencibilidade) e escorregão do empurrado. Retorna true se tratou o quadro. */
export function updateReact(w: World, f: Fighter, dt: number, step: () => void, setF: (f: Fighter, a: string) => void, A: () => AnimDef | undefined): boolean {
  if (f.state === 'hurt' && f.anim === 'hurtPush' && f.fi < 3) f.x = clampX(w, f.x - f.face * 80 * dt);
  if (f.state !== 'kd' && f.state !== 'getup') return false;
  step();
  if (f.state === 'kd') {
    if (f.fi < 4) f.x = clampX(w, f.x - f.face * 70 * dt);
    if (f.done) { f.state = 'getup'; f.anim = ''; setF(f, 'getup'); }
  } else if (f.done || !A()) { f.state = 'guard'; setF(f, 'guard'); }
  return true;
}
