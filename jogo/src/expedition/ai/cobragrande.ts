// Chefe A Cobra-Grande (Amazônia, várzea): sucuri gigante da lenda ribeirinha (Boiúna), monstro de rio.
// - BOTE: recua a cabeça em S (aviso, faixa no chão) e estica o pescoço deslizando pra frente; 1,2× e empurra.
//   Se erra, a cabeça atola na lama: VULNERÁVEL 1,2 s (dano ×1,5 pelo motor).
// - CONSTRIÇÃO: no lutador mais isolado; círculo no alvo 0,8 s. Quem continua no círculo fica PRESO 3 s com as espiras
//   em volta (atores extras com a arte xCoilB/xCoilF), 0,2× a cada 0,5 s (até 6). Os aliados SOLTAM batendo no corpo
//   (150 de "aperto"): solta antes = TONTA 1,5 s (×1,6 do motor). Aperto até o fim = atolada (VULNERÁVEL) 1,5 s.
// - CAUDA VARRENDO: a cauda sobe da água (aviso em círculo) e varre em volta: 1,0× + DERRUBADO, empurra 30.
// - MERGULHO + ATAQUE POR BAIXO: afunda (invulnerável, fora da tela 2 s), bolhas seguem o alvo 1,5 s, círculo onde
//   vai emergir 0,5 s; explode por baixo: 1,4× + arremesso. Depois VULNERÁVEL 1,6 s. Fúria: 2 mergulhos seguidos.
// - OLHAR DE LUA (só fúria): os olhos viram luas e marcam até 3 círculos nos lutadores; 0,6× + ATORDOADO 0,8 s.
// Fúria (<50%): golpes ×1,3 e recargas menores. Fraqueza: as janelas VULNERÁVEL (×1,5) e soltar o aliado preso.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { hurtF, stunF } from '../fighter';
import { GUARDS, type Guard } from '../combat';
import { hitCircle, hitLane } from './bossProps';

/** recargas [normal, fúria] em s */
export const CG_CD: Record<string, [number, number]> = { strike: [4, 3], coil: [9, 7], tail: [6, 4.5], dive: [12, 9], gaze: [10, 10] };
/** regras (unidades do mundo; a arte crua × 0,5) */
export const CG = {
  strikeLen: 190, strikeDy: 22, strikePush: 24, lunge: 40, strikeMissT: 1.2,
  coilRange: 150, coilR: 34, coilAt: 86, coilT: 3, coilTick: 0.5, coilTicks: 6, grip: 150, coilDazeT: 1.5, coilStuckT: 1.5,
  tailR: 130, tailPush: 30, tailStun: 1.0,
  diveFollow: 1.5, diveMark: 0.5, diveR: 40, diveSpeed: 150, diveStuckT: 1.6, diveStun: 1.2,
  gazeR: 30, gazeStun: 0.8, gazeN: 3,
  dmgStrike: 1.2, dmgCoil: 0.2, dmgTail: 1.0, dmgDive: 1.4, dmgGaze: 0.6, fury: 1.3,
  far: 110,
};

const cdOf = (z: Zombie, k: string) => CG_CD[k][z.fury ? 1 : 0];
const dmgOf = (z: Zombie, m: number) => z.K.dmg * (z.dmgMul || 1) * m * (z.fury ? CG.fury : 1);
const clampX = (w: World, x: number) => Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, x));
const near = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, (a.y - b.y) * 2);
const clearWarns = (w: World, z: Zombie) => { w.warns = w.warns.filter((t) => t.owner !== z); };

function toWalk(z: Zombie, cd: number): void { z.state = 'walk'; z.mv = null; z.vuln = false; z.invuln = false; z.cd = cd; setAnim(z, 'walk'); }
function toStuck(w: World, z: Zombie, t: number, why: string): void {
  z.state = 'stuck'; z.mv = null; z.stuckT = t; z.vuln = true; setAnim(z, 'stuck');
  w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top * 0.55 - 10); w.log(`${z.K.nome} ${why}: bata agora!`);
}

