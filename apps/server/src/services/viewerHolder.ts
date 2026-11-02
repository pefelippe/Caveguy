import type { Viewer } from '@zapbots/auth';
import { db, schema, type HolderRow } from '@zapbots/database';
import { and, asc, eq, isNull } from 'drizzle-orm';

/**
 * The Holder the Viewer is (docs/adr/0007): the one linked to the User, else the oldest of the
 * Organization no User has yet (adopted), else a new one named after the User. The first screen
 * asks for it many times at once: one Holder per User and Organization is a constraint, an
 * adoption only takes a Holder still free, and whoever loses the race reads the winner's.
 */
export async function viewerHolder(viewer: Viewer): Promise<HolderRow> {
  const inOrganization = eq(schema.holder.organizationId, viewer.organizationId);
  const linked = async () => {
    const [row] = await db
      .select()
      .from(schema.holder)
      .where(and(inOrganization, eq(schema.holder.userId, viewer.userId)))
      .limit(1);
    return row;
  };
  const found = await linked();
  if (found) return found;

  const [oldest] = await db
    .select()
    .from(schema.holder)
    .where(and(inOrganization, isNull(schema.holder.userId)))
    .orderBy(asc(schema.holder.createdAt))
    .limit(1);
  if (oldest) {
    const [adopted] = await db
      .update(schema.holder)
      .set({ userId: viewer.userId })
      .where(and(eq(schema.holder.id, oldest.id), isNull(schema.holder.userId)))
      .returning();
    if (adopted) return adopted;
    // Another request took it: for this User (then it is theirs), or for another User (then the
    // next free one, or a new one).
    return (await linked()) ?? viewerHolder(viewer);
  }

  const [user] = await db
    .select({ name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, viewer.userId));
  const [created] = await db
    .insert(schema.holder)
    .values({
      name: user?.name ?? 'Eu',
      organizationId: viewer.organizationId,
      userId: viewer.userId,
    })
    .onConflictDoNothing({ target: [schema.holder.organizationId, schema.holder.userId] })
    .returning();
  return created ?? (await linked())!;
}
