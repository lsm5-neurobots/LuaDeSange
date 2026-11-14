# Contrato dos assets — Objetos da Lua de Sangue

Pasta: `Objetos da Lua de Sangue/` (rodar scripts de dentro de `tools/`).

## Estilo (igual aos zumbis, pets e herói)
- Pixel art procedural em Python com `tools/pixkit.py` (versão objetos: `Frame(w, h)`, padrão 128×128). **NÃO editar o pixkit.**
- Referências obrigatórias para olhar antes de desenhar (abra as imagens):
  `../Zumbis da Lua de Sangue/sprites/errante.png`, `../Zumbis da Lua de Sangue/anims/errante_comum.png`,
  `../Herói e Recrutas da Lua de Sangue/heroi/preview_equip.png`, `../Mapa do Marco Zero/assets/MO-02_poste.png`.
- Câmera: top-down 3/4 (vê a frente e um pouco do topo), luz de cima-esquerda (lua), sombra roxa de baixo-direita,
  contorno escuro de 1 px (o `F.part` já faz tudo isso). Detalhe alto: muitas partes pequenas, marcas, rebites,
  desgaste, ferrugem, sangue seco, remendos. Nada de formas lisas grandes sem detalhe. Use `tex=` para textura.
- Escala: o herói tem ~80 px de altura num quadro de 128. Um tile do abrigo = 128 px de largura.
- Chão: objetos de mapa apoiam a base em `gy` (ex.: 112 num quadro de 128) e usam `shadow_layer(...)` de sombra.
- Mundo pós-apocalíptico brasileiro (Recife/Marco Zero), noite da Lua de Sangue. Vermelho-lua `#c8323a` é o acento.
- Raridade: comum `#b9b0a0`, incomum `#4fb06a`, raro `#4a8fe0`, lunar/épico `#c8323a` com dourado `#f2c230`.

## Tamanhos de quadro
| Tipo | Quadro (w×h) |
|---|---|
| Objeto de mapa pequeno (lixeira, barril, bomba, baú, item no chão grande) | 128×128 |
| Ícone de item / HUD | 64×64 |
| Carro, construção 2×1 | 256×192 |
| Construção 2×2 | 256×256 |
| Construção 1×1 | 128×160 (sobra em cima para telhado/fumaça) |
| UI larga (barras, caixa de diálogo) | livre, múltiplo de 8 (ex.: 256×48, 512×144) |
| FX grandes (feixe, explosão, cúpula) | 128×128, 192×192 ou 256×128 conforme o efeito |

## Saída de cada asset
- `sprites/<id>.png`: **tira horizontal** de quadros do mesmo tamanho (`pixkit.strip(frames)`), cada quadro = um
  estado ou um passo de animação. Para muitas variações (níveis × estados) pode usar `pixkit.grid(frames, cols)`
  e declarar `cols`.
- O `id` é único no projeto todo: use o prefixo do seu grupo (ex.: `vas_geladeira`, `con_serralheria`).

## Documentação PRIMEIRO
Antes de desenhar, escreva a descrição detalhada de cada objeto no manifesto do grupo `docs/<grupo>.json` (pt-BR).
Depois desenhe seguindo a descrição. No fim, atualize a doc se algo mudou.
```json
{"grupo": "vasculhar", "titulo": "Contêineres de vasculhar", "ordem": 3,
 "resumo": "1-2 frases do grupo",
 "itens": [
  {"id": "vas_geladeira", "nome": "Geladeira", "categoria": "Vasculhar",
   "mecanica": "Vasculhar (VAS-01, VAS-09, VAS-14..20)",
   "conceito": "3-6 frases bem detalhadas: o que é, história no mundo, forma, materiais, desgaste, como lê no jogo",
   "partes": [{"parte": "Porta", "descricao": "forma, tamanho em px, cores, detalhes, o que muda por estado"}],
   "paleta": [{"nome": "Esmalte branco sujo", "hex": "#d8d2c2"}],
   "arquivo": "sprites/vas_geladeira.png", "fw": 128, "fh": 128, "cols": 4,
   "quadros": ["fechada", "vasculhando 1", "vasculhando 2", "aberta (vasculhada)"],
   "anims": [{"nome": "vasculhando", "quadros": [1, 2], "dur": [120, 120], "loop": true}],
   "uso": "como o jogo usa: âncora/pivô, gy, camada, o que é transformação em tempo real (wobble/squash) e não sprite"}
 ]}
```
- `quadros`: um rótulo por quadro, na ordem da tira/grade. `cols` = quadros por linha (na tira = total).
- `anims` (opcional): sequências para a página animar (índices dos quadros + duração em ms).

