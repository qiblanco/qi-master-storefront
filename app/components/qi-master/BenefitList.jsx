import {QIMASTER_SYMBOL_PFADE} from '~/lib/qi-master-symbole.generated';

/**
 * Die sechs Nutzen-Zeilen der Kaufbox -- Zeile fuer Zeile wie auf qiblanco.com/products/qi-master
 * (QiMasterBenefitList dort, Stand origin/main 2026-09-20), einschliesslich der gesetzlichen
 * Gewaehrleistung (amtliche EU-Mitteilung als Bild) als fuenftem und "0% Finanzierung" als letztem Punkt (Christian, 2026-09-16).
 * Die vier Symbole sind dieselben Pfade; das sechste kommt aus qi-master-symbole.generated.js (K1).
 */
export function BenefitList() {
  return (
    <div className="qm-benefits">
      <ul>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.23em" height="1em" viewBox="0 0 1728 1408" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M576 1152q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M192 640h384V384H418q-13 0-22 9L201 588q-9 9-9 22zm1280 512q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M1728 64v1024q0 15-4 26.5t-13.5 18.5t-16.5 11.5t-23.5 6t-22.5 2t-25.5 0t-22.5-.5q0 106-75 181t-181 75t-181-75t-75-181H704q0 106-75 181t-181 75t-181-75t-75-181h-64q-3 0-22.5.5t-25.5 0t-22.5-2t-23.5-6t-16.5-11.5T4 1114.5T0 1088q0-26 19-45t45-19V704q0-8-.5-35t0-38t2.5-34.5t6.5-37t14-30.5t22.5-30l198-198q19-19 50.5-32t58.5-13h160V64q0-26 19-45t45-19h1024q26 0 45 19t19 45"></path>
          </svg>
          Weltweit <b>Kostenloser Versand</b>
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.15em" height="1em" viewBox="0 0 2048 1792" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"></path>
          </svg>
          <b>100% Versicherter Versand</b>
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path>
          </svg>
          <b>Nummeriertes Einzelstück</b> mit eigener Seriennummer
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1728 1728" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M1728 864q0 176-68.5 336t-184 275.5t-275.5 184t-336 68.5t-336-68.5t-275.5-184t-184-275.5T0 864q0-213 97-398.5T362 160T736 9v228q-221 45-366.5 221T224 864q0 130 51 248.5t136.5 204t204 136.5t248.5 51t248.5-51t204-136.5t136.5-204t51-248.5q0-230-145.5-406T992 237V9q206 31 374 151t265 305.5t97 398.5"></path>
          </svg>
          <b>20 Tage volles Rückgaberecht</b> nach Erhalt der Ware
        </li>
        <li className="qm-gwl">
          {/* Die gesetzliche Gewaehrleistung -- auf qiblanco.com ein Ausloeser (Wortlaut
              AUSLOESER_TEXT_PDP = 'Gesetzliche Gewährleistung', app/lib/eu-gewaehrleistungslabel.js
              dort), der die amtliche EU-Mitteilung als Bild oeffnet. Hier dieselbe Mitteilung,
              dasselbe Bild (LABEL_ASSETS.de), als <details> ohne JavaScript. Kein eigener
              Wortlaut: eine Pflichtangabe wird gezeigt, nicht umformuliert. */}
          <details className="qm-gwl__details">
            <summary>
              <b>Gesetzliche Gewährleistung</b>
            </summary>
            <img
              className="qm-gwl__bild"
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gewaehrleistungslabel-de.jpg?v=1787678041"
              width="1219"
              height="1668"
              alt="Amtliche Mitteilung zur gesetzlichen Gewährleistung (EU-Label, deutsch)"
              loading="lazy"
              decoding="async"
            />
          </details>
        </li>
        <li>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d={QIMASTER_SYMBOL_PFADE['finanzierung-null']} />
          </svg>
          <b>0% Finanzierung</b> mit PayPal und Klarna
        </li>
      </ul>
    </div>
  );
}
