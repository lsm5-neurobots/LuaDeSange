"""Pet: Sagui-de-tufos-brancos (Lua de Sangue). Gera sprites/sagui.png e sprites/sagui.json.
Rodar da pasta tools:  python pet_sagui.py
"""
import os, json, math, random
import numpy as np
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, Xf, two_bone, rp, eye, text, bubble, star,
                    sparkle, puff, impact, arcs, dust, shadow_layer, compose, sheet, G, S)

random.seed(7)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

# ---------------- paleta ----------------
FUR = '#8a7e70'      # cinza-acastanhado do corpo
FUR_D = '#5a5048'    # listras escuras do dorso
FUR_L = '#b4a894'    # barriga / peito claro
FACE = '#3b2d27'     # cara escura
MUZ = '#2a1f1b'      # focinho
TUFT = '#f1ede4'     # tufos brancos
TUFT_S = '#c9c3b8'   # sombra dos tufos
BLAZE = '#f4f0e6'    # mancha da testa
TAIL_L = '#b2aca2'   # anel claro da cauda
TAIL_D = '#2e2a28'   # anel escuro da cauda
HAND = '#3a2e28'
POUCH = '#7a6e44'    # lona da pochete
POUCH_D = '#55492c'
STRAP = '#5c3d26'
RED = '#b0303a'      # remendo vermelho (lua de sangue)
SKIN = '#6e4c40'     # orelha/pele
COIN = '#e2b23a'


def P(x, y):
    return (x, y)


def tail_pts(x0, y0, a0, k, n=11, seg=4.6, wob=0.0):
    pts = [(x0, y0)]
    a = a0
    x, y = x0, y0
    for i in range(n):
        a += k * (0.5 + i / n) + wob * math.sin(i * .9)
        x += seg * math.cos(math.radians(a))
        y += seg * math.sin(math.radians(a))
        pts.append((x, y))
    return pts


def draw_tail(F, pts, w0=6.0, w1=3.4):
    n = len(pts) - 1
    shapes = chain(pts, w0, w1)
    marks = []
    for i in range(n):
        a = w0 + (w1 - w0) * i / n + 3
        (xa, ya), (xb, yb) = pts[i], pts[i + 1]
        # anel escuro estreito em cada segmento
        L = math.hypot(xb - xa, yb - ya) or 1
        nx, ny = -(yb - ya) / L * a / 2, (xb - xa) / L * a / 2
        p0 = (xa + (xb - xa) * .4, ya + (yb - ya) * .4)
        p1 = (xa + (xb - xa) * .95, ya + (yb - ya) * .95)
        marks.append((poly((p0[0] + nx, p0[1] + ny), (p1[0] + nx, p1[1] + ny),
                           (p1[0] - nx, p1[1] - ny), (p0[0] - nx, p0[1] - ny)), TAIL_D))
    marks.append((ell(pts[-1][0], pts[-1][1], 2.4, 2.4), TAIL_D))
    F.part(shapes, TAIL_L, marks=marks, tex=.15, light=.25, dark=.22)


def fan(cx, cy, r, a0, a1, n=7, jag=.78):
    """leque de pelo com borda franjada (tufos)."""
    pts = [(cx, cy)]
    m = n * 2
    for i in range(m + 1):
        a = math.radians(a0 + (a1 - a0) * i / m)
        rr = r if i % 2 == 0 else r * jag
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return [pts]

