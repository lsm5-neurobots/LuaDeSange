// Variantes locais: Zumbi Percussionista (ritmo acelera a horda) e Zumbi Barqueiro (remo/rede) — mundo mínimo, sem arte.
import { describe, it, expect } from 'vitest';
import { REGISTRY } from '../src/expedition/ai';
import { applyBeat, hasteK } from '../src/expedition/ai/percussionista';
import { ZOMBIES } from '../src/data/zombies';
import { MAPS } from '../src/data/maps';
import type { World, Zombie } from '../src/expedition/world';

function world(): World {
  return { zs: [], fs: [], sparks: [], fx() {}, log() {} } as unknown as World;
}
function zombie(w: World, kind: string, x: number, form = 'comum'): Zombie {
  const z: any = { kind, K: { ...(ZOMBIES as any)[kind], top: 110 }, form, x, y: 178, dead: false, boss: false };
  w.zs.push(z); return z;
}

describe('variantes locais', () => {
  it('estão registradas com arte e IA próprias', () => {
    expect(REGISTRY.percussionista).toBeTruthy();
    expect(REGISTRY.barqueiro).toBeTruthy();
    expect(ZOMBIES.percussionista.art).toBe('PERCUSSIONISTA');
    expect(ZOMBIES.barqueiro.art).toBe('BARQUEIRO');
  });
  it('entram nas ondas só do seu mapa', () => {
    const all = (id: string) => Object.values(MAPS[id].ondas).flat(2) as string[];
    expect(all('pelourinho')).toContain('percussionista');
    expect(all('veropeso')).toContain('barqueiro');
    expect(all('pelourinho')).not.toContain('barqueiro');
    expect(all('veropeso')).not.toContain('percussionista');
    expect(all('marco_zero')).not.toContain('percussionista');
  });
  it('o ritmo acelera quem está perto e acaba quando o Percussionista morre', () => {
    const w = world(); const p = zombie(w, 'percussionista', 200);
    const perto = zombie(w, 'errante', 260), longe = zombie(w, 'errante', 400);
    expect(applyBeat(w, p)).toBe(1);
    expect(hasteK(w, perto, 0.1)).toBeCloseTo(1.2);
    expect(hasteK(w, longe, 0.1)).toBe(1);
    p.dead = true;
    expect(hasteK(w, perto, 0.1)).toBe(1);
  });
  it('ritmo: plenilunar acelera mais, enluarado dura mais e o efeito expira', () => {
    const w = world(); const p = zombie(w, 'percussionista', 200, 'plenilunar'); const a = zombie(w, 'errante', 230);
    applyBeat(w, p); expect(hasteK(w, a, 0.1)).toBeCloseTo(1.3);
    const w2 = world(); const q = zombie(w2, 'percussionista', 200, 'enluarado'); const b = zombie(w2, 'errante', 230);
    applyBeat(w2, q); expect(b.hasteT).toBe(8);
    expect(hasteK(w2, b, 9)).toBe(1);
  });
});
