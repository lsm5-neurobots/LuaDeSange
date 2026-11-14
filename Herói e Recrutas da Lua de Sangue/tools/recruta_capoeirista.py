"""Recruta: Capoeirista — abadá, cordão, descalço, dreads, berimbau nas costas.
Gera recrutas/capoeirista.png (1024x768) e recrutas/capoeirista_variantes.png (640x512).
Uso: python recruta_capoeirista.py  [--preview DIR]
"""
import os
import sys
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import humano as H
from humano import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UNIF = '#e8e2d0'
CORD_A = '#f2c230'   # amarelo
CORD_B = '#2f9a3a'   # verde
WOOD = '#9a6a34'
GOURD = '#d09a48'
GOURD_D = '#a0682a'
WIRE = '#c8ccd4'
STICK = '#5a3a1e'
GOLD = '#e3b23c'
RED = '#c9343a'

LOOK = dict(body='m', skin='#8d5a3b', hair_color='#1a1210', pants=UNIF, eye='#3a2414')


def C(h):
    return hexc(h) if isinstance(h, str) else np.array(h, float)


def sk(look):
    return C(look.get('skin', '#c98d5e'))


# ============================================================ pose helpers

def tframe(P):
    """(neck, d, r): eixo do tronco p/ baixo e p/ direita."""
    nx, ny = P['neck']
    px, py = P['pelvis']
    dx, dy = px - nx, py - ny
    L = math.hypot(dx, dy) or 1
    d = (dx / L, dy / L)
    r = (-d[1] * -1, -d[0])  # (d1, -d0)
    r = (d[1], -d[0])
    return (nx, ny), d, r


def tp(P, u, v):
    (nx, ny), d, r = tframe(P)
    return (nx + r[0] * u + d[0] * v, ny + r[1] * u + d[1] * v)


def solve(P):
    for s in ('b', 'f'):
        sh, ha = P['sh_' + s], P['ha_' + s]
        dd = math.hypot(ha[0] - sh[0], ha[1] - sh[1])
        if dd > H.ARM_L * .98:
            t = H.ARM_L * .98 / dd
            P['ha_' + s] = ha = (sh[0] + (ha[0] - sh[0]) * t, sh[1] + (ha[1] - sh[1]) * t)
        bd = P.get('bend_' + s, 1 if s == 'b' else -1)
        P['el_' + s] = two_bone(sh[0], sh[1], ha[0], ha[1], H.ARM_L, bend_dir=bd)
    for s in ('b', 'f'):
        hp, ft = P['hip_' + s], P['ft_' + s]
        dd = math.hypot(ft[0] - hp[0], ft[1] - hp[1])
        if dd > H.LEG_L:
            t = H.LEG_L / dd
            P['ft_' + s] = ft = (hp[0] + (ft[0] - hp[0]) * t, hp[1] + (ft[1] - hp[1]) * t)
        P['kn_' + s] = two_bone(hp[0], hp[1], ft[0], ft[1], H.LEG_L, bend_dir=-1)


def rebuild(P, sway=0, bob=0, lean=0, hb=(-4, 28), hf=(4, 28), ftb=(55, 112), ftf=(73, 112), hd=(0, 0)):
    """pose do zero: hb/hf = mão relativa ao ombro; ftb/ftf = pés absolutos."""
    R = H._base(P['body'])
    pel = ((R['hip_b'][0] + R['hip_f'][0]) / 2 + sway * .5, R['hip_b'][1] + bob)
    P['pelvis'] = pel
    P['lean'] = lean
    P['hrot'] = lean * .5

    def T(p):
        return rp(p[0] + sway, p[1] + bob, pel[0], pel[1], lean)
    for k in ('head', 'neck', 'sh_b', 'sh_f'):
        P[k] = T(R[k])
    P['head'] = (P['head'][0] + hd[0], P['head'][1] + hd[1])
    for k in ('hip_b', 'hip_f'):
        P[k] = (R[k][0] + sway * .5, R[k][1] + bob)
    P['ha_b'] = (P['sh_b'][0] + hb[0], P['sh_b'][1] + hb[1])
    P['ha_f'] = (P['sh_f'][0] + hf[0], P['sh_f'][1] + hf[1])
    P['ft_b'] = ftb
    P['ft_f'] = ftf
    solve(P)


