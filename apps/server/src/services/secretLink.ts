import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import { and, eq } from 'drizzle-orm';

/** The tables of a User's secret addresses: the token in the address is the only key. */
type SecretLinkTable =
  | typeof schema.automationInbox
  | typeof schema.calendarFeed
  | typeof schema.healthInbox;

/**
 * Who a secret address belongs to, as a Viewer of its Organization while they are still a Member
 * there; null for a token that is malformed, unknown or no longer theirs.
 */
export async function viewerOfToken(table: SecretLinkTable, token: string): Promise<null | Viewer> {
  if (!/^[\w-]{16,64}$/.test(token)) return null;
  const [row] = await db
    .select({
      organizationId: table.organizationId,
      role: schema.member.role,
      userId: table.userId,
    })
    .from(table)
    .innerJoin(
      schema.member,
      and(
        eq(schema.member.userId, table.userId),
        eq(schema.member.organizationId, table.organizationId)
      )
    )
    .where(eq(table.token, token));
  return row ?? null;
}
