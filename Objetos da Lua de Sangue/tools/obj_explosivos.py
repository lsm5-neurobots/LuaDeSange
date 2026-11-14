"""Grupo explosivos — barril, bomba, explosões, destroços, fumaça, marcas, muros rachados e caixote.
Rodar da pasta tools:  python obj_explosivos.py   (gera sprites/exp_*.png e sprites/bmb_*.png)
"""
import os
import sys
import math
import random

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pixkit
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, Xf, shift, dilate, hexc, mix, shadow_layer, over,
                    glow, strip, text, sparkle, puff, dust, impact, NIGHT, MOON, INK)

OUT = os.path.join(HERE, '..', 'sprites')

# dígitos 3x5 extras (só adiciona ao dicionário em memória; pixkit.py não é alterado)
pixkit.FONT.update({
    '0': ["111", "101", "101", "101", "111"], '1': ["010", "110", "010", "010", "111"],
    '2': ["111", "001", "111", "100", "111"], '3': ["111", "001", "011", "001", "111"],
    '4': ["101", "101", "111", "001", "001"], '5': ["111", "100", "111", "001", "111"],
    '6': ["111", "100", "111", "101", "111"], '7': ["111", "001", "010", "010", "010"],
    '8': ["111", "101", "111", "101", "111"], '9': ["111", "101", "111", "001", "111"],
    'x': ["000", "101", "010", "101", "000"],
})


# ================================================================ utilidades

def col(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def T(X, shapes):
    return X(shapes) if X is not None else shapes


def grid_xy(h, w):
    yy, xx = np.mgrid[0:h, 0:w]
    return yy, xx


def num(F, s_, x, y, c, sc=2):
    L = F.fx
    for (dx, dy) in [(1, 1), (1, 0), (0, 1), (-1, 0), (0, -1), (-1, -1), (1, -1), (-1, 1)]:
        text(F, s_, x + dx, y + dy, col='#120a10', sc=sc, outline=False, layer=L)
    text(F, s_, x + 1, y + 1, col='#120a10', sc=sc, outline=False, layer=L)
    text(F, s_, x, y, col=c, sc=sc, outline=False, layer=L)


def tint_arr(arr, c, t):
    out = arr.copy()
    m = out[..., 3] > 0
    out[m, :3] = np.clip(mix(out[m, :3].astype(float), col(c), t), 0, 255)
    return out


def fade(arr, a):
    out = arr.copy()
    out[..., 3] = (out[..., 3].astype(float) * a).astype(np.uint8)
    return out


def dither_edge(L, m, c, clip=None, parity=0, alpha=255):
    """pontilhado xadrez de 1 px em volta da máscara m (transição de camadas sem degradê)."""
    h, w = m.shape
    yy, xx = grid_xy(h, w)
    o = dilate(m) & ~m & (((xx + yy) % 2) == parity)
    if clip is not None:
        o &= clip
    L[o, :3] = col(c)
    L[o, 3] = alpha


def final(F, shadow=None, spr=None):
    base = np.zeros_like(F.a)
    if shadow is not None:
        base = over(base, shadow)
    base = over(base, F.a if spr is None else spr)
    return over(base, F.fx)


def wob(cx, cy, rx, ry, seed, amp=.12, n=56):
    """elipse de borda irregular."""
    r = random.Random(seed)
    p = [r.uniform(0, 6.28) for _ in range(4)]
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        f = 1 + amp * (.5 * math.sin(3 * a + p[0]) + .3 * math.sin(5 * a + p[1]) + .25 * math.sin(9 * a + p[2])
                       + .15 * math.sin(14 * a + p[3])) + r.uniform(-amp, amp) * .35
        pts.append((cx + rx * f * math.cos(a), cy + ry * f * math.sin(a)))
    return [pts]


def lumps(cx, cy, R, seed, n=9, k=.42, sq=1.0, spread=(.5, .62)):
    """couve-flor de círculos (bola de fogo / nuvem)."""
    r = random.Random(seed)
    sh = ell(cx, cy, R * .78, R * .78 * sq)
    for i in range(n):
        a = 2 * math.pi * i / n + r.uniform(-.25, .25)
        d = R * r.uniform(*spread)
        rr = R * k * r.uniform(.75, 1.15)
        sh += ell(cx + d * math.cos(a), cy + d * math.sin(a) * sq, rr, rr * sq)
    return sh


def tear(x, y, w, h, sway=0.0, n=8):
    """gota/labareda apontando para cima (base em y)."""
    pts = []
    r = w / 2
    for i in range(n + 1):           # meia-lua de baixo
        a = math.pi * i / n
        pts.append((x + r * math.cos(a), y - r + r * math.sin(a)))
    for i in range(1, n + 1):        # lado esquerdo sobe até a ponta
        t = i / n
        pts.append((x - r * (1 - t) ** 1.3 + sway * t * t, y - r - (h - r) * t))
    for i in range(n - 1, 0, -1):    # lado direito desce
        t = i / n
        pts.append((x + r * (1 - t) ** 1.3 + sway * t * t, y - r - (h - r) * t))
    return [pts]


def flame(F, x, y, w, h, sway=0, layer=None, ol='#5a1010'):
    L = F.fx if layer is None else layer
    F.part(tear(x, y, w, h, sway), '#d8402a', shade=False, ol=ol, layer=L)
    F.flat(tear(x, y - .5, w * .74, h * .76, sway * .8), '#f58a2a', layer=L)
    F.flat(tear(x, y - 1, w * .5, h * .5, sway * .6), '#ffd84a', layer=L)
    F.flat(tear(x, y - 1, w * .26, h * .28, sway * .4), '#fffbe8', layer=L)


def sparks(F, x, y, seed, n=7, rad=9, layer=None):
    L = F.fx if layer is None else layer
    r = random.Random(seed)
    for i in range(n):
        a = r.uniform(-math.pi, .3)
        d = r.uniform(3, rad)
        px, py = x + d * math.cos(a), y + d * math.sin(a)
        c = r.choice(['#fffbe8', '#ffd84a', '#ffd84a', '#f58a2a'])
        F.px(px, py, c, L)
        if r.random() < .4:
            F.px(px - math.cos(a), py - math.sin(a), '#f58a2a', L)
    sparkle(F, x + r.uniform(-2, 2), y + r.uniform(-2, 1), 2, '#fff6c8')


def crack_path(x0, y0, ang, length, seed, step=(4, 7), jit=35, sq=1.0):
    r = random.Random(seed)
    pts = [(x0, y0)]
    a = ang
    L = 0
    while L < length:
        s = r.uniform(*step)
        a2 = a + math.radians(r.uniform(-jit, jit))
        x, y = pts[-1]
        pts.append((x + s * math.cos(a2), y + s * math.sin(a2) * sq))
        L += s
    return pts


def draw_poly_line(F, pts, c, layer=None, w=1):
    for (a, b) in zip(pts[:-1], pts[1:]):
        F.line(a[0], a[1], b[0], b[1], c, layer)
        if w >= 2:
            F.line(a[0] + 1, a[1], b[0] + 1, b[1], c, layer)
        if w >= 3:
            F.line(a[0], a[1] + 1, b[0], b[1] + 1, c, layer)


# ================================================================ fumaça

def smoke(F, blobs, body='#554a52', light='#6e646c', hi='#8a8290', ol='#1e1820', layer=None, alpha=1.0,
          dark=.32, holes=()):
    """bolos de fumaça em 3 tons sólidos + pontilhado. blobs = [(x, y, r, sx)]"""
    Lg = F.layer()
    sh = []
    for b in blobs:
        x, y, rr = b[:3]
        sx = b[3] if len(b) > 3 else 1.0
        sh += ell(x, y, rr * sx, rr)
    m = F.part(sh, body, ol=ol, layer=Lg, light=.12, dark=dark)
    lsh, hsh = [], []
    for b in blobs:
        x, y, rr = b[:3]
        sx = b[3] if len(b) > 3 else 1.0
        lsh += ell(x - rr * .28 * sx, y - rr * .3, rr * .62 * sx, rr * .58)
        hsh += ell(x - rr * .42 * sx, y - rr * .45, rr * .28 * sx, rr * .24)
    lm = F.mask(lsh) & m & ~shift(~m, 0, 0)
    lm &= ~(m & ~shift(m, 1, 2))  # mantém o brilho de borda do part
    Lg[lm, :3] = col(light)
    dither_edge(Lg, lm, light, clip=m & ~dilate(~m))
    hm = F.mask(hsh) & lm
    Lg[hm, :3] = col(hi)
    dither_edge(Lg, hm, hi, clip=lm, parity=1)
    for hsh2 in holes:
        hm2 = F.mask(hsh2)
        Lg[hm2] = 0
    if alpha < 1:
        Lg = fade(Lg, alpha)
    L = F.fx if layer is None else layer
    L[:] = over(L, Lg)
    return m


def cluster(cx, cy, R, seed, n=6, sq=.85):
    r = random.Random(seed)
    out = [(cx, cy, R * .62)]
    for i in range(n):
        a = 2 * math.pi * i / n + r.uniform(-.4, .4)
        d = R * r.uniform(.35, .55)
        out.append((cx + d * math.cos(a), cy + d * math.sin(a) * sq, R * r.uniform(.32, .48)))
    out.sort(key=lambda b: b[1])
    return out


# ================================================================ scorch (marca queimada)

def scorch(F, cx, cy, rx, ry, seed, embers=None, grass=False, layer=None, alpha=1.0):
    h, w = F.h, F.w
    L = F.layer()
    if grass:
        r = random.Random(seed + 9)
        for i in range(34):
            a = 2 * math.pi * i / 34 + r.uniform(-.08, .08)
            d = r.uniform(1.0, 1.22)
            gx, gy = cx + rx * d * math.cos(a), cy + ry * d * math.sin(a) + 2
            near = d < 1.1
            for k in range(r.randint(3, 5)):
                dx = r.uniform(-3, 3)
                hh = r.uniform(3, 6)
                tip = '#1a1210' if near else '#3a2a18'
                c = r.choice(['#2a2018', '#5a4428']) if near else r.choice(['#a08a48', '#8a7438', '#6f8a4a'])
                x1, y1 = gx + dx + r.uniform(-2, 2), gy - hh
                F.line(gx + dx, gy, x1, y1, c, L)
                F.px(x1, y1, tip, L)
    steps = [('#3a2e2a', 1.0, 120), ('#2a2024', .8, 175), ('#1a1418', .6, 225), ('#120c10', .38, 245)]
    for i, (c, s, a) in enumerate(steps):
        m = F.mask(wob(cx, cy, rx * s, ry * s, seed + i * 7, amp=.14))
        L[m, :3] = col(c)
        L[m, 3] = a
        if i:
            dither_edge(L, m, c, clip=L[..., 3] > 0, parity=i % 2, alpha=a)
    # salpicos de cinza no centro
    r = random.Random(seed + 3)
    for i in range(26):
        a = r.uniform(0, 6.28)
        d = r.uniform(0, .45) ** .8
        F.px(cx + rx * d * math.cos(a), cy + ry * d * math.sin(a), r.choice(['#6a6264', '#4a4246', '#8a8284']), L)
    # 7 rachaduras
    cr = random.Random(seed + 5)
    ember_spots = []
    for i in range(7):
        a = 2 * math.pi * i / 7 + cr.uniform(-.3, .3)
        ln = cr.uniform(.5, .95) * rx
        pts = crack_path(cx + math.cos(a) * 3, cy + math.sin(a) * 2, a, ln, seed * 13 + i, sq=ry / rx, jit=30)
        lp = [(x, y - 1) for x, y in pts]
        draw_poly_line(F, lp, '#4a4044', L)
        draw_poly_line(F, pts, '#0a0608', L, w=2 if i % 2 == 0 else 1)
        for j in range(1, len(pts) - 1, 2):
            ember_spots.append(pts[j])
        if cr.random() < .6 and len(pts) > 3:   # ramo
            bx, by = pts[len(pts) // 2]
            br = crack_path(bx, by, a + cr.choice([-1, 1]) * .8, ln * .35, seed * 31 + i, sq=ry / rx)
            draw_poly_line(F, br, '#0a0608', L)
    if embers is not None:
        er = random.Random(seed + 77 + embers)
        pick = [p for j, p in enumerate(ember_spots) if (j + embers) % 2 == 0][:10]
        E = F.layer()
        for (x, y) in pick:
            big = er.random() < .4
            glow(F, x, y, 6 if big else 4, '#f58a2a', 110, layer=E)
            F.px(x, y, '#ffd84a' if big else '#f58a2a', E)
            if big:
                F.px(x + 1, y, '#f58a2a', E)
                F.px(x, y + 1, '#d8402a', E)
                F.px(x, y - 1, '#fffbe8', E)
        L = over(L, E)
    if alpha < 1:
        L = fade(L, alpha)
    D = F.a if layer is None else layer
    D[:] = over(D, L)


# ================================================================ BARRIL

BX, BTOP, BBOT, BRX, BRY = 64.0, 46.0, 104.0, 25.0, 7.0
RED, RED_L, RED_H, RED_S, RED_D = '#a8262c', '#cf4a3e', '#e27a5c', '#741a22', '#4e1219'


def arc_y(x, yl):
    u = (x - BX) / BRX
    return yl + BRY * math.sqrt(max(0.0, 1 - u * u))


def band(y0, y1, x0=BX - BRX - .5, x1=BX + BRX + .5, n=30):
    top = [(x0 + (x1 - x0) * i / n, arc_y(x0 + (x1 - x0) * i / n, y0)) for i in range(n + 1)]
    bot = [(x1 - (x1 - x0) * i / n, arc_y(x1 - (x1 - x0) * i / n, y1)) for i in range(n + 1)]
    return [top + bot]


def vstrip(x0, x1, y0=20, y1=125):
    return poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))


