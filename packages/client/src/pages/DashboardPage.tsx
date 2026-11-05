import { ArrowUpIcon, SlidersHorizontalIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, type ClipboardEvent, type FormEvent } from 'react';

import { Button } from '@zapbots/ui/components/button';
import { Input } from '@zapbots/ui/components/input';
import { cn } from '@zapbots/ui/lib/utils';

import { Caveman } from '@zapbots/ui/blocks/caveman';

import { useChatPanel } from '../components/ChatPanel';
import { AttachMenu, Waiting } from '../components/ChatThread';
import {
  addAttachments,
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENTS,
  pastedFiles,
  type ChatAttachment,
} from '../lib/attachments';
import { HOME_CARDS, rise, SIZE_CLASS, stagger } from '../home/cards';
import { CustomizeHome, useHomeLayout } from '../home/CustomizeHome';
import { chooseAgent, suggestionsOf, useAgents } from '../lib/agents';
import { useI18n } from '../lib/i18n';

/**
 * The day's date, the greeting and the line to ask the Caishen, straight on the paper; sending, or
 * a suggestion, opens the chat panel with it.
 */
function Ask({ name }: { name: string }) {
  const { language, t } = useI18n();
  const { startNew } = useChatPanel();
  const { agents } = useAgents();
  // The home is everyone's: one question from each fixed Agente, each opening the chat on its own.
  const suggestions = agents
    .filter(agent => !agent.custom)
    .map(agent => ({ agent, suggestion: suggestionsOf(agent.key)[0]! }));
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
      <div className="flex flex-col items-center gap-2 [--ink:var(--seal)]">
        <Caveman mood="happy" outfit="PLAIN" size={128} />
        <p className="text-sm text-muted-foreground first-letter:uppercase">{date}</p>
        <h1 className="text-4xl text-balance md:text-5xl">{t('welcome.uga', { name })}</h1>
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
        {suggestions.map(({ agent, suggestion }) => (
          <Button
            className="h-8 rounded-full px-3 font-normal text-muted-foreground hover:text-foreground"
            key={suggestion.text}
            onClick={() => {
              chooseAgent(agent.id);
              startNew(suggestion.text);
            }}
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

/**
 * The Página inicial: the greeting and the line to ask the Caishen on top, then the reports the
 * User keeps (finances, Tarefas, Agenda, Fitness…), arranged in Personalizar.
 */
export function DashboardPage({ user }: { user: { name: string } }) {
  const { t } = useI18n();
  const { change, layout } = useHomeLayout();
  const [customizing, setCustomizing] = useState(false);
  const shown = layout?.filter(card => !card.hidden) ?? [];

  return (
    <motion.div
      animate="shown"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 pt-6 md:pt-12"
      initial="hidden"
      variants={stagger}
    >
      <div className="mx-auto w-full max-w-3xl">
        <Ask name={user.name.split(' ')[0]!} />
      </div>

      {layout && (
        <>
          <motion.div className="-mb-2 mt-6 flex justify-end" variants={rise}>
            <Button onClick={() => setCustomizing(true)} size="sm" variant="ghost">
              <SlidersHorizontalIcon />
              {t('home.customize')}
            </Button>
          </motion.div>

          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('home.customize.empty')}
            </p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {shown.map(({ key }) => {
                const { Component, area, size } = HOME_CARDS[key];
                return (
                  <motion.div
                    className={cn('min-w-0', SIZE_CLASS[size])}
                    data-area={area}
                    key={key}
                    variants={rise}
                  >
                    <Component />
                  </motion.div>
                );
              })}
            </div>
          )}

          <CustomizeHome
            layout={layout}
            onChange={change}
            onOpenChange={setCustomizing}
            open={customizing}
          />
        </>
      )}
    </motion.div>
  );
}
