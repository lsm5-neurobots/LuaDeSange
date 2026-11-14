"""Recruta: Serralheiro — gera recrutas/serralheiro.png e recrutas/serralheiro_variantes.png.
Rodar dentro de tools:  python recruta_serralheiro.py   [--preview DIR]
"""
import os
import sys
import math
from humano import *

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'recrutas')

ID = 'serralheiro'
LOOK = dict(body='m', skin='#c68a5e', hair_color='#2a2a2a', eye='#3a2414',
            shirt='#5b6b7a', pants='#5b6b7a', shoes='#3a2618')

C_SUIT = '#5b6b7a'
C_PATCH = '#7a8a96'
C_LEATHER = '#7a4a2a'
C_LEATHER_D = '#5a3420'
C_STITCH = '#c8a070'
C_BURN = '#2a1810'
C_GLOVE = '#b39a72'
C_BOOT = '#3a2618'
C_STEEL = '#8a8e96'
C_WOOD = '#8a5a30'
C_IRON = '#6a6e78'
C_BRASS = '#b08a3a'
C_LENS = '#3f6a5e'
C_ANVIL = '#4a4e58'

ANV_X = 101   # centro da bigorna (especial)
ANV_TOP = 94


def H(c):
    return hexc(c) if isinstance(c, str) else c


def shade(c, t):
    return mix(H(c), INK, t)


def tone(c, t):
    return mix(H(c), MOON, t)


# ---------------------------------------------------------------- utilidades de pose

def set_hand(P, s, pt):
    sh = P['sh_' + s]
    d = math.hypot(pt[0] - sh[0], pt[1] - sh[1])
    if d > ARM_L * .98:
        t = ARM_L * .98 / d
        pt = (sh[0] + (pt[0] - sh[0]) * t, sh[1] + (pt[1] - sh[1]) * t)
    P['ha_' + s] = pt
    P['el_' + s] = two_bone(sh[0], sh[1], pt[0], pt[1], ARM_L, bend_dir=(1 if s == 'b' else -1))


HAM_LEN = 19


def hammer_pts(P):
    """(cabo atrás, ponta=centro da cabeça, direção unit, normal)"""
    p0, p1 = held(P, HAM_LEN, back=4)
    a = math.radians(P['grip'])
    return p0, p1, (math.cos(a), math.sin(a)), (-math.sin(a), math.cos(a))


SPECIAL = [
    # mão da frente, grip, mão de trás, lean, olhos, boca
    dict(hf=(88, 70), grip=-40, hb=(73, 76), lean=3, eyes='open', mouth='line'),
    dict(hf=(82, 44), grip=-105, hb=(73, 76), lean=-3, eyes='angry', mouth='grit'),
    dict(hf=(85, 84), grip=8, hb=(74, 77), lean=6, eyes='angry', mouth='open'),
    dict(hf=(85, 50), grip=-90, hb=(73, 76), lean=0, eyes='angry', mouth='grit'),
    dict(hf=(85, 84), grip=8, hb=(74, 77), lean=6, eyes='angry', mouth='open'),
    dict(hf=(76, 62), grip=-150, hb=(74, 74), lean=1, eyes='happy', mouth='smile'),
]


def adjust(P):
    row, i = P['row'], P['i']
    if row == 'idle':
        P['grip'] = 92 + [0, 2, 3, 2][i]
    elif row == 'walk':
        s = math.sin(2 * math.pi * i / 8)
        P['grip'] = 90 + 14 * s
    elif row == 'attack':
        P['grip'] = [-130, -160, -60, 5, 55, 60][i]
        P['fx'] = []
        if i == 5:
            set_hand(P, 'f', (P['ha_f'][0], P['ha_f'][1] + 4))
    elif row == 'hurt':
        P['grip'] = [70, 60, 65, 80][i]
    elif row == 'death':
        P['grip'] = [80, 60, 40, 30, 30, 30][i]
    elif row == 'special':
        sp = SPECIAL[i]
        # re-aplica o tronco com a inclinação do especial
        P2 = pose('idle', 0, P['body'])
        pel = P2['pelvis']
        P['lean'] = sp['lean']
        for k in ('head', 'neck', 'sh_b', 'sh_f'):
            P[k] = rp(P2[k][0], P2[k][1], pel[0], pel[1], sp['lean'])
        P['hrot'] = sp['lean'] * .5
        set_hand(P, 'f', sp['hf'])
        set_hand(P, 'b', sp['hb'])
        P['grip'] = sp['grip']
        P['eyes'] = sp['eyes']; P['mouth'] = sp['mouth']
        P['fx'] = []
    if row == 'attack' and i == 3:
        _, tip, _, _ = hammer_pts(P)
        P['hit'] = (min(121, tip[0] + 7), tip[1] + 1)


