"""Recruta: Lenhador — grandalhão barbudo de flanela xadrez vinho, suspensórios, calça de lona, botina,
gorro de lã e machado. Gera recrutas/lenhador.png (1024x768) e recrutas/lenhador_variantes.png (640x512).

    cd tools && python recruta_lenhador.py
"""
import os
import sys
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humano import *          # noqa: F401,F403  (pixkit + esqueleto)
import humano as H

ID = 'lenhador'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'recrutas')

LOOK = dict(body='m', skin='#c68a5e', hair_color='#4a2a14', shirt='#8b3a2a', pants='#6e6044',
            jacket='#4a3020', shoes='#5e3c22', eye='#3a2414')

PLAID_D = '#4a1c18'
PLAID_L = np.array([200, 120, 92.])
UNDER = '#9a948a'
LEATHER = '#4a3020'
BRASS = '#c8a040'
BELT = '#2e2018'
PATCH = '#8e7c56'
DIRT = '#4a3a28'
SOLE = '#22160f'
LACE = '#d8c8a0'
BEANIE = '#b8862a'
HANDLE = '#a8743a'
STEEL = '#8a8e96'
STEEL_D = '#4a4e58'
EDGE = '#eef2f6'
TAPE = '#1e1c22'
WOOD_IN = '#e0b880'
WOOD_RING = '#b07e4a'
BARK = '#5a3a24'
BARK_D = '#3a2416'
GLOVE = '#b8925a'
SAW = '#f0d080'

AXE_L = 25


def C(h):
    return hexc(h) if isinstance(h, str) else np.array(h, float)


def dk(h, t=.3):
    return mix(C(h), NIGHT, t)


def lt(h, t=.25):
    return mix(C(h), MOON, t)


def hsh(*a):
    """hash determinístico pequeno."""
    v = 2166136261
    for x in a:
        v = ((v ^ (int(x) & 0xffffffff)) * 16777619) & 0xffffffff
    return v


# ---------------------------------------------------------------- juntas

def set_hand(P, s, pt):
    sh = P['sh_' + s]
    d = math.hypot(pt[0] - sh[0], pt[1] - sh[1])
    if d > ARM_L * .98:
        t = ARM_L * .98 / d
        pt = (sh[0] + (pt[0] - sh[0]) * t, sh[1] + (pt[1] - sh[1]) * t)
    P['ha_' + s] = pt
    P['el_' + s] = two_bone(sh[0], sh[1], pt[0], pt[1], ARM_L, bend_dir=(1 if s == 'b' else -1))


def axe_uv(P):
    a = math.radians(P['grip'])
    return (math.cos(a), math.sin(a)), (-math.sin(a), math.cos(a))


def axe_W(P, t, s, hand=None):
    (ux, uy), (nx, ny) = axe_uv(P)
    hx, hy = hand or P['ha_f']
    return (hx + ux * t + nx * s, hy + uy * t + ny * s)


def two_hands(P, back=4.5):
    (ux, uy), _ = axe_uv(P)
    hx, hy = P['ha_f']
    set_hand(P, 'b', (hx - ux * back, hy - uy * back))


ATK = [  # mão da frente relativa ao ombro da frente, ângulo do cabo
    ((5, -23), -100), ((0, -27), -132), ((12, -12), -60), ((10, 14), 35), ((10, 20), 62), ((5, 24), -55)]
SPC = [((5, -23), -100), ((0, -27), -135), ((12, -12), -60), ((9, 15), 42), ((7, 22), 76), ((13, 24), 98)]
SPC_FACE = [('open', 'line'), ('closed', 'grit'), ('angry', 'grit'), ('angry', 'open'), ('wide', 'o'), ('happy', 'smile')]

LOG_X = 112


def adjust(P):
    row, i = P['row'], P['i']
    if row == 'special':
        Q = pose('attack', i, P['body'], 'heavy')
        Q.update(row='special', i=i, fx=[])
        P.clear(); P.update(Q)
    # ombros largos de grandalhão
    P['sh_b'] = (P['sh_b'][0] - 1.5, P['sh_b'][1])
    P['sh_f'] = (P['sh_f'][0] + 1, P['sh_f'][1])
    set_hand(P, 'b', P['ha_b'])
    set_hand(P, 'f', P['ha_f'])
    if row in ('attack', 'special'):
        (rx, ry), g = (ATK if row == 'attack' else SPC)[i]
        sx, sy = P['sh_f']
        set_hand(P, 'f', (sx + rx, sy + ry))
        P['grip'] = g
        if row == 'special' and i == 5:
            set_hand(P, 'b', (P['ha_b'][0] + 4, P['ha_b'][1] - 6))
        elif not (row == 'special' and i == 4) or True:
            two_hands(P)
        if row == 'attack':
            P['fx'] = []
            if i == 3:
                e = axe_W(P, AXE_L - 3, 10)
                P['fx'] = [('impact', e[0] + 1, e[1] + 1)]
        else:
            P['eyes'], P['mouth'] = SPC_FACE[i]
    if row == 'walk':
        P['grip'] = P['grip'] + 6
    pass


