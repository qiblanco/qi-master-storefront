/*
 * qi-alpha.com -- die EINE Stelle fuer Domain, Pfade und Weichen dieses Ladens.
 *
 * Elina, EL-20261027-beafe3d2: "Qi Alpha als eigener Shop (Rebranding von Qi Master,
 * analog crystal-cacao.com) ... gleicher Shopify-Shop und gemeinsame Kasse
 * checkout.qiblanco.com ... Neue Hauptdomain wird qi-alpha.com, qi-alpha.de und
 * qi-master.de sollen danach per 301 auf qi-alpha.com weiterleiten."
 *
 * DREI WEICHEN, alle hier:
 *   1. hostUmleitung()  -- jeder Neben-Host (www, .de, qi-master.de) geht in EINEM
 *                          Sprung per 301 auf https://qi-alpha.com, Pfad und Query
 *                          bleiben (UTM, Click-IDs, Partnercode). Alte Kaufpfade
 *                          werden dabei direkt auf die neue Kaufseite gelegt.
 *                          Greift NUR fuer die genannten Hosts: Oxygen-Vorschau
 *                          (*.myshopify.dev), localhost und die sslip-Vorschau
 *                          bleiben unberuehrt.
 *   2. zuQiblanco()     -- alles, was nicht Qi Alpha ist (andere Produkte,
 *                          Kollektionen, Blog, Suche, Shopify-Seiten), geht per 301
 *                          auf dieselbe Adresse unter qiblanco.com. Sonst waere
 *                          qi-alpha.com ein zweites Abbild des ganzen DACH-Ladens
 *                          (Lehre aus qi-master-node, README "Zwei Seiten macht der
 *                          Netzrand").
 *   3. ALTE_KAUFPFADE   -- /products/qi-master und /products/the-alpha auf diesem
 *                          Host enden auf der Kaufseite.
 */

/** Hauptdomain (apex). Canonicals, Sitemap und og:url zeigen IMMER hierauf. */
export const QI_ALPHA_ORIGIN = 'https://qi-alpha.com';

/** Die Kaufseite dieses Ladens. */
export const QI_ALPHA_KAUFSEITE = '/products/qi-alpha';

/** Der DACH-Laden (gleicher Shopify-Shop), Ziel der Fremdrouten und Rechtstexte. */
export const QIBLANCO_ORIGIN = 'https://qiblanco.com';

/** Hosts, die per 301 auf QI_ALPHA_ORIGIN gehen (Kleinschreibung, ohne Port). */
export const UMLEITUNGS_HOSTS = new Set([
  'www.qi-alpha.com',
  'qi-alpha.de',
  'www.qi-alpha.de',
  'qi-master.de',
  'www.qi-master.de',
]);

/** Alte Kaufpfade -> neue Kaufseite (ohne abschliessenden Schraegstrich). */
export const ALTE_KAUFPFADE = new Set([
  '/products/qi-master',
  '/products/the-alpha',
  '/pages/the-alpha',
  '/pages/qi-alpha',
  '/pages/qi-master',
]);

/**
 * 301 fuer Neben-Hosts, sonst null.
 * @param {Request} request
 * @returns {Response | null}
 */
export function hostUmleitung(request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (!UMLEITUNGS_HOSTS.has(host)) return null;
  let pfad = url.pathname;
  const ohneSlash = pfad.replace(/\/+$/, '').toLowerCase();
  if (ohneSlash.startsWith('/pages/')) {
    // Die Landingpage lag auf /pages/The-Alpha bzw. /pages/qi-master(-lp).
    if (ALTE_KAUFPFADE.has(ohneSlash) || ohneSlash === '/pages/qi-master-lp') {
      pfad = '/';
    }
  } else if (ALTE_KAUFPFADE.has(ohneSlash)) {
    pfad = QI_ALPHA_KAUFSEITE;
  }
  return new Response(null, {
    status: 301,
    headers: {Location: `${QI_ALPHA_ORIGIN}${pfad}${url.search}`},
  });
}

/**
 * 301 auf dieselbe Adresse unter qiblanco.com (fuer Routen, die nicht Qi Alpha sind).
 * Als `throw` im Loader verwenden.
 * @param {Request} request
 * @returns {Response}
 */
export function zuQiblanco(request) {
  const url = new URL(request.url);
  // .data-Abrufe der Client-Navigation tragen den Suffix; das Ziel ist die Seite.
  const pfad = url.pathname.replace(/\.data$/, '');
  return new Response(null, {
    status: 301,
    headers: {Location: `${QIBLANCO_ORIGIN}${pfad}${url.search}`},
  });
}
