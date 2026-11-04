import type { ConversationsQuery } from '@zapbots/graphql/client';
import { MoreHorizontalIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@zapbots/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';
import { Input } from '@zapbots/ui/components/input';
import { Skeleton } from '@zapbots/ui/components/skeleton';
import { cn } from '@zapbots/ui/lib/utils';

import { localToday } from '../lib/bots';

export type Conversation = ConversationsQuery['conversations'][number];

/** The local day (`YYYY-MM-DD`) a moment fell on. */
function localDay(moment: string | Date): string {
  const at = new Date(moment);
  return new Date(at.getTime() - at.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Conversations by when they last moved: today, yesterday, this week, before. */
function byAge(conversations: Conversation[]): { items: Conversation[]; label: string }[] {
  const today = localToday();
  const daysAgo = (count: number) => {
    const at = new Date(`${today}T12:00:00`);
    at.setDate(at.getDate() - count);
    return localDay(at);
  };
  const yesterday = daysAgo(1);
  const weekAgo = daysAgo(7);
  const groups: { items: Conversation[]; label: string; test: (day: string) => boolean }[] = [
    { items: [], label: 'Hoje', test: day => day === today },
    { items: [], label: 'Ontem', test: day => day === yesterday },
    { items: [], label: 'Últimos 7 dias', test: day => day >= weekAgo },
    { items: [], label: 'Mais antigas', test: () => true },
  ];
  for (const conversation of conversations) {
    const day = localDay(conversation.updatedAt);
    groups.find(group => group.test(day))!.items.push(conversation);
  }
  return groups.filter(group => group.items.length > 0);
}

/**
 * The Conversations: a new one on top (unless the place already has one), a search, then the
 * earlier ones by age, each with its ⋯ menu. On the Agente page's column and in the chat panel.
 */
export function ConversationList({
  chosen,
  conversations,
  newButton = true,
  onDelete,
  onOpen,
}: {
  chosen: string | null;
  conversations: Conversation[] | undefined;
  newButton?: boolean;
  onDelete: (conversation: Conversation) => void;
  onOpen: (id: string | null) => void;
}) {
  const [search, setSearch] = useState('');
  const groups = useMemo(() => {
    const words = search.trim().toLocaleLowerCase('pt-BR');
    const found = (conversations ?? []).filter(
      conversation =>
        !words ||
        conversation.title.toLocaleLowerCase('pt-BR').includes(words) ||
        (conversation.lastMessage?.content.toLocaleLowerCase('pt-BR').includes(words) ?? false)
    );
    return byAge(found.slice(0, 60));
  }, [conversations, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {newButton && (
        <Button className="h-11 rounded-full text-[0.9375rem]" onClick={() => onOpen(null)}>
          <PlusIcon />
          Nova conversa
        </Button>
      )}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Buscar conversas"
          className="h-10 rounded-full border-0 bg-foreground/5 pl-10 shadow-none"
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar conversas"
          value={search}
        />
      </div>

      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 [scrollbar-width:none]">
        {!conversations ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map(index => (
              <Skeleton className="h-9 rounded-xl" key={index} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="px-3 text-sm text-muted-foreground">
            {search ? 'Nenhuma conversa com essas palavras.' : 'Suas conversas aparecem aqui.'}
          </p>
        ) : (
          groups.map(group => (
            <section className="flex flex-col gap-0.5" key={group.label}>
              <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">{group.label}</h2>
              {group.items.map(conversation => (
                <div className="group relative" key={conversation.id}>
                  <Button
                    className={cn(
                      'h-10 w-full justify-start rounded-xl px-3 pr-9 text-sm font-normal pointer-coarse:h-11 pointer-coarse:pr-12',
                      conversation.id === chosen
                        ? 'bg-foreground/[0.07] font-medium text-foreground hover:bg-foreground/[0.07] hover:text-foreground'
                        : 'hover:bg-foreground/5'
                    )}
                    onClick={() => onOpen(conversation.id)}
                    variant="ghost"
                  >
                    <span className="truncate">{conversation.title}</span>
                  </Button>
                  {/* On a touch screen, with no pointer to hover, the ⋯ always shows, 44px. */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Opções de “${conversation.title}”`}
                        className="absolute top-1.5 right-1 size-7 rounded-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:top-0 pointer-coarse:right-0 pointer-coarse:opacity-100"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuItem
                        onSelect={() => onDelete(conversation)}
                        variant="destructive"
                      >
                        <Trash2Icon />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
