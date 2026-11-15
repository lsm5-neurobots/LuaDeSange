"""Recruta: Pedreira — mestre de obras (Construção). Gera recrutas/pedreira.png e recrutas/pedreira_variantes.png.
Rodar dentro de tools:  python recruta_pedreira.py   [--preview DIR]
"""
import os
import sys
import math

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import humano as H                      # noqa: E402
from humano import *                    # noqa: E402,F401,F403

ID = 'pedreira'
LOOK = dict(body='f', skin='#c68a5e', hair_color='#4a2a14', shirt='#bdb8ac', pants='#3e5c88', shoes='#9a6a38',
            vest='#d9862a', eye='#3a2414')

HELMET = '#f0a81c'
HELMET_HI = '#ffd45a'
REFL = '#d8dde2'
GLOVE = '#e6e0d0'
GLOVE_DOT = '#e0702a'
STEEL = '#c4cad0'
WOOD = '#8a5a30'
IRON = '#5a5e66'
MASSA = '#b8ae9c'
BRICK = ['#b5532f', '#a84a2a', '#c0603a', '#9e4426', '#b04e2c']
BELT = '#6a4024'
TAPE = '#f2c230'


def C(h):
    return hexc(h) if isinstance(h, str) else h


def dk(c, t=.3):
    return mix(C(c), INK, t)


def lt(c, t=.3):
    return mix(C(c), MOON, t)


# ------------------------------------------------------------------ pose (cópia do miolo do humano.pose)

def arms(P):
    for s in ('b', 'f'):
        sh, ha = P['sh_' + s], P['ha_' + s]
        d = math.hypot(ha[0] - sh[0], ha[1] - sh[1])
        if d > H.ARM_L * .98:
            t = H.ARM_L * .98 / d
            P['ha_' + s] = ha = (sh[0] + (ha[0] - sh[0]) * t, sh[1] + (ha[1] - sh[1]) * t)
        P['el_' + s] = two_bone(sh[0], sh[1], ha[0], ha[1], H.ARM_L, bend_dir=(1 if s == 'b' else -1))


def legs(P):
    for s in ('b', 'f'):
        hp, ft = P['hip_' + s], P['ft_' + s]
        d = math.hypot(ft[0] - hp[0], ft[1] - hp[1])
        if d > H.LEG_L:
            t = H.LEG_L / d
            P['ft_' + s] = ft = (hp[0] + (ft[0] - hp[0]) * t, hp[1] + (ft[1] - hp[1]) * t)
        P['kn_' + s] = two_bone(hp[0], hp[1], ft[0], ft[1], H.LEG_L, bend_dir=-1)


def build(P, lean=0, bob=0, sway=0, hf=(0, 0), hb=(0, 0), ff=(0, 0), fb=(0, 0), hd=(0, 0)):
    B = H._base(P['body'])
    P['lean'] = lean
    pel = ((B['hip_b'][0] + B['hip_f'][0]) / 2 + sway * .5, B['hip_b'][1] + bob)
    P['pelvis'] = pel

    def T(p):
        return rp(p[0] + sway, p[1] + bob, pel[0], pel[1], lean)
    for k in ('head', 'neck', 'sh_b', 'sh_f'):
        P[k] = T(B[k])
    P['head'] = (P['head'][0] + hd[0], P['head'][1] + hd[1])
    P['hrot'] = lean * .5
    for k in ('hip_b', 'hip_f'):
        P[k] = (B[k][0] + sway * .5, B[k][1] + bob)
    for s, o in (('b', hb), ('f', hf)):
        P['ha_' + s] = (P['sh_' + s][0] + B['ha_' + s][0] - B['sh_' + s][0] + o[0],
                        P['sh_' + s][1] + B['ha_' + s][1] - B['sh_' + s][1] + o[1])
    arms(P)
    P['ft_b'] = (B['ft_b'][0] + fb[0], G - fb[1])
    P['ft_f'] = (B['ft_f'][0] + ff[0], G - ff[1])
    legs(P)


def set_hand(P, s, xy):
    P['ha_' + s] = xy
    arms(P)


# especial: (lean, bob, mão da frente absoluta, mão de trás offset, grip, olhos, boca)
SPEC = [
    dict(lean=6, bob=2, ha=(90, 74), hb=(2, -2), grip=20, eyes='open', mouth='line'),
    dict(lean=14, bob=5, ha=(101, 84), hb=(4, -4), grip=0, eyes='open', mouth='line'),
    dict(lean=12, bob=4, ha=(102, 79), hb=(-2, -2), grip=80, eyes='wide', mouth='line'),
    dict(lean=15, bob=5, ha=(104, 84), hb=(-2, -2), grip=80, eyes='angry', mouth='grit'),
    dict(lean=12, bob=4, ha=(103, 73), hb=(2, -2), grip=-95, eyes='angry', mouth='open'),
    dict(lean=2, bob=0, ha=None, hb=(0, 0), grip=75, eyes='happy', mouth='smile'),
]


