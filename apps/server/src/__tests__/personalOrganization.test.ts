import { auth } from '@zapbots/auth';
import { closeDb, db, schema } from '@zapbots/database';
import { eq, inArray } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

afterAll(async () => {
  await closeDb();
});

const ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

/** A POST to Better Auth's own handler, as the sign-in page sends it. */
async function post(path: string, body: unknown) {
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth${path}`, {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      method: 'POST',
    })
  );
  return response.status;
}

const membershipsOf = (userId: string) =>
  db.select().from(schema.member).where(eq(schema.member.userId, userId));

describe('the personal Organization', () => {
  it('is made once when a User with none signs in twice at the same time', async () => {
    const email = `${crypto.randomUUID()}@test.local`;
    const password = 'senha-forte-123';
    expect(await post('/sign-up/email', { email, name: 'Ana', password })).toBe(200);
    const [user] = await db.select().from(schema.user).where(eq(schema.user.email, email));
    // As a User from before personal Organizations: none yet.
    const before = await membershipsOf(user!.id);
    await db.delete(schema.member).where(eq(schema.member.userId, user!.id));
    await db.delete(schema.organization).where(
      inArray(
        schema.organization.id,
        before.map(member => member.organizationId)
      )
    );

    const statuses = await Promise.all([
      post('/sign-in/email', { email, password }),
      post('/sign-in/email', { email, password }),
    ]);

    expect(statuses).toEqual([200, 200]);
    expect(await membershipsOf(user!.id)).toHaveLength(1);
  });
});
