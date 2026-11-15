"""Recruta: Enfermeira (Lua de Sangue).
Gera recrutas/enfermeira.png (1024x768) e recrutas/enfermeira_variantes.png (640x512).
Uso: python recruta_enfermeira.py [pasta_previa]
"""
import os
import sys
import math
from humano import *

ID = 'enfermeira'
SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']

SCRUB = '#a8cde3'
SCRUB_P = '#8fb6d2'
STETH = '#2b3140'
METAL = '#c9d2da'
MASK = '#a8d8d4'
BAG = '#c8323a'
WHITE = '#f4f1ea'
REDX = '#c8262e'
LANY = '#2f9a5a'
SCRUNCH = '#d0487a'
SHOE = '#e9e5da'
GLOVE = '#8ea6e0'
IODO = '#b8642a'
BLOOD = '#7a2a26'

LOOK = dict(body='f', skin=SKINS[1], hair_color=HAIRS[1], shirt=SCRUB, pants=SCRUB_P, shoes=SHOE,
            brow='#3a2418', eye='#3a2414')


def H(c):
    return hexc(c)


def dk(c, t=.3):
    return mix(H(c), INK, t)


def lt(c, t=.3):
    return mix(H(c), MOON, t)


def hq(P):
    """ponto relativo à cabeça (gira com hrot)."""
    cx, cy = P['head']
    r = P['hrot']
    return lambda x, y: rp(cx + x, cy + y, cx, cy, r)


def tq(P):
    """ponto relativo ao pescoço (gira com a inclinação do tronco)."""
    nx, ny = P['neck']
    r = P['lean']
    return lambda x, y: rp(nx + x, ny + y, nx, ny, r)


def gloved(P):
    return P['row'] == 'special' and P['i'] >= 1


def set_hand(P, s, pt):
    sh = P['sh_' + s]
    d = math.hypot(pt[0] - sh[0], pt[1] - sh[1])
    if d > ARM_L * .98:
        t = ARM_L * .98 / d
        pt = (sh[0] + (pt[0] - sh[0]) * t, sh[1] + (pt[1] - sh[1]) * t)
    P['ha_' + s] = pt
    P['el_' + s] = two_bone(sh[0], sh[1], pt[0], pt[1], ARM_L, bend_dir=(1 if s == 'b' else -1))


# ---------------------------------------------------------------- pose por quadro
ATK_GRIP = [-80, -125, -60, 0, 50, 85]
ATK_HAND = {0: (80, 29), 1: (72, 29)}
SPECIAL = [
    # mão da frente, mão de trás, olhos, boca, inclinação da cabeça
    dict(hf=(60, 80), hb=(46, 84), eyes='open', mouth='line', hr=5),
    dict(hf=(88, 70), hb=(62, 72), eyes='open', mouth='line', hr=4),
    dict(hf=(82, 64), hb=(66, 70), eyes='angry', mouth='grit', hr=6),
    dict(hf=(90, 52), hb=(62, 72), eyes='open', mouth='line', hr=2),
    dict(hf=(94, 66), hb=(48, 80), eyes='happy', mouth='smile', hr=0),
    dict(hf=(92, 58), hb=(48, 82), eyes='happy', mouth='smile', hr=-2),
]


def adjust(P):
    row, i = P['row'], P['i']
    if P['mouth'] == 'open':
        P['mouth'] = 'o'          # boca menor: não encosta na máscara do queixo
    if row == 'idle':
        P['grip'] = 90 + [0, 3, 5, 3][i]
    elif row == 'walk':
        s = math.sin(2 * math.pi * i / 8)
        P['grip'] = 90 - 12 * s
    elif row == 'attack':
        P['grip'] = ATK_GRIP[i]
        P['fx'] = []
        if i in ATK_HAND:
            set_hand(P, 'f', ATK_HAND[i])
        if i == 3:
            (a, b) = bag_box(P)[1]
            P['fx'] = [('impact', b[0] + 3, b[1])]
    elif row == 'hurt':
        P['grip'] = [100, 115, 108, 96][i]
    elif row == 'death':
        P['grip'] = [95, 100, 95, 55, 10, 0][i]
    elif row == 'special':
        q = SPECIAL[i]
        set_hand(P, 'f', q['hf'])
        set_hand(P, 'b', q['hb'])
        P['eyes'] = q['eyes']; P['mouth'] = q['mouth']
        P['hrot'] += q['hr']
        P['fx'] = []
        P['grip'] = 90


