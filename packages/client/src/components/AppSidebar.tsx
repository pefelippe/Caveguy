import { APP_NAME } from '@zapbots/finance';
import { Link, NavLink, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@zapbots/ui/components/sidebar';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n } from '../lib/i18n';
import { activeItem, useNav, type NavGroup, type NavItem } from '../lib/nav';

// Entries 40px tall, their icon and a group's title on one left edge, 24px in from the menu's side,
// the same edge as the mark on top. On the dark menu the open entry is white on a lighter ink; hovering one gives it the same ground. Collapsed,
// each is its icon alone.
const ITEM =
  'h-10 gap-3 rounded-lg px-3 text-[0.9375rem] font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full data-[active=true]:before:bg-seal hover:data-[active=true]:bg-sidebar-accent hover:data-[active=true]:text-sidebar-accent-foreground [&>svg]:size-5 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-[10px]!';

function NavItems({ active, items }: { active: NavItem | undefined; items: NavItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useI18n();

  return (
    <SidebarMenu className="gap-px group-data-[collapsible=icon]:items-center">
      {items.map(item => (
        <SidebarMenuItem key={item.to}>
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
              <SidebarMenuBadge className="top-2 h-5 rounded-full bg-sidebar-accent px-2 text-[11px] font-medium text-sidebar-primary">
                {t('nav.soon')}
              </SidebarMenuBadge>
            </>
          ) : (
            <SidebarMenuButton
              asChild
              className={ITEM}
              isActive={item === active}
              tooltip={item.label}
            >
              <NavLink onClick={() => isMobile && setOpenMobile(false)} to={item.to}>
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/** A titled part of the menu. Collapsed to icons, the menu has no titles, only the entries. */
function Group({ active, group }: { active: NavItem | undefined; group: NavGroup }) {
  // Each group's icons take its area's colour (`data-area` in styles.css).
  return (
    <SidebarGroup
      className="p-0 [&_[data-sidebar=menu-button]>svg]:text-(--area,currentColor)"
      data-area={group.area}
    >
      <SidebarGroupLabel className="mt-6 mb-1 h-6 px-3 text-[0.8125rem] font-medium text-sidebar-foreground/80">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <NavItems active={active} items={group.items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** The mark atop the menu. It collapses with ⌘B/Ctrl+B or the command menu; there is no button for it. */
function MenuTop() {
  const { t } = useI18n();
  return (
    <SidebarHeader className="h-(--header-height) shrink-0 flex-row items-center px-6 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Link aria-label={t('rail.caishen')} className="flex items-center gap-2.5" to="/">
        <LogoBadge size={40} />
        <span className="text-xl font-semibold tracking-tight text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
          {APP_NAME}
        </span>
      </Link>
    </SidebarHeader>
  );
}

/**
 * The white menu on the left, the full height of the window, after Mercado Pago's: the mark and the
 * button that collapses it on top, the screens used most, then Finanças under its title. ⌘B/Ctrl+B
 * (or the command menu) collapses it to its icons. On a phone it slides in from
 * the header's button.
 */
export function AppSidebar() {
  const { pathname } = useLocation();
  const nav = useNav();
  const items = [...nav.main, ...nav.groups.flatMap(group => group.items)];
  const active = activeItem(items, pathname);

  return (
    <Sidebar className="overflow-hidden border-r-0" collapsible="icon">
      <MenuTop />
      <SidebarContent className="gap-0 px-3 pt-2 pb-6 [scrollbar-width:none] group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <NavItems active={active} items={nav.main} />
          </SidebarGroupContent>
        </SidebarGroup>
        {nav.groups.map(group => (
          <Group active={active} group={group} key={group.key} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