def adjust(P):
    row, i = P['row'], P['i']
    P['lag'] = 0.0      # atraso de dreads/cordão (+ = vai p/ esquerda)
    P['ftrot_f'] = None
    P['ftrot_b'] = None
    if row == 'idle':
        sw = [-3, 0, 3, 0][i]
        rebuild(P, sway=sw, bob=[3, 2.4, 3, 2.4][i], lean=[-3, 0, 3, 0][i],
                hb=[(-12, 22), (-6, 24), (-6, -14), (-6, 22)][i],
                hf=[(8, -14), (6, 18), (10, 22), (6, 18)][i],
                ftb=[(44, 112), (48, 112), (52, 112), (48, 112)][i],
                ftf=[(80, 112), (80, 112), (82, 112), (80, 112)][i])
        if i == 0:
            P['bend_f'] = 1
            solve(P)
        P['mouth'] = 'smile'
        P['eyes'] = 'closed' if i == 2 else 'open'
        P['lag'] = [2.5, 0, -2.5, 0][i]
    elif row == 'walk':
        ph = 2 * math.pi * i / 8
        s = math.sin(ph)
        g = 1.5 * math.sin(ph)
        for k in ('head', 'neck', 'sh_b', 'sh_f'):
            P[k] = (P[k][0] + g, P[k][1] + 1.5)
        for k in ('hip_b', 'hip_f'):
            P[k] = (P[k][0] + g * .5, P[k][1] + 1.5)
        P['pelvis'] = (P['pelvis'][0] + g * .5, P['pelvis'][1] + 1.5)
        P['ft_b'] = (P['ft_b'][0] - 2, P['ft_b'][1])
        P['ft_f'] = (P['ft_f'][0] + 2, P['ft_f'][1])
        P['ha_b'] = (P['ha_b'][0] - 1 + g, P['ha_b'][1] - 3)
        P['ha_f'] = (P['ha_f'][0] + 2 + g, P['ha_f'][1] - 6 - 2 * max(0, -s))
        solve(P)
        P['mouth'] = 'smile'
        P['lag'] = 2.5 + 1.5 * math.cos(ph * 2)
    elif row == 'attack':
        A = [
            dict(sway=-3, bob=3, lean=-5, hb=(-14, 14), hf=(7, -14), ftb=(45, 112), ftf=(80, 112), e='angry', m='line', lag=1),
            dict(sway=-2, bob=1, lean=-9, hb=(-16, 8), hf=(6, -14), ftb=(54, 112), ftf=(84, 91), e='angry', m='grit', lag=2, fr=None),
            dict(sway=-4, bob=1, lean=-16, hb=(-20, 2), hf=(-6, -6), ftb=(55, 112), ftf=(101, 64), e='angry', m='open', lag=5, fr=-25),
            dict(sway=-4, bob=1, lean=-18, hb=(-21, 0), hf=(-7, -5), ftb=(55, 112), ftf=(102, 61), e='angry', m='open', lag=6, fr=-30),
            dict(sway=-2, bob=1, lean=-9, hb=(-16, 8), hf=(6, -13), ftb=(54, 112), ftf=(86, 92), e='angry', m='grit', lag=3, fr=None),
            dict(sway=-1, bob=2.5, lean=-3, hb=(-10, 20), hf=(8, -13), ftb=(47, 112), ftf=(79, 112), e='open', m='smile', lag=1),
        ][i]
        P['bend_f'] = 1
        rebuild(P, sway=A['sway'], bob=A['bob'], lean=A['lean'], hb=A['hb'], hf=A['hf'], ftb=A['ftb'], ftf=A['ftf'])
        P['eyes'] = A['e']; P['mouth'] = A['m']; P['lag'] = A['lag']
        P['ftrot_f'] = A.get('fr')
        P['grip'] = 0
        P['fx'] = []
        if i == 3:
            fx, fy = P['ft_f']
            P['fx'] = [('impact', fx + 12, fy - 8)]
    elif row == 'hurt':
        P['lag'] = [-2, -4, -3, -1][i] * -1
        if i == 0:
            P['mouth'] = 'grit'
    elif row == 'death':
        P['lag'] = [2, 3, 2, 0, 0, 0][i]
    elif row == 'special':
        A = [
            dict(sway=0, bob=2, lean=-2, hb=(-6, 24), hf=(12, -24), e='open', m='smile', lag=0),
            dict(sway=0, bob=2, lean=0, hb=(14, 12), hf=(6, 26), e='open', m='o', lag=0),
            dict(sway=1, bob=3.5, lean=2, hb=(20, 6), hf=(6, 26), e='closed', m='smile', lag=-1),
            dict(sway=-1, bob=2, lean=-1, hb=(12, 10), hf=(6, 26), e='closed', m='smile', lag=1),
            dict(sway=1, bob=3.5, lean=2, hb=(20, 6), hf=(6, 26), e='happy', m='open', lag=-1),
            dict(sway=-2, bob=2.5, lean=-2, hb=(13, 11), hf=(6, 26), e='happy', m='smile', lag=2),
        ][i]
        P['bend_b'] = 1
        rebuild(P, sway=A['sway'], bob=A['bob'], lean=A['lean'], hb=A['hb'], hf=A['hf'],
                ftb=(48, 112), ftf=(80, 112))
        P['eyes'] = A['e']; P['mouth'] = A['m']; P['lag'] = A['lag']
        P['fx'] = []
        P['grip'] = -90


