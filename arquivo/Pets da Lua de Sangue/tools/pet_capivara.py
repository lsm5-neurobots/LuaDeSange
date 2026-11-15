"""Capivara (da beira do rio) - pet da Lua de Sangue.
Uso: python pet_capivara.py  (a partir da pasta tools)
Gera ../sprites/capivara.png e ../sprites/capivara.json
"""
import os, sys, json, math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *  # noqa
from pixkit import _XX, _YY

np.random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- paleta ----------------
FUR = '#8c5c36'      # pelo base
FUR_D = '#6b4428'    # pelo lado de lá / patas de trás
FUR_L = '#a87648'    # pelo claro (bochecha / barriga)
SNOUT = '#5c3a24'    # focinho
NOSE = '#2e1c14'     # narina / boca
PAW = '#4a3020'      # patas (dedos)
MEX = '#f08a1c'      # mexerica
MEX_D = '#c8641a'
LEAF = '#4f9a3a'
BAG = '#6e6a3a'      # bolsinha de lona
BAG_D = '#55522c'
CROSS = '#d8373a'    # cruz vermelha
STRAP = '#4a3a26'
HEAL = '#6fdc7a'

BCX, BCY = 56, 88     # centro do corpo


def body_xf(P):
    return Xf(BCX, 104, P.get('tilt', 0), P.get('dx', 0), P.get('dy', 0), P.get('sx', 1), P.get('sq', 1))


def leg(F, hip, paw, L, w0, w1, col, bend=1, paw_dir=1):
    hx, hy = hip
    px, py = paw
    d = math.hypot(px - hx, py - hy)
    L = max(L, d + .5)
    kx, ky = two_bone(hx, hy, px, py, L, bend)
    sh = limb(hx, hy, kx, ky, w0, (w0 + w1) / 2) + limb(kx, ky, px, py - 1.5, (w0 + w1) / 2, w1)
    F.part(sh, col, tex=.18)
    # pata: almofada achatada com dedinhos
    F.part(ell(px + 1.5 * paw_dir, py - 1.2, 4.2, 2.2), PAW, light=.15)


