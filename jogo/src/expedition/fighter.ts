// Lutadores do squad: criação, IA (corpo a corpo, pistola, laser), golpes e dano recebido.
import { heroArt, recruitArt, anchor } from '../art/sprites';
import { withHubK } from '../art/legacy';
import { frameStore } from '../art/frameStore';
import { settings } from '../core/settings';
import { WEAPONS, weaponDamage, forcaMult } from '../data/weapons';
import { castEquipped, tickGolpes, tryGolpe, updateGolpe } from './golpes';
import { padOf } from './manual';
import type { TeamMember } from './types';
import { gradeMul } from '../data/grades';
import {
  SK, LOOP, aliveZ, animFrac, clampY, rnd, setAnim, spawnFx, sprTarget, stepAnim,
  type Fighter, type World, type Zombie,
} from './world';
import { damageZ, killZ, knock, launch } from './combat';
import { inChain, nextStrike, resetStrikes } from './strikes';
import {
  chainAfter, chooseApproach, chooseClose, isX, logMv, meleeHitX, moveFrameX, releaseZ, tickMoveset, updateHeld, updateReact, updateWaves, wantTaunt,
} from './moveset';

const ALIAS: Record<string, string> = {
  run: 'walk', advance: 'walk', comboB: 'combo', dash: 'combo', launcher: 'combo', jump: 'combo', air: 'combo',
  roll: 'walk', hurtB: 'hurt', hurtC: 'hurt', special: 'combo', shoot: 'guard',
  backstep: 'roll', hurtPush: 'hurt', launched: 'fall', taunt: 'victory',
};

export const VMAX = (w: World, f: Fighter) => (90 + 22 * (f.m.lv - 1)) * w.cfg.bonus.vida * gradeMul(f.m.nota);
export const LMUL = (f: Fighter) => (1 + 0.16 * (f.m.lv - 1)) * gradeMul(f.m.nota);
export const ARM = (f: Fighter) => 1 - Math.min(0.6, 0.032 * (f.m.lv - 1));
export const DODGE = (w: World, f: Fighter) => Math.min(0.85, 0.15 + 0.035 * f.m.lv + w.cfg.bonus.esquiva);

export function makeFighter(w: World, m: TeamMember, slot: number): Fighter {
  const vigia = m.kind === 'rec' && m.recTipo === 'vigia';
  const fam = m.arma.familia;
  const art = vigia ? null : m.kind === 'hero' ? heroArt(m.hero!, { familia: fam, tier: m.arma.tier }) : recruitArt(m.recTipo!, m.skin ?? 'media');
  const f: Fighter = {
    m, rig: vigia ? 'vigia' : 'generic', art, fam, w: WEAPONS[fam], tier: m.arma.tier,
    x: 0, y: 178, z: 0, face: 1, hp: 1, maxhp: 1, sp: 0, state: 'idle', anim: 'idle', fi: 0, acc: 0, done: false,
    down: false, stunT: 0, dodge: null, checked: null, target: null, cd: 0, charge: 0, slot,
  };
  f.maxhp = f.hp = VMAX(w, f);
  return f;
}

/** Nome real da animação (o rig genérico não tem o kit inteiro do Vigia). */
export function fa(f: Fighter, name: string): string {
  if (f.rig === 'vigia' || f.art!.has(name)) return name;
  const a = ALIAS[name] ?? 'idle';
  return f.art!.has(a) ? a : 'idle';
}
export const setF = (f: Fighter, name: string) => setAnim(f, fa(f, name));
export function fAnim(w: World, f: Fighter) {
  return f.rig === 'vigia' ? w.A.VIGIA.ANIMS[f.anim] : f.art!.F.ANIMS[f.anim];
}

export function fighterFrame(w: World, f: Fighter): { cv: any; ax: number; G: number } {
  // quadro salvo no disco (cache persistente) que ainda não chegou: segura o anterior um instante em vez de gerar
  const ff = f as Fighter & { _fr?: { cv: any; ax: number; G: number } };
  const pk = frameStore.peek(() => fighterFrame0(w, f));
  if (pk && pk !== 'wait') return (ff._fr = pk.v);
  if (pk === 'wait' && ff._fr) return ff._fr;
  return (ff._fr = fighterFrame0(w, f));
}
function fighterFrame0(w: World, f: Fighter): { cv: any; ax: number; G: number } {
  if (f.rig === 'vigia') {
    // kf = golpes do moveset só em poses-chave (sem sub-quadros de tween): menos quadros, mais estalado
    const V = w.A.VIGIA, T = w.A.TWEEN, VA = fAnim(w, f), fr = settings.q.tween && !VA?.kf ? T.quant(animFrac(f, VA)) : 0, loop = !!LOOP[f.anim];
    const P = T.poseAt(V, f.anim, f.fi, fr, loop);
    const tier = f.fam === 'bastao' ? f.tier : 'comum';
    return { cv: V.framePose!(f.m.skin ?? 'media', tier, P, 5, f.anim + f.fi + '.' + fr), ax: V.AX * SK, G: V.GROUND * SK };
  }
  // herói/recrutas: gerados no PIX do hub na escala de alta resolução; âncora em px do canvas
  const cv = withHubK(SK, () => f.art!.frame(f.anim, f.fi)), a = anchor(f.art!.F, cv);
  return { cv, ax: a.ax, G: a.gy };
}

