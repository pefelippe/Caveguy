import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import { and, asc, count, eq } from 'drizzle-orm';

import { badInput, findHolder } from '../resolvers/guards';
import { spendingOf } from './budget';

/** Limites one Holder may keep. */
export const MAX_CATEGORY_LIMITS = 30;
/** The most one Limite may be: R$ 1 billion, far past any month. */
const MAX_LIMIT_CENTS = 100_000_000_000;

/** A Holder's Limites de categoria, each with what the month spent on it. */
export async function categoryLimits(holderId: string, month: string) {
  const limits = await db
    .select()
    .from(schema.categoryLimit)
    .where(eq(schema.categoryLimit.holderId, holderId))
    .orderBy(asc(schema.categoryLimit.category));
  if (!limits.length) return [];
  const { spending } = await spendingOf(holderId, month);
  // The same category typed with other case or spaces counts as one.
  const key = (category: string) => category.trim().toLocaleLowerCase('pt-BR');
  const spent = new Map<string, number>();
  for (const item of spending) {
    spent.set(key(item.category), (spent.get(key(item.category)) ?? 0) + item.amountCents);
  }
  return limits.map(limit => ({ ...limit, spentCents: spent.get(key(limit.category)) ?? 0 }));
}

/** Sets, changes or (with no amount) removes the Holder's Limite on one category. */
export async function setCategoryLimit(
  viewer: Viewer,
  input: { category: string; holderId: string; limitCents?: number | null }
) {
  const holder = await findHolder(viewer, input.holderId);
  const category = input.category.trim().slice(0, 60);
  if (!category) badInput('Diga a categoria.');
  const where = and(
    eq(schema.categoryLimit.holderId, holder.id),
    eq(schema.categoryLimit.category, category)
  );
  if (!input.limitCents) {
    await db.delete(schema.categoryLimit).where(where);
    return holder;
  }
  if (!Number.isInteger(input.limitCents) || input.limitCents < 0) badInput('Valor inválido.');
  if (input.limitCents > MAX_LIMIT_CENTS) badInput('Valor alto demais.');
  const [{ total }] = (await db
    .select({ total: count() })
    .from(schema.categoryLimit)
    .where(eq(schema.categoryLimit.holderId, holder.id))) as [{ total: number }];
  const [existing] = await db
    .select({ id: schema.categoryLimit.id })
    .from(schema.categoryLimit)
    .where(where);
  if (!existing && total >= MAX_CATEGORY_LIMITS) {
    badInput(`Você já tem ${MAX_CATEGORY_LIMITS} limites. Apague um para criar outro.`);
  }
  await db
    .insert(schema.categoryLimit)
    .values({
      category,
      holderId: holder.id,
      limitCents: input.limitCents,
      organizationId: holder.organizationId,
    })
    .onConflictDoUpdate({
      set: { limitCents: input.limitCents, updatedAt: new Date() },
      target: [schema.categoryLimit.holderId, schema.categoryLimit.category],
    });
  return holder;
}
