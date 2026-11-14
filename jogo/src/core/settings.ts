// Configurações gráficas: presets Qualidade / Equilibrado / Desempenho + Automático (mede fps e baixa o preset).
// Só liga/desliga o que é enfeite (clima, sangue, brilhos, poeira, sombras, céu animado) — nunca regra de jogo.
export type Preset = 'qualidade' | 'equilibrado' | 'desempenho';
export type Modo = Preset | 'auto';

export interface Quality {
  /** camada de clima: 2 completa · 1 sem chão molhado/reflexos · 0 desligada */
  clima: 0 | 1 | 2;
  /** sangue: 2 manchas + partículas · 1 sem manchas na parede · 0 desligado */
  gore: 0 | 1 | 2;
  /** halos aditivos de luz (postes, janelas, neon, fogueira) */
  glow: boolean;
  /** VFX secundários: poeira de corrida, respingos das poças */
  vfx2: boolean;
  /** faíscas soltas */
  sparks: boolean;
  /** sombras dos personagens */
  shadows: boolean;
  /** céu animado (nuvens/estrelas andando) */
  skyAnim: boolean;
  /** sub-quadros de interpolação (tween) entre as poses-chave; sem eles, metade (ou menos) dos quadros a gerar */
  tween: boolean;
  /** escala dos sprites do abrigo/criação (1 = padrão; menor = menos pixels a gerar, desenhado ampliado) */
  hubK: number;
  /** fogueira do abrigo: 0 = animação contínua; >0 = passos por segundo (quadro reaproveitado entre passos) */
  fireFps: number;
}

export const PRESETS: Record<Preset, Quality> = {
  qualidade: { clima: 2, gore: 2, glow: true, vfx2: true, sparks: true, shadows: true, skyAnim: true, tween: true, hubK: 1, fireFps: 0 },
  equilibrado: { clima: 1, gore: 1, glow: true, vfx2: false, sparks: true, shadows: true, skyAnim: true, tween: true, hubK: 1, fireFps: 0 },
  desempenho: { clima: 0, gore: 0, glow: false, vfx2: false, sparks: false, shadows: false, skyAnim: false, tween: false, hubK: 0.8, fireFps: 12 },
};
export const PRESET_ORDER: Preset[] = ['qualidade', 'equilibrado', 'desempenho'];

const KEY = 'lds-config';
interface Saved { modo: Modo; auto: Preset }
function load(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    const modo: Modo = s && (s.modo === 'auto' || PRESETS[s.modo as Preset]) ? s.modo : 'auto';
    const auto: Preset = s && PRESETS[s.auto as Preset] ? s.auto : 'qualidade';
    return { modo, auto };
  } catch { return { modo: 'auto', auto: 'qualidade' }; }
}
let saved = load();
const subs = new Set<() => void>();
function persist(): void { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* sem storage: vale só nesta sessão */ } }
function emit(): void { subs.forEach((f) => { try { f(); } catch { /* ignora */ } }); }

export const settings = {
  get modo(): Modo { return saved.modo; },
  /** preset em uso (no automático, o que a medição escolheu) */
  get preset(): Preset { return saved.modo === 'auto' ? saved.auto : saved.modo; },
  get q(): Quality { return PRESETS[this.preset]; },
  set(modo: Modo): void {
    saved = { modo, auto: modo === 'auto' ? 'qualidade' : saved.auto }; // voltar ao automático recomeça a medição
    probe.reset();
    persist(); emit();
  },
  subscribe(fn: () => void): () => void { subs.add(fn); return () => subs.delete(fn); },
};

/**
 * Medidor do modo automático: janelas de 3 s; se a média ficar abaixo de 30 fps, baixa um preset (abaixo de 20, vai direto pro Desempenho).
 * As telas chamam `frame(dtMs)` a cada quadro (fora de carregamentos) e `reset()` ao abrir.
 */
export const probe = {
  t: 0, n: 0, skip: 1000,
  reset(): void { this.t = 0; this.n = 0; this.skip = 1000; },
  frame(dtMs: number): void {
    if (saved.modo !== 'auto' || saved.auto === 'desempenho' || !(dtMs > 0) || dtMs > 1000) return;
    if (this.skip > 0) { this.skip -= dtMs; return; } // primeiro segundo da tela: aquecimento
    this.t += dtMs; this.n++;
    if (this.t < 3000) return;
    const fps = (this.n * 1000) / this.t;
    this.t = 0; this.n = 0;
    if (fps < 30) {
      // bem abaixo (< 20 fps): vai direto pro Desempenho em vez de descer um degrau por janela
      saved.auto = fps < 20 ? 'desempenho' : PRESET_ORDER[Math.min(PRESET_ORDER.length - 1, PRESET_ORDER.indexOf(saved.auto) + 1)];
      this.skip = 1000;
      persist(); emit();
    }
  },
};
