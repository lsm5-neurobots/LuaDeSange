// Zumbi Peão Pantaneiro (IA-35, IA-36; Pantanal): o "pastor" da horda. Truque de longe: laço que puxa e berrante
// que enfurece os zumbis em volta.
// - Facada: 2 cortes (≈1,1× no total), faca erguida 200 ms, alcance 34 px, recarga 1,6 s.
// - Laço (IA-35): só com o alvo a 50–180 px (220 no plenilunar) e linha de visão (caixote bloqueia). Gira 450 ms com
//   círculo no alvo; se o alvo ainda estiver no círculo no lançamento: 0,5× de dano, PRESO 0,5 s e puxado até 40 px
//   do peão. Golpe forte (≥ 25% da vida dele) ou atordoamento cancela a puxada. Recarga 8 s.
// - Berrante (IA-36): começa com ≥ 2 aliados a menos de 220 px; qualquer dano antes do sopro interrompe. Aliados a
//   220 px ganham FÚRIA DO REBANHO por 6 s: +25% de velocidade (+40% no enluarado) e +10% de dano; não empilha.
//   Recarga 20 s; o comum sopra só 1× na vida.
// - FRAQUEZA: logo depois de soprar fica com as duas mãos ocupadas: +30% de dano por 0,8 s. Matá-lo antes do sopro
//   corta o buff (depois do sopro o buff segue até acabar).
// - Tática: fica a 100–140 px; sozinho circula em vez de encostar; depois de laçar, entra de faca.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS } from '../combat';
import { hurtF, stunF } from '../fighter';
import { crateBetween } from './bossProps';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

/** Facada: 2 quadros de dano; moveFrame divide por 1,4 → 2 × 0,77/1,4 ≈ 1,1× no total. */
const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 34, dy: 9, cd: 1.6, dmg: 0.77, word: 'TCHAC!', lunge: [0, 0, 0, 30, 60, 0, 30, 50, 0] },
];

export const LACO_MIN = 50;
export const lacoMax = (z: Zombie) => (z.form === 'plenilunar' ? 220 : 180);
export const LACO_CD = 8;
export const LACO_DMG = 0.5;
export const LACO_STUN = 0.5;
/** distância final do lutador puxado (px na frente do peão) */
export const PULL_TO = 40;
/** fração da vida máxima que cancela a puxada num golpe só */
export const PULL_BREAK = 0.25;
/** raio do círculo de aviso no alvo (o alvo precisa continuar dentro dele) */
export const LACO_R = 18;

export const HERD_R = 220;
export const HERD_MIN = 2;
export const BERRANTE_CD = 20;
export const HERD_T = 6;
export const herdSpd = (z: Zombie) => (z.form === 'enluarado' ? 1.4 : 1.25);
export const HERD_DMG = 1.1;
export const WEAK_T = 0.8;
export const WEAK_MUL = 1.3;

const clock = (w: World) => w.clock ?? 0;
const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, (a.y - b.y) * 2);

/** Aliados (zumbis vivos, não chefes) dentro do raio do berrante. */
export function alliesNear(w: World, z: Zombie): Zombie[] {
  return w.zs.filter((o) => o !== z && !o.dead && !o.boss && near(o, z) < HERD_R);
}

/** Pode laçar `V` agora? (distância, faixa razoável e linha de visão: caixote no meio bloqueia) */
export function canLaco(w: World, z: Zombie, V: Fighter): boolean {
  const d = Math.abs(V.x - z.x);
  if (V.down || d < LACO_MIN || d > lacoMax(z) || Math.abs(V.y - z.y) > 40) return false;
  return crateBetween(w, z.x, V.x, V.y) == null;
}

/* ---------- FÚRIA DO REBANHO ---------- */
/** +10% de dano sem tick próprio: dmgMul vira acessor que confere o relógio (o buff some sozinho, mesmo com o peão morto). */
function herdDmg(w: World, o: Zombie): void {
  if (!o._herdHooked) {
    let base = o.dmgMul;
    Object.defineProperty(o, 'dmgMul', {
      configurable: true, enumerable: true,
      get: () => base * (clock(w) < (o.herdUntil ?? 0) ? HERD_DMG : 1),
      set: (v: number) => { base = v; },
    });
    o._herdHooked = true;
  }
  o.herdUntil = clock(w) + HERD_T;
}

