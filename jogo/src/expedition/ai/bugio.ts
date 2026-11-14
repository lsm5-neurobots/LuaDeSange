// Bugio Zumbi (IA-43–46, Amazônia, comum animal): guariba-vermelho, o "chamador" do bando.
// - Nasce lá no ALTO (pendurado pela cauda, fora do alcance) e DESCE EM SALTO em cima do squad.
// - IA-43 Urro do bando (howl): infla o papo 0,8 s com círculo de onda (r 160) -> chama 2 Bugios (3 no enluarado),
//   que chegam pelos galhos, e dá +20% de velocidade aos zumbis no círculo por 6 s. Só urra com menos de 3 aliados,
//   no máx. 1 urro ativo por área, recarga 14 s. CANCELA se levar qualquer golpe durante o aviso.
// - IA-44 Salto de galho (leap): sombra/círculo no ponto de queda (0,6 s), 90–180 px; pouso r 24 = 1,1× + DERRUBADO
//   e segura 0,3 s; se errar fica ABERTO 0,8 s (dano ×1,5). Plenilunar: o pouso solta onda (r 46, 0,5×).
// - IA-45 Fruto podre (throw): pega o fruto 0,4 s e arremessa em arco (80–200 px) no ponto onde o alvo estava;
//   estoura em r 14 = 0,7× + OFUSCADO 0,4 s. Recarga 5 s.
// - Arranhão duplo (claw): 2 × 0,45× a 30 px, recarga 2 s.
// - IA-46 Fraqueza: durante o urro (papo inflado) leva ×1,5; ABERTO depois de errar o salto leva ×1,5; frágil (hp 70).
// Tática: com aliados na tela fica atrás deles (~120 px) e arremessa/salta; sozinho parte pro arranhão.
import type { ZombieAI, ZCtx } from './index';
import type { ZombieId } from '../../data/zombies';
import { RS, aliveF, clampY, rnd, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, mkZ, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { endMove, moveFrame, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const BUG = {
  howlR: 160, hasteMul: 1.2, hasteT: 6, howlCd: 14, maxCalls: 2,
  leapMin: 90, leapMax: 180, leapR: 24, leapCd: 6, leapH: 56, holdT: 0.3, missOpen: 0.8, waveR: 46,
  fruitMin: 80, fruitMax: 200, fruitR: 14, fruitCd: 5, blindT: 0.4,
  howlMul: 1.5, openMul: 1.5, perchZ: 110, reachZ: 30, keepD: 120,
};
export const LEAP_DMG = 1.1;
export const FRUIT_DMG = 0.7;
export const WAVE_DMG = 0.5;

/** quantos bugios o urro chama */
export const callsOf = (z: Zombie) => (z.form === 'enluarado' ? 3 : 2);

export const CLAW: ZMove = { anim: 'claw', w: 3, max: 30, dy: 9, cd: 2, dmg: 0.63, word: 'RASC-RASC!' }; // 2 acertos: 0,63/1,4 = 0,45× cada
const MOVES: ZMove[] = [CLAW];
const BUSY = ['howl', 'leap', 'throw', 'open', 'perch'];
const ANIM_OF: Record<string, string> = { howl: 'howl', leap: 'leap', throw: 'throw', open: 'open', perch: 'hang' };

const now = (w: World) => w.clock ?? 0;
const A_ = (z: Zombie, a: string) => z.K.F.ANIMS[a];
const callAt = (z: Zombie) => A_(z, 'howl')?.callAt ?? 6;
const animMs = (z: Zombie, a: string, i0: number, i1: number) => { const A = A_(z, a); if (!A) return 0; let ms = 0; for (let i = i0; i < i1; i++) ms += Number(A.dur(i)); return ms / 1000; };

type Cd = { howl: number; leap: number; fruit: number };
const cds = (z: Zombie): Cd => (z._bcd ??= { howl: 2 + rnd() * 2, leap: 0.8, fruit: 1.5 }) as Cd;

/** Aliados vivos (outros zumbis) na arena. */
export const alliesOf = (w: World, z: Zombie) => w.zs.filter((o) => o !== z && !o.dead).length;

/** Já tem urro ativo nesta área (aviso em curso ou bônus de velocidade valendo)? */
export function howlActive(w: World, z?: Zombie): boolean {
  const W = w as any;
  if (W._bugioHowlBy && W._bugioHowlBy !== z && !W._bugioHowlBy.dead && W._bugioHowlBy.state === 'howl') return true;
  return now(w) < (W._bugioHowlUntil ?? -1);
}

/** Pode urrar agora? (IA-43: menos de 3 aliados, recarga, 1 por área, chamados que restam, não é chamado) */
export function canHowl(w: World, z: Zombie): boolean {
  if (z.summoned || (z.calls ?? 0) >= BUG.maxCalls || !A_(z, 'howl')) return false;
  if (cds(z).howl > 0 || alliesOf(w, z) >= 3) return false;
  return !howlActive(w, z);
}

/* ---------- defesa (registrada em GUARDS) ---------- */
export function bugioGuard(w: World, z: Zombie, dmg: number, _n: number, _by?: Fighter | null): number | null {
  if ((z.z ?? 0) > BUG.reachZ && (z.state === 'perch' || z.state === 'leap')) return null; // lá no alto: fora do alcance
  if (z.state === 'leap') { // pego na descida: cai no chão
    w.warns = w.warns.filter((t) => t.owner !== z); z.z = 0; z.state = 'hurt'; z.prev = 'keep'; setAnim(z, 'hurt');
    w.fx('tag', 'PEGO NO AR!', z.x, z.y - z.K.top * 0.5 - 14);
    return dmg;
  }
  if (z.state === 'howl' && z.anim === 'howl') {
    if (z.fi < callAt(z)) cancelHowl(w, z); // IA-43: golpe no aviso cancela o urro
    return dmg * BUG.howlMul; // IA-46: papo inflado
  }
  if ((z.openT ?? 0) > 0) return dmg * BUG.openMul;
  return dmg;
}
(GUARDS as Record<string, Guard>).bugio = bugioGuard;

export function cancelHowl(w: World, z: Zombie): void {
  w.warns = w.warns.filter((t) => t.owner !== z);
  const W = w as any; if (W._bugioHowlBy === z) W._bugioHowlBy = null;
  z.state = 'hurt'; z.prev = 'keep'; setAnim(z, 'hurt');
  w.fx('tag', 'CALOU!', z.x, z.y - z.K.top * 0.5 - 14);
  w.log(`${z.K.nome} teve o urro interrompido`);
}

/* ---------- urro ---------- */
function startHowl(c: ZCtx): void {
  const { w, z } = c;
  z.state = 'howl'; setAnim(z, 'howl'); cds(z).howl = BUG.howlCd;
  (w as any)._bugioHowlBy = z;
  w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: BUG.howlR, owner: z, c: 'rgba(255,150,60,' } as any);
  w.fx('bubble', 'UUH... UUH...', z.x, z.y - z.K.top * 0.6);
}

