# Brief comum — agente de arte + IA de zumbi novo (Expansão 2)

Você faz **um** zumbi do `fichas/ROSTER.md`, do começo ao fim: arte procedural + IA + teste. Projeto: `C:\Users\lucas\Desktop\CerebroNB\LuadeSangue\jogo` (Vite+TS).

## Leia antes
1. `fichas/ROSTER.md` (elenco, ids) e a ficha completa do seu zumbi: `fichas/zumbis-mapas-atuais.md` (Olinda/Pelourinho/Ver-o-Peso/Lapa), `fichas/amazonia.md` ou `fichas/pantanal.md`. A ficha manda (aparência, formas, golpes, IA, fraqueza, stats).
2. `jogo/ART_DIRECTION.md` (padrão Marvel Cosmic Invasion, medidas, contrato técnico). Refs de estilo: `referencias/marvel-cosmic-invasion/` (olhe 4–6 imagens de inimigos).
3. **Suas referências reais** (fotos): `referencias/zumbis-<mapa>/<id>/` (≈100 imagens, `index.html`/`FONTES.md`). Olhe pelo menos 15–20 (use Read nas imagens) antes de desenhar: figurino, materiais, objeto/arma, anatomia (animais: proporção, cabeça, patas, pelagem/escamas, postura real).
4. Modelos de código (copie a estrutura, não o design): humano comum → `art-src/zombies/malandro.js` + `src/expedition/ai/malandro.ts`; chefe/mini → `art-src/zombies/maquinista.js` / `passista.js` + `ai/maquinista.ts` / `ai/passista.ts` (+ `ai/bossProps.ts`, `shared/bosskit.js`). Kit de reações: `art-src/shared/zreact.js`, `shared/moveset.js`; IA: `ai/moves.ts`, `ai/index.ts` (ZombieAI/ZCtx), `world.ts`, `combat.ts`, `fighter.ts`. Animal quadrúpede: não existe modelo — monte o esqueleto próprio (coluna, 4 patas com juntas, cabeça/pescoço, cauda) com o mesmo pipeline PIX/compose.

## Arquivos SEUS (exclusivos — não edite nenhum outro)
- `jogo/art-src/zombies/<id>.js` (já existe um stub de 1 linha; substitua). Const global = id em MAIÚSCULAS (ex.: `const ONCA=(function(){...})();`). Já está registrado em `tools/build-art.mjs` (parts + exports) — não mexa no build.
- `jogo/src/expedition/ai/<id>.ts` (export `const <id>: ZombieAI`).
- `jogo/tests/<id>.test.ts` (testa o módulo de IA/arte direto; **não** dependa de `ZOMBIES[id]` nem do `REGISTRY`, que o orquestrador registra depois).
- Rascunhos/prints só no seu scratchpad.
**Proibido** editar: `src/data/zombies.ts`, `ai/index.ts`, `build-art.mjs`, mapas, outros zumbis, shared/*. Precisa de algo neles? descreva no relatório.

## Contrato de arte
- `frame(form, anim, fi, step, P?, key?)`, `framePose(form, anim, P, key)`, `FW/FH/GROUND/AX` crus, `ANIMS` (com `n` e campos de evento), `NAMES`, `RIM`, `mats(form)` com rampas `blood`/`acid`, `poseOf`. Honre `PIX.getK()` (chave de cache inclui K). Exponha pontos `cv._eye/_mouth/_hand/_head` como o malandro.
- Formas: comuns/mini → `comum`, `enluarado` (frio roxo-ciano), `plenilunar` (quente laranja-vermelho, mais agressivo); chefe → `normal`, `furia`.
- Altura na tela (K=1.25): comum 120–140 px; animal pequeno/baixo pode ser mais largo que alto (cardume, porco, lontra) mas legível; mini boss 230–280 px; chefe 280–335 px.
- Animações mínimas (ART_DIRECTION): comum idle 6–8 · walk 8 · 2+ ataques com antecipação e smear · hurt/hurtB · fall · getup · death · 1–2 de personalidade. Chefe/mini: + intro, dazed/rage, 3+ ataques telegrafados, death longa. Use os nomes de anim que o motor já entende (veja malandro/maquinista e zreact).
- Animais zumbis: anatomia real das fotos + corrupção da Lua de Sangue (olhos de lua, carne/osso exposto, musgo/fungo, veias brilhando). Nada de personagens de outras franquias. Humanos: figurino brasileiro real das refs.

## Contrato de IA
- Golpes da ficha via `ZMove` (`moves.ts`), telegrafia (`warn`), fraqueza clara e testável. Siga o padrão de `malandro.ts` (comum) ou `maquinista.ts`/`passista.ts` (chefe/mini, fases, `bossProps`).
- Números iniciais = stats da ficha.

## Verificação (obrigatória)
- Build: `cd jogo && npm run art` (outros agentes rodam em paralelo: se der erro de OUTRO arquivo, ignore e rode de novo; o seu precisa compilar). `npx tsc --noEmit` sem erros nos seus arquivos. `npx vitest run tests/<id>.test.ts`.
- Folha de animação headless (dev server já roda em http://localhost:5173; NÃO use o browser pane, use o script):
  `node C:/Users/lucas/AppData/Local/Temp/claude/ee94c68fe4b55f69/468ea4d6-f8c9-4cfd-bdea-cec4d14d45c1/scratchpad/e2e/sheet.mjs "b=EXP&f=<ID>&form=comum" <seu-scratch>/sheet.png` (rode de dentro dessa pasta e2e, que tem o puppeteer; `&anims=idle,walk` filtra). Gere as 3 formas. Olhe as imagens (Read).
- **Comparação lado a lado** obrigatória: sua folha × 2–3 inimigos de `referencias/marvel-cosmic-invasion/` × 2–3 fotos reais suas. Se parecer mais simples/chapado que a referência, refine (densidade de tons 4–5 por material, contorno seletivo, rim light, detalhe interno). Itere até passar.
- Um headless de cada vez (memória): feche antes de abrir outro.

## Relatório final (curto)
1. Medidas para `zombies.ts`: `ax, G, top, w` crus; stats propostos `hp, dmg, xp, drop`; texto `desc` (1–2 frases, PT-BR); `boss` se for chefe/mini.
2. Campos de evento de ANIMS que a IA usa e qualquer necessidade fora dos seus arquivos.
3. Caminho dos prints finais (folha das formas + comparação).
