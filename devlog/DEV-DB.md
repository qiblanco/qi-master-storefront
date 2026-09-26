# DEV-DB -- qi-master-storefront (append-only)

<!-- ID NICHT RATEN UND NICHT MIT tail -1 BESTIMMEN.
     `grep -o '^## D-[0-9]*' | tail -1` liefert die LETZTE ZEILE, nicht die
     HOECHSTE NUMMER — gemessen 2026-09-05 in 55 von 539 live-devlog-Dateien
     nicht dasselbe. Zwei Jobs, die gleichzeitig anhaengen, bekommen damit
     dieselbe Nummer (Belegfall: worker-pool traegt D-2027 dreimal).
     Der eine richtige Weg vergibt und schreibt in EINEM gesperrten Schritt:

       devlog-standard/bin/devlog-check anhaengen <modul> --art D \
           --titel 'Kurztitel' <<'EOF'
       - **Was:** ...
       EOF

     Rumpf ueber stdin, nie als Shell-Argument (ein Backtick im Text wuerde
     sonst ausgefuehrt). Kontrolle danach: `devlog-check pruefe <modul>` == 0.
-->

<!-- Muster (kopieren, ausfuellen, NIE bestehende Eintraege aendern):
## D-NNN | JJJJ-MM-TT | Kurztitel
<!-- NNN, nicht 001: die Musterzeile darf keine ECHTE Nummer belegen. Sie wird
     heute schon uebersprungen (RE_TEMPLATE_REST erkennt 'JJJJ-MM-TT'), aber das
     haengt an der Datums-Form der Zeile — wer das Datum ausfuellt und den Rest
     stehen laesst, hat still eine Nummer vergeben. 'NNN' traegt einen Buchstaben
     an Ziffernstelle und faellt damit ZUSAETZLICH unter RE_PLATZHALTER. Zwei
     unabhaengige Groessen, nicht zwei Orte. (Job 20260907-devlog-check-id-
     kollision-blind-fuer-altes-kopfformat) -->
- **Was:** ...
- **Warum:** ...
- **Entscheidung/Alternativen:** ...
- **Reversibel:** ...
- **Ergebnis/Lehre:** ...
-->

<!-- devlog-fragmente | ab hier ERZEUGT aus devlog/eintraege/ — von Hand hier angehaengte Eintraege gehen NICHT verloren, sie werden beim naechsten Lauf in ein Fragment uebernommen -->

## D-001 | 2026-09-20 | qi-master.de: Frontseite = Landingpage, Kaufseite, Kaufweg auf qiblanco.com, Inhalte aus dem Bestand
Job 20260920-qi-master-de-bauen-aber-nicht-oeffentlich-schalten (Christian, 20.09.2026:
"Kann nun gebaut werden, aber noch nicht oeffentlich schalten").

GEBAUT in Enis' Hydrogen-Geruest (Commit 2e2d15a), nichts daneben:
- app/routes/_index.jsx: die Frontseite IST die Landingpage (Vorbild crystal-cacao.com).
  Einstieg mit dem Stueck (Shopify-Beschreibung als Kopfblock mit Symbolen), drei
  Feature-Spalten, Guetezeichen, die zwei FAQ von Platz eins und zwei (offen, als Text),
  die fuenf publizierten Zellstudien als Kacheln (Link auf qiblanco.com/pages/<slug>),
  Fertigung, Abschluss mit Vorverkaufstreppe, Nutzenliste und den zwei Wegen.
  Gemessen wird sie am NAECHSTEN KLICK: primaerer CTA -> /products/qi-master.
- app/routes/products.qi-master.jsx: die Kaufseite, Abschnitt fuer Abschnitt wie
  qiblanco.com/products/qi-master (Kaufbox, Liga, Guetezeichen, The One Eye, Literatur,
  6G, Persoenlichkeit, Begleiter-Banner, Studien, Fertigung, FAQ). Ausgelassen,
  entschieden: Google-Rezensionen (markenweite Zahlen) und Upsell (andere Produkte).