def draw(P, fx=None):
    F = Frame()
    B = body_xf(P)
    lie = P.get('lie', 0)

    # ---- posições dos quadris (no corpo) ----
    hips = {'fb': (38, 96), 'ff': (74, 96), 'nb': (34, 98), 'nf': (70, 98)}
    rest = {'fb': (40, G), 'ff': (77, G), 'nb': (33, G), 'nf': (70, G)}
    legs = P.get('legs', {})
    Lleg = 15.5 if not lie else 15

    def paw_of(k):
        ox, oy = legs.get(k, (0, 0))
        return (rest[k][0] + ox + P.get('pdx', 0), rest[k][1] + oy)

    # ---- pernas do lado de lá ----
    for k in ('fb', 'ff'):
        leg(F, B.p(*hips[k]), paw_of(k), Lleg, 9 if k == 'fb' else 8, 6, FUR_D, bend=1 if k == 'fb' else -1)

    # ---- corpo (barril) ----
    body = ell(BCX, BCY, 31, 16.5) + ell(34, 87, 14.5, 15.5) + ell(72, 86, 14, 14)
    belly = ell(56, 101, 24, 6)
    F.part(B(body), FUR, marks=[(B(belly), FUR_L)], tex=.28)
    # tufos de pelo grosso nas costas (riscos escuros)
    for (x0, y0, x1, y1) in [(30, 76, 33, 74), (40, 74, 43, 72), (50, 73, 53, 71), (60, 73, 63, 71),
                             (26, 86, 28, 84), (44, 80, 46, 78), (66, 78, 68, 76)]:
        a, b = B.p(x0, y0), B.p(x1, y1)
        F.line(a[0], a[1], b[0], b[1], '#6a4226')
    # alça da bolsinha (transversal)
    strap = poly((60, 71), (64, 71.5), (50, 104), (46, 103.5))
    F.part(B(strap), STRAP, light=.12, tex=0)
    # bolsinha de primeiros socorros
    bag = poly((38, 86), (54, 85), (55, 98), (39, 99))
    flap = poly((37.5, 85.5), (54.5, 84.5), (54.5, 89), (38, 90))
    F.part(B(bag), BAG, tex=.1)
    F.part(B(flap), BAG_D, light=.15)
    patch = poly((42, 90.5), (51, 90), (51.5, 97.5), (42.5, 98))
    F.part(B(patch), '#e8dcc0', light=.1, dark=.2, ol='#3a3420')
    q = B.p(46.5, 94)
    qx, qy = int(round(q[0])), int(round(q[1]))
    for dx in range(-1, 2):
        for dy in range(-3, 3):
            F.px(qx + dx, qy + dy, CROSS); F.px(qx + dy, qy + dx - 1 + 1, CROSS)
    bp = B.p(46, 87)
    F.px(bp[0], bp[1], '#d8c890')  # botão da aba

    # ---- cabeça ----
    H = Xf(80, 82, P.get('hdeg', 0), P.get('hx', 0), P.get('hy', 0))

    def HB(sh):
        return B(H(sh))

    def hp(x, y):
        return B.p(*H.p(x, y))

    # orelha de trás (lado de lá)
    ear = P.get('ear', 0)
    F.part(HB(rot(ell(78, 64, 3.2, 3.6), 78, 67, -10 + ear)), FUR_D, light=.1)
    head = poly((72, 70), (78, 64.5), (90, 63), (100, 65.5), (105, 70), (107, 77), (106, 84), (100, 88),
                (86, 89), (76, 87), (70, 81))
    cheek = ell(84, 81, 9, 6)
    snout = poly((97, 67), (102, 67), (106, 71), (107.5, 78), (106, 84.5), (99, 87), (96, 79))
    F.part(HB(head), FUR, marks=[(HB(cheek), FUR_L), (HB(snout), SNOUT)], tex=.22)
    # narina, boca
    n = hp(104, 71.5)
    F.flat([[(n[0] - 1, n[1] - .5), (n[0] + 1.5, n[1] - 1), (n[0] + 1.5, n[1] + 1), (n[0] - 1, n[1] + 1)]], NOSE)
    m0, m1, m2 = hp(106, 80), hp(103, 82), hp(99, 82)
    F.line(m0[0], m0[1], m1[0], m1[1], NOSE)
    F.line(m1[0], m1[1], m2[0], m2[1], NOSE)
    if P.get('tongue'):
        t = hp(102, 82.5)
        F.part(ell(t[0], t[1] + 1.5, 1.6, 2), '#e07a8a', shade=False, ol='#5a1a24')
    # bigode (pontinhos)
    for (x, y) in [(100, 74), (102, 76), (99, 77)]:
        q = hp(x, y)
        F.px(q[0], q[1], '#3e2618')
    # orelha da frente
    F.part(HB(rot(ell(82, 63.5, 3.4, 3.8), 82, 67, 8 + ear)), FUR, marks=[(HB(rot(ell(82.5, 63.5, 1.5, 2), 82, 67, 8 + ear)), '#4a2c1c')], light=.25)
    # olho
    e = hp(91, 69)
    ek = P.get('eye', 'open')
    if ek == 'open' or ek == 'wide':
        eye(F, e[0], e[1], ek, iris='#24140c', r=2)
        if ek == 'open' and P.get('lid', 1):
            # pálpebra preguiçosa (metade de cima)
            F.flat([[(e[0] - 2.5, e[1] - 3.5), (e[0] + 3.5, e[1] - 3.5), (e[0] + 3.5, e[1] - .4), (e[0] - 2.5, e[1] - .4)]], FUR)
            F.line(e[0] - 2, e[1] - 1, e[0] + 3, e[1] - 1, '#2a1810')
    elif ek == 'serene':
        # olho fechado curvo (sorriso)
        x, y = int(round(e[0])), int(round(e[1]))
        for (dx, dy) in [(-2, 0), (-1, 1), (0, 1), (1, 1), (2, 0)]:
            F.px(x + dx, y + dy, '#1a1010')
    elif ek == 'shut':
        x, y = int(round(e[0])), int(round(e[1]))
        for (dx, dy) in [(-2, -1), (-1, 0), (0, 0), (1, 0), (2, -1)]:
            F.px(x + dx, y + dy, '#1a1010')
        F.px(x - 2, y + 1, '#1a1010'); F.px(x + 2, y + 1, '#1a1010')
    else:
        eye(F, e[0], e[1], ek, r=2)

    # ---- pernas do lado de cá ----
    for k in ('nb', 'nf'):
        leg(F, B.p(*hips[k]), paw_of(k), Lleg, 10 if k == 'nb' else 8.5, 6.5, FUR, bend=1 if k == 'nb' else -1)

    # ---- mexerica ----
    mx = P.get('mex', ('head', 0, 0, 0))
    if mx:
        if mx[0] == 'head':
            c = hp(93 + mx[1], 58.8 + mx[2])
            ang = -P.get('hdeg', 0) - P.get('tilt', 0) + mx[3]
        else:
            c = (mx[1], mx[2]); ang = mx[3]
        draw_mex(F, c[0], c[1], ang)
    return F


