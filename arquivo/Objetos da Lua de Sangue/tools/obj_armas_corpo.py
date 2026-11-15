"""Grupo armas_corpo: escudo, martelo, espada e efeitos de golpe/morte.
Rodar da pasta tools:  python obj_armas_corpo.py
Gera em ../sprites/: cor_escudo, cor_faiscas, cor_martelo, cor_shockwave, cor_espada,
cor_arco_golpe, cor_kill, cor_impacto_numero.
"""
import math
import os
import random
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, chain, rp, star, sparkle, impact, puff, shadow_layer,
                    over, glow, strip, hexc, mix, shift, dilate, MOON, NIGHT, INK)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')


# ================================================================ utilidades
def col(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def inkc(c):
    return mix(col(c) * .32, INK, .55)


def grids(w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    return xx + .5, yy + .5


def vnoise(x, y, seed=0):
    """value noise suave (numpy) em [0,1]."""
    xi, yi = np.floor(x), np.floor(y)
    xf, yf = x - xi, y - yi

    def h(a, b):
        v = np.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453
        return v - np.floor(v)
    sx, sy = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    a = h(xi, yi) * (1 - sx) + h(xi + 1, yi) * sx
    b = h(xi, yi + 1) * (1 - sx) + h(xi + 1, yi + 1) * sx
    return a * (1 - sy) + b * sy


def paint(F, m, C, base, layer=None, light=.22, dark=.30, outline=True, ol=None):
    """como Frame.part, mas com cor por pixel C (HxWx3)."""
    L = F.a if layer is None else layer
    if not m.any():
        return m
    C = C.copy()
    lit = m & ~shift(m, 1, 2)
    sh = m & ~shift(m, -2, -3)
    deep = m & ~shift(m, -1, -1)
    C[lit] = mix(C[lit], MOON, light)
    C[sh] = mix(C[sh] * (1 - dark * .5), NIGHT, dark)
    C[deep] = mix(C[deep] * .78, NIGHT, dark)
    L[m, :3] = np.clip(C[m], 0, 255)
    L[m, 3] = 255
    if outline:
        o = dilate(m) & ~m
        L[o, :3] = inkc(base) if ol is None else col(ol)
        L[o, 3] = 255
    return m


def lin(F, a, b, c, m=None, layer=None, alpha=255):
    L = F.a if layer is None else layer
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    cc = col(c)
    for k in range(n + 1):
        t = k / max(1, n)
        x, y = int(round(a[0] + (b[0] - a[0]) * t - .5)), int(round(a[1] + (b[1] - a[1]) * t - .5))
        if 0 <= x < F.w and 0 <= y < F.h and (m is None or m[y, x]):
            L[y, x, :3] = cc
            L[y, x, 3] = alpha


def pxm(F, p, c, m=None, layer=None, alpha=255):
    L = F.a if layer is None else layer
    x, y = int(round(p[0] - .5)), int(round(p[1] - .5))
    if 0 <= x < F.w and 0 <= y < F.h and (m is None or m[y, x]):
        L[y, x, :3] = col(c)
        L[y, x, 3] = alpha


def cut(F, m, edge=None):
    had = F.a[..., 3] > 0
    F.a[m] = 0
    if edge is not None:
        e = had & ~m & dilate(m) & (F.a[..., 3] > 0)
        F.a[e, :3] = col(edge)
    return had


def fade(arr, k):
    a = arr.copy()
    a[..., 3] = (a[..., 3].astype(float) * k).astype(np.uint8)
    return a


def tint(arr, c, t):
    a = arr.copy()
    m = a[..., 3] > 0
    a[m, :3] = np.clip(mix(a[m, :3].astype(float), col(c), t), 0, 255)
    return a


def final(F, under=None, top=None):
    out = np.zeros_like(F.a)
    if under is not None:
        out = over(out, under)
    out = over(out, F.a)
    out = over(out, F.fx)
    if top is not None:
        out = over(out, top)
    return out


def rimglow(arr, c1='#f2c230', c2='#ffe680', a2=110):
    """contorno extra dourado em volta da silhueta."""
    s = arr[..., 3] > 0
    r1 = dilate(s) & ~s
    r2 = dilate(dilate(s)) & ~s & ~r1
    out = arr.copy()
    out[r1, :3] = col(c1)
    out[r1, 3] = 255
    out[r2, :3] = col(c2)
    out[r2, 3] = a2
    return out


def distmap(m, n=12):
    """distância (em passos de dilatação) até a máscara, até n."""
    d = np.full(m.shape, n + 1, float)
    cur = m.copy()
    d[cur] = 0
    for k in range(1, n + 1):
        nx = dilate(cur)
        d[nx & ~cur] = k
        cur = nx
    return d


class Ax:
    """eixo local: u ao longo do ângulo, v perpendicular (v>0 = embaixo quando aponta p/ direita)."""

    def __init__(self, o, ang, su=1.0, sv=1.0):
        self.o = o
        a = math.radians(ang)
        self.c, self.s = math.cos(a), math.sin(a)
        self.su, self.sv = su, sv

    def p(self, u, v=0.0):
        u, v = u * self.su, v * self.sv
        return (self.o[0] + u * self.c - v * self.s, self.o[1] + u * self.s + v * self.c)

    def poly(self, *uv):
        return [[self.p(u, v) for u, v in uv]]

    def ell(self, u, v, ru, rv, n=16):
        return [[self.p(u + ru * math.cos(2 * math.pi * k / n), v + rv * math.sin(2 * math.pi * k / n)) for k in range(n)]]

    def rect(self, u0, v0, u1, v1):
        return self.poly((u0, v0), (u1, v0), (u1, v1), (u0, v1))

    def uv(self, w, h):
        X, Y = grids(w, h)
        dx, dy = X - self.o[0], Y - self.o[1]
        u = (dx * self.c + dy * self.s) / self.su
        v = (-dx * self.s + dy * self.c) / self.sv
        return u, v


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, name + '.png'))
    print('ok', name, img.size)


# ================================================================ ESCUDO
STEEL, STEEL2, RIVET, RUST = '#7d848c', '#6b747a', '#c9ced4', '#8a4e2e'
MOONRED, MOONHI = '#c8323a', '#ff5a5a'
SIGN, LEATH, LEATH2, DBLOOD = '#e0b430', '#8a5530', '#6b3f22', '#5a1a1a'


def strap(F, pts, w=4.0):
    m = F.part(chain(pts, w), LEATH, light=.3, tex=.2)
    # costura
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        n = int(math.hypot(b[0] - a[0], b[1] - a[1]))
        for k in range(0, n, 2):
            t = k / max(1, n)
            pxm(F, (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), '#c8a878', m)
    return m


def buckle(F, x, y, r=3):
    F.part(poly((x - r, y - r), (x + r, y - r), (x + r, y + r), (x - r, y + r)), '#c9c3b0', light=.5)
    F.flat(poly((x - r + 1.5, y - r + 1.5), (x + r - 1.5, y - r + 1.5), (x + r - 1.5, y + r - 1.5), (x - r + 1.5, y + r - 1.5)), LEATH2)
    pxm(F, (x, y), '#e8e2d0')