# ============================================================ shapes próprios

def seg(P, s, a, b, w):
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    p, q = L2(el, ha, a), L2(el, ha, b)
    return limb(p[0], p[1], q[0], q[1], w, w)


def ankle(P, s):
    kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
    dx, dy = ft[0] - kn[0], ft[1] - kn[1]
    L = math.hypot(dx, dy) or 1
    return (ft[0] - dx / L * 3.5, ft[1] - dy / L * 3.5)


def shin2(P, s, w=9, grow=0, upto=1.0):
    kn = P['kn_' + DSIDE(s)]
    a = ankle(P, s)
    e = L2(kn, a, upto)
    return limb(kn[0], kn[1], e[0], e[1], w + grow, w - 1 + grow)


def foot_rot(P, s):
    r = P.get('ftrot_' + s)
    if r is not None:
        return r
    kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
    ang = math.degrees(math.atan2(ft[1] - kn[1], ft[0] - kn[0]))
    return max(-25, min(25, (ang - 90) * .6))


def foot_local(P, s, x, y):
    fx, fy = P['ft_' + DSIDE(s)]
    return rp(fx + x, fy + y, fx, fy, foot_rot(P, s))


def foot2(P, s, grow=0):
    fx, fy = P['ft_' + DSIDE(s)]
    r = foot_rot(P, s)
    sh = ell(fx + 3.5, fy - 2.6, 6.5 + grow, 2.9 + grow * .5)
    sh += ell(fx - 1, fy - 3.2, 3, 3)
    return rot(sh, fx, fy, r)


def trap(p0, p1, w0, w1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    L = math.hypot(dx, dy) or 1e-6
    nx, ny = -dy / L, dx / L
    r0, r1 = w0 / 2, w1 / 2
    q = [(p0[0] + nx * r0, p0[1] + ny * r0), (p1[0] + nx * r1, p1[1] + ny * r1),
         (p1[0] - nx * r1, p1[1] - ny * r1), (p0[0] - nx * r0, p0[1] - ny * r0)]
    return [q] + ell(p0[0], p0[1], r0, r0)


def perp(p, q):
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy) or 1
    return (-dy / L, dx / L)


# ============================================================ camadas

def draw_body(F, P, look):
    c = sk(look)
    far = mix(c, NIGHT, .18)
    F.part(thigh(P, 'b') + shin2(P, 'b'), far)
    F.part(foot2(P, 'b'), far)
    feet_detail(F, P, 'b', far)
    F.part(upper_arm(P, 'b', w=9) + fore_arm(P, 'b'), far)
    F.part(hand_shapes(P, 'b'), far)
    F.part(thigh(P, 'f') + shin2(P, 'f'), c)
    F.part(foot2(P, 'f'), c)
    feet_detail(F, P, 'f', c)
    m = F.part(torso_shapes(P, grow=.5) + pelvis_shapes(P), c)
    muscles(F, P, c, m)
    F.part(neck_shapes(P), mix(c, NIGHT, .12))
    hl = mix(c, MOON, .35)
    for (a, b) in (((-2, 2), (-10, 4)), ((5, 2), (12, 4))):
        p, q = tp(P, *a), tp(P, *b)
        F.line(p[0], p[1], q[0], q[1], hl)
    F.part(head_shapes(P), c, tex=0)
    F.part(ear_shapes(P), c)
    F.part(nose_shapes(P), c, outline=False, light=.35)


def feet_detail(F, P, s, c):
    dk = mix(c, INK, .45)
    sole = mix(c, C('#f0c8b0'), .45)
    for (x, y) in ((7.5, -4.2), (9.0, -3.4)):
        p = foot_local(P, s, x, y)
        F.px(p[0], p[1], dk)
    p = foot_local(P, s, 9.6, -2.2)
    F.px(p[0], p[1], mix(c, MOON, .5))
    for x in range(0, 9):
        p = foot_local(P, s, x, -0.6)
        F.px(p[0], p[1], sole)


