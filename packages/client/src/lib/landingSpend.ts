/**
 * The landing page's example: reads "gastei 32,90 no ifood" the way a visitor types it, in the
 * browser only. Nothing is sent or saved; the real reading is the Agente's (`inputFor` on the server).
 */
export interface SpendGuess {
  cents: number;
  /** Where the money went, as typed, with a capital first letter; `null` when not said. */
  place: string | null;
}

const AMOUNT = /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/i;
const PLACE =
  /\b(?:no|na|nos|nas|em|com|at|on|in|for)\s+(?:o |a |the )?([\p{L}\d][\p{L}\d '&.-]*)$/iu;

/** The amount in cents and the place of a typed spend, or `null` when there is no amount. */
export function readSpend(text: string): SpendGuess | null {
  const amount = AMOUNT.exec(text);
  if (!amount) return null;
  const whole = Number(amount[1]!.replace(/\./g, ''));
  const fraction = Number((amount[2] ?? '0').padEnd(2, '0'));
  const cents = whole * 100 + fraction;
  if (!cents) return null;
  const place = PLACE.exec(text.slice(amount.index + amount[0].length).trim())?.[1]?.trim();
  return { cents, place: place ? place[0]!.toUpperCase() + place.slice(1) : null };
}
