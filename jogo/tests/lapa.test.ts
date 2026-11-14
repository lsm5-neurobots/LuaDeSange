import { describe, it, expect } from 'vitest';
import { MAPS } from '../src/data/maps';
import { ZOMBIES } from '../src/data/zombies';
import { LEMBRANCAS } from '../src/data/lembrancas';

const all = (id: string) => Object.values(MAPS[id].ondas).flat(2) as string[];
const IDS = ['central', 'municipal', 'catedral', 'lavradio', 'selaron', 'circo', 'boemia', 'santateresa', 'guimaraes', 'mirante', 'arcos'];

describe('mapa Lapa', () => {
  const m = MAPS.lapa;
  it('está registrado e requer o Ver-o-Peso', () => {
    expect(m).toBeTruthy();
    expect(m.requer).toBe('veropeso');
    expect(m.art).toBe('LAPA');
    expect(m.nivelRecomendado).toBe(18);
  });
  it('tem as 11 áreas na ordem', () => {
    expect(m.areas).toBe(11);
    expect(Object.keys(m.ondas)).toEqual(IDS);
    expect(m.semVasculhar).toEqual(['arcos']);
  });
  it('lista final de 12 tipos, sem gritador, com Vendedor de Fitas na boemia', () => {
    expect([...new Set(all('lapa'))].sort()).toEqual(['blindado', 'corredor', 'cuspidor', 'errante', 'garcom', 'grafiteiro', 'maquinista', 'malandro', 'passista', 'saltador', 'seresteiro', 'vendedorfitas'].filter((k) => k !== 'garcom' || ZOMBIES.garcom.art).sort());
    expect(m.ondas.boemia[1]).toContain('vendedorfitas');
    expect(all('pelourinho')).toContain('vendedorfitas');
    for (const [a, ws] of Object.entries(m.ondas)) expect((ws.flat() as string[]).includes('vendedorfitas')).toBe(a === 'boemia');
  });
  it('usa 9 a 12 tipos de zumbi', () => {
    const n = new Set(all('lapa')).size;
    expect(n).toBeGreaterThanOrEqual(9);
    expect(n).toBeLessThanOrEqual(12);
  });
  it('passista só no circo, maquinista só nos arcos', () => {
    for (const [a, ws] of Object.entries(m.ondas)) {
      const zs = ws.flat() as string[];
      expect(zs.includes('passista')).toBe(a === 'circo');
      expect(zs.includes('maquinista')).toBe(a === 'arcos');
    }
    expect(m.ondas.arcos).toEqual([['maquinista']]);
    expect(m.ondas.circo[1]).toEqual(['passista']);
  });
  it('malandro é local da Lapa', () => {
    expect(all('lapa')).toContain('malandro');
    for (const o of ['marco_zero', 'olinda', 'pelourinho', 'veropeso']) {
      expect(all(o)).not.toContain('malandro');
      expect(all(o)).not.toContain('passista');
      expect(all(o)).not.toContain('maquinista');
    }
  });
  it('tem 3 lembranças', () => {
    expect(LEMBRANCAS.filter((l) => l.mapa === 'lapa')).toHaveLength(3);
  });
});