def draw(F, p):
    """p: dicionário de pose."""
    bx, by, br = p['bx'], p['by'], p.get('br', 0)
    B = Xf(bx, by, br)
    hip = B.p(bx - 11, by + 2)
    sho = B.p(bx + 10, by + 1)
    hx, hy, hr = p['hx'], p['hy'], p.get('hr', 0)
    H = Xf(hx, hy, hr)
    hs = p.get('hs', 1.06)

    # ---- cauda ----
    tb = B.p(bx - 15, by - 2)
    tp = tail_pts(tb[0], tb[1], p.get('ta', 200), p.get('tk', 14), wob=p.get('tw', 0))
    draw_tail(F, tp)

    # ---- tufo de trás (lado longe) ----
    tfs = p.get('tuft', 1.0)
    F.part(H(fan(hx + 3, hy - 6, 11 * tfs, 225, 335, n=6, jag=.84)), TUFT_S, tex=.12, light=.2, ol='#5a544c')
    # ---- perna/braço do lado longe ----
    def hind(foot, col_shift=0.0, far=False):
        fx, fy = foot
        k = two_bone(hip[0], hip[1], fx - 3, fy - 2, 20, bend_dir=-1)
        c = FUR_D if far else FUR
        F.part(limb(hip[0], hip[1], k[0], k[1], 9, 6) + limb(k[0], k[1], fx - 3, fy - 2, 5, 4), c, tex=.2)
        F.part(limb(fx - 4, fy - 1.5, fx + 3, fy - 1.0, 4, 3.5), HAND)
        if not far:
            F.part(ell(hip[0] + 1, hip[1] + 1, 8, 7.5, rot=-20), FUR, tex=.25)

    def arm(hand, far=False, hand_col=HAND):
        ax, ay = hand
        sh = (sho[0] + (2 if far else 0), sho[1] + (0 if far else 1))
        e = two_bone(sh[0], sh[1], ax, ay, p.get('al', 19), bend_dir=1)
        c = FUR_D if far else FUR_L
        F.part(limb(sh[0], sh[1], e[0], e[1], 6, 5) + limb(e[0], e[1], ax, ay - 1, 4.5, 3.5), c, tex=.2)
        F.part(ell(ax + 1, ay - .8, 2.6, 2.0), hand_col)

    hind(p['ffar'], far=True)
    arm(p['afar'], far=True)

    # ---- corpo ----
    body = B(ell(bx, by, 17, 10.5))
    stripes = []
    for i in range(6):
        sx = bx - 13 + i * 5
        stripes.append((B(poly((sx, by - 12), (sx + 2.2, by - 12), (sx + 1.2, by - 4), (sx - .6, by - 4))), FUR_D))
    belly = (B(ell(bx + 2, by + 7, 13, 4.5)), FUR_L)
    F.part(body, FUR, marks=stripes + [belly], tex=.28)

    # ---- perna perto ----
    hind(p['fnear'])

    # ---- pochete a tiracolo ----
    s0 = B.p(bx + 9, by - 10)
    s1 = B.p(bx - 1, by + 4)
    F.part(limb(s0[0], s0[1], s1[0], s1[1], 2.4), STRAP, light=.18)
    pc = B.p(bx - 1, by + 6)
    R = lambda sh: rot(sh, pc[0], pc[1], br)
    pouch = R(ell(pc[0], pc[1], 6.5, 5.2))
    flap = R(poly((pc[0] - 7, pc[1] - 6), (pc[0] + 7, pc[1] - 6), (pc[0] + 5.5, pc[1] - .5), (pc[0] - 5.5, pc[1] - .5)))
    patch = R(poly((pc[0] + 1, pc[1] + 1), (pc[0] + 4.5, pc[1] + 1), (pc[0] + 4.5, pc[1] + 4), (pc[0] + 1, pc[1] + 4)))
    F.part(pouch, POUCH, marks=[(flap, POUCH_D), (patch, RED)], tex=.1, light=.25)
    bt = rp(pc[0], pc[1] - 1, pc[0], pc[1], br)
    F.px(bt[0], bt[1], '#e8d088')

    if p.get('arm_back'):
        arm(p['anear'], hand_col=HAND)
    # ---- cabeça ----
    # pescoço / peito
    F.part(ell((sho[0] + hx) / 2 - 2, (sho[1] + hy) / 2 + 3, 7, 7), FUR_L, tex=.25)
    head = H(ell(hx, hy, 14 * hs, 12.5 * hs))
    crown = (H(ell(hx - 4, hy - 8, 10, 5.5)), FUR_D)
    face = (H(ell(hx + 6.5, hy + 2.5, 8.5, 8.5)), FACE)
    blaze = (H(poly((hx + 4.5, hy - 12), (hx + 9.5, hy - 12.5), (hx + 11, hy - 8), (hx + 8, hy - 5),
                    (hx + 5, hy - 7))), BLAZE)
    F.part(head, FUR, marks=[crown, face, blaze], tex=.22)
    # focinho
    mz = H.p(hx + 11.5, hy + 6.5)
    F.part(ell(mz[0], mz[1], 4.4, 3.6, rot=hr), MUZ, light=.2)
    nz = H.p(hx + 14.4, hy + 5)
    F.px(nz[0], nz[1], '#0e0808'); F.px(nz[0] - 1, nz[1], '#0e0808')
    mouth = p.get('mouth', 'closed')
    m0 = H.p(hx + 10, hy + 8.6)
    if mouth == 'open':
        F.part(H(ell(hx + 11, hy + 10, 2.4, 1.9)), '#4a1418', shade=False, ol='#140a0a')
        F.px(m0[0] + 1, m0[1] - .6, '#f4efe6'); F.px(m0[0] + 3, m0[1] - .6, '#f4efe6')
    elif mouth == 'smile':
        F.line(m0[0], m0[1] - 1, m0[0] + 1, m0[1], '#140a0a'); F.line(m0[0] + 1, m0[1], m0[0] + 4, m0[1], '#140a0a')
    elif mouth == 'wavy':
        for k, d in enumerate([0, 1, 0, 1]):
            F.px(m0[0] + k, m0[1] + d, '#140a0a')
    else:
        F.line(m0[0] + 1, m0[1], m0[0] + 3, m0[1], '#140a0a')
    # olhos (sem escala, para manter os pixels nítidos)
    ek = p.get('eyes', 'open')
    e1 = F.T(*H.p(hx + 5, hy - 0.5))
    e2 = F.T(*H.p(hx + 11.5, hy - 1.3))
    F.raw = True
    if ek in ('open', 'wide', 'angry'):
        eye(F, e1[0], e1[1], ek, iris='#7a4420', r=2)
        eye(F, e2[0], e2[1], 'angry' if ek == 'angry' else 'open', iris='#7a4420', r=1)
    else:
        if ek in ('x', 'spiral'):
            F.part(ell(e1[0] + .5, e1[1] + .5, 3.6, 3.6), '#9a7a66', shade=False, ol='#2a1a14')
            F.part(ell(e2[0] + 1.5, e2[1] + .5, 2.4, 2.8), '#9a7a66', shade=False, ol='#2a1a14')
        eye(F, e1[0], e1[1], ek, r=2)
        eye(F, e2[0] + 1, e2[1], ek, r=1 if ek != 'x' else 1)
    F.raw = False
    # tufo perto (leque branco saindo da orelha)
    ear = (hx - 5, hy - 1)
    F.part(H(fan(ear[0], ear[1], 12.5 * tfs, 105, 285, n=9, jag=.84) + ell(ear[0], ear[1], 5, 5)), TUFT,
           marks=[(H(fan(ear[0] - 1, ear[1], 5.5 * tfs, 120, 270, n=5, jag=.8)), TUFT_S)], tex=.1, light=.3,
           ol='#5a544c')
    # ---- braço perto ----
    if not p.get('arm_back'):
        arm(p['anear'], hand_col=HAND)

    # item na mão
    it = p.get('item')
    if it:
        ix, iy = p['anear']
        iy -= 5
        if it == 'coin':
            F.part(ell(ix + 1, iy, 3.2, 3.2), COIN, ol='#5a3a08', light=.35)
            F.px(ix + 1, iy, '#9a6a18')
        elif it == 'bolt':
            F.part(limb(ix - 2, iy + 3, ix + 3, iy - 2, 2.4) + ell(ix + 3, iy - 2, 2.6, 2.6), '#a8b0b8', ol='#2a3038', light=.35)
        elif it == 'can':
            F.part(poly((ix - 2, iy - 4), (ix + 3, iy - 4), (ix + 3, iy + 3), (ix - 2, iy + 3)), '#b8bcc0',
                   marks=[(poly((ix - 2, iy - 2), (ix + 3, iy - 2), (ix + 3, iy + 1), (ix - 2, iy + 1)), RED)],
                   ol='#2a2a30', light=.35)


