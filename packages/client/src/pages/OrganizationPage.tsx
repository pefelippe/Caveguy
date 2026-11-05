import { useMutation, useQuery } from '@apollo/client/react';
import { OrganizationDocument, RenameOrganizationDocument } from '@zapbots/graphql/client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { Field } from '@zapbots/ui/blocks/field';
import { PageSkeleton } from '@zapbots/ui/blocks/page-skeleton';
import { Avatar, AvatarFallback } from '@zapbots/ui/components/avatar';
import { Badge } from '@zapbots/ui/components/badge';
import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zapbots/ui/components/dialog';
import { Input } from '@zapbots/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zapbots/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zapbots/ui/components/table';

import { FormError } from '../components/FormError';
import { initials } from '../components/ProfileMenu';
import { authClient } from '../lib/auth';
import { useI18n, type StringKey } from '../lib/i18n';
import { reloadOrganization } from '../lib/organizations';

export const ROLES: Record<string, StringKey> = {
  admin: 'users.roleAdmin',
  member: 'users.roleMember',
  owner: 'users.roleOwner',
};

/**
 * Configurações › Organização: its name, its Members and, for owners and admins, invitations by
 * e-mail or link and removing Members; anyone but the only owner can leave (docs/adr/0038).
 */
export function OrganizationSettings() {
  const { t } = useI18n();
  const { data: session } = authClient.useSession();
  const { data, loading } = useQuery(OrganizationDocument);
  const [rename, { error, loading: saving }] = useMutation(RenameOrganizationDocument);
  const [name, setName] = useState<string | null>(null);

  if (loading && !data) return <PageSkeleton />;
  if (!data) return <p>{t('common.loadFailed')}</p>;
  const organization = data.organization;
  const value = name ?? organization.name;
  const members = organization.members;
  const me = members.find(member => member.email === session?.user.email);
  const admin = me?.role === 'owner' || me?.role === 'admin';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // The new name shows everywhere at once; the old one comes back if the server says no.
    await rename({
      optimisticResponse: { renameOrganization: { ...organization, name: value.trim() } },
      variables: { name: value },
    }).catch(() => undefined);
    setName(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold">{t('org.info')}</h2>
        <div className="flex flex-col gap-6 sm:flex-row">
          <Avatar className="size-16 shrink-0">
            <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
              {initials(organization.name) || '·'}
            </AvatarFallback>
          </Avatar>
          <form className="flex flex-1 flex-col gap-5" onSubmit={event => void submit(event)}>
            <Field label={t('org.name')}>
              <Input maxLength={80} onChange={event => setName(event.target.value)} value={value} />
            </Field>
            <div className="flex items-center gap-3">
              <Button
                disabled={saving || !value.trim() || value === organization.name}
                type="submit"
              >
                {t('common.save')}
              </Button>
              {error && <FormError error={error} />}
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <div>
          <h2 className="text-lg font-semibold">{t('users.title')}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('org.memberCount', { count: members.length })} · {t('users.subtitle')}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.name')}</TableHead>
              <TableHead className="text-right">{t('users.role')}</TableHead>
              {admin && <TableHead className="w-0" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs font-semibold">
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="font-medium">
                        {member.name}{' '}
                        {member.email === session?.user.email && (
                          <span className="font-normal text-muted-foreground">
                            {t('profile.you')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">
                    {ROLES[member.role] ? t(ROLES[member.role]!) : member.role}
                  </Badge>
                </TableCell>
                {admin && (
                  <TableCell className="text-right">
                    {member.role !== 'owner' && member.id !== me?.id && (
                      <RemoveMember id={member.id} name={member.name} />
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {me && me.role !== 'owner' && (
          <LeaveOrganization id={organization.id} name={organization.name} />
        )}
      </Card>

      {admin && <Invitations />}
    </div>
  );
}

/** Asks, then removes a Member: they stop seeing the Organization at once. */
function RemoveMember({ id, name }: { id: string; name: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const remove = async () => {
    setBusy(true);
    const result = await authClient.organization.removeMember({ memberIdOrEmail: id });
    setBusy(false);
    if (result.error) return setFailed(true);
    // The Members come from GraphQL: read the page again.
    window.location.reload();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="ghost">
        {t('members.remove')}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('members.removeTitle', { name })}</DialogTitle>
            <DialogDescription>{t('members.removeText')}</DialogDescription>
          </DialogHeader>
          {failed && <p className="text-sm text-destructive">{t('orgs.failed')}</p>}
          <DialogFooter>
            <Button disabled={busy} onClick={() => void remove()} variant="destructive">
              {t('members.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Leaves the Organization and goes back to the oldest one the User is still in. */
function LeaveOrganization({ id, name }: { id: string; name: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const leave = async () => {
    setBusy(true);
    const result = await authClient.organization.leave({ organizationId: id });
    setBusy(false);
    if (result.error) return setFailed(true);
    reloadOrganization();
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="outline">
        {t('members.leave')}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('members.leaveTitle', { name })}</DialogTitle>
            <DialogDescription>{t('members.leaveText')}</DialogDescription>
          </DialogHeader>
          {failed && <p className="text-sm text-destructive">{t('orgs.failed')}</p>}
          <DialogFooter>
            <Button disabled={busy} onClick={() => void leave()} variant="destructive">
              {t('members.leave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface Invitation {
  email: string;
  expiresAt: Date | string;
  id: string;
  role: string;
  status: string;
}

/** Convidar pessoas: an e-mail and a role; the pending invitations with their link and Cancelar. */
function Invitations() {
  const { language, t } = useI18n();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<StringKey | null>(null);
  const [pending, setPending] = useState<Invitation[]>([]);

  const load = useCallback(async () => {
    const { data } = await authClient.organization.listInvitations();
    setPending((data ?? []).filter(invitation => invitation.status === 'pending'));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const result = await authClient.organization.inviteMember({ email: email.trim(), role });
    setBusy(false);
    if (result.error) return setNotice('orgs.failed');
    setEmail('');
    setNotice('invite.sent');
    void load();
  };

  const copy = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/app/invite/${id}`);
    setNotice('invite.copied');
  };

  const cancel = async (id: string) => {
    await authClient.organization.cancelInvitation({ invitationId: id });
    void load();
  };

  const day = (value: Date | string) =>
    new Date(value).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'long',
    });

  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold">{t('invite.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('invite.text')}</p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={event => void invite(event)}>
        <Input
          aria-label={t('invite.email')}
          autoComplete="off"
          className="flex-1"
          onChange={event => setEmail(event.target.value)}
          placeholder="nome@email.com"
          required
          type="email"
          value={email}
        />
        <Select onValueChange={value => setRole(value as 'admin' | 'member')} value={role}>
          <SelectTrigger aria-label={t('users.role')} className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">{t(ROLES.member!)}</SelectItem>
            <SelectItem value="admin">{t(ROLES.admin!)}</SelectItem>
          </SelectContent>
        </Select>
        <Button disabled={busy || !email.trim()} type="submit">
          {t('invite.send')}
        </Button>
      </form>
      {notice && (
        <p
          className={notice === 'orgs.failed' ? 'text-sm text-destructive' : 'text-sm'}
          role="status"
        >
          {t(notice)}
        </p>
      )}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t('invite.pending')}</h3>
          <p className="text-sm text-muted-foreground">{t('invite.personal')}</p>
          <ul className="flex flex-col gap-1">
            {pending.map(invitation => (
              <li
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-muted px-3 py-2"
                key={invitation.id}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{invitation.email}</span>
                <span className="text-sm text-muted-foreground">
                  {ROLES[invitation.role] ? t(ROLES[invitation.role]!) : invitation.role},{' '}
                  {t('invite.until', { date: day(invitation.expiresAt) })}
                </span>
                <Button onClick={() => void copy(invitation.id)} size="sm" variant="ghost">
                  {t('invite.copy')}
                </Button>
                <Button onClick={() => void cancel(invitation.id)} size="sm" variant="ghost">
                  {t('invite.cancel')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
