"""Herói — corpo base, rosto e roupas (grupo heroi_corpo).

Gera em ../heroi/ as folhas 1024x1024 (8 linhas humano.HROWS x 8 colunas), uma por camada:
  body_m/f, arm_m/f (pele, tint), face_m/f (fixa), shirt_m/f, shirt_arm_m/f, pants_m/f,
  jacket_m/f, jacket_arm_m/f (tint), shoes_m/f (fixa), shadow, fx  + corpo.json + preview_corpo.png

Camadas tingíveis são desenhadas em BRANCO (#ffffff) com a sombra roxa/contorno do pixkit;
a página multiplica pela cor escolhida. Mesmas juntas de humano.pose().
Uso:  python heroi_corpo.py            (gera tudo)
      python heroi_corpo.py prev DIR   (também grava prévias ampliadas em DIR)
"""
import os
import sys
import json
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import *          # noqa
from humano import *          # noqa
import humano as H

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = os.path.join(ROOT, 'heroi')

# ---------------------------------------------------------------- tons em "espaço branco"
W = hexc('#ffffff')
FAR = mix(W, NIGHT, .16)          # membros de trás
NECK = mix(W, NIGHT, .12)
CRE = hexc('#b4aac0')             # vinco claro
SEAM = hexc('#a89cb4')            # costura / vinco
DEEP = hexc('#7e7090')            # sombra funda
RIB = hexc('#d2cada')             # canelado / barra

CATALOG = {
    'skin': ['#f6d3b3', '#e8b48a', '#c98d5e', '#a86b3c', '#7a4a26', '#4f2f18'],
    'shirt': ['#c0262d', '#2f6db5', '#3b8f3e', '#e3b23c', '#6c3fa0', '#e8e4dc', '#262626'],
    'pants': ['#2b3a5a', '#3d3d3d', '#6b4a2b', '#4c6b3a', '#8a8a8a'],
    'jacket': [None, '#5b3a24', '#30343a', '#7a1f24', '#3f5a3a'],
}


def far(c, t=.16):
    return mix(c, NIGHT, t)


def P2(p):
    return (int(round(p[0])), int(round(p[1])))


def unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy) or 1e-6
    return dx / L, dy / L


def across(F, a, b, t, half, col, clip=None, off=0.0):
    """linha perpendicular ao segmento a-b no parâmetro t (barra de manga, punho...)."""
    ux, uy = unit(a, b)
    nx, ny = -uy, ux
    cx, cy = lerp(a[0], b[0], t) + ux * off, lerp(a[1], b[1], t) + uy * off
    n = int(half * 2) + 2
    for k in range(n + 1):
        s = -half + 2 * half * k / n
        x, y = int(round(cx + nx * s)), int(round(cy + ny * s))
        if 0 <= x < S and 0 <= y < S and (clip is None or clip[y, x]):
            F.px(x, y, col)


def pxc(F, x, y, col, m):
    """pixel só se estiver dentro da máscara m."""
    x, y = int(round(x)), int(round(y))
    if 0 <= x < S and 0 <= y < S and m[y, x]:
        F.px(x, y, col)


def linec(F, x0, y0, x1, y1, col, m):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        pxc(F, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, col, m)


def cut(F, shapes, edge=None, within=None):
    """abre um furo transparente na camada; edge pinta a borda que sobra."""
    m = F.mask(shapes) & (F.a[..., 3] > 0)
    if within is not None:
        m &= within
    F.a[m] = 0
    if edge is not None:
        ring = dilate(m) & ~m & (F.a[..., 3] > 0)
        F.a[ring, :3] = edge
    return m


# ---------------------------------------------------------------- formas próprias

def fist_shapes(P, s, r=4.0):
    hx, hy = P['ha_' + DSIDE(s)]
    ux, uy = unit(P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)])
    nx, ny = -uy, ux
    if ny > 0:
        nx, ny = -nx, -ny
    sh = ell(hx, hy, r, r * .9)
    sh += ell(hx + nx * 2.6 + ux * 1.2, hy + ny * 2.6 + uy * 1.2, 1.8, 1.8)
    return sh


def fist_detail(F, P, s, col):
    hx, hy = P['ha_' + DSIDE(s)]
    ux, uy = unit(P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)])
    nx, ny = -uy, ux
    for k in (-1, 0, 1):
        F.px(hx + ux * 2 + nx * k * 1.2, hy + uy * 2 + ny * k * 1.2, col)


def small_foot(P, s):
    fx, fy = P['ft_' + DSIDE(s)]
    return ell(fx + 2, fy - 2.5, 4.5, 2.5)


def head_shapes2(P):
    cx, cy = P['head']
    fem = P['body'] == 'f'
    sh = ell(cx, cy - 2, 15, 15)
    if fem:
        sh += ell(cx + 3, cy + 6.5, 11, 8.5)
    else:
        sh += ell(cx + 3, cy + 7, 12.5, 9)
    return rot(sh, cx, cy, P['hrot'])


