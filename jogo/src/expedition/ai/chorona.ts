// Mini boss A Chorona: lamento em cone que atordoa, avanço fantasma em linha (com aviso), arranhão de perto
// e chama 2 mortos do chão. Na fúria tudo fica mais rápido e ela chama mais vezes.
import type { ZombieAI } from './index';
import { clampY, setAnim, spawnFx } from '../world';
import { hurtF, stunF } from '../fighter';
import { mkZ } from '../combat';

const BUSY = ['wail', 'dash', 'claw', 'summon'];

export const chorona: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.3 : 1;
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 34 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 90) { if (A.intro) { z.state = 'intro'; setAnim(z, 'intro'); } else { z.state = 'walk'; z.cd = 1; } } return; }
    if (z.state === 'intro' || z.state === 'rage') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'dash') {
      if ((A.dash.run ?? [3, 4, 5, 6]).includes(z.fi)) {
        z.x += z.face * 260 * spdM * dt;
        z.x = Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, z.x));
        if (!z.hitV) for (const f of w.fs) if (!f.down && Math.abs(f.x - z.x) < 26 && Math.abs(f.y - z.y) < 14) {
          z.hitV = true; hurtF(w, f, z.K.dmg * (z.fury ? 1.3 : 1)); w.fx('burst', 'SHHHA!', f.x, f.y - 70);
        }
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 1.1 : 1.8; setAnim(z, 'walk'); }
      return;
    }
    if (BUSY.includes(z.state)) { c.step(true); if (z.done) { z.state = 'walk'; z.cd = z.fury ? 1 : 1.7; setAnim(z, 'walk'); } return; }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const calls = z.calls ?? 0, alive = w.zs.filter((o) => !o.dead && o !== z).length;
      if (alive < 2 && calls < (z.fury ? 3 : 2) && A.summon) { z.state = 'summon'; setAnim(z, 'summon'); return; }
      if (c.adx < 40 && Math.abs(c.dy) < 14) { z.state = 'claw'; setAnim(z, 'claw'); return; }
      if (c.adx < 110 && Math.abs(c.dy) < 26 && A.wail) {
        z.state = 'wail'; setAnim(z, 'wail');
        w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 110, y: z.y, owner: z });
        return;
      }
      if (Math.abs(c.dy) < 14 && c.adx > 60) {
        z.state = 'dash'; z.hitV = false; setAnim(z, 'dash');
        w.warns.push({ kind: 'lane', x0: z.x, x1: z.face > 0 ? w.cam + w.W : w.cam, y: z.y, owner: z });
        return;
      }
    }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 36), 22 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 16 * spdM * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1;
    if (z.anim === 'claw' && fi === (A.claw.hit ?? 4)) {
      for (const f of w.fs) if (!f.down && Math.abs(f.x - (z.x + z.face * 30)) < 32 && Math.abs(f.y - z.y) < 14) { hurtF(w, f, z.K.dmg * 0.8 * m); w.fx('burst', 'SCRATCH!', f.x, f.y - 66); }
    }
    if (z.anim === 'wail' && fi === (A.wail.screamAt ?? 4)) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.25; w.fx('burst', 'UUUAAAAHH!', z.x + z.face * 30, z.y - z.K.top);
      for (const f of w.fs) {
        const ddx = (f.x - z.x) * z.face;
        if (!f.down && ddx > -10 && ddx < 120 && Math.abs(f.y - z.y) < 18 + ddx * 0.25) { hurtF(w, f, 8 * m); stunF(w, f, z.fury ? 1.1 : 0.8, 'ATORDOADO'); }
      }
    }
    if (z.anim === 'summon' && fi === (A.summon.callAt ?? 6)) {
      z.calls = (z.calls ?? 0) + 1;
      for (let j = 0; j < 2; j++) {
        const x = Math.max(w.cam + 30, Math.min(w.cam + w.W - 30, z.x + (j ? 70 : -70)));
        const y = clampY(z.y + (j ? 16 : -16));
        mkZ(w, 'rastejante', x, y, (z.x > x ? 1 : -1) as 1 | -1, 'crawl', 'walk');
        spawnFx(w, 'rockBreak', x, y - 4); spawnFx(w, 'dust', x, y, 1); // sai da terra rachando o chão
      }
      w.fx('burst', 'LEVANTEM!', z.x, z.y - z.K.top);
      w.log(`${z.K.nome} chamou os mortos do chão`);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