def barrel(F, X=None, fuse=None, seed=1):
    body = vstrip(BX - BRX, BX + BRX, BTOP, BBOT) + ell(BX, BBOT, BRX, BRY)
    marks = [
        (vstrip(BX - BRX, BX - BRX + 3), RED_S),
        (vstrip(BX - 20, BX - 13), RED_L),
        (vstrip(BX - 18, BX - 15.5), RED_H),
        (vstrip(BX + 10, BX + 17), '#8e1e26'),
        (vstrip(BX + 17, BX + 26), RED_S),
        (vstrip(BX + 22, BX + 26), RED_D),
        # ferrugem na base e manchas
        (wob(46, 101, 7, 4, 11, .3), '#8a4e2e'), (wob(47, 102, 4, 2.4, 12, .3), '#6a3a22'),
        (wob(80, 100, 6, 5, 13, .3), '#8a4e2e'), (wob(82, 103, 3.5, 3, 14, .3), '#6a3a22'),
        (wob(66, 106, 9, 3, 15, .3), '#6a3a22'),
        (wob(84, 52, 3, 2.5, 16, .3), '#8a4e2e'),
        # lascas de tinta (metal)
        (ell(51, 89, 2.2, 1.3), '#6b6a66'), (ell(73, 52, 1.6, 1), '#6b6a66'), (ell(56, 99, 1.4, 1), '#9a9a94'),
        # escorrido de combustível
        (poly((70, 48), (72, 48), (71.5, 63), (70.5, 63)), '#5a1a1e'),
        # amassados
        (ell(76, 89, 4, 3), '#7a1c24'), (ell(77, 90, 2.5, 1.6), '#b03a38'),
        (ell(49, 52, 3, 2.4), '#8a1e26'), (ell(50, 53, 1.8, 1.2), '#c04a40'),
    ]
    for k, (x, y0, ln) in enumerate([(44, 61, 9), (58, 61, 6), (83, 61, 12), (52, 97, 7), (75, 97, 5)]):
        marks.append((poly((x, y0), (x + 1.6, y0), (x + 1.2, y0 + ln), (x + .4, y0 + ln)), '#8a4e2e'))
    F.part(T(X, body), RED, marks=[(T(X, s), c) for s, c in marks], tex=.14, light=.18, ol='#2a0a0e')
    # aros de rolagem
    for yl in (56.5, 93.5):
        F.part(T(X, band(yl, yl + 3.2)), '#8e1e26',
               marks=[(T(X, band(yl - 1, yl + .9)), '#c8463e'), (T(X, vstrip(BX + 16, BX + 27)), RED_D),
                      (T(X, vstrip(BX - 22, BX - 17)), '#c8463e'),
                      (T(X, wob(BX + 8, arc_y(BX + 8, yl) + 2, 4, 2, 21 + int(yl), .3)), '#8a4e2e'),
                      (T(X, wob(BX - 9, arc_y(BX - 9, yl) + 2, 3, 2, 31 + int(yl), .3)), '#6a3a22')],
               light=.25, ol='#2a0a0e')
    # faixa de perigo
    stripes = []
    for k in range(-2, 9):
        x0 = 36 + k * 8
        stripes.append((poly((x0, 58), (x0 + 4, 58), (x0 - 7, 92), (x0 - 11, 92)), '#1e1a1c'))
    F.part(T(X, band(66.5, 80.5)), '#e8b830',
           marks=[(T(X, vstrip(BX - 20, BX - 14)), '#f6d860'), (T(X, vstrip(BX + 15, BX + 27)), '#b8861a')] +
                 [(T(X, s), c) for s, c in stripes] +
                 [(T(X, band(79.5, 80.5)), '#9a6e12'),
                  (T(X, wob(80, 78, 4, 2, 41, .4)), '#8a4e2e'), (T(X, ell(46, 70, 2, 1.3)), '#6b6a66')],
           light=.2, ol='#2a1a08')
    # etiqueta em losango com chama
    lx, ly = 60, 74
    dia = poly((lx, ly - 10), (lx + 10, ly), (lx, ly + 10), (lx - 10, ly))
    fl = tear(lx, ly + 6, 8, 13, 1.5)
    fl2 = tear(lx + .3, ly + 6, 4.4, 7.5, 1)
    torn = poly((lx + 4, ly - 6), (lx + 10.5, ly - .5), (lx + 6, ly - 2))
    F.part(T(X, dia), '#e8e0cc', marks=[(T(X, fl), '#c8323a'), (T(X, fl2), '#f08a3e'),
                                         (T(X, poly((lx - 6, ly + 6), (lx + 6, ly + 6), (lx + 6, ly + 7), (lx - 6, ly + 7))), '#1e1a1c'),
                                         (T(X, torn), '#cdbf9a'), (T(X, ell(lx - 5, ly + 1, 1.5, 1)), '#b8a888')],
           light=.15, ol='#1e1a1c')
    # tampa
    F.part(T(X, ell(BX, BTOP, BRX, BRY)), '#b83a36',
           marks=[(T(X, ell(BX - 8, BTOP - 3.5, 10, 2.5)), '#d8604c'), (T(X, ell(BX + 18, BTOP + 3, 6, 3)), '#7a1e24')],
           light=.3, ol='#2a0a0e')
    F.part(T(X, ell(BX, BTOP + .6, BRX - 3.2, BRY - 2.2)), '#7a1e24',
           marks=[(T(X, ell(BX + 4, BTOP + 2, 12, 2.2)), '#8e2a2a'), (T(X, wob(BX - 10, BTOP + 1, 4, 1.6, 51, .3)), '#6a3a22'),
                  (T(X, ell(BX + 2, BTOP - 1, 6, 1)), '#5e1418')],
           light=.0, dark=.15, ol='#3a0c10')
    # bujão pequeno fechado
    F.part(T(X, ell(52, BTOP + 1, 3.4, 1.9)), '#8a8a84', marks=[(T(X, ell(52, BTOP + 1.2, 1.4, .8)), '#5a5a56')], light=.35, ol='#2a2422')
    # bocal grande com rosca
    F.part(T(X, ell(75, BTOP + .5, 4.8, 2.6)), '#9a9a94', marks=[(T(X, ell(74, BTOP - .5, 2.5, 1)), '#c9c3b0')], light=.35, ol='#2a2422')
    F.flat(T(X, ell(75, BTOP + .8, 2.8, 1.4)), '#1a1414')
    # pavio de pano (pano de prato xadrez, torcido)
    rag = chain([(75, BTOP), (76, BTOP - 5), (78.5, BTOP - 9), (82.5, BTOP - 11.5), (85.5, BTOP - 10)], 6.4, 4.6)
    rag_tail = chain([(84.5, BTOP - 9), (88.5, BTOP - 5), (90, BTOP), (90, BTOP + 5)], 4.4, 3.2)
    chk = []
    for (x, y) in [(76, BTOP - 3), (78, BTOP - 8), (81.5, BTOP - 11), (85, BTOP - 10), (88.5, BTOP - 4), (90, BTOP + 2.5)]:
        chk.append((T(X, ell(x, y, 1.3, 1.3)), '#b0403a'))
    F.part(T(X, rag_tail), '#bfae86', marks=chk[4:] + [(T(X, ell(90.5, BTOP + 4, 1.4, 1.6)), '#6a5a40')], tex=.25, ol='#2a2014')
    F.part(T(X, rag), '#ddd0aa', marks=chk[:4] + [(T(X, limb(75.5, BTOP - 1, 77.5, BTOP - 7, 1.2)), '#a89870'),
                                                 (T(X, ell(80, BTOP - 10.5, 1.5, 1)), '#f2ead0'),
                                                 (T(X, ell(77, BTOP - 4, 1.3, 1.6)), '#6a5a40')], tex=.25, ol='#2a2014')
    for (x0, y0, x1, y1) in [(90, BTOP + 6, 89, BTOP + 9), (91, BTOP + 6, 92, BTOP + 8.5)]:   # fiapos
        a, b = T(X, [[(x0, y0), (x1, y1)]])[0]
        F.line(a[0], a[1], b[0], b[1], '#a89870')
    if fuse is not None:
        tip = T(X, [[(84, BTOP - 12)]])[0][0]
        if fuse == 0:
            flame(F, tip[0], tip[1] + 3, 9, 19, -2.5)
        else:
            flame(F, tip[0], tip[1] + 3, 8, 15, 3)
        F.px(tip[0] - 3, tip[1] - 2, '#2a2014', F.fx)
        sparks(F, tip[0], tip[1] - 8, 100 + fuse, n=9, rad=11)


