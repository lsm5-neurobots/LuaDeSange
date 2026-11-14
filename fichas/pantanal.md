# Pantanal (MS/MT) — ficha do mapa, estudo de animais e zumbis novos

Fonte única do elenco: `fichas/ROSTER.md`. Direção de arte: `jogo/ART_DIRECTION.md` (padrão Marvel Cosmic Invasion, 960×540, designs nossos).
Mapa `pantanal` · **nível recomendado 26** · **requer `amazonia`** · 12 áreas · 6 zumbis novos (4 comuns + mini boss + chefe) · 12 tipos nas ondas.
Códigos novos (continuam os de `mecanicas2.html`: último MAP-33, IA-34, BOSS-32): **MAP-34 a MAP-40**, **IA-35 a IA-44**, **BOSS-33 a BOSS-38**.
Tudo é **proposta** até a ficha de arte final; medidas `ax/G/top/w` em unidades cruas (px na tela = u × 1,25) são estimativas a confirmar na folha de sprites.

---

## 1. Estudo dos animais do Pantanal (base das versões zumbi)

Regra de porte no jogo: quadrúpedes e répteis medem-se pela **largura** (comuns ~130 px; mini 230–280 px; chefe 280–335 px a 960×540). Corrupção comum a todos: **olhos de lua** (esfera branco-leitosa com pupila vermelha e brilho), carne exposta em feridas com bordas roxas, musgo/fungo-lunar nas costas, sangue escuro `#4a0f1e`. Enluarado = frio, rachaduras brilhando ciano `#7af4ff`. Plenilunar = quente, brilho laranja `#ffb43a`, espinhos de osso.

| Animal | Real: tamanho e anatomia | Cor (hex) | Movimento e comportamento | Uso no jogo |
|---|---|---|---|---|
| **Jacaré-do-pantanal** (*Caiman yacare*) | 2–3 m (até 3,5 m), 40–100 kg; focinho largo e curto em "U", 70–80 dentes, olhos altos com pupila vertical, narinas no topo do focinho, placas ósseas (osteodermos) em fileiras nas costas, cauda comprimida lateralmente e musculosa (metade do corpo), patas curtas com membrana nos pés traseiros, mancha amarelada na lateral da mandíbula | dorso oliva `#5f6a3a`, sombra `#2f3a22`, barras escuras `#232a18`, flanco amarelado `#a6a064`, ventre creme `#d8cf9c`, olho âmbar `#c9a43a`, boca por dentro `#d98a7a` | anda alto ("high walk") ou desliza de barriga; na água só olhos e narinas à tona; bote de mordida em ~0,1 s, giro de morte (rotação do corpo para arrancar pedaço), rabada para os lados; ficam imóveis em bancos de areia de boca aberta (termorregulação); milhões na região | base do **Rei Jacaré** |
| **Onça-pintada** (*Panthera onca*) | 1,5–2,0 m + cauda 70 cm, 60–120 kg (as do Pantanal são as maiores); cabeça enorme, mordida mais forte dos felinos, patas largas, pescoço de lutador | fundo dourado `#d9a441`, rosetas `#2a1a10`, ventre `#efe6d2`, olho `#d8a93a` | emboscada, nada bem, ataca jacaré e capivara pela nuca; bote curto e explosivo | reaproveitada da Amazônia (`onca`), arena forte |
| **Tuiuiú / jaburu** (*Jabiru mycteria*) | 1,2–1,4 m, envergadura 2,3–2,6 m, 7–8 kg; bico preto reto de 30 cm, pescoço longo, pernas pretas longas; **cabeça e pescoço pretos sem penas, papo vermelho**, corpo branco | branco `#f4f1ea`, sombra `#b8b4c8`, pescoço/cabeça `#1a1a22`, papo `#d8242c`, bico `#222228`, pernas `#2a2a30` | anda lento e solene; voa com pescoço esticado e pernas para trás, plana rasante; pesca tateando com o bico entreaberto; ninhos gigantes de gravetos no alto de árvores, em colônia; **ave-símbolo do Pantanal** | **Tuiuiú Zumbi** |
| **Ariranha** (*Pteronura brasiliensis*) | 1,5–1,8 m, 25–32 kg, a maior lontra do mundo; corpo de torpedo muito musculoso, cauda achatada em remo, pés palmados, focinho curto e largo com bigodes, caninos grandes; **babador branco/creme** na garganta, único de cada animal | pelo molhado `#4a3022`, seco `#6a4a30`, babador `#e8dcc0`, nariz `#1a1210` | grupos de 4–12 (família), muito barulhentas (guinchos, assobios), mergulham, saem da água ereta olhando em volta ("periscópio"), caçam em equipe, agressivas contra intrusos, até jacaré jovem | **Ariranha Zumbi** |
| **Sucuri-amarela** (*Eunectes notaeus*) | 2–4 m, robusta; cabeça estreita com listra escura atrás do olho, olhos e narinas no alto da cabeça, escamas lisas | fundo `#c9b45a`, manchas `#4a3a1a`, ventre `#e0d6a8` | constrição, vive em água rasa e vegetação flutuante, bote de emboscada | cenário (corixo), vasculhar |
| **Piranha** (*Pygocentrus nattereri*) | 20–30 cm; corpo alto e achatado, mandíbula inferior saliente, dentes triangulares cortantes | dorso `#8a96a0`, flanco `#b8c4cc`, ventre vermelho-alaranjado `#d8502a`, olho `#d8c040` | cardumes de dezenas, frenesi com sangue na água | reaproveitada (`piranha`) |
| **Queixada** (*Tayassu pecari*) | 90–110 cm, 25–40 kg; bandos de 50–300; cabeça grande, caninos retos que afiam um no outro, cerdas eriçadas, cauda minúscula, pernas finas; **queixo branco** | pelo `#2a1f1a`, ponta `#5a4a40`, queixo `#e8e0d0`, focinho `#3a2a28` | trota em bando, glândula de almíscar nas costas, estalam os dentes ao ameaçar, atacam em massa e giram sobre o intruso | **Queixada Zumbi** |
| **Cateto** (*Dicotyles tajacu*) | 80–90 cm, 20–25 kg, bando de 5–15; **colar de pelo claro** no pescoço | pelo `#4a443e`, colar `#cfc6aa` | igual à queixada, menos agressivo | variante de pelagem (formas da queixada) |
| **Tamanduá-bandeira** (*Myrmecophaga tridactyla*) | 1,8–2,2 m com a cauda (~0,9 m), 25–40 kg; focinho tubular de 45 cm sem dentes, **língua de 60 cm**, olhos e orelhas pequenos, patas dianteiras com **garra central curva de 10 cm** (anda sobre os nós dos dedos), cauda de pelos longos, **faixa diagonal preta com borda branca** do peito ao ombro | pelo `#7a7468`, faixa `#16120e` borda `#f0ead8`, antebraços `#e8e2d0` com anéis pretos, cauda `#4a443c` | anda curvado e lento; ameaçado **fica de pé nas patas traseiras** apoiado na cauda e abre os braços; o abraço com garras repele até onça; língua entra e sai ~150×/min | **O Tamanduá-Bandeira** (mini boss) |
| **Cervo-do-pantanal** (*Blastocerus dichotomus*) | 1,2 m ao ombro, 80–125 kg, o maior cervídeo da América do Sul; chifres de até 60 cm, patas longas de cascos separáveis | pelo `#a85a2e`, patas pretas `#1a1410`, contorno de focinho `#e8e0d0` | anda em campo alagado com água no peito | só ambientação |
| **Arara-azul-grande** (*Anodorhynchus hyacinthinus*) | 1 m, maior psitacídeo; bico preto enorme, mancha amarela na base do bico e ao redor do olho | azul `#2a3fa8`, sombra `#14206a`, amarelo `#f0c820` | voa em casal, grita alto, come acuri | só cenário (céu, ninhal) |
| **Gado pantaneiro** | 1,3 m, 400–600 kg, chifres curtos | `#d8d4c8`, pintado `#8a5a38` | tocado pelo peão; berrante conduz o rebanho | só cenário (curral) |
| **Capivara** | ~1 m, 50 kg | `#7a5a3a` | grupos nos corixos | **PET do jogo**: nunca zumbi |

