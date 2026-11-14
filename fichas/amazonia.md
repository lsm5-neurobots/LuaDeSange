# Floresta Amazônica (Manaus → floresta) — ficha do mapa e dos 6 zumbis novos

Mapa `amazonia` · 6º mapa · nível recomendado **22** · requer vencer a **Lapa** · 12 áreas · 12 tipos de zumbi (6 novos + 6 reaproveitados do ROSTER) · mini boss **A Onça-Pintada** · chefe **A Cobra-Grande**.
Fonte do elenco: `fichas/ROSTER.md`. Direção de arte: Marvel Cosmic Invasion (`jogo/ART_DIRECTION.md`), designs 100% nossos e brasileiros.
Códigos propostos (reserva, ajustar ao colar no `mecanicas2.html`): **MAP-34–39** (mapa), **IA-35–50** (4 comuns), **BOSS-33–38** (onça e cobra-grande).

**Respeito (MAP-08/MAP-31):** a Cobra-Grande/Boiúna é lenda ribeirinha de rio, tratada como monstro folclórico; nada de rito, entidade ou figura religiosa; sem etnia, sem pessoas reais, sem marcas. Comunidade ribeirinha, Teatro Amazonas e Mercado são cenário. O boto cor-de-rosa só aparece como fauna do rio (e como cenário da lenda), nunca como personagem humano.

---

## 1. Estudo dos animais predominantes

Base para as versões zumbi. Medidas reais; cores em hex são a rampa média do animal vivo (o zumbi desloca para verde-acinzentado, roxo e carne exposta, ver fichas).

### 1.1 Onça-pintada (*Panthera onca*) — base do mini boss `onca`
- **Tamanho:** corpo 1,1–1,85 m + cauda 45–75 cm; altura no ombro 70–80 cm; 35–158 kg (média da Amazônia 60–90 kg). Maior felino das Américas, terceiro do mundo.
- **Anatomia:** cabeça larga e redonda, mandíbula e músculos masseteres enormes (a mordida mais forte dos felinos em relação ao tamanho: perfura casco de tartaruga e crânio de caimão); caninos de 4–5 cm; pescoço grosso; ombros altos e musculosos; patas dianteiras grossas com garras retráteis de ~5 cm; patas curtas e robustas (corpo baixo e compacto, diferente da elegância da suçuarana); cauda relativamente curta.
- **Pelagem:** fundo ocre-dourado `#d9a441` (sombra `#a9741f`, luz `#f0c46a`), ventre/peito/garganta creme `#f1e6cf`, **rosetas** (anéis irregulares com 1–2 pintas no centro) em marrom-escuro `#3a2414` quase preto `#1b120b`; manchas sólidas na cabeça, pescoço e pernas; listras na cauda. Olhos âmbar `#c9a227`, pupila redonda, nariz rosa-escuro `#8a4a3c`, orelhas curtas e redondas com mancha branca atrás. Variante melânica (pantera-negra) com rosetas visíveis em contra-luz.
- **Movimento:** passo felpudo, cabeça baixa, ombros rolando; trote curto; corrida breve (até ~80 km/h em tiros curtos); **nada muito bem** e caça na água; sobe em árvores.
- **Caça:** predador de emboscada solitário. Espreita agachada com a barriga rente ao chão, ataca por trás/de lado em bote de 5–10 m; mata com **mordida na nuca/crânio** (única entre os felinos), arrasta a presa para a água ou o mato. Noturna/crepuscular.

### 1.2 Sucuri-verde (*Eunectes murinus*) — base do chefe `cobragrande`
- **Tamanho:** comum 4–6 m, adultas fêmeas até 7–8 m (relatos maiores sem confirmação); 100–250 kg; a cobra mais pesada do mundo; corpo grosso como coxa humana (30+ cm de diâmetro). Fêmeas bem maiores que machos.
- **Anatomia:** cabeça relativamente pequena e achatada, mais larga que o pescoço; **olhos e narinas no alto da cabeça** (respira e vigia com o corpo submerso); língua bífida preta; mandíbulas elásticas (quadrado articulado) que desencaixam; dentes recurvados em 4 fileiras (prendem, não rasgam); sem veneno; corpo muscular cilíndrico, cauda curta e afilada; ventre largo com escamas ventrais.
- **Escamas/cores:** dorso verde-oliva `#5b6b2e` (sombra `#2f3a18`, luz `#8a9a45`), **grandes manchas ovais negras** `#1d2410` em duas fileiras, com laterais com manchas amarelo-creme `#d9c27a` anel-preto; faixa escura atrás do olho; ventre amarelo-sujo `#cfc28a`. Escamas lisas e úmidas, brilho oleoso.
- **Movimento:** em terra rasteja pesada (ondulação lateral e rectilínea); **na água é rápida e silenciosa**, quase só o topo da cabeça visível.
- **Caça:** emboscada submersa à beira d'água; **bote** + abocanha + **constrição** (enrola 2–3 voltas, aperta a cada expiração da presa, bloqueando o fluxo de sangue); engole inteira capivara, caimão, veado; digere por semanas.

### 1.3 Jacaré-açu (*Melanosuchus niger*) — reuso na arena (silhueta no rio) e no estudo de rio
- **Tamanho:** 4–5 m (até ~6 m), 300–500 kg, maior predador da Amazônia.
- **Anatomia:** focinho largo e robusto, osso do crânio pesado, placas ósseas (osteodermas) no dorso, cauda comprimida lateralmente e poderosa, olhos no alto com pálpebra nictitante; filhotes com faixas amarelas.
- **Cores:** quase preto `#1d1f1a` (sombra `#0e1110`, luz `#3b4036`), garganta e mandíbula amarelo-pálido `#b8b07a`; olhos refletem **vermelho** à lanterna `#d8392a`. Escamas fendidas em fileiras.
- **Movimento/caça:** desliza silencioso; emboscada em margem; "rolo da morte"; rabada lateral. Noturno.

### 1.4 Boto-cor-de-rosa (*Inia geoffrensis*) — fauna de rio / cenário da lenda
- **Tamanho:** 1,8–2,5 m, 100–185 kg (maior golfinho de rio). Pescoço flexível (vértebras cervicais não fundidas), rostro longo e fino com cerdas sensoriais, **melão frontal** abaulado que muda de forma, nadadeira dorsal baixa em crista, peitorais largas e rotativas.
- **Cor:** rosa-salmão `#e7a9a3` (mais rosado nos machos velhos e com cicatrizes), dorso cinza-azulado `#8d9aa0`, ventre rosa-claro `#f3cdc6`, olhos pequenos escuros.
- **Movimento:** nada lento, vira em círculo fechado entre troncos do igapó, emerge só o rostro e o melão; sopro audível. Caça peixes (inclui piranhas) em águas turvas por ecolocalização.

### 1.5 Piranha-vermelha (*Pygocentrus nattereri*) — base do `piranha`
- **Tamanho:** 20–30 cm, até 3 kg. Corpo alto e comprimido (disco), cabeça grande e robusta.
- **Anatomia:** **mandíbula inferior proeminente** (prognata) com dentes **triangulares, afiados e interligados** (cortam em tesoura, bocados de 1–2 cm), olhos grandes dourado-avermelhados, nadadeira adiposa pequena, nadadeira anal longa, cauda truncada.
- **Cores:** dorso cinza-ardósia `#5b6b6a`, flancos prateados com **pintas** escuras `#b9c1c4`, ventre e peito vermelho-alaranjado `#d4503a`, nadadeiras com borda escura, íris `#e0b13c`.
- **Comportamento:** caça em cardume de 20–100; sentem sangue e vibração; frenesi só em fome/pressão (seca, carcaça); reputação de "devoradora" exagerada, mas dolorosa.

### 1.6 Harpia (*Harpia harpyja*) — fauna de dossel/cenário (voo alto) e referência de garra
- **Tamanho:** 86–107 cm, envergadura 1,8–2,0 m, 4–9 kg. **Garras traseiras de 10–13 cm** (maiores que garra de urso-pardo). Tarsos grossos como pulso humano.
- **Cores:** dorso cinza-ardósia `#4a525a`, peito com faixa negra `#1d1f22`, ventre branco `#eeeae0`, cabeça cinza-claro `#9ea3a6` com **dupla crista** de penas eretas (leque), olhos cinza-claro, bico preto curvo, pernas amarelas `#e0c25a`.
- **Caça:** emboscada no dossel; captura preguiças e macacos (bugios!) em voo rápido por entre galhos.

### 1.7 Bugio / guariba-vermelho (*Alouatta seniculus*) — base do `bugio`
- **Tamanho:** corpo 45–72 cm, cauda 50–70 cm (preênsil), 4–9 kg; machos maiores e mais barbados.
- **Anatomia:** **osso hioide dilatado** (caixa de ressonância) sob uma barba/papo; mandíbula larga e rosto escuro quase sem pelo (preto `#2a1e18`), testa estreita; cauda preênsil com ponta nua, **mãos e pés muito fortes de agarrar**; ombros e braços compridos.
- **Pelagem:** ruivo-vermelho `#9a3b1e` (sombra `#5e2412`, luz `#c4682c`), mais clara `#e89850` nas costas e nos ombros; rosto preto.
- **Movimento:** lento, deliberado; anda de quatro por galhos, pendura-se pela cauda, salto curto entre árvores próximas; folívoro.
- **Comportamento:** **urro** audível a 3–5 km, ao amanhecer e ao entardecer, para marcar território; vive em bandos de 5–9.

### 1.8 Poraquê (*Electrophorus electricus / voltai*) — fauna de igarapé / objeto de cenário
- **Tamanho:** até 2,5 m, 20 kg. Corpo de enguia (é um peixe-faca): cilíndrico, cabeça achatada, boca larga sem escamas; nadadeira anal longa que ondula como fita.
- **Cores:** dorso marrom-oliva `#4a3d28`, ventre laranja `#d9852b`, pele lisa e viscosa com manchas pálidas na cabeça.
- **Caça:** órgãos elétricos (~80% do corpo) dão descargas de 600–860 V; atordoa peixes e inclusive cavalos; respira ar na superfície a cada 10 min.

