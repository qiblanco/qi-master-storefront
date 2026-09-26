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

**Restbericht in der Probe (neu, ohne Verdikt).** Die Wache ist ein Einschluss-Selektor: sie
vergleicht nur, was bestand.py ableitet. Drueben tragen die Seiten seit dem 22.09. den Wortlaut
aus `app/data/qi-master-wortlaut.json` (Vorverkaufstreppe abgeloest), hier rendert
qi-master.de weiter `Treppe.jsx` -- und die Wache war gruen. Die Probe druckt jetzt
`HINWEIS: UNGEDECKT` mit allen qi-master-Dateien drueben, die keine Quelle der Ableitung sind
(heute: qi-master-wortlaut.json, qi-master-addons.js, qi-master-addons.server.js). Rot-Nachweis:
bei QB_REF=6968ded^ (vor Einfuehrung von wortlaut.json) leer, heute drei. Ob diese Dateien
hierher gehoeren, ist eine Inhalts-/Bauentscheidung und kein Nachzug -- als Folgejob eingereiht.

**Reversibel.** `git revert` des jeweiligen Aufloeser-Commits; rt-Task per `aktiv: false`. Kein Push.
