import { closeDb } from '@zapbots/database';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { nangoHandlers } from '../../test/msw/nango';
import { mswServer } from '../../test/msw/openrouter';

beforeAll(() => mswServer.listen());
beforeEach(() => {
  process.env.NANGO_API_KEY = 'nango-test-key';
});
afterEach(() => {
  mswServer.resetHandlers();
  delete process.env.NANGO_API_KEY;
});
afterAll(async () => {
  mswServer.close();
  await closeDb();
});

const EVENTS = `{ googleCalendarEvents { title start end allDay } }`;
const calendarCard = async (viewer: Awaited<ReturnType<typeof createViewer>>) =>
  (
    (await gql(viewer, `{ connections { kind available connected unavailableReason } }`)).data
      .connections as { kind: string }[]
  ).find(connection => connection.kind === 'GOOGLE_CALENDAR');

describe('Google Agenda through Nango', () => {
  it('is off without a Nango key', async () => {
    delete process.env.NANGO_API_KEY;
    const viewer = await createViewer();
    expect(await calendarCard(viewer)).toEqual({
      available: false,
      connected: false,
      kind: 'GOOGLE_CALENDAR',
      unavailableReason: 'O Google Agenda ainda não está ligado neste servidor.',
    });
    const { errors } = await gql(viewer, `mutation { startGoogleCalendarLink }`);
    expect(errors).toEqual(['BAD_USER_INPUT']);
  });

  it('opens a session for this User only, then reads their next events', async () => {
    const nango = nangoHandlers([
      {
        end: { dateTime: '2026-11-05T13:00:00Z' },
        start: { dateTime: '2026-11-05T12:00:00Z' },
        summary: ' Dentista ',
      },
      { start: { date: '2026-11-07' }, summary: 'Feriado' },
      { start: { dateTime: '2026-11-06T10:00:00Z' }, status: 'cancelled', summary: 'Desmarcado' },
      { start: { dateTime: '2026-11-08T10:00:00Z' } },
    ]);
    mswServer.use(...nango.handlers);
    const viewer = await createViewer();
    const other = await createViewer();

    const { data } = await gql(viewer, `mutation { startGoogleCalendarLink }`);
    expect(data.startGoogleCalendarLink).toBe('session-1');
    expect(nango.sessions[0]).toMatchObject({
      allowed_integrations: ['google-calendar'],
      end_user: { id: viewer.userId },
    });
    expect((await gql(viewer, EVENTS)).data.googleCalendarEvents).toEqual([]);

    nango.link(viewer.userId);
    expect(await calendarCard(viewer)).toMatchObject({ connected: true });
    expect(await calendarCard(other)).toMatchObject({ connected: false });

    expect((await gql(viewer, EVENTS)).data.googleCalendarEvents).toEqual([
      {
        allDay: false,
        end: '2026-11-05T13:00:00.000Z',
        start: '2026-11-05T12:00:00.000Z',
        title: 'Dentista',
      },
      { allDay: true, end: null, start: '2026-11-07T00:00:00.000Z', title: 'Feriado' },
      { allDay: false, end: null, start: '2026-11-08T10:00:00.000Z', title: '(sem título)' },
    ]);
    expect(nango.proxied.map(call => call.connectionId)).toEqual([`conn-${viewer.userId}`]);
    // Someone else never reaches this User's calendar.
    expect((await gql(other, EVENTS)).data.googleCalendarEvents).toEqual([]);
    expect(nango.proxied).toHaveLength(1);
  });

  it("never shows another User's calendar, even if Nango sent every connection", async () => {
    const nango = nangoHandlers([{ start: { date: '2026-11-07' }, summary: 'Alheio' }], {
      unfiltered: true,
    });
    mswServer.use(...nango.handlers);
    const owner = await createViewer();
    const other = await createViewer();
    nango.link(owner.userId);
    expect(await calendarCard(other)).toMatchObject({ connected: false });
    expect((await gql(other, EVENTS)).data.googleCalendarEvents).toEqual([]);
    expect(nango.proxied).toEqual([]);
  });

  it('says so in Portuguese when Google refuses the read, and the page still loads when Nango is down', async () => {
    const nango = nangoHandlers([], { revoked: true });
    mswServer.use(...nango.handlers);
    const viewer = await createViewer();
    nango.link(viewer.userId);
    expect((await gql(viewer, EVENTS)).errors).toEqual(['BAD_USER_INPUT']);

    mswServer.use(
      http.get('https://api.nango.dev/connections', () => new HttpResponse(null, { status: 503 }))
    );
    expect(await calendarCard(viewer)).toMatchObject({ connected: false });
  });

  it('unlinks every connection of the User', async () => {
    const nango = nangoHandlers();
    mswServer.use(...nango.handlers);
    const viewer = await createViewer();
    nango.link(viewer.userId);
    nango.link(viewer.userId, 'conn-again');
    expect((await gql(viewer, `mutation { unlinkGoogleCalendar }`)).data.unlinkGoogleCalendar).toBe(
      true
    );
    expect(await calendarCard(viewer)).toMatchObject({ connected: false });
  });
});
