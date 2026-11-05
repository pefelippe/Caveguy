import { APP_NAME } from '@zapbots/finance';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, type FormEvent, type HTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Caveman, type CavemanOutfit } from '@zapbots/ui/blocks/caveman';
import { LogoBadge } from '@zapbots/ui/blocks/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@zapbots/ui/components/accordion';
import { Button } from '@zapbots/ui/components/button';
import { Input } from '@zapbots/ui/components/input';
import { Label } from '@zapbots/ui/components/label';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n, type StringKey } from '../lib/i18n';
import { COMPANY } from '../lib/legal';
import './landing.css';

/*
 * The Caveman's page (docs/adr/0035): the cave. Brutus before a wall of painted hands, a character
 * select where each Agente is him in other clothes, the Workflows as balloons beside Lascaux, the
 * Plans counted in notches beside the Ishango bone, the questions and the close. Tokens in
 * `landing.css`. Only what the app does today. The pictures are credited in the footer
 * (`public/site/credits.json`).
 */

const SIGN_UP = '/sign-in?step=sign-up';

/** The page for visitors, signed in or not. "Entrar" leads to /sign-in. */
export function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="landing min-h-svh" data-theme="landing">
      <a className="l-skip sr-only focus:not-sr-only" href="#content">
        {t('landing.skip')}
      </a>
      <Header />
      <main id="content">
        <Hero />
        <Agents />
        <Flows />
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
  { href: '/#workflows', label: 'landing.nav.flows' },
  { href: '/#pricing', label: 'landing.nav.pricing' },
  { href: '/#faq', label: 'landing.nav.questions' },
];

/** A speech balloon, its tail pointing down-left at whoever says it. */
function Balloon({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('l-balloon', className)}>{children}</p>;
}

/** A picture of the cave's world, self-hosted in `public/site` and credited in the footer. */
function Picture({ alt, className, src }: { alt: string; className?: string; src: string }) {
  return (
    <img
      alt={alt}
      className={cn('l-photo', className)}
      decoding="async"
      loading="lazy"
      src={`/site/${src}.jpg`}
    />
  );
}

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
        <nav aria-label={t('landing.nav.sections')} className="ml-6 hidden gap-6 md:flex">
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
            <Picture alt={t('landing.hero.wall')} className="l-wall__photo" src="cueva-manos" />
            <Caveman className="l-wall__uga" mood="happy" outfit="PLAIN" size={360} />
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- character select

interface Agent {
  ask: StringKey;
  does: StringKey;
  ink: 'FINANCE' | 'FITNESS' | 'PERSONAL';
  name: StringKey;
  outfit: CavemanOutfit;
  say: StringKey;
}

const AGENTS: Agent[] = [
  {
    ask: 'landing.agents.finance.ask',
    does: 'landing.agents.finance.does',
    ink: 'FINANCE',
    name: 'landing.agents.finance',
    outfit: 'FINANCE',
    say: 'landing.agents.finance.say',
  },
  {
    ask: 'landing.agents.personal.ask',
    does: 'landing.agents.personal.does',
    ink: 'PERSONAL',
    name: 'landing.agents.personal',
    outfit: 'PERSONAL',
    say: 'landing.agents.personal.say',
  },
  {
    ask: 'landing.agents.fitness.ask',
    does: 'landing.agents.fitness.does',
    ink: 'FITNESS',
    name: 'landing.agents.fitness',
    outfit: 'FITNESS',
    say: 'landing.agents.fitness.say',
  },
];

const ROTATE_MS = 4000;