/** Efeito do urro (quadro callAt): chama o bando e acelera os zumbis no círculo. Exportado pros testes. */
export function doHowl(w: World, z: Zombie): Zombie[] {
  w.warns = w.warns.filter((t) => t.owner !== z);
  const W = w as any; W._bugioHowlBy = null; W._bugioHowlUntil = now(w) + BUG.hasteT;
  z.calls = (z.calls ?? 0) + 1;
  for (const o of w.zs) {
    if (o.dead || o.boss || Math.hypot(o.x - z.x, (o.y - z.y) * 2) > BUG.howlR) continue;
    const prev = o.hasteT > 0 ? (o.hasteMul ?? 1) : 1; // não rebaixa outro bônus mais forte (ritmo do Percussionista)
    o.hasteMul = Math.max(BUG.hasteMul, prev); o.hasteT = BUG.hasteT; if (!(prev > BUG.hasteMul)) o.hasteBy = z;
  }
  const out: Zombie[] = [];
  if ((w.zk as any).bugio) {
    const n = callsOf(z);
    for (let j = 0; j < n; j++) {
      const left = j % 2 === 0;
      const x = left ? w.cam + 34 + j * 18 : w.cam + w.W - 34 - j * 18;
      const nz = mkZ(w, 'bugio' as ZombieId, x, clampY(150 + rnd() * 50), (left ? 1 : -1) as 1 | -1, 'perch', 'hang');
      nz.summoned = true; nz.z = BUG.perchZ; nz.perchT = 0.5 + j * 0.35;
      out.push(nz);
    }
  }
  w.shake = Math.max(w.shake, 0.18);
  w.fx('burst', 'UÔÔÔÔÔU!', z.x + z.face * 26, z.y - z.K.top);
  spawnFx(w, 'dust', z.x, z.y, z.face);
  w.log(`${z.K.nome} urrou e chamou o bando`);
  return out;
}

