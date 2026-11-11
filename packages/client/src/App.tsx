import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { Splash } from '@zapbots/ui/blocks/logo';

import { Layout, Scrolling } from './components/Layout';
import { APP_BASE, IN_APP } from './lib/area';
import { authClient } from './lib/auth';
import { isLanguage, useI18n } from './lib/i18n';
import { DOCUMENTS_ENABLED } from './lib/nav';
import { forgetNext, pendingNext, rememberNext } from './lib/organizations';
import { useAppliedTheme } from './lib/theme';
import { useDocumentTitle } from './lib/title';
import { LoginPage, ResetPasswordPage } from './pages/LoginPage';

/** A page loaded on first visit, so the finance screens stay out of the first load. */
function page<Name extends string, Props>(
  load: () => Promise<Record<Name, ComponentType<Props>>>,
  name: Name
) {
  return lazy(async () => ({ default: (await load())[name] }));
}

const LandingPage = page(() => import('./pages/LandingPage'), 'LandingPage');
const TermsPage = page(() => import('./pages/LegalPage'), 'TermsPage');
const PrivacyPage = page(() => import('./pages/LegalPage'), 'PrivacyPage');
const BotLayout = page(() => import('./components/BotLayout'), 'BotLayout');
const CreditOperationPage = page(
  () => import('./pages/CreditOperationPage'),
  'CreditOperationPage'
);
const finance = <Name extends string>(name: Name) =>
  page(() => import('./pages/FinancePage') as Promise<Record<Name, ComponentType>>, name);
const IncomePage = finance('IncomePage');
const FixedPage = finance('FixedPage');
const CardsPage = finance('CardsPage');
const InstallmentsPage = finance('InstallmentsPage');
const SubscriptionsPage = finance('SubscriptionsPage');
const CategoriesPage = page(() => import('./pages/CategoriesPage'), 'CategoriesPage');
const EntriesPage = page<'EntriesPage', object>(() => import('./pages/EntriesPage'), 'EntriesPage');
const MoneyPage = page(() => import('./pages/MoneyPage'), 'MoneyPage');
const PayoffPage = page(() => import('./pages/PayoffPage'), 'PayoffPage');
const WelcomePage = page(() => import('./pages/WelcomePage'), 'WelcomePage');
const InvitePage = page(() => import('./pages/InvitePage'), 'InvitePage');
const ChatPage = page(() => import('./pages/ChatPage'), 'ChatPage');
const JobsPage = page(() => import('./pages/JobsPage'), 'JobsPage');
const JobPage = page(() => import('./pages/JobPage'), 'JobPage');
const DocumentPage = page(() => import('./pages/DocumentPage'), 'DocumentPage');
const IntegrationsPage = page(() => import('./pages/IntegrationsPage'), 'IntegrationsPage');
const SettingsPage = page(() => import('./pages/SettingsPage'), 'SettingsPage');
const ProfilePage = page(() => import('./pages/ProfilePage'), 'ProfilePage');
const PlanPage = page(() => import('./pages/PlanPage'), 'PlanPage');
const CalendarPage = page(() => import('./pages/personal/CalendarPage'), 'CalendarPage');
const BookingLinksPage = page(
  () => import('./pages/personal/BookingLinksPage'),
  'BookingLinksPage'
);
const WorkoutSharePage = page(() => import('./pages/WorkoutSharePage'), 'WorkoutSharePage');
const BookingPage = page(() => import('./pages/BookingPage'), 'BookingPage');
const CancelBookingPage = page(() => import('./pages/BookingPage'), 'CancelBookingPage');

/** Financeiro was split: Salário went to Entradas, the rest (Obrigações too) to Gastos. */
function LegacyFinances() {
  const { hash } = useLocation();
  return (
    <Navigate
      replace
      to={
        hash === '#obligations'
          ? '/caishen/installments#loans'
          : hash === '#income'
            ? '/caishen/income'
            : `/caishen/fixed${hash}`
      }
    />
  );
}

/** Saídas fixas held the debts and the cards too; their old anchors open Dívidas and Cartões. */
/** Tarefas is off the app for now; its old address goes home keeping the query. */
function HomeWithSearch() {
  const { search } = useLocation();
  return <Navigate replace to={`/${search}`} />;
}

function LegacyFixed() {
  const { hash, search } = useLocation();
  return (
    <Navigate
      replace
      to={
        hash === '#obligations' || hash === '#loans' || hash === '#financing'
          ? `/caishen/installments${hash === '#financing' ? hash : '#loans'}`
          : hash === '#cards' || hash.startsWith('#card-')
            ? `/caishen/cards${hash}`
            : hash === '#subscriptions'
              ? '/caishen/subscriptions'
              : `/caishen/fixed${search}${hash}`
      }
    />
  );
}

