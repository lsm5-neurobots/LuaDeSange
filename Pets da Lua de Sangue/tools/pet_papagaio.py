"""Papagaio (papagaio-verdadeiro) - pet da Lua de Sangue.
Uso: python pet_papagaio.py  (da pasta tools) -> ../sprites/papagaio.png e .json
"""
import os
import sys
import json
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

C = dict(
    green='#3fa548', dgreen='#26733a', lgreen='#86cc5c', yellow='#f2d23a', blue='#3d8fe0',
    red='#d8392c', beak='#3b3742', beak_l='#6a6470', foot='#8f8a96', ring='#ece6da',
    iris='#f08a24', band='#9a1f2c', band_d='#651220', prim='#2d5f9a', tailtip='#c4d84a',
)


def compose_xf(*fs):
    """aplica Xf da direita para a esquerda (último primeiro)."""
    class _T:
        def p(self, x, y):
            for f in reversed(fs):
                x, y = f.p(x, y)
            return (x, y)

        def __call__(self, shapes):
            return [[self.p(x, y) for (x, y) in pl] for pl in shapes]
    return _T()


def wing_open(T, sx, sy, th, L, spread=1.0, far=False):
    """asa aberta em coordenadas de tela já transformadas: ombro (sx,sy), ângulo th (graus), comprimento L.
    retorna lista de (shapes, cor, kwargs) do fundo para frente."""
    d = (math.cos(math.radians(th)), math.sin(math.radians(th)))
    # bordo de fuga aponta para a cauda: escolhemos a perpendicular com x mais negativo
    n1 = (-d[1], d[0]); n2 = (d[1], -d[0])
    n = n1 if n1[0] < n2[0] else n2
    if abs(n1[0] - n2[0]) < 0.3:   # asa quase horizontal: fuga para baixo
        n = n1 if n1[1] > n2[1] else n2
    out = []
    k = 7
    feathers = []
    for i in range(k):
        t = i / (k - 1)                        # 0 = junto ao corpo, 1 = ponta
        bx = sx + d[0] * L * (0.25 + 0.62 * t)
        by = sy + d[1] * L * (0.25 + 0.62 * t)
        # direção da pena: perto do corpo = n, na ponta = d
        w = t ** 1.6
        fx, fy = n[0] * (1 - w) + d[0] * w, n[1] * (1 - w) + d[1] * w
        fl = math.hypot(fx, fy)
        fx, fy = fx / fl, fy / fl
        flen = (11 + 9 * t) * spread
        ex, ey = bx + fx * flen, by + fy * flen
        col = C['prim'] if t > 0.55 else (C['red'] if 0.2 < t <= 0.55 else C['dgreen'])
        feathers.append((limb(bx, by, ex, ey, 6.4, 3.0), col))
    for sh, col in feathers:
        out.append((sh, col, dict(tex=0.0, light=.18)))
    # coberteiras (braço) verdes por cima
    ax, ay = sx + d[0] * L * 0.92, sy + d[1] * L * 0.92
    cov = limb(sx, sy, ax, ay, 12, 6)
    cov += limb(sx + n[0] * 3, sy + n[1] * 3, sx + d[0] * L * .7 + n[0] * 4, sy + d[1] * L * .7 + n[1] * 4, 12, 6)
    out.append((cov, C['green'], dict(tex=.3, marks=[(limb(sx, sy, sx + d[0] * 5, sy + d[1] * 5, 7, 6), C['red'])])))
    return out


