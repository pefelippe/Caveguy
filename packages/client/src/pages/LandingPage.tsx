import {
  ArrowLeftRight,
  ArrowRight,
  CreditCard,
  FileText,
  Repeat,
  TrendingDown,
  Wallet,
  Mail,
  CircleCheck,
  MessageCircleQuestion,
  Paperclip,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { TelegramLogo, WhatsAppLogo } from '@zapbots/ui/blocks/brand-logos';
import { Logo } from '@zapbots/ui/blocks/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@zapbots/ui/components/accordion';
import { Button } from '@zapbots/ui/components/button';
import { Card } from '@zapbots/ui/components/card';
import { Input } from '@zapbots/ui/components/input';
import { Label } from '@zapbots/ui/components/label';
import { cn } from '@zapbots/ui/lib/utils';

import { useI18n, type StringKey } from '../lib/i18n';
import { COMPANY } from '../lib/legal';

/*
 * Simple and direct: the brand's two quiet colours (Cloud for the ground, a faint Sky for the
 * fields) and one loud, Amber Red, kept for the Caishen's answer and the close. Buttons are ink.
 * Only what exists today; what is coming (Open Finance, the plan for companies) says "Em breve".
 */

const SIGN_UP = '/sign-in?step=sign-up';

/** The page for visitors, signed in or not. "Entrar" leads to /sign-in. */
export function LandingPage() {
  const { t } = useI18n();
  return (
    <div className="landing min-h-svh overflow-x-clip bg-(--l-bg) text-(--l-ink)">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-(--l-ink) focus:px-4 focus:py-2 focus:text-white"
        href="#content"
      >
        {t('landing.skip')}
      </a>
      <Header />
      <main id="content">
        <Hero />
        <Features />
        <Name />
        <Pricing />
        <Questions />
        <Close />
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------- layout

/** The page's one width and margins, the header's. */
function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1680px] px-5 md:px-12', className)}>{children}</div>
  );
}

/** Square buttons with the mark's cut corner. */
const CUT_BUTTON =
  'cut h-14 rounded-none px-8 text-[17px] [--cut:12px] transition-transform active:translate-y-px';

const HEADING =
  'font-display text-[clamp(2.25rem,1.5rem+2.6vw,4rem)] leading-[1.02] font-light tracking-[-0.025em]';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Rises into place the first time it scrolls into view; `motion` drops the travel on reduced motion. */
function Reveal({
  card = false,
  children,
  className,
  delay = 0,
}: {
  /** A card comes from further down and grows into place. */
  card?: boolean;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={card ? { opacity: 0, scale: 0.94, y: 56 } : { opacity: 0, y: 24 }}
      transition={{ delay, duration: card ? 0.9 : 0.7, ease: EASE }}
      viewport={{ margin: '-80px', once: true }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/** A small filled copy of the cut corner, for lists. */
function CutDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('cut mt-[0.45em] size-[0.6em] shrink-0 bg-(--l-sky) [--cut:4px]', className)}
    />
  );
}

// ---------------------------------------------------------------- header

const NAV: { href: string; label: StringKey }[] = [
  { href: '#features', label: 'landing.nav.features' },
  { href: '#pricing', label: 'landing.nav.pricing' },
  { href: '#faq', label: 'landing.nav.questions' },
];

function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const link = 'rounded-md px-3.5 py-2 text-[16px] hover:bg-(--l-step)';

  // The header takes the sky's field once the page moves under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors',
        scrolled ? 'bg-(--l-surface)' : 'bg-(--l-bg)'
      )}
    >
      {/* The mark and the account's buttons take equal sides, so the sections sit in the middle. */}
      <Container className="flex h-[76px] items-center gap-2">
        <Link
          aria-label="Caishen"
          className="flex flex-1 basis-0 items-center gap-2.5 text-[22px] font-medium tracking-[-0.01em] sm:text-[26px]"
          to="/"
        >
          <Logo size={32} />
          Caishen
        </Link>
        <nav aria-label={t('landing.nav.sections')} className="hidden items-center gap-1 lg:flex">
          {NAV.map(item => (
            <a className={link} href={item.href} key={item.href}>
              {t(item.label)}
            </a>
          ))}
        </nav>
        <div className="flex flex-1 basis-0 items-center justify-end gap-2">
          <Link className={cn(link, 'max-sm:hidden')} to="/sign-in">
            {t('landing.nav.signIn')}
          </Link>
          <Button
            asChild
            className="h-11 rounded-none px-6 text-[16px] font-semibold max-sm:h-10 max-sm:px-3.5 max-sm:text-[14px]"
          >
            <Link to={SIGN_UP}>{t('landing.nav.signUp')}</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

