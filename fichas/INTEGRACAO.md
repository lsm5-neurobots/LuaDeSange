# Integração pendente (orquestrador)

## turista (pronto)
- zombies.ts: ax 80 · G 150 · top 118 · w 14 · hp 55 · dmg 8 · xp 7 · drop {sucata:0.25} · raro · mapa pelourinho · art TURISTA · ai turista
- desc: "Visitante do Pelourinho preso no instante da foto. Cega com o flash quem olha de frente e foge de quem chega perto; quando para pra fotografar fica vulnerável, e um golpe por trás quebra a pose."
- Fora: fighter.ts/moveset.ts consultar blindMiss(w,f) (ai/turista.ts) antes de damageZ; render.ts overlay branco por w.whiteT (~0,22 s); aviso lane respeitar cor c.

## peixeiro (pronto)
- zombies.ts: ax 84 · G 152 · top 112 · w 20 · hp 105 · dmg 15 · xp 9 · drop {comida:0.3} · incomum · mapa veropeso · art PEIXEIRO · ai peixeiro
- desc: "Peixeiro do Ver-o-Peso: facão em duas, golpe de cima e peixe arremessado em linha, que deixa poça escorregadia. Saia da faixa para desviar; depois do arremesso ele abre o isopor e fica aberto (+25% de dano)."
- Opcional: poças via w.actors param de agir se ele morre; director aceitar life/r por poça.

## peao (pronto)
- zombies.ts: ax 82 · G 152 · top 116 · w 16 · hp 110 · dmg 15 · xp 10 · drop {pano:0.3} · mapa pantanal · art PEAO · ai peao
- desc: "Peão de comitiva que continua tocando a boiada depois de morto. De longe laça e puxa o lutador; com o rebanho por perto sopra o berrante e enfurece os zumbis. Logo depois de soprar fica com as mãos ocupadas: é a hora de bater."
- ai/index.ts: incluir 'berrante','laco' nos estados que não voltam depois do hurt.

## grafiteiro (pronto)
- zombies.ts: ax 80 · G 150 · top 111 · w 16 · hp 75 · dmg 9 · xp 10 · drop {sucata:0.25} · raro · mapa lapa · art GRAFITEIRO · ai grafiteiro
- desc: "Artista de rua da Lapa, de capuz, máscara e lata de spray. A nuvem de spray cega quem olha de frente e o glifo pintado no chão puxa os outros zumbis. Ajoelhado pintando leva mais dano; apague o glifo ou derrube a lata acertando ele durante a nuvem."
- Cegueira: unificar com turista (ambos f.blindUntil/blindK, w.clock) → um blindMiss compartilhado em meleeHit/shoot/fireBeam.
- strikeGlyphs(w,x,y,reach,face,area) em meleeHit/fireBeam; world.targetOf respeitar o.lure/o.lureT.

## baiana (pronto; passada extra de acabamento pedida)
- zombies.ts: ax 92 · G 154 · top 125 · w 22 · hp 100 · dmg 12 · xp 8 · drop {comida:0.3} · incomum · mapa pelourinho · art BAIANA · ai baiana
- desc: "Baiana do acarajé tomada pela Lua de Sangue: defende o ponto com o tabuleiro e arremessa dendê fervendo que deixa poça que queima. Depois de jogar a panela, fica um instante reabastecendo e aberta."
- director.ts updateProj: raio p.r ?? 18; texto p.tag ?? 'veneno'; render poça usar p.r e alpha respeitando t negativo.

## tuiuiu (pronto; polimento pedido)
- zombies.ts: ax 100 · G 166 · top 114 · w 18 · hp 70 · dmg 14 · xp 9 · drop {pano:0.25} · raro · mapa pantanal · art TUIUIU · ai tuiuiu
- desc: "A ave-símbolo do Pantanal, levantada com a lua no olho. Dá bicada longa que perfura e sangra e voo rasante em que fica imune a golpes de solo; ao pousar fica esparramado e vulnerável, e a cabeça leva mais dano de tiro."
- Melhorias: campo de origem (tiro/golpe) em damageZ; status SANGRAMENTO em fighter.ts.

## piranha (pronto)
- zombies.ts: ax 128 · G 120 · top 52 · w 56 · hp 75 · dmg 7 · xp 9 · drop {peixe:1} · mapa amazonia · art PIRANHA · ai piranha
- desc: "Cardume de piranhas-vermelhas que nada na lama e na água rasa: mordidas rápidas que fazem sangrar (acumula até 3) e salto fora d'água. Fora da poça ficam encalhadas e levam dano dobrado; ataque em área dizima o cardume."
- Opcional: World.water zonas; render menos peixes conforme vida.

## bugio (pronto)
- zombies.ts: ax 128 · G 204 · top 110 · w 22 · hp 70 · dmg 13 · xp 8 · drop {comida:0.25} · mapa amazonia · art BUGIO · ai bugio
- desc: "Guariba-vermelho da Amazônia. Desce das árvores em salto (fuja da sombra), arremessa fruto podre que ofusca e urra chamando o bando, o que acelera os zumbis perto. Bata durante o urro: leva mais dano e o urro é cancelado."
- ai/index.ts opcional: 'howl','throw','open','perch' em estados não retomados após hurt.

