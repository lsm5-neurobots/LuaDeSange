"""Construções: moradia, energia e defesa (barraca, gerador, barricada, muralha, portão).
Rodar da pasta tools:  python obj_construcoes_defesa.py [id ...]
Gera sprites/con_*.png em grade cols=5 (linhas = estado, colunas = nível 1..5).
"""
import math
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, hexc, mix, shift, dilate,  # noqa: E402
                    NIGHT, MOON, INK, shadow_layer, over, glow, grid)

OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- escada de materiais (CONTRATO) ----------------
LONA, LONA2, REM, LONAZ, CORDA, ESTACA, FERR, SUC = ('#5f7a4a', '#4a6139', '#8a7a52', '#3f6a8c',
                                                      '#b59a62', '#8a6a42', '#8a4e2e', '#6b6a66')
TAB, TAB2, TABD, PREGO, RIPA = '#9a6a3c', '#7d5430', '#5a3a22', '#c9c3b0', '#8b5e34'
PED, PED2, ARG, TEL, TEL2 = '#8e8a84', '#77736e', '#b8b0a0', '#b5562e', '#8f3f22'
TIJ, TIJ2, REJ, MET, REB, CHA, CHA2, LAMP = ('#a5432e', '#86351f', '#c9b8a0', '#7d848c', '#c9ced4',
                                             '#8d969c', '#6b747a', '#ffd36a')
LPED, LPED2, OURO, OURO2, ARD, RUNA, RUNAB = ('#2e2836', '#3c3446', '#f2c230', '#b8861a', '#1c1822',
                                              '#c8323a', '#ff5a5a')
FUL, VIGA = '#2a2228', '#2a1a12'
PNEU, SANG, FERRO = '#2b2a2e', '#5a1a1a', '#2e2a2a'
TERRA = '#6a5640'

WH = {1: 50, 2: 60, 3: 64, 4: 68, 5: 72}     # altura da face da muralha
WT = {1: 0, 2: 0, 3: 10, 4: 8, 5: 12}        # topo (passarela) visto de cima

# ---------------- utilidades ----------------
_GR = {}


def grids(w, h):
    k = (w, h)
    if k not in _GR:
        yy, xx = np.mgrid[0:h, 0:w]
        _GR[k] = (yy.astype(float), xx.astype(float))
    return _GR[k]


def rnd(a, b=0.0, k=0.0):
    v = np.sin(np.asarray(a, float) * 12.9898 + np.asarray(b, float) * 78.233 + k * 37.719) * 43758.5453
    return v - np.floor(v)


def rn(a, b=0, k=0):
    return float(rnd(a, b, k))


def lowfreq(w, h, cell, seed):
    rng = np.random.RandomState(seed)
    gw, gh = w // cell + 3, h // cell + 3
    g = (rng.rand(gh, gw) * 255).astype(np.uint8)
    im = Image.fromarray(g, 'L').resize((gw * cell, gh * cell), Image.BILINEAR)
    return np.array(im)[cell:cell + h, cell:cell + w].astype(float) / 255


def C0(F, c=None):
    C = np.zeros((F.h, F.w, 3), float)
    if c is not None:
        C[:] = hexc(c) if isinstance(c, str) else c
    return C


def H(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def rmask(F, x0, y0, x1, y1):
    m = np.zeros((F.h, F.w), bool)
    x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
    m[max(0, y0):max(0, y1 + 1), max(0, x0):max(0, x1 + 1)] = True
    return m


def R(x0, y0, x1, y1):
    """retângulo inclusivo (sem ambiguidade de arredondamento)."""
    return [[(x0 + .5, y0 + .5), (x1 + .5, y0 + .5), (x1 + .5, y1 + .5), (x0 + .5, y1 + .5)]]


def _sh(m, dx, dy):
    """shift com borda replicada em x (muros emendam sem contorno nas laterais)."""
    o = np.zeros_like(m)
    if dx > 0:
        o[:, dx:] = m[:, :-dx]
        o[:, :dx] = m[:, :1]
    elif dx < 0:
        o[:, :dx] = m[:, -dx:]
        o[:, dx:] = m[:, -1:]
    else:
        o[:] = m
    if dy > 0:
        o2 = np.zeros_like(o)
        o2[dy:] = o[:-dy]
        o = o2
    elif dy < 0:
        o2 = np.zeros_like(o)
        o2[:dy] = o[-dy:]
        o = o2
    return o


def paint(F, m, C, light=.22, dark=.30, outline=True, ol=None, layer=None):
    """como F.part, mas com cor por pixel (textura procedural)."""
    L = F.a if layer is None else layer
    if not m.any():
        return m
    C = np.array(C, float, copy=True)
    if C.ndim == 1:
        C = np.broadcast_to(C, (F.h, F.w, 3)).copy()
    lit = m & ~_sh(m, 1, 2)
    sh = m & ~_sh(m, -2, -3)
    deep = m & ~_sh(m, -1, -1)
    base = C[m].mean(0)
    C[lit] = mix(C[lit], MOON, light)
    C[sh] = mix(C[sh] * (1 - dark * .5), NIGHT, dark)
    C[deep] = mix(C[deep] * .78, NIGHT, dark)
    L[m, :3] = np.clip(C[m], 0, 255)
    L[m, 3] = 255
    if outline:
        d = m | _sh(m, 1, 0) | _sh(m, -1, 0) | _sh(m, 0, 1) | _sh(m, 0, -1)
        o = d & ~m
        oc = mix(base * .32, INK, .55) if ol is None else H(ol)
        L[o, :3] = oc
        L[o, 3] = 255
    return m


def part(F, shapes, col, **kw):
    return F.part(shapes, col, **kw)


def P(F, shapes, col, marks=(), **kw):
    """atalho para F.part"""
    return F.part(shapes, col, marks=marks, **kw)


def dot(F, x, y, col, layer=None, alpha=255):
    F.px(x, y, col, layer=layer, alpha=alpha)


def hline(F, x0, x1, y, col, layer=None, clip=None):
    for x in range(int(x0), int(x1) + 1):
        if clip is None or (0 <= y < F.h and 0 <= x < F.w and clip[int(y), x]):
            F.px(x, y, col, layer)


def vline(F, x, y0, y1, col, layer=None, clip=None):
    for y in range(int(y0), int(y1) + 1):
        if clip is None or (0 <= y < F.h and 0 <= x < F.w and clip[y, int(x)]):
            F.px(x, y, col, layer)


def tint(F, m, col, t):
    F.a[m, :3] = np.clip(mix(F.a[m, :3].astype(float), H(col), t), 0, 255)


def darken(F, m, k):
    F.a[m, :3] = np.clip(F.a[m, :3].astype(float) * k, 0, 255)


def jag(pts, amp, rng, step=4):
    """polilinha com ruído perpendicular (bordas quebradas)."""
    out = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(L / step))
        nx, ny = -(y1 - y0) / (L or 1), (x1 - x0) / (L or 1)
        for j in range(n):
            t = j / n
            o = (rng.rand() * 2 - 1) * amp if 0 < j or i > 0 else 0
            out.append((x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o))
    out.append(pts[-1])
    return out


def cut(F, K):
    """apaga a região K e contorna a borda do corte."""
    sol = F.a[..., 3] > 0
    F.a[K] = 0
    F.fx[K] = 0
    edge = sol & ~K & dilate(K)
    F.a[edge, :3] = np.clip(mix(F.a[edge, :3].astype(float) * .35, INK, .5), 0, 255)
    e2 = sol & ~K & ~edge & dilate(edge)
    F.a[e2, :3] = np.clip(F.a[e2, :3].astype(float) * .72, 0, 255)


# ---------------- texturas por material ----------------

