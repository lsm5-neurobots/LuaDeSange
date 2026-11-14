"""Recruta: Catadora — catadora de recicláveis (corpo f).
Gera recrutas/catadora.png (1024x768) e recrutas/catadora_variantes.png (640x512).
Rodar dentro de tools:  python recruta_catadora.py
"""
import os
import sys
import math
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import humano as H
from humano import *          # noqa  (pixkit + esqueleto)
from pixkit import _HASH

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'recrutas')

LOOK = dict(body='f', skin='#c68a5e', hair_color='#1a1210', shirt='#4f7d4a', pants='#5d6f86',
            eye='#3a2414', brow='#2a1a14')

SKINS = ['#e0b48a', '#c68a5e', '#8d5a3b', '#5e3a24']
HAIRS = ['#1a1210', '#4a2a14', '#8a5a2a', '#d8c8a0', '#2a2a2a']

# cores do ofício
LENCO = '#c4372c'
FLOR = '#f2c230'
FOLHA = '#3f8a3a'
LUVA = '#e8b830'
RAFIA = '#e6dfcc'
FAIXA = '#3a64a8'
PET = '#5fb07a'
LATA = '#c9343a'
ACO = '#8a9098'
FERRUGEM = '#8a4a24'
FITA = '#22222a'
SOLA = '#2f8a3a'
TIRA = '#2a4fa0'
OURO = '#e3b23c'
BARBANTE = '#c8b27a'
ALCA = '#6a5638'
PANO_ROSA = '#d86a8a'


def C(h):
    return hexc(h)


def dk(h, t=.35):
    return mix(C(h), INK, t)


def lt(h, t=.3):
    return mix(C(h), MOON, t)


# ------------------------------------------------------------------ pose própria (agachar/garimpar)

def build(body, row, i, lean=0, bob=0, sway=0, hb=(0, 0), hf=(0, 0), fb=(0, 0), ff=(0, 0), hd=(0, 0), **kw):
    """mesma lógica do humano.pose, mas com parâmetros livres (usado no especial)."""
    P = H._base(body)
    P.update(body=body, row=row, i=i, hrot=0, lean=lean, eyes='open', mouth='line', grip=-70, fx=[], dx=0, dy=0,
             tint=None, alpha=1.0, rotate=None, kneel=0, look=0)
    P.update(kw)
    pel = ((P['hip_b'][0] + P['hip_f'][0]) / 2 + sway * .5, P['hip_b'][1] + bob)
    P['pelvis'] = pel

    def T(p):
        x, y = p[0] + sway, p[1] + bob
        return rp(x, y, pel[0], pel[1], lean)

    for k in ('head', 'neck', 'sh_b', 'sh_f'):
        P[k] = T(P[k])
    P['head'] = (P['head'][0] + hd[0], P['head'][1] + hd[1])
    P['hrot'] = lean * .5
    for k in ('hip_b', 'hip_f'):
        P[k] = (P[k][0] + sway * .5, P[k][1] + bob)
    rb = H._base(body)
    P['ha_b'] = (P['sh_b'][0] + (rb['ha_b'][0] - rb['sh_b'][0]) + hb[0], P['sh_b'][1] + (rb['ha_b'][1] - rb['sh_b'][1]) + hb[1])
    P['ha_f'] = (P['sh_f'][0] + (rb['ha_f'][0] - rb['sh_f'][0]) + hf[0], P['sh_f'][1] + (rb['ha_f'][1] - rb['sh_f'][1]) + hf[1])
    for s in ('b', 'f'):
        sh, ha = P['sh_' + s], P['ha_' + s]
        d = math.hypot(ha[0] - sh[0], ha[1] - sh[1])
        if d > H.ARM_L * .98:
            t = H.ARM_L * .98 / d
            P['ha_' + s] = ha = (sh[0] + (ha[0] - sh[0]) * t, sh[1] + (ha[1] - sh[1]) * t)
        P['el_' + s] = two_bone(sh[0], sh[1], ha[0], ha[1], H.ARM_L, bend_dir=(1 if s == 'b' else -1))
    P['ft_b'] = (rb['ft_b'][0] + fb[0], G - fb[1])
    P['ft_f'] = (rb['ft_f'][0] + ff[0], G - ff[1])
    for s in ('b', 'f'):
        hp, ft = P['hip_' + s], P['ft_' + s]
        d = math.hypot(ft[0] - hp[0], ft[1] - hp[1])
        if d > H.LEG_L:
            t = H.LEG_L / d
            P['ft_' + s] = ft = (hp[0] + (ft[0] - hp[0]) * t, hp[1] + (ft[1] - hp[1]) * t)
        P['kn_' + s] = two_bone(hp[0], hp[1], ft[0], ft[1], H.LEG_L, bend_dir=-1)
    return P