# ---------------- poses ----------------

def base(**kw):
    p = dict(bx=56, by=95, br=-6, hx=81, hy=79, hr=0,
             fnear=(47, G), ffar=(52, G), anear=(70, G), afar=(75, G),
             ta=195, tk=16, tw=0, eyes='open', mouth='closed', tuft=1.0)
    p.update(kw)
    return p


def shift_pose(p, dx=0, dy=0):
    q = dict(p)
    for k in ('bx', 'hx'):
        q[k] += dx
    for k in ('by', 'hy'):
        q[k] += dy
    return q


SC, SCX = 1.2, 59.0


def t(x, y):
    return (SCX + (x - SCX) * SC, G + (y - G) * SC)


class SFrame(Frame):
    """Frame com escala global (desenho em coordenadas de projeto -> pixels finais).
    raw=True desliga a escala (usado nos olhos e efeitos)."""

    def __init__(self):
        super().__init__()
        self.raw = False

    def T(self, x, y):
        return (SCX + (x - SCX) * SC, G + (y - G) * SC)

    def mask(self, shapes):
        if not self.raw:
            shapes = [[self.T(x, y) for x, y in p] for p in shapes]
        return Frame.mask(self, shapes)

    def px(self, x, y, col, layer=None, alpha=255):
        if not self.raw:
            x, y = self.T(x, y)
        Frame.px(self, x, y, col, layer, alpha)

    def line(self, x0, y0, x1, y1, col, layer=None):
        if not self.raw:
            x0, y0 = self.T(x0, y0); x1, y1 = self.T(x1, y1)
        r, self.raw = self.raw, True
        Frame.line(self, x0, y0, x1, y1, col, layer)
        self.raw = r