def barrel_destroyed(F, seed=4):
    r = random.Random(seed)
    TY = 77
    # pétalas de trás (lado de dentro, chamuscado, com metal exposto)
    for (x0, x1, tx, ty) in [(42, 54, 33, 58), (52, 64, 50, 52), (62, 74, 68, 50), (72, 86, 92, 60)]:
        F.part(poly((x0, TY + 1), (x1, TY + 1), (tx + 4, ty + 3), (tx, ty), (tx - 2, ty + 5)), '#2a1a1c',
               marks=[(ell(tx + 1, ty + 5, 3, 2.5), '#5a4a46'), (ell((x0 + x1) / 2, TY - 4, 3, 2), '#4a2a26'),
                      (ell(tx + 2, ty + 9, 2, 1.5), '#8a4e2e')], tex=.25, light=.25, ol='#0e0608')
    F.flat(ell(BX, TY + 1, BRX - 2.5, BRY - 1.5), '#100a0c')
    F.flat(ell(BX + 3, TY + 2.5, 11, 2.5), '#3a1a14')
    n = 16
    top = []
    for i in range(n + 1):
        x = BX - BRX + 2 * BRX * i / n
        jag = (-6 if i % 2 else 2) + r.uniform(-2, 2)
        top.append((x, arc_y(x, TY) + jag))
    front = [top + [(BX + BRX, BBOT), (BX - BRX, BBOT)]] + ell(BX, BBOT, BRX, BRY)
    F.part(front, '#3a2226', marks=[
        (vstrip(BX - 20, BX - 14), '#4a2c2e'), (vstrip(BX + 16, BX + 26), '#24161a'),
        (band(96, 112), '#7a1e24'), (band(98, 112, BX - 18, BX - 10), '#a8262c'), (band(98, 112, BX + 2, BX + 8), '#a8262c'),
        (wob(70, 102, 8, 3, 61, .3), '#8a4e2e'), (wob(52, 104, 5, 2, 62, .3), '#6a3a22'),
        (wob(60, 88, 6, 4, 63, .3), '#1a1012'), (ell(78, 92, 3, 2), '#1a1012'), (wob(46, 86, 3, 4, 64, .3), '#5a3434'),
    ], tex=.3, light=.15, ol='#0e0608')
    F.part(band(93.5, 96.5), '#2e1a1c', marks=[(band(92.5, 94), '#5a3434'), (vstrip(BX - 12, BX - 2), '#5a2a26'),
                                                (vstrip(BX + 6, BX + 14), '#8a4e2e')], ol='#0e0608')
    # pétalas da frente dobradas para fora (ponta enrolada)
    for (px, py, tx, ty, w) in [(41, 86, 27, 72, 7), (87, 86, 101, 74, 7), (58, 88, 52, 70, 6), (73, 88, 80, 72, 5)]:
        F.part(poly((px - w / 2, py), (px + w / 2, py + 1), (tx + 2.5, ty + 2), (tx, ty - 1), (tx - 2, ty + 1)), '#3a2226',
               marks=[(ell(tx, ty + 1, 2.4, 2), '#6a5a56'), (ell(px, py, 2.5, 1.5), '#7a1e24'),
                      (ell((px + tx) / 2, (py + ty) / 2, 1.5, 1.2), '#1a1012')], tex=.2, ol='#0e0608')
    E = F.fx
    for (x, y) in [(58, 80), (66, 81), (72, 79), (47, 82), (79, 84), (63, 78), (52, 90), (84, 98)]:
        glow(F, x, y, 5, '#f58a2a', 100)
        F.px(x, y, '#ffd84a', E)
        F.px(x + 1, y, '#f58a2a', E)
    flame(F, 64, 80, 6, 10, 1.5)
    smoke(F, [(66, 66, 5.5, 1.2), (62, 57, 4.5), (66, 49, 4, 1.1), (61, 42, 3), (64, 36, 2.2)],
          body='#4a3e48', light='#5e5460', hi='#766c7a', alpha=.8)


def gen_barril():
    frames = []
    sh = shadow_layer(64, 30, 5, 100, 128, 128, 108)

    def mk(fuse=None, X=None, white=0.0, glowc=None):
        F = Frame(128, 128)
        barrel(F, X, fuse)
        spr = F.a
        if white:
            spr = tint_arr(spr, '#fffcf4', white)
        if glowc:
            G = F.layer()
            glow(F, 64, 76, 50, glowc[0], glowc[1], layer=G)
            spr = over(G, spr)
        return final(F, sh, spr)

    frames.append(mk())
    frames.append(mk(0))
    frames.append(mk(1))
    frames.append(mk(0, white=.35))
    frames.append(mk(1, white=.7))
    S = 1.15
    frames.append(mk(0, Xf(64, 110, -4, sx=S, sy=S), white=.25))
    frames.append(mk(1, Xf(64, 110, 4, sx=S, sy=S), white=.45))
    frames.append(mk(None, Xf(64, 110, 0, sx=1.12, sy=1.2), white=.93, glowc=('#ffffff', 96)))
    F = Frame(128, 128)
    scorch(F, 64, 104, 40, 13, 5)
    barrel_destroyed(F)
    frames.append(final(F, shadow_layer(64, 28, 4, 80, 128, 128, 107)))
    F = Frame(128, 128)
    scorch(F, 64, 102, 50, 18, 6, embers=0)
    frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'exp_barril.png'))
    return frames


# ================================================================ EXPLOSÃO 192

def fireball(F, cx, cy, R, layers, seed, ol='#5a1010', L=None, n=10):
    L = F.fx if L is None else L
    prev = None
    for i, (c, s, ox, oy) in enumerate(layers):
        sh = lumps(cx + ox, cy + oy, R * s, seed, n=n)
        if i == 0:
            m = F.part(sh, c, ol=ol, layer=L, light=.1, dark=.25)
            outer = m
        else:
            m = F.flat(sh, c, layer=L, clip=outer)
            dither_edge(L, m, c, clip=prev)
        prev = m
    return outer


def rays(F, cx, cy, r0, r1, n, c, L, seed, w=3):
    r = random.Random(seed)
    for i in range(n):
        a = 2 * math.pi * i / n + r.uniform(-.15, .15)
        ln = r1 * (1 if i % 2 == 0 else .7) * r.uniform(.85, 1.1)
        p0 = (cx + r0 * math.cos(a - .06), cy + r0 * math.sin(a - .06))
        p1 = (cx + r0 * math.cos(a + .06), cy + r0 * math.sin(a + .06))
        tip = (cx + ln * math.cos(a), cy + ln * math.sin(a))
        F.flat([[p0, tip, p1]], c, layer=L)


def gen_explosao():
    W = 192
    cx, cy = 96, 104
    frames = []

    # q0 núcleo branco
    F = Frame(W, W)
    glow(F, cx, cy, 70, '#ffd84a', 150)
    F.flat(ell(cx, 150, 60, 10), '#f58a2a', layer=F.fx, alpha=90)
    rays(F, cx, cy, 18, 62, 14, '#fff4c8', F.fx, 1)
    fireball(F, cx, cy, 28, [('#f58a2a', 1, 0, 0), ('#ffd84a', .86, -1, -1), ('#fffbe8', .66, -2, -3)], 3, ol='#8a2a10', n=8)
    frames.append(final(F))

    # q1 amarelo
    F = Frame(W, W)
    glow(F, cx, cy, 92, '#f58a2a', 120)
    F.flat(ell(cx, 152, 76, 13), '#d8402a', layer=F.fx, alpha=80)
    fireball(F, cx, cy, 50, [('#f58a2a', 1, 0, 0), ('#ffd84a', .82, -3, -4), ('#fff3b0', .58, -4, -7), ('#fffbe8', .44, -5, -8)], 7,
             ol='#7a2010')
    sparks(F, cx + 52, cy - 40, 3, 8, 10)
    sparks(F, cx - 58, cy - 30, 4, 8, 10)
    frames.append(final(F))

    # q2 laranja com labaredas
    F = Frame(W, W)
    glow(F, cx, cy + 10, 96, '#d8402a', 96)
    F.flat(ell(cx, 156, 86, 14), '#8a2020', layer=F.fx, alpha=110)
    r = random.Random(9)
    for i in range(11):
        a = -math.pi / 2 + (i - 5) * .3
        x = cx + 66 * math.cos(a)
        y = cy + 60 * math.sin(a) + 14
        flame(F, x, y, 16, r.uniform(30, 42) * (1 - abs(i - 5) * .06), (i - 5) * 4, ol='#5a1010')
    smoke(F, [(cx - 34, cy - 58, 13, 1.3), (cx - 14, cy - 70, 17, 1.3), (cx + 10, cy - 74, 16, 1.3), (cx + 32, cy - 62, 14, 1.3),
              (cx + 48, cy - 48, 10)], body='#3a3038', light='#4a3e48', hi='#5e5460')
    fireball(F, cx, cy, 70, [('#d8402a', 1, 0, 0), ('#f58a2a', .84, -2, -4), ('#ffd84a', .6, -4, -8), ('#fffbe8', .3, -5, -10)], 11,
             n=11)
    frames.append(final(F))

    # q3 vermelho quebrado com fumaça
    F = Frame(W, W)
    F.flat(ell(cx, 158, 88, 14), '#3a1418', layer=F.fx, alpha=120)
    smoke(F, cluster(cx, cy - 12, 92, 21, n=9), body='#3a3038', light='#4a3e48', hi='#5e5460')
    L = F.fx
    outer = fireball(F, cx + 2, cy + 6, 62, [('#8a2020', 1, 0, 0), ('#d8402a', .7, -3, -4)], 23, ol='#2a0a0e', n=9)
    rr = random.Random(5)
    for i in range(10):
        a = rr.uniform(0, 6.28)
        d = rr.uniform(.0, .55) * 62
        x, y = cx + 2 + d * math.cos(a), cy + 6 + d * math.sin(a)
        m = F.flat(wob(x, y, rr.uniform(4, 9), rr.uniform(3, 7), i, .25), rr.choice(['#f58a2a', '#d8402a', '#f58a2a']), layer=L, clip=outer)
        if rr.random() < .5:
            F.flat(ell(x - 1, y - 1, 2, 1.6), '#ffd84a', layer=L, clip=m)
    smoke(F, [(cx - 52, cy + 34, 12, 1.6), (cx + 54, cy + 32, 12, 1.6), (cx - 26, cy + 50, 10, 1.8), (cx + 26, cy + 51, 10, 1.8),
              (cx, cy + 56, 9, 2)], body='#4a3e48', light='#5e5460', hi='#766c7a', alpha=.9)
    frames.append(final(F))

    # q4 fumaça escura
    F = Frame(W, W)
    holes = [ell(cx - 30, cy - 10, 8, 6), ell(cx + 26, cy + 18, 7, 5), ell(cx + 4, cy - 44, 6, 5)]
    smoke(F, cluster(cx, cy - 22, 96, 31, n=10), body='#3a3038', light='#554a52', hi='#6e646c', holes=holes)
    rr = random.Random(8)
    for i in range(18):
        x, y = cx + rr.uniform(-80, 80), cy + rr.uniform(-80, 50)
        glow(F, x, y, 4, '#f58a2a', 100)
        F.px(x, y, rr.choice(['#ffd84a', '#f58a2a', '#d8402a']), F.fx)
    frames.append(final(F))

    # q5 impact: branco com silhueta preta
    F = Frame(W, W)
    F.a[..., :3] = 255
    F.a[..., 3] = 255
    K = '#0c080a'
    pts = []
    for i in range(24):
        a = 2 * math.pi * i / 24
        rr_ = (88 if i % 4 == 0 else 66) if i % 2 == 0 else 40
        pts.append((cx + rr_ * math.cos(a), cy + rr_ * math.sin(a) * .9))
    F.flat([pts], K)
    F.flat(lumps(cx, cy, 52, 7), K)
    rr = random.Random(12)
    for i in range(14):
        a = rr.uniform(0, 6.28)
        d = rr.uniform(70, 92)
        x, y = cx + d * math.cos(a), cy + d * math.sin(a)
        s = rr.uniform(3, 6)
        F.flat(rot(poly((x - s, y), (x, y - s * .6), (x + s * 1.4, y + s * .3), (x, y + s * .5)), x, y, rr.uniform(0, 360)), K)
    F.flat(poly((0, 158), (192, 158), (192, 160), (0, 160)), K)
    frames.append(F.a.copy())

    # q6 impact: preto com bola branca
    F = Frame(W, W)
    F.a[..., :3] = col(K)
    F.a[..., 3] = 255
    F.flat(lumps(cx, cy, 46, 7), '#ffffff')
    pts = []
    for i in range(16):
        a = 2 * math.pi * i / 16 + .2
        rr_ = 62 if i % 2 == 0 else 38
        pts.append((cx + rr_ * math.cos(a), cy + rr_ * math.sin(a) * .9))
    F.flat([pts], '#ffffff')
    yy, xx = grid_xy(W, W)
    d = np.sqrt(((xx - cx) / 84.) ** 2 + ((yy - cy) / 80.) ** 2)
    ring = (np.abs(d - 1) < .018) & ((np.arctan2(yy - cy, xx - cx) * 30).astype(int) % 2 == 0)
    F.a[ring, :3] = 255
    frames.append(F.a.copy())
    strip(frames).save(os.path.join(OUT, 'exp_explosao.png'))


