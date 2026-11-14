"""Grupo baus — Baús, chaves e puzzles (ordem 4).

Gera em ../sprites/:
  bau_madeira.png, bau_ferro.png, bau_lua.png   (128x128, 11 quadros)
  bau_chaves.png (64x64, 7), bau_gazua.png (64x64, 2), bau_puzzle.png (64x64, grade 8 col),
  bau_loot.png (64x64, grade 6 col), bau_respawn.png (128x192, grade 6 col x 3 linhas)
Rodar da pasta tools:  python obj_baus.py
"""
import math
import os
import random
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, chain, rp, hexc, mix, NIGHT, MOON, INK, shadow_layer, over,
                    glow, strip, grid, puff, sparkle, star, arcs, dust, impact, text)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')


# ================================================================ cores

def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def dk(c, t=.3):
    return np.clip(mix(C(c) * (1 - t * .35), NIGHT, t), 0, 255)


def lt(c, t=.3):
    return np.clip(mix(C(c), MOON, t), 0, 255)


def lit(c, f):
    """cor da face conforme a luz (f=1 frente; >1 topo; <1 lateral/sombra)."""
    c = C(c)
    if f >= 1:
        return np.clip(mix(c, MOON, (f - 1) * .55), 0, 255)
    return np.clip(mix(c * (.55 + .45 * f), NIGHT, (1 - f) * .55), 0, 255)


def ringpart(F, outer, inner, col, **kw):
    hole = F.mask(inner)
    clip = ~hole if kw.get('clip') is None else (kw.pop('clip') & ~hole)
    kw['clip'] = clip
    return F.part(outer, col, **kw)


def fx_layer_shape(F, shapes, col, alpha, layer=None):
    """forma semi-transparente na camada fx (ou camada dada)."""
    L = F.fx if layer is None else layer
    m = F.mask(shapes)
    src = np.zeros_like(L)
    src[m, :3] = C(col)
    src[m, 3] = alpha
    L[:] = over(L, src)


# ================================================================ caneta 2D (ícones)

class Pen:
    """mapeia coordenadas locais -> tela: escala k, giro ang, achatamento sq no eixo y local."""

    def __init__(s, ox=0., oy=0., k=1., ang=0., sq=1.):
        s.ox, s.oy, s.k, s.sq = ox, oy, k, sq
        a = math.radians(ang)
        s.c, s.s = math.cos(a), math.sin(a)

    def q(s, x, y):
        x, y = x * s.k, y * s.k * s.sq
        return (s.ox + x * s.c - y * s.s, s.oy + x * s.s + y * s.c)

    def M(s, shapes):
        return [[s.q(x, y) for x, y in p] for p in shapes]

    def P(s, *pts):
        return [[s.q(x, y) for x, y in pts]]

    def R(s, x0, y0, x1, y1):
        return s.P((x0, y0), (x1, y0), (x1, y1), (x0, y1))

    def E(s, cx, cy, rx, ry, n=None, a0=0, a1=360):
        n = n or max(12, int((rx + ry) * 1.7 * s.k) + 6)
        full = (a1 - a0) >= 360
        pts = []
        for i in range(n + (0 if full else 1)):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append(s.q(cx + rx * math.cos(a), cy + ry * math.sin(a)))
        if not full:
            pts.append(s.q(cx, cy))
        return [pts]

    def L(s, x0, y0, x1, y1, w0, w1=None):
        return s.M(limb(x0, y0, x1, y1, w0, w1))

    def CH(s, pts, w0, w1=None):
        return s.M(chain(pts, w0, w1))

    def px(s, F, x, y, col, layer=None):
        X, Y = s.q(x, y)
        F.px(X, Y, col, layer)

    def line(s, F, x0, y0, x1, y1, col, layer=None):
        a, b = s.q(x0, y0), s.q(x1, y1)
        F.line(a[0], a[1], b[0], b[1], col, layer)


# ================================================================ câmera 3/4 e faces

LIGHT = np.array([-.45, -.55, .85])
LIGHT = LIGHT / np.linalg.norm(LIGHT)
VIEW = np.array([.2, -1., .55])


class Cam:
    """X direita, Y profundidade (para trás), Z para cima. Vê frente + topo + lado direito."""

    def __init__(s, ox=64., gy=108., a=.2, b=.55, deg=0., piv=None, dx=0., dy=0., sx=1., sy=1.):
        s.ox, s.gy, s.a, s.b = ox, gy, a, b
        s.deg, s.piv, s.dx, s.dy, s.sx, s.sy = deg, piv or (ox, gy), dx, dy, sx, sy

    def p(s, x, y, z):
        X = s.ox + x + s.a * y
        Y = s.gy - z - s.b * y
        px, py = s.piv
        X = px + (X - px) * s.sx
        Y = py + (Y - py) * s.sy
        if s.deg:
            X, Y = rp(X, Y, px, py, s.deg)
        return (X + s.dx, Y + s.dy)


class Face:
    def __init__(s, cam, O, U, V, w, h, n):
        s.cam, s.O, s.U, s.V, s.w, s.h = cam, np.array(O, float), np.array(U, float), np.array(V, float), w, h
        s.n = np.array(n, float)
        s.vis = float(s.n @ VIEW) > 1e-3
        d = max(0., float(s.n @ LIGHT))
        s.f = (.62 + .5 * d) / .87
        s.m = None

    def pt(s, u, v):
        P = s.O + s.U * u + s.V * v
        return s.cam.p(*P)

    def poly(s, *pts):
        return [[s.pt(u, v) for u, v in pts]]

    def rect(s, u0, v0, u1, v1):
        return s.poly((u0, v0), (u1, v0), (u1, v1), (u0, v1))

    def ell(s, cu, cv, ru, rv, n=14):
        return [[s.pt(cu + ru * math.cos(2 * math.pi * i / n), cv + rv * math.sin(2 * math.pi * i / n)) for i in range(n)]]

    def all(s):
        return s.rect(0, 0, s.w, s.h)


def rot_yz(p, hinge, deg):
    if not deg:
        return p
    t = math.radians(deg)
    y, z = p[0] - hinge[0], p[1] - hinge[1]
    return (hinge[0] + y * math.cos(t) + z * math.sin(t), hinge[1] - y * math.sin(t) + z * math.cos(t))


def prism_faces(cam, prof, W, x0=None):
    """perfil CCW em (y,z) extrudado em X de -W/2 a W/2. Devolve lista de (idx, Face) + face da tampa direita."""
    x0 = -W / 2 if x0 is None else x0
    out = []
    n = len(prof)
    for i in range(n):
        (y0, z0), (y1, z1) = prof[i], prof[(i + 1) % n]
        L = math.hypot(y1 - y0, z1 - z0)
        if L < 1e-6:
            continue
        V = (0, (y1 - y0) / L, (z1 - z0) / L)
        nrm = (0, (z1 - z0) / L, -(y1 - y0) / L)
        out.append((i, Face(cam, (x0, y0, z0), (1, 0, 0), V, W, L, nrm)))
    return out


# ================================================================ face helpers

def fpart(F, fc, shapes, col, **kw):
    kw.setdefault('clip', fc.m)
    return F.part(shapes, lit(col, fc.f), **kw)


def fflat(F, fc, shapes, col):
    return F.flat(shapes, lit(col, fc.f), clip=fc.m)


def fpx(F, fc, u, v, col):
    x, y = fc.pt(u, v)
    x, y = int(round(x)), int(round(y))
    if 0 <= x < F.w and 0 <= y < F.h and fc.m[y, x]:
        F.a[y, x, :3] = lit(col, fc.f)
        F.a[y, x, 3] = 255


def fline(F, fc, u0, v0, u1, v1, col):
    a, b = fc.pt(u0, v0), fc.pt(u1, v1)
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        fpx(F, fc, u0 + (u1 - u0) * t, v0 + (v1 - v0) * t, col)


def rivet(F, fc, u, v, c='#c9c3b0'):
    fpx(F, fc, u, v, lt(c, .35))
    fpx(F, fc, u + 1, v, c)
    fpx(F, fc, u, v + 1, dk(c, .2))
    fpx(F, fc, u + 1, v + 1, dk(c, .55))


# ================================================================ baús — materiais

W, D, HB = 72, 26, 28

KIND = {
    'madeira': dict(
        lid=[(0, 0), (D, 0), (D, 8)] + [(D * (1 - t / 6), 8 + 9 * math.sin(math.pi * t / 6)) for t in range(1, 6)] + [(0, 8)],
        body='#8b5e34', lidc='#9a6a3c', inner='#4a3020', key='bronze', light='#ffe7a0', ray='#fff0a8'),
    'ferro': dict(lid=[(0, 0), (D, 0), (D, 10), (1.5, 10), (0, 8.5)],
                  body='#4f5b3a', lidc='#55623e', inner='#2e332e', key='prata', light='#d8ecff', ray='#9fd0ff'),
    'lua': dict(lid=[(0, 0), (D, 0), (D, 8), (D - 5, 13), (5, 13), (0, 8)],
                body='#2e2836', lidc='#3c3446', inner='#3a0e18', key='ouro', light='#ffb0a0', ray='#ff5a5a'),
}

# madeira
WD = ['#9a6a3c', '#8b5e34', '#94653a', '#86592f']
WDK = '#5a3a22'
STRAP = '#5d5f63'
RUST = '#8a4e2e'
NAIL = '#c9c3b0'
BRONZE, BRONZE_L = '#b87333', '#e0a85a'
# ferro
OLIVE, OLIVE_L, STEEL, STEEL_L, SILVER, SILVER_L = '#4f5b3a', '#65734a', '#6b747a', '#8d969c', '#c9ced4', '#f2f5f7'
# lua
ST1, ST2, SLATE, VEIN, GOLD, GOLD_D, RUNE, RUNE_L = '#2e2836', '#3c3446', '#1c1822', '#4a3e58', '#f2c230', '#b8861a', '#c8323a', '#ff5a5a'

RUNES = [  # glifos 3x5
    ["010", "111", "010", "010", "010"], ["101", "010", "101", "010", "101"], ["110", "101", "110", "100", "100"],
    ["111", "001", "011", "001", "111"], ["100", "110", "101", "110", "100"], ["010", "101", "101", "010", "111"],
]

DIG = {  # dígitos 5x7 desenhados à mão
    '0': ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    '1': ["00100", "01100", "10100", "00100", "00100", "00100", "11111"],
    '2': ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    '3': ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    '4': ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    '5': ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    '6': ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    '7': ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
}


def deco_wood_planks(F, fc, n, rng, tones=WD, horiz=True):
    ph = fc.h / n
    for i in range(n):
        fflat(F, fc, fc.rect(0, i * ph, fc.w, (i + 1) * ph), tones[i % len(tones)])
    for i in range(n):
        for _ in range(int(fc.w / 9)):
            u = rng.uniform(1, fc.w - 6)
            v = i * ph + rng.uniform(1.2, max(1.3, ph - 1.2))
            fline(F, fc, u, v, u + rng.uniform(2, 7), v, dk(tones[i % len(tones)], .35))
        if i:
            fline(F, fc, 0, i * ph, fc.w, i * ph, WDK)


