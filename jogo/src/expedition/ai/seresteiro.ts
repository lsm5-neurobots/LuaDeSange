// Zumbi Seresteiro (IA-55..57, Lapa): controle de área — o canto da serenata adormece quem está em volta.
// - Serenata (`serenata`): planta os pés e inala com CÍRCULO no chão (raio 80 px; 96 enluarado) por 400 ms
//   (quadros antes de `sing`). No quadro `sing` todo lutador no círculo leva 0,3x e ADORMECE (stunF) 1,0 s
//   (1,5 s enluarado/plenilunar). Não acumula: quem acabou de dormir fica imune 3 s. Plenilunar solta uma 2ª onda
//   (quadro `sing2`, raio 15% maior, só dano). Recarga 9 s.
//   FRAQUEZA: sair do círculo, ou interromper durante o aviso — golpe forte (n=3) ou 25% da vida em 0,4 s cancela
//   (DESAFINOU!, fica tonto 0,5 s).
// - Acorde (`strum`): 0,8x a 40 px na frente, empurra 14 px, recarga 2,4 s.
// - Quebra o violão (`smash`): só de perto (< 34 px; prefere quando acuado, < 20 px), 1,3x, recarga 12 s. Depois fica
//   4 s SEM VIOLÃO (idleNo/walkNo): sem serenata nem acorde, só soco 0,5x.
// - De costas ele não vira rápido: leva 0,5 s pra girar (não ataca quem está atrás dele enquanto isso).
// - IA-57 (palco): com 2+ seresteiros na onda, só um canta por vez; o próximo espera o fim do canto + 3 s.
import type { ZombieAI, ZCtx } from './index';
import { aliveF, setAnim, spawnFx, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, type Guard } from '../combat';
import { hurtF, stunF } from '../fighter';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const SER = {
  singR: 80, singRMoon: 96, singDmg: 0.3, wave2K: 1.15, immune: 3,
  interruptFrac: 0.25, interruptWin: 0.4, dazeT: 0.5,
  noGuitarT: 4, punchMul: 0.5, turnT: 0.5, relay: 3, keep: 66,
};
/** raio da serenata */
export const singRadius = (z: Zombie) => (z.form === 'enluarado' ? SER.singRMoon : SER.singR);
/** tempo de sono da serenata */
export const sleepTime = (z: Zombie) => (z.form === 'comum' ? 1.0 : 1.5);

const MOVES: ZMove[] = [
  { anim: 'strum', w: 3, max: 40, dy: 9, cd: 2.4, dmg: 0.8, push: 14, word: 'DÉÉÉM!' },
  { anim: 'smash', w: 1, max: 34, dy: 9, cd: 12, dmg: 1.3, word: 'CRÁÁS!', shake: 0.16, lunge: [0, 0, 20, 60, 10, 0, 0, 0] },
];
const SING: ZMove = { anim: 'serenata', w: 2, max: 999, dy: 99, cd: 9, dmg: 0 };
const NOGTR: ZMove[] = [{ anim: 'punch', w: 1, max: 30, dy: 9, cd: 1.2, dmg: SER.punchMul, push: 4, word: 'POF!' }];

const now = (w: World) => w.clock ?? 0;
const mcd = (z: Zombie, a: string): number => (z._mv?.mcd?.[a] ?? 0);

/* ---------- palco (IA-57): um canta por vez ---------- */
const STAGE = new WeakMap<World, { owner: Zombie | null; until: number }>();
const stage = (w: World) => { let s = STAGE.get(w); if (!s) { s = { owner: null, until: -1 }; STAGE.set(w, s); } return s; };
/** este seresteiro pode cantar agora (ninguém mais está no palco)? */
export function canSing(w: World, z: Zombie): boolean {
  const s = stage(w);
  return !s.owner || s.owner === z || s.owner.dead || now(w) >= s.until;
}
function songDur(z: Zombie): number { const A = z.K.F.ANIMS.serenata; if (!A) return 1.3; let ms = 0; for (let i = 0; i < A.n; i++) ms += Number(A.dur(i)); return ms / 1000; }

