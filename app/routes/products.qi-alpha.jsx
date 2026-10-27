import {redirect, useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {TheAlphaShop} from '~/components/campaign/TheAlphaShop';
import {KOPF} from '~/components/campaign/the-alpha-shop-daten';
import shopStyles from '~/styles/the-alpha-produkt.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {TheAlphaWissen} from '~/components/the-alpha-shop/TheAlphaWissen';
import {TheAlphaFaq} from '~/components/campaign/TheAlphaFaq';
import {produktMeta} from '~/lib/produkt-seo';
import {QM_ADDONS_QUERY, QM_HANDLES} from '~/lib/qi-master-addons';
import {QI_ALPHA_KAUFSEITE} from '~/lib/qi-alpha-domain';

/*
 * KAUFSEITE VON qi-alpha.com -- /products/qi-alpha.
 *
 * Elina, EL-20261027-beafe3d2: Kaufseite nach qiblanco.com/products/the-alpha, gleicher
 * Shopify-Shop, gemeinsame Kasse checkout.qiblanco.com, Partnercodes muessen greifen.
 *
 * DIESELBE SEITE WIE DRUEBEN: TheAlphaShop + TheAlphaWissen + TheAlphaFaq unveraendert aus
 * qiblanco-storefront (Herkunft app/qi-alpha/HERKUNFT.json); der Loader ist der von
 * products.the-alpha.jsx dort, nur Pfad und Meta sind die dieses Ladens.
 *
 * EIGENER WARENKORB, GEMEINSAME KASSE: der Knopf legt den Qi Alpha (plus Wunschnummer und
 * Goldkette, falls gewaehlt) in den Warenkorb DIESES Ladens (routes/cart.jsx). Der Warenkorb
 * gehoert zum selben Shopify-Shop; seine checkoutUrl zeigt auf checkout.qiblanco.com.
 * Partnercodes greifen dort wie drueben (Rabattcodes des Shops), zusaetzlich ueber
 * /discount/<CODE> und das Codefeld im Warenkorb.
 *
 * PFAD: Christian am 27.10.2026 zum DACH-Laden: "den Link aendern wir auch wieder von The
 * Alpha in Qi Alpha". Dieser Laden startet deshalb gleich unter /products/qi-alpha;
 * /products/the-alpha und /products/qi-master sind 301-Huellen hierher.
 */

export function links() {
  return [
    {rel: 'preload', as: 'image', href: KOPF.loop.poster, fetchPriority: 'high'},
    {rel: 'stylesheet', href: shopStyles},
    {rel: 'stylesheet', href: wissenStyles},
    {rel: 'stylesheet', href: faqStyles},
  ];
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) =>
  produktMeta({
    produkt: data?.product && {...data.product, handle: 'qi-alpha'},
    marktLand: data?.marktLand,
    pfad: QI_ALPHA_KAUFSEITE,
    titel: 'Qi Alpha® kaufen, Limited 1st. Edition 111/111',
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  // EINE Schreibweise (React Router matcht ohne Gross/Klein), Query bleibt.
  const url = new URL(args.request.url);
  if (url.pathname !== QI_ALPHA_KAUFSEITE) {
    throw redirect(`${QI_ALPHA_KAUFSEITE}${url.search}`, 301);
  }
  return loadCriticalData(args);
}

/**
 * Erst `qi-alpha`, sonst `qi-master` (QM_HANDLES, Reihenfolge tragend) -- wie drueben.
 * @param {LoaderFunctionArgs['context']['storefront']} storefront
 * @param {Request} request
 */
async function ladeQiAlpha(storefront, request) {
  for (const handle of QM_HANDLES) {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    });
    if (product?.id) return {product, handle};
  }
  return {product: null, handle: QM_HANDLES[0]};
}

/** @param {LoaderFunctionArgs} args */
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const [{product}, addonDaten] = await Promise.all([
    ladeQiAlpha(storefront, request),
    // FAIL-SOFT wie drueben: fehlt ein Add-on, entfaellt nur der Bereich.
    storefront.query(QM_ADDONS_QUERY).catch(() => null),
  ]);
  if (!product?.id) throw new Response(null, {status: 404});
  return {
    product,
    marktLand: storefront.i18n.country,
    addons: {
      wunschnummer: addonDaten?.wunschnummerNeu ?? addonDaten?.wunschnummer ?? null,
      kette: addonDaten?.ketteNeu ?? addonDaten?.kette ?? null,
    },
  };
}

export default function QiAlphaKaufseite() {
  const {product, addons} = useLoaderData();
  return (
    <TheAlphaShop
      product={product}
      addons={addons}
      nachDerBox={
        <>
          <TheAlphaWissen />
          <TheAlphaFaq ton="hell" />
        </>
      }
    />
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
