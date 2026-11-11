import type { Viewer } from '@zapbots/auth';
import { db, schema, type BotRow } from '@zapbots/database';
import { and, desc, eq, sql } from 'drizzle-orm';

import { viewerTimeZone } from '../personal/clock';
import { viewerAlerts, type BotAlert } from './alerts';

const TITLE = 'Avisos';

/** Overdue first, then what falls due, then the rest; as the bell listed them. */
const ORDER: BotAlert['kind'][] = [
  'OVERDUE',
  'DUE_SOON',
  'OVER_LIMIT',
  'HIGH_UTILIZATION',
  'ABOVE_MARKET',
  'STALE_ASSESSMENT',
  'ROUTINE_FAILED',
];

const dayIn = (date: Date, timeZone: string) => date.toLocaleDateString('sv-SE', { timeZone });

/** The Member's Avisos Conversation with this Bot, if it was ever made. */
export async function alertsConversation(viewer: Viewer, bot: BotRow) {
  const [row] = await db
    .select()
    .from(schema.conversation)
    .where(
      and(
        eq(schema.conversation.organizationId, viewer.organizationId),
        eq(schema.conversation.userId, viewer.userId),
        eq(schema.conversation.botId, bot.id),
        eq(schema.conversation.alerts, true)
      )
    );
  return row ?? null;
}

async function ensureAlertsConversation(viewer: Viewer, bot: BotRow) {
  const found = await alertsConversation(viewer, bot);
  if (found) return found;
  // Two tabs opening at once: the unique index keeps one, the other finds it.
  await db
    .insert(schema.conversation)
    .values({
      alerts: true,
      botId: bot.id,
      organizationId: viewer.organizationId,
      title: TITLE,
      userId: viewer.userId,
    })
    .onConflictDoNothing();
  return (await alertsConversation(viewer, bot))!;
}

/**
 * The Bot's daily word in the Member's Avisos Conversation (no Model involved): the Alerts not yet
 * posted, as one Message, at most once a day on the Member's clock. Each Alert is claimed in
 * `alert_state.sent_at` before posting, so two calls at once never post it twice. Returns the
 * Conversation, or null while there has never been anything to say.
 */
export async function deliverAlerts(viewer: Viewer, bot: BotRow) {
  const existing = await alertsConversation(viewer, bot);
  const timeZone = await viewerTimeZone(viewer);
  if (existing) {
    const [last] = await db
      .select({ createdAt: schema.message.createdAt })
      .from(schema.message)
      .where(
        and(eq(schema.message.conversationId, existing.id), eq(schema.message.role, 'BOT'))
      )
      .orderBy(desc(schema.message.createdAt))
      .limit(1);
    if (last && dayIn(last.createdAt, timeZone) === dayIn(new Date(), timeZone)) return existing;
  }

  const fresh = (await viewerAlerts(viewer, bot)).filter(alert => !alert.read);
  if (!fresh.length) return existing;
  // Made before the claim, so a call that loses the claim to another still finds it.
  const conversation = await ensureAlertsConversation(viewer, bot);
  const now = new Date();
  const claimed = await db
    .insert(schema.alertState)
    .values(
      fresh.map(alert => ({
        alertKey: alert.key,
        organizationId: viewer.organizationId,
        sentAt: now,
        userId: viewer.userId,
      }))
    )
    .onConflictDoUpdate({
      set: { sentAt: sql`excluded.sent_at` },
      setWhere: sql`${schema.alertState.sentAt} is null`,
      target: [schema.alertState.userId, schema.alertState.alertKey],
    })
    .returning({ key: schema.alertState.alertKey });
  const keys = new Set(claimed.map(row => row.key));
  const told = fresh
    .filter(alert => keys.has(alert.key))
    .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  if (!told.length) return conversation;

  const [person] = await db
    .select({ name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, viewer.userId));
  const first = person?.name.split(' ')[0];
  const content = [
    `Oi${first ? `, ${first}` : ''}! ${told.length === 1 ? 'Uma coisa pede' : 'Algumas coisas pedem'} sua atenção hoje:`,
    '',
    ...told.map(alert => `- ${alert.message}`),
    '',
    'Quer ajuda com algum? É só responder aqui.',
  ].join('\n');

  await db.insert(schema.message).values({ content, conversationId: conversation.id, role: 'BOT' });
  await db
    .update(schema.conversation)
    .set({ updatedAt: now })
    .where(eq(schema.conversation.id, conversation.id));
  return conversation;
}