/* ---------- sono (estado no lutador) ---------- */
/** imune à serenata agora? */
export const sleepImmune = (w: World, f: Fighter) => now(w) < (f.serImmUntil ?? -1);

/** Onda da serenata em volta do seresteiro. Retorna quem ADORMECEU. Exportado pros testes. */
export function serenadeHit(w: World, z: Zombie, second = false): Fighter[] {
  const R = singRadius(z) * (second ? SER.wave2K : 1), out: Fighter[] = [];
  for (const f of aliveF(w)) {
    if (f.down || Math.hypot(f.x - z.x, (f.y - z.y) * 2) >= R) continue;
    hurtF(w, f, z.K.dmg * SER.singDmg * z.dmgMul);
    if (second || sleepImmune(w, f) || f.down || f.state === 'kd' || f.state === 'getup') continue;
    const t = sleepTime(z);
    stunF(w, f, t, 'ADORMECEU');
    f.serImmUntil = now(w) + t + SER.immune;
    out.push(f);
  }
  w.fx('burst', second ? '♪♫!' : '♪ LÁ-LÁ-LÁ ♪', z.x, z.y - z.K.top - 10);
  return out;
}

/* ---------- interrupção (defesa registrada em GUARDS) ---------- */
/** está no aviso da serenata (inalando, antes do quadro `sing`)? */
export function inSingWarn(z: Zombie): boolean {
  const A = z.K.F.ANIMS.serenata;
  return z.state === 'attack' && z.anim === 'serenata' && z.fi < (A?.sing ?? 3);
}
export const seresteiroGuard: Guard = (w, z, dmg, n) => {
  if (z.hp - Math.max(1, Math.round(dmg)) <= 0) clearSfx(z); // golpe fatal: a morte desenha o violão caindo
  const T = now(w), log: { t: number; d: number }[] = (z._dl ??= []);
  log.push({ t: T, d: dmg });
  while (log.length && T - log[0].t > SER.interruptWin) log.shift();
  if (inSingWarn(z)) {
    const sum = log.reduce((s, e) => s + e.d, 0);
    if (n === 3 || sum >= z.maxhp * SER.interruptFrac) interruptSong(w, z);
  }
  return dmg;
};
GUARDS.seresteiro = seresteiroGuard;

function interruptSong(w: World, z: Zombie): void {
  endMove(w, z);
  const s = stage(w); if (s.owner === z) s.until = now(w); // libera o palco
  z.prev = 'chase'; z.state = 'hurt'; setAnim(z, 'hurt');
  z.stun = Math.max(z.stun, SER.dazeT);
  w.fx('tag', 'DESAFINOU!', z.x, z.y - z.K.top * 0.5 - 14);
  w.log(`${z.K.nome} desafinou: serenata interrompida`);
}

/* ---------- sem violão ---------- */
export const unarmed = (w: World, z: Zombie) => now(w) < (z.noGtrUntil ?? -1);
/** forma da arte sem violão: render.ts monta '<forma>~sem' quando z.formSfx existe */
type ZS = Zombie & { formSfx?: string };
function clearSfx(z: Zombie): void { delete (z as ZS).formSfx; }
/** mantém z.formSfx em dia com o tempo sem violão (e limpo se morreu) */
export function syncSfx(w: World, z: Zombie): void {
  if (!z.dead && z.hp > 0 && unarmed(w, z)) (z as ZS).formSfx = 'sem'; else clearSfx(z);
}
const walkA = (w: World, z: Zombie) => (unarmed(w, z) && z.K.F.ANIMS.walkNo ? 'walkNo' : 'walk');
const idleA = (w: World, z: Zombie) => (unarmed(w, z) && z.K.F.ANIMS.idleNo ? 'idleNo' : 'idle');