# ---------------------------------------------------------------- texturas

def plaid(F, m, P):
    if m is None or not m.any():
        return
    ox, oy = int(round(P['neck'][0])), int(round(P['neck'][1]))
    ys, xs = np.nonzero(m)
    gx = (xs - ox) % 7
    gy = (ys - oy) % 7
    f = np.ones(len(xs))
    dx = gx < 2
    dy = gy < 2
    f[dx] *= .66
    f[dy] *= .66
    col = F.a[ys, xs, :3].astype(float) * f[:, None]
    lmask = ((gx == 4) | (gy == 4)) & ~dx & ~dy
    col[lmask] = mix(col[lmask], PLAID_L, .38)
    F.a[ys, xs, :3] = np.clip(col, 0, 255)


def speckle(F, m, col, dens, seed, layer=None):
    if m is None or not m.any():
        return
    ys, xs = np.nonzero(m)
    for x, y in zip(xs, ys):
        if hsh(x, y, seed) % 1000 < dens * 1000:
            F.px(x, y, col, layer)


# ---------------------------------------------------------------- camadas

def d_body(F, P, look):
    c = look['skin']
    far = mix(C(c), NIGHT, .18)
    F.part(thigh(P, 'b', 12) + shin(P, 'b', 10), far)
    F.part(foot_shapes(P, 'b'), far)
    F.part(upper_arm(P, 'b', 9) + fore_arm(P, 'b', 8), far)
    m = F.part(hand_shapes(P, 'b', 4.5), far)
    F.part(thigh(P, 'f', 12) + shin(P, 'f', 10), c)
    F.part(foot_shapes(P, 'f'), c)
    F.part(torso_shapes(P, 1) + pelvis_shapes(P, 1), c)
    F.part(neck_shapes(P), mix(C(c), NIGHT, .12))
    F.part(head_shapes(P), c, tex=0)
    F.part(ear_shapes(P), c)
    F.part(nose_shapes(P), c, outline=False, light=.35)
    hair_on_arm(F, P, 'b', look, far)


def hair_on_arm(F, P, s, look, skin):
    hc = mix(C(look['hair_color']), C(skin) if not isinstance(skin, str) else C(skin), .35)
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    for k, t in enumerate((.25, .4, .55, .7)):
        x, y = L2(el, ha, t)
        o = (-1, 1, 0, -1)[k]
        F.px(x + o, y - 1, hc)
        F.px(x + o + 2, y + 1, hc)


def d_arm(F, P, look):
    c = look['skin']
    F.part(upper_arm(P, 'f', 9) + fore_arm(P, 'f', 8), c)
    F.part(hand_shapes(P, 'f', 4.5), c)
    hair_on_arm(F, P, 'f', look, c)


def d_face(F, P, look):
    lk = dict(look, brow=look['hair_color'])
    m0 = P['mouth']
    H.draw_face(F, P, lk)
    fp = face_pts(P)
    b = mix(C(look['hair_color']), INK, .15)
    for k in ('brow_b', 'brow_f'):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if P['eyes'] == 'angry':
            F.line(x - 2, y - 2, x + 2, y, b)
            F.px(x - 3, y - 2, b)
        elif P['eyes'] == 'wide':
            F.line(x - 2, y - 3, x + 2, y - 3, b)
        else:
            F.line(x - 2, y - 1, x + 2, y - 2, b)
            F.px(x - 3, y, b)
    # nariz avermelhado
    cx, cy = P['head']
    nx, ny = rp(cx + 14, cy + 6, cx, cy, P['hrot'])
    rc = mix(C(look['skin']), C('#d0604e'), .45)
    F.px(nx, ny, rc); F.px(nx + 1, ny, rc)
    P['mouth'] = m0


