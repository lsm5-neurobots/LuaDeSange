"""Grupo `mapa` — objetos de mapa, boss e spawn. Rodar de dentro de tools/:  python obj_mapa.py [id ...]
Gera sprites/map_*.png (tiras horizontais ou grades)."""
import math
import os
import random
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixkit import (Frame, ell, poly, limb, chain, rot, mv, rp, sparkle, impact, puff, dust, star,
                    shadow_layer, over, compose, glow, strip, grid, hexc, mix, text, dilate, shift)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')

MOONRED = '#c8323a'
RED2 = '#ff5a5a'
PINK = '#ff9a8a'
GOLD = '#f2c230'
INKC = '#1a0f14'


def rect(x0, y0, x1, y1):
    return [[(x0, y0), (x1, y0), (x1, y1), (x0, y1)]]


def rivet(F, x, y, col='#c9ced4', layer=None):
    F.px(x, y, col, layer)
    F.px(x + 1, y + 1, '#2a2630', layer)


def fx_px(F, x, y, col, a=255):
    F.px(x, y, col, F.fx, a)


def spark_burst(F, x, y, n=6, r=8, seed=0, cols=('#fff6c8', '#ffd36a', '#ff9a3a')):
    rnd = random.Random(seed)
    for k in range(n):
        a = -math.pi * rnd.uniform(.05, .95)
        L = rnd.uniform(r * .5, r)
        c = cols[k % len(cols)]
        for t in range(int(L)):
            fx_px(F, x + math.cos(a) * t, y + math.sin(a) * t, c if t > 1 else '#ffffff')


def chips(F, x, y, n, col, seed, spread=12, dark='#2a1a12'):
    rnd = random.Random(seed)
    for _ in range(n):
        cx, cy = x + rnd.uniform(-spread, spread), y + rnd.uniform(-spread * .5, spread * .3)
        s = rnd.choice([1, 1.5, 2])
        F.part(rect(cx, cy, cx + s, cy + s), col, ol=dark, layer=F.fx, shade=False)


def chain_v(F, x, y0, y1, col='#6b6a66', phase=0):
    """corrente vertical de elos alternados."""
    k = phase
    y = y0
    while y < y1 - 2:
        if k % 2 == 0:
            F.part(ell(x, y + 3, 2.4, 3.4), col, light=.35)
            F.px(x, y + 3, '#1a1418')
            F.px(x, y + 2, '#1a1418')
        else:
            F.part(rect(x - .6, y, x + 1.4, y + 6), col, light=.35)
        y += 5
        k += 1


def stepped(dist, amax, n=6, dither=True):
    """intensidade em degraus (0..amax) a partir de distância normalizada 0..1, com pontilhado entre degraus."""
    v = np.clip(1 - dist, 0, 1)
    v = v ** 1.15 * n
    lvl = np.floor(v)
    frac = v - lvl
    if dither:
        h, w = dist.shape
        yy, xx = np.mgrid[0:h, 0:w]
        chk = ((xx + yy) % 2 == 0)
        bump = (frac > .55) & chk
        lvl = lvl + bump
    lvl = np.clip(lvl, 0, n)
    return (lvl / n * amax), lvl


def light_rgba(dist, amax, c_out, c_in, n=6, core=None):
    a, lvl = stepped(dist, amax, n)
    h, w = dist.shape
    o = np.zeros((h, w, 4), np.uint8)
    t = (lvl / n)[..., None]
    col = mix(hexc(c_out)[None, None, :], hexc(c_in)[None, None, :], t ** 1.4)
    if core is not None:
        cc, cd = core
        m = dist < cd
        col[m] = mix(col[m], hexc(cc), .7)
    o[..., :3] = np.clip(col, 0, 255)
    o[..., 3] = np.clip(a, 0, 255).astype(np.uint8)
    return o


def smoke(F, x, y, r, col, a=160):
    c = hexc(col)
    F.flat(ell(x, y, r, r * .85) + ell(x - r * .7, y + r * .4, r * .6, r * .55) + ell(x + r * .75, y + r * .3, r * .65, r * .55),
           col, layer=F.fx, alpha=a)
    F.flat(ell(x - r * .3, y - r * .3, r * .45, r * .35), np.clip(c * 1.18, 0, 255), layer=F.fx, alpha=a)


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, name + '.png'))
    print('ok', name, img.size)


# =====================================================================
# GRADES DA ARENA (256x192)
# =====================================================================
IRON = '#7a4a32'
IRON2 = '#5e3826'
RUSTV = '#b0603a'
SPIKE = '#3a2a24'
CONC = '#8e8a84'
CONC2 = '#77736e'
STEEL = '#6b747a'
DRYB = '#5a1418'


def grades_frame(bottom, state):
    W, H, GY = 256, 192, 180
    F = Frame(W, H)
    rnd = random.Random(7)
    sh = shadow_layer(29, 16, 4, 100, W, H, GY)
    sh = over(sh, shadow_layer(227, 16, 4, 100, W, H, GY))
    if bottom > 150:
        sh = over(sh, shadow_layer(128, 96, 3, 70, W, H, GY + 1))
    # soleira de ferro com encaixes
    F.part(rect(30, 174, 226, 183), '#3e3436', marks=[(rect(30, 181, 226, 183), '#2a2226')], tex=.2)
    for i in range(13):
        x = 42 + i * 14.33
        F.flat(rect(x - 1, 176, x + 4, 179), '#140c0e')
    # ---- barras ----
    xs = [42 + i * 14.33 for i in range(13)]
    for i, x in enumerate(xs):
        b = bottom + (1 if i % 3 == 1 else 0)
        marks = []
        r2 = random.Random(i * 31)
        for _ in range(5):
            yy = r2.uniform(0, max(10, b - 14))
            marks.append((rect(x, yy, x + 5, yy + r2.uniform(3, 9)), RUSTV if r2.random() < .5 else IRON2))
        F.part(rect(x, 8, x + 5, b - 9), IRON, marks=marks, tex=.25, light=.28)
        F.line(x + 1, 10, x + 1, b - 34, '#9a6448')
        # escorrido de ferrugem
        F.line(x + 1, b - 30, x + 1, b - 12, '#9a5434')
        # ponta de lança
        sp = poly((x - 2, b - 11), (x + 7, b - 11), (x + 2.5, b + .5))
        F.part(sp, SPIKE, marks=[(poly((x + 1, b - 9), (x + 5, b - 9), (x + 3, b - 2)), DRYB)], light=.35)
        F.px(x + 1, b - 10, '#8a7a70')
    # travessas
    for off in (28, 74, 120):
        y = bottom - off
        if y < 30:
            continue
        F.part(rect(36, y - 3, 220, y + 3), IRON2, tex=.3, light=.25,
               marks=[(rect(36 + r * 23, y - 3, 44 + r * 23, y + 3), RUSTV) for r in (1, 4, 6)])
        for x in xs:
            rivet(F, x + 2, y - 1, '#c08a68')
    # correntes que levantam a grade (do lintel até a travessa de cima)
    top_bar = None
    for off in (120, 74, 28):
        if bottom - off >= 30:
            top_bar = bottom - off
            break
    if top_bar is not None and top_bar > 44:
        for cx in (86, 170):
            chain_v(F, cx, 38, top_bar - 3, phase=1 if state == 'clang' else 0)
    # ---- pilares ----
    for px0 in (18, 216):
        marks = [(rect(px0, 118, px0 + 22, 128), '#c9c3b8')]
        for k in range(4):
            sx = px0 + k * 6
            marks.append((poly((sx, 128), (sx + 3, 128), (sx + 6, 118), (sx + 3, 118)), MOONRED))
        marks.append((rect(px0, 150, px0 + 22, 168), '#5e5a58'))   # fuligem/umidade embaixo
        marks.append((ell(px0 + 6, 70, 4, 9), '#6e6a66'))
        F.part(rect(px0, 30, px0 + 22, GY - 8), CONC, marks=marks, tex=.35, light=.2)
        F.part(rect(px0 - 4, GY - 10, px0 + 26, GY + 1), CONC2, tex=.4,
               marks=[(rect(px0 - 4, GY - 3, px0 + 26, GY + 1), '#5e5a58')])
        # trilho (sulco) na face interna
        gx = px0 + 22 if px0 < 100 else px0 - 2
        F.flat(rect(gx, 40, gx + 2, GY - 10), '#1e181c')
        # rachaduras
        cx = px0 + 8 + rnd.randint(0, 6)
        pts = [(cx, 52), (cx + 3, 60), (cx + 1, 68), (cx + 5, 78), (cx + 3, 86)]
        for a, b in zip(pts, pts[1:]):
            F.line(a[0], a[1], b[0], b[1], '#3a3436')
        F.line(px0 + 15, 140, px0 + 18, 150, '#3a3436')
        F.line(px0 + 18, 150, px0 + 16, 158, '#3a3436')
        for k in range(3):
            rivet(F, px0 + 4 + k * 7, GY - 7, '#b8b0a0')
    # pano vermelho no pilar esquerdo
    cloth = poly((12, 92), (38, 92), (38, 100), (12, 100)) + poly((14, 99), (20, 99), (17, 120), (11, 116)) + \
        poly((20, 99), (25, 99), (26, 112), (21, 114))
    F.part(mv(cloth, 4, 0), MOONRED, marks=[(rect(16, 95, 42, 96), '#8a1e26'), (poly((19, 104), (23, 104), (21, 112)), '#8a1e26')],
           tex=.25, light=.3)
    F.part(ell(38, 96, 3, 3), '#a82830')
    # ---- lintel / caixa da grade ----
    F.part(rect(6, 2, 250, 12), '#7d848c', tex=.2, light=.35,
           marks=[(rect(6, 10, 250, 12), '#5e666c')] + [(rect(x, 4, x + 2, 10), '#8a4e2e') for x in (50, 133, 201)])
    lmarks = [(rect(6, 36, 250, 42), '#525a60')]
    for px0 in (58, 120, 182):
        lmarks.append((rect(px0, 14, px0 + 16, 40), '#7d848c'))
        lmarks.append((rect(px0 + 2, 32, px0 + 14, 40), '#8a4e2e'))
    for k in range(9):
        x = 18 + k * 27
        lmarks.append((rect(x, 30, x + 2, 42), '#8a4e2e'))
    F.part(rect(6, 12, 250, 42), STEEL, marks=lmarks, tex=.18, light=.3)
    for x in range(12, 248, 12):
        rivet(F, x, 16)
        rivet(F, x, 38)
    for px0 in (58, 120, 182):
        for (dx, dy) in ((2, 18), (13, 18), (2, 30), (13, 30)):
            rivet(F, px0 + dx, dy, '#dfe4e8')
    # placa de aviso no meio
    F.part(rect(96, 20, 112, 30), '#e0b030', ol='#3a2a08',
           marks=[(poly((96 + k * 6, 30), (99 + k * 6, 30), (102 + k * 6, 20), (99 + k * 6, 20)), '#1e1a16') for k in range(3)])
    for x in (40, 97, 150, 205):
        F.line(x, 42, x, 48 + (x % 7), '#8a4e2e')
    # roldanas
    for px0 in (11, 245):
        F.part(ell(px0, 14, 9, 8), '#4a4f54', light=.35)
        F.part(ell(px0, 14, 4, 4), '#7d848c')
        F.px(px0, 14, '#1a1418')
        for a in range(0, 360, 60):
            F.px(px0 + 6.5 * math.cos(math.radians(a)), 14 + 6 * math.sin(math.radians(a)), '#2a2a30')
    # correntes laterais + contrapeso (sobe quando a grade desce)
    cwy = 150 - (bottom - 54) * 0.7
    for px0 in (9, 247):
        chain_v(F, px0, 18, cwy, phase=1 if state == 'clang' else 0)
        F.part(rect(px0 - 4.5, cwy, px0 + 4.5, cwy + 16), '#3e3a40', tex=.3,
               marks=[(rect(px0 - 5, cwy + 6, px0 + 5, cwy + 8), '#8a4e2e')])
        rivet(F, px0 - 2, cwy + 3)
        rivet(F, px0 + 2, cwy + 12)
    # ---- efeitos ----
    if state == 'clang':
        for i, x in enumerate(xs):
            if i % 2 == 0:
                spark_burst(F, x + 2.5, bottom - 1, n=5, r=10, seed=i)
        for x in (60, 128, 196):
            impact(F, x, bottom - 2, 7)
        for x in range(46, 214, 26):
            dust(F, x, bottom + 2, 4)
        chips(F, 128, bottom - 2, 16, '#6e5a44', 3, spread=90)
        for x in (11, 245):
            sparkle(F, x, 6, 2)
    if state == 'open_v':
        rr = random.Random(11)
        for _ in range(26):
            x = rr.uniform(40, 216)
            y = rr.uniform(bottom + 2, 170)
            fx_px(F, x, y, rr.choice(['#b0603a', '#8a4e2e', '#9c8a70']))
        for x, y in ((60, 70), (150, 52), (200, 90), (100, 110)):
            sparkle(F, x, y, 3, '#ffe9a8')
        for x in (70, 128, 186):
            dust(F, x, 172, 3)
    return compose(F, shadow=sh)