def nose2(P):
    cx, cy = P['head']
    k = .8 if P['body'] == 'f' else 1.0
    return rot(poly((cx + 12, cy + 1), (cx + 12 + 5 * k, cy + 2 + 5 * k), (cx + 12, cy + 2 + 6 * k)), cx, cy, P['hrot'])


def hq(P, x, y):
    cx, cy = P['head']
    return rp(cx + x, cy + y, cx, cy, P['hrot'])


def arm_w(P):
    return (7, 6) if P['body'] == 'f' else (8, 7)


# ---------------------------------------------------------------- camadas de pele (tint)

def d_body(F, P):
    ua, fa = arm_w(P)
    F.part(thigh(P, 'b') + shin(P, 'b'), FAR)
    F.part(small_foot(P, 'b'), FAR)
    F.part(upper_arm(P, 'b', w=ua) + fore_arm(P, 'b', w=fa), FAR)
    F.part(fist_shapes(P, 'b'), FAR)
    fist_detail(F, P, 'b', far(SEAM))
    F.part(thigh(P, 'f') + shin(P, 'f'), W)
    F.part(small_foot(P, 'f'), W)
    m = F.part(torso_shapes(P) + pelvis_shapes(P), W)
    # clavícula / umbigo sutis (aparecem no decote)
    nx, ny = P['neck']
    linec(F, nx - 4, ny + 2, nx - 1, ny + 3, CRE, m)
    linec(F, nx + 3, ny + 3, nx + 7, ny + 2, CRE, m)
    F.part(neck_shapes(P), NECK)
    F.part(head_shapes2(P), W, tex=0)
    # orelha com dobra interna
    F.part(ear_shapes(P), W)
    ex, ey = hq(P, -13, 3)
    for dx, dy in ((0, -2), (-1, -1), (-1, 0), (-1, 1), (0, 2)):
        F.px(ex + dx + .5, ey + dy, SEAM)
    # nariz: luz na ponta, narina e sombra
    F.part(nose2(P), W, outline=False, light=.35)
    tx, ty = hq(P, 15.5 if P['body'] == 'm' else 14.5, 6)
    F.px(tx - 2, ty + 1, DEEP)
    a = hq(P, 13, 8.5)
    F.px(a[0], a[1], CRE)


def d_arm(F, P):
    ua, fa = arm_w(P)
    F.part(upper_arm(P, 'f', w=ua) + fore_arm(P, 'f', w=fa), W)
    F.part(fist_shapes(P, 'f'), W)
    fist_detail(F, P, 'f', SEAM)


# ---------------------------------------------------------------- rosto (fixo, sem pele)

SCL = '#f4efe6'
IRIS = '#3a2414'
PUP = '#0c0606'
BROW = '#2a1a14'
INKA = INK


def _eye(F, P, x, y, big, outer):
    """outer = -1 se o canto externo é à esquerda, +1 à direita."""
    kind = P['eyes']
    fem = P['body'] == 'f'
    w = 3 if big else 2
    squeeze = kind == 'closed' and P['row'] in ('hurt', 'death')
    if kind == 'closed' and not squeeze:
        F.line(x - w, y, x + 2, y, INKC)
        F.px(x - w, y - 1 if outer < 0 else y, INKC) if False else None
        if fem:
            ox = x - w - 1 if outer < 0 else x + 3
            F.px(ox, y - 1, INKC)
        F.px(x - w + 1, y + 1, INKC, alpha=70)
        return
    if squeeze:
        # > <  apertado (o desenho aponta para o centro do rosto)
        d = 1 if outer < 0 else -1
        cx = x - 1 if big else x
        F.px(cx - d, y - 2, INKC); F.px(cx, y - 1, INKC); F.px(cx + d, y, INKC); F.px(cx, y + 1, INKC); F.px(cx - d, y + 2, INKC)
        F.px(cx - 2 * d, y - 2, INKC)
        return
    if kind == 'happy':
        F.px(x - w, y + 1, INKC); F.px(x - w + 1, y, INKC); F.px(x - w + 2, y - 1, INKC)
        F.px(x - w + 3, y - 1, INKC); F.px(x + 1, y, INKC); F.px(x + 2, y + 1, INKC)
        if fem:
            ox = x - w - 1 if outer < 0 else x + 3
            F.px(ox, y, INKC)
        return
    if kind == 'x':
        for d in (-1, 0, 1):
            F.px(x + d, y + d, INKC); F.px(x + d, y - d, INKC)
        F.px(x + 2, y - 2, INKC); F.px(x - 2, y + 2, INKC)
        return
    top = y - 2
    if kind == 'wide':
        top = y - 3
    for yy in range(top, y + 3):
        for xx in range(x - w, x + 3):
            F.px(xx, yy, SCL)
    for yy in range(top, y + 3):
        for xx in range(x, x + 3):
            F.px(xx, yy, IRIS)
    for yy in range(y - 1, y + 2):
        F.px(x + 1, yy, PUP); F.px(x + 2, yy, PUP)
    F.px(x, top, '#ffffff')
    if kind == 'wide':
        F.px(x - w, y + 2, SCL); F.px(x, y + 2, SCL)
    lid = top - 1
    if kind == 'angry':
        # pálpebra desce: some a linha de cima do olho, traço inclinado para o centro
        for xx in range(x - w, x + 3):
            F.px(xx, top, INKC)
        if outer < 0:
            F.px(x - w, top + 1, INKC) if False else None
            F.px(x + 2, top + 1, INKC)
        else:
            F.px(x - w, top + 1, INKC)
    else:
        F.line(x - w, lid, x + 2, lid, INKC)
    # sombra inferior (semitransparente: serve para qualquer pele)
    for xx in range(x - w, x + 3):
        F.px(xx, y + 3, INKC, alpha=60)
    if fem:
        # pálpebra grossa no canto externo + 2 cílios
        l2 = top if kind == 'angry' else lid
        if outer < 0:
            F.px(x - w - 1, l2, INKC); F.px(x - w - 2, l2 - 1, INKC); F.px(x - w, l2 - 1, INKC)
        else:
            F.px(x + 3, l2, INKC); F.px(x + 4, l2 - 1, INKC); F.px(x + 2, l2 - 1, INKC)


