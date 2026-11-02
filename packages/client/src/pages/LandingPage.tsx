import {
  ArrowRight,
  Bot,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  ChevronDown,
  CreditCard,
  FileBarChart,
  FileUp,
  LayoutDashboard,
  Landmark,
  LineChart,
  ListTodo,
  MessageSquareText,
  NotebookPen,
  Paperclip,
  Repeat,
  Search,
  ShieldCheck,
  TrendingDown,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  AppleLogo,
  GoogleCalendarLogo,
  GoogleTasksLogo,
  ICloudLogo,
  MakeLogo,
  N8nLogo,
  SamsungLogo,
  TelegramLogo,
  WhatsAppLogo,
  ZapierLogo,
} from '@zapbots/ui/blocks/brand-logos';
import { Logo } from '@zapbots/ui/blocks/logo';
import {
  AnthropicLogo,
  GeminiLogo,
  OpenAiLogo,
  OpenRouterLogo,
} from '@zapbots/ui/blocks/provider-logos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@zapbots/ui/components/accordion';
import { Badge } from '@zapbots/ui/components/badge';
import { Button } from '@zapbots/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@zapbots/ui/components/dropdown-menu';
import { cn } from '@zapbots/ui/lib/utils';

import { isLanguage, LANGUAGES, useI18n, type Language, type StringKey } from '../lib/i18n';
import { COMPANY } from '../lib/legal';

/*
 * Simple and functional: what the Caishen does, what it costs and how to start, in Portuguese or
 * English (the switch in the header). Only what exists today; what is coming (Open Finance, the
 * plan for companies) says "Em breve".
 */

const SIGN_UP = '/sign-in?step=sign-up';

/** The page for visitors who are not signed in. "Entrar" leads to /sign-in. */
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
        <Chat />
        <Integrations />
        <Comparison />
        <Pricing />
        <Questions />
        <Close />
      </main>
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------- layout

function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1120px] px-5 md:px-8', className)}>{children}</div>
  );
}

function SectionTitle({ children, id, lead }: { children: ReactNode; id: string; lead?: string }) {
  return (
    <div className="max-w-[640px]">
      <h2
        className="font-display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.05] font-light tracking-[-0.02em]"
        id={id}
      >
        {children}
      </h2>
      {lead && <p className="mt-4 text-(length:--step-body) text-(--l-muted)">{lead}</p>}
    </div>
  );
}

// ---------------------------------------------------------------- header

interface MenuEntry {
  href: string;
  icon: LucideIcon;
  text: StringKey;
  title: StringKey | string;
}

/**
 * The Funcionalidades menu, by area; each entry leads to the section that shows it. Empresas is
 * still coming.
 */
