## F-003 | 2026-10-21 | Brutto-Kipp: Preis doppelt versteuert, PREIS-NAHT blockierte den Aufloeser 11 Tage
**Symptom.** Ab dem Brutto-Kipp des Shops (2026-10-09T14:48Z, `shop.taxesIncluded=true`) stand
`probe_bestand_naht.py --live` dauerhaft rot mit `PREIS-NAHT: Storefront-API 12660 EUR brutto gegen
Treppe 10639 EUR`. Der Preis hatte sich nicht geaendert: die Storefront-API liefert seit dem Kipp
`10639.0` (schon brutto), Probe und Seite rechneten x 1,19 obendrauf. `qi-master-produkt.js`
`bruttoEuro()` haette auf qi-master.de 12.660,- € angezeigt (Laden PRIVATE, kein Kundenkontakt).
`probe_kaufweg_qiblanco.py` war gruen, weil sie denselben falschen Rechenweg hatte: falsche Seite und
falsches Soll stimmten ueberein.

**Folgeschaden.** Der Aufloeser handelt nur, wenn JEDER Befund UPSTREAM-DRIFT ist. Die falsche
PREIS-NAHT blockierte ihn: Upstream 00289314 (Studien-Abstract, 2026-10-10) blieb 251 h liegen,
offener Vollzug ov6339c28f8b.

**Ursache.** Der Preis-Rechenweg stand dreimal als `x 1.19` im Code (Seite, zwei Proben). Der Kipp
war drueben vorbereitet (qiblanco `app/lib/preismodus.js`, Metafeld `qb_preis.modus`), hier nicht
nachgezogen, weil `qi-master-produkt.js` keine abgeleitete Datei ist (K1/K3 decken nur Daten).

**Fix (dd2bde0, b17f7f1).** Die Seite liest `qb_preis.modus` in derselben Abfrage wie das Produkt
(Vorgabe brutto, unbekannter Wert -> Vorgabe). Fuer die Proben steht der Rechenweg einmal in
`bestand.py` (`preismodus_aus`, `brutto_euro`), beide Proben nutzen ihn. Danach zog der Aufloeser
selbst nach (b2ba459), `probe_bestand_naht.py --live` rc 0.

**Rot vor Gruen.** Live vor dem Fix rc 2 (PREIS-NAHT). Statische Kopie der gerenderten Seiten mit
12.660 (Stand vor dem Fix) -> `probe_kaufweg_qiblanco.py` rc 1, echte Seiten rc 0.

**Lehre.** Wer einen Preis aus der Storefront-API zeigt, fragt den Preismodus, statt 19 % zu tippen.
Eine Probe, die denselben Rechenweg wie ihr Pruefling hat, sieht dessen Fehler nicht.