def muscles(F, P, c, m):
    dk = mix(c * .82, NIGHT, .38)
    hl = mix(c, MOON, .32)

    def L(pts, col):
        for a, b in zip(pts, pts[1:]):
            p, q = tp(P, *a), tp(P, *b)
            F.line(p[0], p[1], q[0], q[1], col)
    # peitorais
    L([(-11, 10), (-7, 12), (-1, 12)], dk)
    L([(3, 12), (9, 12), (13, 10)], dk)
    L([(1, 6), (1, 12)], dk)
    L([(-9, 7), (-3, 7)], hl)
    L([(4, 7), (10, 7)], hl)
    # abdômen
    L([(2, 15), (2, 25)], dk)
    L([(-3, 17), (0, 17)], dk)
    L([(4, 17), (7, 17)], dk)
    L([(-3, 21), (0, 21)], dk)
    L([(4, 21), (7, 21)], dk)
    L([(-2, 15), (0, 15)], hl)
    L([(4, 15), (6, 15)], hl)
    # oblíquos
    L([(-11, 19), (-8, 25)], dk)
    L([(13, 18), (11, 24)], dk)
    n = tp(P, 2, 26)
    F.px(n[0], n[1], mix(c, INK, .55))
    F.px(n[0], n[1] + 1, mix(c, INK, .4))


def draw_arm(F, P, look):
    c = sk(look)
    F.part(upper_arm(P, 'f', w=9) + fore_arm(P, 'f'), c)
    F.part(hand_shapes(P, 'f'), c)
    # corte do deltoide
    sh, el = P['sh_f'], P['el_f']
    p = L2(sh, el, .45)
    n = perp(sh, el)
    dk = mix(c * .8, NIGHT, .4)
    F.line(p[0] + n[0] * 1, p[1] + n[1] * 1, p[0] + n[0] * 3.5, p[1] + n[1] * 3.5, dk)
    fitinha(F, P, 'f')


def fitinha(F, P, s):
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    q = trap(L2(el, ha, .70), L2(el, ha, .80), 7.6, 7.6)[:1]
    F.part(q, CORD_A, ol='#5a4208', light=.35)
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    p = L2(el, ha, .78)
    F.px(p[0] - 1, p[1] + 4, CORD_A); F.px(p[0] - 2, p[1] + 5, '#c89a20')


def draw_face(F, P, look):
    m = P['mouth']
    if m == 'smile':
        P['mouth'] = 'none'
    H.draw_face(F, P, look)
    P['mouth'] = m
    if m == 'smile':
        x, y = face_pts(P)['mouth']
        x, y = int(round(x)), int(round(y))
        ink = '#2a0e0c'
        F.px(x - 3, y - 1, ink); F.line(x - 2, y, x + 2, y, ink); F.px(x + 3, y - 1, ink); F.px(x + 4, y - 2, ink)
        F.px(x, y + 1, '#f4efe6'); F.px(x + 1, y + 1, '#f4efe6')
        F.px(x - 1, y + 2, ink); F.px(x + 2, y + 2, ink); F.line(x, y + 2, x + 1, y + 2, ink)


