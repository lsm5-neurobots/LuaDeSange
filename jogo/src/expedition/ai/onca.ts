// Mini boss A Onça-Pintada (Amazônia, samaúma): caçadora de emboscada. Some no mato (1,6 s invulnerável) e mostra
// os OLHOS na folhagem onde vai reaparecer (0,9 s de aviso); reaparece e já arma o BOTE longo (agacha e chicoteia a
// cauda 0,8 s, faixa no chão). Bote que acerta DERRUBA e emenda a MORDIDA NA NUCA (um aliado batendo nela quebra a
// mordida e a deixa TONTA); bote que erra deixa a onça ATOLADA 1,8 s (vulnerável: dano ×1,5). De perto: patada em arco
// (2 golpes, empurra) e rugido em volta (ATORDOA e chama 2 Bugios, 1× por fase). Leva muito dano → foge pro mato.
// Fúria (<50%): golpes ×1,3, recargas menores, 2 pontos de olhos FALSOS na emboscada e bote duplo (ida e volta).
// Fraqueza extra: luz forte (especial de um lutador) enquanto ela está escondida a revela e a deixa tonta.
import type { ZombieAI, ZCtx } from './index';
import { REGISTRY } from './index';
import { RS, aliveF, animFrac, clampY, rnd, setAnim, spawnFx, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { hurtF, stunF } from '../fighter';
import { GUARDS, mkZ, type Guard } from '../combat';
import { hitCircle } from './bossProps';

/** recargas [normal, fúria] em s */
export const ONC_CD: Record<string, [number, number]> = { ambush: [11, 8], pounce: [6, 4.5], claw: [2, 1.5], roar: [10, 8] };
/** regras (distâncias em unidades do mundo) */
export const ONC = {
  far: 80, clawR: 52, clawDy: 16, clawPush: 20, roarR: 100, roarStun: 1.0,
  pounceLen: 170, pounceDy: 14, pounceHit: 26, stuckT: 1.8, dazeT: 1.0,
  hideT: 1.6, eyesT: 0.9, appearMin: 50, appearMax: 90, fleeDmg: 0.06,
  dmgPounce: 1.5, dmgMaul: 1.0, dmgClaw: 0.9, dmgRoar: 0.5, fury: 1.3,
};

interface EyeSpot { x: number; y: number; t: number; real: boolean; actor: ExtraActor }

const clampX = (w: World, x: number) => Math.max(w.cam + 30, Math.min(w.cam + w.W - 30, x));
const cdOf = (z: Zombie, k: string) => ONC_CD[k][z.fury ? 1 : 0];
const dmgOf = (z: Zombie, mul: number) => z.K.dmg * (z.dmgMul || 1) * mul * (z.fury ? ONC.fury : 1);

function toWalk(z: Zombie, cd: number): void { z.state = 'walk'; z.mv = null; z.vuln = false; z.cd = cd; setAnim(z, 'walk'); }

// ---------------- pontos de olhos na folhagem (atores extras) ----------------
function eyeActor(w: World, z: Zombie, sp: { x: number; y: number; t: number }): ExtraActor {
  return {
    x: sp.x, y: sp.y, w0: 0,
    draw: (c, cam) => {
      const F = z.K.F as any, A = F.ANIMS?.xEyes, T = (w.A as any).TWEEN;
      if (!A || !F.framePose || !T) return;
      const st = sp.t < 0.18 ? 0 : [1, 1, 3, 1, 2, 1][Math.floor(sp.t * 8) % 6];
      const P = T.poseAt(F, 'xEyes', st, 0, false);
      const cv = F.framePose(z.form === 'furia' ? 'furia' : 'normal', 'xEyes', P, 'xEyes' + st + '.0');
      if (!cv) return;
      c.drawImage(cv, Math.round(sp.x - cam) - cv._ax / RS, Math.round(sp.y) - cv._gy / RS, cv.width / RS, cv.height / RS);
    },
  };
}
function clearEyes(w: World, z: Zombie): void {
  for (const s of (z.eyes ?? []) as EyeSpot[]) { const i = (w.actors ?? []).indexOf(s.actor); if (i >= 0) w.actors!.splice(i, 1); }
  z.eyes = [];
}
function showEyes(w: World, z: Zombie): void {
  clearEyes(w, z);
  const spots: EyeSpot[] = [];
  const mk = (x: number, y: number, real: boolean) => { const s: any = { x, y, t: 0, real }; s.actor = eyeActor(w, z, s); (w.actors ??= []).push(s.actor); spots.push(s); };
  mk(z.ax, z.ay, true);
  if (z.fury) for (let k = 0; k < 2; k++) mk(clampX(w, w.cam + 40 + rnd() * (w.W - 80)), clampY(150 + rnd() * 50), false);
  z.eyes = spots;
  w.fx('bubble', 'OLHOS NO MATO!', z.ax, z.ay - 40);
}

// ---------------- prender / soltar ----------------
function releasePrey(z: Zombie): void {
  const f = z.prey as Fighter | null;
  if (f && f.state === 'stun') f.stunT = Math.min(f.stunT, 0.05);
  z.prey = null; z.maulBreak = false;
}

// ---------------- golpes ----------------
function startPounce(c: ZCtx, quick = false): void {
  const { z, w, V } = c;
  z.face = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  z.state = 'attack'; z.mv = 'pounce'; z.anim = ''; setAnim(z, 'pounce');
  if (quick) z.fi = 2; // bote de volta (fúria): aviso mais curto
  z.mcd.pounce = cdOf(z, 'pounce');
  const len = Math.min(ONC.pounceLen, Math.abs(V.x - z.x) + 24);
  z.jx0 = z.x; z.jx1 = clampX(w, z.x + z.face * len); z.hitV = false;
  w.warns = w.warns.filter((t) => t.owner !== z);
  w.warns.push({ kind: 'lane', x0: z.x, x1: z.jx1, y: z.y, owner: z });
  w.fx('bubble', 'CAUDA CHICOTEIA!', z.x, z.y - z.K.top * 0.5);
}
function startMv(c: ZCtx, mv: 'claw' | 'roar'): void {
  const { z, w } = c;
  z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
  z.state = 'attack'; z.mv = mv; z.anim = ''; setAnim(z, mv); z.mcd[mv] = cdOf(z, mv);
  if (mv === 'roar') { w.warns.push({ kind: 'circle', x: z.x + z.face * 20, y: z.y, r: ONC.roarR, owner: z }); w.fx('bubble', 'INSPIRA...', z.x, z.y - z.K.top * 0.55); }
  else w.warns.push({ kind: 'lane', x0: z.x, x1: z.x + z.face * ONC.clawR, y: z.y, owner: z });
}
function startAmbush(c: ZCtx): void {
  const { z, w } = c;
  z.state = 'vanish'; z.mv = null; z.anim = ''; setAnim(z, 'vanish'); z.mcd.ambush = cdOf(z, 'ambush'); z.rDmg = 0;
  w.warns = w.warns.filter((t) => t.owner !== z);
  w.fx('tag', 'SUMIU NO MATO', z.x, z.y - z.K.top * 0.5); w.log(`${z.K.nome} sumiu no mato`);
}
/** sai do mato no ponto real (ou é revelada pela luz) */
function emerge(c: ZCtx, revealed: boolean): void {
  const { z, w } = c;
  clearEyes(w, z); z.invuln = false;
  z.x = z.ax; z.y = z.ay;
  const tg = (z.amb as Fighter | null) && !(z.amb as Fighter).down ? z.amb as Fighter : c.V;
  z.face = (Math.sign(tg.x - z.x) || -1) as 1 | -1;
  if (revealed) { z.state = 'dazed'; z.dazeT = ONC.dazeT; setAnim(z, 'dazed'); w.fx('burst', 'REVELADA!', z.x, z.y - z.K.top * 0.6); w.log(`A luz revelou ${z.K.nome}: bata agora!`); return; }
  z.state = 'appear'; setAnim(z, 'appear');
}

/** Luz forte revela a onça escondida (hook pra flare/lanterna; o especial de um lutador já conta). */
export function revealOnca(w: World, z: Zombie, c?: ZCtx): void {
  if (z.state !== 'hidden' && !(z.state === 'vanish' && z.invuln)) return;
  const fake = { w, z, dt: 0, V: c?.V ?? aliveF(w)[0] ?? w.fs[0], dx: 0, adx: 0, dy: 0, step() {}, chase() {} } as ZCtx;
  emerge(fake, true);
}

function hitArc(w: World, z: Zombie, dmg: number): Fighter[] {
  const out: Fighter[] = [];
  for (const f of aliveF(w)) { const d = (f.x - z.x) * z.face; if (d > -6 && d < ONC.clawR && Math.abs(f.y - z.y) < ONC.clawDy) { hurtF(w, f, dmg, { push: ONC.clawPush }); f.x += z.face * ONC.clawPush; out.push(f); } }
  return out;
}

function callBugios(w: World, z: Zombie): void {
  const ph = z.fury ? 1 : 0, called: boolean[] = z.called ?? (z.called = [false, false]);
  if (called[ph] || !(w.zk as any).bugio) return;
  called[ph] = true;
  const rest = REGISTRY.bugio?.rest ?? 'chase';
  for (let j = 0; j < 2; j++) {
    const left = j === 0, x = left ? w.cam + 10 : w.cam + w.W - 10, y = clampY(z.y + (left ? -16 : 16));
    mkZ(w, 'bugio' as any, x, y, (left ? 1 : -1) as 1 | -1, rest, 'walk');
    spawnFx(w, 'dust', x, y, 1);
  }
  w.fx('burst', 'BUGIOS!', z.x, z.y - z.K.top); w.log(`${z.K.nome} chamou os Bugios`);
}

/** Defesa: escondida = invulnerável; aliado batendo quebra a mordida; soma o dano recente (foge pro mato). */
const oncaGuard: Guard = (_w, z, dmg, _n, by) => {
  if (z.invuln) return null;
  if (z.state === 'maul' && z.prey && by && by !== z.prey) z.maulBreak = true;
  z.rDmg = (z.rDmg ?? 0) + dmg;
  return dmg;
};
(GUARDS as Record<string, Guard>).onca = oncaGuard;

export const onca: ZombieAI = {
  rest: 'walk',
  update(c) {
    const { z, w, dt } = c;
    const mcd: Record<string, number> = z.mcd ?? (z.mcd = {});
    for (const k in mcd) mcd[k] = Math.max(0, mcd[k] - dt);
    z.rDmg = Math.max(0, (z.rDmg ?? 0) - dt * z.maxhp * 0.02);
    for (const s of (z.eyes ?? []) as EyeSpot[]) s.t += dt;
    const A = z.K.F.ANIMS;

    if (z.state !== 'maul' && z.prey) releasePrey(z); // fúria (ou outra coisa) interrompeu a mordida
    if (z.state === 'enter') { setAnim(z, 'stalk'); c.step(); z.x -= 40 * dt * (z.x > w.cam + w.W ? 2.4 : 1); if (z.x < w.cam + w.W - 100) { z.state = 'intro'; setAnim(z, 'intro'); } return; }
    if (z.state === 'intro') { c.step(); if (z.done) toWalk(z, 0.8); return; }
    if (z.state === 'rage') { z.vuln = false; z.invuln = false; clearEyes(w, z); c.step(); if (z.done) { w.warns = w.warns.filter((t) => t.owner !== z); toWalk(z, 0.5); mcd.roar = 0; } return; }
    if (z.state === 'dazed') { z.dazeT -= dt; c.step(); if (z.done) { z.fi = 0; z.done = false; z.acc = 0; } if (z.dazeT <= 0) toWalk(z, 0.4); return; }
    if (z.state === 'stuck') { // atolada: janela de dano ×1,5
      z.vuln = true; z.stuckT -= dt; c.step(); if (z.done) { z.fi = 0; z.done = false; z.acc = 0; }
      if (z.stuckT <= 0) { toWalk(z, 0.5); w.fx('tag', 'SOLTOU', z.x, z.y - z.K.top * 0.5); }
      return;
    }
    if (z.state === 'maul') {
      const f = z.prey as Fighter | null;
      if (z.maulBreak || !f || f.down) {
        const broke = z.maulBreak; releasePrey(z);
        if (broke) { z.state = 'dazed'; z.dazeT = ONC.dazeT; setAnim(z, 'dazed'); w.fx('burst', 'SOLTOU!', z.x, z.y - z.K.top * 0.6); w.log(`Um aliado tirou ${z.K.nome} de cima!`); }
        else toWalk(z, 0.6);
        return;
      }
      if (f.state === 'stun') f.stunT = Math.max(f.stunT, 0.25);
      z.x = f.x - z.face * 30; z.y = f.y;
      c.step(true);
      if (z.done) { releasePrey(z); toWalk(z, z.fury ? 0.5 : 0.8); }
      return;
    }
    if (z.state === 'vanish') {
      c.step();
      if (z.fi >= (A.vanish.goneAt ?? 6)) z.invuln = true;
      if (z.done) { // escondida: guarda o alvo (o mais distante) e o ponto onde vai reaparecer
        const fs = aliveF(w); const tg = fs.length ? fs.reduce((a, b) => (Math.abs(b.x - z.x) > Math.abs(a.x - z.x) ? b : a)) : c.V;
        const d = ONC.appearMin + rnd() * (ONC.appearMax - ONC.appearMin);
        let side = rnd() < 0.5 ? -1 : 1; if (tg.x + side * d < w.cam + 30 || tg.x + side * d > w.cam + w.W - 30) side = -side;
        z.amb = tg; z.ax = clampX(w, tg.x + side * d); z.ay = clampY(tg.y);
        z.state = 'hidden'; z.hideT = ONC.hideT - 0.2; z.invuln = true; z.hx0 = z.x;
        z.x = w.cam - 140; // fora da tela: sem sombra, sem alvo
      }
      return;
    }
    if (z.state === 'hidden') {
      z.hideT -= dt;
      if (aliveF(w).some((f) => f.state === 'special')) { emerge(c, true); return; } // luz forte revela
      if (z.hideT <= ONC.eyesT && !(z.eyes?.length)) showEyes(w, z);
      if (z.hideT <= 0) emerge(c, false);
      return;
    }
    if (z.state === 'appear') { c.step(); if (z.done) startPounce(c); return; }
    if (z.state === 'attack') {
      if (z.mv === 'pounce') {
        const J: number[] = A.pounce.jump ?? [4, 5, 6, 7], k = J.indexOf(z.fi);
        if (k >= 0) {
          const u = Math.min(1, (k + animFrac(z, A.pounce)) / J.length);
          z.x = z.jx0 + (z.jx1 - z.jx0) * u;
          if (!z.hitV) for (const f of aliveF(w)) {
            if (f.state === 'kd' || f.state === 'getup') continue;
            if (Math.abs(f.x - (z.x + z.face * 18)) < ONC.pounceHit && Math.abs(f.y - z.y) < ONC.pounceDy) {
              z.hitV = true; stunF(w, f, 1.6, 'DERRUBADO'); hurtF(w, f, dmgOf(z, ONC.dmgPounce), { heavy: true });
              w.shake = Math.max(w.shake, 0.3); w.fx('burst', 'BOTE!', f.x, f.y - 70);
              w.warns = w.warns.filter((t) => t.owner !== z);
              z.prey = f; z.state = 'maul'; z.mv = null; z.second = false; setAnim(z, 'maul'); z.z = 0;
              return;
            }
          }
        }
      }
      c.step(true);
      if (z.done) {
        w.warns = w.warns.filter((t) => t.owner !== z);
        if (z.mv === 'pounce') {
          if (z.fury && !z.second) { z.second = true; startPounce(c, true); return; } // bote duplo: volta
          z.second = false; z.state = 'stuck'; z.stuckT = ONC.stuckT; z.vuln = true; setAnim(z, 'stuck');
          w.fx('tag', 'ATOLADA!', z.x, z.y - z.K.top * 0.6); w.log(`${z.K.nome} errou o bote e atolou: bata agora!`);
          return;
        }
        toWalk(z, z.fury ? 0.5 : 0.9);
      }
      return;
    }

    // ---------------- decisão (nunca fica parada) ----------------
    z.face = (Math.sign(c.dx) || z.face) as 1 | -1;
    if (z.cd <= 0) {
      const ady = Math.abs(c.dy);
      if ((z.rDmg ?? 0) > z.maxhp * ONC.fleeDmg && (mcd.ambush ?? 0) < 4) { startAmbush(c); return; } // apanhou demais: some
      if (c.adx > ONC.far) {
        if (!mcd.ambush && rnd() < 0.5) { startAmbush(c); return; }
        if (!mcd.pounce && ady < ONC.pounceDy) { startPounce(c); return; }
        if (!mcd.ambush) { startAmbush(c); return; }
      } else {
        if (!mcd.roar && (rnd() < 0.35 || aliveF(w).filter((f) => Math.hypot(f.x - z.x, (f.y - z.y) * 2) < ONC.roarR).length >= 2)) { startMv(c, 'roar'); return; }
        if (!mcd.claw && c.adx < ONC.clawR && ady < ONC.clawDy) { startMv(c, 'claw'); return; }
      }
    }
    // circula a ~65 do alvo, alinhando a faixa (espreita de longe, anda de perto)
    const want = c.adx > 70 ? 1 : c.adx < 44 ? -1 : 0, spd = z.fury ? 1.3 : 1;
    z.x = clampX(w, z.x + Math.sign(c.dx) * want * 30 * spd * dt);
    z.y = clampY(z.y + Math.sign(c.dy) * Math.min(Math.abs(c.dy), 22 * spd * dt));
    setAnim(z, c.adx > ONC.far ? 'stalk' : 'walk');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const A = z.K.F.ANIMS;
    if (z.anim === 'claw' && (A.claw.hit as number[]).includes(fi)) {
      const first = fi === (A.claw.hit as number[])[0];
      if (!first) w.warns = w.warns.filter((t) => t.owner !== z);
      const hit = hitArc(w, z, dmgOf(z, ONC.dmgClaw));
      if (hit.length) { w.fx('burst', first ? 'ZÁS!' : 'ZÁS!!', z.x + z.face * 40, z.y - 60); w.shake = Math.max(w.shake, 0.12); }
    }
    if (z.anim === 'roar' && fi === A.roar.hit) {
      w.warns = w.warns.filter((t) => t.owner !== z);
      w.shake = Math.max(w.shake, 0.35); w.fx('burst', 'ROOOAR!', z.x, z.y - z.K.top * 0.8);
      hitCircle(w, z.x + z.face * 20, z.y, ONC.roarR, dmgOf(z, ONC.dmgRoar), ONC.roarStun, 'ATORDOADO');
      callBugios(w, z);
    }
    if (z.anim === 'maul' && (A.maul.bite as number[]).includes(fi)) {
      const f = z.prey as Fighter | null;
      if (f && !f.down) { hurtF(w, f, dmgOf(z, ONC.dmgMaul / 2)); if (f.state !== 'stun' && !f.down) stunF(w, f, 0.4, 'NA NUCA!'); w.fx('burst', 'NHAC!', f.x, f.y - 60); w.shake = Math.max(w.shake, 0.15); }
    }
  },
  spawn(w) {
    return { x: w.cam + w.W + 80, y: 176, face: -1, state: 'enter', anim: 'stalk' };
  },
};
