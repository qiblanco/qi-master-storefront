/*
 * Geldbetrag in deutscher Schreibweise (10.639,00 €) -- qi-alpha.com, EL-20261027-beafe3d2.
 *
 * Ersetzt <Money> aus @shopify/hydrogen in Warenkorb und Preiszeile: ohne ShopifyProvider
 * formatiert <Money> mit en-US ("€10,639.00"), gemessen in der Warenkorb-Schublade.
 * @param {{data?: {amount: string, currencyCode: string} | null}}
 */
export function Betrag({data}) {
  if (!data?.amount) return null;
  const zahl = Number(data.amount);
  if (!Number.isFinite(zahl)) return null;
  return (
    <span>
      {new Intl.NumberFormat('de-DE', {style: 'currency', currency: data.currencyCode}).format(zahl)}
    </span>
  );
}