def adjust(P):
    row, i = P['row'], P['i']
    P['brow_thick'] = True
    if row == 'idle':
        P['grip'] = 72
        P['mouth'] = 'smirk'
    elif row == 'walk':
        s = math.sin(2 * math.pi * i / 8)
        P['grip'] = 66 + 10 * s
        P['mouth'] = 'smirk'
    elif row == 'attack':
        if i == 0:
            P['fx'] = []
        # impacto na cabeça da marreta
        if i in (2, 3, 4):
            hx, hy = P['ha_f']
            set_hand(P, 'f', (hx - (7 if i == 3 else 4), hy))
        P['fx'] = []
    elif row == 'hurt':
        P['grip'] = 95
    elif row == 'death':
        P['grip'] = 70
    elif row == 'special':
        q = SPEC[i]
        build(P, lean=q['lean'], bob=q['bob'], hb=q['hb'], ff=(5, 0), fb=(-2, 0))
        if q['ha']:
            set_hand(P, 'f', q['ha'])
        P['grip'] = q['grip']
        P['eyes'] = q['eyes']
        P['mouth'] = q['mouth']
        P['fx'] = []


# ------------------------------------------------------------------ helpers de cabeça

def hq(P):
    cx, cy = P['head']
    r = P['hrot']
    return lambda x, y: rp(cx + x, cy + y, cx, cy, r)


def hpoly(P, pts):
    q = hq(P)
    return [[q(x, y) for x, y in pts]]


def hell(P, x, y, rx, ry, rot_=0):
    cx, cy = P['head']
    return rot(ell(cx + x, cy + y, rx, ry, rot_), cx, cy, P['hrot'])


# ------------------------------------------------------------------ camadas

def draw_body(F, P, look):
    c = H.skin_col(look)
    far = mix(hexc(c), NIGHT, .18)
    F.part(thigh(P, 'b') + shin(P, 'b'), far)
    F.part(foot_shapes(P, 'b'), far)
    F.part(upper_arm(P, 'b') + fore_arm(P, 'b'), far)
    glove(F, P, 'b')
    F.part(thigh(P, 'f') + shin(P, 'f'), c)
    F.part(foot_shapes(P, 'f'), c)
    F.part(torso_shapes(P) + pelvis_shapes(P), c)
    F.part(neck_shapes(P), mix(hexc(c), NIGHT, .12))
    F.part(head_shapes(P), c)
    F.part(ear_shapes(P), c)
    q = hq(P)
    x, y = q(-13, 3)
    F.px(x + 1, y, dk(c, .35)); F.px(x + 1, y + 1, dk(c, .35))
    F.part(nose_shapes(P), c, outline=False, light=.35)


def glove(F, P, s):
    hx, hy = P['ha_' + DSIDE(s)]
    el = P['el_' + DSIDE(s)]
    base = GLOVE if s == 'f' else mix(hexc(GLOVE), NIGHT, .2)
    # punho canelado
    w = L2(P['ha_' + DSIDE(s)], el, .28)
    F.part(limb(w[0], w[1], hx, hy, 6, 6), lt(base, .1) if s == 'f' else base, tex=.0)
    m = F.part(ell(hx, hy, 4.2, 4.2), base, tex=.25)
    # pontinhos de borracha laranja (palma)
    dot = GLOVE_DOT if s == 'f' else mix(hexc(GLOVE_DOT), NIGHT, .25)
    for dx, dy in ((0, 1), (2, 2), (-1, 3), (1, 3), (2, 0)):
        if m[int(round(hy + dy)) % S, int(round(hx + dx)) % S]:
            F.px(hx + dx, hy + dy, dot)


def draw_arm(F, P, look):
    c = H.skin_col(look)
    F.part(upper_arm(P, 'f') + fore_arm(P, 'f'), c)
    glove(F, P, 'f')


def draw_face(F, P, look):
    look2 = dict(look)
    hc = hexc(look.get('hair_color', '#4a2a14'))
    look2['brow'] = mix(hc, INK, .35)
    mouth = P['mouth']
    if mouth == 'smirk':
        P['mouth'] = 'line'
    H.draw_face(F, P, look2)
    P['mouth'] = mouth
    fp = H.face_pts(P)
    sk = hexc(H.skin_col(look))
    # sobrancelha grossa: 2a linha
    for k in ('brow_b', 'brow_f'):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if P['eyes'] == 'angry':
            F.line(x - 2, y - 2, x + 1, y, look2['brow'])
        elif P['eyes'] == 'wide':
            F.line(x - 2, y - 3, x + 2, y - 3, look2['brow'])
        else:
            F.line(x - 2, y - 1, x + 1, y - 2, look2['brow'])
    if mouth == 'smirk':
        x, y = fp['mouth']
        x, y = int(round(x)), int(round(y))
        F.px(x + 3, y - 1, '#5a2a24')
        F.px(x - 3, y + 1, mix(sk, INK, .3))
    # mancha de cimento na bochecha + poeira
    x, y = fp['cheek']
    x, y = int(round(x)), int(round(y))
    F.px(x - 2, y + 2, '#b8b2a6'); F.px(x - 1, y + 2, '#cfc9bd'); F.px(x - 2, y + 3, '#a8a296')
    q = hq(P)
    for (a, b) in ((2, -7), (3, -7), (6, -6)):
        X, Y = q(a, b)
        F.px(X, Y, mix(sk, hexc('#8a7a64'), .5))