### 1.9 Ariranha (*Pteronura brasiliensis*) — fauna de rio (reaparece no Pantanal)
- **Tamanho:** 1,5–1,8 m, 22–32 kg, maior mustelídeo do mundo. Corpo comprido, cauda achatada em remo ("cauda de leme"), patas **totalmente palmadas** com garras.
- **Cores:** marrom-chocolate `#4a3322` (molhada `#2c1e14`), mancha **creme-branca** única na garganta `#e9dcc0` (identifica cada indivíduo), bigodes.
- **Comportamento:** grupos de 8–20; guinchos e assobios altos; caçam peixes e atacam jacarés juntas.

### 1.10 Macaco-prego (*Sapajus apella*) — fauna de dossel (cenário e pequena animação ambiente)
- **Tamanho:** 35–48 cm + cauda 40–49 cm, 3–4 kg. **Capuz** de pelos escuros no topo da cabeça formando um "tufo"; cauda semipreênsil.
- **Cores:** capuz e membros marrom-escuro `#3a2a1c`, corpo bege-dourado `#c7a46e`, rosto rosado com contorno claro.
- **Comportamento:** muito inteligente: quebra castanha com pedra (uso de ferramenta), rouba comida em grupo.

### 1.11 Arara-vermelha (*Ara macao*) e arara-canindé (*Ara ararauna*) — fauna de dossel / sinal visual
- **Tamanho:** 80–90 cm, envergadura 1 m, 1–1,5 kg. Cauda longa; bico enorme e curvo capaz de quebrar coco; face nua branca com linhas finas de penas.
- **Cores (vermelha):** vermelho `#d62d20`, amarelo `#f2c230` (ombros), azul `#2255c4` (asa e cauda), bico branco-creme `#efe2c4` com ponta preta. **Canindé:** azul `#2f74c9` e amarelo `#f2c230`, face branca.
- **Comportamento:** voa em casal ou bando gritando alto (o grito de aviso na floresta); ao pôr do sol cruza o rio.

---

## 2. Mapa: Floresta Amazônica

### 2.1 Visão geral
**O que é:** do porto flutuante de Manaus ao interior da floresta pelo igarapé e pela terra firme, passando pela samaúma gigante, pelo seringal abandonado e pelo garimpo, até a floresta alagada (igapó) e a várzea onde a Cobra-Grande espera. A cidade (porto, Mercado Adolpho Lisboa, Teatro Amazonas, Encontro das Águas, palafitas) é a "rua" do mapa, e a mata engole tudo da área 6 em diante: o squad troca asfalto e ferro por raiz, lama e água.

**Nível recomendado 22 · requer: lapa · 12 áreas · mini boss na samaúma (A Onça-Pintada), chefe na várzea (A Cobra-Grande) · Meta de dias: ~3 (curva de `data/balance.ts`).**

**Ids das áreas** (o cenário `ART_EXP.AMAZONIA` usa os mesmos): `porto, adolpho, teatro, encontro, ribeirinha, igarape, terrafirme, samauma, seringal, garimpo, igapo, varzea`.

**Identidade visual (paleta e materiais, rampas de 5–6 tons com hue shift para roxo na sombra):**
- Água do Rio Negro (escura, chá-preto): `#1f1a14` → `#3a2e22` → `#5a4630`, reflexos `#8aa0a8`. Água do Solimões (barrenta): `#a78a5c` → `#c4a874`. No Encontro, as duas **correm lado a lado sem se misturar** (linha de separação nítida).
- Verde da floresta: copa `#2f5a2a` / `#3f7a35` / luz `#8ab84a`; sub-bosque `#1b3a22` / `#0f2418`; folhas de palmeira `#4d8a3c`; musgo `#5a7a2e`.
- Madeira de palafita e barco regional: casco azul `#2a5aa8`, branco `#e8e2d2`, amarelo `#f0c23a`, vermelho `#c8382a`, madeira clara `#c9a06a`, madeira velha `#6e5238`.
- Teatro Amazonas: cúpula com **telhas esmaltadas verdes, amarelas e azuis** (bandeira do Brasil em mosaico) `#2e9a4a/#f2c230/#2a52b0`, paredes rosa-ocre `#d89a8a`, colunas brancas, cornija creme.
- Mercado Adolpho Lisboa: estrutura de ferro **Art Nouveau** importada (verde-musgo `#3a5a48`), vitrais, telhado de zinco cinza-azul `#8a9aa0`.
- Seringueira: casca lisa cinza-claro `#9a9484` com cortes em espinha e látex branco `#f2efe4`; borracha defumada marrom-preto `#2a1a10`.
- Garimpo: lama laranja-ocre `#b4642c` / `#8a4a22`, poça espelhada de mercúrio `#c8d0d6`, lona preta `#16161a`.
- Samaúma: tronco cinza-claro `#a8a090` com espinhos cônicos, **sapopemas** (raízes tabulares) altas como paredes.
- **Cor mística da Lua de Sangue:** água do rio vira vinho `#6a1424`; nevoeiro baixo laranja-rosado; vagalumes viram brasas vermelhas; a lua grande atrás da copa; musgo e fungos da floresta brilham em verde-ácido `#a6f03a` (fungos) e ciano `#7af4ff` nas formas enluaradas.
- Sem marcas, sem placas legíveis (MAP-09): letreiros viram formas de letras ilegíveis.

### 2.2 Luz nos 5 modos (aplicado a todas as áreas; exceções por área abaixo)

| Modo | Céu | Luz e cor | Efeitos / emissivos |
|---|---|---|---|
| **Manhã** | azul-claro `#8ec4d8` com faixas de neblina branca-rosada, sol baixo atrás da copa | luz dourada rasante `#ffe0a0` do lado esquerdo, sombras longas verde-azuladas `#1e3a3a`, **raios de luz** (god rays) através da copa | névoa baixa no rio, orvalho brilhando, arara e vapor subindo da água; emissivos apagados |
| **Tarde** | azul saturado `#5ab0d8` com cúmulos grandes brancos, bolsões de céu cinza de chuva | luz branca-amarela alta `#fff2cc`, sombras curtas roxo-verde `#2c3a40`, verde bem saturado | chuva rápida opcional (gotas, folhas balançando), formigas e pássaros; emissivos apagados |
| **Anoitecer** | gradiente laranja `#f08a3a` → rosa `#d85a7a` → roxo `#4a2a66`, silhueta da copa recortada | luz alaranjada rasante do lado direito, rim light rosa, sombras roxas `#3b2c63` | reflexo do pôr do sol no rio como faixa de fogo, morcegos, primeiros vagalumes, lamparinas das palafitas acendem |
| **Noite** | azul-fundo `#0c1428` com estrelas e via láctea rala, lua branca-azulada | luz de lua fria `#a8c8f0` em contra-luz, sombras quase pretas `#0a1020`, rim azul-ciano | vagalumes, fungos bioluminescentes verdes, lamparinas amarelas `#ffc858` nas palafitas, holofotes do Teatro, olhos de animais refletindo, sapos e grilos |
| **Lua de Sangue** | vermelho `#7a1a22` → `#2a0a18`, lua enorme e baixa `#ff5a4a` atrás da copa, nuvens roxas | tinta vermelha em tudo, sombras roxo-vinho `#2a0a24`, rim vermelho-laranja | rio vinho com cintilação, névoa rosada, vagalumes-brasa, fungos pulsando verde-ácido, neon do Mercado e lamparinas tremulando; luzes emissivas de dia apagam |

### 2.3 Áreas (12)

Estrutura de cada área: **marco real · camadas (céu / fundo / meio / chão / primeiro plano) · luz específica · vasculhar e baús · loot · ondas · arena**. As ondas usam os 12 tipos: novos `seringueiro, garimpeiro, bugio, piranha, onca, cobragrande` + reaproveitados `errante, corredor, cuspidor, rastejante, saltador, barqueiro`.

**Regra das áreas 1–12:** 1ª onda é comum; a 2ª onda é a "arena" (zumbis em maior número, travando a porta de saída). Mini boss na 2ª onda da `samauma`; chefe numa onda só na `varzea`.

#### 1. `porto` — Porto de Manaus (balsas e palafitas)
- **Marco real:** o **Roadway**/porto flutuante de Manaus (cais metálico que sobe e desce com o rio, até 12 m de variação), barcos regionais de dois andares (casco de madeira azul/branco com rede no convés) e palafitas ao longe.
- **Céu:** faixa estreita de céu com nuvem de chuva; guindastes e fios. **Fundo:** skyline baixo de Manaus (prédios de concreto, torre do Rio Negro Palace, cúpula do Teatro ao longe), fumaça de óleo. **Meio:** barcos atracados lado a lado, escada metálica do Roadway, cordas de amarra, caixas de isopor e sacas empilhadas. **Chão:** passarela de madeira e ferro corrugado com poças de água escura, parafusos e trilhos de carrinho. **Primeiro plano:** cordas, boias, redes penduradas, gaiola de galinha, caixa de peixe.
- **Luz:** reflexo laranja da cidade na água preta à noite; de dia água barrenta marrom (Solimões) no cais.
- **Vasculhar (6):** caixa de isopor (peixe, gelo, comida), saca de farinha (comida), carrinho de carga (sucata), rede de dormir pendurada (pano, corda), motor de popa (peças, gasolina), caixote de madeira (madeira). **Baús:** baú de convés (peças/remédio), 1 por área.
- **Ondas:** 1ª `errante, errante, corredor, rastejante, errante` · 2ª `barqueiro, errante, corredor, cuspidor, barqueiro` (os barqueiros dominam o cais).
- **Arena:** `arenaPos` meio do cais (0.5).

