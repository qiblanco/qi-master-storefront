#!/usr/bin/env python3
"""Liefert qi-master.de die gemessenen Zellwerte (Block qm-zellwerte) so aus, wie sie drueben stehen?

Anlass: PR #645 brachte auf qiblanco.com/products/qi-master die Zellwerte zurueck (TEER 1.837
gegen 152, 84,7 statt 60,5 Prozent, Quellen [8]/[9]) -- zunaechst HART im JSX. qi-master.de
leitet seine Inhalte aus den Datendateien ab (pruefungen/bestand.py, K1), nie aus JSX; der
Block kam hier deshalb nie an. Seit Job 20260927-qi-master-de-zellwerte-block-mitfuehren steht
der Wortlaut drueben im Export QIMASTER_ZELLWERTE von app/data/qi-master-texte.js, K1 traegt
ihn hierher, und Studien.jsx rendert ihn auf der Kaufseite unter den Kacheln.

SOLL kommt von DRUEBEN (`git show <QB_REF>:app/data/qi-master-texte.js`), nicht aus diesem
Repo -- sonst waere die Probe gruen, sobald Ableitung UND Buendel gleich falsch sind.

Arme:
  DIST     jeder Absatz von QIMASTER_ZELLWERTE steht woertlich in mindestens einer
           ausgelieferten Datei unter dist/ (*.map zaehlt nicht: Quelltext-Kommentare).
  SEITE    (nur mit --basis URL) /products/qi-master rendert den Block data-block="qm-zellwerte"
           INNERHALB der Studien-Sektion, NACH dem Kachelraster, mit allen Absaetzen; und die
           Quellenliste der Seite fuehrt [8] Applied Cell Biology und [9] Japanese Journal of
           Medicine (sonst zeigen die Marken ins Leere).

Exit 0 = ausgeliefert wie drueben | 3 = Befund (ROT:) | 4 = Messausfall (dist fehlt/leer, Quelle
drueben nicht lesbar, Export fehlt drueben, Seite nicht abrufbar). 'Nicht gebaut' faellt nie
auf gruen.
"""
import argparse
import html as htmlmod
import os
import re
import subprocess
import sys
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(os.path.dirname(HIER), "dist")
QB_REPO = os.environ.get(
    "QB_REPO", "/srv/openclaw/shared-state/homepage-bauer/werkbank/qiblanco-storefront")
QB_REF = os.environ.get("QB_REF", "origin/main")
QUELLE = "app/data/qi-master-texte.js"
QUELLEN_SOLL = {"[8]": "Applied Cell Biology", "[9]": "Japanese Journal of Medicine"}


class Messausfall(Exception):
    pass


def soll_absaetze():
    r = subprocess.run(["git", "-C", QB_REPO, "show", f"{QB_REF}:{QUELLE}"],
                       capture_output=True, timeout=60)
    if r.returncode != 0:
        raise Messausfall(f"git show {QB_REF}:{QUELLE}: rc={r.returncode}")
    s = r.stdout.decode("utf-8")
    m = re.search(r"^export const QIMASTER_ZELLWERTE = \{(.*?)^\};", s, re.S | re.M)
    if not m:
        raise Messausfall(f"{QB_REF}:{QUELLE} traegt keinen Export QIMASTER_ZELLWERTE")
    # Ende der Liste = "]" am Zeilenanfang; ein "]" im Text ("[8]") beendet sie nicht.
    a = re.search(r"absaetze:\s*\[(.*?)^\s*\]", m.group(1), re.S | re.M)
    if not a:
        raise Messausfall("QIMASTER_ZELLWERTE ohne absaetze")
    absaetze = [x.replace("\\'", "'") for x in re.findall(r"'((?:[^'\\]|\\.)*)'", a.group(1))]
    if not absaetze:
        raise Messausfall("QIMASTER_ZELLWERTE.absaetze ist leer")
    return absaetze


def buendel():
    out = []
    for wurzel, _d, dateien in os.walk(DIST):
        for d in dateien:
            if d.endswith(".map"):
                continue
            with open(os.path.join(wurzel, d), "rb") as f:
                out.append((os.path.join(wurzel, d), f.read().decode("utf-8", "replace")))
    return out


def sichtbar(t):
    t = re.sub(r"<(script|style|template|noscript)\b.*?</\1>", " ", t, flags=re.S | re.I)
    t = htmlmod.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t).strip()


def arm_seite(basis, soll):
    url = basis.rstrip("/") + "/products/qi-master"
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            dok = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        raise Messausfall(f"{url}: {e}")
    befund = []
    sek = re.search(r'<section[^>]*data-section="qm-studien".*?</section>', dok, re.S)
    if not sek:
        raise Messausfall("Studien-Sektion data-section=\"qm-studien\" nicht gefunden")
    s = sek.group(0)
    i_raster = s.find("qm-studien__raster")
    i_block = s.find('data-block="qm-zellwerte"')
    if i_block < 0:
        befund.append("ROT SEITE: Block qm-zellwerte fehlt in der Studien-Sektion")
    elif i_raster < 0 or i_block < i_raster:
        befund.append("ROT SEITE: Block qm-zellwerte steht nicht NACH dem Kachelraster")
    else:
        text = sichtbar(s[i_block:])
        fehlt = [a for a in soll if sichtbar(a) not in text]
        if fehlt:
            befund.append(f"ROT SEITE: {len(fehlt)} Absaetze fehlen im Block (erster {fehlt[0][:50]!r})")
    ganz = sichtbar(dok)
    for marke, journal in QUELLEN_SOLL.items():
        if not re.search(re.escape(marke) + r"[^\[]{0,400}" + re.escape(journal), ganz):
            befund.append(f"ROT SEITE: Quellenliste fuehrt {marke} nicht als {journal}")
    return befund


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--basis", help="lokale Vorschau-URL fuer den Arm SEITE")
    a = ap.parse_args()
    if not os.path.isdir(DIST):
        print(f"EXIT4 MESSAUSFALL: {DIST} fehlt -- erst `npm run build` fahren.")
        return 4
    try:
        soll = soll_absaetze()
        dateien = buendel()
        if not dateien:
            raise Messausfall(f"{DIST} ist leer")
        befund = []
        fehlend = [x for x in soll if not any(x in t for _p, t in dateien)]
        if fehlend:
            befund.append(f"ROT DIST: {len(fehlend)} von {len(soll)} Absaetzen fehlen im Buendel "
                          f"(erster: {fehlend[0][:60]!r})")
        if a.basis:
            befund += arm_seite(a.basis, soll)
    except (Messausfall, OSError, subprocess.SubprocessError) as e:
        print(f"EXIT4 MESSAUSFALL: {e}")
        return 4
    if befund:
        print(" | ".join(befund))
        return 3
    print(f"GRUEN: {len(soll)} von {len(soll)} Zellwert-Absaetzen aus {QB_REF}:{QUELLE} im Buendel"
          + (" und auf /products/qi-master unter den Kacheln, [8]/[9] in der Quellenliste."
             if a.basis else "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
