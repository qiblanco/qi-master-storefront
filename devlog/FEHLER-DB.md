# FEHLER-DB -- qi-master-storefront (append-only)

<!-- ID NICHT RATEN UND NICHT MIT tail -1 BESTIMMEN.
     `grep -o '^## F-[0-9]*' | tail -1` liefert die LETZTE ZEILE, nicht die
     HOECHSTE NUMMER — gemessen 2026-09-05 in 55 von 539 live-devlog-Dateien
     nicht dasselbe. Zwei Jobs, die gleichzeitig anhaengen, bekommen damit
     dieselbe Nummer (Belegfall: worker-pool traegt D-2027 dreimal).
     Der eine richtige Weg vergibt und schreibt in EINEM gesperrten Schritt:

       devlog-standard/bin/devlog-check anhaengen <modul> --art F \
           --titel 'Kurztitel' <<'EOF'
       - **Was:** ...
       EOF

     Rumpf ueber stdin, nie als Shell-Argument (ein Backtick im Text wuerde
     sonst ausgefuehrt). Kontrolle danach: `devlog-check pruefe <modul>` == 0.
-->

<!-- Muster (kopieren, ausfuellen, NIE bestehende Eintraege aendern):
## F-NNN | JJJJ-MM-TT | Kurztitel
<!-- NNN, nicht 001: die Musterzeile darf keine ECHTE Nummer belegen. Sie wird
     heute schon uebersprungen (RE_TEMPLATE_REST erkennt 'JJJJ-MM-TT'), aber das
     haengt an der Datums-Form der Zeile — wer das Datum ausfuellt und den Rest
     stehen laesst, hat still eine Nummer vergeben. 'NNN' traegt einen Buchstaben
     an Ziffernstelle und faellt damit ZUSAETZLICH unter RE_PLATZHALTER. Zwei
     unabhaengige Groessen, nicht zwei Orte. (Job 20260907-devlog-check-id-
     kollision-blind-fuer-altes-kopfformat) -->
- **Symptom:** ...
- **Ursache:** ...
- **Fix:** ...
- **Lehre/Guard:** ...
- **Status:** offen|behoben|workaround
Auch hierher: "probiert & ging NICHT" (mit Beleg), damit es niemand wiederholt.
-->

<!-- devlog-fragmente | ab hier ERZEUGT aus devlog/eintraege/ — von Hand hier angehaengte Eintraege gehen NICHT verloren, sie werden beim naechsten Lauf in ein Fragment uebernommen -->

## F-001 | 2026-09-20 | Geruest-Kontext EN/US liefert den US-Marktpreis des gemeinsamen Shops
Das Hydrogen-Geruest setzt in app/lib/context.js i18n {language:'EN', country:'US'}. Auf
dem gemeinsamen Shop qi-blanco.myshopify.com liefert die Storefront-API im US-Kontext
fuer die Qi-Master-Variante 10.998,32 netto statt 8.940,34 -- angezeigt 13.088,- statt
10.639,- EUR (gemessen 2026-09-20 am gerenderten HTML). Ein Preis, der falsch ist, faellt
in keinem Build-Log auf. Behoben: i18n DE/DE. Die Wirkungs-Probe misst den Preis seither
gegen die API (Arm E), die Drift-Wache den Listenpreis der Treppe gegen die API (--live).

## F-002 | 2026-09-22 | bestand-nachziehen gibt exit 2 auf einem synchronen Baum, sobald die Quelle weiterlaeuft
**Symptom.** Nach vollzogenem Nachzug und gruener Wache widersprechen sich die beiden
Werkzeuge am selben Baum: `probe_bestand_naht.py --live` sagt exit 0 ("10 Dateien
synchron"), `pruefungen/bestand-nachziehen` sagt im selben Moment exit 2
("1 Abweichung(en)"). Alle zehn Inhaltsdateien meldet es dabei selbst als "gleich".

**Ursache (root cause).** Die eine Abweichung ist `BESTAND.json`, und darin allein das
Feld `upstream_commit`. Der Nachzieher baut das Manifest komplett neu
(`B.manifest_bauen(soll, commit)`) und vergleicht es byte-weise -- das Feld traegt den
AKTUELLEN HEAD, also aendert es sich bei JEDEM Fremd-Commit drueben, auch wenn keine
einzige abgeleitete Datei betroffen ist. Die Probe dagegen prueft aus dem Manifest nur
die PRO-DATEI-HASHES (Zeilen 111-123, Manifest-Integritaet) und liest `upstream_commit`
nur als Detail-Ausgabe. Gemessen am 22.09.: Manifest auf `ae103de93`, origin/main
inzwischen `0624dc13`, Inhalt zehnmal identisch.

**Kein Fix, und das ist die Entscheidung.** Das Feld wurde NICHT auf `0624dc13`
nachgezogen. Zwei Gruende. (1) Es ist ein PROVENIENZ-Feld: es sagt, aus welchem Commit
tatsaechlich abgeleitet wurde. `ae103de93` ist wahr; `0624dc13` hineinzuschreiben, ohne
von dort abgeleitet zu haben, waere eine Behauptung ueber eine Lesung, die nie
stattgefunden hat. (2) An einem Tag mit mehreren Merges drueben ist das Feld Sekunden
spaeter wieder alt -- ein Nachziehen erzeugt Commit-Rauschen und heilt nichts.

**Lehre / Guard.** Die beiden Exit-Codes beantworten VERSCHIEDENE Fragen, und nur eine
davon ist "ist die Datenschicht synchron":
* `bestand-nachziehen` exit 2 = "wuerde `--schreiben` irgendetwas aendern" (inklusive
  Commit-Pin). Auf einem aktiven Upstream ist das faktisch der Dauerzustand.
* `probe_bestand_naht.py` exit 0/2 = "weicht INHALT ab". Das ist die Frage, um die es
  geht, und deshalb faehrt der rt-Task `qi-master-bestand-naht` genau diese Probe.

Wer den Exit des Nachziehers als Synchron-Urteil liest, bekommt ein falsches ROT und
zieht ein Provenienz-Feld hinterher, das ihm am naechsten Tag erneut rot gibt.

**Status.** Offen als bewusst gelassener Zustand, kein Defekt. Sollte der Nachzieher je
einen Sync-Exit brauchen, waere der Weg, das Manifest beim Vergleich ohne
`upstream_commit` zu betrachten -- nicht, das Feld haeufiger zu schreiben.

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
