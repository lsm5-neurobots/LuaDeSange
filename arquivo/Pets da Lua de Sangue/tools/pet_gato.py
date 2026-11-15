"""Pet: Gato de telhado (Lua de Sangue). Gera sprites/gato.png e sprites/gato.json."""
import math
import os
import json
import random
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, Xf, two_bone, eye, star, sparkle, puff,
                    impact, dust, compose, shadow_layer, sheet, G, S, hexc, mix)

random.seed(7)
np.random.seed(7)

# ---------------- paleta ----------------
FUR = '#7c7884'      # cinza azulado do pelo
FUR_D = '#5f5b69'    # pelo das patas de trás (lado distante)
STRIPE = '#46424f'   # listras tabby
CREAM = '#ddd4c6'    # peito/focinho/meias
EAR_IN = '#d98a92'   # interior da orelha
NOSE = '#c86a78'
IRIS = '#c9d84a'     # olhos verde-limão
BAND = '#b3263a'     # bandana vermelha
BAND_D = '#7a1626'
TAG = '#c8b27a'      # plaquinha de lata
CLAW = '#f4efe6'


def body_shapes(cx, cy):
    return (ell(cx, cy, 21, 10) + ell(cx + 13, cy - 1, 10, 11) + ell(cx - 13, cy - 1, 10, 10.5))


def stripes(cx, cy):
    out = []
    for i, x in enumerate([-20, -13, -6, 1, 8]):
        x0 = cx + x
        out += poly((x0, cy - 13), (x0 + 3, cy - 13), (x0 + 1, cy + 1 - (i % 2) * 2), (x0 - 1, cy + 1 - (i % 2) * 2))
    return out


def leg_front(F, sx, sy, fx, fy, col, L=24, w=6, sock=True, claws=False, far=False):
    kx, ky = two_bone(sx, sy, fx, fy - 2, L, 1)
    sh = limb(sx, sy, kx, ky, w + 1, w) + limb(kx, ky, fx, fy - 2, w, w - 1)
    pw = ell(fx + 1.5, fy - 2, 4, 2.6)
    marks = [(limb(kx, ky, fx, fy - 2, w, w - 1), CREAM if not far else '#b7afa4')] if sock else []
    F.part(sh, col, marks=marks, tex=.15)
    F.part(pw, CREAM if sock and not far else ('#b7afa4' if sock else col), light=.3)
    if claws:
        for k in range(3):
            ax, ay = fx + 4 + k * 0.6, fy - 4 + k * 1.6
            F.part(poly((ax, ay), (ax + 4, ay + .5), (ax, ay + 1.4)), CLAW, shade=False, ol='#2a2024')


def leg_hind(F, hx, hy, fx, fy, col, far=False):
    hkx, hky = fx - 3, fy - 9
    kx, ky = two_bone(hx, hy, hkx, hky, 20, -1)
    sh = limb(hx, hy, kx, ky, 8, 6) + limb(kx, ky, hkx, hky, 6, 5) + limb(hkx, hky, fx, fy - 2, 5, 4.5)
    F.part(sh, col, tex=.15)
    F.part(ell(fx + 1.5, fy - 2, 4, 2.5), col if far else '#8c8894', light=.3)


def tail_pts(bx, by, sway=0.0, up=1.0, curl=1.0, flat=False):
    pts = [(bx, by)]
    x, y = bx, by
    if flat:
        a = 185
        for i in range(6):
            a += 4 * curl + sway * 3
            x += 5.5 * math.cos(math.radians(a)); y += 5.5 * math.sin(math.radians(a)) * .3 + .4
            pts.append((x, y))
        return pts
    a = 200 + sway * 6        # sai para trás
    for i in range(7):
        a += (14 * up + sway * 2) if i < 4 else (12 * curl)
        x += 5.2 * math.cos(math.radians(a)); y += 5.2 * math.sin(math.radians(a))
        pts.append((x, y))
    return pts


