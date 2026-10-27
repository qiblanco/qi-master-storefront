import {QI_ALPHA_ORIGIN} from '~/lib/qi-alpha-domain';

/**
 * @param {Route.LoaderArgs}
 */
export function loader({request}) {
  const url = new URL(request.url);
  // qi-alpha.com (EL-20261027-beafe3d2): Sitemap immer auf der Hauptdomain. Jeder andere
  // Host (Oxygen-Vorschau *.myshopify.dev, sslip-Vorschau, localhost) sperrt alles: eine
  // Vorschau ist kein zweiter Laden im Index.
  const body =
    url.origin === QI_ALPHA_ORIGIN
      ? robotsTxtData({url: QI_ALPHA_ORIGIN})
      : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',

      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

/**
 * @param {{url?: string}}
 */
function robotsTxtData({url}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
${generalDisallowRules({sitemapUrl})}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /cart
Disallow: /account
Disallow: /search
Allow: /search/
Disallow: /search/?*

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: MJ12bot
Crawl-Delay: 10

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 * @param {{sitemapUrl?: string}}
 */
function generalDisallowRules({sitemapUrl}) {
  return `Disallow: /cart
Disallow: /account
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: /*/collections/*filter*&*filter*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /policies/
Disallow: /search
Allow: /search/
Disallow: /search/?*
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;
}

/** @typedef {import('./+types/[robots.txt]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