def render(p, dx=0, dy=0, tint=None, rotate=None, shc=None, shr=30, fx=None, alpha=1.0):
    F = SFrame()
    draw(F, p)
    if fx:
        F.raw = True
        fx(F)
        F.raw = False
    cx = shc if shc is not None else SCX + (p['bx'] + 4 - SCX) * SC + dx
    return compose(F, dx=dx, dy=dy, tint=tint, alpha=alpha, shadow=shadow_layer(cx, shr), rotate=rotate)


def idle():
    out = []
    for i in range(4):
        b = [0, .6, 1, .6][i]
        p = base(by=95 + b, hy=79 + b * 1.2, hr=[0, -2, -3, -1][i], tk=16 + [0, 2, 4, 2][i], tw=[0, 1, 2, 1][i],
                 eyes='closed' if i == 2 else 'open', tuft=1.0 + .04 * b)
        out.append(render(p))
    return out


def walk():
    out = []
    for i in range(8):
        ph = i / 8 * 2 * math.pi
        bob = -abs(math.sin(ph)) * 3      # saltitante
        def foot(off, x0, st=7):
            s = math.cos(ph + off)
            lift = max(0, math.sin(ph + off)) * 5
            return (x0 - s * st, G - lift)   # pata no ar avança
        fn = foot(0, 48); ff = foot(math.pi * .25, 52)
        an = foot(math.pi, 72); af = foot(math.pi * 1.25, 76)
        p = base(by=94 + bob, hy=78 + bob * 1.1, br=-6 + math.sin(ph) * 3, hr=math.sin(ph) * 2,
                 fnear=fn, ffar=ff, anear=an, afar=af,
                 ta=200 - math.sin(ph) * 8, tk=15 + math.cos(ph) * 4)
        out.append(render(p))
    return out


