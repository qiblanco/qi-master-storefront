import TheAlpha from '~/components/campaign/TheAlpha';
import {canonicalLink} from '~/lib/seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';

/*
 * STARTSEITE VON qi-alpha.com = die Qi-Alpha-Landingpage.
 *
 * Elina, EL-20261027-beafe3d2: "Inhalt, Startseite und Kaufseite nach Qi Alpha (Vorlage
 * qiblanco.com/pages/The-Alpha und /products/the-alpha, Quiet Luxury)". Die Seite ist
 * DIESELBE wie qiblanco.com/pages/The-Alpha (Variante A, TheAlphaPremium): Bausteine,
 * Texte, Bilder und Film kommen unveraendert aus qiblanco-storefront (Herkunft und
 * Stand in app/qi-alpha/HERKUNFT.json). Einzige lokale Anpassung: der rote Knopf fuehrt
 * auf die Kaufseite DIESES Ladens (/products/qi-alpha, the-alpha-daten.js).
 *
 * Die alte Qi-Master-Frontseite (Komponenten unter components/qi-master/) ist nicht mehr
 * geroutet. Sie bleibt im Repo, bis der Bestand-Aufloeser (rt qi-master-bestand-aufloeser)
 * nach dem GO stillgelegt ist -- er baut und prueft gegen genau diese Dateien.
 *
 * TRACKING: kein Pixel-Code hier (0-Pixel-Regel wie drueben).
 */

export function links() {
  return [{rel: 'stylesheet', href: theAlphaPremiumStyles}];
}

/** @type {Route.MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha®, Limited 1st. Edition 111/111'},
  {
    name: 'description',
    content:
      'Qi Alpha mit Diamant, Limited 1st. Edition: 111 Stück, jedes mit eigener Nummer der Alpha-Serie. Jetzt exklusiv reservieren.',
  },
  {property: 'og:site_name', content: 'Qi Alpha'},
  {property: 'og:title', content: 'Qi Alpha®, Limited 1st. Edition 111/111'},
  {
    property: 'og:image',
    content:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253',
  },
  canonicalLink('/'),
];

export default function QiAlphaStartseite() {
  return <TheAlpha />;
}

/** @typedef {import('./+types/_index').Route} Route */
