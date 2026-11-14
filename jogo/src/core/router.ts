// Router de telas: uma tela montada por vez dentro de #app.
export type ScreenId = 'landing' | 'create' | 'shelter' | 'expedition';

export interface Screen {
  mount(root: HTMLElement, params?: any): void;
  unmount(): void;
}

const registry = new Map<ScreenId, () => Screen>();
let current: { id: ScreenId; screen: Screen } | null = null;

export function register(id: ScreenId, factory: () => Screen): void {
  registry.set(id, factory);
}

export function go(id: ScreenId, params?: any): void {
  const factory = registry.get(id);
  if (!factory) throw new Error('tela não registrada: ' + id);
  current?.screen.unmount();
  const root = document.getElementById('app')!;
  root.innerHTML = '';
  root.dataset.screen = id;
  const screen = factory();
  current = { id, screen };
  window.scrollTo(0, 0);
  screen.mount(root, params);
}

export const currentScreen = () => current?.id ?? null;