# ---------------------------------------------------------------- maleta

def bag_box(P, hand=None, ang=None):
    """retângulo da maleta: alça na mão, corpo ao longo do ângulo. Retorna (cantos, (centro, ponta))."""
    hx, hy = hand or P['ha_f']
    a = math.radians(P['grip'] if ang is None else ang)
    ux, uy = math.cos(a), math.sin(a)      # eixo alça -> fundo
    vx, vy = -uy, ux                        # eixo largura
    c = (hx + ux * 9.5, hy + uy * 9.5)
    hw, hh = 8, 5.5
    pts = [(c[0] + vx * sx * hw + ux * sy * hh, c[1] + vy * sx * hw + uy * sy * hh)
           for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    tip = (hx + ux * 15, hy + uy * 15)
    return pts, (c, tip), (ux, uy, vx, vy)


def draw_bag(F, P, hand=None, ang=None, opened=False, layer=None):
    pts, (c, tip), (ux, uy, vx, vy) = bag_box(P, hand, ang)
    hx, hy = hand or P['ha_f']
    Lr = layer
    # alça (arco grafite)
    a0 = (hx - vx * 3 + ux * 4, hy - vy * 3 + uy * 4)
    a1 = (hx + vx * 3 + ux * 4, hy + vy * 3 + uy * 4)
    F.part(chain([a0, (hx - vx * 2, hy - vy * 2), (hx + vx * 2, hy + vy * 2), a1], 2), '#3a3a44', shade=False, layer=Lr)
    m = F.part([pts], BAG, tex=.06, layer=Lr, light=.3, dark=.35)
    P_ = lambda s, t: (c[0] + vx * s + ux * t, c[1] + vy * s + uy * t)
    # faixa da tampa (perto da alça) mais escura + fecho metálico
    band = [P_(-8, -5.5), P_(8, -5.5), P_(8, -3.5), P_(-8, -3.5)]
    F.part([band], dk(BAG, .25), clip=m, outline=False, shade=False, layer=Lr)
    F.part([[P_(-1, -6), P_(1.5, -6), P_(1.5, -3.5), P_(-1, -3.5)]], METAL, outline=False, layer=Lr, light=.5)
    # cruz branca
    cr = [[P_(-1.2, -2.4), P_(1.6, -2.4), P_(1.6, 4.2), P_(-1.2, 4.2)],
          [P_(-3.4, -0.2), P_(3.8, -0.2), P_(3.8, 2.4), P_(-3.4, 2.4)]]
    F.part(cr, WHITE, clip=m, outline=False, light=.2, dark=.2, layer=Lr)
    # costura na borda
    for k in range(-6, 7, 2):
        x, y = P_(k, 4.5)
        F.px(x, y, dk(BAG, .45), layer=Lr)
    if opened:
        # tampa aberta: rolo de atadura e frasco saindo
        F.part(ell(*P_(-4, -7.5), 2.5, 2.5), WHITE, layer=Lr)
        F.part([[P_(2, -6), P_(5, -6), P_(5, -10), P_(2, -10)]], '#7a5030', layer=Lr)
        F.px(*P_(3.5, -10.5), '#e8e0d0', layer=Lr)
    return m


def draw_ground_bag(F, x, y, layer=None):
    """maleta aberta no chão (vista 3/4): corpo + tampa aberta para trás + itens."""
    L = layer
    F.part(poly((x - 9, y - 12), (x + 7, y - 12), (x + 9, y - 19), (x - 7, y - 19)), dk(BAG, .15), layer=L, tex=.05)   # tampa
    F.part(poly((x - 9, y - 12), (x + 7, y - 12), (x + 7, y), (x - 9, y)), BAG, layer=L, tex=.06, light=.3)
    F.part(poly((x - 3, y - 9), (x + 0, y - 9), (x + 0, y - 2), (x - 3, y - 2)) + poly((x - 5, y - 7), (x + 2, y - 7), (x + 2, y - 4), (x - 5, y - 4)),
           WHITE, outline=False, layer=L)
    F.part(ell(x - 4, y - 14, 2.6, 2.4), WHITE, layer=L)                    # rolo
    F.part(poly((x + 1, y - 13), (x + 4, y - 13), (x + 4, y - 18), (x + 1, y - 18)), '#7a5030', layer=L)  # frasco
    F.px(x + 2, y - 19, '#e8e0d0', layer=L)
    F.px(x - 4, y - 14, '#b8b0a0', layer=L)
    F.part(poly((x - 1, y - 12), (x + 1, y - 12), (x + 1, y - 10), (x - 1, y - 10)), METAL, outline=False, layer=L)


# ---------------------------------------------------------------- camadas

def draw_hair_back(F, P, look):
    c = look.get('hair_color')
    q = hq(P)
    r = P['hrot']
    cx, cy = P['head']
    # caneta BIC atravessando o coque
    p0, p1 = q(-21, -22), q(-4, -16)
    F.part(limb(p0[0], p0[1], p1[0], p1[1], 2.2), '#d8e4ea', light=.4)
    F.part(limb(p0[0], p0[1], *L2(p0, p1, .22), 2.6), '#2a4ab8')
    # coque
    F.part(rot(ell(cx - 12, cy - 15, 7.5, 6.5), cx, cy, r), c, tex=.16, light=.3)
    for (a, b) in ((-16, -18), (-14, -12), (-10, -19)):
        x, y = q(a, b); F.px(x, y, dk(c, .35))
        x, y = q(a + 1, b + 1); F.px(x, y, dk(c, .35))
    x, y = q(-14, -19); F.px(x, y, lt(c, .35)); x, y = q(-13, -19); F.px(x, y, lt(c, .35))
    # xuxinha
    F.part(rot(ell(cx - 7, cy - 11, 3.2, 4.5, rot=35), cx, cy, r), SCRUNCH, tex=.2)
    if P['row'] == 'special':
        if P['i'] == 0:
            draw_bag(F, P, hand=P['ha_b'], ang=90, opened=True)
        else:
            draw_ground_bag(F, 30, G + 1)


def draw_body_f(F, P, look):
    draw_body(F, P, look)
    # relógio de pulso (braço de trás)
    el, ha = P['el_b'], P['ha_b']
    w = L2(el, ha, .66)
    F.part(limb(*L2(el, ha, .6), *L2(el, ha, .7), 5.4), '#2a2830', shade=False, outline=False)
    F.px(w[0] + 1, w[1], '#e8eef0'); F.px(w[0] + 1, w[1] - 1, '#b8c4c8')
    if gloved(P):
        F.part(limb(*L2(el, ha, .82), *ha, 7.4), mix(H(GLOVE), NIGHT, .18))
        F.part(hand_shapes(P, 'b', 4.4), mix(H(GLOVE), NIGHT, .18), light=.35)


def draw_arm_f(F, P, look):
    draw_arm(F, P, look)
    if gloved(P):
        el, ha = P['el_f'], P['ha_f']
        F.part(limb(*L2(el, ha, .82), *ha, 7.4), GLOVE, light=.35)
        F.part(hand_shapes(P, 'f', 4.4), GLOVE, light=.4)


def draw_face_f(F, P, look):
    draw_face(F, P, look)
    if P['eyes'] in ('x',):
        return
    fp = face_pts(P)
    sk = H(skin_col(look))
    olh = mix(sk, H('#6a3a7a'), .38)
    for k, w in (('eye_b', 3), ('eye_f', 2)):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        F.line(x - w + 1, y + 4, x + 1, y + 4, olh)


def draw_pants_f(F, P, look):
    c = look.get('pants')
    far = mix(H(c), NIGHT, .2)
    F.part(thigh(P, 'b', grow=1) + shin(P, 'b', grow=1, upto=.82), far, tex=.06)
    m = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=1) + shin(P, 'f', grow=1, upto=.82), c, tex=.06)
    # costura lateral clara
    hp, kn, ft = P['hip_f'], P['kn_f'], P['ft_f']
    for a, b in ((hp, kn), (kn, L2(kn, (ft[0], ft[1] - 3), .78))):
        for t in (0.15, .35, .55, .75, .95):
            x, y = L2(a, b, t)
            F.px(x - 3, y, lt(c, .35))
    # barra dobrada
    for s in ('b', 'f'):
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        e = L2(kn, (ft[0], ft[1] - 3), .8)
        col = far if s == 'b' else H(c)
        F.part(limb(e[0] - 4, e[1], e[0] + 4, e[1], 2.6), mix(col, MOON, .12), outline=True)
    # mancha de sangue seco no joelho da frente
    kx, ky = P['kn_f']
    for (dx, dy) in ((1, 0), (2, 0), (1, 1), (3, 1), (2, -1)):
        F.px(kx + dx, ky + dy, BLOOD)
    # cordão da calça
    pv = P['pelvis']
    F.px(pv[0] + 3, pv[1] - 1, WHITE); F.px(pv[0] + 3, pv[1], WHITE); F.px(pv[0] + 4, pv[1] + 1, WHITE)


