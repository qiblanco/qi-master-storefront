# Qi Master Storefront — qi-master.de

Eigenständige Shopify-Hydrogen-Storefront für die Domain `qi-master.de`, angebunden
an **denselben Shopify-Shop wie `qiblanco.com`** (`qi-blanco.myshopify.com`).
Schwester-Repos mit demselben Muster: `qiblanco-storefront` (DACH-Hauptshop),
`crystal-cacao-storefront`.

**Eine Zwei-Seiten-Homepage** (Christian, 19.09.2026):

| Seite | Route | Was sie tut |
|---|---|---|
| Frontseite = Landingpage | `/` | verkauft den Qi Master®; ihr Weg führt auf die Kaufseite |
| Kaufseite | `/products/qi-master` | wie `qiblanco.com/products/qi-master`; der Kaufknopf führt auf qiblanco.com |

**Der Kaufweg läuft über qiblanco.com.** Der Kaufknopf ist ein Link auf
`https://qiblanco.com/cart/<Variante>:1` (Warenkorb-Permalink des DACH-Ladens, der in
die Kasse `checkout.qiblanco.com` weiterleitet). Diese Storefront hat keinen eigenen
Warenkorb, kein Formular nach `/cart` und keine Kasse — `app/lib/kaufweg.js` ist die
eine Stelle, an der das steht. Tracking-Parameter (fbclid, gclid, utm_* …) reisen als
Query über die Domaingrenze mit.

**Die Inhalte kommen aus dem Bestand**, nicht neu erfunden:

- Titel, Beschreibung, Bilder, Variante und Preis aus der Storefront-API des gemeinsamen
  Shops (`app/lib/qi-master-produkt.js`) — sie wandern von selbst mit.
- Texte der Abschnitte, FAQ, Gütezeichen, Bilddaten, Vorverkaufstreppe und
  Studien-Eckdaten unter `app/data/qi-master/` — **abgeleitet aus `origin/main` von
  `qiblanco-storefront`**, mit Manifest `BESTAND.json`. Nachziehen:
  `pruefungen/bestand-nachziehen --schreiben`. Drift-Wache:
  `pruefungen/probe_bestand_naht.py` (rt-Task `qi-master-bestand-naht`, täglich).
  **Nicht von Hand in diese Dateien schreiben** — die Quelle ist drüben.

## Status (20.09.2026)

- [x] Hydrogen-Gerüst (JavaScript, kein Styling-Framework), Shopify-Storefront
      `qi-master-storefront` (Nr. 1000180409, **PRIVATE**) mit diesem Repo verbunden,
      Oxygen-Deploy-Workflow per PR #1 (Enis).
- [x] Beide Seiten inhaltlich gebaut, Kaufweg auf qiblanco.com verdrahtet
      (Job `20260920-qi-master-de-bauen-aber-nicht-oeffentlich-schalten`).
- [x] Design-Rubrik: Frontseite 99/100, Kaufseite 98/100
      (`pruefungen/design-reviews/*/design-review.json`).
- [ ] **Nicht öffentlich — und das ist der bestellte Zustand.** Die Caddy-Fassung liegt
      unter `/etc/caddy/sites-bereit/qi-master.caddy.bereit`, `sites-enabled/` trägt keine
      qi-master-Datei, die Storefront bleibt PRIVATE, `qi-master.de` leitet bis auf Weiteres
      auf `qiblanco.com`. Reihenfolge beim Scharfschalten, nicht verhandelbar:
      **DNS, dann Zertifikat, dann scharf.**

## Setup lokal

```bash
npm install
cp .env.example .env     # SESSION_SECRET eintragen, Storefront-Werte aus dem Shopify-Admin
npm run build
npx shopify hydrogen preview --port 3341
```

## Nachweis

```bash
bash pruefungen/grundgeruest.sh                  # Gerüst: Struktur, Sprache, Styling, Kaufweg, Bau
python3 pruefungen/probe_kaufweg_qiblanco.py     # Wirkung: beide Seiten gerendert, Kaufknopf -> qiblanco.com
python3 pruefungen/probe_bestand_naht.py --live  # Naht: Inhalte synchron mit qiblanco-storefront origin/main
```

`i18n` steht in `app/lib/context.js` auf **DE/DE**: das Gerüst stand auf EN/US und lieferte
den US-Marktpreis des gemeinsamen Shops (13.088,- statt 10.639,- €).
