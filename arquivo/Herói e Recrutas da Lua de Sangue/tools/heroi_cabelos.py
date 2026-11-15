"""Herói — cabelos e barba (camadas tingíveis, desenhadas em branco/cinzas).

Desmaio: cada camada gira com humano.rotate_fit(F.a, P['rotate']) (igual às outras camadas do herói).
Roda sozinho: `python heroi_cabelos.py` (de dentro de tools/) gera em ../heroi/:
  hair_m_<estilo>.png, hair_back_m_<estilo>.png, hair_f_<estilo>.png, hair_back_f_<estilo>.png,
  beard_m.png, cabelos.json e preview_cabelos.png
Opcional: `python heroi_cabelos.py <pasta>` grava prévias ampliadas de todas as linhas nessa pasta.
"""
import os
import sys
import json
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humano import *  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'heroi'))

# tons (a página multiplica pela cor do cabelo)
BASE = '#e4e1e6'     # massa
MID = '#b5afbb'      # mecha (2º tom)
DEEP = '#8e8698'     # fundo / camada interna (3º tom)
SIDE = '#bdb7c2'     # laterais raspadas
BAND = '#6e6874'     # elástico / presilha
HI = '#ffffff'       # brilho de lua
HAIR_COLORS = ['#1d1410', '#4a2e1a', '#8a5a2b', '#d9a441', '#b8382c', '#e6e1d6']


# ------------------------------------------------------------------ utilidades

def Q(P, shapes):
    """local (origem no centro do crânio) -> quadro, girando com a cabeça."""
    cx, cy = P['head']
    return rot(mv(shapes, cx, cy), cx, cy, P['hrot'])


def qp(P, x, y):
    cx, cy = P['head']
    return rp(cx + x, cy + y, cx, cy, P['hrot'])


def forbid_mask(F, P, top=-6.5, left=-6.5):
    """zona do rosto (olhos, sobrancelhas, nariz): nunca recebe cabelo."""
    return F.mask(Q(P, poly((left, top), (30, top), (30, 40), (left, 40))))


_MOT = {}


def motion(P):
    """inércia: empurra as pontas contra o movimento da cabeça (px no quadro)."""
    row, i, b = P['row'], P['i'], P['body']
    key = (row, i, b)
    if key in _MOT:
        return _MOT[key]
    n = HNFR[row]
    if row in ('idle', 'walk'):
        prev = pose(row, (i - 1) % n, b)
    elif i == 0:
        prev = pose('idle', 0, b)
    else:
        prev = pose(row, i - 1, b)
    vx = P['head'][0] - prev['head'][0]
    vy = P['head'][1] - prev['head'][1]
    lx = max(-7, min(7, -vx * .5))
    ly = max(-4, min(4, -vy * .45))
    if row == 'walk':
        lx += -1.0 + 1.5 * math.sin(4 * math.pi * i / 8)
        ly += 0.5 * math.cos(4 * math.pi * i / 8)
    _MOT[key] = (lx, ly)
    return lx, ly


def sway_pts(P, pts, w0=0.0, w1=1.0, k=1.0):
    """pontos locais -> quadro com inércia crescente ao longo da lista."""
    lx, ly = motion(P)
    n = max(1, len(pts) - 1)
    out = []
    for j, (x, y) in enumerate(pts):
        w = (w0 + (w1 - w0) * j / n) * k
        X, Y = qp(P, x, y)
        out.append((X + lx * w, Y + ly * w))
    return out


def sway_shape(P, shapes, ref_y=0.0, span=30.0, k=1.0, x_weight=False):
    """aplica inércia em formas locais com peso pelo y (abaixo de ref_y mexe mais)."""
    lx, ly = motion(P)
    out = []
    for p in shapes:
        q = []
        for (x, y) in p:
            w = max(0.0, min(1.0, (y - ref_y) / span)) * k
            if x_weight:
                w = max(w, max(0.0, min(1.0, (-x - 14) / 10)) * k)
            X, Y = qp(P, x, y)
            q.append((X + lx * w, Y + ly * w))
        out.append(q)
    return out


def stroke(F, m, pts, col, layer=None):
    """polilinha (em px do quadro) pintada só dentro da máscara m."""
    L = F.a if layer is None else layer
    c = hexc(col)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for t in range(n + 1):
            x = int(round(x0 + (x1 - x0) * t / n))
            y = int(round(y0 + (y1 - y0) * t / n))
            if 0 <= x < S and 0 <= y < S and m[y, x]:
                L[y, x, :3] = c
                L[y, x, 3] = 255


