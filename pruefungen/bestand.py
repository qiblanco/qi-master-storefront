#!/usr/bin/env python3
"""Der Bestand, aus dem qi-master.de seine Inhalte bezieht -- EINE Ableitung fuer Nachzug und Wache.

WARUM ES DIESE DATEI GIBT. Christian, 20.09.2026: die Inhalte kommen aus dem Bestand
(qiblanco.com/products/qi-master), nicht neu erfunden. Und am 18.09.: die Kaufseite muss
MITWANDERN -- was er auf qiblanco.com aendert, muss hier ankommen. Eine Kopie erfuellt das
nicht: Kopien laufen auseinander, sobald jemand nur eine Seite anfasst. Diese Datei macht
die Kopie zu einer ABLEITUNG mit benannter Quelle und pruefbarem Hash, damit die Drift-Wache
(probe_bestand_naht.py) sie erkennt und der Nachzieher (bestand-nachziehen) sie in EINEM
Kommando heilt. Nachzieher und Wache teilen sich diesen Code -- rechneten sie verschieden,
urteilte die Wache ueber eine Menge, die der Nachzieher nie gemeint hat (die haeufigste
belegte Fehlerklasse dieses Servers: je Seite stimmig, Naht nie geschlossen).

DIE QUELLE IST origin/main DER DACH-STOREFRONT, NICHT IHR ARBEITSBAUM. Der Arbeitsbaum unter
werkbank/qiblanco-storefront ist eine geteilte Flaeche und stand am 18.09. vier Tage hinter
origin/main -- genau in dieser Spanne lag die Route products.qi-master.jsx, und der Bau des
Vortages hatte 46 % des Textes verloren (RESULT 20260918-qi-master-de-aufbauen-...). Gelesen
wird deshalb `git show <ref>:<pfad>`, nie die Datei auf der Platte.

DREI KLASSEN, nach dem Muster von crystal-cacao (shared/UPSTREAM.json, ADR 0056):
  K1  byte-gleich uebernommen        (Texte, Guetezeichen, Bilddaten, Preisstufen, Rechenweg, Wortlaut)
  K3  abgeleitet, nicht byte-gleich  (FAQ: nur das Qi-Master-Array aus product-faqs.js;
                                      Studien: nur die Eckdaten aus fuenf JSON-Dateien)
      -- die Ableitung ist DETERMINISTISCH und steht hier; die Wache leitet neu ab und
      vergleicht das Ergebnis, nicht die Quelle.

WAS NICHT UEBERNOMMEN WIRD, und zwar entschieden, nicht vergessen:
  - Google-Rezensionen und Upsell-LineUp: markenweite Zahlen und andere Produkte; qi-master.de
    ist eine Zwei-Seiten-Homepage fuer EIN Stueck.
  - Der Deutungsabsatz vom 18.09. ("Unsere Deutung / Zwischen der Ueberlieferung ...") ist im
    Bestand ersatzlos gestrichen und kommt hier nicht zurueck -- er ist in der Quelle nicht
    mehr enthalten, eine Ableitung kann ihn also gar nicht liefern. Die Wache misst das mit
    (Arm `deutung`).
"""
import hashlib
import json
import os
import re
import subprocess

HIER = os.path.dirname(os.path.abspath(__file__))
STOREFRONT = os.path.dirname(HIER)
DATA_DIR = os.path.join(STOREFRONT, "app", "data", "qi-master")
LIB_DIR = os.path.join(STOREFRONT, "app", "lib")
MANIFEST = os.path.join(DATA_DIR, "BESTAND.json")

QB_REPO = os.environ.get(
    "QB_REPO", "/srv/openclaw/shared-state/homepage-bauer/werkbank/qiblanco-storefront")
QB_REF = os.environ.get("QB_REF", "origin/main")

# K1: upstream-Pfad -> lokaler Pfad (relativ zur Storefront-Wurzel)
K1 = {
    "app/data/qi-master-texte.js": "app/data/qi-master/qi-master-texte.js",
    "app/data/qi-master-guetezeichen.js": "app/data/qi-master/qi-master-guetezeichen.js",
    "app/data/qi-master-diamantbilder.js": "app/data/qi-master/qi-master-diamantbilder.js",
    "app/data/qi-master-literaturbilder.js": "app/data/qi-master/qi-master-literaturbilder.js",
    "app/data/qi-master-preisstufen.json": "app/data/qi-master/qi-master-preisstufen.json",
    "app/lib/qi-master-preisstufen.js": "app/lib/qi-master-preisstufen.js",
    "app/lib/qi-master-kopfsymbole.js": "app/lib/qi-master-kopfsymbole.js",
    "app/lib/qi-master-symbole.generated.js": "app/lib/qi-master-symbole.generated.js",
    # Christians Wortlaut vom 22.09.2026 an der Stelle der abgeloesten Vorverkaufstreppe.
    # Drueben lesen ihn Produktseite, Landingpage und Anna; hier Frontseite und Kaufseite
    # (app/components/qi-master/Wortlaut.jsx). Aufgenommen 2026-09-26, Job
    # 20260926-qi-master-de-treppe-abgeloest-wortlaut-ungedeckt-prio50.
    "app/data/qi-master-wortlaut.json": "app/data/qi-master/qi-master-wortlaut.json",
}

