"""Grupo fogueira: fog_niveis, fog_chama, fog_luz, fog_itens, fog_obra.
Rodar de dentro de tools/:  python obj_fogueira.py
"""
import os
import sys
import math
import random
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, rot, mv, hexc, mix, shadow_layer, over, glow, strip, grid,
                    sparkle, star, plus, impact)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

W, H = 128, 160
GY = 148
CX = 64.0
RO, ROY = 34.0, 13.0          # raio externo do anel
RI, RIY = 26.0, 9.0           # raio interno
CY = GY - ROY                  # centro do anel no chão (136)

FIRE = dict(red='#c8321e', ol='#5a1208', org='#f07a1e', yel='#ffc93a', wht='#fff4c8', glow='#ff9a3a')
MOONF = dict(red='#8a0f1e', ol='#2e0410', org='#c8323a', yel='#ff5a5a', wht='#ffd0d0', glow='#ff3a4a')

BARK, BARK2, BARKD = '#6b4426', '#57361e', '#3e2614'
CORE, RING = '#c8955a', '#8a5a30'
CHAR = '#2a1a12'
SOOT = '#2a2228'


def col(c):
    return hexc(c) if isinstance(c, str) else np.array(c, float)


def arc(a0, a1, rx, ry, dy=0.0, n=24, cx=CX, cy=CY):
    return [(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n) + dy)
            for i in range(n + 1)]


def epos(a, rx=RO, ry=ROY, dy=0.0):
    return (CX + rx * math.cos(a), CY + ry * math.sin(a) + dy)


# ============================================================ camadas / luz

class Scene:
    """F.a = fundo (atrás da chama), FL = chama, FR = frente, HZ = brilho, F.fx = efeitos."""

    def __init__(self, w=W, h=H):
        self.F = Frame(w, h)
        self.FL = self.F.layer()
        self.FR = self.F.layer()
        self.HZ = self.F.layer()
        self.GL = self.F.layer()
        self.SM = self.F.layer()
        self.w, self.h = w, h

    def compose(self, shadow=None):
        out = np.zeros((self.h, self.w, 4), np.uint8)
        if shadow is not None:
            out = over(out, shadow)
        out = over(out, self.GL)
        out = over(out, self.F.a)
        out = over(out, self.FL)
        out = over(out, self.FR)
        sm = self.SM.copy()
        sm[..., 3] = (sm[..., 3] * .62).astype(np.uint8)
        out = over(out, sm)
        out = over(out, self.HZ)
        out = over(out, self.F.fx)
        return out


def warm(L, cx, cy, r, c, k, ry=None):
    """luz quente quantizada sobre pixels já desenhados (reflexo do fogo)."""
    if k <= 0:
        return
    h, w = L.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    ry = ry or r
    d = np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / ry) ** 2)
    s = np.clip(1 - d, 0, 1)
    s = np.round(s * 4) / 4 * k
    m = (L[..., 3] > 0) & (s > 0)
    L[m, :3] = np.clip(mix(L[m, :3].astype(float), col(c), s[m][:, None]), 0, 255)


def ground_glow(L, cx, cy, rx, ry, c, amax=110, steps=5):
    h, w = L.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    s = np.clip(1 - d, 0, 1)
    s = np.ceil(s * steps) / steps
    src = np.zeros_like(L)
    src[..., :3] = col(c)
    src[..., 3] = (s * amax).astype(np.uint8)
    L[:] = over(L, src)


# ============================================================ chama

def tongue(cx, by, w, h, lean, wob):
    if h < 2 or w < 1:
        return []
    n = max(8, int(h / 1.5))
    L, R = [], []
    for i in range(n + 1):
        t = i / n
        hw = (w / 2) * (math.sin(math.pi * min(1.0, t ** 0.55)) ** 0.75) if t < 1 else 0
        x = cx + lean * t * t + wob * math.sin(t * 3.2) * t
        y = by - t * h
        L.append((x - hw, y))
        R.append((x + hw, y))
    pts = [(cx, by + w * .22)] + L + R[::-1]
    return [pts]


TONGUES = [(-.40, .42, .27, 1, .0), (-.21, .72, .34, 2, 1.3), (0.0, 1.0, .40, 1, 2.1),
           (.21, .64, .34, 2, 3.7), (.40, .38, .27, 1, 4.9)]


def flame(S, cx, by, Hh, Ww, t, pal=FIRE, layer=None, bits=True, white=True, tn=4.0):
    """5 línguas, 4 camadas nítidas. t = quadro (ciclo de tn quadros)."""
    if Hh <= 0:
        return
    L = S.FL if layer is None else layer
    F = S.F
    ph = 2 * math.pi * t / tn
    sway = 1.6 * math.sin(ph) * min(1, Hh / 30)
    layers = [(1.0, 1.0, 'red'), (.78, .72, 'org'), (.52, .50, 'yel'), (.28, .30, 'wht')]
    for li, (hs, ws, key) in enumerate(layers):
        if key == 'wht' and not white:
            continue
        shapes = []
        for k, (ox, hf, wf, fq, p0) in enumerate(TONGUES):
            if key == 'wht' and abs(ox) > .2:
                continue
            fl = 1 + .16 * math.sin(ph * fq + p0) + .06 * math.sin(ph * (fq + 1) + p0 * 2)
            h = Hh * hf * fl * hs
            w = Ww * wf * ws * (1 + .05 * math.cos(ph * fq + p0))
            x = cx + ox * Ww * (1 - (1 - ws) * .3)
            lean = -ox * Ww * .22 + sway * (1 + abs(ox))
            wob = 1.2 * math.sin(ph * fq + p0 + 1) * min(1, Hh / 25)
            shapes += tongue(x, by, w, h, lean, wob)
        if key != 'wht':
            shapes += ell(cx, by - Ww * .1 * ws, Ww * .5 * ws, Ww * .2 * ws)
        if key == 'red':
            F.part(shapes, pal['red'], shade=False, ol=pal['ol'], layer=L)
        else:
            F.flat(shapes, pal[key], layer=L)
    # gotinhas soltas acima da ponta
    if bits and Hh > 26:
        rnd = random.Random(int(t) * 7 + int(Hh))
        for k in range(1 if Hh < 45 else 2):
            yy = by - Hh * (1.02 + .12 * rnd.random()) - k * 6
            xx = cx + (rnd.random() - .5) * Ww * .5 + sway * 2
            sh = tongue(xx, yy, 3.2, 6, 0, 0)
            F.part(sh, pal['red'], shade=False, ol=pal['ol'], layer=L)
            F.flat(tongue(xx, yy, 1.6, 3.5, 0, 0), pal['org'], layer=L)


def embers(S, cx, by, Hh, Ww, t, n, pal=FIRE, rise=70, seed=3, tn=4.0):
    F = S.F
    rnd = random.Random(seed)
    for i in range(n):
        u = rnd.random()
        sp = .25 if rnd.random() < .6 else .5
        phase = (t / tn * (1 if sp == .25 else 2) + u) % 1.0
        x0 = cx + (rnd.random() - .5) * Ww * .9
        y = by - Hh * .55 - phase * rise
        x = x0 + 3 * math.sin(phase * 7 + i) + (x0 - cx) * phase * .5
        if phase < .3:
            c = pal['wht'] if rnd.random() < .3 else pal['yel']
        elif phase < .65:
            c = pal['org']
        else:
            c = pal['red']
        F.px(x, y, c, F.fx)
        if rnd.random() < .45 and phase < .6:
            F.px(x, y + 1, pal['red'] if phase > .3 else pal['org'], F.fx)


def smoke(S, cx, cy, t, n=3, scale=1.0, c='#8a8494', seed=5, rise=50, tn=4.0, drift=6):
    F = S.F
    rnd = random.Random(seed)
    for i in range(n):
        u = (t / tn + i / n + rnd.random() * .1) % 1.0
        r = (2.0 + u * 4.5) * scale
        x = cx + math.sin(u * 5 + i) * 3 + u * drift * 2
        y = cy - u * rise
        cc = mix(col(c), col('#5a5468'), u * .6)
        sh = ell(x, y, r, r * .8) + ell(x - r * .7, y + r * .35, r * .6, r * .5) + ell(x + r * .7, y + r * .3, r * .6, r * .5)
        F.part(sh, cc, ol='#5a5468', layer=S.SM, light=.35, dark=.2, tex=.15)
        F.px(x - r * .4, y - r * .4, '#c8c2d0', S.SM)