def hair_cols(look):
    c = hexc(look.get('hair_color', '#4a2a14'))
    return c, mix(c, INK, .3), mix(c, MOON, .25)


def tail_swing(P):
    row, i = P['row'], P['i']
    if row == 'walk':
        return 3 * math.sin(2 * math.pi * i / 8 + 1.2)
    if row == 'attack':
        return [1, 4, -3, -5, -2, 0][i]
    if row == 'hurt':
        return [2, 5, 3, 1][i]
    if row == 'idle':
        return [0, .5, 1, .5][i]
    if row == 'special':
        return [0, -2, -1, -3, -2, 0][i]
    return 0


def draw_hair_back(F, P, look):
    c, d, l = hair_cols(look)
    q = hq(P)
    sw = tail_swing(P)
    pts = [q(-12, -4), q(-17 - sw * .3, 1), q(-20 - sw * .7, 8), q(-21 - sw, 15), q(-20 - sw * 1.2, 20)]
    m = F.part(chain(pts, 8, 3), c, tex=.18)
    # fios
    for k in range(len(pts) - 1):
        a, b = pts[k], pts[k + 1]
        F.line(a[0] + 1, a[1] + 1, b[0] + .5, b[1], d)
    a, b = pts[1], pts[2]
    F.px((a[0] + b[0]) / 2 - 2, (a[1] + b[1]) / 2, l)
    # elástico vermelho
    x, y = q(-15, -1)
    F.part(limb(x - 1, y - 2, x + 2, y + 2, 3, 3), '#c9343a', light=.3)


def draw_hair(F, P, look):
    c, d, l = hair_cols(look)
    # calota (vai ficar quase toda sob o capacete) + franja + mecha na frente da orelha
    sh = hell(P, 0, -8, 15.5, 8.5)
    sh += hpoly(P, [(-15, -8), (-14, 3), (-9, 6), (-7, -3), (-3, -6)])      # lateral/mecha
    sh += hpoly(P, [(2, -9), (13, -9), (15, -5), (11, -4), (8, -6), (5, -4), (2, -6)])   # franja
    F.part(sh, c, tex=.15)
    q = hq(P)
    for a, b in (((-12, -4), (-11, 3)), ((-9, -5), (-8, 4)), ((9, -7), (11, -5))):
        F.line(*q(*a), *q(*b), d)
    x, y = q(-10, 0)
    F.px(x, y, l)


def helmet(F, P, layer=None):
    """capacete de obra (aba longa para a frente)."""
    q = hq(P)
    lay = F.a if layer is None else layer
    # aba (atrás do domo): elipse achatada + bico na frente
    brim = hpoly(P, [(-17, -8), (-16, -10), (0, -11), (18, -10), (24, -8), (23, -6), (14, -5), (0, -5.5), (-15, -5.5)])
    F.part(brim, dk(HELMET, .12), layer=lay, light=.3)
    # domo (meia elipse)
    arc = []
    for k in range(0, 21):
        a = math.pi + math.pi * k / 20
        arc.append((1 + 16 * math.cos(a), -8 + 13.5 * math.sin(a)))
    dome = hpoly(P, arc + [(17, -7), (-15, -7)])
    m = F.part(dome, HELMET, layer=lay, light=.32, dark=.28)
    # nervura central (curva, levemente à direita do centro em 3/4)
    rib = []
    for k in range(0, 9):
        a = math.pi * (1.12 + .76 * k / 8)
        rib.append((4 + 9 * math.cos(a), -8 + 14.5 * math.sin(a)))
    for k in range(len(rib) - 1):
        F.part(limb(*q(*rib[k]), *q(*rib[k + 1]), 3, 3), HELMET_HI, layer=lay, outline=False, shade=False, clip=m)
    for k in range(len(rib) - 1):
        a, b = q(rib[k][0] + 2, rib[k][1] + 1), q(rib[k + 1][0] + 2, rib[k + 1][1] + 1)
        F.line(a[0], a[1], b[0], b[1], dk(HELMET, .35), layer=lay)
    # brilho
    for (a, b) in ((-9, -15), (-8, -16), (-7, -17), (-10, -13)):
        F.px(*q(a, b), lt(HELMET_HI, .5), layer=lay)
    # arranhões
    for seg in (((-4, -11), (-1, -12)), ((9, -14), (12, -13)), ((-11, -10), (-9, -9)), ((12, -9), (14, -10))):
        a, b = q(*seg[0]), q(*seg[1])
        F.line(a[0], a[1], b[0], b[1], dk(HELMET, .45), layer=lay)
    # adesivo bandeirinha do Brasil
    x0, y0 = 9, -13
    for yy in range(4):
        for xx in range(6):
            F.px(*q(x0 + xx, y0 + yy), '#2a9a3a', layer=lay)
    for (xx, yy) in ((2, 0), (3, 0), (1, 1), (4, 1), (1, 2), (4, 2), (2, 3), (3, 3)):
        F.px(*q(x0 + xx, y0 + yy), '#f2d21a', layer=lay)
    for (xx, yy) in ((2, 1), (3, 1), (2, 2), (3, 2)):
        F.px(*q(x0 + xx, y0 + yy), '#2a4aa0', layer=lay)
    # borda inferior do domo (faixa da carneira) e brilho da aba
    a, b = q(-14, -7), q(16, -7)
    F.line(a[0], a[1], b[0], b[1], dk(HELMET, .4), layer=lay)
    a, b = q(15, -10), q(22, -8)
    F.line(a[0], a[1], b[0], b[1], lt(HELMET, .45), layer=lay)


