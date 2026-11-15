"""Grupo ESTACOES — estações de trabalho e obras (Lua de Sangue).
Rodar de dentro de tools/:  python obj_estacoes.py
Gera em ../sprites: est_posto_guarda, est_pilha_toras, est_ponto_coleta, est_trabalho,
est_obra_1x1/2x1/2x2, est_selo, est_ghost, est_cama.
"""
import os
import sys
import math
import random

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, hexc, mix, star, sparkle, puff, impact, dust,
                    text, shadow_layer, compose, glow, strip, grid, over, MOON, NIGHT)

OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- escada de materiais (CONTRATO) ----------------
L1, L1B, REM, LAZ, CORDA, ESTACA, FERR, SUC = '#5f7a4a', '#4a6139', '#8a7a52', '#3f6a8c', '#b59a62', '#8a6a42', '#8a4e2e', '#6b6a66'
T1, T2, TE, PREGO, RIPA = '#9a6a3c', '#7d5430', '#5a3a22', '#c9c3b0', '#8b5e34'
P1, P2, ARG, TEL, TEL2 = '#8e8a84', '#77736e', '#b8b0a0', '#b5562e', '#8f3f22'
TJ1, TJ2, REJ, MET, REB, CH1, CH2, LAMP = '#a5432e', '#86351f', '#c9b8a0', '#7d848c', '#c9ced4', '#8d969c', '#6b747a', '#ffd36a'
LU1, LU2, OURO, OURO2, ARD, RUNA, RUNA2 = '#2e2836', '#3c3446', '#f2c230', '#b8861a', '#1c1822', '#c8323a', '#ff5a5a'
FUL, VIGA = '#2a2228', '#2a1a12'
INKC = '#160e12'
# extras
BARK, CERNE, ANEL, LASCA = '#5a3e28', '#d6ad72', '#a87a48', '#e2c28a'
PALHA, PALHA2 = '#c9a45a', '#9c7a3a'
ACO, ACO2 = '#9aa3ab', '#5e666e'
CREAM = '#fff4e0'


def C(h):
    return hexc(h) if isinstance(h, str) else np.array(h, float)


def dk(c, k=.75):
    return np.clip(C(c) * k, 0, 255)


def lt(c, k=.25):
    return np.clip(mix(C(c), MOON, k), 0, 255)


def jit(c, rng, a=.08):
    return np.clip(C(c) * rng.uniform(1 - a, 1 + a), 0, 255)


def R(x0, y0, x1, y1):
    return [[(x0, y0), (x1, y0), (x1, y1), (x0, y1)]]


def rrect(cx, cy, w, h, deg):
    return rot(R(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), cx, cy, deg)


def grids(F):
    return np.mgrid[0:F.h, 0:F.w]


def paint(F, m, col, t=1.0, layer=None):
    L = F.a if layer is None else layer
    m = m & (L[..., 3] > 0)
    if m.any():
        L[m, :3] = np.clip(mix(L[m, :3].astype(float), C(col), t), 0, 255)


def pxl(F, x, y, col, layer=None):
    F.px(x, y, col, layer)


def nail(F, x, y):
    F.px(x, y, PREGO)
    F.px(x + 1, y + 1, '#3a2c22')


def rivet(F, x, y):
    F.px(x, y, REB)
    F.px(x + 1, y + 1, '#3a3e44')


def rope_line(F, x0, y0, x1, y1, sag=0, col=CORDA, layer=None):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 2
    for i in range(n + 1):
        t = i / n
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)
        F.px(x, y, col if i % 3 else dk(col, .62), layer)


# ---------------- materiais ----------------

def plank(F, x0, y0, x1, y1, col, rng, vertical=True, nails=True, grain=True):
    m = F.part(R(x0, y0, x1, y1), jit(col, rng, .06), tex=.12, light=.2, dark=.28)
    if grain:
        if vertical:
            for _ in range(rng.randint(1, 2)):
                gx = rng.randint(int(x0) + 1, max(int(x0) + 1, int(x1) - 1))
                ga = rng.randint(int(y0) + 2, max(int(y0) + 2, int(y1) - 3))
                F.line(gx, ga, gx, min(int(y1) - 1, ga + rng.randint(3, 9)), dk(col, .7))
            if rng.random() < .3 and y1 - y0 > 10:
                kx, ky = (x0 + x1) / 2, rng.uniform(y0 + 4, y1 - 4)
                F.px(kx, ky, dk(col, .5)); F.px(kx + 1, ky, dk(col, .62))
        else:
            for _ in range(rng.randint(1, 2)):
                gy = rng.randint(int(y0) + 1, max(int(y0) + 1, int(y1) - 1))
                ga = rng.randint(int(x0) + 2, max(int(x0) + 2, int(x1) - 4))
                F.line(ga, gy, min(int(x1) - 1, ga + rng.randint(4, 12)), gy, dk(col, .7))
    if nails:
        if vertical:
            nail(F, int((x0 + x1) / 2), int(y0) + 2)
            if y1 - y0 > 9:
                nail(F, int((x0 + x1) / 2), int(y1) - 3)
        else:
            nail(F, int(x0) + 2, int((y0 + y1) / 2))
            nail(F, int(x1) - 3, int((y0 + y1) / 2))
    return m


def planks(F, x0, y0, x1, y1, rng, pw=7, cols=(T1, T2), vertical=True, nails=True, ragged=0):
    k = 0
    if vertical:
        x = x0
        while x < x1:
            xe = min(x + pw, x1)
            dy = rng.randint(-ragged, ragged) if ragged else 0
            plank(F, x, y0 + dy, xe, y1, cols[k % len(cols)], rng, True, nails)
            x = xe + 1
            k += 1
    else:
        y = y0
        while y < y1:
            ye = min(y + pw, y1)
            plank(F, x0, y, x1, ye, cols[k % len(cols)], rng, False, nails)
            y = ye + 1
            k += 1


