// Zumbi Frevista (IA-40/41/42, variante local de Olinda): zumbi ELUSIVO/defensivo — passista de frevo com sombrinha.
// - Sombrinhada (`attack`): de perto, sombrinha atrás da cabeça (~150 ms) e desce em arco. Plenilunar: a sombrinha
//   volta girando (golpe duplo, 2º acerto a 0,5x).
// - IA-40 Giro da sombrinha (`twirl`): meia distância; 2 passadas de 0,5x em volta (40 px), empurra 10 px. Enquanto gira
//   aberta (quadros 2–7, ~0,7 s; 1,2x mais longo no enluarado) REBATE o primeiro projétil (tiro) que vem DE FRENTE: volta
//   pro atirador com 60% do dano. Limite 1 por giro. Laser/beam atravessa; por trás, corpo a corpo e com a sombrinha
//   fechada (quadros 1 e 8) leva dano normal. Se vê tiro vindo de longe, abre o giro e anda na direção do atirador.
// - IA-41 Zigue-zague: aproximando (chase longe do alvo) troca de faixa ±8 px a cada 0,6 s; perto do golpe para.
// - IA-42 Passo de tesoura (`tesoura`): aviso de faixa no chão, desliza PASSANDO POR TRÁS do alvo (0,8x; derruba só no
//   plenilunar) e termina DE COSTAS ajeitando o chapéu (`open`) por ~1,0 s: +25% de dano nessa janela (FRAQUEZA). Não
//   faz tesoura se o ponto de chegada ficar a menos de 20 px da borda da tela.
import type { ZombieAI, ZCtx } from './index';
import { aliveF, clampY, setAnim, spawnFx, stepAnim, type ExtraActor, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 34, dy: 9, cd: 1.4, dmg: 0.9, word: 'PLAFT!' },
  // twirl: 2 acertos (hit [3,5]); moveFrame divide por 2×0,7 → 0,7/1,4 = 0,5x por passada
  { anim: 'twirl', w: 2, max: 40, dy: 12, cd: 5, dmg: 0.7, around: 40, push: 10, word: 'VUPT!', lunge: [0, 14, 14, 14, 14, 14, 10, 0] },
  { anim: 'tesoura', w: 2, min: 12, max: 52, dy: 10, cd: 6, dmg: 0.8, warn: 'lane', word: 'TESOURA!' },
];

/** IA-40: fração do dano do projétil que volta pro atirador */
export const REFLECT_MUL = 0.6;
/** IA-40: o giro dura 1,2x no enluarado (janela da sombrinha mais longa) */
export const twirlSlow = (z: Zombie) => (z.form === 'enluarado' ? 1.2 : 1);
/** IA-41: troca de faixa (s) e amplitude (px) */
export const ZZ_T = 0.6;
export const ZZ_AMP = 8;
/** IA-42: janela de ajeito (s), bônus de dano e margem da borda */
export const OPEN_T = 1.0;
export const OPEN_MUL = 1.25;
export const EDGE = 20;
/** distância atrás do alvo onde a tesoura termina */
export const TS_BEHIND = 24;
const REB_SPD = 520;

/** O golpe de `by` vem da frente (lado para onde ele olha)? */
export function fromFront(z: Zombie, by: { x: number }): boolean {
  const d = by.x - z.x;
  return Math.abs(d) < 3 || Math.sign(d) === z.face;
}

/** Sombrinha aberta girando (quadros de defesa do twirl). */
export function twirlGuarding(z: Zombie): boolean {
  if (z.dead || z.state !== 'attack' || z.anim !== 'twirl') return false;
  const g = (z.K.F.ANIMS.twirl?.guard as number[] | undefined) ?? [1, 6];
  return z.fi >= g[0] && z.fi <= g[1];
}

/** O dano vem de um tiro (bala no ar, desse atirador, encostando agora)? Laser/beam nunca conta. */
export function isBullet(w: World, z: Zombie, by?: Fighter | null): boolean {
  if (!by || by.w?.tipo === 'beam') return false;
  return !!w.proj?.some((p) => p.kind === 'bullet' && !p.done && p.from === by && Math.abs(p.x - z.x) < z.K.w / 2 + 16);
}

/* ---------- tiro rebatido ---------- */
interface Reb { x: number; ly: number; vx: number; dmg: number; range: number; done: boolean; actor: ExtraActor }