# ---------------------------------------------------------------- corpo

def glove(F, P, s, col=C_GLOVE, far=False):
    c = H(col)
    if far:
        c = mix(c, NIGHT, .18)
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    cuff0 = L2(ha, el, .55)
    m = F.part(limb(cuff0[0], cuff0[1], ha[0], ha[1], 10, 8), c, tex=.14)
    # borda do cano (costura)
    e = L2(ha, el, .5)
    d = (el[0] - ha[0], el[1] - ha[1]); L = math.hypot(*d) or 1
    nx, ny = -d[1] / L, d[0] / L
    F.line(e[0] + nx * 4, e[1] + ny * 4, e[0] - nx * 4, e[1] - ny * 4, shade(c, .35))
    e2 = L2(ha, el, .42)
    F.line(e2[0] + nx * 3, e2[1] + ny * 3, e2[0] - nx * 3, e2[1] - ny * 3, tone(c, .25))
    hx, hy = ha
    F.part(ell(hx, hy, 4.8, 4.6), c, tex=.12)
    F.px(hx + 1, hy - 1, tone(c, .3)); F.px(hx - 2, hy + 1, shade(c, .3))
    F.line(hx - 2, hy + 2, hx + 2, hy + 2, shade(c, .4))   # dedos


def draw_body(F, P, look):
    c = skin_col(look)
    far = mix(hexc(c), NIGHT, .18)
    F.part(thigh(P, 'b') + shin(P, 'b'), far)
    F.part(upper_arm(P, 'b', w=9) + fore_arm(P, 'b', w=9), far)
    glove(F, P, 'b', far=True)
    F.part(thigh(P, 'f') + shin(P, 'f'), c)
    F.part(torso_shapes(P, grow=1) + pelvis_shapes(P), c)
    F.part(neck_shapes(P) + limb(P['neck'][0], P['neck'][1], P['head'][0] + 1, P['head'][1] + 10, 10, 10), mix(hexc(c), NIGHT, .12))
    F.part(head_shapes(P), c, tex=0)
    F.part(ear_shapes(P), c)
    # lápis atrás da orelha
    cx, cy = P['head']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, P['hrot'])
    a, b = q(-15, -3), q(-10, 4)
    F.part(limb(a[0], a[1], b[0], b[1], 2.4, 2.4), '#c0302a', outline=True, light=.3)
    F.px(*q(-15, -4), '#e8c890')
    F.part(ear_shapes(P), c)
    # nariz batatudo
    F.part(rot(poly((cx + 12, cy + 1), (cx + 18, cy + 7), (cx + 16, cy + 9), (cx + 12, cy + 9)), cx, cy, P['hrot']), c, outline=False, light=.4)
    x, y = q(16, 6)
    F.px(x, y, tone(c, .45))
    # fuligem na bochecha e graxa na testa
    for (dx, dy) in ((-6, 9), (-5, 9), (-4, 10), (-6, 10), (-5, 11)):
        F.px(*q(dx, dy), mix(hexc(c), hexc('#2a2a30'), .45))
    for (dx, dy) in ((6, -3), (7, -3), (8, -4)):
        F.px(*q(dx, dy), mix(hexc(c), hexc('#2a2a30'), .35))


def draw_arm(F, P, look):
    c = skin_col(look)
    F.part(upper_arm(P, 'f', w=9) + fore_arm(P, 'f', w=9), c)
    # pelos e cicatriz de queimadura
    el, ha = P['el_f'], P['ha_f']
    for t, o in ((.2, 1), (.32, -1), (.42, 2)):
        x, y = L2(el, ha, t)
        F.px(x + o * .5, y, mix(hexc(c), INK, .35))
    x, y = L2(el, ha, .28)
    F.px(x - 1, y + 1, tone(c, .35)); F.px(x, y + 1, tone(c, .35))
    glove(F, P, 'f')


