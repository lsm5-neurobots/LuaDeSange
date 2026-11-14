# Ficha: Zumbi Malandro (variante local da Lapa · Rio de Janeiro)

**id** `malandro` · **arte** `MALANDRO` (`art-src/zombies/malandro.js`) · **IA** `src/expedition/ai/malandro.ts` · **mapa** `lapa`
Porte comum, cerca de 130 px na tela (123 un. cruas até o topo do chapéu; 110 sem ele). Design próprio, inspirado no boêmio da roda de samba do Rio antigo. Não é figura religiosa.

## Referências usadas (`referencias/zumbis-rio/malandro/`)
- Chapéu panamá: `02-09` (catálogo do Met: copa com vinco, fita preta larga, aba de tamanho médio), `02-12`, `02-06`.
- Sapato bicolor: `03-10` (branco com biqueira e calcanhar de verniz preto), `03-07` (spectator marrom/branco).
- Camisa listrada: `04-07` (listras finas), `04-11`.
- Roda de samba: `05-02` (roda, gente em volta, chapéu de palha na plateia).
- Rio antigo: `07-02` (Av. Rio Branco, ternos claros e chapéus), `07-12` (Arcos).
- Navalha: `08-04` (lâmina de ponta quadrada, cabo claro de osso).
- Direção de arte: `marvel-cosmic-invasion/003`, `012` (contorno escuro, rim light, sombreado em placas, smear nos golpes).

## Aparência
- **Silhueta**: alto e magro, postura ereta com o peito estufado (o oposto dos zumbis curvados). Chapéu tombado "de banda" sobre o olho, paletó comprido e quadrado até o meio da coxa, calça larga vincada e sapato fino. Dá pra reconhecer só pela sombra: chapéu de aba + paletó comprido + navalha na mão baixa.
- **Terno de linho branco**: paletó de ombro largo, aberto, com lapela larga dobrada e bolso com aba no quadril. Linho amassado (dobras no cotovelo, no peito e na barra), manchas de barro (marrom) na barra e na manga, respingos de sangue no peito e um rasgo nas costas que mostra as costelas. A manga de trás está rasgada no antebraço e deixa ver a pele podre com veias.
- **Camisa de seda listrada** (listras finas cor de vinho sobre creme) na abertura do paletó, com um rasgo na barriga e um cinto escuro de fivela dourada. Lencinho vermelho no bolso do peito.
- **Lenço de seda dourado** amarrado no pescoço, com o nó e duas pontas soltas balançando no peito.
- **Chapéu panamá** de palha creme: copa com vinco no meio, fita preta com laço atrás, trama de palha, buraco e palha desfiada na aba, mancha de barro. Na Lua de Sangue a fita fica encharcada de sangue.
- **Sapato bicolor**: gáspea branca, biqueira e calcanhar de verniz preto com brilho, sola fina, cadarço escuro, respingo de barro.
- **Navalha**: cabo curvo de osso com pino de aço e lâmina larga de ponta quadrada. O fio está sujo de sangue e o dorso é polido. A lâmina dobra no pino (abre no alerta).
- **Rosto**: pele cinza-esverdeada, rosto fino, cabelo liso com brilhantina e risca (aparece quando joga o chapéu), costeleta, bigode fino, sobrancelha arqueada, olho meio fechado (cara de deboche), cicatriz de navalha costurada na bochecha, **dente de ouro**, **palito no canto da boca**, cavanhaque ralo. Anel de ouro na mão da navalha.

## Paleta por forma
| Material | Comum | Enluarado | Plenilunar |
|---|---|---|---|
| Pele | cinza-esverdeada `#cbd8d0 → #36404c` | lilás-azulada `#dcdcff → #3c3a76` | carne quente `#ffcaa6 → #5e1e36` |
| Terno | linho branco `#fffbf0 / #ece4cf / #b4a88f / #6e6258` | linho frio `#eceefc → #47456f` | linho encharcado de sangue `#f4dcc6 → #53303a` + manchas grandes |
| Listras | vinho `#ec6c5e → #451327` | violeta `#c896d8 → #382054` | vinho escuro `#7c2a34 → #240a12` |
| Lenço | dourado `#ffe47c → #5f3519` | ciano `#c8f8ff → #1e4a7a` | laranja `#ffd47c → #63231b` |
| Panamá | palha creme `#fff3ca → #67563f` | palha fria `#eef4ff → #4b5179` | palha queimada `#ffe4b2 → #5f3b33`, fita vermelha de sangue |
| Brilho (olhos/veias/fio) | — | ciano `#7af4ff` | laranja `#ffb43a` |
| Luz de recorte (rim) | `#d8e4f4` | `#9ff6ff` | `#ffb46a` |

