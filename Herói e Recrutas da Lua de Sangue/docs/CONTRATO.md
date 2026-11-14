# Contrato dos assets — Herói e Recrutas

Pasta: `Herói e Recrutas da Lua de Sangue/`

## Motor
- `tools/pixkit.py` — motor de pixel art (o mesmo dos pets). NÃO editar.
- `tools/humano.py` — esqueleto humano compartilhado. NÃO editar (todos dependem das mesmas juntas).
  Para mudar pose, use `adjust(P)`; para mudar desenho de uma parte, passe `draw={'camada': fn}`.
- Vista 3/4 de frente virada para a direita (mesma câmera dos zumbis). Quadro 128 px, chão G=112.
- Ombro/mão "f" = lado direito da imagem = mão da arma/ferramenta, desenhada por cima da roupa.

## Folhas
- Recrutas: 1024×768, linhas `idle 4, walk 8, attack 6, hurt 4, death 6, special 6` (igual aos zumbis).
- Herói: 1024×1024, as mesmas 6 linhas + `attack_fire 6` (linha 6) + `attack_knife 6` (linha 7).
  `humano.HROWS`, `humano.HNFR`, `humano.HDUR`.
- Durações em `humano.HDUR`.

## Camadas do herói (ordem de pintura)
`shadow, hair_back, body, face, pants, shoes, shirt, jacket, bag, arm, shirt_arm, jacket_arm, beard, hair, head, acc, weapon, fx`

Cada camada = uma folha PNG 1024×1024 só com aquela camada (resto transparente), com as mesmas juntas do
`humano.pose(row, i, body)`.
- **Camadas tingíveis** (`tint: true`): desenhadas em BRANCO/cinza claro (cor base `#ffffff`). A página pinta por
  multiplicação com a cor escolhida (pele, cabelo, camisa, calça, jaqueta). A sombra roxa e o contorno escuro do
  pixkit continuam funcionando.
- **Camadas fixas** (`tint: false`): já coloridas (rosto/olhos, armas, chapéus, mochilas, acessórios, calçados).
- Tinta de dano (flash/red) e rotação do desmaio são aplicadas em cada camada igual (use `humano.finish` sem sombra
  ou `pixkit.compose(F, tint=P['tint'], rotate=P['rotate'])`). A sombra do chão vai numa camada própria `shadow`.

## Manifesto
Cada grupo do herói escreve `heroi/<grupo>.json`:
```json
{"grupo":"cabelos","itens":[
  {"id":"curto","nome":"Curto","camada":"hair","arquivo":"heroi/hair_m_curto.png","tint":true,"corpo":"m","cor_padrao":"#1d1410","opcao":"hair"},
  ...]}
```
`opcao` = qual escolha do criador controla o item: `body, skin, hair, hair_color, shirt, pants, jacket, beard,
weapon, head, bag, feet, armor, acc`. `corpo` = `m`, `f` ou `any`.

## Documentação
Antes de desenhar, cada agente escreve a doc em `docs/<id>.json` (pt-BR):
```json
{"id":"...","nome":"...","tipo":"recruta|heroi",
 "conceito":"2-3 frases",
 "partes":[{"parte":"Cabeça","descricao":"forma, tamanho em px, cores, o que mexe"}, ...],
 "paleta":[{"nome":"...","hex":"#rrggbb"}],
 "animacoes":{"idle":"...","walk":"...","attack":"...","hurt":"...","death":"...","special":"..."},
 "especial":"nome do especial", "ferramenta":"...", "fala":"...",
 "eventos":{"walk":{"0":"passo","4":"passo"}, ...}}
```
