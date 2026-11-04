import { Link, useLocation } from 'react-router-dom';

import { AgentIcon } from '@zapbots/ui/blocks/agent-icon';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';

import { useI18n } from '../lib/i18n';
import { pageTitle } from '../lib/title';
import { useChatPanel } from './ChatPanel';
import { UnreadBadge, useAlerts } from './Alerts';
import { ProfileMenu, type ProfileUser } from './ProfileMenu';

/** The Agente: opens or closes the chat panel. Not on its own page, nor on a phone, where it sits
 * in the middle of the tabs (`MobileNav`). */
function AgentButton() {
  const { pathname } = useLocation();
  const { open, toggle } = useChatPanel();
  const { t } = useI18n();
  // The Avisos live in the chat panel now; their unread count rides on the button that opens it.
  const { unread } = useAlerts();
  if (pathname === '/chat') return null;

  return (
    <Button
      aria-expanded={open}
      aria-label={
        unread.length
          ? `${t('header.talk')} (${unread.length} ${t('notifications.label')})`
          : undefined
      }
      className="relative hidden h-10 rounded-xl px-4 font-medium md:inline-flex"
      onClick={toggle}
    >
      <AgentIcon className="size-[18px]" />
      {t('header.talk')}
      <UnreadBadge className="-top-1.5 -right-1.5" count={unread.length} />
    </Button>
  );
}

/**
 * The white bar over the screen: on the right Caishen Chat (which also holds the Avisos) and the
 * avatar with the User's name, whose menu holds the account's screens, the language, the theme and signing out.
 * The mark sits atop the menu (`AppSidebar`); only a phone, with no menu, shows it here.
 */
export function AppHeader({ user }: { user: ProfileUser }) {
  const { t } = useI18n();
  const { pathname } = useLocation();

  return (
    <header className="z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background pt-[env(safe-area-inset-top)] pr-3 pl-4 text-foreground md:pr-6 print:hidden">
      <Link aria-label={t('rail.caishen')} className="flex items-center gap-2.5 md:hidden" to="/">
        <LogoBadge size={28} />
        <span className="text-base font-semibold tracking-tight">Caishen</span>
      </Link>

      <p className="hidden flex-1 truncate text-base font-semibold tracking-tight md:block">
        {pageTitle(pathname)}
      </p>
      <div className="flex-1 md:hidden" />

      <div className="flex shrink-0 items-center gap-2">
        <AgentButton />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
