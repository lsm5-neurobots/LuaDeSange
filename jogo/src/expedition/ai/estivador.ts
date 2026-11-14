// Chefe O Estivador (Ver-o-Peso): gancho de carga que puxa até 4 tiles (para no caixote), arremesso de caixote que
// fica no chão como obstáculo (3 golpes pra quebrar, máx. 5), varredura de gancho e "guindaste" (salto + gancho no
// chão, VULNERÁVEL depois). Fúria: puxa duas vezes, 2 caixotes por arremesso, gancho em chamas (+0,4 s aberto).
// Todos os golpes usam o estado 'attack' (mv = golpe), assim os avisos no chão duram o golpe inteiro.
import type { ZombieAI } from './index';
import { clampY, setAnim, spawnFx } from '../world';
import { hurtF, stunF } from '../fighter';
import { addProp, crateBetween, cratesOf, hitCircle, hitLane, smashCrates, tickProps, tickPulls, breakCrate } from './bossProps';

const CD: Record<string, [number, number]> = { hook: [5, 3], toss: [4.5, 3], sweep: [3, 2.4], slam: [7, 5.5] };

function start(z: any, mv: string): void { z.state = 'attack'; z.mv = mv; setAnim(z, mv); z.mcd = z.mcd ?? {}; z.mcd[mv] = CD[mv][z.fury ? 1 : 0]; }

// gancho em voo: pega o primeiro lutador na linha (o motor só desenha a corrente)
function checkHook(c: any): void {
  const { z, w } = c, p = z.hookP; if (!p || p.done || p.hit !== true) return;
  const m = z.fury ? 1.3 : 1, D = z.K.dmg;
  for (const f of w.fs) {
    if (f.down || Math.abs(f.y - z.y) > 16 || Math.abs(f.x - p.x) > 14) continue;
    z.hookHit = true; p.done = true; z.hookP = null;
    hurtF(w, f, D * 0.28 * m); stunF(w, f, 0.5, 'AGARROU!');
    const want = z.x + z.face * 46, stop = crateBetween(w, f.x, want, f.y), tx = stop ?? want;
    if (stop != null) w.fx('burst', 'PRESO NO CAIXOTE!', f.x, f.y - 80);
    (z.pulls ??= []).push({ f, tx, ty: z.y });
    w.fx('burst', 'AGARROU!', f.x, f.y - 70); w.log(`O gancho do ${z.K.nome} puxou ${f.m.nome}!`);
    w.shake = Math.max(w.shake, 0.2);
    break;
  }
  if (p.t >= 1) z.hookP = null;
}

