import {zuQiblanco} from '~/lib/qi-alpha-domain';

/*
 * /products/<handle> auf qi-alpha.com: jedes andere Produkt des gemeinsamen Shops gehoert
 * zum DACH-Laden und geht per 301 auf dieselbe Adresse unter qiblanco.com
 * (lib/qi-alpha-domain.js, EL-20261027-beafe3d2). Die Kaufseite dieses Ladens ist die
 * statische Route products.qi-alpha.jsx; /products/qi-master und /products/the-alpha
 * sind eigene 301-Huellen dorthin.
 *
 * Bis hierher stand die Geruest-Produktseite. Ihr GraphQL-Fragment `Product` kollidierte
 * mit dem gleichnamigen der Qi-Alpha-Kaufseite (lib/qioneProductQuery.js) im Codegen.
 */

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({request}) {
  throw zuQiblanco(request);
}

export default function FremdesProdukt() {
  return null;
}
