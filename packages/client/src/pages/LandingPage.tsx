import { APP_NAME } from '@zapbots/finance';
import { ArrowRight } from 'lucide-react';
import {
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Caveman, type CavemanOutfit } from '@zapbots/ui/blocks/caveman';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import { Button } from '@zapbots/ui/components/button';
import { Input } from '@zapbots/ui/components/input';
import { Label } from '@zapbots/ui/components/label';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n, type StringKey } from '../lib/i18n';
import { formatCents } from '../lib/format';
import { readSpend } from '../lib/landingSpend';
import { COMPANY } from '../lib/legal';
import './landing.css';

/*
 * The Caveguy's page (docs/adr/0035, 0039), built as the papers the app hands you: the hero, the
 * Agentes as an index beside their own screens (the Financeiro's live), how it works as the receipt
 * of one spend, Seguro por padrão as a table, the Plans as tiles that step up, the answers as
 * reading text, the sign-up already open and the name cropped at the foot. No photographs: the
 * pictures are the app's own screens, built in HTML (`data-ui`). Only what the app does today.
 */

const SIGN_UP = '/sign-in?step=sign-up';

/** The page for visitors, signed in or not. "Entrar" leads to /sign-in. */
export function LandingPage() {
  const { t } = useI18n();
  useReveal();
  return (
    <div className="landing min-h-svh" data-theme="landing">
      <a className="l-skip sr-only focus:not-sr-only" href="#content">
        {t('landing.skip')}
      </a>
      <Header />
      <main id="content">
        <Hero />
        <Agents />
        <How />
        <Trust />
        <Pricing />
        <Questions />
        <Close />
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------- shared

function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('l-container', className)} {...props} />;
}

const NAV: { href: string; label: StringKey }[] = [
  // From the root, so they work on the Termos and the Política too.
  { href: '/#agents', label: 'landing.nav.agents' },
  { href: '/#how', label: 'landing.nav.how' },
  { href: '/#trust', label: 'landing.nav.trust' },
  { href: '/#pricing', label: 'landing.nav.pricing' },
  { href: '/#faq', label: 'landing.nav.questions' },
];

// ---------------------------------------------------------------- header

/** The landing page's header for the site's other pages (the Termos, the Política). */
export function SiteHeader() {
  return <Header />;
}