def _brow(F, P, x, y, inner):
    """inner = +1 se o lado de dentro (centro do rosto) é à direita."""
    kind = P['eyes']
    fem = P['body'] == 'f'
    worried = P['row'] in ('hurt',) and kind == 'closed'
    if kind == 'angry':
        ys = [-1, -1, 0, 1, 1] if inner > 0 else [1, 1, 0, -1, -1]
    elif worried:
        ys = [0, 0, -1, -1, -2] if inner > 0 else [-2, -1, -1, 0, 0]
    elif kind == 'wide':
        ys = [-2, -3, -3, -3, -2]
    elif fem:
        ys = [0, -1, -1, -1, 0] if inner > 0 else [0, -1, -1, -1, 0]
    elif kind == 'happy':
        ys = [-1, -2, -2, -2, -1]
    else:
        ys = [0, 0, 0, -1, -1] if inner > 0 else [-1, -1, 0, 0, 0]
    for k, dy in enumerate(ys):
        F.px(x - 2 + k, y + dy, BROW)
        if not fem:
            F.px(x - 2 + k, y + dy - 1, BROW)


def d_face(F, P):
    fp = face_pts(P)
    fem = P['body'] == 'f'
    eb, ef = P2(fp['eye_b']), P2(fp['eye_f'])
    _eye(F, P, eb[0], eb[1], True, -1)
    _eye(F, P, ef[0], ef[1], False, +1)
    bb, bf = P2(fp['brow_b']), P2(fp['brow_f'])
    _brow(F, P, bb[0] - 1, bb[1], +1)
    _brow(F, P, bf[0], bf[1], -1)
    # boca
    x, y = P2(fp['mouth'])
    m = P['mouth']
    lip = '#8a3640' if fem else '#5a2a24'
    if m == 'line':
        F.line(x - 2, y, x + 2, y, lip)
        F.px(x - 3, y - 1 if fem else y, lip, alpha=120)
        F.px(x, y + 1, '#e0606a' if fem else INKC, alpha=90 if fem else 45)
    elif m == 'smile':
        F.px(x - 3, y - 1, lip); F.line(x - 2, y, x + 2, y, lip); F.px(x + 3, y - 1, lip)
        F.px(x - 1, y + 1, INKC, alpha=50); F.px(x, y + 1, INKC, alpha=50)
    elif m == 'grit':
        for yy in range(y - 1, y + 2):
            for xx in range(x - 3, x + 4):
                F.px(xx, yy, '#3a1414')
        for xx in range(x - 2, x + 3):
            F.px(xx, y, SCL)
        F.px(x - 1, y, '#a89a90'); F.px(x + 1, y, '#a89a90')
    elif m == 'open':
        F.flat(ell(x + .5, y + 1.5, 2.8, 2.6), '#3a1414')
        F.px(x - 1, y, SCL); F.px(x, y, SCL); F.px(x + 1, y, SCL)
        F.px(x, y + 3, '#c9343a'); F.px(x + 1, y + 3, '#c9343a')
    elif m == 'o':
        F.flat(ell(x + .5, y + 1.5, 1.8, 2.1), '#3a1414')
        F.px(x, y + 2, '#7a2a2a')
    # blush
    cx, cy = P2(fp['cheek'])
    a = 95 if fem else 55
    if P['row'] == 'special' and P['i'] >= 4:
        a += 40
    for dx in (0, 1, 2 if fem else 1):
        F.px(cx + dx, cy, '#e0606a', alpha=a)


# ---------------------------------------------------------------- camisa (tint)

def sleeve(P, s, w, grow, t=.7):
    sh, el = P['sh_' + DSIDE(s)], P['el_' + DSIDE(s)]
    end = L2(sh, el, t)
    return limb(sh[0], sh[1] + 1, end[0], end[1], w + grow, w + grow + 1), (sh[0], sh[1] + 1), end