def draw_head(F, P, look):
    if P['row'] == 'death' and P['i'] >= 3:
        return
    helmet(F, P)


def draw_acc(F, P, look):
    # lápis de carpinteiro atrás da orelha
    q = hq(P)
    a, b = q(-20, 1), q(-8, -3)
    F.part(limb(a[0], a[1], b[0], b[1], 3, 3), '#ffd23a', light=.45, dark=.12, ol='#4a3008')
    F.line(*q(-18, 0), *q(-10, -3), '#fff0a0')
    F.px(*q(-20, 1), '#f09aaa'); F.px(*q(-19, 1), '#e88a9a')
    F.px(*q(-18, 1), '#b0b0b8')
    F.px(*q(-7, -3), '#e8c090'); F.px(*q(-6, -4), '#2a2a2a')


def draw_pants(F, P, look):
    c = look.get('pants', '#3e5c88')
    far = mix(hexc(c), NIGHT, .22)
    mb = F.part(thigh(P, 'b', grow=1) + shin(P, 'b', grow=1, upto=.85), far, tex=.12)
    mf = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=1) + shin(P, 'f', grow=1, upto=.85), c, tex=.12)
    # costura lateral clara
    for s, m in (('b', mb), ('f', mf)):
        hp, kn, ft = P['hip_' + DSIDE(s)], P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        e = L2(kn, ft, .7)
        for a, b in ((hp, kn), (kn, e)):
            n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
            for k in range(n + 1):
                t = k / n
                x, y = a[0] + (b[0] - a[0]) * t - 3, a[1] + (b[1] - a[1]) * t
                if k % 2 == 0 and m[int(y) % S, int(x) % S]:
                    F.px(x, y, lt(c, .35) if s == 'f' else lt(far, .25))
    # joelho de trás desbotado
    kx, ky = P['kn_b']
    F.part(ell(kx + 1, ky, 3, 3.5), lt(far, .18), outline=False, shade=False, clip=mb)
    # respingos de cimento nas canelas
    for s in ('b', 'f'):
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        for t, ox in ((.35, 1), (.55, -2), (.7, 2), (.5, 3)):
            x, y = L2(kn, ft, t)
            if (mf if s == 'f' else mb)[int(y + 0) % S, int(x + ox) % S]:
                F.px(x + ox, y, '#cfc6b4' if s == 'f' else '#a8a094')
    # joelheira de borracha na perna da frente
    kx, ky = P['kn_f']
    F.part(ell(kx + 1.5, ky + .5, 4.5, 5), '#34343a', light=.25)
    F.line(kx - 3, ky - 4, kx - 3, ky + 4, '#202024')
    F.px(kx + 1, ky - 2, '#5a5a62'); F.px(kx + 2, ky - 2, '#6a6a72'); F.px(kx + 3, ky + 1, '#4a4a52')


def draw_shoes(F, P, look):
    c = look.get('shoes', '#9a6a38')
    for s in ('b', 'f'):
        col = hexc(c) if s == 'f' else mix(hexc(c), NIGHT, .22)
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        top = L2(kn, (ft[0], ft[1] - 3), .8)
        fx, fy = ft
        sole = poly((fx - 4, fy - 1.5), (fx + 10, fy - 1.5), (fx + 10, fy + .5), (fx - 4, fy + .5))
        F.part(sole, '#2e2218', light=.1)
        m = F.part(limb(top[0], top[1], fx + .5, fy - 4, 9, 9) + ell(fx + 3.5, fy - 3, 6.5, 3.2), col, tex=.18)
        F.part(ell(fx + 7.5, fy - 3, 2.6, 2.2), dk(col, .25), outline=False, clip=m, light=.3)   # biqueira
        # cadarço
        for k in range(2):
            x, y = L2(top, (fx + 1, fy - 4), .35 + .3 * k)
            F.px(x + 2, y, '#e8dcc0'); F.px(x + 3, y - 1, '#e8dcc0')
        # tratorado
        for xx in range(-3, 10, 3):
            F.px(fx + xx, fy + .5, '#140e0a')


def shirt_clip(P):
    """o que fica acima da cintura (camiseta por dentro da calça)."""
    m = np.zeros((S, S), bool)
    m[:int(P['pelvis'][1]) - 1, :] = True
    return m


def draw_shirt(F, P, look):
    c = look.get('shirt', '#bdb8ac')
    sb, eb = P['sh_b'], P['el_b']
    e = L2(sb, eb, .55)
    F.part(limb(sb[0], sb[1] + 1, e[0], e[1], 9, 8.5), mix(hexc(c), NIGHT, .22), tex=.2)
    F.part(torso_shapes(P, grow=1), c, tex=.2, clip=shirt_clip(P) | ~F.mask(pelvis_shapes(P, 3)))
    # gola careca
    nx, ny = P['neck']
    F.line(nx - 4, ny - 1, nx + 4, ny - 1, dk(c, .4))
    F.line(nx - 3, ny, nx + 3, ny, lt(c, .3))


