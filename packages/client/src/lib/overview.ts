/** The Visão geral's sums, pure so they can be tested: spending by day and the next charges. */

interface Spent {
  amountCents: number;
  date: string;
  ownTransfer?: boolean;
}

/** Days in a month (`YYYY-MM`). */
export function daysIn(month: string): number {
  const [year, index] = month.split('-').map(Number);
  return new Date(year!, index!, 0).getDate();
}

/** The month before (`YYYY-MM`). */
export function previousMonth(month: string): string {
  const [year, index] = month.split('-').map(Number);
  const at = new Date(year!, index! - 2, 15);
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}`;
}

/** What went out each day of the month, index 0 the 1st; moves between own accounts left out. */
export function spentByDay(expenses: Spent[], month: string): number[] {
  const days = new Array<number>(daysIn(month)).fill(0);
  for (const expense of expenses) {
    if (expense.ownTransfer || !expense.date.startsWith(month)) continue;
    days[Number(expense.date.slice(8, 10)) - 1]! += expense.amountCents;
  }
  return days;
}

/** The running total of `spentByDay`. */
export function cumulative(days: number[]): number[] {
  let total = 0;
  return days.map(day => (total += day));
}

interface Charge {
  cycle: 'MONTHLY' | 'YEARLY' | string;
  dueDay: number;
  dueMonth?: number | null;
  endsOn?: string | null;
}

/** The next day (`YYYY-MM-DD`) a Gasto recorrente is charged from `today` on, or `null` once it
 * ended. A due day past the month's end falls on its last day. */
export function nextCharge(charge: Charge, today: string): string | null {
  const [year, month] = today.split('-').map(Number) as [number, number];
  const on = (y: number, m: number) => {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    return `${key}-${String(Math.min(charge.dueDay, daysIn(key))).padStart(2, '0')}`;
  };
  let next: string;
  if (charge.cycle === 'YEARLY' && charge.dueMonth) {
    next = on(year, charge.dueMonth);
    if (next < today) next = on(year + 1, charge.dueMonth);
  } else {
    next = on(year, month);
    if (next < today) next = month === 12 ? on(year + 1, 1) : on(year, month + 1);
  }
  return charge.endsOn && next >= charge.endsOn ? null : next;
}

/** A round step for a chart's axis, so `count` steps reach at least `max`: 1, 2, 2.5 or 5 times
 * a power of ten. */
export function niceStep(max: number, count = 4): number {
  const raw = Math.max(max, 1) / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].find(step => step * power >= raw) ?? 10) * power;
}

/** What is still free on a Cartão: its limit less what the bank says is in use, or else the
 * open Fatura; never below zero. */
export function availableCents(limitCents: number, usedCents: number): number {
  return Math.max(limitCents - usedCents, 0);
}

interface Categorized extends Spent {
  category?: string | null;
}

/** Each category's spending in a month, biggest first; Gastos with none go under Outros. */
export function byCategory(expenses: Categorized[]): { amountCents: number; category: string }[] {
  const sums = new Map<string, number>();
  for (const expense of expenses) {
    if (expense.ownTransfer) continue;
    const category = expense.category?.trim() || 'Outros';
    sums.set(category, (sums.get(category) ?? 0) + expense.amountCents);
  }
  return [...sums]
    .map(([category, amountCents]) => ({ amountCents, category }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

/** A mark for a category, found by the words in its name, as Pierre shows beside each line. */
const MARKS: [RegExp, string][] = [
  [/restaurante|bar|lanche|ifood|delivery|aliment|comida/, '🍽️'],
  [/mercado|supermercado|feira|padaria/, '🛒'],
  [/transporte|uber|99|combust|gasolina|estacion|pedagio|carro|veiculo/, '🚗'],
  [/saude|farmacia|hospital|clinica|medic|laborat/, '💊'],
  [/moradia|aluguel|condominio|casa|luz|energia|agua|\bgas\b|internet|telecom|telefon/, '🏠'],
  [/assinatura|streaming|digita/, '📺'],
  [/emprest|financ|parcela|juros|divida/, '💰'],
  [/transfer|pix/, '💸'],
  [/educa|curso|escola|faculdade|livro/, '📚'],
  [/lazer|viagem|cinema|show|jogo/, '🎉'],
  [/roupa|vestu|compra|shopping|loja|infantil/, '🛍️'],
  [/pet|veterin/, '🐾'],
  [/imposto|taxa|tarifa|banco|iof/, '🧾'],
  [/investimento|poupanca|caixinha/, '📈'],
];

export function categoryMark(category: string | null | undefined): string {
  const name = (category ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return MARKS.find(([words]) => words.test(name))?.[1] ?? '📦';
}
