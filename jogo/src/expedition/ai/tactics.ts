// Tática de horda (inteligência mínima): os zumbis não vão todos em fila pra frente.
// - Cercam: cada um pega um lado do alvo (esquerda/direita) e uma faixa de profundidade.
// - Revezam: só alguns (fichas de ataque) encostam; os outros ficam rondando a uma distância, balançando e
//   trocando de faixa, esperando a vez (como num beat 'em up clássico).
// - Dão a volta: quem precisa trocar de lado contorna o alvo pela profundidade em vez de atravessar.
// - Não se empilham: separação entre zumbis próximos.
// - Recuam: depois de levar dano às vezes dão um passo pra trás antes de voltar.
import type { World, Zombie, Fighter } from '../world';
import { clampY } from '../world';

/** quantos zumbis comuns podem estar colados no mesmo alvo ao mesmo tempo */
const tokens = (w: World) => (w.mode === 'lua' ? 3 : 2);

interface Slot { engage: boolean; side: 1 | -1; lane: number; ring: number }

/** Calcula o lugar do zumbi em volta do alvo (barato: n pequeno, ~10 zumbis). */
export function slotFor(w: World, z: Zombie, V: Fighter): Slot {
  const crowd = w.zs.filter((o) => !o.dead && !o.boss && !o.down && o.tg === V && o.state !== 'boom');
  crowd.sort((a, b) => Math.abs(a.x - V.x) + Math.abs(a.y - V.y) * 2 - (Math.abs(b.x - V.x) + Math.abs(b.y - V.y) * 2) || a.uid - b.uid);
  const i = Math.max(0, crowd.indexOf(z));
  // lado: o 1º fica do lado em que já está; os seguintes alternam (cerco). Fixa o lado por um tempo pra não tremer.
  if (z.tSide == null || (z.tSideT ?? 0) <= 0) {
    const own = (Math.sign(z.x - V.x) || 1) as 1 | -1;
    const firstSide = crowd[0] ? ((Math.sign(crowd[0].x - V.x) || 1) as 1 | -1) : own;
    z.tSide = i === 0 ? own : ((i % 2 === 1 ? -firstSide : firstSide) as 1 | -1);
    z.tSideT = 2.5 + (z.uid % 5) * 0.4;
  }
  const lanes = [0, -12, 12, -20, 20];
  return { engage: i < tokens(w), side: z.tSide as 1 | -1, lane: lanes[Math.floor(i / 2) % lanes.length], ring: 62 + Math.floor(i / 2) * 16 };
}

/**
 * Movimento tático no lugar do "anda reto até o alvo".
 * spd/stop: velocidade e distância de parada do comportamento.
 */
export function tacticalChase(w: World, z: Zombie, V: Fighter, dt: number, spd: number, stop: number, step: () => void): void {
  z.tSideT = (z.tSideT ?? 0) - dt;
  z.backT = Math.max(0, (z.backT ?? 0) - dt);
  const s = slotFor(w, z, V);
  let tx: number, ty: number, sp = spd;
  if (z.backT > 0) { // recuo depois de apanhar
    tx = z.x + Math.sign(z.x - V.x || 1) * 40; ty = z.y; sp = spd * 0.9;
  } else if (s.engage) {
    tx = V.x + s.side * stop; ty = V.y; // encosta na mesma linha pra poder bater
  } else {
    // ronda: fica no anel esperando a vez, balançando e mudando de faixa devagar
    const sway = Math.sin(w.clock * 0.9 + z.uid * 1.7);
    tx = V.x + s.side * (s.ring + sway * 8); ty = V.y + s.lane + Math.sin(w.clock * 0.5 + z.uid) * 6; sp = spd * 0.75;
  }
  // contorna o alvo em vez de atravessar: se o lugar é do outro lado, desvia pela profundidade
  const crossing = Math.sign(z.x - V.x) !== Math.sign(tx - V.x) && Math.abs(z.x - V.x) < 48;
  if (crossing) ty = V.y + (z.y <= V.y ? -22 : 22);
  // separação: não empilhar com outros zumbis
  let px = 0, py = 0;
  for (const o of w.zs) {
    if (o === z || o.dead || o.down) continue;
    const ddx = z.x - o.x, ddy = z.y - o.y;
    if (Math.abs(ddx) < 16 && Math.abs(ddy) < 7) { px += (Math.sign(ddx) || (z.uid > o.uid ? 1 : -1)) * (16 - Math.abs(ddx)); py += (Math.sign(ddy) || (z.uid % 2 ? 1 : -1)) * (7 - Math.abs(ddy)); }
  }
  const dx = tx - z.x, dy = ty - z.y;
  const mx = Math.sign(dx) * Math.min(Math.abs(dx), sp * dt) + px * dt * 3;
  const my = Math.sign(dy) * Math.min(Math.abs(dy), sp * 0.6 * dt) + py * dt * 3;
  z.x += mx; z.y = clampY(z.y + my);
  // olha pro alvo (recuando também), anda ou fica parado balançando
  z.face = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  const moving = Math.abs(mx) + Math.abs(my) > 0.2 * dt * spd;
  const A = z.K.F.ANIMS;
  const want = moving ? 'walk' : A.idle ? 'idle' : 'walk';
  if (z.anim !== want && (z.anim === 'walk' || z.anim === 'idle')) { z.anim = want; z.fi = 0; z.acc = 0; z.done = false; }
  step();
}

/** Chamado quando o zumbi sai do dano: às vezes recua um pouco antes de voltar. */
export function onHurtEnd(z: Zombie): void {
  if (!z.boss && Math.random() < 0.35) z.backT = 0.5 + Math.random() * 0.4;
}