def draw_shirt_arm(F, P, look):
    c = look.get('shirt', '#bdb8ac')
    sf, ef = P['sh_f'], P['el_f']
    e = L2(sf, ef, .55)
    m = F.part(limb(sf[0], sf[1] + 1, e[0], e[1], 9, 8.5), c, tex=.2)
    # barra da manga (costura)
    e2 = L2(sf, ef, .45)
    F.part(limb(e2[0], e2[1], e[0], e[1], 9, 8.5), dk(c, .1), outline=False, shade=False, clip=m)


def lean_band(P, y0, y1):
    """faixa horizontal no tronco (gira com o lean)."""
    pel = P['pelvis']
    pts = [(20, y0), (110, y0), (110, y1), (20, y1)]
    return [[rp(x, y, pel[0], pel[1], P['lean']) for x, y in pts]]


def draw_vest(F, P, look):
    c = look.get('vest', '#d9862a')
    far = mix(hexc(c), NIGHT, .2)
    shirt = look.get('shirt', '#bdb8ac')
    pel = P['pelvis']
    cut = ~F.mask(lean_band(P, pel[1] - 3, pel[1] + 20))   # termina na cintura
    m = F.part(torso_shapes(P, grow=2), c, tex=.06, clip=cut)
    nx, ny = P['neck']
    # abertura da frente mostrando a camiseta
    op = poly((nx - 1, ny + 1), (nx + 7, ny + 1), (pel[0] + 9, pel[1] - 2), (pel[0] + 4, pel[1] - 2))
    om = F.part(op, shirt, clip=m, outline=False, tex=.2)
    vest_only = m & ~om
    # faixas refletivas
    sy = P['sh_f'][1]
    for y0 in (sy + 8, sy + 15):
        bm = F.part(lean_band(P, y0, y0 + 3), REFL, clip=vest_only, outline=False, light=.4, dark=.2)
        bd = F.mask(lean_band(P, y0 - 1, y0)) & vest_only
        F.a[bd, :3] = dk(c, .35); F.a[bd, 3] = 255
        bd = F.mask(lean_band(P, y0 + 3, y0 + 4)) & vest_only
        F.a[bd, :3] = dk(c, .35); F.a[bd, 3] = 255
        ys, xs = np.nonzero(bm)
        if len(xs):
            row0 = ys.min()
            for k in range(len(xs)):
                if ys[k] == row0 and xs[k] % 4 == 0:
                    F.px(xs[k], ys[k], '#ffffff')
    # bordas da abertura (viés)
    F.line(nx - 1, ny + 2, pel[0] + 4, pel[1] - 3, dk(c, .5))
    F.line(nx + 7, ny + 2, pel[0] + 9, pel[1] - 3, dk(c, .5))
    # bolso de peito com caderninho
    bx, by = L2(P['sh_f'], P['hip_f'], .3)
    bx -= 3
    F.part(poly((bx, by), (bx + 6, by), (bx + 6, by + 6), (bx, by + 6)), dk(c, .08), light=.15, clip=vest_only)
    F.part(poly((bx + 1, by - 2), (bx + 4, by - 2), (bx + 4, by + 1), (bx + 1, by + 1)), '#e8e2cc', outline=False)
    F.line(bx, by + 1, bx + 6, by + 1, dk(c, .4))
    # respingos de massa e terra na barra
    ys, xs = np.nonzero(vest_only)
    if len(xs):
        for k in range(11, len(xs), 71):
            F.px(xs[k], ys[k], '#e2d8c4' if k % 2 else '#8a6a40')
    # gola em V
    F.part(poly((nx - 6, ny - 2), (nx - 1, ny + 1), (nx, ny + 6), (nx - 5, ny + 3)), lt(c, .12))
    F.part(poly((nx + 12, ny - 2), (nx + 7, ny + 1), (nx + 6, ny + 6), (nx + 11, ny + 3)), lt(c, .12))


def marreta_shapes(p0, a, length=16, hs=1.0):
    """cabo de p0 ao longo de a + cabeça perpendicular."""
    ca, sa = math.cos(a), math.sin(a)
    n = (-sa, ca)
    tip = (p0[0] + ca * length, p0[1] + sa * length)
    hw, hl = 3.4 * hs, 6 * hs
    head = [(tip[0] + n[0] * hl - ca * hw, tip[1] + n[1] * hl - sa * hw), (tip[0] + n[0] * hl + ca * hw, tip[1] + n[1] * hl + sa * hw),
            (tip[0] - n[0] * hl + ca * hw, tip[1] - n[1] * hl + sa * hw), (tip[0] - n[0] * hl - ca * hw, tip[1] - n[1] * hl - sa * hw)]
    return tip, head


