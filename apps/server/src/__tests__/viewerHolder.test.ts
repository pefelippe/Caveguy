import { closeDb, db, schema } from '@zapbots/database';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';

afterAll(async () => {
  await closeDb();
});

const VIEWER_HOLDER = `query { viewerHolder { id name } }`;

const holdersOf = (organizationId: string) =>
  db.select().from(schema.holder).where(eq(schema.holder.organizationId, organizationId));

describe('the Holder the Viewer is', () => {
  it('is made once when the first screen asks for it many times at once', async () => {
    const viewer = await createViewer('Ana');

    const results = await Promise.all(Array.from({ length: 6 }, () => gql(viewer, VIEWER_HOLDER)));

    expect(results.map(result => result.errors)).toEqual(Array(6).fill([]));
    expect(new Set(results.map(result => result.data.viewerHolder.id)).size).toBe(1);
    expect(await holdersOf(viewer.organizationId)).toHaveLength(1);
  });

  it('adopts a Holder of no User once when asked for many times at once', async () => {
    const viewer = await createViewer('Ana');
    const [free] = await db
      .insert(schema.holder)
      .values({ name: 'Da planilha', organizationId: viewer.organizationId })
      .returning();

    const results = await Promise.all(Array.from({ length: 6 }, () => gql(viewer, VIEWER_HOLDER)));

    expect(results.map(result => result.data.viewerHolder.id)).toEqual(Array(6).fill(free!.id));
    expect(await holdersOf(viewer.organizationId)).toMatchObject([{ userId: viewer.userId }]);
  });

  it("never takes another User's Holder in the same Organization", async () => {
    const owner = await createViewer('Ana');
    const ana = (await gql(owner, VIEWER_HOLDER)).data.viewerHolder.id;
    const other = await createViewer('Bia');
    await db
      .update(schema.member)
      .set({ organizationId: owner.organizationId })
      .where(eq(schema.member.userId, other.userId));
    const bia = { ...other, organizationId: owner.organizationId };

    const theirs = (await gql(bia, VIEWER_HOLDER)).data.viewerHolder;

    expect(theirs.name).toBe('Bia');
    expect(theirs.id).not.toBe(ana);
    const holders = await holdersOf(owner.organizationId);
    expect(holders.find(holder => holder.name === 'Ana')).toMatchObject({ userId: owner.userId });
  });
});
