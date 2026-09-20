import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';

/*
 * Rahmen beider Seiten: Kopf, Inhalt, Fuss -- und der Aside.Provider des Geruests, weil die
 * bestehenden Geruest-Routen (cart, products.$handle) ihn ueber useAside() voraussetzen.
 * Die drei Seitenleisten des Geruests (Warenkorb, Suche, mobiles Menue) sind bewusst nicht
 * mehr eingehaengt: qi-master.de hat keinen Warenkorb und keine Suche, und eine unsichtbar
 * mitgerenderte Warenkorb-Leiste waere ein Overlay ohne Zweck (Overlay-Ordnung, web-soll v2).
 */
export function PageLayout({children = null}) {
  return (
    <Aside.Provider>
      <Header />
      <main>{children}</main>
      <Footer />
    </Aside.Provider>
  );
}
