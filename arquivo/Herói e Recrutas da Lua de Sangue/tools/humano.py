"""Esqueleto humano compartilhado (herói e recrutas) — vista 3/4 de frente, virado para a direita,
mesma câmera dos zumbis. Quadro 128 px, chão em G=112.

Uso:
    from humano import *
    P = pose('walk', 3, body='m')          # juntas do quadro
    F = Frame(); draw_person(F, P, LOOK)   # desenha tudo (recrutas)
    img = compose(F, ...)                  # ver pixkit.compose

Juntas em P (todas em px do quadro, já com balanço/inclinação aplicados):
    P['head']   = (cx, cy)  centro do crânio      P['hrot'] = graus (positivo = inclina p/ frente/direita)
    P['neck']   = (x, y)    base do pescoço
    P['sh_b'], P['sh_f']    ombro de trás (esquerda da imagem) e ombro da frente/arma (direita da imagem)
    P['el_b'], P['el_f']    cotovelos       P['ha_b'], P['ha_f']  mãos
    P['hip_b'], P['hip_f']  quadris         P['kn_b'], P['kn_f']  joelhos     P['ft_b'], P['ft_f'] pés
    P['pelvis'] = (x, y)    P['lean'] = graus do tronco
    P['eyes']   = 'open'|'closed'|'x'|'angry'|'wide'|'happy'   P['mouth'] = 'line'|'open'|'grit'|'smile'|'o'
    P['body']   = 'm'|'f'   P['row'], P['i']
    P['grip']   = ângulo (graus) da arma na mão da frente (0 = apontando p/ direita, -90 = p/ cima)
    P['fx']     = lista de efeitos pedidos pela pose (ex.: ('impact', x, y))
Camadas (ordem de pintura, de trás p/ frente):
    LAYERS = ['hair_back','body','face','pants','shoes','shirt','jacket','bag',
              'arm','shirt_arm','jacket_arm','beard','hair','head','acc','weapon']
    'body'  = pele: perna de trás/frente, braço de trás, tronco, pescoço, cabeça, orelha, nariz
    'arm'   = pele do braço da frente (o que segura a arma) — fica POR CIMA da roupa do tronco
    '*_arm' = manga da roupa no braço da frente
"""
import math
from pixkit import *

# ---------------------------------------------------------------- linhas da folha
# linhas 0-5 iguais aos zumbis. O herói tem 2 linhas extras de ataque (fogo e faca) -> folha 1024x1024.
HROWS = ["idle", "walk", "attack", "hurt", "death", "special", "attack_fire", "attack_knife"]
HNFR = dict(NFR, attack_fire=6, attack_knife=6)
HDUR = dict(DUR, attack_fire=[80, 160, 60, 70, 120, 160], attack_knife=[80, 150, 60, 50, 110, 150])

INKC = '#1a1014'


def lerp(a, b, t):
    return a + (b - a) * t


def L2(p, q, t):
    return (lerp(p[0], q[0], t), lerp(p[1], q[1], t))


# ---------------------------------------------------------------- pose
REST = dict(
    head=(64, 32), neck=(64, 50),
    sh_b=(50, 55), sh_f=(78, 55),
    ha_b=(46, 83), ha_f=(82, 83),
    hip_b=(58, 81), hip_f=(70, 81),
    ft_b=(55, 112), ft_f=(73, 112),
)
ARM_L = 29.0
LEG_L = 32.0


def _base(body):
    P = {k: v for k, v in REST.items()}
    if body == 'f':
        P['sh_b'] = (52, 56); P['sh_f'] = (76, 56)
        P['ha_b'] = (48, 83); P['ha_f'] = (80, 83)
        P['hip_b'] = (57, 81); P['hip_f'] = (71, 81)
    return P


