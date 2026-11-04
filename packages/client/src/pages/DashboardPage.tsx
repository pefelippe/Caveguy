import { ArrowUpIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, type ClipboardEvent, type FormEvent } from 'react';

import { Button } from '@zapbots/ui/components/button';
import { Input } from '@zapbots/ui/components/input';

import { CHAT_SUGGESTIONS, useChatPanel } from '../components/ChatPanel';
import { AttachMenu, Waiting } from '../components/ChatThread';
import {
  addAttachments,
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENTS,
  pastedFiles,
  type ChatAttachment,
} from '../lib/attachments';
import { rise, stagger } from '../home/cards';
import { useI18n } from '../lib/i18n';

/**
 * The day's date, the greeting and the line to ask the Caishen, straight on the paper; sending, or
 * a suggestion, opens the chat panel with it.
 */
function Ask({ name }: { name: string }) {
  const { language, t } = useI18n();
  const { startNew } = useChatPanel();
  const date = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const input = useRef<HTMLInputElement>(null);

  /** Files from the + or pasted wait under the line and go with the question. */
  const attach = async (picked: File[]) => {
    setError(null);
    const added = await addAttachments(files, picked);
    setFiles(added.files);
    setError(added.error);
    input.current?.focus();
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = pastedFiles(event.clipboardData);
    if (!pasted.length) return;
    event.preventDefault();
    void attach(pasted);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() && !files.length) return;
    startNew(draft.trim(), files.length ? files : undefined);
    setDraft('');
    setFiles([]);
    setError(null);
  };

  return (
    <motion.section className="flex flex-col items-center gap-5 text-center" variants={rise}>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground first-letter:uppercase">{date}</p>
        <h1 className="text-4xl md:text-5xl">{t('welcome.hello', { name })}</h1>
      </div>
      <form
        className="flex h-14 w-full items-center gap-2 rounded-full border bg-card pr-2 pl-3 text-left ring-seal/40 transition-shadow focus-within:ring-2"
        onSubmit={onSubmit}
      >
        <AttachMenu
          disabled={files.length >= MAX_ATTACHMENTS}
          onPick={() => picker.current?.click()}
        />
        <Input
          aria-label={t('welcome.ask')}
          className="h-full flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 md:text-base"
          onChange={event => setDraft(event.target.value)}
          onPaste={onPaste}
          placeholder={t('welcome.askAi')}
          ref={input}
          value={draft}
        />
        <Button
          aria-label={t('welcome.send')}
          className="size-10 rounded-full"
          disabled={!draft.trim() && !files.length}
          size="icon"
          type="submit"
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      </form>
      <input
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        multiple
        onChange={event => {
          const picked = [...(event.target.files ?? [])];
          event.target.value = '';
          void attach(picked);
        }}
        ref={picker}
        type="file"
      />
      {(files.length > 0 || error) && (
        <div className="-mt-2 flex w-full flex-col gap-2">
          <Waiting
            files={files}
            onRemove={index => setFiles(current => current.filter((_, at) => at !== index))}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
      <div className="-mt-1 flex flex-wrap justify-center gap-2">
        {CHAT_SUGGESTIONS.map(suggestion => (
          <Button
            className="h-8 rounded-full px-3 font-normal text-muted-foreground hover:text-foreground"
            key={suggestion.text}
            onClick={() => startNew(suggestion.text)}
            variant="ghost"
          >
            <suggestion.icon className="size-4" />
            {suggestion.text}
          </Button>
        ))}
      </div>
    </motion.section>
  );
}

/** The Página inicial: only the greeting and the line to ask the Caishen, in the middle of the screen. */
export function DashboardPage({ user }: { user: { name: string } }) {
  return (
    <motion.div
      animate="shown"
      className="mx-auto flex min-h-[calc(100svh-var(--header-height)-8rem)] w-full max-w-3xl flex-col justify-center"
      initial="hidden"
      variants={stagger}
    >
      <Ask name={user.name.split(' ')[0]!} />
    </motion.div>
  );
}
