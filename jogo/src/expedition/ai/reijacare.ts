// Chefe O Rei Jacaré (Pantanal, arena do rio; BOSS-36..38, IA-43, IA-44). Predador de emboscada:
// - Mordida (bite): aviso de 600 ms na boca (arqueia e abre), 1,4× de dano, derruba. Recarga 4 / 3 s.
// - Giro da morte (spin): círculo r 56 na boca por 700 ms; agarra (1,0×), PRESO 1,8 s sendo girado com 3 pulsos de
//   0,4× e arremessado 80 px. Outro lutador solta a vítima com golpe forte. Depois ele fica ZONZO 1,2 s (+50%).
//   Fúria: giro duplo (6 pulsos). Recarga 9 / 6,5 s.
// - Rabada (tail): vira a cauda pro alvo, círculo r 90 atrás; 1,1×, empurra 40 px, ATORDOADO 0,5 s. Errou: bate na
//   margem e fica ZONZO 1 s. Fúria: onda ao longo da cauda (r 140, 0,5×). Recarga 5 / 3,5 s.
// - Mergulho e emersão (dive/emerge): mergulha (invulnerável 1,5 s), marca o chão do alvo com bolhas 1,0 s antes e
//   emerge ali com a mordida (r 50, 1,3×); recupera vulnerável nos 5 últimos quadros. Fúria: 2 emersões em lutadores
//   diferentes. Recarga 12 / 9 s.
// - Rugido (roar, só na fúria, 1×): afasta o squad 30 px (r 200) e chama 2 piranhas.
// IA-43: < 90 px mordida ou giro; 90–160 px rabada ou mordida; > 160 px mergulho; nunca repete o mesmo golpe 2×.
// Fraquezas: ZONZO (+50%, via z.vuln), a barriga clara enquanto arqueia pra morder (+25%) e o olho esquerdo cego
// (lado de baixo da tela quando ele olha pra esquerda): +15% de dano e reage 0,3 s mais devagar a quem está ali.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, mkZ } from '../combat';
import { hurtF, stunF } from '../fighter';

export const RJ_CD: Record<string, [number, number]> = { bite: [4, 3], spin: [9, 6.5], tail: [5, 3.5], dive: [12, 9] };
export const BITE = { reach: 112, ang: 35, at: 64, warnR: 44, dmg: 1.4 };
export const SPIN = { r: 56, at: 54, dmg: 1.0, pulse: 0.4, throwPx: 80, daze: 1.2 };
export const TAIL = { r: 90, at: 50, dmg: 1.1, push: 40, stun: 0.5, waveR: 140, wave: 0.5, missDaze: 1.0 };
export const DIVE = { sub: 1.5, mark: 1.0, r: 50, dmg: 1.3 };
export const ROAR = { r: 200, push: 30, n: 2 };
export const NEAR = 90, MID = 160;
export const BELLY_MUL = 1.25, BLIND_MUL = 1.15, BLIND_DELAY = 0.3;
/** posição da boca em relação ao centro (px lógicos) */
export const MOUTH = { x: 54, y: 2 };

const mul = (z: Zombie) => (z.fury ? 1.3 : 1);
const ev = (A: any, k: string, d: any) => (A && A[k] != null ? A[k] : d);
const hitsOf = (A: any, k: string, d: number[]): number[] => { const v = ev(A, k, d); return Array.isArray(v) ? v : [v]; };
const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, (a.y - b.y) * 2);

/** O lado do olho esquerdo cego: com face -1 (olhando pra esquerda) o lado esquerdo é o de baixo da tela (+y). */
export function blindSide(z: Zombie, f: { y: number }): boolean {
  const dy = f.y - z.y;
  return Math.abs(dy) > 4 && Math.sign(dy) === -z.face;
}