def draw_mex(F, x, y, ang):
    F.part(ell(x, y, 5.2, 4.6), MEX, marks=[(ell(x + 1.5, y + 1.8, 3.5, 2.2), MEX_D)], light=.35, tex=.12)
    # cabinho e folha
    st = rot(poly((x - .5, y - 4.5), (x + .7, y - 4.5), (x + .7, y - 6.5), (x - .5, y - 6.5)), x, y, ang)
    lf = rot(ell(x + 3, y - 6, 2.8, 1.3, rot=-25), x, y, ang)
    F.part(st, '#5a3a1a', shade=False)
    F.part(lf, LEAF, light=.3)
    F.px(x - 2, y - 2, '#ffd8a0')


def shadow(P, rx=36):
    return shadow_layer(BCX + 10 + P.get('dx', 0) * .6 + P.get('pdx', 0), rx)


def out(P, fxfun=None, tint=None, alpha=1., under=None, rotate=None, shrx=36):
    F = draw(P)
    if fxfun:
        fxfun(F)
    sh = shadow(P, shrx)
    if under is not None:
        sh = over(sh, under)
    return compose(F, tint=tint, alpha=alpha, shadow=sh, rotate=rotate)


# ---------------- animações ----------------

def idle():
    fr = []
    for i in range(4):
        b = [0, 1, 1, 0][i]
        P = dict(sq=1 + .025 * b, hy=-.6 * b, ear=[0, 0, -14, 4][i], eye='shut' if i == 3 else 'open')
        fr.append(out(P))
    return fr


def walk():
    fr = []
    st = 6.0
    for i in range(8):
        ph = 2 * math.pi * i / 8
        def foot(o):
            a = ph + o
            x = -st * math.cos(a)   # pata no ar avança
            lift = max(0, math.sin(a)) * 3.5
            return (x, -lift)
        # pares diagonais: nb com ff, nf com fb
        legs = {'nb': foot(0), 'ff': foot(.25), 'nf': foot(math.pi), 'fb': foot(math.pi + .25)}
        bob = -abs(math.sin(ph)) * 1.4
        sway = 2.2 * math.sin(ph)
        P = dict(dy=bob, tilt=sway, hdeg=-sway * .6, hy=.5 * math.cos(2 * ph), legs=legs,
                 mex=('head', 0, 0, sway * 2.5), ear=3 * math.sin(ph))
        fr.append(out(P))
    return fr


def attack():
    fr = []
    poses = [
        dict(),
        dict(dx=-5, dy=2, sq=.94, tilt=-3, hdeg=12, hy=2, legs={'nf': (-2, 0), 'ff': (-2, 0)}, ear=-12,
             mex=('head', -1, 0, -10)),
        dict(dx=6, dy=-1, tilt=4, hdeg=-6, hx=2, legs={'nb': (3, 0), 'fb': (3, 0), 'nf': (9, -3), 'ff': (8, -2)},
             ear=10, mex=('head', -2, -1, -15)),
        dict(dx=10, dy=0, tilt=3, hdeg=-2, hx=3, legs={'nb': (5, 0), 'fb': (5, 0), 'nf': (12, 0), 'ff': (11, 0)},
             ear=12, eye='shut', mex=('head', -3, -3, -25)),
        dict(dx=5, dy=0, tilt=1, hdeg=4, legs={'nf': (5, 0), 'ff': (4, 0)}, ear=4, mex=('head', 1, -1, 12)),
        dict(dx=1, legs={'nf': (1, 0)}, ear=0, mex=('head', 0, 0, 4)),
    ]
    for i, P in enumerate(poses):
        def fxf(F, i=i):
            if i == 1:
                puff(F, 22, 104, 3)
                for k in range(3):
                    F.px(112, 70 + k * 2, '#f4efe6', F.fx)  # bufo
                F.px(114, 72, '#f4efe6', F.fx); F.px(113, 74, '#f4efe6', F.fx)
            if i == 2:
                for y in (70, 78, 86):
                    F.line(20, y, 30, y, '#e8dccc', F.fx)
            if i == 3:
                impact(F, 118, 76, 9)
                dust(F, 30, 108, 3)
            if i == 4:
                sparkle(F, 118, 70, 2)
        fr.append(out(P, fxf))
    return fr


