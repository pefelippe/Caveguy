import type { HomeOverviewQuery } from '@zapbots/graphql/client';
import { ArrowUpRightIcon, WalletIcon, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card } from '@zapbots/ui/components/card';
import { cn } from '@zapbots/ui/lib/utils';

import { localToday } from '../lib/bots';
import { formatCents } from '../lib/format';
import { availableCents, nextCharge } from '../lib/overview';

type Holder = HomeOverviewQuery['viewerHolder'];
type BankLink = HomeOverviewQuery['bankLinks'][number];
type CreditCard = Holder['creditCards'][number];

/** "out/26". */
const shortMonth = (month: string) =>
  new Date(`${month}-15T12:00:00`)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('. de ', '/')
    .replace(' de ', '/');

/** "outubro de 2026". */
const longMonth = (month: string) =>
  new Date(`${month}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

/** A card of the Visão geral, after Meu Pluggy's: a small title with its icon, a large figure. */
function OverviewCard({
  children,
  className,
  figure,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  figure: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Card className={cn('gap-0 overflow-hidden p-0', className)}>
      <div className="flex flex-col gap-1 px-6 pt-6 pb-5">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4 text-primary" />
          {title}
        </p>
        <p className="mt-1 font-display text-4xl font-light tracking-[-0.022em] tabular-nums">
          {figure}
        </p>
      </div>
      <div className="flex-1 border-t">{children}</div>
    </Card>
  );
}

/** A card of the Visão geral, after Pierre's: a small title, "ver todas" to its tab, then what it holds. */
export function Tile({
  children,
  className,
  more,
  title,
  to,
}: {
  children: ReactNode;
  className?: string;
  more?: string;
  title: string;
  to?: string;
}) {
  return (
    <Card className={cn('min-w-0 gap-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {to && (
          <Link
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-seal hover:underline"
            to={to}
          >
            {more ?? 'ver todas'}
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}

/** The card's large figure, with a short note after it. */
export function Figure({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-display text-4xl tracking-[-0.022em] tabular-nums">{children}</span>
      {note && <span className="text-sm text-muted-foreground">{note}</span>}
    </p>
  );
}

/** A square with the first letter of a bank or card, where Pierre shows its logo. */
function Initial({ name }: { name: string }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted font-medium text-muted-foreground uppercase">
      {name.trim().charAt(0)}
    </span>
  );
}

/** The bank accounts linked through Open Finance, one line each, and their total (docs/adr/0020). */
export function Accounts({ links }: { links: BankLink[] }) {
  const accounts = links.flatMap(link =>
    link.accounts
      .filter(account => account.kind === 'BANK')
      .map(account => ({ account, institution: link.institution }))
  );
  const total = accounts.reduce((sum, { account }) => sum + (account.balanceCents ?? 0), 0);
  return (
    <Tile title="Contas correntes" to="/integrations#finance">
      <Figure note="saldo total">{formatCents(total)}</Figure>
      {accounts.length ? (
        <>
          <ul className="flex flex-col">
            {accounts.map(({ account, institution }) => (
              <li className="flex items-center gap-3 py-2" key={account.id}>
                <Initial name={institution} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{institution}</span>
                  <span className="truncate text-xs text-muted-foreground">{account.name}</span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatCents(account.balanceCents ?? 0)}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t pt-3 text-sm text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ligue seu banco pelo Open Finance em{' '}
          <Link className="text-primary hover:underline" to="/integrations#finance">
            Integrações
          </Link>{' '}
          e os saldos aparecem aqui.
        </p>
      )}
    </Tile>
  );
}

/** The Fatura to pay next: the first one due from today on, or else the latest. */
function openStatement(card: CreditCard) {
  const today = localToday();
  const byDue = [...card.statements].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return byDue.find(statement => statement.dueDate >= today) ?? byDue.at(-1);
}

/** "25 nov". */
const dayMonth = (date: string) =>
  new Date(`${date}T12:00:00`)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace(' de ', ' ')
    .replace('.', '');

/** The Cartões' limit still free, in all and one by one, with the day each is due. */
export function Cards({ cards }: { cards: CreditCard[] }) {
  const today = localToday();
  const rows = cards.map(card => {
    const statement = openStatement(card);
    // What the bank says is in use (installments to come included), or else the open Fatura.
    const used = card.usedCents ?? statement?.amountCents ?? 0;
    return {
      available: availableCents(card.limitCents, used),
      card,
      due: nextCharge({ cycle: 'MONTHLY', dueDay: card.dueDay }, today),
      statement,
    };
  });
  const limit = cards.reduce((sum, card) => sum + card.limitCents, 0);
  const available = rows.reduce((sum, row) => sum + (row.card.limitCents ? row.available : 0), 0);
  return (
    <Tile title="Limite total disponível" to="/caishen/cards">
      <Figure note={limit ? `de ${formatCents(limit)} de limite total` : undefined}>
        {formatCents(available)}
      </Figure>
      {cards.length ? (
        <ul className="flex flex-col">
          {rows.map(({ available: free, card, due, statement }) => (
            <li className="flex items-center gap-3 py-2" key={card.id}>
              <Initial name={card.issuer || card.name} />
              <span className="grid min-w-0 flex-1">
                <span className="truncate font-medium">{card.name}</span>
                <span className="text-xs text-muted-foreground">
                  {due ? `Vence ${dayMonth(due)}` : `Vence dia ${card.dueDay}`}
                </span>
              </span>
              <span className="grid text-right">
                <span className="font-medium tabular-nums">
                  {formatCents(card.limitCents ? free : (statement?.amountCents ?? 0))}
                </span>
                <span className="text-xs text-muted-foreground">
                  {card.limitCents ? 'disponível' : 'na fatura'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Cadastre seus Cartões em{' '}
          <Link className="text-primary hover:underline" to="/caishen/cards">
            Cartões
          </Link>{' '}
          para acompanhar as Faturas e o limite.
        </p>
      )}
    </Tile>
  );
}

const CHART_HEIGHT = 200;
const PAD = { bottom: 28, left: 8, right: 8, top: 12 };

/** The width the element has now, following it as the window or the panels change. */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/**
 * Evolução do saldo: what was left each month, added up over the last twelve, as one line with the
 * area under it. One series, so its title names it and no legend is needed; pointing at a month
 * shows its own result and the running total, and a table says the same to screen readers.
 */
function Evolution({ months }: { months: Holder['months'] }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  let running = 0;
  const points = months.map(month => {
    running += month.balanceCents;
    return { month: month.month, net: month.balanceCents, total: running };
  });
  const last = points.at(-1);
  const values = [0, ...points.map(point => point.total)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerWidth = Math.max(width - PAD.left - PAD.right, 1);
  const innerHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) =>
    PAD.left + (points.length > 1 ? (index / (points.length - 1)) * innerWidth : innerWidth / 2);
  const y = (value: number) => PAD.top + ((max - value) / span) * innerHeight;
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.total)}`);
  const area = points.length
    ? `${line.join(' ')} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
    : '';
  const shown = active === null ? null : points[active];
  const labels = points.length ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : [];

  return (
    <OverviewCard
      className="md:col-span-2"
      figure={formatCents(last?.total ?? 0)}
      icon={WalletIcon}
      title="Evolução do saldo"
    >
      <p className="px-6 pt-4 text-sm text-muted-foreground">
        O que sobrou somando os meses
        {points[0] ? ` desde ${longMonth(points[0].month)}` : ''}: Receitas menos Compromissos e
        Gastos.
      </p>
      <div className="relative px-6 pt-2 pb-5" ref={ref}>
        {width > 0 && points.length > 0 && (
          <svg
            aria-hidden
            className="block overflow-visible"
            height={CHART_HEIGHT}
            onPointerLeave={() => setActive(null)}
            width={width}
          >
            {/* Zero, so a total below it reads at once. */}
            <line
              className="stroke-border"
              strokeDasharray={min < 0 ? '4 4' : undefined}
              x1={PAD.left}
              x2={PAD.left + innerWidth}
              y1={y(0)}
              y2={y(0)}
            />
            <path className="fill-primary/10" d={area} />
            <path
              className="fill-none stroke-primary"
              d={line.join(' ')}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            {shown && active !== null && (
              <>
                <line
                  className="stroke-muted-foreground/40"
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={PAD.top + innerHeight}
                />
                <circle
                  className="fill-primary stroke-card"
                  cx={x(active)}
                  cy={y(shown.total)}
                  r={5}
                  strokeWidth={2}
                />
              </>
            )}
            {labels.map(index => (
              <text
                className="fill-muted-foreground text-[11px]"
                key={index}
                textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                x={x(index)}
                y={CHART_HEIGHT - 6}
              >
                {shortMonth(points[index]!.month)}
              </text>
            ))}
            {/* Hit areas wider than the marks: each month's whole column. */}
            {points.map((point, index) => (
              <rect
                fill="transparent"
                height={CHART_HEIGHT}
                key={point.month}
                onPointerEnter={() => setActive(index)}
                width={innerWidth / Math.max(points.length - 1, 1)}
                x={x(index) - innerWidth / Math.max(points.length - 1, 1) / 2}
                y={0}
              />
            ))}
          </svg>
        )}
        {shown && active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-xl border bg-popover px-3 py-2 text-sm shadow-md"
            // Centered on the month (the chart starts 24px in, past the padding), kept inside.
            style={{
              left: Math.min(Math.max(24 + x(active) - 88, 0), Math.max(width + 48 - 176, 0)),
            }}
          >
            <p className="font-medium capitalize">{longMonth(shown.month)}</p>
            <p className="text-muted-foreground tabular-nums">No mês: {formatCents(shown.net)}</p>
            <p className="tabular-nums">Acumulado: {formatCents(shown.total)}</p>
          </div>
        )}
        <table className="sr-only">
          <caption>Evolução do saldo por mês</caption>
          <thead>
            <tr>
              <th>Mês</th>
              <th>No mês</th>
              <th>Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {points.map(point => (
              <tr key={point.month}>
                <td>{longMonth(point.month)}</td>
                <td>{formatCents(point.net)}</td>
                <td>{formatCents(point.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OverviewCard>
  );
}

/**
 * Visão geral, after Meu Pluggy's Overview: the bank accounts and the Cartões side by side, then
 * how the money left over grew month by month.
 */
export function Overview({ holder, links }: { holder: Holder; links: BankLink[] }) {
  return (
    <section aria-label="Visão geral" className="grid gap-5 md:grid-cols-2">
      <Accounts links={links} />
      <Cards cards={holder.creditCards} />
      <Evolution months={holder.months} />
    </section>
  );
}
