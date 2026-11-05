import { Nango } from '@nangohq/node';
import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import { eq } from 'drizzle-orm';

import { badInput } from '../resolvers/guards';
import { reportError } from '../sentry';

/**
 * Nango (docs/adr/0034) holds the OAuth for outside services: its Connect window signs the User
 * in, it keeps and refreshes the tokens, and we call the service through its proxy. Nothing of it
 * is stored here: the User's connection is found by their user id, given to Nango as the end
 * user, so the browser never names one. Today only Google Agenda, read-only.
 */
const CALENDAR = process.env.NANGO_CALENDAR_INTEGRATION ?? 'google-calendar';

export interface CalendarEvent {
  allDay: boolean;
  end: Date | null;
  start: Date;
  title: string;
}

export function nangoConfigured(): boolean {
  return Boolean(process.env.NANGO_API_KEY);
}

let client: Nango | undefined;
function nango(): Nango {
  if (!nangoConfigured()) badInput('O Google Agenda ainda não está ligado neste servidor');
  return (client ??= new Nango({ apiKey: process.env.NANGO_API_KEY! }));
}

/**
 * The User's Google Agenda connections at Nango, newest last. Nango filters by end user; we check
 * it again here, so a calendar is never shown to someone because that filter was trusted alone.
 */
async function calendarConnections(viewer: Viewer): Promise<string[]> {
  const { connections } = await nango().listConnections({
    integrationId: CALENDAR,
    userId: viewer.userId,
  });
  return connections
    .filter(connection => connection.end_user?.id === viewer.userId)
    .map(connection => connection.connection_id);
}

/** Whether the User has linked Google Agenda, or why Nango could not say. */
export async function googleCalendarStatus(
  viewer: Viewer
): Promise<{ connected: boolean; error: string | null }> {
  try {
    return { connected: (await calendarConnections(viewer)).length > 0, error: null };
  } catch (failure) {
    reportError(failure);
    return { connected: false, error: 'O Nango não respondeu agora. Tente de novo mais tarde.' };
  }
}

/** A short-lived token for Nango's Connect window, bound to this User and to Google Agenda only. */
export async function startGoogleCalendarLink(viewer: Viewer): Promise<string> {
  const [user] = await db
    .select({ email: schema.user.email, name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, viewer.userId));
  const { data } = await nango().createConnectSession({
    allowed_integrations: [CALENDAR],
    end_user: { display_name: user?.name, email: user?.email, id: viewer.userId },
    organization: { id: viewer.organizationId },
  });
  return data.token;
}

/** Removes every Google Agenda connection of the User at Nango (connecting again can make one more). */
export async function unlinkGoogleCalendar(viewer: Viewer): Promise<void> {
  for (const id of await calendarConnections(viewer)) await nango().deleteConnection(CALENDAR, id);
}

interface GoogleEvent {
  end?: { date?: string; dateTime?: string };
  start?: { date?: string; dateTime?: string };
  status?: string;
  summary?: string;
}

/** The next events on the User's main Google calendar, read live through Nango's proxy. */
export async function googleCalendarEvents(viewer: Viewer, limit = 10): Promise<CalendarEvent[]> {
  const connectionId = (await calendarConnections(viewer)).at(-1);
  if (!connectionId) return [];
  let data: { items?: GoogleEvent[] };
  try {
    ({ data } = await nango().proxy<{ items?: GoogleEvent[] }>({
      connectionId,
      endpoint: '/calendar/v3/calendars/primary/events',
      method: 'GET',
      params: {
        maxResults: limit,
        orderBy: 'startTime',
        singleEvents: 'true',
        timeMin: new Date().toISOString(),
      },
      providerConfigKey: CALENDAR,
    }));
  } catch (failure) {
    reportError(failure);
    badInput('Não deu para ler o Google Agenda. Desconecte e conecte de novo.');
  }
  return (data.items ?? []).flatMap(event => {
    const start = event.start?.dateTime ?? event.start?.date;
    if (!start || event.status === 'cancelled') return [];
    const end = event.end?.dateTime ?? event.end?.date;
    return [
      {
        allDay: !event.start?.dateTime,
        end: end ? new Date(end) : null,
        start: new Date(start),
        title: event.summary?.trim() || '(sem título)',
      },
    ];
  });
}
