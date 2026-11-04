import { useMutation, useQuery } from '@apollo/client/react';
import { FinishOnboardingDocument, ViewerHolderDocument } from '@zapbots/graphql/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Field } from '@zapbots/ui/blocks/field';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';
import { Progress } from '@zapbots/ui/components/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zapbots/ui/components/select';

import { FormError } from '../components/FormError';
import { TimeZoneCard } from '../components/TimeZoneCard';
import { useToast } from '../components/Toaster';
import { authClient } from '../lib/auth';
import { isLanguage, LANGUAGES, useI18n, type Language, type StringKey } from '../lib/i18n';
import { ImportButton } from './EntriesPage';
import { EntryForms, type EntryKind } from './FinancePage';

const STEPS: { hint: StringKey; kinds?: EntryKind[]; title: StringKey }[] = [
  { hint: 'onboarding.setupHint', title: 'onboarding.setup' },
  { hint: 'onboarding.incomeHint', kinds: ['INCOME'], title: 'onboarding.income' },
  {
    hint: 'onboarding.expensesHint',
    kinds: ['EXPENSE', 'RECURRING'],
    title: 'onboarding.expenses',
  },
  { hint: 'onboarding.debtsHint', kinds: ['LOAN', 'FINANCING', 'CARD'], title: 'onboarding.debts' },
];

/**
 * The first-run wizard, full screen, before the app: time zone and language, then income,
 * expenses and debts through the same forms as "Adicionar". Every step can be skipped; finishing
 * or skipping sets `user.onboardedAt`, so App.tsx stops sending the User here.
 */
export function WelcomePage({ user }: { user: { name: string; timezone?: string | null } }) {
  const { language, setLanguage, t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { refetch } = authClient.useSession();
  const viewer = useQuery(ViewerHolderDocument);
  const [finish, { loading }] = useMutation(FinishOnboardingDocument);
  const [step, setStep] = useState(0);
  // Bumped after each save, so the form opens blank for the next one.
  const [saved, setSaved] = useState(0);
  const [readError, setReadError] = useState<string | null>(null);
  const current = STEPS[step]!;
  const last = step === STEPS.length - 1;

  const done = async () => {
    const result = await finish().catch(() => null);
    if (!result?.data) return toast({ message: t('common.saveFailed'), tone: 'error' });
    await refetch();
    navigate('/', { replace: true });
  };

  const go = (next: number) => {
    setStep(next);
    setSaved(0);
    setReadError(null);
  };

  const changeLanguage = async (next: Language) => {
    const previous = language;
    setLanguage(next);
    const result = await authClient.updateUser({ language: next });
    if (result.error) setLanguage(previous);
  };

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4">
          <LogoBadge size={40} />
          <Button disabled={loading} onClick={() => void done()} variant="ghost">
            {t('onboarding.skip')}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            {t('onboarding.step', { n: step + 1, total: STEPS.length })}
          </p>
          <Progress aria-hidden value={((step + 1) / STEPS.length) * 100} />
        </div>
        <header>
          {step === 0 && (
            <p className="mb-1 text-muted-foreground">
              {t('onboarding.title', { name: user.name.split(' ')[0] ?? '' })}
            </p>
          )}
          <h1>{t(current.title)}</h1>
          <p className="mt-1 text-muted-foreground">{t(current.hint)}</p>
        </header>

        <div className="page-enter flex flex-col gap-4" key={step}>
          {current.kinds ? (
            <>
              {current.title === 'onboarding.expenses' && (
                <div className="flex flex-col gap-2">
                  <ImportButton
                    holderId={viewer.data?.viewerHolder.id}
                    onError={setReadError}
                    owner={viewer.data?.viewerHolder.name ?? ''}
                  />
                  {readError && <FormError message={readError} />}
                </div>
              )}
              {saved > 0 && <p className="text-success">{t('onboarding.saved')}</p>}
              <Card>
                <EntryForms key={saved} kinds={current.kinds} onDone={() => setSaved(n => n + 1)} />
              </Card>
            </>
          ) : (
            <>
              <TimeZoneCard timezone={user.timezone ?? 'America/Sao_Paulo'} />
              <Card>
                <h2 className="text-lg font-semibold">{t('account.language')}</h2>
                <Field hint={t('account.languageHint')} label={t('account.language')}>
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
              </Card>
            </>
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Button disabled={step === 0} onClick={() => go(step - 1)} variant="outline">
            {t('onboarding.back')}
          </Button>
          <Button disabled={loading} onClick={() => (last ? void done() : go(step + 1))}>
            {t(last ? 'onboarding.done' : 'onboarding.next')}
          </Button>
        </div>
      </div>
    </main>
  );
}
