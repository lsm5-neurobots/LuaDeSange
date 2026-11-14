# Expansão 2 — elenco (fonte única para todos os agentes)

Pedido do usuário (2026-11-12): **5–6 zumbis novos por mapa** (o mapa tem 9–12 tipos no total; o resto é reaproveitado de outros mapas,
com o mesmo id/nome — nunca clonar design com nome novo). Ordem: **1) descrição/ficha → 2) ~100 referências por mapa e por zumbi → 3) arte/dados**.
Direção de arte = Marvel Cosmic Invasion (ver `jogo/ART_DIRECTION.md`), designs sempre nossos e brasileiros.

Critério adotado: **6 novos por mapa = 4 comuns + mini boss + chefe**.

## Mapas já existentes (completar até 6 novos)

| Mapa | Já tem (novos) | Entram agora (comuns) |
|---|---|---|
| Olinda | gritador, barrigudo, saltador, chorona (mini), meianoite (chefe) | **frevista** — passista de frevo com sombrinha (gira a sombrinha que rebate projétil, passo do frevo em zigue-zague) |
| Pelourinho | estalador, percussionista, vendedorfitas (mini), ascensorista (chefe) | **baiana** — baiana do acarajé (tabuleiro, panela de dendê fervendo deixa poça que queima); **turista** — turista com câmera (flash que ofusca o squad, foge e fotografa) |
| Ver-o-Peso | blindado, barqueiro, erveira (mini), estivador (chefe) | **peixeiro** — avental de borracha, facão, arremessa peixe (chão escorregadio); **acaizeiro** — carregador de paneiro de açaí (rasteira com o paneiro, poça roxa que deixa lento) |
| Lapa | malandro, passista (mini), maquinista (chefe) | **seresteiro** — violão, serenata que adormece/atordoa em área, quebra o violão de perto; **garcom** — garçom de boteco, bandeja que arremessa copos em leque, desvia girando; **grafiteiro** — lata de spray: nuvem que cega, marca no chão que atrai zumbis |

## Mapas novos

### Floresta Amazônica (Manaus → floresta) — `amazonia` · nível 22 · requer Lapa
Áreas (12, proposta): porto de Manaus (balsas, palafitas), mercado Adolpho Lisboa, Teatro Amazonas, Encontro das Águas (barco), comunidade ribeirinha,
igarapé, floresta de terra firme, samaúma gigante, seringal, garimpo (clareira lamacenta), igapó (floresta alagada), arena do chefe na várzea.
Animais predominantes a estudar: onça-pintada, sucuri, jacaré-açu, boto-cor-de-rosa, piranha, harpia, bugio/guariba, poraquê, ariranha, macaco-prego, arara.

| id | Nome | Tipo | Resumo |
|---|---|---|---|
| seringueiro | Zumbi Seringueiro | comum (humano) | facão de sangria, balde de látex: jato de látex que gruda (prende), lamparina na testa |
| garimpeiro | Zumbi Garimpeiro | comum (humano) | bateia e picareta; lama de mercúrio (poça venenosa), cava e surge embaixo do squad |
| bugio | Bugio Zumbi | comum (animal) | macaco guariba: urro que chama o bando, salta das árvores, arremessa frutos/galhos |
| piranha | Cardume de Piranhas | comum (animal) | cardume que "nada" na lama/água rasa em bando (3–5 pequenas), mordidas rápidas, sangramento; frágeis |
| onca | A Onça-Pintada | mini boss (animal) | emboscada (some no mato e reaparece), bote longo com aviso, patada, rugido que atordoa |
| cobragrande | A Cobra-Grande | chefe (animal/lenda) | sucuri gigante da lenda amazônica: constrição que prende um membro, bote, cauda varrendo, mergulho e ataque por baixo; fúria com olhos de lua |

Reaproveitados (proposta, 4–6): errante, corredor, cuspidor, rastejante, saltador, barqueiro.

### Pantanal (MS/MT) — `pantanal` · nível 26 · requer Amazônia
Áreas (12, proposta): Transpantaneira (estrada de terra + pontes de madeira), porteira/fazenda pantaneira, curral, campo alagado, corixo,
baía, salina, cordilheira (capão de mato), ninhal de tuiuiús, Porto Jofre / chalana, ponte quebrada, arena do chefe na beira do rio Cuiabá/Paraguai.
Animais predominantes a estudar: jacaré-do-pantanal, onça-pintada, capivara (é PET no jogo: não usar como zumbi), tuiuiú, ariranha, sucuri-amarela,
piranha, queixada/cateto, tamanduá-bandeira, cervo-do-pantanal, arara-azul, gado pantaneiro.

| id | Nome | Tipo | Resumo |
|---|---|---|---|
| peao | Zumbi Peão Pantaneiro | comum (humano) | chapéu, laço que puxa de longe, berrante que enfurece o gado/acelera zumbis |
| tuiuiu | Tuiuiú Zumbi | comum (animal) | ave grande: voo rasante (alvo aéreo), bicada longa que perfura defesa |
| queixada | Queixada Zumbi | comum (animal) | porco-do-mato em bando: investida em grupo em linha, presas que derrubam |
| ariranha | Ariranha Zumbi | comum (animal) | lontra gigante: sai da água, mordida rápida em sequência, guincho que chama o bando |
| tamandua | O Tamanduá-Bandeira | mini boss (animal) | ergue nas patas traseiras (aviso), abraço com garras que prende, golpe de garra em arco, língua que puxa |
| reijacare | O Rei Jacaré | chefe (animal) | jacaré gigante: mordida com aviso, giro da morte (prende e gira), rabada em área, submerge e emerge em outro ponto |

Reaproveitados (proposta, 4–6): errante, corredor, rastejante, piranha, onca (como inimigo de arena forte, não mini), blindado.

## Regras
- Ids acima são finais (dados, arte `art-src/zombies/<id>.js`, refs `referencias/zumbis-<mapa>/<id>/`).
- Animais zumbis: anatomia real (refs de fotos), corrupção da Lua de Sangue (olhos de lua, carne exposta, musgo/fungo), 3 formas comum/enluarado/plenilunar
  (chefes: normal/fúria). Nada de personagens de outras franquias.
- Pastas de referência: mapas `referencias/amazonia/`, `referencias/pantanal/`; zumbis `referencias/zumbis-<mapa>/<id>/` (mapa = olinda, pelourinho, veropeso, lapa, amazonia, pantanal).