def lstroke(F, P, m, pts, col):
    stroke(F, m, [qp(P, x, y) for (x, y) in pts], col)


def mass(F, P, shapes_frame, col=BASE, clip=None, tex=0.0, dark=.30, outline=True):
    return F.part(shapes_frame, col, light=0.0, dark=dark, tex=tex, clip=clip, outline=outline)


def arc_pts(cx, cy, r, a0, a1, n=8):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * t / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * t / n))) for t in range(n + 1)]


def shaved(F, P, clip, col=SIDE, tex=.4):
    """película rente ao crânio (raspado / laterais)."""
    sh = ell(0, -3.2, 15.8, 14.6) + poly((-11, -7), (-6.5, -7), (-7.5, 1), (-10.5, 1))
    m = mass(F, P, Q(P, sh), col, clip=clip & ~F.mask(Q(P, poly((-30, -1.5), (-9, -1.5), (-9, 30), (-30, 30)))), tex=tex, dark=.22)
    return m


# ------------------------------------------------------------------ masculinos

def hair_m_curto(F, P):
    clip = ~forbid_mask(F, P)
    lx, ly = motion(P)
    sh = ell(0, -8.5, 16.6, 10.5) + ell(-3, -13, 13, 7.5) + ell(5, -15, 9, 5.5)
    sh += poly((-16.5, -8), (-16, -1), (-13, -1.5), (-12, -6))
    sh += poly((-11.5, -7), (-6.6, -7), (-7.4, 2.5), (-10.5, 2.5))       # costeleta
    # pontinhas da franja (apontando para a frente)
    sh += poly((2, -10), (9, -6.6), (7, -11))
    sh += poly((7, -11), (14, -6.6), (12, -11.5))
    sh += poly((11, -12), (17.5, -7.5), (16, -12))
    m = mass(F, P, Q(P, sh), clip=clip, tex=.06)
    # volume de trás (3º tom) e risca
    lstroke(F, P, m, [(-12, -12), (-8, -16), (-3, -18.5)], DEEP)
    for pts in ([(-6, -14), (0, -15.5), (6, -13), (9, -9)], [(-10, -9), (-3, -11), (3, -10), (7, -7.5)],
                [(-1, -19.5), (6, -18.5), (12, -15), (15, -11)]):
        lstroke(F, P, m, pts, MID)
    lstroke(F, P, m, [(-9, -15.5), (-5, -18.5), (0, -19.6)], HI)
    lstroke(F, P, m, [(-12, -10), (-11, -13)], HI)


def hair_m_raspado(F, P):
    clip = ~forbid_mask(F, P)
    sh = ell(0, -3.2, 15.8, 14.6) + poly((-11, -7), (-6.6, -7), (-7.4, 1.5), (-10.5, 1.5))
    # entradas na testa: arredonda a linha do cabelo
    cut = F.mask(Q(P, ell(11, -4, 7, 3.5)))
    nape = F.mask(Q(P, poly((-30, -1.5), (-11, -1.5), (-11, 30), (-30, 30))))
    m = mass(F, P, Q(P, sh), '#cfcad3', clip=clip & ~cut & ~nape, tex=.42, dark=.25)
    lstroke(F, P, m, arc_pts(0, -3.2, 14.5, 200, 250, 6), HI)


def hair_m_topete(F, P):
    clip = ~forbid_mask(F, P)
    shaved(F, P, clip)
    lx, ly = motion(P)
    k = .45
    # topete: nasce no alto e projeta para frente/cima, enrolando para baixo
    base = [(-13, -11), (-11, -17), (-4, -23), (4, -26.5), (12, -26), (18, -22.5), (20.5, -18.5),
            (18.5, -14), (15, -12.5), (12.5, -10.5), (9, -9), (3, -9.2), (-3, -10), (-9, -9)]
    pts = []
    for (x, y) in base:
        w = max(0.0, (x + 4) / 24) * k
        X, Y = qp(P, x, y)
        pts.append((X + lx * w, Y + ly * w * .6))
    m = mass(F, P, [pts], clip=clip, tex=.04)
    def S(seq):
        out = []
        for (x, y) in seq:
            w = max(0.0, (x + 4) / 24) * k
            X, Y = qp(P, x, y)
            out.append((X + lx * w, Y + ly * w * .6))
        return out
    stroke(F, m, S([(-11, -12), (-6, -17.5), (2, -21), (10, -21.5), (16, -19), (17, -15)]), MID)
    stroke(F, m, S([(-9, -10), (-2, -13.5), (6, -15), (12, -14), (14.5, -12.5)]), MID)
    stroke(F, m, S([(-6, -21), (1, -24.5), (9, -24.8), (15, -22.5)]), MID)
    stroke(F, m, S([(-4, -11), (3, -12), (9, -11)]), DEEP)
    stroke(F, m, S([(-8, -18.5), (-2, -22.5), (5, -24.2)]), HI)
    stroke(F, m, S([(8, -23.2), (13, -22)]), HI)