---

## 2. O mapa: Pantanal

**Resumo.** Pantanal Mato-Grossense na cheia: uma estrada de terra elevada (Transpantaneira, com 120+ pontes de madeira) atravessa um mar raso. Fazendas com curral, campos alagados de aguapé, corixos (canais), baías (lagoas), salinas, cordilheiras (capões de mato), a colônia de tuiuiús, Porto Jofre com chalanas e o rio Cuiabá/Paraguai na arena final. Depois da floresta fechada da Amazônia o mapa abre: **horizonte plano, céu enorme, água espelhando**. Peões, fazenda e fauna são trabalho e natureza, sem caricatura nem religião (MAP-40).

**Camadas (todas as áreas):**
1. **Céu**: gradiente por modo, nuvens baixas em faixa (cúmulos; tempestade ao fim), bandos de aves (tuiuiú, arara).
2. **Fundo**: horizonte baixo (35% da tela): mata de cordilheira azulada, palmeiras (carandá, acuri, bocaiuva) isoladas, morraria de Corumbá em algumas áreas.
3. **Meio**: água e vegetação (aguapé, vitória-régia, camalote, capim-navalha), cercas de arame, porteiras, árvores (ipê, piúva, cambará, figueira, tarumã).
4. **Chão** (faixa jogável): terra batida avermelhada, lama, tábuas de ponte, capim alagado, areia/sal, poças espelhando o céu.
5. **Primeiro plano**: capim e aguapé em silhueta escura nos cantos, mourões, ramos de acuri, libélulas e borboletas.

**Paleta base:** capim seco `#c8b058`, capim verde `#6a8a3a`, água rasa `#5f8f9a` (sombra `#2a4a58`), lama `#6a5236`, terra batida `#b0703c`, madeira de ponte `#8a6a44` (sombra `#3e2c1c`), céu dia `#6ab4e8`, nuvem `#f2f0e8`, aguapé lilás `#a478d4`, tuiuiú `#f4f1ea`, ipê amarelo `#f4c820`, ipê roxo `#b04aa8`.

**Luz nos 5 modos** (sombras puxam para roxo/azul, luz para amarelo quente):
| Modo | Céu | Luz e água | Notas |
|---|---|---|---|
| Manhã | `#9fd0f0` → `#f6e0b0` no horizonte, névoa rasa sobre o alagado | sol baixo dourado `#ffe8b0`, água rosada | aves saindo do ninhal, orvalho nas teias |
| Tarde | `#5aa8e8` → `#bcd8ec`, cúmulos altos | sol alto e duro, água azul-aço `#4a86a8` | maior contraste; jacarés de boca aberta ao sol |
| Anoitecer | `#e87a3a` → `#a84a78` → `#3a2a6a`, nuvens em fogo | água cobre/laranja espelhando o céu, tuiuiús em silhueta | o céu duplicado na água: visual mais forte do mapa |
| Noite | `#0c1430` → `#1a2a5a`, via-láctea, estrelas | luar `#8aa8d8`, vaga-lumes, olhos de jacaré vermelhos `#e04a3a` na água | sapos, grilos |
| Lua de Sangue | `#2a0810` → `#8a1a22`, lua enorme `#e83a30` | água do alagado vermelho-escuro com rastro da lua, aguapés roxos, névoa carmim | MAP-15 + MAP-39; ninhal com aves-zumbi em silhueta |

### As 12 áreas (ids do cenário `ART_EXP.PANTANAL`, `art-src/map/pantanal.js`)

| # | Área (id) | O que se vê | Chão | Vasculhar / baús | Arenas |
|---|---|---|---|---|---|
| 1 | **Transpantaneira** (`transpantaneira`) | estrada de terra vermelha elevada, valas cheias de água dos dois lados, **pontes de madeira** de tábua e viga ao longe, placa "KM 0", ipês e piúvas, jacarés no barranco, tuiuiú pousado na vala | terra batida avermelhada, sulcos e poças | pneu de trator, caixa de ferramentas, placa caída | 1 (100%) |
| 2 | **Porteira da fazenda** (`porteira`) | porteira de tronco e mourões, casa-sede térrea de varanda corrida e telha (nome da fazenda fictício), mangueira, joão-de-barro no poste, cavalos ao fundo | terra e capim, tábuas da varanda | baú comum na varanda (50%), cocho | 1 (100%) |
| 3 | **Curral** (`curral`) | mangueira de aroeira lascada, tronco de contenção, poço, cocho, couro esticado, berrante e laço pendurados, gado enluarado ao fundo | lama pisoteada, palha | cocho, fardo de feno, baú de ferramentas | 2 (45%, 100%) |
| 4 | **Campo alagado** (`campoalagado`) | mar raso de capim-navalha e aguapé até o horizonte, cervos-do-pantanal ao longe, ilhotas de capim, tuiuiús pescando, araras, uma ponte de madeira baixa cruzando | água rasa até o tornozelo, marolas | camalote, tronco boiando | 2 |
| 5 | **Corixo** (`corixo`) | canal estreito de água escura sob taboas, vitória-régia, cipós, pinguela, capivaras (cenário, pet-like), sucuri-amarela na margem, ariranhas vigiando | margem de lama e raízes | isca de pesca, canoa virada | 2 |
| 6 | **Baía** (`baia`) | lagoa de água clara cercada de aguapé, jacarés flutuando, ninhos na margem, patos, rastro da lua | areia lamacenta e capim | barco a remo, armadilha de peixe | 2 |
| 7 | **Salina** (`salina`) | lagoa salobra com crosta branca de sal, solo rachado, carandás, gado no cocho de sal, colhereiros rosa | areia clara e crosta de sal | cocho de sal, ossada de boi | 2 |
| 8 | **Cordilheira** (`cordilheira`) | capão de mato mais alto e seco: ipê-amarelo, piúva, acuri, bocaiuva, sombra escura, bromélias nos troncos, teias, cupinzeiros | terra seca com folhas e raízes | tronco oco, toca de tatu, baú ranger | 2 (100% = **mini boss Tamanduá**) |
| 9 | **Ninhal de tuiuiús** (`ninhal`) | árvores secas com **ninhos gigantes de gravetos** (1,5 m), dezenas de tuiuiús, garças, colhereiros, guano branco, ovos quebrados | guano, gravetos, cascas de ovo | ninho caído (penas), baú escondido (faro do pet, 70%) | 2 |
| 10 | **Porto Jofre / chalana** (`jofre`) | ancoradouro de madeira no rio, **chalana** (barco achatado) atracada, rampa de barranco, posto de combustível desativado, barcos com tuiuiús nas proas, placa "Porto Jofre" | tábuas de doca e barro vermelho | galão de gasolina, rede de pesca, baú militar (30%) | 2 |
| 11 | **Ponte quebrada** (`pontequebrada`) | ponte de madeira partida sobre um corixo largo, tábuas boiando, pilares podres, piranhas na água, o squad cruza por vãos e plataformas | tábuas com vão e água | tábua solta, corrimão quebrado | 1 (100%) |
| 12 | **Arena do rei** (`rio`) | margem do rio Cuiabá: barranco de areia clara, água larga e lenta com banco de areia, lua baixa, esqueleto de chalana, ossos de boi, tuiuiús em silhueta | areia úmida e capim | não se vasculha | 1 (80%) |