def face_pts(P):
    cx, cy = P['head']
    r = P['hrot']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    return dict(eye_b=q(-1, 2), eye_f=q(9, 2), brow_b=q(0, -3), brow_f=q(10, -3), mouth=q(8, 15), cheek=q(-5, 7))


def draw_face(F, P, look):
    fp = face_pts(P)
    kind = P['eyes']
    hc = hexc(look.get('hair_color', '#2a2a2a'))
    brow = mix(hc, INK, .35)
    sk = hexc(skin_col(look))
    for k, big in (('eye_b', True), ('eye_f', False)):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if kind in ('closed', 'happy', 'x'):
            if kind == 'x':
                for d in (-1, 0, 1):
                    F.px(x + d, y + d, INKC); F.px(x + d, y - d, INKC)
            elif kind == 'happy':
                F.px(x - 1, y, INKC); F.px(x, y - 1, INKC); F.px(x + 1, y, INKC); F.px(x - 2, y + 1, INKC); F.px(x + 2, y + 1, INKC)
            else:
                F.line(x - 2, y, x + 2, y, INKC)
            continue
        w = 3 if big else 2
        for yy in range(y - 2, y + 3):
            for xx in range(x - w, x + 3):
                F.px(xx, yy, '#f4efe6')
        iris = look.get('eye', '#3a2414')
        for yy in range(y - 2, y + 3):
            for xx in range(x, x + 3):
                F.px(xx, yy, iris)
        for yy in range(y - 1, y + 2):
            F.px(x + 1, yy, '#0c0606'); F.px(x + 2, yy, '#0c0606')
        F.px(x, y - 2, '#ffffff')
        F.line(x - w, y - 3, x + 3, y - 3, INKC)
        F.line(x - w, y + 3, x + 2, y + 3, mix(sk, INK, .45))
        if kind == 'angry':   # pálpebra pesada
            F.line(x - w, y - 2, x + 2, y - 2, mix(sk, INK, .3))
    # sobrancelhas grossas (2 px)
    for k in ('brow_b', 'brow_f'):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if kind == 'angry':
            F.line(x - 3, y - 2, x + 2, y + 1, brow); F.line(x - 3, y - 1, x + 2, y + 2, brow)
        elif kind in ('happy',):
            F.line(x - 3, y - 2, x + 2, y - 2, brow); F.line(x - 3, y - 1, x + 2, y - 1, brow)
        else:
            F.line(x - 3, y - 1, x + 2, y, brow); F.line(x - 3, y - 2, x + 2, y - 1, brow)
    # boca
    x, y = fp['mouth']
    x, y = int(round(x)), int(round(y))
    m = P['mouth']
    if m == 'line':
        F.line(x - 2, y, x + 2, y, '#5a2a24')
    elif m == 'smile':
        F.line(x - 2, y, x + 2, y, '#5a2a24'); F.px(x + 3, y - 1, '#5a2a24'); F.px(x - 3, y - 1, '#5a2a24')
    elif m == 'grit':
        F.flat(poly((x - 3, y - 1), (x + 3, y - 1), (x + 3, y + 2), (x - 3, y + 2)), '#3a1414')
        F.line(x - 2, y, x + 2, y, '#f4efe6')
    elif m in ('open', 'o'):
        F.flat(ell(x, y + 1, 2.6 if m == 'open' else 1.8, 2.6 if m == 'open' else 2), '#3a1414')
        if m == 'open':
            F.px(x, y + 2, '#c9343a')
    # bochecha
    x, y = fp['cheek']
    F.px(x, y, mix(sk, hexc('#e07a6a'), .4)); F.px(x + 1, y, mix(sk, hexc('#e07a6a'), .4))