def black_shape(dy=0.0, grow=0.0):
    sh = ell(-2, -11 + dy, 21 + grow, 17.5 + grow)
    for j in range(14):
        a = math.radians(-180 + j * 360 / 14)
        sh += ell(-2 + (20 + grow) * math.cos(a), -11 + dy + (16.5 + grow) * math.sin(a), 4.2, 4.2)
    return sh


def hair_m_black(F, P):
    clip = ~forbid_mask(F, P)
    lx, ly = motion(P)
    sh = black_shape()
    sh = [[(x, y) for (x, y) in p] for p in sh]
    fr = Q(P, sh)
    fr = mv(fr, 0, ly * .35)
    m = mass(F, P, fr, clip=clip, tex=.28, dark=.34)
    # cachinhos internos (2º tom) e brilho no alto-esquerda
    for (x, y) in ((-14, -18), (-6, -24), (4, -22), (12, -15), (-18, -6), (-9, -12), (2, -14), (8, -8),
                   (-14, 1), (-6, -3), (14, -24)):
        X, Y = qp(P, x, y)
        stroke(F, m, [(X - 1, Y + 1), (X, Y), (X + 1, Y), (X + 2, Y + 1)], MID)
    for (x, y) in ((-12, -24), (-16, -20), (-8, -27), (-19, -14), (-4, -26)):
        X, Y = qp(P, x, y)
        stroke(F, m, [(X, Y), (X + 1, Y)], HI)


def hair_back_m_black(F, P):
    lx, ly = motion(P)
    fr = mv(Q(P, black_shape(dy=3, grow=1)), 0, ly * .5)
    mass(F, P, fr, DEEP, tex=.25, dark=.3)


def hair_m_moicano(F, P):
    clip = ~forbid_mask(F, P)
    shaved(F, P, clip, col='#b0aab6')
    lx, ly = motion(P)
    # crista: faixa + 6 espetos do alto da testa até a nuca (ângulos no crânio)
    angs = [-48, -70, -92, -114, -136, -158]
    lens = [9, 11, 11.5, 10.5, 9, 7.5]
    band = []
    for a in range(-40, -171, -10):
        band.append((15.5 * math.cos(math.radians(a)), -2 + 15.5 * math.sin(math.radians(a))))
    for a in range(-170, -39, 10):
        band.append((10.5 * math.cos(math.radians(a)), -2 + 10.5 * math.sin(math.radians(a))))
    shapes = [band]
    tips = []
    for a, L in zip(angs, lens):
        r0 = 14.0
        a0, a1 = math.radians(a - 9), math.radians(a + 9)
        ar = math.radians(a + 6)   # espeto levemente penteado para trás
        p0 = (r0 * math.cos(a0), -2 + r0 * math.sin(a0))
        p1 = (r0 * math.cos(a1), -2 + r0 * math.sin(a1))
        tip = ((r0 + L) * math.cos(ar), -2 + (r0 + L) * math.sin(ar))
        tips.append((p0, p1, tip))
        shapes.append([p0, tip, p1])
    fr = []
    for p in shapes:
        q = []
        for (x, y) in p:
            d = math.hypot(x, y + 2)
            w = max(0.0, (d - 13) / 12) * .5
            X, Y = qp(P, x, y)
            q.append((X + lx * w, Y + ly * w))
        fr.append(q)
    m = mass(F, P, fr[1:], clip=clip, tex=.03, dark=.35)
    m |= mass(F, P, fr[:1], clip=clip, tex=.03, dark=.2, outline=False)
    for (p0, p1, tip), q in zip(tips, fr[1:]):
        # lado iluminado (esquerda/cima) e mecha central
        a, b, c = q[0], q[1], q[2]
        mid0 = ((a[0] + c[0]) / 2, (a[1] + c[1]) / 2)
        stroke(F, m, [((a[0] * 2 + c[0]) / 3, (a[1] * 2 + c[1]) / 3), b], HI)
        stroke(F, m, [mid0, ((b[0] + mid0[0]) / 2, (b[1] + mid0[1]) / 2)], MID)
    lstroke(F, P, m, arc_pts(0, -2, 12.5, -50, -160, 10), MID)
    lstroke(F, P, m, arc_pts(0, -2, 14.6, -100, -150, 6), HI)


