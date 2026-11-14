// Mini boss O Tamanduá-Bandeira (Pantanal, 2ª arena da cordilheira; BOSS-33 a BOSS-35, IA-42).
// - Abraço com garras (BOSS-34): só com o alvo a ≤ 110 px. Levanta-se nas patas traseiras (anim `stand`, ~700 ms) com
//   círculo r 60 no chão: quem continuar no círculo no quadro `grab` fica PRESO 1,6 s e leva 3 pulsos de 0,5× (grab +
//   2 ticks). Outro lutador quebra o abraço com golpe forte (n = 3) ou acumulando 4% da vida do boss durante o aperto:
//   aí ele SOLTA e fica TONTO 1,5 s (dano ×1,6). Depois do abraço fica ABERTO de pé 1,2 s (dano ×1,5, z.vuln).
//   Fúria: abraço duplo (o 2º 0,6 s depois, na nova posição do alvo; o ABERTO vem só depois do 2º).
// - Garra em arco (BOSS-35): aviso de 450 ms (círculo à frente), arco de 100 px / 140°, 1,1×, derruba. Recarga 4 / 3 s.
// - Língua: faixa fina + 400 ms; 60–200 px; 0,6×, puxa o lutador até 30 px do boss (PRESO 0,5 s). Fúria: leque de 3 faixas.
//   Recarga 8 / 6 s. Mira o lutador MAIS DISTANTE dentro do alcance.
// - Cauda (só fúria): círculo r 70 atrás, 500 ms; 0,8×, ATORDOADO 0,4 s. Recarga 7 s.
// - Tática (IA-42): circula a ~90 px, alterna garra, língua e abraço; depois de golpe pesado fica 1 s lento (sem atacar).
//   Fúria: 1,3× mais rápido (anda e anima os golpes), recargas menores.
import type { ZombieAI, ZCtx } from './index';
import { RS, SK, aliveF, clampY, setAnim, spawnFx, stepAnim, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';

/** recargas [normal, fúria] em s */
export const TAM_CD: Record<string, [number, number]> = { hug: [9, 6.5], claw: [4, 3], tongue: [8, 6], slam: [7, 7] };
export const TAM = {
  hugR: 60, standMax: 110, holdT: 1.6, pulse: 0.5, openT: 1.2, hug2Delay: 0.6, breakFrac: 0.04, dazeT: 1.5,
  clawR: 100, clawHalf: 70, clawMul: 1.1, clawDown: 0.9,
  tongueMin: 60, tongueMax: 200, tongueTol: 9, tongueMul: 0.6, pullTo: 30, pullStun: 0.5, fanDy: 22,
  slamR: 70, slamBack: 44, slamMul: 0.8, slamStun: 0.4,
  orbit: 90, slowT: 1, furySpd: 1.3,
};

const clampX = (w: World, x: number) => Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, x));
const dist2 = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, (ay - by) * 2);
const spdOf = (z: Zombie) => (z.fury ? TAM.furySpd : 1);

/* ---------------- adereços: língua (fita + ponta xLingua) e poeira (xPoeira) ---------------- */
function propCv(z: Zombie, anim: string, st: number): any {
  const F = z.K.F as any;
  if (!F?.ANIMS?.[anim]) return null;
  return F.framePose ? F.framePose(z.form, anim, { st }, anim + st + '.0') : F.frame?.(z.form, anim, st, 5);
}
function removeActor(w: World, a: ExtraActor): void { if (w.actors) { const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); } }

/** ponta do focinho (mundo) no quadro atual; sem arte, um valor médio */
export function mouthOf(z: Zombie): { x: number; y: number } {
  const F = z.K.F as any;
  try {
    const cv = F?.frame?.(z.form, z.anim, z.fi, 5);
    if (cv?._mouth) { const K = PIXK(); return { x: z.x + z.face * (cv._mouth.x / RS - (z.K.ax * K) / RS), y: z.y - (z.K.G * K - cv._mouth.y) / RS }; }
  } catch { /* sem arte (testes) */ }
  return { x: z.x + z.face * 70, y: z.y - 36 };
}
function PIXK(): number { const g = globalThis as any; return g.ART_EXP?.PIX?.getK?.() ?? SK; }