def make_grades():
    frames = [grades_frame(54, 'open'), grades_frame(100, 'move'), grades_frame(146, 'move'),
              grades_frame(180, 'clang'), grades_frame(180, 'closed'), grades_frame(122, 'open_v')]
    save(strip(frames), 'map_grades')


# =====================================================================
# GERADOR (128x160)
# =====================================================================
OLIVE = '#5f6a3a'
OLIVE2 = '#4a5430'


def gerador_frame(st):
    W, H, GY = 128, 160, 148
    F = Frame(W, H)
    sh = shadow_layer(54, 44, 4, 100, W, H, GY)
    sh = over(sh, shadow_layer(108, 7, 2.5, 90, W, H, GY))
    on = st in ('on1', 'on2')
    battery = st != 'off'
    # mancha de óleo no chão
    F.flat(ell(40, GY + 1, 14, 3), '#1a1418', layer=None, alpha=150)
    # ---- poste de madeira ----
    F.part(rect(103, 14, 109, GY - 2), '#7d5430', tex=.4, light=.25,
           marks=[(rect(103, 60, 109, 62), '#5a3a22'), (rect(103, 100, 109, 101), '#5a3a22'),
                  (rect(105, 30, 106, 120), '#6a4628'), (rect(103, 118, 109, 128), '#4a4458')])
    for y in (66, 84):  # grampos/escada
        F.part(rect(101, y, 111, y + 1.5), '#8d969c')
    F.part(rect(94, 24, 121, 28), '#5a3a22', tex=.3)
    for x in (96, 119):
        F.part(ell(x, 21, 2, 3), '#d8d2c2', light=.4)
    # braço e luminária (cabeça de cobra)
    F.part(rect(84, 33, 104, 36), '#4a4f54')
    F.part(poly((72, 34), (90, 31), (95, 35), (90, 41), (74, 41)), '#5a6068', light=.35,
           marks=[(rect(73, 38, 90, 41), '#3e4248')])
    lamp_col = {'off': '#3a3640', 'batt': '#3a3640', 'ing1': '#c8a860', 'ing2': '#4a4448',
                'on1': '#ffe9a8', 'on2': '#fff2c8'}[st]
    F.part(ell(82, 42, 7, 2.2), lamp_col, shade=not on, ol='#2a2228')
    if on:
        F.px(80, 42, '#ffffff', F.fx); F.px(81, 42, '#ffffff', F.fx); F.px(83, 42, '#ffffff', F.fx)
    # fios: isolador -> fora do quadro; gerador -> poste
    for t in range(0, 41):
        x = 120 + t * .2
        F.px(x, 21 + t * 1.0 + math.sin(t / 6) * 1.5, '#1a1418')
    pts = []
    for t in range(41):
        u = t / 40
        x = 86 + (103 - 86) * u
        y = 96 + (58 - 96) * u + math.sin(u * math.pi) * 10
        pts.append((x, y))
    for a, b in zip(pts, pts[1:]):
        F.line(a[0], a[1], b[0], b[1], '#1a1418')
    F.line(104, 58, 104, 36, '#1a1418')
    # ---- escapamento (atrás) ----
    F.part(rect(22, 66, 27, 90), '#4a4448', marks=[(rect(22, 76, 27, 80), '#8a4e2e'), (rect(22, 70, 23, 88), '#6a6470')], light=.3)
    F.part(rect(21, 72, 28, 74), '#3a363c')
    F.part(poly((20, 62), (28, 62), (31, 66), (28, 68), (21, 67)), '#2a2628')
    F.px(29, 65, '#141014'); F.px(30, 65, '#141014')
    # ---- corpo ----
    F.part(rect(18, 84, 88, 98), '#6f7a46', tex=.3, light=.25,
           marks=[(rect(30, 92, 42, 95), '#7d848c'), (rect(60, 92, 70, 95), '#8a4e2e')])
    F.part(ell(38, 90, 4, 2.5), '#3e3a36')
    F.px(37, 89, '#9a948a')
    fmarks = [(rect(16, 132, 88, 139), '#e0b030')]
    for k in range(10):
        x = 16 + k * 8
        fmarks.append((poly((x, 139), (x + 4, 139), (x + 8, 132), (x + 4, 132)), '#1e1a16'))
    rr = random.Random(5)
    for _ in range(9):
        x, y = rr.uniform(17, 84), rr.uniform(99, 128)
        w = rr.uniform(3, 7)
        fmarks.append((rect(x, y, x + w, y + rr.uniform(2, 4)), '#7d848c'))
        fmarks.append((rect(x + 1, y + 2, x + w - 1, y + 4), '#8a4e2e'))
    fmarks.append((rect(16, 126, 88, 132), OLIVE2))
    F.part(rect(16, 97, 88, 140), OLIVE, marks=fmarks, tex=.3, light=.22)
    # ferrugem escorrendo
    for x in (50, 86, 20):
        F.line(x, 98, x, 108 + x % 5, '#8a4e2e')
    # grelha de ventilação
    F.part(rect(64, 101, 85, 125), '#2e3424', ol='#1a1e14')
    for k in range(6):
        y = 103 + k * 3.7
        F.part(rect(65, y, 84, y + 1.6), '#6f7a46', light=.4, outline=False)
    # adesivo de raio
    F.part(poly((22, 108), (30, 108), (26, 100)), '#e0b030', ol='#3a2a08')
    F.px(26, 103, '#1e1a16'); F.px(25, 105, '#1e1a16'); F.px(26, 106, '#1e1a16')
    # encaixe da bateria
    F.part(rect(21, 110, 46, 129), '#140e12', shade=False, ol='#2e3424')
    F.flat(rect(22, 111, 45, 112), '#2a2a30')
    if not battery:
        # terminais soltos pendurados
        F.line(28, 111, 27, 120, '#a8302e'); F.line(27, 120, 29, 124, '#a8302e')
        F.part(rect(28, 123, 31, 126), '#b0b0a8')
        F.line(40, 111, 41, 117, '#2a2a2e'); F.line(41, 117, 39, 122, '#3a3a3e')
        F.part(rect(38, 121, 41, 124), '#b0b0a8')
    else:
        F.part(rect(23, 113, 44, 129), '#2a2a2e', tex=.2, light=.3,
               marks=[(rect(23, 113, 44, 117), '#a8302e'), (rect(27, 121, 37, 125), '#e0b030')])
        F.part(rect(26, 110, 29, 113), '#b0b0a8')
        F.part(rect(38, 110, 41, 113), '#b0b0a8')
        F.line(27, 109, 30, 104, '#c8323a'); F.line(30, 104, 36, 100, '#c8323a')
        F.line(40, 109, 42, 104, '#1a1418'); F.line(42, 104, 46, 100, '#1a1418')
        F.px(29, 123, '#1e1a16'); F.px(31, 123, '#1e1a16'); F.px(33, 123, '#1e1a16')
    # painel: mostrador, LED, alavanca
    F.part(ell(55, 106, 5.5, 5.5), '#d8d2c2', light=.3, ol='#1e1a16',
           marks=[(poly((55, 106), (61, 103), (61, 109)), '#6fbc6a')])
    ang = {'off': 200, 'batt': 200, 'ing1': 250, 'ing2': 290, 'on1': 330, 'on2': 335}[st]
    F.line(55, 106, 55 + 4 * math.cos(math.radians(ang)), 106 + 4 * math.sin(math.radians(ang)), '#c8323a')
    F.px(55, 106, '#1e1a16')
    led = {'off': '#3a2a2a', 'batt': '#5a3a20', 'ing1': '#ffb040', 'ing2': '#ff7a30',
           'on1': '#6fdc7a', 'on2': '#9af0a0'}[st]
    F.part(ell(52, 118, 2, 2), led, shade=False, ol='#1e1a16')
    if st not in ('off', 'batt'):
        glow(F, 52, 118, 6, led, 120)
    F.part(rect(56, 114, 62, 126), '#3a3a3e', ol='#1e1a16')
    if st in ('off', 'batt'):
        F.part(limb(59, 122, 59, 113, 2), '#9a9a9a')
        F.part(ell(59, 112, 2.5, 2.5), '#c8323a')
    else:
        F.part(limb(59, 118, 59, 126, 2), '#9a9a9a')
        F.part(ell(59, 127, 2.5, 2.5), '#c8323a')
    # lona dobrada em cima
    F.part(poly((46, 82), (88, 80), (90, 87), (84, 92), (50, 92)), '#4a6139', tex=.3, light=.25,
           marks=[(rect(50, 86, 86, 87), '#3a4c2c'), (rect(60, 83, 68, 89), '#8a7a52')])
    F.line(70, 81, 70, 92, '#b59a62')
    # skid
    F.part(rect(10, 139, 94, 146), '#3e3a40', tex=.2,
           marks=[(rect(10, 144, 94, 146), '#2a262c')])
    for x in (14, 34, 54, 74, 90):
        rivet(F, x, 141)
    F.part(rect(12, 145, 18, 148), '#2a262c'); F.part(rect(86, 145, 92, 148), '#2a262c')
    # ---- efeitos ----
    if st == 'ing1':
        spark_burst(F, 33, 110, 6, 8, 2, ('#ffffff', '#bfe8ff', '#7ac8ff'))
        spark_burst(F, 96, 21, 4, 6, 4, ('#ffffff', '#bfe8ff', '#7ac8ff'))
        smoke(F, 33, 58, 4, '#8a8496', 170)
        glow(F, 82, 44, 12, '#ffd36a', 70)
    if st == 'ing2':
        smoke(F, 34, 56, 7, '#4a4454', 220)
        smoke(F, 40, 44, 5, '#5e5868', 190)
        smoke(F, 44, 34, 3, '#6e6878', 150)
        spark_burst(F, 40, 110, 5, 7, 9, ('#ffffff', '#bfe8ff', '#7ac8ff'))
        spark_burst(F, 104, 58, 4, 6, 8, ('#ffffff', '#bfe8ff', '#7ac8ff'))
    if on:
        a = 150 if st == 'on1' else 175
        glow(F, 82, 44, 30, '#ffd36a', a)
        glow(F, 82, 43, 10, '#fff2c8', 200)
        oy = 0 if st == 'on1' else -4
        smoke(F, 32, 57 + oy, 3, '#9a94a6', 140)
        smoke(F, 36, 48 + oy, 2.5, '#aaa4b6', 100)
        smoke(F, 39, 40 + oy, 2, '#b4aec0', 70)
    return compose(F, shadow=sh)