def draw_shoes_f(F, P, look):
    for s in ('b', 'f'):
        fx, fy = P['ft_' + DSIDE(s)]
        kn = P['kn_' + DSIDE(s)]
        # meia branca no tornozelo
        a = L2(kn, (fx, fy - 3), .82)
        F.part(limb(a[0], a[1], fx + 1, fy - 3, 6), '#f0ece4' if s == 'f' else mix(H('#f0ece4'), NIGHT, .2), shade=True)
        base = H(SHOE) if s == 'f' else mix(H(SHOE), NIGHT, .22)
        m = F.part(ell(fx + 3, fy - 3, 7, 3.4) + ell(fx + 6, fy - 2.2, 4.5, 2.6), base, tex=.05, light=.25)
        # sola cinza com risca
        sole = mix(base, H('#8a8478'), .5)
        F.part(poly((fx - 4, fy - 1.4), (fx + 11, fy - 1.4), (fx + 11, fy + 1), (fx - 4, fy + 1)), sole, clip=m, outline=False, shade=False)
        F.line(fx - 3, fy - 2, fx + 9, fy - 2, mix(base, H('#5a5248'), .35))
        # cadarço
        for k in (1, 3, 5):
            F.px(fx + k, fy - 5, mix(base, H('#7a7468'), .55))
        # sujeira
        for (dx, dy) in ((9, -3), (10, -2), (-3, -3), (7, -1), (0, -2)):
            F.px(fx + dx, fy + dy, mix(base, H('#8a6a44'), .55))