def deco_madeira(F, fc, role, st, rng):
    if role == 'bfront':
        deco_wood_planks(F, fc, 4, rng)
        # nó e arranhões de unha
        fpart(F, fc, fc.ell(52, 10.5, 2.2, 1.4), '#6b4527', outline=False)
        fpx(F, fc, 52, 10.5, WDK)
        for k in range(3):
            fline(F, fc, 18 + k * 2.5, 6 + k * .5, 24 + k * 2.5, 17 + k * .5, '#c99a64')
            fline(F, fc, 19 + k * 2.5, 6 + k * .5, 25 + k * 2.5, 17 + k * .5, dk('#7d5430', .2))
        # sangue seco
        for (u, v) in [(44, 19), (45, 19), (46, 20), (44, 20), (45, 21), (45, 22), (43, 19), (47, 20), (45, 23), (46, 21)]:
            fpx(F, fc, u, v, '#5a1a1a')
        fpx(F, fc, 44, 18, '#7a2424')
        # cantoneiras e cintas
        for u0, u1 in ((0, 4), (fc.w - 4, fc.w)):
            fpart(F, fc, fc.rect(u0, -1, u1, fc.h + 1), STRAP, tex=.25, outline=False, light=.3)
            for v in (3, fc.h - 4):
                rivet(F, fc, u0 + 1.5, v)
        for u0 in (9, fc.w - 15):
            fpart(F, fc, fc.rect(u0, -1, u0 + 6, fc.h + 1), STRAP, tex=.3,
                  marks=[(fc.ell(u0 + 3, 12, 2, 3), RUST), (fc.rect(u0 + 2, 13, u0 + 3, 20), RUST)])
            for i in range(4):
                rivet(F, fc, u0 + 2.5, i * 7 + 3)
        # fechadura de bronze em escudo
        cu = fc.w / 2
        sh = fc.poly((cu - 7, 0), (cu + 7, 0), (cu + 7, 9), (cu, 15), (cu - 7, 9))
        fpart(F, fc, sh, BRONZE, tex=.1, light=.35, clip=None)
        fpart(F, fc, fc.poly((cu - 5, 1.5), (cu + 5, 1.5), (cu + 5, 8.5), (cu, 13), (cu - 5, 8.5)), '#a5652a', outline=False, clip=None)
        for (u, v) in ((cu - 5.5, 1), (cu + 4.5, 1), (cu - 5.5, 8), (cu + 4.5, 8)):
            rivet(F, fc, u, v, BRONZE_L)
        F.part(fc.ell(cu, 5, 1.6, 1.6) + fc.poly((cu - .9, 5), (cu + .9, 5), (cu + 1.4, 10), (cu - 1.4, 10)), '#140c08', shade=False, outline=False)
        fpx(F, fc, cu - 3, 2.5, '#f6d8a0')
    elif role == 'bcap':
        deco_wood_planks(F, fc, 4, rng, tones=['#86592f', '#7d5430'])
        fpart(F, fc, fc.rect(-1, -1, fc.w + 1, 3.5), STRAP, outline=False)
        # alça de corda
        fpart(F, fc, fc.rect(9, 8, 17, 10), '#b59a62', tex=.3)
        fpart(F, fc, fc.rect(8, 10, 10, 16) + fc.rect(16, 10, 18, 16), '#b59a62', tex=.3)
    elif role == 'lfront':
        deco_wood_planks(F, fc, 1, rng, tones=['#94653a'])
        for u0 in (9, fc.w - 15):
            fpart(F, fc, fc.rect(u0, -1, u0 + 6, fc.h + 1), STRAP, tex=.3)
            rivet(F, fc, u0 + 2.5, fc.h / 2 - 1)
        for u0, u1 in ((0, 4), (fc.w - 4, fc.w)):
            fpart(F, fc, fc.rect(u0, -1, u1, fc.h + 1), STRAP, outline=False)
        cu = fc.w / 2
        fpart(F, fc, fc.rect(cu - 4, 1, cu + 4, fc.h + 1), BRONZE, light=.35, clip=None)
        rivet(F, fc, cu - 1, 2.5, BRONZE_L)
    elif role == 'lstrip':
        i = st['i']
        fflat(F, fc, fc.all(), WD[i % 4])
        for _ in range(7):
            u = rng.uniform(1, fc.w - 6)
            v = rng.uniform(.3, fc.h - .3)
            fline(F, fc, u, v, u + rng.uniform(2, 7), v, dk(WD[i % 4], .35))
        fline(F, fc, 0, 0, fc.w, 0, WDK)
        for u0 in (9, fc.w - 15):
            fpart(F, fc, fc.rect(u0, -1, u0 + 6, fc.h + 1), STRAP, tex=.2, outline=False, light=.35)
            fline(F, fc, u0, 0, u0, fc.h, '#2e2c2c')
            fline(F, fc, u0 + 6, 0, u0 + 6, fc.h, '#2e2c2c')
            if i % 2 == 0:
                rivet(F, fc, u0 + 2.5, fc.h / 2 - .5)
        for u0, u1 in ((0, 4), (fc.w - 4, fc.w)):
            fpart(F, fc, fc.rect(u0, -1, u1, fc.h + 1), STRAP, outline=False)
        if i == 2:
            for k in range(3):
                fline(F, fc, 40 + k * 3, 0, 44 + k * 3, fc.h, '#c99a64')
    elif role == 'lcap':
        fflat(F, fc, fc.all(), '#7d5430')
    elif role == 'linner':
        deco_wood_planks(F, fc, 3, rng, tones=['#5a3a22', '#4e321e'])
        for u0 in (9, fc.w - 15):
            for v in (4, fc.h - 4):
                rivet(F, fc, u0 + 2.5, v, '#8a847a')


def stencil(F, fc, s, u, v, col, sc=1):
    for ch in s:
        g = DIG[ch]
        for j, row in enumerate(g):
            for i, b in enumerate(row):
                if b == '1' and (i + j) % 5 != 3:
                    fpx(F, fc, u + i * sc, v + j * sc, col)
        u += 6 * sc


def deco_ferro(F, fc, role, st, rng):
    def chips(n, cols=(STEEL_L, '#3e4a2e')):
        for _ in range(n):
            u = rng.choice([rng.uniform(3, 8), rng.uniform(fc.w - 8, fc.w - 3), rng.uniform(3, fc.w - 3)])
            v = rng.uniform(3, fc.h - 3)
            fpart(F, fc, fc.ell(u, v, rng.uniform(.8, 1.8), rng.uniform(.6, 1.2)), cols[0], outline=False, shade=False)
            fpx(F, fc, u + 1, v + 1, cols[1])

    def frame(th=3, step=6):
        fr = fc.rect(-1, -1, fc.w + 1, th) + fc.rect(-1, fc.h - th, fc.w + 1, fc.h + 1) + \
            fc.rect(-1, -1, th, fc.h + 1) + fc.rect(fc.w - th, -1, fc.w + 1, fc.h + 1)
        fpart(F, fc, fr, STEEL, tex=.2, outline=False, light=.3)
        fline(F, fc, th, th, fc.w - th, th, '#2a2e2a')
        fline(F, fc, th, th, th, fc.h - th, '#2a2e2a')
        k = 0
        u = th / 2 + 1
        while u < fc.w - 2:
            rivet(F, fc, u - .5, .7, SILVER)
            rivet(F, fc, u - .5, fc.h - th + .5, SILVER)
            if k % 3 == 1:
                fline(F, fc, u, th + 1, u + .4, th + 3 + rng.uniform(1, 4), RUST)
            u += step
            k += 1

    if role == 'bfront':
        fflat(F, fc, fc.all(), OLIVE)
        for _ in range(20):
            u, v = rng.uniform(4, fc.w - 4), rng.uniform(4, fc.h - 4)
            fpx(F, fc, u, v, OLIVE_L if rng.random() < .5 else '#424c30')
        # nervuras
        for u0 in (20, fc.w - 23):
            fpart(F, fc, fc.rect(u0, 2, u0 + 3, fc.h - 2), OLIVE_L, outline=False, light=.3)
            fline(F, fc, u0 + 3, 3, u0 + 3, fc.h - 3, '#2e3624')
        chips(9)
        # estêncil estrela + 07
        cx, cy = 30, 14
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            r = 5 if i % 2 == 0 else 2.1
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a) * .95))
        m = F.mask(fc.poly(*pts)) & fc.m
        hm = (np.add.outer(np.arange(F.h), np.arange(F.w)) % 4) != 0
        F.a[m & hm, :3] = lit('#c8c4b0', fc.f) * .9
        stencil(F, fc, '07', 46, 10, '#c8c4b0')
        frame()
        # travas laterais
        for u0 in (6, fc.w - 13):
            fpart(F, fc, fc.rect(u0, 4, u0 + 7, 15), STEEL_L, light=.35, clip=None)
            fpart(F, fc, fc.rect(u0 + 1.5, 9, u0 + 5.5, 19), STEEL, clip=None)
            rivet(F, fc, u0 + 3, 6, SILVER)
            fpx(F, fc, u0 + 3, 17, '#22262a')
        # fechadura de prata
        cu = fc.w / 2
        fpart(F, fc, fc.rect(cu - 7, 1, cu + 7, 14), SILVER, light=.4, clip=None)
        fpart(F, fc, fc.rect(cu - 5, 3, cu + 5, 12), '#a9b0b6', outline=False, clip=None)
        F.part(fc.ell(cu, 6, 1.5, 1.5) + fc.poly((cu - .8, 6), (cu + .8, 6), (cu + 1.2, 10), (cu - 1.2, 10)), '#101418', shade=False, outline=False)
        for (u, v) in ((cu - 6, 1.8), (cu + 5, 1.8), (cu - 6, 11.6), (cu + 5, 11.6)):
            rivet(F, fc, u, v, SILVER_L)
        fpx(F, fc, cu - 4, 4, '#ffffff')
        fline(F, fc, cu - 3, 13.5, cu - 3, 19, RUST)
    elif role == 'bcap':
        fflat(F, fc, fc.all(), OLIVE)
        chips(3)
        frame(2, 7)
        fpart(F, fc, fc.rect(7, 8, 19, 10), STEEL_L, clip=None)
        fpart(F, fc, fc.rect(7, 8, 9, 15) + fc.rect(17, 8, 19, 15), STEEL, clip=None)
    elif role == 'lfront':
        fflat(F, fc, fc.all(), OLIVE_L)
        # faixa de aviso
        for i in range(12):
            u = 14 + i * 4
            if 26 <= u <= 44:
                continue
            fpart(F, fc, fc.poly((u, 2.5), (u + 2, 2.5), (u + 4, fc.h - 2.5), (u + 2, fc.h - 2.5)), '#d8b030' if i % 2 else '#1e1e1e',
                  outline=False, shade=False)
        frame(2, 6)
        cu = fc.w / 2
        fpart(F, fc, fc.rect(cu - 4, 2, cu + 4, fc.h + 1), SILVER, light=.4, clip=None)
        rivet(F, fc, cu - .5, 4, SILVER_L)
        chips(3)
    elif role == 'lstrip':
        fflat(F, fc, fc.all(), OLIVE_L if st['i'] != 3 else OLIVE)
        if fc.h > 6:
            for _ in range(25):
                u, v = rng.uniform(3, fc.w - 3), rng.uniform(3, fc.h - 3)
                fpx(F, fc, u, v, '#56653f' if rng.random() < .5 else '#748455')
            frame(3, 7)
            chips(5)
            # alça de carga no topo
            fpart(F, fc, fc.rect(28, 10, 44, 13), '#2a2e33', clip=None)
            fpart(F, fc, fc.rect(26, 9, 30, 15) + fc.rect(42, 9, 46, 15), STEEL, clip=None)
            fpart(F, fc, fc.rect(29, 8, 43, 10.5), STEEL_L, light=.4, clip=None)
            stencil(F, fc, '7', 56, 8, '#c8c4b0')
    elif role == 'lcap':
        fflat(F, fc, fc.all(), '#3e4a2e')
    elif role == 'linner':
        fflat(F, fc, fc.all(), '#3a3f3a')
        for _ in range(60):
            fpx(F, fc, rng.uniform(4, fc.w - 4), rng.uniform(3, fc.h - 3), '#2e332e' if rng.random() < .6 else '#4a504a')
        frame(3, 8)


def gold_swirl(F, fc, u, v, s=1):
    pts = [(0, 0), (1, -1), (2, -1), (3, 0), (3, 1), (2, 2), (1, 1)]
    for (a, b) in pts:
        fpx(F, fc, u + a * s, v + b, GOLD)
    fpx(F, fc, u + 2 * s, v, GOLD_D)


