import {useLoaderData} from 'react-router';
import {ladeQiMaster} from '~/lib/qi-master-produkt';
import {kaufwegUrl, trackingParameter} from '~/lib/kaufweg';
import {BuyBox} from '~/components/qi-master/BuyBox';
import {Studien} from '~/components/qi-master/Studien';
import {Faq} from '~/components/qi-master/Faq';
import {
  MainFeatures,
  Guetezeichen,
  DiamantBilder,
  Literatur,
  SechsG,
  Persoenlichkeit,
  Fertigung,
  Begleiter,
} from '~/components/qi-master/Sektionen';

/*
 * DIE KAUFSEITE VON qi-master.de -- "die Kaufseite wie auf www.qiblanco.com/products/qi-master"
 * (Christian, 18./19.09.2026), die zweite der zwei Seiten.
 *
 * DIESELBE ROUTE WIE DRUEBEN (/products/qi-master), damit ein Link, der dort funktioniert, hier
 * dieselbe Seite trifft. Der Aufbau folgt der Kaufseite des DACH-Ladens Abschnitt fuer
 * Abschnitt: Kaufbox, Eine bisher unerreichte Liga, Guetezeichen, The One Eye, Literatur,
 * 6G-Protection, Persoenlichkeitsentwicklung, Begleiter-Banner, publizierte Zellstudien,
 * Fertigung, FAQ. Ausgelassen (entschieden, siehe Sektionen.jsx): Google-Rezensionen, Upsell.
 *
 * DER KAUFKNOPF IST EIN LINK AUF qiblanco.com: /cart/<variante>:1 des DACH-Ladens legt den
 * Artikel in dessen Warenkorb und leitet in die Kasse checkout.qiblanco.com. Diese Seite hat
 * keinen Warenkorb, kein Formular, keine Kasse. Die Variante kommt aus der Storefront-API.
 */

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const titel = data?.product?.seo?.title || `${data?.product?.title ?? 'Qi Master®'} | Qi Blanco`;
  const beschreibung = data?.product?.seo?.description || data?.product?.description || '';
  return [
    {title: titel},
    {name: 'description', content: beschreibung},
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: titel},
    {property: 'og:description', content: beschreibung},
    {property: 'og:locale', content: 'de_DE'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request}) {
  const geladen = await ladeQiMaster(context.storefront);
  const mitreisend = trackingParameter(request).toString();
  return {
    ...geladen,
    // Bis 2026-09-26 rechnete der Loader hier die Vorverkaufstreppe. Christian hat sie am
    // 22.09. abgeloest; was der Loader liefert, steht im ausgelieferten Stream -- deshalb
    // rechnet er keine Stufe mehr. An ihrer Stelle steht Wortlaut.jsx (Bauzeit-Import).
    kaufwegHref: kaufwegUrl(geladen.variante?.id, request),
    mitreisend: mitreisend ? `?${mitreisend}` : '',
  };
}

export default function Kaufseite() {
  /** @type {LoaderReturnData} */
  const {product, preisText, kaufwegHref, mitreisend} = useLoaderData();
  return (
    <div className="qm qm-pdp" data-qb-seite="qi-master-kaufseite">
      <BuyBox
        product={product}
        preisText={preisText}
        kaufwegHref={kaufwegHref}
        bilderErsatz={<DiamantBilder mitTitel={false} klein />}
      />
      <MainFeatures />
      <Guetezeichen />
      <DiamantBilder />
      <Literatur />
      <SechsG />
      <Persoenlichkeit />
      <Begleiter href="#qm-buybox" />
      <Studien request={mitreisend} mitZellwerte />
      <Fertigung />
      <Faq />
    </div>
  );
}

/** @typedef {import('./+types/products.qi-master').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