def draw_scrub_top(F, P, look):
    c = look.get('shirt')
    far = mix(H(c), NIGHT, .2)
    F.part(upper_arm(P, 'b', grow=1.5), far, tex=.06)
    m = F.part(torso_shapes(P, grow=1), c, tex=.07)
    q = tq(P)
    # decote em V (pele) com viés escuro
    sk = skin_col(look)
    vee = [q(-4, -1), q(5, -1), q(1, 9)]
    F.part([vee], sk, clip=m, outline=False)
    F.line(*q(-4, -1), *q(1, 9), dk(c, .35)); F.line(*q(5, -1), *q(1, 9), dk(c, .35))
    F.line(*q(-5, -1), *q(0, 10), lt(c, .15))
    # bolso de peito (lado de trás) com canetas e esparadrapo
    pk = [q(-11, 12), q(-4, 12), q(-4, 19), q(-11, 19)]
    F.part([pk], mix(H(c), MOON, .06), clip=m, light=.1, dark=.35, ol=dk(c, .45))
    for (xx, col) in ((-10, '#2a4ab8'), (-8, '#c8262e')):
        a, b = q(xx, 8), q(xx, 13)
        F.line(a[0], a[1], b[0], b[1], col)
    x, y = q(-6, 11)
    F.part(ell(x, y, 2, 1.6), '#f0ece4', light=.3)
    F.px(x, y, '#b8b0a0')
    # costura da barra
    hb, hf = P['hip_b'], P['hip_f']
    for k in range(0, 21, 2):
        x = hb[0] - 5 + k * (hf[0] - hb[0] + 10) / 20
        F.px(x, hb[1] - 1 + (hf[1] - hb[1]) * k / 20, dk(c, .3))
    # manchas: iodo e sangue seco
    for (dx, dy, col) in ((6, 22, IODO), (7, 22, IODO), (6, 23, IODO), (8, 23, '#9a5022'), (7, 24, IODO),
                          (-6, 26, BLOOD), (-2, 28, BLOOD)):
        x, y = q(dx, dy)
        F.px(x, y, col)


