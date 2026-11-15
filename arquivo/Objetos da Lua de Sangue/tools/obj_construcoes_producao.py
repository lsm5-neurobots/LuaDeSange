"""Construções de produção (serralheria, coletor, horta, bancada) — 5 níveis × 3 estados cada.
Rodar de dentro de tools/:  python obj_construcoes_producao.py
Saída: sprites/con_*.png (grade cols=5: linhas intacta/danificada/destruída, colunas N1..N5).
"""
import math
import os
import random
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, shadow_layer, compose, grid, glow, puff,
                    hexc, mix, shift, dilate, over, MOON, NIGHT)

OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- escada de materiais (cores do contrato) ----------------
LONA, LONA2, REMENDO, LONAZ, CORDA, ESTACA, FERRUGEM, SUCATA = (
    '#5f7a4a', '#4a6139', '#8a7a52', '#3f6a8c', '#b59a62', '#8a6a42', '#8a4e2e', '#6b6a66')
TABUA, TABUA2, MADESC, PREGO, RIPA = '#9a6a3c', '#7d5430', '#5a3a22', '#c9c3b0', '#8b5e34'
PEDRA, PEDRA2, ARG, TELHA, TELHA2 = '#8e8a84', '#77736e', '#b8b0a0', '#b5562e', '#8f3f22'
TIJ, TIJ2, REJ, METAL, REBITE, CHAPA, CHAPA2, LAMP = (
    '#a5432e', '#86351f', '#c9b8a0', '#7d848c', '#c9ced4', '#8d969c', '#6b747a', '#ffd36a')
LUA, LUA2, OURO, OURO2, ARDOSIA, RUNA, RUNA2 = '#2e2836', '#3c3446', '#f2c230', '#b8861a', '#1c1822', '#c8323a', '#ff5a5a'
FULIGEM, VIGA = '#2a2228', '#2a1a12'
FERRO, FERRO2, BRASA = '#4a4c52', '#7a7c84', '#ff8a2a'
AGUA, AGUA2 = '#4f8fc0', '#8fd0f0'
DARKV = np.array([24, 14, 30.])


def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def lt(c, t):
    return np.clip(mix(C(c), MOON, t), 0, 255)


def dk(c, t):
    return np.clip(mix(C(c), DARKV, t), 0, 255)


def R(x0, y0, x1, y1):
    return [[(x0, y0), (x1, y0), (x1, y1), (x0, y1)]]


def blk(F, x0, y0, x1, y1, col, l=.25, d=.32, tex=0.0, layer=None):
    """bloco retangular rápido (sem contorno) com bisel de luz/sombra — tijolos, pedras, ripas."""
    L = F.a if layer is None else layer
    x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(F.w, x1), min(F.h, y1)
    if x1 - x0 < 1 or y1 - y0 < 1:
        return
    c = C(col)
    sub = np.zeros((y1 - y0, x1 - x0, 3), float)
    sub[:] = c
    if tex:
        yy, xx = np.mgrid[y0:y1, x0:x1]
        hm = ((xx * 73856093) ^ (yy * 19349663)) % 97 < int(97 * tex)
        sub[hm] *= .86
    if x1 - x0 > 2 and y1 - y0 > 2:
        sub[0, :] = mix(sub[0, :], MOON, l)
        sub[:, 0] = mix(sub[:, 0], MOON, l * .7)
        sub[-1, :] = mix(sub[-1, :] * (1 - d * .5), NIGHT, d)
        sub[:, -1] = mix(sub[:, -1] * (1 - d * .5), NIGHT, d * .8)
    L[y0:y1, x0:x1, :3] = np.clip(sub, 0, 255)
    L[y0:y1, x0:x1, 3] = 255


def tint_rect(F, x0, y0, x1, y1, t, col=(22, 14, 34)):
    x0, y0, x1, y1 = max(0, int(x0)), max(0, int(y0)), min(F.w, int(x1)), min(F.h, int(y1))
    sub = F.a[y0:y1, x0:x1]
    m = sub[..., 3] > 0
    sub[m, :3] = np.clip(mix(sub[m, :3].astype(float), np.array(col, float), t), 0, 255)


def tint_mask(F, m, t, col):
    F.a[m, :3] = np.clip(mix(F.a[m, :3].astype(float), C(col), t), 0, 255)


def chunk(cx, cy, w, h, ang, rng, j=1.0):
    pts = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    pts = [(x + rng.uniform(-j, j), y + rng.uniform(-j, j)) for x, y in pts]
    return rot([[(cx + x, cy + y) for x, y in pts]], cx, cy, ang)


# ---------------- runas / fogo / fumaça ----------------
GLYPHS = [
    [(0, 0, 0, 7), (0, 2, 4, 0), (0, 4, 4, 2)],
    [(2, 0, 2, 7), (0, 2, 4, 4), (4, 2, 0, 4)],
    [(0, 0, 4, 7), (4, 0, 0, 7), (0, 3, 4, 3)],
    [(0, 7, 2, 0), (2, 0, 4, 7), (1, 4, 3, 4)],
    [(0, 0, 4, 0), (2, 0, 2, 7), (0, 7, 4, 5)],
]


def runa(F, x, y, k=0, a=80, sc=1):
    m = np.zeros((F.h, F.w), bool)
    for (ax, ay, bx, by) in GLYPHS[k % len(GLYPHS)]:
        n = int(max(abs(bx - ax), abs(by - ay)) * sc) + 1
        for i in range(n + 1):
            t = i / max(1, n)
            px, py = int(round(x + (ax + (bx - ax) * t) * sc)), int(round(y + (ay + (by - ay) * t) * sc))
            if 0 <= px < F.w and 0 <= py < F.h:
                m[py, px] = True
    ring = dilate(m) & ~m & (F.a[..., 3] > 0)
    tint_mask(F, ring, .6, RUNA)
    F.a[m, :3] = hexc(RUNA2)
    F.a[m, 3] = 255
    glow(F, x + 2 * sc, y + 3.5 * sc, 9 * sc, '#ff4040', alpha=a)


def fogo(F, x, y, s=1.0, red=False, g=True):
    c1, c2, c3, ol = (('#8a1a22', RUNA, RUNA2, '#3a0810') if red else ('#d8401c', '#ff9a2a', '#ffe07a', '#5a1808'))
    if g:
        glow(F, x, y - 5 * s, 22 * s, '#ff4a3a' if red else '#ff9a3a', alpha=90)

    def tongue(cx, w, h, lean):
        return poly((cx - w / 2, y), (cx - w / 2 - 1, y - h * .35), (cx - w / 4 + lean * .5, y - h * .7), (cx + lean, y - h),
                    (cx + w / 4 + lean * .4, y - h * .55), (cx + w / 2 + 1, y - h * .3), (cx + w / 2, y))
    F.part(tongue(x - 4 * s, 7 * s, 12 * s, -2 * s) + tongue(x + 4 * s, 7 * s, 10 * s, 2 * s) + tongue(x, 9 * s, 17 * s, 1 * s),
           c1, shade=False, ol=ol, layer=F.fx)
    F.part(tongue(x - 1 * s, 6 * s, 11 * s, 1 * s) + tongue(x + 3 * s, 4 * s, 7 * s, 1 * s), c2, shade=False, outline=False, layer=F.fx)
    F.part(tongue(x, 3 * s, 6 * s, .5 * s), c3, shade=False, outline=False, layer=F.fx)


def fumaca(F, x, y, rng, n=4, s=1.0):
    cols = ['#5e5866', '#726c7a', '#878190', '#9c97a4', '#b0abb6']
    cx = x
    for i in range(n):
        cx += rng.uniform(-1, 3) * s
        puff(F, cx, y - i * 9 * s, r=(3.5 + i * 1.3) * s, col=cols[min(i, len(cols) - 1)])


def brasas(F, x0, y0, x1, y1, rng, k=10, red=False):
    for _ in range(k):
        x, y = rng.randint(int(x0), int(x1)), rng.randint(int(y0), int(y1))
        F.px(x, y, (RUNA2 if red else '#ffb040'), F.fx)
        if rng.random() < .4:
            F.px(x + 1, y, (RUNA if red else '#ff6a20'), F.fx)


# ---------------- paredes por material ----------------

def parede_lona(F, x0, y0, x1, y1, rng, sucata=True):
    F.part(R(x0, y0, x1, y1), LONA, tex=.25)
    x = x0 + rng.randint(5, 9)
    while x < x1 - 4:
        ph = rng.uniform(0, 6)
        for y in range(y0 + 2, y1 - 1):
            xx = x + int(round(math.sin(y * .18 + ph) * 1.3))
            F.px(xx, y, LONA2)
            F.px(xx + 1, y, lt(LONA, .16))
        x += rng.randint(11, 17)
    if sucata and x1 - x0 > 60:
        w, h = rng.randint(22, 30), min(y1 - y0 - 8, rng.randint(22, 30))
        sx = rng.randint(x0 + 8, x1 - w - 8)
        sy = y1 - h - rng.randint(2, 6)
        F.part(R(sx, sy, sx + w, sy + h), SUCATA, tex=.3,
               marks=[(ell(sx + w * .3, sy + h * .7, 6, 4), FERRUGEM), (ell(sx + w * .8, sy + h * .25, 4, 3), FERRUGEM)])
        for xx in range(sx + 3, sx + w - 1, 4):
            F.px(xx, sy + 2, '#8e8d88')
        for (px, py) in [(sx + 2, sy + 2), (sx + w - 2, sy + 2), (sx + 2, sy + h - 2), (sx + w - 2, sy + h - 2)]:
            F.px(px, py, '#b0aea6'); F.px(px + 1, py + 1, '#2e2c2a')
    for _ in range(rng.randint(2, 3)):
        w, h = rng.randint(10, 18), rng.randint(8, 13)
        px0 = rng.randint(x0 + 3, max(x0 + 4, x1 - w - 3))
        py0 = rng.randint(y0 + 3, max(y0 + 4, y1 - h - 3))
        F.part(R(px0, py0, px0 + w, py0 + h), REMENDO, tex=.3, ol='#3e3420')
        for i in range(px0 + 1, px0 + w, 2):
            F.px(i, py0 + 1, '#d8c9a0'); F.px(i, py0 + h - 1, '#d8c9a0')
    # corda de amarração no topo
    for xx in range(x0, x1, 2):
        yy = y0 + 2 + int(round(math.sin(xx * .3)))
        F.px(xx, yy, CORDA)
        if xx % 6 == 0:
            F.px(xx, yy + 1, dk(CORDA, .4))


def parede_tabua(F, x0, y0, x1, y1, rng, batten=True):
    F.part(R(x0, y0, x1, y1), MADESC, ol='#24160c')
    x, i = x0, 0
    while x < x1 - 1:
        w = rng.randint(8, 11)
        xe = min(x1, x + w)
        if x1 - xe < 4:
            xe = x1
        c = [TABUA, TABUA2, mix(C(TABUA), C(TABUA2), .5)][rng.randint(0, 2) if i % 2 else 0]
        yt = y0 + rng.randint(0, 2)
        blk(F, x, yt, xe - 1, y1, c, l=.22, d=.3, tex=.2)
        for _ in range(rng.randint(1, 3)):  # veios
            gx = rng.randint(x + 1, max(x + 1, xe - 3))
            gy0 = rng.randint(yt + 3, max(yt + 4, y1 - 10))
            for yy in range(gy0, min(y1 - 2, gy0 + rng.randint(5, 14))):
                F.px(gx, yy, dk(c, .3))
        if rng.random() < .35:
            kx, ky = rng.randint(x + 2, max(x + 2, xe - 4)), rng.randint(yt + 6, max(yt + 7, y1 - 6))
            F.px(kx, ky, MADESC); F.px(kx + 1, ky, MADESC); F.px(kx, ky + 1, dk(MADESC, .3))
        for ny in (yt + 3, y1 - 4):
            nx = x + (xe - x) // 2 - 1
            F.px(nx, ny, PREGO); F.px(nx + 1, ny + 1, '#3a2a1e')
        x = xe
        i += 1
    if batten:
        ym = (y0 + y1) // 2
        blk(F, x0, ym - 3, x1, ym + 3, RIPA, l=.3, d=.4, tex=.2)
        for xx in range(x0 + 4, x1 - 2, 10):
            F.px(xx, ym - 1, PREGO); F.px(xx + 1, ym, '#3a2a1e')


def parede_pedra(F, x0, y0, x1, y1, rng):
    F.part(R(x0, y0, x1, y1), ARG, tex=.2, ol='#3e3a36')
    y, row = y0 + 1, 0
    while y < y1 - 2:
        h = rng.randint(9, 12)
        ye = min(y1 - 1, y + h)
        if y1 - 1 - ye < 4:
            ye = y1 - 1
        x = x0 + 1 - (rng.randint(4, 10) if row % 2 else 0)
        while x < x1 - 1:
            w = rng.randint(13, 22)
            xe = min(x1 - 1, x + w)
            if x1 - 1 - xe < 5:
                xe = x1 - 1
            xs = max(x0 + 1, x)
            if xe - xs >= 3:
                c = [PEDRA, PEDRA2, mix(C(PEDRA), C(PEDRA2), .5), mix(C(PEDRA), C('#9a8e7e'), .5)][rng.randint(0, 3)]
                blk(F, xs, y, xe - 1, ye - 1, c, l=.3, d=.38, tex=.35)
                if rng.random() < .5:
                    cx, cy = rng.randint(xs + 2, max(xs + 2, xe - 4)), rng.randint(y + 2, max(y + 2, ye - 3))
                    F.px(cx, cy, dk(c, .35)); F.px(cx + 1, cy, dk(c, .2))
                if rng.random() < .2:
                    F.px(xs, y, ARG); F.px(xe - 2, ye - 2, ARG)
            x = xe
        y = ye
        row += 1