/* ---------- salto de galho ---------- */
/** Ponto de queda: o alvo, limitado ao alcance máximo do salto. */
export function leapTarget(z: Zombie, V: { x: number; y: number }): { x: number; y: number } {
  const d = V.x - z.x, ad = Math.min(BUG.leapMax, Math.abs(d));
  return { x: z.x + Math.sign(d || z.face) * ad, y: clampY(V.y) };
}

export function startLeap(c: ZCtx, fromPerch = false): void {
  const { w, z, V } = c, A = A_(z, 'leap');
  const t = leapTarget(z, V);
  z.face = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  z.state = 'leap'; setAnim(z, 'leap'); z.hitV = false; z.holdT = 0;
  const air = (A?.air as number[] | undefined) ?? [3, 4, 5, 6, 7], land = A?.land ?? 8;
  if (fromPerch) { z.fi = A?.drop ?? 5; z.acc = 0; }
  const f0 = fromPerch ? z.fi : air[0];
  z._leap = { x0: z.x, y0: z.y, z0: fromPerch ? (z.z || BUG.perchZ) : 0, tx: t.x, ty: t.y, t: 0, T: Math.max(0.2, animMs(z, 'leap', f0, land)), go: false, f0 };
  cds(z).leap = BUG.leapCd;
  w.warns.push({ kind: 'circle', x: t.x, y: t.y, r: BUG.leapR, owner: z } as any); // a "sombra" crescendo no chão
}

/** Pouso do salto: acerta quem estiver no círculo. Exportado pros testes. */
export function leapLand(w: World, z: Zombie): Fighter[] {
  const L = z._leap; if (L) { z.x = L.tx; z.y = L.ty; }
  z.z = 0;
  w.warns = w.warns.filter((t) => t.owner !== z);
  const out: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (Math.hypot(f.x - z.x, (f.y - z.y) * 2) > BUG.leapR) continue;
    hurtF(w, f, z.K.dmg * LEAP_DMG * z.dmgMul, { heavy: true });
    if (!f.down && f.state !== 'kd' && f.state !== 'getup') {
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-z.face) as 1 | -1; }
      else stunF(w, f, 0.9, 'DERRUBADO');
    }
    out.push(f);
  }
  if (z.form === 'plenilunar') for (const f of aliveF(w)) {
    if (out.includes(f) || Math.hypot(f.x - z.x, (f.y - z.y) * 2) > BUG.waveR) continue;
    hurtF(w, f, z.K.dmg * WAVE_DMG * z.dmgMul); f.x += Math.sign(f.x - z.x || 1) * 10;
  }
  w.shake = Math.max(w.shake, 0.16);
  spawnFx(w, 'dust', z.x, z.y, z.face); spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1);
  if (out.length) { w.fx('burst', 'PUMBA!', z.x, z.y - 50); z.holdT = BUG.holdT; for (const f of out) w.fx('tag', 'AGARRADO!', f.x, f.y - 104); }
  else { z.openT = BUG.missOpen; z.state = 'open'; setAnim(z, A_(z, 'open') ? 'open' : 'hurt'); w.fx('tag', 'ABERTO!', z.x, z.y - z.K.top * 0.5 - 14); }
  z.hitV = true;
  return out;
}