// ---------------- dano no lutador ----------------
/** o: push (px do empurrão do golpe) e heavy (golpe pesado) escolhem a reação: dano comum, empurrado ou lançado longe. */
export function hurtF(w: World, f: Fighter, dmg: number, o?: { push?: number; heavy?: boolean }): void {
  if (f.down || w.phase === 'victory' || w.phase === 'failed') return;
  if (f.state === 'kd' || f.state === 'getup') return; // caído/levantando: invencível (como num beat 'em up)
  if ((f.dodge?.ifr ?? 0) > 0) return; // esquiva do jogador: uns instantes sem levar o golpe
  dmg *= ARM(f);
  if (w.cfg.pet?.tipo === 'jabuti') dmg *= 0.9;
  f.hp -= dmg;
  w.fx('hurt', '-' + Math.round(dmg), f.x, f.y - 80);
  if (f.hp <= 0) {
    f.hp = 0; f.down = true; f.state = 'down'; setF(f, 'hurt'); f.fi = Math.max(0, fAnim(w, f)!.n - 1); f.hold = true; f.downT = 0;
    w.log(`${f.m.nome} caiu!`);
    return;
  }
  if (settings.q.gore) w.A.GORE.hit(f.x, f.y, f.y - 62, -f.face, 0.5, ['#e0604e', '#a82a2a', '#5c1420'], false);
  if (f.held) { releaseZ(f.held); f.held = null; }
  const big = !!o && (Math.abs(o.push ?? 0) >= 20 || !!o.heavy) || dmg > f.maxhp * 0.22;
  if (f.state !== 'stun') {
    f.state = 'hurt'; f.hold = false; f.dodge = null; f.chainAir = false; f.anim = '';
    const has = (a: string) => fa(f, a) === a;
    if (big && rnd() < 0.35 && has('launched')) { f.state = 'kd'; setF(f, 'launched'); w.shake = Math.max(w.shake, 0.16); logMv(w, 'r:lancado'); }
    else if (o?.push && Math.abs(o.push) >= 14 && has('hurtPush')) { setF(f, 'hurtPush'); logMv(w, 'r:empurrado'); }
    else { const r = ['hurt', 'hurtB', 'hurtC'][Math.floor(rnd() * 3)]; setF(f, r); logMv(w, 'r:' + r); }
    f.x -= f.face * 4;
  }
  w.shake = Math.max(w.shake, 0.08);
}

export function stunF(w: World, f: Fighter, t: number, tag: string): void {
  if (f.down || f.state === 'kd' || f.state === 'getup') return;
  if ((f.dodge?.ifr ?? 0) > 0) return;
  if (f.held) { releaseZ(f.held); f.held = null; }
  f.state = 'stun'; f.stunT = t;
  w.fx('tag', tag, f.x, f.y - 90);
}

// ---------------- golpes ----------------
interface Hit { m: number; heavy?: boolean; reach?: number; launch?: boolean; air?: boolean; knock?: boolean }

/** Dano corpo a corpo base do lutador (multiplicador 1). */
export const meleeBase = (w: World, f: Fighter) => weaponDamage('bastao', f.fam === 'bastao' ? (f.tier as any) : 'comum') * LMUL(f) * w.cfg.bonus.dano * (f.fam === 'bastao' ? forcaMult(f.m.arma.nv) : 0.7);

export function meleeHit(w: World, f: Fighter, h: Hit | number): void {
  if (typeof h === 'number') h = { m: h === 3 ? 2 : 1, heavy: h === 3 };
  const n = h.heavy ? 3 : 1;
  const base = meleeBase(w, f) * h.m;
  const reach = h.reach || (h.heavy ? 44 : 40);
  let any = false;
  aliveZ(w).forEach((z) => {
    if (z.down || z.state === 'boom') return;
    const dz = Math.abs((z.z || 0) - (f.z || 0));
    if (dz > (h.air ? 44 : 24)) return;
    const dx = (z.x - f.x) * f.face, dy = Math.abs(z.y - f.y), zw = z.K.w;
    if (dx > -6 - zw / 2 && dx < reach + zw / 2 && dy < (z.boss ? 20 : 14)) {
      any = true;
      const wasAir = !!z.air;
      const lunar = w.mode === 'lua' && f.tier === 'lunar' ? 1.25 : 1;
      damageZ(w, z, base * (z.state === 'miss' ? 2 : 1) * lunar, n, f);
      if (!z.boss && !z.dead) {
        if (h.launch) launch(z, f.face, 200);
        else if (h.knock && !z.air && !z.down) knock(w, z, f.face);
        else if (wasAir && z.air) { z.air.vz = h.heavy ? -180 : Math.max(z.air.vz, 110); z.air.vx = f.face * (h.heavy ? 60 : 20); }
        else z.x += f.face * (h.heavy ? (f.tier === 'raro' || f.tier === 'lunar' ? 24 : 10) : 0);
      }
    }
  });
  if (any) {
    f.sp = Math.min(100, f.sp + 6);
    w.hitstop = h.heavy ? 0.07 : 0.035;
    w.shake = Math.max(w.shake, h.heavy ? 0.12 : 0.04);
    if (h.launch) f.juggle = 1;
  }
}