function reflect(w: World, z: Zombie, by: Fighter, dmg: number): void {
  const dir = (Math.sign(by.x - z.x) || z.face) as 1 | -1;
  const R: Reb = { x: z.x + dir * 14, ly: by.y, vx: dir * REB_SPD, dmg: dmg * REFLECT_MUL, range: 360, done: false, actor: null as unknown as ExtraActor };
  R.actor = {
    x: R.x, y: R.ly, w0: 3,
    draw: (cx, cam) => {
      if (R.done) return;
      const x = Math.round(R.x - cam), y = Math.round(R.ly - 52), s = Math.sign(R.vx);
      cx.fillStyle = '#fff4c0'; cx.fillRect(x - 4, y, 8, 1);
      cx.fillStyle = '#ffd23f'; cx.fillRect(x - (s > 0 ? 9 : -5), y, 4, 1);
      cx.fillStyle = '#ff7ae0'; cx.fillRect(x - (s > 0 ? 13 : -9), y, 4, 1);
    },
  };
  (w.actors ??= []).push(R.actor);
  ((z._reb ??= []) as Reb[]).push(R);
  z.reflected = true;
  w.fx('tag', 'REBATEU!', z.x, z.y - z.K.top * 0.5 - 14);
  spawnFx(w, 'hitspark', z.x + z.face * 16, z.y - 52, z.face);
  w.log(`${z.K.nome} rebateu o tiro com a sombrinha`);
}

function dropReb(w: World, R: Reb): void {
  R.done = true;
  if (w.actors) { const i = w.actors.indexOf(R.actor); if (i >= 0) w.actors.splice(i, 1); }
}

/** Move os tiros rebatidos e acerta o primeiro lutador na faixa. Exportado pros testes. */
export function tickReb(w: World, z: Zombie, dt: number): void {
  const list = z._reb as Reb[] | undefined; if (!list?.length) return;
  for (const R of list) {
    if (R.done) continue;
    const step = R.vx * dt;
    R.x += step; R.range -= Math.abs(step); R.actor.x = R.x;
    if (R.range <= 0 || R.x < w.cam - 20 || R.x > w.cam + w.W + 20) { dropReb(w, R); continue; }
    for (const f of aliveF(w)) {
      if (Math.abs(f.y - R.ly) < 12 && Math.abs(f.x - R.x) < 10 + Math.abs(step)) {
        hurtF(w, f, R.dmg);
        w.fx('burst', 'PÁ!', f.x, f.y - 62);
        dropReb(w, R);
        break;
      }
    }
  }
  z._reb = list.filter((R) => !R.done);
}

/** Defesa (registrada em GUARDS): rebate 1 tiro de frente por giro (null = absorvido), +25% no ajeito. */
export function frevistaGuard(w: World, z: Zombie, dmg: number, _n: number, by?: Fighter | null): number | null {
  if (by && !z.reflected && twirlGuarding(z) && fromFront(z, by) && isBullet(w, z, by)) { reflect(w, z, by, dmg); return null; }
  const out = (z.openT ?? 0) > 0 ? dmg * OPEN_MUL : dmg;
  if (Math.max(1, Math.round(out)) >= z.hp) for (const R of (z._reb as Reb[] | undefined) ?? []) dropReb(w, R); // morreu: some o que estava no ar
  return out;
}
(GUARDS as Record<string, Guard>).frevista = frevistaGuard;

/* ---------- tesoura ---------- */
/** Ponto de chegada da tesoura (atrás do alvo). */
export function tesouraEnd(z: Zombie, V: { x: number }): number {
  const dir = (Math.sign(V.x - z.x) || z.face) as 1 | -1;
  return V.x + dir * TS_BEHIND;
}
/** IA-42: pode fazer a tesoura (chegada longe da borda)? */
export function canTesoura(w: World, z: Zombie, V: { x: number }): boolean {
  const x1 = tesouraEnd(z, V);
  return x1 >= w.cam + EDGE && x1 <= w.cam + w.W - EDGE;
}

function startTesoura(z: Zombie, V: Fighter): void {
  z._ts = { x0: z.x, x1: tesouraEnd(z, V), hit: [] as Fighter[] };
}

function slideMs(z: Zombie): number {
  const A = z.K.F.ANIMS.tesoura, sl = (A?.slide as number[] | undefined) ?? [2, 4];
  let ms = 0; for (let i = sl[0]; i <= sl[1]; i++) ms += Number(A?.dur(i) ?? 90);
  return ms > 5 ? ms / 1000 : ms;
}

/** Desliza durante os quadros do slide e acerta quem cruzar (uma vez cada). */
function stepTesoura(w: World, z: Zombie, dt: number): void {
  const T = z._ts as { x0: number; x1: number; hit: Fighter[] } | undefined; if (!T) return;
  const A = z.K.F.ANIMS.tesoura, sl = (A?.slide as number[] | undefined) ?? [2, 4];
  if (z.fi < sl[0] || z.fi > sl[1]) return;
  const spd = Math.abs(T.x1 - T.x0) / slideMs(z), d = T.x1 - z.x;
  z.x += Math.sign(d) * Math.min(Math.abs(d), spd * dt);
  z.x = Math.max(w.cam + 14, Math.min(w.cam + w.W - 14, z.x));
  for (const f of aliveF(w)) {
    if (T.hit.includes(f) || f.down || Math.abs(f.x - z.x) > 14 || Math.abs(f.y - z.y) > 12) continue;
    T.hit.push(f);
    hurtF(w, f, z.K.dmg * 0.8 * z.dmgMul, { heavy: z.form === 'plenilunar' });
    if (z.form === 'plenilunar' && !f.down && f.state !== 'kd' && f.state !== 'getup') { // derruba só no plenilunar
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = z.face; }
      else stunF(w, f, 0.9, 'DERRUBADO');
    }
    w.fx('burst', 'TESOURA!', f.x, f.y - 50);
    z.hit = true;
  }
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

