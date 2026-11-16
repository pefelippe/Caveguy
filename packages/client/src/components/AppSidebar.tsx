import { APP_NAME } from '@zapbots/finance';
import {
  ChevronRightIcon,
  CircleHelpIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  PanelLeftIcon,
  ShieldIcon,
} from 'lucide-react';
import type { ContactKind } from '@zapbots/graphql/client';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@zapbots/ui/components/sidebar';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n } from '../lib/i18n';
import { activeItem, useNav, type NavItem } from '../lib/nav';
import { ContactDialog } from './ContactDialog';
import { OrganizationSwitcher } from './OrganizationSwitcher';

// Entries 34px tall with 16px icons; the open one a grey step (docs/design-guide.md). Collapsed,
// each is its icon alone.
const ITEM =
  'h-[34px] gap-2.5 rounded-md px-2.5 text-sm font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground hover:data-[active=true]:bg-sidebar-accent [&>svg]:size-4 [&>svg]:text-muted-foreground data-[active=true]:[&>svg]:text-foreground group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-2.5!';

// The pill on an entry's right: Em breve and Beta neutral, Novo in soft blue (design guide § 7.4)
const PILL = 'top-2 h-[18px] rounded border px-1.5 text-[11px] font-medium';

function Pill({ kind }: { kind: 'beta' | 'new' | 'soon' }) {
  const { t } = useI18n();
  return (
    <SidebarMenuBadge
      className={cn(
        PILL,
        kind === 'new'
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'bg-sidebar text-muted-foreground'
      )}
    >
      {t(kind === 'new' ? 'nav.new' : kind === 'beta' ? 'nav.beta' : 'nav.soon')}
    </SidebarMenuBadge>
  );
}

function NavItems({ active, items }: { active: NavItem | undefined; items: NavItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
      {items.map(item => (
        <SidebarMenuItem data-area={item.area} key={item.to}>
          {item.soon ? (
            <>
              <SidebarMenuButton
                aria-disabled
                className={cn(ITEM, 'pointer-events-none pr-20 text-sidebar-foreground/50')}
                tabIndex={-1}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
              <Pill kind="soon" />
            </>
          ) : (
            <>
              <SidebarMenuButton
                asChild
                className={cn(ITEM, (item.badge || item.chevron) && 'pr-14')}
                isActive={item === active}
                tooltip={item.label}
              >
                <NavLink onClick={() => isMobile && setOpenMobile(false)} to={item.to}>
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
              {item.badge && <Pill kind={item.badge} />}
              {item.chevron && (
                <SidebarMenuBadge className="top-2 text-muted-foreground">
                  <ChevronRightIcon aria-hidden className="size-4" />
                </SidebarMenuBadge>
              )}
            </>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/** Atop the menu, after the Nylas console: the mark and the Organization (a switcher); its line
 * runs level with the header's. Collapsed, the mark alone. */
function MenuTop() {
  return (
    <SidebarHeader className="h-(--header-height) shrink-0 flex-row items-center gap-1.5 border-b border-sidebar-border px-3 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Link aria-label={APP_NAME} className="shrink-0" to="/">
        <LogoBadge size={28} />
      </Link>
      <OrganizationSwitcher className="max-w-full min-w-0 flex-1 justify-between group-data-[collapsible=icon]:hidden" />
    </SidebarHeader>
  );
}

/** At the menu's foot (design guide § 7.12): Suporte, Privacidade (a new tab, so ↗),
 * Enviar feedback, a line, and Recolher menu (⌘B/Ctrl+B). Suporte and Enviar feedback open a form
 * in the app (`ContactDialog`). The account is in the header. */
function MenuFoot() {
  const { toggleSidebar } = useSidebar();
  const { t } = useI18n();
  const [contact, setContact] = useState<ContactKind | null>(null);
  return (
    <SidebarFooter className="gap-0 border-t border-sidebar-border p-2.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
      <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem>
          <SidebarMenuButton
            className={ITEM}
            onClick={() => setContact('SUPPORT')}
            tooltip={t('nav.support')}
          >
            <CircleHelpIcon />
            <span>{t('nav.support')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className={ITEM} tooltip={t('nav.privacy')}>
            {/* the legal pages live on the site, outside the app's router: a full page in a new tab */}
            <a href="/privacy" rel="noopener noreferrer" target="_blank">
              <ShieldIcon />
              <span>{t('nav.privacy')}</span>
              <ExternalLinkIcon aria-hidden className="size-3.5! text-muted-foreground" />
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            className={ITEM}
            onClick={() => setContact('FEEDBACK')}
            tooltip={t('nav.feedback')}
          >
            <MessageSquareIcon />
            <span>{t('nav.feedback')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {contact && <ContactDialog kind={contact} onClose={() => setContact(null)} />}
      <SidebarSeparator className="mx-0 my-1.5" />
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem>
          <SidebarMenuButton className={ITEM} onClick={toggleSidebar} tooltip={t('nav.collapse')}>
            <PanelLeftIcon />
            <span>{t('nav.collapseMenu')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

/**
 * The menu on the left, after the Nylas console (docs/design-guide.md): the mark and the
 * Organization on top, Visão geral and Caveguy, then each group under its small title (Finanças,
 * Pessoal, Ferramentas), and the foot. ⌘B/Ctrl+B (or the command menu) collapses it to its icons,
 * hiding the titles.
 */
export function AppSidebar() {
  const { pathname } = useLocation();
  const nav = useNav();
  const active = activeItem([...nav.main, ...nav.groups.flatMap(group => group.items)], pathname);

  return (
    <Sidebar className="overflow-hidden border-r border-sidebar-border" collapsible="icon">
      <MenuTop />
      <SidebarContent className="gap-0 px-2.5 pt-3 pb-6 [scrollbar-width:none] group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <NavItems active={active} items={nav.main} />
          </SidebarGroupContent>
        </SidebarGroup>
        {nav.groups.map(group => (
          <SidebarGroup className="mt-3 p-0" data-area={group.area} key={group.key}>
            <SidebarGroupLabel className="h-7 px-2.5 text-xs font-medium text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems active={active} items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <MenuFoot />
    </Sidebar>
  );
}
