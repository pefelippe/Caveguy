import type { Viewer } from '@zapbots/auth';
import { db, schema, type BotRow } from '@zapbots/database';
import { addDays, dateOf, Decimal, overdueCents, today } from '@zapbots/finance';
import { and, desc, eq, gte, inArray, isNotNull, sql } from 'drizzle-orm';

import { marketRates } from '../bacen';
import {
  lateFacts,
  latePaymentRows,
  scheduleFor,
  statementDueDate,
  upcomingDues,
} from '../obligations';
import { categoryLimits } from '../categoryLimits';
import { viewerHolder } from '../viewerHolder';

/** Something a Bot points out on its own, computed from the data; no Model is involved. */
export interface BotAlert {
  /** Where to look, inside the app. */
  href: string | null;
  /**
   * Names this Alert for its User's read and removed marks (`alert_state`): what it is about and
   * what it says, so one saying something new (another date, another amount) counts as new.
   */
  key: string;
  kind:
    | 'ABOVE_MARKET'
    | 'DUE_SOON'
    | 'HIGH_UTILIZATION'
    | 'OVERDUE'
    | 'OVER_LIMIT'
    | 'ROUTINE_FAILED'
    | 'STALE_ASSESSMENT';
  message: string;
}

const DUE_SOON_DAYS = 7;
/** A Limite de categoria this far spent is worth a word; past it, another. */
const NEAR_LIMIT = 0.8;
/** A Statement using this share of the Card's limit weighs on the Score (Utilização de Limite). */
const HIGH_UTILIZATION = new Decimal('0.8');
const STALE_ASSESSMENT_DAYS = 30;
const FAILED_ROUTINE_DAYS = 7;
/** A rate this far above the Market Rate, in percentage points a month, is worth renegotiating. */
const ABOVE_MARKET_POINTS = new Decimal('0.01');

const brl = new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' });
const money = (cents: number) => brl.format(cents / 100);
const day = (iso: string) => iso.split('-').reverse().join('/');
const points = (fraction: Decimal) => fraction.times(100).toFixed(2).replace('.', ',');

async function financeAlerts(viewer: Viewer): Promise<BotAlert[]> {
  const holder = await viewerHolder(viewer);
  const asOf = today();
  const alerts: BotAlert[] = [];

  const operations = await db
    .select()
    .from(schema.creditOperation)
    .where(eq(schema.creditOperation.holderId, holder.id));
  const markets = await marketRates(operations.map(operation => operation.modality));
  for (const operation of operations) {
    const href = `/caishen/operations/${operation.id}`;
    const overdue = overdueCents(
      lateFacts(await latePaymentRows(operation.id), await scheduleFor(operation)),
      asOf
    );
    if (overdue > 0) {
      alerts.push({
        href,
        key: `OVERDUE:${operation.id}:${overdue}`,
        kind: 'OVERDUE',
        message: `${operation.name} tem ${money(overdue)} em atraso.`,
      });
    }
    const market = markets.get(operation.modality) ?? null;
    const gap = market ? new Decimal(operation.monthlyRate).minus(market.monthlyRate) : null;
    if (gap && gap.gte(ABOVE_MARKET_POINTS)) {
      alerts.push({
        href,
        key: `ABOVE_MARKET:${operation.id}:${operation.monthlyRate}`,
        kind: 'ABOVE_MARKET',
        message: `${operation.name} paga ${points(gap)} p.p. ao mês acima da média do mercado. Vale renegociar ou portar.`,
      });
    }
  }

  const until = addDays(asOf, DUE_SOON_DAYS);
  for (const due of await upcomingDues(holder.id, asOf)) {
    if (due.dueDate > until) continue;
    alerts.push({
      href: '/caishen',
      key: `DUE_SOON:${due.label}:${due.dueDate}`,
      kind: 'DUE_SOON',
      message: `${due.label} vence em ${day(due.dueDate)}: ${money(due.amountCents)}.`,
    });
  }

  for (const limit of await categoryLimits(holder.id, asOf.slice(0, 7))) {
    const share = limit.spentCents / limit.limitCents;
    if (share < NEAR_LIMIT) continue;
    const over = share >= 1;
    alerts.push({
      href: '/caishen',
      key: `OVER_LIMIT:${limit.category}:${asOf.slice(0, 7)}:${over ? 'over' : 'near'}`,
      kind: 'OVER_LIMIT',
      message: over
        ? `${limit.category} passou do limite do mês: ${money(limit.spentCents)} de ${money(limit.limitCents)}.`
        : `${limit.category} já usou ${Math.floor(share * 100)}% do limite do mês: ${money(limit.spentCents)} de ${money(limit.limitCents)}.`,
    });
  }

  const cards = await db
    .select()
    .from(schema.creditCard)
    .where(eq(schema.creditCard.holderId, holder.id));
  for (const card of cards) {
    const [latest] = await db
      .select()
      .from(schema.statement)
      .where(eq(schema.statement.creditCardId, card.id))
      .orderBy(desc(schema.statement.referenceMonth))
      .limit(1);
    // Only a Statement still open counts, as in the Assessment's Utilização de Limite.
    if (!latest || card.limitCents <= 0) continue;
    if (statementDueDate(card, latest.referenceMonth) < asOf) continue;
    const usage = new Decimal(latest.amountCents).div(card.limitCents);
    if (usage.gte(HIGH_UTILIZATION)) {
      alerts.push({
        href: `/caishen/fixed#card-${card.id}`,
        key: `HIGH_UTILIZATION:${card.id}:${latest.referenceMonth}`,
        kind: 'HIGH_UTILIZATION',
        message: `A última Fatura do ${card.name} usa ${usage.times(100).toFixed(0)}% do limite: uma Utilização de Limite alta pesa no Score.`,
      });
    }
  }

  if (operations.length || cards.length) {
    const [assessment] = await db
      .select({ createdAt: schema.assessment.createdAt })
      .from(schema.assessment)
      .where(eq(schema.assessment.holderId, holder.id))
      .orderBy(desc(schema.assessment.createdAt))
      .limit(1);
    const madeOn = assessment ? dateOf(assessment.createdAt) : null;
    if (!madeOn || madeOn < addDays(asOf, -STALE_ASSESSMENT_DAYS)) {
      alerts.push({
        href: '/caishen/credit',
        key: `STALE_ASSESSMENT:${madeOn ?? 'none'}`,
        kind: 'STALE_ASSESSMENT',
        message: madeOn
          ? `Sua última Avaliação é de ${day(madeOn)}. Gere uma nova para ver o Score com os dados de hoje.`
          : 'Você ainda não gerou uma Avaliação. Gere uma para ver seu Score.',
      });
    }
  }

  const order = {
    ABOVE_MARKET: 4,
    DUE_SOON: 1,
    HIGH_UTILIZATION: 3,
    OVER_LIMIT: 2,
    OVERDUE: 0,
    ROUTINE_FAILED: 6,
    STALE_ASSESSMENT: 5,
  } as const;
  return alerts.sort((a, b) => order[a.kind] - order[b.kind]);
}

