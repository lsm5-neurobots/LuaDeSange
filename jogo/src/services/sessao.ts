// O que acontece depois do login e no sair. A tela não fala com o Firestore direto.
import { go } from '../core/router';
import { hasGame, loadGame, soltarJogo, startNewGame } from '../game/state';
import { modoRemoto } from './api';
import { sairConta } from './firebaseRemoto';
import { sincronizar } from './intent';

/** Save com herói abre o abrigo. Sem herói, a criação. */
export function irParaJogo(): void {
  if (hasGame()) go('shelter', { intro: 'chegada' });
  else { startNewGame(); go('create'); }
}

/** Login acabou de acontecer: o boot ainda não tinha o save desta conta. */
export async function seguirAposAuth(): Promise<void> {
  await loadGame();
  if (modoRemoto()) await sincronizar();
  irParaJogo();
}

let saindo = false;

/** Sair não apaga o progresso. Volta para a landing mesmo se o signOut falhar na rede. */
export async function sairParaLanding(): Promise<void> {
  if (saindo) return;
  saindo = true;
  try {
    try { await sairConta(); }
    finally {
      soltarJogo();
      go('landing');
    }
  } finally {
    saindo = false;
  }
}