/** Small flags drawn here: flag emojis show as letters on Windows. */
// ---------------------------------------------------------------- hero

function Hero() {
  const { t } = useI18n();
  const words = [t('landing.hero.title1'), t('landing.hero.title2')];
  return (
    <section
      aria-labelledby="hero-title"
      className="pt-10 pb-20 md:min-h-[calc(100svh-76px)] md:pt-16 md:pb-24"
    >
      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <h1
            className="font-display text-[clamp(2.75rem,11vw,9rem)] leading-[0.92] font-light tracking-[-0.045em] lg:text-[clamp(3rem,7.2vw,8.75rem)]"
            id="hero-title"
          >
            {words.map((line, row) => (
              <span className="block overflow-hidden pb-[0.08em]" key={line}>
                <motion.span
                  animate={{ y: '0%' }}
                  className="block"
                  initial={{ y: '105%' }}
                  transition={{
                    delay: 0.1 + row * 0.14,
                    duration: 1,
                    ease: EASE,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-[44ch] text-(length:--step-lead) leading-snug text-(--l-muted) md:mt-10"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
          >
            {t('landing.hero.lead')}
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-10"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
          >
            <Button asChild className={CUT_BUTTON}>
              <Link to={SIGN_UP}>
                {t('landing.hero.start')} <ArrowRight />
              </Link>
            </Button>
            <a
              className="text-[17px] font-medium text-(--l-sky-ink) underline-offset-[6px] hover:underline"
              href="#pricing"
            >
              {t('landing.hero.pricing')}
            </a>
          </motion.div>
          <motion.ul
            animate={{ opacity: 1, y: 0 }}
            className="mt-14 grid gap-8 sm:grid-cols-2 md:mt-20 xl:grid-cols-4"
            initial={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.7, duration: 0.7, ease: EASE }}
          >
            {CHAT_ROWS.map(({ icon: Icon, text, title }) => (
              <li key={title}>
                <Icon aria-hidden className="mb-3 size-6 text-(--l-sky-ink)" strokeWidth={1.75} />
                <h2 className="text-(length:--step-lead) leading-snug">{t(title)}</h2>
                <p className="mt-1 text-(length:--step-body) text-(--l-muted)">{t(text)}</p>
              </li>
            ))}
          </motion.ul>
        </div>
        <Phone />
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- features

const FEATURES: { icon: LucideIcon; name: StringKey; text: StringKey }[] = [
  {
    icon: FileText,
    name: 'landing.features.statements',
    text: 'landing.features.statements.text',
  },
  { icon: ArrowLeftRight, name: 'landing.features.flow', text: 'landing.features.flow.text' },
  {
    icon: Repeat,
    name: 'landing.features.recurring',
    text: 'landing.features.recurring.text',
  },
  { icon: CreditCard, name: 'landing.features.cards', text: 'landing.features.cards.text' },
  { icon: TrendingDown, name: 'landing.features.debts', text: 'landing.features.debts.text' },
  { icon: Wallet, name: 'landing.features.income', text: 'landing.features.income.text' },
];

/** What the app does, one icon, name and sentence each, in a dark card of its own. */
function Features() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="features-title"
      className="scroll-mt-20 bg-(--l-surface) py-24 md:py-36"
      id="features"
    >
      <Container>
        <Reveal>
          <h2 className={HEADING} id="features-title">
            {t('landing.show.title')}
          </h2>
        </Reveal>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {FEATURES.map(({ icon: Icon, ...item }, position) => (
            <li key={item.name}>
              <Reveal card className="h-full" delay={position * 0.1}>
                <Card className="h-full gap-0 rounded-none border-0 bg-(--l-ink) p-8 text-white md:p-10">
                  <Icon aria-hidden className="mb-5 size-8 text-(--l-sky)" strokeWidth={1.5} />
                  <h3 className="font-display text-[clamp(1.75rem,1.3rem+1.4vw,2.75rem)] leading-[1.05] font-light tracking-[-0.02em]">
                    {t(item.name)}
                  </h3>
                  <p className="mt-3 max-w-[40ch] text-(length:--step-body) text-white/70">
                    {t(item.text)}
                  </p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- chat

const CHAT_ROWS: { icon: LucideIcon; text: StringKey; title: StringKey }[] = [
  { icon: PenLine, text: 'landing.chat.note.text', title: 'landing.chat.note' },
  { icon: MessageCircleQuestion, text: 'landing.chat.ask.text', title: 'landing.chat.ask' },
  { icon: Paperclip, text: 'landing.chat.files.text', title: 'landing.chat.files' },
  { icon: CircleCheck, text: 'landing.chat.confirm.text', title: 'landing.chat.confirm' },
];

/** The sample conversation on the phone; `buttons` are the Proposal's Confirmar and Cancelar. */
const CHAT_SAMPLE: { buttons?: boolean; mine?: boolean; text: StringKey }[] = [
  { mine: true, text: 'landing.chat.note.bubble' },
  { buttons: true, text: 'landing.chat.phone.proposal' },
  { mine: true, text: 'landing.chat.phone.confirm' },
  { text: 'landing.chat.phone.saved' },
  { mine: true, text: 'landing.chat.ask.bubble' },
  { text: 'landing.chat.phone.due' },
];

/** A phone drawn in CSS, its messages arriving one by one the first time it scrolls into view. */
function Phone() {
  const { t } = useI18n();
  const bubble = 'max-w-[82%] px-4 py-2.5 text-[16px] leading-snug';
  return (
    <Reveal card className="lg:col-span-4 lg:col-start-9" delay={0.3}>
      <div
        aria-label={t('landing.chat.phone.label')}
        className="mx-auto w-full max-w-[380px] rounded-[44px] bg-(--l-ink) p-3"
        role="img"
      >
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[34px] bg-(--l-surface)">
          <div className="flex items-center gap-3 bg-white px-5 pt-7 pb-4">
            <Logo size={32} />
            <div className="text-left">
              <p className="text-[16px] font-semibold text-(--l-ink)">Caishen</p>
              <p className="text-[13px] text-(--l-muted)">{t('landing.chat.phone.sample')}</p>
            </div>
            <div aria-hidden className="ml-auto flex gap-2">
              <WhatsAppLogo className="size-5 text-[#128C4B]" />
              <TelegramLogo className="size-5 text-[#1B7FBF]" />
            </div>
          </div>
          <motion.ul
            className="flex flex-1 flex-col justify-end gap-2 p-4"
            initial="hidden"
            variants={{
              hidden: {},
              shown: { transition: { delayChildren: 0.4, staggerChildren: 0.7 } },
            }}
            viewport={{ margin: '-120px', once: true }}
            whileInView="shown"
          >
            {CHAT_SAMPLE.map(message => (
              <motion.li
                className={cn('flex', message.mine ? 'justify-end' : 'justify-start')}
                key={message.text}
                transition={{ duration: 0.4, ease: EASE }}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 12 },
                  shown: { opacity: 1, scale: 1, y: 0 },
                }}
              >
                <div
                  className={cn(
                    bubble,
                    message.mine
                      ? 'rounded-[18px] rounded-br-[4px] bg-(--l-sky) text-white'
                      : 'rounded-[18px] rounded-bl-[4px] bg-white text-(--l-ink)'
                  )}
                >
                  {t(message.text)}
                  {message.buttons && (
                    <span className="mt-3 grid grid-cols-2 gap-2 text-center text-[15px] font-medium text-(--l-sky-ink)">
                      <span className="rounded-full bg-(--l-surface) py-1.5">
                        {t('landing.chat.phone.confirm')}
                      </span>
                      <span className="rounded-full bg-(--l-surface) py-1.5">
                        {t('landing.chat.phone.cancel')}
                      </span>
                    </span>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </Reveal>
  );
}

// ---------------------------------------------------------------- name

const PROMISES: StringKey[] = [
  'landing.name.password',
  'landing.name.money',
  'landing.name.confirm',
  'landing.name.delete',
];

/** Where the name comes from, and what this Caishen will never do. */
function Name() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="name-title" className="py-24 md:py-40">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-5">
          <figure>
            <div className="cut aspect-[4/5] overflow-hidden bg-(--l-surface) [--cut:48px]">
              {/* The bottom of the photo, with the museum's number, stays out of the frame. */}
              <img
                alt={t('landing.name.alt')}
                className="size-full scale-[1.08] object-cover object-[50%_20%]"
                height={1920}
                loading="lazy"
                src="/site/caishen-dehua.jpg"
                width={1280}
              />
            </div>
            <figcaption className="mt-3 max-w-[60ch] text-[15px] text-(--l-muted)">
              {t('landing.name.caption')}
            </figcaption>
          </figure>
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <h2 className={HEADING} id="name-title">
              {t('landing.name.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-[48ch] text-(length:--step-lead) leading-snug">
              {t('landing.name.text')}
            </p>
          </Reveal>
          <ul className="mt-12 flex flex-col gap-5">
            {PROMISES.map((promise, position) => (
              <li key={promise}>
                <Reveal
                  className="flex gap-4 font-display text-[clamp(1.375rem,1.1rem+0.9vw,2rem)] leading-tight font-light tracking-[-0.015em]"
                  delay={0.12 + position * 0.06}
                >
                  <CutDot />
                  {t(promise)}
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- pricing

interface Plan {
  cta?: StringKey;
  features: StringKey[];
  name: StringKey;
  note: StringKey;
  price: string;
  text: StringKey;
}

/** The Limits are those of `PLANS` in `services/billing/plans.ts`. Empresas has no `cta`: it is coming. */
const PLANS: Plan[] = [
  {
    cta: 'landing.hero.start',
    features: [
      'landing.pricing.free.messages',
      'landing.pricing.free.jobs',
      'landing.pricing.free.import',
      'landing.pricing.free.flow',
      'landing.pricing.free.chat',
    ],
    name: 'landing.pricing.free',
    note: 'landing.pricing.forever',
    price: 'R$ 0',
    text: 'landing.pricing.free.text',
  },
  {
    cta: 'landing.pricing.subscribe',
    features: [
      'landing.pricing.pro.messages',
      'landing.pricing.pro.jobs',
      'landing.pricing.pro.all',
      'landing.check.cancel',
    ],
    name: 'landing.pricing.pro',
    note: 'landing.pricing.month',
    price: 'R$ 19',
    text: 'landing.pricing.pro.text',
  },
  {
    features: [
      'landing.pricing.business.contracts',
      'landing.pricing.business.metrics',
      'landing.pricing.business.reports',
      'landing.pricing.business.team',
    ],
    name: 'landing.pricing.business',
    note: 'landing.pricing.month',
    price: 'R$ 49',
    text: 'landing.pricing.business.text',
  },
];

/** The three plans side by side, each with its price, its Limits and its button. */
function Pricing() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="pricing-title"
      className="scroll-mt-20 bg-(--l-surface) py-24 md:py-40"
      id="pricing"
    >
      <Container>
        <Reveal>
          <h2 className={HEADING} id="pricing-title">
            {t('landing.pricing.title')}
          </h2>
          <p className="mt-6 text-(length:--step-body)">{t('landing.pricing.lead')}</p>
        </Reveal>
        <ul className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-3">
          {PLANS.map((plan, position) => (
            <li className="h-full" key={plan.name}>
              <Reveal card className="h-full" delay={position * 0.1}>
                <Card
                  className={cn(
                    'h-full gap-0 rounded-none border-0 bg-(--l-ink) p-8 text-white md:p-10',
                    !plan.cta && 'text-white/60'
                  )}
                >
                  <h3 className="text-(length:--step-lead)">{t(plan.name)}</h3>
                  <p className="mt-3 flex items-baseline gap-3">
                    <span className="font-display text-[clamp(3rem,1.8rem+3.6vw,5.5rem)] leading-none font-light tracking-[-0.03em] tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-[17px] text-white/60">{t(plan.note)}</span>
                  </p>
                  <p className="mt-6 max-w-[40ch] text-(length:--step-body)">{t(plan.text)}</p>
                  <ul className="mt-6 mb-10 flex flex-col gap-3 text-(length:--step-body)">
                    {plan.features.map(feature => (
                      <li className="flex gap-3" key={feature}>
                        <CutDot />
                        {t(feature)}
                      </li>
                    ))}
                  </ul>
                  {plan.cta ? (
                    <Button
                      asChild
                      className={cn(
                        CUT_BUTTON,
                        'mt-auto w-fit bg-white text-(--l-ink) hover:bg-white/90'
                      )}
                    >
                      <Link to={SIGN_UP}>
                        {t(plan.cta)} <ArrowRight />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className={cn(CUT_BUTTON, 'mt-auto w-fit bg-white/10 text-white')}
                      disabled
                      variant="secondary"
                    >
                      {t('landing.pricing.soon')}
                    </Button>
                  )}
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- questions

const QUESTIONS: { answer: StringKey; question: StringKey }[] = [
  { answer: 'landing.q.password.a', question: 'landing.q.password' },
  { answer: 'landing.q.files.a', question: 'landing.q.files' },
  { answer: 'landing.q.chat.a', question: 'landing.q.chat' },
  { answer: 'landing.q.cancel.a', question: 'landing.q.cancel' },
  { answer: 'landing.q.openFinance.a', question: 'landing.q.openFinance' },
  { answer: 'landing.q.business.a', question: 'landing.q.business' },
  { answer: 'landing.q.data.a', question: 'landing.q.data' },
];

function Questions() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="faq-title" className="scroll-mt-20 py-24 md:py-40" id="faq">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <h2 className={cn(HEADING, 'lg:sticky lg:top-28')} id="faq-title">
            {t('landing.questions.title')}
          </h2>
        </div>
        <Accordion className="flex flex-col gap-2 lg:col-span-8" collapsible type="single">
          {QUESTIONS.map((item, position) => (
            <Reveal delay={position * 0.04} key={item.question}>
              <AccordionItem
                className="border-0 transition-colors duration-300 data-[state=open]:text-(--l-sky-ink)"
                value={item.question}
              >
                <AccordionTrigger className="items-center py-4 font-display text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)] leading-tight font-light tracking-[-0.02em] hover:text-(--l-sky-ink) hover:no-underline [&>svg]:size-6 [&>svg]:text-current">
                  {t(item.question)}
                </AccordionTrigger>
                <AccordionContent className="max-w-[60ch] pb-6 text-(length:--step-body) leading-relaxed text-(--l-ink)">
                  {t(item.answer)}
                </AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- close

/** The close is a sentence with a blank: the e-mail goes on to the sign-up form (in state, never the URL). */
function Close() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(SIGN_UP, { state: { email: email.trim() } });
  };
  // The red opens from an inset card to the full width as it scrolls up to the top of the screen.
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ offset: ['start end', 'start start'], target: ref });
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(0% 6% 0% 6% round 32px)', 'inset(0% 0% 0% 0% round 0px)']
  );
  const titleY = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);
  return (
    <motion.section
      aria-labelledby="start-title"
      className="bg-(--l-seal) py-24 text-white md:py-36"
      ref={ref}
      style={reduced ? undefined : { clipPath }}
    >
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <motion.h2
            style={reduced ? undefined : { y: titleY }}
            className="font-display text-[clamp(3.25rem,1.6rem+6vw,7.5rem)] leading-[1] font-light tracking-[-0.03em]"
            id="start-title"
          >
            {t('landing.cta.title')}
          </motion.h2>
        </Reveal>
        <Reveal className="w-full max-w-[860px]" delay={0.1}>
          <form className="mt-10 flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
            <Label className="sr-only" htmlFor="cta-email">
              {t('landing.cta.emailLabel')}
            </Label>
            <div className="relative flex-1">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-6 size-6 -translate-y-1/2 text-(--l-muted)"
              />
              <Input
                autoComplete="email"
                className="h-16 rounded-none border-0 bg-white pr-6 pl-15 text-[20px] text-(--l-ink) shadow-none placeholder:text-(--l-muted) focus-visible:ring-4 focus-visible:ring-white/40 md:text-[22px]"
                id="cta-email"
                onChange={event => setEmail(event.target.value)}
                placeholder={t('landing.cta.email')}
                type="email"
                value={email}
              />
            </div>
            <Button
              className="cut h-16 rounded-none bg-(--l-ink) px-10 text-[17px] text-white [--cut:14px] hover:bg-(--l-ink)/90 active:translate-y-px"
              type="submit"
            >
              {t('landing.cta.go')} <ArrowRight />
            </Button>
          </form>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-(length:--step-body)">
            {(['landing.cta.free', 'landing.cta.noCard'] as const).map(key => (
              <li className="flex items-center gap-2" key={key}>
                <CircleCheck aria-hidden className="size-5" />
                {t(key)}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </motion.section>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_LINKS: { href: string; label: StringKey }[] = [
  { href: '/terms', label: 'landing.footer.terms' },
  { href: '/privacy', label: 'landing.footer.privacy' },
  { href: `mailto:${COMPANY.email}`, label: 'landing.footer.contact' },
];

function Footer() {
  const { t } = useI18n();
  const link = 'underline-offset-4 hover:text-(--l-sky-ink) hover:underline';
  return (
    <footer className="border-t border-(--l-step) py-10">
      <Container className="flex flex-col items-center gap-5 text-center text-[15px] text-(--l-muted)">
        <Logo size={32} />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map(({ href, label }) =>
            href.startsWith('/') ? (
              <Link className={link} key={href} to={href}>
                {t(label)}
              </Link>
            ) : (
              <a className={link} href={href} key={href}>
                {t(label)}
              </a>
            )
          )}
        </nav>
        <p>
          © {new Date().getFullYear()} Caishen. {t('landing.footer.rights')}
        </p>
      </Container>
    </footer>
  );
}