def thin_smoke(S, cx, cy, t, length=46, seed=1, tn=4.0):
    """fio de fumaça fina ondulando."""
    F = S.F
    ph = 2 * math.pi * t / tn
    for i in range(length):
        y = cy - i
        x = cx + math.sin(i * .18 - ph) * (1 + i * .09) + i * .08
        c = '#a8a2b0' if i < length * .5 else '#7a7488'
        if i > length * .75 and (i + t) % 3 == 0:
            continue
        F.px(x, y, c, S.SM)
        if 8 < i < length * .6:
            F.px(x + 1, y, '#6a6478', S.SM)


# ============================================================ lenha / carvão

def fire_log(F, L, x0, y0, x1, y1, w=6, burn=1.0, cold=False, seed=0):
    rnd = random.Random(seed)
    bark = '#4a4448' if cold else BARK
    marks = []
    for k in range(4):
        t = .15 + k * .2
        px, py = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        marks.append((limb(px - 2, py + rnd.uniform(-1, 1), px + 3, py + rnd.uniform(-1, 1), 1), '#3a2a2c' if cold else BARKD))
    # ponta de cima carbonizada
    marks.append((limb(x0 + (x1 - x0) * .55, y0 + (y1 - y0) * .55, x1, y1, w + 2), '#2e2a2e' if cold else CHAR))
    F.part(limb(x0, y0, x1, y1, w), bark, marks=marks, tex=.3, light=.25, layer=L)
    # ponta cortada (anéis)
    r = w / 2
    cc = '#6a6468' if cold else CORE
    F.part(ell(x0, y0, r * .8, r), cc, marks=[(ell(x0, y0, r * .5, r * .62), '#4a4448' if cold else RING),
                                               (ell(x0, y0, r * .22, r * .3), cc)], layer=L, light=.3)
    # rachas acesas na parte queimada
    if not cold and burn > 0:
        for k in range(3):
            t = .62 + k * .12
            px, py = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            c = '#ffc93a' if burn > .7 and k == 1 else ('#f07a1e' if burn > .35 else '#c8321e')
            F.px(px, py, c, L)
            F.px(px + 1, py, '#c8321e', L)
    elif cold:
        for k in range(3):
            t = .62 + k * .12
            F.px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, '#8a8488', L)


def coal_bed(F, L, cx, cy, rx, ry, k=1.0, t=0, cold=False, seed=2):
    base = '#3a3436' if cold else '#2a1a14'
    F.part(ell(cx, cy, rx, ry), base, tex=.35, light=.12, layer=L)
    rnd = random.Random(seed)
    puls = .75 + .25 * math.sin(2 * math.pi * t / 4)
    for i in range(int(rx * ry * .55)):
        a = rnd.random() * 2 * math.pi
        rr = math.sqrt(rnd.random()) * .9
        x, y = cx + rx * rr * math.cos(a), cy + ry * rr * math.sin(a)
        v = rnd.random()
        if cold:
            c = '#8a8488' if v < .35 else ('#5a5458' if v < .7 else None)
        else:
            e = v * k * puls * (1.25 - rr * .5)
            c = '#ffc93a' if e > .82 else ('#f07a1e' if e > .55 else ('#c8321e' if e > .28 else ('#4a2a1c' if v < .5 else None)))
        if c:
            F.px(x, y, c, L)


def logs_in_fire(F, L, cold=False, burn=1.0, t=0):
    fire_log(F, L, 44, 138, 70, 124, 7, burn, cold, 1)
    fire_log(F, L, 85, 139, 58, 124, 7, burn, cold, 2)
    fire_log(F, L, 53, 131, 78, 128, 6, burn, cold, 3)


# ============================================================ anéis por nível

def stone(F, L, x, y, rx, ry, c='#8e8a84', seed=0, moss=True, soot=0.0):
    rnd = random.Random(seed)
    pts = []
    n = 9
    for i in range(n):
        a = 2 * math.pi * i / n
        k = 1 + rnd.uniform(-.16, .12)
        pts.append((x + rx * k * math.cos(a), y + ry * k * math.sin(a) * (1.15 if math.sin(a) > 0 else 1)))
    marks = [(ell(x - rx * .3, y - ry * .35, rx * .35, ry * .25), mix(col(c), col('#d8d0c4'), .25))]
    if moss and rnd.random() < .5:
        marks.append((ell(x + rx * .2, y - ry * .5, rx * .35, ry * .2), '#5a6a3a'))
    if soot:
        marks.append((ell(x + rnd.uniform(-2, 2), y - ry * .2, rx * .7 * soot + 1, ry * .6 * soot + .5), SOOT))
    F.part([pts], c, marks=marks, tex=.4, layer=L)
    F.px(x + rx * .3, y + ry * .1, mix(col(c), col('#1a1418'), .5), L)


def ring_wall(S, h, top_c, face_c, inner_c, deco, dmg=False):
    """muro baixo em anel. deco(S, layer, which) desenha juntas/acabamento."""
    F = S.F
    # trás: topo + face interna
    F.part([arc(math.pi, 2 * math.pi, RO, ROY, -h) + arc(2 * math.pi, math.pi, RI, RIY, -h)], top_c, tex=.35, layer=F.a)
    F.part([arc(math.pi, 2 * math.pi, RI, RIY, -h) + arc(2 * math.pi, math.pi, RI, RIY, 0)], inner_c, tex=.35,
           light=.1, layer=F.a)
    deco(S, F.a, 'back', h)
    # frente: face externa + topo
    F.part([arc(0, math.pi, RO, ROY, -h) + arc(math.pi, 0, RO, ROY, 0)], face_c, tex=.35, layer=S.FR)
    F.part([arc(0, math.pi, RO, ROY, -h) + arc(math.pi, 0, RI, RIY, -h)], top_c, tex=.35, layer=S.FR)
    deco(S, S.FR, 'front', h)


def face_joints(F, L, h, courses, mortar, nseg, a0=0.0, a1=math.pi, stagger=True):
    """argamassa na face frontal: linhas horizontais + juntas verticais escalonadas."""
    ch = h / courses
    for c in range(1, courses):
        for i in range(160):
            a = a0 + (a1 - a0) * i / 159
            x, y = epos(a, dy=-h + c * ch)
            F.px(x, y, mortar, L)
    for c in range(courses):
        off = (.5 if (stagger and c % 2) else 0)
        for s in range(nseg + 1):
            a = a0 + (a1 - a0) * (s + off) / nseg
            if not (a0 + .05 < a < a1 - .05):
                continue
            x, y0 = epos(a, dy=-h + c * ch)
            for yy in range(int(round(y0)) + 1, int(round(y0 + ch))):
                F.px(x, yy, mortar, L)


def top_joints(F, L, h, mortar, nseg, half):
    a0, a1 = (0, math.pi) if half == 'front' else (math.pi, 2 * math.pi)
    for s in range(1, nseg):
        a = a0 + (a1 - a0) * s / nseg
        p0 = epos(a, RO - 1, ROY - .5, -h)
        p1 = epos(a, RI + 1, RIY + .5, -h)
        F.line(p0[0], p0[1], p1[0], p1[1], mortar, L)


def block_tint(F, L, h, nseg, courses, cols, seed, a0=0.0, a1=math.pi):
    """variação de cor por bloco na face frontal."""
    rnd = random.Random(seed)
    ch = h / courses
    for c in range(courses):
        off = .5 if c % 2 else 0
        for s in range(-1, nseg + 1):
            if rnd.random() < .45:
                continue
            aa = a0 + (a1 - a0) * (s + off + .2) / nseg
            ab = a0 + (a1 - a0) * (s + off + .8) / nseg
            aa, ab = max(a0, aa), min(a1, ab)
            if ab <= aa:
                continue
            pts = arc(aa, ab, RO - .5, ROY - .3, -h + c * ch + 1, 6) + arc(ab, aa, RO - .5, ROY - .3, -h + (c + 1) * ch - 1, 6)
            cc = cols[rnd.randrange(len(cols))]
            msk = F.mask([pts]) & (L[..., 3] > 0)
            L[msk, :3] = np.clip(mix(L[msk, :3].astype(float), col(cc), .55), 0, 255)


