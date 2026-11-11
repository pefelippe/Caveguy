import { APP_NAME } from '@zapbots/finance';
import { MessageCircleIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';

import { Kbd } from '@zapbots/ui/blocks/kbd';

import { useI18n } from '../lib/i18n';
import { shortcut } from '../lib/shortcuts';
import { activeItem, useNav } from '../lib/nav';
import { useOpenCommandMenu } from './CommandMenu';
import { NotificationsButton } from './NotificationsButton';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useChatPanel } from './ChatPanel';
import { useChatNotice } from './AlertPreview';
import { UnreadBadge } from './Alerts';
import { ProfileMenu, type ProfileUser } from './ProfileMenu';

/** The pill floating at the bottom of the screen, after Pierre's: Conversar com o Caveguy opens the
 * chat panel, with the count of what waits there, and hides while it is open. On a computer; a
 * phone has the chat in its header and tabs (`MobileNav`). */
export function AddButton() {
  const { pathname } = useLocation();
  const { open } = useChatPanel();
  const { count, openChat } = useChatNotice();
  const { t } = useI18n();
  if (pathname === '/chat' || open) return null;
  return (
    <Button
      className="absolute bottom-6 left-1/2 z-30 hidden h-12 -translate-x-1/2 gap-2 rounded-full border bg-card px-6 text-[0.9375rem] font-medium text-foreground shadow-[0_12px_32px_-8px_rgb(0_0_0/0.3)] hover:bg-card active:scale-95 md:inline-flex print:hidden"
      onClick={openChat}
      variant="outline"
    >
      <SparklesIcon className="size-[18px] text-seal" />
      {t('finance.talk')}
      <UnreadBadge className="-top-1 -right-1" count={count} />
    </Button>
  );
}

/** The chat with the Agente, in the header: the count of what waits there (Avisos, a reply). */
function ChatButton() {
  const { pathname } = useLocation();
  const { open, toggle } = useChatPanel();
  const { count, openChat } = useChatNotice();
  const { t } = useI18n();
  if (pathname === '/chat') return null;
  return (
    <Button
      aria-expanded={open}
      aria-label={t('header.talk')}
      // On a phone only: a computer has the round chat button in the corner.
      className="relative size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground md:hidden"
      onClick={open ? toggle : openChat}
      size="icon"
      title={t('header.talk')}
      variant="ghost"
    >
      <MessageCircleIcon className="size-[18px]" />
      {!open && <UnreadBadge className="-top-1 -right-1" count={count} />}
    </Button>
  );
}

/** Buscar: the command menu (⌘K), every screen and action. */
function SearchButton() {
  const openCommandMenu = useOpenCommandMenu();
  const { t } = useI18n();
  return (
    <Button
      className="mr-1 hidden h-9 w-72 justify-start gap-2 rounded-lg bg-muted px-3 font-normal text-muted-foreground shadow-none hover:bg-accent hover:text-foreground md:inline-flex lg:w-96"
      onClick={openCommandMenu}
      variant="ghost"
    >
      <SearchIcon className="size-4" />
      {t('header.search')}…<Kbd className="ml-auto">{shortcut('K')}</Kbd>
    </Button>
  );
}

/** Where the User is, after WorkOS's: the Organization (a switcher), then the open screen. */
function Trail() {
  const { pathname } = useLocation();
  const nav = useNav();
  const open = activeItem(
    [...nav.main, ...nav.groups.flatMap(group => group.items), ...nav.account],
    pathname
  );
  return (
    <div className="hidden min-w-0 items-center gap-1.5 md:flex">
      <OrganizationSwitcher />
      {open && (
        <>
          <span aria-hidden className="text-muted-foreground/60">
            /
          </span>
          <span className="flex min-w-0 items-center gap-2 px-1.5 text-sm font-medium">
            <open.icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{open.label}</span>
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Over the screen, after WorkOS's: a line beneath it, level with the menu's top; on the left the
 * Organization and the open screen, on the right Buscar, the chat, the bell and the avatar. On a
 * phone, the mark in place of the trail.
 */
export function AppHeader({ user }: { user: ProfileUser }) {
  const { t } = useI18n();

  return (
    <header className="z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background pt-[env(safe-area-inset-top)] pr-3 pl-4 text-foreground md:px-4 print:hidden">
      {/* The mark is atop the menu on a computer; a phone has no menu on the left. */}
      <Link aria-label={t('rail.caishen')} className="flex items-center gap-2.5 md:hidden" to="/">
        <LogoBadge size={28} />
        <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
      </Link>
      <Trail />

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-1">
        <SearchButton />
        <ChatButton />
        <NotificationsButton />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
