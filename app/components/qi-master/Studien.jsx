import {QIMASTER_STUDIEN} from '~/data/qi-master/qi-master-studien';
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
 * KEIN ZELLWERTE-BLOCK: CHRISTIAN 2026-09-28 ERSATZLOS GESTRICHEN. Vom 2026-09-27 bis
 * 2026-09-28 stand hier unter den Kacheln der Block „Gemessen" (Schalter mitZellwerte, Wortlaut
 * QIMASTER_ZELLWERTE aus qi-master-texte.js drueben). Christian hat ihn drueben ersatzlos
 * gestrichen und den AI-CEO-Entscheid vom 2026-09-26 aufgehoben; der Export existiert dort nicht
 * mehr. Nicht wieder einbauen. Job 20260928-update-qimaster-seite-streichungen-christian.
 */
export function Studien({
  request,
  headline = 'Publizierte Zellstudien zum Gitterchip™',
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
    </section>
  );
}
