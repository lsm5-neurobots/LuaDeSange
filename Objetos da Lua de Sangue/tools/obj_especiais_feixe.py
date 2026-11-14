"""Laser e Kamehameha (grupo especiais_feixe): gera sprites/lsr_*.png e sprites/kmh_*.png.
Rodar de dentro de tools/:  python obj_especiais_feixe.py
"""
import os
import sys
import math
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pixkit import *  # noqa

ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'sprites')
PI2 = math.pi * 2


# ================================================================ utilidades

def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def blank(w, h):
    return np.zeros((h, w, 4), np.uint8)


def grid_xy(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    return xx.astype(float), yy.astype(float)


def put(L, x, y, col, a=255):
    x, y = int(round(x)), int(round(y))
    h, w = L.shape[:2]
    if 0 <= x < w and 0 <= y < h:
        L[y, x, :3] = C(col)
        L[y, x, 3] = a


def putmax(L, x, y, col, a=255):
    """só pinta se alfa atual for menor (para não apagar camadas fortes)."""
    x, y = int(round(x)), int(round(y))
    h, w = L.shape[:2]
    if 0 <= x < w and 0 <= y < h and L[y, x, 3] <= a:
        L[y, x, :3] = C(col)
        L[y, x, 3] = a


def ln(L, x0, y0, x1, y1, col, a=255):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / n
        put(L, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, col, a)


def bands(field, layers, dith):
    """camadas nítidas por limiar (de fora para dentro); borda pontilhada de 1 px entre camadas."""
    h, w = field.shape
    xx, yy = grid_xy(w, h)
    chk = ((xx + yy) % 2) == 0
    out = blank(w, h)
    for thr, col, a in layers:
        m = (field < thr) | ((field < thr + dith) & chk)
        out[m, :3] = C(col)
        out[m, 3] = a
    return out


def mote(L, x, y, big=False, cols=('#ffffff', '#7ff4ff', '#2b8ff0')):
    """partícula de energia: núcleo branco, cruz ciano, cantos azuis."""
    put(L, x, y, cols[0])
    if big:
        put(L, x + 1, y, cols[0]); put(L, x, y + 1, cols[0]); put(L, x + 1, y + 1, cols[1])
        for dx, dy in ((-1, 0), (2, 0), (0, -1), (1, -1), (-1, 1), (2, 1), (0, 2), (1, 2)):
            putmax(L, x + dx, y + dy, cols[1], 230)
        for dx, dy in ((-1, -1), (2, -1), (-1, 2), (2, 2)):
            putmax(L, x + dx, y + dy, cols[2], 150)
    else:
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            putmax(L, x + dx, y + dy, cols[1], 220)
        for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
            putmax(L, x + dx, y + dy, cols[2], 110)


def streak(L, x, y, ang, n, cols=('#ffffff', '#7ff4ff', '#2b8ff0')):
    """faísca: cabeça em (x,y), rastro de n px na direção ang (graus)."""
    ca, sa = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    for i in range(n):
        t = i / max(1, n - 1)
        c = cols[0] if i == 0 else (cols[1] if t < .6 else cols[2])
        a = 255 if t < .6 else 170
        put(L, x + ca * i, y + sa * i, c, a)


def zigzag(L, p0, p1, seg, amp, rng, core='#ffffff', edge='#8ff0ff', ea=190):
    x0, y0 = p0
    x1, y1 = p1
    L_ = math.hypot(x1 - x0, y1 - y0)
    n = max(2, int(L_ / seg))
    nx, ny = -(y1 - y0) / L_, (x1 - x0) / L_
    pts = [(x0, y0)]
    for i in range(1, n):
        t = i / n
        o = (rng.rand() * 2 - 1) * amp
        pts.append((x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o))
    pts.append((x1, y1))
    for (a, b) in zip(pts[:-1], pts[1:]):
        ln(L, a[0], a[1] - 1, b[0], b[1] - 1, edge, ea)
    for (a, b) in zip(pts[:-1], pts[1:]):
        ln(L, a[0], a[1], b[0], b[1], core)


def glowL(w, h, cx, cy, r, col, alpha):
    F = Frame(w, h)
    glow(F, cx, cy, r, col, alpha)
    return F.fx


def alpha_mul(L, k):
    o = L.copy()
    o[..., 3] = (o[..., 3].astype(float) * k).astype(np.uint8)
    return o


def blob(cx, cy, rx, ry, seed, amp=.18, n=48, ks=(3, 5, 7, 11)):
    rng = np.random.RandomState(seed)
    ph = rng.rand(len(ks)) * PI2
    am = rng.rand(len(ks)) * amp
    pts = []
    for i in range(n):
        a = PI2 * i / n
        f = 1 + sum(am[j] * math.sin(ks[j] * a + ph[j]) for j in range(len(ks)))
        pts.append((cx + rx * f * math.cos(a), cy + ry * f * math.sin(a)))
    return [pts]


def hashm(w, h, seed=0):
    xx, yy = np.mgrid[0:w, 0:h]
    xx, yy = xx.T, yy.T
    return ((xx * 73856093) ^ (yy * 19349663) ^ (seed * 83492791)) % 97


def fillm(L, m, col, a=255, tex=None, texcol=None, seed=0):
    L[m, :3] = C(col)
    L[m, 3] = a
    if tex:
        h, w = m.shape
        t = m & (hashm(w, h, seed) < int(97 * tex))
        L[t, :3] = C(texcol)


def ell_field(w, h, cx, cy, rx, ry):
    xx, yy = grid_xy(w, h)
    return np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)


def ring_mask(w, h, cx, cy, rx, ry, t0, t1):
    q = ell_field(w, h, cx, cy, rx, ry)
    return (q >= t0) & (q < t1)


def crack_paths(cx, cy, rng, n, lmin, lmax, rx=0, ry=0, flat=.42):
    """rachaduras ramificadas saindo de (cx,cy) (ou da elipse rx,ry). retorna lista de polilinhas."""
    paths = []
    for i in range(n):
        a = PI2 * (i + rng.rand() * .6) / n
        sx, sy = cx + rx * math.cos(a), cy + ry * math.sin(a)
        L_ = lmin + rng.rand() * (lmax - lmin)
        pts = [(sx, sy)]
        x, y, ang = sx, sy, a
        steps = int(L_ / 4)
        for s in range(steps):
            ang += (rng.rand() - .5) * .9
            x += math.cos(ang) * 4
            y += math.sin(ang) * 4 * flat
            pts.append((x, y))
            if s == steps // 2 and rng.rand() < .7:
                b = ang + (rng.rand() - .5) * 2.2
                bx, by = x, y
                br = [(bx, by)]
                for k in range(int(steps / 2)):
                    b += (rng.rand() - .5) * .8
                    bx += math.cos(b) * 3
                    by += math.sin(b) * 3 * flat
                    br.append((bx, by))
                paths.append(br)
        paths.append(pts)
    return paths


def draw_paths(L, paths, col, a=255, thick=False):
    for p in paths:
        for i, (u, v) in enumerate(zip(p[:-1], p[1:])):
            ln(L, u[0], u[1], v[0], v[1], col, a)
            if thick and i < len(p) // 2:
                ln(L, u[0] + 1, u[1], v[0] + 1, v[1], col, a)


def wisp(L, x, y, hgt, ph, col='#6a6270', a=170):
    """fiapo de fumaça: linha sinuosa, 2 px embaixo e 1 px em cima, alfa caindo."""
    for t in range(int(hgt)):
        k = t / hgt
        xx = x + 2.2 * math.sin(t * .32 + ph) * (.4 + k)
        al = int(a * (1 - k * .7))
        if (t + int(ph * 3)) % 7 == 6 and k > .5:
            continue
        putmax(L, xx, y - t, col, al)
        if k < .55:
            putmax(L, xx + 1, y - t, col, int(al * .8))


def ell_glow(w, h, cx, cy, rx, ry, cols, a=1.0):
    q = ell_field(w, h, cx, cy, rx, ry)
    lay = [(1.0, cols[0], int(60 * a)), (.7, cols[1], int(90 * a)), (.42, cols[2], int(120 * a))]
    return bands(q, lay, .06)


def stack(*layers):
    out = layers[0].copy()
    for l in layers[1:]:
        out = over(out, l)
    return out


def save(name, frames, cols=None):
    os.makedirs(OUT, exist_ok=True)
    im = strip(frames) if cols is None else grid(frames, cols)
    im.save(os.path.join(OUT, name + '.png'))
    print(name, len(frames), 'quadros', im.size)


# ================================================================ paletas de energia

LSR = [(2.2, '#1a3c9c', 90), (1.85, '#2163d0', 140), (1.45, '#2b8ff0', 190), (1.0, '#2fd2ff', 255),
       (0.72, '#7ff4ff', 255), (0.4, '#e6feff', 255), (0.22, '#ffffff', 255)]
KMH = [(2.6, '#2230a8', 80), (2.25, '#2c48d0', 120), (1.9, '#3a6ae8', 165), (1.6, '#6aa8ff', 230),
       (1.3, '#8cc4ff', 255), (1.0, '#5ff2ff', 255), (0.75, '#a8fbff', 255), (0.45, '#ffffff', 255)]
