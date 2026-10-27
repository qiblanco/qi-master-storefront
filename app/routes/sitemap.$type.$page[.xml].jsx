import {getSitemap} from '@shopify/hydrogen';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  // qi-alpha.com hat genau EINE Sitemap mit zwei Adressen ([sitemap.xml].jsx). Die
  // Shopify-Teilsitemaps listeten den ganzen gemeinsamen Shop (EL-20261027-beafe3d2).
  throw new Response(null, {status: 404});
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