def draw_marreta(F, P, p0, a, length=16, layer=None, dim=0.0, hs=1.0):
    lay = F.a if layer is None else layer
    ca, sa = math.cos(a), math.sin(a)
    tip, head = marreta_shapes(p0, a, length, hs)
    wood = mix(hexc(WOOD), NIGHT, dim)
    F.part(limb(p0[0], p0[1], tip[0], tip[1], 3.5 * min(hs, 1.15), 3.5 * min(hs, 1.15)), wood, tex=.2, layer=lay)
    hm = F.part([head], mix(hexc(IRON), NIGHT, dim), layer=lay, light=.35)
    # faces de bater mais claras
    n = (-sa, ca)
    for sgn in (1, -1):
        x, y = tip[0] + n[0] * (6 * hs - 1.2) * sgn, tip[1] + n[1] * (6 * hs - 1.2) * sgn
        F.part(limb(x - ca * 2.6 * hs, y - sa * 2.6 * hs, x + ca * 2.6 * hs, y + sa * 2.6 * hs, 1.8, 1.8), mix(hexc('#9aa0a8'), NIGHT, dim),
               outline=False, shade=False, layer=lay, clip=hm)
    F.px(tip[0] - ca * 1, tip[1] - sa * 1, '#2a2a2e', layer=lay)


def draw_trowel(F, P, s='f', load=False, dim=0.0):
    hx, hy = P['ha_' + s]
    a = math.radians(P['grip'])
    ca, sa = math.cos(a), math.sin(a)
    n = (-sa, ca)

    def p(t, w=0):
        return (hx + ca * t + n[0] * w, hy + sa * t + n[1] * w)
    wood = mix(hexc(WOOD), NIGHT, dim)
    steel = mix(hexc(STEEL), NIGHT, dim)
    # lâmina (losango) — atrás do cabo
    blade = [p(7, -1), p(11, -4.5), p(20, 0), p(11, 4.5)]
    m = F.part([blade], steel, light=.45, dark=.35)
    a0, b0 = p(9, -1.5), p(17, -0.5)
    F.line(a0[0], a0[1], b0[0], b0[1], '#ffffff')
    a0, b0 = p(9, 0), p(19, 0)
    F.line(a0[0], a0[1], b0[0], b0[1], dk(steel, .25))
    # massa grudada
    if load:
        F.part(ell(*p(13, -1), 4.5, 3.2, P['grip']) + ell(*p(16, 1), 3, 2.2, P['grip']), MASSA, tex=.35, light=.3)
    else:
        F.part(ell(*p(18, 1), 1.6, 1.2), MASSA, outline=False, clip=m)
    # pescoço de ferro
    a0, b0 = p(3, 0), p(7, -1)
    F.line(a0[0], a0[1], b0[0], b0[1], '#3a3a40')
    F.line(a0[0], a0[1] + 1, b0[0], b0[1] + 1, '#5a5a62')
    # cabo
    q0, q1 = p(-6), p(2)
    F.part(limb(q0[0], q0[1], q1[0], q1[1], 4, 3.5), wood, tex=.25, light=.3)
    F.part(ell(*p(2.6), 1.8, 1.8), '#8a8a90', outline=False)
    return p


def draw_weapon(F, P, look):
    row, i = P['row'], P['i']
    if row == 'attack':
        hx, hy = P['ha_f']
        a = math.radians(P['grip'])
        p0 = (hx - math.cos(a) * 4, hy - math.sin(a) * 4)
        draw_marreta(F, P, p0, a, 21, hs=1.25)
        glove(F, P, 'f')       # mão por cima do cabo
        return
    if row == 'special':
        if i in (2, 3):
            # colher na mão de trás (aparece atrás)
            return
        draw_trowel(F, P, 'f', load=(i == 0))
        glove(F, P, 'f')
        return
    draw_trowel(F, P, 'f')
    glove(F, P, 'f')


def draw_bag(F, P, look):
    """cinto, trena e marreta pendurada."""
    hb, hf = P['hip_b'], P['hip_f']
    y = P['pelvis'][1] - 2
    belt = poly((hb[0] - 6, y - 1.5), (hf[0] + 6, y - 1.5), (hf[0] + 6, y + 1.5), (hb[0] - 6, y + 1.5))
    F.part(belt, BELT, light=.25)
    bx = (hb[0] + hf[0]) / 2 + 3
    F.part(poly((bx - 2, y - 2), (bx + 2, y - 2), (bx + 2, y + 2), (bx - 2, y + 2)), '#c8b070', light=.4)
    F.px(bx, y, BELT)
    # passadores
    for xx in (hb[0] - 2, hf[0] + 3):
        F.px(xx, y - 1, dk(BELT, .3)); F.px(xx, y, dk(BELT, .3)); F.px(xx, y + 1, dk(BELT, .3))
    # trena na frente
    tx, ty = hf[0] + 5, y + 4
    F.part(ell(tx, ty, 3.6, 3.6) + poly((tx - 3.5, ty), (tx + 3.5, ty), (tx + 3.5, ty + 3.6), (tx - 3.5, ty + 3.6)), TAPE, light=.35)
    F.part(ell(tx - .5, ty + .5, 1.6, 1.6), '#2a2a2e', outline=False)
    F.px(tx + 4, ty + 3, '#d8d8dc'); F.px(tx + 5, ty + 3, '#a8a8b0')
    F.line(tx - 1, ty - 4, tx - 1, ty - 2, '#9a9aa0')
    # marreta pendurada atrás (cabeça para cima)
    if P['row'] != 'attack':
        draw_marreta(F, P, (hb[0] - 7, y + 15), -math.pi / 2 - .12, 14, dim=.18)