#### 2. `adolpho` — Mercado Municipal Adolpho Lisboa
- **Marco real:** mercado de 1883, inspirado no Les Halles de Paris, estrutura de **ferro Art Nouveau**, quatro torres de vitral colorido, banca de peixes (tambaqui, pirarucu, jaraqui), castanhas, farinhas, ervas, guaraná em corda, tucupi, pimenta-de-cheiro, camarão seco.
- **Céu:** telhado de zinco com clarabóias. **Fundo:** vitrais coloridos e arcos de ferro verde, fumaça de grelha. **Meio:** bancas de madeira com toldo, balanças de prato, pirarucu pendurado em gancho, cestos de castanha. **Chão:** piso de ladrilho hidráulico e poça de água de gelo e escama de peixe. **Primeiro plano:** caixotes, paneiros, cuias, cabeças de peixe.
- **Luz:** vitrais projetam cores no chão (azul, âmbar, verde); na Lua de Sangue as luzes de neon das bancas tremulam em vermelho.
- **Vasculhar (7):** banca de peixe (peixe, comida), balança de feira (sucata, peças), cesto de castanha (comida), paneiro de açaí (açaí, comida), caixa de ervas/guaraná (ervas, remédio), freezer quebrado (peças, bateria), saca de farinha. **Baús:** baú de balcão (peças, remédio).
- **Ondas:** 1ª `errante, seringueiro, corredor, cuspidor, errante` · 2ª `seringueiro, errante, cuspidor, corredor, saltador`.

#### 3. `teatro` — Teatro Amazonas
- **Marco real:** **Teatro Amazonas** (1896), cúpula revestida de 36 mil telhas esmaltadas em verde, amarelo e azul, colunas, fachada rosa-ocre, Largo de São Sebastião com piso em **ondas preto e branco** (Encontro das Águas em calçada portuguesa). Lido como **cenário/mirante, nunca arena dentro do templo** (MAP-31).
- **Céu:** praça aberta com a cúpula dominando. **Fundo:** cúpula e fachada com holofotes. **Meio:** escadaria, colunas, postes de ferro, coreto/bancos. **Chão:** calçadão de ondas preto/branco com rachaduras e raízes (a floresta invade). **Primeiro plano:** vasos, poste, carrinho de pipoca, bancos.
- **Luz:** à noite os holofotes iluminam a cúpula de baixo (como os Arcos da Lapa); Lua de Sangue: a cúpula brilha vinho com telhas refletindo.
- **Vasculhar (6):** banco quebrado (madeira), carrinho de pipoca (comida), poste caído (sucata), vaso de planta (ervas), cesto de lixo (pano), caixa de som (peças, bateria). **Baús:** baú de bilheteria (peças, fragmento lunar raro).
- **Ondas:** 1ª `errante, corredor, saltador, cuspidor, errante` · 2ª `seringueiro, corredor, garimpeiro, errante, saltador, cuspidor` (primeiros garimpeiros: "vieram do interior").

#### 4. `encontro` — Encontro das Águas (barco)
- **Marco real:** confluência do Rio Negro (preto) com o Solimões (barrento), 6 km de linhas paralelas sem se misturar (temperaturas e densidades diferentes), visto de **balsa/barco regional**; botos aparecem ao lado.
- **Céu:** céu enorme, nuvens baixas. **Fundo:** margem verde baixa e linha de prédios distante. **Meio:** convés de balsa, grade de ferro, corrimão, botes de apoio, rede de pescador. **Chão:** convés de madeira e chapa com poças; **faixa de água escura/barrenta** visível atrás da grade. **Primeiro plano:** cordas, boias, caixas de isca.
- **Luz:** pôr do sol rasante sobre a faixa de água; Lua de Sangue: linha entre as duas águas vira fio vermelho.
- **Vasculhar (6):** caixa de isca (peixe), boia (sucata), rede de pesca (corda, peixe), motor de barco (peças, gasolina), caixa de ferramentas (peças), tambor de combustível (gasolina). **Baús:** baú do capitão (munição/remédio).
- **Ondas:** 1ª `barqueiro, errante, barqueiro, corredor, cuspidor` · 2ª `barqueiro, saltador, errante, barqueiro, corredor, cuspidor` (barqueiros são maioria).
- **Obs.:** o **Boto-Cor-de-Rosa** é fauna do cenário (silhueta rosa emergindo no fundo, animação ambiente), nunca inimigo.

#### 5. `ribeirinha` — Comunidade ribeirinha (palafitas)
- **Marco real:** conjunto de **casas de palafita** e **casas flutuantes** de madeira com telhado de zinco/palha, passarelas de tábua entre as casas, canoas e **rabetas** (barco de motor de rabeta), redes, roça de mandioca e varal.
- **Céu:** nuvens e palmeiras. **Fundo:** fileira de palafitas sobre a água, palmeiras de açaí e buriti. **Meio:** passarelas de madeira, casa principal, canoa atracada, tanques de peixe. **Chão:** tábuas com frestas (água por baixo), lama nas bordas. **Primeiro plano:** cestos, panela de ferro, lamparina, cachorro (silhueta), rede.
- **Luz:** à noite lamparinas e lâmpadas amarelas `#ffc858` nas janelas; Lua de Sangue: cada janela vira brasa vermelha.
- **Vasculhar (7):** canoa de madeira (madeira, remo), rede de dormir (pano), paneiro (açaí, comida), panela de ferro (sucata), tanque de peixe (peixe, comida), motor de rabeta (peças, gasolina), caixa de remédio caseiro (remédio, ervas). **Baús:** baú de madeira da casa (comida, pano).
- **Ondas:** 1ª `errante, corredor, rastejante, cuspidor, errante` · 2ª `barqueiro, seringueiro, corredor, errante, saltador, cuspidor`.

#### 6. `igarape` — Igarapé
- **Marco real:** igarapé de água preta e rasa, margem de lama, tronco caído servindo de ponte, folhas de vitória-régia nas curvas, árvores de ingá, cipós.
- **Céu:** faixas de luz por entre a copa. **Fundo:** paredão verde fechado, troncos finos e cipós. **Meio:** ponte de tronco, margem de lama, raízes expostas, pedra coberta de musgo. **Chão:** lama com poças e água rasa (onde entram as **piranhas**), folhas mortas. **Primeiro plano:** samambaias, folhas de bananeira, galhos.
- **Luz:** luz verde-filtrada, raios de luz pontuais; poças refletem o céu; à noite vagalumes e olhos de jacaré-tinga (pontos vermelhos).
- **Vasculhar (6):** tronco oco (madeira, comida), cesto de pesca (peixe, corda), ninho de formiga (comida), planta medicinal (ervas, antídoto), armadilha de peixe (peixe, sucata), mochila abandonada (pano, comida). **Baús:** baú enterrado na lama (peças).
- **Ondas:** 1ª `rastejante, errante, piranha, corredor, errante` · 2ª `piranha, piranha, seringueiro, saltador, cuspidor, errante` (estreia do **Cardume de Piranhas**: poças ativas).

#### 7. `terrafirme` — Floresta de terra firme
- **Marco real:** mata alta, sub-bosque escuro, chão de serapilheira, palmeiras de patauá e bacaba, cipós, troncos retos de 40 m (castanheira, angelim).
- **Céu:** quase invisível; recortes de luz. **Fundo:** muralha de troncos em perspectiva. **Meio:** árvores com cipós, ninhos de cupim, buracos de tatu. **Chão:** serapilheira marrom, raízes, cogumelos. **Primeiro plano:** folhas gigantes, heliconia, fungos.
- **Luz:** feixes pontuais; à noite quase escuro com olhos e fungos verdes.
- **Vasculhar (6):** tronco oco (madeira), colmeia de abelha-sem-ferrão (comida, mel), castanheira (castanha, comida), cipó-d'água (água), pedaço de equipamento da trilha (sucata, peças), mochila (pano, munição). **Baús:** baú de pesquisador (peças, remédio).
- **Ondas:** 1ª `bugio, bugio, errante, corredor, cuspidor` · 2ª `bugio, bugio, seringueiro, saltador, rastejante, errante` (estreia do **Bugio**: urro e salto das árvores).

#### 8. `samauma` — Samaúma gigante (arena do mini boss)
- **Marco real:** a samaúma (*Ceiba pentandra*), árvore de 50–70 m, copa que passa a floresta, **sapopemas** (raízes tabulares) como paredes de 5 m, tronco com espinhos.
- **Céu:** copa fechada; luz coada. **Fundo:** o tronco da samaúma subindo para fora da tela, cipós e ninhos de arara. **Meio:** sapopemas formando "baias" onde a onça se esconde. **Chão:** clareira de terra com folhas e ossos antigos. **Primeiro plano:** raízes e fetos.
- **Luz:** feixe único de luz no centro da clareira; sombra densa nos cantos; a Lua de Sangue pinta o feixe de vermelho.
- **Vasculhar (5):** ninho de arara (penas, comida), ossada (sucata, peças), saco de piquenique da expedição (comida, pano), baú de oferta/cesto (peças), oca da samaúma (ervas). **Baús:** baú de equipe científica (remédio, munição).
- **Ondas:** 1ª `bugio, seringueiro, corredor, saltador, errante` · **2ª: mini boss** `onca` + `bugio, bugio` (`onda(['onca','bugio'], 'bugio', 'bugio')` com substituto). **Arena:** meio-direita (0.5, 0.85).

#### 9. `seringal` — Seringal abandonado
- **Marco real:** seringal do ciclo da borracha: **estradas de seringa** ligando seringueiras, **barracão** de madeira com varanda e telhado de palha, defumador (cone de barro com fogo), bolas de borracha empilhadas, canoas.
- **Céu:** copa irregular e clareira de luz. **Fundo:** alinhamento de seringueiras com cortes em espinha e tigelas. **Meio:** barracão de madeira cinza, defumador fumegando, pilhas de bolas de borracha preta. **Chão:** terra batida com poças de látex branco coagulando. **Primeiro plano:** baldes, tigelas, facas cravadas nos troncos.
- **Luz:** neblina de fumaça de defumador; lamparinas amarelas no barracão; látex reflete a luz.
- **Vasculhar (7):** bola de borracha (látex, sucata), balde de látex (látex), tigela de sangria (látex), defumador (peças, sucata), barracão-despensa (comida, pano), caixa de ferramentas (peças), lamparina (querosene/gasolina). **Baús:** baú do patrão (peças, fragmento lunar raro).
- **Ondas:** 1ª `seringueiro, seringueiro, errante, corredor, cuspidor` · 2ª `seringueiro, seringueiro, saltador, bugio, rastejante, errante` (os seringueiros dominam).

