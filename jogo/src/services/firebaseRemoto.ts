// Auth (e-mail/senha ou Google), leitura do próprio save e callables.
// Com Firebase configurado não entra anônimo: sem usuário, a tela de login assume a sessão.
import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  browserLocalPersistence, connectAuthEmulator, createUserWithEmailAndPassword, getAuth, getRedirectResult,
  GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup,
  signInWithRedirect, signOut, type Auth, type User,
} from 'firebase/auth';
import { connectFirestoreEmulator, doc, getDoc, getFirestore, onSnapshot, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { replaceState } from '../game/state';
import { setRelogioPublico, type RelogioPublico } from '../game/worldClock';
import {
  cancelarRedirectGoogle, codigoAuth, definirSessao, guardarErroAuth, marcarRedirectGoogle, mensagemAuth,
} from './authEstado';
import { definirModoRemoto, instalarApi, type Account, type Api } from './api';
import { registrarPedido, type RespostaRemota } from './intent';

const env = import.meta.env;
const EMULADOR = env.VITE_FIREBASE_EMULATORS === '1';

let auth: Auth;
let db: Firestore;
let funcoes: Functions;
let uid = '';
const ouvintes: Array<() => void> = [];

const apiSemSessao: Api = {
  async account(): Promise<Account> { return { id: '', nome: 'Sobrevivente', anonimo: false }; },
  async loadSave() { return null; },
  async writeSave() { /* sem sessão não grava o save local por cima da conta */ },
  async clearSave() { /* o reset da conta passa pela callable, com sessão */ },
};

function cfg() {
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  };
}

function exigirAuth(): Auth {
  if (!auth) throw new Error('Firebase não está ligado.');
  return auth;
}

function soltarOuvintes(): void {
  ouvintes.splice(0).forEach((f) => f());
}

function nomeDe(user: User): string {
  const email = user.email?.split('@')[0]?.trim();
  return user.displayName?.trim() || email || 'Sobrevivente';
}

async function assumir(user: User): Promise<void> {
  if (user.isAnonymous) return;
  if (uid === user.uid && ouvintes.length) return;
  soltarOuvintes();
  const id = user.uid;
  uid = id;
  const nome = nomeDe(user);
  instalarApi({
    async account(): Promise<Account> { return { id, nome, anonimo: false }; },
    async loadSave() {
      const snap = await getDoc(doc(db, 'users', id));
      return snap.exists() ? snap.data() : null;
    },
    async writeSave() { /* quem persiste economia é a Function */ },
    async clearSave() { /* o reset vai pela callable `act` */ },
  });
  registrarPedido(async (nomeFn, dados) => {
    const fn = httpsCallable<Record<string, unknown>, RespostaRemota>(funcoes, nomeFn);
    const res = await fn(dados);
    return res.data;
  });
  ouvintes.push(onSnapshot(doc(db, 'users', id), (snap) => {
    if (uid !== id) return;
    if (snap.exists()) replaceState(snap.data(), { seMaisNovo: true });
  }, () => {}));
  ouvintes.push(onSnapshot(doc(db, 'world', 'clock'), (snap) => {
    if (uid !== id) return;
    if (snap.exists()) setRelogioPublico(snap.data() as RelogioPublico);
  }, () => {}));
  definirSessao(true);
  definirModoRemoto(true);
}

function semSessao(): void {
  soltarOuvintes();
  uid = '';
  definirSessao(false);
  definirModoRemoto(false);
  instalarApi(apiSemSessao);
}

export async function ligarFirebase(): Promise<void> {
  const app = getApps().length ? getApp() : initializeApp(cfg());
  auth = getAuth(app);
  auth.languageCode = 'pt';
  db = getFirestore(app);
  funcoes = getFunctions(app, 'southamerica-east1');

  if (EMULADOR) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(funcoes, '127.0.0.1', 5001);
  } else if (env.VITE_FIREBASE_APPCHECK_SITE_KEY) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(env.VITE_FIREBASE_APPCHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  }

  try { await setPersistence(auth, browserLocalPersistence); } catch { /* o SDK fica na persistência padrão */ }

  let redirectUser: User | null = null;
  try {
    const redirect = await getRedirectResult(auth);
    redirectUser = redirect?.user ?? null;
    if (redirectUser) guardarErroAuth(null);
  } catch (e) {
    guardarErroAuth(mensagemAuth(e));
  }

  const primeiro = await new Promise<User | null>((resolve, reject) => {
    const off = onAuthStateChanged(auth, (user) => { off(); resolve(user); }, reject);
  });

  const atual = (redirectUser && !redirectUser.isAnonymous ? redirectUser : null)
    ?? (primeiro && !primeiro.isAnonymous ? primeiro : null);

  if (atual) await assumir(atual);
  else semSessao();
}

/** Sessão anônima antiga não é conta. Sai antes do login real para não misturar o uid. */
async function sairAnonimo(): Promise<void> {
  if (auth?.currentUser?.isAnonymous) {
    try { await signOut(auth); } catch { /* o sign-in seguinte troca o usuário */ }
  }
}

export async function entrarComEmail(email: string, senha: string): Promise<void> {
  const a = exigirAuth();
  await sairAnonimo();
  const cred = await signInWithEmailAndPassword(a, email.trim(), senha);
  await assumir(cred.user);
}

export async function registrarComEmail(email: string, senha: string): Promise<void> {
  const a = exigirAuth();
  await sairAnonimo();
  const cred = await createUserWithEmailAndPassword(a, email.trim(), senha);
  await assumir(cred.user);
}

export async function entrarComGoogle(): Promise<'popup' | 'redirect'> {
  const a = exigirAuth();
  await sairAnonimo();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await signInWithPopup(a, provider);
    await assumir(cred.user);
    return 'popup';
  } catch (e) {
    const code = codigoAuth(e);
    if (code !== 'auth/popup-blocked' && code !== 'auth/operation-not-supported-in-this-environment') throw e;
    marcarRedirectGoogle();
    try {
      await signInWithRedirect(a, provider);
    } catch (err) {
      cancelarRedirectGoogle();
      throw err;
    }
    return 'redirect';
  }
}

/** Encerra a sessão no Firebase. Ouvintes saem antes do signOut, para o snapshot não regravar o jogo. */
export async function sairConta(): Promise<void> {
  soltarOuvintes();
  uid = '';
  try {
    if (auth) await signOut(auth);
  } finally {
    definirSessao(false);
    definirModoRemoto(false);
    instalarApi(apiSemSessao);
  }
}
