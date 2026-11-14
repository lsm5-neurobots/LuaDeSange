// Estalador (IA-23..25): cego, caça pelo som.
// - wander: tateia devagar, sem alvo. Ignora quem anda devagar ou fica parado.
// - hear: ouviu algo → para, vira a cabeça e estala (anim alert), depois hunt.
// - hunt: vai até a origem do som. Se o som veio de um lutador barulhento (≤ 2 s) ou alguém encostou (tato ≤ 28 px),
//   trava nele e entra na tática de horda (c.chase); sem som por 3 s volta a wander.
// - golpes: mordida seca, agarrão forte (prende), estalo sônico (atordoa em cone e faz ruído que atrai outros Estaladores).
import type { ZombieAI, ZCtx } from './index';
import { clampY, rnd, setAnim, spawnFx, type Fighter, type Zombie } from '../world';
import { GUARDS } from '../combat';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';
import { emitNoise, hear, noisyRecently } from './noise';

/** distância de tato (px, com profundidade ×2) */
export const TOUCH = 28;
/** raio de audição por forma */
export const HEAR_MUL: Record<string, number> = { comum: 1, enluarado: 1.25, plenilunar: 1.5 };

const base: ZMove[] = [
  { anim: 'attack', w: 3, max: 34, dy: 9, cd: 0, dmg: 1, word: 'CLAC!' },
  { anim: 'grab', w: 2, max: 36, dy: 9, cd: 5, dmg: 1.8, push: -12, stun: 1.2, stunTag: 'AGARRADO', word: 'AGARROU!', warn: 'circle', lunge: [0, 0, 70, 90, 30, 0, 0, 0, 0, 0], shake: 0.1 },
  { anim: 'flail', w: 2, max: 36, dy: 9, cd: 2.4, dmg: 1, push: 12, word: 'CLAC-CLAC!' }, // braçada às cegas (novo)
  { anim: 'screech', w: 1.5, max: 70, dy: 12, cd: 6, dmg: 0, flat: 4, area: true, stun: 0.6, stunTag: 'ATORDOADO', word: 'TCHIC-TCHIC!', warn: 'lane', shake: 0.08 },
];
// plenilunar: o agarrão prende 0,3 s a mais
const plen: ZMove[] = base.map((m) => (m.anim === 'grab' ? { ...m, stun: 1.5 } : m));
const movesOf = (z: Zombie) => (z.form === 'plenilunar' ? plen : base);

interface Snd { x: number; y: number; f: Fighter | null; t: number }

/** Atualiza o que o Estalador percebe (tato e audição). Retorna o lutador reconhecido como alvo (ou null). */
export function perceive(c: ZCtx): Fighter | null {
  const { w, z } = c;
  // tato: alguém colado
  let touch: Fighter | null = null, td = TOUCH;
  for (const f of w.fs) { if (f.down) continue; const d = Math.hypot(f.x - z.x, (f.y - z.y) * 2); if (d <= td) { td = d; touch = f; } }
  if (touch) { z.snd = { x: touch.x, y: touch.y, f: touch, t: w.clock } as Snd; return touch; }
  const n = hear(w, z, HEAR_MUL[z.form] ?? 1);
  if (n) z.snd = { x: n.x, y: n.y, f: n.f ?? null, t: w.clock } as Snd;
  const s = z.snd as Snd | undefined;
  if (s?.f && !s.f.down && noisyRecently(w, s.f)) { s.x = s.f.x; s.y = s.f.y; return s.f; }
  return null;
}

export const estalador: ZombieAI = {
  rest: 'wander',
  spawn(w, i, fromLeft) {
    return { x: fromLeft ? w.cam - 26 - i * 14 : w.cam + w.W + 26 + i * 18, y: 150 + rnd() * 52, face: fromLeft ? 1 : -1, state: 'wander', anim: 'walk' };
  },
  update(c) {
    const { z, w, dt } = c, MV = movesOf(z);
    tickMoves(z, dt);
    if (z.state === 'attack') {
      moveStep(c, MV); c.step(true);
      if (z.done) { endMove(w, z); z.state = 'cool'; z.cd = 0.6; setAnim(z, 'idle'); }
      return;
    }
    const tgt = perceive(c);
    const s = z.snd as Snd | undefined;
    if (tgt) { z.tg = tgt; z.tgT = 9; } // trava o alvo no lutador barulhento (targetOf não troca)
    else z.tgT = Math.min(z.tgT, 0.3);
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) { z.state = s ? 'hunt' : 'wander'; setAnim(z, 'walk'); } return; }
    if (z.state === 'hear') { c.step(); if (z.done) { z.state = 'hunt'; setAnim(z, 'walk'); } return; }
    if (z.state === 'wander') {
      if (s && w.clock - s.t < 0.2) {
        z.state = 'hear'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(s.x - z.x) || z.face) as 1 | -1;
        w.fx('tag', '?!', z.x, z.y - z.K.top * 0.5 - 14);
        return;
      }
      // tateia: anda devagar pra dentro da tela, muda de rumo de vez em quando, para pra escutar
      z.wT = (z.wT ?? 0) - dt;
      if (z.wT <= 0) { z.wT = 1.4 + rnd() * 1.8; z.wDir = rnd() < 0.25 ? 0 : (z.x > w.cam + w.W * 0.6 ? -1 : z.x < w.cam + w.W * 0.4 ? 1 : rnd() < 0.5 ? -1 : 1); z.wDy = (rnd() - 0.5) * 14; }
      if (z.wDir) { z.face = z.wDir; z.x += z.wDir * 12 * dt; z.y = clampY(z.y + (z.wDy ?? 0) * dt); setAnim(z, 'walk'); } else setAnim(z, 'idle');
      c.step();
      return;
    }
    // hunt
    if (!s || w.clock - s.t > 3) { z.state = 'wander'; z.snd = undefined; setAnim(z, 'idle'); return; }
    if (tgt && c.V === tgt) {
      if (c.adx < 72 && Math.abs(c.dy) < 12 && z.cd <= 0) { const mv = pickMove(c, MV); if (mv) { startMove(c, mv); return; } }
      setAnim(z, 'walk');
      if (c.adx < 70) { c.chase(24, 24); return; }
    }
    // vai reto até a origem do som (não enxerga: não desvia pra tática)
    const dx = s.x - z.x, dy = s.y - z.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 4) {
      z.face = (Math.sign(dx) || z.face) as 1 | -1;
      z.x += Math.sign(dx) * Math.min(Math.abs(dx), 30 * dt);
      z.y = clampY(z.y + Math.sign(dy) * Math.min(Math.abs(dy), 18 * dt));
      setAnim(z, 'walk');
    } else setAnim(z, 'idle');
    c.step();
  },
  onFrame(c, fi) {
    const { z, w } = c;
    const MV = movesOf(z);
    if (z.anim === 'screech' && fi === (z.K.F.ANIMS.screech.hit ?? 4)) {
      emitNoise(w, z.x, z.y, 1, 260); // o estalo atrai outros Estaladores
      spawnFx(w, 'dust', z.x + z.face * 30, z.y, z.face);
    }
    moveFrame(c, fi, MV);
  },
};

// costas: golpe pesado por trás desorienta (atordoa 1 s)
GUARDS.estalador = (_w, z, dmg, n, by) => {
  if (n === 3 && by && Math.sign(by.x - z.x) === -z.face && !z.dead) z.stun = Math.max(z.stun, 1);
  return dmg;
};