#### 10. `garimpo` — Garimpo (clareira lamacenta)
- **Marco real:** garimpo ilegal: **clareira devastada** de lama laranja, cava profunda, **escada de madeira**, balsa/draga no igarapé, lona preta, barracos e cano de sucção; poças de mercúrio.
- **Céu:** céu aberto (sem copa), fumaça do gerador. **Fundo:** paredão de mata cortada, tocos e árvores caídas. **Meio:** cava escalonada com escadas, barracos de lona, draga e cano. **Chão:** lama laranja-ocre molhada, pegadas, rachaduras. **Primeiro plano:** tonéis, bateias, pás.
- **Luz:** de dia céu aberto e brilho da lama; poças de mercúrio refletem o céu com cor prateada; noite com lanternas e geradores.
- **Vasculhar (6):** bateia (sucata, ouro-sucata), tonel de combustível (gasolina), gerador (peças, bateria), barraco de lona (comida, pano), pá/picareta (sucata), cano de sucção (peças). **Baús:** baú do capataz (peças, fragmento lunar).
- **Ondas:** 1ª `garimpeiro, garimpeiro, errante, corredor, cuspidor` · 2ª `garimpeiro, garimpeiro, seringueiro, saltador, rastejante, cuspidor` (os garimpeiros dominam; poças de mercúrio ativas).

#### 11. `igapo` — Igapó (floresta alagada)
- **Marco real:** floresta de **água preta alagada** (Anavilhanas/Rio Negro): troncos emergindo da água, copa recortada, água espelhada, galhos, pontes de tronco.
- **Céu:** faixa de céu refletida. **Fundo:** colunas de troncos e cipós, névoa. **Meio:** passarelas de troncos, raízes, ninhos, canoa encalhada. **Chão:** água rasa (20–40 cm) espelhada com folhas boiando e pontes de tronco; **piranhas** e peixes. **Primeiro plano:** galhos, folhas de vitória-régia, bóias.
- **Luz:** espelhamento duplicado; à noite lua refletida e vagalumes sobre a água; Lua de Sangue: reflexo vermelho como um segundo céu.
- **Vasculhar (6):** canoa encalhada (madeira, remo), ninho (comida), galho com cipó (corda), tartaruga-da-amazônia morta (comida), rede de pesca (peixe, corda), mochila (pano, munição). **Baús:** baú preso nas raízes (peças, remédio).
- **Ondas:** 1ª `piranha, piranha, barqueiro, errante, saltador` · 2ª `piranha, piranha, seringueiro, garimpeiro, bugio, cuspidor, rastejante`.

#### 12. `varzea` — Arena do chefe na várzea
- **Marco real:** **várzea** do Solimões: planície inundada, água barrenta e lamacenta, aguapé (jacinto) boiando, árvores de embaúba e açacu, palafitas distantes; a Cobra-Grande mora num poço fundo de remanso.
- **Céu:** céu aberto vermelho/laranja/azul conforme o modo. **Fundo:** horizonte plano de mata baixa e rio. **Meio:** ilhas de capim flutuante, troncos secos, uma **palafita em ruínas**. **Chão:** **lamaçal raso com poça de água central** (onde a cobra mergulha) e margens de capim; tábuas de passarela. **Primeiro plano:** aguapés, bolhas.
- **Luz:** Lua de Sangue forte aqui (o "olho de lua" da cobra reflete na água); à noite luar branco e nevoeiro.
- **Vasculhar:** nenhum (`semVasculhar: ['varzea']`). **Arena:** `arenaPos: { samauma: [0.5, 0.85], varzea: [0.8] }`.
- **Ondas:** 1 só: `cobragrande` (substituto `ascensorista`/`maquinista` enquanto não existe).

### 2.4 Loot regional
```
loot: {
  porArena: { madeira: 2.4, sucata: 2.2, pano: 1.2, comida: 2.4, agua: 1.4, pecas: 1.0, gasolina: 0.9, castanha: 0.8, latex: 0.7 },
  vitoria:  { madeira: 28, sucata: 18, pecas: 12, fragmento_lunar: 6, gasolina: 3, comida: 6, castanha: 4, latex: 6 },
  miniBoss: { pecas: 7, sucata: 14, remedio: 3, comida: 3, fragmento_lunar: 1, latex: 3 },
  projeto: 0.2,
}
```
- **Castanha-do-pará e açaí:** comida que cura (mesmo padrão do açaí do Ver-o-Peso). **Látex (borracha):** recurso novo proposto (se ainda não existir, entra como `pano`/`sucata` extra, como o biscoito da Lapa). Peixe e erva medicinal viram cura.
- **Objetos novos de vasculhar** (`art-src/objects/obj.js`): paneiro, banca de peixe, bola de borracha, tigela de sangria, bateia, tonel de combustível, canoa, colmeia, rede de pesca, motor de rabeta, ninho de arara.

### 2.5 Ondas totais (resumo)
Novos: `seringueiro` (mercado em diante), `garimpeiro` (teatro em diante), `bugio` (terra firme em diante), `piranha` (igarapé, igapó). Reaproveitados: `errante, corredor, cuspidor, rastejante, saltador, barqueiro`. Mini boss `onca` e chefe `cobragrande`. **12 tipos** no total, cobrindo o "9–12" do ROSTER.

### 2.6 Regras propostas (MAP-34 a MAP-39)
- **MAP-34** Floresta Amazônica: 12 áreas, nível 22, requer lapa; mini boss na samaúma, chefe na várzea.
- **MAP-35** Paleta: água preta e barrenta, verde-copa, madeira de barco azul/amarela, telhas do Teatro; Lua de Sangue: rio vinho e fungos verde-ácido.
- **MAP-36** Luz: 5 modos conforme a tabela; raios de luz de manhã, fungos e vagalumes à noite.
- **MAP-37** Loot regional: castanha, açaí, látex; objetos novos.
- **MAP-38** Ondas: 12 tipos; piranhas só em área com água; garimpeiro/seringueiro em dupla.
- **MAP-39** Respeito: lenda da Cobra-Grande como monstro folclórico, sem religião, etnia ou pessoas reais; Teatro Amazonas e Mercado são cenário.

### 2.7 Referências a buscar (mapa) — `referencias/amazonia/` (spec `referencias/_tools/specs/amazonia.json`)
1. **Porto de Manaus e flutuantes** (8)
2. **Mercado Municipal Adolpho Lisboa** (8)
3. **Teatro Amazonas** (9)
4. **Encontro das Aguas** (9)
5. **Palafitas e comunidade ribeirinha** (9)
6. **Igarape** (7)
7. **Floresta de terra firme (sub-bosque)** (9)
8. **Samauma e sapopemas** (8)
9. **Seringal e seringueira** (7)
10. **Garimpo e clareira lamacenta** (7)
11. **Igapo e floresta alagada** (8)
12. **Ceu, luz e clima amazonico** (7)
13. **Barcos, canoas e utensilios** (6)
14. **Fauna de cenario (aves, borboletas, fungos)** (4)

---

## 3. Fichas dos zumbis novos

**Medidas e status.** Comparativo (nível 18): Malandro hp 95 dmg 14 xp 9; Passista (mini) hp 3400 dmg 28 xp 130; Maquinista (chefe) hp 6600 dmg 38 xp 380. Nível 22 sobe cerca de 10–20%: comuns hp 70–130, mini ~4200, chefe ~7800. Medidas (`ax, G, top, w`) são cruas, ajustar quando o stub for criado.

**Convenções:** vida e dano base de cada forma: `enluarado` 1,3× vida e 1,15× dano; `plenilunar` 1,6× vida e 1,5× dano (chefes: `normal` / `furia` abaixo de 50% de vida, golpes ×1,3 e recargas menores). Status do jogo: **PRESO** (não anda), **LENTO**, **ATORDOADO**, **OFUSCADO**, **VENENO**, **SANGRAMENTO**, **CHOQUE**, **DERRUBADO**, **QUEIMANDO**. O motor tem `tickMoves/pickMove/startMove` (`ai/moves.ts`): cada golpe vira `ZMove` com aviso/dano/alcance/recarga.

---

### 3.1 Zumbi Seringueiro — `seringueiro` — IA-35–38 · comum humano (variante local)

**Conceito:** Trabalhador do ciclo da borracha que a Lua pegou no meio da sangria. Anda pela "estrada de seringa" com o balde de látex e o facão; a lamparina presa à testa ainda acesa guia seus olhos mortos. Controla o espaço com **jato de látex** que gruda (PRESO) e poça que deixa o squad lento, e finaliza com facão. Figura de ofício, sem rito ou religião; sem pessoa real (MAP-08).

**Aparência (briefing de arte):** ~130 px na tela, magro e nodoso, ombros caídos, pescoço esticado para a frente, andar curvado e pesado, **lamparina de querosene presa na testa por tira de couro** (chama amarela tremendo), chapéu de palha-de-aba-larga murcho e furado, camisa de algodão cru de **manga comprida rasgada** (suor e látex endurecido no peito), calça arregaçada e remendada com corda de embira, pés descalços ou alpercata roída, cinto de corda com **facão de sangria** (lâmina curta curva `#b8c0c4` manchada de ferrugem) e **balde de latão preso à cintura** (látex branco `#f2efe4` escorrendo pela borda), uma bolota de borracha enrolada no ombro. Rosto: pele cinza-esverdeada `#a9b4a0`, olhos fundos com brilho âmbar, barba rala, boca aberta com látex seco grudado em fios, veias roxas. **Corrupção da Lua:** raízes finas e fungos brotam das costas e do braço do facão (ele "sangra" látex como a seringueira), pele com **cortes em espinha** como no tronco (anatomia real de sangria).

