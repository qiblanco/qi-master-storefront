import {FAQ_QI_MASTER} from '~/data/qi-master/qi-master-faq';

function absaetze(text) {
  return String(text || '').split(/\n\s*\n/).filter(Boolean);
}

function faqJsonLd(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: {'@type': 'Answer', text: String(i.a).replace(/\s*\n\s*/g, ' ')},
    })),
  });
}

/**
 * Haeufig gestellte Fragen -- Reihenfolge und Wortlaut aus dem Bestand (FAQ_QI_MASTER, abgeleitet).
 * Die ersten zwei stehen vorn, weil Christian sie am 19.09.2026 dorthin gesetzt hat.
 * <details>/<summary>: jede Antwort steht im Markup (crawlbar), zugeklappt ohne JavaScript.
 */
export function Faq({items = FAQ_QI_MASTER, ueberschrift = 'Häufig gestellte Fragen (FAQ)'}) {
  return (
    <section className="qm-faq" data-section="qm-faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: faqJsonLd(items)}} />
      <h2 className="qm-h2">{ueberschrift}</h2>
      <div className="qm-faq__liste">
        {items.map((item) => (
          <details className="qm-faq__eintrag" key={item.q}>
            <summary className="qm-faq__frage">{item.q}</summary>
            <div className="qm-faq__antwort">
              {absaetze(item.a).map((abs) => (
                <p key={abs.slice(0, 40)}>{abs}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Die zwei Fragen an Platz eins und zwei -- offen, als Text, fuer die Landingpage. */
export function ZweiFragen({items = FAQ_QI_MASTER.slice(0, 2)}) {
  return (
    <section className="qm-zweifragen" data-section="qm-zweifragen">
      <h2 className="qm-h2">Zwei Fragen, die zuerst kommen</h2>
      <div className="qm-zweifragen__raster">
        {items.map((item) => (
          <article className="qm-zweifragen__karte" key={item.q}>
            <h3>{item.q}</h3>
            {absaetze(item.a).map((abs) => (
              <p key={abs.slice(0, 40)}>{abs}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
