import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { LogoBadge, Splash } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';

import { authClient } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { reloadOrganization, rememberNext } from '../lib/organizations';
import { ROLES } from './OrganizationPage';

interface Invitation {
  inviterEmail: string;
  organizationName: string;
  role: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'open'; invitation: Invitation }
  | { kind: 'notYours' }
  | { kind: 'gone' };

/**
 * An invitation's link (docs/adr/0038): who invites, to which Organization and as what; accepting
 * makes the User a Member and opens it. Only the account with the invited e-mail can answer it.
 */
export function InvitePage() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void authClient.organization.getInvitation({ query: { id } }).then(({ data, error }) => {
      if (data && data.status === 'pending') {
        setState({ invitation: data, kind: 'open' });
      } else if (error?.status === 403) {
        setState({ kind: 'notYours' });
      } else {
        setState({ kind: 'gone' });
      }
    });
  }, [id]);

  const answer = async (accept: boolean) => {
    setBusy(true);
    setFailed(false);
    const result = accept
      ? await authClient.organization.acceptInvitation({ invitationId: id })
      : await authClient.organization.rejectInvitation({ invitationId: id });
    setBusy(false);
    if (result.error) return setFailed(true);
    if (accept) reloadOrganization();
    else navigate('/', { replace: true });
  };

  // Signs out and keeps the link, so the other account lands back here.
  const switchAccount = async () => {
    rememberNext(`/invite/${id}`);
    await authClient.signOut();
    window.location.assign('/sign-in');
  };

  if (state.kind === 'loading') return <Splash />;

  return (
    <main className="grid min-h-svh place-items-center bg-background px-4 py-10">
      <Card className="flex w-full max-w-md flex-col items-center gap-5 text-center">
        <LogoBadge size={56} />
        {state.kind === 'open' ? (
          <>
            <h1 className="text-2xl font-semibold text-balance">
              {t('invite.pageTitle', { name: state.invitation.organizationName })}
            </h1>
            <p className="text-muted-foreground">
              {t('invite.pageText', {
                inviter: state.invitation.inviterEmail,
                role: ROLES[state.invitation.role]
                  ? t(ROLES[state.invitation.role]!).toLowerCase()
                  : state.invitation.role,
              })}
            </p>
            <div className="flex w-full flex-col gap-2">
              <Button disabled={busy} onClick={() => void answer(true)}>
                {t('invite.accept')}
              </Button>
              <Button disabled={busy} onClick={() => void answer(false)} variant="ghost">
                {t('invite.decline')}
              </Button>
            </div>
            {failed && <p className="text-sm text-destructive">{t('orgs.failed')}</p>}
          </>
        ) : state.kind === 'notYours' ? (
          <>
            <p>{t('invite.notYours', { email: session?.user.email ?? '' })}</p>
            <Button className="w-full" onClick={() => void switchAccount()}>
              {t('invite.switchAccount')}
            </Button>
          </>
        ) : (
          <>
            <p>{t('invite.gone')}</p>
            <Button className="w-full" onClick={() => navigate('/', { replace: true })}>
              {t('invite.home')}
            </Button>
          </>
        )}
      </Card>
    </main>
  );
}