def pose(row, i, body='m', style=None):
    """Retorna dicionário de juntas para (linha, quadro). style permite variações ('heavy', 'agil')."""
    P = _base(body)
    P.update(body=body, row=row, i=i, hrot=0, lean=0, eyes='open', mouth='line', grip=-70, fx=[], dx=0, dy=0,
             tint=None, alpha=1.0, rotate=None, kneel=0, look=0)
    sway = 0.0       # deslocamento x do tronco
    bob = 0.0        # deslocamento y do tronco (+ = desce)
    hb = (0, 0); hf = (0, 0)   # offsets das mãos
    fb = (0, 0, 0); ff = (0, 0, 0)  # pés: dx, lift, dummy
    hd = (0, 0)
    if row == 'idle':
        bob = [0, 0.6, 1.2, 0.6][i]
        hb = (0, bob * .5); hf = (0, bob * .5)
        P['eyes'] = 'closed' if i == 2 else 'open'
        P['grip'] = -65
    elif row == 'walk':
        ph = 2 * math.pi * i / 8
        s = math.sin(ph)
        bob = -abs(math.cos(ph)) * 2 + 1
        # pé levantado avança (vai para a direita); pé apoiado desliza para trás -> anda para a frente
        fb = (-6 * s, max(0, -5 * math.cos(ph)), 0)
        ff = (6 * s, max(0, 5 * math.cos(ph)), 0)
        hb = (5 * s, -abs(s) * 2); hf = (-5 * s, -abs(s) * 2)
        sway = 1.0
        P['lean'] = 4
        P['grip'] = -60 - 10 * s
    elif row == 'attack':   # golpe corpo a corpo (taco/facão/machado): de cima para baixo
        seq = [
            dict(hf=(2, -40), lean=-4, bob=0, grip=-120, eyes='angry', mouth='grit'),
            dict(hf=(-4, -50), lean=-9, bob=1, grip=-150, eyes='angry', mouth='grit'),
            dict(hf=(16, -18), lean=6, bob=0, grip=-40, eyes='angry', mouth='open', sway=3),
            dict(hf=(20, -6), lean=12, bob=2, grip=10, eyes='angry', mouth='open', sway=5, fx=[('impact', 112, 82)]),
            dict(hf=(12, 2), lean=8, bob=2, grip=40, eyes='angry', mouth='grit', sway=3),
            dict(hf=(4, -2), lean=2, bob=1, grip=-40, eyes='open', mouth='line', sway=1),
        ][i]
        hf = seq['hf']; P['lean'] = seq['lean']; bob = seq['bob']; P['grip'] = seq['grip']
        P['eyes'] = seq['eyes']; P['mouth'] = seq['mouth']; sway = seq.get('sway', 0); P['fx'] = seq.get('fx', [])
        hb = (-2, -6) if i in (1, 2) else (0, -2)
        ff = (4 if i in (2, 3, 4) else 0, 0, 0)
        fb = (-3 if i in (0, 1) else 0, 0, 0)
    elif row == 'attack_fire':  # arma de fogo: mira na altura do ombro, tiro, coice
        seq = [
            dict(hf=(14, -24), hb=(10, -20), grip=0, lean=0),
            dict(hf=(20, -27), hb=(14, -24), grip=0, lean=2, eyes='angry'),
            dict(hf=(18, -31), hb=(12, -27), grip=-14, lean=-4, eyes='angry', mouth='grit', fx=[('flash', 120, 54)], sway=-2),
            dict(hf=(19, -28), hb=(13, -25), grip=-5, lean=-1, eyes='angry', fx=[('shell', 86, 46)], sway=-1),
            dict(hf=(20, -27), hb=(14, -24), grip=0, lean=1, eyes='angry'),
            dict(hf=(8, -12), hb=(4, -8), grip=-40, lean=0),
        ][i]
        hf = seq['hf']; hb = seq['hb']; P['grip'] = seq['grip']; P['lean'] = seq['lean']
        P['eyes'] = seq.get('eyes', 'open'); P['mouth'] = seq.get('mouth', 'line'); P['fx'] = seq.get('fx', []); sway = seq.get('sway', 0)
        ff = (3, 0, 0)
    elif row == 'attack_knife':  # estocada rápida com faca
        seq = [
            dict(hf=(-6, -14), grip=-10, lean=-3, eyes='angry'),
            dict(hf=(-10, -16), grip=-5, lean=-6, eyes='angry', mouth='grit', bob=1),
            dict(hf=(24, -20), grip=0, lean=10, eyes='angry', mouth='open', sway=6),
            dict(hf=(28, -20), grip=0, lean=12, eyes='angry', mouth='open', sway=7, fx=[('impact', 118, 62)]),
            dict(hf=(14, -12), grip=-20, lean=5, eyes='angry', sway=3),
            dict(hf=(4, -4), grip=-50, lean=1, sway=1),
        ][i]
        hf = seq['hf']; P['grip'] = seq['grip']; P['lean'] = seq['lean']; bob = seq.get('bob', 0)
        P['eyes'] = seq.get('eyes', 'open'); P['mouth'] = seq.get('mouth', 'line'); P['fx'] = seq.get('fx', []); sway = seq.get('sway', 0)
        ff = (6 if i in (2, 3) else 0, 0, 0)
        hb = (-4, -6)
    elif row == 'hurt':
        seq = [dict(tint='flash', lean=-6, sway=-2), dict(lean=-10, sway=-4, eyes='closed', mouth='grit', tint='red'),
               dict(lean=-6, sway=-3, eyes='closed', mouth='grit'), dict(lean=-2, sway=-1)][i]
        P['lean'] = seq['lean']; sway = seq['sway']; P['eyes'] = seq.get('eyes', 'open'); P['mouth'] = seq.get('mouth', 'o')
        P['tint'] = seq.get('tint')
        hb = (-4, -10); hf = (-2, -12)
        hd = (-2, 0)
    elif row == 'death':  # cai de joelhos e tomba para trás
        seq = [
            dict(tint='flash', lean=-6, kneel=0),
            dict(lean=-10, kneel=0.2, eyes='closed', mouth='o'),
            dict(lean=6, kneel=1.0, eyes='closed', mouth='o', bob=12),
            dict(lean=6, kneel=1.0, eyes='x', mouth='o', bob=12, rot=(-35)),
            dict(lean=0, kneel=0.6, eyes='x', mouth='o', bob=0, rot=(-80)),
            dict(lean=0, kneel=0.4, eyes='x', mouth='o', bob=0, rot=(-90), fade=True),
        ][i]
        P['lean'] = seq['lean']; P['kneel'] = seq['kneel']; bob = seq.get('bob', 0) if 'bob' in seq else seq['kneel'] * 12
        P['eyes'] = seq.get('eyes', 'open'); P['mouth'] = seq.get('mouth', 'o'); P['tint'] = seq.get('tint')
        if seq.get('rot'):
            P['rotate'] = (seq['rot'], 64, 111)
        hb = (-2, -4 - 4 * seq['kneel']); hf = (2, -4 - 6 * seq['kneel'])
    elif row == 'special':  # padrão: usar curativo (amarra atadura no braço) — recrutas sobrescrevem
        seq = [
            dict(hf=(-10, -16), hb=(6, -14), eyes='open'),
            dict(hf=(-16, -20), hb=(8, -16), eyes='open', mouth='grit'),
            dict(hf=(-20, -22), hb=(10, -18), eyes='closed', mouth='grit'),
            dict(hf=(-16, -24), hb=(10, -18), eyes='closed', fx=[('plus', 84, 24)]),
            dict(hf=(-6, -10), hb=(2, -6), eyes='happy', mouth='smile', fx=[('plus', 90, 18), ('plus', 40, 26)]),
            dict(hf=(0, -2), hb=(0, -2), eyes='happy', mouth='smile', fx=[('sparkle', 86, 30)]),
        ][i]
        hf = seq['hf']; hb = seq['hb']; P['eyes'] = seq['eyes']; P['mouth'] = seq.get('mouth', 'line'); P['fx'] = seq.get('fx', [])
        P['grip'] = -90
    if style == 'heavy':
        bob += 0.5
    # ---- aplica tronco (pelve fica; tronco gira em torno da pelve)
    pel = ((P['hip_b'][0] + P['hip_f'][0]) / 2 + sway * .5, P['hip_b'][1] + bob)
    P['pelvis'] = pel
    lean = P['lean']
    kneel = P['kneel']

    def T(p, extra=(0, 0)):
        x, y = p[0] + sway, p[1] + bob
        x, y = rp(x, y, pel[0], pel[1], lean)
        return (x + extra[0], y + extra[1])

    for k in ('head', 'neck', 'sh_b', 'sh_f'):
        P[k] = T(P[k])
    P['head'] = (P['head'][0] + hd[0], P['head'][1] + hd[1])
    P['hrot'] = lean * .5
    for k in ('hip_b', 'hip_f'):
        P[k] = (P[k][0] + sway * .5, P[k][1] + bob)
    # mãos relativas ao ombro (posição de descanso + offset)
    rb = _base(body)
    P['ha_b'] = (P['sh_b'][0] + (rb['ha_b'][0] - rb['sh_b'][0]) + hb[0], P['sh_b'][1] + (rb['ha_b'][1] - rb['sh_b'][1]) + hb[1])
    P['ha_f'] = (P['sh_f'][0] + (rb['ha_f'][0] - rb['sh_f'][0]) + hf[0], P['sh_f'][1] + (rb['ha_f'][1] - rb['sh_f'][1]) + hf[1])
    for s in ('b', 'f'):
        sh, ha = P['sh_' + s], P['ha_' + s]
        d = math.hypot(ha[0] - sh[0], ha[1] - sh[1])
        if d > ARM_L * .98:   # não estica além do braço
            t = ARM_L * .98 / d
            P['ha_' + s] = ha = (sh[0] + (ha[0] - sh[0]) * t, sh[1] + (ha[1] - sh[1]) * t)
        P['el_' + s] = two_bone(sh[0], sh[1], ha[0], ha[1], ARM_L, bend_dir=(1 if s == 'b' else -1))
    # pés
    P['ft_b'] = (rb['ft_b'][0] + fb[0], G - fb[1])
    P['ft_f'] = (rb['ft_f'][0] + ff[0], G - ff[1])
    if kneel:
        # joelhos no chão, pés para trás
        P['ft_b'] = (P['ft_b'][0] - 10 * kneel, G - 1)
        P['ft_f'] = (P['ft_f'][0] - 8 * kneel, G - 1)
    for s in ('b', 'f'):
        hp, ft = P['hip_' + s], P['ft_' + s]
        d = math.hypot(ft[0] - hp[0], ft[1] - hp[1])
        if d > LEG_L:
            # pélvis alta demais: puxa o pé para cima (só acontece com bob negativo)
            t = LEG_L / d
            P['ft_' + s] = ft = (hp[0] + (ft[0] - hp[0]) * t, hp[1] + (ft[1] - hp[1]) * t)
        P['kn_' + s] = two_bone(hp[0], hp[1], ft[0], ft[1], LEG_L, bend_dir=-1)
    return P


