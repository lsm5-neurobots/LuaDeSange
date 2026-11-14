# Fichas de design: 8 zumbis comuns novos dos mapas atuais

Fonte do elenco: `fichas/ROSTER.md`. Direção de arte: `jogo/ART_DIRECTION.md` (padrão Marvel Cosmic Invasion, designs 100% nossos e brasileiros). Formato espelha o Zumbi Malandro em `mecanicas2.html` (`id="z-malandro"`). Tudo é **proposta**; números de status são provisórios e passam por `data/balance.ts` (escala por mapa/arena).

## Convenções comuns a todas as fichas

- **Tamanho:** porte comum, ~130 px de altura na tela a 960x540 (≈104-112 un. cruas, `SK = 1,25`). Chapéu/adereço alto pode passar disso (como o panamá do Malandro, `top 122`). Âncora/medidas finais (`ax, G, top, w`) saem do quadro real e voltam a `data/zombies.ts`.
- **Formas:** `comum`, `enluarado` (frio, roxo-ciano `#7af4ff`, rachaduras brilhando, 1,3x vida), `plenilunar` (quente, laranja-vermelho `#ffb43a`, mais sangue/osso, 1,6x vida e 1,5x dano). Mesmo padrão do Malandro; só o que muda de específico está descrito em cada ficha.
- **Animações mínimas (ART_DIRECTION):** idle 6-8, walk 8, attack(s) 7-10 com antecipação, hurt 3-4 + hurtB, fall 4-6, getup 4-6, death 6-8, mais 1-2 de personalidade (alert + a específica). Cada golpe: antecipação (aviso legível, 120-400 ms), impacto (1-2 quadros de smear), recuperação (janela de contra-ataque).
- **Corrupção da Lua de Sangue:** pele cinza-esverdeada, veias/olhos de lua brilhando, carne exposta nos rasgos. Nada de pessoas reais, marcas, logos ou figuras religiosas; roupas e ofícios tratados com dignidade, nunca como caricatura.
- **Rampas:** 4-6 tons por material, sombra para roxo/azul (`#3b2c63`, `#1c1233`), luz para amarelo quente (`#fff2cc`), contorno `#170b1c`. Materiais `blood` e `acid` obrigatórios em `mats(form)`.
- **Raridade:** variantes locais entram como `incomum`/`raro` (como Percussionista/Barqueiro/Malandro, IA-30/33); definido em cada ficha.
- **Códigos:** IA-40 a IA-63 (IA-34 é o último em uso). 3 regras por zumbi.
- **Pasta de arte/dados:** `art-src/zombies/<id>.js`, `ai/<id>.ts`, entrada em `data/zombies.ts`. Referências: `referencias/zumbis-<mapa>/<id>/` (spec em `referencias/_tools/specs/<id>.json`, ~100 imagens, **ainda não baixadas**).

### Tabela de status propostos (calibrada pelos existentes: Saltador 60/12/6, Percussionista 75/10/7, Barqueiro 90/14/8, Malandro 95/14/9, Blindado 160/14/9)

| id | Mapa (nível) | hp | dmg | xp | drop | raridade |
|---|---|---|---|---|---|---|
| frevista | Olinda (6) | 65 | 11 | 7 | pano 25% | incomum |
| baiana | Pelourinho (11) | 100 | 12 | 8 | comida 30% | incomum |
| turista | Pelourinho (11) | 55 | 8 | 7 | sucata 25% | raro |
| peixeiro | Ver-o-Peso (14) | 105 | 15 | 9 | comida 30% | incomum |
| acaizeiro | Ver-o-Peso (14) | 120 | 12 | 9 | madeira 30% | incomum |
| seresteiro | Lapa (18) | 85 | 10 | 10 | pano 25% | raro |
| garcom | Lapa (18) | 80 | 13 | 10 | sucata 30% | incomum |
| grafiteiro | Lapa (18) | 75 | 9 | 10 | sucata 25% | raro |

---

# 1. Zumbi Frevista · `frevista` · Olinda (PE)

**Onde aparece:** Carmo, São Francisco, Misericórdia, Alto da Sé, Amparo, Quatro Cantos, Ribeira, São Bento, Bonfim (rara no Carmo; mais frequente a partir da Misericórdia; ala de apoio na arena da Chorona, 1-2 unidades). Só em Olinda.

**Conceito e lugar:** O passista de frevo é a alma do Carnaval de Olinda (frevo, patrimônio imaterial da humanidade). A Lua de Sangue prendeu a folia: o corpo ainda dá o passo (tesoura, ferrolho, "dobradiço") em zigue-zague e a sombrinha gira sozinha. Respeito: é um dançarino, não uma piada; a roupa é a de um brincante de rua, sem blackface nem paródia de pessoas reais. Joga como zumbi "elusivo": difícil de acertar por linha reta, rebate projétil com a sombrinha.

**Aparência**
- Silhueta: magro, pernas longas em passo aberto, joelhos dobrados, tronco inclinado e braços abertos; **sombrinha de frevo** (pequena, ~60 cm de diâmetro, colorida, vareta curta) na mão alta forma um "disco" que se lê de longe. Cabeça pequena, pés grandes.
- Figurino: camisa de cetim de mangas curtas (listrada em gomos), calça curta de cetim (3/4) com barra bordada, meias listradas até o joelho, tênis/sapatilha de sola fina, faixa de tecido na cintura, chapéu de palha de aba curta com fita (tombado).
- Materiais: cetim (brilho forte, dobras rasgadas), pano da sombrinha (gomos tingidos, furos, varetas de metal à mostra), palha, pele podre.
- Paleta: pele `#8a9a82`/sombra `#46583f`; camisa vermelho-frevo `#c8323c` e amarelo `#f2c230`; calça verde `#2f9a5a` com bordado `#f6e8a8`; sombrinha em gomos `#e8402e`, `#f2c230`, `#2f8fd8`, `#2f9a5a`, varetas `#b8b0a8`; meias `#e8e0c8`/`#c8323c`; palha `#d8b878`; sangue `#7a1020`; contorno `#170b1c`.
- Adereços: sombrinha (alvo do golpe e da defesa), fita de confete grudada no cabelo, serpentina rasgada no pescoço.
- Corrupção: olhos de lua amarelo-pálidos, confete preso em feridas, gomos da sombrinha rasgados, serpentina de tripa.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | cores vivas desbotadas, sombrinha inteira | rebate 1 projétil por vez; passo em zigue-zague |
| Enluarado | cetim lilás-azulado, rachaduras ciano na sombrinha e nas pernas | 1,3x vida; janela da sombrinha 1,2x mais longa |
| Plenilunar | cetim vermelho encharcado, sombrinha em chamas lunares laranja, costelas à mostra | 1,6x vida, 1,5x dano; sombrinha também gira como golpe duplo |

**Tamanho:** ~130 px (sem chapéu ~118); `ax 80 · G 150 · top 118 · w 16` (provisório).

