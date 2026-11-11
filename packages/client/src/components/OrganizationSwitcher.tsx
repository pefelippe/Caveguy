import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@zapbots/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@zapbots/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@zapbots/ui/components/popover';

import { authClient } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { switchOrganization } from '../lib/organizations';
import { NewOrganization } from './ProfileMenu';

/**
 * The open Organization, first in the header's trail: its name opens a search over every
 * Organization the User is a Member of (picking one reloads the app in it, docs/adr/0038) and
 * Nova organização.
 */
export function OrganizationSwitcher() {
  const { t } = useI18n();
  const { data: session } = authClient.useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const active = session?.session.activeOrganizationId ?? '';
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const name = organizations?.find(organization => organization.id === active)?.name;

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label={t('orgs.label')}
            className="h-8 max-w-56 gap-1.5 rounded-lg px-2.5 font-semibold data-[state=open]:bg-accent"
            variant="ghost"
          >
            <span className="truncate">{name ?? t('orgs.label')}</span>
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 rounded-xl p-0" sideOffset={6}>
          <Command>
            <CommandInput placeholder={t('orgs.search')} />
            <CommandList>
              <CommandEmpty>{t('orgs.none')}</CommandEmpty>
              <CommandGroup>
                {organizations?.map(organization => (
                  <CommandItem
                    className="gap-2 px-3 py-2.5 font-medium"
                    key={organization.id}
                    onSelect={() => {
                      setOpen(false);
                      if (organization.id !== active) void switchOrganization(organization.id);
                    }}
                    value={`${organization.name} ${organization.id}`}
                  >
                    <span className="truncate">{organization.name}</span>
                    {organization.id === active && <CheckIcon className="ml-auto size-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className="gap-2 px-3 py-2.5"
                  onSelect={() => {
                    setOpen(false);
                    setCreating(true);
                  }}
                >
                  <PlusIcon className="size-4" />
                  {t('orgs.new')}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <NewOrganization onOpenChange={setCreating} open={creating} />
    </>
  );
}