def d_shirt(F, P):
    ua, _ = arm_w(P)
    fem = P['body'] == 'f'
    shp, a, b = sleeve(P, 'b', ua, 1.5)
    mb = F.part(shp, FAR)
    across(F, a, b, 1.0, 5, far(SEAM), mb, off=-1.5)
    m = F.part(torso_shapes(P, grow=1), W, tex=.04)
    nx, ny = P['neck']
    hb, hf = P['hip_b'], P['hip_f']
    sb, sf = P['sh_b'], P['sh_f']
    # dobras diagonais do quadril da frente para a axila
    linec(F, hf[0] + 1, hf[1] - 4, sf[0] - 3, sf[1] + 9, CRE, m)
    linec(F, hf[0] - 2, hf[1] - 1, sf[0] - 5, sf[1] + 13, SEAM, m)
    # dobra de cintura do lado de trás + costura lateral
    wb = L2(sb, hb, .62)
    linec(F, wb[0] - 2, wb[1], wb[0] + 3, wb[1] + 2, SEAM, m)
    linec(F, sb[0] + 1, sb[1] + 6, hb[0] - 3, hb[1] - 2, CRE, m)
    # barra no quadril
    yb = max(hb[1], hf[1]) + 1
    linec(F, hb[0] - 7, yb, hf[0] + 7, yb, SEAM, m)
    # rasguinho perto da barra
    rx, ry = hf[0] + 2, yb - 3
    pxc(F, rx, ry, DEEP, m); pxc(F, rx + 1, ry, DEEP, m); pxc(F, rx + 1, ry - 1, SEAM, m)
    if fem:
        f = sf
        for k in range(-4, 4):
            pxc(F, f[0] - 4 + k, f[1] + 14 - (1 if abs(k) < 2 else 0), SEAM, m)
    # gola careca: faixa canelada + buraco do pescoço transparente
    gx, gy = nx + 1, ny
    band = F.mask(ell(gx, gy, 6.2, 3.4)) & m
    F.a[band, :3] = RIB
    cut(F, ell(gx + .5, gy - .5, 4.2, 2.2), edge=None, within=m)
    ring = dilate(F.mask(ell(gx + .5, gy - .5, 4.2, 2.2))) & band & (F.a[..., 3] > 0)
    F.a[ring, :3] = SEAM
    low = band & ~shift(band, 0, -1) & (F.a[..., 3] > 0)
    F.a[low, :3] = SEAM


def d_shirt_arm(F, P):
    ua, _ = arm_w(P)
    shp, a, b = sleeve(P, 'f', ua, 1.5)
    m = F.part(shp, W)
    across(F, a, b, 1.0, 5, SEAM, m, off=-1.5)
    mid = L2(a, b, .45)
    pxc(F, mid[0] + 1, mid[1], CRE, m); pxc(F, mid[0] + 2, mid[1] + 1, CRE, m)


# ---------------------------------------------------------------- calça (tint)

def d_pants(F, P):
    mb = F.part(thigh(P, 'b', grow=1) + shin(P, 'b', grow=1, upto=.85), FAR, tex=.05)
    kb, fb = P['kn_b'], P['ft_b']
    across(F, kb, (fb[0], fb[1] - 3), .78, 5, far(SEAM), mb)
    across(F, P['hip_b'], kb, .9, 3, far(SEAM), mb)
    m = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=1) + shin(P, 'f', grow=1, upto=.85), W, tex=.05)
    hb, hf = P['hip_b'], P['hip_f']
    kf, ff = P['kn_f'], P['ft_f']
    # braguilha / gancho
    cx = (hb[0] + hf[0]) / 2 + 1
    linec(F, cx, hb[1] - 2, cx, hb[1] + 4, SEAM, m)
    linec(F, cx, hb[1] + 4, cx + 2, hb[1] + 6, SEAM, m)
    # bolso em curva no quadril da frente
    px_, py_ = hf[0] + 5, hf[1] - 2
    for k, (dx, dy) in enumerate(((0, 0), (-1, 1), (-2, 2), (-2, 3), (-1, 4))):
        pxc(F, px_ + dx - 2, py_ + dy, SEAM, m)
    # costura lateral da perna da frente
    ux, uy = unit(hf, kf)
    nx, ny = -uy, ux
    if nx < 0:
        nx, ny = -nx, -ny
    linec(F, hf[0] + nx * 4, hf[1] + 4, kf[0] + nx * 3.5, kf[1] + ny * 3.5, CRE, m)
    # vincos do joelho e barra dobrada
    across(F, hf, kf, .85, 3, SEAM, m, off=0)
    ux2, uy2 = unit(kf, ff)
    pxc(F, kf[0] - 2, kf[1] + 3, SEAM, m); pxc(F, kf[0] - 1, kf[1] + 4, SEAM, m)
    across(F, kf, (ff[0], ff[1] - 3), .78, 5, SEAM, m)
    # rasgo no joelho (furo transparente -> pele aparece) com fiapos
    kx, ky = kf[0] + 1, kf[1] + 1
    hole = cut(F, poly((kx - 1.5, ky - .5), (kx + 1.5, ky - .5), (kx + 1.5, ky + .5), (kx - 1.5, ky + .5)),
               edge=DEEP, within=m)
    if hole.any():
        pxc(F, kx - 1, ky, W, m); pxc(F, kx + 1, ky + 1, W, m)


