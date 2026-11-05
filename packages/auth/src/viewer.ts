import { db, schema } from '@zapbots/database';
import { and, asc, eq } from 'drizzle-orm';

import { auth } from './auth';

/** The signed-in User acting inside their active Organization. */
export interface Viewer {
  organizationId: string;
  role: string;
  userId: string;
}

type HeaderSource = Headers | Record<string, string | string[] | undefined>;

function toHeaders(source: HeaderSource): Headers {
  if (source instanceof Headers) return source;
  const headers = new Headers();
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  return headers;
}

/**
 * Resolves the Viewer from request headers (session cookie). Returns `null` when signed out or a
 * Member of no Organization. A User removed from their active Organization lands back in their
 * oldest one, and the session remembers it (docs/adr/0038).
 */
export async function resolveViewer(source: HeaderSource): Promise<Viewer | null> {
  const result = await auth.api.getSession({ headers: toHeaders(source) });
  if (!result) return null;
  const organizationId = result.session.activeOrganizationId;

  if (organizationId) {
    const [membership] = await db
      .select({ role: schema.member.role })
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, organizationId),
          eq(schema.member.userId, result.user.id)
        )
      )
      .limit(1);
    if (membership) return { organizationId, role: membership.role, userId: result.user.id };
  }

  const [oldest] = await db
    .select({ organizationId: schema.member.organizationId, role: schema.member.role })
    .from(schema.member)
    .where(eq(schema.member.userId, result.user.id))
    .orderBy(asc(schema.member.createdAt))
    .limit(1);
  if (!oldest) return null;
  await db
    .update(schema.session)
    .set({ activeOrganizationId: oldest.organizationId })
    .where(eq(schema.session.id, result.session.id));
  return { ...oldest, userId: result.user.id };
}