def make_gerador():
    save(strip([gerador_frame(s) for s in ('off', 'batt', 'ing1', 'ing2', 'on1', 'on2')]), 'map_gerador_regiao')


# =====================================================================
# POSTE (64x160) + LUZ (192x128)
# =====================================================================
POLE = '#2e2c34'


def poste_frame(st):
    W, H, GY = 64, 160, 148
    F = Frame(W, H)
    sh = shadow_layer(33, 12, 3, 110, W, H, GY)
    cm = [(rect(29, 40, 30.5, 128), '#4a4652'), (rect(32, 70, 35, 76), '#1a1a1e'),
          (rect(29, 92, 35, 106), '#cfc6ae'), (rect(29, 104, 33, 106), '#a89e86'),
          (rect(33, 110, 35, 126), '#8a4e2e')]
    F.part(rect(29, 38, 35, 130), POLE, marks=cm, tex=.2, light=.3)
    F.line(30, 95, 34, 95, '#5a1418'); F.line(30, 98, 33, 98, '#5a1418'); F.line(31, 101, 34, 101, '#7a6e5c')
    for y in (60, 88, 116):
        F.part(rect(27, y, 37, y + 3), POLE, marks=[(rect(27, y, 37, y + 1), '#4a4652')], light=.35)
    # base
    bm = [(rect(24, 136, 40, 138), '#4a4652'), (ell(36, 142, 3, 2), DRYB), (ell(26, 144, 2, 1.4), DRYB),
          (rect(37, 130, 40, 140), '#8a4e2e')]
    F.part(poly((26, 126), (38, 126), (40, 136), (24, 136)), POLE, light=.3, tex=.2)
    F.part(rect(21, 136, 43, 148), '#3a3640', marks=bm, tex=.25, light=.28)
    for x in (24, 32, 40):
        rivet(F, x, 140, '#8a8692')
    F.px(20, 147, DRYB); F.px(45, 146, DRYB); F.px(44, 148, DRYB)
    # cruzeta + fio cortado
    F.part(rect(16, 45, 48, 48), POLE, light=.35)
    for x in (18, 46):
        F.part(ell(x, 43, 1.8, 2.5), '#d8d2c2', light=.4)
    pts = [(46, 44), (48, 50), (49, 58), (48, 66), (46, 72)]
    for a, b in zip(pts, pts[1:]):
        F.line(a[0], a[1], b[0], b[1], '#141014')
    F.px(46, 73, '#c87a3a'); F.px(45, 73, '#c87a3a')
    F.line(18, 44, 10, 52, '#141014'); F.line(10, 52, 4, 54, '#141014')
    # capitel
    F.part(rect(26, 36, 38, 40), POLE, marks=[(rect(26, 36, 38, 37), '#4a4652')])
    F.part(rect(23, 33, 41, 36), '#3a3640', light=.35)
    # lanterna
    glass = {'off': '#3a3a46', 'fl1': '#c8a860', 'fl2': '#5a5448', 'on': '#ffe9a8', 'red': '#ff7a70'}[st]
    glass2 = {'off': '#2a2a36', 'fl1': '#a08440', 'fl2': '#443e38', 'on': '#ffd36a', 'red': '#c8323a'}[st]
    lit = st in ('on', 'red', 'fl1')
    gl = poly((25, 33), (39, 33), (41, 15), (23, 15))
    F.part(gl, glass, shade=not lit, ol='#141018',
           marks=[(poly((32, 33), (39, 33), (41, 15), (33, 15)), glass2)])
    # montantes e trinca
    F.part(rect(31, 15, 33, 33), POLE, outline=False)
    F.line(24, 24, 40, 24, '#141018')
    F.line(36, 17, 38, 21, '#e8e8f0' if not lit else '#ffffff')
    F.line(38, 21, 37, 24, '#e8e8f0' if not lit else '#ffffff')
    if st == 'off':
        F.px(26, 17, '#6a6a7e'); F.px(26, 18, '#6a6a7e'); F.px(27, 26, '#56566a')
    if lit:
        F.px(28, 27, '#ffffff'); F.px(28, 28, '#ffffff'); F.px(29, 28, '#ffffff')
    if st == 'fl2':
        F.px(29, 28, '#ff8a3a'); F.px(30, 28, '#c85a2a')
    # teto
    F.part(poly((20, 16), (44, 16), (38, 9), (26, 9)), POLE, light=.35,
           marks=[(rect(20, 15, 44, 16), '#1a1a1e'), (poly((26, 9), (30, 9), (24, 15), (21, 15)), '#4a4652')])
    F.part(poly((28, 9), (36, 9), (32, 3)), POLE, light=.35)
    F.part(ell(32, 3, 1.5, 1.5), '#4a4652')
    F.px(22, 16, '#8a4e2e'); F.px(41, 16, '#8a4e2e'); F.px(42, 17, '#8a4e2e')
    # brilho
    if st == 'on':
        glow(F, 32, 24, 28, '#ffd36a', 140)
        glow(F, 32, 24, 12, '#fff2c8', 160)
    elif st == 'red':
        glow(F, 32, 24, 28, '#ff5a5a', 140)
        glow(F, 32, 24, 11, '#ffb0a0', 140)
    elif st == 'fl1':
        glow(F, 32, 24, 18, '#ffd36a', 70)
    return compose(F, shadow=sh)


def make_poste():
    save(strip([poste_frame(s) for s in ('off', 'fl1', 'fl2', 'on', 'red')]), 'map_poste')
    W, H = 192, 128
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - 95.5) / 95) ** 2 + ((yy - 63.5) / 58) ** 2)
    a = light_rgba(d, 125, '#ffb84a', '#ffe9a8', 6, core=('#fff2c8', .14))
    b = light_rgba(d, 105, '#a8202a', '#ff5a5a', 6, core=('#ff9a8a', .14))
    save(strip([a, b]), 'map_luz_poste')


# =====================================================================
ALL = {}


def main():
    want = sys.argv[1:]
    for k, fn in ALL.items():
        if not want or k in want:
            fn()


ALL.update({'grades': make_grades, 'gerador': make_gerador, 'poste': make_poste})

# =====================================================================
# utilitários de máscara (efeitos)
# =====================================================================
def edist(w, h, cx, cy, rx, ry):
    yy, xx = np.mgrid[0:h, 0:w]
    return np.sqrt(((xx + .5 - cx) / max(rx, 1e-6)) ** 2 + ((yy + .5 - cy) / max(ry, 1e-6)) ** 2)


def ering(w, h, cx, cy, rx, ry, th=1.5):
    d = edist(w, h, cx, cy, rx, ry)
    inner = edist(w, h, cx, cy, max(rx - th, .5), max(ry - th * ry / max(rx, 1), .5))
    return (d <= 1) & (inner > 1)


def paint(L, m, col, alpha=255):
    c = hexc(col) if isinstance(col, str) else np.array(col, float)
    src = np.zeros_like(L)
    src[m, :3] = c
    src[m, 3] = int(alpha)
    L[:] = over(L, src)


def paint_ol(F, m, col, ol, layer=None, alpha=255):
    L = F.fx if layer is None else layer
    o = dilate(m) & ~m
    paint(L, o, ol, alpha)
    paint(L, m, col, alpha)


GLYPHS = [["111", "010", "010", "101", "101"], ["101", "111", "001", "001", "011"], ["110", "101", "110", "100", "100"],
          ["010", "111", "010", "010", "101"], ["111", "101", "010", "101", "111"], ["100", "110", "101", "110", "100"],
          ["011", "100", "111", "001", "110"], ["101", "010", "111", "010", "101"]]


def glyph(F, g, x, y, col, ol='#3a0810', sc=1):
    shapes = []
    for j, row in enumerate(g):
        for i, b in enumerate(row):
            if b == '1':
                X, Y = x + i * sc, y + j * sc
                shapes.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
    F.part(shapes, col, shade=False, ol=ol, layer=F.fx)


def bang(F, cx, top, h=12, w=4, col='#fff0ec', ol='#8a1420'):
    F.part(rect(cx - w / 2, top, cx + w / 2, top + h * .6) + rect(cx - w / 2, top + h * .8, cx + w / 2, top + h),
           col, shade=False, ol=ol, layer=F.fx)
    F.px(cx - w / 2, top, '#ffffff', F.fx)