# ---------------------------------------------------------------- formas do corpo (reutilizadas pelas roupas)

# Profundidade dos membros. A cabeça olha para a direita (3/4 de frente), então o membro mais
# perto da câmera é o da ESQUERDA da imagem. As juntas 'b' ficam à esquerda e 'f' à direita
# (geometria da arma e dos golpes), mas no DESENHO 'b' = membro de trás e 'f' = membro da frente.
# _D traduz: pedir 'b' (trás) desenha as juntas da direita; pedir 'f' (frente) desenha as da esquerda.
DEPTH_SWAP = True
def DSIDE(s):
    return ('f' if s == 'b' else 'b') if DEPTH_SWAP else s


def head_shapes(P, grow=0):
    cx, cy = P['head']
    r = P['hrot']
    sh = ell(cx, cy - 2, 15 + grow, 15 + grow)               # crânio
    sh += ell(cx + 3, cy + 7, 12 + grow, 9 + grow)           # bochecha/queixo puxado p/ direita
    return rot(sh, cx, cy, r)


def ear_shapes(P):
    cx, cy = P['head']
    return rot(ell(cx - 13, cy + 3, 3.5, 5), cx, cy, P['hrot'])


def nose_shapes(P):
    cx, cy = P['head']
    return rot(poly((cx + 12, cy + 2), (cx + 17, cy + 7), (cx + 12, cy + 8)), cx, cy, P['hrot'])