**Animações:** idle 8 (passo parado, sombrinha girando no ombro, balança o peso), walk 8 (passo de frevo em zigue-zague, sombrinha equilibrada), alert 6 (abre a sombrinha com estalo e tira o chapéu), `attack` 9 (golpe de sombrinha: antecipação com a sombrinha atrás da cabeça 150 ms, impacto 2 quadros com smear em arco, recuperação 3 quadros), `twirl` 8 (gira a sombrinha à frente: antecipação "abre", 5 quadros de giro com disco horizontal, fecha), `tesoura` 8 (passo de tesoura em deslize: antecipação agacha 200 ms, desliza com a perna esticada, levanta), hurt 4 + hurtB, fall 5, getup 5, death 8 (gira, a sombrinha voa, cai de joelhos e de costas).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Sombrinhada `attack` | sombrinha atrás da cabeça, 150 ms | 0,9x (≈10) | 34 px | recarga 1,4 s, peso 3 |
| Giro da sombrinha `twirl` | abre a sombrinha, 180 ms; **defende** durante o giro | 0,5x por passada (≈6, 2 passadas) | 40 px em volta | **rebate projétil** (volta na direção do atirador a 60% do dano), empurra 10 px; recarga 5 s, peso 2 |
| Passo de tesoura `tesoura` | agacha com faixa no chão, 260 ms | 0,8x (≈9) | 52 px (avanço) | desliza atrás do alvo e vira; derruba só plenilunar; recarga 6 s, peso 2 |

**Comportamento tático:** Vaga com passos de frevo, alerta a 200 px e avança em zigue-zague (varia y ±8 px a cada 0,6 s, dificulta golpe em linha). Perto: sombrinhada; meia distância: giro defensivo; se há tiro/projétil no ar vindo de longe, tende a abrir a sombrinha e andar em direção ao atirador.

**Fraqueza / contra-jogo:** o giro da sombrinha rebate projétil, mas **por trás e no giro com a sombrinha fechada (quadros 1 e 8) ele leva dano normal**. Depois da tesoura ele **fica de costas por ~1,0 s** (levanta, ajeita o chapéu): janela de +25% de dano. Corpo a corpo vence a sombrinha; laser/beam atravessa (não rebate).

**Status propostos:** `hp 65 · dmg 11 · xp 7 · drop pano 25%` · incomum.

**Regras (propostas)**
- `IA-40` **Frevista, sombrinha defensiva:** durante o giro (`twirl`) projétil de frente é rebatido (60% do dano de volta ao atirador, limite 1 por giro); beam/laser e golpes por trás ignoram. Janela do giro: 0,7 s.
- `IA-41` **Frevista, passo em zigue-zague:** em `chase` varia a faixa em ±8 px a cada 0,6 s; não passa de 1 mudança de faixa por golpe.
- `IA-42` **Frevista, tesoura e ajeito:** a tesoura passa pelas costas do alvo e termina de costas; a janela de ajeito (1,0 s) dá +25% de dano; não faz tesoura a menos de 20 px da borda.

**Referências a buscar (≈100 imagens, spec `specs/frevista.json`, pasta `zumbis-olinda/frevista`)**
1. Sombrinha de frevo (14) · 2. Passista de frevo em pose (14) · 3. Figurino do frevo, camisa/calção/meia (12) · 4. Chapéu, fita e adereço de cabeça (8) · 5. Orquestra de frevo e metais (12) · 6. Carnaval de rua de Olinda (16) · 7. Ladeiras, casario e igrejas de Olinda (14) · 8. Sombrinhas e guarda-chuvas: materiais, varetas (10).

---

# 2. Zumbi Baiana do Acarajé · `baiana` · Pelourinho (BA)

**Onde aparece:** Largo do Pelourinho, Rosário dos Pretos, Casarões, Terreiro de Jesus, Tomé de Sousa (rara no Largo, mais comum no Terreiro e Casarões). Só no Pelourinho.

**Conceito e lugar:** A baiana de acarajé é ofício e patrimônio imaterial de Salvador (IPHAN): vendedora de rua com tabuleiro, tacho de dendê e roupa branca de renda. Aqui ela é **trabalhadora da rua tomada pela Lua**, com dignidade: o foco é o **ofício** (tabuleiro, tacho, bata, turbante), **sem objetos ou símbolos rituais e sem referência a entidade ou religião** (como o Malandro, MAP-08/31). Joga como zumbi de zona: defende espaço com poça de dendê que queima.

**Aparência**
- Silhueta: **larga e curva**, saia rodada em sino, turbante alto que alonga a cabeça, **tabuleiro** (bandeja grande de madeira) apoiado na cintura/ombro; reconhece-se por saia + turbante + tabuleiro. Mais baixa de ombro, volumosa na base.
- Figurino: turbante branco (rasgado, escurecido por fuligem), bata de renda branca com rasgo no ombro, saia rodada branca com várias camadas (barra queimada e com manchas de dendê laranja), pano da costa listrado no ombro, avental de pano com bolso, chinelo de couro. Contas simples e neutras (sem cores rituais) e uma pulseira de metal.
- Materiais: renda (padrão vazado, sombra roxa por baixo), algodão (dobras), madeira do tabuleiro, metal enegrecido do tacho/panela, dendê (translúcido laranja).
- Paleta: renda `#efe6d2`, sombra `#a89cb8`/`#5a4c78`; saia manchada `#d8cdb4`; dendê `#e8801c`/`#b8500c`; madeira `#8a5a30`; pano da costa `#2f8fd8` e `#f2c230`; panela `#3a2c34`; pele `#7a6a62` (pele negra podre: tom escuro com realce verde-cinza `#50625a`); sangue `#7a1020`.
- Adereços: tabuleiro com acarajés queimados, **panela de dendê fervendo** (fumaça e bolhas laranja), concha grande, pano de prato no ombro.
- Corrupção: olhos de lua, veias luminosas no pescoço, dendê fervendo escorre da panela, língua preta, renda corroída.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | branca encardida, dendê alaranjado | poça de dendê 5 s |
| Enluarado | renda lilás, dendê verde-ciano frio, rachaduras brilhando | 1,3x vida; poça 6 s |
| Plenilunar | saia em brasa, dendê vermelho-fogo, panela rachada soltando faíscas | 1,6x vida, 1,5x dano; poça maior (+25% raio), joga 2 panelas |

**Tamanho:** ~130 px com turbante; `ax 82 · G 150 · top 122 · w 22` (provisório, corpo largo).