# ---------------------------------------------------------------- jaqueta (tint)

def jacket_torso(P):
    pts = torso_pts(P, 2)
    out = []
    for k, (x, y) in enumerate(pts):
        if k in (6, 7):
            y += 2
        out.append((x, y))
    sh = [out]
    if P['body'] == 'f':
        f = P['sh_f']
        sh += ell(f[0] - 4, f[1] + 9, 7, 6)
    return sh


def jsleeve(P, s, grow=2):
    ua, fa = arm_w(P)
    return upper_arm(P, s, w=ua, grow=grow + 1.5) + fore_arm(P, s, w=fa, grow=grow, upto=.8)


def _sleeve_detail(F, P, s, m, cs, cc):
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    across(F, el, ha, .8, 5, cs, m, off=-2)
    across(F, el, ha, .8, 5, cc, m, off=-1)
    # vincos do cotovelo
    ex, ey = el
    pxc(F, ex - 1, ey - 1, cs, m); pxc(F, ex, ey, cs, m); pxc(F, ex + 1, ey + 2, cs, m)
    pxc(F, ex + 2, ey - 1, cc, m)
    # costura do ombro
    sh = P['sh_' + DSIDE(s)]
    across(F, sh, el, .12, 3, cc, m)


def d_jacket(F, P):
    mb = F.part(jsleeve(P, 'b'), FAR, tex=.06)
    _sleeve_detail(F, P, 'b', mb, far(SEAM), far(CRE))
    m = F.part(jacket_torso(P), W, tex=.08)
    nx, ny = P['neck']
    pv = P['pelvis']
    sb, sf = P['sh_b'], P['sh_f']
    hb, hf = P['hip_b'], P['hip_f']
    bot = max(hb[1], hf[1]) + 5
    # cós/barra
    linec(F, hb[0] - 8, bot - 2, hf[0] + 8, bot - 2, SEAM, m)
    # bolsos faca no quadril
    linec(F, hf[0] + 1, bot - 9, hf[0] + 4, bot - 4, DEEP, m)
    linec(F, hf[0] + 2, bot - 9, hf[0] + 5, bot - 4, CRE, m)
    linec(F, hb[0] - 3, bot - 9, hb[0] - 5, bot - 4, DEEP, m)
    # bolso de peito com lapela e botão (lado da frente)
    px_, py_ = nx + 10, ny + 8
    if P['body'] == 'f':
        py_ += 1
    linec(F, px_, py_, px_ + 5, py_, DEEP, m)
    linec(F, px_, py_ + 1, px_ + 5, py_ + 1, CRE, m)
    linec(F, px_, py_ + 1, px_, py_ + 6, SEAM, m)
    linec(F, px_ + 5, py_ + 1, px_ + 5, py_ + 6, SEAM, m)
    linec(F, px_, py_ + 6, px_ + 5, py_ + 6, SEAM, m)
    pxc(F, px_ + 2, py_ + 2, DEEP, m); pxc(F, px_ + 3, py_ + 2, DEEP, m)
    # costura de ombro / cava
    linec(F, nx + 7, ny - 1, sf[0] + 2, sf[1] - 2, CRE, m)
    linec(F, sb[0] + 2, sb[1] + 2, sb[0] + 3, sb[1] + 9, SEAM, m)
    # abertura da frente transparente (camisa aparece por baixo)
    top_l, top_r = (nx - 1, ny - 2), (nx + 8, ny - 2)
    bl, br = (pv[0] + 3, bot + 2), (pv[0] + 8, bot + 2)
    op = cut(F, poly(top_l, top_r, br, bl), edge=None, within=m)
    ring = dilate(op) & ~op & (F.a[..., 3] > 0)
    F.a[ring, :3] = mix(W * .32, INK, .55)
    # zíper aberto na borda esquerda (dentes alternados)
    zl = dilate(ring) & ~ring & ~op & (F.a[..., 3] > 0) & m
    ys, xs = np.nonzero(zl)
    for y, x in zip(ys, xs):
        if x < (lerp(top_l[0], bl[0], (y - top_l[1]) / max(1, bl[1] - top_l[1])) + 1):
            F.a[y, x, :3] = RIB if (y % 2 == 0) else DEEP
    # gola esporte por cima
    gc = mix(W, MOON, .1)
    F.part(poly((nx - 7, ny - 3), (nx - 1, ny), (nx + 1, ny + 7), (nx - 6, ny + 3)), gc, clip=None)
    F.part(poly((nx + 14, ny - 3), (nx + 8, ny), (nx + 7, ny + 7), (nx + 13, ny + 3)), gc, clip=None)


def d_jacket_arm(F, P):
    m = F.part(jsleeve(P, 'f'), W, tex=.06)
    _sleeve_detail(F, P, 'f', m, SEAM, CRE)


# ---------------------------------------------------------------- tênis padrão (fixo)

CANVAS = hexc('#2f4470')
RUBBER = hexc('#e6dfcf')
LACE = hexc('#ece6da')
DIRT = hexc('#8a7a62')


