import { useMutation, useQuery } from '@apollo/client/react';
import { MoneyHomeDocument, SetCategoryLimitDocument } from '@zapbots/graphql/client';
import { ArrowRightIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zapbots/ui/components/dialog';
import { Input } from '@zapbots/ui/components/input';
import { Progress } from '@zapbots/ui/components/progress';
import { Skeleton } from '@zapbots/ui/components/skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import { BotPage } from '../components/BotPage';
import { FormError } from '../components/FormError';
import { formatCents, formatDate, parseCents } from '../lib/format';

/** What the debts block tries a month on top of the installments; the plan page tries others. */
const EXTRA_CENTS = 30_000;
/** What counts as "due soon" here, as the Avisos count it. */
const DUE_DAYS = 7;

const thisMonth = () => new Date().toLocaleDateString('sv-SE').slice(0, 7);
const monthName = (yearMonth: string) =>
  new Date(`${yearMonth}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long' });
const monthYear = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

/** The Financeiro's own screen links to the rest of Finanças from here. */
const SHORTCUTS = [
  { label: 'Fluxo de caixa', to: '/caishen/entries' },
  { label: 'Entradas', to: '/caishen/income' },
  { label: 'Gastos fixos', to: '/caishen/fixed#recurring' },
  { label: 'Dívidas', to: '/caishen/fixed#loans' },
  { label: 'Cartões', to: '/caishen/fixed#cards' },
];

/**
 * The Financeiro's screen (docs/adr/0035): what is left this month, what falls due in the next
 * days, the Limites de categoria and the debts with their way out. Everything else in Finanças is
 * one tap away, below.
 */
export function MoneyPage() {
  const month = thisMonth();
  const { data, error } = useQuery(MoneyHomeDocument, {
    fetchPolicy: 'cache-and-network',
    variables: { month, monthlyExtraCents: EXTRA_CENTS },
  });
  const holder = data?.viewerHolder;

  return (
    <BotPage
      bot="FINANCE"
      description="Seu mês, o que vence e suas dívidas, num lugar só."
      title="Financeiro"
    >
      {error && !holder ? (
        <FormError error={error} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Block title={`Sobra de ${monthName(month)}`}>
            {holder ? (
              <>
                <p
                  className={cn(
                    'font-display text-5xl tabular-nums',
                    holder.month.balanceCents < 0 && 'text-destructive'
                  )}
                >
                  {formatCents(holder.month.balanceCents)}
                </p>
                <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
                  <Figure label="Entrou" value={holder.month.incomeCents} />
                  <Figure label="Contas" value={holder.month.commitmentsCents} />
                  <Figure label="Gastos" value={holder.month.expensesCents} />
                </dl>
                <More to="/caishen/entries">Ver fluxo de caixa</More>
              </>
            ) : (
              <Lines />
            )}
          </Block>

          <Dues dues={holder?.upcomingDues} />

          <Limits
            holderId={holder?.id}
            limits={holder?.categoryLimits}
            month={month}
            spending={holder?.spending}
          />

          <Block title="Dívidas">
            {!holder ? (
              <Lines />
            ) : holder.creditOperations.length === 0 ? (
              <>
                <p className="text-muted-foreground">Nenhum empréstimo ou financiamento.</p>
                <More to="/caishen/fixed#loans">Cadastrar uma dívida</More>
              </>
            ) : (
              <>
                <p className="font-display text-4xl tabular-nums">
                  {formatCents(
                    holder.creditOperations.reduce(
                      (total, operation) => total + operation.outstandingBalanceCents,
                      0
                    )
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  em {holder.creditOperations.length}{' '}
                  {holder.creditOperations.length === 1 ? 'dívida' : 'dívidas'}, com parcelas de{' '}
                  {formatCents(
                    holder.creditOperations.reduce(
                      (total, operation) => total + operation.installmentCents,
                      0
                    )
                  )}{' '}
                  por mês.
                </p>
                {holder.payoffPlan.debtFreeOn && (
                  <p className="mt-2">
                    Com {formatCents(EXTRA_CENTS)} a mais por mês, você fica livre em{' '}
                    <strong>{monthYear(holder.payoffPlan.debtFreeOn)}</strong>
                    {holder.payoffPlan.debtFreeWithoutPlanOn &&
                      holder.payoffPlan.debtFreeWithoutPlanOn !== holder.payoffPlan.debtFreeOn && (
                        <> (sem isso, {monthYear(holder.payoffPlan.debtFreeWithoutPlanOn)})</>
                      )}
                    {holder.payoffPlan.interestSavedCents > 0 && (
                      <>
                        {' '}
                        e deixa de pagar {formatCents(holder.payoffPlan.interestSavedCents)} de
                        juros
                      </>
                    )}
                    .
                  </p>
                )}
                <More to="/caishen/payoff">Montar plano para sair das dívidas</More>
              </>
            )}
          </Block>
        </div>
      )}

      <nav aria-label="Mais do Financeiro" className="flex flex-wrap gap-2">
        {SHORTCUTS.map(shortcut => (
          <Button asChild key={shortcut.to} variant="outline">
            <Link to={shortcut.to}>{shortcut.label}</Link>
          </Button>
        ))}
      </nav>
    </BotPage>
  );
}

function Block({
  action,
  children,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <Card className="gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold first-letter:uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{formatCents(value)}</dd>
    </div>
  );
}

function More({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link
      className="mt-auto inline-flex items-center gap-1 self-start pt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
      to={to}
    >
      {children}
      <ArrowRightIcon className="size-3.5" />
    </Link>
  );
}

function Lines() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function Dues({
  dues,
}: {
  dues: { amountCents: number; dueDate: string; label: string }[] | undefined;
}) {
  const until = new Date(Date.now() + DUE_DAYS * 86_400_000).toLocaleDateString('sv-SE');
  const soon = dues?.filter(due => due.dueDate <= until);
  return (
    <Block title={`Vence em ${DUE_DAYS} dias`}>
      {!soon ? (
        <Lines />
      ) : soon.length === 0 ? (
        <p className="text-muted-foreground">Nada vence nos próximos {DUE_DAYS} dias.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {soon.map(due => (
            <li className="flex items-center gap-3" key={`${due.label}-${due.dueDate}`}>
              <span className="w-12 shrink-0 text-sm text-muted-foreground tabular-nums">
                {formatDate(due.dueDate).slice(0, 5)}
              </span>
              <span className="min-w-0 flex-1 truncate">{due.label}</span>
              <span className="font-medium tabular-nums">{formatCents(due.amountCents)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between border-t pt-2.5 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">
              {formatCents(soon.reduce((total, due) => total + due.amountCents, 0))}
            </span>
          </li>
        </ul>
      )}
    </Block>
  );
}

interface Limit {
  category: string;
  id: string;
  limitCents: number;
  spentCents: number;
}

/** The Limites de categoria: each with how much of it the month used, and a way to set them. */
function Limits({
  holderId,
  limits,
  month,
  spending,
}: {
  holderId: string | undefined;
  limits: Limit[] | undefined;
  month: string;
  spending: { amountCents: number; category: string }[] | undefined;
}) {
  // Which dialog is open, remounted each time so its fields start fresh.
  const [editing, setEditing] = useState<{ key: number; limit?: Limit } | null>(null);
  const taken = new Set(limits?.map(limit => limit.category.toLocaleLowerCase('pt-BR')));
  const suggestions = (spending ?? [])
    .filter(item => !taken.has(item.category.toLocaleLowerCase('pt-BR')))
    .slice(0, 6);

  return (
    <Block
      action={
        holderId && (
          <Button
            aria-label="Novo limite"
            onClick={() => setEditing({ key: Date.now() })}
            size="icon"
            title="Novo limite"
            variant="ghost"
          >
            <PlusIcon />
          </Button>
        )
      }
      title={`Limites de ${monthName(month)}`}
    >
      {!limits ? (
        <Lines />
      ) : limits.length === 0 ? (
        <>
          <p className="text-muted-foreground">
            Diga quanto quer gastar por categoria no mês, e o Financeiro avisa quando chegar perto.
          </p>
          <Button
            className="self-start"
            onClick={() => setEditing({ key: Date.now() })}
            variant="outline"
          >
            <PlusIcon />
            Criar limite
          </Button>
        </>
      ) : (
        <ul className="flex flex-col gap-4">
          {limits.map(limit => {
            const share = limit.spentCents / limit.limitCents;
            return (
              <li className="flex flex-col gap-1.5" key={limit.id}>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium">{limit.category}</span>
                  <span
                    className={cn(
                      'text-sm tabular-nums',
                      share >= 1 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {formatCents(limit.spentCents)} de {formatCents(limit.limitCents)}
                  </span>
                  <Button
                    aria-label={`Mudar o limite de ${limit.category}`}
                    className="size-7"
                    onClick={() => setEditing({ key: Date.now(), limit })}
                    size="icon"
                    variant="ghost"
                  >
                    <PencilIcon />
                  </Button>
                </div>
                <Progress
                  aria-label={`${Math.round(share * 100)}% do limite de ${limit.category}`}
                  className={cn(
                    share >= 1
                      ? '[&>*]:bg-destructive'
                      : share >= 0.8
                        ? '[&>*]:bg-warning'
                        : '[&>*]:bg-primary'
                  )}
                  value={Math.min(100, share * 100)}
                />
              </li>
            );
          })}
        </ul>
      )}
      {editing && holderId && (
        <LimitDialog
          holderId={holderId}
          key={editing.key}
          limit={editing.limit}
          onClose={() => setEditing(null)}
          suggestions={suggestions.map(item => item.category)}
        />
      )}
    </Block>
  );
}

function LimitDialog({
  holderId,
  limit,
  onClose,
  suggestions,
}: {
  holderId: string;
  limit?: Limit;
  onClose: () => void;
  suggestions: string[];
}) {
  const [category, setCategory] = useState(limit?.category ?? '');
  const [amount, setAmount] = useState(
    limit ? (limit.limitCents / 100).toFixed(2).replace('.', ',') : ''
  );
  const [save, { error, loading }] = useMutation(SetCategoryLimitDocument, {
    refetchQueries: [MoneyHomeDocument],
  });
  const send = (limitCents: number | null) =>
    save({ variables: { category: category.trim(), holderId, limitCents } })
      .then(onClose)
      .catch(() => undefined);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cents = parseCents(amount);
    if (!category.trim() || !cents || cents <= 0) return;
    void send(cents);
  };

  return (
    <Dialog onOpenChange={next => !next && onClose()} open>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{limit ? `Limite de ${limit.category}` : 'Novo limite'}</DialogTitle>
            <DialogDescription>
              O quanto você quer gastar nessa categoria por mês.
            </DialogDescription>
          </DialogHeader>
          {!limit && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Categoria</span>
              <Input
                autoFocus
                maxLength={60}
                onChange={event => setCategory(event.target.value)}
                placeholder="Mercado"
                required
                value={category}
              />
              {suggestions.length > 0 && (
                <span className="flex flex-wrap gap-1.5 pt-1">
                  {suggestions.map(suggestion => (
                    <Button
                      key={suggestion}
                      onClick={() => setCategory(suggestion)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </span>
              )}
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Até quanto por mês</span>
            <Input
              autoFocus={Boolean(limit)}
              inputMode="decimal"
              onChange={event => setAmount(event.target.value)}
              placeholder="1.500,00"
              required
              value={amount}
            />
          </label>
          {error && <FormError error={error} />}
          <DialogFooter className="gap-2 sm:justify-between">
            {limit ? (
              <Button
                disabled={loading}
                onClick={() => void send(null)}
                type="button"
                variant="ghost"
              >
                Remover limite
              </Button>
            ) : (
              <span />
            )}
            <Button disabled={loading} type="submit">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
