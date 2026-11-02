import type { Viewer } from '@zapbots/auth';
import { closeDb, db, schema } from '@zapbots/database';
import { and, eq, inArray } from 'drizzle-orm';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { mswServer, modelListHandler } from '../../test/msw/openrouter';
import { ensureBots } from '../services/bots/catalog';

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(async () => {
  mswServer.close();
  await closeDb();
});

const CREATE_JOB = /* GraphQL */ `
  mutation ($input: CreateJobInput!) {
    createJob(input: $input) {
      id
    }
  }
`;
const CREATE_ROUTINE = /* GraphQL */ `
  mutation ($input: CreateRoutineInput!) {
    createRoutine(input: $input) {
      id
    }
  }
`;

/**
 * A Model that holds every answer until `release`, so the Jobs it is asked for stay in progress;
 * then it fails them, and `settled` waits until none of the Organization's is left running.
 */
function heldModel(viewer: Viewer) {
  let release!: () => void;
  const held = new Promise<void>(resolve => (release = resolve));
  mswServer.use(
    modelListHandler,
    http.post('https://openrouter.ai/api/v1/chat/completions', async () => {
      await held;
      return HttpResponse.json({ error: { message: 'held' } }, { status: 500 });
    })
  );
  const settled = async () => {
    release();
    for (let tries = 0; tries < 100; tries++) {
      const working = await db
        .select({ id: schema.job.id })
        .from(schema.job)
        .where(
          and(
            eq(schema.job.organizationId, viewer.organizationId),
            inArray(schema.job.status, ['QUEUED', 'RUNNING'])
          )
        );
      if (!working.length) return;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };
  return { settled };
}

const jobsOf = (viewer: Viewer) =>
  db.select().from(schema.job).where(eq(schema.job.organizationId, viewer.organizationId));

describe('Workflows and Routines', () => {
  it('takes three Workflows at once when four are asked for at the same time', async () => {
    const viewer = await createViewer();
    const [bot] = await ensureBots(viewer.organizationId);
    const model = heldModel(viewer);

    const results = await Promise.all(
      [1, 2, 3, 4].map(n =>
        gql(viewer, CREATE_JOB, { input: { botId: bot!.id, instructions: `Resumo ${n}` } })
      )
    );

    expect(results.map(result => result.errors).sort()).toEqual([[], [], [], ['BAD_USER_INPUT']]);
    expect(await jobsOf(viewer)).toHaveLength(3);
    await model.settled();
  });

  it('keeps the last Workflow of the Plan for one of two asked for at the same time', async () => {
    const viewer = await createViewer();
    const [bot] = await ensureBots(viewer.organizationId);
    // 29 of the Gratuito Plan's 30 already used this month.
    await db.insert(schema.job).values(
      Array.from({ length: 29 }, () => ({
        botId: bot!.id,
        createdById: viewer.userId,
        instructions: 'Antigo',
        organizationId: viewer.organizationId,
        status: 'DONE' as const,
      }))
    );
    const model = heldModel(viewer);

    const results = await Promise.all(
      [1, 2].map(n =>
        gql(viewer, CREATE_JOB, { input: { botId: bot!.id, instructions: `Resumo ${n}` } })
      )
    );

    expect(results.map(result => result.errors).sort()).toEqual([[], ['PLAN_LIMIT']]);
    expect(await jobsOf(viewer)).toHaveLength(30);
    await model.settled();
  });

  it('keeps the tenth Routine for one of two made at the same time', async () => {
    const viewer = await createViewer();
    const [bot] = await ensureBots(viewer.organizationId);
    await db.insert(schema.routine).values(
      Array.from({ length: 9 }, () => ({
        botId: bot!.id,
        cadence: 'WEEKLY' as const,
        createdById: viewer.userId,
        instructions: 'Toda semana',
        nextRunAt: new Date(Date.now() + 86_400_000),
        organizationId: viewer.organizationId,
      }))
    );
    const model = heldModel(viewer);

    const results = await Promise.all(
      [1, 2].map(n =>
        gql(viewer, CREATE_ROUTINE, {
          input: { botId: bot!.id, cadence: 'WEEKLY', instructions: `Rotina ${n}` },
        })
      )
    );

    expect(results.map(result => result.errors).sort()).toEqual([[], ['BAD_USER_INPUT']]);
    const routines = await db
      .select()
      .from(schema.routine)
      .where(eq(schema.routine.organizationId, viewer.organizationId));
    expect(routines).toHaveLength(10);
    // The refused one left no Job behind either: only the first run of the one made.
    expect(await jobsOf(viewer)).toHaveLength(1);
    await model.settled();
  });
});
