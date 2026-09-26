#!/usr/bin/env python3
"""Liefert qi-master.de Christians Wortlaut vom 22.09.2026 aus -- und die abgeloeste Treppe nicht mehr?

Gemessen wird dist/ (das Artefakt, das ausgeliefert wird), nicht die Quelle: eine richtig
abgeleitete Datei beweist nichts, solange das gebaute Buendel noch die Treppe traegt.

SOLL kommt von DRUEBEN, nicht aus diesem Repo: die vier Absaetze werden per
`git show <QB_REF>:app/data/qi-master-wortlaut.json` aus dem Klon der DACH-Storefront
gelesen (derselbe Weg wie pruefungen/bestand.py). Liest die Probe die lokale Ableitung,
waere sie gruen, sobald die Ableitung falsch UND das Buendel gleich falsch ist.

Zwei Arme, beide muessen halten:
  WORTLAUT  jeder der Absaetze steht woertlich in mindestens einer ausgelieferten Datei
  TREPPE    keine Marke der abgeloesten Vorverkaufstreppe steht in einer ausgelieferten Datei
            (Ueberschrift, Klassen qm-treppe, Marke "laeuft jetzt", Stufenpreise, Prozentsatz)
*.map-Dateien zaehlen nicht: sie tragen Quelltext-Kommentare, die die Treppe als Geschichte
nennen, und werden keinem Kunden ausgeliefert.

Exit 0 = ausgeliefert wie drueben | 3 = Befund (ROT:) | 4 = Messausfall (dist fehlt/leer,
Quelle drueben nicht lesbar). 'Nicht gebaut' faellt nie auf gruen.
"""
import json
import os
import subprocess
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(os.path.dirname(HIER), "dist")
QB_REPO = os.environ.get(
    "QB_REPO", "/srv/openclaw/shared-state/homepage-bauer/werkbank/qiblanco-storefront")
QB_REF = os.environ.get("QB_REF", "origin/main")
QUELLE = "app/data/qi-master-wortlaut.json"

TREPPE_MARKEN = [
    "Hole dir jetzt ein einmaliges Angebot",
    "qm-treppe",
    "läuft jetzt",
    "Sichere dir jetzt",
    "7.989",
    "24,9",
]


def soll_absaetze():
    r = subprocess.run(["git", "-C", QB_REPO, "show", f"{QB_REF}:{QUELLE}"],
                       capture_output=True, timeout=60)
    if r.returncode != 0:
        raise RuntimeError(f"git show {QB_REF}:{QUELLE}: rc={r.returncode}")
    absaetze = (json.loads(r.stdout.decode("utf-8")).get("wortlaut") or {}).get("absaetze") or []
    if not absaetze:
        raise RuntimeError(f"{QUELLE} traegt keine Absaetze")
    return absaetze


def buendel():
    out = []
    for wurzel, _d, dateien in os.walk(DIST):
        for d in dateien:
            if d.endswith(".map"):
                continue
            p = os.path.join(wurzel, d)
            with open(p, "rb") as f:
                out.append((p, f.read().decode("utf-8", "replace")))
    return out


def main():
    if not os.path.isdir(DIST):
        print(f"EXIT4 MESSAUSFALL: {DIST} fehlt -- erst `npm run build` fahren.")
        return 4
    try:
        soll = soll_absaetze()
        dateien = buendel()
    except (RuntimeError, OSError, ValueError, subprocess.SubprocessError) as e:
        print(f"EXIT4 MESSAUSFALL: {e}")
        return 4
    if not dateien:
        print(f"EXIT4 MESSAUSFALL: {DIST} ist leer.")
        return 4

    befund = []
    fehlend = [a for a in soll if not any(a in t for _p, t in dateien)]
    if fehlend:
        befund.append(f"ROT WORTLAUT: {len(fehlend)} von {len(soll)} Absaetzen fehlen im Buendel "
                      f"(erster: {fehlend[0][:60]!r})")
    for m in TREPPE_MARKEN:
        treffer = [p for p, t in dateien if m in t]
        if treffer:
            befund.append(f"ROT TREPPE: {m!r} in {len(treffer)} Datei(en), z.B. "
                          f"{os.path.relpath(treffer[0], DIST)}")
    if befund:
        print(" | ".join(befund))
        return 3
    print(f"GRUEN: {len(soll)} von {len(soll)} Absaetzen aus {QB_REF}:{QUELLE} ausgeliefert, "
          f"0 Treppen-Marken ({len(TREPPE_MARKEN)} geprueft) in {len(dateien)} Dateien.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