Cada área 768 u (5760 px), como a Lapa. Pontes de madeira repetíveis aparecem em 1, 4, 5 e 11.

### Objetos de vasculhar (em `obj.js`, `areas:[...]`)
`pneu_trator`, `caixa_ferramentas`, `cocho_madeira`, `fardo_feno`, `camalote`, `canoa_virada`, `armadilha_peixe`, `cocho_sal`, `ossada_boi`, `tronco_oco`, `ninho_caido`, `galao_gasolina`, `rede_pesca`, `tabua_solta`. Baús: comum na varanda, militar em Porto Jofre, escondido no ninhal, ranger na cordilheira.

### Arenas e chefes
- Arenas comuns nas áreas 1–11 (1–2 por área); chão limitado por mourões, margem ou tábuas.
- **Mini boss: O Tamanduá-Bandeira**, 2ª arena da `cordilheira`. **Chefe: O Rei Jacaré**, arena `rio` a 80%, onda única.
- `arenaPos: { cordilheira: [0.45, 0.95], rio: [0.8] }` · `semVasculhar: ['rio']`.

### Loot regional (proposta; segue o molde da Lapa)
Sem recurso novo: **tereré** (água + cura leve, 0,6 por arena), **piranha defumada** (comida), **couro pantaneiro** e **pena de tuiuiú** entram como pano.
```
loot: {
  porArena: { madeira: 2.4, sucata: 1.8, pano: 1.8, comida: 2.4, agua: 1.8, pecas: 1.0, gasolina: 1.1 },
  vitoria:  { madeira: 28, sucata: 16, pecas: 12, fragmento_lunar: 6, gasolina: 4, comida: 6 },
  miniBoss: { pecas: 7, pano: 12, remedio: 3, comida: 3, fragmento_lunar: 1 },
  projeto: 0.18,
}
```

### Ondas propostas (12 tipos: 6 novos + 6 reaproveitados)
Novos: **peao, tuiuiu, queixada, ariranha, tamandua (mini), reijacare (chefe)**. Reaproveitados (mesmo id/nome): **errante, corredor, rastejante, piranha, onca (arena forte, não mini), blindado**.
```
transpantaneira: [errante, errante, corredor, peao, queixada], [corredor, errante, peao, tuiuiu, errante]
porteira:        [peao, errante, queixada, corredor, peao], [blindado, peao, errante, tuiuiu, corredor]
curral:          [peao, peao, blindado, queixada, errante], [queixada, queixada, peao, corredor, blindado, tuiuiu]
campoalagado:    [tuiuiu, queixada, errante, ariranha, peao], [ariranha, tuiuiu, piranha, blindado, peao, errante]
corixo:          [ariranha, piranha, piranha, rastejante, errante], [ariranha, ariranha, peao, queixada, tuiuiu, piranha]
baia:            [piranha, ariranha, tuiuiu, peao, blindado, errante], [ariranha, piranha, queixada, tuiuiu, rastejante, peao]
salina:          [peao, queixada, tuiuiu, corredor, blindado, rastejante], [queixada, queixada, blindado, peao, tuiuiu, corredor]
cordilheira:     [queixada, peao, tuiuiu, errante, blindado, corredor], [tamandua]          // mini boss
ninhal:          [tuiuiu, tuiuiu, peao, ariranha, blindado, corredor], [tuiuiu, tuiuiu, tuiuiu, onca, peao]
jofre:           [peao, ariranha, piranha, blindado, tuiuiu, queixada, errante], [blindado, peao, ariranha, onca, corredor, tuiuiu]
pontequebrada:   [piranha, piranha, ariranha, rastejante, peao, corredor], [blindado, ariranha, tuiuiu, queixada, peao, piranha]
rio:             [reijacare]
```
Pesos globais: Errante+Corredor+Rastejante 30%, Peão 17%, Queixada 14%, Tuiuiú 11%, Ariranha 11%, Piranha 8%, Blindado 6%, Onça 3% (só em arena forte). Raridade por expedição: peao incomum, queixada incomum, tuiuiu raro, ariranha raro.

### Regras propostas do mapa
- `MAP-34` **Pantanal:** 12 áreas, nível 26, requer Amazônia; mini boss Tamanduá (cordilheira) e chefe Rei Jacaré (rio).
- `MAP-35` **Alagado:** campo alagado, corixo, baía e ponte quebrada têm marolas e são "água" para ariranha e piranha (emergem); sem lentidão no chão.
- `MAP-36` **Pontes de madeira:** peça de cenário e ponto de emboscada; nunca matam por queda.
- `MAP-37` **Objetos novos** em `obj.js` com `areas:[...]` (lista acima).
- `MAP-38` **Ondas do Pantanal** (tabela acima); onça só em arenas fortes.
- `MAP-39` **Lua de Sangue no Pantanal:** céu vermelho, lua enorme, água do alagado vermelho-escuro com rastro da lua, névoa carmim, ninhal com aves-zumbi em silhueta.
- `MAP-40` **Respeito:** peões, fazendeiros e comunidades retratados como trabalhadores; nomes de fazenda fictícios; fauna com anatomia correta; sem religião.

### Referências a buscar: mapa (`referencias/pantanal/`, ~100)
Transpantaneira estrada (10) · pontes de madeira da Transpantaneira (10) · fazenda pantaneira, sede e porteira (8) · curral, mangueira, gado e peões (10) · campo alagado, aguapé, vitória-régia (10) · corixo e baía (10) · salina e cordilheira (8) · ninhal de tuiuiús (8) · Porto Jofre, chalana e rio Cuiabá/Paraguai (10) · céu, pôr do sol e luar do Pantanal (8) · fauna de cenário: capivara, jacaré, cervo, arara (8) · vegetação: ipê, acuri, carandá, bocaiuva, camalote (8). Spec: `referencias/_tools/specs/pantanal.json`.