def draw_beard(F, P, look):
    hc = hexc(look.get('hair_color', '#2a2a2a'))
    sk = hexc(skin_col(look))
    cx, cy = P['head']
    r = P['hrot']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    # barba por fazer
    stub = mix(sk, hc, .4)
    for (dx, dy) in ((2, 15), (4, 16), (6, 17), (9, 17), (11, 16), (13, 15), (0, 13), (-2, 11), (3, 13), (12, 13), (7, 15), (-4, 12)):
        F.px(*q(dx, dy), stub)
    # bigodão
    sh = poly(q(4, 10.5), q(13, 10.5), q(15, 13.5), q(12, 12.5), q(8, 12), q(5, 12.5), q(3, 13.5))
    m = F.part(sh, mix(hc, MOON, .12), tex=.1, ol=mix(hc, INK, .5), light=.35)
    a, b = q(5, 10), q(12, 10)
    F.line(a[0], a[1], b[0], b[1], mix(hc, MOON, .3))


def draw_hair(F, P, look):
    c = hexc(look.get('hair_color', '#2a2a2a'))
    cx, cy = P['head']
    sh = ell(cx - 1, cy - 9, 16, 9) + poly((cx - 16, cy - 8), (cx - 15, cy + 4), (cx - 10, cy - 2))
    sh += poly((cx - 9, cy - 16), (cx - 7, cy - 19), (cx - 3, cy - 17)) + poly((cx - 3, cy - 17), (cx, cy - 20), (cx + 3, cy - 17)) \
        + poly((cx + 2, cy - 16), (cx + 6, cy - 18), (cx + 8, cy - 14))
    sh += poly((cx + 9, cy - 4), (cx + 2, cy - 4), (cx + 3, cy - 9), (cx + 13, cy - 10))  # franja curta
    m = F.part(rot(sh, cx, cy, P['hrot']), c, tex=.25, clip=None, light=.3)
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, P['hrot'])
    for (dx, dy) in ((-10, -12), (-6, -14), (-2, -15), (-12, -6), (-8, -9), (2, -13)):
        F.px(*q(dx, dy), mix(c, MOON, .3))
    # costeleta
    a, b = q(-9, -1), q(-9, 5)
    F.line(a[0], a[1], b[0], b[1], mix(c, INK, .2))


def draw_goggles(F, P, look):
    cx, cy = P['head']
    r = P['hrot']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    # tira elástica
    band = poly(q(-16, -9), q(-3, -12), q(8, -12), q(15, -9), q(15, -6), q(8, -9), q(-3, -9), q(-16, -5))
    F.part(band, '#2a262a', tex=.2, light=.3)
    for t in range(-14, 13, 4):
        F.px(*q(t, -9 if t < 6 else -8), '#4a4448')
    # lentes
    for (ox, oy, rr) in ((-1, -11, 3.6), (9, -10, 4.4)):
        x, y = q(ox, oy)
        F.part(ell(x, y, rr + 1.2, rr + 1), C_BRASS, light=.35)
        F.part(ell(x + .3, y + .2, rr - .4, rr - .6), C_LENS, outline=False, light=.25)
        F.px(x - 1, y - 1, '#e8fff4'); F.px(x, y - 1, '#a8d8c8')
    a, b = q(2.5, -11), q(5, -11)
    F.line(a[0], a[1], b[0], b[1], shade(C_BRASS, .4))


def draw_pants(F, P, look):
    c = look.get('pants', C_SUIT)
    far = mix(hexc(c), NIGHT, .2)
    F.part(thigh(P, 'b', grow=2) + shin(P, 'b', grow=2, upto=.85), far, tex=.08)
    m = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=2) + shin(P, 'f', grow=2, upto=.85), c, tex=.08)
    # remendo no joelho
    kx, ky = P['kn_f']
    patch = poly((kx - 4, ky - 3), (kx + 4, ky - 4), (kx + 5, ky + 3), (kx - 3, ky + 4))
    F.part(patch, C_PATCH, clip=m, tex=.1, ol=shade(C_SUIT, .55))
    for t in range(-3, 5, 2):
        F.px(kx + t, ky - 3 - (t > 0), tone(C_PATCH, .45))
    # mancha de graxa
    hx, hy = P['hip_f']
    F.flat(ell(kx + 1, (ky + hy) / 2 + 1, 1.8, 1.2), shade(c, .45), clip=m)
    # barras dobradas
    for s, col in (('b', far), ('f', hexc(c))):
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        e = L2(kn, (ft[0], ft[1] - 3), .78)
        F.part(limb(e[0] - 1, e[1] + 1, e[0] + 1, e[1] + 1, 12, 12), mix(col, MOON, .1), tex=.05)