# ------------------------------------------------------------------ femininos

def cap_f(F, P, clip, sh_extra=(), tex=.04, top=-9.0):
    sh = ell(0, top, 16.6, 10.5) + ell(-2, -12.5, 14, 8)
    sh += poly((-16.5, -8), (-16.2, 0), (-12.5, -1), (-11.5, -7))
    sh += poly((-11.5, -7), (-7, -7), (-7.6, 0.5), (-10.5, 0.5))
    for s in sh_extra:
        sh += s
    return mass(F, P, Q(P, sh), clip=clip, tex=tex)


def hair_f_longo(F, P):
    clip = ~forbid_mask(F, P)
    # franja lateral varrida para a frente
    fringe = [poly((-6, -16), (8, -17), (16, -12.5), (17.5, -7), (13, -8.5), (6, -6.8), (0, -7.5), (-6, -9))]
    m = cap_f(F, P, clip, fringe)
    lstroke(F, P, m, [(-8, -15), (0, -15.5), (8, -13.5), (14, -9)], MID)
    lstroke(F, P, m, [(-4, -11), (3, -11), (9, -8.6)], MID)
    lstroke(F, P, m, [(-10, -11), (-11, -5), (-12, -1)], MID)
    lstroke(F, P, m, [(-9, -17), (-3, -19.3), (4, -19.4)], HI)
    # mecha grossa por cima da orelha
    pts = sway_pts(P, [(-11, -9), (-13, -2), (-14.5, 6), (-15.5, 14), (-16, 22), (-15.5, 28)], 0, .8)
    lock = chain(pts, 9.5, 5)
    m2 = mass(F, P, lock, clip=clip, tex=.04)
    stroke(F, m2, sway_pts(P, [(-12, -6), (-14, 4), (-15, 14), (-15, 25)], 0, .8), MID)
    stroke(F, m2, sway_pts(P, [(-14.5, -4), (-15.8, 4)], 0, .3), HI)


def longo_back_shape(P):
    sh = [[(-16, -14), (-6, -19), (6, -18), (14, -12), (17, -3), (16.5, 8), (15.5, 18),
           (13, 25), (9, 22), (5, 27), (0, 24), (-5, 30), (-9, 27), (-14, 33), (-19, 28), (-24, 33), (-25, 20), (-23, 6), (-20, -4)]]
    return sway_shape(P, sh, ref_y=-2, span=30, k=1.0)


def hair_back_f_longo(F, P):
    fr = longo_back_shape(P)
    m = mass(F, P, fr, DEEP, tex=.04, dark=.3)
    for xs in (-21, -17, -12, -6, 3, 11):
        stroke(F, m, sway_pts(P, [(xs, 0), (xs - .5, 10), (xs, 20), (xs + .5, 27)], 0, 1), '#7a7286')
    stroke(F, m, sway_pts(P, [(-19, -2), (-19.5, 8), (-19, 16)], 0, 1), MID)


def hair_f_rabo(F, P):
    clip = ~forbid_mask(F, P)
    m = cap_f(F, P, clip, tex=.02, top=-8.0)
    for pts in ([(14, -9), (6, -13.5), (-4, -14), (-13, -11)], [(10, -7.5), (2, -10), (-6, -10), (-13, -9.5)],
                [(4, -17.5), (-4, -18), (-11, -14)], [(-8, -6), (-12, -8.5)]):
        lstroke(F, P, m, pts, MID)
    lstroke(F, P, m, [(0, -19.4), (-6, -18.8), (-10, -16.5)], HI)
    # elástico
    tie = Q(P, ell(-15.5, -10.5, 2.6, 3.4, rot=-20))
    F.part(tie, BAND, light=0, dark=.25)


def rabo_chain(P):
    return sway_pts(P, [(-16, -10.5), (-22, -8), (-26.5, -1), (-27.5, 7), (-26, 14.5), (-23.5, 21)], 0, 1, k=1.15)