def neck_shapes(P):
    nx, ny = P['neck']
    hx, hy = P['head']
    return limb(nx, ny, hx + 1, hy + 10, 9, 9)


def torso_pts(P, grow=0, top=0):
    """polígono do tronco (ombros -> cintura -> quadril). grow alarga (roupas)."""
    b, f = P['sh_b'], P['sh_f']
    hb, hf = P['hip_b'], P['hip_f']
    fem = P['body'] == 'f'
    g = grow
    w_waist = (-1 if fem else 1)
    pts = [
        (b[0] - 3 - g, b[1] - 3 - g + top), (P['neck'][0] - 4, P['neck'][1] - 1 - g + top), (P['neck'][0] + 4, P['neck'][1] - 1 - g + top),
        (f[0] + 3 + g, f[1] - 3 - g + top),
        (f[0] + 3 + g, f[1] + 4),
        (L2(f, hf, .55)[0] + 1 + w_waist + g, L2(f, hf, .55)[1]),
        (hf[0] + 5 + g + (1 if fem else 0), hf[1] + 2 + g),
        (hb[0] - 5 - g - (1 if fem else 0), hb[1] + 2 + g),
        (L2(b, hb, .55)[0] - 1 - w_waist - g, L2(b, hb, .55)[1]),
        (b[0] - 3 - g, b[1] + 4),
    ]
    return pts


