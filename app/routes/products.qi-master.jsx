import {redirect} from 'react-router';
import {QI_ALPHA_KAUFSEITE} from '~/lib/qi-alpha-domain';

/*
 * /qi-master auf qi-alpha.com -- 301 auf die Kaufseite /products/qi-alpha
 * (EL-20261027-beafe3d2). Ein Sprung, Query bleibt (UTM, Click-IDs, Partnercode).
 */

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`${QI_ALPHA_KAUFSEITE}${url.search}`, 301);
}

export default function AltpfadUmleitung() {
  return null;
}
