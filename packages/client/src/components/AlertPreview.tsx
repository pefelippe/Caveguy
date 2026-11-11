import { APP_NAME } from '@zapbots/finance';
import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@zapbots/ui/components/button';

import { useAlertsInbox } from './Alerts';
import { useChatPanel } from './ChatPanel';
import { useChatReplies } from './ChatReplies';

const CHIMED = 'alerts-chimed';

/** A short two-note chime, made in the browser (no sound file). Browsers may refuse it before the
 * first click on the page; then it simply stays quiet. */
function chime() {
  try {
    const audio = new AudioContext();
    [880, 1320].forEach((frequency, index) => {
      const start = audio.currentTime + index * 0.12;
      const tone = audio.createOscillator();
      const volume = audio.createGain();
      tone.type = 'sine';
      tone.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, start);
      volume.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      tone.connect(volume).connect(audio.destination);
      tone.start(start);
      tone.stop(start + 0.4);
    });
    setTimeout(() => void audio.close(), 1000);
  } catch {
    // No Web Audio: no sound.
  }
}

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: it chimes again next time.
  }
};

/**
 * What waits for the User in the chat: the Avisos not yet read and the last reply that ended while
 * the chat was closed. The chat button shows the count and opens the right Conversation.
 */
export function useChatNotice() {
  const { open, openConversation, toggle } = useChatPanel();
  const { pathname } = useLocation();
  const { conversationId, unread } = useAlertsInbox();
  const { clearFinished, finished } = useChatReplies();
  const watching = open || pathname === '/chat';
  // A reply that ends with the chat open was seen.
  useEffect(() => {
    if (finished && watching) clearFinished();
  }, [clearFinished, finished, watching]);

  return {
    count: unread.length + (finished ? 1 : 0),
    finished,
    openChat: () => {
      if (finished) {
        clearFinished();
        openConversation(finished.conversationId);
      } else if (unread.length && conversationId) openConversation(conversationId);
      else toggle();
    },
    unread,
    watching,
  };
}

/** A reply's first words, without the Markdown marks. */
const plain = (text: string) =>
  text
    .replace(/[*_#`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * As Intercom's: what waits in the chat (the reply that just ended, or the new Avisos) shows as a
 * preview under its button in the header, with a chime the first time; a click opens it. On a computer.
 */
export function AlertPreview() {
  const { count, finished, openChat, unread, watching } = useChatNotice();
  const key = finished
    ? `reply:${finished.conversationId}:${finished.text.length}`
    : unread.map(alert => alert.id).join(',');
  const text = finished ? plain(finished.text) : unread[0]?.message;
  const more = finished ? 0 : unread.length - 1;
  const [dismissed, setDismissed] = useState<string | null>(null);
  const shown = Boolean(key && text && count && !watching && dismissed !== key);

  useEffect(() => {
    if (!shown || read(CHIMED) === key) return;
    write(CHIMED, key);
    chime();
  }, [key, shown]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[calc(var(--header-height)+0.25rem)] right-6 z-40 hidden w-80 md:block print:hidden"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: -8 }}
        >
          <Button
            className="h-auto w-full flex-col items-start gap-1 rounded-2xl border bg-card p-4 pr-10 text-left font-normal whitespace-normal text-foreground shadow-[0_12px_32px_-8px_rgb(0_0_0/0.25)] hover:bg-card"
            onClick={openChat}
            variant="ghost"
          >
            <span className="text-xs text-muted-foreground">{APP_NAME} · agora</span>
            <span className="line-clamp-2 text-sm">{text}</span>
            {more > 0 && (
              <span className="text-xs font-medium text-primary">
                +{more} {more === 1 ? 'aviso' : 'avisos'}
              </span>
            )}
          </Button>
          <Button
            aria-label="Dispensar"
            className="absolute top-2 right-2 size-7 rounded-full text-muted-foreground"
            onClick={() => setDismissed(key)}
            size="icon"
            variant="ghost"
          >
            <XIcon className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