// ---------------- atores extras (arte da própria factory) ----------------
function propCv(z: Zombie, w: World, an: string, st: number): any {
  const F = z.K.F as any, A = F.ANIMS?.[an], T = (w.A as any)?.TWEEN;
  if (!A || !F.framePose || !T) return null;
  const i = Math.max(0, Math.min(A.n - 1, st));
  return F.framePose(z.form === 'furia' ? 'furia' : 'normal', an, T.poseAt(F, an, i, 0, false), an + i + '.0');
}
function addActor(w: World, a: ExtraActor): ExtraActor { (w.actors ??= []).push(a); return a; }
function dropActor(w: World, a: ExtraActor | null | undefined): void { if (a && w.actors) { const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); } }
function drawProp(c: CanvasRenderingContext2D, cv: any, x: number, y: number, flip: boolean, alpha = 1): void {
  if (!cv) return;
  c.save(); c.globalAlpha = alpha; c.translate(Math.round(x), Math.round(y)); if (flip) c.scale(-1, 1);
  c.drawImage(cv, -cv._ax / RS, -cv._gy / RS, cv.width / RS, cv.height / RS); c.restore();
}

// ---------------- constrição ----------------
function coilActors(w: World, z: Zombie, f: Fighter): void {
  const mk = (an: string, dy: number): ExtraActor => {
    const a: ExtraActor = {
      x: f.x, y: f.y + dy, w0: 0,
      draw: (c, cam) => { if (z.prey !== f) { dropActor(w, a); return; } drawProp(c, propCv(z, w, an, Math.floor(w.clock * 6) % 2), f.x - cam, f.y, z.face < 0); },
    };
    return addActor(w, a);
  };
  z.coilA = [mk('xCoilB', -0.5), mk('xCoilF', 0.5)];
}
export function releasePrey(w: World, z: Zombie): void {
  const f = z.prey as Fighter | null;
  if (f && f.state === 'stun') f.stunT = Math.min(f.stunT, 0.05);
  for (const a of (z.coilA ?? []) as ExtraActor[]) dropActor(w, a);
  z.coilA = []; z.prey = null; z.gripBreak = false;
}
function startCoil(c: ZCtx, tg: Fighter): void {
  const { z, w } = c;
  z.face = (Math.sign(tg.x - z.x) || z.face) as 1 | -1;
  z.state = 'attack'; z.mv = 'coil'; z.anim = ''; setAnim(z, 'coil'); z.mcd.coil = cdOf(z, 'coil');
  z.cx = tg.x; z.cy = tg.y; z.coilTg = tg;
  clearWarns(w, z);
  w.warns.push({ kind: 'circle', x: tg.x, y: tg.y, r: CG.coilR, owner: z } as any);
  w.fx('bubble', 'ARREMESSA AS ESPIRAS!', z.x, z.y - z.K.top * 0.55);
}
/** quadro throwAt: pega quem ainda estiver no círculo (o alvo primeiro). */
export function throwCoil(w: World, z: Zombie): Fighter | null {
  clearWarns(w, z);
  const c0 = { x: z.cx, y: z.cy }, fs = aliveF(w).filter((f) => near(f, c0) < CG.coilR + 4 && f.state !== 'kd' && f.state !== 'getup');
  const f = fs.includes(z.coilTg) ? z.coilTg as Fighter : fs[0];
  if (!f) { w.fx('tag', 'ERROU!', z.cx, z.cy - 50); return null; }
  z.prey = f; z.grip = CG.grip; z.gripBreak = false; z.coilT = CG.coilT; z.tickT = CG.coilTick; z.ticks = 0;
  z.x = clampX(w, f.x - z.face * CG.coilAt); z.y = f.y;
  stunF(w, f, 0.6, 'PRESO!');
  coilActors(w, z, f);
  w.shake = Math.max(w.shake, 0.25); w.fx('burst', 'ENROLOU!', f.x, f.y - 70);
  w.log(`${z.K.nome} enrolou ${f.m?.nome ?? 'um lutador'}! Batam no corpo dela pra soltar.`);
  return f;
}

// ---------------- mergulho ----------------
function startDive(c: ZCtx): void {
  const { z, w } = c;
  z.state = 'attack'; z.mv = 'dive'; z.anim = ''; setAnim(z, 'dive');
  if (!z.second) z.mcd.dive = cdOf(z, 'dive');
  clearWarns(w, z);
  w.fx('bubble', 'MERGULHOU!', z.x, z.y - z.K.top * 0.55);
}
function goUnder(c: ZCtx): void {
  const { z, w } = c;
  const fs = aliveF(w), tg = fs.length ? fs[Math.floor(Math.random() * fs.length)] : c.V;
  z.dvTg = tg; z.state = 'under'; z.invuln = true; z.vuln = false;
  z.ux = z.x; z.uy = z.y; z.underT = CG.diveFollow + CG.diveMark;
  z.x = w.cam - 200; // fora da tela: sem sombra, sem alvo
  const rip: ExtraActor = {
    x: z.ux, y: z.uy, w0: 0,
    draw: (cc, cam) => { if (z.state !== 'under' || z.dead) { dropActor(w, rip); return; } drawProp(cc, propCv(z, w, 'xRipple', Math.floor(w.clock * 9) % 3), z.ux - cam, z.uy, false); },
  };
  z.ripA = addActor(w, rip);
  w.fx('tag', 'BOLHAS SEGUEM O ALVO', z.ux, z.uy - 40);
}
function emergeAt(c: ZCtx): void {
  const { z, w } = c;
  dropActor(w, z.ripA); z.ripA = null;
  clearWarns(w, z);
  z.x = z.sx; z.y = z.sy; z.invuln = false;
  z.face = (Math.sign((c.V?.x ?? z.x) - z.x) || z.face) as 1 | -1;
  z.state = 'attack'; z.mv = 'surge'; z.anim = ''; setAnim(z, 'surge');
}