# Upstream-Dateien mit "qi-master" im Namen, die BEWUSST nicht abgeleitet werden. Jede mit
# Grund; restbericht() nimmt sie aus dem HINWEIS, damit er nur NEUES zeigt. Wer eine Datei
# hier eintraegt, entscheidet damit gegen den Nachzug -- nie, um einen Hinweis leise zu machen.
BEWUSST_NICHT = {
    "app/lib/qi-master-addons.js":
        "Add-ons (Wunschnummer, Goldkette) sind eigene Shopify-Produkte, die auf der Kaufseite von "
        "qiblanco.com gewaehlt und von DEREN Warenkorb-Action gebunden werden. qi-master.de "
        "wickelt keinen Warenkorb ab (app/lib/kaufweg.js: Permalink auf qiblanco.com/cart/<v>:1).",
    "app/lib/qi-master-addons.server.js":
        "Serverseitige Warenkorb-Bindung der Add-ons (cart.jsx / cart.$lines.jsx drueben). "
        "qi-master.de hat keine Warenkorb-Route -- es gibt hier nichts, woran sie haengen koennte.",
}

FAQ_QUELLE = "app/data/product-faqs.js"
FAQ_ZIEL = "app/data/qi-master/qi-master-faq.js"
STUDIEN_QUELLEN = ["app/data/studien/e%04d.json" % i for i in range(1, 6)]
STUDIEN_ZIEL = "app/data/qi-master/qi-master-studien.js"

# Der gestrichene Deutungsabsatz vom 18.09. -- darf in KEINER abgeleiteten Datei stehen.
DEUTUNG_GESTRICHEN = re.compile(r"Zwischen der Überlieferung und dem Fundament")


class Messausfall(Exception):
    """Quelle nicht lesbar -- keine Aussage, nie ein Befund."""


def git_show(rel, repo=QB_REPO, ref=QB_REF):
    r = subprocess.run(["git", "-C", repo, "show", f"{ref}:{rel}"],
                       capture_output=True, timeout=60)
    if r.returncode != 0:
        raise Messausfall(f"git show {ref}:{rel} in {repo}: rc={r.returncode} "
                          f"{r.stderr.decode(errors='replace').strip()[:200]}")
    return r.stdout


def git_rev(repo=QB_REPO, ref=QB_REF):
    r = subprocess.run(["git", "-C", repo, "rev-parse", ref], capture_output=True,
                       text=True, timeout=60)
    if r.returncode != 0:
        raise Messausfall(f"git rev-parse {ref} in {repo}: {r.stderr.strip()[:200]}")
    return r.stdout.strip()


def sha256(b):
    return hashlib.sha256(b).hexdigest()


# Preis-Rechenweg der Seite (app/lib/qi-master-produkt.js bruttoEuro), EINMAL fuer die Proben.
# Seit dem Brutto-Kipp 2026-10-09T14:48Z ist der API-Betrag der Endbetrag; das Shop-Metafeld
# qb_preis.modus sagt, welcher Fall gilt. Fehlt es, gilt dieselbe Vorgabe wie auf der Seite.
PREISMODI = ("netto", "brutto")
PREISMODUS_VORGABE = "brutto"
MWST_SATZ_DE = 0.19


def preismodus_aus(wert):
    m = str(wert or "").strip().lower()
    return m if m in PREISMODI else PREISMODUS_VORGABE


def brutto_euro(amount, modus):
    n = float(amount)
    return round(n) if preismodus_aus(modus) == "brutto" else round(n * (1 + MWST_SATZ_DE))


def faq_ableiten(quelle_bytes):
    """Schneidet GENAU das Array FAQ_QI_MASTER aus product-faqs.js -- byte-gleich im Inneren.

    Bewusst ein Textschnitt und kein Parser: die Zeilen sollen exakt so ankommen, wie
    Christian sie im Bestand gesetzt hat (Reihenfolge, Anfuehrungszeichen, Absatzumbrueche).
    Der Kopfkommentar der Quelle bleibt zurueck; er gehoert der Quelle."""
    s = quelle_bytes.decode("utf-8")
    m = re.search(r"^export const FAQ_QI_MASTER = \[\n", s, re.M)
    if not m:
        raise Messausfall("FAQ_QI_MASTER in product-faqs.js nicht gefunden")
    start = m.end()
    ende = s.find("\n];\n", start)
    if ende < 0:
        raise Messausfall("Ende des FAQ_QI_MASTER-Arrays nicht gefunden")
    rumpf = s[start:ende + 1]
    kopf = (
        "/**\n"
        " * ABGELEITET -- nicht von Hand aendern. Quelle: qiblanco-storefront "
        + FAQ_QUELLE + ", Export FAQ_QI_MASTER,\n"
        " * Zeilen byte-gleich uebernommen. Nachziehen: pruefungen/bestand-nachziehen.\n"
        " * Die ersten zwei Fragen stehen an Platz eins und zwei, weil Christian sie am\n"
        " * 19.09.2026 dorthin gesetzt hat (Job 20260919-qimaster-zwei-neue-faq-an-platz-eins-und-zwei).\n"
        " */\n"
    )
    return (kopf + "export const FAQ_QI_MASTER = [\n" + rumpf + "];\n").encode("utf-8")


