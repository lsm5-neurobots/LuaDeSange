// Chefe O Maquinista do Bonde (Lapa, Arcos): manivelada de perto, vara do trole com arco elétrico em área, badalada
// do sino que atordoa em volta, faíscas da catenária caindo em pontos marcados e o BONDE SEM FREIO: o bonde amarelo
// de Santa Teresa atravessa a arena inteira numa faixa de chão avisada e atropela quem estiver nela. Depois que o
// bonde passa ele encaixa a manivela no controlador e recarrega: VULNERÁVEL (dano ×1,5 pelo motor).
// Fúria (<50%): eletricidade vermelha, golpes ×1,3, 5 faíscas e o bonde passa duas vezes (ida e volta).
// O bonde e as faíscas são atores extras desenhados com a arte da própria factory (xBonde / xFaisca).
import type { ZombieAI } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { hurtF, stunF } from '../fighter';
import { hitCircle, hitLane } from './bossProps';

const CD: Record<string, [number, number]> = { swing: [2.4, 1.8], pole: [4, 3], bell: [8, 6], spark: [6.5, 5], bonde: [12, 9] };
/** medidas do bonde em px lógicos (a arte tem 320 unidades de comprimento = 160 px) */
export const TRAM = { half: 80, tol: 14, speed: 430, warn: 1.3, warn2: 0.9, margin: 120 };
export const POLE_AT = 124, POLE_R = 54, BELL_R = 78, SPARK_R = 24;

export interface Tram { x: number; y: number; dir: 1 | -1; t: number; delay: number; cosmetic: boolean; hit: Set<Fighter>; warn: any; actor: ExtraActor; done: boolean; fury: boolean }
export interface Spark { x: number; y: number; delay: number; t: number; hit: boolean; warn: any; actor: ExtraActor; done: boolean }

function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; setAnim(z, mv); z.mcd[mv] = CD[mv][z.fury ? 1 : 0]; }
const mul = (z: any): number => (z.fury ? 1.3 : 1);
const trams = (z: any): Tram[] => (z.trams ??= []);
const sparksOf = (z: any): Spark[] => (z.sparksL ??= []);

function propFrame(w: World, z: Zombie, an: string, fi: number, form: string): any {
  const F = z.K.F, A = F.ANIMS[an];
  if (!A || !F.framePose) return null;
  const i = Math.max(0, Math.min(A.n - 1, fi));
  return F.framePose(form, an, w.A.TWEEN.poseAt(F, an, i, 0, false), an + i + '.0');
}
function dropActor(w: World, a: ExtraActor): void { if (w.actors) { const i = w.actors.indexOf(a); if (i >= 0) w.actors.splice(i, 1); } }