// ---------------- olhar de lua ----------------
function startGaze(c: ZCtx): void {
  const { z, w } = c;
  z.state = 'attack'; z.mv = 'gaze'; z.anim = ''; setAnim(z, 'gaze'); z.mcd.gaze = cdOf(z, 'gaze');
  clearWarns(w, z);
  const spots: { x: number; y: number; a: ExtraActor; t: number }[] = [];
  for (const f of aliveF(w).slice(0, CG.gazeN)) {
    const s: any = { x: f.x, y: f.y, t: 0 };
    s.a = addActor(w, { x: s.x, y: s.y - 1, w0: 0, draw: (cc, cam) => { const st = s.t > 0 ? 2 : Math.floor(w.clock * 6) % 2; drawProp(cc, propCv(z, w, 'xMoon', st), s.x - cam, s.y, false, s.t > 0 ? Math.max(0, 1 - s.t / 0.35) : 0.9); } });
    w.warns.push({ kind: 'circle', x: s.x, y: s.y, r: CG.gazeR, owner: z } as any);
    spots.push(s);
  }
  z.gz = spots;
  w.fx('bubble', 'OLHAR DE LUA!', z.x, z.y - z.K.top * 0.6);
}
function clearGaze(w: World, z: Zombie): void { for (const s of (z.gz ?? [])) dropActor(w, s.a); z.gz = []; }

/** Defesa: submersa = invulnerável; aliado batendo no corpo afrouxa a constrição. */
const cgGuard: Guard = (_w, z, dmg, _n, by) => {
  if (z.invuln) return null;
  if (z.prey && by && by !== z.prey) { z.grip = (z.grip ?? CG.grip) - dmg; if (z.grip <= 0) z.gripBreak = true; }
  return dmg;
};
(GUARDS as Record<string, Guard>).cobragrande = cgGuard;

/** lutador mais isolado (maior distância até o aliado mais próximo) dentro do alcance da constrição */
function isolated(w: World, z: Zombie): Fighter | null {
  const fs = aliveF(w).filter((f) => Math.abs(f.x - z.x) < CG.coilRange && f.state !== 'kd');
  if (!fs.length) return null;
  const iso = (f: Fighter) => Math.min(999, ...aliveF(w).filter((o) => o !== f).map((o) => near(o, f)));
  return fs.reduce((a, b) => (iso(b) > iso(a) ? b : a));
}