def draw_steth(F, P, look):
    """estetoscópio passado no pescoço (fica atrás do braço da frente)."""
    q = tq(P)
    # arco atrás do pescoço visível nos ombros
    back = [q(-5, -2), q(-7, 2), q(-8, 8), q(-8, 13)]
    front = [q(6, -2), q(8, 3), q(9, 10), q(9, 16), q(8, 20)]
    F.part(chain(back, 1.8), STETH, light=.3)
    F.part(chain(front, 2.2), STETH, light=.3)
    # olivas em Y (ponta de trás)
    y0 = q(-8, 13)
    for dx in (-2, 2):
        e = q(-8 + dx, 17)
        F.line(y0[0], y0[1], e[0], e[1], METAL)
        F.px(e[0], e[1] + 1, '#4a5260')
    # diafragma
    d = q(8, 22)
    F.part(ell(d[0], d[1], 2.8, 2.6), METAL, light=.5)
    F.px(d[0] - 1, d[1] - 1, '#ffffff')


def draw_badge(F, P, look):
    q = tq(P)
    a, b, c = q(-3, 1), q(3, 12), q(4, 1)
    F.line(*a, *q(1, 12), LANY); F.line(*c, *q(3, 12), LANY)
    x, y = q(2, 13)
    x, y = int(round(x)), int(round(y))
    F.part(poly((x - 2, y), (x + 3, y), (x + 3, y + 7), (x - 2, y + 7)), '#f4f4f0', light=.15, dark=.2, ol='#3a3a44')
    F.line(x - 2, y, x + 2, y, '#2a6ab8')
    F.px(x - 1, y + 2, '#8a6a54'); F.px(x, y + 2, '#8a6a54'); F.px(x - 1, y + 3, '#5a4a40'); F.px(x, y + 3, '#5a4a40')
    F.px(x + 2, y + 2, '#9a9aa0'); F.px(x + 2, y + 3, '#9a9aa0')
    F.line(x - 1, y + 5, x + 2, y + 5, '#9a9aa0')


def draw_bag_layer(F, P, look):
    draw_steth(F, P, look)
    draw_badge(F, P, look)


def draw_sleeve_f(F, P, look):
    c = look.get('shirt')
    sh, el = P['sh_f'], P['el_f']
    end = L2(sh, el, .7)
    m = F.part(limb(sh[0], sh[1] + 1, end[0], end[1], 10, 9.5), c, tex=.07)
    # braçadeira branca com cruz vermelha (faixa recortada dentro da manga)
    a, b = L2(sh, el, .3), L2(sh, el, .52)
    dx, dy = el[0] - sh[0], el[1] - sh[1]
    Ln = math.hypot(dx, dy) or 1
    nx, ny = -dy / Ln * 7, dx / Ln * 7
    band = [(a[0] + nx, a[1] + ny + 1), (b[0] + nx, b[1] + ny + 1), (b[0] - nx, b[1] - ny + 1), (a[0] - nx, a[1] - ny + 1)]
    bm = F.part([band], WHITE, clip=m, light=.2, dark=.25, outline=False)
    for t in (0.0, 1.0):
        e = L2(a, b, t)
        F.line(e[0] + nx * .7, e[1] + ny * .7 + 1, e[0] - nx * .7, e[1] - ny * .7 + 1, '#6a6a78')
    mx, my = L2(a, b, .5)
    mx, my = int(round(mx + 1)), int(round(my + 1))
    for (dx, dy) in ((0, -1), (0, 0), (0, 1), (-1, 0), (1, 0)):
        F.px(mx + dx, my + dy, REDX)
    # barra da manga
    F.px(*L2(sh, el, .7), dk(c, .3))