interface Tongue { tips: { x: number; y: number; f: Fighter | null }[]; t: number; actor: ExtraActor; done: boolean }
function startTongue(w: World, z: Zombie, targets: { x: number; y: number }[]): void {
  const T: Tongue = { tips: targets.map((p) => ({ x: p.x, y: p.y, f: null })), t: 0, done: false, actor: null as unknown as ExtraActor };
  T.actor = {
    x: z.x, y: z.y, w0: 4,
    draw: (c, cam) => {
      if (T.done || z.dead || z.anim !== 'tongue' || z.fi < 4) { if (T.done || z.dead || z.anim !== 'tongue') { killTongue(w, z); } return; }
      const m = mouthOf(z), fury = z.form === 'furia' || z.form === 'plenilunar';
      for (const tp of T.tips) {
        // estende no quadro 4, depois volta trazendo o lutador
        const ext = z.fi === 4 ? 1 : Math.max(0.15, 1 - (z.fi - 4) / 5);
        const tx = tp.f ? tp.f.x - z.face * 6 : m.x + (tp.x - m.x) * ext, ty = tp.f ? tp.f.y - 34 : m.y + (tp.y - 30 - m.y) * ext;
        const n = Math.max(6, Math.round(Math.abs(tx - m.x) / 2));
        for (let pass = 0; pass < 3; pass++) {
          c.fillStyle = pass === 0 ? '#170b1c' : pass === 1 ? (fury ? '#2a9cd4' : '#86244a') : (fury ? '#9af2ff' : '#d4507c');
          const s = pass === 0 ? 3 : pass === 1 ? 2 : 1;
          for (let i = 0; i <= n; i++) { const u = i / n, x = m.x + (tx - m.x) * u, y = m.y + (ty - m.y) * u + Math.sin(u * Math.PI) * 3 + Math.sin(u * 14 + w.clock * 20) * 0.6; c.fillRect(Math.round(x - cam - s / 2), Math.round(y - s / 2 - (pass === 2 ? 0.5 : 0)), s, s); }
        }
        const cv = propCv(z, 'xLingua', Math.floor(w.clock * 12) % 4);
        if (cv) { c.save(); c.translate(Math.round(tx - cam), Math.round(ty)); if (z.face < 0) c.scale(-1, 1); c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS - 2, cv.width / RS, cv.height / RS); c.restore(); }
      }
    },
  };
  (w.actors ??= []).push(T.actor);
  z._tongue = T;
}
function killTongue(w: World, z: Zombie): void { const T = z._tongue as Tongue | undefined; if (!T) return; T.done = true; removeActor(w, T.actor); z._tongue = null; }

function puff(w: World, z: Zombie, x: number, y: number): void {
  const t0 = w.clock ?? 0;
  const a: ExtraActor = {
    x, y, w0: 0,
    draw: (c, cam) => {
      const t = (w.clock ?? 0) - t0; if (t > 0.33) { removeActor(w, a); return; }
      const cv = propCv(z, 'xPoeira', Math.min(2, Math.floor(t / 0.11))); if (!cv) return;
      c.drawImage(cv, Math.round(x - cam - (cv._ax ?? 0) / RS), Math.round(y - (cv._gy ?? 0) / RS), cv.width / RS, cv.height / RS);
    },
  };
  (w.actors ??= []).push(a);
}

