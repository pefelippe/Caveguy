import type { AlertKind } from '@zapbots/graphql/client';
import { BellIcon, CheckCheckIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@zapbots/ui/components/popover';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n, type StringKey } from '../lib/i18n';
import { UnreadBadge, useAlerts } from './Alerts';

const KIND: Record<AlertKind, StringKey> = {
  ABOVE_MARKET: 'notifications.aboveMarket',
  DUE_SOON: 'notifications.dueSoon',
  HIGH_UTILIZATION: 'notifications.highUtilization',
  OVERDUE: 'notifications.overdue',
  OVER_LIMIT: 'notifications.overLimit',
  ROUTINE_FAILED: 'notifications.routineFailed',
  STALE_ASSESSMENT: 'notifications.staleAssessment',
};

/**
 * The bell, after WorkOS's: the Avisos in a list right under it, the unread ones marked; opening
 * one reads it and goes to its screen, and each can be removed. The Agente still posts them in its
 * Avisos Conversation (`deliverAlerts`).
 */
export function NotificationsButton() {
  const { t } = useI18n();
  const { alerts, dismiss, read, readAll, unread } = useAlerts();
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={t('notifications.label')}
          className="relative size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          size="icon"
          variant="ghost"
        >
          <BellIcon className="size-[18px]" />
          <UnreadBadge className="-top-1 -right-1" count={unread.length} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] rounded-xl p-0" sideOffset={8}>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-sm font-semibold">{t('notifications.label')}</h2>
          <Button
            className="h-7 gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
            disabled={unread.length === 0}
            onClick={readAll}
            size="sm"
            variant="ghost"
          >
            <CheckCheckIcon className="size-3.5" />
            {t('notifications.readAll')}
          </Button>
        </div>
        {alerts.length === 0 ? (
          <p className="px-4 pt-2 pb-6 text-sm text-muted-foreground">{t('notifications.empty')}</p>
        ) : (
          <ul className="max-h-[60svh] overflow-y-auto p-1.5 pt-0">
            {alerts.map(alert => (
              <li className="group relative" key={alert.id}>
                <Link
                  className="flex gap-3 rounded-lg px-2.5 py-2.5 pr-9 transition-colors hover:bg-accent"
                  onClick={() => {
                    if (!alert.read) read(alert.bot, [alert.id]);
                    setOpen(false);
                  }}
                  to={alert.href ?? '/caishen'}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      alert.read ? 'bg-transparent' : 'bg-destructive'
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-muted-foreground">
                      {t(KIND[alert.kind])}
                    </span>
                    <span
                      className={cn(
                        'block text-sm',
                        alert.read ? 'text-muted-foreground' : 'text-foreground'
                      )}
                    >
                      {alert.message}
                    </span>
                  </span>
                </Link>
                <Button
                  aria-label={t('notifications.dismiss')}
                  className="absolute top-2 right-1.5 size-7 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
                  onClick={() => dismiss(alert.bot, alert.id)}
                  size="icon"
                  variant="ghost"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
