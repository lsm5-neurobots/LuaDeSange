// Estado de auth sem o SDK. Sem as três VITE_FIREBASE_*, isto fica desligado e o jogo segue local.

let exigida = false;
let sessao = false;
let erroAuth: string | null = null;

const REDIRECT_KEY = 'lds_google_redirect';

export const authExigida = (): boolean => exigida;
export const temSessao = (): boolean => sessao;

export function definirAuthExigida(v: boolean): void { exigida = v; }
export function definirSessao(v: boolean): void { sessao = v; }

function limparRedirect(): void {
  try { sessionStorage.removeItem(REDIRECT_KEY); } catch { /* sem storage */ }
}

export function marcarRedirectGoogle(): void {
  try { sessionStorage.setItem(REDIRECT_KEY, '1'); } catch { /* sem storage */ }
}

export function consumirRedirectGoogle(): boolean {
  try {
    const v = sessionStorage.getItem(REDIRECT_KEY) === '1';
    if (v) limparRedirect();
    return v;
  } catch { return false; }
}

export function cancelarRedirectGoogle(): void { limparRedirect(); }

export function guardarErroAuth(msg: string | null): void { erroAuth = msg; }

export function consumirErroAuth(): string | null {
  const e = erroAuth;
  erroAuth = null;
  return e;
}

const MSG: Record<string, string> = {
  'auth/email-already-in-use': 'Esse e-mail já tem conta.',
  'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/popup-closed-by-user': 'Popup fechado.',
  'auth/cancelled-popup-request': 'Popup fechado.',
  'auth/user-cancelled': 'Popup fechado.',
  'auth/popup-blocked': 'O navegador bloqueou o popup.',
  'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase.',
  'auth/network-request-failed': 'Sem conexão com o Firebase.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/operation-not-allowed': 'Esse login ainda não está ligado no Firebase.',
  'auth/account-exists-with-different-credential': 'Esse e-mail já está em outra forma de login.',
  'auth/missing-password': 'Digite a senha.',
  'auth/web-storage-unsupported': 'Este navegador bloqueou o login.',
};

export function codigoAuth(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) return String((e as { code: unknown }).code);
  return '';
}

export function mensagemAuth(e: unknown): string {
  const code = codigoAuth(e);
  if (code && MSG[code]) return MSG[code];
  if (e instanceof Error && e.message && !code) return e.message;
  return 'Não consegui entrar. Tente de novo.';
}