SPECIAL = [
    dict(lean=0, bob=0, hf=(4, -4), hb=(0, -2), grip=62, eyes='wide', mouth='o'),
    dict(lean=22, bob=7, hf=(2, -2), hb=(4, -4), grip=36, eyes='open', mouth='line', fb=(-3, 0), ff=(3, 0)),
    dict(lean=12, bob=4, hf=(4, -8), hb=(2, -4), grip=-14, eyes='open', mouth='grit', fb=(-2, 0), ff=(2, 0)),
    dict(lean=-8, bob=0, hf=(-2, -46), hb=(-2, -6), grip=-108, eyes='angry', mouth='grit'),
    dict(lean=-3, bob=0, hf=(10, -12), hb=(0, -4), grip=-50, eyes='happy', mouth='open'),
    dict(lean=0, bob=0.5, hf=(2, -1), hb=(0, -2), grip=70, eyes='happy', mouth='smile'),
]


def get_pose(row, i):
    if row == 'special':
        return build('f', 'special', i, **SPECIAL[i])
    P = pose(row, i, 'f')
    adjust(P)
    return P


def adjust(P):
    row, i = P['row'], P['i']
    if row == 'idle':
        P['grip'] = 74
        P['mouth'] = 'smirk'
    elif row == 'walk':
        s = math.sin(2 * math.pi * i / 8)
        P['grip'] = 68 - 14 * s
        P['mouth'] = 'smirk'
    elif row == 'hurt':
        P['grip'] = 40 if P['i'] else 60
    elif row == 'death':
        P['grip'] = 50


# ------------------------------------------------------------------ helpers de desenho

def head_q(P):
    cx, cy = P['head']
    r = P['hrot']
    return lambda x, y: rp(cx + x, cy + y, cx, cy, r)


def phase(P):
    """fase de balanço para pontas do lenço/rabo/bag."""
    row, i = P['row'], P['i']
    if row == 'walk':
        return math.sin(2 * math.pi * i / 8 + 1.2)
    if row == 'idle':
        return [0, .3, .6, .3][i]
    if row == 'attack':
        return [0.4, 1, -1, -1.2, -.6, 0][i]
    if row == 'hurt':
        return [-.6, -1.4, -1, -.3][i]
    if row == 'special':
        return [0, .8, .4, -1, -.6, 0][i]
    return 0


def halfplane(a, b, below=True):
    """máscara do lado de uma reta a->b (acima por padrão = lado esquerdo da direção)."""
    yy, xx = np.mgrid[0:S, 0:S]
    cross = (b[0] - a[0]) * (yy - a[1]) - (b[1] - a[1]) * (xx - a[0])
    return cross < 0 if not below else cross > 0


# ------------------------------------------------------------------ camadas

def draw_hair_back(F, P, look):
    draw_sack(F, P)
    q = head_q(P)
    hc = look.get('hair_color', '#1a1210')
    ph = phase(P)
    # rabo-de-cavalo grosso saindo de baixo do nó
    a = q(-13, -5)
    m = q(-17 - ph * 1.5, 5)
    e = q(-18 - ph * 3, 15)
    sh = chain([a, m, e], 7, 4)
    F.part(sh, hc, tex=.15)
    # mechas (linhas escuras)
    F.line(a[0] + 1, a[1] + 2, m[0] + 1, m[1], dk(hc, .3))
    F.line(m[0] + 1, m[1], e[0] + 1, e[1] - 1, dk(hc, .3))
    F.px(a[0] - 1, a[1] + 3, lt(hc, .35)); F.px(m[0] - 1, m[1], lt(hc, .35))
    # pontas do lenço (atrás da cabeça)
    k = q(-12, -11)
    for j, (L, ang) in enumerate(((9, 200), (7, 228))):
        aa = math.radians(ang + ph * 14 + j * 4)
        t1 = (k[0] + math.cos(aa) * L * .5, k[1] - math.sin(aa) * L * .5 + 1)
        t2 = (k[0] + math.cos(aa) * L, k[1] - math.sin(aa) * L + 3 + j)
        F.part(chain([k, t1, t2], 4.5, 2.2), mix(C(LENCO), NIGHT, .15 + .1 * j))
        F.px(t1[0], t1[1], FLOR)


def sack_anchor(P):
    sb = P['sh_b']
    ph = phase(P)
    lag = -ph * 1.2 if P['row'] == 'walk' else -ph * .8
    dy = 0
    if P['row'] == 'special' and P['i'] == 5:
        dy = 1.5
    return (sb[0] - 9 + lag, sb[1] + 11 + dy)