def torso_shapes(P, grow=0, top=0):
    sh = [torso_pts(P, grow, top)]
    if P['body'] == 'f':
        f = P['sh_f']
        sh += ell(f[0] - 4, f[1] + 9, 6 + grow * .5, 5 + grow * .5)   # busto (lado da frente)
    return sh


def upper_arm(P, s, w=8, grow=0):
    s = DSIDE(s)
    sh, el = P['sh_' + s], P['el_' + s]
    return limb(sh[0], sh[1] + 1, el[0], el[1], w + grow, w - 1 + grow)


def fore_arm(P, s, w=7, grow=0, upto=1.0):
    s = DSIDE(s)
    el, ha = P['el_' + s], P['ha_' + s]
    end = L2(el, ha, upto)
    return limb(el[0], el[1], end[0], end[1], w + grow, w - 1 + grow)


def hand_shapes(P, s, r=4):
    s = DSIDE(s)
    hx, hy = P['ha_' + s]
    return ell(hx, hy, r, r)


def thigh(P, s, w=11, grow=0):
    s = DSIDE(s)
    hp, kn = P['hip_' + s], P['kn_' + s]
    return limb(hp[0], hp[1], kn[0], kn[1], w + grow, w - 1 + grow)


def shin(P, s, w=9, grow=0, upto=1.0):
    s = DSIDE(s)
    kn, ft = P['kn_' + s], P['ft_' + s]
    end = L2(kn, (ft[0], ft[1] - 3), upto)
    return limb(kn[0], kn[1], end[0], end[1], w + grow, w - 1 + grow)


def foot_shapes(P, s, grow=0):
    s = DSIDE(s)
    fx, fy = P['ft_' + s]
    return ell(fx + 3, fy - 2.5, 6 + grow, 3 + grow * .5)


def pelvis_shapes(P, grow=0):
    hb, hf = P['hip_b'], P['hip_f']
    return poly((hb[0] - 5 - grow, hb[1] - 3), (hf[0] + 5 + grow, hf[1] - 3), (hf[0] + 5 + grow, hf[1] + 6 + grow), (hb[0] - 5 - grow, hb[1] + 6 + grow))


# ---------------------------------------------------------------- desenho padrão por camada

def skin_col(look):
    return look.get('skin', '#c98d5e')


def draw_body(F, P, look):
    c = skin_col(look)
    far = mix(hexc(c), NIGHT, .18)
    # perna de trás, braço de trás (mais escuros), perna da frente, tronco, pescoço, cabeça
    F.part(thigh(P, 'b') + shin(P, 'b'), far)
    F.part(foot_shapes(P, 'b'), far)
    F.part(upper_arm(P, 'b') + fore_arm(P, 'b'), far)
    F.part(hand_shapes(P, 'b'), far)
    F.part(thigh(P, 'f') + shin(P, 'f'), c)
    F.part(foot_shapes(P, 'f'), c)
    F.part(torso_shapes(P) + pelvis_shapes(P), c)
    F.part(neck_shapes(P), mix(hexc(c), NIGHT, .12))
    F.part(head_shapes(P), c, tex=0)
    F.part(ear_shapes(P), c)
    F.part(nose_shapes(P), c, outline=False, light=.35)