def hurt():
    fr = []
    poses = [dict(eye='wide', mex=('head', 0, -1, 0)),
             dict(dx=-5, tilt=-5, hdeg=-12, hy=-2, eye='shut', ear=-18, legs={'nf': (-3, -2), 'ff': (-3, 0)},
                  mex=('head', 2, -3, 20)),
             dict(dx=-4, tilt=-2, hdeg=-6, eye='shut', ear=-10, mex=('head', 1, -1, 10)),
             dict(dx=-1, hdeg=0, eye='open', mex=('head', 0, 0, 0))]
    for i, P in enumerate(poses):
        def fxf(F, i=i):
            if i == 1:
                star(F, 96, 50, r=3)
                sparkle(F, 108, 56, 2)
        fr.append(out(P, fxf, tint='flash' if i == 0 else None))
    return fr


def death():
    fr = []
    def lie_pose(k):
        return dict(dy=7 * k, sq=1 - .12 * k, legs={'nb': (-9 * k, 0), 'fb': (-7 * k, 0),
                                                  'nf': (10 * k, 0), 'ff': (9 * k, 0)},
                    hdeg=12 * k, hy=6 * k, hx=1 * k)
    poses = [
        dict(eye='wide', mex=('head', 0, -1, 0)),
        dict(dx=-2, tilt=-6, hdeg=-8, eye='spiral', legs={'nf': (-3, 0)}, mex=('head', -3, -2, -25), ear=-10),
        dict(dx=1, tilt=5, hdeg=8, dy=2, sq=.95, eye='spiral', legs={'nb': (-3, 0), 'nf': (4, 0)},
             mex=('ground', 98, 46, 60), ear=8),
        dict(lie_pose(.6), eye='x', mex=('ground', 108, 70, 140)),
        dict(lie_pose(1.0), eye='x', tongue=1, mex=('ground', 114, 106, 200)),
        dict(lie_pose(1.0), eye='x', tongue=1, mex=('ground', 116, 106, 220)),
    ]
    for i, P in enumerate(poses):
        def fxf(F, i=i):
            if i == 1:
                star(F, 90, 54, r=2)
            if i == 2:
                star(F, 84, 54, r=2)
            if i == 3:
                dust(F, 24, 109, 3); dust(F, 92, 109, 3)
            if i == 4:
                star(F, 90, 70, r=3); star(F, 104, 66, r=2)
            if i == 5:
                star(F, 84, 68, r=3); star(F, 97, 62, r=2); star(F, 110, 68, r=3)
        fr.append(out(P, fxf, tint='flash' if i == 0 else None))
    return fr


def ring(k, alpha):
    """anel de cura verde no chão (camada de baixo)."""
    a = np.zeros((S, S, 4), np.uint8)
    rx, ry = 24 + 18 * k, 4.5 + 3 * k
    cx = BCX + 12
    d = ((_XX - cx) / rx) ** 2 + ((_YY - (G + 1)) / ry) ** 2
    inn = ((_XX - cx) / (rx - 2.5)) ** 2 + ((_YY - (G + 1)) / (ry - 1.2)) ** 2
    m = (d <= 1) & (inn > 1)
    a[m, :3] = hexc('#8cf09a'); a[m, 3] = int(255 * alpha)
    fill = inn <= 1
    a[fill, :3] = hexc('#9cf0a0'); a[fill, 3] = int(80 * alpha)
    edge = (d <= 1) & (inn > 1) & (((_XX - cx) / (rx - 1)) ** 2 + ((_YY - (G + 1)) / (ry - .5)) ** 2 > 1)
    a[edge, :3] = hexc('#2f8a3e')
    return a


