import { APP_NAME } from '@zapbots/finance';
import { BellIcon, MessageCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@zapbots/ui/components/popover';

import { useI18n } from '../lib/i18n';
import { pageTitle } from '../lib/title';
import { useChatPanel } from './ChatPanel';
import { AlertList, UnreadBadge, useAlerts } from './Alerts';
import { ProfileMenu, type ProfileUser } from './ProfileMenu';

/** The Agente: a round button floating in the bottom right corner that opens the chat panel, which
 * then takes its place. Not on its own page, nor on a phone, where it sits in the middle of the tabs
 * (`MobileNav`). */
export function AgentButton() {
  const { pathname } = useLocation();
  const { open, toggle } = useChatPanel();
  const { t } = useI18n();
  if (pathname === '/chat' || open) return null;

  return (
    <Button
      aria-expanded={open}
      className="fixed right-6 bottom-6 z-30 hidden size-14 rounded-full shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35)] md:inline-flex print:hidden"
      onClick={toggle}
      title={t('header.talk')}
    >
      <MessageCircleIcon className="size-6" />
      <span className="sr-only">{t('header.talk')}</span>
    </Button>
  );
}

/** The bell in the header: the unread count on it, the Avisos in a popover under it. */
function AlertsButton() {
  const { t } = useI18n();
  const { unread } = useAlerts();
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={
            unread.length
              ? `${t('notifications.label')} (${unread.length})`
              : t('notifications.label')
          }
          className="relative size-10 rounded-full"
          size="icon"
          title={t('notifications.label')}
          variant="ghost"
        >
          <BellIcon className="size-5" />
          <UnreadBadge className="-top-0.5 -right-0.5" count={unread.length} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex max-h-[min(32rem,70svh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col p-3"
      >
        <AlertList onOpen={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * The bar over the screen: the page's title and, on the right, the avatar with the User's name, whose menu holds the account's screens, the language, the theme and signing out.
 * The mark sits atop the menu (`AppSidebar`); only a phone, with no menu, shows it here.
 */
export function AppHeader({ user }: { user: ProfileUser }) {
  const { t } = useI18n();
  const { pathname } = useLocation();

  return (
    <header className="z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background pt-[env(safe-area-inset-top)] pr-3 pl-4 text-foreground md:pr-6 print:hidden">
      <Link aria-label={t('rail.caishen')} className="flex items-center gap-2.5 md:hidden" to="/">
        <LogoBadge size={28} />
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      </Link>

      <p className="hidden flex-1 truncate text-base font-semibold tracking-tight md:block">
        {pageTitle(pathname)}
      </p>
      <div className="flex-1 md:hidden" />

      <div className="flex shrink-0 items-center gap-2">
        <AlertsButton />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