def draw_arm(F, P, look):
    c = skin_col(look)
    F.part(upper_arm(P, 'f') + fore_arm(P, 'f'), c)
    F.part(hand_shapes(P, 'f'), c)


def face_pts(P):
    cx, cy = P['head']
    r = P['hrot']
    q = lambda x, y: rp(cx + x, cy + y, cx, cy, r)
    return dict(eye_b=q(-1, 2), eye_f=q(9, 2), brow_b=q(0, -4), brow_f=q(10, -4), mouth=q(7, 12), cheek=q(-5, 8))


def draw_face(F, P, look):
    fp = face_pts(P)
    kind = P['eyes']
    brow = look.get('brow', '#2a1a14')
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
                F.line(x - 1, y, x + 1, y, INKC)
            continue
        w = 3 if big else 2
        # esclera + íris olhando para a direita (pixels exatos, sem polígono)
        for yy in range(y - 2, y + 3):
            for xx in range(x - w, x + 3):
                F.px(xx, yy, '#f4efe6')
        iris = look.get('eye', '#3a2414')
        for yy in range(y - 2, y + 3):
            for xx in range(x, x + 3):
                F.px(xx, yy, iris)
        for yy in range(y - 1, y + 2):
            F.px(x + 1, yy, '#0c0606'); F.px(x + 2, yy, '#0c0606')
        F.px(x, y - 2, '#ffffff')
        F.line(x - w, y - 3, x + 3, y - 3, INKC)   # pálpebra
        F.line(x - w, y + 3, x + 2, y + 3, mix(hexc(skin_col(look)), INK, .45))
        if P['body'] == 'f':
            F.px(x - w - 1, y - 3, INKC)
        if kind == 'wide':
            F.px(x - w, y + 2, '#f4efe6')
    # sobrancelhas
    for k in ('brow_b', 'brow_f'):
        x, y = fp[k]
        x, y = int(round(x)), int(round(y))
        if kind == 'angry':
            F.line(x - 2, y - 1, x + 2, y + 1, brow)
        elif kind == 'wide':
            F.line(x - 2, y - 2, x + 2, y - 2, brow)
        else:
            F.line(x - 2, y, x + 2, y - 1, brow)
    # boca
    x, y = fp['mouth']
    x, y = int(round(x)), int(round(y))
    m = P['mouth']
    if m == 'line':
        F.line(x - 2, y, x + 2, y, '#5a2a24')
    elif m == 'smile':
        F.line(x - 2, y - 1, x - 2, y - 1, '#5a2a24'); F.line(x - 1, y, x + 2, y, '#5a2a24'); F.px(x + 3, y - 1, '#5a2a24')
    elif m == 'grit':
        F.flat(poly((x - 3, y - 1), (x + 3, y - 1), (x + 3, y + 2), (x - 3, y + 2)), '#3a1414')
        F.line(x - 2, y, x + 2, y, '#f4efe6')
    elif m in ('open', 'o'):
        F.flat(ell(x, y + 1, 2.6 if m == 'open' else 1.8, 2.4 if m == 'open' else 2), '#3a1414')
        if m == 'open':
            F.px(x, y + 2, '#c9343a')
    # bochecha corada
    x, y = fp['cheek']
    F.px(x, y, mix(hexc(skin_col(look)), hexc('#e07a6a'), .5)); F.px(x + 1, y, mix(hexc(skin_col(look)), hexc('#e07a6a'), .5))


def draw_pants(F, P, look):
    c = look.get('pants', '#2b3a5a')
    if not c:
        return
    far = mix(hexc(c), NIGHT, .2)
    F.part(thigh(P, 'b', grow=1) + shin(P, 'b', grow=1, upto=.85), far, tex=.05)
    F.part(pelvis_shapes(P, grow=1) + thigh(P, 'f', grow=1) + shin(P, 'f', grow=1, upto=.85), c, tex=.05)


def draw_shoes(F, P, look):
    c = look.get('shoes', '#2a1c16')
    if not c:
        return
    F.part(foot_shapes(P, 'b', grow=1), mix(hexc(c), NIGHT, .2))
    F.part(foot_shapes(P, 'f', grow=1), c)


