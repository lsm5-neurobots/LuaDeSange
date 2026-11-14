import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5173 },
  // zumbis.html e mapas.html = catálogos de arte (fora do jogo)
  build: { rollupOptions: { input: { main: 'index.html', zumbis: 'zumbis.html', mapas: 'mapas.html' } } },
  test: { environment: 'node' },
} as any);
