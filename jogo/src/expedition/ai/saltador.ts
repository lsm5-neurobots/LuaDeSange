// Saltador: mantém distância, agacha (aviso no chão onde vai cair) e salta ~4 tiles num bote.
// O sprite já sobe dentro do quadro durante o ar; aqui só move no x/y.
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { hurtF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

// além do salto: chute duplo de perto e bote baixo rasteiro em linha (aviso em faixa)
const MOVES: ZMove[] = [
  { anim: 'kick2', w: 3, max: 40, dy: 9, cd: 2.4, dmg: 1.3, push: 10, word: 'TÁ-TÁ!' },
  { anim: 'flipKick', w: 2, max: 42, dy: 9, cd: 3.5, dmg: 1.3, push: 20, word: 'VUPT!', lunge: [0, -20, 0, 30, 60, 20, 0, 0] }, // mortal com chute (novo)
  { anim: 'lowPounce', w: 2, min: 36, max: 92, dy: 8, cd: 4, dmg: 1.1, warn: 'lane', word: 'RASTEIRO!', lunge: [0, 0, 0, 260, 200, 40, 0, 0, 0] },
];

export const saltador: ZombieAI = {
  rest: 'keep',
  update(c) {
    const { z, w, dt } = c;
    const A = z.K.F.ANIMS.attack;
    tickMoves(z, dt);
    if (z.state === 'attack') { moveStep(c, MOVES); c.step(true); if (z.done) { endMove(w, z); z.state = 'keep'; z.cd = Math.max(z.cd, 0.9); setAnim(z, 'walk'); } return; }
    if (z.state === 'leap') {
      if ((A.air ?? [5, 6, 7]).includes(z.fi)) {
        const k = Math.min(1, dt * 7);
        z.x += (z.tx - z.x) * k; z.y = clampY(z.y + (z.ty - z.y) * k);
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'keep'; z.cd = 2.2; setAnim(z, 'walk'); }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (c.adx < 92 && z.cd <= 1.2 && (c.adx < 40 || Math.random() < 0.02)) { const m = pickMove(c, MOVES); if (m) { startMove(c, m); return; } }
    if (z.cd <= 0 && c.adx > 50 && c.adx < 150) {
      z.state = 'leap'; z.hitV = false; z.tx = c.V.x - z.face * 10; z.ty = c.V.y; setAnim(z, 'attack');
      w.warns.push({ kind: 'circle', x: z.tx, y: z.ty, r: 20, owner: z });
      return;
    }
    if (c.adx < 32 && Math.abs(c.dy) < 9 && z.cd <= 0.8) { z.cd = 0; return; } // perto demais: pula por cima no próximo ciclo
    const want = 100, mv = c.adx < want - 20 ? -1 : c.adx > want + 20 ? 1 : 0;
    const mvA = z.K.F.ANIMS.walk.mv as number[] | undefined;
    z.x += Math.sign(c.dx) * mv * 26 * (mvA ? mvA[z.fi] * 1.8 : 1) * dt;
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 14 * dt));
    setAnim(z, mv ? 'walk' : 'idle');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS.attack;
    if (z.anim !== 'attack') { moveFrame(c, fi, MOVES); return; }
    if (fi === (A.land ?? 8) || fi === (A.hitAt ?? 7)) {
      if (fi === (A.land ?? 8)) { w.shake = Math.max(w.shake, 0.12); w.warns = w.warns.filter((t) => t.owner !== z); }
      if (!z.hitV) for (const f of w.fs) {
        if (!f.down && Math.abs(f.x - z.x) < 30 && Math.abs(f.y - z.y) < 14) { z.hitV = true; hurtF(w, f, z.K.dmg * z.dmgMul); w.fx('burst', 'TCHAK!', f.x, f.y - 66); break; }
      }
    }
  },
  spawn(w, i, fromLeft) {
    return { x: fromLeft ? w.cam - 26 : w.cam + w.W + 26 + i * 16, y: 150 + Math.random() * 50, face: fromLeft ? 1 : -1, state: 'keep', anim: 'walk' };
  },
};
