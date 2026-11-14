"""Recruta: Vigia — ex-vigilante noturno de condomínio. Gera recrutas/vigia.png e recrutas/vigia_variantes.png.
Uso: python recruta_vigia.py  (dentro de tools)
"""
import os
import sys
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humano import *   # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'recrutas')

LOOK = dict(body='m', skin='#c68a5e', hair_color='#1a1210', shirt='#2f4a7a', pants='#232838', shoes='#1c1a1e')

SH_LIGHT = '#4a6aa0'
SH_DARK = '#1f3256'
CAP = '#22345a'
CAP_BAND = '#15161c'
VISOR = '#141418'
GOLD = '#d8b040'
GOLD_D = '#8a6a18'
SILVER = '#c8ccd4'
SILVER_D = '#7a7e88'
BELT = '#18181c'
BATON = '#1a1a1e'
BADGE = '#f0ece0'
BADGE_B = '#2f6db5'
CORD = '#d8b040'


def C(h):
    return hexc(h)


def dark(h, t=.4):
    return mix(C(h), INK, t)


def light(h, t=.25):
    return mix(C(h), MOON, t)


# ------------------------------------------------------------------ util de pose

def set_hand(P, s, off):
    """reposiciona a mão relativa à posição de descanso do ombro e recalcula o cotovelo."""
    rb = {'b': (-4, 28), 'f': (4, 28)}[s]
    sh = P['sh_' + s]
    ha = (sh[0] + rb[0] + off[0], sh[1] + rb[1] + off[1])
    d = math.hypot(ha[0] - sh[0], ha[1] - sh[1])
    if d > ARM_L * .98:
        t = ARM_L * .98 / d
        ha = (sh[0] + (ha[0] - sh[0]) * t, sh[1] + (ha[1] - sh[1]) * t)
    P['ha_' + s] = ha
    P['el_' + s] = two_bone(sh[0], sh[1], ha[0], ha[1], ARM_L, bend_dir=(1 if s == 'b' else -1))


SPECIAL = [
    dict(hf=(2, -8), grip=-40, eyes='open', mouth='line', beam=0),
    dict(hf=(12, -20), grip=-4, eyes='angry', mouth='line', beam=1),
    dict(hf=(13, -18), grip=14, eyes='wide', mouth='o', beam=1),
    dict(hf=(12, -20), grip=2, eyes='angry', mouth='whistle', beam=1, bub=True, waves=2),
    dict(hf=(12, -21), grip=-2, eyes='angry', mouth='whistle', beam=1, bub=True, waves=3),
    dict(hf=(5, -10), grip=-30, eyes='angry', mouth='line', beam=0),
]


def adjust(P):
    row, i = P['row'], P['i']
    P['serious'] = True
    if row == 'special':
        s = SPECIAL[i]
        set_hand(P, 'f', s['hf'])
        set_hand(P, 'b', (2, -3))
        P['grip'] = s['grip']
        P['eyes'] = s['eyes']
        P['mouth'] = s['mouth']
        P['fx'] = []
    if row == 'attack':
        P['fx'] = [('impact', 108, 86)] if i == 3 else []


# ------------------------------------------------------------------ rosto

def head_q(P):
    cx, cy = P['head']
    r = P['hrot']
    return lambda x, y: rp(cx + x, cy + y, cx, cy, r)