const MENU: { entries: MenuEntry[]; soon?: boolean; title: StringKey }[] = [
  {
    entries: [
      {
        href: '#features',
        icon: LayoutDashboard,
        text: 'landing.menu.home.text',
        title: 'landing.menu.home',
      },
      {
        href: '#chat',
        icon: Bot,
        text: 'landing.menu.agent.text',
        title: 'landing.menu.agent',
      },
    ],
    title: 'landing.menu.overview',
  },
  {
    entries: [
      {
        href: '#features',
        icon: LineChart,
        text: 'landing.menu.flow.text',
        title: 'landing.menu.flow',
      },
      {
        href: '#features',
        icon: FileUp,
        text: 'landing.menu.statements.text',
        title: 'landing.menu.statements',
      },
      {
        href: '#features',
        icon: Repeat,
        text: 'landing.menu.recurring.text',
        title: 'landing.menu.recurring',
      },
      {
        href: '#features',
        icon: CreditCard,
        text: 'landing.menu.cards.text',
        title: 'landing.menu.cards',
      },
      {
        href: '#features',
        icon: TrendingDown,
        text: 'landing.menu.debts.text',
        title: 'landing.menu.debts',
      },
      {
        href: '#features',
        icon: Calculator,
        text: 'landing.menu.calculators.text',
        title: 'landing.menu.calculators',
      },
    ],
    title: 'landing.menu.finance',
  },
  {
    entries: [
      {
        href: '#integrations',
        icon: CalendarDays,
        text: 'landing.menu.calendar.text',
        title: 'landing.menu.calendar',
      },
      {
        href: '#integrations',
        icon: ListTodo,
        text: 'landing.menu.tasks.text',
        title: 'landing.menu.tasks',
      },
      {
        href: '#integrations',
        icon: NotebookPen,
        text: 'landing.menu.notes.text',
        title: 'landing.menu.notes',
      },
    ],
    title: 'landing.menu.organize',
  },
  {
    entries: [
      {
        href: '#chat',
        icon: WhatsAppLogo,
        text: 'landing.menu.whatsapp.text',
        title: 'WhatsApp',
      },
      {
        href: '#chat',
        icon: TelegramLogo,
        text: 'landing.menu.telegram.text',
        title: 'Telegram',
      },
      {
        href: '#integrations',
        icon: Workflow,
        text: 'landing.menu.automation.text',
        title: 'landing.menu.automation',
      },
    ],
    title: 'landing.menu.channels',
  },
  {
    entries: [
      {
        href: '#pricing',
        icon: Building2,
        text: 'landing.menu.contracts.text',
        title: 'landing.menu.contracts',
      },
      {
        href: '#pricing',
        icon: FileBarChart,
        text: 'landing.menu.reports.text',
        title: 'landing.menu.reports',
      },
    ],
    soon: true,
    title: 'landing.menu.business',
  },
];

const isKey = (value: string): value is StringKey => value.includes('.');

