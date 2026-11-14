"""Pet: Jabuti (jabuti-piranga) — sprite sheet 1024x768 no formato dos zumbis.
Rodar da pasta tools:  python pet_jabuti.py
"""
import json
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (S, G, Frame, ell, poly, limb, chain, Xf, rp, eye, star, sparkle, impact, puff,
                    dust, heart, plus, shadow_layer, compose, sheet, hexc, mix, ROWS)

ID = 'jabuti'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- paleta ----------------
SHELL = '#2c221d'     # placa escura
SHELL2 = '#3d2f26'    # placa (marginais)
AREOLA = '#e3a92e'    # centro amarelo das placas
AREOLA2 = '#f5d36a'   # brilho do centro
SKIN = '#3a302b'      # pele escura
SKIN2 = '#4b3f38'     # pescoço
SCALE = '#d9542b'     # escamas vermelho-alaranjadas
SCALE2 = '#f08a3e'    # escama clara
PLAST = '#d6b46c'     # plastrão
BEAK = '#c7a16a'      # bico córneo
LEATHER = '#8a5530'   # arnês de couro
LEATHER2 = '#6b3f22'
METAL = '#c9c3b0'     # fivela / argola
IRIS = '#6a3c16'

# ---------------- geometria do casco (coord. do corpo) ----------------
CX, RIM, RX, RY = 58.0, 101.0, 31.0, 31.0


def dpt(a, d):
    return (CX + (RX - d) * math.cos(a), RIM + (RY - d * 1.05) * math.sin(a))


def band(a0, a1, d0, d1, n=6):
    pts = [dpt(a0 + (a1 - a0) * i / n, d0) for i in range(n + 1)]
    pts += [dpt(a1 + (a0 - a1) * i / n, d1) for i in range(n + 1)]
    return [pts]


def cen(a0, a1, d0, d1):
    return dpt((a0 + a1) / 2, (d0 + d1) / 2)


class Chain:
    def __init__(self, *xs):
        self.xs = [x for x in xs if x is not None]

    def p(self, x, y):
        for t in self.xs:
            x, y = t.p(x, y)
        return (x, y)

    def __call__(self, shapes):
        return [[self.p(x, y) for (x, y) in pl] for pl in shapes]


def lerpc(a, b, t):
    return np.clip(mix(hexc(a), hexc(b), t), 0, 255)


def tone(c, glow):
    return lerpc(c, '#ffd45a', glow * .6) if glow else c


# ---------------- desenho ----------------
LEGS = {  # hip (corpo), pé base (mundo x), largura
    'fb': ((48, 101), 49, 7.5),
    'ff': ((85, 100), 89, 7.5),
    'nb': ((38, 102), 37, 9),
    'nf': ((78, 101.5), 80, 9.5),
}


def draw_leg(F, X, T, name, foot, retract, far, wig=0.0):
    (hx, hy), fx0, w = LEGS[name]
    H = X.p(hx, hy)
    fdx, lift = foot
    Pf = T.p(fx0 + fdx, G - 2.5 - lift)
    if retract:
        Pf = (Pf[0] + (H[0] - Pf[0]) * retract, Pf[1] + (H[1] - Pf[1]) * retract)
    if wig:
        Pf = (Pf[0] + wig, Pf[1])
    col = SKIN if not far else '#2b231f'
    sc = SCALE if not far else '#9c3c22'
    front = name in ('nf', 'ff')
    # joelho levemente pra fora (pernas de "elefante")
    kx = (H[0] + Pf[0]) / 2 + (1.5 if front else -1.5)
    ky = (H[1] + Pf[1]) / 2
    shp = limb(H[0], H[1], kx, ky, w, w * .95) + limb(kx, ky, Pf[0], Pf[1], w * .95, w * .9)
    ang = math.atan2(Pf[1] - H[1], Pf[0] - H[0])
    marks = []
    if front:  # escamas grandes na frente da pata
        for t, o in ((.25, 1.8), (.5, 2.2), (.75, 1.6), (.5, -1.2)):
            px = H[0] + (Pf[0] - H[0]) * t
            py = H[1] + (Pf[1] - H[1]) * t
            marks.append((ell(px + o, py, 1.5, 1.0), sc))
    else:
        for t in (.45,):
            px = H[0] + (Pf[0] - H[0]) * t
            py = H[1] + (Pf[1] - H[1]) * t
            marks.append((ell(px - 1, py, 1.5, 1.0), sc))
    F.part(shp, col, marks=marks, tex=.12, light=.18)
    # pé + garras
    flip = T.xs[0].sy < 0
    fy = Pf[1] + (-1 if flip else 1)
    F.part(ell(Pf[0] + 1, fy, w * .62, 3), col if not far else '#2b231f',
           marks=[(ell(Pf[0] + 3, fy - (1 if not flip else -1), 1.4, .9), sc)], light=.2)
    if not far:
        cy = int(round(fy + (2 if not flip else -2)))
        for k in range(3):
            F.px(Pf[0] + 3 + k * 2, cy, '#efe2c4')
    return Pf