def draw_face(F, P, look):
    fp = face_pts(P)
    kind = P['eyes']
    hc = look.get('hair_color', '#1a1210')
    brow = mix(C(hc), INK, .35)
    skin = skin_col(look)
    for k, big in (('eye_b', True), ('eye_f', False)):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if kind in ('closed', 'happy', 'x'):
            if kind == 'x':
                for d in (-1, 0, 1):
                    F.px(x + d, y + d, INKC); F.px(x + d, y - d, INKC)
            elif kind == 'happy':
                F.px(x - 1, y, INKC); F.px(x, y - 1, INKC); F.px(x + 1, y, INKC)
            else:
                F.line(x - 2, y, x + 1, y, INKC)
                F.px(x - 2, y + 1, mix(C(skin), INK, .45))
            continue
        w = 3 if big else 2
        top = y - 2 if kind in ('wide',) else y - 1   # vigia aperta um pouco o olho (desconfiado)
        if kind == 'angry':
            top = y - 1
        for yy in range(top, y + 3):
            for xx in range(x - w, x + 3):
                F.px(xx, yy, '#f4efe6')
        iris = look.get('eye', '#3a2414')
        for yy in range(top, y + 3):
            for xx in range(x, x + 3):
                F.px(xx, yy, iris)
        for yy in range(max(top, y - 1), y + 2):
            F.px(x + 1, yy, '#0c0606'); F.px(x + 2, yy, '#0c0606')
        F.px(x, top, '#ffffff')
        F.line(x - w, top - 1, x + 3, top - 1, INKC)
        F.line(x - w, y + 3, x + 2, y + 3, mix(C(skin), INK, .45))
        F.px(x - w + 1, y + 4, mix(C(skin), INK, .25))       # olheira de plantão noturno
    # sobrancelhas grossas (2 px)
    for k in ('brow_b', 'brow_f'):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if kind == 'angry':
            F.line(x - 3, y - 1, x + 2, y + 1, brow); F.line(x - 3, y, x + 2, y + 2, brow)
        elif kind == 'wide':
            F.line(x - 3, y - 3, x + 2, y - 3, brow); F.line(x - 3, y - 2, x + 2, y - 2, brow)
        elif kind == 'x' or kind == 'closed':
            F.line(x - 3, y, x + 2, y, brow); F.line(x - 3, y + 1, x + 2, y + 1, brow)
        else:
            F.line(x - 3, y, x + 2, y + 1, brow); F.line(x - 3, y + 1, x + 2, y + 1, brow)
    q = head_q(P)
    # vinco nariz-boca e barba por fazer
    sk_d = mix(C(skin), INK, .35)
    x, y = q(12, 9)
    F.px(x, y, sk_d)
    stub = mix(C(skin), C(hc), .35)
    for (dx, dy) in ((3, 15), (6, 16), (9, 16), (12, 15), (5, 14), (11, 13), (1, 13)):
        x, y = q(dx, dy)
        F.px(x, y, stub)
    # boca
    x, y = fp['mouth']
    x, y = int(round(x)), int(round(y + 2))
    m = P['mouth']
    if m == 'line':
        F.line(x - 2, y, x + 2, y, '#4a2420')
        F.px(x - 3, y + 1, '#4a2420')
    elif m == 'smile':
        F.px(x - 2, y - 1, '#5a2a24'); F.line(x - 1, y, x + 2, y, '#5a2a24'); F.px(x + 3, y - 1, '#5a2a24')
    elif m == 'grit':
        F.flat(poly((x - 3, y - 1), (x + 3, y - 1), (x + 3, y + 2), (x - 3, y + 2)), '#3a1414')
        F.line(x - 2, y, x + 2, y, '#f4efe6')
    elif m in ('open', 'o'):
        F.flat(ell(x, y + 1, 2.6 if m == 'open' else 1.8, 2.4 if m == 'open' else 2), '#3a1414')
        if m == 'open':
            F.px(x, y + 2, '#c9343a')
    elif m == 'whistle':
        F.flat(ell(x, y, 1.6, 1.6), '#3a1414')
    # bochecha
    x, y = fp['cheek']
    ch = mix(C(skin), C('#e07a6a'), .65 if m == 'whistle' else .45)
    F.px(x, y, ch); F.px(x + 1, y, ch)
    if m == 'whistle':
        F.px(x, y + 1, ch); F.px(x + 1, y + 1, ch)


def draw_beard(F, P, look):
    """bigode de vigilante."""
    hc = look.get('hair_color', '#1a1210')
    q = head_q(P)
    sh = [[q(3, 10), q(7, 8.6), q(11, 8.4), q(15, 9.2), q(16.5, 11.5), q(14, 11.5), q(11, 10.8), q(7, 11.4), q(3.5, 12)]]
    F.part(sh, hc, tex=.15, light=.3)
    x, y = q(9, 9.5)
    F.px(x, y, light(hc, .35))