def deco_lua(F, fc, role, st, rng):
    def stone(c1=ST1, c2=ST2):
        fflat(F, fc, fc.all(), c1)
        for _ in range(int(fc.w * fc.h / 40)):
            u, v = rng.uniform(2, fc.w - 2), rng.uniform(1, fc.h - 1)
            fpart(F, fc, fc.ell(u, v, rng.uniform(1.5, 4), rng.uniform(.8, 2)), c2, outline=False, shade=False)
        for _ in range(3):  # veios
            u, v = rng.uniform(4, fc.w - 10), rng.uniform(2, fc.h - 2)
            for k in range(8):
                fpx(F, fc, u + k, v + math.sin(k * .9) * 1.2, VEIN)
        for _ in range(int(fc.w * fc.h / 120)):
            fpx(F, fc, rng.uniform(2, fc.w - 2), rng.uniform(1, fc.h - 1), '#55486a')

    def trim(th=2):
        fr = fc.rect(-1, -1, fc.w + 1, th) + fc.rect(-1, fc.h - th, fc.w + 1, fc.h + 1) + \
            fc.rect(-1, -1, th, fc.h + 1) + fc.rect(fc.w - th, -1, fc.w + 1, fc.h + 1)
        fpart(F, fc, fr, GOLD, outline=False, light=.35)
        fline(F, fc, th, fc.h - th, fc.w - th, fc.h - th, GOLD_D)
        fline(F, fc, fc.w - th, th, fc.w - th, fc.h - th, GOLD_D)

    if role == 'bfront':
        stone()
        trim()
        # cantoneiras com espiral
        for (u0, flip) in ((0, 1), (fc.w - 9, -1)):
            for v0 in (0, fc.h - 9):
                fpart(F, fc, fc.poly((u0, v0), (u0 + 9, v0), (u0 + 9, v0 + 3), (u0 + 3, v0 + 3), (u0 + 3, v0 + 9), (u0, v0 + 9))
                      if (u0 == 0 and v0 == 0) else fc.rect(u0, v0, u0 + 9, v0 + 9) if False else
                      fc.poly(*[(u0 + (a if u0 == 0 else 9 - a), v0 + (b if v0 == 0 else 9 - b))
                                for a, b in ((0, 0), (9, 0), (9, 3), (3, 3), (3, 9), (0, 9))]),
                      GOLD, light=.4, clip=None)
        # runas
        for i, g in enumerate(RUNES):
            u0 = 9 + i * 9 + (9 if i >= 3 else 0)
            x, y = fc.pt(u0 + 1.5, 18)
            glow(F, x, y, 6, RUNE, 110, layer=F.a)
            for j, row in enumerate(g):
                for k, b in enumerate(row):
                    if b == '1':
                        X, Y = fc.pt(u0 + k, 15.5 + j)
                        F.a[int(round(Y)), int(round(X)), :3] = C(RUNE_L) if j < 2 else C(RUNE)
                        F.a[int(round(Y)), int(round(X)), 3] = 255
        for u in range(8, fc.w - 8, 3):
            fpx(F, fc, u, fc.h - 5, GOLD_D)
        # fechadura de ouro (lua crescente)
        cu = fc.w / 2
        outer = fc.ell(cu, 7, 7.2, 7.2, 20)
        inner = fc.ell(cu + 3.2, 5.5, 5.2, 5.2, 18)
        ringpart(F, outer, inner, GOLD, light=.4)
        F.part(fc.ell(cu - 1, 8, 2.2, 2.2, 10), RUNE, light=.45, ol='#3a0a10')
        fpx(F, fc, cu - 2, 7, '#ffc0c0')
        F.part(fc.ell(cu + 2.5, 10.5, 1.1, 1.1) + fc.poly((cu + 2, 10.5), (cu + 3, 10.5), (cu + 3.4, 13.5), (cu + 1.6, 13.5)),
               '#120808', shade=False, outline=False)
    elif role == 'bcap':
        stone(SLATE, ST1)
        trim()
    elif role == 'lfront':
        stone(ST2, ST1)
        trim()
        cu = fc.w / 2
        for u in range(5, int(cu) - 6, 4):
            gold_swirl(F, fc, u, fc.h / 2, 1)
            gold_swirl(F, fc, fc.w - u - 3, fc.h / 2, 1)
        F.part(fc.ell(cu, fc.h / 2, 3, 3, 12), RUNE, light=.4, ol='#3a0a10')
        F.part(fc.ell(cu + 1.6, fc.h / 2 - 1, 2.4, 2.4, 12), '#5a1420', shade=False, outline=False)
    elif role == 'lstrip':
        stone(ST2 if st['i'] == 4 else ST1, ST2 if st['i'] != 4 else '#463d52')
        trim(1.5 if fc.h < 9 else 2)
        if fc.h > 12:
            cu, cv = fc.w / 2, fc.h / 2
            ringpart(F, fc.ell(cu, cv, 11, 10, 24), fc.ell(cu, cv, 8.6, 7.8, 22), GOLD, light=.4)
            F.part(fc.ell(cu, cv, 8.4, 7.6, 22), RUNE, light=.45, dark=.4, ol='#3a0a10',
                   marks=[(fc.ell(cu + 2, cv + 2, 2.2, 1.8), '#8a1e26'), (fc.ell(cu - 3, cv - 1, 1.5, 1.3), '#8a1e26'),
                          (fc.ell(cu + 3, cv - 3, 1.1, 1), '#a02830')])
            fpx(F, fc, cu - 4, cv - 4, '#ff9a9a')
            for a in range(0, 360, 45):
                u = cu + 14 * math.cos(math.radians(a))
                v = cv + 12 * math.sin(math.radians(a))
                fpx(F, fc, u, v, GOLD)
            for u in (8, fc.w - 10):
                gold_swirl(F, fc, u, cv, 1)
    elif role == 'lcap':
        fflat(F, fc, fc.all(), SLATE)
    elif role == 'linner':
        fflat(F, fc, fc.all(), '#5a1420')
        for _ in range(50):
            fpx(F, fc, rng.uniform(3, fc.w - 3), rng.uniform(2, fc.h - 2), '#6e1a28' if rng.random() < .5 else '#46101a')
        trim()


DECO = {'madeira': deco_madeira, 'ferro': deco_ferro, 'lua': deco_lua}


def face_draw(F, fc, base, kind, role, st, rng):
    fc.m = F.part(fc.all(), lit(base, fc.f), tex=0, light=.15, dark=.2)
    if fc.m is None or not fc.m.any():
        fc.m = F.mask(fc.all())
    DECO[kind](F, fc, role, st, rng)
    return fc.m


# ================================================================ itens pequenos dentro do baú (usa o desenho do loot)

def draw_feet(F, cam, kind):
    if kind == 'madeira':
        for x0 in (-W / 2, W / 2 - 7):
            for y0 in (2, D - 6):
                fc = Face(cam, (x0, y0, 0), (1, 0, 0), (0, 0, -1), 7, 3, (0, -1, 0))
                F.part(fc.all(), lit('#6b4527', .9 if y0 < 5 else .6), light=.1)
    elif kind == 'ferro':
        for y0 in (2, D - 4):
            fc = Face(cam, (-W / 2 + 2, y0, 0), (1, 0, 0), (0, 0, -1), W - 4, 3, (0, -1, 0))
            F.part(fc.all(), lit('#3a3f44', .9 if y0 < 5 else .6), light=.2)
    else:
        for x0 in (-W / 2 - 1, W / 2 - 6):
            for y0 in (1, D - 6):
                fc = Face(cam, (x0, y0, 0), (1, 0, 0), (0, 0, -1), 7, 4, (0, -1, 0))
                cx = x0 + 3.5
                shp = [[cam.p(cx - 3.5, y0, 0), cam.p(cx + 3.5, y0, 0), cam.p(cx + 2.5, y0, -4), cam.p(cx - 2.5, y0, -4)]]
                F.part(shp, lit(GOLD, .95 if y0 < 5 else .7), light=.4)
                if y0 < 5:
                    for k in (-2, 0, 2):
                        x, y = cam.p(cx + k, y0, -4)
                        F.px(x, y + 1, GOLD_D)


def draw_cavity(F, cam, kind, full):
    K = KIND[kind]
    top = Face(cam, (-W / 2, D, HB), (1, 0, 0), (0, -1, 0), W, D, (0, 0, 1))
    rimc = {'madeira': '#9a6a3c', 'ferro': STEEL, 'lua': GOLD}[kind]
    F.part(top.all(), lit(rimc, top.f), light=.2)
    t = 3
    cav = [[cam.p(-W / 2 + t, D - t, HB), cam.p(W / 2 - t, D - t, HB), cam.p(W / 2 - t, t, HB), cam.p(-W / 2 + t, t, HB)]]
    cm = F.flat(cav, '#140c10')
    # parede de trás (vista por dentro) e lateral esquerda
    back = [[cam.p(-W / 2 + t, D - t, HB), cam.p(W / 2 - t, D - t, HB), cam.p(W / 2 - t, D - t, HB - 30), cam.p(-W / 2 + t, D - t, HB - 30)]]
    wc = {'madeira': '#5a3a22', 'ferro': '#2e332e', 'lua': '#4a1020'}[kind]
    F.part(back, lit(wc, .55), clip=cm, outline=False, light=.15, dark=.5)
    left = [[cam.p(-W / 2 + t, D - t, HB), cam.p(-W / 2 + t, t, HB), cam.p(-W / 2 + t, t, HB - 30), cam.p(-W / 2 + t, D - t, HB - 30)]]
    F.part(left, lit(wc, .65), clip=cm, outline=False, shade=False)
    # fundo/sombra perto da borda da frente
    F.flat([[cam.p(-W / 2 + t, t + 4, HB), cam.p(W / 2 - t, t + 4, HB), cam.p(W / 2 - t, t, HB), cam.p(-W / 2 + t, t, HB)]],
           '#0c0608', clip=cm)
    if kind == 'madeira':
        for k in range(1, 3):
            x0, y0 = cam.p(-W / 2 + t, D - t, HB - k * 5)
            x1, y1 = cam.p(W / 2 - t, D - t, HB - k * 5)
            F.flat([[(x0, y0), (x1, y1), (x1, y1 + 1), (x0, y0 + 1)]], '#3a2414', clip=cm)
    if kind == 'lua':
        F.flat([[cam.p(-W / 2 + t, D - t, HB - 1), cam.p(W / 2 - t, D - t, HB - 1), cam.p(W / 2 - t, D - t, HB - 2.2),
                 cam.p(-W / 2 + t, D - t, HB - 2.2)]], GOLD_D, clip=cm)
    if not full:
        # vazio: teia/poeira
        x0, y0 = cam.p(-W / 2 + t, D - t, HB)
        for k in range(6):
            F.px(x0 + 1 + k, y0 + 1 + k * .6, '#8a8494')
            F.px(x0 + 1, y0 + 1 + k, '#6a6474')
        for k in range(10):
            x, y = cam.p(-W / 2 + 10 + k * 5.3, D - t - 2, HB - 22 + (k % 3))
            if cm[int(min(max(y, 0), F.h - 1)), int(min(max(x, 0), F.w - 1))]:
                F.px(x, y, '#2a2028')
    return cm, top


def draw_chest(F, cam, kind, st, rng=None):
    """st: lid (graus), key (None|'face'|'side'), jam (None|0|1), full (bool)"""
    rng = rng or random.Random(7)
    K = KIND[kind]
    lid = st.get('lid', 0)
    draw_feet(F, cam, kind)
    body_prof = [(0, 0), (D, 0), (D, HB), (0, HB)]
    faces = prism_faces(cam, body_prof, W)
    for i, fc in faces:
        if not fc.vis:
            continue
        if i == 3:  # frente
            face_draw(F, fc, K['body'], kind, 'bfront', st, random.Random(11))
    cap = Face(cam, (W / 2, 0, HB), (0, 1, 0), (0, 0, -1), D, HB, (1, 0, 0))
    face_draw(F, cap, K['body'], kind, 'bcap', st, random.Random(12))
    cav = None
    if lid > 0:
        cav = draw_cavity(F, cam, kind, st.get('full', False))
        if st.get('full') or lid < 100:
            cx, cy = cam.p(0, D / 2, HB)
            glow(F, cx, cy - 2, 30 if lid > 100 else 18 + lid * .1, K['light'], alpha=150 if lid > 100 else 110)
    # tampa
    hinge = (D, HB)
    prof = [rot_yz((y, z + HB), hinge, lid) for (y, z) in K['lid']]
    lf = prism_faces(cam, prof, W)
    n = len(prof)
    si = 0
    for i, fc in lf:
        if not fc.vis:
            continue
        if i == 0:
            role = 'linner'
        elif i == n - 1:
            role = 'lfront'
        else:
            role = 'lstrip'
        face_draw(F, fc, K['lidc'] if role != 'linner' else K['inner'], kind, role, dict(st, i=i), random.Random(20 + i))
    # tampa direita do perfil
    capshape = [[cam.p(W / 2, y, z) for (y, z) in prof]]
    cm = F.part(capshape, lit(K['lidc'], .62), light=.1)
    capf = Face(cam, (W / 2, 0, 0), (0, 1, 0), (0, 0, 1), D, 20, (1, 0, 0))
    capf.m = cm
    if kind == 'lua':
        F.part([[cam.p(W / 2, y, z) for (y, z) in prof]], lit(SLATE, .7), clip=cm, outline=False, light=.1)
    return cav


# ================================================================ efeitos dos estados

def draw_key_in_lock(F, cam, kind, mode):
    K = KIND[kind]
    lockv = {'madeira': 5, 'ferro': 6, 'lua': 10.5}[kind]
    lu = {'madeira': 0, 'ferro': 0, 'lua': 2.5}[kind]
    x, y = cam.p(lu, 0, HB - lockv)
    y -= 1
    pal = KEYPAL[K['key']]
    if mode == 'face':
        # anel de frente, a haste entra na fechadura
        F.part(ell(x, y - 1, 2, 2), pal[0], ol=pal[3], layer=F.fx)
        ringpart(F, ell(x, y - 8, 6, 6, n=20), ell(x, y - 8, 2.6, 2.6, n=14), pal[0], ol=pal[3], light=.4, layer=F.fx)
        F.px(x - 3, y - 11, pal[1], F.fx)
        F.px(x - 4, y - 10, pal[1], F.fx)
        if K['key'] == 'ouro':
            F.part(ell(x, y - 14.5, 1.6, 1.6), RUNE, ol='#3a0a10', layer=F.fx)
    else:
        F.part(limb(x, y, x, y - 14, 3.2, 3.2), pal[0], ol=pal[3], light=.4, layer=F.fx)
        F.px(x - 1, y - 13, pal[1], F.fx)
        # arcos de giro
        for a in range(-150, 151, 12):
            if abs(a) < 30:
                continue
            r = 9
            F.px(x + r * math.cos(math.radians(a - 90)) * 1.1, y - 7 + r * math.sin(math.radians(a - 90)) * .9, '#fff4e0', F.fx)
        sparkle(F, x + 9, y - 14, 2)
        sparkle(F, x - 9, y - 3, 1, '#ffe7a0')


