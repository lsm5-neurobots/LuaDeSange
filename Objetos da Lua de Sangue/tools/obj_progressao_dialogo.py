"""Objetos — grupo progressao_dialogo (XP, recompensas e diálogo).

Gera em ../sprites/: ui_xp, ui_selo_nivel, ui_carta, ui_levelup_fx, dlg_caixa, dlg_extras,
dlg_retrato, dlg_balao, ui_recrutar, ui_resumo.
Roda sozinho:  python obj_progressao_dialogo.py   (de dentro de tools/)
Texto NÃO vai no sprite: só deixamos os espaços (ver docs/progressao_dialogo.json).
"""
import os
import sys
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'sprites')
PREV = '--prev' in sys.argv

# ---------------------------------------------------------------- paleta
WOOD, WOOD_D, WOOD_L, WOOD_DD = '#7d5430', '#5a3a22', '#9a6a3c', '#3e2716'
METAL, METAL_D, RIVET = '#7d848c', '#4a4f58', '#c9ced4'
RUST = '#8a4e2e'
PANEL = '#231a22'
RED, RED_L, RED_D = '#c8323a', '#ff5a5a', '#7a1a22'
GOLD, GOLD_D, GOLD_L, GOLD_W = '#f2c230', '#b8861a', '#ffe58a', '#fff2b0'
BLOOD, BLOOD_L = '#5a1418', '#7a1e22'
AMBER, GREEN, GRAY, BLUE = '#e0902a', '#4fb06a', '#9a98a0', '#4a8fe0'