def shield(F, cx, cy, rx, ry, rot=0.0, th=(0, -4), crack=False, seed=3):
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))

    def S(u, v):
        x, y = u * rx, v * ry
        return (cx + x * c - y * s, cy + x * s + y * c)

    # ---- espessura / aro
    n = int(max(abs(th[0]), abs(th[1]))) + 1
    rim = []
    for k in range(1, n + 1):
        rim += ell(cx + th[0] * k / n, cy + th[1] * k / n, rx, ry, rot, n=64)
    rm = F.part(rim, STEEL2, light=.5, tex=.25, dark=.4)
    # ferrugem na espessura
    X, Y = grids(F.w, F.h)
    nz = vnoise(X / 3.0, Y / 3.0, seed + 7)
    rr = rm & (nz > .66)
    F.a[rr, :3] = np.clip(mix(F.a[rr, :3].astype(float), col(RUST), .55), 0, 255)
    # ---- face
    m = F.mask(ell(cx, cy, rx, ry, rot, n=64))
    dx, dy = X - cx, Y - cy
    u = (dx * c + dy * s) / rx
    v = (-dx * s + dy * c) / ry
    r = np.hypot(u, v)
    gy_, gx_ = np.gradient(r)
    gr = np.hypot(gx_, gy_) + 1e-6
    R = max(rx, ry)
    Ls = -((dx / R) * .55 + (dy / R) * .8)
    C = np.zeros((F.h, F.w, 3))
    C[:] = col(STEEL)
    step = np.round(Ls * 2.5) / 2.5
    C *= (1 + .14 * step)[..., None]
    # lábio externo
    lip = r > .86
    C[lip] = mix(C[lip], col('#9aa2aa'), .5)
    on = lambda r0, k=.6: np.abs(r - r0) < k * gr
    C[on(.86)] = col('#4d545c')
    # anéis de reforço (relevo: luz em cima-esquerda)
    for r0 in (.70, .47):
        up = (u + v) < 0
        a1 = on(r0) & up
        a2 = on(r0) & ~up
        b1 = on(r0 + 1.1 * gr.mean() * 0 + .0) & False
        C[a1] = mix(C[a1], MOON, .45)
        C[a2] = col('#4d545c')
        ring2 = np.abs(r - (r0 - 1.2 * gr)) < .6 * gr
        C[ring2 & up] = col('#4d545c')
        C[ring2 & ~up] = mix(C[ring2 & ~up], MOON, .35)
    # ferrugem
    n2 = vnoise(u * 5 + 3, v * 5, seed)
    n3 = vnoise(u * 11, v * 11, seed + 2)
    rust = (n2 * .7 + n3 * .3) > (.76 - .22 * np.clip(r - .7, 0, 1))
    C[rust] = mix(C[rust], col(RUST), .6)
    deep = rust & (n3 > .7)
    C[deep] = mix(C[deep], col('#5a2e1a'), .5)
    # lua vermelha
    mu, mv_ = -.06, -.05
    dm = np.hypot(u - mu, v - mv_)
    moon = dm < .44
    peel_n = vnoise(u * 7 + 11, v * 7 + 5, seed + 4) * .75 + vnoise(u * 16, v * 16, seed + 9) * .25
    peel = moon & (peel_n > (.86 - .30 * (dm / .44) ** 4))
    if crack:
        peel |= moon & (peel_n > .70)
    paint_m = moon & ~peel
    # escorridos
    for du, ln in ((-.22, .22), (-.05, .32), (.16, .15), (.30, .10)):
        vbot = mv_ + math.sqrt(max(0, .44 ** 2 - (du - mu) ** 2))
        dr = (np.abs(u - du) < .55 * np.abs(np.gradient(u, axis=1)) + 1e-3) & (v > vbot - .05) & (v < vbot + ln)
        paint_m |= dr & m
    pc = np.zeros_like(C)
    pc[:] = col(MOONRED)
    pc *= (1 + .10 * step)[..., None]
    crater = (np.hypot(u - .10, v - .12) < .10) | (np.hypot(u + .20, v + .02) < .07) | (np.hypot(u - .02, v + .26) < .06)
    pc[crater] = col('#a02830')
    hi = (dm > .34) & (dm < .44) & ((u - mu) + (v - mv_) < -.25)
    pc[hi] = col(MOONHI)
    C[paint_m] = pc[paint_m]
    # borda da tinta lascada (clara) + sombra
    pe = moon & peel & dilate(paint_m)
    C[pe] = mix(C[pe], col('#e0d0c0'), .55)
    # remendo de placa de trânsito
    pu, pv = -.46, .40
    dd = np.abs(u - pu) + np.abs(v - pv)
    patch = dd < .27
    pcol = np.zeros_like(C)
    pcol[:] = col(SIGN)
    pcol *= (1 + .10 * step)[..., None]
    band = (dd > .19) & (dd < .23)
    pcol[band] = col('#1e1a1c')
    arrow = ((np.abs(v - pv) < .03) & (np.abs(u - pu - .02) < .10)) | (np.abs((u - pu - .09) + np.abs(v - pv) * 1.0) < .03) & (np.abs(v - pv) < .08)
    pcol[arrow] = col('#1e1a1c')
    sn = vnoise(u * 14, v * 14, seed + 5) > .72
    pcol[sn & patch] = mix(pcol[sn & patch], col('#8a7a5a'), .6)
    C[patch] = pcol[patch]
    pr = (dd >= .27) & (dd < .27 + 1.1 * gr)
    C[pr & m] = col('#2a2426')
    # tampão rosqueado
    db = np.hypot(u - .44, v + .40)
    C[db < .12] = col('#5d646c')
    C[db < .085] = col('#9aa2aa')
    C[(db < .085) & (np.abs((u - .44) - (v + .40)) < .6 * gr)] = col('#3a3e44')
    C[np.abs(db - .12) < .6 * gr] = col('#3a3e44')
    # textura
    tx = vnoise(X * .9, Y * .9, seed + 1) > .78
    C[tx & m] *= .9
    paint(F, m, C, STEEL, light=.25, dark=.32)
    # rebites
    for k in range(8):
        a = math.radians(22.5 + k * 45)
        p = S(.93 * math.cos(a), .93 * math.sin(a))
        pxm(F, p, RIVET, m)
        pxm(F, (p[0] + 1, p[1] + 1), '#3a3e44', m)
        pxm(F, (p[0] + 1, p[1]), '#8d969c', m)
    for (a, b) in ((-.62, .2), (-.30, .2), (-.46, .06), (-.46, .63)):
        q = S(a + (.06 if a < -.46 else -.06 if a > -.46 else 0), b + (.08 if b < .3 else -.08 if b > .5 else 0))
    for (a, b) in ((-.46, .19), (-.46, .61), (-.25, .40), (-.67, .40)):
        q = S(a, b)
        pxm(F, q, RIVET, m)
        pxm(F, (q[0] + 1, q[1] + 1), '#3a3e44', m)
    # riscos
    rnd = random.Random(seed)
    for _ in range(6):
        a0 = rnd.uniform(-.7, .6), rnd.uniform(-.7, .6)
        ang = rnd.uniform(-.6, .6)
        ln = rnd.uniform(.12, .3)
        a1 = (a0[0] + ln * math.cos(ang), a0[1] + ln * math.sin(ang))
        lin(F, S(*a0), S(*a1), '#b8c0c8', m)
    # sangue seco
    for (bu, bv, br) in ((.55, .52, .07), (.66, .40, .045), (.48, .66, .04), (.72, .58, .03), (-.70, -.35, .04)):
        F.part(ell(*S(bu, bv), max(1.2, br * rx), max(1.2, br * ry), rot), DBLOOD, light=.1, outline=False, clip=m)
    lin(F, S(.55, .52), S(.53, .74), DBLOOD, m)
    if crack:
        # amassado
        dn = np.hypot(u - .30, v - .05) < .17
        dnm = dn & m
        F.a[dnm, :3] = (F.a[dnm, :3] * .72).astype(np.uint8)
        arcm = dnm & ~shift(dnm, 1, 1)
        F.a[arcm, :3] = np.clip(mix(F.a[arcm, :3].astype(float), MOON, .45), 0, 255)
        # rachaduras
        for (su, sv, a, k) in ((.30, .05, -30, 7), (.30, .05, 150, 8), (.30, .05, 80, 6), (-.1, -.55, 120, 5)):
            p = S(su, sv)
            ang = math.radians(a)
            pts = [p]
            for i in range(k):
                ang += rnd.uniform(-.6, .6)
                st = rnd.uniform(2.5, 4.5) * R / 30
                p = (p[0] + st * math.cos(ang), p[1] + st * math.sin(ang))
                pts.append(p)
            for i in range(len(pts) - 1):
                lin(F, pts[i], pts[i + 1], '#161014', m)
                lin(F, (pts[i][0] - 1, pts[i][1] - 1), (pts[i + 1][0] - 1, pts[i + 1][1] - 1), '#aab2ba', m & (F.a[..., 0] > 40))
                if i == 2 and rnd.random() < .8:
                    b = pts[i]
                    bb = (b[0] + 5 * math.cos(ang + 1.2), b[1] + 5 * math.sin(ang + 1.2))
                    lin(F, b, bb, '#161014', m)
        # lasca faltando na borda
        chip = F.mask([[S(.74, .45), S(1.25, .10), S(1.25, .95), S(.80, .62)]])
        cut(F, chip, edge='#2a2426')
    return m


def shield_frames():
    frames = []
    cx, cy = 64, 60

    def fr():
        return Frame(128, 128)

    # 0 abaixado (de lado)
    F = fr()
    strap(F, [(58, 40), (49, 46), (47, 62), (49, 76), (58, 82)], 4.5)
    shield(F, 66, 64, 12, 31, rot=8, th=(-6, -1))
    buckle(F, 48, 62, 2.6)
    frames.append(final(F))
    # 1 erguido (frente)
    F = fr()
    shield(F, cx, cy, 30, 31, th=(0, -4))
    frames.append(final(F))
    # 2 overshoot / squash
    F = fr()
    shield(F, cx, cy - 4, 34, 27, th=(0, -3))
    for (x0, y0) in ((22, 50), (106, 50), (24, 70), (104, 70)):
        lin(F, (x0, y0), (x0 + (-4 if x0 < 64 else 4), y0), '#f4efe6', layer=F.fx)
    frames.append(final(F))
    # 3,4 parry
    for k in range(2):
        F = fr()
        shield(F, cx, cy, 30, 31, th=(0, -4))
        spr = tint(F.a, '#f2c230', .22)
        spr = rimglow(spr)
        back = np.zeros_like(F.a)
        Fb = Frame(128, 128)
        glow(Fb, cx, cy - 2, 50 + 6 * k, '#f2c230', alpha=170 - 30 * k, layer=back)
        glow(Fb, cx, cy - 2, 40, '#fff6c8', alpha=90, layer=back)
        F.a[:] = spr
        pts = [(26, 28), (100, 34), (104, 88), (30, 92), (64, 16)] if k == 0 else [(36, 20), (106, 60), (88, 98), (20, 64), (96, 22)]
        for i, (x, y) in enumerate(pts):
            sparkle(F, x, y, r=3 if i % 2 == 0 else 2, col='#fff6c8')
        frames.append(final(F, under=back))
    # 5 rachado
    F = fr()
    shield(F, cx, cy + 2, 30, 31, rot=6, th=(0, -4), crack=True, seed=5)
    frames.append(final(F))
    # 6 caindo
    F = fr()
    shield(F, 66, 80, 26, 30, rot=-58, th=(-3, -3), crack=True, seed=5)
    for (x0, y0) in ((40, 40), (52, 34), (82, 36)):
        lin(F, (x0, y0), (x0, y0 - 7), '#f4efe6', layer=F.fx, alpha=170)
    frames.append(final(F, under=shadow_layer(68, 26, 3.5, 70, 128, 128, 112)))
    # 7 no chão (loot)
    F = fr()
    strap(F, [(86, 102), (96, 106), (108, 104)], 4)
    buckle(F, 104, 104, 2.4)
    shield(F, 62, 96, 32, 15, th=(0, 4))
    frames.append(final(F, under=shadow_layer(64, 38, 6, 95, 128, 128, 106)))
    save(strip(frames), 'cor_escudo')