**Animações:** idle 8 (mexe o tacho com a concha, tabuleiro balança), walk 8 (passo largo, saia balança, panela chacoalha), alert 6 (ergue a concha e rosna), `attack` 8 (concha: antecipação com concha atrás, impacto horizontal, recuperação), `splash` 9 (arremessa dendê: antecipação com a panela erguida e bolhas 300 ms, arremesso arco curto, recuperação com panela vazia), `bash` 8 (tabuleirada: gira o tabuleiro de lado empurrando), hurt 4 + hurtB, fall 5, getup 6, death 8 (derruba o tabuleiro, panela rola e espalha o dendê, ela cai sentada).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Conchada `attack` | concha atrás, 160 ms | 0,9x (≈11) | 36 px | recarga 1,5 s, peso 3 |
| Tabuleirada `bash` | gira o corpo, 240 ms | 0,8x (≈10) | 40 px frente | empurra 16 px; recarga 3 s, peso 2 |
| Panela de dendê `splash` | panela erguida com **círculo no chão** no alvo, 350 ms | 0,5x no impacto (≈6) + poça | arremesso 40-110 px | poça de ≈24 px que **queima** (0,2x por 0,5 s) por 5 s; recarga 7 s, peso 2,5 |

**Comportamento tático:** devagar (velocidade ~85% do Errante). Mantém 60-100 px e arremessa a panela; se o alvo encosta, conchada/tabuleirada. Tenta posicionar poças entre o squad e a saída, forçando movimento. Tem o tabuleiro como defesa frontal parcial (-25% de dano de frente).

**Fraqueza / contra-jogo:** a panela precisa de **~1,0 s de reabastecimento** (mexe o tacho) depois de arremessar: janela aberta. Por trás e pelos lados sem o tabuleiro leva dano pleno. Se for morta **antes de arremessar**, a poça nasce pequena no próprio chão. Poça é evitável (aviso de círculo) e some.

**Status propostos:** `hp 100 · dmg 12 · xp 8 · drop comida 30%` · incomum.

**Regras (propostas)**
- `IA-43` **Baiana, panela de dendê:** arremesso com círculo de aviso (350 ms); no impacto cria poça de dendê (raio 24 px, 5 s, 0,2x de dano por 0,5 s); máximo de 3 poças ativas por baiana.
- `IA-44` **Baiana, tabuleiro:** golpes de frente sofrem -25% de dano enquanto o tabuleiro está erguido (idle/walk/bash); ataques por trás, de lado e depois do arremesso não sofrem.
- `IA-45` **Baiana, reabastecimento:** após `splash`, ~1,0 s mexendo o tacho (`idle`), sem atacar; +20% de dano nessa janela. Poças ativas ao morrer permanecem.

**Referências a buscar (≈100 imagens, spec `specs/baiana.json`, pasta `zumbis-pelourinho/baiana`)**
1. Baiana de acarajé no trabalho (14) · 2. Turbante, bata de renda e saia rodada (14) · 3. Tabuleiro, fogareiro e tacho (12) · 4. Panela de dendê e fritura (12) · 5. Acarajé, abará e comida de rua (10) · 6. Pelourinho: casario colorido e ladeiras (16) · 7. Poses: mulher de pé com bandeja, mãos na cintura (12) · 8. Colares de contas simples e avental (10).

---

# 3. Zumbi Turista · `turista` · Pelourinho (BA)

**Onde aparece:** Farol da Barra, Comércio, Largo do Pelourinho, Terreiro de Jesus, Tomé de Sousa, Elevador (rara; mais frequente nas áreas turísticas). Só no Pelourinho.

**Conceito e lugar:** O Pelourinho vive de visitantes; o turista fotógrafo ficou preso no instante da foto. É um **tipo genérico de viajante de roupa leve, sem nacionalidade marcada nem estereótipo ofensivo** (nada de caricatura de povo ou país): chapéu, câmera, mochila, colete, crachá de excursão. Zumbi frágil e fugidio que **cega com flash** e depois foge, atrapalhando o squad (como o Gritador, mas sem som).

**Aparência**
- Silhueta: magro, tronco para a frente, **câmera pendurada no pescoço** ou erguida à frente do rosto (reconhece-se pelo retângulo + lente), chapéu de aba larga, mochila volumosa nas costas, colete de bolsos, pernas finas de bermuda.
- Figurino: chapéu de aba larga bege (rasgado, aba caída), camisa florida de manga curta aberta (estampa de folhas), colete de viagem de bolsos, bermuda cargo, meias brancas com **sandália**, mochila pequena, **pochete** na frente, crachá de excursão (lanyard), óculos escuros quebrados na testa.
- Materiais: algodão, nylon (mochila/colete), plástico preto da câmera, vidro da lente (brilho forte), cabos/alças.
- Paleta: chapéu `#d8c898`; camisa `#2f9ab8` e `#e8603a` (estampa), sombra `#3b2c63`; colete `#8a7a4a`; bermuda `#a8946a`; câmera `#2a2630`, lente `#4fa3ff` com reflexo `#fff2cc`; meias `#e8e0d8`; mochila `#5a6a3a`; pele `#8a9a82`; sangue `#7a1020`.
- Adereços: câmera, flash (soquete laranja-branco), mapa dobrado no bolso, lanyard com crachá "GRUPO" genérico (sem marca), garrafa de água.
- Corrupção: olhos de lua atrás de óculos, a lente da câmera brilha como olho, fotos "impressas" grudadas como carne, fita de câmera enrolada no pescoço.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | cores de verão desbotadas, flash branco | cegueira 1,0 s |
| Enluarado | roupa lilás, flash ciano, rachaduras | 1,3x vida; cegueira 1,3 s |
| Plenilunar | camisa tingida de sangue, flash laranja, câmera "fundida" à mão | 1,6x vida, 1,5x dano; flash duplo em sequência |

**Tamanho:** ~128 px com chapéu; `ax 80 · G 150 · top 116 · w 14` (provisório).

**Animações:** idle 8 (ergue a câmera, ajusta o foco, balança o peso), walk 8 (andar curvado, passos curtos de quem olha para cima), alert 6 (vê o squad e aponta a câmera), `flash` 8 (antecipação: ergue a câmera ao rosto e franze 300 ms; impacto: clarão em 2 quadros de tela quase branca; recuperação: abaixa a câmera olhando o visor), `flee` 8 (corre em semicurva com a mochila balançando), `snap` 7 (pose de foto: agacha para enquadrar, clique), `bag` 8 (golpe de mochila: gira o corpo), hurt 4 + hurtB, fall 5, getup 5, death 7 (derrubado, câmera cai e o flash dispara no chão).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Flash `flash` | câmera erguida + **cone de luz no chão**, 300 ms | 0 (sem dano) | cone de 90 px | **ofusca** quem olhar de frente 1,0 s (acerto -50% de chance de acertar; mira ruim), recarga 6 s, peso 3 |
| Mochilada `bag` | gira o corpo, 200 ms | 0,8x (≈7) | 30 px | empurra 10 px; recarga 2 s, peso 2 |
| Foge e fotografa `flee` + `snap` | corre para longe; após 1,5 s volta a fotografar | 0 | corrida 70 px/s | atrai 1-2 zumbis próximos para o ponto da foto (ruído visual); recarga 9 s |

**Comportamento tático:** evita corpo a corpo; mantém 80-130 px, dispara o flash e foge para a borda; a cada 9 s foge e volta fotografando. Depois do flash, quem está cego fica vulnerável aos zumbis que correm para o clarão.

