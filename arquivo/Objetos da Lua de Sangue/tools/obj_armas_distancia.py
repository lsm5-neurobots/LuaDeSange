"""Grupo armas_distancia — armas de fogo e arco (abas Tiro TIR-01..10 e Arco ARC-01..13).
Rodar de dentro de tools/:  python obj_armas_distancia.py
Gera sprites/arm_*.png (tiras horizontais).
"""
import math
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pixkit import (Frame, ell, poly, limb, chain, Xf, rp, hexc, mix, dilate, shift, over, compose,
                    strip, glow, shadow_layer, NIGHT, MOON, INK)

OUT = os.path.join(HERE, '..', 'sprites')
I = Xf()

# ---------------- paleta compartilhada ----------------
STEEL = '#3a3c44'; STEEL2 = '#2e3038'; STEEL_D = '#24262c'; STEEL_L = '#7a7e8a'; SCR = '#8a8e98'
BARREL = '#5a5e68'; BARREL_L = '#a8aeb8'; TUBE = '#44474f'
WOOD = '#8a5a30'; WOOD_D = '#6a4220'; WOOD_L = '#a8723e'
WOOD2 = '#7a4a24'; WOOD2_D = '#5a3418'; WOOD2_L = '#9a6434'
GRIP = '#4a3a30'; TAPE = '#1c1c22'; TAPE_L = '#4a4a56'; SILVER = '#a8a8a4'; SILVER_D = '#7a7a76'
RUST = '#8a4e2e'; BRASS = '#e3b23c'; BRASS_D = '#b8861a'; BRASS_L = '#fff0b0'; COPPER = '#c27a3a'
SHELL = '#c0262d'; SHELL_D = '#8a1a20'; ROPE = '#b59a62'; RUBBER = '#1e1a18'
SHAFT = '#b08850'; SHAFT_L = '#d4b07a'; HEAD = '#8a8e98'; HEAD_L = '#d8dce4'
FEATH_R = '#c8323a'; FEATH_C = '#efe6cc'; GOLD = '#f2c230'; GOLD_D = '#b8861a'; GOLD_L = '#fff6c8'
CREAM = '#f4efe6'; RED = '#c8323a'; RED_L = '#ff5a5a'


