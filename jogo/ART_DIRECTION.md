# Direção de arte · Marco Zero (upgrade "hi-bit")

Meta: o primeiro mapa (zumbis, mini boss, chefe, herói, Vigia, objetos/baús e cenário) no **mesmo nível de acabamento e densidade de pixels** das referências em `../referencias/marvel-cosmic-invasion/` (111 imagens; `index.html` para folhear). Igualar **qualidade, densidade, luz, proporção e quantidade de animação**, com **designs nossos** (Recife, zumbis, sobreviventes). Nada de personagens, logos ou elementos da Marvel.

**Critério de aceite (rigoroso):** lado a lado com a referência em 960×540 nativo, o nosso asset precisa ser indistinguível em acabamento: mesma densidade de pixel, mesmo número de tons por material, mesmo nível de detalhe interno, contorno, luz de recorte e energia de pose. Se parecer mais simples ou mais chapado, não está pronto.

## Medidas tiradas das referências
- Resolução nativa ≈ **960×540** (os prints 1920×1080 têm blocos de 2 px). O jogo agora renderiza a expedição em 960×540 (`RS = 2,5` sobre a lógica 384×216).
- **Personagem comum: 120–140 px de altura** (~24% da tela). Grandalhões: 160–190 px. **Chefes: 230–300 px.** Gerados em `SK = 1,25` px por unidade da arte → personagem comum ≈ 104–112 unidades de altura no `FW/FH/GROUND` cru.
- **Chão jogável:** faixa de baixo ~45% da tela (lógico y 118–216); personagens andam entre y 146 e 206.
- **Sombra:** elipse chapada escura sob os pés (já desenhada pelo motor), nada de sombra projetada.

## Linguagem visual
- **Silhueta legível e exagerada:** cabeça, mãos e pés um pouco maiores; ombros largos; poses com linha de ação clara; antecipação forte e follow-through. Cada inimigo reconhecível só pela silhueta.
- **Rampas de cor com hue shift:** 4–5 tons por material; sombra puxa pra roxo/azul (`#3b2c63`/`#1c1233`), luz pra amarelo quente (`#fff2cc`). Contraste alto entre materiais (pele × roupa × metal).
- **Contorno seletivo:** contorno externo escuro (`#170b1c`) de 1 px na resolução final; linhas internas na cor de sombra do material, não preto. **Luz de recorte (rim)** fina de um lado (cor da lua/ambiente), como o pipeline PIX já faz.
- **Detalhe que se lê em 130 px:** dobras de roupa, costuras, rasgos, manchas, textura de pele podre, dentes, olhos brilhando, equipamento com volume (cinto, bolsas, botas). Clusters de pixel limpos, sem ruído/dither aleatório, sem pixel solto.
- **Zumbis da Lua de Sangue:** paleta podre (verdes acinzentados, roxos, carne exposta) com detalhes que brilham (olhos, ácido, veias) e variantes de forma `enluarado` (frio/roxo-ciano) e `plenilunar` (quente/laranja-vermelho, mais agressivo).
- **FX de impacto grandes:** estrelas de impacto, smear arcs, poeira, faíscas. Os golpes têm 1–2 quadros de smear.

## Animação (mínimos)
| Ator | Animações |
|---|---|
| Zumbi comum | idle 6–8 · walk 8 · attack(s) 7–10 com antecipação · hurt 3–4 + hurtB · fall (derrubada) 4–6 · getup 4–6 · death 6–8 · + 1–2 de personalidade (alert, taunt, spit, grab...) |
| Mini boss / chefe | idle 8 · walk 8 com peso · 3+ ataques com telegrafia · hurt · dazed/rage · fall/getup · death longa · intro (entrada na tela de WARNING) |
| Herói / Vigia | idle 8 · walk 8 · run 8 · combo A (3 golpes) · combo B · special · dodge/roll · hurt ×2 · fall · getup · victory · shoot/aim (pistola) · charge/fire (laser) |
| Objetos / baús | fechado (idle com brilho sutil) · vasculhando/abrindo 4–6 · aberto/vazio · trancado (tremida) |

Os nomes de animação que o motor já usa **não podem mudar** (ver contrato abaixo). Animações novas podem ser adicionadas; o motor passa a usá-las quando existirem.

## Contrato técnico (não quebrar)
- Cada factory continua em um arquivo de `art-src/` e exporta o mesmo objeto. `npm run art` monta `public/art/`.
- `frame(...)` **respeita `PIX.getK()`** (nada de escala "assada" no módulo) e a chave de cache inclui a escala. `FW`, `FH`, `GROUND`, `AX` em unidades cruas (sem escala).
- Zumbis: `frame(form, anim, fi, step)` e `framePose(form, anim, P, key)`; formas `comum`, `enluarado`, `plenilunar` (chefes: `normal`, `furia`); `mats(form)` com rampas `blood`/`acid` (usadas pelo sangue).
- Campos de evento usados pelo motor: `CUSP.ANIMS.attack.spitAt`; `RAS.ANIMS.walk.mv`; `ERR.ANIMS.alert`; `COR.ANIMS.miss`; `BRUT.ANIMS.charge.run[]`, `throw.toss`, `dazed`; `ACOU.ANIMS.attack.hit`, `attack.vuln[]`, `hook.throwAt`, `rage`, `walk.stomp[]`; herói/Vigia: `combo.hits` (quadro→golpe 1..3) ou `hitsx`.
- Medidas que o motor usa estão em `src/data/zombies.ts` (`ax`, `G`, `top`, `w` em unidades cruas). Se mudarem, informe os valores novos.
- Conferir com a folha: `node <scratchpad>/e2e/sheet.mjs "b=EXP&f=ERR&form=comum" saida.png` (dev server em http://localhost:5173). Comparar lado a lado com 2–3 referências.