def draw_jam(F, cam, kind, ph):
    # correntes em X
    x0, y0 = cam.p(-W / 2 - 2, 0, HB + 9)
    x1, y1 = cam.p(W / 2 + 2, 0, 3)
    x2, y2 = cam.p(W / 2 + 2, 0, HB + 9)
    x3, y3 = cam.p(-W / 2 - 2, 0, 3)
    for (ax, ay, bx, by) in ((x0, y0, x1, y1), (x2, y2, x3, y3)):
        L = math.hypot(bx - ax, by - ay)
        n = int(L / 4.2)
        ang = math.degrees(math.atan2(by - ay, bx - ax))
        for k in range(n + 1):
            t = k / n
            cx = ax + (bx - ax) * t
            cy = ay + (by - ay) * t + math.sin(t * math.pi) * 2
            if k % 2 == 0:
                o = ell(cx, cy, 3.4, 2.2, rot=ang, n=14)
                i_ = ell(cx, cy, 1.6, .7, rot=ang, n=10)
                ringpart(F, o, i_, '#8d969c', ol='#22262a', light=.4, layer=F.fx)
            else:
                F.part(limb(cx - 2.6 * math.cos(math.radians(ang)), cy - 2.6 * math.sin(math.radians(ang)),
                            cx + 2.6 * math.cos(math.radians(ang)), cy + 2.6 * math.sin(math.radians(ang)), 1.8),
                       '#6b747a', ol='#22262a', layer=F.fx,
                       marks=[(ell(cx, cy, 1, 1), RUST)] if k % 3 == 0 else ())
    # cadeado torto no cruzamento
    cx, cy = cam.p(0, 0, HB / 2 + 5)
    cx += 1
    deg = -18
    sh_o = [[rp(x, y, cx, cy, deg) for x, y in p] for p in ell(cx, cy - 6, 5.5, 6, n=18)]
    sh_i = [[rp(x, y, cx, cy, deg) for x, y in p] for p in ell(cx, cy - 6, 3.2, 4, n=14)]
    ringpart(F, sh_o, sh_i, '#b9c0c6', ol='#22262a', light=.45, layer=F.fx)
    body = [[rp(x, y, cx, cy, deg) for x, y in [(cx - 7, cy - 3), (cx + 7, cy - 3), (cx + 7, cy + 8), (cx - 7, cy + 8)]]]
    F.part(body, '#4a4f55', ol='#141618', light=.35, tex=.2, layer=F.fx,
           marks=[([[rp(x, y, cx, cy, deg) for x, y in [(cx + 2, cy + 3), (cx + 7, cy + 3), (cx + 7, cy + 8), (cx + 1, cy + 8)]]], RUST)])
    kx, ky = rp(cx, cy + 2, cx, cy, deg)
    F.part(ell(kx, ky, 1.3, 1.3) + [[(kx - .6, ky), (kx + .6, ky), (kx + 1, ky + 3.5), (kx - 1, ky + 3.5)]], '#0c0c0e',
           shade=False, outline=False, layer=F.fx)
    hx, hy = rp(cx - 5, cy - 1, cx, cy, deg)
    F.px(hx, hy, '#e8edf0', F.fx)
    # fumacinha da fechadura
    lx, ly = cam.p(0, 0, HB + 4)
    o = ph * 4
    puff(F, lx + 10 + o, ly - 12 - o * 1.5, 3.6 + ph, '#bdb6c6')
    puff(F, lx + 16 + o * .5, ly - 21 - o * 2, 2.6 + ph * .6, '#a8a2b4')
    if ph:
        puff(F, lx + 4, ly - 6, 2.4, '#cfc8d8')
    # selo X
    bx, by = 106, 22
    F.part(ell(bx, by, 10, 10, n=24), '#3a0a10', shade=False, ol='#14060a', layer=F.fx)
    F.part(ell(bx, by, 8.4, 8.4, n=22), '#c8323a', light=.4, dark=.3, ol='#5a1018', layer=F.fx)
    F.part(limb(bx - 4.5, by - 4.5, bx + 4.5, by + 4.5, 3.2) + limb(bx + 4.5, by - 4.5, bx - 4.5, by + 4.5, 3.2), '#fff4e0',
           shade=False, ol='#5a1018', layer=F.fx)
    if ph:
        sparkle(F, bx - 9, by - 8, 2, '#ffb0b0')


def chest_frame(kind, state, ph=0):
    F = Frame(128, 128)
    st = dict(lid=0)
    cam = Cam(ox=61.5, gy=107.5)
    if state == 'shake1':
        cam = Cam(ox=61.5, gy=107.5, deg=6, piv=(61.5 + W / 2 + 4, 110), dx=-1)
    elif state == 'shake2':
        cam = Cam(ox=61.5, gy=107.5, deg=-6, piv=(61.5 - W / 2, 110), dx=1)
    elif state == 'open1':
        st['lid'] = 35
    elif state == 'open2':
        st['lid'] = 75
    elif state == 'full':
        st['lid'] = 108
        st['full'] = True
    elif state == 'empty':
        st['lid'] = 108
    back = F.layer()
    if kind == 'lua':
        a = {'full': 150, 'open2': 120}.get(state, 95)
        cx, cy = cam.p(0, D / 2, HB / 2 + 6)
        glow(F, cx, cy, 62, '#c8323a', alpha=a, layer=back)
    if state == 'full':
        draw_rays(F, cam, kind, back)
    draw_chest(F, cam, kind, st)
    if state in ('shake1', 'shake2'):
        x0, y0 = cam.p(-W / 2, 0, HB)
        x1, y1 = cam.p(W / 2, 0, HB)
        arcs_side(F, 13, 62, -1)
        arcs_side(F, 115, 62, 1)
        text(F, '!', 61 if state == 'shake1' else 65, 18, col='#ff5a5a', sc=3)
        for (x, y) in ((22, 100), (104, 98)):
            dust(F, x, y, 2.5)
    if state in ('key1', 'key2'):
        draw_key_in_lock(F, cam, kind, 'face' if state == 'key1' else 'side')
    if state == 'open1':
        cx, cy = cam.p(0, 2, HB + 3)
        for k in range(-3, 4):
            F.px(cx + k * 8, cy - 1 - abs(k) % 2, '#fff6c8', F.fx)
        sparkle(F, cx - 20, cy - 6, 2, KIND[kind]['light'])
        sparkle(F, cx + 24, cy - 4, 2, KIND[kind]['light'])
    if state == 'open2':
        for (dx_, dy_, r) in ((-26, -18, 3), (22, -22, 2), (0, -30, 2), (32, -10, 1)):
            cx, cy = cam.p(dx_, D / 2, HB)
            sparkle(F, cx, cy + dy_ + 10, r, KIND[kind]['light'])
    if state == 'full':
        draw_contents(F, cam, kind)
    if state in ('jam1', 'jam2'):
        draw_jam(F, cam, kind, 1 if state == 'jam2' else 0)
    # sombra
    sh = shadow_layer(66, 44, 5.2, alpha=110, w=128, h=128, gy=109)
    sh[..., :3] = (28, 16, 40)
    out = over(sh, back)
    out = over(out, F.a)
    out = over(out, F.fx)
    return out


def arcs_side(F, x, y, d):
    for k in range(3):
        rr = 4 + k * 4
        for a in range(-45, 46, 9):
            F.px(x + d * (rr * math.cos(math.radians(a)) - 8), y + rr * math.sin(math.radians(a)), '#fff4e0' if k < 2 else '#c8c0d0', F.fx)


def draw_rays(F, cam, kind, layer):
    K = KIND[kind]
    cx, cy = cam.p(0, D / 2, HB)
    for i, a in enumerate(range(-160, -10, 18)):
        r = 70
        w = 5 if i % 2 else 3.2
        a0, a1 = math.radians(a - w), math.radians(a + w)
        tri = [[(cx, cy), (cx + r * math.cos(a0), cy + r * math.sin(a0)), (cx + r * math.cos(a1), cy + r * math.sin(a1))]]
        fx_layer_shape(F, tri, K['ray'], 90 if i % 2 else 140, layer=layer)
    glow(F, cx, cy - 6, 42, K['light'], alpha=160, layer=layer)


def draw_contents(F, cam, kind):
    cx, cy = cam.p(0, D / 2, HB)
    items = {'madeira': [('faca', -18, -18, -20), ('mapa', 4, -26, 8), ('lanterna', 20, -14, 18)],
             'ferro': [('pistola', -16, -20, -12), ('medkit', 12, -24, 6)],
             'lua': [('fragmento', -14, -22, -8), ('amuleto', 14, -24, 10)]}[kind]
    for (nm, dx_, dy_, ang) in items:
        pen = Pen(cx + dx_, cy + dy_, .42, ang)
        LOOT_FN[nm](F, pen, F.fx)
    for (dx_, dy_, r) in ((-30, -30, 3), (28, -36, 2), (0, -44, 3), (-6, -8, 1), (34, -18, 2)):
        sparkle(F, cx + dx_, cy + dy_, r, KIND[kind]['light'])


# ================================================================ chaves

KEYPAL = {  # base, brilho, sombra, contorno
    'bronze': ('#b87333', '#e0a85a', '#7a4a20', '#2e1a0a'),
    'prata': ('#c9ced4', '#f2f5f7', '#7d848c', '#1e2328'),
    'ouro': ('#f2c230', '#fff0a0', '#b8861a', '#3a2808'),
}


def draw_key(F, pen, kind, layer=None, spin=False):
    """chave em coords locais: anel centrado em (0,0), haste para +x até x=40. pen.sq achata (perfil)."""
    b, hl, sd, ol = KEYPAL[kind]
    L = layer
    # haste
    F.part(pen.L(6, 0, 40, 0, 4.2, 4.2), b, ol=ol, light=.4, dark=.35, layer=L)
    pen.line(F, 8, -1, 38, -1, hl, L)
    # dentes
    if kind == 'bronze':
        teeth = pen.R(30, 1, 34, 8) + pen.R(36, 1, 40.5, 6)
    elif kind == 'prata':
        teeth = pen.P((28, 1), (40.5, 1), (40.5, 8), (37, 8), (37, 5), (33, 5), (33, 7), (28, 7))
    else:
        teeth = pen.P((27, 1), (40.5, 1), (40.5, 9), (38, 9), (38, 6), (35, 6), (35, 9), (32, 9), (31, 5), (27, 5))
    F.part(teeth, b, ol=ol, light=.3, dark=.4, layer=L)
    # colarinho
    if kind != 'bronze':
        for x in (9, 12):
            F.part(pen.R(x - 1, -3.6, x + 1, 3.6), sd if kind == 'prata' else b, ol=ol, light=.5, layer=L)
    # anel
    if kind == 'bronze':
        ringpart(F, pen.E(0, 0, 9, 9, 22), pen.E(-.5, 0, 4, 4, 16), b, ol=ol, light=.4, dark=.35, layer=L,
                 marks=[(pen.E(4, 5, 2.4, 1.6), '#5f8a6a'), (pen.E(-6, 3, 1.4, 1.2), '#5f8a6a')])
        pen.px(F, -5, -5, hl, L)
        pen.px(F, -4, -6, hl, L)
    elif kind == 'prata':
        lobes = pen.E(-6, 0, 5, 5, 16) + pen.E(1, -6, 5, 5, 16) + pen.E(1, 6, 5, 5, 16) + pen.E(0, 0, 5.5, 5.5, 16)
        ringpart(F, lobes, pen.E(-.5, 0, 2.6, 2.6, 12), b, ol=ol, light=.45, dark=.35, layer=L)
        pen.px(F, -8, -2, hl, L)
        pen.px(F, 0, -9, hl, L)
    else:
        ringpart(F, pen.E(0, 0, 10, 10, 26), pen.E(0, 0, 6.6, 6.6, 22), b, ol=ol, light=.45, dark=.35, layer=L)
        # lua crescente vermelha dentro
        ringpart(F, pen.E(-.5, 0, 5.8, 5.8, 18), pen.E(2.2, -1.2, 4.6, 4.6, 16), RUNE, ol='#3a0a10', light=.4, layer=L)
        # filigrana: pontinhas
        for a in (135, 180, 225, 90, 270):
            x, y = 11.5 * math.cos(math.radians(a)), 11.5 * math.sin(math.radians(a))
            F.part(pen.E(x, y, 1.8, 1.8, 8), b, ol=ol, light=.5, layer=L)
        F.part(pen.E(-12, 0, 2.2, 2.2, 10), RUNE, ol='#3a0a10', light=.6, layer=L)
        pen.px(F, -6, -7, hl, L)
        pen.px(F, -7, -6, hl, L)
        pen.px(F, -13, -1, '#ffc0c0', L)
    if not spin and kind != 'bronze':
        pen.px(F, 20, -1, '#ffffff', L)


def key_icon(kind, spin=False):
    F = Frame(64, 64)
    sq = .22 if spin else 1
    pen = Pen(17, 17, .95, 45, sq)
    sh = shadow_layer(34, 18, 3, alpha=70, w=64, h=64, gy=56)
    sh[..., :3] = (28, 16, 40)
    draw_key(F, pen, kind, spin=spin)
    if spin:
        for k, a0 in enumerate((-30, 150)):
            for a in range(a0, a0 + 70, 7):
                r = 15
                F.px(17 + r * math.cos(math.radians(a)), 17 + r * math.sin(math.radians(a)), '#fff4e0', F.fx)
        sparkle(F, 40, 12, 2)
    else:
        sparkle(F, 47, 25, 2)
    return over(over(sh, F.a), F.fx)


