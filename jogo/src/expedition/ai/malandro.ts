// Zumbi Malandro (IA-31, variante local da Lapa): boêmio de terno de linho com navalha. Luta "na ginga".
// - De perto: navalhada em sequência (3 cortes, avança no último), revés de navalha (empurra).
// - Rasteira: com aviso na faixa, desliza e derruba (lutador vai pro chão). FRAQUEZA: depois dela fica ABERTO
//   ajeitando o terno (~1,6 s): não ginga e leva +30% de dano por 1,8 s.
// - Chapéu arremessado: de média distância (40–84 px) joga o panamá, que vai e volta como bumerangue e acerta na ida
//   e na volta (ator extra no palco; arte MALANDRO.xHat). Se ele for interrompido, o chapéu cai.
// - Ginga: golpe que vem DE FRENTE tem chance de ser esquivado (30%; 35% enluarado; 40% plenilunar; laser 50% disso)
//   com passo de lado e contra-ataque de revés. De costas não esquiva. Recarga de 2,2 s entre gingas.
import type { ZombieAI, ZCtx } from './index';
import { RS, aliveF, clampY, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 36, dy: 9, cd: 1.4, dmg: 0.8, word: 'ZÁS!', lunge: [0, 0, 0, 0, 0, 0, 30, 110, 20, 0] },
  { anim: 'backhand', w: 2, max: 36, dy: 9, cd: 2.4, dmg: 0.8, push: 12, word: 'SHLIK!' },
  { anim: 'rasteira', w: 2, min: 8, max: 48, dy: 10, cd: 6, dmg: 0.7, warn: 'lane', word: 'RASTEIRA!', lunge: [0, 40, 60, 50, 20, 0, 0, 0, 0] },
  { anim: 'hatThrow', w: 2.5, min: 40, max: 84, dy: 12, cd: 7, dmg: 0 },
];
const COUNTER: ZMove = MOVES[1];

/** chance de gingar (golpe de frente) */
export const gingaChance = (z: Zombie) => (z.form === 'plenilunar' ? 0.4 : z.form === 'enluarado' ? 0.35 : 0.3);
export const GINGA_CD = 2.2;
/** janela aberta depois da rasteira (s) e bônus de dano nela */
export const OPEN_T = 1.8;
export const OPEN_MUL = 1.3;

/** O golpe de `by` vem da frente do Malandro (lado para onde ele olha)? */
export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Pode gingar agora? (não no meio de golpe, aberto, no chão, tonto, agarrado, no ar) */
function canGinga(w: World, z: Zombie): boolean {
  if (z.dead || z.air || z.down || z.stun > 0 || (z.openT ?? 0) > 0) return false;
  if (['attack', 'open', 'hurt', 'grabbed', 'ginga', 'down', 'boom'].includes(z.state)) return false;
  return (w.clock ?? 0) >= (z.gingaReady ?? 0);
}

/** Defesa (registrada em GUARDS): null = esquivou. */
export function malandroGuard(w: World, z: Zombie, dmg: number, _n: number, by?: Fighter | null): number | null {
  if (z.state === 'ginga' && z.anim === 'ginga' && z.fi <= 3) return null; // ainda no passo da ginga: passa batido
  if ((z.openT ?? 0) > 0) return dmg * OPEN_MUL;
  if (!by || !canGinga(w, z) || !fromFront(z, by)) return dmg;
  const ch = gingaChance(z) * (by.w?.tipo === 'beam' ? 0.5 : 1);
  if (Math.random() >= ch) return dmg; // Math.random direto (rnd é capturado no import e não dá pra simular nos testes)
  ginga(w, z, by);
  return null;
}
GUARDS.malandro = malandroGuard;

