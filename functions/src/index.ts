// Callables autoritativas. O cliente lê o save; quem grava é o Admin SDK.
// App Check fica desligado aqui de propósito: o emulador e o dev sem token não travam.
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { agir, partirExpedicao, resolverExpedicao, sincronizar, type Saida } from '../../jogo/src/game/autoridade';
import { migrate, newGame, type GameState } from '../../jogo/src/game/state';

if (!getApps().length) initializeApp();

const OPT = {
  region: 'southamerica-east1' as const,
  cors: true,
  enforceAppCheck: false,
  invoker: 'public' as const,
};

function banco(): Firestore {
  return getFirestore();
}

function uidDe(req: CallableRequest<unknown>): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Entre para jogar.');
  return uid;
}

function limpar(s: GameState): Record<string, unknown> {
  s.rev = (s.rev ?? 0) + 1;
  return JSON.parse(JSON.stringify(s)) as Record<string, unknown>;
}

function pacote(out: Saida, save: Record<string, unknown> | null) {
  return JSON.parse(JSON.stringify({
    ok: out.ok,
    erro: out.erro ?? null,
    ataques: out.ataques,
    relogio: out.relogio,
    offline: out.offline ?? null,
    config: out.config ?? null,
    resultado: out.resultado ?? null,
    resumo: out.resumo ?? null,
    parada: out.parada ?? null,
    extra: out.extra ?? null,
    save,
  }));
}

async function transacao(uid: string, fn: (s: GameState, now: number) => Saida) {
  const now = Date.now();
  const fire = banco();
  const ref = fire.doc(`users/${uid}`);
  const clock = fire.doc('world/clock');
  let salvo: Record<string, unknown> | null = null;
  const out = await fire.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const s = (snap.exists ? migrate(snap.data()) : null) ?? newGame(now);
    const res = fn(s, now);
    tx.set(clock, res.relogio);
    if (res.apagar) {
      tx.delete(ref);
      salvo = null;
    } else {
      salvo = limpar(s);
      tx.set(ref, salvo);
    }
    return res;
  });
  return pacote(out, salvo);
}

export const sync = onCall(OPT, (req) => transacao(uidDe(req), (s, now) => sincronizar(s, now)));

export const act = onCall(OPT, (req) => transacao(uidDe(req), (s, now) => agir(s, now, req.data)));

export const startExpedition = onCall(OPT, (req) => transacao(uidDe(req), (s, now) => partirExpedicao(s, now, req.data)));

export const resolveExpedition = onCall(OPT, (req) => transacao(uidDe(req), (s, now) => resolverExpedicao(s, now, req.data)));