function leapStep(c: ZCtx): void {
  const { z, dt, w } = c, L = z._leap, A = A_(z, 'leap'), land = A?.land ?? 8;
  if (!L) { z.state = 'keep'; setAnim(z, 'walk'); return; }
  if ((z.holdT ?? 0) > 0) { z.holdT -= dt; for (const f of aliveF(w)) if (Math.hypot(f.x - z.x, (f.y - z.y) * 2) < BUG.leapR && f.state === 'stun') { f.x += (z.x + z.face * 8 - f.x) * Math.min(1, dt * 10); } return; }
  if (z.fi >= L.f0 && z.fi < land) {
    L.t += dt; const p = Math.min(1, L.t / L.T);
    z.x = L.x0 + (L.tx - L.x0) * p; z.y = clampY(L.y0 + (L.ty - L.y0) * p);
    z.z = Math.max(0, L.z0 * (1 - p) + (L.z0 > 0 ? 14 : BUG.leapH) * Math.sin(p * Math.PI));
  }
  const f0 = z.fi; c.step(true);
  if (z.state !== 'leap') return; // pouso errado -> 'open'
  if (z.fi < f0 && !z.hitV) { leapLand(w, z); if (z.state !== 'leap') return; }
  if (z.done) { z._leap = null; z.z = 0; z.state = 'cool'; z.cd = 0.5; setAnim(z, 'idle'); }
}

/* ---------- fruto podre ---------- */
interface Fruit { x0: number; y0: number; x1: number; y1: number; x: number; y: number; h: number; t: number; T: number; done: boolean; actor: ExtraActor }

function startThrow(c: ZCtx): void {
  const { z, V } = c;
  z.state = 'throw'; setAnim(z, 'throw'); cds(z).fruit = BUG.fruitCd;
  z.face = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  const d = Math.max(BUG.fruitMin, Math.min(BUG.fruitMax, Math.abs(V.x - z.x)));
  z._ft = { x: z.x + z.face * d, y: clampY(V.y) }; // mira onde o alvo ESTÁ agora (sair do lugar desvia)
}

/** Lança o fruto (quadro toss). Exportado pros testes. */
export function throwFruit(w: World, z: Zombie, to?: { x: number; y: number }): Fruit {
  const t = to ?? z._ft ?? { x: z.x + z.face * 120, y: z.y };
  const x0 = z.x + z.face * 16, y0 = z.y, dist = Math.abs(t.x - x0);
  const F: Fruit = { x0, y0, x1: t.x, y1: t.y, x: x0, y: y0, h: 70, t: 0, T: 0.22 + dist / 420, done: false, actor: null as unknown as ExtraActor };
  F.actor = {
    x: F.x, y: F.y, w0: 3,
    draw: (cx, cam) => {
      if (F.done) return;
      const FF = z.K.F, fi = Math.floor(now(w) * 16) % 4;
      const cv: any = FF.framePose ? FF.framePose(z.form, 'xFruit', { st: fi }, 'xFruit' + fi + '.0') : FF.frame(z.form, 'xFruit', fi, 5);
      if (!cv) return;
      cx.save(); cx.translate(Math.round(F.x - cam), Math.round(F.y - F.h)); if (F.x1 < F.x0) cx.scale(-1, 1);
      cx.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      cx.restore();
    },
  };
  (w.actors ??= []).push(F.actor);
  (z._fruits ??= []).push(F);
  z._ft = null;
  return F;
}

function landFruit(w: World, z: Zombie, F: Fruit): void {
  F.done = true;
  if (w.actors) { const i = w.actors.indexOf(F.actor); if (i >= 0) w.actors.splice(i, 1); }
  let hit = false;
  for (const f of aliveF(w)) {
    if (Math.hypot(f.x - F.x1, (f.y - F.y1) * 2) > BUG.fruitR * 2) continue;
    hurtF(w, f, z.K.dmg * FRUIT_DMG * z.dmgMul); stunF(w, f, BUG.blindT, 'OFUSCADO'); hit = true;
  }
  spawnFx(w, 'acidSplash', F.x1, F.y1, 1, { cor: z.form === 'enluarado' ? '#7ad8f0' : z.form === 'plenilunar' ? '#ffb43a' : '#a8c84a' });
  w.fx('burst', hit ? 'PLOFT!' : 'PLAF', F.x1, F.y1 - 34);
}

/** Move os frutos no ar e estoura no chão. Exportado pros testes. */
export function tickFruit(w: World, z: Zombie, dt: number): void {
  const list = z._fruits as Fruit[] | undefined; if (!list?.length) return;
  for (const F of list) {
    if (F.done) continue;
    F.t += dt; const p = Math.min(1, F.t / F.T);
    F.x = F.x0 + (F.x1 - F.x0) * p; F.y = F.y0 + (F.y1 - F.y0) * p;
    F.h = 70 * (1 - p) + 4 + 34 * Math.sin(p * Math.PI);
    F.actor.x = F.x; F.actor.y = F.y;
    if (p >= 1) landFruit(w, z, F);
  }
  z._fruits = list.filter((F) => !F.done);
}

