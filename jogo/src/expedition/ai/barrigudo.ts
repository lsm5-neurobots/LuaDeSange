// Barrigudo: lento, dá barrigada de perto, arrota gás venenoso de média distância e EXPLODE ao morrer (dano em área).
import type { ZombieAI } from './index';
import { setAnim } from '../world';
import { hurtF } from '../fighter';
import { spawnFx } from '../world';
import { endMove, moveFrame, pickMove, startMove, tickMoves, type ZMove } from './moves';

// repertório de perto: barrigada (empurra), pisão em área (aviso em círculo) e vômito em cone (aviso em faixa, deixa poça)
const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 36, dy: 10, cd: 0, dmg: 1, push: 18, word: 'BLOMP!' },
  { anim: 'bellyFlop', w: 1.6, max: 48, dy: 12, cd: 6, dmg: 1.6, around: 44, warn: 'circle', word: 'BLOFT!', shake: 0.18, lunge: [0, 40, 60, 60, 40, 0, 0, 0] }, // barrigada voadora (novo)
  { anim: 'stomp', w: 2, max: 40, dy: 14, cd: 4, dmg: 1.4, around: 46, warn: 'circle', word: 'TUMMM!', shake: 0.18 },
  { anim: 'vomit', w: 2, min: 18, max: 70, dy: 12, cd: 5, dmg: 0.9, area: true, warn: 'lane', word: 'BLEAAARGH!' },
];

export const barrigudo: ZombieAI = {
  rest: 'chase',
  update(c) {
    const { z } = c;
    tickMoves(z, c.dt);
    if (z.state === 'attack' || z.state === 'burp') { c.step(true); if (z.done) { endMove(c.w, z); z.cd = z.state === 'burp' ? 3 : 1.1; z.state = 'chase'; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (c.adx < 70 && Math.abs(c.dy) < 14 && z.cd <= 0) { const m = pickMove(c, MOVES); if (m) { startMove(c, m); return; } }
    if (c.adx > 50 && c.adx < 90 && Math.abs(c.dy) < 14 && z.cd <= 0 && z.K.F.ANIMS.burp && Math.random() < 0.02) { z.state = 'burp'; setAnim(z, 'burp'); return; }
    setAnim(z, 'walk');
    c.chase(13, 28);
  },
  onFrame(c, fi) {
    const { z, V, w } = c;
    const A = z.K.F.ANIMS;
    moveFrame(c, fi, MOVES);
    if (z.anim === 'stomp' && fi === A.stomp?.hit) spawnFx(w, 'dust', z.x + z.face * 10, z.y, z.face);
    if (z.anim === 'vomit' && fi === A.vomit?.hit) for (let j = 0; j < 2; j++) w.pools.push({ x: z.x + z.face * (34 + j * 22), y: z.y, t: 0, c: '#9ad83a', dmg: 4 * z.dmgMul });
    if (z.anim === 'burp' && fi === (A.burp?.gasAt ?? 3)) {
      for (let j = 0; j < 3; j++) w.pools.push({ x: z.x + z.face * (28 + j * 18), y: z.y + (j - 1) * 4, t: 0, c: '#9ad83a', dmg: 5 * z.dmgMul });
      w.fx('burst', 'BUUURP!', z.x + z.face * 20, z.y - 80);
    }
    if (z.anim === 'explode' && fi === (A.explode?.boomAt ?? 6)) {
      w.shake = 0.4;
      spawnFx(w, 'impactBig', z.x, z.y - 40, z.face);
      w.fx('burst', 'KABUUM!', z.x, z.y - 90);
      for (let i = 0; i < 24; i++) w.sparks.push({ x: z.x, y: z.y - 30, vx: (Math.random() - 0.5) * 180, vy: -40 - Math.random() * 110, t: 0, c: i % 2 ? '#9ad83a' : '#7a1020' });
      for (const f of w.fs) if (!f.down && Math.hypot(f.x - z.x, (f.y - z.y) * 2) < 54) hurtF(w, f, 22 * z.dmgMul);
      for (const o of w.zs) if (o !== z && !o.dead && Math.hypot(o.x - z.x, (o.y - z.y) * 2) < 54) { o.hp -= 30; o.flash = 0.05; }
    }
  },
};