def draw_hair(F, P, look):
    """corte máquina 2: nuca e costeleta abaixo do quepe."""
    c = look.get('hair_color', '#1a1210')
    q = head_q(P)
    sh = [[q(-16, -11), q(-4, -11), q(-4, -6), q(-6, -1), q(-8, -4), q(-11, -5), q(-14, -3), q(-17, -1), q(-17, -7)]]
    sh += [[q(-17.5, -4), q(-15.5, -4), q(-16, 3), q(-17.5, 1)]]
    if P['row'] == 'death' and P['i'] >= 3:   # sem quepe: aparece o corte máquina 2 no topo
        sh += ell(*q(-1, -10), 16, 8.5) + [[q(-16, -8), q(14, -8), q(13, -12), q(-15, -13)]]
    F.part(sh, c, tex=.3, light=.25)


def cap_shapes(q):
    crown = [[q(-17, -10), q(-18, -17), q(-12, -23), q(-2, -25.5), q(8, -25), q(15, -21), q(15, -10)]]
    band = [[q(-16.5, -14), q(15, -14), q(15, -8.5), q(-16, -8.5)]]
    visor = [[q(3, -9.5), q(14, -10.5), q(21, -8.5), q(19, -6), q(10, -5.5), q(3, -7)]]
    return crown, band, visor


def draw_cap(F, q, at=None):
    crown, band, visor = cap_shapes(q)
    F.part(crown, CAP, tex=.08, light=.3, layer=at)
    # vinco da copa e costura
    for t in range(-14, 13, 2):
        x, y = q(t, -15)
        F.px(x, y, light(CAP, .18), layer=at)
    F.part(band, CAP_BAND, light=.15, layer=at)
    for t in range(-15, 14, 2):
        x, y = q(t, -11)
        F.px(x, y, '#3a3c46', layer=at)
    F.part(visor, VISOR, light=.35, layer=at)
    x0, y0 = q(8, -8.5); x1, y1 = q(17, -8.5)
    F.line(x0, y0, x1, y1, '#5a5e6a', layer=at)
    # distintivo escudo dourado
    bx, by = q(7, -14.5)
    F.part(poly((bx - 2.5, by - 3), (bx + 2.5, by - 3), (bx + 2.5, by + 1), (bx, by + 3.5), (bx - 2.5, by + 1)), GOLD, light=.4, ol='#3a2a08', layer=at)
    F.px(bx, by - 1, SILVER, layer=at); F.px(bx, by, '#ffffff', layer=at)


def draw_head(F, P, look):
    if P['row'] == 'death' and P['i'] >= 3:
        return   # o quepe caiu (desenhado no extra)
    draw_cap(F, head_q(P))


# ------------------------------------------------------------------ roupa

def torso_axis(P, t, off=0):
    nx, ny = P['neck']
    pv = P['pelvis']
    x, y = L2((nx, ny), (pv[0], pv[1]), t)
    a = math.radians(P['lean'])
    return (x + off * math.cos(a), y + off * math.sin(a))


def tq(P, t, off):
    """ponto no tronco: t ao longo do eixo pescoço->pélvis, off horizontal (girado com lean)."""
    return torso_axis(P, t, off)


def rect_t(P, t, off, w, h):
    x, y = tq(P, t, off)
    a = P['lean']
    return rot(poly((x, y), (x + w, y), (x + w, y + h), (x, y + h)), x, y, a)