def attack():
    out = []
    # 0 alerta, 1 antecipação (recua + braço erguido), 2 bote, 3 impacto, 4 segue, 5 volta
    P0 = base(eyes='angry')
    P1 = base(bx=52, by=93, br=-18, hx=75, hy=75, hr=-12, anear=(62, 62), arm_back=True, al=24, afar=(70, G), fnear=(45, G), ffar=(50, G),
              eyes='angry', mouth='open', ta=210, tk=20, tuft=1.15)
    P2 = base(bx=60, by=94, br=-4, hx=86, hy=79, hr=6, anear=(99, 94), afar=(78, G), fnear=(50, G), ffar=(54, G),
              eyes='angry', mouth='open', ta=190, tk=10)
    P3 = base(bx=62, by=95, br=0, hx=88, hy=81, hr=8, anear=(100, 98), afar=(80, G), fnear=(51, G), ffar=(55, G),
              eyes='angry', mouth='open', ta=185, tk=8)
    P4 = base(bx=60, by=95, br=-3, hx=85, hy=80, hr=4, anear=(92, 106), afar=(77, G), fnear=(50, G), ffar=(54, G),
              eyes='angry', ta=192, tk=12)
    P5 = base(eyes='open', tk=18)
    def fx1(F):
        arcs(F, *t(98, 66), 2)
    def fx2(F):
        for k in range(3):
            F.line(*t(101, 86 + k * 4), *t(106, 87 + k * 4), '#f4efe6', layer=F.fx)
    def fx3(F):
        impact(F, *t(104, 96), 8)
        for k in range(3):
            F.line(*t(96 + k * 3, 86 + k), *t(100 + k * 3, 94 + k), '#c9343a', layer=F.fx)
    out.append(render(P0))
    out.append(render(P1, fx=fx1))
    out.append(render(P2, fx=fx2))
    out.append(render(P3, fx=fx3))
    out.append(render(P4))
    out.append(render(P5))
    return out


def hurt():
    p0 = base(eyes='wide', mouth='open')
    p1 = base(bx=52, by=94, br=-14, hx=74, hy=77, hr=-16, eyes='closed', mouth='open', anear=(74, 104), afar=(76, G),
              fnear=(46, G), ffar=(50, G), ta=215, tk=24, tuft=1.15)
    p2 = base(bx=53, by=95, br=-10, hx=76, hy=78, hr=-10, eyes='closed', mouth='wavy', fnear=(46, G), ffar=(50, G),
              anear=(72, G), ta=205, tk=20)
    p3 = base(eyes='open', hr=-3)
    return [render(p0, tint='flash'), render(p1, dx=-4, shc=54), render(p2, dx=-2, shc=55), render(p3)]