def draw(F, P):
    p = dict(dx=0, dy=0, tilt=0, head=0, hdx=0, hdy=0, beak=0, eye='open', crest=0,
             wing='fold', wth=-110, wl=26, fwth=None, fwl=None, legs='stand', feet=(58, 67),
             tail=0, sy=1.0, puff=0, bob=0, eyex=None)
    p.update(P)
    pivot = (60, 100)
    B = Xf(pivot[0], pivot[1], p['tilt'], p['dx'], p['dy'], 1 + p['puff'] * .06, p['sy'])
    Hl = Xf(66, 72, p['head'] - p['tilt'], p['hdx'], p['hdy'])
    TH = compose_xf(B, Hl)

    # ---- asa de trás (aberta) ----
    if p['wing'] == 'open':
        fth = p['fwth'] if p['fwth'] is not None else p['wth'] + 12
        fl = p['fwl'] if p['fwl'] is not None else p['wl'] * .85
        sx, sy = B.p(64, 74)
        for sh, col, kw in wing_open(None, sx + 3, sy - 2, fth, fl, far=True):
            c = mix(hexc(col), NIGHT, .35)
            F.part(sh, c, **{k: v for k, v in kw.items() if k != 'marks'})

    # ---- cauda ----
    tb = Xf(54, 98, p['tail'])
    tpts = [tb.p(54, 97), tb.p(48, 105), tb.p(43, 111)]
    tsh = B(chain(tpts, 9, 8))
    tipm = B(tb(ell(43, 111, 6, 4)))
    F.part(tsh, C['green'], marks=[(tipm, C['tailtip'])], tex=.25)
    F.part(B(tb(chain([(51, 99), (45, 106), (41.5, 110)], 4, 4))), C['dgreen'], outline=False, shade=False)

    # ---- pernas ----
    if p['legs'] == 'stand':
        for i, (hxl, fx) in enumerate([(57, p['feet'][0]), (64, p['feet'][1])]):
            hx, hy = B.p(hxl, 101)
            fy = G - 1
            col = mix(hexc(C['foot']), NIGHT, .25) if i == 0 else C['foot']
            F.part(limb(hx, hy, fx, fy - 2, 4, 3.4), col)
            F.part(limb(fx, fy, fx + 5, fy + .5, 2.6, 2.2) + limb(fx, fy, fx + 4, fy - .8, 2.4, 2) +
                   limb(fx, fy, fx - 4, fy + .5, 2.6, 2), col)
            F.px(fx + 6, fy + 1, '#2a2430'); F.px(fx - 5, fy + 1, '#2a2430')
    elif p['legs'] == 'tuck':
        for hxl in (56, 61):
            F.part(B(limb(hxl, 100, hxl - 3, 106, 3.4, 3) + ell(hxl - 4, 107, 3, 2)), C['foot'])

    # ---- corpo ----
    body = ell(61, 86, 13, 19, rot=18) + ell(66, 72, 9, 8)
    belly = ell(66, 90, 7, 13, rot=18)
    scal = []
    for j in range(5):
        for i in range(3):
            scal += ell(58 + i * 5 + j * 1.5, 78 + j * 5, 1.8, .7)
    F.part(B(body), C['green'], marks=[(B(belly), C['lgreen']), (B(scal), C['dgreen'])], tex=.3)
    # coxas emplumadas
    if p['legs'] == 'stand':
        F.part(B(ell(62, 99, 6, 4)), C['green'], tex=.3)

    # ---- bandana (lenço cor de sangue) ----
    band = poly((58, 69), (72, 72), (73, 77), (58, 75))
    tri = poly((64, 75), (74, 75), (69, 84))
    F.part(B(band + tri), C['band'], marks=[(B(poly((64, 75), (74, 75), (73, 77), (64, 77))), C['band_d'])])
    F.px(*[round(v) for v in B.p(69, 79)], '#f2e6c8')
    kn = Xf(57, 71, math.sin(p['bob'] * 1.3) * 12)
    F.part(B(kn(poly((57, 70), (50, 67), (51, 72)) + poly((57, 72), (51, 76), (54, 77)))), C['band_d'])

    # ---- asa dobrada ----
    if p['wing'] == 'fold':
        wsh = ell(57, 85, 9, 15, rot=22) + limb(53, 92, 45, 106, 9, 3)
        prim = limb(52, 94, 45, 106, 8, 3)
        spec = ell(54, 92, 6, 3, rot=60)
        lines = poly((58, 84), (50, 96), (51, 97), (59, 85)) + poly((62, 86), (54, 99), (55, 100), (63, 87))
        shld = ell(62, 74, 4.5, 3.5)
        F.part(B(wsh), C['green'], marks=[(B(prim), C['prim']), (B(spec), C['red']), (B(lines), C['dgreen']),
                                          (B(shld), C['red']), (B(ell(63, 73, 2.2, 1.5)), C['yellow'])], tex=.25)

    elif p['wing'] == 'open':
        sx, sy = B.p(61, 77)
        for sh, col, kw in wing_open(None, sx, sy, p['wth'], p['wl']):
            F.part(sh, col, **kw)
        F.part(ell(sx, sy, 5, 4), C['green'], marks=[(ell(sx + 1, sy - 1, 3, 2.2), C['red']),
                                                     (ell(sx + 1.5, sy - 1.5, 1.5, 1), C['yellow'])], tex=.2)

    # ---- crista / penas da nuca ----
    c = p['crest']
    for k, (bx, by, ang) in enumerate([(62, 55, -150), (65, 52, -125), (69, 50, -100)]):
        ln = 4 + 7 * c - k * .5
        ex, ey = bx + math.cos(math.radians(ang)) * ln, by + math.sin(math.radians(ang)) * ln
        F.part(TH(limb(bx, by, ex, ey, 5, 2)), C['yellow'] if k == 2 else C['green'], tex=.2)

    # ---- cabeça ----
    head = ell(70, 61, 11.5, 10.5)
    crown = ell(69, 53, 8, 5)
    face = ell(75, 62, 6, 6)
    fore = ell(80, 55, 5, 4)
    cheek = ell(74, 68, 5, 3)
    F.part(TH(head), C['green'], marks=[(TH(crown), C['yellow']), (TH(face), C['yellow']),
                                        (TH(fore), C['blue']), (TH(cheek), C['lgreen'])], tex=.2)
    # bico
    bo = p['beak']
    up = Xf(80, 60, -bo * 8)
    lo = Xf(80, 66, bo * 28)
    F.part(TH(lo(poly((80, 65), (86, 65), (86.5, 69), (82, 71), (79, 69)))), '#2e2a34')
    F.part(TH(up(poly((79, 57), (84, 57.5), (88.5, 61), (89.5, 66), (88, 70.5), (86.5, 66.5), (83, 66), (79, 66)))),
           C['beak'], marks=[(TH(up(ell(81, 58.5, 3, 1.6))), C['beak_l'])])
    if bo > .3:
        tx, ty = TH.p(84, 68 + bo * 2)
        F.px(tx, ty, '#e06a7a'); F.px(tx - 1, ty, '#c94a5a')
    # olho
    ex, ey = TH.p(75, 61)
    if p['eye'] in ('open', 'wide', 'angry'):
        F.part(ell(ex + .5, ey + .5, 3.8, 3.8), C['ring'], shade=False, ol='#5a5048')
        eye(F, ex, ey, 'open' if p['eye'] == 'angry' else p['eye'], iris=C['iris'], r=2,
            brow='angry' if p['eye'] == 'angry' else None)
    else:
        F.part(ell(ex + .5, ey + .5, 3.6, 3.4), C['ring'], shade=False, ol='#5a5048')
        eye(F, ex, ey, p['eye'], r=2)
    return F


