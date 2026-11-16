import { BellIcon, ReceiptIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';

import { formatCents } from '../lib/format';
import { useMoneyHome } from '../lib/moneyHome';

const DAY = 86_400_000;

/** Whole days from one ISO date to another. */
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to.slice(0, 10)}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);

const when = (days: number) =>
  days === 0 ? 'vence hoje' : days === 1 ? 'vence amanhã' : `vence em ${days} dias`;

/** "18/11". */
const dayMonth = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/**
 * The white band atop the Visão geral, after the Nylas console (docs/design-guide.md): the next
 * bill due in a week, as a notice (Depois hides it until the next load), and the month's facts as
 * label and value.
 */
export function MoneyBand() {
  const { data, today } = useMoneyHome();
  const [later, setLater] = useState(false);
  const holder = data?.viewerHolder;
  if (!holder || !data) return null;

  const due = holder.upcomingDues
    .map(item => ({ ...item, days: daysBetween(today, item.dueDate) }))
    .filter(item => item.days >= 0 && item.days <= 7)
    .sort((a, b) => a.days - b.days)[0];
  const banks = [...new Set(data.bankLinks.map(link => link.institution))];
  const month = new Date(`${holder.month.month}-15T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="border-b bg-background print:hidden">
      {/* Lined up with the page under it (`PAGE`). */}
      <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-4 px-4 py-4 sm:px-6 md:px-10 xl:px-16">
        {due && !later && (
          <div className="max-w-3xl overflow-hidden rounded-lg border bg-card text-sm shadow-xs">
            <div className="flex items-start gap-3 border-b border-primary/15 bg-primary/8 px-4 py-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <BellIcon className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-primary">
                  {due.label} {when(due.days)}
                </span>
                <span className="text-[0.8125rem] text-primary/75">
                  O Caveguy separou o que entra nela em Transações.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-md border">
                  <ReceiptIcon className="size-4 text-muted-foreground" />
                </span>
                <span className="truncate font-semibold">{due.label}</span>
                <span className="rounded bg-primary/8 px-1.5 text-xs font-medium text-primary">
                  Vence {dayMonth(due.dueDate)}
                </span>
                <span className="font-semibold tabular-nums">{formatCents(due.amountCents)}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setLater(true)} size="sm" variant="outline">
                  Depois
                </Button>
                <Button asChild size="sm">
                  <Link to="/caishen/entries">Ver em Transações</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        <dl className="flex flex-wrap gap-x-10 gap-y-2">
          <div className="flex gap-1">
            <dt>Mês:</dt>
            <dd className="font-semibold first-letter:uppercase">{month}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Contas:</dt>
            <dd className="font-semibold">{banks.length ? banks.join(', ') : 'nenhuma ligada'}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Sobra do mês:</dt>
            <dd className="font-semibold tabular-nums">{formatCents(holder.month.balanceCents)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