def special():
    fr = []
    eyes = ['open', 'serene', 'serene', 'serene', 'serene', 'serene']
    rk = [0, .3, .6, .85, 1.0, 1.0]
    ra = [0, .7, .9, 1.0, .9, .5]
    for i in range(6):
        b = [0, 1, 2, 2, 1, 0][i]
        P = dict(sq=1 + .02 * b, hy=-.5 * b, hdeg=-3 if i else 0, eye=eyes[i], ear=[0, -6, -10, -10, -6, 0][i])
        def fxf(F, i=i):
            if i == 1:
                plus(F, 40, 66, s=1)
            if i == 2:
                plus(F, 30, 60, s=2); plus(F, 100, 52, s=1); heart(F, 66, 58, sc=2)
            if i == 3:
                plus(F, 28, 46, s=2); plus(F, 102, 40, s=2); heart(F, 64, 44, sc=2); sparkle(F, 46, 54, 2)
                plus(F, 116, 92, s=1)
            if i == 4:
                plus(F, 30, 30, s=2); plus(F, 104, 26, s=1); heart(F, 62, 26, sc=2); sparkle(F, 86, 40, 3)
                plus(F, 14, 92, s=1)
            if i == 5:
                heart(F, 62, 16, sc=2); sparkle(F, 30, 20, 2); sparkle(F, 104, 14, 2)
        und = ring(rk[i], ra[i]) if i else None
        fr.append(out(P, fxf, under=und))
    return fr


def build():
    rows = {'idle': idle(), 'walk': walk(), 'attack': attack(), 'hurt': hurt(), 'death': death(), 'special': special()}
    os.makedirs(OUT, exist_ok=True)
    img = sheet(rows)
    img.save(os.path.join(OUT, 'capivara.png'))
    return img