def draw_pants(F, P, look):
    c = C(look.get('pants', UNIF))
    far = mix(c, NIGHT, .22)
    dk = mix(c * .78, NIGHT, .35)
    for s, col in (('b', far), ('f', c)):
        kn = P['kn_' + DSIDE(s)]
        a = ankle(P, s)
        hem = L2(kn, a, .78)
        sh = thigh(P, s, grow=4) + trap(kn, hem, 13, 16)
        if s == 'f':
            hb, hf = P['hip_b'], P['hip_f']
            mid = L2(L2(hb, hf, .5), L2(P['kn_b'], P['kn_f'], .5), .5)
            sh += pelvis_shapes(P, grow=3) + poly((hb[0] - 2, hb[1]), (hf[0] + 3, hf[1]), (mid[0] + 2, mid[1] + 2), (mid[0] - 3, mid[1] + 1))
        m = F.part(sh, col, tex=.03, light=.28)
        fold = mix(col * .8, NIGHT, .35)
        hp = P['hip_' + DSIDE(s)]
        n = perp(hp, kn)
        for (t0, t1, o) in ((.2, .75, 2.5), (.45, .95, -3)):
            p, q = L2(hp, kn, t0), L2(hp, kn, t1)
            F.line(p[0] + n[0] * o, p[1] + n[1] * o, q[0] + n[0] * o, q[1] + n[1] * o, fold)
        # vinco do joelho
        F.line(kn[0] - n[0] * 1, kn[1] - n[1] * 1, kn[0] + n[0] * 3, kn[1] + n[1] * 3 - 1, fold)
        # franzidos perto da barra
        n2 = perp(kn, hem)
        for t, a0, a1 in ((.55, -5, 1), (.8, -2, 5)):
            p = L2(kn, hem, t)
            F.line(p[0] + n2[0] * a0, p[1] + n2[1] * a0 - 1, p[0] + n2[0] * a1, p[1] + n2[1] * a1, fold)
        # barra
        F.line(hem[0] - n2[0] * 7, hem[1] - n2[1] * 7 - 1, hem[0] + n2[0] * 7, hem[1] + n2[1] * 7 - 1, fold)
        if s == 'f':
            # cós
            F.line(hb[0] - 7, hb[1] - 2, hf[0] + 7, hf[1] - 2, mix(c, MOON, .3))
            # emblema do grupo na coxa
            p = L2(hp, kn, .35)
            F.px(p[0] + 2, p[1], CORD_B); F.px(p[0] + 3, p[1], CORD_A); F.px(p[0] + 2, p[1] + 1, CORD_A); F.px(p[0] + 3, p[1] + 1, CORD_B)


def braid(F, pts, w=3.2):
    F.part(chain(pts, w, w), CORD_A, ol='#3a3008', light=.3)
    # trança: pixels diagonais verdes
    tot = 0
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        n = int(L)
        for k in range(n):
            t = k / max(1, n)
            x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            if (tot + k) % 3 == 0:
                F.px(x, y - 1, CORD_B); F.px(x + 1, y, CORD_B)
            elif (tot + k) % 3 == 1:
                F.px(x, y + 1, '#1f6a28')
        tot += n


def draw_cord(F, P, look):
    hb, hf = P['hip_b'], P['hip_f']
    y = hb[1] - 2
    pts = [(hb[0] - 7, y - 1), (hb[0] + 2, y + 1), (hf[0] + 1, y + 1.5), (hf[0] + 7, y - .5)]
    braid(F, pts)
    K = (hf[0] + 1, y + 2)
    lag = P.get('lag', 0)
    for (ox, ln, ph) in ((0, 13, 0), (3, 10, 1)):
        a = math.radians(-lag * 9 + ph * 6 + 6)
        if P['row'] == 'attack' and P['i'] in (2, 3):
            a = math.radians(-70 - ph * 12)
        p0 = (K[0] + ox * .5, K[1] + 1)
        p1 = (p0[0] + math.sin(a) * ln * .55, p0[1] + math.cos(a) * ln * .55)
        a2 = a * 1.25
        p2 = (p1[0] + math.sin(a2) * ln * .45, p1[1] + math.cos(a2) * ln * .45)
        F.part(chain([p0, p1, p2], 2.6, 2.2), CORD_A, ol='#3a3008', light=.3)
        F.px(p1[0], p1[1], CORD_B)
        F.part(ell(p2[0] + math.sin(a2) * 2, p2[1] + math.cos(a2) * 2, 2.2, 3.2, rot=-math.degrees(a2)), CORD_B, ol='#0f3a14', light=.3)
        F.px(p2[0], p2[1], CORD_A)
    F.part(ell(K[0], K[1], 2.8, 2.5), CORD_A, ol='#3a3008', light=.35)
    F.px(K[0], K[1], CORD_B); F.px(K[0] + 1, K[1] - 1, CORD_B)


def bow_pts(p0, p1, bulge, n=8):
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    nx, ny = perp(p0, p1)
    c = (mx + nx * bulge, my + ny * bulge)
    out = []
    for k in range(n + 1):
        t = k / n
        out.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]))
    return out


