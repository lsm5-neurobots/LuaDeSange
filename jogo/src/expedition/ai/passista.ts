// Mini boss A Passista (Lapa, Circo Voador): giro de plumas em área que empurra e a deixa TONTA 1,5 s (dano ×1,6),
// pisão de salto com aviso no chão (atordoa), chuva de lantejoulas em leque (rajadas que ofuscam + poças que deixam
// lento 25% por 4 s) e avanço sambando pela linha. Fúria (<50%): chama lunar nas plumas, 1,3× mais rápida, giro duplo,
// pisão com onda, 5 rajadas, e chama a ala (2 Malandros) logo depois de entrar em fúria (+1 vez se a ala cair).
import type { ZombieAI } from './index';
import { REGISTRY } from './index';
import { aliveF, clampY, setAnim, spawnFx } from '../world';
import { hurtF } from '../fighter';
import { mkZ } from '../combat';
import { addProp, hitCircle, tickProps } from './bossProps';

/** cooldowns [normal, fúria] em s */
export const PAS_CD: Record<string, [number, number]> = { spin: [6, 4.5], stomp: [3, 2.4], rain: [7, 5], dash: [5, 3.5], summon: [10, 10] };
export const PAS = { spinR: 70, spinPush: 34, dazeT: 1.5, stompR: 36, stompRing: 64, rainR: 24, poolLife: 4, blindT: 0.5 };

function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; z.anim = ''; setAnim(z, mv); z.mcd[mv] = PAS_CD[mv][z.fury ? 1 : 0]; }
const clampX = (w: any, x: number) => Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, x));

