"""Pet: Cachorro (vira-lata caramelo) — sprite sheet 1024x768 no formato dos zumbis.
Rodar da pasta tools:  python pet_cachorro.py
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *  # noqa

PET_ID = 'cachorro'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- paleta ----------------
FUR = '#c98a3e'      # caramelo
FUR_D = '#9c5f28'    # caramelo escuro (costas, lado de lá)
FUR_DD = '#7d4a20'   # pernas do lado de lá
CREAM = '#f0d6a4'    # peito, focinho, meias
EAR_IN = '#8a4a2a'
NOSE = '#2a1a1c'
TONGUE = '#e2707c'
BAND = '#b3263a'     # bandana vermelha
BAND_D = '#7c1626'
TAG = '#cfc6b0'      # plaquinha de metal
MOUTH = '#4a1a1e'


def lerp(a, b, t):
    return a + (b - a) * t


def base_pose(**kw):
    p = dict(bx=0, by=0, brot=0, hdx=0, hdy=0, hdeg=0, jaw=0, ear=0.0, tail=0, eye='open',
             tongue=False, legs=None, lie=0, flop=False, brow=None, squash=1.0)
    p.update(kw)
    if p['legs'] is None:
        p['legs'] = {}
    return p


# posições de repouso das patas (x no chão)
PAW0 = {'fn': 79, 'ff': 73, 'bn': 42, 'bf': 37}


def leg_front(F, hip, paw, col, cream, w=7):
    hx, hy = hip
    px, py = paw
    # cotovelo levemente atrás, punho levemente à frente
    kx, ky = two_bone(hx, hy, px, py - 3, 25, bend_dir=1)
    F.part(limb(hx, hy, kx, ky, w + 2, w) + limb(kx, ky, px, py - 3, w, w - 1), col, tex=.12)
    F.part(ell(px + 1.5, py - 2, 4.4, 2.8), cream, marks=[(poly((px + 3, py - 5), (px + 3.6, py), (px + 4.4, py)), '#d8bc8a')])


def leg_back(F, hip, paw, col, cream, w=7):
    hx, hy = hip
    px, py = paw
    hkx, hky = px - 4, py - 11       # jarrete atrás
    kx, ky = two_bone(hx, hy, hkx, hky, 22, bend_dir=-1)   # joelho para frente
    F.part(limb(hx, hy, kx, ky, w + 5, w + 1) + limb(kx, ky, hkx, hky, w, w - 1) +
           limb(hkx, hky, px, py - 3, w - 1, w - 2), col, tex=.12)
    F.part(ell(px + 1.5, py - 2, 4.2, 2.7), cream)


def draw_dog(F, p):
    bx, by = p['bx'], p['by']
    bc = (58 + bx, 80 + by)                      # centro do corpo
    body = Xf(bc[0], bc[1], p['brot'], 0, 0)

    def B(sh):
        return body(mv(sh, bx, by))

    hipF = body.p(74 + bx, 84 + by)
    hipB = body.p(43 + bx, 82 + by)
    lg = p['legs']

    def paw(k):
        dx, lift = lg.get(k, (0, 0))
        return (PAW0[k] + dx + (0 if p['lie'] else bx), G - lift)

    # --- pernas do lado de lá ---
    if not p['flop']:
        leg_back(F, (hipB[0] - 4, hipB[1]), paw('bf'), FUR_DD, '#c9b08a', w=6)
        leg_front(F, (hipF[0] - 4, hipF[1]), paw('ff'), FUR_DD, '#c9b08a', w=6)

    # --- rabo (curvado para cima, abana) ---
    ta = p['tail']
    tb = body.p(37 + bx, 74 + by)
    pts = [tb]
    ang = -150 + ta
    x, y = tb
    for i in range(5):
        a = math.radians(ang + i * (22 - ta * .3))
        x, y = x + 6 * math.cos(a), y + 6 * math.sin(a)
        pts.append((x, y))
    F.part(chain(pts, 7, 3), FUR, tex=.2, marks=[(ell(pts[-1][0], pts[-1][1], 3, 3), CREAM)])

    # --- orelha do lado de lá ---
    hx0, hy0 = 86, 60
    head = Xf(80 + bx, 72 + by, p['hdeg'] + p['brot'], bx + p['hdx'], by + p['hdy'])
    e = p['ear']
    F.part(head(poly((75, 56), (lerp(76, 75, e), lerp(47, 43, e)), (lerp(83, 79, e), lerp(45, 39, e)), (82, 52))), FUR_D)

    # --- corpo ---
    sq = p['squash']
    belly = [(ell(60 + bx, 88 + by, 16, 5), CREAM), (ell(76 + bx, 86 + by, 8, 8), CREAM),
             (ell(56 + bx, 70 + by, 18, 3), FUR_D)]
    F.part(B(ell(43, 79, 12, 12 * sq) + ell(58, 80, 19, 10.5 * sq) + ell(73, 79, 12, 13 * sq)), FUR,
           marks=[(B(m), c) for m, c in belly], tex=.22)

    # --- pernas do lado de cá ---
    if p['flop']:
        # deitado de lado: patas esticadas para a frente
        F.part(limb(hipB[0] - 2, hipB[1], hipB[0] + 14, G - 3, 7, 5), FUR_DD, tex=.1)
        F.part(ell(hipB[0] + 16, G - 3, 4, 2.6), '#c9b08a')
        F.part(limb(hipF[0] - 2, hipF[1], hipF[0] + 20, G - 3, 6, 5), FUR_DD, tex=.1)
        F.part(ell(hipF[0] + 22, G - 3, 4, 2.6), '#c9b08a')
        F.part(limb(hipB[0], hipB[1] - 2, hipB[0] + 16, G - 6, 11, 6), FUR, tex=.15)
        F.part(ell(hipB[0] + 18, G - 6, 4.2, 2.8), CREAM)
        F.part(limb(hipF[0], hipF[1] - 1, hipF[0] + 24, G - 4, 7, 6), FUR, tex=.15)
        F.part(ell(hipF[0] + 26, G - 4, 4.4, 2.8), CREAM)
    else:
        leg_back(F, hipB, paw('bn'), FUR, CREAM, w=7)
        leg_front(F, hipF, paw('fn'), FUR, CREAM, w=7)

    # --- pescoço ---
    neck = Xf(80 + bx, 72 + by, p['hdeg'] * .7 + p['brot'], bx + p['hdx'] * .7, by + p['hdy'] * .6)
    F.part(neck(poly((69, 76), (75, 58), (88, 60), (88, 76), (74, 87))), FUR, tex=.2,
           marks=[(neck(ell(83, 79, 5, 8)), CREAM)])

    # --- bandana + plaquinha ---
    F.part(neck(poly((71, 70), (85, 72), (88, 77), (86, 80), (70, 76))), BAND,
           marks=[(neck(poly((71, 74), (86, 77), (86, 80), (70, 76))), BAND_D)])
    F.part(neck(poly((75, 75), (88, 77), (81, 89))), BAND, marks=[(neck(poly((81, 82), (86, 78), (82, 87))), BAND_D)])
    for wp in ((78, 79), (83, 84)):
        F.px(*neck([[wp]])[0][0], '#e8b0a0')
    tg = neck([[(88, 82)]])[0][0]
    F.part(ell(tg[0], tg[1], 2, 2.4), TAG, ol='#3a3428')
    F.px(tg[0] - .5, tg[1] - 1, '#ffffff')

    # --- cabeça ---
    F.part(head(ell(hx0, hy0, 11.5, 10.5)), FUR, tex=.15,
           marks=[(head(ell(90, 66, 7, 4)), CREAM)])
    # mandíbula (abre)
    jaw = Xf(93, 67, p['jaw'])
    if p['jaw'] > 4:
        F.part(head(jaw(poly((92, 65), (105, 66), (105, 68), (93, 70)))), MOUTH, shade=False)
    F.part(head(jaw(poly((89, 66), (103, 66.5), (105, 69), (101, 72), (91, 72)))), CREAM)
    if p['tongue']:
        tp = head(jaw([[(100, 71)]]))[0][0]
        F.part(limb(tp[0] - 3, tp[1] - 1, tp[0] + 1, tp[1] + 5, 4, 4), TONGUE, marks=[(ell(tp[0] - 1, tp[1] + 2, .6, 2), '#b84a58')])
    if p['jaw'] > 4:
        for tx in (99, 102):
            q = head([[(tx, 66)]])[0][0]
            F.px(q[0], q[1], '#fff8ee')
    # focinho (parte de cima)
    F.part(head(poly((92, 56), (100, 57.5), (107, 59), (109, 64), (104, 67), (92, 67))), CREAM,
           marks=[(head(poly((93, 56), (101, 57.5), (102, 60), (94, 59))), '#e2bc84')])
    F.part(head(ell(108, 60.5, 2.8, 2.3)), NOSE, light=.45)
    q = head([[(107.2, 59.5)]])[0][0]
    F.px(q[0], q[1], '#8a7a80')
    # --- orelha do lado de cá (semi-caída; em pé no alerta) ---
    F.part(head(poly((78, 55), (lerp(80, 79, e), lerp(46, 43, e)), (lerp(84, 82, e), lerp(43, 37, e)),
                     (lerp(90, 85, e), lerp(47, 41, e)), (87, 53))),
           FUR, marks=[(head(poly((80, 54), (lerp(81, 80, e), lerp(48, 45, e)), (lerp(84, 82, e), lerp(46, 40, e)),
                                  (lerp(87, 84, e), lerp(48, 43, e)), (85, 53))), EAR_IN)])

    # olho
    q = head([[(90, 55)]])[0][0]
    if p['eye'] not in ('open', 'wide', 'angry'):
        F.flat(ell(q[0] + .5, q[1] + .5, 3.2, 3.2), '#c08a44')
    if p['eye'] == 'closed':   # olho apertado ">"
        for (ex, ey) in [(-2, -2), (-1, -1), (0, 0), (1, 0), (2, 0), (-1, 1), (-2, 2)]:
            F.px(q[0] + ex, q[1] + ey, '#1a1010')
    elif p['eye'] == 'x':
        for d in range(-2, 3):
            F.px(q[0] + d, q[1] + d, '#1a1010'); F.px(q[0] + d, q[1] - d, '#1a1010')
            F.px(q[0] + d + 1, q[1] + d, '#1a1010'); F.px(q[0] + d + 1, q[1] - d, '#1a1010')
    else:
        eye(F, q[0], q[1], kind=p['eye'], iris='#4a2a14', r=2, brow=p['brow'])
    if p['eye'] == 'open' and not p['brow']:
        q2 = head([[(89, 52)]])[0][0]
        F.px(q2[0], q2[1], '#ecc890'); F.px(q2[0] + 1, q2[1], '#ecc890')


def frame(p, fx=None, dx=0, dy=0, tint=None, shadow_rx=30, rotate=None, alpha=1.0):
    F = Frame()
    draw_dog(F, p)
    if fx:
        fx(F)
    sh = shadow_layer(64 + p['bx'] * .6 + dx, shadow_rx)
    return compose(F, dx=dx, dy=dy, tint=tint, shadow=sh, rotate=rotate, alpha=alpha)


# ---------------- animações ----------------

def anim_idle():
    out = []
    for i in range(4):
        b = [0, 1, 1, 0][i]
        out.append(frame(base_pose(by=b, hdy=b * .5, tail=[0, 8, 14, 6][i], ear=[0, 0, .15, .05][i],
                                   squash=[1, 1.03, 1.03, 1][i], tongue=i in (1, 2), jaw=[0, 6, 6, 0][i])))
    return out


def anim_walk():
    out = []
    for i in range(8):
        ph = i / 8 * 2 * math.pi
        def g(off, amp=6):
            s = math.sin(ph + off)
            lift = max(0, math.cos(ph + off)) * 4
            return (s * amp, lift)
        legs = {'fn': g(0), 'bf': g(.3), 'ff': g(math.pi), 'bn': g(math.pi + .3)}
        bob = -abs(math.sin(ph)) * 1.5 + 1
        out.append(frame(base_pose(by=round(bob), hdy=math.sin(ph * 2) * .6, tail=10 * math.sin(ph * 2),
                                   legs=legs, ear=.05 + .1 * abs(math.sin(ph)), tongue=True, jaw=6)))
    return out


def anim_attack():
    cfg = [
        dict(bx=-1, by=1, brot=0, hdeg=-4, jaw=4, ear=.3, brow='angry', legs={}),
        dict(bx=-5, by=3, brot=-4, hdeg=-8, hdy=2, jaw=10, ear=.4, brow='angry',
             legs={'fn': (-2, 0), 'ff': (-2, 0), 'bn': (-1, 0), 'bf': (-1, 0)}),
        dict(bx=7, by=-4, brot=-7, hdeg=4, jaw=32, ear=.6, eye='wide',
             legs={'fn': (14, 12), 'ff': (10, 9), 'bn': (6, 0), 'bf': (3, 0)}),
        dict(bx=9, by=-1, brot=3, hdeg=2, jaw=0, ear=.5, brow='angry',
             legs={'fn': (14, 1), 'ff': (11, 0), 'bn': (6, 0), 'bf': (3, 0)}),
        dict(bx=6, by=0, brot=0, hdeg=-6, jaw=2, ear=.4, brow='angry',
             legs={'fn': (10, 0), 'ff': (8, 0), 'bn': (4, 0), 'bf': (2, 0)}),
        dict(bx=1, by=0, hdeg=0, jaw=6, tongue=True, ear=.1, legs={'fn': (2, 0)}),
    ]
    out = []
    for i, c in enumerate(cfg):
        def fx(F, i=i):
            if i == 1:
                text(F, 'RR', 96, 34, col='#f4efe6', sc=2)
            if i == 2:
                for k in range(3):
                    F.line(30 - k * 5, 70 + k * 6, 22 - k * 5, 70 + k * 6, '#f4efe6', F.fx)
            if i == 3:
                impact(F, 114, 68, r=9)
            if i == 4:
                sparkle(F, 116, 60, r=2)
        out.append(frame(base_pose(**c), fx=fx))
    return out


def anim_hurt():
    cfg = [
        (dict(eye='closed', hdeg=-6, ear=.4), 0, 'flash'),
        (dict(bx=-6, by=0, brot=-6, hdeg=-14, hdy=-1, eye='closed', jaw=8, ear=.7, tail=-20,
              legs={'fn': (-6, 3), 'ff': (-5, 1)}), 0, None),
        (dict(bx=-4, by=1, brot=-3, hdeg=-6, eye='closed', jaw=3, ear=.3, tail=-10, legs={'fn': (-3, 0)}), 0, None),
        (dict(bx=-1, by=0, hdeg=-2, eye='open', jaw=0, ear=.1, tail=0), 0, None),
    ]
    out = []
    for i, (c, dx, t) in enumerate(cfg):
        def fx(F, i=i):
            if i == 1:
                for k in range(3):
                    sparkle(F, 104 + k * 5, 50 - k * 4, r=1 + (k == 1))
        out.append(frame(base_pose(**c), fx=fx, dx=dx, tint=t))
    return out


def anim_death():
    cfg = [
        dict(eye='closed', hdeg=-8, ear=.4),
        dict(bx=-3, by=1, brot=-5, hdeg=10, eye='spiral', jaw=8, tongue=True, ear=0, tail=-20,
             legs={'fn': (3, 0), 'bn': (-3, 0)}),
        dict(bx=-1, by=7, brot=4, hdeg=18, hdy=4, eye='spiral', jaw=10, tongue=True, ear=0, tail=-30, squash=.95,
             legs={'fn': (2, 0), 'ff': (-1, 0), 'bn': (-2, 0), 'bf': (0, 0)}),
        dict(by=19, lie=1, flop=True, brot=0, hdeg=12, hdy=8, hdx=4, eye='spiral', jaw=10, tongue=True, ear=-.4, tail=-55, squash=.88),
        dict(by=17, lie=1, flop=True, brot=-1, hdeg=9, hdy=6, hdx=4, eye='x', jaw=10, tongue=True, ear=-.4, tail=-50, squash=.92),
        dict(by=19, lie=1, flop=True, brot=0, hdeg=11, hdy=8, hdx=4, eye='x', jaw=12, tongue=True, ear=-.4, tail=-58, squash=.88),
    ]
    out = []
    for i, c in enumerate(cfg):
        def fx(F, i=i):
            if i == 3:
                dust(F, 28, G - 2, 4); dust(F, 104, G - 1, 4)
            if i in (4, 5):
                cx, cy = 98, 70
                for k in range(3):
                    a = (i * 40 + k * 120) * math.pi / 180
                    star(F, cx + 11 * math.cos(a), cy + 4 * math.sin(a) - 4, r=3)
        out.append(frame(base_pose(**c), fx=fx, tint='flash' if i == 0 else None, shadow_rx=33 if i >= 3 else 30))
    return out


def anim_special():
    cfg = [
        dict(ear=.6, hdeg=-6, tail=20, eye='wide'),
        dict(by=2, bx=-2, brot=-3, ear=1, hdeg=4, hdy=1, tail=30, jaw=2, legs={'fn': (-1, 0)}),
        dict(by=-1, bx=2, brot=-6, ear=1, hdeg=-16, hdy=-2, tail=34, jaw=34, legs={'fn': (3, 2)}),
        dict(by=-2, bx=3, brot=-8, ear=1, hdeg=-20, hdy=-3, tail=36, jaw=38, eye='wide', legs={'fn': (4, 3)}),
        dict(by=-1, bx=2, brot=-5, ear=1, hdeg=-14, hdy=-2, tail=30, jaw=26, legs={'fn': (3, 1)}),
        dict(by=0, bx=0, ear=.7, hdeg=-2, tail=24, jaw=6, tongue=True),
    ]
    out = []
    for i, c in enumerate(cfg):
        def fx(F, i=i):
            if i == 0:
                text(F, '!', 92, 30, col='#f2c230', sc=2)
            if i in (2, 3, 4):
                arcs(F, 106, 58, n=2 + (i == 3), col='#f4efe6')
            if i == 2:
                bubble(F, 'AU!', 104, 34, sc=2)
            if i == 3:
                bubble(F, 'AU!', 100, 30, sc=2)
                arcs(F, 110, 58, n=3, col='#f2c230')
            if i == 4:
                bubble(F, 'AU!', 102, 34, sc=2)
        out.append(frame(base_pose(**c), fx=fx))
    return out


DESIGN = {
    "id": PET_ID,
    "nome": "Cachorro",
    "sub": "vira-lata caramelo",
    "conceito": ("Um vira-lata caramelo leal e destemido que sobreviveu às ruas antes mesmo da Lua de Sangue: "
                 "orelhas semicaídas, focinho creme, língua de fora e rabo sempre abanando. Usa uma bandana "
                 "vermelha surrada com uma plaquinha de metal no pescoço — late ao menor sinal de zumbi e morde "
                 "junto com o golpe do herói."),
    "partes": [
        {"parte": "Cabeça", "descricao": "Crânio oval de ~23x21 px, caramelo (#c98a3e) com bochecha creme e pescoço grosso. Gira em torno do pescoço: baixa no rosnado, sobe no latido e tomba no desmaio."},
        {"parte": "Olhos", "descricao": "Um olho visível (perfil 3/4) de raio 2 px, íris castanha (#4a2a14), pupila escura e brilho branco de 1–2 px no canto superior esquerdo; pinta clara de 'sobrancelha' acima. Fecha (traço) no dano, vira espiral no tonteio e X no desmaio; sobrancelha brava no ataque."},
        {"parte": "Orelhas", "descricao": "Triangulares e semicaídas (ponta dobrada para a frente), ~9 px; a de cá caramelo com interior marrom-avermelhado (#8a4a2a), a de lá mais escura atrás da cabeça. Animam por interpolação até ficarem totalmente em pé (alerta) no especial e no ataque."},
        {"parte": "Focinho e boca", "descricao": "Focinho alongado creme (#f0d6a4) de ~16x8 px com sombreado bege no dorso, trufa preta (#2a1a1c) com reflexo cinza. Mandíbula separada gira até ~30° mostrando boca escura, dois dentinhos brancos e a língua rosa (#e2707c) com sulco central."},
        {"parte": "Corpo / tronco", "descricao": "Três elipses fundidas (garupa, barriga, peito) formando um tronco de ~60x24 px, peito alto e barriga creme; faixa dorsal mais escura. Leve 'squash' na respiração do idle e inclinação no bote."},
        {"parte": "Pernas e patas", "descricao": "Quatro pernas: dianteiras retas com cotovelo, traseiras com coxa grossa, joelho para a frente e jarrete para trás (IK de 2 ossos). As do lado de lá são marrom-escuras (#7d4a20). Patas ovais creme ('meias') pisam em y=112; alternam em diagonal na caminhada."},
        {"parte": "Rabo", "descricao": "Rabo em cadeia de 5 segmentos afunilando de 7 a 3 px, curvado para cima como foice, com ponta creme. Abana no idle e na caminhada, ergue-se no latido e cai entre as patas no dano/desmaio."},
        {"parte": "Pelagem e marcas", "descricao": "Pelo curto caramelo com pontilhado de textura (~20%), luz de lua no alto-esquerda e sombra roxa noturna embaixo-direita; peito, focinho, ponta do rabo e meias em creme — o padrão clássico do caramelo."},
        {"parte": "Acessório", "descricao": "Bandana vermelha surrada (#b3263a / #7c1626) amarrada no pescoço com a ponta triangular caindo sobre o peito e dois pontinhos de desgaste, mais uma plaquinha de metal (#cfc6b0) com brilho branco pendurada de lado — lembrança de um antigo dono antes da Lua de Sangue."},
        {"parte": "Silhueta / pose", "descricao": "Perfil 3/4 virado para a direita, ~80 px do rabo à trufa e ~55 px de altura até a ponta da orelha; postura alerta com peito para a frente e cabeça alta, sombra oval no chão. Lê-se como cachorro mesmo a 1x pelo focinho longo, orelhas e rabo curvado."},
    ],
    "paleta": [
        {"nome": "Caramelo", "hex": FUR}, {"nome": "Caramelo escuro", "hex": FUR_D},
        {"nome": "Marrom (lado de lá)", "hex": FUR_DD}, {"nome": "Creme", "hex": CREAM},
        {"nome": "Interior da orelha", "hex": EAR_IN}, {"nome": "Trufa", "hex": NOSE},
        {"nome": "Língua", "hex": TONGUE}, {"nome": "Bandana", "hex": BAND},
        {"nome": "Bandana sombra", "hex": BAND_D}, {"nome": "Plaquinha", "hex": TAG},
    ],
    "animacoes": {
        "idle": "4 quadros: respiração (corpo sobe 1 px e estufa), boca abre com a língua de fora nos quadros 1–2, rabo abana de 0° a 14° e a orelha mexe levemente.",
        "walk": "8 quadros de trote: patas em pares diagonais (dianteira de cá + traseira de lá) avançam e levantam até 4 px, corpo balança 1–2 px, cabeça acompanha, rabo abana em ritmo duplo e a língua fica de fora.",
        "attack": "0: posição de briga, sobrancelha brava. 1: antecipação — recua 5 px, abaixa o peito, rosna ('RR'). 2: bote — salta para a frente com a dianteira no ar, boca bem aberta, linhas de velocidade atrás. 3: impacto — mandíbula fecha, estrela de impacto na frente do focinho. 4: segura e puxa com a cabeça. 5: volta à posição com a língua de fora.",
        "hurt": "0: clarão branco (tinta 'flash') com olho fechado. 1: recuo de 6 px, cabeça jogada para trás, orelhas sobem, patinha dianteira levanta, rabo entre as pernas, faíscas. 2: ainda encolhido. 3: recupera e abre o olho.",
        "death": "Desmaio: 0 clarão branco. 1: cambaleia com olhos em espiral e língua de fora. 2: as pernas cedem e o corpo afunda. 3: tomba no chão com as patas esticadas e poeira. 4: quica de leve. 5: deitado, olho em X, língua de fora e três estrelinhas girando sobre a cabeça (segura 600 ms).",
        "special": "Latido de alerta: 0: orelhas se erguem, '!' amarelo. 1: abaixa e enche o peito, orelhas totalmente em pé, rabo erguido. 2: late 'AU!' com balão e ondas de som. 3: segundo latido mais forte, ondas brancas e amarelas, pata dianteira levantada. 4: fim do latido. 5: relaxa, rabo ainda alto e língua de fora.",
    },
    "especial": "Latido de Alerta",
    "eventos": {
        "idle": {"0": "respira"},
        "walk": {"0": "passo", "4": "passo"},
        "attack": {"1": "rosnado", "2": "bote", "3": "mordida"},
        "hurt": {"0": "dano", "1": "ganido"},
        "death": {"0": "dano", "1": "ganido", "3": "queda"},
        "special": {"0": "alerta", "2": "latido", "3": "latido"},
    },
}


def main():
    rows = {'idle': anim_idle(), 'walk': anim_walk(), 'attack': anim_attack(),
            'hurt': anim_hurt(), 'death': anim_death(), 'special': anim_special()}
    im = sheet(rows)
    os.makedirs(OUT, exist_ok=True)
    png = os.path.join(OUT, PET_ID + '.png')
    im.save(png)
    with open(os.path.join(OUT, PET_ID + '.json'), 'w', encoding='utf-8') as f:
        json.dump(DESIGN, f, ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(sys.argv[1])
    print('ok', im.size)


if __name__ == '__main__':
    main()