def draw_sack(F, P):
    cx, cy = sack_anchor(P)
    ang = P['lean'] * .6 + phase(P) * 3
    R = lambda sh: rot(sh, cx, cy, ang)
    Rp = lambda x, y: rp(x, y, cx, cy, ang)
    top = cy - 16
    # itens saindo pela boca (atrás do corpo do saco)
    # garrafa PET verde
    b0, b1 = Rp(cx - 4, top + 5), Rp(cx - 10, top - 9)
    F.part(limb(b0[0], b0[1], b1[0], b1[1], 6, 5), PET, light=.4)
    nk = Rp(cx - 11.5, top - 12)
    F.part(limb(b1[0], b1[1], nk[0], nk[1], 3, 2.5), lt(PET, .2))
    F.part(ell(nk[0] - .5, nk[1] - 1, 2, 1.8), '#2a60c0', light=.35)
    F.line(b0[0] - 2, b0[1] - 4, b1[0] - 1, b1[1] + 1, lt(PET, .55))          # brilho do plástico
    # papelão
    F.part(R(poly((cx + 4, top + 4), (cx + 6, top - 6), (cx + 13, top - 4), (cx + 11, top + 5))), '#a8824a', tex=.2)
    p = Rp(cx + 8, top - 3)
    F.line(p[0], p[1], p[0] + 2, p[1] + 5, '#7a5a2a')
    # latinha vermelha
    c0, c1 = Rp(cx + 1, top + 4), Rp(cx + 3, top - 6)
    F.part(limb(c0[0], c0[1], c1[0], c1[1], 6, 6), LATA, light=.35)
    F.part(ell(c1[0], c1[1], 3, 1.6), '#c8ced6', light=.4)
    m = Rp(cx + 2, top - 1)
    F.px(m[0], m[1], '#f4efe6'); F.px(m[0] + 1, m[1], '#f4efe6')
    # corpo do bag de ráfia
    body = R(poly((cx - 11, top + 1), (cx + 11, top + 1), (cx + 13.5, cy + 6), (cx + 11, cy + 16), (cx - 11, cy + 16),
                  (cx - 13.5, cy + 6)) + ell(cx, cy + 14, 11, 4))
    m = F.part(body, RAFIA, dark=.32, light=.18)
    # trama
    yy, xx = np.mgrid[0:S, 0:S]
    weave = m & (((xx + yy) % 3 == 0) | ((xx - yy) % 4 == 0))
    F.a[weave, :3] = (F.a[weave, :3].astype(float) * .88).astype(np.uint8)
    # faixa azul
    band = F.mask(R(poly((cx - 15, cy + 2), (cx + 15, cy + 2), (cx + 15, cy + 5), (cx - 15, cy + 5)))) & m
    F.a[band, :3] = (mix(F.a[band, :3].astype(float), C(FAIXA), .8)).astype(np.uint8)
    # bainha da boca (dobra) e pano rosa pendurado
    F.part(R(poly((cx - 12, top - 1), (cx + 12, top - 1), (cx + 12, top + 3), (cx - 12, top + 3))), lt(RAFIA, .1), dark=.2)
    pp = R(poly((cx - 2, top), (cx + 5, top), (cx + 4, top + 7), (cx + 1, top + 5), (cx - 1, top + 8)))
    F.part(pp, PANO_ROSA, tex=.2)
    # sujeira no fundo
    d = F.mask(R(ell(cx + 3, cy + 15, 9, 3))) & m
    F.a[d & (_HASH < 50), :3] = (F.a[d & (_HASH < 50), :3].astype(float) * .72).astype(np.uint8)
    if P['row'] == 'special' and P['i'] == 5:
        # latinha nova recém-caída na boca do saco
        c0, c1 = Rp(cx - 3, top + 1), Rp(cx - 6, top - 5)
        F.part(limb(c0[0], c0[1], c1[0], c1[1], 5, 5), '#d8d8e0', light=.35)
        F.part(ell(c1[0], c1[1], 2.4, 1.4), '#f4f4f8')


def draw_body(F, P, look):
    c = skin_col(look)
    far = mix(hexc(c), NIGHT, .18)
    F.part(thigh(P, 'b') + shin(P, 'b'), far)
    F.part(foot_shapes(P, 'b'), far)
    F.part(upper_arm(P, 'b') + fore_arm(P, 'b'), far)
    glove(F, P, 'b', far=True)
    F.part(thigh(P, 'f') + shin(P, 'f'), c)
    F.part(foot_shapes(P, 'f'), c)
    # dedos do pé
    for s, col in (('b', far), ('f', hexc(c))):
        fx, fy = P['ft_' + DSIDE(s)]
        F.px(fx + 8, fy - 3, mix(col, INK, .4)); F.px(fx + 7, fy - 2, mix(col, INK, .4))
    F.part(torso_shapes(P) + pelvis_shapes(P), c)
    F.part(neck_shapes(P), mix(hexc(c), NIGHT, .12))
    F.part(head_shapes(P), c, tex=0)
    F.part(ear_shapes(P), c)
    F.part(nose_shapes(P), c, outline=False, light=.35)