def cracks(F, L, seeds, cx_list, h, c='#140c10'):
    for k, cxp in enumerate(cx_list):
        rnd = random.Random(seeds + k)
        a = cxp
        x, y = epos(a, dy=-h + 1)
        for i in range(int(h) + 2):
            if L[int(min(max(y, 0), L.shape[0] - 1)), int(min(max(x, 0), L.shape[1] - 1)), 3] > 0:
                F.px(x, y, c, L)
            x += rnd.choice((-1, 0, 1))
            y += 1


def soot_layer(F, L, spots, seed=0, k=.65):
    rnd = random.Random(seed)
    for (x, y, rx, ry) in spots:
        m = F.mask(ell(x, y, rx, ry)) & (L[..., 3] > 0)
        hs = ((np.arange(L.shape[1])[None, :] * 7 + np.arange(L.shape[0])[:, None] * 13 + seed) % 5) > 0
        m &= hs | F.mask(ell(x, y, rx * .6, ry * .6))
        L[m, :3] = np.clip(mix(L[m, :3].astype(float), col(SOOT), k), 0, 255)


# ---------- N1: pedras soltas + sucata + lata

def level1(S, dmg, cold=False):
    F = S.F
    angs = [math.pi * (1.0 + i / 6) for i in range(7)]                    # trás
    sizes = [(6, 4.5), (5, 4), (6.5, 4.5), (5.5, 4), (6, 4.5), (5, 4), (6, 4.5)]
    cols_ = ['#8e8a84', '#77736e', '#9a948a', '#837e76']
    for i, a in enumerate(angs):
        if dmg and i == 2:
            continue
        x, y = epos(a, RO - 3, ROY - 1)
        stone(F, F.a, x, y - 2, sizes[i][0], sizes[i][1], cols_[i % 4], seed=10 + i, soot=.6 if dmg else 0)
    # grelha de arame + lata em cima de 2 pedras (direita-trás)
    if not dmg:
        stone(F, F.a, 92, 128, 5, 4, '#77736e', 31)
        F.part(poly((74, 123), (96, 123), (98, 127), (76, 127)), '#5a5654', shade=False, ol='#1e1a1a', layer=F.a)
        for xx in range(76, 98, 3):
            F.line(xx, 123, xx + 2, 127, '#2a2626', F.a)
        F.line(75, 125, 97, 125, '#8a8682', F.a)
        # lata (cilindro) aquecendo
        F.part(poly((80, 111), (90, 111), (90, 123), (80, 123)), '#9a9690',
               marks=[(poly((80, 115), (90, 115), (90, 119), (80, 119)), '#b5562e'),
                      (ell(83, 121, 3, 2), '#8a4e2e'), (ell(88, 113, 1.5, 1), '#8a4e2e')], tex=.2, layer=F.a)
        F.part(ell(85, 111, 5, 1.8), '#c9c3b0', marks=[(ell(85, 111.3, 3.6, 1), '#6a4a2a')], layer=F.a, light=.3)
        F.line(80, 117, 90, 117, '#e8c070', F.a)
    else:
        # lata caída amassada no chão (frente-direita)
        F.part(rot(poly((96, 142), (107, 142), (107, 149), (96, 149)), 101, 146, 18), '#8a8682',
               marks=[(rot(poly((99, 142), (102, 142), (102, 149), (99, 149)), 101, 146, 18), '#8a4e2e')], tex=.3, layer=S.FR)
        F.part(ell(95, 143, 1.8, 3.5, rot=18), '#5a5450', layer=S.FR)
    # chapa de sucata encostada (esquerda-trás)
    sh = poly((26, 112), (42, 116), (44, 134), (28, 136))
    if dmg:
        sh = poly((18, 136), (36, 132), (40, 144), (20, 148))
    F.part(sh, '#6b6a66', marks=[(ell(32, 120 if not dmg else 140, 4, 3), '#8a4e2e'), (ell(39, 129 if not dmg else 139, 2, 2), '#8a4e2e'),
                                 (poly((28, 124), (43, 126), (43, 127), (28, 125)), '#55544f')],
           tex=.25, layer=F.a if not dmg else S.FR)
    for (rx_, ry_) in ([(29, 115), (41, 118), (30, 133), (42, 131)] if not dmg else [(21, 137), (34, 134)]):
        F.px(rx_, ry_, '#c9c3b0', F.a if not dmg else S.FR)
    # brasa / leito / lenha
    coal_bed(F, F.a, CX, CY, 25, 8, k=.5 if dmg else 1, cold=cold)
    return lambda: level1_front(S, dmg, cold)


def level1_front(S, dmg, cold):
    F = S.F
    angs = [math.pi * i / 6 for i in range(1, 6)]
    sizes = [(6.5, 5), (7, 5), (7.5, 5.5), (7, 5), (6.5, 5)]
    cols_ = ['#8e8a84', '#9a948a', '#77736e', '#8e8a84', '#837e76']
    for i, a in enumerate(angs):
        x, y = epos(a, RO - 2, ROY - 1)
        if dmg and i == 1:
            x, y = 40, 152      # pedra rolou para fora
            stone(F, S.FR, x, y - 3, 6, 4.5, cols_[i], seed=50 + i, soot=.8)
            continue
        stone(F, S.FR, x, y - 3, sizes[i][0], sizes[i][1], cols_[i], seed=40 + i, soot=.7 if dmg else 0)
    for a in (0.0, math.pi):
        x, y = epos(a, RO - 2, ROY - 1)
        stone(F, S.FR, x, y - 3, 5.5, 4.5, '#77736e', seed=int(a * 10) + 60, soot=.5 if dmg else 0)
    # pedrinhas e sucata miúda no chão
    for (x, y) in ((22, 146), (104, 150), (14, 140)):
        F.part(ell(x, y, 2, 1.4), '#77736e', layer=S.FR)
    F.part(poly((100, 132), (110, 134), (108, 138), (99, 136)), '#6b6a66', marks=[(ell(104, 135, 2, 1), '#8a4e2e')], layer=F.a)


# ---------- N2: anel de tocos + bancos

def stump(F, L, x, y, w=7, h=9, seed=0, dmg=False, lying=False):
    rnd = random.Random(seed)
    c = ['#9a6a3c', '#7d5430', '#8b5e34'][seed % 3]
    if lying:
        F.part(limb(x - 6, y, x + 5, y - 1, w), c, marks=[(limb(x - 4, y - 1, x + 3, y - 2, 1), '#5a3a22'),
                                                         (limb(x - 2, y + 1, x + 4, y + 1, 1), '#5a3a22')], tex=.3, layer=L)
        F.part(ell(x - 6, y, w * .38, w * .5), CORE, marks=[(ell(x - 6, y, w * .22, w * .3), RING)], layer=L)
        F.part(ell(x - 6, y, w * .38, w * .5), mix(col(CORE), col(SOOT), .5), layer=L, clip=F.mask(ell(x - 7, y, 2, 4)))
        return
    hh = h + rnd.choice((-1, 0, 1))
    marks = [(poly((x - w / 2 + 2, y - hh), (x - w / 2 + 3, y - hh), (x - w / 2 + 3, y), (x - w / 2 + 2, y)), '#5a3a22'),
             (poly((x + 1, y - hh + 2), (x + 2, y - hh + 2), (x + 2, y - 1), (x + 1, y - 1)), '#5a3a22')]
    if dmg and rnd.random() < .6:
        marks.append((ell(x, y - hh * .6, w * .45, hh * .35), SOOT))
    F.part(poly((x - w / 2, y - hh), (x + w / 2, y - hh), (x + w / 2, y), (x - w / 2, y)) + ell(x, y, w / 2, 1.6), c,
           marks=marks, tex=.3, layer=L)
    F.part(ell(x, y - hh, w / 2, 2.2), CORE if not dmg else '#7a5a3a',
           marks=[(ell(x, y - hh, w * .3, 1.3), RING), (ell(x, y - hh, w * .1, .5), CORE)], layer=L, light=.3)
    if rnd.random() < .5:
        F.px(x + 1, y - hh + 3, '#c9c3b0', L)


