# Ficha — O Maquinista do Bonde (chefe da Lapa, arena `arcos`)

Refs estudadas (`referencias/zumbis-rio/maquinista/`): bondes 06/10/18 de Santa Teresa (01-02, 01-03, 01-20), interior do
bonde 11 (01-01), Arcos com o bonde ao anoitecer (06-02), motorneiros de uniforme e quepe (03-10), controlador com
manivela e placas de resistência vermelhas (04-03), roda e cabeça da vara do trole (05-07, 05-12).
Chefes de Cosmic Invasion (078, 079): massa grande no tronco, mãos/antebraços enormes, rim light frio, 6–8 tons
por material, FX de impacto grandes e chapados.

## Aparência
- Motorneiro zumbi gigante (~3 m, **~315 px** na tela), corcunda, ombros largos, antebraços pesados.
- **Quepe** alto de copa reta, aba de verniz preto, galão de latão e distintivo genérico de **roda alada** (sem texto).
- **Uniforme verde-garrafa** de abotoamento duplo (2×4 botões de latão), gola alta, vivo vinho nas bordas,
  punhos vinho com botões, calça com faixa vinho, botas de couro preto. Cor nossa, não de empresa real.
- **Controlador** pendurado na barriga por correias de couro: tampa de alumínio, pilha de placas de resistência
  vermelho-ferrugem (como o controlador da ref 04-03), 3 lâmpadas de carga e o encaixe de latão da manivela.
- **Manivela** do controle (alavanca de ferro em L com punho de madeira e luva de engate dentada) na mão da
  frente, usada como cassetete.
- **Vara do trole** (tubo ocre com colares de aço, mola na base, corda pendurada e a cabeça com a roda de latão) na
  mão de trás, como lança/cajado; a roda vive soltando faíscas.
- **Sino** de bronze pendurado no peito por corrente.
- Rosto: queixo enorme, bigodão grisalho, bochecha rasgada mostrando os dentes, um olho âmbar aceso e outro
  leitoso, cabelo chamuscado espetado saindo do quepe (choque), queimaduras.
- **Eletricidade nas bordas**: raios curtos crepitando nos ombros, no quepe, no controlador e na roda do trole.

## Paleta
| material | normal | fúria |
|---|---|---|
| farda | verde-garrafa `#7fb89a → #0e2219` | verde apagado/roxo `#6c8a80 → #0c1414`, rasgada |
| vivo/punho | vinho `#f08a7a → #380c1a` | igual |
| pele | cinza-esverdeada podre `#c9cfae → #2f3640` | avermelhada com **figuras de Lichtenberg** brilhando |
| latão/bronze | `#fff0a8 → #4c3216` | igual |
| vara do trole | ocre `#f6e6a6 → #463418` | igual |
| controlador | placas ferrugem `#f0a080 → #3c120e`, tampa alumínio | igual |
| eletricidade | azul-ciano `#ffffff/#cdf2ff/#64baff/#2252c4` | **vermelha** `#ffffff/#ffc0b0/#ff4a3a/#a0141c` |
| olho | âmbar | vermelho |
| bonde | amarelo Santa Teresa `#fff3a0 → #6a4210`, faixa azul `#30488c` | faróis e faíscas vermelhos |

## Animações
`intro` (WARNING: desce do alto pendurado na vara do trole engatada no fio, aterrissa, toca o sino e ruge com o
trole faiscando) · `idle` 8 · `walk` 8 (stomp) · `swing` 8 · `pole` 10 · `bell` 9 · `spark` 10 · `bonde` 10 ·
`recharge` 8 (vulnerável) · `hurt` 4 · `rage` 9 · `death` 14 · adereços `xBonde` 2 (bonde de perfil ~420 px,
farol, trole com faísca, rodas soltando faísca, pingentes zumbis) e `xFaisca` 3 (raio da catenária caindo, impacto, apagando).

## Golpes
| golpe | anim | aviso | dano | alcance | recarga (normal/fúria) |
|---|---|---|---|---|---|
| Manivelada | `swing` | faixa curta 2 quadros | 0,8×dmg, empurra 18 | 0–80 px à frente | 2,4 / 1,8 s |
| Vara do trole (arco elétrico em área) | `pole` | círculo à frente 4 quadros (~0,6 s) | 1,1×dmg + CHOQUE 0,6 s | círculo r 54 a 124 px à frente (70–175 px) | 4 / 3 s |
| Badalada do sino | `bell` | círculo em volta dele (~0,45 s) | 0,5×dmg + ATORDOADO 1,3 s | r 78 em volta | 8 / 6 s |
| Faíscas da catenária | `spark` | 3 (fúria 5) círculos marcados nos lutadores | 0,8×dmg + CHOQUE 0,4 s cada | r 24 por ponto | 6,5 / 5 s |
| **Bonde sem freio** | `bonde` | faixa de chão na linha do alvo, de ponta a ponta, 1,3 s; farol vindo do lado | 1,6×dmg, arremessa pra fora da faixa | faixa ±14 px, a arena toda | 12 / 9 s |

## Fases
- **Normal** (100–50%): alterna manivelada/vara de perto, faíscas de longe, bonde quando a recarga deixa.
- **Fúria** (<50%): anim `rage` (farda rasga, eletricidade vira vermelha), golpes ×1,3, recargas menores,
  5 faíscas, **o bonde passa duas vezes** (ida e volta, a 2ª na nova linha do alvo).

## Fraqueza
Depois que o bonde passa ele encaixa a manivela no controlador e **recarrega** (`recharge`, 2,6 s, 3,2 s na fúria):
fica parado, lâmpadas de carga acendendo, **VULNERÁVEL** (dano ×1,5 pelo motor).

## Status
hp 6600 · dmg 38 · xp 380 · drop fragmento_lunar 3 (mantidos da linha original, mapa 5).