export const cobragrande: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS;
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = { dive: 5, coil: 3, gaze: 0 });
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    for (const s of (z.gz ?? [])) if (s.t > 0) s.t += dt;
    if (z.prey && !(z.state === 'attack' && z.mv === 'coil')) releasePrey(w, z); // fúria/dano interrompeu
    if (z.state !== 'under' && z.ripA) { dropActor(w, z.ripA); z.ripA = null; }

    if (z.state === 'enter') { z.state = 'intro'; setAnim(z, 'intro'); }
    if (z.state === 'intro' || z.state === 'rage') {
      z.vuln = false; z.invuln = false;
      if (z.state === 'rage') { clearWarns(w, z); clearGaze(w, z); }
      const pf = z.fi; c.step();
      if (z.fi !== pf) {
        if (z.anim === 'intro' && z.fi === 3) { w.shake = 0.45; spawnFx(w, 'impactBig', z.x, z.y - 10, -1); w.fx('burst', 'SPLAASH!', z.x, z.y - 90); }
        if (z.anim === 'intro' && z.fi === 12) { w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'SSSSHH!', z.x + z.face * 30, z.y - z.K.top * 0.8); }
        if (z.anim === 'rage' && z.fi === 3) { w.shake = 0.5; w.fx('burst', 'SSSRRAAH!', z.x, z.y - z.K.top * 0.9); }
      }
      if (z.done) toWalk(z, z.state === 'rage' ? 0.5 : 0.8);
      return;
    }
    if (z.state === 'stuck') {
      z.vuln = true; z.stuckT -= dt; c.step(); if (z.done) { z.fi = 0; z.done = false; z.acc = 0; }
      if (z.stuckT <= 0) { toWalk(z, z.fury ? 0.4 : 0.7); w.fx('tag', 'SOLTOU A CABEÇA', z.x, z.y - z.K.top * 0.5); }
      return;
    }
    if (z.state === 'dazed') { z.dazeT -= dt; c.step(); if (z.done) { z.fi = 0; z.done = false; z.acc = 0; } if (z.dazeT <= 0) toWalk(z, 0.5); return; }
    if (z.state === 'under') {
      z.underT -= dt;
      const tg = z.dvTg as Fighter | null, goal = tg && !tg.down ? tg : V;
      if (z.underT > CG.diveMark) { // bolhas seguem o alvo
        const dx = goal.x - z.ux, dy = goal.y - z.uy, d = Math.hypot(dx, dy) || 1, st = Math.min(d, CG.diveSpeed * (z.fury ? 1.25 : 1) * dt);
        z.ux += dx / d * st; z.uy = clampY(z.uy + dy / d * st);
        if (z.ripA) { z.ripA.x = z.ux; z.ripA.y = z.uy; }
      } else if (z.sx == null || z.marked !== true) { // marca onde vai emergir
        z.marked = true; z.sx = clampX(w, goal.x); z.sy = clampY(goal.y); z.ux = z.sx; z.uy = z.sy;
        w.warns.push({ kind: 'circle', x: z.sx, y: z.sy, r: CG.diveR, owner: z } as any);
        w.fx('bubble', 'VAI SAIR!', z.sx, z.sy - 40);
      }
      if (z.underT <= 0) { z.marked = false; emergeAt(c); }
      return;
    }
    if (z.state === 'attack') {
      if (z.mv === 'coil' && z.prey) { // apertando
        const f = z.prey as Fighter;
        if (z.gripBreak || f.down) {
          const broke = z.gripBreak; releasePrey(w, z); clearWarns(w, z);
          if (broke) { z.state = 'dazed'; z.dazeT = CG.coilDazeT; z.mv = null; setAnim(z, 'dazed'); w.fx('burst', 'SOLTOU!', z.x, z.y - z.K.top * 0.6); w.log(`Os aliados soltaram o lutador da ${z.K.nome}!`); }
          else toWalk(z, 0.8);
          return;
        }
        if (f.state !== 'stun') stunF(w, f, 0.3, 'PRESO!'); else f.stunT = Math.max(f.stunT, 0.25);
        f.x = z.x + z.face * CG.coilAt; f.y = z.y;
        z.coilT -= dt; z.tickT -= dt;
        if (z.tickT <= 0 && z.ticks < CG.coilTicks) { z.tickT += CG.coilTick; z.ticks++; hurtF(w, f, dmgOf(z, CG.dmgCoil)); w.fx('burst', z.ticks % 2 ? 'CRAC!' : 'APERTA!', f.x, f.y - 60); w.shake = Math.max(w.shake, 0.1); if (f.state !== 'stun' && !f.down) stunF(w, f, 0.3, 'PRESO!'); }
        const sq: number[] = A.coil.squeeze ?? [6, 11];
        c.step(true);
        if (z.coilT > 0 && (z.fi > sq[1] || z.done)) { z.fi = sq[0]; z.acc = 0; z.done = false; }
        if (z.coilT <= 0) { releasePrey(w, z); toStuck(w, z, CG.coilStuckT, 'soltou a presa cansada'); }
        return;
      }
      if (z.mv === 'strike') {
        const J: number[] = A.strike.lunge ?? [5, 6, 7], k = J.indexOf(z.fi);
        if (k >= 0) { const T = J.reduce((s, j) => s + (A.strike.dur ? A.strike.dur(j) : 100), 0) / 1000; z.x = clampX(w, z.x + z.face * CG.lunge / T * dt); }
      }
      c.step(true);
      if (z.done) {
        clearWarns(w, z);
        if (z.mv === 'strike' && !z.hitV) { toStuck(w, z, CG.strikeMissT, 'errou o bote e atolou a cabeça'); return; }
        if (z.mv === 'dive') { goUnder(c); return; }
        if (z.mv === 'surge') {
          if (z.fury && !z.second) { z.second = true; startDive(c); return; }
          z.second = false; toStuck(w, z, CG.diveStuckT, 'emergiu exposta'); return;
        }
        if (z.mv === 'gaze') clearGaze(w, z);
        toWalk(z, z.fury ? 0.6 : 1);
      } else if (z.mv === 'dive' && z.fi >= (A.dive.goneAt ?? 8)) z.invuln = true;
      return;
    }

    // ---------------- decisão ----------------
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if (z.fury && !mcd.gaze && aliveF(w).length && (c.adx > 70 || Math.random() < 0.3)) { startGaze(c); return; }
      if (c.adx > CG.far && !mcd.dive) { startDive(c); return; }
      const iso = !mcd.coil ? isolated(w, z) : null;
      if (iso && Math.random() < 0.5) { startCoil(c, iso); return; }
      if (c.adx < CG.tailR * 0.7 && !mcd.tail && (Math.random() < 0.4 || aliveF(w).filter((f) => near(f, z) < CG.tailR).length >= 2)) {
        z.state = 'attack'; z.mv = 'tail'; z.anim = ''; setAnim(z, 'tail'); z.mcd.tail = cdOf(z, 'tail');
        w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: CG.tailR, owner: z } as any);
        w.fx('bubble', 'A CAUDA SOBE!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx < CG.strikeLen && ady < CG.strikeDy && !mcd.strike) {
        z.state = 'attack'; z.mv = 'strike'; z.anim = ''; setAnim(z, 'strike'); z.mcd.strike = cdOf(z, 'strike'); z.hitV = false;
        w.warns.push({ kind: 'lane', x0: z.x, x1: clampX(w, z.x + z.face * CG.strikeLen), y: z.y, owner: z } as any);
        w.fx('bubble', 'SSSS...', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (iso) { startCoil(c, iso); return; }
    }
    // desliza até ~90 do alvo, alinhando a faixa
    const want = c.adx > 100 ? 1 : c.adx < 60 ? -1 : 0, spd = z.fury ? 1.25 : 1;
    z.x = clampX(w, z.x + Math.sign(c.dx) * want * 24 * spd * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 16 * spd * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS;
    if (z.anim === 'strike' && fi === A.strike.hit) {
      const hit = hitLane(w, z.x, z.x + z.face * (A.strike.reach ?? 148), z.y, CG.strikeDy, dmgOf(z, CG.dmgStrike), 0, '', CG.strikePush, z.face);
      if (hit.length) { z.hitV = true; w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'NHAC!', hit[0].x, hit[0].y - 60); }
    }
    if (z.anim === 'coil' && fi === (A.coil.throwAt ?? 4) && !z.prey) {
      if (!throwCoil(w, z)) { z.fi = A.coil.n - 2; z.acc = 0; } // errou: recolhe
    }
    if (z.anim === 'tail' && fi === A.tail.hit) {
      clearWarns(w, z);
      w.shake = Math.max(w.shake, 0.35); w.fx('burst', 'VUUSH!', z.x + z.face * 60, z.y - 40);
      const hit = hitCircle(w, z.x, z.y, CG.tailR, dmgOf(z, CG.dmgTail), CG.tailStun, 'DERRUBADO', CG.tailPush);
      for (const f of hit) spawnFx(w, 'dust', f.x, f.y, z.face);
    }
    if (z.anim === 'surge' && fi === A.surge.hit) {
      w.shake = 0.5; w.fx('burst', 'SPLAASH!', z.x, z.y - z.K.top * 0.7); spawnFx(w, 'impactBig', z.x, z.y - 10, z.face);
      const hit = hitCircle(w, z.x, z.y, CG.diveR, dmgOf(z, CG.dmgDive), CG.diveStun, 'ARREMESSADO', 26);
      for (const f of hit) f.z = 0;
    }
    if (z.anim === 'gaze' && fi === A.gaze.hit) {
      clearWarns(w, z);
      w.shake = Math.max(w.shake, 0.3);
      for (const s of (z.gz ?? [])) { s.t = 0.001; hitCircle(w, s.x, s.y, CG.gazeR, dmgOf(z, CG.dmgGaze), CG.gazeStun, 'ATORDOADO'); w.fx('burst', 'LUA!', s.x, s.y - 50); }
    }
  },
  spawn(w) {
    return { x: w.cam + w.W - 130, y: 178, face: -1, state: 'intro', anim: 'intro' };
  },
};
