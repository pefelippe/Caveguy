import { timingSafeEqual } from 'node:crypto';

import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import { linkBank, openFinanceEmails, openFinanceUnavailable, syncBankLink } from '.';

/** What Pluggy posts: the event's name and, for items and their lines, the item's id. */
export interface PluggyEvent {
  event?: unknown;
  eventId?: unknown;
  itemId?: unknown;
}

/** Lines Pluggy reports right after the item/updated that already read them. */
const RECENT_MS = 2 * 60 * 1000;

export const pluggyWebhookConfigured = () => Boolean(process.env.PLUGGY_WEBHOOK_SECRET);

/**
 * Pluggy does not sign its webhooks, so the URL registered with it carries a secret
 * (`?token=`), or a header (`X-Webhook-Secret`) when registered through the API.
 */
export function pluggyWebhookAuthorized(token: string | undefined): boolean {
  const secret = process.env.PLUGGY_WEBHOOK_SECRET;
  if (!secret || !token) return false;
  const given = Buffer.from(token);
  const expected = Buffer.from(secret);
  // timingSafeEqual throws on buffers of different lengths.
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Reads a Vínculo bancário again when Pluggy says its item changed. The event's body is never
 * trusted: only its item id, to pick a link we already have, which is then read from Pluggy as
 * "Ler de novo" does, on behalf of the User who linked it and only while they may (docs/adr/0020);
 * an `item/created` with no link yet links it (`linkNewItem`).
 * Returns how many Gastos came in, or `null` when nothing was read.
 */
export async function handlePluggyEvent(payload: PluggyEvent): Promise<number | null> {
  const event = typeof payload.event === 'string' ? payload.event : '';
  const itemId = typeof payload.itemId === 'string' ? payload.itemId : '';
  if (!itemId || !/^(item|transactions)\//.test(event)) return null;

  const [link] = await db
    .select()
    .from(schema.bankLink)
    .where(and(eq(schema.bankLink.provider, 'PLUGGY'), eq(schema.bankLink.externalId, itemId)));
  if (!link) return event === 'item/created' ? linkNewItem(itemId) : null;
  if (!link.consentId) return null;
  if (
    event.startsWith('transactions/') &&
    link.lastSyncedAt &&
    Date.now() - link.lastSyncedAt.getTime() < RECENT_MS
  ) {
    return null;
  }

  const [grantor] = await db
    .select({ role: schema.member.role, userId: schema.member.userId })
    .from(schema.consent)
    .innerJoin(
      schema.member,
      and(
        eq(schema.member.userId, schema.consent.grantedById),
        eq(schema.member.organizationId, link.organizationId)
      )
    )
    .where(eq(schema.consent.id, link.consentId));
  if (!grantor) return null;
  const viewer: Viewer = { organizationId: link.organizationId, ...grantor };
  if (await openFinanceUnavailable(viewer)) return null;

  const { added } = await syncBankLink(viewer, link.id);
  return added;
}

/**
 * A bank just connected in Pluggy's dashboard is linked on its own, as if its id were pasted on
 * Integrações, but only for the one User whose e-mail is in `OPEN_FINANCE_EMAILS`: with more,
 * whose bank it is cannot be told, and it waits to be pasted. It goes to the Organization they
 * sign in to. Only `item/created`: a bank unlinked here does not come back on its next update.
 */
async function linkNewItem(itemId: string): Promise<number | null> {
  const emails = openFinanceEmails();
  if (!emails.length) return null;
  const users = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(inArray(sql`lower(${schema.user.email})`, emails));
  if (users.length !== 1) return null;
  const [membership] = await db
    .select({ organizationId: schema.member.organizationId, role: schema.member.role })
    .from(schema.member)
    .where(eq(schema.member.userId, users[0]!.id))
    .orderBy(asc(schema.member.createdAt))
    .limit(1);
  if (!membership) return null;
  const viewer: Viewer = { ...membership, userId: users[0]!.id };
  if (await openFinanceUnavailable(viewer)) return null;

  const { added } = await linkBank(viewer, itemId);
  return added;
}