/** The character select: picking an Agente dresses Brutus and plays a sample exchange. */
function Agents() {
  const { t } = useI18n();
  const [chosen, setChosen] = useState(0);
  // Walks the Agentes alone until the visitor picks one; held while the pointer or focus is in.
  const [auto, setAuto] = useState(true);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!auto || held || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setChosen(index => (index + 1) % AGENTS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [auto, held]);
  const agent = AGENTS[chosen]!;
  const pick = (index: number) => {
    setAuto(false);
    if (index === chosen) return;
    setChosen(index);
  };
  return (
    <section aria-labelledby="agents-title" className="l-section l-section--field" id="agents">
      <Container
        onBlur={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
      >
        <h2 className="l-heading" id="agents-title">
          {t('landing.agents.title')}
        </h2>
        <p className="l-lead mt-3 max-w-[48ch]">{t('landing.agents.lead')}</p>
        <div aria-label={t('landing.nav.agents')} className="l-select" role="toolbar">
          {AGENTS.map((option, index) => (
            <Button
              aria-pressed={index === chosen}
              className="l-tile"
              data-bot={option.ink}
              key={option.name}
              onClick={() => pick(index)}
              variant="ghost"
            >
              <Caveman
                mood={index === chosen ? 'happy' : 'idle'}
                outfit={option.outfit}
                size={88}
              />
              <span>{t(option.name)}</span>
            </Button>
          ))}
        </div>
        <div className="l-scene" data-bot={agent.ink} key={agent.name}>
          <Caveman className="l-scene__uga" mood="happy" outfit={agent.outfit} size={220} />
          <div className="l-scene__text">
            <h3 className="l-title">{t(agent.name)}</h3>
            <p>{t(agent.does)}</p>
            <p className="l-small">{t('landing.agents.how')}</p>
          </div>
          <div aria-label={t('landing.agents.example')} className="l-chat" role="group">
            <div className="l-chat__head">
              <Caveman mood="happy" outfit={agent.outfit} size={36} />
              <span className="l-chat__name">{t(agent.name)}</span>
              <span className="l-chat__label">{t('landing.agents.example')}</span>
            </div>
            <div className="l-chat__body">
              <p className="l-msg l-msg--mine">{t(agent.ask)}</p>
              <div className="l-chat__row">
                <Caveman outfit={agent.outfit} size={28} />
                <p className="l-msg">{t(agent.say)}</p>
              </div>
            </div>
            <div aria-hidden className="l-chat__input">
              <span>{t('landing.agents.type')}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- workflows

const FLOWS: StringKey[] = [
  'landing.flows.weekly.text',
  'landing.flows.monthly.text',
  'landing.flows.once.text',
];

/** Workflows: Jobs once, or Routines each week or month (docs/adr/0010), on the cave's dark. */
function Flows() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="flows-title" className="l-section l-section--soot" id="workflows">
      <Container className="grid items-start gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <h2 className="l-heading" id="flows-title">
            {t('landing.flows.title')}
          </h2>
          <p className="l-lead max-w-[40ch]">{t('landing.flows.lead')}</p>
          <figure className="l-figure">
            <Picture alt="" className="aspect-[4/3]" src="lascaux-replica" />
            <figcaption>{t('landing.flows.picture')}</figcaption>
          </figure>
        </div>
        <div className="flex flex-col gap-8">
          <Caveman mood="thinking" outfit="BUILDER" size={180} />
          <ul className="flex flex-col gap-8">
            {FLOWS.map(flow => (
              <li key={flow}>
                <Balloon>{t(flow)}</Balloon>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- pricing

/** The Limits are those of `PLANS` in `services/billing/plans.ts`. */
const PLANS: {
  cta: StringKey;
  features: StringKey[];
  name: StringKey;
  note: StringKey;
  price: string;
  primary?: boolean;
  /** Notches on the bone: more for the bigger Plan. */
  tally: number;
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
    primary: true,
    tally: 1,
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
    tally: 3,
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
    tally: 5,
  },
];

function Pricing() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="pricing-title" className="l-section l-section--field" id="pricing">
      <Container className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,2fr)]">
        <h2 className="l-heading lg:col-span-2" id="pricing-title">
          {t('landing.pricing.title')}
        </h2>
        <div>
          <figure className="l-figure max-lg:hidden">
            <Picture alt="" className="l-bone" src="ishango-bone" />
            <figcaption>{t('landing.pricing.bone')}</figcaption>
          </figure>
        </div>
        <ul className="flex flex-col gap-4">
          {PLANS.map(plan => (
            <li className="l-plan" data-primary={plan.primary || undefined} key={plan.name}>
              <div className="flex flex-col gap-3">
                <span aria-hidden className="l-tally">
                  {Array.from({ length: plan.tally }, (_, index) => (
                    <i key={index} />
                  ))}
                </span>
                <h3 className="l-title">{t(plan.name)}</h3>
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="l-price">{plan.price}</span>
                  <span>{t(plan.note)}</span>
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {plan.features.map(feature => (
                  <li className="l-check" key={feature}>
                    {t(feature)}
                  </li>
                ))}
              </ul>
              <Button asChild className={cn('l-btn', !plan.primary && 'l-btn--quiet')}>
                <Link to={SIGN_UP}>{t(plan.cta)}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- questions

const QUESTIONS: { answer: StringKey; question: StringKey }[] = [
  { answer: 'landing.q.voice.a', question: 'landing.q.voice' },
  { answer: 'landing.q.password.a', question: 'landing.q.password' },
  { answer: 'landing.q.health.a', question: 'landing.q.health' },
  { answer: 'landing.q.chat.a', question: 'landing.q.chat' },
  { answer: 'landing.q.cancel.a', question: 'landing.q.cancel' },
  { answer: 'landing.q.data.a', question: 'landing.q.data' },
];

function Questions() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="faq-title" className="l-section" id="faq">
      <Container className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-8">
          <h2 className="l-heading" id="faq-title">
            {t('landing.questions.title')}
          </h2>
          <figure className="l-figure max-md:hidden">
            <Picture alt="" className="aspect-square" src="lascaux-deer" />
            <figcaption>{t('landing.questions.picture')}</figcaption>
          </figure>
        </div>
        <Accordion className="l-faq" collapsible type="single">
          {QUESTIONS.map(item => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="l-faq__q">{t(item.question)}</AccordionTrigger>
              <AccordionContent className="l-faq__a">{t(item.answer)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- close

/** The close starts the product: the e-mail goes on to the sign-up form (in state, never the URL). */
function Close() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(SIGN_UP, { state: { email: email.trim() } });
  };
  return (
    <section aria-labelledby="start-title" className="l-close" data-bot="FINANCE">
      <Container className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
        <Caveman mood="happy" outfit="PLAIN" size={160} />
        <div className="flex flex-col gap-5">
          <h2 className="l-heading" id="start-title">
            {t('landing.cta.title')}
          </h2>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
            <Label className="sr-only" htmlFor="cta-email">
              {t('landing.cta.emailLabel')}
            </Label>
            <Input
              autoComplete="email"
              className="l-field"
              id="cta-email"
              onChange={event => setEmail(event.target.value)}
              placeholder={t('landing.cta.email')}
              type="email"
              value={email}
            />
            <Button className="l-btn" type="submit">
              {t('landing.cta.go')} <ArrowRight aria-hidden />
            </Button>
          </form>
          <p>{t('landing.cta.free')}</p>
        </div>
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

/** The pictures on the page, as `public/site/credits.json` records them. */
const PICTURES = [
  {
    by: 'Mariano',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:SantaCruz-CuevaManos-P2210651b.jpg',
    title: 'SantaCruz-CuevaManos-P2210651b',
  },
  {
    by: 'HTO',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Lascaux,_replica_03.JPG',
    title: 'Lascaux, replica 03',
  },
  {
    by: 'JhowieNitnek',
    license: 'CC BY-SA 4.0, cropped',
    page: 'https://commons.wikimedia.org/wiki/File:Ishango_bone.jpg',
    title: 'Ishango bone',
  },
  {
    by: 'HTO',
    license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Lascaux,_Megaloceros.jpg',
    title: 'Giant Deer',
  },
];

/** The close of the site: the name across the whole width, the legal links and the credits. */
function Footer() {
  const { t } = useI18n();
  return (
    <footer className="l-footer">
      <Container>
        <Link className="l-mast" to="/">
          {APP_NAME}
        </Link>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
        </div>
        <p className="l-credits">
          {t('landing.footer.pictures')}, via Wikimedia Commons:{' '}
          {PICTURES.map((picture, index) => (
            <span key={picture.page}>
              <a className="l-link underline" href={picture.page} rel="noreferrer" target="_blank">
                “{picture.title}”
              </a>
              , {picture.by}, {picture.license}
              {index < PICTURES.length - 1 ? '; ' : '.'}
            </span>
          ))}
        </p>
      </Container>
    </footer>
  );
}
