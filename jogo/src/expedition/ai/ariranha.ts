// Ariranha Zumbi (IA-40, IA-41 · Pantanal, comum animal): lontra gigante em família. Só aparece em áreas de água.
// - Mordidas (attack): boca aberta + recuo (aviso 200 ms, quadros 0–2), 3 mordidas nos quadros 3/5/7 somando ≈1,0× do
//   dano; a 3ª causa SANGRAMENTO por 2 s. Plenilunar morde 4× (4ª no quadro 8). Alcance 30 px, recarga 1,4 s.
// - Arrancada (dash): faixa curta na frente (aviso ~300 ms, quadros 0–2), desliza de barriga nos quadros 3–6 até
//   ~120 px; 0,6× de dano e DERRUBA quem pega de frente (cada lutador 1×). Recarga 5 s.
// - Guincho (call, IA-41): ergue o tronco (aviso 450 ms, quadros 0–3) e guincha no quadro 4 chamando 1 ariranha
//   (2 no enluarado/plenilunar) que chegam em até 3 s; no máximo 4 vivas. Recarga 14 s. Dano ≥ 15% da vida máxima
//   durante o aviso interrompe; matar a chamadora antes de o reforço chegar cancela o que falta.
// - Mergulho (IA-40): só em área de água (campo alagado, corixo, baía, ponte quebrada). Afunda e some por 1,2 s
//   (imune), aparece ATRÁS do alvo mordendo; marcador de bolhas no chão 0,6 s antes de emergir. Recarga 8 s.
// - FRAQUEZA: guinchando fica parada e VULNERÁVEL 0,8 s (+30% de dano) com o ventre exposto no periscópio.
// - Tática: em grupo guincha cedo e mergulha pra pegar pelas costas; sozinha e ferida (< 50%), foge (até 4 s).
// Estados próprios: 'under' (submersa; z.hidden = true pro render poder esconder a sombra) e 'flee'.
// Status no lutador: reaproveita f._bleed (mesmo formato e mesmo tick do Tuiuiú, tickBleed é idempotente por quadro).
import type { ZombieAI, ZCtx } from './index';
import { aliveF, clampY, curArena, setAnim, spawnFx, type Fighter, type World, type Zombie } from '../world';
import { GUARDS, mkZ, type Guard } from '../combat';
import { fa, hurtF, setF, stunF } from '../fighter';
import { tickBleed } from './tuiuiu';
import { endMove, moveFrame, moveStep, pickMove, startMove, tickMoves, type ZMove } from './moves';

export const MOVES: ZMove[] = [
  { anim: 'attack', w: 3, max: 30, dy: 9, cd: 1.4, dmg: 1.0, lunge: [0, -20, -20, 90, 0, 70, 0, 70, 0] },
  { anim: 'dash', w: 2, min: 40, max: 120, dy: 9, cd: 5, dmg: 0.6, warn: 'lane', lunge: [0, 0, 0, 390, 390, 360, 300, 0] },
];
/** mordida ao emergir (não é sorteada: só depois do mergulho) */
export const EMERGE: ZMove = { anim: 'emerge', w: 0, max: 0, dy: 10, cd: 0, dmg: 1.0, word: 'NHAC!', shake: 0.08 };
const ALL = [...MOVES, EMERGE];

export const BITES = 3;
export const bitesOf = (z: Zombie) => (z.form === 'plenilunar' ? 4 : BITES);
/** dano total das mordidas (fração do dano base), dividido igualmente entre os acertos */
export const BITE_TOTAL = 1.0;
export const BLEED_T = 2;
export const BLEED_FRAC = 0.3;
export const DASH_DMG = 0.6;

export const CALL_CD = 14;
export const CALL_R = 260;
export const CALL_MAX = 4;
export const callN = (z: Zombie) => (z.form === 'comum' ? 1 : 2);
/** chegada dos reforços (s depois do guincho) */
export const CALL_ARRIVE = [1.5, 3];
export const CALL_BREAK = 0.15;
export const VULN_T = 0.8;
export const VULN_MUL = 1.3;

export const WATER = new Set(['campoalagado', 'corixo', 'baia', 'pontequebrada', 'rio', 'ninhal', 'jofre']);
export const DIVE_T = 1.2;
export const DIVE_WARN = 0.6;
export const DIVE_CD = 8;
export const DIVE_MIN = 40;
export const DIVE_MAX = 220;
/** distância atrás do alvo onde emerge */
export const BEHIND = 26;