**Paleta (6 tons por material):** pele `#a9b4a0` · camisa `#cdbd98` · calça `#6e6048` · látex `#f2efe4` · borracha defumada `#2a1a10` · chama `#ffc858` · ferro `#8c9498` · barro `#6e5238` · rim `#c8d8f0`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Comum | sempre | camisa clara de algodão, látex branco, chama amarela | hp 110 · dmg 16 |
| Enluarado | Lua de Sangue | camisa lilás-azulada, látex azul-ciano `#7af4ff` brilhando, cortes em espinha luminosos | 1,3× vida |
| Plenilunar | Lua de Sangue | camisa encharcada de sangue, látex vermelho `#ff5a3a`, raízes grandes nas costas, chama laranja `#ff8a3a` | 1,6× vida, 1,5× dano; jato de látex 2 círculos |

**Tamanho:** comum ~130 px (porte comum, `top` ~120, `w` 16, `ax` 80, `G` 150).

**Animações (ficha de arte):**
| Anim | Quadros | Eventos / notas |
|---|---|---|
| idle | 8 | respira, a chama oscila, o balde balança |
| walk | 8 | andar curvado de peso, arrasta os pés |
| alert | 7 | levanta a cabeça, a chama arde forte, "sente" o alvo |
| attack (talho) | 9 | antecipação: facão alto (150 ms) · dano nos quadros 3 e 6 (2 cortes diagonais) · recuperação 2 q. |
| throw (jato de látex) | 10 | desengata o balde, **antecipação** puxa para trás, lança em arco (toss no q. 5), balde voa e volta |
| bucket (balde na cara) | 7 | revés com o balde |
| refill (encher/abre) | 8 | abaixa, pega a tigela do chão; fica ABERTO |
| hurt · hurtB · fall · getup · death | 4·4·6·6·8 | morte: cai de joelhos com o balde derramando látex; chapéu rola |
| tumble · grabbed | 4·4 | padrão ZREACT |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Talho de sangria (attack) | facão alto 150 ms | 2 cortes ≈1,0× (≈16) | 36 px | Cortes diagonais; segundo corte avança 8 px. Recarga 1,6 s. |
| Jato de látex (throw) | puxa o balde para trás 500 ms; círculo marcado no alvo | 0,4× (≈6) + **PRESO 1,5 s** | alvo a 70–150 px; círculo r 28 | Deixa **poça de látex 4 s** (LENTO 40%); enluarado: 1,3× área; plenilunar: 2 círculos. Recarga 7 s; depois "SEM BALDE" até `refill`. |
| Balde na cara (bucket) | braço atrás 200 ms | 0,7× (≈11) + **ATORDOADO 0,4 s** | 30 px | Empurra 14 px; recarga 3 s. |

**Passivos:** de **noite/Lua** a lamparina o faz ver o alvo a 300 px (de dia 230 px). Alvo PRESO leva ×1,25 do próximo golpe dele ("gruda").
**IA tática:** vaga até ver o alvo; de longe (70–150 px) usa o jato em quem está isolado; de perto, talho ou balde; tende a ficar atrás da horda. Evita ficar na própria poça.
**Fraqueza:** depois do jato fica **SEM BALDE 4 s** (sem jato; `refill` 1,2 s ABERTO, dano ×1,5). **Fogo** queima o látex: poça em chamas dá ×1,5 e QUEIMANDO. Bater nas costas ignora a postura.
**Onde aparece:** Mercado Adolpho Lisboa em diante; 25% das ondas no seringal.
**Status:** hp 110 · dmg 16 · xp 10 · drop `latex: 0.35` (pano 0.2) · ax 80 · G 150 · top 122 · w 16.

**Referências a buscar** — `referencias/zumbis-amazonia/seringueiro/` (spec `seringueiro.json`):
1. **Seringueiro historico (fotos de epoca)** (12)
2. **Faca de sangria e tigela** (8)
3. **Latex escorrendo e coagulado** (10)
4. **Defumacao da borracha (pelle)** (6)
5. **Lamparina de cabeca e iluminacao** (8)
6. **Chapeu de palha e roupa de seringueiro** (10)
7. **Alpercata, bota e pes descalcos** (5)
8. **Estrada de seringa e barracao** (8)
9. **Tronco de seringueira (cortes em espinha)** (8)
10. **Balde, lata e coleta** (6)
11. **Anatomia: magro, desnutrido, pele doente** (6)
12. **Corrupcao: fungo, musgo, podridao** (6)
13. **Postura e movimento (caminhar na mata)** (5)

---

### 3.2 Zumbi Garimpeiro — `garimpeiro` — IA-39–42 · comum humano (variante local)

**Conceito:** Garimpeiro que ficou na cava quando a Lua nasceu. Barro até o pescoço, bateia e picareta nas mãos, o mercúrio da lavagem lhe deixou a pele prateada nas veias. É o "cavador": **picaretada** pesada, **lama de mercúrio** que envenena e **cava e surge embaixo do squad**. Figura de ofício; sem pessoa real; sem crítica de grupo social (MAP-08).

**Aparência (briefing de arte):** ~130 px, mais largo e musculoso que o Seringueiro, ombros pesados, braços grossos de carregar balde e pá, postura inclinada para a frente. Tronco coberto de **crosta de lama laranja-ocre `#b4642c`** (rachada) sobre pele cinza-esverdeada, camiseta regata rasgada ou torso nu, bermuda surrada de brim e **botas de borracha** cheias de barro, **picareta** de cabo de madeira curvo e ferro enferrujado, **bateia** de metal (cone raso, prato `#9aa4a8`) na cintura com lama prateada dentro, capacete de obra amassado ou chapéu de palha, saco de pano com "ouro" (pepitas amarelas `#f2c230`) pendurado no ombro. Rosto: barba empastada de barro, olhos brancos fundos, veias **prateadas de mercúrio** `#c8d0d6` descendo no pescoço e nos braços, dentes marrons, língua cinza. **Corrupção da Lua:** raízes brotam das costelas, **pepitas de ouro encravadas na pele** brilhando, poças de mercúrio nas pegadas.

**Paleta:** pele `#a8aea0` · lama `#b4642c` `#8a4a22` · regata `#8a8a74` · brim `#4a5a6a` · mercúrio `#c8d0d6` · ouro `#f2c230` · ferro `#6c7478` · borracha `#2a2a2e` · rim `#c8d8f0`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Comum | sempre | lama laranja, mercúrio prata | hp 135 · dmg 17 |
| Enluarado | Lua de Sangue | barro cinza-lilás, mercúrio ciano `#7af4ff` pulsando nas veias, pepitas frias | 1,3× vida |
| Plenilunar | Lua de Sangue | lama vermelho-queimado, ouro incandescente `#ffb43a`, raízes de osso | 1,6× vida, 1,5× dano; `cava` com 2 saídas |

**Tamanho:** comum ~135 px (`top` 124, `w` 20, `ax` 82, `G` 152).

**Animações:**
| Anim | Quadros | Notas |
|---|---|---|
| idle | 8 | balança o peso, bateia pingando mercúrio |
| walk | 8 | passos de bota de lama, ombros pesados |
| alert | 7 | levanta a picareta e a cabeça, estala o pescoço |
| attack (picaretada) | 10 | antecipação: pica alta nas costas (200 ms) · impacto q. 5 (poeira + rachadura) · recuperação |
| throw (lama de mercúrio) | 9 | gira a bateia na mão e lança o conteúdo (q. 4) |
| dig (cava) | 10 | agacha, mergulha a picareta e some na terra (q. 6); 4 q. de terra se movendo |
| emerge (surge) | 8 | explode de baixo, picareta no alto; fica preso até se soltar (ABERTO) |
| hurt · hurtB · fall · getup · death | 4·4·6·6·8 | morte: lama escorre, cai de bruços na poça |
| tumble · grabbed | 4·4 | ZREACT |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Picaretada (attack) | pica nas costas 200 ms | 1,2× (≈20) | 40 px | Rachadura no chão (10 px); empurra 14 px. Recarga 2 s. |
| Lama de mercúrio (throw) | gira a bateia 350 ms; círculo no alvo | 0,3× (≈5) + **VENENO 3 s** | alvo a 60–130 px; círculo r 30 | Deixa **poça de mercúrio 5 s** (VENENO por tick e ofusca 0,3 s). Recarga 8 s. |
| Cava e surge (dig/emerge) | terra se mexendo no chão 0,7 s | 1,0× (≈17) + **DERRUBADO** | círculo r 30 no lutador mais perto | Some 1,2 s (invulnerável), aparece sob o alvo (aviso: tremor no chão) e depois fica ABERTO 1,2 s. Recarga 9 s. |

**IA tática:** pica de perto; joga lama em quem está distante; cava quando o squad está agrupado. Tende a escolher o alvo mais distante dos aliados.
**Fraqueza:** ao emergir fica **ABERTO 1,2 s** (dano ×1,5). A "marca de terra" mostra para onde vai: sair do círculo anula. Golpe de fogo/ácido derrete a crosta (armadura de lama: −10% dano recebido até levar 2 acertos).
**Onde aparece:** Teatro Amazonas em diante; 30% no garimpo.
**Status:** hp 135 · dmg 17 · xp 10 · drop `sucata: 0.35` (ouro-sucata 0.1) · ax 82 · G 152 · top 124 · w 20.

