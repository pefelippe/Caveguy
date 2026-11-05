import type { PlanKey } from '@zapbots/graphql/server';

export interface PlanInfo {
  /** Jobs and Messages per month, before Usage code credits. */
  /** Custom Agentes the Organization may keep (docs/adr/0035). */
  agents: number;
  jobs: number;
  key: PlanKey;
  messages: number;
  name: string;
  /** What the Plan costs per month, for display; Stripe's Price is what is charged. */
  priceCents: number;
}

/**
 * The Plans and their Limits (docs/adr/0011). Their Prices live in Stripe (STRIPE_PRICE_PRO,
 * STRIPE_PRICE_MAX). Only Max makes custom Agentes.
 */
export const PLANS: Record<PlanKey, PlanInfo> = {
  FREE: { agents: 0, jobs: 30, key: 'FREE', messages: 300, name: 'Gratuito', priceCents: 0 },
  PRO: { agents: 0, jobs: 500, key: 'PRO', messages: 5000, name: 'Pro', priceCents: 3990 },
  MAX: { agents: 10, jobs: 1500, key: 'MAX', messages: 15000, name: 'Max', priceCents: 9990 },
};

/** Stripe statuses in which a paid Plan is in force. */
const IN_FORCE = new Set(['active', 'trialing', 'past_due']);

export function planInForce(row: { plan: PlanKey; status: string } | undefined): PlanKey {
  return row && IN_FORCE.has(row.status) ? row.plan : 'FREE';
}
