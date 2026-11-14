// Mini boss O Vendedor de Fitas (Pelourinho, Terreiro de Jesus): laço de fitas que prende (PRESO 1 s; 1,3 na fúria),
// chicote de fitas em arco, chuva de fitas (3 poças de lentidão de 25% por 5 s) e corrida pela linha (só na fúria).
// Mais ágil que a Chorona: circula o squad pela borda.
import type { ZombieAI } from './index';
import { aliveF, clampY, setAnim } from '../world';
import { hurtF, stunF } from '../fighter';
import { addProp, hitCircle, hitLane, propsOf, tickProps } from './bossProps';

const CD: Record<string, [number, number]> = { lasso: [4, 3], whip: [2.5, 2], rain: [7, 5], dash: [5, 3.6] };
function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; setAnim(z, mv); z.mcd[mv] = CD[mv][z.fury ? 1 : 0]; }

export const vendedorfitas: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const spdM = z.fury ? 1.3 : 1, D = z.K.dmg;
    tickProps(w, z, dt);
    // laço em voo: prende o primeiro lutador que tocar
    for (const p of propsOf(w)) if (p.owner === z && p.kind === 'lasso' && !p.landed && !p.hitDone && p.delay <= 0) for (const f of aliveF(w)) {
      if (Math.abs(f.x - p.x) > 14 || Math.abs(f.y - p.y) > 14) continue;
      p.hitDone = true; hurtF(w, f, D * 0.6 * spdM); stunF(w, f, z.fury ? 1.3 : 1, 'PRESO'); w.fx('burst', 'LAÇO!', f.x, f.y - 70);
      p.x1 = p.x; p.x0 = p.x; break;
    }
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 34 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 90) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro' || z.state === 'rage') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') {
      if (z.mv === 'dash' && (z.K.F.ANIMS.dash.run ?? []).includes(z.fi)) {
        z.x += z.face * 240 * dt; z.x = Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, z.x));
        if (!z.hitV) for (const f of aliveF(w)) if (Math.abs(f.x - z.x) < 22 && Math.abs(f.y - z.y) < 14) { z.hitV = true; hurtF(w, f, D * 1.3 * spdM); f.x += z.face * 20; w.fx('burst', 'VUUUM!', f.x, f.y - 70); }
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 0.7 : 1.1; setAnim(z, 'walk'); }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if (c.adx < 70 && ady < 22 && !mcd.whip) { start(z, 'whip'); w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 90, y: z.y, owner: z }); return; }
      if (z.fury && ady < 14 && c.adx > 60 && !mcd.dash) { start(z, 'dash'); z.hitV = false; w.warns.push({ kind: 'lane', x0: z.x, x1: z.face > 0 ? w.cam + w.W : w.cam, y: z.y, owner: z }); return; }
      if (c.adx > 60 && c.adx < 170 && ady < 16 && !mcd.lasso) { start(z, 'lasso'); z.tx = V.x; z.ty = V.y; w.warns.push({ kind: 'lane', x0: z.x + z.face * 20, x1: z.x + z.face * Math.min(160, c.adx + 20), y: z.y, owner: z }); w.fx('bubble', 'LAÇO!', z.x, z.y - z.K.top * 0.55); return; }
      if (!mcd.rain && c.adx > 50) {
        start(z, 'rain'); const fs = aliveF(w); z.spots = [];
        for (let k = 0; k < 3; k++) { const f = fs[k % fs.length]; const x = Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, f.x + (k >= fs.length ? (Math.random() - 0.5) * 60 : 0))), y = clampY(f.y + (k >= fs.length ? (Math.random() - 0.5) * 20 : 0)); z.spots.push([x, y]); w.warns.push({ kind: 'circle', x, y, r: 28, owner: z }); }
        w.fx('bubble', 'CHUVA!', z.x, z.y - z.K.top * 0.55);
        return;
      }
    }
    // circula: mantém ~50 de distância, deslizando pela linha do alvo
    const want = c.adx > 60 ? 1 : c.adx < 40 ? -1 : 0;
    z.x += Math.sign(c.dx) * want * 22 * spdM * dt;
    z.x = Math.max(w.cam + 20, Math.min(w.cam + w.W - 20, z.x));
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 16 * spdM * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1, D = z.K.dmg;
    if (z.anim === 'lasso' && fi === A.lasso.throwAt) {
      const tx = z.x + z.face * Math.min(160, Math.max(60, Math.abs(z.tx - z.x))), y = z.y;
      addProp(w, z, 'lasso', {
        x0: z.x + z.face * 24, y0: y, z0: 70, x1: tx, y1: y, fly: 0.5, arc: 0, life: 0.15,
        onLand: () => { w.warns = w.warns.filter((t) => t.owner !== z); },
      });
    }
    if (z.anim === 'whip' && fi === A.whip.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.2; w.fx('burst', 'ZIIP!', z.x + z.face * 50, z.y - 70);
      hitLane(w, z.x, z.x + z.face * 90, z.y, 18, D * m, 0, '', 20, z.face);
    }
    if (z.anim === 'rain' && fi === A.rain.callAt) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      for (const [x, y] of z.spots ?? []) {
        addProp(w, z, 'pool', { x0: z.x, y0: z.y, z0: 120, x1: x, y1: y, fly: 0.5, arc: 50, life: 5,
          onLand: (p) => { hitCircle(w, p.x, p.y, 28, D * 0.3 * m); } });
      }
      w.fx('burst', 'CHUVA!', z.x, z.y - 100);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};

