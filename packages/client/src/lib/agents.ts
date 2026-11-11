import { APP_NAME } from '@zapbots/finance';
import { useQuery } from '@apollo/client/react';
import { AgentsDocument, type BotFieldsFragment, type BotKey } from '@zapbots/graphql/client';
import {
  BellIcon,
  CalendarIcon,
  DumbbellIcon,
  ListOrderedIcon,
  ListTodoIcon,
  SparklesIcon,
  WalletIcon,
} from 'lucide-react';
import { useSyncExternalStore } from 'react';

import type { CavemanOutfit } from '@zapbots/ui/blocks/caveman';

import type { Suggestion } from '../components/ChatThread';

const ACTIVE_KEY = 'zapbots.agent';
const listeners = new Set<() => void>();
let activeId = readActive();

function readActive(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

/** Opens another Agente everywhere the chat shows. */
export function chooseAgent(id: string) {
  if (id === activeId) return;
  activeId = id;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    // Without storage the choice lasts until the page reloads.
  }
  listeners.forEach(listener => listener());
}

/**
 * The Agentes and the one open, remembered in this browser; the Financeiro when none was picked or
 * the one picked is gone.
 */
export function useAgents() {
  const id = useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => activeId
  );
  const { data } = useQuery(AgentsDocument);
  const agents = data?.bots ?? [];
  const active = agents.find(agent => agent.id === id) ?? agents[0];
  // How many custom Agentes the Plan allows: only Max makes them.
  const allowed = data?.billing.plan.agents ?? 0;
  return { active, agents, allowed, configured: data?.aiStatus.configured ?? true };
}

/** What the Caveman wears for this Agente. */
export function outfitOf(bot: Pick<BotFieldsFragment, 'key' | 'outfit'>): CavemanOutfit {
  return bot.key === 'CUSTOM' ? (bot.outfit ?? 'EXPLORER') : bot.key;
}

/** The greeting while a Conversation is blank: the one place the app keeps the caveman's short talk (docs/adr/0039). */
export function greetingOf(key: BotKey, name?: string): string {
  const who = name ? `${name}! ` : '';
  switch (key) {
    case 'FINANCE':
      return `${who}${APP_NAME} cuida dinheiro.`;
    case 'PERSONAL':
      return `${who}${APP_NAME} lembra agenda.`;
    case 'FITNESS':
      return `${who}${APP_NAME} treina junto.`;
    case 'CUSTOM':
      return `${who}${APP_NAME} escuta.`;
  }
}

/** Questions offered while a Conversation is blank, for this Agente's field. */
export function suggestionsOf(key: BotKey): Suggestion[] {
  switch (key) {
    case 'FINANCE':
      return [
        { icon: BellIcon, text: 'O que merece minha atenção agora?' },
        { icon: WalletIcon, text: 'Quanto sobra este mês?' },
        { icon: ListOrderedIcon, text: 'Qual dívida devo quitar primeiro?' },
      ];
    case 'PERSONAL':
      return [
        { icon: CalendarIcon, text: 'O que tenho esta semana?' },
        { icon: ListTodoIcon, text: 'Quais tarefas faço primeiro?' },
      ];
    case 'FITNESS':
      return [
        { icon: DumbbellIcon, text: 'Qual treino faço hoje?' },
        { icon: SparklesIcon, text: 'Como aqueço antes do treino?' },
      ];
    case 'CUSTOM':
      return [];
  }
}