**Referências a buscar** — `referencias/zumbis-amazonia/garimpeiro/` (spec `garimpeiro.json`):
1. **Garimpeiro (fotos de epoca e atuais)** (12)
2. **Bateia e lavagem de ouro** (10)
3. **Picareta, pa e ferramentas de cava** (8)
4. **Lama, barro e cava (clareira)** (10)
5. **Mercurio (poca prateada)** (8)
6. **Dragas e balsas de garimpo** (8)
7. **Roupa e botas: bermuda, camiseta, chapeu** (10)
8. **Pepitas, ouro e fio de ouro** (4)
9. **Barraco, lona e acampamento** (6)
10. **Escavacao: tuneis e buracos** (6)
11. **Anatomia: torso, bracos musculosos, esqueleto** (6)
12. **Corrupcao: barro, raizes, fungos** (6)
13. **Movimento: cavar e emergir** (6)

---

### 3.3 Bugio Zumbi — `bugio` — IA-43–46 · comum animal

**Conceito:** Guariba-vermelho que a Lua deixou com o urro roto e a fome desmedida. Vive no alto das árvores do cenário e **chama o bando** com o urro; salta na cabeça do squad e arremessa frutos podres. É o "chamador": sozinho é frágil, com o bando é perigoso. Animal real (*Alouatta seniculus*), sem etnia nem religião.

**Aparência (briefing de arte):** ~110 px de altura em pé (quando se ergue; ~120 px de comprimento de corpo), quadrúpede semi-ereto, braços longos, ombros altos, **barba e papo** (hioide) inflados e roídos pela corrupção (a pele do pescoço rasga mostrando **laringe** e o osso hioide como uma caixa óssea pulsando), pelagem ruiva `#9a3b1e` desgrenhada com falhas de **pele cinza-esverdeada** e **musgo/fungo** nos ombros, rosto preto `#2a1e18` com olhos brilhantes (âmbar na forma comum), dentes amarelos expostos, **cauda preênsil** longa com a ponta nua (agarra galhos e puxa), mãos fortes de unhas sujas. **Corrupção da Lua:** olhos de lua, costelas aparecendo, veias roxas, fungo `#a6f03a` crescendo na barba.

**Paleta:** pelo `#9a3b1e` `#5e2412` `#c4682c` `#e89850` · rosto `#2a1e18` · pele podre `#a9b4a0` · osso `#d8d0b8` · fungo `#a6f03a` · rim `#c8d8f0`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Comum | sempre | ruivo, olhos âmbar | hp 70 · dmg 13 |
| Enluarado | Lua de Sangue | pelo vinho-azulado, olhos ciano, fungo azul | 1,3× vida; urro chama 3 |
| Plenilunar | Lua de Sangue | pelo carmim, olhos laranja, laringe exposta brilhante | 1,6× vida, 1,5× dano; salto com onda |

**Tamanho:** ~115 px (`top` 112, `w` 20, `ax` 86, `G` 150). Em saltos, sobe até 40 px.

**Animações:**
| Anim | Quadros | Notas |
|---|---|---|
| idle | 8 | pendurado, cauda enrolada, balança |
| walk | 8 | quadrupedal pesado, nós das mãos no chão |
| alert | 7 | levanta o tronco, olhos fixos |
| howl (urro) | 12 | antecipação: respira fundo, papo infla (q. 1–5) · urro (q. 6–10, onda sonora) · recuperação; ÁREA de chamado |
| leap (salto de galho) | 10 | agacha, sobe para fora da tela, **sombra no chão** (0,6 s), cai com as patas (impacto q. 8) |
| throw (fruto/galho) | 8 | pega o fruto do galho, lança em arco (q. 4) |
| claw (arranhão) | 7 | 2 arranhões em x |
| hurt · hurtB · fall · getup · death | 4·4·6·6·8 | morte: cai de galho, cauda ainda agarrando |
| tumble · grabbed | 4·4 | ZREACT |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Urro do bando (howl) | respira e infla o papo 0,8 s; círculo de onda | 0 (ONDA) | r 160 | **Chama 2 Bugios** (3 no enluarado) e **+20% velocidade** nos zumbis próximos por 6 s. **Cancela se levar um golpe** durante o aviso. Recarga 14 s; no máx. 1 por área ativo. |
| Salto de galho (leap) | sombra crescendo no chão 0,6 s | 1,1× (≈14) + **DERRUBADO** | de 90 a 180 px até a sombra | Aterrissa r 24 e agarra 0,3 s; se errar fica ABERTO 0,8 s. Recarga 6 s. |
| Fruto podre (throw) | pega o fruto 0,4 s | 0,7× (≈9) + **OFUSCADO 0,4 s** | 80–200 px, projétil em arco | Fruto estoura e cega; recarga 5 s. |
| Arranhão (claw) | braço atrás 150 ms | 2 × 0,45× (≈6 cada) | 30 px | Recarga 2 s. |

**IA tática:** começa no "alto" (fora do chão) e **desce em salto**; evita ficar em campo aberto; só urra quando há menos de 3 aliados. Fica atrás de ondas de errantes e arremessa. Em grupo, divide o squad.
**Fraqueza:** **durante o urro** (papo inflado) leva ×1,5. Frágil (hp 70): morre rápido. Cauda presa em galho: se cair do salto fica **ABERTO**.
**Onde aparece:** Floresta de terra firme em diante; todos os mapas "verdes" depois.
**Status:** hp 70 · dmg 13 · xp 8 · drop `comida: 0.25` (fruta) · ax 86 · G 150 · top 112 · w 20.

**Referências a buscar** — `referencias/zumbis-amazonia/bugio/` (spec `bugio.json`):
1. **Guariba-vermelho Alouatta seniculus** (12)
2. **Guariba-preto e outras especies** (6)
3. **Urro: boca aberta e garganta** (10)
4. **Rosto, barba e olhos** (8)
5. **Pelagem ruiva (textura)** (6)
6. **Cauda preensil** (8)
7. **Maos e pes (preensao)** (6)
8. **Locomocao: andar nos galhos e salto** (10)
9. **Bando e comportamento social** (6)
10. **Comendo folhas e frutos** (6)
11. **Anatomia: esqueleto de primata e cranio** (8)
12. **Corrupcao: carcaca, fungo, pele exposta** (6)
13. **Habitat: copa e arvores da Amazonia** (6)

---

### 3.4 Cardume de Piranhas — `piranha` — IA-47–50 · comum animal (grupo)

**Conceito:** Piranhas-vermelhas que a Lua fez sobreviver fora da água: cardume de **3 a 5** que "nada" na **lama e na água rasa** em volta do squad, morde rápido, **salta** e fareja sangue. Frágeis, mas em bando fazem **SANGRAMENTO**. Animal real (*Pygocentrus nattereri*), exagerado pela lenda.

**Aparência (briefing de arte):** cada piranha ~40 px de comprimento × 28 de altura (porte pequeno), corpo em disco, **mandíbula inferior saliente** com **dentes triangulares** à mostra, olhos grandes dourado-avermelhados e **sem pálpebra** (corrompidos: olhos de lua no cardume enluarado), flancos prateados `#b9c1c4` com pintas escuras, **ventre vermelho-alaranjado** `#d4503a` com pele **rasgada mostrando espinha/costelas**, nadadeiras em farrapos, escamas faltando com carne exposta e musgo/fungo `#a6f03a` entre as escamas. Dentes salpicados de sangue. O cardume é animado como **uma entidade por peixe** com movimento coordenado (círculo, sobe e desce na água, lama espirrando).

**Paleta:** dorso `#5b6b6a` · prata `#b9c1c4` · ventre `#d4503a` · olho `#e0b13c` · carne `#a02a3a` · osso `#d8d0b8` · lama `#6e5238` · rim `#c8d8f0`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Comum | sempre | prata e vermelho, olhos dourados | cada peixe hp 25 · dmg 7 |
| Enluarado | Lua de Sangue | prata azulada, olhos ciano, ventre roxo, dentes brilhando | 1,3× vida; 5 peixes |
| Plenilunar | Lua de Sangue | vermelho-incandescente, olhos laranja, espinhos de osso nas costas | 1,6× vida, 1,5× dano; salto triplo |

**Tamanho:** ~42×28 px cada (cardume de 3–5; `top` 28, `w` 10, `ax` 30, `G` 30). Só vivem em **zona de água/lama** (poças do igarapé, margem do igapó, canal da várzea).