def berimbau(F, p0, p1, bulge, front=True, layer=None):
    """p0 = ponta de baixo (lado da cabaça), p1 = ponta de cima."""
    pts = bow_pts(p0, p1, bulge)
    nx, ny = perp(p0, p1)
    # arame (reta entre as pontas)
    F.line(p0[0], p0[1], p1[0], p1[1], WIRE, layer)
    F.part(chain(pts, 3.4, 2.4), WOOD, ol='#2a1608', light=.35, layer=layer)
    # luz ao longo da verga
    for a, b in zip(pts[1:-2], pts[2:-1]):
        F.px(a[0] - 1 * (1 if bulge > 0 else -1) * nx * 0, a[1], mix(C(WOOD), MOON, .35), layer)
    # cabaça
    g = pts[1]
    gc = L2(g, L2(p0, p1, .12), .7)
    gx, gy = gc[0] - nx * 3.5 * (1 if bulge > 0 else -1), gc[1] - ny * 3.5 * (1 if bulge > 0 else -1)
    F.part(ell(gx, gy, 6, 7), GOURD, marks=[(ell(gx, gy + 1.5, 6.5, 1.3), GOURD_D)], ol='#3a2008', light=.35, layer=layer)
    if front:
        side = -1 if bulge > 0 else 1
        F.part(ell(gx + nx * 3 * side - 1, gy + ny * 3 * side, 2.2, 3.4), '#2a1408', shade=False, ol='#2a1408', layer=layer)
    F.px(gx - 3, gy - 3, '#fff0c8', layer)
    # amarração
    F.line(gx, gy - 6, g[0], g[1], '#3a2410', layer)
    return pts


def draw_hair_back(F, P, look):
    if not (P['row'] == 'special' and P['i'] >= 1):
        p0 = tp(P, -25, 35)
        p1 = tp(P, 22, -46)
        if P['row'] == 'special':
            h = P['ha_f']
            dx, dy = h[0] - p0[0], h[1] - p0[1]
            L = math.hypot(dx, dy)
            p1 = (p0[0] + dx / L * (L + 16), p0[1] + dy / L * (L + 16))
        berimbau(F, p0, p1, -4, front=False)
    dreads_back(F, P, look)


def lock(F, pts, col, w0=4.6, w1=3.6, bead=None):
    m = F.part(chain(pts, w0, w1), col, tex=.1, light=.25)
    dk = mix(C(col) * .7, INK, .35)
    lt = mix(C(col), MOON, .28)
    tot = 0
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        n = int(L)
        nx, ny = perp(a, b)
        for k in range(n):
            t = k / max(1, n)
            x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            if (tot + k) % 3 == 0:
                F.line(x - nx * 1.5, y - ny * 1.5, x + nx * 1.5, y + ny * 1.5 - 1, dk)
            elif (tot + k) % 3 == 1:
                F.px(x - nx, y - ny, lt)
        tot += n
    if bead:
        p = L2(pts[-2], pts[-1], .5)
        F.part(ell(p[0], p[1], 2.3, 2), bead, ol='#2a1408', light=.4)


def dreads_back(F, P, look):
    c = look.get('hair_color', '#1a1210')
    cx, cy = P['head']
    r = P['hrot']
    lag = P.get('lag', 0)
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    for k, (sx, sy, ln, b) in enumerate(((-4, -12, 30, None), (-9, -10, 30, GOLD), (-13, -6, 28, None),
                                          (-15, -1, 24, RED), (-7, -4, 26, None))):
        p0 = q(sx, sy)
        lx = -lag * (1.0 + k * .15)
        p1 = (p0[0] - 7 + lx * .5, p0[1] + ln * .45)
        p2 = (p0[0] - 8 + lx, p0[1] + ln)
        lock(F, [p0, p1, p2], c, bead=b)


def draw_hair(F, P, look):
    c = look.get('hair_color', '#1a1210')
    cx, cy = P['head']
    r = P['hrot']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    cap = ell(cx - 2, cy - 11, 16, 8.5) + ell(cx - 9, cy - 5, 9, 9) + poly((cx - 17, cy - 8), (cx - 15, cy + 3), (cx - 8, cy - 2))
    m = F.part(rot(cap, cx, cy, r), c, tex=.12, clip=None, light=.3)
    dk = mix(C(c) * .65, INK, .4)
    lt = mix(C(c), MOON, .3)
    # sulcos dos dreads irradiando do topo (risca) para trás e para a testa
    crown = (3, -19)
    for k, end in enumerate(((13, -7), (8, -5), (2, -5), (-5, -4), (-11, -2), (-15, -8), (-12, -15))):
        for t in (.25, .4, .55, .7, .85, .97):
            a = (crown[0] + (end[0] - crown[0]) * t, crown[1] + (end[1] - crown[1]) * t)
            p = q(*a)
            if t > .3:
                F.px(p[0], p[1], dk)
        b = q(crown[0] + (end[0] - crown[0]) * .6 + 1.5, crown[1] + (end[1] - crown[1]) * .6)
        F.px(b[0], b[1], lt)
    # pontinhas redondas dos dreads na linha do cabelo
    for x, y in ((12, -7), (7, -6), (1, -6)):
        p = q(x, y)
        F.part(ell(p[0], p[1], 2.2, 2), c, light=.35)
    lag = P.get('lag', 0)
    # dreads caindo na frente da nuca/orelha
    for k, (sx, ln) in enumerate(((-9, 18), (-13, 20), (-16, 16))):
        p0 = q(sx, -6)
        p2 = q(sx - 2, -6 + ln)
        p2 = (p2[0] - lag * .4, p2[1])
        p1 = L2(p0, p2, .5)
        p1 = (p1[0] - 1.5, p1[1])
        lock(F, [p0, p1, p2], c, w0=4.4, w1=3.6, bead=(GOLD if k == 1 else None))


