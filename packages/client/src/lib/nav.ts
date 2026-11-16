import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  CalculatorIcon,
  CalendarIcon,
  ChartPieIcon,
  CreditCardIcon,
  HouseIcon,
  LayersIcon,
  ListIcon,
  MessageSquareIcon,
  PlugIcon,
  ReceiptIcon,
  SettingsIcon,
  SquareCheckIcon,
  UserIcon,
  WalletIcon,
  WorkflowIcon,
  type LucideIcon,
} from 'lucide-react';

import { APP_NAME } from '@zapbots/finance';

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
  /** A pill on the right: Novo (blue) or Beta (neutral). */
  badge?: 'beta' | 'new';
  /** A › on the right, as the design guide draws the entries that group several screens. */
  chevron?: boolean;
  /** Other paths that belong to this item, e.g. an Operation's page to Dívidas. */
  owns?: string[];
  /** Shown with an "Em breve" pill, without a link. */
  soon?: boolean;
  to: string;
}

/** A titled part of the menu. */
export interface NavGroup {
  /** Paints its icons in the area's colour. */
  area: 'finance' | 'fitness' | 'personal' | 'tools';
  items: NavItem[];
  key: string;
  label: string;
}

export interface Nav {
  /** The account's screens: in the avatar's menu, not on the left; the phone's Mais lists them. */
  account: NavItem[];
  /** The menu's top: Visão geral and Caveguy; Finanças, Pessoal and Ferramentas follow as sections. */
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
          { icon: ListIcon, label: t('finance.transactions'), to: '/caishen/entries' },
          {
            chevron: true,
            icon: LayersIcon,
            label: t('finance.installments'),
            owns: ['/caishen/debts', '/caishen/operations', '/caishen/payoff'],
            to: '/caishen/installments',
          },
          {
            badge: 'new',
            icon: ArrowLeftRightIcon,
            label: t('finance.subscriptions'),
            to: '/caishen/subscriptions',
          },
          { icon: ChartPieIcon, label: t('finance.categories'), to: '/caishen/categories' },
          { chevron: true, icon: CreditCardIcon, label: t('finance.cards'), to: '/caishen/cards' },
          { icon: ArrowDownLeftIcon, label: t('nav.income'), to: '/caishen/income' },
          { icon: ReceiptIcon, label: t('finance.fixed'), to: '/caishen/fixed' },
        ],
        key: 'finance',
        label: t('nav.finances'),
      },
      {
        area: 'personal',
        items: [
          { icon: CalendarIcon, label: t('nav.calendar'), soon: true, to: '/personal/calendar' },
          { icon: SquareCheckIcon, label: t('nav.tasks'), soon: true, to: '/personal/tasks' },
        ],
        key: 'personal',
        label: t('nav.personal'),
      },
      {
        area: 'tools',
        items: [
          { chevron: true, icon: PlugIcon, label: t('nav.integrations'), to: '/integrations' },
          { icon: CalculatorIcon, label: t('nav.calculators'), to: '/caishen/calculators' },
          { badge: 'beta', icon: WorkflowIcon, label: t('nav.workflows'), to: '/workflows' },
        ],
        key: 'tools',
        label: t('nav.tools'),
      },
    ],
    account: [
      { icon: UserIcon, label: t('nav.profile'), to: '/profile' },
      { icon: WalletIcon, label: t('rail.plan'), to: '/plan' },
      { icon: SettingsIcon, label: t('nav.settings'), to: '/settings' },
    ],
    main: [
      { icon: HouseIcon, label: t('finance.overview'), to: '/caishen' },
      { icon: MessageSquareIcon, label: APP_NAME, to: '/chat' },
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
