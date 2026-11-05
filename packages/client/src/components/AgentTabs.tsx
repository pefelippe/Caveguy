import { useMutation } from '@apollo/client/react';
import {
  AgentsDocument,
  CreateBotDocument,
  DeleteBotDocument,
  UpdateBotDocument,
  type AgentOutfit,
  type BotFieldsFragment,
} from '@zapbots/graphql/client';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Field } from '@zapbots/ui/blocks/field';
import { Button } from '@zapbots/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zapbots/ui/components/dialog';
import { Input } from '@zapbots/ui/components/input';
import { Textarea } from '@zapbots/ui/components/textarea';
import { cn } from '@zapbots/ui/lib/utils';

import { chooseAgent, useAgents } from '../lib/agents';
import { BotGlyph } from './BotGlyph';
import { FormError } from './FormError';

const OUTFITS: { label: string; value: AgentOutfit }[] = [
  { label: 'Cozinheiro', value: 'COOK' },
  { label: 'Explorador', value: 'EXPLORER' },
  { label: 'Artista', value: 'ARTIST' },
  { label: 'Estudioso', value: 'SCHOLAR' },
  { label: 'Músico', value: 'MUSICIAN' },
  { label: 'Construtor', value: 'BUILDER' },
];

/** Makes a custom Agente, or changes or deletes one: a name, what it does and an outfit. */
function AgentDialog({
  agent,
  onClose,
  open,
}: {
  agent?: BotFieldsFragment;
  onClose: () => void;
  open: boolean;
}) {
  const [name, setName] = useState(agent?.name ?? '');
  const [instructions, setInstructions] = useState(agent?.instructions ?? '');
  const [outfit, setOutfit] = useState<AgentOutfit>(agent?.outfit ?? 'EXPLORER');
  const refetchQueries = [AgentsDocument];
  const [create, creating] = useMutation(CreateBotDocument, { refetchQueries });
  const [update, updating] = useMutation(UpdateBotDocument, { refetchQueries });
  const [remove, removing] = useMutation(DeleteBotDocument, { refetchQueries });
  const busy = creating.loading || updating.loading || removing.loading;
  const error = creating.error ?? updating.error ?? removing.error;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const input = { instructions, name, outfit };
    if (agent) {
      const result = await update({ variables: { id: agent.id, input } }).catch(() => null);
      if (result?.data) onClose();
      return;
    }
    const result = await create({ variables: { input } }).catch(() => null);
    if (result?.data) {
      chooseAgent(result.data.createBot.id);
      onClose();
    }
  };

  const destroy = async () => {
    if (!agent) return;
    const result = await remove({ variables: { id: agent.id } }).catch(() => null);
    if (result?.data) onClose();
  };

  return (
    <Dialog onOpenChange={next => !next && onClose()} open={open}>
      <DialogContent>
        <form className="flex flex-col gap-5" onSubmit={save}>
          <DialogHeader>
            <DialogTitle>{agent ? `Editar ${agent.name}` : 'Novo Agente'}</DialogTitle>
            <DialogDescription>
              Ele conversa com você, mas não lê seus dados nem grava nada.
            </DialogDescription>
          </DialogHeader>
          <Field label="Nome">
            <Input
              maxLength={40}
              onChange={event => setName(event.target.value)}
              placeholder="Poeta"
              required
              value={name}
            />
          </Field>
          <Field label="O que ele faz">
            <Textarea
              maxLength={1000}
              onChange={event => setInstructions(event.target.value)}
              placeholder="Escreve poemas curtos sobre o meu dia."
              required
              rows={3}
              value={instructions}
            />
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Roupa</legend>
            <div className="grid grid-cols-3 gap-2">
              {OUTFITS.map(option => (
                <Button
                  aria-pressed={outfit === option.value}
                  className="h-auto flex-col gap-1 rounded-xl py-2 aria-pressed:border-foreground aria-pressed:bg-foreground/5"
                  key={option.value}
                  onClick={() => setOutfit(option.value)}
                  type="button"
                  variant="outline"
                >
                  <BotGlyph bot="CUSTOM" outfit={option.value} size={44} />
                  <span className="text-xs font-normal">{option.label}</span>
                </Button>
              ))}
            </div>
          </fieldset>
          {error && <FormError error={error} />}
          <DialogFooter className="gap-2">
            {agent && (
              <Button
                className="mr-auto"
                disabled={busy}
                onClick={() => void destroy()}
                type="button"
                variant="ghost"
              >
                Apagar
              </Button>
            )}
            <Button disabled={busy} type="submit">
              {agent ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The Agentes as tabs, each the Caveman in its outfit: picking one opens it wherever the chat
 * shows. The + makes a custom one; the pencil changes the open one, if it is custom.
 */
export function AgentTabs({ className }: { className?: string }) {
  const { active, agents, allowed } = useAgents();
  const navigate = useNavigate();
  // Which dialog is open, remounted each time so its fields start fresh.
  const [dialog, setDialog] = useState<{ agent?: BotFieldsFragment; key: number } | null>(null);
  const customs = agents.filter(agent => agent.custom).length;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        aria-label="Agentes"
        className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]"
        role="toolbar"
      >
        {agents.map(agent => {
          const open = agent.id === active?.id;
          return (
            <Button
              aria-pressed={open}
              className={cn(
                'h-auto shrink-0 gap-2 rounded-full py-1 pr-3 pl-1 font-normal text-muted-foreground hover:text-foreground',
                open && 'bg-foreground/5 font-medium text-foreground'
              )}
              data-bot={agent.key}
              key={agent.id}
              onClick={() => chooseAgent(agent.id)}
              title={agent.description}
              variant="ghost"
            >
              <BotGlyph
                bot={agent.key}
                mood={open ? 'happy' : 'idle'}
                outfit={agent.outfit}
                size={30}
              />
              <span className="max-w-28 truncate">{agent.name}</span>
            </Button>
          );
        })}
      </div>
      {active?.custom && (
        <Button
          aria-label={`Editar ${active.name}`}
          className="size-8 shrink-0 rounded-full"
          onClick={() => setDialog({ agent: active, key: Date.now() })}
          size="icon"
          title={`Editar ${active.name}`}
          variant="ghost"
        >
          <PencilIcon />
        </Button>
      )}
      {(customs < allowed || !allowed) && (
        <Button
          aria-label="Novo Agente"
          className="size-8 shrink-0 rounded-full"
          // Off Max, the + leads to the Plan that makes them.
          onClick={() => (allowed ? setDialog({ key: Date.now() }) : navigate('/plan'))}
          size="icon"
          title={allowed ? 'Novo Agente' : 'Agentes personalizados são do Plano Max'}
          variant="outline"
        >
          <PlusIcon />
        </Button>
      )}
      {dialog && (
        <AgentDialog agent={dialog.agent} key={dialog.key} onClose={() => setDialog(null)} open />
      )}
    </div>
  );
}
