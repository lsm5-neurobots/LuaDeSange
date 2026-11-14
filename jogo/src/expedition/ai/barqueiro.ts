// Zumbi Barqueiro (IA-30, variante local do Ver-o-Peso): controla o espaço com o remo.
// - Mantém ~44 px (a ponta do remo): remada de cima pra baixo com alcance longo, varrida rente ao chão (acerta a
//   fila) e rede de longe (prende 1 s; 1,3 s no plenilunar). Colado demais: empurrão com o cabo pra abrir espaço.
// - A remada e a varrida deixam poça de lodo onde a pá bate (veneno leve, como a poça do Cuspidor).
import type { ZombieAI } from './index';
import { clampY, setAnim, spawnFx, type Zombie } from '../world';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

const base: ZMove[] = [
  { anim: 'attack', w: 3, min: 14, max: 54, dy: 9, cd: 2.2, dmg: 1.1, push: 24, area: true, word: 'SPLASH!', warn: 'lane', shake: 0.1 },
  { anim: 'sweep', w: 2, max: 50, dy: 12, cd: 3.6, dmg: 0.9, push: 18, area: true, word: 'VUUSH!', warn: 'lane' },
  { anim: 'net', w: 2.5, min: 40, max: 74, dy: 12, cd: 6, dmg: 0.5, stun: 1, stunTag: 'PRESO', word: 'REDE!', warn: 'lane' },
  { anim: 'shove', w: 2, max: 30, dy: 9, cd: 2, dmg: 0.7, push: 22, word: 'SAI!' },
];
const plen: ZMove[] = base.map((m) => (m.anim === 'net' ? { ...m, stun: 1.3 } : m));
const movesOf = (z: Zombie) => (z.form === 'plenilunar' ? plen : base);

export const LODO: Record<string, string> = { comum: '#7ec89a', enluarado: '#7af4ff', plenilunar: '#e2483a' };

export const barqueiro: ZombieAI = {
  rest: 'chase',
  update(c) {
    const { z, w, dt } = c, MV = movesOf(z);
    tickMoves(z, dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') { moveStep(c, MV); c.step(true); if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = 0.7; setAnim(z, 'idle'); } return; }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) { z.state = 'chase'; setAnim(z, 'walk'); } return; }
    if (c.adx < 76 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MV); if (mv) { startMove(c, mv); return; } }
    // colado e sem golpe pronto: recua um passo (o remo precisa de espaço)
    if (c.adx < 22 && Math.abs(c.dy) < 10) {
      z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
      z.x -= z.face * 14 * dt; z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x));
      z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 8 * dt));
      setAnim(z, 'walk'); c.step(); return;
    }
    setAnim(z, 'walk');
    c.chase(17, 44);
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS[z.anim];
    if ((z.anim === 'attack' || z.anim === 'sweep') && fi === A?.hit) {
      const x = z.x + z.face * 46;
      spawnFx(w, 'dust', x, z.y, z.face);
      w.pools.push({ x, y: z.y, t: 0, c: LODO[z.form] || LODO.comum, dmg: 3 * z.dmgMul, slow: z.form === 'plenilunar' ? 0.35 : 0.25 });
    }
    moveFrame(c, fi, movesOf(z));
  },
};
