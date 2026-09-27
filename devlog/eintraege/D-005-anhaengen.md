## D-005 | 2026-09-27 | Naht-Hypothese h0c0a7ffd misst am Aufloeser-Takt (probe_naht_takt.py)
**Job:** 20260927-qi-master-naht-hypothese-auf-aufloeser-takt-prio45 · 2026-09-27

**Anlass:** h0c0a7ffd (Job 20260926-...-wortlaut-ungedeckt-prio50) mass mit `probe_bestand_naht.py --live` live gegen origin/main. Nach jedem Upstream-Merge auf eine abgeleitete Quelle war sie bis ~24 h rot, bis der Aufloeser (06:05Z) nachzog. Belegfall a86ffa9 (26.09. 19:36Z), am 27.09. nach 10,6 h vom Aufloeser gezogen (852ff92, `probe_aufloeser_wirkung.py` rc=0).

**Entscheidung:** neue Probe `pruefungen/probe_naht_takt.py` (Commit 75802f6). Sie misst gegen `BESTAND.json:upstream_commit` statt gegen die Spitze. Arm inhalt: byte-gleich und Manifest. Arm takt: Ereignisse nach dem Bestand sind erst nach 26 h rot. Arm rest: restbericht leer, sofort rot. Exit 0/1/4. Die Probe von h0c0a7ffd wurde per `nachbau-audit hypothese-probe` getauscht (ka 4, Marker GRUEN:). `probe_bestand_naht.py` bleibt unveraendert (A11) und bleibt die rt-Wache.

**Rot-vor-Gruen (hermetische Kopie, BESTAND auf a86ffa9^):** Frist 26 h rc=0 ("in Frist"), die alte Probe auf derselben Kopie rc=2. Frist 1 h rc=1 UEBERFRISTIG. Lokale Drift rc=1. restbericht (Ausnahme entfernt) rc=1. QB_REPO kaputt rc=4.

**Bewusst schmaler als die alte Probe:** Die Arme Kaufweg, Preis und Deutung fehlen, weil der Hypothesentext sie nicht nennt. Sie bleiben in der rt-Wache.
