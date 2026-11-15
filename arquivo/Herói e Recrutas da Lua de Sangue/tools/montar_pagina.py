"""Junta docs/*.json, heroi/*.json (manifestos) e lista de recrutas em data.js para a página (file://)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECRUTAS = [
    ("serralheiro", "Serralheiro", "Serralheria", "Construção", "Combate", "Me dá uma bigorna que eu resolvo."),
    ("pedreira", "Pedreira", "Construção", "Serralheria", "Medicina", "Muro torto aqui não fica de pé."),
    ("lenhador", "Lenhador", "Madeira", "Combate", "Medicina", "Machado eu já sei usar."),
    ("catadora", "Catadora", "Coleta", "Madeira", "Defesa", "Lixo de um é tesouro de outro."),
    ("agricultor", "Agricultor", "Horta", "Coleta", "Combate", "Planta que dá, a gente come."),
    ("vigia", "Vigia", "Defesa", "Combate", "Horta", "Ninguém passa do portão."),
    ("capoeirista", "Capoeirista", "Combate", "Defesa", "Serralheria", "Zumbi não sabe gingar."),
    ("enfermeira", "Enfermeira", "Medicina", "Horta", "Madeira", "Senta aí que eu dou um jeito nisso."),
]
DUR = {"idle": [220] * 4, "walk": [110] * 8, "attack": [90, 170, 130, 50, 120, 160], "hurt": [60, 90, 90, 110],
       "death": [70, 110, 110, 100, 140, 600], "special": [120, 150, 150, 90, 140, 200],
       "attack_fire": [80, 160, 60, 70, 120, 160], "attack_knife": [80, 150, 60, 50, 110, 150]}


def load(p):
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


rec = []
for rid, nome, pri, sec, con, fala in RECRUTAS:
    d = load(os.path.join(ROOT, "docs", rid + ".json")) or {}
    sheet = "recrutas/%s.png" % rid
    rec.append(dict(d, id=rid, nome=d.get("nome", nome), pri=pri, sec=sec, con=con, fala=d.get("fala", fala),
                    sheet=sheet if os.path.exists(os.path.join(ROOT, sheet)) else None,
                    variantes=("recrutas/%s_variantes.png" % rid) if os.path.exists(os.path.join(ROOT, "recrutas", rid + "_variantes.png")) else None))

hero_docs = [d for d in (load(os.path.join(ROOT, "docs", n + ".json")) for n in ("heroi_corpo", "heroi_cabelos", "heroi_equip")) if d]
manifests = {}
for n in ("corpo", "cabelos", "equip"):
    m = load(os.path.join(ROOT, "heroi", n + ".json"))
    if m:
        # só itens cujo arquivo existe
        m["itens"] = [it for it in m.get("itens", []) if it.get("arquivo") and os.path.exists(os.path.join(ROOT, it["arquivo"]))]
        manifests[n] = m

data = {"frame": 128, "dur": DUR, "nfr": {k: len(v) for k, v in DUR.items()},
        "rows": ["idle", "walk", "attack", "hurt", "death", "special"],
        "hrows": ["idle", "walk", "attack", "hurt", "death", "special", "attack_fire", "attack_knife"],
        "recrutas": rec, "heroDocs": hero_docs, "hero": manifests}
with open(os.path.join(ROOT, "data.js"), "w", encoding="utf-8") as f:
    f.write("window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("recrutas com folha:", sum(1 for r in rec if r["sheet"]), "| docs herói:", len(hero_docs),
      "| manifestos:", {k: len(v["itens"]) for k, v in manifests.items()})