/* ---------- comportamento ---------- */
function toKeep(z: Zombie): void { z.state = 'keep'; setAnim(z, 'walk'); }

export const bugio: ZombieAI = {
  rest: 'keep',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt); tickFruit(w, z, dt);
    const cd = cds(z); cd.howl = Math.max(0, cd.howl - dt); cd.leap = Math.max(0, cd.leap - dt); cd.fruit = Math.max(0, cd.fruit - dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    // voltou do dano no meio de um golpe próprio (anim trocada): limpa e volta pro chão
    if (BUSY.includes(z.state) && z.anim !== ANIM_OF[z.state]) {
      w.warns = w.warns.filter((t) => t.owner !== z); const W = w as any; if (W._bugioHowlBy === z) W._bugioHowlBy = null;
      z._leap = null; z.z = 0; toKeep(z);
    }
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, A_(z, 'alert') ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !A_(z, 'alert')) toKeep(z); return; }
    if (z.state === 'perch') { // pendurado no galho, lá em cima
      if (!(z.z > 0)) z.z = BUG.perchZ;
      z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
      c.step();
      z.perchT = (z.perchT ?? 0.6 + rnd() * 1.2) - dt;
      if (z.perchT <= 0) startLeap(c, true);
      return;
    }
    if (z.state === 'leap') { leapStep(c); return; }
    if (z.state === 'howl' || z.state === 'throw') { c.step(true); if (z.done && (z.state === 'howl' || z.state === 'throw')) { endMove(w, z); z.state = 'cool'; z.cd = 0.5; setAnim(z, 'idle'); } return; }
    if (z.state === 'attack') { c.step(true); if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = 0.5; setAnim(z, 'idle'); } return; }
    if (z.state === 'open') { c.step(); if (z.done && (z.openT ?? 0) <= 0) toKeep(z); return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toKeep(z); return; }
    // ---- keep: escolhe o golpe pela situação ----
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (canHowl(w, z) && c.adx < 240) { startHowl(c); return; }
    if (c.adx < 34 && Math.abs(c.dy) < 10) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    if (cd.leap <= 0 && c.adx >= BUG.leapMin && c.adx <= BUG.leapMax + 20 && Math.abs(c.dy) < 40 && A_(z, 'leap')) { startLeap(c); return; }
    if (cd.fruit <= 0 && c.adx >= BUG.fruitMin && c.adx <= BUG.fruitMax && Math.abs(c.dy) < 30 && A_(z, 'throw')) { startThrow(c); return; }
    const horde = w.zs.some((o) => o !== z && !o.dead && (o.kind as string) !== 'bugio');
    if (horde) { // fica atrás da horda, a ~120 px, e arremessa
      const mv = c.adx < BUG.keepD - 20 ? -1 : c.adx > BUG.keepD + 20 ? 1 : 0;
      z.x += Math.sign(c.dx) * mv * 24 * dt;
      z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x));
      z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 14 * dt));
      setAnim(z, mv ? 'walk' : 'idle'); c.step();
      return;
    }
    setAnim(z, 'walk');
    c.chase(25, 24);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = A_(z, z.anim);
    if (z.anim === 'howl') { if (fi === callAt(z) && z.state === 'howl') doHowl(w, z); return; }
    if (z.anim === 'throw') { if (fi === (A?.toss ?? 4)) throwFruit(w, z); return; }
    if (z.anim === 'leap') { if (fi === (A?.land ?? 8) && !z.hitV) leapLand(w, z); return; }
    moveFrame(c, fi, MOVES);
  },
  spawn(w, i, fromLeft) { // nasce pendurado nas árvores, já dentro da tela, e desce em salto
    const x = fromLeft ? w.cam + 36 + i * 22 : w.cam + w.W - 36 - i * 22;
    return { x, y: 150 + rnd() * 50, face: fromLeft ? 1 : -1, state: 'perch', anim: 'hang' };
  },
};