export const estivador: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt, V } = c;
    const A = z.K.F.ANIMS, spdM = z.fury ? 1.3 : 1;
    tickProps(w, z, dt); tickPulls(w, z, dt);
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    if (z.state === 'enter') { setAnim(z, 'walk'); c.step(); z.x -= 22 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 110) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro' || z.state === 'rage') {
      const pf = z.fi; c.step();
      if (z.anim === 'intro' && z.fi !== pf && z.fi === 4) { w.shake = 0.6; spawnFx(w, 'impactBig', z.x, z.y - 6, -1); w.fx('burst', 'TUUM!', z.x, z.y - 60); }
      if (z.done) { z.state = 'walk'; z.cd = 0.6; setAnim(z, 'walk'); }
      return;
    }
    if (z.state === 'attack') {
      if (z.vulnHold > 0) { z.vulnHold -= dt; z.hold = true; if (z.vulnHold <= 0) z.hold = false; return; }
      c.step(true);
      checkHook(c);
      if (z.done) {
        if (z.mv === 'hook' && z.fury && !z.second && z.hookHit) { z.second = true; z.hookHit = false; setAnim(z, 'hook'); z.fi = 3; w.fx('bubble', 'DE NOVO!', z.x, z.y - z.K.top * 0.55); return; }
        z.vuln = false; z.second = false; w.warns = w.warns.filter((t) => t.owner !== z);
        z.state = 'walk'; z.cd = z.fury ? 0.8 : 1.3; setAnim(z, 'walk');
      }
      return;
    }
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if (c.adx < 90 && ady < 28) {
        if (!mcd.slam && Math.random() < 0.45) {
          start(z, 'slam'); w.warns.push({ kind: 'circle', x: z.x + z.face * 46, y: z.y, r: 54, owner: z }); w.fx('bubble', '!', z.x, z.y - z.K.top * 0.55);
          return;
        }
        if (!mcd.sweep) { start(z, 'sweep'); w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * 100, y: z.y, owner: z }); return; }
      }
      if (c.adx >= 80 && c.adx <= 160 && ady < 16 && !mcd.hook && (mcd.toss > 0 || c.adx < 110 || Math.random() < 0.5)) {
        start(z, 'hook'); z.hookHit = false; z.second = false;
        w.warns.push({ kind: 'lane', x0: z.x + z.face * 20, x1: z.x + z.face * 160, y: z.y, owner: z });
        w.fx('bubble', 'AGARRA!', z.x, z.y - z.K.top * 0.55);
        return;
      }
      if (c.adx > 110 && !mcd.toss) {
        start(z, 'toss'); z.tx = V.x; z.ty = V.y;
        w.warns.push({ kind: 'circle', x: V.x, y: V.y, r: 28, owner: z });
        if (z.fury) { z.tx2 = Math.max(w.cam + 30, Math.min(w.cam + w.W - 30, V.x + (Math.random() < 0.5 ? -36 : 36))); z.ty2 = clampY(V.y + (Math.random() - 0.5) * 30); w.warns.push({ kind: 'circle', x: z.tx2, y: z.ty2, r: 28, owner: z }); }
        return;
      }
    }
    // anda até a distância de golpe; caixotes no caminho: chuta pra longe (quebra) ao encostar
    for (const cr of cratesOf(w)) if (Math.abs(cr.x - z.x) < 26 && Math.abs(cr.y - z.y) < 10) breakCrate(w, cr, false);
    z.x += Math.sign(c.dx) * Math.min(Math.max(0, c.adx - 66), 13 * spdM * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 11 * spdM * dt));
    setAnim(z, 'walk');
    const pf = z.fi;
    c.step();
    if (z.fi !== pf && (A.walk.stomp || []).includes(z.fi)) w.shake = Math.max(w.shake, 0.1);
  },
  onFrame(c, fi) {
    const { z, w, V } = c;
    const A = z.K.F.ANIMS, m = z.fury ? 1.3 : 1, D = z.K.dmg;
    if (z.anim === 'hook' && fi === A.hook.throwAt) {
      const range = Math.min(160, Math.max(60, Math.abs(V.x - z.x) + 8)), x1 = z.x + z.face * range, y1 = z.y;
      const pr: any = { kind: 'hook', t: 0, d: 0.5 * range / 160 + 0.15, x0: z.x + z.face * 30, y0: z.y - 90, x1, y1: y1 - 10, x: z.x, y: z.y - 90, owner: z, dmg: 0, hit: true };
      w.proj.push(pr);
      z.hookP = pr;
      if (z.fury) w.sparks.push({ x: z.x + z.face * 30, y: z.y - 90, vx: z.face * 80, vy: -40, t: 0, c: '#ff7a30' });
    }
    if (z.anim === 'toss' && fi === A.toss.tossAt) {
      const throwOne = (tx: number, ty: number) => {
        addProp(w, z, 'crate', {
          x0: z.x + z.face * 10, y0: z.y, z0: 150, x1: tx, y1: ty, fly: 0.9, arc: 60, spin: z.face * 7, life: 12, hp: 3,
          onLand: (p) => {
            w.warns = w.warns.filter((t) => !(t.kind === 'circle' && t.owner === z && Math.abs(t.x! - p.x) < 1));
            w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'BUM!', p.x, p.y - 30); spawnFx(w, 'impactBig', p.x, p.y - 6, 1);
            hitCircle(w, p.x, p.y, 28, D * 0.7 * m, 0.3, 'TONTO', 14, p.x);
            // máx. 5 caixotes no chão: o mais antigo some
            const cs = cratesOf(w).filter((o) => o.owner === z); if (cs.length > 5) breakCrate(w, cs[0], false);
          },
        });
      };
      throwOne(z.tx, z.ty);
      if (z.fury && z.tx2 != null) throwOne(z.tx2, z.ty2);
    }
    if (z.anim === 'sweep' && fi === A.sweep.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.3; w.fx('burst', 'VUUSH!', z.x + z.face * 60, z.y - 80);
      hitLane(w, z.x, z.x + z.face * 100, z.y, 18, D * m, 0.4, 'DERRUBADO', 30, z.face);
      smashCrates(w, z.x + z.face * 50, z.y, 50);
    }
    if (z.anim === 'slam' && fi === A.slam.hit) {
      const cx = z.x + z.face * 46, cy = z.y;
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = 0.55; w.fx('burst', 'KRAAAM!', cx, cy - 50);
      spawnFx(w, 'impactBig', cx, cy - 8, z.face);
      for (let i = 0; i < 22; i++) w.sparks.push({ x: cx + (Math.random() - 0.5) * 60, y: cy, vx: (Math.random() - 0.5) * 150, vy: -30 - Math.random() * 90, t: 0, c: z.fury ? '#ff7a30' : '#a89878' });
      hitCircle(w, cx, cy, 60, D * 1.2 * m, 0.6, 'TONTO', 0, cx);
      smashCrates(w, cx, cy, 60);
    }
    if (z.anim === 'slam' && A.slam.vuln?.includes(fi)) {
      z.vuln = true;
      if (fi === A.slam.vuln[0]) w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top * 0.55 - 10);
      if (z.fury && fi === A.slam.vuln[A.slam.vuln.length - 1]) z.vulnHold = 0.4;
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 60, y: 176, face: -1, state: 'enter', anim: 'walk' };
  },
};
