# Ficha · A Passista (mini boss da Lapa, arena `circo`)

## Conceito
Destaque de escola de samba que nunca saiu da avenida: a Lua de Sangue pegou a passista no meio do desfile e ela
continua sambando, agora morta. Alta, estatuária (porte de mini boss), salto alto, esplendor de plumas nas costas
maior que ela. Tudo que era brilho virou resto: plumas quebradas, lantejoulas caindo, maquiagem borrada.
Design próprio: nenhuma escola, enredo ou pessoa real; cores e ornamentos inventados.

Referências estudadas (`referencias/zumbis-rio/passista/`): 01-01 (coroa-escudo dourada com gotas de strass e raios,
plumas vermelhas/verde-escuras listradas, colar de pedras), 04-07 e 04-09 (porta-bandeira: corpo inteiro bordado de
strass, esplendor em leque atrás dos ombros, saia volumosa de plumas), 01-03 (passistas: sandália prateada de tiras
até o tornozelo, franjas azuis no quadril, maiô), 01-04 (asas/esplendor como silhueta que dobra a largura),
02-10 (fantasia de museu: camadas de franja metálica e recortes dourados), 01-12 (ala com adereços e franjas).
Cosmic Invasion (091, 079): chefe ocupa ~45% da altura da tela, silhueta enorme, contorno escuro, placas de luz.

## Aparência
- **Silhueta**: corpo esguio (~165 u até a coroa) + leque de 15 plumas longas + 11 médias nas costas (≈200 u
  no topo, ≈250 px em 960×540). Leque abre ~200° (até 230° no giro), duas plumas quebradas penduradas.
- **Esplendor**: placa dourada em arco com pedras, anel de marabu branco sujo, plumas longas alternando
  rosa desbotado / dourado-ocre / verde-água, com barbelas, rasgos (bordas comidas) e pontas caídas.
- **Coroa**: escudo dourado alto com pedra central verde-água, borda de pedras, 5 raios com gotas de strass,
  penachos curtos atrás. Cabelo crespo volumoso escuro saindo por baixo.
- **Fantasia de corpo inteiro**: maiô bordado de mangas longas (luvas bordadas até a mão) em fúcsia, com V de
  bordado dourado, cinto de pedras, gola/colar de pedras com gotas; malha (meia-calça) cor de pele em toda a perna,
  rasgada no joelho mostrando a pele morta. Nada de nudez.
- **Saia de franjas**: cinto dourado no quadril e ~16 fios de franja dourada/fúcsia com contas na ponta; balança
  com o samba e abre na horizontal no giro.
- **Sandália de salto**: prata, salto fino, plataforma, tiras até o meio da canela.
- **Pele zumbi**: cinza-oliva fria, olheiras roxas, sombra de glitter borrada, boca aberta com dentes, olho brilhando.

## Paleta
| material | normal | fúria |
|---|---|---|
| maiô | fúcsia `#d23c8c` → `#40103a` | igual, mais escuro |
| bordado/coroa | ouro `#f2c84a` → `#5e3a14` | igual |
| plumas | rosa `#e486b8`, ocre `#e0a04a`, verde-água `#4cb4a8` (desbotadas) | carbonizadas: violeta `#7a5ac8`, azul `#4a6ad0`, cinza-lilás |
| chama | — | **chama lunar** branco → ciano `#7ac8ff` → azul `#3a5ae0` |
| pele | `#94a296` / sombra `#2e3446` | mais pálida/arroxeada |
| olho | amarelo-verde `#b8e040` | rosa-vermelho `#ff4a6a` |
| rim | `#ffe0f0` | `#a8e0ff` |

## Animações
| anim | quadros | eventos | nota |
|---|---|---|---|
| idle | 8 | — | samba no pé, ombros/plumas balançam |
| walk | 8 | — | passo curto no salto, quadril |
| intro | 12 | — | WARNING: entra sambando, abre o esplendor, pose de destaque |
| spin (giro de plumas) | 12 | warn 0–2, hit 5 (+8 na fúria) | gira (espelha o corpo), anel de plumas |
| dazed (tonta) | 8 | — | cambaleia, plumas caídas (loop 1,5 s) |
| stomp (pisão de salto) | 9 | warn 1–3, hit 4 | joelho alto, salto crava, racha o chão |
| rain (chuva de lantejoulas) | 10 | warn 1–3, throwAt 5 | junta brilho nas mãos, lança em leque |
| dash (avanço sambando) | 10 | warn 0–1, run 2–7 | atravessa a faixa sambando |
| summon (chama a ala) | 9 | callAt 5 | ergue o braço e chama 2 Malandros |
| rage | 8 | — | plumas pegam chama lunar |
| hurt | 4 | — | |
| death | 12 | — | gira, desaba pra trás, coroa cai, plumas espalham |
| xPool / xBottle | 2 / 2 | adereços | poça de lantejoulas / rajada voando |

## Golpes
| golpe | aviso | dano | alcance | cd (normal/fúria) | efeito |
|---|---|---|---|---|---|
| Giro de plumas | círculo r 70 por 3 quadros (~0,4 s) | 1,0× (+0,7× 2º giro na fúria) | área r 70 | 6 / 4,5 s | empurra 34 px; depois fica **TONTA 1,5 s** (dano ×1,6) |
| Pisão de salto | círculo r 36 no ponto do pisão (até 70 à frente) | 1,2× | r 36 (+anel r 64 0,4× na fúria) | 3 / 2,4 s | derruba num ATORDOADO 0,5 s |
| Chuva de lantejoulas | 3 círculos (5 na fúria) em leque | 0,35× por rajada | leque de 40–150 à frente | 7 / 5 s | poça de lantejoulas 4 s: lentidão 25%; acerto direto **OFUSCADO** 0,5 s |
| Avanço sambando | faixa até a borda | 1,1× | faixa da linha | 5 / 3,5 s | empurra 22 px |
| Chama a ala | — | — | — | 1×/fúria (+1 se a ala morrer) | 2 `malandro` nas laterais |

## Fases
- **Normal (100–50%)**: giro, pisão, chuva, avanço. Circula a ~60 px do alvo.
- **Fúria (<50%)**: plumas em chama lunar, 1,3× mais rápida, cd menores, giro duplo, pisão com onda,
  5 rajadas. Logo após a animação de fúria chama a ala (2 Malandros); chama de novo uma vez se a ala cair.

## Fraqueza
Depois do giro ela fica **TONTA 1,5 s** (dano ×1,6, estrelas na cabeça): fuja do giro e bata. O pisão também deixa
uma janela curta (recupera em 4 quadros).

## Status
hp 3400 · dmg 28 · xp 130 · drop `pecas: 3` · ax 170 · G 222 · top 196 · w 30
