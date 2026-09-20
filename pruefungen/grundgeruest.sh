#!/usr/bin/env bash
# Abnahme des Grundgeruests dieser Storefront — in EINEM Durchlauf pruefbar.
#
# Warum es diese Datei gibt: "Build laeuft gruen" ist eine Zusage, die ein
# halbes Jahr spaeter niemand mehr nachmessen kann, wenn sie nur in einem
# Bericht steht. Hier steht sie als Probe, die jederzeit wieder laufen kann.
#
# Geprueft werden die sechs Zusagen des Auftrags:
#   1 Struktur     Hydrogen-Geruest mit Kernrouten vollstaendig
#   2 Sprache      JavaScript, nicht TypeScript
#   3 Styling      kein Styling-Framework in den Abhaengigkeiten
#   4 Kaufweg      Checkout bleibt checkout.qiblanco.com
#   5 Shop         derselbe Shopify-Shop wie qiblanco.com
#   6 Bau          `npm run build` laeuft durch und erzeugt ein FRISCHES Artefakt
#
# Zu Punkt 6: die Probe raeumt dist/ NICHT ab (nichts hier loescht etwas).
# Stattdessen legt sie vor dem Bau eine Zeitmarke und verlangt danach ein
# Artefakt, das JUENGER ist als diese Marke. Ein alter, liegengebliebener Bau
# kann die Probe damit nicht gruen faerben.
#
# Aufruf:  bash pruefungen/grundgeruest.sh              (Punkt 6 inbegriffen)
#          OHNE_BAU=1 bash pruefungen/grundgeruest.sh   (Punkt 6 ueberspringen)
set -u
cd "$(dirname "$0")/.."

ok=0; fehl=0
ja()   { printf '  OK   %s\n' "$1"; ok=$((ok+1)); }
nein() { printf '  FEHL %s\n' "$1"; fehl=$((fehl+1)); }
pruef() { if eval "$2" >/dev/null 2>&1; then ja "$1"; else nein "$1"; fi; }

echo "1 Struktur"
for f in package.json server.js react-router.config.js vite.config.js \
         jsconfig.json app/root.jsx app/entry.server.jsx app/entry.client.jsx \
         app/routes.js app/lib/context.js app/lib/session.js .env.example \
         .gitignore README.md; do
  pruef "$f vorhanden" "[ -f '$f' ]"
done
for r in '_index' 'products.$handle' 'collections.$handle' 'cart' 'search' \
         'pages.$handle' 'blogs._index' 'policies._index' 'account' \
         '[robots.txt]' '[sitemap.xml]'; do
  pruef "Route $r vorhanden" "[ -f \"app/routes/\$r.jsx\" ]"
done

echo "2 Sprache: JavaScript"
pruef "jsconfig.json statt tsconfig.json" "[ -f jsconfig.json ] && [ ! -f tsconfig.json ]"
# .d.ts sind erzeugte Typ-Beschreibungen des Codegens, kein Quelltext.
pruef "kein .ts/.tsx-Quelltext unter app/" \
  "[ -z \"\$(find app \\( -name '*.tsx' -o \\( -name '*.ts' ! -name '*.d.ts' \\) \\) -print -quit)\" ]"
pruef "app/ enthaelt .jsx-Quelltext" "[ -n \"\$(find app -name '*.jsx' -print -quit)\" ]"

echo "3 kein Styling-Framework"
for pkg in tailwindcss @tailwindcss/vite @vanilla-extract/css styled-components \
           @emotion/react sass postcss-modules bootstrap; do
  pruef "$pkg NICHT in package.json" "! grep -q '\"$pkg\"' package.json"
done

echo "4 Kaufweg bleibt checkout.qiblanco.com"
pruef ".env.example nennt checkout.qiblanco.com" \
  "grep -q 'PUBLIC_CHECKOUT_DOMAIN=\"checkout.qiblanco.com\"' .env.example"
pruef "entry.server.jsx setzt checkoutDomain" \
  "grep -q 'checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN' app/entry.server.jsx"
pruef "root.jsx reicht checkoutDomain an den Analytics-Kontext" \
  "grep -q 'checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN' app/root.jsx"

echo "5 derselbe Shop wie qiblanco.com"
pruef ".env.example nennt qi-blanco.myshopify.com" \
  "grep -q 'PUBLIC_STORE_DOMAIN=\"qi-blanco.myshopify.com\"' .env.example"
pruef ".env ist von der Versionierung ausgenommen" "grep -qx '\.env' .gitignore"
if [ -d .git ]; then
  pruef ".env ist nicht eingecheckt" "! git ls-files --error-unmatch .env"
fi

echo "6 Bau"
if [ "${OHNE_BAU:-0}" = "1" ]; then
  echo "  UEBERSPRUNGEN (OHNE_BAU=1)"
elif [ ! -d node_modules ]; then
  nein "node_modules fehlt — vorher 'npm install' laufen lassen"
else
  marke="$(mktemp)"
  if npm run build >/tmp/qi-master-build.log 2>&1; then
    ja "npm run build laeuft durch"
    pruef "Server-Artefakt dist/server/index.js frisch erzeugt" \
      "[ dist/server/index.js -nt \"\$marke\" ]"
    pruef "Client-Artefakt dist/client/ vorhanden" "[ -d dist/client ]"
  else
    nein "npm run build bricht ab (Protokoll: /tmp/qi-master-build.log)"
    tail -20 /tmp/qi-master-build.log | sed 's/^/       /'
  fi
fi

echo
echo "ERGEBNIS: $ok gruen, $fehl rot"
[ "$fehl" -eq 0 ] || exit 1