/** Contas fixas lost its debts, Assinaturas and cards to tabs: their old anchors go there. */
function FixedPath() {
  const { hash } = useLocation();
  return ['#obligations', '#loans', '#financing', '#subscriptions', '#cards'].includes(hash) ||
    hash.startsWith('#card-') ? (
    <LegacyFixed />
  ) : (
    <FixedPage />
  );
}

/** Dívidas are the Parcelamentos now: its address lands there, keeping the Financiamentos'. */
function DebtsPath() {
  const { hash } = useLocation();
  return (
    <Navigate replace to={`/caishen/installments${hash === '#financing' ? hash : '#loans'}`} />
  );
}

/** Plano was a tab of Configurações; its old address keeps Stripe's `?checkout=`. */
function LegacyPlan() {
  const { search } = useLocation();
  return <Navigate replace to={`/plan${search}`} />;
}

/** Integrações used to be one page per kind; the old links land on its part of the one page. */
function LegacyIntegration() {
  const { group } = useParams<{ group: string }>();
  return <Navigate replace to={group === 'models' ? '/integrations#ai' : '/integrations'} />;
}

/** Crosses between the site and the app, which are two routers: a full page load. */
function Leave({ to }: { to: string }) {
  useEffect(() => window.location.replace(to), [to]);
  return <Splash />;
}

/** An app screen opened at its old root address, e.g. `/caishen/entries` or Stripe's `/plan?checkout=`. */
function LegacyAppPath() {
  const { hash, pathname, search } = useLocation();
  return <Leave to={`${APP_BASE}${pathname}${search}${hash}`} />;
}

