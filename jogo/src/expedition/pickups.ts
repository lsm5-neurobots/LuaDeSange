// Coletáveis físicos: saltam de zumbis/objetos/baús, quicam, brilham e voam até o lutador mais perto.
import { RESOURCES, type Bag, type ResId } from '../data/resources';
import { aliveF, clampY, rnd, spawnFx, type World } from './world';

export function dropItem(w: World, id: string, n: number, x: number, y: number, spread = 1): void {
  const k = Math.min(4, Math.max(1, Math.ceil(n / 2))); // várias unidades viram 1–4 itens no chão
  for (let i = 0; i < k; i++) {
    w.items.push({ id, n: i === 0 ? n : 0, x: x + (rnd() - 0.5) * 6, y: clampY(y + (rnd() - 0.5) * 10), z: 14, vx: (rnd() - 0.5) * 70 * spread, vz: 90 + rnd() * 60, t: 0, fi: Math.floor(rnd() * 6), state: 'pop' });
  }
}

/** Sorteia o loot da arena quando a onda nasce; cada abate solta uma parte junto do corpo. */
export function rollArenaLoot(w: World, nZumbis: number, mult = 1): void {
  const m = mult * (1 + w.ai * 0.06) * w.cfg.bonus.loot * (w.mode === 'lua' ? 1.5 : 1);
  const b: Bag = {};
  for (const [r, v] of Object.entries(w.map.loot.porArena)) { const q = Math.floor((v ?? 0) * m * (0.6 + rnd() * 0.8)); if (q > 0) b[r as ResId] = q; }
  w.arenaLoot = b; w.arenaKillsLeft = Math.max(1, nZumbis);
}

/** Abate na arena: credita e solta no corpo a parte do loot que cabe a este zumbi (o último leva o resto). */
export function arenaDrop(w: World, x: number, y: number): void {
  w.lastKillAt = { x, y };
  const b = w.arenaLoot;
  if (!b) return;
  const left = w.arenaKillsLeft ?? 1;
  for (const [r, v] of Object.entries(b) as [ResId, number][]) {
    if (v <= 0) continue;
    // parte média v/left, com sorte pra cima ou pra baixo; o último abate leva tudo
    const q = left <= 1 ? v : Math.min(v, Math.floor((v / left) * (0.5 + rnd()) + rnd()));
    if (q <= 0) continue;
    b[r] = v - q;
    w.bag[r] = (w.bag[r] ?? 0) + q;
    dropItem(w, r, q, x, y);
  }
  w.arenaKillsLeft = Math.max(1, left - 1);
}

/** Arena limpa: o que sobrou (zumbis extras/invocados mudam a conta) cai no último corpo. */
export function flushArenaLoot(w: World): void {
  const at = w.lastKillAt ?? { x: w.cam + w.W / 2, y: 170 };
  w.arenaKillsLeft = 1;
  arenaDrop(w, at.x, at.y);
  w.arenaLoot = undefined;
}

const nome = (id: string) => (id in RESOURCES ? RESOURCES[id as ResId].nome.toLowerCase() : id);

export function updatePickups(w: World, dt: number): void {
  for (const it of w.items) {
    it.t += dt;
    it.fi += dt * 10;
    if (it.state === 'pop') {
      it.x += it.vx * dt; it.z += it.vz * dt; it.vz -= 420 * dt; it.vx *= Math.pow(0.3, dt);
      if (it.z <= 0) { it.z = 0; if (it.vz < -60) it.vz = -it.vz * 0.35; else { it.vz = 0; it.state = 'rest'; it.t = 0; } }
    } else if (it.state === 'rest') {
      if (it.t > 0.35) it.state = 'magnet';
    } else {
      const f = aliveF(w).sort((a, b) => Math.abs(a.x - it.x) - Math.abs(b.x - it.x))[0];
      if (!f) continue;
      const dx = f.x - it.x, dy = f.y - it.y, d = Math.hypot(dx, dy), sp = 140 + it.t * 260;
      if (d < 8) {
        it.t = -1;
        if (it.n) w.fx('tag', '+' + it.n + ' ' + nome(it.id), f.x, f.y - 70);
        spawnFx(w, 'pickup', f.x, f.y - 34, 1, undefined, 24, true);
        continue;
      }
      it.x += (dx / d) * Math.min(d, sp * dt); it.y += (dy / d) * Math.min(d, sp * dt);
      it.z = Math.min(26, it.z + 60 * dt);
    }
  }
  w.items = w.items.filter((it) => it.t >= 0);
}