def draw_back_trowel(F, P):
    """colher na mão de trás durante o especial (quadros 2-3)."""
    P2 = dict(P)
    P2['grip'] = 95
    draw_trowel(F, P2, 'b', dim=.2)


DRAW = {
    'hair_back': draw_hair_back, 'body': draw_body, 'face': draw_face, 'pants': draw_pants, 'shoes': draw_shoes,
    'shirt': draw_shirt, 'jacket': draw_vest, 'bag': draw_bag, 'arm': draw_arm, 'shirt_arm': draw_shirt_arm,
    'jacket_arm': None, 'beard': None, 'hair': draw_hair, 'head': draw_head, 'acc': draw_acc, 'weapon': draw_weapon,
}


# ------------------------------------------------------------------ mureta do especial

WALL_X0, WALL_X1 = 88, 118
SLOT = (99, 110)          # vaga do tijolo novo na fiada 4 (topo y=88)


def brick(F, x0, y0, x1, y1, col, layer=None):
    m = F.part(poly((x0, y0), (x1, y0), (x1, y1), (x0, y1)), col, outline=False, tex=.22, light=.28, dark=.25, layer=layer)
    return m


def draw_wall(F, i):
    # sombra no chão
    F.flat(ell((WALL_X0 + WALL_X1) / 2 + 2, G + 1, 18, 2.6), (30, 20, 40), alpha=90)
    top = 88
    # fundo de massa (juntas)
    F.part(poly((WALL_X0, top + 6), (WALL_X1, top + 6), (WALL_X1, G), (WALL_X0, G)), '#a89e8c', light=.15)
    F.part(poly((WALL_X0, top), (SLOT[0] - 1, top), (SLOT[0] - 1, top + 6), (WALL_X0, top + 6)), '#a89e8c', light=.15)
    k = 0
    for r in range(3):
        y1 = G - 6 * r - 1
        y0 = y1 - 4
        off = 0 if r % 2 == 0 else -6
        x = WALL_X0 + off
        while x < WALL_X1:
            a, b = max(WALL_X0 + 1, x + 1), min(WALL_X1 - 1, x + 11)
            if b - a >= 2:
                brick(F, a, y0, b, y1, BRICK[k % len(BRICK)])
            k += 1
            x += 12
    # fiada 4: meio tijolo à esquerda
    brick(F, WALL_X0 + 1, top + 1, SLOT[0] - 2, top + 5, BRICK[3])
    # massa sobre a fiada 3 (onde vai o tijolo novo)
    if i >= 1:
        n = 1 if i == 1 else 0
        F.part(poly((SLOT[0] - 1, top + 4), (SLOT[1] + 2, top + 4), (SLOT[1] + 2, top + 7), (SLOT[0] - 1, top + 7)), MASSA, tex=.3, light=.3)
        if i == 1:
            for xx in range(SLOT[0], SLOT[1] + 2, 3):
                F.px(xx, top + 3, MASSA)
    if i >= 3:
        brick(F, SLOT[0], top + 1, SLOT[1], top + 5, BRICK[2])
        F.part(poly((SLOT[0] - 1, top + 1), (SLOT[1] + 1, top + 1), (SLOT[1] + 1, top + 6), (SLOT[0] - 1, top + 6)),
               BRICK[2], outline=True, ol=dk('#a89e8c', .4), shade=False, clip=np.zeros((S, S), bool))
        # massa espremida nas juntas
        for xx in (SLOT[0] - 1, SLOT[1] + 1):
            F.px(xx, top + 6, '#cfc6b4'); F.px(xx, top + 7, '#cfc6b4')
        F.px(SLOT[0] + 3, top + 6, '#cfc6b4'); F.px(SLOT[1] - 2, top + 6, '#cfc6b4')
    # topo da mureta (face de cima em 3/4) e face lateral com furos (tijolo baiano)
    F.line(WALL_X0, top + 6, WALL_X1, top + 6, '#5a4a40')
    F.part(poly((WALL_X1, top + 6), (WALL_X1 + 3, top + 4), (WALL_X1 + 3, G - 2), (WALL_X1, G)), '#8a3a20', light=.1)
    for yy in range(top + 8, G - 2, 3):
        F.px(WALL_X1 + 1, yy, '#3a1a10'); F.px(WALL_X1 + 2, yy - 1, '#3a1a10')