def hair_back_f_rabo(F, P):
    pts = rabo_chain(P)
    sh = chain(pts, 8.5, 2.5)
    sh += ell(pts[1][0], pts[1][1], 5, 4.5)
    m = mass(F, P, sh, BASE, tex=.03, dark=.32)
    # mechas internas e brilho
    def off(dx, w0=0, w1=1):
        return [(x + dx, y) for (x, y) in pts[1:]]
    stroke(F, m, off(1), MID)
    stroke(F, m, [(x - 1.5, y) for (x, y) in pts[1:5]], MID)
    stroke(F, m, [(pts[1][0] - 1, pts[1][1] - 3), (pts[2][0] - 2.5, pts[2][1] - 1)], HI)


def hair_f_coque(F, P):
    clip = ~forbid_mask(F, P)
    lx, ly = motion(P)
    bx, by = qp(P, -8.5, -20)
    by += ly * .4
    bx += lx * .2
    # coque (antes da tampa: a tampa sobrepõe a base)
    mb = mass(F, P, ell(bx, by, 7.5, 6.5), clip=clip, tex=.03)
    stroke(F, mb, [(bx - 4, by + 1), (bx - 3, by - 3), (bx + 1, by - 4), (bx + 4, by - 1), (bx + 2, by + 2), (bx - 1, by + 1), (bx, by - 1)], MID)
    stroke(F, mb, [(bx - 5, by - 2), (bx - 3, by - 4.5)], HI)
    m = cap_f(F, P, clip, tex=.02, top=-8.0)
    for pts in ([(14, -9), (8, -14), (0, -17), (-6, -17.5)], [(10, -7.5), (2, -11.5), (-6, -14)],
                [(-12, -6), (-12, -12), (-9, -16)]):
        lstroke(F, P, m, pts, MID)
    lstroke(F, P, m, [(-1, -19.2), (5, -18.5), (10, -15.5)], HI)
    # presilha
    F.part(Q(P, poly((-13.5, -14.5), (-3.5, -16.8), (-3.2, -15), (-13, -12.8))), BAND, light=0, dark=.2)
    # mechinha solta na nuca
    pts = sway_pts(P, [(-14, -3), (-16, 2), (-15, 6)], 0, .5)
    stroke(F, F.solid() | True, pts, MID)


CURLS_F = [  # (x, y, r) — coroa e laterais (camada hair), de trás para frente
    (-15, -8, 4.5), (-14, -16, 4.5), (-8, -21, 4.8), (0, -22.5, 4.8), (8, -20.5, 4.6), (14, -15, 4.4),
    (17, -9, 3.8), (-9, -13, 4.5), (-2, -15, 4.6), (5, -14, 4.4), (11, -10.5, 4.0), (1, -9.5, 3.6), (6, -8.8, 3.4),
    (-15.5, 0, 4.6), (-12, 5, 4.4), (-15.5, 8, 4.2), (-11, 11, 3.8), (-10, -4, 4.0),
]
CURLS_B = [  # massa de trás (hair_back)
    (-20, -14, 5.2), (-22, -4, 5.2), (-22, 6, 5.2), (-20, 15, 5), (-14, 20, 5), (-6, 22, 5), (2, 20, 4.8),
    (10, 16, 4.8), (16, 9, 4.8), (18, 0, 5), (17, -9, 5), (12, -18, 5), (2, -24, 5), (-10, -22, 5),
    (-14, 10, 5), (-4, 12, 5),
]


def ring(F, col='#2a2026'):
    a = F.a[..., 3] > 0
    o = dilate(a) & ~a
    F.a[o, :3] = hexc(col)
    F.a[o, 3] = 255


def curl(F, P, x, y, r, col, clip=None, k=1.0, ref=-6, ol='#6a6274'):
    lx, ly = motion(P)
    w = max(0.0, min(1.0, (y - ref) / 24)) * k
    X, Y = qp(P, x, y)
    X += lx * w; Y += ly * w
    m = F.part(ell(X, Y, r, r), col, light=0.0, dark=.36, clip=clip, ol=ol)
    if m.any():
        stroke(F, m, [(X - r * .5, Y - r * .1), (X - r * .2, Y - r * .5), (X + r * .3, Y - r * .45)], HI)
        stroke(F, m, [(X + r * .1, Y + r * .1), (X - r * .1, Y + r * .4)], MID)
    return m