GLD = [(2.6, '#8a3a10', 90), (2.25, '#b8601a', 130), (1.9, '#e0901f', 170), (1.6, '#f2c230', 235),
       (1.3, '#ffd95a', 255), (1.0, '#fff0a0', 255), (0.75, '#fffbe0', 255), (0.45, '#ffffff', 255)]
ORB = [(1.45, '#2c48d0', 110), (1.2, '#3a6ae8', 170), (1.0, '#8cc4ff', 255), (0.72, '#5ff2ff', 255),
       (0.5, '#a8fbff', 255)]
ORBG = [(1.45, '#b8601a', 120), (1.2, '#e0901f', 180), (1.0, '#f2c230', 255), (0.72, '#ffe68a', 255),
        (0.5, '#fffbe0', 255)]
CY = ('#ffffff', '#7ff4ff', '#2b8ff0')
GC = ('#ffffff', '#ffe68a', '#e0901f')


def scale_layers(layers, k):
    return [(t * k, c, a) for t, c, a in layers]


# ================================================================ feixe horizontal genérico

def beam_field(w, h, cy, x0, x1, hw, wob=.06, per=32, ph=0):
    xx, yy = grid_xy(w, h)
    dx = np.maximum(np.maximum(x0 - xx, 0), xx - x1)
    d = np.sqrt(dx ** 2 + (yy - cy) ** 2)
    xc = np.clip(xx, x0, x1)
    hwx = hw * (1 + wob * np.sin(PI2 * (xc + ph) / per))
    return d / hwx, 1.0 / hwx


def beam_details(L, field, w, h, ph, inner=(.4, 1.0), streak_col='#b8faff', halo=(1.0, 2.2), dot_col='#8fd8ff',
                 period=32):
    """riscos que correm dentro do corpo + pontinhos no halo (tileável em 128)."""
    xx, yy = grid_xy(w, h)
    xi, yi = xx.astype(int), yy.astype(int)
    rowoff = (yi * 37) % period
    rowlen = 5 + (yi * 13) % 9
    body = (field > inner[0]) & (field < inner[1])
    dash = (((xi + ph + rowoff) % period) < rowlen) & ((yi % 3) != 0)
    m = body & dash
    L[m, :3] = mix(L[m, :3].astype(float), C(streak_col), .65)
    hal = (field > halo[0] + .1) & (field < halo[1])
    hh = ((((xi + ph) % 128) * 73856093) ^ (yi * 19349663)) % 97
    md = hal & (hh < 3)
    L[md, :3] = C(dot_col)
    L[md, 3] = 220


def flare_map(fr):
    """clarões: corpo/núcleo maiores e halo mais curto que o do feixe."""
    return np.interp(fr, [0, .4, .6, .85, 1.1, 1.3, 1.5, 1.7, 3], [0, .22, .4, .72, 1.0, 1.45, 1.85, 2.2, 4])


# ================================================================ LSR_ARMA

class Shifted:
    """proxy de Frame que desloca tudo em x."""

    def __init__(self, F, dx):
        self.F, self.dx, self.a = F, dx, F.a

    def part(self, shapes, *a, **k):
        return self.F.part(mv(shapes, self.dx, 0), *a, **k)

    def flat(self, shapes, *a, **k):
        return self.F.flat(mv(shapes, self.dx, 0), *a, **k)

    def px(self, x, y, *a, **k):
        return self.F.px(x + self.dx, y, *a, **k)


def draw_gun(F0, hot=0.0, cell=1.0):
    F = Shifted(F0, -7)
    def H(c, t=None):
        t = hot if t is None else t
        if t <= 0:
            return c
        return mix(C(c), C('#e83a2a'), t * .55) + np.array([30, 10, 0]) * t
    # cabos de trás (sombra) e alça
    # coronha
    F.part(poly((12, 31), (30, 27), (33, 40), (17, 47), (12, 45)), '#8a6a42', tex=.25,
           marks=[(poly((14, 36), (28, 31), (28, 32), (14, 37)), '#6a4e30'), (poly((16, 42), (24, 38), (24, 39), (16, 43)), '#6a4e30')])
    F.part(poly((9, 31), (13, 30), (14, 46), (9, 46)), '#2e2a2e')
    for x in (20,):
        F.part(poly((x, 28), (x + 3, 28), (x + 4, 45), (x + 1, 46)), '#9a9a92', light=.35,
               marks=[(poly((x, 33), (x + 4, 33), (x + 4, 34), (x, 34)), '#7a7a74')])
    F.px(26, 33, '#c9c3b0'); F.px(28, 38, '#c9c3b0')
    # tubo traseiro
    F.part(poly((29, 29), (37, 29), (37, 37), (29, 37)), '#6b6a66')
    # punho e guarda-mato
    F.part(poly((44, 38), (53, 38), (51, 56), (41, 56), (42, 47)), '#3a3438', tex=.2,
           marks=[(poly((43, 46), (52, 46), (52, 47), (43, 47)), '#24202a'),
                  (poly((43, 50), (52, 50), (52, 51), (43, 51)), '#24202a')])
    F.part(poly((53, 40), (62, 40), (62, 49), (54, 49), (54, 47), (60, 47), (60, 42), (53, 42)), '#2a2a2e')
    F.part(poly((55, 41), (57, 41), (57, 45), (56, 46)), '#5a5a60', outline=False)
    # capacitores sob o cano
    for x in (76, 86):
        F.part(poly((x, 37), (x + 9, 37), (x + 9, 44), (x, 44)), '#3f6a8c', light=.3,
               marks=[(poly((x, 39), (x + 9, 39), (x + 9, 40), (x, 40)), '#9fc0d8'),
                      (poly((x + 7, 37), (x + 9, 37), (x + 9, 44), (x + 7, 44)), '#2b4a63')])
    # cano
    F.part(poly((72, 27), (116, 27), (116, 35), (72, 35)), H('#6b747a'), tex=.15,
           marks=[(poly((72, 28), (116, 28), (116, 29), (72, 29)), H('#8d969c'))])
    # carcaça do micro-ondas
    rust = [(blob(39, 37, 4, 2, 3), '#8a4e2e'), (blob(60, 22, 3, 1.5, 5), '#8a4e2e'),
            (blob(50, 38, 2.5, 1.4, 9), '#6b4a3a')]
    vents = [(poly((38, y), (58, y), (58, y + 1), (38, y + 1)), '#5a544c') for y in (25, 28, 31, 34)]
    F.part(poly((34, 20), (75, 20), (75, 41), (34, 41)), '#d8d2c2', tex=.28, marks=vents + rust)
    # painel frontal
    F.part(poly((64, 22), (73, 22), (73, 39), (64, 39)), '#3a3a40', light=.15,
           marks=[(poly((65, 23), (72, 23), (72, 26), (65, 26)), '#123a1c')])
    for i, x in enumerate((66, 68, 70)):
        for y in (29, 32, 35):
            F.px(x, y, '#9a9aa2' if (i + y) % 2 else '#c9c3b0')
    for x in (66, 67, 69, 70):
        F.px(x, 24, '#6fdc7a')
    F.px(68, 24, '#3a8a4a')
    # adesivo de alerta
    F.part(poly((44, 33), (49, 33), (46.5, 28.5)), '#f2c230', light=.1, ol='#3a2a08')
    F.px(46, 31, '#1c1822')
    for (x, y) in ((36, 22), (62, 22), (36, 39), (62, 39)):
        F.px(x, y, '#c9ced4'); F.px(x + 1, y + 1, '#5a544c')
    # mira traseira
    F.part(poly((35, 16), (39, 16), (39, 20), (35, 20)), '#3a3a40')
    F.part(poly((36, 14), (38, 14), (38, 16), (36, 16)), '#6b6a66', outline=False)
    # bobinas de cobre
    F.part(poly((76, 24), (97, 24), (97, 38), (76, 38)), H('#b86a32', hot * 1.1), light=.35)
    for x in range(78, 96, 2):
        for y in range(25, 38):
            F.px(x, y, H('#7a3e1a', hot) if y < 35 else H('#5a2a12', hot))
        F.px(x - 1, 26, H('#f0b070', hot)); F.px(x - 1, 27, H('#e8a060', hot))
    for x in (79, 85, 91):
        F.px(x, 31, H('#d8904a', hot))
    F.part(poly((75, 23), (77, 23), (77, 39), (75, 39)), '#4a4a52')
    F.part(poly((96, 23), (98, 23), (98, 39), (96, 39)), '#4a4a52')
    # aletas
    for k in range(6):
        x = 99 + k * 3
        F.part(poly((x, 21), (x + 2, 21), (x + 2, 41), (x, 41)), H('#9aa2a8', hot * 1.3), light=.4)
    # boca / emissor
    F.part(poly((115, 25), (121, 25), (122, 37), (115, 37)), H('#3a3a40', hot * .6))
    F.part(ell(119.5, 31, 2.6, 3.4), '#1f6f8f' if cell > 0 else '#1a2a34', shade=False, ol='#0c1a22')
    F.px(119, 30, '#7ff4ff' if cell > 0 else '#3a5a6a')
    # célula de energia em cima
    F.part(poly((42, 12), (60, 12), (60, 20), (42, 20)), '#2fd2ff' if cell else '#2a3a44', shade=False, ol='#0c2a3a')
    if cell:
        for x in range(43, 60):
            F.px(x, 15, '#e6feff'); F.px(x, 16, '#ffffff' if x % 4 else '#e6feff')
            F.px(x, 13, '#7ff4ff'); F.px(x, 18, '#2b8ff0'); F.px(x, 19, '#2163d0')
    F.part(poly((39, 11), (43, 11), (43, 21), (39, 21)), '#7d848c', light=.35)
    F.part(poly((59, 11), (63, 11), (63, 21), (59, 21)), '#7d848c', light=.35)
    for x in (48, 54):
        F.part(poly((x, 11), (x + 2, 11), (x + 2, 22), (x, 22)), '#4a4a52')
    F.px(41, 13, '#c9ced4'); F.px(61, 13, '#c9ced4')
    # cabos
    F.part(chain([(63, 15), (70, 15), (74, 19), (78, 24)], 2.2), '#c8323a', light=.3)
    F.part(chain([(63, 18), (68, 19), (72, 22), (82, 24)], 2.2), '#2a2228')


