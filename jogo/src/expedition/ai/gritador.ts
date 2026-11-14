// Gritador: foge de quem chega perto e, de longe, grita no megafone chamando 2 errantes (no máximo 2 vezes).
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { mkZ } from '../combat';
import { endMove, moveFrame, pickMove, startMove, tickMoves, type ZMove } from './moves';

// encurralado (colado no lutador): empurrão desesperado pra abrir espaço ou grito curto que atordoa quem está perto
const CLOSE: ZMove[] = [
  { anim: 'shove', w: 3, max: 32, dy: 9, cd: 2.5, dmg: 0, flat: 4, push: 30, word: 'SAI!' },
  { anim: 'scratch', w: 2, max: 32, dy: 9, cd: 2.6, dmg: 0, flat: 5, push: 10, word: 'SAI DAQUI!' }, // unhada (novo)
  { anim: 'shriek', w: 2, max: 46, dy: 12, cd: 6, dmg: 0, flat: 3, around: 50, stun: 0.8, stunTag: 'ATORDOADO', word: 'IIIIH!', shake: 0.1 },
];

export const gritador: ZombieAI = {
  rest: 'keep',
  update(c) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    if (z.state === 'attack') { c.step(true); if (z.done) { const call = z.anim === 'attack'; endMove(w, z); z.state = 'keep'; if (call) z.cd = 5; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (c.adx < 46) { const m = pickMove(c, CLOSE); if (m) { startMove(c, m); return; } }
    const calls = z.calls ?? 0;
    if (z.cd <= 0 && calls < 2 && c.adx > 70) { z.state = 'attack'; setAnim(z, 'attack'); return; }
    if (c.adx < 70) { // pânico: foge pro lado oposto (sem sair da tela)
      setAnim(z, 'flee');
      z.x -= Math.sign(c.dx) * 34 * dt;
      z.x = Math.max(w.cam + 18, Math.min(w.cam + w.W - 18, z.x));
      z.y = clampY(z.y - Math.sign(c.dy) * 10 * dt);
      c.step(); return;
    }
    if (calls >= 2) { setAnim(z, 'walk'); c.chase(17, 24); if (c.adx < 30 && Math.abs(c.dy) < 9) z.cd = 0.5; return; }
    setAnim(z, 'idle'); c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    if (z.anim !== 'attack') { moveFrame(c, fi, CLOSE); return; }
    if (fi !== (z.K.F.ANIMS.attack.screamAt ?? 5)) return;
    z.calls = (z.calls ?? 0) + 1;
    w.fx('burst', 'AAAAAAH!', z.x, z.y - z.K.top - 4);
    w.shake = Math.max(w.shake, 0.12);
    for (let j = 0; j < 2; j++) {
      const left = j === 0;
      mkZ(w, 'errante', left ? w.cam - 26 : w.cam + w.W + 26, clampY(150 + Math.random() * 50), left ? 1 : -1, 'chase', 'walk');
    }
    w.log(`${z.K.nome} gritou e chamou a horda`);
  },
  spawn(w, i) {
    return { x: w.cam + w.W + 24 + i * 14, y: 150 + Math.random() * 50, face: -1, state: 'keep', anim: 'walk' };
  },
};