# ================================================================ FAÍSCAS
def streak(F, pts, cols, width_head=2):
    """risco de faísca: pts do rabo à cabeça; cols = [cauda, corpo, cabeça]."""
    n = len(pts)
    for i in range(n - 1):
        t = i / max(1, n - 2)
        c = cols[0] if t < .34 else cols[1] if t < .75 else cols[2]
        lin(F, pts[i], pts[i + 1], c)
    hx, hy = pts[-1]
    pxm(F, (hx, hy), '#ffffff')
    if width_head > 1:
        pxm(F, (hx + 1, hy), cols[2])
        pxm(F, (hx, hy + 1), cols[2])


def spark_path(o, ang, s0, s1, g=0.012, steps=5):
    a = math.radians(ang)
    pts = []
    for k in range(steps + 1):
        s = s0 + (s1 - s0) * k / steps
        pts.append((o[0] + math.cos(a) * s, o[1] + math.sin(a) * s + g * s * s))
    return pts


def flash4(F, x, y, r, c1, c2, layer=None):
    for d in range(-r, r + 1):
        cc = c1 if abs(d) < r * .5 else c2
        pxm(F, (x + d, y), cc, layer=layer)
        pxm(F, (x, y + d), cc, layer=layer)
    for d in range(-r // 2, r // 2 + 1):
        pxm(F, (x + d, y + d), c2, layer=layer)
        pxm(F, (x + d, y - d), c2, layer=layer)
    F.flat(ell(x, y, 1.6, 1.6), '#ffffff', layer=layer)


def ring_px(F, cx, cy, R, w, cin, cout, ryk=.8, alpha=255, dotted=False, layer=None):
    X, Y = grids(F.w, F.h)
    dx, dy = X - cx, (Y - cy) / ryk
    r = np.hypot(dx, dy)
    m = (r <= R) & (r > R - w)
    if dotted:
        th = np.degrees(np.arctan2(dy, dx))
        m &= (np.floor((th + 180) / 15) % 2) == 0
    L = F.a if layer is None else layer
    inner = m & (r < R - w * .45)
    L[m, :3] = col(cout)
    L[inner, :3] = col(cin)
    L[m, 3] = alpha
    return m


def faiscas_frames():
    frames = []
    O = (14, 32)
    rnd = random.Random(11)
    sp = [(rnd.uniform(-70, 45), rnd.uniform(.8, 1.25)) for _ in range(8)]
    ORG = ['#c8501a', '#ff9a2a', '#fff4c0']
    # bloqueio
    for t in range(3):
        F = Frame(64, 64)
        if t == 0:
            Fb = F.layer()
            glow(F, O[0], O[1], 14, '#ff9a2a', alpha=150, layer=Fb)
            F.a[:] = over(F.a, Fb)
            flash4(F, O[0], O[1], 6, '#fff4c0', '#ff9a2a')
            for a, k in sp:
                streak(F, spark_path(O, a, 3 * k, 10 * k, steps=3), ORG)
        elif t == 1:
            for a, k in sp:
                streak(F, spark_path(O, a, 9 * k, 24 * k, g=.02, steps=6), ORG)
            pxm(F, O, '#ff9a2a')
        else:
            for i, (a, k) in enumerate(sp):
                pts = spark_path(O, a, 24 * k, 30 * k, g=.022, steps=3)
                streak(F, pts, ['#5a2010', '#c8501a', '#ff9a2a'], width_head=1)
                if i % 2 == 0:
                    pxm(F, (pts[-1][0] - 2, pts[-1][1] + 4), '#c8501a')
        frames.append(final(F))
    # parry faíscas douradas
    C = (32, 32)
    GLD = ['#b8861a', '#f2c230', '#fff6c8']
    sp2 = [(i * 30 + rnd.uniform(-8, 8), rnd.uniform(.8, 1.2)) for i in range(12)]
    for t in range(3):
        F = Frame(64, 64)
        if t == 0:
            Fb = F.layer()
            glow(F, 32, 32, 20, '#f2c230', alpha=170, layer=Fb)
            F.a[:] = over(F.a, Fb)
            for a, k in sp2:
                streak(F, spark_path(C, a, 4 * k, 12 * k, g=.004, steps=3), GLD)
            flash4(F, 32, 32, 9, '#ffffff', '#f2c230')
        elif t == 1:
            for a, k in sp2:
                streak(F, spark_path(C, a, 10 * k, 24 * k, g=.012, steps=5), GLD)
            flash4(F, 32, 32, 5, '#fff6c8', '#f2c230')
        else:
            for a, k in sp2:
                pts = spark_path(C, a, 24 * k, 29 * k, g=.02, steps=2)
                streak(F, pts, ['#6a4a10', '#b8861a', '#f2c230'], width_head=1)
            sparkle(F, 20, 18, 2, '#fff6c8')
            sparkle(F, 46, 44, 2, '#fff6c8')
        frames.append(final(F))
    # anel do parry
    for t, (R, w, al) in enumerate(((10, 5, 255), (19, 3, 230), (28, 2, 150))):
        F = Frame(64, 64)
        if t == 0:
            Fb = F.layer()
            glow(F, 32, 32, 18, '#f2c230', alpha=120, layer=Fb)
            F.a[:] = over(F.a, Fb)
            F.flat(ell(32, 32, 6, 5), '#fff6c8', alpha=220)
        ring_px(F, 32, 32, R + 1, w + 2, '#f2c230', '#b8861a', alpha=al)
        ring_px(F, 32, 32, R, w, '#ffffff', '#f2c230', alpha=al, dotted=(t == 2))
        if t == 1:
            for a in (45, 135, 225, 315):
                x = 32 + (R + 2) * math.cos(math.radians(a))
                y = 32 + (R + 2) * .8 * math.sin(math.radians(a))
                sparkle(F, x, y, 2, '#fff6c8')
        frames.append(final(F))
    # estrelas de stagger
    for t in range(4):
        F = Frame(64, 64)
        for a in range(0, 360, 20):
            x = 32 + 18 * math.cos(math.radians(a))
            y = 32 + 6 * math.sin(math.radians(a))
            pxm(F, (x, y), '#f2c230', alpha=90)
        items = []
        for i in range(3):
            ph = math.radians(t * 30 + i * 120)
            items.append((math.sin(ph), 32 + 18 * math.cos(ph), 32 + 6 * math.sin(ph)))
        for dep, x, y in sorted(items):
            if dep < 0:
                star(F, x, y - 1, '#c89a30', r=3)
            else:
                star(F, x, y - 1, '#f2c230', r=4.5)
                pxm(F, (x - 1, y - 3), '#fff6c8', layer=F.fx)
        if t % 2 == 0:
            sparkle(F, 50, 22, 1, '#fff6c8')
        else:
            sparkle(F, 14, 24, 1, '#fff6c8')
        frames.append(final(F))
    save(strip(frames), 'cor_faiscas')


# ================================================================ MARTELO
WOOD, WOOD2, WOOD3 = '#a87444', '#7a4e2a', '#c8945a'
TAPE, TAPE2, BLUE = '#26262c', '#5a5a66', '#2f5a8c'
HSTEEL, HBEV = '#6b747a', '#9aa0aa'
HL = 84


def hammer(F, o, ang, su=1.0, hs=1.0, vs=1.0, heat=0.0, clip=None, lying=False):
    A = Ax(o, ang, su, 1.0)
    L = HL
    F.part(A.ell(0, 0, 3.8 / su, 3.4, 14), WOOD2, light=.3, clip=clip)
    m = F.part(A.poly((0, -2.7), (L, -2.3), (L, 2.3), (0, 2.7)), WOOD, light=.32, tex=.12, clip=clip)
    lin(F, A.p(20, -1.0), A.p(L - 6, -.9), WOOD2, m)
    lin(F, A.p(28, 1.0), A.p(L - 10, .9), WOOD3, m)
    lin(F, A.p(36, -1.8), A.p(60, -1.6), WOOD3, m)
    pxm(F, A.p(48, .2), '#5a3a1e', m); pxm(F, A.p(49, .2), WOOD2, m); pxm(F, A.p(48, -.8), WOOD2, m)
    pxm(F, A.p(66, 1.2), '#4a1a14', m); pxm(F, A.p(70, 1.4), '#4a1a14', m)
    # fita preta na pega
    mt = F.part(A.rect(1.5, -3.0, 18, 3.0), TAPE, light=.25, clip=clip)
    for uu in range(2, 18, 3):
        lin(F, A.p(uu, -2.8), A.p(uu + 1.6, 2.8), TAPE2, mt)
    F.part(A.poly((17, 1.2), (21, 2.0), (22.5, 4.5), (18.5, 3.8)), TAPE, light=.2, clip=clip)
    # colar azul
    mb = F.part(A.rect(L - 13, -2.9, L - 6, 2.9), BLUE, light=.3, clip=clip)
    for uu in (L - 11, L - 8):
        lin(F, A.p(uu, -2.6), A.p(uu + 1.2, 2.6), '#1c3a5c', mb)
    # cabeça
    H = Ax(A.p(L, 0), ang, hs * 1.12, vs * 1.12)
    hp = H.poly((-3, -18), (10, -18), (13, -16.2), (13, -13), (12, -12), (12, 12), (13, 13.4), (12, 18),
                (-2, 18), (-5, 15.8), (-5, 13), (-4, 12), (-4, -12), (-5, -13), (-5, -15.6))
    if lying:
        st = []
        for k in range(1, 5):
            st += mv(hp, 0, k)
        F.part(st, '#4d545c', light=.05, dark=.3, tex=.2, clip=clip)
    marks = [(H.poly((-5, 15), (13, 15), (13, 18.5), (-5, 18.5)), '#8d969c'),
             (H.poly((-5, -15), (13, -15), (13, -18.5), (-5, -18.5)), '#8d969c'),
             (H.ell(3, -6, 2.2, 1.6), '#5e4e44'), (H.ell(8, 7, 1.8, 2.4), '#7a4630'), (H.ell(9, 9, 1, 1.2), RUST),
             (H.ell(1, 15.8, 4.5, 2.4), DBLOOD), (H.ell(7, 16.5, 3.0, 1.8), '#6a2020'),
             (H.ell(4, 11, 1.5, 3.2), DBLOOD)]
    hm = F.part(hp, HSTEEL, marks=marks, light=.38, dark=.32, tex=.22, clip=clip)
    lin(F, H.p(-3.5, -12), H.p(11.5, -12), '#4a5058', hm)
    lin(F, H.p(-3.5, 12), H.p(11.5, 12), '#4a5058', hm)
    lin(F, H.p(-3, -11), H.p(-3, 11), HBEV, hm)
    lin(F, H.p(-4, -15), H.p(-4, -17), '#c9ced4', hm)
    lin(F, H.p(-4, 14), H.p(-4, 16), '#c9ced4', hm)
    lin(F, H.p(11, -11), H.p(11, 11), '#525860', hm)
    for vv in (-7, -5, -3):
        pxm(F, H.p(5, vv), '#3e444c', hm)
    pxm(F, H.p(6, -7), '#3e444c', hm)
    # lascas nas quinas (pixels claros)
    for q in ((12.5, -14), (-4.5, 14.2), (12.4, 15.5)):
        pxm(F, H.p(*q), '#d8dce0', hm)
    # cunha no olho
    mw = F.part(H.rect(10.5, -2.6, 13.4, 2.6), WOOD2, light=.2, clip=clip)
    lin(F, H.p(12, -2.2), H.p(12, 2.2), '#c9ced4', mw)
    if heat > 0:
        hot = hm.copy()
        F.a[hot, :3] = np.clip(mix(F.a[hot, :3].astype(float), col('#ff9a2a'), heat), 0, 255)
        inner = hot & shift(hot, 2, 2) & shift(hot, -2, -2)
        F.a[inner, :3] = np.clip(mix(F.a[inner, :3].astype(float), col('#ffd36a'), heat * .8), 0, 255)
        core = inner & shift(inner, 3, 0) & shift(inner, -3, 0) & shift(inner, 0, 3) & shift(inner, 0, -3)
        F.a[core, :3] = np.clip(mix(F.a[core, :3].astype(float), col('#fff6c8'), heat), 0, 255)
    return A, H, hm


def mv(shapes, dx, dy):
    return [[(x + dx, y + dy) for (x, y) in p] for p in shapes]


def hammer_frames():
    frames = []
    # 0 repouso
    F = Frame()
    hammer(F, (66, 12), 92)
    frames.append(final(F))
    # 1 windup
    F = Frame()
    hammer(F, (86, 100), -122)
    frames.append(final(F))
    # 2,3 carregada
    for k in range(2):
        F = Frame()
        A, H, hm = hammer(F, (86, 100), -122 + (1.5 if k else 0), heat=.38 + .22 * k)
        hc = H.p(4, 0)
        back = F.layer()
        glow(F, hc[0], hc[1], 30 + 6 * k, '#f2c230', alpha=150 + 40 * k, layer=back)
        glow(F, hc[0], hc[1], 18, '#fff6c8', alpha=110, layer=back)
        spr = rimglow(F.a, '#ffd36a', '#fff6c8', 90) if k else F.a
        F.a[:] = spr
        for (du, dv) in (((-6, -22), (16, 20), (18, -10)) if k == 0 else ((20, 16), (-8, 24), (14, -24), (-6, -14))):
            q = H.p(du, dv)
            sparkle(F, q[0], q[1], 3 if k else 2, '#fff6c8')
        frames.append(final(F, under=back))
    # 4 descida (stretch + borrão)
    F = Frame()
    piv = (38, 110)
    back = F.layer()
    X, Y = grids(128, 128)
    dx, dy = X - piv[0], Y - piv[1]
    rr = np.hypot(dx, dy)
    th = np.degrees(np.arctan2(dy, dx))
    a0, a1 = -98, -50
    sec = (th > a0) & (th < a1) & (rr > 70) & (rr < 112)
    p = (th - a0) / (a1 - a0)
    al = (np.round(np.clip(p, 0, 1) * 4) / 4 * 150).astype(np.uint8)
    back[sec, :3] = col('#dfe6f2')
    back[sec, 3] = al[sec]
    for R0 in (78, 92, 104):
        ln = sec & (np.abs(rr - R0) < .6) & (p > .25)
        back[ln, :3] = col('#ffffff')
        back[ln, 3] = 220
    for ga, gk in ((-94, .28), (-72, .45)):
        G = Frame()
        hammer(G, piv, ga)
        back = over(back, fade(tint(G.a, '#c8d4e8', .5), gk))
    hammer(F, piv, -46, su=1.14, hs=.82)
    frames.append(final(F, under=back))
    # 5 cravada no chão (recovery)
    F = Frame()
    gy = 110
    under = shadow_layer(64, 50, 4, 70, 128, 128, gy)
    Fc = Frame()
    # cratera
    Fc.part(ell(92, gy, 22, 7), '#2a2228', light=.05, dark=.2, ol='#140c10')
    Fc.part(ell(92, gy + 1, 15, 4.5), '#160e12', shade=False, outline=False)
    rnd = random.Random(4)
    for a in (-170, -150, -20, 0, 15, 160, 180, 200, -40):
        p0 = (92 + 18 * math.cos(math.radians(a)), gy + 6 * math.sin(math.radians(a)))
        ang = math.radians(a)
        pts = [p0]
        for i in range(4):
            ang += rnd.uniform(-.5, .5)
            q = pts[-1]
            pts.append((q[0] + 4 * math.cos(ang), q[1] + 1.6 * math.sin(ang)))
        for i in range(len(pts) - 1):
            lin(Fc, pts[i], pts[i + 1], '#1a1214')
    under = over(under, Fc.a)
    clip = np.zeros((128, 128), bool)
    clip[:gy + 1, :] = True
    hammer(F, (14, 68), 22, clip=clip)
    # lábio de terra na frente da cabeça
    for (x, y, r, c) in ((80, gy + 3, 4, '#5a4a3a'), (88, gy + 5, 3.5, '#4a4650'), (97, gy + 4, 4.2, '#6a5a48'),
                         (104, gy + 2, 3, '#4a4650'), (73, gy + 1, 2.6, '#6a5a48')):
        F.part(ell(x, y, r, r * .7), c, light=.35, tex=.2)
    for (x, y) in ((68, gy - 8), (110, gy - 10), (76, gy - 14), (104, gy - 3)):
        F.part(ell(x, y, 1.6, 1.4), '#6a5a48', light=.3)
    frames.append(final(F, under=under))
    # 6 loot no chão
    F = Frame()
    hammer(F, (12, 102), -3, vs=.55, lying=True)
    frames.append(final(F, under=shadow_layer(62, 54, 5, 95, 128, 128, 108)))
    save(strip(frames), 'cor_martelo')


# ================================================================ SHOCKWAVE
SW, SH_ = 192, 128
SCX, SCY, SK = 96, 68, .45


def ground_rd():
    X, Y = grids(SW, SH_)
    dx, dy = X - SCX, (Y - SCY) / SK
    return np.hypot(dx, dy), dx, dy


def sw_rings(F, R, w, al, rnd):
    r, dx, dy = ground_rd()
    m = (r <= R) & (r > R - w)
    front = dy > 0
    L = F.a
    C = np.zeros((SH_, SW, 3))
    C[:] = col('#d8c8a8')
    C[front] = col('#fff4e0')
    inner = r < R - w * .55
    C[inner & ~front] = col('#c2b08e')
    C[inner & front] = col('#f0e2c4')
    edge = m & ~((r <= R - 1.0) & (r > R - w + 1.0))
    C[edge] = col('#8a7a60')
    a = np.full((SH_, SW), al, float)
    a[~front] *= .75
    L[m, :3] = C[m]
    L[m, 3] = a[m].astype(np.uint8)
    for _ in range(int(R / 2)):
        t = rnd.uniform(0, 2 * math.pi)
        rr = R + rnd.uniform(-2, 4)
        x, y = SCX + rr * math.cos(t), SCY + rr * SK * math.sin(t)
        pxm(F, (x, y), '#b8a888' if math.sin(t) < 0 else '#e8dcc0', alpha=int(al * .9))


def crack_decal(F, alpha_k=1.0):
    rnd = random.Random(21)
    cm = np.zeros((SH_, SW), bool)
    cm2 = np.zeros((SH_, SW), bool)
    W = F.layer()
    Ft = Frame(SW, SH_)

    def gp(X, Y):
        return (SCX + X, SCY + Y * SK)

    def walk(x, y, ang, n, wide, depth):
        pts = [(x, y)]
        for i in range(n):
            ang += rnd.uniform(-.45, .45)
            st = rnd.uniform(3, 5)
            x, y = x + st * math.cos(ang), y + st * math.sin(ang)
            pts.append((x, y))
            if depth < 1 and rnd.random() < .22:
                walk(x, y, ang + rnd.choice([-1, 1]) * rnd.uniform(.5, 1.0), max(2, n - i - 2), False, depth + 1)
        for i in range(len(pts) - 1):
            a, b = gp(*pts[i]), gp(*pts[i + 1])
            lin(Ft, a, b, '#1a1214')
            if wide and i < len(pts) * 2 // 3:
                lin(Ft, (a[0] + 1, a[1]), (b[0] + 1, b[1]), '#1a1214')

    for k in range(9):
        ang = k * 2 * math.pi / 9 + rnd.uniform(-.25, .25)
        walk(20 * math.cos(ang), 20 * math.sin(ang), ang, rnd.randint(7, 13), True, 0)
    cm = Ft.a[..., 3] > 0
    # cratera
    Ft2 = Frame(SW, SH_)
    Ft2.part(ell(SCX, SCY, 24, 10.5), '#3a3036', light=.0, dark=.0, ol='#1a1214', tex=.3)
    Ft2.part(ell(SCX + 1, SCY + 1, 17, 7), '#2a2228', shade=False, outline=False, tex=.3)
    Ft2.part(ell(SCX + 2, SCY + 1.5, 9, 3.5), '#1a1214', shade=False, outline=False)
    # placas levantadas na borda da cratera
    for k in range(7):
        a = k * 2 * math.pi / 7 + .3
        x, y = SCX + 22 * math.cos(a), SCY + 10 * math.sin(a)
        pts = [(x + 6 * math.cos(a + 1.6), y + 2.6 * math.sin(a + 1.6)), (x + 5 * math.cos(a), y + 2.5 * math.sin(a) - 3),
               (x + 6 * math.cos(a - 1.6), y + 2.6 * math.sin(a - 1.6)), (x - 2 * math.cos(a), y - 1 * math.sin(a))]
        Ft2.part([pts], '#7a7070' if k % 2 else '#8a807a', light=.4, dark=.35, tex=.2)
    base = Ft2.a.copy()
    base[..., 3] = (base[..., 3] * .92).astype(np.uint8)
    # rachaduras: escuro + borda clara do lado da luz + sombra embaixo
    lt = shift(cm, -1, -1) & ~cm
    dk = shift(cm, 1, 1) & ~cm
    W[dk, :3] = col('#2a2228'); W[dk, 3] = 120
    W[lt, :3] = col('#8a7a68'); W[lt, 3] = 170
    W[cm, :3] = col('#1a1214'); W[cm, 3] = 235
    out = over(W, base)
    out[..., 3] = (out[..., 3].astype(float) * alpha_k).astype(np.uint8)
    # pedrinhas soltas
    if alpha_k > .5:
        for _ in range(14):
            a = rnd.uniform(0, 2 * math.pi)
            rr = rnd.uniform(26, 60)
            x, y = SCX + rr * math.cos(a), SCY + rr * SK * math.sin(a)
            pxm(F, (x, y), '#8a807a', layer=out)
            pxm(F, (x + 1, y + 1), '#2a2228', layer=out)
    return out


def chunk(F, x, y, pts, h, top, side, tex=.2, marks=()):
    P = [(x + a * 1.4, y + b * 1.4) for a, b in pts]
    stack = []
    for k in range(1, h + 1):
        stack += [[(a, b + k) for a, b in P]]
    F.part(stack, side, light=.1, dark=.35, tex=tex)
    return F.part([P], top, marks=marks, light=.35, dark=.2, tex=tex)


def debris_frame():
    F = Frame(SW, SH_)
    sh = np.zeros((SH_, SW, 4), np.uint8)
    xs = [16 + 32 * i for i in range(6)]
    y = 64
    for x in xs:
        sh = over(sh, shadow_layer(x + 1, 9, 2.6, 90, SW, SH_, y + 6))
    # 1 pedra portuguesa branca
    chunk(F, xs[0], y, [(-5, -4), (4, -5), (6, 0), (3, 3), (-5, 2)], 4, '#d8d2c2', '#9a9488')
    # 2 pedra portuguesa preta
    chunk(F, xs[1], y, [(-6, -3), (2, -5), (6, -1), (4, 3), (-4, 3)], 4, '#3a3640', '#24212a')
    pxm(F, (xs[1] - 2, y - 2), '#6a6670')
    # 3 asfalto
    m = chunk(F, xs[2], y + 1, [(-8, -3), (-2, -5), (7, -4), (8, 1), (1, 3), (-7, 2)], 3, '#4a4650', '#2e2b33', tex=.35)
    for (a, b) in ((-4, -2), (2, -3), (5, 0), (-1, 1), (-6, 0)):
        pxm(F, (xs[2] + a, y + 1 + b), '#8a8690', m)
    # 4 concreto com vergalhão
    F.part(limb(xs[3] + 2, y - 2, xs[3] + 11, y - 11, 2.2, 1.6), RUST, light=.4)
    m = chunk(F, xs[3], y, [(-7, -4), (1, -6), (6, -2), (5, 3), (-6, 3)], 5, '#9a968e', '#6e6a64', tex=.3)
    for (a, b) in ((-3, -2), (2, -1), (-5, 1)):
        pxm(F, (xs[3] + a, y + b), '#6e6a64', m)
    F.part(ell(xs[3] + 2, y - 2, 1.5, 1.2), '#5a2e1a', light=.2)
    # 5 tijolo
    m = chunk(F, xs[4], y, [(-7, -3), (6, -4), (7, 1), (-6, 2)], 4, '#a5432e', '#86351f', tex=.25,
              marks=[(poly((xs[4] + 4, y - 4), (xs[4] + 7, y - 4), (xs[4] + 7, y + 1), (xs[4] + 5, y + 1)), '#c9b8a0')])
    pxm(F, (xs[4] - 2, y - 1), '#5a1a12', m); pxm(F, (xs[4] + 1, y - 1), '#5a1a12', m)
    # 6 lasca de pedra
    chunk(F, xs[5], y, [(-6, 2), (-1, -7), (6, -1), (3, 3)], 3, '#8e8a84', '#5e5a56')
    return final(F, under=sh)


def dust_frame(k, rnd):
    F = Frame(SW, SH_)
    L = F.layer()
    R = (24, 48, 70)[k]
    al = (.95, .8, .55)[k]
    rise = (0, 4, 9)[k]
    n = 10
    T = Frame(SW, SH_)
    for i in range(n):
        a = i * 2 * math.pi / n + rnd.uniform(-.2, .2)
        x, y = SCX + R * math.cos(a), SCY + R * SK * math.sin(a) - rise
        r = (6, 9, 11)[k] * rnd.uniform(.8, 1.2)
        if math.sin(a) < 0:
            T.part(ell(x, y, r, r * .65) + ell(x + r * .7, y + 1, r * .6, r * .45) + ell(x - r * .6, y + 2, r * .5, r * .4), '#b8a888', ol='#7a6a54', light=.35, tex=.2)
    for i in range(n):
        a = i * 2 * math.pi / n + rnd.uniform(-.2, .2)
        x, y = SCX + R * math.cos(a), SCY + R * SK * math.sin(a) - rise
        r = (6, 9, 11)[k] * rnd.uniform(.8, 1.2)
        if math.sin(a) >= 0:
            T.part(ell(x, y, r, r * .65) + ell(x - r * .7, y + 1, r * .6, r * .45) + ell(x + r * .6, y + 2, r * .5, r * .4), '#d4c6a6', ol='#7a6a54', light=.35, tex=.2)
    if k == 2:
        X, Y = grids(SW, SH_)
        holes = (vnoise(X / 4, Y / 3, 3) > .66) | ((X.astype(int) + Y.astype(int)) % 2 == 0) & (vnoise(X / 6, Y / 6, 5) > .5)
        T.a[holes] = 0
    F.a[:] = fade(T.a, al)
    return final(F)


def dotted_ring(R):
    F = Frame(SW, SH_)
    fill = F.layer()
    X, Y = grids(SW, SH_)
    r = np.hypot(X - SCX, (Y - SCY) / SK)
    fm = r < R
    fill[fm, :3] = col('#c8323a')
    fill[fm, 3] = 24
    band = (r < R) & (r > R - 7)
    fill[band, 3] = 48
    shapes = []
    circ = 2 * math.pi * R
    nd = int(circ / 11)
    for i in range(nd):
        t0 = 2 * math.pi * i / nd
        t1 = t0 + 2 * math.pi * 6 / circ
        a = (SCX + R * math.cos(t0), SCY + R * SK * math.sin(t0))
        b = (SCX + R * math.cos(t1), SCY + R * SK * math.sin(t1))
        shapes += limb(a[0], a[1], b[0], b[1], 2.2)
    F.part(shapes, '#f4e6c0', shade=False, ol='#2a1a12')
    for t in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
        cx, cy = SCX + (R - 6) * math.cos(t), SCY + (R - 6) * SK * math.sin(t)
        ux, uy = math.cos(t), math.sin(t) * SK
        nn = math.hypot(ux, uy)
        ux, uy = ux / nn, uy / nn
        F.part(poly((cx - ux * 5 - uy * 3.5, cy - uy * 5 + ux * 3.5), (cx - ux * 5 + uy * 3.5, cy - uy * 5 - ux * 3.5),
                    (cx + ux * 1, cy + uy * 1)), '#ffd36a', shade=False, ol='#2a1a12')
    pxm(F, (SCX, SCY), '#f4e6c0')
    return final(F, under=fill)


def shockwave_frames():
    frames = []
    rnd = random.Random(8)
    for k in range(4):
        F = Frame(SW, SH_)
        Ro = (22, 44, 68, 90)[k]
        wo = (11, 9, 7, 4)[k]
        al = (255, 235, 180, 110)[k]
        if k <= 1:
            X, Y = grids(SW, SH_)
            r = np.hypot(X - SCX, (Y - SCY) / SK)
            dm = r < Ro
            F.a[dm, :3] = col('#e8dcc0')
            F.a[dm, 3] = (90, 50)[k]
        if k >= 1:
            sw_rings(F, (0, 26, 48, 68)[k], (0, 7, 6, 4)[k], (0, 255, 220, 160)[k], rnd)
        T = Frame(SW, SH_)
        sw_rings(T, Ro, wo, al, rnd)
        F.a[:] = over(F.a, T.a)
        if k == 0:
            Fb = F.layer()
            glow(F, SCX, SCY, 22, '#ffffff', alpha=200, layer=Fb)
            F.a[:] = over(F.a, Fb)
        frames.append(final(F))
    F = Frame(SW, SH_)
    frames.append(crack_decal(F, 1.0))
    F = Frame(SW, SH_)
    frames.append(crack_decal(F, .35))
    frames.append(debris_frame())
    rnd = random.Random(2)
    for k in range(3):
        frames.append(dust_frame(k, rnd))
    frames.append(dotted_ring(48))
    frames.append(dotted_ring(92))
    save(strip(frames), 'cor_shockwave')


# ================================================================ ESPADA
BLADE, EDGE, SPINE = '#a4abb6', '#eef2f8', '#545a66'
HAND, BRASS, GUARD, COPPER = '#24201e', '#d8b04a', '#8a8e98', '#b87333'


def spine_v(u):
    return -4.2 - (u - 32) / 78 * 2.6


def edge_v(u):
    if u < 96:
        return 4.0 + (u - 32) / 64 * 3.0
    return 7.0 - (u - 96) / 18 * 9.5


def sword(F, o, ang=0.0, mode='normal', sv=1.0):
    A = Ax(o, ang, 1.0, sv)
    # cordão vermelho no castão
    F.part(chain([A.p(2, 2), A.p(-1, 6), A.p(1, 10), A.p(4, 12)], 1.8, 1.4), '#c8323a', light=.3)
    F.part(A.ell(4.5, 12.5, 1.6, 1.8), '#8a1a20', light=.3)
    # castão
    F.part(A.ell(3, 0, 3.6, 4.0), GUARD, light=.45)
    pxm(F, A.p(3, 0), '#2a2a30')
    # cabo
    mh = F.part(A.poly((5, -3.4), (28, -3.0), (28, 3.0), (5, 3.4)), HAND, light=.3, tex=.2)
    for uu in range(9, 22, 3):
        lin(F, A.p(uu, -3.2), A.p(uu + 1.8, 3.2), '#5a3a22', mh)
    for uu in (7, 24):
        pxm(F, A.p(uu, 0), BRASS, mh)
        pxm(F, A.p(uu + 1, 1), '#7a5a1a', mh)
    # arame de cobre
    mc = F.part(A.rect(25.5, -3.6, 29, 3.6), COPPER, light=.4)
    for uu in (26.2, 27.6):
        lin(F, A.p(uu, -3.4), A.p(uu, 3.4), '#6a3a1a', mc)
    # lâmina
    top = [(u, spine_v(u)) for u in range(32, 113, 4)]
    tip = [(116.5, -8.8), (114, -4.5)]
    bot = [(u, edge_v(u)) for u in range(112, 31, -4)]
    shapes = A.poly(*(top + tip + bot))
    teeth = []
    for uu in range(40, 96, 6):
        s0 = spine_v(uu)
        teeth += A.poly((uu, s0 + .5), (uu + 3.2, s0 - 3.0), (uu + 4.5, spine_v(uu + 4.5) + .5))
    mk = [(A.ell(58, -2.6, 3.0, 1.4), '#8a4a24'), (A.ell(84, -4.0, 2.0, 1.2), '#8a4a24'), (A.ell(90, 3.2, 3.5, 1.3), '#6a1a1a'),
          (A.ell(96, 5.0, 2.2, 1.0), '#6a1a1a'), (A.ell(46, 2.0, 2.0, .9), '#7a4a3a')]
    mb = F.part(shapes + teeth, BLADE, marks=mk, light=.45, tex=.08)
    # fio
    for (dv, c) in ((-.9, EDGE), (-1.9, '#dfe4ec')):
        pts = [A.p(u, edge_v(u) + dv) for u in range(34, 108, 2)]
        for i in range(len(pts) - 1):
            lin(F, pts[i], pts[i + 1], c, mb)
    # lombo escuro sob os dentes
    pts = [A.p(u, spine_v(u) + 1.1) for u in range(33, 112, 2)]
    for i in range(len(pts) - 1):
        lin(F, pts[i], pts[i + 1], SPINE, mb)
    # sulco
    lin(F, A.p(36, -1.2), A.p(78, -1.6), '#8a909c', mb)
    lin(F, A.p(36, -.2), A.p(78, -.6), '#dde2ea', mb)
    # mossas no fio
    for uu in (62, 74, 101):
        p = A.p(uu, edge_v(uu) + .3)
        pxm(F, p, inkc(BLADE))
        pxm(F, A.p(uu, edge_v(uu) - .7), '#7a808c', mb)
    # guarda improvisada
    mg = F.part(A.poly((29, -8.5), (32.5, -9.2), (33, 8.8), (29.5, 8.0)), GUARD, light=.45, tex=.15)
    lin(F, A.p(31, -8), A.p(31.5, 7.5), '#6a6e78', mg)
    for vv in (-5.5, 5):
        pxm(F, A.p(30.5, vv), '#d8dce4', mg)
        pxm(F, A.p(31.3, vv + .8), '#3a3e44', mg)
    pxm(F, A.p(32.5, -8.6), RUST, mg)
    return A, mb


def sword_frames():
    frames = []
    O = (10, 33)

    def fr():
        return Frame(128, 64)
    # 0 normal
    F = fr(); sword(F, O); frames.append(final(F))
    # 1 crítico
    F = fr(); A, mb = sword(F, O)
    F.a[mb, :3] = np.clip(mix(F.a[mb, :3].astype(float), col('#f2c230'), .32), 0, 255)
    F.a[:] = rimglow(F.a)
    back = F.layer()
    glow(F, 70, 32, 56, '#f2c230', alpha=130, layer=back)
    glow(F, 70, 32, 30, '#fff6c8', alpha=70, layer=back)
    for (x, y, r) in ((48, 18, 2), (96, 20, 3), (110, 44, 2), (70, 46, 2)):
        sparkle(F, x, y, r, '#fff6c8')
    frames.append(final(F, under=back))
    # 2,3 Getsuga
    for k in range(2):
        F = fr(); A, mb = sword(F, O)
        dark = mb
        F.a[dark, :3] = np.clip(mix(F.a[dark, :3].astype(float), col('#2a1018'), .6), 0, 255)
        e = dark & ~shift(dark, 0, -1)
        F.a[e, :3] = col('#ff5a5a')
        ol = dilate(dark) & ~dark & (F.a[..., 3] > 0)
        F.a[ol, :3] = col('#5a0a14')
        X, Y = grids(128, 64)
        d = distmap(mb, 14)
        u, v = A.uv(128, 64)
        n = vnoise(X / 4.0 + k * 3.1, Y / 7.0 + k * 2.3, 9) * .75 + vnoise(X / 2.5, Y / 4 + k * 5, 4) * .25
        up = np.clip(-(v + 1) / 6, 0, 1)
        reach = 2.5 + 5 * n + 13 * up * n * n
        fl = (d > 0) & (d <= reach) & (u > 28) & (u < 120)
        rel = d / np.maximum(reach, 1e-3)
        back = F.layer()
        C = np.zeros((64, 128, 3))
        C[:] = col('#1a0a10')
        C[rel > .55] = col('#5a0a18')
        C[rel > .78] = col('#c8323a')
        back[fl, :3] = C[fl]
        back[fl, 3] = 235
        rimm = fl & ~shift(fl, 0, -1) & (rel > .7)
        back[rimm, :3] = col('#ff5a5a')
        # brasas
        rnd = random.Random(30 + k)
        for _ in range(9):
            x = rnd.uniform(40, 116)
            y = rnd.uniform(10, 22)
            pxm(F, (x, y), '#ff5a5a', layer=back)
            pxm(F, (x, y + 1), '#c8323a', layer=back, alpha=160)
        frames.append(final(F, under=back))
    # 4..6 sharpen
    for k, u0 in enumerate((44, 70, 96)):
        F = fr(); A, mb = sword(F, O)
        u, v = A.uv(128, 64)
        b = np.abs((u - u0) + .7 * v)
        w1 = mb & (b < 1.6)
        w2 = mb & (b >= 1.6) & (b < 3.4)
        F.a[w2, :3] = np.clip(mix(F.a[w2, :3].astype(float), np.array([255, 255, 255.]), .5), 0, 255)
        F.a[w1, :3] = 255
        q = A.p(u0 + 2, spine_v(u0) - 1)
        sparkle(F, q[0], q[1], 3, '#ffffff')
        frames.append(final(F))
    # 7 loot
    F = fr()
    sword(F, (8, 44), ang=-3, sv=.8)
    frames.append(final(F, under=shadow_layer(64, 56, 3.5, 95, 128, 64, 50)))
    save(strip(frames), 'cor_espada')


# ================================================================ ARCO DO GOLPE
def slash(F, head, span, R, wmax, pal, alpha=1.0, broken=False, cx=64, cy=64, k=.8, seed=0, outline=True):
    X, Y = grids(F.w, F.h)
    dx, dy = X - cx, (Y - cy) / k
    r = np.hypot(dx, dy)
    th = np.degrees(np.arctan2(dy, dx))
    back = np.mod(head - th, 360)
    p = 1 - back / span
    on = (p >= 0) & (p <= 1)
    w = wmax * np.clip(p, 0, 1) ** .8
    cap = p > .93
    w = np.where(cap, w * np.sqrt(np.clip(1 - ((p - .93) / .07) ** 2, 0, 1)), w)
    s = (R - r) / np.maximum(w, 1e-3)
    m = on & (r <= R) & (s <= 1) & (w > .5)
    if broken:
        nz = vnoise(th / 9.0, r / 3.0, seed)
        m &= nz < .58
    c0, c1, c2, ce = [col(c) for c in pal]
    C = np.zeros((F.h, F.w, 3))
    C[:] = c2
    C[s < .62] = c1
    C[s < .28] = c0
    a = np.full((F.h, F.w), 255.0)
    a[s >= .62] = 150
    a *= np.clip(p * 2.2, 0, 1)
    for s0 in (.45, .78):
        st = m & (np.abs(r - (R - s0 * w)) < .55) & (p > .15) & (p < .9)
        C[st] = c0
        a[st] = np.maximum(a[st], 200)
    a = np.round(a * alpha / 51) * 51
    L = F.a
    L[m, :3] = C[m]
    L[m, 3] = np.clip(a[m], 0, 255).astype(np.uint8)
    if outline:
        o = on & (r > R) & (r <= R + 1.3) & (p > .2) & (w > 1.2)
        if broken:
            o &= vnoise(th / 9.0, r / 3.0, seed) < .58
        L[o, :3] = ce
        L[o, 3] = int(150 * alpha)
    return m


def arco_frames():
    frames = []
    WHT = ['#ffffff', '#e8ecf4', '#a8b4cc', '#4a5470']
    GLD = ['#fff6c8', '#f2c230', '#b8861a', '#6a3a0a']
    for pal, gold in ((WHT, False), (GLD, True)):
        for k, (hd, sp, wm, al, br) in enumerate(((10, 70, 14, 1.0, False), (60, 120, 20, 1.0, False), (64, 100, 11, .7, True))):
            F = Frame()
            slash(F, hd, sp, 50, wm, pal, al, br, seed=k)
            if gold:
                for i, a in enumerate((hd - 10, hd - 40, hd - 70)):
                    if a > hd - sp:
                        x = 64 + 44 * math.cos(math.radians(a))
                        y = 64 + 44 * .8 * math.sin(math.radians(a))
                        sparkle(F, x + 4, y, 2 if i else 3, '#fff6c8')
            frames.append(final(F))
    for k, (hd, sp, wm, al, br) in enumerate(((150, 220, 16, 1.0, False), (420, 360, 18, 1.0, False), (420, 360, 9, .6, True))):
        F = Frame()
        slash(F, hd, sp, 48, wm, WHT, al, br, seed=k + 5)
        frames.append(final(F))
    save(strip(frames), 'cor_arco_golpe')


# ================================================================ KILL
BL, BL2, BLH, BLO = '#c8202a', '#8a1420', '#ff6a6a', '#2a0a10'


def drop(F, a, b, r, layer=None):
    sh = limb(a[0], a[1], b[0], b[1], r * .9, r * 2) if math.hypot(b[0] - a[0], b[1] - a[1]) > .5 else ell(b[0], b[1], r, r)
    m = F.part(sh, BL, ol=BLO, light=.3, dark=.4, layer=layer)
    pxm(F, (b[0] - r * .4, b[1] - r * .4), BLH, m, layer=layer)
    return m


def kill_frames():
    frames = []
    # 0 faísca de impacto
    F = Frame()
    for a in range(0, 360, 60):
        aa = math.radians(a + 15)
        F.part(limb(64 + 16 * math.cos(aa), 64 + 16 * math.sin(aa), 64 + 28 * math.cos(aa), 64 + 28 * math.sin(aa), 2.5, 1),
               '#fff4d0', shade=False, ol='#c9343a', layer=F.fx)
    back = F.layer()
    glow(F, 64, 64, 30, '#fff4d0', alpha=150, layer=back)
    impact(F, 64, 64, 22)
    impact(F, 64, 64, 11)
    frames.append(final(F, under=back))
    # 1..3 respingos
    rnd = random.Random(3)
    drops = [(rnd.uniform(-55, 30), rnd.uniform(50, 95), rnd.uniform(1.4, 3.2)) for _ in range(14)]
    O = (34, 64)
    for k, t in enumerate((.22, .5, .85)):
        F = Frame()
        for (a, sp, r) in drops:
            aa = math.radians(a)

            def pos(tt):
                return (O[0] + math.cos(aa) * sp * tt, O[1] + math.sin(aa) * sp * tt + 60 * tt * tt)
            b = pos(t)
            a0 = pos(max(0, t - (.12 if k < 2 else .05)))
            rr = r * (1.0 if k < 2 else .7)
            drop(F, a0, b, rr)
            if k == 2 and r > 2.6:
                drop(F, (b[0] - 4, b[1] - 6), (b[0] - 4, b[1] - 4), 1.2)
        if k == 0:
            F.part(ell(O[0] + 4, O[1], 7, 5), BL, ol=BLO, light=.3)
            pxm(F, (O[0] + 2, O[1] - 2), BLH)
        frames.append(final(F))
    # 4..6 pop
    F = Frame()
    back = F.layer()
    glow(F, 64, 62, 30, '#ffffff', alpha=200, layer=back)
    F.part(ell(64, 62, 14, 14), '#ffffff', shade=False, ol='#cfc8d8')
    F.flat(ell(60, 58, 5, 5), '#fffaf0')
    ring_px(F, 64, 62, 20, 3, '#ffffff', '#cfc8d8', ryk=.9, layer=F.fx)
    frames.append(final(F, under=back))
    F = Frame()
    rnd = random.Random(5)
    for i in range(7):
        a = i * 2 * math.pi / 7 + .3
        x, y = 64 + 16 * math.cos(a), 62 + 14 * math.sin(a)
        r = rnd.uniform(8, 11)
        F.part(ell(x, y, r, r * .85) + ell(x + r * .6, y + r * .3, r * .6, r * .5), '#f4efe6', ol='#8a849a', light=.3)
    F.part(ell(64, 62, 10, 9), '#ffffff', shade=False, outline=False)
    ring_px(F, 64, 62, 34, 2, '#ffffff', '#e8e4f0', ryk=.9, layer=F.fx)
    frames.append(final(F))
    F = Frame()
    T = Frame()
    for i in range(7):
        a = i * 2 * math.pi / 7 + .5
        x, y = 64 + 22 * math.cos(a), 60 + 19 * math.sin(a)
        r = rnd.uniform(7, 9)
        T.part(ell(x, y, r, r * .85), '#e8e4f0', ol='#8a849a', light=.3)
    X, Y = grids(128, 128)
    T.a[vnoise(X / 4, Y / 4, 2) > .6] = 0
    F.a[:] = fade(T.a, .7)
    ring_px(F, 64, 62, 46, 1.5, '#ffffff', '#ffffff', ryk=.9, alpha=150, dotted=True, layer=F.fx)
    frames.append(final(F))
    # 7 pedaços
    F = Frame()
    cx = (22, 64, 106)
    cy = (40, 90)
    # carne verde
    x, y = cx[0], cy[0]
    F.part(poly((x - 9, y - 3), (x - 3, y - 9), (x + 6, y - 7), (x + 9, y + 1), (x + 4, y + 7), (x - 6, y + 6)), '#7fa05a',
           marks=[(poly((x + 2, y + 2), (x + 9, y + 1), (x + 4, y + 7), (x - 2, y + 6)), '#a8323a'),
                  (ell(x - 3, y - 2, 2.5, 1.8), '#5a7a3a'), (ell(x + 2, y - 5, 1.6, 1.2), '#5a7a3a')], light=.3, tex=.25)
    pxm(F, (x + 5, y + 3), '#e0606a'); F.part(limb(x + 3, y + 8, x + 3, y + 11, 1.8, 1.4), BL2, ol=BLO)
    # carne vermelha
    x, y = cx[1], cy[0]
    F.part(poly((x - 8, y), (x - 4, y - 7), (x + 4, y - 8), (x + 9, y - 2), (x + 6, y + 6), (x - 3, y + 7)), '#a8323a',
           marks=[(limb(x - 5, y - 2, x + 6, y - 4, 2), '#e8a0a0'), (ell(x + 2, y + 3, 2.5, 1.8), '#6a1a20')], light=.3, tex=.2)
    pxm(F, (x - 3, y - 5), '#ff9a9a')
    # pano azul
    x, y = cx[2], cy[0]
    m = F.part(poly((x - 10, y - 6), (x - 4, y - 8), (x - 2, y - 5), (x + 3, y - 8), (x + 9, y - 6), (x + 7, y - 1), (x + 10, y + 3),
                    (x + 5, y + 7), (x + 2, y + 4), (x - 3, y + 8), (x - 9, y + 4), (x - 7, y)), '#5a7aa0',
               marks=[(ell(x + 3, y + 2, 3, 2), '#6a2a30')], light=.3, tex=.3)
    for i in range(-7, 8, 2):
        pxm(F, (x + i, y - 3), '#c9c3b0', m)
    lin(F, (x - 6, y + 1), (x + 4, y - 2), '#3a5070', m)
    # osso
    x, y = cx[0], cy[1]
    F.part(limb(x - 8, y + 3, x + 7, y - 3, 3.4) + ell(x - 9, y + 5, 2.4, 2.4) + ell(x - 10, y + 1, 2.4, 2.4), '#e8dcc0', light=.35)
    F.part(poly((x + 6, y - 5), (x + 10, y - 6), (x + 8, y - 3), (x + 11, y - 1), (x + 7, y)), '#e8dcc0', light=.3)
    F.flat(poly((x + 8, y - 4), (x + 10, y - 3), (x + 8, y - 1)), '#a8323a')
    lin(F, (x - 3, y + 1), (x + 1, y - 1), '#b8a888')
    # tufo de cabelo/escalpo
    x, y = cx[1], cy[1]
    F.part(ell(x, y + 2, 9, 5), '#7fa05a', marks=[(ell(x + 3, y + 5, 4, 2), '#a8323a')], light=.3, tex=.2)
    for i in range(-7, 8, 2):
        F.part(chain([(x + i, y + 1), (x + i - 2, y - 4), (x + i + 1, y - 8 - abs(i) % 3)], 2.6, 1.2), '#5a4430', light=.4, outline=(i == -7 or i == 7))
    # dente
    x, y = cx[2], cy[1]
    F.part(poly((x - 5, y - 4), (x + 5, y - 4), (x + 5, y + 1), (x + 3, y + 7), (x + 1, y + 2), (x - 1, y + 2), (x - 3, y + 7), (x - 5, y + 1)),
           '#f0e8d0', marks=[(poly((x + 1, y + 2), (x + 3, y + 7), (x + 4, y + 3)), '#c8a888')], light=.4)
    pxm(F, (x - 3, y - 3), '#ffffff'); pxm(F, (x + 3, y + 6), '#a8323a')
    frames.append(final(F))

    # poça
    def puddle(F, rx, seed, dry=False, splats=True):
        rnd = random.Random(seed)
        cx, cy = 58, 86
        sh = ell(cx, cy, rx, rx * .42, n=40)
        for i in range(6):
            a = rnd.uniform(-1.2, 1.4) if i < 4 else rnd.uniform(1.8, 4.2)
            d = rx * rnd.uniform(.55, .9)
            sh += ell(cx + d * math.cos(a), cy + d * .42 * math.sin(a), rx * rnd.uniform(.25, .4), rx * rnd.uniform(.12, .2))
        drops = []
        if splats:
            for i in range(7):
                d = rx * rnd.uniform(1.05, 1.7)
                a = rnd.uniform(-.5, .5)
                drops.append((cx + d * math.cos(a), cy + d * .42 * math.sin(a), rnd.uniform(1.2, 2.6)))
            sh += limb(cx + rx * .8, cy, cx + rx * 1.35, cy + 2, rx * .18, rx * .06)
        if dry:
            m = F.part(sh, '#4a1418', marks=[(ell(cx - rx * .15, cy - 1, rx * .7, rx * .26), '#3e1216')], light=.12, dark=.25, tex=.12, ol='#1e080c')
            X, Y = grids(128, 128)
            cr = m & (np.abs(vnoise(X / 3.5, Y / 2, 7) - .5) < .012)
            F.a[cr, :3] = col('#24090c')
            for (x, y, r) in drops:
                F.part(ell(x, y, r, r * .6), '#3e1216', light=.1, ol='#1e080c')
        else:
            m = F.part(sh, BL2, marks=[(ell(cx - rx * .12, cy - rx * .05, rx * .78, rx * .3), '#b01c28'),
                                       (ell(cx - rx * .3, cy - rx * .14, rx * .3, rx * .08), '#d0404a')],
                       light=.2, dark=.35, ol=BLO)
            for (a, b) in ((-.5, -.17), (-.35, -.2), (.2, -.12)):
                pxm(F, (cx + rx * a, cy + rx * b), '#ff8a8a', m)
            for (x, y, r) in drops:
                mm = F.part(ell(x, y, r, r * .6), BL2, ol=BLO, light=.3)
                pxm(F, (x - r * .3, y - r * .3), '#e04a50', mm)
        return cx, cy
    F = Frame(); puddle(F, 14, 1, splats=False); frames.append(final(F))
    F = Frame(); puddle(F, 32, 1); frames.append(final(F))
    F = Frame(); puddle(F, 32, 1, dry=True); frames.append(final(F))
    F = Frame(); cx_, cy_ = puddle(F, 32, 1)
    F.part(limb(cx_ - 12, cy_ + 1, cx_ + 10, cy_ - 4, 3.6) + ell(cx_ - 13, cy_ + 3, 2.6, 2.4) + ell(cx_ - 14, cy_ - 1, 2.6, 2.4)
           + ell(cx_ + 11, cy_ - 6, 2.6, 2.4) + ell(cx_ + 12, cy_ - 2, 2.6, 2.4), '#e8dcc0',
           marks=[(ell(cx_ + 2, cy_ - 1, 4, 1.6), '#b04a4a')], light=.4)
    lin(F, (cx_ - 6, cy_ - 1), (cx_ + 4, cy_ - 4), '#fff8e8')
    frames.append(final(F))

    # violência reduzida
    def coin(F, x, y, edge=0.0):
        rx = 3.2 * (1 - edge) + .9 * edge
        m = F.part(ell(x, y, rx * 1.15, 3.9, n=20), '#f2c230', light=.45, ol='#5a3a08')
        if rx > 2:
            F.flat(ell(x + .3, y + .3, rx * .45, 1.5), '#b8861a')
            pxm(F, (x - rx * .5, y - 2), '#fff6c8', m)
    F = Frame()
    rnd = random.Random(9)
    for i in range(6):
        a = i * 2 * math.pi / 6 + .4
        x, y = 64 + 14 * math.cos(a), 64 + 11 * math.sin(a)
        r = rnd.uniform(9, 12)
        F.part(ell(x, y, r, r * .85) + ell(x + r * .6, y + r * .3, r * .6, r * .5), '#8a8494', ol='#3a3444', light=.3)
    F.part(ell(64, 62, 10, 8), '#a8a2b0', shade=False, outline=False)
    for (x, y, e) in ((40, 34, 0), (64, 26, .6), (88, 36, 0), (96, 58, .3), (30, 58, .8)):
        coin(F, x, y, e)
    frames.append(final(F))
    F = Frame()
    for (x, y, e) in ((56, 84, 0), (68, 87, 0), (62, 80, .7)):
        coin(F, x, y, e)
    frames.append(final(F, under=shadow_layer(62, 28, 9, 90, 128, 128, 86)))
    save(strip(frames), 'cor_kill')


# ================================================================ IMPACTO / NÚMERO
def starpoly(cx, cy, n, r0, r1, rot=0.0, k=1.0, jit=None):
    pts = []
    for i in range(2 * n):
        a = math.radians(rot) - math.pi / 2 + i * math.pi / n
        rr = r0 if i % 2 == 0 else r1
        if jit is not None:
            rr *= jit[i]
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a) * k))
    return [pts]