def d_pants(F, P, look):
    c = look['pants']
    far = mix(C(c), NIGHT, .22)
    mb = F.part(thigh(P, 'b', 12, 1) + shin(P, 'b', 10, 1, upto=.8), far, tex=.06)
    mf = F.part(pelvis_shapes(P, 1) + thigh(P, 'f', 12, 1) + shin(P, 'f', 10, 1, upto=.8), c, tex=.06)
    # costura lateral pontilhada (frente)
    hp, kn, ft = P['hip_f'], P['kn_f'], P['ft_f']
    sc = lt(c, .3)
    for k in range(0, 22, 2):
        t = k / 22
        if t < .5:
            x, y = L2((hp[0] + 5, hp[1] + 3), (kn[0] + 5, kn[1]), t * 2)
        else:
            x, y = L2((kn[0] + 5, kn[1]), (ft[0] + 4, ft[1] - 12), (t - .5) * 2)
        if mf[int(min(127, max(0, round(y)))), int(min(127, max(0, round(x))))]:
            F.px(x, y, sc)
    # remendo no joelho da frente
    kx, ky = kn
    ang = math.degrees(math.atan2(ft[1] - kn[1], ft[0] - kn[0])) - 90
    pm = F.part(rot(poly((kx - 3, ky - 3), (kx + 4, ky - 3), (kx + 4, ky + 4), (kx - 3, ky + 4)), kx, ky, ang), PATCH,
                clip=mf, ol=mix(C(PATCH), INK, .6), light=.3)
    for (a, b2) in ((-2, -2), (0, -2), (2, -2), (3, 0), (3, 2), (-2, 3), (0, 3), (2, 3)):
        x, y = rp(kx + a, ky + b2, kx, ky, ang)
        F.px(x, y, '#e8dcc0')
    # terra/poeira na barra
    for s, m in (('b', mb), ('f', mf)):
        k2, f2 = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        low = F.mask(limb(*L2(k2, f2, .45), *L2(k2, f2, .9), 12, 12)) & m
        speckle(F, low, DIRT, .22, 7 + (s == 'f'))
    # vinco na virilha
    pv = P['pelvis']
    F.line(pv[0] + 1, pv[1] + 2, pv[0] + 3, pv[1] + 6, dk(c, .45))


def boot(F, P, s, col):
    kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
    top = L2(kn, ft, .5)
    sh = limb(top[0], top[1], ft[0] + 1, ft[1] - 4, 11, 11)
    fx, fy = ft
    toe = ell(fx + 4, fy - 3.2, 7.5, 3.6)
    m = F.part(sh + toe, col, tex=.05)
    # solado
    F.part(poly((fx - 5, fy - 1.5), (fx + 11, fy - 1.5), (fx + 11.5, fy + .8), (fx - 5, fy + .8)), SOLE, light=.1)
    # dobra do cano + biqueira gasta
    F.line(top[0] - 5, top[1] + 1, top[0] + 5, top[1] + 1, mix(C(col), MOON, .25))
    F.px(fx + 8, fy - 5, lt(col, .4)); F.px(fx + 9, fy - 4, lt(col, .4))
    # cadarço em X
    for k in range(3):
        x, y = L2(top, (ft[0] + 1, ft[1] - 5), .2 + k * .27)
        x += 3
        F.px(x - 1, y - 1, LACE); F.px(x + 1, y + 1, LACE); F.px(x + 1, y - 1, LACE); F.px(x - 1, y + 1, LACE)
    # lama na sola
    for k in range(-4, 11, 3):
        F.px(fx + k, fy - 2, DIRT)


def d_shoes(F, P, look):
    c = look['shoes']
    boot(F, P, 'b', mix(C(c), NIGHT, .25))
    boot(F, P, 'f', c)


def sleeve(F, P, s, col):
    sh, el = P['sh_' + DSIDE(s)], P['el_' + DSIDE(s)]
    m = F.part(limb(sh[0], sh[1] + 1, el[0], el[1], 10.5, 10), col, tex=.03)
    plaid(F, m, P)
    # manga arregaçada: dobra clara no cotovelo
    a = L2(sh, el, .72)
    mc = F.part(limb(a[0], a[1], el[0], el[1], 11, 10.5), mix(C(col), C('#c8a090'), .22), tex=0)
    plaid(F, mc, P)
    x, y = L2(a, el, .45)
    F.px(x, y, mix(C(col), INK, .5)); F.px(x + 1, y, mix(C(col), INK, .5))
    return m


