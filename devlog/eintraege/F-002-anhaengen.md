## F-002 | 2026-09-22 | bestand-nachziehen gibt exit 2 auf einem synchronen Baum, sobald die Quelle weiterlaeuft
**Symptom.** Nach vollzogenem Nachzug und gruener Wache widersprechen sich die beiden
Werkzeuge am selben Baum: `probe_bestand_naht.py --live` sagt exit 0 ("10 Dateien
synchron"), `pruefungen/bestand-nachziehen` sagt im selben Moment exit 2
("1 Abweichung(en)"). Alle zehn Inhaltsdateien meldet es dabei selbst als "gleich".

**Ursache (root cause).** Die eine Abweichung ist `BESTAND.json`, und darin allein das
Feld `upstream_commit`. Der Nachzieher baut das Manifest komplett neu
(`B.manifest_bauen(soll, commit)`) und vergleicht es byte-weise -- das Feld traegt den
AKTUELLEN HEAD, also aendert es sich bei JEDEM Fremd-Commit drueben, auch wenn keine
einzige abgeleitete Datei betroffen ist. Die Probe dagegen prueft aus dem Manifest nur
die PRO-DATEI-HASHES (Zeilen 111-123, Manifest-Integritaet) und liest `upstream_commit`
nur als Detail-Ausgabe. Gemessen am 22.09.: Manifest auf `ae103de93`, origin/main
inzwischen `0624dc13`, Inhalt zehnmal identisch.

**Kein Fix, und das ist die Entscheidung.** Das Feld wurde NICHT auf `0624dc13`
nachgezogen. Zwei Gruende. (1) Es ist ein PROVENIENZ-Feld: es sagt, aus welchem Commit
tatsaechlich abgeleitet wurde. `ae103de93` ist wahr; `0624dc13` hineinzuschreiben, ohne
von dort abgeleitet zu haben, waere eine Behauptung ueber eine Lesung, die nie
stattgefunden hat. (2) An einem Tag mit mehreren Merges drueben ist das Feld Sekunden
spaeter wieder alt -- ein Nachziehen erzeugt Commit-Rauschen und heilt nichts.

**Lehre / Guard.** Die beiden Exit-Codes beantworten VERSCHIEDENE Fragen, und nur eine
davon ist "ist die Datenschicht synchron":
* `bestand-nachziehen` exit 2 = "wuerde `--schreiben` irgendetwas aendern" (inklusive
  Commit-Pin). Auf einem aktiven Upstream ist das faktisch der Dauerzustand.
* `probe_bestand_naht.py` exit 0/2 = "weicht INHALT ab". Das ist die Frage, um die es
  geht, und deshalb faehrt der rt-Task `qi-master-bestand-naht` genau diese Probe.

Wer den Exit des Nachziehers als Synchron-Urteil liest, bekommt ein falsches ROT und
zieht ein Provenienz-Feld hinterher, das ihm am naechsten Tag erneut rot gibt.

**Status.** Offen als bewusst gelassener Zustand, kein Defekt. Sollte der Nachzieher je
einen Sync-Exit brauchen, waere der Weg, das Manifest beim Vergleich ohne
`upstream_commit` zu betrachten -- nicht, das Feld haeufiger zu schreiben.
