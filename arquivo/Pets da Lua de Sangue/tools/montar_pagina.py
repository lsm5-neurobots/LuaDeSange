"""Junta sprites/*.json em data.js (a página abre via file://, sem fetch)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["cachorro", "gato", "papagaio", "jabuti", "capivara", "sagui"]
DUR = {"idle": [220] * 4, "walk": [110] * 8, "attack": [90, 170, 130, 50, 120, 160],
       "hurt": [60, 90, 90, 110], "death": [70, 110, 110, 100, 140, 600], "special": [120, 150, 150, 90, 140, 200]}

pets = []
for pid in ORDER:
    p = os.path.join(ROOT, "sprites", pid + ".json")
    if not os.path.exists(p):
        print("faltando:", pid)
        continue
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    d["id"] = pid
    d["sheet"] = "sprites/%s.png" % pid
    pets.append(d)

data = {"frame": 128, "rows": list(DUR), "nfr": {k: len(v) for k, v in DUR.items()}, "dur": DUR, "pets": pets}
with open(os.path.join(ROOT, "data.js"), "w", encoding="utf-8") as f:
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("data.js:", len(pets), "pets")
