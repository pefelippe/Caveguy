import { useMutation, useQuery } from '@apollo/client/react';
import {
  AgentPanelDocument,
  BillingDocument,
  ConversationsDocument,
  StartConversationDocument,
} from '@zapbots/graphql/client';
import { CpuIcon, FileSpreadsheetIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';
import { Skeleton } from '@zapbots/ui/components/skeleton';

import { ChatThread, type Suggestion } from '../components/ChatThread';
import { useSeenAlerts } from '../components/Alerts';
import { greetingOf, suggestionsOf, useAgents } from '../lib/agents';
import { useI18n } from '../lib/i18n';

/** On the page the Financeiro has room for one more: a statement to attach. */
const STATEMENT: Suggestion = {
  icon: FileSpreadsheetIcon,
  text: 'Vou anexar meu extrato: organize os gastos por categoria.',
};

const BANNER_KEY = 'zapbots.agentBanner';

function bannerClosed(): boolean {
  try {
    return localStorage.getItem(BANNER_KEY) === 'closed';
  } catch {
    return false;
  }
}

/** On the Free Plan, a line pointing to Pro; closed once, it stays closed in this browser. */
function PlanBanner() {
  const { data } = useQuery(BillingDocument);
  const [closed, setClosed] = useState(bannerClosed);
  if (closed || !data || data.billing.plan.key === 'PRO') return null;

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(BANNER_KEY, 'closed');
    } catch {
      // Without storage it shows again next time.
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-2.5 text-sm">
      <SparklesIcon className="size-4 shrink-0 text-primary" />
      <p className="min-w-0 flex-1">
        Mais Workflows e mensagens por mês no Plano Pro.{' '}
        <Link className="font-medium text-primary hover:underline" to="/plan">
          Ver planos
        </Link>
      </p>
      <Button aria-label="Fechar aviso" onClick={close} size="icon-sm" variant="ghost">
        <XIcon />
      </Button>
    </div>
  );
}

/**
 * The Agente page: a white column of Conversations (a drawer on a phone) beside the open one,
 * which has its title and Model on top and greets the User while it is empty.
 */
export function ChatPage({ user }: { user: { name: string } }) {
  const { active } = useAgents();
  if (!active) return <Skeleton className="mx-auto mt-6 h-64 w-full max-w-3xl rounded-2xl" />;
  return <AgentChat botId={active.id} key={active.id} user={user} />;
}

/** The page for one Agente; switching Agente remounts it on that one's Conversations. */
function AgentChat({ botId, user }: { botId: string; user: { name: string } }) {
  const { t } = useI18n();
  const { data } = useQuery(AgentPanelDocument, { variables: { id: botId } });
  const bot = data?.botById;
  const { data: list } = useQuery(ConversationsDocument, {
    skip: !bot,
    variables: { botId: bot?.id ?? '' },
  });
  const [start] = useMutation(StartConversationDocument, {
    refetchQueries: [ConversationsDocument],
  });
  // `null` is a blank Conversation not yet saved. The menu's history opens one by `?c=`, and
  // Fale com o Caveguy opens `/chat` alone, a blank one.
  const [searchParams, setSearchParams] = useSearchParams();
  const asked = searchParams.get('c');
  const [chosen, setChosen] = useState<string | null>(asked);
  // Remounts the thread when the User picks another Conversation, not when the first Message
  // saves a blank one (that would drop the reply being streamed).
  const [thread, setThread] = useState(0);

  useEffect(() => {
    if (asked === chosen) return;
    setChosen(asked);
    setThread(count => count + 1);
    // Only the address picks: a blank Conversation saved below writes its id there first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked]);

  const ensureConversation = async () => {
    if (chosen) return chosen;
    const result = await start({ variables: { botId: bot!.id } });
    const id = result.data!.startConversation.id;
    setChosen(id);
    setSearchParams({ c: id }, { replace: true });
    return id;
  };

  useSeenAlerts(chosen);

  const current = list?.conversations.find(conversation => conversation.id === chosen);

  return (
    <div className="flex h-full min-h-0">
      <section className="page-enter flex min-w-0 flex-1 flex-col pt-3 md:pt-4" data-bot={bot?.key}>
        <header className="mx-auto flex w-full max-w-3xl items-center gap-2 px-1 pb-3">
          {/* A blank Conversation has no title on screen: the menu already says Fale com o Caveguy. */}
          <h1
            className={
              current?.title ? 'min-w-0 flex-1 truncate text-base font-semibold' : 'sr-only'
            }
          >
            {current?.title ?? t('nav.talk')}
          </h1>
          {!current?.title && <span className="flex-1" />}
          {bot && (
            <Link
              className="inline-flex max-w-56 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-[0_1px_3px_rgb(15_23_42/0.06)] hover:text-foreground"
              title="Trocar o Modelo em Integrações"
              to="/integrations#ai"
            >
              <CpuIcon className="size-3.5 shrink-0" />
              <span className="truncate">{bot.model}</span>
            </Link>
          )}
        </header>
        <div className="mx-auto w-full max-w-3xl px-1">
          <PlanBanner />
        </div>
        {bot ? (
          <ChatThread
            bot={bot}
            className="min-h-0 flex-1"
            conversationId={chosen}
            ensureConversation={ensureConversation}
            greeting={greetingOf(bot.key, user.name.split(' ')[0])}
            key={thread}
            suggestions={
              bot.key === 'FINANCE'
                ? [...suggestionsOf(bot.key), STATEMENT]
                : suggestionsOf(bot.key)
            }
            unavailable={
              data.aiStatus.configured
                ? undefined
                : `${bot.name} ainda não responde: cole a chave de um provedor de IA em Integrações.`
            }
            variant="page"
          />
        ) : (
          <Skeleton className="mx-auto mt-6 w-full max-w-3xl flex-1 rounded-2xl" />
        )}
      </section>
    </div>
  );
}