def C(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def R(x0, y0, x1, y1):
    return [[(x0, y0), (x1, y0), (x1, y1), (x0, y1)]]


def ln(F, a, b, c, m=None, T=None, layer=None, alpha=255):
    """linha de pixels (opcional: transformação T e recorte pela máscara m)."""
    if T is not None:
        a, b = T.p(*a), T.p(*b)
    L = F.a if layer is None else layer
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    cc = C(c)
    for k in range(n + 1):
        t = k / n
        x, y = int(round(a[0] + (b[0] - a[0]) * t)), int(round(a[1] + (b[1] - a[1]) * t))
        if 0 <= x < F.w and 0 <= y < F.h and (m is None or m[y, x]):
            L[y, x, :3] = cc
            L[y, x, 3] = alpha


def pt(F, p, c, m=None, T=None, layer=None, alpha=255):
    if T is not None:
        p = T.p(*p)
    x, y = int(round(p[0])), int(round(p[1]))
    L = F.a if layer is None else layer
    if 0 <= x < F.w and 0 <= y < F.h and (m is None or m[y, x]):
        L[y, x, :3] = C(c)
        L[y, x, 3] = alpha


def hole(F, m):
    F.a[m] = 0


def inner(m):
    """máscara sem a borda (para riscos não pisarem no contorno)."""
    return m & shift(m, 1, 0) & shift(m, -1, 0) & shift(m, 0, 1) & shift(m, 0, -1)


def fxp(F, shapes, col, alpha=255, **kw):
    tmp = F.layer()
    F.part(shapes, col, layer=tmp, **kw)
    tmp[..., 3] = (tmp[..., 3].astype(float) * alpha / 255).astype(np.uint8)
    F.fx[:] = over(F.fx, tmp)


def hashm(w, h, seed, frac):
    yy, xx = np.mgrid[0:h, 0:w]
    v = ((xx * 73856093 + seed * 83492791) ^ (yy * 19349663 + seed * 2654435)) % 101
    return v < int(101 * frac)


def sparkle_fx(F, x, y, r=3, col=GOLD_L):
    x, y = int(round(x)), int(round(y))
    for d in range(-r, r + 1):
        a = 255 if abs(d) < 2 else 160
        pt(F, (x + d, y), col, layer=F.fx, alpha=a)
        pt(F, (x, y + d), col, layer=F.fx, alpha=a)
    pt(F, (x, y), '#ffffff', layer=F.fx)


def drop_shadow(F, dx=2, dy=3, alpha=95, grow=1):
    """sombra roxa escura com a forma do objeto (objeto deitado no chão)."""
    m = F.a[..., 3] > 0
    s = shift(m, dx, dy)
    for _ in range(grow):
        s = dilate(s)
    sh = F.layer()
    sh[s, :3] = (mix(NIGHT, np.zeros(3), .55)).astype(np.uint8)
    sh[s, 3] = alpha
    return sh


def fit(F, cx, bottom):
    """desloca o desenho para centralizar em x e apoiar o pé em `bottom`."""
    m = F.a[..., 3] > 0
    ys, xs = np.nonzero(m)
    dx = int(round(cx - (xs.min() + xs.max()) / 2))
    dy = int(bottom - ys.max())
    F.a = np.roll(F.a, (dy, dx), (0, 1))
    F.fx = np.roll(F.fx, (dy, dx), (0, 1))


# ================================================================ clarão / fumaça (TIR-01)

def muzzle_flash(F, p, ang, L, w, alpha=255, spikes=1, core=1.0, glow_a=110):
    A = Xf(0, 0, ang, p[0], p[1])
    if glow_a:
        glow(F, p[0] + math.cos(math.radians(ang)) * L * .3, p[1] + math.sin(math.radians(ang)) * L * .3,
             L * .62, '#ff9a2a', glow_a)
    body = poly((-1, 0), (L * .3, -w), (L * .55, -w * .35), (L, 0), (L * .55, w * .35), (L * .3, w))
    sp = poly((L * .08, -w * .4), (L * .22, -w * 1.9), (L * .34, -w * .5)) + \
        poly((L * .08, w * .4), (L * .22, w * 1.9), (L * .34, w * .5))
    if spikes >= 2:
        sp += poly((L * .45, -w * .3), (L * .62, -w * 1.25), (L * .66, -w * .2)) + \
            poly((L * .45, w * .3), (L * .62, w * 1.25), (L * .66, w * .2))
    fxp(F, A(body + sp), '#ffd24a', alpha, shade=False, ol='#e0601a')
    fxp(F, A(poly((0, 0), (L * .3, -w * .58), (L * .72, 0), (L * .3, w * .58))), '#fff6c0', alpha, shade=False, outline=False)
    tmp = F.layer()
    F.flat(A(ell(L * .16, 0, L * .13 * core + .8, w * .32 * core + .5)), '#ffffff', layer=tmp)
    tmp[..., 3] = (tmp[..., 3].astype(float) * alpha / 255).astype(np.uint8)
    F.fx[:] = over(F.fx, tmp)


def smoke_puffs(F, pts, alpha):
    sh = []
    for x, y, r in pts:
        sh += ell(x, y, r, r * .85)
    fxp(F, sh, '#cfc8da', alpha, outline=False, light=.45, dark=.18, tex=.08)
    sh2 = []
    for x, y, r in pts:
        sh2 += ell(x - r * .25, y - r * .3, r * .55, r * .45)
    fxp(F, sh2, '#ebe6f2', int(alpha * .7), outline=False, shade=False)


# ================================================================ PISTOLA

def gun_pistola(F, T, st):
    r = st.get('slide', 0)
    # guarda-mato
    F.part(T(ell(57, 33.5, 7.5, 5.2)), STEEL2, shade=False)
    hole(F, F.mask(T(ell(57, 33, 5.2, 3.2))))
    # punho
    gsh = poly((31, 26), (50, 26), (47, 55), (28, 56), (25, 52))
    mg = F.part(T(gsh), GRIP, light=.25, tex=.25)
    ys, xs = np.nonzero(inner(mg))
    for y, x in zip(ys, xs):
        if (x + y) % 3 == 0:
            F.a[y, x, :3] = (F.a[y, x, :3] * .78).astype(np.uint8)
    F.part(T(R(26, 54.5, 48, 58)), STEEL_D, light=.3)                       # base do pente
    ln(F, (28, 56), (46, 56), '#4a4e58', T=T)
    # fita isolante em volta do punho
    gclip = dilate(mg)
    for y0 in (36, 45):
        tm = F.part(T(poly((22, y0 + .6), (53, y0 - .6), (53, y0 + 2.6), (22, y0 + 3.6))), TAPE, clip=gclip, light=.12)
        ln(F, (24, y0 + .8), (52, y0 - .3), TAPE_L, m=inner(tm), T=T)
    F.part(T(poly((26.5, 46), (21, 49), (22, 51), (27, 48.5))), TAPE, light=.15)   # ponta solta
    pt(F, (23, 49), TAPE_L, T=T)
    pt(F, (41, 30), '#c9c3b0', T=T); pt(F, (42, 30), '#8a8478', T=T)          # parafuso
    # armação
    mf = F.part(T(R(42, 25, 93, 31)), STEEL2, light=.25, tex=.1)
    for x0 in (74, 79, 84):
        ln(F, (x0, 28), (x0 + 3, 28), '#16171b', m=mf, T=T)
    pt(F, (66, 28), '#101014', T=T); pt(F, (67, 28), '#3a3c44', T=T)            # parafuso faltando
    # gatilho
    F.part(T(limb(55.5, 30, 54, 35.5, 2.2, 1.6)), SCR, ol='#202228', shade=False)
    # cano e ferrolho
    F.part(T(R(95, 16, 101.5, 23)), STEEL_D, light=.3)
    pt(F, (101, 19), '#0a0a0c', T=T); pt(F, (101, 20), '#0a0a0c', T=T)
    ms = F.part(T(R(22 + r, 13, 97 + r, 25)), STEEL, light=.35, tex=.14)
    ln(F, (23 + r, 14), (96 + r, 14), STEEL_L, m=ms, T=T)
    ln(F, (23 + r, 24), (96 + r, 24), STEEL_D, m=ms, T=T)
    ln(F, (88 + r, 15), (96 + r, 15), '#9aa0ac', m=ms, T=T)
    for x0 in range(25, 38, 2):                                               # serrilhado
        ln(F, (x0 + r, 16), (x0 + r, 23), '#1c1d22', m=ms, T=T)
        ln(F, (x0 + 1 + r, 16), (x0 + 1 + r, 23), '#565a66', m=ms, T=T)
    mp = F.mask(T(R(60 + r, 13, 72 + r, 16.5)))                                # janela de ejeção
    F.a[mp & ms, :3] = (14, 14, 18)
    pt(F, (66 + r, 15), BRASS_D, m=ms, T=T); pt(F, (67 + r, 15), BRASS, m=ms, T=T)
    for a, b in (((41, 18), (49, 20)), ((76, 17), (84, 16)), ((66, 21), (71, 22)), ((52, 22), (55, 21)), ((86, 20), (90, 21))):
        ln(F, (a[0] + r, a[1]), (b[0] + r, b[1]), SCR, m=inner(ms), T=T)
    for p in ((73, 18), (74, 18), (74, 19), (58, 22), (85, 22), (86, 23), (31, 21)):
        pt(F, (p[0] + r, p[1]), RUST, m=inner(ms), T=T)
    pt(F, (75 + r, 19), '#b06a3a', m=inner(ms), T=T)
    # miras e cão
    F.part(T(poly((90 + r, 12.5), (91 + r, 10.5), (93 + r, 10.5), (93.5 + r, 12.5))), STEEL_D, shade=False, outline=False)
    F.part(T(R(23 + r, 10.5, 25 + r, 12.5) + R(28 + r, 10.5, 30 + r, 12.5)), STEEL_D, shade=False, outline=False)
    pt(F, (92 + r, 10), '#e8e0c8', T=T)
    F.part(T(poly((17.5, 15), (22, 15), (22, 21), (19, 20))), STEEL_D, shade=False)
    return {'muzzle': T.p(101.5, 19.5), 'ang': T.deg}


# ================================================================ ESCOPETA

def gun_escopeta(F, T, st):
    pu = st.get('pump', 0)
    # coronha
    stk = poly((3, 29), (12, 27), (37, 23.5), (39, 29), (38, 33), (31, 36), (12, 43), (3, 45))
    ms = F.part(T(stk), WOOD, light=.3, tex=.2)
    mi = inner(ms)
    ln(F, (6, 33), (33, 27.5), WOOD_D, m=mi, T=T)
    ln(F, (7, 39), (28, 32.5), WOOD_D, m=mi, T=T)
    ln(F, (10, 36), (22, 32.5), WOOD_L, m=mi, T=T)
    ln(F, (14, 30), (26, 27.5), '#b0804a', m=mi, T=T)
    ln(F, (16, 41), (18, 37), '#3a2210', m=mi, T=T); ln(F, (18, 37), (17, 34), '#3a2210', m=mi, T=T)   # rachadura
    pt(F, (33, 34), '#c08a52', m=mi, T=T); pt(F, (9, 43), '#c08a52', m=mi, T=T)                       # lascas
    # fita prata
    for x0 in (22.5, 26.5):
        tm = F.part(T(poly((x0, 22), (x0 + 3.4, 21.6), (x0 + 3.4, 40), (x0, 41))), SILVER, clip=dilate(ms), light=.3)
        ln(F, (x0 + 1.5, 24), (x0 + 1.8, 38), SILVER_D, m=inner(tm), T=T)
        pt(F, (x0 + 1, 31), '#e0e0dc', m=tm, T=T)
    pf = F.part(T(R(0.5, 28, 4, 46.5)), RUBBER, light=.2)                        # soleira
    for y0 in range(31, 45, 3):
        ln(F, (1, y0), (3, y0), '#3a3430', m=pf, T=T)
    # guarda-mato + gatilho
    F.part(T(ell(46, 34.5, 6.5, 4.6)), STEEL2, shade=False)
    hole(F, F.mask(T(ell(46.5, 34, 4.3, 2.6))))
    F.part(T(limb(46, 30, 45, 35, 2, 1.5)), SCR, ol='#202228', shade=False)
    # tubo + cano
    mt = F.part(T(R(60, 25.5, 106, 30.5)), TUBE, light=.3, tex=.1)
    F.part(T(R(105, 25, 108.5, 31)), STEEL_D, light=.3)
    mb = F.part(T(R(60, 19.5, 113, 25)), BARREL, light=.45, tex=.1)
    ln(F, (61, 20.5), (112, 20.5), BARREL_L, m=mb, T=T)
    ln(F, (61, 24), (112, 24), '#3e4148', m=mb, T=T)
    F.part(T(R(111, 19, 115, 25.5)), '#4a4d55', light=.35)
    pt(F, (115, 22), '#0a0a0c', T=T); pt(F, (115, 23), '#0a0a0c', T=T)
    for p in ((111, 23), (112, 21), (110, 24), (113, 24), (106, 24)):
        pt(F, p, RUST, T=T)
    for a, b in (((100, 22), (106, 22)), ((107, 21), (110, 22)), ((64, 27), (68, 28)), ((98, 27), (102, 28))):
        ln(F, a, b, '#c8ccd4', m=inner(mb | mt), T=T)
    pt(F, (111.5, 18.5), '#e8c060', T=T); pt(F, (112.5, 18.5), '#8a6010', T=T)   # massa de latão
    # braçadeira
    F.part(T(R(104, 19, 106.5, 31.2)), STEEL_D, light=.4)
    # caixa da culatra
    mr = F.part(T(R(36, 19, 62, 32)), STEEL, light=.35, tex=.15)
    ln(F, (37, 20), (61, 20), STEEL_L, m=mr, T=T)
    F.a[F.mask(T(R(46, 21.5, 55.5, 25))) & mr, :3] = (14, 14, 18)
    ln(F, (47, 22), (55, 22), '#3a3c44', m=mr, T=T)
    for p in ((39, 29), (59, 29)):
        pt(F, p, '#c9c3b0', T=T)
    ln(F, (40, 26), (44, 27), SCR, m=inner(mr), T=T)
    ln(F, (57, 23), (60, 22), SCR, m=inner(mr), T=T)
    pt(F, (52, 30), RUST, m=mr, T=T); pt(F, (53, 30), RUST, m=mr, T=T)
    # telha (pump)
    mp = F.part(T(poly((70 + pu, 25), (94 + pu, 25), (95 + pu, 27), (95 + pu, 33), (93 + pu, 35), (71 + pu, 35), (69 + pu, 33))),
                WOOD, light=.3, tex=.18)
    for x0 in range(72, 85, 3):
        ln(F, (x0 + pu, 27), (x0 + pu, 33), '#5a3818', m=mp, T=T)
        ln(F, (x0 + 1 + pu, 27), (x0 + 1 + pu, 33), WOOD_L, m=mp, T=T)
    tp = F.part(T(R(86.5 + pu, 24.3, 91 + pu, 35.6)), TAPE, light=.12)
    ln(F, (87 + pu, 26), (87 + pu, 34), TAPE_L, m=inner(tp), T=T)
    pt(F, (91.5 + pu, 36), TAPE, T=T)
    return {'muzzle': T.p(115.5, 22.5), 'ang': T.deg}


# ================================================================ FUZIL

def gun_fuzil(F, T, st):
    # alça de corda (atrás de tudo)
    F.part(T(chain([(12, 42), (24, 50), (44, 52), (62, 46), (80, 33)], 2.2)), ROPE, light=.25, tex=.3)
    # coronha
    stk = poly((3, 28), (36, 24.5), (40, 26), (40, 33), (34, 35), (22, 40), (3, 44))
    ms = F.part(T(stk), WOOD2, light=.3, tex=.2)
    mi = inner(ms)
    ln(F, (5, 32), (34, 27.5), WOOD2_D, m=mi, T=T)
    ln(F, (6, 38), (24, 34), WOOD2_D, m=mi, T=T)
    ln(F, (9, 35), (28, 31), WOOD2_L, m=mi, T=T)
    pt(F, (30, 35), '#b07a46', m=mi, T=T); pt(F, (12, 29), '#b07a46', m=mi, T=T)
    F.part(T(R(0.5, 27.5, 4, 44.5)), RUBBER, light=.2)
    F.part(T(ell(12, 41.5, 1.6, 1.6)), STEEL_D, shade=False)                     # olhal da corda
    # punho
    mg = F.part(T(poly((42, 31), (51, 31), (48, 45), (40, 44.5))), WOOD2_D, light=.25, tex=.2)
    for y0 in range(34, 44, 3):
        ln(F, (42, y0), (49, y0 - 1), '#3a2010', m=inner(mg), T=T)
    # guarda-mato + gatilho
    F.part(T(ell(55, 34, 5, 3.6)), STEEL2, shade=False)
    hole(F, F.mask(T(ell(55.5, 33.6, 3, 2))))
    F.part(T(limb(55, 30.5, 54.5, 34.5, 1.8, 1.4)), SCR, ol='#202228', shade=False)
    # carregador curvo
    mag = poly((57.5, 31), (67, 31), (69.5, 38), (73, 46.5), (64.5, 50), (61, 41.5))
    mm = F.part(T(mag), '#4a4e58', light=.4, tex=.12)
    for (a0, b0) in (((59.5, 36), (68, 35)), ((61, 41), (70, 39.5)), ((62.5, 45.5), (71.5, 43.5))):
        ln(F, a0, b0, '#22242a', m=inner(mm), T=T)
        ln(F, (a0[0], a0[1] + 1), (b0[0], b0[1] + 1), '#8a8e98', m=inner(mm), T=T)
    F.part(T(poly((64, 49.3), (73.5, 45.8), (74.5, 48), (65.5, 51.5))), STEEL_D, light=.3)
    pt(F, (66, 38), RUST, m=mm, T=T); pt(F, (67, 38), RUST, m=mm, T=T)
    # guarda-mão
    mh = F.part(T(poly((67, 22.5), (93, 23), (94, 25), (94, 31), (92, 33), (67, 33.5))), WOOD2, light=.3, tex=.2)
    for x0 in (74, 80, 86):
        F.part(T(ell(x0, 28, 1.6, 2.2)), '#1a1210', shade=False, outline=False, clip=inner(mh))
    ln(F, (69, 31.5), (91, 31.5), WOOD2_D, m=inner(mh), T=T)
    ln(F, (69, 24.5), (91, 24.5), WOOD2_L, m=inner(mh), T=T)
    # cano, massa e quebra-chamas
    mb = F.part(T(R(93, 24.5, 106, 29)), BARREL, light=.45)
    ln(F, (94, 25.5), (105, 25.5), BARREL_L, m=mb, T=T)
    F.part(T(poly((96, 24.5), (99, 24.5), (98.5, 18.5), (97, 18.5))), STEEL_D, shade=False)
    mfh = F.part(T(R(105.5, 23.5, 111, 30)), STEEL_D, light=.35)
    for x0 in (107, 109):
        ln(F, (x0, 24.5), (x0, 26), '#0a0a0c', m=mfh, T=T)
        ln(F, (x0, 27.5), (x0, 29), '#0a0a0c', m=mfh, T=T)
    # caixa
    mr = F.part(T(R(38, 21.5, 68, 32)), '#34363e', light=.35, tex=.15)
    ln(F, (39, 22.5), (67, 22.5), STEEL_L, m=mr, T=T)
    F.a[F.mask(T(R(49, 24, 59, 27))) & mr, :3] = (14, 14, 18)
    pt(F, (54, 25), BRASS_D, m=mr, T=T)
    ln(F, (43, 29), (47, 30), SCR, m=inner(mr), T=T)
    for p in ((63, 30), (64, 30), (40, 30)):
        pt(F, p, RUST, m=mr, T=T)
    F.part(T(limb(60, 27, 62.5, 30.5, 1.6)), SCR, ol='#202228')                   # alavanca
    F.part(T(ell(63, 31.2, 1.3, 1.3)), '#b8bcc4', ol='#202228')
    # luneta presa com fita
    for x0 in (45, 59):
        F.part(T(R(x0, 18.5, x0 + 3, 22)), STEEL_D, shade=False)
    msc = F.part(T(R(41, 13, 66, 19) + ell(39.5, 16, 1.6, 3.3) + ell(67, 16, 2.4, 4.0)), '#22242a', light=.35)
    ln(F, (41, 14), (65, 14), '#5a5e6a', m=msc, T=T)
    pt(F, (69, 15), '#5ab0e8', T=T); pt(F, (69, 16), '#2a6aa8', T=T); pt(F, (69, 14), '#a8dcff', T=T)
    pt(F, (38, 16), '#2a6aa8', T=T)
    for x0 in (50, 54.5):
        tm = F.part(T(poly((x0, 12.2), (x0 + 2.2, 12.4), (x0 + 2.4, 22.5), (x0 - .1, 22.3))), TAPE, light=.12)
        ln(F, (x0 + 1, 13), (x0 + 1, 22), TAPE_L, m=inner(tm), T=T)
    return {'muzzle': T.p(111.5, 26.8), 'ang': T.deg}


GUNS = {
    'arm_pistola': dict(fn=gun_pistola, piv=(38, 40), rec=dict(deg=-9, dx=-5, dy=-1, st={'slide': -5}),
                        fl=dict(L=24, w=5.5, spikes=1)),
    'arm_escopeta': dict(fn=gun_escopeta, piv=(40, 38), rec=dict(deg=-7, dx=-2, dy=-1, st={'pump': -5}),
                         fl=dict(L=13, w=7, spikes=2)),
    'arm_fuzil': dict(fn=gun_fuzil, piv=(44, 38), rec=dict(deg=-5, dx=-3, dy=-2, st={}),
                      fl=dict(L=17, w=5, spikes=2)),
}


def make_gun(gid):
    g = GUNS[gid]
    W, H = 128, 64
    frames = []
    # normal
    F = Frame(W, H); g['fn'](F, I, {}); frames.append(compose(F))
    # recuo
    px, py = g['piv']
    rc = g['rec']
    F = Frame(W, H); g['fn'](F, Xf(px, py, rc['deg'], rc['dx'], rc['dy']), rc['st'])
    m = F.a[..., 3] > 0
    if m[:, 0].any():   # nunca cortar a coronha na borda
        F.a = np.roll(F.a, 2, 1)
    frames.append(compose(F))
    # disparo
    F = Frame(W, H); info = g['fn'](F, I, {})
    fl = g['fl']
    muzzle_flash(F, info['muzzle'], info['ang'], fl['L'], fl['w'], spikes=fl['spikes'])
    frames.append(compose(F))
    # no chão (3/4, deitada)
    F = Frame(W, H); g['fn'](F, Xf(64, 32, -10, 0, 0, .92, .8), {})
    fit(F, 63, 55)
    sh = drop_shadow(F, 2, 3, 100, 1)
    sx, sy = 92, 22
    m = F.a[..., 3] > 0
    ys, xs = np.nonzero(m)
    sparkle_fx(F, xs.max() - 18, ys.min() + 4, 2, '#fff6e8')
    frames.append(compose(F, shadow=sh))
    strip(frames).save(os.path.join(OUT, gid + '.png'))
    return len(frames)


# ================================================================ arm_muzzle

def make_muzzle():
    fr = []
    A0 = (6, 32)
    for L, w, sp, al, core, ga in ((15, 3.6, 1, 255, 1.3, 90), (26, 6, 1, 255, 1.0, 120), (22, 3.8, 1, 150, .6, 60)):
        F = Frame(64, 64); muzzle_flash(F, A0, 0, L, w, alpha=al, spikes=sp, core=core, glow_a=ga); fr.append(compose(F))
    for L, w, sp, al, core, ga in ((26, 6, 2, 255, 1.3, 100), (42, 9.6, 2, 255, 1.0, 140), (36, 6.4, 2, 150, .6, 70)):
        F = Frame(64, 64); muzzle_flash(F, A0, 0, L, w, alpha=al, spikes=sp, core=core, glow_a=ga); fr.append(compose(F))
    stages = [([(14, 45, 3.6), (19, 41, 4.0), (24, 43, 3.4), (28, 40, 2.8)], 200),
              ([(15, 35, 5.0), (20, 29, 5.2), (25, 25, 4.0), (29, 32, 4.4), (33, 27, 3.4)], 140),
              ([(16, 22, 6.6), (22, 14, 6.0), (28, 9, 4.6), (34, 19, 5.6), (39, 13, 4.0)], 80)]
    for pts, al in stages:
        F = Frame(64, 64)
        smoke_puffs(F, pts, al)
        fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_muzzle.png'))
    return len(fr)


# ================================================================ arm_projeteis

def tracer(F, hx, hy, L, ang=0, thick=1.0):
    """traço esticado: cabeça em (hx,hy) apontando para +x (girado por ang)."""
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    halo, halo2, core, tip = C('#ff9a2a'), C('#ffd060'), C('#ffe9a0'), C('#ffffff')
    L = max(L, 3)
    for i in range(int(L * 3) + 1):
        u = -i / 3.0 + .5
        t = min(1, max(0, 1 + (u - .5) / L))
        hw = (.9 + 1.5 * t) * thick
        for v10 in range(-35, 36):
            v = v10 / 10.0
            if abs(v) > hw:
                continue
            x = hx + u * c - v * s
            y = hy + u * s + v * c
            xi, yi = int(round(x)), int(round(y))
            if not (0 <= xi < F.w and 0 <= yi < F.h):
                continue
            if abs(v) <= .55 * thick and t > .12:
                col = mix(core, tip, min(1, t * 1.25))
                a = int(170 + 85 * t)
            elif abs(v) <= hw * .6:
                col = halo2
                a = int(70 + 170 * t)
            else:
                col = halo
                a = int(40 + 140 * t)
            if a > F.fx[yi, xi, 3]:
                F.fx[yi, xi, :3] = col
                F.fx[yi, xi, 3] = a


def bullet_hole(F, dust_stage):
    cx, cy = 32, 16
    # reboco lascado (irregular)
    pts = []
    for i in range(14):
        a = 2 * math.pi * i / 14
        r = 6.5 + (2.2 if i % 3 == 0 else 0) - (1.3 if i % 4 == 1 else 0)
        pts.append((cx + r * math.cos(a), cy + r * .8 * math.sin(a)))
    mp = F.part([pts], '#b8b0a0', light=.35, ol='#5a5048', tex=.3)
    F.part(ell(cx + .5, cy + .5, 4.3, 3.6), '#8e8a84', outline=False, light=.1, dark=.5)
    F.flat(ell(cx, cy, 2.6, 2.3), '#120c10')
    pt(F, (cx + 1, cy + 1), '#2a1e22'); pt(F, (cx - 1, cy - 1), '#050304')
    for a, L in ((-20, 9), (40, 7), (110, 6), (200, 8), (265, 5), (150, 4)):
        x1 = cx + L * math.cos(math.radians(a)); y1 = cy + L * .8 * math.sin(math.radians(a))
        xm = cx + L * .55 * math.cos(math.radians(a + 12)); ym = cy + L * .45 * math.sin(math.radians(a + 12))
        ln(F, (cx + 2.5 * math.cos(math.radians(a)), cy + 2 * math.sin(math.radians(a))), (xm, ym), '#2a2024')
        ln(F, (xm, ym), (x1, y1), '#2a2024')
    if dust_stage == 1:
        fxp(F, ell(cx - 3, cy - 6, 5, 4) + ell(cx + 5, cy - 8, 4, 3.4) + ell(cx + 10, cy - 3, 3.4, 3) + ell(cx - 9, cy - 2, 3, 2.6),
            '#c8b89a', 175, ol='#6a5a48', light=.35, dark=.2, tex=.15)
        for p in ((cx + 15, cy - 9), (cx - 14, cy - 8), (cx + 18, cy + 1), (cx + 8, cy - 14)):
            pt(F, p, '#d8d0c0', layer=F.fx); pt(F, (p[0] + 1, p[1]), '#8e8a84', layer=F.fx)
    else:
        fxp(F, ell(cx - 6, cy + 3, 4, 3) + ell(cx + 6, cy + 5, 4.4, 3) + ell(cx, cy + 8, 3.2, 2.2),
            '#c8b89a', 110, ol='#6a5a48', light=.35, dark=.2, tex=.15)
        for p in ((cx + 11, cy + 10), (cx - 12, cy + 11), (cx + 3, cy + 12)):
            pt(F, p, '#b8b0a0', layer=F.fx)


def make_projeteis():
    fr = []
    for L in (10, 18, 26):
        F = Frame(64, 32); tracer(F, 44, 16, L, thick=1.25); fr.append(compose(F))
    F = Frame(64, 32)
    for dx, dy, L, a in ((0, 0, 8, 0), (-4, -8, 6, -6), (-7, 7, 7, 5), (3, -4, 5, -3), (-2, 11, 5, 8), (-9, -12, 5, -9)):
        tracer(F, 52 + dx, 16 + dy, L, a, thick=.7)
    fr.append(compose(F))
    for st in (1, 2):
        F = Frame(64, 32); bullet_hole(F, st); fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_projeteis.png'))
    return len(fr)


# ================================================================ arm_capsulas

def casing(F, T, red=False):
    if not red:
        mb = F.part(T(R(-5.5, -2.4, 6, 2.4)), BRASS, light=.4, ol='#5a3a08')
        F.part(T(R(-7, -2.9, -5, 2.9)), BRASS_D, light=.3, ol='#5a3a08')
        ln(F, (-4.5, -1.3), (5, -1.3), BRASS_L, m=inner(mb), T=T)
        ln(F, (-4.5, 1.4), (5, 1.4), '#a8781a', m=inner(mb), T=T)
        ln(F, (6, -1.2), (6, 1.2), '#3a2408', T=T)
        pt(F, (-6, 0), '#8a6010', T=T)
    else:
        mb = F.part(T(R(-3, -3.4, 8.5, 3.4)), SHELL, light=.35, ol='#3a0e0e')
        for v in (-1.6, .2, 2.0):
            ln(F, (-2, v), (7.5, v), SHELL_D, m=inner(mb), T=T)
        ln(F, (-2, -2.6), (7.5, -2.6), '#f06a60', m=inner(mb), T=T)
        ln(F, (8.5, -2), (8.5, 2), '#5a1012', T=T)
        pt(F, (8, 0), '#3a0e0e', T=T)
        mbase = F.part(T(R(-7, -3.6, -2.5, 3.6)), BRASS, light=.4, ol='#5a3a08')
        F.part(T(R(-8, -4.1, -6.5, 4.1)), BRASS_D, ol='#5a3a08', shade=False)
        ln(F, (-6, -2.6), (-3, -2.6), BRASS_L, m=inner(mbase), T=T)


def make_capsulas():
    fr = []
    for red in (False, True):
        for deg in (0, 45, 90, 135):
            F = Frame(32, 32); casing(F, Xf(0, 0, deg, 16, 16), red)
            if not red and deg == 0:
                sparkle_fx(F, 19, 13, 1)
            fr.append(compose(F))
    for red in (False, True):
        F = Frame(32, 32); casing(F, Xf(0, 0, 8, 16, 16), red)
        fit(F, 16, 19)
        fr.append(compose(F, shadow=drop_shadow(F, 1, 2, 100, 0)))
    strip(fr).save(os.path.join(OUT, 'arm_capsulas.png'))
    return len(fr)


# ================================================================ arm_municao

def bullet_side(F, T, x, y, L=12):
    mb = F.part(T(R(x, y - 2.2, x + L, y + 2.2)), BRASS, light=.4, ol='#5a3a08')
    ln(F, (x + 1, y - 1.2), (x + L - 1, y - 1.2), BRASS_L, m=inner(mb), T=T)
    F.part(T(poly((x + L, y - 2.2), (x + L + 3, y - 1.4), (x + L + 4.5, y), (x + L + 3, y + 1.4), (x + L, y + 2.2))),
           COPPER, light=.4, ol='#4a2a10')


def pistol_mag(F, empty=False):
    T = Xf(32, 34, 12)
    body = '#6b6a66' if empty else STEEL2
    base = '#8a8882' if empty else '#4a4e58'
    if not empty:
        bullet_side(F, T, 24, 11.2, 11)
    else:
        F.part(T(R(23.5, 11, 39.5, 14)), '#9a9890', light=.3)                      # seguidor
    mb = F.part(T(R(23, 13.5, 40, 53)), body, light=.35, tex=.15)
    ln(F, (24, 14.5), (39, 14.5), '#a8acb4' if not empty else '#b8b4ac', m=mb, T=T)
    ln(F, (24.5, 16), (24.5, 52), '#5a5e6a' if not empty else '#8a8882', m=inner(mb), T=T)
    for y0 in (20, 26, 32, 38, 44):
        F.part(T(ell(35, y0, 1.4, 1.4)), '#0e0e12', shade=False, outline=False, clip=inner(mb))
        if not empty:
            pt(F, (34.6, y0 - .4), BRASS, m=mb, T=T)
        else:
            pt(F, (34.6, y0 - .4), '#5a5852', m=mb, T=T)
    ln(F, (27, 30), (29, 38), '#a8acb4' if not empty else '#c8c4bc', m=inner(mb), T=T)
    ln(F, (30, 46), (33, 47), '#a8acb4' if not empty else '#c8c4bc', m=inner(mb), T=T)
    F.part(T(R(21.5, 51.5, 41.5, 56.5)), base, light=.35)
    ln(F, (23, 52.5), (40, 52.5), '#9aa0aa' if not empty else '#c8c4bc', T=T)
    if not empty:
        pt(F, (30, 49), RUST, m=mb, T=T)


def make_municao():
    fr = []
    F = Frame(64, 64); pistol_mag(F); fr.append(compose(F))
    # cartuchos
    F = Frame(64, 64)
    for deg, dx in ((-20, -2), (20, 2), (0, 0)):
        T = Xf(0, 0, deg, 32 + dx, 58)
        mt = F.part(T(R(-5, -44, 5, -11)), SHELL, light=.35, ol='#3a0e0e', tex=.1)
        for u in (-2.5, 0, 2.5):
            ln(F, (u, -42), (u, -12), SHELL_D, m=inner(mt), T=T)
        ln(F, (-3.6, -42), (-3.6, -12), '#f06a60', m=inner(mt), T=T)
        F.part(T(poly((-5, -44), (5, -44), (3, -47), (-3, -47))), '#a81e24', light=.3, ol='#3a0e0e')
        pt(F, (0, -45.5), '#5a1012', T=T)
        mbz = F.part(T(R(-5.4, -12, 5.4, -1)), BRASS, light=.45, ol='#5a3a08')
        F.part(T(R(-6.2, -2.5, 6.2, 0.5)), BRASS_D, ol='#5a3a08', light=.3)
        ln(F, (-4, -10.5), (-4, -3), BRASS_L, m=inner(mbz), T=T)
        ln(F, (-5, -8), (5, -8), '#a8781a', m=inner(mbz), T=T)
    fr.append(compose(F))
    # carregador de fuzil (banana)
    F = Frame(64, 64)
    n = 12
    cl = [(22 + 16 * (i / n) ** 1.7, 12 + 44 * i / n) for i in range(n + 1)]
    left = [(x - 7.5, y) for x, y in cl]
    right = [(x + 7.5, y) for x, y in cl][::-1]
    mm = F.part([left + right], STEEL, light=.4, tex=.14)
    for i in (2, 4, 6, 8, 10):
        x, y = cl[i]
        x2, y2 = cl[i + 1]
        ln(F, (x - 7, y + 1), (x + 7, y + 1 - 2.5), '#1e2026', m=inner(mm))
        ln(F, (x - 7, y + 2), (x + 7, y + 2 - 2.5), '#6a6e7a', m=inner(mm))
    for i in range(1, n):
        x, y = cl[i]
        pt(F, (x - 5.5, y), '#8a8e98', m=inner(mm))
    ln(F, (24, 22), (26, 30), SCR, m=inner(mm)); ln(F, (32, 44), (34, 47), SCR, m=inner(mm))
    pt(F, (30, 36), RUST, m=mm); pt(F, (31, 36), RUST, m=mm); pt(F, (36, 52), RUST, m=mm)
    F.part(poly((30, 55), (46, 55), (46, 59), (30, 59)), STEEL_D, light=.3)
    bullet_side(F, I, 15, 9.5, 10)
    F.part(R(13.5, 11, 30.5, 13.5), STEEL_D, shade=False)    # lábios
    fr.append(compose(F))
    # pente vazio
    F = Frame(64, 64); pistol_mag(F, empty=True); fr.append(compose(F))
    # anel de recarga
    for f in (.25, .5, .75, 1.0):
        F = Frame(64, 64); ring(F, 32, 32, 22, 15, f, 'reload'); fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_municao.png'))
    return len(fr)


# ================================================================ anéis (HUD / mira)

def ring(F, cx, cy, ro, ri, frac, kind):
    h, w = F.h, F.w
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    dx, dy = xx + .5 - cx, yy + .5 - cy
    d = np.sqrt(dx * dx + dy * dy)
    ang = (np.arctan2(dx, -dy)) % (2 * math.pi)
    jag = 0
    if kind == 'red':
        jag = (np.sin(ang * 9) > 0) * 1.0
    band = (d <= ro + jag) & (d >= ri - jag * .6)
    track = band.copy()
    A = F.a
    A[track, :3] = C('#2a2230'); A[track, 3] = 235
    tr_in = track & ((d > ro - 1.2) | (d < ri + 1.0))
    A[tr_in, :3] = C('#1a141e')
    if kind in ('reload', 'charge'):
        fill = band & (ang <= frac * 2 * math.pi + 1e-6)
        base = C(CREAM)
        A[fill, :3] = base; A[fill, 3] = 255
        e1 = fill & (d > ro - 1.3)
        A[e1, :3] = C('#ffffff')
        e2 = fill & (d < ri + 1.2)
        A[e2, :3] = C('#b9b0a0')
        sh = fill & (dx + dy > 4) & (d < (ro + ri) / 2)
        A[sh, :3] = mix(A[sh, :3].astype(float), NIGHT, .25)
    elif kind == 'gold':
        A[band, :3] = C(GOLD); A[band, 3] = 255
        A[band & (dx + dy < -6), :3] = C(GOLD_L)
        A[band & (dx + dy > 8), :3] = C(GOLD_D)
        A[band & (d > ro - 1.2) & (dx + dy < 0), :3] = C('#ffffff')
    elif kind == 'red':
        A[band, :3] = C(RED); A[band, 3] = 255
        A[band & (dx + dy < -6), :3] = C(RED_L)
        A[band & (dx + dy > 8), :3] = C('#7a1a20')
    m = A[..., 3] > 0
    o = dilate(m) & ~m
    A[o, :3] = INK; A[o, 3] = 255
    if kind == 'reload':
        # ícone de bala no centro
        T = Xf(0, 0, -90, cx, cy + 7)
        bullet_side(F, T, 0, 0, 7)
        if frac >= 1:
            sparkle_fx(F, cx + 12, cy - 16, 2, '#ffffff')


def make_mira():
    fr = []
    for f in (.25, .5, .75, 1.0):
        F = Frame(64, 64); ring(F, 32, 32, 17, 11, f, 'charge'); fr.append(compose(F))
    F = Frame(64, 64)
    ring(F, 32, 32, 17, 11, 1, 'gold')
    for x, y, r in ((14, 14, 3), (50, 17, 2), (48, 50, 3), (16, 47, 2)):
        sparkle_fx(F, x, y, r)
    fr.append(compose(F, shadow=aura(F, GOLD, 130, 60)))
    F = Frame(64, 64)
    ring(F, 33, 31, 17, 11, 1, 'red')
    fr.append(compose(F, shadow=aura(F, RED_L, 110, 45)))
    # anel de queda no chão
    F = Frame(64, 64)
    sh = F.layer()
    sh[F.mask(ell(32, 33, 22, 9)), 3] = 30
    yy, xx = np.mgrid[0:64, 0:64].astype(float)
    dx, dy = (xx + .5 - 32) / 22, (yy + .5 - 32) / 9
    d = np.sqrt(dx * dx + dy * dy)
    ang = np.arctan2(dy, dx) % (2 * math.pi)
    dash = (np.floor(ang / (2 * math.pi / 16)) % 2) == 0
    band = (d <= 1.0) & (d >= .80) & dash
    F.a[band, :3] = C(CREAM); F.a[band, 3] = 255
    F.a[band & (yy < 32), :3] = C('#ffffff')
    F.a[band & (yy > 35), :3] = C('#b9b0a0')
    inner_e = (np.sqrt(((xx + .5 - 32) / 8) ** 2 + ((yy + .5 - 32) / 3.4) ** 2) <= 1) & \
        (np.sqrt(((xx + .5 - 32) / 6.6) ** 2 + ((yy + .5 - 32) / 2.2) ** 2) >= 1)
    F.a[inner_e, :3] = C(RED); F.a[inner_e, 3] = 255
    F.a[31:33, 31:33, :3] = C(RED_L); F.a[31:33, 31:33, 3] = 255
    m = F.a[..., 3] > 0
    o = dilate(m) & ~m
    F.a[o, :3] = INK; F.a[o, 3] = 255
    fr.append(compose(F, shadow=sh))
    # ponto da linha pontilhada
    F = Frame(64, 64)
    F.part(ell(32, 32, 2.6, 2.6), CREAM, light=.4)
    pt(F, (31, 31), '#ffffff')
    fr.append(compose(F))
    # mira em cruz normal / aberta
    for gap in (4, 13):
        F = Frame(64, 64)
        L = 8
        sh = (R(32 - 1, 32 - gap - L, 33, 32 - gap) + R(32 - 1, 33 + gap, 33, 33 + gap + L) +
              R(32 - gap - L, 31, 32 - gap, 33) + R(33 + gap, 31, 33 + gap + L, 33))
        F.part(sh, CREAM, shade=False, ol='#1a0f14')
        for (x0, y0) in ((31, 32 - gap - L), (31, 33 + gap), (32 - gap - L, 31), (33 + gap, 31)):
            pt(F, (x0, y0), '#ffffff')
        F.part(R(31, 31, 33, 33), RED_L, shade=False, ol='#1a0f14')
        if gap > 8:
            for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                bx, by = 32 + sx * (gap + 5), 32 + sy * (gap + 5)
                tmp = F.layer()
                ln(F, (bx, by), (bx - sx * 3, by), CREAM, layer=tmp)
                ln(F, (bx, by), (bx, by - sy * 3), CREAM, layer=tmp)
                tmp[..., 3] = (tmp[..., 3] * .55).astype(np.uint8)
                F.fx[:] = over(F.fx, tmp)
        fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_mira.png'))
    return len(fr)


# ================================================================ FLECHA

def arrow(F, T, L=48, gold=False, u0=0, u1=None, head=True, fletch=True, layer=None):
    """flecha local: nock em u=0, ponta em u=L, eixo +x. u0..u1 = trecho de haste desenhado."""
    u1 = (L - 7) if u1 is None else u1
    kw = {} if layer is None else {'layer': layer}
    if fletch:
        F.part(T(poly((2.5, -1), (13, -1), (11, -3.6), (4, -4.2), (1.5, -3.6))), FEATH_R, light=.3, tex=.2, **kw)
    ms = F.part(T(R(max(u0, -0.5), -1, u1, 1)), SHAFT, light=.35, **kw)
    ln(F, (max(u0, 0) + .5, -1), (u1 - .5, -1), SHAFT_L, m=ms, T=T, layer=layer)
    if fletch:
        mf = F.part(T(poly((2.5, 1), (13, 1), (11, 3.6), (4, 4.2), (1.5, 3.6))), FEATH_C, light=.3, tex=.2, **kw)
        for u in (5, 8):
            pt(F, (u, -2.4), '#8a1a20', T=T, layer=layer); pt(F, (u, 2.4), '#b9b0a0', T=T, layer=layer)
        F.part(T(R(-1.5, -1.3, 1.2, 1.3)), '#2a2228', shade=False, **kw)
        for u in (14, 15):
            if u0 <= u <= u1:
                pt(F, (u, 0), '#4a2a16', T=T, layer=layer); pt(F, (u, -1), '#4a2a16', T=T, layer=layer)
    if head:
        for u in (L - 9, L - 8.2):
            pt(F, (u, 0), '#4a2a16', T=T, layer=layer); pt(F, (u, -1), '#4a2a16', T=T, layer=layer)
        hc, hl = (GOLD, GOLD_L) if gold else (HEAD, HEAD_L)
        mh = F.part(T(poly((L - 8, -3.2), (L, 0), (L - 8, 3.2), (L - 6.5, 0))), hc, light=.4,
                    ol='#3a2a08' if gold else None, **kw)
        ln(F, (L - 7, -1.8), (L - 1, -.3), hl, m=mh, T=T, layer=layer)


def make_flecha():
    fr = []
    F = Frame(64, 32); arrow(F, Xf(0, 0, 0, 14, 16)); fr.append(compose(F))
    # rastro dourado
    F = Frame(64, 32)
    tmp = F.layer()
    for x in range(0, 22):
        t = x / 21
        hw = .5 + 1.8 * t
        for y in range(10, 23):
            v = abs(y + .5 - 16.5)
            if v <= hw:
                a = int(50 + 160 * t) if v < hw - .6 else int(30 + 90 * t)
                c = C(GOLD_L) if v < .8 and t > .4 else C(GOLD)
                tmp[y, x, :3] = c; tmp[y, x, 3] = a
    F.fx[:] = over(F.fx, tmp)
    arrow(F, Xf(0, 0, 0, 14, 16), gold=True)
    glow(F, 60, 16, 9, GOLD, 150)
    sparkle_fx(F, 61, 16, 3)
    fr.append(compose(F))
    # cravada no chão (3 vibrações)
    ex, ey = 42, 26
    L = 44
    for deg in (34, 27, 41):
        F = Frame(64, 32)
        F.part(ell(ex + 1, ey + 2.2, 7, 2.6), '#4a3a28', light=.0, dark=.2, ol='#2a2018')   # buraco/terra
        T0 = Xf(0, 0, deg, 0, 0)
        p = T0.p(L - 6, 0)
        T = Xf(0, 0, deg, ex - p[0], ey - p[1])
        arrow(F, T, L, u1=L - 6, head=False)
        F.part(ell(ex + 1, ey + 1.6, 5, 2.0) + ell(ex - 3, ey + 2.3, 2.5, 1.4) + ell(ex + 5, ey + 2.2, 2.4, 1.4),
               '#6a5238', light=.35, ol='#2a2018', tex=.3)
        for q in ((ex - 6, ey + 3), (ex + 8, ey + 3), (ex + 3, ey)):
            pt(F, q, '#8a7a62')
        fr.append(compose(F, shadow=None))
    # cravada em madeira
    F = Frame(64, 32)
    mw = F.part(poly((44, 3), (61, 4), (62, 29), (45, 28), (43, 17)), '#9a6a3c', light=.3, tex=.25)
    for x0 in (48, 53, 57):
        ln(F, (x0, 5), (x0 + 1, 27), '#7d5430', m=inner(mw))
    ln(F, (59, 6), (59, 12), '#5a3a22', m=inner(mw))
    pt(F, (51, 22), '#c9c3b0'); pt(F, (51, 21), '#8a8478')
    T0 = Xf(0, 0, 6, 0, 0)
    p = T0.p(42, 0)
    T = Xf(0, 0, 6, 45 - p[0], 15 - p[1])
    arrow(F, T, 48, u1=42, head=False)
    F.part(ell(45.5, 15.4, 1.6, 2.4), '#2a1a10', shade=False, outline=False)
    for q, c in (((44, 12), '#d8a868'), ((43, 11), '#d8a868'), ((44, 19), '#c49a62'), ((42, 20), '#d8a868'), ((46, 11), '#5a3a22')):
        pt(F, q, c)
    F.part(poly((44, 13), (40, 11.5), (44, 14.5)), '#d8a868', shade=False, ol='#5a3a22')
    fr.append(compose(F))
    # quebrada
    F = Frame(64, 32)
    Tb = Xf(0, 0, -7, 3, 18)
    arrow(F, Tb, 48, u1=22, head=False)
    for u, v in ((22, -1), (23, 0), (22.5, 1)):
        pt(F, (u, v), '#e0c08a', T=Tb)
    Tf = Xf(0, 0, 13, 5, 6)
    arrow(F, Tf, 48, u0=29, fletch=False)
    for u, v in ((28, -1), (28.5, 1), (27.6, 0)):
        pt(F, (u, v), '#e0c08a', T=Tf)
    fr.append(compose(F, shadow=drop_shadow(F, 1, 2, 80, 0)))
    strip(fr).save(os.path.join(OUT, 'arm_flecha.png'))
    return len(fr)


# ================================================================ ARCO

def bow_curve(k, gx=74, cy=64):
    D = 22 + 10 * k
    H = 50 * (1 - .05 * k)

    def c(t):
        a = abs(t)
        x = gx - D * t * t
        if a > .84:
            x += ((a - .84) / .16) ** 2 * 6
        return (x, cy + H * t)
    return c


AY = 55   # altura da flecha / ponto de encaixe


def draw_bow(F, k=0.0, vib=0.0, arrow_on=False, gold=False, jit=(0, 0)):
    gx, cy = 74 + jit[0], 64 + jit[1]
    c = bow_curve(k, gx, cy)
    tips = (c(-1), c(1))
    # corda (atrás das lâminas)
    nock = (tips[0][0] - 11 * k, AY + jit[1])
    if vib:
        for sgn, al in ((-1, 110), (1, 255)):
            tmp = F.layer() if al < 255 else None
            pts = []
            for i in range(41):
                s = i / 40
                y = tips[0][1] + (tips[1][1] - tips[0][1]) * s
                pts.append((tips[0][0] - sgn * vib * math.sin(math.pi * s), y))
            for a, b in zip(pts, pts[1:]):
                if tmp is None:
                    ln(F, (a[0] + 1, a[1]), (b[0] + 1, b[1]), '#8a7a62')
            for a, b in zip(pts, pts[1:]):
                ln(F, a, b, '#efe6cc', layer=tmp)
            if tmp is not None:
                tmp[..., 3] = (tmp[..., 3].astype(float) * al / 255).astype(np.uint8)
                F.fx[:] = over(F.fx, tmp)
        mid = (tips[0][0] - vib, cy)
        for dy in (-14, 0, 14):
            tmp = F.layer()
            ln(F, (mid[0] - 5 - vib, cy + dy - 2), (mid[0] - 8 - vib, cy + dy - 3), '#efe6cc', layer=tmp)
            ln(F, (mid[0] - 5 - vib, cy + dy + 2), (mid[0] - 8 - vib, cy + dy + 3), '#efe6cc', layer=tmp)
            tmp[..., 3] = (tmp[..., 3] * .6).astype(np.uint8)
            F.fx[:] = over(F.fx, tmp)
    else:
        for a, b in ((tips[0], nock), (nock, tips[1])):
            ln(F, (a[0] + 1, a[1]), (b[0] + 1, b[1]), '#8a7a62')
            ln(F, a, b, '#efe6cc')
        # servimento vermelho em volta do encaixe
        for a, b in ((tips[0], nock), (nock, tips[1])):
            n = 5
            for i in range(n):
                t = 1 - i / 18 if a is tips[0] else i / 18
                x = a[0] + (b[0] - a[0]) * t
                y = a[1] + (b[1] - a[1]) * t
                pt(F, (x, y), FEATH_R)
    # lâminas
    limbs = []
    for sgn in (-1, 1):
        ts = [sgn * (.13 + .87 * i / 28) for i in range(29)]
        pts = [c(t) for t in ts]
        limbs.append((ts, F.part(chain(pts, 7.2, 3.0), '#a8743e', light=.32, tex=.14)))
    for ts, m in limbs:
        mi = inner(m)
        tt = np.linspace(ts[0], ts[-1], 120)
        for i in range(len(tt) - 1):
            p0, p1 = c(tt[i]), c(tt[i + 1])
            dx, dy = p1[0] - p0[0], p1[1] - p0[1]
            Ln = math.hypot(dx, dy) or 1
            nx, ny = dy / Ln, -dx / Ln
            if nx < 0:
                nx, ny = -nx, -ny
            w = 7.2 - 4.2 * (abs(tt[i]) - .13) / .87
            pt(F, (p0[0] + nx * w * .22, p0[1] + ny * w * .22), '#d0a060', m=mi)
            pt(F, (p0[0] - nx * w * .25, p0[1] - ny * w * .25), '#6a4220', m=mi)
        # fitas
        sgn = 1 if ts[0] > 0 else -1
        for tv, col, hl in ((.36, TAPE, TAPE_L), (.6, SILVER, '#e0e0dc'), (.92, ROPE, '#d8c08a')):
            t = sgn * tv
            p0, p1 = c(t - sgn * .025), c(t + sgn * .025)
            pc = c(t)
            dx, dy = p1[0] - p0[0], p1[1] - p0[1]
            Ln = math.hypot(dx, dy) or 1
            ux, uy = dx / Ln, dy / Ln
            nx, ny = -uy, ux
            w = (7.2 - 4.2 * (tv - .13) / .87) / 2 + 1.2
            hl_len = 1.8 if col != ROPE else 1.3
            q = [(pc[0] - ux * hl_len + nx * w, pc[1] - uy * hl_len + ny * w), (pc[0] + ux * hl_len + nx * w, pc[1] + uy * hl_len + ny * w),
                 (pc[0] + ux * hl_len - nx * w, pc[1] + uy * hl_len - ny * w), (pc[0] - ux * hl_len - nx * w, pc[1] - uy * hl_len - ny * w)]
            mt = F.part([q], col, light=.2)
            ln(F, (pc[0] - ux * .6 + nx * (w - 1), pc[1] - uy * .6 + ny * (w - 1)),
               (pc[0] - ux * .6 - nx * (w - 1), pc[1] - uy * .6 - ny * (w - 1)), hl, m=inner(mt))
        # laço da corda na ponta
        tp = c(sgn * 1.0)
        pt(F, (tp[0] - 1, tp[1] - sgn), '#efe6cc'); pt(F, (tp[0], tp[1] + sgn * 1), '#8a7a62')
    # empunhadura de couro
    mg = F.part(poly((gx - 5.5, cy - 9), (gx + 4.5, cy - 9), (gx + 5.5, cy - 6), (gx + 5.5, cy + 7), (gx + 4.5, cy + 10),
                     (gx - 5.5, cy + 10), (gx - 6.5, cy + 6), (gx - 6.5, cy - 6)), '#6b3f22', light=.3, tex=.2)
    for y0 in range(int(cy - 10), int(cy + 11), 3):
        ln(F, (gx - 7, y0), (gx + 6, y0 + 4), '#4a2a16', m=inner(mg))
        ln(F, (gx - 7, y0 + 1), (gx + 6, y0 + 5), '#8a5530', m=inner(mg))
    for y0 in range(int(cy - 7), int(cy + 9), 2):
        pt(F, (gx + 3, y0), '#d8c8a0', m=inner(mg))
    F.part(R(gx - 7, AY + jit[1] + 1.2, gx - 2, AY + jit[1] + 3.4), '#2a2228', shade=False)   # apoio
    # flecha encaixada
    if arrow_on:
        L = 62
        T = Xf(0, 0, 0, nock[0], nock[1])
        arrow(F, T, L, gold=gold)
        if gold:
            hx = nock[0] + L
            glow(F, hx + 2, nock[1], 13, GOLD, 105)
            sparkle_fx(F, hx - 1, nock[1], 4)
            sparkle_fx(F, hx - 8, nock[1] - 7, 2)
            sparkle_fx(F, hx - 10, nock[1] + 6, 1)


def aura(F, col, a1=110, a2=55):
    m = F.a[..., 3] > 0
    r1 = dilate(dilate(m)) & ~m
    r2 = dilate(dilate(r1 | m)) & ~(r1 | m)
    base = F.layer()
    base[r2, :3] = C(col); base[r2, 3] = a2
    base[r1, :3] = C(col); base[r1, 3] = a1
    return base


def make_arco():
    fr = []
    for k, arr in ((0, False), (.33, True), (.66, True), (1, True)):
        F = Frame(); draw_bow(F, k, arrow_on=arr); fr.append(compose(F))
    F = Frame(); draw_bow(F, 1, arrow_on=True, gold=True); fr.append(compose(F))
    for jit in ((0, 0), (1, -1)):
        F = Frame(); draw_bow(F, 1.0 if jit[0] == 0 else .96, arrow_on=True, jit=jit)
        fr.append(compose(F, shadow=aura(F, RED, 90 if jit[0] == 0 else 70, 45 if jit[0] == 0 else 30)))
    for v in (4.5, 2.2):
        F = Frame(); draw_bow(F, 0, vib=v); fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_arco.png'))
    return len(fr)


# ================================================================ ALJAVA

DIG = {'0': ["111", "101", "101", "101", "111"], '1': ["010", "110", "010", "010", "111"],
       '5': ["111", "100", "111", "001", "111"]}


def digits(F, s, x, y, col, sc=3, ol='#1a0f14'):
    sh = []
    cx = x
    for ch in s:
        for j, row in enumerate(DIG[ch]):
            for i, b in enumerate(row):
                if b == '1':
                    X, Y = cx + i * sc, y + j * sc
                    sh += R(X, Y, X + sc, Y + sc)
        cx += 4 * sc
    F.part(sh, col, shade=False, ol=ol, layer=F.fx)
    # brilho no topo dos dígitos
    return cx


def quiver(F, T, n, grey=False):
    leather = '#7a7672' if grey else '#8a5530'
    leather_d = '#5a5652' if grey else '#6b3f22'
    strap = '#5a5e64' if grey else '#4a5866'
    xs = [-4.5, 2.5, -1, 5, -6.5, 0.5, 4, -3, 6.5, -5.5][:n]
    hs = [-30, -28, -33, -27, -26, -31, -29, -27, -25, -32][:n]
    order = sorted(range(n), key=lambda i: hs[i])
    for i in order:   # flechas saindo da boca
        x, h = xs[i], hs[i]
        F.part(T(R(x - .8, h + 6, x + .8, -16)), SHAFT, light=.3)
        fc = FEATH_R if i % 2 == 0 else FEATH_C
        if grey:
            fc = '#9a9690'
        F.part(T(poly((x - .8, h + 9), (x - 3.4, h + 7), (x - 3.4, h + 1), (x - .8, h + 2))), fc, light=.3, tex=.2)
        F.part(T(poly((x + .8, h + 9), (x + 3.4, h + 7), (x + 3.4, h + 1), (x + .8, h + 2))),
               FEATH_C if fc == FEATH_R else ('#9a9690' if grey else FEATH_R), light=.3, tex=.2)
        F.part(T(R(x - .8, h - .5, x + .8, h + 1.5)), '#2a2228', shade=False)
    # alça atrás
    F.part(T(chain([(-8, -12), (-13, 2), (-11, 18)], 4)), strap, light=.25, tex=.25)
    # tubo
    mt = F.part(T(R(-8.5, -17, 8.5, 21) + ell(0, 21, 8.5, 3.5)), leather, light=.35, tex=.22)
    mi = inner(mt)
    for v in range(-13, 21, 2):
        pt(F, (6, v), '#e8d8b0' if not grey else '#c8c4bc', m=mi, T=T)
    ln(F, (-6.5, -14), (-6.5, 20), '#b07a48' if not grey else '#9a9690', m=mi, T=T)
    for v in (-2, 9):
        ln(F, (-8, v), (8, v + 1), leather_d, m=mi, T=T)
    ln(F, (-3, 3), (1, 6), '#c08a5a' if not grey else '#aaa6a0', m=mi, T=T)   # arranhão
    F.part(T(R(-9.5, -19.5, 9.5, -15.5)), leather_d, light=.3)   # aro da boca
    F.part(T(ell(0, 23, 7.5, 2.8)), '#2a2228' if not grey else '#3a3a3e', light=.2)   # fundo de borracha
    # alça na frente + fivela
    F.part(T(R(-9.6, 4, 9.6, 8)), strap, light=.3)
    mb = F.part(T(R(-3, 3, 3, 9)), '#c9c3b0' if not grey else '#a8a8a4', light=.4)
    hole(F, F.mask(T(R(-1.2, 4.8, 1.2, 7.2))) & mb)
    for v in (-6, 6):
        pt(F, (v, 6), '#e8e4d8', T=T)


def make_aljava():
    fr = []
    F = Frame(64, 64); quiver(F, Xf(0, 0, 18, 32, 36), 5); fr.append(compose(F))
    for n, s, col in ((10, '10', '#fff4e0'), (5, '5', '#fff4e0'), (1, '1', '#fff4e0'), (0, '0', RED)):
        F = Frame(64, 64)
        quiver(F, Xf(0, 0, 14, 22, 36, .85, .85), min(n, 6) if n != 10 else 7, grey=(n == 0))
        x0 = 40 if len(s) == 1 else 34
        digits(F, s, x0, 40, col)
        if n == 0:
            for d in range(-3, 4):   # x riscado sobre a boca
                pt(F, (24 + d, 14 + d), RED, layer=F.fx); pt(F, (24 + d, 14 - d), RED, layer=F.fx)
                pt(F, (25 + d, 14 + d), RED, layer=F.fx); pt(F, (25 + d, 14 - d), RED, layer=F.fx)
        fr.append(compose(F))
    strip(fr).save(os.path.join(OUT, 'arm_aljava.png'))
    return len(fr)


# ================================================================ ALVO

def draw_target(F, arrow_in=False):
    cx, cy = 64, 50
    # perna de trás
    F.part(limb(64, 58, 67, 104, 5, 4.4), '#5a3a22', light=.2, tex=.25)
    # disco (espessura)
    F.part(ell(cx + 2.5, cy + 3, 34, 36), '#5a3a22', light=.15, tex=.2)
    rings = [((30, 32), '#e8e0d0'), ((25, 26.6), '#2a2228'), ((20, 21.3), '#e8e0d0'), ((14, 15), RED), ((8.5, 9), '#e8e0d0'),
             ((4.4, 4.7), RED)]
    marks = [(ell(cx, cy, rx, ry), c) for (rx, ry), c in rings]
    md = F.part(ell(cx, cy, 34, 36), '#9a6a3c', marks=marks, light=.3, tex=.12)
    mi = inner(md)
    # juntas das tábuas
    for x0 in (44, 53, 62, 71, 80):
        ln(F, (x0, 10), (x0 + 1, 90), '#3e2616', m=mi)
        ln(F, (x0 + 1, 10), (x0 + 2, 90), '#b88a58', m=mi & (F.a[..., 0] > 130) & (F.a[..., 0] < 200))
    # tinta descascada
    peel = hashm(128, 128, 7, .05) & mi
    yy, xx = np.mgrid[0:128, 0:128]
    rr = np.sqrt(((xx - cx) / 34.) ** 2 + ((yy - cy) / 36.) ** 2)
    peel &= (rr > .2)
    F.a[peel, :3] = C('#8a5e34')
    for (px_, py_) in ((40, 34), (86, 62), (57, 76), (75, 28), (48, 63), (70, 40)):   # furos de flechas antigas
        F.a[py_, px_, :3] = (18, 12, 14); F.a[py_, px_ + 1, :3] = (40, 28, 26)
    for x0, y0, L in ((52, 71, 5), (78, 66, 4), (69, 36, 3)):    # escorridos de tinta vermelha
        ln(F, (x0, y0), (x0, y0 + L), '#9a2228', m=mi)
    ln(F, (56, 18), (60, 26), '#2a1a10', m=mi); ln(F, (60, 26), (58, 32), '#2a1a10', m=mi)   # rachadura
    for (px_, py_) in ((48, 18), (66, 15), (84, 24), (45, 80), (79, 82), (63, 86)):           # pregos
        pt(F, (px_, py_), '#c9c3b0', m=mi); pt(F, (px_ + 1, py_ + 1), '#5a5048', m=mi)
    # pernas da frente + travessa
    ml = F.part(limb(53, 66, 38, 115, 5.6, 5), '#7d5430', light=.3, tex=.25)
    mr = F.part(limb(75, 66, 90, 115, 5.6, 5), '#7d5430', light=.3, tex=.25)
    mt = F.part(R(41, 95, 87, 99.5), '#8b5e34', light=.3, tex=.2)
    for m_ in (ml, mr, mt):
        mi2 = inner(m_)
        ys, xs = np.nonzero(mi2)
        for y, x in zip(ys, xs):
            if (x * 7 + y * 3) % 11 == 0:
                F.a[y, x, :3] = (F.a[y, x, :3] * .8).astype(np.uint8)
    for x0 in (44, 84):
        pt(F, (x0, 97), '#c9c3b0'); pt(F, (x0 + 1, 98), '#5a5048')
    # amarrações de corda
    for (x0, y0) in ((51, 70), (77, 70)):
        mrp = F.part(R(x0 - 3.5, y0 - 3, x0 + 3.5, y0 + 3), ROPE, light=.3)
        for d in (-2, 0, 2):
            ln(F, (x0 - 3, y0 + d), (x0 + 3, y0 + d + 1), '#7a6440', m=inner(mrp))
    if arrow_in:
        T0 = Xf(0, 0, 28, 0, 0)
        p = T0.p(36, 0)
        T = Xf(0, 0, 28, cx - p[0], cy - p[1])
        arrow(F, T, 42, u1=36, head=False)
        F.part(ell(cx + .5, cy + .5, 1.4, 1.4), '#1a0f0c', shade=False, outline=False)
        for q in ((cx - 2, cy - 2), (cx + 2, cy - 1), (cx - 1, cy + 2)):
            pt(F, q, '#e8e0d0')


def make_alvo():
    fr = []
    sh = shadow_layer(66, 34, 4.5, 95, 128, 128, 115)
    F = Frame(); draw_target(F); fr.append(compose(F, shadow=sh))
    F = Frame(); draw_target(F, True); fr.append(compose(F, shadow=sh))
    for ang in (3.5, -3):
        F = Frame(); draw_target(F, True); fr.append(compose(F, shadow=sh, rotate=(ang, 64, 115)))
    strip(fr).save(os.path.join(OUT, 'arm_alvo.png'))
    return len(fr)


# ================================================================ TOCO

def draw_stump(F, arrows=False):
    cx, ty = 64, 74
    roots = [((38, 98), (22, 112), 15, 6), ((90, 98), (106, 111), 15, 6), ((52, 104), (45, 116), 12, 5),
             ((78, 104), (87, 115), 12, 5)]
    rm = np.zeros((128, 128), bool)
    for a, b, w0, w1 in roots:
        rm |= F.part(limb(a[0], a[1], b[0], b[1], w0, w1), '#5a3a22', light=.25, tex=.3)
    body = R(cx - 31, ty, cx + 31, 104) + ell(cx, 104, 31, 8)
    moss = [(ell(cx - 26, 82, 6, 9), '#4a6139'), (ell(cx - 22, 100, 7, 4), '#4a6139'), (ell(cx - 28, 92, 3, 3), '#5f7a4a'),
            (ell(cx + 24, 106, 5, 3), '#4a6139')]
    mb = F.part(body, '#5a3a22', marks=moss, light=.3, tex=.32)
    mi = inner(mb)
    for i, x0 in enumerate(range(cx - 27, cx + 28, 6)):
        w = 1.5 if i % 2 else -1.5
        ln(F, (x0, ty + 4), (x0 + w, ty + 16), '#3e2616', m=mi)
        ln(F, (x0 + w, ty + 16), (x0 - w * .5, 108), '#3e2616', m=mi)
        ln(F, (x0 + 2, ty + 6), (x0 + 2 + w * .5, ty + 26), '#7a5434', m=mi & (F.a[..., 1] < 80))
    # marca de machado na lateral
    F.part(poly((cx + 14, 84), (cx + 24, 80), (cx + 22, 92)), '#c49a62', light=.3, ol='#3e2616')
    ln(F, (cx + 16, 84), (cx + 22, 88), '#a07444')
    # topo com anéis
    marks = [(ell(cx, ty, 29, 9.6), '#c49a62')]
    for i, (rx, ry) in enumerate(((25, 8.2), (21, 6.8), (16.5, 5.4), (12, 3.9), (7.5, 2.5))):
        marks.append((ell(cx + .6 * i * 0, ty, rx, ry), '#a07444'))
        marks.append((ell(cx, ty, rx - 1, ry - .7), '#c49a62' if i % 2 == 0 else '#d2aa72'))
    marks.append((ell(cx, ty, 2.5, 1.2), '#7a5434'))
    mtop = F.part(ell(cx, ty, 32, 11), '#4a2e1a', marks=marks, light=.35, tex=.06)
    ln(F, (cx + 2, ty), (cx + 20, ty - 6), '#3e2616', m=inner(mtop))      # rachadura radial
    ln(F, (cx + 20, ty - 6), (cx + 26, ty - 5), '#3e2616', m=inner(mtop))
    F.part(poly((cx - 20, ty - 2), (cx - 10, ty - 5), (cx - 8, ty - 2)), '#e0be86', shade=False, ol='#a07444')   # lasca do machado
    # terra
    if arrows:
        for (ex, ey, deg, L, u1) in ((58, 72, 70, 40, 34), (40, 90, 22, 44, 38), (90, 94, 158, 44, 38)):
            T0 = Xf(0, 0, deg, 0, 0)
            p = T0.p(u1, 0)
            T = Xf(0, 0, deg, ex - p[0], ey - p[1])
            arrow(F, T, L, u1=u1, head=False)
            F.part(ell(ex, ey, 1.3, 1.3), '#1a0f0c', shade=False, outline=False)
            pt(F, (ex - 2, ey + 1), '#e0be86'); pt(F, (ex + 2, ey - 1), '#e0be86')


def make_toco():
    fr = []
    sh = shadow_layer(68, 42, 5, 95, 128, 128, 112)
    for a in (False, True):
        F = Frame()
        dirt = F.layer()
        F.flat(ell(64, 113, 40, 6), '#4a3a28', layer=dirt, alpha=150)
        draw_stump(F, a)
        fr.append(compose(F, shadow=over(sh, dirt)))
    strip(fr).save(os.path.join(OUT, 'arm_toco.png'))
    return len(fr)


# ================================================================

def main():
    os.makedirs(OUT, exist_ok=True)
    res = {}
    for gid in GUNS:
        res[gid] = make_gun(gid)
    res['arm_muzzle'] = make_muzzle()
    res['arm_projeteis'] = make_projeteis()
    res['arm_capsulas'] = make_capsulas()
    res['arm_municao'] = make_municao()
    res['arm_arco'] = make_arco()
    res['arm_flecha'] = make_flecha()
    res['arm_aljava'] = make_aljava()
    res['arm_alvo'] = make_alvo()
    res['arm_toco'] = make_toco()
    res['arm_mira'] = make_mira()
    for k, v in res.items():
        print(k, v)


if __name__ == '__main__':
    main()
