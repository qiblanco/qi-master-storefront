import {Image} from '@shopify/hydrogen';
import {Kaufknopf} from './Kaufknopf';
import {Treppe} from './Treppe';
import {BenefitList} from './BenefitList';
import {fremdHtmlMitKopfsymbolen} from '~/lib/qi-master-kopfsymbole';

/**
 * Die Kaufbox der Kaufseite: Titel, Preis, Vorverkaufstreppe, Beschreibung, Kaufknopf, Nutzen.
 *
 * SIE TRAEGT DIE ID qm-buybox, weil der Banner weiter unten ("Hole dir deinen Qi Master®")
 * dorthin springt -- dieselbe Id wie auf qiblanco.com, und sie existiert wirklich (Befund
 * 2026-09-16 drueben: ein Sprungziel, das es im ganzen Laden nicht gab).
 *
 * BILDER: das Produkt hat in Shopify heute keine (gemessen 2026-09-20: images.nodes = []).
 * Solange das so ist, steht links das Bildpaar "The One Eye" aus dem Bestand -- kein QiOne-Bild
 * als Qi Master. Sobald Christian Produktbilder in Shopify ablegt, zeigt die Box sie von selbst.
 *
 * "inkl. 19 % MwSt." haengt am Preis, nicht unter der Tabelle (Christian, 2026-09-16).
 */
export function BuyBox({product, preisText, kaufwegHref, treppe, bilderErsatz}) {
  const bilder = product?.images?.nodes?.filter(Boolean) ?? [];
  const html = fremdHtmlMitKopfsymbolen(product?.descriptionHtml ?? '');
  return (
    <section className="qm-buybox" id="qm-buybox" data-section="qm-buybox">
      <div className="qm-buybox__bild">
        {bilder.length ? (
          <Image data={bilder[0]} sizes="(min-width: 60em) 40vw, 100vw" alt={bilder[0].altText || product.title} />
        ) : (
          bilderErsatz
        )}
      </div>
      <div className="qm-buybox__text">
        <h1 className="qm-buybox__titel">{product.title}</h1>
        <p className="qm-buybox__preis" data-qa="preis">
          <span className="qm-buybox__betrag">{preisText}</span>
          <span className="qm-steuerhinweis">inkl. 19 % MwSt.</span>
        </p>
        <Kaufknopf href={kaufwegHref} />
        {treppe ? <Treppe treppe={treppe} kompakt /> : null}
        <div
          className="qm-beschreibung"
          dangerouslySetInnerHTML={{__html: html}}
        />
        <BenefitList />
      </div>
    </section>
  );
}
