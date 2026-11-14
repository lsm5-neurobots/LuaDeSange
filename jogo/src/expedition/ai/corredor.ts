// Corredor: investida rápida de média distância; se errar, tropeça e fica aberto (dano em dobro).
import type { ZombieAI } from './index';
import { clampY, rnd, setAnim } from '../world';
import { DODGE, hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

// repertório: investida (padrão, tropeça se errar), voadora de longe (tropeça se errar) e sequência de tapas colado
const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, min: 26, max: 58, dy: 9, cd: 0 },
  { anim: 'tackle', w: 2, min: 44, max: 86, dy: 8, cd: 3.5, dmg: 1.3, push: 22, word: 'TUMP!', warn: 'lane', lunge: [0, 0, 200, 160, 60, 0, 0, 0], shake: 0.1 },
  { anim: 'divebomb', w: 1.6, min: 30, max: 72, dy: 9, cd: 5, dmg: 1.4, push: 22, word: 'TCHUM!', warn: 'lane', shake: 0.1, lunge: [0, 60, 150, 150, 110, 20, 0, 0] }, // peixinho (novo)
  { anim: 'slaps', w: 2.5, max: 30, dy: 9, cd: 2, dmg: 1.2, word: 'PÁ!', lunge: [0, 20, 30, 20, 30, 20, 30, 0, 0] },
];

export const corredor: ZombieAI = {
  rest: 'run',
  update(c) {
    const { z, V, w, dt } = c;
    tickMoves(z, dt);
    if (z.state === 'attack') {
      if (z.anim === 'attack') { if (z.fi >= 1 && z.fi <= 3) z.x += z.face * 110 * dt; } else moveStep(c, MOVES);
      c.step(true);
      if (z.done) {
        endMove(w, z);
        if (z.hit || z.anim === 'slaps') { z.state = 'run'; z.cd = 0.8; setAnim(z, 'walk'); }
        else { z.state = 'miss'; setAnim(z, z.K.F.ANIMS.miss ? 'miss' : 'hurt'); w.fx('tag', 'TROPEÇOU', z.x, z.y - 86); }
      }
      return;
    }
    if (z.state === 'miss') { if (z.fi < 2) z.x += z.face * 60 * dt; c.step(); if (z.done) { z.state = 'run'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    const mv = z.cd <= 0 && Math.abs(c.dy) < 9 ? pickMove(c, MOVES) : null;
    if (mv) {
      startMove(c, mv);
      if (mv.anim !== 'slaps' && V.state !== 'stun' && !V.down && rnd() < DODGE(w, V) * 0.6) { V.dodge = { dy: (V.y > 176 ? -1 : 1) * 22, t: 0.35 }; if (V.state === 'combo') V.state = 'guard'; }
      return;
    }
    setAnim(z, 'walk');
    const spd = c.adx > 30 ? 62 : 0;
    z.x += Math.sign(c.dx) * Math.min(spd * dt, Math.max(0, c.adx - 24));
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 30 * dt));
    c.step();
  },
  onFrame(c, fi) {
    const { z, V, w } = c;
    if (z.anim !== 'attack') { moveFrame(c, fi, MOVES); return; }
    if (fi !== 3) return;
    if (Math.abs(V.x - z.x) < 24 && Math.abs(V.y - z.y) < 12) { hurtF(w, V, z.K.dmg * z.dmgMul); w.fx('burst', 'SHRAK!', V.x, V.y - 64); z.hit = true; }
    else z.hit = false;
  },
};