def draw_cat(F, P):
    cx, cy = P.get('cx', 58), P.get('cy', 88)
    brot = P.get('brot', 0)
    BX = Xf(cx, cy, brot)
    # pontos de articulação (transformados pela rotação do corpo)
    shN = BX.p(cx + 14, cy + 3); shF = BX.p(cx + 18, cy + 1)
    hpN = BX.p(cx - 15, cy + 2); hpF = BX.p(cx - 11, cy)
    feet = P['feet']   # nf, ff, nh, fh
    # --- patas do lado distante
    leg_hind(F, hpF[0], hpF[1], *feet['fh'], FUR_D, far=True)
    leg_front(F, shF[0], shF[1], *feet['ff'], FUR_D, far=True)
    # --- rabo
    tb = BX.p(cx - 21, cy - 3)
    tp = tail_pts(tb[0], tb[1], P.get('tsway', 0), P.get('tup', 1), P.get('tcurl', 1), P.get('tflat', False))
    tsh = chain(tp, 6, 4)
    tmarks = []
    for i in range(2, len(tp) - 1, 2):
        tmarks.append((ell(tp[i][0], tp[i][1], 2.6, 2.6), STRIPE))
    tmarks.append((ell(tp[-1][0], tp[-1][1], 2.6, 2.6), STRIPE))
    F.part(tsh, FUR, marks=tmarks, tex=.2)
    # --- traseira próxima (sai de baixo do corpo)
    leg_hind(F, hpN[0], hpN[1], *feet['nh'], FUR)
    # --- corpo
    bmarks = [(BX(ell(cx + 2, cy + 8, 17, 4)), '#a7a1a6'), (BX(stripes(cx, cy)), STRIPE),
              (BX(ell(cx - 14, cy + 1, 8.5, 8.5)), '#5f5b69'), (BX(ell(cx - 13.2, cy + 1.6, 7.3, 7.6)), FUR),
              (BX(poly((cx - 18, cy - 6), (cx - 15.5, cy - 7), (cx - 13, cy + 2), (cx - 16, cy + 2))), STRIPE),
              (BX(ell(cx + 18, cy + 3, 6, 8)), CREAM)]
    F.part(BX(body_shapes(cx, cy)), FUR, marks=bmarks, tex=.2)
    if not P.get('pawtop'):
        leg_front(F, shN[0], shN[1], *feet['nf'], FUR, claws=P.get('claws', False))
    # --- cabeça
    hx, hy = BX.p(cx + 26, cy - 20)
    hx += P.get('hdx', 0); hy += P.get('hdy', 0)
    H = Xf(hx, hy + 6, P.get('hdeg', 0), sx=1.14, sy=1.14)
    ea = P.get('ear', 0)   # orelhas para trás (graus)
    earF = rot(poly((hx + 2, hy - 6), (hx + 8, hy - 17), (hx + 10, hy - 4)), hx + 6, hy - 6, ea)
    earN = rot(poly((hx - 10, hy - 4), (hx - 7, hy - 17), (hx + 1, hy - 7)), hx - 5, hy - 6, ea)
    F.part(H(earF), FUR_D, marks=[(H(rot(poly((hx + 4, hy - 7), (hx + 8, hy - 14), (hx + 8.5, hy - 6)), hx + 6, hy - 6, ea)), '#a86a74')])
    # pescoço
    F.part(H(ell(hx - 5, hy + 8, 7, 8)), FUR, tex=.2)
    head = ell(hx, hy, 11.5, 9.5) + ell(hx - 1, hy + 3, 11, 7) + ell(hx + 8, hy + 3.5, 5.5, 4.5)
    hm = [(ell(hx + 8.5, hy + 4.5, 5, 3.8), CREAM), (ell(hx + 2, hy + 8, 6, 2.5), CREAM),
          (poly((hx - 2, hy - 10), (hx, hy - 10), (hx + .5, hy - 5), (hx - 1, hy - 5)), STRIPE),
          (poly((hx + 2, hy - 10), (hx + 4, hy - 9.5), (hx + 3, hy - 5), (hx + 2, hy - 5.5)), STRIPE),
          (poly((hx - 6, hy - 8), (hx - 4, hy - 9), (hx - 3.5, hy - 5), (hx - 5, hy - 5)), STRIPE),
          (poly((hx - 11, hy + 1), (hx - 5, hy + 0), (hx - 5, hy + 1.5), (hx - 11, hy + 3)), STRIPE),
          (poly((hx - 10, hy + 4.5), (hx - 5, hy + 3), (hx - 5, hy + 4.5), (hx - 9.5, hy + 6)), STRIPE)]
    F.part(H(head), FUR, marks=hm, tex=.15)
    # orelha próxima (com rasgo no topo: gato de rua)
    F.part(H(earN), FUR, marks=[(H(rot(poly((hx - 7.5, hy - 6), (hx - 6.5, hy - 14), (hx - 2, hy - 7)), hx - 5, hy - 6, ea)), EAR_IN)])
    nt = H(rot([[(hx - 7.2, hy - 16.5), (hx - 6.2, hy - 15.5)]], hx - 5, hy - 6, ea))[0]
    F.px(nt[0][0], nt[0][1] + 1, '#00000000', alpha=0)
    F.px(nt[0][0], nt[0][1], '#00000000', alpha=0)
    # nariz
    n = H([[(hx + 12, hy + 1.5), (hx + 14.2, hy + 1.5), (hx + 13.2, hy + 3.5)]])
    F.part(n, NOSE, shade=False, ol='#4a1a22')
    # boca
    mo = P.get('mouth', 'closed')
    mpx = [H([[(hx + 12, hy + 6)]])[0][0]]
    if mo == 'open':
        F.part(H(ell(hx + 10.5, hy + 7.5, 3, 2.4)), '#5a1a24', shade=False, ol='#22080c')
        a = H([[(hx + 9, hy + 6), (hx + 12, hy + 6)]])[0]
        F.px(a[0][0], a[0][1], '#ffffff'); F.px(a[1][0], a[1][1], '#ffffff')
    else:
        for (x, y) in [(hx + 13, hy + 5), (hx + 12, hy + 6), (hx + 11, hy + 6), (hx + 10, hy + 5.5)]:
            q = H([[(x, y)]])[0][0]
            F.px(q[0], q[1], '#3a2228')
    # bigodes
    for (x0, y0, x1, y1) in [(hx + 11, hy + 4, hx + 20, hy + 2), (hx + 11, hy + 5, hx + 20, hy + 6.5),
                             (hx + 6, hy + 4, hx - 2, hy + 3)]:
        a, b = H([[(x0, y0), (x1, y1)]])[0]
        if x1 > x0 or P.get('wback', True):
            F.line(a[0], a[1], b[0], b[1], '#eee8de')
    # olhos
    ek = P.get('eyes', 'open')
    e1 = H([[(hx + 2, hy - 1)]])[0][0]
    e2 = H([[(hx + 9, hy - 1.5)]])[0][0]
    if ek in ('open', 'angry', 'wide'):
        eye(F, e1[0], e1[1], kind=ek if ek != 'angry' else 'open', iris=IRIS, r=2, slit=True,
            brow='angry' if ek == 'angry' else None)
        F.flat(ell(e2[0] + .5, e2[1] + .5, 1.4, 2.3), '#120a0a')
        F.px(e2[0], e2[1], IRIS); F.px(e2[0], e2[1] + 1, IRIS); F.px(e2[0], e2[1] - 1, '#ffffff')
    elif ek == 'wink':
        eye(F, e1[0], e1[1], kind='happy', r=2)
        F.flat(ell(e2[0] + .5, e2[1] + .5, 1.4, 2.3), '#120a0a')
        F.px(e2[0], e2[1], IRIS); F.px(e2[0], e2[1] + 1, IRIS); F.px(e2[0], e2[1] - 1, '#ffffff')
    elif ek in ('x', 'spiral'):
        eye(F, e1[0], e1[1], kind=ek, r=3 if ek == 'x' else 2)
        eye(F, e2[0] + 1, e2[1], kind='x', r=1)
    else:   # closed / happy
        eye(F, e1[0], e1[1], kind=ek, r=2)
        F.line(e2[0] - 1, e2[1] + 1, e2[0] + 1, e2[1], '#1a1010')
    # bandana no pescoço
    bk = H(limb(hx - 9, hy + 5, hx + 2, hy + 10, 4.5))
    knot = H(ell(hx - 10, hy + 5, 2.5, 2.5))
    fl = P.get('flap', 0)
    tails = H(poly((hx - 11, hy + 4), (hx - 16, hy + 2 + fl), (hx - 15, hy + 5.5 + fl), (hx - 11, hy + 7)))
    tri = H(poly((hx - 5, hy + 8), (hx + 5, hy + 9.5), (hx + 1 + fl * .3, hy + 17)))
    F.part(tails, BAND_D)
    F.part(bk + tri, BAND, marks=[(H(ell(hx - 2, hy + 9, 1, 1) + ell(hx + 2, hy + 11, 1, 1) + ell(hx + 0, hy + 13.5, .8, .8)), '#f0d8c0')])
    F.part(knot, BAND_D)
    F.part(H(ell(hx + 1 + fl * .3, hy + 18.5, 1.8, 1.8)), TAG, light=.4, ol='#3a2a10')
    if P.get('pawtop'):
        leg_front(F, shN[0], shN[1], *feet['nf'], FUR, claws=P.get('claws', False))


