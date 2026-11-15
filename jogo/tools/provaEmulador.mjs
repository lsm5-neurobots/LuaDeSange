// Prova contra os emuladores: sync, Lua idempotente, expedição que ignora dano, regras fechadas.
import { createRequire } from 'node:module';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously, signOut } from 'firebase/auth';
import { connectFirestoreEmulator, doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';

const require = createRequire('C:/Users/lucas/Desktop/CerebroNB/LuadeSangue/functions/package.json');
const { initializeApp: initAdmin, getApps } = require('firebase-admin/app');
const { getFirestore: adminDb } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'demo-lua-de-sangue';

const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };

const app = initializeApp({ apiKey: 'demo', projectId: 'demo-lua-de-sangue', appId: 'demo' });
const auth = getAuth(app);
const db = getFirestore(app);
const fns = getFunctions(app, 'southamerica-east1');
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8080);
connectFunctionsEmulator(fns, '127.0.0.1', 5001);
if (!getApps().length) initAdmin({ projectId: 'demo-lua-de-sangue' });
const admin = adminDb();

const call = (nome, data) => httpsCallable(fns, nome)(data).then((r) => r.data);

const cred = await signInAnonymously(auth);
const uid = cred.user.uid;
const agora = Date.now();
await admin.doc(`users/${uid}`).set({
  v: 1,
  criadoEm: agora - 9 * 3600_000,
  ultimaVisita: agora - 9 * 3600_000,
  hero: { nome: 'Prova' },
  heroLv: 1,
  heroXp: 0,
  expedicoes: 1,
  res: { madeira: 80, sucata: 40, pano: 10, agua: 20, comida: 20, remedio: 2, pecas: 1, gasolina: 1, fragmento_lunar: 0 },
});

let negado = false;
try { await setDoc(doc(db, 'users', uid), { res: { madeira: 999999 } }); }
catch { negado = true; }
ok(negado, 'o cliente conseguiu gravar o próprio save');

negado = false;
try { await setDoc(doc(db, 'world', 'clock'), { agora: 1, janela: 0, inicio: 0, fim: 1 }); }
catch { negado = true; }
ok(negado, 'o cliente conseguiu gravar world/clock');

const s1 = await call('sync', { agora: 1, res: { madeira: 1e9 }, dano: 999 });
ok(s1.ok === true, 'sync não ok: ' + s1.erro);
ok(typeof s1.relogio?.janela === 'number', 'sync não devolveu a janela');
ok(s1.save?.luaAtacada != null, 'a Lua não foi marcada');
ok((s1.ataques?.length ?? 0) >= 1, 'com expedição já feita, a janela não atacou');
const lua = s1.save.luaAtacada;
const madeira1 = s1.save.res.madeira;
ok(madeira1 !== 1e9, 'sync aceitou madeira do cliente');

const s2 = await call('sync', { dano: 1e9, loot: { madeira: 1e9 } });
ok(s2.save.luaAtacada === lua, 'a segunda sync atacou outra janela');
ok(s2.save.res.madeira === madeira1, 'a segunda sync mudou madeira');
ok((s2.ataques?.length ?? 0) === 0, 'a segunda sync devolveu outro ataque');

const partiu = await call('startExpedition', {
  mapId: 'marco_zero', ids: ['hero'], pet: null, manual: true, loop: false,
  dano: 1e12, loot: { madeira: 1e9 }, sucesso: true,
  plano: { recrutar: false, usarChaves: false, usarKits: false, kitLimiar: 0.35, itens: {} },
});
ok(partiu.ok === true && partiu.config?.mapId === 'marco_zero', 'startExpedition falhou: ' + partiu.erro);

const r1 = await call('resolveExpedition', { dano: 1e12, loot: { madeira: 1e9 }, sucesso: true, abates: 99999 });
ok(r1.ok === true && r1.resumo, 'resolve falhou: ' + r1.erro);
ok((r1.save.res.madeira ?? 0) < 100000, 'o loot absurdo entrou no save: ' + r1.save.res.madeira);
const loot = JSON.stringify(r1.resumo.loot);
const madeiraR = r1.save.res.madeira;
const r2 = await call('resolveExpedition', { dano: 0, loot: { madeira: 1 } });
ok(r2.ok === true && JSON.stringify(r2.resumo.loot) === loot, 'resolver de novo mudou o loot');
ok(r2.save.res.madeira === madeiraR, 'resolver de novo mudou a madeira');

const cedo = await call('startExpedition', {
  mapId: 'marco_zero', ids: ['hero'], manual: false,
  plano: { recrutar: false, usarChaves: false, usarKits: false, kitLimiar: 0.35, itens: {} },
});
ok(cedo.ok === false, 'começou outra expedição com a anterior ainda no relógio');

const relogio = await getDoc(doc(db, 'world', 'clock'));
ok(relogio.exists() && typeof relogio.data().janela === 'number', 'world/clock não está legível');

await signOut(auth);
const outro = await signInAnonymously(auth);
ok(outro.user.uid !== uid, 'o segundo anônimo repetiu o uid');
negado = false;
try { await getDoc(doc(db, 'users', uid)); }
catch { negado = true; }
ok(negado, 'outro jogador leu o save alheio');

if (falhas.length) {
  console.error(falhas.join('\n'));
  process.exit(1);
}
console.log('emulador ok: sync, lua idempotente, loot ignora dano, regras fecham escrita');
