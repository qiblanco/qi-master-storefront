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