def d_shirt(F, P, look):
    c = look['shirt']
    far = mix(C(c), NIGHT, .22)
    sleeve(F, P, 'b', far)
    belly = L2(P['sh_f'], P['hip_f'], .72)
    tor = torso_shapes(P, 1) + ell(belly[0] + 1, belly[1], 6.5, 7)
    m = F.part(tor, c, tex=.03)
    plaid(F, m, P)
    nx, ny = P['neck']
    pv = P['pelvis']
    # camiseta de baixo no V da gola
    F.part(poly((nx - 1, ny - 1), (nx + 8, ny - 1), (nx + 4, ny + 7)), UNDER, clip=m, ol=mix(C(UNDER), INK, .6))
    # carreira de botões
    a, b = (nx + 4, ny + 7), (pv[0] + 5, pv[1] - 2)
    F.line(a[0], a[1], b[0], b[1], mix(C(c), INK, .55))
    for t in (.3, .62, .92):
        x, y = L2(a, b, t)
        F.px(x + 1, y, '#e8dcc8')
    # gola
    F.part(poly((nx - 6, ny - 3), (nx - 1, ny - 1), (nx + 3, ny + 7), (nx - 4, ny + 3)), lt(c, .1), clip=None, tex=0)
    F.part(poly((nx + 13, ny - 3), (nx + 8, ny - 1), (nx + 5, ny + 7), (nx + 11, ny + 3)), lt(c, .14), clip=None, tex=0)
    # bolso no peito (lado de trás da imagem, à esquerda da carreira)
    px_, py_ = L2(a, b, .22)
    px_ -= 9
    F.part(poly((px_, py_), (px_ + 7, py_), (px_ + 7, py_ + 7), (px_, py_ + 7)), c, clip=m, tex=0, ol=mix(C(c), INK, .6), light=.1)
    F.part(poly((px_ - .5, py_ - 1), (px_ + 7.5, py_ - 1), (px_ + 7.5, py_ + 2), (px_ - .5, py_ + 2)), lt(c, .12), clip=m,
           ol=mix(C(c), INK, .6))
    F.px(px_ + 3.5, py_ + 1, '#e8dcc8')
    # remendo no flanco (xadrez diferente, verde-escuro)
    fl = L2(P['sh_b'], P['hip_b'], .62)
    pm = F.part(poly((fl[0], fl[1]), (fl[0] + 6, fl[1] - 1), (fl[0] + 7, fl[1] + 5), (fl[0] + 1, fl[1] + 6)), '#3e5a3a', clip=m,
                ol='#1c2a1a', light=.15)
    for k in range(0, 7, 2):
        F.px(fl[0] + k, fl[1] - .5 + k * -.15, '#d8cfb0')
    # manchas de seiva / sujeira e serragem
    for (dx, dy) in ((4, 15), (10, 21), (-6, 18)):
        F.px(nx + dx, ny + dy, mix(C(c), C('#2a1a10'), .55))
        F.px(nx + dx + 1, ny + dy, mix(C(c), C('#2a1a10'), .45))
    for (dx, dy) in ((2, 10), (9, 13), (-4, 22), (12, 25), (6, 28)):
        if m[int(round(ny + dy)) % 128, int(round(nx + dx)) % 128]:
            F.px(nx + dx, ny + dy, SAW)


def d_shirt_arm(F, P, look):
    sleeve(F, P, 'f', look['shirt'])


def strap(F, p0, p1, col):
    F.part(limb(p0[0], p0[1], p1[0], p1[1], 3.6, 3.6), col, light=.25)
    n = int(math.hypot(p1[0] - p0[0], p1[1] - p0[1]))
    for k in range(1, n, 2):
        x, y = L2(p0, p1, k / n)
        F.px(x, y, mix(C(col), MOON, .45))


def d_suspenders(F, P, look):
    """camada jacket = suspensórios de couro."""
    b, f = P['sh_b'], P['sh_f']
    hb, hf = P['hip_b'], P['hip_f']
    t1 = L2(b, f, .3); t2 = L2(b, f, .84)
    e1 = L2(hb, hf, .1); e2 = L2(hb, hf, .92)
    e1 = (e1[0], e1[1] - 2); e2 = (e2[0], e2[1] - 2)
    strap(F, (t1[0], t1[1] - 3), e1, mix(C(LEATHER), NIGHT, .15))
    strap(F, (t2[0], t2[1] - 3), e2, LEATHER)
    for e in (e1, e2):
        F.part(poly((e[0] - 2, e[1] - 3), (e[0] + 2, e[1] - 3), (e[0] + 2, e[1]), (e[0] - 2, e[1])), BRASS, ol='#4a3608', light=.35)