**Fraqueza / contra-jogo:** **frágil** (55 hp). Enquanto fotografa (`snap` 0,8 s) fica parado e vulnerável; **dano por trás** quebra a pose. Atacar de lado (fora do cone) não sofre cegueira. Fugir cria vazios úteis ao squad.

**Status propostos:** `hp 55 · dmg 8 · xp 7 · drop sucata 25%` · raro.

**Regras (propostas)**
- `IA-46` **Turista, flash:** cone de aviso (300 ms); lutadores no cone olhando para ele ficam ofuscados 1,0 s (tela clareia, -50% de chance de acertar); fora do cone não afeta; recarga 6 s.
- `IA-47` **Turista, foge e fotografa:** perto demais (<40 px) em 60% das vezes foge em vez de golpear; a cada 9 s volta e fotografa (0,8 s parado, +30% de dano nessa janela).
- `IA-48` **Turista, clarão atrai:** o flash faz zumbis comuns a 140 px mudarem de alvo para o ponto do clarão por 2 s (máx. 2 por flash).

**Referências a buscar (≈100 imagens, spec `specs/turista.json`, pasta `zumbis-pelourinho/turista`)**
1. Turista com câmera na mão (14) · 2. Câmeras compactas, flash e lentes (12) · 3. Chapéu de aba, boné e viseira (14) · 4. Mochila, pochete e colete de viagem (12) · 5. Camisa florida, bermuda e sandália (10) · 6. Grupo de turismo, guia e bandeirinha (10) · 7. Turistas no Pelourinho e em Salvador (20) · 8. Mapas, guias, crachá e lembrancinhas (8).

---

# 4. Zumbi Peixeiro · `peixeiro` · Ver-o-Peso (PA)

**Onde aparece:** Relógio, Feira do Açaí, Ferro, Doca, Barcos, Presépio, Docas (rara no Relógio, mais frequente no Ferro e na Doca). Só no Ver-o-Peso.

**Conceito e lugar:** Mercado de Peixe do Ver-o-Peso, em Belém: peixeiro de balcão, de avental e bota, cuja faca nunca para. O zumbi herda a rapidez do ofício: facão em sequência e **arremesso de peixe** que deixa chão escorregadio. Peixes de rio (pirarucu, dourada, tambaqui) aparecem como arma. Trabalhador do mercado, sem estereótipo.

**Aparência**
- Silhueta: **ombros largos, tronco grosso**, avental grande até o joelho, braço direito mais longo com facão; cabeça com boné ou touca; botas pesadas. Silhueta "bloco" com cabo de facão saindo.
- Figurino: boné de aba curva desbotado, camisa regata branca amarelada (manchas de sangue de peixe e escamas), **avental de borracha** amarelo/verde-oliva até o joelho, luvas de borracha amarelas, calça de moletom/calça fina arregaçada, botas de borracha brancas até a canela.
- Materiais: borracha (brilho úmido), pano úmido, aço do facão, escamas (brilho prateado), couro da bainha, pele com cicatrizes.
- Paleta: avental `#d8b82a`/sombra `#7a6a1c`; regata `#e0d8c0`; boné `#2f6a8a`; bota `#e8e4dc`; luvas `#e8c82a`; facão `#c8d0d4`/`#6a7078`; escamas `#a8d8e0`, `#e0f0e8`; sangue `#7a1020`; pele `#7e8c76`.
- Adereços: facão largo (ponta quadrada), peixe-arma (pirarucu menor/tambaqui), caixa de isopor às costas com gelo, balança de gancho pendurada no cinto, tábua de cortar.
- Corrupção: olhos de peixe leitosos, escamas grudadas na pele, barbatanas saindo do braço, bocas de peixe mordendo o avental, gelo-fantasma azul no cinto.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | avental amarelo sujo, peixe pequeno | arremessa tambaqui |
| Enluarado | avental azul-lilás, escamas brilhando ciano | 1,3x vida; piso escorregadio 6 s |
| Plenilunar | avental vermelho-sangue, peixe com dentes brilhando, olhos laranja | 1,6x vida, 1,5x dano; arremessa 2 peixes em leque |

**Tamanho:** ~130 px; `ax 84 · G 150 · top 114 · w 20` (provisório).

**Animações:** idle 8 (amola o facão no avental, escamas caem), walk 8 (passo pesado, bota chapinha), alert 6 (bate o facão no balcão, rosna), `chop` 9 (facão em 2 cortes: antecipação com o braço alto 170 ms, corte descendente, corte de revés), `throw` 9 (arremesso de peixe: antecipação com o peixe preso pela cauda, giro, lançamento arco), `hack` 8 (golpe de cima com facão e pé: finta + estocada), hurt 4 + hurtB, fall 5, getup 5, death 8 (o facão cai, escorrega na própria água e cai de costas, peixes se espalham).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Facão em duas `chop` | braço alto, 170 ms | 2 cortes, 1,1x total (≈16) | 38 px | avança no 2º corte; recarga 1,6 s, peso 3 |
| Arremesso de peixe `throw` | gira o peixe pela cauda, **faixa no chão** 320 ms | 0,7x (≈10) | 40-120 px | projétil que **deixa poça de escamas e água** (chão escorregadio: -35% de velocidade e perde tração) 6 s; recarga 6,5 s, peso 2,5 |
| Golpe de cima `hack` | finta, 260 ms | 1,2x (≈18) | 34 px | **de frente** (cutelo), empurra 8 px; recarga 4 s, peso 1,5 |

**Comportamento tático:** ágil de perto; arremessa quando o alvo está longe e depois avança. O arremesso deixa a poça no meio do caminho, quebrando a formação. Em grupo, os peixeiros alternam: um arremessa, outro avança.

**Fraqueza / contra-jogo:** o peixe é arremessado em linha com aviso na faixa: **sair da faixa evita tudo**. Depois do arremesso, **fica 0,9 s buscando outro peixe** (abre o isopor): janela de +25% de dano. Poça de água é evitável. Resiste a golpe frontal parcial com o avental (-10%).

**Status propostos:** `hp 105 · dmg 15 · xp 9 · drop comida 30%` · incomum.

**Regras (propostas)**
- `IA-49` **Peixeiro, arremesso e piso escorregadio:** faixa de aviso (320 ms); o peixe que cai cria poça (raio 22 px, 6 s) com -35% de velocidade; no máximo 2 poças ativas por peixeiro.
- `IA-50` **Peixeiro, facão em sequência:** 2 cortes (≈1,1x total), avança no 2º; golpe de cima só de frente e com finta (260 ms).
- `IA-51` **Peixeiro, isopor aberto:** após o arremesso fica 0,9 s buscando peixe, com +25% de dano; sem peixe (isopor vazio) só usa facão por 3 s.

**Referências a buscar (≈100 imagens, spec `specs/peixeiro.json`, pasta `zumbis-veropeso/peixeiro`)**
1. Peixeiro no balcão (14) · 2. Avental e bota de borracha (12) · 3. Facão, faca de peixe e cutelo (10) · 4. Peixes da Amazônia: pirarucu, tambaqui, dourada (14) · 5. Bancas, gelo, isopor e balança (12) · 6. Mercado Ver-o-Peso (16) · 7. Poses: arremesso, corte e carregamento (12) · 8. Piso molhado, escamas e sangue de peixe (10).