def draw_shirt(F, P, look):
    c = look.get('shirt', '#2f4a7a')
    far = mix(C(c), NIGHT, .22)
    F.part(upper_arm(P, 'b', grow=1) + fore_arm(P, 'b', grow=1, upto=.25), far, tex=.05)
    m = F.part(torso_shapes(P, grow=1), c, tex=.05)
    nx, ny = P['neck']
    sd = mix(C(SH_DARK), NIGHT, .2)
    # carcela e botões
    p0 = tq(P, .05, 3); p1 = tq(P, .93, 4)
    F.line(p0[0], p0[1], p1[0], p1[1], sd)
    F.line(p0[0] + 1, p0[1] + 1, p1[0] + 1, p1[1], mix(C(c), MOON, .12))
    for t in (.25, .45, .65, .85):
        x, y = tq(P, t, 4.5)
        F.px(x, y, '#d8dce4')
    # dragonas
    b, f = P['sh_b'], P['sh_f']
    F.part(poly((b[0] - 2, b[1] - 4), (nx - 5, ny - 1.5), (nx - 5, ny + 1), (b[0] - 2, b[1] - 1.5)), SH_DARK, light=.18, clip=m)
    F.px(b[0], b[1] - 2.5, SILVER)
    F.part(poly((nx + 6, ny - 1.5), (f[0] + 2, f[1] - 4), (f[0] + 2, f[1] - 1.5), (nx + 6, ny + 1)), SH_DARK, light=.18, clip=m)
    # bolso esquerdo (do personagem: lado de trás da imagem) com lapela
    F.part(rect_t(P, .38, -11, 9, 8), mix(C(c), MOON, .05), clip=m)
    F.part(rect_t(P, .38, -11, 9, 3), SH_DARK, light=.15, clip=m)
    x, y = tq(P, .38, -6.5); F.px(x, y + 2, '#d8dce4')
    # bolso direito (meio escondido pelo braço)
    F.part(rect_t(P, .38, 8, 8, 8), mix(C(c), MOON, .05), clip=m)
    F.part(rect_t(P, .38, 8, 8, 3), SH_DARK, light=.15, clip=m)
    # tarja preta SEG acima do bolso esquerdo
    tape = rect_t(P, .2, -9, 12, 5)
    F.part(tape, '#121216', shade=False, ol='#08080a', clip=m)
    x, y = tq(P, .2, -8)
    glyphs = {'S': ["011", "100", "001", "110"], 'E': ["111", "110", "100", "111"], 'G': ["011", "100", "101", "011"]}
    gx = int(round(x)); gy = int(round(y)) + 0
    for ch in 'SEG':
        g = glyphs[ch]
        for j, rw in enumerate(g):
            for ii, bb in enumerate(rw):
                if bb == '1':
                    F.px(gx + ii, gy + j, GOLD)
        gx += 4
    # remendo no quadril (lado de trás) com costura
    F.part(rect_t(P, .7, -12, 6, 6), mix(C(c), MOON, .14), tex=.1, clip=m)
    x, y = tq(P, .7, -12)
    for k in range(0, 7, 2):
        F.px(x + k, y - 1, '#c8c0a8'); F.px(x - 1, y + k, '#c8c0a8')
    # cinto tático
    hb, hf = P['hip_b'], P['hip_f']
    belt = poly((hb[0] - 7, hb[1] - 3), (hf[0] + 7, hf[1] - 3), (hf[0] + 7, hf[1] + 1.5), (hb[0] - 7, hb[1] + 1.5))
    F.part(belt, BELT, light=.2)
    pv = P['pelvis']
    bx, by = pv[0] + 4, hb[1] - 1
    F.part(poly((bx - 2.5, by - 2.5), (bx + 2.5, by - 2.5), (bx + 2.5, by + 2), (bx - 2.5, by + 2)), SILVER, light=.4, ol='#2a2c32')
    F.px(bx, by, SILVER_D)
    for k in range(int(hb[0] - 5), int(hf[0] + 7), 3):
        F.px(k, hb[1] - 2, '#34343c')


def draw_shirt_arm(F, P, look):
    c = look.get('shirt', '#2f4a7a')
    m = F.part(upper_arm(P, 'f', grow=1) + fore_arm(P, 'f', grow=1, upto=.22), c, tex=.05)
    el = P['el_f']; sh = P['sh_f']; ha = P['ha_f']
    # barra dobrada da manga
    p = L2(el, ha, .2)
    F.part(limb(el[0], el[1], p[0], p[1], 10, 10), mix(C(c), MOON, .12), light=.2)
    # emblema SEGURANÇA no braço
    x, y = L2(sh, el, .45)
    x -= 1
    F.part(poly((x - 3, y - 3), (x + 3, y - 3), (x + 3, y + 1), (x, y + 4), (x - 3, y + 1)), GOLD, light=.3, ol='#2a2008')
    F.flat(poly((x - 1.5, y - 1.5), (x + 2, y - 1.5), (x + 2, y + 1), (x + .2, y + 2.4), (x - 1.5, y + 1)), BADGE_B)
    F.line(x - 2, y - 1, x + 2, y - 1, '#f4efe6')