## Ferramenta
- Um script por grupo: `tools/obj_<grupo>.py` que gera TODOS os PNGs do grupo. Rodar: `python obj_<grupo>.py`.
- Rode `python checar.py <grupo>` no fim: valida o JSON e o tamanho dos PNGs.
- Confira visualmente: abra os PNGs gerados (ferramenta Read de imagem), também uma versão ampliada 3× se precisar
  (`Image.resize(..., Image.NEAREST)` salva em `tools/_prev_<id>.png` e apague depois). Itere até ficar bonito.
- Não mexa em arquivos de outros grupos nem em `index.html`/`data.js` (o orquestrador monta a página).

## Construções: escada de materiais (compartilhada — use exatamente estas cores)
Grade de cada construção: **linhas = estado** (intacta, danificada, destruída), **colunas = nível 1..5** → `cols: 5`,
15 quadros, rótulos `"N1 intacta" ... "N5 intacta", "N1 danificada" ..., "N1 destruída" ...`.
O tamanho na grade do abrigo NÃO muda entre níveis, só o material/detalhe (reconhecível de longe).

| Nível | Material | Cores |
|---|---|---|
| 1 Lona e sucata | lona verde remendada, lona azul caída, cordas, estacas tortas, chapas de sucata | lona `#5f7a4a` `#4a6139`, remendo `#8a7a52`, lona azul `#3f6a8c`, corda `#b59a62`, estaca `#8a6a42`, ferrugem `#8a4e2e`, sucata `#6b6a66` |
| 2 Madeira | tábuas verticais com pregos, ripas no telhado, paliçada, barril de madeira, banco de tronco | tábua `#9a6a3c` `#7d5430`, escura `#5a3a22`, prego `#c9c3b0`, ripa `#8b5e34` |
| 3 Pedra | blocos cinza com argamassa, telha de barro, chaminé de pedra, cisterna, ameias | pedra `#8e8a84` `#77736e`, argamassa `#b8b0a0`, telha `#b5562e` `#8f3f22` |
| 4 Tijolo e metal | tijolo vermelho com faixas de metal rebitado, chapa ondulada, lâmpada acesa, caixa-d'água, arame farpado | tijolo `#a5432e` `#86351f`, rejunte `#c9b8a0`, metal `#7d848c`, rebite `#c9ced4`, chapa `#8d969c` `#6b747a`, lâmpada `#ffd36a` |
| 5 Lua de Sangue | pedra escura com acabamento dourado, ardósia preta com cumeeira dourada, runas vermelhas brilhando, bandeira e fogo vermelhos | pedra `#2e2836` `#3c3446`, dourado `#f2c230` `#b8861a`, ardósia `#1c1822`, runa `#c8323a` brilho `#ff5a5a` |

- **Danificada**: rachaduras pretas, manchas de fuligem `#2a2228`, uma ou duas tábuas/peças soltas, fumaça cinza e foguinho laranja pequeno. Produção −50%.
- **Destruída**: monte de escombros DO MATERIAL DAQUELE NÍVEL (lona rasgada / tábuas quebradas / blocos / tijolos e chapas / pedra escura e dourado), vigas queimadas `#2a1a12`, fumaça. Ocupa a mesma base.
- Sombra no chão e base apoiada em `gy` = altura do quadro − 12.
