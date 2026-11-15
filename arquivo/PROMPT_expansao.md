# Prompt — Expansão: documentar mapas e zumbis, referências, 2 mapas novos e zumbis que faltam

Você é o **orquestrador** desta expansão do jogo **Lua de Sangue** (`LuadeSangue/jogo/`, Vite + TS, arte procedural em `jogo/art-src/`). Divida o trabalho entre agentes e escolha o modelo certo para cada tarefa. Você (opus) coordena, revisa e integra; não faça sozinho o que pode delegar em paralelo.

| Modelo | Use para |
|---|---|
| **opus** | arte procedural (mapas, zumbis, chefes), motor/IA, integração, revisão de direção de arte |
| **sonnet** | documentação no `arquivo/mecanicas2.html`, dados (`src/data/*`), UI, testes, E2E, prints |
| **haiku** | trabalho braçal: baixar e organizar referências, FONTES.md, index.html, conferir arquivos |

Rode em paralelo o que não depende entre si (ex.: documentação + downloads ao mesmo tempo). Cada agente recebe: objetivo, arquivos que pode editar (dono exclusivo), contrato, validação e onde salvar prints. Agentes concorrentes editam com Edit em trechos pequenos, relendo antes; nunca reescrevem arquivos inteiros do motor.

## Regras fixas (valem para todo agente)
- **Direção de arte = Marvel Cosmic Invasion** (ver `jogo/ART_DIRECTION.md`, refs em `LuadeSangue/referencias/marvel-cosmic-invasion/`): mesma densidade (960×540; personagens ~130 px, chefes 230–335 px), contorno escuro, rim light, sombreamento em placas (6 tons por material), animação com antecipação/impacto/recuperação. **Designs sempre nossos**, brasileiros; nunca copiar personagens/elementos da Marvel. Toda arte nova é comparada lado a lado (nossa × Marvel × foto real) antes de entregar.
- **Nenhum asset antigo**, nenhum emoji ou placeholder na interface: tudo em pixel art procedural no padrão.
- Tudo dentro do jogo em tela cheia (menus/modais dentro da cena). Texto em pt-BR.
- **Desempenho**: ≥ 30 fps (média e 1% low) a 1× e média ≥ 30 com CPU 4× mais lenta. Conteúdo novo entra no pré-aquecimento de sprites da expedição (carregamento) e não pode criar picos. Medir com `scratchpad/e2e/fps2.mjs` (ou equivalente) antes/depois.
- Referências baixadas são **uso interno**, com fonte e licença registradas em `FONTES.md`; preferir Wikimedia Commons/CC; não redistribuir.
- Nada de nomes/visuais de outras franquias (anime, filmes, jogos).
- Validação mínima por entrega: `npm run art`, `npx tsc --noEmit`, `npx vitest run`, E2E com puppeteer-core (Chrome em `C:/Program Files/Google/Chrome/Application/chrome.exe`, dev server `http://localhost:5173`), sem erros de console.

## Fase 1 — Documentar no `arquivo/mecanicas2.html` (sonnet; em paralelo com a Fase 2)
Arquivo: `LuadeSangue/arquivo/mecanicas2.html` (aba "Inimigos" e aba "Mundo e tempo: mapa…", seguindo o estilo visual e os códigos de regra já usados, ex. `MAP-xx`, `IA-xx`, `BOSS-xx`; marcar "proposta" onde for decisão nova).
1. **Mapas já feitos**, com descrição detalhada área por área (o que se vê, marcos reais, paleta, objetos de vasculhar, baús, arenas, onde fica mini boss e chefe, o que muda na Lua de Sangue), lendo o código real:
   - **Marco Zero (Recife)** — `jogo/art-src/map/marco-zero.js` (12 áreas: ponte, alfandega, feira, bomjesus, apolo, moeda, arsenal, riobranco, marco, sertao, travessia, molhe) + `jogo/src/data/maps/marcoZero.ts` (ondas).
   - **Olinda** — `jogo/art-src/map/olinda.js` (10 áreas: carmo … bonecos) + `jogo/src/data/maps/olinda.ts`.
   - Inclua prints reais do jogo (`jogo/prints/fluxo-completo/`, `jogo/prints/arte/`), embutidos como imagens.
2. **Zumbis**, ficha detalhada de cada um que existe no jogo (`jogo/src/data/zombies.ts`, IA em `jogo/src/expedition/ai/*.ts`, golpes em `ai/moves.ts`, arte em `jogo/art-src/zombies/*.js`): aparência, formas (comum/enluarado/plenilunar ou normal/fúria), todos os golpes com aviso/dano/alcance, comportamento tático (cerco, revezamento — `ai/tactics.ts`), fraqueza, onde aparece, status (vida/dano/xp). Inclua Gritador, Barrigudo, Saltador, A Chorona e o Boneco da Meia-Noite.
3. **Planejados**: ficha de design completa para os que ainda **não estão no jogo** e para os 2 mapas novos da Fase 3 (abaixo), antes da arte ser feita — isso vira o briefing dos artistas.