def draw(P):
    F = Frame()
    T = Chain(P.get('T') or Xf())
    B = Xf(60, 101, P.get('tilt', 0), P.get('bx', 0), P.get('by', 0))
    X = Chain(B, *T.xs)
    glow = P.get('glow', 0)
    retract = P.get('retract', 0)
    feet = P.get('feet', {})
    wig = P.get('wig', {})

    # pernas do lado de lá
    for nm in ('fb', 'ff'):
        draw_leg(F, X, T, nm, feet.get(nm, (0, 0)), retract, True, wig.get(nm, 0))

    # rabinho
    F.part(X(chain([(31, 99), (26, 102), (22, 104)], 6, 2)), SKIN,
           marks=[(X(ell(27, 101, 2, 1.2)), SCALE)])

    # pescoço + cabeça
    ext = P.get('neck', 1.0) * (1 - retract)
    base = (82, 95)
    hc = (base[0] + 19 * ext + P.get('hx', 0), base[1] - 9 * ext + P.get('hy', 0))
    if ext > .15:
        mid = (base[0] + 9 * ext, base[1] - 2 * ext + P.get('hy', 0) * .4)
        F.part(X(chain([base, mid, (hc[0] - 4, hc[1] + 2)], 10, 8)), SKIN2, tex=.15,
               marks=[(X(ell(mid[0], mid[1] - 2, 2, 1.3)), SCALE), (X(ell(mid[0] + 4, mid[1] + 1, 1.6, 1)), SCALE),
                      (X(limb(mid[0] - 2, mid[1] + 2, mid[0] + 2, mid[1] + 3, 1)), '#2e2521')])
    H = Chain(Xf(hc[0], hc[1], P.get('hdeg', 0)), *X.xs)
    jaw = P.get('jaw', 0)
    hx, hy = hc
    # mandíbula (abre girando na dobradiça)
    J = Chain(Xf(hx - 2, hy + 3.5, jaw), *H.xs)
    if jaw:
        F.part(J(poly((hx - 1, hy + 4), (hx + 8, hy + 3.5), (hx + 7, hy + 6.2), (hx, hy + 6.5))), '#a8323a', shade=False)
    F.part(J(poly((hx - 3, hy + 3), (hx + 7.5, hy + 3.5), (hx + 6.5, hy + 6.5), (hx - 2, hy + 6.8))), BEAK,
           marks=[(J(poly((hx - 3, hy + 3), (hx + 2, hy + 3), (hx + 1, hy + 7), (hx - 3, hy + 7))), SKIN)])
    # crânio
    F.part(H(ell(hx, hy, 8.2, 6.4, -6)), SKIN, tex=.1,
           marks=[(H(ell(hx - 1.5, hy - 4.2, 2.2, 1.3, -10)), SCALE), (H(ell(hx + 3, hy - 4.6, 1.8, 1.1, -15)), SCALE2),
                  (H(ell(hx - 5.5, hy - 2, 1.4, 1.2)), SCALE), (H(ell(hx - 4, hy + 3, 1.6, 1)), SCALE),
                  (H(ell(hx + 6, hy - 2.6, 1.2, 1)), SCALE2), (H(ell(hx + 1.5, hy - 2.8, 1, .8)), AREOLA)])
    # bico superior (gancho)
    F.part(H(poly((hx + 3, hy + .5), (hx + 8, hy - 1.5), (hx + 10.2, hy + 1.5), (hx + 9.6, hy + 4.6),
                  (hx + 7.5, hy + 4), (hx + 3, hy + 3.6))), BEAK, light=.3)
    nx, ny = H.p(hx + 8.3, hy)
    F.px(nx, ny, '#1a1010')
    ex, ey = H.p(hx + 2.2, hy - .8)
    ek = P.get('eye', 'open')
    if ek == 'half':
        F.flat(ell(ex + .5, ey + .5, 2.6, 2.9), '#120a0a')
        F.flat(ell(ex + .5, ey + 1.2, 1.8, 1.4), IRIS)
        F.line(ex - 2, ey - .5, ex + 2, ey - .5, '#3a302b')
    elif ek == 'shut':
        F.line(ex - 2, ey, ex + 2, ey + 1, '#120a0a'); F.px(ex - 2, ey - 1, '#120a0a')
        F.line(ex - 2, ey - 2, ex + 1, ey - 3, '#120a0a')
    else:
        eye(F, ex, ey, ek, iris=IRIS, r=2)
    # bochecha clara
    if ek in ('open', 'happy', 'half'):
        F.px(*H.p(hx + 4.5, hy + 2), '#e07a52')

    # plastrão
    F.part(X(poly((33, 100), (86, 100), (82, 105.5), (40, 105.5))), tone(PLAST, glow),
           marks=[(X(poly((52, 100), (53, 100), (53, 106), (52, 106))), '#a88a4c'),
                  (X(poly((66, 100), (67, 100), (67, 106), (66, 106))), '#a88a4c')], light=.15)

    # casco: base + placas
    F.part(X(band(math.pi, 2 * math.pi, 0, RY, 24) and ell(CX, RIM, RX + .5, RY + .5) ), tone(SHELL, glow),
           clip=F.mask(X(poly((0, 0), (128, 0), (128, RIM + 1.5), (0, RIM + 1.5)))))
    A0, A1 = math.pi, 2 * math.pi
    # marginais
    n = 9
    for i in range(n):
        a0 = A0 + (A1 - A0) * i / n
        a1 = A0 + (A1 - A0) * (i + 1) / n
        cxm, cym = dpt((a0 + a1) / 2, 1.5)
        F.part(X(band(a0, a1, 0, 6.5, 4)), tone(SHELL2, glow),
               marks=[(X(ell(cxm, cym + .5, 1.9, 1.2)), tone(AREOLA, glow))], light=.18, tex=.1)
    # costais
    cut = [A0, A0 + .62, A0 + 1.28, A0 + 1.92, A1 - .02]
    for i in range(4):
        a0, a1 = cut[i], cut[i + 1]
        c = cen(a0, a1, 6.5, 17.5)
        rr = 3.6 if 0 < i < 3 else 2.8
        F.part(X(band(a0, a1, 6.5, 17.5, 6)), tone(SHELL, glow),
               marks=[(X(ell(c[0], c[1] - .5, rr, rr * .72)), tone(AREOLA, glow)),
                      (X(ell(c[0] - .8, c[1] - 1.4, rr * .45, rr * .3)), tone(AREOLA2, glow))], tex=.12)
    # vertebrais (topo)
    cut = [A0, A0 + 1.2, A0 + 1.95, A1]
    for i in range(3):
        a0, a1 = cut[i], cut[i + 1]
        c = cen(a0, a1, 17.5, RY)
        c = (c[0], c[1] + 2)
        rr = 3.2 if i == 1 else 2.6
        F.part(X(band(a0, a1, 17.5, RY + .01, 6)), tone(SHELL, glow),
               marks=[(X(ell(c[0], c[1], rr, rr * .7)), tone(AREOLA, glow)),
                      (X(ell(c[0] - .8, c[1] - .9, rr * .45, rr * .3)), tone(AREOLA2, glow))], tex=.12, light=.3)

    # arnês de couro: cinta vertical + cinta da borda + argola no topo
    sp = [dpt(A0 + t, 0) for t in ()]
    strap = [dpt(1.5 * math.pi + .16, d) for d in (-.5, 6, 14, 22, RY - 1)]
    F.part(X(chain(strap, 4.2, 4.2)), LEATHER, tex=.15,
           marks=[(X(ell(strap[i][0] + .2, strap[i][1], .6, .6)), '#d9b07a') for i in range(1, 4)])
    bx_, by_ = dpt(1.5 * math.pi + .16, 13)
    F.part(X(poly((bx_ - 2.6, by_ - 2.4), (bx_ + 2.6, by_ - 2.4), (bx_ + 2.6, by_ + 2.4), (bx_ - 2.6, by_ + 2.4))),
           METAL, marks=[(X(poly((bx_ - 1, by_ - 1), (bx_ + 1, by_ - 1), (bx_ + 1, by_ + 1), (bx_ - 1, by_ + 1))), LEATHER2)])
    tx, ty = dpt(1.5 * math.pi + .16, -.5)
    flipped = T.xs[0].sy < 0
    rs = X(ell(tx, ty - 3.5, 3.4, 3.0)) if not flipped else []
    hole = F.mask(X(ell(tx, ty - 3.4, 1.5, 1.2)))
    if rs:
        F.part(rs, METAL, light=.4, clip=~hole)
    if rs:
        F.a[hole & ~F.mask(X(ell(CX, RIM, RX - 1, RY - 1)))] = 0
        F.a[hole & F.mask(X(ell(CX, RIM, RX - 1, RY - 1))), :3] = (30, 22, 18)

    # pernas do lado de cá
    for nm in ('nb', 'nf'):
        draw_leg(F, X, T, nm, feet.get(nm, (0, 0)), retract, False, wig.get(nm, 0))
    return F


