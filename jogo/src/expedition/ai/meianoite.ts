// Chefe Boneco da Meia-Noite: pisão em área (fica vulnerável depois), giro dos braços de pano (dano contínuo
// em volta, avançando) e badaladas do relógio (3 ondas no chão em linha). Passos tremem a tela.
import type { ZombieAI } from './index';
import { clampY, setAnim, spawnFx } from '../world';
import { hurtF, stunF } from '../fighter';

const BUSY = ['stomp', 'spin', 'clock'];

export const meianoite: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.3 : 1;
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 22 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 110) { if (A.intro) { z.state = 'intro'; setAnim(z, 'intro'); } else { z.state = 'walk'; z.cd = 1; } } return; }
    if (z.state === 'intro' || z.state === 'rage') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'spin') {
      if ((A.spin.run ?? []).includes(z.fi)) {
        z.x += Math.sign(c.dx) * 40 * spdM * dt;
        z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 14 * dt));
        z.spinT = (z.spinT ?? 0) + dt;
        if (z.spinT > 0.28) {
          z.spinT = 0;
          for (const f of w.fs) if (!f.down && Math.hypot(f.x - z.x, (f.y - z.y) * 2) < 70) { hurtF(w, f, 7 * (z.fury ? 1.3 : 1)); f.x += Math.sign(f.x - z.x || 1) * 14; }
        }
      }
      c.step(true);
      if (z.done) { z.state = 'walk'; z.cd = z.fury ? 1.1 : 1.8; setAnim(z, 'walk'); }
      return;
    }
    if (BUSY.includes(z.state)) { c.step(true); if (z.done) { z.vuln = false; w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 1 : 1.6; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      if (c.adx < 90 && Math.abs(c.dy) < 28) {
        if (Math.random() < 0.5) {
          z.state = 'stomp'; setAnim(z, 'stomp');
          w.warns.push({ kind: 'circle', x: z.x + z.face * 40, y: z.y, r: 54, owner: z });
          w.fx('bubble', '!', z.x, z.y - z.K.top - 6);
        } else { z.state = 'spin'; z.spinT = 0; setAnim(z, 'spin'); w.fx('bubble', 'BOOOM-BOOOM!', z.x, z.y - z.K.top); }
        return;
      }
      if (c.adx > 120) {
        z.state = 'clock'; setAnim(z, 'clock');
        w.warns.push({ kind: 'lane', x0: z.x, x1: z.face > 0 ? w.cam + w.W : w.cam, y: z.y, owner: z });
        return;
      }
    }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 70), 13 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 11 * spdM * dt));
    setAnim(z, 'walk');
    const pf = z.fi;
    c.step();
    if (z.fi !== pf && (A.walk.stomp || []).includes(z.fi)) w.shake = Math.max(w.shake, 0.1);
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1;
    if (z.anim === 'stomp' && fi === A.stomp.hit) {
      const cx = z.x + z.face * 40, cy = z.y;
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.5; w.fx('burst', 'BUMMM!', cx, cy - 40);
      spawnFx(w, 'impactBig', cx, cy - 8, z.face);
      for (let i = 0; i < 22; i++) w.sparks.push({ x: cx + (Math.random() - 0.5) * 60, y: cy, vx: (Math.random() - 0.5) * 140, vy: -30 - Math.random() * 90, t: 0, c: '#a89878' });
      for (const f of w.fs) if (!f.down && Math.hypot(f.x - cx, (f.y - cy) * 2) < 60) { hurtF(w, f, 30 * m); stunF(w, f, 0.5, 'TONTO'); }
    }
    if (z.anim === 'stomp' && A.stomp.vuln?.includes(fi)) { z.vuln = true; if (fi === A.stomp.vuln[0]) w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top - 10); }
    if (z.anim === 'clock' && (A.clock.ringAt ?? []).includes(fi)) {
      w.shake = Math.max(w.shake, 0.22);
      w.fx('burst', 'DOOONG!', z.x, z.y - z.K.top * 0.6);
      // onda no chão correndo pela linha: poeira ao longo dela e dano em quem está na frente
      for (let k = 1; k <= 4; k++) spawnFx(w, 'dustRun', z.x + z.face * k * 50, z.y, z.face);
      for (const f of w.fs) {
        const ddx = (f.x - z.x) * z.face;
        if (!f.down && ddx > 0 && Math.abs(f.y - z.y) < 14) { hurtF(w, f, 12 * m); f.x += z.face * 16; }
      }
      if (fi === (A.clock.ringAt ?? [])[2]) w.warns = w.warns.filter((t) => t.owner !== z);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
