"""Valida docs/<grupo>.json e os PNGs. Uso: python checar.py [grupo ...] (sem args = todos)."""
import json, os, sys, glob
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQ = ["id", "nome", "categoria", "conceito", "partes", "paleta", "arquivo", "fw", "fh", "quadros"]
args = sys.argv[1:] or [os.path.basename(p)[:-5] for p in glob.glob(os.path.join(ROOT, "docs", "*.json"))]
bad = 0; ids = {}
for g in args:
    p = os.path.join(ROOT, "docs", g + ".json")
    try:
        d = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        print("ERRO json", g, e); bad += 1; continue
    for it in d.get("itens", []):
        miss = [k for k in REQ if k not in it]
        if miss: print("ERRO", it.get("id"), "faltando", miss); bad += 1; continue
        if it["id"] in ids: print("ERRO id repetido", it["id"]); bad += 1
        ids[it["id"]] = g
        f = os.path.join(ROOT, it["arquivo"])
        if not os.path.exists(f): print("ERRO sem png", it["id"], f); bad += 1; continue
        W, H = Image.open(f).size; n = len(it["quadros"]); cols = it.get("cols", n)
        rows = (n + cols - 1) // cols
        if (W, H) != (it["fw"] * cols, it["fh"] * rows):
            print("ERRO tamanho", it["id"], (W, H), "esperado", (it["fw"] * cols, it["fh"] * rows)); bad += 1
        for a in it.get("anims", []):
            if any(q >= n for q in a["quadros"]) or len(a["dur"]) != len(a["quadros"]):
                print("ERRO anim", it["id"], a["nome"]); bad += 1
        if len(it["conceito"]) < 120: print("AVISO conceito curto", it["id"])
    print(g, ":", len(d.get("itens", [])), "itens")
print("OK" if not bad else "%d erro(s)" % bad)
