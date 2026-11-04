import { useMutation, useQuery } from '@apollo/client/react';
import {
  BotsDocument,
  DismissAlertDocument,
  MarkAlertsReadDocument,
  type AlertKind,
  type BotKey,
} from '@zapbots/graphql/client';
import {
  CalendarClockIcon,
  CircleAlertIcon,
  CreditCardIcon,
  CheckIcon,
  GaugeIcon,
  MoreHorizontalIcon,
  RefreshCwOffIcon,
  Trash2Icon,
  TrendingUpIcon,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n, type StringKey } from '../lib/i18n';
import { useToast } from './Toaster';

/** Each kind of Aviso: its mark, its short title and how loud it is. */
const KINDS: Record<AlertKind, { icon: LucideIcon; title: StringKey; tone: string }> = {
  ABOVE_MARKET: {
    icon: TrendingUpIcon,
    title: 'notifications.aboveMarket',
    tone: 'bg-warning/15 text-warning',
  },
  DUE_SOON: {
    icon: CalendarClockIcon,
    title: 'notifications.dueSoon',
    tone: 'bg-primary/10 text-primary',
  },
  HIGH_UTILIZATION: {
    icon: CreditCardIcon,
    title: 'notifications.highUtilization',
    tone: 'bg-warning/15 text-warning',
  },
  OVERDUE: {
    icon: CircleAlertIcon,
    title: 'notifications.overdue',
    tone: 'bg-destructive/10 text-destructive',
  },
  ROUTINE_FAILED: {
    icon: RefreshCwOffIcon,
    title: 'notifications.routineFailed',
    tone: 'bg-muted text-muted-foreground',
  },
  STALE_ASSESSMENT: {
    icon: GaugeIcon,
    title: 'notifications.staleAssessment',
    tone: 'bg-muted text-muted-foreground',
  },
};

/** Overdue first, then what falls due, then the rest. */
const ORDER: AlertKind[] = [
  'OVERDUE',
  'DUE_SOON',
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

/**
 * The Avisos, in the chat panel: each with its mark and a short title over the detail. Opening one
 * marks it read and calls `onOpen`; its ⋯ menu marks it read or removes it, and the top marks all read.
 */
export function AlertList({ onOpen }: { onOpen?: () => void }) {
  const { t } = useI18n();
  const { alerts, dismiss, read, readAll, unread } = useAlerts();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex h-8 items-center justify-between gap-2 pl-1">
        <p className="font-semibold">{t('notifications.label')}</p>
        {unread.length > 0 && (
          <Button className="h-8 px-2 text-xs" onClick={readAll} size="sm" variant="ghost">
            <CheckIcon className="size-3.5" />
            {t('notifications.readAll')}
          </Button>
        )}
      </div>
      {alerts.length === 0 ? (
        <p className="px-4 pt-10 text-center text-sm text-muted-foreground">
          {t('notifications.empty')}
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none]">
          {alerts.map(alert => {
            const kind = KINDS[alert.kind];
            const body = (
              <>
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full',
                    kind.tone,
                    alert.read && 'opacity-60'
                  )}
                >
                  <kind.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm',
                      alert.read ? 'text-muted-foreground' : 'font-semibold'
                    )}
                  >
                    {t(kind.title)}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                    {alert.message}
                  </span>
                </span>
              </>
            );
            const row = 'flex gap-3 rounded-lg py-2.5 pr-10 pl-2 pointer-coarse:pr-12';
            return (
              <li className="group relative" key={alert.id}>
                {alert.href ? (
                  <Link
                    className={cn(row, 'transition-colors hover:bg-foreground/5')}
                    onClick={() => {
                      if (!alert.read) read(alert.bot, [alert.id]);
                      onOpen?.();
                    }}
                    to={alert.href}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={row}>{body}</div>
                )}
                {!alert.read && (
                  <span
                    aria-hidden
                    className="absolute top-4 right-3.5 size-2 rounded-full bg-primary group-hover:hidden group-has-data-[state=open]:hidden pointer-coarse:hidden"
                  />
                )}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={t('notifications.options')}
                      className="absolute top-2 right-1.5 size-7 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:right-0 pointer-coarse:opacity-100"
                      size="icon"
                      variant="ghost"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!alert.read && (
                      <DropdownMenuItem onSelect={() => read(alert.bot, [alert.id])}>
                        <CheckIcon />
                        {t('notifications.markRead')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onSelect={() => dismiss(alert.bot, alert.id)}
                      variant="destructive"
                    >
                      <Trash2Icon />
                      {t('notifications.dismiss')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
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