def keyring_icon():
    F = Frame(64, 64)
    sh = shadow_layer(32, 20, 3, alpha=70, w=64, h=64, gy=58)
    sh[..., :3] = (28, 16, 40)
    for kind, ang, dx in (('bronze', 125, -2), ('ouro', 55, 2), ('prata', 90, 0)):
        a = math.radians(ang)
        cx, cy = 32 + 9 * math.cos(a) + dx, 12 + 9 * math.sin(a)
        pen = Pen(cx + 5 * math.cos(a), cy + 5 * math.sin(a), .62, ang)
        draw_key(F, pen, kind)
    ringpart(F, ell(32, 12, 9, 9, n=26), ell(32, 12, 6.8, 6.8, n=22), '#8d969c', ol='#1e2328', light=.5)
    F.px(26, 7, '#f2f5f7')
    F.px(27, 6, '#f2f5f7')
    return over(over(sh, F.a), F.fx)


# ================================================================ gazua

def gazua_icon(broken=False):
    F = Frame(64, 64)
    sh = shadow_layer(32, 22, 3, alpha=70, w=64, h=64, gy=55)
    sh[..., :3] = (28, 16, 40)
    pen = Pen(10, 44, 1, -40)
    # chave de tensão em L (atrás)
    F.part(pen.L(4, 8, 34, 8, 2.6) + pen.L(34, 8, 34, 14, 2.6), '#8d969c', ol='#1e2328', light=.4)
    # haste
    if not broken:
        F.part(pen.L(16, 0, 46, 0, 2.6) + pen.L(46, 0, 49, -3, 2.4) + pen.L(49, -3, 51, -3, 2.2), SILVER, ol='#1e2328', light=.5)
        pen.line(F, 18, -1, 44, -1, '#f2f5f7')
    else:
        F.part(pen.L(16, 0, 31, .5, 2.6), SILVER, ol='#1e2328', light=.5)
        pen.line(F, 18, -1, 30, -.5, '#f2f5f7')
        p2 = Pen(*pen.q(37, -7), 1, -40 + 28)
        F.part(p2.L(0, 0, 13, 0, 2.6) + p2.L(13, 0, 16, -3, 2.4) + p2.L(16, -3, 18, -3, 2.2), SILVER, ol='#1e2328', light=.5)
        x, y = pen.q(32.5, 0)
        impact(F, x + 1, y - 2, 6)
        for (dx_, dy_) in ((5, -7), (-3, -8), (7, 2)):
            F.part(ell(x + dx_, y + dy_, 1.2, .8, rot=30), '#c9ced4', ol='#1e2328', layer=F.fx)
    # cabo com fita
    cab = pen.L(0, 0, 18, 0, 7.5, 7)
    m = F.part(cab, '#1e1a1c', ol='#0a0808', light=.3, tex=.1)
    for k in range(5):
        u = 2 + k * 3.6
        F.part(pen.P((u, -4), (u + 1.8, -4), (u + 3, 4), (u + 1.2, 4)), '#c8323a', clip=m, outline=False, light=.35)
    pen.line(F, 1, -2, 16, -2, '#5a5458')
    ringpart(F, pen.E(-4, 0, 3.6, 3.6, 12), pen.E(-4, 0, 1.6, 1.6, 8), '#8d969c', ol='#1e2328')
    return over(over(sh, F.a), F.fx)


# ================================================================ loot (coords 0..64, pen mapeia)

def L_fragmento(F, p, L=None):
    F.part(p.E(32, 50, 16, 6), '#2a2430', ol='#0e0a12', layer=L, tex=.3,
           marks=[(p.E(26, 49, 4, 2), '#3c3446'), (p.E(40, 51, 3, 1.5), '#3c3446')])
    shards = [((32, 10), 7, 24, 48, -4), ((20, 22), 5, 18, 50, -28), ((44, 24), 5, 16, 49, 25)]
    for (tip, hw, ln, by, a) in shards:
        tx, ty = tip
        bx = tx - math.sin(math.radians(a)) * 0
        pts = [(tx, ty), (tx + hw, ty + 7), (tx + hw * .8, by), (tx - hw * .8, by), (tx - hw, ty + 7)]
        m = F.part(p.P(*pts), '#c8323a', ol='#3a0a10', light=.4, dark=.4, layer=L,
                   marks=[(p.P((tx, ty), (tx + hw, ty + 7), (tx + hw * .8, by), (tx + 1, by)), '#8a1e26'),
                          (p.P((tx, ty), (tx - hw * .3, ty + 8), (tx - hw * .5, by - 6), (tx - hw * .8, by), (tx - hw, ty + 7)), '#e04a4a')])
        # veios dourados
        p.line(F, tx - 1, ty + 9, tx + 2, ty + 16, GOLD, L)
        p.line(F, tx + 2, ty + 16, tx - 2, ty + 23, GOLD, L)
        p.line(F, tx + 2, ty + 16, tx + 4, ty + 20, GOLD_D, L)
        p.px(F, tx - 2, ty + 4, '#ffd0d0', L)
        p.px(F, tx - 1, ty + 3, '#ffffff', L)
    if p.k > .8:
        sparkle(F, *p.q(14, 12), 3, '#ffb0b0')
        sparkle(F, *p.q(51, 16), 2, '#fff0a0')


def L_amuleto(F, p, L=None):
    # corrente
    for i in range(15):
        a = math.radians(200 + i * 10)
        x, y = 32 + 20 * math.cos(a), 26 + 18 * math.sin(a)
        F.part(p.E(x, y, 1.8 if i % 2 else 1.4, 1.4 if i % 2 else 1.8), GOLD_D if i % 2 else GOLD, ol='#3a2808', layer=L, light=.5)
    # medalhão
    ringpart(F, p.E(32, 36, 14, 14, 28), p.E(32, 36, 9.5, 9.5, 24), GOLD, ol='#3a2808', light=.45, dark=.35, layer=L)
    F.part(p.E(32, 36, 9.5, 9.5, 24), '#2e1420', ol='#3a2808', layer=L, shade=False)
    ringpart(F, p.E(31, 36, 8, 8, 20), p.E(35, 34, 6.5, 6.5, 18), RUNE, ol='#3a0a10', light=.45, layer=L)
    for a in range(0, 360, 30):
        x, y = 32 + 16 * math.cos(math.radians(a)), 36 + 16 * math.sin(math.radians(a))
        F.part(p.E(x, y, 1.6, 1.6, 8), GOLD, ol='#3a2808', layer=L, light=.5)
    F.part(p.E(32, 20, 3, 2.4), GOLD, ol='#3a2808', layer=L, light=.5)
    F.part(p.P((32, 51), (35, 55), (32, 60), (29, 55)), RUNE, ol='#3a0a10', light=.5, layer=L)
    p.px(F, 31, 54, '#ffc0c0', L)
    p.px(F, 23, 29, '#fff0a0', L)
    p.px(F, 24, 28, '#fff0a0', L)
    p.px(F, 27, 33, '#ff9a9a', L)
    if p.k > .8:
        sparkle(F, *p.q(48, 24), 2, '#fff0a0')


def L_ferramentas(F, p, L=None):
    # chave inglesa e chave de fenda saindo
    F.part(p.L(20, 26, 30, 4, 4.5), '#8d969c', ol='#1e2328', light=.45, layer=L)
    F.part(p.E(31, 4, 4.5, 4.5, 14), '#8d969c', ol='#1e2328', light=.45, layer=L)
    F.part(p.R(30, -1, 33, 4), '#2a2e33', ol='#1e2328', layer=L, shade=False)
    F.part(p.L(42, 24, 46, 10, 2.4), '#c9ced4', ol='#1e2328', layer=L)
    F.part(p.L(46, 10, 48, 3, 4.5), '#e8c030', ol='#3a2808', light=.4, layer=L)
    # caixa
    F.part(p.R(10, 26, 54, 52), '#a8322a', ol='#2a0a08', light=.3, tex=.12, layer=L,
           marks=[(p.R(10, 26, 54, 33), '#b83c30'), (p.R(10, 46, 54, 52), '#8a2820'), (p.E(40, 40, 3, 2), '#922a22')])
    F.part(p.R(10, 32, 54, 34), '#6e1e18', ol='#2a0a08', layer=L, shade=False)
    for x in (16, 46):
        F.part(p.R(x - 2, 30, x + 3, 37), '#c9ced4', ol='#1e2328', light=.5, layer=L)
        p.px(F, x, 35, '#2a2e33', L)
    F.part(p.R(24, 19, 40, 22) + p.R(24, 19, 27, 27) + p.R(37, 19, 40, 27), '#2a2e33', ol='#0a0a0c', light=.3, layer=L)
    for (x, y) in ((14, 42), (20, 48), (50, 44), (30, 41)):
        p.px(F, x, y, '#d8d2c4', L)
        p.px(F, x + 1, y, '#6e1e18', L)
    p.line(F, 12, 50, 52, 50, '#6e1e18', L)


def L_mapa(F, p, L=None):
    panels = [((8, 14), (24, 12), (24, 52), (8, 50)), ((24, 12), (40, 16), (40, 54), (24, 52)),
              ((40, 16), (56, 12), (56, 50), (40, 54))]
    cols = ['#d8c89a', '#c4b484', '#d8c89a']
    for pts, c in zip(panels, cols):
        F.part(p.P(*pts), c, ol='#3a3020', light=.25, tex=.15, layer=L)
    # rio
    for x in range(9, 56):
        y = 30 + 6 * math.sin(x / 7.0)
        p.px(F, x, y, '#3f6a8c', L)
        p.px(F, x, y + 1, '#5a8ab0', L)
    # ruas
    p.line(F, 10, 22, 54, 40, '#8a7a5a', L)
    p.line(F, 18, 14, 30, 52, '#8a7a5a', L)
    p.line(F, 44, 16, 48, 52, '#8a7a5a', L)
    # quadras
    for (x, y) in ((12, 40), (32, 22), (46, 26), (14, 18)):
        F.part(p.R(x, y, x + 4, y + 3), '#a89a72', layer=L, outline=False, shade=False)
    # X vermelho e mancha de café
    p.line(F, 44, 40, 50, 46, '#c8323a', L)
    p.line(F, 50, 40, 44, 46, '#c8323a', L)
    p.line(F, 45, 40, 51, 46, '#c8323a', L)
    p.line(F, 51, 40, 45, 46, '#c8323a', L)
    for a in range(0, 360, 20):
        p.px(F, 18 + 5 * math.cos(math.radians(a)), 44 + 4 * math.sin(math.radians(a)), '#9a7a4a', L)
    # rasgo no canto
    F.part(p.P((49, 50.8), (56, 49.5), (56, 51), (52, 53)), '#3a3020', layer=L, outline=False, shade=False)


def L_lanterna(F, p, L=None):
    pen = Pen(*p.q(12, 42), p.k, -30 + math.degrees(math.atan2(p.s, p.c)))
    # cone de luz
    ex, ey = pen.q(44, 0)
    fx_layer_shape(F, pen.P((44, -6), (57, -12), (57, 12), (44, 6)), '#ffe7a0', 80, layer=L if L is not None else F.fx)
    F.part(pen.R(0, -5, 30, 5), '#2a2e2a', ol='#0a0c0a', light=.35, tex=.15, layer=L,
           marks=[(pen.R(4, -5, 6, 5), '#3e443e'), (pen.R(8, -5, 10, 5), '#3e443e'), (pen.R(12, -5, 14, 5), '#3e443e')])
    F.part(pen.R(-3, -4, 1, 4), '#1a1c1a', ol='#0a0c0a', layer=L)
    F.part(pen.R(18, -6.5, 23, -4), '#c8323a', ol='#2a0a08', layer=L)
    F.part(pen.P((30, -5), (38, -7.5), (38, 7.5), (30, 5)), '#4f5b3a', ol='#0a0c0a', light=.4, layer=L)
    F.part(pen.R(38, -8, 43, 8), '#8d969c', ol='#1e2328', light=.5, layer=L)
    F.part(pen.R(43, -7, 45, 7), '#fff0a0', ol='#8a6a10', layer=L, shade=False)
    pen.line(F, 2, -3, 28, -3, '#5a605a', L)
    if p.k > .8:
        glow(F, ex, ey, 10, '#fff0a0', 140, layer=L)


