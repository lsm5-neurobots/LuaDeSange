// Chefe O Ascensorista (Pelourinho, topo do Elevador): cabines que caem em sequência (3; 5 na fúria) com aviso,
// porta pantográfica que prende (FECHOU), descida sem freio (some do quadro e cai no alvo, VULNERÁVEL depois) e
// pane: apaga a cena por 4 s (6 na fúria) e o próximo golpe dele causa +50%. "Ding" antes de cada golpe.
import type { ZombieAI } from './index';
import { aliveF, clampY, setAnim, spawnFx } from '../world';
import { addProp, hitCircle, hitLane, tickProps } from './bossProps';

const CD: Record<string, [number, number]> = { drop: [6, 4.5], door: [3, 2.4], blackout: [14, 11], plunge: [8, 6] };
function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; setAnim(z, mv); z.mcd[mv] = CD[mv][z.fury ? 1 : 0]; }
/** multiplicador do golpe (fúria ×1,3; depois da pane ×1,5 uma vez) */
function mul(z: any): number { const b = z.boost ? 1.5 : 1; z.boost = 0; return (z.fury ? 1.3 : 1) * b; }

function endBlackout(w: any, z: any): void { if (z.blackT > 0) { z.blackT = 0; w.fade = 0; } }

export const ascensorista: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.3 : 1;
    tickProps(w, z, dt);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = { blackout: 6 });
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    // pane: a cena escurece (o motor aplica w.fade por cima de tudo)
    if (z.blackT > 0) {
      z.blackT -= dt;
      w.fade = Math.max(0, Math.min(0.62, w.fade + dt * 3) * (z.blackT < 0.4 ? z.blackT / 0.4 : 1));
      if (Math.random() < (z.fury ? 0.5 : 0.25)) w.sparks.push({ x: z.x + (Math.random() - 0.5) * 30, y: z.y - 60 - Math.random() * 40, vx: (Math.random() - 0.5) * 80, vy: -20 - Math.random() * 60, t: 0, c: '#64baff' });
      if (z.blackT <= 0) endBlackout(w, z);
    }
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 22 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 120) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro' || z.state === 'rage') {
      const pf = z.fi; c.step();
      if (z.anim === 'intro' && z.fi !== pf && z.fi === 10) w.fx('burst', 'DING!', z.x, z.y - 120);
      if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'attack') {
      // descida sem freio: escondido acima do quadro, desliza até o alvo marcado
      if (z.mv === 'plunge') {
        const hid = z.anim === 'plunge' && z.fi >= 3 && z.fi <= 7;
        z.z = hid ? 220 : 0;
        if (hid) { z.x += Math.sign(z.tx - z.x) * Math.min(Math.abs(z.tx - z.x), 260 * dt); z.y = clampY(z.y + Math.sign(z.ty - z.y) * Math.min(Math.abs(z.ty - z.y), 120 * dt)); }
      }
      c.step(true);
      if (z.done) { z.vuln = false; z.z = 0; w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 0.8 : 1.3; setAnim(z, 'walk'); }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if (!mcd.blackout && !(z.blackT > 0) && Math.random() < 0.5) { start(z, 'blackout'); w.fx('bubble', 'PANE!', z.x, z.y - z.K.top * 0.55); return; }
      if (c.adx < 90 && ady < 28) {
        if (!mcd.plunge && Math.random() < 0.5) {
          start(z, 'plunge'); z.tx = V.x; z.ty = V.y;
          w.warns.push({ kind: 'circle', x: V.x, y: V.y, r: 54, owner: z }); w.fx('bubble', 'SEM FREIO!', z.x, z.y - z.K.top * 0.55);
          return;
        }
        if (!mcd.door) { start(z, 'door'); w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 110, y: z.y, owner: z }); w.fx('bubble', 'DING!', z.x, z.y - z.K.top * 0.55); return; }
      }
      if (c.adx > 120 && !mcd.drop) { start(z, 'drop'); w.fx('bubble', 'DING!', z.x, z.y - z.K.top * 0.55); return; }
      if (c.adx > 170 && !mcd.plunge) { start(z, 'plunge'); z.tx = V.x; z.ty = V.y; w.warns.push({ kind: 'circle', x: V.x, y: V.y, r: 54, owner: z }); return; }
    }
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 70), 13 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 11 * spdM * dt));
    setAnim(z, 'walk');
    const pf = z.fi;
    c.step();
    if (z.fi !== pf && (A.walk.stomp || []).includes(z.fi)) w.shake = Math.max(w.shake, 0.08);
  },
  onFrame(c, fi) {
    const { z, w, V } = c;
    const A = z.K.F.ANIMS, D = z.K.dmg;
    if (z.anim === 'drop' && fi === A.drop.throwAt) {
      w.shake = Math.max(w.shake, 0.2); w.fx('burst', 'DING!', z.x, z.y - 120);
      const m = mul(z), n = z.fury ? 5 : 3, fs = aliveF(w);
      for (let k = 0; k < n; k++) {
        const f = fs[k % Math.max(1, fs.length)] ?? V;
        const x = Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, (k === 0 ? V.x : f.x) + (k ? (Math.random() - 0.5) * 70 : 0))), y = clampY((k === 0 ? V.y : f.y) + (k ? (Math.random() - 0.5) * 30 : 0));
        const warn = { kind: 'circle' as const, x, y, r: 40 };
        w.warns.push(warn);
        addProp(w, z, 'cabin', {
          x0: x, y0: y, z0: 260, x1: x, y1: y, fly: 0.32, arc: 0, delay: 0.6 + k * 0.3, life: 1.2, warn,
          onLand: (p) => {
            w.shake = Math.max(w.shake, 0.4); w.fx('burst', 'CRASH!', p.x, p.y - 40); spawnFx(w, 'impactBig', p.x, p.y - 8, 1); spawnFx(w, 'rockBreak', p.x, p.y - 6);
            p.st = 1;
            hitCircle(w, p.x, p.y, 44, D * m, 0.6, 'TONTO', 0, p.x);
          },
        });
      }
    }
    if (z.anim === 'door' && fi === A.door.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.35; w.fx('burst', 'CLANG!', z.x + z.face * 70, z.y - 70);
      hitLane(w, z.x, z.x + z.face * 110, z.y, 20, D * mul(z), 0.8, 'FECHOU', 30, z.face);
    }
    if (z.anim === 'blackout' && fi === A.blackout.flickAt) {
      z.blackT = z.fury ? 6 : 4; z.boost = 1;
      // vigia: se o chefe cair no escuro, a luz volta (o update dele para de rodar)
      let n = 0;
      const iv = setInterval(() => { if (z.dead || !(z.blackT > 0) || ++n > 60) { if (z.dead && w.phase !== 'failed') w.fade = 0; clearInterval(iv); } }, 200);
      w.shake = 0.25; w.fx('burst', 'PANE!', z.x, z.y - 100); w.log(`${z.K.nome} apagou as luzes!`);
    }
    if (z.anim === 'plunge' && fi === A.plunge.hit) {
      const cx = z.x, cy = z.y;
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.6; w.fx('burst', 'SEM FREIO!', cx, cy - 50); spawnFx(w, 'impactBig', cx, cy - 8, z.face);
      for (let i = 0; i < 18; i++) w.sparks.push({ x: cx + (Math.random() - 0.5) * 60, y: cy, vx: (Math.random() - 0.5) * 150, vy: -30 - Math.random() * 90, t: 0, c: i % 3 ? '#a89878' : '#64baff' });
      hitCircle(w, cx, cy, 60, D * 1.2 * mul(z), 0.7, 'TONTO', 0, cx);
    }
    if (z.anim === 'plunge' && A.plunge.vuln?.includes(fi)) { z.vuln = true; if (fi === A.plunge.vuln[0]) w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top * 0.55 - 10); }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