---

# 5. Zumbi Açaizeiro · `acaizeiro` · Ver-o-Peso (PA)

**Onde aparece:** Feira do Açaí, Relógio, Ferro, Doca, Barcos, Presépio, Armazém (mais comum na Feira do Açaí). Só no Ver-o-Peso.

**Conceito e lugar:** Belém vive do açaí: carregadores do rio descarregam rasas e **paneiros** (cestos) nas docas da Feira do Açaí. O zumbi é o **carregador ribeirinho** curvado sob um paneiro cheio de açaí. Rasteira de corpo com o paneiro e poça roxa de suco que prende os pés. Trabalhador do rio (peconheiro/carregador), sem estereótipo.

**Aparência**
- Silhueta: **forma de "C"**, corcunda sob o paneiro nas costas (cesto cônico alto, até acima da cabeça), tronco muito inclinado, braços longos e fortes, bermuda, pés descalços/chinelo; paneiro faz a silhueta única.
- Figurino: camisa de manga curta suja (cor de barro), bermuda de brim escura, chapéu de palha ou boné, cinto/corda de peconha amarrado ao tornozelo, pés descalços sujos de lama roxa, alça de cipó/cordão na testa para segurar o paneiro.
- Materiais: palha/arumã trançada (paneiro), cipó, algodão, açaí (líquido roxo espesso, brilhante), lama.
- Paleta: paneiro `#a8783a`/sombra `#5a3a1c`; açaí `#4a1a6a`, `#7a2a9a`, brilho `#b86ae0`; camisa `#8a7a58`; bermuda `#2a3a4a`; chapéu `#d8b878`; pele `#6e7c66`; lama `#4a3a2a`; sangue `#7a1020`; contorno `#170b1c`.
- Adereços: paneiro (cesto) de açaí, cachos soltos, caroços, peconha (laço de pano ou fibra), facão curto de coleta preso ao cinto.
- Corrupção: olhos de lua, açaí vazando do paneiro como sangue roxo brilhante, cachos com olhos, raízes de cipó nascendo nas costas.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | paneiro de palha, açaí roxo escuro | poça 5 s |
| Enluarado | paneiro azulado, suco ciano-violeta, rachaduras brilhando | 1,3x vida; poça 6 s e -30% de velocidade |
| Plenilunar | paneiro em brasa, açaí vermelho-vinho espesso, cipós vivos | 1,6x vida, 1,5x dano; derrama 2 poças |

**Tamanho:** ~126 px (com paneiro mais alto ~140); `ax 90 · G 150 · top 126 · w 24` (provisório; caixa larga).

**Animações:** idle 8 (rebola o paneiro, ajeita a alça), walk 8 (passo curto e pesado, paneiro balança), alert 6 (vira o tronco e ruge), `sweep` 9 (**rasteira com o paneiro**: antecipação gira o tronco para trás 250 ms, varredura horizontal baixa, recuperação desequilibrado), `bash` 8 (cotovelada com o paneiro erguido), `spill` 9 (derrama açaí: inclina o paneiro e joga o suco na frente), hurt 4 + hurtB, fall 5, getup 6, death 8 (o paneiro se desprende e despeja o açaí roxo em cima dele).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Rasteira do paneiro `sweep` | **faixa baixa no chão** + gira para trás, 320 ms | 0,9x (≈11) | 48 px | derruba (0,9 s caído); recarga 4,5 s, peso 2 |
| Paneirada `bash` | tronco ergue o paneiro, 220 ms | 0,8x (≈10) | 34 px | empurra 12 px; recarga 2,2 s, peso 3 |
| Derramar o açaí `spill` | inclina o paneiro com **círculo no chão**, 300 ms | 0,3x (≈4) | 30-90 px | poça roxa de ≈28 px: **-45% de velocidade** por 5 s; recarga 7 s, peso 2 |

**Comportamento tático:** lento e teimoso (velocidade ~80% do Errante), mas a rasteira é longa e derruba. Derrama a poça para prender o squad e usa a rasteira na sequência. Prefere ficar na frente e "dar a costas" (paneiro) ao grupo.

**Fraqueza / contra-jogo:** **o paneiro protege as costas** (-30% de dano por trás, por isso atacar por trás é pior; pelos lados e de frente é melhor); depois da rasteira, **fica 1,2 s desequilibrado** (caído de joelho): janela de +30%. Quebra o paneiro após 6 golpes seguidos: derruba o açaí e ele fica mais frágil (+20% de dano) e sem rasteira. Poça é evitável: a lentidão é só dentro dela.

**Status propostos:** `hp 120 · dmg 12 · xp 9 · drop madeira 30%` · incomum.

**Regras (propostas)**
- `IA-52` **Açaizeiro, rasteira do paneiro:** faixa de aviso (320 ms); acerto derruba 0,9 s; depois fica 1,2 s desequilibrado (+30% de dano).
- `IA-53` **Açaizeiro, poça roxa:** `spill` cria poça de raio 28 px por 5 s com -45% de velocidade a lutadores e zumbis (inclusive aliados dele); máximo 2 poças por açaizeiro.
- `IA-54` **Açaizeiro, paneiro:** -30% de dano nas costas enquanto o paneiro está inteiro; após 6 acertos no paneiro ele quebra (+20% de dano recebido, sem rasteira, solta um cacho de comida).

**Referências a buscar (≈100 imagens, spec `specs/acaizeiro.json`, pasta `zumbis-veropeso/acaizeiro`)**
1. Carregador de açaí com paneiro (14) · 2. Paneiro, cesto de arumã e cipó (12) · 3. Cacho de açaí, caroço e suco roxo (12) · 4. Peconha, escalada de palmeira (10) · 5. Ribeirinho: roupa, bermuda, camisa e chapéu (12) · 6. Feira do Açaí e docas de Belém (16) · 7. Poses: agachado, rasteira, carga pesada nas costas (12) · 8. Lama, rio e barcos regionais (12).

---

# 6. Zumbi Seresteiro · `seresteiro` · Lapa (RJ)

**Onde aparece:** Lapa boêmia, Santa Teresa, Largo dos Guimarães, Mirante, Lavradio (rara no Lavradio; mais comum na boemia e em Santa Teresa). Só na Lapa.

**Conceito e lugar:** A seresta (serenata sob a janela com violão) é tradição do Rio boêmio; a Lapa é seu palco. O zumbi é o **seresteiro de paletó e chapéu** cujo canto virou arma. A serenata em área **atordoa** quem ouve; de perto, o violão é arma. Também tem cuidado: não imita pessoa real, não usa canções protegidas por direitos (só "notas" visuais) e nenhuma figura religiosa. Aparentado ao Malandro (mesmo mundo), mas diferenciado: ele é **estático e de área**, o Malandro é ágil e de duelo.