# ================================================================ DESTROÇOS 64

def gen_destrocos():
    frames = []
    c = 32
    # chapa de metal
    for k, deg in enumerate([0, 90, 180, 270]):
        F = Frame(64, 64)
        face = k % 2 == 0
        X = Xf(c, c, deg + 12, sx=1, sy=1 if face else .5)
        top = [(c - 15 + i * 3, c - 7 + 2.2 * math.sin(i * .5)) for i in range(11)]
        bot = [(c + 15 - i * 3, c + 7 + (2.5 if i % 2 else -.5) + 2.2 * math.sin((10 - i) * .5)) for i in range(11)]
        sh = [top + bot]
        if face:
            marks = [(poly((c - 16, c - 1), (c + 16, c - 2), (c + 16, c + 4), (c - 16, c + 5)), '#e8b830')]
            for j in range(-3, 4):
                x0 = c + j * 7
                marks.append((poly((x0, c - 2), (x0 + 3, c - 2), (x0 - 1, c + 5), (x0 - 4, c + 5)), '#1e1a1c'))
            marks += [(poly((c - 16, c - 9), (c + 16, c - 9), (c + 16, c - 6), (c - 16, c - 6)), '#cf4a3e'),
                      (ell(c + 9, c + 7, 4, 2), '#8a4e2e'), (ell(c - 10, c - 4, 2, 1.2), '#6b6a66'),
                      (poly((c - 16, c + 5), (c + 16, c + 4), (c + 16, c + 12), (c - 16, c + 12)), '#741a22')]
            F.part(X([[p for p in sh[0]]]), RED, marks=[(X(s), cc) for s, cc in marks], tex=.12, light=.25, ol='#2a0a0e')
        else:
            marks = [(ell(c - 4, c, 7, 4), '#8a4e2e'), (ell(c - 5, c, 3, 2), '#6a3a22'), (ell(c + 9, c - 3, 3, 2), '#8a4e2e'),
                     (poly((c - 16, c - 9), (c + 16, c - 9), (c + 16, c - 5), (c - 16, c - 5)), '#9a9a94')]
            F.part(X(sh), '#6b6a66', marks=[(X(s), cc) for s, cc in marks], tex=.25, light=.3, ol='#1e1c1c')
        frames.append(final(F))
    # madeira
    for k, deg in enumerate([-18, 52]):
        F = Frame(64, 64)
        X = Xf(c, c, deg)
        pl = poly((c - 15, c - 4), (c + 11, c - 4), (c + 13, c - 6), (c + 14, c - 2), (c + 16, c - 1), (c + 13, c + 1), (c + 15, c + 4),
                  (c - 14, c + 4), (c - 16, c + 1), (c - 13, c), (c - 17, c - 2))
        F.part(X(pl), '#9a6a3c', marks=[(X(poly((c - 16, c + 1.5), (c + 16, c + 1.5), (c + 16, c + 5), (c - 16, c + 5))), '#7d5430'),
                                        (X(limb(c - 12, c - 1.5, c + 4, c - 1, .8)), '#5a3a22'),
                                        (X(limb(c - 6, c + 2, c + 10, c + 2.5, .8)), '#5a3a22'),
                                        (X(ell(c - 2, c - 1, 1.6, 1)), '#5a3a22')], tex=.2, ol='#2a1a0e')
        F.part(X(limb(c + 6, c - 4, c + 9, c - 11, 1.6, 1)), '#c9c3b0', marks=[(X(ell(c + 8, c - 8, 1, 1)), '#8a4e2e')], ol='#2a2422')
        F.part(X(ell(c + 6, c - 3.5, 1.6, 1.2)), '#c9c3b0', ol='#2a2422')
        sp = poly((c - 10, c + 10), (c + 2, c + 9), (c + 4, c + 11), (c - 9, c + 12.5))
        F.part(rot(sp, c, c, deg * .5 + 20), '#8b5e34', marks=[(rot(poly((c - 10, c + 11.5), (c + 4, c + 11), (c + 4, c + 13), (c - 10, c + 13)), c, c, deg * .5 + 20), '#5a3a22')], ol='#2a1a0e')
        frames.append(final(F))
    # torrão e pedra
    for k, deg in enumerate([0, 70]):
        F = Frame(64, 64)
        X = Xf(c, c, deg)
        F.part(X(wob(c - 5, c + 2, 10, 8, 3 + k, .2)), '#6a4a30',
               marks=[(X(wob(c - 5, c - 3, 9, 3.5, 5, .3)), '#5f7a4a'), (X(wob(c - 8, c - 4, 4, 1.5, 6, .3)), '#7a9a5a'),
                      (X(ell(c - 2, c + 6, 3, 2)), '#4a3220'), (X(ell(c - 9, c + 4, 1.2, 1)), '#8e8a84')], tex=.3, ol='#1e140c')
        for (gx, gh) in [(-10, 5), (-7, 6), (-4, 4), (-1, 5)]:
            a, b = X([[(c + gx, c - 4), (c + gx - 1, c - 4 - gh)]])[0]
            F.line(a[0], a[1], b[0], b[1], '#6f8a4a')
            F.px(b[0], b[1], '#9aba6a')
        F.part(X(poly((c + 4, c - 6), (c + 14, c - 7), (c + 16, c + 1), (c + 13, c + 6), (c + 5, c + 5), (c + 3, c))), '#8e8a84',
               marks=[(X(poly((c + 4, c - 6), (c + 14, c - 7), (c + 15, c - 3), (c + 4, c - 2))), '#a8a49c'),
                      (X(ell(c + 11, c + 3, 2, 1.4)), '#77736e'), (X(limb(c + 7, c - 1, c + 12, c + 1, .8)), '#5e5a56')], tex=.2, ol='#24221f')
        frames.append(final(F))
    # brasas
    for k in range(2):
        F = Frame(64, 64)
        r = random.Random(40 + k)
        for i in range(7):
            x, y = c + r.uniform(-18, 18), c + r.uniform(-18, 18)
            s = r.choice([1, 1, 2, 2, 3]) if (i + k) % 3 else 1
            glow(F, x, y, 4 + s * 2, '#f58a2a', 120 if (i + k) % 2 == 0 else 72)
            if s >= 2:
                F.part(ell(x, y, s * .8, s * .8), '#f58a2a', shade=False, ol='#8a2020', layer=F.fx)
                F.px(x, y, '#ffd84a', F.fx)
                if s == 3:
                    F.px(x - 1, y - 1, '#fffbe8', F.fx)
            else:
                F.px(x, y, '#ffd84a' if (i + k) % 2 else '#f58a2a', F.fx)
            F.px(x + r.choice([-1, 1]), y + 2 + s, '#d8402a', F.fx)
        frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'exp_destrocos.png'))


# ================================================================ FUMAÇA 128

