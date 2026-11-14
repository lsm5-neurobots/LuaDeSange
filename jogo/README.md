# Lua de Sangue — MVP

Idle 2.5D no estilo beat 'em up clássico. Landing → criar recruta → abrigo → expedição automática no Marco Zero → loot volta pro abrigo → Lua de Sangue ataca a cada 3 noites.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173  (?debug libera "terminar obra" e "+50 de tudo")
npm run build      # typecheck + build em dist/
npm test           # regras de jogo (Vitest)
npm run art        # monta public/art/*.js a partir de art-src/ (um arquivo por factory de arte)
```

## Estrutura

```
art-src/           fonte da arte procedural: shared/ (PIX, herói, Vigia, armas), zombies/, objects/, map/, hub/
public/art/        pacotes gerados por tools/build-art.mjs (ART_EXP / ART_HUB) — não editar à mão
public/tools/      sheet.html (folha de animação) e map.html (prévia do cenário) para conferir arte
ART_DIRECTION.md   especificação de arte (960×540, ~130 px por personagem, contrato das factories)
src/core/          router de telas, loop, eventos, rng, dom
src/art/           ponte tipada com a arte (legacy.ts) e atores (sprites.ts)
src/data/          conteúdo: recursos, armas, estruturas, recrutas, zumbis, Lua de Sangue, mapas
src/game/          regras puras (sem DOM): estado/save, economia, abrigo, Lua de Sangue, armas, recompensas, time
src/expedition/    motor do beat 'em up: world, fighter, combat, director, render, engine, ai/
src/services/api   persistência (localStorage hoje; trocar por Firebase/Supabase mantendo a interface)
src/ui/            telas (landing, create, shelter, expedition), painéis do abrigo, widgets
tests/             testes das regras
```

## Como adicionar

- **Zumbi:** entrada em `src/data/zombies.ts` (stats, `art`, `ai`, `mapa`) + comportamento em `src/expedition/ai/<nome>.ts` registrado em `ai/index.ts`. A arte precisa existir em `ART_EXP`.
- **Mapa:** arquivo em `src/data/maps/` com `ondas` por área + registro em `maps/index.ts`. O cenário vem de `ART_EXP.MAP` (para um mapa novo, portar o cenário pro pacote de arte).
- **Arma:** família em `src/data/weapons.ts` (`tipo` melee/ranged/beam, dano, alcance, cadência) e receita em `recipe()`. O comportamento por tipo está em `expedition/fighter.ts`.
- **Estrutura:** entrada em `src/data/structures.ts`; posição/sprite vêm do `ABRIGO` legado (mesmo id).
- **Login/conta:** implementar `Api` de `src/services/api.ts` com o provedor escolhido.

## Notas

- Tela cheia imersiva: abrigo e expedição ocupam a viewport; HUD e menus flutuam por cima. Em celular em pé a cena cabe na largura.
- Dificuldade escala com o dia (`combat.ts`: `diff`), nível do lutador (`fighter.ts`: `VMAX`, `LMUL`) e forma lunar dos zumbis.
