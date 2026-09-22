#!/usr/bin/env python3
"""Traegt das AUSGELIEFERTE Buendel von qi-master.de Christians heutige Gold-Aussage?

Gemessen wird NICHT die Quelldatei, sondern dist/ -- das Artefakt, das Oxygen
ausliefert. Eine abgeleitete Datei kann richtig sein, waehrend das gebaute
Buendel noch den alten Satz traegt; genau diese Naht misst diese Probe.

Der Gegenstand (Christians Fassung vom 22.09.2026, PR #578/#579): die Gold-Aussage
des Qi Master wechselt den GEGENSTAND -- weg von Kette und Verschluss, hin zur
Goldlegierung DES GITTERCHIPS. Der zurueckgezogene Satz darf nirgends mehr stehen.

Exit 0 = ausgeliefert wie drueben | 3 = Befund (ROT:) | 4 = Messausfall.
Ein fehlendes dist/ ist MESSAUSFALL, nie gruen: 'nicht gebaut' und 'gebaut und
richtig' duerfen nicht auf denselben Exit fallen.
"""
import os
import sys

DIST = "/srv/openclaw/shared-state/homepage-bauer/werkbank/qi-master-storefront/dist"
NEU = "kommt eine eigene spezielle 750er Goldlegierung zum Einsatz"
ZURUECKGEZOGEN = "Kette samt Verschluss aus 750er Gold"


def bundel_texte():
    treffer = []
    for wurzel, _dirs, dateien in os.walk(DIST):
        for d in dateien:
            p = os.path.join(wurzel, d)
            try:
                with open(p, "rb") as f:
                    roh = f.read()
            except OSError as e:
                raise RuntimeError(f"{p} nicht lesbar: {e}")
            treffer.append((p, roh.decode("utf-8", "replace")))
    return treffer


def main():
    if not os.path.isdir(DIST):
        print(f"EXIT4 MESSAUSFALL: {DIST} fehlt -- erst `npm run build` fahren.")
        return 4
    try:
        dateien = bundel_texte()
    except RuntimeError as e:
        print(f"EXIT4 MESSAUSFALL: {e}")
        return 4
    if not dateien:
        print(f"EXIT4 MESSAUSFALL: {DIST} ist leer -- kein Artefakt zu messen.")
        return 4

    mit_neu = [p for p, t in dateien if NEU in t]
    mit_alt = [p for p, t in dateien if ZURUECKGEZOGEN in t]

    befund = []
    if not mit_neu:
        befund.append(f"ROT: die heutige Gold-Aussage fehlt im Buendel ({NEU!r} in 0 von {len(dateien)} Dateien)")
    if mit_alt:
        befund.append(f"ROT: der zurueckgezogene Satz wird noch ausgeliefert ({ZURUECKGEZOGEN!r} in {len(mit_alt)}: {mit_alt[0]})")

    if befund:
        print(" | ".join(befund))
        return 3
    print(f"GRUEN: Gold-Aussage ausgeliefert ({len(mit_neu)} Datei(en) in dist/), "
          f"zurueckgezogener Satz 0 mal. Geprueft: {len(dateien)} Dateien.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