def draw_beard(F, P, look):
    c = look.get('hair_color', '#1a1210')
    fp = face_pts(P)
    x, y = fp['mouth']
    F.part(ell(x + .5, y + 5.5, 2.2, 1.6), c, light=.3)


def draw_acc(F, P, look):
    if P['row'] == 'attack' and P['i'] in (1, 2, 3, 4):
        c = sk(look)
        F.part(foot2(P, 'f'), c)
        feet_detail(F, P, 'f', c)
    cx, cy = P['head']
    p = rp(cx - 13, cy + 8, cx, cy, P['hrot'])
    F.px(p[0], p[1], GOLD); F.px(p[0] + 1, p[1] + 1, GOLD); F.px(p[0], p[1] + 2, '#8a6a18'); F.px(p[0] - 1, p[1] + 1, '#8a6a18')


def special_bow(P):
    hx, hy = P['ha_f']
    return (hx - 3, hy + 14), (hx + 8, hy - 60)


def wire_at(p0, p1, y):
    t = (y - p0[1]) / (p1[1] - p0[1])
    return (p0[0] + (p1[0] - p0[0]) * t, y)


def draw_weapon(F, P, look):
    if not (P['row'] == 'special' and P['i'] >= 1):
        return
    c = sk(look)
    far = mix(c, NIGHT, .18)
    p0, p1 = special_bow(P)
    berimbau(F, p0, p1, 5, front=True)
    # mão da frente por cima da verga
    F.part(hand_shapes(P, 'f'), c)
    # braço de trás cruzando o peito com baqueta + caxixi
    F.part(upper_arm(P, 'b', w=9) + fore_arm(P, 'b'), far)
    hx, hy = P['ha_b']
    wx, wy = wire_at(p0, p1, hy - 4)
    i = P['i']
    strike = i in (2, 4)
    tip = (wx + (1 if strike else -4), wy - (1 if strike else 5))
    base = (hx - 2, hy + 2)
    F.part(chain([base, tip], 2.2, 1.6), '#d8b078', ol='#3a2410', light=.3)
    if strike:
        F.px(wx, wy - 1, '#ffffff', F.fx); F.px(wx + 1, wy - 2, '#fff2a0', F.fx); F.px(wx - 1, wy - 2, '#fff2a0', F.fx)
    # caxixi pendurado na mão
    kx, ky = hx - 1, hy + 6
    F.part(ell(kx, ky, 3.2, 4), '#e8c880', marks=[(ell(kx, ky + 3, 3.4, 1.4), '#7a4a20')], ol='#3a2410', light=.3)
    F.px(kx - 1, ky - 1, '#8a6030'); F.px(kx + 1, ky + 1, '#8a6030'); F.px(kx, ky - 3, '#3a2410')
    F.part(hand_shapes(P, 'b'), far)


def note(F, x, y, col='#fff2a0', double=False):
    sh = ell(x, y, 2.3, 1.8, rot=-20)
    sh += poly((x + 1.6, y), (x + 2.6, y), (x + 2.6, y - 7), (x + 1.6, y - 7))
    if double:
        sh += ell(x + 6, y - 1.5, 2.3, 1.8, rot=-20) + poly((x + 7.6, y - 1.5), (x + 8.6, y - 1.5), (x + 8.6, y - 8.5), (x + 7.6, y - 8.5))
        sh += poly((x + 1.6, y - 7), (x + 8.6, y - 8.5), (x + 8.6, y - 6.8), (x + 1.6, y - 5.3))
    else:
        sh += poly((x + 2.6, y - 7), (x + 5, y - 4.5), (x + 4.5, y - 3.5), (x + 2.6, y - 5))
    F.part(sh, col, shade=False, ol='#3a2008', layer=F.fx)


