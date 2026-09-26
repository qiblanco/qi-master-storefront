#!/usr/bin/env python3
"""Drift-Wache: die Inhalte von qi-master.de gegen den Bestand auf qiblanco.com.

WAS SIE MISST. Jede Datei unter app/data/qi-master/ (und die drei K1-Helfer unter app/lib/)
wird NEU aus origin/main der DACH-Storefront abgeleitet (pruefungen/bestand.py -- derselbe
Code wie der Nachzieher) und byte-weise mit der lokalen Fassung verglichen. Dazu vier Arme:
  manifest   BESTAND.json nennt jede Datei mit Hash, und der Hash stimmt (Manifest-Integritaet)
  deutung    der am 18.09. gestrichene Deutungsabsatz steht in keiner abgeleiteten Datei
  kaufweg    die Parameter-Allowlist in app/lib/kaufweg.js ist eine TEILMENGE der
             TRACKING_PARAM_NAMES in checkout-tracking.js drueben (die Naht der Attribution)
  preis      der Listenpreis der Treppe (JSON) stimmt mit dem Bruttopreis der Storefront-API
             ueberein (netto x 1,19, ganze Euro) -- nur mit --live, sonst uebersprungen

EXIT   0 SYNCHRON | 2 BEFUND (Drift oder Verletzung) | 4 MESSAUSFALL (Quelle nicht lesbar)
Ein Messausfall ist nie gruen und nie ein Befund: ein git-Fehler schickt sonst Reparatur gegen
gesunden Code.

  probe_bestand_naht.py [--kein-fetch] [--live] [--json]
Umlenkbar fuer den Rot-Nachweis: QB_REPO, QB_REF (Vorlage) und QM_STOREFRONT (der Baum hier).
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bestand as B  # noqa: E402

STOREFRONT = os.environ.get("QM_STOREFRONT", B.STOREFRONT)


def lokal(rel):
    p = os.path.join(STOREFRONT, rel)
    if not os.path.exists(p):
        return None
    with open(p, "rb") as f:
        return f.read()


def ohne_kommentare(js):
    js = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
    return re.sub(r"^\s*//.*$", "", js, flags=re.M)


def arm_kaufweg(befunde):
    up = B.git_show("app/lib/checkout-tracking.js").decode("utf-8", "replace")
    m = re.search(r"const TRACKING_PARAM_NAMES = new Set\(\[(.*?)\]\);", up, re.S)
    if not m:
        raise B.Messausfall("TRACKING_PARAM_NAMES in checkout-tracking.js nicht gefunden")
    oben = set(re.findall(r"'([^']+)'", m.group(1)))
    hier_src = lokal("app/lib/kaufweg.js")
    if hier_src is None:
        raise B.Messausfall("app/lib/kaufweg.js fehlt")
    m2 = re.search(r"DURCHGEREICHTE_PARAMETER = new Set\(\[(.*?)\]\);", hier_src.decode("utf-8"), re.S)
    if not m2:
        raise B.Messausfall("DURCHGEREICHTE_PARAMETER in kaufweg.js nicht gefunden")
    hier = set(re.findall(r"'([^']+)'", m2.group(1)))
    zuviel = sorted(hier - oben)
    if zuviel:
        befunde.append(f"KAUFWEG-NAHT: Parameter, die qiblanco.com nicht liest: {zuviel}")
    return {"oben": len(oben), "hier": len(hier)}


def arm_preis(befunde):
    env = {}
    with open(os.path.join(STOREFRONT, ".env")) as f:
        for z in f:
            z = z.strip()
            if "=" in z and not z.startswith("#"):
                k, v = z.split("=", 1)
                env[k] = v.strip().strip('"')
    q = {"query": 'query($c: CountryCode) @inContext(country: $c) { product(handle:"qi-master") '
                  '{ selectedOrFirstAvailableVariant { price { amount } } } }', "variables": {"c": "DE"}}
    req = urllib.request.Request(
        f"https://{env['PUBLIC_STORE_DOMAIN']}/api/2026-04/graphql.json",
        data=json.dumps(q).encode(), method="POST",
        headers={"Content-Type": "application/json",
                 "X-Shopify-Storefront-Access-Token": env["PUBLIC_STOREFRONT_API_TOKEN"],
                 "User-Agent": "qi-master-bestand-naht (qiblanco-hausprobe)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            d = json.load(r)
    except Exception as e:  # noqa: BLE001
        raise B.Messausfall(f"Storefront-API nicht erreichbar: {e}")
    netto = float(d["data"]["product"]["selectedOrFirstAvailableVariant"]["price"]["amount"])
    brutto_api = round(netto * 1.19)
    js = json.loads(lokal("app/data/qi-master/qi-master-preisstufen.json"))
    brutto_json = round(float(js["listenpreis_brutto_eur"]))
    if brutto_api != brutto_json:
        befunde.append(f"PREIS-NAHT: Storefront-API {brutto_api} EUR brutto gegen Treppe {brutto_json} EUR")
    return {"api_brutto": brutto_api, "treppe_brutto": brutto_json}


def restbericht():
    """Upstream-Dateien mit "qi-master" im Namen unter app/data und app/lib, die KEINE Quelle
    der Ableitung sind. Ohne Verdikt (Markierung, kein Exit): die Wache ist ein
    Einschluss-Selektor -- sie vergleicht nur, was bestand.py ableitet, und waere sonst blind
    dafuer, dass drueben eine NEUE Quelle die alte abloest (Belegfall 2026-09-26: seit dem 22.09.
    tragen die Seiten drueben den Wortlaut aus qi-master-wortlaut.json statt der Treppe; hier
    stand alles gruen). Ob so eine Datei hierher gehoert, ist eine Entscheidung, kein Nachzug."""
    r = subprocess.run(["git", "-C", B.QB_REPO, "ls-tree", "-r", "--name-only", B.QB_REF,
                        "app/data", "app/lib"], capture_output=True, text=True)
    if r.returncode != 0:
        raise B.Messausfall(f"git ls-tree: {r.stderr.strip()[:200]}")
    quellen = set(B.K1) | {B.FAQ_QUELLE, *B.STUDIEN_QUELLEN}
    return sorted(p for p in r.stdout.split()
                  if "qi-master" in os.path.basename(p) and p not in quellen)


def main(argv):
    als_json = "--json" in argv
    befunde, detail = [], {}
    try:
        if "--kein-fetch" not in argv:
            r = subprocess.run(["git", "-C", B.QB_REPO, "fetch", "-q", "origin"],
                               capture_output=True, text=True, timeout=120)
            if r.returncode != 0:
                raise B.Messausfall(f"git fetch: {r.stderr.strip()[:200]}")
        commit = B.git_rev()
        soll = B.soll_ableiten()
        mani_b = lokal("app/data/qi-master/BESTAND.json")
        if mani_b is None:
            raise B.Messausfall("BESTAND.json fehlt")
        mani = json.loads(mani_b)
        im_manifest = {e["lokal"]: e["sha256"] for e in mani.get("dateien", [])}
        for rel, b in sorted(soll.items()):
            ist = lokal(rel)
            if ist is None:
                befunde.append(f"FEHLT: {rel}")
                continue
            if ist != b:
                art = "LOKAL-DRIFT" if im_manifest.get(rel) == B.sha256(b) else "UPSTREAM-DRIFT"
                befunde.append(f"{art}: {rel}")
            if rel not in im_manifest:
                befunde.append(f"MANIFEST: {rel} nicht in BESTAND.json")
            elif im_manifest[rel] != B.sha256(ist):
                befunde.append(f"MANIFEST: Hash von {rel} stimmt nicht mit der Datei")
            # Nur der INHALT zaehlt: der K1-Text traegt den Absatz im Kommentar, der seine
            # Streichung begruendet -- das ist die Quelle, nicht ein Rueckfall.
            if B.DEUTUNG_GESTRICHEN.search(ohne_kommentare(ist.decode("utf-8", "replace"))):
                befunde.append(f"DEUTUNG: gestrichener Absatz vom 18.09. steht in {rel}")
        detail["kaufweg"] = arm_kaufweg(befunde)
        if "--live" in argv:
            detail["preis"] = arm_preis(befunde)
        detail["ungedeckt"] = restbericht()
        detail.update({"upstream": commit, "manifest_commit": mani.get("upstream_commit"),
                       "dateien": len(soll)})
    except B.Messausfall as e:
        print(json.dumps({"exit": 4, "messausfall": str(e)}) if als_json else f"EXIT4 MESSAUSFALL: {e}")
        return 4
    if als_json:
        print(json.dumps({"exit": 2 if befunde else 0, "befunde": befunde, **detail}, ensure_ascii=False))
    elif befunde:
        print("ROT: " + " | ".join(befunde))
    else:
        print(f"GRUEN: {detail['dateien']} Dateien synchron mit {B.QB_REF}={commit[:9]}; "
              f"Kaufweg-Allowlist {detail['kaufweg']['hier']}/{detail['kaufweg']['oben']} gedeckt"
              + (f"; Preis {detail['preis']['api_brutto']} EUR = Treppe" if "preis" in detail else ""))
    if not als_json and detail["ungedeckt"]:
        print(f"HINWEIS: UNGEDECKT (drueben, nicht abgeleitet, ohne Verdikt): {', '.join(detail['ungedeckt'])}")
    return 2 if befunde else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