export const FLEE_HP = 0.5;
export const FLEE_MAX = 4;

const clock = (w: World) => w.clock ?? 0;

/** A arena atual é de água? (z._water força nos testes / cenários especiais) */
export function isWater(w: World, z?: Zombie): boolean {
  if (z?._water != null) return !!z._water;
  const id = curArena(w)?.area?.id;
  return !!id && WATER.has(id);
}

export const ariranhasVivas = (w: World, z: Zombie) => w.zs.filter((o) => o.kind === z.kind && !o.dead).length;
/** Sem nenhum outro zumbi vivo na arena. */
export const sozinha = (w: World, z: Zombie) => !w.zs.some((o) => o !== z && !o.dead);

/** Submersa (imune): estado 'under', fim do mergulho e o 1º quadro do emergir. */
export function isUnder(z: Zombie): boolean {
  if (z.state === 'under') return true;
  if (z.state !== 'attack') return false;
  return (z.anim === 'dive' && z.fi >= 3) || (z.anim === 'emerge' && z.fi <= 0);
}

/** Defesa: imune submersa; guincho interrompível; vulnerável +30% depois do guincho. */
export const ariranhaGuard: Guard = (w, z, dmg) => {
  if (isUnder(z)) return null;
  if (z.state === 'attack' && z.anim === 'call' && z.fi < (z.K.F.ANIMS.call?.call ?? 4)) {
    z._callDmg = (z._callDmg ?? 0) + dmg;
    if (z._callDmg >= z.maxhp * CALL_BREAK) interruptCall(w, z);
  }
  return clock(w) < (z._vulnUntil ?? -1) ? dmg * VULN_MUL : dmg;
};
(GUARDS as Record<string, Guard>).ariranha = ariranhaGuard;

function interruptCall(w: World, z: Zombie): void {
  endMove(w, z); z._callDmg = 0;
  if (z.state !== 'hurt') z.prev = 'chase';
  z.state = 'hurt'; setAnim(z, 'hurt');
  w.fx('tag', 'INTERROMPIDA!', z.x, z.y - z.K.top - 10);
}

/* ---------- sangramento (mesmo campo/tick do Tuiuiú) ---------- */
export function applyBleed(f: Fighter, total: number): void {
  const b = f._bleed as { t: number; dps: number; acc: number } | null | undefined;
  const t = Math.max(BLEED_T, b?.t ?? 0), sum = total + (b ? b.dps * b.t : 0);
  f._bleed = { t, dps: sum / t, acc: b?.acc ?? 0 };
}

/** Uma mordida (k = índice 0..n-1). Exportado pros testes. */
export function bite(w: World, z: Zombie, V: Fighter, k: number): boolean {
  const A = z.K.F.ANIMS.attack, reach = A?.reach ?? 30;
  const d = (V.x - z.x) * z.face;
  if (V.down || d < -8 || d > reach + 4 || Math.abs(V.y - z.y) > 13) return false;
  const n = bitesOf(z), hp0 = V.hp;
  hurtF(w, V, z.K.dmg * z.dmgMul * BITE_TOTAL / BITES);
  if (k === 2 && V.hp < hp0) { applyBleed(V, z.K.dmg * BLEED_FRAC * z.dmgMul); w.fx('tag', 'SANGRANDO', V.x, V.y - 90); }
  w.fx('burst', k === n - 1 ? 'NHAC!' : 'NHAC', (V.x + z.x) / 2, V.y - 56);
  z.hit = true;
  return true;
}

/** Arrancada: derruba quem estiver na frente (cada lutador 1×). Exportado pros testes. */
export function dashHit(w: World, z: Zombie): Fighter[] {
  const out: Fighter[] = [], hit: Set<Fighter> = (z._dashHit ??= new Set());
  for (const f of aliveF(w)) {
    if (hit.has(f)) continue;
    const d = (f.x - z.x) * z.face;
    if (d < -6 || d > 26 || Math.abs(f.y - z.y) > 11) continue;
    hit.add(f);
    hurtF(w, f, z.K.dmg * DASH_DMG * z.dmgMul, { heavy: true });
    if (!f.down && f.state !== 'kd' && f.state !== 'getup') {
      if (fa(f, 'launched') === 'launched') { f.state = 'kd'; setF(f, 'launched'); f.face = (-z.face) as 1 | -1; }
      else stunF(w, f, 0.8, 'DERRUBADO');
    }
    out.push(f);
  }
  if (out.length) { w.fx('burst', 'TCHUM!', out[0].x, out[0].y - 50); w.shake = Math.max(w.shake, 0.12); w.hitstop = Math.max(w.hitstop ?? 0, 0.04); }
  return out;
}

