import {
  BuildingIcon,
  ChevronDownIcon,
  CreditCardIcon,
  LanguagesIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { Tabs, TabsList, TabsTrigger } from '@zapbots/ui/components/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

import { HEADER_ICON } from '../lib/header';

import { authClient } from '../lib/auth';
import { isLanguage, LANGUAGES, useI18n, type Language, type StringKey } from '../lib/i18n';
import { reloadOrganization, switchOrganization } from '../lib/organizations';
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
const firstNames = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).join(' ');

/** The avatar's initials in white on blue. */
const BLUE =
  '*:data-[slot=avatar-fallback]:bg-primary *:data-[slot=avatar-fallback]:text-primary-foreground';

/** The account's screens, in the order the menu lists them. */
const ACCOUNT: { icon: LucideIcon; label: StringKey; to: string }[] = [
  { icon: UserIcon, label: 'menu.profile', to: '/profile' },
  { icon: CreditCardIcon, label: 'rail.plan', to: '/plan' },
  { icon: SettingsIcon, label: 'nav.settings', to: '/settings' },
];

const THEMES: { label: StringKey; value: ThemeChoice }[] = [
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

/**
 * Who is signed in, as their round avatar and first names at the right of the header, its menu after Hostinger's:
 * the name and e-mail, the account's screens, the language (saved on the User), the theme (per
 * browser) and signing out.
 */
export function ProfileMenu({ user }: { user: ProfileUser }) {
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const { choice, setChoice } = useThemeChoice();
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const active = session?.session.activeOrganizationId ?? '';
  const [creating, setCreating] = useState(false);

  // Saved on the User too: the session's language wins on the next load (App.tsx).
  const changeLanguage = async (next: Language) => {
    const previous = language;
    setLanguage(next);
    const result = await authClient.updateUser({ language: next });
    if (result.error) setLanguage(previous);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('profile.label')}
          className={cn(HEADER_ICON, 'group/profile w-auto gap-2 p-0 md:pr-3 md:pl-1')}
          variant="ghost"
        >
          <UserAvatar className={cn(BLUE, 'size-10 md:size-8')} user={user} />
          <span className="hidden max-w-32 truncate text-sm font-semibold md:inline">
            {firstNames(user.name)}
          </span>
          <ChevronDownIcon className="hidden size-4 transition-transform group-data-[state=open]/profile:rotate-180 md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-1.5" sideOffset={10}>
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2.5 font-normal">
          <UserAvatar className={cn(BLUE, 'size-12 text-base')} user={user} />
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{user.name}</div>
            <div className="truncate text-sm text-muted-foreground">{user.email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Every Organization the User is a Member of; picking one reloads the app in it. */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 px-3 py-2.5">
            <BuildingIcon className="size-[18px] text-muted-foreground" />
            {t('orgs.label')}
            <span className="ml-auto max-w-32 truncate pr-1 text-muted-foreground">
              {organizations?.find(organization => organization.id === active)?.name}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-w-72">
            <DropdownMenuRadioGroup
              onValueChange={id => id !== active && void switchOrganization(id)}
              value={active}
            >
              {organizations?.map(organization => (
                <DropdownMenuRadioItem key={organization.id} value={organization.id}>
                  <span className="truncate">{organization.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onSelect={() => setCreating(true)}>
              <PlusIcon className="size-4" />
              {t('orgs.new')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {ACCOUNT.map(entry => (
            <DropdownMenuItem
              className="gap-3 px-3 py-2.5"
              key={entry.to}
              onSelect={() => navigate(entry.to)}
            >
              <entry.icon className="size-[18px]" />
              {t(entry.label)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 px-3 py-2.5">
            <LanguagesIcon className="size-[18px] text-muted-foreground" />
            {t('account.language')}
            <span className="ml-auto pr-1 text-muted-foreground">
              {LANGUAGES.find(option => option.value === language)?.label}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              onValueChange={next => isLanguage(next) && void changeLanguage(next)}
              value={language}
            >
              {LANGUAGES.map(option => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 px-3 pt-1.5 pb-2.5">
          <span className="text-sm font-medium">{t('theme.title')}</span>
          <Tabs onValueChange={next => setChoice(next as ThemeChoice)} value={choice}>
            <TabsList className="w-full rounded-full">
              {THEMES.map(theme => (
                <TabsTrigger className="rounded-full" key={theme.value} value={theme.value}>
                  {t(theme.label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-3 px-3 py-2.5" onSelect={() => void authClient.signOut()}>
          <LogOutIcon className="size-[18px]" />
          {t('profile.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <NewOrganization onOpenChange={setCreating} open={creating} />
    </DropdownMenu>
  );
}

/** Nova organização: a name, then it is created, made active and opened. */
function NewOrganization({
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
