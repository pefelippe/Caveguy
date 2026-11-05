import type { AgentOutfit, BotKey } from '@zapbots/graphql/client';
import { BotIcon, type LucideIcon } from 'lucide-react';

import { Caveman, type CavemanMood } from '@zapbots/ui/blocks/caveman';
import { cn } from '@zapbots/ui/lib/utils';

import { outfitOf } from '../lib/agents';

interface Props {
  /** `null` for a Bot still to come: neutral ink. */
  bot: BotKey | null;
  className?: string;
  /** Overrides the Caveman with an icon, e.g. for Bots still to come, which have no key yet. */
  icon?: LucideIcon;
  mood?: CavemanMood;
  /** A custom Agente's outfit. */
  outfit?: AgentOutfit | null;
  /** Rendered size in pixels. */
  size?: number;
}

/** An Agente's avatar: Brutus in its outfit on its ink (docs/adr/0035). */
export function BotGlyph({ bot, className, icon: Icon, mood, outfit, size = 32 }: Props) {
  if (bot && !Icon) {
    return (
      <span className={cn('inline-grid shrink-0', className)} data-bot={bot}>
        <Caveman mood={mood} outfit={outfitOf({ key: bot, outfit: outfit ?? null })} size={size} />
      </span>
    );
  }
  const Shown = Icon ?? BotIcon;
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-muted-foreground text-paper',
        className
      )}
      style={{ height: size, width: size }}
    >
      <Shown strokeWidth={2} style={{ height: size * 0.55, width: size * 0.55 }} />
    </span>
  );
}