function Header() {
  const { t } = useI18n();
  // The line under the bar shows only once the page has scrolled under it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 0);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  return (
    <header className="l-bar" data-scrolled={scrolled || undefined}>
      <Container className="flex h-full items-center gap-4">
        <Link aria-label={APP_NAME} className="l-link flex items-center gap-2.5" to="/">
          <LogoBadge size={40} />
          <span className="l-wordmark max-[400px]:sr-only">{APP_NAME}</span>
        </Link>
        <nav aria-label={t('landing.nav.sections')} className="ml-6 hidden gap-6 whitespace-nowrap lg:flex">
          {NAV.map(item => (
            <a className="l-link" href={item.href} key={item.href}>
              {t(item.label)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link className="l-link hidden px-2 sm:inline" to="/sign-in">
            {t('landing.nav.signIn')}
          </Link>
          <Button asChild className="l-btn l-btn--small">
            <Link to={SIGN_UP}>{t('landing.nav.signUp')}</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

// ---------------------------------------------------------------- hero

function Hero() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="hero-title" className="l-hero">
      <Container>
        <h1 className="l-display" id="hero-title">
          {t('landing.hero.title1')}
          <br />
          {t('landing.hero.title2')}
        </h1>
        <div className="l-hero__row">
          <div className="flex flex-col gap-6">
            <p className="l-lead max-w-[30ch]">{t('landing.hero.lead')}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="l-btn">
                <Link to={SIGN_UP}>
                  {t('landing.hero.start')} <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild className="l-btn l-btn--quiet max-sm:hidden">
                <a href="#pricing">{t('landing.hero.plans')}</a>
              </Button>
            </div>
          </div>
          <div className="l-wall" data-bot="FINANCE">
            <Caveman mood="happy" outfit="PLAIN" size={360} />
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- agents

type Ink = 'FINANCE' | 'FITNESS' | 'PERSONAL';

const AGENTS: { does: StringKey; ink: Ink; name: StringKey; outfit: CavemanOutfit }[] = [
  {
    does: 'landing.agents.finance.does',
    ink: 'FINANCE',
    name: 'landing.agents.finance',
    outfit: 'FINANCE',
  },
  {
    does: 'landing.agents.personal.does',
    ink: 'PERSONAL',
    name: 'landing.agents.personal',
    outfit: 'PERSONAL',
  },
  {
    does: 'landing.agents.fitness.does',
    ink: 'FITNESS',
    name: 'landing.agents.fitness',
    outfit: 'FITNESS',
  },
];

/**
 * The three Agentes as an index: pointing at or picking a name shows that Agente's screen on the
 * plate beside it. The Financeiro's is the page's one live thing: type a spend, read the reply.
 */
function Agents() {
  const { t } = useI18n();
  const [chosen, setChosen] = useState(0);
  const agent = AGENTS[chosen]!;
  return (
    <section aria-labelledby="agents-title" className="l-section l-section--field" id="agents">
      <Container className="l-split">
        <div className="l-plate" data-bot={agent.ink} data-reveal>
          {/* All three stay mounted, so what the visitor typed survives a look at the others. */}
          <div className="l-plate__in" hidden={agent.ink !== 'FINANCE'}>
            <FinanceUi />
          </div>
          <div className="l-plate__in" hidden={agent.ink !== 'PERSONAL'}>
            <PersonalUi />
          </div>
          <div className="l-plate__in" hidden={agent.ink !== 'FITNESS'}>
            <FitnessUi />
          </div>
        </div>
        <div className="l-split__text">
          <h2 className="l-heading" data-reveal id="agents-title">
            {t('landing.agents.title')}
          </h2>
          <div aria-label={t('landing.nav.agents')} className="l-index" data-reveal role="tablist">
            {AGENTS.map((option, index) => (
              <Button
                aria-selected={index === chosen}
                className="l-index__item"
                key={option.ink}
                onClick={() => setChosen(index)}
                onFocus={() => setChosen(index)}
                onMouseEnter={() => setChosen(index)}
                role="tab"
                variant="ghost"
              >
                <Caveman
                  mood={index === chosen ? 'happy' : 'idle'}
                  outfit={option.outfit}
                  size={44}
                />
                {t(option.name)}
              </Button>
            ))}
          </div>
          <p className="l-lead max-w-[36ch]" key={agent.does}>
            {t(agent.does)}
          </p>
          <p className="max-w-[44ch]" data-reveal>
            {t('landing.agents.how')}
          </p>
          <div data-reveal>
            <Button asChild className="l-btn">
              <Link to={SIGN_UP}>
                {t('landing.hero.start')} <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** The chat's head, as in the app's panel. */
function UiHead({ outfit, title }: { outfit: CavemanOutfit; title: string }) {
  const { t } = useI18n();
  return (
    <div className="l-ui__head">
      <Caveman mood="happy" outfit={outfit} size={32} />
      <span className="font-semibold">{title}</span>
      <span className="l-ui__note">{t('landing.agents.example')}</span>
    </div>
  );
}

/** The Financeiro's chat, live: what the visitor types is read in the browser by `readSpend`. */
function FinanceUi() {
  const { t } = useI18n();
  const sample = t('landing.agents.trySample');
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const said = sent ?? sample;
  const guess = readSpend(said);
  const amount = guess ? formatCents(guess.cents) : '';
  const reply = !guess
    ? t('landing.agents.tryMissing')
    : guess.place
      ? t('landing.agents.tryReply', { amount, place: guess.place })
      : t('landing.agents.tryReplyNoPlace', { amount });
  const send = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim()) setSent(draft.trim());
    setDraft('');
  };
  return (
    <div className="l-ui" data-ui>
      <UiHead outfit="FINANCE" title={t('landing.agents.finance')} />
      <div aria-live="polite" className="l-ui__body">
        <p className="l-msg l-msg--mine" key={`ask-${said}`}>
          {said}
        </p>
        <div className="l-ui__reply" key={`say-${said}`}>
          <p className="l-msg">{reply}</p>
          {guess?.place ? (
            <div className="l-proposal">
              <p className="font-semibold">{t('landing.ui.expense')}</p>
              <dl>
                <dt>{t('landing.ui.amount')}</dt>
                <dd className="tabular-nums">{amount}</dd>
                <dt>{t('landing.ui.place')}</dt>
                <dd>{guess.place}</dd>
                <dt>{t('landing.ui.day')}</dt>
                <dd>{t('landing.ui.today')}</dd>
              </dl>
              <div aria-hidden className="flex gap-2">
                <span className="l-proposal__go">{t('landing.ui.confirm')}</span>
                <span className="l-proposal__no">{t('landing.ui.cancel')}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <form className="l-ui__input" onSubmit={send}>
        <Label className="sr-only" htmlFor="try-spend">
          {t('landing.agents.try')}
        </Label>
        <Input
          autoComplete="off"
          id="try-spend"
          maxLength={80}
          onChange={event => setDraft(event.target.value)}
          placeholder={sample}
          value={draft}
        />
        <Button className="l-ui__send" type="submit">
          {t('landing.agents.send')}
        </Button>
      </form>
      <p className="l-ui__hint">{t('landing.agents.tryHint')}</p>
    </div>
  );
}

/** The Pessoal's day ahead: an Evento and the open Tarefas. */
function PersonalUi() {
  const { t } = useI18n();
  return (
    <div className="l-ui" data-ui>
      <UiHead outfit="PERSONAL" title={t('landing.agents.personal')} />
      <div className="l-ui__body">
        <p className="font-semibold">{t('landing.ui.tomorrow')}</p>
        <p className="l-ui__line">
          <span className="tabular-nums">09:00</span>
          <span>{t('landing.ui.dentist')}</span>
        </p>
        <p className="mt-3 font-semibold">{t('landing.ui.tasks')}</p>
        <p className="l-ui__line">
          <span aria-hidden className="l-ui__box" />
          <span>{t('landing.ui.condo')}</span>
          <span className="l-ui__soft">{t('landing.ui.condoDue')}</span>
        </p>
        <p className="l-ui__line">
          <span aria-hidden className="l-ui__box" />
          <span>{t('landing.ui.bread')}</span>
        </p>
      </div>
    </div>
  );
}

/** The Fitness's Ficha for today. */
function FitnessUi() {
  const { t } = useI18n();
  const rows: [StringKey, string][] = [
    ['landing.ui.squat', '4 × 10'],
    ['landing.ui.bench', '4 × 10'],
    ['landing.ui.row', '3 × 12'],
  ];
  return (
    <div className="l-ui" data-ui>
      <UiHead outfit="FITNESS" title={t('landing.agents.fitness')} />
      <div className="l-ui__body">
        <p className="font-semibold">{t('landing.ui.workout')}</p>
        {rows.map(([name, sets]) => (
          <p className="l-ui__line" key={name}>
            <span>{t(name)}</span>
            <span className="l-ui__soft tabular-nums">{sets}</span>
          </p>
        ))}
        <p className="l-ui__soft mt-3">{t('landing.ui.next')}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- how it works

const STEPS: { group: StringKey; rows: StringKey[]; time: string }[] = [
  { group: 'landing.how.you', rows: ['landing.how.you.1'], time: '14:02' },
  { group: 'landing.how.it', rows: ['landing.how.it.1', 'landing.how.it.2'], time: '14:02' },
  { group: 'landing.how.decide', rows: ['landing.how.decide.1'], time: '14:03' },
];

/** Transações after the Confirmar: the new line on top of the ones before it (sample figures). */
const LEDGER = [
  { amount: '−R$ 32,00', fresh: true, name: 'landing.ui.ledger1' },
  { amount: '−R$ 46,80', name: 'landing.ui.ledger2' },
  { amount: '−R$ 9,90', name: 'landing.ui.ledger3' },
] as const;

/** How it works, printed as the receipt of one spend; the same exchange on WhatsApp beside it. */
function How() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="how-title" className="l-section l-section--soot" id="how">
      <Container className="l-how">
        <div className="flex flex-col gap-8">
          <h2 className="l-heading" data-reveal id="how-title">
            {t('landing.how.title')}
          </h2>
          <p className="l-lead max-w-[34ch]" data-reveal>
            {t('landing.how.lead')}
          </p>
          <div className="l-wa" data-reveal data-ui>
            <p className="l-wa__head">{t('landing.how.whatsapp')}</p>
            <p className="l-wa__mine">{t('landing.how.waAsk')}</p>
            <p className="l-wa__theirs">{t('landing.how.waSay')}</p>
            <p className="l-wa__mine">{t('landing.agents.trySample')}</p>
            <div className="l-wa__theirs">
              <p>
                {t('landing.agents.tryReply', {
                  amount: 'R$ 32,00',
                  place: t('landing.ui.ledger1'),
                })}
              </p>
              <div aria-hidden className="l-wa__buttons">
                <span>{t('landing.ui.confirm')}</span>
                <span>{t('landing.ui.cancel')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="l-how__result">
          <div className="l-slip" data-reveal>
            {STEPS.map(step => (
              <div key={step.group}>
                <p className="l-slip__group">{t(step.group)}</p>
                {step.rows.map(row => (
                  <p className="l-slip__row" key={row}>
                    <span>{t(row)}</span>
                    <span aria-hidden className="l-slip__dots" />
                    <span className="tabular-nums">{step.time}</span>
                  </p>
                ))}
              </div>
            ))}
            <p className="l-slip__total">
              <span>{t('landing.how.total')}</span>
              <span>{t('landing.how.totalTime')}</span>
            </p>
          </div>
          <div className="l-ledger" data-reveal data-ui>
            <p className="font-semibold">{t('landing.ui.transactions')}</p>
            {LEDGER.map(line => (
              <p className="l-ledger__row" data-new={'fresh' in line || undefined} key={line.name}>
                <span aria-hidden className="l-ledger__mark">
                  {t(line.name)[0]}
                </span>
                <span>
                  {t(line.name)}
                  <span className="l-ui__soft block">{t(`${line.name}.when`)}</span>
                </span>
                <span className="font-semibold tabular-nums">{line.amount}</span>
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- trust

const TRUST = [
  'landing.trust.read',
  'landing.trust.confirm',
  'landing.trust.keys',
  'landing.trust.twoFactor',
  'landing.trust.health',
  'landing.trust.lgpd',
] as const;

/** Seguro por padrão as a plain table: only what the code does (ADR 0009, 0013, 0022, 0026, 0027). */
function Trust() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="trust-title" className="l-section" id="trust">
      <Container className="flex flex-col gap-12">
        <div className="l-trust__top">
          <div className="flex flex-col gap-6">
            <h2 className="l-heading" data-reveal id="trust-title">
              {t('landing.trust.title1')}
              <br />
              <span className="l-trust__step">{t('landing.trust.title2')}</span>
            </h2>
            <p className="l-lead max-w-[40ch]" data-reveal>
              {t('landing.trust.lead')}
            </p>
          </div>
          <div className="l-key" data-reveal data-ui>
            <p className="font-semibold">{t('landing.ui.aiKeys')}</p>
            {[
              ['OpenRouter', 'a1f9'],
              ['Anthropic', '7c2e'],
              ['Google', 'k04q'],
            ].map(([provider, last4]) => (
              <p className="l-key__row" key={provider}>
                <span>{provider}</span>
                <span className="tabular-nums">•••• {last4}</span>
              </p>
            ))}
            <p className="l-ui__soft">{t('landing.ui.sealed')} · AES-256-GCM</p>
          </div>
        </div>
        <table className="l-table" data-reveal>
          <thead>
            <tr>
              <th scope="col">{t('landing.trust.what')}</th>
              <th scope="col">{t('landing.trust.how')}</th>
              <th scope="col">{t('landing.trust.where')}</th>
            </tr>
          </thead>
          <tbody>
            {TRUST.map(item => (
              <tr key={item}>
                <th scope="row">{t(item)}</th>
                <td>{t(`${item}.a`)}</td>
                <td>{t(`${item}.w`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- pricing

/** The Limits are those of `PLANS` in `services/billing/plans.ts`. The bigger Plan stands taller. */
const PLANS: {
  cta: StringKey;
  features: StringKey[];
  name: StringKey;
  note: StringKey;
  price: string;
  tone: 'paper' | 'soot' | 'accent';
}[] = [
  {
    cta: 'landing.hero.start',
    features: [
      'landing.pricing.free.messages',
      'landing.pricing.free.flows',
      'landing.pricing.free.agents',
      'landing.pricing.free.import',
      'landing.pricing.free.chat',
    ],
    name: 'landing.pricing.free',
    note: 'landing.pricing.forever',
    price: 'R$ 0',
    tone: 'paper',
  },
  {
    cta: 'landing.pricing.subscribe',
    features: [
      'landing.pricing.pro.messages',
      'landing.pricing.pro.flows',
      'landing.pricing.free.agents',
      'landing.pricing.free.import',
      'landing.pricing.free.chat',
      'landing.pricing.pro.cancel',
    ],
    name: 'landing.pricing.pro',
    note: 'landing.pricing.month',
    price: 'R$ 39,90',
    tone: 'soot',
  },
  {
    cta: 'landing.pricing.subscribeMax',
    features: [
      'landing.pricing.max.messages',
      'landing.pricing.max.flows',
      'landing.pricing.max.custom',
      'landing.pricing.free.agents',
      'landing.pricing.free.import',
      'landing.pricing.free.chat',
      'landing.pricing.pro.cancel',
    ],
    name: 'landing.pricing.max',
    note: 'landing.pricing.month',
    price: 'R$ 99,90',
    tone: 'accent',
  },
];

function Pricing() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="pricing-title" className="l-section l-section--field" id="pricing">
      <Container className="l-steps">
        <h2 className="l-heading l-steps__title" data-reveal id="pricing-title">
          {t('landing.pricing.title')}
        </h2>
        {PLANS.map((plan, index) => (
          <article
            aria-labelledby={`plan-${index}`}
            className="l-step"
            data-reveal
            data-tone={plan.tone}
            key={plan.name}
            style={{ '--d': index } as CSSProperties}
          >
            <h3 className="l-step__name" id={`plan-${index}`}>
              {t(plan.name)}
            </h3>
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="l-price">{plan.price}</span>
              <span>{t(plan.note)}</span>
            </p>
            <ul className="flex flex-col gap-1.5">
              {plan.features.map(feature => (
                <li key={feature}>{t(feature)}</li>
              ))}
            </ul>
            <Button asChild className="l-btn mt-auto self-start">
              <Link to={SIGN_UP}>{t(plan.cta)}</Link>
            </Button>
          </article>
        ))}
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- questions

const QUESTIONS = [
  'landing.q.password',
  'landing.q.banks',
  'landing.q.health',
  'landing.q.chat',
  'landing.q.phone',
  'landing.q.cancel',
  'landing.q.data',
  'landing.q.voice',
] as const;

/** Every answer at a glance, as reading text: no toggles. */
function Questions() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="faq-title" className="l-section" id="faq">
      <Container className="l-faq">
        <h2 className="l-heading" data-reveal id="faq-title">
          {t('landing.questions.title')}
        </h2>
        <div className="l-faq__text" data-reveal>
          {QUESTIONS.map(question => (
            <p key={question}>
              <strong>{t(question)}</strong> {t(`${question}.a`)}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- close

/** The close opens the sign-up: the e-mail goes on to its form (in state, never the URL). */
function Close() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(SIGN_UP, { state: { email: email.trim() } });
  };
  return (
    <section aria-labelledby="start-title" className="l-close">
      <Container className="l-close__grid">
        <div className="l-close__text">
          <div data-reveal>
            <Caveman mood="happy" outfit="PLAIN" size={120} />
          </div>
          <h2 className="l-heading" data-reveal id="start-title">
            {t('landing.cta.title')}
          </h2>
          <p className="max-w-[36ch]" data-reveal>
            {t('landing.cta.lead')}
          </p>
        </div>
        <form className="l-dialog" data-reveal data-ui onSubmit={submit}>
          <p className="l-dialog__title">{t('landing.cta.dialog')}</p>
          <Label htmlFor="cta-email">{t('landing.cta.emailLabel')}</Label>
          <Input
            autoComplete="email"
            id="cta-email"
            onChange={event => setEmail(event.target.value)}
            placeholder={t('landing.cta.email')}
            type="email"
            value={email}
          />
          <Button className="l-btn w-full" type="submit">
            {t('landing.cta.go')} <ArrowRight aria-hidden />
          </Button>
          <p className="l-ui__soft">{t('landing.cta.free')}</p>
        </form>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_LINKS: { href: string; label: StringKey }[] = [
  { href: '/terms', label: 'landing.footer.terms' },
  { href: '/privacy', label: 'landing.footer.privacy' },
  { href: `mailto:${COMPANY.email}`, label: 'landing.footer.contact' },
];

/** The back of the page: the legal row over the name, cropped by the bottom edge. */
function Footer() {
  const { t } = useI18n();
  return (
    <footer className="l-footer">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <nav aria-label={t('landing.nav.sections')} className="flex flex-wrap gap-x-8 gap-y-2">
          {FOOTER_LINKS.map(({ href, label }) =>
            href.startsWith('/') ? (
              <Link className="l-link whitespace-nowrap" key={href} to={href}>
                {t(label)}
              </Link>
            ) : (
              <a className="l-link whitespace-nowrap" href={href} key={href}>
                {t(label)}
              </a>
            )
          )}
        </nav>
        <p>
          © {new Date().getFullYear()} {APP_NAME}. {t('landing.footer.rights')}
        </p>
      </Container>
      <Link aria-label={APP_NAME} className="l-mast" to="/">
        {APP_NAME}
      </Link>
    </footer>
  );
}

// ---------------------------------------------------------------- motion

/**
 * Each `[data-reveal]` rises in once as it enters. The hidden start is set only once this runs
 * (`data-motion` on the page), so without script, or with reduced motion, everything just shows.
 */
function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const page = document.querySelector<HTMLElement>('.landing');
    if (!page) return;
    page.dataset.motion = '';
    const seen = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = '';
          seen.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    for (const item of page.querySelectorAll('[data-reveal]')) seen.observe(item);
    return () => {
      seen.disconnect();
      delete page.dataset.motion;
    };
  }, []);
}