def swoosh(F, P, a0, a1, r0, r1):
    hx, hy = P['hip_f']
    n = 22
    for k in range(n + 1):
        t = k / n
        a = math.radians(a0 + (a1 - a0) * t)
        th = 1 + 3.5 * t
        for j in range(int(th) + 1):
            rr = r0 + (r1 - r0) * t - j
            col = '#ffffff' if j == 0 else '#d8e8ff'
            F.px(hx + rr * math.cos(a), hy + rr * math.sin(a), col, F.fx, alpha=int(90 + 150 * t))


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'attack' and i in (2, 3):
        ft = P['ft_f']
        hp = P['hip_f']
        a1 = math.degrees(math.atan2(ft[1] - hp[1], ft[0] - hp[0]))
        swoosh(F, P, 70, a1 - 4, 18, 36)
    if row == 'attack' and i == 1:
        dust(F, 50, 110, 2)
    if row == 'special' and i >= 1:
        p0, p1 = special_bow(P)
        g = bow_pts(p0, p1, 5)[1]
        if i in (2, 4):
            arcs(F, g[0] + 9, g[1] - 2, n=3, col='#fff2a0')
        if i == 2:
            note(F, 100, 34)
        if i == 3:
            hx, hy = P['ha_b']
            for (dx, dy) in ((-6, 4), (-6, 8), (4, 9)):
                F.line(hx + dx, hy + dy, hx + dx - (1 if dx < 0 else -1) * 2, hy + dy, '#fff2a0', F.fx)
            note(F, 103, 24)
        if i == 4:
            note(F, 106, 16)
            note(F, 96, 36, col='#ffd87a', double=True)
        if i == 5:
            note(F, 108, 8)
            note(F, 99, 24, col='#ffd87a', double=True)
            note(F, 20, 30)
            sparkle(F, 30, 18, 3)


DRAW = {
    'hair_back': draw_hair_back, 'body': draw_body, 'face': draw_face, 'pants': draw_pants, 'shoes': None,
    'shirt': None, 'jacket': None, 'bag': draw_cord, 'arm': draw_arm, 'shirt_arm': None, 'jacket_arm': None,
    'beard': draw_beard, 'hair': draw_hair, 'head': None, 'acc': draw_acc, 'weapon': draw_weapon,
}


def frame(look, row, i):
    P = pose(row, i, look.get('body', 'm'))
    adjust(P)
    F = Frame()
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return finish(F, P)


def build_sheet(look):
    return person_sheet(look, draw=DRAW, rows=ROWS, adjust=adjust, extra=extra)


SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']


def look_for(skin, hair):
    lk = dict(LOOK, skin=skin, hair_color=hair)
    lk['brow'] = '#%02x%02x%02x' % tuple(int(v) for v in mix(C(hair), INK, .45))
    return lk


def build_variants():
    out = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, skn in enumerate(SKINS):
        for c, hr in enumerate(HAIRS):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(look_for(skn, hr), 'idle', 0)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'recrutas'), exist_ok=True)
    sheet = build_sheet(look_for(LOOK['skin'], LOOK['hair_color']))
    sheet.save(os.path.join(ROOT, 'recrutas', 'capoeirista.png'))
    var = build_variants()
    var.save(os.path.join(ROOT, 'recrutas', 'capoeirista_variantes.png'))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]
        bg = Image.new('RGBA', sheet.size, (70, 66, 84, 255))
        bg.alpha_composite(sheet)
        for r, name in enumerate(ROWS):
            n = NFR[name]
            crop = bg.crop((0, r * S, n * S, (r + 1) * S))
            if n > 6:
                crop.crop((0, 0, 4 * S, S)).resize((4 * S * 3, S * 3), Image.NEAREST).save(os.path.join(d, 'capoeirista_%d_%sa.png' % (r, name)))
                crop.crop((4 * S, 0, 8 * S, S)).resize((4 * S * 3, S * 3), Image.NEAREST).save(os.path.join(d, 'capoeirista_%d_%sb.png' % (r, name)))
            else:
                crop.resize((n * S * 2, S * 2), Image.NEAREST).save(os.path.join(d, 'capoeirista_%d_%s.png' % (r, name)))
        bv = Image.new('RGBA', var.size, (70, 66, 84, 255)); bv.alpha_composite(var)
        bv.save(os.path.join(d, 'capoeirista_var.png'))
        bg.save(os.path.join(d, 'capoeirista_sheet.png'))
    print('ok', sheet.size, var.size)