def draw_pants(F, P, look):
    c = look.get('pants', '#232838')
    far = mix(C(c), NIGHT, .2)
    F.part(thigh(P, 'b', grow=1) + shin(P, 'b', grow=1, upto=.7), far, tex=.06)
    m = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=1) + shin(P, 'f', grow=1, upto=.7), c, tex=.06)
    # vinco
    hp, kn, ft = P['hip_f'], P['kn_f'], P['ft_f']
    a = L2(hp, kn, .3); b = kn; e = L2(kn, ft, .6)
    F.line(a[0] + 2, a[1], b[0] + 2, b[1], mix(C(c), MOON, .18))
    F.line(b[0] + 2, b[1], e[0] + 2, e[1], mix(C(c), MOON, .18))
    # remendo no joelho
    kx, ky = kn
    F.part(poly((kx - 3, ky - 3), (kx + 3, ky - 3), (kx + 3, ky + 3), (kx - 3, ky + 3)), '#2e3448', tex=.1, clip=m, outline=False)
    for k in range(-3, 4, 2):
        F.px(kx + k, ky - 3, '#6a6e80'); F.px(kx + k, ky + 3, '#6a6e80')
        F.px(kx - 3, ky + k, '#6a6e80'); F.px(kx + 3, ky + k, '#6a6e80')


def draw_shoes(F, P, look):
    c = look.get('shoes', '#1c1a1e')
    for s in ('b', 'f'):
        col = c if s == 'f' else mix(C(c), NIGHT, .22)
        kn, ft = P['kn_' + DSIDE(s)], P['ft_' + DSIDE(s)]
        top = L2(kn, ft, .45)
        fx, fy = ft
        sh = limb(top[0], top[1], fx, fy - 4, 10, 10)
        sh += ell(fx + 3.5, fy - 3, 7.5, 4)
        F.part(sh, col, light=.25)
        F.part(poly((fx - 4, fy - 1), (fx + 10, fy - 1), (fx + 11, fy + 1), (fx - 4, fy + 1)), '#4a4448' if s == 'f' else '#3a3540', light=.2)
        # dobra do cano e cadarço
        F.line(top[0] - 4, top[1] + 1, top[0] + 4, top[1] + 1, '#3a363e')
        if s == 'f':
            for k in range(3):
                p = L2(top, (fx, fy - 4), .25 + k * .25)
                F.px(p[0] + 3, p[1], '#6a6670'); F.px(p[0] + 2, p[1] + 1, '#6a6670')
            F.px(fx + 7, fy - 4, '#4a4650')


def draw_bag(F, P, look):
    """equipamento do cinto: coldre da lanterna (trás) e cassetete pendurado (frente)."""
    hb, hf = P['hip_b'], P['hip_f']
    row = P['row']
    # coldre da lanterna (lado de trás)
    x, y = hb[0] - 6, hb[1]
    F.part(poly((x - 2.5, y - 2), (x + 2.5, y - 2), (x + 2.5, y + 7), (x - 2.5, y + 7)), '#2a2a30', light=.2)
    if row != 'special':
        F.part(ell(x, y - 3, 3, 2), '#3a3c44', light=.35)
        F.px(x - 1, y - 4, '#d0d4dc')
    # cassetete pendurado na frente (não no ataque)
    if row != 'attack':
        sw = 0
        if row == 'walk':
            sw = 3 * math.sin(2 * math.pi * P['i'] / 8)
        x0, y0 = hf[0] + 6, hf[1] - 2
        x1, y1 = x0 - 1 + sw, y0 + 22
        F.part(limb(x0, y0, x1, y1, 4.5, 4), BATON, light=.25)
        F.line(x0 - 1, y0 + 2, x1 - 1, y1 - 2, '#4a4a56')
        F.part(poly((x0 - 3, y0 - 1.5), (x0 + 3, y0 - 1.5), (x0 + 3, y0 + 2), (x0 - 3, y0 + 2)), '#2a2a30', light=.2)