## queixada (pronto)
- zombies.ts: ax 100 · G 130 · top 72 · w 30 · hp 90 · dmg 12 · xp 8 · drop {comida:0.3} · mapa pantanal · art QUEIXADA · ai queixada
- desc: "Porco-do-mato do Pantanal que voltou da Lua de Sangue com o bando. Sozinho é fraco, mas o bando investe junto na mesma linha e derruba quem estiver no caminho."

## garimpeiro (pronto)
- zombies.ts: ax 84 · G 154 · top 121 · w 20 · hp 135 · dmg 17 · xp 10 · drop {sucata:0.35} · mapa amazonia · art GARIMPEIRO · ai garimpeiro
- desc: "Variante local da Amazônia: garimpeiro coberto de lama, com picareta e bateia de mercúrio. Racha o chão na picaretada, joga lama de mercúrio que envenena e ofusca, e cava pra surgir embaixo do squad: saia do círculo de terra. Ao surgir fica preso puxando a picareta, que é a hora de bater."
- Status VENENO (f.venenoUntil/venenoDmg) tickar em fighter.ts; seleção de alvo do squad ignorar isUnder(z); ondas: dupla garimpeiro/seringueiro (MAP-38).

## ariranha (pronto)
- zombies.ts: ax 112 · G 156 · top 52 · w 32 · hp 65 · dmg 9 · xp 9 · drop {comida:0.25} · mapa pantanal · art ARIRANHA · ai ariranha
- desc: "Lontra gigante do Pantanal que voltou da Lua de Sangue com a família: sai da água em periscópio, morde em rajada e guincha chamando o bando. Em área alagada mergulha e reaparece nas suas costas."
- render: pular sombra se z.hidden; moveset: não agarrar z.state==='under'. Reforços precisam w.zk[kind].

## seringueiro (pronto)
- zombies.ts: ax 80 · G 150 · top 122 · w 16 · hp 110 · dmg 16 · xp 10 · drop {pano:0.35} (latex se existir) · mapa amazonia · art SERINGUEIRO · ai seringueiro
- desc: "Seringueiro do ciclo da borracha com a lamparina ainda acesa na testa. Joga látex que gruda e deixa o chão lento, e termina no facão; depois do jato fica sem balde e abaixa pra encher, aberto."
- igniteAt(w,x,y,r) exportado p/ futura arma de fogo.
- INTEGRADOS em zombies.ts/REGISTRY: turista baiana peixeiro grafiteiro seringueiro garimpeiro bugio piranha peao tuiuiu queixada ariranha (2026-11-12). balance.test Marco Zero é instável (Date/timing), não relacionado.

## onca (polimento pedido)
- zombies.ts: ax 190 · G 222 · top 124 · w 36 · hp 4200 · dmg 32 · boss mini · xp 160 · drop {pecas:3, pano:2} · mapa amazonia · art ONCA · ai onca. Formas normal/furia (aceita comum/enluarado/plenilunar p/ arena do Pantanal).
- desc: "Mini boss da Amazônia, na samaúma. Some no mato e reaparece onde estão os olhos brilhando, armando um bote longo (cauda chicoteia: saia da faixa!). Se errar, fica ATOLADA: bata! Patada em arco e rugido que atordoa e chama Bugios. Na fúria: olhos falsos e bote duplo."
- ai/index.ts: estados não interrompíveis 'maul','stuck','vanish','hidden','appear'.

## acaizeiro (INTEGRADO)
- render.ts zFrame: FEITO (paneiro quebrado usa '~vazio').
## onca (INTEGRADO, top 110)
## frevista (INTEGRADO)
## tamandua (passada pedida) — ax 178 · G 270 · top 130 · w 36 · hp 4600 · dmg 32 · boss mini · xp 160 · drop {pecas:3} · pantanal. desc: "O Tamanduá-Bandeira se ergue nas patas de trás como aviso antes de esmagar quem estiver perto num abraço de garras. A língua comprida puxa quem foge, e se você quebrar o abraço ele fica tonto e exposto." Estados: stand,hug,claw,tongue,slam,open.
## reijacare (passada pedida) — ax 258 · G 312 · top 128 · w 64 · hp 9200 · dmg 44 · chefe · xp 520 · drop {fragmento_lunar:3} · pantanal. desc: "Chefe do Pantanal, na margem do rio Cuiabá. Jacaré-do-pantanal gigante coroado de aguapé: mordida avisada, giro da morte que prende e gira (outro lutador solta com golpe forte; depois ele fica ZONZO), rabada em área e mergulho invulnerável que emerge num ponto marcado por bolhas. Na fúria, giro duplo, onda na rabada, 2 emersões e rugido que chama piranhas." render: Warn kind 'cone' seria bom.
