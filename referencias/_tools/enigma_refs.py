# -*- coding: utf-8 -*-
"""Baixa referencias publicas de direcao de arte do Enigma do Medo (Dumativa / Cellbit).

So midia oficial ou de imprensa ja publicada (loja Steam, press kit, sites, materias).
Nao baixa o jogo, build, ROM nem pack de sprites. Uso interno; nao redistribuir.
"""
from __future__ import print_function

import hashlib
import html
import io
import os
import re
import sys
import time
import zipfile

import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(BASE, 'enigma-do-medo')
UA = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 LuaDeSangueRefs/1.0',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
}
S = requests.Session()
S.headers.update(UA)

IMG_EXT = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
    'image/webp': '.webp', 'image/gif': '.gif',
}


def slug(s, n=46):
    s = s.lower()
    s = re.sub(r'https?://', '', s)
    s = re.sub(r'\.[a-z0-9]{2,4}$', '', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')[:n].strip('-') or 'img'


def strip_tags(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def get(url, timeout=45, stream=False):
    for i in range(4):
        try:
            r = S.get(url, timeout=timeout, stream=stream, allow_redirects=True)
            if r.status_code in (429, 503):
                time.sleep(2 + i * 2)
                continue
            return r
        except Exception as e:  # noqa: BLE001
            print('retry', url[:80], e)
            time.sleep(1 + i)
    return None


def imgs_in_html(text):
    out = []
    for m in re.finditer(r'''(?is)(?:src|data-src|data-lazy-src|content)\s*=\s*["']([^"']+)["']''', text or ''):
        out.append(html.unescape(m.group(1)))
    for m in re.finditer(r'''(?i)https?://[^"'\\\s>]+\.(?:jpg|jpeg|png|webp|gif)''', text or ''):
        out.append(html.unescape(m.group(0)))
    for m in re.finditer(r'\[img\](.*?)\[/img\]', text or '', re.I):
        out.append(m.group(1).strip())
    return out


def abs_url(base, u):
    u = (u or '').strip()
    if not u or u.startswith('data:'):
        return ''
    if u.startswith('//'):
        return 'https:' + u
    if u.startswith('/'):
        m = re.match(r'https?://[^/]+', base or '')
        return (m.group(0) if m else '') + u
    if u.startswith('http'):
        return u
    return ''


def interesting(url):
    u = url.lower()
    if any(x in u for x in ('favicon', 'emoji', 'sprite', 'avatar', 'icon_', '/icon.', 'pixel.gif', 'blank.gif', '1x1')):
        return False
    if re.search(r'/(?:capsule_231x87|capsule_184x69|capsule_sm)', u):
        return False
    return True


class Bag(object):
    def __init__(self):
        self.rows = []  # (sec, note, url)
        self.seen = set()

    def add(self, sec, note, url):
        url = abs_url('', url)
        if not url or not interesting(url):
            return
        key = url.split('?')[0]
        if key in self.seen:
            return
        self.seen.add(key)
        self.rows.append((sec, note, url))


def steam_api(bag):
    r = get('https://store.steampowered.com/api/appdetails?appids=1507580&l=brazilian')
    if not r or r.status_code != 200:
        print('appdetails fail', getattr(r, 'status_code', None))
        return
    data = r.json().get('1507580', {}).get('data') or {}
    if data.get('header_image'):
        bag.add('02-marketing', 'Header oficial da pagina da Steam (arte de capa horizontal).', data['header_image'])
    bg = data.get('background_raw') or data.get('background')
    if bg:
        bag.add('02-marketing', 'Fundo da pagina da Steam.', bg)
    for i, s in enumerate(data.get('screenshots') or [], 1):
        full = s.get('path_full') or s.get('path_thumbnail')
        if full:
            bag.add('01-steam', 'Captura oficial %02d da galeria da Steam.' % i, full)
    for m in data.get('movies') or []:
        thumb = m.get('thumbnail')
        name = m.get('name') or 'trailer'
        if thumb:
            bag.add('02-marketing', 'Miniatura oficial do trailer Steam: %s.' % name, thumb)
    desc = data.get('detailed_description') or ''
    about = data.get('about_the_game') or ''
    n = 0
    for u in imgs_in_html(desc + '\n' + about):
        u = abs_url('https://store.steampowered.com/', u)
        if not u:
            continue
        n += 1
        bag.add('03-pagina', 'Imagem oficial embutida na descricao da loja Steam (%02d).' % n, u)
    print('steam api urls', len(bag.rows))


def steam_news(bag):
    r = get('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1507580&count=40&maxlength=0')
    if not r or r.status_code != 200:
        print('news fail')
        return
    items = (r.json().get('appnews') or {}).get('newsitems') or []
    print('news items', len(items))
    for it in items:
        title = strip_tags(it.get('title') or 'noticia')[:80]
        n = 0
        for u in imgs_in_html(it.get('contents') or ''):
            u = abs_url('https://store.steampowered.com/', u)
            if not u:
                continue
            n += 1
            bag.add('04-noticias', 'Imagem da noticia Steam "%s" (%d).' % (title, n), u)


def steam_events(bag):
    urls = [
        'https://store.steampowered.com/events/ajaxgetadjacentpartnerevents/?appid=1507580&count_before=0&count_after=40&l=brazilian',
        'https://store.steampowered.com/events/ajaxgetpartnereventspageable/?appid=1507580&offset=0&count=50&l=brazilian',
    ]
    for u in urls:
        r = get(u)
        if not r or r.status_code != 200:
            print('events', r.status_code if r else None, u[:70])
            continue
        text = r.text
        n = 0
        for src in imgs_in_html(text):
            src = abs_url('https://store.steampowered.com/', src)
            if not src or 'steam' not in src.lower() and 'akamai' not in src.lower() and 'cloudflare' not in src.lower():
                if not re.search(r'\.(jpg|jpeg|png|webp|gif)', src, re.I):
                    continue
            n += 1
            bag.add('04-noticias', 'Imagem de evento/anuncio oficial na Steam (%d).' % n, src)
        print('events html imgs', n, 'from', u[:60])


def page_imgs(bag, sec, url, note):
    r = get(url)
    if not r or r.status_code != 200:
        print('page fail', getattr(r, 'status_code', None), url[:80])
        return []
    text = r.text
    n = 0
    hrefs = []
    for u in imgs_in_html(text):
        u = abs_url(url, u)
        if not u:
            continue
        n += 1
        bag.add(sec, note + ' (%d).' % n, u)
    for m in re.finditer(r'''(?i)href\s*=\s*["']([^"']+)["']''', text):
        hrefs.append(abs_url(url, html.unescape(m.group(1))))
    print('page', n, 'imgs', url[:70])
    return hrefs


def presskit(bag):
    hrefs = page_imgs(
        bag, '05-presskit',
        'https://www.industriadejogos.com.br/jogo/enigma-do-medo/presskit/',
        'Imagem publicada no press kit (Industria de Jogos / ficha do jogo)',
    )
    zips = [h for h in hrefs if h and '.zip' in h.lower()]
    print('zips', zips)
    for z in zips:
        r = get(z, timeout=90)
        if not r or r.status_code != 200 or len(r.content) < 1000:
            print('zip fail', z[:100], getattr(r, 'status_code', None))
            continue
        try:
            zf = zipfile.ZipFile(io.BytesIO(r.content))
        except Exception as e:  # noqa: BLE001
            print('zip open', e)
            continue
        print('zip files', len(zf.namelist()), z[:80])
        for name in zf.namelist():
            low = name.lower()
            if not low.endswith(('.jpg', '.jpeg', '.png', '.webp', '.gif')):
                continue
            if name.endswith('/'):
                continue
            data = zf.read(name)
            if len(data) < 4000:
                continue
            note = 'Arquivo do press kit oficial (ZIP da Industria de Jogos): %s.' % os.path.basename(name)
            bag.rows.append(('05-presskit', note, 'zip:' + z + '#' + name))
            bag._zipblobs = getattr(bag, '_zipblobs', {})
            bag._zipblobs[('zip:' + z + '#' + name)] = data


def cdn_guess(bag):
    root = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1507580/'
    hashed = [
        'd2eaee8dd8ac01fa84b5197e44fd1492d0c82dae/header.jpg',
        'b5f1205abc18673087cdf746e8b0b53865ae80e1/header_brazilian.jpg',
        'dc7429a1c177bf5a7b9355704e573db5042e30a9/header_latam.jpg',
        'b6d6ba4596b701dfc34b6662dc3c781a8cfe2f9a/capsule_616x353.jpg',
        '815bf91a656f370a63700e503704326f45344877/hero_capsule.jpg',
        'ce7bb523cc488f0a026d9326c28afd53f7c08ebd/library_600x900.jpg',
        'a9cb871360f113475796e7f6dda83a6ff42b42e8/library_600x900_brazilian.jpg',
        'e57c56f07255468c10efd92757742379e41348ab/library_600x900_spanish.jpg',
        'a81e581f0908a617c5bb6242aafa182ab82ce57e/library_hero.jpg',
        'page_bg_raw.jpg',
        'page_bg_generated_v6b.jpg',
    ]
    for name in hashed:
        bag.add('02-marketing', 'Asset oficial de loja Steam (%s).' % name.split('/')[-1], root + name)
    plain = 'https://cdn.akamai.steamstatic.com/steam/apps/1507580/'
    for name in ('header.jpg', 'capsule_616x353.jpg', 'library_600x900.jpg', 'library_hero.jpg', 'logo.png', 'page_bg_raw.jpg'):
        bag.add('02-marketing', 'Asset oficial de loja Steam (%s).' % name, plain + name)


def steamdb_and_shop(bag):
    for url, sec, note in (
        ('https://steamdb.info/app/1507580/screenshots/', '01-steam', 'Captura listada no acervo publico SteamDB (midia oficial da loja)'),
        ('https://steamdb.info/app/1507580/info/', '02-marketing', 'Asset oficial listado no SteamDB'),
        ('https://store.steampowered.com/points/shop/app/1507580', '02-marketing', 'Item oficial da loja de pontos Steam (fundo/arte do jogo)'),
        ('https://store.steampowered.com/app/1507580/Enigma_of_Fear/?l=brazilian', '03-pagina', 'Imagem na pagina da loja Steam'),
    ):
        page_imgs(bag, sec, url, note)


def save_all(bag):
    os.makedirs(PASTA, exist_ok=True)
    hashes = set()
    kept = []
    sec_i = {}
    blobs = getattr(bag, '_zipblobs', {})
    for sec, note, url in bag.rows:
        if url.startswith('zip:'):
            data = blobs.get(url)
            mime = 'image/png' if url.lower().endswith('.png') else 'image/gif' if url.lower().endswith('.gif') else 'image/jpeg'
            final_url = url.split('#')[0][4:]
            fname_hint = url.split('#')[-1]
        else:
            r = get(url, timeout=60)
            if not r or r.status_code != 200:
                continue
            data = r.content
            ctype = (r.headers.get('content-type') or '').split(';')[0].strip().lower()
            mime = ctype if ctype in IMG_EXT else ''
            if not mime:
                if data[:3] == b'\xff\xd8\xff':
                    mime = 'image/jpeg'
                elif data[:8] == b'\x89PNG\r\n\x1a\n':
                    mime = 'image/png'
                elif data[:4] == b'RIFF' and data[8:12] == b'WEBP':
                    mime = 'image/webp'
                elif data[:6] in (b'GIF87a', b'GIF89a'):
                    mime = 'image/gif'
                else:
                    continue
            final_url = r.url
            fname_hint = url
            time.sleep(0.15)
        if not data or len(data) < 8000:
            continue
        h = hashlib.sha1(data).hexdigest()
        if h in hashes:
            continue
        hashes.add(h)
        sec_i[sec] = sec_i.get(sec, 0) + 1
        ext = IMG_EXT.get(mime, '.jpg')
        nome = '%s-%02d-%s%s' % (sec[:2], sec_i[sec], slug(os.path.basename(fname_hint.split('?')[0])), ext)
        dest = os.path.join(PASTA, nome)
        with open(dest, 'wb') as f:
            f.write(data)
        kept.append((sec, nome, final_url, note, len(data)))
        print('ok', nome, len(data))
        if len(kept) >= 120:
            break
    return kept


def write_fontes(kept):
    lines = []
    lines.append('# Fontes — Enigma do Medo (Dumativa / Cellbit)')
    lines.append('')
    lines.append('Referencia interna de direcao de arte para o abrigo de Lua de Sangue.')
    lines.append('Imagens publicas de paginas oficiais, loja Steam, press kit e imprensa.')
    lines.append('Nao redistribuir. Nenhum pixel destas imagens entra em `jogo/`.')
    lines.append('')
    lines.append('Total de arquivos distintos: **%d**.' % len(kept))
    lines.append('')
    lines.append('| arquivo | URL | o que mostra |')
    lines.append('|---|---|---|')
    cur = None
    # grouped tables
    body = []
    groups = []
    for sec, nome, url, note, size in kept:
        if sec != cur:
            cur = sec
            groups.append((sec, []))
        groups[-1][1].append((nome, url, note, size))
    titles = {
        '01-steam': 'Galeria oficial da Steam',
        '02-marketing': 'Artes de loja e trailers (Steam)',
        '03-pagina': 'Imagens da descricao oficial na Steam',
        '04-noticias': 'Noticias e eventos oficiais na Steam',
        '05-presskit': 'Press kit (Industria de Jogos) e fichas',
        '06-sites': 'Sites oficiais e landing pages',
        '07-imprensa': 'Materias com imagens oficiais',
    }
    for sec, rows in groups:
        body.append('')
        body.append('## %s' % titles.get(sec, sec))
        body.append('')
        body.append('| arquivo | URL | o que mostra |')
        body.append('|---|---|---|')
        for nome, url, note, size in rows:
            safe = note.replace('|', '/')
            body.append('| %s | %s | %s |' % (nome, url, safe))
    text = '\n'.join(lines + body) + '\n'
    with open(os.path.join(PASTA, 'FONTES.md'), 'w', encoding='utf-8') as f:
        f.write(text)
    print('FONTES', len(kept))


def main():
    bag = Bag()
    steam_api(bag)
    steam_news(bag)
    steam_events(bag)
    cdn_guess(bag)
    steamdb_and_shop(bag)
    presskit(bag)
    pages = [
        ('06-sites', 'https://www.nuuvem.com/lp/pt/enigma-do-medo/', 'Imagem da pagina oficial de lancamento na Nuuvem'),
        ('06-sites', 'https://www.industriadejogos.com.br/jogo/enigma-do-medo/', 'Imagem da ficha do jogo na Industria de Jogos'),
        ('06-sites', 'https://dumativa.com/', 'Imagem do site da Dumativa'),
        ('06-sites', 'https://www.dumativa.com/', 'Imagem do site da Dumativa'),
        ('06-sites', 'https://devuego.lat/en/presskit/enigma-of-fear', 'Imagem do press kit espelhado no DeVuego'),
        ('07-imprensa', 'https://www.mobygames.com/game/234516/enigma-of-fear/promo/', 'Arte promocional catalogada no MobyGames'),
        ('07-imprensa', 'https://store.steampowered.com/news/app/1507580', 'Imagem na listagem de noticias da Steam'),
    ]
    for sec, url, note in pages:
        page_imgs(bag, sec, url, note)
    print('candidatos', len(bag.rows))
    kept = save_all(bag)
    write_fontes(kept)


if __name__ == '__main__':
    main()