def d_bag(F, P, look):
    """cinto + luva no bolso de trás."""
    hb, hf = P['hip_b'], P['hip_f']
    y0b, y0f = hb[1] - 1, hf[1] - 1
    F.part(poly((hb[0] - 7, y0b), (hf[0] + 7, y0f), (hf[0] + 7, y0f + 3.5), (hb[0] - 7, y0b + 3.5)), BELT, light=.2, tex=.05)
    bx, by = L2(hb, hf, .62)
    F.part(poly((bx, by - 1.5), (bx + 4.5, by - 1.5), (bx + 4.5, by + 3), (bx, by + 3)), BRASS, ol='#4a3608', light=.4)
    F.px(bx + 2, by + .5, BELT)
    # luva de raspa pendurada no bolso de trás
    sw = 0
    if P['row'] == 'walk':
        sw = math.sin(2 * math.pi * P['i'] / 8) * 1.5
    gx, gy = hb[0] - 7, hb[1] + 2
    F.part(poly((gx + 1, gy), (gx + 5, gy), (gx + 4 + sw, gy + 6), (gx + 3 + sw, gy + 10), (gx + 1 + sw, gy + 10),
                (gx - 1 + sw, gy + 7), (gx - 1, gy + 3)), mix(C(GLOVE), NIGHT, .1), light=.3, tex=.12)
    F.line(gx + 1 + sw * .5, gy + 6, gx + 1 + sw, gy + 9, mix(C(GLOVE), INK, .45))
    F.line(gx + 3 + sw * .5, gy + 6, gx + 3 + sw, gy + 9, mix(C(GLOVE), INK, .45))


def head_q(P):
    cx, cy = P['head']
    r = P['hrot']
    return lambda x, y: rp(cx + x, cy + y, cx, cy, r)


def mouth_draw(F, P, x, y):
    x, y = int(round(x)), int(round(y))
    m = P['mouth']
    D = '#3a1414'
    if m == 'line':
        F.line(x - 2, y, x + 1, y, D)
        F.px(x - 1, y + 1, '#a8584a'); F.px(x, y + 1, '#a8584a')
    elif m == 'smile':
        F.px(x - 3, y - 1, D); F.line(x - 2, y, x + 1, y, D); F.px(x + 2, y - 1, D)
        F.px(x - 1, y + 1, '#a8584a'); F.px(x, y + 1, '#a8584a')
    elif m == 'grit':
        F.flat(poly((x - 3, y - 1), (x + 3, y - 1), (x + 3, y + 2), (x - 3, y + 2)), D)
        F.line(x - 2, y, x + 2, y, '#f4efe6')
    elif m in ('open', 'o'):
        F.flat(ell(x, y + 1, 2.8 if m == 'open' else 1.9, 2.6 if m == 'open' else 2), D)
        if m == 'open':
            F.px(x, y + 2, '#c9343a'); F.line(x - 1, y - 1, x + 1, y - 1, '#f4efe6')


def d_beard(F, P, look):
    hc = look['hair_color']
    q = head_q(P)
    pts = [(-11, -3), (-8, -3), (-7, 5), (-2, 8), (3, 8), (9, 8), (14, 9), (16, 12), (15, 18), (11, 22), (5, 24), (-1, 23),
           (-7, 19), (-11, 12)]
    m = F.part([[q(*p) for p in pts]], hc, tex=.22, light=.28)
    # fios e mechas
    hl = mix(C(hc), MOON, .3)
    sd = mix(C(hc), NIGHT, .35)
    for (a, b) in ((-6, 10), (-2, 14), (3, 17), (8, 19), (-8, 6), (0, 19), (11, 16), (6, 21)):
        x, y = q(a, b)
        F.px(x, y, hl); F.px(x, y + 1, hl)
    for (a, b) in ((-4, 16), (2, 21), (9, 13), (-9, 14)):
        x, y = q(a, b)
        F.px(x, y, sd); F.px(x, y + 1, sd)
    # bigode farto
    mu = [(2, 10), (8, 9), (13, 10), (15, 12), (12, 12), (8, 12), (3, 13), (1, 12)]
    F.part([[q(*p) for p in mu]], mix(C(hc), NIGHT, .18), tex=.1, light=.3)
    mx, my = q(8, 14)
    mouth_draw(F, P, mx, my)
    # serragem na barba
    for (a, b) in ((-3, 18), (10, 18)):
        x, y = q(a, b)
        F.px(x, y, SAW)


def d_hair(F, P, look):
    hc = look['hair_color']
    q = head_q(P)
    # tufo na nuca saindo do gorro
    nape = [(-17, -5), (-11, -5), (-10, 0), (-12, 3), (-14, 1), (-16, 4), (-17, 0)]
    F.part([[q(*p) for p in nape]], hc, tex=.2, light=.3)
    # lápis de carpinteiro atrás da orelha
    p0, p1 = q(-18, 2), q(-9, -5)
    F.part(limb(p0[0], p0[1], p1[0], p1[1], 2.6, 2.6), '#c0302a', light=.35)
    F.px(p0[0], p0[1], '#e8c890'); F.px(p0[0] - 1, p0[1] + 1, '#3a3a3a')


