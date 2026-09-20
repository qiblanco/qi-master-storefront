#!/usr/bin/env python3
"""Wirkungs-Probe: der Kaufweg von qi-master.de fuehrt auf qiblanco.com -- gemessen am ausgelieferten HTML.

Christian (18./19./20.09.2026): Frontseite = Landingpage, dazu die Kaufseite, und der Kaufknopf
fuehrt auf qiblanco.com; qi-master.de wickelt nichts ab. Diese Probe rendert beide Seiten und
misst, was ein Besucher bekaeme:

  A  /  und /products/qi-master antworten 200 und nennen den Qi Master (h1)
  B  auf JEDER der zwei Seiten zeigt der Kaufknopf (data-qa="atc" bzw. der Warenkorb-Link)
     auf https://qiblanco.com/cart/<variante>:1 -- mit der Variante aus der Storefront-API
     (kein hingeschriebener Wert; die Probe liest die Nummer selbst aus der API und vergleicht)
  C  KEIN Formular postet nach /cart und kein Link fuehrt in einen Warenkorb dieser Domain
  D  Tracking-Parameter reisen ueber die Grenze: ?fbclid=...&utm_source=... an der Landingpage
     steht am Kaufweg-Link und am Link zur Kaufseite wieder; ein fremder Parameter (foo) nicht
  E  der Preis steht auf beiden Seiten als 10.639,- EUR-Schreibweise, mit "inkl. 19 % MwSt."
  F  die zwei FAQ von Platz eins und zwei stehen auf der Landingpage im Text
  G  der gestrichene Deutungsabsatz vom 18.09. steht auf KEINER Seite

EXIT 0 gruen | 1 Befund | 4 Messausfall (kein Bau, kein Server, API nicht erreichbar)

  probe_kaufweg_qiblanco.py               # startet `shopify hydrogen preview` auf einem freien Port
  probe_kaufweg_qiblanco.py --url http://127.0.0.1:3341   # misst einen laufenden Server
Umlenkbar: QM_STOREFRONT (Baum), fuer den Rot-Nachweis QM_HTML_DIR (fertige HTML-Dateien
frontseite.html / kaufseite.html statt eines Servers).
"""
import json
import os
import re
import socket
import subprocess
import sys
import time
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
STOREFRONT = os.environ.get("QM_STOREFRONT", os.path.dirname(HIER))
DEUTUNG = "Zwischen der Überlieferung und dem Fundament"
UA = "Mozilla/5.0 qi-master-kaufweg-probe (qiblanco-hausprobe)"