/* ---------- guincho: reforços ---------- */
/** Agenda os reforços (respeitando o máximo de 4 vivas). Exportado pros testes. */
export function doCall(w: World, z: Zombie): number {
  const n = Math.max(0, Math.min(callN(z), CALL_MAX - ariranhasVivas(w, z) - (z._calls?.length ?? 0)));
  z._calls = (z._calls ?? []).concat(CALL_ARRIVE.slice(0, n).map((dt) => clock(w) + dt));
  z._vulnUntil = clock(w) + VULN_T;
  w.fx('burst', 'IIIRRRK!', z.x, z.y - z.K.top - 8);
  w.fx('tag', 'VULNERÁVEL', z.x, z.y - z.K.top - 22);
  w.shake = Math.max(w.shake, 0.06);
  w.log(`${z.K.nome} guinchou chamando o bando`);
  return n;
}

/** Faz chegar os reforços na hora (enquanto a chamadora estiver viva). Exportado pros testes. */
export function tickCalls(w: World, z: Zombie): void {
  const q: number[] | undefined = z._calls; if (!q?.length) return;
  if (z.dead) { z._calls = []; return; }
  const t = clock(w);
  while (q.length && q[0] <= t) {
    q.shift();
    if (!w.zk?.[z.kind] || ariranhasVivas(w, z) >= CALL_MAX) continue;
    const left = (z.x - w.cam) > w.W / 2;
    const x = left ? w.cam - 22 : w.cam + w.W + 22, y = clampY(z.y + (Math.random() - 0.5) * 40);
    const r = mkZ(w, z.kind, x, y, (left ? 1 : -1) as 1 | -1, 'chase', 'walk');
    r._callReady = t + CALL_CD; // reforço não chama outro reforço logo de cara
    spawnFx(w, 'dust', x, y, r.face);
  }
}

/* ---------- mergulho ---------- */
/** Ponto atrás do alvo (lado oposto ao que ele olha), dentro da tela. */
export function behindOf(w: World, V: Fighter): { x: number; y: number } {
  let x = V.x - V.face * BEHIND;
  if (x < w.cam + 16 || x > w.cam + w.W - 16) x = V.x + V.face * BEHIND;
  return { x: Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, x)), y: clampY(V.y) };
}

function goUnder(w: World, z: Zombie): void {
  endMove(w, z);
  z.state = 'under'; z.hidden = true; z._underT = 0; z._mark = null;
  setAnim(z, 'dive'); z.fi = (z.K.F.ANIMS.dive?.n ?? 6) - 1; z.hold = true;
}

/** Submersa: aos 0,6 s marca as bolhas atrás do alvo, aos 1,2 s emerge lá mordendo. Exportado pros testes. */
export function tickUnder(c: ZCtx): void {
  const { z, w, dt, V } = c;
  z._underT = (z._underT ?? 0) + dt;
  if (!z._mark && z._underT >= DIVE_T - DIVE_WARN) {
    z._mark = behindOf(w, V);
    w.warns.push({ kind: 'circle', x: z._mark.x, y: z._mark.y, r: 16, owner: z, c: '#bfe8ff' } as any);
    spawnFx(w, 'dust', z._mark.x, z._mark.y, 1);
  }
  if (z._underT >= DIVE_T) {
    const m = z._mark ?? behindOf(w, V);
    z.x = m.x; z.y = m.y; z.hidden = false; z.hold = false;
    w.warns = w.warns.filter((t) => t.owner !== z);
    const cc = { ...c, dx: V.x - z.x, adx: Math.abs(V.x - z.x), dy: V.y - z.y };
    startMove(cc, EMERGE);
    w.fx('tag', 'EMERGIU!', z.x, z.y - z.K.top - 8);
  }
}

function toChase(z: Zombie): void { z.state = 'chase'; setAnim(z, 'walk'); }

function tryCall(c: ZCtx): boolean {
  const { z, w } = c;
  if (!z.K.F.ANIMS.call || clock(w) < (z._callReady ?? 0)) return false;
  if (ariranhasVivas(w, z) + (z._calls?.length ?? 0) >= CALL_MAX) return false;
  if (c.adx > CALL_R + 120) return false;
  z._callReady = clock(w) + CALL_CD; z._callDmg = 0;
  startMove(c, { anim: 'call', w: 0, max: 0, cd: 0 });
  w.fx('tag', 'GUINCHO!', z.x, z.y - z.K.top - 8);
  return true;
}

