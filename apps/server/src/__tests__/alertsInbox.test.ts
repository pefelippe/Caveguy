import type { Viewer } from '@zapbots/auth';
import { closeDb, db, schema } from '@zapbots/database';
import { today } from '@zapbots/finance';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { ensureBots } from '../services/bots/catalog';
import { setCategoryLimit } from '../services/categoryLimits';
import { addExpense } from '../services/records';
import { viewerHolder } from '../services/viewerHolder';

afterAll(closeDb);

const DELIVER = /* GraphQL */ `
  mutation {
    deliverAlerts(bot: FINANCE) {
      alertsConversation {
        id
      }
      alerts {
        sent
        read
      }
    }
  }
`;
const LIST = /* GraphQL */ `
  query {
    conversations {
      id
      alerts
      title
    }
  }
`;

/** Spending past a Limite de categoria, so the Financeiro has an Aviso. */
async function overLimit(viewer: Viewer, category: string) {
  const holder = await viewerHolder(viewer);
  await addExpense(viewer, {
    amountCents: 50_000,
    category,
    date: today(),
    description: category,
    holderId: holder.id,
  });
  await setCategoryLimit(viewer, { category, holderId: holder.id, limitCents: 10_000 });
}

const messagesOf = (conversationId: string) =>
  db.select().from(schema.message).where(eq(schema.message.conversationId, conversationId));

describe('Avisos as the Agente’s messages', () => {
  it('posts new Avisos once a day in one Conversation, and never twice', async () => {
    const viewer = await createViewer();
    expect((await gql(viewer, DELIVER)).data.deliverAlerts.alertsConversation).toBeNull();

    await overLimit(viewer, 'Lazer');
    const [first, again] = await Promise.all([gql(viewer, DELIVER), gql(viewer, DELIVER)]);
    const id = first.data.deliverAlerts.alertsConversation.id;
    expect(again.data.deliverAlerts.alertsConversation.id).toBe(id);
    const messages = await messagesOf(id);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ role: 'BOT' });
    expect(messages[0]!.content).toContain('Lazer passou do limite');
    expect(first.data.deliverAlerts.alerts).toEqual([{ read: false, sent: true }]);

    // A new Aviso the same day waits for tomorrow's message.
    await overLimit(viewer, 'Mercado');
    await gql(viewer, DELIVER);
    expect(await messagesOf(id)).toHaveLength(1);

    // Tomorrow: only the new one is said.
    await db
      .update(schema.message)
      .set({ createdAt: new Date(Date.now() - 2 * 86_400_000) })
      .where(eq(schema.message.conversationId, id));
    await gql(viewer, DELIVER);
    const later = (await messagesOf(id)).sort((a, b) => +a.createdAt - +b.createdAt);
    expect(later).toHaveLength(2);
    expect(later[1]!.content).toContain('Mercado passou do limite');
    expect(later[1]!.content).not.toContain('Lazer');
  });

  it('keeps each Member’s Avisos to themselves', async () => {
    const owner = await createViewer();
    const userId = crypto.randomUUID();
    await db
      .insert(schema.user)
      .values({ email: `${userId}@test.local`, emailVerified: true, id: userId, name: 'Bia' });
    await db.insert(schema.member).values({
      id: crypto.randomUUID(),
      organizationId: owner.organizationId,
      role: 'member',
      userId,
    });
    const member: Viewer = { organizationId: owner.organizationId, role: 'member', userId };
    await ensureBots(owner.organizationId);
    await overLimit(owner, 'Lazer');

    const id = (await gql(owner, DELIVER)).data.deliverAlerts.alertsConversation.id;
    expect((await gql(owner, LIST)).data.conversations).toEqual([
      { alerts: true, id, title: 'Avisos' },
    ]);
    expect((await gql(member, LIST)).data.conversations).toEqual([]);
    const [mine] = (await gql(member, DELIVER)).data.deliverAlerts.alertsConversation
      ? [(await gql(member, LIST)).data.conversations[0]]
      : [];
    expect(mine?.id).not.toBe(id);
  });
});