def special_extra(F, P):
    i = P['i']
    if i == 0:
        # respingo de massa da colher
        pass
    if i == 1:
        x, y = P['ha_f']
        F.px(x + 18, y - 2, MASSA, F.fx); F.px(x + 20, y - 4, MASSA, F.fx)
    if i == 2:
        # tijolo na mão da frente
        x, y = P['ha_f']
        F.part(poly((x - 6, y + 1), (x + 7, y + 1), (x + 7, y + 7), (x - 6, y + 7)), BRICK[2], tex=.22, light=.3, layer=F.fx)
        F.part(poly((x - 4, y - 2), (x + 9, y - 2), (x + 7, y + 1), (x - 6, y + 1)), lt(BRICK[2], .22), layer=F.fx, light=.2)
        F.part(poly((x + 7, y + 1), (x + 9, y - 2), (x + 9, y + 4), (x + 7, y + 7)), dk(BRICK[2], .25), layer=F.fx, light=.1)
        for yy in (y + 1, y + 4):
            F.px(x + 8, yy, '#2a1008', F.fx)
        # dedos por cima
        Fm = Frame()
        glove(Fm, P, 'f')
        msk = Fm.a[..., 3] > 0
        F.fx[msk] = Fm.a[msk]
        draw_back_trowel(F, P)
    if i == 3:
        dust(F, SLOT[0] - 4, 93, 2)
        dust(F, SLOT[1] + 5, 92, 2)
        draw_back_trowel(F, P)
    if i == 4:
        impact(F, 105, 87, 4)
        arcs(F, 112, 80, 2)
    if i == 5:
        # nível de bolha sobre a mureta
        x0, x1, y = 86, 116, 84
        F.part(poly((x0, y), (x1, y), (x1, y + 4), (x0, y + 4)), '#c0c6cc', light=.45, layer=F.fx)
        F.line(x0 + 1, y + 1, x1 - 1, y + 1, '#eef2f4', F.fx)
        F.part(poly((x0 + 11, y + 1), (x0 + 19, y + 1), (x0 + 19, y + 3), (x0 + 11, y + 3)), '#d8f05a', shade=False, ol='#2a3a10', layer=F.fx)
        F.px(x0 + 15, y + 2, '#ffffff', F.fx); F.px(x0 + 14, y + 2, '#f8ffe0', F.fx)
        F.px(x0 + 13, y + 1, '#2a3a10', F.fx); F.px(x0 + 17, y + 1, '#2a3a10', F.fx)
        F.part(poly((x0 + 2, y + 1), (x0 + 4, y + 1), (x0 + 4, y + 3), (x0 + 2, y + 3)), '#e05a2a', shade=False, outline=False, layer=F.fx)
        F.part(poly((x1 - 4, y + 1), (x1 - 2, y + 1), (x1 - 2, y + 3), (x1 - 4, y + 3)), '#e05a2a', shade=False, outline=False, layer=F.fx)
        sparkle(F, x0 + 21, y - 6, 3)
        sparkle(F, 122, 78, 2)
        star(F, 93, 72, r=3)


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'special':
        special_extra(F, P)
    elif row == 'attack':
        if i == 3:
            hx, hy = P['ha_f']
            a = math.radians(P['grip'])
            p0 = (hx - math.cos(a) * 4, hy - math.sin(a) * 4)
            tip, _ = marreta_shapes(p0, a, 21, 1.25)
            impact(F, tip[0] + 3, tip[1] + 1, 7)
            for k, (dx, dy) in enumerate(((-2, -9), (4, -8), (2, 8), (-3, 9))):
                F.part(poly((tip[0] + dx, tip[1] + dy), (tip[0] + dx + 2, tip[1] + dy - 1), (tip[0] + dx + 2, tip[1] + dy + 1)),
                       '#cfc6b4' if k % 2 else '#b5532f', shade=False, ol='#3a2a20', layer=F.fx)
        if i == 4:
            dust(F, 112, 90, 2)
    elif row == 'death' and i >= 3:
        # capacete voando / no chão
        pos = {3: (34, 44, -40), 4: (26, 80, -120), 5: (20, 106, -178)}[i]
        HP = dict(head=(pos[0], pos[1]), hrot=pos[2])
        helmet(F, HP, layer=F.fx)


# ------------------------------------------------------------------ folha

def frame(look, row, i):
    P = pose(row, i, look.get('body', 'f'))
    adjust(P)
    F = Frame()
    if row == 'special':
        draw_wall(F, i)
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return H.finish(F, P)   # humano.finish usa rotate_fit no desmaio


def make_sheet(look):
    out = np.zeros((S * 6, S * 8, 4), np.uint8)
    for r, name in enumerate(ROWS):
        for c in range(NFR[name]):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(look, name, c)
    return Image.fromarray(out, 'RGBA')


SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']


def make_variants():
    out = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            look = dict(LOOK, skin=sk, hair_color=hc)
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(look, 'idle', 0)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    root = os.path.join(HERE, '..', 'recrutas')
    os.makedirs(root, exist_ok=True)
    sh = make_sheet(LOOK)
    sh.save(os.path.join(root, ID + '.png'))
    va = make_variants()
    va.save(os.path.join(root, ID + '_variantes.png'))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]
        bg = Image.new('RGBA', sh.size, (92, 84, 100, 255))
        bg.alpha_composite(sh)
        bg.resize((sh.width * 2, sh.height * 2), Image.NEAREST).save(os.path.join(d, ID + '_prev.png'))
        bg2 = Image.new('RGBA', va.size, (92, 84, 100, 255))
        bg2.alpha_composite(va)
        bg2.resize((va.width * 2, va.height * 2), Image.NEAREST).save(os.path.join(d, ID + '_var.png'))
        # recortes 3x por linha
        for r, name in enumerate(ROWS):
            crop = bg.crop((0, r * S, S * NFR[name], (r + 1) * S))
            crop.resize((crop.width * 3, crop.height * 3), Image.NEAREST).save(os.path.join(d, ID + '_row_%s.png' % name))
    print('ok', sh.size, va.size)
