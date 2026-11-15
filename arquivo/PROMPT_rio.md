# Briefing — 5º mapa: Lapa · Rio de Janeiro (RJ)

Jogo: `LuadeSangue/jogo/` (Vite + TS; arte procedural em `jogo/art-src/`, empacotada por `npm run art` em `public/art/art-exp.js`).
Leia antes: `jogo/ART_DIRECTION.md`, `LuadeSangue/arquivo/PROMPT_expansao.md` (regras fixas, contrato de mapa/zumbi) e as refs em `LuadeSangue/referencias/`.

## Regras fixas
- **Direção de arte = Marvel Cosmic Invasion** (refs em `referencias/marvel-cosmic-invasion/`): 960×540, personagens ~130 px, chefes 230–335 px, contorno escuro, rim light, sombreamento em placas, animação com antecipação/impacto/recuperação. **Designs nossos, brasileiros**; nunca copiar Marvel, anime, filmes ou jogos. Nada de pessoas reais, marcas, figuras religiosas (ex.: não usar Zé Pelintra).
- Toda arte nova é comparada lado a lado (nossa × Cosmic Invasion × foto real) antes de entregar. Prints em `jogo/prints/rio/<seu-nome>/`.
- **Processo**: refs → ficha/descrição → arte. As refs já estão baixadas (ver abaixo); leia várias imagens de verdade antes de desenhar.
- Desempenho: ≥ 30 fps. Quadros procedurais pesados entram no pré-aquecimento (`src/expedition/warm.ts` já cobre zumbis das ondas).
- Validação: `npm run art`, `npx tsc --noEmit`, `npx vitest run`. Navegador: Chrome em `C:/Program Files/Google/Chrome/Application/chrome.exe`; `playwright-core` já instalado em `C:/Users/lucas/AppData/Local/Temp/claude/ee94c68fe4b55f69/a5677426-f33f-4f62-8ffe-06a1ff9204e1/scratchpad/node_modules` (rode seu script de lá; use uma **porta própria** pro `npx vite --port <porta> --strictPort`). Atalhos de teste: `window.__lds` (state, router), `window.__xpw` (mundo da expedição), `?debug` libera velocidade 8×, `/zumbis.html` = catálogo de zumbis com todas as animações.
- **Dono exclusivo**: cada agente só edita os arquivos listados pra ele. Precisa de mudança em arquivo de outro? Descreva no relatório final; o orquestrador integra.

## Referências (já baixadas, Wikimedia Commons)
- Mapa: `referencias/lapa-rio/` (~120: Arcos da Lapa, Escadaria Selarón, bonde e ruas de Santa Teresa, Lavradio, Lapa à noite, Catedral, Cinelândia/Theatro Municipal, Central do Brasil, morro/favela, baía e Pão de Açúcar, detalhes de rua).
- Zumbis: `referencias/zumbis-rio/malandro/`, `.../passista/`, `.../maquinista/` (~100 cada). Cada pasta tem `FONTES.md` e `index.html`.

## Mapa `lapa` (export de arte `LAPA`, arquivo `art-src/map/lapa.js`, dados `src/data/maps/lapa.ts`)
Nome "Lapa", requer `veropeso`, nível recomendado 18. 11 áreas (ids fixos, na ordem):
| id | área | o que tem |
|---|---|---|
| `central` | Central do Brasil | torre do relógio art déco, ônibus/trem parados, camelôs. Entrada. |
| `municipal` | Cinelândia | Theatro Municipal, praça, quiosques, Câmara; calçada portuguesa |
| `catedral` | Catedral Metropolitana | cone de concreto com vitrais, prédios modernos ao fundo |
| `lavradio` | Rua do Lavradio | casarões coloridos de 2 andares, antiquários, mesas de bar |
| `selaron` | Escadaria Selarón | degraus de azulejo colorido como fundo, bandeiras e vasos |
| `circo` | Circo Voador / Fundição | lona curva, palco, grades: **arena do mini boss A Passista** |
| `boemia` | Lapa boêmia | bares, neon, roda de samba largada, ambulantes de espetinho |
| `santateresa` | Santa Teresa | ladeira com casarões, trilhos e fios do bonde |
| `guimaraes` | Largo dos Guimarães | largo do bonde, bares, árvores grandes |
| `mirante` | Mirante | o morro com casinhas iluminadas, baía e Pão de Açúcar ao longe |
| `arcos` | Arcos da Lapa | os arcos brancos com o bonde amarelo em cima: **arena do chefe O Maquinista do Bonde** |
Sem vasculhar em `arcos`. Mini boss em `circo` (arena 2), chefe em `arcos`.

## Zumbis novos (ids fixos)
| id | export | tipo | porte | arquivo arte | arquivo IA |
|---|---|---|---|---|---|
| `malandro` | `MALANDRO` | variante local | ~130 px | `art-src/zombies/malandro.js` | `src/expedition/ai/malandro.ts` |
| `passista` | `PASSISTA` | mini boss | ~240 px (com plumas) | `art-src/zombies/passista.js` | `src/expedition/ai/passista.ts` |
| `maquinista` | `MAQUINISTA` | chefe | 230–335 px | `art-src/zombies/maquinista.js` | `src/expedition/ai/maquinista.ts` |
Hoje os 6 arquivos são STUBS (cópias de Percussionista/Vendedor de Fitas/Ascensorista) já registrados em `tools/build-art.mjs`, `src/expedition/ai/index.ts` (REGISTRY) e `src/data/zombies.ts`. O agente dono reescreve os dois arquivos dele e ajusta **só a própria linha** em `src/data/zombies.ts` (ax/G/top/w medidos nos quadros, hp/dmg/xp/drop/desc).

Design de partida (o agente refina pela ficha):
- **Zumbi Malandro**: terno de linho branco sujo e rasgado, camisa listrada, lenço no pescoço, chapéu panamá, sapato bicolor, navalha. Golpes: navalhada em sequência, rasteira que derruba, ginga (esquiva de frente com chance; de costas não esquiva), chapéu arremessado (projétil curto). Fraqueza: aberto depois da rasteira. Formas comum/enluarado/plenilunar.
- **A Passista** (mini boss): fantasia de plumas com esplendor nas costas, coroa, lantejoulas, saia de franjas, sandália de salto. Golpes: giro de plumas (área, empurra), pisão de salto com aviso no chão, chuva de lantejoulas em leque (deixa o chão lento ou cega por pouco tempo), avanço sambando. Fúria (formas normal/fúria): plumas em chama lunar, mais rápida, chama 2 Malandros ("ala"). Tonta 1,5 s depois do giro. Intro de WARNING, fúria e morte animadas.
- **O Maquinista do Bonde** (chefe): motorneiro zumbi gigante de quepe e uniforme, segurando a manivela do controle e a vara do trole como arma, sino no peito. Golpes: bonde sem freio (o bonde amarelo atravessa a arena numa faixa com aviso, como as cabines do Ascensorista), vara do trole com arco elétrico em área, badalada do sino que atordoa, faíscas da catenária caindo em pontos marcados. Vulnerável depois que o bonde passa (recarrega a manivela). Fúria: uniforme rasgado, eletricidade vermelha, o bonde passa duas vezes. Intro de WARNING, fúria e morte animadas.