DOC = {
    "id": "capivara",
    "nome": "Capivara",
    "sub": "da beira do rio",
    "conceito": "A capivara é calma demais para o apocalipse: anda num gingado lento, olhos meio fechados, e nem os zumbis comuns se dão ao trabalho de atacá-la. "
                "Tem corpo de barril marrom, cabeça quadradona de focinho largo, uma mexerica equilibrada no cocuruto e uma bolsinha de primeiros socorros a tiracolo — por isso cura o herói só de ficar por perto.",
    "partes": [
        {"parte": "Cabeça", "descricao": "Bloco quadradão de ~35x26 px virado para a direita, topo reto (y≈63) e frente cortada reta; contorno separado do corpo. Gira em torno do pescoço (80,82): abaixa na cabeçada, sobe no susto e encosta no chão no desmaio."},
        {"parte": "Olhos", "descricao": "Olhinhos pequenos (5 px) bem no alto da cabeça, íris marrom quase preta com brilho branco de 1 px. Uma pálpebra de pelo cobre a metade de cima, dando o olhar preguiçoso de 'tô de boa'. Viram traço curvo sereno no especial, ^-fechado no dano, espiral e depois X no desmaio."},
        {"parte": "Orelhas", "descricao": "Duas orelhinhas redondas de ~7 px no topo de trás da cabeça; a de trás em marrom escuro, a da frente com miolo #4a2c1c. Balançam alguns graus: abaixam para trás na antecipação e no susto, dão um tique no idle."},
        {"parte": "Focinho e nariz", "descricao": "Focinho largo e rombudo ocupando os ~10 px da frente, em marrom mais escuro (#5c3a24). Narina horizontal de 3x2 px no topo, boca em traço quebrado embaixo e três pontinhos de bigode. No desmaio aparece a pontinha da língua rosada."},
        {"parte": "Corpo", "descricao": "Barril largo (~62x33 px) formado por três elipses: anca alta e redonda atrás, tronco e ombro mais baixo na frente. Barriga em marrom claro, sombra roxa da noite embaixo à direita e luz da lua no dorso."},
        {"parte": "Pernas e patas", "descricao": "Quatro pernas curtas e grossas (~14 px de altura, 8–10 px de largura) com joelho em IK; as do lado de lá em marrom escuro. Patas achatadas de 8x4 px em marrom quase preto. Na caminhada os pares diagonais alternam com passo de ±6 px e erguem até 3 px."},
        {"parte": "Traseiro (sem rabo)", "descricao": "Anca redonda e alta que termina sem rabo visível — a silhueta acaba numa curva lisa à esquerda, típica de capivara. A coxa traseira forma um volume próprio sobre a pata de trás."},
        {"parte": "Pelo e marcas", "descricao": "Pelo grosso com pontilhado de textura (~28% dos pixels escurecidos) e riscos curtos de 3 px nas costas imitando tufos ásperos. Bochecha em marrom claro (#a87648) e contorno escuro de 1 px puxando para o marrom."},
        {"parte": "Mexerica", "descricao": "Mexerica laranja de ~10x9 px com cabinho e folhinha verde, equilibrada no topo da cabeça entre a orelha e o olho (meme brasileiro). Gira levemente com o gingado, quase cai na cabeçada e voa longe no desmaio, rolando para o chão na frente do focinho."},
        {"parte": "Bolsinha de primeiros socorros", "descricao": "Bolsa de lona verde-oliva (~17x14 px) no flanco, aba mais escura com botãozinho e etiqueta bege com cruz vermelha de 6x6 px, presa por uma alça de couro escuro que cruza o corpo na diagonal — o acessório de sobrevivência que explica a cura."},
        {"parte": "Silhueta e pose", "descricao": "Perfil 3/4 baixo e comprido (~82 px de largura, ~50 de altura), cabeça grande à direita, pés no chão em y=112 e sombra oval roxa embaixo. Pose sempre relaxada; só no ataque o corpo se inclina para a frente."}
    ],
    "paleta": [
        {"nome": "Pelo marrom", "hex": FUR}, {"nome": "Pelo sombra", "hex": FUR_D}, {"nome": "Pelo claro", "hex": FUR_L},
        {"nome": "Focinho", "hex": SNOUT}, {"nome": "Patas", "hex": PAW}, {"nome": "Mexerica", "hex": MEX},
        {"nome": "Folha", "hex": LEAF}, {"nome": "Lona da bolsa", "hex": BAG}, {"nome": "Cruz vermelha", "hex": CROSS},
        {"nome": "Aura de cura", "hex": HEAL}
    ],
    "animacoes": {
        "idle": "4 quadros: 0 neutro; 1–2 o barril infla 2–3% e a cabeça sobe meio pixel (respiração), no 2 a orelha dá um tique para trás; 3 volta e pisca devagar.",
        "walk": "8 quadros de gingado lento: pares diagonais de patas alternam (passo de ±6 px, erguendo até 3 px), o corpo sobe e desce 1 px e balança ±2°, a cabeça compensa o balanço e a mexerica bamboleia junto.",
        "attack": "Cabeçada: 0 neutro; 1 antecipação longa — recua 5 px, agacha, abaixa a cabeça, orelhas para trás, bufo pelo nariz e poeirinha atrás; 2 investida curta com linhas de velocidade; 3 impacto: cabeça à frente, olhos fechados e estouro impact() no focinho, mexerica quase cai; 4 recua com brilho; 5 volta à pose.",
        "hurt": "0 flash branco com olhos arregalados; 1 empurrada 5 px para trás, corpo inclinado, cabeça para cima, olhos apertados e estrelinha; 2 ainda recuada se ajeitando; 3 volta quase ao lugar com o olhar preguiçoso.",
        "death": "Desmaio: 0 flash com olhos arregalados; 1 cambaleia para trás com olhos em espiral e a mexerica escorregando; 2 cambaleia para a frente e a mexerica voa pelo ar; 3 desaba de barriga com poeira e olhos em X; 4 estirada no chão, queixo no chão, linguinha de fora, mexerica caída na frente; 5 (600 ms) mesma pose com três estrelinhas girando sobre a cabeça.",
        "special": "Aura de cura: 0 neutro; 1 fecha os olhos serena, primeira cruzinha verde e anel verde surgindo no chão; 2–4 o anel cresce, cruzes plus() verdes e corações sobem pelo ar com brilhos enquanto ela respira fundo; 5 o anel desbota e sobra um coração no alto."
    },
    "especial": "Aura da Calmaria",
    "eventos": {
        "idle": {"0": "respira"},
        "walk": {"0": "passo", "4": "passo"},
        "attack": {"1": "bufo", "3": "impacto"},
        "hurt": {"0": "dano"},
        "death": {"0": "dano", "2": "mexerica", "3": "queda"},
        "special": {"1": "suspiro", "2": "cura", "4": "brilho"}
    }
}


if __name__ == '__main__':
    im = build()
    with open(os.path.join(OUT, 'capivara.json'), 'w', encoding='utf-8') as f:
        json.dump(DOC, f, ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        w, h = im.size
        im.resize((w * 2, h * 2), Image.NEAREST).save(sys.argv[1])
    print(im.size)
