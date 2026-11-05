import { db, schema } from '@zapbots/database';
import type { Resolvers } from '@zapbots/graphql/server';
import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import {
  billingState,
  redeemUsageCode,
  subscriptionOf,
  UsageCodeError,
} from '../services/billing/billing';
import { PLANS } from '../services/billing/plans';
import {
  createCheckoutSession,
  createPortalSession,
  priceOf,
  StripeError,
  stripeConfigured,
} from '../services/billing/stripe';
import { badInput, requireViewer } from './guards';
import { requireAdmin } from './settings';

const clientOrigin = () => process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const returnUrl = () => `${clientOrigin()}/app/plan`;

async function state(viewer: Parameters<typeof billingState>[0]) {
  return { ...(await billingState(viewer)), configured: stripeConfigured() };
}

/** Stripe's refusals reach the User as a plain message, not a server error. */
async function stripe<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof StripeError) {
      throw new GraphQLError(error.message, { extensions: { code: 'BILLING_UNAVAILABLE' } });
    }
    throw error;
  }
}

export const billingResolvers: Resolvers = {
  Mutation: {
    openBillingPortal: async (_, __, context) => {
      const viewer = requireViewer(context);
      await requireAdmin(viewer);
      const subscription = await subscriptionOf(viewer.organizationId);
      if (!subscription?.stripeCustomerId) badInput('A Organização ainda não tem Assinatura.');
      return stripe(() => createPortalSession(subscription.stripeCustomerId!, returnUrl()));
    },
    redeemUsageCode: async (_, { code }, context) => {
      const viewer = requireViewer(context);
      await requireAdmin(viewer);
      try {
        await redeemUsageCode(viewer, code);
      } catch (error) {
        if (error instanceof UsageCodeError) badInput(error.message);
        throw error;
      }
      return state(viewer);
    },
    startCheckout: async (_, { plan: wanted }, context) => {
      const viewer = requireViewer(context);
      await requireAdmin(viewer);
      if (!stripeConfigured()) badInput('A cobrança não está configurada no servidor.');
      const current = await billingState(viewer);
      const plan = wanted === 'MAX' ? 'MAX' : 'PRO';
      const price = priceOf(plan);
      if (!price) badInput(`O Plano ${PLANS[plan].name} ainda não está à venda.`);
      // A second subscription would charge twice: changing a paid Plan goes through Stripe's page.
      if (current.plan.key !== 'FREE') {
        badInput(
          `A Organização já está no Plano ${current.plan.name}. Para trocar, use Gerenciar assinatura.`
        );
      }
      const [user] = await db
        .select({ email: schema.user.email })
        .from(schema.user)
        .where(eq(schema.user.id, viewer.userId));
      const subscription = await subscriptionOf(viewer.organizationId);
      return stripe(() =>
        createCheckoutSession({
          customerId: subscription?.stripeCustomerId ?? null,
          email: user!.email,
          idempotencyKey: context.idempotencyKey,
          organizationId: viewer.organizationId,
          price: price!,
          returnUrl: returnUrl(),
        })
      );
    },
  },
  Query: {
    billing: (_, __, context) => state(requireViewer(context)),
    plans: () => Object.values(PLANS),
  },
};
