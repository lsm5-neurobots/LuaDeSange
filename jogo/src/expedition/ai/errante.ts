// Errante: vaga até ver alguém, alerta, persegue devagar e morde de perto.
import type { ZombieAI } from './index';
import { setAnim } from '../world';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

// repertório: mordida (padrão), arranhão duplo, cabeçada que empurra, agarrão baixo que prende
const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 32, dy: 9, cd: 0, dmg: 1, word: 'NHAC!' },
  { anim: 'claw2', w: 3, max: 34, dy: 9, cd: 1.4, dmg: 0.9, word: 'SHRAK!' },
  { anim: 'headbutt', w: 2, max: 28, dy: 8, cd: 2.6, dmg: 1.2, push: 16, word: 'TOC!', shake: 0.08 },
  { anim: 'backhand', w: 2, max: 34, dy: 9, cd: 2.2, dmg: 1, push: 14, word: 'PLAFT!' }, // tapa de revés (novo)
  { anim: 'grabLow', w: 1.4, max: 32, dy: 9, cd: 4.5, dmg: 0.6, stun: 0.7, stunTag: 'AGARRADO', word: 'AGARROU!' },
];

export const errante: ZombieAI = {
  rest: 'chase',
  update(c) {
    const { z } = c;
    tickMoves(z, c.dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') { moveStep(c, MOVES); c.step(true); if (z.done) { endMove(c.w, z); z.state = 'cool'; z.cd = 0.55; setAnim(z, 'idle'); } return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (c.adx < 34 && Math.abs(c.dy) < 9) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    c.chase(19, 24);
  },
  onFrame(c, fi) { moveFrame(c, fi, MOVES); },
};