**Aparência**
- Silhueta: **corpo ereto e levemente curvado sobre o violão**, braço da esquerda dobrado no braço do violão; chapéu de aba curta ou boina; paletó curto e gravata borboleta. O violão grande segura a silhueta (corpo oito + braço longo).
- Figurino: boina de feltro (ou chapéu de feltro de aba curta), paletó claro de linho creme (amassado, manga rasgada), camisa branca com gravata borboleta vinho solta, calça de pregas marrom, sapato de couro de bico fino, lenço no bolso.
- Materiais: madeira do violão (verniz marrom, craquelado), cordas de nylon/metal (brilho fino), feltro, linho, couro; pele podre cinza.
- Paleta: violão `#a85a24`/`#5a2c10`/tampo `#d89a4a`, braço escuro `#2a1a10`, cordas `#f0e0b0`; paletó `#d8c8a0`, sombra `#8a7a58`/`#5a4a6a`; gravata `#8a2a3a`; calça `#6a4a30`; boina `#3a2a40`; pele `#8a9a82`; sangue `#7a1020`; notas luminosas `#fff2cc`/`#7af4ff`.
- Adereços: **violão** (alvo e arma), palheta, microfone antigo pendurado (opcional na plenilunar), lampião de rua.
- Corrupção: olhos de lua semicerrados, boca aberta com som visível (ondas translúcidas), cordas viram nervos e sangram, notas flutuando como vagalumes de luz.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | creme/marrom boêmio, violão inteiro | serenata de 1,2 s de efeito |
| Enluarado | paletó lilás, violão com rachaduras ciano, notas azuis | 1,3x vida; serenata 1,5 s e alcance maior |
| Plenilunar | paletó encharcado de vermelho, violão em brasa, notas laranja | 1,6x vida, 1,5x dano; serenata chega a 2 ondas |

**Tamanho:** ~128 px (com chapéu); `ax 80 · G 150 · top 116 · w 18` (provisório).

**Animações:** idle 8 (dedilha o violão, ombro balançando, boca se mexendo), walk 8 (passo lento tocando, curvado), alert 6 (afina uma corda e sorri torto), `serenata` 10 (**canto em área**: antecipação planta os pés e inala 400 ms com **círculo no chão**, canto 4 quadros com ondas, recuperação respira), `strum` 8 (golpe de cordas em arco: acorde que empurra), `smash` 8 (**quebra o violão de perto**: ergue com as duas mãos, bate descendo, estilhaços), hurt 4 + hurtB, fall 5, getup 6, death 8 (o violão cai em cordas rebentando, ele cai de joelhos).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Serenata `serenata` | inala com **círculo no chão** 400 ms | 0,3x (≈3) | raio 80 px em volta | **atordoa** 1,0 s (adormece: fica sem agir, vulnerável); recarga 9 s, peso 2 |
| Acorde `strum` | braço alto sobre as cordas, 170 ms | 0,8x (≈8) | 40 px frente | empurra 14 px; recarga 2,4 s, peso 3 |
| Quebra o violão `smash` | ergue com as duas mãos, 260 ms | 1,3x (≈13) | 34 px | **só de perto**; depois fica **sem violão** (sem serenata/acorde) por 4 s; recarga 12 s, peso 1 |

**Comportamento tático:** parado ou andando devagar, mantém 80-120 px e solta serenata; quando o alvo encosta, acorde; se for acuado (poucos px), quebra o violão. Em grupo, o seresteiro puxa o foco enquanto outros zumbis atacam o squad atordoado.

**Fraqueza / contra-jogo:** a serenata tem **aviso claro** (círculo e inalação de 400 ms): **sair do círculo ou interromper com dano** (estagger ao tomar 25% da vida em 0,4 s) cancela. Concentrado no canto: **de costas ele não vira rápido** (giro de 0,5 s). Sem violão (depois do `smash`) fica 4 s só com socos (0,5x).

**Status propostos:** `hp 85 · dmg 10 · xp 10 · drop pano 25%` · raro.

**Regras (propostas)**
- `IA-55` **Seresteiro, serenata:** círculo de aviso (400 ms); quem estiver dentro fica atordoado 1,0 s (comum; 1,5 s enluarado); interromper com golpe forte durante o aviso cancela; recarga 9 s; atordoamento não se acumula (imune por 3 s).
- `IA-56` **Seresteiro, violão:** `strum` empurra 14 px; `smash` só a menos de 34 px; depois do `smash` fica 4 s sem violão (só soco 0,5x).
- `IA-57` **Seresteiro, palco:** quando há 2 seresteiros na onda só um canta por vez (revezamento de 3 s) para evitar atordoamento permanente.

**Referências a buscar (≈100 imagens, spec `specs/seresteiro.json`, pasta `zumbis-lapa/seresteiro`)**
1. Seresteiro tocando violão (14) · 2. Violão clássico: corpo, cordas, boca (14) · 3. Paletó, chapéu e gravata borboleta, boêmio (12) · 4. Choro e seresta no Rio antigo (12) · 5. Serenata sob a janela, sacada e lampião (10) · 6. Lapa boêmia e Arcos (16) · 7. Poses: tocar, curvar, golpear com o violão (10) · 8. Microfone antigo e cantor de rádio (12).

---

# 7. Zumbi Garçom · `garcom` · Lapa (RJ)

**Onde aparece:** Lapa boêmia, Santa Teresa, Largo dos Guimarães, Mirante, Selarón, Circo (comum nos botecos; mais comum na boemia). Só na Lapa.

**Conceito e lugar:** Boteco carioca: garçom de colete e avental longo, bandeja equilibrada na mão. O zumbi **serve a morte**: arremessa copos em leque e desvia **girando** com a bandeja (esquiva por giro de bandeja). Mundo da Lapa, ao lado do Malandro e do Seresteiro, mas é o "servidor que desvia": exige tempo certo.

**Aparência**
- Silhueta: **vertical e magro**, tronco reto, **bandeja redonda erguida** acima do ombro (disco), avental longo até a canela, guardanapo no ombro; passos curtos e em ponta de pé.
- Figurino: camisa branca de manga comprida (arregaçada, manchada), colete preto de botões, **avental longo branco** amarrado na cintura, gravata borboleta, calça preta, sapato preto engraxado, guardanapo no ombro, bloco de pedidos no bolso.
- Materiais: algodão branco, lã/poliéster do colete, couro do sapato (brilho), metal da bandeja (cromado amassado), vidro dos copos (brilho + transparência), pele cinza-esverdeada.
- Paleta: camisa `#efe8d8`/sombra `#a89cb8`; colete `#2a2630`/`#4a4258`; avental `#f6f0e0`/`#c8bca0`; gravata `#8a2a3a`; bandeja `#c8ccd0`/`#6a7078`; copos `#cfe8f0` com cerveja `#e8b020`, espuma `#fff2cc`; sapato `#1c1218`; pele `#8a9a82`; sangue `#7a1020`.
- Adereços: bandeja, 5 copos de chope/americano em cima, garrafa na outra mão, guardanapo, abridor de garrafa no cinto.
- Corrupção: olhos de lua, cerveja virou sangue/ácido, copos rachados, bandeja que gira sozinha, rasgo no peito mostrando costelas.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | branco encardido, cerveja âmbar | leque de 3 copos |
| Enluarado | colete lilás, cerveja ciano, copos rachados brilhando | 1,3x vida; leque 4 copos |
| Plenilunar | avental ensanguentado, copos em brasa, olhos laranja | 1,6x vida, 1,5x dano; leque 5 copos |

