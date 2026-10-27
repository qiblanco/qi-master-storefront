# Qi Alpha Storefront — qi-alpha.com

Eigenständiger Hydrogen-Laden für **Qi Alpha®** (Rebranding von Qi Master, Elina
EL-20261027-beafe3d2, analog crystal-cacao.com). Angebunden an **denselben Shopify-Shop wie
`qiblanco.com`** (`qi-blanco.myshopify.com`), Oxygen-Storefront Nr. 1000180409.
Das GitHub-Repo heißt weiter `qiblanco/qi-master-storefront` (Begründung unten).

| Seite | Route | Inhalt |
|---|---|---|
| Startseite = Landingpage | `/` | dieselbe Seite wie `qiblanco.com/pages/The-Alpha` (Variante A) |
| Kaufseite | `/products/qi-alpha` | dieselbe Seite wie `qiblanco.com/products/the-alpha` |
| Warenkorb | `/cart` + Schublade | eigener Warenkorb, Kasse `checkout.qiblanco.com` |
| Partnercode | `/discount/<CODE>?redirect=/products/qi-alpha`, Codefeld im Warenkorb | Rabattcodes des Shops |

**Domain-Weichen** (eine Stelle: `app/lib/qi-alpha-domain.js`):

- `www.qi-alpha.com`, `qi-alpha.de`, `www.qi-alpha.de`, `qi-master.de`, `www.qi-master.de`
  → **301 auf `https://qi-alpha.com`**, Pfad und Query bleiben, alte Kaufpfade landen direkt
  auf `/products/qi-alpha` (`server.js`, vor jedem Shopify-Abruf). Wirkt erst, wenn die
  Domains in Shopify an diese Storefront gehängt sind und das DNS auf Shopify zeigt.
- Alles, was nicht Qi Alpha ist (andere Produkte, Kollektionen, Blog, Suche, Shopify-Seiten)
  → 301 auf dieselbe Adresse unter `qiblanco.com`.
- `/products/qi-master`, `/products/the-alpha` → 301 `/products/qi-alpha`;
  `/pages/The-Alpha`, `/pages/qi-alpha` → 301 `/`.
- Sitemap: genau `/` und `/products/qi-alpha` unter `https://qi-alpha.com`. `robots.txt` sperrt
  jeden anderen Host (Oxygen-/sslip-Vorschau).

**Inhalte kommen aus dem Bestand.** Die Qi-Alpha-Bausteine (Komponenten, Daten, Stile, Libs)
sind Kopien aus `qiblanco-storefront`, mit Quelle und Prüfsumme in `app/qi-alpha/HERKUNFT.json`.
Drei Dateien sind lokal angepasst (Domain, Kaufpfad, Seitenname). Nachziehen:

```bash
git -C ../qiblanco-storefront fetch origin
python3 pruefungen/alpha-nachziehen               # melden
python3 pruefungen/alpha-nachziehen --schreiben   # unveränderte Kopien ersetzen
npm run build
```

**Altbestand Qi Master.** `components/qi-master/`, `data/qi-master/`, `lib/kaufweg.js`,
`lib/qi-master-produkt.js`, `styles/qi-master.css` und die Proben unter `pruefungen/` sind
nicht mehr geroutet. Sie bleiben, bis der rt-Task `qi-master-bestand-aufloeser` (baut und
committet täglich auf `main`) nach dem GO stillgelegt ist.

## Vor dem Livegang offen

- **Consent und Tracking:** kein Cookie-Banner, kein Meta-Pixel, kein UpPromote auf diesem
  Host. Partner-RABATTCODES greifen (gemessen), die UpPromote-Zuordnung über Partnerlinks
  (`sca_ref`) nicht.
- **Domains in Shopify:** Hydrogen → Storefront `qi-master-storefront` → Domains:
  qi-alpha.com (primär), www.qi-alpha.com, qi-alpha.de, www.qi-alpha.de, qi-master.de,
  www.qi-master.de an die Produktionsumgebung hängen.
- **Storefront öffentlich schalten** (heute PRIVATE).

## Repo-Name

Umbenennen in `qi-alpha-storefront` ist technisch möglich: der Oxygen-Deploy läuft über den
Workflow `.github/workflows/oxygen-deployment-1000180409.yml` mit dem Repo-Secret
`OXYGEN_DEPLOYMENT_TOKEN_1000180409`; beides hängt am Repo, nicht am Namen, und GitHub leitet
alte Adressen weiter. Die Verknüpfung in der Shopify-App (Hydrogen → Storefront → Deployments)
ist nicht messbar von hier. Empfehlung: Namen lassen bis nach dem Livegang.

## Setup lokal

```bash
npm install
cp .env.example .env     # SESSION_SECRET, Storefront-Werte aus dem Shopify-Admin
npm run build
npx shopify hydrogen preview --port 3341
```

`i18n` steht in `app/lib/context.js` auf **DE/DE** (sonst US-Marktpreis des gemeinsamen Shops).

---

## Bis 27.10.2026: qi-master.de

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