def d_shoes(F, P):
    for s in ('b', 'f'):
        fx, fy = P['ft_' + DSIDE(s)]
        lift = max(0.0, G - fy)
        kneel = P.get('kneel', 0)
        deg = min(22, lift * 3.5) if not kneel else 0
        T = lambda sh: rot(sh, fx, fy, deg)
        body = poly((fx - 3, fy - .5), (fx - 3.5, fy - 4.5), (fx - 1, fy - 6.5), (fx + 2.5, fy - 6.5),
                    (fx + 6, fy - 4.5), (fx + 9.5, fy - 3), (fx + 10.5, fy - 1), (fx + 10, fy + .5), (fx - 2.5, fy + .5))
        sole = poly((fx - 4, fy - 1.5), (fx + 12, fy - 1.5), (fx + 12, fy + 2), (fx - 4, fy + 2))
        toe = ell(fx + 8.5, fy - 1.8, 2.6, 2.0)
        heel = poly((fx - 4, fy - 4), (fx - 1.5, fy - 4), (fx - 1.5, fy), (fx - 4, fy))
        k = .2 if s == 'b' else 0
        cv = far(CANVAS, k) if k else CANVAS
        rb = far(RUBBER, k) if k else RUBBER
        F.part(T(body), cv, marks=[(T(sole), rb), (T(toe), rb), (T(heel), far(rb, .12))], tex=.12)
        # cadarço
        for j, (dx, dy) in enumerate(((1, -5.5), (2.5, -5), (4, -4.5))):
            x, y = rp(fx + dx, fy + dy, fx, fy, deg)
            F.px(x, y, far(LACE, k) if k else LACE)
        # linha da sola e encardido
        x0, y0 = rp(fx - 2, fy - 1.5, fx, fy, deg)
        x1, y1 = rp(fx + 7, fy - 1.5, fx, fy, deg)
        F.line(x0, y0, x1, y1, far(RUBBER * .62, k + .2))
        for dx in (0, 5):
            x, y = rp(fx + dx, fy, fx, fy, deg)
            F.px(x, y, DIRT)


# ---------------------------------------------------------------- efeitos (fixo)

def d_fx(F, P):
    pose_fx(F, P)
    row, i = P['row'], P['i']
    if row == 'death' and i == 5:
        for (x, y) in ((40, 70), (52, 64), (30, 78)):
            star(F, x, y, r=3)
    if row == 'hurt' and i in (1, 2):
        hx, hy = P['head']
        for (dx, dy) in ((-17, -10), (15, -16)):
            x, y = hx + dx, hy + dy - (i - 1) * 2
            F.part(poly((x, y - 2), (x + 1.5, y + 1), (x, y + 2), (x - 1.5, y + 1)), '#bfe4f4', shade=False,
                   ol='#2a4a66', layer=F.fx)
    if row == 'special' and i <= 3:
        # rolo de atadura na mão da frente e tira esticada até a outra mão
        ax, ay = P['ha_f']
        bx, by = P['ha_b']
        rx, ry = ax + 1, ay - 4
        # tira de gaze com barriguinha entre o rolo e a outra mão
        n = 14
        for k in range(n + 1):
            t = k / n
            x = lerp(rx - 1, bx, t)
            y = lerp(ry + 2, by - 1, t) + 3 * math.sin(math.pi * t) * (1 if i < 2 else .3)
            F.px(x, y, '#f4efe6', layer=F.fx)
            F.px(x, y + 1, '#c9c0b2', layer=F.fx)
        # rolo (cilindro deitado): corpo + face circular com miolo
        F.part(poly((rx - 3, ry - 2.5), (rx + 2, ry - 2.5), (rx + 2, ry + 2.5), (rx - 3, ry + 2.5)), '#f4efe6',
               ol='#5a4a40', layer=F.fx, light=.3)
        F.part(ell(rx + 2, ry, 1.8, 2.6), '#fffaf0', ol='#5a4a40', layer=F.fx, shade=False)
        F.px(rx + 2, ry, '#b8ae9e', layer=F.fx)
        F.line(rx - 2, ry - 1, rx, ry - 1, '#d8cfc0', layer=F.fx)
        if i >= 2:
            F.px(rx - 1, ry + 1, '#c9343a', layer=F.fx)


# ---------------------------------------------------------------- render das camadas

LAYER_FN = {
    'body': d_body, 'arm': d_arm, 'face': d_face, 'shirt': d_shirt, 'shirt_arm': d_shirt_arm,
    'pants': d_pants, 'jacket': d_jacket, 'jacket_arm': d_jacket_arm, 'shoes': d_shoes,
}
TINT = {'body': True, 'arm': True, 'face': False, 'shirt': True, 'shirt_arm': True, 'pants': True,
        'jacket': True, 'jacket_arm': True, 'shoes': False, 'shadow': False, 'fx': False}
ORDER = ['shadow', 'hair_back', 'body', 'face', 'pants', 'shoes', 'shirt', 'jacket', 'bag', 'arm', 'shirt_arm',
         'jacket_arm', 'beard', 'hair', 'head', 'acc', 'weapon', 'fx']


