import { useMutation, useQuery } from '@apollo/client/react';
import {
  BotPanelDocument,
  ConversationsDocument,
  DeleteConversationDocument,
  StartConversationDocument,
  type BotKey,
} from '@zapbots/graphql/client';
import { BellIcon, HistoryIcon, PlusIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@zapbots/ui/components/alert';
import { Button } from '@zapbots/ui/components/button';
import { Skeleton } from '@zapbots/ui/components/skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import type { ChatAttachment } from '../lib/attachments';
import { useI18n } from '../lib/i18n';
import { AlertList, UnreadBadge, useAlerts } from './Alerts';
import { BotGlyph } from './BotGlyph';
import { ChatThread, type Suggestion } from './ChatThread';
import { ConversationList, type Conversation } from './ConversationList';
import { useUndoableDelete } from './Toaster';

/** The panel header's plain icons: no ground until the pointer is over one, or while its view is open. */
export const PANEL_BUTTON =
  'relative size-9 rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground aria-pressed:bg-foreground/5 aria-pressed:text-foreground [&_svg]:size-[18px]!';

/** What the panel shows under its header: the open Conversation, the earlier ones, or the Avisos. */
type View = 'alerts' | 'chat' | 'history';

interface Props {
  /** Buttons at the end of the header, given the open Conversation: on the panel, opening it on
   * its own page and closing. */
  actions?: (conversationId: string | null) => ReactNode;
  /** The User's first name, greeted while the Conversation is empty. */
  greeting?: string;
  bot: BotKey;
  className?: string;
  /** Sent as soon as the blank Conversation opens. */
  firstMessage?: string;
  /** Files sent with it. */
  firstFiles?: ChatAttachment[];
  /** Called when an Aviso leads to another screen (on a phone, the panel covers it). */
  onLeave?: () => void;
  /** Opens on a blank Conversation instead of the latest one. */
  startBlank?: boolean;
  suggestions?: Suggestion[];
}

/**
 * A Bot with its Conversation, and in the same place the earlier Conversations and the Avisos:
 * the header's buttons swap what is shown under it, and the thread stays mounted meanwhile, so a
 * reply being written goes on.
 */
export function BotPanel({
  actions,
  bot: key,
  className,
  firstFiles,
  firstMessage,
  greeting,
  onLeave,
  startBlank,
  suggestions,
}: Props) {
  const { t } = useI18n();
  const { data } = useQuery(BotPanelDocument, { variables: { key } });
  const bot = data?.bot;
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
  const { unread } = useAlerts();
  // `undefined` follows the latest Conversation; `null` is a blank one not yet saved.
  const [chosen, setChosen] = useState<string | null | undefined>(startBlank ? null : undefined);
  // Remounts the thread only when the User asks for another Conversation. Saving the first Message
  // also changes `conversationId`, and a remount there would drop the reply being streamed.
  const [thread, setThread] = useState(0);
  const [view, setView] = useState<View>('chat');

  if (!bot) return <Skeleton className={cn('h-64 w-full', className)} />;

  const conversations = list?.conversations.filter(conversation => !hidden.has(conversation.id));
  const conversationId = chosen === undefined ? (conversations?.[0]?.id ?? null) : chosen;

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
    <section className={cn('flex min-h-0 flex-col gap-4', className)} data-bot={key}>
      <header className="flex items-center gap-1">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-1">
          <BotGlyph bot={key} size={28} />
          <span className="truncate text-base font-semibold">{bot.name}</span>
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
        <Button
          aria-label="Conversas anteriores"
          aria-pressed={view === 'history'}
          className={PANEL_BUTTON}
          onClick={() => toggle('history')}
          size="icon"
          title="Conversas anteriores"
          variant="ghost"
        >
          <HistoryIcon />
        </Button>
        <Button
          aria-label={
            unread.length
              ? `${t('notifications.label')} (${unread.length})`
              : t('notifications.label')
          }
          aria-pressed={view === 'alerts'}
          className={PANEL_BUTTON}
          onClick={() => toggle('alerts')}
          size="icon"
          title={t('notifications.label')}
          variant="ghost"
        >
          <BellIcon />
          <UnreadBadge className="-top-0.5 -right-0.5" count={unread.length} />
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
      {view === 'alerts' && (
        <AlertList
          onOpen={() => {
            setView('chat');
            onLeave?.();
          }}
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
              e o Caishen passa a responder.
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
          greeting={greeting}
          key={thread}
          suggestions={suggestions}
        />
      )}
    </section>
  );
}
