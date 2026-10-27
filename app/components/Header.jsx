import {Suspense} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {QI_ALPHA_KAUFSEITE} from '~/lib/qi-alpha-domain';

/*
 * Der Kopf von qi-alpha.com (EL-20261027-beafe3d2): Wortmarke, Kaufseite, Warenkorb.
 * Quiet Luxury wie die Landingpage: schwarz, Serifen-Wortmarke, keine Navigation in den
 * DACH-Laden (Christian/Elina: eigener Shop, analog crystal-cacao.com). Der Warenkorb ist
 * der eigene dieses Ladens; die Kasse dahinter ist checkout.qiblanco.com.
 */
export function Header({cart}) {
  // Tracking-Parameter (utm_*, fbclid, gclid) reisen auch ueber die Kopfnavigation weiter.
  const {search} = useLocation();
  return (
    <header className="qa-kopf" data-section="qa-kopf">
      <NavLink prefetch="intent" to={`/${search}`} className="qa-kopf__marke" end>
        Qi Alpha<sup>®</sup>
      </NavLink>
      <nav className="qa-kopf__nav" aria-label="Seiten">
        <NavLink prefetch="intent" to={`${QI_ALPHA_KAUFSEITE}${search}`} end>
          Kaufen
        </NavLink>
        <Suspense fallback={<WarenkorbKnopf anzahl={0} />}>
          <Await resolve={cart}>{(c) => <WarenkorbZaehler cart={c} />}</Await>
        </Suspense>
      </nav>
    </header>
  );
}

function WarenkorbZaehler({cart}) {
  const optimistisch = useOptimisticCart(cart);
  return <WarenkorbKnopf anzahl={optimistisch?.totalQuantity ?? 0} />;
}

function WarenkorbKnopf({anzahl}) {
  const {open} = useAside();
  return (
    <a
      href="/cart"
      className="qa-kopf__korb"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
      }}
      aria-label={`Warenkorb, ${anzahl} Artikel`}
    >
      Warenkorb{anzahl > 0 ? <span className="qa-kopf__zahl">{anzahl}</span> : null}
    </a>
  );
}
