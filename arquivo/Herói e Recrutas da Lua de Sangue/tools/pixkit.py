"""Mini motor de pixel art procedural (128 px) para os pets da Lua de Sangue.

Cada parte do corpo é um conjunto de polígonos. Ao desenhar uma parte o motor:
  - preenche com a cor base (+ marcas/manchas recortadas dentro da parte),
  - aplica luz de cima-esquerda (lua) e sombra de baixo-direita com tom roxo da noite,
  - aplica textura de pelo/pena por pontilhado determinístico,
  - contorna com 1 px escuro (contorno seletivo: cor da parte escurecida).
Desenhar as partes de trás para frente gera as linhas internas automaticamente.
"""
import math
import numpy as np
from PIL import Image, ImageDraw

S = 128          # lado do quadro
G = 112          # linha do chão (y dos pés)
NIGHT = np.array([58, 40, 92], float)     # roxo da sombra
MOON = np.array([255, 236, 214], float)   # luz quente
INK = np.array([22, 14, 18], float)       # contorno


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def mix(a, b, t):
    return a * (1 - t) + b * t


# ---------------- formas (todas viram polígonos) ----------------

def ell(cx, cy, rx, ry, rot=0, n=None):
    n = n or max(12, int((rx + ry) * 1.6))
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        x, y = rx * math.cos(a), ry * math.sin(a)
        pts.append((cx + x * c - y * s, cy + x * s + y * c))
    return [pts]


def poly(*pts):
    return [list(pts)]


def limb(x0, y0, x1, y1, w0, w1=None):
    """segmento afunilado com pontas redondas (w = largura total)."""
    w1 = w0 if w1 is None else w1
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy) or 1e-6
    nx, ny = -dy / L, dx / L
    r0, r1 = w0 / 2, w1 / 2
    q = [(x0 + nx * r0, y0 + ny * r0), (x1 + nx * r1, y1 + ny * r1),
         (x1 - nx * r1, y1 - ny * r1), (x0 - nx * r0, y0 - ny * r0)]
    return [q] + ell(x0, y0, r0, r0) + ell(x1, y1, r1, r1)


def chain(pts, w0, w1=None):
    """cadeia de segmentos (rabos): largura interpola de w0 a w1."""
    w1 = w0 if w1 is None else w1
    out = []
    n = len(pts) - 1
    for i in range(n):
        a = w0 + (w1 - w0) * i / n
        b = w0 + (w1 - w0) * (i + 1) / n
        out += limb(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], a, b)
    return out


