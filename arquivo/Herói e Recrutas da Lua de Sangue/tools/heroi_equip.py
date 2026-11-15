"""Herói — armas, equipamentos visuais e skins (grupo heroi_equip).

Gera em ../heroi/ folhas 1024x1024 (8 linhas HROWS x 8 colunas) JÁ COLORIDAS (tint=false):
  weapon_<id>.png, armor_<id>_<m|f>.png, bag_<id>.png, head_<id>.png, feet_<id>.png, acc_<id>.png
+ manifesto heroi/equip.json + prévia heroi/preview_equip.png.
Roda sozinho:  python heroi_equip.py
"""
import os
import sys
import json
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humano import *   # noqa  (pixkit também)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'heroi')


# ================================================================ utilidades

def col(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def dk(c, t=.2):
    """versão 'de trás' (roxo da noite)."""
    return mix(col(c), NIGHT, t)


def lt(c, t=.3):
    return mix(col(c), MOON, t)


def ink(c, t=.55):
    return mix(col(c) * .32, INK, t)


class Ax:
    """eixo local: u ao longo do ângulo, v perpendicular (v>0 = 'embaixo' quando aponta p/ direita)."""

    def __init__(self, o, ang):
        self.o = o
        a = math.radians(ang)
        self.c, self.s = math.cos(a), math.sin(a)
        self.ang = ang

    def p(self, u, v=0.0):
        return (self.o[0] + u * self.c - v * self.s, self.o[1] + u * self.s + v * self.c)

    def poly(self, *uv):
        return [[self.p(u, v) for u, v in uv]]

    def ell(self, u, v, ru, rv, n=14):
        return [[self.p(u + ru * math.cos(2 * math.pi * k / n), v + rv * math.sin(2 * math.pi * k / n)) for k in range(n)]]

    def rect(self, u0, v0, u1, v1):
        return self.poly((u0, v0), (u1, v0), (u1, v1), (u0, v1))

    def limb(self, u0, v0, u1, v1, w0, w1=None):
        a, b = self.p(u0, v0), self.p(u1, v1)
        return limb(a[0], a[1], b[0], b[1], w0, w1)


class Lo:
    """referencial do tronco/cabeça: origem o, girado por deg (x = direita, y = baixo)."""

    def __init__(self, o, deg):
        self.o = o
        a = math.radians(deg)
        self.c, self.s = math.cos(a), math.sin(a)

    def p(self, x, y):
        return (self.o[0] + x * self.c - y * self.s, self.o[1] + x * self.s + y * self.c)

    def poly(self, *xy):
        return [[self.p(x, y) for x, y in xy]]

    def rect(self, x0, y0, x1, y1):
        return self.poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))

    def ell(self, x, y, rx, ry, n=16):
        return [[self.p(x + rx * math.cos(2 * math.pi * k / n), y + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]]


def lin(F, a, b, c, m=None, layer=None):
    """linha de pixels (opcionalmente só dentro da máscara m)."""
    L = F.a if layer is None else layer
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    cc = col(c)
    for k in range(n + 1):
        t = k / max(1, n)
        x, y = int(round(a[0] + (b[0] - a[0]) * t)), int(round(a[1] + (b[1] - a[1]) * t))
        if 0 <= x < S and 0 <= y < S and (m is None or m[y, x]):
            L[y, x, :3] = cc
            L[y, x, 3] = 255


def dots(F, a, b, c, step=2, m=None, phase=0):
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    cc = col(c)
    for k in range(phase, n + 1, step):
        t = k / max(1, n)
        x, y = int(round(a[0] + (b[0] - a[0]) * t)), int(round(a[1] + (b[1] - a[1]) * t))
        if 0 <= x < S and 0 <= y < S and (m is None or m[y, x]):
            F.a[y, x, :3] = cc
            F.a[y, x, 3] = 255


def pxm(F, p, c, m=None):
    x, y = int(round(p[0])), int(round(p[1]))
    if 0 <= x < S and 0 <= y < S and (m is None or m[y, x]):
        F.a[y, x, :3] = col(c)
        F.a[y, x, 3] = 255


def pattern(F, m, fn):
    """recolore pixels da máscara: fn(x, y, rgb) -> rgb ou None."""
    ys, xs = np.nonzero(m)
    for y, x in zip(ys, xs):
        r = fn(x, y, F.a[y, x, :3].astype(float))
        if r is not None:
            F.a[y, x, :3] = np.clip(r, 0, 255)


def cut(F, m, edge=None):
    """apaga pixels da máscara m; opcionalmente pinta de 'edge' a borda que sobrou."""
    had = F.a[..., 3] > 0
    F.a[m] = 0
    if edge is not None:
        e = had & ~m & dilate(m) & (F.a[..., 3] > 0)
        F.a[e, :3] = col(edge) if not callable(edge) else edge
    return had


def fx_over(F, tmp):
    F.fx[:] = over(F.fx, tmp)


def fx_shape(F, shapes, c, alpha=255, ol=None, shade=False, light=.25):
    tmp = np.zeros((S, S, 4), np.uint8)
    F.part(shapes, c, shade=shade, ol=ol, layer=tmp, outline=ol is not None, light=light)
    tmp[..., 3] = (tmp[..., 3].astype(float) * alpha / 255).astype(np.uint8)
    fx_over(F, tmp)


# ================================================================ ARMAS

# kind: short (curta, segue grip sempre), long (corpo a corpo longa), pistol, gun (arma longa de fogo)
WEAP = {
    'faca':       dict(nome='Faca', kind='short', line='attack_knife', tip=10.5, wtr=2),
    'taco':       dict(nome='Taco', kind='long', line='attack', tip=24.5, wtr=4),
    'facao':      dict(nome='Facão', kind='long', line='attack', tip=22.5, wtr=3),
    'machado':    dict(nome='Machado', kind='long', line='attack', tip=25, wtr=5),
    'pistola':    dict(nome='Pistola', kind='pistol', line='attack_fire', tip=10, muzzle=(10.5, -4.8), port=(3, -6.5), flash=(8, 3.5)),
    'espingarda': dict(nome='Espingarda', kind='gun', line='attack_fire', tip=21, muzzle=(21.5, -3.0), port=(5, -4), flash=(11, 5.5)),
    'rifle':      dict(nome='Rifle', kind='gun', line='attack_fire', tip=23, muzzle=(23.5, -2.3), port=(4, -4), flash=(13, 2.6)),
}
ATK_LONG = [-85, -105, -40, 45, 65, -40]     # ângulos próprios das armas longas na linha attack


def wangle(P, wid):
    k = WEAP[wid]['kind']
    row, i, g = P['row'], P['i'], P['grip']
    if row == 'attack':
        return g if (k in ('short', 'pistol') and i >= 2) else ATK_LONG[i]
    if row in ('attack_fire', 'attack_knife'):
        return g
    if row == 'special':
        return {'short': 60, 'long': 60, 'pistol': 80, 'gun': 25}[k]
    walk = row == 'walk'
    if k in ('short', 'long'):
        return g
    if k == 'pistol':
        return 75 + ((g + 60) * .6 if walk else 0)
    return -80 + ((g + 60) * .3 if walk else 0)


# ---------------------------------------------------------------- desenho de cada arma (eixo A)

def w_faca(F, A, st):
    F.part(A.rect(-4.5, -1.5, 1.2, 1.5) + A.ell(-4.6, 0, 1.4, 1.6), '#3a2418', light=.3)
    pxm(F, A.p(-3, 0), '#d8c08a'); pxm(F, A.p(-0.5, 0), '#d8c08a')
    F.part(A.rect(1.2, -2.6, 2.4, 2.6), '#4a4e58', light=.4)
    m = F.part(A.poly((2.4, -1.5), (8.5, -1.5), (10.8, -0.9), (9.4, 0.4), (6.5, 1.6), (2.4, 1.7)), '#c9ced8', light=.45)
    lin(F, A.p(3, 0.9), A.p(8, 0.4), '#f4f6fa', m)
    lin(F, A.p(3, -1), A.p(8.5, -1), '#7a808c', m)


def w_taco(F, A, st):
    F.part(A.ell(-5, 0, 1.5, 2.7), '#7a4a24')
    m = F.part(A.poly((-4, -1.5), (4, -1.6), (23.5, -3.3), (24.6, -2), (24.6, 2), (23.5, 3.3), (4, 1.6), (-4, 1.5))
               + A.ell(23.6, 0, 1.2, 3.3), '#c99a5a', light=.32)
    # veio da madeira e nó
    lin(F, A.p(6, -0.7), A.p(23, -1.9), '#9a6a34', m)
    lin(F, A.p(9, 1.0), A.p(22, 1.8), '#a87842', m)
    lin(F, A.p(14, -2.0), A.p(18, -2.4), '#e8c48a', m)
    pxm(F, A.p(16, 0.3), '#7a4a24', m); pxm(F, A.p(17, 0.3), '#8a5a2c', m)
    # fita preta listrada
    mt = F.part(A.rect(-4, -1.8, 4.5, 1.8), '#26262c', light=.25)
    for u in (-3, -1, 1, 3):
        lin(F, A.p(u, -1.6), A.p(u + 1, 1.6), '#5a5a66', mt)
    # pregos (lado do golpe v+) e sangue
    for (u, s) in ((17.5, 1), (21, 1), (20, -1)):
        r = 3.0 if s > 0 else 2.8
        a, b = A.p(u, s * r), A.p(u + .6, s * (r + 2.6))
        F.part(limb(a[0], a[1], b[0], b[1], 1.1, .8), '#b8bcc4', light=.5, ol='#2a2a30')
    for (u, v) in ((19, 2), (20, 2.5), (22, 2), (22.5, 1), (18, 1.6), (23, 2.8)):
        pxm(F, A.p(u, v), '#7a1a1a', m)
    pxm(F, A.p(21, 1.2), '#a42424', m)


def w_facao(F, A, st):
    F.part(A.rect(-5, -2, 2.2, 2.1) + A.ell(-5, 0, 1.4, 2.1), '#24201e', light=.3)
    pxm(F, A.p(-3.2, 0), '#d8b04a'); pxm(F, A.p(-0.4, 0), '#d8b04a')
    F.part(A.rect(2.2, -2.4, 3.2, 2.4), '#8a8e98', light=.4)
    m = F.part(A.poly((3.2, -1.9), (15, -2.2), (19.5, -2.7), (22.6, -4.1), (22.2, -1.2), (20, 1.8), (15, 2.8), (3.2, 2.1)),
               '#b8bec8', light=.45)
    lin(F, A.p(4, 1.4), A.p(19.5, 1.2), '#eef2f8', m)
    lin(F, A.p(4, 1.0), A.p(15, 1.9), '#eef2f8', m)
    lin(F, A.p(4, -1.2), A.p(19.5, -1.8), '#5a606c', m)
    for (u, v) in ((9, 0), (10, 0), (13, -1), (17, 0.5)):
        pxm(F, A.p(u, v), '#8a4a24', m)


def w_machado(F, A, st):
    m = F.part(A.rect(-5, -1.5, 24.5, 1.5) + A.ell(-5, 0, 1.5, 1.9), '#a87444', light=.3)
    lin(F, A.p(5, -0.5), A.p(17, -0.6), '#7a4e2a', m)
    lin(F, A.p(9, 0.6), A.p(16, 0.6), '#c8945a', m)
    mg = F.part(A.rect(-5.5, -1.7, 3, 1.7), '#4a2e1a', light=.25)
    for u in (-4, -2, 0, 2):
        lin(F, A.p(u, -1.5), A.p(u + 1, 1.5), '#6a4426', mg)
    # picareta de trás
    F.part(A.poly((19.2, -1.8), (22.8, -1.8), (21.6, -7.4), (20.6, -7.4)), '#9aa0aa', light=.4)
    # cabeça vermelha + fio de aço
    mh = F.part(A.poly((18.2, -2.1), (23.8, -2.1), (23.8, 2), (27, 8.6), (27.4, 11), (15.4, 11), (15.8, 8.6), (18.2, 2)), '#c0262d', light=.3)
    F.part(A.poly((15.8, 8.4), (27, 8.4), (27.4, 11), (15.4, 11)), '#dfe4ec', light=.5, ol='#3a3e48')
    lin(F, A.p(16.5, 10), A.p(26.5, 10), '#ffffff')
    lin(F, A.p(19, -1), A.p(19, 6), '#e04a4a', mh)
    pxm(F, A.p(21, 0), '#5a0e12', mh)  # olho do cabo
    F.part(A.rect(24.4, -1.6, 25.6, 1.6), '#9aa0aa')


def w_pistola(F, A, st):
    r = st.get('slide', 0)
    F.part(A.poly((-3.6, -2.6), (1.4, -2.6), (0.6, 4.6), (-3.8, 4.4)), '#4a3a30', light=.25)        # punho
    mg = F.mask(A.poly((-3.6, -2.6), (1.4, -2.6), (0.6, 4.6), (-3.8, 4.4)))
    pattern(F, mg, lambda x, y, c: c * .8 if (x + y) % 2 == 0 else None)
    F.part(A.rect(-3, -3.3, 8, -1.8), '#2e3038', light=.25)                                            # armação
    ring = A.ell(2.6, -1.2, 2.0, 1.7)
    F.part(ring, '#2e3038', shade=False)
    F.a[F.mask(A.ell(2.6, -1.2, 1.0, 0.8))] = 0                                                       # guarda-mato vazado
    lin(F, A.p(2.2, -1.8), A.p(2.6, -0.6), '#8a8e98')                                                 # gatilho
    F.part(A.rect(9 + r * .2, -5.2, 10.8 + r * .2, -4.2), '#24262c', shade=False)                    # cano
    ms = F.part(A.rect(-4 + r, -6.6, 9.6 + r, -3.2), '#3a3c44', light=.35)                            # ferrolho
    lin(F, A.p(-3.5 + r, -6.1), A.p(9 + r, -6.1), '#7a7e8a', ms)
    for u in (-3, -2, -1):
        lin(F, A.p(u + r, -5.6), A.p(u + r, -4.0), '#202228', ms)
    lin(F, A.p(3 + r, -4.0), A.p(6 + r, -4.0), '#202228', ms)                                         # janela de ejeção
    pxm(F, A.p(9 + r, -7.2), '#3a3c44'); pxm(F, A.p(-3.4 + r, -7.2), '#3a3c44')


def w_espingarda(F, A, st):
    pu = st.get('pump', 0)
    ms = F.part(A.poly((-14, -2.6), (-3, -2.4), (0.5, -1.4), (0.5, 1.8), (-3, 2.0), (-14, 4.8)), '#8a5a30', light=.3)
    lin(F, A.p(-12, -0.8), A.p(-3, -0.7), '#6a4220', ms)
    lin(F, A.p(-11, 2.4), A.p(-5, 1.0), '#a8723e', ms)
    F.part(A.rect(-15.4, -2.8, -14, 5.0), '#1e1a18')
    F.part(A.ell(2.2, 0.8, 1.9, 1.5), '#2e3038', shade=False)
    F.a[F.mask(A.ell(2.2, 0.8, 0.9, 0.6))] = 0
    mb = F.part(A.rect(7, -4.0, 21.5, -2.2), '#5a5e68', light=.45)
    lin(F, A.p(8, -3.6), A.p(21, -3.6), '#a8aeb8', mb)
    F.part(A.rect(7, -2.0, 18.5, -0.6), '#44474f', light=.3)
    mr = F.part(A.rect(0, -4.4, 8, 0.2), '#3a3c44', light=.35)
    lin(F, A.p(2, -2.4), A.p(5.5, -2.4), '#202228', mr)
    pxm(F, A.p(21, -4.8), '#e8e0c8')
    mp = F.part(A.rect(9.5 + pu, -2.6, 15.5 + pu, 1.2), '#8a5a30', light=.3)
    for u in (11, 12.5, 14):
        lin(F, A.p(u + pu, -2.2), A.p(u + pu, 0.8), '#5a3818', mp)


def w_rifle(F, A, st):
    ms = F.part(A.poly((-14, -2.2), (-3, -1.6), (0, -1.2), (0, 2.2), (-3.5, 2.2), (-8, 4.6), (-14, 4.6)), '#7a4a24', light=.3)
    lin(F, A.p(-12, -0.6), A.p(-3, -0.4), '#5a3418', ms)
    lin(F, A.p(-12, 2.6), A.p(-8, 2.4), '#9a6434', ms)
    F.part(A.rect(-15.4, -2.4, -14, 4.8), '#1e1a18')
    F.part(A.ell(1.6, 0.8, 1.8, 1.5), '#2e3038', shade=False)
    F.a[F.mask(A.ell(1.6, 0.8, 0.8, 0.6))] = 0
    F.part(A.rect(7, -3.1, 23.5, -1.6), '#4a4e58', light=.4)
    mf = F.part(A.poly((4, -1.8), (15.5, -1.8), (15.5, 0.2), (4, 1.4)), '#7a4a24', light=.3)
    lin(F, A.p(5, -0.6), A.p(15, -0.9), '#5a3418', mf)
    mr = F.part(A.rect(-0.5, -3.6, 7.5, 0.3), '#34363e', light=.35)
    # ferrolho
    a, b = A.p(4, 0.0), A.p(5.4, 2.4)
    F.part(limb(a[0], a[1], b[0], b[1], 1.1), '#8a8e98', ol='#202228')
    F.part(A.ell(5.6, 2.8, 1.1, 1.1), '#b8bcc4', ol='#202228')
    # luneta
    for u in (1.2, 6.2):
        lin(F, A.p(u, -4.0), A.p(u, -4.6), '#202228')
    msc = F.part(A.rect(-0.5, -7.0, 9.5, -4.8) + A.ell(-1.4, -5.9, 1.3, 1.9) + A.ell(10.4, -5.9, 1.5, 2.1), '#22242a', light=.35)
    lin(F, A.p(0, -6.6), A.p(9, -6.6), '#5a5e6a', msc)
    pxm(F, A.p(11.2, -6.2), '#5ab0e8'); pxm(F, A.p(11.2, -5.4), '#2a6aa8'); pxm(F, A.p(-2.2, -6.0), '#2a6aa8')


DRAW_W = {'faca': w_faca, 'taco': w_taco, 'facao': w_facao, 'machado': w_machado,
          'pistola': w_pistola, 'espingarda': w_espingarda, 'rifle': w_rifle}


# ---------------------------------------------------------------- efeitos das armas

WHITE = hexc('#fff6e8')
PINK = hexc('#ffb4a0')


def _tip(P, wid, t_from=None):
    a = math.radians(wangle(P, wid))
    L = WEAP[wid]['tip']
    h = P['ha_f']
    return h, a, L


def trail_arc(F, P, wid, Q, k=1.0):
    """rastro em arco entre a pose Q (quadro anterior) e P."""
    W = WEAP[wid]
    L = W['tip']
    a0, a1 = wangle(Q, wid), wangle(P, wid)
    h0, h1 = Q['ha_f'], P['ha_f']
    tmp = np.zeros((S, S, 4), np.uint8)
    N = 48
    for j in range(N + 1):
        t = j / N * .9
        f = (j / N) ** 1.3
        h = L2(h0, h1, t)
        a = math.radians(lerp(a0, a1, t))
        ca, sa = math.cos(a), math.sin(a)
        Lr = L
        if ca > .05:
            Lr = min(Lr, (125 - h[0]) / ca)          # não sai pela borda direita do quadro
        th = (3 + W.get('wtr', 2) * 2.2) * f + .5
        r = Lr + .5
        while r >= Lr - th:
            q = (r - (Lr - th)) / max(th, 1e-6)        # 1 = borda de fora
            x, y = int(round(h[0] + ca * r)), int(round(h[1] + sa * r))
            al = int(255 * k * f * (.35 + .65 * q))
            if 0 <= x < S and 0 <= y < S and al > tmp[y, x, 3]:
                tmp[y, x, :3] = mix(PINK, WHITE, q)
                tmp[y, x, 3] = al
            r -= .5
    fx_over(F, tmp)


def trail_thrust(F, P, wid, Q, k=1.0):
    """rastro reto de estocada (3 traços) da ponta em Q até a ponta em P."""
    W = WEAP[wid]
    L = W['tip']
    tmp = np.zeros((S, S, 4), np.uint8)
    hq, aq = Q['ha_f'], math.radians(wangle(Q, wid))
    hp, ap = P['ha_f'], math.radians(wangle(P, wid))
    tq = (hq[0] + math.cos(aq) * L, hq[1] + math.sin(aq) * L)
    tp = (hp[0] + math.cos(ap) * (L - 3), hp[1] + math.sin(ap) * (L - 3))
    dx, dy = tp[0] - tq[0], tp[1] - tq[1]
    d = math.hypot(dx, dy) or 1
    nx, ny = -dy / d, dx / d
    for off, t0, w in ((0, .1, 1.0), (-2.5, .4, .7), (2.5, .35, .7)):
        n = int(d) + 1
        for s in range(n + 1):
            t = s / n
            if t < t0:
                continue
            f = ((t - t0) / (1 - t0)) ** 1.2
            x = int(round(tq[0] + dx * t + nx * off))
            y = int(round(tq[1] + dy * t + ny * off))
            al = int(255 * k * w * f)
            if 0 <= x < S and 0 <= y < S and al > tmp[y, x, 3]:
                tmp[y, x, :3] = mix(PINK, WHITE, f)
                tmp[y, x, 3] = al
    fx_over(F, tmp)


def glint(F, p, r=3):
    x, y = int(round(p[0])), int(round(p[1]))
    for d in range(-r, r + 1):
        a = 255 if abs(d) < 2 else 150
        F.px(x + d, y, '#fff6e8', F.fx, a); F.px(x, y + d, '#fff6e8', F.fx, a)
    F.px(x, y, '#ffffff', F.fx)


def muzzle_flash(F, M, ang, L, w):
    A = Ax(M, ang)
    body = A.poly((-1, 0), (L * .3, -w), (L * .55, -w * .35), (L, 0), (L * .55, w * .35), (L * .3, w))
    spikes = A.poly((L * .1, -w * .4), (L * .25, -w * 1.9), (L * .35, -w * .5)) + A.poly((L * .1, w * .4), (L * .25, w * 1.9), (L * .35, w * .5))
    F.part(body + spikes, '#ffd24a', shade=False, ol='#e0601a', layer=F.fx)
    F.part(A.poly((0, 0), (L * .3, -w * .55), (L * .7, 0), (L * .3, w * .55)), '#fff6c0', shade=False, outline=False, layer=F.fx)
    F.flat(A.ell(L * .2, 0, L * .14 + .6, w * .3 + .4), '#ffffff', layer=F.fx)


def smoke(F, M, ang, stage, big=1.0):
    A = Ax(M, ang)
    if stage == 1:
        pts = [(3, -1, 2.4), (6, -2.5, 2.0), (1.5, -3, 1.6)]
        al = 190
    else:
        pts = [(6, -5, 2.8), (9, -6.5, 2.2), (3.5, -7, 1.8)]
        al = 110
    sh = []
    for u, v, r in pts:
        p = A.p(u * big, 0)
        sh += ell(p[0], p[1] + v * big, r * big, r * big * .85)
    fx_shape(F, sh, '#c8c2d0', al, ol='#5a5468', shade=True, light=.3)


def casing(F, p, ang, shell=False):
    A = Ax(p, ang)
    if shell:
        F.part(A.rect(-2.2, -1.1, 1.4, 1.1), '#c0262d', shade=False, ol='#3a0e0e', layer=F.fx)
        F.part(A.rect(1.4, -1.1, 2.4, 1.1), '#e3b23c', shade=False, ol='#5a3a08', layer=F.fx)
    else:
        F.part(A.rect(-1.4, -0.6, 1.4, 0.6), '#e3b23c', shade=False, ol='#5a3a08', layer=F.fx)
        F.px(p[0], p[1], '#fff0b0', F.fx)


def weapon_layer(wid):
    W = WEAP[wid]

    def fn(F, P):
        row, i = P['row'], P['i']
        ang = wangle(P, wid)
        st = {}
        h = P['ha_f']
        gun = W['kind'] in ('pistol', 'gun')
        if row == 'attack_fire' and gun:
            if i == 2:
                if W['kind'] == 'pistol':
                    st['slide'] = -2
                else:
                    h = Ax(h, ang).p(-1.5, 0)
            if wid == 'espingarda':
                st['pump'] = {4: -4, 5: -1.5}.get(i, 0)
        A = Ax(h, ang)
        DRAW_W[wid](F, A, st)
        if row == 'attack' and i in (0, 1):
            # preparação: arma passa por trás da cabeça
            F.a[F.mask(head_shapes(P, grow=3))] = 0
        # ---- efeitos
        if row == 'attack' and i in (2, 3, 4):
            trail_arc(F, P, wid, pose(row, {2: 1, 3: 1, 4: 3}[i], P['body']), k=(1.0 if i < 4 else .45))
        elif row == 'attack_knife' and i in (2, 3):
            Q = pose(row, 1, P['body'])
            trail_thrust(F, P, wid, Q, k=(1.0 if i == 2 else .55))
            if i == 3:
                glint(F, A.p(W['tip'] - 2, -1), 3)
        elif row == 'attack_fire' and gun:
            M = A.p(*W['muzzle'])
            if i == 2:
                muzzle_flash(F, M, ang, *W['flash'])
            elif i in (3, 4):
                smoke(F, M, ang, i - 2, big=(1.3 if wid == 'espingarda' else 1.0))
            port = A.p(*W['port'])
            if wid != 'espingarda':
                if i == 3:
                    casing(F, (port[0] - 3, port[1] - 7), 60)
                elif i == 4:
                    casing(F, (port[0] - 8, port[1] - 3), 150)
            else:
                if i == 4:
                    casing(F, (port[0] - 2, port[1] - 7), -30, shell=True)
                elif i == 5:
                    casing(F, (port[0] - 8, port[1] - 1), 70, shell=True)
    return fn


# ================================================================ ARMADURAS (camada jacket)

def torso_lo(P):
    return Lo(P['neck'], P['lean'])


def armor_colete(F, P):
    c = '#8f7f4c'
    m = F.part(torso_shapes(P, grow=3), c, tex=.06, light=.25)
    nx, ny = P['neck']
    pv = P['pelvis']
    Q = torso_lo(P)
    strip = F.mask(poly((nx - 3, ny - 8), (nx + 10, ny - 8), (nx + 8, ny + 2), (pv[0] + 7, pv[1] + 6), (pv[0] + 3, pv[1] + 6), (nx - 1, ny + 2)))
    cut(F, strip & m, edge=ink(c, .3))
    m = F.a[..., 3] > 0
    # zíper nas duas bordas
    dots(F, (nx - 1, ny + 3), (pv[0] + 2, pv[1] + 1), '#c8b878', 2, m)
    dots(F, (nx + 9, ny + 3), (pv[0] + 8, pv[1] + 1), '#c8b878', 2, m)
    # bolsos de peito (painel da frente)
    for (x0, y0) in ((11, 7),):
        sh = Q.rect(x0, y0, x0 + 6, y0 + 7)
        mp = F.part(sh, '#a2925a', light=.2, ol=ink(c, .4), clip=m)
        F.part(Q.rect(x0 - .5, y0 - .5, x0 + 6.5, y0 + 2), '#7a6c3e', shade=False, ol=ink(c, .4), clip=m)
        pxm(F, Q.p(x0 + 3, y0 + 1.5), '#d8c890', m)
        dots(F, Q.p(x0 + 1, y0 + 6), Q.p(x0 + 5, y0 + 6), '#d8c890', 2, mp)
    # bolso grande no painel de trás + bolso de baixo da frente
    for (x0, y0, w, h) in ((-12, 12, 7, 8), (11, 18, 6, 6)):
        mp = F.part(Q.rect(x0, y0, x0 + w, y0 + h), '#a2925a', light=.2, ol=ink(c, .4), clip=m)
        F.part(Q.rect(x0 - .5, y0 - .5, x0 + w + .5, y0 + 2), '#7a6c3e', shade=False, ol=ink(c, .4), clip=m)
        dots(F, Q.p(x0 + 1, y0 + h - 1), Q.p(x0 + w - 1, y0 + h - 1), '#d8c890', 2, mp)
    # argola + costura da barra
    pxm(F, Q.p(-8, 3), '#d8dce4', m); pxm(F, Q.p(-7, 3), '#8a8e98', m)
    hb, hf = P['hip_b'], P['hip_f']
    dots(F, (hb[0] - 6, hb[1] + 2), (hf[0] + 6, hf[1] + 2), '#c8b878', 2, m, 1)


def armor_tatica(F, P):
    c = '#3e4a2e'
    Q = torso_lo(P)
    # ombreira no braço de trás
    sb, eb = P['sh_b'], P['el_b']
    e2 = L2(sb, eb, .45)
    mpad = F.part(limb(sb[0], sb[1] + 1, e2[0], e2[1], 11, 10), '#46523a', light=.25)
    lin(F, L2(sb, eb, .2), (L2(sb, eb, .2)[0] - 3, L2(sb, eb, .2)[1] + 1), '#2a3220', mpad)
    m = F.part(torso_shapes(P, grow=3), c, tex=.05, light=.22)
    # placa frontal
    mp = F.part(Q.poly((-11, 4), (17, 4), (18, 8), (17, 27), (-11, 27), (-12, 8)), '#4a5838', light=.2, ol='#1e2616', clip=m)
    # MOLLE
    for y in (8, 11, 14):
        dots(F, Q.p(-9, y), Q.p(16, y), '#26301c', 1, mp)
        for x in range(-8, 16, 4):
            pxm(F, Q.p(x, y + 1), '#5e6c48', mp)
    # porta-carregadores
    for x0 in (-6, -1, 4, 9):
        mm = F.part(Q.rect(x0, 17, x0 + 4.5, 25), '#56643f', light=.25, ol='#1e2616', clip=m)
        F.part(Q.rect(x0, 16.5, x0 + 4.5, 19), '#36402a', shade=False, ol='#1e2616', clip=m)
        pxm(F, Q.p(x0 + 2.2, 18), '#8a9670', m)
    # alças dos ombros + gola
    F.part(Q.poly((-15, -3), (-8, -4), (-6, 4), (-12, 5)), '#323c26', light=.25, clip=m)
    F.part(Q.poly((12, -4), (19, -3), (17, 5), (12, 4)), '#323c26', light=.25, clip=m)
    F.part(Q.poly((-6, -3), (9, -3), (8, 0.5), (-5, 0.5)), '#2a3220', light=.3)
    # emblema lua de sangue
    F.part(Q.ell(4, 6, 2.6, 2.6), '#c0262d', shade=False, ol='#1a0a0a')
    F.flat(Q.ell(5.2, 5.2, 1.7, 1.7), '#4a5838')
    pxm(F, Q.p(3, 7), '#ff6a5a')
    # faixa lateral (cummerbund)
    mc = F.part(Q.poly((-17, 14), (-11, 14), (-11, 27), (-17, 28)), '#36402a', light=.2, clip=m)
    for y in (17, 20, 23):
        dots(F, Q.p(-16, y), Q.p(-12, y), '#26301c', 1, mc)


# ================================================================ MOCHILAS (camada bag)

BAGS = {
    'mochila_p': dict(nome='Mochila pequena', c='#2f5d8a', w=12, h=16, top=-8, strap=2.4),
    'mochila_m': dict(nome='Mochila média', c='#5a6b3a', w=14, h=22, top=-11, strap=3.0),
    'mochila_g': dict(nome='Mochila grande', c='#a8562a', w=16, h=28, top=-17, strap=3.4),
}


def body_clip(P):
    T = Frame()
    sh = torso_shapes(P, grow=2) + pelvis_shapes(P, grow=1) + upper_arm(P, 'b', grow=2) + fore_arm(P, 'b', grow=2) \
        + hand_shapes(P, 'b', r=5) + head_shapes(P, grow=1) + ear_shapes(P) + neck_shapes(P)
    return T.mask(sh)


def bag_layer(bid):
    B = BAGS[bid]

    def fn(F, P):
        c = B['c']
        w, h, top = B['w'], B['h'], B['top']
        L = Lo(P['sh_b'], P['lean'])
        T = Frame()
        x0, x1 = -w - 1, 1
        y0, y1 = top, top + h
        if bid == 'mochila_g':
            # frigideira pendurada atrás
            T.part(L.poly((x0 - 1, y0 + 14), (x0 - 4, y0 + 18), (x0 - 3, y0 + 19), (x0 + 0, y0 + 15)), '#3a3a40')
            T.part(L.ell(x0 - 6, y0 + 22, 4.2, 3.4), '#2e2e34', light=.35)
            T.flat(L.ell(x0 - 6, y0 + 22, 2.4, 1.8), '#1a1a20')
        if bid == 'mochila_m':
            # garrafinha lateral
            T.part(L.rect(x0 - 3, y0 + 9, x0 + 1, y0 + 18), '#5ab0e8', light=.45, ol='#1a3a5a')
            T.part(L.rect(x0 - 2.5, y0 + 7, x0 + 0.5, y0 + 9), '#e8e8f0', ol='#3a3a48')
        mb = T.part(L.poly((x0 + 2, y0), (x1 - 2, y0), (x1, y0 + 3), (x1, y1 - 2), (x1 - 2, y1), (x0 + 2, y1), (x0, y1 - 2), (x0, y0 + 3)),
                    c, tex=.08, light=.28)
        cd = ink(c, .35)
        # bolso frontal (lado de fora = esquerda) com zíper
        pk = T.part(L.poly((x0 - 1, y0 + h * .45), (x0 + w * .55, y0 + h * .45), (x0 + w * .55, y1 - 1), (x0, y1 - 1)), lt(c, .1), light=.2, ol=cd)
        dots(T, L.p(x0 + 0, y0 + h * .45 + 1), L.p(x0 + w * .55 - 1, y0 + h * .45 + 1), '#d8d8d8', 2, pk)
        lin(T, L.p(x0 + 1, y0 + 3), L.p(x1 - 2, y0 + 3), cd, mb)            # costura da tampa
        if bid in ('mochila_m', 'mochila_g'):
            # aba de cima com fivela
            T.part(L.poly((x0 - .5, y0 - 1), (x1 - 1, y0 - 1), (x1 - 1, y0 + 6), (x0 + 3, y0 + 7), (x0 - .5, y0 + 5)), dk(c, .12), light=.3, ol=cd)
            T.part(L.rect(x0 + 2, y0 + 5, x0 + 4.5, y0 + 8), '#c8ccd4', light=.5, ol='#3a3a48')
        if bid == 'mochila_g':
            # saco de dormir enrolado em cima
            sr = T.part(L.ell(x0 + w / 2 + 1, y0 - 3.5, w / 2 + 3, 3.6), '#8a2a2a', light=.3)
            for k in range(-6, 8, 3):
                lin(T, L.p(x0 + w / 2 + 1 + k, y0 - 7), L.p(x0 + w / 2 + 1 + k + 1, y0), '#d8c8a8', sr)
            lin(T, L.p(x0 + 3, y0 - 7), L.p(x0 + 3, y0), '#2a1a10', sr)
            lin(T, L.p(x1 - 2, y0 - 7), L.p(x1 - 2, y0), '#2a1a10', sr)
            lin(T, L.p(x0 + 1, y0 + h * .3), L.p(x0 + w * .5, y0 + h * .3), cd, mb)
        # recorte: fica atrás do tronco, do braço de trás e da cabeça
        clip = body_clip(P)
        cut(T, clip, edge=ink(c, .6))
        F.a[:] = over(F.a, T.a)
        # alças na frente do tronco
        Qn = torso_lo(P)
        sw = B['strap']
        sc = dk(c, .35)
        F.part(chain([Qn.p(-8, -3), Qn.p(-8.5, 5), Qn.p(-7, 17)], sw), sc, light=.3)
        F.part(chain([Qn.p(11, -4), Qn.p(12.5, 4), Qn.p(10.5, 17)], sw), sc, light=.3)
        # pontas de ajuste
        F.part(chain([Qn.p(10.5, 17), Qn.p(10, 21)], 1.6), '#26262c', shade=False)
        if bid in ('mochila_m', 'mochila_g'):
            F.part(Qn.rect(-8, 9, 11, 10.6), sc, shade=False)
            F.part(Qn.rect(1, 8.4, 3.6, 11.2), '#c8ccd4', light=.4, ol='#2a2a30')
        if bid == 'mochila_g':
            pv = P['pelvis']
            yb = pv[1] - P['neck'][1] - 3
            F.part(Qn.poly((-14, yb - 1.5), (17, yb - 2), (17, yb + 1.5), (-14, yb + 2)), sc, light=.25)
            F.part(Qn.rect(1, yb - 2.5, 5, yb + 2.5), '#c8ccd4', light=.4, ol='#2a2a30')
    return fn


# ================================================================ CABEÇA (camada head)

def H(P):
    cx, cy = P['head']
    return Lo((cx, cy), P['hrot'])


def dome(Hl, cx, cy, rx, ry, back_drop=0, front_drop=0, n=20):
    """meia-elipse de cima (crânio), com base de trás/frente rebaixáveis."""
    pts = [Hl.p(cx - rx, cy + back_drop)]
    for k in range(n + 1):
        a = math.pi + math.pi * k / n
        pts.append(Hl.p(cx + rx * math.cos(a), cy + ry * math.sin(a)))
    pts.append(Hl.p(cx + rx, cy + front_drop))
    return [pts]


def head_bone(F, P):
    Hl = H(P)
    c = '#2856a8'
    m = F.part(dome(Hl, -1, -6, 17, 15, back_drop=4, front_drop=0), c, light=.3, tex=.05)
    # costuras e botão
    for (x, y) in ((-10, -5), (9, -7), (-2, -5)):
        lin(F, Hl.p(0, -20), Hl.p(x, y), ink(c, .25), m)
    F.part(Hl.ell(0, -20.5, 1.6, 1.2), lt(c, .25), shade=False)
    # painel da frente com logo lua
    F.part(Hl.ell(9, -12, 2.8, 2.8), '#f2c230', shade=False, ol='#5a3a08', clip=m)
    F.flat(Hl.ell(10.3, -12.8, 2.1, 2.1), c, clip=m)
    pxm(F, Hl.p(7.5, -12.5), '#fff0a0', m)
    # ajuste de trás
    F.part(Hl.rect(-17, -6.5, -14.5, -3.5), '#dcdcdc', shade=False, ol='#2a2a30')
    # aba
    F.part(Hl.poly((7, -7.5), (19, -7.2), (26, -5.6), (26.5, -3.8), (23, -2.6), (8, -3.5)), '#1e3f7e', light=.35)
    lin(F, Hl.p(10, -3.2), Hl.p(23, -2.8), '#13284e')
    dots(F, Hl.p(10, -6), Hl.p(23, -4.8), '#5a86d0', 2)


def head_palha(F, P):
    Hl = H(P)
    straw, li, dkc = hexc('#e2c071'), hexc('#f4dc9a'), hexc('#b08a3e')

    def weave(x, y, c):
        if (x + y) % 4 == 0:
            return mix(c, dkc, .6)
        if (x - y) % 4 == 0:
            return mix(c, li, .5)
        return None

    mb = F.part(Hl.ell(1, -9, 25, 4.8, n=40), '#e2c071', light=.3, ol='#5a4018')
    pattern(F, mb, weave)
    # fiapos na borda
    for k, (x, y) in enumerate(((-24, -8), (-18, -5), (-6, -4), (8, -4), (19, -5), (25, -9), (-12, -13), (14, -13))):
        pxm(F, Hl.p(x, y + (1 if k % 2 else 0)), '#c8a050')
    crown = Hl.poly((-12, -9), (-12.5, -18), (-9, -24), (-2, -25), (0, -23.5), (2, -25), (9, -24), (12.5, -18), (12, -9))
    mc = F.part(crown, '#e2c071', light=.3, ol='#5a4018')
    pattern(F, mc, weave)
    F.part(Hl.poly((-12.2, -13.5), (12.2, -13.5), (12.1, -10), (-12.1, -10)), '#7a2a1a', light=.3, ol='#2a0a06')
    lin(F, Hl.p(-11, -12.5), Hl.p(11, -12.5), '#a8442a')
    # sombra da aba na copa (frente)
    lin(F, Hl.p(-22, -7), Hl.p(22, -7), mix(straw, dkc, .5), mb)


def head_chapeu_couro(F, P):
    Hl = H(P)
    c = '#7a4a24'
    # copa atrás da meia-lua
    F.part(dome(Hl, 0, -12, 11.5, 14), '#5e381a', light=.3)
    # meia-lua: elipse grande de baixo menos elipse de cima
    T = Frame()
    outer = Hl.ell(0, -21, 22, 16, n=40)
    T.part(outer, c, light=.3, tex=.05)
    inner = T.mask(Hl.ell(0, -25.5, 17.5, 13.5, n=40)) | T.mask(Hl.rect(-30, -60, 30, -21))
    cut(T, inner, edge=ink(c, .55))
    m = T.a[..., 3] > 0
    F.a[:] = over(F.a, T.a)
    # couro mais claro no meio + costura
    for k in range(0, 41):
        a = math.pi * (.08 + .84 * k / 40)
        p = Hl.p(19.5 * math.cos(a), -21 + 14 * math.sin(a))
        if k % 2 == 0:
            pxm(F, p, '#e8c890', m)
    for k in range(0, 13):
        a = math.pi * (.15 + .7 * k / 12)
        p = Hl.p(16.5 * math.cos(a), -21 + 11.2 * math.sin(a))
        if k % 3 == 0 and abs(k - 6) > 1:
            pxm(F, p, '#e8b830', m)
            pxm(F, (p[0] + 1, p[1]), '#fff0a0', m)
    # estrela
    pts = []
    sx, sy = Hl.p(0.5, -9)
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5 + math.radians(P['hrot'])
        rr = 3.6 if k % 2 == 0 else 1.6
        pts.append((sx + rr * math.cos(a), sy + rr * math.sin(a)))
    F.part([pts], '#e8b830', shade=False, ol='#4a2a08')
    pxm(F, (sx - 1, sy - 1), '#fff0a0')
    # barbicacho
    lin(F, Hl.p(-9, -6), Hl.p(-5, 15), '#3a200e')
    pxm(F, Hl.p(-5, 15), '#e8b830')


def head_capacete(F, P):
    Hl = H(P)
    c = '#b8262c'
    T = Frame()
    shell = Hl.ell(-1, -3, 18, 17.5, n=36)
    T.part(shell, c, light=.32)
    win = T.mask(Hl.poly((1, -6), (24, -8), (24, 24), (-2, 24), (-3, 8), (-1, 0)))
    low = T.mask(Hl.poly((-30, 12), (30, 12), (30, 40), (-30, 40)))
    cut(T, low, edge=ink(c, .5))
    had = T.a[..., 3] > 0
    T.a[win] = 0
    rim = had & ~win & dilate(dilate(win)) & (T.a[..., 3] > 0)
    T.a[rim, :3] = hexc('#22222a')
    m = T.a[..., 3] > 0
    F.a[:] = over(F.a, T.a)
    # faixa branca no topo
    F.part(chain([Hl.p(14, -13), Hl.p(6, -19.5), Hl.p(-5, -20.5), Hl.p(-15, -12)], 3.2), '#f4efe6', shade=False, outline=False, clip=m)
    # viseira fumê levantada
    F.part(Hl.poly((-1, -16), (11, -15.5), (19, -10), (18, -7.5), (2, -10.5)), '#34424e', light=.5, ol='#101418')
    lin(F, Hl.p(3, -13.5), Hl.p(14, -12.5), '#a8c8e8')
    F.part(Hl.ell(-1, -12, 1.6, 1.6), '#8a8e98', shade=False, ol='#202228')
    # brilho especular
    for (x, y) in ((-10, -14), (-9, -15), (-11, -12), (-8, -16)):
        pxm(F, Hl.p(x, y), '#ffd8d8', m)
    pxm(F, Hl.p(-10, -15), '#ffffff', m)
    # jugular
    lin(F, Hl.p(-2, 11), Hl.p(7, 17), '#22222a')


# ================================================================ PÉS (camada shoes)

def _fc(c, s):
    return dk(c, .2) if s == 'b' else col(c)


def feet_chinelo(F, P):
    for s in ('b', 'f'):
        fx, fy = P['ft_' + DSIDE(s)]
        F.part(ell(fx + 3.5, fy - 0.2, 7.8, 1.4), _fc('#ffd23a', s), light=.35, ol=_fc('#4a3406', s))
        lin(F, (fx - 3, fy + 0.6), (fx + 10, fy + 0.6), _fc('#c89a1a', s))
        pxm(F, (fx + 9, fy - 1), _fc('#ffffff', s))
        # tiras finas em V (o pé aparece)
        g, gd = _fc('#2ec060', s), _fc('#0a4a1e', s)
        lin(F, (fx + 7, fy - 2), (fx + 4, fy - 4), g)
        lin(F, (fx + 4, fy - 4), (fx + 1, fy - 2), g)
        lin(F, (fx + 7, fy - 1), (fx + 4, fy - 3), gd)
        lin(F, (fx + 4, fy - 3), (fx + 1, fy - 1), gd)
        pxm(F, (fx + 7, fy - 1), _fc('#1f9a4a', s))


def feet_tenis(F, P):
    for s in ('b', 'f'):
        fx, fy = P['ft_' + DSIDE(s)]
        m = F.part(ell(fx + 3.6, fy - 3.4, 7.4, 4.0), _fc('#f0ece4', s), light=.25, ol=_fc('#2a2a34', s))
        ms = F.part(poly((fx - 3.6, fy - 1.2), (fx + 11.2, fy - 1.2), (fx + 10.6, fy + 0.6), (fx - 3.4, fy + 0.6)), _fc('#ffffff', s),
                    shade=False, ol=_fc('#2a2a34', s))
        lin(F, (fx - 3, fy + 0.4), (fx + 10, fy + 0.4), _fc('#9a9aa6', s), ms)
        lin(F, (fx - 3, fy - 1.4), (fx + 11, fy - 1.4), _fc('#ff6a1a', s))
        lin(F, (fx - 1, fy - 2.6), (fx + 4, fy - 3.4), _fc('#ff6a1a', s), m)
        lin(F, (fx + 4, fy - 3.4), (fx + 8, fy - 5.2), _fc('#ff6a1a', s), m)
        for y in (-5, -4, -3):
            pxm(F, (fx - 3, fy + y), _fc('#ff6a1a', s), m)
        for x in (5, 7, 9):
            pxm(F, (fx + x, fy - 6.2), _fc('#7a7a86', s), m)


def feet_bota(F, P):
    for s in ('b', 'f'):
        fx, fy = P['ft_' + DSIDE(s)]
        kn = P['kn_' + DSIDE(s)]
        ank = (fx + 1, fy - 4)
        top = L2(kn, ank, .4)
        c = '#6a3e1e'
        A = Ax(top, math.degrees(math.atan2(ank[1] - top[1], ank[0] - top[0])))
        Ld = math.hypot(ank[0] - top[0], ank[1] - top[1])
        m1 = F.part(A.rect(0, -5, Ld + 1, 5), _fc(c, s), light=.28, tex=.06)
        m2 = F.part(ell(fx + 3.6, fy - 3, 7.4, 3.8), _fc(c, s), light=.28)
        lin(F, A.p(1, 3.5), A.p(Ld, 3.5), _fc('#4a2a12', s), m1)               # costura lateral
        # dobra do cano (faixa)
        F.part(A.rect(-0.5, -5.6, 2.2, 5.6), _fc('#8e5c30', s), light=.35)
        # sola e salto
        F.part(poly((fx - 4.5, fy - 1.4), (fx + 11.5, fy - 1.4), (fx + 11, fy + 0.8), (fx - 4.5, fy + 0.8)), _fc('#1e1612', s), light=.2)
        F.part(poly((fx - 4.5, fy - 1), (fx, fy - 1), (fx - .5, fy + 1.4), (fx - 4.5, fy + 1.4)), _fc('#2a1e18', s), light=.2)
        dots(F, (fx - 3, fy - 2.6), (fx + 10, fy - 2.6), _fc('#d8b890', s), 2, m2 | m1)
        # ganchos do cadarço na frente do cano
        for t in (.35, .6, .85):
            p = A.p(Ld * t, -4)
            pxm(F, p, _fc('#c8ccd4', s))


# ================================================================ ACESSÓRIOS (camada acc)

def acc_oculos(F, P):
    Hl = H(P)
    gold = '#c8a040'
    lin(F, Hl.p(-4, 0.5), Hl.p(-12, 2), '#8a6a20')                       # haste
    for (x0, x1) in ((-4.5, 2.5), (6.5, 12)):
        F.part(Hl.poly((x0, -1), (x1, -1), (x1, 2.5), (x1 - 1, 4.5), (x0 + 1, 4.5), (x0, 2.5)), '#16161e', shade=False, ol=gold)
        lin(F, Hl.p(x0 + 1, 2.5), Hl.p(x0 + 2.5, 0.5), '#6a8ab0')
        pxm(F, Hl.p(x0 + 3, 0), '#a8c8e8')
    lin(F, Hl.p(3.5, 0), Hl.p(5.5, 0), gold)                             # ponte


def acc_cordao(F, P):
    Q = torso_lo(P)
    pts = []
    for k in range(13):
        t = k / 12
        x = lerp(-5.5, 9.5, t)
        y = -1 + 10 * (1 - (2 * t - 1) ** 2)
        pts.append(Q.p(x, y))
    m = F.part(chain(pts, 2.0), '#f2c230', light=.45, ol='#4a2e06')
    for k, p in enumerate(pts):
        if k % 2:
            pxm(F, p, '#b8861a', m)
        else:
            pxm(F, (p[0], p[1] - .5), '#fff4c0', m)
    F.part(Q.ell(2, 11.5, 2.4, 2.4), '#f2c230', light=.5, ol='#4a2e06')
    pxm(F, Q.p(1.5, 11), '#b8861a'); pxm(F, Q.p(1.5, 12), '#b8861a'); pxm(F, Q.p(1, 10.5), '#fff4c0')


def acc_relogio(F, P):
    el, ha = P['el_b'], P['ha_b']
    w = L2(el, ha, .82)
    d = (ha[0] - el[0], ha[1] - el[1])
    n = math.hypot(*d) or 1
    A = Ax(w, math.degrees(math.atan2(d[1], d[0])))
    T = Frame()
    T.part(A.rect(-1.4, -4.6, 1.4, 4.6), '#1e1a1a', light=.3)
    T.part(A.ell(0, 0, 1.9, 2.2), '#d8dce4', light=.5, ol='#5a5e68')
    T.px(*A.p(0, 0), '#202228'); T.px(*A.p(-.9, -.6), '#202228')
    clip = T.mask(torso_shapes(P, grow=3) + pelvis_shapes(P, grow=2) + thigh(P, 'f', grow=2) + shin(P, 'f', grow=2)
                  + upper_arm(P, 'f', grow=2) + fore_arm(P, 'f', grow=2) + hand_shapes(P, 'f', r=5))
    T.a[clip] = 0
    F.a[:] = over(F.a, T.a)


def acc_anel(F, P):
    hx, hy = P['ha_f']
    F.part(poly((hx - 1.5, hy + 1), (hx + 2.5, hy + 1), (hx + 2.5, hy + 2.6), (hx - 1.5, hy + 2.6)), '#d8dce4', light=.5, ol='#3a3e48')
    pxm(F, (hx - 1, hy + 1), '#ffffff')
    pxm(F, (hx + 2, hy + 1), '#4a8ae8')


# ================================================================ catálogo

ITEMS = []   # (id, nome, camada, opcao, arquivo, corpo, fn, extra)


def _add(iid, nome, camada, opcao, arquivo, corpo, fn, **extra):
    ITEMS.append(dict(id=iid, nome=nome, camada=camada, opcao=opcao, arquivo=arquivo, corpo=corpo, fn=fn, extra=extra))


for wid, W in WEAP.items():
    _add(wid, W['nome'], 'weapon', 'weapon', 'weapon_%s.png' % wid, 'any', weapon_layer(wid), linha_ataque=W['line'])
for aid, nome, fn in (('colete', 'Colete', armor_colete), ('tatica', 'Armadura tática', armor_tatica)):
    for b in ('m', 'f'):
        _add(aid, nome, 'jacket', 'armor', 'armor_%s_%s.png' % (aid, b), b, fn)
for bid, B in BAGS.items():
    _add(bid, B['nome'], 'bag', 'bag', 'bag_%s.png' % bid, 'any', bag_layer(bid))
for hid, nome, fn in (('bone', 'Boné', head_bone), ('palha', 'Chapéu de palha', head_palha),
                      ('chapeu_couro', 'Chapéu de couro', head_chapeu_couro), ('capacete', 'Capacete de moto', head_capacete)):
    _add(hid, nome, 'head', 'head', 'head_%s.png' % hid, 'any', fn)
for fid, nome, fn in (('chinelo', 'Chinelo', feet_chinelo), ('tenis', 'Tênis de corrida', feet_tenis), ('bota', 'Bota de couro', feet_bota)):
    _add(fid, nome, 'shoes', 'feet', 'feet_%s.png' % fid, 'any', fn)
for cid, nome, fn in (('cordao', 'Cordão de ouro', acc_cordao), ('oculos', 'Óculos escuros', acc_oculos),
                      ('relogio', 'Relógio', acc_relogio), ('anel', 'Anel de prata', acc_anel)):
    _add(cid, nome, 'acc', 'acc', 'acc_%s.png' % cid, 'any', fn)

CLASSES = [
    dict(id='brigao', nome='Brigão', arma='taco', linha_ataque='attack',
         desc='Resolve na porrada: começa com o taco cheio de prego e golpeia de cima para baixo.'),
    dict(id='atirador', nome='Atirador', arma='pistola', linha_ataque='attack_fire',
         desc='Mira firme e dedo leve: começa com a pistola e acerta de longe.'),
    dict(id='sobrevivente', nome='Sobrevivente', arma='faca', linha_ataque='attack_knife',
         desc='Rápido e silencioso: começa com a faca e ataca com estocadas curtas.'),
]
SKINS = [
    dict(id='neon', nome='Neon', pal=dict(shirt='#39ff88', pants='#1a1a2e', hair='#00e5ff')),
    dict(id='toxica', nome='Tóxica', pal=dict(shirt='#a6e22e', pants='#3d3d1a', hair='#c8ff00')),
    dict(id='lua_rubra', nome='Lua Rubra', pal=dict(shirt='#8b0000', pants='#1a0505', hair='#ff4d4d')),
    dict(id='canarinho', nome='Canarinho', pal=dict(shirt='#ffd800', pants='#1e4fbf', hair='#2a1a0a')),
    dict(id='foliao', nome='Folião', pal=dict(shirt='#ff3db8', pants='#7a2ff0', hair='#ffd800')),
    dict(id='matuto', nome='Matuto', pal=dict(shirt='#c84b2a', pants='#3a5a8a', hair='#5b3a24')),
]


# ================================================================ render

def comp(F, P):
    """tinta de dano + giro do desmaio (rotate_fit, igual a todas as camadas), sem sombra."""
    if P.get('rotate'):
        F.a = rotate_fit(F.a, P['rotate'])
        F.fx = rotate_fit(F.fx, P['rotate'])
    return compose(F, tint=P['tint'])


def frame_of(fn, row, i, body='m'):
    P = pose(row, i, body)
    F = Frame()
    fn(F, P)
    return comp(F, P)


def make_sheet(fn, body='m'):
    out = np.zeros((S * len(HROWS), S * 8, 4), np.uint8)
    for r, row in enumerate(HROWS):
        for i in range(HNFR[row]):
            out[r * S:(r + 1) * S, i * S:(i + 1) * S] = frame_of(fn, row, i, body)
    return Image.fromarray(out, 'RGBA')


BASE_LOOK = dict(body='m', skin='#c98d5e', hair_color='#1d1410', shirt='#c0262d', pants='#2b3a5a', jacket=None, shoes='#2a1c16')


def full_frame(row, i, look, items=(), skip_fx=()):
    """quadro completo: base humano + itens nas suas camadas (para conferir a ordem de pintura)."""
    P = pose(row, i, look.get('body', 'm'))
    D = dict(DEFAULT_DRAW)
    extra = {}
    for it in items:
        if it['camada'] in ('shoes', 'jacket'):
            D[it['camada']] = None
        extra.setdefault(it['camada'], []).append(it['fn'])
    k = min(1.0, abs(P['rotate'][0]) / 90.0) if P.get('rotate') else 0
    img = shadow_layer(64 - 8 * k, 17 + 16 * k)
    for name in LAYERS:
        fns = []
        if D.get(name):
            fns.append(lambda F, P, f=D[name]: f(F, P, look))
        fns += extra.get(name, [])
        for f in fns:
            F = Frame()
            f(F, P)
            img = over(img, comp(F, P))
    F = Frame()
    P2 = dict(P)
    P2['fx'] = [e for e in P['fx'] if e[0] not in skip_fx]
    pose_fx(F, P2)
    img = over(img, F.fx)
    return img


def scale(a, k):
    return np.repeat(np.repeat(a, k, 0), k, 1)


def preview(path, k=2):
    BG = np.array([46, 38, 58, 255], np.uint8)
    cells = []
    for it in ITEMS:
        look = dict(BASE_LOOK, body=it['corpo'] if it['corpo'] in ('m', 'f') else 'm')
        cells.append((it['nome'] + (' ' + it['corpo'] if it['corpo'] != 'any' else ''), full_frame('idle', 0, look, [it])))
    for it in ITEMS:
        if it['camada'] != 'weapon':
            continue
        line = it['extra']['linha_ataque']
        fi = {'attack': 3, 'attack_fire': 2, 'attack_knife': 3}[line]
        cells.append((it['nome'] + ' golpe', full_frame(line, fi, BASE_LOOK, [it], skip_fx=('flash', 'shell'))))
    cols = 8
    rows = (len(cells) + cols - 1) // cols
    out = np.zeros((rows * S * k, cols * S * k, 4), np.uint8)
    out[:] = BG
    for n, (_, im) in enumerate(cells):
        r, c = divmod(n, cols)
        tile = np.zeros((S, S, 4), np.uint8)
        tile[:] = BG
        tile = over(tile, im)
        if (r + c) % 2:
            pass
        out[r * S * k:(r + 1) * S * k, c * S * k:(c + 1) * S * k] = scale(tile, k)
    Image.fromarray(out, 'RGBA').save(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    man = dict(grupo='equip', itens=[], classes=CLASSES, skins=SKINS)
    for it in ITEMS:
        im = make_sheet(it['fn'], it['corpo'] if it['corpo'] in ('m', 'f') else 'm')
        assert im.size == (1024, 1024)
        im.save(os.path.join(OUT, it['arquivo']))
        e = dict(id=it['id'], nome=it['nome'], camada=it['camada'], arquivo='heroi/' + it['arquivo'], tint=False,
                 corpo=it['corpo'], opcao=it['opcao'])
        e.update(it['extra'])
        man['itens'].append(e)
    with open(os.path.join(OUT, 'equip.json'), 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
    preview(os.path.join(OUT, 'preview_equip.png'))
    print('ok', len(ITEMS), 'folhas')


if __name__ == '__main__':
    main()
