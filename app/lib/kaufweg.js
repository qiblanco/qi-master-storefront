/**
 * DER KAUFWEG VON qi-master.de FUEHRT AUF qiblanco.com -- und sonst nirgendwohin.
 *
 * Christian, 18./19.09.2026: "der Checkout laeuft dann ueber www.qiblanco.com". Auftrag vom
 * 20.09.: "Der Kaufknopf fuehrt dorthin; qi-master.de selbst wickelt nichts ab." Diese Datei ist
 * die EINE Stelle, an der diese Adresse steht. Kein Formular dieser Storefront postet nach
 * /cart, kein Knopf legt hier etwas in einen Warenkorb; der Warenkorb, die Kasse, die Zahlung
 * und die Bestellung gehoeren dem DACH-Laden.
 *
 * WARUM DER WARENKORB-PERMALINK UND NICHT DIE PRODUKTSEITE: qiblanco.com/cart/<variante>:<menge>
 * ist die Hydrogen-Route cart.$lines.jsx des DACH-Ladens. Sie legt den Artikel in einen frischen
 * Warenkorb, haengt die Herkunfts-Attribute an (UTM, Klick-IDs -- nach Einwilligung) und leitet
 * auf checkout.qiblanco.com weiter. Gemessen am 2026-09-20: HTTP 302 auf
 * https://checkout.qiblanco.com/cart/c/<token>. Der Kunde landet also direkt in der Kasse, die
 * er von qiblanco.com kennt, mit dem Qi Master im Korb -- ein Klick, kein zweiter Warenkorb.
 *
 * DIE VARIANTEN-NUMMER WIRD NICHT HINGESCHRIEBEN, SIE KOMMT AUS DER STOREFRONT-API des Produkts
 * (gid://shopify/ProductVariant/<nummer>). Eine hingeschriebene 62077673767180 waere eine zweite
 * Wahrheit ueber denselben Artikel; die Storefront-API ist dieselbe Quelle, die qiblanco.com liest.
 *
 * DIE GRENZE ZWISCHEN ZWEI DOMAINS IST DIE STELLE, AN DER TRACKING-SCHLUESSEL VERLOREN GEHEN
 * (Root-Cause _qpx_anon 2026-07-22: 90,6 % Fehlattribution). qi-master.de setzt selbst KEINE
 * Identitaets-Cookies (kein Pixel, kein qpx -- Auftrag 18.09.: "keine zweite Analytik"). Was
 * ueber die Grenze muss, sind allein die Parameter, mit denen ein Besucher ANKOMMT: fbclid,
 * gclid, ttclid, utm_* usw. Sie stehen in der URL der Landingpage und werden hier an den
 * Kaufweg-Link angehaengt -- damit qiblanco.com sie an der Kasse liest (checkout-tracking.js,
 * TRACKING_PARAM_NAMES + utm_*). Die Liste unten ist eine TEILMENGE der dortigen; die Wache
 * pruefungen/probe_bestand_naht.py misst, dass sie es bleibt.
 */

export const QIBLANCO_ORIGIN = 'https://qiblanco.com';

/** Pfad der Kaufseite auf qiblanco.com -- die Seite, aus der dieser Bau seine Inhalte bezieht. */
export const QIBLANCO_PRODUKT_PFAD = '/products/qi-master';

/**
 * Parameter, die ueber die Domaingrenze mitreisen. Teilmenge von
 * qiblanco-storefront app/lib/checkout-tracking.js TRACKING_PARAM_NAMES; utm_* per Muster.
 */
export const DURCHGEREICHTE_PARAMETER = new Set([
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'ttclid',
  'twclid',
  'li_fat_id',
  'epik',
  'scclid',
  'sccid',
  'rdt_cid',
  'irclickid',
  'click_id',
  'clickid',
  'h_ad_id',
  'h_click_id',
]);

const UTM_RX = /^utm_[a-z0-9_]+$/i;

export function istDurchzureichen(name) {
  return DURCHGEREICHTE_PARAMETER.has(name) || UTM_RX.test(name);
}

/**
 * Die Tracking-Parameter der ankommenden Anfrage als URLSearchParams -- nur die erlaubten,
 * in der Reihenfolge ihres Auftretens, jeder Name einmal.
 * @param {Request|string|URL|null|undefined} request  Request, volle URL oder reiner Query-String ('?a=b')
 */
export function trackingParameter(request) {
  const aus = new URLSearchParams();
  if (!request) return aus;
  let url;
  try {
    if (typeof request === 'string' && (request === '' || request.startsWith('?'))) {
      // Ein reiner Query-String (so reisen die Parameter vom Loader in die Komponenten).
      url = new URL(`https://qi-master.de/${request}`);
    } else {
      url = new URL(typeof request === 'string' || request instanceof URL ? request : request.url);
    }
  } catch {
    return aus;
  }
  for (const [name, wert] of url.searchParams) {
    if (istDurchzureichen(name) && !aus.has(name) && wert !== '') aus.set(name, wert);
  }
  return aus;
}

function mitParametern(basis, params) {
  const s = params.toString();
  if (!s) return basis;
  return basis + (basis.includes('?') ? '&' : '?') + s;
}

/** Numerische Varianten-Nummer aus einer Storefront-GID. */
export function variantenNummer(gid) {
  const m = /ProductVariant\/(\d+)/.exec(String(gid || ''));
  return m ? m[1] : null;
}

/**
 * Der Kaufweg: Warenkorb-Permalink des DACH-Ladens fuer GENAU diese Variante.
 * Liefert null, wenn keine Variante bekannt ist -- dann gibt es keinen Kaufknopf, keinen
 * Platzhalter und keinen Link ins Leere.
 * @param {string} variantGid  gid://shopify/ProductVariant/<nummer>
 * @param {Request|string|URL|null} [request]  die ankommende Anfrage (Parameter-Durchreichung)
 * @param {number} [menge]
 */
export function kaufwegUrl(variantGid, request, menge = 1) {
  const nummer = variantenNummer(variantGid);
  if (!nummer) return null;
  const basis = `${QIBLANCO_ORIGIN}/cart/${nummer}:${Math.max(1, Number(menge) || 1)}`;
  return mitParametern(basis, trackingParameter(request));
}

/** Ein Link auf eine Seite von qiblanco.com (Kaufseite, Studien, Rechtstexte) -- mit Parametern. */
export function qiblancoUrl(pfad, request) {
  const p = pfad.startsWith('/') ? pfad : `/${pfad}`;
  return mitParametern(`${QIBLANCO_ORIGIN}${p}`, trackingParameter(request));
}

/** Interner Link (Landingpage -> Kaufseite) -- die Parameter reisen mit, damit sie den ersten Klick ueberleben. */
export function internerPfad(pfad, request) {
  return mitParametern(pfad, trackingParameter(request));
}