function tryDive(c: ZCtx): boolean {
  const { z, w } = c;
  if (!z.K.F.ANIMS.dive || !isWater(w, z) || clock(w) < (z._diveReady ?? 0)) return false;
  if (c.adx < DIVE_MIN || c.adx > DIVE_MAX) return false;
  z._diveReady = clock(w) + DIVE_CD;
  startMove(c, { anim: 'dive', w: 0, max: 0, cd: 0 });
  spawnFx(w, 'dust', z.x + z.face * 10, z.y, z.face);
  return true;
}

export const ariranha: ZombieAI = {
  rest: 'chase',
  update(c: ZCtx) {
    const { z, w, dt } = c;
    tickMoves(z, dt);
    tickBleed(w, dt);
    tickCalls(w, z);
    if (z._callReady == null) z._callReady = clock(w) + 1.2; // guincha cedo
    if (z.state === 'under') { tickUnder(c); return; }
    if (z.state === 'wander') { c.step(); if (c.adx < 230) { z.state = 'alert'; setAnim(z, z.K.F.ANIMS.alert ? 'alert' : 'idle'); z.face = (Math.sign(c.dx) || 1) as 1 | -1; } return; }
    if (z.state === 'alert') { c.step(); if (z.done || !z.K.F.ANIMS.alert) toChase(z); return; }
    if (z.state === 'attack') {
      moveStep(c, ALL);
      if (z.anim === 'dash') { const A = z.K.F.ANIMS.dash, r = A?.run ?? [3, 6]; if (z.fi >= r[0] && z.fi <= r[1]) dashHit(w, z); }
      c.step(true);
      if (z.done) {
        const was = z.anim;
        if (was === 'dive') { goUnder(w, z); return; }
        endMove(w, z); z._dashHit = null;
        z.state = 'cool'; z.cd = was === 'call' ? 0.25 : 0.5; setAnim(z, 'idle');
      }
      return;
    }
    if (z.state === 'cool') { c.step(); if (z.cd <= 0) toChase(z); return; }
    // sozinha e ferida: foge (tempo limitado; encurralada na borda, briga)
    if (sozinha(w, z) && z.hp < z.maxhp * FLEE_HP && (z._fleeT ?? 0) < FLEE_MAX) {
      if (tryCall(c)) return;
      const edge = z.x < w.cam + 24 || z.x > w.cam + w.W - 24;
      if (!edge && c.adx < 150) {
        z.state = 'flee'; z._fleeT = (z._fleeT ?? 0) + dt;
        z.face = (-Math.sign(c.dx) || 1) as 1 | -1; setAnim(z, 'walk');
        z.x = Math.max(w.cam + 16, Math.min(w.cam + w.W - 16, z.x - Math.sign(c.dx) * 30 * dt));
        z.y = clampY(z.y - Math.sign(c.dy) * 10 * dt);
        c.step(); return;
      }
    }
    if (z.state === 'flee') z.state = 'chase';
    // em grupo: guincha cedo e mergulha pra pegar pelas costas
    if (tryCall(c)) return;
    if (tryDive(c)) return;
    if (c.adx < 124 && Math.abs(c.dy) < 14) { const mv = pickMove(c, MOVES); if (mv) { startMove(c, mv); return; } }
    setAnim(z, 'walk');
    c.chase(24, 24);
  },
  onFrame(c: ZCtx, fi: number) {
    const { z, w, V } = c, A = z.K.F.ANIMS[z.anim];
    if (z.anim === 'attack') {
      const hf: number[] = [...(A?.hit ?? [3, 5, 7])];
      if (z.form === 'plenilunar') hf.push((A?.n ?? 9) - 1);
      const k = hf.indexOf(fi);
      if (k >= 0) bite(w, z, V, k);
      return;
    }
    if (z.anim === 'call') {
      if (fi === (A?.call ?? 4)) { w.warns = w.warns.filter((t) => t.owner !== z); doCall(w, z); }
      return;
    }
    if (z.anim === 'dash') { if (fi === (A?.run?.[0] ?? 3)) w.warns = w.warns.filter((t) => t.owner !== z); return; }
    if (z.anim === 'emerge') { if (fi === 1) spawnFx(w, 'dust', z.x, z.y, z.face); moveFrame(c, fi, ALL); return; }
  },
};
