// Mini boss A Erveira (Ver-o-Peso, Feira das Ervas): mantém 120–180 do squad; garrafada (poça de veneno), raízes
// que brotam sob o alvo e prendem 1,2 s (3 pontos na fúria), chá que cura 5% uma vez por fase (golpe forte
// interrompe) e cajado de perto. Chama 2 Rastejantes do chão se houver menos de 2 zumbis vivos.
import type { ZombieAI } from './index';
import { aliveF, clampY, setAnim } from '../world';
import { mkZ } from '../combat';
import { addProp, hitCircle, hitLane, tickProps } from './bossProps';

const CD: Record<string, [number, number]> = { bottle: [4, 3], roots: [6, 4.6], staff: [2.2, 1.8], summon: [9, 7] };
function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; setAnim(z, mv); z.mcd[mv] = CD[mv]?.[z.fury ? 1 : 0] ?? 0; }

export const erveira: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const spdM = z.fury ? 1.3 : 1;
    tickProps(w, z, dt);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 30 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 90) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro' || z.state === 'rage') { c.step(); if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); } return; }
    if (z.state === 'attack') {
      // chá: golpe forte (perdeu 4% da vida durante o gole) interrompe
      if (z.mv === 'tea' && z.hp < (z.teaHp ?? z.hp) - z.maxhp * 0.04 && z.fi < (z.K.F.ANIMS.tea.healAt ?? 6)) {
        w.fx('tag', 'CHÁ INTERROMPIDO', z.x, z.y - z.K.top * 0.55 - 10); w.log(`${z.K.nome} perdeu o chá!`);
        z.state = 'walk'; z.cd = 0.8; setAnim(z, 'walk'); return;
      }
      c.step(true);
      if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); z.state = 'walk'; z.cd = z.fury ? 0.7 : 1.1; setAnim(z, 'walk'); }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy), alive = w.zs.filter((o) => !o.dead && o !== z).length, calls = z.calls ?? 0;
      const phase = z.fury ? 1 : 0;
      if (alive < 2 && calls < (z.fury ? 3 : 2) && !mcd.summon) { start(z, 'summon'); return; }
      if (z.hp < z.maxhp * (z.fury ? 0.35 : 0.8) && (z.teaPhase ?? -1) < phase) { z.teaPhase = phase; z.teaHp = z.hp; start(z, 'tea'); w.fx('bubble', 'SLURP!', z.x, z.y - z.K.top * 0.55); return; }
      if (c.adx < 44 && ady < 16 && !mcd.staff) { start(z, 'staff'); w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 44, y: z.y, owner: z }); return; }
      if (!mcd.roots && c.adx < 200) {
        start(z, 'roots'); const fs = aliveF(w); z.spots = [[V.x, V.y]];
        if (z.fury) for (let k = 0; k < 2; k++) { const f = fs[(k + 1) % fs.length]; z.spots.push([Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, f.x + (Math.random() - 0.5) * 50)), clampY(f.y + (Math.random() - 0.5) * 20)]); }
        for (const [x, y] of z.spots) w.warns.push({ kind: 'circle', x, y, r: 36, owner: z });
        w.fx('bubble', 'RAIZ!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx >= 60 && c.adx <= 200 && !mcd.bottle) {
        start(z, 'bottle'); z.spots = [[V.x, V.y]];
        if (z.fury) z.spots.push([Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, V.x + (Math.random() < 0.5 ? -40 : 40))), clampY(V.y + (Math.random() - 0.5) * 24)]);
        for (const [x, y] of z.spots) w.warns.push({ kind: 'circle', x, y, r: 30, owner: z });
        return;
      }
    }
    // mantém 120–180 do squad (recua de perto, se aproxima de longe)
    const mv = c.adx < 100 ? -1 : c.adx > 180 ? 1 : 0;
    z.x += Math.sign(c.dx) * mv * 16 * spdM * dt;
    z.x = Math.max(w.cam + 24, Math.min(w.cam + w.W - 24, z.x));
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 12 * spdM * dt));
    setAnim(z, 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1, D = z.K.dmg;
    if (z.anim === 'bottle' && fi === A.bottle.tossAt) {
      for (const [x, y] of z.spots ?? []) {
        addProp(w, z, 'bottle', { x0: z.x + z.face * 8, y0: z.y, z0: 110, x1: x, y1: y, fly: 0.8, arc: 50, spin: z.face * 10, life: 0.05,
          onLand: (p) => {
            w.warns = w.warns.filter((t) => !(t.owner === z && t.kind === 'circle' && Math.abs(t.x! - p.x) < 1));
            w.fx('burst', 'SPLASH!', p.x, p.y - 30);
            for (let i = 0; i < 10; i++) w.sparks.push({ x: p.x, y: p.y - 4, vx: (Math.random() - 0.5) * 100, vy: -20 - Math.random() * 60, t: 0, c: i % 2 ? '#7ee040' : '#e8fff6' });
            hitCircle(w, p.x, p.y, 30, D * 0.5 * m);
            w.pools.push({ x: p.x, y: p.y, t: 0, c: '#7ee040', dmg: 10 * m });
          } });
      }
    }
    if (z.anim === 'roots' && fi === A.roots.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.25;
      for (const [x, y] of z.spots ?? []) {
        addProp(w, z, 'roots', { x, y, life: 1.4, st: 0 });
        w.fx('burst', 'RAIZ!', x, y - 40);
        hitCircle(w, x, y, 40, D * 0.9 * m, 1.2, 'PRESO');
      }
    }
    if (z.anim === 'staff' && fi === A.staff.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.fx('burst', 'TOC!', z.x + z.face * 36, z.y - 60);
      hitLane(w, z.x, z.x + z.face * 44, z.y, 16, D * m, 0, '', 18, z.face);
    }
    if (z.anim === 'tea' && fi === (A.tea.healAt ?? 6)) {
      const h = Math.round(z.maxhp * 0.05); z.hp = Math.min(z.maxhp, z.hp + h);
      w.fx('tag', '+' + h, z.x, z.y - z.K.top * 0.55 - 10); w.log(`${z.K.nome} bebeu o chá e curou ${h}`);
    }
    if (z.anim === 'summon' && fi === (A.summon.callAt ?? 5)) {
      z.calls = (z.calls ?? 0) + 1;
      for (let j = 0; j < 2; j++) {
        const x = Math.max(w.cam + 30, Math.min(w.cam + w.W - 30, z.x + (j ? 70 : -70)));
        mkZ(w, 'rastejante', x, clampY(z.y + (j ? 16 : -16)), (z.x > x ? 1 : -1) as 1 | -1, 'crawl', 'walk');
        addProp(w, z, 'roots', { x, y: clampY(z.y + (j ? 16 : -16)), life: 1.2, st: 1 });
      }
      w.fx('burst', 'LEVANTEM!', z.x, z.y - 100); w.log(`${z.K.nome} chamou os mortos do mato`);
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
