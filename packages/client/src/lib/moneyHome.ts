import { useQuery } from '@apollo/client/react';
import { MoneyHomeDocument } from '@zapbots/graphql/client';

import { localToday } from './bots';
import { previousMonth } from './overview';

/** What the payoff plan tries a month on top of the installments. */
export const EXTRA_CENTS = 30_000;

/** The Visão geral's one query, shared by the page and the band atop it (Apollo asks once). */
export function useMoneyHome() {
  const today = localToday();
  const month = today.slice(0, 7);
  const result = useQuery(MoneyHomeDocument, {
    fetchPolicy: 'cache-and-network',
    variables: { month, monthlyExtraCents: EXTRA_CENTS, previous: previousMonth(month) },
  });
  return { ...result, today };
}