/* ---------- atores (água/onda) com a arte da própria factory ---------- */
function propFrame(z: Zombie, an: string, st: number): any {
  const F = z.K.F, A = F.ANIMS?.[an];
  if (!A) return null;
  const i = Math.max(0, Math.min(A.n - 1, st));
  return F.framePose ? F.framePose(z.form, an, { st: i }, an + i + '.0') : F.frame(z.form, an, i, 5);
}
function addActor(w: World, z: Zombie, an: string, x: number, y: number, life: number, stOf: (t: number) => number, flip = 1): ExtraActor {
  const t0 = w.clock ?? 0;
  const a: ExtraActor = {
    x, y, w0: 0,
    draw: (c, cam) => {
      const t = (w.clock ?? 0) - t0;
      if (t > life || z.dead) { dropActor(w, a); return; }
      const cv = propFrame(z, an, stOf(t)); if (!cv) return;
      c.save(); c.translate(Math.round(a.x - cam), Math.round(a.y)); if (flip < 0) c.scale(-1, 1);
      c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height) / RS, cv.width / RS, cv.height / RS); c.restore();
    },
  };
  (w.actors ??= []).push(a);
  return a;
}
function dropActor(w: World, a: ExtraActor | null | undefined): void { if (a && w.actors) { const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); } }
const clearWarns = (w: World, z: Zombie) => { w.warns = w.warns.filter((t) => t.owner !== z); };

/* ---------- giro da morte: vítima presa na boca ---------- */
export function heldOf(z: Zombie): Fighter | null { return (z.held as Fighter) ?? null; }
function holdTick(w: World, z: Zombie): void {
  const f = heldOf(z); if (!f) return;
  if (f.down) { z.held = null; return; }
  f.x = Math.max(w.cam + 12, Math.min(w.cam + w.W - 12, z.x + z.face * MOUTH.x));
  f.y = clampY(z.y + MOUTH.y);
  if (f.state !== 'stun') { f.state = 'stun'; f.stunT = 0.25; } else f.stunT = Math.max(f.stunT, 0.25);
}
/** Solta a vítima (arremesso no fim do giro ou golpe forte de outro lutador). */
export function releaseHeld(w: World, z: Zombie, throwPx: number): Fighter | null {
  const f = heldOf(z); z.held = null; if (!f) return null;
  if (throwPx) {
    f.x = Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, f.x + z.face * throwPx));
    w.fx('burst', 'ARREMESSADO!', f.x, f.y - 70); spawnFx(w, 'dust', f.x, f.y, z.face);
    if (f.state === 'stun') f.stunT = 0.5;
  } else if (f.state === 'stun') f.stunT = Math.min(f.stunT, 0.1);
  return f;
}

/** Defesa: submerso = invulnerável; golpe forte de outro lutador solta a vítima; barriga e olho cego. */
export function reiGuard(w: World, z: Zombie, dmg: number, n: number, by?: Fighter | null): number | null {
  if (z.sub) { if ((w.clock ?? 0) - (z.subTag ?? -9) > 0.6) { z.subTag = w.clock ?? 0; w.fx('tag', 'SUBMERSO', z.x, z.y - 30); } return null; }
  if (z.held && by && by !== z.held && n === 3) {
    releaseHeld(w, z, 0);
    w.fx('burst', 'SOLTOU!', z.x, z.y - z.K.top * 0.5);
    w.log(`${by.m?.nome ?? 'Um lutador'} soltou a vítima do ${z.K.nome}!`);
    toZonzo(w, z, SPIN.daze);
  }
  if (z.state === 'attack' && z.mv === 'bite' && z.fi <= hitsOf(z.K.F.ANIMS.bite, 'warn', [0, 4])[1]) { dmg *= BELLY_MUL; if ((w.clock ?? 0) - (z.bellyTag ?? -9) > 0.5) { z.bellyTag = w.clock ?? 0; w.fx('tag', 'BARRIGA!', z.x, z.y - 40); } }
  if (by && blindSide(z, by)) dmg *= BLIND_MUL;
  return dmg;
}
(GUARDS as Record<string, unknown>).reijacare = reiGuard;

function toZonzo(w: World, z: Zombie, t: number): void {
  clearWarns(w, z);
  z.state = 'zonzo'; z.mv = null; z.hold = false; z.vuln = true; z.zonzoT = t;
  setAnim(z, z.K.F.ANIMS.dazed ? 'dazed' : 'hurt');
  w.fx('tag', 'ZONZO!', z.x, z.y - z.K.top * 0.55 - 10);
}
function toWalk(z: Zombie, cd: number): void { z.state = 'walk'; z.mv = null; z.hold = false; z.vuln = false; z.cd = cd; setAnim(z, 'walk'); }

