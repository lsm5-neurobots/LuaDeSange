"""Vasculhar: contêineres (lixeira, caixa, geladeira, armário, carro), anel de progresso, FX de abertura,
ícones de loot e aura de raridade. Gera tudo em ../sprites/.
Rodar da pasta tools:  python obj_vasculhar.py
"""
import os
import sys
import math

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, shadow_layer, compose, over, glow, strip, grid,
                    sparkle, puff, dust, plus, hexc, mix, NIGHT, MOON, INK)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')
STATES = ['closed', 'v1', 'v2', 'glow', 'open']

RAR = {  # base, clara, escura
    'comum': ('#b9b0a0', '#efe8da', '#6f6656'),
    'incomum': ('#4fb06a', '#a8f0b8', '#22603a'),
    'raro': ('#4a8fe0', '#b0d4ff', '#1e4a8a'),
    'lunar': ('#c8323a', '#ff8a8a', '#6a1418'),
}


# ================================================================ utilidades

def R(x0, y0, x1, y1):
    return poly((x0, y0), (x1, y0), (x1, y1), (x0, y1))


def col3(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def fxflat(F, shapes, col, alpha):
    L = F.layer()
    F.flat(shapes, col, layer=L, alpha=int(alpha))
    F.fx[:] = over(F.fx, L)


def fxmask(F, m, col, alpha):
    L = F.layer()
    L[m, :3] = col3(col)
    L[m, 3] = int(alpha)
    F.fx[:] = over(F.fx, L)


def fly(F, x, y, up=False):
    F.px(x, y, '#1a1418', F.fx)
    F.px(x + 1, y, '#1a1418', F.fx)
    F.px(x, y - 1, '#d8e0ea', F.fx, 200)
    F.px(x + 1 + (1 if up else 0), y - 1 - (1 if up else 0), '#d8e0ea', F.fx, 200)


def rays(F, cx, cy, r1, n, rot0, col, alpha, wdeg=6, sq=1.0, r0=0):
    sh = []
    for i in range(n):
        a = math.radians(rot0 + i * 360.0 / n)
        w = math.radians(wdeg)
        rr = r1 * (1 if i % 2 == 0 else .72)
        sh.append([(cx + r0 * math.cos(a - w), cy + r0 * math.sin(a - w) * sq),
                   (cx + rr * math.cos(a - w), cy + rr * math.sin(a - w) * sq),
                   (cx + rr * math.cos(a + w), cy + rr * math.sin(a + w) * sq),
                   (cx + r0 * math.cos(a + w), cy + r0 * math.sin(a + w) * sq)])
    fxflat(F, sh, col, alpha)


def opening_light(F, cx, cy, w, h=46, col='#fff1c0'):
    """luz quente saindo da boca do contêiner (quadro 'abrindo')."""
    glow(F, cx, cy, w * 1.25, col, 150)
    # feixe subindo, em degraus
    hh, ww = F.h, F.w
    yy, xx = np.mgrid[0:hh, 0:ww]
    for y in range(int(cy - h), int(cy)):
        t = (cy - y) / float(h)
        a = int(round((1 - t) ** 1.4 * 170 / 24.) * 24)
        if a <= 0:
            continue
        half = w * (.42 + .3 * t)
        # bordas do feixe tremulando (raias verticais)
        row = (yy == y) & (abs(xx - cx) <= half)
        fxmask(F, row, col, a * .7)
        fxmask(F, row & (abs(xx - cx) <= half * .45), '#fffbe8', a)
        for k in (-.7, .1, .55):
            fxmask(F, (yy == y) & (abs(xx - (cx + half * k)) <= 1), '#ffffff', a * .6)
    rays(F, cx, cy, w * 1.35, 10, 12, '#fff8e0', 60, wdeg=5, sq=.8, r0=w * .4)
    fxflat(F, ell(cx, cy, w * .45, 3), '#ffffff', 210)
    for (dx, dy) in ((-w * .5, -h * .7), (w * .45, -h * .55), (-w * .1, -h - 4), (w * .2, -h * .3)):
        sparkle(F, cx + dx, cy + dy, 2, '#fff6c8')


def desat(arr, k=.62, dark=.2):
    a = arr.astype(float)
    m = a[..., 3] > 0
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    g = np.stack([lum] * 3, -1)
    rgb = mix(a[..., :3], g, k)
    rgb = mix(rgb, NIGHT, dark) * .92
    a[..., :3] = np.where(m[..., None], rgb, a[..., :3])
    return np.clip(a, 0, 255).astype(np.uint8)


def paint_check(arr, x, y, s=1.0):
    h, w = arr.shape[:2]
    F = Frame(w, h)
    F.part(chain([(x, y), (x + 4 * s, y + 4 * s), (x + 12 * s, y - 7 * s)], 3.2 * s, 2.2 * s), '#5bd46e',
           shade=False, ol='#14361a')
    F.px(x + 1, y - 1, '#b6f5c0')
    F.px(x + 10 * s, y - 6 * s, '#b6f5c0')
    # escorridos de tinta spray
    F.line(x + 4 * s, y + 6 * s, x + 4 * s, y + 6 * s + 3, '#3f9a52')
    F.line(x + 9 * s, y - 1, x + 9 * s, y + 2, '#3f9a52')
    F.px(x - 2, y + 4, '#5bd46e')
    F.px(x + 14 * s, y - 4 * s, '#5bd46e')
    return over(arr, F.a)


def finish(F, sh, st, chk, chs=1.0):
    a = compose(F, shadow=sh)
    if st == 'open':
        a = desat(a)
        a = paint_check(a, chk[0], chk[1], chs)
    return a


def shake_puffs(F, st, pts):
    if st not in ('v1', 'v2'):
        return
    k = 0 if st == 'v1' else 1
    for i, (x, y) in enumerate(pts):
        if (i + k) % 2 == 0:
            dust(F, x + (k * 2 - 1) * 2, y - k * 2, 2 + k)
        else:
            F.px(x, y - 3 - k * 3, '#9c8a70', F.fx)
            F.px(x + 2, y - 5 - k * 2, '#9c8a70', F.fx)


# ================================================================ LIXEIRA

def lixeira(st):
    F = Frame()
    up = {'closed': 0, 'v1': 3, 'v2': 6}.get(st, 0)
    opened = st in ('glow', 'open')
    OR, ORD, LID = '#e0701e', '#b4561a', '#c85a18'

    # alça de trás
    F.part(R(30, 34, 98, 38), '#4a4444')
    F.part(R(30, 34, 33, 44), '#4a4444')
    F.part(R(95, 34, 98, 44), '#4a4444')

    if opened:
        # tampa tombada para trás (verso)
        F.part(R(26, 12, 102, 42), '#b04e16', tex=.08,
               marks=[(R(30, 16, 98, 18), '#c85a18'), (ell(40, 24, 5, 3), '#8a3e12'), (ell(84, 30, 6, 2), '#7a3410')])
        for x in range(34, 96, 10):
            F.line(x, 18, x, 38, '#8a3e12')
            F.line(x + 1, 18, x + 1, 38, '#d06a28')
        F.part(R(25, 40, 103, 45), '#a84c14')
        # dobradiças
        for x in (36, 90):
            F.part(R(x - 3, 41, x + 3, 47), '#4a4444')

    # rodas + eixo
    for wx in (40, 88):
        F.part(ell(wx, 107, 5.5, 5.5), '#2a2626', light=.15, tex=.2)
        F.px(wx, 107, '#8d969c')
        F.px(wx - 1, 106, '#c9ced4')
    F.part(R(36, 99, 92, 104), '#3a3636')

    # corpo
    body = poly((30, 55), (98, 55), (94, 104), (34, 104))
    marks = [(poly((31, 92), (97, 92), (94, 104), (34, 104)), '#b8581c'),
             (ell(40, 99, 6, 3), '#8a4a20'), (ell(80, 101, 9, 3), '#8a4a20'), (ell(58, 96, 3, 2), '#9a4c1c'),
             (ell(87, 70, 2, 1.6), '#6a1a1a'), (ell(91, 75, 1.3, 1.1), '#6a1a1a'), (ell(84, 77, 1, 1), '#6a1a1a'),
             (limb(88, 72, 89, 84, 1.2), '#6a1a1a')]
    F.part(body, OR, marks=marks, tex=.1)
    for x in (40, 50, 78, 88):
        xb = 64 + (x - 64) * (30 / 34.)
        F.line(x, 59, xb, 101, ORD)
        F.line(x + 1, 59, xb + 1, 101, '#f39a4a')
    # selo de reciclagem
    F.part(ell(64, 75, 7.5, 7.5), '#e6dfcf', light=.15, marks=[(ell(68, 79, 2.5, 2), OR)])
    F.part(poly((64, 69.5), (70, 79), (58, 79)), '#3f8a4a', shade=False)
    F.flat(poly((64, 73), (67, 77.5), (61, 77.5)), '#e6dfcf')
    # etiqueta
    F.part(R(70, 60, 84, 65), '#e8e2d2', light=.1)
    for x in (72, 74, 77, 79, 81):
        F.px(x, 62, '#3a2a2a')
    # arranhões e pichação
    for (a, b, c, d) in ((35, 62, 43, 66), (45, 86, 51, 84), (82, 62, 90, 60), (37, 80, 41, 82)):
        F.line(a, b, c, d, '#f6b070')
    sc = [(73, 88), (75, 85), (77, 89), (79, 85), (81, 88), (84, 86), (86, 89)]
    for p, q in zip(sc[:-1], sc[1:]):
        F.line(p[0], p[1], q[0], q[1], '#2a1a2a')
    F.line(72, 91, 88, 90, '#c8323a')
    # aro da boca
    F.part(R(28, 52, 100, 57), '#c9621a', marks=[(R(28, 52, 100, 53), '#e8843a')])

    if not opened:
        if up:
            F.part(R(30, 52 - up, 98, 54), '#1a1218', shade=False)
            F.part(ell(50, 52 - up * .4, 9, up * .5 + 1), '#2e2a36', light=.3)
            F.part(ell(80, 52 - up * .3, 7, up * .4 + 1), '#3a3440', light=.3)
        deg = -2 if st == 'v1' else (2.5 if st == 'v2' else 0)
        lid = rot(mv(R(26, 40, 102, 51), 0, -up), 64, 46, deg)
        lip = rot(mv(R(25, 49, 103, 54), 0, -up), 64, 46, deg)
        F.part(lid, '#d0661c', tex=.08,
               marks=[(rot(mv(R(30, 43, 98, 44), 0, -up), 64, 46, deg), '#b4561a'),
                      (rot(mv(R(30, 46, 98, 47), 0, -up), 64, 46, deg), '#b4561a'),
                      (rot(mv(ell(44, 45, 6, 2), 0, -up), 64, 46, deg), '#a8501a'),
                      (rot(mv(ell(86, 43, 3, 1.5), 0, -up), 64, 46, deg), '#6a1a1a')])
        F.part(lip, '#a84c14')
        if st == 'closed':
            F.part(poly((86, 52), (96, 50), (100, 56), (90, 58)), '#26222a', light=.3)
            F.px(92, 52, '#5a5466')
        else:
            # trapo vermelho pendurado + saco escapando
            F.part(poly((68, 53), (75, 53), (77, 64 + up), (71, 66 + up)), '#a83030',
                   marks=[(R(68, 57, 78, 58), '#e0c8a0'), (R(68, 61 + up, 78, 62 + up), '#e0c8a0')])
            F.part(poly((88, 53 - up), (97, 52 - up), (99, 57), (90, 58)), '#26222a', light=.3)
    else:
        F.part(R(29, 44, 99, 55), '#1c1218', shade=False)
        F.part(R(30, 44, 98, 47), '#6a3010', shade=False)
        if st == 'glow':
            F.part(ell(48, 51, 10, 4), '#4a4454', light=.4)
            F.part(ell(70, 50, 9, 4), '#3e3a48', light=.4)
            F.part(ell(88, 52, 6, 3), '#a83030', light=.3)
        else:
            F.part(ell(80, 52, 3, 1.5), '#8a8a8a')
        F.part(R(28, 52, 100, 57), '#c9621a', marks=[(R(28, 52, 100, 53), '#e8843a')])

    # lixo no chão: saco rasgado à esquerda
    F.part(ell(21, 104, 12, 8) + ell(17, 96, 6, 5), '#2a2630', tex=.1, light=.3,
           marks=[(ell(27, 102, 4.5, 3.5), '#140e14'), (limb(12, 100, 18, 106, 1), '#4a4454')])
    F.part(ell(15, 90, 2.5, 2), '#2a2630')
    F.part(poly((25, 99), (33, 97), (35, 104), (27, 106)), '#d8d0b8',
           marks=[(R(27, 100, 33, 101), '#9a9080'), (R(28, 102, 33, 103), '#9a9080')])
    F.part(chain([(12, 110), (17, 112), (23, 111)], 3, 2), '#d8b040', marks=[(ell(23, 111, 1.5, 1.5), '#4a3a1a')])
    # direita: lata amassada e jornal
    F.part(poly((98, 106), (108, 104), (112, 110), (101, 112)), '#cfc6b0',
           marks=[(R(100, 107, 108, 108), '#8a8270'), (R(101, 109, 107, 110), '#8a8270')])
    F.part(ell(112, 104, 4, 2.5), '#b83a2a', marks=[(ell(112, 104, 1.2, 2.5), '#c9c3b0')])
    if st == 'open':
        F.part(ell(104, 96, 7, 5), '#2a2630', light=.3, marks=[(ell(106, 98, 3, 2), '#140e14')])
        F.part(poly((40, 113), (48, 111), (50, 116), (42, 117)), '#d8d0b8')
        F.part(ell(56, 116, 3, 1.6), '#5a7a9a')

    # moscas
    fl = {'closed': [(40, 34), (46, 30), (86, 46), (90, 41)],
          'v1': [(36, 26), (50, 22), (94, 32), (20, 84), (104, 42)],
          'v2': [(30, 20), (58, 14), (98, 24), (14, 80), (110, 36)],
          'glow': [(20, 30), (108, 20)], 'open': [(20, 90), (24, 86), (104, 88)]}[st]
    for i, (x, y) in enumerate(fl):
        fly(F, x, y, i % 2 == 0)
    shake_puffs(F, st, [(26, 52), (102, 52), (34, 110), (96, 110)])
    if st == 'glow':
        opening_light(F, 64, 50, 34)
    return finish(F, shadow_layer(62, 50, 6, 95), st, (38, 86))


# ================================================================ CAIXA

def caixa(st):
    F = Frame()
    up = {'closed': 0, 'v1': 3, 'v2': 6}.get(st, 0)
    opened = st in ('glow', 'open')
    PL, PD, GAP = '#9a6a3c', '#7d5430', '#3a2414'

    if opened:
        # tampa articulada em pé atrás (lado de baixo)
        F.part(R(30, 22, 98, 49), '#8b5e34', tex=.12,
               marks=[(R(30, 31, 98, 32), '#5a3a22'), (R(30, 40, 98, 41), '#5a3a22'), (ell(60, 27, 5, 1.5), '#6e4828')])
        F.part(R(38, 22, 45, 49), PD)
        F.part(R(83, 22, 90, 49), PD)
        for x in (41, 86):
            for y in (25, 35, 45):
                F.px(x, y, '#c9c3b0')
        # fita rasgada pendurada
        F.part(poly((58, 30), (70, 30), (69, 40), (65, 37), (62, 41), (58, 38)), '#a8acb0', light=.35)

    # frente
    F.part(R(30, 64, 98, 108), GAP)
    for k, (y0, y1) in enumerate(((64, 78), (79, 93), (94, 108))):
        F.part(R(37, y0, 91, y1), PL, tex=.12,
               marks=[(R(40, y0 + 4, 60, y0 + 5), '#86592f'), (R(64, y0 + 9, 88, y0 + 10), '#86592f'),
                      (R(46 + k * 9, y0 + 7, 56 + k * 9, y0 + 8), '#a87444'), (ell(74 - k * 12, y0 + 5, 2, 1.2), '#6e4828')])
    # carimbo FRÁGIL pontilhado
    st_m = []
    for (x, y) in [(70 + i, 97) for i in range(17)] + [(70 + i, 105) for i in range(17)] + \
                  [(70, 97 + j) for j in range(9)] + [(86, 97 + j) for j in range(9)]:
        if (x * 7 + y * 3) % 5:
            F.px(x, y, '#a8323a')
    for ax in (75, 81):
        F.line(ax, 99, ax, 103, '#a8323a')
        F.px(ax - 1, 100, '#a8323a')
        F.px(ax + 1, 100, '#a8323a')
    # travessa diagonal
    F.part(limb(43, 102, 85, 70, 7), '#8b5e34', tex=.1,
           marks=[(limb(48, 98, 80, 74, 1), '#6e4828')])
    # montantes
    F.part(R(30, 61, 38, 108), PD, tex=.12, marks=[(ell(34, 80, 3, 4), '#5a1414'), (R(31, 84, 37, 85), '#5a1414'),
                                                   (R(33, 70, 34, 79), '#5a1414')])
    F.part(R(90, 61, 98, 108), PD, tex=.12, marks=[(ell(94, 100, 3, 2), '#5a3a22')])
    # pregos
    for y in (68, 73, 85, 89, 99, 104):
        for x in (34, 94):
            F.px(x, y, '#c9c3b0')
            F.px(x + 1, y + 1, '#8a4e2e')
    for (x, y) in ((45, 100), (83, 72)):
        F.px(x, y, '#c9c3b0')

    if not opened:
        deg = -2 if st == 'v1' else (2 if st == 'v2' else 0)
        if up:
            F.part(R(31, 60 - up, 97, 64), '#1e120a', shade=False)
            for i in range(9):
                x = 36 + i * 7
                F.line(x, 63, x + (i % 3) - 1, 58 - up - (i % 2) * 2, '#d6b45a')
        T = lambda s: rot(mv(s, 0, -up), 64, 64, deg)  # noqa
        F.part(T(R(30, 48, 98, 64)), GAP)
        for k in range(3):
            y0 = 48 + k * 5.4
            F.part(T(R(30, y0, 98, y0 + 4.6)), '#a87444', tex=.12,
                   marks=[(T(R(36 + k * 6, y0 + 2, 56 + k * 6, y0 + 3)), '#8b5e34')])
        for (x, y) in ((33, 50), (33, 55), (33, 61), (95, 50), (95, 55), (95, 61)):
            p = T([[(x, y)]])[0][0]
            F.px(p[0], p[1], '#c9c3b0')
        # fita prata
        if st == 'closed':
            F.part(T(R(58, 47, 70, 64)) + R(58, 63, 70, 74), '#a8acb0', light=.35, tex=.15,
                   marks=[(R(58, 70, 70, 71), '#8a8e94')])
            F.line(60, 74, 62, 72, '#5a5e64')
            F.line(66, 74, 68, 72, '#5a5e64')
        else:
            F.part(T(R(58, 47, 70, 64)), '#a8acb0', light=.35, tex=.15)
            F.part(poly((58, 64), (70, 64), (69, 69), (65, 67), (62, 70), (58, 68)), '#a8acb0', light=.35)
        F.part(ell(88, 52 - up, 5, 1.6), '#5a3a22')
    else:
        F.part(R(30, 48, 98, 64), '#a87444', tex=.1)       # bordas
        F.part(R(34, 51, 94, 61), '#24160e', shade=False)  # vão
        F.part(R(34, 51, 94, 53), '#4a2e18', shade=False)
        if st == 'glow':
            for i in range(14):
                x = 37 + i * 4
                F.line(x, 60, x + (i % 3) - 1, 54 - (i % 4), '#d6b45a')
                F.px(x + 1, 59, '#f0d888')
        else:
            for x in (44, 61, 80):
                F.line(x, 60, x + 3, 58, '#8a7440')
        F.part(R(30, 60, 98, 64), '#9a6a3c', marks=[(R(30, 60, 98, 61), '#b88450')])

    # resto de feira
    F.part(ell(110, 106, 8, 4, rot=-15), '#6a8a3a', marks=[(limb(103, 109, 116, 103, 1), '#9ab85a')])
    F.part(ell(19, 108, 4.5, 3), '#c03a2a', marks=[(ell(20, 109, 2, 1.5), '#7a1a1a')])
    F.px(17, 106, '#f08a7a')
    for (a, b, c, d) in ((10, 112, 16, 111), (24, 113, 28, 110), (100, 113, 106, 112)):
        F.line(a, b, c, d, '#c9a64a')
    if st == 'open':
        for (a, b, c, d) in ((16, 100, 24, 98), (102, 96, 110, 97), (40, 114, 47, 112), (84, 113, 90, 115),
                             (104, 100, 108, 103)):
            F.line(a, b, c, d, '#d6b45a')
        F.part(limb(10, 92, 26, 88, 4), '#8b5e34')
    shake_puffs(F, st, [(26, 60), (102, 60), (32, 110), (96, 110)])
    if st == 'glow':
        opening_light(F, 64, 56, 32)
    return finish(F, shadow_layer(64, 44, 6, 95), st, (42, 84))


# ================================================================ GELADEIRA

def magnets(F, sx=lambda x: x):
    F.part(ell(sx(52), 60, 2.5, 2.3), '#c8323a', light=.4)
    F.px(sx(52), 57, '#4fb06a')
    F.part(R(sx(68), 70, sx(76), 75), '#e0b030', marks=[(R(sx(69), 72, sx(75), 73), '#a8323a')])
    F.part(R(sx(46), 82, sx(51), 86), '#3f6a8c')
    # bilhete preso
    F.part(poly((sx(54), 66), (sx(64), 65), (sx(65), 78), (sx(55), 79)), '#efe6c8', light=.1,
           marks=[(R(sx(56), 69, sx(63), 70), '#6a6a8a'), (R(sx(56), 72, sx(62), 73), '#6a6a8a'),
                  (R(sx(56), 75, sx(61), 76), '#6a6a8a')])
    F.part(ell(sx(59), 66, 1.6, 1.4), '#4fb06a')


def geladeira(st):
    F = Frame()
    opened = st in ('glow', 'open')
    EN, EN2, RUST = '#d8d2c2', '#dcd6c6', '#8a4e2e'
    # pés
    F.part(R(43, 105, 49, 111), '#2a2626')
    F.part(R(79, 105, 85, 111), '#2a2626')
    # topo
    F.part(poly((43, 16), (85, 16), (88, 19), (88, 27), (40, 27), (40, 19)), '#e4dfd2', tex=.06,
           marks=[(ell(76, 22, 7, 2), '#cfc8b6'), (ell(44, 25, 3, 1), RUST)])
    # paninho de crochê + pinguim
    F.part(ell(58, 21, 11, 3.2), '#ece2c6', light=.1)
    for i in range(11):
        a = math.pi * i / 10
        F.px(58 + 11 * math.cos(a) * 1.0, 21 + 3.6 * math.sin(a) + .5, '#c9b892')
    F.part(ell(58, 14, 4.2, 6), '#1e1c22', light=.35, marks=[(ell(59, 15.5, 2.6, 4.4), '#efeae0')])
    F.part(ell(58, 7, 3.2, 3), '#1e1c22', light=.35)
    F.px(59, 6, '#ffffff')
    F.px(61, 7, '#e0a020')
    F.px(62, 7, '#e0a020')
    F.part(ell(56, 19.5, 2, 1), '#e0a020', outline=False)
    F.part(ell(61, 19.5, 2, 1), '#e0a020', outline=False)

    # gabinete
    F.part(R(40, 27, 88, 108), EN, tex=.08,
           marks=[(R(40, 95, 88, 108), '#b4aa94'), (R(40, 104, 88, 108), RUST), (ell(41, 70, 1.5, 6), RUST),
                  (ell(87, 40, 1.4, 5), RUST), (ell(52, 104, 4, 2), '#5a2e1a')])
    F.part(R(43, 98, 85, 104), '#3a3638')
    for x in range(46, 84, 3):
        F.line(x, 99, x, 103, '#18141a')
    # congelador
    F.part(R(41, 28, 87, 49), EN2, tex=.06,
           marks=[(limb(66, 34, 72, 46, 4), '#7a2420'), (ell(69, 34, 3, 3.2), '#6a1a1a'),
                  (limb(72, 44, 73, 49, 1), '#6a1a1a'), (ell(44, 46, 2.5, 1.5), RUST)])
    F.part(limb(83, 32, 83, 44, 3), '#b8bcc0', light=.45)
    F.line(41, 50, 87, 50, '#4a4440')

    door_marks = [(ell(46, 94, 3, 1.6), RUST), (ell(80, 93, 4, 2), RUST), (ell(70, 90, 1.5, 1), '#a89c84'),
                  (R(41, 88, 87, 89), '#c8c0ae')]
    if st == 'closed':
        F.part(R(41, 51, 87, 97), EN2, tex=.06, marks=door_marks)
        F.part(R(58, 53, 70, 56), '#c9ced4', light=.5)
        F.px(61, 54, '#5a5e64'); F.px(64, 54, '#5a5e64'); F.px(67, 54, '#5a5e64')
        F.part(limb(83, 57, 83, 77, 3), '#b8bcc0', light=.45)
        magnets(F)
    elif st == 'v1':
        F.part(R(85, 51, 88, 97), '#e8f6ff', shade=False)
        F.part(R(41, 51, 85, 97), EN2, tex=.06, marks=door_marks)
        F.part(R(58, 53, 70, 56), '#c9ced4', light=.5)
        F.part(limb(81, 57, 81, 77, 3), '#b8bcc0', light=.45)
        magnets(F)
        fxflat(F, R(86, 52, 89, 96), '#e8f6ff', 120)
    elif st == 'v2':
        sx = lambda x: 41 + (x - 41) * (38. / 44)  # noqa
        F.part(R(82, 51, 88, 97), '#cfe6f0', shade=False, marks=[(R(82, 66, 88, 67), '#9ab0bc'), (R(82, 80, 88, 81), '#9ab0bc')])
        F.part(poly((41, 51), (79, 48), (79, 100), (41, 97)), EN2, tex=.06)
        F.part(poly((79, 48), (83, 49), (83, 99), (79, 100)), '#a8a294')
        F.part(R(sx(58), 53, sx(70), 56), '#c9ced4', light=.5)
        F.part(limb(76, 57, 76, 77, 3), '#b8bcc0', light=.45)
        magnets(F, sx)
        fxflat(F, poly((84, 51), (96, 44), (98, 104), (84, 97)), '#e8f6ff', 70)
    else:
        lit = st == 'glow'
        F.part(R(41, 51, 87, 97), '#9aa4a0' if lit else '#3e423e', shade=not lit,
               marks=[(R(45, 54, 83, 94), '#7f8a86' if lit else '#2c302c')])
        for y in (66, 80):
            F.part(R(43, y, 86, y + 2), '#c9ced4' if lit else '#6a6e6a', light=.4)
        if lit:
            F.part(R(50, 70, 54, 80), '#3a6a5a', light=.3)
            F.part(R(57, 72, 61, 80), '#8a3a2a', light=.3)
            F.part(ell(72, 92, 6, 3), '#d8b040', light=.3)
            F.part(R(48, 58, 66, 65), '#cfc6b0')
        else:
            F.part(ell(70, 79, 3, 1), '#4a4e4a')
        F.part(ell(46, 54, 2, 1.5), '#fff8d0' if lit else '#6a6a60', shade=False)
        # porta aberta (lado de dentro)
        F.part(poly((41, 51), (20, 56), (20, 105), (41, 98)), '#cfd2cc', tex=.05,
               marks=[(poly((23, 60), (39, 56), (39, 58), (23, 62)), '#a8aca6'),
                      (poly((23, 73), (39, 70), (39, 72), (23, 75)), '#a8aca6'),
                      (poly((23, 87), (39, 84), (39, 86), (23, 89)), '#a8aca6')])
        for (y0) in (62, 75, 89):
            F.part(poly((22, y0), (40, y0 - 4), (40, y0 + 1), (22, y0 + 5)), '#e4e6e0', light=.3)
        F.part(poly((20, 56), (17, 57), (17, 104), (20, 105)), '#a8a294')
        F.part(R(16, 70, 18, 82), '#b8bcc0')
        if lit:
            F.part(R(26, 66, 30, 70), '#5a9ac0')
            F.part(R(32, 79, 36, 83), '#e8e2d2')
    shake_puffs(F, st, [(36, 50), (92, 52), (40, 112), (90, 112)])
    if st == 'glow':
        glow(F, 64, 74, 44, '#e8f6ff', 150)
        rays(F, 64, 74, 52, 10, 8, '#f0f8ff', 55, wdeg=5, r0=18)
        fxflat(F, R(44, 54, 84, 94), '#f4fbff', 90)
        for (x, y) in ((30, 40), (96, 60), (78, 30)):
            sparkle(F, x, y, 2, '#f0f8ff')
    return finish(F, shadow_layer(60, 34, 5, 95), st, (52, 38))


# ================================================================ ARMÁRIO

def louvers(F, x0, x1):
    for y in range(36, 51, 3):
        F.line(x0, y, x1, y, '#2e3430')
        F.line(x0, y + 1, x1, y + 1, '#c2ccc2')


def armario(st):
    F = Frame()
    opened = st in ('glow', 'open')
    ST, STD = '#9aa59c', '#6e7a72'
    # topo + toalha + cuba
    F.part(R(34, 22, 94, 30), '#b2bcb2', tex=.06, marks=[(ell(84, 26, 5, 1.5), '#8a958c')])
    F.part(R(39, 14, 58, 24), '#3f6a8c', tex=.25, marks=[(R(39, 18, 58, 19), '#2e4f6a'), (R(39, 21, 58, 22), '#2e4f6a')])
    F.part(R(39, 22, 58, 26), '#2e4f6a')
    F.part(ell(76, 22, 8, 3.2), '#b8bcc0', light=.5, marks=[(ell(77, 22.5, 5.5, 1.8), '#7d848c')])
    # gabinete
    F.part(R(34, 30, 94, 104), STD)
    F.part(R(34, 103, 94, 110), '#3e4440', marks=[(ell(50, 108, 6, 2), '#8a4e2e')])
    # porta direita
    F.part(R(65, 31, 93, 103), ST, tex=.07,
           marks=[(ell(90, 98, 2, 4), '#8a4e2e'), (R(66, 99, 93, 103), '#7e8a82'), (ell(70, 92, 1.5, 1), '#c9ced4')])
    louvers(F, 69, 89)
    F.part(R(73, 55, 85, 60), '#e8e4da')
    for x in (75, 77, 80, 82):
        F.px(x, 57, '#2a2a2a')
    F.part(ell(79, 74, 8, 8), '#e8e4da', light=.1, marks=[(ell(83, 78, 3, 2), '#c9c4b8')])
    F.part(R(77, 68, 81, 80) + R(73, 72, 85, 76), '#c8323a', light=.25)
    F.part(limb(68, 62, 68, 72, 2.5), '#c9ced4', light=.5)
    F.part(poly((86, 86), (91, 94), (81, 94)), '#e0b030', shade=False)
    F.px(86, 91, '#1a1418'); F.px(85, 92, '#1a1418'); F.px(87, 92, '#1a1418')
    for (a, b, c, d) in ((70, 84, 76, 82), (84, 63, 90, 66)):
        F.line(a, b, c, d, '#c9ced4')

    pad_on_door = st == 'closed'
    dmarks = [(ell(48, 78, 8, 10), '#7e8a82'), (ell(46, 75, 4, 5), '#b2bcb2'), (ell(52, 83, 4, 5), '#5e6a62'),
              (ell(40, 96, 2, 3), '#8a4e2e'), (ell(57, 90, 1.5, 1.2), '#c9ced4'), (ell(42, 60, 1.6, 1.2), '#c9ced4'),
              (R(36, 99, 64, 103), '#7e8a82'), (limb(44, 31, 44, 44, 1.6), '#5a1414'), (limb(47, 31, 47, 39, 1.2), '#5a1414')]
    if st in ('closed', 'v1'):
        if st == 'v1':
            F.part(R(62, 31, 66, 103), '#141614', shade=False)
            F.part(R(35, 31, 62, 103), ST, tex=.07, marks=dmarks)
        else:
            F.part(R(35, 31, 64, 103), ST, tex=.07, marks=dmarks)
        louvers(F, 39, 59)
        F.line(43, 72, 52, 84, '#4e5a52')
        F.line(45, 70, 54, 80, '#c2ccc2')
        F.part(R(42, 55, 54, 60), '#e8e4da')
        F.px(46, 57, '#2a2a2a'); F.px(49, 57, '#2a2a2a')
        hx = 60 if st == 'closed' else 58
        F.part(limb(hx, 62, hx, 72, 2.5), '#c9ced4', light=.5)
        if pad_on_door:
            F.part(ell(62, 66, 2.5, 3), '#c9ced4', shade=False)
            F.flat(ell(62, 66, 1.2, 1.8), (0, 0, 0, 0)) if False else None
            F.part(R(59, 67, 65, 74), '#c9a040', light=.4, marks=[(R(61, 70, 63, 72), '#5a4010')])
        else:
            F.part(chain([(58, 72), (59, 78), (61, 82)], 1.5), '#c9ced4')
            F.part(R(58, 81, 64, 87), '#c9a040', light=.4)
    elif st == 'v2':
        F.part(R(58, 31, 65, 103), '#1a1e1c', shade=False, marks=[(R(58, 45, 65, 47), '#5e6a62')])
        F.part(poly((61, 60), (64, 60), (64, 80), (62, 82)), '#efeae0')
        F.part(poly((35, 31), (56, 28), (56, 106), (35, 103)), ST, tex=.07,
               marks=[(ell(46, 78, 7, 10), '#7e8a82'), (ell(44, 75, 3, 5), '#b2bcb2'), (limb(42, 31, 42, 44, 1.6), '#5a1414')])
        for y in range(36, 51, 3):
            F.line(38, y, 53, y - 1, '#2e3430')
            F.line(38, y + 1, 53, y, '#c2ccc2')
        F.part(poly((56, 28), (59, 29), (59, 105), (56, 106)), '#5e6a62')
        F.part(chain([(55, 72), (56, 78), (58, 82)], 1.5), '#c9ced4')
        F.part(R(55, 81, 61, 87), '#c9a040', light=.4)
    else:
        lit = st == 'glow'
        F.part(R(35, 31, 64, 103), '#5a6660' if lit else '#262a28', shade=not lit,
               marks=[(R(36, 32, 63, 36), '#3a4240' if lit else '#1a1e1c')])
        F.part(R(36, 45, 63, 48), '#8a958c' if lit else '#4e5852', light=.3)
        F.part(R(48, 50, 51, 53), '#c9ced4')
        if lit:
            F.part(R(39, 38, 47, 45), '#e8e4da', marks=[(R(41, 40, 45, 43), '#c8323a')])
            F.part(R(50, 40, 60, 45), '#efeae0', marks=[(R(50, 42, 60, 43), '#c9c4b8')])
            F.part(poly((44, 52), (56, 52), (59, 92), (41, 92)), '#4f8a6a', tex=.12,
                   marks=[(R(48, 52, 52, 58), '#3a6a50'), (R(44, 70, 56, 71), '#3a6a50')])
            F.part(ell(56, 98, 4, 2.5), '#efeae0')
        else:
            F.part(chain([(43, 56), (49.5, 52), (56, 56)], 1.2), '#8a8e94')
        # porta aberta (dentro)
        F.part(poly((35, 31), (16, 36), (16, 108), (35, 103)), '#7e8a82', tex=.06,
               marks=[(poly((18, 74), (33, 70), (33, 102), (18, 106)), '#6e7a72')])
        F.part(poly((20, 44), (31, 41), (31, 53), (20, 56)), '#c9d8e0', light=.5, marks=[(limb(22, 52, 29, 44, 1), '#ffffff')])
        F.part(poly((21, 62), (29, 60), (29, 69), (21, 71)), '#efe6c8', marks=[(ell(25, 64, 2, 2), '#c8907a')])
        F.part(poly((16, 36), (13, 37), (13, 108), (16, 108)), '#4e5a52')
        # cadeado quebrado no chão
        F.part(R(22, 108, 28, 113), '#c9a040', light=.4)
        F.part(chain([(23, 108), (22, 105), (25, 104)], 1.5), '#c9ced4')
    shake_puffs(F, st, [(30, 34), (98, 34), (34, 112), (96, 112)])
    if st == 'glow':
        glow(F, 50, 66, 40, '#fff1c0', 150)
        rays(F, 50, 66, 50, 10, 4, '#fff8e0', 55, wdeg=5, r0=16)
        fxflat(F, R(36, 32, 63, 102), '#fff6d8', 80)
        for (x, y) in ((24, 26), (64, 18), (100, 40)):
            sparkle(F, x, y, 2, '#fff6c8')
    return finish(F, shadow_layer(60, 42, 5, 95), st, (67, 93), .9)


# ================================================================ CARRO

CW, CH, CG = 256, 192, 180


def carro(st):
    F = Frame(CW, CH)
    hood = {'closed': 0, 'v1': 3, 'v2': 7}.get(st, 'up')
    hatch = {'closed': 0, 'v1': 0, 'v2': 4}.get(st, 'up')
    lit = st == 'glow'
    BODY, BODY2, ROOF, GL = '#4f7f8c', '#5a8a96', '#6a9aa6', '#2a3a4a'
    RU, RU2, BL = '#8a4e2e', '#5a2e1a', '#5a1414'
    A, B, C, D = (58, 62), (156, 62), (160, 78), (54, 78)
    E, G, Hh, Fp = (188, 100), (228, 106), (234, 120), (194, 114)
    J, K = (30, 100), (36, 114)

    # ---- porta-malas (traseira inclinada)
    if hatch == 'up' or hatch:
        F.part(poly(A, D, K, J), '#1a1418', shade=False)
        if hatch == 'up':
            F.part(ell(42, 94, 8, 5), '#2a2628', marks=[(ell(42, 94, 3, 2), '#6b6a66')])
            if lit:
                F.part(R(46, 80, 54, 88), '#8a6a42', light=.3)
                F.part(ell(36, 104, 4, 2.5), '#b83a2a', light=.3)
    if hatch != 'up':
        o = (-3, -5) if hatch else (0, 0)
        Jo, Ko = (J[0] + o[0], J[1] + o[1]), (K[0] + o[0], K[1] + o[1])
        F.part(poly(A, D, Ko, Jo), BODY, tex=.08)
        F.part(poly((A[0] - 1, A[1] + 4), (D[0] - 2, D[1] - 1), (Ko[0] + 4, Ko[1] - 6), (Jo[0] + 4, Jo[1] - 3)), GL,
               light=.12, marks=[(limb(44, 74, 48, 82, 1), '#4a6a80')])
        F.line(Ko[0] + 5, Ko[1] - 8, Jo[0] + 9, Jo[1] - 12, '#1a1418')

    # ---- teto
    F.part(poly(A, B, C, D), ROOF, tex=.1,
           marks=[(ell(80, 70, 6, 2.5), RU), (ell(81, 70, 3, 1.2), RU2), (ell(130, 66, 8, 2), '#7aaab6'),
                  (ell(140, 73, 4, 1.5), '#5a8a96')])
    for (x, y, c) in ((100, 68, '#6a7a3a'), (102, 69, '#8a6a2a'), (146, 70, '#6a7a3a'), (118, 74, '#8a6a2a')):
        F.px(x, y, c)
    F.line(64, 64, 60, 52, '#2a2a2e')
    F.line(60, 52, 66, 44, '#2a2a2e')
    # ---- para-brisa
    F.part(poly(B, E, Fp, C), '#3a5060', light=.15,
           marks=[(limb(166, 70, 184, 98, 1.5), '#6a8aa0'), (limb(172, 70, 186, 90, 1), '#5a7a90')])
    F.line(174, 86, 180, 80, '#a8c4d4')
    F.line(174, 86, 170, 94, '#a8c4d4')
    # ---- capô / motor
    if hood == 'up' or hood:
        F.part(poly(E, G, Hh, Fp), '#1e181c', shade=False)
        if hood == 'up':
            F.part(R(200, 104, 216, 114), '#5a6066', light=.3, marks=[(R(202, 106, 214, 108), '#7d848c')])
            F.part(ell(222, 110, 5, 3), '#2a2a2e', light=.3, marks=[(ell(222, 110, 2.5, 1.5), '#7d848c')])
            F.line(196, 110, 204, 104, '#c8323a')
            F.line(198, 112, 206, 106, '#1a1418')
            if lit:
                F.part(R(208, 112, 222, 118), '#2a2a2e', marks=[(R(209, 112, 212, 114), '#c8323a')])
            else:
                F.line(210, 116, 216, 119, '#c8323a')
                F.line(214, 114, 220, 118, '#3a3a3e')
    if hood == 'up':
        # capô em pé (lado de baixo)
        F.line(222, 114, 214, 78, '#9a9aa0')
        top_e, top_f = (E[0] + 16, E[1] - 42), (Fp[0] + 20, Fp[1] - 40)
        F.part(poly(E, Fp, top_f, top_e), '#4a4a50', tex=.1,
               marks=[(poly((E[0] + 3, E[1] - 5), (Fp[0] + 3, Fp[1] - 6), (top_f[0] - 1, top_f[1] + 6),
                            (top_e[0] + 1, top_e[1] + 6)), '#7a7468'),
                      (poly((E[0] + 6, E[1] - 14), (Fp[0] + 6, Fp[1] - 14), (Fp[0] + 7, Fp[1] - 17), (E[0] + 7, E[1] - 17)), '#5a564e'),
                      (poly((E[0] + 10, E[1] - 26), (Fp[0] + 10, Fp[1] - 26), (Fp[0] + 11, Fp[1] - 29), (E[0] + 11, E[1] - 29)), '#5a564e')])
        F.part(poly(top_e, top_f, (top_f[0] + 3, top_f[1] + 1), (top_e[0] + 3, top_e[1] + 1)), BODY2)
    else:
        u = hood
        F.part(poly(E, (G[0], G[1] - u), (Hh[0], Hh[1] - u), Fp), BODY2, tex=.1,
               marks=[(ell(212, 110 - u * .6, 5, 2), RU), (ell(200, 106, 2, 1), '#6a7a3a')])
        F.line(196, 104, 224, 108 - u, '#467480')

    # ---- cabine lateral
    F.part(poly(D, C, Fp, K), BODY, tex=.08)
    F.part(poly((58, 84), (98, 84), (98, 111), (43, 111)), GL, light=.12,
           marks=[(limb(70, 88, 62, 106, 2), '#4a6a80')])
    F.part(poly((106, 84), (156, 84), (181, 111), (106, 111)), GL, light=.12)
    # vidro estourado
    F.part(poly((124, 88), (134, 86), (142, 92), (146, 100), (138, 106), (128, 104), (122, 96)), '#0e0a10', shade=False)
    for (a, b) in ((122, 96, ), (134, 86), (146, 100), (128, 104), (150, 90), (112, 102)):
        pass
    for (x1, y1, x2, y2) in ((124, 92, 110, 86), (128, 104, 116, 110), (142, 92, 154, 86), (146, 100, 168, 108),
                             (138, 106, 142, 110), (122, 98, 108, 100)):
        F.line(x1, y1, x2, y2, '#a8c4d4')
    F.part(R(99, 82, 106, 113), '#26222a')

    # ---- lataria
    bm = F.part(poly((22, 124), (34, 115), (196, 113), (232, 119), (237, 128), (237, 160), (231, 166), (26, 166),
                     (20, 158)), BODY, tex=.1,
                marks=[(ell(72, 160, 26, 24), RU), (ell(72, 160, 24, 22), RU2), (ell(190, 160, 25, 23), RU),
                       (R(110, 156, 166, 166), RU), (ell(130, 160, 10, 3), RU2), (ell(52, 128, 8, 4), '#3e6a76'),
                       (ell(50, 127, 5, 2), '#6a9aa6'),
                       (limb(118, 130, 152, 126, 5), BL), (ell(146, 124, 3.5, 4), BL), (limb(150, 128, 151, 140, 1.4), BL),
                       (limb(124, 130, 124, 146, 1.2), BL), (limb(136, 128, 137, 136, 1), BL),
                       (R(24, 156, 236, 166), '#3e6a76')])
    F.line(36, 117, 194, 115, '#7aaab6')
    # friso
    F.part(R(30, 135, 232, 139), '#26222a', clip=bm, outline=False)
    # porta
    F.line(104, 116, 104, 162, '#26343a')
    F.line(105, 116, 105, 162, '#7aaab6')
    F.line(170, 118, 172, 160, '#26343a')
    F.line(104, 162, 172, 160, '#26343a')
    F.part(R(110, 121, 121, 124), '#26222a', light=.3)
    F.px(112, 122, '#c9ced4')
    F.part(ell(56, 126, 4, 3), '#467480', light=.3)
    F.part(poly((182, 103), (193, 101), (193, 110), (184, 110)), '#26222a', light=.3)
    # caixas de roda
    F.part(ell(72, 160, 21, 19), '#141014', shade=False, outline=False, clip=bm)
    F.part(ell(190, 160, 21, 19), '#141014', shade=False, outline=False, clip=bm)
    # pneus
    F.part(ell(72, 163, 17, 16.5), '#1e1a1c', tex=.2, light=.15)
    F.part(ell(72, 163, 9, 9), '#8d969c', light=.35, marks=[(ell(72, 163, 3, 3), '#5a6066'), (ell(75, 166, 4, 3), RU)])
    for a in range(0, 360, 90):
        F.px(72 + 5.5 * math.cos(math.radians(a + 45)), 163 + 5.5 * math.sin(math.radians(a + 45)), '#2a2e32')
    F.part(ell(190, 168, 19.5, 12), '#1e1a1c', tex=.2, light=.15)
    F.part(ell(190, 165, 8.5, 8), '#7d848c', light=.3, marks=[(ell(190, 165, 2.6, 2.6), '#3a3e42')])
    F.line(176, 174, 204, 174, '#2c282a')
    # para-choques, luzes
    F.part(R(16, 144, 32, 160), '#2c2a2e', light=.25, marks=[(R(16, 150, 32, 151), '#1a181c')])
    F.part(R(224, 144, 243, 160), '#2c2a2e', light=.25, marks=[(R(224, 150, 243, 151), '#1a181c')])
    F.part(R(22, 121, 31, 134), '#a82a2a', light=.35, marks=[(R(22, 127, 31, 128), '#e0a040')])
    F.part(R(225, 121, 237, 132), '#d8d8c0', light=.3, marks=[(R(225, 128, 237, 132), '#9a9a88')])
    F.line(227, 122, 235, 131, '#3a3a3e')
    F.line(231, 122, 229, 131, '#3a3a3e')
    F.part(R(230, 133, 237, 137), '#e08a2a')
    # placa caída no chão
    F.part(poly((10, 172), (38, 174), (37, 184), (9, 182)), '#e6e2d6', light=.2,
           marks=[(poly((10, 172), (38, 174), (38, 176), (10, 174)), '#3a5a9a')])
    for x in (13, 16, 19, 24, 27, 30, 33):
        F.line(x, 178, x + 1, 181, '#3a3a40')
    F.part(R(30, 175, 33, 177), BL, outline=False)
    # cacos de vidro
    for (x, y) in ((120, 182), (126, 184), (134, 181), (142, 185), (150, 183), (158, 186), (138, 187)):
        F.px(x, y, '#cfe4f0')
        F.px(x + 1, y, '#7aa0b8')

    # porta-malas em pé
    if hatch == 'up':
        F.line(38, 108, 36, 76, '#9a9aa0')
        ta, td = (A[0] - 30, A[1] - 30), (D[0] - 32, D[1] - 26)
        F.part(poly(A, D, td, ta), BODY, tex=.08)
        F.part(poly((A[0] - 4, A[1] - 2), (D[0] - 4, D[1] - 3), (td[0] + 8, td[1] + 6), (ta[0] + 8, ta[1] + 6)), GL, light=.2,
               marks=[(limb(A[0] - 10, A[1] - 6, D[0] - 12, D[1] - 8, 1), '#4a6a80')])
        F.part(poly((ta[0] + 2, ta[1] + 2), (td[0] + 2, td[1] + 2), (td[0] + 5, td[1] + 5), (ta[0] + 5, ta[1] + 5)), '#a82a2a')
    shake_puffs(F, st, [(236, 116), (24, 110), (60, 182), (200, 182)])
    if lit:
        opening_light(F, 212, 108, 30, h=60)
        opening_light(F, 40, 94, 20, h=40)
    return finish(F, shadow_layer(128, 116, 9, 100, CW, CH, CG), st, (130, 144), 1.3)


# ================================================================ ANEL

def anel(k):
    F = Frame(64, 64)
    cx = cy = 31.5
    yy, xx = np.mgrid[0:64, 0:64]
    d = np.hypot(xx - cx, yy - cy)
    ang = np.degrees(np.arctan2(xx - cx, -(yy - cy))) % 360
    done = k >= 9
    if done:
        glow(F, cx, cy, 31, '#f2c230', 140, layer=F.a)
    ring = (d >= 17) & (d <= 24)
    trk = F.layer()
    trk[ring] = (28, 22, 34, 190)
    trk[ring & (d < 18.3)] = (70, 60, 84, 210)
    F.a[:] = over(F.a, trk)
    ol = ((d > 24) & (d <= 25.4)) | ((d < 17) & (d >= 15.7))
    F.a[ol] = (22, 14, 18, 255)
    frac = 360 if done else k * 45
    fill = ring & (ang <= frac + .01)
    if done:
        base, edge, hi = (242, 194, 48), (184, 134, 26), (255, 240, 170)
    else:
        base, edge, hi = (244, 226, 168), (200, 154, 58), (255, 248, 222)
    F.a[fill, :3] = base
    F.a[fill, 3] = 255
    F.a[fill & (d > 22.6), :3] = edge
    F.a[fill & (d < 18.4), :3] = hi
    lit = fill & (ang > 270) & (d > 18.4) & (d < 20)
    F.a[lit, :3] = hi
    # divisões a cada 1/8 no trilho
    for i in range(8):
        a = math.radians(i * 45)
        for r in (17.5, 20.5, 23.5):
            x, y = cx + r * math.sin(a), cy - r * math.cos(a)
            if not done and i * 45 > frac:
                F.px(x, y, '#0e0a10')
    if not done:
        a = math.radians(frac)
        tx, ty = cx + 20.5 * math.sin(a), cy - 20.5 * math.cos(a)
        sparkle(F, tx, ty, 3, '#fff6d8')
        # lupa
        F.part(limb(35, 35, 41, 41, 3.4), '#7a4a2a', light=.3)
        F.part(ell(29, 29, 6.5, 6.5), '#b8bcc0', light=.5)
        F.part(ell(29, 29, 4.2, 4.2), '#7ab8d8', light=.5, outline=False)
        F.px(27, 27, '#ffffff')
        F.px(28, 26, '#e8f6ff')
    else:
        F.part(chain([(23, 32), (29, 38), (41, 25)], 4.4, 3.6), '#5bd46e', shade=False, ol='#14361a')
        F.px(24, 31, '#b6f5c0')
        for (x, y) in ((8, 8), (55, 8), (8, 55), (55, 55)):
            sparkle(F, x, y, 3, '#fff6c8')
    return compose(F)


# ================================================================ FX de abertura

def star_r(F, x, y, r, col, ol, deg):
    pts = []
    for i in range(10):
        a = math.radians(deg) - math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * .45
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    F.part([pts], col, shade=False, ol=ol, layer=F.fx)
    F.px(x - r * .25, y - r * .3, '#ffffff', F.fx)


def fx_abrir(rar, kind, i):
    base, light, dark = RAR[rar]
    F = Frame(192, 192)
    cx, cy, gy = 96, 96, 132
    if kind == 'flash':
        r1 = (60, 84, 92)[i]
        al = (220, 170, 105)[i]
        glow(F, cx, cy, r1 * .85, base, al * .9)
        rays(F, cx, cy, r1, 12, i * 8, base, al * .55, wdeg=6, r0=6)
        rays(F, cx, cy, r1 * .8, 12, i * 8 + 15, light, al * .5, wdeg=3, r0=8)
        cr = (14, 17, 12)[i]
        fxflat(F, ell(cx, cy, cr + 5, cr + 5), light, al)
        fxflat(F, ell(cx, cy, cr, cr), '#ffffff', min(255, al + 30))
        for j in range(4 + i):
            a = math.radians(j * 77 + i * 31)
            rr = 30 + i * 14 + (j % 3) * 6
            sparkle(F, cx + rr * math.cos(a), cy + rr * math.sin(a), 2, light)
    elif kind == 'wave':
        rx = (34, 62, 86)[i]
        t = (10, 6, 3)[i]
        al = (225, 165, 95)[i]
        ry = rx * .38
        yy, xx = np.mgrid[0:192, 0:192]
        e_out = ((xx - cx) / rx) ** 2 + ((yy - gy) / ry) ** 2
        e_in = ((xx - cx) / (rx - t)) ** 2 + ((yy - gy) / max(1, ry - t * .55)) ** 2
        ring = (e_out <= 1) & (e_in > 1)
        if i == 0:
            fxmask(F, e_out <= 1, base, 50)
        fxmask(F, ring, base, al)
        e_in2 = ((xx - cx) / (rx - t * .5)) ** 2 + ((yy - gy) / max(1, ry - t * .3)) ** 2
        fxmask(F, (e_out <= 1) & (e_in2 > 1) & (yy < gy), light, min(255, al + 20))
        e_o2 = ((xx - cx) / (rx + 1.2)) ** 2 + ((yy - gy) / (ry + 1)) ** 2
        fxmask(F, (e_o2 <= 1) & (e_out > 1), dark, al * .7)
        for j in range(8):
            a = math.radians(j * 45 + 10 * i)
            x, y = cx + (rx + 2) * math.cos(a), gy + (ry + 1) * math.sin(a)
            if i < 2:
                dust(F, x, y - 1, 2 - i)
    else:
        n = 7
        for j in range(n):
            a = math.radians(-170 + j * (160 / (n - 1)))
            r = (36 if i == 0 else 62) + (j % 2) * 10
            x = cx + r * math.cos(a) * 1.15
            y = cy + r * math.sin(a) * (0.85 if i == 0 else .45) + (0 if i == 0 else 30 + (j % 3) * 6)
            star_r(F, x, y, (7 if i == 0 else 5.5) - (j % 2) * 1.5, light, dark, j * 25 + i * 40)
        rs = np.random.RandomState(7 + i)
        for j in range(18 if i == 0 else 13):
            x = cx + rs.randint(-30, 31)
            y = cy + 8 - rs.randint(0, 46) - i * 22
            if j % 3 == 0:
                sparkle(F, x, y, 3, light)
            elif j % 3 == 1:
                F.px(x, y, '#ffffff', F.fx)
                F.px(x + 1, y, light, F.fx)
            else:
                fxflat(F, ell(x, y, 1.6, 1.6), base, 200)
                F.px(x, y, light, F.fx)
        glow(F, cx, cy - i * 12, 30, base, 70 - i * 30)
    return compose(F)


# ================================================================ RARIDADE (aura de chão)

def raridade(rar, i):
    base, light, dark = RAR[rar]
    F = Frame(64, 64)
    cx, cy = 32, 52
    s = (0.85, 1.0)[i]
    yy, xx = np.mgrid[0:64, 0:64]
    rx, ry = 24 * s, 9 * s
    e = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
    for lim, a in ((1.0, 70), (.6, 110), (.3, 150)):
        fxmask(F, e <= lim, base, a * (0.75 + .25 * i))
    fxmask(F, (e <= 1) & (e > .8), light, 150 + 60 * i)
    beam_h = {'comum': 0, 'incomum': 20, 'raro': 34, 'lunar': 44}[rar]
    if beam_h:
        hh = beam_h * (0.85 + .15 * i)
        bw = 7 + 2 * i
        for y in range(int(cy - hh), int(cy)):
            t = min(1.0, (cy - y) / hh)
            a = int(round((1 - t) ** 1.3 * (120 + 50 * i) / 24) * 24)
            if a <= 0:
                continue
            w = bw * (1 - .3 * t)
            m = (yy == y) & (abs(xx - cx) <= w)
            fxmask(F, m, base, a)
            fxmask(F, m & (abs(xx - cx) <= w * .35), light, a)
    sp = {'comum': [(18, 44)], 'incomum': [(14, 40), (48, 30)], 'raro': [(12, 34), (50, 24), (24, 18)],
          'lunar': [(10, 30), (52, 20), (22, 12), (44, 40), (30, 6)]}[rar]
    for j, (x, y) in enumerate(sp):
        if (j + i) % 2 == 0:
            sparkle(F, x, y - i * 2, 2 if i == 0 else 3, '#f2c230' if rar == 'lunar' else light)
        else:
            F.px(x, y, '#f2c230' if rar == 'lunar' else light, F.fx)
    return compose(F)


# ================================================================ ITENS (64×64)

IG = 52


def ishadow(rx, cx=32):
    return shadow_layer(cx, rx, 3.5, 90, 64, 64, IG)


def item_sucata(F):
    F.part(poly((8, 44), (32, 34), (40, 46), (16, 54)), '#6b6a66', tex=.15,
           marks=[(ell(24, 46, 7, 3), '#8a4e2e'), (ell(22, 47, 3, 1.5), '#5a2e1a'), (limb(14, 46, 34, 38, 1), '#8a8a86'),
                  (limb(18, 50, 38, 42, 1), '#4a4a48')])
    F.px(30, 44, '#1a1418')
    F.px(18, 48, '#1a1418')
    F.part(limb(30, 40, 52, 28, 7), '#7d848c', tex=.1, marks=[(ell(42, 34, 4, 3), '#8a4e2e')])
    F.part(ell(52.5, 28, 3.5, 3.5), '#5a6066')
    F.part(ell(52.5, 28, 1.8, 1.8), '#1a1418', outline=False, shade=False)
    hexa = [(46 + 5 * math.cos(math.radians(a)), 48 + 3.6 * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    F.part([hexa], '#8d969c', light=.4)
    F.part(ell(46, 48, 1.8, 1.2), '#2a2a2e', outline=False)
    F.part(limb(12, 30, 22, 26, 2.5), '#9a9a96', marks=[(ell(12, 30, 2, 2), '#c9ced4')])
    for k in range(4):
        F.px(14 + k * 2, 29 - k, '#5a5a58')


def item_pano(F):
    F.part(poly((8, 42), (46, 38), (54, 46), (14, 52)), '#3f5a8a', tex=.25,
           marks=[(poly((8, 42), (46, 38), (48, 40), (10, 44)), '#5a7aa8')])
    F.part(poly((14, 46), (54, 46), (54, 50), (14, 52)), '#2e4468')
    top = poly((12, 30), (44, 26), (52, 36), (16, 42))
    mk = []
    for k in range(5):
        t = k / 5.
        x0 = 12 + 4 * t + 32 * 0
        mk.append((poly((12 + t * 4 + 6 * k * 0 + 6 * k, 30 - k * .8), (14 + 6 * k, 30 - k * .8),
                        (18 + 6 * k, 42 - k * .8), (16 + 6 * k, 42 - k * .8)), '#e8dcc0'))
    for k in range(3):
        y = 31 + k * 3.5
        mk.append((poly((12 + k, y - k * .4), (46 + k * 2, y - 4 - k * .4), (47 + k * 2, y - 3 - k * .4), (13 + k, y + 1 - k * .4)),
                   '#e8dcc0'))
    F.part(top, '#a83030', marks=mk, tex=.1)
    F.part(poly((16, 42), (52, 36), (52, 40), (16, 46)), '#7a2020')
    for x in range(18, 52, 3):
        F.px(x, 46 - (x - 16) * .16, '#e8dcc0')
    F.part(chain([(52, 38), (56, 42), (58, 48)], 3, 2), '#a83030')


def item_lata(F):
    # deitada
    F.part(R(34, 40, 54, 50), '#4f8a4a', light=.3, marks=[(R(34, 43, 54, 46), '#e8dcc0'), (R(40, 40, 44, 50), '#3a6a3a')])
    F.part(ell(54, 45, 3, 5), '#c9c3b0', light=.4, marks=[(ell(54, 45, 1.5, 3.5), '#9a948a')])
    # em pé
    F.part(ell(26, 48, 10, 3.8), '#8d969c')
    F.part(R(16, 24, 36, 48), '#b83a2a', light=.3, tex=.05,
           marks=[(R(16, 24, 36, 28), '#c9c3b0'), (R(16, 45, 36, 48), '#c9c3b0'), (R(16, 33, 36, 38), '#e0b030'),
                  (ell(22, 31, 3, 2.5), '#efe6c8'), (ell(31, 41, 2.5, 3), '#7a2020'), (R(16, 28, 36, 29), '#7a7a74')])
    F.part(ell(26, 24, 10, 3.8), '#c9c3b0', light=.4, marks=[(ell(26, 24, 7.5, 2.6), '#a8a49a')])
    F.part(ell(28, 24, 2.5, 1.2), '#e8e4da', outline=False)
    F.px(22, 23, '#ffffff')
    F.line(18, 30, 18, 44, '#e86a5a')


def item_pilha(F):
    def pilha(x0, y0, x1, y1, c1, c2):
        F.part(limb(x0, y0, x1, y1, 9), c1, light=.35)
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        F.part(limb(mx, my, x1, y1, 9), c2, light=.35, outline=False)
        F.part(limb(x0, y0, x0 + (x1 - x0) * .08, y0 + (y1 - y0) * .08, 8), '#8d969c', light=.4)
        ux, uy = (x1 - x0), (y1 - y0)
        L = math.hypot(ux, uy)
        F.part(ell(x1 + ux / L * 4.5, y1 + uy / L * 4.5, 2, 2), '#c9ced4', light=.5)
        F.line(x0 + 2, y0 - 3, x1 - 2, y1 - 3, '#ffffff')
    pilha(14, 44, 44, 38, '#2a2a2e', '#c8782a')
    pilha(20, 28, 46, 46, '#3a3a40', '#4fb06a')


def item_antidoto(F):
    glow(F, 30, 38, 22, '#5bd46e', 90)
    F.part(poly((20, 30), (40, 30), (44, 38), (44, 50), (16, 50), (16, 38)), '#9cc4bc', light=.3,
           marks=[(poly((16, 40), (44, 40), (44, 50), (16, 50)), '#5bd46e'), (R(16, 40, 44, 41.5), '#a8f0b8'),
                  (R(20, 42, 40, 47), '#efe6c8')])
    F.part(R(27, 43, 33, 46) + R(28.5, 41.5, 31.5, 47.5), '#2a8a46', shade=False, outline=False)
    F.part(R(25, 21, 35, 31), '#9cc4bc', light=.3)
    F.part(R(24, 13, 36, 22), '#b5854a', tex=.3, light=.3)
    F.line(19, 33, 18, 46, '#ffffff')
    F.px(22, 31, '#ffffff')
    F.px(26, 23, '#e8f6ff')
    for (x, y) in ((46, 22), (12, 26)):
        sparkle(F, x, y, 2, '#b6f5c0')


def item_madeira(F):
    for k in range(3):
        dy = -k * 7
        dx = k * 2
        F.part(poly((8 + dx, 40 + dy), (46 + dx, 32 + dy), (52 + dx, 37 + dy), (14 + dx, 45 + dy)), '#a87444', tex=.15,
               marks=[(limb(14 + dx, 41 + dy, 40 + dx, 36 + dy, 1), '#8b5e34'), (ell(30 + dx, 38 + dy, 2, 1), '#6e4828')])
        F.part(poly((14 + dx, 45 + dy), (52 + dx, 37 + dy), (52 + dx, 42 + dy), (14 + dx, 50 + dy)), '#7d5430', tex=.1)
        F.part(poly((8 + dx, 40 + dy), (14 + dx, 45 + dy), (14 + dx, 50 + dy), (8 + dx, 45 + dy)), '#c9a070',
               marks=[(ell(11 + dx, 45 + dy, 1.2, 1.6), '#8b5e34')])
    F.part(limb(26, 22, 30, 48, 2.5), '#b59a62', light=.3)
    F.part(limb(38, 20, 42, 46, 2.5), '#b59a62', light=.3)


def item_pregos(F):
    F.part(poly((10, 40), (24, 34), (30, 46), (16, 52)), '#b08a5a', tex=.2,
           marks=[(poly((22, 35), (24, 34), (30, 46), (27, 47)), '#8a6a42')])
    nails = [(26, 40, 40, 36), (28, 44, 44, 46), (30, 48, 46, 40), (32, 38, 40, 50), (36, 46, 52, 44),
             (24, 46, 38, 50), (40, 36, 54, 40), (34, 42, 50, 36), (14, 44, 22, 38), (44, 48, 56, 50)]
    for j, (a, b, c, d) in enumerate(nails):
        F.line(a, b, c, d, '#8a8478')
        F.line(a, b - 1, c, d - 1, '#d8d2c2')
        F.part(ell(a, b - .5, 1.8, 1.4), '#c9c3b0' if j % 3 else '#8a4e2e', light=.4)


def item_corda(F):
    cx, cy = 30, 40
    F.part(ell(cx, cy + 2, 19, 10.5), '#8a7448')
    F.part(ell(cx, cy, 19, 10.5), '#b59a62', tex=.2, light=.3)
    F.part(ell(cx, cy, 13, 7), '#9a8050', tex=.2)
    F.part(ell(cx, cy - .5, 12.5, 6.5), '#b59a62', tex=.2, light=.25)
    F.part(ell(cx, cy, 7, 3.6), '#6a5430')
    # torção
    for r, n in ((16, 26), (10, 18)):
        for i in range(n):
            a = 2 * math.pi * i / n
            x, y = cx + r * math.cos(a), cy + r * .55 * math.sin(a)
            F.px(x, y, '#6a5430')
            F.px(x + 1, y - 1, '#d8c08a')
    F.part(chain([(46, 42), (52, 46), (56, 44)], 4, 3), '#b59a62', light=.3)
    for k in range(3):
        F.line(56, 44, 59, 41 + k * 2, '#d8c08a')


def item_fita(F):
    cx, cy = 28, 38
    F.part(ell(cx, cy + 5, 17, 9) + R(cx - 17, cy, cx + 17, cy + 5), '#7d848c')
    F.part(ell(cx, cy, 17, 9), '#b8bcc0', tex=.1, light=.35)
    for r in (14, 11):
        for i in range(30):
            a = 2 * math.pi * i / 30
            F.px(cx + r * math.cos(a), cy + r * 9 / 17 * math.sin(a), '#9a9ea4')
    F.part(ell(cx, cy, 9, 4.8), '#b08a5a', light=.2)
    F.part(ell(cx, cy + .5, 7, 3.4), '#4a3a28', shade=False)
    F.part(poly((42, 44), (56, 46), (58, 50), (55, 49), (53, 52), (50, 49), (44, 49)), '#a8acb0', light=.35,
           marks=[(R(46, 46, 47, 49), '#8a8e94')])


def item_municao(F):
    # tampa basculada para trás (escorço) com alça
    F.part(poly((12, 27), (46, 27), (44, 17), (14, 17)), '#4a5430', tex=.12,
           marks=[(poly((15, 25), (43, 25), (42, 19), (16, 19)), '#3e4628')])
    F.part(R(24, 14, 34, 17), '#2e3420')
    # boca da caixa com cartuchos em pé
    F.part(R(10, 26, 48, 38), '#6b7a42', light=.3)
    F.part(R(13, 28, 45, 36), '#1e1e16', shade=False)
    for i in range(2):
        for j in range(6):
            x, y = 16.5 + j * 5.2, 30 + i * 4
            F.part(ell(x, y, 2.4, 1.9), '#d8a840', light=.4)
            F.part(ell(x, y - .3, 1.4, 1.1), '#c07040', light=.5, outline=False)
            F.px(x - .6, y - 1, '#f8d8a0')
    # frente
    F.part(R(10, 38, 48, 51), '#5f6a3a', tex=.14,
           marks=[(R(10, 47, 48, 51), '#4a5430'), (ell(42, 48, 3, 1.5), '#8a4e2e'), (ell(14, 41, 1.5, 1), '#8a8a6a')])
    F.part(R(15, 41, 36, 45), '#e0b030', shade=False, outline=False)
    for x in (17, 20, 22, 26, 29, 33):
        F.px(x, 43, '#3e4628')
    F.part(R(40, 37, 45, 44), '#8d969c', light=.45)
    F.px(42, 41, '#2a2e32')
    # cartuchos soltos
    for k in range(2):
        y = 50 + k * 4
        F.part(limb(48, y, 56, y - 2, 3.2), '#d8a840', light=.45)
        F.part(ell(57.5, y - 2.3, 2, 1.5), '#c07040', light=.4)
        F.px(47, y, '#8a6a20')


def item_agua(F):
    # deitada atrás
    F.part(limb(30, 44, 54, 40, 10), '#8fc0d8', light=.35, marks=[(R(30, 42, 56, 50), '#5a9ac0'), (R(40, 36, 44, 50), '#3a6aa8')])
    F.part(R(54, 38, 58, 43), '#2a5ac0', light=.4)
    # em pé
    body = poly((16, 26), (20, 20), (26, 17), (30, 17), (36, 20), (40, 26), (40, 48), (37, 51), (19, 51), (16, 48))
    F.part(body, '#a8d0e4', light=.35,
           marks=[(R(16, 30, 40, 52), '#5a9ac0'), (R(16, 34, 40, 41), '#3a6aa8'), (R(16, 30, 40, 31), '#c8e8f8'),
                  (R(16, 44, 40, 45), '#4a8ab0')])
    for x in (22, 27, 32):
        F.px(x, 37, '#efe6c8')
        F.px(x + 1, 36, '#efe6c8')
    F.part(R(25, 12, 31, 18), '#a8d0e4', light=.3)
    F.part(R(24, 8, 32, 13), '#2a5ac0', light=.4, marks=[(R(24, 11, 32, 12), '#1a3a88')])
    F.line(19, 24, 19, 47, '#ffffff')
    F.px(21, 22, '#ffffff')


def item_atadura(F):
    F.part(chain([(30, 46), (38, 49), (46, 46), (54, 48), (58, 45)], 7, 6), '#e2dccf', tex=.3,
           marks=[(ell(46, 47, 2, 1.5), '#a83030')])
    F.part(R(16, 30, 34, 48), '#ece6da', tex=.25, light=.3,
           marks=[(R(16, 34, 34, 35), '#cfc8b8'), (R(16, 40, 34, 41), '#cfc8b8')])
    F.part(ell(34, 39, 5, 9), '#f4efe4', light=.2)
    for r in (3.5, 2):
        for i in range(16):
            a = 2 * math.pi * i / 16
            F.px(34 + r * .55 * math.cos(a), 39 + r * math.sin(a), '#bfb8a8')
    F.part(ell(16, 39, 2, 9), '#d8d2c2')
    F.part(R(22, 44, 28, 47), '#b8bcc0', light=.5)


def item_kit(F):
    F.part(chain([(22, 22), (24, 16), (40, 16), (42, 22)], 3), '#3a3a40', light=.3)
    F.part(R(10, 22, 54, 30), '#f2eee4', light=.3, tex=.06, marks=[(ell(44, 26, 4, 1.5), '#cfc8b8')])
    F.part(R(10, 30, 54, 50), '#e8e4da', tex=.08,
           marks=[(R(10, 46, 54, 50), '#cfc8b8'), (ell(48, 44, 3, 2), '#a89c84'), (ell(16, 34, 1.6, 2.5), '#6a1a1a')])
    F.part(R(29, 33, 35, 47) + R(25, 37, 39, 43), '#c8323a', light=.3)
    F.part(R(10, 22, 14, 50), '#5a5e64')
    F.part(R(50, 22, 54, 50), '#5a5e64')
    for x in (18, 44):
        F.part(R(x - 2, 29, x + 2, 33), '#c9ced4', light=.5)
    F.line(10, 30, 54, 30, '#8a8478')


def gear(F, cx, cy, ro, ri, n, col, hole=2.5):
    pts = []
    for i in range(n * 4):
        a = 2 * math.pi * i / (n * 4)
        r = ro if (i % 4) in (0, 1) else ri
        pts.append((cx + r * math.cos(a), cy + r * .62 * math.sin(a)))
    F.part([[(x, y + 3) for x, y in pts]], '#4e5458')
    F.part([pts], col, light=.35, tex=.08,
           marks=[(ell(cx, cy, ri * .65, ri * .4), '#7d848c'), (ell(cx - ri * .7, cy + ri * .3, ri * .25, ri * .12), '#8a4e2e')])
    F.part(ell(cx, cy, hole, hole * .62), '#1a1418', shade=False)


def item_pecas(F):
    gear(F, 24, 40, 15, 11.5, 10, '#9aa2a8', 3)
    gear(F, 46, 28, 9, 6.5, 8, '#b8a060', 2)
    F.part(limb(40, 48, 54, 44, 3), '#8d969c', light=.4)
    for k in range(4):
        F.px(43 + k * 3, 46 - k * .8, '#4e5458')
    hexa = [(39 + 3.4 * math.cos(math.radians(a)), 48.5 + 3 * math.sin(math.radians(a))) for a in range(0, 360, 60)]
    F.part([hexa], '#c9ced4', light=.4)
    pts = [(8 + k * 2.4, 22 + (2 if k % 2 else -2)) for k in range(7)]
    for p, q in zip(pts[:-1], pts[1:]):
        F.line(p[0], p[1], q[0], q[1], '#c9ced4')
        F.line(p[0], p[1] + 1, q[0], q[1] + 1, '#5a6066')


def item_gasolina(F):
    F.part(R(16, 14, 32, 19), '#9a2a20', light=.3)
    F.part(R(19, 15, 23, 18) + R(25, 15, 29, 18), '#1a1418', shade=False, outline=False)
    F.part(poly((14, 19), (44, 19), (46, 23), (12, 23)), '#d0503a', light=.3)
    F.part(R(12, 23, 46, 51), '#b83a2a', tex=.1,
           marks=[(limb(16, 27, 42, 47, 2), '#9a2a20'), (limb(42, 27, 16, 47, 2), '#9a2a20'),
                  (limb(16, 26, 42, 46, 1), '#d8604a'), (R(12, 48, 46, 51), '#8a2418'), (ell(40, 40, 3, 2), '#6b6a66')])
    F.part(R(20, 32, 38, 38), '#efe6c8', marks=[(R(22, 34, 36, 35), '#3a2a2a')])
    F.part(ell(40, 16, 4, 3) + R(36, 16, 44, 20), '#e0b030', light=.4)
    F.part(limb(38, 26, 38, 32, 2), '#4a3a28', outline=False)
    F.part(ell(48, 52, 4, 1.5), '#3a3448', shade=False, outline=False)


def item_bateria(F):
    F.part(R(10, 26, 52, 34), '#3a3a40', light=.3)
    F.part(R(10, 34, 52, 51), '#2a2a2e', tex=.1, marks=[(R(10, 48, 52, 51), '#1a1a1e')])
    F.part(R(14, 37, 42, 45), '#d8a830', marks=[(R(14, 40, 42, 41), '#2a2a2e'), (R(18, 42, 30, 43), '#efe6c8')])
    F.part(R(45, 37, 49, 45), '#c8323a', light=.3)
    for (x, c) in ((18, '#c8323a'), (44, '#2a2a2e')):
        F.part(R(x - 3, 22, x + 3, 29), '#8d969c', light=.4)
        F.part(ell(x, 22, 3, 1.5), '#c9ced4', light=.4)
        F.part(ell(x, 27, 4.5, 2), c, light=.3)
    F.px(16, 25, '#a8e0b8')
    F.px(20, 24, '#e8f6e8')
    F.part(chain([(18, 22), (22, 16), (40, 16), (44, 22)], 2), '#1a1a1e')
    F.part(chain([(52, 30), (56, 36), (58, 46)], 2), '#c8323a')


def item_pedra(F):
    F.part(poly((8, 42), (14, 32), (26, 28), (36, 34), (38, 46), (28, 52), (12, 50)), '#8e8a84', tex=.2,
           marks=[(poly((14, 32), (26, 28), (30, 34), (16, 38)), '#aaa69e'), (poly((30, 36), (36, 34), (38, 46), (32, 46)), '#77736e'),
                  (ell(16, 46, 3, 2), '#5f7a4a'), (limb(20, 40, 28, 46, 1), '#5e5a56')])
    F.part(poly((34, 46), (40, 38), (50, 38), (56, 46), (50, 52), (38, 52)), '#77736e', tex=.2,
           marks=[(poly((40, 38), (50, 38), (52, 42), (42, 43)), '#949088'), (ell(52, 50, 2, 1), '#5f7a4a')])
    F.part(ell(26, 54, 2.5, 1.5), '#8e8a84')


def item_polvora(F):
    F.part(ell(46, 50, 9, 3), '#1e1a1c', shade=False)
    for (x, y) in ((40, 48), (52, 49), (55, 51), (38, 51), (48, 47)):
        F.px(x, y, '#4a4448')
    sack = poly((14, 30), (24, 26), (36, 26), (44, 32), (46, 44), (40, 51), (18, 51), (12, 44))
    F.part(sack, '#a88a5a', tex=.4,
           marks=[(ell(22, 34, 3, 4), '#c0a070'), (ell(42, 46, 3, 3), '#141014'), (R(12, 46, 46, 51), '#8a6e44')])
    # chama pintada
    F.part(poly((28, 32), (33, 38), (34, 44), (30, 47), (25, 46), (23, 41), (26, 36)), '#c8323a', shade=False, outline=False)
    F.part(poly((28, 38), (31, 42), (30, 46), (27, 46), (26, 43)), '#e0b030', shade=False, outline=False)
    F.part(poly((22, 26), (38, 26), (40, 20), (34, 18), (30, 21), (26, 18), (20, 20)), '#b59a6a', tex=.3)
    F.part(limb(21, 25, 39, 25, 3), '#6a4a2a', light=.3)
    F.part(chain([(39, 25), (44, 22), (46, 26)], 1.6), '#6a4a2a')


def item_horta(F):
    for (x0, y0, x1, y1) in ((8, 46, 38, 36), (12, 38, 40, 30)):
        F.part(limb(x0, y0, x1, y1, 8, 3), '#7a4a2a', tex=.3,
               marks=[(limb(x0 + 6, y0 - 4, x0 + 7, y0 + 3, 1), '#5a3218'), (limb(x0 + 14, y0 - 6, x0 + 15, y0 + 1, 1), '#5a3218')])
        F.part(ell(x0, y0, 3, 3.6), '#f0e8d0', marks=[(ell(x0, y0, 1.2, 1.4), '#d8c89a')])
    # milho
    F.part(poly((30, 50), (40, 44), (58, 42), (52, 50)), '#6a9a3a', tex=.15, marks=[(limb(34, 48, 54, 44, 1), '#8ab85a')])
    F.part(limb(32, 44, 52, 34, 9, 6), '#e8c040', light=.3)
    for i in range(6):
        for j in range(3):
            t = i / 6.
            x = 34 + 17 * t + (j - 1) * 2.4 * .45
            y = 43 - 9 * t + (j - 1) * 2.4 * .9
            F.px(x, y, '#c89a20')
    F.part(poly((30, 44), (38, 36), (40, 44), (34, 52)), '#7aaa4a', tex=.15)
    F.part(poly((32, 48), (42, 42), (46, 46), (36, 52)), '#5f8a3a')
    for k in range(3):
        F.line(52, 34, 56 + k, 28 + k * 2, '#8a5a2a')


def item_coracao(F):
    glow(F, 32, 32, 26, '#ff7088', 60)
    pts = []
    for i in range(48):
        t = 2 * math.pi * i / 48
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((32 + x * 1.05, 31 - y * 1.05))
    F.part([pts], '#d8344a', light=.35, dark=.4,
           marks=[(ell(23, 24, 5, 3.5, rot=-30), '#f07088'), (ell(40, 42, 6, 4), '#a8203a')])
    F.part(ell(22, 23, 2.2, 1.4, rot=-30), '#ffd0d8', shade=False, outline=False)
    F.px(26, 21, '#ffffff')
    plus(F, 46, 16, '#6fdc7a', 1.6)


ITEMS = [(item_sucata, 22), (item_pano, 23), (item_lata, 18), (item_pilha, 20), (item_antidoto, 15),
         (item_madeira, 22), (item_pregos, 22), (item_corda, 20), (item_fita, 22), (item_municao, 22),
         (item_agua, 20), (item_atadura, 22), (item_kit, 23), (item_pecas, 22), (item_gasolina, 19),
         (item_bateria, 23), (item_pedra, 24), (item_polvora, 20), (item_horta, 24), (item_coracao, 14)]


def item(fn, rx):
    F = Frame(64, 64)
    fn(F)
    if fn is item_corda:
        m = F.mask(ell(30, 40, 5.5, 2.6))
        F.a[m] = 0
    if fn is item_fita:
        m = F.mask(ell(28, 38.5, 6, 2.6))
        F.a[m] = 0
    return compose(F, shadow=ishadow(rx))


# ================================================================ main

def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in (('vas_lixeira', lixeira), ('vas_caixa', caixa), ('vas_geladeira', geladeira),
                     ('vas_armario', armario), ('vas_carro', carro)):
        strip([fn(s) for s in STATES]).save(os.path.join(OUT, name + '.png'))
    strip([anel(k) for k in range(1, 10)]).save(os.path.join(OUT, 'vas_anel.png'))
    fr = []
    for rar in ('comum', 'incomum', 'raro'):
        fr += [fx_abrir(rar, 'flash', i) for i in range(3)]
        fr += [fx_abrir(rar, 'wave', i) for i in range(3)]
        fr += [fx_abrir(rar, 'stars', i) for i in range(2)]
    grid(fr, 8).save(os.path.join(OUT, 'vas_fx_abrir.png'))
    grid([item(fn, rx) for fn, rx in ITEMS], 6).save(os.path.join(OUT, 'vas_itens.png'))
    grid([raridade(r, i) for r in ('comum', 'incomum', 'raro', 'lunar') for i in range(2)], 2).save(
        os.path.join(OUT, 'vas_raridade.png'))
    print('ok')


if __name__ == '__main__':
    main()
