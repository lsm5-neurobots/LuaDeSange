// Escolha de golpes do auto-combate (src/expedition/moveset.ts): pesos, recargas, sem repetir 3× e chefes sem agarrão.
import { describe, expect, it } from 'vitest';
import { chooseClose, grabbable, isX, tickMoveset } from '../src/expedition/moveset';

const ANIMS: Record<string, any> = {
  combo: { n: 1 }, launcher: { n: 1, kind: 'launcher' }, airCombo: { n: 1, kind: 'juggle' }, grab: { n: 1, kind: 'grab' }, throw: { n: 1, kind: 'throw' },
  areaSpin: { n: 1, kind: 'area' }, backstep: { n: 1, kind: 'dodge' },
  sigA: { n: 1, kind: 'sig', sig: 1, cd: 7 }, sigP: { n: 1, kind: 'sig', sig: 1, cd: 7, fam: 'pistola' },
};
const zb = (o: any = {}) => ({ uid: Math.random(), kind: 'errante', K: { w: 12, top: 100, F: { ANIMS: {} } }, x: 120, y: 178, z: 0, hp: 50, maxhp: 50, dead: false, down: null, air: null, state: 'chase', boss: false, ...o });
const mk = (zs: any[], fam = 'bastao') => {
  const f: any = { rig: 'generic', art: { F: { ANIMS } }, fam, w: { tipo: fam === 'bastao' ? 'melee' : 'bullet' }, x: 100, y: 178, z: 0, face: 1, fi: 0, acc: 0, hold: false };
  const w: any = { zs, A: { TWEEN: { track: () => 0 } } };
  return { f, w };
};

describe('moveset do squad', () => {
  it('chefe, rastejante, escudo erguido e quem já está no ar não podem ser agarrados', () => {
    expect(grabbable(zb() as any)).toBe(true);
    expect(grabbable(zb({ boss: true }) as any)).toBe(false);
    expect(grabbable(zb({ kind: 'rastejante' }) as any)).toBe(false);
    expect(grabbable(zb({ shielded: true }) as any)).toBe(false);
    expect(grabbable(zb({ air: { vz: 1, vx: 0, spin: 0 } }) as any)).toBe(false);
  });

  it('nunca escolhe o mesmo tipo de golpe 3× seguidas', () => {
    const T = zb(), { f, w } = mk([T, zb({ x: 150 })]);
    const seq: string[] = [];
    for (let i = 0; i < 400; i++) {
      tickMoveset(w, f, 10, undefined); // zera recargas pra forçar repetição se a regra falhar
      const a = chooseClose(w, f, T as any);
      seq.push(a === 'COMBO' ? 'combo' : ANIMS[a]?.kind === 'sig' ? 'sig:' + a : ANIMS[a]?.kind ?? a);
    }
    for (let i = 2; i < seq.length; i++) expect(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]).toBe(false);
    expect(new Set(seq).size).toBeGreaterThanOrEqual(4);
  });

  it('contra chefe: sem agarrão, sem lançador; assinatura de outra arma não entra', () => {
    const T = zb({ boss: true }), { f, w } = mk([T]);
    for (let i = 0; i < 300; i++) {
      tickMoveset(w, f, 10, undefined);
      const a = chooseClose(w, f, T as any);
      expect(['grab', 'launcher', 'sigP']).not.toContain(a);
    }
  });

  it('cercado (zumbis dos dois lados) puxa o giro em área', () => {
    const T = zb(), { f, w } = mk([T, zb({ x: 80 })]);
    let area = 0;
    for (let i = 0; i < 300; i++) { tickMoveset(w, f, 10, undefined); if (chooseClose(w, f, T as any) === 'areaSpin') area++; }
    expect(area).toBeGreaterThan(30);
  });

  it('isX reconhece golpes com efeitos novos', () => {
    expect(isX({ m: 1, both: 1 })).toBe(true);
    expect(isX({ m: 1, held: 1 })).toBe(true);
    expect(isX({ m: 1, heavy: 1, knock: 1 })).toBe(false);
  });
});
