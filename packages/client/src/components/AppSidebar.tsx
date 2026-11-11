import { useMutation, useQuery } from '@apollo/client/react';
import { ConversationsDocument, DeleteConversationDocument } from '@zapbots/graphql/client';
import { APP_NAME } from '@zapbots/finance';
import {
  BellIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@zapbots/ui/components/sidebar';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@zapbots/ui/components/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';
import { cn } from '@zapbots/ui/lib/utils';

import { useAgents } from '../lib/agents';
import { useI18n } from '../lib/i18n';
import { activeItem, useNav, type NavItem } from '../lib/nav';
import { byAge, type Conversation } from './ConversationList';
import { AccountMenuItems, BLUE, UserAvatar, type ProfileUser } from './ProfileMenu';
import { useUndoableDelete } from './Toaster';

// Entries 40px tall with 18px icons; the open one a grey step. Collapsed, each is its icon alone.
const ITEM =
  'h-10 gap-3 rounded-lg px-3 text-[0.9375rem] font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground hover:data-[active=true]:bg-sidebar-accent [&>svg]:size-[18px] group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-[11px]!';

function NavItems({ active, items }: { active: NavItem | undefined; items: NavItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useI18n();

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
              <SidebarMenuBadge className="top-2.5 h-5 rounded-full bg-sidebar-accent px-2 text-[11px] font-medium text-sidebar-primary">
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

/** A titled part of the history that folds away; hidden when the menu is collapsed to icons. */
function Fold({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Collapsible className="group/fold group-data-[collapsible=icon]:hidden" defaultOpen>
      <SidebarGroup className="p-0">
        <SidebarGroupLabel
          asChild
          className="mt-4 h-7 gap-1 px-3 text-[0.8125rem] font-normal text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <CollapsibleTrigger>
            {label}
            <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=closed]/fold:-rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/**
 * The Conversations under the menu, after Pierre's: the WhatsApp ones, then the rest by age (the
 * Avisos pinned on top), each opening on the Agente page (`/chat?c=`), with ⋯ to delete it.
 */
function History() {
  const { t } = useI18n();
  const { active } = useAgents();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data } = useQuery(ConversationsDocument, {
    skip: !active,
    variables: { botId: active?.id ?? '' },
  });
  const [removeConversation] = useMutation(DeleteConversationDocument, {
    refetchQueries: [ConversationsDocument],
  });
  // A deleted Conversation leaves the list at once; its toast can bring it back for a moment.
  const { hidden, remove: removeLater } = useUndoableDelete();
  const chosen = pathname === '/chat' ? params.get('c') : null;

  const { recent, whatsapp } = useMemo(() => {
    const shown = (data?.conversations ?? []).filter(item => !hidden.has(item.id));
    const others = shown.filter(item => item.channel !== 'WHATSAPP');
    const pinned = others.filter(item => item.alerts);
    return {
      recent: [
        ...(pinned.length ? [{ items: pinned, label: 'Fixada' }] : []),
        ...byAge(others.filter(item => !item.alerts).slice(0, 60)),
      ],
      whatsapp: shown.filter(item => item.channel === 'WHATSAPP'),
    };
  }, [data, hidden]);

  const remove = (conversation: Conversation) => {
    if (conversation.id === chosen) navigate('/chat');
    removeLater({
      commit: () => removeConversation({ variables: { id: conversation.id } }),
      ids: [conversation.id],
      message: `Conversa excluída: ${conversation.title}`,
    });
  };

  const items = (list: Conversation[]) => (
    <SidebarMenu className="gap-0">
      {list.map(conversation => (
        <SidebarMenuItem key={conversation.id}>
          <SidebarMenuButton
            asChild
            className="h-9 rounded-lg px-3 text-[0.875rem] font-normal"
            isActive={conversation.id === chosen}
          >
            <Link
              onClick={() => isMobile && setOpenMobile(false)}
              to={`/chat?c=${conversation.id}`}
            >
              {conversation.alerts && <BellIcon />}
              <span className="truncate">{conversation.title}</span>
            </Link>
          </SidebarMenuButton>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction aria-label={`Opções de “${conversation.title}”`} showOnHover>
                <MoreHorizontalIcon />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44" side="right">
              <DropdownMenuItem onSelect={() => remove(conversation)} variant="destructive">
                <Trash2Icon />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <>
      <Fold label="WhatsApp">
        {whatsapp.length ? (
          items(whatsapp)
        ) : (
          <p className="px-3 py-1 text-xs leading-relaxed text-sidebar-foreground/50">
            {t('nav.whatsappEmpty')}
          </p>
        )}
      </Fold>
      <Fold label={t('nav.recent')}>
        {recent.map(group => (
          <div className="mt-2 first:mt-0" key={group.label}>
            <p className="px-3 pb-1 text-xs text-sidebar-foreground/50">{group.label}</p>
            {items(group.items)}
          </div>
        ))}
      </Fold>
    </>
  );
}

/** Atop the menu, after WorkOS's: the mark and the name, and the button that collapses it; its
 * line runs level with the header's. Collapsed, the button alone. */
function MenuTop() {
  return (
    <SidebarHeader className="h-(--header-height) shrink-0 flex-row items-center gap-2.5 border-b border-sidebar-border px-4 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Link
        className="flex min-w-0 flex-1 items-center gap-2.5 group-data-[collapsible=icon]:hidden"
        to="/"
      >
        <LogoBadge size={28} />
        <span className="truncate text-[0.9375rem] font-semibold text-sidebar-accent-foreground">
          {APP_NAME}
        </span>
      </Link>
      <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
    </SidebarHeader>
  );
}

/** At the menu's foot, after WorkOS's: who is signed in, their photo and name, the account's menu
 * rising from it (`AccountMenuItems`). Collapsed, the photo alone. */
function MenuFoot({ user }: { user: ProfileUser }) {
  return (
    <SidebarFooter className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className="h-11 gap-2.5 rounded-lg px-2 data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1.5!"
            tooltip={user.name}
          >
            <UserAvatar className={cn(BLUE, 'size-7')} user={user} />
            <span className="truncate font-medium">{user.name}</span>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 rounded-xl p-1.5"
          side="top"
          sideOffset={8}
        >
          <AccountMenuItems user={user} />
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}

/**
 * The menu on the left, the full height of the window, after Pierre's: the mark on top, Fale com o
 * Fale com o Caveguy, Agentes and Finanças, then the Conversations (WhatsApp and Recentes). ⌘B/Ctrl+B (or the
 * command menu) collapses it to its icons, hiding the Conversations.
 */
export function AppSidebar({ user }: { user: ProfileUser }) {
  const { pathname } = useLocation();
  const nav = useNav();
  // Only the three entries light here: Finanças for every one of its tabs.
  const active = activeItem(nav.main, pathname);

  return (
    <Sidebar className="overflow-hidden border-r border-sidebar-border" collapsible="icon">
      <MenuTop />
      <SidebarContent className="gap-0 px-3 pt-3 pb-6 [scrollbar-width:none] group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <NavItems active={active} items={nav.main} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0 mt-4 group-data-[collapsible=icon]:hidden" />
        <History />
      </SidebarContent>
      <MenuFoot user={user} />
    </Sidebar>
  );
}