def parede_tijolo(F, x0, y0, x1, y1, rng, bands=None):
    F.part(R(x0, y0, x1, y1), REJ, tex=.15, ol='#3a2218')
    y, row = y0 + 1, 0
    while y < y1 - 1:
        ye = min(y1 - 1, y + 5)
        x = x0 + 1 - (5 if row % 2 else 0)
        while x < x1 - 1:
            xe = min(x1 - 1, x + 11)
            xs = max(x0 + 1, x)
            if xe - xs >= 2:
                c = [TIJ, TIJ2, mix(C(TIJ), C(TIJ2), .5), TIJ][rng.randint(0, 3)]
                if rng.random() < .06:
                    c = mix(C(TIJ2), C('#4a2a20'), .4)
                blk(F, xs, y, xe - 1, ye - 1, c, l=.26, d=.34, tex=.25)
            x = xe
        y = ye
        row += 1
    if bands is None:
        bands = [y0 + (y1 - y0) // 3]
    for yb in bands:
        F.part(R(x0 - 1, yb, x1 + 1, yb + 5), METAL, tex=.12)
        for xx in range(x0 + 3, x1 - 1, 9):
            F.px(xx, yb + 2, REBITE); F.px(xx + 1, yb + 3, '#3a3e44')
        F.px(x0 + 20, yb + 4, FERRUGEM); F.px(x0 + 21, yb + 5, FERRUGEM)


def parede_lunar(F, x0, y0, x1, y1, rng, runas=2):
    F.part(R(x0, y0, x1, y1), '#221c2a', ol='#0a060c')
    y, row = y0 + 5, 0
    while y < y1 - 6:
        ye = min(y1 - 5, y + rng.randint(13, 16))
        if y1 - 5 - ye < 5:
            ye = y1 - 5
        x = x0 + 1 - (rng.randint(6, 12) if row % 2 else 0)
        while x < x1 - 1:
            xe = min(x1 - 1, x + rng.randint(18, 26))
            if x1 - 1 - xe < 6:
                xe = x1 - 1
            xs = max(x0 + 1, x)
            if xe - xs >= 3:
                c = [LUA, LUA2, mix(C(LUA), C(LUA2), .5)][rng.randint(0, 2)]
                blk(F, xs, y + 1, xe - 1, ye, c, l=.18, d=.4, tex=.3)
                if rng.random() < .4:
                    cx = rng.randint(xs + 2, max(xs + 2, xe - 4))
                    F.line(cx, y + 3, cx + 2, y + 6, dk(c, .45))
            x = xe
        y = ye
        row += 1
    for (a, b) in ((y0, y0 + 5), (y1 - 5, y1)):
        F.part(R(x0 - 1, a, x1 + 1, b), OURO, tex=.1, ol='#3a2808')
        for xx in range(x0 + 2, x1, 7):
            F.px(xx, a + 2, OURO2)
    for k in range(runas):
        rx = x0 + (x1 - x0) * (k + 1) // (runas + 1) - 2
        runa(F, rx, (y0 + y1) // 2 - 4, k=rng.randint(0, 4))


def parede(F, n, x0, y0, x1, y1, rng, **kw):
    if n == 1:
        parede_lona(F, x0, y0, x1, y1, rng, **kw)
    elif n == 2:
        parede_tabua(F, x0, y0, x1, y1, rng)
    elif n == 3:
        parede_pedra(F, x0, y0, x1, y1, rng)
    elif n == 4:
        parede_tijolo(F, x0, y0, x1, y1, rng)
    else:
        parede_lunar(F, x0, y0, x1, y1, rng, **{k: v for k, v in kw.items() if k == 'runas'})


# ---------------- telhados (plano visto de cima + beiral) ----------------

def telhado_lona(F, x0, y0, x1, y1, rng, sag=6, nseg=2):
    pts = [(x0 + 2, y0 + 1), (x1 - 2, y0)]
    N = 40
    front = []
    for i in range(N + 1):
        t = i / N
        x = x1 - (x1 - x0) * t
        s = abs(math.sin(math.pi * t * nseg))
        front.append((x, y1 + sag * s))
    F.part([pts + front], LONAZ, tex=.25, ol='#122436')
    roofm = F.mask([pts + front])
    # dobras diagonais
    for k in range(nseg * 2 + 1):
        xs = x0 + (x1 - x0) * (k / (nseg * 2))
        for j in range(3):
            xa = xs + (j - 1) * 6
            for yy in range(y0 + 3, int(y1 + sag) - 1):
                t = (yy - y0) / max(1, (y1 - y0))
                xx = int(round(xa + math.sin(yy * .25 + k) * 1.2 + (t * 4 if k % 2 else -t * 4)))
                if 0 <= xx < F.w and roofm[yy, xx]:
                    F.a[yy, xx, :3] = dk(LONAZ, .25) if j == 1 else lt(LONAZ, .1)
    # remendo e ilhoses
    w, h = rng.randint(18, 26), rng.randint(10, 14)
    px0 = rng.randint(x0 + 10, x1 - w - 10)
    py0 = rng.randint(y0 + 6, max(y0 + 7, y1 - h - 6))
    F.part(R(px0, py0, px0 + w, py0 + h), REMENDO, tex=.3, ol='#3e3420')
    for i in range(px0 + 1, px0 + w, 2):
        F.px(i, py0 + 1, '#d8c9a0'); F.px(i, py0 + h - 1, '#d8c9a0')
    for (x, y) in front[::5]:
        F.px(x, y - 2, '#c9c3b0'); F.px(x + 1, y - 2, '#2a2a2a')
    # poça de água na barriga da lona
    for k in range(nseg):
        cx = x0 + (x1 - x0) * (k + .5) / nseg
        F.flat(ell(cx, y1 - 8, 9, 2.5), '#2f5878')
        F.px(cx - 4, y1 - 9, '#7fb0d0'); F.px(cx - 3, y1 - 9, '#7fb0d0')
    return y1 + sag


def telhado_ripa(F, x0, y0, x1, y1, rng):
    F.part(R(x0, y0, x1, y1), MADESC, ol='#24160c')
    y, row = y0, 0
    while y < y1:
        ye = min(y1, y + 7)
        c = [RIPA, mix(C(RIPA), C(TABUA), .5), mix(C(RIPA), C(TABUA2), .5)][row % 3]
        blk(F, x0, y, x1, ye + 1, c, l=.3, d=.45, tex=.25)
        xx = x0 + rng.randint(4, 30)
        while xx < x1 - 4:
            for yy in range(y + 1, ye):
                F.px(xx, yy, dk(c, .5))
            F.px(xx + 2, y + 2, PREGO)
            xx += rng.randint(18, 40)
        y = ye
        row += 1
    blk(F, x0 - 2, y1, x1 + 2, y1 + 5, TABUA2, l=.35, d=.45, tex=.2)
    F.part(R(x0 - 2, y1, x1 + 2, y1 + 5), TABUA2, tex=.2, ol='#24160c')
    for xx in range(x0 + 4, x1, 16):
        F.px(xx, y1 + 2, PREGO)
    return y1 + 5


def telhado_telha(F, x0, y0, x1, y1, rng):
    F.part(R(x0, y0, x1, y1), TELHA2, ol='#3a1408')
    y, row = y0, 0
    while y < y1 - 3:
        off = 4 if row % 2 else 0
        x = x0 - off
        while x < x1:
            c = [TELHA, mix(C(TELHA), C(TELHA2), .3), mix(C(TELHA), C('#c87a4a'), .3)][rng.randint(0, 2)]
            if rng.random() < .05:
                c = '#6a5a3a'  # musgo
            xs, xe = max(x0, x + 1), min(x1, x + 7)
            if xe - xs >= 3:
                F.part(R(xs, y, xe, y + 6) + ell((xs + xe) / 2, y + 6, (xe - xs) / 2, 2.5), c, ol='#5a2010', tex=.15, light=.3)
            x += 8
        y += 7
        row += 1
    # liquens escuros como na casa amarela
    for _ in range(2):
        cx, cy = rng.randint(x0 + 20, x1 - 20), rng.randint(y0 + 8, y1 - 8)
        m = F.mask(ell(cx, cy, rng.randint(8, 14), rng.randint(4, 7))) & (F.a[..., 3] > 0)
        yy, xx = np.nonzero(m)
        sel = ((xx + yy) % 2 == 0)
        F.a[yy[sel], xx[sel], :3] = np.clip(mix(F.a[yy[sel], xx[sel], :3].astype(float), C('#4a5a32'), .45), 0, 255)
    F.part(R(x0 - 2, y1, x1 + 2, y1 + 5), TELHA2, ol='#3a1408', tex=.1)
    for xx in range(x0, x1, 8):
        F.part(ell(xx + 3.5, y1 + 2.5, 2.5, 2.5), TELHA, ol='#5a2010', shade=False)
    return y1 + 5


def telhado_chapa(F, x0, y0, x1, y1, rng):
    F.part(R(x0, y0, x1, y1), CHAPA, ol='#22282c')
    m = F.mask(R(x0, y0, x1, y1))
    for x in range(x0 + 1, x1 - 1, 4):
        for (dx, c) in ((0, dk(CHAPA2, .1)), (1, CHAPA2), (2, lt(CHAPA, .25))):
            if x + dx < F.w:
                col = m[:, x + dx]
                F.a[col, x + dx, :3] = C(c)
    for _ in range(rng.randint(4, 7)):
        cx, cy = rng.randint(x0 + 6, x1 - 6), rng.randint(y0 + 4, y1 - 3)
        rm = F.mask(ell(cx, cy, rng.randint(4, 12), rng.randint(2, 6))) & m
        tint_mask(F, rm, .55, FERRUGEM)
        hm = F.mask(ell(cx + 1, cy + 1, 2, 1.5)) & m
        tint_mask(F, hm, .5, '#5a2a18')
    ym = (y0 + y1) // 2
    F.line(x0 + 1, ym, x1 - 2, ym, dk(CHAPA2, .45))
    F.line(x0 + 1, ym + 1, x1 - 2, ym + 1, lt(CHAPA, .3))
    for xx in range(x0 + 4, x1 - 2, 12):
        F.px(xx, ym - 2, REBITE); F.px(xx, ym + 3, REBITE)
    F.part(R(x0 - 2, y1, x1 + 2, y1 + 5), CHAPA2, ol='#22282c', tex=.1)
    for xx in range(x0 + 2, x1, 10):
        F.px(xx, y1 + 2, REBITE)
    return y1 + 5


def telhado_ardosia(F, x0, y0, x1, y1, rng):
    F.part(R(x0, y0, x1, y1), ARDOSIA, ol='#06040a')
    y, row = y0 + 3, 0
    while y < y1:
        ye = min(y1, y + 7)
        x = x0 + (-4 if row % 2 else 0)
        while x < x1:
            xs, xe = max(x0, x), min(x1, x + 8)
            c = ['#1c1822', '#26202e', '#18141e', '#2c2636'][rng.randint(0, 3)]
            blk(F, xs, y, xe, ye, c, l=.16, d=.5)
            if ye - y > 4:
                F.px(xs, ye - 1, '#0c0a10'); F.px(xe - 1, ye - 1, '#0c0a10')
            x += 9
        y = ye
        row += 1
    F.part(R(x0 - 2, y0 - 3, x1 + 2, y0 + 3), OURO, ol='#3a2808', tex=.1)
    for xx in range(x0 + 3, x1, 6):
        F.px(xx, y0, OURO2)
    F.part(R(x0 - 2, y1, x1 + 2, y1 + 5), OURO2, ol='#3a2808', tex=.1)
    F.line(x0 - 1, y1 + 1, x1 + 1, y1 + 1, OURO)
    for xx in range(x0 + 6, x1, 14):
        F.part(poly((xx - 2, y1 + 5), (xx + 2, y1 + 5), (xx, y1 + 9)), OURO, ol='#3a2808', shade=False)
    return y1 + 5


def telhado(F, n, x0, y0, x1, y1, rng, **kw):
    return [telhado_lona, telhado_ripa, telhado_telha, telhado_chapa, telhado_ardosia][n - 1](F, x0, y0, x1, y1, rng, **kw)


# ---------------- pilares ----------------

def pilar(F, n, x, y0, y1, rng, w=8):
    if n == 1:
        t = rng.uniform(-3, 3)
        F.part(limb(x + w / 2 + t, y0, x + w / 2, y1, 5, 6), ESTACA, tex=.3)
        for k in range(3):
            F.line(x + w / 2 + t - 3, y0 + 5 + k * 2, x + w / 2 + t + 3, y0 + 6 + k * 2, CORDA)
        F.px(x + w / 2, (y0 + y1) / 2, MADESC); F.px(x + w / 2 + 1, (y0 + y1) / 2 + 9, MADESC)
    elif n == 2:
        F.part(R(x, y0, x + w, y1), TABUA2, tex=.25, ol='#24160c')
        for yy in range(y0 + 4, y1 - 3, 7):
            F.px(x + 2 + (yy // 7) % 3, yy, MADESC)
        F.px(x + w // 2, y0 + 3, PREGO); F.px(x + w // 2, y1 - 6, PREGO)
        F.line(x + 1, y0 + 1, x + 1, y1 - 2, lt(TABUA2, .2))
    elif n == 3:
        F.part(R(x - 1, y0, x + w + 1, y1), ARG, ol='#3e3a36')
        y, i = y0 + 1, 0
        while y < y1 - 1:
            h = rng.randint(7, 10)
            blk(F, x - 1 + (i % 2), y, x + w + 1 - ((i + 1) % 2), min(y + h - 1, y1 - 1),
                [PEDRA, PEDRA2][rng.randint(0, 1)], l=.3, d=.4, tex=.3)
            y += h
            i += 1
    elif n == 4:
        F.part(R(x - 1, y0, x + w + 1, y1), REJ, ol='#3a2218')
        y, i = y0 + 1, 0
        while y < y1 - 1:
            if i % 2:
                blk(F, x - 1, y, x + 4, y + 4, TIJ2, tex=.2); blk(F, x + 5, y, x + w + 1, y + 4, TIJ, tex=.2)
            else:
                blk(F, x - 1, y, x + w + 1, y + 4, [TIJ, TIJ2][rng.randint(0, 1)], tex=.2)
            y += 5
            i += 1
        for yb in (y0, y1 - 6):
            F.part(R(x - 2, yb, x + w + 2, yb + 4), METAL)
            F.px(x, yb + 2, REBITE); F.px(x + w, yb + 2, REBITE)
    else:
        F.part(R(x, y0, x + w, y1), LUA, ol='#0a060c', tex=.2)
        for yy in range(y0 + 10, y1 - 6, 12):
            F.line(x + 1, yy, x + w - 1, yy, '#1a1420')
        F.part(R(x - 2, y0, x + w + 2, y0 + 5), OURO, ol='#3a2808')
        F.part(R(x - 2, y1 - 5, x + w + 2, y1), OURO2, ol='#3a2808')
        runa(F, x + w / 2 - 2, (y0 + y1) / 2 - 4, k=int(x) % 5, a=60)


# ---------------- pisos ----------------

def piso(F, n, x0, y0, x1, y1, rng):
    """laje do chão da construção: topo + borda da frente (3 px)."""
    if n == 1:
        F.part(R(x0, y0, x1, y1), '#5a4a3c', tex=.45, ol='#1e1610')
        for _ in range(int((x1 - x0) * (y1 - y0) / 220)):
            x, y = rng.randint(x0 + 2, x1 - 3), rng.randint(y0 + 2, y1 - 3)
            F.px(x, y, ['#7a6a52', '#3e3226', '#8a7a5a'][rng.randint(0, 2)])
        for k in range(2):  # palete velho
            px0 = rng.randint(x0 + 10, x1 - 50)
            py0 = rng.randint(y0 + 4, y1 - 16)
            for j in range(3):
                blk(F, px0, py0 + j * 4, px0 + 36, py0 + j * 4 + 3, TABUA2 if j % 2 else TABUA, tex=.2)
    elif n == 2:
        F.part(R(x0, y0, x1, y1), MADESC, ol='#1e1208')
        y = y0 + 1
        i = 0
        while y < y1 - 1:
            blk(F, x0 + 1, y, x1 - 1, min(y1 - 1, y + 6), [TABUA, TABUA2, mix(C(TABUA), C(TABUA2), .5)][i % 3], tex=.25)
            xx = x0 + rng.randint(10, 40)
            while xx < x1 - 4:
                F.line(xx, y, xx, min(y1 - 2, y + 5), MADESC)
                F.px(xx + 2, y + 3, PREGO)
                xx += rng.randint(30, 60)
            y += 7
            i += 1
    elif n == 3:
        F.part(R(x0, y0, x1, y1), ARG, ol='#3e3a36', tex=.2)
        y = y0 + 1
        while y < y1 - 2:
            h = rng.randint(9, 14)
            ye = min(y1 - 1, y + h)
            x = x0 + 1 - rng.randint(0, 12)
            while x < x1 - 1:
                xe = min(x1 - 1, x + rng.randint(14, 26))
                blk(F, max(x0 + 1, x), y, xe - 1, ye - 1, [PEDRA, PEDRA2, '#86827b'][rng.randint(0, 2)], l=.25, d=.3, tex=.35)
                x = xe
            y = ye
    elif n == 4:
        F.part(R(x0, y0, x1, y1), '#85827c', ol='#2a2622', tex=.3)
        for _ in range(3):
            cx, cy = rng.randint(x0 + 20, x1 - 20), rng.randint(y0 + 6, y1 - 6)
            tint_mask(F, F.mask(ell(cx, cy, rng.randint(6, 12), 3)), .4, '#2a2a2e')
        for xx in range(x0 + 30, x1, 40):
            F.line(xx, y0 + 1, xx - 3, y1 - 2, '#6a6762')
        F.part(R(x0, y1 - 5, x1, y1), TIJ2, ol='#3a2218')
        for xx in range(x0 + 1, x1 - 1, 9):
            blk(F, xx, y1 - 4, xx + 8, y1 - 1, [TIJ, TIJ2][(xx // 9) % 2])
    else:
        F.part(R(x0, y0, x1, y1), LUA, ol='#0a060c')
        s = 12
        for yy in range(y0 + 1, y1 - 4, s):
            for xx in range(x0 + 1, x1 - 1, s):
                c = LUA2 if ((xx - x0) // s + (yy - y0) // s) % 2 else LUA
                blk(F, xx, yy, min(x1 - 1, xx + s - 1), min(y1 - 5, yy + s - 1), c, l=.15, d=.35, tex=.2)
        F.part(R(x0, y1 - 5, x1, y1), OURO2, ol='#3a2808')
        F.line(x0, y1 - 4, x1 - 1, y1 - 4, OURO)
    # borda da frente
    F.line(x0, y1, x1 - 1, y1, dk('#3a2a20', .4))


# ---------------- dano ----------------

def rachaduras(F, bbox, n, rng):
    x0, y0, x1, y1 = bbox
    sol = F.a[..., 3] > 0
    inner = sol & shift(sol, 2, 0) & shift(sol, -2, 0) & shift(sol, 0, 2) & shift(sol, 0, -2)
    for _ in range(n):
        for _t in range(60):
            x, y = rng.randint(x0, x1 - 1), rng.randint(y0, y1 - 1)
            if 0 <= x < F.w and 0 <= y < F.h and inner[y, x]:
                break
        else:
            continue
        ang = math.radians(rng.uniform(50, 130))
        fx, fy = float(x), float(y)
        L = rng.randint(9, 20)
        for s in range(L):
            fx += math.cos(ang)
            fy += math.sin(ang)
            ang += math.radians(rng.uniform(-40, 40))
            ix, iy = int(round(fx)), int(round(fy))
            if not (0 <= ix < F.w and 0 <= iy < F.h) or not inner[iy, ix]:
                break
            F.a[iy, ix, :3] = (16, 8, 12)
            if 0 <= iy - 1 and inner[iy - 1, ix - 1]:
                F.a[iy - 1, ix - 1, :3] = np.clip(mix(F.a[iy - 1, ix - 1, :3].astype(float), MOON, .3), 0, 255)
            if s > 4 and rng.random() < .15:
                bx, by = ix, iy
                ba = ang + math.radians(rng.choice([-60, 60]))
                for _b in range(rng.randint(3, 6)):
                    bx += math.cos(ba); by += math.sin(ba)
                    jx, jy = int(round(bx)), int(round(by))
                    if 0 <= jx < F.w and 0 <= jy < F.h and inner[jy, jx]:
                        F.a[jy, jx, :3] = (16, 8, 12)


def fuligem(F, cx, cy, rx, ry, t=.62):
    sol = F.a[..., 3] > 0
    m = F.mask(ell(cx, cy, rx, ry)) & sol
    mi = F.mask(ell(cx, cy, rx * .72, ry * .72)) & sol
    yy, xx = np.mgrid[0:F.h, 0:F.w]
    ring = m & ~mi & ((xx + yy) % 2 == 0)
    tint_mask(F, mi, t, FULIGEM)
    tint_mask(F, ring, t * .8, FULIGEM)


def peca_solta(F, n, x, y, rng):
    """uma peça do material solta/caída perto de (x, y) (y = chão)."""
    if n == 1:
        F.part(poly((x - 8, y - 34), (x + 8, y - 36), (x + 10, y - 22), (x + 6, y - 14), (x + 3, y - 18), (x, y - 10),
                    (x - 3, y - 17), (x - 7, y - 12)), LONA2, tex=.25, ol='#1a2414')
        F.part(R(x - 4, y - 30, x + 4, y - 24), REMENDO, ol='#3e3420')
        F.line(x + 9, y - 36, x + 12, y - 26, CORDA); F.line(x + 12, y - 26, x + 11, y - 20, CORDA)
    elif n == 2:
        F.part(rot(R(x - 4, y - 30, x + 3, y), x, y, 24), TABUA, tex=.25, ol='#24160c')
        F.px(x - 6, y - 24, PREGO); F.px(x + 4, y - 4, PREGO)
        F.part(rot(R(x + 6, y - 7, x + 26, y - 1), x + 16, y - 4, -8), TABUA2, tex=.25, ol='#24160c')
    elif n == 3:
        for (dx, dy, w, h, a) in ((0, -4, 13, 8, 8), (12, -3, 10, 7, -15), (6, -10, 9, 7, 20)):
            F.part(chunk(x + dx, y + dy, w, h, a, rng), [PEDRA, PEDRA2][rng.randint(0, 1)], tex=.35, ol='#2e2a26')
    elif n == 4:
        F.part(poly((x - 12, y - 16), (x + 6, y - 22), (x + 12, y - 12), (x + 2, y - 4), (x - 10, y - 6)), CHAPA, ol='#22282c', tex=.1,
               marks=[(ell(x, y - 12, 5, 3), FERRUGEM)])
        for k in range(-10, 10, 4):
            F.line(x + k, y - 18 + k * .2, x + k + 4, y - 6 + k * .1, CHAPA2)
        for (dx, dy, a) in ((14, -3, 10), (20, -2, -6), (17, -7, 25)):
            F.part(chunk(x + dx, y + dy, 9, 4, a, rng, .4), TIJ, ol='#3a1408')
    else:
        F.part(chunk(x, y - 7, 18, 12, 14, rng), LUA2, tex=.3, ol='#0a060c')
        F.part(chunk(x + 3, y - 13, 16, 3, 14, rng, .3), OURO2, ol='#3a2808')
        F.part(chunk(x + 14, y - 3, 9, 6, -20, rng), LUA, ol='#0a060c')


def danificar(F, n, bbox, rng, fire, smoke=None, loose=None, soot=3, cracks=6, red=False):
    x0, y0, x1, y1 = bbox
    rachaduras(F, bbox, cracks, rng)
    for _ in range(soot):
        fuligem(F, rng.randint(x0 + 10, x1 - 10), rng.randint(y0 + 6, y1 - 6), rng.randint(10, 22), rng.randint(6, 12))
    if loose is not None:
        peca_solta(F, n, loose[0], loose[1], rng)
    fx, fy = fire
    fuligem(F, fx, fy - 6, 12, 9, .7)
    fogo(F, fx, fy, s=1.0, red=red)
    sx, sy = smoke if smoke else (fx, fy - 18)
    fumaca(F, sx, sy, rng, n=5)


# ---------------- escombros ----------------
MOUND = {1: '#5a4c3e', 2: '#5e4a38', 3: '#77716a', 4: '#7a5244', 5: '#2a2430'}


def escombros(F, n, x0, x1, gy, hmax, rng, k=None, beams=2, smoke=True):
    W = x1 - x0
    prof = []
    N = 24
    for i in range(N + 1):
        t = i / N
        h = hmax * (math.sin(math.pi * t) ** .7) * rng.uniform(.82, 1.08)
        prof.append((x0 + W * t, gy - h))
    F.part([prof + [(x1, gy), (x0, gy)]], MOUND[n], tex=.45, ol='#1a1214')

    def hy(x):
        t = min(1, max(0, (x - x0) / W))
        return gy - hmax * (math.sin(math.pi * t) ** .7)
    k = k or int(W / 3.2)
    pieces = []
    for _ in range(k):
        x = rng.uniform(x0 + 6, x1 - 6)
        top = hy(x) + 3
        y = rng.uniform(top, gy - 2)
        pieces.append((y, x))
    pieces.sort()
    for (y, x) in pieces:
        a = rng.uniform(-50, 50)
        if n == 1:
            r = rng.random()
            if r < .55:
                w, h = rng.uniform(10, 20), rng.uniform(6, 11)
                shp = [[(x + rng.uniform(-w, w) * .5, y + rng.uniform(-h, h) * .5) for _ in range(5)]]
                shp = [sorted(shp[0], key=lambda p: math.atan2(p[1] - y, p[0] - x))]
                F.part(shp, [LONA, LONA2, LONAZ, REMENDO][rng.randint(0, 3)], tex=.25)
            elif r < .8:
                F.part(limb(x - 8, y + rng.uniform(-3, 3), x + 8, y + rng.uniform(-3, 3), 3), ESTACA, tex=.2)
            else:
                F.part(chunk(x, y, rng.uniform(8, 14), rng.uniform(5, 8), a, rng), SUCATA, tex=.3,
                       marks=[(ell(x, y, 3, 2), FERRUGEM)])
        elif n == 2:
            L = rng.uniform(12, 28)
            F.part(chunk(x, y, L, rng.uniform(4, 6), a * .7, rng, .6), [TABUA, TABUA2, RIPA][rng.randint(0, 2)], tex=.3, ol='#24160c')
            if rng.random() < .5:
                F.px(x + rng.uniform(-4, 4), y, PREGO)
        elif n == 3:
            if rng.random() < .75:
                F.part(chunk(x, y, rng.uniform(7, 13), rng.uniform(5, 9), a, rng, 1.4), [PEDRA, PEDRA2, '#9a958c'][rng.randint(0, 2)],
                       tex=.35, ol='#2e2a26')
            else:
                F.part(chunk(x, y, rng.uniform(5, 8), 3, a, rng, .4), [TELHA, TELHA2][rng.randint(0, 1)], ol='#3a1408')
        elif n == 4:
            r = rng.random()
            if r < .6:
                F.part(chunk(x, y, 9, 4.5, a, rng, .4), [TIJ, TIJ2][rng.randint(0, 1)], tex=.2, ol='#3a1408')
            elif r < .85:
                w = rng.uniform(14, 22)
                sh = chunk(x, y, w, rng.uniform(6, 9), a * .5, rng, 2)
                F.part(sh, [CHAPA, CHAPA2][rng.randint(0, 1)], ol='#22282c',
                       marks=[(ell(x + 2, y, 4, 2), FERRUGEM)])
                for dx in range(int(-w / 2) + 2, int(w / 2) - 1, 3):
                    F.px(x + dx, y - 1, CHAPA2); F.px(x + dx, y, CHAPA2)
            else:
                F.part(limb(x - 9, y - 2, x + 9, y + 2, 2.5), METAL, ol='#22282c')
        else:
            r = rng.random()
            if r < .6:
                F.part(chunk(x, y, rng.uniform(9, 16), rng.uniform(6, 10), a, rng, 1.5), [LUA, LUA2][rng.randint(0, 1)], tex=.3, ol='#0a060c')
            elif r < .8:
                F.part(chunk(x, y, rng.uniform(10, 16), 3, a * .5, rng, .3), [OURO, OURO2][rng.randint(0, 1)], ol='#3a2808')
            else:
                F.part(chunk(x, y, 7, 4, a, rng, .5), ARDOSIA, ol='#06040a')
    # vigas queimadas
    for b in range(beams):
        bx = x0 + W * (.25 + .5 * b / max(1, beams - 1)) + rng.uniform(-10, 10)
        by = hy(bx) + 6
        ang = rng.uniform(-35, 35)
        L = rng.uniform(40, 62)
        dx, dy = math.cos(math.radians(ang)) * L / 2, math.sin(math.radians(ang)) * L / 2 - 8
        F.part(limb(bx - dx, by - dy, bx + dx, by + dy, 6, 5), VIGA, tex=.4, ol='#0a0604', light=.12)
        for j in range(5):
            t = rng.uniform(.1, .9)
            ex, ey = bx - dx + 2 * dx * t, by - dy + 2 * dy * t
            F.px(ex, ey, '#ff7a2a'); F.px(ex + 1, ey, '#c84a1a')
            F.px(ex, ey - 1, '#4a3020')
    brasas(F, x0 + 10, gy - hmax * .7, x1 - 10, gy - 4, rng, k=int(W / 8), red=(n == 5))
    glow(F, (x0 + x1) / 2, gy - hmax * .4, min(W * .3, hmax * .8), '#ff6a2a' if n < 5 else '#ff3a3a', alpha=40)
    if n == 5:
        runa(F, x0 + W * .6, gy - hmax * .45, k=2, a=50)
    if smoke:
        fumaca(F, x0 + W * .35, gy - hmax - 4, rng, n=5, s=1.1)
        fumaca(F, x0 + W * .68, gy - hmax * .8 - 4, rng, n=4)


# ---------------- objetos de função ----------------

def toco(F, cx, top, bot, rx=13):
    F.part(R(cx - rx, top, cx + rx, bot) + ell(cx, bot, rx, 3), MADESC, tex=.35, ol='#1a0e06')
    for xx in range(int(cx - rx + 3), int(cx + rx - 1), 4):
        F.line(xx, top + 3, xx + (xx % 3) - 1, bot - 1, '#3a2414')
    F.part(ell(cx, top, rx, 4.5), '#b08a5a', ol='#3a2414', shade=False)
    F.flat(ell(cx, top, rx * .6, 2.6), '#9a744a')
    F.flat(ell(cx, top, rx * .25, 1.2), '#7d5a36')


def bigorna(F, cx, ty, n):
    """ty = topo da face da bigorna."""
    if n == 1:
        F.part(R(cx - 19, ty + 8, cx + 19, ty + 12), FERRUGEM, ol='#1a1010', tex=.3)
        F.part(R(cx - 4, ty + 4, cx + 4, ty + 9), FERRO, ol='#141418')
        F.part(R(cx - 18, ty, cx + 18, ty + 5), FERRO2, ol='#141418', tex=.2,
               marks=[(R(cx + 6, ty + 2, cx + 14, ty + 5), FERRUGEM)])
        F.line(cx - 16, ty + 1, cx + 14, ty + 1, '#c0c4cc')
        return
    body = [[(cx - 9, ty + 5), (cx + 12, ty + 5), (cx + 8, ty + 12), (cx + 14, ty + 19), (cx - 12, ty + 19), (cx - 6, ty + 12)]]
    F.part(body, FERRO, ol='#141418', tex=.15)
    F.part(poly((cx - 13, ty), (cx + 17, ty), (cx + 17, ty + 6), (cx - 13, ty + 6)) +
           poly((cx - 13, ty + .5), (cx - 28, ty + 3), (cx - 13, ty + 6)), FERRO2, ol='#141418', light=.35)
    F.line(cx - 22, ty + 2, cx + 15, ty + 1, '#c0c4cc')
    F.px(cx + 12, ty + 2, '#202024'); F.px(cx + 13, ty + 2, '#202024')
    if n == 5:
        F.part(R(cx - 12, ty + 6, cx + 16, ty + 8), OURO, ol='#3a2808', shade=False)
        F.px(cx, ty + 14, RUNA2); F.px(cx + 1, ty + 13, RUNA2); F.px(cx - 1, ty + 13, RUNA2)
        glow(F, cx, ty + 13, 8, '#ff4040', 60)


def martelo(F, x, y, ang=-30, s=1.0):
    F.part(rot(R(x - 1.5, y - 14 * s, x + 1.5, y), x, y, ang), RIPA, ol='#24160c')
    hx, hy = x + math.sin(math.radians(ang)) * 14 * s, y - math.cos(math.radians(ang)) * 14 * s
    F.part(rot(R(hx - 5 * s, hy - 2.5, hx + 5 * s, hy + 2.5), hx, hy, ang), FERRO2, ol='#141418')


def barril(F, cx, top, bot, w, kind, agua=True):
    hw = w / 2
    if kind == 'tambor':
        F.part(R(cx - hw, top, cx + hw, bot) + ell(cx, bot, hw, 3), SUCATA, tex=.3, ol='#1e1c1a',
               marks=[(ell(cx - hw * .3, bot - 8, 5, 4), FERRUGEM), (ell(cx + hw * .5, top + 9, 3, 5), FERRUGEM)])
        for yy in (top + 6, bot - 6):
            F.line(cx - hw + 1, yy, cx + hw - 1, yy, dk(SUCATA, .35))
            F.line(cx - hw + 1, yy + 1, cx + hw - 1, yy + 1, lt(SUCATA, .2))
        rim = '#8a8984'
    elif kind == 'madeira':
        pts = []
        for i in range(13):
            t = i / 12
            pts.append((cx - hw - 2 * math.sin(math.pi * t), top + (bot - top) * t))
        for i in range(13):
            t = 1 - i / 12
            pts.append((cx + hw + 2 * math.sin(math.pi * t), top + (bot - top) * t))
        F.part([pts], TABUA, tex=.25, ol='#24160c')
        for xx in np.arange(cx - hw + 5, cx + hw - 2, 5):
            F.line(xx, top + 2, xx, bot - 1, dk(TABUA, .35))
        for yy in (top + 5, (top + bot) / 2, bot - 5):
            F.part(R(cx - hw - 2, yy - 1.5, cx + hw + 2, yy + 1.5), FERRO, ol='#141418', shade=False)
            F.px(cx - hw + 3, yy, REBITE)
        rim = TABUA2
    elif kind == 'metal':
        F.part(R(cx - hw, top, cx + hw, bot) + ell(cx, bot, hw, 3), '#4f6a7a', tex=.15, ol='#141c22')
        for yy in (top + 7, bot - 7):
            F.part(R(cx - hw, yy - 1.5, cx + hw, yy + 1.5), METAL, ol='#141c22', shade=False)
            for xx in np.arange(cx - hw + 3, cx + hw, 5):
                F.px(xx, yy, REBITE)
        F.line(cx - hw + 2, top + 2, cx - hw + 2, bot - 2, '#7a98a8')
        rim = '#6a8494'
    else:
        F.part(R(cx - hw, top, cx + hw, bot) + ell(cx, bot, hw, 3), LUA2, tex=.25, ol='#0a060c')
        for yy in (top + 5, bot - 6):
            F.part(R(cx - hw - 1, yy - 1.5, cx + hw + 1, yy + 1.5), OURO, ol='#3a2808', shade=False)
        runa(F, cx - 2, (top + bot) / 2 - 4, k=3, a=60)
        rim = OURO2
    F.part(ell(cx, top, hw, 4), rim, ol='#1a1214', shade=False)
    if agua:
        F.flat(ell(cx, top + .5, hw - 2, 2.6), '#2f5a7a')
        F.flat(ell(cx - 2, top, hw * .45, 1.2), AGUA)
        F.px(cx - hw * .4, top - .5, AGUA2)


def engrenagem(F, cx, cy, r, col=METAL):
    pts = []
    for i in range(32):
        a = 2 * math.pi * i / 32
        rr = r if (i // 2) % 2 == 0 else r * .78
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * .7))
    F.part([pts], col, ol='#141418', tex=.15, marks=[(ell(cx + 2, cy + 1, r * .4, r * .3), FERRUGEM)])
    F.flat(ell(cx, cy, r * .28, r * .2), '#1a1a1e')


def pneu(F, cx, cy, rx, ry):
    F.part(ell(cx, cy, rx, ry), '#2b2a2e', ol='#0c0c0e', tex=.3, light=.18)
    F.flat(ell(cx, cy - ry * .1, rx * .52, ry * .45), '#141216')
    for i in range(10):
        a = 2 * math.pi * i / 10
        F.px(cx + rx * .8 * math.cos(a), cy + ry * .8 * math.sin(a), '#46444a')


def sucata_monte(F, cx, gy, w, k, rng):
    items = []
    for i in range(k):
        x = cx + rng.uniform(-w / 2, w / 2) * (1 - i / (k * 1.6))
        y = gy - 2 - rng.uniform(0, 12) * (i / k + .3)
        items.append((y, x, rng.randint(0, 5)))
    items.sort()
    for (y, x, t) in items:
        a = rng.uniform(-30, 30)
        if t == 0:
            F.part(chunk(x, y, rng.uniform(12, 18), rng.uniform(7, 10), a, rng, 1.5), SUCATA, tex=.3,
                   marks=[(ell(x + 2, y, 4, 3), FERRUGEM)])
        elif t == 1:
            F.part(limb(x - 9, y + 2, x + 9, y - 2, 4), METAL, ol='#141418')
            F.flat(ell(x + 9, y - 2, 1.4, 1.4), '#141418')
        elif t == 2:
            engrenagem(F, x, y - 2, rng.uniform(5, 7))
        elif t == 3:
            F.part(chunk(x, y, 14, 8, a, rng, 1), CHAPA, ol='#22282c')
            for dx in range(-6, 7, 3):
                F.px(x + dx, y, CHAPA2)
        elif t == 4:
            F.part(chunk(x, y, 10, 6, a, rng, .5), FERRUGEM, tex=.4)
        else:
            F.part(limb(x - 7, y, x + 7, y - 4, 2.5), '#9a9ca2', ol='#141418')


def lampada(F, x, y, fio_top):
    F.line(x, fio_top, x, y - 4, '#1a1a1e')
    F.part(poly((x - 5, y - 1), (x - 2, y - 5), (x + 2, y - 5), (x + 5, y - 1)), METAL, ol='#141418')
    F.part(ell(x, y + 1.5, 2.5, 2.5), LAMP, shade=False, ol='#6a4a10')
    F.px(x - 1, y + 1, '#fff4c8')
    glow(F, x, y + 2, 46, LAMP, alpha=96)


def lampiao(F, x, y, red=False):
    F.part(R(x - 3, y - 2, x + 3, y + 7), '#e8a838' if not red else RUNA2, shade=False, ol='#3a2208')
    F.part(R(x - 4, y - 4, x + 4, y - 1), FERRO if not red else OURO, ol='#141418')
    F.part(R(x - 4, y + 7, x + 4, y + 9), FERRO if not red else OURO, ol='#141418')
    F.line(x - 3, y - 2, x - 3, y + 7, '#2a2a2e'); F.line(x + 3, y - 2, x + 3, y + 7, '#2a2a2e')
    F.px(x, y + 2, '#fff0b0' if not red else '#ffd0d0'); F.px(x, y + 3, '#ffd070' if not red else '#ff9090')
    F.line(x - 2, y - 6, x + 2, y - 6, '#2a2a2e')
    glow(F, x, y + 3, 30, '#ffb04a' if not red else '#ff3a3a', alpha=84)


def bandeira(F, x, ytop, ybot):
    F.part(R(x - 1, ytop, x + 1, ybot), OURO2, ol='#3a2808')
    F.part(ell(x, ytop - 1, 2, 2), OURO, ol='#3a2808', shade=False)
    pts = [(x + 1, ytop + 2)]
    for i in range(9):
        pts.append((x + 2 + i * 2.5, ytop + 2 + math.sin(i * .8) * 1.5))
    pts += [(x + 24, ytop + 9), (x + 18, ytop + 12)]
    for i in range(8, -1, -1):
        pts.append((x + 2 + i * 2.2, ytop + 15 + math.sin(i * .8 + 1) * 1.5))
    F.part([pts], RUNA, ol='#3a0810', tex=.1)
    F.part(ell(x + 10, ytop + 8.5, 3, 3), OURO, ol='#3a2808', shade=False)
    F.flat(ell(x + 11.2, ytop + 7.8, 2.4, 2.4), RUNA)
    glow(F, x + 12, ytop + 9, 16, '#ff3a3a', 50)


# ---------------- finalização (sombra no chão + sombra projetada) ----------------

def final(F, gy, cx, rx, cast=True):
    lay = shadow_layer(cx + 4, rx, 4.5, 95, F.w, F.h, gy)
    lay[..., :3] = (30, 18, 46)
    if cast:
        sil = F.a[..., 3] > 0
        sh = shift(sil, 6, 4) & ~sil
        yy = np.mgrid[0:F.h, 0:F.w][0]
        sh &= (yy <= gy + 6)
        lay[sh, :3] = (30, 18, 46)
        lay[sh, 3] = np.maximum(lay[sh, 3], 80)
    return compose(F, shadow=lay)


# =====================================================================
#                           SERRALHERIA 2×2
# =====================================================================

def forja(F, n, rng):
    x0, x1, top, bot = 30, 94, 160, 204
    cx = (x0 + x1) / 2
    red = n == 5
    # coifa (sobe até o telhado)
    hood = [[(x0 + 8, 150), (x1 - 8, 150), (cx + 9, 112), (cx - 9, 112)]]
    if n == 1:
        F.part(hood, SUCATA, tex=.3, ol='#1e1c1a', marks=[(ell(cx + 6, 132, 5, 6), FERRUGEM)])
        for (px, py) in [(cx - 12, 146), (cx + 12, 146), (cx - 6, 120), (cx + 6, 120)]:
            F.px(px, py, '#b0aea6')
    elif n == 2:
        F.part(hood, '#8a5a3a', tex=.35, ol='#2a160c')
        F.part(R(x0 + 6, 146, x1 - 6, 151), TABUA2, ol='#24160c')
    elif n == 3:
        F.part(hood, ARG, ol='#3e3a36')
        for j, yy in enumerate(range(114, 150, 7)):
            t = (yy - 112) / 38.
            hw = 9 + (cx - 9 - (x0 + 8)) * t
            xs = cx - hw
            xx = xs - (4 if j % 2 else 0)
            while xx < cx + hw:
                blk(F, max(xs, xx), yy, min(cx + hw, xx + 12) - 1, yy + 6, [PEDRA, PEDRA2][rng.randint(0, 1)], tex=.3)
                xx += 12
    elif n == 4:
        F.part(hood, CHAPA, tex=.1, ol='#22282c', marks=[(ell(cx - 8, 140, 4, 3), FERRUGEM)])
        for yy in (124, 140):
            F.line(cx - 20, yy, cx + 20, yy, CHAPA2)
        for (px, py) in [(cx - 14, 146), (cx + 14, 146), (cx - 9, 124), (cx + 9, 124), (cx, 136)]:
            F.px(px, py, REBITE)
    else:
        F.part(hood, LUA2, tex=.25, ol='#0a060c')
        F.part(R(x0 + 6, 146, x1 - 6, 151), OURO, ol='#3a2808')
        F.part(R(cx - 10, 112, cx + 10, 116), OURO2, ol='#3a2808')
        runa(F, cx - 2, 126, k=1, a=70)
    # corpo
    if n == 1:
        barril(F, cx, top, bot, x1 - x0 - 8, 'tambor', agua=False)
        F.part(R(x0 + 1, bot - 4, x0 + 12, bot + 2), PEDRA2, ol='#2e2a26')
        F.part(R(x1 - 12, bot - 4, x1 - 1, bot + 2), PEDRA, ol='#2e2a26')
    elif n == 2:
        F.part(R(x0, top + 16, x1, bot), TABUA, ol='#24160c', tex=.2)
        for xx in range(x0 + 8, x1, 9):
            F.line(xx, top + 17, xx, bot - 1, MADESC)
        F.part(R(x0 + 2, top, x1 - 2, top + 17), '#8a5a3a', tex=.35, ol='#2a160c')
        F.px(x0 + 4, top + 20, PREGO); F.px(x1 - 4, top + 20, PREGO)
        # fole
        F.part(poly((x0 - 8, top + 4), (x0 + 2, top + 9), (x0 + 2, top + 14), (x0 - 10, top + 22)), '#6b3f22', ol='#24120a', tex=.3)
        F.part(limb(x0 - 9, top + 3, x0 - 14, top - 4, 3), TABUA2)
    elif n == 3:
        parede_pedra(F, x0, top, x1, bot, rng)
    elif n == 4:
        parede_tijolo(F, x0, top, x1, bot, rng, bands=[top + 2])
        F.part(R(x0 + 22, bot - 14, x1 - 22, bot - 2), '#1a1010', ol='#0a0606')
        F.flat(R(x0 + 24, bot - 8, x1 - 24, bot - 3), BRASA)
    else:
        parede_lunar(F, x0, top, x1, bot, rng, runas=1)
    # brasa no topo
    F.part(ell(cx, top, (x1 - x0) / 2 - 5, 6), '#2a1410' if not red else '#1a0a10', ol='#0a0404', shade=False)
    for _ in range(26):
        a = rng.uniform(0, 2 * math.pi); r = rng.uniform(0, 1) ** .6
        px, py = cx + math.cos(a) * r * 24, top + math.sin(a) * r * 4.5
        F.px(px, py, [BRASA, '#ffd06a', '#c84a1a'][rng.randint(0, 2)] if not red else [RUNA, RUNA2, '#ff9a9a'][rng.randint(0, 2)])
    if n >= 3:
        fogo(F, cx - 6, top + 1, s=.6 if n < 5 else 1.0, red=red, g=False)
        fogo(F, cx + 7, top + 2, s=.5 if n < 5 else .85, red=red, g=False)
    glow(F, cx, top - 6, 50, '#ff9a3a' if not red else '#ff3a3a', alpha=110)
    if n == 2:  # tenaz na brasa
        F.line(cx + 4, top - 1, x1 + 6, top - 9, '#2a2a2e'); F.line(cx + 4, top + 1, x1 + 6, top - 7, '#2a2a2e')


def chamine(F, n, rng, x=50, ytop=10, ybot=66):
    if n <= 2:
        F.part(R(x + 3, ytop + 6, x + 13, ybot), SUCATA, tex=.3, ol='#1e1c1a',
               marks=[(ell(x + 8, ybot - 14, 4, 6), FERRUGEM), (ell(x + 6, ytop + 18, 3, 3), FERRUGEM)])
        for yy in range(ytop + 14, ybot - 2, 12):
            F.line(x + 3, yy, x + 12, yy, '#2e2c2a')
        if n == 2:
            F.part(poly((x - 1, ytop + 7), (x + 8, ytop), (x + 17, ytop + 7)), CHAPA2, ol='#22282c')
        else:
            F.part(ell(x + 8, ytop + 6, 6, 2), '#1a1816', ol='#0a0a0a', shade=False)
        F.line(x + 2, ybot - 4, x - 6, ybot + 2, '#8a8984')
    elif n == 3:
        F.part(R(x, ytop, x + 18, ybot), ARG, ol='#3e3a36')
        y, i = ytop + 4, 0
        while y < ybot - 1:
            blk(F, x + (2 if i % 2 else 0), y, x + 10 + (2 if i % 2 else 0), y + 5, PEDRA, tex=.3)
            blk(F, x + 11 + (2 if i % 2 else 0), y, x + 18, y + 5, PEDRA2, tex=.3)
            y += 6
            i += 1
        F.part(R(x - 2, ytop - 2, x + 20, ytop + 3), PEDRA2, ol='#2e2a26')
        F.part(ell(x + 9, ytop - 1, 7, 1.6), '#1a1614', shade=False, outline=False)
    elif n == 4:
        parede_tijolo(F, x, ytop, x + 18, ybot, rng, bands=[ytop + 12])
        F.part(R(x - 2, ytop - 3, x + 20, ytop + 2), METAL, ol='#22282c')
        F.part(R(x + 2, ytop - 9, x + 16, ytop - 6), CHAPA2, ol='#22282c')
        F.line(x + 4, ytop - 6, x + 4, ytop - 3, METAL); F.line(x + 14, ytop - 6, x + 14, ytop - 3, METAL)
    else:
        F.part(R(x, ytop, x + 18, ybot), LUA, ol='#0a060c', tex=.25)
        for yy in range(ytop + 8, ybot, 9):
            F.line(x + 1, yy, x + 17, yy, '#1a1420')
        F.part(R(x - 2, ytop - 3, x + 20, ytop + 3), OURO, ol='#3a2808')
        for k in range(3):
            F.part(poly((x + 1 + k * 7, ytop - 3), (x + 4 + k * 7, ytop - 9), (x + 7 + k * 7, ytop - 3)), OURO, ol='#3a2808', shade=False)
        runa(F, x + 7, ytop + 20, k=4, a=70)
        glow(F, x + 9, ytop - 6, 14, '#ff3a3a', 90)
        for k in range(4):
            F.px(x + 6 + k * 3, ytop - 12 - k * 3, RUNA2, F.fx)


def ferramentas(F, n, x0, y0, rng):
    """painel de ferramentas penduradas na parede de fundo."""
    F.line(x0, y0, x0 + 46, y0, '#2a2a2e' if n != 2 else MADESC)
    F.line(x0, y0 + 1, x0 + 46, y0 + 1, '#5a5c62' if n != 2 else TABUA2)
    # martelo
    F.part(R(x0 + 3, y0 + 2, x0 + 5, y0 + 20), RIPA, ol='#24160c')
    F.part(R(x0, y0 + 2, x0 + 9, y0 + 6), FERRO2, ol='#141418')
    # tenaz
    F.line(x0 + 13, y0 + 2, x0 + 17, y0 + 24, '#2e3034'); F.line(x0 + 17, y0 + 2, x0 + 13, y0 + 24, '#2e3034')
    F.line(x0 + 14, y0 + 2, x0 + 18, y0 + 24, '#5a5c62')
    # ferradura
    pts = [(x0 + 25 + 5 * math.cos(a), y0 + 10 + 6 * math.sin(a)) for a in np.linspace(math.pi * .9, math.pi * 2.1, 12)]
    F.part(chain(pts, 3), FERRO2, ol='#141418')
    # serrote
    F.part(poly((x0 + 32, y0 + 4), (x0 + 38, y0 + 4), (x0 + 39, y0 + 26), (x0 + 33, y0 + 22)), REBITE, ol='#2a2e34')
    F.part(R(x0 + 31, y0 + 1, x0 + 39, y0 + 6), RIPA, ol='#24160c')
    for yy in range(y0 + 8, y0 + 24, 2):
        F.px(x0 + 39, yy, '#4a4e54')
    # chave inglesa
    F.part(limb(x0 + 44, y0 + 4, x0 + 44, y0 + 22, 2.5), METAL, ol='#141418')
    F.part(ell(x0 + 44, y0 + 4, 3, 3), METAL, ol='#141418')
    F.px(x0 + 44, y0 + 3, '#1a1a1e')


def bancada_morsa(F, n, rng, x0=148, x1=228, top=156):
    fy = top + 8
    legs_bot = 206
    if n == 1:
        for lx in (x0 + 4, x1 - 18):
            F.part(R(lx, fy, lx + 14, legs_bot), '#8a6a42', tex=.3, ol='#24160c')
            F.line(lx + 1, fy + 10, lx + 13, fy + 10, MADESC)
            F.line(lx + 1, fy + 22, lx + 13, fy + 22, MADESC)
        F.part(R(x0, top, x1, fy), SUCATA, tex=.3, ol='#1e1c1a', marks=[(ell(x0 + 50, top + 4, 8, 3), FERRUGEM)])
        F.part(R(x0, fy, x1, fy + 4), dk(SUCATA, .3), ol='#1e1c1a')
    elif n in (2, 3):
        if n == 2:
            for lx in (x0 + 4, x1 - 10):
                F.part(R(lx, fy, lx + 6, legs_bot), TABUA2, ol='#24160c', tex=.2)
            F.part(R(x0 + 6, legs_bot - 14, x1 - 6, legs_bot - 10), RIPA, ol='#24160c')
        else:
            for lx in (x0 + 2, x1 - 16):
                F.part(R(lx, fy, lx + 14, legs_bot), ARG, ol='#3e3a36')
                for j, yy in enumerate(range(fy + 1, legs_bot - 1, 8)):
                    blk(F, lx + (j % 2), yy, lx + 14 - ((j + 1) % 2), yy + 7, [PEDRA, PEDRA2][j % 2], tex=.3)
        blk(F, x0, top, x1, fy, TABUA, tex=.25)
        F.part(R(x0, top, x1, fy), TABUA, tex=.25, ol='#24160c')
        for yy in (top + 3, top + 6):
            F.line(x0 + 1, yy, x1 - 2, yy, dk(TABUA, .3))
        F.part(R(x0, fy, x1, fy + 5), TABUA2, ol='#24160c')
        F.px(x0 + 4, fy + 2, PREGO); F.px(x1 - 4, fy + 2, PREGO)
    elif n == 4:
        F.part(R(x0 + 2, fy + 4, x0 + 30, legs_bot), CHAPA2, ol='#22282c')
        for yy in (fy + 10, fy + 22, fy + 34):
            F.line(x0 + 4, yy, x0 + 28, yy, '#2a3034'); F.part(R(x0 + 12, yy + 3, x0 + 20, yy + 5), REBITE, ol='#2a3034', shade=False)
        F.part(R(x1 - 10, fy, x1 - 4, legs_bot), METAL, ol='#22282c')
        F.part(R(x0, top, x1, fy), '#9aa2a8', tex=.1, ol='#22282c')
        F.part(R(x0, fy, x1, fy + 5), METAL, ol='#22282c')
        for xx in range(x0 + 3, x1, 8):
            F.px(xx, fy + 2, REBITE)
    else:
        for lx in (x0 + 2, x1 - 16):
            F.part(R(lx, fy, lx + 14, legs_bot), LUA, ol='#0a060c', tex=.2)
            F.part(R(lx - 1, legs_bot - 4, lx + 15, legs_bot), OURO2, ol='#3a2808')
        F.part(R(x0, top, x1, fy), LUA2, tex=.25, ol='#0a060c')
        F.part(R(x0, fy, x1, fy + 5), OURO, ol='#3a2808')
        runa(F, x0 + 7, fy + 16, k=0, a=60)
    # morsa
    vx = x1 - 22
    F.part(R(vx, top - 10, vx + 14, top + 2), '#3e5a6e' if n >= 4 else FERRO, ol='#141418')
    F.part(R(vx + 5, top - 14, vx + 9, top - 9), FERRO2, ol='#141418')
    F.line(vx - 4, top - 6, vx + 18, top - 6, '#c0c4cc')
    F.px(vx - 5, top - 6, '#2a2a2e'); F.px(vx + 19, top - 6, '#2a2a2e')
    F.line(vx + 7, top - 10, vx + 7, top + 1, '#1a1a1e')
    # lima e alicate
    F.line(x0 + 8, top + 3, x0 + 26, top + 1, '#9a9ca2'); F.line(x0 + 26, top + 1, x0 + 31, top, RIPA)
    F.line(x0 + 34, top + 4, x0 + 42, top + 1, '#3e3e44'); F.line(x0 + 34, top + 2, x0 + 42, top + 4, '#3e3e44')
    if n == 4:  # esmeril elétrico
        ex = x0 + 52
        F.part(R(ex - 6, top - 9, ex + 6, top + 2), '#3e6a4e', ol='#141418')
        F.part(ell(ex - 9, top - 6, 3, 6), '#8a8478', ol='#141418'); F.part(ell(ex + 9, top - 6, 3, 6), '#8a8478', ol='#141418')
        F.px(ex, top - 5, REBITE)
        for k in range(9):
            a = math.radians(rng.uniform(-60, 10))
            r = rng.uniform(3, 14)
            F.px(ex + 12 + math.cos(a) * r, top - 6 + math.sin(a) * r * .6 + 4, ['#ffe07a', '#ffb040', '#fff4c8'][k % 3], F.fx)
        glow(F, ex + 12, top - 4, 12, '#ffd36a', 70)
        F.line(ex, top + 2, ex - 4, top + 6, '#1a1a1e')
        return (ex, top - 9)
    return None


def serralheria(n, estado):
    F = Frame(256, 256)
    rng = random.Random(1100 + n)
    drng = random.Random(1200 + n + estado * 7)
    gy = 244
    piso(F, n, 12, 178, 244, gy, rng)
    if estado == 2:
        rachaduras(F, (12, 178, 244, gy), 6, drng)
        if n >= 3:
            chamine(F, n, rng, x=48, ytop=96, ybot=170)
            for k in range(-4, 24):
                cut = 96 + 6 + int(4 * abs(math.sin(k * 1.3))) + (k % 3)
                if 0 <= 48 + k < 256:
                    F.a[:cut, 48 + k] = 0
            F.fx[:110, 30:80] = 0
            rachaduras(F, (44, 96, 70, 170), 3, drng)
            tint_rect(F, 40, 90, 72, 110, .35, (30, 20, 24))
        pilar(F, n, 16, 150, 210, rng)
        tint_rect(F, 10, 150, 30, 212, .55, (30, 16, 12))
        escombros(F, n, 22, 238, 232, 78, drng, beams=3)
        toco(F, 128, 220, 240)
        bigorna(F, 128, 203, n)
        martelo(F, 150, 238, ang=35)
        sucata_monte(F, 214, 242, 30, 5, drng)
        return final(F, gy, 128, 118)
    # parede de fundo (interior)
    parede(F, n, 22, 106, 234, 190, rng)
    tint_rect(F, 22, 106, 234, 190, .36)
    tint_rect(F, 22, 106, 234, 120, .25)
    ferramentas(F, n, 100, 120, rng)
    tint_rect(F, 98, 118, 148, 148, .15)
    # chão sob o telhado
    tint_rect(F, 14, 190, 242, 208, .3)
    forja(F, n, rng)
    grinder = bancada_morsa(F, n, rng)
    # pilares e telhado
    pilar(F, n, 14, 104, 214, rng)
    pilar(F, n, 234, 104, 214, rng)
    eave = telhado(F, n, 10, 36, 246, 102, rng)
    chamine(F, n, rng, x=50, ytop=10, ybot=64)
    # luz por nível
    if n == 2:
        lampiao(F, 222, 116)
    elif n == 3:
        lampiao(F, 128, 118)
        F.line(128, 106, 128, 113, '#1a1a1e')
    elif n == 4:
        lampada(F, 166, 124, int(eave))
        if grinder:
            F.line(grinder[0], grinder[1], 166, 127, '#1a1a1e')
    elif n == 5:
        lampiao(F, 222, 116, red=True)
        bandeira(F, 226, 2, 40)
    if n == 1:  # cordas da lona até estacas no chão
        for (rx, ry, sx) in ((12, eave - 2, 4), (244, eave - 2, 251)):
            F.line(rx, ry, sx, 236, CORDA)
            F.part(limb(sx, 232, sx + (1 if sx < 128 else -1), 241, 3, 3), ESTACA)
    # pátio
    btype = {1: 'tambor', 2: 'madeira', 3: 'madeira', 4: 'metal', 5: 'lunar'}[n]
    barril(F, 46, 208, 238, 26, btype)
    F.line(56, 206, 70, 196, '#2a2a2e'); F.line(57, 207, 71, 197, '#2a2a2e')  # tenaz no barril
    toco(F, 128, 220, 240)
    bigorna(F, 128, 203, n)
    martelo(F, 140, 203, ang=70, s=.8)
    sucata_monte(F, 204, 242, 60, 10 + n * 3, rng)
    if n >= 4:
        pneu(F, 236, 232, 9, 6)
    if n == 5:
        runa(F, 196, 226, k=3, a=50)
    if estado == 1:
        danificar(F, n, (14, 36, 242, 200), drng, fire=(200, 70), smoke=(200, 52), loose=(84, 240), soot=4, cracks=9, red=False)
        fuligem(F, 70, 140, 20, 12)
    return final(F, gy, 128, 118)


# =====================================================================
#                           COLETOR 1×1
# =====================================================================

def balde(F, cx, top, bot, w, col=SUCATA):
    hw = w / 2
    F.part(poly((cx - hw, top), (cx + hw, top), (cx + hw - 2, bot), (cx - hw + 2, bot)) + ell(cx, bot, hw - 2, 2), col, tex=.3,
           ol='#1e1c1a', marks=[(ell(cx + 3, bot - 4, 3, 2), FERRUGEM)])
    F.line(cx - hw + 1, top + 4, cx + hw - 1, top + 4, dk(col, .3))
    F.part(ell(cx, top, hw, 3), lt(col, .1), ol='#1e1c1a', shade=False)
    F.flat(ell(cx, top + .5, hw - 2, 1.8), '#2f5a7a')
    F.px(cx - 2, top, AGUA2)


def coletor(n, estado):
    F = Frame(128, 160)
    rng = random.Random(2100 + n)
    drng = random.Random(2200 + n + estado * 7)
    gy = 148
    if estado == 2:
        if n == 1:
            F.flat(ell(70, gy - 2, 22, 4), '#2f5a7a', alpha=255)
            escombros(F, 1, 18, 110, gy, 28, drng, beams=1)
            F.part(rot(poly((48, 126), (64, 126), (62, 144), (50, 144)), 56, 135, 80), SUCATA, ol='#1e1c1a', tex=.3)
        elif n == 2:
            F.flat(ell(66, gy - 1, 24, 4), '#2f5a7a')
            escombros(F, 2, 14, 114, gy, 32, drng, beams=1)
            for k in range(4):
                F.part(rot(R(70 + k * 6, 120, 75 + k * 6, 146), 72 + k * 6, 146, -50 + k * 12), TABUA if k % 2 else TABUA2, ol='#24160c', tex=.2)
            F.part(rot(R(60, 136, 92, 139), 76, 137, -12), FERRO, ol='#141418')
        elif n == 3:
            F.part(R(24, 122, 104, gy) + ell(64, gy, 40, 4), ARG, ol='#3e3a36')
            escombros(F, 3, 14, 114, gy, 40, drng, beams=1)
            F.flat(ell(30, gy - 1, 14, 3), '#2f5a7a')
        elif n == 4:
            escombros(F, 4, 14, 114, gy, 34, drng, beams=1)
            F.part(poly((40, 120), (94, 112), (104, 128), (98, 142), (44, 146), (34, 134)), CHAPA, ol='#22282c', tex=.1,
                   marks=[(ell(70, 132, 8, 4), FERRUGEM)])
            for xx in range(42, 98, 4):
                F.line(xx, 121 - (xx - 40) * .14, xx + 2, 144 - (xx - 40) * .05, CHAPA2)
            F.part(R(46, 126, 96, 129), METAL, ol='#22282c')
            F.flat(ell(76, gy - 1, 26, 3), '#2f5a7a')
        else:
            escombros(F, 5, 12, 116, gy, 40, drng, beams=1)
            F.part(chunk(52, 130, 30, 6, -14, drng, .3), OURO, ol='#3a2808')
            glow(F, 70, 136, 20, '#bfeaff', 60)
            F.flat(ell(80, gy - 1, 18, 3), '#8fd0f0')
        return final(F, gy, 64, 52)

    if n == 1:
        stakes = [((30, 128), (32, 56)), ((98, 128), (96, 56)), ((18, 146), (21, 74)), ((110, 146), (106, 74))]
        for (b, t) in stakes[:2]:
            F.part(limb(t[0], t[1], b[0], b[1], 4, 5), ESTACA, tex=.3)
        balde(F, 64, 116, 142, 26)
        # garrafas PET
        for (bx, c) in ((96, '#7ab0b0'), (102, '#9ac8a0')):
            F.part(R(bx - 3, 128, bx + 3, 144) + ell(bx, 127, 2, 3), c, ol='#1e3a3a', light=.4)
            F.part(R(bx - 1, 122, bx + 1, 126), '#3a8a4a', ol='#123a1a')
        F.part(R(26, 136, 34, 145), '#a8a8a0', ol='#2a2a28', marks=[(R(26, 139, 34, 142), RUNA)])
        # lona funil
        tl, tr, br, bl = (32, 56), (96, 56), (106, 74), (21, 74)
        cen = (64, 86)
        F.part([[tl, tr, br, cen]], LONA2, tex=.2)
        F.part([[tl, cen, bl]], LONA, tex=.25)
        F.part([[tl, tr, cen]], lt(LONA, .08), tex=.25)
        F.part([[bl, cen, br]], LONA, tex=.25)
        F.part([[tr, br, cen]], LONA2, tex=.25)
        F.part(R(40, 60, 54, 68), REMENDO, ol='#3e3420')
        for xx in range(41, 54, 2):
            F.px(xx, 61, '#d8c9a0')
        F.flat(ell(64, 84, 4, 2), '#1a2414')
        F.flat(ell(60, 72, 6, 2), '#2f5878')
        for yy in range(88, 114, 4):
            F.px(64, yy, AGUA2); F.px(64, yy + 1, AGUA)
        for (b, t) in stakes[2:]:
            F.part(limb(t[0], t[1], b[0], b[1], 4, 5), ESTACA, tex=.3)
        for p in (tl, tr, br, bl):
            F.part(ell(p[0], p[1], 2.5, 2), CORDA, ol='#3a2a14', shade=False)
        bbox = (14, 52, 114, 146)
    elif n == 2:
        for px_ in (24, 98):
            pilar(F, 2, px_, 46, 126, rng, w=7)
        telhado_ripa(F, 16, 26, 112, 50, rng)
        barril(F, 60, 92, 144, 44, 'madeira')
        # calha de tábua
        F.part(poly((96, 55), (104, 55), (74, 92), (68, 90)), TABUA2, ol='#24160c', tex=.2)
        F.line(100, 56, 72, 90, '#2f5a7a')
        for yy in (60, 76):
            F.px(96 - (yy - 56) * .8, yy, PREGO)
        for yy in range(93, 99, 2):
            F.px(71, yy, AGUA2)
        # torneira de pau e caneca
        F.part(R(36, 128, 42, 131), MADESC, ol='#1a0e06'); F.px(38, 133, AGUA2); F.px(38, 136, AGUA)
        F.part(R(78, 108, 86, 116), '#c9c3b0', ol='#2a2a28', marks=[(R(78, 111, 86, 112), '#3f6a8c')])
        F.line(86, 110, 88, 113, '#2a2a28')
        F.part(ell(26, gy - 2, 8, 3), '#2f5a7a', outline=False, shade=False)
        bbox = (16, 26, 112, 144)
    elif n == 3:
        for px_ in (20, 100):
            pilar(F, 3, px_, 52, 112, rng, w=9)
        telhado_telha(F, 14, 26, 114, 48, rng)
        # sarilho
        F.part(R(26, 62, 102, 68), TABUA2, ol='#24160c', tex=.2)
        F.part(limb(104, 65, 110, 72, 2), METAL); F.part(limb(110, 72, 112, 80, 2.5), RIPA)
        for xx in range(56, 70, 2):
            F.line(xx, 62, xx + 1, 68, CORDA)
        F.line(64, 68, 64, 82, CORDA)
        balde(F, 64, 84, 96, 14, '#7d5430')
        # cisterna redonda
        F.part(R(22, 102, 106, 142) + ell(64, 142, 42, 6) + ell(64, 102, 42, 10), ARG, ol='#3e3a36')
        for j, yy in enumerate(range(106, 146, 8)):
            xx = 22 + (j % 2) * 6
            while xx < 104:
                t = (xx + 6 - 64) / 42.
                c = [PEDRA, PEDRA2, '#86827b'][rng.randint(0, 2)]
                bow = 5 * (1 - min(1, t * t))
                blk(F, xx + 1, yy + bow, min(105, xx + 12), yy + bow + 6, c, tex=.3, l=.2 + .2 * (t < 0), d=.3 + .2 * (t > 0))
                xx += 12
        F.part(ell(64, 102, 42, 10), PEDRA, ol='#2e2a26', tex=.3)
        F.part(ell(64, 102, 34, 7), '#2f5a7a', ol='#2e2a26', shade=False)
        F.flat(ell(58, 101, 18, 3), AGUA)
        F.line(50, 100, 60, 100, AGUA2)
        tint_rect(F, 30, 95, 98, 100, .2)
        F.line(64, 96, 64, 102, CORDA)
        bbox = (14, 26, 114, 146)
    elif n == 4:
        # base de tijolo
        parede_tijolo(F, 30, 118, 98, 146, rng, bands=[118])
        F.part(R(26, 112, 102, 118), METAL, ol='#22282c')
        for xx in range(29, 100, 8):
            F.px(xx, 115, REBITE)
        # tanque
        F.part(R(30, 40, 98, 112) + ell(64, 112, 34, 5), CHAPA, ol='#22282c', tex=.1)
        for x in range(32, 97, 4):
            F.line(x, 42, x, 113, CHAPA2)
            F.line(x + 2, 42, x + 2, 113, lt(CHAPA, .2))
        tint_rect(F, 78, 40, 98, 117, .25)
        F.line(32, 42, 32, 112, lt(CHAPA, .45))
        for yy in (58, 84, 106):
            F.part(R(29, yy, 99, yy + 4), METAL, ol='#22282c')
            for xx in range(32, 98, 6):
                F.px(xx, yy + 2, REBITE)
        F.part(ell(50, 70, 8, 5), FERRUGEM, outline=False, shade=False)
        F.part(ell(64, 40, 34, 7), '#a8b0b6', ol='#22282c')
        F.part(poly((50, 36), (78, 36), (70, 44), (58, 44)), CHAPA2, ol='#22282c')
        F.flat(ell(64, 41, 6, 2), '#2f5a7a')
        F.px(62, 40, AGUA2)
        # escada
        for xx in (102, 110):
            F.line(xx, 46, xx, 146, '#3a3e44')
        for yy in range(52, 146, 8):
            F.line(102, yy, 110, yy, '#5a5e64')
        # cano e torneira
        F.part(R(22, 96, 26, 128), METAL, ol='#22282c')
        F.part(R(22, 94, 32, 98), METAL, ol='#22282c')
        F.part(R(16, 126, 26, 130), METAL, ol='#22282c')
        F.part(R(17, 122, 21, 126), RUNA, ol='#3a0810')
        F.px(17, 133, AGUA2); F.px(17, 137, AGUA)
        balde(F, 18, 140, 148, 12, '#4f6a7a')
        lampada(F, 86, 30, 22)
        F.part(limb(86, 22, 96, 36, 2), METAL)
        bbox = (20, 34, 108, 146)
    else:
        bandeira(F, 64, 8, 82)
        F.part(poly((54, 40), (60, 34), (66, 36), (62, 42), (58, 46)), OURO, ol='#3a2808', shade=False)  # lua crescente
        F.part(ell(62, 40, 4, 4), OURO, ol='#3a2808')
        F.flat(ell(64, 39, 3, 3.5), '#1c1822')
        # reservatório
        F.part(R(20, 96, 108, 140) + ell(64, 140, 44, 6) + ell(64, 96, 44, 10), LUA, ol='#0a060c')
        for j, yy in enumerate(range(100, 144, 11)):
            xx = 20 + (j % 2) * 8
            while xx < 106:
                t = (xx + 8 - 64) / 44.
                bow = 5 * (1 - min(1, t * t))
                blk(F, xx + 1, yy + bow, min(107, xx + 16), yy + bow + 9, [LUA, LUA2][rng.randint(0, 1)], tex=.3, l=.15, d=.35)
                xx += 16
        for yy in (108, 134):
            F.part([[(20 + i, yy + 5 * (1 - ((i - 44) / 44.) ** 2)) for i in range(0, 89, 4)] +
                    [(20 + i, yy + 3 + 5 * (1 - ((i - 44) / 44.) ** 2)) for i in range(88, -1, -4)]], OURO, ol='#3a2808')
        runa(F, 34, 116, k=0, a=70); runa(F, 62, 118, k=2, a=70); runa(F, 90, 116, k=4, a=70)
        F.part(ell(64, 96, 44, 10), OURO2, ol='#3a2808')
        F.line(24, 94, 104, 94, OURO)
        F.part(ell(64, 96, 36, 7), '#5ab0e0', ol='#1a3040', shade=False)
        F.flat(ell(60, 95, 22, 4), '#8fd0f0')
        F.flat(ell(56, 94, 9, 1.6), '#e8faff')
        glow(F, 64, 94, 40, '#bfeaff', alpha=110)
        for k in range(6):
            F.px(44 + k * 8, 86 - (k % 3) * 4, '#e8faff', F.fx)
        # bico dourado
        F.part(poly((104, 118), (116, 120), (116, 124), (104, 124)), OURO, ol='#3a2808')
        F.px(115, 128, '#8fd0f0'); F.px(115, 132, '#bfeaff')
        bbox = (20, 86, 108, 146)
    if estado == 1:
        danificar(F, n, bbox, drng, fire=(bbox[0] + 18, gy - 2), smoke=(bbox[0] + 20, gy - 22),
                  loose=(bbox[2] - 10, gy), soot=2, cracks=6)
        F.flat(ell(70, gy, 16, 2.5), '#2f5a7a' if n < 5 else '#8fd0f0')
        for yy in range(gy - 18, gy - 2, 4):
            F.px(76, yy, AGUA2)
    return final(F, gy, 64, 50)


# =====================================================================
#                              HORTA 2×1
# =====================================================================

def milho(F, x, base, h, rng, wilt=False, n=1):
    stalk = '#8fae4a' if not wilt else '#a08a4a'
    lean = rng.uniform(-2, 2) + (8 if wilt else 0)
    top = (x + lean, base - h * (.7 if wilt else 1))
    F.part(limb(x, base, top[0], top[1], 3.5, 2), stalk, ol='#1e3010')
    for i in range(5):
        t = .18 + i * .15
        px, py = x + (top[0] - x) * t, base + (top[1] - base) * t
        side = 1 if i % 2 else -1
        L = 17 - i * 1.5
        droop = 6 if wilt else 0
        pts = [(px, py), (px + side * L * .45, py - 5 + droop * .5), (px + side * L * .8, py - 3 + droop), (px + side * L, py + 3 + droop)]
        F.part(chain(pts, 3.6, 1), ('#6fae4a' if i % 2 else '#4f8a3a') if not wilt else ['#8a7a3a', '#9a8a4a'][i % 2], ol='#1e3010')
        if not wilt:
            F.px(px + side * L * .45, py - 5, '#9ad070')
    if h > 30:
        ex, ey = x + (top[0] - x) * .5 + 3, base + (top[1] - base) * .5
        F.part(ell(ex, ey, 3, 6, rot=15), '#e8c44a' if not wilt else '#a08a3a', ol='#5a3a08')
        for k in range(3):
            F.px(ex - 1, ey - 3 + k * 2, '#fff09a' if not wilt else '#b8a050')
        F.part(poly((ex - 3, ey + 5), (ex + 4, ey + 4), (ex + 2, ey - 3)), '#6fae4a' if not wilt else '#8a7a3a', ol='#1e3010')
        F.px(ex, ey - 7, '#c86a3a'); F.px(ex + 1, ey - 8, '#c86a3a'); F.px(ex - 1, ey - 8, '#c86a3a')
        if n == 5 and not wilt:
            F.part(ell(ex, ey, 2.8, 5.6, rot=15), RUNA, ol='#3a0810')
            F.px(ex - 1, ey - 2, RUNA2); F.px(ex - 1, ey, RUNA2)
            glow(F, ex, ey, 11, '#ff4040', 70)
    for k in range(4):
        F.line(top[0], top[1], top[0] + (k - 1.5) * 2.5, top[1] - 5, '#d8c070')


def macaxeira(F, x, base, h, rng, wilt=False, n=1):
    stem = '#9a4a3a'
    for b in range(3):
        a = math.radians(-90 + (b - 1) * 24 + rng.uniform(-6, 6))
        L = h * rng.uniform(.8, 1)
        ex, ey = x + math.cos(a) * L * .7, base + math.sin(a) * L
        if wilt:
            ex += 7; ey += L * .35
        F.part(limb(x, base, ex, ey, 2.2), stem, ol='#2a0e08')
        nl = 7
        for j in range(nl):
            la = math.radians(-90 + (j - nl // 2) * 28 + (40 if wilt else 0))
            lx, ly = ex + math.cos(la) * 9, ey + math.sin(la) * 6.5
            col = ['#4f8a3a', '#6fae4a', '#5a9a40'][j % 3] if not wilt else ['#8a7a3a', '#6a5a2a'][j % 2]
            F.part(limb(ex, ey, lx, ly, 3, 1.4), col, ol='#163010')
        F.part(ell(ex, ey, 1.4, 1.4), '#c86a5a', outline=False, shade=False)
        if n == 5 and not wilt and b == 1:
            F.part(ell(ex, ey - 1, 2.2, 2.2), RUNA, ol='#3a0810', shade=False)
            F.px(ex - .5, ey - 1.5, RUNA2)
            glow(F, ex, ey, 10, '#ff4040', 60)
    F.part(ell(x, base + 1, 4, 1.6), '#3e2a1c', outline=False, shade=False)


def coentro(F, x, base, rng, wilt=False, n=1):
    for k in range(11):
        a = math.radians(-90 + (k - 5) * 15)
        L = rng.uniform(6, 10) * (.6 if wilt else 1)
        ex, ey = x + math.cos(a) * L, base + math.sin(a) * L * .8
        F.line(x, base, ex, ey, '#3e7a2a' if not wilt else '#6a5a2a')
        F.part(ell(ex, ey, 2, 1.6), ['#5fa040', '#7fc050', '#4f9038'][k % 3] if not wilt else '#8a7a3a', ol='#163010', shade=False)
    if n == 5 and not wilt:
        F.px(x, base - 8, RUNA2, F.fx); F.px(x - 3, base - 6, RUNA, F.fx)


def alface(F, x, base, rng, wilt=False, n=1):
    r = rng.uniform(8, 10)
    if wilt:
        F.part(ell(x, base - 2, r + 1, r * .45), '#8a7a3a', ol='#2a2410')
        F.part(ell(x - 1, base - 3, r * .5, r * .3), '#a8963a', ol='#2a2410', shade=False)
        return
    for k in range(8):
        a = 2 * math.pi * k / 8
        F.part(ell(x + math.cos(a) * r * .55, base - 3 + math.sin(a) * r * .32, r * .55, r * .4), ['#5fa040', '#4f9038'][k % 2], ol='#163010')
    F.part(ell(x, base - 4, r * .64, r * .46), '#8ccf5a', ol='#2a5018')
    F.part(ell(x - .5, base - 5, r * .34, r * .25), '#c8ef8a', ol='#3a6a20', shade=False)
    F.line(x - r * .5, base - 4, x + r * .3, base - 6, '#6aa840')
    if n == 5:
        F.line(x - 3, base - 3, x + 3, base - 3, RUNA)
        F.px(x, base - 4, RUNA2)
        glow(F, x, base - 4, 7, '#ff4040', 40)


def espantalho(F, x, base, n, wilt=False, fallen=False):
    if fallen:
        F.part(limb(x - 30, base - 4, x + 22, base - 1, 4), TABUA2, ol='#24160c')
        F.part(limb(x - 4, base - 16, x + 2, base + 4, 3), TABUA2, ol='#24160c')
        F.part(poly((x - 14, base - 11), (x + 4, base - 12), (x + 6, base - 1), (x - 14, base)), '#a83a2e', ol='#2a0a08', tex=.3,
               marks=[(R(x - 14, base - 7, x + 6, base - 5), '#3a4a7a')])
        F.part(ell(x - 24, base - 6, 7, 6), '#c8b080', ol='#3a2a14', tex=.3)
        F.part(ell(x - 36, base - 3, 9, 3), '#c8a55a', ol='#3a2a08', tex=.3)
        return
    tilt = 9 if wilt else 0
    tx = x + tilt
    F.part(limb(x, base, tx, base - 62, 3.5, 3), TABUA2, ol='#24160c')
    F.part(limb(tx - 22, base - 46, tx + 22, base - 48 + tilt * .2, 3), TABUA2, ol='#24160c')
    shirt = [[(tx - 11, base - 50), (tx + 11, base - 50), (tx + 10, base - 24), (tx - 10, base - 24)]]
    plaid = [(R(tx - 11, base - 42, tx + 11, base - 40), '#3a4a7a'), (R(tx - 11, base - 32, tx + 11, base - 30), '#3a4a7a'),
             (R(tx - 4, base - 50, tx - 2, base - 24), '#3a4a7a'), (R(tx + 4, base - 50, tx + 6, base - 24), '#3a4a7a')]
    F.part(shirt, '#a83a2e', tex=.2, ol='#2a0a08', marks=plaid)
    F.part(R(tx - 22, base - 50, tx - 10, base - 43) + R(tx + 10, base - 51, tx + 22, base - 44), '#a83a2e', ol='#2a0a08', tex=.2,
           marks=[(R(tx - 16, base - 50, tx - 14, base - 43), '#3a4a7a'), (R(tx + 15, base - 51, tx + 17, base - 44), '#3a4a7a')])
    F.part(R(tx - 3, base - 40, tx + 3, base - 35), REMENDO, ol='#3e3420', shade=False)
    for k in range(3):
        F.px(tx - 1 + k, base - 48 + k * 7, '#e8e0cc')
    for sx in (tx - 24, tx + 24):
        for k in range(4):
            F.line(sx, base - 47, sx + (k - 1.5) * 2, base - 40, '#e0c060')
    for k in range(5):
        F.line(tx - 8 + k * 4, base - 24, tx - 9 + k * 4, base - 18, '#e0c060')
    F.part(ell(tx, base - 58, 8, 8), '#c8b080', ol='#3a2a14', tex=.3)
    F.line(tx - 7, base - 52, tx + 7, base - 52, CORDA)
    if n == 5 and not wilt:
        F.px(tx - 3, base - 59, RUNA2); F.px(tx + 3, base - 59, RUNA2)
        F.px(tx - 3, base - 60, RUNA); F.px(tx + 3, base - 60, RUNA)
        glow(F, tx, base - 59, 12, '#ff3a3a', 90)
    else:
        F.px(tx - 3, base - 59, '#1a1010'); F.px(tx + 3, base - 59, '#1a1010')
        F.px(tx - 4, base - 60, '#1a1010'); F.px(tx + 2, base - 60, '#1a1010')
    for k in range(-4, 5, 2):
        F.px(tx + k, base - 55, '#3a2a14')
    F.part(ell(tx, base - 65, 14, 3.5), '#c8a55a', ol='#3a2a08', tex=.3)
    F.part(ell(tx, base - 68, 7, 4.5), '#d8b86a', ol='#3a2a08', tex=.3)
    F.line(tx - 7, base - 66, tx + 7, base - 66, RUNA if n == 5 else '#6a3a1a')


def regador(F, x, base):
    F.part(R(x - 7, base - 12, x + 7, base) + ell(x, base, 7, 2), '#7a9a7a', ol='#1a2a1a', tex=.2,
           marks=[(ell(x - 2, base - 4, 3, 2), FERRUGEM)])
    F.part(limb(x + 6, base - 4, x + 15, base - 12, 2.5, 2), '#7a9a7a', ol='#1a2a1a')
    F.part(ell(x + 16, base - 13, 2.5, 1.8), '#5a7a5a', ol='#1a2a1a')
    F.line(x - 5, base - 13, x - 3, base - 18, '#3a4a3a'); F.line(x - 3, base - 18, x + 5, base - 13, '#3a4a3a')
    F.part(ell(x, base - 12, 6, 2), '#5a7a5a', ol='#1a2a1a', shade=False)


BEDS = [(28, 228, 66, 90), (28, 228, 104, 128), (28, 228, 142, 164)]
FH = 7


def canteiro(F, n, x0, x1, y0, y1, rng, revirado=False):
    """borda + terra de um canteiro (y0..y1 = terra vista de cima; frente de FH px abaixo de y1)."""
    soil = '#5a3e2a' if n < 5 else '#2a1e22'
    if n == 1:
        F.part(R(x0 - 5, y0 - 3, x1 + 5, y1 + 4), LONA, tex=.25, ol='#1a2414')
        F.part(R(x0, y0, x1, y1), soil, tex=.45, ol='#1e1208')
        x = x0 - 4
        while x < x1 - 4:
            pneu(F, x + 9, y1 + 4, 10, 5)
            x += 19
        x = x0 + 6
        while x < x1 - 6:
            F.part(ell(x + 6, y0 - 1, 8, 3), '#2b2a2e', ol='#0c0c0e', light=.15)
            x += 30
    else:
        if n == 2:
            F.part(R(x0 - 4, y0 - 4, x1 + 4, y1 + FH), TABUA2, ol='#24160c')
            xx = x0 - 4
            while xx < x1 + 4:
                blk(F, xx, y1 + 1, min(x1 + 4, xx + 15), y1 + FH, [TABUA, TABUA2][(xx // 16) % 2], tex=.25)
                F.px(xx + 2, y1 + 3, PREGO); F.px(xx + 12, y1 + 3, PREGO)
                xx += 16
            blk(F, x0 - 4, y0 - 4, x1 + 4, y0, RIPA, tex=.2)
            for xe in (x0 - 4, x1):
                F.part(R(xe, y0 - 5, xe + 4, y1 + FH + 1), TABUA, ol='#24160c')
                F.px(xe + 2, y1 + 2, PREGO)
        elif n == 3:
            F.part(R(x0 - 5, y0 - 5, x1 + 5, y1 + FH), ARG, ol='#3e3a36')
            xx = x0 - 5
            while xx < x1 + 5:
                w = rng.randint(9, 15)
                blk(F, xx, y1 + 1, min(x1 + 5, xx + w - 1), y1 + FH, [PEDRA, PEDRA2, '#86827b'][rng.randint(0, 2)], tex=.35)
                xx += w
            for xx in range(x0 - 5, x1 + 5, 12):
                blk(F, xx, y0 - 5, min(x1 + 5, xx + 11), y0 - 1, [PEDRA, PEDRA2][(xx // 12) % 2], tex=.3)
            for xe in (x0 - 5, x1 + 1):
                for yy in range(y0 - 1, y1 + 1, 6):
                    blk(F, xe, yy, xe + 4, yy + 5, [PEDRA2, PEDRA][(yy // 6) % 2], tex=.3)
        elif n == 4:
            F.part(R(x0 - 5, y0 - 4, x1 + 5, y1 + FH), REJ, ol='#3a2218')
            for j, yy in enumerate((y1 + 1, y1 + 4)):
                xx = x0 - 5 - (5 if j else 0)
                while xx < x1 + 5:
                    blk(F, max(x0 - 5, xx), yy, min(x1 + 5, xx + 10), yy + 3, [TIJ, TIJ2][rng.randint(0, 1)], tex=.2)
                    xx += 11
            for xe in (x0 - 5, x1 + 1):
                for yy in range(y0 - 3, y1 + 1, 4):
                    blk(F, xe, yy, xe + 4, yy + 3, [TIJ2, TIJ][(yy // 4) % 2])
            F.part(R(x0 - 6, y0 - 5, x1 + 6, y0 - 2), METAL, ol='#22282c')
            for xx in range(x0, x1, 10):
                F.px(xx, y0 - 4, REBITE)
        else:
            F.part(R(x0 - 5, y0 - 5, x1 + 5, y1 + FH), LUA, ol='#0a060c')
            xx = x0 - 5
            while xx < x1 + 5:
                blk(F, xx, y1 + 1, min(x1 + 5, xx + 17), y1 + FH - 1, [LUA, LUA2][(xx // 18) % 2], tex=.3, l=.15)
                xx += 18
            F.part(R(x0 - 6, y0 - 6, x1 + 6, y0 - 2), OURO, ol='#3a2808')
            F.part(R(x0 - 6, y1 + FH - 2, x1 + 6, y1 + FH), OURO2, ol='#3a2808')
            for xe in (x0 - 5, x1 + 1):
                F.part(R(xe, y0 - 2, xe + 4, y1 + FH - 2), LUA2, ol='#0a060c')
            for k, rx in enumerate((x0 + 30, (x0 + x1) / 2 - 2, x1 - 34)):
                runa(F, rx, y1 + 1, k=k + int(y0) % 3, a=50, sc=.8)
        F.part(R(x0, y0, x1, y1), soil, tex=.45, ol='#1e1208')
    if n >= 4 and not revirado:
        irrigacao(F, x0 + 2, x1 - 2, y0 + 1)
        F.part(R(x1 + 1, y0, x1 + 4, y1 + 4), '#3e5a6e', ol='#141c22', shade=False)
    # sulcos
    for yy in range(y0 + 3, y1 - 1, 5):
        F.line(x0 + 2, yy, x1 - 3, yy, '#3e2a1c' if n < 5 else '#140c10')
        F.line(x0 + 2, yy + 1, x1 - 3, yy + 1, '#6e5038' if n < 5 else '#3a2a30')
    if revirado:
        for _ in range(6):
            cx, cy = rng.randint(x0 + 10, x1 - 10), rng.randint(y0 + 4, y1 - 4)
            F.part(ell(cx, cy, rng.randint(5, 10), 3.5), '#2a1a10', outline=False, shade=False)
            F.part(ell(cx + 2, cy - 3, 5, 2.5), '#6e5038', ol='#2a1a10')


def cerca(F, n, rng, x0=14, x1=242, yb=52, yf=176, broken=None):
    """cerca de trás + laterais. broken = (x0,x1) trecho quebrado na cerca de trás."""
    def ok(x):
        return broken is None or not (broken[0] <= x <= broken[1])
    if n == 1:
        for x in range(x0, x1 + 1, 19):
            if ok(x):
                F.part(limb(x, yb + 12, x + rng.uniform(-3, 3), yb - 12, 3.4, 2.6), ESTACA, tex=.3)
        for yy in (yb - 6, yb + 2):
            xs = x0
            while xs < x1:
                xe = min(x1, xs + 19)
                if ok(xs) and ok(xe):
                    sag = 2
                    for i in range(0, 20):
                        t = i / 19.
                        F.px(xs + (xe - xs) * t, yy + sag * math.sin(math.pi * t), CORDA)
                xs = xe
        if ok(160):
            F.part(poly((150, yb - 8), (190, yb - 9), (192, yb + 6), (170, yb + 10), (152, yb + 6)), LONAZ, tex=.25, ol='#122436')
            F.line(158, yb - 6, 164, yb + 6, dk(LONAZ, .3))
    elif n == 2:
        F.part(R(x0, yb - 8, x1, yb - 4), RIPA, ol='#24160c')
        F.part(R(x0, yb + 2, x1, yb + 6), RIPA, ol='#24160c')
        x = x0
        while x <= x1:
            if ok(x):
                F.part(poly((x - 3, yb + 12), (x + 3, yb + 12), (x + 3, yb - 14), (x, yb - 18), (x - 3, yb - 14)),
                       [TABUA, TABUA2, mix(C(TABUA), C(TABUA2), .5)][(x // 8) % 3], tex=.2, ol='#24160c')
                F.px(x, yb - 6, PREGO); F.px(x, yb + 4, PREGO)
            x += 8
    elif n == 3:
        xs = x0
        while xs < x1:
            xe = min(x1, xs + 30)
            if ok(xs) and ok(xe):
                F.part(R(xs, yb - 14, xe, yb + 10), ARG, ol='#3e3a36')
                for j, yy in enumerate(range(yb - 13, yb + 9, 7)):
                    xx = xs + (j % 2) * 5 - 5
                    while xx < xe:
                        blk(F, max(xs + 1, xx), yy, min(xe - 1, xx + 10), yy + 6, [PEDRA, PEDRA2, '#86827b'][rng.randint(0, 2)], tex=.35)
                        xx += 11
                F.part(R(xs - 1, yb - 17, xe + 1, yb - 13), PEDRA2, ol='#2e2a26', tex=.3)
            xs = xe
    elif n == 4:
        xs = x0
        while xs < x1:
            xe = min(x1, xs + 30)
            if ok(xs) and ok(xe):
                F.part(R(xs, yb - 6, xe, yb + 10), REJ, ol='#3a2218')
                for j, yy in enumerate(range(yb - 5, yb + 9, 5)):
                    xx = xs + (j % 2) * 5 - 5
                    while xx < xe:
                        blk(F, max(xs + 1, xx), yy, min(xe - 1, xx + 10), yy + 4, [TIJ, TIJ2][rng.randint(0, 1)], tex=.2)
                        xx += 11
                F.part(R(xs - 1, yb - 9, xe + 1, yb - 5), METAL, ol='#22282c')
            xs = xe
    else:
        xs = x0
        while xs < x1:
            xe = min(x1, xs + 38)
            if ok(xs) and ok(xe):
                F.part(R(xs, yb - 10, xe, yb + 10), LUA, ol='#0a060c')
                blk(F, xs + 1, yb - 9, xe - 1, yb + 9, LUA2, tex=.3, l=.15)
                F.line(xs + 1, yb, xe - 2, yb, '#1a1420')
                F.part(R(xs - 1, yb - 13, xe + 1, yb - 9), OURO, ol='#3a2808')
                F.part(R(xs - 3, yb - 16, xs + 3, yb + 10), LUA, ol='#0a060c')
                F.part(poly((xs - 4, yb - 16), (xs + 4, yb - 16), (xs, yb - 22)), OURO, ol='#3a2808')
            xs = xe
        runa(F, 126, yb - 4, k=2, a=60)
    # laterais
    for x in (x0, x1):
        if n == 1:
            for y in range(yb + 24, yf, 26):
                F.part(limb(x, y + 10, x + rng.uniform(-2, 2), y - 14, 3, 2.5), ESTACA, tex=.3)
            for i in range(yb, yf - 14):
                F.px(x + math.sin(i * .2), i - 10, CORDA)
        elif n == 2:
            F.part(R(x - 2, yb - 8, x + 2, yf - 10), RIPA, ol='#24160c')
            for y in range(yb + 14, yf, 16):
                F.part(poly((x - 3, y + 10), (x + 3, y + 10), (x + 3, y - 12), (x, y - 16), (x - 3, y - 12)), TABUA2, ol='#24160c', tex=.2)
        elif n == 3:
            F.part(R(x - 5, yb - 14, x + 5, yf), ARG, ol='#3e3a36')
            for j, y in enumerate(range(yb - 13, yf, 8)):
                blk(F, x - 5 + (j % 2), y, x + 5 - ((j + 1) % 2), y + 7, [PEDRA, PEDRA2][j % 2], tex=.3)
        elif n == 4:
            F.part(R(x - 4, yb - 6, x + 4, yf), REJ, ol='#3a2218')
            for y in range(yb - 5, yf, 5):
                blk(F, x - 4, y, x + 4, y + 4, [TIJ, TIJ2][(y // 5) % 2], tex=.2)
        else:
            F.part(R(x - 4, yb - 10, x + 4, yf), LUA, ol='#0a060c')
            F.part(R(x - 5, yb - 13, x + 5, yb - 9), OURO, ol='#3a2808')
            for y in range(yb + 8, yf, 16):
                F.line(x - 3, y, x + 3, y, '#1a1420')
            F.part(R(x - 6, yf - 6, x + 6, yf), OURO2, ol='#3a2808')


def estufa(F, rng, front=False):
    """N4: estufa de tijolo e chapa — painéis translúcidos atrás e nas laterais, montantes rebitados."""
    xs = [14, 72, 128, 184, 242]
    if not front:
        for i in range(4):
            a, b = xs[i] + 3, xs[i + 1] - 3
            pan = F.layer()
            m = F.mask(R(a, 10, b, 44))
            pan[m, :3] = (180, 214, 226)
            pan[m, 3] = 80
            for yy in range(14, 44, 8):
                pan[yy, a:b, :3] = (222, 240, 246)
                pan[yy, a:b, 3] = 130
            F.a[:] = over(F.a, pan)
            F.line(a + 3, 13, a + 14, 26, '#eef8fb'); F.line(a + 6, 13, a + 17, 26, '#d8eef4')
        F.part(R(10, 6, 246, 10), CHAPA2, ol='#22282c')
        for x in range(14, 244, 8):
            F.px(x, 8, REBITE)
        for x in xs:
            F.part(R(x - 2, 8, x + 2, 46), METAL, ol='#22282c')
            F.px(x, 16, REBITE); F.px(x, 30, REBITE)
    else:
        for x in (14, 242):
            pan = F.layer()
            m = F.mask(R(x - 5, 10, x + 5, 120))
            pan[m, :3] = (180, 214, 226)
            pan[m, 3] = 60
            F.a[:] = over(F.a, pan)
            F.part(R(x - 2, 8, x + 2, 176), METAL, ol='#22282c')
            for y in range(20, 172, 16):
                F.px(x, y, REBITE)
        # caixa-d'água pequena da irrigação
        F.part(R(232, 150, 250, 172) + ell(241, 172, 9, 2), CHAPA, ol='#22282c', tex=.1)
        for xx in range(234, 250, 3):
            F.line(xx, 152, xx, 171, CHAPA2)
        F.part(ell(241, 150, 9, 2.5), '#a8b0b6', ol='#22282c')


def irrigacao(F, x0, x1, y):
    F.part(R(x0, y - 2, x1, y + 1), '#3e5a6e', ol='#141c22', shade=False)
    for x in range(x0 + 8, x1, 16):
        F.px(x, y - 2, '#7a98a8')
        F.px(x, y + 2, AGUA2); F.px(x, y + 4, AGUA)


def horta(n, estado):
    F = Frame(256, 192)
    rng = random.Random(3100 + n)
    drng = random.Random(3200 + n + estado * 7)
    gy = 180
    wilt_set = set()
    if estado == 1:
        wilt_set = set(drng.sample(range(60), 24))
    ground = '#6a5440' if n < 5 else '#3a2e38'
    F.part(R(10, 46, 246, 178), ground, tex=.4, ol='#1a120c')
    for _ in range(220):
        x, y = rng.randint(12, 244), rng.randint(48, 176)
        F.px(x, y, ['#7e6650', '#4a3a2c', '#8a7a5a'][rng.randint(0, 2)] if n < 5 else ['#4a3c48', '#241c24'][rng.randint(0, 1)])
    for _ in range(14):
        x, y = rng.randint(14, 240), rng.randint(50, 174)
        F.part(ell(x, y, 1.6, 1.2), '#8e8a84' if n < 5 else '#4a4256', ol='#2a2420', shade=False)
    if n == 4:
        estufa(F, rng)
    if estado == 2:
        cerca(F, n, rng, broken=(40, 214))
        for (x0, x1, y0, y1) in BEDS:
            canteiro(F, n, x0, x1, y0, y1, drng, revirado=True)
        for (x, y) in [(50, 84), (90, 122), (160, 86), (200, 160), (130, 158), (70, 160), (180, 122)]:
            for k in range(4):
                F.line(x + k * 3, y, x + k * 3 + drng.randint(-3, 3), y - drng.randint(5, 10), '#7a6a3a')
        escombros(F, n, 30, 226, 74, 22, drng, k=40, beams=1, smoke=False)
        escombros(F, n, 60, 200, 176, 26, drng, k=40, beams=1, smoke=False)
        espantalho(F, 140, 134, n, fallen=True)
        fumaca(F, 90, 54, drng, n=4)
        fumaca(F, 170, 150, drng, n=4)
        regador(F, 26, 176)
        return final(F, gy, 128, 118, cast=False)
    broken = (98, 136) if estado == 1 else None
    cerca(F, n, rng, broken=broken)
    pi = [0]

    def W():
        pi[0] += 1
        return (pi[0] - 1) in wilt_set
    hs = {1: .82, 2: .9, 3: 1., 4: 1.06, 5: 1.1}[n]
    step = {1: 1.25, 2: 1.1, 3: 1., 4: 1., 5: 1.}[n]
    # canteiro de trás: milho + macaxeira (espantalho na ponta direita)
    x0, x1, y0, y1 = BEDS[0]
    canteiro(F, n, x0, x1, y0, y1, rng)
    espantalho(F, 212, y1 - 4, n, wilt=(estado == 1))
    for x in np.arange(x0 + 12, 190, 22 * step):
        milho(F, x, y0 + 10, rng.uniform(44, 52) * hs, rng, wilt=W(), n=n)
    for x in np.arange(x0 + 22, 196, 22 * step):
        macaxeira(F, x, y1 - 1, rng.uniform(22, 28) * hs, rng, wilt=W(), n=n)
    # do meio: macaxeira + coentro
    x0, x1, y0, y1 = BEDS[1]
    canteiro(F, n, x0, x1, y0, y1, rng)
    for x in np.arange(x0 + 14, x1 - 8, 28 * step):
        macaxeira(F, x, y0 + 10, rng.uniform(24, 30) * hs, rng, wilt=W(), n=n)
    for x in np.arange(x0 + 8, x1 - 4, 13 * step):
        coentro(F, x, y1 - 1, rng, wilt=W(), n=n)
    # da frente: alface + coentro
    x0, x1, y0, y1 = BEDS[2]
    canteiro(F, n, x0, x1, y0, y1, rng)
    for x in np.arange(x0 + 12, x1 - 8, 22 * step):
        alface(F, x, y0 + 11, rng, wilt=W(), n=n)
    for x in np.arange(x0 + 22, x1 - 8, 22 * step):
        alface(F, x, y1 + 1, rng, wilt=W(), n=n) if int(x) % 3 else coentro(F, x, y1, rng, wilt=W(), n=n)
    if n == 4:
        estufa(F, rng, front=True)
        lampada(F, 128, 56, 10)
    if n == 5:
        bandeira(F, 14, 2, 40)
        bandeira(F, 232, 2, 40) if False else None
    regador(F, 22, 178)
    balde(F, 236 if n != 4 else 222, 168, 178, 10, '#7d848c' if n >= 4 else SUCATA)
    if n == 3:
        F.part(R(116, 168, 140, 178), PEDRA2, ol='#2e2a26', tex=.3)  # degrau
    if estado == 1:
        rachaduras(F, (14, 40, 242, 178), 8, drng)
        for (x, y) in ((40, 98), (170, 134), (120, 168), (200, 60)):
            fuligem(F, x, y, 16, 8)
        peca_solta(F, n, 112, 74, drng)
        fogo(F, 222, 46)
        fumaca(F, 224, 28, drng, n=4)
        for (x, y) in ((70, 120), (150, 156)):
            F.part(ell(x, y, 8, 3), '#3e2a1c', outline=False, shade=False)
            for k in range(3):
                F.px(x - 4 + k * 4, y - 1, '#2a1a10')
    return final(F, gy, 128, 118, cast=False)



# =====================================================================
#                             BANCADA 2×1
# =====================================================================

def barricada(F, n, x, base, rng):
    for k, (dx, a) in enumerate(((0, -6), (10, 4), (18, -3))):
        F.part(rot(R(x + dx - 3, base - 70, x + dx + 3, base), x + dx, base, a), [TABUA, TABUA2, RIPA][k], tex=.25, ol='#24160c')
    F.part(rot(R(x - 6, base - 46, x + 30, base - 40), x + 12, base - 43, 22), TABUA2, tex=.2, ol='#24160c')
    F.part(rot(R(x - 6, base - 30, x + 30, base - 24), x + 12, base - 27, -18), TABUA, tex=.2, ol='#24160c')
    for (px, py) in ((x, base - 48), (x + 20, base - 38), (x + 2, base - 22), (x + 22, base - 32), (x + 11, base - 43)):
        F.px(px, py, PREGO); F.px(px + 1, py + 1, '#3a2a1e')
    if n >= 4:
        for xx in range(x - 4, x + 28, 2):
            F.px(xx, base - 56 + (xx % 4 == 0) * 2, '#5a5e64')
            if xx % 6 == 0:
                F.px(xx, base - 58, '#9aa0a8')


def itens_bancada(F, n, x0, top, rng):
    # serrote
    F.part(poly((x0 + 6, top + 2), (x0 + 46, top - 1), (x0 + 46, top + 6), (x0 + 10, top + 8)), REBITE, ol='#2a2e34', light=.4)
    for xx in range(x0 + 10, x0 + 46, 2):
        F.px(xx, top + 8 - (xx - x0 - 10) * .05, '#4a4e54')
    F.part(R(x0 + 44, top - 3, x0 + 56, top + 7), RIPA, ol='#24160c')
    F.flat(ell(x0 + 50, top + 2, 2.5, 2), '#3a2414')
    # rolo de pano + atadura desenrolada
    rx = x0 + 70
    F.part(R(rx, top - 8, rx + 16, top + 4), '#e8e0cc', ol='#4a4434', tex=.15)
    F.part(ell(rx + 16, top - 2, 3.5, 6), '#f4eee0', ol='#4a4434', shade=False)
    F.flat(ell(rx + 16, top - 2, 1.5, 2.5), '#b8ae98')
    F.part(poly((rx + 2, top + 4), (rx + 12, top + 4), (rx + 26, top + 10), (rx + 18, top + 11)), '#e8e0cc', ol='#4a4434')
    F.px(rx + 20, top + 8, RUNA); F.px(rx + 21, top + 9, '#8a2a2a')
    # lata de pregos
    lx = x0 + 108
    F.part(R(lx - 6, top - 8, lx + 6, top + 4) + ell(lx, top + 4, 6, 2), '#a8a8a0', ol='#2a2a28', tex=.2,
           marks=[(R(lx - 6, top - 4, lx + 6, top), '#c8323a' if n < 5 else OURO)])
    F.part(ell(lx, top - 8, 6, 2.2), '#5a5a56', ol='#2a2a28', shade=False)
    for k in range(6):
        F.px(lx - 4 + k * 1.6, top - 9 + (k % 2), PREGO)
    for k in range(4):
        F.px(lx + 10 + k * 3, top + 5 - k % 2, PREGO)
    # martelo
    F.part(R(lx + 16, top - 1, lx + 34, top + 2), RIPA, ol='#24160c')
    F.part(R(lx + 32, top - 5, lx + 37, top + 6), FERRO2, ol='#141418')
    # pano vermelho com gazuas
    gx = x0 + 150
    F.part(poly((gx, top - 3), (gx + 26, top - 4), (gx + 28, top + 7), (gx - 1, top + 8)), '#8a2a2e', ol='#2a0a0c', tex=.25)
    for k in range(4):
        y = top - 1 + k * 2.4
        F.line(gx + 3, y, gx + 20, y, '#c9ced4')
        F.px(gx + 21, y - 1, '#c9ced4'); F.px(gx + 2, y, '#5a3a22'); F.px(gx + 3, y, '#5a3a22')
    F.part(ell(gx + 24, top + 3, 2.5, 2.5), '#c9a040', ol='#3a2808', shade=False)
    F.flat(ell(gx + 24, top + 3, 1, 1), '#2a1a0a')


def bancada(n, estado):
    F = Frame(256, 192)
    rng = random.Random(4100 + n)
    drng = random.Random(4200 + n + estado * 7)
    gy = 180
    piso(F, n, 14, 140, 242, gy, rng)
    if estado == 2:
        rachaduras(F, (14, 140, 242, gy), 5, drng)
        escombros(F, n, 18, 238, 170, 64, drng, beams=2)
        # tampo quebrado ao meio e itens jogados
        top_col = {1: '#5a8a8a', 2: TABUA, 3: TABUA, 4: '#9aa2a8', 5: LUA2}[n]
        F.part(rot(R(70, 156, 124, 166), 97, 161, 12), top_col, tex=.25, ol='#1a1214')
        F.part(rot(R(132, 158, 184, 168), 158, 163, -16), top_col, tex=.25, ol='#1a1214')
        F.part(poly((86, 172), (120, 170), (120, 176), (90, 177)), REBITE, ol='#2a2e34')
        F.part(R(118, 168, 128, 176), RIPA, ol='#24160c')
        F.part(R(150, 168, 164, 178), '#e8e0cc', ol='#4a4434')
        F.part(ell(164, 173, 3, 5), '#f4eee0', ol='#4a4434', shade=False)
        return final(F, gy, 128, 116)
    # cobertura + parede
    parede(F, n, 22, 66, 234, 146, rng)
    tint_rect(F, 22, 66, 234, 146, .2)
    tint_rect(F, 22, 66, 234, 76, .2)
    # quadro de ferramentas
    pb = {1: ('#8a7a5a', '#3a2e1a'), 2: (TABUA2, '#24160c'), 3: (TABUA, '#24160c'), 4: (CHAPA2, '#22282c'), 5: (LUA2, '#0a060c')}[n]
    F.part(R(150, 78, 222, 114), pb[0], ol=pb[1], tex=.2)
    for yy in range(81, 112, 5):
        for xx in range(153, 220, 5):
            F.px(xx, yy, dk(pb[0], .5))
    if n == 5:
        F.part(R(149, 77, 223, 80), OURO, ol='#3a2808')
    F.part(limb(160, 84, 164, 106, 2.5), '#3e3e44')
    F.part(limb(168, 84, 164, 106, 2.5), '#3e3e44')
    F.part(R(158, 84, 170, 88), '#c84a2a', ol='#2a0a08')
    F.part(limb(182, 84, 182, 108, 2.5), METAL, ol='#141418'); F.part(ell(182, 84, 3, 3), METAL, ol='#141418')
    F.part(R(194, 84, 197, 104), RIPA, ol='#24160c'); F.part(R(191, 82, 200, 87), FERRO2, ol='#141418')
    F.part(poly((206, 84), (212, 84), (214, 106), (208, 102)), REBITE, ol='#2a2e34')
    F.part(R(205, 82, 213, 86), '#3a6a8c', ol='#122436')
    # prateleira com potes à esquerda
    F.part(R(50, 92, 120, 96), TABUA2 if n != 5 else OURO2, ol='#24160c')
    for k, c in enumerate(('#a8a8a0', '#c8a040', '#6a8a9a', '#a8a8a0', '#8a5a3a')):
        F.part(R(54 + k * 13, 82, 63 + k * 13, 92), c, ol='#1a1a18', tex=.2)
        F.part(R(54 + k * 13, 80, 63 + k * 13, 83), dk(c, .3), ol='#1a1a18', shade=False)
    pilar(F, n, 14, 64, 172, rng)
    pilar(F, n, 234, 64, 172, rng)
    eave = telhado(F, n, 10, 20, 246, 62, rng)
    if n == 1:
        for (rx, sx) in ((12, 4), (244, 251)):
            F.line(rx, eave - 2, sx, 172, CORDA)
            F.part(limb(sx, 168, sx, 177, 3, 3), ESTACA)
    # bancada
    x0, x1, top = 40, 216, 122
    fy = top + 12
    tint_rect(F, x0, fy, x1, 178, .45)
    if n == 1:
        for lx in (56, 176):
            barril(F, lx + 13, fy + 4, 176, 26, 'tambor', agua=False)
        F.part(R(x0, top, x1, fy), '#5a8a8a', tex=.25, ol='#14262a',
               marks=[(R(x0 + 10, top + 3, x0 + 80, top + 9), '#4a7a7a'), (R(x0 + 92, top + 3, x1 - 10, top + 9), '#4a7a7a'),
                      (ell(x0 + 60, top + 6, 10, 3), '#7a8a7a')])
        F.part(R(x0, fy, x1, fy + 4), '#3e6a6a', ol='#14262a')
        F.part(ell(x1 - 8, fy + 2, 2, 1.5), '#c9a040', ol='#3a2808', shade=False)
    elif n == 2:
        for lx in (60, 190):
            F.part(limb(lx - 10, 176, lx, fy, 4), TABUA2, ol='#24160c')
            F.part(limb(lx + 10, 176, lx, fy, 4), TABUA2, ol='#24160c')
            F.part(R(lx - 8, 156, lx + 8, 159), RIPA, ol='#24160c')
        F.part(R(x0, top, x1, fy), TABUA, tex=.25, ol='#24160c')
        for yy in (top + 4, top + 8):
            F.line(x0 + 1, yy, x1 - 2, yy, dk(TABUA, .35))
        F.part(R(x0, fy, x1, fy + 5), TABUA2, ol='#24160c')
        for xx in (x0 + 4, x1 - 6, 128):
            F.px(xx, fy + 2, PREGO)
        balde(F, 128, 162, 176, 14, '#7d5430')
    elif n == 3:
        for lx in (48, 190):
            F.part(R(lx, fy, lx + 18, 176), ARG, ol='#3e3a36')
            for j, yy in enumerate(range(fy + 1, 175, 8)):
                blk(F, lx + (j % 2), yy, lx + 18 - ((j + 1) % 2), yy + 7, [PEDRA, PEDRA2][j % 2], tex=.3)
        F.part(R(x0, top, x1, fy), TABUA, tex=.25, ol='#24160c')
        for yy in (top + 4, top + 8):
            F.line(x0 + 1, yy, x1 - 2, yy, dk(TABUA, .35))
        F.part(R(x0, fy, x1, fy + 7), TABUA2, ol='#24160c')
        F.part(R(96, 160, 160, 164), RIPA, ol='#24160c')
        for k in range(4):
            F.part(rot(R(100 + k * 14, 152, 112 + k * 14, 160), 106 + k * 14, 156, k * 7 - 10), [TABUA, TABUA2][k % 2], ol='#24160c')
    elif n == 4:
        F.part(R(150, fy + 4, 206, 176), CHAPA2, ol='#22282c')
        for yy in (fy + 10, fy + 22, fy + 33):
            F.line(152, yy, 204, yy, '#2a3034')
            F.part(R(172, yy + 3, 184, yy + 5), REBITE, ol='#2a3034', shade=False)
        F.part(R(46, fy, 54, 176), METAL, ol='#22282c')
        F.part(R(46, 166, 150, 170), METAL, ol='#22282c')
        F.part(R(x0, top, x1, fy), TABUA, tex=.25, ol='#24160c')
        F.part(R(x0 - 1, fy, x1 + 1, fy + 5), METAL, ol='#22282c')
        F.part(R(x0 - 2, top - 1, x0 + 3, fy + 5), METAL, ol='#22282c'); F.part(R(x1 - 3, top - 1, x1 + 2, fy + 5), METAL, ol='#22282c')
        for xx in range(x0 + 4, x1, 8):
            F.px(xx, fy + 2, REBITE)
        F.part(R(70, 150, 120, 166), '#b03a2a', ol='#2a0a08', tex=.1)  # caixa de ferramentas
        F.part(R(88, 146, 102, 150), '#2a2a2e')
        F.part(R(70, 154, 120, 156), '#7a2418', outline=False)
    else:
        for lx in (48, 190):
            F.part(R(lx, fy, lx + 18, 176), LUA, ol='#0a060c', tex=.2)
            F.part(R(lx - 1, 171, lx + 19, 176), OURO2, ol='#3a2808')
            runa(F, lx + 7, fy + 14, k=lx % 5, a=60)
        F.part(R(x0, top, x1, fy), LUA2, tex=.3, ol='#0a060c')
        F.part(R(x0 - 1, fy, x1 + 1, fy + 5), OURO, ol='#3a2808')
        F.line(x0, top, x1 - 1, top, OURO2)
    # morsa (N3+)
    if n >= 3:
        vx = x1 - 14
        F.part(R(vx, top - 10, vx + 12, top + 2), '#3e5a6e' if n >= 4 else FERRO, ol='#141418')
        F.line(vx - 4, top - 6, vx + 16, top - 6, '#c0c4cc')
        F.line(vx + 6, top - 10, vx + 6, top + 1, '#1a1a1e')
    itens_bancada(F, n, x0 + 4, top + 2, rng)
    barricada(F, n, 22, 178, rng)
    # caixa à direita
    if n == 1:
        F.part(R(224, 150, 250, 176), '#b08a5a', ol='#3a2a14', tex=.3, marks=[(R(224, 160, 250, 163), '#8a6a42')])
        F.part(poly((224, 150), (234, 144), (240, 150)), '#c8a070', ol='#3a2a14')
    elif n in (2, 3):
        F.part(R(224, 148, 250, 176), TABUA, ol='#24160c', tex=.25)
        for yy in (155, 163, 170):
            F.line(225, yy, 249, yy, TABUA2)
        F.line(225, 149, 249, 175, TABUA2)
    elif n == 4:
        F.part(R(224, 152, 250, 176), '#3e6a4e', ol='#141418', tex=.1)
        F.part(R(222, 148, 252, 153), '#2e5a3e', ol='#141418')
        F.px(236, 160, REBITE); F.px(237, 160, REBITE)
    else:
        F.part(R(224, 150, 250, 176), LUA2, ol='#0a060c', tex=.25)
        F.part(R(222, 146, 252, 152), LUA, ol='#0a060c')
        F.part(R(224, 160, 250, 163), OURO, ol='#3a2808')
        F.part(R(234, 157, 240, 166), OURO2, ol='#3a2808')
    # luz
    if n == 2:
        lampiao(F, 130, 76)
        F.line(130, eave, 130, 70, '#1a1a1e')
    elif n == 3:
        lampiao(F, 140, 76)
        F.line(140, eave, 140, 70, '#1a1a1e')
    elif n == 4:
        lampada(F, 128, 80, int(eave))
    elif n == 5:
        lampiao(F, 128, 76, red=True)
        F.line(128, eave, 128, 70, OURO2)
        bandeira(F, 222, 0, 24)
    if estado == 1:
        danificar(F, n, (14, 20, 242, 140), drng, fire=(70, 60), smoke=(72, 40), loose=(234, 178), soot=3, cracks=8)
        fuligem(F, 180, 100, 18, 10)
    return final(F, gy, 128, 116)


# =====================================================================

def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in (('con_serralheria', serralheria), ('con_coletor', coletor), ('con_horta', horta), ('con_bancada', bancada)):
        frames = [fn(n, e) for e in range(3) for n in range(1, 6)]
        grid(frames, 5).save(os.path.join(OUT, name + '.png'))
        print('ok', name)


if __name__ == '__main__':
    main()