def hair_f_cacheado(F, P):
    clip = ~forbid_mask(F, P)
    base = ell(0, -9, 16.6, 10.5) + ell(-3, -12, 14, 8)
    mass(F, P, Q(P, base), MID, clip=clip, tex=.1)
    for (x, y, r) in CURLS_F:
        curl(F, P, x, y, r, BASE, clip=clip)
    ring(F)
    F.a[forbid_mask(F, P, top=-5.5, left=-5.5)] = 0   # contornos dos cachos não invadem o rosto


def hair_back_f_cacheado(F, P):
    for (x, y, r) in CURLS_B:
        curl(F, P, x, y, r, '#a49cad', k=1.0, ref=-10, ol='#5a5264')
    ring(F)


def hair_f_chanel(F, P):
    clip = ~forbid_mask(F, P)
    lx, ly = motion(P)
    sh = ell(0, -9, 17, 11) + ell(-2, -12.5, 14.5, 8.5)
    side = [[(-18, -8), (-6.8, -8), (-6.8, 4), (-5.5, 11.5), (-11, 10.5), (-18.5, 9)]]
    side = sway_shape(P, side, ref_y=-2, span=13, k=.35)
    m = mass(F, P, Q(P, sh) + side, clip=clip, tex=.03)
    for xs in (-15, -11.5, -8.5):
        stroke(F, m, sway_pts(P, [(xs, -10), (xs, 0), (xs + .3, 9)], 0, .35), MID)
    for pts in ([(-8, -14.5), (0, -15.5), (8, -14), (14, -10)], [(2, -9.5), (5, -12)], [(9, -8.6), (12, -11)]):
        lstroke(F, P, m, pts, MID)
    lstroke(F, P, m, [(-12, -14), (-6, -17.8), (2, -19)], HI)
    stroke(F, m, sway_pts(P, [(-17, -4), (-17.2, 2)], 0, .2), HI)


def hair_back_f_chanel(F, P):
    sh = [[(9, -12), (19, -8), (20, 4), (19, 11.5), (12, 12), (6, 8)],
          [(-20, -6), (-8, -4), (-6, 13), (-18, 12)]]
    fr = sway_shape(P, sh, ref_y=-2, span=13, k=.35)
    m = mass(F, P, fr, DEEP, dark=.3)
    stroke(F, m, sway_pts(P, [(18, -4), (18.5, 6)], 0, .35), MID)


# ------------------------------------------------------------------ barba

def beard_m(F, P):
    mo = P['mouth']
    drop = {'open': 1.5, 'grit': 1.0, 'o': 1.0}.get(mo, 0.0)
    clip = ~forbid_mask(F, P, top=-8, left=-6.5) | F.mask(Q(P, poly((-7, 8.2), (14, 8.2), (14, 40), (-7, 40))))
    # boca nunca coberta
    if mo == 'open':
        hole = ell(7, 13, 3.6, 3.2)
    elif mo == 'grit':
        hole = poly((3, 10.2), (11, 10.2), (11, 14.6), (3, 14.6))
    elif mo == 'o':
        hole = ell(7, 13, 2.8, 3.0)
    else:
        hole = poly((4, 11.2), (10.6, 11.2), (10.6, 12.8), (4, 12.8))
    clip &= ~F.mask(Q(P, hole))
    sh = poly((-11, -6), (-7.2, -6), (-6.8, 4), (-9, 8), (-11.2, 3))       # costeleta
    sh += chain([(-8.8, 4), (-6.5, 10.5), (-1.5, 15.5 + drop * .5), (4, 18 + drop)], 3.5, 5.5)  # mandíbula
    sh += ell(6, 17 + drop, 7, 5)                                             # cavanhaque
    sh += ell(7, 20 + drop, 4, 3.2)                                           # ponta do queixo
    sh += poly((1.5, 10.5), (5, 9), (9, 9), (12.5, 10.2), (13, 12.5), (10.8, 11), (3.5, 11), (1.5, 13))  # bigode
    m = mass(F, P, Q(P, sh), clip=clip, tex=.12, dark=.32)
    for pts in ([(-9, 0), (-8, 6)], [(-5, 10), (-1, 14 + drop)], [(3, 16 + drop), (5, 20 + drop)],
                [(8, 16 + drop), (8.5, 21 + drop)], [(11, 15 + drop), (11, 18 + drop)], [(4, 9.8), (8, 9.8)]):
        lstroke(F, P, m, pts, MID)
    lstroke(F, P, m, [(-10, -3), (-10, 1)], HI)
    lstroke(F, P, m, [(1, 15.5 + drop), (2, 17 + drop)], HI)