def draw_shirt(F, P, look):
    c = look.get('shirt', '#c0262d')
    if not c:
        return
    F.part(upper_arm(P, 'b', grow=1), mix(hexc(c), NIGHT, .2))
    F.part(torso_shapes(P, grow=1), c, tex=.04)


def draw_shirt_arm(F, P, look):
    c = look.get('shirt', '#c0262d')
    if not c:
        return
    F.part(upper_arm(P, 'f', grow=1), c)


def draw_jacket(F, P, look):
    c = look.get('jacket')
    if not c:
        return
    far = mix(hexc(c), NIGHT, .2)
    F.part(upper_arm(P, 'b', grow=2) + fore_arm(P, 'b', grow=2, upto=.8), far)
    m = F.part(torso_shapes(P, grow=2), c, tex=.05)
    # abertura da frente: faixa central mostra a camisa
    nx, ny = P['neck']
    pv = P['pelvis']
    shirt = look.get('shirt') or skin_col(look)
    F.part(poly((nx - 1, ny + 1), (nx + 8, ny + 1), (pv[0] + 8, pv[1] - 2), (pv[0] + 3, pv[1] - 2)), shirt, clip=m, outline=False)
    F.line(nx - 1, ny + 2, pv[0] + 3, pv[1] - 3, mix(hexc(c), INK, .5))
    F.line(nx + 8, ny + 2, pv[0] + 8, pv[1] - 3, mix(hexc(c), INK, .5))
    F.part(poly((nx - 6, ny - 2), (nx - 1, ny + 1), (nx + 1, ny + 8), (nx - 5, ny + 4)), mix(hexc(c), MOON, .12), clip=None)  # gola
    F.part(poly((nx + 13, ny - 2), (nx + 8, ny + 1), (nx + 7, ny + 8), (nx + 12, ny + 4)), mix(hexc(c), MOON, .12), clip=None)


def draw_jacket_arm(F, P, look):
    c = look.get('jacket')
    if not c:
        return
    F.part(upper_arm(P, 'f', grow=2) + fore_arm(P, 'f', grow=2, upto=.8), c)


def draw_hair_default(F, P, look):
    """cabelo curto simples (substituído por estilos do herói / recrutas)."""
    c = look.get('hair_color', '#1d1410')
    cx, cy = P['head']
    sh = ell(cx - 1, cy - 10, 16, 8) + poly((cx - 16, cy - 8), (cx - 14, cy + 5), (cx - 9, cy - 3))
    F.part(rot(sh, cx, cy, P['hrot']), c, tex=.12, clip=None)


# ganchos que herói/recrutas podem trocar
DEFAULT_DRAW = {
    'hair_back': None, 'body': draw_body, 'face': draw_face, 'pants': draw_pants, 'shoes': draw_shoes,
    'shirt': draw_shirt, 'jacket': draw_jacket, 'bag': None, 'arm': draw_arm, 'shirt_arm': draw_shirt_arm,
    'jacket_arm': draw_jacket_arm, 'beard': None, 'hair': draw_hair_default, 'head': None, 'acc': None, 'weapon': None,
}
LAYERS = list(DEFAULT_DRAW)


def draw_person(F, P, look, draw=None, skip=()):
    """desenha todas as camadas em ordem. draw = dict camada -> função(F,P,look) que substitui o padrão."""
    D = dict(DEFAULT_DRAW)
    if draw:
        D.update(draw)
    for name in LAYERS:
        if name in skip:
            continue
        fn = D.get(name)
        if fn:
            fn(F, P, look)


# ---------------------------------------------------------------- arma na mão (helpers)

def held(P, length, back=4, s='f'):
    """retorna (p0, p1): cabo atrás da mão e ponta, ao longo do ângulo P['grip']."""
    hx, hy = P['ha_' + s]
    a = math.radians(P['grip'])
    ca, sa = math.cos(a), math.sin(a)
    return (hx - ca * back, hy - sa * back), (hx + ca * length, hy + sa * length)


