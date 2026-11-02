import { closeDb, db, schema } from '@zapbots/database';
import { addDays } from '@zapbots/finance';
import { dateIn } from '@zapbots/personal';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createViewer, gql } from '../../test/helpers';
import { mswServer } from '../../test/msw/openrouter';
import { resendHandler } from '../../test/msw/resend';

beforeAll(() => mswServer.listen());
afterEach(() => {
  mswServer.resetHandlers();
  delete process.env.RESEND_API_KEY;
});
afterAll(async () => {
  mswServer.close();
  await closeDb();
});

const SAVE = /* GraphQL */ `
  mutation ($id: ID, $input: BookingTypeInput!) {
    saveBookingType(id: $id, input: $input) {
      id
      slug
    }
  }
`;
const SLOTS = `query ($slug: String!) { publicBookingSlots(slug: $slug) }`;
const BOOK = /* GraphQL */ `
  mutation ($input: BookInput!) {
    book(input: $input) {
      title
      ownerName
      startsAt
      endsAt
      cancelToken
    }
  }
`;
const AGENDA = `query ($from: Date!, $to: Date!) { agenda(from: $from, to: $to) { kind title date startTime } }`;

/** A link open every day 9 to 12, 30 minutes each, bookable from now on. */
async function linkOf(slug: string, owner?: Awaited<ReturnType<typeof createViewer>>) {
  owner ??= await createViewer('Ana');
  const windows = [0, 1, 2, 3, 4, 5, 6].map(weekday => ({ end: '12:00', start: '09:00', weekday }));
  const saved = await gql(owner, SAVE, {
    input: {
      daysAhead: 7,
      durationMinutes: 30,
      minNoticeMinutes: 0,
      slug,
      title: 'Conversa',
      windows,
    },
  });
  expect(saved.errors).toEqual([]);
  return { owner, type: saved.data.saveBookingType };
}

const unique = () => `link-${crypto.randomUUID().slice(0, 8)}`;

