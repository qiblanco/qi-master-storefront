import {QIMASTER_GUETEZEICHEN} from '~/data/qi-master/qi-master-guetezeichen';
import {
  QIMASTER_DIAMANTBILDER,
  QIMASTER_DIAMANTBILDER_TITEL,
} from '~/data/qi-master/qi-master-diamantbilder';
import {QIMASTER_LITERATURBILDER} from '~/data/qi-master/qi-master-literaturbilder';
import {
  QIMASTER_DIAMANT,
  QIMASTER_SECHS_G,
  QIMASTER_PERSOENLICHKEIT,
} from '~/data/qi-master/qi-master-texte';

/*
 * Die Abschnitte des Qi Master® -- Wortlaut aus dem Bestand (qiblanco.com/products/qi-master).
 *
 * WAS HIER STEHT, STEHT DORT: Ueberschriften und Absaetze der drei Feature-Spalten und der
 * Fertigung sind Christians Fassungen vom 16./17.09.2026 (product-pages/QiMaster.jsx im
 * DACH-Laden); die Abschnitte Literatur, 6G und Persoenlichkeitsentwicklung lesen ihre Texte aus
 * app/data/qi-master/qi-master-texte.js, das byte-gleich aus dem Bestand kommt (K1).
 *
 * WAS BEWUSST FEHLT: der Google-Bewertungsbereich (markenweite Zahlen) und der Upsell-Block
 * (andere Produkte) -- qi-master.de ist eine Zwei-Seiten-Homepage fuer ein Stueck. Und der
 * Deutungsabsatz vom 18.09. ("Unsere Deutung / Zwischen der Ueberlieferung und dem
 * Fundament ...") ist im Bestand ersatzlos gestrichen und kommt hier nicht zurueck.
 */