def L_colete(F, p, L=None):
    body = p.P((14, 12), (24, 10), (28, 18), (36, 18), (40, 10), (50, 12), (52, 52), (12, 52))
    m = F.part(body, '#55643f', ol='#141a0e', light=.3, tex=.25, layer=L)
    F.part(p.P((24, 10), (28, 18), (36, 18), (40, 10), (38, 22), (26, 22)), '#2a3220', layer=L, outline=False, shade=False)
    F.part(p.R(31, 22, 33, 52), '#3e4a2e', clip=m, outline=False, layer=L, shade=False)
    for (x0, y0) in ((15, 30), (36, 30)):
        F.part(p.R(x0, y0, x0 + 13, y0 + 12), '#65734a', ol='#141a0e', light=.35, tex=.2, layer=L)
        F.part(p.R(x0, y0, x0 + 13, y0 + 3), '#74845a', ol='#141a0e', layer=L, light=.3)
        p.px(F, x0 + 6, y0 + 2, '#1e1e1e', L)
    F.part(p.R(24, 44, 40, 50), '#65734a', ol='#141a0e', layer=L)
    for y in (24, 46):
        F.part(p.R(10, y, 54, y + 3), '#1e1e1e', ol='#0a0a0a', layer=L, light=.25)
        F.part(p.R(30, y - .5, 34, y + 3.5), '#8d969c', ol='#1e2328', layer=L, light=.5)
    F.part(p.R(42, 15, 47, 20), '#8a7a52', ol='#141a0e', layer=L)
    for k in range(3):
        p.px(F, 43 + k * 2, 17, '#3a3020', L)
    for (x, y) in ((20, 14), (44, 14)):
        p.px(F, x, y, '#2a3220', L)


def L_chave_gerador(F, p, L=None):
    # argola
    ringpart(F, p.E(14, 14, 7, 7, 18), p.E(14, 14, 4.6, 4.6, 14), '#8d969c', ol='#1e2328', light=.5, layer=L)
    # etiqueta
    F.part(p.P((6, 22), (22, 20), (26, 40), (10, 42)), '#e8c030', ol='#3a2808', light=.35, tex=.1, layer=L)
    F.part(p.E(14, 24, 1.6, 1.6), '#3a2808', layer=L, outline=False, shade=False)
    F.part(p.P((17, 26), (12, 33), (16, 33), (13, 39), (20, 30), (16, 30), (19, 26)), '#1e1e1e', layer=L, outline=False, shade=False)
    # chave
    pen = Pen(*p.q(30, 24), p.k, 35 + math.degrees(math.atan2(p.s, p.c)))
    F.part(pen.L(8, 0, 36, 0, 5), '#c9ced4', ol='#1e2328', light=.45, layer=L)
    F.part(pen.P((18, 2), (36, 2), (36, 5), (33, 5), (32, 3.5), (29, 5), (26, 3.5), (23, 5), (20, 3.5), (18, 5)), '#c9ced4',
           ol='#1e2328', layer=L)
    pen.line(F, 10, -1.5, 34, -1.5, '#f2f5f7', L)
    F.part(pen.E(0, 0, 9, 8, 18), '#1e1e1e', ol='#080808', light=.3, layer=L)
    F.part(pen.E(-1, 0, 3, 3, 10), '#3a3a3a', layer=L, outline=False)
    F.part(pen.E(-6, 0, 2.4, 2.4, 10), '#5a5a5a', layer=L, outline=False)
    pen.line(F, -14, 0, -9, 0, '#8d969c', L)


def L_faca(F, p, L=None):
    pen = Pen(*p.q(10, 52), p.k, -45 + math.degrees(math.atan2(p.s, p.c)))
    F.part(pen.P((22, -4.5), (50, -3.5), (58, 0), (52, 3), (22, 4)), '#c9ced4', ol='#1e2328', light=.45, layer=L,
           marks=[(pen.P((22, 1), (52, 1), (58, 0), (52, 3), (22, 4)), '#8d969c')])
    pen.line(F, 24, -2.5, 50, -2.2, '#f2f5f7', L)
    for k in range(5):
        pen.px(F, 26 + k * 3, -4.5, '#6b747a', L)
    for (u, v) in ((52, 0), (53, 1), (55, 0), (50, 2)):
        pen.px(F, u, v, '#6a1a1a', L)
    F.part(pen.R(18, -7, 22, 7), '#3a3f44', ol='#0a0c0e', light=.4, layer=L)
    h = F.part(pen.R(0, -4, 18, 4), '#2a2a2a', ol='#0a0a0a', light=.3, layer=L)
    for k in range(6):
        F.part(pen.P((1 + k * 3, -4), (3 + k * 3, -4), (4 + k * 3, 4), (2 + k * 3, 4)), '#4f5b3a', clip=h, outline=False, layer=L)
    F.part(pen.E(-2, 0, 3, 3, 10), '#8d969c', ol='#1e2328', layer=L)


def L_machado(F, p, L=None):
    pen = Pen(*p.q(12, 54), p.k, -55 + math.degrees(math.atan2(p.s, p.c)))
    h = F.part(pen.L(0, 0, 50, 0, 5.5, 5), '#9a6a3c', ol='#2a1a0a', light=.35, tex=.25, layer=L)
    pen.line(F, 2, -1.5, 48, -1.5, '#b88a58', L)
    for k in range(3):
        F.part(pen.R(4 + k * 3, -3, 5.5 + k * 3, 3), '#1e1e1e', clip=h, outline=False, layer=L)
    # cabeça (lâmina para o lado -v, martelo/pico atrás)
    F.part(pen.P((41, 4.5), (53, 4.5), (53, -5), (60, -13), (58, -20), (47, -16), (35, -20), (33, -13), (41, -5)), '#b8322a', ol='#2a0a08',
           light=.35, tex=.1, layer=L)
    F.part(pen.P((60, -13), (58, -20), (47, -16), (35, -20), (33, -13), (47, -12.5)), '#c9ced4', ol='#1e2328', light=.5, layer=L)
    pen.line(F, 36, -18, 46, -15, '#f2f5f7', L)
    F.part(pen.P((44, 4.5), (50, 4.5), (49, 11), (45, 11)), '#3a3f44', ol='#0a0c0e', light=.3, layer=L)
    F.part(pen.R(41, -5, 53, -3), '#8a2820', layer=L, outline=False, shade=False)
    for (u, v) in ((50, -17), (52, -18), (51, -16), (55, -17), (49, -15)):
        pen.px(F, u, v, '#6a1a1a', L)
    pen.px(F, 38, -17, '#ffffff', L)


def L_pistola(F, p, L=None):
    g = '#2e3236'
    F.part(p.P((20, 30), (32, 30), (30, 52), (18, 52), (16, 48)), '#3a3530', ol='#0a0a0a', light=.3, tex=.4, layer=L)
    F.part(p.P((26, 30), (36, 30), (38, 38), (34, 40), (30, 40)), g, ol='#0a0a0a', layer=L)
    ringpart(F, p.P((28, 32), (38, 32), (38, 40), (28, 40)), p.P((30, 33), (36, 33), (36, 38), (30, 38)), g, ol='#0a0a0a', layer=L)
    F.part(p.R(14, 20, 56, 30), g, ol='#0a0a0a', light=.35, layer=L)
    F.part(p.R(14, 20, 56, 23), '#454a50', ol='#0a0a0a', layer=L, light=.4)
    for k in range(6):
        p.line(F, 17 + k * 2, 23, 17 + k * 2, 29, '#16181a', L)
    F.part(p.R(36, 24, 44, 27), '#16181a', layer=L, outline=False, shade=False)
    F.part(p.R(52, 18, 55, 20), g, ol='#0a0a0a', layer=L)
    F.part(p.R(15, 18, 18, 20), g, ol='#0a0a0a', layer=L)
    p.line(F, 20, 21, 52, 21, '#7d848c', L)
    p.px(F, 30, 21, '#ffffff', L)
    p.px(F, 31, 21, '#c9ced4', L)
    F.part(p.R(56, 22, 58, 26), '#0a0a0a', layer=L, outline=False, shade=False)


def L_medkit(F, p, L=None):
    F.part(p.P((22, 18), (26, 10), (38, 10), (42, 18), (38, 18), (36, 14), (28, 14), (26, 18)), '#2a2a2a', ol='#0a0a0a', light=.3, layer=L)
    m = F.part(p.P((9, 20), (55, 18), (57, 52), (7, 53)), '#e8e4dc', ol='#3a3630', light=.25, tex=.25, layer=L,
               marks=[(p.E(46, 46, 4, 2.5), '#c8c0b0'), (p.E(15, 46, 2, 1.5), '#9a8a70')])
    F.part(p.R(8, 22, 56, 25), '#c8c0b0', clip=m, outline=False, layer=L)
    for x in range(10, 55, 2):
        p.px(F, x, 23, '#6b6460', L)
    F.part(p.R(44, 21, 47, 27), '#8d969c', ol='#1e2328', layer=L)
    F.part(p.R(8, 47, 56, 50), '#3f9a4a', clip=m, outline=False, layer=L)
    F.part(p.P((28, 28), (36, 28), (36, 33), (41, 33), (41, 41), (36, 41), (36, 46), (28, 46), (28, 41), (23, 41), (23, 33), (28, 33)),
           '#c8323a', ol='#5a1018', light=.4, layer=L)
    p.px(F, 29, 29, '#ff8a8a', L)
    p.px(F, 50, 30, '#5a1a1a', L)
    p.px(F, 51, 31, '#5a1a1a', L)


LOOT_FN = {'fragmento': L_fragmento, 'amuleto': L_amuleto, 'ferramentas': L_ferramentas, 'mapa': L_mapa,
           'lanterna': L_lanterna, 'colete': L_colete, 'chave_ger': L_chave_gerador, 'faca': L_faca,
           'machado': L_machado, 'pistola': L_pistola, 'medkit': L_medkit}
LOOT_ORDER = ['fragmento', 'amuleto', 'ferramentas', 'mapa', 'lanterna', 'colete', 'chave_ger', 'faca', 'machado', 'pistola', 'medkit']


def loot_icon(nm):
    F = Frame(64, 64)
    sh = shadow_layer(32, 20, 3, alpha=70, w=64, h=64, gy=56)
    sh[..., :3] = (28, 16, 40)
    LOOT_FN[nm](F, Pen(0, 0, 1))
    if nm == 'fragmento':
        back = F.layer()
        glow(F, 32, 32, 30, '#c8323a', 90, layer=back)
        return over(over(over(sh, back), F.a), F.fx)
    return over(over(sh, F.a), F.fx)


# ================================================================ puzzle — peças de UI

def sector(cx, cy, r0, r1, a0, a1, n=12):
    out = [(cx + r1 * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r1 * math.sin(math.radians(a0 + (a1 - a0) * i / n)))
           for i in range(n + 1)]
    out += [(cx + r0 * math.cos(math.radians(a1 - (a1 - a0) * i / n)), cy + r0 * math.sin(math.radians(a1 - (a1 - a0) * i / n)))
            for i in range(n + 1)]
    return [out]


def keyhole(F, x, y, s=1., col='#0c0c0e', layer=None):
    F.part(ell(x, y, 2.2 * s, 2.2 * s) + poly((x - 1.1 * s, y), (x + 1.1 * s, y), (x + 1.8 * s, y + 6 * s), (x - 1.8 * s, y + 6 * s)),
           col, shade=False, outline=False, layer=layer)


def pz_dial():
    F = Frame(64, 64)
    F.part(ell(32, 32, 30, 30, n=48), STEEL, ol='#14181c', light=.35, dark=.4, tex=.15)
    F.part(ell(32, 32, 25, 25, n=44), '#2a2e33', ol='#101316', light=.1, dark=.15)
    for a in range(0, 360, 45):
        x, y = 32 + 27.5 * math.cos(math.radians(a + 22.5)), 32 + 27.5 * math.sin(math.radians(a + 22.5))
        F.px(x, y, '#e2e6ea')
        F.px(x + 1, y + 1, '#3a3f44')
    for a in range(0, 360, 15):
        r0 = 21 if a % 45 == 0 else 22.5
        for r in np.arange(r0, 24, .5):
            F.px(32 + r * math.cos(math.radians(a)), 32 + r * math.sin(math.radians(a)), '#5a6068')
    F.part(sector(32, 32, 12.5, 23.5, -75, -25, 10), '#4fb06a', ol='#14361a', light=.35, dark=.25)
    for a in (-75, -25):
        for r in np.arange(12.5, 23.6, .5):
            F.px(32 + r * math.cos(math.radians(a)), 32 + r * math.sin(math.radians(a)), '#8fe09a')
    # pino na zona
    px_, py_ = 32 + 18 * math.cos(math.radians(-50)), 32 + 18 * math.sin(math.radians(-50))
    F.part(ell(px_, py_, 2.6, 2.6), '#d9a05a', ol='#3a2808', light=.5)
    F.px(px_ - 1, py_ - 1, '#fff0c0')
    # 3 encaixes de pino
    for k, x in enumerate((25, 32, 39)):
        F.part(ell(x, 47 - (k == 1) * 1.5, 2, 2), '#14181c', ol='#3a3f44', shade=False)
    F.part(ell(32, 32, 7, 7, n=20), '#8d969c', ol='#1e2328', light=.45)
    F.part(ell(32, 32, 4.5, 4.5, n=16), '#6b747a', ol='#1e2328', light=.2, shade=True)
    keyhole(F, 32, 30.5, .8)
    return over(F.a, F.fx)


