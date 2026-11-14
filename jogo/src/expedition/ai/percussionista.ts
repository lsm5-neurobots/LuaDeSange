// Zumbi Percussionista (IA-30, variante local do Pelourinho): suporte ritmado com surdo.
// - De perto: baquetada (padrão), tapa de revés com a baqueta e golpe de tambor (onda em volta: empurra e atordoa).
// - Ritmo: quando há zumbis perto, para e bate o ritmo; acelera em 20% (30% no plenilunar) quem está a 120 px por
//   6 s (8 s no enluarado). O efeito acaba quando ele morre. Prefere ficar um pouco atrás da horda.
import type { ZombieAI, ZCtx } from './index';
import { setAnim, spawnFx, type World, type Zombie } from '../world';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 34, dy: 9, cd: 0, dmg: 1, word: 'TOC!' },
  { anim: 'backhand', w: 2, max: 38, dy: 9, cd: 2.2, dmg: 1, push: 14, word: 'PLAFT!' },
  { anim: 'drum', w: 2, max: 50, dy: 14, cd: 5, dmg: 0.6, around: 52, push: 22, stun: 0.5, stunTag: 'ATORDOADO', word: 'BUMM!', warn: 'circle', shake: 0.1 },
];
const BEAT: ZMove = { anim: 'beat', w: 0, max: 999, cd: 8, dmg: 0, warn: 'circle', around: 60 };

/** raio do ritmo (px, profundidade ×2) */
export const BEAT_R = 120;
export const hasteMulOf = (z: Zombie) => (z.form === 'plenilunar' ? 1.3 : 1.2);
export const hasteDurOf = (z: Zombie) => (z.form === 'enluarado' ? 8 : 6);

/** Aplica o ritmo do Percussionista `z` nos zumbis próximos. Retorna quantos acelerou. */
export function applyBeat(w: World, z: Zombie): number {
  let n = 0;
  for (const o of w.zs) {
    if (o === z || o.dead || o.boss) continue;
    if (Math.hypot(o.x - z.x, (o.y - z.y) * 2) > BEAT_R) continue;
    if (!(o.hasteT > 0)) w.fx('tag', 'RITMO!', o.x, o.y - o.K.top * 0.5 - 10);
    o.hasteT = hasteDurOf(z); o.hasteMul = Math.max(o.hasteT > 0 && o.hasteBy !== z ? o.hasteMul ?? 1 : 1, hasteMulOf(z)); o.hasteBy = z;
    n++;
  }
  return n;
}

/** Multiplicador de velocidade atual do zumbi (ritmo do Percussionista); desconta o tempo. Chamado 1× por update. */
export function hasteK(w: World, z: Zombie, dt: number): number {
  if (!(z.hasteT > 0)) return 1;
  const by = z.hasteBy as Zombie | undefined;
  z.hasteT -= dt;
  if (z.hasteT <= 0 || !by || by.dead) { z.hasteT = 0; z.hasteBy = undefined; z.hasteMul = 1; return 1; }
  // notinhas subindo (barato: raramente)
  if (Math.random() < dt * 2.2) w.sparks.push({ x: z.x + (Math.random() - 0.5) * 14, y: z.y - z.K.top * 0.6, vx: 0, vy: -30, t: 0.2, c: by.form === 'enluarado' ? '#7af4ff' : '#ffd23f' });
  return z.hasteMul ?? 1;
}

const allyNear = (c: ZCtx) => c.w.zs.some((o) => o !== c.z && !o.dead && !o.boss && Math.hypot(o.x - c.z.x, (o.y - c.z.y) * 2) < BEAT_R);

export const percussionista: ZombieAI = {
  rest: 'chase',
  update(c) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    z.beatCd = Math.max(0, (z.beatCd ?? 2.5) - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') { moveStep(c, MOVES); c.step(true); if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = z.anim === 'beat' ? 0.4 : 0.6; setAnim(z, 'idle'); } return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    // ritmo: com aliados por perto e sem ninguém colado
    if (z.beatCd <= 0 && c.adx > 40 && allyNear(c) && z.K.F.ANIMS.beat) { z.beatCd = BEAT.cd; startMove(c, BEAT); w.fx('bubble', 'BUM-BUM!', z.x, z.y - z.K.top * 0.55); return; }
    if (c.adx < 52 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    c.chase(18, 26);
  },
  onFrame(c, fi) {
    const { z, w } = c;
    if (z.anim === 'beat') {
      const A = z.K.F.ANIMS.beat, hf: number[] = Array.isArray(A.hit) ? A.hit : [A.hit ?? 3];
      if (!hf.includes(fi)) return;
      w.fx('burst', fi === hf[0] ? 'BUM!' : fi === hf[hf.length - 1] ? 'BUM-BUM!' : 'TUM!', z.x + z.face * 12, z.y - 64);
      w.rings.push({ x: z.x + z.face * 8, y: z.y - 70, t: 0 });
      if (fi === hf[0]) { const n = applyBeat(w, z); if (n) w.log(`${z.K.nome} bateu o ritmo: ${n} zumbi(s) mais rápido(s)`); }
      if (fi === hf[hf.length - 1]) for (const f of w.fs) if (!f.down && Math.hypot(f.x - z.x, (f.y - z.y) * 2) < 60) hurtF(w, f, 3 * z.dmgMul);
      w.shake = Math.max(w.shake, 0.05);
      return;
    }
    if (z.anim === 'drum' && fi === z.K.F.ANIMS.drum?.hit) { spawnFx(w, 'dust', z.x + z.face * 18, z.y, z.face); w.rings.push({ x: z.x + z.face * 8, y: z.y - 70, t: 0 }); }
    moveFrame(c, fi, MOVES);
  },
};