def layer_frame(layer, row, i, body):
    P = pose(row, i, body)
    rotq = P.get('rotate')
    if layer == 'shadow':
        if not rotq:
            return shadow_layer(64, 17)
        k = min(1.0, abs(rotq[0]) / 90.0)
        return shadow_layer(64 - 8 * k, 17 + 16 * k)
    F = Frame()
    if layer == 'fx':
        d_fx(F, P)
        return F.fx.copy()
    LAYER_FN[layer](F, P)
    F.fx[:] = 0
    if rotq:
        F.a = rotate_fit(F.a, rotq)
    return compose(F, tint=P.get('tint'), alpha=P.get('alpha', 1.0))


def layer_sheet(layer, body='m'):
    out = np.zeros((S * len(HROWS), S * 8, 4), np.uint8)
    for r, name in enumerate(HROWS):
        for c in range(HNFR[name]):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = layer_frame(layer, name, c, body)
    return out


def tint_mul(a, col):
    if col is None:
        return a
    o = a.copy()
    o[..., :3] = np.clip(a[..., :3].astype(float) * hexc(col) / 255.0, 0, 255).astype(np.uint8)
    return o


def hair_preview_sheet(body):
    """cabelo provisório SÓ para a prévia (o cabelo de verdade é de outro grupo)."""
    out = np.zeros((S * len(HROWS), S * 8, 4), np.uint8)
    for r, name in enumerate(HROWS):
        for c in range(HNFR[name]):
            P = pose(name, c, body)
            F = Frame()
            cx, cy = P['head']
            if body == 'f':
                sh = ell(cx - 1, cy - 9, 16.5, 9) + poly((cx - 17, cy - 8), (cx - 17, cy + 14), (cx - 8, cy + 12), (cx - 8, cy - 2))
            else:
                sh = ell(cx - 1, cy - 10, 16, 8) + poly((cx - 16, cy - 8), (cx - 14, cy + 5), (cx - 9, cy - 3))
            F.part(rot(sh, cx, cy, P['hrot']), '#3a2418', tex=.12)
            if P.get('rotate'):
                F.a = rotate_fit(F.a, P['rotate'])
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = compose(F, tint=P.get('tint'))
    return out


def composite(sheets, look, with_hair=True):
    """compõe as camadas na ordem do contrato multiplicando a cor de cada uma."""
    body = look['body']
    colmap = {'body': look['skin'], 'arm': look['skin'], 'shirt': look['shirt'], 'shirt_arm': look['shirt'],
              'pants': look['pants'], 'jacket': look.get('jacket'), 'jacket_arm': look.get('jacket')}
    base = None
    for L in ORDER:
        if L == 'hair':
            a = sheets.get(('hair', body)) if with_hair else None
        elif L in ('shadow', 'fx'):
            a = sheets.get((L, 'any'))
        else:
            a = sheets.get((L, body))
        if a is None:
            continue
        if L in ('jacket', 'jacket_arm') and not look.get('jacket'):
            continue
        if TINT.get(L):
            a = tint_mul(a, colmap[L])
        base = a.copy() if base is None else over(base, a)
    return base


LOOKS = [
    dict(skin='#c98d5e', shirt='#c0262d', pants='#2b3a5a', jacket='#5b3a24'),
    dict(skin='#f6d3b3', shirt='#e8e4dc', pants='#4c6b3a', jacket=None),
    dict(skin='#4f2f18', shirt='#e3b23c', pants='#3d3d3d', jacket='#30343a'),
    dict(skin='#a86b3c', shirt='#6c3fa0', pants='#8a8a8a', jacket='#7a1f24'),
    dict(skin='#7a4a26', shirt='#262626', pants='#6b4a2b', jacket='#3f5a3a'),
    dict(skin='#e8b48a', shirt='#2f6db5', pants='#2b3a5a', jacket=None),
    dict(skin='#e8b48a', shirt='#3b8f3e', pants='#6b4a2b', jacket=None),
]