def bench(F, L, x, y, dmg=False, flip=False, seed=0):
    """banco de tronco deitado (22 px) com 2 pés."""
    x0, x1 = (x - 9, x + 9)
    for fx in (x0 + 4, x1 - 4):
        F.part(poly((fx - 2, y - 2), (fx + 2, y - 2), (fx + 2, y + 5), (fx - 2, y + 5)), '#5a3a22', layer=L)
    marks = [(limb(x0 + 3, y - 2, x0 + 12, y - 2, 1), '#5a3a22'), (limb(x0 + 9, y + 1, x1 - 4, y + 1, 1), '#5a3a22'),
             (limb(x0 + 2, y - 3.2, x1 - 2, y - 3.2, 1.6), '#b07a48')]
    if dmg:
        marks.append((ell(x + (5 if flip else -5), y, 4, 3), SOOT))
    F.part(limb(x0, y, x1, y, 8), '#8b5e34', marks=marks, tex=.3, layer=L)
    ex = x1 if not flip else x0
    F.part(ell(ex, y, 3, 4), CORE, marks=[(ell(ex, y, 1.8, 2.5), RING), (ell(ex, y, .7, 1), CORE)], layer=L, light=.3)
    F.px(x0 + 6, y - 3, '#c9c3b0', L)
    F.px(x1 - 7, y - 3, '#c9c3b0', L)


def level2(S, dmg, cold=False):
    F = S.F
    bench(F, F.a, 16, 116, dmg, flip=True)
    bench(F, F.a, 112, 116, dmg)
    n = 12
    for i in range(n):
        a = 2 * math.pi * (i + .5) / n
        if math.sin(a) >= 0:
            continue
        x, y = epos(a, RO - 3, ROY - 1.5)
        stump(F, F.a, x, y, seed=i, dmg=dmg)
    coal_bed(F, F.a, CX, CY, 25, 8, k=.5 if dmg else 1, cold=cold)
    return lambda: level2_front(S, dmg)


def level2_front(S, dmg):
    F = S.F
    n = 12
    for i in range(n):
        a = 2 * math.pi * (i + .5) / n
        if math.sin(a) < 0:
            continue
        x, y = epos(a, RO - 3, ROY - 1.5)
        if dmg and i == 4:
            stump(F, S.FR, 32, 152, seed=i, lying=True)
            continue
        stump(F, S.FR, x, y + 1, seed=i, dmg=dmg)


# ---------- N3: pedra com argamassa + tripé/caldeirão

def deco_stone(S, L, which, h):
    F = S.F
    if which == 'front':
        block_tint(F, L, h, 7, 2, ['#9a958e', '#77736e', '#86817a'], 3)
        face_joints(F, L, h, 2, '#b8b0a0', 7)
        top_joints(F, L, h, '#b8b0a0', 6, 'front')
        for i in range(30):
            a = math.pi * i / 29
            x, y = epos(a, RO, ROY, -h)
            F.px(x, y, '#a8a298', L)
    else:
        top_joints(F, L, h, '#b8b0a0', 6, 'back')


def level3(S, dmg, cold=False):
    F = S.F
    h = 9
    ring_wall(S, h, '#8e8a84', '#77736e', '#5a5652', deco_stone, dmg)
    coal_bed(F, F.a, CX, CY - 1, 24, 7.5, k=.5 if dmg else 1, cold=cold)
    return lambda: level3_front(S, dmg, h)


def tripod(S, dmg=False):
    """tripé de 3 varas + caldeirão pendurado (camada FR = na frente da chama)."""
    F = S.F
    top = (64, 84)
    # perna de trás no fundo
    F.part(limb(top[0], top[1], 66, 126, 2.4), '#5a3a22', layer=F.a)
    for (bx, by) in ((36, 144), (92, 144)):
        if dmg and bx > 64:
            F.part(limb(top[0] + 2, top[1] + 2, 98, 140, 2.4), '#5a3a22', layer=S.FR)
            continue
        F.part(limb(top[0], top[1], bx, by, 2.6), '#7d5430', marks=[(limb(top[0], top[1], bx, by, .8), '#9a6a3c')], layer=S.FR)
    F.part(ell(64, 85, 3, 2.2), '#b59a62', marks=[(limb(61, 85, 67, 86, .8), '#8a7348')], layer=S.FR)
    # corrente
    for yy in range(87, 98, 2):
        F.px(64, yy, '#9aa0a6', S.FR)
        F.px(64, yy + 1, '#4a4e54', S.FR)
    # caldeirão
    cy = 103 if not dmg else 105
    F.part(ell(64, cy + 1, 9, 7.5) + poly((55, cy - 2), (73, cy - 2), (73, cy + 2), (55, cy + 2)), '#2a2a30',
           marks=[(ell(60, cy, 3, 3), '#45454e'), (ell(68, cy + 5, 3, 2), '#6a3a22'),
                  (ell(64, cy + 7, 6, 1.4), '#3a1e18')], tex=.2, layer=S.FR, light=.3)
    F.part(ell(64, cy - 2, 9.5, 2.6), '#3a3a44', marks=[(ell(64, cy - 1.6, 7.5, 1.6), '#5a7a3a' if not dmg else '#3a3436')],
           layer=S.FR, light=.35)
    if not dmg:
        F.px(62, cy - 2, '#8aac5a', S.FR)
        F.px(66, cy - 1, '#8aac5a', S.FR)
    F.line(56, cy - 3, 64, 96, '#6a6e74', S.FR)
    F.line(72, cy - 3, 64, 96, '#6a6e74', S.FR)


def level3_front(S, dmg, h):
    F = S.F
    tripod(S, dmg)
    if dmg:
        cracks(F, S.FR, 7, [.8, 2.1], h)
        # buraco: bloco faltando e caído
        a0, a1 = 1.35, 1.75
        pts = arc(a0, a1, RO, ROY, -h, 6) + arc(a1, a0, RO, ROY, -h / 2, 6)
        F.part([pts], '#241c20', shade=False, layer=S.FR, ol='#140c10')
        F.part(rot(poly((24, 145), (36, 145), (36, 151), (24, 151)), 30, 148, -14), '#8e8a84',
               marks=[(poly((24, 145), (36, 145), (36, 146), (24, 146)), '#b8b0a0')], tex=.4, layer=S.FR)
        F.part(ell(41, 152, 2.5, 1.5), '#77736e', layer=S.FR)


# ---------- N4: tijolo + metal rebitado + grelha + lampião

def deco_brick(S, L, which, h):
    F = S.F
    if which == 'front':
        block_tint(F, L, h, 11, 3, ['#b5523a', '#86351f', '#953c26'], 9)
        face_joints(F, L, h, 3, '#c9b8a0', 11)
        top_joints(F, L, h, '#c9b8a0', 9, 'front')
        # faixa de metal rebitado logo abaixo do topo
        F.part([arc(0, math.pi, RO + .3, ROY + .2, -h + 1) + arc(math.pi, 0, RO + .3, ROY + .2, -h + 3.5)], '#7d848c',
               shade=True, light=.35, layer=L, ol='#2a2e34')
        for s in range(1, 10):
            x, y = epos(math.pi * s / 10, RO + .3, ROY + .2, -h + 2)
            F.px(x, y, '#c9ced4', L)
            F.px(x + 1, y + 1, '#3a3e44', L)
    else:
        top_joints(F, L, h, '#c9b8a0', 9, 'back')


def level4(S, dmg, cold=False):
    F = S.F
    h = 10
    ring_wall(S, h, '#a5432e', '#86351f', '#5a2a1c', deco_brick, dmg)
    coal_bed(F, F.a, CX, CY - 1, 24, 7.5, k=.5 if dmg else 1, cold=cold)
    lamppost(S, dmg)
    return lambda: level4_front(S, dmg, h)


