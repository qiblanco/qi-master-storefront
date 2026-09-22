## D-002 | 2026-09-22 | Erste Upstream-Drift nachgezogen: Gold-Aussage und Alpha Edition
**Was.** Die abgeleitete Datenschicht von qi-master.de war zwei Aenderungen hinter
der DACH-Quelle. `pruefungen/bestand-nachziehen --schreiben` hat drei Dateien
nachgezogen: `app/data/qi-master/qi-master-faq.js` (Christians Gold-Aussage vom
22.09. wechselt den GEGENSTAND -- weg von "eine Kette samt Verschluss aus 750er
Gold", hin zur Goldlegierung DES GITTERCHIPS), `app/lib/qi-master-kopfsymbole.js`
("Alpha Charge" -> "Alpha Edition", Erkennung nennt seither beide Fassungen) und
das Manifest `BESTAND.json`. Erster Lauf des Nachzieh-Pfads ueberhaupt.

**Warum so.** Nicht von Hand in die abgeleiteten Dateien geschrieben -- die Quelle
liegt drueben. Der Nachzieher ist derselbe Code, den die Probe zum Vergleichen
benutzt; Handarbeit haette LOKAL-DRIFT erzeugt statt sie zu heilen.

**Falle, die Geld kostet (neu).** `bestand.py` liest `QB_REF=origin/main` aus dem
LOKALEN Klon `werkbank/qiblanco-storefront`. Ohne vorheriges `git fetch` DORT zieht
man gegen einen alten Stand nach und haelt das Ergebnis danach fuer synchron. Der
Docstring sagt es, das Werkzeug erzwingt es nicht. Konkret gemessen: der Auftrag
nannte `a65fbae88`, nach dem fetch stand origin/main auf `ae103de93` (PR #580-#582).
Wer ohne fetch arbeitet, zieht auf einen Stand nach, den es drueben nicht mehr gibt.

**Neue Probe.** `pruefungen/probe_goldaussage_ausgeliefert.py` misst `dist/`, nicht
die Quelldatei. Grund: eine richtig nachgezogene Quelle liefert bei altem Build
weiter den alten Satz aus -- Quelle gruen, Kunde sieht Altes. Vor dem Bau war sie in
BEIDEN Armen rot (heutige Aussage in 0 von 54 Dateien, zurueckgezogener Satz in 3),
danach gruen. Fehlendes/leeres `dist/` ist MESSAUSFALL (exit 4), nie gruen.

**Reversibel wie.** Reiner git-Commit, kein Deploy. `git revert` genuegt.

**Ergebnis.** `probe_bestand_naht.py --live` exit 0 (10 Dateien synchron mit
ae103de93, Kaufweg-Allowlist 17/23 gedeckt, Preis 10639 EUR = Treppe).

**Offen (nicht von diesem Job entschieden).** Der Push bleibt gesperrt: R3-Perimeter,
`Permission to qiblanco/qi-master-storefront.git denied to christian-bauer-cyber`,
am 22.09. erneut nachgemessen. Vorlage liegt seit dem 20.09. bei Christian
(`geld-guard:20260920-qi-master-de-bauen-aber:4ede53dc44`).