def gen_fumaca():
    frames = []
    c = 64
    tones = [('#3a3038', '#4a3e48', '#5e5460'), ('#4a3e48', '#5e5460', '#766c7a'),
             ('#5e5460', '#766c7a', '#8a8290'), ('#6e646c', '#8a8290', '#a49cac')]
    for k, (R, up) in enumerate([(18, 0), (28, 10), (38, 22), (46, 34)]):
        F = Frame(128, 128)
        b, l, h = tones[k]
        holes = []
        if k == 3:
            holes = [ell(c - 14, 112 - up - R * .5, 7, 5), ell(c + 16, 112 - up - R * .3, 6, 4), ell(c + 2, 112 - up - R * 1.1, 5, 4)]
        smoke(F, cluster(c, 112 - up - R * .7, R * 1.25, 50 + k, n=5 + k), body=b, light=l, hi=h, holes=holes,
              alpha=1 if k < 3 else .8)
        frames.append(final(F))
    for k in range(3):
        F = Frame(128, 128)
        ln = [36, 64, 92][k]
        x0 = 16 + k * 6
        blobs = []
        n = 4 + k * 2
        r = random.Random(70 + k)
        for i in range(n):
            t = i / (n - 1)
            rr = (9 + 8 * math.sin(t * math.pi)) * (1 - .15 * k)
            blobs.append((x0 + ln * t, 96 - 6 * t + r.uniform(-3, 3), rr, 1.7))
        holes = [ell(x0 + ln * .5 + 6, 94, 5, 3)] if k == 2 else []
        for i in range(3 + k):   # riscos de velocidade
            y = 88 + i * 4 + r.uniform(-1, 1)
            x1 = x0 - 4 - r.uniform(2, 8)
            F.line(x1 - 10 - k * 4, y, x1, y, '#554a52', F.fx)
            F.line(x1 - 4 - k * 2, y, x1, y, '#6e646c', F.fx)
        for i in range(n):   # bolos de cima (volume)
            t = (i + .5) / n
            if .15 < t < .85:
                blobs.append((x0 + ln * t, 96 - 6 * t - 8, 7 * (1 - .15 * k), 1.5))
        blobs.sort(key=lambda b: b[1])
        smoke(F, blobs, body='#3a3038', light='#4e4250', hi='#665a6a', ol='#120c12', holes=holes, alpha=1 if k < 2 else .8)
        frames.append(final(F))
    for k in range(3):
        F = Frame(128, 128)
        hgt = [44, 68, 88][k]
        blobs = []
        r = random.Random(90 + k)
        n = 4 + k * 3
        for i in range(n):
            t = i / max(1, n - 1)
            y = 104 - hgt * t
            x = c + 7 * math.sin(t * 4 + k) + r.uniform(-3, 3)
            rr = 15 - 7 * t + r.uniform(-1.5, 1.5)
            blobs.append((x, y, rr))
            if r.random() < .6:
                blobs.append((x + r.choice([-1, 1]) * rr * .7, y + r.uniform(-3, 3), rr * .6))
        blobs.append((c - 12, 106, 8))
        blobs.append((c + 13, 107, 7))
        blobs.sort(key=lambda b: b[1])
        if k == 2:
            blobs.insert(0, (c + 14, 104 - hgt - 4, 4))
            blobs.insert(0, (c - 10, 104 - hgt + 2, 3))
        smoke(F, blobs, body='#6e646c', light='#8a8290', hi='#a49cac', ol='#2a2430', alpha=1 if k < 2 else .85)
        frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'exp_fumaca.png'))


# ================================================================ MARCA 128x96

def gen_marca():
    frames = []
    for e in (0, 1):
        F = Frame(128, 96)
        scorch(F, 64, 50, 52, 30, 21, embers=e)
        frames.append(final(F))
    F = Frame(128, 96)
    scorch(F, 64, 50, 52, 30, 21)
    frames.append(final(F))
    F = Frame(128, 96)
    scorch(F, 64, 50, 52, 30, 21, alpha=.35)
    frames.append(final(F))
    F = Frame(128, 96)
    scorch(F, 64, 46, 46, 26, 21, embers=0, grass=True)
    frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'exp_marca.png'))


# ================================================================ PERIGO 128x96

def ring_mask(w, h, cx, cy, rx, ry, th):
    yy, xx = grid_xy(h, w)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    return d, (d <= 1) & (d >= 1 - th / rx)


def gen_perigo():
    W, H, cx, cy = 128, 96, 64, 48
    frames = []
    for k in range(2):
        F = Frame(W, H)
        rx, ry = 54 + k * 3, 32 + k * 2
        F.flat(ell(cx, cy, rx, ry), '#c8323a', alpha=40 + 30 * k)
        F.flat(ell(cx, cy, rx * .55, ry * .55), '#c8323a', alpha=24 + 20 * k)
        nd = 28
        dsh = []
        for i in range(nd):
            a0 = 2 * math.pi * i / nd
            a1 = a0 + 2 * math.pi / nd * .58
            pts = [(cx + (rx + 1.6) * math.cos(a0 + (a1 - a0) * t / 4), cy + (ry + 1.2) * math.sin(a0 + (a1 - a0) * t / 4)) for t in range(5)]
            pts += [(cx + (rx - 1.6) * math.cos(a1 - (a1 - a0) * t / 4), cy + (ry - 1.2) * math.sin(a1 - (a1 - a0) * t / 4)) for t in range(5)]
            dsh.append(pts)
        F.part(dsh, '#e04048' if k else '#c8323a', shade=False, ol='#5a0e14')
        for i in range(40):   # anel interno de pontos
            a = 2 * math.pi * i / 40 + k * .08
            F.px(cx + rx * .72 * math.cos(a), cy + ry * .72 * math.sin(a), '#e04048', alpha=150 + 60 * k)
        for (dx, dy) in [(-3, 0), (-2, 0), (2, 0), (3, 0), (0, -2), (0, 2)]:
            F.px(cx + dx, cy + dy, '#e04048')
        F.px(cx, cy, '#ff8a8a')
        frames.append(final(F))
    for k, (rx, th, al) in enumerate([(22, 6, 255), (40, 4, 220), (58, 2.5, 170)]):
        F = Frame(W, H)
        ry = rx * .6
        d, m = ring_mask(W, H, cx, cy, rx, ry, th)
        _, inner = ring_mask(W, H, cx, cy, rx - th * .45, ry - th * .3, th * .5)
        L = F.fx
        L[m, :3] = col('#f58a2a')
        L[m, 3] = al
        L[inner & m, :3] = col('#fff4e0')
        o = dilate(m) & ~m
        L[o, :3] = col('#8a2a10')
        L[o, 3] = int(al * .7)
        if k == 0:
            F.flat(ell(cx, cy, rx - th, ry - th * .6), '#ffd84a', layer=L, alpha=96)
            F.flat(ell(cx - 2, cy - 1, rx * .5, ry * .45), '#fff4e0', layer=L, alpha=120)
        if k >= 1:
            r = random.Random(k)
            for i in range(10):
                a = 2 * math.pi * i / 10 + r.uniform(-.2, .2)
                dust(F, cx + rx * math.cos(a), cy + ry * math.sin(a), 2 + k)
        frames.append(final(F))
    F = Frame(W, H)
    rx, ry = 52, 31
    L = F.fx
    _, band_ = ring_mask(W, H, cx, cy, rx, ry, 7)
    L[band_, :3] = 255
    L[band_, 3] = 60
    _, inl = ring_mask(W, H, cx, cy, rx - 6, ry - 3.6, 1.5)
    L[inl, :3] = col('#fff4e0')
    L[inl, 3] = 200
    _, outl = ring_mask(W, H, cx, cy, rx + 1.5, ry + 1, 1.5)
    L[outl, :3] = col('#2a2030')
    L[outl, 3] = 110
    _, mid = ring_mask(W, H, cx, cy, rx - 2.5, ry - 1.5, 1)
    yy, xx = grid_xy(H, W)
    mid &= ((xx + yy) % 3 == 0)
    L[mid, :3] = col('#fff4e0')
    L[mid, 3] = 140
    frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'exp_perigo.png'))


# ================================================================ BOMBA 64

