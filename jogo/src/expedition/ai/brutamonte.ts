// Mini boss Brutamonte: investida em linha com aviso (bate na borda = atordoado) e arremesso de entulho.
import type { ZombieAI } from './index';
import { clampY, setAnim } from '../world';
import { hurtF } from '../fighter';

export const brutamonte: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, V, w, dt } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.3 : 1;
    if (z.state === 'enter') { c.step(); z.x -= 30 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 90) { if (A.intro) { z.state = 'intro'; setAnim(z, 'intro'); } else { z.state = 'walk'; z.cd = 1.2; } } return; }
    if (z.state === 'intro') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.8; setAnim(z, 'walk'); } return; } // pose de chefe depois do WARNING
    if (z.state === 'charge') {
      if (A.charge.run.includes(z.fi)) {
        z.x += z.face * 230 * spdM * dt;
        if (!z.hitV) for (const f of w.fs) {
          if (!f.down && Math.abs(f.x - z.x) < 30 && Math.abs(f.y - z.y) < 16) { z.hitV = true; hurtF(w, f, z.K.dmg * (z.fury ? 1.3 : 1)); w.fx('burst', 'BAM!', f.x, f.y - 70); f.x += z.face * 24; w.shake = 0.35; }
        }
        if (z.x < w.cam + 30 || z.x > w.cam + w.W - 30) {
          z.x = Math.max(w.cam + 30, Math.min(w.cam + w.W - 30, z.x));
          w.warns = w.warns.filter((t) => t.owner !== z);
          if (!z.hitV) {
            z.state = 'dazed'; setAnim(z, 'dazed');
            w.fx('burst', 'BAM!', z.x + z.face * 20, z.y - 120); w.fx('tag', 'ATORDOADO', z.x, z.y - z.K.top - 10);
            w.shake = 0.4; w.log(`${z.K.nome} bateu na borda e ficou atordoado`);
            return;
          }
        }
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 1.4 : 2.2; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'dazed') {
      c.step();
      if (z.done) { z.dazedN = (z.dazedN || 0) + 1; if (z.dazedN >= 2) { z.dazedN = 0; z.state = 'walk'; setAnim(z, 'walk'); z.cd = 1; } else { z.fi = 0; z.done = false; } }
      return;
    }
    if (z.state === 'throw') { c.step(true); if (z.done) { z.state = 'walk'; z.cd = z.fury ? 1.2 : 2; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      if (Math.abs(c.dy) < 14 && c.adx > 50) {
        z.state = 'charge'; z.hitV = false; setAnim(z, 'charge');
        w.warns.push({ kind: 'lane', x0: z.x, x1: z.face > 0 ? w.cam + w.W : w.cam, y: z.y, owner: z });
        w.fx('bubble', 'GRRRAAH!', z.x, z.y - z.K.top);
        return;
      }
      if (c.adx > 110) { z.state = 'throw'; z.tx = V.x; z.ty = V.y; setAnim(z, 'throw'); w.warns.push({ kind: 'circle', x: V.x, y: V.y, r: 24, owner: z }); return; }
    }
    if (c.adx < 40 && Math.abs(c.dy) < 16 && z.cd <= 0.6) {
      z.state = 'charge'; z.hitV = false; setAnim(z, 'charge'); z.fi = 4;
      w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 120, y: z.y, owner: z });
      return;
    }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 50), 16 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 14 * spdM * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    if (z.anim === 'throw' && fi === z.K.F.ANIMS.throw.toss) {
      w.proj.push({ t: 0, d: 0.9, x0: z.x + z.face * 30, y0: z.y - 150, x1: z.tx, y1: z.ty, x: z.x, y: z.y - 150, kind: 'rock', dmg: 18 * (z.fury ? 1.3 : 1) });
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
