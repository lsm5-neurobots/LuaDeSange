import { describe, it, expect } from 'vitest';
import { PANTANAL } from '../src/data/maps/pantanal';

const IDS = ['transpantaneira', 'porteira', 'curral', 'campoalagado', 'corixo', 'baia', 'salina', 'cordilheira', 'ninhal', 'jofre', 'pontequebrada', 'rio'];
const all = () => Object.values(PANTANAL.ondas).flat(2) as string[];
const AGUA = ['campoalagado', 'corixo', 'baia', 'pontequebrada', 'rio', 'ninhal', 'jofre'];

describe('mapa Pantanal', () => {
  const m = PANTANAL;
  it('requer a Amazônia, nível 26, cenário PANTANAL', () => {
    expect(m.id).toBe('pantanal');
    expect(m.requer).toBe('amazonia');
    expect(m.art).toBe('PANTANAL');
    expect(m.nivelRecomendado).toBe(26);
  });
  it('tem as 12 áreas na ordem do cenário', () => {
    expect(m.areas).toBe(12);
    expect(Object.keys(m.ondas)).toEqual(IDS);
    expect(m.semVasculhar).toEqual(['rio']);
    expect(m.arenaPos).toEqual({ cordilheira: [0.45, 0.95], rio: [0.8] });
  });
  it('mini boss só na 2ª arena da cordilheira e chefe só no rio (ou substitutos)', () => {
    expect(['tamandua', 'passista']).toContain(m.ondas.cordilheira[1][0]);
    expect(m.ondas.cordilheira[1]).toHaveLength(1);
    expect(m.ondas.rio).toHaveLength(1);
    expect(['reijacare', 'maquinista']).toContain(m.ondas.rio[0][0]);
    for (const [a, ws] of Object.entries(m.ondas)) {
      const zs = ws.flat() as string[];
      if (a !== 'cordilheira') expect(zs.some((k) => k === 'tamandua' || k === 'passista')).toBe(false);
      if (a !== 'rio') expect(zs.some((k) => k === 'reijacare' || k === 'maquinista')).toBe(false);
    }
  });
  it('ariranha e piranha só em áreas de água', () => {
    for (const [a, ws] of Object.entries(m.ondas)) {
      const zs = ws.flat() as string[];
      if (!AGUA.includes(a)) { expect(zs).not.toContain('ariranha'); expect(zs).not.toContain('piranha'); }
    }
  });
  it('usa no máximo 12 tipos e nenhuma onda vazia', () => {
    expect(new Set(all()).size).toBeLessThanOrEqual(12);
    for (const ws of Object.values(m.ondas)) for (const w of ws) expect(w.length).toBeGreaterThan(0);
  });
});