function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const link = 'rounded-md px-3.5 py-2 text-[16px] hover:bg-(--l-surface)';

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <header
      className="sticky top-0 z-40 border-b border-(--l-sand) bg-(--l-bg)/95 backdrop-blur"
      onMouseLeave={() => setOpen(false)}
    >
      <Container className="flex h-[76px] max-w-[1680px] items-center gap-2 md:px-12">
        <Link
          aria-label="Caishen"
          className="mr-auto flex items-center gap-2.5 text-[22px] font-medium tracking-[-0.01em] sm:text-[26px]"
          to="/landing"
        >
          <Logo size={32} />
          Caishen
        </Link>
        <nav aria-label={t('landing.nav.sections')} className="hidden items-center gap-1 lg:flex">
          <Button
            aria-controls="features-menu"
            aria-expanded={open}
            className={cn(
              'h-auto gap-1.5 px-3.5 py-2 text-[16px] font-normal hover:bg-(--l-surface)',
              open && 'bg-(--l-surface)'
            )}
            onClick={() => setOpen(value => !value)}
            onMouseEnter={() => setOpen(true)}
            variant="ghost"
          >
            {t('landing.nav.features')}
            <ChevronDown
              aria-hidden
              className={cn('size-4 transition-transform', open && 'rotate-180')}
            />
          </Button>
          <a className={link} href="#integrations" onMouseEnter={() => setOpen(false)}>
            {t('landing.nav.integrations')}
          </a>
          <a className={link} href="#pricing">
            {t('landing.nav.pricing')}
          </a>
          <a className={link} href="#faq">
            {t('landing.nav.questions')}
          </a>
          <Link className={link} to="/sign-in">
            {t('landing.nav.signIn')}
          </Link>
        </nav>
        <LanguageSwitch />
        <Button
          asChild
          className="ml-2 h-11 px-6 text-[16px] font-semibold max-sm:ml-0 max-sm:h-10 max-sm:px-3.5 max-sm:text-[14px]"
        >
          <Link to={SIGN_UP}>{t('landing.nav.signUp')}</Link>
        </Button>
      </Container>
      {open && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-(--l-sand) bg-(--l-bg) shadow-[0_24px_40px_-24px_rgb(0_0_0/0.25)] lg:block"
          id="features-menu"
        >
          <FeaturesMenu onPick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

/** The open Funcionalidades menu: one column per area, each entry an icon, a name and a line. */
function FeaturesMenu({ onPick }: { onPick: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto grid max-w-[1680px] grid-cols-5 gap-6 px-12 py-8">
      {MENU.map(group => (
        <div key={group.title}>
          <p className="flex items-center gap-2 text-[13px] font-medium text-(--l-muted)">
            {t(group.title)}
            {group.soon && (
              <Badge className="px-1.5 py-0 text-[11px]" variant="secondary">
                {t('landing.pricing.soon')}
              </Badge>
            )}
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            {group.entries.map(({ href, icon: Icon, text, title }) => (
              <li key={title}>
                <a
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-2 hover:bg-(--l-surface)',
                    group.soon && 'opacity-60'
                  )}
                  href={href}
                  onClick={onPick}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-(--l-sand) bg-white">
                    <Icon aria-hidden className="size-4 text-(--l-ink)" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-medium text-(--l-ink)">
                      {isKey(title) ? t(title) : title}
                    </span>
                    <span className="block text-[13px] leading-snug text-(--l-muted)">
                      {t(text)}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Small flags drawn here: flag emojis show as letters on Windows. */
function Flag({ language }: { language: Language }) {
  return language === 'pt' ? (
    <svg aria-hidden className="h-3.5 w-5 shrink-0 rounded-[2px]" viewBox="0 0 20 14">
      <rect fill="#009C3B" height="14" width="20" />
      <path d="M10 1.6 18.2 7 10 12.4 1.8 7z" fill="#FFDF00" />
      <circle cx="10" cy="7" fill="#002776" r="3.1" />
    </svg>
  ) : (
    <svg aria-hidden className="h-3.5 w-5 shrink-0 rounded-[2px]" viewBox="0 0 20 14">
      <rect fill="#B22234" height="14" width="20" />
      {[1, 3, 5, 7, 9, 11].map(row => (
        <rect fill="#fff" height="1.08" key={row} width="20" y={row * 1.08} />
      ))}
      <rect fill="#3C3B6E" height="7.54" width="8.6" />
    </svg>
  );
}

/** Português or English, remembered by this browser until signing in. */
function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t('landing.language')}
          className="gap-2 px-2.5 text-[16px]"
          variant="ghost"
        >
          <Flag language={language} />
          {language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('landing.language')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          onValueChange={value => isLanguage(value) && setLanguage(value)}
          value={language}
        >
          {LANGUAGES.map(option => (
            <DropdownMenuRadioItem className="gap-2" key={option.value} value={option.value}>
              <Flag language={option.value} />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------- hero

/** Words in the seal's red, underlined by a stroke drawn by hand. */
function Highlight({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn('relative inline-block', dark ? 'text-(--l-seal-light)' : 'text-(--l-seal)')}
    >
      {children}
      <svg
        aria-hidden
        className="absolute -bottom-[0.12em] left-0 h-[0.18em] w-full"
        preserveAspectRatio="none"
        viewBox="0 0 300 12"
      >
        <path
          d="M2 8 C 60 3, 140 3, 200 6 S 280 9, 298 4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </span>
  );
}

/** The dark section with the fine grid, centered: the close. */
function DarkSection({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      aria-labelledby={title}
      className={cn('bg-(--l-dark) px-5 text-center text-white', className)}
      style={GRID}
    >
      {children}
    </section>
  );
}

function Checks({ dark, items }: { dark?: boolean; items: StringKey[] }) {
  const { t } = useI18n();
  return (
    <ul
      className={cn(
        'mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[15px]',
        dark ? 'text-white/70' : 'text-(--l-muted)'
      )}
    >
      {items.map(item => (
        <li className="flex items-center gap-2" key={item}>
          <Check
            aria-hidden
            className={cn('size-4', dark ? 'text-(--l-seal-light)' : 'text-(--l-seal)')}
          />
          {t(item)}
        </li>
      ))}
    </ul>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="hero-title"
      className="px-5 pt-20 pb-20 text-center md:pt-28 md:pb-28"
      style={LIGHT_GRID}
    >
      <p className="text-[15px] font-medium text-(--l-seal)">{t('landing.hero.kicker')}</p>
      <h1
        className="mx-auto mt-6 font-display text-(length:--step-head) leading-[1.02] font-light tracking-[-0.025em]"
        id="hero-title"
      >
        {t('landing.hero.title')}
        <br />
        <Highlight>{t('landing.hero.highlight')}</Highlight>.
      </h1>
      <p className="mx-auto mt-8 text-(length:--step-lead) text-(--l-muted)">
        {t('landing.hero.lead')}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-14 px-8 text-[16px]">
          <Link to={SIGN_UP}>
            {t('landing.hero.start')} <ArrowRight />
          </Link>
        </Button>
        <Button asChild className="h-14 bg-white px-8 text-[16px]" variant="outline">
          <a href="#pricing">{t('landing.hero.pricing')}</a>
        </Button>
      </div>
      <Checks
        items={['landing.hero.check.pro', 'landing.check.noCard', 'landing.hero.check.noPassword']}
      />
      <Preview />
    </section>
  );
}

const SAMPLE_DUES: { amount: string; day: string; label: StringKey }[] = [
  { amount: 'R$ 1.850,00', day: '05/03', label: 'landing.preview.rent' },
  { amount: 'R$ 2.140,00', day: '10/03', label: 'landing.preview.card' },
  { amount: 'R$ 39,90', day: '12/03', label: 'landing.preview.internet' },
];

const SAMPLE_CATEGORIES: { label: StringKey; share: number }[] = [
  { label: 'landing.preview.housing', share: 0.82 },
  { label: 'landing.preview.groceries', share: 0.46 },
  { label: 'landing.preview.transport', share: 0.28 },
  { label: 'landing.preview.leisure', share: 0.17 },
];

/** The product at a glance: a sample month beside a sample conversation. */
function Preview() {
  const { t } = useI18n();
  return (
    <div className="mx-auto mt-16 grid max-w-[1040px] gap-4 rounded-[32px] border border-(--l-sand) bg-(--l-surface) p-3 text-left shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] md:mt-20 md:p-4 lg:grid-cols-[1.25fr_1fr]">
      <div
        aria-label={t('landing.preview.label')}
        className="flex flex-col gap-6 rounded-[24px] bg-white p-6 md:p-8"
        role="img"
      >
        <div className="flex items-baseline justify-between">
          <p className="text-[15px] text-(--l-muted)">{t('landing.preview.month')}</p>
          <p className="text-[13px] text-(--l-muted)">{t('landing.preview.sample')}</p>
        </div>
        <p className="-mt-4 font-display text-[clamp(2.5rem,1.9rem+2vw,3.25rem)] leading-none font-light tracking-[-0.02em] whitespace-nowrap tabular-nums">
          R$ 1.330,00
        </p>
        <p className="-mt-3 text-[15px] text-(--l-muted) tabular-nums">
          {t('landing.preview.inOut')}
        </p>
        <ul className="flex flex-col gap-3 border-t border-(--l-sand) pt-5">
          {SAMPLE_CATEGORIES.map(category => (
            <li
              className="grid grid-cols-[96px_1fr] items-center gap-3 text-[14px]"
              key={category.label}
            >
              <span className="text-(--l-muted)">{t(category.label)}</span>
              <span className="h-2 rounded-full bg-(--l-surface)">
                <span
                  className="block h-full rounded-full bg-(--l-seal)"
                  style={{ width: `${category.share * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-2.5 border-t border-(--l-sand) pt-5 text-[14px]">
          {SAMPLE_DUES.map(due => (
            <li className="flex items-center gap-3" key={due.label}>
              <span className="w-11 text-(--l-muted) tabular-nums">{due.day}</span>
              <span className="flex-1">{t(due.label)}</span>
              <span className="tabular-nums">{due.amount}</span>
            </li>
          ))}
        </ul>
      </div>
      <ChatMock />
    </div>
  );
}

/** A sample conversation: a Gasto told in a message, proposed back and saved on confirmation. */
function ChatMock() {
  const { t } = useI18n();
  return (
    <div
      aria-label={t('landing.chatMock.label')}
      className="w-full rounded-[24px] bg-(--l-sand)/40 p-4"
      role="img"
    >
      <div className="flex items-center gap-3 border-b border-(--l-sand) px-2 pb-3">
        <Logo size={32} />
        <div>
          <p className="text-[15px] font-medium">Caishen</p>
          <p className="text-[13px] text-(--l-muted)">{t('landing.chatMock.sample')}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-1 pt-4 text-[15px]">
        <Bubble mine>{t('landing.chatMock.spent')}</Bubble>
        <Bubble>
          <p>{t('landing.chatMock.check')}</p>
          <div className="mt-2 rounded-xl bg-(--l-surface) p-3 text-[14px]">
            <p className="font-medium">{t('landing.chatMock.expense')}</p>
            <p className="text-(--l-muted)">{t('landing.chatMock.where')}</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[14px] font-medium">
            <span className="rounded-lg bg-(--l-ink) py-1.5 text-white">
              {t('landing.chatMock.confirm')}
            </span>
            <span className="rounded-lg border border-(--l-sand) py-1.5">
              {t('landing.chatMock.cancel')}
            </span>
          </div>
        </Bubble>
        <Bubble mine>{t('landing.chatMock.ask')}</Bubble>
        <Bubble>{t('landing.chatMock.answer')}</Bubble>
      </div>
    </div>
  );
}

function Bubble({ children, mine }: { children: ReactNode; mine?: boolean }) {
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5',
        mine
          ? 'self-end rounded-br-md bg-(--l-ink) text-white'
          : 'self-start rounded-bl-md bg-white'
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- features

const FEATURES: { icon: LucideIcon; text: StringKey; title: StringKey }[] = [
  {
    icon: FileUp,
    text: 'landing.features.statements.text',
    title: 'landing.features.statements',
  },
  {
    icon: LineChart,
    text: 'landing.features.flow.text',
    title: 'landing.menu.flow',
  },
  {
    icon: Repeat,
    text: 'landing.features.recurring.text',
    title: 'landing.menu.recurring',
  },
  {
    icon: CreditCard,
    text: 'landing.features.cards.text',
    title: 'landing.menu.cards',
  },
  {
    icon: TrendingDown,
    text: 'landing.features.debts.text',
    title: 'landing.menu.debts',
  },
  {
    icon: Calculator,
    text: 'landing.features.calculators.text',
    title: 'landing.menu.calculators',
  },
];

function Features() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="features-title" className="scroll-mt-16 py-16 md:py-24" id="features">
      <Container>
        <SectionTitle id="features-title" lead={t('landing.features.lead')}>
          {t('landing.features.title')}
        </SectionTitle>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, text, title }) => (
            <li className="rounded-[20px] bg-(--l-surface) p-6" key={title}>
              <Icon aria-hidden className="size-6 text-(--l-seal)" />
              <h3 className="mt-4 text-[18px] font-medium">{t(title)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-(--l-muted)">{t(text)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- chat

const CHAT_POINTS: { icon: LucideIcon; text: StringKey; title: StringKey }[] = [
  {
    icon: MessageSquareText,
    text: 'landing.chat.note.text',
    title: 'landing.chat.note',
  },
  { icon: Search, text: 'landing.chat.ask.text', title: 'landing.chat.ask' },
  {
    icon: Paperclip,
    text: 'landing.chat.files.text',
    title: 'landing.chat.files',
  },
  {
    icon: ShieldCheck,
    text: 'landing.chat.confirm.text',
    title: 'landing.chat.confirm',
  },
];

function Chat() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="chat-title"
      className="scroll-mt-16 bg-(--l-surface) py-16 md:py-24"
      id="chat"
    >
      <Container className="text-center">
        <div className="flex justify-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-[#25D366]/12">
            <WhatsAppLogo aria-hidden className="size-6 text-[#25D366]" />
          </span>
        </div>
        <h2
          className="mx-auto mt-6 font-display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.05] font-light tracking-[-0.02em]"
          id="chat-title"
        >
          {t('landing.chat.title')}
        </h2>
        <p className="mx-auto mt-4 text-(length:--step-body) text-(--l-muted)">
          {t('landing.chat.lead')}
        </p>
        <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {CHAT_POINTS.map(({ icon: Icon, text, title }) => (
            <li className="rounded-[20px] bg-white p-6" key={title}>
              <span className="grid size-10 place-items-center rounded-full bg-(--l-surface)">
                <Icon aria-hidden className="size-5 text-(--l-seal)" />
              </span>
              <h3 className="mt-5 text-[17px] font-medium">{t(title)}</h3>
              <p className="mt-1.5 text-[15px] text-(--l-muted)">{t(text)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- integrations

interface IntegrationGroup {
  items: { icon: LucideIcon; name: StringKey | string }[];
  title: StringKey;
}

/** What works on Integrações today, by kind; Open Finance is still coming (ADR 0020). */
const INTEGRATIONS: IntegrationGroup[] = [
  {
    items: [
      { icon: WhatsAppLogo, name: 'WhatsApp' },
      { icon: TelegramLogo, name: 'Telegram' },
    ],
    title: 'landing.integrations.chat',
  },
  {
    items: [
      { icon: GoogleCalendarLogo, name: 'landing.integrations.googleCalendar' },
      { icon: ICloudLogo, name: 'iCloud' },
      { icon: CalendarDays, name: 'Outlook' },
      { icon: GoogleTasksLogo, name: 'landing.integrations.googleTasks' },
    ],
    title: 'landing.integrations.agenda',
  },
  {
    items: [
      { icon: AppleLogo, name: 'Apple Health' },
      { icon: SamsungLogo, name: 'Samsung Health' },
    ],
    title: 'landing.integrations.health',
  },
  {
    items: [
      { icon: ZapierLogo, name: 'Zapier' },
      { icon: MakeLogo, name: 'Make' },
      { icon: N8nLogo, name: 'n8n' },
    ],
    title: 'landing.integrations.automation',
  },
  {
    items: [
      { icon: OpenRouterLogo, name: 'OpenRouter' },
      { icon: AnthropicLogo, name: 'Anthropic' },
      { icon: GeminiLogo, name: 'Gemini' },
      { icon: OpenAiLogo, name: 'OpenAI' },
    ],
    title: 'landing.integrations.ai',
  },
];

const PILL = 'flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2.5 text-[15px]';

function Integrations() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="integrations-title"
      className="scroll-mt-16 py-16 md:py-24"
      id="integrations"
    >
      <Container>
        <SectionTitle id="integrations-title" lead={t('landing.integrations.lead')}>
          {t('landing.integrations.title')}
        </SectionTitle>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map(group => (
            <div key={group.title}>
              <p className="text-[14px] font-medium text-(--l-muted)">{t(group.title)}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map(({ icon: Icon, name }) => (
                  <li className={cn(PILL, 'border border-(--l-sand) bg-white')} key={name}>
                    <Icon aria-hidden className="size-5" />
                    {isKey(name) ? t(name) : name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="flex items-center gap-2 text-[14px] font-medium text-(--l-muted)">
              {t('landing.integrations.banks')}
              <Badge className="px-1.5 py-0 text-[11px]" variant="secondary">
                {t('landing.pricing.soon')}
              </Badge>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 opacity-60">
              <li className={cn(PILL, 'border border-dashed border-(--l-rule)')}>
                <Landmark aria-hidden className="size-5" />
                Open Finance
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- comparison

const POINTS = ['start', 'import', 'due', 'debts', 'phone'] as const;

/** The same five points, side by side: the spreadsheet in grey, the Caishen on the ink. */
function Comparison() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="compare-title" className="py-16 md:py-24">
      <Container>
        <SectionTitle id="compare-title">{t('landing.compare.title')}</SectionTitle>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-(--l-surface) p-8">
            <h3 className="text-[18px] font-medium text-(--l-muted)">
              {t('landing.compare.sheet')}
            </h3>
            <ul className="mt-6 flex flex-col gap-4 text-[16px] text-(--l-muted)">
              {POINTS.map(point => (
                <li className="flex items-center gap-3" key={point}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
                    <X aria-hidden className="size-4 text-(--l-rule)" />
                  </span>
                  {t(`landing.compare.sheet.${point}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-(--l-dark) p-8 text-white">
            <h3 className="flex items-center gap-2 text-[18px] font-medium">
              <Logo className="text-white" size={22} />
              {t('landing.compare.caishen')}
            </h3>
            <ul className="mt-6 flex flex-col gap-4 text-[16px]">
              {POINTS.map(point => (
                <li className="flex items-center gap-3" key={point}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--l-seal)">
                    <Check aria-hidden className="size-4 text-white" />
                  </span>
                  {t(`landing.compare.caishen.${point}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- pricing

interface PlanCard {
  cta?: StringKey;
  features: StringKey[];
  highlight?: boolean;
  name: StringKey | string;
  note: StringKey;
  price: string;
  soon?: boolean;
}

/** The Limits are those of `PLANS` in `services/billing/plans.ts`. */
const PLANS: PlanCard[] = [
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
  },
  {
    cta: 'landing.pricing.subscribe',
    features: [
      'landing.pricing.pro.messages',
      'landing.pricing.pro.jobs',
      'landing.pricing.pro.all',
      'landing.check.cancel',
    ],
    highlight: true,
    name: 'Pro',
    note: 'landing.pricing.month',
    price: 'R$ 19',
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
    soon: true,
  },
];

function Pricing() {
  const { t } = useI18n();
  return (
    <section
      aria-labelledby="pricing-title"
      className="scroll-mt-16 bg-(--l-surface) py-16 md:py-24"
      id="pricing"
    >
      <Container>
        <SectionTitle id="pricing-title" lead={t('landing.pricing.lead')}>
          {t('landing.pricing.title')}
        </SectionTitle>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map(plan => (
            <div
              className={cn(
                'flex flex-col rounded-[20px] bg-white p-7',
                plan.highlight && 'ring-2 ring-(--l-seal)',
                plan.soon && 'opacity-80'
              )}
              key={plan.name}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-medium">
                  {isKey(plan.name) ? t(plan.name) : plan.name}
                </h3>
                {plan.highlight && (
                  <Badge className="bg-(--l-seal) text-white">{t('landing.pricing.popular')}</Badge>
                )}
                {plan.soon && <Badge variant="secondary">{t('landing.pricing.soon')}</Badge>}
              </div>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-[3rem] leading-none font-light tabular-nums">
                  {plan.price}
                </span>
                <span className="text-(--l-muted)">{t(plan.note)}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-[15px]">
                {plan.features.map(feature => (
                  <li className="flex gap-2.5" key={feature}>
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-(--l-seal)" />
                    {t(feature)}
                  </li>
                ))}
              </ul>
              {plan.cta ? (
                <Button
                  asChild
                  className="mt-8 h-11"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  <Link to={SIGN_UP}>{t(plan.cta)}</Link>
                </Button>
              ) : (
                <Button className="mt-8 h-11" disabled variant="outline">
                  {t('landing.pricing.soon')}
                </Button>
              )}
            </div>
          ))}
        </div>
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
    <section aria-labelledby="faq-title" className="scroll-mt-16 py-16 md:py-24" id="faq">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionTitle id="faq-title">{t('landing.questions.title')}</SectionTitle>
        <Accordion collapsible type="single">
          {QUESTIONS.map(item => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-5 text-[17px] font-medium hover:no-underline">
                {t(item.question)}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-(--l-muted)">
                {t(item.answer)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- close

/** The fine grid behind the close, drawn in the paper's tone over the ink. */
const GRID = {
  backgroundImage:
    'linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
};

/** The same grid on the paper, for the hero. */
const LIGHT_GRID = {
  backgroundImage:
    'linear-gradient(to right, rgb(0 0 0 / 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.045) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
};

/** The close: like the hero, the promise underlined in the seal's red. */
function Close() {
  const { t } = useI18n();
  return (
    <DarkSection className="py-24 md:py-36" title="start-title">
      <p className="text-[15px] font-medium text-(--l-seal-light)">{t('landing.close.kicker')}</p>
      <h2
        className="mx-auto mt-6 font-display text-(length:--step-head) leading-[1.02] font-light tracking-[-0.025em]"
        id="start-title"
      >
        {t('landing.close.title')}
        <br />
        {t('landing.close.than')} <Highlight dark>{t('landing.close.highlight')}</Highlight>.
      </h2>
      <p className="mx-auto mt-8 text-(length:--step-lead) text-white/75">
        {t('landing.close.lead')}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-14 bg-white px-8 text-[16px] text-(--l-ink) hover:bg-white/90">
          <Link to={SIGN_UP}>
            {t('landing.nav.signUp')} <ArrowRight />
          </Link>
        </Button>
      </div>
      <Checks
        dark
        items={['landing.close.check.free', 'landing.check.noCard', 'landing.check.cancel']}
      />
    </DarkSection>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_GROUPS: {
  links: { href: string; label: StringKey }[];
  title: StringKey | string;
}[] = [
  {
    links: [
      { href: '#features', label: 'landing.nav.features' },
      { href: '#integrations', label: 'landing.nav.integrations' },
      { href: '#pricing', label: 'landing.nav.pricing' },
      { href: '#faq', label: 'landing.nav.questions' },
    ],
    title: 'landing.footer.product',
  },
  {
    links: [
      { href: '/sign-in', label: 'landing.nav.signIn' },
      { href: SIGN_UP, label: 'landing.footer.signUp' },
    ],
    title: 'Caishen',
  },
  {
    links: [
      { href: '/terms', label: 'landing.footer.terms' },
      { href: '/privacy', label: 'landing.footer.privacy' },
    ],
    title: 'landing.footer.legal',
  },
];

function FooterLink({ href, label }: { href: string; label: StringKey }) {
  const { t } = useI18n();
  const className = 'text-(--l-muted) hover:text-(--l-ink)';
  return href.startsWith('#') ? (
    <a className={className} href={href}>
      {t(label)}
    </a>
  ) : (
    <Link className={className} to={href}>
      {t(label)}
    </Link>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="px-5 pt-16 pb-10 md:px-8">
      <Container className="px-0 md:px-0">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-[380px]">
            <Link className="flex items-center gap-2 text-[20px] font-medium" to="/landing">
              <Logo size={28} />
              Caishen
            </Link>
            <p className="mt-4 text-[15px] leading-relaxed text-(--l-muted)">
              {t('landing.footer.tagline')}
            </p>
          </div>
          <nav
            aria-label={t('landing.footer.label')}
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16"
          >
            {FOOTER_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-[15px] font-medium">
                  {isKey(group.title) ? t(group.title) : group.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3 text-[15px]">
                  {group.links.map(link => (
                    <li key={link.href}>
                      <FooterLink {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-(--l-sand) pt-6 text-[12px] text-(--l-muted) md:flex-row md:items-center md:justify-between">
          <p>
            CNPJ {COMPANY.cnpj} · {t('landing.footer.notice')}
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} Caishen</p>
        </div>
      </Container>
    </footer>
  );
}