---

## 3. Zumbis novos

Escala (comparar com Lapa): Errante 80 hp · Blindado 160 · Malandro 95/14 · Passista mini 3400/28 · Maquinista 6600/38. Valores **base**, antes da escala de mapa/arena de `data/balance.ts`.

| id | Nome | Tipo | HP | Dano | XP | Drop | ax·G·top·w (u) | Porte na tela |
|---|---|---|---|---|---|---|---|---|
| peao | Zumbi Peão Pantaneiro | comum | 110 | 15 | 10 | pano 0,3 | 82·152·116·16 | ~135 px alto |
| tuiuiu | Tuiuiú Zumbi | comum (ave) | 70 | 14 | 9 | pano 0,25 | 92·158·118·16 | ~140 px alto; ~150 px de envergadura em voo |
| queixada | Queixada Zumbi | comum (bando) | 90 | 12 | 8 | comida 0,3 | 100·130·66·30 | ~130 px largo |
| ariranha | Ariranha Zumbi | comum | 65 | 9 | 9 | comida 0,25 | 100·132·64·30 | ~130 px largo; ~100 px ereta |
| tamandua | O Tamanduá-Bandeira | mini boss | 4600 | 32 | 160 | pecas 3 | 178·270·214·36 | ~265 px de pé |
| reijacare | O Rei Jacaré | chefe | 9200 | 44 | 520 | fragmento_lunar 3 | 255·310·168·64 | ~335 px largo |

### 3.1 Zumbi Peão Pantaneiro — `peao` (IA-35, IA-36)

**Conceito.** Peão de comitiva que tocava gado entre fazendas; a Lua de Sangue o pegou e ele continua tocando, agora a pé e morto. O truque é de longe: **laço** que puxa o lutador e **berrante** que enfurece os zumbis ao redor. É o zumbi "pastor": o grupo fica melhor perto dele. Figura de trabalho, sem caricatura (MAP-40).

**Aparência.** Homem de ~1,75 m: chapéu de aba larga de couro `#a67a4a` (sombra `#4a3220`) com barbicacho solto, lenço vermelho desbotado `#b04030`, camisa xadrez de manga longa rasgada `#7a8a6a`/`#c8c0a0`, colete de couro `#6a4a2a`, calça de brim desbotado `#4a5a7a` dentro de **perneiras de couro** `#8a5a30`, botas altas com **esporas** `#a8a8b0`, cinto largo com fivela e **faca** pantaneira, **laço** de couro trançado no ombro `#b08a5a`, **berrante** de chifre de boi (curvo, bocal e aros de metal) na cintura. Corrupção: pele cinza-oliva `#8a9a7a` com veias roxas, olhos de lua, mandíbula caída, carne exposta no antebraço, musgo no chapéu e nas botas.

**Formas.**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | tons terrosos, lenço vermelho desbotado | laço 180 px, berrante 1× por peão |
| Enluarado | roupa fria azulada, rachaduras ciano nas costas e no chifre | 1,3× vida; berrante também dá +15% velocidade |
| Plenilunar | roupa encharcada de sangue, esporas e chifre brilhando laranja, espinhos de osso nas costas | 1,6× vida, 1,5× dano; laço 220 px |

**Tamanho.** ~135 px (top 116 u com o chapéu). Arte `art-src/zombies/peao.js`, adereços `xLaco` (4 quadros, corda esticando) e `xBerrante` (3 quadros, onda sonora). IA `ai/peao.ts`.

**Animações:** idle 8, walk 8, alert 7, attack 9, laco 10, berrante 9, hurt 4, hurtB 4, fall 6, getup 6, death 8, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| idle/walk | 8/8 | — | pernas arqueadas, esporas tilintando, balança o laço na mão |
| alert | 7 | — | saca o berrante e olha o alvo |
| attack (facada) | 9 | dano 4 e 7 | antecipação: faca alta; impacto: corte lateral; recuperação: gira a lâmina |
| laco | 10 | warn 0–3, throwAt 4, pull 5–8 | antecipação: gira o laço sobre a cabeça; impacto: lança; recuperação: puxa e recolhe |
| berrante | 9 | warn 0–3, call 4 | antecipação: inspira, ergue o chifre; impacto: sopra (onda sonora); recuperação: abaixa |
| death | 8 | — | chapéu voa, cai de joelhos e de lado, laço se espalha |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito e recarga |
|---|---|---|---|---|
| Facada `attack` | faca erguida, 200 ms | 2 cortes, ≈1,1× (≈16) | 34 px | recarga 1,6 s |
| Laço `laco` | giro do laço + círculo no alvo, 450 ms | 0,5× (≈8) | 50 a 180 px | **PRESO** 0,5 s e puxa o lutador até 40 px dele; recarga 8 s |
| Berrante `berrante` | ergue o chifre, 500 ms (onda visual) | — | raio 220 px | aliados ganham +25% velocidade e +10% dano por 6 s (FÚRIA DO REBANHO); recarga 20 s |

`IA-35` **Peão, laço:** só usa com o alvo a 50–180 px e linha de visão; a puxada é cancelada por golpe forte (≥ 25% da vida) ou atordoamento.
`IA-36` **Peão, berrante:** começa com ≥ 2 aliados a menos de 220 px; qualquer dano o interrompe; o buff não empilha.

**IA tática.** Fica a 100–140 px, usa o berrante quando o grupo chega, laça o lutador de trás, depois entra de faca. Sozinho, circula em vez de encostar.
**Fraqueza.** Soprando o berrante e logo depois ele fica com as duas mãos ocupadas: **+30% de dano** por 0,8 s. Matá-lo antes do berrante corta o buff.
**Onde.** Transpantaneira, Porteira, Curral e áreas de terra (peso 17%).

**Referências a buscar** (`referencias/zumbis-pantanal/peao/`, ~100): chapéu pantaneiro e de couro (12) · peão pantaneiro, comitiva, retratos (12) · laço de couro trançado e nós (10) · berrante de chifre (10) · perneiras, botas e esporas (10) · camisa xadrez e colete de couro (8) · faca pantaneira e bainha (8) · lida com gado no curral (12) · rosto e mãos de trabalhador rural, pele curtida (8) · couro envelhecido e mofado (6) · cavalo pantaneiro e sela (4).

### 3.2 Tuiuiú Zumbi — `tuiuiu` (IA-37, IA-38)

**Conceito.** A ave-símbolo do Pantanal, caída e levantada, com a lua no olho. Voa rasante e perfura. Primeiro **alvo aéreo** do mapa: no voo só é atingido por projétil ou golpe de cima; pousado é inimigo médio de alcance longo (bico).

