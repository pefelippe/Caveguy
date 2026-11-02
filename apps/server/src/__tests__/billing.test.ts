import { closeDb, db, schema } from '@zapbots/database';
import { eq } from 'drizzle-orm';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { mswServer } from '../../test/msw/openrouter';
import { checkoutHandler, subscriptionsHandler } from '../../test/msw/stripe';
import app from '../app';
import { signWebhook } from '../services/billing/stripe';

let base = '';
let close: () => void;

beforeAll(async () => {
  mswServer.listen();
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});
beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_1';
  process.env.STRIPE_PRICE_PRO = 'price_pro';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
});
afterEach(() => {
  mswServer.resetHandlers();
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_PRO;
  delete process.env.STRIPE_WEBHOOK_SECRET;
});
afterAll(async () => {
  close();
  mswServer.close();
  await closeDb();
});

const START_CHECKOUT = /* GraphQL */ `
  mutation {
    startCheckout
  }
`;

describe('startCheckout', () => {
  it('sends the same Idempotency-Key to Stripe on every retry of one click', async () => {
    const stripe = checkoutHandler();
    mswServer.use(stripe.handler);
    const viewer = await createViewer();

    const first = await gql(viewer, START_CHECKOUT, {}, { idempotencyKey: 'click-0001' });
    const retry = await gql(viewer, START_CHECKOUT, {}, { idempotencyKey: 'click-0001' });

    expect(first.errors).toEqual([]);
    expect(retry.data.startCheckout).toBe(first.data.startCheckout);
    expect(stripe.keys).toEqual([
      `checkout:${viewer.organizationId}:click-0001`,
      `checkout:${viewer.organizationId}:click-0001`,
    ]);
  });

  it('sends no Idempotency-Key when the client gave none', async () => {
    const stripe = checkoutHandler();
    mswServer.use(stripe.handler);

    const result = await gql(await createViewer(), START_CHECKOUT);

    expect(result.errors).toEqual([]);
    expect(stripe.keys).toEqual([null]);
  });
});

/** Delivers an event to the webhook as Stripe would: the raw body, signed. */
async function deliver(event: object) {
  const body = JSON.stringify(event);
  const response = await fetch(`${base}/api/billing/webhook`, {
    body,
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signWebhook(body, 'whsec_test'),
    },
    method: 'POST',
  });
  return response.status;
}

/** A subscription of the Organization as Stripe keeps it. */
const subscriptionObject = (organizationId: string, status: string) => ({
  cancel_at_period_end: false,
  customer: `cus_${organizationId}`,
  id: `sub_${organizationId}`,
  metadata: { organizationId },
  status,
});

/** An event about it, carrying the subscription as it was when the event was made. */
const subscriptionEvent = (organizationId: string, status: string, id = crypto.randomUUID()) => ({
  data: { object: subscriptionObject(organizationId, status) },
  id: `evt_${id}`,
  type: 'customer.subscription.updated',
});

/** Stripe answering for the Organization's subscription: `status` is how it is now. */
function stripeHas(organizationId: string, status: string) {
  const stripe = subscriptionsHandler();
  stripe.subscriptions.set(`sub_${organizationId}`, subscriptionObject(organizationId, status));
  mswServer.use(stripe.handler);
  return (next: string) =>
    stripe.subscriptions.set(`sub_${organizationId}`, subscriptionObject(organizationId, next));
}

const subscriptionOf = async (organizationId: string) =>
  (
    await db
      .select()
      .from(schema.subscription)
      .where(eq(schema.subscription.organizationId, organizationId))
  )[0];

const eventRows = (id: string) =>
  db.select().from(schema.stripeEvent).where(eq(schema.stripeEvent.id, id));

describe('the Stripe webhook', () => {
  it('refuses a body whose signature does not match', async () => {
    const { organizationId } = await createViewer();
    const response = await fetch(`${base}/api/billing/webhook`, {
      body: JSON.stringify(subscriptionEvent(organizationId, 'active')),
      headers: { 'Stripe-Signature': signWebhook('{}', 'whsec_test') },
      method: 'POST',
    });
    expect(response.status).toBe(400);
    expect(await subscriptionOf(organizationId)).toBeUndefined();
  });

  it('applies an event delivered again only once', async () => {
    const { organizationId } = await createViewer();
    const becomes = stripeHas(organizationId, 'active');
    const active = subscriptionEvent(organizationId, 'active');

    expect(await deliver(active)).toBe(200);
    becomes('canceled');
    expect(await deliver(subscriptionEvent(organizationId, 'canceled'))).toBe(200);
    // The first event again, while Stripe says something else: answered, and nothing written.
    becomes('past_due');
    expect(await deliver(active)).toBe(200);

    expect(await subscriptionOf(organizationId)).toMatchObject({ status: 'canceled' });
    expect(await eventRows(active.id)).toHaveLength(1);
  });

  it('applies the same event delivered twice at the same time only once', async () => {
    const { organizationId } = await createViewer();
    stripeHas(organizationId, 'active');
    const active = subscriptionEvent(organizationId, 'active');

    expect(await Promise.all([deliver(active), deliver(active)])).toEqual([200, 200]);

    expect(await eventRows(active.id)).toHaveLength(1);
    expect(await subscriptionOf(organizationId)).toMatchObject({ plan: 'PRO', status: 'active' });
  });

  it('keeps how the subscription is now when an older event arrives after a newer one', async () => {
    const { organizationId } = await createViewer();
    const becomes = stripeHas(organizationId, 'active');
    const older = subscriptionEvent(organizationId, 'active');
    becomes('canceled');
    const newer = subscriptionEvent(organizationId, 'canceled');

    expect(await deliver(newer)).toBe(200);
    expect(await deliver(older)).toBe(200);

    expect(await subscriptionOf(organizationId)).toMatchObject({ status: 'canceled' });
  });

  it('takes a subscription Stripe no longer has as canceled', async () => {
    const { organizationId } = await createViewer();
    mswServer.use(subscriptionsHandler().handler);

    expect(await deliver(subscriptionEvent(organizationId, 'active'))).toBe(200);

    expect(await subscriptionOf(organizationId)).toMatchObject({ status: 'canceled' });
  });

  it('applies an event on the next try when applying it failed the first time', async () => {
    const { organizationId } = await createViewer();
    const other = await createViewer();
    stripeHas(organizationId, 'active');
    // Another Organization holds the customer the event names, so writing it fails.
    await db.insert(schema.subscription).values({
      organizationId: other.organizationId,
      stripeCustomerId: `cus_${organizationId}`,
    });
    const active = subscriptionEvent(organizationId, 'active');

    expect(await deliver(active)).toBe(500);
    expect(await eventRows(active.id)).toEqual([]);

    await db
      .update(schema.subscription)
      .set({ stripeCustomerId: null })
      .where(eq(schema.subscription.organizationId, other.organizationId));
    expect(await deliver(active)).toBe(200);
    expect(await subscriptionOf(organizationId)).toMatchObject({ status: 'active' });
  });
});