def lamppost(S, dmg):
    F = S.F
    x = 112
    F.part(poly((x - 2, 76), (x + 2, 76), (x + 2, 146), (x - 2, 146)), '#4a4e54',
           marks=[(poly((x - 1, 78), (x, 78), (x, 144), (x - 1, 144)), '#7d848c')], layer=F.a)
    F.part(poly((x - 5, 142), (x + 5, 142), (x + 6, 148), (x - 6, 148)), '#3a3e44', layer=F.a)
    for yy in (100, 124):
        F.px(x + 1, yy, '#c9ced4', F.a)
    # braço + gancho
    F.part(limb(x, 78, x - 13, 78, 2.4), '#4a4e54', layer=F.a)
    F.line(x - 13, 79, x - 13, 82, '#2a2e34', F.a)
    lx, ly = x - 13, 90
    if dmg:
        lx, ly = x - 13, 92
    # lampião
    F.part(poly((lx - 4, ly - 7), (lx + 4, ly - 7), (lx + 2, ly - 10), (lx - 2, ly - 10)), '#5a5e64', layer=F.a)
    F.part(ell(lx, ly - 11, 1.6, 1.4), '#5a5e64', layer=F.a)
    glass = '#ffd36a' if not dmg else '#c89a3a'
    F.part(poly((lx - 4, ly - 7), (lx + 4, ly - 7), (lx + 4, ly + 4), (lx - 4, ly + 4)), glass,
           marks=[(ell(lx, ly - 1, 1.6, 2.6), '#fff4c8' if not dmg else '#ffd36a'),
                  (poly((lx - 1, ly - 7), (lx, ly - 7), (lx, ly + 4), (lx - 1, ly + 4)), '#8a6a2a')],
           shade=False, layer=F.a, ol='#2a2620')
    if dmg:
        F.line(lx + 1, ly - 6, lx + 3, ly + 2, '#3a2a1a', F.a)
    F.part(poly((lx - 5, ly + 4), (lx + 5, ly + 4), (lx + 4, ly + 7), (lx - 4, ly + 7)), '#5a5e64', layer=F.a)
    glow(F, lx, ly - 1, 18 if not dmg else 11, '#ffd36a', alpha=110 if not dmg else 70, layer=S.HZ)


def grill(S, h, dmg):
    F = S.F
    y0 = CY - h
    L = S.FR
    for k in range(-3, 4):
        yy = y0 + k * 2.4
        q = 1 - (k * 2.4 / RIY) ** 2
        if q <= 0:
            continue
        hw = RI * math.sqrt(q) - 1
        if dmg and k == 1:
            F.line(CX - hw, yy, CX + 4, yy + 3, '#3a3e44', L)
            continue
        F.line(CX - hw, yy + 1, CX + hw, yy + 1, '#2a2e34', L)
        F.line(CX - hw, yy, CX + hw, yy, '#8d969c', L)
    for sx in (-12, 12):
        for k in range(-7, 8):
            F.px(CX + sx + k * .25, y0 + k, '#4a4e54', L)
        F.px(CX + sx - 1.5, y0 - 6, '#c9ced4', L)
        F.px(CX + sx + 1.5, y0 + 6, '#c9ced4', L)


def level4_front(S, dmg, h):
    F = S.F
    grill(S, h, dmg)
    if dmg:
        cracks(F, S.FR, 11, [.6, 1.9, 2.6], h)
        a0, a1 = 1.1, 1.45
        pts = arc(a0, a1, RO, ROY, -h + 4, 6) + arc(a1, a0, RO, ROY, -2, 6)
        F.part([pts], '#241c20', shade=False, layer=S.FR, ol='#140c10')
        for i, (x, y, r) in enumerate(((26, 149, -12), (36, 152, 20))):
            F.part(rot(poly((x - 5, y - 2.5), (x + 5, y - 2.5), (x + 5, y + 2.5), (x - 5, y + 2.5)), x, y, r), '#a5432e',
                   marks=[(rot(poly((x - 5, y - 2.5), (x + 5, y - 2.5), (x + 5, y - 1.5), (x - 5, y - 1.5)), x, y, r), '#c9b8a0')],
                   tex=.3, layer=S.FR)
        # chapa de metal solta
        F.part(poly((86, 150), (100, 147), (102, 151), (88, 154)), '#7d848c', marks=[(ell(94, 151, 2, 1), '#8a4e2e')], layer=S.FR)
        F.px(89, 151, '#c9ced4', S.FR)


# ---------- N5: pedra lunar + dourado + runas

RUNES = [["010", "111", "010", "010"], ["101", "010", "101", "010"], ["110", "011", "110", "011"],
         ["111", "101", "010", "111"], ["010", "101", "111", "100"]]


def deco_moon(S, L, which, h):
    F = S.F
    if which == 'front':
        block_tint(F, L, h, 6, 2, ['#3c3446', '#262030', '#342c3e'], 21)
        face_joints(F, L, h, 2, '#1c1822', 6)
        top_joints(F, L, h, '#b8861a', 5, 'front')
        # frisos dourados (topo e base)
        for i in range(120):
            a = math.pi * i / 119
            x, y = epos(a, RO, ROY, -h)
            F.px(x, y, '#f2c230', L)
            F.px(x, y + 1, '#b8861a', L)
            x, y = epos(a, RO, ROY, -1)
            F.px(x, y, '#b8861a', L)
        for i in range(60):
            a = math.pi * i / 59
            x, y = epos(a, RI, RIY, -h)
            F.px(x, y, '#f2c230', L)
    else:
        top_joints(F, L, h, '#b8861a', 5, 'back')
        for i in range(60):
            a = math.pi + math.pi * i / 59
            x, y = epos(a, RO, ROY, -h)
            F.px(x, y, '#f2c230', L)


def runes(S, h, k=1.0, dmg=False):
    F = S.F
    for i, a in enumerate([.45, .95, 1.57, 2.19, 2.69]):
        if dmg and i == 3:
            continue
        x, y = epos(a, RO, ROY, -h + 3)
        g = RUNES[i]
        c = '#ff5a5a' if (k > .7 and not (dmg and i == 1)) else '#c8323a'
        for j, row in enumerate(g):
            for q, b in enumerate(row):
                if b == '1':
                    F.px(x - 1 + q, y + j, c, S.FR)
        glow(F, x, y + 2, 7, '#ff3a4a', alpha=int(90 * k), layer=S.HZ)


def level5(S, dmg, cold=False):
    F = S.F
    h = 11
    # chifres dourados atrás
    for sx in (-1, 1):
        bx = CX + sx * 22
        F.part(poly((bx - 3, 128), (bx + 3, 128), (bx + sx * 6, 106), (bx + sx * 3, 112)), '#2e2836',
               marks=[(poly((bx - 3, 128), (bx + 3, 128), (bx + 2, 124), (bx - 2, 124)), '#b8861a')], layer=F.a)
        F.part(poly((bx + sx * 3, 112), (bx + sx * 6, 106), (bx + sx * 5.5, 112)), '#f2c230', layer=F.a)
    ring_wall(S, h, '#3c3446', '#2e2836', '#1c1822', deco_moon, dmg)
    coal_bed(F, F.a, CX, CY - 1, 24, 7.5, k=.5 if dmg else 1, cold=cold)
    return lambda: level5_front(S, dmg, h)


def level5_front(S, dmg, h):
    F = S.F
    runes(S, h, .5 if dmg else 1.0, dmg)
    # pedras-guardiãs com ponta dourada na frente
    for x in (40, 88):
        if dmg and x == 88:
            continue
        F.part(poly((x - 3, 150), (x + 3, 150), (x + 2, 140), (x, 136), (x - 2, 140)), '#2e2836',
               marks=[(poly((x - 1, 140), (x, 136), (x + 1, 140)), '#f2c230')], layer=S.FR)
    if dmg:
        cracks(F, S.FR, 17, [.7, 2.0, 2.5], h)
        F.part(rot(poly((92, 147), (104, 147), (104, 152), (92, 152)), 98, 150, 16), '#2e2836',
               marks=[(rot(poly((92, 147), (104, 147), (104, 148), (92, 148)), 98, 150, 16), '#f2c230')], tex=.3, layer=S.FR)
        F.part(poly((106, 151), (110, 151), (109, 145), (108, 143), (107, 145)), '#2e2836', layer=S.FR)


