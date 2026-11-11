import { useMutation } from '@apollo/client/react';
import { SetTimeZoneDocument } from '@zapbots/graphql/client';

import { Field } from '@zapbots/ui/blocks/field';
import { Card } from '@zapbots/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zapbots/ui/components/select';

import { authClient } from '../lib/auth';
import { useThemeChoice, type ThemeChoice } from '../lib/theme';
import { THEMES } from './ProfileMenu';
import { isLanguage, LANGUAGES, useI18n, type Language } from '../lib/i18n';
import { useToast } from './Toaster';

/** Brazil's zones, east to west, with a city each zone is known by. */
const BRAZIL = [
  { city: 'Fernando de Noronha', zone: 'America/Noronha' },
  { city: 'São Paulo, Rio, Brasília', zone: 'America/Sao_Paulo' },
  { city: 'Salvador', zone: 'America/Bahia' },
  { city: 'Recife', zone: 'America/Recife' },
  { city: 'Fortaleza', zone: 'America/Fortaleza' },
  { city: 'Belém', zone: 'America/Belem' },
  { city: 'Cuiabá', zone: 'America/Cuiaba' },
  { city: 'Manaus', zone: 'America/Manaus' },
  { city: 'Porto Velho', zone: 'America/Porto_Velho' },
  { city: 'Boa Vista', zone: 'America/Boa_Vista' },
  { city: 'Rio Branco', zone: 'America/Rio_Branco' },
];

/** The Viewer's language, theme (this browser's) and time zone, the latter where "today" is for their Tarefas, Agenda and Metas. */
export function TimeZoneCard({ timezone }: { timezone: string }) {
  const { language, setLanguage, t } = useI18n();
  const { choice, setChoice } = useThemeChoice();
  const toast = useToast();
  const { refetch } = authClient.useSession();
  const [save, { loading }] = useMutation(SetTimeZoneDocument, {
    refetchQueries: 'active',
  });
  const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = [
    ...BRAZIL,
    ...[browser, timezone]
      .filter((zone, index, all) => zone && all.indexOf(zone) === index)
      .filter(zone => !BRAZIL.some(option => option.zone === zone))
      .map(zone => ({
        city: zone.split('/').pop()!.replace(/_/g, ' '),
        zone,
      })),
  ];

  const change = async (zone: string) => {
    const result = await save({ variables: { timezone: zone } }).catch(() => null);
    if (result?.data) await refetch();
    else toast({ message: t('common.saveFailed'), tone: 'error' });
  };

  // Saved on the User too: the session's language wins on the next load (App.tsx).
  const changeLanguage = async (next: Language) => {
    const previous = language;
    setLanguage(next);
    const result = await authClient.updateUser({ language: next });
    if (result.error) {
      setLanguage(previous);
      toast({ message: t('common.saveFailed'), tone: 'error' });
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold">{t('profile.preferences')}</h2>
      <Field label={t('account.language')}>
        <Select
          onValueChange={next => isLanguage(next) && void changeLanguage(next)}
          value={language}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field hint={t('profile.themeHint')} label={t('theme.title')}>
        <Select onValueChange={next => setChoice(next as ThemeChoice)} value={choice}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map(theme => (
              <SelectItem key={theme.value} value={theme.value}>
                {t(theme.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field hint={t('profile.timezoneHint')} label={t('profile.timezone')}>
        <Select disabled={loading} onValueChange={zone => void change(zone)} value={timezone}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.zone} value={option.zone}>
                {option.city} ({option.zone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </Card>
  );
}
