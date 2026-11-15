// Boot: carrega arte e save, registra telas, abre a landing.
import './ui/styles.css';
import './ui/widgets/toast';
import { artReady, initArt } from './art/legacy';
import { initFrameStore, frameStore } from './art/frameStore';
import { preloadIcons } from './art/items';
import { go, register } from './core/router';
import { hasGame, loadGame } from './game/state';
import { modoRemoto } from './services/api';
import { consumirRedirectGoogle, temSessao } from './services/authEstado';
import { prepararRede } from './services/rede';
import { setPendingReport, simularAusencia } from './ui/shelter/offlineReport';
import { landingScreen } from './ui/screens/landing';
import { loginScreen } from './ui/screens/login';
import { createScreen } from './ui/screens/create';
import { shelterScreen } from './ui/screens/shelter';
import { expeditionScreen } from './ui/screens/expedition';
import { initDebugClock } from './game/worldClock';

// debug/E2E (só no dev): ?relogio=<ms|ISO> · ?hora=HH · ?clima=chuva|tempestade|neblina|nublado|limpo
if (import.meta.env.DEV) initDebugClock(location.search);

async function boot() {
  try { await prepararRede(); }
  catch (e) {
    document.getElementById('app')!.innerHTML = `<p style="padding:24px">Não consegui falar com o Firebase. Confira o .env e se os emuladores estão no ar.<br><code>${String(e instanceof Error ? e.message : e)}</code></p>`;
    return;
  }
  if (!artReady()) {
    document.getElementById('app')!.innerHTML = '<p style="padding:24px">Não consegui carregar a arte (public/art). Rode <code>npm run art</code>.</p>';
    return;
  }
  initArt();
  await Promise.all([loadGame(), initFrameStore()]); // cache persistente de quadros (opcional; sem storage segue sem)
  if (modoRemoto()) {
    const { sincronizar } = await import('./services/intent');
    await sincronizar();
  }
  await Promise.race([preloadIcons(), new Promise((r) => setTimeout(r, 1500))]); // ícones do HUD/painéis já feitos
  // modo loop: simula o tempo fora (até 8 h) logo ao carregar; no Firebase quem faz isso é o sync
  if (hasGame()) setPendingReport(simularAusencia());
  // telas em 384×216 voltam a escala padrão dos sprites (a expedição usa a própria, em alta resolução)
  const std = <T,>(f: () => T) => () => { initArt(); return f(); };
  register('landing', std(landingScreen));
  register('login', loginScreen);
  register('create', std(createScreen));
  register('shelter', std(shelterScreen));
  register('expedition', expeditionScreen);
  const voltouDoGoogle = consumirRedirectGoogle();
  if (voltouDoGoogle && temSessao()) {
    const { irParaJogo } = await import('./services/sessao');
    irParaJogo();
    return;
  }
  go(voltouDoGoogle ? 'login' : 'landing');
}

void boot();

// ganchos de teste/depuração
import * as state from './game/state';
import * as router from './core/router';
import * as team from './game/team';
import * as idle from './game/idleLoop';
import * as clock from './game/worldClock';
(window as any).__lds = { state, router, team, idle, clock, frameStore };