def glove(F, P, s, far=False):
    col = C(LUVA)
    if far:
        col = mix(col, NIGHT, .2)
    # punho cobrindo o terço final do antebraço
    el, ha = P['el_' + DSIDE(s)], P['ha_' + DSIDE(s)]
    st = L2(el, ha, .55)
    F.part(limb(st[0], st[1], ha[0], ha[1], 8, 8), col, light=.35)
    cu = L2(el, ha, .58)
    cu2 = L2(el, ha, .72)
    F.part(limb(cu[0], cu[1], cu2[0], cu2[1], 9, 9), mix(col, MOON, .15), light=.3)       # punho dobrado
    F.part(ell(ha[0], ha[1], 4.5, 4.5), col, light=.4)
    F.px(ha[0] - 1, ha[1] - 2, '#fff0a0' if not far else mix(col, MOON, .4))
    F.px(ha[0] + 1, ha[1] + 1, mix(col, INK, .45))                                       # sujeira


def draw_arm(F, P, look):
    c = skin_col(look)
    F.part(upper_arm(P, 'f') + fore_arm(P, 'f'), c)
    glove(F, P, 'f')


def draw_face(F, P, look):
    m = P['mouth']
    if m == 'smirk':
        P['mouth'] = 'line'
    H.draw_face(F, P, look)
    P['mouth'] = m
    fp = face_pts(P)
    brow = look.get('brow', '#2a1a14')
    x, y = fp['brow_b']
    x, y = int(round(x)), int(round(y))
    if P['eyes'] == 'angry':
        F.line(x - 2, y - 2, x + 1, y, brow)
    elif P['eyes'] == 'wide':
        F.line(x - 2, y - 3, x + 2, y - 3, brow)
    else:
        F.line(x - 2, y - 1, x + 1, y - 2, brow)
    mx, my = fp['mouth']
    mx, my = int(round(mx)), int(round(my))
    sk = hexc(skin_col(look))
    if m == 'smirk':
        F.px(mx - 2, my, sk); F.px(mx + 3, my - 1, '#5a2a24')
        F.px(mx + 4, my - 2, mix(sk, INK, .35))
    # fuligem na bochecha de trás
    cx, cy = fp['cheek']
    for dx, dy in ((-2, 2), (-1, 3), (-3, 3), (-1, 2)):
        F.px(cx + dx, cy + dy, mix(sk, hexc('#3a3024'), .45))
    if P['row'] == 'special' and P['i'] in (1, 2, 3):
        q = head_q(P)
        a = q(13, -5)
        F.px(a[0], a[1], '#bfe6ff'); F.px(a[0], a[1] + 1, '#7fb8e0')