def rp(x, y, cx, cy, deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    x, y = x - cx, y - cy
    return (cx + x * c - y * s, cy + x * s + y * c)


def rot(shapes, cx, cy, deg):
    if not deg:
        return shapes
    return [[rp(x, y, cx, cy, deg) for (x, y) in p] for p in shapes]


def mv(shapes, dx, dy):
    return [[(x + dx, y + dy) for (x, y) in p] for p in shapes]


class Xf:
    """transformação de um grupo (ex.: cabeça): gira em torno do pivô e desloca."""

    def __init__(self, cx=0, cy=0, deg=0, dx=0, dy=0, sx=1, sy=1):
        self.cx, self.cy, self.deg, self.dx, self.dy, self.sx, self.sy = cx, cy, deg, dx, dy, sx, sy

    def p(self, x, y):
        x = self.cx + (x - self.cx) * self.sx
        y = self.cy + (y - self.cy) * self.sy
        x, y = rp(x, y, self.cx, self.cy, self.deg)
        return (x + self.dx, y + self.dy)

    def __call__(self, shapes):
        return [[self.p(x, y) for (x, y) in pl] for pl in shapes]


def two_bone(hx, hy, px, py, L, bend_dir=1):
    """joelho para perna de 2 ossos (cada osso L/2)."""
    d = math.hypot(px - hx, py - hy)
    mx, my = (hx + px) / 2, (hy + py) / 2
    h = math.sqrt(max(0.0, (L / 2) ** 2 - (d / 2) ** 2))
    if d < 1e-6:
        return mx, my
    nx, ny = -(py - hy) / d, (px - hx) / d
    return mx + nx * h * bend_dir, my + ny * h * bend_dir


# ---------------- máscara util ----------------

def shift(m, dx, dy):
    """out[y,x] = m[y-dy, x-dx]"""
    o = np.zeros_like(m)
    h, w = m.shape
    ys0, ys1 = max(0, dy), min(h, h + dy)
    xs0, xs1 = max(0, dx), min(w, w + dx)
    o[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return o


def dilate(m):
    return m | shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)


_YY, _XX = np.mgrid[0:S, 0:S]
_HASH = ((_XX * 73856093) ^ (_YY * 19349663)) % 97


class Frame:
    def __init__(self):
        self.a = np.zeros((S, S, 4), np.uint8)
        self.fx = np.zeros((S, S, 4), np.uint8)   # camada de efeitos (não sofre tinta de dano)

    def mask(self, shapes):
        img = Image.new('L', (S, S), 0)
        d = ImageDraw.Draw(img)
        for p in shapes:
            if len(p) >= 3:
                d.polygon([(round(x - .5) + .0, round(y - .5) + .0) for x, y in p], fill=255)
        return np.array(img) > 0

    def part(self, shapes, col, marks=(), shade=True, outline=True, tex=0.0, ol=None,
             light=0.22, dark=0.30, layer=None, clip=None):
        L = self.a if layer is None else layer
        m = self.mask(shapes)
        if clip is not None:
            m &= clip
        if not m.any():
            return m
        base = hexc(col) if isinstance(col, str) else np.array(col, float)
        C = np.zeros((S, S, 3), float)
        C[m] = base
        for msh, mc in marks:
            mm = self.mask(msh) & m
            C[mm] = hexc(mc) if isinstance(mc, str) else mc
        if shade:
            lit = m & ~shift(m, 1, 2)
            sh = m & ~shift(m, -2, -3)
            deep = m & ~shift(m, -1, -1)
            C[lit] = mix(C[lit], MOON, light)
            C[sh] = mix(C[sh] * (1 - dark * .5), NIGHT, dark)
            C[deep] = mix(C[deep] * .78, NIGHT, dark)
        if tex:
            tm = m & (_HASH < int(97 * tex)) & shift(m, 0, 2) & shift(m, 0, -2)
            C[tm] = C[tm] * .84
        L[m, :3] = np.clip(C[m], 0, 255)
        L[m, 3] = 255
        if outline:
            o = dilate(m) & ~m
            oc = mix(base * .32, INK, .55) if ol is None else (hexc(ol) if isinstance(ol, str) else ol)
            L[o, :3] = oc
            L[o, 3] = 255
        return m

    def flat(self, shapes, col, layer=None, alpha=255, clip=None):
        L = self.a if layer is None else layer
        m = self.mask(shapes)
        if clip is not None:
            m &= clip
        L[m, :3] = hexc(col) if isinstance(col, str) else col
        L[m, 3] = alpha
        return m

    def px(self, x, y, col, layer=None, alpha=255):
        L = self.a if layer is None else layer
        x, y = int(round(x)), int(round(y))
        if 0 <= x < S and 0 <= y < S:
            L[y, x, :3] = hexc(col) if isinstance(col, str) else col
            L[y, x, 3] = alpha

    def line(self, x0, y0, x1, y1, col, layer=None):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            t = i / max(1, n)
            self.px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, col, layer)

    def solid(self):
        return self.a[:, :, 3] > 0


# ---------------- olhos ----------------

def eye(F, x, y, kind='open', iris='#2a1a12', r=2, slit=False, brow=None):
    x, y = int(round(x)), int(round(y))
    if kind in ('closed', 'happy'):
        if kind == 'closed':
            F.line(x - r, y, x + r, y + 0, '#1a1010')
            F.px(x - r, y - 1, '#1a1010')
        else:  # ^ ^
            F.px(x - r, y + 1, '#1a1010'); F.px(x - r + 1, y, '#1a1010'); F.px(x, y - 1, '#1a1010')
            F.px(x + r - 1, y, '#1a1010'); F.px(x + r, y + 1, '#1a1010')
        return
    if kind == 'x':
        for d in range(-r, r + 1):
            F.px(x + d, y + d, '#1a1010'); F.px(x + d, y - d, '#1a1010')
        return
    if kind == 'spiral':
        for (dx, dy) in [(-1, -2), (0, -2), (1, -2), (2, -1), (2, 0), (2, 1), (1, 2), (0, 2), (-1, 1), (-1, 0), (0, 0)]:
            F.px(x + dx, y + dy, '#1a1010')
        return
    rr = r + (1 if kind == 'wide' else 0)
    F.flat(ell(x + .5, y + .5, rr + .6, rr + .9), '#120a0a')
    F.flat(ell(x + .5, y + .5, rr - .2, rr + .1), iris)
    if slit:
        F.line(x, y - rr + 1, x, y + rr - 1, '#0c0606')
        F.line(x + 1, y - rr + 2, x + 1, y + rr - 2, '#0c0606')
    else:
        F.flat(ell(x + .7, y + .9, max(.8, rr - 1.2), max(.8, rr - .9)), '#0c0606')
    F.px(x - rr + 1, y - rr + 1, '#ffffff')
    if rr >= 2:
        F.px(x - rr + 2, y - rr + 1, '#fff6ea')
    if kind == 'angry' or brow == 'angry':
        F.line(x - rr - 1, y - rr - 2, x + rr + 1, y - rr, '#1a1010')
        F.line(x - rr, y - rr - 1, x + rr, y - rr + 1, '#1a1010')
    if kind == 'wide':
        F.line(x - rr, y - rr - 3, x + rr, y - rr - 4, '#1a1010')