def d_beanie(F, P, look):
    q = head_q(P)
    cx, cy = P['head']
    dome = []
    for k in range(0, 13):
        a = math.pi + k * math.pi / 12
        dome.append(q(-1 + 16.8 * math.cos(a), -9 + 11 * math.sin(a)))
    md = F.part([dome], BEANIE, tex=.2, light=.3)
    # tricô: pequenos v
    for yy in range(-17, -10, 3):
        for xx in range(-13, 15, 4):
            x, y = q(xx + (yy % 2), yy)
            if md[int(round(y)) % 128, int(round(x)) % 128]:
                c2 = mix(C(BEANIE), NIGHT, .35)
                F.px(x, y, c2); F.px(x + 1, y + 1, c2); F.px(x + 2, y, c2)
    brim = [q(-18, -12), q(16, -13), q(16.5, -6), q(-17.5, -2)]
    mb = F.part([brim], mix(C(BEANIE), MOON, .08), light=.3)
    for xx in range(-17, 17, 2):
        a, b = q(xx, -12.5), q(xx, -3)
        F.line(a[0], a[1], b[0], b[1], mix(C(BEANIE), NIGHT, .3), layer=None) if False else None
    ys, xs = np.nonzero(mb)
    ox = int(round(cx))
    for x, y in zip(xs, ys):
        if (x - ox) % 2 == 0:
            F.a[y, x, :3] = (F.a[y, x, :3] * .8).astype(np.uint8)


def d_acc(F, P, look):
    """fitinha do Senhor do Bonfim no pulso da frente."""
    el, ha = P['el_f'], P['ha_f']
    a, b = L2(el, ha, .66), L2(el, ha, .70)
    m = F.part(limb(a[0], a[1], b[0], b[1], 5.8, 5.8), '#2f8a3a', light=.2, ol='#14301a')
    ys, xs = np.nonzero(m)
    for x, y in zip(xs, ys):
        k = (x + y) % 3
        if k == 1:
            F.px(x, y, '#e8c830')
        elif k == 2 and (x * 7 + y) % 2:
            F.px(x, y, '#c8302a')


def draw_axe(F, P, hand=None, layer=None, fist=True, look=None):
    L = AXE_L
    W = lambda t, s: axe_W(P, t, s, hand)
    p0, p1 = W(-5, 0), W(L + 1, 0)
    F.part(limb(p0[0], p0[1], p1[0], p1[1], 3.4, 3.2), HANDLE, layer=layer, light=.3)
    F.part(ell(*W(-5.5, 0), 2.4, 2.4), mix(C(HANDLE), NIGHT, .2), layer=layer)     # castão
    for t in range(-3, L, 3):                                                       # veios
        x, y = W(t, .6)
        F.px(x, y, mix(C(HANDLE), C('#5a3418'), .5), layer)
    # fita isolante perto da mão
    q0, q1 = W(2.5, 0), W(6, 0)
    F.part(limb(q0[0], q0[1], q1[0], q1[1], 4, 4), TAPE, layer=layer, light=.35)
    if fist and look is not None:
        h = hand or P['ha_f']
        F.part(ell(h[0], h[1], 3.6, 3.6), look['skin'], layer=layer)
        k = mix(C(look['skin']), INK, .4)
        x, y = W(0, 2.2)
        F.px(x, y, k)
    # cabeça do machado
    head = [W(L - 5, -4.5), W(L + 1, -4.5), W(L + 1, 1), W(L + 3.5, 9), W(L - 3, 10.5), W(L - 9.5, 9), W(L - 5, 1)]
    F.part([head], STEEL, layer=layer, light=.35, ol='#16141a')
    F.part([[W(L - 4, -3.5), W(L, -3.5), W(L, 0), W(L - 4, 0)]], STEEL_D, layer=layer, outline=False, shade=False)
    F.part([[W(L + 3.5, 9), W(L - 3, 10.5), W(L - 9.5, 9), W(L - 8, 7), W(L - 3, 8), W(L + 2.5, 7)]], '#c8ccd4', layer=layer,
           outline=False, shade=False)
    for k in range(9):
        t = L + 3 - k * 1.4
        s = 9.6 + (1 - abs(k - 4.5) / 4.5) * .9
        F.px(*W(t, s - .5), EDGE, layer)
    x, y = W(L - 1, 3)
    F.px(x, y, '#8a4a2a', layer); F.px(x + 1, y, '#8a4a2a', layer)


def axe_behind(P):
    return P['row'] in ('attack', 'special') and P['i'] == 1


def d_weapon(F, P, look):
    if P['row'] == 'death' and P['i'] >= 3:
        return
    if axe_behind(P):
        return
    draw_axe(F, P, look=look)


def d_weapon_back(F, P, look):
    """machado atrás da cabeça na preparação do golpe."""
    if axe_behind(P):
        draw_axe(F, P, fist=False)