def draw_shoes(F, P, look):
    for s, far in (('b', True), ('f', False)):
        fx, fy = P['ft_' + DSIDE(s)]
        c = hexc(C_BOOT)
        if far:
            c = mix(c, NIGHT, .2)
        F.part(ell(fx + 3, fy - 3.5, 7, 4) + poly((fx - 3, fy - 7), (fx + 4, fy - 8), (fx + 4, fy - 3), (fx - 3, fy - 3)), c, tex=.1)
        F.part(poly((fx - 4, fy - 1.5), (fx + 10, fy - 1.5), (fx + 10, fy + .5), (fx - 4, fy + .5)), mix(c, INK, .5), shade=False)
        sc = hexc(C_STEEL) if not far else mix(hexc(C_STEEL), NIGHT, .25)
        F.px(fx + 8, fy - 4, sc); F.px(fx + 9, fy - 3, sc); F.px(fx + 7, fy - 5, mix(sc, MOON, .3))
        F.px(fx + 1, fy - 6, mix(c, MOON, .3)); F.px(fx + 3, fy - 6, mix(c, MOON, .3))   # cadarço


def draw_shirt(F, P, look):
    c = look.get('shirt', C_SUIT)
    far = mix(hexc(c), NIGHT, .2)
    F.part(upper_arm(P, 'b', w=9, grow=1), far, tex=.06)
    _cuff(F, P, 'b', far)
    F.part(torso_shapes(P, grow=2), c, tex=.07)
    # gola
    nx, ny = P['neck']
    col = mix(hexc(c), MOON, .15)
    F.part(poly((nx - 7, ny - 3), (nx - 1, ny + 1), (nx + 1, ny + 6), (nx - 6, ny + 3)), col)
    F.part(poly((nx + 10, ny - 3), (nx + 5, ny + 1), (nx + 4, ny + 6), (nx + 10, ny + 2)), col)


def _cuff(F, P, s, col):
    sh, el = P['sh_' + DSIDE(s)], P['el_' + DSIDE(s)]
    a = L2(sh, el, .78)
    b = L2(sh, el, .96)
    F.part(limb(a[0], a[1], b[0], b[1], 11, 11), mix(hexc(col) if isinstance(col, str) else col, MOON, .14), tex=.05)
    m = L2(sh, el, .85)
    F.px(m[0], m[1], mix(hexc(col) if isinstance(col, str) else col, INK, .35))


def draw_shirt_arm(F, P, look):
    c = look.get('shirt', C_SUIT)
    F.part(upper_arm(P, 'f', w=9, grow=1), c, tex=.06)
    _cuff(F, P, 'f', c)


def apron_shapes(P):
    nx, ny = P['neck']
    pv = P['pelvis']
    b, f = P['sh_b'], P['sh_f']
    lean = P['lean']
    # saia: segue a pelve, borda de baixo acompanha os joelhos
    kb, kf = P['kn_b'], P['kn_f']
    bot = pv[1] + 19 - P['kneel'] * 4
    swing = (kf[0] - kb[0]) * .12 if P['row'] == 'walk' else 0
    top = [(nx - 6, ny + 5), (nx + 10, ny + 4)]
    waist = [L2(f, P['hip_f'], .55), L2(b, P['hip_b'], .55)]
    pts = [top[0], top[1], (f[0] + 1, f[1] + 12), (waist[0][0] + 3, waist[0][1] + 2),
           (pv[0] + 15 + swing, bot - 1), (pv[0] + 8 + swing, bot + 1), (pv[0] - 4 + swing, bot + 1), (pv[0] - 10 + swing * .5, bot - 1),
           (waist[1][0] + 1, waist[1][1] + 3), (b[0] + 5, b[1] + 10)]
    return pts