def death():
    out = []
    p0 = base(eyes='wide', mouth='open')
    out.append(render(p0, tint='flash'))
    p1 = base(bx=52, by=93, br=-16, hx=74, hy=76, hr=-18, eyes='closed', mouth='open', fnear=(44, G), ffar=(49, G),
              anear=(73, 103), afar=(76, G), ta=220, tk=24, tuft=1.1)
    out.append(render(p1, dx=-3, shc=53))
    p2 = base(bx=55, by=97, br=4, hx=79, hy=84, hr=16, eyes='spiral', mouth='wavy', fnear=(48, G), ffar=(53, G),
              anear=(76, G), afar=(80, G), ta=185, tk=8, tw=3)
    def st2(F):
        star(F, *t(86, 64), r=3)
    out.append(render(p2, fx=st2))
    # 3 queda: corpo baixo, cabeça tombando
    p3 = base(bx=56, by=103, br=6, hx=80, hy=97, hr=18, arm_back=True, eyes='spiral', mouth='wavy',
              fnear=(40, G), ffar=(45, G), anear=(88, G), afar=(92, G), ta=178, tk=4, tuft=.95)
    def d3(F):
        dust(F, *t(40, 110), 3); dust(F, *t(92, 110), 3)
    out.append(render(p3, fx=d3))
    # 4 quica e espalha
    lay = dict(bx=55, by=104, br=3, hx=81, hy=98, hr=8, arm_back=True, eyes='x', mouth='wavy',
               fnear=(33, G), ffar=(38, G), anear=(95, G), afar=(98, G), ta=178, tk=6, tuft=.95)
    p4 = base(**dict(lay, by=103, hy=97))
    out.append(render(p4))
    p5 = base(**lay)
    def st5(F):
        star(F, *t(70, 82), r=3); star(F, *t(84, 78), col='#f8e070', r=2); star(F, *t(96, 82), r=3)
        F.px(*t(77, 79), '#fff6c8', F.fx); F.px(*t(90, 79), '#fff6c8', F.fx)
    out.append(render(p5, fx=st5))
    return out


def special():
    out = []
    # sentado: corpo inclinado para cima, mãos no chão à frente
    sit = dict(bx=54, by=96, br=-30, hx=76, hy=74, hr=10, fnear=(52, G), ffar=(56, G), ta=190, tk=14)
    p0 = base(**dict(sit, anear=(70, 104), afar=(74, 104), eyes='open'))
    out.append(render(p0))
    def dig(F, a, b):
        dust(F, *t(a, 109), 2.5); dust(F, *t(b, 108), 2)
        F.px(*t(a + 4, 102), '#9c8a70', F.fx); F.px(*t(b - 3, 100), '#7a6a52', F.fx)
    p1 = base(**dict(sit, hr=22, hy=76, anear=(78, G - 1), afar=(73, G - 4), eyes='happy', mouth='smile'))
    out.append(render(p1, fx=lambda F: dig(F, 82, 74)))
    p2 = base(**dict(sit, hr=22, hy=76, anear=(72, G - 4), afar=(80, G - 1), eyes='happy', mouth='smile'))
    out.append(render(p2, fx=lambda F: dig(F, 76, 86)))
    p3 = base(**dict(sit, hr=12, anear=(80, 100), afar=(76, G - 2), eyes='wide', mouth='open', item='bolt', tuft=1.1))
    def f3(F):
        sparkle(F, *t(86, 92), 2)
        bubble(F, '!', *t(88, 58))
    out.append(render(p3, fx=f3))
    p4 = base(**dict(sit, bx=58, br=-34, hx=70, hy=70, hr=-12, al=28, anear=(94, 84), afar=(78, 104), eyes='happy', mouth='open', item='coin', tuft=1.15))
    def f4(F):
        sparkle(F, *t(98, 72), 4); sparkle(F, *t(88, 70), 2); sparkle(F, *t(102, 82), 2)
    out.append(render(p4, fx=f4))
    p5 = base(**dict(sit, bx=58, br=-34, hx=70, hy=71, hr=-8, al=28, anear=(93, 85), afar=(78, 104), eyes='happy', mouth='smile', item='coin', tk=20, tuft=1.1))
    def f5(F):
        sparkle(F, *t(100, 74), 3); sparkle(F, *t(86, 66), 2)
        star(F, *t(104, 80), r=2)
    out.append(render(p5, fx=f5))
    return out


def build():
    return {'idle': idle(), 'walk': walk(), 'attack': attack(), 'hurt': hurt(), 'death': death(), 'special': special()}