**Aparência.** Ave de ~1,3 m, pescoço longo, **cabeça e pescoço pretos sem penas, papo vermelho**, corpo branco, bico preto reto de 30 cm com ponta lascada, pernas pretas longas e finas. Asa larga com primárias pretas, cauda curta, pescoço em S quando recolhido. Corrupção: olho de lua, papo exposto pulsando, penas faltando mostrando pele roxa, ossos na asa, musgo-lunar nas costas, bico rachado com sangue seco. Cores: branco `#f4f1ea`/`#c8c4d4`, preto `#1a1a22`, papo `#d8242c` (sombra `#6a1018`), bico `#222228`, olho `#e8e8f4`.

**Formas.**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | branco sujo, papo vermelho opaco | rasante 60 px/s |
| Enluarado | branco azulado, rachaduras ciano no papo e nas asas | 1,3× vida; bico brilha ciano |
| Plenilunar | penas queimadas de sangue, papo laranja-vermelho, esporões de osso no bico | 1,6× vida, 1,5× dano; bicada dupla |

**Tamanho.** ~140 px de altura (pescoço esticado); em voo ~150 px de envergadura. Arte `art-src/zombies/tuiuiu.js` (16 animações), IA `ai/tuiuiu.ts`.

**Animações:** idle 8 (caminha solene, pescoço em S, bico entreaberto), walk 8, alert 7 (bate o bico "clac"), attack 9, lunge 8, dive 10, land 5, hurt 4, hurtB 4, fall 6, getup 6, death 8, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| attack (bicada) | 9 | warn 0–3, dano 4 | antecipação: pescoço recua em S; impacto: dispara reto; recuperação: recolhe, asas de equilíbrio |
| lunge (bicada longa) | 8 | warn 0–3, hit 4 | corpo e pescoço se estendem, perfura |
| dive (rasante) | 10 | warn 0–3, voo 4–8, land 9 | decola, plana em linha reta, arrasta as pernas; alvo aéreo |
| death | 8 | — | asa quebrada, cai de bico, penas espalham |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito e recarga |
|---|---|---|---|---|
| Bicada `attack` | pescoço recua, 250 ms | 1,0× (≈14) | 40 px | recarga 1,6 s |
| Bicada longa `lunge` | **faixa fina** na linha do alvo, 400 ms | 1,3× (≈18) | até 100 px | **perfura defesa**: ignora 50% da redução de dano/escudo; SANGRAMENTO 3 s; recarga 4,5 s |
| Voo rasante `dive` | faixa até a borda + sombra no chão, 500 ms | 1,1× (≈15) | faixa de 24 px × 280 px | empurra 18 px; durante o voo é alvo aéreo; pousa e fica 0,8 s vulnerável; recarga 7 s |

`IA-37` **Tuiuiú, rasante:** só com o alvo a 120–280 px; no voo é imune a golpes corpo a corpo de solo; ao pousar fica 0,8 s com +30% de dano.
`IA-38` **Tuiuiú, bicada que perfura:** a bicada longa ignora metade da redução de dano e causa SANGRAMENTO; sempre avisada por faixa fina.

**IA tática.** Anda atrás do bando, bicada longa nos de trás, rasante quando o squad se fecha. Ferido (< 40%), foge voando e volta em rasante.
**Fraqueza.** Pousando fica esparramado 0,8 s (+30%); a cabeça leva +20% de projétil.
**Onde.** Ninhal, campo alagado, baía, salina, Porto Jofre, Transpantaneira (peso 11%).

**Referências a buscar** (`referencias/zumbis-pantanal/tuiuiu/`, ~100): tuiuiú de corpo inteiro em pé (14) · papo vermelho e pescoço nu, close (10) · bico e cabeça, close (10) · voo rasante, asas abertas, pernas para trás (12) · asa aberta e primárias (8) · pesca e bico (8) · ninho gigante e filhotes (8) · colônia no ninhal (8) · pés e pernas longas (6) · olho e plumagem (8) · ave morta, esqueleto, penas caídas (8).

### 3.3 Queixada Zumbi — `queixada` (IA-39)

**Conceito.** O porco-do-mato que anda em bando de dezenas. Cada um é fraco; o perigo é a **investida em grupo, em linha**, com presas que derrubam, e o **estouro** (meia-volta do bando) quando apanha.

**Aparência.** Quadrúpede de ~1 m de comprimento, cabeça grande e baixa, focinho de disco, **caninos retos expostos** e lascados, orelhas pequenas, corpo em cunha (pesado na frente), pernas finas com cascos, crista de cerdas duras `#1a120e`, **queixo branco**, cauda minúscula. Cores: pelo `#2a1f1a`/`#5a4a40`, queixo `#e8e0d0`, focinho `#3a2a28`, presa `#e8e0b0`. Corrupção: olhos de lua, costelas expostas no flanco, mandíbula rachada, musgo-lunar na crista, baba de sangue.

**Formas.**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | pelo sujo, queixo branco | investida simples |
| Enluarado | pelo azul-grafite, rachaduras ciano no flanco | 1,3× vida; estalo de dentes atordoa |
| Plenilunar | cerdas vermelhas, presas de osso longas, olhos laranja | 1,6× vida, 1,5× dano; velocidade ×1,2 |

**Tamanho.** ~130 px de largura, ~70 px de altura (quadrúpede: `top` baixo). Arte `art-src/zombies/queixada.js` (14 animações), IA `ai/queixada.ts`.

**Animações:** idle 8 (fuça no chão, orelhas), walk 8 (trote), alert 6 (estalo de dentes), attack 8, charge 10, snap 6, hurt 4, hurtB 4, fall 5, getup 5, death 7, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| attack (presada) | 8 | warn 0–2, dano 3 | antecipação: abaixa a cabeça e recua; impacto: sobe com as presas; recuperação: sacode a cabeça |
| charge (investida) | 10 | warn 0–3, run 4–8 | raspa o chão levantando poeira, corre em linha reta |
| snap (estalo) | 6 | warn 0–2, hit 3 | estala os caninos, cabeça balança |
| death | 7 | — | desaba de lado, patas tremem |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito e recarga |
|---|---|---|---|---|
| Presada `attack` | cabeça baixa, 250 ms | 1,0× (≈12) | 30 px | recarga 1,4 s |
| Investida `charge` | raspa o chão + **faixa** até a borda, 450 ms | 1,0× (≈12) | faixa de 24 px | **derruba**, empurra 26 px; recarga 6 s; **em grupo**: ≥ 3 queixadas investem na mesma linha com uma faixa larga |
| Estalo `snap` | tremor do queixo, 300 ms | 0,4× (≈5) | r 40 | ATORDOADO 0,3 s (só enluarado/plenilunar); recarga 5 s |

`IA-39` **Queixada, bando:** com 3+ queixadas por perto, a investida sincroniza (mesma faixa e mesmo aviso); ao levar golpe forte as vizinhas fazem meia-volta (**estouro**) e recuam 1 s.