function start(w: World, z: Zombie, mv: string): void {
  z.state = 'attack'; z.mv = mv; z.lastMv = mv; z.hitDone = false; setAnim(z, mv);
  const cd = RJ_CD[mv]; if (cd) z.mcd[mv] = cd[z.fury ? 1 : 0];
}

/* ---------- golpes ---------- */
export function biteHits(w: World, z: Zombie): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const dx = (f.x - z.x) * z.face, dy = (f.y - z.y) * 2;
    if (dx <= 0 || Math.hypot(dx, dy) > BITE.reach) continue;
    if (Math.atan2(Math.abs(dy), dx) * 180 / Math.PI > BITE.ang) continue;
    hurtF(w, f, z.K.dmg * BITE.dmg * mul(z) * (z.dmgMul ?? 1), { push: 30, heavy: true }); out.push(f);
  }
  return out;
}
function circleHit(w: World, x: number, y: number, r: number, dmg: number, o: { push?: number; fromX?: number; stun?: number; tag?: string; rMin?: number } = {}): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const d = dist2(f, { x, y }); if (d >= r || (o.rMin != null && d < o.rMin)) continue;
    hurtF(w, f, dmg, { push: o.push ?? 0, heavy: (o.push ?? 0) >= 20 }); out.push(f);
    if (o.push) f.x = Math.max(w.cam + 12, Math.min(w.cam + w.W - 12, f.x + Math.sign(f.x - (o.fromX ?? x) || 1) * o.push));
    if (o.stun && !f.down) stunF(w, f, o.stun, o.tag ?? 'ATORDOADO');
  }
  return out;
}
export const tailCenter = (z: Zombie) => ({ x: z.x - z.face * TAIL.at, y: z.y });
export const mouthOf = (z: Zombie) => ({ x: z.x + z.face * MOUTH.x, y: z.y + MOUTH.y });

/** Escolhe o golpe pela distância (IA-43), sem repetir o último. Exportado pros testes. */
export function chooseMove(z: Zombie, d: number, behind: boolean): string | null {
  const mcd = z.mcd ?? {}, ok = (m: string) => !(mcd[m] > 0) && z.lastMv !== m;
  if (z.fury && !z.roared && z.lastMv !== 'roar') return 'roar';
  if (behind && ok('tail')) return 'tail';
  const opts = d < NEAR ? ['spin', 'bite'] : d < MID ? ['tail', 'bite'] : ['dive'];
  for (const m of opts) if (ok(m)) return m;
  if (d >= MID) return null; // longe e sem mergulho: anda
  return null;
}

/* ---------- mergulho ---------- */
function pickTarget(w: World, z: Zombie, not?: Fighter | null): Fighter | null {
  const fs = aliveF(w); if (!fs.length) return null;
  const others = fs.filter((f) => f !== not);
  const pool = others.length ? others : fs;
  return pool.reduce((a, b) => (dist2(a, z) < dist2(b, z) ? a : b));
}
function startSub(w: World, z: Zombie, t0 = 0): void {
  z.state = 'sub'; z.sub = true; z.vuln = false; z.subT = t0; z.mark = null; z.hold = true;
  setAnim(z, 'dive'); z.fi = Math.max(0, (z.K.F.ANIMS.dive?.n ?? 8) - 1); z.hold = true;
}
function placeMark(w: World, z: Zombie): void {
  const f = pickTarget(w, z, z.firstVictim ?? null);
  const x = f ? f.x : z.x, y = clampY(f ? f.y : z.y);
  z.mark = { x, y, f };
  if (!z.second) z.firstVictim = f;
  const warn = { kind: 'circle' as const, x, y, r: DIVE.r, owner: z };
  w.warns.push(warn);
  z.markActor = addActor(w, z, 'xAgua', x, y, DIVE.mark + 0.1, (t) => (t < 0.5 ? 0 : 1));
}