def draw_acc(F, P, look):
    nx, ny = P['neck']
    b = P['sh_b']
    row, i = P['row'], P['i']
    # rádio HT na dragona esquerda
    rx, ry = b[0] + 1, b[1] - 1
    F.part(poly((rx - 2.5, ry - 1), (rx + 2.5, ry - 1), (rx + 2.5, ry + 7), (rx - 2.5, ry + 7)), '#26262c', light=.25)
    F.line(rx + 1, ry - 1, rx + 1, ry - 7, '#3a3a42')
    F.px(rx + 1, ry - 7, '#1a1a1e')
    for k in range(3):
        F.px(rx - 1, ry + 2 + k * 2, '#4a4a54'); F.px(rx + 1, ry + 2 + k * 2, '#4a4a54')
    led = row == 'idle' and i < 2 or row in ('special', 'attack')
    F.px(rx - 1, ry, '#6fdc7a' if led else '#2a4a2e')
    # crachá no bolso esquerdo
    x, y = tq(P, .38, -9)
    x, y = x, y + 2
    F.px(x + 2, y - 1, SILVER); F.px(x + 2, y, SILVER)
    F.part(poly((x - .5, y + 1), (x + 5, y + 1), (x + 5, y + 9), (x - .5, y + 9)), BADGE, light=.15, ol='#3a3a40')
    F.flat(poly((x, y + 1.5), (x + 5, y + 1.5), (x + 5, y + 3), (x, y + 3)), BADGE_B)
    F.flat(poly((x, y + 4), (x + 2, y + 4), (x + 2, y + 7), (x, y + 7)), '#c69a7a')
    F.px(x + 1, y + 4, '#3a2414')
    F.px(x + 3, y + 5, '#6a6a74'); F.px(x + 4, y + 5, '#6a6a74'); F.px(x + 3, y + 7, '#6a6a74')
    # cordão e apito
    whistle_mouth = row == 'special' and P['mouth'] == 'whistle'
    if whistle_mouth:
        fp = face_pts(P)
        mx, my = fp['mouth']
        my += 1
        F.line(nx + 2, ny + 1, mx - 1, my + 2, CORD)
        F.part(poly((mx - 1, my - 1.5), (mx + 6, my - 1.5), (mx + 6, my + 1.5), (mx - 1, my + 1.5)), SILVER, light=.45, ol='#2a2c32')
        F.part(ell(mx + 5, my + 2.5, 2.5, 2), SILVER, light=.4, ol='#2a2c32')
        F.px(mx + 2, my - 1, '#ffffff')
    else:
        wx, wy = tq(P, .3, 1)
        F.line(nx - 2, ny + 1, wx, wy, CORD)
        F.line(nx + 4, ny + 1, wx + 1, wy, CORD)
        F.part(poly((wx - 1, wy), (wx + 3, wy), (wx + 3, wy + 2.5), (wx - 1, wy + 2.5)), SILVER, light=.45, ol='#2a2c32')
    # gola da camisa (por cima do cordão)
    c = look.get('shirt', '#2f4a7a')
    col = mix(C(SH_LIGHT), C(c), .3)
    F.part(poly((nx - 6, ny - 3), (nx + 1, ny), (nx, ny + 5), (nx - 6, ny + 1)), col, light=.25)
    F.part(poly((nx + 9, ny - 3), (nx + 3, ny), (nx + 5, ny + 5), (nx + 10, ny + 1)), col, light=.25)