function ginga(w: World, z: Zombie, by: Fighter): void {
  endMove(w, z);
  z.gingaReady = (w.clock ?? 0) + GINGA_CD;
  z.state = 'ginga'; z.hit = false;
  z.face = (Math.sign(by.x - z.x) || z.face) as 1 | -1;
  // passo de lado: pra faixa com mais espaço (longe da borda do chão)
  z.gdir = z.y < 176 ? 1 : -1;
  setAnim(z, z.K.F.ANIMS.ginga ? 'ginga' : 'idle');
  w.fx('tag', 'GINGOU!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'dust', z.x - z.face * 6, z.y, (-z.face) as 1 | -1);
  w.log(`${z.K.nome} gingou e saiu do golpe`);
}

/* ---------- chapéu bumerangue ---------- */
interface Hat { x: number; y: number; h: number; x0: number; y0: number; t: number; T: number; range: number; dir: 1 | -1; hit: Set<string>; actor: ExtraActor; done: boolean }

function hatFlight(z: Zombie): number {
  const A = z.K.F.ANIMS.hatThrow; if (!A) return 0.7;
  let ms = 0; for (let i = A.throwAt ?? 3; i < (A.catchAt ?? 8); i++) ms += Number(A.dur(i));
  return ms > 5 ? ms / 1000 : ms;
}

function throwHat(w: World, z: Zombie, V: Fighter): void {
  const range = Math.min(88, Math.max(48, Math.abs(V.x - z.x) + 10));
  const H: Hat = { x: z.x + z.face * 12, y: z.y, h: 62, x0: z.x + z.face * 12, y0: z.y, t: 0, T: hatFlight(z), range, dir: z.face, hit: new Set(), actor: null as unknown as ExtraActor, done: false };
  H.actor = {
    x: H.x, y: H.y, w0: 4,
    draw: (c, cam) => {
      if (H.done) return;
      const F = z.K.F, fi = Math.floor((w.clock ?? 0) * 16) % 4;
      const cv: any = F.framePose ? F.framePose(z.form, 'xHat', { st: fi }, 'xHat' + fi + '.0') : F.frame(z.form, 'xHat', fi, 5);
      if (!cv) return;
      c.save(); c.translate(Math.round(H.x - cam), Math.round(H.y - H.h)); if (H.dir < 0) c.scale(-1, 1);
      c.drawImage(cv, -(cv._ax ?? cv.width / 2) / RS, -(cv._gy ?? cv.height / 2) / RS, cv.width / RS, cv.height / RS);
      c.restore();
    },
  };
  (w.actors ??= []).push(H.actor);
  z._hat = H;
  w.fx('bubble', 'Ó O CHAPÉU!', z.x, z.y - z.K.top * 0.55);
}

function dropHat(w: World, z: Zombie, puff: boolean): void {
  const H = z._hat as Hat | undefined; if (!H) return;
  H.done = true; z._hat = null;
  if (w.actors) { const i = w.actors.indexOf(H.actor); if (i >= 0) w.actors.splice(i, 1); }
  if (puff) spawnFx(w, 'dust', H.x, H.y, H.dir);
}

/** Move o chapéu (vai e volta até a mão do Malandro) e acerta quem cruzar. Exportado pros testes. */
export function tickHat(w: World, z: Zombie, dt: number): void {
  const H = z._hat as Hat | undefined; if (!H) return;
  if (z.dead || z.anim !== 'hatThrow') { dropHat(w, z, true); return; }
  H.t += dt;
  const p = Math.min(1, H.t / H.T), back = p > 0.5;
  H.x = H.x0 * (1 - p) + z.x * p + H.dir * H.range * Math.sin(p * Math.PI);
  H.y = H.y0 * (1 - p) + z.y * p;
  H.h = 62 - 10 * Math.sin(p * Math.PI);
  H.actor.x = H.x; H.actor.y = H.y;
  for (const f of aliveF(w)) {
    const key = f.m?.nome + (back ? '<' : '>');
    if (H.hit.has(key) || Math.abs(f.x - H.x) > 12 || Math.abs(f.y - H.y) > 10) continue;
    H.hit.add(key);
    hurtF(w, f, z.K.dmg * 0.6 * z.dmgMul);
    w.fx('burst', 'PLÁ!', f.x, f.y - 66);
    spawnFx(w, 'impact', f.x, f.y - 60, (-H.dir) as 1 | -1);
  }
  if (p >= 1) dropHat(w, z, false);
}

/** Rasteira: acerta a faixa baixa na frente e derruba. Exportado pros testes. */
export function rasteiraHit(w: World, z: Zombie): Fighter[] {
  const A = z.K.F.ANIMS.rasteira, reach = A?.reach ?? 44, out: Fighter[] = [];
  for (const f of aliveF(w)) {
    const d = (f.x - z.x) * z.face;
    if (d < -6 || d > reach || Math.abs(f.y - z.y) > 12) continue;
    hurtF(w, f, z.K.dmg * 0.7 * z.dmgMul, { heavy: true });
    if (!f.down && f.state !== 'kd' && f.state !== 'getup') {
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-z.face) as 1 | -1; }
      else stunF(w, f, 0.9, 'DERRUBADO');
    }
    out.push(f);
  }
  if (out.length) { w.fx('burst', 'RASTEIRA!', out[0].x, out[0].y - 50); w.shake = Math.max(w.shake, 0.14); w.hitstop = Math.max(w.hitstop ?? 0, 0.05); }
  spawnFx(w, 'dust', z.x + z.face * 30, z.y, z.face);
  return out;
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

export const malandro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickHat(w, z, dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'ginga') {
      if (z.anim !== 'ginga') { toChase(z); return; }
      if (z.fi >= 1 && z.fi <= 3) { z.y = clampY(z.y + (z.gdir ?? 1) * 46 * dt); z.x -= z.face * 22 * dt; }
      c.step();
      if (z.done) { // contra-ataque se o alvo continua perto
        z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
        if (c.adx < 40 && Math.abs(c.dy) < 12 && z.K.F.ANIMS.backhand) { startMove(c, COUNTER); w.fx('tag', 'CONTRA!', z.x, z.y - z.K.top * 0.5 - 14); }
        else toChase(z);
      }
      return;
    }
    if (z.state === 'open') {
      if (z.anim !== 'open') { toChase(z); return; }
      const f0 = z.fi; c.step();
      if (z.fi !== f0 && z.fi >= 2 && z.fi <= 4) spawnFx(w, 'dust', z.x + z.face * 6, z.y - 40, z.face); // batendo a poeira do terno
      if (z.done) toChase(z);
      return;
    }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'rasteira' && z.K.F.ANIMS.open) { // FRAQUEZA: fica aberto ajeitando o terno
          z.state = 'open'; z.openT = OPEN_T; setAnim(z, 'open');
          w.fx('tag', 'ABERTO!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = was === 'hatThrow' ? 0.3 : 0.55; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    if (c.adx < 86 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    c.chase(21, 28);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'hatThrow') { if (fi === (A?.throwAt ?? 3)) throwHat(w, z, V); return; }
    if (z.anim === 'rasteira') {
      if (fi === A?.hit) { w.warns = w.warns.filter((t) => t.owner !== z); rasteiraHit(w, z); z.hit = true; }
      return;
    }
    if (z.anim === 'attack' && fi === 7) spawnFx(w, 'dust', z.x, z.y, z.face);
    moveFrame(c, fi, MOVES);
  },
};