function startSing(c: ZCtx): void {
  const { z, w } = c;
  startMove(c, SING);
  const s = stage(w); s.owner = z; s.until = now(w) + songDur(z) + SER.relay;
  w.warns.push({ kind: 'circle', x: z.x, y: z.y, r: singRadius(z), owner: z, c: 'rgba(255,220,120,' } as any);
  w.fx('tag', 'INALA...', z.x, z.y - z.K.top * 0.5 - 14);
}

/** Gira devagar: só vira de frente pro alvo depois de 0,5 s com ele atrás. Retorna true se está de frente. */
export function slowTurn(z: Zombie, dx: number, dt: number): boolean {
  if (Math.abs(dx) < 4 || Math.sign(dx) === z.face) { z.turnT = 0; return true; }
  z.turnT = (z.turnT ?? 0) + dt;
  if (z.turnT >= SER.turnT) { z.face = (-z.face) as 1 | -1; z.turnT = 0; return true; }
  return false;
}

function toChase(w: World, z: Zombie): void { z.state = 'chase'; setAnim(z, walkA(w, z)); }

export const seresteiro: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    syncSfx(w, z);
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(w, z); return; }
    if (z.state === 'attack') {
      moveStep(c, MOVES); c.step(true);
      if (z.done) {
        const was = z.anim; endMove(w, z);
        if (was === 'smash') { z.noGtrUntil = now(w) + SER.noGuitarT; syncSfx(w, z); w.fx('tag', 'SEM VIOLÃO!', z.x, z.y - z.K.top * 0.5 - 14); }
        z.state = 'cool'; z.cd = was === 'serenata' ? 0.5 : 0.45; setAnim(z, idleA(w, z));
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(w, z); return; }
    // giro lento: com o alvo atrás, fica parado tocando até virar
    const facing = slowTurn(z, c.dx, dt);
    if (!facing) { setAnim(z, idleA(w, z)); c.step(); return; }
    if (Math.abs(c.dy) < 40 && z.cd <= 0) {
      if (unarmed(w, z)) { const mv = pickMove(c, NOGTR); if (mv) { startMove(c, mv); return; } }
      else {
        // acuado: quebra o violão
        if (c.adx < 20 && Math.abs(c.dy) < 10 && mcd(z, 'smash') <= 0 && z.K.F.ANIMS.smash) { startMove(c, MOVES[1]); return; }
        // serenata quando o alvo está no círculo e o palco está livre
        if (z.K.F.ANIMS.serenata && mcd(z, 'serenata') <= 0 && canSing(w, z) && Math.hypot(c.dx, c.dy * 2) < singRadius(z) - 6) { startSing(c); return; }
        if (c.adx < 44 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
      }
    }
    // anda devagar até o alcance do canto (ou do soco, sem violão); com o canto em recarga, encosta pro acorde
    const stop = unarmed(w, z) ? 24 : mcd(z, 'serenata') > 0 ? 32 : SER.keep;
    if (c.adx > stop + 4 || Math.abs(c.dy) > 10) { setAnim(z, walkA(w, z)); c.chase(unarmed(w, z) ? 22 : 15, stop); }
    else { setAnim(z, idleA(w, z)); z.face = (Math.sign(c.dx) || z.face) as 1 | -1; c.step(); }
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'serenata') {
      if (fi === (A?.sing ?? 3)) { w.warns = w.warns.filter((t) => t.owner !== z); serenadeHit(w, z); z.hit = true; spawnFx(w, 'dust', z.x, z.y, z.face); }
      if (z.form === 'plenilunar' && fi === (A?.sing2 ?? 5)) serenadeHit(w, z, true);
      return;
    }
    if (z.anim === 'smash' && fi === (A?.hit ?? 3)) { spawnFx(w, 'dust', z.x + z.face * 30, z.y, z.face); w.hitstop = Math.max(w.hitstop ?? 0, 0.05); }
    moveFrame(c, fi, z.anim === 'punch' ? NOGTR : MOVES);
  },
};