**Animações:**
| Anim | Quadros | Notas |
|---|---|---|
| idle | 6 | nadam em círculo lento, boca abrindo |
| swim (walk) | 8 | ondulação do corpo, lama espirra |
| alert | 5 | virada brusca, olhos fixos |
| bite (mordida) | 7 | antecipação: recua (2 q.) · dash curto (q. 3) · estalo de dentes (q. 4) · retorna |
| leap (salto) | 9 | sobe para fora da água em arco, mordida no ápice, cai |
| beached (encalhada) | 6 | debate-se de lado, boca abrindo (fora d'água) |
| hurt · fall · death | 3·4·6 | morte: de lado, flutua/derrete em poça de sangue |
| frenzy (frenesi) | 6 | tremem, olhos brilham; velocidade +40% |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Mordida (bite) | recua 250 ms | 0,6× (≈4) + **SANGRAMENTO 3 s** (stack até 3) | dash de 40 px | Mordidas rápidas em sequência. Recarga 1,2 s cada peixe. |
| Salto fora d'água (leap) | sombra no chão 0,5 s | 0,9× (≈6) | arco de 70 px | Sai da água, morde no ápice; **depois fica ENCALHADA 2 s** se cair fora da poça. Recarga 5 s. |
| Frenesi (frenzy) | olhos brilham 0,4 s | — | cardume todo | Se há lutador **sangrando** no alcance, **+40% velocidade e investida dupla**. Dura 4 s; recarga 12 s. |

**IA tática:** só se move **dentro da zona de água/lama** da área; o cardume cerca o alvo mais perto. Fora da água: **ENCALHADA** (debate-se, não ataca).
**Fraqueza:** **fora d'água** ficam encalhadas e indefesas (dano ×2); **ataque em área** (explosão, fogo, faíscas) mata o cardume; frágeis (hp 25 cada).
**Onde aparece:** Igarapé, Igapó, Várzea (poças); reaproveitado no Pantanal.
**Status (cada peixe):** hp 25 · dmg 7 · xp 3 (cardume 3 peixes = 9) · drop `peixe: 0.5` (cada) · ax 30 · G 30 · top 28 · w 10.

**Referências a buscar** — `referencias/zumbis-amazonia/piranha/` (spec `piranha.json`):
1. **Piranha-vermelha Pygocentrus nattereri** (12)
2. **Dentes e mandibula** (12)
3. **Cranio e esqueleto** (6)
4. **Olhos e cabeca (close)** (6)
5. **Escamas e pele (prata e vermelho)** (8)
6. **Nadadeiras e corpo** (6)
7. **Cardume nadando** (10)
8. **Frenesi alimentar** (8)
9. **Pesca de piranha** (8)
10. **Outras piranhas (Serrasalmus, pacu)** (6)
11. **Agua rasa, lama e margem** (6)
12. **Peixes mortos e carcaca** (4)
13. **Corrupcao: peixe podre, fungo em escamas** (4)

---

### 3.5 A Onça-Pintada — `onca` — BOSS-33–35 · mini boss animal

**Conceito:** A caçadora da samaúma. Nada de "luta aberta": ela **some no mato** e reaparece de onde ninguém olha. Anda em círculos entre as sapopemas, **emboscada** com bote longo e aviso, patada em arco e **rugido que atordoa**. Na fúria os olhos viram lua e as rosetas brilham. Animal real (*Panthera onca*); sem referência a pessoas.

**Aparência (briefing de arte):** ~250 px de comprimento (quadrúpede, corpo baixo e musculoso, 160–185 px de altura no ombro quando em pé; ~250 px na pose de bote), cabeça larga e redonda com **mandíbula enorme**, caninos de 12 px salientes e sujos, olhos âmbar `#c9a227` (fúria: **lua branco-vermelha**), **rosetas** marrom-pretas sobre ocre-dourado `#d9a441` com falhas de **pele cinza-esverdeada e carne exposta** nas costelas e no flanco, **musgo e fungo** `#a6f03a` crescendo nos ombros e na cauda, patas dianteiras enormes com garras de ferro-osso `#e8e0c8`, cauda comprida chicoteando. Pelagem desgrenhada com cicatrizes e uma **corrente de cipó** enrolada no pescoço (ela foi caçada). **Corrupção da Lua:** costelas visíveis, espinha de osso no dorso, olhos de lua, vapor saindo da boca.

**Paleta:** ocre `#d9a441` `#a9741f` `#f0c46a` · creme `#f1e6cf` · rosetas `#3a2414` `#1b120b` · olhos `#c9a227` · pele podre `#a9b4a0` · carne `#a02a3a` · osso `#e8e0c8` · fungo `#a6f03a` · rim `#c8d8f0`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Normal | 100 a 50% | ocre, olhos âmbar, rosetas escuras | alterna emboscada, bote, patada, rugido |
| Fúria | abaixo de 50% | pelagem queimada, olhos de lua `#fff0e0`, rosetas incandescentes `#ff6a3a`, espinha de osso nas costas | golpes ×1,3, recargas menores, emboscada dupla, bote duplo |

**Tamanho:** mini boss ~250 px (faixa 230–280): `ax` 190 · `G` 252 · `top` 190 · `w` 36.

**Animações:**
| Anim | Quadros | Notas |
|---|---|---|
| intro (WARNING) | 14 | desce de uma sapopema, rosna, rosetas brilham e ruge para a câmera |
| idle | 8 | respira, cauda balança, olhos fixos |
| walk | 8 | caminhada baixa, ombros rolando, peso nas patas |
| stalk (espreita) | 8 | agachada, barriga rente ao chão, cauda quieta |
| vanish (some) | 8 | funde-se à folhagem (alpha cai, folhas balançam) |
| appear (reaparece) | 8 | surge de uma sombra: olhos primeiro, depois o corpo (antecipação) |
| pounce (bote) | 12 | agacha 4 q. com cauda chicoteando (aviso) · salto q. 5–8 (smear) · aterrissa 9–12 |
| claw (patada) | 9 | 2 patadas em arco: dentro e fora |
| roar (rugido) | 10 | inspira, cabeça atrás, boca aberta, onda de som (smear) |
| maul (mordida na nuca) | 10 | prende o alvo derrubado, sacode a cabeça (follow-up do bote) |
| stuck (atolada) | 8 | patas na terra, debate-se: VULNERÁVEL |
| rage (fúria) | 10 | rosetas incandescem, olhos viram lua, ruge |
| hurt · fall · getup · death | 4·6·6·14 | morte longa: tomba, o musgo cobre o corpo; olhos apagam |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Emboscada (vanish→appear) | olhos brilhando na folhagem 0,9 s e rastro de folhas | segue em **Bote** | reaparece a 60–120 px do alvo mais distante | Some 1,6 s (**invulnerável**); sinal: **pontos de olhos** onde vai aparecer. Recarga 11 s (8 s na fúria; na fúria 2 pontos falsos). |
| Bote longo (pounce) | agacha e chicoteia a cauda 0,8 s | 1,5× (≈48) + **DERRUBADO** | faixa de até 200 px, ±24 px | Se acerta, **segue em mordida na nuca** (maul 1,0×, ≈32, 0,6 s) — escapa com golpe de um aliado. **Se erra, fica ATOLADA 1,8 s** (dano ×1,5). Recarga 6 s. |
| Patada em arco (claw) | braço atrás 250 ms | 2 × 0,9× (≈29) | arco r 60 à frente | Empurra 20 px. Recarga 2 s. |
| Rugido (roar) | inspira 0,6 s; anel de onda | 0,5× (≈16) + **ATORDOADO 1,0 s** | r 120 em volta | Chama **2 Bugios** pelas laterais (1× por fase). Recarga 10 s (8 s na fúria). |

**IA tática:** de longe (>140 px): emboscada ou bote; de perto: patada ou rugido; nunca fica parada. **Esconde-se** quando leva muito dano (fuga para uma sapopema e emboscada). Em **fúria**: emboscada dupla (2 pontos de olhos, só 1 é real), bote duplo (ida e volta), rugido chama 2 bugios de novo.
**Tática do squad:** olhar os pontos de olhos e **ficar em grupo** (a onça ataca o isolado); sair da faixa do bote ao ver a cauda chicotear; bater nela **atolada**; quebrar a mordida na nuca.
**Fraqueza:** **ATOLADA** 1,8 s depois de um bote que erra (×1,5). **Luz forte** (flare, lanterna) interrompe a emboscada (revela). Tem pouca defesa a distância.
**Onde aparece:** Floresta Amazônica, `samauma` (2ª onda). No Pantanal, versão de arena forte (não mini).
**Status:** hp 4200 · dmg 32 · xp 160 · drop `pecas: 3`, pele (`pano` 2) · ax 190 · G 252 · top 190 · w 36.

**Referências a buscar** — `referencias/zumbis-amazonia/onca/` (spec `onca.json`):
1. **Onca-pintada retrato e corpo inteiro** (12)
2. **Rosetas e pelagem (textura)** (8)
3. **Olhos e rosto (close)** (8)
4. **Dentes, mandibula e mordida** (8)
5. **Rugido e pose de ameaca** (8)
6. **Bote e salto (pose de ataque)** (10)
7. **Espreita e emboscada (agachada)** (8)
8. **Patas, garras e musculatura** (8)
9. **Cauda e andar** (6)
10. **Onca na agua e nadando** (6)
11. **Onca melanica (pantera negra)** (4)
12. **Arvore e galho (subir)** (4)
13. **Esqueleto e anatomia** (5)
14. **Corrupcao: carcaca, musgo, pele exposta** (5)

---

### 3.6 A Cobra-Grande — `cobragrande` — BOSS-36–38 · chefe animal/lenda

**Conceito:** A Cobra-Grande (Boiúna) da lenda ribeirinha: sucuri imensa que mora no fundo do remanso da várzea. Quando a Lua nasce, ela sobe. **Constrição** que prende um lutador, **bote**, **cauda varrendo**, **mergulho e ataque por baixo**. Depois do mergulho ou da constrição ela fica **VULNERÁVEL**. Na fúria os olhos viram duas luas. Monstro folclórico de rio, nada de religião ou rito (MAP-39).

**Aparência (briefing de arte):** ~335 px de altura quando ergue o pescoço em S (cabeça a ~290 px do chão); corpo grosso como tronco (**diâmetro ~70 px**), 3 voltas visíveis dentro da água/lama; cabeça **larga e achatada** (50 px) com **olhos e narinas no alto**, língua bífida preta longa, **mandíbula entreaberta com 4 fileiras de dentes** recurvados e fios de baba, corpo com **manchas ovais negras** `#1d2410` sobre verde-oliva `#5b6b2e`, ventre amarelo-sujo `#cfc28a`, **escamas faltando e carne exposta** `#a02a3a` nas laterais, musgo e **fungos** brotando nas costas, **cicatrizes de arpão e cabos de barco** presos, lodo e aguapé pendurados, ossos de peixe na boca. Olhos amarelo-doente `#e8d84a` (fúria: **duas luas** brancas `#fff0e0` com halo vermelho). **Corrupção da Lua:** espinhos de osso saindo da coluna, rachaduras brilhantes, bolhas vermelhas.

**Paleta:** verde-oliva `#5b6b2e` `#2f3a18` `#8a9a45` · manchas `#1d2410` · ventre `#cfc28a` · lodo `#5a4630` · carne `#a02a3a` · dente `#e8e0c8` · olho `#e8d84a` · lua `#fff0e0` · fungo `#a6f03a` · água `#2a1f18`.

**Formas**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Normal | 100 a 50% | verde-oliva, olhos amarelos, manchas escuras | alterna bote, constrição, cauda e mergulho |
| Fúria | abaixo de 50% | pele rachada com brilho vermelho `#ff5a3a`, espinhos de osso, **olhos de lua** | golpes ×1,3, recargas menores, mergulho duplo, **Olhar de Lua** |

**Tamanho:** chefe ~335 px (faixa 280–335): `ax` 262 · `G` 360 · `top` 280 · `w` 70. Comprimento total além do quadro; a parte visível é cabeça+pescoço em S+espiras.

**Animações:**
| Anim | Quadros | Notas |
|---|---|---|
| intro (WARNING) | 16 | emerge do remanso, água em cascata, ergue-se em S, língua, rosna, olhos acendem |
| idle | 8 | pescoço balançando, língua saindo |
| walk (desliza) | 8 | onda lateral do corpo, lama espirrando |
| strike (bote) | 12 | recua a cabeça (aviso 5 q.) · estica o pescoço (smear) · abocanha (q. 8) · recolhe |
| coil (constrição) | 14 | arremessa as espiras e enrola o alvo; aperta, ossos estalando; solta |
| tail (cauda varrendo) | 10 | a cauda sobe da água, varre o chão em arco amplo |
| dive (mergulho) | 10 | afunda, ondas e bolhas seguem o alvo |
| surge (emerge por baixo) | 10 | explode do chão sob o alvo, água/lama voando |
| stuck (presa na lama) | 8 | cabeça enterrada, debate-se: VULNERÁVEL |
| gaze (Olhar de Lua, fúria) | 10 | olhos viram lua e projetam círculos |
| rage | 10 | pele rachando, olhos viram lua, ruge |
| hurt · death | 4·16 | morte longa: contorce, afunda, bolhas vermelhas, os olhos apagam |

**Golpes e regras**
| Golpe (anim) | Aviso até o dano | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Bote (strike) | recua a cabeça em S 0,7 s; faixa marcada | 1,2× (≈50) | faixa de 240 px, ±22 px | Empurra 24 px. Se erra, **cabeça atolada 1,2 s** (VULNERÁVEL). Recarga 4 s (3 s fúria). |
| Constrição (coil) | arremessa a espira, círculo no alvo 0,8 s | 0,2× por tick (≈8) a cada 0,5 s, até 6 ticks | círculo r 34 no lutador mais perto | **PRESO por 3 s** (o lutador não anda; um membro apertado). Os aliados **soltam batendo no corpo** (150 de vida de "aperto"). Se soltar antes: **VULNERÁVEL 1,5 s**. Recarga 9 s (7 s fúria). |
| Cauda varrendo (tail) | cauda sobe 0,8 s; arco marcado | 1,0× (≈42) + **DERRUBADO** | arco amplo r 150 lateral | Empurra 30 px. Recarga 6 s (4,5 s fúria). |
| Mergulho e ataque por baixo (dive+surge) | afunda 0,5 s; **ondas/bolhas seguem o alvo** 1,5 s; círculo marcado onde vai emergir | 1,4× (≈59) + arremesso | círculo r 40 no alvo | **Some 2 s** (invulnerável); emerge sob o alvo; depois **VULNERÁVEL 1,6 s**. Fúria: **2 mergulhos seguidos**. Recarga 12 s (9 s fúria). |
| Olhar de Lua (gaze, **só na fúria**) | olhos viram lua 0,8 s; 3 círculos nos lutadores | 0,6× (≈25) cada + **ATORDOADO 0,8 s** | r 30 por círculo | Recarga 10 s. |

**IA:** molde de `maquinista.ts`/`ascensorista.ts`: de longe, mergulho e Olhar de Lua; de perto, bote e cauda; constrição no mais isolado. Depois de mergulho ou constrição solta, vai a `stuck`.
**Tática do squad:** sair da faixa do bote; quando o aviso do mergulho aparecer, **sair do círculo**; **soltar o aliado preso** batendo no corpo; bater nela **VULNERÁVEL** (×1,5); em fúria, **dispersar** (Olhar de Lua).
**Fraqueza:** janela **VULNERÁVEL** depois de mergulho/constrição solta/bote falho: dano ×1,5. Fogo e eletricidade na água são fortes (a água vira condutor: ×1,2 de CHOQUE).
**Onde aparece:** Floresta Amazônica, `varzea` (arena do chefe, 80% da área). Só aparece na Amazônia.
**Status:** hp 7800 · dmg 42 · xp 460 · drop `fragmento_lunar: 4` · ax 262 · G 360 · top 280 · w 70.

**Referências a buscar** — `referencias/zumbis-amazonia/cobragrande/` (spec `cobragrande.json`):
1. **Sucuri-verde Eunectes murinus (corpo inteiro)** (12)
2. **Cabeca e olhos (close)** (10)
3. **Escamas e manchas (textura)** (8)
4. **Mandibula, dentes e bote** (8)
5. **Constricao (enrolada na presa)** (10)
6. **Corpo enrolado e espiras** (8)
7. **Nadando e submersa** (10)
8. **Esqueleto e vertebras** (6)
9. **Pele de cobra e muda** (4)
10. **Lenda da Cobra-Grande / Boiuna / Cobra Norato** (8)
11. **Boto-cor-de-rosa (cenario da lenda)** (5)
12. **Rio, varzea e agua escura (arena)** (7)
13. **Lua, reflexo e agua noturna** (4)

---

## 4. Regras propostas dos zumbis e chefes

- **IA-35 a IA-38 (Seringueiro):** talho 2 cortes (≈1,0×); jato de látex PRESO 1,5 s + poça LENTA 4 s e "SEM BALDE"; balde atordoa 0,4 s; fogo queima o látex.
- **IA-39 a IA-42 (Garimpeiro):** picaretada 1,2×; lama de mercúrio VENENO 3 s + poça 5 s; cava e surge sob o alvo com aviso, depois ABERTO 1,2 s.
- **IA-43 a IA-46 (Bugio):** urro chama o bando e +20% velocidade (cancela se levar golpe); salto com sombra; fruto podre ofusca 0,4 s.
- **IA-47 a IA-50 (Piranha):** cardume 3–5 só em água; mordida SANGRAMENTO; frenesi com sangue; encalhada fora d'água.
- **BOSS-33 a BOSS-35 (Onça):** emboscada com pontos de olhos; bote com aviso (cauda) e ATOLADA ao errar; rugido ATORDOA e chama bugios; fúria com emboscada dupla.
- **BOSS-36 a BOSS-38 (Cobra-Grande):** bote, constrição PRESO (soltar batendo no corpo), cauda, mergulho e emerge por baixo; VULNERÁVEL depois; fúria: Olhar de Lua e mergulho duplo.
- **Contrato dos chefes:** igual a BOSS-19 (WARNING de 3,2 s "MINI BOSS"/"CHEFE" + nome, intro, golpes por distância, fúria abaixo de 50%, 1 janela de dano, morte animada). A Onça dropa peças; a Cobra-Grande dropa fragmento lunar.

## 5. Arquivos da fase de referências (nada baixado ainda)
Specs prontas (rodar `python referencias/_tools/commons_refs.py referencias/_tools/specs/<nome>.json`): `amazonia.json` (~106 imagens), `seringueiro.json` (~98), `garimpeiro.json` (~100), `bugio.json` (~98), `piranha.json` (~96), `onca.json` (~100), `cobragrande.json` (~100). Pastas finais: `referencias/amazonia/` e `referencias/zumbis-amazonia/<id>/`.


## Códigos no mecanicas2

Faixas finais no `mecanicas2.html` (ordem: zumbis-mapas-atuais IA-35–58, depois esta ficha, depois pantanal). Aqui as regras de zumbi ganharam um código por regra (IA-59 a IA-74); BOSS-33–38 e MAP-34–39 ficam como estavam. Seções `m-zumbis-amazonia`, `m-bosses-amazonia`, `m-mapa-amazonia`.

| Código na ficha | Código no mecanicas2 | Regra |
|---|---|---|
| IA-35 | IA-59 | Seringueiro, regra 1 de 4 |
| IA-36 | IA-60 | Seringueiro, regra 2 de 4 |
| IA-37 | IA-61 | Seringueiro, regra 3 de 4 |
| IA-38 | IA-62 | Seringueiro, regra 4 de 4 |
| IA-39 | IA-63 | Garimpeiro, regra 1 de 4 |
| IA-40 | IA-64 | Garimpeiro, regra 2 de 4 |
| IA-41 | IA-65 | Garimpeiro, regra 3 de 4 |
| IA-42 | IA-66 | Garimpeiro, regra 4 de 4 |
| IA-43 | IA-67 | Bugio, regra 1 de 4 |
| IA-44 | IA-68 | Bugio, regra 2 de 4 |
| IA-45 | IA-69 | Bugio, regra 3 de 4 |
| IA-46 | IA-70 | Bugio, regra 4 de 4 |
| IA-47 | IA-71 | Piranha, regra 1 de 4 |
| IA-48 | IA-72 | Piranha, regra 2 de 4 |
| IA-49 | IA-73 | Piranha, regra 3 de 4 |
| IA-50 | IA-74 | Piranha, regra 4 de 4 |
| BOSS-33 | BOSS-33 | Onça-Pintada, emboscada (inalterado) |
| BOSS-34 | BOSS-34 | Onça-Pintada, bote e atolada (inalterado) |
| BOSS-35 | BOSS-35 | Onça-Pintada, patada, rugido e fúria (inalterado) |
| BOSS-36 | BOSS-36 | Cobra-Grande, padrão, bote e cauda (inalterado) |
| BOSS-37 | BOSS-37 | Cobra-Grande, constrição (inalterado) |
| BOSS-38 | BOSS-38 | Cobra-Grande, mergulho, vulnerável e fúria (inalterado) |
| MAP-34 | MAP-34 | regras do mapa (inalterado) |
| MAP-35 | MAP-35 | regras do mapa (inalterado) |
| MAP-36 | MAP-36 | regras do mapa (inalterado) |
| MAP-37 | MAP-37 | regras do mapa (inalterado) |
| MAP-38 | MAP-38 | regras do mapa (inalterado) |
| MAP-39 | MAP-39 | regras do mapa (inalterado) |