def draw_hair_front(F, P, look):
    c = look.get('hair_color')
    cx, cy = P['head']
    r = P['hrot']
    q = hq(P)
    sh = ell(cx - 1, cy - 10, 16, 8.5)
    sh += poly((cx - 16, cy - 9), (cx - 15, cy + 2), (cx - 11, cy + 4), (cx - 9, cy - 3))
    sh += poly((cx - 6, cy - 16), (cx + 9, cy - 15), (cx + 16, cy - 8), (cx + 14, cy - 4), (cx + 8, cy - 8), (cx + 1, cy - 9))
    m = F.part(rot(sh, cx, cy, r), c, tex=.12, clip=None, light=.3)
    # fios (riscas escuras) puxados para o coque
    for (a, b) in (((4, -16), (-8, -12)), ((10, -12), (-4, -14)), ((12, -8), (4, -11))):
        p0, p1 = q(*a), q(*b)
        F.line(p0[0], p0[1], p1[0], p1[1], dk(c, .3))
    for (a, b) in ((-4, -18), (-2, -18), (0, -18)):
        x, y = q(a, b); F.px(x, y, lt(c, .4))
    # fio solto na têmpora (cansaço)
    for (a, b) in ((14, -6), (15, -5), (15, -4), (14, -3), (14, -2), (15, -1)):
        x, y = q(a, b); F.px(x, y, dk(c, .1))
    # brinquinho
    x, y = q(-13, 8); F.px(x, y, '#f2c230')


def draw_mask(F, P, look):
    """máscara cirúrgica puxada para o queixo + elástico até a orelha."""
    if P['eyes'] == 'x' and False:
        return
    cx, cy = P['head']
    r = P['hrot']
    q = hq(P)
    sh = poly((cx - 1, cy + 15), (cx + 12, cy + 15), (cx + 14, cy + 17), (cx + 11, cy + 20), (cx, cy + 20), (cx - 3, cy + 17))
    m = F.part(rot(sh, cx, cy, r), MASK, light=.3, dark=.35)
    for yy in (17, 19):
        a, b = q(0, yy), q(11, yy)
        F.line(a[0], a[1], b[0], b[1], dk(MASK, .25))
    a, b = q(-2, 16), q(-11, 6)
    F.line(a[0], a[1], b[0], b[1], '#f0f4f4')


def draw_weapon(F, P, look):
    row, i = P['row'], P['i']
    if row == 'special':
        draw_special_props(F, P)
        return
    if row == 'attack' and i in (2, 3):
        # rastro de vento do golpe
        hx, hy = P['ha_f']
        sx, sy = P['sh_f']
        a0 = math.radians(ATK_GRIP[i - 1]); a1 = math.radians(ATK_GRIP[i])
        for k in range(9):
            a = a0 + (a1 - a0) * k / 8
            rr = 22
            for d in (0, 3):
                x, y = hx + math.cos(a) * (rr - d), hy + math.sin(a) * (rr - d)
                if d == 0 or k % 2 == 0:
                    F.px(x, y, '#f4efe6', layer=F.fx, alpha=200 if d == 0 else 120)
    draw_bag(F, P)


def draw_special_props(F, P):
    i = P['i']
    hf, hb = P['ha_f'], P['ha_b']
    if i == 0:
        # rolo de atadura saindo na mão da frente
        F.part(ell(hf[0], hf[1] - 3, 3, 3), WHITE, light=.3)
        F.px(hf[0], hf[1] - 3, '#b8b0a0')
    elif i == 1:
        # atadura esticada entre as mãos
        F.part(limb(hb[0], hb[1] - 1, hf[0], hf[1] - 2, 3.6), '#fbf8f2', tex=.2, light=.3, dark=.2)
        F.part(ell(hf[0] + 1, hf[1] - 2, 3, 3), WHITE, light=.3)
        F.px(hf[0] + 1, hf[1] - 2, '#b8b0a0')
    elif i == 2:
        # laço da atadura dando a volta
        cx, cy = (hf[0] + hb[0]) / 2 + 2, (hf[1] + hb[1]) / 2 + 1
        loop = [(hb[0], hb[1]), (cx - 6, cy + 6), (cx + 4, cy + 7), (cx + 9, cy), (hf[0], hf[1])]
        F.part(chain(loop, 3.4), '#fbf8f2', tex=.2, light=.3, dark=.2)
        F.part(ell(hf[0] + 1, hf[1] - 2, 2.6, 2.6), WHITE, light=.3)
        for k in range(3):
            F.px(cx - 4 + k * 4, cy + 7, '#c8c0b0')
    elif i == 3:
        # seringa erguida, agulha para cima, gotinha
        x, y = hf
        F.part(poly((x - 1.6, y - 3), (x + 1.6, y - 3), (x + 1.6, y - 14), (x - 1.6, y - 14)), '#e4eef2', light=.4, ol='#3a4a58')
        F.part(poly((x - 1, y - 5), (x + 1, y - 5), (x + 1, y - 11), (x - 1, y - 11)), '#e8b83a', outline=False, light=.3)
        F.line(x - 3, y - 3, x + 3, y - 3, '#3a4a58')   # aba
        F.line(x, y - 1, x, y + 2, '#3a4a58')            # êmbolo
        F.line(x - 1, y + 2, x + 1, y + 2, '#3a4a58')
        F.line(x, y - 15, x, y - 19, '#9aa4ac')         # agulha
        F.px(x, y - 21, '#9fe0ff', layer=F.fx); F.px(x, y - 22, '#ffffff', layer=F.fx)
        sparkle(F, x + 4, y - 22, 2)
        # luva da mão de trás dando o peteleco
        sparkle(F, hb[0] + 30, hb[1] - 26, 1, '#ffffff')
    elif i in (4, 5):
        if i == 5:
            # joinha: polegar para cima
            x, y = hf
            F.part(limb(x, y - 2, x, y - 7, 3), GLOVE, light=.4)