STAND = lambda cx=58: {'nf': (cx + 16, G), 'ff': (cx + 21, G - 1), 'nh': (cx - 13, G), 'fh': (cx - 9, G - 1)}


def base(**kw):
    P = {'cx': 58, 'cy': 88, 'feet': STAND()}
    P.update(kw)
    return P


def shadow(cx=58, rx=32):
    return shadow_layer(cx, rx)


# ---------------- animações ----------------

def idle():
    out = []
    for i in range(4):
        F = Frame()
        b = [0, .6, 1, .4][i]
        P = base(cy=88 + b * .9, hdy=b * .6, tsway=[0, 1, 2, 1][i], tup=1.0, ear=[0, 0, -6, 0][i],
                 eyes='closed' if i == 2 else 'open', flap=[0, .5, 1, .5][i])
        draw_cat(F, P)
        out.append(compose(F, shadow=shadow()))
    return out


def walk():
    out = []
    phases = {'nh': 0.0, 'nf': .25, 'fh': .5, 'ff': .75}
    for i in range(8):
        F = Frame()
        t = i / 8
        feet = {}
        st = STAND()
        for k, ph in phases.items():
            a = 2 * math.pi * (t + ph)
            dx = -7 * math.cos(a)   # pata no ar avança
            lift = max(0, math.sin(a)) * 5
            x, y = st[k]
            feet[k] = (x + dx, y - lift)
        bob = abs(math.sin(2 * math.pi * t * 2)) * 1.4
        P = base(cy=87 + bob, feet=feet, hdy=bob * .5, tsway=2 * math.sin(2 * math.pi * t), tup=1.05,
                 flap=1.5 * math.sin(2 * math.pi * t * 2) + 1, brot=math.sin(2 * math.pi * t) * 1.2)
        draw_cat(F, P)
        out.append(compose(F, shadow=shadow()))
    return out


