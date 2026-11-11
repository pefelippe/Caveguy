import { useQuery } from '@apollo/client/react';
import { MoneyHomeDocument } from '@zapbots/graphql/client';

import { PageSkeleton } from '@zapbots/ui/blocks/page-skeleton';
import { Card } from '@zapbots/ui/components/card';
import { cn } from '@zapbots/ui/lib/utils';

import { BotPage } from '../components/BotPage';
import { FormError } from '../components/FormError';
import { localToday } from '../lib/bots';
import { formatCents } from '../lib/format';
import { previousMonth } from '../lib/overview';

const monthName = (yearMonth: string) =>
  new Date(`${yearMonth}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long' });

/**
 * Categorias: where the month's money went, each category against the last month and, when it has
 * one, its Limite de categoria (Avisos at 80% and past it).
 */
export function CategoriesPage() {
  const month = localToday().slice(0, 7);
  const previous = previousMonth(month);
  // The Visão geral's query: moving between the two tabs reads it once.
  const { data, error } = useQuery(MoneyHomeDocument, {
    fetchPolicy: 'cache-and-network',
    variables: { month, monthlyExtraCents: 30_000, previous },
  });
  const holder = data?.viewerHolder;
  if (error && !holder) return <FormError error={error} />;
  if (!holder) return <PageSkeleton />;

  const before = new Map(holder.previousSpending.map(item => [item.category, item.amountCents]));
  const limits = new Map(holder.categoryLimits.map(item => [item.category, item]));
  const names = [
    ...new Set([
      ...holder.spending.map(item => item.category),
      ...holder.categoryLimits.map(item => item.category),
    ]),
  ];
  const now = new Map(holder.spending.map(item => [item.category, item.amountCents]));
  const total = holder.spending.reduce((sum, item) => sum + item.amountCents, 0);
  const top = Math.max(...names.map(name => now.get(name) ?? 0), 1);

  return (
    <BotPage
      bot="FINANCE"
      description={`Para onde foi o dinheiro em ${monthName(month)}, comparado com ${monthName(previous)}.`}
      title="Categorias"
    >
      <p className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-[-0.03em] tabular-nums">
        {formatCents(total)}
      </p>
      <Card className="gap-0 p-0">
        {names.length === 0 ? (
          <p className="p-6 text-muted-foreground">Nenhum gasto neste mês ainda.</p>
        ) : (
          <ul>
            {names.map(name => {
              const cents = now.get(name) ?? 0;
              const last = before.get(name) ?? 0;
              const change = last ? cents / last - 1 : null;
              const limit = limits.get(name);
              const share = limit ? cents / limit.limitCents : null;
              return (
                <li className="flex flex-col gap-2 border-b px-6 py-4 last:border-b-0" key={name}>
                  <div className="flex items-baseline gap-3">
                    <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                    <span
                      className={cn(
                        'text-sm tabular-nums',
                        change === null
                          ? 'text-muted-foreground'
                          : change > 0
                            ? 'text-destructive'
                            : 'text-success'
                      )}
                    >
                      {change === null
                        ? 'novo'
                        : `${change > 0 ? '+' : ''}${Math.round(change * 100)}%`}
                    </span>
                    <span className="w-28 text-right font-medium tabular-nums">
                      {formatCents(cents)}
                    </span>
                  </div>
                  <span className="h-2 rounded-full bg-muted">
                    <span
                      className={cn(
                        'block h-full rounded-full',
                        share !== null && share >= 1 ? 'bg-destructive' : 'bg-foreground'
                      )}
                      style={{ width: `${(cents / top) * 100}%` }}
                    />
                  </span>
                  <span className="flex justify-between text-xs text-muted-foreground">
                    <span>Mês passado: {formatCents(last)}</span>
                    {limit && (
                      <span className={cn(share !== null && share >= 0.8 && 'text-destructive')}>
                        Limite {formatCents(limit.limitCents)} · {Math.round((share ?? 0) * 100)}%
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </BotPage>
  );
}