export function MainFeatures() {
  return (
    <section className="qm-features" data-section="qm-features">
      <h2 className="qm-h2">Qi Master® - Eine bisher unerreichte Liga</h2>
      <div className="qm-features__spalten">
        <div className="qm-features__spalte">
          <h3>Der Gitterchip™ der ultimativen Generation</h3>
          <p>
            Der Kern des Qi Master® ist ein zweiteiliger Gitterchip™, definiert durch die über
            ein Jahrzehnt andauernde Forschung am QiOne®. Das Ergebnis ist die
            außergewöhnlichste Erscheinung: Eine Goldlegierung, deren Atome in einer einmalig
            definierten Ordnung stehen. Kohärent wirkend und ihre Umgebung aktiv prägend.
          </p>
        </div>
        <div className="qm-features__spalte">
          <h3>{'"The One Eye" - Hochreiner Natur Diamant'}</h3>
          <p>
            Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede Zelle deines
            Körpers gebaut ist. Alles Leben, so wie wir es auf der Erde kennen, basiert auf
            Kohlenstoff. „Die Kohlenstoffatome im Diamanten senden also auf den richtigen
            Frequenzen, die die Kohlenstoffatome in biologischem Material empfangen können.“ -
            Dr. Michael König
          </p>
        </div>
        <div className="qm-features__spalte">
          <h3>Pure Leistung. Pure Entspannung.</h3>
          <p>
            Durch dieses einmalige Duett des Gitterchips™ und {'"The One Eye"'} ist der Qi Master®
            auf jegliche erdenkbare Zukunft vorbereitet. Egal ob sie 6G, Umweltgifte oder
            Schicksalsschläge lautet. Der Qi Master® leistet auf jeder Ebene das erdenkliche
            Maximum.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Guetezeichen() {
  return (
    <section className="qm-guete" data-section="qm-guete">
      <ul className="qm-guete__liste">
        {QIMASTER_GUETEZEICHEN.map((zeichen) => (
          <li className="qm-guete__punkt" key={zeichen.id}>
            <svg
              className="qm-guete__symbol"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {zeichen.pfade.map((d) => (
                <path d={d} key={d} />
              ))}
            </svg>
            <span className="qm-guete__text">{zeichen.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Rohdiamant und Brillant -- links roh, rechts geschliffen; Ueberschrift "The One Eye". */
export function DiamantBilder({mitTitel = true, klein = false}) {
  return (
    <section
      className={`qm-diamantbilder${klein ? ' qm-diamantbilder--klein' : ''}`}
      data-section="qm-diamantbilder"
    >
      {mitTitel ? <h2 className="qm-h2">{QIMASTER_DIAMANTBILDER_TITEL}</h2> : null}
      <div className="qm-diamantbilder__paar">
        {QIMASTER_DIAMANTBILDER.map((bild) => (
          <figure className="qm-diamantbild" key={bild.id}>
            <img
              className="qm-diamantbild__bild"
              src={bild.src}
              width={bild.breite}
              height={bild.hoehe}
              alt={bild.alt}
              data-herkunft={bild.herkunft}
              loading={klein ? 'eager' : 'lazy'}
              decoding="async"
            />
            <figcaption className="qm-diamantbild__unterschrift">{bild.unterschrift}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Literatur: Kohlenstoff, Gitter, Kohaerenz, Zelle -- nummeriert aus der Reihenfolge, nie aus dem Text. */
export function Literatur() {
  const t = QIMASTER_DIAMANT;
  return (
    <section className="qm-sektion" id="literatur" data-section="qm-literatur">
      <div className="qm-sektion__inner">
        <h2 className="qm-h2">{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        {t.befunde.map((b, i) => (
          <div key={b.id} className="qm-befund">
            <h3>{`${i + 1}. ${b.titel}`}</h3>
            {b.label ? (
              <span className={`qm-label${b.beleg ? ' qm-label--beleg' : ''}`}>{b.label}</span>
            ) : null}
            {b.absaetze.map((abs) => (
              <p key={abs.slice(0, 40)}>{abs}</p>
            ))}
            {b.zitat ? (
              <blockquote className="qm-zitat">
                <p>{b.zitat}</p>
                <span className="qm-quelle">{b.quelle}</span>
              </blockquote>
            ) : b.quelle ? (
              <span className="qm-quelle">{b.quelle}</span>
            ) : null}
            {QIMASTER_LITERATURBILDER[b.id] ? (
              <img
                className="qm-literaturbild"
                src={QIMASTER_LITERATURBILDER[b.id].src}
                width={QIMASTER_LITERATURBILDER[b.id].breite}
                height={QIMASTER_LITERATURBILDER[b.id].hoehe}
                alt={QIMASTER_LITERATURBILDER[b.id].alt}
                data-herkunft={QIMASTER_LITERATURBILDER[b.id].herkunft}
                loading="lazy"
                decoding="async"
              />
            ) : null}
          </div>
        ))}
        <div className="qm-schluss">
          {t.schluss.map((zeile) => (
            <p key={zeile}>{zeile}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SechsG() {
  const t = QIMASTER_SECHS_G;
  return (
    <section className="qm-sektion qm-sektion--flaeche" id="sechs-g" data-section="qm-6g">
      <div className="qm-sektion__inner">
        <h2 className="qm-h2">{t.titel}</h2>
        {t.absaetze.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
        <ul className="qm-quellen">
          {t.quellen.map((q) => (
            <li key={q.slice(0, 4)}>{q}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Persoenlichkeit() {
  const t = QIMASTER_PERSOENLICHKEIT;
  return (
    <section className="qm-sektion" id="persoenlichkeitsentwicklung" data-section="qm-persoenlichkeit">
      <div className="qm-sektion__inner">
        <h2 className="qm-h2">{t.titel}</h2>
        {t.einstieg.map((abs) => (
          <p key={abs.slice(0, 40)}>{abs}</p>
        ))}
      </div>
      <div className="qm-zweispalt">
        <div className="qm-spalte">
          <span className="qm-label">{t.ueberlieferung.label}</span>
          <h3>{t.ueberlieferung.titel}</h3>
          {t.ueberlieferung.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
          {t.ueberlieferung.zitate.map((z) => (
            <blockquote className="qm-zitat" key={z.quelle}>
              <p>{z.text}</p>
              <span className="qm-quelle">{z.quelle}</span>
            </blockquote>
          ))}
        </div>
        <div className="qm-spalte">
          <span className="qm-label qm-label--beleg">{t.fundament.label}</span>
          <h3>{t.fundament.titel}</h3>
          {t.fundament.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Fertigung() {
  return (
    <section className="qm-fertigung" data-section="qm-fertigung">
      <h2 className="qm-h2">Ein Stück, kein Serienteil.</h2>
      <div className="qm-fertigung__spalten">
        <div className="qm-fertigung__spalte">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path></svg>{' '}
            Eigene Seriennummer
          </h3>
          <p>Jeder Qi Master® ist nummeriert – ein Stück, das es nur einmal gibt.</p>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"></path></svg>{' '}
            750er Gold
          </h3>
          <p>Kette und Verschluss aus 750er Gold, beide mit Qi-Blanco-Logo.</p>
        </div>
        <div className="qm-fertigung__spalte">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"></path></svg>{' '}
            Diamanten
          </h3>
          <p>Echte Diamanten – reiner Kohlenstoff, gefasst am Gitterchip™.</p>
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-8a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path></svg>{' '}
            Die Iris: 108 Striche
          </h3>
          <p>
            Rund um das Auge des Qi Master® laufen 108 Striche – die Zahl, die in der
            Yoga-Überlieferung für Vollständigkeit steht.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Der Banner "Dein Qi Master® begleitet dich Tag und Nacht." mit Sprung zur Kaufbox oder Kaufseite. */
export function Begleiter({href = '#qm-buybox', text = 'Hole dir deinen Qi Master®'}) {
  return (
    <section className="qm-begleiter" data-section="qm-begleiter">
      <div className="qm-begleiter__inner">
        <h2 className="qm-h2 qm-begleiter__titel">
          Dein Qi Master® begleitet dich
          <br />
          Tag und Nacht.
        </h2>
        <p className="qm-begleiter__unterzeile">Ein Stück, das du nicht ablegen musst.</p>
        <a className="qm-btn qm-btn--primary" href={href} data-qa="cta">
          {text}
        </a>
      </div>
    </section>
  );
}