describe('Agendamento por link', () => {
  it('shows the link to anyone, books a slot into the Agenda and takes it out of the free ones', async () => {
    const slug = unique();
    const { owner } = await linkOf(slug);
    const link = await gql(
      null,
      `query ($slug: String!) { publicBookingType(slug: $slug) { title ownerName durationMinutes timeZone } }`,
      { slug }
    );
    expect(link.data.publicBookingType).toEqual({
      durationMinutes: 30,
      ownerName: 'Ana',
      timeZone: 'America/Sao_Paulo',
      title: 'Conversa',
    });

    const slots: string[] = (await gql(null, SLOTS, { slug })).data.publicBookingSlots;
    expect(slots.length).toBeGreaterThan(20);
    const startsAt = slots.at(-1)!;
    const booked = await gql(null, BOOK, {
      input: { email: 'Bia@Example.com', name: 'Bia', note: 'Sobre a viagem', slug, startsAt },
    });
    expect(booked.errors).toEqual([]);
    expect(booked.data.book).toMatchObject({ ownerName: 'Ana', startsAt, title: 'Conversa' });

    const after: string[] = (await gql(null, SLOTS, { slug })).data.publicBookingSlots;
    expect(after).not.toContain(startsAt);
    const again = await gql(null, BOOK, {
      input: { email: 'caio@example.com', name: 'Caio', slug, startsAt },
    });
    expect(again.errors).toEqual(['BAD_USER_INPUT']);

    const today = dateIn('America/Sao_Paulo');
    const agenda = (await gql(owner, AGENDA, { from: today, to: addDays(today, 8) })).data.agenda;
    expect(agenda).toContainEqual(
      expect.objectContaining({ kind: 'EVENT', title: 'Conversa com Bia' })
    );
    const bookings = (await gql(owner, `query { bookings { guestName guestEmail note } }`)).data
      .bookings;
    expect(bookings).toEqual([
      { guestEmail: 'bia@example.com', guestName: 'Bia', note: 'Sobre a viagem' },
    ]);
  });

  it('lets the guest cancel with their secret, freeing the slot and the Agenda', async () => {
    const slug = unique();
    const { owner } = await linkOf(slug);
    const startsAt = (await gql(null, SLOTS, { slug })).data.publicBookingSlots[0];
    const { cancelToken } = (
      await gql(null, BOOK, { input: { email: 'bia@example.com', name: 'Bia', slug, startsAt } })
    ).data.book;

    const cancel = `mutation ($token: String!) { cancelBookingByToken(token: $token) }`;
    expect((await gql(null, cancel, { token: cancelToken })).data.cancelBookingByToken).toBe(true);
    expect((await gql(null, cancel, { token: cancelToken })).data.cancelBookingByToken).toBe(false);
    expect((await gql(null, SLOTS, { slug })).data.publicBookingSlots).toContain(startsAt);
    expect((await gql(owner, `query { bookings { id } }`)).data.bookings).toEqual([]);
    const events = await db.select().from(schema.event);
    expect(events.some(event => event.organizationId === owner.organizationId)).toBe(false);
  });

  it("keeps out the owner's own timed Eventos and limits one guest", async () => {
    const slug = unique();
    const { owner } = await linkOf(slug);
    const slots: string[] = (await gql(null, SLOTS, { slug })).data.publicBookingSlots;
    const last = new Date(slots.at(-1)!);
    const day = dateIn('America/Sao_Paulo', last);
    await gql(owner, `mutation ($input: EventInput!) { createEvent(input: $input) { id } }`, {
      input: { endTime: '12:00', startTime: '09:00', startsOn: day, title: 'Médico' },
    });
    const after: string[] = (await gql(null, SLOTS, { slug })).data.publicBookingSlots;
    expect(after.some(slot => dateIn('America/Sao_Paulo', new Date(slot)) === day)).toBe(false);

    const guest = { email: 'bia@example.com', name: 'Bia', slug };
    expect((await gql(null, BOOK, { input: { ...guest, startsAt: after[0] } })).errors).toEqual([]);
    expect((await gql(null, BOOK, { input: { ...guest, startsAt: after[1] } })).errors).toEqual([]);
    expect((await gql(null, BOOK, { input: { ...guest, startsAt: after[2] } })).errors).toEqual([
      'BAD_USER_INPUT',
    ]);
  });

  it('refuses a slug in use, and hides inactive links', async () => {
    const slug = unique();
    const { owner, type } = await linkOf(slug);
    const other = await createViewer('Caio');
    const taken = await gql(other, SAVE, {
      input: {
        durationMinutes: 30,
        slug,
        title: 'X',
        windows: [{ end: '10:00', start: '09:00', weekday: 1 }],
      },
    });
    expect(taken.errors).toEqual(['BAD_USER_INPUT']);

    await gql(owner, SAVE, {
      id: type.id,
      input: {
        active: false,
        durationMinutes: 30,
        slug,
        title: 'Conversa',
        windows: [{ end: '10:00', start: '09:00', weekday: 1 }],
      },
    });
    expect(
      (
        await gql(null, `query ($slug: String!) { publicBookingType(slug: $slug) { title } }`, {
          slug,
        })
      ).data.publicBookingType
    ).toBeNull();
    expect(
      (await gql(other, `mutation ($id: ID!) { deleteBookingType(id: $id) }`, { id: type.id })).data
        .deleteBookingType
    ).toBe(false);
  });

  it('gives one hour to one guest when two book it at once through two links of the same owner', async () => {
    const first = unique();
    const second = unique();
    const { owner } = await linkOf(first);
    await linkOf(second, owner);
    const startsAt = (await gql(null, SLOTS, { slug: first })).data.publicBookingSlots[0];

    const results = await Promise.all([
      gql(null, BOOK, { input: { email: 'bia@example.com', name: 'Bia', slug: first, startsAt } }),
      gql(null, BOOK, {
        input: { email: 'caio@example.com', name: 'Caio', slug: second, startsAt },
      }),
    ]);

    expect(results.map(result => result.errors).sort()).toEqual([[], ['BAD_USER_INPUT']]);
    expect((await gql(owner, `query { bookings { id } }`)).data.bookings).toHaveLength(1);
  });

  it('cancels once and sends one e-mail when the guest cancels twice at the same time', async () => {
    const slug = unique();
    await linkOf(slug);
    const startsAt = (await gql(null, SLOTS, { slug })).data.publicBookingSlots[0];
    const { cancelToken } = (
      await gql(null, BOOK, { input: { email: 'bia@example.com', name: 'Bia', slug, startsAt } })
    ).data.book;
    process.env.RESEND_API_KEY = 're_test';
    const resend = resendHandler();
    mswServer.use(resend.handler);

    const cancel = `mutation ($token: String!) { cancelBookingByToken(token: $token) }`;
    const results = await Promise.all([
      gql(null, cancel, { token: cancelToken }),
      gql(null, cancel, { token: cancelToken }),
    ]);

    expect(results.map(result => result.data.cancelBookingByToken).sort()).toEqual([false, true]);
    expect(resend.emails.filter(email => email.subject.startsWith('Cancelado'))).toHaveLength(1);
  });

  it('takes at most ten bookings an hour for one owner, so the form cannot send many e-mails', async () => {
    const slug = unique();
    await linkOf(slug);
    const slots: string[] = (await gql(null, SLOTS, { slug })).data.publicBookingSlots;
    const book = (index: number) =>
      gql(null, BOOK, {
        input: {
          email: `guest${index}@example.com`,
          name: 'Convidado',
          slug,
          startsAt: slots[index],
        },
      });

    for (let index = 0; index < 10; index++) expect((await book(index)).errors).toEqual([]);
    expect((await book(10)).errors).toEqual(['BAD_USER_INPUT']);
  });
});