ECKDATEN_FELDER = ["titelOriginal", "titelDeutsch", "autor", "institut", "journal", "band",
                   "doi", "veroeffentlicht", "produkt", "artikelUrl", "pdfUrl", "coverUrl",
                   "studientyp", "material", "coverMasse"]


def studien_ableiten(quellen_bytes):
    """Fuenf Studien-JSONs -> ein Modul mit den Eckdaten, die eine Beleg-Kachel braucht.

    Der Volltext (Abschnitte, Tabellen, Grafiken) bleibt auf qiblanco.com -- die Kachel
    verlinkt dorthin (/pages/<slug>). Der Beweis-Ort bleibt erreichbar, ohne die Studie
    ein zweites Mal zu fuehren."""
    liste = []
    for b in quellen_bytes:
        d = json.loads(b.decode("utf-8"))
        e = d.get("eckdaten") or {}
        liste.append({
            "id": d.get("id"),
            "slug": d.get("slug"),
            "h1": (d.get("seo") or {}).get("h1"),
            "eckdaten": {k: e.get(k) for k in ECKDATEN_FELDER},
            "zitation": (d.get("zitation") or {}).get("text"),
            "kachel": d.get("kachel") or {},
        })
    kopf = (
        "/**\n"
        " * ABGELEITET -- nicht von Hand aendern. Quelle: qiblanco-storefront app/data/studien/e0001..e0005.json,\n"
        " * nur die Eckdaten (Titel, Autor, Journal, Datum, Deckblatt, Zitation). Der Volltext bleibt auf\n"
        " * qiblanco.com/pages/<slug>; die Kachel verlinkt dorthin. Nachziehen: pruefungen/bestand-nachziehen.\n"
        " */\n"
    )
    return (kopf + "export const QIMASTER_STUDIEN = "
            + json.dumps(liste, ensure_ascii=False, indent=2) + ";\n").encode("utf-8")


def soll_ableiten(repo=QB_REPO, ref=QB_REF):
    """Alles, was der Bestand liefert -> {lokaler Pfad: bytes}. Wirft Messausfall."""
    soll = {}
    for up, lok in K1.items():
        soll[lok] = git_show(up, repo, ref)
    soll[FAQ_ZIEL] = faq_ableiten(git_show(FAQ_QUELLE, repo, ref))
    soll[STUDIEN_ZIEL] = studien_ableiten([git_show(q, repo, ref) for q in STUDIEN_QUELLEN])
    return soll


def manifest_bauen(soll, commit):
    return {
        "schema": 1,
        "upstream_repo": "qiblanco/qiblanco-storefront",
        "upstream_ref": QB_REF,
        "upstream_commit": commit,
        "erzeuger": "pruefungen/bestand-nachziehen (Ableitung in pruefungen/bestand.py)",
        "dateien": [
            {"lokal": lok,
             "klasse": "K1" if lok in K1.values() else "K3",
             "quelle": ([up for up, l in K1.items() if l == lok] or
                        [FAQ_QUELLE if lok == FAQ_ZIEL else "app/data/studien/e0001..e0005.json"])[0],
             "sha256": sha256(b)}
            for lok, b in sorted(soll.items())
        ],
    }


def ist_lokal(rel):
    p = os.path.join(STOREFRONT, rel)
    if not os.path.exists(p):
        return None
    with open(p, "rb") as f:
        return f.read()


def restbericht():
    """Upstream-Dateien mit "qi-master" im Namen unter app/data und app/lib, die KEINE Quelle
    der Ableitung sind. Ohne Verdikt (Markierung, kein Exit). Gedruckt vom Aufloeser
    (bestand-aufloesen), NICHT von probe_bestand_naht.py: deren Fassung ist als Messgeraet des
    nachbau-audit-Kriteriums k68c01def42 beurkundet. Die Wache ist ein Einschluss-Selektor -- sie vergleicht nur, was bestand.py ableitet, und waere sonst blind
    dafuer, dass drueben eine NEUE Quelle die alte abloest (Belegfall 2026-09-26: seit dem 22.09.
    tragen die Seiten drueben den Wortlaut aus qi-master-wortlaut.json statt der Treppe; hier
    stand alles gruen). Ob so eine Datei hierher gehoert, ist eine Entscheidung, kein Nachzug."""
    r = subprocess.run(["git", "-C", QB_REPO, "ls-tree", "-r", "--name-only", QB_REF,
                        "app/data", "app/lib"], capture_output=True, text=True)
    if r.returncode != 0:
        raise Messausfall(f"git ls-tree: {r.stderr.strip()[:200]}")
    quellen = set(K1) | {FAQ_QUELLE, *STUDIEN_QUELLEN} | set(BEWUSST_NICHT)
    return sorted(p for p in r.stdout.split()
                  if "qi-master" in os.path.basename(p) and p not in quellen)
