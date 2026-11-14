import { describe, it, expect } from 'vitest';
import { newGame } from '../src/game/state';
import { camas } from '../src/game/shelter';
import { buildExpedition } from '../src/game/team';
import { applyExpedition } from '../src/game/rewards';
import { PRIMEIRA_FACIL } from '../src/data/balance';
import { fresh, result } from './helpers';

describe('onboarding', () => {
  it('save novo já começa com a Barraca nv1 (2 camas)', () => {
    const s = newGame(1_000);
    expect(s.estruturas.barraca?.nv).toBe(1);
    expect(camas(s)).toBe(2);
  });
  it('só a 1ª expedição é marcada como primeira (zumbis mais fracos)', () => {
    const s = newGame(1_000);
    expect(PRIMEIRA_FACIL).toBeLessThan(1);
    expect(buildExpedition(s, ['hero'], null).primeira).toBe(true);
    s.expedicoes = 1;
    expect(buildExpedition(s, ['hero'], null).primeira).toBe(false);
  });
  it('se a 1ª expedição cair, volta com todo o loot; as outras perdem metade', () => {
    const a = fresh(); a.expedicoes = 0;
    const ra = applyExpedition(a, result({ sucesso: false, primeira: true, loot: { madeira: 5 } }), () => 0.999);
    expect(ra.loot.madeira).toBe(5);
    const b = fresh(); b.expedicoes = 5;
    const rb = applyExpedition(b, result({ sucesso: false, loot: { madeira: 5 } }), () => 0.999);
    expect(rb.loot.madeira).toBe(2);
  });
});