## Fase 2 — Referências (haiku baixa, sonnet/opus fazem a curadoria; em paralelo com a Fase 1)
~100 imagens no total, cada conjunto em sua pasta, com `FONTES.md` (arquivo, URL, página, autor, licença) e `index.html` em grade:
- `LuadeSangue/referencias/pelourinho/` (~40): Largo do Pelourinho, ladeiras, casarões coloridos, Igreja do Rosário dos Pretos, Elevador Lacerda, Mercado Modelo, Farol da Barra, noite.
- `LuadeSangue/referencias/ver-o-peso/` (~40): mercado de ferro azul, feira, docas, barcos, Estação das Docas, guindastes/porto, noite.
- `LuadeSangue/referencias/zumbis-novos/` (~20): referências de **figurino e materiais** (não de personagens de outros jogos): tropa de choque/escudo/colete (Blindado), roupas de estivador/portuário, gancho e caixotes (Estivador), pele com fungos/cegueira (Estalador), figurinos locais (percussionista baiano, barqueiro paraense).
- Se faltar Cosmic Invasion para algum tipo (cenário de porto/feira, chefe grande com arma), baixar mais para `referencias/marvel-cosmic-invasion/`.

## Fase 3 — Conteúdo novo (opus para arte/motor, sonnet para dados/UI/testes)
### Zumbis que faltam (arte nova + IA + dados)
- **Estalador** (cego, caça pelo som — doc: ignora quem anda devagar; correr/vasculhar/errar baú atrai; agarrão forte). Arte `art-src/zombies/estalador.js`, IA `src/expedition/ai/estalador.ts`, 2–3 golpes variados (via `ai/moves.ts`), formas comum/enluarado/plenilunar.
- **Blindado** (tropa de choque com escudo: de frente bloqueia; toma dano por trás ou após 3 golpes no escudo, que cai e vira outra pose). Arte `art-src/zombies/blindado.js`, IA `ai/blindado.ts` (o squad precisa flanquear: ajustar a IA dos lutadores para dar a volta no Blindado).
- **O Estivador** (chefe: gancho de carga que puxa até 4 tiles, arremessa caixotes que ficam no chão como obstáculo; fúria: camisa rasgada, gancho em chamas, puxa duas vezes). Arte `art-src/zombies/estivador.js` (230–335 px, intro de WARNING, rage, death), IA `ai/estivador.ts`.
- Chefe e mini boss de cada mapa novo (abaixo), com WARNING, intro, fúria e morte animadas.
- Atualizar `src/data/zombies.ts` com medidas reais (ax/G/top/w) medidas nos quadros, registrar no `REGISTRY` e no `tools/build-art.mjs`.

### 2 mapas novos (mesmo contrato do `MAP`/`OLINDA`: W, H, BASE, RS, build, drawMid, drawSky(g, mode, cam, t), drawFG, FGI, WINDOWS, LAMPS, AREAS com ids/chests, AID, TINT, drawLights)
1. **Pelourinho · Salvador (BA)** — `art-src/map/pelourinho.js` (10–12 áreas: Largo do Pelourinho, ladeiras, casarões, Rosário dos Pretos, Terreiro de Jesus, Elevador Lacerda, Mercado Modelo, Comércio, Farol da Barra). Chefe **O Ascensorista** (no topo do Elevador), mini boss **O Vendedor de Fitas**, variante local **Zumbi Percussionista**. Estreia do **Estalador**. Requer vencer Olinda.
2. **Ver-o-Peso · Belém (PA)** — `art-src/map/ver-o-peso.js` (10–12 áreas: feira, mercado de ferro, docas, barcos, Estação das Docas, porto com guindastes). Chefe **O Estivador** (cais/guindaste), mini boss **A Erveira**, variante local **Zumbi Barqueiro**. Estreia do **Blindado**. Requer vencer Pelourinho.
- Dados: `src/data/maps/pelourinho.ts`, `ver-o-peso.ts` (ondas usando todos os zumbis disponíveis, com dificuldade crescente; `nivelRecomendado`, `requer`, `arenaPos`, `semVasculhar`, `loot` com o loot regional do doc: cocada / açaí), objetos de vasculhar próprios por área (`art-src/objects/obj.js` — áreas novas), baús.
- Aparecem na seleção de mapa (cartões com prévia e bestiário em silhueta), no bestiário em cartas e na escolha de destino; recrutas/pets podem aparecer neles; consumo de provisões proporcional.

## Fase 4 — Validação final e entrega (sonnet executa, opus revisa)
- Expedição completa em cada mapa novo até o chefe (e uma com squad fraco para checar dificuldade), sem erros.
- FPS (1× e 4×) com tabela antes/depois; nada abaixo das metas.
- Prints: `jogo/prints/expansao/` (cada área dos mapas novos, WARNING e luta de cada chefe/mini boss, folhas de animação dos zumbis novos, comparação lado a lado com Cosmic Invasion e foto real).
- Atualizar `jogo/README.md` (como adicionar mapa/zumbi) e a memória do projeto.
- Relatório final curto em pt-BR para o usuário, com os prints principais enviados.
