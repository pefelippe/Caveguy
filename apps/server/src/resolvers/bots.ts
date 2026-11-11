import type { Viewer } from '@zapbots/auth';
import { db, schema, type RoutineRow } from '@zapbots/database';
import type { Resolvers } from '@zapbots/graphql/server';
import { and, asc, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import { PlanLimitError, requireWithinLimit, subscriptionOf } from '../services/billing/billing';
import { PLANS, planInForce } from '../services/billing/plans';
import { markAlerts, viewerAlerts } from '../services/bots/alerts';
import { alertsConversation, deliverAlerts } from '../services/bots/alertsInbox';
import {
  botDescription,
  botName,
  CATALOG,
  ensureBots,
  MAX_AGENT_INSTRUCTIONS,
  MAX_AGENT_NAME,
  OUTFITS,
  type BotKey,
  type Outfit,
} from '../services/bots/catalog';
import { isReplying, stopReply } from '../services/bots/chat';
import {
  cancelJob,
  failStaleJobs,
  handOverJob,
  type JobFile,
  type JobTransaction,
} from '../services/bots/jobs';
import {
  cancelProposal,
  confirmProposal,
  describeProposal,
  editProposal,
  proposalFields,
} from '../services/bots/proposals';
import { MAX_ROUTINES, nextRunAfter } from '../services/bots/routines';
import { aiConfigured, botModel, defaultModel, listModels } from '../services/models';
import { badInput, notFound, owned, requireViewer } from './guards';

const MAX_INSTRUCTIONS = 4000;
const MAX_ATTACHMENTS = 5;
const MAX_DELIVERABLE = 100_000;
const MAX_RECENT_JOBS = 20;
/** Jobs in the queue or running at once per Organization, to keep cost and the server in check. */
const MAX_WORKING_JOBS = 3;

/** Loads a Bot only if it belongs to the Viewer's Organization. */
async function findBot(viewer: Viewer, id: string) {
  const [row] = await db
    .select()
    .from(schema.bot)
    .where(owned(schema.bot, viewer, id));
  return row ?? notFound('Bot');
}

async function requireAi(viewer: Viewer) {
  if (!(await aiConfigured(viewer.organizationId))) {
    badInput('Os Bots ainda não estão ligados: cole a chave de um provedor de IA em Integrações');
  }
}

/** The instructions of a Job or Routine, trimmed; refuses empty or overlong ones. */
function validInstructions(raw: string): string {
  const instructions = raw.trim();
  if (!instructions) badInput('Diga o que precisa ser feito');
  if (instructions.length > MAX_INSTRUCTIONS) {
    badInput(`Descreva o Workflow em até ${MAX_INSTRUCTIONS} caracteres`);
  }
  return instructions;
}

/**
 * Refuses new work while the Organization already has the most Jobs in progress. Read inside
 * `handOverJob`'s lock, so two requests at once cannot both take the last place.
 */
async function requireRoom(viewer: Viewer, tx: JobTransaction) {
  const working = await tx
    .select({ id: schema.job.id })
    .from(schema.job)
    .where(and(owned(schema.job, viewer), inArray(schema.job.status, ['QUEUED', 'RUNNING'])));
  if (working.length >= MAX_WORKING_JOBS) {
    badInput(
      `Já há ${MAX_WORKING_JOBS} Workflows em andamento. Espere um terminar para pedir outro.`
    );
  }
}

/** Refuses a Job past the month's Limit of the Organization's Plan (docs/adr/0011). */
async function requireAllowance(viewer: Viewer) {
  try {
    await requireWithinLimit(viewer, 'jobs');
  } catch (error) {
    if (error instanceof PlanLimitError) {
      throw new GraphQLError(error.message, { extensions: { code: 'PLAN_LIMIT' } });
    }
    throw error;
  }
}

/** On Vercel a Job that outlived its function would hold a place forever. */
async function freeStalePlaces() {
  if (process.env.VERCEL) await failStaleJobs();
}

/** Saves a Job and starts it; refused while the server has no Model provider. */
async function handOver(viewer: Viewer, botId: string, instructions: string, files: JobFile[]) {
  await requireAi(viewer);
  await freeStalePlaces();
  return handOverJob(viewer, { botId, files, instructions }, async tx => {
    await requireRoom(viewer, tx);
    await requireAllowance(viewer);
  });
}

async function botById(id: string) {
  const [row] = await db.select().from(schema.bot).where(eq(schema.bot.id, id));
  return row!;
}

/** The Viewer's Organization's fixed Agente with this key. */
async function viewerBot(viewer: Viewer, key: BotKey) {
  const bots = await ensureBots(viewer.organizationId);
  return bots.find(bot => bot.key === key && bot.name === null) ?? notFound('Agente');
}

/** A custom Agente's fields, trimmed and checked (docs/adr/0035). */
function validAgent(input: { instructions: string; name: string; outfit: string }) {
  const name = input.name.trim();
  const instructions = input.instructions.trim();
  if (!name || name.length > MAX_AGENT_NAME)
    badInput(`Dê um nome de até ${MAX_AGENT_NAME} caracteres`);
  if (!instructions || instructions.length > MAX_AGENT_INSTRUCTIONS) {
    badInput(`Diga o que o Agente faz em até ${MAX_AGENT_INSTRUCTIONS} caracteres`);
  }
  if (!OUTFITS.includes(input.outfit as Outfit)) badInput('Roupa desconhecida');
  return { instructions, name, outfit: input.outfit };
}

/** Loads one of the Viewer's custom Agentes; the fixed ones cannot be changed or deleted. */
async function findCustomBot(viewer: Viewer, id: string) {
  const bot = await findBot(viewer, id);
  if (bot.key !== 'CUSTOM' || bot.name === null) badInput('Este Agente não pode ser mudado');
  return bot;
}

/** Each Member's Avisos Conversation is theirs alone; the rest of the Organization's are shared. */
const ownAlertsOnly = (viewer: Viewer) =>
  or(eq(schema.conversation.alerts, false), eq(schema.conversation.userId, viewer.userId));

export const botResolvers: Resolvers = {
  Bot: {
    alerts: async (bot, _, context) =>
      (await viewerAlerts(requireViewer(context), bot)).map(alert => ({
        ...alert,
        id: alert.key,
      })),
    alertsConversation: (bot, _, context) => alertsConversation(requireViewer(context), bot),
    custom: bot => bot.key === 'CUSTOM',
    description: bot => botDescription(bot),
    instructions: bot => (bot.key === 'CUSTOM' ? bot.instructions : null),
    model: bot => botModel(bot.organizationId, bot.model),
    name: bot => botName(bot),
    outfit: bot => (bot.key === 'CUSTOM' ? (bot.outfit as Outfit | null) : null),
    personality: bot => CATALOG[bot.key].personality,
    // The Bot was loaded through the Viewer's Organization, so its Jobs are theirs too.
    recentJobs: (bot, { limit }) =>
      db
        .select()
        .from(schema.job)
        .where(eq(schema.job.botId, bot.id))
        .orderBy(desc(schema.job.createdAt))
        .limit(Math.min(Math.max(limit ?? 3, 0), MAX_RECENT_JOBS)),
  },
  Conversation: {
    bot: conversation => botById(conversation.botId),
    lastMessage: async conversation => {
      const [row] = await db
        .select()
        .from(schema.message)
        .where(eq(schema.message.conversationId, conversation.id))
        .orderBy(desc(schema.message.createdAt))
        .limit(1);
      return row ?? null;
    },
    messages: conversation =>
      db
        .select()
        .from(schema.message)
        .where(eq(schema.message.conversationId, conversation.id))
        .orderBy(asc(schema.message.createdAt)),
    replying: conversation => isReplying(conversation),
  },
  Message: {
    attachments: message => message.attachments ?? [],
    proposals: message =>
      db
        .select()
        .from(schema.proposal)
        .where(eq(schema.proposal.messageId, message.id))
        .orderBy(asc(schema.proposal.createdAt)),
  },
  Proposal: {
    fields: proposal => proposalFields(proposal),
    lines: proposal => describeProposal(proposal).lines,
    title: proposal => describeProposal(proposal).title,
  },
  Routine: {
    paused: routine => routine.pausedAt !== null,
  },
  Job: {
    attachments: job =>
      db
        .select()
        .from(schema.attachment)
        .where(eq(schema.attachment.jobId, job.id))
        .orderBy(asc(schema.attachment.createdAt)),
    bot: job => botById(job.botId),
    deliverable: job => job.editedDeliverable ?? job.deliverable,
    edited: job => job.editedDeliverable !== null,
    originalDeliverable: job => job.deliverable,
    routine: async job => {
      if (!job.routineId) return null;
      const [row] = await db
        .select()
        .from(schema.routine)
        .where(eq(schema.routine.id, job.routineId));
      return row ?? null;
    },
  },
  Mutation: {
    createJob: async (_, { input }, context) => {
      const viewer = requireViewer(context);
      const bot = await findBot(viewer, input.botId);
      const instructions = validInstructions(input.instructions);
      const files = input.attachments ?? [];
      if (files.length > MAX_ATTACHMENTS) badInput(`Anexe até ${MAX_ATTACHMENTS} arquivos`);
      return handOver(viewer, bot.id, instructions, files);
    },
    createRoutine: async (_, { input }, context) => {
      const viewer = requireViewer(context);
      const bot = await findBot(viewer, input.botId);
      const instructions = validInstructions(input.instructions);
      await requireAi(viewer);
      await freeStalePlaces();
      let routine: RoutineRow | undefined;
      // The first run is now, so the User sees the Deliverable without waiting a week or a month.
      // The Routine is saved with it, under the same lock that counts the Routines.
      await handOverJob(viewer, { botId: bot.id, files: [], instructions }, async tx => {
        await requireRoom(viewer, tx);
        const existing = await tx
          .select({ id: schema.routine.id })
          .from(schema.routine)
          .where(owned(schema.routine, viewer));
        if (existing.length >= MAX_ROUTINES) badInput(`Mantenha até ${MAX_ROUTINES} Rotinas`);
        await requireAllowance(viewer);
        [routine] = await tx
          .insert(schema.routine)
          .values({
            botId: bot.id,
            cadence: input.cadence,
            createdById: viewer.userId,
            instructions,
            nextRunAt: nextRunAfter(input.cadence, new Date()),
            organizationId: viewer.organizationId,
          })
          .returning();
        return { routineId: routine!.id };
      });
      return routine!;
    },
    confirmProposal: (_, { id }, context) => confirmProposal(requireViewer(context), id),
    cancelProposal: (_, { id }, context) => cancelProposal(requireViewer(context), id),
    // shortcut: Alerts are named by key, so a custom Agente's bell maps to none; switch to an id
    // when the app shows Alerts outside the Financeiro.
    dismissAlert: async (_, { bot: key, id }, context) => {
      const viewer = requireViewer(context);
      const bot = await viewerBot(viewer, key);
      await markAlerts(viewer, bot, [id], 'DISMISSED');
      return bot;
    },
    deliverAlerts: async (_, { bot: key }, context) => {
      const viewer = requireViewer(context);
      const bot = await viewerBot(viewer, key);
      await deliverAlerts(viewer, bot);
      return bot;
    },
    markAlertsRead: async (_, { bot: key, ids }, context) => {
      const viewer = requireViewer(context);
      const bot = await viewerBot(viewer, key);
      await markAlerts(viewer, bot, ids, 'READ');
      return bot;
    },
    createBot: async (_, { input }, context) => {
      const viewer = requireViewer(context);
      const fields = validAgent(input);
      await ensureBots(viewer.organizationId);
      return db.transaction(async tx => {
        // Two requests at once must not both take the last place.
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${`agents:${viewer.organizationId}`}))`
        );
        const customs = await tx
          .select({ id: schema.bot.id })
          .from(schema.bot)
          .where(and(owned(schema.bot, viewer), isNotNull(schema.bot.name)));
        const allowed = PLANS[planInForce(await subscriptionOf(viewer.organizationId))].agents;
        if (!allowed) badInput('Agentes personalizados são do Plano Max.');
        if (customs.length >= allowed) {
          badInput(`Você já tem ${allowed} Agentes seus. Apague um para criar outro.`);
        }
        const [row] = await tx
          .insert(schema.bot)
          .values({ ...fields, key: 'CUSTOM', organizationId: viewer.organizationId })
          .returning();
        return row!;
      });
    },
    updateBot: async (_, { id, input }, context) => {
      const viewer = requireViewer(context);
      await findCustomBot(viewer, id);
      const [row] = await db
        .update(schema.bot)
        .set(validAgent(input))
        .where(owned(schema.bot, viewer, id))
        .returning();
      return row!;
    },
    deleteBot: async (_, { id }, context) => {
      const viewer = requireViewer(context);
      await findCustomBot(viewer, id);
      const deleted = await db
        .delete(schema.bot)
        .where(owned(schema.bot, viewer, id))
        .returning({ id: schema.bot.id });
      return deleted.length > 0;
    },
    editProposal: (_, { id, values }, context) => editProposal(requireViewer(context), id, values),
    deleteConversation: async (_, { id }, context) => {
      const deleted = await db
        .delete(schema.conversation)
        .where(owned(schema.conversation, requireViewer(context), id))
        .returning({ id: schema.conversation.id });
      return deleted.length > 0;
    },
    stopReply: (_, { conversationId }, context) =>
      stopReply(requireViewer(context), conversationId),
    cancelJob: async (_, { id }, context) => {
      const viewer = requireViewer(context);
      const [job] = await db
        .select()
        .from(schema.job)
        .where(owned(schema.job, viewer, id));
      if (!job) notFound('Workflow');
      if (!(await cancelJob(job.id))) badInput('Este Workflow já terminou');
      const [row] = await db.select().from(schema.job).where(eq(schema.job.id, job.id));
      return row!;
    },
    editDeliverable: async (_, { id, text }, context) => {
      const viewer = requireViewer(context);
      const [job] = await db
        .select()
        .from(schema.job)
        .where(owned(schema.job, viewer, id));
      if (!job) notFound('Workflow');
      if (job.status !== 'DONE') badInput('Só a Entrega de um Workflow pronto pode ser editada');
      if (text != null && text.length > MAX_DELIVERABLE) {
        badInput(`A Entrega cabe em até ${MAX_DELIVERABLE} caracteres`);
      }
      // Saving the Bot's own text again is the same as restoring it.
      const edited = text == null || text === job.deliverable ? null : text;
      const [row] = await db
        .update(schema.job)
        .set({ editedDeliverable: edited })
        .where(owned(schema.job, viewer, id))
        .returning();
      return row!;
    },
    retryJob: async (_, { id }, context) => {
      const viewer = requireViewer(context);
      const [failed] = await db
        .select()
        .from(schema.job)
        .where(owned(schema.job, viewer, id));
      if (!failed) notFound('Workflow');
      if (failed.status !== 'FAILED') badInput('Só um Workflow que falhou pode ser pedido de novo');
      const files = await db
        .select()
        .from(schema.attachment)
        .where(eq(schema.attachment.jobId, failed.id))
        .orderBy(asc(schema.attachment.createdAt));
      return handOver(viewer, failed.botId, failed.instructions, files);
    },
    setRoutinePaused: async (_, { id, paused }, context) => {
      const [row] = await db
        .update(schema.routine)
        .set({ pausedAt: paused ? new Date() : null })
        .where(owned(schema.routine, requireViewer(context), id))
        .returning();
      return row ?? notFound('Rotina');
    },
    deleteRoutine: async (_, { id }, context) => {
      const deleted = await db
        .delete(schema.routine)
        .where(owned(schema.routine, requireViewer(context), id))
        .returning({ id: schema.routine.id });
      return deleted.length > 0;
    },
    deleteJob: async (_, { id }, context) => {
      const deleted = await db
        .delete(schema.job)
        .where(owned(schema.job, requireViewer(context), id))
        .returning({ id: schema.job.id });
      return deleted.length > 0;
    },
    setBotModel: async (_, { id, model }, context) => {
      const viewer = requireViewer(context);
      await findBot(viewer, id);
      if (model) {
        const models = await listModels(viewer.organizationId);
        if (models.length && !models.some(candidate => candidate.id === model)) {
          badInput('Modelo desconhecido');
        }
      }
      const [row] = await db
        .update(schema.bot)
        .set({ model: model ?? null })
        .where(eq(schema.bot.id, id))
        .returning();
      return row!;
    },
    startConversation: async (_, { botId }, context) => {
      const viewer = requireViewer(context);
      await findBot(viewer, botId);
      const [row] = await db
        .insert(schema.conversation)
        .values({ botId, organizationId: viewer.organizationId })
        .returning();
      return row!;
    },
  },
  Query: {
    aiStatus: async (_, __, context) => {
      const { organizationId } = requireViewer(context);
      return {
        configured: await aiConfigured(organizationId),
        defaultModel: await defaultModel(organizationId),
      };
    },
    bot: (_, { key }, context) => viewerBot(requireViewer(context), key),
    botById: async (_, { id }, context) => {
      const [row] = await db
        .select()
        .from(schema.bot)
        .where(owned(schema.bot, requireViewer(context), id));
      return row ?? null;
    },
    bots: (_, __, context) => ensureBots(requireViewer(context).organizationId),
    conversation: async (_, { id }, context) => {
      const viewer = requireViewer(context);
      const [row] = await db
        .select()
        .from(schema.conversation)
        .where(and(owned(schema.conversation, viewer, id), ownAlertsOnly(viewer)));
      return row ?? null;
    },
    conversations: async (_, { botId }, context) => {
      const viewer = requireViewer(context);
      if (botId) await findBot(viewer, botId);
      return db
        .select()
        .from(schema.conversation)
        .where(
          and(
            botId ? eq(schema.conversation.botId, botId) : owned(schema.conversation, viewer),
            ownAlertsOnly(viewer)
          )
        )
        .orderBy(desc(schema.conversation.updatedAt))
        .limit(50);
    },
    job: async (_, { id }, context) => {
      const [row] = await db
        .select()
        .from(schema.job)
        .where(owned(schema.job, requireViewer(context), id));
      return row ?? null;
    },
    jobs: async (_, { botId }, context) => {
      const viewer = requireViewer(context);
      await findBot(viewer, botId);
      return db
        .select()
        .from(schema.job)
        .where(eq(schema.job.botId, botId))
        .orderBy(desc(schema.job.createdAt))
        .limit(50);
    },
    models: (_, __, context) => listModels(requireViewer(context).organizationId),
    routines: async (_, { botId }, context) => {
      const viewer = requireViewer(context);
      await findBot(viewer, botId);
      return db
        .select()
        .from(schema.routine)
        .where(eq(schema.routine.botId, botId))
        .orderBy(asc(schema.routine.createdAt));
    },
  },
};
