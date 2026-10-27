import {QI_ALPHA_ORIGIN, QI_ALPHA_KAUFSEITE} from '~/lib/qi-alpha-domain';

/*
 * Sitemap von qi-alpha.com: genau die zwei Seiten dieses Ladens (EL-20261027-beafe3d2).
 *
 * Bis hierher stand getSitemapIndex() des Geruests. Das listet ALLE Produkte, Kollektionen,
 * Seiten und Blogartikel des gemeinsamen Shopify-Shops -- auf qi-alpha.com waeren das
 * Adressen, die per 301 nach qiblanco.com gehen. Eine Sitemap voller Umleitungen meldet die
 * Search Console als Fehler; deshalb hier fest und absolut auf die Hauptdomain.
 */

const SEITEN = ['/', QI_ALPHA_KAUFSEITE];

export function loader() {
  const urls = SEITEN.map(
    (pfad) =>
      `  <url><loc>${QI_ALPHA_ORIGIN}${pfad === '/' ? '/' : pfad}</loc></url>`,
  ).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