/* ---------------- abraço ---------------- */
function holdOf(z: Zombie): Fighter[] { return (z.held as Fighter[] | undefined) ?? []; }
/** Solta quem estiver preso (fim do abraço, quebra, fúria, morte). */
export function releaseHug(z: Zombie): void {
  for (const f of holdOf(z)) { if (f.state === 'stun') f.stunT = Math.min(f.stunT, 0.12); f._tamHeld = null; }
  z.held = [];
}
/** Quadro `grab`: quem ainda estiver no círculo fica preso. Exportado pros testes. */
export function grabHug(w: World, z: Zombie): Fighter[] {
  w.warns = w.warns.filter((t) => t.owner !== z);
  const cx = z.hugX ?? z.x + z.face * 36, cy = z.hugY ?? z.y, got: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (f.state === 'kd' || f.state === 'getup') continue;
    if (dist2(f.x, f.y, cx, cy) > TAM.hugR) continue;
    got.push(f);
  }
  z.held = got; z.hugDmg = 0;
  w.shake = Math.max(w.shake, 0.18);
  spawnFx(w, 'dust', cx, cy, z.face); puff(w, z, cx, cy);
  if (got.length) {
    for (const f of got) { stunF(w, f, TAM.holdT, 'PRESO!'); f._tamHeld = z; hurtF(w, f, z.K.dmg * TAM.pulse * z.dmgMul, { heavy: true }); }
    w.fx('burst', 'ABRAÇO!', cx, cy - 70);
    w.log(`${z.K.nome} prendeu ${got.map((f) => f.m?.nome ?? 'o lutador').join(' e ')} no abraço!`);
  } else w.fx('tag', 'ERROU!', cx, cy - 60);
  return got;
}
/** mantém os presos colados no peito do boss */
function tickHold(w: World, z: Zombie, dt: number): void {
  const list = holdOf(z).filter((f) => !f.down && f.state !== 'kd');
  z.held = list;
  list.forEach((f, i) => {
    const gx = z.x + z.face * (30 + i * 6), gy = z.y + (i ? 6 : 0);
    f.x += (gx - f.x) * Math.min(1, dt * 14); f.y = clampY(f.y + (gy - f.y) * Math.min(1, dt * 14));
    if (f.state === 'stun') f.stunT = Math.max(f.stunT, 0.2);
    else if (!f.down) stunF(w, f, 0.2, 'PRESO!');
  });
}
function pulseHug(w: World, z: Zombie): void {
  for (const f of holdOf(z)) hurtF(w, f, z.K.dmg * TAM.pulse * z.dmgMul * (z.fury ? 1 : 1), { heavy: true });
  if (holdOf(z).length) { w.shake = Math.max(w.shake, 0.1); w.fx('burst', 'CRAC!', z.x + z.face * 30, z.y - 80); }
}
/** Golpe de quem está de fora durante o aperto: forte (n = 3) ou 4% acumulado quebra o abraço → TONTO. */
export function tamanduaGuard(w: World, z: Zombie, dmg: number, n: number, by?: Fighter | null): number | null {
  if (z.state === 'attack' && z.mv === 'hug' && holdOf(z).length && !(by && holdOf(z).includes(by))) {
    z.hugDmg = (z.hugDmg ?? 0) + dmg;
    if (n === 3 || z.hugDmg >= z.maxhp * TAM.breakFrac) {
      releaseHug(z); w.warns = w.warns.filter((t) => t.owner !== z);
      z.state = 'dazed'; z.dazeT = TAM.dazeT; z.mv = ''; setAnim(z, 'dazed');
      w.fx('tag', 'SOLTOU!', z.x, z.y - z.K.top * 0.6); w.log(`${z.K.nome} soltou o abraço e ficou tonto: bata agora!`);
    }
  }
  return dmg;
}
(GUARDS as Record<string, unknown>).tamandua = tamanduaGuard;