def extra(F, P):
    """efeitos do ofício (camada fx)."""
    if P['row'] != 'special':
        return
    i = P['i']
    if i == 3:
        plus(F, 104, 44, s=1)
    if i == 4:
        heart(F, 102, 52, sc=2)
        plus(F, 112, 40, s=2)
        plus(F, 92, 34, s=1)
        heart(F, 116, 62, sc=1)
    if i == 5:
        heart(F, 104, 32, sc=2)
        heart(F, 116, 50)
        plus(F, 110, 22, s=2)
        plus(F, 94, 18, s=1)
        plus(F, 120, 36, s=1)
        sparkle(F, 100, 46, 3)
        sparkle(F, 86, 26, 2)


DRAW = {
    'hair_back': draw_hair_back, 'body': draw_body_f, 'face': draw_face_f, 'pants': draw_pants_f,
    'shoes': draw_shoes_f, 'shirt': draw_scrub_top, 'jacket': None, 'bag': draw_bag_layer,
    'arm': draw_arm_f, 'shirt_arm': draw_sleeve_f, 'jacket_arm': None, 'beard': draw_mask,
    'hair': draw_hair_front, 'head': None, 'acc': None, 'weapon': draw_weapon,
}


def make_sheet(look=LOOK):
    return person_sheet(look, draw=DRAW, rows=ROWS, adjust=adjust, extra=extra)


def make_variants():
    out = Image.new('RGBA', (128 * 5, 128 * 4), (0, 0, 0, 0))
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            look = dict(LOOK, skin=sk, hair_color=hc)
            img, P, F = render(look, 'idle', 0, draw=DRAW, adjust=adjust)
            out.paste(Image.fromarray(img, 'RGBA'), (c * 128, r * 128))
    return out


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    dst = os.path.join(here, '..', 'recrutas')
    os.makedirs(dst, exist_ok=True)
    sheet_img = make_sheet()
    sheet_img.save(os.path.join(dst, ID + '.png'))
    var = make_variants()
    var.save(os.path.join(dst, ID + '_variantes.png'))
    if len(sys.argv) > 1:
        pv = sys.argv[1]
        bg = Image.new('RGBA', sheet_img.size, (70, 74, 84, 255))
        bg.alpha_composite(sheet_img)
        bg.resize((sheet_img.width * 2, sheet_img.height * 2), Image.NEAREST).save(os.path.join(pv, ID + '_prev.png'))
        for r in range(6):
            crop = bg.crop((0, r * 128, 1024, r * 128 + 128))
            crop.resize((1024 * 2, 256), Image.NEAREST).save(os.path.join(pv, ID + '_row%d.png' % r))
        bg2 = Image.new('RGBA', var.size, (70, 74, 84, 255)); bg2.alpha_composite(var)
        bg2.resize((var.width * 2, var.height * 2), Image.NEAREST).save(os.path.join(pv, ID + '_var.png'))
    print('ok', sheet_img.size, var.size)