/** Tiro vindo na direção dele, ainda longe (gatilho do giro defensivo). */
function incoming(w: World, z: Zombie): { vx: number } | null {
  for (const p of w.proj ?? []) {
    if (p.kind !== 'bullet' || p.done || !p.vx) continue;
    const toward = Math.sign(z.x - p.x) === Math.sign(p.vx), d = Math.abs(z.x - p.x);
    if (toward && d > 24 && d < 150 && Math.abs((p.ly ?? p.y) - z.y) < 14) return { vx: p.vx };
  }
  return null;
}
const ready = (z: Zombie, anim: string) => ((z._mv as { mcd: Record<string, number> } | undefined)?.mcd?.[anim] ?? 0) <= 0;

export const frevista: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickReb(w, z, dt);
    if ((z.openT ?? 0) > 0) z.openT = Math.max(0, z.openT - dt);
    if (z.state === 'wander') { c.step(); if (c.adx < 200) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'open') { // IA-42: de costas, ajeitando o chapéu
      if (z.anim !== 'open') setAnim(z, z.K.F.ANIMS.open ? 'open' : 'idle');
      c.step();
      if ((z.openT ?? 0) <= 0) { z.openT = 0; toChase(z); }
      return;
    }
    if (z.state === 'attack') {
      if (z.anim === 'tesoura') stepTesoura(w, z, dt); else moveStep(c, MOVES);
      if (z.anim === 'twirl' && twirlSlow(z) !== 1) stepAnim(z, z.K.F.ANIMS.twirl, dt / twirlSlow(z), (_e, fi) => frevista.onFrame!(c, fi));
      else c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        z.reflected = false;
        if (was === 'tesoura') { // terminou atrás do alvo, DE COSTAS pra ele
          z._ts = null;
          z.face = (Math.sign(z.x - c.V.x) || z.face) as 1 | -1;
          z.state = 'open'; z.openT = OPEN_T; setAnim(z, z.K.F.ANIMS.open ? 'open' : 'idle');
          w.fx('tag', 'AJEITANDO!', z.x, z.y - z.K.top * 0.5 - 14);
        } else { z.state = 'cool'; z.cd = 0.5; setAnim(z, 'idle'); }
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // tiro vindo de longe: abre a sombrinha e vai na direção do atirador
    const inc = z.K.F.ANIMS.twirl && ready(z, 'twirl') ? incoming(w, z) : null;
    if (inc) {
      const mv = MOVES[1]; startMove(c, mv); z.face = (-Math.sign(inc.vx) || z.face) as 1 | -1; z.reflected = false;
      w.fx('tag', 'ABRIU!', z.x, z.y - z.K.top * 0.5 - 14);
      return;
    }
    if (c.adx < 56 && Math.abs(c.dy) < 14) {
      const list = canTesoura(w, z, c.V) ? MOVES : MOVES.filter((m) => m.anim !== 'tesoura');
      const mv = pickMove(c, list);
      if (mv) { startMove(c, mv); z.reflected = false; if (mv.anim === 'tesoura') startTesoura(z, c.V); return; }
    }
    // IA-41: zigue-zague na aproximação
    z.zzT = (z.zzT ?? 0) - dt;
    if (z.zzT <= 0) { z.zzT = ZZ_T; z.zz = (z.zz ?? -1) > 0 ? -1 : 1; }
    const y0 = z.y;
    setAnim(z, 'walk');
    c.chase(23, 28);
    if (c.adx > 44) { const d = c.V.y + (z.zz as number) * ZZ_AMP - y0; z.y = clampY(y0 + Math.sign(d) * Math.min(Math.abs(d), 40 * dt)); }
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c;
    if (z.anim === 'tesoura') {
      if (fi === 2) { w.warns = w.warns.filter((t) => t.owner !== z); spawnFx(w, 'dust', z.x, z.y, (-z.face) as 1 | -1); }
      return;
    }
    if (z.anim === 'twirl' && fi === 1) w.fx('tag', 'GIRA!', z.x, z.y - z.K.top * 0.5 - 10);
    if (z.anim === 'attack' && fi === 6 && z.form === 'plenilunar') { // sombrinha volta girando (golpe duplo)
      const d = (V.x - z.x) * z.face;
      if (!V.down && d > -8 && d < 38 && Math.abs(V.y - z.y) < 13) { hurtF(w, V, z.K.dmg * 0.5 * z.dmgMul); w.fx('burst', 'PLAFT!', (V.x + z.x) / 2, V.y - 60); }
      return;
    }
    moveFrame(c, fi, MOVES);
  },
};