def T_planks(F, x0, pw=7, cols=(TAB, TAB2), gap=TABD, seed=0, horiz=False, y0=0):
    yy, xx = grids(F.w, F.h)
    a, b = (yy, xx) if horiz else (xx, yy)
    o = y0 if horiz else x0
    i = np.floor((a - o) / pw)
    u = (a - o) % pw
    t = rnd(i, 0, seed)
    C = mix(H(cols[0]), H(cols[1]), t[..., None]) * (.9 + .16 * rnd(i, 3, seed))[..., None]
    C[u == 1] *= 1.1
    C[u == pw - 1] *= .86
    g = (rnd(i * 7 + u, np.floor(b / 5) + i * 3, seed + 2) < .1) & (u > 0)
    C[g] *= .84
    knot = (rnd(i, np.floor(b / 11), seed + 5) < .05) & (np.abs(u - pw // 2) <= 1) & ((b % 11) < 2)
    C[knot] = H(gap)
    C[u == 0] = H(gap)
    return C


def T_stone(F, x0, y0, ch=8, bmin=10, bmax=18, cols=(PED, PED2), mortar=ARG, period=128, seed=0, chip=True):
    yy, xx = grids(F.w, F.h)
    rng = np.random.RandomState(seed)
    r = np.floor((yy - y0) / ch).astype(int)
    v = (yy - y0) % ch
    bid = np.zeros((F.h, F.w), float)
    mort = (v == 0)
    left = np.zeros((F.h, F.w), bool)
    right = np.zeros((F.h, F.w), bool)
    xm = (xx - x0) % period
    for rr in range(r.min(), r.max() + 1):
        sel = (r == rr)
        cuts = []
        x = rng.randint(0, bmax)
        while x < period:
            cuts.append(x)
            x += rng.randint(bmin, bmax + 1)
        if period - cuts[-1] + cuts[0] < bmin * .6 and len(cuts) > 1:
            cuts.pop()
        cuts = np.array(cuts)
        k = np.searchsorted(cuts, xm, side='right')
        k[k == 0] = len(cuts)
        k[k == len(cuts)] = len(cuts)
        bid[sel] = (rr * 100 + k)[sel]
        mort[sel] |= np.isin(xm, cuts)[sel]
        left[sel] |= np.isin(xm - 1, cuts)[sel]
        right[sel] |= np.isin((xm + 1) % period, cuts)[sel]
    t = rnd(bid, 0, seed)
    C = mix(H(cols[0]), H(cols[1]), t[..., None]) * (.93 + .12 * rnd(bid, 5, seed))[..., None]
    C[(v == 1) & ~mort] = mix(C[(v == 1) & ~mort], MOON, .16)
    C[left & ~mort] = mix(C[left & ~mort], MOON, .1)
    C[(v == ch - 1)] *= .84
    C[right & ~mort] *= .88
    if chip:
        sp = rnd(xx, yy, seed + 9) < .07
        C[sp] *= .86
        sp2 = rnd(xx, yy, seed + 11) < .03
        C[sp2] = mix(C[sp2], MOON, .12)
    M = H(mortar) * (.92 + .1 * rnd(xx, yy, seed + 3))[..., None]
    C[mort] = M[mort]
    return C


def T_brick(F, x0, y0, bh=5, bw=10, period=128, seed=0):
    yy, xx = grids(F.w, F.h)
    r = np.floor((yy - y0) / bh)
    v = (yy - y0) % bh
    off = (r % 2) * (bw // 2)
    xm = (xx - x0 + off) % period
    u = xm % bw
    b = np.floor(xm / bw) + r * 50
    t = rnd(b, 0, seed)
    C = mix(H(TIJ), H(TIJ2), t[..., None])
    burnt = rnd(b, 2, seed) > .9
    C[burnt] *= .72
    lite = rnd(b, 4, seed) > .9
    C[lite] = mix(C[lite], H('#c0603e'), .5)
    C[v == 0] = mix(C[v == 0], MOON, .14)
    C[u == bw - 2] *= .9
    sp = rnd(xx, yy, seed + 7) < .08
    C[sp] *= .87
    mort = (v == bh - 1) | (u == bw - 1)
    C[mort] = (H(REJ) * (.9 + .1 * rnd(xx, yy, seed + 1))[..., None])[mort]
    return C


def T_canvas(F, x0, cols=(LONA, LONA2), seed=0, fold=9):
    yy, xx = grids(F.w, F.h)
    f = .5 + .5 * np.sin(2 * math.pi * (xx - x0) / fold + .8 * np.sin(yy / 13 + seed))
    q = np.floor(f * 3) / 2
    A, B = H(cols[0]), H(cols[1])
    C = mix(A * 1.08, B, q[..., None])
    w = ((xx + yy) % 2 == 0) & (rnd(xx, yy, seed) < .25)
    C[w] *= .93
    lf = lowfreq(F.w, F.h, 9, seed + 40)
    C[lf > .72] = mix(C[lf > .72], H('#6a5a3a'), .35)
    return C


def T_corr(F, x0, cols=(CHA, CHA2), seed=0, rust=.6, horiz=False, y0=0):
    yy, xx = grids(F.w, F.h)
    u = ((yy - y0) if horiz else (xx - x0)) % 4
    A, B = H(cols[0]), H(cols[1])
    C = np.zeros((F.h, F.w, 3))
    C[u == 0] = mix(A, MOON, .22)
    C[u == 1] = A
    C[u == 2] = B
    C[u == 3] = B * .82
    lf = lowfreq(F.w, F.h, 7, seed + 20)
    if rust < 1:
        rm = lf > rust
        rm |= (lf > rust - .06) & (rnd(xx, yy, seed) < .5)
        C[rm] = mix(C[rm], H(FERR), .72)
        deep = lf > rust + .12
        C[deep] = mix(C[deep], H('#6a3420'), .55)
    return C


def T_tiles(F, x0, y0, tw=6, th=5, seed=0, moss=True):
    yy, xx = grids(F.w, F.h)
    r = np.floor((yy - y0) / th)
    v = (yy - y0) % th
    off = (r % 2) * (tw // 2)
    u = (xx - x0 + off) % tw
    b = np.floor((xx - x0 + off) / tw) + r * 77
    t = rnd(b, 0, seed)
    C = mix(H(TEL), H(TEL2), (t * .7)[..., None])
    C[rnd(b, 3, seed) > .93] *= .75
    C[u == 0] = mix(C[u == 0], MOON, .18)
    C[u == 1] = mix(C[u == 1], MOON, .08)
    C[u == tw - 1] *= .8
    C[(v == th - 2) & ((u == 0) | (u == tw - 1))] *= .82
    C[v == th - 1] = H(TEL2) * .62
    if moss:
        lf = lowfreq(F.w, F.h, 10, seed + 3)
        mm = (lf > .7) & (rnd(xx, yy, seed + 1) < .7)
        C[mm] = mix(C[mm], H('#56643a'), .45)
    return C


def T_ripas(F, x0, y0, rh=5, seed=0):
    yy, xx = grids(F.w, F.h)
    r = np.floor((yy - y0) / rh)
    v = (yy - y0) % rh
    off = rnd(r, 0, seed) * 30
    seg = 22
    s = (xx - x0 + off) % seg
    b = np.floor((xx - x0 + off) / seg) + r * 31
    t = rnd(b, 1, seed)
    C = mix(H(RIPA), H(TAB2), t[..., None]) * (.92 + .14 * rnd(b, 2, seed))[..., None]
    g = rnd(np.floor(xx / 3) + b, v, seed + 4) < .12
    C[g] *= .86
    C[v == 0] = mix(C[v == 0], MOON, .15)
    C[v == rh - 1] = H(TABD)
    C[s < 1] = H(TABD)
    nail = (s == 3) & (v == 2)
    C[nail] = H(PREGO)
    return C


def T_slate(F, x0, y0, sw=7, sh=5, seed=0):
    yy, xx = grids(F.w, F.h)
    r = np.floor((yy - y0) / sh)
    v = (yy - y0) % sh
    off = (r % 2) * (sw // 2)
    u = (xx - x0 + off) % sw
    b = np.floor((xx - x0 + off) / sw) + r * 41
    t = rnd(b, 0, seed)
    C = mix(H(ARD), H(LPED), (t * .55)[..., None])
    C[rnd(b, 2, seed) > .9] = mix(C[rnd(b, 2, seed) > .9], H(LPED2), .6)
    C[v == 0] = mix(C[v == 0], H(LPED2), .6)
    C[v == sh - 1] = H(ARD) * .6
    C[u == 0] = H(ARD) * .7
    C[(v == sh - 2) & ((u == 1) | (u == sw - 1))] *= .8
    return C


def T_noise(F, col, amt=.12, seed=0, col2=None):
    yy, xx = grids(F.w, F.h)
    C = C0(F, col)
    if col2 is not None:
        lf = lowfreq(F.w, F.h, 6, seed)
        C = mix(H(col), H(col2), lf[..., None])
    C *= (1 - amt / 2 + amt * rnd(xx, yy, seed))[..., None]
    return C


# ---------------- elementos reaproveitáveis ----------------

def rivets(F, x0, x1, y, step=6, col=REB, clip=None):
    for x in range(int(x0), int(x1) + 1, step):
        if clip is not None and not (0 <= x < F.w and 0 <= y < F.h and clip[int(y), x]):
            continue
        dot(F, x, y, col)
        dot(F, x + 1, y + 1, '#3a3e44')


def nails(F, x0, x1, y, step, clip=None):
    for x in range(int(x0), int(x1) + 1, step):
        if clip is not None and not (0 <= x < F.w and 0 <= y < F.h and clip[int(y), int(x)]):
            continue
        dot(F, x, y, PREGO)
        dot(F, x + 1, y + 1, TABD)


def rope(F, pts, col=CORDA, w=1.6):
    P(F, chain(pts, w), col, outline=True, light=.3)
    for (x, y) in pts[1:-1]:
        dot(F, x, y, '#e0c98e')


def sag_pts(x0, y0, x1, y1, s, n=8):
    return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n + s * math.sin(math.pi * i / n)) for i in range(n + 1)]


def lamp(F, x, y, on=True, cage=True, r=22):
    P(F, R(x - 2, y - 5, x + 2, y - 4), MET)
    P(F, ell(x + .5, y + .5, 3.2, 3.6), LAMP if on else '#6a6250', light=.5, ol='#5a4a1a' if on else None)
    if on:
        dot(F, x - 1, y - 1, '#fff6d0')
        dot(F, x, y - 1, '#fff6d0')
    if cage:
        vline(F, x, y - 3, y + 3, '#3a3e44')
        hline(F, x - 3, x + 3, y + 1, '#3a3e44')
    if on:
        glow(F, x, y, r, '#ffd36a', alpha=110)


def flame(F, x, y, s=1.0, red=False):
    """foguinho (camada fx)."""
    cA, cB, cC = ('#c8323a', '#ff5a5a', '#ffc0a0') if red else ('#e8622a', '#ffa03a', '#ffe08a')
    glow(F, x, y - 3 * s, 12 * s, '#ff5a3a' if red else '#ff9a3a', alpha=95)
    P(F, [[(x - 4 * s, y), (x - 3 * s, y - 6 * s), (x - 1 * s, y - 4 * s), (x, y - 10 * s), (x + 2 * s, y - 5 * s),
           (x + 3 * s, y - 7 * s), (x + 4.5 * s, y)]], cA, shade=False, ol='#5a1a10', layer=F.fx)
    P(F, [[(x - 2.5 * s, y), (x - 1 * s, y - 4 * s), (x + .5 * s, y - 7 * s), (x + 2 * s, y - 3 * s), (x + 3 * s, y)]],
      cB, shade=False, outline=False, layer=F.fx)
    P(F, [[(x - 1 * s, y), (x + .5 * s, y - 3.5 * s), (x + 1.8 * s, y)]], cC, shade=False, outline=False, layer=F.fx)
    dot(F, x + 1, y - 12 * s, cB, layer=F.fx)
    dot(F, x - 2, y - 9 * s, cA, layer=F.fx)


def smoke(F, x, y, n=4, s=1.0, drift=2.0, dark=False, red=False, seed=0):
    rng = np.random.RandomState(seed)
    for k in range(n):
        t = k / max(1, n - 1)
        cx = x + drift * k + rng.uniform(-1.5, 1.5)
        cy = y - k * 8 * s - rng.uniform(0, 2)
        r = (2.6 + k * 1.3) * s
        if red:
            c = mix(H('#6a3a44'), H('#b07a80'), t)
        elif dark:
            c = mix(H('#3a3440'), H('#7a7484'), t)
        else:
            c = mix(H('#6a6474'), H('#aaa4b2'), t)
        sh = ell(cx, cy, r, r * .85) + ell(cx - r * .7, cy + r * .35, r * .65, r * .55) + \
            ell(cx + r * .75, cy + r * .2, r * .6, r * .55)
        lay = F.layer()
        P(F, sh, c, ol=mix(c * .45, INK, .4), layer=lay, light=.3, dark=.25)
        a = int(205 - 115 * t)
        lay[..., 3] = (lay[..., 3].astype(float) * a / 255).astype(np.uint8)
        F.fx[:] = over(F.fx, lay)


def ember_glow(F, x, y, col='#ff7a2a'):
    dot(F, x, y, col, layer=F.fx)
    dot(F, x + 1, y, '#ffd36a', layer=F.fx)


def crack(F, x, y, L, rng, clip, ang=90, branch=.25, depth=0):
    """rachadura preta ramificada (dentro de clip)."""
    a = math.radians(ang)
    px, py = x, y
    for i in range(int(L)):
        a += rng.uniform(-.55, .55)
        a = a * .7 + math.radians(ang) * .3
        px += math.cos(a)
        py += math.sin(a)
        ix, iy = int(round(px)), int(round(py))
        if not (0 <= ix < F.w and 0 <= iy < F.h) or not clip[iy, ix]:
            break
        F.a[iy, ix, :3] = (18, 12, 16)
        if ix + 1 < F.w and clip[iy, ix + 1] and rng.rand() < .6:
            F.a[iy, ix + 1, :3] = np.clip(F.a[iy, ix + 1, :3].astype(float) * 1.18 + 6, 0, 255)
        if depth < 2 and rng.rand() < branch * .15:
            crack(F, px, py, L * .45, rng, clip, ang + rng.choice([-50, 50]), branch, depth + 1)


def soot(F, mask, cx, cy, rx, ry, seed=0, k=.62):
    yy, xx = grids(F.w, F.h)
    n = lowfreq(F.w, F.h, 3, seed)
    d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 + (n - .5) * .9
    m = mask & (d < 1) & (F.a[..., 3] > 0)
    tint(F, m, FUL, k)
    m2 = mask & (d < .45) & (F.a[..., 3] > 0)
    tint(F, m2, FUL, .5)


def solid(F):
    return F.a[..., 3] > 0


def finish(F, gy, cx, rx, drop=(4, 3), ry=4):
    sol = solid(F)
    base = shadow_layer(cx, rx, ry, 100, F.w, F.h, gy)
    if drop:
        dm = _sh(_sh(sol, drop[0], 0), 0, drop[1]) & ~sol
        ds = np.zeros_like(F.a)
        ds[dm, :3] = (34, 22, 50)
        ds[dm, 3] = 80
        base = over(base, ds)
    out = over(base, F.a)
    out = over(out, F.fx)
    return out


# ---------------- escombros (destruída / brecha) ----------------

def piece(F, lv, x, y, rng, big=1.0):
    """um pedaço de escombro do material do nível."""
    a = rng.uniform(-40, 40)
    if lv == 1:
        k = rng.randint(0, 4)
        if k == 0:   # lona rasgada
            w, h = rng.uniform(8, 14) * big, rng.uniform(4, 7) * big
            pts = jag([(x - w, y), (x - w * .3, y - h), (x + w, y - h * .6), (x + w * .8, y + 1), (x - w, y)], 1.5, rng, 3)
            P(F, [pts], rng.choice([LONA, LONA2, LONAZ, REM]), tex=.2)
        elif k == 1:  # estaca quebrada
            L = rng.uniform(10, 18) * big
            P(F, limb(x - L / 2, y, x + L / 2, y - L * .3 * rng.uniform(-1, 1), 3), ESTACA)
        elif k == 2:  # chapa de sucata
            w, h = rng.uniform(7, 12) * big, rng.uniform(4, 7) * big
            sh = rot(R(x - w, y - h, x + w, y), x, y, a * .5)
            m = P(F, sh, SUC)
            yy, xx = grids(F.w, F.h)
            tint(F, m & ((xx % 3) == 0), '#4a4a48', .5)
            tint(F, m & (rnd(xx, yy, 3) < .3), FERR, .6)
        else:  # pneu
            P(F, ell(x, y - 3, 6 * big, 3.5 * big), PNEU, light=.15)
            F.flat(ell(x, y - 3, 2.5 * big, 1.4 * big), '#141216')
    elif lv == 2:
        L, w = rng.uniform(12, 22) * big, rng.uniform(3.5, 5)
        sh = rot([jag([(x - L / 2, y - w), (x + L / 2, y - w)], .8, rng, 3) + [(x + L / 2 + 1, y - w / 2)] +
                  jag([(x + L / 2, y), (x - L / 2, y)], .5, rng, 4) + [(x - L / 2 - 1.5, y - w / 2)]], x, y, a * .6)
        m = P(F, sh, rng.choice([TAB, TAB2, RIPA]))
        yy, xx = grids(F.w, F.h)
        tint(F, m & (rnd(np.floor(xx / 2), yy, 8) < .15), TABD, .5)
        if rng.rand() < .6:
            dot(F, x + rng.randint(-3, 4), y - w / 2, PREGO)
    elif lv == 3:
        k = rng.rand()
        if k < .75:
            w, h = rng.uniform(5, 9) * big, rng.uniform(4, 6.5) * big
            sh = rot(R(x - w, y - h, x + w, y), x, y, a * .3)
            m = P(F, sh, rng.choice([PED, PED2, '#848079']), tex=.18)
            mm = m & ~_sh(m, 0, 1)
            tint(F, mm, MOON, .2)
        else:
            sh = rot([[(x - 4, y), (x - 3, y - 3), (x + 3, y - 4), (x + 5, y)]], x, y, a)
            P(F, sh, rng.choice([TEL, TEL2]))
    elif lv == 4:
        k = rng.rand()
        if k < .6:
            w, h = 5 * big, 2.6 * big
            sh = rot(R(x - w, y - h, x + w, y), x, y, a * .5)
            P(F, sh, rng.choice([TIJ, TIJ2, TIJ]), ol='#4a1a10')
            if rng.rand() < .4:
                dot(F, x - 2, y - 1, REJ)
        elif k < .85:
            w, h = rng.uniform(9, 15) * big, rng.uniform(5, 8) * big
            sh = rot([[(x - w, y), (x - w * .8, y - h), (x + w * .6, y - h * 1.2), (x + w, y - 1)]], x, y, a * .4)
            m = P(F, sh, CHA)
            yy, xx = grids(F.w, F.h)
            tint(F, m & ((xx % 3) == 0), CHA2, .7)
            tint(F, m & (lowfreq(F.w, F.h, 4, int(x)) > .6), FERR, .6)
        else:
            P(F, limb(x - 8, y, x + 8, y - rng.uniform(-5, 5), 2), MET)
    else:
        k = rng.rand()
        if k < .7:
            w, h = rng.uniform(5, 9) * big, rng.uniform(4, 7) * big
            sh = rot(R(x - w, y - h, x + w, y), x, y, a * .3)
            m = P(F, sh, rng.choice([LPED, LPED2]), tex=.15)
            tint(F, m & ~_sh(m, 0, 1), OURO2, .5) if rng.rand() < .35 else None
            if rng.rand() < .3:
                dot(F, x, y - h / 2, RUNA)
                dot(F, x + 1, y - h / 2, RUNAB)
                glow(F, x, y - h / 2, 6, RUNA, alpha=80)
        else:
            sh = rot([[(x - 2, y), (x, y - 7 * big), (x + 2, y)]], x, y, a)
            P(F, sh, OURO, ol='#4a3208', light=.4)


def beam(F, x0, y0, x1, y1, w=4):
    m = P(F, limb(x0, y0, x1, y1, w), VIGA, light=.1, tex=.3)
    yy, xx = grids(F.w, F.h)
    em = m & (rnd(xx, yy, 21) < .05)
    F.a[em, :3] = H('#c8501a')
    em2 = m & ~_sh(m, 0, 1) & (rnd(xx, yy, 22) < .25)
    F.a[em2, :3] = H('#4a2e1e')


def rubble(F, lv, cx, gy, w, h, seed=0, beams=2, smk=2, n=None, mound=True):
    rng = np.random.RandomState(seed)
    dirt = {1: '#5e5040', 2: '#5a4632', 3: '#77726a', 4: '#7a4c3c', 5: '#2c2632'}[lv]
    dirt2 = {1: '#4a3e30', 2: '#45362a', 3: '#5e5a54', 4: '#5e3a2e', 5: '#1e1a24'}[lv]
    if mound:
        pts = [(cx - w / 2, gy + 1)]
        for i in range(1, 12):
            t = i / 12
            hh = h * math.sin(math.pi * t) ** .8 * rng.uniform(.75, 1.1)
            pts.append((cx - w / 2 + w * t, gy - hh))
        pts.append((cx + w / 2, gy + 1))
        m = F.mask([pts])
        C = T_noise(F, dirt, .3, seed, dirt2)
        yy, xx = grids(F.w, F.h)
        pebble = rnd(xx, yy, seed + 1) < .12
        C[pebble] = mix(C[pebble], MOON, .18)
        paint(F, m, C)
    n = n or int(w * h / 38)
    pos = []
    for i in range(n):
        t = rng.rand()
        x = cx - w / 2 + 6 + (w - 12) * t
        top = gy - h * math.sin(math.pi * t) ** .8
        y = rng.uniform(top + 3, gy + 1)
        pos.append((y, x))
    pos.sort()
    for (y, x) in pos[:n // 2]:
        piece(F, lv, x, y, rng)
    for b in range(beams):
        x0 = cx + rng.uniform(-w * .4, w * .1)
        y0 = gy - rng.uniform(0, h * .3)
        ang = rng.uniform(-150, -30)
        L = rng.uniform(h * .9, h * 1.5)
        beam(F, x0, y0, x0 + L * math.cos(math.radians(ang)), y0 + L * math.sin(math.radians(ang)), rng.uniform(3.5, 5))
    for (y, x) in pos[n // 2:]:
        piece(F, lv, x, y, rng)
    for e in range(6):
        ember_glow(F, cx + rng.uniform(-w / 2.5, w / 2.5), gy - rng.uniform(0, h * .7))
    for s in range(smk):
        smoke(F, cx + rng.uniform(-w / 3, w / 3), gy - h * .7 - 4, n=4, s=1.0 + .2 * s, drift=rng.uniform(1, 3),
              dark=True, red=(lv == 5), seed=seed + s)


def debris_cloud(F, cx, cy, w, seed=0):
    rng = np.random.RandomState(seed)
    for i in range(5):
        x = cx + rng.uniform(-w / 2, w / 2)
        y = cy + rng.uniform(-3, 3)
        r = rng.uniform(3, 6)
        lay = F.layer()
        P(F, ell(x, y, r * 1.3, r * .8) + ell(x + r, y + 1, r * .8, r * .6), '#9c8a70', ol='#4a3e30', layer=lay, light=.3)
        lay[..., 3] = (lay[..., 3].astype(float) * .75).astype(np.uint8)
        F.fx[:] = over(F.fx, lay)


# ================= MURO (face de muralha por nível) =================

def merlons(F, lv, x0, x1, top, face_m, step=32, mw=16, mh=10):
    """ameias: frente entra na face; topo claro por cima. Retorna máscara dos topos."""
    tops = np.zeros((F.h, F.w), bool)
    k0 = int(math.floor(x0 / step)) - 1
    for k in range(k0, int(x1 / step) + 2):
        xa = k * step + 8
        fm = rmask(F, max(xa, x0), top - mh, min(xa + mw - 1, x1), top)
        face_m |= fm
        tops |= rmask(F, max(xa, x0), top - mh - 4, min(xa + mw - 1, x1), top - mh - 1)
    return tops


def rune_glyph(F, x, y, k=0, layer=None, col=RUNA, hi=RUNAB, gl=True):
    G = [["01110", "10001", "10101", "10001", "01110", "00100", "00100"],
         ["10001", "01010", "00100", "01010", "10001", "00100", "01110"],
         ["00100", "01110", "10101", "00100", "10101", "01110", "00100"],
         ["11100", "10010", "11100", "10010", "10001", "00010", "00001"]][k % 4]
    for j, row in enumerate(G):
        for i, b in enumerate(row):
            if b == '1':
                F.px(x + i, y + j, hi if (i == 2 or j == 3) else col, layer)
    if gl:
        glow(F, x + 2, y + 3, 10, RUNAB, alpha=85)


def banner(F, x, y, w=14, h=30, col=RUNA, emblem=True):
    rng = np.random.RandomState(int(x) + 3)
    pts = [(x, y), (x + w, y)]
    n = 4
    for i in range(n + 1):
        pts.append((x + w - w * i / n, y + h - (5 if i % 2 else 0) + rng.uniform(-1, 1)))
    m = F.mask([pts])
    yy, xx = grids(F.w, F.h)
    C = C0(F, col)
    u = (xx - x) % 5
    C[u == 0] *= .76
    C[u == 1] = mix(C[u == 1], H('#e8606a'), .3)
    paint(F, m, C, light=.25)
    P(F, R(x - 2, y - 2, x + w + 2, y), OURO, ol='#4a3208', light=.4)
    if emblem:
        cx, cy = x + w / 2, y + 11
        P(F, ell(cx, cy, 4.5, 4.5), OURO, ol='#4a3208', light=.4)
        F.flat(ell(cx + 2, cy - 1, 3.6, 3.8), col)
    hline(F, x, x + w, y + h - 10, OURO2, clip=m)


def barbed(F, x0, x1, y, seed=0, vertical=False, y0=None, y1=None):
    """rolo de arame farpado (anéis sobrepostos)."""
    rng = np.random.RandomState(seed)
    yy, xx = grids(F.w, F.h)
    rings = []
    if not vertical:
        for x in range(int(x0) - 4, int(x1) + 5, 5):
            rings.append((x, y + rng.uniform(-.6, .6)))
    else:
        for yv in range(int(y0), int(y1), 4):
            rings.append((x0 + rng.uniform(-.6, .6), yv))
    def ringpts(cx, cy, front):
        out = []
        for i in range(40):
            a = 2 * math.pi * i / 40
            if (math.sin(a) > 0) != front:
                continue
            x = cx + 4.2 * math.cos(a) + 1.6 * math.sin(a)
            yv = cy + 5.0 * math.sin(a) if not vertical else cy + 3.0 * math.sin(a)
            if vertical:
                x = cx + 6 * math.cos(a)
            out.append((int(round(x)), int(round(yv))))
        return out
    for (cx, cy) in rings:
        for (x, yv) in ringpts(cx, cy, False):
            dot(F, x, yv, '#3e4248')
    for (cx, cy) in rings:
        for (x, yv) in ringpts(cx, cy, True):
            dot(F, x, yv + 1, '#1e2024')
        for (x, yv) in ringpts(cx, cy, True):
            dot(F, x, yv, '#b8bec4')
    for (cx, cy) in rings[::2]:
        for (dx, dy) in ((-4, 0), (4, 1)):
            dot(F, cx + dx, cy + dy - 1, '#e8ecf0')
            dot(F, cx + dx + 1, cy + dy, '#e8ecf0')
            dot(F, cx + dx - 1, cy + dy, '#5a5e64')


def muro(F, lv, x0, x1, gy, seed=0, deco=True):
    """desenha a muralha do nível entre x0..x1 (coordenadas de mundo = do quadro). Retorna dict."""
    Hh, T = WH[lv], WT[lv]
    top = gy - Hh
    clipx = rmask(F, x0, 0, x1, F.h)
    yy, xx = grids(F.w, F.h)
    info = {'top': top, 'ttop': top - T}
    face = np.zeros((F.h, F.w), bool)
    if lv == 1:
        posts = list(range(int(math.floor(x0 / 32)) * 32 + 6 - 32, int(x1) + 40, 32))
        for p in posts:
            q = p % 128
            typ = (q // 32) % 4
            xa, xb = p, p + 32
            ya = top + 3 + rn(q, 1) * 5
            yb = top + 3 + rn((q + 32) % 128, 1) * 5
            if typ == 0:     # chapa de sucata ondulada
                pts = jag([(xa - 1, ya + 2), (xb + 1, yb + 1)], 1.5, np.random.RandomState(q), 4)
                m = F.mask([pts + [(xb + 1, gy - 1), (xa - 1, gy - 1)]]) & clipx
                C = T_corr(F, 0, (SUC, '#55544f'), seed=q, rust=.5)
                paint(F, m, C)
                rivets(F, xa + 3, xb - 3, int(ya + 5), 7, '#9a9890', clip=m)
            elif typ == 1:   # lona verde esticada com remendo
                pts = sag_pts(xa, ya, xb, yb, 4)
                m = F.mask([pts + [(xb, gy - 3), (xa + 16, gy - 1), (xa, gy - 3)]]) & clipx
                C = T_canvas(F, 0, seed=q)
                pm = rmask(F, xa + 8, top + 18, xa + 19, top + 28)
                C[pm] = H(REM) * (.95 + .08 * rnd(xx, yy, 2))[pm][..., None]
                paint(F, m, C)
                for xs in range(xa + 8, xa + 20, 2):
                    dot(F, xs, top + 17, '#d8c89a')
                    dot(F, xs, top + 29, '#d8c89a')
                for ys in range(top + 18, top + 29, 2):
                    dot(F, xa + 7, ys, '#d8c89a')
                    dot(F, xa + 20, ys, '#d8c89a')
            elif typ == 2:   # porta velha de lata com X vermelho de sobrevivente
                m = F.mask([[(xa, ya - 2), (xb, yb), (xb, gy - 1), (xa, gy - 1)]]) & clipx
                C = T_noise(F, '#8a8a80', .2, q, '#6a6a62')
                rm = lowfreq(F.w, F.h, 5, q) > .58
                C[rm] = mix(C[rm], H(FERR), .7)
                paint(F, m, C)
                cx_, cy_ = xa + 16, top + 22
                for d in range(-6, 7):
                    for w_ in (0, 1):
                        for X, Y in ((cx_ + d + w_, cy_ + d), (cx_ - d + w_, cy_ + d)):
                            if 0 <= X < F.w and 0 <= Y < F.h and m[Y, X]:
                                F.px(X, Y, '#a8302a')
                hline(F, xa + 3, xa + 8, gy - 22, '#c9c3b0', clip=m)
            else:            # lona azul caída
                pts = sag_pts(xa, ya + 2, xb, yb + 2, 7)
                m = F.mask([pts + [(xb, gy - 6), (xa + 20, gy - 2), (xa + 6, gy - 8), (xa, gy - 5)]]) & clipx
                C = T_canvas(F, 0, (LONAZ, '#2f5270'), seed=q, fold=7)
                paint(F, m, C)
            face |= m
        if deco:
            for p in posts:
                if p % 128 == 70:
                    for (dx, dy) in ((6, 0), (17, 0), (11, -6)):
                        m = P(F, ell(p + dx, gy - 3 + dy, 6, 4), PNEU, light=.18, clip=clipx)
                        F.flat(ell(p + dx, gy - 3 + dy, 2.6, 1.6), '#141216', clip=clipx)
                        face |= m
        for p in posts:
            q = p % 128
            lean = (rn(q, 3) - .5) * 7
            m = P(F, limb(p, gy + 1, p + lean, top - 2, 5, 4), ESTACA, tex=.3, clip=clipx)
            P(F, poly((p + lean - 2.4, top - 1), (p + lean + 2.4, top - 1), (p + lean + .3, top - 8)), '#a8865a', clip=clipx)
            face |= m
        for p in posts:
            q = p % 128
            l0 = (rn(q, 3) - .5) * 7
            l1 = (rn((q + 32) % 128, 3) - .5) * 7
            for yr, sg in ((top + 6, 3), (gy - 20, 2)):
                f = (gy - yr) / Hh
                pts = sag_pts(p + l0 * f + 1, yr, p + 32 + l1 * f - 1, yr, sg)
                lay = F.layer()
                P(F, chain(pts, 1.5), CORDA, layer=lay, light=.3)
                lay[~clipx] = 0
                F.a[:] = over(F.a, lay)
                for X in (p + l0 * f, p + 32 + l1 * f):
                    if x0 <= X <= x1:
                        hline(F, X - 2, X + 2, yr - 1, CORDA)
                        hline(F, X - 2, X + 2, yr + 1, '#7a6440')
    elif lv == 2:
        for k in range(int(math.floor(x0 / 8)) - 1, int(math.ceil(x1 / 8)) + 1):
            xa = k * 8
            q = k % 16
            hj = int(rn(q, 2, 3) * 6)
            yt = top - hj
            pts = [(xa, gy + 1), (xa, yt + 6), (xa + 4, yt), (xa + 8, yt + 6), (xa + 8, gy + 1)]
            m = F.mask([pts]) & clipx
            u = xx - xa
            C = C0(F, mix(H(TAB), H(TAB2), rn(q, 5)))
            lm = (u >= 1) & (u <= 2)
            C[lm] = mix(C[lm], MOON, .14)
            C[u >= 6] *= .8
            bark = rnd(np.floor(xx), np.floor(yy / 4) + q, 7) < .14
            C[bark] *= .78
            tipm = yy < yt + 6
            C[tipm] = mix(H('#c8a070'), H('#a88050'), np.clip(u[tipm] / 8, 0, 1)[..., None])
            ring = (yy > yt + 5) & (yy < yt + 7)
            C[ring] = H(TABD)
            paint(F, m, C, light=.18)
            face |= m
        for by in (top + 9, gy - 17):
            bm = rmask(F, x0, by, x1, by + 5)
            C = T_planks(F, 0, pw=6, cols=(RIPA, TAB2), horiz=True, y0=by, seed=by)
            sh_ = rmask(F, x0, by + 6, x1, by + 7) & face
            darken(F, sh_, .65)
            paint(F, bm, C, light=.2)
            for k in range(int(math.floor(x0 / 8)), int(math.ceil(x1 / 8)) + 1):
                if x0 <= k * 8 + 4 <= x1:
                    dot(F, k * 8 + 4, by + 2, PREGO)
                    dot(F, k * 8 + 5, by + 3, TABD)
            face |= bm
        if deco:
            for k in range(int(math.floor(x0 / 128)), int(math.ceil(x1 / 128)) + 1):
                bx = k * 128 + 84
                for (dx, dy) in ((0, 0), (1, 1), (2, 1), (1, 2), (-1, 3), (3, 2), (2, 4), (0, 5), (2, 7), (1, 9)):
                    if x0 <= bx + dx <= x1:
                        dot(F, bx + dx, gy - 32 + dy, SANG)
                for j in range(3):
                    for t in range(6):
                        X = bx - 40 + j * 3 + t // 2
                        if x0 <= X <= x1:
                            dot(F, X, gy - 28 + t, '#3a2414')
    elif lv in (3, 5):
        stone = (PED, PED2) if lv == 3 else (LPED, LPED2)
        mort = ARG if lv == 3 else ARD
        ch, bmin, bmax = (8, 10, 18) if lv == 3 else (10, 14, 24)
        wk = rmask(F, x0, top - T, x1, top - 1)
        if lv == 3:
            Cw = T_stone(F, 0, top - T, ch=T, bmin=14, bmax=24, cols=('#a8a49c', '#96928a'), mortar='#6e6a64', seed=seed + 5)
        else:
            Cw = T_slate(F, 0, top - T, seed=seed + 5)
        paint(F, wk, Cw, light=.12)
        face = rmask(F, x0, top, x1, gy)
        tops = merlons(F, lv, x0, x1, top, face)
        C = T_stone(F, 0, top - 20, ch=ch, bmin=bmin, bmax=bmax, cols=stone, mortar=mort, seed=seed + lv)
        if lv == 3:
            ft = rmask(F, x0, gy - 6, x1, gy)
            Cf = T_stone(F, 0, gy - 6, ch=7, bmin=16, bmax=26, cols=('#77736e', '#66625e'), mortar='#a29a8c', seed=seed + 8)
            C[ft] = Cf[ft]
            lf = lowfreq(F.w, F.h, 8, seed + 2)
            mm = (lf > .62) & (yy > gy - 16) & (rnd(xx, yy, 4) < .6)
            C[mm] = mix(C[mm], H('#4e5a34'), .5)
            dm = (yy > gy - 4) & (rnd(xx, yy, 5) < .4)
            C[dm] = mix(C[dm], H('#4a3e30'), .4)
        paint(F, face & clipx, C, light=.2)
        Ct = T_noise(F, '#b6b2aa' if lv == 3 else LPED2, .15, seed + 9)
        paint(F, tops & clipx, Ct, light=.3)
        if lv == 5:
            for (ya, yb_, c1) in ((top + 1, top + 3, OURO), (gy - 5, gy - 1, OURO2)):
                gm = rmask(F, x0, ya, x1, yb_)
                Cg = C0(F, c1)
                Cg[yy == ya] = mix(H(OURO), MOON, .3)
                Cg[(xx % 16 == 0)] = H('#7a5a12')
                paint(F, gm, Cg, light=.3, ol='#3a2808')
            hline(F, x0, x1, top - T, OURO2)
            k0 = int(math.floor(x0 / 32)) - 1
            for k in range(k0, int(x1 / 32) + 2):
                xa = k * 32 + 8
                cx = xa + 8
                P(F, R(xa, top - 15, xa + 15, top - 14), OURO, ol='#3a2808', clip=clipx)
                P(F, poly((cx - 3.5, top - 14), (cx + 3.5, top - 14), (cx, top - 24)), OURO, ol='#4a3208', light=.45, clip=clipx)
                P(F, poly((xa + 1, top - 14), (xa + 4, top - 14), (xa + 1.5, top - 19)), OURO2, ol='#4a3208', clip=clipx)
                P(F, poly((xa + 11, top - 14), (xa + 14, top - 14), (xa + 13.5, top - 19)), OURO2, ol='#4a3208', clip=clipx)
            if deco:
                for k in range(int(math.floor(x0 / 128)), int(math.ceil(x1 / 128)) + 1):
                    for (rx, gk) in ((26, 0), (100, 2)):
                        X = k * 128 + rx
                        if x0 + 2 <= X <= x1 - 6:
                            rune_glyph(F, X, top + 22, gk)
                    X = k * 128 + 57
                    if x0 <= X and X + 14 <= x1:
                        banner(F, X, top + 6, 14, 34)
        elif deco:
            for k in range(int(math.floor(x0 / 128)), int(math.ceil(x1 / 128)) + 1):
                X = k * 128 + 96
                if x0 <= X - 2 and X + 2 <= x1:      # seteira
                    P(F, R(X - 1, top + 14, X + 1, top + 26), '#18141a', outline=False, shade=False)
                    hline(F, X - 2, X + 2, top + 13, '#a8a49c')
                    hline(F, X - 2, X + 2, top + 27, '#a8a49c')
                X = k * 128 + 30                     # trepadeira
                rng = np.random.RandomState(7)
                for i in range(46):
                    px_ = X + rng.randint(-7, 8)
                    py_ = gy - rng.randint(2, 38) if rng.rand() < .6 else gy - rng.randint(2, 14)
                    if x0 <= px_ <= x1:
                        dot(F, px_, py_, rng.choice(['#4e6a34', '#3a5226', '#6a8a44']))
    elif lv == 4:
        wk = rmask(F, x0, top - T, x1, top - 1)
        Cw = T_corr(F, 0, ('#9aa2a8', '#7d848c'), seed=seed + 3, rust=.72, horiz=True, y0=top - T)
        paint(F, wk, Cw, light=.15)
        face = rmask(F, x0, top, x1, gy)
        C = T_brick(F, 0, top, seed=seed + 4)
        lf = lowfreq(F.w, F.h, 8, seed + 6)
        dm = (yy > gy - 8) & (rnd(xx, yy, 5) < .35 + .3 * lf)
        C[dm] = mix(C[dm], H('#4a3a30'), .35)
        paint(F, face, C, light=.2)
        rivets(F, x0 + 2, x1, top - T + 2, 8, REB, clip=wk)
        for by in (top + 1, top + 26, gy - 12):
            bm = rmask(F, x0, by, x1, by + 3)
            Cb = C0(F, MET)
            Cb[yy == by] = mix(H(MET), MOON, .3)
            Cb[yy == by + 3] = H(MET) * .7
            Cb[(xx % 32) == 0] = H('#5a6068')
            paint(F, bm, Cb, light=.25, ol='#2a2e34')
            rivets(F, x0 + 4, x1, by + 1, 8, clip=bm)
            for x in range(int(x0) + 4, int(x1), 16):
                L = 2 + int(rn(x % 128, by) * 6)
                for d in range(L):
                    Y = by + 5 + d
                    if 0 <= Y < F.h and 0 <= x < F.w and face[Y, x]:
                        F.a[Y, x, :3] = np.clip(mix(F.a[Y, x, :3].astype(float), H(FERR), .6 - d * .08), 0, 255)
        for k in range(int(math.floor(x0 / 32)) - 1, int(x1 / 32) + 2):
            p = k * 32 + 16
            if x0 <= p <= x1:
                P(F, R(p - 1, top - T - 14, p, top - T + 3), '#5a6068')
                vline(F, p - 1, top - T - 13, top - T + 2, '#8a9098')
        keep = F.a.copy()
        barbed(F, x0, x1, top - T - 6, seed)
        F.a[~clipx] = keep[~clipx]
        if deco:
            for k in range(int(math.floor(x0 / 128)), int(math.ceil(x1 / 128)) + 1):
                X = k * 128 + 64
                if x0 <= X - 4 and X + 8 <= x1:
                    P(F, R(X - 1, top - 26, X + 1, top - 1), '#4a5058')
                    P(F, R(X - 1, top - 27, X + 7, top - 26), '#4a5058')
                    lamp(F, X + 7, top - 21, r=26)
                X = k * 128 + 98
                if x0 <= X - 5 and X + 5 <= x1:   # placa de perigo
                    P(F, R(X - 5, top + 9, X + 5, top + 19), '#e0b52a', ol='#2a2008')
                    P(F, poly((X + .5, top + 10.5), (X + 4.5, top + 18), (X - 3.5, top + 18)), '#1a1612', shade=False, outline=False)
                    for yv in (13, 14, 16):
                        F.px(X, top + yv, '#e0b52a')
                X = k * 128 + 22
                if x0 <= X - 2 and X + 3 <= x1:   # cano
                    P(F, R(X - 1, top + 4, X + 2, gy - 1), '#6b747a')
                    for yc in (top + 14, top + 36, gy - 8):
                        P(F, R(X - 2, yc, X + 3, yc + 1), '#4a5058')
    info['face'] = face & clipx
    return info


def wall_damage(F, lv, info, x0, x1, gy, seed=0, fire=True, notch=True):
    rng = np.random.RandomState(seed)
    face = info['face']
    top = info['top']
    clip = solid(F)
    for i in range(3):
        x = x0 + 12 + (x1 - x0 - 24) * (i + rng.uniform(.1, .9)) / 3
        crack(F, x, top + rng.uniform(1, 8), rng.uniform(22, 38), rng, clip & face, 90 + rng.uniform(-25, 25), .9)
    crack(F, rng.uniform(x0 + 10, x1 - 10), gy - 2, 16, rng, clip & face, -90, .9)
    soot(F, face, rng.uniform(x0 + 20, x1 - 20), top + 16, 18, 14, seed)
    if notch:
        nx = rng.uniform(x0 + 24, x1 - 34)
        pts = jag([(nx, info['ttop'] - 30), (nx + 2, top + 6), (nx + 9, top + 13), (nx + 16, top + 4), (nx + 20, info['ttop'] - 30)], 1.6, rng, 3)
        K = F.mask([pts])
        cut(F, K)
        piece(F, lv, nx + 10, gy + 3, rng, 1.1)
        piece(F, lv, nx + 24, gy + 4, rng, .8)
    if fire:
        fx = rng.uniform(x0 + 20, x1 - 20)
        flame(F, fx, gy - 1, .9, red=(lv == 5))
        smoke(F, fx + 2, gy - 16, 4, 1.0, 2.0, seed=seed)
    else:
        smoke(F, rng.uniform(x0 + 30, x1 - 30), top - 4, 3, .8, 1.5, seed=seed)


def finish_wall(F, gy):
    sol = solid(F)
    base = np.zeros_like(F.a)
    band = np.zeros((F.h, F.w), bool)
    band[gy + 1:gy + 4] = True
    band &= _sh(sol, 0, 3) | _sh(sol, 0, 2) | _sh(sol, 0, 1)
    base[band & ~sol, :3] = (34, 22, 50)
    base[band & ~sol, 3] = 100
    dm = _sh(_sh(sol, 4, 0), 0, 3) & ~sol
    ds = np.zeros_like(F.a)
    ds[dm, :3] = (34, 22, 50)
    ds[dm, 3] = 80
    base = over(base, ds)
    out = over(base, F.a)
    return over(out, F.fx)


# ---------------- teste rápido ----------------
def _prev(name, img, k=2):
    im = img if isinstance(img, Image.Image) else Image.fromarray(img, 'RGBA')
    bg = Image.new('RGBA', im.size, (70, 78, 60, 255))
    bg.alpha_composite(im)
    bg.resize((im.width * k, im.height * k), Image.NEAREST).save(os.path.join(HERE, '_prev_%s.png' % name))


# ================= PILAR (portão / canto da muralha) =================

def drum(F, x0, x1, yb, h, col, seed=0):
    yy, xx = grids(F.w, F.h)
    w = x1 - x0
    cx = (x0 + x1) / 2
    body = F.mask([[(x0, yb - h + 3), (x1, yb - h + 3), (x1, yb), (x0, yb)]]) | F.mask(ell(cx, yb, w / 2, 2.5))
    C = C0(F, col)
    u = (xx - x0) / max(1, w)
    C[u < .25] = mix(C[u < .25], MOON, .14)
    C[u > .75] *= .8
    for ry in (yb - h * .33, yb - h * .66):
        rm = (np.abs(yy - ry) < 1)
        C[rm] = mix(C[rm], MOON, .22)
        C[(np.abs(yy - ry - 1) < .6)] *= .7
    rr = lowfreq(F.w, F.h, 4, seed) > .6
    C[rr] = mix(C[rr], H(FERR), .7)
    paint(F, body, C)
    P(F, ell(cx, yb - h + 3, w / 2, 3), mix(H(col), MOON, .2), light=.2)
    F.flat(ell(cx, yb - h + 3, w / 2 - 2, 1.6), mix(H(col), INK, .5))
    dot(F, cx + w / 4, yb - h + 3, '#c9c3b0')
    return body


def pilar(F, lv, xc, w, gy, h, seed=0):
    yy, xx = grids(F.w, F.h)
    x0, x1 = int(xc - w / 2), int(xc + w / 2)
    top = gy - h
    rng = np.random.RandomState(seed)
    if lv == 1:
        drum(F, x0 + 1, x1 - 1, gy, 30, '#5f6e5c', seed)
        drum(F, x0 + 2, x1 - 2, gy - 30, 28, '#3f5a7a', seed + 1)
        P(F, ell(xc, top + 6, w / 2 + 1, 4.5), PNEU, light=.15)
        F.flat(ell(xc, top + 5, w / 2 - 5, 2), '#141216')
        for yr in (gy - 18, gy - 44):
            P(F, chain(sag_pts(x0, yr, x1, yr + 2, 1.5), 1.6), CORDA, light=.3)
        P(F, R(x0 + 4, gy - 52, x0 + 11, gy - 46), '#c9c3b0', ol='#3a3a36')
        F.flat(R(x0 + 6, gy - 50, x0 + 9, gy - 49), '#a8302a')
        return rmask(F, x0, top, x1, gy)
    if lv == 2:
        for (a, b, s) in ((x0, xc, 0), (xc, x1, 1)):
            yt = top - 4 * s
            m = F.mask([[(a, gy + 1), (a, yt + 7), ((a + b) / 2, yt), (b, yt + 7), (b, gy + 1)]])
            u = xx - a
            ww = b - a
            C = C0(F, mix(H(TAB), H(TAB2), .3 + .4 * s))
            C[u < ww * .25] = mix(C[u < ww * .25], MOON, .14)
            C[u > ww * .75] *= .8
            bark = rnd(np.floor(xx / 2), np.floor(yy / 3), 7 + s) < .16
            C[bark] *= .78
            tipm = yy < yt + 7
            C[tipm] = mix(H('#c8a070'), H('#a88050'), np.clip(u[tipm] / ww, 0, 1)[..., None])
            paint(F, m, C, light=.18)
            for kk in range(3):
                dot(F, (a + b) / 2 + rng.randint(-3, 3), yt + 16 + kk * 13, TABD)
        for yr in (top + 14, gy - 22):
            P(F, R(x0 - 1, yr, x1 + 1, yr + 3), CORDA, light=.3)
            for xr in range(x0, x1 + 1, 3):
                dot(F, xr, yr + 1, '#7a6440')
        return rmask(F, x0, top, x1, gy)
    if lv == 3:
        m = rmask(F, x0, top + 6, x1, gy)
        C = T_stone(F, x0 + 3, top, ch=9, bmin=9, bmax=15, period=999, seed=seed + 31)
        paint(F, m, C, light=.22)
        P(F, R(x0 - 3, gy - 6, x1 + 3, gy), '#77736e', tex=.2)
        P(F, R(x0 - 3, top + 3, x1 + 3, top + 7), '#9a968e', tex=.2)
        P(F, R(x0 - 3, top - 1, x1 + 3, top + 2), '#b6b2aa', tex=.2)
        P(F, R(x0 + 2, top - 6, x1 - 2, top - 1), '#a8a49c', tex=.2)
        return m
    if lv == 4:
        m = rmask(F, x0, top + 6, x1, gy)
        C = T_brick(F, x0, top, period=999, seed=seed + 2)
        paint(F, m, C, light=.22)
        for (a, b) in ((x0 - 1, x0 + 2), (x1 - 2, x1 + 1)):
            mm = P(F, R(a, top + 6, b, gy), MET, ol='#2a2e34')
            for yr in range(top + 10, gy, 7):
                dot(F, (a + b) // 2, yr, REB)
        for by in (top + 22, gy - 14):
            P(F, R(x0, by, x1, by + 3), MET, ol='#2a2e34')
            rivets(F, x0 + 3, x1 - 2, by + 1, 6)
        P(F, R(x0 - 3, top + 1, x1 + 3, top + 6), '#9aa2a8', ol='#2a2e34', tex=.1)
        rivets(F, x0 - 1, x1 + 2, top + 3, 5)
        P(F, R(xc - 1, top - 8, xc + 1, top + 1), '#4a5058')
        lamp(F, xc, top - 11, r=28)
        return m
    # lv 5
    m = rmask(F, x0, top + 8, x1, gy)
    C = T_stone(F, x0 + 4, top, ch=10, bmin=10, bmax=16, cols=(LPED, LPED2), mortar=ARD, period=999, seed=seed + 51)
    paint(F, m, C, light=.2)
    for (ya, yb) in ((gy - 6, gy - 1), (top + 22, top + 24)):
        P(F, R(x0 - 1, ya, x1 + 1, yb), OURO2, ol='#3a2808', light=.35)
        hline(F, x0, x1, ya, OURO)
    P(F, R(x0 - 4, top + 3, x1 + 4, top + 8), OURO, ol='#3a2808', light=.4)
    hline(F, x0 - 3, x1 + 3, top + 7, OURO2)
    P(F, R(x0 - 1, top - 1, x1 + 1, top + 3), LPED2, tex=.2)
    rune_glyph(F, int(xc) - 2, gy - 40, seed % 4)
    rune_glyph(F, int(xc) - 2, gy - 40 + 0, seed % 4, gl=False)
    # braseiro
    P(F, poly((xc - 9, top - 7), (xc + 9, top - 7), (xc + 6, top), (xc - 6, top)), OURO2, ol='#3a2808', light=.4)
    hline(F, xc - 8, xc + 8, top - 7, OURO)
    P(F, R(xc - 2, top - 1, xc + 2, top + 1), OURO2)
    flame(F, xc, top - 7, 1.4, red=True)
    return m


# ================= FOLHA DO PORTÃO =================

def leaf_img(lv, W, Hh, side, seed=0, hole=False):
    """desenha uma folha do portão em quadro local (W+4 x Hh+4). side: -1 esquerda, +1 direita."""
    F = Frame(W + 4, Hh + 4)
    yy, xx = grids(F.w, F.h)
    x0, y0, x1, y1 = 2, 2, W + 1, Hh + 1
    inner = x1 if side < 0 else x0
    rng = np.random.RandomState(seed)
    if lv == 1:
        m = rmask(F, x0, y0 + 4, x1, y0 + Hh * .5)
        paint(F, m, T_corr(F, 0, (SUC, '#55544f'), seed=seed, rust=.48))
        m2 = rmask(F, x0, y0 + Hh * .5, x1, y1 - 2)
        C = T_canvas(F, 0, seed=seed + 3)
        pm = rmask(F, x0 + 10, y0 + Hh * .6, x0 + 24, y0 + Hh * .6 + 9)
        C[pm] = H(REM)
        paint(F, m2, C)
        for (a, b, c, d) in ((x0 + 1, y0 + 2, x0 + 1, y1), (x1 - 1, y0 + 2, x1 - 1, y1), (x0, y0 + 4, x1, y0 + 5),
                             (x0, y1 - 2, x1, y1 - 3), (x0 + 2, y1 - 3, x1 - 2, y0 + 6)):
            P(F, limb(a, b, c, d, 3.5), ESTACA, tex=.3)
        for yr in (y0 + 8, y1 - 8):
            P(F, R(inner - 2 * side - 2, yr, inner - 2 * side + 2, yr + 3), CORDA)
        hub = (x0 + x1) / 2 + 6 * side
        P(F, ell(hub, y0 + 18, 5, 5), '#a8aeb4', light=.4)
        F.flat(ell(hub, y0 + 18, 2, 2), '#5a5e64')
    elif lv == 2:
        m = rmask(F, x0, y0, x1, y1)
        tops = [y0 + int(rn(i, 4) * 3) for i in range(20)]
        mt = np.zeros_like(m)
        for i in range(0, W // 7 + 1):
            mt |= rmask(F, x0 + i * 7, tops[i], x0 + i * 7 + 6, y1)
        m = mt & rmask(F, x0, 0, x1, y1)
        paint(F, m, T_planks(F, x0, 7, seed=seed))
        for by in (y0 + 8, y1 - 12):
            P(F, R(x0, by, x1, by + 5), RIPA, tex=.25)
            nails(F, x0 + 3, x1 - 2, by + 2, 7)
        P(F, limb(x0 + 3, y1 - 9, x1 - 3, y0 + 14, 5) if side < 0 else limb(x1 - 3, y1 - 9, x0 + 3, y0 + 14, 5), RIPA, tex=.25)
        for yr in (y0 + 10, y1 - 10):
            P(F, R(inner - 6 * side - 4, yr - 1, inner - 6 * side + 4, yr + 2) if False else R(min(inner, inner - 10 * side), yr - 1, max(inner, inner - 10 * side), yr + 1), FERRO)
    elif lv == 3:
        m = rmask(F, x0, y0, x1, y1)
        paint(F, m, T_planks(F, x0, 6, cols=(TAB2, '#6a4628'), seed=seed))
        for by in (y0 + 6, (y0 + y1) // 2, y1 - 9):
            P(F, R(x0, by, x1, by + 3), FERRO, ol='#0e0c0c', light=.3)
            for xr in range(x0 + 3, x1, 6):
                dot(F, xr, by + 1, '#8a8480')
                dot(F, xr, by + 2, '#141212')
        hx = inner - 9 * side
        P(F, ell(hx, (y0 + y1) / 2 + 10, 3.5, 3.5), FERRO, ol='#0e0c0c')
        F.flat(ell(hx, (y0 + y1) / 2 + 10, 1.8, 1.8), TAB2)
    elif lv == 4:
        m = rmask(F, x0, y0, x1, y1)
        paint(F, m, T_corr(F, 0, seed=seed, rust=.66))
        for (a, b, c, d) in ((x0, y0, x1, y0 + 3), (x0, y1 - 3, x1, y1), (x0, y0, x0 + 3, y1), (x1 - 3, y0, x1, y1),
                             (x0, (y0 + y1) // 2 - 1, x1, (y0 + y1) // 2 + 2)):
            P(F, R(a, b, c, d), MET, ol='#2a2e34', light=.3)
        for yr in (y0 + 1, (y0 + y1) // 2, y1 - 2):
            rivets(F, x0 + 3, x1 - 3, yr, 6)
        hz = rmask(F, x0 + 4, y1 - 11, x1 - 4, y1 - 4)
        C = C0(F, '#e0b52a')
        C[((xx + yy) // 4) % 2 == 0] = H('#1e1a16')
        paint(F, hz, C, light=.15, ol='#1e1a16')
        P(F, limb(x0 + 4, y1 - 13, x1 - 4, y0 + 5, 3) if side > 0 else limb(x1 - 4, y1 - 13, x0 + 4, y0 + 5, 3), MET, ol='#2a2e34')
    else:
        m = rmask(F, x0, y0, x1, y1)
        C = T_noise(F, '#2a2430', .18, seed, '#36303e')
        u = (xx - x0) % 12
        C[u == 0] = H(ARD)
        C[u == 1] = mix(C[u == 1], H(LPED2), .5)
        paint(F, m, C)
        for (a, b, c, d) in ((x0, y0, x1, y0 + 3), (x0, y1 - 3, x1, y1), (x0, y0, x0 + 2, y1), (x1 - 2, y0, x1, y1),
                             (x0, y0 + 14, x1, y0 + 15), (x0, y1 - 15, x1, y1 - 14)):
            P(F, R(a, b, c, d), OURO2, ol='#2a1a08', light=.45)
        for xr in range(x0 + 4, x1 - 2, 6):
            dot(F, xr, y0 + 1, '#fff0a0')
            dot(F, xr, y1 - 2, '#fff0a0')
        cy = (y0 + y1) / 2
        moon = F.mask(ell(inner, cy, 15, 15)) & rmask(F, x0 + 3, y0 + 4, x1 - 3, y1 - 4)
        F.a[moon & ~F.mask(ell(inner, cy, 13, 13)), :3] = H(OURO)
        inside = moon & F.mask(ell(inner, cy, 13, 13))
        Cm = C0(F, RUNA)
        Cm[rnd(xx, yy, 3) < .2] = H(RUNAB)
        F.a[inside, :3] = Cm[inside]
        sp = []
        for k in range(6):
            a = -math.pi / 2 + k * math.pi / 5 * (-side)
            sp.append(((inner + 18 * math.cos(a) * -side), cy + 18 * math.sin(a)))
        for (sx, sy) in sp:
            if x0 + 3 < sx < x1 - 3:
                P(F, poly((sx - 1.5, sy), (sx + 1.5, sy), (sx, sy - 4)), OURO, ol='#3a2808')
        rune_glyph(F, int((x0 + x1) / 2 - 2 + 10 * side * -1), int(y0 + 4), seed % 4, gl=False)
    if hole:
        K = F.mask([jag([(x0 + W * .3, y0 + Hh * .35), (x0 + W * .55, y0 + Hh * .28), (x0 + W * .7, y0 + Hh * .5),
                         (x0 + W * .5, y0 + Hh * .66), (x0 + W * .3, y0 + Hh * .55), (x0 + W * .3, y0 + Hh * .35)], 2.2, rng, 3)])
        cut(F, K)
        F.a[K, :3] = (20, 14, 22)
        F.a[K, 3] = 255
        crack(F, x0 + W * .5, y0 + Hh * .6, 12, rng, solid(F) & ~K, 70)
    return F


def paste(F, src, ox, oy, alpha=1.0):
    h, w = src.shape[:2]
    lay = F.layer()
    xa, ya = max(0, ox), max(0, oy)
    xb, yb = min(F.w, ox + w), min(F.h, oy + h)
    if xa >= xb or ya >= yb:
        return
    lay[ya:yb, xa:xb] = src[ya - oy:yb - oy, xa - ox:xb - ox]
    if alpha < 1:
        lay[..., 3] = (lay[..., 3] * alpha).astype(np.uint8)
    F.a[:] = over(F.a, lay)


def warp(F, src, hx, hy, dirx, sx, skew, shade=.8):
    """cola a folha 'aberta': x comprimido (sx), cisalhada para cima (skew px por px)."""
    h, w = src.shape[:2]
    lay = F.layer()
    span = int(w * sx) + 2
    for X in range(span):
        u = X / sx
        ui = int(u) if dirx > 0 else int(w - 1 - u)
        if not 0 <= ui < w:
            continue
        tx = hx + X * dirx
        dy = -int(round(X * skew))
        for v in range(h):
            ty = hy + v + dy
            if 0 <= tx < F.w and 0 <= ty < F.h and src[v, ui, 3]:
                lay[ty, tx] = src[v, ui]
    m = lay[..., 3] > 0
    lay[m, :3] = (lay[m, :3] * shade).astype(np.uint8)
    o = dilate(m) & ~m
    lay[o, :3] = (20, 14, 18)
    lay[o, 3] = 255
    F.a[:] = over(F.a, lay)


def rotimg(src, ang, cx, cy):
    im = Image.fromarray(src, 'RGBA').rotate(ang, resample=Image.NEAREST, center=(cx, cy), expand=False)
    return np.array(im)


# ================= PORTÃO =================

def portao(lv, state):
    """state: 'aberto', 'fechado', 'danificado'."""
    F = Frame(256, 192)
    gy = 180
    Hh = WH[lv]
    seed = lv * 17 + {'aberto': 0, 'fechado': 1, 'danificado': 2}[state]
    rng = np.random.RandomState(seed)
    yy, xx = grids(F.w, F.h)
    pw = 32
    pl, pr = 38, 218
    gx0, gx1 = pl + pw // 2 + 1, pr - pw // 2 - 1
    ph = Hh + 14
    # trilha de terra no vão
    tm = F.mask([[(gx0 + 6, gy - 7), (gx1 - 6, gy - 7), (gx1 + 4, gy + 6), (gx0 - 4, gy + 6)]])
    C = T_noise(F, TERRA, .3, seed, '#54442f')
    rut = (np.abs(xx - 104) < 2) | (np.abs(xx - 152) < 2)
    C[rut & tm] *= .8
    lay = F.layer()
    paint(F, tm, C, outline=False, light=0, dark=.1, layer=lay)
    lay[..., 3] = (lay[..., 3] * .8).astype(np.uint8)
    F.a[:] = over(F.a, lay)
    for i in range(14):
        dot(F, rng.uniform(gx0, gx1), rng.uniform(gy - 6, gy + 5), rng.choice(['#8a7458', '#4a3a28', '#9a8a70']))
    # tocos de muralha
    li = muro(F, lv, -3, pl - pw // 2 + 2, gy, seed=lv, deco=False)
    ri = muro(F, lv, pr + pw // 2 - 2, 259, gy, seed=lv, deco=False)
    LW = (gx1 - gx0 + 1) // 2
    LH = Hh - (4 if lv < 3 else 8)
    ly = gy - LH
    if lv >= 3:
        P(F, R(gx0 - 2, gy - 3, gx1 + 2, gy + 1), '#77736e' if lv == 3 else ('#6b747a' if lv == 4 else LPED), tex=.25)
        if lv == 5:
            hline(F, gx0, gx1, gy - 3, OURO2)
    if state == 'aberto':
        L = leaf_img(lv, LW, LH, -1, seed)
        Rr = leaf_img(lv, LW, LH, +1, seed + 1)
        warp(F, L.a, gx0 - 1, ly - 2, +1, .24, .9)
        warp(F, Rr.a, gx1 + 1, ly - 2, -1, .24, .9)
    else:
        L = leaf_img(lv, LW, LH, -1, seed, hole=(state == 'danificado'))
        Rr = leaf_img(lv, LW, LH, +1, seed + 1)
        paste(F, L.a, gx0 - 2, ly - 2)
        if state == 'danificado':
            src = rotimg(Rr.a, -9, Rr.w - 3, 4)
            paste(F, src, gx0 + LW - 1, ly + 1)
        else:
            paste(F, Rr.a, gx0 + LW - 2, ly - 2)
        # tranca
        cy = ly + LH // 2 + (6 if lv != 5 else 0)
        if state == 'fechado':
            cx = (gx0 + gx1) // 2
            if lv == 1:
                P(F, limb(cx - 26, cy - 1, cx + 26, cy + 2, 4), ESTACA, tex=.3)
                for d in (-4, 4):
                    P(F, chain(sag_pts(cx + d - 2, cy - 4, cx + d + 2, cy + 4, 0, 2), 1.5), CORDA)
            elif lv == 2:
                for d in (-22, 18):
                    P(F, R(cx + d, cy - 3, cx + d + 4, cy + 4), FERRO)
                P(F, R(cx - 30, cy - 2, cx + 30, cy + 2), TAB2, tex=.3)
            elif lv == 3:
                for d in (-30, 26):
                    P(F, R(cx + d, cy - 4, cx + d + 5, cy + 5), FERRO, ol='#0e0c0c')
                P(F, R(cx - 40, cy - 3, cx + 40, cy + 3), '#5a3a22', tex=.35)
                for d in (-36, -14, 10, 34):
                    dot(F, cx + d, cy, '#8a8480')
            elif lv == 4:
                P(F, R(cx - 6, cy - 7, cx + 6, cy + 6), '#5a6068', ol='#1a1e22')
                P(F, R(cx - 3, cy - 4, cx + 3, cy + 1), '#2a2e34')
                dot(F, cx - 1, cy - 3, '#6aff6a')
                dot(F, cx + 1, cy - 3, '#c8323a')
                for i in range(-18, 19, 3):
                    if abs(i) > 6:
                        P(F, ell(cx + i, cy + 2 + abs(i) * .12, 1.6, 1.2), '#a8aeb4', light=.4)
            else:
                P(F, R(cx - 34, cy - 2, cx + 34, cy + 2), OURO, ol='#3a2808', light=.45)
                P(F, ell(cx, cy, 5, 5), OURO2, ol='#3a2808', light=.4)
                F.flat(ell(cx, cy, 2, 2), RUNAB)
                glow(F, cx, cy, 10, RUNAB, 90)
    # pilares
    pilar(F, lv, pl, pw, gy, ph, seed=1)
    pilar(F, lv, pr, pw, gy, ph, seed=2)
    # vão superior
    if lv == 1:
        pts = sag_pts(pl + 8, gy - ph + 12, pr - 8, gy - ph + 12, 10, 12)
        P(F, chain(pts, 1.6), CORDA, light=.3)
        for i in (2, 4, 6, 8, 10):
            x, y = pts[i]
            P(F, R(x - 2, y + 2, x + 2, y + 7), '#a8aeb4' if i % 4 else '#c8b060', light=.4)
            vline(F, x, y, y + 1, '#5a5e64')
    elif lv == 2:
        by = gy - ph + 8
        P(F, R(pl - 6, by, pr + 6, by + 6), TAB2, tex=.3)
        nails(F, pl - 2, pr + 2, by + 3, 12)
        bx = (pl + pr) // 2
        P(F, R(bx, by + 6, bx + 1, by + 9), FERRO)
        P(F, [[(bx - 5, by + 18), (bx - 3, by + 11), (bx - 1, by + 9), (bx + 2, by + 9), (bx + 4, by + 11), (bx + 6, by + 18)]], '#c89a3a', light=.45, ol='#3a2808')
        dot(F, bx, by + 19, FERRO)
    elif lv == 3:
        cx, cy = (pl + pr) / 2, gy - ph + 26
        outer = F.mask(ell(cx, cy, (pr - pl) / 2 + 4, 30))
        inner = F.mask(ell(cx, cy + 2, (pr - pl) / 2 - 14, 22))
        band = outer & ~inner & (yy < cy) & rmask(F, pl, 0, pr, F.h)
        Cst = T_stone(F, 0, 0, ch=7, bmin=8, bmax=12, period=999, seed=9)
        paint(F, band, Cst)
        P(F, R(cx - 5, cy - 31, cx + 5, cy - 20), '#a8a49c', tex=.2)
    elif lv == 4:
        by = gy - ph + 2
        P(F, R(pl, by, pr, by + 4), MET, ol='#2a2e34')
        P(F, R(pl, by + 12, pr, by + 15), MET, ol='#2a2e34')
        for x in range(pl + 6, pr - 4, 10):
            P(F, limb(x, by + 4, x + 5, by + 12, 1.6), '#5a6068')
            P(F, limb(x + 5, by + 12, x + 10, by + 4, 1.6), '#5a6068')
        rivets(F, pl + 2, pr - 2, by + 2, 6)
        keep = F.a.copy()
        barbed(F, pl + 4, pr - 4, by - 5, 3)
        cxp = (pl + pr) // 2
        P(F, R(cxp - 16, by + 16, cxp + 16, by + 26), '#e0b52a', ol='#1e1a16')
        for i, c in enumerate(range(cxp - 12, cxp + 12, 6)):
            P(F, R(c, by + 18, c + 3, by + 24), '#1e1a16', shade=False, outline=False)
    else:
        cx, cy = (pl + pr) / 2, gy - ph + 30
        outer = F.mask(ell(cx, cy, (pr - pl) / 2 + 4, 34))
        inner = F.mask(ell(cx, cy + 2, (pr - pl) / 2 - 14, 26))
        band = outer & ~inner & (yy < cy) & rmask(F, pl, 0, pr, F.h)
        Cst = T_stone(F, 0, 0, ch=8, bmin=10, bmax=14, cols=(LPED, LPED2), mortar=ARD, period=999, seed=9)
        paint(F, band, Cst)
        edge = band & ~_sh(band, 0, 2)
        F.a[edge, :3] = H(OURO)
        P(F, poly((cx - 7, cy - 36), (cx + 7, cy - 36), (cx + 5, cy - 22), (cx - 5, cy - 22)), OURO, ol='#3a2808', light=.45)
        P(F, ell(cx, cy - 29, 3.5, 3.5), RUNA, ol='#3a0808')
        F.flat(ell(cx + 1.4, cy - 30, 2.6, 2.6), OURO)
        glow(F, cx, cy - 29, 14, RUNAB, 90)
    if state == 'danificado':
        sol = solid(F)
        for (x, w) in ((pl, pw), (pr, pw)):
            pm = rmask(F, x - w // 2, gy - ph, x + w // 2, gy) & sol
            crack(F, x - 4, gy - ph + 12, 30, rng, pm, 95, .9)
            crack(F, x + 6, gy - 4, 16, rng, pm, -80, .9)
            soot(F, pm, x, gy - ph * .6, 14, 18, seed + x)
        soot(F, sol, 128, gy - 20, 40, 18, seed + 5, k=.45)
        piece(F, lv, 96, gy + 5, rng, 1.2)
        piece(F, lv, 160, gy + 6, rng, 1.0)
        piece(F, lv, 140, gy + 4, rng, .8)
        flame(F, pr - 4, gy - ph + 30, 1.0, red=(lv == 5))
        flame(F, 150, gy - 1, .9, red=(lv == 5))
        smoke(F, pr - 2, gy - ph + 12, 4, 1.1, 2.0, seed=seed)
        smoke(F, 152, gy - 18, 3, .9, 1.5, seed=seed + 1)
    return finish_wall(F, gy)


# ================= MURALHA =================

def back_strip(F, lv, xc, y0, y1, seed=0):
    """trecho da muralha que segue para trás (visto de cima)."""
    yy, xx = grids(F.w, F.h)
    w = {1: 12, 2: 9, 3: 18, 4: 16, 5: 20}[lv]
    a, b = int(xc - w / 2), int(xc + w / 2)
    m = rmask(F, a, y0, b, y1)
    if lv == 1:
        paint(F, m, T_canvas(F, 0, seed=seed, fold=5))
        for y in range(y1 - 6, y0, -24):
            P(F, ell(xc, y, 3.2, 3.2), ESTACA)
            dot(F, xc - 1, y - 1, '#c8a070')
        P(F, chain([(xc - 2, y1), (xc + 2, y0)], 1.2), CORDA)
    elif lv == 2:
        for y in range(y1 - 4, y0 - 8, -8):
            P(F, ell(xc, y, 4.5, 4.2), mix(H(TAB), H(TAB2), rn(y, 1)), light=.3)
            F.flat(ell(xc - .5, y - .5, 2.2, 2), '#c8a070')
            dot(F, xc, y, TABD)
    elif lv == 3:
        paint(F, m, T_stone(F, 0, 0, ch=12, bmin=14, bmax=20, cols=('#a8a49c', '#96928a'), mortar='#6e6a64', period=999, seed=seed))
        for y in range(y1 - 10, y0 - 10, -28):
            for xm in (a, b - 5):
                P(F, R(xm, y - 12, xm + 5, y), '#b6b2aa', tex=.15)
                darken(F, rmask(F, xm + 6 if xm == a else xm - 2, y - 10, xm + 7 if xm == a else xm - 1, y + 1) & m, .7)
    elif lv == 4:
        paint(F, m, T_corr(F, 0, ('#9aa2a8', '#7d848c'), seed=seed, rust=.72, horiz=True))
        keep = F.a.copy()
        barbed(F, xc, xc, 0, seed, vertical=True, y0=y0, y1=y1 - 4)
    else:
        paint(F, m, T_slate(F, 0, 0, seed=seed))
        vline(F, a, y0, y1, OURO2)
        vline(F, b, y0, y1, OURO2)
        for y in range(y1 - 10, y0 - 10, -28):
            for xm in (a, b - 5):
                P(F, R(xm, y - 12, xm + 5, y), LPED2, tex=.15)
                P(F, poly((xm + .5, y - 12), (xm + 5.5, y - 12), (xm + 3, y - 19)), OURO, ol='#3a2808', light=.45)
    return m


def muralha(lv, kind):
    F = Frame(128, 160)
    gy = 148
    seed = lv * 11 + {'reto': 0, 'rachado': 1, 'canto': 2, 'brecha': 3}[kind]
    rng = np.random.RandomState(seed)
    if kind in ('reto', 'rachado'):
        info = muro(F, lv, -3, 130, gy, seed=lv)
        if kind == 'rachado':
            wall_damage(F, lv, info, 0, 127, gy, seed=seed, fire=(lv % 2 == 0))
    elif kind == 'canto':
        Hh, T = WH[lv], WT[lv]
        xc = 64
        back_strip(F, lv, xc, 0, gy - Hh - T + 2, seed)
        muro(F, lv, -3, xc - 6, gy, seed=lv, deco=False)
        pilar(F, lv, xc, {1: 26, 2: 22, 3: 30, 4: 30, 5: 32}[lv], gy, Hh + 12, seed=3)
    else:
        info = muro(F, lv, -3, 130, gy, seed=lv)
        top = info['ttop'] - 30
        pts = jag([(34, top), (40, gy - WH[lv] + 10), (32, gy - 30), (38, gy - 12), (30, gy + 2)], 3, rng, 3) + \
            jag([(98, gy + 2), (92, gy - 14), (99, gy - 32), (90, gy - WH[lv] + 6), (95, top)], 3, rng, 3)
        K = F.mask([pts])
        cut(F, K)
        sol = solid(F)
        for x in (36, 92):
            crack(F, x, gy - WH[lv] + 8, 26, rng, sol & info['face'], 100 if x < 64 else 80, .9)
        soot(F, info['face'], 64, gy - 30, 46, 24, seed, k=.5)
        rubble(F, lv, 64, gy + 3, 76, 24, seed=seed, beams=2, smk=1)
        debris_cloud(F, 64, gy - 2, 70, seed)
    return finish_wall(F, gy)


# ================= ESTADOS GENÉRICOS DE OBJETO =================

def obj_damage(F, lv, body, seed, fires=(), smokes=(), loose=(), cracks=4, soots=1, notch=None):
    rng = np.random.RandomState(seed)
    ys, xs = np.nonzero(body)
    if not len(xs):
        return
    bx0, bx1, by0, by1 = xs.min(), xs.max(), ys.min(), ys.max()
    sol = solid(F) & body
    for i in range(cracks):
        x = bx0 + 6 + (bx1 - bx0 - 12) * (i + rng.uniform(.15, .85)) / cracks
        y = by0 + rng.uniform(2, (by1 - by0) * .4)
        crack(F, x, y, rng.uniform(14, 26), rng, sol, 90 + rng.uniform(-30, 30), .9)
    for i in range(soots):
        soot(F, body, rng.uniform(bx0 + 10, bx1 - 10), rng.uniform(by0 + 4, by1 - 6), rng.uniform(12, 20), rng.uniform(9, 14), seed + i)
    if notch is not None:
        K = F.mask([notch])
        cut(F, K)
    for (x, y, b) in loose:
        piece(F, lv, x, y, rng, b)
    for (x, y, s) in fires:
        flame(F, x, y, s, red=(lv == 5))
    for (x, y, n, s) in smokes:
        smoke(F, x, y, n, s, 2.0, seed=seed + int(x))


# ================= BARRICADA =================

def tire(F, x, y, rx=11, ry=6, col=PNEU):
    m = P(F, ell(x, y, rx, ry), col, light=.18, tex=.2)
    yy, xx = grids(F.w, F.h)
    tread = m & (((xx - x) * 2 + yy).astype(int) % 4 == 0) & ~F.mask(ell(x, y, rx - 2, ry - 1.5))
    darken(F, tread, .7)
    F.flat(ell(x, y - .5, rx * .45, ry * .4), '#141216')
    F.flat(ell(x, y - 1, rx * .45, ry * .25), '#0c0a0e')
    dot(F, x - rx * .5, y - ry * .55, '#5a5860')
    return m


def sandbag(F, x, y, w=20, h=9, seed=0):
    m = P(F, [[(x - w / 2 + 2, y - h), (x + w / 2 - 2, y - h), (x + w / 2, y - h + 3), (x + w / 2, y - 2), (x + w / 2 - 2, y),
               (x - w / 2 + 2, y), (x - w / 2, y - 2), (x - w / 2, y - h + 3)]],
          mix(H('#b8a47a'), H('#a08e66'), rn(x, y)), tex=.3, light=.28)
    hline(F, x - w / 2 + 3, x + w / 2 - 3, y - h / 2, '#8a7650', clip=m)
    for d in (-w / 2 + 1, w / 2 - 2):
        dot(F, x + d, y - h + 2, '#7a6644')
        dot(F, x + d, y - 2, '#7a6644')
    return m


def barricada(lv, state):
    F = Frame(128, 128)
    gy = 116
    seed = lv * 7 + {'intacta': 0, 'danificada': 1, 'destruida': 2}[state]
    rng = np.random.RandomState(seed)
    yy, xx = grids(F.w, F.h)
    body = np.zeros((F.h, F.w), bool)
    if state == 'destruida':
        rubble(F, lv, 64, gy + 2, 104, 20 + lv, seed=seed, beams=1 if lv > 1 else 0, smk=2)
        if lv == 1:
            tire(F, 30, gy - 2, 10, 5)
            tire(F, 92, gy + 1, 9, 5)
        elif lv == 2:
            P(F, limb(24, gy, 50, gy - 26, 5), ESTACA, tex=.3)
            P(F, poly((48, gy - 24), (53, gy - 29), (54, gy - 22)), '#c8a070')
        elif lv == 3:
            sandbag(F, 34, gy, 22, 9)
            m = sandbag(F, 90, gy + 1, 22, 9)
            P(F, [[(98, gy - 3), (106, gy - 1), (102, gy + 2)]], '#c8b48a', tex=.4)
        elif lv == 4:
            m = P(F, [[(30, gy - 2), (52, gy - 26), (82, gy - 20), (70, gy)]], CHA)
            tint(F, m & ((xx % 4) == 0), CHA2, .7)
            tint(F, m & (lowfreq(F.w, F.h, 5, 3) > .58), FERR, .6)
            barbed(F, 76, 112, gy - 6, 5)
        else:
            P(F, poly((40, gy - 10), (44, gy - 10), (48, gy - 30)), OURO, ol='#3a2808', light=.45)
            P(F, poly((84, gy - 6), (88, gy - 6), (80, gy - 22)), OURO, ol='#3a2808', light=.45)
            rune_glyph(F, 62, gy - 14, 1)
        return finish(F, gy, 64, 54)
    if lv == 1:
        m = P(F, [[(26, gy), (34, gy - 52), (66, gy - 46), (64, gy)]], SUC)
        paint(F, m, T_corr(F, 0, (SUC, '#55544f'), seed=seed, rust=.45))
        body |= m
        m = P(F, [[(58, gy), (64, gy - 50), (100, gy - 44), (102, gy)]], '#d8d2c2', tex=.2, light=.25)
        lf = lowfreq(F.w, F.h, 5, seed + 2)
        tint(F, m & (lf > .6), '#8a7a5a', .5)
        tint(F, m & (lf > .75), FERR, .5)
        P(F, R(66, gy - 40, 69, gy - 22), '#a8a49c')
        P(F, [[(70, gy - 46), (98, gy - 41), (98, gy - 39), (70, gy - 44)]], '#8a8478', shade=False)
        for (dx, dy) in ((80, 30), (81, 31), (82, 31), (84, 32), (80, 33), (86, 33), (83, 35), (85, 36), (79, 28)):
            dot(F, dx, gy - dy, SANG)
        body |= m
        for (x, top) in ((40, gy - 64), (52, gy - 60), (92, gy - 58)):
            P(F, chain([(x, gy - 30), (x + 2, top + 14), (x - 3, top)], 1.3), '#3a3634', light=.35)
        body |= tire(F, 30, gy - 5, 13, 6)
        body |= tire(F, 56, gy - 5, 13, 6)
        body |= tire(F, 43, gy - 15, 13, 6)
        body |= tire(F, 96, gy - 4, 12, 5)
        rope(F, sag_pts(20, gy - 22, 106, gy - 28, 6, 10), w=1.6)
        P(F, R(14, gy - 10, 22, gy), '#7a6a52', tex=.3)
        P(F, ell(110, gy - 3, 5, 3), '#8a8a80', light=.3)
    elif lv == 2:
        beamy = gy - 14
        for x in (30, 64, 98):
            body |= P(F, limb(x + 12, gy, x - 12, gy - 48, 5.5, 4.5), TAB2, tex=.3)
            P(F, poly((x - 14.5, gy - 46), (x - 9.5, gy - 49), (x - 14, gy - 56)), '#c8a070')
        body |= P(F, limb(10, beamy, 118, beamy - 2, 9), TAB, tex=.35)
        for x in (10, 118):
            P(F, ell(x, beamy - (1 if x > 60 else 0), 4, 4.5), '#c8a070')
            dot(F, x, beamy, TABD)
        for x in (30, 64, 98):
            body |= P(F, limb(x - 12, gy, x + 12, gy - 48, 5.5, 4.5), TAB, tex=.3)
            P(F, poly((x + 9.5, gy - 49), (x + 14.5, gy - 46), (x + 14, gy - 56)), '#d8b080')
            P(F, R(x - 3, beamy - 6, x + 3, beamy - 3), CORDA)
            hline(F, x - 3, x + 3, beamy - 4, '#7a6440')
        for by in (gy - 30,):
            P(F, R(18, by, 110, by + 5), RIPA, tex=.25)
            nails(F, 22, 108, by + 2, 11)
        for (dx, dy) in ((60, 26), (61, 27), (62, 26), (61, 28), (63, 29), (59, 24)):
            dot(F, dx, gy - dy, SANG)
    elif lv == 3:
        for (x, y) in ((16, gy), (16, gy - 9)):
            body |= P(F, R(x - 6, y - 9, x + 9, y), PED, tex=.25)
        for (x, y) in ((104, gy), (104, gy - 9), (104, gy - 18)):
            body |= P(F, R(x - 8, y - 9, x + 8, y), mix(H(PED), H(PED2), rn(y, 2)), tex=.25)
        for row, (n, y) in enumerate(((4, gy), (4, gy - 9), (3, gy - 18), (2, gy - 27))):
            w = 21
            x0 = 64 - (n - 1) * w / 2 - (4 if row % 2 else 0)
            for i in range(n):
                body |= sandbag(F, x0 + i * w, y, 21, 10)
        body |= P(F, R(44, gy - 45, 80, gy - 36), PED2, tex=.25)
        hline(F, 45, 79, gy - 45, '#b6b2aa')
        P(F, R(84, gy - 38, 96, gy - 29), '#9a968e', tex=.3)
        dot(F, 50, gy - 20, '#8a7650')
        for (dx, dy) in ((70, 14), (71, 15), (72, 14), (73, 16)):
            dot(F, dx, gy - dy, SANG)
    elif lv == 4:
        for x in (22, 106):
            P(F, limb(x, gy - 46, x + (12 if x < 60 else -12), gy, 3.5), '#5a6068')
        m = rmask(F, 16, gy - 46, 112, gy - 6)
        paint(F, m, T_corr(F, 0, seed=seed, rust=.6), light=.2)
        body |= m
        for (a, b, c, d) in ((16, gy - 46, 112, gy - 43), (16, gy - 9, 112, gy - 6), (16, gy - 46, 19, gy - 6), (109, gy - 46, 112, gy - 6),
                             (62, gy - 46, 65, gy - 6)):
            P(F, R(a, b, c, d), MET, ol='#2a2e34', light=.3)
        rivets(F, 19, 110, gy - 45, 6)
        rivets(F, 19, 110, gy - 8, 6)
        hz = rmask(F, 20, gy - 20, 108, gy - 12)
        C = C0(F, '#e0b52a')
        C[((xx + yy) // 4) % 2 == 0] = H('#1e1a16')
        paint(F, hz & ~rmask(F, 62, 0, 65, F.h), C, light=.15, ol='#1e1a16')
        for x in (22, 90):
            P(F, R(x, gy - 6, x + 16, gy), '#8e8a84', tex=.3)
        barbed(F, 16, 112, gy - 52, seed)
        P(F, R(34, gy - 38, 46, gy - 28), '#c8c0b0', ol='#2a2620')
        P(F, ell(40, gy - 34, 3, 2.6), '#2a2620', shade=False, outline=False)
        hline(F, 37, 43, gy - 30, '#2a2620')
        for (dx, dy) in ((80, 34), (81, 33), (82, 32), (83, 30), (84, 31), (86, 28)):
            dot(F, dx, gy - dy, SANG)
    else:
        m = rmask(F, 18, gy - 40, 110, gy)
        paint(F, m, T_stone(F, 18, gy - 40, ch=10, bmin=12, bmax=20, cols=(LPED, LPED2), mortar=ARD, period=999, seed=seed), light=.2)
        body |= m
        P(F, R(14, gy - 44, 114, gy - 40), OURO, ol='#3a2808', light=.4)
        P(F, R(16, gy - 5, 112, gy - 1), OURO2, ol='#3a2808', light=.35)
        for i, x in enumerate(range(22, 110, 12)):
            a = -90 + (x - 64) * .8
            L = 18 + (6 if i % 2 else 0)
            tx, ty = x + L * math.cos(math.radians(a)), gy - 44 + L * math.sin(math.radians(a))
            nx, ny = -math.sin(math.radians(a)) * 3.5, math.cos(math.radians(a)) * 3.5
            P(F, poly((x - nx, gy - 44 - ny), (x + nx, gy - 44 + ny), (tx, ty)), OURO if i % 2 else OURO2, ol='#3a2808', light=.45)
        for x in (30, 98):
            a = 180 if x < 64 else 0
            P(F, poly((x, gy - 28), (x, gy - 20), (x + (-14 if x < 64 else 14), gy - 24)), OURO, ol='#3a2808', light=.45)
        rune_glyph(F, 62, gy - 30, 3)
        P(F, R(56, gy - 34, 72, gy - 33), OURO2, shade=False, outline=False)
        P(F, R(56, gy - 21, 72, gy - 20), OURO2, shade=False, outline=False)
    if state == 'danificada':
        obj_damage(F, lv, body, seed, fires=((44, gy - 2, .9),), smokes=((48, gy - 24, 4, 1.0),),
                   loose=((100, gy + 6, 1.0), (24, gy + 5, .8)), cracks=4)
        if lv >= 3:
            K = F.mask([jag([(78, gy - 70), (80, gy - 40 + (6 if lv == 3 else 0)), (90, gy - 32), (100, gy - 38), (106, gy - 70)], 2, rng, 3)])
            cut(F, K)
    return finish(F, gy, 64, 56)


# ================= GERADOR =================

def motor(F, x, yb, s=1.0, seed=0, tank=True, glow_core=False):
    """gerador portátil a gasolina: bloco, tanque, filtro, puxador, tomadas. (x = centro, yb = base)."""
    w, h = 40 * s, 24 * s
    x0, x1 = x - w / 2, x + w / 2
    yt = yb - h
    m = P(F, R(x0 + 2, yt + 6, x1 - 2, yb - 2), '#5c5a58', tex=.25)
    yy, xx = grids(F.w, F.h)
    fins = m & (((xx - x0).astype(int) % 3) == 0) & (yy > yt + 9) & (xx > x0 + 14 * s)
    darken(F, fins, .65)
    tint(F, m & (lowfreq(F.w, F.h, 4, seed) > .64), FERR, .55)
    P(F, ell(x0 + 8 * s, yt + 15 * s, 6.5 * s, 6.5 * s), '#4a4846', light=.3)
    for i in range(-2, 3):
        hline(F, x0 + 8 * s - 4 * s, x0 + 8 * s + 4 * s, yt + 15 * s + i * 2 * s, '#2a2826')
    P(F, ell(x1 - 8 * s, yt + 15 * s, 5 * s, 5 * s), '#a8392e', light=.3)
    P(F, ell(x1 - 8 * s, yt + 15 * s, 1.8 * s, 1.8 * s), '#2a2826')
    P(F, limb(x1 - 8 * s, yt + 15 * s, x1 - 2 * s, yt + 22 * s, 1.4), '#c9c3b0')
    P(F, R(x1 - 4 * s, yt + 21 * s, x1 - 1 * s, yt + 23 * s), '#1e1c1a')
    P(F, R(x - 6 * s, yt + 10 * s, x + 4 * s, yt + 19 * s), '#3a3836', ol='#141212')
    for dx in (-4.5, -.5):
        sx_, sy_ = int(x + dx * s), int(yt + 12 * s)
        P(F, R(sx_, sy_, sx_ + 2, sy_ + 2), '#c9c3b0', shade=False, ol='#141212')
        dot(F, sx_ + 1, sy_ + 1, '#2a2826')
    P(F, R(int(x + 3 * s) - 1, int(yt + 11 * s), int(x + 3 * s), int(yt + 14 * s)), '#c8323a', shade=False, ol='#141212')
    hline(F, x - 5 * s, x + 2 * s, yt + 17 * s, '#e0b52a')
    dot(F, x - 5 * s, yt + 17 * s, '#6aff6a')
    if tank:
        P(F, [[(x0 + 6, yt + 7), (x0 + 9, yt), (x1 - 9, yt), (x1 - 6, yt + 7)]], '#a8392e', light=.35, tex=.15)
        tint(F, F.mask(R(x0 + 10, yt + 1, x1 - 10, yt + 5)) & (lowfreq(F.w, F.h, 3, seed + 1) > .6), '#d8c8a8', .4)
        P(F, R(x - 3, yt - 3, x + 2, yt + 1), '#2a2826')
        hline(F, x0 + 12, x0 + 20, yt + 3, '#e8d8b8')
    for (a, b, c, d) in ((x0, yb, x0, yt + 4), (x1, yb, x1, yt + 4), (x0, yb, x1, yb), (x0, yt + 4, x0 + 5, yt + 4), (x1, yt + 4, x1 - 5, yt + 4)):
        P(F, limb(a, b, c, d, 2.4), '#3a3e44', light=.35)
    return F.mask(R(x0 - 1, yt - 3, x1 + 1, yb + 1))


def jerrycan(F, x, yb, col='#b8342a'):
    m = P(F, [[(x - 7, yb), (x - 7, yb - 14), (x - 4, yb - 17), (x + 7, yb - 17), (x + 7, yb)]], col, light=.3)
    P(F, R(x - 3, yb - 20, x + 2, yb - 17), '#2a2826')
    P(F, limb(x + 2, yb - 17, x + 6, yb - 14, 1.4), '#7a1e18')
    hline(F, x - 5, x + 5, yb - 9, '#7a1e18', clip=m)
    vline(F, x - 1, yb - 15, yb - 2, '#7a1e18', clip=m)
    return m


def wire(F, pts, col='#1e1a1c', w=1.4):
    P(F, chain(pts, w), col, light=.2, ol='#0c0a0c')


def exhaust(F, x, yb, yt, col='#4a4846', w=4, cap=True):
    m = P(F, R(x - w // 2, yt, x + w // 2 - 1, yb), col, light=.3)
    tint(F, m & (lowfreq(F.w, F.h, 3, x) > .6), FERR, .6)
    if cap:
        P(F, R(x - w // 2 - 1, yt - 2, x + w // 2, yt), mix(H(col), INK, .3))
    return m


def gerador(lv, state):
    F = Frame(128, 160)
    gy = 148
    seed = lv * 13 + {'intacta': 0, 'danificada': 1, 'destruida': 2}[state]
    rng = np.random.RandomState(seed)
    yy, xx = grids(F.w, F.h)
    body = np.zeros((F.h, F.w), bool)
    smk = None
    fire_xy = None
    if state == 'destruida':
        rubble(F, lv, 64, gy + 2, 100, 22 + lv * 2, seed=seed, beams=2 if lv > 1 else 1, smk=2)
        lay = Frame(128, 160)
        motor(lay, 64, 130, .8, seed, tank=True)
        src = rotimg(lay.a, 24, 64, 120)
        src[..., :3] = (src[..., :3] * .55).astype(np.uint8)
        paste(F, src, 0, gy - 132)
        if lv == 5:
            P(F, ell(84, gy - 6, 5, 4), '#5a1a20', ol='#1a0808')
            dot(F, 83, gy - 7, RUNA)
            glow(F, 84, gy - 6, 10, RUNA, 70)
        else:
            jerrycan(F, 96, gy + 2, '#6a2a24')
        wire(F, [(20, gy + 2), (30, gy - 4), (38, gy + 1), (44, gy - 6)])
        return finish(F, gy, 64, 52)
    if lv == 1:
        pal = rmask(F, 22, gy - 8, 106, gy - 4)
        paint(F, pal, T_planks(F, 22, 7, cols=(ESTACA, TAB2), seed=seed))
        for x in (24, 60, 98):
            P(F, R(x, gy - 4, x + 6, gy), TABD, tex=.3)
        body |= pal | motor(F, 62, gy - 8, 1.3, seed)
        P(F, chain(sag_pts(32, gy - 36, 92, gy - 9, 2, 6), 1.6), CORDA, light=.3)
        P(F, chain(sag_pts(92, gy - 36, 34, gy - 9, 2, 6), 1.6), CORDA, light=.3)
        for (a, b) in ((32, gy - 36), (92, gy - 36), (34, gy - 9), (92, gy - 9)):
            P(F, ell(a, b, 2, 2), '#c9ac72')
        exhaust(F, 82, gy - 22, gy - 40, w=4)
        smk = (83, gy - 46)
        body |= jerrycan(F, 108, gy)
        wire(F, [(40, gy - 14), (30, gy - 6), (20, gy - 2), (12, gy + 2), (8, gy + 4)], '#2a2426')
        wire(F, [(46, gy - 14), (36, gy + 2), (26, gy + 4), (18, gy + 1), (22, gy - 2), (30, gy + 3)], '#8a2420')
        P(F, ell(30, gy + 5, 9, 2), '#141016', shade=False, outline=False)
        for i in range(3):
            dot(F, 8 + i, gy + 4 - i, '#ffd36a', layer=F.fx)
    elif lv == 2:
        back = rmask(F, 20, gy - 66, 108, gy - 1)
        C = T_planks(F, 20, 7, seed=seed)
        C *= .62
        paint(F, back, C)
        body |= back
        roof = F.mask([[(12, gy - 62), (116, gy - 62), (108, gy - 88), (20, gy - 88)]])
        paint(F, roof, T_ripas(F, 0, gy - 88, seed=seed))
        body |= roof
        for x in (18, 106):
            body |= P(F, R(x, gy - 63, x + 5, gy), TAB, tex=.3)
            nails(F, x + 2, x + 2, gy - 58, 1)
        P(F, R(22, gy - 6, 106, gy - 1), TABD, tex=.3)
        body |= motor(F, 60, gy - 6, 1.05, seed)
        exhaust(F, 86, gy - 26, gy - 100, w=4)
        P(F, R(82, gy - 90, 89, gy - 87), '#3a3836')
        smk = (87, gy - 106)
        jerrycan(F, 116, gy)
        wire(F, [(36, gy - 14), (24, gy - 30), (24, gy - 50)], '#2a2426')
        P(F, R(30, gy - 52, 38, gy - 44), '#d8d2c2', ol='#2a2620')
        dot(F, 33, gy - 49, '#1e1a16'); dot(F, 35, gy - 49, '#1e1a16')
    elif lv == 3:
        back = rmask(F, 16, gy - 50, 112, gy - 14)
        paint(F, back, T_stone(F, 16, gy - 50, ch=8, bmin=10, bmax=16, period=999, seed=seed) * .82)
        body |= back
        P(F, R(14, gy - 54, 114, gy - 50), '#b6b2aa', tex=.2)
        tm_ = rmask(F, 12, gy - 62, 116, gy - 54)
        paint(F, tm_, T_tiles(F, 0, gy - 62, seed=seed, moss=False))
        body |= tm_
        base = rmask(F, 14, gy - 14, 114, gy)
        paint(F, base, T_stone(F, 14, gy - 14, ch=7, bmin=14, bmax=22, cols=('#77736e', '#66625e'), mortar=ARG, period=999, seed=seed + 3))
        P(F, R(12, gy - 16, 116, gy - 13), '#a8a49c', tex=.2)
        body |= base
        body |= motor(F, 58, gy - 16, 1.05, seed)
        exhaust(F, 92, gy - 30, gy - 126, col='#3a3634', w=5)
        P(F, R(86, gy - 128, 98, gy - 124), '#2a2624')
        P(F, R(88, gy - 34, 96, gy - 30), '#2a2624')
        smk = (92, gy - 133)
        jerrycan(F, 104, gy - 16)
        wire(F, [(30, gy - 26), (22, gy - 40), (18, gy - 52), (16, gy - 60)], '#2a2426')
    elif lv == 4:
        base = rmask(F, 16, gy - 12, 112, gy)
        paint(F, base, T_brick(F, 16, gy - 12, period=999, seed=seed))
        body |= base
        cab = rmask(F, 20, gy - 74, 100, gy - 12)
        paint(F, cab, T_corr(F, 0, ('#7d848c', '#646a72'), seed=seed, rust=.68))
        body |= cab
        P(F, R(16, gy - 80, 104, gy - 74), CHA, ol='#2a2e34', light=.35)
        rivets(F, 18, 102, gy - 77, 6)
        for (a, b, c, d) in ((20, gy - 74, 23, gy - 12), (97, gy - 74, 100, gy - 12), (20, gy - 16, 100, gy - 13)):
            P(F, R(a, b, c, d), MET, ol='#2a2e34', light=.3)
        for yr in range(gy - 70, gy - 16, 8):
            dot(F, 21, yr, REB)
            dot(F, 98, yr, REB)
        pm = P(F, R(28, gy - 68, 64, gy - 40), '#3a3e44', ol='#14161a')
        for (cx, cy) in ((37, gy - 60), (55, gy - 60)):
            P(F, ell(cx, cy, 5.5, 5.5), '#e8e2d0', ol='#14161a', light=.2)
            F.line(cx, cy, cx + 3, cy - 3, '#c8323a')
            dot(F, cx, cy, '#1e1a16')
        for i, c in enumerate(('#6aff6a', '#ffd36a', '#c8323a')):
            P(F, ell(34 + i * 8, gy - 48, 1.8, 1.8), c, outline=True, ol='#14161a', shade=False)
            glow(F, 34 + i * 8, gy - 48, 5, c, 60)
        for i in range(3):
            P(F, R(47 + i * 5, gy - 52, 49 + i * 5, gy - 44), '#1e2024')
            P(F, R(47 + i * 5, gy - 52 + (i % 2) * 4, 49 + i * 5, gy - 49 + (i % 2) * 4), '#c9ced4', shade=False)
        for yr in range(gy - 66, gy - 22, 5):
            P(F, R(70, yr, 94, yr + 2), '#4a5058', ol='#1a1e22')
        P(F, R(28, gy - 36, 44, gy - 26), '#e0b52a', ol='#1e1a16')
        P(F, poly((36, gy - 35), (31, gy - 30), (36, gy - 30), (33, gy - 27), (41, gy - 32), (36, gy - 32), (39, gy - 35)), '#1e1a16', shade=False, outline=False)
        exhaust(F, 88, gy - 80, gy - 112, col='#4a4846', w=5)
        smk = (88, gy - 118)
        for x in (32, 66):
            P(F, R(x - 1, gy - 88, x + 1, gy - 80), '#4a5058')
            lamp(F, x, gy - 91, r=22)
        P(F, R(112, gy - 104, 115, gy), '#5a4a3a', tex=.3)
        P(F, R(106, gy - 100, 121, gy - 98), '#5a4a3a')
        wire(F, [(100, gy - 66), (106, gy - 80), (112, gy - 98)], '#1e1a1c', 1.2)
        wire(F, [(113, gy - 100), (120, gy - 98), (127, gy - 96)], '#1e1a1c', 1.0)
        wire(F, [(32, gy - 94), (20, gy - 92), (6, gy - 96), (0, gy - 98)], '#1e1a1c', 1.0)
        P(F, ell(115, gy - 22, 8, 3), '#3a3e44', light=.3)
        drum(F, 106, 124, gy, 26, '#3f5a7a', seed)
    else:
        base = rmask(F, 14, gy - 10, 114, gy)
        paint(F, base, T_stone(F, 14, gy - 10, ch=10, bmin=14, bmax=22, cols=(LPED, LPED2), mortar=ARD, period=999, seed=seed))
        P(F, R(12, gy - 13, 116, gy - 10), OURO, ol='#3a2808', light=.4)
        body |= base
        hs = F.mask([[(22, gy - 13), (22, gy - 70), (34, gy - 82), (94, gy - 82), (106, gy - 70), (106, gy - 13)]])
        paint(F, hs, T_stone(F, 22, gy - 82, ch=10, bmin=12, bmax=18, cols=(LPED, LPED2), mortar=ARD, period=999, seed=seed + 2))
        body |= hs
        edge = hs & ~_sh(hs, 0, 2)
        F.a[edge & (yy < gy - 60), :3] = H(OURO)
        for x in (22, 103):
            P(F, R(x, gy - 70, x + 3, gy - 13), OURO2, ol='#3a2808', light=.4)
        cx, cy = 64, gy - 46
        glow(F, cx, cy, 34, RUNAB, 120)
        P(F, ell(cx, cy, 17, 17), OURO, ol='#3a2808', light=.45)
        P(F, ell(cx, cy, 13.5, 13.5), '#1a0c12', ol='#3a2808')
        P(F, ell(cx, cy, 9, 9), RUNA, ol='#5a0a10', light=.5)
        P(F, ell(cx - 1.5, cy - 1.5, 5, 5), RUNAB, shade=False, outline=False)
        P(F, ell(cx - 2.5, cy - 3, 1.8, 1.8), '#ffd0d0', shade=False, outline=False)
        for k in range(8):
            a = k * math.pi / 4
            dot(F, cx + 11.5 * math.cos(a), cy + 11.5 * math.sin(a), RUNAB, layer=F.fx)
        for k in range(12):
            a = k * math.pi / 6
            dot(F, cx + 15.5 * math.cos(a), cy + 15.5 * math.sin(a), OURO2)
        rune_glyph(F, 30, gy - 40, 0)
        rune_glyph(F, 92, gy - 40, 2)
        P(F, poly((50, gy - 82), (78, gy - 82), (72, gy - 92), (56, gy - 92)), OURO2, ol='#3a2808', light=.4)
        exhaust(F, 92, gy - 82, gy - 118, col=OURO2, w=5)
        P(F, R(88, gy - 120, 97, gy - 117), OURO, ol='#3a2808')
        smk = (92, gy - 124)
        for (x, h) in ((14, 12), (20, 8), (110, 10)):
            P(F, poly((x - 3, gy), (x + 3, gy), (x + 1, gy - h)), RUNA, ol='#3a0808', light=.5)
            glow(F, x, gy - h / 2, 8, RUNAB, 70)
        wire(F, [(106, gy - 50), (116, gy - 40), (124, gy - 20), (127, gy - 14)], '#3a1a20', 1.4)
        for i in range(4):
            dot(F, 116 + i * 2, gy - 38 + i * 6, RUNAB, layer=F.fx)
    if smk:
        smoke(F, smk[0], smk[1], 4, 1.0, 1.8, dark=(lv <= 2), red=(lv == 5), seed=seed)
    if state == 'danificada':
        obj_damage(F, lv, body, seed, fires=((40, gy - 1, .9),), smokes=((36, gy - 20, 4, 1.1),),
                   loose=((114, gy + 6, 1.0), (16, gy + 5, .9)), cracks=4)
        for i in range(5):
            dot(F, 52 + rng.randint(-8, 8), gy - 40 + rng.randint(-8, 8), '#ffe08a', layer=F.fx)
    return finish(F, gy, 64, 54)


# ================= BARRACA / ALOJAMENTO =================

def mattress(F, x0, y0, x1, y1, c1='#5a7aa0', c2='#c8c0b0', pillow=True):
    yy, xx = grids(F.w, F.h)
    m = F.mask([[(x0 + 2, y0), (x1 - 2, y0), (x1, y0 + 2), (x1, y1), (x0, y1), (x0, y0 + 2)]])
    C = C0(F, c2)
    C[((xx - x0) // 3) % 2 == 0] = H(c1)
    C[yy >= y1 - 1] *= .75
    paint(F, m, C, light=.25)
    if pillow:
        P(F, ell(x0 + 7, y0 + 2.5, 6, 3), '#e8e2d0', light=.3)
    return m


def bunk(F, x0, y0, x1, y1):
    for x in (x0, x1):
        P(F, R(x - 1, y0, x, y1), '#5a6068', ol='#1a1e22')
    for y in ((y0 + y1) // 2 - 2, y1 - 5):
        P(F, R(x0, y - 3, x1, y), '#c8c0b0', light=.3)
        hline(F, x0 + 1, x1 - 1, y - 3, '#a8392e')
        P(F, R(x0, y + 1, x1, y + 2), '#5a6068', ol='#1a1e22')
    P(F, ell(x0 + 4, (y0 + y1) // 2 - 6, 3, 1.6), '#e8e2d0')


def window(F, x0, y0, x1, y1, frame=TABD, inner='#1a1418', lit=None, shutters=None, bars=False, cross=True):
    m = P(F, R(x0, y0, x1, y1), frame, light=.2)
    ins = rmask(F, x0 + 2, y0 + 2, x1 - 2, y1 - 2)
    F.a[ins, :3] = H(inner if lit is None else lit)
    if lit is not None:
        yy, xx = grids(F.w, F.h)
        dk = ins & (yy > y1 - 5)
        F.a[dk, :3] = mix(H(lit), H('#8a5a20'), .5)
    if cross:
        vline(F, (x0 + x1) // 2, y0 + 2, y1 - 2, frame)
        hline(F, x0 + 2, x1 - 2, (y0 + y1) // 2, frame)
    if bars:
        for x in range(x0 + 4, x1 - 1, 4):
            vline(F, x, y0 + 2, y1 - 2, '#3a3e44')
    if shutters:
        w = (x1 - x0) // 2 + 1
        for (a, b) in ((x0 - w, x0 - 1), (x1 + 1, x1 + w)):
            sm = rmask(F, a, y0 - 1, b, y1 + 1)
            C = C0(F, shutters)
            yy, xx = grids(F.w, F.h)
            C[(yy - y0) % 3 == 0] = mix(H(shutters), INK, .4)
            paint(F, sm, C, light=.25)
    P(F, R(x0 - 2, y1 + 1, x1 + 2, y1 + 3), frame if frame != TABD else '#6a4a2a', light=.3)
    return m


def door(F, x0, y0, x1, y1, lv):
    yy, xx = grids(F.w, F.h)
    if lv == 2:
        m = rmask(F, x0, y0, x1, y1)
        paint(F, m, T_planks(F, x0, 5, cols=(TAB2, TABD), seed=3))
        for by in (y0 + 4, y1 - 7):
            P(F, R(x0, by, x1, by + 3), RIPA)
        P(F, limb(x0 + 2, y1 - 7, x1 - 2, y0 + 7, 3), RIPA)
        dot(F, x1 - 3, (y0 + y1) // 2, PREGO)
    elif lv == 3:
        P(F, R(x0 - 3, y0 - 3, x1 + 3, y1), '#a8a49c', tex=.2)
        m = rmask(F, x0, y0, x1, y1)
        paint(F, m, T_planks(F, x0, 5, cols=('#6a4a2e', '#5a3a22'), seed=5))
        for by in (y0 + 5, y1 - 8):
            P(F, R(x0, by, x1 - 3, by + 2), FERRO)
        P(F, ell(x1 - 4, (y0 + y1) / 2, 1.6, 1.6), '#c9a84a')
    elif lv == 4:
        m = rmask(F, x0, y0, x1, y1)
        paint(F, m, T_noise(F, '#5a6a60', .2, 4, '#4a5850'))
        for (a, b, c, d) in ((x0, y0, x1, y0 + 2), (x0, y1 - 2, x1, y1), (x0, y0, x0 + 2, y1), (x1 - 2, y0, x1, y1)):
            P(F, R(a, b, c, d), MET, ol='#1a1e22')
        for yr in (y0 + 1, y1 - 1):
            rivets(F, x0 + 3, x1 - 3, yr, 4)
        P(F, R(x0 + 4, y0 + 6, x1 - 4, y0 + 12), '#2a2e34')
        P(F, R(x1 - 6, (y0 + y1) // 2, x1 - 3, (y0 + y1) // 2 + 1), '#c9ced4')
    else:
        cx = (x0 + x1) / 2
        r = (x1 - x0) / 2
        arch = F.mask(ell(cx, y0 + r, r + 3, r + 3)) & (yy <= y0 + r) | rmask(F, x0 - 3, y0 + r, x1 + 3, y1)
        paint(F, arch, C0(F, OURO2), ol='#3a2808', light=.4)
        ins = F.mask(ell(cx, y0 + r, r, r)) & (yy <= y0 + r) | rmask(F, x0, y0 + r, x1, y1)
        C = T_noise(F, '#2a2430', .2, 8, '#36303e')
        paint(F, ins, C, ol='#1a1420')
        vline(F, int(cx), y0, y1, ARD)
        P(F, ell(cx, y0 + r + 8, 4, 4), RUNA, ol='#3a0808', light=.5)
        F.flat(ell(cx + 1.6, y0 + r + 7, 3, 3), '#2a2430')
        glow(F, cx, y0 + r + 8, 12, RUNAB, 80)
        for yr in (y0 + r + 18, y1 - 6):
            hline(F, x0 + 1, x1 - 1, yr, OURO2)


def roof(F, lv, x0, x1, ye, yr, inset=0, seed=0):
    """telhado visto em 3/4: trapézio do beiral (ye) até a cumeeira (yr)."""
    pts = [(x0 - 8, ye + 4), (x1 + 8, ye + 4), (x1 + 6 - inset, yr), (x0 - 6 + inset, yr)]
    m = F.mask([pts])
    if lv == 2:
        C = T_ripas(F, 0, yr, seed=seed)
    elif lv == 3:
        C = T_tiles(F, 0, yr, seed=seed)
    elif lv == 4:
        C = T_corr(F, 0, seed=seed, rust=.58)
    else:
        C = T_slate(F, 0, yr, seed=seed)
    paint(F, m, C, light=.2)
    if lv == 3:
        P(F, R(x0 - 6 + inset, yr - 3, x1 + 6 - inset, yr + 1), TEL2, tex=.3)
        for x in range(int(x0 - 4 + inset), int(x1 + 6 - inset), 6):
            dot(F, x, yr - 2, mix(H(TEL), MOON, .25))
    elif lv == 4:
        P(F, R(x0 - 9, ye + 3, x1 + 9, ye + 6), MET, ol='#2a2e34', light=.3)
        rivets(F, x0 - 7, x1 + 7, yr + 2, 8)
        rivets(F, x0 - 7, x1 + 7, (ye + yr) // 2, 8)
    elif lv == 5:
        P(F, R(x0 - 6 + inset, yr - 4, x1 + 6 - inset, yr + 1), OURO, ol='#3a2808', light=.45)
        for x in range(int(x0 + inset), int(x1 - inset), 10):
            dot(F, x, yr - 3, '#fff0a0')
        for side in (-1, 1):
            xa = x0 - 8 if side < 0 else x1 + 8
            xb = x0 - 6 + inset if side < 0 else x1 + 6 - inset
            P(F, limb(xa, ye + 4, xb, yr, 3), OURO2, ol='#3a2808', light=.4)
        P(F, R(x0 - 9, ye + 3, x1 + 9, ye + 6), OURO2, ol='#3a2808', light=.4)
        for (px_, s) in ((x0 - 6 + inset, 1), (x1 + 6 - inset, 1)):
            P(F, poly((px_ - 3, yr - 4), (px_ + 3, yr - 4), (px_, yr - 13)), OURO, ol='#3a2808', light=.45)
    elif lv == 2:
        P(F, R(x0 - 9, ye + 3, x1 + 9, ye + 6), TABD, tex=.3)
        P(F, R(x0 - 6 + inset, yr - 3, x1 + 6 - inset, yr + 1), TAB, tex=.3)
    return m


def walls(F, lv, x0, x1, yt, gy, seed=0):
    yy, xx = grids(F.w, F.h)
    m = rmask(F, x0, yt, x1, gy)
    if lv == 2:
        C = T_planks(F, x0, 7, seed=seed)
    elif lv == 3:
        C = T_stone(F, x0, yt, ch=8, bmin=10, bmax=18, period=999, seed=seed)
        ft = rmask(F, x0, gy - 5, x1, gy)
        Cf = T_stone(F, x0, gy - 5, ch=6, bmin=16, bmax=26, cols=('#77736e', '#66625e'), period=999, seed=seed + 4)
        C[ft] = Cf[ft]
    elif lv == 4:
        C = T_brick(F, x0, yt, period=999, seed=seed)
    else:
        C = T_stone(F, x0, yt, ch=10, bmin=14, bmax=22, cols=(LPED, LPED2), mortar=ARD, period=999, seed=seed)
    dm = (yy > gy - 6) & (rnd(xx, yy, 5) < .35)
    C[dm] = mix(C[dm], H('#3a3028'), .35)
    paint(F, m, C, light=.2)
    if lv == 2:
        nails(F, x0 + 3, x1, yt + 4, 7)
        nails(F, x0 + 3, x1, gy - 5, 7)
    if lv == 4:
        for by in (yt + 10, gy - 14):
            P(F, R(x0, by, x1, by + 3), MET, ol='#2a2e34', light=.3)
            rivets(F, x0 + 3, x1 - 2, by + 1, 7)
        for x in (x0, x1 - 3):
            P(F, R(x, yt, x + 3, gy), MET, ol='#2a2e34', light=.3)
    if lv == 5:
        for (a, b) in ((yt, yt + 3), (gy - 5, gy - 1)):
            P(F, R(x0 - 1, a, x1 + 1, b), OURO2, ol='#3a2808', light=.4)
            hline(F, x0, x1, a, OURO)
        for x in (x0, x1 - 4):
            P(F, R(x, yt, x + 4, gy), LPED2, ol='#14101a', tex=.2)
            vline(F, x + 1, yt, gy, OURO2)
    under = rmask(F, x0, yt, x1, yt + 3) & m
    darken(F, under, .6)
    return m


def tent(F, gy, seed, state='intacta'):
    """N1: barraca de lona verde com lona azul caída."""
    yy, xx = grids(F.w, F.h)
    rng = np.random.RandomState(seed)
    ry = gy - 74
    lx, rx = 64, 192
    # estaias (cordas de trás)
    for (a, b, c, d) in ((lx, ry, 18, gy - 2), (rx, ry, 238, gy - 2)):
        P(F, chain(sag_pts(a, b, c, d, 3, 6), 1.3), CORDA, light=.3)
        P(F, limb(c, gy + 1, c - 2 if c < 128 else c + 2, gy - 8, 3), ESTACA)
    back = F.mask([[(lx, ry - 7), (rx, ry - 7), (rx + 4, ry), (lx - 4, ry)]])
    paint(F, back, T_canvas(F, 0, (LONA2, '#3a4e2c'), seed=seed + 1))
    front_pts = [(lx, ry), (rx, ry), (226, gy - 1), (30, gy - 1)]
    fm = F.mask([front_pts])
    C = T_canvas(F, 0, seed=seed, fold=11)
    for (px_, py_, w_, h_) in ((58, gy - 36, 16, 12), (168, gy - 54, 12, 10)):
        pm = rmask(F, px_, py_, px_ + w_, py_ + h_)
        C[pm] = H(REM) * (.95 + .08 * rnd(xx, yy, 2))[pm][..., None]
    lf = lowfreq(F.w, F.h, 6, seed + 9)
    mud = (yy > gy - 14) & (lf > .45)
    C[mud] = mix(C[mud], H('#5a4a32'), .45)
    paint(F, fm, C)
    for (px_, py_, w_, h_) in ((58, gy - 36, 16, 12), (168, gy - 54, 12, 10)):
        for xs in range(px_, px_ + w_ + 1, 2):
            dot(F, xs, py_ - 1, '#d8c89a'); dot(F, xs, py_ + h_ + 1, '#d8c89a')
        for ys in range(py_, py_ + h_ + 1, 2):
            dot(F, px_ - 1, ys, '#d8c89a'); dot(F, px_ + w_ + 1, ys, '#d8c89a')
    # entrada
    ent = F.mask([[(128, ry + 10), (152, gy - 1), (104, gy - 1)]])
    F.a[ent, :3] = H('#160f14')
    inside = ent & (yy > gy - 22)
    F.a[inside, :3] = H('#22181c')
    P(F, [[(128, ry + 10), (104, gy - 1), (92, gy - 1), (108, gy - 30)]], LONA, tex=.2, light=.3)
    P(F, chain([(98, gy - 26), (106, gy - 22), (110, gy - 26)], 1.4), CORDA)
    mattress(F, 112, gy - 12, 150, gy + 4)
    P(F, R(140, gy - 4, 147, gy + 3), '#7a5a4a', light=.2)
    # lona azul caída por cima
    tp = jag([(118, ry - 9), (200, ry - 6)], 1, rng, 6) + jag([(206, ry + 2), (214, gy - 36), (196, gy - 26), (170, gy - 40),
                                                             (148, gy - 34), (130, gy - 46), (116, ry + 8)], 2, rng, 5)
    tm = F.mask([tp])
    paint(F, tm, T_canvas(F, 0, (LONAZ, '#2f5270'), seed=seed + 4, fold=8))
    for (a, b) in ((150, gy - 34), (196, gy - 26)):
        P(F, chain(sag_pts(a, b, a + 10, gy - 1, 2, 4), 1.3), CORDA, light=.3)
        P(F, limb(a + 10, gy + 1, a + 12, gy - 7, 3), ESTACA)
    # cumeeira e mastros
    P(F, limb(lx - 4, ry - 2, rx + 4, ry - 2, 3), ESTACA, tex=.3)
    for x in (lx - 2, rx + 2):
        P(F, limb(x, ry + 4, x, ry - 14, 3.5), ESTACA, tex=.3)
        P(F, R(x - 2, ry - 4, x + 2, ry - 2), CORDA)
    body = fm | back | tm
    # props
    cr = rmask(F, 196, gy - 18, 220, gy)
    paint(F, cr, T_planks(F, 196, 6, cols=(TAB, TAB2), seed=4, horiz=True, y0=gy - 18))
    P(F, R(196, gy - 18, 198, gy), TABD)
    P(F, R(218, gy - 18, 220, gy), TABD)
    P(F, R(203, gy - 24, 210, gy - 18), '#a8aeb4', light=.4)
    P(F, ell(206.5, gy - 24, 3.5, 1.5), '#c9ced4')
    P(F, R(40, gy - 8, 52, gy), '#6a6a62', light=.3)
    P(F, R(44, gy - 10, 48, gy - 8), '#ffd36a', shade=False)
    glow(F, 46, gy - 10, 10, '#ffb04a', 70)
    return body, (lx, rx, ry)


def barraca(lv, state):
    F = Frame(256, 192)
    gy = 180
    seed = lv * 19 + {'intacta': 0, 'danificada': 1, 'destruida': 2}[state]
    rng = np.random.RandomState(seed)
    yy, xx = grids(F.w, F.h)
    x0, x1 = 34, 222
    wh = {2: 58, 3: 60, 4: 62, 5: 66}.get(lv, 0)
    yt = gy - wh
    rh = {2: 44, 3: 48, 4: 34, 5: 52}.get(lv, 0)
    inset = {2: 0, 3: 18, 4: 0, 5: 22}.get(lv, 0)
    if state == 'destruida':
        if lv == 1:
            P(F, limb(60, gy, 74, gy - 30, 3.5), ESTACA, tex=.3)
            P(F, limb(196, gy, 186, gy - 22, 3.5), ESTACA, tex=.3)
            rubble(F, 1, 128, gy + 2, 190, 22, seed=seed, beams=1, smk=2)
            P(F, [[(70, gy - 26), (110, gy - 18), (96, gy - 4), (60, gy - 6)]], LONA, tex=.3)
            P(F, [[(150, gy - 16), (196, gy - 22), (200, gy - 6), (160, gy - 2)]], LONAZ, tex=.3)
            mattress(F, 112, gy - 8, 146, gy + 4)
            darken(F, rmask(F, 112, gy - 10, 146, gy + 5), .6)
        else:
            m = walls(F, lv, x0, x1, yt, gy, seed)
            if lv == 3:
                cm = rmask(F, 66, gy - wh - 30, 82, gy - wh * .5)
                paint(F, cm, T_stone(F, 66, 0, ch=6, bmin=6, bmax=10, period=999, seed=seed + 7))
            pts = jag([(x0 - 10, gy - wh * .8), (x0 + 16, gy - wh * .95), (50, gy - wh * .6), (90, gy - wh * .5), (124, gy - wh * .62),
                       (160, gy - wh * .35), (196, gy - wh * .7), (x1 - 4, gy - wh * .9), (x1 + 10, gy - wh * .6)], 4, rng, 4)
            K = F.mask([pts + [(x1 + 20, 0), (x0 - 20, 0)]])
            cut(F, K)
            soot(F, solid(F), 128, gy - 20, 110, 30, seed, k=.55)
            if lv == 4:
                bunk(F, 150, gy - 34, 180, gy - 2)
            rubble(F, lv, 128, gy + 3, 210, 38, seed=seed, beams=3, smk=3)
            if lv == 4:
                tk = Frame(256, 192)
                P(tk, R(150, 150, 178, 176), '#3a6ab0', light=.3)
                P(tk, ell(150, 163, 4, 13), '#4a7ac0')
                tint(tk, rmask(tk, 150, 150, 178, 176) & ((grids(256, 192)[1] % 9) == 0), '#2a4a80', .6)
                paste(F, rotimg(tk.a, 12, 164, 163), 22, -4)
            if lv == 2:
                P(F, chain([(150, gy - 10), (170, gy - 4), (190, gy - 12)], 3), '#c8323a')
            elif lv == 5:
                P(F, limb(206, gy - 2, 226, gy - 60, 3), OURO2, ol='#3a2808')
                P(F, [[(226, gy - 60), (240, gy - 56), (236, gy - 48), (226, gy - 48)]], '#6a1a20')
            else:
                mattress(F, 100, gy - 6, 130, gy + 4, c1='#8a3a2e', c2='#c8b8a0', pillow=False)
                darken(F, rmask(F, 100, gy - 8, 130, gy + 5), .7)
        return finish(F, gy, 128, 110)
    if lv == 1:
        body, (lx, rx, ry) = tent(F, gy, seed)
        if state == 'danificada':
            K = F.mask([jag([(70, gy - 60), (92, gy - 66), (100, gy - 50), (84, gy - 40), (66, gy - 46), (70, gy - 60)], 2.5, rng, 3)])
            F.a[K & solid(F), :3] = H('#160f14')
            edge = dilate(K) & ~K & solid(F)
            F.a[edge, :3] = H('#2e3a22')
            obj_damage(F, 1, body, seed, fires=((176, gy - 1, 1.0),), smokes=((84, gy - 66, 4, 1.1), (178, gy - 16, 3, .9)),
                       loose=((222, gy + 6, 1.1), (40, gy + 6, 1.0)), cracks=0, soots=2)
            P(F, limb(rx + 2, ry + 4, rx + 12, ry - 10, 3.5), ESTACA, tex=.3)
        return finish(F, gy, 128, 106)
    # telhado e paredes
    ye = yt
    yr = ye - rh
    body = np.zeros((F.h, F.w), bool)
    if lv == 3:   # chaminé atrás do telhado
        cm = rmask(F, 66, yr - 22, 82, yr + 14)
        paint(F, cm, T_stone(F, 66, yr - 22, ch=6, bmin=6, bmax=10, period=999, seed=seed + 7))
        P(F, R(64, yr - 26, 84, yr - 22), '#a8a49c', tex=.2)
        body |= cm
    if lv == 5:   # mastro com bandeira
        P(F, R(196, yr - 52, 198, yr + 6), OURO2, ol='#3a2808', light=.4)
        P(F, ell(197, yr - 54, 2.6, 2.6), OURO, ol='#3a2808')
        fp = [(199, yr - 50), (222, yr - 47), (216, yr - 40), (224, yr - 33), (199, yr - 34)]
        fm = F.mask([fp])
        C = C0(F, RUNA)
        C[((xx - 199) % 6) < 2] *= .8
        paint(F, fm, C, light=.3)
        P(F, ell(208, yr - 42, 3.5, 3.5), OURO, ol='#3a2808')
        F.flat(ell(209.5, yr - 43, 2.8, 2.8), RUNA)
    wm = walls(F, lv, x0, x1, yt, gy, seed)
    rm = roof(F, lv, x0, x1, ye, yr, inset, seed)
    body |= wm | rm
    darken(F, rmask(F, x0, ye + 5, x1, ye + 8) & wm, .62)
    # fachada por nível
    if lv == 2:
        door(F, 62, gy - 42, 84, gy - 1, 2)
        window(F, 104, gy - 44, 126, gy - 26, shutters=None)
        P(F, R(102, gy - 47, 128, gy - 45), TAB2)
        # rede na varanda
        for x in (150, 214):
            P(F, R(x - 2, gy - 52, x + 2, gy + 1), TAB2, tex=.35)
            P(F, R(x - 3, gy - 54, x + 3, gy - 52), TABD)
        hm = F.mask([sag_pts(152, gy - 40, 212, gy - 40, 22, 14) + sag_pts(212, gy - 38, 152, gy - 38, -12, 14)])
        C = C0(F, '#c8323a')
        band = ((xx - 150) // 4) % 4
        C[band == 1] = H('#e8b830')
        C[band == 2] = H('#3a8a5a')
        C[band == 3] = H('#e8e0d0')
        paint(F, hm, C, light=.3)
        for (a, b) in ((152, 212),):
            P(F, chain([(150, gy - 46), (156, gy - 40)], 1.2), CORDA)
            P(F, chain([(214, gy - 46), (208, gy - 40)], 1.2), CORDA)
        for x in range(158, 208, 3):
            t = (x - 152) / 60
            y = gy - 40 + 22 * math.sin(math.pi * t) + 1
            vline(F, x, int(y), int(y) + 2, '#e8b830')
        # barril e banco
        drum(F, 38, 56, gy, 20, '#7d5430', seed)
        for yb in (gy - 6, gy - 14):
            hline(F, 38, 56, yb, '#3a3e44')
        P(F, R(96, gy - 10, 132, gy - 6), '#8a6a42', tex=.3)
        for x in (100, 126):
            P(F, ell(x, gy - 3, 4, 3.5), '#7a5a38', light=.25)
            F.flat(ell(x - .5, gy - 4, 2, 1.4), '#c8a070')
        P(F, ell(96, gy - 8, 2.5, 2.5), '#c8a070')
    elif lv == 3:
        door(F, 58, gy - 40, 80, gy - 1, 3)
        window(F, 110, gy - 46, 140, gy - 22, frame='#d8d2c2', inner='#1e1418', shutters='#3a6a4a', cross=False)
        mattress(F, 114, gy - 31, 136, gy - 25, c1='#a8302a', c2='#c8504a', pillow=True)
        vline(F, 125, gy - 44, gy - 24, '#d8d2c2')
        window(F, 176, gy - 44, 196, gy - 26, frame='#d8d2c2', shutters='#3a6a4a')
        # cisterna e vaso
        P(F, ell(212, gy - 4, 12, 5), '#77736e', tex=.25)
        P(F, R(200, gy - 18, 224, gy - 4), '#8e8a84', tex=.3)
        P(F, ell(212, gy - 18, 12, 4), '#a8a49c')
        F.flat(ell(212, gy - 18, 9, 2.6), '#2a3a4a')
        dot(F, 209, gy - 19, '#8ab0c8')
        P(F, [[(40, gy), (38, gy - 12), (52, gy - 12), (50, gy)]], '#b5562e', light=.3)
        for i in range(10):
            dot(F, 44 + rng.randint(-5, 6), gy - 13 - rng.randint(0, 9), rng.choice(['#4e6a34', '#6a8a44', '#c8323a']))
        smoke(F, 74, yr - 30, 4, .9, 2.0, seed=seed)
    elif lv == 4:
        door(F, 56, gy - 44, 80, gy - 1, 4)
        P(F, R(60, gy - 52, 76, gy - 49), MET, ol='#2a2e34')
        lamp(F, 68, gy - 55, r=30)
        window(F, 104, gy - 46, 150, gy - 18, frame='#5a6068', lit='#e8b860', bars=True, cross=False)
        bunk(F, 110, gy - 44, 140, gy - 20)
        for x in range(108, 150, 4):
            vline(F, x, gy - 44, gy - 20, '#3a3e44')
        window(F, 172, gy - 46, 196, gy - 26, frame='#5a6068', lit='#c89850', bars=True, cross=False)
        # caixa-d'água azul
        cx = 186
        P(F, R(cx - 16, yr - 4, cx + 16, yr), '#5a6068')
        tank = F.mask(R(cx - 14, yr - 30, cx + 14, yr - 4)) | F.mask(ell(cx, yr - 4, 14, 3))
        C = C0(F, '#3a6ab0')
        C[xx < cx - 8] = mix(C[xx < cx - 8], MOON, .18)
        C[xx > cx + 8] *= .78
        for ry_ in (yr - 22, yr - 12):
            C[np.abs(yy - ry_) < 1] *= .8
        paint(F, tank, C)
        P(F, ell(cx, yr - 30, 14, 4), '#4a7ac0', light=.3)
        P(F, ell(cx, yr - 31, 6, 2), '#2a4a80')
        P(F, R(cx + 12, yr - 10, cx + 15, ye + 12), '#8a9098')
        P(F, R(30, gy - 2, 226, gy + 1), '#6a6a62', tex=.3)
    else:
        door(F, 58, gy - 50, 84, gy - 1, 5)
        window(F, 108, gy - 50, 146, gy - 22, frame=OURO2, lit='#8a1a24', cross=False)
        mattress(F, 112, gy - 32, 142, gy - 26, c1='#c8323a', c2='#7a1a20')
        for x in (127,):
            vline(F, x, gy - 48, gy - 24, OURO2)
        hline(F, 110, 144, gy - 38, OURO2)
        glow(F, 127, gy - 36, 26, RUNAB, 80)
        rune_glyph(F, 164, gy - 44, 1)
        rune_glyph(F, 196, gy - 44, 3)
        rune_glyph(F, 44, gy - 44, 2)
        # braseiro
        bx = 228
        P(F, poly((bx - 8, gy - 22), (bx + 8, gy - 22), (bx + 5, gy - 14), (bx - 5, gy - 14)), OURO2, ol='#3a2808', light=.4)
        P(F, R(bx - 1, gy - 14, bx + 1, gy), OURO2)
        P(F, R(bx - 5, gy - 2, bx + 5, gy), OURO2)
        flame(F, bx, gy - 22, 1.4, red=True)
    if state == 'danificada':
        # buraco no telhado
        hx, hy = (150, (ye + yr) // 2 + 4)
        K = F.mask([jag([(hx - 14, hy - 8), (hx + 4, hy - 12), (hx + 16, hy - 4), (hx + 8, hy + 8), (hx - 12, hy + 6), (hx - 14, hy - 8)], 2.5, rng, 3)])
        F.a[K & rm, :3] = H('#140c10')
        for i in range(3):
            P(F, limb(hx - 12 + i * 10, hy - 9, hx - 8 + i * 9, hy + 7, 2.4), VIGA if lv != 4 else '#3a3e44')
        cut(F, F.mask(ell(hx, hy, 1, 1)))
        notch = None
        obj_damage(F, lv, wm, seed, fires=((hx + 12, hy + 2, 1.0), (196, gy - 1, .9)),
                   smokes=((hx, hy - 10, 4, 1.2), (198, gy - 16, 3, .9)),
                   loose=((228, gy + 6, 1.2), (36, gy + 6, 1.0), (110, gy + 7, .9)), cracks=5, soots=2)
        soot(F, rm, hx, hy, 30, 14, seed + 2, k=.5)
    return finish(F, gy, 128, 112)


# ================= SAÍDA =================

LV = range(1, 6)
EST = ('intacta', 'danificada', 'destruida')


def build(which=None):
    os.makedirs(OUT, exist_ok=True)
    jobs = {
        'con_barraca': lambda: [barraca(lv, s) for s in EST for lv in LV],
        'con_gerador': lambda: [gerador(lv, s) for s in EST for lv in LV],
        'con_barricada': lambda: [barricada(lv, s) for s in EST for lv in LV],
        'con_muralha': lambda: [muralha(lv, k) for k in ('reto', 'rachado', 'canto', 'brecha') for lv in LV],
        'con_portao': lambda: [portao(lv, k) for k in ('aberto', 'fechado', 'danificado') for lv in LV],
    }
    for k, fn in jobs.items():
        if which and k not in which:
            continue
        img = grid(fn(), 5)
        img.save(os.path.join(OUT, k + '.png'))
        print(k, img.size)


if __name__ == '__main__':
    build(sys.argv[1:] or None)