def scratch(F, x, y, r, a0, a1, n=3, col='#fff4e8', col2='#e8506a'):
    for k in range(n):
        rr = r + k * 3
        for a in range(a0, a1, 4):
            px = x + rr * math.cos(math.radians(a)); py = y + rr * math.sin(math.radians(a)) + k * 1.5
            F.px(px, py, col, F.fx)
            F.px(px + 1, py, col2, F.fx)


def attack():
    out = []
    st = STAND()
    # 0 prepara
    F = Frame()
    draw_cat(F, base(cy=89, ear=-10, eyes='angry', tsway=-1, tup=1.2))
    out.append(compose(F, shadow=shadow()))
    # 1 antecipação: agacha para trás, pata erguida, sibila
    F = Frame()
    feet = dict(st); feet['nf'] = (80, 80); feet['nh'] = (st['nh'][0] - 2, G); feet['fh'] = (st['fh'][0] - 2, G - 1)
    draw_cat(F, base(cx=53, cy=91, brot=-10, feet=feet, ear=-28, eyes='angry', mouth='open', hdeg=-6, tup=1.35,
                     tsway=2, claws=True, flap=-1, pawtop=True))
    from pixkit import text
    out.append(compose(F, shadow=shadow(54)))
    # 2 bote: corpo avança, pata em arco para cima/frente
    F = Frame()
    feet = {'nf': (100, 80), 'ff': (82, G - 1), 'nh': (52, G), 'fh': (56, G - 1)}
    draw_cat(F, base(cx=64, cy=87, brot=6, feet=feet, ear=-25, eyes='angry', mouth='open', hdeg=6, hdx=1,
                     tsway=-2, tup=.9, claws=True, flap=2, pawtop=True))
    scratch(F, 100, 96, 14, -95, -35, n=2)
    out.append(compose(F, shadow=shadow(64)))
    # 3 impacto: pata para baixo à frente + arranhão + impacto
    F = Frame()
    feet = {'nf': (104, 104), 'ff': (84, G - 1), 'nh': (54, G), 'fh': (58, G - 1)}
    draw_cat(F, base(cx=66, cy=88, brot=8, feet=feet, ear=-25, eyes='angry', mouth='open', hdeg=8,
                     tsway=-3, tup=.8, claws=True, flap=3, pawtop=True))
    scratch(F, 100, 98, 11, -65, 55, n=3)
    impact(F, 109, 104, 7)
    out.append(compose(F, shadow=shadow(66)))
    # 4 recupera
    F = Frame()
    feet = dict(STAND(61)); feet['nf'] = (82, G - 3)
    draw_cat(F, base(cx=61, cy=88, brot=2, feet=feet, ear=-12, eyes='open', tsway=-1, tup=1.1, flap=1.5))
    for (x, y) in [(104, 90), (100, 100)]:
        sparkle(F, x, y, 2, '#f4c0c0')
    out.append(compose(F, shadow=shadow(61)))
    # 5 volta à guarda
    F = Frame()
    draw_cat(F, base(cy=88.5, ear=-4, tsway=1, tup=1.1, flap=.5))
    out.append(compose(F, shadow=shadow()))
    return out