function shoot(w: World, f: Fighter, spread = 0, mult = 1): void {
  const dmg = weaponDamage(f.fam, f.tier as any) * forcaMult(f.m.arma.nv) * LMUL(f) * w.cfg.bonus.dano * mult;
  const hy = f.y - 52;
  w.proj.push({ kind: 'bullet', t: 0, d: 1, x0: f.x + f.face * 22, y0: hy, x1: 0, y1: 0, x: f.x + f.face * 22, y: hy + spread, ly: f.y + spread * 0.4, vx: f.face * 430, dmg, range: f.w.alcance * 1.6, from: f });
  spawnFx(w, 'muzzle', f.x + f.face * 22, hy, f.face, undefined, 28, true);
  for (let i = 0; i < 2; i++) w.sparks.push({ x: f.x + f.face * 24, y: hy, vx: f.face * (40 + rnd() * 80), vy: (rnd() - 0.5) * 60, t: 0.2, c: i % 2 ? '#ffd23f' : '#fff4c0' });
  w.shake = Math.max(w.shake, 0.03);
}

function fireBeam(w: World, f: Fighter, mult = 1, wide = false): void {
  const dmg = weaponDamage(f.fam, f.tier as any) * forcaMult(f.m.arma.nv) * LMUL(f) * w.cfg.bonus.dano * mult;
  const len = f.w.alcance * (wide ? 1.6 : 1.15), x0 = f.x + f.face * 22, x1 = x0 + f.face * len, tol = wide ? 30 : 14;
  let n = 0;
  aliveZ(w).forEach((z) => {
    if (z.state === 'boom') return;
    if ((z.x - x0) * f.face >= -z.K.w / 2 && (z.x - x0) * f.face <= len && Math.abs(z.y - f.y) < tol) { n++; damageZ(w, z, dmg, 3, f); spawnFx(w, 'laserHit', z.x, f.y - 50, f.face, { cor: f.tier === 'lunar' ? '#ff4a5a' : '#7af0ff' }, 24, true); }
  });
  w.beams.push({ x0, x1, y: f.y - 50, t: 0, d: 0.22, wide, c: f.tier === 'lunar' ? '#ff4a5a' : '#7af0ff' });
  w.shake = Math.max(w.shake, wide ? 0.25 : 0.1);
  w.hitstop = 0.04;
  if (n) f.sp = Math.min(100, f.sp + 4 * n);
}

/** Chamado a cada quadro novo da animação do lutador. */
export function fighterFrameEvent(w: World, f: Fighter, fi: number): void {
  const A = fAnim(w, f);
  if (!A || f.state !== 'combo' && f.state !== 'special') return;
  if (f.state === 'combo') {
    if (A.hitsx && A.hitsx[fi]) { if (isX(A.hitsx[fi])) meleeHitX(w, f, A.hitsx[fi], meleeBase(w, f)); else meleeHit(w, f, A.hitsx[fi]); }
    else if (A.hits && A.hits[fi]) meleeHit(w, f, A.hits[fi]);
    if (A.grab != null || A.release != null) moveFrameX(w, f, A, fi, meleeBase(w, f)); // agarrão/arremesso
    if (A.fireAt?.includes(fi)) { if (f.w.tipo === 'beam') fireBeam(w, f, A.fireMul ?? 1, !!A.fireWide); else shoot(w, f, 0, A.fireMul ?? 1); } // chute e tiro
  }
  if (f.state === 'special' && fi === Math.min(2, A.n - 1)) special(w, f);
}

function special(w: World, f: Fighter): void {
  f.sp = 0;
  if (f.m.recTipo === 'enfermeira') { // "Curativo de Plantão": cura o squad
    for (const o of w.fs) if (!o.down) { o.hp = Math.min(o.maxhp, o.hp + o.maxhp * 0.3); spawnFx(w, 'heal', o.x, o.y, 1, undefined, 16, true); }
    w.fx('bubble', 'CURATIVO!', f.x + f.face * 30, f.y - 92);
    w.log(`${f.m.nome}: curou o squad`);
    return;
  }
  if (f.fam === 'pistola') {
    for (let i = 0; i < 5; i++) setTimeout(() => !f.down && shoot(w, f, (i - 2) * 6, 0.9), i * 70);
    w.fx('bubble', 'RAJADA!', f.x + f.face * 30, f.y - 92);
    w.log(`${f.m.nome}: rajada!`);
    return;
  }
  if (f.fam === 'laser') {
    fireBeam(w, f, 2.2, true);
    w.fx('bubble', 'SOBRECARGA!', f.x + f.face * 30, f.y - 92);
    w.log(`${f.m.nome}: laser em sobrecarga!`);
    return;
  }
  // bastão: apito que atordoa
  w.rings.push({ x: f.x + f.face * 12, y: f.y - 70, t: 0 });
  w.fx('bubble', 'PRIIII!', f.x + f.face * 30, f.y - 92);
  let n = 0;
  aliveZ(w).forEach((z) => {
    if (!z.down && z.state !== 'boom' && Math.hypot(z.x - f.x, (z.y - f.y) * 2) < 100) {
      n++;
      if (z.boss) { damageZ(w, z, 6, 1, f); return; }
      z.stun = 1.8 + (w.mode === 'lua' && f.tier === 'lunar' ? 1 : 0);
      z.hp -= 4;
      if (z.hp <= 0) killZ(w, z, f);
      else { if (z.state !== 'hurt') z.prev = z.state; z.state = 'hurt'; setAnim(z, 'hurt'); }
    }
  });
  w.log(`Apito! ${n} atordoado(s)`);
}

