"""Baixa referencias visuais do Wikimedia Commons para uma pasta, com FONTES.md e index.html em grade.

Uso: python commons_refs.py spec.json
spec = {"titulo": "...", "pasta": "lapa", "secoes": [{"nome": "Arcos da Lapa", "n": 12,
         "cats": ["Arcos da Lapa"], "busca": ["Arcos da Lapa Rio"]}]}
Uso interno: respeitar licencas, nao redistribuir.
"""
import html
import json
import os
import re
import sys
import time
import unicodedata

import requests

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'LuaDeSangueRefs/1.0 (referencia visual interna; python-requests)'}
S = requests.Session()
S.headers.update(UA)
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def api(**p):
    p.update(format='json', formatversion=2)
    for i in range(5):
        try:
            r = S.get(API, params=p, timeout=40)
            if r.status_code == 429:
                time.sleep(5 + i * 5)
                continue
            return r.json()
        except Exception:  # noqa: BLE001
            time.sleep(2 + i * 2)
    return {}


def slug(s, n=48):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'\.[a-z0-9]+$', '', s.lower())
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:n].strip('-')


def strip_html(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()


def titles_cat(cat, lim=120, depth=1, seen=None):
    seen = seen if seen is not None else set()
    if cat in seen:
        return []
    seen.add(cat)
    out = []
    d = api(action='query', list='categorymembers', cmtitle='Category:' + cat, cmtype='file|subcat', cmlimit=lim)
    for m in d.get('query', {}).get('categorymembers', []):
        t = m['title']
        if t.startswith('File:'):
            out.append(t)
        elif t.startswith('Category:') and depth > 0 and len(out) < lim:
            out += titles_cat(t[9:], lim // 2, depth - 1, seen)
    return out


def titles_search(q, lim=60):
    d = api(action='query', list='search', srsearch=q + ' filetype:bitmap', srnamespace=6, srlimit=lim)
    return [m['title'] for m in d.get('query', {}).get('search', [])]


def infos(titles):
    out = []
    for i in range(0, len(titles), 40):
        d = api(action='query', titles='|'.join(titles[i:i + 40]), prop='imageinfo',
                iiprop='url|size|mime|extmetadata', iiurlwidth=1600)
        for p in d.get('query', {}).get('pages', []):
            ii = (p.get('imageinfo') or [None])[0]
            if not ii or ii.get('mime') not in ('image/jpeg', 'image/png'):
                continue
            if min(ii.get('width', 0), ii.get('height', 0)) < 500:
                continue
            md = ii.get('extmetadata', {})
            lic = strip_html(md.get('LicenseShortName', {}).get('value', ''))
            if not lic or 'fair use' in lic.lower():
                continue
            out.append({'title': p['title'], 'url': ii.get('thumburl') or ii['url'], 'page': ii.get('descriptionurl'),
                        'autor': strip_html(md.get('Artist', {}).get('value', ''))[:80] or 'desconhecido', 'lic': lic,
                        'mime': ii['mime']})
    return out


def main(spec_path):
    spec = json.load(open(spec_path, encoding='utf-8'))
    pasta = os.path.join(BASE, spec['pasta'])
    os.makedirs(pasta, exist_ok=True)
    usados = set()
    excl = set(spec.get('excluir', []))  # titulos ja curados/apagados: nao baixar de novo
    rows = []
    sobra = {}
    gots = {}

    def baixar(si, sec, inf, got):
        ext = '.png' if inf['mime'] == 'image/png' else '.jpg'
        nome = f"{si:02d}-{got + 1:02d}-{slug(inf['title'][5:])}{ext}"
        dest = os.path.join(pasta, nome)
        try:
            if not os.path.exists(dest):
                r = S.get(inf['url'], timeout=60)
                if r.status_code != 200 or len(r.content) < 15000:
                    return False
                open(dest, 'wb').write(r.content)
                time.sleep(0.4)
        except Exception:  # noqa: BLE001
            return False
        usados.add(inf['title'])
        rows.append((si, sec['nome'], nome, inf))
        return True

    for si, sec in enumerate(spec['secoes'], 1):
        cand = []
        for c in sec.get('cats', []):
            cand += titles_cat(c, depth=sec.get('depth', 1))
        for q in sec.get('busca', []):
            cand += titles_search(q)
        cand = [t for t in dict.fromkeys(cand) if t not in usados and t not in excl]
        pool = infos(cand[:sec['n'] * 12])
        got = 0
        while pool and got < sec['n']:
            inf = pool.pop(0)
            if inf['title'] in usados:
                continue
            if baixar(si, sec, inf, got):
                got += 1
        sobra[si], gots[si] = pool, got
        print(f"{si:02d} {sec['nome']}: {got}/{sec['n']}", flush=True)
    alvo = spec.get('alvo', 100)
    mexeu = True
    while len(rows) < alvo and mexeu:  # completa o alvo com o que sobrou das secoes (rodizio)
        mexeu = False
        for si, sec in enumerate(spec['secoes'], 1):
            if len(rows) >= alvo:
                break
            while sobra[si]:
                inf = sobra[si].pop(0)
                if inf['title'] not in usados and baixar(si, sec, inf, gots[si]):
                    gots[si] += 1
                    mexeu = True
                    break
    rows.sort(key=lambda r: (r[0], r[2]))
    escrever(spec, pasta, rows)
    print('total', len(rows))


def escrever(spec, pasta, rows):
    md = [f"# Fontes das referencias - {spec['titulo']}", '',
          '> Referencia visual interna. Respeitar as licencas indicadas; nao redistribuir.', '',
          'Todas as imagens vem do Wikimedia Commons (versao ~1600 px). Atribuicao: autor + licenca + pagina de origem.', '']
    h = [f'<!doctype html><html lang="pt-br"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         f'<title>Referencias {html.escape(spec["titulo"])}</title><style>body{{background:#16121a;color:#e8dfd0;font:14px sans-serif;margin:16px}}'
         'h2{border-bottom:1px solid #554;padding-bottom:4px;margin-top:28px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}'
         'figure{margin:0;background:#241d2b;padding:6px}img{width:100%;height:170px;object-fit:cover;display:block;cursor:zoom-in}'
         'figcaption{font-size:11px;color:#a99;margin-top:4px;word-break:break-all}a{color:#e9b}</style>'
         f'<h1>Referencias visuais - {html.escape(spec["titulo"])}</h1><p>Referencia visual interna. Respeitar as licencas (ver FONTES.md); nao redistribuir. {len(rows)} imagens.</p>']
    atual = None
    for si, nome_sec, nome, inf in rows:
        if si != atual:
            if atual is not None:
                h.append('</div>')
            atual = si
            md += [f'## {si:02d} - {nome_sec}', '', '| arquivo | URL da imagem | pagina de origem | autor | licenca |', '|---|---|---|---|---|']
            h.append(f'<h2>{si:02d} - {html.escape(nome_sec)}</h2><div class="g">')
        md.append(f"| {nome} | {inf['url']} | {inf['page']} | {inf['autor'].replace('|', '/')} | {inf['lic']} |")
        h.append(f'<figure><a href="{nome}" target="_blank"><img loading="lazy" src="{nome}"></a>'
                 f'<figcaption>{nome}<br>{html.escape(inf["autor"])} - {html.escape(inf["lic"])}</figcaption></figure>')
        if si != (rows[rows.index((si, nome_sec, nome, inf)) + 1][0] if rows.index((si, nome_sec, nome, inf)) + 1 < len(rows) else None):
            md.append('')
    if rows:
        h.append('</div>')
    open(os.path.join(pasta, 'FONTES.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    open(os.path.join(pasta, 'index.html'), 'w', encoding='utf-8').write(''.join(h))


if __name__ == '__main__':
    main(sys.argv[1])
