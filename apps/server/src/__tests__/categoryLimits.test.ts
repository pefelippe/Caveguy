import type { Viewer } from '@zapbots/auth';
import { closeDb } from '@zapbots/database';
import { today } from '@zapbots/finance';
import { afterAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { botAlerts } from '../services/bots/alerts';
import { ensureBots } from '../services/bots/catalog';
import { addExpense } from '../services/records';
import { viewerHolder } from '../services/viewerHolder';

afterAll(closeDb);

const SET = /* GraphQL */ `
  mutation ($holderId: ID!, $category: String!, $limitCents: Cents) {
    setCategoryLimit(holderId: $holderId, category: $category, limitCents: $limitCents) {
      id
    }
  }
`;
const LIMITS = /* GraphQL */ `
  query ($month: String!) {
    viewerHolder {
      categoryLimits(month: $month) {
        category
        limitCents
        spentCents
      }
    }
  }
`;

const month = () => today().slice(0, 7);

async function spend(viewer: Viewer, amountCents: number, category: string) {
  const holder = await viewerHolder(viewer);
  await addExpense(viewer, {
    amountCents,
    category,
    date: today(),
    description: category,
    holderId: holder.id,
  });
  return holder;
}

const limitsOf = async (viewer: Viewer) =>
  (await gql(viewer, LIMITS, { month: month() })).data.viewerHolder.categoryLimits;

describe('Limites de categoria', () => {
  it("sets, changes and removes a Limite, counting the month's spending in any case", async () => {
    const viewer = await createViewer();
    const holder = await spend(viewer, 40_000, 'Mercado');
    await spend(viewer, 10_000, 'mercado ');

    expect(
      (await gql(viewer, SET, { category: 'Mercado', holderId: holder.id, limitCents: 100_000 }))
        .errors
    ).toEqual([]);
    expect(await limitsOf(viewer)).toEqual([
      { category: 'Mercado', limitCents: 100_000, spentCents: 50_000 },
    ]);

    await gql(viewer, SET, { category: 'Mercado', holderId: holder.id, limitCents: 60_000 });
    expect((await limitsOf(viewer))[0].limitCents).toBe(60_000);

    await gql(viewer, SET, { category: 'Mercado', holderId: holder.id, limitCents: null });
    expect(await limitsOf(viewer)).toEqual([]);
  });

  it('warns near and past the Limite, as a Financeiro Aviso', async () => {
    const viewer = await createViewer();
    const holder = await spend(viewer, 85_000, 'Mercado');
    await spend(viewer, 50_000, 'Lazer');
    await gql(viewer, SET, { category: 'Mercado', holderId: holder.id, limitCents: 100_000 });
    await gql(viewer, SET, { category: 'Lazer', holderId: holder.id, limitCents: 40_000 });
    await gql(viewer, SET, { category: 'Casa', holderId: holder.id, limitCents: 40_000 });

    const [finance] = await ensureBots(viewer.organizationId);
    const alerts = (await botAlerts(viewer, finance!)).filter(alert => alert.kind === 'OVER_LIMIT');
    expect(alerts.map(alert => alert.message)).toEqual([
      expect.stringContaining('Lazer passou do limite'),
      expect.stringContaining('Mercado já usou 85%'),
    ]);
  });

  it("keeps another Organization's Titular out of reach, and refuses an empty category", async () => {
    const owner = await createViewer();
    const holder = await viewerHolder(owner);
    const stranger = await createViewer('Bia');

    expect(
      (await gql(stranger, SET, { category: 'Mercado', holderId: holder.id, limitCents: 1 }))
        .errors
    ).toEqual(['NOT_FOUND']);
    expect(
      (await gql(owner, SET, { category: '  ', holderId: holder.id, limitCents: 1 })).errors
    ).toEqual(['BAD_USER_INPUT']);
    expect(await limitsOf(owner)).toEqual([]);
  });
});