**IA tática.** Cerca em círculo, investe em bando, prioriza o lutador isolado; sozinha, foge e volta com outras.
**Fraqueza.** Depois da investida fica **vulnerável 1,0 s (+25%)**; o flanco leva +20%.
**Onde.** Curral, salina, Transpantaneira, Porteira, cordilheira (peso 14%).

**Referências a buscar** (`referencias/zumbis-pantanal/queixada/`, ~100): queixada de corpo inteiro (14) · bando em corrida (10) · cabeça e presas, close (10) · ameaça e estalo de dentes (6) · cateto com colar (10) · pelagem e cerdas (8) · patas e cascos (6) · pegadas e lama (6) · crânio e esqueleto com presas (12) · bando no mato (6) · javali/porco-do-mato em investida, só para movimento (12).

### 3.4 Ariranha Zumbi — `ariranha` (IA-40, IA-41)

**Conceito.** A "onça d'água" em família: sai do corixo em **periscópio**, morde em rajada e chama o bando com guinchos. Só aparece em áreas de água, de preferência em dupla ou trio.

**Aparência.** Lontra gigante de ~1,6 m, corpo longo em torpedo, cauda achatada em remo, **pés palmados**, cabeça larga e achatada, focinho curto com bigodes, orelhas minúsculas, **babador branco/creme** na garganta, pelagem curta e densa que fica espetada molhada. Cores: pelo `#4a3022` (sombra `#1e130c`, luz `#8a6040`), babador `#e8dcc0`, focinho `#1a1210`, dentes `#e8e0c0`, língua `#c04a58`. Corrupção: olhos de lua, pelo caindo mostrando pele roxa, ossos do queixo expostos, aguapé e algas pendurados, sangue na boca.

**Formas.**
| Forma | Visual | Mecânica |
|---|---|---|
| Comum | marrom molhado, babador sujo | mordida dupla/tripla |
| Enluarado | pelo azul-escuro, rachaduras ciano no dorso | 1,3× vida; guincho chama 2 |
| Plenilunar | pelo vermelho-sangue, espinhos de osso na espinha, olhos laranja | 1,6× vida, 1,5× dano; mordida em 4 |

**Tamanho.** ~130 px largo; ~100 px de altura em periscópio. Arte `art-src/zombies/ariranha.js` (14 animações), IA `ai/ariranha.ts`.

**Animações:** idle 8 (periscópio: ergue o tronco e vigia), walk 8 (gingado de lontra), alert 7 (guincho), attack 9, dash 8, call 8, hurt 4, hurtB 4, fall 5, getup 5, death 8, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| attack (mordidas) | 9 | warn 0–2, dano 3, 5, 7 | antecipação: boca aberta e recuo; impacto: 3 mordidas; recuperação: balança a cabeça |
| dash (arrancada) | 8 | warn 0–2, run 3–6 | desliza de barriga |
| call (guincho) | 8 | warn 0–3, call 4 | ergue-se e guincha (onda sonora curta) |
| death | 8 | — | cai de lado, cauda se debate |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito e recarga |
|---|---|---|---|---|
| Mordidas `attack` | boca aberta + recuo, 200 ms | 3 mordidas, ≈1,0× no total (≈9) | 30 px | SANGRAMENTO 2 s no 3º acerto; recarga 1,4 s |
| Arrancada `dash` | faixa curta, 300 ms | 0,6× (≈6) | 120 px | derruba de frente; recarga 5 s |
| Guincho `call` | ergue o tronco, 450 ms | — | raio 260 px | chama 1 ariranha (2 em enluarado/plenilunar) em 3 s; máx. 4 vivas; recarga 14 s |

`IA-40` **Ariranha, emergir:** em áreas de água entra em "mergulho" de 1,2 s (some, imune) e emerge **atrás** do alvo com mordida, com marcador de bolhas no chão 0,6 s antes.
`IA-41` **Ariranha, guincho:** interrompível por dano ≥ 15% da vida; matar a chamadora antes de a 2ª chegar cancela o reforço.

**IA tática.** Em grupo, mergulha e emerge nas costas, guincha cedo; sozinha, foge.
**Fraqueza.** Guinchando fica parada e **vulnerável 0,8 s (+30%)**; o ventre pálido fica exposto no periscópio.
**Onde.** Corixo, baía, campo alagado, Porto Jofre, ponte quebrada, ninhal (peso 11%).

**Referências a buscar** (`referencias/zumbis-pantanal/ariranha/`, ~100): ariranha de corpo inteiro (12) · babador branco e garganta (10) · cabeça, bigodes e dentes (10) · periscópio, ereta fora da água (10) · grupo/família (8) · nadando e mergulhando (10) · andando na margem (8) · cauda achatada e patas palmadas (6) · crânio e esqueleto de lontra (8) · pelo molhado e textura (8) · corixos e habitat da ariranha (10).

### 3.5 O Tamanduá-Bandeira — `tamandua` (mini boss · BOSS-33 a BOSS-35, IA-42)

**Conceito.** O gigante gentil do cerrado, corrompido: um tamanduá de 2 m que **se levanta nas patas traseiras** e abraça. Mini boss da cordilheira. Lento e pesado, com o aviso mais legível do jogo (o levantar-se): o desafio é **saber quando sair do abraço**.

**Aparência.** Animal de ~2,1 m com a cauda, curvado; **focinho tubular** fino com boca minúscula, **língua** de 60 cm rosa-podre `#c04a68`, olhos pequenos e baixos (de lua), orelhas pequenas redondas, patas dianteiras com **garra central** em foice (antebraços brancos com anéis pretos), cauda em "bandeira" de pelos longos `#4a443c`. Pelagem cinza `#7a7468` (sombra `#3a3630`, luz `#b0a898`), **faixa diagonal preta** `#16120e` com borda branca `#f0ead8` do peito ao ombro. Corrupção: carne exposta no flanco, costelas e coluna aparecendo, fungo-lunar em placas nas costas, pelo caindo, cupinzeiro pendurado no focinho, língua com larvas, olhos vermelhos.

**Formas.**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Normal | 100 a 50% | cinza sujo, fungo roxo suave | abraço, garra em arco, língua |
| Fúria | abaixo de 50% | pelo carbonizado, faixa preta rasgada, língua luminosa ciano, olhos laranja | 1,3× mais rápido, recargas menores, abraço duplo, língua em leque |

**Tamanho.** ~265 px de altura de pé; ~270 px de largura agachado. Medidas propostas `ax 178 · G 270 · top 214 · w 36`. Arte `art-src/zombies/tamandua.js` (adereços `xLingua` de 4 quadros, `xPoeira` de 3), IA `ai/tamandua.ts` (molde `passista.ts`/`erveira.ts`).