export const passista: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const spdM = z.fury ? 1.3 : 1, D = z.K.dmg;
    tickProps(w, z, dt);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 36 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 90) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'rage') {
      c.step();
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); if (!(z.alaN > 0) && w.zk.malandro) { start(z, 'summon'); return; } z.state = 'walk'; z.cd = 0.5; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'dazed') { // tonta depois do giro: janela de dano
      z.dazeT -= dt; c.step();
      if (z.done) { z.fi = 0; z.done = false; z.acc = 0; }
      if (z.dazeT <= 0) { z.state = 'walk'; z.cd = 0.4; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'attack') {
      if (z.mv === 'dash' && (z.K.F.ANIMS.dash.run ?? []).includes(z.fi)) {
        z.x = clampX(w, z.x + z.face * 230 * spdM * dt);
        if (!z.hitV) for (const f of aliveF(w)) if (Math.abs(f.x - z.x) < 24 && Math.abs(f.y - z.y) < 14) { z.hitV = true; hurtF(w, f, D * 1.1 * spdM, { push: 22 }); f.x += z.face * 22; w.fx('burst', 'SAMBA!', f.x, f.y - 70); }
      }
      c.step(true);
      if (z.done) {
        w.warns = w.warns.filter((t) => t.owner !== z);
        if (z.mv === 'spin') { z.state = 'dazed'; z.dazeT = PAS.dazeT; setAnim(z, 'dazed'); w.fx('tag', 'TONTA!', z.x, z.y - z.K.top * 0.6); w.log(`${z.K.nome} ficou tonta: bata agora!`); return; }
        z.state = 'walk'; z.cd = z.fury ? 0.6 : 1; setAnim(z, 'walk');
      }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      const alaVivos = w.zs.some((o) => !o.dead && o.kind === 'malandro');
      if (z.fury && (z.alaN ?? 0) < 2 && !alaVivos && !mcd.summon && w.zk.malandro) { start(z, 'summon'); return; }
      if (c.adx < 62 && ady < 30 && !mcd.spin) { start(z, 'spin'); w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: PAS.spinR, owner: z }); w.fx('bubble', 'GIRA!', z.x, z.y - z.K.top * 0.55); return; }
      if (c.adx < 74 && ady < 22 && !mcd.stomp) {
        start(z, 'stomp'); z.sx = clampX(w, z.x + z.face * 32); z.sy = z.y;
        w.warns.push({ kind: 'circle', x: z.sx, y: z.sy, r: PAS.stompR, owner: z });
        if (z.fury) w.warns.push({ kind: 'circle', x: z.sx, y: z.sy, r: PAS.stompRing, owner: z });
        return;
      }
      if (ady < 14 && c.adx > 70 && !mcd.dash) { start(z, 'dash'); z.hitV = false; w.warns.push({ kind: 'lane', x0: z.x, x1: z.face > 0 ? w.cam + w.W : w.cam, y: z.y, owner: z }); return; }
      if (!mcd.rain && c.adx > 50 && c.adx < 200) {
        start(z, 'rain'); const n = z.fury ? 5 : 3; z.spots = [];
        for (let k = 0; k < n; k++) {
          const u = k / (n - 1) - 0.5;
          const x = k === Math.floor(n / 2) ? clampX(w, V.x) : clampX(w, z.x + z.face * (60 + 70 * (1 - Math.abs(u)) + Math.random() * 20));
          const y = k === Math.floor(n / 2) ? clampY(V.y) : clampY(z.y + u * 70);
          z.spots.push([x, y]); w.warns.push({ kind: 'circle', x, y, r: PAS.rainR, owner: z });
        }
        w.fx('bubble', 'BRILHA!', z.x, z.y - z.K.top * 0.55);
        return;
      }
    }
    // circula: mantém ~55 do alvo, deslizando pela linha dele (ginga de lado)
    const want = c.adx > 64 ? 1 : c.adx < 42 ? -1 : 0;
    z.x = clampX(w, z.x + Math.sign(c.dx) * want * 26 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 18 * spdM * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1, D = z.K.dmg;
    if (z.anim === 'spin' && (fi === A.spin.hit || (z.fury && fi === A.spin.hit2))) {
      const first = fi === A.spin.hit;
      if (first) w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = Math.max(w.shake, 0.2); w.fx('burst', first ? 'FRUUU!' : 'DE NOVO!', z.x, z.y - 90);
      hitCircle(w, z.x, z.y, PAS.spinR, D * (first ? 1 : 0.7) * m, 0, '', PAS.spinPush, z.x);
      for (let i = 0; i < 10; i++) w.sparks.push({ x: z.x + (Math.random() - 0.5) * 120, y: z.y - 20 - Math.random() * 60, vx: (Math.random() - 0.5) * 160, vy: -20 - Math.random() * 40, t: 0, c: ['#e486b8', '#e0a04a', '#4cb4a8'][i % 3] });
    }
    if (z.anim === 'stomp' && fi === A.stomp.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.3; w.fx('burst', 'TÁ!', z.sx, z.sy - 50);
      spawnFx(w, 'rockBreak', z.sx, z.sy - 4); spawnFx(w, 'dust', z.sx, z.sy, z.face);
      const hit = hitCircle(w, z.sx, z.sy, PAS.stompR, D * 1.2 * m, 0.5, 'ATORDOADO');
      if (z.fury) for (const f of aliveF(w)) if (!hit.includes(f) && Math.hypot(f.x - z.sx, (f.y - z.sy) * 2) < PAS.stompRing) hurtF(w, f, D * 0.4 * m);
    }
    if (z.anim === 'rain' && fi === A.rain.throwAt) {
      const hx = z.x + z.face * 30;
      for (const [x, y] of z.spots ?? []) {
        addProp(w, z, 'bottle', { x0: hx, y0: z.y, z0: 90, x1: x, y1: y, fly: 0.45, arc: 30, spin: 0, life: 0.05,
          onLand: (p) => {
            w.warns = w.warns.filter((t) => !(t.owner === z && t.kind === 'circle' && Math.abs(t.x! - p.x) < 1 && Math.abs(t.y - p.y) < 1));
            for (let i = 0; i < 8; i++) w.sparks.push({ x: p.x, y: p.y - 6, vx: (Math.random() - 0.5) * 110, vy: -20 - Math.random() * 60, t: 0, c: ['#fff6c0', '#d23c8c', '#5ce0c8'][i % 3] });
            hitCircle(w, p.x, p.y, PAS.rainR, D * 0.35 * m, PAS.blindT, 'OFUSCADO');
            addProp(w, z, 'pool', { x: p.x, y: p.y, life: PAS.poolLife });
          } });
      }
      w.fx('burst', 'LANTEJOULA!', z.x, z.y - 100);
    }
    if (z.anim === 'summon' && fi === A.summon.callAt) {
      z.alaN = (z.alaN ?? 0) + 1;
      if (w.zk.malandro) {
        const rest = REGISTRY.malandro?.rest ?? 'chase';
        for (let j = 0; j < 2; j++) {
          const x = clampX(w, z.x + (j ? 80 : -80)), y = clampY(z.y + (j ? 18 : -18));
          mkZ(w, 'malandro', x, y, (z.x > x ? 1 : -1) as 1 | -1, rest, 'walk');
          spawnFx(w, 'dust', x, y, 1);
        }
      }
      w.fx('burst', 'ALA!', z.x, z.y - z.K.top); w.log(`${z.K.nome} chamou a ala dos Malandros`);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