/** Aplica a fúria do rebanho do peão `z` nos aliados em volta. Não empilha (renova a duração). Retorna quantos. */
export function applyHerd(w: World, z: Zombie): number {
  const list = alliesNear(w, z), mul = herdSpd(z);
  // "dono" do buff de velocidade: sentinela que nunca morre (o buff não acaba quando o peão morre depois do sopro)
  const by = { dead: false, form: z.form };
  for (const o of list) {
    const active = clock(w) < (o.herdUntil ?? 0);
    if (!active) w.fx('tag', 'FÚRIA!', o.x, o.y - o.K.top * 0.5 - 10);
    o.hasteMul = Math.max(o.hasteT > 0 ? o.hasteMul ?? 1 : 1, mul);
    o.hasteT = Math.max(o.hasteT ?? 0, HERD_T); o.hasteBy = by;
    herdDmg(w, o);
  }
  return list.length;
}

/* ---------- atores: laço (corda + argola) e onda do berrante ---------- */
interface Laco { x: number; y: number; x0: number; y0: number; tx: number; ty: number; t: number; f: Fighter | null; caught: boolean; done: boolean; actor: ExtraActor }

function handOf(z: Zombie): { x: number; y: number } {
  return { x: z.x + z.face * 10, y: z.y - z.K.top * 0.52 };
}

function propCv(w: World, z: Zombie, anim: string, st: number): any {
  const F = z.K.F;
  return F.framePose ? F.framePose(z.form, anim, { st }, anim + st + '.0') : F.frame(z.form, anim, st, 5);
}

function killLaco(w: World, z: Zombie): void {
  const L = z._laco as Laco | undefined; if (!L) return;
  L.done = true; z._laco = null;
  if (w.actors) { const i = w.actors.indexOf(L.actor); if (i >= 0) w.actors.splice(i, 1); }
}

function startLaco(w: World, z: Zombie, V: Fighter): void {
  const h = handOf(z);
  const L: Laco = { x: h.x, y: z.y, x0: h.x, y0: z.y, tx: V.x, ty: V.y, t: 0, f: null, caught: false, done: false, actor: null as unknown as ExtraActor };
  L.actor = {
    x: L.x, y: L.y, w0: 4, hide: true,
    draw: (c, cam) => {
      // some sozinho se o peão morreu/foi interrompido
      if (L.done || z.dead || z.anim !== 'laco') { killLaco(w, z); return; }
      if (L.actor.hide) return;
      const hd = handOf(z), lx = L.x, ly = L.y - (L.f ? 46 : 30);
      // corda: catenária em pixels (contorno escuro + couro), mais esticada quando puxando
      const sag = L.caught ? 2 : 10, n = Math.max(6, Math.round(Math.abs(lx - hd.x) / 3));
      for (let pass = 0; pass < 2; pass++) {
        c.fillStyle = pass ? (z.form === 'enluarado' ? '#9c96c0' : z.form === 'plenilunar' ? '#c07a4a' : '#b8905c') : '#170b1c';
        const s = pass ? 0.5 : 1;
        for (let i = 0; i <= n; i++) {
          const t = i / n, x = hd.x + (lx - hd.x) * t, y = hd.y + (ly - hd.y) * t + Math.sin(t * Math.PI) * sag;
          c.fillRect(x - cam - s / 2, y - s / 2, s, s);
        }
      }
      const st = L.caught ? 3 : Math.min(2, Math.floor(L.t * 20)), cv = propCv(w, z, 'xLaco', st);
      if (!cv) return;
      c.save(); c.translate(Math.round(lx - cam), Math.round(ly)); if (z.face < 0) c.scale(-1, 1);
      c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      c.restore();
    },
  };
  (w.actors ??= []).push(L.actor);
  z._laco = L;
}