def blocks(F, x0, y0, x1, y1, rng, bw=12, bh=7, cols=(P1, P2), mortar=ARG, clip=None, tex=.18, moss=0.0, outline=True):
    shp = R(x0, y0, x1, y1)
    mm = F.mask(shp)
    if clip is not None:
        mm &= clip
    # argamassa + contorno geral
    F.part(shp, mortar, tex=.25, clip=clip, outline=outline, light=.15, dark=.3)
    r = 0
    y = y0 + 1
    while y < y1 - 1:
        off = (r % 2) * (bw // 2) + rng.randint(0, 1)
        x = x0 + 1 - off
        while x < x1 - 1:
            w = bw + rng.randint(-2, 2)
            bx0, bx1 = max(x, x0 + 1), min(x + w - 2, x1 - 1)
            by1 = min(y + bh - 2, y1 - 1)
            if bx1 - bx0 >= 2 and by1 - y >= 1:
                F.part(R(bx0, y, bx1, by1), jit(rng.choice(cols), rng, .07), outline=False, tex=tex,
                       light=.32, dark=.38, clip=mm)
                if rng.random() < .18:
                    F.px(rng.randint(bx0, bx1), rng.randint(y, by1), dk(cols[0], .55))
                if moss and rng.random() < moss:
                    mx = rng.randint(bx0, bx1)
                    F.px(mx, by1, '#4f6a3a'); F.px(mx + 1, by1, '#5f7a4a'); F.px(mx, by1 - 1, '#5f7a4a')
            x += w
        y += bh
        r += 1
    return mm


def bricks(F, x0, y0, x1, y1, rng, clip=None):
    return blocks(F, x0, y0, x1, y1, rng, bw=9, bh=5, cols=(TJ1, TJ2, TJ1), mortar=REJ, clip=clip, tex=.1)


def lunar_blocks(F, x0, y0, x1, y1, rng, clip=None):
    return blocks(F, x0, y0, x1, y1, rng, bw=14, bh=9, cols=(LU1, LU2), mortar='#1a1520', clip=clip, tex=.12)


def metal_band(F, x0, y, x1, h=4, col=MET):
    F.part(R(x0, y, x1, y + h), col, light=.35, dark=.3)
    for x in range(int(x0) + 2, int(x1) - 1, 6):
        rivet(F, x, y + h // 2)


def gold_band(F, x0, y, x1, h=3):
    F.part(R(x0, y, x1, y + h), OURO, light=.4, dark=.35, ol='#4a3208')
    for x in range(int(x0) + 3, int(x1) - 1, 8):
        F.px(x, y + 1, '#fff2b0')


def corrugated(F, shp, x0, cols=(CH1, CH2), period=4, rng=None, rust=3):
    m = F.part(shp, cols[0], tex=.06, light=.25, dark=.3)
    yy, xx = grids(F)
    paint(F, m & ((xx - x0) % period == 0), lt(cols[0], .45), .9)
    paint(F, m & ((xx - x0) % period == 2), cols[1], .9)
    if rng:
        ys, xs = np.nonzero(m)
        for _ in range(rust):
            i = rng.randrange(len(xs))
            rm = F.mask(ell(xs[i], ys[i], rng.uniform(1.5, 3.5), rng.uniform(1, 2.5))) & m
            paint(F, rm, FERR, .75)
    return m


def tile_roof(F, shp, x0, y0, rh=5, tw=7, col=TEL, col2=TEL2):
    m = F.part(shp, col, tex=.1, light=.25, dark=.3)
    yy, xx = grids(F)
    row = (yy - y0) // rh
    paint(F, m & ((yy - y0) % rh == rh - 1), col2, 1)
    paint(F, m & ((xx - x0 + (row % 2) * (tw // 2)) % tw == 0) & ((yy - y0) % rh != rh - 1), col2, .8)
    paint(F, m & ((yy - y0) % rh == 0), lt(col, .3), .7)
    return m


def slate_roof(F, shp, x0, y0):
    m = tile_roof(F, shp, x0, y0, rh=4, tw=6, col='#2a2432', col2=ARD)
    return m


def ripa_roof(F, shp, x0, y0, rng):
    m = F.part(shp, RIPA, tex=.15, light=.22, dark=.3)
    yy, xx = grids(F)
    paint(F, m & ((yy - y0) % 4 == 3), TE, 1)
    paint(F, m & ((yy - y0) % 4 == 0), lt(RIPA, .25), .6)
    ys, xs = np.nonzero(m & ((yy - y0) % 4 == 1))
    for _ in range(len(xs) // 25):
        i = rng.randrange(len(xs))
        F.px(xs[i], ys[i], PREGO)
    return m


def canvas(F, shp, col, rng, patches=2, folds=True, layer=None):
    m = F.part(shp, col, tex=.22, light=.2, dark=.32, layer=layer)
    if not m.any():
        return m
    ys, xs = np.nonzero(m)
    if folds:
        yy, xx = grids(F)
        for _ in range(3):
            i = rng.randrange(len(xs))
            fm = m & (np.abs((xx - xs[i]) - (yy - ys[i]) * rng.uniform(-.6, .6)) < .7) & (np.abs(yy - ys[i]) < 8)
            paint(F, fm, dk(col, .72), 1, layer)
    for _ in range(patches):
        i = rng.randrange(len(xs))
        w, h = rng.randint(5, 9), rng.randint(4, 7)
        pc = rng.choice([REM, '#6f8a5a', '#7a6a4a', LAZ]) if col != REM else L1
        pm = F.part(R(xs[i] - w / 2, ys[i] - h / 2, xs[i] + w / 2, ys[i] + h / 2), pc, clip=m, tex=.2,
                    outline=False, light=.25, dark=.3, layer=layer)
        # pontos de costura
        py, pxx = np.nonzero(pm & ~(shift_m(pm, 1, 0) & shift_m(pm, -1, 0) & shift_m(pm, 0, 1) & shift_m(pm, 0, -1)))
        for j in range(0, len(pxx), 2):
            F.px(pxx[j], py[j], '#e8dcc0' if layer is None else '#e8dcc0', layer)
    return m


def shift_m(m, dx, dy):
    o = np.zeros_like(m)
    h, w = m.shape
    o[max(0, dy):min(h, h + dy), max(0, dx):min(w, w + dx)] = m[max(0, -dy):min(h, h - dy), max(0, -dx):min(w, w - dx)]
    return o


RUNES = [["010", "111", "010", "101", "101"], ["110", "010", "011", "010", "110"], ["101", "010", "111", "010", "101"],
         ["111", "100", "110", "001", "111"], ["010", "101", "010", "010", "111"]]


def rune(F, x, y, k=0, glowr=7):
    g = RUNES[k % len(RUNES)]
    for j, row in enumerate(g):
        for i, b in enumerate(row):
            if b == '1':
                F.px(x + i, y + j, RUNA2)
    glow(F, x + 1, y + 2, glowr, RUNA, alpha=90)
    for j, row in enumerate(g):
        for i, b in enumerate(row):
            if b == '1':
                F.px(x + i, y + j, '#ff8a8a' if (i + j) % 3 == 0 else RUNA2, F.fx)


def flame(F, x, y, s=4, kind='fire', glow_a=110):
    if kind == 'red':
        c0, c1, c2, olc, gc = '#8a1a22', RUNA, RUNA2, '#3a0a10', RUNA
        core = '#ffb0a0'
    else:
        c0, c1, c2, olc, gc = '#c8461e', '#ff8a2a', '#ffc04a', '#4a1408', '#ff8a2a'
        core = '#fff0a0'
    glow(F, x, y - s * 1.5, s * 4.5, gc, alpha=glow_a)
    pts = lambda k: poly((x, y - 3.4 * s * k), (x + s * .55 * k, y - 2.0 * s * k), (x + s * 1.05 * k, y - .9 * s * k),
                         (x + s * .9 * k, y), (x - s * .9 * k, y), (x - s * 1.05 * k, y - .9 * s * k),
                         (x - s * .3 * k, y - 2.3 * s * k))
    F.part(pts(1), c1, shade=False, ol=olc, layer=F.fx)
    F.part(pts(.8), c0 if kind == 'red' else c1, shade=False, outline=False, layer=F.fx)
    F.part(mv(pts(.62), 0, 0), c2, shade=False, outline=False, layer=F.fx)
    F.part(mv(pts(.32), 0, 0), core, shade=False, outline=False, layer=F.fx)
    # tongues
    F.part(poly((x - s * .8, y - s * 1.2), (x - s * 1.4, y - s * 2.6), (x - s * .3, y - s * 1.8)), c1, shade=False, ol=olc, layer=F.fx)
    F.part(poly((x + s * .7, y - s * 1.4), (x + s * 1.2, y - s * 2.8), (x + s * .2, y - s * 2.0)), c1, shade=False, ol=olc, layer=F.fx)


def smoke(F, x, y, n=3, r=4, drift=2, dark=False):
    cols = ['#3a343e', '#4a4450', '#5e5864', '#726c78'] if dark else ['#56505c', '#6a6470', '#7e7884', '#928c98']
    for k in range(n):
        puff(F, x + drift * k + (k % 2), y - k * (r + 3), r=r + k * .8, col=cols[min(k, 3)])


def embers(F, x0, y0, x1, y1, rng, n=5, red=False):
    for _ in range(n):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        F.px(x, y, (RUNA2 if red else '#ff9a3a'), F.fx)
        if rng.random() < .5:
            F.px(x, y - 1, ('#ffb0a0' if red else '#ffe07a'), F.fx)


# ---------------- dano / destruição ----------------

def soot(F, rng, box, n=3, k=.55):
    x0, y0, x1, y1 = box
    sol = F.a[..., 3] > 0
    for _ in range(n):
        cx, cy = rng.uniform(x0, x1), rng.uniform(y0, y1)
        rx, ry = rng.uniform(6, 13), rng.uniform(5, 10)
        paint(F, F.mask(ell(cx, cy, rx, ry)) & sol, FUL, k * .6)
        paint(F, F.mask(ell(cx + 1, cy + 1, rx * .55, ry * .55)) & sol, FUL, k)


def cracks(F, rng, box, n=3, ln=(10, 18)):
    x0, y0, x1, y1 = box
    sol = F.a[..., 3] > 0
    ys, xs = np.nonzero(sol[int(y0):int(y1), int(x0):int(x1)])
    if not len(xs):
        return
    for _ in range(n):
        i = rng.randrange(len(xs))
        x, y = xs[i] + int(x0), ys[i] + int(y0)
        L = rng.randint(*ln)
        dx = rng.choice([-1, 1])
        for s in range(L):
            if 0 <= x < F.w and 0 <= y < F.h and sol[y, x]:
                F.a[y, x, :3] = (18, 12, 16)
                if s % 4 == 1 and x + 1 < F.w and sol[y, x + 1]:
                    F.a[y, x + 1, :3] = np.clip(F.a[y, x + 1, :3] * .6, 0, 255)
            y += 1
            if rng.random() < .5:
                x += dx
            if rng.random() < .15:
                dx = -dx
            if s == L // 2 and rng.random() < .7:
                bx, by = x, y
                for t in range(L // 3):
                    bx += -dx; by += rng.choice([0, 1])
                    if 0 <= bx < F.w and 0 <= by < F.h and sol[by, bx]:
                        F.a[by, bx, :3] = (18, 12, 16)


def damage(F, rng, box, fire_at, smoke_at, loose=None, holes=()):
    soot(F, rng, box, 3)
    cracks(F, rng, box, 4)
    for (hx, hy, hr) in holes:
        sol = F.a[..., 3] > 0
        pts = [(hx + hr * math.cos(a) * rng.uniform(.6, 1.2), hy + hr * .8 * math.sin(a) * rng.uniform(.6, 1.2))
               for a in np.linspace(0, 2 * math.pi, 9)[:-1]]
        hm = F.mask([pts]) & sol
        F.a[hm, :3] = (26, 18, 22)
        edge = hm & ~shift_m(hm, 1, 1)
        F.a[edge, :3] = (60, 44, 48)
    if loose:
        loose(F, rng)
    x, y = fire_at
    flame(F, x, y, 3.2)
    sx, sy = smoke_at
    smoke(F, sx, sy, 3, 3.5)


def stub(F, T, cut, rng, jag=4):
    """copia de T só o que está abaixo de uma linha serrilhada (toco da construção)."""
    yy, xx = grids(F)
    line = np.zeros(F.w)
    y = cut
    for x in range(F.w):
        if x % rng.randint(2, 4) == 0:
            y = cut + rng.randint(-jag, jag)
        line[x] = y
    keep = yy > line[None, :]
    keep &= T.a[..., 3] > 0
    F.a[keep] = T.a[keep]
    top = keep & ~shift_m(keep, 0, 1)
    paint(F, top, '#140c10', 1)
    for d in (1, 2, 3):
        paint(F, shift_m(top, 0, d) & keep, FUL, .6 - d * .12)
    soot(F, rng, (0, cut, F.w, cut + 30), 3, .5)


def mound(F, cx, gy, hw, ht, col, rng):
    pts = []
    n = 14
    for i in range(n + 1):
        t = i / n
        x = cx - hw + 2 * hw * t
        y = gy - ht * (math.sin(math.pi * t) ** .7) * rng.uniform(.8, 1.1)
        pts.append((x, y))
    pts += [(cx + hw, gy + 1), (cx - hw, gy + 1)]
    F.part([pts], col, tex=.4, light=.2, dark=.35)
    return lambda x: gy - ht * (max(0, math.sin(math.pi * (x - cx + hw) / (2 * hw))) ** .7)


def piece(F, lvl, x, y, rng, big=False):
    a = rng.uniform(-50, 50)
    s = 1.3 if big else 1.0
    if lvl == 1:
        k = rng.random()
        if k < .5:
            pts = [(x + rng.uniform(-9, 9) * s, y + rng.uniform(-5, 4) * s) for _ in range(5)]
            pts.sort(key=lambda p: math.atan2(p[1] - y, p[0] - x))
            F.part([pts], jit(rng.choice([L1, L1B, LAZ, REM]), rng), tex=.25, light=.25)
        elif k < .75:
            F.part(limb(x - 10 * s, y + rng.uniform(-4, 4), x + 10 * s, y + rng.uniform(-6, 6), 3), ESTACA, light=.3)
        else:
            m = F.part(rrect(x, y, 14 * s, 8 * s, a), SUC, tex=.15, marks=[(ell(x + 2, y, 3, 2), FERR)])
    elif lvl == 2:
        L = rng.uniform(14, 24) * s
        m = F.part(rrect(x, y, L, 5, a), jit(rng.choice([T1, T2, TE]), rng), tex=.15)
        c, sn = math.cos(math.radians(a)), math.sin(math.radians(a))
        F.px(x + c * (L / 2 - 2), y + sn * (L / 2 - 2), PREGO)
        F.part(poly((x - c * L / 2, y - sn * L / 2 - 2), (x - c * (L / 2 + 3), y - sn * (L / 2 + 3)),
                    (x - c * L / 2, y - sn * L / 2 + 2)), T2)
    elif lvl == 3:
        if rng.random() < .7:
            F.part(rrect(x, y, 11 * s, 7 * s, a * .5), jit(rng.choice([P1, P2]), rng), tex=.22, light=.3)
        else:
            F.part(rrect(x, y, 8, 3, a), rng.choice([TEL, TEL2]), light=.3)
    elif lvl == 4:
        k = rng.random()
        if k < .55:
            F.part(rrect(x, y, 9 * s, 5 * s, a * .5), jit(rng.choice([TJ1, TJ2]), rng), tex=.15, light=.3)
        elif k < .8:
            shp = rrect(x, y, 18 * s, 8 * s, a * .6)
            corrugated(F, shp, int(x), rng=None)
        else:
            F.part(limb(x - 9, y + 3, x + 9, y - 3, 2.5), MET, light=.4)
    else:
        k = rng.random()
        if k < .6:
            m = F.part(rrect(x, y, 12 * s, 8 * s, a * .5), jit(rng.choice([LU1, LU2]), rng), tex=.15, light=.3)
            if rng.random() < .5:
                F.part(rrect(x, y - 3, 12 * s, 2, a * .5), OURO, ol='#4a3208', shade=False)
        elif k < .8:
            F.part(rrect(x, y, 8, 3, a), ARD, light=.35)
        else:
            F.part(rrect(x, y, 7, 6, a), LU2)
            F.px(x - 1, y, RUNA2); F.px(x, y - 1, RUNA2); F.px(x + 1, y, RUNA2)
            glow(F, x, y, 6, RUNA, 70)


MOUND = {1: '#5a5040', 2: '#4a3a2c', 3: '#6a6660', 4: '#5a4038', 5: '#2a2430'}


def rubble(F, lvl, cx, gy, hw, ht, rng, n=22, fire=True):
    top = mound(F, cx, gy, hw, ht, MOUND[lvl], rng)
    items = []
    for _ in range(n):
        x = cx + rng.uniform(-hw * .85, hw * .85)
        yt = top(x)
        items.append((rng.uniform(yt + 2, gy - 2), x))
    items.sort()
    beams = sorted([rng.uniform(0, n) for _ in range(2)])
    bi = 0
    for i, (y, x) in enumerate(items):
        while bi < len(beams) and i >= beams[bi]:
            bx = cx + rng.uniform(-hw * .5, hw * .5)
            by = top(bx) + 6
            a = rng.choice([-1, 1]) * rng.uniform(25, 60)
            Lb = rng.uniform(24, 34)
            c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
            F.part(limb(bx - c * Lb / 2, by - abs(s) * Lb / 2, bx + c * Lb / 2, by + abs(s) * Lb / 4, 5, 4), VIGA, tex=.3, light=.15)
            for t in range(3):
                q = rng.uniform(-.4, .4)
                F.px(bx + c * Lb * q, by - abs(s) * Lb * q * .8, '#ff7a2a')
            bi += 1
        piece(F, lvl, x, y, rng, big=rng.random() < .3)
    if fire:
        fx = cx + rng.uniform(-hw * .3, hw * .3)
        flame(F, fx, top(fx) + 3, 3.0)
        embers(F, cx - hw * .6, gy - ht - 10, cx + hw * .6, gy - ht + 6, rng, 6)
    sx = cx + rng.uniform(-hw * .2, hw * .3)
    smoke(F, sx, top(sx) - 6, 4, 4.5, dark=True)


def barbed(F, x0, x1, y, r=5):
    for cx in range(int(x0) + r, int(x1) - r + 1, r + 2):
        pts = [(cx + r * math.cos(math.radians(a)), y + r * .7 * math.sin(math.radians(a))) for a in range(0, 361, 15)]
        for (a, b) in zip(pts, pts[1:]):
            back = a[1] < y
            F.line(a[0], a[1], b[0], b[1], '#3a3e44' if back else '#22262a')
        F.px(cx - 2, y - r * .7, '#b0b6bc'); F.px(cx - 1, y - r * .7, '#b0b6bc')
        for a in (40, 160, 280):
            x, yy = cx + r * math.cos(math.radians(a)), y + r * .7 * math.sin(math.radians(a))
            F.px(x - 1, yy - 1, '#8a9096'); F.px(x + 1, yy + 1, '#8a9096'); F.px(x + 1, yy - 1, '#5a6066')


def eglow(F, cx, cy, rx, ry, col, alpha=120):
    L = F.fx
    yy, xx = grids(F)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    a = np.clip(1 - d, 0, 1) ** 1.2 * alpha
    a = (np.round(a / 24) * 24).astype(np.uint8)
    src = np.zeros_like(L)
    src[..., :3] = C(col)
    src[..., 3] = a
    L[:] = over(L, src)


def finish(F, sh):
    return compose(F, shadow=sh)


def three_states(draw, w, h, gy, sh_rx, rng_seed, dmg, des):
    """draw(F, lvl, rng) desenha a construção intacta; dmg(F, lvl, rng); des(F, T, lvl, rng)."""
    frames = {('i', l): None for l in range(1, 6)}
    out = []
    for state in ('i', 'd', 'x'):
        for lvl in range(1, 6):
            rng = random.Random(rng_seed * 100 + lvl)
            sh = shadow_layer(w / 2 + 5, sh_rx, 5, 100, w, h, gy)
            F = Frame(w, h)
            if state == 'x':
                T = Frame(w, h)
                draw(T, lvl, random.Random(rng_seed * 100 + lvl))
                des(F, T, lvl, random.Random(rng_seed * 1000 + lvl))
            else:
                draw(F, lvl, rng)
                if state == 'd':
                    dmg(F, lvl, random.Random(rng_seed * 1000 + lvl + 7))
            out.append(finish(F, sh))
    return out


# =====================================================================
#                           POSTO DE GUARDA
# =====================================================================
W1, H1, GY1 = 128, 160, 148


def crate(F, x0, y1, w, h, rng, col='#a8804c', top=True):
    x1, y0 = x0 + w, y1 - h
    F.part(R(x0, y0, x1, y1), '#2a1c14', light=0, dark=0)
    sh = (h - 4) / 3
    for k in range(3):
        a = y0 + 1 + k * (sh + 1)
        plank(F, x0 + 1, a, x1 - 1, a + sh - 1, jit(col, rng, .05), rng, vertical=False, nails=False)
    for xx in (x0, x1 - 3):
        F.part(R(xx, y0, xx + 3, y1), dk(col, .82), light=.25)
        nail(F, xx + 1, y0 + 2); nail(F, xx + 1, y1 - 3)
    # carimbo
    for i in range(4):
        F.px(x0 + w / 2 - 3 + i * 2, y0 + 1 + sh + 1 + sh / 2, dk(col, .55))
    if top:
        F.part(R(x0, y0 - 4, x1, y0), lt(col, .1), light=.3)
        F.part(R(x0 + 3, y0 - 3, x1 - 3, y0 - 1), '#2a1c14', shade=False, outline=False)


def drum(F, x0, y1, w, h, rng, col=SUC, paint_col='#3f5a6c'):
    x1, y0 = x0 + w, y1 - h
    cx = (x0 + x1) / 2
    marks = [(R(x0, y0 + h * .25, x1, y0 + h * .7), paint_col)]
    for _ in range(4):
        marks.append((ell(rng.uniform(x0, x1), rng.uniform(y0, y1), rng.uniform(2, 4), rng.uniform(1.5, 3)), FERR))
    F.part(R(x0, y0, x1, y1) + ell(cx, y1 - 1, w / 2, 2.5), col, marks=marks, tex=.2, light=.3)
    for ry in (y0 + h * .33, y0 + h * .66):
        F.line(x0 + 1, ry, x1 - 1, ry, dk(col, .55))
        F.line(x0 + 1, ry - 1, x1 - 1, ry - 1, lt(col, .35))
    F.part(ell(cx, y0, w / 2, 3), lt(col, .12), marks=[(ell(cx + w * .2, y0, 2, 1), '#2a2a2a')], light=.3)


def plastic_chair(F, x, y, col='#d4cebd'):
    """x = centro, y = altura do assento."""
    dkc = dk(col, .72)
    F.part(limb(x - 9, y, x - 11, y + 11, 2.5) + limb(x + 9, y, x + 11, y + 11, 2.5), dkc, light=.2)
    F.part(R(x - 11, y - 22, x + 11, y - 6), col, marks=[(R(x - 8, y - 18, x + 8, y - 16), dk(col, .55)),
                                                          (R(x - 8, y - 13, x + 8, y - 11), dk(col, .55))], light=.3)
    F.part(poly((x - 13, y - 4), (x + 13, y - 4), (x + 12, y + 1), (x - 12, y + 1)), col, light=.35)
    F.part(limb(x - 11, y + 1, x - 13, y + 12, 3) + limb(x + 11, y + 1, x + 13, y + 12, 3), col, light=.3)
    F.px(x - 6, y - 20, '#8a8474'); F.px(x + 4, y - 8, '#8a6a4a'); F.px(x + 5, y - 8, '#8a6a4a')


def flag(F, x, ytop, ybot, col, rng, w=14, h=9, wave=0, pole=TE):
    F.part(limb(x, ybot, x, ytop, 2.2), pole, light=.3)
    pts = [(x + 1, ytop + 1)]
    for i in range(1, 6):
        t = i / 5
        pts.append((x + 1 + w * t, ytop + 1 + math.sin(t * 3 + wave) * 1.5 + t * 1.5))
    for i in range(5, -1, -1):
        t = i / 5
        pts.append((x + 1 + w * t - (2 if i == 5 else 0), ytop + 1 + h + math.sin(t * 3 + wave) * 1.5 + t * 1.5 - (h / 2 if i == 5 else 0) * 0))
    F.part([pts], col, tex=.15, light=.3)


def ladder(F, x0, y0, x1, y1, rng, col=T2, w=16, rung=7, rope=False, wr=3):
    F.part(limb(x0, y0, x1, y1, wr) + limb(x0 + w, y0, x1 + w, y1, wr), col, light=.25, tex=.1)
    n = int(abs(y0 - y1) / rung)
    for k in range(1, n):
        t = k / n
        ax, ay = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        F.part(R(ax + 1, ay - 1, ax + w - 1, ay + 1), lt(col, .05), light=.35)
        if rope:
            F.px(ax + 1, ay, CORDA); F.px(ax + w - 1, ay, CORDA); F.px(ax + 1, ay - 1, dk(CORDA, .7))


def guard_n1(F, rng):
    # estacas e cordas da lona de sombra
    F.part(limb(24, 146, 20, 46, 4, 3), ESTACA, tex=.2)
    F.part(limb(106, 146, 104, 56, 4, 3), ESTACA, tex=.2)
    rope_line(F, 20, 47, 4, 147, sag=-2)
    rope_line(F, 104, 57, 124, 147, sag=-2)
    F.part(poly((3, 147), (6, 147), (5, 142)), ESTACA); F.part(poly((122, 147), (125, 147), (124, 142)), ESTACA)
    # chapa de sucata encostada atrás
    m = F.part(poly((84, 100), (104, 98), (108, 146), (88, 147)), SUC, tex=.2,
               marks=[(ell(96, 116, 5, 4), FERR), (ell(101, 135, 3, 4), FERR)])
    for x in (89, 94, 99, 104):
        F.line(x - 2, 100, x, 145, dk(SUC, .7))
    # caixotes e tambor
    drum(F, 28, 148, 26, 30, rng)
    crate(F, 54, 148, 38, 27, rng)
    crate(F, 38, 121, 40, 24, rng, col='#9c7646')
    # lona verde amarrada por cima dos caixotes
    sk = [(26, 112), (44, 110), (60, 116), (78, 112), (84, 118), (80, 130), (70, 128), (62, 140), (52, 132), (40, 138), (30, 128)]
    canvas(F, [sk], L1, rng, patches=2)
    rope_line(F, 28, 122, 80, 124, sag=3)
    # cadeira de plástico
    plastic_chair(F, 58, 92)
    # garrafa e lata no caixote
    F.part(R(73, 87, 76, 97) + R(74, 84, 75, 87), '#3f7a4a', light=.4)
    # lona azul de sombra
    tarp = [(18, 48), (42, 44), (66, 47), (90, 52), (106, 56), (104, 63), (84, 62), (62, 58), (40, 58), (22, 58)]
    canvas(F, [tarp], LAZ, rng, patches=1)
    for (x, y) in [(32, 59), (52, 60), (72, 61), (94, 64)]:
        F.part(poly((x - 3, y - 1), (x + 3, y - 1), (x, y + 4)), dk(LAZ, .8), light=.2)
    rope_line(F, 20, 48, 24, 58, 0)
    # bandeira de trapo
    flag(F, 106, 34, 58, '#b8433a', rng, w=12, h=8, pole=ESTACA)
    # escada de varas encostada
    ladder(F, 92, 148, 84, 96, rng, col=ESTACA, w=11, rung=8, rope=True, wr=2.6)
    # garrafa no chão
    F.part(R(14, 140, 18, 147) + R(15, 137, 17, 140), '#4a8a5a', light=.5)


def guard_n2(F, rng):
    # pernas de trás
    for (a, b) in [((40, 140), (44, 64)), ((88, 140), (84, 64))]:
        F.part(limb(a[0], a[1], b[0], b[1], 5), TE, tex=.15, light=.15)
    F.part(limb(42, 108, 86, 108, 3), TE, light=.1)
    # pernas da frente
    for (a, b) in [((24, 147), (34, 66)), ((104, 147), (94, 66))]:
        F.part(limb(a[0], a[1], b[0], b[1], 7, 6), T2, tex=.18)
        F.line(a[0] + 1, a[1] - 4, b[0] + 1, b[1] + 6, dk(T2, .7))
    # contraventamento em X
    F.part(limb(30, 140, 98, 106, 4), T1, tex=.1)
    F.part(limb(98, 140, 30, 106, 4), T1, tex=.1)
    F.part(limb(29, 104, 99, 104, 4.5), T2, tex=.1)
    F.part(limb(33, 100, 95, 72, 4), T1, tex=.1)
    F.part(limb(95, 100, 33, 72, 4), T1, tex=.1)
    for (x, y) in [(30, 140), (98, 140), (30, 106), (98, 106), (33, 100), (95, 100), (33, 73), (95, 73), (64, 123), (64, 86)]:
        nail(F, x, y)
    # postes do telhado (fundo)
    for x in (34, 94):
        F.part(R(x - 2, 22, x + 2, 50), TE, light=.2)
    # plataforma
    F.part(R(26, 54, 102, 60), lt(T1, .1), tex=.1)
    yy, xx = grids(F)
    paint(F, F.mask(R(27, 55, 101, 59)) & ((xx % 6) == 0), TE, 1)
    planks(F, 22, 60, 106, 68, rng, pw=8, vertical=False, cols=(T2,), nails=True)
    # guarda-corpo de tábuas
    planks(F, 24, 40, 104, 56, rng, pw=6, cols=(T1, T2, '#8a5e36'), ragged=1)
    F.part(R(22, 37, 106, 41), T2, tex=.1)
    for x in (24, 102):
        F.part(R(x - 2, 22, x + 2, 41), T2, light=.25)
    # telhado de ripas
    roof = [(14, 26), (40, 10), (88, 10), (114, 26), (114, 29), (14, 29)]
    ripa_roof(F, [roof], 14, 10, rng)
    F.part(R(12, 26, 116, 30), TE, light=.3)
    F.part(R(40, 7, 88, 11), T2, light=.3)
    # escada
    ladder(F, 52, 148, 54, 62, rng, col=T1, w=18, rung=8)
    # barril de madeira
    bx = 104
    F.part(poly((bx, 124), (bx + 18, 124), (bx + 20, 136), (bx + 18, 148), (bx, 148), (bx - 2, 136)), T1, tex=.15,
           marks=[(R(bx - 2, 128, bx + 20, 130), MET), (R(bx - 2, 142, bx + 20, 144), MET)])
    for x in (bx + 4, bx + 9, bx + 14):
        F.line(x, 125, x, 147, dk(T1, .7))
    F.part(ell(bx + 9, 124, 9, 2.5), lt(T1, .15), light=.3)
    flag(F, 64, 0, 9, '#b8433a', rng, w=14, h=8, pole=TE)
    F.part(R(62, 7, 66, 9), TE)


def guard_n3(F, rng):
    # casinha de pedra em cima (fundo)
    blocks(F, 38, 30, 90, 56, rng, bw=10, bh=6)
    F.part(R(58, 36, 70, 48), '#1c1418', marks=[(R(63, 36, 65, 48), '#3a2a20'), (R(58, 41, 70, 43), '#3a2a20')], shade=False)
    roof = [(30, 34), (52, 12), (76, 12), (98, 34), (98, 36), (30, 36)]
    tile_roof(F, [roof], 30, 12)
    F.part(R(50, 9, 78, 13), TEL2, light=.35)
    flag(F, 64, 0, 10, '#b8433a', rng, w=14, h=8, pole=TE)
    # torre
    blocks(F, 30, 76, 98, 140, rng, bw=12, bh=7, moss=.08)
    blocks(F, 26, 136, 102, 148, rng, bw=16, bh=6, cols=(P2, '#6a6660'))
    # mata-cães (consolas)
    for x in range(30, 99, 10):
        F.part(R(x, 72, x + 5, 79), P2, light=.3)
    # parapeito com ameias
    blocks(F, 24, 56, 104, 74, rng, bw=11, bh=6)
    for x0 in (24, 46, 70, 92):
        blocks(F, x0, 44, x0 + 12, 57, rng, bw=6, bh=6)
        F.part(R(x0 - 1, 42, x0 + 13, 45), lt(P1, .1), light=.3)
    F.part(R(23, 55, 105, 58), lt(P1, .1), light=.3)
    # seteira
    F.part(R(60, 88, 67, 110), P2, light=.3)
    F.part(R(62, 90, 65, 108), '#140c10', shade=False)
    F.part(R(60, 84, 68, 88), ARG, light=.3)
    # porta de madeira em arco
    F.part(R(51, 120, 77, 148) + ell(64, 121, 13, 7), P2, light=.3)
    F.part(R(54, 122, 74, 148) + ell(64, 123, 10, 5), '#1c1418', shade=False)
    planks(F, 55, 120, 73, 147, rng, pw=5, cols=(T2, T1), nails=False)
    for y in (126, 140):
        F.part(R(55, y, 73, y + 2), '#3a3a40', light=.3)
        F.px(56, y + 1, REB); F.px(72, y + 1, REB)
    F.px(70, 134, '#c9c3b0')
    # tocha
    F.part(R(84, 112, 87, 124), '#3a3a40', light=.3)
    F.part(poly((82, 108), (89, 108), (87, 113), (84, 113)), TE)
    flame(F, 85.5, 108, 2.4, glow_a=90)


def guard_n4(F, rng):
    # postes do telhado
    for x in (30, 98):
        F.part(R(x - 1, 28, x + 2, 52), CH2, light=.3)
    # telhado de chapa ondulada
    roof = [(16, 30), (26, 14), (102, 14), (112, 30), (112, 33), (16, 33)]
    corrugated(F, [roof], 16, rng=rng, rust=4)
    F.part(R(14, 30, 114, 34), MET, light=.35)
    for x in range(18, 112, 8):
        rivet(F, x, 32)
    # corpo de tijolo
    bricks(F, 36, 74, 92, 148, rng)
    for y in (84, 108, 132):
        metal_band(F, 34, y, 94)
    F.part(R(33, 74, 37, 148), MET, light=.35); F.part(R(91, 74, 95, 148), MET, light=.35)
    for y in range(78, 146, 7):
        rivet(F, 34, y); rivet(F, 92, y)
    # porta de chapa
    F.part(R(54, 116, 74, 148), CH2, marks=[(R(56, 118, 72, 130), CH1), (R(56, 133, 72, 146), CH1)], light=.3)
    for (x, y) in [(56, 118), (71, 118), (56, 145), (71, 145), (56, 131), (71, 131)]:
        rivet(F, x, y)
    F.part(R(69, 134, 71, 137), '#c9a040')
    # lâmpada
    F.part(R(60, 109, 68, 113), MET, light=.3)
    F.part(ell(64, 115, 3, 2.5), LAMP, shade=False, ol='#6a5010')
    glow(F, 64, 116, 18, LAMP, alpha=110)
    # plataforma de grade
    for (a, b) in [((36, 80), (22, 66)), ((92, 80), (106, 66))]:
        F.part(limb(a[0], a[1], b[0], b[1], 3), MET, light=.35)
    F.part(R(20, 58, 108, 64), CH1, light=.35)
    yy, xx = grids(F)
    paint(F, F.mask(R(21, 59, 107, 63)) & ((xx + yy) % 3 == 0), '#3a4046', 1)
    F.part(R(18, 64, 110, 68), MET, light=.3)
    for x in range(21, 108, 7):
        rivet(F, x, 66)
    # guarda-corpo
    for x in range(20, 110, 11):
        F.part(R(x, 42, x + 2, 59), MET, light=.4)
    for y in (42, 50):
        F.part(R(19, y, 109, y + 2), CH1, light=.4)
    # arame farpado no topo do guarda-corpo
    for x in range(19, 109):
        y = 39 + (1 if (x // 3) % 2 else 0)
        F.px(x, y, '#4a4e54')
        if x % 6 == 0:
            F.px(x, y - 1, '#9aa0a6'); F.px(x, y + 2, '#9aa0a6')
    # holofote (esquerda, mira para cima-esquerda)
    beam = poly((18, 48), (0, 18), (0, 2), (24, 42))
    F.flat(beam, '#ffe9a0', layer=F.fx, alpha=70)
    F.flat(poly((19, 46), (0, 22), (0, 12), (22, 44)), '#fff4c8', layer=F.fx, alpha=60)
    F.part(R(22, 50, 26, 58), CH2)
    F.part(rot(R(16, 40, 30, 50), 23, 45, 40), MET, light=.35, tex=.1)
    F.part(rot(ell(17, 42, 3, 5), 17, 42, 40), LAMP, shade=False, ol='#6a5010')
    glow(F, 17, 42, 14, '#fff4c8', 140)
    # escada lateral de metal
    ladder(F, 96, 148, 96, 70, rng, col=MET, w=8, rung=6, wr=2)
    # arame farpado na base
    barbed(F, 4, 34, 143)
    barbed(F, 100, 126, 143)
    flag(F, 64, 0, 14, '#3f6a8c', rng, w=14, h=8, pole=MET)


def guard_n5(F, rng):
    # torres de canto (pináculos)
    for x0 in (22, 94):
        lunar_blocks(F, x0, 46, x0 + 12, 66, rng)
        slate_roof(F, [[(x0 - 1, 46), (x0 + 6, 30), (x0 + 13, 46)]], x0, 30)
        F.part(R(x0 + 5, 25, x0 + 7, 31), OURO, ol='#4a3208')
        F.part(ell(x0 + 6, 25, 2, 2), OURO, ol='#4a3208')
    # corpo afunilado
    body = poly((32, 148), (96, 148), (90, 74), (38, 74))
    cm = F.mask(body)
    lunar_blocks(F, 30, 74, 98, 148, rng, clip=cm)
    F.part(limb(33, 147, 39, 75, 3.5) + limb(95, 147, 89, 75, 3.5), OURO, ol='#4a3208', light=.4)
    gold_band(F, 28, 140, 100, 4)
    # porta
    F.part(R(55, 124, 73, 141) + ell(64, 125, 9, 6), OURO, ol='#4a3208')
    F.part(R(57, 126, 71, 141) + ell(64, 127, 7, 4), '#120a10', shade=False)
    glow(F, 64, 134, 10, RUNA, 60)
    # estandarte vermelho
    F.part(R(50, 78, 78, 81), OURO2, ol='#4a3208')
    ban = poly((52, 81), (76, 81), (76, 116), (64, 110), (52, 116))
    F.part(ban, '#9a1e28', tex=.12, light=.3, marks=[(R(52, 81, 54, 116), '#7a1420'), (R(74, 81, 76, 116), '#7a1420')])
    F.part(ell(64, 95, 6, 6), OURO, ol='#4a3208', shade=False)
    F.part(ell(66.5, 93.5, 5, 5), '#9a1e28', outline=False, shade=False)
    for x in range(53, 76, 3):
        F.px(x, 84, OURO2)
    # runas
    rune(F, 41, 96, 0); rune(F, 84, 96, 2); rune(F, 41, 120, 3); rune(F, 84, 120, 1)
    # parapeito
    lunar_blocks(F, 26, 60, 102, 76, rng)
    gold_band(F, 24, 58, 104, 3)
    for x0 in (34, 46, 74, 86):
        F.part(poly((x0, 58), (x0 + 8, 58), (x0 + 8, 50), (x0 + 4, 45), (x0, 50)), LU2, light=.3)
        F.part(poly((x0 + 3, 47), (x0 + 4, 44), (x0 + 5, 47)), OURO, ol='#4a3208', shade=False)
    # braseiro
    for (a, b) in [((52, 60), (56, 48)), ((76, 60), (72, 48)), ((64, 60), (64, 50))]:
        F.part(limb(a[0], a[1], b[0], b[1], 2.5), OURO2, ol='#3a2408', light=.4)
    F.part(poly((46, 38), (82, 38), (78, 48), (50, 48)), OURO, ol='#4a3208', light=.4,
           marks=[(R(46, 41, 82, 43), OURO2)])
    for x in range(50, 80, 6):
        F.px(x, 45, '#fff2b0')
    F.part(ell(64, 38, 18, 3), '#3a1018', shade=False, ol='#4a3208')
    embers_on = [(54, 37), (60, 36), (68, 37), (74, 36)]
    for (x, y) in embers_on:
        F.px(x, y, RUNA2)
    flame(F, 64, 39, 7.5, kind='red', glow_a=130)
    embers(F, 44, 2, 84, 22, rng, 7, red=True)


GUARD = {1: guard_n1, 2: guard_n2, 3: guard_n3, 4: guard_n4, 5: guard_n5}


def guard_draw(F, lvl, rng):
    GUARD[lvl](F, rng)


def guard_loose(lvl):
    def f(F, rng):
        if lvl == 1:
            canvas(F, [[(96, 64), (104, 63), (110, 82), (102, 86), (98, 76)]], LAZ, rng, patches=0)
            F.part(rrect(14, 145, 18, 4, -8), '#a8804c', tex=.15)
        elif lvl == 2:
            F.part(rrect(14, 145, 22, 5, -12), T1, tex=.15); F.px(6, 147, PREGO)
            F.part(rrect(108, 146, 16, 4, 10), T2, tex=.15)
        elif lvl == 3:
            F.part(rrect(14, 143, 12, 8, -10), P1, tex=.2, light=.3)
            F.part(rrect(112, 145, 9, 6, 15), P2, tex=.2, light=.3)
        elif lvl == 4:
            F.part(rrect(14, 144, 9, 5, -14), TJ1, tex=.1, light=.3)
            corrugated(F, rrect(108, 143, 20, 9, 18), 100)
        else:
            F.part(rrect(14, 143, 13, 8, -10), LU2, light=.3)
            F.part(rrect(14, 139, 13, 2, -10), OURO, ol='#4a3208', shade=False)
    return f


def guard_dmg(F, lvl, rng):
    fires = {1: ((40, 112), (44, 100)), 2: ((84, 56), (90, 36)), 3: ((38, 74), (44, 60)), 4: ((84, 84), (88, 70)), 5: ((90, 74), (96, 60))}
    holes = {1: [], 2: [(46, 48, 4)], 3: [(80, 98, 5)], 4: [(46, 98, 5)], 5: [(84, 108, 4)]}
    (fa, sa) = fires[lvl]
    damage(F, rng, (20, 30, 108, 148), fa, sa, guard_loose(lvl), holes[lvl])


def guard_des(F, T, lvl, rng):
    cut = {1: 116, 2: 102, 3: 100, 4: 100, 5: 102}[lvl]
    stub(F, T, cut, rng, jag=6)
    rubble(F, lvl, 64, 148, 54, 20, rng, n=26)
    # resto reconhecível
    if lvl == 1:
        F.part(limb(84, 144, 94, 130, 2.5) + limb(92, 144, 100, 132, 2.5), '#d4cebd', light=.3)
        F.part(rrect(92, 132, 14, 4, -30), '#d4cebd', light=.3)
    elif lvl == 2:
        ladder(F, 86, 147, 104, 122, rng, col=T1, w=10, rung=7, wr=3)
    elif lvl == 4:
        F.part(rrect(98, 140, 12, 9, 25), MET, light=.3)
        F.part(ell(93, 138, 3, 4), '#4a4a40')
        F.px(92, 137, '#fff4c8')
    elif lvl == 5:
        F.part(rrect(96, 140, 26, 8, 20), OURO, ol='#4a3208', light=.4, marks=[(rrect(96, 140, 26, 2, 20), OURO2)])
        embers(F, 84, 140, 110, 147, rng, 5, red=True)
    elif lvl == 3:
        F.part(rrect(30, 140, 16, 6, -15), TEL, light=.3)


def make_guard():
    fr = three_states(guard_draw, W1, H1, GY1, 50, 11, guard_dmg, guard_des)
    grid(fr, 5).save(os.path.join(OUT, 'est_posto_guarda.png'))


# =====================================================================
#                           PILHA DE TORAS
# =====================================================================
W2, H2, GY2 = 256, 192, 180


def log_end(F, cx, cy, r, rng, lvl=2, depth=None, charred=False):
    d = r * .8 if depth is None else depth
    bark = '#241e2a' if lvl == 5 else BARK
    face = '#3c3446' if lvl == 5 else CERNE
    ring = RUNA if lvl == 5 else ANEL
    if charred:
        bark, face, ring = '#2a1e18', '#3a2a22', '#1a1210'
    # casca indo para trás
    m = F.part(R(cx - r, cy - d, cx + r, cy) + ell(cx, cy - d, r, r * .55), bark, tex=.25, light=.22)
    yy, xx = grids(F)
    paint(F, m & ((xx + (yy // 3)) % 4 == 0) & (yy < cy - r * .6), dk(bark, .7), .8)
    # face de anéis
    F.part(ell(cx, cy, r, r * .92), dk(bark, .9), light=.25)
    F.part(ell(cx, cy, r - 1.6, r * .92 - 1.6), face, tex=.08, outline=False, light=.3, dark=.25)
    for k, f in enumerate((.72, .46, .22)):
        rr = (r - 1.6) * f
        n = max(10, int(rr * 6))
        ox = rng.uniform(-.6, .6)
        for i in range(n):
            a = 2 * math.pi * i / n
            if lvl == 5 or rng.random() < .85:
                F.px(cx + ox + rr * math.cos(a), cy + rr * .92 * math.sin(a), ring)
    F.px(cx, cy, dk(ring, .6))
    a = rng.uniform(0, 2 * math.pi)
    for t in range(int(r * .9)):
        F.px(cx + math.cos(a) * t, cy + math.sin(a) * t * .9, dk(face, .55) if lvl != 5 else RUNA2)
    if lvl == 5:
        glow(F, cx, cy, r * 1.3, RUNA, alpha=45)
        for i in range(0, 12, 3):
            aa = 2 * math.pi * i / 12
            F.px(cx + (r - 1.6) * .72 * math.cos(aa), cy + (r - 1.6) * .66 * math.sin(aa), '#ff9090', F.fx)


def log_side(F, x0, x1, cy, r, rng, lvl=2, charred=False):
    """tora deitada de lado (rolou para a frente)."""
    bark = '#241e2a' if lvl == 5 else BARK
    if charred:
        bark = '#2a1e18'
    m = F.part(R(x0, cy - r, x1, cy + r) + ell(x1, cy, r * .5, r), bark, tex=.25, light=.25)
    for k in range(3):
        y = cy - r + 2 + k * (2 * r - 3) / 2.5
        F.line(x0 + 2, y, x1 - 3, y + rng.choice([0, 1]), dk(bark, .65))
    F.part(ell(x0, cy, r * .5, r), dk(bark, .9))
    F.part(ell(x0, cy, r * .5 - 1.2, r - 1.4), CERNE if lvl != 5 else '#3c3446', outline=False)
    F.px(x0, cy, ANEL if lvl != 5 else RUNA2); F.px(x0, cy - 2, ANEL if lvl != 5 else RUNA2)


def pyramid(F, x0, base, rows, r, rng, lvl, jitter=0.0, gap=0.0):
    for ri, n in enumerate(rows):
        y = base - r - ri * (r * 1.72)
        width = n * (2 * r + gap)
        xs = x0 + (rows[0] * (2 * r + gap) - width) / 2 + r
        for i in range(n):
            rr = r * (1 + rng.uniform(-jitter, jitter))
            log_end(F, xs + i * (2 * r + gap) + rng.uniform(-jitter, jitter) * 6, y + rng.uniform(-jitter, jitter) * 5,
                    rr, rng, lvl)


def chips(F, rng, x0, x1, y0, y1, n=14, col=LASCA):
    for _ in range(n):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        a = rng.uniform(0, 180)
        F.part(rrect(x, y, rng.uniform(3, 5), 2, a), jit(col, rng, .1), light=.4, ol=dk(col, .35))
    for _ in range(n):
        F.px(rng.uniform(x0, x1), rng.uniform(y0, y1), dk(col, .8))


def axe(F, hx, hy, tx, ty, blade=ACO, handle=T1, rusty=False, gold=False):
    """machado cravado: (hx,hy) = ponto onde a lâmina entra; (tx,ty) = ponta do cabo."""
    F.part(limb(hx, hy, tx, ty, 3.4, 3), handle, tex=.1, light=.3)
    for t in (.7, .78, .86):
        F.px(hx + (tx - hx) * t, hy + (ty - hy) * t, dk(handle, .6))
    ang = math.degrees(math.atan2(ty - hy, tx - hx))
    head = poly((hx - 7, hy + 1), (hx - 6, hy - 5), (hx - 1, hy - 8), (hx + 4, hy - 8), (hx + 8, hy - 6), (hx + 9, hy + 1))
    bc = OURO if gold else blade
    marks = [(ell(hx + 3, hy - 4, 2.5, 2), FERR), (ell(hx - 4, hy - 2, 2, 1.5), FERR)] if rusty else []
    F.part(head, bc, light=.45, ol=('#4a3208' if gold else None), marks=marks)
    F.part(R(hx - 1, hy - 9, hx + 3, hy - 6), dk(bc, .6), outline=False, shade=False)
    F.line(hx - 6, hy - 1, hx + 8, hy - 1, '#fff6d8' if gold else '#e8eef2')
    F.part(ell(hx + 1, hy + 1, 10, 2), '#2a1810', outline=False, shade=False)
    if gold:
        F.px(hx + 1, hy - 3, RUNA2)
        glow(F, hx + 2, hy - 2, 8, OURO, 60)


def stump(F, cx, base, rw, h, rng, lvl, axe_on=True):
    bark = '#241e2a' if lvl == 5 else BARK
    face = '#3c3446' if lvl == 5 else '#c79a62'
    top = base - h
    # raízes
    for dx, s in ((-rw - 3, -1), (rw + 3, 1), (-rw * .4, -1), (rw * .5, 1)):
        F.part(poly((cx + dx * .7, base - 6), (cx + dx + s * 3, base + 1), (cx + dx * .5, base + 1)), bark, tex=.2)
    m = F.part(R(cx - rw, top, cx + rw, base) + ell(cx, base, rw, 3), bark, tex=.3, light=.22)
    yy, xx = grids(F)
    paint(F, m & ((xx * 3 + yy // 4) % 5 == 0), dk(bark, .65), .9)
    F.part(ell(cx, top, rw + .5, rw * .36), dk(bark, .85), light=.3)
    F.part(ell(cx, top, rw - 1.5, rw * .36 - 1.3), face, outline=False, tex=.1, light=.3)
    ringc = RUNA2 if lvl == 5 else ANEL
    for f in (.7, .42):
        n = int(rw * 5)
        for i in range(n):
            a = 2 * math.pi * i / n
            F.px(cx + (rw - 2) * f * math.cos(a), top + (rw * .36 - 1.3) * f * math.sin(a), ringc)
    # marcas de golpe no topo
    for k in range(4):
        x = cx + rng.uniform(-rw * .6, rw * .6)
        F.line(x, top - 1, x + 2, top + 1, dk(face, .55))
    if lvl == 5:
        glow(F, cx, top, rw, RUNA, 50)
        for k in range(3):
            x = cx + rng.uniform(-rw * .7, rw * .7)
            F.line(x, top + 3, x + rng.choice([-1, 1]), base - 3, RUNA)
    if axe_on:
        if lvl == 1:
            axe(F, cx + 2, top, cx + rw + 10, top - 26, blade=SUC, handle=ESTACA, rusty=True)
            for t in (.4, .5):
                F.px(cx + 2 + (rw + 8) * t, top - 26 * t, '#b8433a'); F.px(cx + 3 + (rw + 8) * t, top - 26 * t, '#b8433a')
        elif lvl == 5:
            axe(F, cx + 2, top, cx + rw + 12, top - 30, handle='#3a2a30', gold=True)
        else:
            axe(F, cx + 2, top, cx + rw + 12, top - 30, handle=T1 if lvl < 4 else '#6a4426')


def sawhorse(F, x, base, rng, log=True):
    for dx in (-14, 14):
        F.part(limb(x + dx - 4, base, x + dx + 2, base - 22, 3) + limb(x + dx + 5, base, x + dx - 1, base - 22, 3), T2, light=.25)
    F.part(R(x - 20, base - 25, x + 20, base - 20), T1, tex=.12)
    nail(F, x - 14, base - 23); nail(F, x + 14, base - 23)
    if log:
        log_side(F, x - 18, x + 16, base - 31, 6, rng)


def circular_saw(F, x, base, rng):
    # mesa
    for dx in (-20, 18):
        F.part(R(x + dx, base - 22, x + dx + 3, base), CH2, light=.3)
    F.part(limb(x - 19, base - 6, x + 19, base - 6, 2), MET)
    F.part(R(x - 24, base - 28, x + 24, base - 22), CH1, light=.35)
    F.part(R(x - 24, base - 22, x + 24, base - 19), MET)
    for xx in range(int(x) - 22, int(x) + 23, 7):
        rivet(F, xx, base - 21)
    # motor
    F.part(R(x - 8, base - 19, x + 8, base - 8), '#5a6066', light=.3, marks=[(R(x + 3, base - 17, x + 6, base - 14), '#c8323a')])
    for yy in range(int(base) - 17, int(base) - 9, 2):
        F.line(x - 6, yy, x + 1, yy, '#3a3e44')
    rope_line(F, x + 8, base - 12, x + 30, base, sag=4, col='#222226')
    # disco
    cy = base - 36
    teeth = []
    for i in range(24):
        a = 2 * math.pi * i / 24
        rr = 12 if i % 2 == 0 else 10
        teeth.append((x + rr * math.cos(a), cy + rr * math.sin(a) * .95))
    F.part([teeth], '#c9ced4', light=.4)
    F.part(ell(x, cy, 8, 7.6), ACO, outline=False, light=.35)
    F.part(ell(x, cy, 3, 3), '#3a3e44')
    for a in (20, 140, 260):
        F.px(x + 5 * math.cos(math.radians(a)), cy + 5 * math.sin(math.radians(a)), '#e8eef2')
    # proteção
    F.part(poly((x - 14, cy - 2), (x - 10, cy - 12), (x + 4, cy - 15), (x + 2, cy - 11), (x - 9, cy - 8), (x - 11, cy - 1)), '#c8a030', light=.35)
    # serragem
    chips(F, rng, x - 26, x + 26, base - 2, base + 1, n=8, col='#d8bc8a')


def obelisk(F, x, base, rng):
    F.part(poly((x - 9, base), (x + 9, base), (x + 6, base - 40), (x, base - 48), (x - 6, base - 40)), LU1, tex=.12, light=.3)
    F.part(poly((x - 6, base - 40), (x, base - 48), (x + 6, base - 40)), OURO, ol='#4a3208', light=.4)
    gold_band(F, x - 10, base - 6, x + 10, 3)
    rune(F, x - 1, base - 32, 1, 9)
    rune(F, x - 1, base - 20, 4, 7)


def split_wood(F, x0, base, rng, n=3):
    for row in range(n):
        for i in range(4 - row):
            cx = x0 + 7 + i * 11 + row * 5.5
            cy = base - 5 - row * 9
            F.part(poly((cx - 5, cy + 4), (cx + 5, cy + 4), (cx, cy - 5)), BARK, light=.25)
            F.part(poly((cx - 3.5, cy + 3), (cx + 3.5, cy + 3), (cx, cy - 3)), CERNE, outline=False, light=.3)
            F.px(cx, cy + 1, ANEL)


def toras_draw(F, lvl, rng):
    yy, xx = grids(F)
    base = GY2
    if lvl == 1:
        # lona no chão
        canvas(F, [[(6, 176), (40, 170), (130, 172), (150, 178), (144, 184), (12, 184)]], L1, rng, patches=2)
        # estacas tortas
        F.part(limb(10, 180, 6, 120, 4), ESTACA, tex=.2)
        F.part(limb(144, 180, 150, 118, 4), ESTACA, tex=.2)
        # toras e galhos amontoados
        pts = [(24, 170, 8), (40, 172, 7), (57, 169, 9), (76, 172, 7), (93, 170, 8), (110, 172, 7), (127, 170, 8),
               (32, 155, 7), (50, 154, 8), (68, 156, 6), (86, 153, 8), (104, 155, 7), (120, 156, 6),
               (44, 140, 7), (62, 139, 6), (80, 138, 7), (98, 140, 6), (70, 125, 6)]
        for (x, y, r) in pts:
            log_end(F, x + rng.uniform(-2, 2), y + rng.uniform(-2, 2), r * rng.uniform(.85, 1.15), rng, 1)
        for (a, b) in [((16, 148), (52, 116)), ((100, 132), (140, 110)), ((30, 128), (8, 112))]:
            F.part(limb(a[0], a[1], b[0], b[1], 3, 2), BARK, tex=.2)
            mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
            F.part(limb(mx, my, mx + 6, my - 8, 2, 1), BARK)
            F.px(mx + 6, my - 9, '#5f7a4a'); F.px(mx + 7, my - 9, '#4a6139')
        # lona azul jogada por cima, amarrada
        canvas(F, [[(34, 128), (60, 114), (96, 118), (122, 130), (126, 146), (110, 140), (96, 150), (80, 140), (64, 150),
                    (48, 140), (36, 146)]], LAZ, rng, patches=1)
        rope_line(F, 8, 124, 70, 116, sag=6)
        rope_line(F, 70, 116, 148, 122, sag=6)
        # galhos com folhas no meio
        F.part(limb(158, 178, 176, 150, 3, 2) + limb(166, 178, 160, 152, 3, 2), BARK)
        rope_line(F, 158, 166, 174, 164, 0)
        F.part(poly((176, 178), (190, 172), (192, 180)), SUC, marks=[(ell(184, 177, 2, 1.5), FERR)])
        stump(F, 216, base, 15, 16, rng, 1)
        chips(F, rng, 190, 248, 176, 184, 12)
    elif lvl in (2, 3, 4, 5):
        if lvl == 2:
            planks(F, 8, 172, 146, 182, rng, pw=4, vertical=False, cols=(T2, TE), nails=False)
            for x in (10, 142):
                F.part(limb(x, 182, x, 102, 6), T2, tex=.15)
                F.part(poly((x - 3, 102), (x + 3, 102), (x, 97)), T2)
                nail(F, x, 120); nail(F, x, 150)
        elif lvl == 3:
            for x0 in (6, 130):
                blocks(F, x0, 70, x0 + 14, 182, rng, bw=8, bh=7)
            blocks(F, 6, 168, 144, 182, rng, bw=14, bh=7)
        elif lvl == 4:
            bricks(F, 6, 168, 146, 182, rng)
            metal_band(F, 4, 166, 148, 4)
            for x0 in (6, 72, 138):
                F.part(R(x0, 70, x0 + 6, 166), MET, light=.35, marks=[(R(x0 + 2, 70, x0 + 4, 166), CH2)])
                for y in range(74, 164, 8):
                    rivet(F, x0 + 1, y)
            F.part(R(6, 118, 144, 121), CH1, light=.35)
        else:
            lunar_blocks(F, 4, 164, 146, 182, rng)
            gold_band(F, 2, 162, 148, 3)
            for x0 in (4, 132):
                lunar_blocks(F, x0, 74, x0 + 14, 164, rng)
                F.part(R(x0 - 1, 70, x0 + 15, 75), OURO, ol='#4a3208', light=.4)
                rune(F, x0 + 6, 110, x0 % 5, 8)
        # pirâmide
        if lvl == 2:
            pyramid(F, 16, 172, [6, 5, 4, 3], 10.4, rng, 2, jitter=.06)
        elif lvl == 3:
            pyramid(F, 22, 168, [5, 4, 3, 2], 10.6, rng, 3, jitter=.03)
        elif lvl == 4:
            pyramid(F, 14, 166, [6, 5], 10.6, rng, 4, jitter=.02, gap=.4)
            pyramid(F, 14, 116, [6, 5], 10.6, rng, 4, jitter=.02, gap=.4)
            F.part(R(6, 118, 144, 121), CH1, light=.35)
            F.part(R(72, 70, 78, 166), MET, light=.35, marks=[(R(74, 70, 76, 166), CH2)])
            for y in range(74, 164, 8):
                rivet(F, 73, y)
        else:
            pyramid(F, 22, 162, [5, 4, 3, 2], 10.6, rng, 5, jitter=.03)
        # telhado
        if lvl == 3:
            tile_roof(F, [[(0, 74), (14, 56), (138, 56), (150, 74), (150, 77), (0, 77)]], 0, 56)
            F.part(R(0, 74, 150, 78), TEL2, light=.3)
        elif lvl == 4:
            corrugated(F, [[(0, 70), (10, 54), (142, 54), (152, 70), (152, 73), (0, 73)]], 0, rng=rng, rust=5)
            F.part(R(0, 70, 152, 74), MET, light=.35)
            for x in range(4, 150, 9):
                rivet(F, x, 72)
            # lâmpada pendurada
            F.line(110, 74, 110, 84, '#222226')
            F.part(poly((105, 84), (115, 84), (113, 88), (107, 88)), MET)
            F.part(ell(110, 90, 2.5, 2.2), LAMP, shade=False, ol='#6a5010')
            glow(F, 110, 92, 22, LAMP, 100)
        elif lvl == 5:
            slate_roof(F, [[(0, 76), (14, 56), (138, 56), (150, 76), (150, 79), (0, 79)]], 0, 56)
            F.part(R(12, 52, 140, 57), OURO, ol='#4a3208', light=.4)
            F.part(R(0, 76, 150, 79), OURO2, ol='#4a3208')
            F.part(poly((70, 52), (76, 40), (82, 52)), OURO, ol='#4a3208')
            flag(F, 140, 26, 54, '#9a1e28', rng, w=14, h=10, pole=OURO2)
        # extras do meio
        if lvl == 2:
            sawhorse(F, 172, base, rng)
        elif lvl == 3:
            blocks(F, 152, 170, 192, 182, rng, bw=10, bh=6, cols=(P2, '#6a6660'))
            split_wood(F, 152, 170, rng, 3)
        elif lvl == 4:
            circular_saw(F, 172, base, rng)
        else:
            obelisk(F, 172, base, rng)
        stump(F, 220, base, 17 if lvl < 4 else 18, 18, rng, lvl)
        if lvl == 3:
            F.part(ell(220, 181, 24, 4), P2, light=.3)
            stump(F, 220, base - 1, 17, 18, rng, lvl)
        chips(F, rng, 194, 252, 176, 186, 16, col=LASCA if lvl != 5 else '#5a4a60')


def toras_loose(lvl):
    def f(F, rng):
        log_side(F, 108, 140, 182, 6, rng, lvl)
        piece(F, lvl, 30, 184, rng, big=True)
        piece(F, lvl, 160, 184, rng)
    return f


def toras_dmg(F, lvl, rng):
    damage(F, rng, (6, 60, 150, 180), (60, 132 if lvl > 1 else 128), (66, 112), toras_loose(lvl), [(110, 150, 5)])
    flame(F, 222, 158, 2.6)
    smoke(F, 226, 146, 2, 3)


def toras_des(F, T, lvl, rng):
    stub(F, T, 150, rng, jag=6)
    rubble(F, lvl, 80, 180, 74, 22, rng, n=30)
    for k in range(4):
        x = rng.uniform(20, 140)
        log_end(F, x, rng.uniform(172, 180), rng.uniform(6, 8), rng, lvl, charred=True)
    log_side(F, 150, 184, 180, 6, rng, lvl, charred=True)
    stump(F, 220, 180, 17, 12, rng, lvl, axe_on=False)
    soot(F, rng, (200, 160, 240, 180), 2, .6)
    F.part(limb(204, 184, 230, 176, 3), dk(T1, .45))
    F.part(poly((228, 172), (236, 170), (238, 177), (230, 178)), ACO if lvl != 5 else OURO, light=.3)
    smoke(F, 222, 158, 3, 3.5, dark=True)


def make_toras():
    fr = three_states(toras_draw, W2, H2, GY2, 118, 23, toras_dmg, toras_des)
    grid(fr, 5).save(os.path.join(OUT, 'est_pilha_toras.png'))


# =====================================================================
#                           PONTO DE COLETA
# =====================================================================
CLOTH = ['#4a6a9a', '#b8433a', '#d2c09a', '#5f7a4a', '#d8a838', '#8a5a8a']


def gear(F, x, y, r, col=ACO, teeth=8):
    pts = []
    for i in range(teeth * 2):
        a = 2 * math.pi * i / (teeth * 2)
        rr = r if i % 2 == 0 else r * .74
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    F.part([pts], col, light=.4, tex=.1, marks=[(ell(x + r * .3, y + r * .2, r * .3, r * .25), FERR)])
    F.part(ell(x, y, r * .3, r * .3), '#2a2a2e')


def can(F, x, y, col, rng):
    F.part(R(x - 3, y - 7, x + 3, y) + ell(x, y, 3, 1.2), col, light=.35, marks=[(R(x - 3, y - 5, x + 3, y - 3), '#e0d6c0')])
    F.part(ell(x, y - 7, 3, 1.3), '#c9ced4')


def scrap_heap(F, cx, base, w, h, rng, n=14):
    mound(F, cx, base, w / 2, h * .6, '#4a4648', rng)
    items = sorted([(rng.uniform(base - h * .7, base - 2), cx + rng.uniform(-w * .42, w * .42)) for _ in range(n)])
    for i, (y, x) in enumerate(items):
        k = i % 5
        if k == 0:
            gear(F, x, y, rng.uniform(4, 6.5))
        elif k == 1:
            can(F, x, y + 3, rng.choice(['#b8433a', '#3f6a8c', '#d8a838']), rng)
        elif k == 2:
            F.part(limb(x - 9, y + rng.uniform(-3, 3), x + 9, y + rng.uniform(-3, 3), 3.2), rng.choice([ACO, '#8a5a3a']), light=.45)
        elif k == 3:
            F.part(rrect(x, y, rng.uniform(10, 15), rng.uniform(5, 8), rng.uniform(-35, 35)), SUC, tex=.2,
                   marks=[(ell(x + 2, y, 2.5, 2), FERR)], light=.35)
        else:
            F.part(ell(x, y, 5, 4), '#222226', light=.25)
            F.part(ell(x, y, 2.4, 1.8), '#4a4648', outline=False)
    rope_line(F, cx - w * .3, base - h * .5, cx + w * .2, base - h * .7, sag=-3, col='#c87a3a')


def bundle(F, x, y, rw, rh, col, rng):
    F.part(ell(x, y, rw, rh), col, tex=.2, light=.3)
    F.line(x - rw * .6, y - rh * .2, x + rw * .4, y + rh * .4, dk(col, .65))
    F.line(x - rw * .2, y - rh * .7, x + rw * .1, y + rh * .2, dk(col, .7))
    if rng.random() < .5:
        for k in range(-int(rw) + 2, int(rw) - 1, 3):
            F.px(x + k, y - 1, lt(col, .4))
    F.part(ell(x + rw * .5, y - rh * .7, 2, 1.4), dk(col, .8))


def cloth_heap(F, cx, base, w, h, rng, n=8, cols=None):
    cols = cols or CLOTH
    items = sorted([(rng.uniform(base - h * .8, base - 3), cx + rng.uniform(-w * .38, w * .38)) for _ in range(n)])
    for i, (y, x) in enumerate(items):
        if i % 3 == 2:
            c = cols[i % len(cols)]
            F.part(limb(x - 8, y, x + 8, y - 2, 8), c, tex=.15, light=.3)
            F.part(ell(x + 8, y - 2, 2.5, 4), dk(c, .8))
            F.part(ell(x + 8, y - 2, 1, 2), dk(c, .55), outline=False)
        else:
            bundle(F, x, y, rng.uniform(6, 9), rng.uniform(4, 6), cols[i % len(cols)], rng)


def basket(F, cx, base, w=28, h=18, rim=PALHA2, gold=False, fill=True, rng=None, squash=1.0):
    h = h * squash
    w = w * (2 - squash) if squash != 1 else w
    top = base - h
    body = poly((cx - w / 2, top), (cx + w / 2, top), (cx + w / 2 - 4, base), (cx - w / 2 + 4, base))
    if fill and rng:
        bundle(F, cx - 4, top - 1, 6, 4, '#b8433a', rng)
        gear(F, cx + 5, top - 2, 4)
    m = F.part(body, PALHA, light=.3)
    yy, xx = grids(F)
    paint(F, m & (((xx + yy) % 4 == 0) | ((xx - yy) % 4 == 0)), PALHA2, .9)
    paint(F, m & ((yy - int(top)) % 4 == 0), dk(PALHA, .7), .6)
    F.part(ell(cx, top, w / 2 + 1, 3), OURO if gold else rim, light=.4, ol='#4a3208' if gold else None)
    F.part(ell(cx, top, w / 2 - 2, 1.5), '#2a1c14', outline=False, shade=False)
    if fill and rng:
        bundle(F, cx - 4, top - 1, 5, 3, '#b8433a', rng)
        gear(F, cx + 6, top - 2, 3.5)
    for s in (-1, 1):
        F.part(limb(cx + s * (w / 2 - 1), top + 3, cx + s * (w / 2 + 3), top + 6, 2), rim)


def cart(F, rng):
    # rodas de trás + chassis
    for (x, y) in [(38, 141), (84, 140)]:
        F.part(ell(x, y, 3, 3), '#222226')
    F.part(limb(30, 134, 88, 134, 2) + limb(30, 134, 34, 144, 2) + limb(88, 134, 84, 144, 2), '#a9b0b6', light=.4)
    # conteúdo
    scrap_heap(F, 44, 112, 46, 50, rng, n=13)
    cloth_heap(F, 74, 108, 38, 40, rng, n=7)
    # cesta de arame
    bas = poly((14, 94), (96, 94), (90, 128), (24, 128))
    m = F.mask(bas)
    yy, xx = grids(F)
    wire = m & ((((xx - 14) % 6 == 0)) | ((yy - 94) % 6 == 0))
    F.a[wire, :3] = (150, 158, 166); F.a[wire, 3] = 255
    wd = shift_m(wire, 1, 1) & m & ~wire
    F.a[wd, :3] = (60, 64, 70); F.a[wd, 3] = 255
    for (a, b) in [((14, 94), (96, 94)), ((96, 94), (90, 128)), ((90, 128), (24, 128)), ((24, 128), (14, 94))]:
        F.part(limb(a[0], a[1], b[0], b[1], 2.4), '#b8c0c6', light=.4)
    # alça com punho vermelho
    F.part(limb(96, 94, 104, 86, 2.2), '#b8c0c6')
    F.part(limb(102, 80, 106, 92, 4), '#b8433a', light=.35)
    # rodas da frente
    for (x, y) in [(28, 145), (88, 145)]:
        F.part(R(x - 1, y - 6, x + 1, y - 2), '#a9b0b6')
        F.part(ell(x, y, 3.5, 3.5), '#1c1c20')
        F.px(x - 1, y - 1, '#6a6a70')
    # placa de papelão
    F.part(rrect(30, 86, 22, 14, -8), '#b08a5a', tex=.25, light=.25)
    for i in range(6):
        F.px(22 + i * 3, 85 - i * .4, '#3a2418'); F.px(22 + i * 3, 86 - i * .4, '#3a2418')
    gear(F, 36, 89, 2.5, col='#3a2418', teeth=6)


def coleta_draw(F, lvl, rng):
    base = GY1
    if lvl == 1:
        canvas(F, [[(4, 140), (60, 136), (124, 140), (120, 152), (8, 152)]], L1, rng, patches=2)
        cart(F, rng)
        basket(F, 108, 150, 24, 16, rng=rng)
        F.part(limb(116, 148, 122, 118, 3), ESTACA)
        canvas(F, [[(110, 118), (124, 117), (124, 128), (112, 130)]], LAZ, rng, patches=0)
    elif lvl == 2:
        crate(F, 8, 148, 54, 32, rng, top=False, col='#9a6a3c')
        crate(F, 66, 148, 54, 32, rng, top=False, col='#8a5e36')
        F.part(R(10, 112, 60, 117), '#2a1c14')
        F.part(R(68, 112, 118, 117), '#2a1c14')
        scrap_heap(F, 35, 118, 46, 34, rng, n=11)
        cloth_heap(F, 93, 118, 46, 34, rng, n=8)
        F.part(R(8, 114, 62, 118), '#b08050', light=.3); F.part(R(66, 114, 120, 118), '#a07246', light=.3)
        # placa de tábua
        F.part(limb(20, 112, 18, 62, 3.4), T2)
        F.part(R(6, 62, 44, 80), T1, tex=.15, light=.25)
        nail(F, 8, 64); nail(F, 41, 64); nail(F, 8, 77); nail(F, 41, 77)
        gear(F, 16, 71, 5, col='#3a2418', teeth=6)
        bundle(F, 33, 71, 6, 4, '#7a2a24', rng)
        basket(F, 64, 150, 26, 16, rng=rng)
    elif lvl == 3:
        for x0 in (6, 112):
            blocks(F, x0, 66, x0 + 10, 148, rng, bw=6, bh=7)
        blocks(F, 16, 96, 112, 128, rng, bw=12, bh=7, moss=.05)
        scrap_heap(F, 38, 132, 42, 30, rng, n=9)
        cloth_heap(F, 90, 132, 40, 28, rng, n=7)
        blocks(F, 58, 104, 70, 148, rng, bw=6, bh=7)
        blocks(F, 14, 132, 58, 148, rng, bw=11, bh=6, cols=(P2, P1))
        blocks(F, 70, 132, 114, 148, rng, bw=11, bh=6, cols=(P2, P1))
        tile_roof(F, [[(0, 70), (12, 46), (116, 46), (128, 70), (128, 73), (0, 73)]], 0, 46)
        F.part(R(0, 70, 128, 74), TEL2, light=.3)
        F.part(R(10, 43, 118, 47), TEL2, light=.35)
        basket(F, 64, 152, 24, 14, rng=rng)
    elif lvl == 4:
        bricks(F, 12, 136, 116, 148, rng)
        # poste com lâmpada
        F.part(R(116, 40, 120, 148), MET, light=.35)
        F.part(limb(118, 42, 104, 42, 2.4), MET)
        F.part(poly((98, 42), (110, 42), (108, 47), (100, 47)), CH2)
        F.part(ell(104, 49, 3, 2.4), LAMP, shade=False, ol='#6a5010')
        glow(F, 104, 52, 22, LAMP, 100)
        # carga
        scrap_heap(F, 46, 100, 56, 30, rng, n=10)
        cloth_heap(F, 84, 100, 40, 26, rng, n=6)
        # caçamba
        body = poly((12, 96), (116, 96), (110, 136), (18, 136))
        m = F.part(body, MET, tex=.12, light=.3, marks=[(ell(30, 124, 7, 5), FERR), (ell(98, 106, 5, 4), FERR),
                                                         (ell(60, 132, 9, 3), FERR)])
        yy, xx = grids(F)
        for x in range(24, 108, 14):
            F.part(poly((x, 97), (x + 4, 97), (x + 3, 135), (x - 1, 135)), CH1, light=.4)
            for y in range(100, 134, 8):
                rivet(F, x + 1, y)
        F.part(R(10, 93, 118, 98), MET, light=.4)
        for x in range(13, 116, 6):
            rivet(F, x, 95)
        for x in (10, 112):
            F.part(R(x, 106, x + 6, 114), CH2, light=.3)
            F.part(ell(x + 3, 110, 1.5, 1.5), '#1c1c20')
        F.part(R(40, 112, 88, 122), '#1c1820')
        for i in range(0, 48, 8):
            F.part(poly((40 + i, 122), (44 + i, 122), (48 + i, 112), (44 + i, 112)), OURO, outline=False, shade=False)
        # arame farpado
        barbed(F, 0, 14, 144, 4)
        basket(F, 64, 154, 24, 14, rng=rng)
    else:
        # depósito lunar: baú grande com tampa aberta
        lid = poly((18, 64), (110, 64), (114, 92), (14, 92))
        slate_roof(F, [lid[0]], 14, 64)
        F.part(R(14, 62, 114, 66), OURO, ol='#4a3208', light=.4)
        F.part(limb(17, 64, 14, 90, 3.5) + limb(111, 64, 114, 90, 3.5), OURO, ol='#4a3208', light=.4)
        F.part(ell(64, 68, 5, 3), OURO, ol='#4a3208')
        F.px(64, 68, RUNA2)
        F.part(R(18, 88, 110, 96), '#3a0a14', shade=False)
        glow(F, 64, 92, 46, RUNA, 120)
        scrap_heap(F, 42, 100, 44, 22, rng, n=7)
        cloth_heap(F, 84, 100, 40, 22, rng, n=6, cols=['#9a1e28', '#c8323a', '#d2c09a', '#5a2a4a'])
        gear(F, 60, 90, 5, col=OURO)
        lunar_blocks(F, 12, 98, 116, 146, rng)
        gold_band(F, 10, 96, 118, 4)
        gold_band(F, 10, 140, 118, 4)
        for x0 in (10, 110):
            F.part(R(x0, 96, x0 + 8, 146), OURO, ol='#4a3208', light=.45)
            F.part(R(x0 + 2, 104, x0 + 6, 138), OURO2, outline=False)
        F.part(R(54, 106, 74, 126), OURO, ol='#4a3208', light=.4)
        F.part(R(57, 109, 71, 123), LU1)
        rune(F, 63, 113, 2, 9)
        rune(F, 30, 112, 0, 7); rune(F, 94, 112, 3, 7)
        basket(F, 64, 156, 22, 12, gold=True, rng=rng)
        embers(F, 30, 40, 100, 80, rng, 6, red=True)


def coleta_loose(lvl):
    def f(F, rng):
        piece(F, lvl, 16, 146, rng, big=True)
        gear(F, 108, 146, 4)
        bundle(F, 28, 150, 6, 3, '#4a6a9a', rng)
    return f


def coleta_dmg(F, lvl, rng):
    damage(F, rng, (10, 50, 118, 148), (90, 104 if lvl != 5 else 96), (94, 86), coleta_loose(lvl), [(40, 124, 4)] if lvl > 1 else [])


def coleta_des(F, T, lvl, rng):
    stub(F, T, 124, rng, jag=5)
    rubble(F, lvl, 64, 148, 54, 18, rng, n=20)
    for k in range(3):
        gear(F, rng.uniform(24, 104), rng.uniform(138, 146), rng.uniform(3, 5))
    bundle(F, 90, 147, 7, 3, '#3a2a28', rng)
    if lvl == 1:
        F.part(ell(26, 146, 4, 4), '#1c1c20')
        F.part(limb(16, 140, 48, 132, 2), '#a9b0b6')
    basket(F, 108, 152, 20, 9, fill=False, rng=rng)


def make_coleta():
    fr = three_states(coleta_draw, W1, H1, GY1, 50, 37, coleta_dmg, coleta_des)
    grid(fr, 5).save(os.path.join(OUT, 'est_ponto_coleta.png'))



# =====================================================================
#                      TEXTO GRANDE (dígitos 5x7)
# =====================================================================
DIG = {
    '1': ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    '2': ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    '3': ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    '4': ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    '5': ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    '+': ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    '!': ["1", "1", "1", "1", "1", "0", "1"],
}


def big_w(s, sc):
    return sum((len(DIG[c][0]) + 1) * sc for c in s) - sc


def big_text(F, s, x, y, sc=3, col=CREAM, ol='#1a0f14', layer=None, drop=True, hi=True):
    L = F.fx if layer is None else layer
    shapes = []
    cx = x
    for ch in s:
        g = DIG[ch]
        for j, row in enumerate(g):
            for i, b in enumerate(row):
                if b == '1':
                    X, Y = cx + i * sc, y + j * sc
                    shapes.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
        cx += (len(g[0]) + 1) * sc
    if drop:
        F.part(mv(shapes, 1, 2), ol, shade=False, ol=ol, layer=L)
    m = F.part(shapes, col, shade=False, ol=ol, layer=L)
    if hi:
        top = m & ~shift_m(m, 0, 1)
        Lr = L
        Lr[top, :3] = np.clip(mix(Lr[top, :3].astype(float), np.array([255, 255, 255.]), .6), 0, 255)
        bot = m & ~shift_m(m, 0, -1)
        Lr[bot, :3] = np.clip(Lr[bot, :3].astype(float) * .78, 0, 255)
    return m


def fade(arr, a):
    o = arr.copy()
    o[..., 3] = (o[..., 3].astype(float) * a).astype(np.uint8)
    return o


# =====================================================================
#                           TRABALHO (animado)
# =====================================================================
WT, GYT = 128, 112


def tool_axe(F, gx, gy, a, L=36, gold=False):
    u = (math.cos(math.radians(a)), math.sin(math.radians(a)))
    v = (-u[1], u[0])
    hx, hy = gx + u[0] * L, gy + u[1] * L
    F.part(limb(gx - u[0] * 4, gy - u[1] * 4, hx + u[0] * 3, hy + u[1] * 3, 3.6, 3.2), T1, tex=.1, light=.3)
    for t in (-.05, .02, .09):
        F.px(gx + u[0] * L * t * 4, gy + u[1] * L * t * 4, TE)

    def P(du, dv):
        return (hx + u[0] * du + v[0] * dv, hy + u[1] * du + v[1] * dv)
    head = poly(P(-4, -4), P(4, -4), P(4, 2), P(8, 10), P(-7, 10), P(-4, 2))
    F.part(head, OURO if gold else ACO, light=.45, ol='#4a3208' if gold else None)
    a0, a1 = P(7, 9), P(-6, 9)
    F.line(a0[0], a0[1], a1[0], a1[1], '#f4f8fa')
    e = P(0, -1)
    F.px(e[0], e[1], ACO2)
    return P(0, 10)


def tool_hammer(F, gx, gy, a, L=30):
    u = (math.cos(math.radians(a)), math.sin(math.radians(a)))
    v = (-u[1], u[0])
    hx, hy = gx + u[0] * L, gy + u[1] * L
    F.part(limb(gx - u[0] * 3, gy - u[1] * 3, hx, hy, 3.4, 3), '#8a5a30', tex=.1, light=.3)
    F.part(limb(gx - u[0] * 3, gy - u[1] * 3, gx + u[0] * 7, gy + u[1] * 7, 4.2), '#3a2a24', light=.2)

    def P(du, dv):
        return (hx + u[0] * du + v[0] * dv, hy + u[1] * du + v[1] * dv)
    F.part(poly(P(-3.5, -5), P(3.5, -5), P(3.5, 4), P(4.5, 8), P(-4.5, 8), P(-3.5, 4)), ACO, light=.45)
    F.part(poly(P(-2, -5), P(-4, -10), P(-1, -8)) + poly(P(2, -5), P(4, -10), P(1, -8)), ACO2, light=.3)
    f0, f1 = P(4, 8), P(-4, 8)
    F.line(f0[0], f0[1], f1[0], f1[1], '#f4f8fa')
    return P(0, 9)


def swoosh(F, gx, gy, a0, a1, L, col='#fff4e0'):
    for k in range(3):
        rr = L + 6 - k * 4
        for t in np.linspace(a0, a1, 26):
            if (int(t * 3) + k) % 2 == 0:
                F.px(gx + rr * math.cos(math.radians(t)), gy + rr * math.sin(math.radians(t)), col, F.fx)


def flying(F, rng, x, y, n, spread, col, size=(3, 5), up=True):
    for _ in range(n):
        ang = math.radians(rng.uniform(-170, -10) if up else rng.uniform(-200, 20))
        d = rng.uniform(spread * .4, spread)
        px, py = x + math.cos(ang) * d, y + math.sin(ang) * d
        F.part(rrect(px, py, rng.uniform(*size), 2, rng.uniform(0, 180)), jit(col, rng, .1), light=.35,
               ol=dk(col, .35), layer=F.fx)


def sparks(F, rng, x, y, n, r0, r1, falling=0.0):
    for _ in range(n):
        ang = math.radians(rng.uniform(-180, 0))
        d0, d1 = rng.uniform(r0, r0 + 3), rng.uniform(r1 * .6, r1)
        x0, y0 = x + math.cos(ang) * d0, y + math.sin(ang) * d0
        x1, y1 = x + math.cos(ang) * d1, y + math.sin(ang) * d1 + falling
        F.line(x0, y0, x1, y1, LAMP, F.fx)
        F.px(x1, y1, '#fff6c8', F.fx)


def work_axe(k, rng):
    F = Frame(WT, WT)
    stump(F, 74, GYT, 18, 16, rng, 2, axe_on=False)
    top = GYT - 16
    gx, gy = 44, 50
    if k < 3:
        F.part(R(64, top - 22, 82, top) + ell(73, top, 9, 2.5), BARK, tex=.25, light=.25)
        F.part(ell(73, top - 22, 9, 3), CERNE, light=.3)
        F.px(73, top - 22, ANEL); F.px(70, top - 22, ANEL); F.px(76, top - 23, ANEL)
    if k == 0:
        tool_axe(F, gx, gy, -118)
    elif k == 1:
        swoosh(F, gx, gy, -116, -36, 38)
        tool_axe(F, gx, gy, -32)
    elif k == 2:
        swoosh(F, gx, gy, -50, 20, 38)
        tool_axe(F, gx, gy, 27)
        impact(F, 73, top - 21, 9)
        flying(F, rng, 73, top - 22, 9, 26, LASCA)
    else:
        for s in (-1, 1):
            px = 64 if s < 0 else 82
            half = R(64, top - 20, 72, top) if s < 0 else R(74, top - 20, 82, top)
            F.part(rot(half, px, top, s * 24), BARK, tex=.25, light=.25)
            inner = R(70, top - 19, 72, top - 1) if s < 0 else R(74, top - 19, 76, top - 1)
            F.part(rot(inner, px, top, s * 24), CERNE, outline=False, light=.3)
        tool_axe(F, gx, gy + 8, 36)
        flying(F, rng, 73, top - 4, 8, 36, LASCA, up=False)
        chips(F, rng, 48, 104, GYT - 2, GYT + 3, 6)
    chips(F, rng, 50, 100, GYT - 1, GYT + 3, 8)
    return finish(F, shadow_layer(76, 26, 3.5, 90, WT, WT, GYT))


def work_hammer(k, rng):
    F = Frame(WT, WT)
    sawhorse(F, 70, GYT, rng, log=False)
    F.part(R(42, GYT - 31, 104, GYT - 25), T1, tex=.12, light=.3)
    for x in (48, 96):
        nail(F, x, GYT - 28)
    nx, ny = 76, GYT - 31
    sink = [0, 0, 2, 3][k]
    F.part(R(nx, ny - 6 + sink, nx + 1, ny), '#8a9096')
    F.part(R(nx - 2, ny - 7 + sink, nx + 3, ny - 6 + sink), '#c9ced4')
    gx, gy = 44, 70
    if k == 0:
        tool_hammer(F, gx, gy, -110)
    elif k == 1:
        swoosh(F, gx, gy, -100, -30, 30)
        tool_hammer(F, gx, gy, -28)
    elif k == 2:
        tool_hammer(F, gx, gy, -7, L=32)
        impact(F, nx + 1, ny - 6, 8)
        sparks(F, rng, nx + 1, ny - 6, 10, 4, 18)
    else:
        tool_hammer(F, gx, gy, -18)
        sparks(F, rng, nx + 1, ny - 4, 7, 10, 26, falling=6)
        for _ in range(5):
            F.px(rng.uniform(56, 98), rng.uniform(GYT - 26, GYT - 4), LAMP, F.fx)
    chips(F, rng, 44, 98, GYT - 1, GYT + 3, 5, col='#d8bc8a')
    return finish(F, shadow_layer(72, 30, 3.5, 90, WT, WT, GYT))


def arc_pt(t, p0, p1, hgt):
    return (p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t - hgt * 4 * t * (1 - t))


def work_basket(k, rng):
    F = Frame(WT, WT)
    bx, top = 76, GYT - 22
    sq = 1.0 if k < 3 else .86
    basket(F, bx, GYT, 36, 22, fill=False, rng=rng, squash=sq)
    if k >= 1:
        bundle(F, bx - 6, GYT - 22 * sq - 1, 5, 2.5, '#4a6a9a', rng)
    p0, p1 = (16, 70), (bx, top - 2)
    seq = {0: (.12, None), 1: (.42, .08), 2: (.78, .38), 3: (None, .74)}
    tg, tr = seq[k]
    if tg is not None:
        for d in (.06, .12, .18):
            if tg - d > 0:
                x, y = arc_pt(tg - d, p0, p1, 46)
                F.px(x, y, '#e8e0d0', F.fx); F.px(x + 1, y, '#e8e0d0', F.fx)
        x, y = arc_pt(tg, p0, p1, 46)
        gear(F, x, y, 7.5)
    if tr is not None:
        for d in (.06, .12, .18):
            if tr - d > 0:
                x, y = arc_pt(tr - d, (10, 78), p1, 40)
                F.px(x, y, '#e8e0d0', F.fx)
        x, y = arc_pt(tr, (10, 78), p1, 40)
        bundle(F, x, y, 9, 5.5, '#b8433a', rng)
    if k == 3:
        basket(F, bx, GYT, 36, 22, fill=False, rng=rng, squash=sq)
        bundle(F, bx - 6, GYT - 22 * sq - 1, 5, 2.5, '#4a6a9a', rng)
        gear(F, bx + 6, GYT - 22 * sq - 2, 4.5)
        bundle(F, bx - 1, GYT - 22 * sq - 4, 7, 4, '#b8433a', rng)
        for s in (-1, 1):
            dust(F, bx + s * 22, GYT - 3, 3.5)
        sparkle(F, bx + 14, top - 12, 3)
    return finish(F, shadow_layer(bx, 22, 3.5, 90, WT, WT, GYT))


def icon_res(F, kind, x, y, rng):
    """ícone 18-20 px centrado em (x,y)."""
    if kind == 'Madeira':
        F.part(R(x - 9, y - 5, x + 6, y + 5) + ell(x + 6, y, 3, 5), BARK, tex=.2, light=.3)
        F.line(x - 7, y - 2, x + 4, y - 2, dk(BARK, .65)); F.line(x - 6, y + 2, x + 5, y + 2, dk(BARK, .65))
        F.part(ell(x - 9, y, 3.5, 5.5), CERNE, light=.35)
        F.px(x - 9, y, ANEL); F.px(x - 9, y - 2, ANEL); F.px(x - 10, y + 2, ANEL)
        F.part(limb(x + 1, y - 5, x + 5, y - 10, 2), BARK)
        F.px(x + 5, y - 11, '#6fae5a'); F.px(x + 6, y - 11, '#4f8a3a'); F.px(x + 6, y - 12, '#6fae5a')
    elif kind == 'Sucata':
        gear(F, x - 1, y, 8.5, teeth=8)
        F.part(limb(x + 2, y + 6, x + 10, y - 4, 3), '#8a5a3a', light=.4)
        F.part(R(x + 8, y - 7, x + 12, y - 4), ACO, light=.4)
    elif kind == 'Pano':
        F.part(R(x - 10, y - 1, x + 10, y + 7), '#4a6a9a', light=.3, tex=.1)
        F.part(R(x - 9, y - 7, x + 9, y), '#b8433a', light=.35, tex=.1,
               marks=[(R(x - 9, y - 5, x + 9, y - 4), '#e8c060'), (R(x - 9, y - 2, x + 9, y - 1), '#e8c060')])
        F.part(ell(x + 9, y - 3, 2, 4), '#9a3028')
        for i in range(-8, 9, 3):
            F.px(x + i, y + 3, '#7a9aca')
    elif kind == 'Água':
        F.part(poly((x, y - 11), (x + 5, y - 3), (x + 7, y + 3), (x + 4, y + 8), (x - 4, y + 8), (x - 7, y + 3), (x - 5, y - 3)),
               '#4a8fe0', light=.45, ol='#10264a')
        F.part(ell(x - 2, y + 1, 1.5, 3), '#bfe0ff', shade=False, outline=False)
        F.px(x - 1, y - 4, '#e8f4ff')
    else:  # Comida: espiga de milho
        F.part(rot(ell(x, y - 1, 5, 10), x, y, 25), '#f2c230', light=.3)
        m = F.mask(rot(ell(x, y - 1, 4.2, 9.2), x, y, 25))
        yy, xx = grids(F)
        paint(F, m & (((xx + yy) % 3 == 0) | ((xx - yy) % 3 == 0)), '#c89418', .9)
        F.part(poly((x - 2, y + 9), (x - 11, y - 2), (x - 6, y + 2), (x + 1, y + 6)), '#5f9a3a', light=.35)
        F.part(poly((x + 2, y + 9), (x + 7, y - 6), (x + 7, y + 2), (x + 4, y + 8)), '#4f8a3a', light=.35)
        F.part(limb(x + 1, y + 9, x + 2, y + 12, 2), '#7a6a3a')


def work_plus(kind, k, rng):
    F = Frame(WT, WT)
    ys = [86, 68, 52, 38]
    al = [.85, 1.0, .9, .45]
    y = ys[k]
    tw = big_w('+1', 3)
    x0 = 64 - (tw + 4 + 22) // 2
    big_text(F, '+1', x0, y - 10, 3, col='#fff4e0', layer=F.a)
    icon_res(F, kind, x0 + tw + 4 + 11, y - 1, rng)
    if k == 0:
        sparkle(F, x0 - 4, y - 12, 3)
        sparkle(F, x0 + tw + 30, y + 4, 2)
    if k == 1:
        sparkle(F, x0 + tw + 28, y - 12, 2)
    img = compose(F)
    return fade(img, al[k])


def make_trabalho():
    fr = []
    for k in range(4):
        fr.append(work_axe(k, random.Random(500 + k)))
    for k in range(4):
        fr.append(work_hammer(k, random.Random(600 + k)))
    for k in range(4):
        fr.append(work_basket(k, random.Random(700 + k)))
    for kind in ['Madeira', 'Sucata', 'Pano', 'Água', 'Comida']:
        for k in range(4):
            fr.append(work_plus(kind, k, random.Random(800 + k)))
    grid(fr, 4).save(os.path.join(OUT, 'est_trabalho.png'))


# =====================================================================
#                           OBRA (andaime overlay)
# =====================================================================
TUBO, BRAC, REDE, CONE = CH1, OURO, '#4f8a3a', '#e0702a'


def tube_v(F, x, y0, y1):
    F.part(R(x - 2, y0, x + 2, y1), TUBO, light=.35, dark=.3)
    F.line(x - 1, y0 + 1, x - 1, y1 - 1, '#d8dee2')
    F.part(R(x - 4, y1 - 1, x + 4, y1 + 1), '#3a3e44')


def tube_h(F, x0, x1, y):
    F.part(R(x0, y - 1, x1, y + 1), TUBO, light=.35)


def clamp(F, x, y):
    F.part(R(x - 3, y - 2, x + 3, y + 2), BRAC, light=.4, ol='#4a3208')
    F.px(x, y, '#5a4210')


def deck(F, x0, x1, y, rng):
    planks(F, x0, y - 5, x1, y - 1, rng, pw=4, vertical=False, cols=(T1,), nails=False)
    yy, xx = grids(F)
    paint(F, F.mask(R(x0 + 1, y - 4, x1 - 1, y - 2)) & ((xx - x0) % 22 == 0), TE, 1)
    F.part(R(x0, y - 1, x1, y + 2), T2, light=.25)
    for x in range(int(x0) + 4, int(x1) - 2, 22):
        nail(F, x, y - 3)


def net(F, x0, y0, x1, y1):
    yy, xx = grids(F)
    m = F.mask(R(x0, y0, x1, y1))
    n = m & (((xx - x0) % 3 == 0) | ((yy - y0) % 3 == 0))
    n &= ~(((xx - x0) % 3 == 0) & ((yy - y0) % 3 == 0)) | n
    F.a[n, :3] = hexc(REDE); F.a[n, 3] = 215
    kn = m & ((xx - x0) % 3 == 0) & ((yy - y0) % 3 == 0)
    F.a[kn, :3] = (34, 64, 30); F.a[kn, 3] = 255
    F.part(R(x0, y0 - 1, x1, y0 + 1), '#3a6a2a', light=.3)


def cone(F, x, base):
    F.part(poly((x - 3, base - 16), (x + 3, base - 16), (x + 7, base - 2), (x - 7, base - 2)), CONE, light=.4,
           marks=[(R(x - 6, base - 10, x + 6, base - 7), '#f4efe6')])
    F.part(R(x - 9, base - 3, x + 9, base), '#c0501a', light=.3)


def bucket(F, x, base):
    F.part(poly((x - 7, base - 12), (x + 7, base - 12), (x + 6, base), (x - 6, base)), '#7a7f86', light=.4,
           marks=[(R(x - 7, base - 9, x + 7, base - 8), '#5a5f66')])
    F.part(ell(x, base - 12, 7, 2), '#b8b0a0', light=.2)
    F.px(x - 2, base - 13, '#d8d0c0'); F.px(x + 3, base - 12, '#8a8278')
    rope_line(F, x - 7, base - 12, x + 7, base - 12, sag=-6, col='#3a3e44')


def brick_stack(F, x, base, rng):
    for r in range(3):
        for i in range(3 - (r == 2)):
            F.part(R(x + i * 8 + r * 2, base - 5 - r * 5, x + i * 8 + 7 + r * 2, base - r * 5), jit(TJ1, rng), light=.3)


def zebra(F, x0, x1, y):
    m = F.part(R(x0, y - 4, x1, y), OURO, light=.35)
    yy, xx = grids(F)
    paint(F, m & (((xx + yy) // 4) % 2 == 0), '#1c1820', 1)


def sign(F, x, base):
    F.part(limb(x, base, x, base - 18, 2), '#3a3e44')
    F.part(poly((x, base - 34), (x + 10, base - 16), (x - 10, base - 16)), OURO, light=.35, ol='#3a2808')
    big_text(F, '!', x - 1, base - 29, 2, col='#1c1820', ol='#1c1820', layer=F.a, drop=False, hi=False)


def scaffold(F, x0, x1, ytop, gy, decks, rng, lona_side=1):
    w = x1 - x0
    xs = [x0, x1] if w < 200 else [x0, (x0 + x1) // 2, x1]
    # rede de proteção num vão
    bx0, bx1 = (xs[0] + 3, xs[1] - 3) if len(xs) > 2 else (xs[0] + 3, int(xs[0] + w * .55))
    net(F, bx0, decks[0] + 3, bx1, decks[1] - 6 if len(decks) > 1 else gy - 20)
    # travas em X
    levels = [ytop + 6] + decks
    for a, b in zip(levels, levels[1:] + [gy - 2]):
        for xa, xb in zip(xs, xs[1:]):
            F.part(limb(xa + 2, b - 2, xb - 2, a + 4, 2.4), CH2, light=.3)
    for x in xs:
        tube_v(F, x, ytop, gy)
    for y in [ytop + 6] + decks:
        tube_h(F, xs[0] - 6, xs[-1] + 6, y - 9)
        for x in xs:
            clamp(F, x, y - 9)
    for y in decks:
        deck(F, xs[0] - 8, xs[-1] + 8, y, rng)
        for x in xs:
            clamp(F, x, y + 4)
    # lona remendada pendurada
    lx0, lx1 = (int(xs[-1] - w * .42), xs[-1] + 4)
    top = ytop + 2
    bot = decks[0] - 8
    pts = [(lx0, top), (lx1, top)]
    nseg = 5
    for i in range(nseg + 1):
        t = i / nseg
        pts.append((lx1 + (lx0 - lx1) * t, bot + (6 if i % 2 else 0) - 10 * t * (1 if lona_side > 0 else -1) + 5))
    canvas(F, [pts], L1, rng, patches=2)
    for x in (lx0 + 2, (lx0 + lx1) / 2, lx1 - 2):
        rope_line(F, x, top - 4, x, top + 2, 0)
    # escadinha entre andares
    if len(decks) > 1:
        ladder(F, xs[0] + 14, decks[1] - 6, xs[0] + 16, decks[0] - 2, rng, col='#a9b0b6', w=9, rung=5, wr=2)
    # chão de obra
    zebra(F, xs[0] - 6, xs[0] + 40, gy)
    cone(F, xs[-1] + 2, gy + 2)
    bucket(F, xs[0] + 54, gy)
    brick_stack(F, xs[-1] - 34, gy, rng)
    if w >= 200:
        sign(F, (x0 + x1) // 2 + 30, gy)
    return xs


OBRA_GEOM = {
    '1x1': (128, 160, 148, 6, 122, 22, [64, 106]),
    '2x1': (256, 192, 180, 8, 248, 40, [82, 132]),
    '2x2': (256, 256, 244, 8, 248, 24, [78, 136, 192]),
}


def obra_frame(tam, k, rng):
    W, H, gy, x0, x1, ytop, decks = OBRA_GEOM[tam]
    F = Frame(W, H)
    if k <= 4:
        xs = scaffold(F, x0, x1, ytop, gy, decks, rng, lona_side=1)
        hx, hy = xs[0] + 34, decks[0] - 6
        if k in (1, 2, 3):
            ang = {1: -112, 2: 8, 3: -24}[k]
            tool_hammer(F, hx - 26, hy - 14, ang, L=26)
            if k == 2:
                impact(F, hx, hy - 2, 7)
                sparks(F, rng, hx, hy - 2, 9, 4, 16)
            if k == 3:
                sparks(F, rng, hx, hy - 1, 6, 9, 22, falling=6)
        if k == 0:
            tool_hammer(F, hx - 10, hy - 4, 80, L=18)
        if k == 4:
            for (px, py, r) in [(xs[0] + 20, gy - 6, 6), (xs[-1] - 16, gy - 5, 7), ((x0 + x1) / 2, gy - 4, 8),
                                (xs[0] + 40, decks[0] - 10, 5), (xs[-1] - 30, decks[-1] - 10, 6), ((x0 + x1) / 2 + 12, decks[0] - 14, 4)]:
                puff(F, px, py, r, col='#b8a88a')
                dust(F, px + r, py + 4, 3)
    else:
        cx = W / 2
        eglow(F, cx, gy - 2, W * .5, 14 if k == 5 else 10, OURO, 150 if k == 5 else 90)
        n = 7 if k == 5 else 10
        rr = .32 if k == 5 else .46
        for i in range(n):
            a = -math.pi * (i + .5) / n
            sx = cx + math.cos(a) * W * rr + rng.uniform(-6, 6)
            sy = gy - 10 + math.sin(a) * (gy - 30) * (rr * 1.9) + rng.uniform(-6, 6)
            star(F, sx, max(10, sy), r=(6 if k == 5 else 4) + rng.uniform(-1, 1.5))
        for i in range(n + 4):
            sparkle(F, rng.uniform(10, W - 10), rng.uniform(16, gy - 6), 3 if k == 5 else 2)
        for i in range(6 if k == 5 else 4):
            x = cx + (i - 2.5) * W * .15 + rng.uniform(-4, 4)
            hh = H * rng.uniform(.25, .45) * (1 if k == 5 else .6)
            for y in range(int(gy - 6), int(gy - 6 - hh), -1):
                t = (gy - 6 - y) / hh
                F.px(x, y, '#fff2b0', F.fx, alpha=int(200 * (1 - t)))
    return finish(F, None)


def make_obra():
    for tam in ('1x1', '2x1', '2x2'):
        fr = [obra_frame(tam, k, random.Random(900 + k)) for k in range(7)]
        strip(fr).save(os.path.join(OUT, 'est_obra_%s.png' % tam))


# =====================================================================
#                           SELO DE NÍVEL
# =====================================================================
WS = 64


def disc_ring(F, cx, cy, r0, r1, n, cols, mortar, rng):
    F.part(ell(cx, cy, r1, r1), mortar, light=.25)
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n + .04, 2 * math.pi * (i + 1) / n - .04
        pts = [(cx + r1 * .97 * math.cos(a0 + (a1 - a0) * t), cy + r1 * .97 * math.sin(a0 + (a1 - a0) * t)) for t in np.linspace(0, 1, 6)]
        pts += [(cx + r0 * math.cos(a1 - (a1 - a0) * t), cy + r0 * math.sin(a1 - (a1 - a0) * t)) for t in np.linspace(0, 1, 6)]
        F.part([pts], jit(rng.choice(cols), rng, .07), outline=False, tex=.15, light=.35, dark=.35)


def selo(k, rng):
    F = Frame(WS, WS)
    cx, cy = 32, 32
    yy, xx = grids(F)
    numc, numo = CREAM, '#1a0f14'
    if k == 1:
        F.part(ell(cx, cy, 29, 29), CORDA, light=.3)
        ring = F.mask(ell(cx, cy, 29, 29)) & ~F.mask(ell(cx, cy, 24, 24))
        paint(F, ring & ((xx + yy) % 4 < 2), dk(CORDA, .7), 1)
        m = canvas(F, ell(cx, cy, 24, 24), L1, rng, patches=0)
        F.part(R(36, 36, 50, 48), REM, clip=m, outline=False, tex=.2)
        for x in range(36, 51, 2):
            F.px(x, 36, '#e8dcc0')
        for y in range(36, 49, 2):
            F.px(36, y, '#e8dcc0')
        for i in range(0, 48):
            a = 2 * math.pi * i / 48
            if i % 2 == 0:
                F.px(cx + 21 * math.cos(a), cy + 21 * math.sin(a), '#c9bc98')
    elif k == 2:
        F.part(ell(cx, cy, 29, 29), TE, light=.3)
        m = F.part(ell(cx, cy, 25, 25), T1, tex=.15, light=.3)
        paint(F, m & ((xx - 4) % 8 == 0), TE, 1)
        paint(F, m & ((xx - 5) % 8 == 0), lt(T1, .25), .6)
        for (x, y) in [(10, 24), (54, 24), (10, 40), (54, 40), (26, 9), (38, 9), (26, 55), (38, 55)]:
            nail(F, x, y)
        F.part(ell(cx, cy, 29, 29), TE, light=.3, clip=~F.mask(ell(cx, cy, 25.5, 25.5)))
        ring = F.mask(ell(cx, cy, 29, 29)) & ~F.mask(ell(cx, cy, 26, 26))
        paint(F, ring & ((xx * 3 + yy) % 7 == 0), dk(TE, .6), 1)
    elif k == 3:
        disc_ring(F, cx, cy, 20, 29, 12, (P1, P2), ARG, rng)
        tile_roof(F, ell(cx, cy, 20, 20), 12, 12, rh=5, tw=7)
    elif k == 4:
        F.part(ell(cx, cy, 29, 29), CH1, light=.4)
        ring = F.mask(ell(cx, cy, 29, 29)) & ~F.mask(ell(cx, cy, 23, 23))
        paint(F, ring & ((xx + 2 * yy) % 9 == 0), CH2, .8)
        for i in range(10):
            a = 2 * math.pi * i / 10
            rivet(F, cx + 26 * math.cos(a), cy + 26 * math.sin(a))
        bricks(F, 9, 9, 55, 55, rng, clip=F.mask(ell(cx, cy, 22, 22)))
        F.part(ell(cx, cy, 23, 23), CH2, clip=F.mask(ell(cx, cy, 23, 23)) & ~F.mask(ell(cx, cy, 21.5, 21.5)), outline=False)
    elif k == 5:
        glow(F, cx, cy, 34, RUNA, 120)
        F.part(ell(cx, cy, 29, 29), OURO, light=.45, ol='#3a2408')
        F.part(ell(cx, cy, 25, 25), OURO2, outline=False, light=.2)
        for i in range(8):
            a = 2 * math.pi * i / 8 + math.pi / 8
            F.px(cx + 27 * math.cos(a), cy + 27 * math.sin(a), '#fff2b0')
        m = F.part(ell(cx, cy, 23, 23), LU1, tex=.12, light=.3)
        paint(F, m & (((xx + yy) % 11 == 0) | ((xx - yy) % 13 == 0)), LU2, .8)
        rune(F, 13, 30, 2, 5); rune(F, 48, 30, 4, 5)
        F.part(poly((cx, 0), (cx + 5, 5), (cx, 10), (cx - 5, 5)), RUNA, light=.5, ol='#3a0a10')
        F.px(cx - 1, 3, '#ffd0d0')
        glow(F, cx, 5, 10, RUNA2, 120)
        numc, numo = OURO, '#2a1606'
    if k <= 5:
        s = str(k)
        bw = big_w(s, 3)
        big_text(F, s, cx - bw // 2 - (1 if k == 1 else 0), cy - 11, 3, col=numc, ol=numo, layer=F.a)
    elif k == 6:  # em obra
        F.part(ell(cx, cy, 29, 29), OURO, light=.4, ol='#1c1820')
        ring = F.mask(ell(cx, cy, 29, 29)) & ~F.mask(ell(cx, cy, 22, 22))
        paint(F, ring & (((xx + yy) // 5) % 2 == 0), '#1c1820', 1)
        F.part(ell(cx, cy, 22, 22), '#3a3640', light=.25)
        gear(F, cx, cy, 15, teeth=8)
        F.part(ell(cx, cy, 5, 5), '#3a3640')
        tool_hammer(F, 14, 50, -48, L=28)
    else:  # precisa da Fogueira
        F.part(ell(cx, cy, 29, 29), '#5a4a50', light=.35)
        F.part(ell(cx, cy, 24, 24), '#2a2228', light=.25)
        F.part(limb(cx - 8, 30, cx - 8, 19, 5) + limb(cx + 8, 30, cx + 8, 19, 5) + ell(cx, 18, 9.5, 8), '#9aa3ab', light=.45)
        F.part(ell(cx, 18.5, 5, 4.5) + R(cx - 5, 18, cx + 5, 31), '#2a2228', outline=False, shade=False)
        F.part(R(cx - 13, 28, cx + 13, 48), OURO2, light=.45, ol='#3a2408',
               marks=[(R(cx - 13, 33, cx + 13, 34), OURO), (R(cx - 13, 42, cx + 13, 43), OURO)])
        F.part(ell(cx, 36, 3, 3) + poly((cx - 1.5, 37), (cx + 1.5, 37), (cx + 2, 43), (cx - 2, 43)), '#1a1014', shade=False)
        F.part(ell(48, 50, 9, 9), '#3a1a14', light=.3, ol='#1a0a08')
        F.part(poly((48, 40), (52, 46), (54, 51), (51, 56), (45, 56), (42, 51), (45, 46)), '#ff8a2a', shade=False, ol='#4a1408')
        F.part(poly((48, 46), (51, 51), (49, 55), (46, 55), (45, 51)), '#ffe07a', shade=False, outline=False)
    return finish(F, None)


def make_selo():
    fr = [selo(k, random.Random(1100 + k)) for k in range(1, 8)]
    strip(fr).save(os.path.join(OUT, 'est_selo.png'))


# =====================================================================
#                      GHOST (prévia de construção)
# =====================================================================

def ghost_tile(F, fill, border, light):
    F.flat(R(2, 2, 125, 125), fill, alpha=78)
    for (a, b, c, d) in [(1, 1, 126, 3), (1, 124, 126, 126), (1, 1, 3, 126), (124, 1, 126, 126)]:
        F.flat(R(a, b, c, d), border, alpha=220)
    for (sx, sy) in [(1, 1), (126, 1), (1, 126), (126, 126)]:
        dx = 1 if sx < 64 else -1
        dy = 1 if sy < 64 else -1
        F.flat(R(min(sx, sx + dx * 16), min(sy, sy + dy * 4), max(sx, sx + dx * 16), max(sy, sy + dy * 4)), light)
        F.flat(R(min(sx, sx + dx * 4), min(sy, sy + dy * 16), max(sx, sx + dx * 4), max(sy, sy + dy * 16)), light)
    for x in range(16, 125, 16):
        for y in range(16, 125, 16):
            F.px(x, y, light, alpha=150)
    for d in range(-5, 6):
        F.px(64 + d, 64, light, alpha=170); F.px(64, 64 + d, light, alpha=170)


def gold_line(F, x0, x1, y=64):
    F.flat(R(x0, y - 5, x1, y + 5), OURO, layer=F.fx, alpha=50)
    F.flat(R(x0, y - 3, x1, y + 3), OURO, layer=F.fx, alpha=90)
    F.part(R(x0, y - 1, x1, y + 1), OURO, shade=False, ol='#5a3a08')
    F.line(x0, y - 1, x1, y - 1, '#fff2b0')
    F.line(x0, y + 1, x1, y + 1, OURO2)
    for x in range(x0 + 8, x1, 16):
        F.part(poly((x, y - 4), (x + 4, y), (x, y + 4), (x - 4, y)), OURO, shade=False, ol='#5a3a08')
        F.px(x - 1, y - 1, '#ffffff')


def hard_hat(F, cx, cy, col='#f2b630'):
    F.part(poly((cx - 34, cy + 6), (cx + 34, cy + 6), (cx + 38, cy + 12), (cx - 38, cy + 12)), dk(col, .88), light=.35)
    dome = ell(cx, cy + 6, 28, 30)
    m = F.part(dome, col, light=.35, dark=.35, clip=F.mask(R(cx - 40, cy - 40, cx + 40, cy + 7)))
    F.part(R(cx - 5, cy - 23, cx + 5, cy + 6), lt(col, .2), clip=m, light=.3)
    F.part(R(cx - 28, cy + 1, cx + 28, cy + 6), dk(col, .8), clip=m, outline=False, light=.2)
    F.part(ell(cx - 14, cy - 10, 4, 6), lt(col, .7), clip=m, outline=False, shade=False)
    F.px(cx + 12, cy - 6, dk(col, .6)); F.px(cx + 13, cy - 5, dk(col, .6)); F.px(cx - 20, cy + 3, dk(col, .55))


def ghost(k, rng):
    F = Frame(128, 128)
    if k == 0:
        ghost_tile(F, '#4fb06a', '#9ff0a8', '#e8ffe8')
    elif k == 1:
        ghost_tile(F, '#c8323a', RUNA2, '#ffd0d0')
        F.part(limb(38, 38, 90, 90, 12) + limb(90, 38, 38, 90, 12), RUNA, light=.35, ol='#3a0a10')
        F.line(36, 34, 46, 44, RUNA2); F.line(86, 34, 80, 40, RUNA2)
    elif k == 2:
        gold_line(F, 64, 128)
        glow(F, 64, 64, 22, OURO, 150)
        F.part(ell(64, 64, 8, 8), OURO, light=.45, ol='#4a3208')
        F.part(ell(64, 64, 4, 4), '#fff2b0', shade=False, outline=False)
        star(F, 64, 64, OURO, 13)
        sparkle(F, 64, 64, 5)
    elif k == 3:
        gold_line(F, 0, 128)
    else:
        hard_hat(F, 60, 62, '#f2b630' if k == 4 else '#b8a070')
        bx, by = 92, 92
        if k == 4:
            F.part(ell(bx, by, 14, 14), '#4fb06a', light=.35, ol='#14361a')
            F.part(limb(bx - 7, by, bx - 2, by + 5, 4) + limb(bx - 2, by + 5, bx + 7, by - 6, 4), '#f4fff4', shade=False, ol='#14361a')
        else:
            F.part(ell(bx, by, 14, 14), RUNA, light=.35, ol='#3a0a10')
            F.part(ell(bx, by, 9, 9), '#f4efe6', light=.2)
            F.line(bx, by, bx, by - 6, '#1c1418'); F.line(bx, by, bx + 4, by + 2, '#1c1418')
            F.px(bx, by - 8, '#1c1418'); F.px(bx + 8, by, '#1c1418'); F.px(bx, by + 8, '#1c1418'); F.px(bx - 8, by, '#1c1418')
    return finish(F, None)


def make_ghost():
    fr = [ghost(k, random.Random(1200 + k)) for k in range(6)]
    strip(fr).save(os.path.join(OUT, 'est_ghost.png'))


# =====================================================================
#                           CAMAS
# =====================================================================
GYC = 112


def colchonete(F, rng):
    top = poly((16, 84), (112, 84), (118, 98), (10, 98))
    m = F.part(top, '#5a7aa0', tex=.15, light=.25)
    yy, xx = grids(F)
    paint(F, m & ((xx + (yy - 84) // 2) % 10 < 2), '#8aa6c8', .8)
    for (x, y, r) in [(70, 91, 7), (40, 94, 4)]:
        paint(F, F.mask(ell(x, y, r, r * .5)) & m, '#7a6a4a', .45)
    F.part(R(10, 98, 118, 106), '#3f5a7a', light=.2,
           marks=[(R(10, 101, 118, 102), '#2f4a6a')])
    F.part(poly((112, 84), (118, 98), (118, 104), (108, 98)), '#d8c070', tex=.4, light=.2)
    F.part(poly((22, 78), (44, 78), (48, 90), (18, 90)), '#e0d6c0', tex=.1, light=.3)
    F.line(28, 84, 40, 85, '#b8ac94')
    for i in range(3):
        y0 = 86 + i * 4
        F.part(R(72 - i, y0 - 6, 104 + i, y0), ['#9a2e2a', '#7a2422', '#9a2e2a'][i], light=.3)
    mm = F.mask(R(70, 78, 106, 98))
    paint(F, mm & ((xx % 6) == 0), '#3a1414', .7)
    paint(F, mm & ((yy % 5) == 0), '#d8b060', .4)


def rede(F, rng):
    for x in (14, 114):
        F.part(limb(x, GYC, x + (2 if x < 64 else -2), 34, 8, 7), T2, tex=.2)
        F.part(ell(x + (2 if x < 64 else -2), 34, 4, 2), lt(T2, .2))
        for y in (44, 47):
            F.line(x - 4, y, x + 4, y + 1, CORDA)
    L, Rr = (26, 58), (102, 58)
    for i in range(6):
        t = i / 5
        rope_line(F, 16, 46, L[0], L[1] - 6 + t * 12, 0, '#e8dcc0')
        rope_line(F, 112, 46, Rr[0], Rr[1] - 6 + t * 12, 0, '#e8dcc0')
    yy, xx = grids(F)
    topf = lambda x: 58 + 22 * math.sin(math.pi * (x - 26) / 76)
    botf = lambda x: 64 + 32 * math.sin(math.pi * (x - 26) / 76)
    pts = [(x, topf(x)) for x in range(26, 103, 4)] + [(x, botf(x)) for x in range(102, 25, -4)]
    m = F.part([pts], '#c0443a', tex=.1, light=.25, dark=.35)
    cols = ['#c0443a', '#e8b838', '#4f8a4a', '#e8dcc0', '#c0443a', '#3f6a8c', '#e8b838']
    T = np.zeros_like(yy, float)
    for x in range(26, 103):
        a, b = topf(x), botf(x)
        T[:, x] = (yy[:, x] - a) / max(1, (b - a))
    band = np.clip((T * len(cols)).astype(int), 0, len(cols) - 1)
    for i, c in enumerate(cols):
        paint(F, m & (band == i), c, .85)
    paint(F, m & ((xx % 5) == 0), '#2a1a14', .18)
    for x in range(30, 100, 2):
        y = botf(x)
        L2 = 5 + (x % 3)
        F.line(x, y + 1, x, y + L2, '#e8dcc0' if (x // 2) % 2 else '#c0443a')
    F.part(ell(40, 66, 6, 3), '#e8e0cc', light=.3)


def beliche(F, rng):
    for x in (24, 108):
        F.part(R(x, 30, x + 4, GYC - 6), TE, light=.2)
    yy, xx = grids(F)
    for y in (56, 96):
        mm = F.part(poly((22, y - 15), (110, y - 15), (113, y - 4), (19, y - 4)), '#d8d0bc', tex=.12, light=.3)
        paint(F, mm & ((xx % 6) < 2), '#8aa6c8', .7)
        paint(F, F.mask(ell(70, y - 9, 8, 3)) & mm, '#9a8a6a', .4)
        F.part(poly((26, y - 21), (46, y - 21), (49, y - 12), (23, y - 12)), '#e8e0cc', light=.3)
        F.line(30, y - 16, 42, y - 15, '#b8ac94')
        plank(F, 14, y - 4, 116, y + 3, T1, rng, vertical=False)
    for x in (12, 112):
        F.part(R(x, 24, x + 6, GYC), T2, tex=.15, light=.25)
        nail(F, x + 3, 52); nail(F, x + 3, 92)
    plank(F, 14, 30, 116, 34, T1, rng, vertical=False)
    ladder(F, 92, GYC, 92, 52, rng, col=T1, w=12, rung=8, wr=2.6)
    cv = poly((30, 58), (66, 58), (64, 76), (58, 72), (52, 78), (44, 72), (36, 78), (30, 74))
    m = canvas(F, [cv[0]], '#9a2e2a', rng, patches=1, folds=True)
    F.part(R(10, GYC - 4, 20, GYC), TE); F.part(R(110, GYC - 4, 120, GYC), TE)
    F.part(poly((84, 104), (98, 104), (96, 110), (86, 110)), '#4a3a30', light=.3)


def saco(F, rng, occupied=False, zk=0):
    body = [(20, 92), (30, 84), (100, 84), (114, 88), (118, 96), (112, 104), (28, 106), (16, 100)]
    if occupied:
        body = [(20, 90), (30, 80), (60, 78), (100, 80), (114, 86), (118, 96), (112, 104), (28, 106), (16, 100)]
    m = F.part([body], '#5c6a3a', tex=.2, light=.28, dark=.35)
    yy, xx = grids(F)
    paint(F, m & ((xx - 30) % 11 == 0), '#3c4a24', 1)
    paint(F, m & ((xx - 31) % 11 == 0), '#7a8a52', .6)
    for x in range(30, 112, 2):
        F.px(x, 85 if not occupied else 82 + (abs(x - 60) < 30) * 0, '#c9ced4')
    F.part(ell(26, 94, 9, 8), '#d87a2a', light=.3, tex=.1)
    F.part(ell(27, 94, 6, 5.5), '#2a1810' if not occupied else '#d87a2a', outline=False, shade=False)
    F.part(R(106, 98, 112, 100), '#c9ced4')
    if occupied:
        F.part(ell(27, 93, 7, 6), '#b07850', light=.35)
        F.part(ell(25, 87, 7.5, 3.6) + ell(19, 90, 2.6, 3.5), '#2a1a12', light=.25, tex=.2)
        F.line(27, 93, 30, 93, '#3a2018'); F.px(31, 92, '#3a2018')
        F.px(28, 96, '#8a5038'); F.px(29, 96, '#8a5038')
        F.px(23, 94, '#d89a70')
        F.part(poly((30, 96), (44, 92), (48, 100), (32, 102)), '#d87a2a', light=.3)
        zs = [(46, 66, 2), (58, 48, 3)] if zk == 0 else [(52, 58, 2), (66, 38, 3)]
        for (x, y, sc) in zs:
            text(F, 'Z', x, y, col=CREAM, sc=sc, ol='#1a0f14')


def cama(k, rng):
    F = Frame(128, 128)
    if k == 0:
        colchonete(F, rng)
        sh = shadow_layer(66, 54, 4, 95, 128, 128, 104)
    elif k == 1:
        rede(F, rng)
        sh = shadow_layer(66, 52, 4, 80, 128, 128, GYC)
    elif k == 2:
        beliche(F, rng)
        sh = shadow_layer(66, 56, 4, 100, 128, 128, GYC)
    else:
        saco(F, rng, occupied=k >= 4, zk=k - 4)
        sh = shadow_layer(68, 52, 4, 95, 128, 128, 104)
    return finish(F, sh)


def make_cama():
    fr = [cama(k, random.Random(1300 + k)) for k in range(6)]
    strip(fr).save(os.path.join(OUT, 'est_cama.png'))



if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1:] or ['all']
    if 'all' in which or 'guarda' in which:
        make_guard()
    if 'all' in which or 'toras' in which:
        make_toras()
    if 'all' in which or 'coleta' in which:
        make_coleta()
    for nm, fn in [('trabalho', 'make_trabalho'), ('obra', 'make_obra'), ('selo', 'make_selo'), ('ghost', 'make_ghost'),
                   ('cama', 'make_cama')]:
        if 'all' in which or nm in which:
            globals()[fn]()
