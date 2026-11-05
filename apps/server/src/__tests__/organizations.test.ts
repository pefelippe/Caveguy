import { resolveViewer } from '@zapbots/auth';
import { closeDb, db, schema } from '@zapbots/database';
import { and, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { browser } from '../../test/helpers';
import { AccountError, deleteAccount } from '../services/account';
import { channelConversation } from '../services/bots/channels';
import { viewerOfToken } from '../services/secretLink';

afterAll(async () => {
  await closeDb();
});

const password = 'senha-forte-123';

/** A new account, signed in, and the personal Organization its first session landed in. */
async function signUp(name: string, email = `${crypto.randomUUID()}@test.local`) {
  const page = browser();
  expect((await page('/sign-up/email', { email, name, password })).status).toBe(200);
  const personal = (await page('/get-session')).body.session.activeOrganizationId as string;
  return { email, page, personal };
}

describe('Organizations shared by invitation (docs/adr/0038)', () => {
  it('invites, accepts, switches, and lets a removed Member go', async () => {
    const owner = await signUp('Ana');
    const guestEmail = `${crypto.randomUUID()}@test.local`;

    const invited = await owner.page('/organization/invite-member', {
      email: guestEmail,
      role: 'member',
    });
    expect(invited.status).toBe(200);
    const invitationId = invited.body.id as string;

    // Someone else with the link can neither accept it nor walk into the Organization.
    const stranger = await signUp('Caio');
    expect((await stranger.page('/organization/accept-invitation', { invitationId })).status).toBe(
      403
    );
    expect(
      (await stranger.page('/organization/set-active', { organizationId: owner.personal })).status
    ).not.toBe(200);
    expect((await resolveViewer(stranger.page.headers()))?.organizationId).toBe(stranger.personal);

    // The invited address accepts and lands in the owner's Organization.
    const guest = await signUp('Bia', guestEmail);
    expect((await guest.page('/organization/accept-invitation', { invitationId })).status).toBe(
      200
    );
    const inOwners = await resolveViewer(guest.page.headers());
    expect(inOwners).toMatchObject({ organizationId: owner.personal, role: 'member' });

    // Both Organizations are theirs to switch between.
    expect((await guest.page('/organization/list')).body).toHaveLength(2);
    await guest.page('/organization/set-active', { organizationId: guest.personal });
    expect((await resolveViewer(guest.page.headers()))?.organizationId).toBe(guest.personal);
    await guest.page('/organization/set-active', { organizationId: owner.personal });

    // Each Member talks to WhatsApp in their own thread.
    const ownerViewer = (await resolveViewer(owner.page.headers()))!;
    expect(await channelConversation(ownerViewer, 'WHATSAPP')).not.toBe(
      await channelConversation(inOwners!, 'WHATSAPP')
    );

    // The only owner of an Organization with others in it cannot delete the account.
    await expect(deleteAccount(ownerViewer, owner.email)).rejects.toThrow(AccountError);

    // A secret address the guest made there stops working once they are removed.
    const token = `automation-${crypto.randomUUID()}`;
    const [guestUser] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, guestEmail));
    await db
      .insert(schema.automationInbox)
      .values({ organizationId: owner.personal, token, userId: guestUser!.id });
    expect(await viewerOfToken(schema.automationInbox, token)).not.toBeNull();

    expect(
      (await owner.page('/organization/remove-member', { memberIdOrEmail: guestEmail })).status
    ).toBe(200);
    expect(await viewerOfToken(schema.automationInbox, token)).toBeNull();

    // Their session falls back to their own Organization instead of locking them out.
    expect((await resolveViewer(guest.page.headers()))?.organizationId).toBe(guest.personal);
    const [session] = await db
      .select({ active: schema.session.activeOrganizationId })
      .from(schema.session)
      .where(and(eq(schema.session.userId, guestUser!.id)));
    expect(session?.active).toBe(guest.personal);
  });
});
