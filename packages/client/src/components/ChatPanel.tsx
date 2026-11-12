import {
  ArrowDownLeftIcon,
  CreditCardIcon,
  LandmarkIcon,
  Maximize2Icon,
  ReceiptIcon,
  RepeatIcon,
  XIcon,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';

import type { ChatAttachment } from '../lib/attachments';
import { useI18n } from '../lib/i18n';
import { useDesktop } from '../lib/media';
import { cn } from '@zapbots/ui/lib/utils';
import { BotPanel, PANEL_BUTTON } from './BotPanel';
import type { Suggestion } from './ChatThread';

const STORAGE_KEY = 'zapbots.chatPanel';

/** What the + offers to start from: a click puts the line in the input to finish and send; the
 * Agente proposes the record and nothing is saved until it is confirmed (ADR 0013). */
const ADD_SUGGESTIONS: Suggestion[] = [
  { icon: ReceiptIcon, text: 'Gastei R$ 45 no mercado hoje' },
  { icon: ArrowDownLeftIcon, text: 'Recebi R$ 1.200 de um freela' },
  { icon: RepeatIcon, text: 'Netflix, R$ 55 todo mês' },
  { icon: LandmarkIcon, text: 'Peguei um empréstimo de R$ 10.000 em 24x' },
  { icon: CreditCardIcon, text: 'Novo cartão Nubank, limite de R$ 5.000' },
];
const WIDTH = 440;
const EASE = [0.22, 1, 0.36, 1] as const;

function storedOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'open';
  } catch {
    return false;
  }
}

interface ChatPanelState {
  close: () => void;
  open: boolean;
  /** Opens the panel with its input focused (the command menu's "Perguntar ao Agente"). */
  openToType: () => void;
  /** Opens the panel on this Conversation (the Avisos, from the Agente's button). */
  openConversation: (id: string) => void;
  /** Opens a blank Conversation to add something by saying it (the + in the corner): it rises
   * from the +, asks what to add and offers examples to start from. */
  openAdd: () => void;
  /** Opens the panel on a blank Conversation, sending `message` (and `files`) in it when given. */
  startNew: (message?: string, files?: ChatAttachment[]) => void;
  toggle: () => void;
}

const ChatPanelContext = createContext<ChatPanelState | null>(null);

/** Whether the chat panel is open, remembered in this browser, and the way to open it. */
export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(storedOpen);
  // Each blank Conversation asked for remounts the panel on one.
  const [blank, setBlank] = useState(0);
  const [firstMessage, setFirstMessage] = useState<string>();
  const [firstFiles, setFirstFiles] = useState<ChatAttachment[]>();
  const [conversationId, setConversationId] = useState<string>();
  const [adding, setAdding] = useState(false);

  // Opens the panel ready to type: the input is focused once the panel has mounted.
  const openToType = () => {
    setOpen(true);
    setTimeout(() => document.querySelector<HTMLTextAreaElement>('[data-chat-input]')?.focus(), 60);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? 'open' : 'closed');
    } catch {
      // Without storage the panel just starts closed next time.
    }
  }, [open]);

  return (
    <ChatPanelContext.Provider
      value={{
        close: () => setOpen(false),
        open,
        openAdd: () => {
          setConversationId(undefined);
          setFirstMessage(undefined);
          setFirstFiles(undefined);
          setAdding(true);
          setBlank(current => current + 1);
          openToType();
        },
        openConversation: id => {
          setAdding(false);
          setConversationId(id);
          setFirstMessage(undefined);
          setFirstFiles(undefined);
          setBlank(current => current + 1);
          setOpen(true);
        },
        openToType,
        startNew: (message, files) => {
          setAdding(false);
          setConversationId(undefined);
          setFirstMessage(message);
          setFirstFiles(files);
          setBlank(current => current + 1);
          setOpen(true);
        },
        toggle: () => {
          setAdding(false);
          setOpen(current => !current);
        },
      }}
    >
      <BlankContext.Provider value={{ adding, blank, conversationId, firstFiles, firstMessage }}>
        {children}
      </BlankContext.Provider>
    </ChatPanelContext.Provider>
  );
}

const BlankContext = createContext<{
  adding?: boolean;
  blank: number;
  conversationId?: string;
  firstFiles?: ChatAttachment[];
  firstMessage?: string;
}>({ blank: 0 });

export function useChatPanel(): ChatPanelState {
  const panel = useContext(ChatPanelContext);
  if (!panel) throw new Error('useChatPanel outside ChatPanelProvider');
  return panel;
}

/**
 * The chat with the Caishen, a card floating over the bottom right corner of whatever screen is
 * open, as Mercado Pago's: it always opens on a blank Conversation, the earlier ones a click away.
 * On a desktop it grows from that corner as it fades in; on a phone it covers the screen, rising a
 * little. Its header closes it, or takes the open Conversation to the Agente page.
 */
export function ChatPanel({ greeting }: { greeting?: string }) {
  const { close, open } = useChatPanel();
  const { adding, blank, conversationId, firstFiles, firstMessage } = useContext(BlankContext);
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const desktop = useDesktop();
  const still = useReducedMotion();
  // The chat page already is the chat; the panel stays closed there.
  const shownHere = open && pathname !== '/chat';

  const shown = { opacity: 1, scale: 1, y: 0 };
  const hidden = still
    ? { opacity: 0 }
    : desktop
      ? { opacity: 0, scale: 0.9, y: 24 }
      : { opacity: 0, y: 24 };

  return (
    <AnimatePresence initial={false}>
      {shownHere && (
        <motion.aside
          animate={shown}
          aria-label={t('chat.panel')}
          className={cn(
            'fixed inset-0 z-40 flex flex-col overflow-hidden bg-card md:inset-auto md:right-6 md:rounded-[24px] md:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_16px_-4px_rgb(0_0_0/0.08),0_32px_72px_-16px_rgb(0_0_0/0.28)] dark:md:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_32px_72px_-16px_rgb(0_0_0/0.6)]',
            // It rises out of the bottom right corner; the pill that opened it hides while it is open.
            'origin-bottom-right md:bottom-6 md:h-[min(40rem,calc(100svh-var(--header-height)-3rem))]'
          )}
          exit={hidden}
          initial={hidden}
          key="chat"
          style={desktop ? { width: WIDTH } : undefined}
          transition={
            still
              ? { duration: 0.15, ease: EASE }
              : { bounce: 0.18, duration: 0.45, type: 'spring' }
          }
        >
          {/* Covering a phone's screen, it keeps clear of the notch and the home indicator. */}
          <div className="flex h-full min-h-0 w-full flex-col p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] md:p-5">
            <BotPanel
              actions={conversationId => (
                <>
                  <Button
                    aria-label={t('chat.expand')}
                    className={PANEL_BUTTON}
                    onClick={() => {
                      close();
                      navigate(conversationId ? `/chat?c=${conversationId}` : '/chat');
                    }}
                    size="icon"
                    title={t('chat.expand')}
                    variant="ghost"
                  >
                    <Maximize2Icon />
                  </Button>
                  <Button
                    aria-label={t('chat.close')}
                    className={PANEL_BUTTON}
                    onClick={close}
                    size="icon"
                    title={t('chat.close')}
                    variant="ghost"
                  >
                    <XIcon />
                  </Button>
                </>
              )}
              className="h-full"
              conversationId={conversationId}
              firstFiles={firstFiles}
              firstMessage={firstMessage}
              greeting={greeting}
              headline={adding ? 'O que você quer adicionar?' : undefined}
              key={blank}
              startBlank={!conversationId}
              suggestions={adding ? ADD_SUGGESTIONS : undefined}
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
