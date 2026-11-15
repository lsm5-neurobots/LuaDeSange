// Ponte do cliente com as callables. Sem config Firebase, ninguém registra `chamar` e o jogo segue local.
import type { AttackReport } from '../game/bloodmoon';
import { replaceState } from '../game/state';
import { modoRemoto } from './api';
import { setRelogioPublico, type RelogioPublico } from '../game/worldClock';

export interface RespostaRemota {
  ok: boolean;
  erro?: string | null;
  ataques?: AttackReport[];
  relogio?: RelogioPublico | null;
  offline?: unknown;
  config?: unknown;
  resultado?: unknown;
  resumo?: unknown;
  parada?: string | null;
  extra?: Record<string, unknown> | null;
  save?: unknown;
}

type Pedido = (nome: string, dados: Record<string, unknown>) => Promise<RespostaRemota>;

let pedido: Pedido | null = null;
const fila: AttackReport[] = [];

export function registrarPedido(fn: Pedido): void { pedido = fn; }

export function tomarAtaques(): AttackReport[] {
  const a = fila.splice(0, fila.length);
  return a;
}

function aplicar(r: RespostaRemota): RespostaRemota {
  if (r?.relogio) setRelogioPublico(r.relogio);
  if (r?.save) replaceState(r.save, { seMaisNovo: true });
  if (r?.ataques?.length) fila.push(...r.ataques);
  return r;
}

export function msgErro(e: unknown): string {
  const m = e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  return m.replace(/^FirebaseError:\s*/i, '') || 'Não consegui falar com o servidor.';
}

export async function chamar(nome: string, dados: Record<string, unknown> = {}): Promise<RespostaRemota> {
  if (!pedido) throw new Error('Firebase não está ligado.');
  return aplicar(await pedido(nome, dados));
}

export async function sincronizar(): Promise<RespostaRemota> {
  if (!modoRemoto()) return { ok: true, ataques: [] };
  return chamar('sync', {});
}

export async function ato(tipo: string, dados: Record<string, unknown> = {}): Promise<RespostaRemota> {
  return chamar('act', { tipo, ...dados });
}

export async function partir(dados: Record<string, unknown>): Promise<RespostaRemota> {
  return chamar('startExpedition', dados);
}

export async function resolver(dados: Record<string, unknown> = {}): Promise<RespostaRemota> {
  return chamar('resolveExpedition', dados);
}

/** No abrigo remoto, pede sync de vez em quando. O desenho do quadro não passa por aqui. */
export function pulsoAbrigo(onAtaques: (a: AttackReport[]) => void): () => void {
  if (!modoRemoto() || typeof window === 'undefined') return () => {};
  const run = () => {
    void sincronizar().then(() => { const a = tomarAtaques(); if (a.length) onAtaques(a); }).catch(() => {});
  };
  const id = window.setInterval(run, 20000);
  const vis = () => { if (!document.hidden) run(); };
  document.addEventListener('visibilitychange', vis);
  return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', vis); };
}