def frame(P, shadow=(60, 18, 95), tint=None, fx=None, rotate=None, sdx=0):
    F = Frame()
    draw(F, P)
    if fx:
        fx(F)
    sh = shadow_layer(shadow[0], shadow[1], alpha=shadow[2]) if shadow else None
    return compose(F, tint=tint, shadow=sh, rotate=rotate, dx=sdx)


def build():
    rows = {}
    # idle: pousado, cabeça balançando, respiração
    rows['idle'] = []
    for i in range(4):
        a = i * math.pi / 2
        rows['idle'].append(frame(dict(head=[0, 5, 0, -4][i], hdy=[0, 0, 1, 0][i], sy=1 + .02 * math.sin(a),
                                       dy=-.0, tail=[0, 2, 0, -2][i], bob=a,
                                       eye='closed' if i == 2 else 'open')))
    # walk: voo, 8 batidas
    wth = [-115, -95, -55, 25, 70, 90, 50, -45]
    wl = [30, 31, 30, 27, 23, 23, 26, 30]
    bobv = [2, 1, -1, -3, -4, -3, -1, 1]
    rows['walk'] = []
    for i in range(8):
        rows['walk'].append(frame(dict(tilt=58, head=-4, dx=4, dy=-26 + bobv[i], legs='tuck', wing='open',
                                       wth=wth[i], wl=wl[i], fwth=wth[i] - 18 if wth[i] < 0 else -40,
                                       fwl=wl[i] * .8, tail=-6, bob=i * .8),
                                  shadow=(64, 13 - (bobv[i] + 4) * .3, 70)))
    # attack: bicada
    att = [dict(), dict(tilt=-14, head=-22, crest=.6, dx=-3, beak=.6, eye='angry'),
           dict(tilt=22, head=18, dx=6, beak=.1, eye='angry', crest=.4),
           dict(tilt=30, head=26, dx=9, dy=1, eye='angry', crest=.5),
           dict(tilt=10, head=6, dx=3, crest=.2), dict(tilt=2, head=0)]

    def imp(F):
        impact(F, 104, 78, 8)

    rows['attack'] = [frame(a, fx=imp if i == 3 else None) for i, a in enumerate(att)]
    # hurt
    rows['hurt'] = [frame(dict(), tint='flash'),
                    frame(dict(dx=-6, tilt=-14, head=-12, eye='closed', crest=1, puff=1, wing='open', wth=-150, wl=18,
                               fwth=-125, fwl=15, beak=.6), shadow=(54, 18, 95)),
                    frame(dict(dx=-4, tilt=-8, head=-6, eye='closed', crest=.7, puff=.5), shadow=(56, 18, 95)),
                    frame(dict(dx=-1, tilt=-2, crest=.2))]

    # death: desmaio
    def stars(F, n):
        for k in range(3):
            a = n * .9 + k * 2.1
            star(F, 92 + 10 * math.cos(a), 88 + 4 * math.sin(a), r=3)

    rows['death'] = [frame(dict(), tint='flash'),
                     frame(dict(tilt=-12, head=-14, dx=-2, eye='spiral', crest=.8, wing='open', wth=-140, wl=20, fwth=-115)),
                     frame(dict(tilt=16, head=12, dx=3, dy=3, eye='spiral', wing='open', wth=-160, wl=22, fwth=-130,
                                beak=.4, feet=(56, 70))),
                     frame(dict(tilt=62, head=30, dx=8, dy=8, eye='x', wing='open', wth=-175, wl=24, fwth=-140,
                                legs='tuck', beak=.4), shadow=(66, 24, 95)),
                     frame(dict(tilt=86, head=16, dx=9, dy=11, eye='x', wing='open', wth=175, wl=26, fwth=-150,
                                legs='tuck', beak=.3), shadow=(66, 28, 95), fx=lambda F: stars(F, 0)),
                     frame(dict(tilt=90, head=14, dx=9, dy=13, eye='x', wing='open', wth=172, wl=26, fwth=-155,
                                legs='tuck', beak=.3, tail=4), shadow=(66, 28, 95), fx=lambda F: stars(F, 1))]

    # special: grito "ZUMBI!"
    def zb(F, big=False):
        bubble(F, 'ZUMBI!', 82, 28 if big else 30, sc=2)
        if big:
            arcs(F, 94, 58, n=3)

    rows['special'] = [
        frame(dict(head=-6, crest=.3, eye='wide')),
        frame(dict(tilt=-8, head=-16, crest=.7, puff=.6, wing='open', wth=-140, wl=22, fwth=-75, eye='wide')),
        frame(dict(tilt=-4, head=-8, crest=1, puff=1, wing='open', wth=-150, wl=28, fwth=-62, beak=1, eye='wide', dy=-3,
                   feet=(58, 67)), fx=lambda F: zb(F)),
        frame(dict(tilt=-2, head=-4, crest=1, puff=1, wing='open', wth=-145, wl=30, fwth=-55, beak=1, eye='wide', dy=-5),
              fx=lambda F: zb(F, True)),
        frame(dict(tilt=-4, head=-8, crest=.9, puff=.8, wing='open', wth=-148, wl=27, fwth=-65, beak=.8, eye='wide'),
              fx=lambda F: zb(F)),
        frame(dict(head=-2, crest=.4, puff=.2)),
    ]
    return rows


