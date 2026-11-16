import { APP_NAME } from '@zapbots/finance';
import { MessageCircleIcon, SearchIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';

import { Kbd } from '@zapbots/ui/blocks/kbd';

import { useI18n } from '../lib/i18n';
import { shortcut } from '../lib/shortcuts';
import { activeItem, useNav } from '../lib/nav';
import { useOpenCommandMenu } from './CommandMenu';
import { NotificationsButton } from './NotificationsButton';
import { useChatPanel } from './ChatPanel';
import { useChatNotice } from './AlertPreview';
import { UnreadBadge } from './Alerts';
import { ProfileMenu, type ProfileUser } from './ProfileMenu';

/** One cell of the header's right side, set apart by a line on its left (docs/design-guide.md). */
const CELL = 'flex items-center md:border-l md:px-3';

/** The chat with the Agente: Conversar com o Caveguy on a computer, an icon on a phone, with the
 * count of what waits there (Avisos, a reply). */
function ChatButton() {
  const { pathname } = useLocation();
  const { open, toggle } = useChatPanel();
  const { count, openChat } = useChatNotice();
  const { t } = useI18n();
  if (pathname === '/chat') return null;
  return (
    <div className={CELL}>
      <Button
        aria-expanded={open}
        aria-label={t('finance.talk')}
        className="relative size-9 gap-2 text-muted-foreground hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground md:h-8 md:w-auto md:px-2.5 md:text-foreground"
        onClick={open ? toggle : openChat}
        variant="ghost"
      >
        <MessageCircleIcon className="size-[18px] md:size-4" />
        <span className="hidden md:inline">{t('finance.talk')}</span>
        {!open && <UnreadBadge className="-top-1 -right-1" count={count} />}
      </Button>
    </div>
  );
}

/** Buscar: the command menu (⌘K), every screen and action. */
function SearchButton() {
  const openCommandMenu = useOpenCommandMenu();
  const { t } = useI18n();
  return (
    <Button
      className="hidden h-9 w-64 justify-start gap-2 px-2.5 font-normal text-muted-foreground shadow-none hover:bg-card hover:text-foreground md:inline-flex lg:w-96"
      onClick={openCommandMenu}
      variant="outline"
    >
      <SearchIcon className="size-4" />
      {t('header.search')}…<Kbd className="ml-auto">{shortcut('K')}</Kbd>
    </Button>
  );
}

/** The open screen, its icon and name. */
function Trail() {
  const { pathname } = useLocation();
  const nav = useNav();
  const open = activeItem(
    [...nav.main, ...nav.groups.flatMap(group => group.items), ...nav.account],
    pathname
  );
  if (!open) return null;
  return (
    <span className="hidden min-w-0 items-center gap-2 text-sm font-medium md:flex">
      <open.icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{open.label}</span>
    </span>
  );
}

/**
 * Over the screen, after the Nylas console (docs/design-guide.md): white, a line beneath it level
 * with the menu's top; on the left the open screen and Buscar, on the right cells divided by lines:
 * the chat, the bell and the account. On a phone, the mark in place of the trail.
 */
export function AppHeader({ user }: { user: ProfileUser }) {
  const { t } = useI18n();

  return (
    <header className="z-20 flex h-(--header-height) shrink-0 items-stretch border-b bg-background pt-[env(safe-area-inset-top)] text-foreground print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-4 pr-3 pl-4">
        {/* The mark is atop the menu on a computer; a phone has no menu on the left. */}
        <Link aria-label={t('rail.caishen')} className="flex items-center gap-2.5 md:hidden" to="/">
          <LogoBadge size={28} />
          <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
        <Trail />
        <div className="flex-1" />
        <SearchButton />
      </div>
      <div className="flex shrink-0 items-stretch pr-2 md:pr-0">
        <ChatButton />
        <div className={CELL}>
          <NotificationsButton />
        </div>
        <div className={CELL}>
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