function threat(w: World, f: Fighter) {
  for (const t of w.warns) {
    if (t.kind === 'circle' && Math.hypot(f.x - t.x!, (f.y - t.y) * 2) < t.r! + 8) return t;
    if (t.kind === 'lane' && Math.abs(f.y - t.y) < 16 && (f.x - t.x0!) * (f.x - t.x1!) <= 0) return t;
  }
  return null;
}

const clampX = (w: World, x: number) => Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, x));

/**
 * Flanco do Blindado (IA-29): de frente o escudo bloqueia. Se há outro lutador corpo a corpo, o de menor slot
 * segura a frente e os outros contornam pela profundidade até as costas; sozinho, o lutador contorna.
 * Retorna true se está contornando (o chamador só anima).
 */
export function flankShield(w: World, f: Fighter, T: Zombie, dt: number): boolean {
  const front = (o: Fighter) => Math.sign(o.x - T.x) === T.face || Math.abs(o.x - T.x) < 3;
  if (!front(f)) return false;
  const melee = w.fs.filter((o) => !o.down && o.w.tipo === 'melee');
  const holder = melee.filter((o) => o.target === T && front(o)).sort((a, b) => a.slot - b.slot)[0];
  if (melee.length > 1 && holder === f) return false; // segura a frente (gasta o escudo)
  const back = T.x - T.face * (24 + T.K.w / 2), near = Math.abs(f.x - T.x) < 44;
  const lane = clampY(T.y + (f.y <= T.y ? -26 : 26));
  const ty = near ? lane : T.y;
  f.x = clampX(w, f.x + Math.sign(back - f.x) * Math.min(Math.abs(back - f.x), (near ? 40 : 52) * dt));
  f.y = clampY(f.y + Math.sign(ty - f.y) * Math.min(Math.abs(ty - f.y), 44 * dt));
  f.face = T.x >= f.x ? 1 : -1;
  setF(f, 'advance');
  if (f.slot === 0) w.setIA(`${f.m.nome} · contornando o escudo`);
  return true;
}

// ---------------- modo manual (só o líder) ----------------
/** Mesma ordem de grandeza do passo do herói no abrigo, no chão da expedição. */
const MANUAL_X = 88, MANUAL_Y = 50;
const LIGHT_ANIMS = ['atkH', 'atkK', 'combo'];
const HEAVY_ANIMS = ['atkV', 'atkFin', 'comboB', 'combo'];
const LUNGE_ANIMS = ['atkS', 'dash', 'combo'];

const ownsAnim = (f: Fighter, name: string) => fa(f, name) === name;

function pickAnim(f: Fighter, names: string[]): string | null {
  for (const n of names) if (ownsAnim(f, n)) return n;
  return ownsAnim(f, 'combo') ? 'combo' : null;
}

/** O quadro do hit (o último, se o golpe acerta mais de uma vez) já passou. Sem hit, só a folga final. */
function pastHits(A: { n: number; hits?: Record<number, unknown>; hitsx?: Record<number, unknown> } | undefined, fi: number): boolean {
  if (!A) return true;
  let last = -1;
  const mark = (o?: Record<number, unknown>) => { if (!o) return; for (const k in o) { const n = +k; if (n > last) last = n; } };
  mark(A.hits); mark(A.hitsx);
  if (last < 0) return fi >= Math.max(0, A.n - 2);
  return fi > last;
}

function manualWants(w: World): boolean {
  const pad = padOf(w);
  if (!pad) return false;
  const ax = pad.axes();
  return ax.x !== 0 || ax.y !== 0 || pad.pressed();
}

function startStrike(w: World, f: Fighter, names: string[]): boolean {
  const an = pickAnim(f, names);
  if (!an) return false;
  f.hold = false;
  f.dodge = null;
  f.target = null;
  f.juggle = 0;
  resetStrikes(f);
  f.state = 'combo';
  f.anim = '';
  setF(f, an);
  f.chainAir = false;
  if (f.slot === 0) w.setIA(`${f.m.nome} · ${fAnim(w, f)?.nome ?? an}`);
  return true;
}

