"""HUD de combate (grupo hud_combate).

Gera em ../sprites/: hud_vida, hud_veneno, hud_boss, hud_guarda, hud_energia, hud_recuperacao,
hud_lua, hud_relogio, hud_alvo_inimigo  (tiras/grades descritas em ../docs/hud_combate.json).
Roda sozinho:  python obj_hud_combate.py
Estilo: moldura de metal velho rebitado, arranhões, ferrugem, ossos e acento vermelho-lua.
"""
import os
import sys
import math
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *   # noqa
from pixkit import _hash

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'sprites'))
os.makedirs(OUT, exist_ok=True)

METAL = '#3a3640'
REC = '#140e12'
BONE = '#d8ccb0'
ROPE = '#b59a62'
RED = '#c8323a'
GOLD = '#f2c230'
GOLD_D = '#b8861a'
WHITE = np.array([255, 250, 240.])


# ================================================================ cores / máscaras

def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def lt(c, t=.3):
    return mix(C(c), WHITE, t)


def dk(c, t=.3):
    return mix(C(c) * (1 - t * .5), NIGHT, t)


def hx(a):
    a = np.clip(a, 0, 255).astype(int)
    return '#%02x%02x%02x' % tuple(a)


def rect(F, x0, y0, x1, y1, cut=1):
    m = np.zeros((F.h, F.w), bool)
    m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    if cut:
        for (x, y, dx, dy) in [(x0, y0, 1, 1), (x1 - 1, y0, -1, 1), (x0, y1 - 1, 1, -1), (x1 - 1, y1 - 1, -1, -1)]:
            for k in range(cut):
                for j in range(cut - k):
                    xx, yy = x + dx * j, y + dy * k
                    if 0 <= xx < F.w and 0 <= yy < F.h:
                        m[yy, xx] = False
    return m


