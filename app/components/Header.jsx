import {NavLink, useLocation} from 'react-router';
import {QIBLANCO_ORIGIN, internerPfad} from '~/lib/kaufweg';

/*
 * Der Kopf von qi-master.de -- zwei Seiten, ein Laden dahinter.
 *
 * KEIN SHOPIFY-MENUE: das Geruest zog hier die Navigation aus dem Menue `main-menu` des
 * gemeinsamen Shops (qi-blanco.myshopify.com) -- das sind die Rubriken von qiblanco.com,
 * also QiOne, QiBracelet, QiHome, Kakao, Blog. qi-master.de ist eine Zwei-Seiten-Homepage
 * fuer EIN Stueck (Christian, 19.09.2026). Die Navigation steht deshalb hier fest: die
 * Frontseite, die Kaufseite, und der Weg zum Shop, in dem die Kasse liegt.
 *
 * KEIN WARENKORB, KEINE SUCHE, KEIN KONTO IM KOPF: qi-master.de wickelt nichts ab. Der
 * Warenkorb gehoert qiblanco.com (app/lib/kaufweg.js); ein Warenkorb-Symbol hier waere ein
 * Versprechen, das diese Domain nicht einloest. Die Geruest-Routen (/cart, /search, /account)
 * bleiben bestehen -- pruefungen/grundgeruest.sh zaehlt sie -- sie werden nur nicht verlinkt.
 */
export function Header() {
  const marke = 'Qi Master®';
  // Die Tracking-Parameter der Anfrage reisen auch ueber die Kopfnavigation weiter.
  const {search} = useLocation();
  return (
    <header className="qm-kopf" data-section="qm-kopf">
      <NavLink prefetch="intent" to="/" className="qm-kopf__marke" end>
        {marke}
      </NavLink>
      <nav className="qm-kopf__nav" aria-label="Seiten">
        <NavLink prefetch="intent" to={internerPfad('/products/qi-master', search)} end>
          Kaufseite
        </NavLink>
        <a href={QIBLANCO_ORIGIN} rel="noopener">
          qiblanco.com
        </a>
      </nav>
    </header>
  );
}