export const reijacare: ZombieAI = {
  rest: 'walk',
  update(c: ZCtx) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS, spd = z.fury ? 1.3 : 1;
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = { dive: 4, spin: 2 });
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.held && z.mv !== 'spin') releaseHeld(w, z, 0);
    if (z.state === 'enter') { z.state = 'intro'; setAnim(z, 'intro'); }
    if (z.state === 'intro' || z.state === 'rage') {
      if (z.state === 'rage' && !z.rageInit) { // fúria interrompe tudo
        z.rageInit = true; releaseHeld(w, z, 0); clearWarns(w, z); dropActor(w, z.markActor); z.sub = false; z.vuln = false; z.hold = false; z.roared = false;
      }
      const pf = z.fi; c.step();
      if (z.fi !== pf) {
        if (z.anim === 'intro' && z.fi === 3) { w.shake = 0.5; spawnFx(w, 'dust', z.x, z.y, -1); w.fx('burst', 'SPLASH!', z.x, z.y - 50); }
        if (z.anim === 'intro' && z.fi === 10) { w.shake = Math.max(w.shake, 0.35); w.fx('burst', 'GRRROOOAR!', z.x, z.y - z.K.top * 0.7); }
        if (z.anim === 'rage' && z.fi === 5) { w.shake = 0.5; w.fx('burst', 'KRRRAAA!', z.x, z.y - z.K.top * 0.7); }
      }
      if (z.done) toWalk(z, 0.6);
      return;
    }
    if (z.state === 'zonzo') {
      z.zonzoT -= dt; z.vuln = true;
      c.step();
      if (z.done) { z.fi = 0; z.acc = 0; z.done = false; }
      if (z.zonzoT <= 0) toWalk(z, z.fury ? 0.5 : 0.9);
      return;
    }
    if (z.state === 'dive') {
      const pf = z.fi; c.step();
      if (z.fi !== pf && z.fi === 2) { w.fx('burst', 'SPLASH!', z.x, z.y - 30); spawnFx(w, 'dust', z.x, z.y, z.face); }
      if (z.fi >= 4) z.sub = true;
      if (z.done) startSub(w, z, 0);
      return;
    }
    if (z.state === 'sub') {
      z.subT += dt; z.sub = true;
      if (!z.mark && z.subT >= DIVE.sub - DIVE.mark) placeMark(w, z);
      if (z.mark) { // desliza por baixo d'água até o ponto marcado (só os olhos aparecem)
        const left = Math.max(0.05, DIVE.sub - z.subT), k = Math.min(1, dt / left);
        z.face = (Math.sign(z.mark.x - z.x) || z.face) as 1 | -1;
        z.x += (z.mark.x - z.x) * k; z.y = clampY(z.y + (z.mark.y - z.y) * k);
      }
      if (z.subT >= DIVE.sub && z.mark) {
        z.x = z.mark.x; z.y = z.mark.y; z.sub = false; z.hold = false;
        z.state = 'attack'; z.mv = 'emerge'; z.hitDone = false; setAnim(z, 'emerge');
        const f = z.mark.f as Fighter | null; if (f) z.face = (Math.sign(f.x - z.x) || z.face) as 1 | -1;
      }
      return;
    }
    if (z.state === 'attack') {
      const mv = z.mv as string, AA = A[mv];
      if (mv === 'spin') {
        holdTick(w, z);
        const sp = hitsOf(AA, 'spin', [5, 11]);
        if (z.fury && z.held && !z.spin2 && z.fi === sp[1] && z.acc + dt * 1000 >= (AA?.dur?.(z.fi) ?? 250)) { z.spin2 = true; z.fi = sp[0]; z.acc = 0; }
      }
      if (mv === 'emerge') { const vl: number[] = ev(AA, 'vuln', [5, 6, 7, 8, 9]); z.vuln = vl.includes(z.fi); }
      c.step(true);
      if (z.done) {
        clearWarns(w, z); dropActor(w, z.markActor);
        if (mv === 'spin') { releaseHeld(w, z, SPIN.throwPx); toZonzo(w, z, SPIN.daze); return; }
        if (mv === 'tail' && z.tailMiss) { w.fx('burst', 'BATEU NA MARGEM!', z.x - z.face * 40, z.y - 40); toZonzo(w, z, TAIL.missDaze); return; }
        if (mv === 'emerge' && z.fury && !z.second) { z.second = true; z.vuln = false; startSub(w, z, DIVE.sub - DIVE.mark); placeMark(w, z); return; }
        z.second = false; z.firstVictim = null;
        toWalk(z, z.fury ? 0.6 : 1.0);
      }
      return;
    }
    // andando
    const dx = c.dx, d = dist2(V, z);
    if (z.turnT > 0) z.turnT -= dt;
    else z.face = (Math.sign(dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      if (blindSide(z, V) && z.blindWait !== V) { z.blindWait = V; z.cd = BLIND_DELAY; return; } // olho cego: reage mais devagar
      const behind = aliveF(w).some((f) => (f.x - z.x) * z.face < -10 && dist2(f, tailCenter(z)) < TAIL.r);
      const mv = chooseMove(z, d, behind);
      if (mv) {
        z.blindWait = null;
        if (mv === 'roar') { start(w, z, 'roar'); z.roared = true; w.fx('bubble', 'GRRRR...', z.x, z.y - z.K.top * 0.6); return; }
        if (mv === 'bite') {
          start(w, z, 'bite'); const m = mouthOf(z);
          w.warns.push({ kind: 'circle', x: z.x + z.face * BITE.at, y: m.y, r: BITE.warnR, owner: z });
          return;
        }
        if (mv === 'spin') {
          start(w, z, 'spin'); z.spin2 = false; const m = mouthOf(z);
          z.spinAt = { x: m.x, y: m.y };
          w.warns.push({ kind: 'circle', x: m.x, y: m.y, r: SPIN.r, owner: z });
          w.fx('bubble', 'GIRO DA MORTE!', z.x, z.y - z.K.top * 0.6);
          return;
        }
        if (mv === 'tail') {
          if (!behind) { z.face = (-(Math.sign(dx) || z.face)) as 1 | -1; z.turnT = 1.2; } // vira a cauda pro alvo
          start(w, z, 'tail'); z.tailMiss = false;
          const t = tailCenter(z); w.warns.push({ kind: 'circle', x: t.x, y: t.y, r: TAIL.r, owner: z });
          return;
        }
        if (mv === 'dive') {
          z.state = 'dive'; z.mv = 'dive'; z.lastMv = 'dive'; setAnim(z, 'dive'); mcd.dive = RJ_CD.dive[z.fury ? 1 : 0]; z.second = false; z.firstVictim = null;
          w.fx('bubble', 'MERGULHOU!', z.x, z.y - z.K.top * 0.6);
          return;
        }
      }
    }
    // fica a ~120 px do squad
    const want = c.adx > 130 ? 1 : c.adx < 70 ? -1 : 0;
    z.x += Math.sign(dx) * want * 14 * spd * dt;
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 10 * spd * dt));
    setAnim(z, 'walk');
    const pf = z.fi; c.step();
    if (z.fi !== pf && (A.walk?.stomp ?? []).includes(z.fi)) w.shake = Math.max(w.shake, 0.06);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS, D = z.K.dmg * mul(z) * (z.dmgMul ?? 1);
    if (z.anim === 'bite' && hitsOf(A.bite, 'hit', [5, 6]).includes(fi) && !z.hitDone) {
      z.hitDone = true; clearWarns(w, z);
      const hit = biteHits(w, z);
      w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'CHOMP!', z.x + z.face * 60, z.y - 40);
      if (hit.length) spawnFx(w, 'impactBig', hit[0].x, hit[0].y - 30, z.face);
    }
    if (z.anim === 'spin') {
      const AA = A.spin, sp = hitsOf(AA, 'spin', [5, 11]);
      if (fi === ev(AA, 'grab', 4)) {
        clearWarns(w, z);
        const at = z.spinAt ?? mouthOf(z);
        const f = aliveF(w).filter((g) => dist2(g, at) < SPIN.r).sort((a, b) => dist2(a, at) - dist2(b, at))[0];
        if (!f) { w.fx('tag', 'ERROU!', at.x, at.y - 40); z.fi = ev(AA, 'throw', 12); z.acc = 0; return; }
        z.held = f; z.firstVictim = f;
        hurtF(w, f, D * SPIN.dmg); stunF(w, f, 0.3, 'PRESO!'); holdTick(w, z);
        w.fx('burst', 'NHAC!', f.x, f.y - 70); w.log(`${z.K.nome} prendeu ${f.m?.nome ?? 'um lutador'} no giro da morte!`);
        w.shake = Math.max(w.shake, 0.3);
      }
      if (z.held && fi >= sp[0] && fi <= sp[1] && (fi - sp[0]) % 2 === 1) {
        const f = heldOf(z)!; hurtF(w, f, D * SPIN.pulse); w.fx('burst', 'GIRA!', f.x, f.y - 60); w.shake = Math.max(w.shake, 0.18);
        for (let i = 0; i < 6; i++) w.sparks.push({ x: z.x + (Math.random() - 0.5) * 60, y: z.y, vx: (Math.random() - 0.5) * 120, vy: -30 - Math.random() * 70, t: 0, c: '#8ad0e0' });
      }
      if (fi === ev(AA, 'throw', 12)) releaseHeld(w, z, SPIN.throwPx);
    }
    if (z.anim === 'tail' && hitsOf(A.tail, 'hit', [5, 6]).includes(fi) && !z.hitDone) {
      z.hitDone = true; clearWarns(w, z);
      const t = tailCenter(z);
      const hit = circleHit(w, t.x, t.y, TAIL.r, D * TAIL.dmg, { push: TAIL.push, fromX: z.x, stun: TAIL.stun, tag: 'ATORDOADO' });
      let wave: Fighter[] = [];
      if (z.fury) { wave = circleHit(w, t.x, t.y, TAIL.waveR, D * TAIL.wave, { rMin: TAIL.r, push: 16, fromX: z.x }); addActor(w, z, 'xOnda', t.x, t.y, 0.3, (q) => Math.min(2, Math.floor(q / 0.1)), -z.face); }
      z.tailMiss = hit.length + wave.length === 0;
      w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'TCHUM!', t.x, t.y - 40); spawnFx(w, 'dust', t.x, t.y, -z.face as 1 | -1);
    }
    if (z.anim === 'emerge') {
      if (fi === ev(A.emerge, 'surge', 3)) { w.shake = Math.max(w.shake, 0.4); w.fx('burst', 'SPLASH!', z.x, z.y - 60); if (z.mark) addActor(w, z, 'xAgua', z.x, z.y, 0.35, () => 2); }
      if (hitsOf(A.emerge, 'hit', [4, 5]).includes(fi) && !z.hitDone) {
        z.hitDone = true; clearWarns(w, z);
        circleHit(w, z.x, z.y, DIVE.r, D * DIVE.dmg, { push: 24, fromX: z.x });
        spawnFx(w, 'impactBig', z.x + z.face * 30, z.y - 20, z.face);
      }
    }
    if (z.anim === 'roar' && fi === ev(A.roar, 'call', 5)) {
      w.shake = 0.45; w.fx('burst', 'GRRROOOAAAR!', z.x, z.y - z.K.top * 0.7);
      for (const f of aliveF(w)) if (dist2(f, z) < ROAR.r) f.x = Math.max(w.cam + 12, Math.min(w.cam + w.W - 12, f.x + (Math.sign(f.x - z.x) || 1) * ROAR.push));
      if (w.zk?.piranha) {
        for (let j = 0; j < ROAR.n; j++) {
          const x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, z.x + (j ? 70 : -70))), y = clampY(z.y + (j ? 20 : -20));
          mkZ(w, 'piranha', x, y, (z.x > x ? 1 : -1) as 1 | -1, 'chase', 'walk');
          spawnFx(w, 'dust', x, y, 1);
        }
        w.log(`${z.K.nome} chamou as piranhas`);
      }
    }
  },
  spawn(w) {
    return { x: w.cam + w.W - 100, y: 176, face: -1, state: 'intro', anim: 'intro' };
  },
};