DRAW = {'hair_back': d_weapon_back, 'body': d_body, 'face': d_face, 'pants': d_pants, 'shoes': d_shoes, 'shirt': d_shirt, 'jacket': d_suspenders,
        'bag': d_bag, 'arm': d_arm, 'shirt_arm': d_shirt_arm, 'jacket_arm': None, 'beard': d_beard, 'hair': d_hair,
        'head': d_beanie, 'acc': d_acc, 'weapon': d_weapon}


# ---------------------------------------------------------------- efeitos / props

def chip(F, x, y, ang, sz=2.2, layer=None):
    sh = rot(poly((x - sz, y - 1), (x + sz, y - 1), (x + sz, y + 1), (x - sz, y + 1)), x, y, ang)
    F.part(sh, WOOD_IN, shade=False, ol='#4a2e14', layer=F.fx if layer is None else layer)


def swoosh(F, P, a0, a1, r):
    cx, cy = P['sh_f']
    n = 22
    for k in range(n + 1):
        t = k / n
        a = math.radians(a0 + (a1 - a0) * t)
        for j, rr in enumerate((r, r - 2, r - 4)):
            if j > t * 3:
                continue
            F.px(cx + rr * math.cos(a), cy + rr * math.sin(a), '#fff6e8' if j == 0 else '#d8d0e0', F.fx, alpha=230 - j * 60)


def log_whole(F, cx, top, crack=False):
    x0, x1 = cx - 8, cx + 8
    body = poly((x0, top), (x1, top), (x1, G - 1), (x0, G - 1)) + ell(cx, G - 1, 8, 2.6)
    m = F.part(body, BARK, tex=.15, light=.2)
    for k, xx in enumerate(range(x0 + 2, x1, 3)):
        F.line(xx, top + 3 + k % 2, xx + (k % 2), G - 3, BARK_D)
    F.part(ell(cx, top, 8, 3), WOOD_IN, light=.15, ol=BARK_D)
    F.part(ell(cx, top, 5, 1.8), mix(C(WOOD_IN), C(WOOD_RING), .2), outline=False, shade=False)
    for a in range(0, 360, 30):
        F.px(cx + 5 * math.cos(math.radians(a)), top + 1.9 * math.sin(math.radians(a)), WOOD_RING)
    for a in range(0, 360, 60):
        F.px(cx + 2.6 * math.cos(math.radians(a)), top + 1 * math.sin(math.radians(a)), WOOD_RING)
    F.px(cx, top, '#7a4a24')
    if crack:
        pts = [(cx - 1, top - 1), (cx, top + 2), (cx - 1, top + 5), (cx + 1, top + 8), (cx, top + 11)]
        for a, b in zip(pts, pts[1:]):
            F.line(a[0], a[1], b[0], b[1], '#1a0e08')


def half_log(F, px, py, ang, side):
    """metade da tora girada 'ang' graus em torno do ponto de apoio (px,py) no chão. side -1 esq, +1 dir."""
    h = 15
    if side < 0:
        rect = poly((px, py - h), (px + 8, py - h), (px + 8, py), (px, py))
        face = poly((px + 5.5, py - h), (px + 8, py - h), (px + 8, py), (px + 5.5, py))
    else:
        rect = poly((px - 8, py - h), (px, py - h), (px, py), (px - 8, py))
        face = poly((px - 8, py - h), (px - 5.5, py - h), (px - 5.5, py), (px - 8, py))
    F.part(rot(rect, px, py, ang), BARK, tex=.15, light=.2, marks=[(rot(face, px, py, ang), WOOD_IN)])
    # topo (meia-lua de anéis)
    tx, ty = rp(px + (4 if side < 0 else -4), py - h, px, py, ang)
    F.part(rot(ell(tx, ty, 4, 2), tx, ty, ang), WOOD_IN, light=.15, ol=BARK_D)
    F.px(tx, ty, WOOD_RING)