/**
 * A Bot's Alerts for the Viewer, most urgent first: overdue, due soon, high card usage, rates above
 * the market, then an outdated Assessment.
 */
export async function botAlerts(viewer: Viewer, bot: BotRow): Promise<BotAlert[]> {
  // Only the Financeiro computes Alerts from data (docs/adr/0036).
  const ofField = bot.key === 'FINANCE' ? await financeAlerts(viewer) : [];
  return [...ofField, ...(await failedRoutineAlerts(viewer, bot))];
}

/** An Alert as its User sees it in the bell: `read` once opened or marked. */
export interface SeenAlert extends BotAlert {
  read: boolean;
  /** Posted in the Member's Avisos Conversation (`deliverAlerts`). */
  sent: boolean;
}

/** A Bot's Alerts for the Viewer, as `botAlerts`, less the ones they removed, each read or not. */
export async function viewerAlerts(viewer: Viewer, bot: BotRow): Promise<SeenAlert[]> {
  const alerts = await botAlerts(viewer, bot);
  if (!alerts.length) return [];
  const marks = await db
    .select()
    .from(schema.alertState)
    .where(
      and(
        eq(schema.alertState.userId, viewer.userId),
        inArray(
          schema.alertState.alertKey,
          alerts.map(alert => alert.key)
        )
      )
    );
  const byKey = new Map(marks.map(mark => [mark.alertKey, mark]));
  return alerts
    .filter(alert => !byKey.get(alert.key)?.dismissedAt)
    .map(alert => ({
      ...alert,
      read: Boolean(byKey.get(alert.key)?.readAt),
      sent: Boolean(byKey.get(alert.key)?.sentAt),
    }));
}

/**
 * Marks some of a Bot's Alerts as read, or removes them from the Viewer's bell. Only keys of
 * Alerts the Viewer has now count; anything else is ignored.
 */
export async function markAlerts(
  viewer: Viewer,
  bot: BotRow,
  keys: string[],
  mark: 'DISMISSED' | 'READ'
): Promise<void> {
  const current = new Set((await botAlerts(viewer, bot)).map(alert => alert.key));
  const known = [...new Set(keys)].filter(alertKey => current.has(alertKey));
  if (!known.length) return;
  const now = new Date();
  const set = mark === 'READ' ? { readAt: now } : { dismissedAt: now };
  await db
    .insert(schema.alertState)
    .values(
      known.map(alertKey => ({
        alertKey,
        organizationId: viewer.organizationId,
        userId: viewer.userId,
        ...set,
      }))
    )
    .onConflictDoUpdate({
      set:
        mark === 'READ'
          ? { readAt: sql`coalesce(${schema.alertState.readAt}, excluded.read_at)` }
          : { dismissedAt: sql`excluded.dismissed_at` },
      target: [schema.alertState.userId, schema.alertState.alertKey],
    });
}

/**
 * Routine Jobs that failed in the last week. Nobody watched them run, so the failure is pointed
 * out; Jobs the User asked for were failed in front of them.
 */
async function failedRoutineAlerts(viewer: Viewer, bot: BotRow): Promise<BotAlert[]> {
  const since = new Date(Date.now() - FAILED_ROUTINE_DAYS * 86_400_000);
  const rows = await db
    .select({
      finishedAt: schema.job.finishedAt,
      id: schema.job.id,
      instructions: schema.job.instructions,
    })
    .from(schema.job)
    .where(
      and(
        eq(schema.job.organizationId, viewer.organizationId),
        eq(schema.job.botId, bot.id),
        eq(schema.job.status, 'FAILED'),
        isNotNull(schema.job.routineId),
        gte(schema.job.finishedAt, since)
      )
    )
    .orderBy(desc(schema.job.finishedAt))
    .limit(3);
  return rows.map(row => ({
    href: `/workflows/${row.id}`,
    key: `ROUTINE_FAILED:${row.id}`,
    kind: 'ROUTINE_FAILED' as const,
    message: `A Rotina "${row.instructions}" falhou em ${day(dateOf(row.finishedAt!))}. Abra o Workflow para pedir de novo.`,
  }));
}