def bomb(F, cx, cy, r, X=None, fuse_len=None, lit=True, seed=1, mini=False):
    s = r / 12.0
    sph = ell(cx, cy, r, r)
    marks = [(ell(cx - 1.8 * s, cy - 2.2 * s, r * .84, r * .8), '#3c3a46'),
             (ell(cx - 3.4 * s, cy - 4.2 * s, r * .52, r * .46), '#4c4a58'),
             (ell(cx - 4.6 * s, cy - 5.8 * s, r * .22, r * .18), '#6a6878'),
             (ell(cx + 2 * s, cy + 3 * s, r * .8, r * .7), '#2a2830'),
             (wob(cx + 6 * s, cy + 6.5 * s, 3.5 * s, 2.5 * s, seed, .35), '#6a3a22'),
             (wob(cx + 7 * s, cy + 5.5 * s, 2 * s, 1.5 * s, seed + 1, .35), '#8a4e2e'),
             (ell(cx - 8 * s, cy + 3 * s, 1.5 * s, 1 * s), '#6b6a66'),
             (ell(cx + 8 * s, cy - 5 * s, 1.2 * s, 1 * s), '#5a5866')]
    m = F.part(T(X, sph), '#34323c', marks=[(T(X, sh), c) for sh, c in marks], tex=.1, light=.25, ol='#0e0c12')
    # brilho especular
    for (dx, dy, c) in [(-6, -7, '#a8a6b6'), (-5, -7, '#a8a6b6'), (-6, -6, '#8a889a'), (-7, -5, '#6a6878'), (-5, -8, '#e8e6f0')]:
        q = T(X, [[(cx + dx * s, cy + dy * s)]])[0][0]
        F.px(q[0], q[1], c)
    # fita silver tape
    def tape_y(x, off):
        u = (x - cx) / r
        return cy - 1 * s + off + 2.4 * s * math.sqrt(max(0, 1 - u * u)) - 1.4 * s * u
    n = 16
    xs = [cx - r - 1 + (2 * r + 2) * i / n for i in range(n + 1)]
    tp = [[(x, tape_y(x, -2 * s)) for x in xs] + [(x, tape_y(x, 2 * s)) for x in reversed(xs)]]
    tl = [[(x, tape_y(x, -2.4 * s)) for x in xs] + [(x, tape_y(x, -1.1 * s)) for x in reversed(xs)]]
    F.part(T(X, tp), '#a2a29a', marks=[(T(X, tl), '#d0ccc0'), (T(X, vstrip(cx + r * .5, cx + r + 2)), '#77736e'),
                                       (T(X, vstrip(cx - r - 2, cx - r * .75)), '#8a8a84')],
           clip=m, light=.1, ol='#24221f', outline=False)
    for k in range(4):   # bordas da fita e rugas
        x = cx - r * .7 + k * r * .45
        q = T(X, [[(x, tape_y(x, 2 * s)), (x + 1, tape_y(x, -.5 * s))]])[0]
        F.px(q[0][0], q[0][1], '#4a4844')
        F.px(q[1][0], q[1][1], '#77736e')
    q = T(X, [[(cx - r - .5, tape_y(cx - r, -1 * s)), (cx - r - 1.5, tape_y(cx - r, 1.5 * s))]])[0]   # ponta descolada
    F.line(q[0][0], q[0][1], q[1][0], q[1][1], '#c9c3b0')
    if not mini:
        for ux in (-6, 1, 7):   # cabeças de prego
            x = cx + ux * s
            q = T(X, [[(x, tape_y(x, 0))]])[0][0]
            F.px(q[0], q[1], '#e8e2d0')
            F.px(q[0] + 1, q[1], '#c9c3b0')
            F.px(q[0], q[1] + 1, '#5a5652')
            F.px(q[0] + 1, q[1] + 1, '#3a3834')
        for i in range(5):   # X vermelho pintado
            for (px_, py_) in [(cx + 1 * s + i, cy + 4.5 * s + i), (cx + 1 * s + 4 - i, cy + 4.5 * s + i)]:
                q = T(X, [[(px_, py_)]])[0][0]
                F.px(q[0], q[1], '#c8323a' if i != 2 else '#e04048')
        q = T(X, [[(cx + 1 * s + 2, cy + 4.5 * s + 6)]])[0][0]
        F.px(q[0], q[1], '#8a1e26')
    # gargalo de latão
    ny = cy - r + 1
    F.part(T(X, poly((cx - 3 * s, ny + 2), (cx + 3 * s, ny + 2), (cx + 2.6 * s, ny - 3 * s), (cx - 2.6 * s, ny - 3 * s))), '#b8861a',
           marks=[(T(X, vstrip(cx - 2.6 * s, cx - 1.2 * s)), '#f2c230'), (T(X, vstrip(cx + 1.5 * s, cx + 3 * s)), '#7a5a12')], ol='#2a1a08')
    F.part(T(X, ell(cx, ny - 3 * s, 3 * s, 1.3 * s)), '#d8a830', marks=[(T(X, ell(cx, ny - 3 * s, 1.2 * s, .6 * s)), '#3a2a10')], ol='#2a1a08')
    tip = None
    if fuse_len:
        pts = []
        steps = 6
        for i in range(steps + 1):
            t = fuse_len * i / steps
            pts.append((cx + .35 * t + 1.6 * math.sin(t * .35), ny - 3 * s - t * .8))
        F.part(T(X, chain(pts, 2, 1.6)), '#b59a62', ol='#2a2014', shade=False)
        for i in range(len(pts) - 1):
            mx, my = (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2
            q = T(X, [[pts[i], (mx, my)]])[0]
            F.px(q[0][0], q[0][1], '#7a6438')
            F.px(q[1][0], q[1][1], '#d8c08a')
        q = T(X, [[pts[-1]]])[0][0]
        F.px(q[0], q[1], '#2a1a10')
        tip = T(X, [[pts[-1]]])[0][0]
    return tip


def gen_bomba():
    frames = []
    cx, cy, r = 32, 43, 12
    gy = 55
    sh = shadow_layer(cx, 13, 3, 100, 64, 64, gy)

    def ground(fl, white=0.0, red=0.0, X=None, glw=None, shadow=sh, ccy=cy):
        F = Frame(64, 64)
        tip = bomb(F, cx, ccy, r, X, fl)
        spr = F.a
        if red:
            spr = tint_arr(spr, '#f03c3c', red)
        if white:
            spr = tint_arr(spr, '#fffcf4', white)
        if glw:
            G = F.layer()
            glow(F, cx, ccy, glw[2], glw[0], glw[1], layer=G)
            spr = over(G, spr)
        if tip is not None:
            sparks(F, tip[0], tip[1], int(fl * 10), n=8, rad=7)
            glow(F, tip[0], tip[1], 6, '#ffd84a', 120)
        return final(F, shadow, spr)

    # q0 item do HUD com contador
    F = Frame(64, 64)
    bomb(F, 28, 32, 15, None, 8, seed=3)
    num(F, 'x8', 40, 47, '#fff4e0', sc=2)
    frames.append(final(F))
    for fl in (14, 9, 4):
        frames.append(ground(fl))
    frames.append(ground(4, red=.35, glw=('#f03c3c', 60, 20)))
    frames.append(ground(4, red=.7, glw=('#f03c3c', 110, 24)))
    frames.append(ground(None, white=.93, X=Xf(cx, gy, 0, sx=1.35, sy=1.35), glw=('#ffffff', 150, 30),
                         shadow=shadow_layer(cx, 17, 3.5, 100, 64, 64, gy)))
    F = Frame(64, 64)
    tip = bomb(F, cx, cy, r, Xf(cx, gy, 0, sx=1.3, sy=.74), 9)
    sparks(F, tip[0], tip[1], 5, n=6, rad=6)
    dust(F, cx - 18, gy - 1, 3)
    dust(F, cx + 16, gy - 1, 3)
    frames.append(final(F, shadow_layer(cx, 17, 3, 100, 64, 64, gy)))
    # erguida na mão (mão do herói por baixo, polegar à esquerda, dedos à direita)
    F = Frame(64, 64)
    SK, SK2, SKL, SKO = '#b07a52', '#8a5a3a', '#d09a70', '#3a2014'
    F.part(poly((25, 64), (40, 64), (39, 54), (26, 54)), '#c8323a',
           marks=[(poly((24, 54), (41, 54), (41, 57), (24, 57)), '#a8262c'), (vstrip(35, 41, 54, 64), '#a8262c')], tex=.15, ol='#3a0a10')
    F.part(limb(32, 55, 32, 47, 9, 11), SK, marks=[(vstrip(34, 40, 40, 60), SK2)], ol=SKO)
    tip = bomb(F, 31, 33, 12, None, 9)
    F.part(limb(23, 46, 20, 38, 4.2, 3.4), SK, marks=[(ell(20, 38, 1.2, 1.2), SKL)], ol=SKO)   # polegar
    for (x0, y0, x1, y1) in [(39, 47, 43, 40), (37, 49, 42, 44)]:
        F.part(limb(x0, y0, x1, y1, 3.6, 3), SK, marks=[(ell(x1 - .5, y1, 1, 1), SKL), (ell(x0, y0 + 1, 2, 1), SK2)], ol=SKO)
    F.part(ell(31, 46.5, 8, 3.2), SK, marks=[(ell(28, 45.5, 3, 1.2), SKL), (ell(35, 47.5, 3, 1.5), SK2)], ol=SKO)
    sparks(F, tip[0], tip[1], 9, n=7, rad=6)
    glow(F, tip[0], tip[1], 6, '#ffd84a', 120)
    frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'bmb_bomba.png'))


def gen_hud():
    frames = []
    for n, c in [(8, '#f2c230'), (3, '#fff4e0'), (0, '#c8323a')]:
        F = Frame(64, 64)
        F.part(ell(30, 30, 25, 25), '#1c1822', marks=[(ell(26, 24, 18, 15), '#231e2b')], ol='#0a080e', light=.1)
        yy, xx = grid_xy(64, 64)
        d = np.sqrt((xx - 30) ** 2 + (yy - 30) ** 2)
        rim = (d > 22.5) & (d <= 25)
        F.a[rim, :3] = col('#3c3446')
        F.a[rim & (yy < 22) & (xx < 34), :3] = col('#5a4e66')
        if n >= 3:
            bomb(F, 21, 38, 9, None, None, mini=True, seed=4)
            bomb(F, 38, 38, 9, None, None, mini=True, seed=5)
        if n >= 8:
            tip = bomb(F, 29, 24, 9, None, 6, mini=True, seed=6)
            sparks(F, tip[0], tip[1], 2, n=5, rad=5)
        elif n == 3:
            pass
        if n == 0:
            ring = (np.abs(np.sqrt((xx - 29) ** 2 + (yy - 34) ** 2) - 10) < .8) & ((np.arctan2(yy - 34, xx - 29) * 5).astype(int) % 2 == 0)
            F.a[ring, :3] = col('#4a4458')
            F.a[ring, 3] = 255
            F.line(25, 23, 29, 23, '#4a4458')
            F.line(29, 23, 31, 19, '#4a4458')
        num(F, str(n), 46, 44, c, sc=3)
        frames.append(final(F))
    strip(frames).save(os.path.join(OUT, 'bmb_hud.png'))


# ================================================================ MURO RACHADO 128x160

WX0, WX1, WTOP, WFT, WGY = 4, 124, 34, 48, 148


def wall_stone(F, seed=1):
    F.part(poly((WX0, WTOP), (WX1, WTOP), (WX1, WGY), (WX0, WGY)), '#a8a090', shade=False, ol='#24221f')
    r = random.Random(seed)
    # topo (visto de cima): blocos de coroamento
    for i in range(5):
        x = WX0 + 1 + i * 24
        F.part(poly((x + 1, WTOP + 1), (x + 22, WTOP + 1), (x + 22, WFT - 2), (x + 1, WFT - 2)), r.choice(['#a8a49c', '#9e9a92']),
               marks=[(ell(x + 6 + r.uniform(0, 10), WTOP + 6, 3, 1.5), '#8e8a84')], tex=.2, light=.3, ol='#3a3834')
    y = WFT
    row = 0
    while y < WGY - 1:
        off = 0 if row % 2 == 0 else -12
        x = WX0 + off
        while x < WX1:
            x0, x1 = max(WX0 + 1, x + 1), min(WX1 - 1, x + 23)
            if x1 - x0 > 3:
                cc = r.choice(['#8e8a84', '#77736e', '#85817b', '#8e8a84'])
                mk = [(ell(r.uniform(x0, x1), y + r.uniform(3, 10), r.uniform(1, 2.5), 1), '#6a6662'),
                      (poly((x0, y + 10), (x1, y + 10), (x1, y + 14), (x0, y + 14)), mix(hexc(cc), NIGHT, .18))]
                if y > WGY - 30:
                    mk.append((wob(r.uniform(x0, x1), y + 11, r.uniform(3, 6), 2.5, int(x * 7 + y), .4), '#5f7a4a'))
                if r.random() < .25:
                    mk.append((wob(r.uniform(x0, x1), y + 5, 4, 3, int(x + y * 3), .3), '#6a665e'))
                F.part(poly((x0, y + 1), (x1, y + 1), (x1, y + 12), (x0, y + 12)), cc, marks=mk, tex=.22, light=.2, ol='#3a3834')
            x += 24
        y += 14
        row += 1


