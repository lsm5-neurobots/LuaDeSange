// Loop de animação com dt limitado. Cada tela cria o seu e para no unmount.
// Também alimenta o medidor do modo gráfico automático (settings.probe).
import { probe } from './settings';
export interface Loop { stop(): void }

export function startLoop(tick: (dt: number, t: number) => void, maxDt = 0.1): Loop {
  let last = performance.now(), t = 0, alive = true;
  probe.reset();
  const frame = (now: number) => {
    if (!alive) return;
    probe.frame(now - last);
    const dt = Math.min(maxDt, (now - last) / 1000);
    last = now;
    t += dt;
    try { tick(dt, t); } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return { stop: () => { alive = false; } };
}