**Tamanho:** ~130 px; `ax 80 · G 150 · top 116 · w 16` (provisório).

**Animações:** idle 8 (equilibra a bandeja, olha o relógio de pulso, balança a cabeça), walk 8 (passos curtos e ágeis, bandeja nivelada), alert 6 (gira a bandeja com um dedo e faz reverência torta), `fan` 9 (**leque de copos**: antecipação gira o corpo e arma a bandeja 260 ms, lança 3 copos em fan, recuperação com bandeja vazia), `spin` 8 (**giro de desvio** com bandeja: roda o corpo, escapa de golpe de frente), `slam` 8 (bandejada: golpe plano com a bandeja de lado), hurt 4 + hurtB, fall 5, getup 5, death 8 (derrubado, a bandeja gira no chão e os copos quebram).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Leque de copos `fan` | arma a bandeja com **cone no chão**, 260 ms | 0,5x por copo (≈6), até 3 acertos | 40-110 px | copos em leque (±18°); quebra e deixa cacos (0,15x por 0,5 s, 3 s, pequenas); recarga 5 s, peso 3 |
| Bandejada `slam` | recua a bandeja, 180 ms | 0,9x (≈12) | 34 px | empurra 12 px; recarga 1,8 s, peso 3 |
| Giro de desvio `spin` | gira com a bandeja, 200 ms | 0 (defesa) | em volta | **esquiva** de golpe de frente (25% comum; 30% enluarado; 35% plenilunar; laser metade) e contra-ataque de `slam`; recarga 3 s |

**Comportamento tático:** mantém 60-110 px e dispara leques; de perto prefere bandejada e giro. É o zumbi "servidor": combina bem com Malandro e Seresteiro (os que desviam/atordoam), e o leque força o squad a abrir a formação.

**Fraqueza / contra-jogo:** o leque tem **aviso de cone**; depois de lançar fica **sem copos por 1,3 s** (idle com a bandeja vazia, não gira nem ataca): janela de +30% de dano. O giro só funciona **de frente** e com recarga; de costas, leva dano pleno. Quebrar a bandeja (4 acertos na bandeja) remove o giro.

**Status propostos:** `hp 80 · dmg 13 · xp 10 · drop sucata 30%` · incomum.

**Regras (propostas)**
- `IA-58` **Garçom, leque de copos:** cone de aviso (260 ms); 3 copos (4 enluarado, 5 plenilunar) em ±18°, 0,5x cada; os cacos duram 3 s (0,15x a cada 0,5 s); recarga 5 s.
- `IA-59` **Garçom, giro de desvio:** golpe de frente tem chance de ser esquivado (25/30/35%; laser metade) com contra-ataque de bandejada; recarga 3 s; por trás nunca esquiva.
- `IA-60` **Garçom, bandeja vazia:** depois do leque fica 1,3 s sem copos (sem giro nem ataque), +30% de dano; a bandeja quebra após 4 acertos de frente (sem giro).

**Referências a buscar (≈100 imagens, spec `specs/garcom.json`, pasta `zumbis-lapa/garcom`)**
1. Garçom com bandeja (14) · 2. Uniforme: colete, camisa branca, avental longo (12) · 3. Bandeja, copos e garrafas (12) · 4. Guardanapo no ombro, abridor e bloco de pedidos (8) · 5. Boteco carioca: balcão, mesas e azulejo (16) · 6. Petiscos, chope e cozinha de bar (10) · 7. Poses: girar, desviar, equilibrar bandeja (14) · 8. Lapa à noite: ruas, bares e Arcos (14).

---

# 8. Zumbi Grafiteiro · `grafiteiro` · Lapa (RJ)

**Onde aparece:** Lavradio, Selarón, Circo, Lapa boêmia, Santa Teresa, Mirante, Guimarães (rara no Lavradio; mais comum na boemia, Selarón e Santa Teresa). Só na Lapa.

**Conceito e lugar:** O Rio é capital do grafite (Lapa, Santa Teresa, escadarias, viadutos). O grafiteiro é **artista de rua** de moletom, máscara e lata de spray. A Lua de Sangue o fez pintar com o que sobra: **nuvem de spray que cega** e **marca no chão que atrai zumbis**. Respeito: grafite é arte; o zumbi é um artista consumido, sem mensagens políticas/ofensivas, **sem nomes reais, assinaturas reais ou marcas de tinta**; as "tags" são glifos inventados. Diferenciado: é **controlador de zona** (cega, atrai), de pouco corpo a corpo.

**Aparência**
- Silhueta: **encapuzado**, ombros caídos, braço erguido com a lata (cone de spray), mochila de latas nas costas; pernas finas com tênis grandes; **máscara respiratória** cobrindo nariz/boca.
- Figurino: moletom com capuz (manchas de cor), boné aba reta, máscara semi-facial com filtros, luvas de pano sujas de tinta, calça larga de sarja, tênis gastos sujos de tinta, mochila com latas penduradas e bandana no pescoço.
- Materiais: algodão grosso, borracha da máscara, metal das latas (cromado e coloridas), tinta (respingos, pingos escorridos), pele pálida.
- Paleta: moletom `#3a3a4a`/`#1c1c28`, respingos `#e8402e`, `#f2c230`, `#2fd8c8`, `#c83ae0`; boné `#2a2630`; máscara `#4a5258` com filtros `#c8a82a`; latas `#d8d8e0` + tampas coloridas; calça `#5a5a68`; tênis `#e8e8e8` sujos; pele `#8a9a82`; sangue `#7a1020`.
- Adereços: lata de spray (arma), mochila de latas, esponja, marcador, **glifo luminoso** que ele desenha no chão (símbolo inventado, olho de lua estilizado).
- Corrupção: olhos de lua brilhando por cima da máscara, tinta saindo como sangue colorido, a lata pulsando, veias de tinta nos braços.

**Formas**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | moletom cinza, respingos de cor vivos | nuvem 1,2 s de cegueira |
| Enluarado | moletom lilás, tinta ciano-neon, glifo azul | 1,3x vida; nuvem 1,5 s; glifo atrai a 180 px |
| Plenilunar | moletom vermelho-vinho, tinta laranja-vermelha ardente, olhos laranja | 1,6x vida, 1,5x dano; nuvem maior e glifo duplo |

**Tamanho:** ~126 px (com capuz); `ax 80 · G 150 · top 112 · w 16` (provisório).