def lying_half(F, x0, side):
    y0 = G - 6
    body = poly((x0, y0), (x0 + 15, y0), (x0 + 15, G - 1), (x0, G - 1))
    F.part(body, BARK, tex=.15, light=.2, marks=[(poly((x0, y0), (x0 + 15, y0), (x0 + 15, y0 + 2.5), (x0, y0 + 2.5)), WOOD_IN)])
    ex = x0 + 15 if side > 0 else x0
    F.part(ell(ex, G - 3.5, 2.2, 3), WOOD_IN, ol=BARK_D, light=.1)
    F.px(ex, G - 4, WOOD_RING)


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'attack':
        if i == 2:
            swoosh(F, P, -170, -50, 30)
        if i == 3:
            swoosh(F, P, -60, 25, 31)
    if row == 'death' and i >= 3:
        Q = dict(P, grip=180)
        draw_axe(F, Q, hand=(28, 109), layer=F.fx, fist=False)
        if i == 3:
            dust(F, 10, 110, 3); dust(F, 30, 110, 2)
    if row == 'special':
        top = G - 15
        if i <= 3:
            log_whole(F, LOG_X, top, crack=(i == 3))
            if i == 0:
                dust(F, LOG_X - 11, G - 1, 2.5); dust(F, LOG_X + 10, G - 1, 2.5)
            if i == 2:
                swoosh(F, P, -175, -50, 29)
            if i == 3:
                # gume cravado: redesenha o pedaço visível do machado acima do topo
                e = axe_W(P, AXE_L - 3, 10)
                impact(F, e[0] + 2, e[1] - 6, 6)
                for k, (dx, dy, a) in enumerate(((-12, -10, 20), (12, -12, -30), (-6, -18, 60), (16, -4, 10))):
                    chip(F, LOG_X + dx, top + dy, a)
        elif i == 4:
            half_log(F, LOG_X - 9, G - 1, -28, -1)
            half_log(F, LOG_X + 9, G - 1, 28, 1)
            for k, (dx, dy, a) in enumerate(((-16, -20, 30), (14, -24, -40), (-4, -28, 70), (8, -16, 15), (-20, -8, -20))):
                chip(F, LOG_X + dx, top + dy, a, 2.0)
            dust(F, LOG_X - 12, G - 2, 3); dust(F, LOG_X + 8, G - 2, 3)
        elif i == 5:
            lying_half(F, LOG_X - 22, -1)
            lying_half(F, LOG_X + 1, 1)
            for (dx, a) in ((-6, 10), (6, -20), (14, 40)):
                chip(F, LOG_X + dx - 4, G - 1, a, 1.8, layer=F.a)
            sparkle(F, 88, 28, 3)
            sparkle(F, LOG_X - 6, G - 14, 2)


# ---------------------------------------------------------------- saída

def death_finish(F, P):
    """desmaio: usa humano.rotate_fit (padrão do projeto) e, como o lenhador é mais largo (gorro + barba),
    empurra o corpo deitado até caber inteiro: borda direita <= 125 e apoiado no chão."""
    pose_fx(F, P)
    if P['i'] == 5:
        for (x, y) in ((96, 80), (106, 74), (116, 79)):
            star(F, x, y, r=3)
    rotq = P['rotate']
    F.a = H.rotate_fit(F.a, rotq)
    ys, xs = np.nonzero(F.a[..., 3])
    dx = min(0, 125 - xs.max())
    dy = min(0, (G + 2) - ys.max())
    if dx or dy:
        F.a = np.roll(F.a, (dy, dx), (0, 1))
    k = min(1.0, abs(rotq[0]) / 90.0)
    ys, xs = np.nonzero(F.a[..., 3])
    cx = (xs.min() + xs.max()) / 2
    return compose(F, tint=P.get('tint'), shadow=shadow_layer(cx, 17 + 16 * k), alpha=P.get('alpha', 1.0))


def build(look=LOOK):
    out = np.zeros((S * len(ROWS), S * 8, 4), np.uint8)
    for r, name in enumerate(ROWS):
        for c in range(NFR[name]):
            P = pose(name, c, look.get('body', 'm'), 'heavy')
            adjust(P)
            F = Frame()
            draw_person(F, P, look, DRAW)
            extra(F, P)
            img = death_finish(F, P) if (name == 'death' and P.get('rotate')) else finish(F, P)
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = img
    return Image.fromarray(out, 'RGBA')


def variants():
    skins = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
    hairs = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']
    out = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, sk in enumerate(skins):
        for c, hc in enumerate(hairs):
            img, P, F = render(dict(LOOK, skin=sk, hair_color=hc), 'idle', 0, draw=DRAW, style='heavy', adjust=adjust)
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = img
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    im = build()
    im.save(os.path.join(OUT, ID + '.png'))
    va = variants()
    va.save(os.path.join(OUT, ID + '_variantes.png'))
    if len(sys.argv) > 1:   # prévia ampliada num rascunho
        sc = int(sys.argv[2]) if len(sys.argv) > 2 else 2
        bg = Image.new('RGBA', im.size, (70, 66, 80, 255))
        bg.alpha_composite(im)
        bg.resize((im.width * sc, im.height * sc), Image.NEAREST).save(sys.argv[1])
        bg = Image.new('RGBA', va.size, (70, 66, 80, 255))
        bg.alpha_composite(va)
        bg.resize((va.width * 2, va.height * 2), Image.NEAREST).save(sys.argv[1].replace('.png', '_var.png'))
    print('ok', im.size, va.size)
