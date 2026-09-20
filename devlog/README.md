# devlog/ -- Dev-DB + Fehler-DB von qi-master-storefront (Selbstlern-Standard, GL-PRO-0013)

**Zweck:** lebendes Gedaechtnis dieses Moduls. VOR jeder Arbeit hier lesen
(was wurde schon probiert? was hat NICHT funktioniert?), NACH jeder Arbeit
ergaenzen. Verhindert Wiederholungsfehler (Chesterton's Fence, GL-PRO-0012).

## Dateien
- `DEV-DB.md`    -- was gebaut wurde, warum, Entscheidungen, was gut/schlecht lief (D-###)
- `FEHLER-DB.md` -- Fehler/Incidents + Ursache + Fix + Lehre; inkl. "schon probiert, ging nicht" (F-###)

## Eintrags-Regeln (Standard fuer JEDES Modul)
1. Append-only, IDs fortlaufend (D-001.., F-001..), Datum ISO, kein Loeschen (Korrektur = neuer Eintrag mit Verweis).
2. Dev-Eintrag: Was | Warum | Entscheidung/Alternativen | Reversibel-wie | Ergebnis/Lehre.
3. Fehler-Eintrag: Symptom | Ursache (root cause) | Fix | Lehre/Guard | Status.
4. "Probiert & verworfen" ist Pflicht-Wissen -- genau das spart dem Naechsten die Stunden.
5. Verlinken statt duplizieren (RESULTs, Plaene, Configs).

Standard-Quelle: /srv/openclaw/shared-state/devlog-standard/ (devlog-init, 2026-09-20)