function waveFx(w: World, z: Zombie): void {
  const t0 = clock(w), x = z.x + z.face * 26, y = z.y, face = z.face;
  const actor: ExtraActor = {
    x, y, w0: 4,
    draw: (c, cam) => {
      const t = clock(w) - t0;
      if (t > 0.6) { if (w.actors) { const i = w.actors.indexOf(actor); if (i >= 0) w.actors.splice(i, 1); } return; }
      const cv = propCv(w, z, 'xBerrante', Math.min(2, Math.floor(t / 0.2)));
      if (!cv) return;
      c.save(); c.translate(Math.round(x - cam), Math.round(y - z.K.top * 0.62)); if (face < 0) c.scale(-1, 1);
      c.drawImage(cv, -(cv._ax ?? 0) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      c.restore();
    },
  };
  (w.actors ??= []).push(actor);
}

/** Resolve o lançamento (quadro throwAt): pega quem ainda estiver no círculo. Exportado pros testes. */
export function throwLaco(w: World, z: Zombie): Fighter | null {
  const L = z._laco as Laco | undefined;
  w.warns = w.warns.filter((t) => t.owner !== z);
  if (!L) return null;
  L.actor.hide = false;
  let got: Fighter | null = null;
  for (const f of aliveF(w)) {
    if (near(f, { x: L.tx, y: L.ty }) > LACO_R + 4) continue;
    if (Math.abs(f.x - z.x) > lacoMax(z) + 8 || crateBetween(w, z.x, f.x, f.y) != null) continue;
    got = f; break;
  }
  if (!got) { L.x = L.tx; L.y = L.ty; w.fx('tag', 'ERROU!', L.tx, L.ty - 60); spawnFx(w, 'dust', L.tx, L.ty, z.face); return null; }
  L.f = got; L.caught = true; L.x = got.x; L.y = got.y;
  hurtF(w, got, z.K.dmg * LACO_DMG * z.dmgMul);
  stunF(w, got, LACO_STUN, 'PRESO!');
  w.fx('burst', 'LAÇOU!', got.x, got.y - 70);
  w.log(`${z.K.nome} laçou ${got.m?.nome ?? 'o lutador'}!`);
  w.shake = Math.max(w.shake, 0.08);
  return got;
}

/** Puxa o lutador laçado na direção do peão (chamado a cada update nos quadros de puxada). Exportado pros testes. */
export function tickPull(w: World, z: Zombie, dt: number): void {
  const L = z._laco as Laco | undefined; if (!L || !L.f || !L.caught) return;
  const f = L.f;
  if (f.down || f.state === 'kd') { L.caught = false; return; }
  const tx = z.x + z.face * PULL_TO;
  const stop = crateBetween(w, f.x, tx, f.y);
  const goal = stop ?? tx, d = goal - f.x;
  f.x += Math.sign(d) * Math.min(Math.abs(d), 320 * dt);
  f.y = clampY(f.y + Math.sign(z.y - f.y) * Math.min(Math.abs(z.y - f.y), 120 * dt));
  if (f.state === 'stun') f.stunT = Math.max(f.stunT, 0.15);
  L.x = f.x; L.y = f.y;
}

/** Corta o laço/berrante (dano forte, atordoamento, dano no berrante). */
function interrupt(w: World, z: Zombie, tag: string): void {
  if (z._laco) { const L = z._laco as Laco; if (L.f && L.f.state === 'stun') L.f.stunT = Math.min(L.f.stunT, 0.1); killLaco(w, z); }
  endMove(w, z);
  z.state = 'hurt'; z.prev = 'chase'; setAnim(z, 'hurt');
  w.fx('tag', tag, z.x, z.y - z.K.top * 0.5 - 14);
}

/** Defesa (registrada em GUARDS): fraqueza depois do sopro e interrupções. */
export function peaoGuard(w: World, z: Zombie, dmg: number): number | null {
  if ((z.weakT ?? 0) > 0) dmg *= WEAK_MUL;
  if (z.state === 'attack' && z.anim === 'berrante' && !z.called) { interrupt(w, z, 'CORTOU O BERRANTE!'); return dmg; }
  if (z.state === 'attack' && z.anim === 'laco' && dmg >= z.maxhp * PULL_BREAK) { interrupt(w, z, 'SOLTOU O LAÇO!'); return dmg; }
  return dmg;
}
(GUARDS as Record<string, unknown>).peao = peaoGuard;

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

function begin(c: ZCtx, anim: string): void {
  const { z } = c;
  z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
  z.state = 'attack'; z.move = anim; z.hit = false; z.called = false;
  setAnim(z, anim);
}

export const peao: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt, V } = c;
    tickMoves(z, dt);
    z.lacoCd = Math.max(0, (z.lacoCd ?? 1.5) - dt);
    z.hornCd = Math.max(0, (z.hornCd ?? 1) - dt);
    if ((z.weakT ?? 0) > 0) z.weakT = Math.max(0, z.weakT - dt);
    if ((z.knifeT ?? 0) > 0) z.knifeT = Math.max(0, z.knifeT - dt);
    if (z._laco && z.anim !== 'laco') killLaco(w, z); // atordoado/derrubado no meio: o laço cai
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'attack') {
      const A = z.K.F.ANIMS[z.anim];
      if (z.anim === 'laco') {
        const pr: number[] = A?.pull ?? [5, 8];
        if (z.fi >= pr[0] && z.fi <= pr[1]) tickPull(w, z, dt);
      } else moveStep(c, MOVES);
      c.step(true);
      if (z.done) {
        const was = z.anim, caught = !!(z._laco as Laco | undefined)?.f;
        killLaco(w, z); endMove(w, z);
        if (was === 'laco' && caught) z.knifeT = 2.5; // laçou: entra de faca
        z.state = 'cool'; z.cd = was === 'attack' ? 0.5 : 0.35; setAnim(z, 'idle');
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // berrante: grupo chegou
    const A = z.K.F.ANIMS;
    const hornOk = A.berrante && z.hornCd <= 0 && !(z.form === 'comum' && z.blew) && c.adx > 30;
    if (hornOk && alliesNear(w, z).length >= HERD_MIN) {
      begin(c, 'berrante'); z.hornCd = BERRANTE_CD;
      w.fx('bubble', 'BÓÓÓM!', z.x, z.y - z.K.top * 0.6);
      return;
    }
    // laço: de longe, com linha de visão
    if (A.laco && z.lacoCd <= 0 && canLaco(w, z, V)) {
      begin(c, 'laco'); z.lacoCd = LACO_CD;
      startLaco(w, z, V);
      w.warns.push({ kind: 'circle', x: V.x, y: V.y, r: LACO_R, owner: z } as any);
      w.fx('bubble', 'ÊÊÊ BOI!', z.x, z.y - z.K.top * 0.6);
      return;
    }
    if (c.adx < 40 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    // posicionamento: com rebanho perto (ou depois de laçar) entra de faca; sozinho circula a 100–140 px
    const herd = alliesNear(w, z).length > 0;
    if (herd || (z.knifeT ?? 0) > 0) { setAnim(z, 'walk'); c.chase(21, 28); return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    setAnim(z, 'walk');
    const want = c.adx < 100 ? -1 : c.adx > 140 ? 1 : 0;
    z.x += Math.sign(c.dx) * want * 20 * dt;
    z.orb = (z.orb ?? Math.random() * 6) + dt * 0.9;
    z.y = clampY(z.y + Math.cos(z.orb) * 16 * dt + Math.sign(V.y - z.y) * (Math.abs(V.y - z.y) > 30 ? 10 : 0) * dt);
    c.step();
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'laco') {
      if (fi === (A?.throwAt ?? 4)) throwLaco(w, z);
      return;
    }
    if (z.anim === 'berrante') {
      if (fi === (A?.call ?? 4)) {
        z.called = true; z.blew = true; z.weakT = WEAK_T;
        const n = applyHerd(w, z);
        waveFx(w, z);
        (w.rings ??= []).push({ x: z.x + z.face * 20, y: z.y - 70, t: 0 });
        w.fx('burst', 'FÚRIA DO REBANHO!', z.x, z.y - z.K.top - 10);
        w.shake = Math.max(w.shake, 0.06);
        if (n) w.log(`${z.K.nome} tocou o berrante: ${n} zumbi(s) em fúria`);
      }
      return;
    }
    if (z.anim === 'attack' && fi === 4) spawnFx(w, 'dust', z.x, z.y, z.face);
    moveFrame(c, fi, MOVES);
  },
};