def gun_frame(state):
    w, h = 128, 64
    F = Frame(w, h)
    hot = 0.0
    if state in ('hot1', 'hot2'):
        hot = 1.0 if state == 'hot1' else .85
    draw_gun(F, hot=hot)
    base = blank(w, h)
    mx, my = 113, 31
    fxs = []
    if state == 'normal':
        fxs.append(glowL(w, h, 44, 16, 9, '#2fd2ff', 60))
    if state.startswith('ch') or state.startswith('full'):
        k = {'ch1': 0, 'ch2': 1, 'ch3': 2, 'fullA': 3, 'fullB': 4}[state]
        R = [3.5, 5.5, 7.5, 9.5, 11][k]
        fxs.append(glowL(w, h, mx, my, R * 2.6, '#2b8ff0', 150))
        fxs.append(glowL(w, h, 44, 16, 10 + k, '#2fd2ff', 80 + k * 10))
        xx, yy = grid_xy(w, h)
        r = np.sqrt((xx - mx) ** 2 + (yy - my) ** 2)
        th = np.arctan2(yy - my, xx - mx)
        f = r / (R * (1 + .12 * np.sin(5 * th + k)))
        E = bands(f, scale_layers(LSR, .62), 1.0 / R)
        P = blank(w, h)
        rng = np.random.RandomState(10 + k)
        n = [8, 10, 12, 12, 12][k]
        for i in range(n):
            a = rng.rand() * PI2
            d = R * 1.5 + 4 + rng.rand() * (24 - 3 * min(k, 3))
            x, y = mx + math.cos(a) * d - 4, my + math.sin(a) * d * .8
            if state.startswith('full'):
                mote(P, x, y, big=rng.rand() < .3)
            else:
                streak(P, x, y, math.degrees(math.atan2(y - my, x - mx)), 3 + k + int(rng.rand() * 3))
        if state.startswith('full'):
            L = 9 + (4 if state == 'fullB' else 0)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                for i in range(int(R), int(R) + L):
                    put(P, mx + dx * i, my + dy * i, '#ffffff' if i < R + L * .5 else '#7ff4ff')
            for dx, dy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
                for i in range(int(R * .7), int(R * .7) + L // 2):
                    put(P, mx + dx * i, my + dy * i, '#7ff4ff', 220)
        fxs += [E, P]
    if hot:
        fxs.insert(0, glowL(w, h, 99, 31, 20, '#e83a2a', 110))
        fxs.insert(0, glowL(w, h, 81, 31, 14, '#ff8a2a', 70))
        V = Frame(w, h)
        off = 0 if state == 'hot1' else 1
        pts = [(100, 16, 4), (108, 10, 3), (92, 13, 3), (112, 20, 2.5)] if not off else \
              [(102, 12, 4.5), (110, 6, 3.5), (94, 9, 3.5), (106, 19, 2.5)]
        for (x, y, r) in pts:
            puff(V, x, y, r, '#d8d4dc')
        fxs.append(alpha_mul(V.fx, .85))
        # brilho quente nas aletas
        P = blank(w, h)
        for k in range(6):
            x = 92 + k * 3
            for y in range(25, 37):
                if (y + k) % 4 == 0:
                    put(P, x, y, '#ffd36a')
        fxs.append(P)
    if state == 'loot':
        sh = shadow_layer(64, 52, 3.6, 95, w, h, gy=55)
        G = glowL(w, h, 64, 52, 46, '#4a8fe0', 70)
        spr = compose(F)
        im = Image.fromarray(spr, 'RGBA').rotate(4, resample=Image.NEAREST, center=(64, 32))
        spr = np.zeros_like(spr)
        spr[6:] = np.array(im)[:-6]
        P = blank(w, h)
        sp = Frame(w, h)
        sparkle(sp, 30, 20, 3, '#cfe4ff')
        sparkle(sp, 104, 46, 2, '#cfe4ff')
        return stack(base, sh, G, spr, sp.fx)
    spr = compose(F)
    under, rest = (fxs[:2], fxs[2:]) if hot else ([], fxs)
    return stack(base, *under, spr, *rest)


def make_lsr_arma():
    st = ['normal', 'ch1', 'ch2', 'ch3', 'fullA', 'fullB', 'hot1', 'hot2', 'loot']
    save('lsr_arma', [gun_frame(s) for s in st])


# ================================================================ LSR_FEIXE

W1, H1, CY1, HW1 = 128, 64, 32, 7.0


def lsr_piece(kind, i=0):
    w, h, cy = W1, H1, CY1
    ph = i * 11
    xx, yy = grid_xy(w, h)
    extra = []
    if kind == 'mid':
        s = [.88, 1.0, 1.12][i]
        f, dth = beam_field(w, h, cy, -200, 400, HW1 * s, ph=0)
        E = bands(f, LSR, dth)
        beam_details(E, f, w, h, ph)
        return E
    if kind == 'fade':
        s = [.5, .22, .07][i]
        al = [.85, .6, .45][i]
        f, dth = beam_field(w, h, cy, -200, 400, HW1 * s, wob=.03)
        lay = [(t, c, a) for t, c, a in LSR]
        E = bands(f, lay, dth * 0 + .0)
        if i == 2:
            E = blank(w, h)
            E[cy, :, :3] = C('#ffffff'); E[cy, :, 3] = 255
            for x in range(w):
                for d in (-1, 1):
                    E[cy + d, x, :3] = C('#7ff4ff'); E[cy + d, x, 3] = 150 if (x + (d > 0)) % 2 else 90
                if x % 2 == 0:
                    E[cy - 2, x, :3] = C('#2163d0'); E[cy - 2, x, 3] = 70
                else:
                    E[cy + 2, x, :3] = C('#2163d0'); E[cy + 2, x, 3] = 70
            for x in range(0, w, 16):
                for d in range(2):
                    E[cy, (x + 5 + d) % w, :3] = C('#e6feff')
        else:
            beam_details(E, f, w, h, 7 * i)
            # o halo perde força primeiro
            hal = f > 1.0
            E[hal, 3] = (E[hal, 3] * al).astype(np.uint8)
        return E
    if kind == 'start':
        mx = 24
        f, dth = beam_field(w, h, cy, mx, 400, HW1)
        r = np.sqrt((xx - mx) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - mx)
        star4 = np.abs(np.cos(2 * th)) ** 6
        fr = r / (10 * (1 + .45 * star4))
        E = bands(np.minimum(f, flare_map(fr)), LSR, dth)
        beam_details(E, f, w, h, 0)
        G = glowL(w, h, mx, cy, 30, '#2b8ff0', 120)
        P = blank(w, h)
        for (dx, dy, L) in ((0, -1, 26), (0, 1, 26), (-1, 0, 14), (1, -1, 12), (1, 1, 12), (-1, -1, 9), (-1, 1, 9)):
            for k in range(6, L):
                c = '#ffffff' if k < L * .65 else '#7ff4ff'
                put(P, mx + dx * k, cy + dy * k, c, 255 if k < L * .8 else 170)
        rng = np.random.RandomState(3)
        for k in range(6):
            a = rng.rand() * PI2
            d = 18 + rng.rand() * 10
            mote(P, mx + math.cos(a) * d, cy + math.sin(a) * d * .9)
        return stack(G, E, P)
    if kind == 'tip':
        x1 = 92
        ks = [1.5, 1.9, 1.65][i]
        f, dth = beam_field(w, h, cy, -200, x1, HW1)
        ix = 96
        r = np.sqrt((xx - ix) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - ix)
        jag = 1 + .14 * np.sin(7 * th + i * 2) + .08 * np.sin(13 * th + i)
        fr = flare_map(r / (HW1 * ks * jag))
        f2 = np.minimum(f, fr)
        E = bands(f2, LSR, dth)
        beam_details(E, f, w, h, i * 11)
        G = glowL(w, h, ix, cy, 34 + i * 3, '#2b8ff0', 130)
        P = blank(w, h)
        rng = np.random.RandomState(40 + i)
        for k in range(10):
            a = math.radians(rng.choice([-1, 1]) * (60 + rng.rand() * 110))
            d = HW1 * ks * 1.4 + 2 + rng.rand() * (6 + i * 6)
            x, y = ix + math.cos(a) * d, cy + math.sin(a) * d * .85
            streak(P, x, y, math.degrees(a) + 180, 3 + int(rng.rand() * 4))
        if i > 0:
            rr = HW1 * ks * 2.2 + 3 + i * 3
            for a in range(0, 360, 6):
                if (a // 6 + i) % 3 == 0:
                    continue
                x, y = ix + rr * math.cos(math.radians(a)), cy + rr * math.sin(math.radians(a)) * .8
                if x > 60:
                    put(P, x, y, '#bff8ff' if i == 1 else '#7ff4ff', 200 if i == 1 else 140)
        # gotas de luz voando
        for k in range(4):
            mote(P, ix + 8 + rng.rand() * 18, cy + (rng.rand() - .5) * 40)
        return stack(G, E, P)


def make_lsr_feixe():
    fr = [lsr_piece('start')] + [lsr_piece('mid', i) for i in range(3)] + \
         [lsr_piece('tip', i) for i in range(3)] + [lsr_piece('fade', i) for i in range(3)]
    save('lsr_feixe', fr)


# ================================================================ LSR_MARCA

def scorch(w, h, cx, cy, rx, ry, seed, state, big=False):
    F = Frame(w, h)
    L = blank(w, h)
    rng = np.random.RandomState(seed)
    outer = F.mask(blob(cx, cy, rx, ry, seed, .22))
    # respingos
    for k in range(9 if not big else 14):
        a = rng.rand() * PI2
        d = 1.0 + rng.rand() * .25
        outer |= F.mask(ell(cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d, 1 + rng.rand() * 1.6, .8 + rng.rand()))
    if big:
        for k in range(10):
            a = PI2 * (k + rng.rand() * .5) / 10
            l0, l1 = 0.8, 1.25 + rng.rand() * .35
            p = [(cx + math.cos(a - .12) * rx * l0, cy + math.sin(a - .12) * ry * l0),
                 (cx + math.cos(a) * rx * l1, cy + math.sin(a) * ry * l1),
                 (cx + math.cos(a + .12) * rx * l0, cy + math.sin(a + .12) * ry * l0)]
            outer |= F.mask([p])
    edge = outer & ~(shift(outer, 1, 0) & shift(outer, -1, 0) & shift(outer, 0, 1) & shift(outer, 0, -1))
    fillm(L, outer, '#2a2228', 210, tex=.25, texcol='#3a3036', seed=seed)
    chk = hashm(w, h, seed + 1) < 45
    L[edge & chk, 3] = 120
    inner = F.mask(blob(cx, cy, rx * .72, ry * .6, seed + 2, .15))
    fillm(L, inner, '#1a1418', 235, tex=.2, texcol='#241c20', seed=seed + 3)
    if state in ('cold', 'fade'):
        hm = hashm(w, h, seed + 4)
        a1 = outer & (hm < 4)
        L[a1, :3] = C('#5a5258')
        a2 = inner & (hm > 93)
        L[a2, :3] = C('#8a8288')
    if state == 'ember':
        lay = [(1.0, '#8f2a14', 255), (.75, '#c8401a', 255), (.5, '#ff8a2a', 255), (.25, '#ffd36a', 255)]
        q = ell_field(w, h, cx, cy, rx * .62, ry * .42 if not big else ry * .5)
        E = bands(q, lay, .12)
        E[~inner] = 0
        L = over(L, E)
        if big:
            cr = crack_paths(cx, cy, rng, 7, rx * .5, rx * .9, rx * .4, ry * .4, flat=.55)
            draw_paths(L, cr, '#120c10')
            K = blank(w, h)
            draw_paths(K, cr, '#ff8a2a')
            K[..., 3] = (K[..., 3] * .9).astype(np.uint8)
            K = np.roll(K, (0, 0), (0, 1))
            L = over(L, K)
        for k in range(8):
            put(L, cx + (rng.rand() - .5) * rx * 1.6, cy + (rng.rand() - .5) * ry * 1.4, '#ffd36a' if k % 2 else '#ff8a2a')
        L = over(ell_glow(w, h, cx, cy, rx * 1.15, ry * 1.9, ('#8f2a14', '#c8401a', '#ff8a2a'), .8), L)
    if state == 'cool':
        q = ell_field(w, h, cx, cy, rx * .55, ry * .35)
        m = (q < 1) & inner
        fillm(L, m, '#5a2418', 255, tex=.3, texcol='#7a2a1a', seed=seed + 5)
        for k in range(7):
            put(L, cx + (rng.rand() - .5) * rx * 1.1, cy + (rng.rand() - .5) * ry * .7, '#ff8a2a' if k % 3 else '#ffd36a')
        wisp(L, cx + 3, cy - 1, 18, .5)
        wisp(L, cx - 8, cy, 12, 2.0, a=130)
    if state == 'fade':
        L = alpha_mul(L, .35)
    return L


def make_lsr_marca():
    w = h = 64
    fr = [scorch(w, h, 32, 33, 22, 6.5, 7, s) for s in ('ember', 'cool', 'cold', 'fade')]
    fr += [scorch(w, h, 32, 33, 20, 11, 21, 'ember', big=True), scorch(w, h, 32, 33, 20, 11, 21, 'cold', big=True)]
    save('lsr_marca', fr)


# ================================================================ LSR_CELULA

def cell_frame(full=True):
    w = h = 64
    F = Frame(w, h)
    sh = shadow_layer(33, 13, 3.4, 95, w, h, gy=52)
    # tampa de baixo
    F.part(ell(32, 47, 11, 4.2) + [[(21, 41), (43, 41), (43, 47), (21, 47)]], '#7d848c', light=.3,
           marks=[(poly((21, 43), (43, 43), (43, 46), (21, 46)), '#f2c230')])
    for x in range(21, 44, 4):
        F.flat(poly((x, 43), (x + 2, 43), (x + 1, 46), (x - 1, 46)), '#1c1822')
    # vidro
    gl = '#2fd2ff' if full else '#2a3a44'
    m = F.part(poly((23, 18), (41, 18), (41, 42), (23, 42)), gl, shade=False, ol='#0c2a3a')
    if full:
        xx, yy = grid_xy(w, h)
        f = np.abs(xx - 31.5) / 9.0 + 0 * yy
        lay = [(1.0, '#2b8ff0', 255), (.85, '#2fd2ff', 255), (.55, '#7ff4ff', 255), (.25, '#e6feff', 255), (.12, '#ffffff', 255)]
        E = bands(f, lay, .1)
        E[~m] = 0
        F.a[:] = over(F.a, E)
        for (x, y) in ((27, 36), (36, 30), (28, 26), (35, 38), (26, 31)):
            F.px(x, y, '#e6feff'); F.px(x + 1, y, '#bff8ff')
    else:
        for y in range(19, 42):
            F.px(25, y, '#6a8a9a'); F.px(26, y, '#4a6070')
        F.flat(poly((24, 38), (40, 38), (40, 41), (24, 41)), '#1f4a5a')
        for (x, y) in ((33, 22), (34, 23), (34, 24), (35, 25), (34, 26), (36, 26), (37, 27)):
            F.px(x, y, '#d8e4ea')
    # bobina de cobre
    for k in range(5):
        y0 = 20 + k * 5
        ln(F.a, 23, y0 + 3, 41, y0, '#b86a32')
        ln(F.a, 23, y0 + 4, 41, y0 + 1, '#7a3e1a')
        put(F.a, 24 + k % 2, y0 + 3, '#e8a060')
    # reflexo do vidro
    for y in range(20, 40, 1):
        if y % 7 != 3:
            F.px(39, y, '#ffffff' if full else '#8aa0aa')
    # tampa de cima
    F.part(poly((21, 12), (43, 12), (43, 19), (21, 19)), '#7d848c', light=.3,
           marks=[(poly((21, 17), (43, 17), (43, 19), (21, 19)), '#5a6068')])
    F.part(ell(32, 12, 11, 4.2), '#9aa2aa', light=.3)
    F.part(ell(32, 12, 6, 2.2), '#6b747a', shade=False)
    for (x, y) in ((23, 15), (41, 15), (31, 18)):
        F.px(x, y, '#c9ced4'); F.px(x + 1, y + 1, '#3a3a40')
    F.part(poly((25, 7), (28, 7), (28, 11), (25, 11)), '#c8323a', light=.35)
    F.part(poly((36, 7), (39, 7), (39, 11), (36, 11)), '#2a2228', light=.35)
    F.px(26, 8, '#ff8080'); F.px(37, 8, '#5a5258')
    spr = compose(F)
    G = glowL(w, h, 32, 30, 24, '#2fd2ff' if full else '#000000', 90 if full else 0)
    rar = glowL(w, h, 32, 50, 22, '#4a8fe0', 60)
    return stack(blank(w, h), sh, rar, G if full else blank(w, h), spr)


def sparks_frame(i):
    w = h = 64
    L = blank(w, h)
    rng = np.random.RandomState(77)
    cx, cy = 32, 32
    S0 = blank(w, h)
    if i == 0:
        S0 = over(S0, glowL(w, h, cx, cy, 16, '#2fd2ff', 150))
        lay = [(1.0, '#2fd2ff', 255), (.6, '#bff8ff', 255), (.3, '#ffffff', 255)]
        xx, yy = grid_xy(w, h)
        r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - cx)
        f = r / (6 * (1 + .6 * np.abs(np.cos(3 * th)) ** 4))
        S0 = over(S0, bands(f, lay, .15))
    for k in range(12):
        a = rng.rand() * PI2
        sp = .6 + rng.rand() * .6
        d = [4, 12, 19][i] * sp
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d + [0, 1, 4][i] * sp
        if i == 2:
            if k % 3 == 0:
                continue
            put(L, x, y, '#7ff4ff', 220)
            put(L, x, y + 1, '#2b8ff0', 140)
            if k % 2:
                put(L, x - math.cos(a), y - math.sin(a), '#2b8ff0', 120)
        else:
            streak(L, x, y, math.degrees(a) + 180, [3, 6][i] + int(rng.rand() * 3))
    if i == 1:
        for k in range(4):
            mote(L, cx + (rng.rand() - .5) * 20, cy + (rng.rand() - .5) * 20)
    return over(L, S0) if i == 0 else L


def smoke_frame(i):
    """fumaça de carbonizado: baforadas pequenas e escuras embaixo, maiores e mais claras em cima."""
    w = h = 64
    out = blank(w, h)
    cols = ['#241e22', '#322a30', '#443a42', '#574d55', '#6a6068']
    items = []
    for j in range(5):
        t = (j + i / 3.0) / 4.6
        if t > 1:
            continue
        y = 52 - t * 42
        x = 30 + 5 * math.sin(t * 3.4 + .6) + t * 4
        r = 2.4 + t * 5.5
        items.append((t, x, y, r))
    for (t, x, y, r) in sorted(items, key=lambda q: -q[0]):
        F = Frame(w, h)
        sh = ell(x, y, r, r * .78) + ell(x - r * .7, y + r * .35, r * .62, r * .5) + ell(x + r * .75, y + r * .25, r * .6, r * .5)
        ci = min(4, int(t * 5))
        F.part(sh, cols[ci], ol=mix(C(cols[ci]), INK, .45), layer=F.fx, light=.22, dark=.2, tex=.25)
        out = over(out, alpha_mul(F.fx, .92 - .55 * t))
    rng = np.random.RandomState(5 + i)
    for k in range(2 + i % 2 + 1):
        x, y = 27 + rng.rand() * 10, 52 - rng.rand() * 22
        put(out, x, y, '#ffd36a'); put(out, x + 1, y, '#ff8a2a'); put(out, x, y + 1, '#c8401a', 200)
    return out


def make_lsr_celula():
    fr = [cell_frame(True), cell_frame(False)] + [sparks_frame(i) for i in range(3)] + [smoke_frame(i) for i in range(3)]
    save('lsr_celula', fr)


# ================================================================ KMH_ESFERA

def orb_frame(R, k=0, gold=False, pulse=False):
    w = h = 64
    cx, cy = 32, 32
    xx, yy = grid_xy(w, h)
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    th = np.arctan2(yy - cy, xx - cx)
    if gold:
        jag = 1 + .1 * np.sin(5 * th + k * 2.1) + .07 * np.sin(9 * th + k * 1.3) + .05 * np.sin(17 * th + k)
    else:
        jag = 1 + .02 * np.sin(5 * th + k * 1.2)
    f = r / (R * jag)
    E = bands(f, ORBG if gold else ORB, 1.0 / R)
    # núcleo deslocado para cima-esquerda
    rc = np.sqrt((xx - (cx - R * .15)) ** 2 + (yy - (cy - R * .15)) ** 2)
    core = rc < max(1.2, R * .3)
    E[core, :3] = 255
    E[core, 3] = 255
    out = stack(glowL(w, h, cx, cy, min(31, R * 2.1 + 3), '#f2c230' if gold else '#3a6ae8', 120 if gold else 110), E)
    P = blank(w, h)
    cols = GC if gold else CY
    # arcos internos girando
    if R >= 7:
        for s in range(2):
            a0 = k * 40 + s * 180
            for a in range(a0, a0 + 100, 4):
                rr = R * (.62 + .08 * s)
                x = cx + rr * math.cos(math.radians(a))
                y = cy + rr * math.sin(math.radians(a)) * .75
                put(P, x, y, '#e6feff' if not gold else '#fffbe0')
    # brilho em cruz no núcleo
    if R >= 11:
        x0, y0 = int(cx - R * .15), int(cy - R * .15)
        L = 3 if R < 15 else 5
        for d in range(-L, L + 1):
            put(P, x0 + d, y0, '#ffffff'); put(P, x0, y0 + d, '#ffffff')
    # partículas sugadas
    rng = np.random.RandomState(int(R * 10) + k)
    n = 6 if R < 7 else 9
    for i in range(n):
        a = rng.rand() * PI2
        d = R * 1.5 + 3 + rng.rand() * (28 - R)
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d
        if 0 < x < 63 and 0 < y < 63:
            streak(P, x, y, math.degrees(a), 2 + int(rng.rand() * 3), cols)
    if pulse:
        rr = R * 1.55 + (2 if k else 0)
        for a in range(0, 360, 3):
            if (a // 3) % 4 == k:
                continue
            put(P, cx + rr * math.cos(math.radians(a)), cy + rr * math.sin(math.radians(a)), '#bff8ff', 200)
    if gold:
        zr = np.random.RandomState(90 + k)
        for z in range(4):
            a = zr.rand() * PI2
            p0 = (cx + math.cos(a) * R * .9, cy + math.sin(a) * R * .9)
            L = 6 + zr.rand() * 5
            p1 = (cx + math.cos(a) * (R + L), cy + math.sin(a) * (R + L))
            zigzag(P, p0, p1, 3, 2.2, zr, core='#ffffff', edge='#fff6c8', ea=220)
        for z in range(6):
            a = zr.rand() * PI2
            d = R + 4 + zr.rand() * 8
            mote(P, cx + math.cos(a) * d, cy + math.sin(a) * d, cols=GC)
    return stack(out, P)


def make_kmh_esfera():
    fr = [orb_frame(R, i) for i, R in enumerate((3, 7, 11, 15, 18))]
    fr += [orb_frame(18, 0, pulse=True), orb_frame(19.5, 1, pulse=True)]
    fr += [orb_frame(R, k, gold=True) for k, R in enumerate((16.5, 17.5, 16))]
    save('kmh_esfera', fr)


# ================================================================ KMH_CARGA_CHAO

def floor_glow(w, h, cx, cy, rx, ry_k=.38, a=1.0):
    q = ell_field(w, h, cx, cy, rx, rx * ry_k)
    lay = [(1.0, '#2c48d0', int(70 * a)), (.68, '#5fb4ff', int(110 * a)), (.38, '#bff8ff', int(150 * a))]
    return bands(q, lay, .08)


def dust_ring(w, h, cx, cy, R, seed, density=1.0, ry_k=.38):
    F = Frame(w, h)
    rng = np.random.RandomState(seed)
    n = int(30 * density)
    order = []
    for i in range(n):
        a = PI2 * (i + rng.rand() * .5) / n
        if rng.rand() < .18:
            continue
        x, y = cx + R * math.cos(a), cy + R * ry_k * math.sin(a)
        r = 1.6 + rng.rand() * 1.6 * (1.25 - density * .3)
        order.append((y, x, r, rng.rand()))
    for (y, x, r, c) in sorted(order):
        col = '#a8987c' if c < .5 else '#c8b898'
        F.part(ell(x, y, r, r * .62) + ell(x + r * .8, y + .6, r * .6, r * .45), col, ol='#6a5a44', light=.35, dark=.2, tex=.2)
    for i in range(10):
        a = rng.rand() * PI2
        rr = R * (.6 + rng.rand() * .5)
        x, y = cx + rr * math.cos(a), cy + rr * ry_k * math.sin(a) - 3 - rng.rand() * 6
        F.part(ell(x, y, 1.2, 1), '#77736e', ol='#2a2228', light=.3)
    return alpha_mul(F.a, .9)


def ground_cracks(w, h, cx, cy, seed, hot):
    rng = np.random.RandomState(seed)
    paths = crack_paths(cx, cy, rng, 8, 18, 50, 3, 1.5, flat=.42)
    L = blank(w, h)
    if hot:
        K = blank(w, h)
        for p in paths:
            for u, v in zip(p[:-1], p[1:]):
                for dy in (-1, 1):
                    ln(K, u[0], u[1] + dy, v[0], v[1] + dy, '#2c48d0', 130)
        L = over(L, K)
    # lascas
    for p in paths:
        for u, v in zip(p[:-1], p[1:]):
            ln(L, u[0], u[1] - 1, v[0], v[1] - 1, '#8e8a84', 200)
    draw_paths(L, paths, '#120c10', thick=True)
    if hot:
        K = blank(w, h)
        draw_paths(K, paths, '#5ff2ff')
        for p in paths:
            for u in p[: max(2, len(p) // 3)]:
                put(K, u[0], u[1], '#ffffff')
        L = over(L, K)
        L = stack(glowL(w, h, cx, cy, 30, '#3a6ae8', 70), L)
    # pedrinhas soltas
    F = Frame(w, h)
    for i in range(7):
        a = rng.rand() * PI2
        rr = 10 + rng.rand() * 30
        F.part(poly(*[(cx + rr * math.cos(a) + 1.6 * math.cos(b), cy + rr * .42 * math.sin(a) + 1.2 * math.sin(b))
                      for b in np.linspace(0, PI2, 6)[:-1]]), '#8e8a84', ol='#2a2228', light=.35)
    return over(L, F.a)


def make_kmh_carga_chao():
    w, h = 128, 64
    cx, cy = 64, 44
    fr = []
    for i, (R, gr) in enumerate(((22, 18), (38, 26), (54, 34))):
        L = stack(blank(w, h), floor_glow(w, h, cx, cy, gr), dust_ring(w, h, cx, cy, R, 30 + i, [.7, .85, .75][i]))
        # partículas de poeira sendo puxadas para o centro (para cima)
        P = blank(w, h)
        rng = np.random.RandomState(60 + i)
        for k in range(8):
            a = rng.rand() * PI2
            rr = R * (.4 + rng.rand() * .5)
            x, y = cx + rr * math.cos(a), cy + rr * .38 * math.sin(a) - 4 - rng.rand() * 10
            put(P, x, y, '#c8b898'); put(P, x, y + 1, '#7a6a52', 200)
        for k in range(5):
            a = rng.rand() * PI2
            mote(P, cx + math.cos(a) * 14, cy - 10 + math.sin(a) * 8)
        fr.append(over(L, P))
    fr.append(stack(blank(w, h), floor_glow(w, h, cx, cy, 24, a=.7), ground_cracks(w, h, cx, cy, 8, True)))
    fr.append(ground_cracks(w, h, cx, cy, 8, False))
    save('kmh_carga_chao', fr)


# ================================================================ KMH_ONDA

W2, H2, CY2, HW2 = 128, 96, 48, 8.0


def tile_zig(rng, y_lo, y_hi, n=16):
    ys = list(y_lo + rng.rand(n) * (y_hi - y_lo))
    ys.append(ys[0])
    return [(i * 128 / n, ys[i]) for i in range(n + 1)]


def spirals(w, h, cy, hw, ph, x0=-999, x1=999, front=True, gold=False):
    L = blank(w, h)
    A = 1.75 * hw
    for s in range(2):
        for k in range(w * 3):
            x = k / 3.0
            if x < x0 or x > x1:
                continue
            t = PI2 * (x + ph) / 64 + s * math.pi
            y = cy + A * math.sin(t)
            dep = math.cos(t)
            fade = min(1.0, (x - x0) / 10.0) if x0 > -999 else 1.0
            if x1 < 999:
                fade = min(fade, (x1 - x) / 10.0)
            if fade <= 0:
                continue
            if front and dep > 0:
                c1 = '#ffffff'
                c2 = '#bff8ff' if not gold else '#fff0a0'
                put(L, x, y, c1, int(255 * min(1, fade * 1.5)))
                if dep > .35:
                    put(L, x, y + 1, c1, int(255 * min(1, fade * 1.5)))
                    putmax(L, x, y - 1, c2, int(220 * fade))
                    putmax(L, x, y + 2, c2, int(220 * fade))
            elif not front and dep <= 0:
                put(L, x, y, '#7ab8ff' if not gold else '#e0901f', int(170 * fade))
    return L


def zig_layer(w, h, cy, hw, seed, gold=False, n_chunks=3, x0=0, x1=128):
    rng = np.random.RandomState(seed)
    L = blank(w, h)
    for side in (-1, 1):
        lo, hi = (cy + side * 1.7 * hw, cy + side * 2.45 * hw)
        pts = tile_zig(rng, min(lo, hi), max(lo, hi))
        segs = list(zip(pts[:-1], pts[1:]))
        starts = rng.choice(len(segs), n_chunks, replace=False)
        for st in starts:
            ln_ = 2 + rng.randint(3)
            for j in range(ln_):
                a, b = segs[(st + j) % len(segs)]
                if a[0] < x0 or b[0] > x1:
                    continue
                core = '#ffffff' if j % 2 == 0 else ('#dff8ff' if not gold else '#fff6c8')
                ln(L, a[0], a[1], b[0], b[1], core)
                ln(L, a[0], a[1] + side, b[0], b[1] + side, '#5ff2ff' if not gold else '#f2c230', 140)
    return L


def back_on_aura(back, f, lim=1.3):
    m = (back[..., 3] > 0) & (f > lim)
    o = blank(*f.shape[::-1])
    o[m] = back[m]
    return o


def wave_piece(kind, i=0, gold=False):
    w, h, cy = W2, H2, CY2
    lay = GLD if gold else KMH
    hw = HW2 * (1.2 if gold else 1.0)
    xx, yy = grid_xy(w, h)
    ph = i * 64 / 3.0
    if kind == 'mid':
        s = [.95, 1.0, 1.05][i]
        f, dth = beam_field(w, h, cy, -500, 600, hw * s, wob=.05)
        E = bands(f, lay, dth)
        beam_details(E, f, w, h, int(i * 13), inner=(.45, 1.6), streak_col='#fffbe0' if gold else '#dcf6ff',
                     halo=(1.6, 2.6), dot_col='#fff6c8' if gold else '#9fd8ff')
        back = spirals(w, h, cy, hw * s, ph, gold=gold)
        front = spirals(w, h, cy, hw * s, ph, front=True, gold=gold)
        Z = zig_layer(w, h, cy, hw * s, 100 + i + (10 if gold else 0), gold, n_chunks=4 if gold else 3)
        return stack(back, E, back_on_aura(back, f), front, Z)
    if kind == 'start':
        mx = 30
        f, dth = beam_field(w, h, cy, mx, 600, hw, wob=.05)
        r = np.sqrt((xx - mx) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - mx)
        fr = r / (hw * 1.25 * (1 + .16 * np.sin(6 * th + .5) + .06 * np.sin(11 * th)))
        F2 = np.minimum(f, fr)
        E = bands(F2, lay, dth)
        beam_details(E, f, w, h, 0, inner=(.45, 1.6), streak_col='#dcf6ff', halo=(1.6, 2.6), dot_col='#9fd8ff')
        G = glowL(w, h, mx, cy, 46, '#3a6ae8', 130)
        back = spirals(w, h, cy, hw, 0, x0=mx + 8)
        front = spirals(w, h, cy, hw, 0, front=True, x0=mx + 8)
        Z = zig_layer(w, h, cy, hw, 120, x0=30)
        P = blank(w, h)
        rng = np.random.RandomState(4)
        for k in range(10):
            a = rng.rand() * PI2
            d = hw * 3.4 + rng.rand() * 8
            x, y = mx + math.cos(a) * d, cy + math.sin(a) * d
            streak(P, x, y, math.degrees(a) + 180, 3 + int(rng.rand() * 3), ('#ffffff', '#8cc4ff', '#3a6ae8'))
        # núcleo grande da mão
        rc = np.sqrt((xx - mx) ** 2 + (yy - cy) ** 2)
        E[rc < 6.5, :3] = 255
        return stack(G, back, E, back_on_aura(back, F2), front, Z, P)
    if kind == 'head':
        x1 = 78
        ks = [1.6, 1.78, 1.68][i]
        f, dth = beam_field(w, h, cy, -500, x1, hw, wob=.05)
        hx = 84
        r = np.sqrt((xx - hx) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - hx)
        # bulbo: um pouco achatado atrás, cheio na frente
        fr = r / (hw * ks * (1 + .05 * np.sin(8 * th + i * 1.7)))
        F2 = np.minimum(f, fr)
        E = bands(F2, lay, dth)
        beam_details(E, f, w, h, int(i * 13), inner=(.45, 1.6), streak_col='#dcf6ff', halo=(1.6, 2.6), dot_col='#9fd8ff')
        rc = np.sqrt((xx - (hx + 2)) ** 2 + (yy - (cy - 1)) ** 2)
        E[rc < hw * ks * .5, :3] = 255
        E[rc < hw * ks * .5, 3] = 255
        G = glowL(w, h, hx, cy, 48, '#3a6ae8', 130)
        back = spirals(w, h, cy, hw, ph, x1=hx - 4)
        front = spirals(w, h, cy, hw, ph, front=True, x1=hx - 4)
        Z = zig_layer(w, h, cy, hw, 130 + i, x1=70)
        P = blank(w, h)
        # arcos de choque à frente
        for j in range(2 + (i == 1)):
            rr = hw * ks * 2.0 + 4 + j * 5 + i * 2
            for a in range(-60, 61, 2):
                if abs(a) > 50 - j * 8:
                    continue
                x = hx + rr * math.cos(math.radians(a))
                y = cy + rr * 1.05 * math.sin(math.radians(a))
                put(P, x, y, '#ffffff' if j == 0 else '#bff8ff', 255 if j == 0 else 190)
                if j == 0:
                    putmax(P, x - 1, y, '#8cc4ff', 200)
        rng = np.random.RandomState(70 + i)
        for k in range(8):
            a = math.radians(rng.choice([-1, 1]) * (95 + rng.rand() * 60))
            d = hw * ks * 1.9 + rng.rand() * 8
            x, y = hx + math.cos(a) * d, cy + math.sin(a) * d
            streak(P, x, y, math.degrees(a) + 200 * (1 if a > 0 else -1) * 0 + 180 - (25 if a > 0 else -25),
                   3 + int(rng.rand() * 4), ('#ffffff', '#8cc4ff', '#3a6ae8'))
        return stack(G, back, E, back_on_aura(back, F2), front, Z, P)


def make_kmh_onda():
    fr = [wave_piece('start')] + [wave_piece('mid', i) for i in range(3)] + \
         [wave_piece('head', i) for i in range(3)] + [wave_piece('mid', i, gold=True) for i in range(3)]
    save('kmh_onda', fr)


# ================================================================ KMH_CUPULA

def dome_frame(s, k, mode='normal'):
    w = h = 192
    cx, gy = 96, 140
    R = 68 * s
    xx, yy = grid_xy(w, h)
    up = yy < gy
    dx = (xx - cx) / R
    q = np.sqrt(dx ** 2 + np.where(up, (yy - gy) / (R * .92), (yy - gy) / (R * .36)) ** 2)
    qg = np.sqrt(dx ** 2 + ((yy - gy) / (R * .36)) ** 2)
    dim = {'normal': 1.0, 'flash': 1.0, 'collapse': .75}.get(mode, 1.0)
    out = blank(w, h)
    # brilho do chão
    out = over(out, floor_glow(w, h, cx, gy, R * 1.15, .36, a=dim))
    # anel de choque
    ringR = {0: 1.35, 1: 1.3, 2: 1.18, 3: 1.32, 4: 1.25, 5: 1.5, 6: 0}[k] * R
    ringR = min(ringR, 92)
    if k == 6:
        ringR = 0
    if ringR > 0:
        qr = np.sqrt(((xx - cx) / ringR) ** 2 + ((yy - gy) / (ringR * .36)) ** 2)
        th = 3.0 / ringR
        Lr = blank(w, h)
        ra = .55 if k in (3, 4) else (.5 if k == 5 else 1.0)
        for (a, b, c, al) in ((1 - 4 * th, 1 + th, '#3a6ae8', 120), (1 - 2.5 * th, 1, '#8ff0ff', 210), (1 - 1.5 * th, 1 - .5 * th, '#ffffff', 255)):
            m = (qr >= a) & (qr < b)
            Lr[m, :3] = C(c); Lr[m, 3] = int(al * ra)
        out = over(out, Lr)
        if k <= 2 or k == 5:
            out = over(out, dust_ring(w, h, cx, gy + 1, ringR + 4, 200 + k, .55 if k != 5 else .4, ry_k=.36))
    if k == 6:
        # implosão
        out = over(out, glowL(w, h, cx, gy - 18, 40, '#3a6ae8', 140))
        f = np.sqrt((xx - cx) ** 2 + (yy - (gy - 18)) ** 2) / 10
        out = over(out, bands(f, [(1.6, '#3a6ae8', 170), (1.0, '#8ff0ff', 255), (.6, '#ffffff', 255)], .1))
        P = blank(w, h)
        rng = np.random.RandomState(9)
        for i in range(14):
            a = PI2 * i / 14 + rng.rand() * .3
            d = 26 + rng.rand() * 34
            x, y = cx + math.cos(a) * d, gy - 18 + math.sin(a) * d * .75
            streak(P, x - math.cos(a) * 1, y, math.degrees(a), 6 + int(rng.rand() * 6), ('#ffffff', '#8ff0ff', '#3a6ae8'))
        for i in range(6):
            a = rng.rand() * PI2
            mote(P, cx + math.cos(a) * 20, gy - 18 + math.sin(a) * 15)
        return over(out, P)
    # cúpula em camadas
    D = blank(w, h)
    lay = [((q < 1.12), '#2440c8', 80), ((q < 1.06), '#3a6ae8', 130), ((q < 1.0), '#3a7ae8', 100),
           ((q >= .7) & (q < .86), '#4a90f0', 140), ((q >= .86) & (q < 1.0), '#5fd0ff', 210),
           ((q >= .93) & (q < .99), '#c8faff', 255)]
    chk = ((xx + yy) % 2) == 0
    for m, c, a in lay:
        D[m, :3] = C(c); D[m, 3] = int(a * dim)
    # borda pontilhada entre interior e banda
    e = (q >= .68) & (q < .7) & chk
    D[e, :3] = C('#4a90f0'); D[e, 3] = int(140 * dim)
    # base de trás visível através da cúpula
    bm = up & (qg >= .96) & (qg < 1.03)
    D[bm, :3] = C('#8ff0ff'); D[bm, 3] = int(140 * dim)
    # latitudes tracejadas
    for z in (.35, .7):
        rx = R * math.sqrt(1 - z * z)
        cyz = gy - z * R * .92
        for a in range(0, 360, 2):
            ar = math.radians(a)
            x, y = cx + rx * math.cos(ar), cyz + rx * .36 * math.sin(ar)
            front = math.sin(ar) > 0
            if ((a // 2 + k * 3) % 8) < (5 if front else 3):
                put(D, x, y, '#e6feff' if front else '#8ff0ff', int((230 if front else 120) * dim))
    # meridianos girando
    for mphi in (0, 60, 120):
        phi = math.radians(mphi + k * 20)
        for t in range(0, 91, 3):
            tz = math.radians(t)
            x = cx + R * math.cos(tz) * math.cos(phi)
            y = gy - R * .92 * math.sin(tz) + R * .36 * math.cos(tz) * math.sin(phi)
            if math.sin(phi) > 0 and (t // 3) % 3 != 0:
                put(D, x, y, '#bff8ff', int(170 * dim))
    # reflexo em crescente (cima-esquerda)
    ang = np.arctan2((yy - gy) / (R * .92), dx)
    hl = up & (q >= .62) & (q < .8) & (ang > -2.55) & (ang < -1.85)
    D[hl, :3] = C('#e6feff'); D[hl, 3] = 255
    hl2 = up & (q >= .66) & (q < .76) & (ang > -2.42) & (ang < -2.0)
    D[hl2, :3] = 255
    out = over(out, D)
    # fio do anel da base (frente)
    fm = ~up & (qg >= .94) & (qg < 1.0)
    out[fm, :3] = C('#ffffff'); out[fm, 3] = int(255 * dim)
    P = blank(w, h)
    rng = np.random.RandomState(300 + k)
    for i in range(10 if mode != 'collapse' else 14):
        a = -rng.rand() * math.pi
        d = R * (1.05 + rng.rand() * .3)
        x, y = cx + math.cos(a) * d, gy + math.sin(a) * d * .92
        if mode == 'collapse':
            streak(P, x, y, math.degrees(a) + 180, 4 + int(rng.rand() * 4), ('#ffffff', '#8ff0ff', '#3a6ae8'))
        else:
            mote(P, x, y, big=rng.rand() < .3, cols=('#ffffff', '#8ff0ff', '#3a6ae8'))
    out = over(out, P)
    if mode == 'flash':
        out = stack(glowL(w, h, cx, gy - 20, 70, '#bff8ff', 170), out)
        m = (q < .8)
        out[m, :3] = mix(out[m, :3].astype(float), np.array([255, 255, 255.]), .6)
        out[m, 3] = np.maximum(out[m, 3], 200)
    else:
        out = stack(glowL(w, h, cx, gy - R * .4, R * 1.3, '#3a6ae8', int(90 * dim)), out)
    return out


def make_kmh_cupula():
    fr = [dome_frame(.4, 0, 'flash'), dome_frame(.8, 1), dome_frame(1.15, 2), dome_frame(1.0, 3),
          dome_frame(1.06, 4), dome_frame(.55, 5, 'collapse'), dome_frame(.2, 6)]
    save('kmh_cupula', fr)


# ================================================================ KMH_CRATERA

def crater_frame(state):
    w, h = 128, 96
    cx, cy, rx, ry = 78, 56, 30, 13
    F = Frame(w, h)
    L = blank(w, h)
    rng = np.random.RandomState(12)
    # fuligem + trilha
    sm = F.mask(blob(cx, cy, 46, 21, 31, .2))
    sm |= F.mask(poly((-4, cy - 7), (40, cy - 9), (56, cy - 11), (56, cy + 11), (40, cy + 8), (-4, cy + 6)))
    for k in range(12):
        x = rng.rand() * 50
        sm |= F.mask(ell(x, cy + (rng.rand() - .5) * 14, 2 + rng.rand() * 3, 1 + rng.rand() * 1.5))
    for k in range(14):
        a = rng.rand() * PI2
        sm |= F.mask(ell(cx + math.cos(a) * 50, cy + math.sin(a) * 23, 1 + rng.rand() * 2, 1 + rng.rand()))
    fillm(L, sm, '#2a2228', 215, tex=.25, texcol='#362c32', seed=3)
    edge = sm & ~(shift(sm, 1, 0) & shift(sm, -1, 0) & shift(sm, 0, 1) & shift(sm, 0, -1))
    L[edge & (hashm(w, h, 4) < 50), 3] = 120
    inner_t = F.mask(poly((-4, cy - 3), (50, cy - 4), (50, cy + 4), (-4, cy + 3)))
    fillm(L, inner_t, '#1a1418', 235, tex=.2, texcol='#241c20', seed=5)
    # rachaduras
    cr = crack_paths(cx, cy, np.random.RandomState(14), 10, 10, 30, rx + 1, ry + 1, flat=.45)
    draw_paths(L, cr, '#120c10')
    # cratera
    pit = F.mask(ell(cx, cy, rx, ry))
    fillm(L, pit, '#1a1418', 255)
    wall = pit & ~F.mask(ell(cx, cy + 3.5, rx - 3, ry - 3))
    wall &= F.mask(poly((0, 0), (128, 0), (128, cy + 1), (0, cy + 1)))
    fillm(L, wall, '#3a3236', 255, tex=.3, texcol='#2a2428', seed=6)
    bot = F.mask(ell(cx, cy + 3, rx - 6, ry - 5))
    fillm(L, bot, '#0f0c10', 255, tex=.15, texcol='#1a1418', seed=7)
    glowc = None
    if state in ('blue', 'orange'):
        if state == 'blue':
            lay = [(1.0, '#2440c8', 200), (.78, '#3fa0ff', 255), (.52, '#9ff4ff', 255), (.28, '#ffffff', 255)]
            gc, lc = '#3fa0ff', '#9ff4ff'
        else:
            lay = [(1.0, '#8f2a14', 220), (.78, '#c8401a', 255), (.52, '#ff8a2a', 255), (.28, '#ffd36a', 255)]
            gc, lc = '#ff8a2a', '#ff8a2a'
        q = ell_field(w, h, cx, cy + 2, rx - 4, ry - 3.5)
        E = bands(q, lay, .07)
        E[~pit] = 0
        L = over(L, E)
        K = blank(w, h)
        draw_paths(K, cr, lc)
        for p in cr:
            for u in p[1:3]:
                put(K, u[0], u[1], '#ffffff' if state == 'blue' else '#ffd36a')
        L = over(L, K)
        # trilha brilhando
        for x in range(0, 52):
            if (x // 3) % 4 != 3:
                put(L, x, cy + int(round(math.sin(x * .3))), lc)
                if x % 2:
                    put(L, x, cy - 1 + int(round(math.sin(x * .3))), lay[1][1], 200)
        glowc = gc
    # borda: lascas de pedra e asfalto
    chunks = []
    for i in range(22):
        a = PI2 * (i + rng.rand() * .6) / 22
        d = 1.0 + rng.rand() * .18
        x, y = cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d
        s = 2 + rng.rand() * 2.4
        chunks.append((y, x, s, a, rng.rand()))
    for (y, x, s, a, c) in sorted(chunks):
        col = '#8e8a84' if c < .45 else ('#77736e' if c < .75 else '#3a3638')
        if state in ('blue', 'orange') and math.sin(a) < 0:
            pass
        pts = [(x + s * math.cos(b + a) * (1 + .3 * ((j * 7) % 3 - 1)), y + s * .75 * math.sin(b + a))
               for j, b in enumerate(np.linspace(0, PI2, 6)[:-1])]
        F.part([pts], col, ol='#141014', light=.3, tex=.2)
    L = over(L, F.a)
    if state == 'blue':
        L = stack(ell_glow(w, h, cx, cy, 50, 24, ('#2440c8', '#3a6ae8', '#3fa0ff')), L,
                  glowL(w, h, cx, cy + 2, 18, '#bff8ff', 90))
        for k, (x, ph) in enumerate(((cx - 10, .3), (cx + 4, 1.7), (cx + 16, 3.1))):
            wisp(L, x, cy - 2, 22 - k * 3, ph, '#9ff4ff', 150)
    elif state == 'orange':
        L = stack(ell_glow(w, h, cx, cy, 48, 22, ('#8f2a14', '#c8401a', '#ff8a2a'), .9), L)
        for k, (x, ph) in enumerate(((cx - 6, .3), (cx + 10, 2.1))):
            wisp(L, x, cy - 3, 26 - k * 4, ph, '#6a6270', 170)
    else:
        hm = hashm(w, h, 9)
        a1 = sm & (hm < 3) & (L[..., 3] > 0)
        L[a1, :3] = C('#5a5258')
        if state == 'soot':
            wisp(L, cx - 2, cy - 3, 18, 1.0, '#5a5258', 130)
    if state == 'fade':
        L = alpha_mul(L, .35)
    return L


def embers_frame(i):
    w, h = 128, 96
    L = blank(w, h)
    rng = np.random.RandomState(55)
    for k in range(14):
        x0 = 6 + rng.rand() * 110
        y0 = 62 - rng.rand() * 26
        ph = rng.rand() * PI2
        y = y0 - i * 6 - (k % 3) * 2
        x = x0 + 2.5 * math.sin(ph + i * 1.3)
        life = (i + k) % 4
        if life == 3:
            put(L, x, y, '#3fa0ff', 160)
            continue
        mote(L, x, y, big=(k % 3 == 0 and life < 2), cols=('#ffffff', '#9ff4ff', '#3a6ae8'))
        put(L, x - .5 * math.cos(ph), y + 2, '#3a6ae8', 120)
    return L


def ashes_frame(i):
    """montinho de cinza de zumbi com pontos azuis brilhando."""
    w, h = 128, 96
    cx, cy = 64, 72
    F = Frame(w, h)
    sh = shadow_layer(cx, 30, 4, 80, w, h, gy=cy + 2)
    S = blank(w, h)
    sm = F.mask(blob(cx, cy + 1, 34, 8, 61, .2))
    fillm(S, sm, '#2a2228', 190, tex=.3, texcol='#3a3036', seed=62)
    F.part(blob(cx, cy - 1, 26, 6.5, 44, .12), '#4a4248', tex=.4, light=.25, dark=.25)
    F.part(blob(cx - 7, cy - 4, 14, 4.5, 45, .18), '#6a6268', tex=.4, light=.3)
    F.part(blob(cx + 10, cy - 3, 9, 3.5, 46, .2), '#5f575d', tex=.4, light=.3)
    F.part(blob(cx - 9, cy - 6, 7, 2.6, 47, .2), '#8a8288', tex=.35, light=.35)
    F.part(limb(cx + 4, cy - 4, cx + 14, cy - 6, 1.8), '#2a2228', light=.15)
    F.part(limb(cx - 20, cy - 1, cx - 13, cy - 3, 1.6), '#2a2228', light=.15)
    F.part(ell(cx + 17, cy - 6, 2.2, 1.6), '#1c1418', light=.1)
    F.part(poly((cx - 2, cy - 2), (cx + 3, cy - 3), (cx + 2, cy), (cx - 3, cy)), '#3a2a2a', light=.1)
    L = stack(blank(w, h), sh, S, ell_glow(w, h, cx, cy, 34, 10, ('#2440c8', '#3a6ae8', '#3fa0ff'), .45 + .25 * i),
              compose(F))
    rng = np.random.RandomState(48)
    for k in range(14):
        x, y = cx + (rng.rand() - .5) * 46, cy - 2 + (rng.rand() - .5) * 9
        if L[int(y), int(x), 3] == 0:
            continue
        if (k + i) % 4 == 0:
            mote(L, x, y, cols=('#ffffff', '#9ff4ff', '#3a6ae8'))
        else:
            put(L, x, y, '#5ff2ff' if (k + i) % 2 else '#3fa0ff')
    for j, (x, ph) in enumerate(((cx - 8, .4 + i), (cx + 7, 2.2 + i), (cx + 1, 4.0 + i))):
        wisp(L, x, cy - 5, 20 - j * 4, ph, '#7a7288', 150)
    for k in range(3):
        mote(L, cx - 12 + k * 11 + i * 2, cy - 14 - k * 5 - i * 4, cols=('#ffffff', '#9ff4ff', '#3a6ae8'))
    return L


def make_kmh_cratera():
    fr = [crater_frame(s) for s in ('blue', 'orange', 'soot', 'fade')]
    fr += [embers_frame(i) for i in range(3)] + [ashes_frame(i) for i in range(2)]
    save('kmh_cratera', fr)


if __name__ == '__main__':
    make_lsr_arma()
    make_lsr_feixe()
    make_lsr_marca()
    make_lsr_celula()
    make_kmh_esfera()
    make_kmh_carga_chao()
    make_kmh_onda()
    make_kmh_cupula()
    make_kmh_cratera()