# ---------------- fonte 3x5 e efeitos ----------------

FONT = {
    'Z': ["111", "001", "010", "100", "111"], 'U': ["101", "101", "101", "101", "111"],
    'M': ["10001", "11011", "10101", "10001", "10001"], 'B': ["110", "101", "110", "101", "110"],
    'I': ["111", "010", "010", "010", "111"], '!': ["1", "1", "1", "0", "1"], 'A': ["010", "101", "111", "101", "101"],
    '?': ["111", "001", "010", "000", "010"], 'R': ["110", "101", "110", "101", "101"], 'u': ["000", "101", "101", "101", "011"],
    '+': ["000", "010", "111", "010", "000"],
}


def text(F, s, x, y, col='#fff4e0', sc=2, ol='#1a0f14', layer=None, outline=True):
    L = F.fx if layer is None else layer
    shapes = []
    cx = x
    for ch in s:
        if ch == ' ':
            cx += 3 * sc
            continue
        g = FONT[ch]
        for j, row in enumerate(g):
            for i, b in enumerate(row):
                if b == '1':
                    X, Y = cx + i * sc, y + j * sc
                    shapes.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
        cx += (len(g[0]) + 1) * sc
    F.part(shapes, col, shade=False, ol=ol, layer=L, outline=outline)
    return cx - x


def text_w(s, sc=2):
    return sum(3 * sc if c == ' ' else (len(FONT[c][0]) + 1) * sc for c in s) - sc


def bubble(F, s, x, y, sc=2):
    """balão de fala centralizado em x com rabicho para baixo."""
    w = text_w(s, sc)
    h = 5 * sc
    x0 = int(x - w / 2) - 4
    y0 = int(y) - h - 5
    F.part([[(x0, y0), (x0 + w + 8, y0), (x0 + w + 8, y0 + h + 6), (x0, y0 + h + 6)],
            [(x - 3, y0 + h + 5), (x + 3, y0 + h + 5), (x - 4, y0 + h + 10)]],
           '#f4efe6', shade=False, ol='#1a0f14', layer=F.fx)
    text(F, s, x0 + 4, y0 + 4, col='#c9343a', sc=sc, outline=False)


def heart(F, x, y, col='#e8506a', sc=1):
    rows = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"]
    shapes = []
    for j, row in enumerate(rows):
        for i, b in enumerate(row):
            if b == '1':
                X, Y = x + i * sc - 3 * sc, y + j * sc - 3 * sc
                shapes.append([(X, Y), (X + sc, Y), (X + sc, Y + sc), (X, Y + sc)])
    F.part(shapes, col, shade=False, ol='#3a0f18', layer=F.fx)
    F.px(x - 2 * sc, y - 2 * sc, '#ffd0d8', layer=F.fx)


def plus(F, x, y, col='#6fdc7a', s=2):
    F.part(poly((x - s, y - 3 * s), (x + s, y - 3 * s), (x + s, y - s), (x + 3 * s, y - s), (x + 3 * s, y + s), (x + s, y + s),
                (x + s, y + 3 * s), (x - s, y + 3 * s), (x - s, y + s), (x - 3 * s, y + s), (x - 3 * s, y - s), (x - s, y - s)),
           col, shade=False, ol='#14361a', layer=F.fx)


def star(F, x, y, col='#f2c230', r=3):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * .45
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    F.part([pts], col, shade=False, ol='#3a2a08', layer=F.fx)