**Animações:** idle 8, walk 8, intro 12, stand 8, hug 12, claw 10, tongue 10, slam 9, dazed 8, rage 8, hurt 4, fall 6, getup 6, death 12, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| idle | 8 | — | fareja com o focinho, cauda balançando |
| walk | 8 | stomp 2, 6 | anda sobre os nós dos dedos, balança o corpo, peso |
| intro (WARNING) | 12 | — | sai do capão, cheira o ar, levanta-se e ruge |
| stand (levantar) | 8 | warn 0–6 | ergue o tronco apoiado na cauda e abre os braços (**aviso do abraço**) |
| hug (abraço) | 12 | warn 0–5, grab 6, tick 8, 10 | desce sobre o alvo e aperta |
| claw (garra em arco) | 10 | warn 0–3, hit 4–5 | garras erguidas e varredura em arco |
| tongue (língua) | 10 | warn 0–3, hit 4, pull 5–8 | recua a cabeça e dispara a língua; puxa |
| slam (cauda, só fúria) | 9 | warn 0–3, hit 4 | gira e bate a cauda no chão atrás |
| dazed | 8 | loop 1,5 s | cai de quatro tonto, cauda mole |
| rage | 8 | — | ruge de pé, o fungo das costas brilha |
| death | 12 | — | tomba de lado, cauda cobre o corpo, língua para fora |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Abraço com garras `hug` | **levanta-se nas patas traseiras (700 ms) + círculo r 60** | 3 pulsos de 0,5× (≈16 cada) | r 60 | **PRESO** 1,6 s; outro lutador quebra o abraço com golpe forte (≥ 25% da vida do boss) ou empurrão; depois fica **ABERTO** de pé 1,2 s (dano ×1,5); recarga 9 / 6,5 s |
| Garra em arco `claw` | arco no chão, 450 ms | 1,1× (≈35) | arco de 100 px, 140° | derruba; recarga 4 / 3 s |
| Língua `tongue` | **faixa fina** + língua rosa, 400 ms | 0,6× (≈19) | 60 a 200 px | puxa o lutador a 30 px do boss (PRESO 0,5 s); recarga 8 / 6 s |
| Cauda `slam` (fúria) | círculo atrás, 500 ms | 0,8× (≈26) | r 70 atrás | ATORDOADO 0,4 s; recarga 7 s |

`BOSS-33` **Padrão do mini boss:** WARNING de 3,2 s "MINI BOSS" + nome, `intro`, golpes por distância, fúria < 50%, janelas de dano e morte animada (mesmo contrato de BOSS-27).
`BOSS-34` **Abraço:** círculo r 60 por 700 ms; quem não sai fica PRESO 1,6 s com 3 pulsos de 0,5×; outro lutador quebra com golpe forte; depois o tamanduá fica ABERTO 1,2 s (+50%). Fúria: abraço duplo (o 2º 0,6 s depois, na nova posição do alvo).
`BOSS-35` **Língua e garra:** língua puxa até 30 px; garra derruba; fúria: língua em leque de 3 faixas e garra 1,3× mais rápida. Nenhum golpe sai sem aviso visual.
`IA-42` **Tamanduá, tática:** circula a ~90 px, alterna garra, língua e abraço; só se levanta com o alvo a ≤ 110 px; depois de golpe pesado fica 1 s lento.

**IA tática.** Anda curvado até o squad, puxa o mais distante com a língua, levanta-se para abraçar o mais próximo. Ferido, ruge e se levanta mais vezes.
**Fraqueza.** Depois do abraço fica **aberto 1,2 s (+50%)**; ventre exposto de pé.
**Onde.** Cordilheira, 2ª arena.

**Referências a buscar** (`referencias/zumbis-pantanal/tamandua/`, ~100): tamanduá-bandeira andando, corpo inteiro (14) · de pé nas patas traseiras, defesa (10) · faixa diagonal e pelagem (10) · focinho tubular e olhos, close (10) · língua e cupinzeiro (8) · garras e patas dianteiras (10) · cauda em bandeira (8) · filhote nas costas da mãe (6) · esqueleto, crânio e taxidermia (8) · cerrado e capão (8) · abraço e defesa contra predador (8) · pele e pelo, textura (6).

### 3.6 O Rei Jacaré — `reijacare` (chefe · BOSS-36 a BOSS-38, IA-43, IA-44)

**Conceito.** Um jacaré-do-pantanal que viveu 80 anos no rio e a Lua de Sangue fez rei dele. Chefe do mapa, na margem do rio Cuiabá. Domina a arena pela água e pela rabada: **mordida avisada, giro da morte** que prende e gira, **rabada em área** e **mergulho/emersão** em outro ponto. O chefe "predador de emboscada" do jogo.

**Aparência.** Proporção real: cabeça larga em "U" de focinho curto, **olhos altos** com pupila vertical âmbar `#c9a43a`, narinas no topo do focinho, **placas ósseas** em fileiras nas costas, mandíbula com ~76 dentes irregulares, cauda comprimida lateralmente (~50% do corpo). Cores: dorso oliva `#5f6a3a` (sombra `#2f3a22`, luz `#8a9a58`), barras `#232a18`, mancha amarelada na mandíbula `#c0b064`, ventre `#d8cf9c`, boca `#d98a7a`, língua `#a8505a`. Corrupção: **crânio exposto no lado esquerdo do focinho** (osso `#e0d8b8`), costelas à mostra no flanco, cicatrizes e arpões velhos cravados, **musgo e aguapé crescendo nas placas** (manto verde `#4a7a3a`, flor lilás `#a478d4` na cabeça como "coroa" natural), olho esquerdo de lua branco-leitoso e o direito âmbar. Fúria: pele carbonizada, rachaduras ciano luminosas nas placas, sangue escorrendo, olho laranja-vermelho `#ff6a3a`, brilho dentro da boca.

**Formas.**
| Forma | Quando | Visual | Mecânica |
|---|---|---|---|
| Normal | 100 a 50% | oliva, musgo e aguapé, crânio parcial | mordida, giro, rabada, mergulho |
| Fúria | abaixo de 50% | pele escura carbonizada, rachaduras ciano, olho laranja-vermelho, aguapé murcha | 1,3× mais rápido, recargas menores, giro duplo, rabada com onda, 2 emersões seguidas |