def draw_weapon(F, P, look):
    row = P['row']
    if row == 'attack':
        p0, p1 = held(P, 21, back=6)
        F.part(limb(p0[0], p0[1], p1[0], p1[1], 4.5, 4), BATON, light=.3)
        a = L2(p0, p1, .3); b2 = L2(p0, p1, .95)
        F.line(a[0], a[1] - 1, b2[0], b2[1] - 1, '#5a5a66')
        # cordão de pulso
        F.px(p0[0], p0[1] + 1, CORD); F.px(p0[0] - 1, p0[1] + 2, CORD)
        hx, hy = P['ha_f']
        F.part(ell(hx, hy, 3.6, 3.6), skin_col(look), light=.3)
        F.px(hx + 1, hy, mix(C(skin_col(look)), INK, .4))
    elif row == 'special':
        p0, p1 = held(P, 8, back=4)
        F.part(limb(p0[0], p0[1], p1[0], p1[1], 4, 4), '#3a3c44', light=.3)
        F.part(ell(p1[0], p1[1], 3, 3), '#4a4c56', light=.35)
        on = SPECIAL[P['i']]['beam']
        F.px(p1[0] + 1, p1[1], '#fff6c0' if on else '#9aa0aa')
        hx, hy = P['ha_f']
        F.part(ell(hx, hy, 3.6, 3.6), skin_col(look), light=.3)
        F.px(hx + 1, hy, mix(C(skin_col(look)), INK, .4))


DRAW = {'face': draw_face, 'beard': draw_beard, 'hair': draw_hair, 'head': draw_head, 'shirt': draw_shirt,
        'shirt_arm': draw_shirt_arm, 'pants': draw_pants, 'shoes': draw_shoes, 'bag': draw_bag, 'acc': draw_acc,
        'weapon': draw_weapon, 'jacket': None, 'jacket_arm': None}


# ------------------------------------------------------------------ efeitos

def beam(F, P):
    p0, p1 = held(P, 10, back=4)
    a = math.radians(P['grip'])
    ca, sa = math.cos(a), math.sin(a)
    nx_, ny_ = -sa, ca
    L = 70
    for w, al, col in ((16, 95, '#ffe066'), (8, 140, '#fff3a8')):
        e = (p1[0] + ca * L, p1[1] + sa * L)
        pts = [(p1[0] + nx_ * 2, p1[1] + ny_ * 2), (e[0] + nx_ * w, e[1] + ny_ * w),
               (e[0] - nx_ * w, e[1] - ny_ * w), (p1[0] - nx_ * 2, p1[1] - ny_ * 2)]
        m = F.mask([pts]) & (F.fx[..., 3] < al)
        F.fx[m, :3] = hexc(col)
        F.fx[m, 3] = al
    F.flat(ell(p1[0] + 1, p1[1], 2, 2), '#ffffff', layer=F.fx)


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'special':
        s = SPECIAL[i]
        if s['beam']:
            beam(F, P)
        if s.get('bub'):
            hx, hy = P['head']
            bubble(F, '!', hx + 27, hy - 12 - (2 if i == 4 else 0), sc=2)
        if s.get('waves'):
            fp = face_pts(P)
            mx, my = fp['mouth']
            arcs(F, mx + 12, my + 1, s['waves'] + 1, '#f4efe6')
        if i == 2:
            sparkle(F, 116, 62, 2, '#fff6c8')
    elif row == 'attack':
        if i in (2, 3):   # rastro do golpe
            sx, sy = P['sh_f']
            r = 30
            for ang in range(-110 if i == 2 else -70, -20 if i == 2 else 20, 6):
                aa = math.radians(ang)
                F.px(sx + r * math.cos(aa), sy + r * math.sin(aa), '#f4efe6', F.fx)
                F.px(sx + (r - 1) * math.cos(aa), sy + (r - 1) * math.sin(aa), '#cfd8ea', F.fx)
    elif row == 'death' and i >= 3:
        if i == 3:
            q = lambda x, y: rp(40 + x, 78 + y, 40, 78, -40)
        else:
            q = lambda x, y: rp(30 + x, 126 + y, 30, 126, 0)
        draw_cap(F, q, at=F.fx)


def frame(look, row, i):
    P = pose(row, i, look.get('body', 'm'))
    adjust(P)
    F = Frame()
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return finish(F, P)


def build(look=LOOK):
    return person_sheet(look, draw=DRAW, adjust=adjust, extra=extra)


SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']


def variants():
    out = np.zeros((S * 4, S * 5, 4), np.uint8)
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(dict(LOOK, skin=sk, hair_color=hc), 'idle', 0)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    im = build()
    im.save(os.path.join(OUT, 'vigia.png'))
    v = variants()
    v.save(os.path.join(OUT, 'vigia_variantes.png'))
    print('ok', im.size, v.size)