def hole(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status, r.read().decode("utf-8", "replace")


def freier_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def env_lesen():
    env = {}
    with open(os.path.join(STOREFRONT, ".env")) as f:
        for z in f:
            z = z.strip()
            if "=" in z and not z.startswith("#"):
                k, v = z.split("=", 1)
                env[k] = v.strip().strip('"')
    return env


def variante_aus_api(env):
    q = {"query": '{ product(handle:"qi-master") { selectedOrFirstAvailableVariant { id price { amount } } } }'}
    req = urllib.request.Request(
        f"https://{env['PUBLIC_STORE_DOMAIN']}/api/2026-04/graphql.json",
        data=json.dumps(q).encode(), method="POST",
        headers={"Content-Type": "application/json",
                 "X-Shopify-Storefront-Access-Token": env["PUBLIC_STOREFRONT_API_TOKEN"],
                 "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        v = json.load(r)["data"]["product"]["selectedOrFirstAvailableVariant"]
    return re.search(r"ProductVariant/(\d+)", v["id"]).group(1), round(float(v["price"]["amount"]) * 1.19)


def server_starten(port):
    log = open(os.path.join(os.environ.get("TMPDIR", "/tmp"), f"qm-preview-{port}.log"), "w")
    p = subprocess.Popen(["npx", "shopify", "hydrogen", "preview", "--port", str(port)],
                         cwd=STOREFRONT, stdout=log, stderr=subprocess.STDOUT,
                         env={**os.environ, "PATH": os.path.expanduser("~/.npm-global/bin") + ":" + os.environ.get("PATH", "")})
    for _ in range(60):
        time.sleep(1)
        try:
            hole(f"http://127.0.0.1:{port}/")
            return p
        except Exception:  # noqa: BLE001
            if p.poll() is not None:
                break
    p.terminate()
    raise RuntimeError("Vorschau-Server kam nicht hoch")


def main(argv):
    url = None
    if "--url" in argv:
        url = argv[argv.index("--url") + 1].rstrip("/")
    html_dir = os.environ.get("QM_HTML_DIR")
    befunde = []
    proc = None
    try:
        env = env_lesen()
        variante, brutto = variante_aus_api(env)
    except Exception as e:  # noqa: BLE001
        print(f"EXIT4 MESSAUSFALL: Storefront-API/.env: {e}")
        return 4
    q = "?fbclid=PROBE123&utm_source=probe&foo=fremd"
    try:
        if html_dir:
            seiten = {"/": open(os.path.join(html_dir, "frontseite.html"), encoding="utf-8").read(),
                      "/products/qi-master": open(os.path.join(html_dir, "kaufseite.html"), encoding="utf-8").read()}
        else:
            if not url:
                if not os.path.exists(os.path.join(STOREFRONT, "dist", "server", "index.js")):
                    print("EXIT4 MESSAUSFALL: kein Bau unter dist/ -- erst `npm run build`")
                    return 4
                port = freier_port()
                proc = server_starten(port)
                url = f"http://127.0.0.1:{port}"
            seiten = {}
            for pfad in ("/", "/products/qi-master"):
                st, h = hole(url + pfad + q)
                if st != 200:
                    befunde.append(f"A: {pfad} antwortet {st}")
                seiten[pfad] = h
    except Exception as e:  # noqa: BLE001
        print(f"EXIT4 MESSAUSFALL: Seiten nicht abrufbar: {e}")
        return 4
    finally:
        if proc:
            proc.terminate()
    kaufweg = f"https://qiblanco.com/cart/{variante}:1"
    for pfad, h in seiten.items():
        if not re.search(r"<h1[^>]*>[^<]*Qi Master", h):
            befunde.append(f"A: {pfad} nennt den Qi Master nicht in der h1")
        links = [x.replace("&amp;", "&") for x in re.findall(r'href="(https://qiblanco\.com/cart/[^"]*)"', h)]
        if not links:
            befunde.append(f"B: {pfad} hat keinen Kaufweg-Link auf qiblanco.com/cart/")
        for l in links:
            if not l.startswith(kaufweg):
                befunde.append(f"B: {pfad} Kaufweg zeigt auf {l[:70]} statt {kaufweg}")
            if "fbclid=PROBE123" not in l or "utm_source=probe" not in l:
                befunde.append(f"D: {pfad} Kaufweg traegt die Tracking-Parameter nicht: {l[:90]}")
            if "foo=" in l:
                befunde.append(f"D: {pfad} reicht den fremden Parameter foo durch")
        if re.search(r'<form[^>]*action="[^"]*/cart', h):
            befunde.append(f"C: {pfad} hat ein Formular nach /cart")
        if re.search(r'href="/cart', h):
            befunde.append(f"C: {pfad} verlinkt einen eigenen Warenkorb")
        preis = f"{brutto:,}".replace(",", ".") + ",- €"
        if preis not in h:
            befunde.append(f"E: {pfad} zeigt nicht {preis}")
        if "inkl. 19 % MwSt." not in h:
            befunde.append(f"E: {pfad} ohne 'inkl. 19 % MwSt.'")
        if DEUTUNG in h:
            befunde.append(f"G: {pfad} traegt den gestrichenen Deutungsabsatz")
    lp = seiten.get("/", "")
    intern = [x.replace("&amp;", "&") for x in re.findall(r'href="(/products/qi-master[^"]*)"', lp)]
    if not intern:
        befunde.append("D: Landingpage ohne Link zur Kaufseite")
    for l in intern:
        if "fbclid=PROBE123" not in l or "utm_source=probe" not in l or "foo=" in l:
            befunde.append(f"D: Landingpage -> Kaufseite reicht die Parameter nicht richtig durch: {l[:80]}")
    for frage in ("Wie stark ist der Qi Master® im Vergleich zum QiOne® 2 Pro?", "Für wen ist der Qi Master® geeignet?"):
        if frage not in lp:
            befunde.append(f"F: Landingpage ohne die Frage '{frage[:40]}…'")
    if befunde:
        print("ROT: " + " | ".join(befunde))
        return 1
    print(f"GRUEN: beide Seiten 200, Kaufknopf -> {kaufweg} (Variante aus der API), Parameter reisen mit, "
          f"kein eigener Warenkorb, Preis {brutto} EUR brutto, FAQ 1+2 auf der Landingpage, Deutungsabsatz fehlt")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