# =====================================================================
# PORTAL (128x128)
# =====================================================================
def portal_frame(rx, ry, rings, rot_, drops, phase, closing=False):
    W, H = 128, 128
    CX, CY = 64, 50
    F = Frame(W, H)
    L = F.fx
    big = rx / 17.0
    gd = edist(W, H, 64, 112, 34 * max(big, .3), 8 * max(big, .3))
    paint(L, gd <= 1, '#c8323a', 60)
    paint(L, gd <= .55, '#ff5a5a', 60)
    glow(F, CX, CY, 18 + 34 * big, '#c8323a', 110)

    def ring_pts(rxr, ryr, cy, rot_d, back):
        pts = []
        for k in range(0, 360, 4):
            a = math.radians(k + rot_d)
            x = CX + rxr * math.cos(a)
            y = cy + ryr * math.sin(a)
            if (y < cy) != back:
                continue
            seg = (k // 12) % 4
            pts.append((x, y, seg, k))
        return pts

    def draw_ring(back):
        if not rings:
            return
        for (rxr, ryr, cy, rd) in ((30 * rings, 9 * rings, CY + 4, rot_), (38 * rings, 12 * rings, CY - 2, -rot_ * 1.3)):
            for (x, y, seg, k) in ring_pts(rxr, ryr, cy, rd, back):
                if seg == 3:
                    continue
                c = '#ff5a5a' if seg != 1 else '#ffb0a0'
                if back:
                    c = '#a8202a'
                F.px(x, y, c, L)
                F.px(x, y + 1, '#6a1420', L)
                if k % 48 == 0 and not back:
                    F.px(x, y - 1, '#fff0ec', L); F.px(x - 1, y, '#ff9a8a', L); F.px(x + 1, y, '#ff9a8a', L)

    draw_ring(True)
    if rx > 0:
        def jag(r0x, r0y, amp, n):
            pts = []
            for i in range(n):
                a = 2 * math.pi * i / n
                j = 1 + amp * math.sin(5 * a + phase) + amp * .7 * math.sin(11 * a - phase * 2)
                if i % 2 == 0:
                    j += amp * .8
                pts.append((CX + r0x * j * math.cos(a) + math.sin(a * 3) * 1.5, CY + r0y * j * math.sin(a)))
            return [pts]
        F.part(jag(rx + 3, ry + 3, .1, 40), '#c8323a', shade=False, ol='#3a0810', layer=L)
        F.part(jag(rx + 1.2, ry + 1.2, .07, 40), '#ff5a5a', shade=False, outline=False, layer=L)
        if rx > 2:
            F.part(jag(rx - .5, ry - .5, .05, 36), '#120810', shade=False, ol='#6a1420', layer=L)
            rr = random.Random(int(phase * 10))
            for _ in range(int(rx * 1.5)):
                a = rr.uniform(0, 2 * math.pi)
                d = rr.uniform(0, .8)
                c = rr.choice(['#3a1430', '#5a1a3a', '#2a0e24'])
                F.px(CX + rx * d * math.cos(a), CY + ry * d * math.sin(a), c, L)
            for k in range(3):
                for t in range(14):
                    a = phase + k * 2.1 + t * .25
                    d = .2 + t * .04
                    F.px(CX + rx * d * math.cos(a), CY + ry * d * math.sin(a), '#4a1636', L)
            F.px(CX, CY, '#ff5a5a', L)
        for t in range(-6, 3):
            a = math.radians(200 + t * 6)
            F.px(CX + (rx + 2) * math.cos(a), CY + (ry + 2) * math.sin(a), '#ffd0c8', L)
    draw_ring(False)
    for (dx, dy, s) in drops:
        x, y = CX + dx, CY + ry + 2 + dy
        F.part(ell(x, y, 1.2 * s, 1.8 * s), '#c8323a', shade=False, ol='#3a0810', layer=L)
        F.px(x - .3, y - 1, '#ff9a8a', L)
    if drops:
        for dx in (-6, 3, 8):
            F.flat(ell(64 + dx, 112 + (dx % 3) * .5, 2, .8), '#8a1420', layer=L)
    if closing:
        rr = random.Random(int(rx * 7))
        for _ in range(10):
            F.px(CX + rr.uniform(-14, 14), CY + rr.uniform(-20, 22), rr.choice(['#ff9a8a', '#ffd0c8', '#ff5a5a']), L)
        sparkle(F, CX, CY, 3, '#ffd0c8')
    return compose(F)


def make_portal():
    D1 = [(-3, 2, 1), (4, 9, .9)]
    D2 = [(1, 5, 1), (-5, 14, .8), (3, 26, 1)]
    D3 = [(-2, 10, .9), (5, 3, 1), (0, 36, .8), (-4, 22, 1)]
    frames = [portal_frame(1.5, 9, 0, 0, [], 0),
              portal_frame(7, 16, .5, 10, [(0, 2, .8)], .7),
              portal_frame(13, 21, .85, 20, D1, 1.4),
              portal_frame(17, 24, 1, 30, D2, 2.1),
              portal_frame(18, 25, 1, 60, D3, 2.8),
              portal_frame(17, 24, 1, 90, D1 + [(6, 30, .8)], 3.5),
              portal_frame(8, 19, .55, 110, [(1, 20, .8)], 4.2, closing=True),
              portal_frame(1, 11, 0, 0, [(0, 44, .7)], 4.9, closing=True)]
    save(strip(frames), 'map_portal')


# =====================================================================
# AVISO DE SPAWN (128x96)
# =====================================================================
def aviso_mark(ring, big=False, pulse=0):
    W, H = 128, 96
    CX, CY = 64, 54
    F = Frame(W, H)
    L = F.fx
    if not big:
        paint(L, edist(W, H, CX, CY, 30, 15) <= 1, '#c8323a', 95 + pulse * 30)
        paint(L, edist(W, H, CX, CY, 18, 9) <= 1, '#c8323a', 70)
        paint(L, ering(W, H, CX, CY, 30, 15, 2), '#ff5a5a', 230)
        paint(L, ering(W, H, CX, CY, 18, 9, 1), '#ff9a8a', 170)
        paint(L, ering(W, H, CX, CY, ring, ring * .5, 2.2), '#ff5a5a', 240)
        paint(L, ering(W, H, CX, CY, ring - 2.2, (ring - 2.2) * .5, 1), '#a8202a', 200)
        for a in (0, 90, 180, 270):
            x = CX + (ring + 3) * math.cos(math.radians(a))
            y = CY + (ring + 3) * .5 * math.sin(math.radians(a))
            F.part(ell(x, y, 2, 1.3), '#ff5a5a', shade=False, ol='#6a1420', layer=L)
        bang(F, CX, CY - 22, 16, 5)
    else:
        paint(L, edist(W, H, CX, CY, 56, 28) <= 1, '#c8323a', 55 + pulse * 25)
        paint(L, edist(W, H, CX, CY, 40, 20) <= 1, '#c8323a', 60)
        paint(L, ering(W, H, CX, CY, 56, 28, 2.5), '#ff5a5a', 240)
        paint(L, ering(W, H, CX, CY, 51, 25.5, 1), '#a8202a', 200)
        paint(L, ering(W, H, CX, CY, 40, 20, 2), '#ff5a5a', 220)
        paint(L, ering(W, H, CX, CY, 24, 12, 1.2), '#ff9a8a', 200)
        for (dx, dy, w, h) in ((-62, -1, 14, 2), (48, -1, 14, 2), (-1, -32, 2, 8), (-1, 26, 2, 8)):
            F.part(rect(CX + dx, CY + dy, CX + dx + w, CY + dy + h), '#ff5a5a', shade=False, ol='#6a1420', layer=L)
        for k in range(16):
            a = math.radians(k * 22.5 + pulse * 11)
            F.px(CX + 47 * math.cos(a), CY + 23.5 * math.sin(a), '#ffd0c8', L)
        bang(F, CX, CY - 30 - pulse, 22, 7)
    return compose(F)


def aviso_shadow(rx, a):
    W, H = 128, 96
    F = Frame(W, H)
    paint(F.fx, edist(W, H, 64, 54, rx, rx * .4) <= 1, '#3a2850', a)
    paint(F.fx, edist(W, H, 64, 54, rx * .7, rx * .28) <= 1, '#2a1c3c', a * .4)
    return compose(F)


def crack_frame(fade=1.0):
    W, H = 128, 96
    CX, CY = 64, 56
    F = Frame(W, H)
    paint(F.a, edist(W, H, CX, CY, 22, 9) <= 1, '#2a2024', 120)
    paint(F.a, edist(W, H, CX, CY, 12, 5) <= 1, '#1a1014', 140)
    rr = random.Random(21)
    for k in range(9):
        a = math.radians(k * 40 + rr.uniform(-12, 12))
        Ln = rr.uniform(24, 38)
        x, y = CX, CY
        pts = [(x, y)]
        for s in range(5):
            aa = a + rr.uniform(-.4, .4)
            st = Ln / 5
            x += st * math.cos(aa)
            y += st * .5 * math.sin(aa)
            pts.append((x, y))
        for i, (p0, p1) in enumerate(zip(pts, pts[1:])):
            F.line(p0[0], p0[1] + 1, p1[0], p1[1] + 1, '#6a5a4a')
            F.line(p0[0], p0[1], p1[0], p1[1], '#1a1014')
            if i < 2:
                F.line(p0[0] + 1, p0[1], p1[0] + 1, p1[1], '#1a1014')
        if k % 2 == 0:
            q = pts[3]
            b = a + .7
            F.line(q[0], q[1], q[0] + 8 * math.cos(b), q[1] + 4 * math.sin(b), '#1a1014')
    for _ in range(14):
        a = rr.uniform(0, 2 * math.pi)
        d = rr.uniform(20, 44)
        x, y = CX + d * math.cos(a), CY + d * .5 * math.sin(a)
        s = rr.uniform(1.5, 3)
        F.part(ell(x, y, s, s * .7), rr.choice(['#5a4632', '#6e5a44', '#4a3a2a']), ol='#1e140e', light=.35)
    out = compose(F)
    out[..., 3] = (out[..., 3] * fade).astype(np.uint8)
    return out


def terra_frame(stage):
    W, H = 128, 96
    CX, CY = 64, 58
    F = Frame(W, H)
    sh = shadow_layer(CX, 30, 6, 80, W, H, CY + 2)
    rr = random.Random(40 + stage)
    if stage == 0:
        F.part(ell(CX, CY - 3, 26, 8) + ell(CX - 9, CY - 6, 11, 6) + ell(CX + 8, CY - 5, 12, 6) + ell(CX + 1, CY - 8, 9, 5),
               '#5a4632', tex=.35, light=.3,
               marks=[(ell(CX - 6, CY - 6, 10, 3), '#6e5a44'), (ell(CX + 8, CY, 10, 3), '#3e3024')])
        for k in range(4):
            a = k * 1.6
            F.line(CX + 4 * math.cos(a), CY - 3, CX + 16 * math.cos(a), CY - 3 + 5 * math.sin(a), '#1e140e')
        chips(F, CX, CY - 2, 6, '#6e5a44', 4, spread=30, dark='#1e140e')
    elif stage == 1:
        F.part(ell(CX, CY - 4, 28, 9) + ell(CX - 10, CY - 7, 12, 6) + ell(CX + 9, CY - 6, 13, 6) + ell(CX, CY - 10, 10, 5),
               '#5a4632', tex=.35, light=.3,
               marks=[(ell(CX + 8, CY, 10, 3), '#3e3024')])
        for k in range(6):
            a = k * 1.05 + .3
            pts = [(CX, CY - 4), (CX + 10 * math.cos(a), CY - 4 + 4 * math.sin(a)),
                   (CX + 22 * math.cos(a + .2), CY - 4 + 8 * math.sin(a + .2))]
            for p0, p1 in zip(pts, pts[1:]):
                F.line(p0[0], p0[1], p1[0], p1[1], '#140c0c')
                F.line(p0[0], p0[1] + 1, p1[0], p1[1] + 1, '#c8323a')
        F.part(ell(CX, CY - 4, 5, 2), '#140c0c', ol='#1e140e')
        glow(F, CX, CY - 4, 14, '#c8323a', 110)
        for _ in range(8):
            x, y = CX + rr.uniform(-20, 20), CY - 14 - rr.uniform(0, 14)
            F.part(ell(x, y, 1.8, 1.4), '#6e5a44', ol='#1e140e', layer=F.fx)
    else:
        for k in range(7):
            a = math.pi + k * math.pi / 6
            x, y = CX + 26 * math.cos(a), CY - 4 + 10 * math.sin(a)
            F.part(poly((x - 6, y + 3), (x + 6, y + 3), (x + 3, y - 4), (x - 4, y - 5)), '#5a4632', tex=.3, light=.35)
        F.part(ell(CX, CY - 2, 22, 8), '#140c0c', ol='#1e140e')
        paint(F.a, edist(W, H, CX, CY, 14, 4) <= 1, '#6a1420', 255)
        paint(F.a, edist(W, H, CX, CY + 1, 7, 2) <= 1, '#c8323a', 255)
        for k in range(6):
            a = k * math.pi / 5
            x, y = CX + 25 * math.cos(a), CY + 1 + 9 * math.sin(a)
            F.part(poly((x - 6, y - 2), (x + 6, y - 2), (x + 5, y + 4), (x - 5, y + 4)), '#6e5a44', tex=.3, light=.35,
                   marks=[(rect(x - 6, y + 2, x + 6, y + 4), '#3e3024')])
        glow(F, CX, CY - 2, 26, '#c8323a', 90)
        for _ in range(12):
            x, y = CX + rr.uniform(-34, 34), CY - 12 - rr.uniform(0, 36)
            s = rr.uniform(1.4, 2.8)
            F.part(ell(x, y, s, s * .8), rr.choice(['#6e5a44', '#5a4632']), ol='#1e140e', layer=F.fx, light=.35)
        dust(F, CX - 30, CY + 4, 4)
        dust(F, CX + 28, CY + 3, 4)
    return compose(F, shadow=sh)


def make_aviso():
    frames = [aviso_mark(r, pulse=i % 2) for i, r in enumerate((60, 48, 38, 31))]
    frames += [aviso_mark(0, True, 0), aviso_mark(0, True, 1)]
    frames += [aviso_shadow(15, 90), aviso_shadow(30, 130), aviso_shadow(48, 170)]
    frames += [crack_frame(1.0), crack_frame(.45)]
    frames += [terra_frame(0), terra_frame(1), terra_frame(2)]
    save(grid(frames, 7), 'map_aviso_spawn')


# =====================================================================
# RUNAS (192x128) + FEIXE (96x256)
# =====================================================================
def runas_frame(s, rot_, inten):
    W, H = 192, 128
    CX, CY = 96, 64
    F = Frame(W, H)
    L = F.fx
    rx, ry = 88 * s, 44 * s
    paint(F.a, edist(W, H, CX, CY, rx + 2, ry + 1) <= 1, '#2a0e12', 110)
    glow(F, CX, CY, rx * .9, '#c8323a', 70 * inten)
    paint(L, ering(W, H, CX, CY, rx, ry, 3.2), '#c8323a', 255)
    paint(L, ering(W, H, CX, CY, rx - 1, ry - .5, 1.2), '#ff5a5a', 255)
    paint(L, ering(W, H, CX, CY, rx * .68, ry * .68, 2.5), '#c8323a', 255)
    paint(L, ering(W, H, CX, CY, rx * .68 - .8, ry * .68 - .4, 1), '#ff5a5a', 255)
    paint(L, ering(W, H, CX, CY, rx * .3, ry * .3, 1.5), '#ff5a5a', 230)
    for k in range(24):
        a = math.radians(k * 15 + rot_ * 2)
        if k % 3 == 0:
            F.px(CX + (rx - 1.5) * math.cos(a), CY + (ry - .8) * math.sin(a), '#ffd0c8', L)
    for k in range(6):
        a = math.radians(k * 60 + rot_ + 30)
        for t in np.linspace(.3, .68, int(30 * s) + 2):
            F.px(CX + rx * t * math.cos(a), CY + ry * t * math.sin(a), '#ff5a5a', L)
        F.px(CX + rx * .68 * math.cos(a), CY + ry * .68 * math.sin(a) - 1, '#ffd0c8', L)
    if s > .45:
        for k in range(12):
            a = math.radians(k * 30 + rot_)
            x = CX + rx * .84 * math.cos(a) - 1.5
            y = CY + ry * .84 * math.sin(a) - 2.5
            glyph(F, GLYPHS[k % len(GLYPHS)], x, y, '#ff5a5a' if k % 2 else '#ff9a8a')
    else:
        for k in range(12):
            a = math.radians(k * 30 + rot_)
            F.px(CX + rx * .84 * math.cos(a), CY + ry * .84 * math.sin(a), '#ff9a8a', L)
    cr = 11 * s + 2
    m = (edist(W, H, CX, CY, cr, cr * .6) <= 1) & (edist(W, H, CX + cr * .45, CY - cr * .1, cr * .85, cr * .55) > 1)
    paint_ol(F, m, '#ff5a5a', '#3a0810')
    hm = m & (edist(W, H, CX - 1, CY, cr, cr * .6) > .8)
    paint(L, hm, '#ffd0c8', 255)
    glow(F, CX, CY, 20 * s + 6, '#ff5a5a', 120 * inten)
    rr = random.Random(int(s * 100))
    for _ in range(int(20 * s)):
        a = rr.uniform(0, 2 * math.pi)
        d = rr.uniform(.3, 1)
        x = CX + rx * d * math.cos(a)
        y = CY + ry * d * math.sin(a) - rr.uniform(2, 16)
        F.px(x, y, rr.choice(['#ff9a8a', '#ff5a5a', '#ffd0c8']), L)
    return compose(F)


def feixe_frame(k):
    W, H, GY = 96, 256, 232
    CX = 48
    hw = [3.5, 30, 20, 15][k]
    F = Frame(W, H)
    L = F.fx
    yy, xx = np.mgrid[0:H, 0:W]
    widen = 1 + (GY - yy) / GY * .15
    d = np.abs(xx + .5 - CX) / (hw * widen)
    d = np.where(yy <= GY, d, 9)
    cols = ['#a8202a', '#ff5a5a', '#ffb0a0', '#fff0ec']
    alphas = [110, 170, 220, 250]
    lvl = np.floor(np.clip(1 - d, 0, 1) * 4.0 + ((xx + yy) % 2) * .35)
    lvl = np.clip(lvl, 0, 4)
    fade = np.ones((H, W))
    if k == 3:
        fade = np.clip((yy - 90) / 90.0 + ((xx + yy) % 2) * .12, 0, 1)
        fade = np.floor(fade * 5) / 5
    for i in range(4):
        m = (lvl == i + 1) & (fade > 0)
        src = np.zeros((H, W, 4), np.uint8)
        src[m, :3] = hexc(cols[i])
        src[m, 3] = (alphas[i] * fade[m]).astype(np.uint8)
        L[:] = over(L, src)
    if k in (1, 2):
        rs = random.Random(30 + k)
        y0 = (k * 7) % 17
        while y0 < GY - 8:
            m = (np.abs(yy - y0) < 1) & (d < rs.uniform(.25, .55)) & (xx % 3 != 0)
            paint(L, m, '#ffffff', 110)
            y0 += rs.randint(12, 30)
    gr = hw * 1.6 + 6
    paint(L, edist(W, H, CX, GY, gr, gr * .28) <= 1, '#c8323a', 120)
    paint(L, edist(W, H, CX, GY, gr * .65, gr * .2) <= 1, '#ff5a5a', 170)
    paint(L, edist(W, H, CX, GY, gr * .3, gr * .1) <= 1, '#fff0ec', 220)
    if k == 1:
        glow(F, CX, GY - 6, 46, '#ffffff', 200)
        paint(L, edist(W, H, CX, GY, 44, 11) <= 1, '#ffffff', 170)
        for a in range(0, 360, 30):
            r = math.radians(a)
            for t in range(10, 22):
                F.px(CX + t * 2 * math.cos(r), GY + t * .5 * math.sin(r), '#fff0ec', L)
    rr = random.Random(k)
    for _ in range([6, 26, 18, 14][k]):
        x = CX + rr.uniform(-hw * 2, hw * 2)
        y = rr.uniform(GY - 120, GY)
        if k == 3 and y < 140:
            continue
        F.px(x, y, rr.choice(['#ff9a8a', '#ffd0c8', '#ff5a5a']), L)
        F.px(x, y + 1, '#a8202a', L, 160)
    return compose(F)


def make_runas():
    save(strip([runas_frame(.35, 0, .5), runas_frame(.6, 15, .7), runas_frame(.85, 30, .9), runas_frame(1, 45, 1)]),
         'map_runas_respawn')
    save(strip([feixe_frame(k) for k in range(4)]), 'map_feixe_lua')


ALL.update({'portal': make_portal, 'aviso': make_aviso, 'runas': make_runas})


# =====================================================================
# BARRICADA (128x128)
# =====================================================================
WOOD = '#9a6a3c'
WOOD2 = '#7d5430'
WOODD = '#5a3a22'
NAIL = '#c9c3b0'
CHIP = '#c9a070'


def plank(F, x0, y0, L, th, deg=0, col=WOOD, seed=0, stripes=False, paint_=False, crack=False, nails=True,
          broken_end=False, layer=None):
    rr = random.Random(seed)
    cx, cy = x0, y0 + th / 2
    marks = []
    if stripes:
        for k in range(int(L / 10) + 1):
            sx = x0 + k * 10
            marks.append((poly((sx, y0), (sx + 5, y0), (sx + 9, y0 + th), (sx + 4, y0 + th)), MOONRED if k % 2 else '#e8e0cc'))
    if paint_:
        marks.append((rect(x0 + L * .3, y0 + 2, x0 + L * .36, y0 + th - 2), MOONRED))
        marks.append((rect(x0 + L * .4, y0 + 2, x0 + L * .46, y0 + th - 2), MOONRED))
        marks.append((rect(x0 + L * .46, y0 + 2, x0 + L * .5, y0 + 4), MOONRED))
        marks.append((rect(x0 + L * .55, y0 + 2, x0 + L * .6, y0 + th - 2), MOONRED))
        marks.append((rect(x0 + L * .6, y0 + th - 4, x0 + L * .64, y0 + th - 2), MOONRED))
    for _ in range(2):
        kx = x0 + rr.uniform(.1, .9) * L
        marks.append((ell(kx, y0 + th * rr.uniform(.3, .7), 2, 1.2), WOODD))
    marks.append((rect(x0, y0 + th - 2, x0 + L, y0 + th), WOODD))
    if broken_end:
        shp = poly((x0, y0), (x0 + L - 4, y0), (x0 + L, y0 + 2), (x0 + L - 3, y0 + 4), (x0 + L + 1, y0 + 6),
                   (x0 + L - 2, y0 + th), (x0, y0 + th))
    else:
        shp = rect(x0, y0, x0 + L, y0 + th)
    shp = rot(shp, cx, cy, deg)
    marks = [(rot(m, cx, cy, deg), c) for m, c in marks]
    F.part(shp, col, marks=marks, tex=.3, light=.25, layer=layer)
    # veios
    for k in range(2):
        gy = y0 + 2 + k * (th - 4) / 1.5
        a = x0 + rr.uniform(2, 10)
        b = x0 + L - rr.uniform(2, 14)
        p0 = rp(a, gy, cx, cy, deg)
        p1 = rp(b, gy + rr.uniform(-1, 1), cx, cy, deg)
        F.line(p0[0], p0[1], p1[0], p1[1], '#6a4628', layer)
    if crack:
        px_, py_ = x0 + L * .55, y0
        pts = [(px_, py_), (px_ + 3, y0 + th * .4), (px_ + 1, y0 + th * .7), (px_ + 4, y0 + th)]
        pts = [rp(x, y, cx, cy, deg) for x, y in pts]
        for p0, p1 in zip(pts, pts[1:]):
            F.line(p0[0], p0[1], p1[0], p1[1], '#1e120c', layer)
        q = rp(px_ + 3, y0 + th * .4, cx, cy, deg)
        F.line(q[0], q[1], q[0] + 8, q[1] + 1, '#1e120c', layer)
    if nails:
        for t in (4, L - 6):
            p = rp(x0 + t, y0 + th / 2 - 1, cx, cy, deg)
            F.px(p[0], p[1], NAIL, layer)
            F.px(p[0] + 1, p[1] + 1, '#2a2226', layer)


def sawhorse(F, cx, top, bot, w=8, col=WOOD2, deg=0, pc=None):
    pc = pc or (cx, bot)
    a = rot(limb(cx - 14, top, cx + 12, bot, w), pc[0], pc[1], deg)
    b = rot(limb(cx + 14, top, cx - 12, bot, w), pc[0], pc[1], deg)
    F.part(a, WOODD, tex=.3, light=.2)
    F.part(b, col, tex=.3, light=.25)
    # amarração de arame
    m = rp(cx, (top + bot) / 2 + 1, pc[0], pc[1], deg)
    F.part(ell(m[0], m[1], 4, 3), '#8d969c', light=.4)
    F.px(m[0] - 1, m[1], '#3a3f44'); F.px(m[0] + 1, m[1] - 1, '#3a3f44')


def barbed(F, x0, x1, y):
    x = x0
    while x < x1:
        for a in range(0, 360, 20):
            r = math.radians(a)
            F.px(x + 4 * math.cos(r), y + 3 * math.sin(r), '#8d969c' if a < 180 else '#5a6066')
        F.px(x + 4, y - 3, '#c9ced4'); F.px(x + 5, y - 4, '#c9ced4')
        x += 6


def barricada_frame(st):
    W, H, GY = 128, 128, 112
    F = Frame(W, H)
    sh = shadow_layer(64, 56, 4.5, 100, W, H, GY)
    if st < 2:
        # pneu velho no pé esquerdo
        F.part(ell(14, GY - 4, 9, 5), '#2a2628', light=.3)
        F.part(ell(14, GY - 5, 4, 2), '#141014', outline=False)
        sawhorse(F, 26, 52, GY, 8)
        sawhorse(F, 102, 52, GY, 8)
        plank(F, 6, 58, 116, 11, -2, WOOD, 1, stripes=True)
        if st == 0:
            plank(F, 8, 72, 112, 10, 1, '#8b5e34', 2, paint_=True)
        else:
            plank(F, 22, 72, 70, 10, 14, '#8b5e34', 2, paint_=True, broken_end=True, crack=True)
        plank(F, 4, 86, 118, 10, -1, WOOD, 3, crack=(st == 1))
        # tábua vertical de reforço
        plank(F, 60, 52, 46, 8, 90, '#a8784a', 4)
        if st == 0:
            barbed(F, 10, 118, 56)
        else:
            barbed(F, 10, 60, 56)
            barbed(F, 80, 118, 57)
        # saco de areia
        F.part(ell(52, GY - 3, 10, 5), '#a8946a', tex=.4, light=.3, marks=[(rect(50, GY - 7, 51, GY), '#7a6a48')])
        F.part(ell(70, GY - 3, 9, 5), '#9a8660', tex=.4, light=.3)
        # sangue seco
        F.flat(ell(40, 92, 3, 2), DRYB)
        F.px(44, 94, DRYB); F.px(43, 97, DRYB); F.px(40, 95, DRYB)
        if st == 1:
            chips(F, 70, 84, 12, CHIP, 9, spread=24, dark='#3a2414')
            for (x, y) in ((92, 66), (60, 90)):
                F.line(x, y, x + 5, y + 3, CHIP, F.fx)
            impact(F, 94, 76, 5)
    else:
        F.flat(ell(64, GY - 2, 50, 7), '#2a1e16', alpha=90)
        F.part(limb(8, 98, 46, 108, 7), WOODD, tex=.3)
        F.part(limb(10, 108, 44, 96, 7), WOOD2, tex=.3)
        F.part(ell(27, 102, 4, 3), '#8d969c', light=.4)
        plank(F, 40, 98, 70, 9, 8, '#8b5e34', 12, paint_=True, broken_end=True)
        plank(F, 6, 100, 60, 9, -6, WOOD, 13, broken_end=True, stripes=True)
        plank(F, 58, 92, 52, 8, -20, '#a8784a', 14, broken_end=True)
        plank(F, 20, 104, 96, 9, 2, WOOD, 15, crack=True)
        # cavalete tombado
        F.part(limb(84, 104, 118, 96, 7), WOODD, tex=.3)
        F.part(limb(86, 96, 116, 108, 7), WOOD2, tex=.3)
        F.part(ell(14, GY - 3, 9, 4.5), '#2a2628', light=.3)
        F.part(ell(14, GY - 4, 4, 1.8), '#141014', outline=False)
        F.part(ell(64, GY + 1, 10, 4), '#a8946a', tex=.4, light=.3)
        # serragem e lascas
        rr = random.Random(33)
        for _ in range(40):
            F.px(rr.uniform(20, 110), rr.uniform(100, 116), rr.choice([CHIP, '#d8b888', '#a8845a']))
        barbed(F, 30, 60, 94)
    return compose(F, shadow=sh)


def make_barricada():
    save(strip([barricada_frame(s) for s in range(3)]), 'map_barricada_caminho')


# =====================================================================
# PORTA DE ENROLAR (128x160)
# =====================================================================
def porta_frame(st):
    W, H, GY = 128, 160, 148
    F = Frame(W, H)
    sh = shadow_layer(64, 60, 4, 90, W, H, GY)
    # parede
    wm = [(rect(4, 120, 124, GY), '#77736e'), (rect(4, 8, 124, 12), '#a8a49c')]
    rr = random.Random(2)
    for _ in range(14):  # azulejos sobrando
        x = rr.choice([rr.uniform(5, 14), rr.uniform(112, 120)])
        y = rr.uniform(96, 140)
        wm.append((rect(x, y, x + 5, y + 5), '#4a7ea8' if rr.random() < .7 else '#e8e4d8'))
    wm.append((ell(110, 40, 10, 14), '#5e5a58'))
    F.part(rect(4, 8, 124, GY), CONC, marks=wm, tex=.35, light=.18)
    for (a, b) in (((8, 60), (12, 70)), ((12, 70), (9, 80)), ((116, 100), (120, 110)), ((120, 110), (118, 118))):
        F.line(a[0], a[1], b[0], b[1], '#3a3436')
    # pichação na parede
    F.line(6, 50, 12, 44, MOONRED); F.line(12, 44, 14, 52, MOONRED)
    # interior
    lift = {0: 0, 1: 9, 2: 26, 3: 104}[st]
    F.part(rect(20, 34, 108, GY), '#120e14', shade=False, ol='#2a2228')
    if lift:
        F.part(rect(30, 96, 54, 118), '#2a2034', light=.15, marks=[(rect(30, 105, 54, 107), '#1e1828')])
        F.part(rect(34, 118, 62, GY - 1), '#2e2438', light=.15)
        F.part(rect(66, 126, 84, GY - 1), '#2a2034', light=.15)
        F.part(rect(86, 70, 104, 72), '#2a2034')
        F.part(rect(86, 92, 104, 94), '#2a2034')
        F.part(rect(88, 80, 94, 92), '#3a2a3a')
        F.part(rect(96, 84, 102, 92), '#2e3a34')
        F.part(ell(76, GY - 3, 3, 2), '#4a4a58')
        if st < 3:
            # luz entrando pela fresta
            F.flat(poly((22, GY), (106, GY), (100, GY - lift - 8), (26, GY - lift - 8)), '#4a3c5a', alpha=120)
    # trilhos
    for x in (16, 108):
        F.part(rect(x, 34, x + 4, GY), STEEL, marks=[(rect(x, 80, x + 4, 92), '#8a4e2e')], light=.3)
    # porta
    if st < 3:
        bL, bR = {0: (GY, GY), 1: (GY - 13, GY - 5), 2: (GY - 24, GY - 30)}[st]
        bottom = max(bL, bR)
        clipm = F.mask(poly((20, 34), (108, 34), (108, bR), (20, bL)))
        door = [(34 + k * 5, 34 + k * 5 + 5) for k in range(int((bottom - 34) / 5) + 1)]
        for i, (y, yb) in enumerate(door):
            c = '#8d969c' if i % 2 == 0 else '#848d93'
            marks = [(rect(20, yb - 1.2, 108, yb), '#5a6268'), (rect(20, y, 108, y + 1), '#a8b0b6')]
            if i % 5 == 2:
                rx0 = 22 + (i * 17) % 70
                marks.append((rect(rx0, yb - 2, rx0 + 4, yb), '#8a4e2e'))
            F.part(rect(20, y, 108, yb), c, marks=marks, outline=False, tex=.12, light=.15, clip=clipm)
        # amassado (sombra embaixo-direita, luz em cima-esquerda)
        dent = edist(128, 160, 72, 74, 14, 9) <= 1
        dl = dent & (edist(128, 160, 69, 71, 13, 8) > 1)
        dd = dent & (edist(128, 160, 75, 77, 13, 8) > 1)
        paint(F.a, dent & clipm, '#6b747a', 120)
        paint(F.a, dd & clipm, '#b8c0c6', 255)
        paint(F.a, dl & clipm, '#4a5258', 255)
        o = dilate(clipm) & ~clipm
        F.a[o, :3] = (34, 36, 42)
        F.a[o, 3] = 255
        # pichação
        for (a, b, c) in (((30, 50), (38, 66), MOONRED), ((38, 66), (46, 50), MOONRED), ((30, 66), (46, 50), '#a82830')):
            F.line(a[0], a[1], b[0], b[1], c); F.line(a[0] + 1, a[1], b[0] + 1, b[1], c)
        for x in (78, 84, 90):
            F.line(x, 100, x + 3, 106, MOONRED)
        F.line(56, 96, 66, 96, '#e8e4d8'); F.line(58, 99, 64, 99, '#e8e4d8')
        # barra de baixo + puxador + cadeado quebrado
        F.part(poly((20, bL - 5), (108, bR - 5), (108, bR), (20, bL)), '#6b747a', light=.3)
        hy = (bL + bR) / 2 - 3
        F.part(rect(58, hy - 1, 70, hy + 1), NAIL)
        ly = bL + (bR - bL) * (16 / 88) - 2
        F.part(ell(36, ly - 1, 2.5, 3), '#8d969c', outline=True)
        F.part(rect(33, ly + 1, 39, ly + 7), '#c9a040', light=.35)
        F.px(36, ly + 4, '#1e1a16')
        lift = GY - bottom
        if st == 0:
            for (x, y, s) in ((30, GY - 1, 2), (96, GY - 2, 2.5), (100, GY, 1.5), (60, GY, 1.6)):
                F.part(ell(x, y, s, s * .7), '#6e6a66', light=.3)
            F.part(rect(84, GY - 3, 90, GY), '#a8b0b6')
        if st in (1, 2):
            sx = 106 if st == 1 else 22
            ys = (bR - 4) if st == 1 else (bL - 4)
            spark_burst(F, sx, ys, 7, 10, st + 5)
            spark_burst(F, 64, (bL + bR) / 2 + 1, 4, 6, st + 9)
            dust(F, 30, GY - 1, 3)
            dust(F, 96, GY - 1, 3)
    else:
        # porta enrolada: rolo grosso sob a caixa e 2 lâminas aparecendo
        F.part(rect(20, 34, 108, 42), '#8d969c', marks=[(rect(20, 37, 108, 38), '#5a6268')], light=.2)
        F.part(rect(20, 42, 108, 46), '#6b747a', light=.3)
        F.part(rect(60, 44, 68, 46), NAIL)
        for (x, y, s) in ((40, GY - 1, 2), (92, GY - 1, 2.2)):
            F.part(ell(x, y, s, s * .7), '#6e6a66', light=.3)
    # caixa do rolo
    bm = [(rect(14, 30, 114, 34), '#5e666c'), (rect(40, 14, 60, 20), '#8a4e2e'), (rect(86, 22, 98, 32), '#8a4e2e')]
    F.part(rect(14, 14, 114, 34), '#7d848c', marks=bm, tex=.25, light=.3)
    if st == 3:
        F.part(ell(64, 34, 48, 5), '#8d969c', light=.4, marks=[(rect(16, 34, 112, 39), '#6b747a')])
    for x in (18, 40, 64, 88, 110):
        rivet(F, x, 17)
    return compose(F, shadow=sh)


def make_porta():
    save(strip([porta_frame(s) for s in range(4)]), 'map_porta_emperrada')


# =====================================================================
# ÍCONES DO MAPA (64x64)
# =====================================================================
def medal(F, bg, bg2):
    F.part(poly((24, 44), (40, 44), (32, 59)), '#1e1418', shade=False)
    F.part(ell(32, 28, 24, 24), '#1e1418', shade=False, ol='#0c080a')
    F.part(ell(32, 28, 21, 21), bg, shade=False, ol='#3a2a2e',
           marks=[(poly((10, 34), (54, 22), (54, 50), (10, 50)), bg2)])
    for a in range(200, 290, 6):
        r = math.radians(a)
        F.px(32 + 19.5 * math.cos(r), 28 + 19.5 * math.sin(r), '#ffffff', alpha=150)


def skull(F, cx, cy, r, eyes='#c8323a', scar=False):
    F.part(ell(cx, cy, r, r * .92) + rect(cx - r * .55, cy + r * .4, cx + r * .55, cy + r * 1.05), '#e8e0cc', light=.25, dark=.2)
    F.part(ell(cx - r * .42, cy + r * .1, r * .3, r * .32), '#1e1418', shade=False, outline=False)
    F.part(ell(cx + r * .42, cy + r * .1, r * .3, r * .32), '#1e1418', shade=False, outline=False)
    F.px(cx - r * .42, cy + r * .1, eyes); F.px(cx + r * .42, cy + r * .1, eyes)
    F.px(cx - r * .42 + 1, cy + r * .1, eyes); F.px(cx + r * .42 + 1, cy + r * .1, eyes)
    F.part(poly((cx, cy + r * .4), (cx - 1.4, cy + r * .65), (cx + 1.4, cy + r * .65)), '#1e1418', shade=False, outline=False)
    for k in (-2, 0, 2):
        F.line(cx + k * r * .17, cy + r * .78, cx + k * r * .17, cy + r * 1.02, '#3a2e2a')
    if scar:
        F.line(cx + r * .2, cy - r * .9, cx + r * .7, cy + r * .5, '#8a2a20')
        for t in (0.3, 0.6):
            x = cx + r * .2 + (r * .5) * t
            y = cy - r * .9 + (r * 1.4) * t
            F.line(x - 1.5, y, x + 1.5, y, '#8a2a20')


def icon(kind):
    F = Frame(64, 64)
    sh = shadow_layer(32, 9, 2, 90, 64, 64, 59)
    if kind == 'bau':
        medal(F, '#3a4a5a', '#2e3a48')
        F.part(rect(19, 30, 45, 43), WOOD, marks=[(rect(19, 40, 45, 43), WOODD)], tex=.2)
        F.part(poly((19, 30), (45, 30), (43, 23), (21, 23)), '#a8784a', tex=.2)
        for x in (23, 39):
            F.part(rect(x, 23, x + 3, 43), NAIL, light=.3)
        F.part(rect(30, 28, 34, 34), GOLD, ol='#3a2a08')
        text(F, '?', 28, 6, col=GOLD, sc=2, ol='#3a2a08', layer=F.a)
    elif kind == 'boss':
        medal(F, MOONRED, '#7a1a22')
        for s in (-1, 1):
            F.part([[(32 + s * 7, 21), (32 + s * 11, 17), (32 + s * 16, 13), (32 + s * 18, 6), (32 + s * 20, 13),
                     (32 + s * 17, 20), (32 + s * 11, 25)]], '#3a2a24', light=.3,
                   marks=[(poly((32 + s * 16, 13), (32 + s * 18, 6), (32 + s * 19.5, 12)), '#e8e0cc')])
        skull(F, 32, 27, 10.5)
        glow(F, 28, 29, 4, '#ff5a5a', 120)
        glow(F, 37, 29, 4, '#ff5a5a', 120)
    elif kind == 'mini':
        medal(F, '#d07a2a', '#a05a1a')
        skull(F, 32, 28, 8, eyes='#ffb040', scar=True)
    elif kind == 'limpa':
        medal(F, '#2a5a34', '#1e4428')
        F.part(poly((17, 29), (23, 23), (29, 30), (43, 14), (49, 20), (29, 40)), '#6fdc7a', ol='#0e2a14', light=.3)
    elif kind == 'escura':
        medal(F, '#241a30', '#140e1c')
        for a in range(0, 360, 45):
            r = math.radians(a - 90)
            for t in (13, 14, 16):
                F.px(32 + t * math.cos(r), 26 + t * math.sin(r), '#3e3450')
        F.part(ell(32, 25, 8.5, 9), '#5a5a66', light=.3,
               marks=[(ell(30, 23, 2, 3), '#7a7a88')])
        F.line(29, 23, 31, 27, '#2a2a34'); F.line(31, 27, 34, 24, '#2a2a34')
        F.part(rect(28, 32, 36, 40), '#8d969c', marks=[(rect(28, 34, 36, 35), '#5a6268'), (rect(28, 37, 36, 38), '#5a6268')])
        F.part(rect(30, 40, 34, 42), '#3a3a44')
    elif kind == 'sobrev':
        medal(F, '#4a8fe0', '#3470b8')
        F.part(rect(23, 36, 41, 46), '#5a8a50', shade=False, ol='#1e2a1a')
        F.part(ell(30, 28, 8, 8.5), '#c48a5a', light=.25)
        F.part(poly((22, 26), (24, 20), (30, 18), (37, 20), (38, 26), (34, 23), (26, 23)), '#3a2a20', light=.3)
        F.px(27, 29, '#1e1418'); F.px(33, 29, '#1e1418')
        F.line(28, 33, 32, 33, '#7a4a30')
        F.part(ell(43, 15, 8, 5.5) + poly((37, 18), (41, 19), (36, 23)), '#f4efe6', shade=False, ol='#1a0f14')
        for x in (40, 43, 46):
            F.px(x, 15, '#4a8fe0')
    elif kind == 'abrigo':
        medal(F, '#6a5030', '#4a3820')
        F.part(poly((14, 40), (32, 12), (50, 40)), '#5f7a4a', tex=.2,
               marks=[(poly((32, 12), (50, 40), (34, 40)), '#4a6139'), (rect(24, 30, 30, 34), '#8a7a52')])
        F.part(poly((27, 40), (32, 25), (37, 40)), '#1e1418', shade=False)
        F.part(rect(30, 41, 42, 44), '#5a3a22')
        F.part(poly((32, 41), (36, 33), (40, 41)), '#ff9a3a', shade=False, ol='#5a1a0a')
        F.part(poly((34, 41), (36, 36), (38, 41)), '#ffe080', shade=False, outline=False)
    elif kind == 'heroi':
        F.part(ell(32, 24, 19, 19) + poly((18, 32), (46, 32), (32, 60)), '#ffffff', shade=False, ol='#1a0f14')
        F.part(ell(32, 24, 16, 16) + poly((21, 32), (43, 32), (32, 55)), '#d23a34', light=.25,
               marks=[(ell(28, 18, 6, 4), '#e65a4a')])
        F.part(ell(32, 24, 10, 10), '#2a1e24', shade=False)
        F.part(ell(32, 26, 7, 7.5), '#c48a5a', light=.25)
        F.part(poly((24, 23), (26, 17), (32, 15), (39, 17), (40, 23), (35, 20), (28, 21)), '#241a14', light=.3)
        F.px(30, 27, '#1e1418'); F.px(35, 27, '#1e1418')
        F.line(31, 31, 34, 31, '#7a4a30')
    return compose(F, shadow=sh)


def make_icones():
    save(strip([icon(k) for k in ('bau', 'boss', 'mini', 'limpa', 'escura', 'sobrev', 'abrigo', 'heroi')]),
         'map_sobrevivente_marca')


# =====================================================================
# LANTERNA (128x128)
# =====================================================================
def make_lanterna():
    W = H = 128
    d = edist(W, H, 64, 64, 60, 60)
    f0 = light_rgba(d, 150, '#ffc860', '#fff0c0', 6, core=('#fffaf0', .12))
    yy, xx = np.mgrid[0:H, 0:W]
    dx, dy = xx + .5 - 14, yy + .5 - 64
    r = np.hypot(dx, dy)
    ang = np.abs(np.arctan2(dy, dx))
    a0 = math.radians(25)
    v = np.clip(1 - r / 112, 0, 1) ** .55 * np.clip(1 - (ang / a0) ** 2, 0, 1)
    v = np.where(dx > 0, v, 0)
    vh = np.clip(1 - r / 18, 0, 1) * .8
    v = np.maximum(v, vh)
    f1 = light_rgba(1 - v, 160, '#ffc860', '#fff0c0', 6, core=None)
    lens = edist(W, H, 18, 64, 5, 8) <= 1
    f1[lens, :3] = hexc('#fffaf0')
    f1[lens, 3] = 200
    d2 = edist(W, H, 64, 64, 54, 54)
    f2 = light_rgba(d2, 120, '#a8a0d8', '#f0eeff', 4, core=('#ffffff', .1))
    rg = ering(W, H, 64, 64, 54, 54, 2)
    f2[rg, :3] = 255
    f2[rg, 3] = 160
    f3 = np.zeros((H, W, 4), np.uint8)
    rr = np.hypot(xx + .5 - 64, yy + .5 - 64)
    t = np.clip((rr - 48) / 6.0, 0, 1)
    t = np.floor(t * 4 + ((xx + yy) % 2) * .5) / 4
    t = np.clip(t, 0, 1)
    f3[..., :3] = hexc('#0c0814')
    f3[..., 3] = (235 * t).astype(np.uint8)
    save(strip([f0, f1, f2, f3]), 'map_lanterna_luz')


# =====================================================================
# DECALQUES DE SANGUE (128x64)
# =====================================================================
def erode(m):
    return ~dilate(~m)


def blood(F, m, a=230, seed=0, cracks=False, core=None):
    L = F.a
    paint(L, m, '#5a1418', a)
    paint(L, m & ~erode(m), '#3a0c10', a)
    if core is not None:
        paint(L, core & m, '#7a1a22', a)
        hl = core & m & ~shift(core, 1, 1)
        paint(L, hl, '#a8303a', a)
    if cracks:
        rr = random.Random(seed)
        ys, xs = np.nonzero(erode(erode(m)))
        for _ in range(7):
            i = rr.randrange(len(xs))
            x, y = xs[i], ys[i]
            for k in range(rr.randint(3, 6)):
                x2, y2 = x + rr.uniform(-4, 4), y + rr.uniform(-2, 2)
                if 0 <= int(y2) < m.shape[0] and 0 <= int(x2) < m.shape[1] and m[int(y2), int(x2)]:
                    F.line(x, y, x2, y2, '#2a080c')
                    x, y = x2, y2


def blobs(W, H, items):
    m = np.zeros((H, W), bool)
    for (cx, cy, rx, ry) in items:
        m |= edist(W, H, cx, cy, rx, ry) <= 1
    return m


def make_sangue():
    W, H = 128, 64
    frames = []
    rr = random.Random(5)
    # poça seca
    F = Frame(W, H)
    items = [(64, 32, 30, 11), (44, 28, 16, 8), (86, 36, 16, 7), (60, 40, 18, 6), (74, 24, 12, 6), (34, 36, 8, 4)]
    m = blobs(W, H, items)
    core = blobs(W, H, [(62, 31, 18, 6), (82, 35, 8, 3), (46, 28, 7, 3)])
    blood(F, m, 235, 1, cracks=True, core=core)
    for _ in range(14):
        a = rr.uniform(0, 2 * math.pi)
        d = rr.uniform(38, 52)
        x, y = 64 + d * math.cos(a), 32 + d * .38 * math.sin(a)
        s = rr.uniform(.8, 2.2)
        blood(F, edist(W, H, x, y, s * 1.3, s * .8) <= 1, 220)
    frames.append(compose(F))
    # rastro de arrasto
    F = Frame(W, H)
    m = np.zeros((H, W), bool)
    core = np.zeros((H, W), bool)
    rj = random.Random(8)
    for i in range(90):
        t = i / 89
        if t > .7 and rj.random() < t - .55:
            continue
        x = 18 + t * 104
        y = 40 - t * 16 + math.sin(t * 6) * 2.5
        w = 9 * (1 - t * .6) + 1
        m |= edist(W, H, x + rj.uniform(-1, 1), y + rj.uniform(-1.5, 1.5), 3, w * rj.uniform(.75, 1)) <= 1
        if i % 13 < 7 and t < .8:
            core |= edist(W, H, x, y - w * .25, 3, w * .3) <= 1
    m |= blobs(W, H, [(16, 41, 13, 10), (8, 46, 7, 5), (22, 34, 6, 4)])
    core |= blobs(W, H, [(15, 40, 7, 5)])
    blood(F, m, 228, 2, core=core)
    for k in (-5, -2, 2, 5):
        for i in range(70):
            t = i / 89
            x = 26 + t * 104
            y = 40 - t * 16 + math.sin(t * 6) * 2.5 + k * (1 - t * .6)
            if (i + k) % 10 < 7 and 0 <= int(y) < H and 0 <= int(x) < W and m[int(y), int(x)]:
                F.px(x, y, '#3a0c10', alpha=230)
    for k in range(4):   # dedos agarrando no começo
        for t in range(12):
            F.px(5 - t * .4, 34 + k * 3.4 + t * .3, '#5a1418', alpha=225 - t * 12)
            F.px(6 - t * .4, 34 + k * 3.4 + t * .3, '#3a0c10', alpha=200 - t * 12)
    for _ in range(14):
        x, y = rr.uniform(10, 120), rr.uniform(8, 56)
        blood(F, edist(W, H, x, y, rr.uniform(1.2, 2.2), rr.uniform(.8, 1.3)) <= 1, 210)
    frames.append(compose(F))
    # pegadas
    F = Frame(W, H)
    yy_, xx_ = np.mgrid[0:H, 0:W]
    for i in range(6):
        x = 12 + i * 20
        y = 32 + (6 if i % 2 else -6) - i * 1.2
        a = int(240 - i * 27)
        sole = blobs(W, H, [(x + 3.5, y, 5.5, 3.4), (x - 4.5, y, 3.4, 3.0)])
        sole &= ~(np.abs(xx_ + .5 - (x - .8)) < .9)
        paint(F.a, sole, '#5a1418', a)
        paint(F.a, sole & ~erode(sole), '#3a0c10', a)
        if i < 3:
            paint(F.a, sole & edist(W, H, x + 3, y - 1, 2.5, 1.4).__le__(1), '#7a1a22', a)
        for k in range(4):
            F.px(x + k * 2, y - 1, '#3a0c10', alpha=a)
            F.px(x + 1 + k * 2, y + 1, '#3a0c10', alpha=a)
        F.px(x - 5, y, '#3a0c10', alpha=a); F.px(x - 4, y - 1, '#3a0c10', alpha=a)
        if i < 2:
            blood(F, edist(W, H, x - 9, y + 2, 1.5, 1) <= 1, a)
            blood(F, edist(W, H, x + 11, y - 3, 1.2, .8) <= 1, a)
    frames.append(compose(F))
    # manchas / respingos
    F = Frame(W, H)
    for (cx, cy, s, ang) in ((24, 32, 10, .3), (70, 22, 7, -2.4), (102, 42, 11, 1.2)):
        m = edist(W, H, cx, cy, s, s * .6) <= 1
        m |= edist(W, H, cx + s * .4, cy + s * .2, s * .6, s * .4) <= 1
        core = edist(W, H, cx - 1, cy - 1, s * .55, s * .3) <= 1
        for k in range(10):
            a = k * 0.65 + cx
            Ln = s * rr.uniform(1.2, 1.8)
            x, y = cx + Ln * math.cos(a), cy + Ln * .6 * math.sin(a)
            m |= edist(W, H, x, y, 1.8, 1.2) <= 1
            m |= edist(W, H, (cx * .4 + x * .6), (cy * .4 + y * .6), 1.3, .9) <= 1
        for k in range(6):
            x = cx + (s + 3 + k * 3.4) * math.cos(ang)
            y = cy + (s + 3 + k * 3.4) * .6 * math.sin(ang)
            r = max(.8, 2.6 - k * .38)
            m |= edist(W, H, x, y, r * 1.6, r * .9) <= 1
        blood(F, m, 232, core=core)
    frames.append(compose(F))
    save(strip(frames), 'map_sangue_decal')


ALL.update({'barricada': make_barricada, 'porta': make_porta, 'icones': make_icones,
            'lanterna': make_lanterna, 'sangue': make_sangue})


if __name__ == '__main__':
    main()