DATA = {
    "id": "papagaio",
    "nome": "Papagaio",
    "sub": "verdadeiro",
    "conceito": ("Um papagaio-verdadeiro brasileiro, tagarela e vigilante, que vê tudo do alto e não guarda segredo: "
                 "quando fareja uma variante rara, sai voando em círculos e berra \"ZUMBI!\" para o bando inteiro ouvir. "
                 "Visualmente é um bichinho compacto e arredondado, verde-folha com testa azul, rosto amarelo, "
                 "ombros vermelhos e um lencinho cor de sangue amarrado no pescoço."),
    "partes": [
        {"parte": "Cabeça", "descricao": "Elipse grande de ~23x21 px, quase do tamanho do peito, para ler bem em 1x. "
         "Coroa amarela (8x5 px) no topo, bochecha verde-clara sob o olho. Balança suavemente no idle e gira até 26° na bicada."},
        {"parte": "Olhos", "descricao": "Olho redondo com anel de pele nua creme (#ece6da, raio ~4 px) contornado em marrom, "
         "íris laranja (#f08a24), pupila preta e brilho branco de 2 px no canto superior esquerdo. "
         "Fecha em linha ao piscar/levar dano, arregala no grito, sobrancelha brava na bicada, espiral e X no desmaio."},
        {"parte": "Testa e crista", "descricao": "Mancha azul-celeste (#3d8fe0) na testa logo acima do bico, marca da espécie. "
         "Três penas da nuca (duas verdes e uma amarela) ficam quase escondidas atrás da cabeça e se arrepiam até ~11 px "
         "como uma crista no ataque, no susto e no grito \"ZUMBI!\"."},
        {"parte": "Bico", "descricao": "Bico curvo de papagaio, ~10x14 px, cinza-chumbo (#3b3742) com reflexo mais claro na base "
         "superior e ponta em gancho descendo abaixo da mandíbula. A mandíbula inferior é separada e abre até ~28°, "
         "mostrando 2 px de língua rosada quando grita."},
        {"parte": "Corpo", "descricao": "Tronco oval de ~26x38 px inclinado 18° para frente, verde-folha (#3fa548), "
         "barriga verde-clara (#86cc5c) e fileiras de pequenas escamas verde-escuras (#26733a) imitando penas sobrepostas. "
         "Respira esticando 2% na vertical e estufa quando assustado ou gritando."},
        {"parte": "Asas", "descricao": "Dobrada: oval verde colada ao flanco com ombro vermelho e ponto amarelo, espelho vermelho e "
         "rêmiges azul-escuras (#2d5f9a) descendo até a cauda. Aberta (~30 px): coberteiras verdes largas, secundárias vermelhas "
         "e primárias azuis em leque de 7 penas; a asa de trás aparece escurecida em roxo noturno atrás do corpo."},
        {"parte": "Pernas e pés", "descricao": "Tarsos curtos cinza-arroxeados (#8f8a96) saindo de coxas emplumadas; pés zigodáctilos "
         "com dois dedos para frente e um para trás, unhas escuras de 1 px plantadas em y=112. No voo e no desmaio os pés "
         "ficam recolhidos sob a barriga."},
        {"parte": "Cauda", "descricao": "Cauda curta e quadrada (~9 px de largura, 16 px de comprimento) apontando para trás e para baixo, "
         "verde com faixa central escura e ponta verde-amarelada (#c4d84a). Balança 2° no idle e fica reta como leme no voo."},
        {"parte": "Textura e marcas", "descricao": "Pontilhado de penas em todo o verde, luz de lua quente no alto-esquerda e sombra "
         "roxa embaixo-direita; contorno escuro de 1 px separando cabeça, asa, bandana e cauda. Paleta clássica do "
         "papagaio-verdadeiro: verde, azul na testa, amarelo no rosto, vermelho no ombro e na asa."},
        {"parte": "Acessório", "descricao": "Lenço vermelho-sangue (#9a1f2c) amarrado no pescoço, com triângulo caindo sobre o peito, "
         "dobra mais escura (#651220), um pontinho creme bordado como uma lua minúscula e duas pontas do nó atrás da nuca "
         "que balançam com o movimento."},
        {"parte": "Silhueta e pose", "descricao": "De perfil 3/4 virado para a direita, postura ereta de poleiro (~55 px de largura, "
         "~70 px de altura): cabeção redondo, bico em gancho bem destacado e cauda curta apoiando atrás. No voo vira um "
         "fuso horizontal com as asas batendo acima e abaixo do corpo, e a sombra fica pequena no chão."},
    ],
    "paleta": [
        {"nome": "Verde-folha", "hex": "#3fa548"}, {"nome": "Verde-mata", "hex": "#26733a"},
        {"nome": "Verde-broto", "hex": "#86cc5c"}, {"nome": "Amarelo-rosto", "hex": "#f2d23a"},
        {"nome": "Azul-testa", "hex": "#3d8fe0"}, {"nome": "Vermelho-ombro", "hex": "#d8392c"},
        {"nome": "Azul-rêmige", "hex": "#2d5f9a"}, {"nome": "Chumbo do bico", "hex": "#3b3742"},
        {"nome": "Laranja da íris", "hex": "#f08a24"}, {"nome": "Lenço de sangue", "hex": "#9a1f2c"},
    ],
    "animacoes": {
        "idle": "Pousado no chão. F0 neutro; F1 cabeça inclina 5° para frente e a cauda sobe; F2 pisca (olho fechado) e a cabeça "
                "desce 1 px; F3 cabeça inclina para trás. O peito estica/encolhe 2% e as pontas do lenço balançam.",
        "walk": "Voo em 8 quadros: corpo deitado 58° e erguido ~26 px do chão, pés recolhidos, cauda reta. A asa da frente vai do alto "
                "(F0–F1) passando pela horizontal (F3) até embaixo (F5) e volta (F6–F7); o corpo sobe quando a asa desce. "
                "A asa de trás acompanha atrás das costas e a sombra pequena fica no chão, encolhendo conforme ele sobe.",
        "attack": "Bicada: F0 pose de guarda; F1 antecipação — corpo pende para trás, cabeça recua 22°, crista arrepiada, bico "
                  "entreaberto e sobrancelha brava; F2 avança inclinando o corpo; F3 impacto — corpo a 30°, cabeça esticada, bico "
                  "fechado na frente com estrela de impacto; F4 recua; F5 volta à pose.",
        "hurt": "F0 clarão branco; F1 empurrado 6 px para trás, olhos fechados, penas estufadas, crista em pé e asas meio abertas "
                "de susto, bico aberto; F2 ainda recuando, asas fechadas; F3 recompõe.",
        "death": "Desmaio: F0 clarão branco; F1 cambaleia para trás com olhos em espiral e asas abrindo; F2 tomba para frente com "
                 "asas abertas e pés escorregando; F3 cai de bico, olhos em X; F4 deitado de barriga com asas espalhadas no "
                 "chão e estrelinhas girando; F5 (segurado 600 ms) deitado, asas abertas, olhos em X e três estrelas sobre a cabeça.",
        "special": "Grito \"ZUMBI!\": F0 olhos arregalados, crista levantando; F1 enche o peito, abre as asas para trás e para cima; "
                   "F2 crista toda arrepiada, bico escancarado e balão \"ZUMBI!\"; F3 pulinho de 5 px com as asas no alto e ondas "
                   "de som saindo do bico; F4 balão ainda visível, abaixando; F5 recolhe as asas e volta à pose.",
    },
    "especial": "Grito de alerta \"ZUMBI!\"",
    "eventos": {
        "idle": {"0": "respira"},
        "walk": {"0": "asa", "4": "asa"},
        "attack": {"1": "grasnado", "3": "impacto"},
        "hurt": {"0": "dano"},
        "death": {"0": "dano", "3": "queda"},
        "special": {"1": "penas", "2": "grito", "3": "grito"},
    },
}


def main():
    rows = build()
    img = sheet(rows)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, 'papagaio.png'))
    with open(os.path.join(OUT, 'papagaio.json'), 'w', encoding='utf-8') as f:
        json.dump(DATA, f, ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        img.resize((img.width * 2, img.height * 2), Image.NEAREST).save(sys.argv[1])
    print(img.size)


if __name__ == '__main__':
    main()