def build_all(prev_dir=None):
    os.makedirs(OUT, exist_ok=True)
    sheets = {}
    items = []
    names = {'body': 'Corpo (pele)', 'arm': 'Braço da frente (pele)', 'face': 'Rosto', 'shirt': 'Camiseta',
             'shirt_arm': 'Manga da camiseta', 'pants': 'Calça', 'jacket': 'Jaqueta', 'jacket_arm': 'Manga da jaqueta',
             'shoes': 'Tênis surrado'}
    opc = {'body': 'skin', 'arm': 'skin', 'face': 'body', 'shirt': 'shirt', 'shirt_arm': 'shirt', 'pants': 'pants',
           'jacket': 'jacket', 'jacket_arm': 'jacket', 'shoes': 'feet'}
    cpad = {'body': '#c98d5e', 'arm': '#c98d5e', 'face': None, 'shirt': '#c0262d', 'shirt_arm': '#c0262d',
            'pants': '#2b3a5a', 'jacket': '#5b3a24', 'jacket_arm': '#5b3a24', 'shoes': None}
    for body in ('m', 'f'):
        for L in ('body', 'arm', 'face', 'shirt', 'shirt_arm', 'pants', 'jacket', 'jacket_arm', 'shoes'):
            a = layer_sheet(L, body)
            sheets[(L, body)] = a
            fn = '%s_%s.png' % (L, body)
            Image.fromarray(a, 'RGBA').save(os.path.join(OUT, fn))
            items.append(dict(id='%s_%s' % (L, body), nome='%s (%s)' % (names[L], 'masc.' if body == 'm' else 'fem.'),
                              camada=L, arquivo='heroi/' + fn, tint=TINT[L], corpo=body, cor_padrao=cpad[L],
                              opcao=opc[L]))
    for L, nm in (('shadow', 'Sombra no chão'), ('fx', 'Efeitos da pose')):
        a = layer_sheet(L)
        sheets[(L, 'any')] = a
        Image.fromarray(a, 'RGBA').save(os.path.join(OUT, L + '.png'))
        items.append(dict(id=L, nome=nm, camada=L, arquivo='heroi/%s.png' % L, tint=False, corpo='any',
                          cor_padrao=None, opcao='body'))
    man = {'grupo': 'corpo', 'itens': items,
           'cores': {'skin': CATALOG['skin'], 'shirt': CATALOG['shirt'], 'pants': CATALOG['pants'],
                     'jacket': CATALOG['jacket']},
           'linhas': HROWS, 'quadros': {k: HNFR[k] for k in HROWS}, 'duracoes': {k: HDUR[k] for k in HROWS},
           'ordem': ORDER, 'quadro_px': S,
           'obs': 'Camadas tint=true estão em branco: multiplicar pela cor. jacket null = não desenhar jacket/jacket_arm. '
                  'shoes = tênis padrão; esconder quando houver equipamento de pé. '
                  'Tinta de dano já está aplicada em cada camada (flash = mistura com branco + alpha 175); '
                  'como o multiply escurece de novo o branco, nos quadros hurt 0 e death 0 a página pode, se quiser, '
                  'clarear o resultado final em vez de confiar só na camada.'}
    with open(os.path.join(OUT, 'corpo.json'), 'w', encoding='utf-8') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
    # prévias
    for body in ('m', 'f'):
        sheets[('hair', body)] = hair_preview_sheet(body)
    grid = []
    for body in ('m', 'f'):
        for lk in LOOKS[:3]:
            comp = composite(sheets, dict(lk, body=body), with_hair=True)   # cabelo provisório só p/ conferência
            for (r, c) in ((0, 0), (1, 2)):
                grid.append(comp[r * S:(r + 1) * S, c * S:(c + 1) * S])
    cols = 6
    rows = (len(grid) + cols - 1) // cols
    pv = np.zeros((rows * S, cols * S, 4), np.uint8)
    for k, g in enumerate(grid):
        pv[(k // cols) * S:(k // cols + 1) * S, (k % cols) * S:(k % cols + 1) * S] = g
    bg = np.zeros_like(pv); bg[..., :3] = (58, 52, 66); bg[..., 3] = 255
    Image.fromarray(over(bg, pv), 'RGBA').resize((pv.shape[1] * 2, pv.shape[0] * 2), Image.NEAREST).save(
        os.path.join(OUT, 'preview_corpo.png'))
    if prev_dir:
        for body in ('m', 'f'):
            for k, lk in enumerate(LOOKS):
                comp = composite(sheets, dict(lk, body=body))
                bg = np.zeros_like(comp); bg[..., :3] = (70, 64, 80); bg[..., 3] = 255
                im = Image.fromarray(over(bg, comp), 'RGBA')
                if k < 2:
                    im.save(os.path.join(prev_dir, 'heroi_corpo_full_%s%d.png' % (body, k)))
                # close: 2 primeiras linhas, 4 colunas, 3x
                im.crop((0, 0, 512, 256)).resize((1536, 768), Image.NEAREST).save(
                    os.path.join(prev_dir, 'heroi_corpo_zoom_%s%d.png' % (body, k)))
        # catálogo: cada pele/camisa/calça/jaqueta (idle 0)
        tiles = []
        for body in ('m', 'f'):
            for k in range(7):
                lk = dict(skin=CATALOG['skin'][k % 6], shirt=CATALOG['shirt'][k], pants=CATALOG['pants'][k % 5],
                          jacket=CATALOG['jacket'][k % 5], body=body)
                comp = composite(sheets, lk)
                tiles.append(comp[0:S, 0:S])
        cat = np.zeros((2 * S, 7 * S, 4), np.uint8)
        for k, t in enumerate(tiles):
            cat[(k // 7) * S:(k // 7 + 1) * S, (k % 7) * S:(k % 7 + 1) * S] = t
        bg = np.zeros_like(cat); bg[..., :3] = (70, 64, 80); bg[..., 3] = 255
        Image.fromarray(over(bg, cat), 'RGBA').resize((7 * S * 2, 2 * S * 2), Image.NEAREST).save(
            os.path.join(prev_dir, 'heroi_corpo_catalogo.png'))
    return sheets


if __name__ == '__main__':
    pd = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == 'prev' else None
    build_all(pd)
    print('ok')