def draw_apron(F, P, look):
    pts = apron_shapes(P)
    nx, ny = P['neck']
    hx, hy = P['head']
    # alça do pescoço
    F.part(limb(pts[0][0] + 1, pts[0][1], nx - 3, ny - 2, 2.5, 2.5) + limb(pts[1][0] - 1, pts[1][1], nx + 7, ny - 2, 2.5, 2.5), C_LEATHER_D, light=.2)
    m = F.part([pts], C_LEATHER, tex=.1, light=.25, dark=.32)
    # sombra vertical central (dobra do couro)
    pv = P['pelvis']
    F.part(poly((pv[0] + 1, pv[1] - 4), (pv[0] + 3, pv[1] - 4), (pv[0] + 4, pv[1] + 17), (pv[0] + 1, pv[1] + 17)), C_LEATHER_D, clip=m, outline=False, shade=False)
    # pesponto nas bordas (pontilhado claro 2 px para dentro)
    inner = dilate(dilate(~m)) & m
    inner2 = dilate(inner) & m & ~inner
    ys, xs = np.nonzero(inner2)
    for x, y in zip(xs, ys):
        if (x + y) % 3 == 0:
            F.px(x, y, mix(hexc(C_STITCH), hexc(C_LEATHER), .35))
    # bolso do ventre
    px0, py0 = pv[0] - 3, pv[1] + 2
    pk = poly((px0, py0), (px0 + 12, py0 - 1), (px0 + 12, py0 + 7), (px0, py0 + 8))
    # alicate saindo do bolso
    F.part(limb(px0 + 3, py0 + 2, px0 + 1, py0 - 6, 2.4, 2.2), '#c03a2a', clip=None, light=.3)
    F.part(limb(px0 + 5, py0 + 2, px0 + 6, py0 - 6, 2.4, 2.2), '#c03a2a', clip=None, light=.3)
    F.part(pk, C_LEATHER_D, tex=.08, light=.15)
    F.line(px0 + 1, py0 + 1, px0 + 11, py0, mix(hexc(C_STITCH), hexc(C_LEATHER), .3))
    # estopa pendurada
    F.part(poly((px0 + 9, py0), (px0 + 13, py0 - 1), (px0 + 14, py0 + 8), (px0 + 12, py0 + 6), (px0 + 10, py0 + 9)), '#e8e0cc', tex=.3, light=.2)
    # rebites de latão
    for (x, y) in (pts[0], pts[1]):
        F.px(x + (1 if x < nx else -1), y + 2, C_BRASS)
    F.px(px0 + 1, py0 + 1, C_BRASS); F.px(px0 + 11, py0 + 1, C_BRASS)
    # queimaduras de faísca
    for (dx, dy) in ((5, 12), (-1, 9), (9, 16), (-6, 20), (12, 26)):
        x, y = nx + dx - 2, ny + dy
        if m[int(min(127, y)), int(min(127, x))]:
            F.px(x, y, C_BURN); F.px(x + 1, y, mix(hexc(C_BURN), hexc('#c86a2a'), .6)); F.px(x, y - 1, mix(hexc(C_LEATHER), hexc('#c86a2a'), .4))
    # tira da cintura + laço atrás
    b = P['hip_b']
    wy = L2(P['sh_b'], P['hip_b'], .6)
    F.part(limb(wy[0] + 3, wy[1] + 2, wy[0] - 4, wy[1] + 2, 2.6, 2.6), C_LEATHER_D, light=.2)
    F.part(limb(wy[0] - 5, wy[1] + 2, wy[0] - 8, wy[1] + 9, 2.2, 2), C_LEATHER_D, light=.2)
    F.part(limb(wy[0] - 5, wy[1] + 2, wy[0] - 4, wy[1] + 10, 2.2, 2), C_LEATHER_D, light=.2)