def ring_fx(F, cx, cy, rx, ry, col, alpha=200, gap=0):
    n = int((rx + ry) * 4)
    for i in range(n):
        a = 2 * math.pi * i / n
        if gap and (i // gap) % 2:
            continue
        x, y = cx + rx * math.cos(a), cy + ry * math.sin(a)
        if y <= G + 1:
            F.px(x, y, col, F.fx, alpha)


SH = lambda dx=0, r=36: shadow_layer(60 + dx, r)


# ---------------- linhas da folha ----------------

def idle():
    out = []
    for i in range(4):
        b = [0, -.6, -1, -.5][i]
        P = dict(by=0, hy=b * 1.2, hdeg=[0, -2, -3, -1][i], neck=1 + [0, .02, .04, .02][i],
                 eye='half' if i == 3 else 'open')
        F = draw(P)
        out.append(compose(F, shadow=SH()))
    return out


def walk():
    out = []
    # passos lentos e pesados: diagonais (nf+fb) / (ff+nb)
    for i in range(8):
        ph = i / 8 * 2 * math.pi
        def ft(off):
            p = ph + off
            s = math.sin(p)
            dx = -4.5 * math.cos(p)   # pata no ar avança
            lift = max(0, s) * 4.5
            return (dx, lift)
        feet = {'nf': ft(0), 'fb': ft(0), 'ff': ft(math.pi), 'nb': ft(math.pi)}
        dip = abs(math.cos(ph)) * 1.4  # corpo afunda quando apoia
        P = dict(feet=feet, by=-1 + dip, tilt=1.2 * math.sin(ph), hy=1.6 * math.sin(2 * ph + .6),
                 hx=1.2 * math.cos(2 * ph), hdeg=3 * math.sin(2 * ph))
        F = draw(P)
        if i in (0, 4):
            dust(F, 84 if i == 0 else 40, G - 1, 2)
        out.append(compose(F, shadow=SH()))
    return out


def attack():
    out = []
    poses = [
        dict(neck=1.0, hdeg=0),
        dict(neck=.4, hy=2, hdeg=-8, tilt=-3, bx=-5, eye='angry'),
        dict(neck=1.45, hy=-1, hdeg=6, tilt=2, bx=-1, jaw=28, eye='angry'),
        dict(neck=1.52, hy=-1, hdeg=3, tilt=2, bx=0, jaw=4, eye='angry'),
        dict(neck=1.3, hdeg=0, tilt=1, bx=0, eye='open'),
        dict(neck=1.05, hdeg=-2, bx=0),
    ]
    for i, P in enumerate(poses):
        if i in (1,):
            P['feet'] = {'nf': (2, 0), 'ff': (2, 0)}
        if i in (2, 3):
            P['feet'] = {'nb': (2, 0), 'fb': (2, 0)}
        F = draw(P)
        if i == 1:
            sparkle(F, 104, 66, 2, '#ffd0a0')
        if i == 3:
            impact(F, 121, 86, 6)
        if i == 2:
            for k in range(3):
                F.line(86 - k * 2, 78 + k * 4, 94 - k * 2, 78 + k * 4, '#f4efe6')
        out.append(compose(F, shadow=SH(P.get('bx', 0))))
    return out


def hurt():
    out = []
    poses = [dict(eye='shut', neck=.8), dict(eye='shut', neck=.55, tilt=-7, bx=-5, by=-1, hdeg=-10),
             dict(eye='shut', neck=.7, tilt=-3, bx=-3, hdeg=-5), dict(eye='half', neck=.95, bx=-1)]
    for i, P in enumerate(poses):
        F = draw(P)
        if i == 1:
            star(F, 100, 70, r=3)
        out.append(compose(F, shadow=SH(P.get('bx', 0)), tint='flash' if i == 0 else None))
    return out


def death():
    out = []
    # 0 golpe, 1-2 tomba (compose rotate), 3 cai de costas, 4 patinhas se mexendo, 5 desmaiado
    F = draw(dict(eye='shut', neck=.8))
    out.append(compose(F, shadow=SH(), tint='flash'))
    F = draw(dict(eye='shut', neck=.6, hdeg=-12, feet={'nf': (0, 3), 'nb': (0, 2)}))
    out.append(compose(F, shadow=SH(0, 33), rotate=(14, 60, 110)))
    F = draw(dict(eye='x', neck=.6, hdeg=-20, feet={'nf': (0, 4), 'nb': (0, 4)}))
    out.append(compose(F, dy=-4, shadow=SH(-2, 30), rotate=(62, 60, 104)))
    # de casco pra baixo: espelho vertical nativo (luz continua vindo de cima)
    for i, (wg, ek) in enumerate([({}, 'x'), ({'nf': 2, 'nb': -2, 'ff': -2, 'fb': 2}, 'spiral'),
                                  ({'nf': -1, 'nb': 1, 'ff': 1, 'fb': -1}, 'x')]):
        T = Xf(0, 89.5, sy=-1, dy=[-1, 0, 0][i])
        P = dict(T=T, eye=ek, neck=.9, hdeg=8, hy=1, wig=wg,
                 feet={k: (0, -4.5 + (2.5 if (i == 1 and k in ('nf', 'fb')) else 0) - (2.5 if (i == 2 and k in ('nb', 'ff')) else 0)) for k in ('nf', 'nb', 'ff', 'fb')})
        F = draw(P)
        if i == 0:
            dust(F, 34, G - 1, 3); dust(F, 84, G - 1, 3)
        if i >= 1:
            ph = i * 1.3
            for k in range(3):
                a = ph + k * 2.09
                star(F, 104 + 11 * math.cos(a), 78 + 3.5 * math.sin(a), r=3 if k else 4)
        out.append(compose(F, shadow=SH(0, 34)))
    return out


def special():
    out = []
    # 0 olha pra cima, 1 recolhe, 2 escondido + brilho, 3 escudo no auge, 4 brilho some/patas saem, 5 sai feliz
    seq = [dict(neck=1.1, hdeg=-8, eye='wide'),
           dict(neck=.4, retract=.5, by=2, eye='shut'),
           dict(retract=1, by=5, glow=.6),
           dict(retract=1, by=5, glow=1),
           dict(retract=.55, by=3, glow=.35, neck=.5, eye='shut'),
           dict(neck=1.05, hdeg=-4, eye='happy')]
    for i, P in enumerate(seq):
        F = draw(P)
        by = P.get('by', 0)
        if i == 2:
            for (x, y, r) in [(40, 72, 3), (76, 68, 2), (62, 64, 2)]:
                sparkle(F, x, y + by, r)
        if i == 3:
            ring_fx(F, 58, 99 + by, 38, 36, '#ffe9a0', 230)
            ring_fx(F, 58, 99 + by, 41, 39, '#fff6c8', 140, gap=3)
            for (x, y, r) in [(24, 76, 3), (92, 70, 3), (58, 56, 4), (36, 96, 2), (98, 94, 2)]:
                sparkle(F, x, y + by, r)
        if i == 4:
            ring_fx(F, 58, 99 + by, 40, 38, '#ffe9a0', 110, gap=2)
            sparkle(F, 90, 74, 2)
        if i == 5:
            heart(F, 108, 66)
        out.append(compose(F, shadow=SH(0, 36 if i not in (2, 3) else 34)))
    return out


DESIGN = {
    "id": ID,
    "nome": "Jabuti",
    "sub": "piranga",
    "conceito": ("Um jabuti-piranga velho de guerra, teimoso e calmo, lento demais para andar sozinho: vai preso nas costas do herói "
                 "por um arnês de couro e só desce para morder ou virar escudo. Casco alto em domo, quase preto, com placas de centro "
                 "amarelo-ouro, e cabeça e patas escuras salpicadas de escamas vermelho-alaranjadas."),
    "partes": [
        {"parte": "Cabeça", "descricao": "Oval arredondada de ~16x13 px, pele marrom-quase-preta (#3a302b) com 5–6 escamas vermelho-alaranjadas e uma amarela no topo; inclina e balança no idle e no andar."},
        {"parte": "Olhos", "descricao": "Olho único visível de 4–5 px, íris âmbar-escura com pupila preta e ponto de brilho branco; pisca (meio fechado) no idle, fecha em traço no dano, vira X/espiral no desmaio e ^ feliz no fim do especial."},
        {"parte": "Bico", "descricao": "Bico córneo bege (#c7a16a) em gancho na ponta do focinho, narina de 1 px; a mandíbula inferior gira ~28° na dobradiça para abrir a boca rosada no bote."},
        {"parte": "Pescoço", "descricao": "Tubo enrugado de 10→8 px de largura (#4b3f38) com pintas laranja; estica até 1,5x no ataque e encolhe para dentro do casco no especial."},
        {"parte": "Carapaça e placas", "descricao": "Domo alto de ~62x31 px, placas escuras (#2c221d) separadas por sulcos de contorno: 9 marginais na borda com pinta amarela, 4 costais e 3 vertebrais com aréola amarela (#e3a92e) e brilho interno (#f5d36a)."},
        {"parte": "Plastrão", "descricao": "Faixa bege-amarelada (#d6b46c) de ~5 px sob a borda do casco, com dois sulcos escuros; aparece por cima quando ele cai de casco pra cima."},
        {"parte": "Patas", "descricao": "Quatro patas-coluna curtas de 7–9 px (de 'elefante'), as do lado de lá mais escuras; dianteiras cobertas de escamas vermelho-alaranjadas, pés ovais com 3 garras claras de 1 px."},
        {"parte": "Rabo", "descricao": "Rabinho cônico de 6→2 px saindo da traseira, com uma escama laranja."},
        {"parte": "Textura e marcas", "descricao": "Pontilhado leve nas placas e na pele, luz de lua no topo-esquerda e sombra roxa embaixo-direita; contraste preto + amarelo + vermelho típico do jabuti-piranga."},
        {"parte": "Acessório: arnês de couro", "descricao": "Cinta de couro marrom (#8a5530) de 4 px atravessando o casco de cima até a borda, com pespontos claros, fivela de metal (#c9c3b0) no meio e argola de engate no topo, onde o herói prende o jabuti na mochila."},
        {"parte": "Silhueta e pose", "descricao": "Corpo de ~80 px de largura, baixo e largo, casco em cúpula ocupando 3/4 da figura e cabeça saindo à direita; lê como jabuti mesmo em 1x pelo domo pontilhado de amarelo."}
    ],
    "paleta": [
        {"nome": "Placa escura", "hex": SHELL}, {"nome": "Placa marginal", "hex": SHELL2},
        {"nome": "Aréola amarela", "hex": AREOLA}, {"nome": "Brilho da aréola", "hex": AREOLA2},
        {"nome": "Pele escura", "hex": SKIN}, {"nome": "Escama piranga", "hex": SCALE},
        {"nome": "Plastrão", "hex": PLAST}, {"nome": "Bico", "hex": BEAK},
        {"nome": "Couro do arnês", "hex": LEATHER}, {"nome": "Metal da fivela", "hex": METAL}
    ],
    "animacoes": {
        "idle": "4 quadros: a cabeça sobe ~1 px e inclina levemente para trás enquanto o pescoço estica um pouco (respiração); no quadro 3 o olho fica meio fechado (piscada lenta).",
        "walk": "8 quadros de passada lenta em diagonal (dianteira de cá + traseira de lá, depois o par oposto): pés sobem até 4 px e avançam, o casco afunda ~1 px a cada apoio e balança 1°, a cabeça sobe e desce em dobro do ritmo; poeirinha nos quadros 0 e 4.",
        "attack": "0 pronto; 1 antecipação: recua o corpo, encolhe o pescoço, sobrancelha brava; 2 bote: pescoço estica 1,5x com boca aberta e linhas de velocidade; 3 impacto: bico fecha na frente com estrela de impacto; 4 segura e recolhe; 5 volta à pose.",
        "hurt": "0 flash branco pálido; 1 empurrado ~5 px para trás, casco inclina, olho fechado, cabeça meio recolhida e estrelinha; 2 ainda inclinado; 3 recupera com olho meio aberto.",
        "death": "0 flash; 1 tropeça e tomba 14° (compose rotate); 2 gira 62° para trás com olhos em X; 3 cai de casco pra baixo com poeira, plastrão para cima; 4 patinhas se mexendo no ar e olho em espiral com estrelas girando; 5 desmaiado de costas, olho X e estrelinhas (segura 600 ms).",
        "special": "0 olha para cima de olhos arregalados; 1 recolhe cabeça e patas pela metade e abaixa; 2 totalmente dentro do casco, que fica dourado com brilhos; 3 auge do escudo: casco dourado e cúpula de luz em volta com faíscas; 4 brilho some, patas e cabeça começam a sair; 5 sai feliz (olho ^) com um coraçãozinho."
    },
    "especial": "Casco-Escudo",
    "eventos": {
        "idle": {"0": "respira"},
        "walk": {"0": "passo", "4": "passo"},
        "attack": {"1": "sibilo", "3": "impacto"},
        "hurt": {"0": "dano"},
        "death": {"0": "dano", "3": "queda"},
        "special": {"1": "recolhe", "3": "escudo", "5": "sai"}
    }
}


def main():
    rows = {"idle": idle(), "walk": walk(), "attack": attack(), "hurt": hurt(), "death": death(),
            "special": special()}
    img = sheet(rows)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, ID + '.png'))
    with open(os.path.join(OUT, ID + '.json'), 'w', encoding='utf-8') as f:
        json.dump(DESIGN, f, ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        img.resize((img.width * 2, img.height * 2), 0).save(sys.argv[1])
    print(img.size)


if __name__ == '__main__':
    main()