# ------------------------------------------------------------------ catálogo

STYLES_M = [('curto', 'Curto', hair_m_curto, None), ('raspado', 'Raspado', hair_m_raspado, None),
            ('topete', 'Topete', hair_m_topete, None), ('black', 'Black power', hair_m_black, hair_back_m_black),
            ('moicano', 'Moicano', hair_m_moicano, None)]
STYLES_F = [('longo', 'Longo', hair_f_longo, hair_back_f_longo), ('rabo', 'Rabo de cavalo', hair_f_rabo, hair_back_f_rabo),
            ('coque', 'Coque', hair_f_coque, None), ('cacheado', 'Cacheado', hair_f_cacheado, hair_back_f_cacheado),
            ('chanel', 'Chanel', hair_f_chanel, hair_back_f_chanel)]


def frame_layer(fn, row, i, body):
    P = pose(row, i, body)
    F = Frame()
    fn(F, P)
    if P['rotate']:
        F.a = rotate_fit(F.a, P['rotate'])
    return compose(F, tint=P['tint']), P, F


def layer_sheet(fn, body):
    out = np.zeros((S * len(HROWS), S * 8, 4), np.uint8)
    for r, name in enumerate(HROWS):
        for c in range(HNFR[name]):
            img, P, F = frame_layer(fn, name, c, body)
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = img
    return out


def check_face(fn, body, name):
    """confere: nenhum pixel de cabelo sobre olhos/sobrancelhas (quadros sem rotação)."""
    bad = 0
    for row in HROWS:
        for i in range(HNFR[row]):
            P = pose(row, i, body)
            F = Frame()
            fn(F, P)
            a = F.a[..., 3] > 0
            fp = face_pts(P)
            for k in ('eye_b', 'eye_f'):
                x, y = [int(round(v)) for v in fp[k]]
                if a[y - 3:y + 3, x - 3:x + 3].any():
                    bad += 1
            for k in ('brow_b', 'brow_f'):
                x, y = [int(round(v)) for v in fp[k]]
                if a[y - 1:y + 2, x - 2:x + 3].any():
                    bad += 1
    if bad:
        print('  AVISO rosto coberto:', name, bad)
    return bad


LOOK = dict(skin='#c98d5e', shirt='#c0262d', pants='#2b3a5a', jacket=None, shoes='#2a1c16')


def tint_img(img, col):
    o = img.astype(float)
    o[..., :3] = o[..., :3] * hexc(col) / 255
    return o.astype(np.uint8)


def base_frame(body, row, i):
    look = dict(LOOK, body=body, skin='#c98d5e' if body == 'm' else '#e8b48a', shirt='#c0262d' if body == 'm' else '#2f6db5')
    P = pose(row, i, body)
    F = Frame()
    draw_person(F, P, look, draw={'hair': None})
    rq = P.get('rotate')
    k = min(1.0, abs(rq[0]) / 90.0) if rq else 0
    sh = shadow_layer(64 - 8 * k, 17 + 16 * k)
    pose_fx(F, P)
    if rq:
        F.a = rotate_fit(F.a, rq)
    body_img = compose(F, tint=P['tint'])
    return sh, body_img


def composite(body, row, i, hair=None, back=None, beard=None, col='#4a2e1a', bg=None):
    sh, bimg = base_frame(body, row, i)
    acc = np.zeros((S, S, 4), np.uint8) if bg is None else bg.copy()
    acc = over(acc, sh)
    if back:
        acc = over(acc, tint_img(frame_layer(back, row, i, body)[0], col))
    acc = over(acc, bimg)
    if beard:
        acc = over(acc, tint_img(frame_layer(beard, row, i, body)[0], col))
    if hair:
        acc = over(acc, tint_img(frame_layer(hair, row, i, body)[0], col))
    return acc


def preview(path, scale=2):
    cols = ['#4a2e1a', '#d9a441']
    items = [('m', h, b, None) for (_, _, h, b) in STYLES_M] + [('m', STYLES_M[0][2], None, beard_m)]
    items += [('f', h, b, None) for (_, _, h, b) in STYLES_F]
    bg = np.zeros((S, S, 4), np.uint8); bg[...] = (52, 46, 62, 255)
    tiles = []
    for col in cols:
        row = []
        for (body, h, b, bd) in items:
            t = composite(body, 'idle', 0, h, b, bd, col, bg)
            row.append(t[0:96, 24:104])
        tiles.append(np.concatenate(row, 1))
    im = np.concatenate(tiles, 0)
    Image.fromarray(im, 'RGBA').resize((im.shape[1] * scale, im.shape[0] * scale), Image.NEAREST).save(path)


