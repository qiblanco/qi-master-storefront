import {QIMASTER_STUDIEN} from '~/data/qi-master/qi-master-studien';
import {QIMASTER_ZELLWERTE} from '~/data/qi-master/qi-master-texte';
import {qiblancoUrl} from '~/lib/kaufweg';

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
  'September', 'Oktober', 'November', 'Dezember'];

function veroeffentlichtLang(wert) {
  const s = String(wert || '');
  const voll = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (voll) return `am ${Number(voll[3])}. ${MONATE[Number(voll[2]) - 1]} ${voll[1]}`;
  const jahr = /^(\d{4})/.exec(s);
  return jahr ? jahr[1] : '';
}

/**
 * Die publizierten Zellstudien -- Beleg-Kacheln, jede ein Link auf ihren Volltext bei qiblanco.com
 * (/pages/<slug>). Der Beweis-Ort bleibt erreichbar, die Studie wird nicht ein zweites Mal
 * gefuehrt. Ueberschrift wie auf der Kaufseite drueben (Christian, 2026-09-16): sie sagt, WAS die
 * Studien sind, nicht, woran sie gemessen wurden.
 *
 * KEIN Karussell, keine Pfeile: fuenf Kacheln in einem Raster, das auf dem Telefon zu einer
 * Spalte wird. Jede Kachel steht als echtes <a> im Markup -- crawlbar, ohne JavaScript.
 *
 * ZELLWERTE (mitZellwerte): unter den Kacheln die gemessenen Werte, wie drueben unter den
 * Studienkacheln der Kaufseite (data-block="qm-zellwerte", PR #645). Der Wortlaut kommt aus
 * dem Bestand (QIMASTER_ZELLWERTE, K1 aus qi-master-texte.js), nicht aus diesem Markup --
 * aendert Christian ihn drueben, zieht der Aufloeser ihn hierher nach. Nur die Kaufseite gibt
 * den Schalter: ihre Marken [8]/[9] zeigen auf die Quellenliste im 6G-Abschnitt, und den hat
 * nur sie. Auf der Frontseite zeigten sie ins Leere.
 * Gemessen: pruefungen/probe_zellwerte_ausgeliefert.py.
 */
export function Studien({
  request,
  headline = 'Publizierte Zellstudien zum Gitterchip™',
  mitZellwerte = false,
}) {
  return (
    <section className="qm-studien" data-section="qm-studien">
      <h2 className="qm-h2">{headline}</h2>
      <ul className="qm-studien__raster">
        {QIMASTER_STUDIEN.map((s) => {
          const e = s.eckdaten || {};
          const zeile1 = s.kachel?.zeile1 || e.titelDeutsch || s.h1 || '';
          const zeile2 = s.kachel?.zeile2 ||
            [e.journal ? `veröffentlicht in ${e.journal}` : '', veroeffentlichtLang(e.veroeffentlicht)]
              .filter(Boolean).join(' ');
          return (
            <li className="qm-studie" key={s.id}>
              <a className="qm-studie__link" href={qiblancoUrl(`/pages/${s.slug}`, request)}>
                <span className="qm-studie__deckblatt">
                  <img
                    src={e.coverUrl}
                    width={e.coverMasse?.w}
                    height={e.coverMasse?.h}
                    alt={`Titelseite der Publikation „${e.titelOriginal}“ im ${e.journal}`}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="qm-studie__titel">{zeile1}</span>
                <span className="qm-studie__quelle">{zeile2}</span>
              </a>
            </li>
          );
        })}
      </ul>
      {mitZellwerte ? (
        <div className="qm-sektion__inner qm-zellwerte" data-block="qm-zellwerte">
          <span className="qm-label qm-label--beleg">{QIMASTER_ZELLWERTE.label}</span>
          {QIMASTER_ZELLWERTE.absaetze.map((abs) => (
            <p key={abs.slice(0, 40)}>{abs}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
