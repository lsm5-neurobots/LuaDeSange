// Blindado (IA-27..29): tropa de choque com escudo.
// - De frente (lado para onde olha) o escudo absorve o golpe: dano quase zero, faísca e "TING!". Golpe leve conta 1,
//   pesado conta 2, laser perfura (conta 1 e passa 50%). Na 3ª contagem (4ª no plenilunar) o escudo cai.
// - Por trás: dano integral. Ele só vira depois de 0,8 s com o alvo atrás, e o giro (anim turn, 0,8 s) é a janela.
// - Com escudo: empurrão e investida. Sem escudo (vista BLINDADO.N): +20% de velocidade, cassetete e pisão.
import type { ZombieAI, ZCtx } from './index';
import { setAnim, spawnFx, type Fighter, type World, type Zombie, type ZKind } from '../world';
import { GUARDS, killZ } from '../combat';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

const SHIELD: ZMove[] = [
  { anim: 'bash', w: 3, max: 40, dy: 9, cd: 3, dmg: 1, push: 30, stun: 0.5, stunTag: 'TONTO', word: 'TUM!', shake: 0.12 },
  { anim: 'rush', w: 2, min: 50, max: 110, dy: 8, cd: 5.5, dmg: 1.4, push: 22, word: 'BAM!', warn: 'lane', lunge: [0, 170, 200, 200, 120, 0, 0, 0, 0], shake: 0.14 },
];
const BARE: ZMove[] = [
  { anim: 'baton', w: 3, max: 36, dy: 9, cd: 1.2, dmg: 1.12, word: 'TÁ-TÁ!' },
  { anim: 'kick', w: 2, max: 34, dy: 9, cd: 2.5, dmg: 1, push: 26, word: 'PÁ!', shake: 0.08 },
];

/** quantas contagens o escudo aguenta */
export const shieldMax = (z: Zombie) => (z.form === 'plenilunar' ? 4 : 3);
/** tempo com o alvo nas costas antes de virar (s) */
export const TURN_DELAY = 0.8;

export function initShield(z: Zombie): void {
  if (z.shielded == null) { z.shielded = true; z.shieldHP = shieldMax(z); z.behindT = 0; }
}

/** O golpe de `by` vem da frente do Blindado (lado para onde ele olha)? */
export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Vista sem escudo (factory BLINDADO.N), compartilhada por todos os Blindados do mundo. */
function bareK(w: World, z: Zombie): ZKind {
  const W = w as any;
  return (W._blindN ??= z.K.F.N ? { ...z.K, F: z.K.F.N } : z.K);
}

export function breakShield(w: World, z: Zombie): void {
  z.shielded = false; z.shieldHP = 0;
  endMove(w, z);
  z.K = bareK(w, z);
  z.state = 'break'; z.stun = 0; z.down = null;
  setAnim(z, z.K.F.ANIMS.shieldBreak ? 'shieldBreak' : 'hurt');
  w.fx('tag', 'ESCUDO CAIU!', z.x, z.y - z.K.top * 0.5 - 16);
  w.shake = Math.max(w.shake, 0.18); w.hitstop = Math.max(w.hitstop, 0.06);
  spawnFx(w, 'impactBig', z.x + z.face * 14, z.y - z.K.top * 0.3, z.face);
}

/** Defesa do escudo (registrada em GUARDS): null = golpe absorvido. */
export function shieldGuard(w: World, z: Zombie, dmg: number, n: number, by?: Fighter | null): number | null {
  initShield(z);
  if (!z.shielded || z.state === 'break' || !by || !fromFront(z, by)) return dmg;
  const laser = by.w?.tipo === 'beam';
  const cnt = laser ? 1 : n === 3 ? 2 : 1;
  z.shieldHP -= cnt;
  const hx = z.x + z.face * 14, hy = z.y - z.K.top * 0.45;
  spawnFx(w, 'hitspark', hx, hy, (-z.face) as 1 | -1);
  for (let i = 0; i < 5; i++) w.sparks.push({ x: hx, y: hy, vx: -z.face * (-20 + Math.random() * 90) * (i % 2 ? 1 : -1) + by.face * 30, vy: -30 - Math.random() * 60, t: 0.25, c: i % 2 ? '#ffd23f' : '#e6f6ff' });
  w.fx('tag', laser ? 'PERFUROU' : 'TING!', hx, hy - 18);
  w.hitstop = Math.max(w.hitstop, 0.03);
  if (z.shieldHP <= 0) { breakShield(w, z); return laser ? dmg * 0.5 : null; }
  if (laser) return dmg * 0.5;
  // lasca de dano quase zero (não derruba nem interrompe)
  const chip = dmg * 0.04;
  z.chip = (z.chip ?? 0) + chip;
  if (z.chip >= 1) { const k = Math.floor(z.chip); z.chip -= k; z.hp -= k; if (z.hp <= 0) { killZ(w, z, by); return null; } }
  if (z.state !== 'attack' && z.state !== 'turn') { z.state = 'block'; setAnim(z, 'block'); }
  return null;
}
GUARDS.blindado = shieldGuard;

export const blindado: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    initShield(z);
    tickMoves(z, dt);
    const MV = z.shielded ? SHIELD : BARE;
    if (z.state === 'break') { c.step(); if (z.anim !== 'shieldBreak' || z.done) { z.state = 'chase'; setAnim(z, 'walk'); z.cd = 0.3; } return; }
    if (z.state === 'block') { c.step(); if (z.anim !== 'block' || z.done) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (z.state === 'turn') {
      if (z.anim !== 'turn') { z.state = 'chase'; setAnim(z, 'walk'); return; }
      const fi0 = z.fi; c.step();
      if (fi0 < 3 && z.fi >= 3) z.face = (-z.face) as 1 | -1; // vira no meio do giro
      if (z.done) { z.state = 'chase'; z.behindT = 0; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'attack') { moveStep(c, MV); c.step(true); if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = z.shielded ? 0.7 : 0.45; setAnim(z, 'idle'); } return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (z.state === 'wander' || z.state === 'alert') { z.state = 'chase'; setAnim(z, 'walk'); }
    const inFront = Math.sign(c.dx) === z.face || c.adx < 3;
    if (z.shielded) {
      // escudo virado: não gira na hora; com o alvo atrás por 0,8 s faz o giro lento
      if (!inFront) {
        z.behindT = (z.behindT ?? 0) + dt;
        if (z.behindT >= TURN_DELAY && z.K.F.ANIMS.turn) { z.state = 'turn'; setAnim(z, 'turn'); return; }
        if (z.behindT >= TURN_DELAY) { z.face = (-z.face) as 1 | -1; z.behindT = 0; }
      } else z.behindT = 0;
      if (inFront && Math.abs(c.dy) < 9) { const mv = pickMove(c, MV); if (mv) { startMove(c, mv); return; } }
      const face = z.face;
      setAnim(z, 'walk');
      c.chase(16, 30);
      z.face = face; // a tática vira pro alvo; o Blindado não
      return;
    }
    if (c.adx < 38 && Math.abs(c.dy) < 9) { const mv = pickMove(c, MV); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    c.chase(23, 24);
  },
  onFrame(c, fi) { moveFrame(c, fi, c.z.shielded ? SHIELD : BARE); },
};
