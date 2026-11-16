import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import { APP_NAME } from '@zapbots/finance';
import { eq } from 'drizzle-orm';

import { sendEmail } from './mail';

export const MESSAGE_MAX = 4000;
const PER_HOUR = 10;

export class SupportError extends Error {}

// shortcut: kept in this process's memory, so a restart or a second instance resets it; move to the database if it is abused
const sent = new Map<string, number[]>();

/** Where Suporte and Enviar feedback land: SUPPORT_EMAIL, else the address on the legal pages. */
const inbox = () => process.env.SUPPORT_EMAIL ?? 'pedfelippe@gmail.com';

/**
 * Sends what the User wrote in Suporte or Enviar feedback to the team's inbox, with their name,
 * e-mail, Organization and the screen they were on, so the answer can go straight back to them.
 */
export async function contactTeam(
  viewer: Viewer,
  { kind, message, page }: { kind: 'FEEDBACK' | 'SUPPORT'; message: string; page?: null | string }
): Promise<void> {
  const text = message.trim();
  if (!text) throw new SupportError('Escreva a sua mensagem.');
  if (text.length > MESSAGE_MAX)
    throw new SupportError(`A mensagem pode ter até ${MESSAGE_MAX} caracteres.`);

  const now = Date.now();
  const recent = (sent.get(viewer.userId) ?? []).filter(at => now - at < 3_600_000);
  if (recent.length >= PER_HOUR)
    throw new SupportError('Você mandou muitas mensagens agora. Tente de novo daqui a pouco.');
  sent.set(viewer.userId, [...recent, now]);

  const [user] = await db
    .select({ email: schema.user.email, name: schema.user.name })
    .from(schema.user)
    .where(eq(schema.user.id, viewer.userId));

  const label = kind === 'SUPPORT' ? 'Suporte' : 'Feedback';
  await sendEmail({
    paragraphs: [
      `${label} de ${user?.name ?? 'alguém'} <${user?.email ?? 'sem e-mail'}>`,
      `Organização ${viewer.organizationId}${page ? `, na tela ${page.slice(0, 200)}` : ''}`,
      text,
    ],
    subject: `${APP_NAME} · ${label}: ${text.slice(0, 60)}`,
    to: inbox(),
  });
}
