import { useQuery } from '@apollo/client/react';
import { MoneyHomeDocument, type MoneyHomeQuery } from '@zapbots/graphql/client';
import { ArrowDownRightIcon, ArrowUpRightIcon, CalendarIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Caveman } from '@zapbots/ui/blocks/caveman';
import { Card } from '@zapbots/ui/components/card';
import { Skeleton } from '@zapbots/ui/components/skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import { FormError } from '../components/FormError';
import { Accounts, Cards, Figure, Tile, useWidth } from '../components/Overview';
import { localToday } from '../lib/bots';
import { formatCents } from '../lib/format';
import {
  byCategory,
  categoryMark,
  cumulative,
  nextCharge,
  niceStep,
  previousMonth,
  spentByDay,
} from '../lib/overview';

type Holder = MoneyHomeQuery['viewerHolder'];
type Expense = Holder['month']['expenses'][number];

/** What the payoff plan tries a month on top of the installments. */
const EXTRA_CENTS = 30_000;

/** "25 nov". */
const dayMonth = (date: string) =>
  new Date(`${date}T12:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');

const monthName = (yearMonth: string) =>
  new Date(`${yearMonth}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long' });

/** A Gasto recorrente filed under Assinatura(s), whatever the case or accents. */
const isSubscription = (category: string | null | undefined) =>
  (category ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .startsWith('assinatura');

/**
 * Finanças' Visão geral, after Pierre's: a word on the month and how fast it is spending,
 * then the accounts, the cards' limit, the days, the categories, the latest Gastos, the
 * Assinaturas and the Parcelamentos, each card leading to its tab.
 */
export function MoneyPage() {
  const today = localToday();
  const month = today.slice(0, 7);
  const { data, error } = useQuery(MoneyHomeDocument, {
    fetchPolicy: 'cache-and-network',
    variables: { month, monthlyExtraCents: EXTRA_CENTS, previous: previousMonth(month) },
  });
  const holder = data?.viewerHolder;

  if (error && !holder) return <FormError error={error} />;
  if (!holder || !data) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1, 2, 3].map(index => (
          <Skeleton className="h-80 rounded-[20px]" key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-2" data-bot="FINANCE">
      <MonthWord holder={holder} today={today} />
      <Pace holder={holder} today={today} />
      <Accounts links={data.bankLinks} />
      <Cards cards={holder.creditCards} />
      <Heatmap holder={holder} today={today} />
      <TopCategories holder={holder} />
      <Recent expenses={[...holder.month.expenses, ...holder.previous.expenses]} today={today} />
      <Subscriptions holder={holder} today={today} />
      <Installments holder={holder} />
    </div>
  );
}

/** How this month compares with the last, up to the same day. */
function paceOf(holder: Holder, today: string) {
  const day = Number(today.slice(8, 10));
  const now = cumulative(spentByDay(holder.month.expenses, holder.month.month));
  const before = cumulative(spentByDay(holder.previous.expenses, holder.previous.month));
  const spent = now[day - 1] ?? 0;
  const sameDay = before[Math.min(day, before.length) - 1] ?? 0;
  return { before, change: sameDay ? spent / sameDay - 1 : null, now, sameDay, spent };
}

/** A word on the month, in plain Portuguese, and three figures under it. */
function MonthWord({ holder, today }: { holder: Holder; today: string }) {
  const { change, spent } = paceOf(holder, today);
  const owed = holder.creditOperations.reduce((sum, item) => sum + item.outstandingBalanceCents, 0);
  const left = holder.creditOperations.reduce(
    (sum, item) => sum + Math.max(item.termMonths - item.paidInstallments, 0),
    0
  );
  const top = byCategory(holder.month.expenses)[0];
  const short = holder.month.balanceCents < 0;
  const word = holder.creditOperations.length
    ? `${left} parcelas ativas somam ${formatCents(owed)} a pagar. Vale ver se dá para quitar alguma antes.`
    : short
      ? `O mês fecha ${formatCents(-holder.month.balanceCents)} no vermelho. Vale olhar os gastos.`
      : `Sobram ${formatCents(holder.month.balanceCents)} em ${monthName(holder.month.month)}. Um bom momento para guardar uma parte.`;

  return (
    <Card className="min-w-0 gap-6">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="font-title text-3xl leading-none tracking-wide text-seal uppercase">
            Seu mês
          </h1>
          <p className="text-lg">{word}</p>
        </div>
        <Caveman mood={short ? 'thinking' : 'happy'} outfit="FINANCE" size={88} />
      </div>
      <dl className="mt-auto grid gap-3 sm:grid-cols-3">
        <Stat label={`Gasto em ${monthName(holder.month.month)}`}>{formatCents(spent)}</Stat>
        <Stat label="vs. mês anterior">
          {change === null ? (
            '—'
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                change > 0 ? 'text-destructive' : 'text-success'
              )}
            >
              {change > 0 ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />}
              {Math.abs(Math.round(change * 100))}%
            </span>
          )}
        </Stat>
        <Stat label="Maior gasto">
          {top ? `${categoryMark(top.category)} ${top.category}` : '—'}
        </Stat>
      </dl>
    </Card>
  );
}

