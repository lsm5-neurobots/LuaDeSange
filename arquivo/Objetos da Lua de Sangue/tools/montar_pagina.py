"""Junta docs/*.json em data.js (a página abre via file://, sem fetch). Rodar: python montar_pagina.py"""
import glob
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

grupos = []
for p in sorted(glob.glob(os.path.join(ROOT, "docs", "*.json"))):
    try:
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
    except Exception as e:  # noqa
        print("pulando", os.path.basename(p), e)
        continue
    d["grupo"] = d.get("grupo") or os.path.basename(p)[:-5]
    itens = []
    for it in d.get("itens", []):
        f = os.path.join(ROOT, it.get("arquivo", ""))
        if not os.path.exists(f):
            print("sem png:", it.get("id"))
            continue
        n = len(it.get("quadros", [])) or 1
        it.setdefault("cols", n)
        it["w"], it["h"] = Image.open(f).size
        itens.append(it)
    d["itens"] = itens
    if itens:
        grupos.append(d)

grupos.sort(key=lambda g: (g.get("ordem", 99), g["grupo"]))
total = sum(len(g["itens"]) for g in grupos)
quadros = sum(len(i["quadros"]) for g in grupos for i in g["itens"])
with open(os.path.join(ROOT, "data.js"), "w", encoding="utf-8") as f:
    f.write("window.DATA = " + json.dumps({"grupos": grupos, "total": total, "quadros": quadros},
                                          ensure_ascii=False) + ";\n")
print("data.js: %d grupos, %d assets, %d quadros" % (len(grupos), total, quadros))