/** Rolamento na direção da cara, ou pra trás se a borda da arena está colada. Sem arte de esquiva, vira investida. */
function startDodge(w: World, f: Fighter): void {
  const roll = ownsAnim(f, 'roll'), backA = ownsAnim(f, 'backstep');
  if (!roll && !backA) { startStrike(w, f, LUNGE_ANIMS); return; }
  const room = f.face > 0 ? w.cam + w.W - 28 - f.x : f.x - (w.cam + 28);
  const back = room < 26;
  const dir = (back ? -f.face : f.face) as 1 | -1;
  const an = back ? (backA ? 'backstep' : 'roll') : (roll ? 'roll' : 'backstep');
  f.hold = false;
  f.target = null;
  f.dodge = { dx: dir * 58, t: 0.42, an, ifr: 0.22 };
  f.state = 'guard';
  if (f.slot === 0) w.setIA(`${f.m.nome} · esquiva`);
}

/**
 * Dirige o líder. Devolve true se este quadro ficou com o jogador.
 * J no alcance interage; fora disso é o leve. O hit continua no quadro da animação.
 */
function driveManual(w: World, f: Fighter, dt: number, step: () => void): boolean {
  const pad = padOf(w);
  if (!pad) return false;
  const phase = w.phase;
  if (phase !== 'fight' && phase !== 'walk') {
    pad.flush();
    return false;
  }
  const verb = w.manualJ?.(f, false) ?? null;
  if (verb && pad.take('j')) { w.manualJ?.(f, true); pad.flush(); return true; }
  if (pad.take('l')) { startDodge(w, f); pad.flush(); return true; }
  if (pad.take('j') && startStrike(w, f, LIGHT_ANIMS)) { pad.flush(); return true; }
  if (pad.take('k') && startStrike(w, f, HEAVY_ANIMS)) { pad.flush(); return true; }
  if (pad.take('u') && castEquipped(w, f, 0)) { pad.flush(); return true; }
  if (pad.take('i') && castEquipped(w, f, 1)) { pad.flush(); return true; }
  if (pad.take('o') && castEquipped(w, f, 2)) { pad.flush(); return true; }
  const ax = pad.axes();
  const moving = ax.x !== 0 || ax.y !== 0;
  if (moving) {
    const len = Math.hypot(ax.x, ax.y) || 1;
    f.x = clampX(w, f.x + (ax.x / len) * MANUAL_X * dt);
    f.y = clampY(f.y + (ax.y / len) * MANUAL_Y * dt);
    if (ax.x) f.face = ax.x > 0 ? 1 : -1;
    setF(f, 'walk');
  } else setF(f, phase === 'fight' ? 'guard' : 'idle');
  f.state = 'guard';
  if (phase === 'walk' && !moving) w.setIA(verb ? `J ${verb}` : 'ande com WASD ou setas');
  step();
  return true;
}

