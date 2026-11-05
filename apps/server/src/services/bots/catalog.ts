import { db, schema, type BotRow } from '@zapbots/database';
import { CAISHEN } from '@zapbots/finance';
import { FITNESS_AGENT } from '@zapbots/fitness';
import { PESSOAL } from '@zapbots/personal';
import { asc, eq } from 'drizzle-orm';

export type BotKey = BotRow['key'];

interface CatalogEntry {
  description: string;
  name: string;
  personality: string;
}

/**
 * Every Agente the Caveman offers (docs/adr/0035). The fixed ones have their name and personality
 * here; a `CUSTOM` one takes its name and what it does from its row (`botName`, `botDescription`).
 */
export const CATALOG: Record<BotKey, CatalogEntry> = {
  CUSTOM: {
    description: 'Um Agente criado pela pessoa, que faz o que ela escreveu.',
    name: 'Agente',
    personality: 'Do jeito que a pessoa pediu, sempre na fala das cavernas.',
  },
  FINANCE: CAISHEN,
  FITNESS: FITNESS_AGENT,
  PERSONAL: PESSOAL,
};

/** The fixed Agentes, one of each per Organization, in the order the app shows them. */
const FIXED: BotKey[] = ['FINANCE', 'PERSONAL', 'FITNESS'];

/** The longest name and description of a custom Agente. */
export const MAX_AGENT_NAME = 40;
export const MAX_AGENT_INSTRUCTIONS = 1000;

/** What a custom Agente can wear; the fixed ones wear their own. */
export const OUTFITS = ['COOK', 'EXPLORER', 'ARTIST', 'SCHOLAR', 'MUSICIAN', 'BUILDER'] as const;
export type Outfit = (typeof OUTFITS)[number];

/** The name the person sees: a custom Agente's own, or the catalog's. */
export const botName = (bot: BotRow) =>
  bot.key === 'CUSTOM' ? (bot.name ?? CATALOG.CUSTOM.name) : CATALOG[bot.key].name;

/** One line on what the Agente does: a custom one's own words, or the catalog's. */
export const botDescription = (bot: BotRow) =>
  bot.key === 'CUSTOM'
    ? (bot.instructions ?? CATALOG.CUSTOM.description)
    : CATALOG[bot.key].description;

/**
 * The Organization's team: the fixed Agentes, created on first use, then its custom ones, oldest
 * first. A fixed Agente has no `name`, which is what keeps it one of each (the partial index).
 */
export async function ensureBots(organizationId: string): Promise<BotRow[]> {
  await db
    .insert(schema.bot)
    .values(FIXED.map(key => ({ key, organizationId })))
    .onConflictDoNothing();
  const rows = await db
    .select()
    .from(schema.bot)
    .where(eq(schema.bot.organizationId, organizationId))
    .orderBy(asc(schema.bot.createdAt));
  const fixed = FIXED.map(key => rows.find(row => row.key === key && row.name === null)!);
  return [...fixed, ...rows.filter(row => row.key === 'CUSTOM' && row.name !== null)];
}