def pz_needle():
    F = Frame(64, 64)
    F.part(poly((30, 33), (34, 33), (32.6, 8), (31.4, 8)), '#c8323a', ol='#3a0a10', light=.45, dark=.35)
    F.line(31.5, 30, 31.8, 11, '#ff8a8a')
    F.part(ell(32, 38, 3.4, 3.4), '#8a1e26', ol='#3a0a10', light=.4)
    F.part(ell(32, 32, 3, 3), SILVER, ol='#1e2328', light=.6)
    F.px(31, 31, '#ffffff')
    return over(F.a, F.fx)


def pz_pin():
    F = Frame(64, 64)
    back = F.layer()
    glow(F, 32, 30, 26, '#4fb06a', 140, layer=back)
    for k in range(6):  # mola
        y = 42 + k * 2.2
        F.line(26, y, 38, y + 1.1, '#8d969c')
        F.line(38, y + 1.1, 26, y + 2.2, '#5a6068')
    F.part(poly((27, 14), (37, 14), (37, 41), (27, 41)) + ell(32, 14, 5, 2.5), '#d9a05a', ol='#3a2808', light=.45, dark=.35,
           marks=[(poly((34, 14), (37, 14), (37, 41), (34, 41)), '#b07a3a'), (poly((27, 22), (37, 22), (37, 24), (27, 24)), '#a06a2a'),
                  (poly((27, 32), (37, 32), (37, 34), (27, 34)), '#a06a2a')])
    F.part(ell(32, 13, 4.2, 2), '#f0c070', ol='#3a2808', light=.5)
    F.part(ell(32, 41, 6.5, 2), '#6b747a', ol='#1e2328')
    F.part(chain([(40, 14), (44, 18), (52, 8)], 3.2), '#8fe09a', ol='#14361a', shade=False, layer=F.fx)
    return over(over(back, F.a), F.fx)


def stone_tile(F, col, lite=False):
    sh = poly((10, 4), (54, 4), (60, 10), (60, 54), (54, 60), (10, 60), (4, 54), (4, 10))
    m = F.part(sh, col, ol='#141018', light=.35, dark=.4, tex=.3)
    F.part(poly((13, 10), (51, 10), (54, 13), (54, 51), (51, 54), (13, 54), (10, 51), (10, 13)), dk(col, .25) if not lite else lt(col, .05),
           outline=False, light=.05, dark=.35, tex=.2, clip=m)
    rng = random.Random(3)
    for _ in range(4):
        x, y = rng.uniform(8, 56), rng.uniform(8, 56)
        F.px(x, y, lt(col, .25))
    F.line(7, 50, 11, 47, dk(col, .5))
    F.line(11, 47, 12, 44, dk(col, .5))


def sym_shapes(nm, k=1.):
    c = 32
    if nm == 'lua':
        return ('ring', ell(c - 1, c, 15 * k, 15 * k, n=28), ell(c + 6 * k, c - 4 * k, 12.5 * k, 12.5 * k, n=26))
    if nm == 'estrela':
        pts = []
        for i in range(12):
            a = -math.pi / 2 + i * math.pi / 6
            r = (17 if i % 2 == 0 else 7) * k
            pts.append((c + r * math.cos(a), c + r * math.sin(a)))
        return ('poly', [pts], None)
    if nm == 'caveira':
        bones = limb(c - 13 * k, c + 6 * k, c + 13 * k, c + 16 * k, 3.4 * k) + limb(c + 13 * k, c + 6 * k, c - 13 * k, c + 16 * k, 3.4 * k)
        for (x, y) in ((-13, 6), (13, 16), (13, 6), (-13, 16)):
            bones += ell(c + x * k + (-1.5 if x < 0 else 1.5) * k, c + y * k - 1.2 * k, 2.2 * k, 2.2 * k) + \
                ell(c + x * k + (-1.5 if x < 0 else 1.5) * k, c + y * k + 1.4 * k, 2.2 * k, 2.2 * k)
        skull = ell(c, c - 5 * k, 11 * k, 10 * k, n=24) + poly((c - 6 * k, c), (c + 6 * k, c), (c + 5.5 * k, c + 8 * k), (c - 5.5 * k, c + 8 * k))
        return ('skull', skull, bones)
    if nm == 'cruz':
        a, b = 5 * k, 15 * k
        return ('poly', poly((c - a, c - b), (c + a, c - b), (c + a, c - a), (c + b, c - a), (c + b, c + a), (c + a, c + a), (c + a, c + b),
                             (c - a, c + b), (c - a, c + a), (c - b, c + a), (c - b, c - a), (c - a, c - a)), None)


def _off(sh, d=1):
    return [[(x + d, y + d) for x, y in p] for p in sh]


def draw_symbol(F, nm, col, ol, lightv=.35, k=1., engraved=False):
    kind, a, b = sym_shapes(nm, k)
    if engraved:  # entalhe: borda clara embaixo-direita
        if kind == 'ring':
            ringpart(F, _off(a), _off(b), ol, outline=False, shade=False)
        else:
            F.part(_off(a + (b or [])), ol, outline=False, shade=False)
    oln = None if engraved else ol
    if kind == 'ring':
        ringpart(F, a, b, col, ol=oln, outline=not engraved, light=lightv, dark=.3)
    elif kind == 'skull':
        F.part(b, dk(col, .15) if not engraved else col, ol=oln, outline=not engraved, light=lightv)
        F.part(a, col, ol=oln, outline=not engraved, light=lightv, dark=.3)
        c = 32
        ec = '#141018' if not engraved else dk(col, .5)
        F.part(ell(c - 4.5 * k, c - 4 * k, 3 * k, 3.2 * k) + ell(c + 4.5 * k, c - 4 * k, 3 * k, 3.2 * k), ec, outline=False, shade=False)
        F.part(poly((c, c + 1 * k), (c + 1.6 * k, c + 3.5 * k), (c - 1.6 * k, c + 3.5 * k)), ec, outline=False, shade=False)
        for x in (-3, -1, 1, 3):
            F.line(c + x * k, c + 5.5 * k, c + x * k, c + 7.5 * k, ec)
    else:
        F.part(a, col, ol=oln, outline=not engraved, light=lightv, dark=.3)


MEM = [('lua', '#c8323a', '#ff9a9a', '#3a0a10'), ('estrela', '#f2c230', '#fff0a0', '#3a2808'),
       ('caveira', '#e8e2d0', '#ffffff', '#2a1a34'), ('cruz', '#4fb06a', '#a8f0b0', '#0e2a14')]


def pz_mem(i, on):
    F = Frame(64, 64)
    nm, c, hl, ol = MEM[i]
    stone_tile(F, '#5a5462' if on else '#3e3a46', lite=on)
    if on:
        glow(F, 32, 32, 28, c if nm != 'caveira' else '#8a5ac8', 170, layer=F.a)
        draw_symbol(F, nm, c, ol, lightv=.45)
        sparkle(F, 50, 14, 2, hl)
        sparkle(F, 15, 50, 1, hl)
    else:
        draw_symbol(F, nm, '#2a2630', '#6a6474', engraved=True)
    return over(F.a, F.fx)


def pz_light(on):
    F = Frame(64, 64)
    F.part(poly((4, 4), (60, 4), (60, 60), (4, 60)), '#4a5056', ol='#101316', light=.35, dark=.4, tex=.2)
    F.part(poly((9, 9), (55, 9), (55, 55), (9, 55)), '#1e2226', ol='#101316', light=.05, dark=.1)
    for (x, y) in ((6, 6), (57, 6), (6, 57), (57, 57)):
        F.px(x, y, '#c9ced4')
        F.px(x + 1, y + 1, '#2a2e33')
    F.part(ell(32, 32, 19, 19, n=36), '#6b747a', ol='#101316', light=.4)
    if on:
        F.part(ell(32, 32, 15, 15, n=32), '#ffd36a', ol='#6a4a10', light=.5, dark=.25)
        F.part(ell(30, 30, 9, 9, n=24), '#fff4c0', outline=False, shade=False)
        for k in range(5):
            F.line(25 + k * 3, 33 + (k % 2) * 2, 26.5 + k * 3, 33 + ((k + 1) % 2) * 2, '#c08a20')
        F.line(25, 33, 25, 40, '#8a6a20')
        F.line(39, 33, 39, 40, '#8a6a20')
        F.px(26, 25, '#ffffff')
        F.px(27, 24, '#ffffff')
        glow(F, 32, 32, 34, '#ffd36a', 120)
    else:
        F.part(ell(32, 32, 15, 15, n=32), '#2e3a3e', ol='#0c1214', light=.15, dark=.35)
        for k in range(5):
            F.line(25 + k * 3, 33 + (k % 2) * 2, 26.5 + k * 3, 33 + ((k + 1) % 2) * 2, '#4a4a40')
        F.line(25, 33, 25, 40, '#3a3a34')
        F.line(39, 33, 39, 40, '#3a3a34')
        F.part(poly((24, 23), (29, 21), (26, 27), (23, 28)), '#7a8c92', outline=False, shade=False)
        F.px(37, 41, '#5a6a70')
    return over(F.a, F.fx)


def card_shape():
    return poly((14, 5), (50, 5), (52, 7), (52, 57), (50, 59), (14, 59), (12, 57), (12, 7))


def pz_card(face=None):
    F = Frame(64, 64)
    sh = shadow_layer(34, 20, 2.5, alpha=70, w=64, h=64, gy=59)
    sh[..., :3] = (28, 16, 40)
    if face is None:
        m = F.part(card_shape(), '#6a1420', ol='#1a0408', light=.3, dark=.3)
        F.part(poly((16, 9), (48, 9), (48, 55), (16, 55)), GOLD, outline=False, light=.4, clip=m)
        mm = F.part(poly((18, 11), (46, 11), (46, 53), (18, 53)), '#4a0e18', outline=False, shade=False)
        ys, xs = np.mgrid[0:64, 0:64]
        lat = (((xs + ys) % 7 == 0) | ((xs - ys) % 7 == 0)) & mm
        F.a[lat, :3] = hexc('#7a1c2a')
        ringpart(F, ell(32, 32, 10, 10, n=24), ell(32, 32, 7.5, 7.5, n=20), GOLD, ol='#3a2808', light=.45)
        F.part(ell(32, 32, 7.5, 7.5, n=20), RUNE, ol='#3a0a10', light=.45,
               marks=[(ell(34, 34, 2, 1.6), '#8a1e26'), (ell(29, 30, 1.4, 1.2), '#8a1e26')])
        for (x, y) in ((20, 15), (44, 15), (20, 49), (44, 49)):
            F.part(poly((x, y - 3), (x + 2, y), (x, y + 3), (x - 2, y)), GOLD, ol='#3a2808', light=.4)
    else:
        m = F.part(card_shape(), '#e8dcc0', ol='#3a3020', light=.3, dark=.3, tex=.15,
                   marks=[(poly((44, 50), (52, 46), (52, 57), (46, 57)), '#cfc0a0')])
        F.part(poly((15, 8), (49, 8), (49, 56), (15, 56)), '#c8b898', outline=False, shade=False, clip=m)
        F.part(poly((16, 9), (48, 9), (48, 55), (16, 55)), '#e8dcc0', outline=False, shade=False, clip=m, tex=.15)
        if face == 'lua':
            draw_symbol(F, 'lua', '#c8323a', '#3a0a10', k=.85)
        elif face == 'caveira':
            draw_symbol(F, 'caveira', '#8a8070', '#2a2020', k=.85)
        else:
            draw_key(F, Pen(23, 23, .62, 45), 'ouro')
        F.px(50, 55, '#b0a080')
    return over(over(sh, F.a), F.fx)


PIPE_DIRS = {'reto': 'LR', 'curva': 'RD', 'T': 'LRD', 'entrada': 'R', 'saida': 'L'}


