import {redirect} from 'react-router';

/*
 * /pages/The-Alpha (jede Schreibweise) auf qi-alpha.com -- 301 auf die Startseite, denn
 * dort steht hier die Landingpage (EL-20261027-beafe3d2). Query bleibt.
 */

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/${url.search}`, 301);
}

export default function LandingpageUmleitung() {
  return null;
}
