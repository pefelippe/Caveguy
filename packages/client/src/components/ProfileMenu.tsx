import {
  CreditCardIcon,
  LogOutIcon,
  MonitorIcon,
  PlugIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@zapbots/ui/components/avatar';
import { Button } from '@zapbots/ui/components/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';
import { cn } from '@zapbots/ui/lib/utils';

import { authClient } from '../lib/auth';
import { useI18n, type StringKey } from '../lib/i18n';
import { reloadOrganization } from '../lib/organizations';
import { useThemeChoice, type ThemeChoice } from '../lib/theme';

export interface ProfileUser {
  email: string;
  /** The Google photo, when the User signed in with Google, or the URL set on Perfil. */
  image?: string | null;
  name: string;
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('');

/** The first two names, as the header shows them. */
/** The avatar's initials in white on blue. */
export const BLUE =
  '*:data-[slot=avatar-fallback]:bg-primary *:data-[slot=avatar-fallback]:text-primary-foreground';

export const THEMES: { label: StringKey; value: ThemeChoice }[] = [
  { label: 'theme.light', value: 'light' },
  { label: 'theme.dark', value: 'dark' },
  { label: 'theme.system', value: 'system' },
];

/** The User's photo, or their initials, in a circle. */
export function UserAvatar({ className, user }: { className?: string; user: ProfileUser }) {
  return (
    <Avatar className={cn('size-8', className)}>
      {user.image && <AvatarImage alt={user.name} referrerPolicy="no-referrer" src={user.image} />}
      <AvatarFallback className="bg-header-muted text-xs font-semibold text-header-foreground">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** The account's menu, after WorkOS's: the name and e-mail, the theme (per browser, the choice
 * shown beside it), Perfil, the Organization's screens and signing out. At the menu's foot on a
 * computer (`AppSidebar`), behind the avatar in the header on a phone. */
export function AccountMenuItems({ user }: { user: ProfileUser }) {
  const { t } = useI18n();
  const { choice, setChoice } = useThemeChoice();
  const items = [
    { icon: UserIcon, label: t('nav.profile'), to: '/profile' },
    { icon: SettingsIcon, label: t('nav.settings'), to: '/settings' },
    { icon: PlugIcon, label: t('nav.integrations'), to: '/integrations' },
    { icon: CreditCardIcon, label: t('rail.plan'), to: '/plan' },
  ];
  return (
    <>
      <DropdownMenuLabel className="px-3 py-2.5 font-normal">
        <div className="truncate font-semibold">{user.name}</div>
        <div className="truncate text-sm text-muted-foreground">{user.email}</div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="gap-3 px-3 py-2">
          <MonitorIcon className="size-[18px] text-muted-foreground" />
          {t('theme.title')}
          <span className="ml-auto pr-1 text-muted-foreground">
            {t(THEMES.find(theme => theme.value === choice)!.label)}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            onValueChange={next => setChoice(next as ThemeChoice)}
            value={choice}
          >
            {THEMES.map(theme => (
              <DropdownMenuRadioItem key={theme.value} value={theme.value}>
                {t(theme.label)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      {items.map(item => (
        <DropdownMenuItem asChild className="gap-3 px-3 py-2" key={item.to}>
          <Link to={item.to}>
            <item.icon className="size-[18px] text-muted-foreground" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-3 px-3 py-2" onSelect={() => void authClient.signOut()}>
        <LogOutIcon className="size-[18px]" />
        {t('profile.signOut')}
      </DropdownMenuItem>
    </>
  );
}

/** The round avatar in the header, on a phone only (a computer has the account at the menu's foot). */
export function ProfileMenu({ user }: { user: ProfileUser }) {
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('profile.label')}
          className="ml-1 size-9 rounded-full p-0 md:hidden"
          variant="ghost"
        >
          <UserAvatar className={BLUE} user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-xl p-1.5" sideOffset={8}>
        <AccountMenuItems user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Nova organização: a name, then it is created, made active and opened. */
export function NewOrganization({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await authClient.organization.create({
      name: name.trim(),
      slug: `org-${crypto.randomUUID()}`,
    });
    setBusy(false);
    if (!result.error) return reloadOrganization();
    setError(
      result.error.code === 'YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS'
        ? 'orgs.limit'
        : 'orgs.failed'
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-4" onSubmit={event => void submit(event)}>
          <DialogHeader>
            <DialogTitle>{t('orgs.newTitle')}</DialogTitle>
            <DialogDescription>{t('orgs.newText')}</DialogDescription>
          </DialogHeader>
          <Input
            aria-label={t('org.name')}
            autoFocus
            maxLength={80}
            onChange={event => setName(event.target.value)}
            placeholder={t('org.name')}
            value={name}
          />
          {error && <p className="text-sm text-destructive">{t(error)}</p>}
          <DialogFooter>
            <Button disabled={busy || !name.trim()} type="submit">
              {t('orgs.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