def hurt():
    out = []
    st = STAND()
    # 0 flash
    F = Frame()
    draw_cat(F, base(eyes='closed', ear=-25))
    out.append(compose(F, tint='flash', shadow=shadow()))
    # 1 recuo forte
    F = Frame()
    feet = {k: (v[0] - 5 + (3 if k in ('nf', 'ff') else 0), v[1]) for k, v in st.items()}
    draw_cat(F, base(cx=52, cy=89, brot=-12, feet=feet, eyes='closed', ear=-35, hdeg=-14, hdx=-2, mouth='open',
                     tup=1.5, tsway=3, flap=-2))
    star(F, 92, 58, r=3)
    out.append(compose(F, shadow=shadow(52)))
    # 2 ainda recuado
    F = Frame()
    feet = {k: (v[0] - 4 + (2 if k in ('nf', 'ff') else 0), v[1]) for k, v in st.items()}
    draw_cat(F, base(cx=54, cy=89, brot=-7, feet=feet, eyes='closed', ear=-25, hdeg=-8, tup=1.3, tsway=2))
    out.append(compose(F, shadow=shadow(54)))
    # 3 recupera
    F = Frame()
    draw_cat(F, base(cx=57, cy=88.5, brot=-2, eyes='open', ear=-10, tup=1.1, tsway=1))
    out.append(compose(F, shadow=shadow(57)))
    return out


