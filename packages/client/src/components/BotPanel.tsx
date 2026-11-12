import { APP_NAME } from '@zapbots/finance';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AgentPanelDocument,
  ConversationsDocument,
  DeleteConversationDocument,
  StartConversationDocument,
} from '@zapbots/graphql/client';
import { ChevronLeftIcon, PlusIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@zapbots/ui/components/alert';
import { Button } from '@zapbots/ui/components/button';
import { Skeleton } from '@zapbots/ui/components/skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import { greetingOf, suggestionsOf, useAgents } from '../lib/agents';
import type { ChatAttachment } from '../lib/attachments';
import { BotGlyph } from './BotGlyph';
import { ChatThread, type Suggestion } from './ChatThread';
import { ConversationList, type Conversation } from './ConversationList';
import { useUndoableDelete } from './Toaster';
import { useSeenAlerts } from './Alerts';

/** The panel header's plain icons: no ground until the pointer is over one, or while its view is open. */
export const PANEL_BUTTON =
  'relative size-9 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground aria-pressed:bg-foreground/5 aria-pressed:text-foreground [&_svg]:size-[18px]!';

/** What the panel shows under its header: the open Conversation, the earlier ones, or the Avisos. */
type View = 'chat' | 'history';

interface Props {
  /** Buttons at the end of the header, given the open Conversation: on the panel, opening it on
   * its own page and closing. */
  actions?: (conversationId: string | null) => ReactNode;
  /** The User's first name, greeted while the Conversation is empty. */
  greeting?: string;
  /** Said in place of the greeting while the Conversation is empty ("O que você quer adicionar?"). */
  headline?: string;
  className?: string;
  /** Opens on this Conversation instead of the latest one. */
  conversationId?: string;
  /** Sent as soon as the blank Conversation opens. */
  firstMessage?: string;
  /** Files sent with it. */
  firstFiles?: ChatAttachment[];
  /** Opens on a blank Conversation instead of the latest one. */
  startBlank?: boolean;
  /** Overrides the open Agente's own suggestions. */
  suggestions?: Suggestion[];
}

/** The open Agente's panel, with the tabs to switch Agente on top; switching starts it afresh. */
export function BotPanel(props: Props) {
  const { active } = useAgents();
  if (!active) return <Skeleton className={cn('h-64 w-full', props.className)} />;
  return <AgentPanel {...props} botId={active.id} key={active.id} />;
}

/**
 * A Bot with its Conversation, and in the same place the earlier Conversations and the Avisos:
 * the header's buttons swap what is shown under it, and the thread stays mounted meanwhile, so a
 * reply being written goes on.
 */
function AgentPanel({
  actions,
  botId,
  className,
  conversationId: initial,
  firstFiles,
  firstMessage,
  greeting,
  headline,
  startBlank,
  suggestions,
}: Props & { botId: string }) {
  const { data } = useQuery(AgentPanelDocument, { variables: { id: botId } });
  const bot = data?.botById;
  const { data: list } = useQuery(ConversationsDocument, {
    skip: !bot,
    variables: { botId: bot?.id ?? '' },
  });
  const [start] = useMutation(StartConversationDocument, {
    refetchQueries: [ConversationsDocument],
  });
  const [removeConversation] = useMutation(DeleteConversationDocument, {
    refetchQueries: [ConversationsDocument],
  });
  const { hidden, remove: removeLater } = useUndoableDelete();
  // `undefined` follows the latest Conversation; `null` is a blank one not yet saved.
  const [chosen, setChosen] = useState<string | null | undefined>(
    initial ?? (startBlank ? null : undefined)
  );
  // Remounts the thread only when the User asks for another Conversation. Saving the first Message
  // also changes `conversationId`, and a remount there would drop the reply being streamed.
  const [thread, setThread] = useState(0);
  const [view, setView] = useState<View>('chat');

  const conversations = list?.conversations.filter(conversation => !hidden.has(conversation.id));
  const conversationId = chosen === undefined ? (conversations?.[0]?.id ?? null) : chosen;
  useSeenAlerts(view === 'chat' ? conversationId : null);

  if (!bot) return <Skeleton className={cn('h-64 w-full', className)} />;

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const result = await start({ variables: { botId: bot.id } });
    const id = result.data!.startConversation.id;
    setChosen(id);
    return id;
  };

  const open = (id: string | null) => {
    setChosen(id);
    setThread(current => current + 1);
    setView('chat');
  };

  const remove = (conversation: Conversation) => {
    if (conversation.id === conversationId) setChosen(null);
    removeLater({
      commit: () => removeConversation({ variables: { id: conversation.id } }),
      ids: [conversation.id],
      message: `Conversa excluída: ${conversation.title}`,
    });
  };

  const toggle = (next: View) => setView(current => (current === next ? 'chat' : next));

  return (
    <section className={cn('flex min-h-0 flex-col gap-3', className)} data-bot={bot.key}>
      <header className="-mx-4 -mt-1 flex items-center gap-1 px-2 pb-1 md:-mx-5 md:px-3">
        <Button
          aria-label="Conversas anteriores"
          aria-pressed={view === 'history'}
          className={PANEL_BUTTON}
          onClick={() => toggle('history')}
          size="icon"
          title="Conversas anteriores"
          variant="ghost"
        >
          <ChevronLeftIcon />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="relative shrink-0">
            <BotGlyph bot={bot.key} outfit={bot.outfit} size={34} />
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card bg-success" />
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold tracking-tight">{APP_NAME}</span>
            <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
                <span className="relative size-1.5 rounded-full bg-success" />
              </span>
              Online · responde na hora
            </span>
          </div>
        </div>
        <Button
          aria-label="Nova conversa"
          className={PANEL_BUTTON}
          onClick={() => open(null)}
          size="icon"
          title="Nova conversa"
          variant="ghost"
        >
          <PlusIcon />
        </Button>
        {actions?.(conversationId)}
      </header>
      {view === 'history' && (
        <ConversationList
          chosen={conversationId}
          conversations={conversations}
          newButton={false}
          onDelete={remove}
          onOpen={open}
        />
      )}
      {!data.aiStatus.configured ? (
        view === 'chat' && (
          <Alert>
            <AlertTitle>{bot.name} ainda está dormindo</AlertTitle>
            <AlertDescription>
              Falta a chave de um provedor de IA. Cole-a em{' '}
              <Link className="underline underline-offset-4" to="/integrations#ai">
                Integrações
              </Link>{' '}
              e o {bot.name} passa a responder.
            </AlertDescription>
          </Alert>
        )
      ) : (
        <ChatThread
          bot={bot}
          className={cn('flex-1', view !== 'chat' && 'hidden')}
          conversationId={conversationId}
          ensureConversation={ensureConversation}
          firstFiles={thread === 0 ? firstFiles : undefined}
          firstMessage={thread === 0 ? firstMessage : undefined}
          greeting={headline ?? greetingOf(bot.key, greeting)}
          key={thread}
          suggestions={suggestions ?? suggestionsOf(bot.key)}
        />
      )}
    </section>
  );
}
