import {
  CalendarIcon,
  DumbbellIcon,
  ListTodoIcon,
  CreditCardIcon,
  FlagIcon,
  HouseIcon,
  LandmarkIcon,
  PlugIcon,
  RepeatIcon,
  SettingsIcon,
  SheetIcon,
  UserIcon,
  WalletIcon,
  WorkflowIcon,
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
  /** The screens used most, always at the top of the menu. */
  main: NavItem[];
  groups: NavGroup[];
}

/**
 * Every screen of the app as the menu on the left lists them: the main ones on top (Página inicial,
 * Agente, Documentos, Workflows, Integrações), then Finanças, Pessoal and
 * Fitness. The account's (Perfil, Plano,
 * Configurações) are in the avatar's menu instead.
 */
export function useNav(): Nav {
  const { t } = useI18n();
  return {
    groups: [
      {
        // The Financeiro's own screen, then the rest of Finanças.
        items: [
          { icon: LandmarkIcon, label: t('nav.money'), to: '/caishen' },
          { icon: SheetIcon, label: t('nav.entries'), to: '/caishen/entries' },
          { icon: WalletIcon, label: t('nav.income'), to: '/caishen/income' },
          {
            icon: RepeatIcon,
            label: t('nav.fixed'),
            owns: ['/caishen/operations'],
            to: '/caishen/fixed',
          },
          { icon: FlagIcon, label: t('nav.payoff'), to: '/caishen/payoff' },
        ],
        area: 'finance',
        key: 'finances',
        label: t('nav.finances'),
      },
      {
        items: [
          { icon: CalendarIcon, label: t('nav.calendar'), to: '/personal/calendar' },
          { icon: ListTodoIcon, label: t('nav.tasks'), to: '/personal/tasks' },
        ],
        area: 'personal',
        key: 'personal',
        label: t('nav.personal'),
      },
      {
        items: [{ icon: DumbbellIcon, label: t('nav.workouts'), to: '/fitness/workouts' }],
        area: 'fitness',
        key: 'fitness',
        label: t('nav.fitness'),
      },
    ],
    account: [
      { icon: UserIcon, label: t('nav.profile'), to: '/profile' },
      { icon: CreditCardIcon, label: t('rail.plan'), to: '/plan' },
      { icon: SettingsIcon, label: t('nav.settings'), to: '/settings' },
    ],
    main: [
      { icon: HouseIcon, label: t('nav.home'), to: '/' },
      { icon: AgentIcon, label: t('nav.agent'), to: '/chat' },
      { icon: WorkflowIcon, label: t('nav.workflows'), to: '/workflows' },
      { icon: PlugIcon, label: t('nav.integrations'), to: '/integrations' },
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

/** Screens with a column of their own beside the menu (the Agente's Conversations): opening one
 * shrinks the menu to its icons. */
const RAIL_PATHS = ['/chat'];

export function isRailPath(pathname: string): boolean {
  return RAIL_PATHS.includes(pathname);
}