LEVELS = {1: level1, 2: level2, 3: level3, 4: level4, 5: level5}


# ============================================================ fogueira inteira

def fogueira(level, Hh=34, Ww=26, t=0, dmg=False, mode='lit', n_emb=None, flash=0.0, lighter=None, smoke_n=0,
             post=None, pre=None, scale_glow=1.0):
    """mode: lit | ember | cold."""
    S = Scene()
    F = S.F
    pal = MOONF if level == 5 else FIRE
    cold = mode == 'cold'
    lit = mode == 'lit' and Hh > 0
    by = CY - 1
    if pre:
        pre(S)
    front = LEVELS[level](S, dmg, cold)
    burn = 0 if cold else (1.0 if lit else .5)
    logs_in_fire(F, F.a, cold=cold, burn=burn, t=t)
    # luz quente sobre a base
    if lit:
        k = min(.55, .18 + Hh / 110) * (.45 if level == 5 else 1)
        warm(F.a, CX, by - Hh * .3, 40 + Hh * .9, pal['glow'], k, ry=26 + Hh * .6)
        ground_glow(S.GL, CX, CY + 4, 44 + Hh * .5 * scale_glow, 14 + Hh * .14, pal['glow'], amax=60 + int(Hh))
    elif mode == 'ember':
        warm(F.a, CX, by, 26, '#c8321e', .3, ry=12)
        ground_glow(S.GL, CX, CY + 3, 30, 10, '#c8321e', amax=50)
    if lit:
        flame(S, CX, by, Hh, Ww, t, pal)
    front()
    if lit:
        k = min(.5, .15 + Hh / 120) * (.45 if level == 5 else 1)
        warm(S.FR, CX, by - Hh * .25, 44 + Hh * .9, pal['glow'], k, ry=28 + Hh * .6)
        glow(F, CX, by - Hh * .4, 12 + Hh * .8, pal['glow'], alpha=30 + int(Hh * .3), layer=S.HZ)
        embers(S, CX, by, Hh, Ww, t, n_emb if n_emb is not None else 3 + int(Hh / 5), pal, rise=40 + Hh)
    elif mode == 'ember':
        glow(F, CX, by - 3, 18, '#c8321e', alpha=60, layer=S.HZ)
    if dmg or smoke_n:
        smoke(S, CX + 4, by - max(Hh, 6) - 2, t, n=smoke_n or 5, scale=1.1, c='#9a94a4', seed=level, rise=42)
    if flash:
        glow(F, CX, by - 20, 50, '#fff4c8', alpha=int(200 * flash), layer=S.HZ)
    if post:
        post(S)
    sh = shadow_layer(CX + 3, 40, 5, alpha=90, w=W, h=H, gy=GY)
    return S.compose(sh)


# ============================================================ fog_niveis

def make_niveis():
    frames = []
    for lv in range(1, 6):
        frames.append(fogueira(lv, 34, 26, t=lv % 4))
    for lv in range(1, 6):
        frames.append(fogueira(lv, 16, 18, t=lv % 4, dmg=True, n_emb=2))
    grid(frames, 5).save(os.path.join(OUT, 'fog_niveis.png'))


# ============================================================ fog_chama

def lighter_draw(F, L, x, y, ang=-20, lit=False, spark=0):
    sh = rot(poly((x - 3, y - 6), (x + 3, y - 6), (x + 3, y + 6), (x - 3, y + 6)), x, y, ang)
    F.part(sh, '#c8323a', marks=[(rot(poly((x - 3, y - 6), (x - 1.5, y - 6), (x - 1.5, y + 6), (x - 3, y + 6)), x, y, ang), '#e8606a')],
           layer=L, light=.3)
    hd = rot(poly((x - 3, y - 10), (x + 3, y - 10), (x + 3, y - 6), (x - 3, y - 6)), x, y, ang)
    F.part(hd, '#c9ced4', marks=[(rot(poly((x - 1, y - 9), (x, y - 9), (x, y - 8), (x - 1, y - 8)), x, y, ang), '#4a4e54')], layer=L)
    tx, ty = rot([[(x + 1, y - 11)]], x, y, ang)[0][0]
    if spark:
        for i in range(spark):
            sparkle(F, tx + 2 + i * 3, ty - 2 - i * 2, r=2 + (i == 0), col='#ffe27a')
    return tx, ty


def make_chama():
    frames = []
    for t in range(4):
        frames.append(fogueira(2, 14, 18, t=t, n_emb=3))
    for t in range(4):
        frames.append(fogueira(2, 34, 26, t=t))
    for t in range(4):
        frames.append(fogueira(2, 58, 32, t=t, n_emb=12))
    for t in range(4):
        big = t % 2 == 0
        frames.append(fogueira(2, 64 if big else 54, 38 if big else 34, t=t, n_emb=26 if big else 18,
                               flash=(.7 if t == 0 else (.35 if t == 2 else 0))))
    for t in range(4):
        frames.append(fogueira(2, 0, 0, t=t, mode='ember', post=lambda S, t=t: thin_smoke(S, CX + 2, CY - 8, t, seed=t)))
    for t in range(4):
        if t < 2:
            post = (lambda S, t=t: smoke(S, CX, CY - 14 - t * 12, t, n=3, scale=1.2 + t * .4, seed=9, rise=10))
        else:
            post = None
        frames.append(fogueira(2, 0, 0, t=t, mode='cold', post=post))

    # acendendo
    def lt(spark, fl=None):
        def p(S):
            F = S.F
            lighter_draw(F, F.fx, 38, 132, ang=25, spark=spark)
            if fl == 'whoosh':
                impact(F, 52, 128, r=9)
        return p
    frames.append(fogueira(2, 0, 0, t=0, mode='cold', post=lt(2)))
    frames.append(fogueira(2, 0, 0, t=1, mode='cold', post=lt(3)))
    frames.append(fogueira(2, 26, 34, t=2, n_emb=16, flash=1.0, post=lt(0, 'whoosh')))
    frames.append(fogueira(2, 22, 22, t=3, n_emb=8, post=lt(0)))
    grid(frames, 4).save(os.path.join(OUT, 'fog_chama.png'))


# ============================================================ fog_luz

def make_luz():
    frames = []
    WL = 256
    yy, xx = np.mgrid[0:WL, 0:WL]
    cols_ = [col('#c8421e'), col('#ff8a30'), col('#ffc060'), col('#fff0b0')]
    for R in (60, 94, 124):
        d = np.sqrt(((xx - 128) / R) ** 2 + ((yy - 128) / (R * .6)) ** 2)
        s = np.clip(1 - d, 0, 1)
        q = np.ceil(s * 7) / 7
        a = np.zeros((WL, WL, 4), np.uint8)
        ci = np.clip(q * 3.2, 0, 3)
        i0 = np.floor(ci).astype(int)
        i1 = np.minimum(i0 + 1, 3)
        f = (ci - i0)[..., None]
        C = np.stack(cols_)
        rgb = C[i0] * (1 - f) + C[i1] * f
        a[..., :3] = np.clip(rgb, 0, 255)
        a[..., 3] = (q ** 1.25 * 200).astype(np.uint8)
        frames.append(a)
    R = 26
    d = np.sqrt(((xx - 128) / R) ** 2 + ((yy - 128) / (R * .62)) ** 2)
    s = np.clip(1 - d, 0, 1)
    q = np.ceil(s * 4) / 4
    a = np.zeros((WL, WL, 4), np.uint8)
    a[..., :3] = np.clip(mix(col('#8a1a14'), col('#ff5a2a'), q[..., None]), 0, 255)
    a[..., 3] = (q * 170).astype(np.uint8)
    frames.append(a)
    strip(frames).save(os.path.join(OUT, 'fog_luz.png'))


# ============================================================ fog_itens

