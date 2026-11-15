# Prompt: Lua de Sangue, MVP jogável (orquestração multi-agente)

Você é o **orquestrador** (opus). Objetivo: construir em `C:\Users\lucas\Desktop\CerebroNB\LuadeSangue\jogo\` o MVP jogável e escalável da Lua de Sangue, um idle 2.5D no estilo beat 'em up clássico, aproveitando a arte procedural que já existe.

## 1. Escopo do MVP

Fluxo único, de ponta a ponta:

1. **Landing**: título, desfile de personagens animados, botão **Jogar agora**. Se já houver save, o botão vira **Continuar** e vai direto pro abrigo.
2. **Criar recruta**: personalizar o personagem inicial (corpo, pele, cabelo, barba, olhos, roupa, calça, tênis, acessório, nome) com prévia animada e botão Aleatório.
3. **Abrigo**: cena lateral com fogueira, estruturas e atores andando. HUD de recursos. Construir e evoluir estruturas. **Reparar** o que a Lua de Sangue danificou. **Bancada/serralheria**: fabricar e melhorar armas com recursos + projetos.
4. **Expedição automática** no **Marco Zero** (único mapa por enquanto): beat 'em up que se joga sozinho, com câmera que trava em arenas, **GO ➜** entre arenas, vasculhar objetos, baús, **tela de WARNING** antes do mini boss e do boss, barra de vida do chefe, fase de fúria, vitória ou derrota, e depois uma tela de resultado com o loot que volta pro abrigo.
5. **Lua de Sangue**: a cada ciclo (contado em expedições), o abrigo sofre um ataque ao voltar. As estruturas de defesa absorvem o dano e as demais podem ficar danificadas (produção parada até reparar). O reparo custa madeira, água e sucata.

**Conteúdo do Marco Zero:** 4 zumbis comuns (**Errante, Rastejante, Corredor, Cuspidor**), **mini boss Brutamonte**, **chefe O Açougueiro**. Os outros (Gritador, Barrigudo, Saltador, Estalador, Blindado, Chorona, Estivador) ficam registrados em `data/` com `mapa: futuro`, sem aparecer em ondas.

**Armas:** três famílias com dados próprios, cada uma em 4 raridades (comum, incomum, raro, lunar): **Bastão** (corpo a corpo, usa o `BATON` existente), **Pistola** (à distância, projétil) e **Laser** (feixe que carrega e atravessa). Pistola e laser exigem **projeto** (blueprint achado em baú) + nível da serralheria.

**Recursos:** madeira, sucata, pano, água, comida, remédio, peças, gasolina, fragmento lunar e projetos.

Fora do MVP: conta/login (deixar um `services/api.ts` com adapter local, pronto pra trocar por Firebase), outros mapas, multiplayer.

## 2. Stack e arquitetura (decisão do orquestrador)

- **Vite + TypeScript** (strict). Sem motor de terceiros: a arte é Canvas2D procedural (pipeline `PIX`), então um loop próprio com canvas é mais simples e mais rápido que adaptar ao Phaser.
- UI em **DOM + CSS** por cima do canvas (menus, HUD, modais). Cada tela é um módulo com `mount()` e `unmount()`.
- **Arte legada**: `tools/extract-art.mjs` extrai as factories dos HTML gerados (`arquivo/Arte Cosmica - Pivo Idle/demos/expedicao-completa.html` e `arquivo/Arte Cosmica - Pivo Idle/jogo.html`), embrulha cada pacote num namespace isolado (`window.ART_EXP`, `window.ART_HUB`) e grava em `public/art/`. O TS acessa a arte só via `src/art/legacy.ts` (tipos frouxos, `any` contido ali). Patch no HEROI: raridade do bastão por `cfg.tier` e desenho de pistola/laser por `cfg.arma`.
- **Conteúdo orientado a dados** (`src/data/`): zumbis, mapas/ondas, armas, estruturas, recursos, recrutas, Lua de Sangue. Um mapa novo = um arquivo novo em `data/maps/` + registro.
- **Lutadores genéricos**: perfil de combate por personagem (factory + aliases de animação). O Vigia usa o kit completo; herói e recrutas usam `combo/guard/hurt/walk` com aliases. A expedição aceita N lutadores (MVP: herói + 1 recruta opcional + pet, que fica só como bônus).
- **IA de zumbi** num registro de comportamentos por `kind` (`expedition/ai/*.ts`). Novo zumbi = um arquivo + uma entrada em `data/zombies.ts`.
- **Estado** num store único versionado (`game/state.ts`, `core/save.ts`, com migração por `v`). Regras puras (`game/economy.ts`, `game/shelter.ts`, `game/bloodmoon.ts`, `game/weapons.ts`) sem DOM, testáveis com Vitest.
- **Eventos** por `core/events.ts` (bus tipado): `expedition:finished`, `bloodmoon:attack`, etc.

```
jogo/
  index.html  package.json  tsconfig.json  vite.config.ts
  tools/extract-art.mjs
  public/art/art-exp.js  art-hub.js
  src/
    main.ts
    core/   loop.ts events.ts rng.ts save.ts router.ts dom.ts
    art/    legacy.ts sprites.ts
    data/   resources.ts zombies.ts weapons.ts structures.ts recruits.ts bloodmoon.ts maps/marcoZero.ts maps/index.ts
    game/   state.ts economy.ts shelter.ts bloodmoon.ts weapons.ts rewards.ts
    expedition/ engine.ts fighter.ts director.ts render.ts fx.ts spots.ts ai/{index,errante,rastejante,corredor,cuspidor,brutamonte,acougueiro}.ts
    services/ api.ts
    ui/     styles.css screens/{landing,create,shelter,expedition,results}.ts widgets/{hud,modal,toast}.ts
  tests/    economy.test.ts bloodmoon.test.ts
```

## 3. Orquestração: qual modelo faz o quê

| Complexidade | Modelo | Tarefas |
|---|---|---|
| **Simples/braçal** | `haiku` | inventário de APIs das factories (anims, assinaturas de `frame`), checar caminhos, rodar `npm run build`/testes e relatar erros, README |
| **Média** | `sonnet` | telas de landing e criação (portar de `fonte/jogo-page.html`), tela do abrigo (render via `ABRIGO.draw`, modais de construir/reparar/armas), CSS/design system, testes unitários |
| **Complexa** | `opus` (você) | arquitetura, contratos (`state.ts`, `legacy.ts`, `data/*`), extração da arte, **motor da expedição** (port + generalização do demo), balanceamento, Lua de Sangue, integração e revisão final |

Regras:
- O opus escreve **primeiro** o esqueleto e os contratos (tipos, store, router, art loader). Só depois disso os subagentes começam.
- Subagentes recebem briefing autossuficiente: caminhos exatos, contratos a usar, arquivos que **podem** tocar (e só esses), critério de pronto (`npx tsc --noEmit` limpo).
- Rodar em paralelo o que for independente: landing+criação ∥ abrigo ∥ expedição.
- Ninguém edita `arquivo/Arte Cosmica - Pivo Idle/` (é fonte de referência).
- Não gaste opus em tarefa braçal, nem dê decisão de design pro haiku.

## 4. Fluxo de execução

1. **[opus]** Scaffold Vite+TS, `extract-art.mjs`, `legacy.ts`, `data/*`, `game/state.ts`, `core/*`, router e telas vazias.
2. **[sonnet ∥ sonnet ∥ opus]** Landing+criação · Abrigo (construir, reparar, armas, Lua de Sangue visual) · Motor da expedição.
3. **[sonnet]** Testes Vitest das regras puras (economia, Lua de Sangue, armas).
4. **[opus]** Integrar, balancear, `vite build`, abrir no navegador e rodar o fluxo inteiro.
5. **[haiku]** README com como rodar, estrutura e como adicionar mapa/zumbi/arma.

## 5. Critérios de pronto

- `npm install && npm run dev` abre o jogo; `npm run build` e `npx tsc --noEmit` sem erros; testes passam.
- Landing → Jogar agora → Criar recruta → Abrigo → Expedição automática (com WARNING no mini boss e no boss) → Resultado → recursos no abrigo → construir/evoluir/reparar/fabricar arma.
- A Lua de Sangue acontece em ciclo, danifica estruturas e o reparo funciona.
- O save persiste (localStorage via `services/api.ts`).
- Adicionar um zumbi ou um mapa não exige mexer no motor.
