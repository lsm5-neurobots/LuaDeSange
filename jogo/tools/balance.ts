// CLI do simulador de progressão (regras e jogador típico em tools/balanceSim.ts).
//   npx vite-node tools/balance.ts                 → 6 sementes, 16 dias, tabela dia a dia (mediana) + dia de cada chefe
//   npx vite-node tools/balance.ts -- 16 16 json   → 16 sementes, 16 dias, imprime também o JSON (gráfico do doc)
//   ESC='{"marco_zero":{"fim":60}}' npx vite-node tools/balance.ts   → testa outra escala sem editar o jogo
import { ESCALA } from '../src/data/balance';
import type { ResId } from '../src/data/resources';
import { correr, med, abrev, ORDEM, type Corrida, type Linha } from './balanceSim';

const args = process.argv.slice(2).filter((a) => a !== '--');
if (process.env.ESC) for (const [k, v] of Object.entries(JSON.parse(process.env.ESC))) Object.assign(ESCALA[k], v);
// arma "mediana": ordena por raridade e estrelas (não por texto)
const armaRank = (a: string) => 'bpl'.indexOf(a[0]) * 0 + 'cirl'.indexOf(a[1]) * 100 + +a.slice(2);
const armaMed = (xs: string[]) => [...xs].sort((x, y) => armaRank(x) - armaRank(y))[Math.floor(xs.length / 2)];
const SEEDS = +(args[0] ?? 6), DIAS = +(args[1] ?? 16), JSON_OUT = args.includes('json');

// ---------------- saída ----------------
const runs: Corrida[] = [];
for (let i = 0; i < SEEDS; i++) runs.push(correr(1000 + i * 7919, DIAS));

console.log(`\nJogador típico · ${SEEDS} sementes · ${DIAS} dias · mediana por dia (área = melhor área alcançada; ${'>'}total = venceu)\n`);
console.log('dia | fronteira: área típica | P(mil) | nv  | recr (nv) | arma  | golpes | ofic | fog | MZ  OL  PE  VP | venc | rodadas on/off | madeira sucata pecas agua comida | ataques perdidos');
for (let d = 0; d < DIAS; d++) {
  const L = runs.map((r) => r.linhas[d]);
  const m = (f: (l: Linha) => number) => med(L.map(f));
  const ar = ORDEM.map((id) => String(m((l) => l.area[id] ?? 0)).padStart(3)).join(' ');
  const arma = armaMed(L.map((l) => l.arma));
  console.log(`${String(d + 1).padStart(3)} | ${L.map((l) => l.fr).sort()[Math.floor(L.length / 2)]}: ${String(m((l) => l.tipica)).padStart(2)}               | ${String(m((l) => l.P)).padStart(6)} | ${String(m((l) => l.lv)).padStart(3)} | ${String(m((l) => l.recs)).padStart(4)} (${String(m((l) => l.recLv)).padStart(2)}) | ${arma.padEnd(5)} | ${String(m((l) => l.golpes)).padStart(6)} | ${String(m((l) => l.oficina)).padStart(4)} | ${String(m((l) => l.fogueira)).padStart(3)} | ${ar} | ${String(m((l) => l.vencidos)).padStart(4)} | ${String(m((l) => l.rodOn)).padStart(6)}/${String(m((l) => l.rodOff)).padEnd(6)} | ${['madeira', 'sucata', 'pecas', 'agua', 'comida'].map((k) => String(Math.round(m((l) => l.res[k as ResId] ?? 0))).padStart(6)).join(' ')} | ${m((l) => l.ataquesPerdidos)}`);
}
console.log('\nDia (decorrido, em dias reais desde a 1ª sessão) em que venceu cada chefe, por semente:');
for (const id of ORDEM) {
  const xs = runs.map((r) => r.chefe[id]);
  const ok = xs.filter((x): x is number => x != null);
  console.log(`  ${abrev[id]}: ${xs.map((x) => (x == null ? '—' : x.toFixed(2))).join('  ')}   · mediana ${ok.length ? med(ok).toFixed(2) : '—'} (${ok.length}/${xs.length})`);
}
console.log(`1ª expedição alcançou a área: ${runs.map((r) => r.primeira).join(', ')}`);
if (JSON_OUT) {
  const out = {
    seeds: SEEDS, dias: DIAS,
    linhas: Array.from({ length: DIAS }, (_, d) => {
      const L = runs.map((r) => r.linhas[d]), m = (f: (l: Linha) => number) => med(L.map(f));
      return { dia: d + 1, P: m((l) => l.P), tipica: m((l) => l.tipica), fr: L.map((l) => l.fr).sort()[Math.floor(L.length / 2)], lv: m((l) => l.lv), recLv: m((l) => l.recLv), recs: m((l) => l.recs), golpes: m((l) => l.golpes), oficina: m((l) => l.oficina), area: Object.fromEntries(ORDEM.map((id) => [id, m((l) => l.area[id] ?? 0)])), vencidos: m((l) => l.vencidos), arma: armaMed(L.map((l) => l.arma)) };
    }),
    chefe: Object.fromEntries(ORDEM.map((id) => [id, runs.map((r) => r.chefe[id])])),
    primeira: runs.map((r) => r.primeira),
  };
  console.log('JSON ' + JSON.stringify(out));
}