def wall_brick(F, seed=2):
    F.part(poly((WX0, WTOP), (WX1, WTOP), (WX1, WGY), (WX0, WGY)), '#c9b8a0', shade=False, ol='#24221f')
    r = random.Random(seed)
    F.part(poly((WX0 + 1, WTOP + 1), (WX1 - 1, WTOP + 1), (WX1 - 1, WFT - 1), (WX0 + 1, WFT - 1)), '#b8a890',
           marks=[(poly((WX0, WFT - 4), (WX1, WFT - 4), (WX1, WFT), (WX0, WFT)), '#9a8a74')], tex=.25, light=.3, ol='#3a3028')
    y = WFT
    row = 0
    while y < WGY - 1:
        off = 0 if row % 2 == 0 else -8
        x = WX0 + off
        while x < WX1:
            x0, x1 = max(WX0 + 1, x + 1), min(WX1 - 1, x + 15)
            if x1 - x0 > 2:
                cc = r.choice(['#a5432e', '#86351f', '#9a3c28', '#a5432e', '#b04e36'])
                F.part(poly((x0, y + 1), (x1, y + 1), (x1, y + 6.5), (x0, y + 6.5)), cc,
                       marks=[(ell(r.uniform(x0, x1), y + 4, 1.2, .8), '#6a2a1a')], tex=.25, light=.2, ol='#4a2014')
            x += 16
        y += 8
        row += 1
    # reboco que restou (placas)
    for (px, py, rx, ry, s) in [(20, 64, 16, 12, 1), (104, 70, 18, 16, 2), (30, 124, 14, 8, 3), (106, 134, 14, 9, 4)]:
        F.flat(mv(wob(px, py, rx, ry, s, .3), 1, 2), '#5a2014')
        F.part(wob(px, py, rx, ry, s, .3), '#c8bca8', marks=[(wob(px + 3, py + 4, rx * .6, ry * .4, s + 9, .3), '#b0a490'),
                                                             (ell(px - rx * .4, py - ry * .3, 2, 1), '#9a8e7c')], tex=.3, outline=False, light=.3)


def wall_concrete(F, seed=3):
    F.part(poly((WX0, WTOP), (WX1, WTOP), (WX1, WGY), (WX0, WGY)), '#5a5854', shade=False, ol='#24221f')
    F.part(poly((WX0 + 1, WTOP + 1), (WX1 - 1, WTOP + 1), (WX1 - 1, WFT - 1), (WX0 + 1, WFT - 1)), '#a29f98',
           marks=[(ell(40, 40, 6, 2), '#8f8c86'), (ell(90, 42, 9, 2), '#8f8c86')], tex=.25, light=.3, ol='#3a3834')
    r = random.Random(seed)
    for i in range(3):
        x0, x1 = WX0 + 1 + i * 40, WX0 + (i + 1) * 40 - 1
        for j in range(2):
            y0, y1 = WFT + 1 + j * 50, min(WGY - 1, WFT + (j + 1) * 50 - 1)
            mk = [(poly((x0, y1 - 6), (x1, y1 - 6), (x1, y1), (x0, y1)), '#6e6b66'),
                  (wob(r.uniform(x0, x1), r.uniform(y0, y1), 8, 10, i * 3 + j, .4), '#7a7772'),
                  (poly((x0 + 8, y0), (x0 + 11, y0), (x0 + 10, y1), (x0 + 9, y1)), '#84817b')]
            F.part(poly((x0, y0), (x1, y0), (x1, y1), (x0, y1)), '#8f8c86', marks=mk, tex=.3, light=.2, ol='#3a3834')
            for (hx, hy) in [(x0 + 8, y0 + 8), (x1 - 8, y0 + 8), (x0 + 8, y1 - 10), (x1 - 8, y1 - 10)]:
                F.flat(ell(hx, hy, 1.6, 1.6), '#3a3834')
                F.px(hx - 1, hy - 1, '#5a5854')
    # pichação
    F.part(ell(28, 78, 13, 13), '#c8323a', marks=[(ell(33, 75, 10, 11), '#8f8c86'), (ell(24, 73, 3, 3), '#e04048')], shade=False, ol='#5a0e14')
    for x in (20, 25, 31):
        F.part(poly((x, 88), (x + 1.5, 88), (x + 1.2, 88 + r.uniform(6, 12)), (x + .3, 88 + r.uniform(6, 12))), '#c8323a', shade=False, outline=False)
    tag = [(52, 70), (56, 62), (60, 74), (64, 60), (66, 72), (72, 64), (76, 72), (82, 60), (84, 74), (92, 66), (104, 62)]
    F.part(chain(tag, 2.6), '#fff4e0', shade=False, ol='#1a1416')
    F.part(chain([(54, 80), (70, 82), (90, 79), (106, 82)], 1.6), '#1a1416', shade=False, outline=False)
    F.part(poly((86, 104), (104, 104), (104, 100), (114, 108), (104, 116), (104, 112), (86, 112)), '#f2c230', shade=False, ol='#5a4008')
    text(F, 'ZUMBI', 52, 88, col='#1a1416', sc=2, ol='#8f8c86', layer=F.a)
    F.part(chain([(12, 132), (20, 126), (30, 134), (40, 126)], 2), '#3f6a8c', shade=False, ol='#14202a')


ZCRACK = [(0, -1, 30), (-.5, -.2, 26), (.3, .5, 24), (.9, .2, 30), (2.2, .4, 26), (3.0, -.3, 22), (4.2, .2, 28)]