def log_item(F, L, cx, cy, ang, ln=36, w=11, seed=0):
    x0, x1 = cx - ln / 2, cx + ln / 2
    marks = [(limb(x0 + 4, cy - 2, x0 + 14, cy - 2, 1.2), BARKD), (limb(x0 + 12, cy + 2, x1 - 8, cy + 2, 1.2), BARKD),
             (limb(x0 + 20, cy - 1, x1 - 4, cy - 1, 1), BARKD), (limb(x0 + 3, cy - 4.2, x1 - 3, cy - 4.2, 1.6), '#8a5a36'),
             (ell(x0 + 22, cy - 3.5, 3, 1.4), '#5a6a3a')]
    shapes = limb(x0, cy, x1, cy, w) + ell(x0 + 14, cy - 5, 2, 2.5)
    F.part(rot(shapes, cx, cy, ang), BARK, marks=[(rot(m, cx, cy, ang), c) for m, c in marks], tex=.3, layer=L)
    F.part(rot(ell(x0 + 14, cy - 6.5, 1.4, 1), cx, cy, ang), CORE, layer=L)
    # pontas: a da direita mostra o cerne
    F.part(rot(ell(x1, cy, 3.6, w / 2), cx, cy, ang), CORE,
           marks=[(rot(ell(x1, cy, 2.6, 3.8), cx, cy, ang), RING), (rot(ell(x1, cy, 1.9, 2.8), cx, cy, ang), CORE),
                  (rot(ell(x1, cy, .8, 1.2), cx, cy, ang), RING)], layer=L, light=.3)


def item_frame():
    return Scene(64, 64)


def make_itens():
    frames = []
    for k in range(4):
        S = item_frame()
        log_item(S.F, S.F.a, 32, 32, k * 45)
        frames.append(S.compose())
    # pilha de lenha
    S = item_frame()
    F = S.F
    sh = shadow_layer(32, 22, 3, alpha=90, w=64, h=64, gy=54)
    F.part(poly((10, 52), (54, 52), (54, 55), (10, 55)), BARK2, layer=F.a)
    pos = [(18, 46), (32, 46), (46, 46), (25, 36), (39, 36), (32, 26)]
    for i, (x, y) in enumerate(pos):
        r = 6.6 if i < 3 else 6.2
        F.part(ell(x, y, r, r), BARK, layer=F.a, light=.25, tex=.3)
        F.part(ell(x - .5, y - .5, r - 2.2, r - 2.2), CORE,
               marks=[(ell(x - .5, y - .5, r - 3.6, r - 3.6), RING), (ell(x - .5, y - .5, r - 4.4, r - 4.4), CORE),
                      (ell(x - .5, y - .5, .9, .9), RING)], layer=F.a, light=.35, outline=False)
        F.line(x - 1, y - 1, x + 2, y + 2, '#6a4a2a', F.a)
    for x in range(12, 53):
        y = 41 + .0 * x
        F.px(x, y, '#b59a62', F.a)
        F.px(x, y + 1, '#7a6440', F.a)
    F.part(ell(31, 41.5, 2.2, 2), '#b59a62', layer=F.a)
    F.line(30, 43, 28, 48, '#b59a62', F.a)
    F.line(32, 43, 34, 48, '#b59a62', F.a)
    frames.append(over(sh, S.compose()))
    # isqueiro
    for st in range(3):
        S = item_frame()
        F = S.F
        sh = shadow_layer(32, 10, 2.5, alpha=90, w=64, h=64, gy=56)
        x, y = 30, 44
        F.part(poly((x - 6, y - 11), (x + 6, y - 11), (x + 6, y + 11), (x - 6, y + 11)), '#c8323a',
               marks=[(poly((x - 6, y - 11), (x - 3, y - 11), (x - 3, y + 11), (x - 6, y + 11)), '#e8606a'),
                      (poly((x - 6, y + 4), (x + 6, y + 4), (x + 6, y + 5), (x - 6, y + 5)), '#8a1e24'),
                      (ell(x + 2, y - 2, 1.6, 4), '#a8282e')], layer=F.a, light=.3)
        F.part(poly((x - 6, y - 19), (x + 6, y - 19), (x + 6, y - 11), (x - 6, y - 11)), '#c9ced4',
               marks=[(poly((x - 6, y - 19), (x - 4, y - 19), (x - 4, y - 11), (x - 6, y - 11)), '#eef0f2')], layer=F.a)
        for k in range(3):
            F.px(x - 2 + k * 2, y - 16, '#4a4e54', F.a)
            F.px(x - 2 + k * 2, y - 14, '#4a4e54', F.a)
        F.part(ell(x + 4, y - 21, 2.8, 2.8), '#7d848c', marks=[(ell(x + 3.5, y - 21.5, 1, 1), '#c9ced4')], layer=F.a)
        for k in range(4):
            F.px(x + 2 + k, y - 21 + (k % 2), '#3a3e44', F.a)
        F.part(poly((x - 5, y - 22), (x + 1, y - 22), (x + 1, y - 19), (x - 5, y - 19)), '#3a3e44', layer=F.a)
        if st == 1:
            sparkle(F, x + 1, y - 26, r=4, col='#ffe27a')
            sparkle(F, x + 7, y - 28, r=2, col='#ffc93a')
            F.px(x - 4, y - 29, '#ffc93a', F.fx)
            F.px(x + 10, y - 24, '#f07a1e', F.fx)
        if st == 2:
            glow(F, x - 1, y - 28, 14, '#ff9a3a', alpha=80, layer=S.HZ)
            flame_small(S, x - 1, y - 23, 15, 7, 0)
        frames.append(over(sh, S.compose()))
    # brasas soltas
    for t in range(3):
        S = item_frame()
        F = S.F
        sh = shadow_layer(32, 20, 3, alpha=70, w=64, h=64, gy=48)
        k = [.55, 1.0, .75][t]
        ground_glow(S.GL, 32, 44, 24, 9, '#c8321e', amax=int(40 + 50 * k))
        for i, (x, y, r) in enumerate(((22, 42, 6), (34, 44, 7), (45, 41, 5), (28, 36, 5), (40, 35, 4.5))):
            rnd = random.Random(i)
            pts = [(x + r * (1 + rnd.uniform(-.25, .15)) * math.cos(2 * math.pi * j / 8),
                    y + r * .7 * (1 + rnd.uniform(-.25, .15)) * math.sin(2 * math.pi * j / 8)) for j in range(8)]
            F.part([pts], '#2a1a14', tex=.3, layer=F.a, light=.15)
            for j in range(int(r * 1.6)):
                px = x + rnd.uniform(-r * .7, r * .7)
                py = y + rnd.uniform(-r * .45, r * .45)
                e = rnd.random() * k
                c = '#ffc93a' if e > .7 else ('#f07a1e' if e > .4 else '#c8321e')
                F.px(px, py, c, F.a)
                if e > .5:
                    F.px(px + 1, py, '#c8321e', F.a)
        glow(F, 32, 40, 22, '#ff7a1e', alpha=int(70 * k), layer=S.HZ)
        if t != 0:
            F.px(30 + t * 3, 24 - t * 3, '#f07a1e', F.fx)
            F.px(38 - t, 20 - t * 2, '#ffc93a', F.fx)
        frames.append(over(sh, S.compose()))
    # fumaça
    for t in range(3):
        S = item_frame()
        F = S.F
        sc = [.7, 1.0, 1.15][t]
        dy = [0, -5, -9][t]
        cc = ['#8a8494', '#9a94a4', '#b0aab8'][t]
        balls = [(32, 38, 9), (22, 42, 6.5), (42, 42, 6.5), (27, 30, 6), (38, 30, 5.5)]
        if t == 2:
            balls = [(28, 34, 7), (42, 38, 5), (20, 42, 4), (36, 24, 4.5), (46, 28, 3)]
        shp = []
        for (x, y, r) in balls:
            rr = r * (.55 + .45 * sc)
            shp += ell(32 + (x - 32) * sc, y * 1 + dy, rr, rr * .85)
        F.part(shp, cc, ol='#4a4458', layer=S.SM, light=.3, dark=.3, tex=.15)
        for (x, y, r) in balls[:3]:
            F.flat(ell(32 + (x - 32) * sc - r * .3, y + dy - r * .35, r * .35 * sc, r * .25 * sc), '#d0cad8', layer=S.SM)
        out = S.compose()
        if t == 2:
            out[..., 3] = (out[..., 3] * .8).astype(np.uint8)
        frames.append(out)
    # ícone salvar/curar
    S = item_frame()
    F = S.F
    sh = shadow_layer(30, 18, 3, alpha=90, w=64, h=64, gy=54)
    ground_glow(S.GL, 30, 52, 22, 7, '#ff9a3a', amax=70)
    for (x0, y0, x1, y1) in ((14, 53, 40, 44), (46, 53, 20, 44)):
        fire_log(F, F.a, x0, y0, x1, y1, 6, 1.0, False, x0)
    for x in (12, 20, 40, 48):
        F.part(ell(x, 54, 3.5, 2.6), '#8e8a84', tex=.3, layer=S.FR)
    flame_small(S, 30, 49, 26, 18, 1)
    glow(F, 30, 40, 20, '#ff9a3a', alpha=50, layer=S.HZ)
    plus(F, 51, 13, col='#6fdc7a', s=3)
    F.px(48, 9, '#c8f8c8', F.fx)
    frames.append(over(sh, S.compose()))
    grid(frames, 5).save(os.path.join(OUT, 'fog_itens.png'))