DOC = {
    "id": "sagui",
    "nome": "Sagui",
    "sub": "de tufo branco",
    "conceito": ("Um sagui-de-tufos-brancos pequeno, curioso e de mãos rápidas, que nunca deixa um contêiner sem revirar. "
                 "Cabeça grande e expressiva com dois leques de pelo branco nas orelhas, cara escura com olhos castanhos brilhantes, "
                 "corpo cinza-acastanhado listrado e uma cauda longa anelada que se curva atrás dele; leva a tiracolo uma "
                 "pochete de lona remendada onde guarda o que acha na noite da Lua de Sangue."),
    "partes": [
        {"parte": "Cabeça", "descricao": "Elipse grande de ~25x23 px (quase do tamanho do tronco), cinza-acastanhada, com o alto da cabeça mais escuro (#5a5048). Gira até ±16° para olhar, recuar e tombar; textura de pelo pontilhada."},
        {"parte": "Cara e mancha da testa", "descricao": "Máscara facial marrom-escura (#3b2d27) de ~16x17 px ocupando a frente da cabeça; acima dos olhos, uma mancha branca em losango (#f4f0e6) de ~5x6 px, marca típica da espécie."},
        {"parte": "Olhos", "descricao": "Dois olhos castanho-âmbar (#6a3a1c) em visão 3/4: o de perto com raio 2 px e o de longe com 1 px, ambos com pupila escura e brilho branco no canto superior esquerdo. Viram linhas fechadas ao piscar/levar dano, ^ ^ quando feliz, espiral ao cambalear e X no desmaio (sobre um aro claro #9a7a66 para ler bem contra a cara escura)."},
        {"parte": "Tufos das orelhas", "descricao": "Dois leques de pelo branco (#f1ede4) bem grandes: o tufo de perto (~16x18 px) sai da lateral da cabeça para trás e para cima, com sombra cinza (#c9c3b8) no meio; o de longe aparece atrás da cabeça, mais acinzentado. Abrem uns 10–15% quando ele se assusta ou se empolga."},
        {"parte": "Focinho e boca", "descricao": "Focinho curto e escuro (#2a1f1b) de ~8x7 px projetado à frente, com narina de 2 px. A boca alterna entre traço fechado, sorriso, boca aberta vermelha com dois dentinhos brancos (guincho) e linha ondulada (tonto)."},
        {"parte": "Corpo", "descricao": "Tronco oval de ~34x21 px, horizontal e levemente inclinado para frente (quadrúpede), cinza-acastanhado (#8a7e70) com barriga/peito claros (#b4a894). Sobe e desce no passo saltitante e inclina até -34° quando senta."},
        {"parte": "Braços e mãos", "descricao": "Braços finos de dois segmentos com cotovelo para trás, o de perto em tom claro e o de longe mais escuro; mãos pequenas marrom-escuras (#3a2e28) de ~5x4 px. São as 'mãos rápidas': arranham, remexem a terra e erguem os achados."},
        {"parte": "Pernas e pés", "descricao": "Coxa traseira redonda e cheia (~16x15 px), canela fina com joelho dobrado e pés compridos e escuros apoiados em y=112. As pernas do lado longe são mais escuras para dar profundidade."},
        {"parte": "Cauda", "descricao": "Cauda longa (~50 px) feita de 11 segmentos que afinam de 6 para 3 px, com anéis alternados cinza-claro (#9a948c) e quase pretos (#2e2a28) e ponta escura. Curva-se em arco para trás e para cima, enrola mais na respiração e balança no passo."},
        {"parte": "Pelagem e marcas", "descricao": "Pontilhado de pelo em todas as partes, luz de lua no topo-esquerda e sombra roxa embaixo-direita. Seis listras transversais escuras (#5a5048) atravessam o dorso como no sagui real."},
        {"parte": "Acessório: pochete a tiracolo", "descricao": "Alça de couro marrom (#5c3d26) cruzando o peito na diagonal até uma pochete de lona cáqui (#7a6e44) de ~15x12 px na barriga, logo à frente da coxa, com aba mais escura, botão de latão e um remendo vermelho-sangue (#b0303a) costurado."},
        {"parte": "Silhueta e pose", "descricao": "Leitura imediata pelo 'leque' branco dos tufos sobre uma cabeça enorme, corpo baixo de quatro patas e a cauda anelada em arco. Ocupa ~80 px de largura (da ponta da cauda ao focinho), virado para a direita em 3/4."}
    ],
    "paleta": [
        {"nome": "Pelo cinza-acastanhado", "hex": "#8a7e70"},
        {"nome": "Listras do dorso", "hex": "#5a5048"},
        {"nome": "Peito claro", "hex": "#b4a894"},
        {"nome": "Cara escura", "hex": "#3b2d27"},
        {"nome": "Tufo branco", "hex": "#f1ede4"},
        {"nome": "Anel claro da cauda", "hex": "#9a948c"},
        {"nome": "Anel escuro da cauda", "hex": "#2e2a28"},
        {"nome": "Íris âmbar", "hex": "#6a3a1c"},
        {"nome": "Lona da pochete", "hex": "#7a6e44"},
        {"nome": "Remendo sangue", "hex": "#b0303a"}
    ],
    "animacoes": {
        "idle": "4 quadros em quatro patas: o corpo sobe e desce ~1 px na respiração, a cabeça vira levemente para cima (0 a -3°), a cauda enrola um pouco mais e balança; no quadro 2 ele pisca.",
        "walk": "8 quadros de galope saltitante: pares diagonais de patas avançam/recuam em ciclo (pata levantada até 5 px), o corpo dá dois pulinhos de ~3 px por ciclo, inclina ±3° e a cauda ondula em contrafase.",
        "attack": "0: encara de sobrancelha franzida; 1 (antecipação longa): recua e empina, ergue a mão de perto acima da cabeça, tufos abertos e guincho com ondas de som; 2: dá o bote para frente com traços de velocidade; 3: tapa/arranhão para baixo com explosão de impacto e três riscos vermelhos; 4: mão termina no chão; 5: volta à pose normal.",
        "hurt": "0: lampejo branco com olhos arregalados; 1: é jogado 4 px para trás, empinado, olhos fechados e boca aberta, tufos arrepiados; 2: ainda recuado, boca ondulada; 3: recupera a pose e olha para frente.",
        "death": "Desmaio: 0 lampejo branco; 1 cambaleia para trás de olhos fechados; 2 tomba para frente com olhos em espiral e uma estrelinha; 3 desaba de barriga com poeira dos dois lados; 4 quica rente ao chão, braços e pernas esparramados; 5 (600 ms) deitado de bruços com olhos em X e três estrelinhas girando sobre a cabeça.",
        "special": "Vasculhar: 0 senta e põe as mãos no chão; 1 e 2 remexe alternando as mãos rápidas, com poeirinha e pedrinhas voando, olhos ^ ^; 3 acha um parafuso, olhos arregalados e balão '!'; 4 ergue uma moeda dourada acima da cabeça com brilhos; 5 segura a moeda, sorri satisfeito com brilho e estrelinha."
    },
    "especial": "Vasculhar",
    "eventos": {
        "idle": {"0": "respira"},
        "walk": {"0": "passo", "4": "passo"},
        "attack": {"1": "guincho", "3": "impacto"},
        "hurt": {"0": "dano"},
        "death": {"0": "dano", "3": "queda"},
        "special": {"1": "remexer", "2": "remexer", "3": "achado", "4": "brilho"}
    }
}


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = build()
    img = sheet(rows)
    img.save(os.path.join(OUT, 'sagui.png'))
    with open(os.path.join(OUT, 'sagui.json'), 'w', encoding='utf-8') as f:
        json.dump(DOC, f, ensure_ascii=False, indent=2)
    return img


if __name__ == '__main__':
    im = main()
    print('ok', im.size)