def pz_pipe(kind, wet):
    F = Frame(64, 64)
    F.part(poly((1, 1), (63, 1), (63, 63), (1, 63)), '#33383d', ol='#101316', light=.25, dark=.35, tex=.25)
    F.line(3, 3, 61, 3, '#4a5056')
    for (x, y) in ((4, 4), (59, 4), (4, 59), (59, 59)):
        F.px(x, y, '#c9ced4')
        F.px(x + 1, y + 1, '#1e2226')
    dirs = PIPE_DIRS[kind]
    seg = {'L': (0, 24, 32, 40), 'R': (32, 24, 64, 40), 'U': (24, 0, 40, 32), 'D': (24, 32, 40, 64)}
    ch = {'L': (0, 29, 32, 35), 'R': (32, 29, 64, 35), 'U': (29, 0, 35, 32), 'D': (29, 32, 35, 64)}
    outer = []
    for d in dirs:
        x0, y0, x1, y1 = seg[d]
        outer += poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))
    outer += ell(32, 32, 9.5, 9.5, n=24)
    pm = F.part(outer, '#7d848c', ol='#14181c', light=.45, dark=.4, tex=.1)
    inner = []
    for d in dirs:
        x0, y0, x1, y1 = ch[d]
        inner += poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))
    inner += ell(32, 32, 3.5, 3.5, n=12)
    wc = '#3fa8ff' if wet else '#22262a'
    F.part(inner, wc, outline=False, light=.3 if wet else .05, dark=.2, clip=pm)
    if wet:
        for d in dirs:
            x0, y0, x1, y1 = ch[d]
            if d in 'LR':
                F.line(x0, 30, x1 - 1, 30, '#bfe8ff')
            else:
                F.line(30, y0, 30, y1 - 1, '#bfe8ff')
        glow(F, 32, 32, 22, '#3fa8ff', 70)
    # flanges
    fl = {'L': (1, 21, 6, 43), 'R': (58, 21, 63, 43), 'D': (21, 58, 43, 63)}
    for d in dirs:
        x0, y0, x1, y1 = fl[d]
        F.part(poly((x0, y0), (x1, y0), (x1, y1), (x0, y1)), '#8d969c', ol='#14181c', light=.5)
    for d in dirs:  # parafusos nas flanges
        for (x, y) in {'L': ((3, 23), (3, 40)), 'R': ((60, 23), (60, 40)), 'D': ((23, 60), (40, 60))}[d]:
            F.px(x, y, '#e2e6ea')
    if kind in ('entrada', 'saida'):
        cx = 18 if kind == 'entrada' else 46
        F.part(ell(cx, 32, 14, 14, n=30), '#4a5056', ol='#101316', light=.35)
        if kind == 'entrada':
            ringpart(F, ell(cx, 32, 11, 11, n=26), ell(cx, 32, 8, 8, n=22), '#b8322a', ol='#2a0a08', light=.45)
            for a in (0, 60, 120):
                F.part(limb(cx + 9 * math.cos(math.radians(a)), 32 + 9 * math.sin(math.radians(a)),
                            cx - 9 * math.cos(math.radians(a)), 32 - 9 * math.sin(math.radians(a)), 2.2), '#b8322a', ol='#2a0a08')
            F.part(ell(cx, 32, 4, 4), '#8d969c', ol='#1e2328', light=.5)
        else:
            gm = F.part(ell(cx, 32, 11, 11, n=26), '#1e5a90' if wet else '#14181c', ol='#101316', light=.3 if wet else .05)
            for k in range(-8, 9, 4):
                F.part(poly((cx + k - .8, 21), (cx + k + .8, 21), (cx + k + .8, 43), (cx + k - .8, 43)), '#6b747a', clip=gm, outline=False)
            if wet:
                glow(F, cx, 32, 16, '#7fd0ff', 120)
        # seta ▶
        ax = 6 if kind == 'saida' else 40
        ay = 10
        F.part(poly((ax + 2, ay - 5), (ax + 11, ay), (ax + 2, ay + 5)) + poly((ax - 3, ay - 2), (ax + 3, ay - 2), (ax + 3, ay + 2), (ax - 3, ay + 2)),
               '#3fa8ff' if wet else '#f2c230', ol='#101316', light=.45)
    return over(F.a, F.fx)


WIRE = [('#c8323a', '#ff7a7a'), ('#3a6fd0', '#8ab0ff'), ('#e8c030', '#fff0a0'), ('#3f9a4a', '#8fe09a'), ('#e8e4dc', '#ffffff')]


def pz_wire(i):
    F = Frame(64, 64)
    c, hl = WIRE[i]
    pts = [(-4, 40), (10, 39), (22, 33), (34, 31)]
    F.part(chain(pts, 9), c, ol=mix(C(c) * .3, INK, .6), light=.4, dark=.4)
    for k in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[k], pts[k + 1]
        F.line(x0, y0 - 2.5, x1, y1 - 2.5, hl)
    for x in (8, 16):
        F.line(x, 36, x + 1, 43, mix(C(c), INK, .4))
    # terminal de latão
    F.part(poly((32, 26), (44, 27), (44, 35), (32, 36)), '#d9a05a', ol='#3a2808', light=.5, dark=.35)
    F.line(36, 27, 36, 35, '#a06a2a')
    F.line(40, 27, 40, 35, '#a06a2a')
    F.line(33, 28, 43, 28, '#fff0c0')
    # cobre descascado
    for k, (dx, dy) in enumerate(((10, -4), (12, -1), (12, 2), (10, 5))):
        F.line(44, 29 + k * 2, 44 + dx, 29 + k * 2 + dy * .6, '#e08a50')
        F.px(44 + dx, 29 + k * 2 + dy * .6, '#ffc090')
    sparkle(F, 57, 25, 2, hl)
    return over(F.a, F.fx)


def pz_button(n):
    F = Frame(64, 64)
    F.part(poly((5, 6), (59, 6), (59, 60), (5, 60)), '#1e2226', ol='#0a0c0e', light=.1, dark=.2)
    m = F.part(poly((8, 7), (56, 7), (56, 55), (8, 55)), '#6b747a', ol='#14181c', light=.4, dark=.45, tex=.2)
    F.part(poly((12, 11), (52, 11), (52, 51), (12, 51)), '#5a6268', outline=False, light=.05, dark=.15, clip=m, tex=.15)
    for (x, y) in ((10, 9), (53, 9), (10, 52), (53, 52)):
        F.px(x, y, '#c9ced4')
        F.px(x + 1, y + 1, '#2a2e33')
    g = DIG[str(n)]
    sc = 4
    x0, y0 = 32 - 10, 31 - 14
    sq = []
    rng = random.Random(n)
    for j, row in enumerate(g):
        for i, b in enumerate(row):
            if b == '1':
                jx = rng.choice((0, 0, 0, .5, -.5))
                X, Y = x0 + i * sc + jx, y0 + j * sc
                sq.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
    F.part(_off(sq, 1.5), '#22262a', outline=False, shade=False)
    F.part(sq, '#f4efe6', ol='#1e1a16', light=.2, dark=.25)
    F.line(14, 53, 50, 53, '#3e444a')
    return over(F.a, F.fx)


# ================================================================ respawn (128x192)

def beam(F, layer, cx, top, gy, widths, alpha_k=1.):
    """widths: lista (meia-largura, cor, alpha) de fora para dentro."""
    for hw, col, a in widths:
        fx_layer_shape(F, poly((cx - hw, top), (cx + hw, top), (cx + hw, gy), (cx - hw, gy)), col, int(a * alpha_k), layer=layer)


def respawn_frame(kind, i):
    H = 192
    gy = 180
    F = Frame(128, H)
    back = F.layer()
    cx = 64
    rng = random.Random(40 + i)
    sh = None
    if i == 0:
        beam(F, back, cx, 0, gy, [(6, '#f2c230', 90), (3, '#fff6c8', 210)])
        fx_layer_shape(F, ell(cx, gy, 14, 3.5), '#f2c230', 140, layer=back)
        for k in range(4):
            sparkle(F, cx + rng.uniform(-10, 10), rng.uniform(40, 170), 1 + k % 2, '#fff6c8')
    elif i in (1, 2):
        beam(F, back, cx, 0, gy, [(20, '#f2c230', 55), (14, '#f2c230', 95), (8, '#fff6c8', 160), (4, '#ffffff', 220)])
        for y in range(8, gy, 22):
            yy = y + (i * 11) % 22
            fx_layer_shape(F, poly((cx - 15, yy), (cx + 15, yy), (cx + 15, yy + 2), (cx - 15, yy + 2)), '#fff6c8', 110, layer=back)
        fx_layer_shape(F, ell(cx, gy, 30, 7), '#f2c230', 120, layer=back)
        fx_layer_shape(F, ell(cx, gy, 18, 4), '#fff6c8', 170, layer=back)
        for k in range(7):
            sparkle(F, cx + rng.uniform(-22, 22), rng.uniform(20, 175), 1 + k % 3, '#fff6c8')
    elif i == 3:
        beam(F, back, cx, 0, gy, [(16, '#ffe27a', 70), (8, '#fff6c8', 150), (3, '#ffffff', 190)])
        fx_layer_shape(F, ell(cx, gy, 30, 7), '#f2c230', 100, layer=back)
    elif i == 4:
        beam(F, back, cx, 0, gy, [(10, '#ffe27a', 70), (5, '#fff6c8', 140)])
    elif i == 5:
        beam(F, back, cx, 0, gy, [(4, '#ffe27a', 60), (2, '#fff6c8', 110)])
        for k in range(6):
            sparkle(F, cx + rng.uniform(-30, 30), rng.uniform(60, 165), 1 + k % 2, '#fff6c8')
    if i >= 2:
        air = i == 2
        cgy = 177.5 - (72 if air else 0)
        cam = Cam(ox=61.5, gy=cgy)
        if kind == 'lua':
            c0 = cam.p(0, D / 2, HB / 2 + 6)
            glow(F, c0[0], c0[1], 50, '#c8323a', 90, layer=back)
        draw_chest(F, cam, kind, dict(lid=0))
        if air:
            sh = shadow_layer(66, 26, 3.5, alpha=70, w=128, h=H, gy=gy - 1)
            for k in range(5):  # linhas de velocidade
                x = 28 + k * 18
                F.line(x, 30 + (k % 2) * 6, x, 46 + (k % 2) * 6, '#fff6c8', F.fx)
        else:
            sh = shadow_layer(66, 44, 5.2, alpha=110, w=128, h=H, gy=gy - 1)
        sh[..., :3] = (28, 16, 40)
    if i == 3:
        for (x, y, r) in ((18, 176, 6), (30, 179, 4.5), (110, 175, 6), (98, 179, 4.5), (10, 168, 3.5), (118, 166, 3.5)):
            dust(F, x, y, r)
        for k in range(48):
            a = 2 * math.pi * k / 48
            x, y = cx + 58 * math.cos(a), gy - 1 + 11 * math.sin(a)
            if 0 <= x < 128 and 0 <= y < H:
                F.px(x, y, '#fff4d0', F.fx)
        for (x, y) in ((12, 160), (116, 158), (24, 150), (104, 152)):
            F.part(ell(x, y, 1.6, 1.2), '#77736e', ol='#2a2622', layer=F.fx)
    if i == 4:
        glow(F, cx, 140, 56, '#fff0a0', 170)
        star(F, 30, 112, '#f2c230', 4)
        star(F, 100, 104, '#f2c230', 3)
        sparkle(F, 64, 96, 4)
        sparkle(F, 18, 140, 2)
        sparkle(F, 110, 136, 3)
    out = np.zeros((H, 128, 4), np.uint8)
    if sh is not None:
        out = over(out, sh)
    out = over(out, back)
    out = over(out, F.a)
    out = over(out, F.fx)
    return out


# ================================================================ main

STATES = ['closed', 'shake1', 'shake2', 'key1', 'key2', 'open1', 'open2', 'full', 'empty', 'jam1', 'jam2']


def build(which):
    os.makedirs(OUT, exist_ok=True)
    if 'chests' in which:
        for kind in ('madeira', 'ferro', 'lua'):
            strip([chest_frame(kind, s) for s in STATES]).save(os.path.join(OUT, 'bau_%s.png' % kind))
    if 'icons' in which:
        keys = [key_icon(k) for k in ('bronze', 'prata', 'ouro')] + [key_icon(k, True) for k in ('bronze', 'prata', 'ouro')] + [keyring_icon()]
        strip(keys).save(os.path.join(OUT, 'bau_chaves.png'))
        strip([gazua_icon(False), gazua_icon(True)]).save(os.path.join(OUT, 'bau_gazua.png'))
        grid([loot_icon(n) for n in LOOT_ORDER], 6).save(os.path.join(OUT, 'bau_loot.png'))
    if 'puzzle' in which:
        pz = [pz_dial(), pz_needle(), pz_pin()]
        pz += [pz_mem(i, False) for i in range(4)] + [pz_mem(i, True) for i in range(4)]
        pz += [pz_light(False), pz_light(True)]
        pz += [pz_card(None), pz_card('lua'), pz_card('caveira'), pz_card('chave')]
        pz += [pz_pipe(k, False) for k in ('reto', 'curva', 'T', 'entrada', 'saida')]
        pz += [pz_pipe(k, True) for k in ('reto', 'curva', 'T', 'entrada', 'saida')]
        pz += [pz_wire(i) for i in range(5)]
        pz += [pz_button(n) for n in range(1, 7)]
        grid(pz, 8).save(os.path.join(OUT, 'bau_puzzle.png'))
    if 'respawn' in which:
        grid([respawn_frame(k, i) for k in ('madeira', 'ferro', 'lua') for i in range(6)], 6).save(os.path.join(OUT, 'bau_respawn.png'))


def preview(name, scale=3):
    im = Image.open(os.path.join(OUT, name + '.png'))
    bg = Image.new('RGBA', im.size, (42, 34, 52, 255))
    bg.alpha_composite(im)
    bg.resize((im.width * scale, im.height * scale), Image.NEAREST).save(os.path.join(HERE, '_prev_%s.png' % name))


if __name__ == '__main__':
    # uso: python obj_baus.py            -> gera tudo
    #      python obj_baus.py dev chests bau_madeira:2   -> gera parte e salva prévias ampliadas
    args = sys.argv[1:]
    if args and args[0] == 'dev':
        which = [a for a in args[1:] if ':' not in a]
        build(which)
        for a in args[1:]:
            if ':' in a:
                n, s = a.split(':')
                preview(n, int(s))
    else:
        build(['chests', 'icons', 'puzzle', 'respawn'])
    print('ok')
