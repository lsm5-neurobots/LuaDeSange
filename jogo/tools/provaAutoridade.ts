// Prova da função pura (sem a pasta tests/ e sem emulador): Lua idempotente e loot que ignora o dano do cliente.
import { makeRng } from '../src/core/rng';
import { JANELA_MS, partirExpedicao, resolverExpedicao, resolverLuas } from '../src/game/autoridade';
import { newGame, type GameState } from '../src/game/state';

const falhas: string[] = [];
const ok = (cond: boolean, msg: string) => { if (!cond) falhas.push(msg); };

function clonar(s: GameState): GameState {
  return JSON.parse(JSON.stringify(s)) as GameState;
}

function lua() {
  const s = newGame(0);
  s.hero = { nome: 'T' };
  s.expedicoes = 1;
  s.criadoEm = 0;
  s.ultimaVisita = 0;
  const now = JANELA_MS + 1000;
  const antes = JSON.stringify(s.res);
  const a1 = resolverLuas(s, now);
  const luaAtacada = s.luaAtacada;
  const depois = JSON.stringify(s.res);
  const a2 = resolverLuas(s, now);
  ok(a1.length === 1, `esperava 1 ataque na janela, veio ${a1.length}`);
  ok(a2.length === 0, `segundo resolve da mesma janela atacou de novo (${a2.length})`);
  ok(s.luaAtacada === luaAtacada && s.luaAtacada === JANELA_MS, `luaAtacada=${s.luaAtacada} inicio=${JANELA_MS}`);
  ok(depois === JSON.stringify(s.res), 'o segundo ataque mudou recurso');
  ok(antes !== depois || a1[0]?.roubado && Object.keys(a1[0].roubado).length === 0 || a1[0]?.segurou === true, 'ataque não aplicou');
  const s0 = newGame(now);
  s0.expedicoes = 0;
  s0.criadoEm = 0;
  s0.ultimaVisita = 0;
  const sem = resolverLuas(s0, now);
  ok(sem.length === 0 && s0.luaAtacada === JANELA_MS, 'antes da 1ª expedição a horda tinha que só marcar a janela');
  const sem2 = resolverLuas(s0, now);
  ok(sem2.length === 0 && s0.luaAtacada === JANELA_MS, 'marcou a janela duas vezes');
}

function expedicao() {
  const t = 1_700_000_000_000;
  const s = newGame(t);
  s.hero = { nome: 'Herói' };
  s.ultimaVisita = t;
  const plano = { recrutar: false, usarChaves: false, usarKits: false, kitLimiar: 0.35, itens: {} };
  const corpo = { mapId: 'marco_zero', ids: ['hero'], pet: null, plano, loop: false };
  const p = partirExpedicao(s, t + 1000, { ...corpo, manual: true, dano: 1e12, loot: { madeira: 1e9 } }, makeRng(42));
  ok(!!p.ok && !!p.config && !!s.expedicao, `partir falhou: ${p.erro ?? ''}`);
  if (!p.ok || !s.expedicao) return;
  const manual = clonar(s);
  const auto = clonar(s);
  auto.expedicao!.manual = false;
  auto.expedicao!.cfg = { ...auto.expedicao!.cfg, manual: false };
  const quando = t + 2000;
  const rA = resolverExpedicao(manual, quando, { dano: 1e12, loot: { madeira: 1e9 }, sucesso: true, res: { madeira: 1e9 } }, makeRng(1));
  const rB = resolverExpedicao(auto, quando, { dano: 3, loot: { madeira: 0 }, sucesso: false }, makeRng(99));
  ok(!!rA.ok && !!rB.ok && !!rA.resumo && !!rB.resumo, 'resolver falhou');
  ok(JSON.stringify(rA.resumo?.loot) === JSON.stringify(rB.resumo?.loot), 'manual e automático pagaram contas diferentes');
  ok((manual.res.madeira ?? 0) < 100000, `madeira aceitou o número do cliente: ${manual.res.madeira}`);
  const madeira = manual.res.madeira;
  const r2 = resolverExpedicao(manual, quando + 500, { dano: 0, loot: { madeira: 1e9 } }, makeRng(7));
  ok(r2.ok === true && manual.res.madeira === madeira, 'resolver de novo mudou o estoque');
  ok(JSON.stringify(r2.resumo?.loot) === JSON.stringify(rA.resumo?.loot), 'o segundo resolve devolveu outro loot');
  const cedo = partirExpedicao(manual, quando + 800, corpo, makeRng(3));
  ok(!cedo.ok, 'começou outra expedição antes do relógio acabar');
}

lua();
expedicao();
if (falhas.length) {
  console.error(falhas.join('\n'));
  process.exit(1);
}
console.log('prova pura ok: lua idempotente e loot ignora dano do cliente');
