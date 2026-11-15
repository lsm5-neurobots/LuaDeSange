// Camada de serviços. Hoje: adapter local (localStorage). Amanhã: trocar por Firebase/Supabase
// implementando a mesma interface, sem mexer no resto do jogo.
export interface Account { id: string; nome: string; anonimo: boolean }

export interface Api {
  account(): Promise<Account>;
  loadSave(): Promise<unknown | null>;
  writeSave(data: unknown): Promise<void>;
  clearSave(): Promise<void>;
}

const KEY = 'lds_save_v1';

function safeGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* sem storage */ } }
function safeDel(k: string) { try { localStorage.removeItem(k); } catch { /* sem storage */ } }

export const localApi: Api = {
  async account() {
    let id = safeGet('lds_account');
    if (!id) { id = 'local-' + Math.random().toString(36).slice(2, 10); safeSet('lds_account', id); }
    return { id, nome: 'Sobrevivente', anonimo: true };
  },
  async loadSave() {
    const s = safeGet(KEY);
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  },
  async writeSave(data) { safeSet(KEY, JSON.stringify(data)); },
  async clearSave() { safeDel(KEY); },
};

let impl: Api = localApi;
/** O jogo chama sempre este objeto. Sem config Firebase, é o adapter local. */
export const api: Api = {
  account: () => impl.account(),
  loadSave: () => impl.loadSave(),
  writeSave: (data) => impl.writeSave(data),
  clearSave: () => impl.clearSave(),
};

export function instalarApi(next: Api): void { impl = next; }

let remoto = false;
/** Verdade só depois que Auth + callables estão ligados. O save local não passa por aqui. */
export const modoRemoto = (): boolean => remoto;
export function definirModoRemoto(v: boolean): void { remoto = v; }