def disc(F, cx, cy, r):
    yy, xx = np.mgrid[0:F.h, 0:F.w]
    return (xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2 <= r * r


def erode(m, n=1):
    for _ in range(n):
        m = ~dilate(~m)
    return m


def full(F):
    return [[(0, 0), (F.w + 1, 0), (F.w + 1, F.h + 1), (0, F.h + 1)]]


def pm(F, m, col, **kw):
    """F.part com máscara pronta (luz/sombra/contorno do pixkit)."""
    return F.part(full(F), col, clip=m, **kw)


def setm(F, m, col, layer=None, alpha=255):
    L = F.a if layer is None else layer
    L[m, :3] = C(col)
    L[m, 3] = alpha


def tintm(F, m, col, t, layer=None):
    L = F.a if layer is None else layer
    mm = m & (L[..., 3] > 0)
    L[mm, :3] = np.clip(mix(L[mm, :3].astype(float), C(col), t), 0, 255)


def dot(F, x, y, col, layer=None):
    F.px(x, y, hx(C(col)) if not isinstance(col, str) else col, layer)


def rivet(F, x, y, layer=None):
    dot(F, x + 1, y + 1, '#1a1418', layer)
    dot(F, x + 2, y + 1, '#1a1418', layer)
    dot(F, x + 1, y + 2, '#1a1418', layer)
    dot(F, x, y, '#eef0f2', layer)
    dot(F, x + 1, y, '#a8aeb6', layer)
    dot(F, x, y + 1, '#8a9098', layer)
    dot(F, x + 1, y + 1, '#55525e', layer)


def metal(F, m, base=METAL, seed=0, scratches=6, rust=2, blood=1, tex=.3):
    pm(F, m, base, tex=tex, light=.32, dark=.38)
    inner = erode(m, 2)
    ys, xs = np.nonzero(inner)
    if not len(xs):
        return
    rng = np.random.RandomState(seed)
    b = C(base)
    for _ in range(scratches):
        i = rng.randint(len(xs))
        x, y = xs[i], ys[i]
        L = rng.randint(3, 8)
        d = rng.choice([-1, 0, 1])
        for k in range(L):
            X, Y = x + k, y + (k * d) // 2
            if 0 <= X < F.w and 0 <= Y + 1 < F.h and inner[Y, X]:
                F.a[Y, X, :3] = lt(b, .42)
                if inner[Y + 1, X]:
                    F.a[Y + 1, X, :3] = dk(b, .45)
    for _ in range(rust):
        i = rng.randint(len(xs))
        x, y = xs[i], ys[i]
        for k in range(9):
            X, Y = x + rng.randint(-2, 3), y + rng.randint(-1, 2)
            if 0 <= X < F.w and 0 <= Y < F.h and inner[Y, X]:
                F.a[Y, X, :3] = C(['#8a4e2e', '#6a3a22', '#a8643a'][rng.randint(3)])
    for _ in range(blood):
        i = rng.randint(len(xs))
        x, y = xs[i], ys[i]
        for k in range(7):
            X, Y = x + rng.randint(-2, 2), y + rng.randint(-1, 1)
            if 0 <= X < F.w and 0 <= Y < F.h and inner[Y, X]:
                F.a[Y, X, :3] = C(['#5a161c', '#6e1a20'][rng.randint(2)])
        for k in range(rng.randint(1, 4)):
            if inner[min(F.h - 1, y + 1 + k), x]:
                F.a[y + 1 + k, x, :3] = C('#4a1016')


def seam(F, x, y0, y1):
    for y in range(y0, y1):
        if F.a[y, x, 3]:
            F.a[y, x, :3] = C('#1e1a22')
            F.a[y, x + 1, :3] = C('#5e5a66')


def recess(F, x0, y0, x1, y1, col=REC):
    m = rect(F, x0, y0, x1, y1, 0)
    setm(F, m, col)
    c = C(col)
    F.a[y0, x0:x1, :3] = c * .5
    F.a[y0:y1, x0, :3] = c * .5
    F.a[y0 + 1, x0 + 1:x1, :3] = c * .8
    F.a[y1 - 1, x0 + 1:x1, :3] = lt(c, .12)
    F.a[y0 + 1:y1, x1 - 1, :3] = lt(c, .08)
    return m


def fill(F, x0, y0, x1, y1, a, b, col, stripes=True, tip=True, veins=None, tex=True, layer=None):
    """recheio de barra de a..b (frações da largura) dentro do retângulo interno."""
    L = F.a if layer is None else layer
    W = x1 - x0
    xa, xb = x0 + int(round(a * W)), x0 + int(round(b * W))
    if xb <= xa:
        return
    h = y1 - y0
    c = C(col)
    hs = _hash(F.w, F.h)
    for r in range(h):
        if r == 0:
            rc = lt(c, .55)
        elif r == 1:
            rc = lt(c, .28)
        elif r == h - 1:
            rc = dk(c, .5)
        elif r == h - 2 and h > 5:
            rc = dk(c, .25)
        else:
            rc = c
        y = y0 + r
        for x in range(xa, xb):
            cc = rc
            if stripes and (x + y) % 9 in (0, 1) and 0 < r < h - 1:
                cc = lt(cc, .14)
            if tex and hs[y, x] < 9 and 1 < r < h - 1:
                cc = cc * .86
            L[y, x, :3] = np.clip(cc, 0, 255)
            L[y, x, 3] = 255
    if veins is not None:
        rng = np.random.RandomState(7)
        for k in range(int((xb - xa) / 10) + 1):
            x = rng.randint(xa, max(xa + 1, xb))
            y = rng.randint(y0 + 2, max(y0 + 3, y1 - 2))
            for j in range(rng.randint(3, 7)):
                X, Y = x + j, y + int(round(math.sin(j * .9 + k) * 1.2))
                if xa <= X < xb and y0 + 1 < Y < y1 - 1:
                    L[Y, X, :3] = C(veins)
    if tip and xb < x1:
        L[y0:y1, xb - 1, :3] = lt(c, .6)
        L[y0, xb - 1, :3] = WHITE
    L[y0:y1, xa:xb, 3] = 255


def glow_rect(L, x0, y0, x1, y1, col, r, alpha=120):
    h, w = L.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    dx = np.maximum(np.maximum(x0 - xx, xx - (x1 - 1)), 0)
    dy = np.maximum(np.maximum(y0 - yy, yy - (y1 - 1)), 0)
    d = np.sqrt(dx ** 2 + dy ** 2) / r
    a = np.clip(1 - d, 0, 1) ** 1.5 * alpha
    a = (np.round(a / 24) * 24).astype(np.uint8)
    src = np.zeros_like(L)
    src[..., :3] = C(col)
    src[..., 3] = a
    L[:] = over(L, src)


def bone_v(F, x, y0, y1, w=4, col=BONE, rope=True):
    sh = limb(x, y0 + 2, x, y1 - 2, w) + ell(x - 2, y0 + 1, 2.4, 2.4) + ell(x + 2, y0 + 1, 2.4, 2.4) + \
        ell(x - 2, y1 - 1, 2.4, 2.4) + ell(x + 2, y1 - 1, 2.4, 2.4)
    F.part(sh, col, light=.3, tex=.2)
    for k in range(y0 + 6, y1 - 5, 7):
        dot(F, x - 1, k, '#a89a7c')
    if rope:
        for yy in (y0 + (y1 - y0) // 3, y0 + 2 * (y1 - y0) // 3):
            for d in (-1, 0):
                F.line(x - w / 2 - 1, yy + d, x + w / 2 + 1, yy + d + 1, ROPE if d else '#8a7244')
            dot(F, x + w / 2 + 2, yy + 1, '#8a7244')


def bone_h(F, x0, x1, y, w=4, col=BONE):
    sh = limb(x0 + 2, y, x1 - 2, y, w) + ell(x0 + 1, y - 2, 2.4, 2.4) + ell(x0 + 1, y + 2, 2.4, 2.4) + \
        ell(x1 - 1, y - 2, 2.4, 2.4) + ell(x1 - 1, y + 2, 2.4, 2.4)
    F.part(sh, col, light=.3, tex=.2)


def fin(F, bg=None, post=None):
    base = np.zeros_like(F.a)
    if bg is not None:
        base = over(base, bg)
    base = over(base, F.a)
    base = over(base, F.fx)
    if post:
        base = post(base)
    return base


def whiten(arr, t=.72):
    m = arr[..., 3] > 0
    arr[m, :3] = np.clip(mix(arr[m, :3].astype(float), np.array([255, 252, 248.]), t), 0, 255)
    return arr


def thick_outline(arr, col='#0e0a0e'):
    m = arr[..., 3] > 0
    o = dilate(m) & ~m
    arr[o, :3] = C(col)
    arr[o, 3] = 255
    return arr


# ---------------- fonte 3x5 própria
GL = {'F': ["111", "100", "110", "100", "100"], 'U': ["101", "101", "101", "101", "111"],
      'R': ["110", "101", "110", "101", "101"], 'I': ["111", "010", "010", "010", "111"],
      'A': ["010", "101", "111", "101", "101"], 'O': ["010", "101", "101", "101", "010"]}


def txt(F, s, x, y, col, sc=2, ol='#1a0f14', layer=None, shade=False):
    shapes = []
    cx = x
    pos = []
    for ch in s:
        g = GL[ch]
        pos.append(cx)
        for j, row in enumerate(g):
            for i, b in enumerate(row):
                if b == '1':
                    X, Y = cx + i * sc, y + j * sc
                    shapes.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
        cx += 4 * sc
    F.part(shapes, col, shade=shade, ol=ol, layer=layer, light=.35)
    return pos


# ================================================================ hud_vida

def heart_shapes(cx, cy):
    body = ell(cx - 1, cy + 2, 8.5, 9.5, rot=-18) + poly((cx - 7, cy + 5), (cx + 5, cy + 6), (cx + 3, cy + 13))
    atrium = ell(cx - 6, cy - 4, 4.5, 4.2)
    vent = ell(cx + 4, cy + 1, 6, 7.5, rot=10)
    aorta = chain([(cx - 2, cy - 4), (cx - 2, cy - 10), (cx + 2, cy - 13), (cx + 6, cy - 11)], 4.5, 3.5)
    pulm = limb(cx + 3, cy - 4, cx + 7, cy - 9, 3.5, 3)
    cava = limb(cx - 8, cy - 4, cx - 9, cy - 11, 3.2, 2.8)
    return body, atrium, vent, aorta, pulm, cava


def draw_heart(F, cx, cy, base='#b8283a', vein='#5a4a8a', sc=1.0):
    X = Xf(cx, cy, sx=sc, sy=sc)
    body, atrium, vent, aorta, pulm, cava = heart_shapes(cx, cy)
    b = C(base)
    F.part(X(cava), vein, light=.3)
    F.part(X(pulm), hx(mix(b, C(vein), .7)), light=.35)
    F.part(X(aorta), hx(lt(b, .38)), light=.4, marks=[(X(limb(cx - 3, cy - 9, cx - 3, cy - 5, 1.5)), hx(lt(b, .6)))])
    F.part(X(atrium), hx(dk(b, .12)), light=.3, tex=.2)
    F.part(X(body), base, light=.3, tex=.25)
    F.part(X(vent), hx(lt(b, .08)), light=.32, tex=.25)
    # artéria coronária e veias
    for (x0, y0, x1, y1) in [(cx - 1, cy - 2, cx + 1, cy + 9), (cx + 1, cy + 9, cx + 2, cy + 11),
                             (cx - 1, cy + 3, cx - 5, cy + 6), (cx + 1, cy + 3, cx + 5, cy + 2)]:
        p0, p1 = X.p(x0, y0), X.p(x1, y1)
        F.line(p0[0], p0[1], p1[0], p1[1], hx(dk(b, .55)))
    p = X.p(cx + 4, cy - 1)
    F.line(p[0], p[1], p[0] + 2, p[1] + 5, hx(mix(b, C(vein), .6)))
    for (dx, dy, cl) in [(-5, -1, .6), (-4, -2, .45), (-6, 0, .35), (-3, 0, .2), (-3, -13, .45), (-2, -12, .3)]:
        p = X.p(cx + dx, cy + dy)
        dot(F, p[0], p[1], lt(b, cl + .15))


VIDA = {'verde': '#4fb04a', 'amarela': '#e0b42a', 'vermelha': '#d23038', 'veneno': '#9a4ad0'}


def vida_frame(state):
    F = Frame(256, 48)
    bg = F.layer()
    st = {'cheia': ('verde', 1.0), 'ghost': ('verde', .7), 'cura': ('verde', .6), 'amarela': ('amarela', .4),
          'vermelha': ('vermelha', .2), 'pulso': ('vermelha', .2), 'veneno': ('veneno', .6), 'flash': ('verde', .7)}
    cor, v = st[state]
    col = VIDA[cor]
    if state == 'pulso':
        col = hx(lt(col, .28))
    # régua
    m = rect(F, 38, 10, 252, 38, 2)
    metal(F, m, seed=3, scratches=10, rust=3, blood=2)
    x0, y0, x1, y1 = 46, 16, 245, 32
    for xs in (113, 179):
        seam(F, xs, 11, 37)
    recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
    # rebites
    for x in range(52, 244, 24):
        rivet(F, x, 11)
        rivet(F, x + 12, 33)
    # friso vermelho-lua (gasto)
    for x in range(44, 246):
        if (x * 7) % 23 not in (0, 1):
            dot(F, x, 36, RED if (x % 5) else '#8a1e26')
    # recheio
    if state in ('ghost', 'flash'):
        fill(F, x0, y0, x1, y1, .7, 1.0, '#f0d8c8', stripes=False, tip=False, tex=False)
    fill(F, x0, y0, x1, y1, 0, v, col)
    if state == 'cura':
        fill(F, x0, y0, x1, y1, .6, .8, '#b8f0a0', stripes=True)
        xa = x0 + int(.6 * (x1 - x0))
        for y in range(y0, y1):
            if y % 2 == 0:
                dot(F, xa, y, '#f4fff0')
    # divisórias dos 10 segmentos
    W = x1 - x0
    for k in range(1, 10):
        xd = x0 + int(round(k * W / 10))
        F.a[y0:y1, xd, :3] = C('#2a2630')
        F.a[y0, xd, :3] = C('#5a5662')
        F.a[y1 - 1, xd, :3] = C('#1a1418')
    # osso amarrado na ponta direita
    bone_v(F, 248, 3, 45)
    # medalhão
    md = disc(F, 22, 24, 20.5)
    metal(F, md, seed=5, scratches=5, rust=1, blood=0)
    ring_in = disc(F, 22, 24, 15.5)
    setm(F, ring_in, '#1a1418')
    rr = disc(F, 22, 24, 14.5)
    setm(F, rr & ~disc(F, 23, 25, 14.5), '#0a0608')
    gcol = {'verde': '#c8323a', 'amarela': '#c8323a', 'vermelha': '#ff2a2a', 'veneno': '#9a4ad0'}[cor]
    glow(F, 22, 25, 15 if state != 'pulso' else 17, gcol, alpha=110 if state != 'pulso' else 160, layer=F.a)
    for ang in range(0, 360, 60):
        a = math.radians(ang + 30)
        rivet(F, 22 + 17.5 * math.cos(a) - 1, 24 + 17.5 * math.sin(a) - 1)
    hb = {'verde': '#b8283a', 'amarela': '#b8283a', 'vermelha': '#c81e2a', 'veneno': '#8a4ab0'}[cor]
    hv = '#5a4a8a' if cor != 'veneno' else '#4a2a6a'
    if state == 'pulso':
        hb = '#e83a44'
    draw_heart(F, 22, 26, hb, hv, sc=1.12 if state == 'pulso' else 1.0)
    if cor == 'veneno':
        # bolhas saindo do recheio e gotas
        xa = x0 + int(v * W)
        for (bx, by, r) in [(60, 12, 1.6), (84, 8, 2.2), (101, 13, 1.4), (125, 6, 1.8), (150, 11, 2.0), (166, 5, 1.4), (75, 3, 1.2)]:
            if bx < xa + 4:
                F.part(ell(bx, by, r, r), '#c890f0', ol='#3a1460', layer=F.fx, light=.5)
                dot(F, bx - 1, by - 1, '#ffffff', F.fx)
        for (bx, by) in [(56, 22), (88, 25), (120, 21), (140, 26), (170, 23)]:
            F.part(ell(bx, by, 1.3, 1.3), '#d8a8ff', ol=hx(dk(VIDA['veneno'], .4)), shade=False)
        # gota escorrendo da moldura
        F.part(ell(110, 41, 1.6, 2.2) + poly((109, 38), (111, 38), (110, 36)), '#9a4ad0', layer=F.fx, ol='#2a0e44')
        F.part(ell(19, 41, 1.4, 2.0), '#9a4ad0', layer=F.fx, ol='#2a0e44')
    if state == 'cura':
        plus(F, 47 + int(.8 * W) - 4, 9, col='#8fef8a', s=1)
        sparkle(F, 47 + int(.7 * W), 13, 2, '#e8ffe0')
    if state == 'pulso':
        glow_rect(bg, 38, 10, 252, 38, '#ff2a2a', 6, alpha=230)
        glow(F, 22, 24, 26, '#ff2a2a', alpha=120, layer=bg)
    post = whiten if state == 'flash' else None
    return fin(F, bg, post)


def make_vida():
    frames = [vida_frame(s) for s in ['cheia', 'ghost', 'cura', 'amarela', 'vermelha', 'pulso', 'veneno', 'flash']]
    strip(frames).save(os.path.join(OUT, 'hud_vida.png'))
    return len(frames)


# ================================================================ hud_veneno

def ang_mask(F, cx, cy, frac):
    yy, xx = np.mgrid[0:F.h, 0:F.w]
    a = np.arctan2(xx + .5 - cx, -(yy + .5 - cy)) % (2 * math.pi)
    return a <= frac * 2 * math.pi


def flask(F, cx=32, cy=33):
    glass = '#6a5a7a'
    bulb = ell(cx, cy + 5, 12, 11)
    neck = poly((cx - 4, cy - 14), (cx + 4, cy - 14), (cx + 4, cy - 4), (cx - 4, cy - 4))
    lip = poly((cx - 6, cy - 17), (cx + 6, cy - 17), (cx + 6, cy - 14), (cx - 6, cy - 14))
    cork = poly((cx - 4, cy - 23), (cx + 4, cy - 23), (cx + 3, cy - 17), (cx - 3, cy - 17))
    F.part(cork, '#9a7a4a', tex=.45, light=.3)
    gm = F.part(bulb + neck, glass, light=.25)
    F.part(lip, '#7a6a8a', light=.35)
    # barbante
    for x in range(cx - 5, cx + 6):
        dot(F, x, cy - 15, ROPE if x % 2 else '#8a7244')
    F.line(cx + 5, cy - 15, cx + 8, cy - 11, ROPE)
    F.line(cx + 6, cy - 15, cx + 9, cy - 12, '#8a7244')
    # líquido
    liq = F.mask(bulb) & (np.mgrid[0:F.h, 0:F.w][0] >= cy - 1)
    liq = erode(liq, 1) & F.mask(bulb)
    pm(F, liq & erode(F.mask(bulb), 1), '#9a4ad0', outline=False, light=.3, dark=.45, tex=.25)
    yy = cy - 1
    for x in range(cx - 11, cx + 12):
        if liq[yy, x]:
            F.a[yy, x, :3] = C('#d8a8ff') if (x % 3) else C('#b070e0')
    # fundo escuro do líquido
    lo = liq & ~shift(liq, 0, -3)
    F.a[lo, :3] = mix(F.a[lo, :3].astype(float), C('#3a0e5a'), .5)
    # bolhas
    for (bx, by, r) in [(cx - 6, cy + 10, 1.5), (cx + 7, cy + 7, 1.2), (cx + 4, cy + 12, 1.0), (cx - 8, cy + 3, 1.0), (cx + 8, cy + 1, 1.6)]:
        F.part(ell(bx, by, r, r), '#d8a8ff', ol='#5a1e86', shade=False)
    for (bx, by) in [(cx - 2, cy - 4), (cx + 1, cy - 8), (cx - 1, cy - 11)]:
        dot(F, bx, by, '#d8a8ff')
        dot(F, bx + 1, by, '#b070e0')
    # caveira de osso pintada
    sk = ell(cx, cy + 6, 5.5, 4.8)
    jaw = poly((cx - 3.5, cy + 8), (cx + 3.5, cy + 8), (cx + 3, cy + 13), (cx - 3, cy + 13))
    F.part(jaw + sk, '#e8dcc0', ol='#2a1a2a', light=.3)
    for (ex, ey) in [(cx - 3, cy + 5), (cx + 1, cy + 5)]:
        F.flat(poly((ex, ey), (ex + 3, ey), (ex + 3, ey + 3), (ex, ey + 3)), '#2a1a2a')
        dot(F, ex + 1, ey + 1, '#c070ff')
    dot(F, cx, cy + 9, '#2a1a2a')
    dot(F, cx - 1, cy + 9, '#5a4a4a')
    for x in range(cx - 2, cx + 3):
        dot(F, x, cy + 11, '#2a1a2a' if x % 2 == 0 else '#b8a888')
    # reflexo do vidro
    for y in range(cy - 1, cy + 9):
        dot(F, cx - 9 + (1 if y > cy + 5 else 0), y, '#f4eeff')
    for y in range(cy - 13, cy - 6):
        dot(F, cx - 3, y, '#d8d0e8')
    dot(F, cx - 7, cy - 3, '#ffffff')
    dot(F, cx - 6, cy - 4, '#e8e0f8')
    dot(F, cx + 8, cy + 11, '#a898b8')
    # gota escorrendo
    F.part(ell(cx + 5.5, cy - 7, 1.4, 2.2) + poly((cx + 4.5, cy - 9), (cx + 6.5, cy - 9), (cx + 5.5, cy - 13)), '#b060f0', ol='#2a0e44', light=.4)


def veneno_frame(frac=None):
    F = Frame(64, 64)
    bg = F.layer()
    if frac is not None:
        ring = disc(F, 32, 32, 31) & ~disc(F, 32, 32, 24)
        metal(F, ring, '#2e2a34', seed=11, scratches=4, rust=1, blood=0)
        ch = disc(F, 32, 32, 29) & ~disc(F, 32, 32, 26)
        setm(F, ch, '#0e0a10')
        arc = ch & ang_mask(F, 32, 32, frac)
        if arc.any():
            pm(F, arc, '#b060f0', outline=False, light=.45, dark=.4)
            outer = arc & ~disc(F, 32, 32, 28)
            F.a[outer, :3] = mix(F.a[outer, :3].astype(float), C('#e8c8ff'), .5)
            # ponta do arco brilhando
            a = frac * 2 * math.pi
            tx, ty = 32 + 27.5 * math.sin(a), 32 - 27.5 * math.cos(a)
            glow(F, tx, ty, 6, '#e0b0ff', alpha=200, layer=F.fx)
            dot(F, tx, ty, '#ffffff', F.fx)
            glow(F, 32, 32, 34, '#9a4ad0', alpha=70 + int(60 * frac), layer=bg)
        for k in range(12):
            a = k * math.pi / 6
            x, y = 32 + 30 * math.sin(a), 32 - 30 * math.cos(a)
            dot(F, x, y, '#6a6672' if k % 3 else '#c9ced4')
        for ang in (45, 135, 225, 315):
            a = math.radians(ang)
            rivet(F, 32 + 25.6 * math.sin(a) - 1, 32 - 25.6 * math.cos(a) - 1)
    else:
        glow(F, 32, 36, 28, '#9a4ad0', alpha=90, layer=bg)
    flask(F, 32, 34)
    return fin(F, bg)


def make_veneno():
    frames = [veneno_frame(None)] + [veneno_frame(f) for f in (1.0, .75, .5, .25, .05)]
    strip(frames).save(os.path.join(OUT, 'hud_veneno.png'))
    return len(frames)


# ================================================================ hud_boss

BX0, BY0, BX1, BY1 = 136, 26, 496, 42


def bx(f):
    return BX0 + int(round(f * (BX1 - BX0)))


def marker(F, x, broken=False, shards=0):
    if not broken:
        sh = poly((x, 17), (x + 4, 22), (x + 2, 24), (x + 2, 44), (x + 4, 46), (x, 51), (x - 4, 46),
                  (x - 2, 44), (x - 2, 24), (x - 4, 22))
        F.part(sh, GOLD, ol='#3a2a08', light=.4, dark=.35)
        F.line(x - 1, 20, x - 1, 47, '#fff2b0')
        dot(F, x, 21, '#ffffff')
        dot(F, x + 1, 45, GOLD_D)
        for y in (28, 34, 40):
            dot(F, x + 1, y, GOLD_D)
    else:
        top = poly((x, 17), (x + 4, 22), (x + 2, 24), (x + 2, 26), (x, 28), (x - 1, 25), (x - 2, 24), (x - 4, 22))
        bot = poly((x - 2, 41), (x, 43), (x + 2, 40), (x + 2, 44), (x + 4, 46), (x, 51), (x - 4, 46), (x - 2, 44))
        F.part(top + bot, GOLD_D, ol='#2a1a04', light=.3)
        dot(F, x - 1, 20, '#e8c060')
        dot(F, x - 1, 46, '#e8c060')
        # rachaduras escuras no recheio onde estava o pino
        for (dx, dy) in [(0, 29), (-1, 31), (1, 33), (0, 35), (-1, 37), (1, 39)]:
            dot(F, x + dx, dy, '#2a1a04')


def shards(F, x, k):
    rng = np.random.RandomState(3)
    cy = 34
    if k == 0:
        glow(F, x, cy, 14, '#fff8d0', alpha=230, layer=F.fx)
        impact(F, x, cy, 8)
        marker(F, x)
        for (dx0, dy0, dx1, dy1) in [(0, 20, -1, 26), (-1, 26, 1, 32), (1, 32, -1, 40), (-1, 40, 0, 48)]:
            F.line(x + dx0, dy0, x + dx1, dy1, '#3a2a08')
        return
    marker(F, x, broken=True)
    n = 14
    for i in range(n):
        a = rng.uniform(0, 2 * math.pi)
        sp = rng.uniform(.5, 1.0)
        d = (6 + 10 * k) * sp
        px_, py_ = x + d * math.cos(a) * 1.6, cy + d * math.sin(a) * .9 - (2 * k if k > 1 else 0)
        s = rng.uniform(1.2, 2.6) * (1.0 if k < 2 else .8)
        r0 = rng.uniform(0, 360)
        tri = [[rp(px_ + s * math.cos(math.radians(r0 + j * 120)) * (1 + .5 * (j == 0)),
                   py_ + s * math.sin(math.radians(r0 + j * 120)), px_, py_, 0) for j in range(3)]]
        F.part(tri, GOLD if i % 3 else '#fff2b0', ol='#3a2a08', layer=F.fx, shade=False)
    if k == 1:
        sparkle(F, x - 9, 24, 3)
        sparkle(F, x + 11, 44, 2)
        glow(F, x, cy, 10, '#fff8d0', alpha=120, layer=F.fx)
    else:
        sparkle(F, x - 18, 20, 2, '#f2c230')


def skull_plate(F, cx, cy, eyes='#c8323a', glow_eyes=False):
    # cutelos cruzados
    for s in (-1, 1):
        A = 40 * s
        blade = rot(poly((cx - 4, cy - 20), (cx + 5, cy - 20), (cx + 5, cy + 3), (cx - 4, cy + 3)), cx, cy, A)
        handle = rot(limb(cx + .5, cy + 4, cx + .5, cy + 15, 3.4), cx, cy, A)
        F.part(handle, '#6a4a2a', tex=.3)
        F.part(blade, '#9aa0a8', light=.4, tex=.15, marks=[(rot(poly((cx - 4, cy - 20), (cx - 2, cy - 20), (cx - 2, cy + 3), (cx - 4, cy + 3)), cx, cy, A), '#d8dce0')])
        p = rp(cx + 2, cy - 16, cx, cy, A)
        F.flat(ell(p[0], p[1], 1.2, 1.2), '#1a1418')
        p = rp(cx + 3, cy - 4, cx, cy, A)
        F.flat(ell(p[0], p[1], 1.4, 1), '#6a161c')
    # caveira
    cran = ell(cx, cy - 2, 9.5, 8.5)
    cheek = poly((cx - 7, cy + 1), (cx + 7, cy + 1), (cx + 5, cy + 8), (cx - 5, cy + 8))
    jaw = poly((cx - 5, cy + 8), (cx + 5, cy + 8), (cx + 4, cy + 11), (cx - 4, cy + 11))
    F.part(jaw, '#c8bca0', light=.3)
    F.part(cran + cheek, '#e8dcc0', light=.35, tex=.2)
    for (ex, ey) in [(cx - 4.5, cy), (cx + 4.5, cy)]:
        F.flat(ell(ex, ey, 2.8, 2.4), '#1a0e12')
        if glow_eyes:
            glow(F, ex, ey, 6, '#ff3030', alpha=200, layer=F.fx)
        dot(F, ex, ey, eyes)
        dot(F, ex - 1, ey, hx(dk(eyes, .4)))
    F.flat(poly((cx - 1, cy + 3), (cx + 1, cy + 3), (cx + .5, cy + 6), (cx - .5, cy + 6)), '#2a1a1a')
    for x in range(cx - 4, cx + 5):
        dot(F, x, cy + 8, '#2a1a1a')
        if x % 2 == 0:
            dot(F, x, cy + 9, '#2a1a1a')
    F.line(cx + 3, cy - 9, cx + 6, cy - 5, '#8a7a60')
    F.line(cx + 6, cy - 5, cx + 5, cy - 3, '#8a7a60')
    dot(F, cx - 5, cy - 7, '#fff8e8')
    dot(F, cx - 4, cy - 8, '#fff8e8')


def dotted(F, x, col='#f0e0c0'):
    for y in range(BY0 - 3, BY1 + 3):
        if y % 2 == 0:
            dot(F, x, y, col)
            dot(F, x + 1, y, '#3a2a20')
    dot(F, x, BY0 - 5, col)
    dot(F, x - 1, BY0 - 4, col)
    dot(F, x + 1, BY0 - 4, col)


def boss_frame(state):
    F = Frame(512, 64)
    bg = F.layer()
    cfg = {'vazia': (0, '#b8283a', 0, 0), 'f1': (1.0, '#b8283a', 0, 0), 'f2': (.55, '#d0622a', 1, 0),
           'furiaA': (.25, '#e8242a', 1, 1), 'furiaB': (.25, '#ff5a4a', 1, 1), 'desespero': (.08, '#e8242a', 1, 1),
           's1': (.65, '#b8283a', 0, 0), 's2': (.65, '#b8283a', 0, 0), 's3': (.65, '#b8283a', 0, 0)}
    v, col, b65, b30 = cfg[state]
    fury = state in ('furiaA', 'furiaB', 'desespero')
    if fury:
        glow_rect(bg, 126, 20, 506, 48, '#ff2020', 9 if state == 'furiaB' else 6, alpha=170 if state == 'furiaB' else 120)
    # régua
    m = rect(F, 126, 20, 506, 48, 2)
    metal(F, m, seed=21, scratches=18, rust=5, blood=4)
    for xs in (222, 318, 414):
        seam(F, xs, 21, 47)
    recess(F, BX0 - 1, BY0 - 1, BX1 + 1, BY1 + 1)
    for x in range(146, 494, 28):
        rivet(F, x, 21)
        rivet(F, x + 14, 44)
    for x in range(132, 500):
        if (x * 11) % 31 > 2:
            dot(F, x, 46, RED if x % 6 else '#8a1e26')
    fill(F, BX0, BY0, BX1, BY1, 0, v, col, veins=hx(dk(col, .55)))
    if state == 'f2':
        # resto do recheio da fase 1 (fase já vencida) apagado — não; mostra ghost curta
        fill(F, BX0, BY0, BX1, BY1, .55, .6, '#f0d8c8', stripes=False, tip=False, tex=False)
    if state == 'desespero':
        for x in range(BX0 + 1, bx(.08)):
            if x % 3 == 0:
                dot(F, x, BY0 + 1, '#ffffff')
    # rachaduras na moldura no desespero/fúria
    if fury:
        for (x, y, pts) in [(180, 20, [(0, 0), (2, 3), (1, 5)]), (300, 48, [(0, 0), (-2, -3), (0, -5)]),
                            (420, 20, [(0, 0), (-1, 2), (2, 5)]), (470, 48, [(0, 0), (1, -3), (-1, -5)])]:
            for i in range(len(pts) - 1):
                F.line(x + pts[i][0], y + pts[i][1], x + pts[i + 1][0], y + pts[i + 1][1], '#0e0a0e')
    # marcadores
    if fury:
        dotted(F, bx(.10))
    if state in ('s1', 's2', 's3'):
        shards(F, bx(.65), {'s1': 0, 's2': 1, 's3': 2}[state])
    else:
        marker(F, bx(.65), broken=bool(b65))
    marker(F, bx(.30), broken=bool(b30))
    # osso na ponta direita
    bone_v(F, 505, 12, 56, 5)
    # placa do nome
    pl = rect(F, 2, 6, 132, 58, 3)
    metal(F, pl, seed=8, scratches=9, rust=3, blood=2)
    recess(F, 46, 13, 126, 32)
    recess(F, 46, 37, 126, 50)
    for x in range(48, 125):
        if (x * 5) % 17 > 1:
            dot(F, x, 34, RED if x % 4 else '#8a1e26')
    for (x, y) in [(5, 9), (127, 9), (5, 53), (127, 53), (64, 52), (100, 52), (64, 8), (100, 8)]:
        rivet(F, x, y)
    skull_plate(F, 24, 32, eyes='#ff4a3a' if fury else RED, glow_eyes=fury)
    if fury:
        tag(F, state == 'furiaB')
        if state == 'furiaB':
            puff(F, 128, 18, 3, '#b8b0c0')
            puff(F, 496, 14, 4, '#b8b0c0')
        else:
            puff(F, 500, 16, 3, '#a8a0b0')
    return fin(F, bg)


def tag(F, bright):
    x0, y0, x1, y1 = 400, 1, 456, 19
    m = rect(F, x0, y0, x1, y1, 2)
    if bright:
        glow_rect(F.fx, x0, y0, x1, y1, '#ff3a2a', 5, 140)
    pm(F, m, '#a8141c' if bright else '#8a141c', ol='#2a0408', light=.35, tex=.2)
    # contorno dourado interno
    inner = rect(F, x0 + 1, y0 + 1, x1 - 1, y1 - 1, 1) & ~rect(F, x0 + 2, y0 + 2, x1 - 2, y1 - 2, 0)
    setm(F, inner, GOLD if bright else GOLD_D)
    F.a[y0 + 1, x0 + 2:x1 - 2, :3] = C('#fff2b0') if bright else C(GOLD)
    pos = txt(F, 'FURIA', x0 + 9, y0 + 6, '#fff0d8' if bright else '#f0d8c0', sc=2, ol='#2a0408')
    ux = pos[1]
    for (dx, dy) in [(3, -2), (4, -3), (4, -2), (5, -3)]:
        dot(F, ux + dx, y0 + 6 + dy, '#fff0d8' if bright else '#f0d8c0')
    # parafusos e chifrinhos de osso
    rivet(F, x0 + 3, y0 + 7)
    rivet(F, x1 - 5, y0 + 7)
    # suporte ligando à régua
    for xx in (x0 + 10, x1 - 11):
        F.a[y1:y1 + 2, xx:xx + 2, :3] = C('#2a2630')
        F.a[y1:y1 + 2, xx:xx + 2, 3] = 255


def make_boss():
    frames = [boss_frame(s) for s in ['vazia', 'f1', 'f2', 'furiaA', 'furiaB', 'desespero', 's1', 's2', 's3']]
    grid(frames, 3).save(os.path.join(OUT, 'hud_boss.png'))
    return len(frames)


# ================================================================ hud_guarda

def shield(F, cx, cy, broken=False):
    def body(clip=None, shift_x=0):
        X = cx + shift_x
        d = disc(F, X, cy, 13)
        if clip is not None:
            d &= clip
        pm(F, d, '#8b5e34', tex=.35, light=.3)
        planks = d & erode(d, 3)
        for x in range(int(X) - 12, int(X) + 13, 5):
            if 0 <= x < F.w:
                col_m = planks[:, x]
                F.a[col_m, x, :3] = C('#5a3a22')
        rim = d & ~disc(F, X, cy, 10.5)
        pm(F, rim, '#7d848c', light=.4, outline=False)
        for ang in range(0, 360, 60):
            a = math.radians(ang + 15)
            px_, py_ = X + 11.8 * math.cos(a), cy + 11.8 * math.sin(a)
            if clip is None or clip[int(py_), int(px_)]:
                dot(F, px_, py_, '#e8ecf0')
                dot(F, px_ + 1, py_ + 1, '#3a3640')
        um = disc(F, X - .5, cy - .5, 4.2)
        if clip is not None:
            um &= clip
        pm(F, um, '#c9ced4', light=.45, ol='#2a2630')
        dot(F, X - 2, cy - 2, '#ffffff')
    if not broken:
        body()
        F.line(cx + 4, cy + 6, cx + 8, cy + 3, '#3a2414')
        dot(F, cx - 7, cy + 4, '#5a161c')
        dot(F, cx - 6, cy + 5, '#5a161c')
        return
    yy, xx = np.mgrid[0:F.h, 0:F.w]
    zig = cx + np.where(((yy // 3) % 2) == 0, 1, -1)
    left = xx < zig
    body(left, -1.5)
    body(~left, 1.5)
    tintm(F, disc(F, cx, cy, 16), '#c8323a', .2)
    for y in range(cy - 13, cy + 14):
        z = cx + (1 if ((y // 3) % 2) == 0 else -1)
        dot(F, z - 1, y, '#0a0608')
        dot(F, z, y, '#0a0608')
    star(F, cx + 8, cy - 9, '#ffe08a', 3)
    sparkle(F, cx - 9, cy - 10, 2, '#fff0d0')


def guarda_frame(state):
    F = Frame(160, 32)
    bg = F.layer()
    v = {'cheia': 1.0, 'metade': .5, 'quase': .15, 'quebrada': 0, 'recarga': .4}[state]
    m = rect(F, 26, 7, 158, 26, 2)
    metal(F, m, seed=31 + len(state), scratches=6, rust=2, blood=1)
    x0, y0, x1, y1 = 33, 11, 153, 21
    recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1, '#2a0a10' if state == 'quebrada' else REC)
    for x in (36, 148):
        rivet(F, x, 8)
        rivet(F, x, 22)
    if state == 'recarga':
        fill(F, x0, y0, x1, y1, 0, v, '#4a6a9a', stripes=False)
        xb = x0 + int(v * (x1 - x0))
        for cxv in range(x0 + 4, xb - 2, 8):
            for d in range(-3, 4):
                X = cxv + (3 - abs(d)) // 1 - 2
                dot(F, X, 16 + d, '#c8e4ff' if abs(d) < 3 else '#8ab0e0')
        sparkle(F, xb, 16, 2, '#c8e4ff')
    else:
        fill(F, x0, y0, x1, y1, 0, v, '#3a8ae0')
    for k in range(1, 5):
        xd = x0 + int(round(k * (x1 - x0) / 5))
        F.a[y0:y1, xd, :3] = C('#1a1418')
        dot(F, xd, y0 - 2, '#c9ced4')
        dot(F, xd, y1 + 1, '#6a6672')
    for x in range(32, 154):
        if x % 7:
            dot(F, x, 24, '#2a5a9a' if state != 'quebrada' else '#8a1e26')
    if state == 'quebrada':
        for (pts) in [[(60, 7), (62, 11), (60, 15), (63, 20)], [(110, 26), (108, 21), (111, 17), (109, 13)]]:
            for i in range(len(pts) - 1):
                F.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#0a0608')
        tintm(F, rect(F, 26, 7, 158, 26, 0), '#c8323a', .18)
    if state == 'quase':
        glow_rect(bg, 26, 7, 158, 26, '#ff3a3a', 5, 150)
    shield(F, 14, 16, broken=(state == 'quebrada'))
    if state == 'cheia':
        sparkle(F, 150, 9, 2, '#d8f0ff')
    return fin(F, bg)


def make_guarda():
    frames = [guarda_frame(s) for s in ['cheia', 'metade', 'quase', 'quebrada', 'recarga']]
    strip(frames).save(os.path.join(OUT, 'hud_guarda.png'))
    return len(frames)


# ================================================================ hud_energia

RES = {'ki': '#4a9aff', 'chakra': '#4ae0e8', 'reiatsu': '#e02a2a', 'celula': '#3ae0a0'}


def icon(F, kind, cx, cy, dim=0.0, hot=False):
    if kind == 'ki':
        F.part(ell(cx, cy, 7, 7), '#2a6ad8', light=.35, ol='#0a1a40')
        F.flat(ell(cx - .5, cy - .5, 4.5, 4.5), '#7ab8ff')
        F.flat(ell(cx - 1, cy - 1, 2.4, 2.4), '#e8f4ff')
        dot(F, cx - 2, cy - 2, '#ffffff')
        for (dx, dy) in [(5, -4), (-5, 4), (4, 5)]:
            dot(F, cx + dx, cy + dy, '#bfe0ff')
    elif kind == 'chakra':
        F.part(ell(cx, cy, 7, 7), '#1a8a9a', light=.35, ol='#062a30')
        for i in range(40):
            t = i / 40 * 2.4 * math.pi
            r = 1 + t * .8
            dot(F, cx + r * math.cos(t), cy + r * math.sin(t), '#bff8ff' if i % 3 else '#ffffff')
        dot(F, cx, cy, '#ffffff')
    elif kind == 'reiatsu':
        F.part(ell(cx, cy, 7, 7), '#120a0e', light=.15, ol='#000000')
        cres = disc(F, cx, cy, 6) & ~disc(F, cx + 3, cy - 2, 5)
        pm(F, cres, '#e02a2a', light=.4, ol='#3a0406')
        dot(F, cx - 4, cy - 1, '#ffb0a0')
        dot(F, cx - 3, cy + 3, '#ff6a5a')
        dot(F, cx + 4, cy - 4, '#ffffff')
    else:
        F.part(poly((cx - 2, cy - 9), (cx + 2, cy - 9), (cx + 2, cy - 7), (cx - 2, cy - 7)), '#9aa0a8', light=.4)
        F.part(poly((cx - 5, cy - 7), (cx + 5, cy - 7), (cx + 5, cy + 8), (cx - 5, cy + 8)), '#2a3a36', light=.3)
        F.flat(poly((cx - 3, cy - 5), (cx + 4, cy - 5), (cx + 4, cy + 7), (cx - 3, cy + 7)), '#3ae0a0')
        F.flat(poly((cx - 3, cy - 5), (cx - 2, cy - 5), (cx - 2, cy + 7), (cx - 3, cy + 7)), '#a8ffd8')
        F.flat(poly((cx + 1, cy - 4), (cx - 2, cy + 1), (cx, cy + 1), (cx - 1, cy + 6), (cx + 3, cy - 1), (cx + 1, cy - 1)), '#0e3a2a')
    if dim:
        tintm(F, disc(F, cx, cy, 10), '#1a1420', dim)
    if hot:
        glow(F, cx, cy, 13, RES[kind] if kind != 'reiatsu' else '#ff2a2a', alpha=110, layer=F.fx)


def energia_frame(kind, state):
    F = Frame(192, 32)
    bg = F.layer()
    col = RES[kind]
    over_ok = kind in ('ki', 'chakra')
    m = rect(F, 24, 7, 190, 26, 2)
    metal(F, m, seed=41 + len(kind), scratches=7, rust=2, blood=1)
    x0, y0, x1, y1 = 30, 11, 184, 21
    recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
    for x in (27, 186):
        rivet(F, x - 1, 8)
        rivet(F, x - 1, 22)
    for x in range(30, 184):
        if x % 9:
            dot(F, x, 24, hx(dk(col, .35)))
    W = x1 - x0
    veins = '#120a0e' if kind == 'reiatsu' else None
    if kind == 'celula':
        cells = 4
        cw = W / cells
        nfull = {'vazia': 0, 'carregando': 2, 'cheia': 4, 'cheia2': 4, 'resfriamento': 0}[state]
        for i in range(cells):
            a, b = i / cells, (i + 1) / cells
            if i < nfull:
                fill(F, x0, y0, x1, y1, a + .006, b - .006, '#3ae0a0' if state != 'cheia2' else '#7affc8', tip=False)
                xa = x0 + int(round(a * W)) + 2
                for y in range(y0 + 2, y1 - 2):
                    dot(F, xa + 1, y, '#d8fff0')
            elif state == 'carregando' and i == nfull:
                fill(F, x0, y0, x1, y1, a + .006, a + .45 / cells, '#2a9a78')
        if state == 'resfriamento':
            fill(F, x0, y0, x1, y1, 0, .45, '#c8323a')
        for k in range(1, cells):
            xd = x0 + int(round(k * cw))
            F.a[y0 - 1:y1 + 1, xd - 1:xd + 2, :3] = C('#2a2630')
            F.a[y0 - 1, xd - 1:xd + 2, :3] = C('#5a5662')
            dot(F, xd, y0 + 3, '#9aa0a8')
            dot(F, xd, y1 - 4, '#9aa0a8')
    else:
        if state == 'carregando':
            fill(F, x0, y0, x1, y1, 0, .52, col, veins=veins)
            glow(F, x0 + .52 * W, 16, 7, lt(col, .5), alpha=170, layer=F.fx)
        elif state in ('cheia', 'cheia2'):
            c2 = col if state == 'cheia' else hx(lt(col, .3))
            fill(F, x0, y0, x1, y1, 0, 1.0, c2, veins=veins)
            if kind == 'reiatsu':
                for x in range(x0 + 3, x1, 13 if state == 'cheia' else 11):
                    F.line(x, y1 - 2, x + 4, y0 + 1, '#120a0e')
        elif state == 'sobrecarga':
            fill(F, x0, y0, x1, y1, 0, 1.0, '#fff0b0')
            for x in range(x0, x1):
                if (x // 3) % 3 == 0:
                    dot(F, x, y0 + 4 + (x % 2), '#f2c230')
        elif state == 'resfriamento':
            fill(F, x0, y0, x1, y1, 0, .45, '#c8323a', veins=veins if kind == 'reiatsu' else None)
            xb = x0 + int(.45 * W)
            for cxv in range(x0 + 6, xb - 3, 10):
                for d in range(-2, 3):
                    dot(F, cxv - (2 - abs(d)), 16 + d, '#ffb0a8')
    # marcas: mínimo e cheia
    for f, c, cc in [(.25, '#f0e6d0', '#8a8070'), (.85, GOLD, GOLD_D)]:
        if kind == 'celula':
            break
        xm = x0 + int(round(f * W))
        for yy in (y0 - 3, y0 - 2, y1 + 1, y1 + 2):
            dot(F, xm, yy, c)
            dot(F, xm + 1, yy, cc)
        for yy in range(y0, y1, 2):
            px_ = F.a[yy, xm, :3].astype(float)
            F.a[yy, xm, :3] = mix(px_, C(c), .5)
    # efeitos
    if state in ('cheia', 'cheia2'):
        gcol = col if kind != 'reiatsu' else '#ff2a2a'
        glow_rect(bg, 24, 7, 190, 26, gcol, 5 if state == 'cheia' else 7, alpha=140)
        sps = [(60, 6, 2), (120, 27, 2), (170, 5, 3)] if state == 'cheia' else [(90, 5, 3), (150, 27, 2), (40, 27, 2)]
        for (x, y, r) in sps:
            sparkle(F, x, y, r, hx(lt(gcol, .6)))
        if kind == 'reiatsu':
            for (x, y) in ([(70, 4), (140, 4)] if state == 'cheia' else [(100, 3), (175, 4)]):
                sparkle(F, x, y, 2, '#ff5a4a')
                dot(F, x, y, '#120a0e', F.fx)
    if state == 'sobrecarga':
        glow_rect(bg, 24, 7, 190, 26, '#ffe07a', 7, alpha=170)
        # raios instáveis
        rng = np.random.RandomState(9 + len(kind))
        for x in (50, 96, 140, 176):
            y = 6
            px0 = x
            for k in range(4):
                nx = px0 + rng.randint(-3, 4)
                ny = y - 2
                F.line(px0, y, nx, ny, '#ffffff', F.fx)
                px0, y = nx, ny
        for x in (70, 120, 160):
            y = 26
            px0 = x
            for k in range(3):
                nx = px0 + rng.randint(-3, 4)
                F.line(px0, y, nx, y + 2, '#fff0b0', F.fx)
                px0, y = nx, y + 2
        sparkle(F, 186, 6, 3, '#ffffff')
    if state == 'resfriamento':
        puff(F, 178, 5, 3, '#b8b0c0')
        puff(F, 120, 4, 2.4, '#a8a0b0')
    # soquete do ícone
    sk = disc(F, 13, 16, 12.5)
    metal(F, sk, seed=50, scratches=3, rust=1, blood=0)
    setm(F, disc(F, 13, 16, 9.5), '#0e0a10')
    for ang in (0, 90, 180, 270):
        a = math.radians(ang + 45)
        rivet(F, 13 + 10.8 * math.cos(a) - 1, 16 + 10.8 * math.sin(a) - 1)
    ic = {'vazia': .5, 'resfriamento': .35}.get(state, 0)
    icon(F, kind, 13, 16, dim=ic, hot=state in ('cheia', 'cheia2', 'sobrecarga'))
    if state == 'sobrecarga':
        glow(F, 13, 16, 14, '#fff0b0', alpha=150, layer=F.fx)
    return fin(F, bg)


def make_energia():
    frames = []
    for kind in ('ki', 'chakra', 'reiatsu', 'celula'):
        sts = ['vazia', 'carregando', 'cheia', 'sobrecarga' if kind in ('ki', 'chakra') else 'cheia2', 'resfriamento']
        frames += [energia_frame(kind, s) for s in sts]
    grid(frames, 5).save(os.path.join(OUT, 'hud_energia.png'))
    return len(frames)


# ================================================================ hud_recuperacao

def recup_frame(kind, v):
    F = Frame(64, 24)
    m = rect(F, 2, 5, 62, 20, 2)
    metal(F, m, seed=61, scratches=3, rust=1, blood=0, tex=.2)
    x0, y0, x1, y1 = 16, 9, 59, 16
    recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
    rivet(F, 59, 6)
    rivet(F, 59, 17)
    W = x1 - x0
    if kind == 'martelo':
        if v > 0:
            if v <= .54:
                fill(F, x0, y0, x1, y1, 0, v, '#f0e6d0', stripes=False)
            else:
                fill(F, x0, y0, x1, y1, 0, v, '#4a9aff')
        xm = x0 + int(round(.54 * W))
        dot(F, xm, y0 - 2, '#7ab8ff')
        dot(F, xm, y1 + 1, '#7ab8ff')
        F.a[y0:y1, xm, :3] = mix(F.a[y0:y1, xm, :3].astype(float), C('#7ab8ff'), .45)
        # ícone martelo
        F.part(limb(9, 11, 9, 18, 2.4), '#8a6a42', tex=.3)
        F.part(poly((4, 7), (14, 7), (14, 12), (4, 12)), '#7d848c', light=.4,
               marks=[(poly((4, 7), (14, 7), (14, 8), (4, 8)), '#c9ced4')])
        dot(F, 5, 11, '#5a161c')
    else:
        if v > 0:
            fill(F, x0, y0, x1, y1, 0, v, '#e09a30')
        for k in range(1, 5):
            xd = x0 + int(round(k * W / 5))
            F.a[y0:y1, xd, :3] = C('#1a1418')
        # ícone cartucho
        F.part(ell(9, 9, 2.3, 3.2) + poly((6.8, 9), (11.2, 9), (11.2, 11), (6.8, 11)), '#b8683a', light=.45)
        F.part(poly((6.5, 11), (11.5, 11), (11.5, 18), (6.5, 18)), '#d0a040', light=.4,
               marks=[(poly((6.5, 16), (11.5, 16), (11.5, 18), (6.5, 18)), '#9a7020')])
        dot(F, 7, 12, '#fff0b0')
    if v >= 1.0:
        sparkle(F, 60, 4, 2, '#d8eeff' if kind == 'martelo' else '#fff0b0')
    return fin(F, post=thick_outline)


def make_recup():
    frames = [recup_frame('martelo', v) for v in (0, .35, .55, .8, 1.0)] + \
             [recup_frame('recarga', v) for v in (0, .25, .5, .75, 1.0)]
    grid(frames, 5).save(os.path.join(OUT, 'hud_recuperacao.png'))
    return len(frames)


# ================================================================ hud_lua

CRAT = [(-6, -6, 4.2), (6, -8, 2.6), (7, 4, 3.6), (-4, 8, 2.8), (-11, 2, 2.0), (1, 1, 1.6), (11, -2, 1.6), (-1, -12, 1.4)]
MARIA = [(-3, -2, 7, 5, 20), (6, 8, 5, 3.5, -10)]


def moon(F, cx, cy, r, col, crat=CRAT, maria=MARIA, sc=1.0):
    c = C(col)
    d = disc(F, cx, cy, r)
    pm(F, d, col, light=.35, dark=.4, tex=.18, ol=hx(dk(c, .7)))
    for (mx, my, rx, ry, rt) in maria:
        mm = F.mask(ell(cx + mx * sc, cy + my * sc, rx * sc, ry * sc, rot=rt)) & erode(d, 1)
        F.a[mm, :3] = mix(F.a[mm, :3].astype(float), dk(c, .5), .45)
    for (dx, dy, cr) in crat:
        cr *= sc
        X, Y = cx + dx * sc, cy + dy * sc
        cm = disc(F, X, Y, cr) & erode(d, 1)
        F.a[cm, :3] = mix(F.a[cm, :3].astype(float), dk(c, .45), .6)
        inner_sh = cm & ~shift(cm, 1, 1)
        F.a[inner_sh, :3] = dk(c, .7)
        rim = shift(cm, 1, 1) & ~cm & erode(d, 1)
        F.a[rim, :3] = lt(c, .35)
    # terminador (sombra do lado de baixo-direita)
    ter = d & ~disc(F, cx - 4 * sc, cy - 4 * sc, r)
    F.a[ter, :3] = mix(F.a[ter, :3].astype(float), NIGHT, .38)
    dot(F, cx - r * .55, cy - r * .55, lt(c, .7))


def halo(L, cx, cy, r0, w, col, alpha):
    h, ww = L.shape[:2]
    yy, xx = np.mgrid[0:h, 0:ww]
    d = (np.sqrt((xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2) - r0) / w
    a = np.where(d >= 0, np.clip(1 - d, 0, 1) ** 1.3, 1) * alpha
    a = (np.round(a / 32) * 32).clip(0, 255).astype(np.uint8)
    src = np.zeros_like(L)
    src[..., :3] = C(col)
    src[..., 3] = a
    L[:] = over(L, src)


def lua_frame(i):
    F = Frame(64, 64)
    bg = F.layer()
    cols = ['#ece6d6', '#e8b4b0', '#d84848', '#d84848', '#f06058', '#a8141c', '#b81a22']
    col = cols[i]
    aura = {0: ('#c8d8ff', 4, 70), 1: ('#ff9a9a', 4, 80), 2: ('#ff5a5a', 4, 110), 3: ('#ff4a4a', 5, 150),
            4: ('#ff3a3a', 7, 230), 5: ('#ff2020', 6, 230), 6: ('#ff2020', 7, 255)}[i]
    halo(bg, 32, 32, 25.5, aura[1], aura[0], aura[2])
    if i >= 5:
        halo(bg, 32, 32, 25.5, 3, '#ffb0a0', 140 if i == 6 else 90)
    ring = disc(F, 32, 32, 25.5) & ~disc(F, 32, 32, 20.5)
    metal(F, ring, seed=71, scratches=4, rust=2, blood=1 if i >= 5 else 0)
    setm(F, disc(F, 32, 32, 20.5) & ~disc(F, 32, 32, 19.5), '#0a0608')
    # garras de osso nas diagonais
    for ang in (45, 135, 225, 315):
        a = math.radians(ang)
        p0 = (32 + 21 * math.cos(a), 32 + 21 * math.sin(a))
        p1 = (32 + 30 * math.cos(a), 32 + 30 * math.sin(a))
        F.part(limb(p0[0], p0[1], p1[0], p1[1], 3.6, 1.6), BONE, light=.35, tex=.15)
        dot(F, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, '#a89a7c')
    for ang in (0, 90, 180, 270):
        a = math.radians(ang)
        rivet(F, 32 + 23 * math.cos(a) - 1, 32 + 23 * math.sin(a) - 1)
    moon(F, 32, 32, 19, col)
    if i >= 5:
        # sangue escorrendo da lua
        drips = [(25, 48, 3), (31, 50, 6), (36, 50, 2), (40, 47, 4)] if i == 5 else [(25, 48, 5), (31, 50, 9), (36, 50, 3), (40, 47, 6)]
        for (x, y, L) in drips:
            F.part(limb(x, y - 2, x, y + L, 1.4, 1.2) + ell(x, y + L + .5, 1.3, 1.6), '#9a1018', ol='#2a0408', light=.4, layer=F.fx)
            dot(F, x, y + L, '#ff6a5a', F.fx)
        sparkle(F, 12, 10, 2, '#ff8a80')
        sparkle(F, 54, 50, 2 if i == 5 else 3, '#ff8a80')
    if i == 4:
        sparkle(F, 50, 12, 2, '#ffd0c8')
    return fin(F, bg)


def make_lua():
    frames = [lua_frame(i) for i in range(7)]
    strip(frames).save(os.path.join(OUT, 'hud_lua.png'))
    return len(frames)


# ================================================================ hud_relogio

SKY = {'amanhecer': ['#3a2a5a', '#6a4a8a', '#b8607a', '#e88a5a', '#f8c070'],
       'meiodia': ['#3a78c0', '#4a8cd0', '#5aa0d8', '#7ab8e0', '#a8d4ec'],
       'entardecer': ['#2a1a4a', '#4a2a5a', '#8a3a4a', '#d8603a', '#f09a40'],
       'noite': ['#0a0a1e', '#101028', '#1a1a3a', '#22224a', '#2a2a58'],
       'sangue': ['#1a0408', '#2a060e', '#3a0a14', '#5a0e1a', '#7a1420']}
SKYL = [(10, 6), (16, 9), (23, 5), (29, 13), (36, 7), (43, 10), (51, 4), (57, 15), (63, 8), (70, 11), (78, 6),
        (84, 14), (91, 7), (98, 10), (105, 5), (111, 9), (118, 6)]


def relogio_frame(state):
    F = Frame(128, 64)
    cx, cy = 64, 56
    yy, xx = np.mgrid[0:F.h, 0:F.w]
    sky = disc(F, cx, cy, 47) & (yy < cy)
    # céu em faixas com dither
    cols = SKY[state]
    t = (cy - yy) / 47.0   # 0 embaixo, 1 em cima
    band = np.clip(((1 - t) * 5).astype(int), 0, 4)
    dith = ((xx + yy) % 2 == 0) & (((1 - t) * 5) % 1 > .75)
    band2 = np.clip(band + dith.astype(int), 0, 4)
    for k in range(5):
        setm(F, sky & (band2 == k), cols[k])
    rng = np.random.RandomState(5)
    if state in ('noite', 'sangue', 'amanhecer'):
        n = 26 if state != 'amanhecer' else 6
        for _ in range(n):
            a = rng.uniform(.1, math.pi - .1)
            r = rng.uniform(8, 44)
            x, y = cx + r * math.cos(a), cy - r * math.sin(a)
            if y < cy - 14 or state != 'amanhecer':
                if y < cy - 12:
                    dot(F, x, y, '#fff6e0' if state == 'noite' else ('#ff8a80' if state == 'sangue' else '#f0d8e0'))
        if state != 'amanhecer':
            sparkle(F, cx - 30, cy - 32, 1, '#ffffff' if state == 'noite' else '#ffb0a8')
            sparkle(F, cx + 26, cy - 22, 1, '#ffffff' if state == 'noite' else '#ffb0a8')
    if state == 'meiodia':
        for (x, y, w) in [(36, 36, 9), (86, 30, 11), (60, 22, 6)]:
            F.part(ell(x, y, w, 2.5) + ell(x + 3, y - 2, w * .5, 2.5), '#e8f2fa', ol='#7aa8cc', layer=None, light=.3)
    # astro
    pos = {'amanhecer': 160, 'meiodia': 90, 'entardecer': 22, 'noite': 62, 'sangue': 90}[state]
    a = math.radians(pos)
    sx, sy = cx + 33 * math.cos(a), cy - 33 * math.sin(a)
    if state in ('amanhecer', 'meiodia', 'entardecer'):
        scol = {'amanhecer': '#ffb84a', 'meiodia': '#ffe05a', 'entardecer': '#ff8a3a'}[state]
        glow(F, sx, sy, 16, scol, alpha=150, layer=F.a)
        for k in range(8):
            aa = k * math.pi / 4 + .2
            F.part(limb(sx + 8 * math.cos(aa), sy + 8 * math.sin(aa), sx + 11 * math.cos(aa), sy + 11 * math.sin(aa), 2, 1),
                   scol, shade=False, ol=hx(dk(scol, .6)))
        F.part(ell(sx, sy, 6.5, 6.5), scol, light=.5, ol=hx(dk(scol, .6)))
        F.flat(ell(sx - 1, sy - 1, 3, 3), hx(lt(scol, .5)))
        dot(F, sx - 3, sy - 3, '#ffffff')
    elif state == 'noite':
        glow(F, sx, sy, 14, '#c8d8ff', alpha=110, layer=F.a)
        moon(F, sx, sy, 7, '#ece6d6', crat=[(-2, -2, 1.8), (3, 2, 1.4), (-1, 4, 1.0)], maria=[], sc=1)
    else:
        glow(F, sx, sy, 20, '#ff2a2a', alpha=200, layer=F.a)
        moon(F, sx, sy, 8, '#c81a22', crat=[(-2, -2, 2.0), (3, 2, 1.6), (-1, 4, 1.2)], maria=[], sc=1)
    # skyline (prédios do Recife)
    sk_col = '#14101a' if state not in ('meiodia',) else '#2a3a52'
    for (x, h) in SKYL:
        w = 5 + (x % 3)
        top = cy - h
        m = rect(F, x, top, x + w, cy, 0) & sky
        setm(F, m, sk_col)
        if h > 9:
            dot(F, x + w // 2, top - 1, sk_col)
            dot(F, x + w // 2, top - 2, sk_col)
        for wy in range(top + 2, cy - 1, 3):
            for wx in range(x + 1, x + w - 1, 2):
                if rng.rand() < (.22 if state in ('noite', 'entardecer', 'sangue') else .06) and sky[wy, wx]:
                    dot(F, wx, wy, '#ffd36a' if state != 'sangue' else '#ff5a3a')
    # torre de cristal do Marco Zero (silhueta)
    tm = rect(F, 66, cy - 20, 68, cy, 0) & sky
    setm(F, tm, sk_col)
    dot(F, 67, cy - 21, sk_col)
    dot(F, 67, cy - 22, '#ff3a3a' if state in ('noite', 'sangue') else sk_col)
    # arco de metal
    band_m = disc(F, cx, cy, 55.5) & ~disc(F, cx, cy, 47) & (yy < cy + 1)
    metal(F, band_m, seed=81, scratches=10, rust=3, blood=1)
    setm(F, disc(F, cx, cy, 48) & ~disc(F, cx, cy, 47) & (yy < cy), '#0a0608')
    for k in range(7):
        aa = math.radians(180 - k * 30)
        for r in (48.5, 49.5, 50.5):
            dot(F, cx + r * math.cos(aa), cy - r * math.sin(aa), '#e0e4e8' if k % 3 == 0 else '#9aa0a8')
    for k in range(6):
        aa = math.radians(165 - k * 30)
        rivet(F, cx + 52.3 * math.cos(aa) - 1, cy - 52.3 * math.sin(aa) - 1)
    # friso vermelho-lua no arco
    for k in range(0, 180, 2):
        aa = math.radians(k)
        if (k // 2) % 7:
            dot(F, cx + 54 * math.cos(aa), cy - 54 * math.sin(aa), RED)
    # faixa de baixo
    pl = rect(F, 4, 55, 124, 64, 1)
    metal(F, pl, seed=82, scratches=4, rust=1, blood=0, tex=.2)
    recess(F, 32, 57, 96, 63)
    rivet(F, 22, 58)
    rivet(F, 104, 58)
    bone_h(F, 0, 14, 59, 3.5)
    bone_h(F, 114, 128, 59, 3.5)
    return fin(F)


def make_relogio():
    frames = [relogio_frame(s) for s in ['amanhecer', 'meiodia', 'entardecer', 'noite', 'sangue']]
    strip(frames).save(os.path.join(OUT, 'hud_relogio.png'))
    return len(frames)


# ================================================================ hud_alvo_inimigo

def excl(F, col, sc=1.0, cy=30):
    X = Xf(32, cy, sx=sc, sy=sc)
    bar = X(poly((27, cy - 20), (37, cy - 20), (38, cy - 18), (35.5, cy + 8), (28.5, cy + 8), (26, cy - 18)))
    dt = X(poly((28.5, cy + 12), (35.5, cy + 12), (35.5, cy + 19), (28.5, cy + 19)))
    c = C(col)
    F.part(bar + dt, col, light=.45, dark=.35, ol='#1a0e14')
    p0, p1 = X.p(29, cy - 17), X.p(30, cy + 5)
    F.line(p0[0], p0[1], p1[0], p1[1], hx(lt(c, .6)))
    p = X.p(30, cy + 13)
    dot(F, p[0], p[1], hx(lt(c, .6)))
    dot(F, p[0] + 1, p[1], hx(lt(c, .4)))
    p = X.p(29, cy - 18)
    dot(F, p[0], p[1], '#ffffff')
    for (dx, dy) in [(3, -10), (2, 0)]:
        p = X.p(32 + dx, cy + dy)
        dot(F, p[0], p[1], hx(dk(c, .35)))


def alvo_frame(state):
    F = Frame(64, 64)
    bg = F.layer()
    if state in ('cheia', 'metade'):
        m = rect(F, 12, 44, 52, 52, 1)
        metal(F, m, seed=91, scratches=2, rust=1, blood=0, tex=.2)
        x0, y0, x1, y1 = 15, 46, 49, 50
        recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
        if state == 'metade':
            fill(F, x0, y0, x1, y1, .45, .7, '#f0d8c8', stripes=False, tip=False, tex=False)
            fill(F, x0, y0, x1, y1, 0, .45, '#d23038')
        else:
            fill(F, x0, y0, x1, y1, 0, 1.0, '#d23038')
        dot(F, 13, 47, '#c9ced4')
        dot(F, 50, 47, '#c9ced4')
        return fin(F, post=thick_outline)
    if state == 'miniboss':
        m = rect(F, 10, 42, 60, 54, 2)
        pm(F, m, GOLD_D, light=.45, tex=.2, ol='#2a1a04')
        F.a[43, 12:58, :3] = C('#ffe680')
        x0, y0, x1, y1 = 20, 45, 57, 51
        recess(F, x0 - 1, y0 - 1, x1 + 1, y1 + 1)
        fill(F, x0, y0, x1, y1, 0, .7, '#b8283a', veins='#5a0e16')
        for k in range(1, 4):
            xd = x0 + int(round(k * (x1 - x0) / 4))
            F.a[y0:y1, xd, :3] = C('#2a1a04')
        rivet(F, 55, 52)
        # caveira
        F.part(ell(11, 46, 6.5, 6) + poly((7, 49), (15, 49), (14, 54), (8, 54)), '#e8dcc0', light=.35, ol='#2a1a1a')
        for ex in (8.5, 13.5):
            F.flat(ell(ex, 47, 1.6, 1.6), '#1a0e12')
            dot(F, ex, 47, '#ff3a3a')
        for x in range(9, 14):
            dot(F, x, 52, '#2a1a1a' if x % 2 else '#b8a888')
        star(F, 11, 37, GOLD, 3)
        return fin(F, post=thick_outline)
    if state == 'raro':
        glow(F, 32, 44, 26, '#f2c230', alpha=90, layer=bg)
        m = rect(F, 13, 36, 51, 52, 2)
        pm(F, m, GOLD, light=.45, dark=.35, tex=.2, ol='#3a2a08')
        inner = rect(F, 15, 38, 49, 50, 1) & ~rect(F, 16, 39, 48, 49, 0)
        setm(F, inner, GOLD_D)
        F.a[37, 15:49, :3] = C('#fff2b0')
        txt(F, 'RARO', 17, 39, '#3a2a08', sc=2, ol='#fff0b0')
        # fitas
        F.part(poly((13, 44), (7, 41), (9, 45), (7, 49), (13, 49)), '#c8323a', ol='#3a0a10', light=.3)
        F.part(poly((51, 44), (57, 41), (55, 45), (57, 49), (51, 49)), '#c8323a', ol='#3a0a10', light=.3)
        for (x, y, r) in [(12, 32, 3), (52, 33, 2), (44, 28, 2), (20, 56, 2)]:
            sparkle(F, x, y, r, '#fff6c8')
        star(F, 32, 30, GOLD, 4)
        return fin(F, bg)
    if state == 'amarelo':
        sparkle(F, 44, 12, 2, '#fff0a0')
        excl(F, '#ffd23a')
        return fin(F, bg)
    if state in ('vermelhoA', 'vermelhoB'):
        B = state == 'vermelhoB'
        glow(F, 32, 30, 26 if B else 21, '#ff3030', alpha=230 if B else 180, layer=bg)
        glow(F, 32, 30, 14, '#ff8a6a', alpha=120 if B else 70, layer=bg)
        excl(F, '#ff5a4a' if B else '#ff3a3a', sc=1.1 if B else 1.0)
        for (x, y) in ([(16, 14), (48, 44)] if B else [(48, 14), (17, 44)]):
            sparkle(F, x, y, 2, '#ffb0a0')
        return fin(F, bg)
    # roxo (agarrão)
    glow(F, 32, 30, 24, '#b04aff', alpha=200, layer=bg)
    excl(F, '#b04aff')
    for (x, y) in [(15, 24), (49, 24), (14, 36), (50, 36)]:
        F.part(ell(x, y, 3.4, 2.4), '#b8a8c8', light=.45, ol='#1a1024')
        F.flat(ell(x, y, 1.6, .8), '#1a1024')
    F.line(17, 26, 25, 28, '#c8a8ff')
    F.line(39, 28, 47, 26, '#6a5a7a')
    F.line(17, 34, 25, 32, '#c8a8ff')
    F.line(39, 32, 47, 34, '#c8a8ff')
    return fin(F, bg)


def make_alvo():
    frames = [alvo_frame(s) for s in ['cheia', 'metade', 'miniboss', 'raro', 'amarelo', 'vermelhoA', 'vermelhoB', 'roxo']]
    strip(frames).save(os.path.join(OUT, 'hud_alvo_inimigo.png'))
    return len(frames)


if __name__ == '__main__':
    for name, fn in [('hud_vida', make_vida), ('hud_veneno', make_veneno), ('hud_boss', make_boss),
                     ('hud_guarda', make_guarda), ('hud_energia', make_energia), ('hud_recuperacao', make_recup),
                     ('hud_lua', make_lua), ('hud_relogio', make_relogio), ('hud_alvo_inimigo', make_alvo)]:
        print(name, fn(), 'quadros')
