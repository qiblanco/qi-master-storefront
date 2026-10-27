import {Suspense} from 'react';
import {Await} from 'react-router';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';

/*
 * Rahmen von qi-alpha.com (EL-20261027-beafe3d2): Kopf, Seite, Fuss und die
 * Warenkorb-Schublade. Die Schublade oeffnet der Kaufknopf der Kaufseite
 * (TheAlphaShop: open('cart')) und der Warenkorb-Knopf im Kopf.
 */
export function PageLayout({cart, children = null}) {
  return (
    <Aside.Provider>
      <Aside type="cart" heading="Warenkorb">
        <Suspense fallback={<p>Warenkorb lädt …</p>}>
          <Await resolve={cart}>{(c) => <CartMain cart={c} layout="aside" />}</Await>
        </Suspense>
      </Aside>
      <Header cart={cart} />
      <main>{children}</main>
      <Footer />
    </Aside.Provider>
  );
}
