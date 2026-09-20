/**
 * Die Vorverkaufstreppe -- Wortlaut und Bauform der Kaufseite auf qiblanco.com
 * (product-pages/QiMasterTreppe.jsx dort), die Zahlen aus app/data/qi-master/qi-master-preisstufen.json
 * ueber den gemeinsamen Rechenweg app/lib/qi-master-preisstufen.js (beides K1 aus dem Bestand).
 * Welche Stufe laeuft, entscheidet das Serverdatum im Loader, nicht der Browser.
 */
export function Treppe({treppe, titelId = 'qm-treppe-titel', kompakt = false}) {
  const {zeilen, vorlaufHinweis, angebot} = treppe;
  return (
    <section
      className={`qm-treppe${kompakt ? ' qm-treppe--kompakt' : ''}`}
      aria-labelledby={titelId}
      data-section="qm-treppe"
    >
      <h3 id={titelId} className="qm-treppe__titel">
        Hole dir jetzt ein einmaliges Angebot, das es danach nie wieder geben wird!
      </h3>
      <p className="qm-treppe__grund">
        Den Qi Master® wird es nie in einem Sale geben wie Black Friday, Sommer Sale oder
        ähnliches. Durch seine sehr aufwendige Herstellung ist der Preis fixiert. Jeder Qi
        Master® wird von Spezialisten mit jahrzehntelanger Erfahrung Stück für Stück durch die
        Fertigung begleitet. Die finale Politur wird per Hand von Goldschmieden mit
        meisterhafter Genauigkeit durchgeführt. Dadurch können wir stolz von einer
        Herstellqualität sprechen, die weltweit den höchsten Standard übertrifft.
      </p>
      <p className="qm-treppe__herkunft">Designed in Germany. Made in Germany.</p>
      {vorlaufHinweis ? <p className="qm-treppe__vorlauf">{vorlaufHinweis}</p> : null}
      <table className="qm-treppe__tabelle">
        <caption className="qm-nur-sr">
          Die Vorverkaufstreppe des Qi Master® — alle vier Stufen und der reguläre Preis danach.
        </caption>
        <thead>
          <tr>
            <th scope="col">Zeitraum</th>
            <th scope="col">Rabatt</th>
            <th scope="col">Preis</th>
            <th scope="col">Ersparnis</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.id} className={z.aktiv ? 'qm-treppe__zeile qm-treppe__zeile--aktiv' : 'qm-treppe__zeile'}>
              <th scope="row" data-spalte="Zeitraum">
                {z.zeitraum}
                {z.aktiv ? <span className="qm-treppe__marke">läuft jetzt</span> : null}
              </th>
              <td data-spalte="Rabatt">{z.prozent > 0 ? `${z.satzText} %` : '—'}</td>
              <td data-spalte="Preis">
                <span className="qm-treppe__preis">{`${z.preisText} €`}</span>
              </td>
              <td data-spalte="Ersparnis">{z.ersparnisCent === 0 ? '—' : `${z.ersparnisText} €`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {angebot ? (
        <p className="qm-treppe__angebot">
          Sichere dir jetzt dieses einmalige Angebot zum Spitzenpreis und spare{' '}
          {`${angebot.ersparnisText} €`} bei einem Rabatt von {`${angebot.satzText} %`}. Unser
          höchster Rabatt, den wir jemals gegeben haben. Exklusiv für unsere treuesten Kunden.
        </p>
      ) : null}
      <p className="qm-treppe__versand">
        Inklusive zu 100 % versichertem weltweitem Versand. Versand startet ab Mitte Januar 2027.
      </p>
    </section>
  );
}
