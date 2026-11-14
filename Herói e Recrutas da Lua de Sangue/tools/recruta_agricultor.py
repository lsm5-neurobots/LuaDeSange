"""Recruta: Agricultor — "Planta que dá, a gente come."
Gera recrutas/agricultor.png (1024x768) e recrutas/agricultor_variantes.png (640x512).
Rodar dentro de tools:  python recruta_agricultor.py
"""
import os
import sys
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humano import *  # noqa
from pixkit import _XX, _YY

ID = 'agricultor'
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

LOOK = dict(body='m', skin='#c68a5e', hair_color='#1a1210', shirt='#6f8f2f', pants='#8a6a44',
            shoes='#5a3a22', eye='#3a2414')

STRAW, STRAW_L, STRAW_D = '#d9b860', '#f0d890', '#a07c3a'
BAND = '#7a2a1e'
WOOD, WOOD_L, WOOD_D = '#9a6a3a', '#c08a50', '#6a4422'
IRON, IRON_L, IRON_D, RUST = '#5e6266', '#c8ccd0', '#3e4246', '#8a4a24'
MUD = '#6a4a2a'
LEAF, LEAF_L, LEAF_D = '#6fb840', '#9fdc68', '#3f7f22'
WATER, WATER_D = '#8fd0f0', '#2a6a9a'
SEED = '#e8d8a0'
BANDANA = '#b8322a'
PATCH = '#b8a678'
KNEE_PATCH = '#5e7a8a'
BELT, BUCKLE = '#4a2e1a', '#c9a24a'