def death():
    out = []
    st = STAND()
    # 0 flash
    F = Frame()
    draw_cat(F, base(eyes='closed', ear=-25))
    out.append(compose(F, tint='flash', shadow=shadow()))
    # 1 cambaleia para trás
    F = Frame()
    feet = {'nf': (70, G), 'ff': (80, G - 1), 'nh': (44, G), 'fh': (49, G - 1)}
    draw_cat(F, base(cx=55, cy=90, brot=-10, feet=feet, eyes='spiral', ear=-30, hdeg=-12, mouth='open', tup=.6, tsway=3))
    star(F, 86, 54, r=3); star(F, 96, 60, r=2)
    out.append(compose(F, shadow=shadow(55)))
    # 2 cambaleia para frente, pernas bambas
    F = Frame()
    feet = {'nf': (80, G), 'ff': (72, G - 1), 'nh': (50, G), 'fh': (40, G - 1)}
    draw_cat(F, base(cx=58, cy=93, brot=8, feet=feet, eyes='spiral', ear=-30, hdeg=18, hdy=2, tup=.4, tsway=-2))
    star(F, 74, 58, r=2); star(F, 100, 62, r=3)
    out.append(compose(F, shadow=shadow(58)))
    # 3 desaba: patas abrem, barriga no chão
    F = Frame()
    feet = {'nf': (88, G), 'ff': (92, G - 1), 'nh': (30, G), 'fh': (36, G - 1)}
    draw_cat(F, base(cx=58, cy=101, brot=4, feet=feet, eyes='spiral', ear=-35, hdeg=24, hdy=8, hdx=2, tflat=True, tsway=0))
    dust(F, 40, 110, 3); dust(F, 88, 110, 3)
    out.append(compose(F, shadow=shadow(58, 36)))
    # 4 quica e assenta
    F = Frame()
    feet = {'nf': (92, G), 'ff': (96, G - 1), 'nh': (28, G), 'fh': (34, G - 1)}
    draw_cat(F, base(cx=58, cy=102, brot=2, feet=feet, eyes='x', ear=-40, hdeg=30, hdy=11, hdx=3, tflat=True, tsway=1))
    star(F, 84, 72, r=2)
    out.append(compose(F, shadow=shadow(58, 38)))
    # 5 desmaiado, estrelinhas
    F = Frame()
    feet = {'nf': (93, G), 'ff': (97, G - 1), 'nh': (27, G), 'fh': (33, G - 1)}
    draw_cat(F, base(cx=58, cy=103, brot=2, feet=feet, eyes='x', ear=-40, hdeg=32, hdy=12, hdx=4, tflat=True, tsway=1))
    for (x, y, r) in [(80, 70, 3), (92, 64, 3), (104, 70, 2)]:
        star(F, x, y, r=r)
    out.append(compose(F, shadow=shadow(58, 40)))
    return out


def special():
    out = []
    st = STAND()
    # 0 piscadela travessa, rabo em gancho
    F = Frame()
    draw_cat(F, base(cy=89, eyes='wink', tup=1.4, tcurl=1.8, tsway=-1, flap=1))
    out.append(compose(F, shadow=shadow()))
    # 1 fumacinha, começa a sumir
    F = Frame()
    draw_cat(F, base(cy=90, eyes='closed', tup=1.4, tcurl=1.8))
    for (x, y, r) in [(44, 96, 6), (66, 100, 7), (84, 82, 6)]:
        puff(F, x, y, r)
    out.append(compose(F, alpha=.55, shadow=shadow_layer(58, 30, alpha=60)))
    # 2 sumiu: só fumaça
    F = Frame()
    for (x, y, r) in [(40, 92, 7), (60, 98, 9), (80, 90, 8), (68, 78, 5), (50, 80, 4)]:
        puff(F, x, y, r, col='#bdb6c8')
    out.append(compose(F))
    # 3 brilho onde vai reaparecer
    F = Frame()
    for (x, y, r) in [(40, 84, 4), (76, 74, 4)]:
        puff(F, x, y, r, col='#a8a0b8')
    for (x, y, r) in [(58, 92, 4), (86, 70, 3), (38, 100, 2), (76, 104, 2)]:
        sparkle(F, x, y, r)
    draw_cat(F, base(cy=88, eyes='closed', tup=1.2))
    out.append(compose(F, alpha=.35, shadow=shadow_layer(58, 30, alpha=40)))
    # 4 reaparece com brilho
    F = Frame()
    draw_cat(F, base(cy=87, eyes='open', tup=1.3, tcurl=1.4, flap=2))
    for (x, y, r) in [(30, 70, 3), (98, 58, 3), (100, 96, 2), (24, 100, 2), (64, 66, 2)]:
        sparkle(F, x, y, r)
    out.append(compose(F, alpha=.85, shadow=shadow()))
    # 5 pose: cabeça erguida, rabo bem alto
    F = Frame()
    draw_cat(F, base(cy=88, eyes='happy', tup=1.5, tcurl=2.0, hdy=-1, flap=1))
    sparkle(F, 100, 54, 2)
    out.append(compose(F, shadow=shadow()))
    return out


