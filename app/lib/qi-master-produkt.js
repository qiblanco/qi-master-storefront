/**
 * Das Produkt hinter beiden Seiten von qi-master.de -- EINE Abfrage, EIN Preis-Rechenweg.
 *
 * DIE DATEN KOMMEN AUS DEMSELBEN SHOPIFY-LADEN WIE qiblanco.com (qi-blanco.myshopify.com):
 * Titel, Beschreibung, Bilder, Variante, Preis. Was Christian dort aendert, kommt hier an,
 * ohne dass jemand etwas nachzieht -- das ist die eine Haelfte von "mitwandern". Die andere
 * Haelfte (Texte der Abschnitte, FAQ, Preisstufen) liegt in app/data/qi-master/ und wird von
 * pruefungen/probe_bestand_naht.py gegen die DACH-Storefront gemessen.
 *
 * DER PREIS: bis zum Brutto-Kipp (2026-10-09T14:48Z, shop.taxesIncluded=true) lieferte die
 * Storefront-API den Nettobetrag (gemessen 2026-09-20: 8940.34 EUR), qiblanco.com zeigte
 * netto x 1,19 auf ganze Euro. Seit dem Kipp ist der API-Betrag schon der Endbetrag (10639.0),
 * und derselbe Aufschlag waere doppelte Steuer (gemessen 2026-10-21: 12.660,- statt 10.639,-).
 * Welcher Fall gilt, sagt das Shop-Metafeld qb_preis.modus ('netto'|'brutto') -- derselbe
 * Traeger, den qiblanco.com liest (app/lib/preismodus.js dort). Es kommt in DERSELBEN Abfrage
 * wie das Produkt; fehlt es oder ist es unbekannt, gilt PREISMODUS_VORGABE (Zustand des Shops
 * seit dem Kipp). Derselbe Rechenweg steht hier,
 * damit beide Laeden dieselbe Zahl zeigen -- und die Naht-Probe misst, dass die Zahl auch mit
 * dem Listenpreis in qi-master-preisstufen.json uebereinstimmt (Datei bleibt als K1-Datenquelle
 * der Preis-Naht; seit 2026-09-26 importiert sie keine Route mehr, die Treppe ist abgeloest).
 * Nur DE: qi-master.de ist ein deutscher Laden mit einem Markt; AT/CH-Kontexte gibt es hier
 * nicht, die Kasse auf qiblanco.com rechnet den Steuersatz des Lieferlands ohnehin selbst.
 */

export const QI_MASTER_HANDLE = 'qi-master';

export const MWST_SATZ_DE = 0.19;

export const PREISMODI = ['netto', 'brutto'];
export const PREISMODUS_VORGABE = 'brutto';

/** Metafeld-Wert -> 'netto'|'brutto'; unbekannt oder fehlend -> Vorgabe (nie ein dritter Zustand). */
export function preismodusAus(wert) {
  const m = String(wert ?? '').trim().toLowerCase();
  return PREISMODI.includes(m) ? m : PREISMODUS_VORGABE;
}

/** API-Preis -> ganzer Euro brutto. Im Modus brutto ist der API-Betrag schon der Endbetrag. */
export function bruttoEuro(amount, modus = PREISMODUS_VORGABE) {
  const n = Number.parseFloat(amount);
  if (!Number.isFinite(n)) return null;
  if (preismodusAus(modus) === 'brutto') return Math.round(n);
  return Math.round(n * (1 + MWST_SATZ_DE));
}

/** 10639 -> "10.639,- €" (Schreibweise der Kaufseite auf qiblanco.com) */
export function preisText(euro) {
  if (euro == null || !Number.isFinite(Number(euro))) return null;
  return `${Number(euro).toLocaleString('de-DE', {maximumFractionDigits: 0})},- €`;
}

export const QI_MASTER_QUERY = `#graphql
  fragment QiMasterVariante on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    sku
  }
  query QiMaster($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "qb_preis", key: "modus") {
        value
      }
    }
    product(handle: $handle) {
      id
      title
      handle
      vendor
      description
      descriptionHtml
      availableForSale
      seo {
        title
        description
      }
      featuredImage {
        id
        url
        altText
        width
        height
      }
      images(first: 8) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...QiMasterVariante
      }
    }
  }
`;

/**
 * Laedt das Produkt; wirft 404, wenn Shopify es nicht liefert (Draft, nicht dem Kanal
 * zugeordnet, Handle geaendert). Ein Platzhalter waere hier eine erfundene Seite.
 */
export async function ladeQiMaster(storefront) {
  const {product, shop} = await storefront.query(QI_MASTER_QUERY, {
    variables: {handle: QI_MASTER_HANDLE},
  });
  if (!product?.id) {
    throw new Response(null, {status: 404});
  }
  const variante = product.selectedOrFirstAvailableVariant;
  const preismodus = preismodusAus(shop?.metafield?.value);
  const brutto = bruttoEuro(variante?.price?.amount, preismodus);
  return {
    product,
    variante,
    preismodus,
    bruttoEuro: brutto,
    preisText: preisText(brutto),
  };
}