def anim_preview(path, body, styles, col='#8a5a2b', beard=False, scale=2):
    """todas as linhas (HROWS) para cada estilo, empilhadas."""
    bg = np.zeros((S, S, 4), np.uint8); bg[...] = (52, 46, 62, 255)
    blocks = []
    for (_, _, h, b) in styles:
        rows = []
        for name in HROWS:
            fr = []
            for c in range(8):
                if c < HNFR[name]:
                    t = composite(body, name, c, h, b, beard_m if beard else None, col, bg)
                else:
                    t = bg.copy()
                fr.append(t[0:116, 8:128])
            rows.append(np.concatenate(fr, 1))
        blocks.append(np.concatenate(rows, 0))
    im = np.concatenate(blocks, 0)
    Image.fromarray(im, 'RGBA').resize((im.shape[1] * scale // 2, im.shape[0] * scale // 2), Image.NEAREST).save(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    itens = []
    for body, styles in (('m', STYLES_M), ('f', STYLES_F)):
        for sid, nome, fn, back in styles:
            Image.fromarray(layer_sheet(fn, body), 'RGBA').save(os.path.join(OUT, 'hair_%s_%s.png' % (body, sid)))
            check_face(fn, body, sid)
            itens.append(dict(id='%s_%s' % (body, sid), nome=nome, camada='hair', arquivo='heroi/hair_%s_%s.png' % (body, sid),
                              tint=True, corpo=body, cor_padrao='#1d1410', opcao='hair', estilo=sid))
            if back:
                Image.fromarray(layer_sheet(back, body), 'RGBA').save(os.path.join(OUT, 'hair_back_%s_%s.png' % (body, sid)))
                itens.append(dict(id='%s_%s_back' % (body, sid), nome=nome + ' (atrás)', camada='hair_back',
                                  arquivo='heroi/hair_back_%s_%s.png' % (body, sid), tint=True, corpo=body,
                                  cor_padrao='#1d1410', opcao='hair', estilo=sid))
        itens.append(dict(id='%s_careca' % body, nome='Careca', camada='hair', arquivo=None, tint=True, corpo=body,
                          cor_padrao='#1d1410', opcao='hair', estilo='careca'))
    Image.fromarray(layer_sheet(beard_m, 'm'), 'RGBA').save(os.path.join(OUT, 'beard_m.png'))
    check_face(beard_m, 'm', 'barba')
    itens.append(dict(id='barba', nome='Barba', camada='beard', arquivo='heroi/beard_m.png', tint=True, corpo='m',
                      cor_padrao='#1d1410', opcao='beard', estilo='com'))
    itens.append(dict(id='sem_barba', nome='Sem barba', camada='beard', arquivo=None, tint=True, corpo='m',
                      cor_padrao='#1d1410', opcao='beard', estilo='sem'))
    man = {"grupo": "cabelos", "itens": itens, "cores": {"hair_color": HAIR_COLORS},
           "obs": "Camadas brancas: multiplicar pela hair_color. hair_back pinta antes do corpo; beard antes de hair. "
                  "Itens com arquivo null = sem camada. Mesmo 'estilo' liga hair e hair_back."}
    with open(os.path.join(OUT, 'cabelos.json'), 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
    preview(os.path.join(OUT, 'preview_cabelos.png'), scale=2)
    print('ok', len(itens), 'itens')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        d = sys.argv[1]
        preview(os.path.join(d, 'heroi_cabelos_prev.png'), scale=3)
        anim_preview(os.path.join(d, 'heroi_cabelos_anim_m.png'), 'm', STYLES_M[:3], beard=True)
        anim_preview(os.path.join(d, 'heroi_cabelos_anim_m2.png'), 'm', STYLES_M[3:])
        anim_preview(os.path.join(d, 'heroi_cabelos_anim_f.png'), 'f', STYLES_F[:3])
        anim_preview(os.path.join(d, 'heroi_cabelos_anim_f2.png'), 'f', STYLES_F[3:])
        print('previas ok')
    else:
        main()