**Tamanho.** **~335 px de largura** (focinho a ponta da cauda), ~140 px de altura no high walk. Medidas propostas `ax 255 · G 310 · top 168 · w 64`. Arte `art-src/zombies/reijacare.js` (adereços `xAgua` de 4 quadros para a lâmina d'água/espuma e `xOnda` de 3 para a onda da rabada), IA `ai/reijacare.ts` (molde de `maquinista.ts`).

**Animações:** idle 8, walk 8, intro 14, bite 10, spin 14, tail 10, dive 8, emerge 10, roar 9, rage 10, dazed 8, hurt 4, fall 6, getup 6, death 14, tumble 4, grabbed 4.
| Anim | Quadros | Eventos | Notas |
|---|---|---|---|
| idle | 8 | — | pé-ante-pé, cabeça baixa, respiração, sacode a cauda |
| walk | 8 | stomp 2, 6 | high walk: corpo erguido, patas dobradas, cauda arrastando |
| intro (WARNING) | 14 | — | emerge do rio, vira o focinho para o squad e ruge de boca aberta |
| bite (mordida) | 10 | warn 0–4, hit 5, 6 | antecipação: abre a boca e arqueia; impacto: fecha em estalo; recuperação: sacode a cabeça |
| spin (giro da morte) | 14 | warn 0–3, grab 4, spin 5–11, throw 12 | prende o lutador na boca e gira o corpo em eixo |
| tail (rabada) | 10 | warn 0–4, hit 5–6 | gira o corpo e varre a cauda, onda de água e poeira |
| dive | 8 | warn 0–2 | mergulha de lado, só olhos e dorso (invulnerável) |
| emerge | 10 | surge 3, hit 4, 5 | irrompe da água com a mordida |
| roar | 9 | warn 0–4, call 5 | rugido de cabeça erguida (fúria) |
| rage | 10 | — | rachaduras acendem |
| dazed | 8 | loop 1,8 s | bate a cabeça na margem, língua para fora |
| death | 14 | — | tomba, rola de barriga, cauda estala, afunda lentamente, aguapé flutua |

**Golpes.**
| Golpe | Aviso | Dano | Alcance | Efeito, recarga e peso |
|---|---|---|---|---|
| Mordida `bite` | cone na boca, 600 ms; arqueia | 1,4× (≈62) | cone 90 px, ±35° | derruba; recarga 4 / 3 s |
| Giro da morte `spin` | **círculo r 56 na boca, 700 ms** | agarra 1,0× + 3 pulsos de 0,4× (≈18) | r 56 | **PRESO** 1,8 s (erguido e girado), depois **arremessado** 80 px; outro lutador pode libertar com golpe forte; o Rei fica **ZONZO 1,2 s** (+50%); recarga 9 / 6,5 s |
| Rabada `tail` | círculo atrás da cauda, 500 ms | 1,1× (≈48) | r 90 atrás e laterais | empurra 40 px; ATORDOADO 0,5 s; fúria: onda ao longo da cauda (r 140, 0,5×); recarga 5 / 3,5 s |
| Mergulho e emersão `dive/emerge` | bolhas e ondas no chão do alvo por 1,0 s | 1,3× (≈57) | círculo r 50 | invulnerável 1,5 s e **emerge no ponto marcado**; fúria: 2 emersões em lutadores diferentes; recarga 12 / 9 s |
| Rugido `roar` (fúria) | 700 ms | — | raio 200 px | afasta o squad 30 px e chama **2 piranhas**; 1× por fase |

`BOSS-36` **Padrão do chefe:** WARNING 3,2 s "CHEFE" + nome, `intro`, golpes por distância, fúria < 50%, 1 janela de dano, morte longa (BOSS-27/30).
`BOSS-37` **Mordida e giro:** cone avisado de 600 ms; o giro avisa um círculo r 56 e prende 1,8 s com 3 pulsos; outro lutador quebra com golpe forte; depois ele fica ZONZO 1,2 s (+50%).
`BOSS-38` **Rabada e mergulho:** rabada em círculo r 90 atrás; mergulho invulnerável 1,5 s e emersão em ponto marcado por bolhas 1,0 s antes (nunca sem marcador); fúria: onda de rabada, 2 emersões e rugido que chama 2 piranhas.
`IA-43` **Rei Jacaré, distância:** < 90 px: mordida ou giro; 90–160 px: rabada ou mordida em cone; > 160 px: mergulho/emersão; nunca repete o mesmo golpe 2×.
`IA-44` **Rei Jacaré, janelas:** vulnerável (+50%) após o giro (ZONZO 1,2 s), após a emersão (recupera em 5 quadros) e quando erra a rabada e bate na margem; invulnerável só mergulhado.

**IA tática.** Fica a ~120 px do squad, mergulha se atacado por trás, rabada em quem cerca, giro em quem se aproxima. Na fúria alterna emersões e giros com pausas curtas; as janelas continuam.
**Fraqueza.** ZONZO depois do giro e de emersão errada; a **barriga clara** na mordida; o **olho esquerdo cego** (por esse lado reage 0,3 s mais devagar, +15% de dano).
**Onde.** Arena `rio` (80%), onda única.

**Referências a buscar** (`referencias/zumbis-pantanal/reijacare/`, ~100): jacaré-do-pantanal de corpo inteiro (14) · cabeça, focinho e dentes, close (12) · olhos e pupila vertical (8) · mordida, boca aberta (10) · giro da morte e luta (8) · rabada e cauda (8) · osteodermos e escamas das costas (10) · caminhada alta e deslizar (8) · na margem, sol de boca aberta (8) · crânio e esqueleto, museu (8) · aguapé e musgo, camuflagem na água (8) · couro e escamas, textura; jacaré-açu/crocodilo grande para escala (8).

---

## 4. Próximos passos (fora desta ficha)
1. Aprovar roster e ficha.
2. Baixar referências: `python referencias/_tools/commons_refs.py referencias/_tools/specs/pantanal.json` e uma por zumbi (`peao`, `tuiuiu`, `queixada`, `ariranha`, `tamandua`, `reijacare`).
3. Arte Cosmic Invasion de cada zumbi, depois `data/maps/pantanal.ts`, `art-src/map/pantanal.js`, `zombies.ts` e `ai/*.ts`.


## Códigos no mecanicas2

Faixas finais no `mecanicas2.html` (ordem: zumbis-mapas-atuais IA-35–58, amazônia IA-59–74 / BOSS-33–38 / MAP-34–39, depois esta ficha): IA-75 a IA-84, BOSS-39 a BOSS-44, MAP-40 a MAP-46. Seções `m-zumbis-pantanal`, `m-bosses-pantanal`, `m-mapa-pantanal`.

| Código na ficha | Código no mecanicas2 | Regra |
|---|---|---|
| IA-35 | IA-75 | Peão, laço |
| IA-36 | IA-76 | Peão, berrante |
| IA-37 | IA-77 | Tuiuiú, rasante |
| IA-38 | IA-78 | Tuiuiú, bicada que perfura |
| IA-39 | IA-79 | Queixada, bando |
| IA-40 | IA-80 | Ariranha, emergir |
| IA-41 | IA-81 | Ariranha, guincho |
| BOSS-33 | BOSS-39 | Padrão do mini boss |
| BOSS-34 | BOSS-40 | Abraço |
| BOSS-35 | BOSS-41 | Língua e garra |
| IA-42 | IA-82 | Tamanduá, tática |
| BOSS-36 | BOSS-42 | Padrão do chefe |
| BOSS-37 | BOSS-43 | Mordida e giro |
| BOSS-38 | BOSS-44 | Rabada e mergulho |
| IA-43 | IA-83 | Rei Jacaré, distância |
| IA-44 | IA-84 | Rei Jacaré, janelas |
| MAP-34 | MAP-40 | Pantanal |
| MAP-35 | MAP-41 | Alagado |
| MAP-36 | MAP-42 | Pontes de madeira |
| MAP-37 | MAP-43 | Objetos novos |
| MAP-38 | MAP-44 | Ondas do Pantanal |
| MAP-39 | MAP-45 | Lua de Sangue no Pantanal |
| MAP-40 | MAP-46 | Respeito |