export function App() {
  const { data: session, isPending } = authClient.useSession();
  const { setLanguage } = useI18n();
  const { pathname } = useLocation();
  const language = session?.user.language;
  useDocumentTitle(IN_APP);
  // The site stays light; the User's theme is the app's.
  useAppliedTheme(Boolean(session) && IN_APP);

  // The address kept while signed out (an invitation) is opened once, then forgotten.
  const next = session && IN_APP ? pendingNext() : null;
  useEffect(() => {
    if (next && pathname === next) forgetNext();
  }, [next, pathname]);

  // Signed in, the User's own language wins over the one this browser remembered.
  useEffect(() => {
    if (isLanguage(language)) setLanguage(language);
  }, [language, setLanguage]);

  if (isPending) {
    return <Splash />;
  }

  // The site at the root reads the same signed in or out: the landing page, the Termos and the
  // Política (docs/adr/0027), booking and shared Fichas. Signed in, Entrar opens the app.
  if (!IN_APP) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route element={<LandingPage />} index />
          <Route element={<Navigate replace to="/" />} path="landing" />
          <Route element={session ? <Leave to={APP_BASE} /> : <LoginPage />} path="sign-in" />
          {/* A reset link opened while signed in still works; choosing the password signs out. */}
          <Route element={<ResetPasswordPage />} path="reset-password" />
          <Route element={<TermsPage />} path="terms" />
          <Route element={<PrivacyPage />} path="privacy" />
          <Route element={<BookingPage />} path="book/:slug" />
          <Route element={<WorkoutSharePage />} path="w/:token" />
          <Route element={<CancelBookingPage />} path="book/cancel/:token" />
          {/* Old addresses of the app's screens (e-mails, bookmarks) open them under /app. */}
          <Route element={<LegacyAppPath />} path="*" />
        </Routes>
      </Suspense>
    );
  }

  // Every User has a personal Organization from their first session on (docs/adr/0007).
  if (!session) {
    // An invitation's link opened signed out comes back after the sign-in (docs/adr/0038).
    rememberNext(pathname);
    return <Leave to="/sign-in" />;
  }

  if (next && pathname !== next) {
    return <Navigate replace to={next} />;
  }

  // A new User goes through the welcome wizard first; an invitation is answered before it.
  if (!session.user.onboardedAt && pathname !== '/welcome' && !pathname.startsWith('/invite/')) {
    return <Navigate replace to="/welcome" />;
  }

  // Every path is in English; the app speaks Portuguese and, later, English too.
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<Splash />}>
            <WelcomePage user={session.user} />
          </Suspense>
        }
        path="welcome"
      />
      <Route
        element={
          <Suspense fallback={<Splash />}>
            <InvitePage />
          </Suspense>
        }
        path="invite/:id"
      />
      <Route element={<Layout user={session.user} />}>
        {/* No Página inicial: the Financeiro is the home. */}
        <Route element={<Navigate replace to="/caishen" />} index />
        <Route element={<ChatPage user={session.user} />} path="chat" />
        <Route
          element={
            <Scrolling>
              <JobsPage />
            </Scrolling>
          }
          path="workflows"
        />
        <Route
          element={
            <Scrolling>
              <JobPage />
            </Scrolling>
          }
          path="workflows/:id"
        />
        <Route element={<Navigate replace to="/" />} path="documents" />
        <Route
          element={DOCUMENTS_ENABLED ? <DocumentPage /> : <Navigate replace to="/" />}
          path="documents/:id"
        />
        <Route element={<BotLayout bot="FINANCE" />} path="caishen">
          <Route element={<MoneyPage />} index />
          <Route element={<EntriesPage />} path="entries" />
          <Route element={<DebtsPath />} path="debts" />
          <Route element={<IncomePage />} path="income" />
          <Route element={<FixedPath />} path="fixed" />
          <Route element={<CardsPage />} path="cards" />
          <Route element={<InstallmentsPage />} path="installments" />
          <Route element={<SubscriptionsPage />} path="subscriptions" />
          <Route element={<CategoriesPage />} path="categories" />
          <Route element={<Navigate replace to="/caishen/fixed#taxes" />} path="taxes" />
          <Route element={<Navigate replace to="/caishen" />} path="reports" />
          <Route element={<PayoffPage />} path="payoff" />
          <Route element={<Navigate replace to="/caishen" />} path="calculators" />
          {/* Old addresses: the tabs of Lançamentos, Visão geral, Relatório, Mês, Financeiro, Orçamento, Score. */}
          <Route element={<Navigate replace to="/caishen/income" />} path="entries/income" />
          <Route element={<LegacyFixed />} path="entries/fixed" />
          <Route element={<Navigate replace to="/caishen/fixed#taxes" />} path="entries/taxes" />
          <Route element={<Navigate replace to="/caishen" />} path="report" />
          {['overview', 'month', 'budget', 'credit'].map(path => (
            <Route element={<Navigate replace to="/caishen" />} key={path} path={path} />
          ))}
          <Route element={<LegacyFinances />} path="finances" />
          {['obligations', 'loans', 'financing'].map(path => (
            <Route
              element={
                <Navigate
                  replace
                  to={`/caishen/installments#${path === 'financing' ? 'financing' : 'loans'}`}
                />
              }
              key={path}
              path={path}
            />
          ))}
          <Route element={<CreditOperationPage />} path="operations/:id" />
          <Route element={<Navigate replace to="/workflows" />} path="jobs/*" />
        </Route>
        {/* Tarefas is off the app for now; its address goes home. */}
        <Route
          element={
            <Scrolling>
              <CalendarPage />
            </Scrolling>
          }
          path="personal/calendar"
        />
        <Route
          element={
            <Scrolling>
              <BookingLinksPage />
            </Scrolling>
          }
          path="personal/calendar/booking"
        />
        <Route element={<HomeWithSearch />} path="personal/tasks" />
        <Route element={<Navigate replace to="/" />} path="personal/notes" />
        <Route element={<Navigate replace to="/" />} path="personal/goals" />
        <Route element={<Navigate replace to="/" />} path="personal" />
        <Route element={<Navigate replace to="/" />} path="fitness/workouts" />
        <Route element={<Navigate replace to="/" />} path="fitness/diet" />
        <Route element={<Navigate replace to="/" />} path="fitness/macros" />
        <Route element={<Navigate replace to="/" />} path="fitness/sleep" />
        <Route element={<Navigate replace to="/" />} path="fitness/measures" />
        <Route element={<Navigate replace to="/" />} path="fitness" />
        <Route element={<IntegrationsPage />} path="integrations" />
        <Route element={<Navigate replace to="/integrations#ai" />} path="integrations/models" />
        <Route element={<LegacyIntegration />} path="integrations/:group" />
        <Route
          element={
            <Scrolling>
              <SettingsPage />
            </Scrolling>
          }
          path="settings"
        />
        <Route element={<LegacyPlan />} path="settings/plan" />
        <Route element={<Navigate replace to="/settings" />} path="organization" />
        <Route element={<Navigate replace to="/integrations#ai" />} path="models" />
        <Route
          element={
            <Scrolling>
              <PlanPage />
            </Scrolling>
          }
          path="plan"
        />
        <Route
          element={
            <Scrolling>
              <ProfilePage />
            </Scrolling>
          }
          path="profile"
        />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Route>
    </Routes>
  );
}