/** Lança um bonde numa faixa (y). dir = sentido; cosmetic = só passa (intro), sem dano nem aviso. */
export function launchTram(w: World, z: Zombie, y: number, dir: 1 | -1, delay: number, cosmetic = false): Tram {
  const x = dir > 0 ? w.cam - TRAM.half - TRAM.margin : w.cam + w.W + TRAM.half + TRAM.margin;
  const warn = cosmetic ? null : { kind: 'lane' as const, x0: w.cam + 4, x1: w.cam + w.W - 4, y };
  if (warn) w.warns.push(warn);
  const tr: Tram = { x, y, dir, t: 0, delay, cosmetic, hit: new Set(), warn, done: false, fury: !!z.fury, actor: null as unknown as ExtraActor };
  tr.actor = {
    x, y, w0: 70, hide: true,
    draw: (c, cam) => {
      if (tr.done) return;
      if (z.dead) { endTram(w, tr); return; }
      const cv = propFrame(w, z, 'xBonde', Math.floor(w.clock * 14) % 2, tr.fury ? 'furia' : 'normal'); if (!cv) return;
      c.save(); c.translate(Math.round(tr.x - cam), Math.round(tr.y)); if (tr.dir < 0) c.scale(-1, 1);
      c.drawImage(cv, -cv._ax / RS, -cv._gy / RS, cv.width / RS, cv.height / RS); c.restore();
    },
  };
  (w.actors ??= []).push(tr.actor);
  trams(z).push(tr);
  return tr;
}
function endTram(w: World, tr: Tram): void {
  tr.done = true; dropActor(w, tr.actor);
  if (tr.warn) w.warns = w.warns.filter((x) => x !== tr.warn);
}
function tickTrams(w: World, z: Zombie, dt: number): void {
  for (const tr of trams(z)) {
    if (tr.done) continue;
    if (tr.delay > 0) { tr.delay -= dt; if (tr.delay <= 0 && !tr.cosmetic) { w.fx('burst', 'SEM FREIO!', tr.dir > 0 ? w.cam + 60 : w.cam + w.W - 60, tr.y - 70); w.log(`O bonde do ${z.K.nome} desceu sem freio!`); } continue; }
    tr.actor.hide = false;
    tr.t += dt; tr.x += tr.dir * TRAM.speed * dt;
    tr.actor.x = tr.x; tr.actor.y = tr.y;
    const on = tr.x > w.cam - TRAM.half && tr.x < w.cam + w.W + TRAM.half;
    if (on) {
      w.shake = Math.max(w.shake, tr.cosmetic ? 0.08 : 0.16);
      if (Math.random() < 0.6) w.sparks.push({ x: tr.x - tr.dir * (TRAM.half - 20 - Math.random() * 120), y: tr.y, vx: -tr.dir * (40 + Math.random() * 90), vy: -20 - Math.random() * 50, t: 0, c: Math.random() < 0.5 ? '#ffe27a' : (tr.fury ? '#ff4a3a' : '#64baff') });
    }
    if (!tr.cosmetic) {
      for (const f of aliveF(w)) {
        if (tr.hit.has(f) || Math.abs(f.y - tr.y) >= TRAM.tol || Math.abs(f.x - tr.x) >= TRAM.half) continue;
        tr.hit.add(f);
        hurtF(w, f, z.K.dmg * 1.6 * mul(z), { push: 40, heavy: true });
        f.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, f.x + tr.dir * 34));
        f.y = clampY(tr.y + (f.y >= tr.y ? 1 : -1) * (TRAM.tol + 6));
        if (!f.down) stunF(w, f, 0.5, 'ATROPELADO!');
        spawnFx(w, 'impactBig', f.x, f.y - 30, tr.dir);
        w.fx('burst', 'PÃ-PÃ!', f.x, f.y - 70);
      }
    }
    if ((tr.dir > 0 && tr.x > w.cam + w.W + TRAM.half + 40) || (tr.dir < 0 && tr.x < w.cam - TRAM.half - 40)) endTram(w, tr);
  }
  z.trams = trams(z).filter((t) => !t.done);
}

/** Faísca da catenária num ponto marcado (cai depois de `delay`). */
export function dropSpark(w: World, z: Zombie, x: number, y: number, delay: number): Spark {
  const warn = { kind: 'circle' as const, x, y, r: SPARK_R };
  w.warns.push(warn);
  const s: Spark = { x, y, delay, t: 0, hit: false, warn, done: false, actor: null as unknown as ExtraActor };
  s.actor = {
    x, y, w0: 0, hide: true,
    draw: (c, cam) => {
      if (s.done) return;
      if (z.dead) { endSpark(w, s); return; }
      const st = s.t < 0.1 ? 0 : s.t < 0.35 ? 1 : 2;
      const cv = propFrame(w, z, 'xFaisca', st, z.fury ? 'furia' : 'normal'); if (!cv) return;
      c.save(); c.globalAlpha = st === 2 ? Math.max(0, 1 - (s.t - 0.35) / 0.45) : 1; c.translate(Math.round(s.x - cam), Math.round(s.y));
      c.drawImage(cv, -cv._ax / RS, -cv._gy / RS, cv.width / RS, cv.height / RS); c.restore();
    },
  };
  (w.actors ??= []).push(s.actor);
  sparksOf(z).push(s);
  return s;
}
function endSpark(w: World, s: Spark): void { s.done = true; dropActor(w, s.actor); w.warns = w.warns.filter((x) => x !== s.warn); }
function tickSparks(w: World, z: Zombie, dt: number): void {
  for (const s of sparksOf(z)) {
    if (s.done) continue;
    if (s.delay > 0) { s.delay -= dt; continue; }
    s.actor.hide = false; s.t += dt;
    if (!s.hit && s.t >= 0.1) {
      s.hit = true; w.warns = w.warns.filter((x) => x !== s.warn);
      w.shake = Math.max(w.shake, 0.18); w.fx('burst', 'ZAP!', s.x, s.y - 40);
      for (let i = 0; i < 8; i++) w.sparks.push({ x: s.x, y: s.y - 2, vx: (Math.random() - 0.5) * 140, vy: -30 - Math.random() * 80, t: 0, c: z.fury ? '#ff4a3a' : '#64baff' });
      hitCircle(w, s.x, s.y, SPARK_R + 6, z.K.dmg * 0.8 * mul(z), 0.4, 'CHOQUE');
    }
    if (s.t > 0.8) endSpark(w, s);
  }
  z.sparksL = sparksOf(z).filter((s) => !s.done);
}