def draw_hammer(F, P, look=None, layer=None):
    p0, p1, d, n = hammer_pts(P)
    hx, hy = P['ha_f']
    F.part(limb(p0[0], p0[1], p1[0] - d[0] * 2, p1[1] - d[1] * 2, 3.2, 3.2), C_WOOD, tex=.1, light=.3, layer=layer)
    # fita isolante perto da mão
    for t in (5.5, 7):
        x, y = hx + d[0] * t, hy + d[1] * t
        F.px(x, y, '#1e1c22', layer)
        F.px(x + n[0], y + n[1], '#2e2c34', layer)
    # cabeça: 9 (ao longo da normal) x 6 (ao longo do cabo)
    cx, cy = p1
    hl, hw = 4.5, 3.5
    face = [(cx + n[0] * hl + d[0] * s, cy + n[1] * hl + d[1] * s) for s in (-hw, hw)]
    pena = [(cx - n[0] * (hl + .5) + d[0] * s, cy - n[1] * (hl + .5) + d[1] * s) for s in (-1.6, 1.6)]
    pts = [face[0], face[1], pena[1], pena[0]]
    F.part([pts], C_IRON, light=.35, dark=.35, layer=layer)
    # face polida
    a = (cx + n[0] * (hl - .5) - d[0] * (hw - 1), cy + n[1] * (hl - .5) - d[1] * (hw - 1))
    b = (cx + n[0] * (hl - .5) + d[0] * (hw - 1), cy + n[1] * (hl - .5) + d[1] * (hw - 1))
    F.line(a[0], a[1], b[0], b[1], '#d8dce4', layer)
    # olho do cabo
    F.px(cx, cy, shade(C_IRON, .4), layer)


def draw_weapon(F, P, look):
    if P['row'] == 'death' and P['i'] >= 3:
        return
    draw_hammer(F, P)


def draw_acc(F, P, look):
    draw_goggles(F, P, look)


def draw_bag(F, P, look):
    """no especial, a mão de trás com a tenaz passa à frente do avental."""
    if P['row'] != 'special':
        return
    hx, hy = P['ha_b']
    tip = (ANV_X - 2, ANV_TOP - 2)
    d = (tip[0] - hx, tip[1] - hy); L = math.hypot(*d); u = (d[0] / L, d[1] / L); n = (-u[1], u[0])
    for o in (-1.2, 1.2):
        F.part(limb(hx + n[0] * o, hy + n[1] * o, tip[0] + n[0] * o * .4, tip[1] + n[1] * o * .4, 1.6, 1.6), '#34343c', light=.35)
    glove(F, P, 'b', far=True)


# ---------------------------------------------------------------- especial: bigorna, brasa, faíscas

def draw_anvil(F, x, top, layer):
    c = C_ANVIL
    sh = poly((x - 10, top), (x + 8, top), (x + 17, top + 1), (x + 8, top + 4), (x + 6, top + 4), (x + 4, top + 7),
              (x + 4, top + 11), (x + 9, top + 15), (x + 9, G), (x - 10, G), (x - 10, top + 15), (x - 5, top + 11),
              (x - 5, top + 7), (x - 8, top + 4), (x - 10, top + 4))
    m = F.part(sh, c, light=.3, dark=.35, layer=layer, tex=.08)
    F.line(x - 9, top, x + 8, top, '#9aa0aa', layer)
    F.line(x - 9, top + 1, x + 7, top + 1, '#70767f', layer)
    F.px(x + 6, top + 1, '#1e1e24', layer)   # furo
    F.line(x - 9, top + 15, x + 8, top + 15, shade(c, .35), layer)