def H(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def dk(c, t=.3):
    return mix(H(c), NIGHT, t)


def lt(c, t=.25):
    return mix(H(c), MOON, t)


# ------------------------------------------------------------------ util de pose

def set_hand(P, s, target):
    sh = P['sh_' + s]
    d = math.hypot(target[0] - sh[0], target[1] - sh[1])
    if d > ARM_L * .98:
        t = ARM_L * .98 / d
        target = (sh[0] + (target[0] - sh[0]) * t, sh[1] + (target[1] - sh[1]) * t)
    P['ha_' + s] = target
    P['el_' + s] = two_bone(sh[0], sh[1], target[0], target[1], ARM_L, bend_dir=(1 if s == 'b' else -1))


def add(p, d):
    return (p[0] + d[0], p[1] + d[1])


def seg(a, b, t0, t1, w0, w1=None):
    p = L2(a, b, t0)
    q = L2(a, b, t1)
    return limb(p[0], p[1], q[0], q[1], w0, w0 if w1 is None else w1)


# ------------------------------------------------------------------ enxada

def draw_hoe(F, hand, ang, length, back=6, side=1, layer=None, blade=10):
    """cabo atrás da mão (back) até a ponta (length); lâmina perpendicular (ang + side*90)."""
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    p0 = (hand[0] - ca * back, hand[1] - sa * back)
    p1 = (hand[0] + ca * length, hand[1] + sa * length)
    m = F.part(limb(p0[0], p0[1], p1[0], p1[1], 3.2, 3.2), WOOD, layer=layer, light=.3)
    # veio da madeira
    L = layer if layer is not None else F.a
    n = int(back + length)
    for k in range(2, n - 2, 5):
        x = p0[0] + ca * k
        y = p0[1] + sa * k
        xi, yi = int(round(x)), int(round(y))
        if 0 <= xi < S and 0 <= yi < S and m[yi, xi]:
            L[yi, xi, :3] = H(WOOD_D)
    b = math.radians(ang + side * 90)
    cb, sb = math.cos(b), math.sin(b)
    # lâmina: trapézio que sai da ponta e alarga até o gume
    w_in, w_out = 2.2, 4.6
    tip = (p1[0] - ca * 1, p1[1] - sa * 1)
    q = [(tip[0] - ca * w_in, tip[1] - sa * w_in),
         (tip[0] + ca * w_in, tip[1] + sa * w_in),
         (tip[0] + cb * blade + ca * w_out, tip[1] + sb * blade + sa * w_out),
         (tip[0] + cb * blade - ca * w_out, tip[1] + sb * blade - sa * w_out)]
    edge = [(tip[0] + cb * (blade - 2) + ca * (w_out - .3), tip[1] + sb * (blade - 2) + sa * (w_out - .3)),
            (tip[0] + cb * blade + ca * w_out, tip[1] + sb * blade + sa * w_out),
            (tip[0] + cb * blade - ca * w_out, tip[1] + sb * blade - sa * w_out),
            (tip[0] + cb * (blade - 2) - ca * (w_out - .3), tip[1] + sb * (blade - 2) - sa * (w_out - .3))]
    rust = ell(tip[0] + cb * blade * .5 + ca * 1.5, tip[1] + sb * blade * .5 + sa * 1.5, 1.4, 1.2)
    F.part([q], IRON, marks=[([edge], IRON_L), (rust, RUST)], layer=layer, light=.35, ol='#16161a')
    # olho/argola do encaixe
    F.part(ell(tip[0], tip[1], 2.4, 2.4), IRON_D, layer=layer, light=.4, ol='#101014')
    return p1, (tip[0] + cb * blade, tip[1] + sb * blade)


def draw_can(F, hand, tilt, layer=None):
    """regadorzinho de lata (corpo + bico + alça), tilt em graus (positivo = inclina p/ frente)."""
    cx, cy = hand[0] + 4, hand[1] + 3
    body = poly((cx - 5, cy - 4), (cx + 5, cy - 4), (cx + 5, cy + 5), (cx - 5, cy + 5))
    spout = limb(cx + 4, cy + 2, cx + 12, cy - 4, 2.4, 1.6)
    rose = ell(cx + 12.5, cy - 4.5, 1.8, 1.8)
    handle = limb(cx - 6, cy - 2, cx - 4, cy - 7, 1.8, 1.8) + limb(cx - 4, cy - 7, cx + 2, cy - 7, 1.8, 1.8)
    R = lambda sh: rot(sh, cx, cy, tilt)
    F.part(R(handle), '#7a8680', layer=layer)
    F.part(R(spout + rose), '#8a9690', layer=layer)
    band = poly((cx - 5, cy - 1), (cx + 5, cy - 1), (cx + 5, cy + 0), (cx - 5, cy + 0))
    F.part(R(body), '#9aa6a0', marks=[(R(band), '#6e7a74'), (R(ell(cx + 2, cy + 3, 1.2, 1)), '#b07a4a')], layer=layer, light=.4)
    sx, sy = rp(cx + 13.5, cy - 4.5, cx, cy, tilt)
    return (sx, sy)


# ------------------------------------------------------------------ camadas

def draw_body_a(F, P, look):
    c = skin_col(look)
    far = mix(hexc(c), NIGHT, .18)
    F.part(thigh(P, 'b') + shin(P, 'b'), far)
    F.part(foot_shapes(P, 'b'), far)
    F.part(upper_arm(P, 'b') + fore_arm(P, 'b'), far)
    F.part(hand_shapes(P, 'b'), far)
    F.part(thigh(P, 'f') + shin(P, 'f'), c)
    F.part(foot_shapes(P, 'f'), c)
    F.part(torso_shapes(P) + pelvis_shapes(P), c)
    F.part(neck_shapes(P), mix(hexc(c), NIGHT, .12))
    cx, cy = P['head']
    shade_band = rot(poly((cx - 20, cy - 20), (cx + 22, cy - 20), (cx + 22, cy - 5), (cx - 20, cy - 6)), cx, cy, P['hrot'])
    F.part(head_shapes(P), c, marks=[(shade_band, mix(hexc(c), NIGHT, .32))])
    F.part(ear_shapes(P), c)
    F.part(nose_shapes(P), c, outline=False, light=.35)


def draw_arm_a(F, P, look):
    c = skin_col(look)
    F.part(upper_arm(P, 'f') + fore_arm(P, 'f'), c)
    F.part(hand_shapes(P, 'f'), c)
    hx, hy = P['ha_f']
    F.px(hx + 1, hy - 1, mix(hexc(c), hexc(MUD), .5))   # terra nos nós


def draw_face_a(F, P, look):
    lk = dict(look, brow=tuple(mix(H(look.get('hair_color', '#1a1210')), INK, .35)))
    draw_face(F, P, lk)
    fp = face_pts(P)
    c = skin_col(look)
    wr = mix(hexc(c), INK, .38)
    if P['eyes'] not in ('x',):
        x, y = fp['eye_f']
        x, y = int(round(x)), int(round(y))
        F.px(x + 4, y - 1, wr); F.px(x + 4, y + 1, wr)          # pé-de-galinha do sol
    # barba por fazer no queixo
    cx, cy = P['head']
    for dx, dy in ((4, 15), (8, 15), (11, 14), (6, 16), (13, 12), (2, 13)):
        x, y = rp(cx + dx, cy + dy, cx, cy, P['hrot'])
        F.px(x, y, mix(hexc(c), H(look.get('hair_color', '#1a1210')), .35))


def draw_hair_a(F, P, look):
    c = look.get('hair_color', '#1a1210')
    cx, cy = P['head']
    sh = ell(cx - 14, cy - 4, 3, 4.5) + poly((cx - 10, cy - 7), (cx - 7, cy - 7), (cx - 7.5, cy + 1), (cx - 9, cy + 1))
    F.part(rot(sh, cx, cy, P['hrot']), c, tex=.25)


def draw_beard_a(F, P, look):
    """bigode grosso de ferradura."""
    c = look.get('hair_color', '#1a1210')
    cx, cy = P['head']
    up = -1 if P['mouth'] == 'smile' else 0
    sh = poly((cx + 4, cy + 10 + up), (cx + 8, cy + 8.5 + up), (cx + 11, cy + 8.5 + up), (cx + 14, cy + 9.5 + up),
              (cx + 14, cy + 11.5 + up), (cx + 12, cy + 10.5 + up), (cx + 9, cy + 10 + up), (cx + 6, cy + 10.5 + up), (cx + 4, cy + 12 + up))
    F.part(rot(sh, cx, cy, P['hrot']), c, tex=.2, light=.3)


def draw_hat(F, P, look):
    cx, cy = P['head']
    r = P['hrot']
    R = lambda sh: rot(sh, cx, cy, r)
    bx, by, brx, bry = cx + 3, cy - 10, 24, 5.5
    brim = ell(bx, by, brx, bry, n=48)
    # fiapos desfiados na borda
    for k in (3, 7, 11, 16, 20, 25, 29, 33, 38, 42, 45):
        a = 2 * math.pi * k / 48
        px_, py_ = bx + brx * math.cos(a), by + bry * math.sin(a)
        ox, oy = math.cos(a) * 2.2, math.sin(a) * 1.8
        brim += poly((px_ - .9, py_), (px_ + ox, py_ + oy + (1 if k % 2 else 0)), (px_ + .9, py_))
    under = ell(bx + 1, by + 2.6, brx - 1, bry - 1.6)
    m = F.part(R(brim), STRAW, marks=[(R(under), STRAW_D)], light=.3, ol='#3a2a10')
    crown = ell(cx + 1, cy - 19, 13, 8) + poly((cx - 12, cy - 19), (cx + 14, cy - 19), (cx + 14, cy - 10), (cx - 12, cy - 10))
    band = poly((cx - 13, cy - 15), (cx + 15, cy - 15), (cx + 15, cy - 11), (cx - 13, cy - 11))
    dent = poly((cx - 2, cy - 27), (cx + 5, cy - 27), (cx + 4, cy - 24), (cx - 1, cy - 24))
    hole = ell(cx + 8, cy - 21, 1.3, 1)
    m2 = F.part(R(crown), STRAW, marks=[(R(band), BAND), (R(dent), STRAW_D), (R(hole), '#2a1a10')], light=.3, ol='#3a2a10')
    # trama da palha
    bandm = F.mask(R(band)) | F.mask(R(hole))
    allm = (m | m2) & ~bandm
    tw = allm & ((((_XX + 2 * _YY) % 5) == 0) | (((_XX - _YY) % 7) == 0))
    F.a[tw, :3] = (F.a[tw, :3].astype(float) * .84).astype(np.uint8)
    hi = allm & (((_XX * 3 + _YY) % 11) == 0)
    F.a[hi, :3] = np.clip(F.a[hi, :3].astype(float) * .5 + H(STRAW_L) * .5, 0, 255).astype(np.uint8)
    # nó da fita
    kx, ky = rp(cx - 11, cy - 13, cx, cy, r)
    F.part(ell(kx, ky, 2.2, 2), '#8e3424', light=.3)
    k2 = rp(cx - 13, cy - 10, cx, cy, r)
    F.part(limb(kx - 1, ky + 1, k2[0], k2[1] + 2, 2, 1.5), BAND)


def draw_pants_a(F, P, look):
    c = look.get('pants')
    far = mix(hexc(c), NIGHT, .2)
    cuff = mix(hexc(c), MOON, .22)
    for s, col in (('b', far), ('f', hexc(c))):
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        ft2 = (ft[0], ft[1] - 3)
        sh = thigh(P, s, grow=1) + seg(kn, ft2, 0, .62, 10, 9.5)
        if s == 'f':
            sh = pelvis_shapes(P, grow=1) + sh
        dirt = ell(kn[0] + 1, kn[1] + 2, 3, 2.2)
        marks = [(dirt, mix(col, H(MUD), .45))]
        F.part(sh, col, tex=.08, marks=marks)
        F.part(seg(kn, ft2, .52, .68, 11.5, 11.5), mix(col, cuff, .6) if s == 'f' else mix(far, cuff, .4), light=.3)
        # costura da dobra
        a, b = L2(kn, ft2, .6), L2(kn, ft2, .6)
        F.px(a[0] - 3, a[1], dk(col, .5)); F.px(a[0] + 3, a[1], dk(col, .5))
    # remendo no joelho da frente
    kx, ky = P['kn_f']
    F.part(poly((kx - 3, ky - 4), (kx + 3, ky - 4), (kx + 3, ky + 1), (kx - 3, ky + 1)), KNEE_PATCH, light=.25, tex=.1)
    for d in range(-2, 3, 2):
        F.px(kx + d, ky - 4, '#d8d0b0'); F.px(kx + d, ky + 1, '#d8d0b0')
    # costura lateral da calça da frente
    hp = P['hip_f']
    F.line(hp[0] + 3, hp[1] + 4, kx + 4, ky - 3, dk(c, .35))


def draw_shoes_a(F, P, look):
    c = look.get('shoes')
    for s, col in (('b', dk(c, .2)), ('f', H(c))):
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        ft2 = (ft[0], ft[1] - 3)
        fx_, fy_ = ft
        sole = poly((fx_ - 4, fy_ - 1), (fx_ + 10, fy_ - 1), (fx_ + 10, fy_ + 1), (fx_ - 4, fy_ + 1))
        mud = ell(fx_ + 7, fy_ - 3, 2, 1.4) + ell(fx_ - 1, fy_ - 1.5, 1.5, 1)
        sh = seg(kn, ft2, .78, 1.0, 9.5, 9.5) + ell(fx_ + 3, fy_ - 2.8, 6.8, 3.6)
        F.part(sh, col, marks=[(sole, '#2a1a10'), (mud, mix(col, H(MUD), .7))], light=.3)
        top = L2(kn, ft2, .8)
        F.line(top[0] - 3, top[1] + 1, top[0] + 3, top[1] + 1, lt(col, .25))   # costura do cano
        F.px(fx_ + 5, fy_ - 5, lt(col, .45))


def draw_shirt_a(F, P, look):
    c = H(look.get('shirt'))
    far = mix(c, NIGHT, .2)
    cuffc = mix(c, MOON, .2)
    # manga de trás (longa, até o punho dobrado)
    F.part(upper_arm(P, 'b', grow=1) + fore_arm(P, 'b', grow=1, upto=.8), far, tex=.06)
    el, ha = P['el_b'], P['ha_b']
    F.part(seg(el, ha, .62, .8, 9, 9), mix(far, cuffc, .5), light=.3)
    # tronco
    b, f = P['sh_b'], P['sh_f']
    hb = P['hip_b']
    patch = poly((b[0] + 1, hb[1] - 14), (b[0] + 8, hb[1] - 15), (b[0] + 8, hb[1] - 8), (b[0] + 1, hb[1] - 7))
    dirt = ell(b[0] + 12, hb[1] - 2, 3, 1.6) + ell(f[0] - 2, hb[1] - 4, 2, 1.3)
    sweat = ell(f[0] - 1, f[1] + 9, 2.4, 3)
    m = F.part(torso_shapes(P, grow=1), c, tex=.07,
               marks=[(patch, PATCH), (dirt, mix(c, H(MUD), .55)), (sweat, mix(c, NIGHT, .25))])
    # pesponto do remendo
    for k in range(0, 7, 2):
        F.px(b[0] + 1 + k, hb[1] - 14 - k / 7, '#6a5a3a')
        F.px(b[0] + 1 + k, hb[1] - 7 - k / 7, '#6a5a3a')
    F.px(b[0] + 1, hb[1] - 11, '#6a5a3a'); F.px(b[0] + 8, hb[1] - 12, '#6a5a3a')
    # carcela + botões
    nx, ny = P['neck']
    pv = P['pelvis']
    x0, y0, x1, y1 = nx + 4, ny + 2, pv[0] + 5, pv[1] + 2
    F.line(x0, y0, x1, y1, dk(c, .55))
    for t in (.12, .38, .62, .86):
        x, y = L2((x0, y0), (x1, y1), t)
        F.px(x + 1, y, '#e8e0c8')
    # bolso do peito com alface
    px_, py_ = nx - 9, ny + 8
    F.part(leaf_shapes(px_ + 3, py_, 0), LEAF_D, light=.35, ol='#1e3a10')
    F.part(leaf_shapes(px_ + 5, py_ - 1, 1), LEAF_L, light=.35, ol='#1e3a10')
    F.part(leaf_shapes(px_ + 2, py_ - 1, 2), '#b4e878', light=.3, ol='#1e3a10')
    pocket = poly((px_, py_), (px_ + 8, py_), (px_ + 8, py_ + 6), (px_ + 4, py_ + 7), (px_, py_ + 6))
    F.part(pocket, mix(c, MOON, .08), clip=m, light=.15)
    F.line(px_, py_, px_ + 8, py_, dk(c, .45))
    # gola
    F.part(poly((nx - 6, ny - 3), (nx + 1, ny + 1), (nx + 2, ny + 6), (nx - 4, ny + 3)), mix(c, MOON, .14))
    F.part(poly((nx + 12, ny - 3), (nx + 6, ny + 1), (nx + 6, ny + 6), (nx + 11, ny + 3)), mix(c, MOON, .14))


def leaf_shapes(x, y, k):
    if k == 0:
        return ell(x - 1, y - 2, 3.2, 3.8, rot=-25)
    if k == 1:
        return ell(x + 1, y - 2, 3.0, 4.0, rot=25)
    return ell(x, y - 4, 2.6, 3.4, rot=-5)


def draw_shirt_arm_a(F, P, look):
    c = H(look.get('shirt'))
    cuffc = mix(c, MOON, .2)
    F.part(upper_arm(P, 'f', grow=1) + fore_arm(P, 'f', grow=1, upto=.8), c, tex=.06)
    el, ha = P['el_f'], P['ha_f']
    F.part(seg(el, ha, .62, .8, 9, 9), cuffc, light=.3)
    sh = P['sh_f']
    F.line(sh[0] - 1, sh[1] - 2, sh[0] + 2, sh[1] + 1, dk(c, .4))   # costura do ombro


def draw_bandana(F, P, look):
    nx, ny = P['neck']
    hm = F.mask(head_shapes(P))
    sh = limb(nx - 6, ny - 2, nx + 7, ny - 1, 5, 5) + poly((nx - 1, ny), (nx + 9, ny), (nx + 5, ny + 8))
    m = F.part(sh, BANDANA, clip=~hm, light=.28)
    for (dx, dy) in ((-4, -2), (0, -1), (4, -2), (2, 2), (6, 1), (4, 5)):
        x, y = int(round(nx + dx)), int(round(ny + dy))
        if 0 <= x < S and 0 <= y < S and m[y, x]:
            F.px(x, y, '#f0e0d0')
    F.part(ell(nx + 8, ny - 1, 1.8, 1.8), '#9a2620', light=.3)


def draw_belt(F, P, look):
    hb, hf = P['hip_b'], P['hip_f']
    y0 = hb[1] + 0
    sh = poly((hb[0] - 6, y0), (hf[0] + 6, y0), (hf[0] + 6, y0 + 3), (hb[0] - 6, y0 + 3))
    F.part(sh, BELT, light=.3)
    bx = P['pelvis'][0] + 5
    F.part(poly((bx - 2, y0 - .5), (bx + 2, y0 - .5), (bx + 2, y0 + 3.5), (bx - 2, y0 + 3.5)), BUCKLE, light=.4, ol='#3a2a08')
    F.px(bx, y0 + 1, '#5a4210')


def hoe_layer(which):
    def fn(F, P, look):
        h = P.get('hoe')
        if h and h['layer'] == which:
            draw_hoe(F, h['hand'], h['ang'], h['len'], h.get('back', 6), h.get('side', 1))
    return fn


def draw_weapon(F, P, look):
    hoe_layer('weapon')(F, P, look)
    cn = P.get('can')
    if cn:
        P['spout'] = draw_can(F, P['ha_f'], cn)


DRAW = {
    'hair_back': hoe_layer('back'), 'body': draw_body_a, 'face': draw_face_a, 'pants': draw_pants_a,
    'shoes': draw_shoes_a, 'shirt': draw_shirt_a, 'jacket': draw_bandana, 'bag': lambda F, P, l: (draw_belt(F, P, l), hoe_layer('chest')(F, P, l)), 'arm': draw_arm_a,
    'shirt_arm': draw_shirt_arm_a, 'jacket_arm': None, 'beard': draw_beard_a, 'hair': draw_hair_a,
    'head': draw_hat, 'acc': None, 'weapon': draw_weapon,
}


# ------------------------------------------------------------------ poses do ofício

def hoe_dir(ang):
    a = math.radians(ang)
    return math.cos(a), math.sin(a)


def two_hands(P, back_d=8):
    """mão de trás no cabo, atrás da mão da frente."""
    h = P['hoe']
    ca, sa = hoe_dir(h['ang'])
    set_hand(P, 'b', (h['hand'][0] - ca * back_d, h['hand'][1] - sa * back_d))


def adjust(P):
    row, i = P['row'], P['i']
    sf, sb = P['sh_f'], P['sh_b']
    P['hoe'] = None
    P['can'] = None
    if row == 'idle':
        set_hand(P, 'f', add(sf, (9, 19)))
        hx, hy = P['ha_f']
        gx, gy = 97, 106
        ang = math.degrees(math.atan2(gy - hy, gx - hx))
        P['hoe'] = dict(layer='weapon', hand=(hx, hy - 1), ang=ang, len=math.hypot(gx - hx, gy - hy + 1), back=7, side=-1)
        set_hand(P, 'b', add(P['hip_b'], (-5, -5)))
    elif row == 'walk':
        ph = 2 * math.pi * i / 8
        set_hand(P, 'f', add(sf, (7, 13)))
        P['hoe'] = dict(layer='chest', hand=P['ha_f'], ang=-152 + 3 * math.sin(ph), len=46, back=7, side=-1)
    elif row == 'attack':
        spec = [((9, -12), -100, 'weapon'), ((-2, -26), -158, 'back'), ((14, -18), -64, 'weapon'),
                ((19, 5), 42, 'weapon'), ((15, 8), 52, 'weapon'), ((8, 2), -78, 'weapon')][i]
        set_hand(P, 'f', add(sf, spec[0]))
        P['hoe'] = dict(layer=spec[2], hand=P['ha_f'], ang=spec[1], len=28, back=10, side=1)
        two_hands(P)
        P['fx'] = []
    elif row == 'hurt':
        P['hoe'] = dict(layer='weapon', hand=P['ha_f'], ang=-58, len=28, back=10, side=1)
    elif row == 'death':
        if i <= 1:
            P['hoe'] = dict(layer='weapon', hand=P['ha_f'], ang=-80 + 20 * i, len=28, back=10, side=1)
    elif row == 'special':
        P['fx'] = []
        P['grip'] = 0
        if i == 0:
            set_hand(P, 'f', add(sf, (9, -12)))
            P['hoe'] = dict(layer='weapon', hand=P['ha_f'], ang=-100, len=28, back=10, side=1)
            two_hands(P)
            P['eyes'], P['mouth'] = 'open', 'line'
        elif i == 1:
            set_hand(P, 'f', add(sf, (17, 6)))
            P['hoe'] = dict(layer='weapon', hand=P['ha_f'], ang=56, len=28, back=10, side=1)
            two_hands(P)
            P['eyes'], P['mouth'] = 'angry', 'grit'
        else:
            set_hand(P, 'b', add(sb, (-5, 22)))
            hb = P['ha_b']
            P['hoe'] = dict(layer='back', hand=hb, ang=-93, len=26, back=G - hb[1] - 2, side=-1)
            if i == 2:
                set_hand(P, 'f', add(sf, (18, -4)))
                P['eyes'], P['mouth'] = 'open', 'smile'
            elif i in (3, 4):
                set_hand(P, 'f', add(sf, (12, -6)))
                P['can'] = 28 if i == 3 else 38
                P['eyes'], P['mouth'] = ('open', 'smile') if i == 3 else ('happy', 'smile')
            else:
                set_hand(P, 'f', add(sf, (3, 0)))
                P['can'] = -4
                P['eyes'], P['mouth'] = 'happy', 'smile'


# ------------------------------------------------------------------ efeitos

HOLE = (106, 112)


def clod(F, x, y, r=1.6):
    F.part(ell(x, y, r, r * .8), '#7a5634', ol='#2a1a10', layer=F.fx, light=.35)


def drop(F, x, y):
    F.part(poly((x, y - 2.5), (x + 1.4, y + .5), (x, y + 1.6), (x - 1.4, y + .5)), WATER, shade=False, ol=WATER_D, layer=F.fx)
    F.px(x - .4, y - .2, '#e8f8ff', F.fx)


def hole(F):
    x, y = HOLE
    F.part(ell(x - 7, y - 1, 3, 1.6) + ell(x + 7, y - 1, 3, 1.6), '#7a5634', ol='#2a1a10', layer=F.fx, light=.35)
    F.part(ell(x, y, 5, 1.8), '#3a2414', shade=False, ol='#1a0e08', layer=F.fx)


def sprout(F, stage):
    x, y = HOLE
    h = [0, 4, 8, 13][stage]
    if stage == 0:
        return
    F.part(limb(x, y - 1, x + .5, y - h, 2, 1.6), '#5a9a30', ol='#1e3a10', layer=F.fx, light=.3)
    tx, ty = x + .5, y - h
    if stage >= 1:
        F.part(ell(tx - 2.5, ty, 2.6 + stage * .5, 1.4 + stage * .3, rot=-20), LEAF, ol='#1e3a10', layer=F.fx, light=.35)
        F.part(ell(tx + 3, ty - .5, 2.6 + stage * .5, 1.4 + stage * .3, rot=20), LEAF_L, ol='#1e3a10', layer=F.fx, light=.3)
    if stage >= 3:
        F.part(ell(tx - 5, ty + 6, 4.8, 2.3, rot=-15), LEAF_D, ol='#1e3a10', layer=F.fx, light=.35)
        F.part(ell(tx + 5.5, ty + 5.5, 4.8, 2.3, rot=15), LEAF, ol='#1e3a10', layer=F.fx, light=.35)
        F.part(ell(tx, ty - 3, 2, 3.2), LEAF_L, ol='#1e3a10', layer=F.fx, light=.3)


def extra(F, P):
    row, i = P['row'], P['i']
    h = P.get('hoe')
    if row == 'attack':
        if i == 3:
            x, y = 113, 108
            impact(F, x, y - 2, 7)
            for (dx, dy, r) in ((-9, -6, 1.6), (6, -9, 1.4), (-4, -12, 1.2), (9, -3, 1.3)):
                clod(F, x + dx, y + dy, r)
        elif i == 4:
            dust(F, 106, 110, 3)
            dust(F, 118, 109, 2)
            clod(F, 112, 96, 1.3); clod(F, 101, 100, 1.2)
    elif row == 'death':
        if i == 2:
            draw_hoe(F, (98, 92), 70, 18, 14, 1, layer=F.fx)
        elif i >= 3:
            draw_hoe(F, (36, 114), 182, 22, 16, 1, layer=F.fx, blade=8)
    elif row == 'special':
        if i == 1:
            dust(F, 102, 110, 3)
            dust(F, 116, 109, 2)
            for (dx, dy, r) in ((-6, -10, 1.4), (4, -13, 1.2), (10, -7, 1.3)):
                clod(F, 108 + dx, 108 + dy, r)
        if i >= 2:
            hole(F)
        if i == 2:
            hx, hy = P['ha_f']
            for k, t in enumerate((.15, .35, .55, .75, .92)):
                x = hx + 3 + (HOLE[0] - hx - 3) * t + (k % 2) * 1.5
                y = hy + (HOLE[1] - 2 - hy) * t - 8 * math.sin(math.pi * t)
                F.part(ell(x, y, 1, .9), SEED, shade=False, ol='#5a4a20', layer=F.fx)
        if i in (3, 4):
            sx, sy = P.get('spout', (108, 76))
            n = 4 if i == 3 else 6
            for k in range(n):
                t = (k + .5) / n
                x = sx + 1 + (k % 2) * 2 - 1 + t * 1.5
                y = sy + 4 + t * (HOLE[1] - 8 - sy)
                drop(F, x, y)
            sprout(F, 1 if i == 3 else 2)
            if i == 4:
                sparkle(F, HOLE[0] + 9, HOLE[1] - 14, 2)
        if i == 5:
            sprout(F, 3)
            sparkle(F, HOLE[0] - 8, HOLE[1] - 16, 3)
            sparkle(F, HOLE[0] + 10, HOLE[1] - 10, 2)
            drop(F, HOLE[0] + 6, HOLE[1] - 4)
            drop(F, HOLE[0] - 5, HOLE[1] - 6)


# ------------------------------------------------------------------ render

def render_frame(look, row, i):
    P = pose(row, i, look.get('body', 'm'))
    adjust(P)
    F = Frame()
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return finish(F, P)


def build_sheet(look=LOOK):
    out = np.zeros((S * 6, S * 8, 4), np.uint8)
    for r, name in enumerate(ROWS):
        for c in range(NFR[name]):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = render_frame(look, name, c)
    return Image.fromarray(out, 'RGBA')


SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']


def build_variants():
    out = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = render_frame(dict(LOOK, skin=sk, hair_color=hc), 'idle', 0)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'recrutas'), exist_ok=True)
    sh = build_sheet()
    p1 = os.path.join(ROOT, 'recrutas', ID + '.png')
    sh.save(p1)
    va = build_variants()
    p2 = os.path.join(ROOT, 'recrutas', ID + '_variantes.png')
    va.save(p2)
    prev = os.environ.get('AGRI_PREVIEW')
    if prev:
        bg = Image.new('RGBA', sh.size, (74, 84, 70, 255))
        bg.alpha_composite(sh)
        for k in range(3):
            bg.crop((0, k * 256, 1024, k * 256 + 256)).resize((2048, 512), Image.NEAREST).save(os.path.join(prev, '%s_r%d.png' % (ID, k)))
        bgv = Image.new('RGBA', va.size, (74, 84, 70, 255))
        bgv.alpha_composite(va)
        bgv.save(os.path.join(prev, ID + '_var.png'))
    print('ok', sh.size, va.size)