const busyTrams = (z: Zombie) => trams(z).some((t) => !t.done && !t.cosmetic);

export const maquinista: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.25 : 1;
    tickTrams(w, z, dt); tickSparks(w, z, dt);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = { bonde: 6, bell: 3 });
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.state === 'enter') { z.state = 'intro'; setAnim(z, 'intro'); }
    if (z.state === 'intro' || z.state === 'rage') {
      z.hold = false; z.vuln = false;
      if (z.anim === 'intro' && !z.introTram) { z.introTram = true; launchTram(w, z, 150, -1, 0, true); }
      const pf = z.fi; c.step();
      if (z.fi !== pf) {
        if (z.anim === 'intro' && z.fi === 4) { w.shake = 0.6; spawnFx(w, 'impactBig', z.x, z.y - 6, -1); w.fx('burst', 'TUUM!', z.x, z.y - 60); }
        if (z.anim === 'intro' && z.fi === 7) { w.fx('burst', 'DLEM!', z.x + 20, z.y - 110); w.shake = Math.max(w.shake, 0.25); }
        if (z.anim === 'rage' && z.fi === 3) { w.shake = 0.5; w.fx('burst', 'BZZZT!', z.x, z.y - 130); for (let i = 0; i < 14; i++) w.sparks.push({ x: z.x + (Math.random() - 0.5) * 50, y: z.y - 80 - Math.random() * 60, vx: (Math.random() - 0.5) * 160, vy: -40 - Math.random() * 80, t: 0, c: '#ff4a3a' }); }
      }
      if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'attack') {
      if (z.mv === 'bonde') {
        if (z.anim === 'bonde') {
          if (!z.done) { c.step(true); return; }
          // chamou o bonde: segura a pose até passar (na fúria, lança o 2º quando o 1º sai, no sentido contrário)
          z.hold = true;
          if (z.second && !z.secondOut) {
            if (!busyTrams(z)) { z.secondOut = true; launchTram(w, z, clampY(V.y), (-(z.tramDir || 1)) as 1 | -1, TRAM.warn2); w.fx('bubble', 'DE VOLTA!', z.x, z.y - z.K.top * 0.55); }
            return;
          }
          if (busyTrams(z)) return;
          z.hold = false; setAnim(z, 'recharge'); z.vuln = true; z.rechT = z.fury ? 3.2 : 2.6;
          w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top * 0.55 - 10); w.fx('bubble', 'RECARREGANDO...', z.x, z.y - z.K.top * 0.55);
          return;
        }
        // recarregando a manivela: parado e vulnerável
        z.rechT -= dt;
        c.step(true);
        if (z.done && z.rechT > 0) { z.fi = 0; z.acc = 0; z.done = false; }
        if (z.rechT <= 0) { z.vuln = false; z.state = 'walk'; z.cd = z.fury ? 0.7 : 1.1; setAnim(z, 'walk'); }
        return;
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 0.7 : 1.1; setAnim(z, 'walk'); }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if (!mcd.bonde && Math.random() < 0.6) {
        start(z, 'bonde'); z.second = !!z.fury; z.secondOut = false;
        w.fx('bubble', 'BONDE SEM FREIO!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx < 85 && ady < 30 && !mcd.bell && Math.random() < 0.45) {
        start(z, 'bell'); w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: BELL_R, owner: z });
        w.fx('bubble', 'DLEM-DLEM!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx > 70 && c.adx < 175 && ady < 30 && !mcd.pole) {
        start(z, 'pole'); z.px = z.x + z.face * POLE_AT; z.py = z.y;
        w.warns.push({ kind: 'circle', x: z.px, y: z.py, r: POLE_R, owner: z });
        w.fx('bubble', 'BZZT!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx < 85 && ady < 16 && !mcd.swing) {
        start(z, 'swing'); w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 80, y: z.y, owner: z });
        return;
      }
      if (c.adx > 100 && !mcd.spark) { start(z, 'spark'); w.fx('bubble', 'CATENÁRIA!', z.x, z.y - z.K.top * 0.55); return; }
    }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 66), 13 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 11 * spdM * dt));
    setAnim(z, 'walk');
    const pf = z.fi;
    c.step();
    if (z.fi !== pf && (A.walk.stomp || []).includes(z.fi)) w.shake = Math.max(w.shake, 0.08);
  },
  onFrame(c, fi) {
    const { z, w, V } = c;
    const A = z.K.F.ANIMS, D = z.K.dmg, m = mul(z);
    if (z.anim === 'swing' && fi === A.swing.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = Math.max(w.shake, 0.25); w.fx('burst', 'CLONC!', z.x + z.face * 50, z.y - 60);
      hitLane(w, z.x, z.x + z.face * 80, z.y, 16, D * 0.8 * m, 0, '', 18, z.face);
    }
    if (z.anim === 'pole' && fi === A.pole.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.4; w.fx('burst', 'BZZZAP!', z.px, z.py - 50); spawnFx(w, 'impactBig', z.px, z.py - 8, z.face);
      for (let i = 0; i < 14; i++) w.sparks.push({ x: z.px + (Math.random() - 0.5) * 70, y: z.py, vx: (Math.random() - 0.5) * 150, vy: -30 - Math.random() * 90, t: 0, c: z.fury ? '#ff4a3a' : '#64baff' });
      hitCircle(w, z.px, z.py, POLE_R, D * 1.1 * m, 0.6, 'CHOQUE');
    }
    if (z.anim === 'bell' && fi === A.bell.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.3; w.fx('burst', 'DLEEM!', z.x + z.face * 20, z.y - 120);
      hitCircle(w, z.x, z.y, BELL_R, D * 0.5 * m, 1.3, 'ATORDOADO');
    }
    if (z.anim === 'spark' && fi === A.spark.castAt) {
      const n = z.fury ? 5 : 3, fs = aliveF(w);
      w.shake = Math.max(w.shake, 0.2); w.fx('burst', 'ZZZT!', z.x, z.y - 150);
      for (let k = 0; k < n; k++) {
        const f = fs[k % Math.max(1, fs.length)] ?? V;
        const x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, (k < fs.length ? f.x : V.x) + (k >= fs.length ? (Math.random() - 0.5) * 120 : 0)));
        const y = clampY((k < fs.length ? f.y : V.y) + (k >= fs.length ? (Math.random() - 0.5) * 40 : 0));
        dropSpark(w, z, x, y, 0.85 + k * 0.22);
      }
    }
    if (z.anim === 'bonde' && fi === A.bonde.callAt) {
      const dir = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;
      z.tramDir = dir;
      w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'DLEM! DLEM!', z.x, z.y - 120);
      launchTram(w, z, clampY(V.y), dir, TRAM.warn);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W - 110, y: 178, face: -1, state: 'intro', anim: 'intro' };
  },
};