def pose_fx(F, P):
    """efeitos padrão pedidos pela pose."""
    for e in P.get('fx', []):
        k = e[0]
        if k == 'impact':
            impact(F, e[1], e[2], 7)
        elif k == 'plus':
            plus(F, e[1], e[2])
        elif k == 'sparkle':
            sparkle(F, e[1], e[2], 3)
        elif k == 'flash':
            F.part(ell(e[1], e[2], 6, 4) + poly((e[1] - 2, e[2] - 1), (e[1] + 9, e[2]), (e[1] - 2, e[2] + 1)), '#fff2a0', shade=False, ol='#e07a1a', layer=F.fx)
        elif k == 'shell':
            F.part(poly((e[1], e[2]), (e[1] + 3, e[2] - 1), (e[1] + 3, e[2] + 1), (e[1], e[2] + 2)), '#e3b23c', shade=False, ol='#5a3a08', layer=F.fx)
        elif k == 'star':
            star(F, e[1], e[2], r=3)


def finish(F, P, shadow_rx=17):
    """sombra + efeitos + pós (tinta/rotação/fade) — retorna RGBA 128x128."""
    pose_fx(F, P)
    if P['row'] == 'death' and P['i'] == 5:
        for (x, y) in ((40, 70), (52, 64), (30, 78)):
            star(F, x, y, r=3)
    rotq = P.get('rotate')
    if not rotq:
        return compose(F, tint=P.get('tint'), shadow=shadow_layer(64, shadow_rx), alpha=P.get('alpha', 1.0))
    # desmaio: gira numa tela 3x maior (nada é cortado) e puxa o corpo deitado para dentro do quadro
    F.a = rotate_fit(F.a, rotq)
    k = min(1.0, abs(rotq[0]) / 90.0)
    return compose(F, tint=P.get('tint'), shadow=shadow_layer(64 - 8 * k, shadow_rx + 16 * k), alpha=P.get('alpha', 1.0))


def rotate_fit(arr, rotq):
    """gira a camada em torno de (cx,cy) sem cortar e desloca p/ a esquerda proporcional ao giro
    (a cabeça do corpo deitado volta para dentro dos 128 px). Use em TODAS as camadas do mesmo quadro."""
    ang, cx, cy = rotq
    big = np.zeros((S * 3, S * 3, 4), np.uint8)
    big[S:2 * S, S:2 * S] = arr
    im = Image.fromarray(big, 'RGBA').rotate(ang, resample=Image.NEAREST, center=(cx + S, cy + S))
    k = min(1.0, abs(ang) / 90.0)
    shift = int(round(-42 * k)) if ang < 0 else int(round(42 * k))
    out = np.array(im)[S:2 * S, S - shift:2 * S - shift]
    return out


def render(look, row, i, draw=None, skip=(), style=None, adjust=None):
    """quadro completo (recrutas). adjust(P) pode modificar a pose antes de desenhar."""
    P = pose(row, i, look.get('body', 'm'), style)
    if adjust:
        adjust(P)
    F = Frame()
    draw_person(F, P, look, draw, skip)
    return finish(F, P), P, F


def person_sheet(look, draw=None, rows=ROWS, style=None, adjust=None, extra=None):
    """folha 1024 x (128*len(rows)). extra(F,P) desenha por cima (efeitos de ofício)."""
    out = np.zeros((S * len(rows), S * 8, 4), np.uint8)
    for r, name in enumerate(rows):
        for c in range(HNFR[name]):
            P = pose(name, c, look.get('body', 'm'), style)
            if adjust:
                adjust(P)
            F = Frame()
            draw_person(F, P, look, draw)
            if extra:
                extra(F, P)
            out[r * S:(r + 1) * S, c * S:(c + 1) * S] = finish(F, P)
    return Image.fromarray(out, 'RGBA')


if __name__ == '__main__':
    import os
    look = dict(body='m', skin='#c98d5e', hair_color='#1d1410', shirt='#c0262d', pants='#2b3a5a', jacket='#5b3a24', shoes='#2a1c16')
    im = person_sheet(look, rows=HROWS)
    out = os.path.join(os.path.dirname(__file__), '..', '_teste_humano.png')
    im.save(out)
    lookf = dict(look, body='f', skin='#e8b48a', jacket=None, shirt='#2f6db5')
    person_sheet(lookf, rows=HROWS).save(out.replace('.png', '_f.png'))
    print('ok', im.size)
