import {useLoaderData} from 'react-router';
import {ladeQiMaster, QI_MASTER_HANDLE} from '~/lib/qi-master-produkt';
import {kaufwegUrl, internerPfad, trackingParameter} from '~/lib/kaufweg';
import {Kaufknopf} from '~/components/qi-master/Kaufknopf';
import {Wortlaut} from '~/components/qi-master/Wortlaut';
import {BenefitList} from '~/components/qi-master/BenefitList';
import {Studien} from '~/components/qi-master/Studien';
import {ZweiFragen} from '~/components/qi-master/Faq';
import {
  MainFeatures,
  Guetezeichen,
  DiamantBilder,
  Fertigung,
} from '~/components/qi-master/Sektionen';
import {fremdHtmlMitKopfsymbolen} from '~/lib/qi-master-kopfsymbole';

/*
 * DIE FRONTSEITE VON qi-master.de IST DIE LANDINGPAGE (Christian, 19.09.2026: "dass wir eine
 * Frontseite haben, die dann auch die Landingpage ist"). Vorbild crystal-cacao.com: EINE Seite,
 * die verkauft -- kein Schaufenster mit Unterseiten.
 *
 * WORAN SIE GEMESSEN WIRD: am NAECHSTEN KLICK, nicht an der Bestellung (Trichter Ad ->
 * Landingpage -> Kaufseite -> Kasse; qi-brain, landingpage-trichter-und-messregel). Der eine
 * Weg dieser Seite fuehrt deshalb auf /products/qi-master, die Kaufseite. Wer schon weiss, was
 * er will, bekommt daneben den direkten Kaufweg -- der fuehrt in den Warenkorb von qiblanco.com,
 * denn qi-master.de wickelt nichts ab (app/lib/kaufweg.js).
 *
 * AUFBAU nach der Kaufueberzeugungs-Lehre des Hauses: Einstieg mit dem Stueck selbst und dem
 * Kundenwort (Neugier), dann die drei Saetze, die es ausmachen, die Zusagen, die zwei Fragen,
 * die Christian an Platz eins und zwei gesetzt hat, die Belege (Studien) -- und der Beweis
 * steht VOR dem Kaufknopf, nicht im Einstieg. Abschluss: Angebot, Rueckgabe, Finanzierung.
 *
 * JEDER TEXT KOMMT AUS DEM BESTAND: Shopify-Beschreibung (Kopfblock), Christians Fassungen der
 * Feature-Spalten, Guetezeichen, FAQ, Studien, Wortlaut -- nichts ist hier erfunden. Was auf
 * qiblanco.com gestrichen wurde, bleibt gestrichen.
 */

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const titel = data?.product?.seo?.title || `${data?.product?.title ?? 'Qi Master®'} | Qi Blanco`;
  const beschreibung = data?.product?.seo?.description || data?.product?.description || '';
  return [
    {title: titel},
    {name: 'description', content: beschreibung},
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: titel},
    {property: 'og:description', content: beschreibung},
    {property: 'og:locale', content: 'de_DE'},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request}) {
  const geladen = await ladeQiMaster(context.storefront);
  const mitreisend = trackingParameter(request).toString();
  return {
    ...geladen,
    handle: QI_MASTER_HANDLE,
    kaufwegHref: kaufwegUrl(geladen.variante?.id, request),
    kaufseiteHref: internerPfad('/products/qi-master', request),
    mitreisend: mitreisend ? `?${mitreisend}` : '',
  };
}

export default function Frontseite() {
  /** @type {LoaderReturnData} */
  const {product, preisText, kaufwegHref, kaufseiteHref, mitreisend} = useLoaderData();
  const kopf = fremdHtmlMitKopfsymbolen(product?.descriptionHtml ?? '');
  return (
    <div className="qm qm-lp" data-qb-seite="qi-master-frontseite">
      <section className="qm-hero" data-section="qm-hero">
        <div className="qm-hero__text">
          <h1 className="qm-hero__titel">{product.title}</h1>
          <div className="qm-beschreibung qm-hero__kopf" dangerouslySetInnerHTML={{__html: kopf}} />
          <p className="qm-hero__preis">
            <span className="qm-hero__betrag">{preisText}</span>
            <span className="qm-steuerhinweis">inkl. 19 % MwSt.</span>
          </p>
          <div className="qm-hero__wege">
            <a className="qm-btn qm-btn--primary" href={kaufseiteHref} data-qa="cta">
              Zur Kaufseite
            </a>
            <a className="qm-btn qm-btn--sekundaer" href={kaufwegHref}>
              Direkt in den Warenkorb
            </a>
          </div>
          <p className="qm-hero__hinweis">
            Kasse und Bestellung laufen über qiblanco.com — den Qi-Blanco-Shop.
          </p>
        </div>
        <div className="qm-hero__bild">
          <DiamantBilder mitTitel={false} klein />
        </div>
      </section>

      <MainFeatures />
      <Guetezeichen />
      <ZweiFragen />
      <Studien request={mitreisend} />
      <Fertigung />

      <section className="qm-abschluss" data-section="qm-abschluss">
        <div className="qm-abschluss__inner">
          <Wortlaut />
          <BenefitList />
          <div className="qm-abschluss__wege">
            <a className="qm-btn qm-btn--primary" href={kaufseiteHref}>
              Zur Kaufseite
            </a>
            <Kaufknopf href={kaufwegHref} kompakt text="Direkt in den Warenkorb" />
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