function Stat({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-muted px-4 py-3">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-lg font-semibold tabular-nums [&_svg]:size-4">
        {children}
      </dd>
    </div>
  );
}

const PACE_HEIGHT = 200;
const PACE_PAD = { bottom: 24, left: 52, right: 4, top: 8 };

/** "R$ 9 mil" on the chart's axis. */
const compact = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
});

/**
 * Ritmo de gastos: what went out added up day by day, this month (solid, up to today) against the
 * last (dashed). Pointing at a day shows both; a table says the same to screen readers.
 */
function Pace({ holder, today }: { holder: Holder; today: string }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const { before, change, now, sameDay, spent } = paceOf(holder, today);
  const day = Number(today.slice(8, 10));
  const shown = now.slice(0, day);
  const days = Math.max(now.length, before.length);
  const step = niceStep(Math.max(...shown, ...before, 100));
  const top = step * 4;
  const innerWidth = Math.max(width - PACE_PAD.left - PACE_PAD.right, 1);
  const innerHeight = PACE_HEIGHT - PACE_PAD.top - PACE_PAD.bottom;
  const x = (index: number) => PACE_PAD.left + (index / Math.max(days - 1, 1)) * innerWidth;
  const y = (cents: number) => PACE_PAD.top + (1 - cents / top) * innerHeight;
  const path = (values: number[]) =>
    values.map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`).join(' ');
  const diff = spent - sameDay;

  return (
    <Tile more="ver transações" title="Ritmo de gastos" to="/caishen/entries">
      <div>
        <Figure note={diff > 0 ? 'acima' : 'abaixo'}>{formatCents(Math.abs(diff))}</Figure>
        <p className="mt-1 text-sm text-muted-foreground">
          {change === null
            ? 'Sem gastos no mês passado até este dia.'
            : `${change > 0 ? '+' : ''}${Math.round(change * 100)}% vs. ${formatCents(sameDay)} no mês passado até o dia ${day}`}
        </p>
      </div>
      <div className="relative" ref={ref}>
        {width > 0 && (
          <svg
            aria-hidden
            className="block overflow-visible"
            height={PACE_HEIGHT}
            onPointerLeave={() => setActive(null)}
            width={width}
          >
            {[0, 1, 2, 3, 4].map(index => (
              <g key={index}>
                <line
                  className="stroke-border"
                  strokeDasharray={index ? '3 4' : undefined}
                  x1={PACE_PAD.left}
                  x2={PACE_PAD.left + innerWidth}
                  y1={y(step * index)}
                  y2={y(step * index)}
                />
                <text
                  className="fill-muted-foreground text-[11px]"
                  dominantBaseline="middle"
                  textAnchor="end"
                  x={PACE_PAD.left - 8}
                  y={y(step * index)}
                >
                  {compact.format((step * index) / 100)}
                </text>
              </g>
            ))}
            <path
              className="fill-none stroke-muted-foreground/60"
              d={path(before)}
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeWidth={2}
            />
            <path
              className="fill-none stroke-seal"
              d={path(shown)}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <circle
              className="fill-seal stroke-card"
              cx={x(day - 1)}
              cy={y(shown.at(-1) ?? 0)}
              r={5}
              strokeWidth={2}
            />
            {active !== null && (
              <line
                className="stroke-muted-foreground/40"
                x1={x(active)}
                x2={x(active)}
                y1={PACE_PAD.top}
                y2={PACE_PAD.top + innerHeight}
              />
            )}
            {[0, 14, 24, days - 1].map(index => (
              <text
                className="fill-muted-foreground text-[11px]"
                key={index}
                textAnchor={index === 0 ? 'start' : index === days - 1 ? 'end' : 'middle'}
                x={x(index)}
                y={PACE_HEIGHT - 4}
              >
                {index + 1}
              </text>
            ))}
            {Array.from({ length: days }, (_, index) => (
              <rect
                fill="transparent"
                height={PACE_HEIGHT}
                key={index}
                onPointerEnter={() => setActive(index)}
                width={innerWidth / Math.max(days - 1, 1)}
                x={x(index) - innerWidth / Math.max(days - 1, 1) / 2}
                y={0}
              />
            ))}
          </svg>
        )}
        {active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-xl border bg-popover px-3 py-2 text-sm shadow-md"
            style={{ left: Math.min(Math.max(x(active) - 80, 0), Math.max(width - 160, 0)) }}
          >
            <p className="font-medium">Dia {active + 1}</p>
            {active < day && <p className="tabular-nums">Este mês: {formatCents(now[active])}</p>}
            {before[active] !== undefined && (
              <p className="text-muted-foreground tabular-nums">
                Mês passado: {formatCents(before[active])}
              </p>
            )}
          </div>
        )}
        <table className="sr-only">
          <caption>Gasto acumulado por dia</caption>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Este mês</th>
              <th>Mês passado</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days }, (_, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{index < day ? formatCents(now[index]) : ''}</td>
                <td>{before[index] === undefined ? '' : formatCents(before[index])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-seal" />
          Este mês
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-dashed border-muted-foreground/60" />
          Mês passado
        </span>
      </div>
    </Tile>
  );
}

/** One hue, light to dark: five steps of the seal by share of the biggest day. */
const HEAT = ['bg-muted', 'bg-seal/20', 'bg-seal/40', 'bg-seal/65', 'bg-seal'];

/** Mapa de calor: the month's days so far on a calendar, darker the more went out. */
function Heatmap({ holder, today }: { holder: Holder; today: string }) {
  const all = spentByDay(holder.month.expenses, holder.month.month);
  // The current month stops at today; a past one shows whole.
  const days = today.startsWith(holder.month.month)
    ? all.slice(0, Number(today.slice(8, 10)))
    : all;
  const total = days.reduce((sum, cents) => sum + cents, 0);
  const top = Math.max(...days, 0);
  const biggest = days.indexOf(top);
  // Sunday first: blanks before the 1st.
  const lead = new Date(`${holder.month.month}-01T12:00:00`).getDay();
  const step = (cents: number) => (cents && top ? Math.min(Math.ceil((cents / top) * 4), 4) : 0);

  return (
    <Tile title="Mapa de calor" to="/caishen/entries" more="ver mais">
      <div>
        <Figure>{formatCents(total)}</Figure>
        <p className="mt-1 text-sm text-muted-foreground">
          Média diária: {formatCents(Math.round(total / Math.max(days.length, 1)))}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, index) => (
          <span className="text-center text-xs text-muted-foreground" key={index}>
            {label}
          </span>
        ))}
        {Array.from({ length: lead }, (_, index) => (
          <span key={`lead-${index}`} />
        ))}
        {days.map((cents, index) => (
          <span
            aria-label={`Dia ${index + 1}: ${formatCents(cents)}`}
            className={cn(
              'grid aspect-square place-items-center rounded-md text-[11px] tabular-nums',
              HEAT[step(cents)],
              step(cents) >= 3 ? 'text-white' : 'text-muted-foreground'
            )}
            key={index}
            role="img"
            title={`Dia ${index + 1}: ${formatCents(cents)}`}
          >
            {index + 1}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Menos</span>
        <span className="flex gap-1">
          {HEAT.map(shade => (
            <span className={cn('size-3 rounded-sm', shade)} key={shade} />
          ))}
        </span>
        <span>Mais</span>
      </div>
      {top > 0 && (
        <p className="flex justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Maior gasto</span>
          <span className="font-medium tabular-nums">
            {formatCents(top)} <span className="text-muted-foreground">dia {biggest + 1}</span>
          </span>
        </p>
      )}
    </Tile>
  );
}

/** The month's five biggest categories of Gastos against the last month's, side by side. */
function TopCategories({ holder }: { holder: Holder }) {
  const before = new Map(
    byCategory(holder.previous.expenses).map(item => [item.category, item.amountCents])
  );
  const top = byCategory(holder.month.expenses).slice(0, 5);
  const scale = Math.max(
    ...top.map(item => Math.max(item.amountCents, before.get(item.category) ?? 0)),
    1
  );
  return (
    <Tile more="ver mais" title="Principais categorias" to="/caishen/categories">
      {top.length === 0 ? (
        <p className="text-muted-foreground">Nenhum gasto neste mês ainda.</p>
      ) : (
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="w-[45%] pb-2 text-left font-normal sm:w-[36%]">Categoria</th>
              <th className="pb-2 text-right font-normal">Atual</th>
              <th className="hidden w-[20%] pb-2 pl-4 text-left font-normal sm:table-cell">
                vs. anterior
              </th>
              <th className="pb-2 text-right font-normal">Variação</th>
              <th className="hidden pb-2 text-right font-normal sm:table-cell">Anterior</th>
            </tr>
          </thead>
          <tbody>
            {top.map(item => {
              const previous = before.get(item.category) ?? 0;
              const change = previous ? item.amountCents / previous - 1 : null;
              return (
                <tr className="border-t" key={item.category}>
                  <td className="truncate py-2.5 pr-3">
                    <span aria-hidden className="mr-2">
                      {categoryMark(item.category)}
                    </span>
                    {item.category}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums">
                    {formatCents(item.amountCents)}
                  </td>
                  <td aria-hidden className="hidden py-2.5 pl-4 sm:table-cell">
                    <span className="flex flex-col gap-1">
                      <span
                        className="h-1.5 rounded-full bg-seal"
                        style={{ width: `${(item.amountCents / scale) * 100}%` }}
                      />
                      <span
                        className="h-1.5 rounded-full bg-muted-foreground/30"
                        style={{ width: `${(previous / scale) * 100}%` }}
                      />
                    </span>
                  </td>
                  <td
                    className={cn(
                      'py-2.5 text-right tabular-nums',
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
                  </td>
                  <td className="hidden py-2.5 text-right text-muted-foreground tabular-nums sm:table-cell">
                    {formatCents(previous)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Tile>
  );
}

/** "Hoje", "Ontem" or "Dom, 08 nov". */
function dayTitle(date: string, today: string): string {
  const at = new Date(`${today}T12:00:00`);
  at.setDate(at.getDate() - 1);
  if (date === today) return 'Hoje';
  if (date === at.toLocaleDateString('sv-SE')) return 'Ontem';
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  });
}

/** Transações recentes: the latest Gastos of this month and the last, by day, with their category. */
function Recent({ expenses, today }: { expenses: Expense[]; today: string }) {
  const latest = expenses
    .filter(expense => !expense.ownTransfer)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
  const days: { date: string; items: Expense[] }[] = [];
  for (const expense of latest) {
    const last = days.at(-1);
    if (last?.date === expense.date) last.items.push(expense);
    else days.push({ date: expense.date, items: [expense] });
  }
  return (
    <Tile title="Transações recentes" to="/caishen/entries">
      {days.length === 0 ? (
        <p className="text-muted-foreground">Nenhum gasto nos últimos dois meses.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {days.map(day => (
            <section key={day.date}>
              <h3 className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
                {dayTitle(day.date, today)}
              </h3>
              <ul className="flex flex-col">
                {day.items.map(item => (
                  <li className="flex items-center gap-3 py-1.5" key={item.id}>
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted"
                    >
                      {categoryMark(item.category)}
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate">{item.description}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.category || 'Sem categoria'}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      -{formatCents(item.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Tile>
  );
}

/** Assinaturas: what they take a month, the next three to be charged and how many more. */
function Subscriptions({ holder, today }: { holder: Holder; today: string }) {
  const active = holder.recurringExpenses
    .filter(item => isSubscription(item.category))
    .map(item => ({ item, next: nextCharge(item, today) }))
    .filter(({ next }) => next !== null)
    .sort((a, b) => a.next!.localeCompare(b.next!));
  const perMonth = active.reduce(
    (sum, { item }) =>
      sum + (item.cycle === 'YEARLY' ? Math.round(item.amountCents / 12) : item.amountCents),
    0
  );
  return (
    <Tile title="Assinaturas" to="/caishen/subscriptions">
      <Figure note={`/mês · ${active.length} ${active.length === 1 ? 'ativa' : 'ativas'}`}>
        {formatCents(perMonth)}
      </Figure>
      {active.length === 0 ? (
        <p className="text-muted-foreground">
          Cadastre um gasto recorrente com a categoria Assinaturas.
        </p>
      ) : (
        <ul className="flex flex-col">
          {active.slice(0, 3).map(({ item, next }) => (
            <li className="flex items-center gap-3 py-2" key={item.id}>
              <span className="grid min-w-0 flex-1">
                <span className="truncate font-medium">{item.description}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  Próximo: {dayMonth(next!)}
                </span>
              </span>
              <span className="font-medium tabular-nums">{formatCents(item.amountCents)}</span>
            </li>
          ))}
        </ul>
      )}
      {active.length > 3 && (
        <Link
          className="border-t pt-3 text-sm text-muted-foreground hover:text-foreground"
          to="/caishen/subscriptions"
        >
          +{active.length - 3} {active.length - 3 === 1 ? 'assinatura' : 'assinaturas'}
        </Link>
      )}
    </Tile>
  );
}

/** Parcelamentos: what is left to pay, the debts by balance and when they end with the plan. */
function Installments({ holder }: { holder: Holder }) {
  const operations = [...holder.creditOperations].sort(
    (a, b) => b.outstandingBalanceCents - a.outstandingBalanceCents
  );
  const owed = operations.reduce((sum, item) => sum + item.outstandingBalanceCents, 0);
  const monthly = operations.reduce((sum, item) => sum + item.installmentCents, 0);
  return (
    <Tile className="lg:col-span-2" title="Parcelamentos" to="/caishen/installments">
      <Figure note={operations.length ? `a pagar · ${formatCents(monthly)}/mês` : undefined}>
        {formatCents(owed)}
      </Figure>
      {operations.length === 0 ? (
        <p className="text-muted-foreground">Nenhum empréstimo ou financiamento.</p>
      ) : (
        <>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {operations.slice(0, 6).map(item => (
              <li key={item.id}>
                <Link
                  className="flex items-center gap-3 border-b py-2.5 hover:underline"
                  to={`/caishen/operations/${item.id}`}
                >
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.paidInstallments} de {item.termMonths} pagas
                    </span>
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCents(item.outstandingBalanceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {holder.payoffPlan.debtFreeOn && (
            <p className="text-sm text-muted-foreground">
              Com {formatCents(EXTRA_CENTS)} a mais por mês, você fica livre em{' '}
              {new Date(`${holder.payoffPlan.debtFreeOn}T12:00:00`).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
              .{' '}
              <Link className="font-medium text-seal hover:underline" to="/caishen/payoff">
                Montar plano
              </Link>
            </p>
          )}
        </>
      )}
    </Tile>
  );
}
