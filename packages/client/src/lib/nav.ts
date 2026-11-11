import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  BarChart3Icon,
  CalendarSyncIcon,
  CreditCardIcon,
  LayersIcon,
  LayoutDashboardIcon,
  MessageSquarePlusIcon,
  PlugIcon,
  ReceiptIcon,
  SettingsIcon,
  TagsIcon,
  UserIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react';

import { AgentIcon } from '@zapbots/ui/blocks/agent-icon';

import { useI18n } from './i18n';

/**
 * Documentos only in development: imported files and Attachments should land there, but there is
 * nowhere to store them yet. In production its menu item is "Em breve" and its paths go home.
 */
export const DOCUMENTS_ENABLED = import.meta.env.DEV;

export interface NavItem {
  /** Paints its icon in another area's colour than its group's. */
  area?: NavGroup['area'];
  icon: LucideIcon;
  label: string;
  /** Other paths that belong to this item, e.g. an Operation's page to Dívidas. */
  owns?: string[];
  /** Shown with an "Em breve" pill, without a link. */
  soon?: boolean;
  to: string;
}

/** A titled part of the menu. */
export interface NavGroup {
  /** Paints its icons in the area's colour. */
  area: 'finance' | 'fitness' | 'personal';
  items: NavItem[];
  key: string;
  label: string;
}

export interface Nav {
  /** The account's screens: in the avatar's menu, not on the left; the phone's Mais lists them. */
  account: NavItem[];
  /** The menu on the left: Fale com o Caveguy, Agentes and Finanças. */
  main: NavItem[];
  /** Finanças' tabs (`FinanceTabs`), also in the command menu and the phone's Mais. */
  groups: NavGroup[];
}

/**
 * Every screen of the app. The menu on the left lists only `main`, the Conversations under it;
 * Finanças' screens are the tabs atop it (`groups`), and the account's are in the avatar's menu.
 */
export function useNav(): Nav {
  const { t } = useI18n();
  return {
    groups: [
      {
        area: 'finance',
        items: [
          { icon: LayoutDashboardIcon, label: t('finance.overview'), to: '/caishen' },
          { icon: ArrowLeftRightIcon, label: t('finance.transactions'), to: '/caishen/entries' },
          {
            icon: LayersIcon,
            label: t('finance.installments'),
            owns: ['/caishen/debts', '/caishen/operations', '/caishen/payoff'],
            to: '/caishen/installments',
          },
          {
            icon: CalendarSyncIcon,
            label: t('finance.subscriptions'),
            to: '/caishen/subscriptions',
          },
          { icon: TagsIcon, label: t('finance.categories'), to: '/caishen/categories' },
          { icon: CreditCardIcon, label: t('finance.cards'), to: '/caishen/cards' },
          { icon: ArrowDownLeftIcon, label: t('nav.income'), to: '/caishen/income' },
          { icon: ReceiptIcon, label: t('finance.fixed'), to: '/caishen/fixed' },
        ],
        key: 'finance',
        label: t('nav.finances'),
      },
    ],
    account: [
      { icon: UserIcon, label: t('nav.profile'), to: '/profile' },
      { icon: PlugIcon, label: t('nav.integrations'), to: '/integrations' },
      { icon: WalletIcon, label: t('rail.plan'), to: '/plan' },
      { icon: SettingsIcon, label: t('nav.settings'), to: '/settings' },
    ],
    main: [
      { icon: MessageSquarePlusIcon, label: t('nav.talk'), to: '/chat' },
      { icon: AgentIcon, label: t('nav.agents'), to: '/workflows' },
      { icon: BarChart3Icon, label: t('nav.finances'), to: '/caishen' },
    ],
  };
}

/**
 * The item for the open screen: the longest path that matches, its own or one it owns, so an
 * Operation's page lights Dívidas and `/` only lights on the home itself.
 */
export function activeItem(items: NavItem[], pathname: string): NavItem | undefined {
  const matches = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
  let best: { item: NavItem; length: number } | undefined;
  for (const item of items) {
    if (item.soon) continue;
    for (const path of [item.to, ...(item.owns ?? [])]) {
      if (matches(path) && (!best || path.length > best.length))
        best = { item, length: path.length };
    }
  }
  return best?.item;
}
