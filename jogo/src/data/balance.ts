// BALANCEAMENTO (fonte única): força dos zumbis por MAPA e por ARENA, curva de XP e rendimento offline.
// Usado pelo motor (expedition/combat.ts → mkZ), pelo simulador rápido (game/idleLoop.ts → arenasDe) e pelas
// recompensas (game/rewards.ts). Ferramenta de ajuste: `npx vite-node tools/balance.ts` (jogador típico, dia a dia).
// Doc: mecanicas2.html, seção "Balanceamento e curva de progressão".
//
// Regra: a dificuldade NÃO depende mais dos dias corridos (com o loop, 1 rodada = 1 dia e o contador dispara).
// Cada mapa tem uma curva própria de "ameaça" k (multiplica vida × dano dos zumbis comuns): começa em `ini` na
// 1ª arena e cresce em progressão geométrica até `fim` na última arena antes do chefe. Vida e dano recebem √k cada
// (metade da curva vai pra vida, metade pro dano). Mini boss e chefe usam o k da arena deles × `mini`/`chefe`.
// Meta (jogador típico, tools/balance.ts): Marco Zero vencido por volta do 3º dia real, cada mapa seguinte ~3 dias.
import { MAPS } from './maps';

export interface EscalaMapa {
  /** ameaça (vida × dano) na 1ª arena */
  ini: number;
  /** ameaça na última arena (o chefe fica nela) */
  fim: number;
  /** multiplicador extra de ameaça do mini boss e do chefe */
  mini: number;
  chefe: number;
  /** XP por abate × este fator (mapas seguintes rendem mais) */
  xp: number;
}

export const ESCALA: Record<string, EscalaMapa> = {
  marco_zero: { ini: 0.18, fim: 105, mini: 0.5, chefe: 0.45, xp: 1 },
  olinda: { ini: 13, fim: 135, mini: 0.6, chefe: 0.5, xp: 1.6 },
  pelourinho: { ini: 30, fim: 140, mini: 0.6, chefe: 0.55, xp: 2.4 },
  veropeso: { ini: 55, fim: 245, mini: 0.6, chefe: 0.58, xp: 3.4 },
  lapa: { ini: 86, fim: 340, mini: 0.6, chefe: 0.58, xp: 4.6 },
  amazonia: { ini: 135, fim: 620, mini: 0.43, chefe: 0.44, xp: 6 },
  pantanal: { ini: 215, fim: 740, mini: 0.39, chefe: 0.36, xp: 7.6 },
};
const PADRAO: EscalaMapa = { ini: 1, fim: 1, mini: 1, chefe: 1, xp: 1 };

const nArenas = (mapId: string): number => {
  const m = MAPS[mapId];
  return m ? Object.values(m.ondas).reduce((a, w) => a + w.length, 0) : 1;
};

/** Ameaça k (vida × dano) da arena `ai` (0 = primeira) do mapa. */
export function ameaca(mapId: string, ai: number, boss: 'mini' | 'chefe' | null | undefined = null): number {
  const e = ESCALA[mapId] ?? PADRAO, n = nArenas(mapId);
  const f = n > 1 ? Math.max(0, Math.min(1, ai / (n - 1))) : 0;
  const k = e.ini * Math.pow(e.fim / e.ini, f);
  return k * (boss === 'chefe' ? e.chefe : boss === 'mini' ? e.mini : 1);
}

/** Multiplicadores de vida e de dano de um zumbi nessa arena (√k cada). */
/** Onboarding: na 1ª expedição do save os zumbis têm esta fração da vida e do dano (o herói nv1 vai até ~metade do mapa). */
export const PRIMEIRA_FACIL = 0.35;

export function zMult(mapId: string, ai: number, boss: 'mini' | 'chefe' | null | undefined = null): { hp: number; dmg: number } {
  const r = Math.sqrt(ameaca(mapId, ai, boss));
  return { hp: r, dmg: r };
}

// ---------------- XP ----------------
/** XP pra passar do nível lv pro lv+1: 150 × lv² (nv 2 = 150 · nv 10 = 15 mil · nv 20 = 60 mil). */
export const xpToNext = (lv: number) => 150 * lv * lv;
/** XP de um abate nesse mapa. */
export const xpAbate = (mapId: string, base: number) => Math.round(base * (ESCALA[mapId]?.xp ?? 1));

// ---------------- loop offline ----------------
/** Rodadas resolvidas offline rendem esta fração do XP e do loot (online = 100%). */
export const OFFLINE_REND = 0.6;