def flame_small(S, cx, by, Hh, Ww, t):
    flame(S, cx, by, Hh, Ww, t, FIRE, bits=False)


# ============================================================ fog_obra

def scaffold(S):
    F = S.F
    POLE = '#8a6a42'
    for x in (18, 110):
        F.part(poly((x - 2, 66), (x + 2, 66), (x + 2, 148), (x - 2, 148)), POLE,
               marks=[(poly((x - 1, 70), (x, 70), (x, 144), (x - 1, 144)), '#a8845a'),
                      (ell(x, 100, 1.6, 2), '#5a4228')], tex=.25, layer=F.a)
    for y in (86, 118):
        F.part(limb(16, y, 112, y, 3), POLE, marks=[(limb(30, y - .5, 90, y - .5, .8), '#a8845a')], layer=F.a)
    F.part(limb(20, 116, 108, 88, 2.6), '#7a5a36', layer=F.a)
    # tábua em cima
    F.part(poly((10, 62), (118, 62), (118, 67), (10, 67)), '#9a6a3c',
           marks=[(poly((10, 64), (118, 64), (118, 65), (10, 65)), '#7d5430'), (ell(70, 65, 3, 1), '#5a3a22')], tex=.3, layer=F.a)
    for x in (14, 40, 88, 114):
        F.px(x, 63, '#c9c3b0', F.a)
    # amarras de corda
    for (x, y) in ((18, 86), (110, 86), (18, 118), (110, 118), (18, 65), (110, 65)):
        F.part(poly((x - 3, y - 2), (x + 3, y - 2), (x + 3, y + 2), (x - 3, y + 2)), '#b59a62',
               marks=[(poly((x - 3, y), (x + 3, y), (x + 3, y + .9), (x - 3, y + .9)), '#8a7348')], layer=F.a)
    # balde de argamassa
    F.part(poly((96, 133), (106, 133), (105, 145), (97, 145)), '#6b6a66', marks=[(ell(101, 139, 3, 2), '#8a4e2e')], layer=F.a)
    F.part(ell(101, 133, 5, 1.6), '#b8b0a0', layer=F.a)
    F.line(96, 133, 101, 127, '#3a3e44', F.a)
    F.line(101, 127, 106, 133, '#3a3e44', F.a)


def new_blocks(S):
    """blocos de pedra novos assentados na frente + pilha."""
    F = S.F
    for i, a in enumerate((.55, 1.05, 1.57, 2.09)):
        x, y = epos(a, RO + 1.5, ROY + 1)
        F.part(poly((x - 5, y - 6), (x + 5, y - 6), (x + 5, y), (x - 5, y)), '#8e8a84',
               marks=[(poly((x - 5, y - 6), (x + 5, y - 6), (x + 5, y - 5), (x - 5, y - 5)), '#a8a298'),
                      (ell(x + 2, y - 3, 1.5, 1), '#77736e')], tex=.4, layer=S.FR)
        F.line(x - 5, y + 1, x + 5, y + 1, '#b8b0a0', S.FR)
    for (x, y) in ((98, 154), (110, 154), (104, 148)):
        F.part(poly((x - 6, y - 6), (x + 6, y - 6), (x + 6, y), (x - 6, y)), '#8e8a84',
               marks=[(poly((x - 6, y - 6), (x + 6, y - 6), (x + 6, y - 5), (x - 6, y - 5)), '#a8a298')], tex=.4, layer=S.FR)


def hammer(F, L, px, py, th, ln=20):
    """cabo da mão (px,py) na direção th (graus); cabeça de ferro perpendicular na ponta."""
    a = math.radians(th)
    dx, dy = math.cos(a), math.sin(a)
    nx, ny = -dy, dx
    hx, hy = px + dx * ln, py + dy * ln
    F.part(limb(px, py, hx, hy, 3), '#9a6a3c', marks=[(limb(px, py, px + dx * 5, py + dy * 5, 3.2), '#5a3a22')], layer=L)
    def P(u, v):
        return (hx + dx * u + nx * v, hy + dy * u + ny * v)
    head = [[P(-3, -6), P(3, -6), P(3, 4), P(-3, 4)]]
    F.part(head, '#7d848c', marks=[([[P(-3, -6), P(-1, -6), P(-1, 4), P(-3, 4)]], '#c9ced4'),
                                   ([[P(-3, 3), P(3, 3), P(3, 4), P(-3, 4)]], '#4a4e54')], layer=L)


def make_obra():
    frames = []
    hx, hy = 52, 136     # ponto de batida (bloco da frente)
    for st in range(3):
        def post(S, st=st):
            F = S.F
            scaffold_front(S)
            new_blocks(S)
            px_, py_ = hx + 18, hy - 16
            th0 = math.degrees(math.atan2(hy - 3 - py_, hx - px_)) - 4
            hammer(F, F.fx, px_, py_, th0 + [62, 0, 30][st])
            if st == 1:
                impact(F, hx - 1, hy - 3, r=6)
                rnd = random.Random(4)
                for i in range(7):
                    a = rnd.uniform(math.pi * 1.05, math.pi * 1.95)
                    d = rnd.uniform(5, 12)
                    F.px(hx + d * math.cos(a), hy - 3 + d * math.sin(a), '#ffe27a' if i % 2 else '#fff6c8', F.fx)
            if st == 2:
                for (x, y, r) in ((44, 146, 3.2), (56, 148, 2.6), (38, 150, 2.2)):
                    F.part(ell(x, y, r, r * .7) + ell(x + r, y + 1, r * .7, r * .5), '#b0a490', ol='#4a4034', layer=F.fx, light=.25)
        frames.append(fogueira(2, 14, 18, t=st, n_emb=3, pre=scaffold, post=post))

    def done(S):
        F = S.F
        # faixa diagonal de brilho
        m = (S.F.a[..., 3] > 0) | (S.FR[..., 3] > 0)
        yy, xx = np.mgrid[0:H, 0:W]
        band = (np.abs((xx - 30) + (yy - 140) * .6) < 7) & m
        band2 = (np.abs((xx - 44) + (yy - 140) * .6) < 1.5) & m
        F.fx[band, :3] = [255, 250, 230]
        F.fx[band, 3] = 96
        F.fx[band2, :3] = [255, 255, 255]
        F.fx[band2, 3] = 200
        for (x, y, r) in ((22, 98, 5), (104, 92, 4), (34, 72, 3), (96, 120, 3.5)):
            star(F, x, y, r=r)
        for (x, y) in ((64, 60), (14, 124), (116, 110), (84, 70)):
            sparkle(F, x, y, r=3)
    frames.append(fogueira(3, 34, 26, t=1, post=done))
    strip(frames).save(os.path.join(OUT, 'fog_obra.png'))


def scaffold_front(S):
    """amarra de corda e vara diagonal da frente (por cima da fogueira)."""
    F = S.F
    F.part(limb(14, 146, 30, 124, 2.2), '#7a5a36', layer=S.FR)
    F.part(limb(114, 146, 98, 124, 2.2), '#7a5a36', layer=S.FR)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    make_niveis()
    make_chama()
    make_luz()
    make_itens()
    make_obra()
    print('ok')
