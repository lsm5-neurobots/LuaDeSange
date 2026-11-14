// Cuspidor: mantém ~4 tiles de distância e cospe ácido em arco; a poça envenena quem pisa.
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { endMove, moveFrame, pickMove, startMove, tickMoves, type ZMove } from './moves';

// de perto (quando não dá pra recuar): jato de ácido em linha (acerta a fila) ou pancada com o papo inchado
const CLOSE: ZMove[] = [
  { anim: 'spitJet', w: 2, min: 16, max: 86, dy: 10, cd: 4.5, dmg: 1, area: true, warn: 'lane', word: 'FSSSH!' },
  { anim: 'bite', w: 2, max: 34, dy: 9, cd: 2, dmg: 1.1, word: 'NHAC!' }, // bote de mordida (novo)
  { anim: 'neckSlam', w: 3, max: 34, dy: 9, cd: 2.2, dmg: 1.2, push: 14, word: 'PLOFT!', shake: 0.08 },
];

const ACID: Record<string, string> = { comum: '#b8f53a', enluarado: '#5af0e0', plenilunar: '#e8f53a' };

export const cuspidor: ZombieAI = {
  rest: 'keep',
  update(c) {
    const { z, dt } = c;
    tickMoves(z, dt);
    if (z.state === 'attack') { c.step(true); if (z.done) { const far = z.anim === 'attack'; endMove(c.w, z); z.state = 'keep'; z.cd = far ? 2.6 : Math.max(z.cd, 0.9); setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (c.adx < 86 && z.cd <= 1.6) { const m = pickMove(c, CLOSE); if (m) { startMove(c, m); return; } }
    // chuva/neblina encurtam a visão do cuspidor (CLM-15)
    if (z.cd <= 0 && c.adx > 60 && c.adx < 170 * (c.w.alcCuspe ?? 1) && Math.abs(c.dy) < 16) { z.state = 'attack'; setAnim(z, 'attack'); return; }
    const want = 110, mv = c.adx < want - 20 ? -1 : c.adx > want + 20 ? 1 : 0;
    z.x += Math.sign(c.dx) * mv * 16 * dt;
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 10 * dt));
    setAnim(z, mv ? 'walk' : 'idle');
    c.step();
  },
  onFrame(c, fi) {
    const { z, V, w } = c;
    if (z.anim !== 'attack') {
      moveFrame(c, fi, CLOSE);
      // o jato deixa uma poça de ácido no fim da linha
      if (z.anim === 'spitJet' && fi === z.K.F.ANIMS.spitJet?.hit) w.pools.push({ x: z.x + z.face * 56, y: z.y, t: 0, c: ACID[z.form] || ACID.comum, dmg: 4 * z.dmgMul });
      return;
    }
    if (z.anim !== 'attack' || fi !== (z.K.F.ANIMS.attack.spitAt ?? 3)) return;
    const n = z.form === 'plenilunar' ? 3 : 1;
    for (let j = 0; j < n; j++) {
      const tx = V.x + (j - (n - 1) / 2) * 20, ty = clampY(V.y + (j - (n - 1) / 2) * 8);
      w.proj.push({ t: 0, d: 0.7, x0: z.x + z.face * 32, y0: z.y - 44, x1: tx, y1: ty, x: z.x + z.face * 32, y: z.y - 44, kind: 'acid', c: ACID[z.form] || ACID.comum, dmg: 6 * z.dmgMul });
    }
    w.fx('burst', 'PTUI!', z.x + z.face * 20, z.y - 70);
  },
  spawn(w, i) {
    return { x: w.cam + w.W + 26 + i * 20, y: 150 + Math.random() * 50, face: -1, state: 'keep', anim: 'walk' };
  },
};
