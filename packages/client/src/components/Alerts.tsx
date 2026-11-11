import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import {
  BotsDocument,
  ConversationsDocument,
  DeliverAlertsDocument,
  DismissAlertDocument,
  MarkAlertsReadDocument,
  type AlertKind,
  type BotKey,
} from '@zapbots/graphql/client';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n } from '../lib/i18n';
import { useToast } from './Toaster';

/** Overdue first, then what falls due, then the rest. */
const ORDER: AlertKind[] = [
  'OVERDUE',
  'DUE_SOON',
  'OVER_LIMIT',
  'HIGH_UTILIZATION',
  'ABOVE_MARKET',
  'STALE_ASSESSMENT',
  'ROUTINE_FAILED',
];

/** Every Bot's Alerts, overdue ones first, and the ways to read and remove them. */
export function useAlerts() {
  const { t } = useI18n();
  const { data } = useQuery(BotsDocument, { fetchPolicy: 'cache-and-network' });
  const [markRead] = useMutation(MarkAlertsReadDocument);
  const [dismissAlert] = useMutation(DismissAlertDocument);
  const toast = useToast();

  const alerts = (data?.bots ?? [])
    .flatMap(bot => bot.alerts.map(alert => ({ ...alert, bot: bot.key })))
    .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const unread = alerts.filter(alert => !alert.read);

  // Reading and removing show at once; if the server says no, the Alerts go back as they were.
  const failed = () => void toast({ message: t('notifications.failed'), tone: 'error' });
  const alertsOf = (bot: BotKey) => data?.bots.find(candidate => candidate.key === bot);
  const read = (bot: BotKey, ids: string[]) => {
    const owner = alertsOf(bot);
    void markRead({
      optimisticResponse: owner && {
        // Spread from the cache, so the Bot keeps its __typename and lands on itself.
        markAlertsRead: {
          ...owner,
          alerts: owner.alerts.map(alert =>
            ids.includes(alert.id) ? { ...alert, read: true } : alert
          ),
        },
      },
      variables: { bot, ids },
    }).catch(failed);
  };
  const dismiss = (bot: BotKey, id: string) => {
    const owner = alertsOf(bot);
    void dismissAlert({
      optimisticResponse: owner && {
        dismissAlert: { ...owner, alerts: owner.alerts.filter(alert => alert.id !== id) },
      },
      variables: { bot, id },
    }).catch(failed);
  };
  const readAll = () => {
    for (const bot of new Set(unread.map(alert => alert.bot))) {
      read(
        bot,
        unread.filter(alert => alert.bot === bot).map(alert => alert.id)
      );
    }
  };

  return { alerts, dismiss, read, readAll, unread };
}

/** The unread count, on the buttons that lead to the Avisos. */
export function UnreadBadge({ className, count }: { className?: string; count: number }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        'pointer-events-none absolute grid h-[18px] min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-white ring-2 ring-background tabular-nums',
        className
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

/**
 * The Avisos as the Agente's messages: the Financeiro's Avisos Conversation and the Avisos posted
 * there and not read yet, for the badge on the Agente's button.
 */
export function useAlertsInbox() {
  const { data } = useQuery(BotsDocument, { fetchPolicy: 'cache-first' });
  const finance = data?.bots.find(bot => bot.key === 'FINANCE');
  return {
    conversationId: finance?.alertsConversation?.id ?? null,
    unread: finance?.alerts.filter(alert => alert.sent && !alert.read) ?? [],
  };
}

/** Once per load, the Financeiro posts its new Avisos in the Avisos Conversation (once a day). */
export function useDeliverAlerts() {
  const [deliver] = useMutation(DeliverAlertsDocument, { refetchQueries: [ConversationsDocument] });
  useEffect(() => {
    // Nothing to show when it fails: the Avisos wait for the next load.
    deliver({ variables: { bot: 'FINANCE' } }).catch(() => undefined);
  }, [deliver]);
}

/** Opening the Avisos Conversation reads the Avisos posted in it. */
export function useSeenAlerts(conversationId: string | null) {
  const { conversationId: inbox, unread } = useAlertsInbox();
  const { read } = useAlerts();
  const ids = unread.map(alert => alert.id).join(',');
  useEffect(() => {
    if (conversationId && conversationId === inbox && ids) read('FINANCE', ids.split(','));
    // `read` changes each render; the ids say when there is something new to read.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, inbox, ids]);
}