/* ---------------- golpes ---------------- */
function start(w: World, z: Zombie, mv: string, anim = mv): void {
  z.state = 'attack'; z.mv = mv; z.hitSet = new Set(); setAnim(z, anim);
  if (TAM_CD[mv]) z.mcd[mv] = TAM_CD[mv][z.fury ? 1 : 0];
  z.lastMv = mv;
}
function knockDown(w: World, z: Zombie, f: Fighter): void {
  if (f.down || f.state === 'kd' || f.state === 'getup') return;
  if (f.art && fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-z.face) as 1 | -1; }
  else stunF(w, f, TAM.clawDown, 'DERRUBADO');
}
/** garra em arco: alcance 100, 140° à frente. Exportado pros testes. */
export function clawHit(w: World, z: Zombie): Fighter[] {
  const out: Fighter[] = [], set: Set<Fighter> = z.hitSet ?? (z.hitSet = new Set());
  for (const f of aliveF(w)) {
    if (set.has(f)) continue;
    const dx = (f.x - z.x) * z.face, dy = (f.y - z.y) * 2, d = Math.hypot(dx, dy);
    if (d > TAM.clawR || dx < -8) continue;
    if (d > 16 && Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI > TAM.clawHalf) continue;
    set.add(f); hurtF(w, f, z.K.dmg * TAM.clawMul * z.dmgMul, { heavy: true }); knockDown(w, z, f); out.push(f);
  }
  if (out.length) { w.fx('burst', 'RASGA!', out[0].x, out[0].y - 60); w.hitstop = Math.max(w.hitstop ?? 0, 0.06); w.shake = Math.max(w.shake, 0.16); }
  return out;
}
/** faixas da língua (1 normal, 3 em leque na fúria) */
function tongueLanes(z: Zombie, ty: number): number[] { return z.fury ? [ty - TAM.fanDy, ty, ty + TAM.fanDy].map(clampY) : [ty]; }
/** língua: acerta quem está em alguma faixa, prende e começa a puxar. Exportado pros testes. */
export function tongueHit(w: World, z: Zombie): Fighter[] {
  w.warns = w.warns.filter((t) => t.owner !== z);
  const out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const dx = (f.x - z.x) * z.face;
    if (dx < 20 || dx > TAM.tongueMax + 6) continue;
    if (!(z.lanes as number[]).some((y) => Math.abs(f.y - y) < TAM.tongueTol)) continue;
    hurtF(w, f, z.K.dmg * TAM.tongueMul * z.dmgMul); stunF(w, f, TAM.pullStun, 'PUXADO!'); out.push(f);
  }
  z.pulled = out;
  const T = z._tongue as Tongue | undefined;
  if (T) out.forEach((f, i) => { if (T.tips[i]) T.tips[i].f = f; else T.tips.push({ x: f.x, y: f.y, f }); });
  if (out.length) { w.fx('burst', 'SLURP!', out[0].x, out[0].y - 60); w.log(`${z.K.nome} puxou ${out[0].m?.nome ?? 'o lutador'} com a língua`); }
  else w.fx('tag', 'ERROU!', z.x + z.face * 120, z.y - 50);
  return out;
}
/** puxa até 30 px do boss (quadros `pull`). Exportado pros testes. */
export function tickTonguePull(w: World, z: Zombie, dt: number): void {
  for (const f of (z.pulled as Fighter[] | undefined) ?? []) {
    if (f.down || f.state === 'kd') continue;
    const tx = z.x + z.face * TAM.pullTo, d = tx - f.x;
    f.x += Math.sign(d) * Math.min(Math.abs(d), 360 * dt);
    f.y = clampY(f.y + Math.sign(z.y - f.y) * Math.min(Math.abs(z.y - f.y), 120 * dt));
    if (f.state === 'stun') f.stunT = Math.max(f.stunT, 0.15);
  }
}
/** cauda (fúria): círculo atrás. Exportado pros testes. */
export function slamHit(w: World, z: Zombie): Fighter[] {
  w.warns = w.warns.filter((t) => t.owner !== z);
  const cx = z.slX ?? z.x - z.face * TAM.slamBack, cy = z.y, out: Fighter[] = [];
  for (const f of aliveF(w)) if (dist2(f.x, f.y, cx, cy) < TAM.slamR) { hurtF(w, f, z.K.dmg * TAM.slamMul * z.dmgMul, { heavy: true }); stunF(w, f, TAM.slamStun, 'ATORDOADO'); out.push(f); }
  w.shake = Math.max(w.shake, 0.24); w.fx('burst', 'TUM!', cx, cy - 50);
  spawnFx(w, 'rockBreak', cx, cy - 4); puff(w, z, cx, cy);
  return out;
}

function farthestIn(w: World, z: Zombie): Fighter | null {
  let best: Fighter | null = null, bd = -1;
  for (const f of aliveF(w)) { const dx = (f.x - z.x) * Math.sign(f.x - z.x || 1), ady = Math.abs(f.y - z.y); if (dx < TAM.tongueMin || dx > TAM.tongueMax || ady > (z.fury ? 40 : 14)) continue; if (dx > bd) { bd = dx; best = f; } }
  return best;
}
function nearest(w: World, z: Zombie): Fighter | null {
  let best: Fighter | null = null, bd = 1e9;
  for (const f of aliveF(w)) { const d = dist2(f.x, f.y, z.x, z.y); if (d < bd) { bd = d; best = f; } }
  return best;
}
function beginHug(w: World, z: Zombie, T: Fighter): void {
  z.face = (Math.sign(T.x - z.x) || z.face) as 1 | -1;
  start(w, z, 'hug', 'stand');
  const off = Math.max(20, Math.min(70, (T.x - z.x) * z.face));
  z.hugX = clampX(w, z.x + z.face * off); z.hugY = clampY(T.y);
  w.warns.push({ kind: 'circle', x: z.hugX, y: z.hugY, r: TAM.hugR, owner: z });
  w.fx('bubble', 'RRAAUH!', z.x, z.y - z.K.top * 0.75);
}

function toWalk(z: Zombie, cd: number): void { z.state = 'walk'; z.mv = ''; z.cd = cd; setAnim(z, 'walk'); }