No enluarado aparecem rachaduras brilhando nas costas, no fio da navalha e no chapéu. No plenilunar saem espinhos de osso do rasgo das costas e há mais sangue no peito e no chapéu.

## Animações (nomes do motor)
| anim | quadros | descrição |
|---|---|---|
| `idle` | 8 | gingado parado: balança o peso, ombro rola, gira a navalha no punho |
| `walk` | 8 | andar malemolente (ombro gingando, quique leve, braços soltos) |
| `alert` | 7 | ajeita o chapéu de banda e abre a navalha com um estalo (rastro) |
| `attack` | 10 | **navalhada em sequência**: corte descendente, corte subindo de revés e estocada avançando (dano nos quadros 3, 5 e 8) |
| `backhand` | 7 | revés de navalha (molde ZREACT `swipe`), também usado como contra-ataque depois da ginga |
| `rasteira` | 9 | finta, agacha com a mão no chão e varre a perna rente ao chão (rastro + poeira; dano no quadro 5) |
| `open` | 8 | **aberto**: levanta, bate a poeira do terno e ajeita o chapéu (a fraqueza) |
| `ginga` | 7 | esquiva de lado: tomba o corpo pra trás com os braços abertos e volta gingando |
| `hatThrow` | 10 | tira o chapéu, arma, arremessa (quadro 3), espera sem chapéu (cabelo com brilhantina), pega (quadro 8) e recoloca |
| `hurt` / `hurtB` | 4 / 4 | dano na cabeça (chapéu sacode) / dano na barriga (dobra) |
| `fall` / `getup` | 6 / 6 | derrubado / levanta batendo a poeira |
| `death` | 8 | o chapéu voa pra trás e rola no chão enquanto ele cai de joelhos e de cara |
| `tumble` / `grabbed` | 4 / 4 | voando / agarrado (ZREACT) |
| `xHat` | 4 | adereço: chapéu girando no ar (laço muda de lado). O motor desenha como ator extra |

Total: 16 animações (110 quadros por forma, 330 nas 3 formas) + adereço de 4 quadros.

## Golpes
| Golpe | Aviso | Dano | Alcance | Recarga | Efeito |
|---|---|---|---|---|---|
| Navalhada em sequência | antecipação com o braço alto (150 ms) | 3 cortes, ≈1,15× o dano base no total | 36 px | 1,4 s | avança no 3º corte (estocada) |
| Revés de navalha | braço armado atrás | 0,8× | 36 px | 2,4 s | empurra 12 px; serve de contra-ataque depois da ginga |
| Rasteira | **faixa no chão** + finta (390 ms) | 0,7× | 8–48 px | 6 s | **derruba** o lutador (fica caído e levanta); depois o Malandro fica ABERTO |
| Chapéu arremessado | tira o chapéu e arma o braço (390 ms) | 0,6× por passada | 40–84 px de distância; o chapéu vai até ~88 px e volta | 7 s | bumerangue: acerta na ida e na volta (no máximo 1× cada) |

## Comportamento tático
- Vaga até ver o alvo (230 px), faz o alerta e entra na tática de horda (cerco/revezamento) a 21 px/s, parando a 28 px.
- Encostado: navalhada ou revés. Na meia distância (40–84 px): chapéu. Na faixa do alvo e perto: rasteira com aviso.
- **Ginga**: quando leva um golpe **de frente**, tem chance de esquivar: 30% no comum, 35% no enluarado e 40% no plenilunar (laser: metade). Ele dá um passo de lado (troca de faixa), não leva dano e, se o alvo continua perto, responde com revés ("CONTRA!"). **De costas nunca esquiva.** A ginga tem recarga de 2,2 s, então um combo rápido de frente acaba entrando. Não ginga no meio de um golpe, aberto, tonto, caído ou agarrado.
- Se for interrompido com o chapéu no ar, o chapéu cai (some numa poeira).

## Fraqueza
**Depois da rasteira fica aberto**: cerca de 1,6 s ajeitando o terno, sem atacar e sem ginga, e por 1,8 s leva **+30% de dano**. Também é vulnerável **por trás** (lá a ginga não funciona). Dica pro jogador: espere a rasteira (o aviso no chão), saia da faixa e bata enquanto ele bate a poeira do paletó.

## Status (`data/zombies.ts`)
`ax 80 · G 150 · top 122 · w 16 · hp 95 · dmg 14 · xp 9 · drop pano 30%`. A escala por mapa e arena vem de `data/balance.ts`.
