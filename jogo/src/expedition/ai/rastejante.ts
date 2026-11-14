// Rastejante: finge de morto no chão; quando alguém pisa perto, agarra a perna (prende 1 s). Depois rasteja.
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { hurtF, stunF } from '../fighter';
import { endMove, moveFrame, pickMove, startMove, tickMoves, type ZMove } from './moves';

// repertório rastejando: agarrar a perna (padrão, prende), mordida no tornozelo, puxão que arrasta o lutador
const MOVES: ZMove[] = [
  { anim: 'attack', w: 2, max: 42, dy: 12, cd: 0, dmg: 1, stun: 1, stunTag: 'PRESO 1 s' },
  { anim: 'ankle', w: 3, max: 40, dy: 12, cd: 1.6, dmg: 1.1, word: 'NHAC!' },
  { anim: 'pull', w: 2, min: 18, max: 52, dy: 12, cd: 4, dmg: 0.6, push: -16, stun: 0.5, stunTag: 'PUXADO', word: 'VEM CÁ!' },
];

export const rastejante: ZombieAI = {
  rest: 'crawl',
  update(c) {
    const { z, V, w, dt } = c;
    if (z.state === 'dead') {
      c.step();
      const hx = z.x + z.face * 22;
      if (Math.abs(V.x - hx) < 30 && Math.abs(c.dy) < 14) { z.face = (Math.sign(c.dx) || z.face) as 1 | -1; z.state = 'attack'; setAnim(z, 'attack'); }
      return;
    }
    tickMoves(z, dt);
    if (z.state === 'attack') { c.step(true); if (z.done) { endMove(w, z); z.state = 'crawl'; z.cd = z.anim === 'attack' ? 2.4 : 1.2; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    const hx = z.x + z.face * 22;
    if (z.cd <= 0 && (V.x - z.x) * z.face > 0 && Math.abs(V.x - hx) < 30 && Math.abs(c.dy) < 12) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    const mv = (z.K.F.ANIMS.walk.mv || [])[z.fi] || 0;
    z.x += Math.sign(c.dx) * (c.adx > 30 ? mv * 0.16 : 0) * (dt * 60) / 2;
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 6 * dt));
    c.step();
    void w;
  },
  onFrame(c, fi) {
    const { z, V, w } = c;
    if (z.anim !== 'attack') { moveFrame(c, fi, MOVES); return; }
    if (fi !== 4) return;
    const hx = z.x + z.face * 24;
    if (Math.abs(V.x - hx) < 18 && Math.abs(V.y - z.y) < 14 && !V.down) {
      hurtF(w, V, z.K.dmg * z.dmgMul);
      if (!V.down) stunF(w, V, 1, 'PRESO 1 s');
    }
  },
  spawn(w) {
    // entra rastejando pela borda (nada de surgir do nada no meio da tela)
    return { x: w.cam + w.W + 30 + Math.random() * 30, y: 150 + Math.random() * 50, face: -1, state: 'crawl', anim: 'walk' };
  },
};