def col(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def R(x0, y0, x1, y1):
    """retângulo inclusivo em pixels."""
    return [[(x0 + .5, y0 + .5), (x1 + .5, y0 + .5), (x1 + .5, y1 + .5), (x0 + .5, y1 + .5)]]


def RC(x0, y0, x1, y1, c=2):
    """retângulo com cantos chanfrados."""
    x0, y0, x1, y1 = x0 + .5, y0 + .5, x1 + .5, y1 + .5
    return [[(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c), (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c)]]


def grid_xy(F):
    return np.mgrid[0:F.h, 0:F.w]


def setm(F, m, c, layer=None):
    L = F.a if layer is None else layer
    L[m, :3] = col(c)
    L[m, 3] = 255


def tint(F, m, c, t, layer=None):
    """mistura a cor c nos pixels já pintados dentro de m."""
    L = F.a if layer is None else layer
    m = m & (L[..., 3] > 0)
    L[m, :3] = np.clip(mix(L[m, :3].astype(float), col(c), t), 0, 255)


def P(F, x, y, c, layer=None, m=None):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < F.w and 0 <= y < F.h and (m is None or m[y, x]):
        F.px(x, y, c, layer)


def hline(F, x0, x1, y, c, m=None, layer=None):
    for x in range(int(x0), int(x1) + 1):
        P(F, x, y, c, layer, m)


def vline(F, x, y0, y1, c, m=None, layer=None):
    for y in range(int(y0), int(y1) + 1):
        P(F, x, y, c, layer, m)


def lin(F, a, b, c, m=None, layer=None):
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    for k in range(n + 1):
        t = k / max(1, n)
        P(F, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, c, layer, m)


def rivet(F, x, y, big=False):
    x, y = int(x), int(y)
    P(F, x + 1, y + 1, '#2a2a30'); P(F, x + 2, y + 1, '#2a2a30'); P(F, x + 1, y + 2, '#2a2a30')
    P(F, x, y, '#f0f2f4'); P(F, x + 1, y, RIVET); P(F, x, y + 1, '#a0a6ae'); P(F, x + 1, y + 1, '#6b7078')
    if big:
        P(F, x - 1, y, '#a0a6ae'); P(F, x, y - 1, '#e0e4e8')


def nail(F, x, y):
    P(F, x, y, '#d8d2c0'); P(F, x + 1, y, '#9a948a'); P(F, x, y + 1, '#8a847a'); P(F, x + 1, y + 1, '#3a3028')


def recess(F, shapes, c, tex=.12, depth=2):
    """painel afundado: sombra em cima/esquerda, luz fraca embaixo/direita."""
    m = F.part(shapes, c, shade=False, tex=tex, ol='#0c080c')
    C = F.a[..., :3].astype(float)
    for d in range(depth):
        e = m & ~shift(m, d + 1, d + 1)
        C[e] = C[e] * (.62 + .12 * d)
    e = m & ~shift(m, -1, -1)
    C[e] = mix(C[e], col('#6a5a70'), .35)
    F.a[m, :3] = np.clip(C[m], 0, 255)
    return m


def grain(F, m, rng, n, dark=WOOD_D, light=WOOD_L, horiz=True, lmax=18):
    """veios de madeira dentro da máscara m."""
    ys, xs = np.nonzero(m)
    if not len(ys):
        return
    for _ in range(n):
        i = rng.randint(len(ys))
        x, y = xs[i], ys[i]
        L = rng.randint(3, lmax)
        c = dark if rng.rand() < .65 else light
        for k in range(L):
            xx, yy = (x + k, y) if horiz else (x, y + k)
            if rng.rand() < .12:
                yy += 1 if horiz else 0
                xx += 0 if horiz else 1
            P(F, xx, yy, c, m=m)


def blood(F, cx, cy, r, rng, clip=None, t=.78, drops=6):
    """mancha de sangue seco + respingos (só sobre pixels pintados)."""
    sh = ell(cx, cy, r, r * .7, rot=rng.randint(0, 180))
    for _ in range(3):
        sh += ell(cx + rng.uniform(-r, r) * .8, cy + rng.uniform(-r, r) * .5, r * rng.uniform(.3, .6), r * rng.uniform(.25, .5))
    m = F.mask(sh)
    if clip is not None:
        m &= clip
    tint(F, m, BLOOD, t)
    core = F.mask(ell(cx, cy, r * .45, r * .3)) & m
    tint(F, core, '#3a0a0e', .45)
    for _ in range(drops):
        a = rng.uniform(0, 2 * math.pi)
        d = r * rng.uniform(1.1, 2.2)
        x, y = int(cx + d * math.cos(a)), int(cy + d * math.sin(a) * .7)
        if 0 <= x < F.w and 0 <= y < F.h and F.a[y, x, 3] and (clip is None or clip[y, x]):
            tint(F, F.mask(ell(x, y, rng.uniform(.6, 1.4), rng.uniform(.6, 1.2))) & (clip if clip is not None else True), BLOOD, t)


def rust(F, cx, cy, r, rng, clip):
    m = F.mask(ell(cx, cy, r, r * .8)) & clip
    tint(F, m, RUST, .55)
    for _ in range(int(r * 2)):
        P(F, cx + rng.uniform(-r, r), cy + rng.uniform(-r, r), '#a8602e', m=clip)


def scratch(F, x, y, L, ang, clip, c='#b08858'):
    a = math.radians(ang)
    lin(F, (x, y), (x + L * math.cos(a), y + L * math.sin(a)), c, m=clip)
    lin(F, (x + 1, y + 1), (x + 1 + L * .7 * math.cos(a), y + 1 + L * .7 * math.sin(a)), '#3e2716', m=clip)


def bracket(F, x, y, sx, sy, s=14, w=5, gem=None):
    """cantoneira de metal em L no canto (x,y), braços para dentro (sx,sy = ±1)."""
    def pt(u, v):
        return (x + u * sx + (.5 if sx > 0 else .5), y + v * sy + .5)
    shp = [[pt(0, 0), pt(s, 0), pt(s, w), pt(w, w), pt(w, s), pt(0, s)]]
    F.part(shp, METAL, tex=.2)
    m = F.mask(shp)
    tint(F, m & (np.mgrid[0:F.h, 0:F.w][0] % 3 == 0) & (np.mgrid[0:F.h, 0:F.w][1] % 5 == 1), '#5a6068', .4)
    rivet(F, x + sx * 2 - (1 if sx < 0 else 0), y + sy * 2 - (1 if sy < 0 else 0))
    rivet(F, x + sx * (s - 3) - (1 if sx < 0 else 0), y + sy * 2 - (1 if sy < 0 else 0))
    rivet(F, x + sx * 2 - (1 if sx < 0 else 0), y + sy * (s - 3) - (1 if sy < 0 else 0))
    if gem:
        gx, gy = x + sx * 3.5, y + sy * 3.5
        if gem:
            F.part([[(gx, gy - 2.5), (gx + 2.5, gy), (gx, gy + 2.5), (gx - 2.5, gy)]], gem, light=.45, ol='#160c10')
            P(F, gx - .5, gy - 1, '#ffffff')
    return m


def wood_frame(F, x0, y0, x1, y1, t, acc, rng, inner=PANEL, gems=True, cs=18):
    """moldura de tábuas com filete de cor, painel afundado e cantoneiras."""
    out = RC(x0, y0, x1, y1, 2)
    mo = F.part(out, WOOD, tex=.3, light=.25)
    inn = R(x0 + t, y0 + t, x1 - t, y1 - t)
    border = mo & ~F.mask(R(x0 + t - 3, y0 + t - 3, x1 - t + 3, y1 - t + 3))
    grain(F, border, rng, int((x1 - x0 + y1 - y0) * .5))
    # emendas das tábuas
    x = x0 + rng.randint(30, 60)
    while x < x1 - 20:
        for yy in (y0 + 1, y1 - t + 2):
            vline(F, x, yy, yy + t - 4, WOOD_DD, m=border)
            vline(F, x + 1, yy, yy + t - 4, '#a87444', m=border)
            nail(F, x - 3, yy + (t - 4) // 2)
            nail(F, x + 3, yy + (t - 4) // 2)
        x += rng.randint(50, 90)
    y = y0 + rng.randint(22, 40)
    while y < y1 - 20:
        for xx in (x0 + 1, x1 - t + 2):
            hline(F, xx, xx + t - 4, y, WOOD_DD, m=border)
            hline(F, xx, xx + t - 4, y + 1, '#a87444', m=border)
        y += rng.randint(30, 60)
    # marcas de faca
    for _ in range(max(2, (x1 - x0) // 90)):
        scratch(F, rng.randint(x0 + 20, x1 - 20), y0 + rng.randint(1, max(2, t - 4)), rng.randint(4, 8), rng.choice([20, -25, 160]), border)
    F.part(R(x0 + t - 3, y0 + t - 3, x1 - t + 3, y1 - t + 3), acc, light=.4, dark=.35)
    pm = recess(F, inn, inner, tex=.14, depth=3)
    if gems:
        for (cx, cy, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
            bracket(F, cx, cy, sx, sy, s=cs, w=max(5, t - 2), gem=acc)
    return pm, border


def save(name, img):
    p = os.path.join(OUT, name + '.png')
    img.save(p)
    if PREV:
        k = 3 if img.size[0] <= 1200 else 2
        bg = Image.new('RGBA', img.size, (42, 34, 54, 255))
        bg.alpha_composite(img)
        bg.resize((img.size[0] * k, img.size[1] * k), Image.NEAREST).save(os.path.join(HERE, '_prev_' + name + '.png'))
    print('ok', name, img.size)


def bitmap(F, rows, x, y, sc, c, ol=None, shade=True, layer=None, light=.3):
    shp = []
    for j, row in enumerate(rows):
        for i, b in enumerate(row):
            if b == '1':
                X, Y = x + i * sc, y + j * sc
                shp += R(X, Y, X + sc - 1, Y + sc - 1)
    return F.part(shp, c, shade=shade, ol=ol, layer=layer, light=light)


# ================================================================ ui_xp

def xp_frame(p, pulse=False, flash=False):
    F = Frame(384, 40)
    rng = np.random.RandomState(11)
    # casco de madeira
    cas = F.part(RC(30, 7, 379, 32, 2), WOOD, tex=.3)
    rim = cas & ~F.mask(R(44, 11, 367, 28))
    grain(F, rim, rng, 140)
    for x in (110, 190, 270, 330):
        vline(F, x, 8, 11, WOOD_DD, m=rim); vline(F, x + 1, 8, 11, '#a87444', m=rim)
        vline(F, x + 9, 28, 31, WOOD_DD, m=rim); vline(F, x + 10, 28, 31, '#a87444', m=rim)
    for x in (70, 150, 230, 300):
        nail(F, x, 9); nail(F, x + 14, 29)
    for x, a in ((95, 160), (250, 20), (342, -20)):
        scratch(F, x, 8, 5, a, rim)
    blood(F, 318, 30, 3.2, rng, clip=rim, drops=4)
    # abraçadeiras de metal
    for x in (126, 206, 286):
        F.part(R(x, 5, x + 9, 11), METAL, tex=.2); rivet(F, x + 4, 7)
        F.part(R(x, 28, x + 9, 34), METAL, tex=.2); rivet(F, x + 4, 30)
    cap = F.part(RC(364, 5, 381, 34, 2), METAL, tex=.25)
    rivet(F, 368, 9); rivet(F, 376, 9); rivet(F, 368, 28); rivet(F, 376, 28)
    rust(F, 374, 19, 3, rng, cap)
    hline(F, 366, 379, 19, METAL_D, m=cap)
    # canaleta
    tr = recess(F, R(46, 13, 365, 26), '#1a1218', tex=.1, depth=2)
    yy, xx = grid_xy(F)
    tint(F, tr & ((xx + yy) % 8 == 0), '#2c2030', .8)
    # preenchimento
    wfill = int(round(320 * p))
    if wfill > 0:
        bands = {13: '#fff2b0', 14: '#ffe58a', 15: GOLD, 16: GOLD, 17: GOLD, 18: '#e6ae22', 19: '#e0aa22',
                 20: '#d9a020', 21: '#d09a1e', 22: GOLD_D, 23: GOLD_D, 24: '#a8781a', 25: '#8a6014', 26: '#5a3c0c'}
        x1 = 46 + wfill - 1
        for y, c in bands.items():
            hline(F, 46, x1, y, c)
        fm = (xx >= 46) & (xx <= x1) & (yy >= 13) & (yy <= 26)
        # brilho líquido diagonal
        tint(F, fm & (((xx - yy) % 18) < 3) & (yy > 14) & (yy < 24), '#fff6c8', .35)
        tint(F, fm & (((xx * 7 + yy * 13) % 29) == 0), '#fff6c8', .6)
        tint(F, fm & (((xx * 5 + yy * 11) % 37) == 0) & (yy > 18), '#7a5410', .5)
        for y in range(14, 26):
            P(F, x1, y, '#fff6c8'); P(F, x1 - 1, y, '#ffe58a')
        P(F, x1 + 1, 19, '#fff6c8')
        if pulse:
            tint(F, fm, '#ffffff', .28)
        if flash:
            setm(F, fm, '#fffbea')
            tint(F, fm & (yy >= 23), '#f2e2b0', .7)
            tint(F, fm & (yy <= 14), '#ffffff', 1)
    # marcas de 10%
    for k in range(1, 10):
        x = 46 + 32 * k
        for y in (13, 14, 25, 26):
            P(F, x, y, '#0c070a' if (y in (13, 26)) else '#3a2a30')
    # selo do nível
    teeth = []
    n = 12
    for i in range(n * 2):
        a = -math.pi / 2 + i * math.pi / n
        r = 18 if i % 2 == 0 else 15.5
        teeth.append((19 + r * math.cos(a), 20 + r * math.sin(a)))
    F.part([teeth], GOLD_D if not pulse else GOLD, tex=.1, light=.35)
    F.part(ell(19, 20, 14.2, 14.2), GOLD, light=.4)
    F.part(ell(19, 20, 12, 12), RED, tex=.15, light=.3)
    for a in range(0, 360, 90):
        rivet(F, 19 + 9.5 * math.cos(math.radians(a + 45)) - .5, 20 + 9.5 * math.sin(math.radians(a + 45)) - .5)
    recess(F, ell(19, 20, 7.8, 7.8), '#1e1418', tex=0, depth=2)
    if pulse or flash:
        L = F.layer()
        for (x, y) in ((6, 9), (33, 8), (30, 33)):
            sparkle(F, x, y, 2)
        glow(F, 19, 20, 24, '#ffe58a', 90, layer=L)
        if flash:
            glow(F, 200, 20, 180, '#fff6c8', 70, layer=L)
        F.a[:] = over(L, F.a)
    return compose(F)


def make_xp():
    fr = [xp_frame(0), xp_frame(.3), xp_frame(.6), xp_frame(.86), xp_frame(.86, pulse=True),
          xp_frame(1), xp_frame(1, flash=True)]
    # brilho por trás (não por cima): reordenar fx atrás do sprite nos quadros com glow
    save('ui_xp', strip(fr))


# ================================================================ ui_selo_nivel

TIERS = [
    dict(m='#b87333', d='#7a4a22', l='#e0a070', rib='#6a3a1e', rib2='#4a2614'),
    dict(m='#c0c4cc', d='#7a808c', l='#f0f4f8', rib='#3f6a8c', rib2='#2a4a66'),
    dict(m=GOLD, d=GOLD_D, l='#fff2b0', rib=RED, rib2=RED_D),
    dict(m=RED, d='#2e2836', l='#ff5a5a', rib='#5a1420', rib2='#3a0c14'),
    dict(m=GOLD, d='#2e2836', l='#fff6c8', rib='#1c1822', rib2='#0c0a10'),
]


def selo(t):
    T = TIERS[t]
    F = Frame(64, 64)
    rng = np.random.RandomState(40 + t)
    cx, cy = 32, 29
    if t >= 3:
        L = F.layer()
        glow(F, cx, cy, 34 if t == 4 else 28, '#ff5a5a' if t == 3 else '#ffd36a', 80 if t == 3 else 110, layer=L)
        F.a[:] = over(F.a, L)
    if t == 4:  # raios
        for i in range(12):
            a = i * math.pi / 6 + .26
            r0, r1 = 20, 32 if i % 2 else 29
            F.part([[(cx + r0 * math.cos(a - .1), cy + r0 * math.sin(a - .1)), (cx + r1 * math.cos(a), cy + r1 * math.sin(a)),
                     (cx + r0 * math.cos(a + .1), cy + r0 * math.sin(a + .1))]], '#ffe58a', shade=False, ol='#b8861a')
    # fitas
    for sx in (-1, 1):
        x = cx + sx * 8
        shp = [[(x - 4.5, 42), (x + 4.5, 42), (x + 4.5 + sx * 2, 60), (x + sx * 2, 56), (x - 4.5 + sx * 2, 60)]]
        F.part(rot(shp, x, 42, -sx * 10), T['rib'], tex=.15, light=.3)
        mm = F.mask(rot(shp, x, 42, -sx * 10))
        tint(F, mm & (np.mgrid[0:64, 0:64][1] == x + sx * 1), T['rib2'], .7)
        if t == 4:
            tint(F, mm & (abs(np.mgrid[0:64, 0:64][1] - x) == 3), GOLD, .9)
    # louros (ouro)
    if t == 2 or t == 4:
        for sx in (-1, 1):
            for k in range(5):
                a = math.radians(110 + k * 22) if sx < 0 else math.radians(70 - k * 22)
                lx, ly = cx + 24 * math.cos(a), cy + 22 * math.sin(a) + 4
                F.part(ell(lx, ly, 3.2, 1.6, rot=math.degrees(a) + 90 * sx), '#7a9a3a' if t == 2 else GOLD, light=.4)
    # coroa dentada
    n = 14
    pts = []
    for i in range(n * 2):
        a = -math.pi / 2 + i * math.pi / n
        r = 23 if i % 2 == 0 else 19.5
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    cm = F.part([pts], T['m'], tex=.15, light=.35)
    if t == 0:
        for _ in range(8):
            a = rng.uniform(0, 6.28)
            lin(F, (cx + 18 * math.cos(a), cy + 18 * math.sin(a)), (cx + 21 * math.cos(a + .1), cy + 21 * math.sin(a + .1)), T['d'], m=cm)
        tint(F, cm & F.mask(ell(cx + 12, cy + 12, 5, 4)), '#4a7a5a', .45)  # azinhavre
    # aro interno
    F.part(ell(cx, cy, 17.5, 17.5), T['d'], tex=.2, light=.3)
    rm = F.part(ell(cx, cy, 15.5, 15.5), T['m'] if t < 3 else T['d'], tex=.12, light=.35)
    if t >= 3:
        F.part(ell(cx, cy, 15.5, 15.5), '#3c3446', tex=.25)
        # filete
        yy, xx = np.mgrid[0:64, 0:64]
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        setm(F, (d > 14.2) & (d <= 15.2), T['m'])
    if t >= 1 and t != 4:
        for k in range(8):
            a = k * math.pi / 4 + math.pi / 8
            rivet(F, cx + 13.5 * math.cos(a) - .5, cy + 13.5 * math.sin(a) - .5)
    if t == 4:
        runes = [["101", "010", "101"], ["111", "010", "010"], ["110", "011", "010"], ["010", "111", "101"],
                 ["100", "111", "001"], ["011", "110", "011"]]
        for k in range(6):
            a = k * math.pi / 3 + math.pi / 6
            rx, ry = cx + 13 * math.cos(a) - 1.5, cy + 13 * math.sin(a) - 1.5
            for j, row in enumerate(runes[k]):
                for i, b in enumerate(row):
                    if b == '1':
                        P(F, rx + i, ry + j, '#ff5a5a')
            L = F.layer()
            glow(F, rx + 1, ry + 1, 4, '#ff5a5a', 120, layer=L)
            F.fx[:] = over(F.fx, L)
    recess(F, ell(cx, cy, 11, 11), '#1e1418', tex=0, depth=2)
    # brilho do metal
    for k in range(3):
        P(F, cx - 15 + k, cy - 14 + k * 0, T['l'])
    P(F, cx - 17, cy - 9, T['l']); P(F, cx - 18, cy - 7, T['l'])
    # enfeite de cima
    if t == 2:
        star(F, cx, 6, GOLD, 5)
        F.px(cx - 1, 4, '#ffffff', F.fx)
    if t >= 3:
        F.part(ell(cx, 7, 6, 6), T['m'] if t == 3 else GOLD, light=.4)
        F.flat(ell(cx + 3, 5, 5, 5), '#000000', alpha=0)
        F.a[F.mask(ell(cx + 3, 5.5, 4.6, 4.6)) & (F.a[..., 3] > 0) & (np.mgrid[0:64, 0:64][0] < 13)] = 0
        P(F, cx - 4, 5, '#ffffff')
    if t == 4:
        for (x, y) in ((8, 12), (55, 16), (52, 46)):
            sparkle(F, x, y, 2)
    return compose(F)


def make_selo():
    save('ui_selo_nivel', strip([selo(t) for t in range(5)]))


# ================================================================ ui_carta

def card_base(F, acc, back=False):
    rng = np.random.RandomState(7)
    yy, xx = np.mgrid[0:128, 0:96]
    # brilho dourado em volta
    L = F.layer()
    glow(F, 48, 64, 70, '#ffd36a', 40, layer=L)
    L[F.mask(RC(2, 2, 93, 125, 4)) == 0] = 0
    F.a[:] = over(F.a, L)
    fm = F.part(RC(4, 4, 91, 123, 3), '#d9a020', tex=.12, light=.4)
    # gravação no ouro
    rimm = fm & ~F.mask(R(8, 8, 87, 119))
    tint(F, rimm & ((xx + yy) % 4 == 0), GOLD_D, .5)
    hline(F, 8, 87, 5, '#fff2b0', m=rimm)
    vline(F, 5, 8, 119, '#ffe58a', m=rimm)
    F.part(RC(7, 7, 88, 120, 2), acc, light=.45)
    inner = RC(9, 9, 86, 118, 1)
    if back:
        bm = recess(F, inner, '#4a141c', tex=.15, depth=2)
        tint(F, bm & (((xx + yy) % 10 == 0) | ((xx - yy) % 10 == 0)), '#8a6a2a', .55)
        tint(F, bm & (((xx + yy) % 10 == 5) & ((xx - yy) % 10 == 5)), GOLD, .8)
        return bm
    recess(F, inner, '#1e1820', tex=.14, depth=2)
    # janela do ícone com halo
    wm = recess(F, RC(12, 12, 83, 69, 2), '#140e16', tex=.0, depth=2)
    d = np.sqrt(((xx - 48) / 1.1) ** 2 + (yy - 41) ** 2)
    for r, t in ((34, .18), (26, .3), (18, .42)):
        tint(F, wm & (d < r), acc, t)
    tint(F, wm & (((xx - 48) * 3 + (yy - 41) * 7) % 23 == 0) & (d < 30), '#ffe58a', .5)
    # fita do título
    for sx in (-1, 1):
        x = 48 + sx * 41
        F.part([[(x, 75), (x + sx * 4, 75), (x + sx * 2, 79.5), (x + sx * 4, 84), (x, 84)]], mix(col(acc), col('#000000'), .45), light=.2)
    tm = F.part(R(9, 73, 86, 85), acc, tex=.15, light=.4)
    hline(F, 10, 85, 74, '#ffffff', m=tm)
    tint(F, tm & (yy == 74), acc, .5)
    tint(F, tm & (yy >= 83), '#000000', .25)
    # painel de valor
    recess(F, RC(14, 90, 81, 115, 2), '#120c12', tex=.1, depth=2)
    rivet(F, 16, 101); rivet(F, 78, 101)
    # cantoneiras
    for (cx, cy, sx, sy) in ((4, 4, 1, 1), (91, 4, -1, 1), (4, 123, 1, -1), (91, 123, -1, -1)):
        bracket(F, cx, cy, sx, sy, s=11, w=4)
    return wm


def card_glow(F, seed):
    rng = np.random.RandomState(seed)
    m = F.mask(RC(3, 3, 92, 124, 4)) & ~F.mask(RC(4, 4, 91, 123, 3))
    ys, xs = np.nonzero(m)
    for _ in range(26):
        i = rng.randint(len(ys))
        F.px(xs[i], ys[i], '#fff6c8', F.fx, alpha=220)
    sparkle(F, 7, 7, 3); sparkle(F, 88, 120, 3); sparkle(F, 89, 9, 2)


def ic_heart(F):
    sh = ell(39, 35, 11, 10.5) + ell(57, 35, 11, 10.5) + poly((28.5, 39), (67.5, 39), (48, 62))
    m = F.part(sh, '#d8394a', tex=.1, light=.35)
    tint(F, m & F.mask(ell(36, 31, 5, 4)), '#ff9aa4', .7)
    F.px(33, 30, '#ffffff'); F.px(34, 29, '#ffffff'); F.px(35, 29, '#ffd0d8')
    # curativo em X
    for ang in (35, -35):
        b = rot(R(48, 38, 64, 43), 56, 46, ang)
        F.part(b, '#e8dcc0', light=.3)
        bm = F.mask(b)
        tint(F, bm & ((np.mgrid[0:128, 0:96][1] + np.mgrid[0:128, 0:96][0]) % 3 == 0), '#b0a080', .5)
    blood(F, 55, 47, 2.0, np.random.RandomState(3), clip=F.solid(), drops=0, t=.6)
    plus(F, 70, 20, '#6fdc7a', 2)


def ic_forca(F):
    # facão atrás
    blade = poly((30, 64), (34, 60), (70, 18), (74, 16), (73, 22), (37, 66))
    F.part(blade, '#c9ced4', tex=.08, light=.45)
    bm = F.mask(blade)
    lin(F, (36, 61), (71, 20), '#f0f2f4', m=bm)
    blood(F, 64, 28, 2.5, np.random.RandomState(5), clip=bm, drops=2)
    F.part(limb(24, 70, 32, 62, 6), '#5a3a22', tex=.3)
    # punho
    F.part(ell(48, 44, 15, 13), '#c08a5a', tex=.08, light=.3)
    for i in range(4):
        F.part(ell(38 + i * 7, 34, 4.2, 4.6), '#c8946a', light=.4)
    F.part(ell(36, 47, 6, 4.5, rot=-20), '#b07a4a', light=.3)  # polegar
    for i in range(3):
        lin(F, (41 + i * 7, 31), (41 + i * 7, 38), '#7a4a2a')
    # fita no pulso
    w = F.part(R(39, 54, 60, 63), '#e8dcc0', tex=.2, light=.3)
    for y in (56, 59, 62):
        hline(F, 39, 60, y, '#b0a080', m=w)
    blood(F, 56, 58, 2, np.random.RandomState(8), clip=w, drops=0)
    F.part(R(41, 64, 58, 70), '#8a3a2a', tex=.2)


def ic_escudo(F):
    sh = poly((26, 18), (48, 14), (70, 18), (70, 40), (63, 54), (48, 66), (33, 54), (26, 40))
    F.part(sh, METAL, tex=.15, light=.4)
    inn = poly((30, 22), (48, 18.5), (66, 22), (66, 40), (60, 51), (48, 61), (36, 51), (30, 40))
    m = F.part(inn, '#8a5e34', tex=.3, light=.3)
    for x in (37, 44, 51, 58):
        vline(F, x, 15, 64, '#4a2e1a', m=m)
        vline(F, x + 1, 15, 64, '#a8784a', m=m)
    grain(F, m, np.random.RandomState(9), 30, horiz=False, lmax=8)
    F.part(R(29, 32, 67, 36), METAL, tex=.1)
    for x in (31, 47, 63):
        rivet(F, x, 33)
    for (x, y) in ((29, 21), (66, 21), (47, 62)):
        rivet(F, x, y)
    # emblema lua
    F.part(ell(48, 45, 6.5, 6.5), RED, light=.45)
    F.a[F.mask(ell(51, 43, 5.2, 5.2)) & F.mask(ell(48, 45, 6.5, 6.5))] = col('#8a5e34').tolist() + [255]
    F.px(45, 42, '#ff9a9a')
    scratch(F, 55, 25, 6, 120, F.mask(inn), c='#c8a070')


def ic_xp(F):
    # setas subindo atrás
    for i, x in enumerate((30, 66)):
        F.part(poly((x - 5, 34), (x, 26), (x + 5, 34), (x + 2, 34), (x + 2, 44), (x - 2, 44), (x - 2, 34)), '#ffe58a', light=.3, ol=GOLD_D)
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        r = 20 if i % 2 == 0 else 9
        pts.append((48 + r * math.cos(a), 43 + r * math.sin(a)))
    F.part([pts], GOLD, tex=.05, light=.4)
    inner = [[(48 + (p[0] - 48) * .55, 43 + (p[1] - 43) * .55) for p in pts]]
    F.part(inner, '#ffe58a', light=.4, ol=GOLD_D)
    F.px(45, 38, '#ffffff'); F.px(46, 37, '#ffffff')
    for (x, y, r) in ((24, 20, 3), (72, 22, 2), (70, 60, 3), (26, 58, 2)):
        sparkle(F, x, y, r)


def ic_cutelo(F):
    A = rot(poly((30, 18), (66, 18), (66, 44), (62, 48), (30, 48)), 48, 33, -30)
    m = F.part(A, '#aeb4bc', tex=.15, light=.45)
    # gume e furo
    edge = rot(poly((30, 44), (66, 44), (62, 48), (30, 48)), 48, 33, -30)
    F.part(edge, '#e8ecf0', light=.5)
    F.flat(rot(ell(36, 24, 2.6, 2.6), 48, 33, -30), '#140e16')
    tint(F, m & F.mask(rot(R(30, 18, 66, 22), 48, 33, -30)), '#5a6068', .5)
    rng = np.random.RandomState(12)
    blood(F, 58, 48, 4, rng, clip=F.solid(), drops=5)
    blood(F, 40, 52, 2.5, rng, clip=F.solid(), drops=2)
    rust(F, 44, 28, 3, rng, m)
    # cabo
    hd = rot(R(66, 27, 86, 34), 48, 33, -30)
    F.part(hd, '#5a3a22', tex=.35, light=.3)
    for u in (70, 79):
        x, y = rp(u, 30, 48, 33, -30)
        rivet(F, x, y)
    # gotas
    for (x, y) in ((44, 62), (47, 66)):
        F.part(ell(x, y, 1.3, 1.8), '#8a1e24', light=.3)


def ic_chave(F):
    # haste
    F.part(R(46, 34, 51, 66), GOLD_D, tex=.1, light=.4)
    F.part(R(51, 54, 59, 58), GOLD_D, light=.4)
    F.part(R(51, 61, 57, 65), GOLD_D, light=.4)
    F.part(ell(48.5, 26, 14, 13), GOLD, tex=.08, light=.45)
    F.part(ell(48.5, 26, 9.5, 8.5), GOLD_D, light=.2)
    # lua vazada
    F.flat(ell(48.5, 26, 6.5, 6.5), '#140e16')
    F.flat(ell(51.5, 24, 5.5, 5.5), GOLD)
    F.part(ell(51.5, 24, 5.5, 5.5), GOLD, light=.4, ol=GOLD_D, clip=F.mask(ell(48.5, 26, 9.5, 8.5)))
    for k in range(8):
        a = k * math.pi / 4
        P(F, 48.5 + 11.6 * math.cos(a), 26 + 10.8 * math.sin(a), '#fff2b0')
    hline(F, 47, 48, 36, '#fff2b0'); vline(F, 47, 36, 64, '#ffe58a')
    sparkle(F, 30, 14, 3); sparkle(F, 66, 46, 2)
    F.part(ell(48.5, 40, 5, 2.5), GOLD, light=.4)


def ic_fragmento(F):
    L = F.layer()
    glow(F, 48, 42, 30, '#ff5a5a', 110, layer=L)
    F.a[:] = over(F.a, L)
    shards = [((48, 14), (58, 34), (52, 62), (40, 60), (37, 32)),
              ((32, 36), (40, 44), (38, 62), (28, 60), (26, 46)),
              ((62, 30), (70, 46), (64, 62), (55, 60), (57, 42))]
    for i, s in enumerate(shards):
        m = F.part(poly(*s), RED if i == 0 else '#a82a32', light=.5, dark=.35, ol='#2a0810')
        c = s[0]
        lin(F, c, s[2], '#ff7a7a', m=m)
        lin(F, (c[0] - 2, c[1] + 6), (c[0] - 3, c[1] + 14), '#ffd0d0', m=m)
    F.part(poly((26, 62), (70, 62), (66, 66), (30, 66)), '#3c3446', tex=.3)
    for (x, y, r) in ((46, 24, 2), (64, 36, 2), (30, 40, 1), (72, 20, 3)):
        sparkle(F, x, y, r, '#ffd0d0')


def ic_bandeira(F):
    rng = np.random.RandomState(4)
    # escombros
    for (x, y, rx, c) in ((34, 62, 9, '#77736e'), (58, 63, 10, '#8e8a84'), (46, 64, 8, '#a5432e'), (68, 60, 5, '#6b6a66')):
        F.part(ell(x, y, rx, rx * .55), c, tex=.3)
    F.part(limb(38, 64, 38, 14, 3), '#8a6a42', tex=.2, light=.4)
    P(F, 37, 14, '#d8d2c0')
    fl = []
    for i in range(9):
        t = i / 8
        fl.append((40 + 32 * t, 16 + 3 * math.sin(t * 6)))
    for i in range(8, -1, -1):
        t = i / 8
        fl.append((40 + 30 * t, 40 + 3 * math.sin(t * 6 + .5)))
    m = F.part([fl], GREEN, tex=.15, light=.35)
    # lua no pano
    F.part(ell(55, 28, 6, 6), '#f4efe6', light=.3)
    F.part(ell(57.5, 26.5, 5, 5), GREEN, clip=F.mask(ell(55, 28, 6.5, 6.5)), shade=False, outline=False)
    tint(F, m & F.mask(ell(66, 38, 4, 3)), '#2a6a3a', .6)
    for (x, y) in ((70, 20), (69, 33)):
        F.a[y:y + 3, x:x + 3] = 0
    sparkle(F, 24, 22, 3); sparkle(F, 76, 48, 2)


CARDS = [(None, None), ('#d8394a', ic_heart), ('#e0702a', ic_forca), (BLUE, ic_escudo), (GOLD, ic_xp),
         (RED, ic_cutelo), (GOLD, ic_chave), (RED, ic_fragmento), (GREEN, ic_bandeira)]


def carta(i):
    F = Frame(96, 128)
    acc, fn = CARDS[i]
    if fn is None:
        bm = card_base(F, RED, back=True)
        F.part(ell(48, 64, 23, 23), GOLD_D, light=.4)
        F.part(ell(48, 64, 20, 20), '#2e2836', tex=.2)
        F.part(ell(48, 64, 15, 15), RED, light=.45, tex=.1)
        mm = F.mask(ell(55, 59, 13, 13)) & F.mask(ell(48, 64, 15, 15))
        setm(F, mm, '#2e2836')
        F.part(ell(55, 59, 13, 13), '#2e2836', outline=False, clip=mm, tex=.2)
        P(F, 40, 56, '#ff9a9a'); P(F, 41, 55, '#ff9a9a')
        for (x, y) in ((20, 20), (76, 20), (20, 108), (76, 108)):
            star(F, x, y, GOLD, 4)
        for k in range(16):
            a = k * math.pi / 8
            P(F, 48 + 27 * math.cos(a), 64 + 27 * math.sin(a), GOLD)
    else:
        card_base(F, acc)
        fn(F)
    card_glow(F, 30 + i)
    return compose(F)


def make_carta():
    save('ui_carta', strip([carta(i) for i in range(9)]))


# ================================================================ ui_levelup_fx

def ring_layer(w, h, cx, cy, r, th, cols, alpha, broken=0, seed=0):
    L = np.zeros((h, w, 4), np.uint8)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    ang = np.arctan2(yy - cy, xx - cx)
    t = np.abs(d - r) / (th / 2)
    m = t <= 1
    if broken:
        rng = np.random.RandomState(seed)
        ph = rng.uniform(0, 6.28, 3)
        n = np.sin(ang * 7 + ph[0]) + np.sin(ang * 11 + ph[1]) * .7 + np.sin(ang * 3 + ph[2]) * .5
        m &= n > (broken - 1.2)
    for k, (lim, c, a) in enumerate(cols):
        mm = m & (t <= lim)
        L[mm, :3] = hexc(c)
        L[mm, 3] = int(a * alpha)
    return L


def streak(F, x, y, dx, dy, L, c0, c1, layer):
    n = max(1, int(L))
    for k in range(n):
        t = k / n
        c = mix(hexc(c0), hexc(c1), t)
        a = int(255 * (1 - t) ** .5)
        F.px(x - dx * k, y - dy * k, c, layer, alpha=a)
        if k < n * .6:
            F.px(x - dx * k + (1 if abs(dy) > abs(dx) else 0), y - dy * k + (0 if abs(dy) > abs(dx) else 1), c, layer, alpha=a)
    F.px(x, y, '#ffffff', layer)


def lvfx(k):
    W = 192
    F = Frame(W, W)
    cx = cy = 96
    rng = np.random.RandomState(100 + k)
    L = F.layer()
    if k in (0, 1):
        glow(F, cx, cy, 18 if k == 0 else 32, '#ffd860', 190 if k == 0 else 240, layer=L)
        glow(F, cx, cy, 6 if k == 0 else 12, '#ffffff', 220, layer=L)
        n = 22
        for i in range(n):
            a = i * 2 * math.pi / n + rng.uniform(-.12, .12)
            r = (rng.uniform(62, 88) if k == 0 else rng.uniform(26, 52))
            x, y = cx + r * math.cos(a), cy + r * math.sin(a)
            ln = rng.uniform(4, 8) if k == 0 else rng.uniform(8, 14)
            # rastro para fora (vem de fora, indo para o centro), leve espiral
            dx, dy = -math.cos(a + .25), -math.sin(a + .25)
            streak(F, x, y, dx, dy, ln, '#fff2b0', '#b8861a', L)
            if rng.rand() < .5:
                F.px(x + 1, y, GOLD, L)
        if k == 1:
            for i in range(6):
                a = i * math.pi / 3 + .4
                sparkle(F, cx + 20 * math.cos(a), cy + 20 * math.sin(a), 2)
    elif k == 2:
        glow(F, cx, cy, 94, '#ffd860', 200, layer=L)
        glow(F, cx, cy, 46, '#fff6c8', 240, layer=L)
        pts = []
        for i in range(16):
            a = i * math.pi / 8
            r = 58 if i % 4 == 0 else (34 if i % 2 == 0 else 18)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        F.part([pts], '#fffbea', shade=False, ol='#f2c230', layer=L)
        L[:] = over(L, np.zeros_like(L))
        glow(F, cx, cy, 20, '#ffffff', 255, layer=L)
    elif k in (3, 4, 5):
        r, th, al = [(30, 12, 1.0), (56, 8, .85), (84, 4, .6)][k - 3]
        cols = [(1, GOLD if k < 5 else '#e0702a', 160), (.6, '#ffe58a' if k < 5 else GOLD, 220), (.28, '#ffffff' if k < 5 else '#fff2b0', 255)]
        if k == 5:
            cols[0] = (1, RED, 140)
        R1 = ring_layer(W, W, cx, cy, r, th, cols, al / 1.0, broken=(0 if k == 3 else (.3 if k == 4 else .9)), seed=k)
        glow(F, cx, cy, r * .6, '#fff2b0', [170, 60, 0][k - 3], layer=L)
        L[:] = over(L, R1)
        # partículas para fora
        n = 28
        for i in range(n):
            a = i * 2 * math.pi / n + rng.uniform(-.1, .1)
            rr = r + rng.uniform(-6, 14) + (k - 3) * 6
            x, y = cx + rr * math.cos(a), cy + rr * math.sin(a)
            streak(F, x, y, math.cos(a), math.sin(a), rng.uniform(3, 7 + k), '#fff2b0', GOLD_D if k < 5 else RED, L)
        if k == 3:
            glow(F, cx, cy, 18, '#fff6c8', 200, layer=L)
    elif k == 6:
        glow(F, cx, cy, 40, '#ffd860', 190, layer=L)
        for i in range(12):
            a = i * math.pi / 6 + .13
            r1 = 92 if i % 2 == 0 else 62
            wa = .09 if i % 2 == 0 else .07
            ray = [[(cx + 8 * math.cos(a - wa * 3), cy + 8 * math.sin(a - wa * 3)), (cx + r1 * math.cos(a - wa * .5), cy + r1 * math.sin(a - wa * .5)),
                    (cx + r1 * math.cos(a + wa * .5), cy + r1 * math.sin(a + wa * .5)), (cx + 8 * math.cos(a + wa * 3), cy + 8 * math.sin(a + wa * 3))]]
            tmp = F.layer()
            F.flat(ray, '#ffd040', layer=tmp, alpha=210)
            core = [[(cx + 8 * math.cos(a), cy + 8 * math.sin(a)), (cx + r1 * .8 * math.cos(a), cy + r1 * .8 * math.sin(a)),
                     (cx + 10 * math.cos(a + .08), cy + 10 * math.sin(a + .08))]]
            F.flat(core, '#fffbea', layer=tmp, alpha=255)
            # desvanecer na ponta
            yy, xx = np.mgrid[0:W, 0:W]
            d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
            fade = np.clip(1.15 - d / r1, 0, 1)
            fade = np.round(fade * 4) / 4
            tmp[..., 3] = (tmp[..., 3] * fade).astype(np.uint8)
            L[:] = over(L, tmp)
        glow(F, cx, cy, 14, '#ffffff', 255, layer=L)
        for i in range(6):
            a = rng.uniform(0, 6.28)
            rr = rng.uniform(40, 80)
            sparkle(F, cx + rr * math.cos(a), cy + rr * math.sin(a), rng.randint(2, 4))
    F.fx[:] = over(L, F.fx)
    return compose(F)


def make_lvfx():
    save('ui_levelup_fx', strip([lvfx(k) for k in range(7)]))


# ================================================================ dlg_caixa

SPEAK = [RED, AMBER, GREEN, GRAY]


def caixa(i):
    F = Frame(512, 144)
    acc = SPEAK[i]
    rng = np.random.RandomState(200)
    pm, border = wood_frame(F, 2, 20, 509, 141, 10, acc, rng, gems=True, cs=20)
    yy, xx = grid_xy(F)
    # textura e vinheta do painel
    tint(F, pm & (((xx * 3 + yy * 5) % 41) == 0), '#3a2e3a', .7)
    tint(F, pm & ((yy > 124) | (xx > 492)), '#000000', .18)
    tint(F, pm & (xx > 300) & (yy < 60) & (((xx + yy * 2) % 9) == 0), acc, .07)
    blood(F, 470, 137, 4, rng, clip=border, drops=6)
    blood(F, 30, 22, 2.5, rng, clip=border, drops=3)
    rng2 = np.random.RandomState(201)
    if i < 3:
        # nicho do retrato
        F.part(RC(10, 30, 113, 133, 1), WOOD_D, tex=.3, light=.3)
        nm = F.mask(RC(10, 30, 113, 133, 1)) & ~F.mask(R(13, 33, 110, 130))
        grain(F, nm, rng2, 40, dark=WOOD_DD, light=WOOD)
        F.part(R(12, 32, 111, 131), acc, light=.35, dark=.4, outline=False)
        recess(F, R(13, 33, 110, 130), '#120c12', tex=.08, depth=3)
        for (x, y) in ((11, 31), (110, 31), (11, 131), (110, 131)):
            rivet(F, x, y)
    # placa de nome
    F.part(RC(116, 5, 269, 30, 2), WOOD_D, tex=.3)
    pl = F.part(RC(118, 7, 267, 28, 2), mix(col(acc), col(WOOD), .25), tex=.25, light=.4)
    grain(F, pl, rng2, 40, dark=mix(col(acc), col('#000000'), .4), light=mix(col(acc), col('#ffffff'), .3), lmax=12)
    recess(F, R(124, 11, 261, 24), mix(col(acc), col('#140c10'), .72), tex=.1, depth=2)
    nail(F, 120, 17); nail(F, 264, 17)
    hline(F, 121, 263, 8, mix(col(acc), col('#ffffff'), .45), m=pl)
    # lascas na placa
    for x in (180, 238):
        F.a[7, x:x + 3] = 0
    return compose(F)


def make_caixa():
    save('dlg_caixa', grid([caixa(i) for i in range(4)], 2))


# ================================================================ dlg_extras

def tri(k):
    F = Frame(64, 64)
    dy = 3 if k else 0
    F.flat(poly((24, 26 + dy + 2), (42, 26 + dy + 2), (33, 38 + dy + 2)), '#3a2848', alpha=110)
    c = GOLD if not k else GOLD_D
    m = F.part(poly((23, 24 + dy), (41, 24 + dy), (32, 36 + dy)), c, ol='#7a1a22', shade=False)
    hline(F, 25, 38, 25 + dy, '#fff2b0' if not k else GOLD, m=m)
    F.part(poly((27, 26 + dy), (37, 26 + dy), (32, 31 + dy)), '#ffe58a' if not k else '#d9a020', outline=False, shade=False)
    hline(F, 29, 35, 34 + dy - 3, GOLD_D if not k else '#8a6014')
    if not k:
        sparkle(F, 42, 22, 2)
    return compose(F)


def cauda():
    F = Frame(64, 64)
    rng = np.random.RandomState(300)
    o = poly((6, 64), (50, 64), (26, 3))
    m = F.part(o, WOOD, tex=.3)
    grain(F, m, rng, 30, horiz=False, lmax=8)
    F.part(poly((13, 64), (43, 64), (26.5, 18)), RED, outline=False, light=.4)
    recess(F, poly((15, 64), (41, 64), (26.5, 23)), PANEL, tex=.12)
    nail(F, 25, 10)
    return compose(F)


def placa(kind):
    """kind: 'L', 'M', 'R'. Faixa útil y 20..43; sombreamento por linhas para emendar sem costura."""
    F = Frame(64, 64)
    base = col(WOOD_L)
    rowc = {20: mix(base * .32, INK, .55), 21: mix(base, MOON, .35), 22: mix(base, col(GOLD), .5), 23: mix(base, MOON, .12),
            41: mix(base, col(GOLD_D), .5), 42: mix(base * .8, NIGHT, .3), 43: mix(base * .32, INK, .55)}
    yy, xx = np.mgrid[0:64, 0:64]
    x0 = 6 if kind == 'L' else 0
    x1 = 57 if kind == 'R' else 63
    for y in range(20, 44):
        c = rowc.get(y, base * (1 - .08 * ((y - 24) / 16)))
        for x in range(x0, x1 + 1):
            ch = 0
            if kind == 'L':
                ch = max(0, 4 - (x - x0)) if (y < 24 or y > 39) else 0
                if (y < 24 and x - x0 < 24 - y) or (y > 39 and x - x0 < y - 39):
                    continue
            if kind == 'R':
                if (y < 24 and x1 - x < 24 - y) or (y > 39 and x1 - x < y - 39):
                    continue
            F.a[y, x, :3] = np.clip(c, 0, 255)
            F.a[y, x, 3] = 255
    m = F.a[..., 3] > 0
    # veio periódico (depende só de x % 64)
    inner = m & (yy >= 24) & (yy <= 40)
    g = ((xx * 7 + (yy * 13) % 11) % 23 < 3) & (((xx // 9 + yy) % 5) == 0)
    tint(F, inner & g, WOOD_D, .6)
    tint(F, inner & (((xx + yy * 17) % 31) == 0), '#c08a50', .6)
    tint(F, inner & (yy >= 37), '#000000', .12)
    if kind in ('L', 'R'):
        # contorno das pontas + chanfro
        e = dilate(m) & ~m & (yy >= 19) & (yy <= 44)
        if kind == 'L':
            e &= xx < 30
        else:
            e &= xx > 34
        setm(F, e, mix(base * .32, INK, .55))
        nx = x0 + 5 if kind == 'L' else x1 - 6
        nail(F, nx, 31)
        F.part(ell(nx + .5, 31.5, 3.2, 3.2), METAL, tex=0)
        rivet(F, nx, 31)
        if kind == 'L':
            vline(F, x0 + 1, 25, 38, mix(base, MOON, .35))
        else:
            vline(F, x1 - 1, 25, 38, mix(base * .8, NIGHT, .3))
    return compose(F)


def botao(sel):
    F = Frame(64, 64)
    rng = np.random.RandomState(310)
    m = F.part(RC(2, 14, 61, 49, 3), WOOD if not sel else '#d9a020', tex=.3 if not sel else .1, light=.35)
    if not sel:
        grain(F, m, rng, 26, lmax=10)
    else:
        hline(F, 6, 57, 15, '#fff2b0', m=m)
    F.part(RC(5, 17, 58, 46, 2), RED if sel else WOOD_D, light=.35, outline=False)
    recess(F, R(7, 19, 56, 44), PANEL if not sel else '#2e1e26', tex=.12)
    for (x, y) in ((3, 30), (59, 30)):
        nail(F, x, y)
    if sel:
        F.part(poly((9, 26), (15, 31.5), (9, 37)), RED, light=.5, ol='#2a0810')
        P(F, 10, 28, '#ff9a9a')
        sparkle(F, 58, 14, 2)
    return compose(F)


def make_extras():
    fr = [tri(0), tri(1), cauda(), placa('L'), placa('M'), placa('R'), botao(False), botao(True)]
    save('dlg_extras', strip(fr))


# ================================================================ dlg_retrato

def retrato_bg(F, who):
    rng = np.random.RandomState(400 + who)
    yy, xx = np.mgrid[0:96, 0:96]
    m = F.part(R(0, 0, 95, 95), WOOD, tex=.3, outline=False)
    grain(F, m & ((xx < 5) | (xx > 90) | (yy < 5) | (yy > 90)), rng, 60, lmax=10)
    F.part(R(4, 4, 91, 91), '#2a1f3a', shade=False, ol='#140c14')
    bg = F.mask(R(4, 4, 91, 91))
    tint(F, bg & (yy > 40), '#120c1a', ((yy - 40) / 60.0).clip(0, 1).mean() * 0 + .35)
    tint(F, bg & (yy > 64), '#0c0812', .3)
    mx, my = (74, 20) if who == 0 else (22, 18)
    for r, t in ((22, .12), (16, .2)):
        tint(F, bg & (np.sqrt((xx - mx) ** 2 + (yy - my) ** 2) < r), RED, t)
    mm = bg & F.mask(ell(mx, my, 10, 10))
    setm(F, mm, RED)
    tint(F, mm & F.mask(ell(mx - 3, my - 3, 6, 6)), '#e0505a', .7)
    for (dx, dy, r) in ((3, 2, 2), (-2, 4, 1.4), (4, -4, 1.2)):
        tint(F, mm & F.mask(ell(mx + dx, my + dy, r, r)), '#8a1a22', .6)
    # prédios
    x = 4
    while x < 92:
        w = rng.randint(8, 16)
        h = rng.randint(14, 34)
        b = bg & (xx >= x) & (xx < x + w) & (yy >= 92 - h)
        setm(F, b, '#1a1424')
        hline(F, x, x + w - 1, 92 - h, '#2e2440', m=bg)
        for _ in range(rng.randint(0, 3)):
            wx, wy = x + rng.randint(1, max(2, w - 2)), 92 - h + rng.randint(3, max(4, h - 4))
            if wy < 90:
                P(F, wx, wy, '#e0a040', m=bg); P(F, wx, wy + 1, '#a06a2a', m=bg)
        x += w + rng.randint(0, 3)
    return bg


def retrato_frame(F):
    yy, xx = np.mgrid[0:96, 0:96]
    fm = (xx < 4) | (xx > 91) | (yy < 4) | (yy > 91)
    for (x, y) in ((0, 0), (95, 0), (0, 95), (95, 95)):
        bracket(F, x, y, 1 if x == 0 else -1, 1 if y == 0 else -1, s=12, w=4)
    hline(F, 1, 94, 0, '#a87444', m=fm)
    tint(F, fm & (yy > 92), '#000000', .3)
    tint(F, fm & (xx > 92), '#000000', .25)
    # contorno externo
    for x in range(96):
        F.a[95, x, :3] = col('#1a0f0c'); F.a[0, x, :3] = mix(col(WOOD) * .32, INK, .55) * 1.3
    F.a[:, 95, :3] = col('#1a0f0c'); F.a[:, 0, :3] = mix(col(WOOD) * .32, INK, .55) * 1.3


def eyes(F, pts, blink, skin, iris='#2a1810', lid=None):
    for (x, y) in pts:
        if blink:
            hline(F, x - 1, x + 3, y + 1, '#2a140e')
            hline(F, x, x + 2, y, mix(col(skin), col('#000000'), .25))
            P(F, x - 2, y + 2, '#2a140e'); P(F, x + 4, y + 2, '#2a140e')
        else:
            hline(F, x - 1, x + 3, y - 1, '#2a140e')
            hline(F, x - 1, x + 3, y, '#e8dcc8')
            hline(F, x - 1, x + 3, y + 1, '#d0c0a8')
            for (a, b) in ((x + 1, y), (x + 2, y), (x + 1, y + 1), (x + 2, y + 1)):
                P(F, a, b, iris)
            P(F, x + 1, y, '#f8f0e0')
            P(F, x - 2, y, '#2a140e')
            if lid is not None:
                hline(F, x - 1, x + 3, y + 2, lid)


def mouth(F, x, y, w, op, lip):
    if op:
        F.part(RC(x, y - 1, x + w, y + 3, 1), '#2a0e10', shade=False, ol=lip)
        hline(F, x + 1, x + w - 1, y - 1, '#e8e0d0')
        hline(F, x + 2, x + w - 2, y + 3, '#a04048')
        P(F, x + w // 2, y + 2, '#6a2028')
    else:
        hline(F, x, x + w, y, '#3a1810')
        hline(F, x + 1, x + w - 1, y + 1, lip)
        P(F, x - 1, y - 1, '#3a1810') if False else None


def socorro(blink, op):
    F = Frame(96, 96)
    bg = retrato_bg(F, 0)
    rng = np.random.RandomState(410)
    skin = '#7a4a30'
    yy, xx = np.mgrid[0:96, 0:96]
    # corpo: blusa + xale
    F.part(poly((5, 96), (8, 80), (18, 71), (36, 67), (57, 67), (75, 71), (85, 80), (88, 96)), '#4a6a8a', tex=.2, clip=bg)
    bm = F.mask(poly((5, 96), (8, 80), (18, 71), (36, 67), (57, 67), (75, 71), (85, 80), (88, 96))) & bg
    for (x, y) in ((40, 84), (52, 88), (46, 79), (58, 82), (35, 90)):
        tint(F, bm & F.mask(ell(x, y, 1.6, 1.6)), '#e8c070', .7)
    F.part(poly((4, 96), (7, 80), (17, 70), (37, 66), (42, 76), (38, 96)), '#6a5a8a', tex=.35, clip=bg)
    F.part(poly((89, 96), (86, 80), (76, 70), (56, 66), (51, 76), (55, 96)), '#6a5a8a', tex=.35, clip=bg)
    xm = F.mask(poly((4, 96), (7, 80), (17, 70), (37, 66), (42, 76), (38, 96))) | F.mask(poly((89, 96), (86, 80), (76, 70), (56, 66), (51, 76), (55, 96)))
    tint(F, xm & bg & (((xx + yy) % 4) == 0), '#4a3e66', .6)
    tint(F, xm & bg & (((xx - yy) % 6) == 0), '#8a7aaa', .4)
    # pescoço
    F.part(R(40, 58, 53, 72), '#6a3e28', tex=.1)
    hline(F, 41, 52, 66, '#5a3220')
    # orelhas + brincos
    F.part(ell(31.5, 47, 3, 4.5), skin)
    F.part(ell(61.5, 47, 3, 4.5), skin)
    # cabeça
    hm = F.part(ell(46.5, 46, 14.5, 17), skin, tex=.08, light=.25)
    F.part(ell(31.5, 53.5, 1.6, 1.6), GOLD, light=.5); F.part(ell(61.5, 53.5, 1.6, 1.6), GOLD, light=.5)
    # cabelo grisalho nas têmporas
    for sx in (-1, 1):
        x = 46.5 + sx * 13
        F.part(poly((x - 2, 35), (x + 2, 35), (x + sx * 1.5, 46), (x - sx * .5, 44)), '#b0aab0', tex=.4, light=.35)
    # lenço
    yy2 = 37 + ((xx - 46) / 16.0) ** 2 * 4
    clipL = yy <= yy2
    F.part(ell(64, 32, 4, 3.5), '#9a3a26', tex=.2)
    F.part(poly((62, 33), (67, 33), (70, 48), (65, 46)), '#9a3a26', tex=.2)
    F.part(poly((64, 33), (68, 34), (74, 44), (69, 45)), '#b8452e', tex=.2)
    lm = F.part(ell(46.5, 36, 17.5, 15), '#b8452e', tex=.18, light=.3, clip=clipL)
    tint(F, lm & (((xx // 5 + yy // 5) % 2) == 0) & ((xx % 5) == 2) & ((yy % 5) == 2), '#e8c070', .9)
    tint(F, lm & (yy >= yy2 - 2), '#7a2418', .55)
    hline(F, 34, 58, 26, '#d86048', m=lm)
    F.part(ell(65, 31, 3, 2.5), '#c8503a', light=.4)
    # rosto
    sk = col(skin)
    eyes(F, [(39, 45), (51, 45)], blink, skin, lid=mix(sk, col('#000000'), .25))
    hline(F, 37, 42, 41, '#c0b8b8'); hline(F, 50, 55, 41, '#c0b8b8')
    P(F, 37, 42, '#8a8088'); P(F, 55, 42, '#8a8088')
    # nariz
    vline(F, 47, 46, 50, mix(sk, col('#000000'), .2))
    F.part(ell(46.5, 51, 3.4, 2), '#6a3e28', light=.35, ol='#3a1e14')
    P(F, 45, 52, '#2a140e'); P(F, 48, 52, '#2a140e')
    # rugas
    lin(F, (41, 52), (40, 56), mix(sk, col('#000000'), .3))
    lin(F, (52, 52), (53, 56), mix(sk, col('#000000'), .3))
    hline(F, 42, 45, 38, mix(sk, col('#000000'), .18), m=hm)
    hline(F, 48, 51, 38, mix(sk, col('#000000'), .18), m=hm)
    P(F, 36, 47, mix(sk, col('#000000'), .3)); P(F, 57, 47, mix(sk, col('#000000'), .3))
    tint(F, hm & F.mask(ell(38, 51, 3, 2)), '#a05a40', .3)
    tint(F, hm & F.mask(ell(55, 51, 3, 2)), '#a05a40', .3)
    mouth(F, 43, 57, 7, op, '#8a4a3a')
    tint(F, hm & F.mask(ell(46.5, 62, 6, 1.5)), '#000000', .12)
    retrato_frame(F)
    return compose(F)


def biu(blink, op):
    F = Frame(96, 96)
    bg = retrato_bg(F, 1)
    rng = np.random.RandomState(420)
    skin = '#b07a50'
    yy, xx = np.mgrid[0:96, 0:96]
    body = poly((5, 96), (8, 81), (18, 72), (36, 68), (57, 68), (75, 72), (85, 81), (88, 96))
    bm = F.part(body, '#c8323a', tex=.2, clip=bg) & bg
    tint(F, bm & ((yy // 4) % 2 == 0), '#2a2228', .85)
    tint(F, bm & (((xx * 3 + yy * 7) % 13) == 0), '#6a5a4a', .5)  # encardido
    blood(F, 66, 86, 3, rng, clip=bm, drops=3, t=.6)
    F.part(poly((37, 68), (56, 68), (50, 76), (43, 76)), '#a06a44', tex=.1)  # gola aberta
    F.part(R(40, 58, 53, 73), '#9a6a44', tex=.1)
    F.part(ell(31.5, 48, 3, 4.5), skin)
    F.part(ell(61.5, 48, 3, 4.5), skin)
    hm = F.part(ell(46.5, 47, 14, 16.5), skin, tex=.06, light=.25)
    sk = col(skin)
    # barba rala
    tint(F, hm & (yy > 54) & (((xx * 5 + yy * 3) % 4) == 0), '#4a3020', .55)
    tint(F, hm & (yy > 58) & (((xx + yy) % 3) == 0), '#4a3020', .4)
    # cabelo (costeletas e nuca)
    for sx in (-1, 1):
        x = 46.5 + sx * 13
        F.part(poly((x - 2.5, 37), (x + 2.5, 37), (x + sx * 1, 48), (x - sx * 1.5, 47)), '#2a1a14', tex=.3)
    # boné
    capm = F.part(ell(46.5, 37, 16.5, 12), '#3f6a8c', tex=.25, light=.3, clip=(yy <= 39))
    lin(F, (46, 26), (46, 38), '#2f5070', m=capm)
    lin(F, (38, 28), (35, 38), '#2f5070', m=capm)
    lin(F, (55, 28), (58, 38), '#2f5070', m=capm)
    pm = F.part(R(48, 30, 55, 35), '#8a7a52', tex=.2)
    for x in range(48, 56, 2):
        P(F, x, 30, '#c8b890'); P(F, x + 1, 35, '#c8b890')
    tint(F, capm & (((xx + 2 * yy) % 5) == 0), '#5a8ab0', .3)
    F.part(ell(46.5, 25.5, 2, 1.4), '#2f5070', light=.4)
    # aba
    F.part(poly((28, 38), (65, 38), (62, 43), (46, 45), (31, 43)), '#2f5070', tex=.15, light=.35)
    hline(F, 30, 63, 39, '#5a8ab0')
    # sombra da aba no rosto
    tint(F, hm & (yy >= 44) & (yy <= 46), '#000000', .25)
    # sobrancelhas grossas
    hline(F, 37, 43, 46, '#2a1a14'); hline(F, 50, 56, 46, '#2a1a14')
    eyes(F, [(39, 49), (51, 49)], blink, skin, iris='#3a2414')
    vline(F, 47, 50, 53, mix(sk, col('#000000'), .2))
    F.part(ell(46.5, 54, 3.2, 1.8), '#9a6a44', light=.35, ol='#4a2a18')
    P(F, 45, 55, '#3a1e14'); P(F, 48, 55, '#3a1e14')
    mouth(F, 43, 59, 7, op, '#8a5040')
    # curativo
    cv = rot(R(53, 50, 60, 53), 56, 51, -12)
    F.part(cv, '#e8dcc0', light=.35)
    cvm = F.mask(cv)
    tint(F, cvm & (((xx + yy) % 2) == 0), '#c0b090', .5)
    tint(F, cvm & F.mask(R(55, 50, 57, 53)), '#c8a080', .6)
    P(F, 56, 51, '#8a2a28')
    # sujeira
    tint(F, hm & F.mask(ell(38, 57, 2.5, 1.5)), '#4a3a2a', .3)
    retrato_frame(F)
    return compose(F)


def make_retrato():
    fr = [socorro(0, 0), socorro(1, 0), socorro(0, 1), socorro(1, 1), biu(0, 0), biu(1, 0), biu(0, 1), biu(1, 1)]
    save('dlg_retrato', grid(fr, 4))


# ================================================================ dlg_balao

def balao(F, border=None):
    tail = poly((21, 38), (31, 40), (20, 55))
    if border:
        F.part(ell(32, 25, 25, 19.5) + mv(tail, -1, 1), border, light=.35, ol='#1a0f14')
    m = F.part(ell(32, 25, 22.5, 17) + tail, '#f4efe6', light=.15, dark=.22, ol=None if border is None else mix(col(border) * .5, INK, .3))
    tint(F, m & F.mask(ell(46, 35, 4, 2)), '#a89a88', .35)
    P(F, 16, 16, '#ffffff'); P(F, 17, 15, '#ffffff'); P(F, 18, 14, '#ffffff')
    return m


def bal(k):
    F = Frame(64, 64)
    rng = np.random.RandomState(500 + k)
    if k == 0:
        balao(F)
        for (y, x0, x1) in ((19, 20, 44), (25, 18, 46), (31, 20, 36)):
            hline(F, x0, x1, y, '#8a8296'); hline(F, x0, x1, y + 1, '#b8b0c0')
    elif k == 1:
        balao(F)
        bitmap(F, ["01110", "11011", "00011", "00110", "00100", "00000", "00100"], 25, 12, 3, GOLD, ol='#5a3a08')
    elif k == 2:
        balao(F)
        c = '#4a3a6a'
        F.part(ell(24, 33, 3.6, 2.8, rot=-20) + ell(39, 30, 3.6, 2.8, rot=-20), c, light=.35)
        F.part(R(26, 15, 27, 33) + R(41, 12, 42, 30), c, light=.3)
        F.part(poly((26, 14), (43, 11), (43, 16), (26, 19)), c, light=.4)
        P(F, 22, 32, '#8a7ab0'); P(F, 37, 29, '#8a7ab0')
    elif k == 3:
        balao(F)
        bitmap(F, ["1111", "0011", "0110", "1100", "1111"], 16, 16, 3, BLUE, ol='#14284a')
        bitmap(F, ["111", "011", "110", "111"], 32, 20, 2, BLUE, ol='#14284a')
        bitmap(F, ["11", "11"], 42, 16, 2, '#7ab0f0', ol='#14284a')
    elif k == 4:
        balao(F)
        m = F.part(ell(26.5, 22, 6, 5.5) + ell(37.5, 22, 6, 5.5) + poly((20.5, 24), (43.5, 24), (32, 36)), '#d8394a', light=.4)
        P(F, 24, 19, '#ffffff'); P(F, 25, 19, '#ffd0d8')
    elif k == 5:
        balao(F)
        F.part(poly((28, 12), (37, 12), (35, 29), (30, 29)), RED, light=.45, ol='#2a0810')
        F.part(ell(32.5, 35, 3.2, 3), RED, light=.45, ol='#2a0810')
        P(F, 30, 14, '#ff9a9a')
    elif k == 6:
        balao(F)
        for x in (21, 32, 43):
            F.part(ell(x, 26, 3.2, 3.2), '#4a4458', light=.4)
    elif k == 7:
        balao(F, border=RED)
        F.part(ell(32, 22, 9.5, 8.5), '#e8e0d0', light=.3, ol='#2a1a1a')
        F.part(R(27, 28, 37, 34), '#e8e0d0', light=.3, ol='#2a1a1a')
        F.flat(ell(28.3, 23, 2.8, 2.6) + ell(36, 23, 2.8, 2.6), '#1a0f14')
        F.flat(poly((32, 26), (33.5, 29), (30.5, 29)), '#1a0f14')
        for x in (29, 32, 35):
            vline(F, x, 31, 34, '#1a0f14')
        P(F, 27, 22, '#c8323a')
        tint(F, F.mask(ell(38, 17, 3, 2)), '#8a8070', .3)
    elif k == 8:
        balao(F, border=BLUE)
        F.part(poly((21, 12), (32, 10), (43, 12), (43, 24), (38, 33), (32, 38), (26, 33), (21, 24)), METAL, light=.45)
        m = F.part(poly((24, 14.5), (32, 13), (40, 14.5), (40, 24), (36, 31), (32, 34.5), (28, 31), (24, 24)), '#8a5e34', tex=.25, light=.3)
        for x in (29, 35):
            vline(F, x, 12, 36, '#4a2e1a', m=m)
        F.part(R(23, 21, 41, 23), METAL)
        rivet(F, 25, 21); rivet(F, 38, 21)
    return compose(F)


def make_balao():
    save('dlg_balao', strip([bal(k) for k in range(9)]))


# ================================================================ ui_recrutar

def recr(k):
    F = Frame(256, 48)
    rng = np.random.RandomState(600)
    yy, xx = grid_xy(F)
    if k == 5:
        marker(F, 128)
        return compose(F)
    if k == 3:
        L = F.layer()
        glow(F, 128, 24, 110, '#9cff9c', 120, layer=L)
        F.a[:] = over(F.a, L)
    cas = F.part(RC(4, 7, 251, 40, 2), WOOD, tex=.3)
    rim = cas & ~F.mask(R(14, 13, 241, 34))
    grain(F, rim, rng, 90)
    for x in (60, 196):
        vline(F, x, 8, 12, WOOD_DD, m=rim); nail(F, x + 3, 9); nail(F, x - 5, 37)
    for (x0, x1) in ((2, 13), (242, 253)):
        mm = F.part(RC(x0, 5, x1, 42, 2), METAL, tex=.25)
        rivet(F, x0 + 4, 9); rivet(F, x0 + 4, 36); rivet(F, x0 + 4, 22)
        rust(F, x0 + 6, 30, 2.5, rng, mm)
    for x in (122,):
        F.part(R(x, 4, x + 11, 11), METAL, tex=.2); rivet(F, x + 5, 6)
        F.part(R(x, 36, x + 11, 43), METAL, tex=.2); rivet(F, x + 5, 39)
    blood(F, 220, 38, 2.6, rng, clip=rim, drops=3)
    tr = recess(F, R(16, 15, 239, 32), '#3a1418', tex=.1, depth=2)
    tint(F, tr & (((xx + yy) % 6) < 2), '#24080c', .6)
    pct = [.3, .6, .9, .3, .3][k]
    w = int(round(224 * pct))
    gx0, gx1 = 128 - w // 2, 128 - w // 2 + w - 1
    gm = tr & (xx >= gx0) & (xx <= gx1) & (yy >= 16)
    gcol = '#9cff9c' if k == 3 else GREEN
    setm(F, gm, gcol)
    tint(F, gm & (yy == 16), '#ffffff' if k == 3 else '#9cf0a0', .8)
    tint(F, gm & (yy == 17), '#c8ffc8' if k == 3 else '#7ad08a', .6)
    tint(F, gm & (yy >= 29), '#2a6a3a', .55)
    tint(F, gm & (((xx - yy) % 8) < 2) & (yy > 17) & (yy < 29), '#ffffff' if k == 3 else '#6ccc84', .35)
    for x in (gx0, gx1):
        vline(F, x, 16, 32, '#d8ffd8' if k == 3 else '#b8f0c0')
        vline(F, x + (1 if x == gx0 else -1), 16, 32, '#2a6a3a')
    # régua de marcas
    for x in range(16, 240, 16):
        P(F, x, 15, '#0c0408'); P(F, x, 32, '#0c0408')
    if k == 4:
        tint(F, F.solid() & ~gm, RED, .38)
        tint(F, tr, RED, .3)
        tint(F, gm, '#4a4a40', .55)
        # rachadura
        for (a, b) in (((60, 15), (64, 21)), ((64, 21), (61, 26)), ((61, 26), (66, 32)), ((64, 21), (69, 23))):
            lin(F, a, b, '#0c0408')
        marker(F, 62, bad=True)
    else:
        marker(F, [150, 70, 210, 136][k])
    if k == 3:
        for (x, y, r) in ((90, 10, 3), (170, 38, 3), (130, 8, 2), (60, 40, 2), (200, 12, 2)):
            sparkle(F, x, y, r, '#e8ffe8')
    return compose(F)


def marker(F, x, bad=False):
    c = '#ffb0b0' if bad else '#fff2b0'
    g = RED if bad else GOLD
    F.part(R(x - 1, 9, x + 1, 38), c, light=.3, ol='#2a1a08')
    F.part(poly((x - 5, 2), (x + 5.99, 2), (x + .5, 9)), g, light=.45, ol='#3a2408')
    F.part(poly((x - 5, 45.99), (x + 5.99, 45.99), (x + .5, 39)), g, light=.45, ol='#3a2408')
    P(F, x - 3, 3, '#ffffff')


def make_recrutar():
    save('ui_recrutar', strip([recr(k) for k in range(6)]))


# ================================================================ ui_resumo

def resumo(rel):
    F = Frame(256, 192)
    rng = np.random.RandomState(700)
    yy, xx = grid_xy(F)
    F.flat(RC(12, 20, 251, 191, 6), '#1a1020', alpha=90)
    bd = F.part(RC(8, 14, 247, 187, 6), '#8a5a32', tex=.35, light=.25)
    grain(F, bd, rng, 260, dark='#6a4226', light='#a87048', lmax=26)
    # lascas nos cantos
    F.a[184:188, 230:240] = 0
    F.a[14:17, 20:26] = 0
    # papel (com borda direita rasgada)
    pts = [(20, 24), (236, 24)]
    y = 24
    while y < 176:
        y += rng.randint(3, 7)
        pts.append((236 - rng.randint(0, 3), min(y, 176)))
    pts += [(224, 179), (20, 179)]
    F.flat([[(x + 2, y + 2) for (x, y) in pts]], '#3a2418', alpha=120)
    pm = F.part([pts], '#e8dfc8', tex=.06, light=.1, dark=.2, ol='#6a5a44')
    tint(F, pm & (((xx * 7 + yy * 3) % 53) == 0), '#c8b898', .6)
    tint(F, pm & (yy > 150), '#c8b890', .18)
    tint(F, pm & (xx > 200), '#c0b088', .1)
    # pauta
    for y in range(46, 176, 12):
        hline(F, 22, 234, y, '#9aa8c0', m=pm)
    hline(F, 22, 234, 47, '#c0c8d8', m=pm)
    vline(F, 42, 25, 178, '#c86060', m=pm)
    vline(F, 43, 25, 178, '#e0a0a0', m=pm)
    # furos de fichário
    for y in (60, 110, 160):
        F.part(ell(30, y, 3, 3), '#8a5a32', shade=False, ol='#a89a80')
    # canto dobrado
    F.a[F.mask(poly((226, 179), (236, 169), (236, 179)))] = 0
    F.part(poly((224, 179), (226, 167), (236, 168.5)), '#cfc4a8', light=.3, ol='#6a5a44')
    # sujeira
    m = F.mask(ell(196, 140, 13, 12)) & ~F.mask(ell(196, 140, 10.5, 9.5)) & pm
    tint(F, m, '#a88a60', .45)
    blood(F, 60, 158, 8, rng, clip=pm, drops=9, t=.7)
    blood(F, 214, 60, 4, rng, clip=pm, drops=5, t=.65)
    # digital
    for r in range(1, 6):
        e = F.mask(ell(186, 82, r * 1.1 + .3, r * 1.4 + .3)) & ~F.mask(ell(186, 82, r * 1.1 - .5, r * 1.4 - .5))
        tint(F, e & pm & (((xx + yy) % 3) != 0), BLOOD_L, .5)
    # fita adesiva
    tp = rot(R(14, 168, 40, 177), 27, 172, 35)
    tmp = F.layer()
    F.flat(tp, '#f0e8b8', layer=tmp, alpha=150)
    F.a[:] = over(F.a, tmp)
    # prendedor
    F.part(RC(96, 4, 159, 26, 3), '#6b747a', tex=.2)
    cm = F.part(RC(100, 2, 155, 20, 3), '#8d969c', tex=.2, light=.4)
    F.part(RC(112, 18, 143, 30, 2), '#9aa2a8', light=.4)
    hline(F, 114, 141, 27, '#5a6066')
    for x in range(104, 152, 3):
        P(F, x, 10, '#6b747a')
    F.part(limb(108, 9, 147, 9, 5), '#b0b8be', light=.45)
    rivet(F, 104, 14); rivet(F, 150, 14)
    rust(F, 140, 6, 3, rng, cm)
    rust(F, 106, 18, 2, rng, cm)
    F.part(R(124, 6, 131, 8), '#3a3e44', shade=False)
    if rel:
        # caixinhas
        for y in range(52, 170, 12):
            if y > 150:
                break
            F.part(R(47, y - 7, 52, y - 2), '#e8dfc8', shade=False, ol='#5a5a70')
        for y in (52, 64, 88):
            lin(F, (47, y - 5), (49, y - 3), '#2a3a6a'); lin(F, (49, y - 3), (54, y - 9), '#2a3a6a')
        lin(F, (47, y - 7 + 36), (52, y - 2 + 36), '#c8323a') if False else None
        # carimbo
        st = F.layer()
        cx, cy = 186, 138
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        ring = ((d >= 19) & (d <= 22)) | ((d >= 14) & (d <= 15.2))
        moon = (np.sqrt((xx - cx + 2) ** 2 + (yy - cy) ** 2) <= 9) & ~(np.sqrt((xx - cx - 2) ** 2 + (yy - cy + 2) ** 2) <= 7.5)
        ang = np.arctan2(yy - cy, xx - cx)
        teeth = (d > 15.2) & (d < 19) & ((np.round(ang * 24 / math.pi) % 2) == 0)
        mm = (ring | moon | teeth)
        holes = ((xx * 13 + yy * 7) % 11 == 0) | ((xx * 5 + yy * 17) % 23 == 0)
        mm &= ~holes
        bars = (np.abs(yy - cy) <= 1) & (np.abs(xx - cx) > 23) & (np.abs(xx - cx) < 34)
        mm |= bars & ~holes
        st[mm, :3] = hexc('#c8323a')
        st[mm, 3] = 210
        im = Image.fromarray(st).rotate(14, resample=Image.NEAREST, center=(cx, cy))
        st = np.array(im)
        st[~pm] = 0
        F.a[:] = over(F.a, st)
    return compose(F)


def make_resumo():
    save('ui_resumo', strip([resumo(0), resumo(1)]))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    jobs = dict(xp=make_xp, selo=make_selo, carta=make_carta, lvfx=make_lvfx, caixa=make_caixa, extras=make_extras,
                retrato=make_retrato, balao=make_balao, recrutar=make_recrutar, resumo=make_resumo)
    for k, f in jobs.items():
        if not only or k in only:
            f()