export const tamandua: ZombieAI = {
  rest: 'walk',
  update(c: ZCtx) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS, m = spdOf(z);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if ((z.slowT ?? 0) > 0) z.slowT = Math.max(0, z.slowT - dt);
    // passo da animação (golpes 1,3× mais rápidos na fúria)
    const step = (wf?: boolean, k = 1) => stepAnim(z, A[z.anim], dt * k, wf ? (_e, fi) => tamandua.onFrame!(c, fi) : undefined);
    // preso sem estar abraçando (fúria/tonto/morte no meio): solta
    if (holdOf(z).length && !(z.state === 'attack' && z.mv === 'hug')) releaseHug(z);
    if (z._tongue && z.anim !== 'tongue') killTongue(w, z);
    if (z.state !== 'open' && z.vuln) z.vuln = false;

    if (z.state === 'enter') { setAnim(z, 'walk'); step(); z.x -= 34 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 100) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro') { step(); if (z.done) toWalk(z, 0.8); return; }
    if (z.state === 'rage') { step(); if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); toWalk(z, 0.4); } return; }
    if (z.state === 'dazed') {
      z.dazeT -= dt; step();
      if (z.done) { z.fi = 0; z.done = false; z.acc = 0; }
      if (z.dazeT <= 0) { toWalk(z, 0.4); z.slowT = TAM.slowT; }
      return;
    }
    if (z.state === 'open') { // ABERTO de pé depois do abraço: dano ×1,5
      z.vuln = true; z.openT -= dt; step();
      if (z.done) { z.fi = 0; z.done = false; z.acc = 0; }
      if (z.openT <= 0) { z.vuln = false; toWalk(z, 0.3); z.slowT = TAM.slowT; }
      return;
    }
    if (z.state === 'attack') {
      if (z.mv === 'hug') {
        if (z.hugWait) { // fúria: 2º abraço, 0,6 s depois, na nova posição do alvo (de pé, último quadro do `stand`)
          z.hugT -= dt; const gx = z.hugX - z.face * 34; z.x = clampX(w, z.x + Math.sign(gx - z.x) * Math.min(Math.abs(gx - z.x), 120 * dt));
          if (z.hugT <= 0) { z.hugWait = false; setAnim(z, 'hug'); }
          return;
        }
        if (z.anim === 'stand') { step(false, 1); if (z.done) { setAnim(z, 'hug'); } return; }
        // descida (quadros 0–5) avança sobre o círculo
        if (z.fi <= 5) { const gx = (z.hugX ?? z.x) - z.face * 30; z.x = clampX(w, z.x + Math.sign(gx - z.x) * Math.min(Math.abs(gx - z.x), 140 * dt)); }
        else tickHold(w, z, dt);
        step(true, 1);
        if (z.done) {
          releaseHug(z); w.warns = w.warns.filter((t) => t.owner !== z);
          if (z.fury && !z.hug2) { // 2º abraço
            const T = nearest(w, z);
            if (T) {
              z.hug2 = true; z.face = (Math.sign(T.x - z.x) || z.face) as 1 | -1;
              z.hugX = clampX(w, T.x); z.hugY = clampY(T.y); z.hugT = TAM.hug2Delay;
              w.warns.push({ kind: 'circle', x: z.hugX, y: z.hugY, r: TAM.hugR, owner: z });
              w.fx('bubble', 'DE NOVO!', z.x, z.y - z.K.top * 0.75);
              z.hugWait = true; z.anim = 'stand'; z.fi = (A.stand?.n ?? 8) - 1; z.acc = 0; z.done = false;
              return;
            }
          }
          z.hug2 = false;
          z.state = 'open'; z.openT = TAM.openT; z.vuln = true; setAnim(z, A.open ? 'open' : 'dazed');
          w.fx('tag', 'ABERTO!', z.x, z.y - z.K.top * 0.7); w.log(`${z.K.nome} ficou aberto de pé: bata na barriga!`);
        }
        return;
      }
      if (z.mv === 'tongue') { const pr: number[] = A.tongue?.pull ?? [5, 8]; if (z.fi >= pr[0] && z.fi <= pr[pr.length - 1]) tickTonguePull(w, z, dt); }
      step(true, m);
      if (z.done) {
        w.warns = w.warns.filter((t) => t.owner !== z);
        const heavy = z.mv === 'claw' || z.mv === 'slam';
        killTongue(w, z); z.pulled = [];
        toWalk(z, z.fury ? 0.5 : 0.9);
        if (heavy) z.slowT = TAM.slowT;
      }
      return;
    }

    // ---------- decisão ----------
    const slow = (z.slowT ?? 0) > 0;
    // cauda: confere quem está nas costas ANTES de virar pro alvo
    const behind0 = z.cd <= 0 && !slow && z.fury && !mcd.slam && aliveF(w).some((f) => (f.x - z.x) * z.face < -10 && dist2(f.x, f.y, z.x - z.face * TAM.slamBack, z.y) < TAM.slamR);
    if (!behind0) z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0 && !slow) {
      const opts: string[] = [];
      const behind = behind0 || z.fury && !mcd.slam && aliveF(w).some((f) => (f.x - z.x) * z.face < -10 && dist2(f.x, f.y, z.x - z.face * TAM.slamBack, z.y) < TAM.slamR);
      if (behind) opts.push('slam');
      const N = nearest(w, z);
      if (N && !mcd.hug && Math.abs(N.x - z.x) <= TAM.standMax && Math.abs(N.y - z.y) < 30) opts.push('hug');
      if (!mcd.claw && c.adx < TAM.clawR * 0.9 && Math.abs(c.dy) < 26) opts.push('claw');
      const far = !mcd.tongue ? farthestIn(w, z) : null;
      if (far) opts.push('tongue');
      // alterna: evita repetir o último golpe quando há outra opção
      const pick = opts.find((o) => o === 'slam') ?? opts.find((o) => o !== z.lastMv) ?? opts[0];
      if (pick === 'slam') {
        start(w, z, 'slam'); z.slX = clampX(w, z.x - z.face * TAM.slamBack);
        w.warns.push({ kind: 'circle', x: z.slX, y: z.y, r: TAM.slamR, owner: z }); w.fx('bubble', 'BANDEIRA!', z.x, z.y - z.K.top * 0.6); return;
      }
      if (pick === 'hug' && N) { beginHug(w, z, N); return; }
      if (pick === 'claw') {
        start(w, z, 'claw');
        w.warns.push({ kind: 'circle', x: clampX(w, z.x + z.face * TAM.clawR * 0.5), y: z.y, r: TAM.clawR * 0.55, owner: z });
        w.fx('bubble', 'GRRR!', z.x, z.y - z.K.top * 0.6); return;
      }
      if (pick === 'tongue' && far) {
        z.face = (Math.sign(far.x - z.x) || z.face) as 1 | -1;
        start(w, z, 'tongue'); z.lanes = tongueLanes(z, far.y); z.pulled = [];
        const x0 = z.x + z.face * 30, x1 = clampX(w, z.x + z.face * TAM.tongueMax);
        for (const y of z.lanes as number[]) w.warns.push({ kind: 'lane', x0: Math.min(x0, x1), x1: Math.max(x0, x1), y, owner: z, c: z.fury ? '#6ae8ff' : '#d4507c' });
        startTongue(w, z, (z.lanes as number[]).map((y) => ({ x: x1, y })));
        w.fx('bubble', 'SSSLP!', z.x, z.y - z.K.top * 0.6); return;
      }
    }
    // circula a ~90 px do alvo, deslizando pela faixa dele (lento depois de golpe pesado)
    const sp = (slow ? 0.5 : 1) * m;
    const want = c.adx > TAM.orbit + 12 ? 1 : c.adx < TAM.orbit - 14 ? -1 : 0;
    z.x = clampX(w, z.x + Math.sign(c.dx) * want * 30 * sp * dt);
    z.orb = (z.orb ?? 0) + dt * 0.8;
    z.y = clampY(z.y + (Math.sign(c.dy) * Math.min(Math.abs(c.dy), 16 * sp * dt)) + Math.cos(z.orb) * 6 * dt);
    setAnim(z, 'walk');
    step(true, sp);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS;
    if (z.anim === 'walk') { if ((A.walk?.stomp ?? []).includes(fi)) w.shake = Math.max(w.shake, 0.03); return; }
    if (z.anim === 'hug') {
      if (fi === (A.hug?.grab ?? 6)) grabHug(w, z);
      if ((A.hug?.tick ?? [8, 10]).includes(fi)) pulseHug(w, z);
      return;
    }
    if (z.anim === 'claw') { const h = A.claw?.hit ?? [4, 5]; if ((Array.isArray(h) ? h : [h]).includes(fi)) { if (fi === (Array.isArray(h) ? h[0] : h)) w.warns = w.warns.filter((t) => t.owner !== z); clawHit(w, z); } return; }
    if (z.anim === 'tongue' && fi === (A.tongue?.hit ?? 4)) { tongueHit(w, z); return; }
    if (z.anim === 'slam' && fi === (A.slam?.hit ?? 4)) { slamHit(w, z); return; }
  },
  spawn(w) {
    return { x: w.cam + w.W + 80, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
