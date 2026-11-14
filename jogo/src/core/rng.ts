// RNG com semente opcional (mulberry32). Regras de jogo recebem um Rng pra serem testáveis.
export type Rng = () => number;

export function makeRng(seed = Date.now()): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng: Rng = Math.random;
export const pick = <T>(arr: readonly T[], r: Rng = rng): T => arr[Math.floor(r() * arr.length)];
export const chance = (p: number, r: Rng = rng): boolean => r() < p;
export const randInt = (min: number, max: number, r: Rng = rng): number => min + Math.floor(r() * (max - min + 1));
export function hsh(n: number): number {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}
