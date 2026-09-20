import {QIBLANCO_ORIGIN} from '~/lib/kaufweg';

/*
 * Der Fuss von qi-master.de -- die Pflichtangaben liegen bei qiblanco.com.
 *
 * Impressum, Datenschutz, AGB, Widerruf und Versand sind Rechtstexte der Qi Blanco UG und
 * stehen genau einmal: im DACH-Laden. Sie werden hier verlinkt, nicht kopiert -- eine Kopie
 * eines Rechtstexts ist in zwei Wochen eine zweite Wahrheit. Pfade gemessen 2026-09-20
 * (je HTTP 200): /pages/impressum, /pages/datenschutz, /pages/agb, /policies/refund-policy,
 * /policies/shipping-policy.
 *
 * Kein Shopify-Footer-Menue (dasselbe Argument wie im Kopf: es ist das Menue von qiblanco.com).
 */
const RECHTSTEXTE = [
  {pfad: '/pages/impressum', label: 'Impressum'},
  {pfad: '/pages/datenschutz', label: 'Datenschutz'},
  {pfad: '/pages/agb', label: 'AGB'},
  {pfad: '/policies/refund-policy', label: 'Widerruf & Rückgabe'},
  {pfad: '/policies/shipping-policy', label: 'Versand'},
];

export function Footer() {
  return (
    <footer className="qm-fuss" data-section="qm-fuss">
      <div className="qm-fuss__inner">
        <nav className="qm-fuss__nav" aria-label="Rechtliches">
          {RECHTSTEXTE.map(({pfad, label}) => (
            <a href={`${QIBLANCO_ORIGIN}${pfad}`} key={pfad} rel="noopener">
              {label}
            </a>
          ))}
        </nav>
        <p className="qm-fuss__zeile">
          Qi Master® ist ein Stück von Qi Blanco. Warenkorb, Kasse und Bestellung laufen über{' '}
          <a href={QIBLANCO_ORIGIN}>qiblanco.com</a>.
        </p>
      </div>
    </footer>
  );
}