- app/lib/kaufweg.js: DER KAUFKNOPF IST EIN LINK AUF qiblanco.com/cart/<Variante>:1
  (Hydrogen-Route cart.$lines.jsx des DACH-Ladens -> 302 checkout.qiblanco.com, live
  gemessen). Die Variante kommt aus der Storefront-API. qi-master.de hat keinen
  Warenkorb, kein Formular, keine Kasse. Tracking-Parameter (fbclid, gclid, utm_* ...)
  reisen als Query ueber die Domaingrenze; die Allowlist ist Teilmenge der
  TRACKING_PARAM_NAMES in checkout-tracking.js drueben.
- app/lib/qi-master-produkt.js: eine Abfrage, ein Preis-Rechenweg (netto x 1,19,
  ganze Euro -> 10.639,- EUR wie drueben). app/lib/context.js: i18n DE/DE statt EN/US --
  das Geruest lieferte den US-Marktpreis (13.088,- EUR).
- app/data/qi-master/: ABGELEITETE Datenschicht aus origin/main der DACH-Storefront
  (K1 byte-gleich: Texte, Guetezeichen, Bilddaten, Preisstufen; K3 abgeleitet: FAQ-Array,
  Studien-Eckdaten) + BESTAND.json (Manifest mit Commit und sha256). Erzeuger
  pruefungen/bestand-nachziehen, Ableitung pruefungen/bestand.py (geteilt mit der Wache).
- Header/Footer/PageLayout: feste Navigation (Frontseite, Kaufseite, qiblanco.com),
  Rechtstexte als Links auf qiblanco.com; keine Warenkorb-/Such-Seitenleisten.
  Die Geruest-Routen bleiben (pruefungen/grundgeruest.sh zaehlt sie), nur unverlinkt.