def spark_burst(F, x, y, n, seed, r0=3, r1=14):
    for k in range(n):
        h = (seed * 131 + k * 977) % 1000
        a = math.radians(-180 + (h % 180))   # para cima (leque)
        L = r0 + (h // 7) % (r1 - r0)
        col = ['#ffffff', '#ffe680', '#ffb040', '#ff7a2a'][k % 4]
        ex, ey = x + math.cos(a) * L, y + math.sin(a) * L
        F.px(ex, ey, col, F.fx)
        F.px(x + math.cos(a) * (L - 2), y + math.sin(a) * (L - 2), '#ffcc55', F.fx)
        if k % 3 == 0:
            F.px(x + math.cos(a) * (L - 4), y + math.sin(a) * (L - 4), '#ff9a30', F.fx, alpha=170)


def falling_sparks(F, x, y, n, seed):
    for k in range(n):
        h = (seed * 53 + k * 389) % 1000
        ex = x - 12 + h % 28
        ey = y - 14 + (h // 13) % 20
        F.px(ex, ey, ['#ffe680', '#ff9a30', '#ffcc55'][k % 3], F.fx)
        F.px(ex, ey + 1, '#c05a20', F.fx, alpha=150)


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'special':
        x, top = ANV_X, ANV_TOP
        # bigorna fica atrás do martelo: desenha numa camada temporária sob o boneco
        A = np.zeros((S, S, 4), np.uint8)
        draw_anvil(F, x, top, A)
        # barra em brasa / lâmina
        if i < 5:
            heat = ['#ffd070', '#ffe080', '#ffb040', '#ff9a40', '#ff8a2a'][i]
            F.part(poly((x - 6, top - 2), (x + 5, top - 2), (x + 7, top - 1), (x + 5, top), (x - 6, top)), heat, shade=False, ol='#8a2a10', layer=A)
            F.px(x - 2, top - 1, '#fff6c8', A)
            for k in range(-8, 9, 3):   # brilho
                F.px(x + k, top - 4 - (k % 2), '#ff9a30', A, alpha=110)
        else:
            F.part(poly((x - 7, top - 2), (x + 6, top - 2), (x + 9, top - 1), (x + 6, top), (x - 7, top)), '#b8bec8', shade=False, ol='#2a2c34', layer=A)
            F.line(x - 6, top - 2, x + 6, top - 2, '#ffffff', A)
            sparkle(F, x + 3, top - 8, 3)
            sparkle(F, x - 6, top - 5, 2)
        # bigorna atrás do corpo? não: ela está à frente; o corpo não a cobre (x>94). Cola sob o sprite.
        F.a[:] = over(A, F.a)
        if i == 0:
            dust(F, x - 12, G - 2, 3); dust(F, x + 11, G - 2, 3)
            for k in range(3):
                F.px(x - 14 + k * 3, top - 6 - k, '#e8e0d0', F.fx)
        if i in (2, 4):
            spark_burst(F, x, top - 3, 14 if i == 2 else 20, i, 3, 15 if i == 2 else 19)
            if i == 4:
                for (dx, dy) in ((-4, -3), (-3, -5), (-1, -6), (5, -5), (6, -3), (7, -6)):
                    F.px(x + 2 + dx, top - 2 + dy, '#ffffff', F.fx)
        if i == 3:
            falling_sparks(F, x, top - 2, 9, 7)
    elif row == 'attack' and 'hit' in P:
        impact(F, P['hit'][0], P['hit'][1], 5)
    elif row == 'death' and i >= 3:
        # martelo caído no chão
        Q = dict(P)
        Q['ha_f'] = (22 if i > 3 else 30, G - 3 if i > 3 else G - 12)
        Q['grip'] = 5 if i > 3 else -40
        draw_hammer(F, Q, layer=F.fx)


DRAW = {'body': draw_body, 'arm': draw_arm, 'face': draw_face, 'beard': draw_beard, 'hair': draw_hair,
        'pants': draw_pants, 'shoes': draw_shoes, 'shirt': draw_shirt, 'shirt_arm': draw_shirt_arm,
        'jacket': draw_apron, 'acc': draw_acc, 'weapon': draw_weapon, 'bag': draw_bag}


def frame(look, row, i):
    P = pose(row, i, look.get('body', 'm'))
    adjust(P)
    F = Frame()
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return finish(F, P)


SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']


def main():
    os.makedirs(OUT, exist_ok=True)
    sheet_im = person_sheet(LOOK, draw=DRAW, rows=ROWS, adjust=adjust, extra=extra)
    sheet_im.save(os.path.join(OUT, ID + '.png'))
    var = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            var[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(dict(LOOK, skin=sk, hair_color=hc), 'idle', 0)
    var_im = Image.fromarray(var, 'RGBA')
    var_im.save(os.path.join(OUT, ID + '_variantes.png'))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]
        bg = Image.new('RGBA', sheet_im.size, (70, 66, 80, 255))
        bg.alpha_composite(sheet_im)
        bg.resize((sheet_im.width * 2, sheet_im.height * 2), Image.NEAREST).save(os.path.join(d, ID + '_prev.png'))
        for r in range(6):
            crop = bg.crop((0, r * S, 1024, (r + 1) * S))
            crop.resize((1024 * 2, 256), Image.NEAREST).save(os.path.join(d, ID + '_row%d.png' % r))
        bv = Image.new('RGBA', var_im.size, (70, 66, 80, 255)); bv.alpha_composite(var_im)
        bv.save(os.path.join(d, ID + '_var.png'))
    print('ok', sheet_im.size, var_im.size)


if __name__ == '__main__':
    main()
