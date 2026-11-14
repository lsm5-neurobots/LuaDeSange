// Chefe O Açougueiro: cutelada em área com aviso (fica vulnerável depois) e gancho que puxa de longe.
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { hurtF } from '../fighter';

export const acougueiro: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.35 : 1;
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(true); z.x -= 26 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 100) { if (A.intro) { z.state = 'intro'; setAnim(z, 'intro'); } else { z.state = 'walk'; z.cd = 1; } } return; }
    if (z.state === 'intro') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; } // pose de chefe depois do WARNING
    if (z.state === 'rage') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') { c.step(true); if (z.done) { z.vuln = false; z.state = 'walk'; z.cd = z.fury ? 1 : 1.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'hook') { c.step(true); if (z.done) { z.state = 'walk'; z.cd = z.fury ? 1.2 : 2; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0 && c.adx < 80 && Math.abs(c.dy) < 26) {
      z.state = 'attack'; setAnim(z, 'attack');
      w.warns.push({ kind: 'circle', x: z.x + z.face * 58, y: z.y, r: 40, owner: z });
      w.fx('bubble', '!', z.x, z.y - z.K.top - 6);
      return;
    }
    if (z.cd <= 0 && c.adx > 110 && Math.abs(c.dy) < 16) { z.state = 'hook'; setAnim(z, 'hook'); return; }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 60), 15 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 12 * spdM * dt));
    setAnim(z, 'walk');
    const pf = z.fi;
    c.step();
    if (z.fi !== pf && (A.walk.stomp || []).includes(z.fi)) w.shake = Math.max(w.shake, 0.08);
  },
  onFrame(c, fi) {
    const { z, V, w } = c;
    const A = z.K.F.ANIMS;
    if (z.anim === 'attack' && fi === A.attack.hit) {
      const cx = z.x + z.face * 58, cy = z.y;
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.45;
      w.fx('burst', 'KRAAASH!', cx, cy - 40);
      for (let i = 0; i < 20; i++) w.sparks.push({ x: cx + (Math.random() - 0.5) * 40, y: cy, vx: (Math.random() - 0.5) * 120, vy: -30 - Math.random() * 80, t: 0, c: '#b8a8a0' });
      for (const f of w.fs) if (!f.down && Math.hypot(f.x - cx, (f.y - cy) * 2) < 46) hurtF(w, f, 28 * (z.fury ? 1.3 : 1));
    }
    if (z.anim === 'attack' && A.attack.vuln?.includes(fi)) { z.vuln = true; if (fi === A.attack.vuln[0]) w.fx('tag', 'VULNERÁVEL 0,6 s', z.x, z.y - z.K.top - 10); }
    if (z.anim === 'hook' && fi === A.hook.throwAt) {
      w.proj.push({ t: 0, d: 0.45, x0: z.x + z.face * 30, y0: z.y - 90, x1: V.x, y1: V.y, x: z.x, y: z.y - 90, kind: 'hook', owner: z, dmg: 10 });
    }
    void clampY;
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