def sparkle(F, x, y, r=3, col='#fff6c8'):
    x, y = int(x), int(y)
    for d in range(-r, r + 1):
        F.px(x + d, y, col, F.fx); F.px(x, y + d, col, F.fx)
    F.px(x, y, '#ffffff', F.fx)


def puff(F, x, y, r=5, col='#cfc8d8'):
    sh = ell(x, y, r, r * .8) + ell(x - r * .8, y + r * .3, r * .7, r * .6) + ell(x + r * .8, y + r * .3, r * .7, r * .6)
    F.part(sh, col, ol='#4a4458', layer=F.fx, light=.3)


def impact(F, x, y, r=7):
    pts = []
    for i in range(16):
        a = i * math.pi / 8
        rr = r if i % 2 == 0 else r * .45
        pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    F.part([pts], '#fff4d0', shade=False, ol='#c9343a', layer=F.fx)
    F.flat(ell(x, y, r * .3, r * .3), '#ffffff', layer=F.fx)


def arcs(F, x, y, n=3, col='#f4efe6'):
    """ondas de som saindo para a direita."""
    for k in range(n):
        rr = 4 + k * 4
        for a in range(-40, 41, 8):
            F.px(x + rr * math.cos(math.radians(a)), y + rr * math.sin(math.radians(a)), col, F.fx)


def dust(F, x, y, r=3):
    F.part(ell(x, y, r, r * .7) + ell(x + r, y + 1, r * .7, r * .5), '#9c8a70', ol='#3a3024', layer=F.fx, light=.25)


# ---------------- pós-processo ----------------

def shadow_layer(cx, rx, ry=3.2, alpha=95):
    a = np.zeros((S, S, 4), np.uint8)
    d = (((_XX - cx) / rx) ** 2 + ((_YY - (G + 1)) / ry) ** 2) <= 1
    a[d, 3] = alpha
    return a


def over(dst, src):
    """alpha-over src em dst (uint8 RGBA)."""
    sa = src[..., 3:4].astype(float) / 255
    da = dst[..., 3:4].astype(float) / 255
    oa = sa + da * (1 - sa)
    rgb = (src[..., :3] * sa + dst[..., :3] * da * (1 - sa)) / np.maximum(oa, 1e-6)
    out = np.zeros_like(dst)
    out[..., :3] = np.clip(rgb, 0, 255)
    out[..., 3] = np.clip(oa[..., 0] * 255, 0, 255)
    return out


def compose(F, dx=0, dy=0, tint=None, alpha=1.0, shadow=None, rotate=None):
    """junta sombra + sprite (deslocado/tingido) + efeitos."""
    spr = F.a.copy()
    if rotate:
        ang, cx, cy = rotate
        im = Image.fromarray(spr, 'RGBA').rotate(ang, resample=Image.NEAREST, center=(cx, cy))
        spr = np.array(im)
    if dx or dy:
        spr = np.roll(spr, (int(dy), int(dx)), (0, 1))
    if tint == 'flash':
        m = spr[..., 3] > 0
        spr[m, :3] = mix(spr[m, :3].astype(float), np.array([255, 250, 246.]), .78)
        spr[m, 3] = 175
    elif tint == 'red':
        m = spr[..., 3] > 0
        spr[m, :3] = mix(spr[m, :3].astype(float), np.array([235, 60, 60.]), .35)
    if alpha < 1:
        spr[..., 3] = (spr[..., 3] * alpha).astype(np.uint8)
    base = np.zeros((S, S, 4), np.uint8)
    if shadow is not None:
        base = over(base, shadow)
    base = over(base, spr)
    base = over(base, F.fx)
    return base


ROWS = ["idle", "walk", "attack", "hurt", "death", "special"]
NFR = {"idle": 4, "walk": 8, "attack": 6, "hurt": 4, "death": 6, "special": 6}
DUR = {"idle": [220] * 4, "walk": [110] * 8, "attack": [90, 170, 130, 50, 120, 160],
       "hurt": [60, 90, 90, 110], "death": [70, 110, 110, 100, 140, 600], "special": [120, 150, 150, 90, 140, 200]}


def sheet(frames_by_row):
    out = np.zeros((S * 6, S * 8, 4), np.uint8)
    for r, name in enumerate(ROWS):
        fr = frames_by_row[name]
        assert len(fr) == NFR[name], (name, len(fr))
        for c, f in enumerate(fr):
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = f
    return Image.fromarray(out, 'RGBA')