// ---------------- IA do lutador ----------------
export function updateFighter(w: World, f: Fighter, dt: number): void {
  const A = () => fAnim(w, f);
  const step = (cb?: boolean) => stepAnim(f, A(), dt, cb ? (e, fi) => fighterFrameEvent(w, e, fi) : undefined);
  f.cd = Math.max(0, f.cd - dt);
  // lentidão (lodo do Barqueiro): só deslocamento fica mais lento; golpes e recargas seguem normais
  if (f.slowT > 0) { f.slowT -= dt; if (f.state !== 'combo') dt *= 1 - (f.slowK ?? 0.25); }
  tickGolpes(w, f, dt);
  tickMoveset(w, f, dt, A()); // recargas do moveset + altura do pulo (trilha z)
  updateHeld(w, f, A()); // zumbi agarrado acompanha a mão

  if (f.down) { if (f.art?.has('fall') || f.rig === 'vigia' && w.A.VIGIA.ANIMS.fall) { if (f.anim !== 'fall') { f.hold = false; setAnim(f, 'fall'); } step(); f.downAnim = true; } return; }
  if (w.phase === 'victory') { setF(f, f.rig === 'vigia' ? (w.A.VIGIA.ANIMS.victory ? 'victory' : 'idle') : f.art!.has('victory') ? 'victory' : 'idle'); step(); return; }
  if (updateReact(w, f, dt, () => step(), setF, A)) return; // lançado longe → levantar (invencível)
  if (f.state === 'taunt') { step(); if (f.done) { f.state = 'guard'; setF(f, 'guard'); } return; } // provocação
  if (f.state === 'stun') {
    f.stunT -= dt; f.hold = true; setF(f, 'hurt'); f.fi = Math.min(1, A()!.n - 1);
    if (f.stunT <= 0) { f.hold = false; f.state = 'guard'; setF(f, 'guard'); }
    return;
  }
  if (f.dodge) {
    const d = f.dodge;
    const mx = d.dx ? Math.sign(d.dx) * Math.min(Math.abs(d.dx), 140 * dt) : 0, my = d.dy ? Math.sign(d.dy) * Math.min(Math.abs(d.dy), 150 * dt) : 0;
    f.x = clampX(w, f.x + mx); f.y = clampY(f.y + my);
    if (d.dx) d.dx -= mx;
    if (d.dy) d.dy -= my;
    d.t -= dt;
    if (d.ifr) d.ifr = Math.max(0, d.ifr - dt);
    // manual: depois da invencibilidade, soltar o direcional ou outro golpe corta a folga do rolamento
    const cut = w.cfg.manual && f.slot === 0 && (d.ifr ?? 0) <= 0 && manualWants(w);
    if (cut || d.t <= 0 || (Math.abs(d.dx || 0) < 0.5 && Math.abs(d.dy || 0) < 0.5)) {
      f.dodge = null;
      if (!cut) return;
    } else {
      const dn = d.an ?? 'roll'; // salto pra trás quando o perigo vem da frente, rolamento no resto
      if (f.anim !== fa(f, dn)) { setF(f, dn); f.state = 'idle'; }
      step();
      return;
    }
  }
  if (f.state === 'golpe') { updateGolpe(w, f, dt); return; } // golpe especial em andamento
  if (f.state === 'hurt' || f.state === 'combo' || f.state === 'special') {
    const a = A();
    if (f.state === 'combo' && a?.move) f.x = clampX(w, f.x + f.face * (a.move[f.fi] || 0) * dt);
    if (f.state === 'combo' && (f.anim === 'air' || f.anim === 'jump' || (a?.z && a.kind !== 'react')) && f.target && !f.target.dead) { // golpes no ar perseguem o alvo
      const tx = f.target.x - f.face * (a?.kind === 'juggle' ? 18 : 22);
      f.x += Math.sign(tx - f.x) * Math.min(Math.abs(tx - f.x), 70 * dt);
      f.y = clampY(f.y + Math.sign(f.target.y - f.y) * Math.min(Math.abs(f.target.y - f.y), 40 * dt));
    }
    if (f.rig === 'vigia' && f.state === 'combo' && f.anim === 'jump' && f.chainAir && f.fi >= 3) { f.chainAir = false; setAnim(f, 'air'); f.fi = 1; }
    if (f.rig === 'vigia' && f.state === 'combo' && f.anim === 'launcher' && f.fi >= 3 && f.juggle && f.m.lv >= 5) {
      const tz = aliveZ(w).find((z) => z.air && Math.abs(z.x - f.x) < 80);
      f.juggle = 0;
      if (tz) { f.target = tz; setAnim(f, 'air'); }
    }
    step(true);
    // manual: a folga depois do hit pode ser cortada no mesmo quadro. O quadro do hit em si não.
    const cut = w.cfg.manual && f.slot === 0 && f.state === 'combo' && pastHits(A(), f.fi) && manualWants(w);
    if (cut) {
      f.state = 'guard'; f.hold = false; f.done = false; f.target = null;
    } else {
      if (f.done && f.state === 'combo') { // agarrão → arremesso; lançador → juggle aéreo
        const ch = chainAfter(w, f, a);
        if (ch) { f.anim = ''; setF(f, ch); if (f.slot === 0) w.setIA(`${f.m.nome} · ${fAnim(w, f)?.nome ?? ch}`); return; }
      }
      if (f.done) {
        // sequência variada: emenda o próximo golpe se o alvo continua de pé e no alcance
        const T = f.target, ok = f.state === 'combo' && inChain(f) && T && !T.dead && !T.down && !T.air
          && Math.abs(T.x - f.x) < 48 + T.K.w / 2 && Math.abs(T.y - f.y) < 10;
        const nx = ok ? nextStrike(w, f) : null;
        if (nx) { f.face = T!.x >= f.x ? 1 : -1; f.anim = ''; setF(f, nx); if (f.slot === 0) w.setIA(`${f.m.nome} · ${fAnim(w, f)?.nome ?? nx}`); }
        else { if (!T || T.dead) resetStrikes(f); f.state = 'guard'; setF(f, 'guard'); }
      }
      return;
    }
  }
  if (f.state === 'shot') { // pose de tiro/disparo (anims com fireAt disparam nos quadros marcados)
    stepAnim(f, A(), dt, (_e, fi) => { const SA = A(); if (!SA?.fireAt?.includes(fi)) return; if (f.w.tipo === 'beam') fireBeam(w, f, SA.fireMul ?? 0.45); else shoot(w, f, 0, SA.fireMul ?? 1); });
    if (f.done) { f.state = 'guard'; setF(f, 'guard'); }
    return;
  }
  if (f.state === 'charge') { // laser carregando
    f.charge -= dt; setF(f, f.art?.has('charge') ? 'charge' : 'guard'); step();
    if (rnd() < 0.6) w.sparks.push({ x: f.x + f.face * (22 + rnd() * 6), y: f.y - 52 + (rnd() - 0.5) * 8, vx: (rnd() - 0.5) * 30, vy: -20 - rnd() * 30, t: 0.25, c: f.tier === 'lunar' ? '#ff6a6a' : '#7af0ff' });
    if (f.charge <= 0) { fireBeam(w, f); f.state = 'guard'; f.cd = f.w.cadencia; if (f.art?.has('fire')) { setAnim(f, 'fire'); f.state = 'shot'; } }
    return;
  }
  // líder no manual: o jogador anda e bate. O resto deste update (combo, golpe, dano, esquiva) já rodou acima.
  if (w.cfg.manual && f.slot === 0 && driveManual(w, f, dt, () => step())) return;
  const slotY = 178 + (f.slot ? 16 : 0) * (f.slot % 2 ? 1 : -1);
  if (w.phase === 'walk') {
    if (w.cfg.manual && f.slot !== 0) {
      // no manual o líder para quando solta a tecla; o aliado fica do lado em vez de marchar pra fora da tela
      const lead = w.fs[0];
      const tx = lead.x - 22 * f.slot, ty = clampY(lead.y + (f.slot % 2 ? 14 : -14));
      const dx = tx - f.x, dy = ty - f.y, dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const v = Math.min(dist, 80 * dt);
        f.x = clampX(w, f.x + (dx / dist) * v);
        f.y = clampY(f.y + (dy / dist) * v);
        if (Math.abs(dx) > 2) f.face = dx > 0 ? 1 : -1;
        setF(f, 'walk');
      } else setF(f, 'idle');
      step();
      return;
    }
    setF(f, 'walk'); f.face = 1; f.x += 64 * dt; f.y += (slotY - f.y) * Math.min(1, dt * 2); step();
    if (f.slot === 0) w.setIA('arena limpa · avançando');
    return;
  }
  if (w.phase === 'go' && !f.taunted && fa(f, 'taunt') === 'taunt') { f.taunted = true; f.state = 'taunt'; f.anim = ''; setF(f, 'taunt'); logMv(w, 'a:taunt'); return; } // arena limpa: provoca
  if (w.phase === 'approach') { // quem vai vasculhar anda até o objeto; o resto espera
    const a = w.appr;
    if (a && a.f === f) {
      const t = sprTarget(a.sp), dx = t.x - f.x, dy = t.y - f.y, d = Math.hypot(dx, dy);
      if (d > 2) { const v = Math.min(d, 64 * dt); f.x += (dx / d) * v; f.y += (dy / d) * v; f.face = dx >= 0 ? 1 : -1; setF(f, 'walk'); }
      else { f.face = 1; setF(f, 'idle'); }
    } else setF(f, 'idle');
    step(); return;
  }
  if (w.phase === 'search' || w.phase === 'chest' || w.phase === 'warning' || w.phase === 'go') { setF(f, 'idle'); step(); return; }
  f.taunted = false;

  const zs = aliveZ(w).filter((z) => z.state !== 'boom');
  if (!zs.length) { setF(f, 'idle'); step(); return; }

  const th = threat(w, f);
  if (th && !f.checked) {
    f.checked = th;
    if (rnd() < DODGE(w, f)) {
      if (th.kind === 'circle') { const ang = Math.atan2((f.y - th.y) * 2, f.x - th.x!) || Math.PI; f.dodge = { dx: Math.cos(ang) * (th.r! + 20), dy: Math.sin(ang) * 14, t: 0.6 }; }
      else f.dodge = { dy: (f.y > 176 ? -1 : 1) * 30, t: 0.5 };
      { const d = f.dodge as any; d.an = Math.sign(d.dx || 0) === -f.face && Math.abs(d.dx || 0) > 10 && rnd() < 0.7 ? 'backstep' : 'roll'; logMv(w, 'a:' + d.an); }
      if (f.held) { releaseZ(f.held); f.held = null; }
      if (f.state === 'combo') f.state = 'guard';
      w.setIA(`${f.m.nome} leu o aviso · saindo da área`);
      return;
    }
  }
  if (!th) f.checked = null;

  if (tryGolpe(w, f, zs)) return; // golpe especial equipado no abrigo, se estiver pronto e valer a pena
  const near = zs.filter((z) => !z.down && !z.boss && Math.hypot(z.x - f.x, (z.y - f.y) * 2) < 95 && z.state !== 'dead');
  if (f.sp >= 100 && (near.length >= 2 || (w.boss && Math.abs(w.boss.x - f.x) < (f.w.tipo === 'melee' ? 90 : 160)))) {
    f.state = 'special'; setF(f, 'special'); w.setIA(`${f.m.nome}: barra cheia → especial`);
    return;
  }
  const up = zs.filter((z) => !z.down);
  if (!up.length) { setF(f, 'guard'); step(); return; }
  const cand = up.filter((z) => z.state !== 'dead'), pool = cand.length ? cand : up;
  let t: Zombie | null = null, best = 1e9;
  pool.forEach((z) => {
    const d = Math.abs(z.x - f.x) + 2 * Math.abs(z.y - f.y) + (z.state === 'miss' || z.state === 'dazed' || z.vuln ? -60 : 0) + (f.slot && z === w.fs[0]?.target ? 40 : 0);
    if (d < best) { best = d; t = z; }
  });
  const T = t as unknown as Zombie;
  f.target = T;
  f.face = T.x >= f.x ? 1 : -1;
  const dx = Math.abs(T.x - f.x), dy = T.y - f.y;
  if (wantTaunt(w, f, best)) { f.state = 'taunt'; f.anim = ''; setF(f, 'taunt'); if (f.slot === 0) w.setIA(`${f.m.nome} · provocação`); return; } // ninguém perto: provoca

  // ---- armas à distância: mantém distância e atira na faixa ----
  if (f.w.tipo !== 'melee' && dx > 30) {
    const want = f.w.alcance * 0.8, minD = 56;
    let mvx = 0;
    if (dx > f.w.alcance) mvx = Math.sign(T.x - f.x);
    else if (dx < minD) mvx = -Math.sign(T.x - f.x);
    f.x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 30, f.x + mvx * 50 * dt));
    if (Math.abs(dy) > 6) f.y = clampY(f.y + Math.sign(dy) * Math.min(Math.abs(dy), 40 * dt));
    setF(f, 'guard'); // arma sempre empunhada (o andar não segura a arma)
    f.face = T.x >= f.x ? 1 : -1; // recua de frente pro alvo
    step();
    if (Math.abs(dy) <= 8 && dx <= f.w.alcance * 1.2 && f.cd <= 0) {
      f.face = T.x >= f.x ? 1 : -1;
      // variações: laser alterna feixe carregado e rajada; pistola alterna tiro rápido e tiro duplo
      if (f.w.tipo === 'beam' && f.art?.has('burst') && rnd() < 0.4) { f.anim = ''; setAnim(f, 'burst'); f.state = 'shot'; f.cd = f.w.cadencia * 1.1; w.setIA(`${f.m.nome}: rajada de laser`); }
      else if (f.w.tipo === 'beam') { f.state = 'charge'; f.charge = 0.5; w.setIA(`${f.m.nome}: carregando o laser`); }
      else {
        const two = !!f.art?.has('shoot2') && rnd() < 0.35, an = two ? 'shoot2' : 'shoot', SA = f.art?.has(an) ? f.art.F.ANIMS[an] : null;
        if (!SA?.fireAt) shoot(w, f);
        f.cd = f.w.cadencia * (two ? 1.6 : 1); w.setIA(`${f.m.nome}: ${two ? 'tiro duplo' : 'tiro'} em ${T.K.nome}`);
        if (SA) { f.anim = ''; setAnim(f, an); f.state = 'shot'; }
      }
    }
    void want;
    return;
  }

  // ---- corpo a corpo ----
  if (T.shielded && flankShield(w, f, T, dt)) { step(); return; } // Blindado: dá a volta no escudo (IA-29)
  const reach = 26 + T.K.w / 2, dyTol = T.boss ? 12 : 6;
  if (dx > reach + 4 || Math.abs(dy) > dyTol) {
    const sx = dx > reach ? Math.sign(T.x - f.x) * Math.min(dx - reach, 46 * dt) : 0;
    f.x += sx; f.y = clampY(f.y + Math.sign(dy) * Math.min(Math.abs(dy), 34 * dt));
    f.x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 30, f.x));
    // chegando: investida correndo, chute voador ou mergulho (moveset.ts escolhe com peso e recarga)
    const ap = chooseApproach(w, f, T, dx, dy);
    if (ap) { f.state = 'combo'; f.anim = ''; setF(f, ap); if (f.slot === 0) w.setIA(`${f.m.nome} · ${fAnim(w, f)?.nome ?? ap}`); return; }
    if (dx > 110) { f.x += Math.sign(T.x - f.x) * 46 * dt; setF(f, 'run'); } else setF(f, 'advance');
    if (f.slot === 0) w.setIA(`alvo ${T.K.nome} · avançando`);
    step();
  } else {
    // colado: combo, giro em área (cercado), juggle, lançador, agarrão, assinatura ou salto pra trás (arma de fogo)
    let a = chooseClose(w, f, T);
    if (a === 'DODGE') { f.dodge = { dx: -f.face * 46, t: 0.45 }; (f.dodge as any).an = 'backstep'; return; }
    if (a === 'COMBO') a = nextStrike(w, f) ?? (f.rig === 'vigia' && rnd() >= 0.6 ? 'comboB' : 'combo'); // sequência variada de golpes avulsos
    f.state = 'combo'; f.anim = ''; setF(f, a); f.chainAir = a === 'jump';
    if (f.slot === 0) w.setIA(`alvo ${T.K.nome} · ${fAnim(w, f)?.nome ?? a}`);
  }
}

export function updateBullets(w: World, dt: number): void {
  updateWaves(w, dt); // ondas de choque no chão (golpes assinatura)
  for (const p of w.proj) {
    if (p.kind !== 'bullet') continue;
    const step = p.vx! * dt;
    p.x += step; p.range! -= Math.abs(step);
    if (p.range! <= 0 || p.x < w.cam - 20 || p.x > w.cam + w.W + 20) { p.done = true; continue; }
    for (const z of w.zs) {
      if (z.dead || z.down || z.state === 'boom') continue;
      if (Math.abs(z.y - p.ly!) < (z.boss ? 22 : 12) && Math.abs(z.x - p.x) < z.K.w / 2 + Math.abs(step) + 2) {
        damageZ(w, z, p.dmg, 1, p.from);
        p.done = true;
        if (p.from) p.from.sp = Math.min(100, p.from.sp + 5);
        break;
      }
    }
  }
}