def crack(F, cx, cy, seed, stage=0, layer=None):
    """rachadura estilo Zelda: braços em zigue-zague, preto com borda clara."""
    L = F.a if layer is None else layer
    r = random.Random(seed)
    arms = []
    for i, (a0, _, ln) in enumerate(ZCRACK[:5 + stage]):
        a = -math.pi / 2 + a0 * 1.25 + r.uniform(-.15, .15)
        pts = crack_path(cx, cy, a, ln * (1.25 + .25 * stage), seed * 7 + i, step=(5, 8), jit=40)
        arms.append(pts)
        if stage >= 1:
            mx, my = pts[len(pts) // 2]
            arms.append(crack_path(mx, my, a + r.choice([-1, 1]) * .9, 10 + 4 * stage, seed * 11 + i, step=(3, 5), jit=30))
    w = 3 if stage == 0 else 3
    for pts in arms:
        sh = chain(pts, w + stage * .8, 1.2)
        F.flat(mv(sh, 1, 1), '#d4cdbf', layer=L)
    for pts in arms:
        F.flat(chain(pts, w + stage * .8, 1.2), '#120c10', layer=L)
        F.flat(chain(pts[:max(2, len(pts) // 2)], 1.4 + stage * .5, .8), '#000000', layer=L)
    # centro estourado
    F.flat(wob(cx, cy, 5 + stage * 2, 4 + stage * 1.5, seed, .35), '#120c10', layer=L)
    F.flat(ell(cx + 1, cy + 1, 2, 1.5), '#000000', layer=L)


def hole(F, cx, seed):
    r = random.Random(seed)
    pts = []
    n = 22
    for i in range(n + 1):
        a = math.pi + math.pi * i / n
        rx, ry = 34, 74
        j = r.uniform(-4, 4) if 0 < i < n else 0
        pts.append((cx + (rx + j) * math.cos(a), WGY + (ry + j) * math.sin(a)))
    pts += [(cx + 34, WGY), (cx - 34, WGY)]
    F.part([pts], '#2a2230', shade=False, ol='#0a080c')
    inner = [(cx + (x - cx) * .82, WGY + (y - WGY) * .86) for x, y in pts]
    F.flat([inner], '#1c1622')
    inner2 = [(cx + (x - cx) * .62 + 2, WGY + (y - WGY) * .7) for x, y in pts]
    F.flat([inner2], '#0e0a10')
    m = F.mask([inner])
    dither_edge(F.a, F.mask([inner2]), '#0e0a10', clip=m)
    # chão da passagem e uma luz vermelha distante
    F.flat(poly((cx - 26, WGY - 6), (cx + 26, WGY - 6), (cx + 30, WGY), (cx - 30, WGY)), '#2a2230')
    F.flat(poly((cx - 14, WGY - 6), (cx + 14, WGY - 6), (cx + 18, WGY - 2), (cx - 18, WGY - 2)), '#3a2e3e')
    for (x0, x1, y) in [(cx - 10, cx + 12, WGY - 12), (cx - 6, cx + 8, WGY - 20)]:
        F.line(x0, y, x1, y, '#1c1622')
    for (x, y) in [(cx - 8, WGY - 40), (cx + 9, WGY - 52), (cx - 2, WGY - 30)]:
        F.line(x, y, x + 6, y, '#2a2230')


def rubble(F, cx, kind, seed):
    r = random.Random(seed)
    cols = {'pedra': ['#8e8a84', '#77736e', '#85817b'], 'tijolo': ['#a5432e', '#86351f', '#b04e36'],
            'concreto': ['#8f8c86', '#7a7772', '#a29f98']}[kind]
    for i in range(9):
        x = cx + r.uniform(-40, 40)
        y = WGY + r.uniform(-4, 8)
        w = r.uniform(8, 16) if kind != 'tijolo' else r.uniform(8, 12)
        h = r.uniform(5, 8) if kind != 'tijolo' else 4.5
        sh = rot(poly((x - w / 2, y - h), (x + w / 2, y - h), (x + w / 2 + 1, y), (x - w / 2, y + 1)), x, y, r.uniform(-25, 25))
        F.part(sh, r.choice(cols), marks=[(ell(x - w * .2, y - h * .6, w * .3, h * .2), '#c9c2b4' if kind != 'tijolo' else '#c46a50')],
               tex=.25, light=.3, ol='#24201c')
    for i in range(14):
        F.px(cx + r.uniform(-46, 46), WGY + r.uniform(-1, 9), r.choice(cols + ['#5a5652']))
    for i in range(3):
        dust(F, cx + r.uniform(-36, 36), WGY + r.uniform(-2, 4), r.uniform(3, 5))


def rebar(F, cx):
    for (x0, y0, x1, y1) in [(cx - 30, 100, cx - 18, 92), (cx + 30, 96, cx + 16, 104), (cx - 26, 120, cx - 12, 126), (cx + 28, 124, cx + 20, 116)]:
        F.part(limb(x0, y0, x1, y1, 2), '#8a4e2e', marks=[(ell(x1, y1, 1, 1), '#6a3a22')], ol='#1e120a')


def gen_parede():
    frames = []
    sh = shadow_layer(64, 66, 5, 90, 128, 160, WGY)
    cx, cy = 62, 104

    def wall(kind, F):
        {'pedra': wall_stone, 'tijolo': wall_brick, 'concreto': wall_concrete}[kind](F)

    for stage in range(3):
        F = Frame(128, 160)
        wall('pedra', F)
        crack(F, cx, cy, 5, stage)
        if stage >= 1:
            r = random.Random(stage)
            for i in range(3 + stage * 2):
                dust(F, cx + r.uniform(-30, 30), cy + r.uniform(-30, 30), r.uniform(3, 5 + stage))
            for i in range(4 * stage):
                x, y = cx + r.uniform(-28, 28), cy + r.uniform(0, 44)
                F.part(ell(x, y, 1.6, 1.3), '#8e8a84', ol='#24221f', layer=F.fx)
        frames.append(final(F, sh))
    for kind in ('pedra', 'tijolo', 'concreto'):
        if kind != 'pedra':
            F = Frame(128, 160)
            wall(kind, F)
            crack(F, cx, cy, 7 if kind == 'tijolo' else 9, 0)
            frames.append(final(F, sh))
        F = Frame(128, 160)
        wall(kind, F)
        hole(F, cx + 2, 11)
        if kind == 'concreto':
            rebar(F, cx + 2)
        rubble(F, cx + 2, kind, 13)
        frames.append(final(F, sh))
    # ordem: pedra rachado, rachando1, rachando2, pedra aberto, tijolo rachado, tijolo aberto, concreto rachado, concreto aberto
    strip(frames).save(os.path.join(OUT, 'bmb_parede.png'))


# ================================================================ CAIXOTE 128

CX0, CX1, CTOP, CFT, CGY = 32, 96, 50, 68, 110
WOOD = ['#9a6a3c', '#8f6236', '#a0703f']


def plank(F, cx, cy, ln, th, deg, c, seed, nails=True, broken=(False, False), layer=None):
    r = random.Random(seed)
    hl, ht = ln / 2, th / 2
    pts = [(cx - hl, cy - ht), (cx + hl, cy - ht)]
    if broken[1]:
        pts += [(cx + hl + 3, cy - ht + th * .3), (cx + hl - 1, cy), (cx + hl + 2, cy + ht * .5)]
    pts += [(cx + hl, cy + ht), (cx - hl, cy + ht)]
    if broken[0]:
        pts += [(cx - hl - 3, cy + ht * .3), (cx - hl + 1, cy - ht * .2), (cx - hl - 2, cy - ht * .6)]
    mk = [(poly((cx - hl - 4, cy + ht - 2), (cx + hl + 4, cy + ht - 2), (cx + hl + 4, cy + ht + 1), (cx - hl - 4, cy + ht + 1)), '#7d5430'),
          (limb(cx - hl + r.uniform(2, 8), cy - ht * .3, cx + r.uniform(0, hl), cy - ht * .2, .7), '#5a3a22'),
          (limb(cx - r.uniform(0, hl), cy + ht * .25, cx + hl - r.uniform(2, 8), cy + ht * .3, .7), '#6a4628'),
          (wob(cx + r.uniform(-hl * .6, hl * .6), cy, r.uniform(3, 6), th * .3, seed, .4), '#7d5430')]
    F.part(rot([pts], cx, cy, deg), c, marks=[(rot(s, cx, cy, deg), cc) for s, cc in mk], tex=.25, light=.22, ol='#2a1a0e', layer=layer)
    if nails:
        for sx in (-hl + 3, hl - 3):
            p = rp_(cx + sx, cy, cx, cy, deg)
            F.px(p[0], p[1], '#c9c3b0', layer)
            F.px(p[0] + 1, p[1] + 1, '#5a3a22', layer)


def rp_(x, y, cx, cy, deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    x, y = x - cx, y - cy
    return (cx + x * c - y * s, cy + x * s + y * c)


def crate(F, dmg=0):
    r = random.Random(3)
    # caixa de fundo (frestas escuras)
    F.part(poly((CX0, CTOP), (CX1, CTOP), (CX1, CGY), (CX0, CGY)), '#3a2414', shade=False, ol='#1a0e06')
    # topo: ripas
    for i in range(3):
        y = CTOP + 1 + i * 5.8
        plank(F, 64, y + 2.4, CX1 - CX0 - 2, 4.8, 0, r.choice(['#a8784a', '#b08050']), 10 + i, nails=True)
    # frente: 4 ripas
    for i in range(4):
        y = CFT + 1 + i * 10.4
        br = (False, False)
        if dmg and i == 1:
            continue
        plank(F, 64, y + 4.8, CX1 - CX0 - 2, 9.6, 0, WOOD[i % 3], 20 + i, nails=True)
    if dmg:  # ripa partida e torta
        plank(F, 50, CFT + 1 + 10.4 + 5, 30, 9.6, 6, WOOD[1], 30, broken=(False, True))
        plank(F, 83, CFT + 1 + 10.4 + 6, 22, 9.6, -9, WOOD[1], 31, broken=(True, False))
    # estêncil
    st = [(poly((40, 82), (45, 75), (50, 82), (47, 82), (47, 90), (43, 90), (43, 82)), '#a8402e')]
    for (x0) in (68, 73, 78, 83):
        st.append((poly((x0, 78), (x0 + 3.4, 78), (x0 + 3.4, 86), (x0, 86)), '#a8402e'))
    st.append((poly((68, 88), (86, 88), (86, 90), (68, 90)), '#a8402e'))
    for s, c in st:
        F.flat(s, c, clip=F.solid() & (F.a[..., 0] > 100))
    # travessa diagonal
    F.part(limb(CX0 + 5, CGY - 4, CX1 - 5, CFT + 4, 6), '#7d5430',
           marks=[(limb(CX0 + 5, CGY - 5.5, CX1 - 5, CFT + 2.5, 1.5), '#a0703f'), (ell(64, 89, 3, 2), '#5a3a22')], tex=.25, ol='#2a1a0e')
    if dmg:
        draw_poly_line(F, crack_path(60, 80, -.4, 18, 4, step=(3, 5)), '#120a06', w=2)
        draw_poly_line(F, crack_path(44, 102, .3, 14, 5, step=(3, 5)), '#120a06', w=2)
        draw_poly_line(F, crack_path(76, 58, .1, 14, 6, step=(3, 5)), '#120a06', w=1)
    # cantoneiras de metal
    for (x, flip) in [(CX0, 1), (CX1, -1)]:
        for (y0, y1) in [(CTOP - 1, CTOP + 10), (CGY - 12, CGY + 1)]:
            tilt = 4 if (dmg and x == CX1 and y0 > 80) else 0
            sh = poly((x - flip * 1, y0), (x + flip * 9, y0 + tilt), (x + flip * 9, y0 + 3 + tilt), (x + flip * 3, y0 + 3),
                      (x + flip * 3, y1), (x - flip * 1, y1))
            F.part(sh, '#7d848c', marks=[(ell(x + flip * 6, y0 + 1.5, 2, 1.5), '#8a4e2e')], light=.3, ol='#1e2226')
            F.px(x + flip * 1, y0 + 2, '#c9ced4')
            F.px(x + flip * 1, y1 - 2, '#c9ced4')
            F.px(x + flip * 6, y0 + 1.5, '#c9ced4')
        F.part(poly((x - flip * 1, CFT - 2), (x + flip * 3, CFT - 2), (x + flip * 3, CFT + 4), (x - flip * 1, CFT + 4)), '#7d848c', ol='#1e2226')
    # farpa levantada
    F.part(poly((86, CFT + 22), (93, CFT + 19), (90, CFT + 23)), '#b08050', ol='#2a1a0e')


def gen_caixa():
    frames = []
    sh = shadow_layer(66, 38, 5, 95, 128, 128, CGY + 1)
    F = Frame(128, 128)
    crate(F, 0)
    frames.append(final(F, sh))
    F = Frame(128, 128)
    crate(F, 1)
    for (x, y) in [(40, 114), (90, 115), (100, 112)]:
        F.part(poly((x, y), (x + 5, y - 1), (x + 4, y + 1)), '#9a6a3c', ol='#2a1a0e')
    frames.append(final(F, sh))
    # quebrando: tábuas voando
    F = Frame(128, 128)
    r = random.Random(7)
    impact(F, 64, 88, 12)
    spots = [(34, 70, -60), (50, 56, -20), (74, 52, 25), (94, 66, 70), (100, 92, -10), (28, 96, 15), (46, 104, -5),
             (82, 104, 8), (64, 72, 85), (60, 98, -35)]
    for i, (x, y, d) in enumerate(spots):
        plank(F, x, y, r.uniform(16, 26), r.uniform(6, 9), d + r.uniform(-10, 10), r.choice(WOOD), 50 + i,
              broken=(r.random() < .6, r.random() < .6))
    for (x, flip) in [(22, 1), (106, -1)]:
        F.part(rot(poly((x, 80), (x + flip * 9, 80), (x + flip * 9, 83), (x + flip * 3, 83), (x + flip * 3, 90), (x, 90)), x, 84, flip * 30),
               '#7d848c', marks=[(ell(x + flip * 5, 81, 2, 1.2), '#8a4e2e')], light=.3, ol='#1e2226')
    for i in range(18):
        a = r.uniform(-math.pi, .2)
        d = r.uniform(24, 56)
        x, y = 64 + d * math.cos(a), 88 + d * math.sin(a) * .9
        F.part(rot(poly((x - 3, y), (x + 3, y - 1), (x + 2, y + 1)), x, y, r.uniform(0, 180)), r.choice(['#b08050', '#c8a070']), ol='#2a1a0e')
    for i in range(24):
        F.px(64 + r.uniform(-44, 44), 112 + r.uniform(-4, 3), r.choice(['#c8a070', '#9a6a3c', '#e0c090']))
    frames.append(final(F, shadow_layer(64, 44, 5, 70, 128, 128, CGY + 1)))
    # quebrado: monte de tábuas
    F = Frame(128, 128)
    r = random.Random(11)
    lst = [(44, 106, 30, 8, 8), (82, 108, 28, 8, -12), (62, 100, 34, 9, -4), (56, 108, 26, 8, 22), (78, 98, 24, 8, 30),
           (50, 96, 22, 7, -28), (70, 110, 30, 8, 3), (90, 102, 18, 7, 60), (38, 100, 16, 7, -60)]
    for i, (x, y, l, t, d) in enumerate(lst):
        plank(F, x, y, l, t, d, r.choice(WOOD), 80 + i, broken=(i % 2 == 0, i % 3 == 0))
    for (x, y, flip) in [(30, 108, 1), (96, 110, -1)]:
        F.part(poly((x, y), (x + flip * 9, y - 2), (x + flip * 9, y + 1), (x + flip * 3, y + 1), (x + flip * 2, y + 5), (x - flip * 1, y + 5)),
               '#7d848c', marks=[(ell(x + flip * 5, y, 2, 1.2), '#8a4e2e')], light=.3, ol='#1e2226')
    for i in range(30):
        F.px(64 + r.uniform(-40, 40), 112 + r.uniform(-3, 4), r.choice(['#c8a070', '#9a6a3c', '#e0c090']))
    frames.append(final(F, shadow_layer(64, 44, 5, 90, 128, 128, CGY + 1)))
    strip(frames).save(os.path.join(OUT, 'exp_caixa_quebra.png'))


# ================================================================

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1:]
    jobs = [('barril', gen_barril), ('explosao', gen_explosao), ('destrocos', gen_destrocos), ('fumaca', gen_fumaca),
            ('marca', gen_marca), ('perigo', gen_perigo), ('bomba', gen_bomba), ('hud', gen_hud), ('parede', gen_parede),
            ('caixa', gen_caixa)]
    for name, fn in jobs:
        if not which or name in which:
            fn()
            print('ok', name)