def impacto_frames():
    frames = []
    for k, (r, rot) in enumerate(((27, 0), (21, 22.5))):
        F = Frame(64, 64)
        back = F.layer()
        glow(F, 32, 32, r + 6, '#f2c230', alpha=140, layer=back)
        F.part(starpoly(32, 32, 8, r, r * .42, rot), '#f2c230', shade=False, ol='#3a2a08')
        F.part(starpoly(32, 32, 8, r * .72, r * .32, rot), '#fff6c8', shade=False, outline=False)
        F.part(starpoly(32, 32, 4, r * .5, r * .18, rot + 22.5), '#ffffff', shade=False, outline=False)
        F.flat(ell(32, 32, 3.5, 3.5), '#ffffff')
        if k:
            for (x, y) in ((10, 12), (54, 16), (52, 52), (12, 50)):
                sparkle(F, x, y, 2, '#fff6c8')
        frames.append(final(F, under=back))
    rnd = random.Random(14)
    jit = [rnd.uniform(.86, 1.0) if i % 2 == 0 else rnd.uniform(.9, 1.08) for i in range(28)]
    for k, sc in enumerate((.72, 1.0)):
        F = Frame(64, 64)
        back = F.layer()
        glow(F, 32, 32, 34 * sc + 4, '#f6a02a', alpha=110, layer=back)
        R0, R1 = 29 * sc, 20 * sc
        kk = .8
        F.flat(starpoly(32, 32, 14, R0 + 3, R1 + 3, 6, kk, jit), '#2a1208')
        for f, c in ((1.0, '#e0601a'), (.84, '#f6a02a'), (.68, '#ffd23a'), (.5, '#fff27a')):
            F.flat(starpoly(32, 32, 14, R0 * f, R1 * f, 6, kk, jit), c)
        # brilhos de cima-esquerda
        for (x, y) in ((22, 22), (24, 21), (21, 24)):
            pxm(F, (32 + (x - 32) * sc, 32 + (y - 32) * sc), '#ffffff')
        lin(F, (32 - 12 * sc, 32 - 6 * sc), (32 - 6 * sc, 32 - 11 * sc), '#fffbd0')
        frames.append(final(F, under=back))
    for k, sc in enumerate((1.0, 1.25)):
        F = Frame(64, 64)
        h = 14 * sc
        bars = limb(32 - h, 32 - h, 32 + h, 32 + h, 8 * sc) + limb(32 + h, 32 - h, 32 - h, 32 + h, 8 * sc)
        back = F.layer()
        glow(F, 32, 32, 26 * sc, '#ffffff' if k else '#e0303a', alpha=150 if k else 90, layer=back)
        F.flat(limb(32 - h, 32 - h + 1, 32 + h, 32 + h + 1, 8 * sc + 3) + limb(32 + h, 32 - h + 1, 32 - h, 32 + h + 1, 8 * sc + 3), '#1a0a0e')
        m = F.part(bars, '#e0303a', light=.35, dark=.45, ol='#1a0a0e')
        hi = m & ~shift(m, 2, 2)
        F.a[hi, :3] = col('#ff7a7a')
        if k:
            inner = m & shift(m, 3, 3) & shift(m, -3, -3)
            F.a[inner, :3] = np.clip(mix(F.a[inner, :3].astype(float), np.array([255, 255, 255.]), .45), 0, 255)
        frames.append(final(F, under=back))
    save(strip(frames), 'cor_impacto_numero')


if __name__ == '__main__':
    shield_frames()
    faiscas_frames()
    hammer_frames()
    shockwave_frames()
    sword_frames()
    arco_frames()
    kill_frames()
    impacto_frames()
