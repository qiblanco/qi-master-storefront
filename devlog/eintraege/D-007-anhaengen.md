## D-007 | 2026-09-28 | Zellwerte-Block entfaellt (Christian 2026-09-28 ersatzlos gestrichen)
Job 20260928-update-qimaster-seite-streichungen-christian. Drueben PR #697 (0d5a872): Export QIMASTER_ZELLWERTE gestrichen.
Hier: Studien.jsx ohne Schalter mitZellwerte und ohne Import (7fcf4c7), dann bestand-nachziehen --schreiben auf
0d5a872 (2183709), npm run build rc 0. probe_zellwerte_ausgeliefert.py in den Papierkorb (Traeger h4571c5e5
zurueckgenommen). Nachfolge-Naht worker-pool/pruefungen/probe_qimaster_de_zellwerte_weg__20260928.py: rot vor dem
Nachzug (Export abgeleitet, dist lieferte die Saetze), gruen danach (K1 byte-gleich, Q, D). probe_bestand_naht.py --live
rc 0. Reihenfolge war wichtig: erst Studien.jsx entkoppeln, dann nachziehen - umgekehrt haette der naechste
Aufloeser-Lauf (06:05Z) einen Import ins Leere erzeugt. Nicht gepusht (R3, wie D-006).
