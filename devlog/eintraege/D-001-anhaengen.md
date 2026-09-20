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
