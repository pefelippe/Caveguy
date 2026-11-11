import { APP_NAME } from '@zapbots/finance';
import { closeDb, db, schema } from '@zapbots/database';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import {
  completionHandler,
  MODEL_WITH_TOOLS,
  modelListHandler,
  mswServer,
  textOf,
} from '../../test/msw/openrouter';
import { ensureBots } from '../services/bots/catalog';
import { replyInConversation } from '../services/bots/chat';
import { botPrompt } from '../services/bots/prompt';
import { createTask } from '../services/personal/tasks';

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(async () => {
  mswServer.close();
  await closeDb();
});

const BOTS = /* GraphQL */ `
  query {
    bots {
      id
      key
      name
      custom
      outfit
    }
  }
`;
const CREATE = /* GraphQL */ `
  mutation ($input: AgentInput!) {
    createBot(input: $input) {
      id
      key
      name
      custom
      instructions
      outfit
    }
  }
`;
const UPDATE = /* GraphQL */ `
  mutation ($id: ID!, $input: AgentInput!) {
    updateBot(id: $id, input: $input) {
      name
      outfit
    }
  }
`;
const DELETE = /* GraphQL */ `
  mutation ($id: ID!) {
    deleteBot(id: $id)
  }
`;
const BY_ID = /* GraphQL */ `
  query ($id: ID!) {
    botById(id: $id) {
      id
    }
  }
`;

const poet = { instructions: 'Escreve poemas curtos.', name: 'Poeta', outfit: 'ARTIST' };

/** A User on a paid Plan; only Max makes custom Agentes. */
async function onPlan(plan: 'MAX' | 'PRO', name?: string) {
  const viewer = await createViewer(name);
  await db.insert(schema.subscription).values({
    organizationId: viewer.organizationId,
    plan,
    status: 'active',
    stripeSubscriptionId: `sub_${viewer.userId}`,
  });
  return viewer;
}

describe('Agentes', () => {
  it('lists the three fixed Agentes, then makes, changes and deletes a custom one', async () => {
    const viewer = await onPlan('MAX');
    const { data } = await gql(viewer, BOTS);
    expect(data.bots.map((bot: { name: string }) => bot.name)).toEqual([
      'Financeiro',
      'Pessoal',
      'Fitness',
    ]);

    const created = (await gql(viewer, CREATE, { input: poet })).data.createBot;
    expect(created).toMatchObject({ custom: true, key: 'CUSTOM', name: 'Poeta', outfit: 'ARTIST' });
    expect((await gql(viewer, BOTS)).data.bots).toHaveLength(4);

    const updated = await gql(viewer, UPDATE, {
      id: created.id,
      input: { ...poet, name: 'Bardo', outfit: 'MUSICIAN' },
    });
    expect(updated.data.updateBot).toEqual({ name: 'Bardo', outfit: 'MUSICIAN' });

    expect((await gql(viewer, DELETE, { id: created.id })).data.deleteBot).toBe(true);
    expect((await gql(viewer, BOTS)).data.bots).toHaveLength(3);
  });

  it('makes custom Agentes only on Max', async () => {
    expect((await gql(await createViewer(), CREATE, { input: poet })).errors).toEqual([
      'BAD_USER_INPUT',
    ]);
    expect((await gql(await onPlan('PRO'), CREATE, { input: poet })).errors).toEqual([
      'BAD_USER_INPUT',
    ]);
  });

  it('refuses the eleventh custom Agente, bad fields and changing a fixed one', async () => {
    const viewer = await onPlan('MAX');
    for (let index = 0; index < 10; index++) {
      expect((await gql(viewer, CREATE, { input: poet })).errors).toEqual([]);
    }
    expect((await gql(viewer, CREATE, { input: poet })).errors).toEqual(['BAD_USER_INPUT']);
    expect(
      (await gql(viewer, CREATE, { input: { ...poet, name: 'x'.repeat(41) } })).errors
    ).toEqual(['BAD_USER_INPUT']);

    const [finance] = await ensureBots(viewer.organizationId);
    expect((await gql(viewer, UPDATE, { id: finance!.id, input: poet })).errors).toEqual([
      'BAD_USER_INPUT',
    ]);
    expect((await gql(viewer, DELETE, { id: finance!.id })).errors).toEqual(['BAD_USER_INPUT']);
  });

  it("keeps another Organization's Agentes out of reach", async () => {
    const owner = await onPlan('MAX');
    const stranger = await createViewer('Bia');
    const { id } = (await gql(owner, CREATE, { input: poet })).data.createBot;
    expect((await gql(stranger, BY_ID, { id })).data.botById).toBeNull();
    expect((await gql(stranger, UPDATE, { id, input: poet })).errors).toEqual(['NOT_FOUND']);
    expect((await gql(stranger, DELETE, { id })).errors).toEqual(['NOT_FOUND']);
  });

  it("gives the Pessoal the Agenda and Tarefas, in the app's voice, and no health data", async () => {
    const viewer = await createViewer();
    await createTask(viewer, { title: 'Comprar pão' });
    const [, personal] = await ensureBots(viewer.organizationId);
    const prompt = await botPrompt(viewer, personal!, { mode: 'chat' });
    expect(prompt).toContain(`Você é o ${APP_NAME}`);
    expect(prompt).toContain('Comprar pão');
    expect(prompt).toContain('CVV');
    expect(prompt).not.toMatch(/Sono|Medidas|Refeições/);
  });

  it('wraps a custom Agente around what its User wrote, reading no data', async () => {
    const viewer = await onPlan('MAX');
    await createTask(viewer, { title: 'Comprar pão' });
    const { id } = (await gql(viewer, CREATE, { input: poet })).data.createBot;
    const [bot] = await db.select().from(schema.bot).where(eq(schema.bot.id, id));
    const prompt = await botPrompt(viewer, bot!, { mode: 'chat' });
    expect(prompt).toContain('> Escreve poemas curtos.');
    expect(prompt).toContain('Poeta');
    expect(prompt).not.toContain('Comprar pão');
  });

  it('lets only the Financeiro use tools', async () => {
    const viewer = await createViewer();
    const [finance, personal] = await ensureBots(viewer.organizationId);
    await db
      .update(schema.bot)
      .set({ model: MODEL_WITH_TOOLS })
      .where(eq(schema.bot.id, personal!.id));
    await db
      .update(schema.bot)
      .set({ model: MODEL_WITH_TOOLS })
      .where(eq(schema.bot.id, finance!.id));
    const { handler, log } = completionHandler([
      { text: 'Posso ajudar.' },
      { text: 'Vou contar.' },
    ]);
    mswServer.use(modelListHandler, handler);

    for (const bot of [personal!, finance!]) {
      const [conversation] = await db
        .insert(schema.conversation)
        .values({ botId: bot.id, organizationId: viewer.organizationId })
        .returning();
      await replyInConversation({
        content: 'Oi',
        conversationId: conversation!.id,
        send: () => {},
        viewer,
      });
    }
    expect(log[0]!.tools ?? []).toEqual([]);
    expect(textOf(log[0]!.messages[0])).toContain('Pessoal');
    expect(log[1]!.tools?.length).toBeGreaterThan(0);
  });
});