- app/styles/qi-master.css: Token-Schicht nach web-soll v2 (7 Typo-Stufen Ratio 1,25,
  8-pt-Raster, Radien 8/16, warmes Neutral + ein Gold). design-rubrik: Frontseite 99/100,
  Kaufseite 98/100 (Belege pruefungen/design-reviews/*/design-review.json).

PROBEN:
- pruefungen/probe_kaufweg_qiblanco.py (Wirkung, Arme A-G, rendert den Bau)
- pruefungen/probe_bestand_naht.py (Drift-Wache, rt-Task qi-master-bestand-naht taeglich)
- Auftrags-Probe worker-pool/pruefungen/probe_qimaster_gebaut_nicht_oeffentlich__20260920.py
  von ROT (kein qiblanco.com) auf GRUEN.

NICHT ANGEFASST: /etc/caddy/sites-bereit/qi-master.caddy.bereit (zeigt auf 127.0.0.1:3212
= qi-master-node, den DACH-Klon vom 18.09. -- welcher Bau vor dem Scharfschalten dort
haengt, ist eine offene Entscheidung), sites-enabled, DNS, Shopify-Storefront (PRIVATE),
qi-master-node, qiblanco.com.

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

## D-003 | 2026-09-26 | Aufloeser: UPSTREAM-DRIFT wird ohne Mensch nachgezogen, nicht nur gemeldet
**Was.** Neues Werkzeug `pruefungen/bestand-aufloesen` plus rt-Task `qi-master-bestand-aufloeser`
(taeglich 06:05, VOR der Wache um 06:41). Es faehrt die Probe (mit fetch), und NUR wenn jeder
Befund `UPSTREAM-DRIFT:` ist: Nachzieher `--schreiben`, `npm run build`, Probe erneut
(`--kein-fetch`, gleicher Stand), dann lokaler Commit genau der abgeleiteten Dateien. Build rot
oder Probe danach nicht gruen: abgeleitete Dateien auf HEAD zurueck, dist/ neu bauen, `ROT:`,
exit 2, kein Commit. Jede andere Befundklasse (LOKAL-DRIFT, MANIFEST, FEHLT, DEUTUNG,
KAUFWEG-NAHT, PREIS-NAHT) und uncommittete Arbeit an abgeleiteten Dateien: `NICHT-AUFLOESBAR`,
exit 0, nichts angefasst -- die Wache meldet es selbst.

**Warum.** Vom 24. bis 26.09. stand die Wache taeglich rot (guetezeichen.js, preisstufen.json,
Upstream PR #588/#598), das review-Item hatte 28 Wiedervorlagen, und der vorgeschriebene Weg
im Feld `handlung` wurde von niemandem gegangen. Der Nachzug am 22.09. kam aus einem
Christian-Elternjob, nicht aus dem Traeger. Erkennen ohne Aufloesen.

**Entscheidung an der Probe, nie am Nachzieher-Exit** (F-002). Der Nachzieher-Exit zaehlt
nur als Messausfall (4). `NICHT-AUFLOESBAR` hat bewusst KEINEN eigenen Exit: ein
undeklarierter Code wird in rt `fehler` und schickt einen Reparaturlauf gegen gesunden Code.

**Rot vor Gruen** auf einer Wegwerf-Kopie (git clone, node_modules verlinkt), je Arm mit
Marker: A0 synchron (QB_REF=ae103de93) -> SYNCHRON; A1 Drift origin/main -> AUFGELOEST, Commit
in der Kopie, zweiter Lauf SYNCHRON; A2 QM_BUILD_CMD=false -> ROT BUILD-FEHLER, HEAD und Baum
unveraendert; A3 Build-Stub verfaelscht einmalig texte.js -> ROT PROBE NACH DEM NACHZUG
(LOKAL-DRIFT), zurueckgesetzt; A4 committete Handaenderung -> NICHT-AUFLOESBAR LOKAL-DRIFT;
A5 uncommittete BESTAND.json -> NICHT-AUFLOESBAR fremde Arbeit; A6 QB_REPO=/nonexistent ->
EXIT4 MESSAUSFALL.

**Echtlauf.** Am echten Baum: AUFGELOEST Commit 2c77ec8 (96fd8f7 -> 5793b299c, 3 Dateien),
danach `probe_bestand_naht.py --live` exit 0, `probe_goldaussage_ausgeliefert.py` exit 0.
Build dauert ~6,5 min Wandzeit (user 11 s) -- timeout_min im Task darum 30.

**Restbericht (neu, ohne Verdikt; `bestand.restbericht()`, gedruckt vom AUFLOESER, nicht von der
Probe -- probe_bestand_naht.py ist als Messgeraet des Kriteriums k68c01def42 beurkundet und bleibt
byte-gleich; ein erster Einbau in die Probe loeste A11 "Messgeraet still getauscht" aus).** Die Wache ist ein Einschluss-Selektor: sie
vergleicht nur, was bestand.py ableitet. Drueben tragen die Seiten seit dem 22.09. den Wortlaut
aus `app/data/qi-master-wortlaut.json` (Vorverkaufstreppe abgeloest), hier rendert
qi-master.de weiter `Treppe.jsx` -- und die Wache war gruen. Der Aufloeser druckt jetzt
`HINWEIS: UNGEDECKT` mit allen qi-master-Dateien drueben, die keine Quelle der Ableitung sind
(heute: qi-master-wortlaut.json, qi-master-addons.js, qi-master-addons.server.js). Rot-Nachweis:
bei QB_REF=6968ded^ (vor Einfuehrung von wortlaut.json) leer, heute drei. Ob diese Dateien
hierher gehoeren, ist eine Inhalts-/Bauentscheidung und kein Nachzug -- als Folgejob eingereiht.

**Reversibel.** `git revert` des jeweiligen Aufloeser-Commits; rt-Task per `aktiv: false`. Kein Push.