def draw_pants(F, P, look):
    c = look.get('pants')
    far = mix(hexc(c), NIGHT, .2)
    F.part(thigh(P, 'b', grow=2) + shin(P, 'b', grow=2, upto=.66), far, tex=.08)
    sb = H.shin(P, 'b', grow=3, upto=.66)
    kn, ft = P['kn_b'], P['ft_b']
    e0 = L2(kn, (ft[0], ft[1] - 3), .54); e1 = L2(kn, (ft[0], ft[1] - 3), .7)
    F.part(limb(e0[0], e0[1], e1[0], e1[1], 10, 10), mix(lt(c, .2), NIGHT, .2))
    m = F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=2) + shin(P, 'f', grow=2, upto=.66), c, tex=.08)
    # joelho gasto
    kx, ky = P['kn_f']
    F.part(ell(kx + 1, ky - 1, 4, 3), lt(c, .22), clip=m, outline=False, shade=False)
    # remendo xadrez no joelho
    pr = poly((kx - 2, ky - 4), (kx + 4, ky - 4), (kx + 4, ky + 2), (kx - 2, ky + 2))
    pm = F.part(pr, '#b8322a', clip=m, ol='#4a1410', light=.15)
    for yy in range(int(ky - 4), int(ky + 3)):
        for xx in range(int(kx - 2), int(kx + 5)):
            if pm[yy % S, xx % S] and ((xx // 2 + yy // 2) % 2 == 0):
                F.px(xx, yy, '#2a1416')
    # barra virada
    kn, ft = P['kn_f'], P['ft_f']
    e0 = L2(kn, (ft[0], ft[1] - 3), .54); e1 = L2(kn, (ft[0], ft[1] - 3), .7)
    F.part(limb(e0[0], e0[1], e1[0], e1[1], 10, 10), lt(c, .25))
    # costura lateral
    hp = P['hip_f']
    F.line(hp[0] + 4, hp[1] + 3, P['kn_f'][0] + 4, P['kn_f'][1] - 3, mix(hexc(c), hexc('#c8a050'), .35))
    # barbante na cintura
    hb, hf = P['hip_b'], P['hip_f']
    F.line(hb[0] - 5, hb[1] - 2, hf[0] + 6, hf[1] - 2, BARBANTE)
    F.line(hb[0] - 5, hb[1] - 1, hf[0] + 6, hf[1] - 1, mix(C(BARBANTE), INK, .35))
    nx = hf[0] + 1
    F.px(nx, hf[1] - 2, '#f0e0a8'); F.px(nx + 1, hf[1] - 1, BARBANTE)
    F.line(nx, hf[1], nx - 1, hf[1] + 4, BARBANTE); F.line(nx + 1, hf[1], nx + 3, hf[1] + 3, BARBANTE)


def draw_shoes(F, P, look):
    for s, f in (('b', .22), ('f', 0)):
        fx, fy = P['ft_' + DSIDE(s)]
        sole = poly((fx - 3, fy - 1.5), (fx + 10, fy - 1.5), (fx + 10, fy + .8), (fx - 3, fy + .8))
        F.part(sole, mix(C(SOLA), NIGHT, f), ol=mix(C('#7a5a10'), NIGHT, f), shade=False)
        F.line(fx - 2, fy - 1, fx + 9, fy - 1, mix(C(FLOR), NIGHT, f))
        tc = mix(C(TIRA), NIGHT, f)
        F.line(fx + 7, fy - 3, fx + 4, fy - 5, tc)
        F.line(fx + 7, fy - 3, fx + 2, fy - 3, tc)
        F.px(fx + 7, fy - 3, mix(tc, MOON, .4))


def draw_shirt(F, P, look):
    c = look.get('shirt')
    far = mix(hexc(c), NIGHT, .2)
    sb, eb = P['sh_b'], P['el_b']
    e = L2(sb, eb, .62)
    F.part(limb(sb[0], sb[1] + 1, e[0], e[1], 9, 9), far, tex=.06)
    m = F.part(torso_shapes(P, grow=1), c, tex=.06)
    # desbotado
    fade = m & (_HASH > 80) & shift(m, 0, 2) & shift(m, 2, 0)
    F.a[fade, :3] = mix(F.a[fade, :3].astype(float), C('#9cc08a'), .45).astype(np.uint8)
    nx, ny = P['neck']
    pv = P['pelvis']
    q = lambda x, y: rp(x, y, pv[0], pv[1], P['lean'])
    # gola esgarçada
    g = [q(nx - 5 + P['lean'] * 0, ny + 0), q(nx, ny + 3), q(nx + 5, ny + 0)]
    F.line(g[0][0], g[0][1], g[1][0], g[1][1], '#7fa070'); F.line(g[1][0], g[1][1], g[2][0], g[2][1], '#7fa070')
    # símbolo de reciclagem desbotado (triângulo de setas)
    sx, sy = L2(P['sh_f'], P['hip_f'], .28)
    sx -= 3
    sym = C('#a8c898')
    for (dx, dy) in ((0, -2), (-1, -1), (1, -1), (-2, 0), (2, 0), (-2, 1), (-1, 1), (1, 1), (2, 1)):
        F.px(sx + dx, sy + dy, sym)
    F.px(sx, sy + 1, mix(C(c), INK, .2))
    # remendo bege na barriga com costura tracejada
    bx, by = L2(P['sh_b'], P['hip_f'], .68)
    pr = poly((bx - 3, by - 3), (bx + 4, by - 3), (bx + 4, by + 3), (bx - 3, by + 3))
    pm = F.part(rot(pr, bx, by, P['lean'] + 6), '#d8c49a', clip=m, ol='#6a4a2a', light=.2)
    ys, xs = np.nonzero(pm)
    for x_, y_ in zip(xs, ys):
        if (x_ + y_) % 3 == 0:
            F.px(x_, y_, '#b8a070')
    # remendo de jeans nas costas
    jx, jy = L2(P['sh_b'], P['hip_b'], .4)
    F.part(rot(poly((jx - 2, jy - 2), (jx + 2, jy - 2), (jx + 2, jy + 2), (jx - 2, jy + 2)), jx, jy, P['lean']), '#4a5a78',
           clip=m, ol='#1e2638', light=.15)
    # barra suja
    hb, hf = P['hip_b'], P['hip_f']
    dirt = m & ~shift(m, 0, -3) & (_HASH < 60)
    F.a[dirt, :3] = mix(F.a[dirt, :3].astype(float), C('#5a4a30'), .6).astype(np.uint8)


def draw_shirt_arm(F, P, look):
    c = look.get('shirt')
    sf, ef = P['sh_f'], P['el_f']
    e = L2(sf, ef, .62)
    F.part(limb(sf[0], sf[1] + 1, e[0], e[1], 9, 9), c, tex=.06)
    e2 = L2(sf, ef, .5)
    F.part(limb(e2[0], e2[1], e[0], e[1], 10, 10), mix(hexc(c), NIGHT, .12))     # dobra da manga


def draw_bag(F, P, look):
    """alça do bag cruzando o peito: ombro da frente -> quadril de trás."""
    a = P['sh_f']
    b = P['hip_b']
    a = (a[0] - 2, a[1] - 3)
    b = (b[0] - 6, b[1] - 6)
    F.part(limb(a[0], a[1], b[0], b[1], 3.5, 3.5), ALCA, light=.3)
    for t in (.2, .45, .7):
        p = L2(a, b, t)
        F.px(p[0], p[1], mix(C(ALCA), INK, .4))


def draw_hair(F, P, look):
    hc = look.get('hair_color', '#1a1210')
    q = head_q(P)
    cx, cy = P['head']
    # costeleta/lateral até a orelha + nuca
    side = poly(q(-16, -8), q(-6, -9), q(-8, -3), q(-11, 3), q(-12, 8), q(-16, 6), q(-17, -2))
    F.part(side, hc, tex=.15)
    F.line(*q(-12, -6), *q(-14, 4), dk(hc, .3))
    # franja espiando por baixo do lenço
    fr = poly(q(-4, -9), q(13, -9), q(12, -6), q(9, -7), q(6, -5), q(3, -7), q(-1, -6))
    F.part(fr, hc, tex=.1)
    a = q(4, -8)
    F.px(a[0], a[1], lt(hc, .35))


def draw_head(F, P, look):
    """lenço de chita amarrado."""
    q = head_q(P)
    cx, cy = P['head']
    hs = H.head_shapes(P, grow=1.6)
    clip = halfplane(q(-30, 4), q(30, -10), below=False)
    sh = rot(ell(cx - 1, cy - 4, 17, 13.5), cx, cy, P['hrot'])
    m = F.part(sh, LENCO, clip=clip, tex=0, light=.3, dark=.32)
    # bainha da frente
    e0, e1 = q(-17, 2), q(16, -9)
    edge = m & ~shift(m, 0, -2)
    F.a[edge, :3] = mix(F.a[edge, :3].astype(float), C('#8a2420'), .5).astype(np.uint8)
    # chita: florzinhas em grade no espaço da cabeça (giram com ela)
    for (u, v) in ((-9, -15), (-1, -18), (7, -15), (-13, -8), (-5, -11), (3, -12), (11, -10), (-9, -3), (0, -7), (-15, -1)):
        fx_, fy_ = q(u, v)
        x_, y_ = int(round(fx_)), int(round(fy_))
        if not (0 < x_ < S - 1 and 0 < y_ < S - 1) or not (m[y_, x_] and m[y_ + 1, x_] and m[y_ - 1, x_]):
            continue
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
            if m[y_ + dy, x_ + dx]:
                F.px(x_ + dx, y_ + dy, FLOR)
        F.px(x_, y_, '#fff6e0')
        lx, ly = x_ + 2, y_ + 1
        if m[ly % S, lx % S]:
            F.px(lx, ly, FOLHA)
        if m[(ly + 1) % S, (lx - 1) % S] and m[(ly + 1) % S, (lx - 1) % S]:
            F.px(lx - 1, ly + 1, mix(C(FOLHA), INK, .25))
    # dobra/vinco
    a, b = q(-6, -16), q(-12, -4)
    F.line(a[0], a[1], b[0], b[1], mix(C(LENCO), NIGHT, .45))
    # nó atrás
    k = q(-13, -11)
    F.part(ell(k[0], k[1], 3.6, 3), mix(C(LENCO), NIGHT, .1), light=.35)
    F.px(k[0] - 1, k[1] - 1, FLOR)


def draw_acc(F, P, look):
    """argola dourada na orelha."""
    q = head_q(P)
    sw = 1 if (P['row'] == 'walk' and P['i'] % 4 in (1, 2)) else 0
    e = q(-13 + sw * .5, 9 + sw * .3)
    x, y = int(round(e[0])), int(round(e[1]))
    for dx, dy in ((0, 0), (-1, 1), (1, 1), (-1, 2), (1, 2), (0, 3)):
        F.px(x + dx, y + dy, OURO)
    F.px(x - 1, y + 1, '#fff0a0')


def hook_pts(P, length=28):
    p0, p1 = held(P, length, back=7)
    a = math.radians(P['grip'])
    d = (math.cos(a), math.sin(a))
    n = (-d[1], d[0])
    if d[0] < -.2:   # apontando para trás: gancho curva para cima/fora
        n = (d[1], -d[0])
    pts = [p1,
           (p1[0] + d[0] * 2.5 + n[0] * 1.5, p1[1] + d[1] * 2.5 + n[1] * 1.5),
           (p1[0] + d[0] * 2 + n[0] * 4.5, p1[1] + d[1] * 2 + n[1] * 4.5),
           (p1[0] - d[0] * .5 + n[0] * 6, p1[1] - d[1] * .5 + n[1] * 6),
           (p1[0] - d[0] * 2.5 + n[0] * 5, p1[1] - d[1] * 2.5 + n[1] * 5)]
    return p0, p1, pts, d, n


def draw_weapon(F, P, look):
    p0, p1, hk, d, n = hook_pts(P)
    hx, hy = P['ha_f']
    # haste de aço
    F.part(limb(hx, hy, p1[0], p1[1], 2.6, 2.4), ACO, light=.45)
    F.part(chain(hk, 2.4, 2), ACO, light=.45)
    for t in (.35, .62, .85):
        p = L2((hx, hy), p1, t)
        F.px(p[0], p[1], FERRUGEM)
    F.px(*L2((hx, hy), p1, .5), '#c8ced6')
    F.px(hk[2][0], hk[2][1], FERRUGEM)
    # cabo com fita isolante
    c1 = (hx + d[0] * 3, hy + d[1] * 3)
    F.part(limb(p0[0], p0[1], c1[0], c1[1], 4, 4), FITA, light=.25)
    m = L2(p0, c1, .25)
    F.px(m[0], m[1], '#c9343a'); F.px(m[0] + n[0], m[1] + n[1], '#c9343a')
    # dedos da luva por cima do cabo
    F.part(ell(hx + n[0] * .5, hy + n[1] * .5, 2.6, 2.6), LUVA, light=.35, ol=dk(LUVA, .6))
    F.px(hx - d[0], hy - d[1], mix(C(LUVA), INK, .35))


DRAW = {'hair_back': draw_hair_back, 'body': draw_body, 'face': draw_face, 'pants': draw_pants, 'shoes': draw_shoes,
        'shirt': draw_shirt, 'jacket': None, 'bag': draw_bag, 'arm': draw_arm, 'shirt_arm': draw_shirt_arm,
        'jacket_arm': None, 'beard': None, 'hair': draw_hair, 'head': draw_head, 'acc': draw_acc, 'weapon': draw_weapon}


# ------------------------------------------------------------------ props e efeitos

def can_side(F, x, y, col=LATA, layer=None, ang=0):
    """latinha deitada."""
    sh = rot(limb(x - 3, y, x + 3, y, 5, 5), x, y, ang)
    F.part(sh, col, light=.35, layer=layer)
    e = rp(x + 3, y, x, y, ang)
    F.part(ell(e[0], e[1], 1.6, 2.6), '#c8ced6', light=.4, layer=layer)
    F.px(x - 1, y - 1, '#f4efe6', layer)


def bolt(F, x, y, layer=None):
    F.part(limb(x - 2, y, x + 2, y - 1, 2, 2), '#9aa0a8', light=.4, layer=layer)
    F.part(poly((x - 3, y - 2), (x - 1, y - 2.5), (x - 1, y + 1.5), (x - 3, y + 1)), '#7a8088', light=.3, layer=layer)


def rag(F, x, y, layer=None, hang=False):
    if hang:
        sh = poly((x - 3, y), (x + 3, y), (x + 4, y + 6), (x + 1, y + 4), (x - 1, y + 7), (x - 3, y + 4))
    else:
        sh = poly((x - 4, y + 1), (x - 1, y - 2), (x + 3, y - 1), (x + 5, y + 1), (x + 1, y + 2))
    F.part(sh, PANO_ROSA, tex=.2, layer=layer)
    F.px(x, y + (2 if hang else 0), '#f0a0b8', layer)


def trail(F, pts, col='#fff6c8'):
    for (x, y) in pts:
        F.px(x, y, col, F.fx)


def extra(F, P):
    row, i = P['row'], P['i']
    if row == 'special':
        p0, p1, hk, d, n = hook_pts(P)
        tip = hk[3]
        if i in (0, 1):
            can_side(F, 108, 109)
            bolt(F, 100, 110)
            rag(F, 116, 110)
            if i == 0:
                sparkle(F, 108, 104, 3); sparkle(F, 118, 106, 2)
        elif i == 2:
            # pendurados no gancho
            can_side(F, tip[0], tip[1] + 3, ang=70)
            rag(F, tip[0] - 2, tip[1] + 1, hang=True)
            bolt(F, 103, 96, layer=F.fx)
            trail(F, [(101, 101), (100, 104), (100, 107)])
        elif i == 3:
            can_side(F, tip[0] + 1, tip[1] - 1, ang=-30)
            rag(F, tip[0] - 2, tip[1] + 1, hang=True)
            bolt(F, tip[0] + 6, tip[1] - 6, layer=F.fx)
            for k in range(3):
                F.px(tip[0] + 6 + k * 2, tip[1] + 4 + k * 2, '#f4efe6', F.fx)
        elif i == 4:
            sx, sy = sack_anchor(P)
            # arco de rastro do gancho até o saco
            for k in range(10):
                t = k / 9
                x = lerp(60, sx + 2, t)
                y = lerp(20, sy - 34, t) - math.sin(t * math.pi) * 10
                F.px(x, y, '#fff6c8', F.fx)
            can_side(F, sx - 1, sy - 34, layer=F.fx, ang=120)
            rag(F, sx - 9, sy - 38, layer=F.fx, hang=True)
            bolt(F, sx + 6, sy - 42, layer=F.fx)
        elif i == 5:
            sx, sy = sack_anchor(P)
            star(F, sx - 6, sy - 26, col='#f2c230', r=3)
            sparkle(F, sx + 6, sy - 30, 3)
            sparkle(F, sx - 14, sy - 18, 2)
            star(F, sx + 12, sy - 22, col='#f2c230', r=2)
    elif row == 'death' and i in (4, 5):
        can_side(F, 30 + (i - 4) * 6, 110, layer=F.fx, ang=(i - 4) * 90)
    elif row == 'walk' and i in (2, 6):
        p0, p1, hk, d, n = hook_pts(P)
        if p1[1] > 106:
            dust(F, p1[0] + 2, 111, 2)


# ------------------------------------------------------------------ montagem

def frame(look, row, i):
    P = get_pose(row, i)
    F = Frame()
    draw_person(F, P, look, DRAW)
    extra(F, P)
    return finish_cat(F, P)


def finish_cat(F, P):
    """igual ao humano.finish, mas gira o corpo numa tela maior (não corta a cabeça) e o puxa para dentro do quadro."""
    pose_fx(F, P)
    dx, dy = 0, 0
    if P['row'] == 'death':
        dx, dy = {3: (-8, 0), 4: (-28, -12), 5: (-30, -13)}.get(P['i'], (0, 0))
    if P['row'] == 'death' and P['i'] == 5:
        for (x, y) in ((44, 72), (56, 66), (34, 80)):
            star(F, x, y, r=3)
    rotd = P.get('rotate')
    if rotd:
        ang, cx, cy = rotd
        big = np.zeros((S * 3, S * 3, 4), np.uint8)
        big[S:2 * S, S:2 * S] = F.a
        im = Image.fromarray(big, 'RGBA').rotate(ang, resample=Image.NEAREST, center=(cx + S, cy + S))
        big = np.array(im)
        F.a = big[S - dy:2 * S - dy, S - dx:2 * S - dx].copy()
    sh = shadow_layer(64 + (dx + 4 if rotd else 0), 30 if rotd else 19)
    return compose(F, tint=P.get('tint'), shadow=sh, alpha=P.get('alpha', 1.0))


def make_sheet(look):
    out = np.zeros((S * 6, S * 8, 4), np.uint8)
    for r, name in enumerate(ROWS):
        for c in range(NFR[name]):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(look, name, c)
    return Image.fromarray(out, 'RGBA')


def make_variants(look):
    out = np.zeros((S * len(SKINS), S * len(HAIRS), 4), np.uint8)
    for r, sk in enumerate(SKINS):
        for c, hc in enumerate(HAIRS):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = frame(dict(look, skin=sk, hair_color=hc), 'idle', 0)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    sh = make_sheet(LOOK)
    sh.save(os.path.join(OUT, 'catadora.png'))
    va = make_variants(LOOK)
    va.save(os.path.join(OUT, 'catadora_variantes.png'))
    if len(sys.argv) > 1:   # prévia: python recruta_catadora.py <pasta>
        bg = Image.new('RGBA', sh.size, (70, 66, 80, 255))
        bg.alpha_composite(sh)
        bg.resize((sh.width * 2, sh.height * 2), Image.NEAREST).save(os.path.join(sys.argv[1], 'catadora_prev.png'))
        bg = Image.new('RGBA', va.size, (70, 66, 80, 255))
        bg.alpha_composite(va)
        bg.resize((va.width * 2, va.height * 2), Image.NEAREST).save(os.path.join(sys.argv[1], 'catadora_var.png'))
        for r in range(6):
            crop = bg2 = Image.new('RGBA', (S * 8, S), (70, 66, 80, 255))
            bg2.alpha_composite(sh.crop((0, r * S, S * 8, (r + 1) * S)))
            bg2.resize((S * 8 * 2, S * 2), Image.NEAREST).save(os.path.join(sys.argv[1], 'catadora_row%d.png' % r))
    print('ok', sh.size, va.size)
