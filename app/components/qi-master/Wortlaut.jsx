// NUR das Feld `wortlaut` (benannter JSON-Import, tree-shakebar). Der Standard-Import zog die
// ganze Datei ins Buendel -- samt `_keine_zahl_der_treppe`, das die Stufenpreise der
// abgeloesten Treppe als Verbotsliste AUFZAEHLT. Gemessen 2026-09-26: '7.989' und '24,9' damit
// in dist/client, obwohl kein Kunde sie sieht (probe_wortlaut_ausgeliefert.py, Arm TREPPE).
import {wortlaut} from '~/data/qi-master/qi-master-wortlaut.json';

/**
 * Christians Fassung zum Qi Master® vom 22.09.2026 -- an der Stelle der abgeloesten
 * Vorverkaufstreppe, auf Frontseite und Kaufseite.
 *
 * DER TEXT STEHT NICHT HIER. Er kommt aus app/data/qi-master/qi-master-wortlaut.json, einer
 * K1-Ableitung (byte-gleich) von qiblanco-storefront app/data/qi-master-wortlaut.json --
 * derselben Datei, aus der drueben Produktseite, Landingpage und Anna lesen. Nachziehen:
 * pruefungen/bestand-nachziehen. Bauform wie drueben (product-pages/QiMasterWortlaut.jsx):
 * vier Absaetze in Christians Reihenfolge, keiner gekuerzt, keiner ergaenzt, keine sichtbare
 * Ueberschrift (jede Ueberschrift waere ein Satz, den Christian nicht geschrieben hat).
 * Die Rolle eines Absatzes bestimmt nur seine Gestaltung, nie seinen Text; ein unbekannter
 * Absatz faellt auf die ruhige Grundform zurueck.
 */
const ROLLE = ['grund', 'herkunft', 'termin', 'versand'];

export function Wortlaut({kompakt = false, ariaLabel = 'Preis, Auflage und Versand des Qi Master®'}) {
  const absaetze = wortlaut?.absaetze ?? [];
  if (!absaetze.length) return null;
  return (
    <section
      className={`qm-wortlaut${kompakt ? ' qm-wortlaut--kompakt' : ''}`}
      aria-label={ariaLabel}
      data-section="qm-wortlaut"
    >
      {absaetze.map((text, i) => (
        <p
          key={ROLLE[i] ?? `absatz-${i}`}
          className={`qm-wortlaut__absatz qm-wortlaut__absatz--${ROLLE[i] ?? 'grund'}`}
        >
          {text}
        </p>
      ))}
    </section>
  );
}
