## F-001 | 2026-09-20 | Geruest-Kontext EN/US liefert den US-Marktpreis des gemeinsamen Shops
Das Hydrogen-Geruest setzt in app/lib/context.js i18n {language:'EN', country:'US'}. Auf
dem gemeinsamen Shop qi-blanco.myshopify.com liefert die Storefront-API im US-Kontext
fuer die Qi-Master-Variante 10.998,32 netto statt 8.940,34 -- angezeigt 13.088,- statt
10.639,- EUR (gemessen 2026-09-20 am gerenderten HTML). Ein Preis, der falsch ist, faellt
in keinem Build-Log auf. Behoben: i18n DE/DE. Die Wirkungs-Probe misst den Preis seither
gegen die API (Arm E), die Drift-Wache den Listenpreis der Treppe gegen die API (--live).
