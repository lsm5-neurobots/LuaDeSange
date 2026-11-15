// Liga o Firebase só quando o .env está preenchido. Sem isso, `npm run dev` fica no save local.
import { definirAuthExigida } from './authEstado';

function configurado(): boolean {
  const env = import.meta.env;
  return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
}

export async function prepararRede(): Promise<void> {
  if (!configurado()) return;
  definirAuthExigida(true);
  const { ligarFirebase } = await import('./firebaseRemoto');
  await ligarFirebase();
}