**Animações:** idle 8 (chacoalha a lata, olha para os lados, balança o pé), walk 8 (passo arrastado, ombros caídos, mochila chacoalha), alert 6 (puxa a máscara e **acena a lata**), `cloud` 9 (**nuvem de spray**: antecipação agita a lata e aponta 280 ms, borrifa 4 quadros com cone de tinta, recuperação), `tag` 9 (**marca no chão**: agacha e desenha o glifo com spray 5 quadros, levanta), `hit` 8 (golpe de lata: giro de lata com a lata como porrete), hurt 4 + hurtB, fall 5, getup 5, death 8 (a lata explode em tinta, ele cai de joelhos, mancha colorida no chão).

**Golpes**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga, peso |
|---|---|---|---|---|
| Nuvem de spray `cloud` | agita e aponta, **cone no chão** 280 ms | 0,2x (≈2) | cone de 70 px | **cega** 1,2 s (a tela embaça/mira ruim); a nuvem fica 2 s no ar; recarga 6,5 s, peso 3 |
| Marca no chão `tag` | agacha com glifo desenhado, 600 ms (vulnerável) | 0 | 20-70 px do próprio pé | glifo de raio 36 px dura 8 s: **zumbis a 160 px mudam de alvo para o glifo** (atração) e quem pisa tem -20% de velocidade; recarga 10 s, peso 2 |
| Golpe de lata `hit` | gira a lata, 160 ms | 0,9x (≈8) | 30 px | empurra 8 px; recarga 1,8 s, peso 3 |

**Comportamento tático:** ágil e fugidio; solta nuvem a média distância, dá o fora e usa o glifo para reunir zumbis num ponto (a atração é sobre outros zumbis, e **não** sobre o squad). Em grupo, o squad precisa quebrar o glifo ou matar o grafiteiro rápido.

**Fraqueza / contra-jogo:** a **nuvem tem aviso de cone**; o squad pode atravessar a nuvem sem atordoar se estiver **fora do cone** ou de costas (a cegueira só funciona de frente). **Pintar o glifo leva 0,6 s ajoelhado: +50% de dano nessa janela**. **Acertar o glifo** (qualquer golpe de área no chão) o apaga. Frágil (75 hp). Fica sem lata por 5 s se for atingido durante a nuvem (derruba a lata).

**Status propostos:** `hp 75 · dmg 9 · xp 10 · drop sucata 25%` · raro.

**Regras (propostas)**
- `IA-61` **Grafiteiro, nuvem de spray:** cone de aviso (280 ms); quem estiver no cone olhando de frente fica cego 1,2 s (-50% de chance de acertar, borda embaçada); nuvem 2 s; recarga 6,5 s; não acumula (imune 2 s).
- `IA-62` **Grafiteiro, glifo:** desenha 0,6 s agachado (+50% de dano) e cria glifo (raio 36 px, 8 s) que atrai zumbis a 160 px (máx. 1 glifo por grafiteiro); golpe de área ou 3 acertos o apagam.
- `IA-63` **Grafiteiro, lata:** acerto durante a nuvem derruba a lata; fica 5 s só com golpe de lata (0,6x) e sem `cloud`/`tag`.

**Referências a buscar (≈100 imagens, spec `specs/grafiteiro.json`, pasta `zumbis-lapa/grafiteiro`)**
1. Grafiteiro pintando com spray (14) · 2. Latas de spray, bicos e tampas (12) · 3. Máscara respiratória, capuz e luvas (10) · 4. Roupa: moletom, boné, mochila de latas (10) · 5. Grafite carioca: murais, tags e pichação (16) · 6. Nuvem de tinta, respingos e pingos (10) · 7. Poses: braço erguido, agachado, correndo (14) · 8. Muros, tapumes e viadutos da Lapa (14).

---

## Diversidade de mecânica (checagem do conjunto)

| id | Papel | Mecânica-chave | Contra-jogo |
|---|---|---|---|
| frevista | elusivo/defensivo | rebate projétil, zigue-zague | por trás, beam, janela pós-tesoura |
| baiana | zona | poça que queima | reabastecimento, por trás do tabuleiro |
| turista | controle | flash que ofusca, foge | frágil, pose parada, cone |
| peixeiro | duelista | arremesso e piso escorregadio | faixa, pós-arremesso |
| acaizeiro | tanque lento | rasteira longa, poça lenta | costas protegidas, quebrar paneiro |
| seresteiro | controle de área | serenata atordoa | interromper, quebrar violão |
| garcom | servidor esquivo | leque de copos, giro | cone, bandeja vazia |
| grafiteiro | zona/invocação | nuvem cega, glifo atrai | cone, glifo apagável |

Notas de continuidade: a baiana e o turista dividem o Pelourinho com Estalador/Percussionista; o peixeiro e o açaizeiro dividem o Ver-o-Peso com Barqueiro (poças de lodo) e Blindado. Os três da Lapa convivem com o Malandro (todos "desviam/atordoam"); o balanceamento de `data/balance.ts` limita a no máximo 1 seresteiro + 1 grafiteiro por onda, para o atordoamento/cegueira não se acumularem.


## Códigos no mecanicas2

As faixas desta ficha (IA-40 a IA-63) foram renumeradas ao entrar no `mecanicas2.html`, sem colisão com amazônia e pantanal (ordem: esta ficha, depois amazônia, depois pantanal). Seção `m-zumbis-atuais-novos`; âncoras `z-<id>`.

| Código na ficha | Código no mecanicas2 | Regra |
|---|---|---|
| IA-40 | IA-35 | Frevista, sombrinha defensiva |
| IA-41 | IA-36 | Frevista, passo em zigue-zague |
| IA-42 | IA-37 | Frevista, tesoura e ajeito |
| IA-43 | IA-38 | Baiana, panela de dendê |
| IA-44 | IA-39 | Baiana, tabuleiro |
| IA-45 | IA-40 | Baiana, reabastecimento |
| IA-46 | IA-41 | Turista, flash |
| IA-47 | IA-42 | Turista, foge e fotografa |
| IA-48 | IA-43 | Turista, clarão atrai |
| IA-49 | IA-44 | Peixeiro, arremesso e piso escorregadio |
| IA-50 | IA-45 | Peixeiro, facão em sequência |
| IA-51 | IA-46 | Peixeiro, isopor aberto |
| IA-52 | IA-47 | Açaizeiro, rasteira do paneiro |
| IA-53 | IA-48 | Açaizeiro, poça roxa |
| IA-54 | IA-49 | Açaizeiro, paneiro |
| IA-55 | IA-50 | Seresteiro, serenata |
| IA-56 | IA-51 | Seresteiro, violão |
| IA-57 | IA-52 | Seresteiro, palco |
| IA-58 | IA-53 | Garçom, leque de copos |
| IA-59 | IA-54 | Garçom, giro de desvio |
| IA-60 | IA-55 | Garçom, bandeja vazia |
| IA-61 | IA-56 | Grafiteiro, nuvem de spray |
| IA-62 | IA-57 | Grafiteiro, glifo |
| IA-63 | IA-58 | Grafiteiro, lata |
