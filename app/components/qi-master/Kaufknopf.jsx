/**
 * Der Kaufknopf -- ein Link auf qiblanco.com, kein Formular.
 *
 * Er ist ein <a>, damit er ohne JavaScript, im Vorlesen und im Crawler genau das ist, was er
 * tut: ein Wechsel zum DACH-Laden. Wohin, sagt der Text darunter ("Kasse auf qiblanco.com"),
 * denn der Kunde soll den Domainwechsel nicht als Fehler lesen. Kein target=_blank: die Kasse
 * ist der naechste Schritt derselben Reise, nicht ein Nebenfenster.
 *
 * Gibt es keine Adresse (Variante unbekannt), rendert der Knopf NICHTS -- kein deaktivierter
 * Platzhalter, kein Link ins Leere (Befund 2026-09-16 "Hole dir deinen QiMaster springt ins
 * Leere", derselbe Artikel, derselbe Laden).
 */
export function Kaufknopf({href, kompakt = false, text = 'In den Warenkorb'}) {
  if (!href) return null;
  return (
    <div className={`qm-kaufknopf${kompakt ? ' qm-kaufknopf--kompakt' : ''}`}>
      <a className="qm-btn qm-btn--primary" href={href} data-qa="atc" rel="noopener">
        {text}
      </a>
      <p className="qm-kaufknopf__hinweis">
        Warenkorb und Kasse auf qiblanco.com — derselbe Kaufweg wie im Qi-Blanco-Shop.
      </p>
    </div>
  );
}
