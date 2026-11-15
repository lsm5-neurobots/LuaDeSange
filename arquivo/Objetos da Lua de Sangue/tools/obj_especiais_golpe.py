"""Especiais de golpe: Rasengan (rsg_), Getsuga (gts_) e Chidori (chd_).
Rodar de dentro de tools/:  python obj_especiais_golpe.py
Efeitos de energia em camadas nítidas (halo, corpo, núcleo branco) — sem degradê liso.
"""
import math
import os
import random
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import Frame, ell, poly, limb, chain, hexc, mix, dilate, shift, glow, strip  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')


# ====================================================================== utilidades

def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


class Cv:
    """tela RGBA com máscaras e mistura por alpha."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.F = Frame(w, h)
        self.L = self.F.a
        yy, xx = np.mgrid[0:h, 0:w]
        self.X, self.Y = xx + .5, yy + .5

    def none(self):
        return np.zeros((self.h, self.w), bool)

    def disk(self, cx, cy, rx, ry=None):
        ry = rx if ry is None else ry
        return ((self.X - cx) / max(rx, 1e-3)) ** 2 + ((self.Y - cy) / max(ry, 1e-3)) ** 2 <= 1

    def shp(self, shapes):
        return self.F.mask(shapes)

    def dots(self, pts):
        m = self.none()
        for x, y in pts:
            xi, yi = int(math.floor(x)), int(math.floor(y))
            if 0 <= xi < self.w and 0 <= yi < self.h:
                m[yi, xi] = True
        return m

    def seg(self, x0, y0, x1, y1):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 1.5) + 1
        return self.dots([(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n + 1)])

    def pline(self, pts, w=1):
        if w <= 1:
            m = self.none()
            for a, b in zip(pts, pts[1:]):
                m |= self.seg(a[0], a[1], b[0], b[1])
            return m
        return self.shp(chain(pts, w))

    def b(self, m, col, a=255):
        blend(self.L, m, col, a)

    def put(self, x, y, col, a=255):
        xi, yi = int(math.floor(x)), int(math.floor(y))
        if 0 <= xi < self.w and 0 <= yi < self.h:
            m = self.none()
            m[yi, xi] = True
            self.b(m, col, a)

    def glow(self, cx, cy, r, col, a=120):
        glow(self.F, cx, cy, r, col, alpha=a, layer=self.L)

    def out(self):
        return self.L.copy()


def blend(L, m, col, a=255):
    if not m.any() or a <= 0:
        return
    c = C(col)
    sa = a / 255.
    da = L[m, 3:4].astype(float) / 255
    oa = sa + da * (1 - sa)
    rgb = (c * sa + L[m, :3].astype(float) * da * (1 - sa)) / np.maximum(oa, 1e-6)
    L[m, :3] = np.clip(rgb, 0, 255)
    L[m, 3] = np.clip(oa[:, 0] * 255, 0, 255)


def grow(m, k=1):
    for _ in range(k):
        m = dilate(m)
    return m


def erode(m, k=1):
    for _ in range(k):
        m = ~dilate(~m)
    return m


def edge(m):
    return dilate(m) & ~m


def fade(arr, f):
    o = arr.copy()
    o[..., 3] = (o[..., 3].astype(float) * f).astype(np.uint8)
    return o


def zig(rng, x0, y0, x1, y1, seg=6, amp=4, ends=True):
    d = math.hypot(x1 - x0, y1 - y0)
    n = max(2, int(d / seg))
    nx, ny = -(y1 - y0) / (d or 1), (x1 - x0) / (d or 1)
    pts = []
    for i in range(n + 1):
        t = i / n
        o = 0 if (ends and i in (0, n)) else rng.uniform(-amp, amp) * (1 if i % 2 else -1) * rng.uniform(.4, 1)
        pts.append((x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o))
    return pts


def bolt(cv, pts, core=1, halo=3, hc='#3f7fff', bc='#8fd0ff', cc='#ffffff', ha=95, outer=None):
    """raio em camadas: halo externo, halo, corpo, núcleo."""
    m = cv.pline(pts, core)
    if outer:
        cv.b(grow(m, halo + outer) & ~grow(m, halo), '#2a4fd0', 45)
    cv.b(grow(m, halo) & ~grow(m, 1), hc, ha)
    cv.b(grow(m, 1) & ~m, bc, 235)
    cv.b(m, cc, 255)
    return m


def spark(cv, x, y, r=2, col='#bfe4ff', core='#ffffff'):
    for d in range(1, r + 1):
        a = 255 if d < r else 170
        for dx, dy in ((d, 0), (-d, 0), (0, d), (0, -d)):
            cv.put(x + dx, y + dy, col, a)
    cv.put(x, y, core)


def streak(cv, x, y, ang, ln, head='#ffffff', body='#8fe8ff', tail='#2f9cff'):
    dx, dy = math.cos(ang), math.sin(ang)
    for i in range(int(ln) + 1):
        t = i / max(1, ln)
        c = head if i < 1.5 else (body if t < .55 else tail)
        a = 255 if t < .7 else 170
        cv.put(x - dx * i, y - dy * i, c, a)


def save(name, frames):
    strip(frames).save(os.path.join(OUT, name + '.png'))
    print(name, len(frames), 'quadros')


# ====================================================================== RASENGAN

RS_BANDS = ['#1a6fd8', '#2f9cff', '#6fd0ff', '#c4f2ff', '#ffffff']


def ring_pts(cx, cy, r, tilt, phi, n=None):
    """anel 3D: círculo girado phi no eixo próprio e inclinado tilt na tela. -> [(x,y,z)]"""
    n = n or int(r * 9) + 24
    ct, st = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
    out = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y, z = r * math.cos(t), r * math.sin(t) * math.cos(phi), r * math.sin(t) * math.sin(phi)
        out.append((cx + x * ct - y * st, cy + x * st + y * ct, z))
    return out


def rasengan(cv, cx, cy, R, ph, rings=True, halo=True, rng=None, nsp=0, big=False):
    rw = 2 if big else 1
    if halo:
        cv.glow(cx, cy, R * 2.5 + 4, '#3fb8ff', 150)
        cv.glow(cx, cy, R * 1.6 + 2, '#8fe8ff', 140)
    rset = []
    if rings and R >= 2.5:
        for k, (tilt, spd, off) in enumerate(((15, 1.0, .3), (75, 1.4, 1.6), (135, .8, 2.7))):
            rr = R * (1.62 if not big else 1.55) + k * (.6 if not big else 1.5)
            rset.append(ring_pts(cx, cy, rr, tilt + ph * 8, ph * spd * 1.2 + off))
        for P in rset:  # metades de trás
            back = cv.dots([(x, y) for x, y, z in P if z < 0])
            if rw > 1:
                back = back | shift(back, 1, 0)
            cv.b(grow(back, 1) & ~back, '#1a6fd8', 70)
            cv.b(back, '#2a8fe0', 210)
    body = cv.disk(cx, cy, R)
    # faixas do corpo
    for k, col in enumerate(RS_BANDS):
        t = k / len(RS_BANDS)
        rr = R * (1, .86, .7, .5, .3)[k]
        ox, oy = -R * .2 * t, -R * .24 * t
        cv.b(cv.disk(cx + ox, cy + oy, rr) & body, col)
    if R >= 2.5:
        inner = erode(body, 1)
        arms = 3
        for a in range(arms):
            for dark in (True, False):
                pts = []
                base = ph * (math.pi / 6) + a * 2 * math.pi / arms + (math.pi / arms if dark else 0)
                steps = int(R * 6) + 8
                for i in range(steps):
                    u = i / steps
                    r = R * (.12 + .86 * u)
                    th = base + 2.6 * u
                    pts.append((cx + r * math.cos(th), cy + r * math.sin(th) * .92))
                m = cv.dots(pts)
                if big:
                    thick = cv.dots(pts[:int(len(pts) * .6)])
                    m = m | (dilate(thick) & ~cv.disk(cx, cy, R * .2))
                m &= inner
                if dark:
                    cv.b(m & ~cv.disk(cx - R * .2, cy - R * .25, R * .35), '#1a5fc8', 150)
                else:
                    cv.b(m, '#ffffff', 235)
        # reflexos
        cv.b(cv.disk(cx - R * .42, cy - R * .5, max(1, R * .18), max(.8, R * .12)), '#ffffff')
        rim = body & ~cv.disk(cx - .9, cy - 1.1, R) & ~edge(~body)
        cv.b(rim, '#8fe8ff', 200)
    cv.b(edge(body), '#0c2c66', 200 if R >= 2.5 else 140)
    for P in rset:  # metades da frente
        front = [(x, y) for x, y, z in P if z >= 0]
        m = cv.dots(front)
        if rw > 1:
            m = m | shift(m, 0, 1)
        cv.b(grow(m, 1) & ~m, '#3fb8ff', 110)
        cv.b(m, '#d8fbff')
        hot = cv.dots(front[len(front) // 3: 2 * len(front) // 3: 2])
        cv.b(hot & m, '#ffffff')
    if rng is not None:
        for _ in range(nsp):
            a = rng.uniform(0, 2 * math.pi)
            d = R * rng.uniform(1.25, 2.3)
            x, y = cx + d * math.cos(a), cy + d * math.sin(a)
            if rng.random() < .5:
                spark(cv, x, y, rng.choice([1, 2, 2, 3]))
            else:
                streak(cv, x, y, a + math.pi + 1.2, rng.randint(2, 5))


def rsg_esfera():
    fr = []
    for k, R in enumerate((1.5, 3, 4.5, 6.5)):
        cv = Cv(64, 64)
        rasengan(cv, 32, 32, R, k * 1.3, rng=random.Random(k), nsp=k + 1)
        fr.append(cv.out())
    for k in range(4):
        cv = Cv(64, 64)
        rasengan(cv, 32, 32, 6.5, k, rng=random.Random(10 + k), nsp=4)
        fr.append(cv.out())
    for k in range(2):
        cv = Cv(64, 64)
        rng = random.Random(30 + k)
        cv.glow(32, 32, 30, '#3fb8ff', 70)
        for arm in range(7):
            base = arm * 2 * math.pi / 7 + k * .45
            for j in range(3):
                u = (j + .5 * k + rng.uniform(0, .3)) / 3.2
                r = 9 + 20 * u
                th = base - 1.8 * u
                x, y = 32 + r * math.cos(th), 32 + r * math.sin(th)
                tang = th + math.pi / 2 + .6
                ln = 2 + int(4 * u)
                streak(cv, x, y, tang + math.pi, ln, '#ffffff', '#6fd0ff', '#2f9cff')
        rasengan(cv, 32, 32, 4, k * 2, rings=True, rng=rng, nsp=0)
        fr.append(cv.out())
    save('rsg_esfera', fr)


def rsg_gigante():
    fr = []
    for k in range(4):
        cv = Cv(128, 128)
        rasengan(cv, 64, 64, 16.5, k * .75, big=True, rng=random.Random(50 + k), nsp=9)
        fr.append(cv.out())
    save('rsg_gigante', fr)


def runner(cv, pose):
    """silhueta genérica de corredor virado para a direita (pés em y~60)."""
    F = cv.F
    sw = 1 if pose == 0 else -1
    sh = []
    sh += ell(37, 12, 5.5, 6)                            # cabeça
    sh += limb(33, 19, 28, 38, 11, 10)                   # tronco inclinado
    sh += limb(35, 22, 44, 28, 4.5, 4)                   # braço da frente
    sh += limb(44, 28, 51, 27, 4, 3.5)
    sh += limb(30, 22, 24 - 3 * sw, 30, 4.5, 4)          # braço de trás
    sh += limb(24 - 3 * sw, 30, 22 - 2 * sw, 36, 4, 3.5)
    if pose == 0:
        sh += limb(29, 38, 38, 47, 6, 5) + limb(38, 47, 37, 59, 5, 4) + limb(37, 59, 42, 60, 3.5, 3)
        sh += limb(27, 38, 21, 48, 6, 5) + limb(21, 48, 12, 52, 5, 4) + limb(12, 52, 11, 49, 3.5, 3)
    else:
        sh += limb(29, 38, 33, 49, 6, 5) + limb(33, 49, 30, 59, 5, 4) + limb(30, 59, 35, 60, 3.5, 3)
        sh += limb(27, 38, 23, 48, 6, 5) + limb(23, 48, 17, 55, 5, 4) + limb(17, 55, 14, 53, 3.5, 3)
    return F.mask(sh)


def rsg_rush():
    fr = []
    for k in range(2):
        cv = Cv(64, 64)
        m = runner(cv, k)
        fa = 1 if k == 0 else .7
        rows = np.zeros_like(m)
        rows[::2] = True
        cv.b(m & rows, '#4ad8ff', int(120 * fa))
        cv.b(m & ~rows, '#4ad8ff', int(65 * fa))
        cv.b(m & ~shift(m, 1, 1), '#bff4ff', int(170 * fa))
        cv.b(edge(m), '#8fe8ff', int(150 * fa))
        cv.b(edge(grow(m, 1)), '#3fb8ff', int(45 * fa))
        # recortes de 'scanline' na traseira
        for y in range(6, 60, 3):
            xs = np.where(m[y])[0]
            if len(xs):
                x0 = xs.min()
                ln = (y * 7 + k * 5) % 9 + 3
                cv.b(cv.seg(x0 - ln - 2, y, x0 - 2, y), '#6fd0ff', int(130 * fa))
        cv.b(cv.disk(52, 27, 3.2), '#bff4ff', int(200 * fa))
        cv.b(cv.disk(52, 27, 1.6), '#ffffff', int(230 * fa))
        fr.append(cv.out())
    for k in range(2):
        cv = Cv(64, 64)
        F = cv.F
        rng = random.Random(70 + k)
        if k == 0:
            puffs = [(28, 56, 5), (20, 57, 4), (35, 58, 3.5), (13, 57, 3)]
        else:
            puffs = [(24, 56, 6.5), (13, 55, 5), (36, 57, 4.5), (5, 54, 3.5), (44, 58, 3)]
        for x, y, r in puffs:
            F.part(ell(x, y, r, r * .72) + ell(x + r * .7, y + 1, r * .6, r * .5), '#9c8a70', ol='#3a3024',
                   light=.3, dark=.35, tex=.25, layer=cv.L)
            F.part(ell(x - r * .3, y - r * .3, r * .35, r * .25), '#b9a88c', shade=False, outline=False, layer=cv.L)
        for _ in range(9 + 4 * k):
            x, y = rng.uniform(4, 46), rng.uniform(44 - 6 * k, 58)
            cv.put(x, y, rng.choice(['#6e6250', '#9c8a70', '#4a4038']))
        for y in (49, 53):
            cv.b(cv.seg(40 + k * 4, y, 54 + k * 4, y), '#b9a88c', 110)
        fr.append(cv.out())
    save('rsg_rush', fr)


def shock_ring(cv, cx, cy, rx, th, a=1.0, broken=None, rng=None):
    ry = rx * .55
    outer = cv.disk(cx, cy, rx, ry)
    inner = cv.disk(cx, cy, rx - th, ry - th * .6)
    m = outer & ~inner
    if broken is not None:
        ang = np.arctan2((cv.Y - cy) / ry, cv.X - cx)
        keep = np.zeros_like(m)
        for a0, a1 in broken:
            keep |= (ang >= a0) & (ang <= a1)
        m &= keep
    cv.b(grow(m, 2) & ~m, '#3fb8ff', int(80 * a))
    cv.b(m, '#8fe8ff', int(235 * a))
    core = m & ~cv.disk(cx, cy, rx - 1, ry - .6)
    cv.b(core, '#ffffff', int(255 * a))
    cv.b(m & cv.disk(cx, cy, rx - th + 1, ry - th * .6 + .6) & ~cv.disk(cx, cy, rx - th + .01, 0.01 + ry - th * .6), '#2f9cff', int(200 * a))
    return m


def rsg_grind():
    fr = []
    for k in range(3):
        cv = Cv(128, 128)
        rng = random.Random(90 + k)
        ox, oy = 40, 64
        cv.glow(ox, oy, 26, '#3fb8ff', 120)
        for _ in range(28):
            a = rng.uniform(-1.0, 1.0)
            d = rng.uniform(10, 66)
            ln = rng.uniform(6, 18) * (1 - d / 110)
            x, y = ox + d * math.cos(a), oy + d * math.sin(a) + d * d * .004
            cols = ('#ffffff', '#ffd07a', '#ff8a3a') if rng.random() < .22 else ('#ffffff', '#8fe8ff', '#2f9cff')
            streak(cv, x, y, a + d * .002, ln, *cols)
            if d < 36:
                streak(cv, x, y + 1, a + d * .002, ln * .6, *cols)
        for _ in range(8):
            a = rng.uniform(-1.2, 1.2)
            d = rng.uniform(20, 60)
            cv.put(ox + d * math.cos(a), oy + d * math.sin(a), rng.choice(['#ffffff', '#8fe8ff', '#ffb347']))
        # estrela de impacto
        pts = []
        for i in range(16):
            ang = i * math.pi / 8 + k * .2
            rr = (9 if i % 4 == 0 else 6) if i % 2 == 0 else 2.6
            pts.append((ox + rr * math.cos(ang), oy + rr * math.sin(ang)))
        m = cv.shp([pts])
        cv.b(grow(m, 1) & ~m, '#2f9cff', 220)
        cv.b(m, '#bff4ff')
        cv.b(cv.disk(ox, oy, 2.6), '#ffffff')
        # pedaço da esfera tocando (borda esquerda)
        rasengan(cv, ox - 13, oy, 9, k * 1.5, rings=False, halo=False)
        fr.append(cv.out())
    cx, cy = 64, 64
    # flash
    cv = Cv(128, 128)
    cv.glow(cx, cy, 40, '#3fb8ff', 170)
    cv.glow(cx, cy, 24, '#bff4ff', 200)
    m = cv.disk(cx, cy, 14)
    cv.b(grow(m, 2) & ~m, '#8fe8ff', 230)
    cv.b(m, '#ffffff')
    for i in range(8):
        a = i * math.pi / 4 + .2
        bolt(cv, [(cx + 15 * math.cos(a), cy + 15 * math.sin(a)), (cx + 26 * math.cos(a), cy + 26 * math.sin(a))], 1, 1)
    fr.append(cv.out())
    # bola de vento abrindo
    cv = Cv(128, 128)
    shock_ring(cv, cx, cy + 4, 34, 4)
    cv.glow(cx, cy, 44, '#3fb8ff', 130)
    rasengan(cv, cx, cy, 24, 1, rings=False, halo=False, big=True)
    body = cv.disk(cx, cy, 24)
    for a in range(4):
        pts = [(cx + r * math.cos(a * math.pi / 2 + r * .09), cy + r * math.sin(a * math.pi / 2 + r * .09)) for r in np.linspace(6, 34, 60)]
        mm = cv.dots(pts)
        cv.b(grow(mm, 1) & ~body, '#3fb8ff', 120)
        cv.b(mm, '#ffffff', 220)
    fr.append(cv.out())
    # anel
    for k in range(2):
        cv = Cv(128, 128)
        rng = random.Random(120 + k)
        if k == 0:
            cv.glow(cx, cy, 34, '#3fb8ff', 90)
            cv.b(cv.disk(cx, cy, 16), '#6fd0ff', 120)
            cv.b(cv.disk(cx - 2, cy - 2, 9), '#c4f2ff', 150)
            for a in range(4):
                pts = [(cx + r * math.cos(a * math.pi / 2 + r * .12 + 1), cy + r * math.sin(a * math.pi / 2 + r * .12 + 1)) for r in np.linspace(8, 26, 40)]
                cv.b(cv.dots(pts), '#ffffff', 170)
            shock_ring(cv, cx, cy + 4, 50, 4)
        else:
            for _ in range(5):
                x, y, r = cx + rng.uniform(-30, 30), cy + rng.uniform(-14, 14), rng.uniform(4, 7)
                cv.F.part(ell(x, y, r, r * .75) + ell(x + r * .6, y + 1, r * .6, r * .5), '#5a5868', ol='#2a2830', light=.25, layer=cv.L)
            arcs = [(-3.0, -2.2), (-1.8, -0.9), (-0.5, 0.5), (0.9, 1.7), (2.0, 2.9)]
            shock_ring(cv, cx, cy + 4, 60, 3, a=.8, broken=arcs)
        for _ in range(10 + 6 * k):
            a = rng.uniform(0, 2 * math.pi)
            d = rng.uniform(20, 46 + 10 * k)
            x, y = cx + d * math.cos(a), cy + 4 + d * math.sin(a) * .55 - rng.uniform(0, 14)
            if rng.random() < .5:
                cv.F.part(ell(x, y, 1.6, 1.2), rng.choice(['#6b6a66', '#77736e']), ol='#2a2830', layer=cv.L)
            else:
                streak(cv, x, y, a + math.pi, rng.randint(2, 5))
        fr.append(cv.out())
    save('rsg_grind', fr)


def spiral_pts(cx, cy, r0, r1, turns, ph=0, sq=.55, n=None):
    n = n or int(turns * (r1 + r0) * 4)
    pts = []
    for i in range(n):
        u = i / (n - 1)
        r = r0 + (r1 - r0) * u
        th = ph + turns * 2 * math.pi * u
        pts.append((cx + r * math.cos(th), cy + r * math.sin(th) * sq, u))
    return pts


def scar_mark(cv, state, crater):
    F = cv.F
    cx, cy = 64, 48
    lay = np.zeros_like(cv.L)
    tmp = Cv(cv.w, cv.h)
    if crater:
        rx, ry = 42, 23
        soot = tmp.disk(cx, cy, rx + 10, ry + 7)
        hsh = F.mask([[(x, y) for x, y in ell(cx, cy, rx + 10, ry + 7)[0]]])
        tmp.b(soot & (np.indices(soot.shape)[0] % 1 == 0), '#2a2228', 110)
        # rachaduras
        rng = random.Random(7)
        for i in range(7):
            a = i * 2 * math.pi / 7 + rng.uniform(-.2, .2)
            pts = [(cx + (rx - 2) * math.cos(a), cy + (ry - 1) * math.sin(a))]
            for j in range(3):
                a += rng.uniform(-.3, .3)
                rr = rx + 4 + j * 4.5
                pts.append((cx + rr * math.cos(a), cy + rr * .56 * math.sin(a)))
            tmp.b(tmp.pline(pts), '#141018')
        pit = tmp.disk(cx, cy, rx, ry)
        tmp.b(pit, '#3a3640')
        tmp.b(pit & ~tmp.disk(cx + 3, cy + 3, rx - 1, ry - 1), '#1c1a22')        # parede de cima (sombra)
        tmp.b(pit & ~tmp.disk(cx - 3, cy - 3, rx - 1, ry - 1), '#5a5662')        # parede de baixo-direita (luz)
        tmp.b(tmp.disk(cx + 1, cy + 1, rx - 9, ry - 6), '#26222c')
        tmp.b(tmp.disk(cx + 1, cy + 2, rx - 22, ry - 13), '#1c1a22')
        sp = []
        for a in range(3):
            sp.append(spiral_pts(cx + 1, cy + 1, 3, rx - 4, .9, ph=a * 2 * math.pi / 3, sq=ry / rx))
    else:
        rx, ry = 34, 19
        soot = tmp.disk(cx, cy, rx + 3, ry + 3)
        tmp.b(soot, '#2a2228', 90)
        tmp.b(tmp.disk(cx, cy, rx - 8, ry - 5), '#2a2228', 60)
        sp = [spiral_pts(cx, cy, 2, rx, 2.4, sq=ry / rx), spiral_pts(cx, cy, 6, rx - 6, 1.7, ph=math.pi, sq=ry / rx)]
    grooves = tmp.none()
    for S in sp:
        for x, y, u in S:
            w = 1 + (2 if crater else 1.2) * math.sin(u * math.pi)
            grooves |= tmp.disk(x, y, w * .7 + .3, w * .55 + .3)
    if state == 0:
        tmp.b(grow(grooves, 2) & ~grooves, '#3fb8ff', 90)
        tmp.b(grow(grooves, 1) & ~grooves, '#6fd0ff', 200)
        tmp.b(grooves, '#bff4ff')
        tmp.b(erode(grooves, 1), '#ffffff')
    else:
        tmp.b(shift(grooves, -1, -1) & ~grooves, '#6a6672')
        tmp.b(grooves, '#16121a')
        tmp.b(grooves & ~shift(grooves, 1, 1), '#2e2a34')
    if crater:
        rng = random.Random(3)
        for i in range(22):
            a = rng.uniform(0, 2 * math.pi)
            d = rng.uniform(1.0, 1.18)
            x, y = cx + rx * d * math.cos(a), cy + ry * d * math.sin(a)
            r = rng.uniform(1.2, 2.8)
            F.part(ell(x, y, r, r * .75, rot=rng.uniform(0, 90), n=7), rng.choice(['#5a5662', '#77736e', '#4a4650']),
                   ol='#16121a', light=.3, layer=tmp.L)
        if state == 0:
            tmp.glow(cx, cy, 30, '#3fb8ff', 70)
    else:
        rng = random.Random(4)
        for i in range(10):
            a = rng.uniform(0, 2 * math.pi)
            x, y = cx + (rx + 2) * math.cos(a), cy + (ry + 2) * math.sin(a)
            F.part(ell(x, y, 1.2, .9, n=6), '#5a5662', ol='#16121a', layer=tmp.L)
        if state == 0:
            for x, y, u in sp[0][::23]:
                spark(tmp, x, y - 3, 1)
    L = tmp.L
    if state == 2:
        L = fade(L, .3)
    return L


def rsg_cicatriz():
    fr = []
    for crater in (False, True):
        for st in range(3):
            cv = Cv(128, 96)
            fr.append(scar_mark(cv, st, crater))
    save('rsg_cicatriz', fr)


# ====================================================================== GETSUGA

def flame_shape(cx, gy, W, H, ph, sc=1.0, tongues=7):
    """labareda = corpo elíptico + línguas curvas afinando para cima."""
    W, H = W * sc, H * sc
    sh = ell(cx, gy - H * .2, W, H * .16) + ell(cx, gy - 2, W * .92, 8)
    sh += poly((cx - W, gy - H * .2), (cx + W, gy - H * .2), (cx + W * .92, gy - 2), (cx - W * .92, gy - 2))
    for i in range(tongues):
        u = (i + .5) / tongues
        x0 = cx - W * .9 + 1.8 * W * u
        prof = math.sin(u * math.pi)
        h = H * (.42 + .58 * prof) * ((.95 if i % 2 else .74) + .14 * math.sin(ph * 1.7 + i * 2.3))
        lean = (u - .5) * 10 + 3 * math.sin(ph + i)
        pts = []
        for k in range(6):
            t = k / 5
            pts.append((x0 + lean * t * t + 2.5 * math.sin(t * 5 + ph + i), gy - H * .2 - (h - H * .2) * t))
        sh += chain(pts, W * .42 * (1.1 - .3 * abs(u - .5)), 1)
    return sh


def aura_layers(cv, m, ph=0):
    cv.b(grow(m, 2) & ~m, '#1a0a12', 150)
    cv.b(m, '#1a0a12', 205)
    band = m & ~erode(m, 3)
    cv.b(erode(m, 1) & ~erode(m, 3), '#c8323a', 235)
    cv.b(erode(m, 3) & ~erode(m, 4), '#ff5a5a', 240)
    cv.b(erode(m, 4) & ~erode(m, 6), '#7a1020', 90)
    cv.b(erode(m, 6), '#c8323a', 40)
    # veios internos escuros
    return band


def gts_aura():
    fr = []
    for k, sc in enumerate((.9, 1.0, 1.08)):
        cv = Cv(128, 128)
        rng = random.Random(200 + k)
        ph = k * 2.1
        cv.glow(64, 74, 62 * sc, '#c8323a', 90)
        m = cv.shp(flame_shape(64, 112, 28, 92, ph, sc))
        # língua da lâmina (atrás do ombro direito, sobe para cima-esquerda)
        bl = cv.shp(chain([(76, 50), (66, 30), (56, 12 - 4 * k), (52, 4 - 4 * k)], 13 * sc, 2))
        tongue = cv.shp(chain([(70, 44), (60, 22), (51, 9 - 4 * k)], 8, 1))
        m = m | bl
        aura_layers(cv, m, ph)
        cv.b(erode(tongue, 1), '#ff5a5a', 200)
        cv.b(erode(tongue, 2), '#ffe8e0', 230)
        # lambidas internas
        for j in range(6):
            x = 42 + j * 8.5 + (k * 3) % 5
            hh = 18 + (j * 11 + k * 7) % 26
            pts = [(x + math.sin(t * .25 + ph + j) * 2, 106 - t) for t in range(0, hh, 2)]
            tg = cv.shp(chain(pts, 4, 1)) & erode(m, 6)
            cv.b(tg, '#c8323a', 110)
            cv.b(cv.pline(pts) & erode(m, 7), '#ff5a5a', 150)
        # partículas escuras sugadas
        for j in range(10):
            a = j * 2 * math.pi / 10 + k * .3
            d = 36 + ((j * 13 + k * 7) % 22)
            x, y = 64 + d * math.cos(a), 64 + d * .9 * math.sin(a)
            q = cv.disk(x, y, 1.4)
            cv.b(edge(q), '#c8323a', 230)
            cv.b(q, '#120a10')
            tx, ty = x + 3 * math.cos(a), y + 3 * math.sin(a)
            cv.b(cv.seg(x + 2 * math.cos(a), y + 2 * math.sin(a), tx, ty), '#4a0e1a', 180)
        # faíscas vermelhas subindo
        for j in range(8):
            x = rng.uniform(36, 92)
            y = rng.uniform(16, 96)
            ln = rng.randint(2, 4)
            cv.b(cv.seg(x, y + 1, x, y + ln), '#ff5a5a')
            cv.b(cv.seg(x, y + ln + 1, x, y + ln + 2), '#7a1020', 200)
            cv.put(x, y, '#ffe8e0')
        fr.append(cv.out())
    save('gts_aura', fr)


def moon(cv, cx, cy, R, thick, R2f, tilt=0, ph=0, rng=None, giant=False, tips=0, cut=.55):
    t = math.radians(tilt)
    d = thick - R + R * R2f
    icx, icy = cx - d * math.cos(t), cy - d * math.sin(t)
    outer = cv.disk(cx, cy, R)
    inner = cv.disk(icx, icy, R * R2f)
    m = outer & ~inner
    # corta a parte de trás (só a crescente)
    m &= ((cv.X - cx) * math.cos(t) + (cv.Y - cy) * math.sin(t)) > -R * cut
    tips = 0
    if tips:
        for s in (-1, 1):
            a0 = t + s * math.radians(78)
            px_, py_ = cx + R * .96 * math.cos(a0), cy + R * .96 * math.sin(a0)
            a1 = a0 + s * math.radians(28)
            pts = [(px_, py_), (cx + R * 1.0 * math.cos(a1) - tips * math.cos(t), cy + R * math.sin(a1) - tips * .4 * math.sin(t))]
            pts = [(px_ + 2 * math.cos(t), py_)] + [((pts[0][0] + pts[1][0]) / 2 - 1.5 * math.cos(t), (pts[0][1] + pts[1][1]) / 2 + s * 1.5)] + [pts[1]]
            m |= cv.pline(pts, 3) & ~inner
    return m, (icx, icy)


def draw_moon(cv, cx, cy, R, thick, R2f, ph, rng, giant=False, sharp=False):
    rimw = 4 if giant else 2
    m, ic = moon(cv, cx, cy, R, thick, R2f, ph=ph, cut=(.8 if sharp else .3) if not giant else .5)
    # rastro (atrás, para a esquerda)
    ys = np.where(m.any(1))[0]
    y0, y1 = ys.min(), ys.max()
    nstr = 16 if giant else 10
    for j in range(nstr):
        y = y0 + 3 + (y1 - y0 - 6) * (j + .5) / nstr + rng.uniform(-1, 1)
        yi = int(y)
        xs = np.where(m[yi])[0] if 0 <= yi < cv.h else []
        if not len(xs):
            continue
        xb = xs.min() + 2
        ln = rng.uniform(.35, 1.0) * (90 if giant else 64) * (1 - abs((y - cy) / R) * .6)
        w = rng.choice([1, 2, 2, 3]) * (2 if giant else 1)
        steps = [(0, .35, 150), (.35, .7, 95), (.7, 1, 45)]
        for a0, a1, al in steps:
            seg = cv.none()
            yy0, yy1 = max(0, yi - w // 2), min(cv.h, yi - w // 2 + w)
            xa, xb2 = int(xb - ln * a1), int(xb - ln * a0)
            seg[yy0:yy1, max(0, xa):max(0, xb2)] = True
            cv.b(seg & ~m, '#ff3a40', al)
        if rng.random() < .4:
            x = xb - ln * rng.uniform(.2, .9)
            cv.b(cv.seg(x - 4, yi + 2, x, yi + 2), '#1a0a12', 200)
    for _ in range(8 if giant else 5):
        x = cx - R * rng.uniform(.3, 1.4)
        y = rng.uniform(y0, y1)
        cv.put(x, y, '#ff5a5a')
        cv.put(x + 1, y, '#ffe8e0')
    # halo
    cv.b(grow(m, 4 if giant else 3) & ~grow(m, 2), '#7a1020', 70)
    cv.b(grow(m, 2) & ~m, '#ff3a40', 115)
    # corpo
    cv.b(m, '#120a10')
    # veios internos (arcos concêntricos)
    for k in range(3 if giant else 2):
        rr = R - rimw - 3 - k * (thick / (4 if giant else 3.2))
        ring = cv.disk(cx, cy, rr) & ~cv.disk(cx, cy, rr - 1)
        sel = ring & m & ~grow(~m, 2)
        ang = np.arctan2(cv.Y - cy, cv.X - cx)
        sel &= (np.sin(ang * (7 + k) + ph * 3 + k) > -.2)
        cv.b(sel, '#4a0e1a' if k % 2 == 0 else '#7a1020')
    outer_rim = m & ~cv.disk(cx, cy, R - rimw)
    cv.b(outer_rim, '#c8323a')
    cv.b(outer_rim & ~cv.disk(cx - .8, cy - 1, R - .5), '#ff5a5a')
    thread = m & cv.disk(cx, cy, R - rimw) & ~cv.disk(cx, cy, R - rimw - 1)
    cv.b(thread & ~grow(~m, 1), '#fff0ea')
    if giant:
        t2 = m & cv.disk(cx, cy, R - rimw - 4) & ~cv.disk(cx, cy, R - rimw - 5) & ~grow(~m, 3)
        dotsm = np.zeros_like(t2)
        dotsm[:, ::3] = True
        cv.b(t2 & dotsm, '#ff9a9a')
    concave = m & grow(cv.disk(ic[0], ic[1], R * R2f), 1)
    cv.b(concave, '#7a1020')
    cv.b(edge(m), '#3a0610', 230)
    return m


def gts_lua():
    fr = []
    for sharp in (False, True):
        for k in range(3):
            cv = Cv(128, 128)
            rng = random.Random(300 + k + 10 * sharp)
            if sharp:
                draw_moon(cv, 78, 64, 40, 11, 1.02, k, rng, sharp=True)
            else:
                draw_moon(cv, 80, 64, 36, 24, .8, k, rng)
            fr.append(cv.out())
    save('gts_lua', fr)


def gts_lua_gigante():
    fr = []
    for k in range(3):
        cv = Cv(256, 256)
        rng = random.Random(400 + k)
        cx, cy = 140, 128
        cv.glow(cx - 18, cy, 92, '#e8dccc', 70)
        full = cv.disk(cx - 18, cy, 72)
        cv.b(full, '#e8dccc', 75)
        for (x, y, r) in ((-30, -26, 12), (8, 20, 9), (-44, 18, 7), (-10, -48, 6), (20, -16, 5), (-52, -6, 4)):
            cr = cv.disk(cx - 18 + x, cy + y, r, r * .9)
            cv.b(cr, '#c8bca8', 70)
            cv.b(cr & ~shift(cr, -1, -1), '#f4ece0', 60)
        cv.b(edge(full), '#f4ece0', 110)
        draw_moon(cv, cx, cy, 64, 30, .9, k, rng, giant=True)
        fr.append(cv.out())
    save('gts_lua_gigante', fr)


def speed_lines(cv, cx, cy, r0, n, seed, inv=False):
    rng = random.Random(seed)
    for i in range(n):
        a = i * 2 * math.pi / n + rng.uniform(-.08, .08)
        r1 = r0 + rng.uniform(0, 14)
        r2 = 100
        w = rng.choice([1.2, 2, 2.6])
        p = [(cx + r1 * math.cos(a), cy + r1 * math.sin(a)),
             (cx + r2 * math.cos(a + w * .012), cy + r2 * math.sin(a + w * .012)),
             (cx + r2 * math.cos(a - w * .012), cy + r2 * math.sin(a - w * .012))]
        white = (i % 2 == 0) != inv
        cv.b(cv.shp([p]), '#fff8f0' if white else '#0a0608', 235)


def gts_impacto():
    fr = []
    for inv in (False, True):
        cv = Cv(128, 128)
        speed_lines(cv, 64, 64, 26, 34, 500 + inv, inv)
        a = math.radians(-30)
        ux, uy = math.cos(a), math.sin(a)
        nx, ny = -uy, ux
        hw = 11
        band = cv.shp([[(64 - ux * 120 + nx * hw, 64 - uy * 120 + ny * hw), (64 + ux * 120 + nx * hw, 64 + uy * 120 + ny * hw),
                        (64 + ux * 120 - nx * hw, 64 + uy * 120 - ny * hw), (64 - ux * 120 - nx * hw, 64 - uy * 120 - ny * hw)]])
        cv.b(grow(band, 2) & ~band, '#0a0608' if inv else '#fff8f0')
        cv.b(band, '#fff8f0' if inv else '#0a0608')
        cv.b(grow(band, 3) & ~grow(band, 2), '#c8323a' if not inv else '#0a0608', 200)
        # fio de corte dentro da faixa
        cv.b(cv.seg(64 - ux * 90, 64 - uy * 90, 64 + ux * 90, 64 + uy * 90) & band, '#c8323a' if not inv else '#7a1020')
        fr.append(cv.out())
    a = math.radians(-35)
    ux, uy = math.cos(a), math.sin(a)
    for k in range(3):
        cv = Cv(128, 128)
        rng = random.Random(520 + k)
        L = 42 - k * 4
        p0, p1 = (64 - ux * L, 64 - uy * L), (64 + ux * L, 64 + uy * L)
        line = cv.seg(*p0, *p1)
        if k == 0:
            core = grow(line, 1)
            cv.b(grow(core, 3) & ~grow(core, 1), '#c8323a', 110)
            cv.b(grow(core, 1) & ~core, '#ff5a5a', 230)
            cv.b(core, '#ffffff')
            for s in (-1, 1):
                ex, ey = 64 + s * ux * L, 64 + s * uy * L
                spark(cv, ex, ey, 3, '#ff9a9a')
        elif k == 1:
            cv.b(grow(line, 2) & ~grow(line, 1), '#c8323a', 70)
            cv.b(grow(line, 1) & ~line, '#ff5a5a', 200)
            cv.b(line, '#ffffff')
        else:
            dm = np.zeros_like(line)
            dm[(np.indices(line.shape).sum(0) // 3) % 2 == 0] = True
            ln = line & dm
            cv.b(grow(ln, 1) & ~ln, '#c8323a', 90)
            cv.b(ln, '#fff0ea', 220)
        for _ in range(3 + 2 * (2 - k)):
            t = rng.uniform(-1, 1)
            x, y = 64 + ux * L * t, 64 + uy * L * t
            ang = a + math.pi / 2 * rng.choice([-1, 1]) + rng.uniform(-.5, .5)
            d = rng.uniform(3, 10)
            streak(cv, x + d * math.cos(ang), y + d * math.sin(ang), ang, rng.randint(2, 4), '#ffffff', '#ff9a9a', '#c8323a')
        fr.append(cv.out())
    save('gts_impacto', fr)


def groove(cv, state, wide):
    F = cv.F
    cy = 32
    hw = 9 if wide else 3
    x0, x1 = 6, 122
    top, bot = [], []
    for i in range(41):
        u = i / 40
        x = x0 + (x1 - x0) * u
        taper = min(1, u / .12, (1 - u) / .12) ** .8
        w = hw * taper + .3
        j = math.sin(u * 37) * .4
        top.append((x, cy - w + j))
        bot.append((x, cy + w * .9 + j))
    m = cv.shp([top + bot[::-1]])
    rng = random.Random(600 + wide)
    tmp = Cv(cv.w, cv.h)
    # fuligem ao redor
    tmp.b(grow(m, 3 if wide else 2) & ~m, '#2a2228', 110)
    tmp.b(m, '#120c10')
    tmp.b(m & ~shift(m, 0, -2 if not wide else -5), '#2e2228')            # parede de cima (vê-se por dentro)
    tmp.b(m & ~shift(m, 0, 1) & ~shift(m, 0, -(2 if not wide else 5)) | (m & ~shift(m, 0, -1)), '#2e2228')
    tmp.b(edge(m) & shift(m, 0, -1), '#5a5262')                               # lábio de baixo iluminado
    if wide:
        mid = m & shift(m, 0, -6) & shift(m, 0, 4)
        tmp.b(mid & ~shift(mid, 0, -1), '#1e161c')
        for i in range(16):
            x = rng.uniform(16, 112)
            tmp.b(tmp.seg(x, cy - 5, x + rng.uniform(-2, 2), cy + 2) & m, '#1e161c')
    # cascalho
    for i in range(30 if wide else 18):
        x = rng.uniform(8, 120)
        s = rng.choice([-1, 1])
        y = cy + s * (hw + rng.uniform(1.5, 4 + 2 * wide))
        r = rng.uniform(.9, 1.8 + wide)
        F.part(ell(x, y, r, r * .75, n=7), rng.choice(['#5a5662', '#77736e', '#4a4650']), ol='#16121a', light=.3, layer=tmp.L)
    rim = edge(m) & ~shift(m, 0, -1) | (m & ~shift(m, 0, 1))
    rim_top = (m & ~shift(m, 0, 1)) | (edge(m) & shift(m, 0, 1))
    if state == 0:
        tmp.b(grow(m, 5) & ~grow(m, 3), '#c8323a', 40)
        tmp.b(grow(m, 3) & ~m, '#c8323a', 70)
        tmp.b(grow(rim_top, 1) & ~m, '#c8323a', 150)
        tmp.b(rim_top, '#ff5a5a')
        lip = edge(m) & shift(m, 0, -1)
        tmp.b(lip, '#c8323a')
        hot = rim_top & (np.indices(m.shape)[1] % 7 == 0)
        tmp.b(hot, '#ffd0a0')
        for i in range(10 + 8 * wide):
            x = rng.uniform(12, 116)
            y = cy + rng.uniform(-hw + 1, hw - 1)
            tmp.put(x, y, rng.choice(['#ff5a5a', '#ffb347', '#ffd0a0']))
        for i in range(5):
            x = rng.uniform(16, 112)
            tmp.put(x, cy - hw - rng.uniform(4, 10), '#ff5a5a')
    elif state == 1:
        tmp.b(rim_top, '#7a1020')
        hot = rim_top & (np.indices(m.shape)[1] % 11 == 3)
        tmp.b(hot, '#c8323a')
        for i in range(5):
            x = rng.uniform(14, 114)
            F.part(ell(x, cy - hw - 6, 3 + wide, 2), '#5a5868', ol='#2a2830', light=.25, layer=tmp.L)
            tmp.b(tmp.disk(x - 1, cy - hw - 7, 1.2), '#7a7888')
    else:
        tmp.b(rim_top, '#2a2228')
    L = tmp.L
    if state == 2:
        L = fade(L, .3)
    return L


def wall_cut(cv, hot):
    F = cv.F
    cy = 30
    rng = random.Random(700)
    tmp = Cv(cv.w, cv.h)
    # reboco lascado em volta
    chip = tmp.none()
    for i in range(14):
        x = 14 + i * 7.3 + rng.uniform(-2, 2)
        chip |= tmp.disk(x, cy + rng.uniform(-1, 1), rng.uniform(3, 6), rng.uniform(4, 7))
    tmp.b(chip, '#77736e')
    tmp.b(chip & ~shift(chip, 1, 1), '#a8a49c')
    tmp.b(edge(chip), '#3c3840')
    slit = tmp.shp([[(10, cy), (30, cy - 2.4), (100, cy - 2.2), (120, cy + .2), (100, cy + 2.2), (30, cy + 2)]])
    for i in range(7):
        x = rng.uniform(20, 110)
        s = rng.choice([-1, 1])
        pts = [(x, cy + s * 2)]
        for j in range(3):
            pts.append((pts[-1][0] + rng.uniform(-4, 4), pts[-1][1] + s * rng.uniform(3, 6)))
        tmp.b(tmp.pline(pts), '#141018')
    tmp.b(slit, '#0a0608')
    rim = edge(slit)
    if hot:
        tmp.b(grow(slit, 6) & ~grow(slit, 3), '#c8323a', 45)
        tmp.b(grow(slit, 2) & ~grow(slit, 1), '#c8323a', 120)
        tmp.b(rim, '#ff5a5a')
        tmp.b(rim & (np.indices(rim.shape)[1] % 6 == 0), '#ffd0a0')
        for i in range(6):
            tmp.put(rng.uniform(20, 110), cy + rng.uniform(4, 12), '#ff5a5a')
    else:
        tmp.b(rim & ~shift(slit, 0, 1), '#2a2228')
        tmp.b(rim & shift(slit, 0, 1), '#5a5262')
    return tmp.L


def gts_sulco():
    fr = []
    for wide in (False, True):
        for st in range(3):
            fr.append(groove(Cv(128, 64), st, wide))
    for hot in (True, False):
        fr.append(wall_cut(Cv(128, 64), hot))
    save('gts_sulco', fr)


# ====================================================================== CHIDORI

def chidori_ball(cv, cx, cy, d):
    r = d / 2
    cv.glow(cx, cy, r * 2.6 + 3, '#4a8fe0', 150)
    cv.glow(cx, cy, r * 1.6 + 1, '#bfe4ff', 120)
    b = cv.disk(cx, cy, r)
    cv.b(edge(b), '#10204a', 170)
    cv.b(b, '#4a8fe0')
    cv.b(cv.disk(cx - .3, cy - .4, r * .8) & b, '#bfe4ff')
    cv.b(cv.disk(cx - .5, cy - .6, r * .5), '#ffffff')


def chd_mao():
    fr = []
    cx, cy = 32, 32
    for k, d in enumerate((5, 9, 14)):
        cv = Cv(64, 64)
        rng = random.Random(800 + k)
        chidori_ball(cv, cx, cy, d)
        for j in range(3 + k * 2):
            a = rng.uniform(0, 2 * math.pi) if j else math.pi / 2 + rng.uniform(-.4, .4)
            r0, r1 = d / 2, d / 2 + 6 + 5 * k
            bolt(cv, zig(rng, cx + r0 * math.cos(a), cy + r0 * math.sin(a), cx + r1 * math.cos(a), cy + r1 * math.sin(a), 3, 2), 1, 1)
        for j in range(2 + k):
            spark(cv, cx + rng.uniform(-14, 14), cy + rng.uniform(-14, 14), 1)
        fr.append(cv.out())
    for k in range(4):
        cv = Cv(64, 64)
        rng = random.Random(820 + k)
        chidori_ball(cv, cx, cy, 14)
        angs = [rng.uniform(0, 2 * math.pi) for _ in range(5 + k % 3)] + [math.pi / 2 + rng.uniform(-.5, .5)]
        for a in angs:
            r1 = rng.uniform(18, 29)
            pts = zig(rng, cx + 6 * math.cos(a), cy + 6 * math.sin(a), cx + r1 * math.cos(a), cy + r1 * math.sin(a), 4, 3)
            bolt(cv, pts, 1, 2)
            if rng.random() < .7:
                i = rng.randint(1, len(pts) - 2)
                b2 = a + rng.choice([-1, 1]) * rng.uniform(.5, 1)
                q = pts[i]
                bolt(cv, zig(rng, q[0], q[1], q[0] + 8 * math.cos(b2), q[1] + 8 * math.sin(b2), 3, 2), 1, 1)
            spark(cv, cx + (r1 + 2) * math.cos(a), cy + (r1 + 2) * math.sin(a), 1)
        cv.b(cv.disk(cx - 1, cy - 1, 3), '#ffffff')
        fr.append(cv.out())
    cv = Cv(64, 64)
    cv.glow(cx, cy, 30, '#4a8fe0', 160)
    ring = cv.disk(cx, cy, 20) & ~cv.disk(cx, cy, 19)
    cv.b(grow(ring, 1) & ~ring, '#3f7fff', 90)
    cv.b(ring, '#bfe4ff')
    chidori_ball(cv, cx, cy, 14)
    for a, ln in ((0, 24), (math.pi / 2, 24), (math.pi, 24), (-math.pi / 2, 24), (math.pi / 4, 10), (3 * math.pi / 4, 10), (-math.pi / 4, 10), (-3 * math.pi / 4, 10)):
        for i in range(ln):
            w = 1 if i < ln * .55 else 0
            x, y = cx + i * math.cos(a), cy + i * math.sin(a)
            cv.put(x, y, '#ffffff' if i < ln * .7 else '#bfe4ff')
            if w and ln > 12:
                cv.put(x - math.sin(a), y + math.cos(a), '#bfe4ff', 220)
    fr.append(cv.out())
    save('chd_mao', fr)


def tile_zig(rng, w=128, y=16, amp=6, seg=7):
    pts = [(0, y)]
    x = 0
    side = 1
    while True:
        x += rng.uniform(seg * .5, seg * 1.6)
        if x >= w - 3:
            break
        side = -side if rng.random() < .8 else side
        pts.append((x, y + side * rng.uniform(.2, 1) * amp))
    pts.append((w, y))
    return pts


def chd_rastro():
    fr = []
    shapes = []
    for k in range(3):
        cv = Cv(128, 32)
        rng = random.Random(900 + k)
        pts = tile_zig(rng)
        shapes.append(pts)
        m = cv.pline(pts, 2)
        cv.b(grow(m, 5) & ~grow(m, 3), '#3f7fff', 50)
        cv.b(grow(m, 3) & ~grow(m, 1), '#3f7fff', 115)
        cv.b(grow(m, 1) & ~m, '#8fd0ff')
        cv.b(m, '#ffffff')
        for j in range(2):
            i = rng.randint(2, len(pts) - 3)
            q = pts[i]
            s = 1 if q[1] > 16 else -1
            b = zig(rng, q[0], q[1], q[0] + rng.uniform(4, 10), q[1] + s * rng.uniform(5, 9), 3, 1.5)
            bolt(cv, b, 1, 1)
        fr.append(cv.out())
    for k in range(2):
        cv = Cv(128, 32)
        rng = random.Random(950 + k)
        pts = shapes[0]
        m = cv.pline(pts, 1 if k else 2)
        if k == 0:
            cv.b(grow(m, 3) & ~grow(m, 1), '#3f7fff', 60)
            cv.b(grow(m, 1) & ~m, '#4a8fe0', 200)
            cv.b(m, '#8fd0ff')
            ns = 4
        else:
            dm = np.zeros_like(m)
            dm[:, (np.arange(128) // 4) % 2 == 0] = True
            cv.b(grow(m & dm, 1) & ~m, '#3f7fff', 45)
            cv.b(m & dm, '#4a8fe0', 130)
            ns = 2
        for j in range(ns):
            x = rng.uniform(8, 120)
            yy = np.where(m[:, int(x)])[0]
            y = (yy.mean() if len(yy) else 16) + rng.uniform(-5, 5)
            spark(cv, x, y, 1 + (k == 0))
        fr.append(cv.out())
    save('chd_rastro', fr)


def chd_trovao():
    fr = []
    gy = 180
    cx = 32
    for k in range(3):
        cv = Cv(64, 192)
        rng = random.Random(1000 + (k if k < 2 else 0))
        pts = zig(rng, cx + rng.uniform(-6, 6), 0, cx, gy, 11, 7)
        core = 3 if k < 2 else 1
        for rr, al in ((26, 40), (18, 70), (11, 110)):
            cv.b(cv.disk(cx, gy, rr, rr * .32), '#3f7fff', al if k < 2 else al // 2)
        for j in range(4 if k < 2 else 2):
            i = rng.randint(2, len(pts) - 4)
            q = pts[i]
            s = rng.choice([-1, 1])
            ln = rng.uniform(10, 24)
            b = zig(rng, q[0], q[1], q[0] + s * ln * .8, q[1] + ln, 4, 2.5)
            bolt(cv, b, 1, 2, ha=80)
            if rng.random() < .5:
                q2 = b[len(b) // 2]
                bolt(cv, zig(rng, q2[0], q2[1], q2[0] + s * 6, q2[1] + 7, 3, 1.5), 1, 1, ha=60)
        bolt(cv, pts, core, 5 if k < 2 else 3, ha=95 if k < 2 else 70, outer=4 if k < 2 else None)
        if k < 2:
            cv.b(cv.disk(cx, gy, 6, 2.5), '#ffffff')
        fr.append(cv.out())
    # flash no chão
    cv = Cv(64, 192)
    rng = random.Random(1050)
    cv.b(cv.disk(cx, gy, 31, 11), '#3f7fff', 60)
    cv.b(cv.disk(cx, gy, 24, 8), '#3f7fff', 120)
    cv.b(cv.disk(cx, gy, 17, 6), '#8fd0ff', 220)
    cv.b(cv.disk(cx, gy, 11, 4), '#ffffff')
    for i in range(8):
        a = math.pi + i * math.pi / 7
        bolt(cv, [(cx + 10 * math.cos(a), gy + 3 * math.sin(a)), (cx + (24 + 4 * (i % 2)) * math.cos(a), gy - 4 + (14 + 6 * (i % 2)) * math.sin(a))], 1, 1)
    for _ in range(8):
        x, y = cx + rng.uniform(-24, 24), gy - rng.uniform(6, 26)
        cv.F.part(ell(x, y, 1.3, 1), '#6b6a66', ol='#2a2830', layer=cv.L)
    for x0 in (cx - 3, cx, cx + 3):
        cv.b(cv.seg(x0, gy - 40, x0, gy - 8), '#bfe4ff', 120 if x0 == cx else 60)
    fr.append(cv.out())
    # marca de queimado
    cv = Cv(64, 192)
    F = cv.F
    rng = random.Random(1060)
    cv.b(cv.disk(cx, gy, 22, 8), '#2a2228', 130)
    for i in range(7):
        a = i * 2 * math.pi / 7 + rng.uniform(-.2, .2)
        p = [(cx + 14 * math.cos(a), gy + 5 * math.sin(a))]
        for j in range(2):
            a += rng.uniform(-.3, .3)
            p.append((cx + (19 + j * 6) * math.cos(a), gy + (7 + j * 2.4) * math.sin(a)))
        cv.b(cv.pline(p), '#141018')
    burn = cv.disk(cx, gy, 17, 6)
    cv.b(burn, '#16121a')
    cv.b(burn & ~shift(burn, -1, -1), '#2e2a34')
    cv.b(cv.disk(cx - 2, gy - 1, 9, 3) & burn, '#0e0a10')
    for _ in range(4):
        x, y = cx + rng.uniform(-11, 11), gy + rng.uniform(-3, 3)
        cv.b(grow(cv.dots([(x, y)]), 1), '#3f7fff', 120)
        cv.put(x, y, '#8fd0ff')
    for x, y, r in ((cx - 5, gy - 12, 3.5), (cx + 4, gy - 19, 2.6)):
        F.part(ell(x, y, r, r * .8) + ell(x + r * .7, y + .8, r * .6, r * .5), '#5a5868', ol='#2a2830', light=.25, layer=cv.L)
    fr.append(cv.out())
    save('chd_trovao', fr)


BODY_PATH = [(52, 112), (54, 92), (50, 72), (47, 58), (49, 46), (55, 38), (56, 26), (64, 20), (72, 26), (73, 38),
             (79, 46), (82, 60), (79, 72), (75, 92), (77, 112)]


def chd_eletrificado():
    fr = []
    for k in range(3):
        cv = Cv(128, 128)
        rng = random.Random(1100 + k)
        idx = list(range(len(BODY_PATH) - 1))
        rng.shuffle(idx)
        for i in idx[:10 + k % 2]:
            a, b = BODY_PATH[i], BODY_PATH[i + 1]
            out = 3 + rng.uniform(0, 3)
            ox = -out if a[0] < 64 else out
            pts = zig(rng, a[0] + ox, a[1], b[0] + ox, b[1], 3, 2.5, ends=False)
            bolt(cv, pts, 1, 2)
            q = pts[-1]
            spark(cv, q[0] + ox * .8, q[1], rng.choice([1, 2]))
        for j in range(3):
            a = rng.uniform(0, 2 * math.pi)
            x, y = 64 + 34 * math.cos(a), 66 + 44 * math.sin(a)
            bolt(cv, zig(rng, x, y, x + rng.uniform(-8, 8), y + rng.uniform(-8, 8), 3, 2), 1, 1)
        for j in range(7):
            spark(cv, rng.uniform(34, 94), rng.uniform(16, 110), rng.choice([1, 1, 2, 3]))
        fr.append(cv.out())
    for k in range(2):
        cv = Cv(128, 128)
        rng = random.Random(1200 + k)
        ring = cv.disk(64, 112, 26, 6) & ~cv.disk(64, 112, 24, 4.6)
        cv.b(grow(ring, 1) & ~ring, '#3f7fff', 80)
        cv.b(ring, '#8fd0ff', 220)
        cv.b(ring & (np.indices(ring.shape)[1] % 5 == k), '#ffffff')
        n = 26
        for i in range(n):
            if (i + k) % 3 == 0:
                continue
            a0, a1 = i * 2 * math.pi / n, (i + 1) * 2 * math.pi / n
            p0 = (64 + 22 * math.cos(a0), 70 + 43 * math.sin(a0))
            p1 = (64 + 22 * math.cos(a1), 70 + 43 * math.sin(a1))
            if p0[1] > 110 and p1[1] > 110:
                continue
            bolt(cv, zig(rng, p0[0], p0[1], p1[0], p1[1], 3, 1.6, ends=False), 1, 2, ha=70)
            if rng.random() < .3:
                a = (a0 + a1) / 2
                q = (64 + 23 * math.cos(a), 70 + 44 * math.sin(a))
                bolt(cv, zig(rng, q[0], q[1], q[0] + 9 * math.cos(a), q[1] + 9 * math.sin(a), 3, 1.5), 1, 1)
        for j in range(6):
            a = rng.uniform(0, 2 * math.pi)
            spark(cv, 64 + 27 * math.cos(a), 70 + 47 * math.sin(a), rng.choice([1, 2]))
        fr.append(cv.out())
    # símbolo de acerto
    cv = Cv(128, 128)
    pts = [(73, 12), (51, 44), (63, 44), (54, 70), (80, 34), (68, 34), (79, 12)]
    sym = cv.shp([pts])
    sh = shift(sym, 2, 2)
    cv.b(grow(sh, 1), '#10204a')
    cv.b(sh, '#2a4fd0')
    cv.b(grow(sym, 1) & ~sym, '#10204a')
    cv.b(sym, '#f4fbff')
    cv.b(sym & ~shift(sym, -2, -2), '#8fd0ff')
    cv.b(sym & ~shift(sym, 1, 1), '#ffffff')
    for x, y, r in ((50, 26, 2), (80, 50, 3), (46, 54, 1), (82, 24, 1)):
        spark(cv, x, y, r)
    fr.append(cv.out())
    save('chd_eletrificado', fr)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    rsg_esfera()
    rsg_gigante()
    rsg_rush()
    rsg_grind()
    rsg_cicatriz()
    gts_aura()
    gts_lua()
    gts_lua_gigante()
    gts_impacto()
    gts_sulco()
    chd_mao()
    chd_rastro()
    chd_trovao()
    chd_eletrificado()