def build():
    rows = {'idle': idle(), 'walk': walk(), 'attack': attack(), 'hurt': hurt(), 'death': death(), 'special': special()}
    return sheet(rows)


DOC = {
    "id": "gato",
    "nome": "Gato",
    "sub": "de telhado",
    "conceito": ("Um gato tabby cinza de rua, magro e esperto, que sobreviveu ao apocalipse pulando de telhado em telhado. "
                 "Anda sempre à frente do herói com o rabo em gancho, some numa fumacinha e reaparece mais adiante como quem "
                 "conhece todos os atalhos. Pelo cinza-azulado com listras escuras, meias creme nas patas da frente, orelha "
                 "rasgada e uma bandana vermelha com plaquinha de lata no pescoço."),
    "partes": [
        {"parte": "Cabeça", "descricao": "Crânio redondo (~23x19 px) levemente achatado, com bochechas largas embaixo e um pequeno volume de focinho à frente. Na testa, o clássico 'M' tabby em três tracinhos escuros (#46424f) e duas listras horizontais na bochecha de trás. Inclina para trás no rosnado e para frente no golpe."},
        {"parte": "Olhos", "descricao": "Olho próximo grande (5x6 px) verde-limão (#c9d84a) com pupila em fenda vertical e brilho branco no canto superior; olho distante menor, perto do focinho. Viram traço fechado ao respirar e no dano, '^' feliz/piscadela no especial, sobrancelha franzida no ataque e X/espiral no desmaio."},
        {"parte": "Orelhas", "descricao": "Duas orelhas triangulares altas (~11 px) no topo da cabeça; a próxima tem interior rosado (#d98a92) e um pequeno rasgo na ponta (marca de briga de telhado), a distante é mais escura. Giram para trás (até -40°) quando o gato fica bravo, assustado ou desmaiado; dão uma tremidinha no idle."},
        {"parte": "Focinho e boca", "descricao": "Focinho creme (#ddd4c6) arredondado, nariz triangular rosa (#c86a78) de 3 px na ponta e boca em 'w' de pixels escuros. No ataque/dano a boca abre num sibilo vermelho-escuro com dois caninos brancos. Bigodes brancos de 1 px saem para frente e para trás."},
        {"parte": "Corpo / tronco", "descricao": "Tronco alongado (~55x22 px) feito de três elipses: peito fundo, barriga e anca. Peito creme, barriga mais clara (#a7a1a6) e cinco listras verticais escuras descendo do dorso. O corpo inclina para trás na antecipação e para frente no bote; balança 1–2 px na caminhada."},
        {"parte": "Patas", "descricao": "Patas finas de gato com IK: dianteiras quase retas com cotovelo para trás e meias creme até o pé; traseiras com coxa grossa, joelho para frente e jarrete para trás. Lado distante em cinza mais escuro (#5f5b69). Na patada a pata da frente sobe com três garras brancas à mostra."},
        {"parte": "Rabo", "descricao": "Rabo longo (~35 px) de 6 a 4 px de largura, sobe da anca e termina em gancho, com anéis escuros alternados e ponta escura. Balança no idle e na caminhada, fica eriçado e alto na antecipação, cai reto no chão no desmaio e se enrola bem alto na pose do especial."},
        {"parte": "Pelagem e marcas", "descricao": "Tabby cinza-azulado (#7c7884) com pontilhado de pelo, luz de lua no alto à esquerda e sombra roxa embaixo à direita; listras do dorso, da anca, da cabeça e do rabo em #46424f; peito, focinho e meias em creme."},
        {"parte": "Acessório", "descricao": "Bandana vermelho-sangue (#b3263a) amarrada no pescoço, com triângulo caído sobre o peito estampado de bolinhas claras, nó escuro (#7a1626) atrás com duas pontas que esvoaçam ao andar e uma plaquinha redonda de lata (#c8b27a) pendurada na ponta."},
        {"parte": "Silhueta / pose", "descricao": "Perfil 3/4 virado para a direita, ~75 px de largura do rabo ao bigode e ~60 px de altura até a ponta das orelhas. Postura alerta de gato de rua: cabeça alta à frente, costas retas, rabo em ponto de interrogação — lê-se como gato mesmo em 1x."}
    ],
    "paleta": [
        {"nome": "Pelo cinza", "hex": FUR}, {"nome": "Pelo sombra", "hex": FUR_D}, {"nome": "Listras tabby", "hex": STRIPE},
        {"nome": "Creme", "hex": CREAM}, {"nome": "Orelha rosada", "hex": EAR_IN}, {"nome": "Nariz", "hex": NOSE},
        {"nome": "Olho verde-limão", "hex": IRIS}, {"nome": "Bandana", "hex": BAND}, {"nome": "Bandana sombra", "hex": BAND_D},
        {"nome": "Plaquinha de lata", "hex": TAG}
    ],
    "animacoes": {
        "idle": "4 quadros: respiração lenta (corpo desce ~1 px e volta), rabo balança de um lado para o outro, no quadro 2 pisca os olhos e a orelha dá uma tremidinha; pontas da bandana mexem.",
        "walk": "8 quadros: andar de gato em sequência lateral (traseira próxima, dianteira próxima, traseira distante, dianteira distante), cada pata sobe ~5 px e avança ~7 px; corpo quica 1,4 px duas vezes por ciclo, leve gangorra do tronco, rabo ondula e as pontas da bandana esvoaçam.",
        "attack": "6 quadros: 0 guarda com orelhas baixas e olhar bravo; 1 antecipação longa — agacha para trás, orelhas coladas, boca aberta sibilando, rabo eriçado e pata dianteira erguida com garras; 2 bote para frente com a pata subindo em arco (rastro de arranhão); 3 impacto — pata desce à frente, três riscos de arranhão em arco e estouro de impacto; 4 recua com faíscas; 5 volta à guarda.",
        "hurt": "4 quadros: 0 pisca branco (flash); 1 tranco para trás com corpo inclinado, olhos fechados, orelhas para trás, boca aberta e estrelinha; 2 ainda encolhido; 3 se recompõe de olhos abertos.",
        "death": "6 quadros (desmaio): 0 flash; 1 cambaleia para trás com olhos em espiral e estrelinhas; 2 tropeça para frente com patas bambas; 3 desaba de barriga com as patas abertas e poeira; 4 assenta com olhos em X; 5 deitado desmaiado, rabo esticado no chão, boca aberta e três estrelinhas girando sobre a cabeça (segura 600 ms).",
        "special": "6 quadros (Sumiço de Telhado): 0 piscadela marota com rabo em gancho; 1 nuvens de fumaça começam a cobrir o gato, que fica meio transparente; 2 só fumaça — o gato sumiu; 3 a fumaça se dissipa e brilhinhos surgem com a silhueta fantasma do gato; 4 reaparece quase sólido entre faíscas; 5 pose orgulhosa de olhos felizes e rabo bem alto."
    },
    "especial": "Sumiço de Telhado",
    "eventos": {
        "idle": {"0": "respira", "2": "pisca"},
        "walk": {"0": "passo", "4": "passo"},
        "attack": {"1": "sibilo", "2": "bote", "3": "impacto"},
        "hurt": {"0": "dano", "1": "miado_dor"},
        "death": {"0": "dano", "1": "miado_tonto", "3": "queda", "5": "desmaio"},
        "special": {"0": "ronrono", "1": "puff", "3": "brilho", "4": "reaparece"}
    }
}


if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    outdir = os.path.join(here, '..', 'sprites')
    os.makedirs(outdir, exist_ok=True)
    im = build()
    im.save(os.path.join(outdir, 'gato.png'))
    with open(os.path.join(outdir, 'gato.json'), 'w', encoding='utf-8') as f:
        json.dump(DOC, f, ensure_ascii=False, indent=2)
    if len(sys.argv) > 1:
        im.resize((im.width * 2, im.height * 2), 0).save(sys.argv[1])
    print(im.size)
