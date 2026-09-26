## D-004 | 2026-09-26 | qi-master.de folgt Christians Wortlaut vom 22.09.: Treppe raus, wortlaut.json als K1, Add-ons benannt ausgenommen
**Was.** `app/data/qi-master-wortlaut.json` drueben ist jetzt K1 in `pruefungen/bestand.py`
(lokal `app/data/qi-master/qi-master-wortlaut.json`, byte-gleich, im Manifest). Neue Komponente
`app/components/qi-master/Wortlaut.jsx` rendert die vier Absaetze daraus -- auf der Kaufseite
zwischen Preiszeile und Kaufknopf (dort wo drueben der priceLabel-Slot sitzt), auf der Frontseite
im Abschlussblock. `Treppe.jsx` geloescht (git rm), beide Loader rechnen keine Stufe mehr, die
`.qm-treppe*`-Regeln in `qi-master.css` durch `.qm-wortlaut*` ersetzt (nur --qm-*-Token, kein
Gold). `qi-master-preisstufen.json`/`.js` bleiben K1 -- die Preis-Naht der Wache liest sie; keine
Route importiert sie mehr.

**Add-ons bewusst nicht.** `qi-master-addons.js` und `.server.js` stehen in `BEWUSST_NICHT` mit
Grund: sie binden Add-on-Produkte in DER Warenkorb-Action von qiblanco.com; qi-master.de hat
keinen Warenkorb. `restbericht()` nimmt sie aus dem HINWEIS -> heute leer.
Deckungsgrenze, benannt: wer ueber den Kaufweg von qi-master.de kauft, sieht das Add-on-Angebot
(Wunschnummer, Goldkette) nicht -- der Permalink legt nur den Qi Master in den Korb.

**Falle (neu).** Der Standard-Import `import quelle from '...wortlaut.json'` buendelt die GANZE
Datei, auch das Meta-Feld `_keine_zahl_der_treppe`, das die Treppenpreise als Verbotsliste
aufzaehlt ('7.989', '24,9' landeten in dist/client). Benannter Import `{wortlaut}` -> Vite
schuettelt den Rest ab. Drueben (QiMasterWortlaut.jsx) steht der Standard-Import.

**Rot vor Gruen.** Neue Probe `pruefungen/probe_wortlaut_ausgeliefert.py` (dist/, Soll per
git show von drueben): alter Build rc=3 (2/4 Absaetze fehlen, 5 Treppen-Marken), erster neuer
Build rc=3 (Meta-Feld-Leck), nach benanntem Import rc=0. `probe_bestand_naht.py --live` rc=0
(11 Dateien), `probe_goldaussage_ausgeliefert.py` rc=0, `probe_kaufweg_qiblanco.py` rc=0,
design-rubrik Kaufseite 97, Frontseite 99.

**Reversibel.** `git revert` des Commits. Kein Push (R3, Vorlage 4ede53dc44 steht).
