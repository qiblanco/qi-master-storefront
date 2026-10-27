import {QIBLANCO_ORIGIN} from '~/lib/qi-alpha-domain';

/*
 * Der Fuss von qi-alpha.com (EL-20261027-beafe3d2).
 *
 * RECHTSTEXTE: Qi Alpha ist ein Stueck von Qi Blanco, verkauft aus demselben Shopify-Shop
 * mit derselben Kasse. Impressum, Datenschutz, AGB, Widerruf und Versand sind deshalb
 * DIESELBEN Texte wie auf qiblanco.com und werden dort gepflegt -- ein Abbild hier waere
 * eine zweite Wahrheit ueber dieselbe Rechtslage. Ein Klick von jeder Seite.
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
    <footer className="qa-fuss" data-section="qa-fuss">
      <div className="qa-fuss__inner">
        <p className="qa-fuss__marke">
          Qi Alpha<sup>®</sup>
        </p>
        <nav className="qa-fuss__nav" aria-label="Rechtliches">
          {RECHTSTEXTE.map(({pfad, label}) => (
            <a href={`${QIBLANCO_ORIGIN}${pfad}`} key={pfad} rel="noopener">
              {label}
            </a>
          ))}
        </nav>
        <p className="qa-fuss__zeile">
          Qi Alpha<sup>®</sup> ist ein Stück von Qi Blanco. Die Bestellung läuft über die
          sichere Kasse von Qi Blanco.
        </p>
      </div>
    </footer>
  );
}
