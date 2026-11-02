import {
  ArrowRight,
  Calculator,
  Check,
  CreditCard,
  FileUp,
  LineChart,
  MessageCircle,
  Repeat,
  Send,
  TrendingDown,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Logo } from '@zapbots/ui/blocks/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@zapbots/ui/components/accordion';
import { Badge } from '@zapbots/ui/components/badge';
import { Button } from '@zapbots/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zapbots/ui/components/table';
import { cn } from '@zapbots/ui/lib/utils';

import { COMPANY } from '../lib/legal';

/*
 * Simple and functional: what the Caishen does, what it costs and how to start. Only what exists
 * today; what is coming (Open Finance, the plan for companies) says "Em breve".
 */

const SIGN_UP = '/sign-in?step=sign-up';

/** The page for visitors who are not signed in. "Entrar" leads to /sign-in. */
export function LandingPage() {
  return (
    <div className="landing min-h-svh overflow-x-clip bg-(--l-bg) text-(--l-ink)">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-(--l-ink) focus:px-4 focus:py-2 focus:text-white"
        href="#conteudo"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Features />
        <Chat />
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

const NAV = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#precos', label: 'Preços' },
  { href: '#perguntas', label: 'Perguntas' },
];

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--l-sand) bg-(--l-bg)/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-6">
        <Link aria-label="Caishen" className="flex items-center gap-2 font-medium" to="/landing">
          <Logo size={26} />
          Caishen
        </Link>
        <nav aria-label="Seções" className="hidden flex-1 gap-6 text-[15px] md:flex">
          {NAV.map(item => (
            <a className="text-(--l-muted) hover:text-(--l-ink)" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex" variant="ghost">
            <Link to="/sign-in">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to={SIGN_UP}>Criar conta grátis</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

// ---------------------------------------------------------------- hero

/** Words in the seal's light red, underlined by a stroke drawn by hand. */
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

function Checks({ dark, items }: { dark?: boolean; items: string[] }) {
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
          {item}
        </li>
      ))}
    </ul>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="px-5 pt-20 pb-20 text-center md:pt-28 md:pb-28"
      style={LIGHT_GRID}
    >
      <p className="text-[15px] font-medium text-(--l-seal)">Finanças pessoais com IA</p>
      <h1
        className="mx-auto mt-6 font-display text-(length:--step-head) leading-[1.02] font-light tracking-[-0.025em]"
        id="hero-title"
      >
        Suas finanças organizadas.
        <br />
        <Highlight>Sem planilha</Highlight>.
      </h1>
      <p className="mx-auto mt-8 text-(length:--step-lead) text-(--l-muted)">
        Mande o extrato e veja seu mês inteiro. Tire dúvidas pelo WhatsApp.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-14 px-8 text-[16px]">
          <Link to={SIGN_UP}>
            Começar grátis <ArrowRight />
          </Link>
        </Button>
        <Button asChild className="h-14 bg-white px-8 text-[16px]" variant="outline">
          <a href="#precos">Ver preços</a>
        </Button>
      </div>
      <Checks items={['Pro por R$ 19 por mês', 'Sem cartão de crédito', 'Sem senha de banco']} />
      <Preview />
    </section>
  );
}

const SAMPLE_DUES = [
  { amount: 'R$ 1.850,00', day: '05/03', label: 'Aluguel' },
  { amount: 'R$ 2.140,00', day: '10/03', label: 'Fatura do cartão' },
  { amount: 'R$ 39,90', day: '12/03', label: 'Internet' },
];

const SAMPLE_CATEGORIES = [
  { label: 'Moradia', share: 0.82 },
  { label: 'Mercado', share: 0.46 },
  { label: 'Transporte', share: 0.28 },
  { label: 'Lazer', share: 0.17 },
];

/** The product at a glance: a sample month beside a sample conversation. */
function Preview() {
  return (
    <div className="mx-auto mt-16 grid max-w-[1040px] gap-4 rounded-[32px] border border-(--l-sand) bg-(--l-surface) p-3 text-left shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] md:mt-20 md:p-4 lg:grid-cols-[1.25fr_1fr]">
      <div
        aria-label="Exemplo do resumo do mês"
        className="flex flex-col gap-6 rounded-[24px] bg-white p-6 md:p-8"
        role="img"
      >
        <div className="flex items-baseline justify-between">
          <p className="text-[15px] text-(--l-muted)">Sobra em março</p>
          <p className="text-[13px] text-(--l-muted)">exemplo</p>
        </div>
        <p className="-mt-4 font-display text-[3.25rem] leading-none font-light tracking-[-0.02em] tabular-nums">
          R$ 1.330,00
        </p>
        <p className="-mt-3 text-[15px] text-(--l-muted) tabular-nums">
          Entrou R$ 6.200,00 · Saiu R$ 4.870,00
        </p>
        <ul className="flex flex-col gap-3 border-t border-(--l-sand) pt-5">
          {SAMPLE_CATEGORIES.map(category => (
            <li
              className="grid grid-cols-[96px_1fr] items-center gap-3 text-[14px]"
              key={category.label}
            >
              <span className="text-(--l-muted)">{category.label}</span>
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
              <span className="flex-1">{due.label}</span>
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
  return (
    <div
      aria-label="Exemplo de conversa com o Caishen"
      className="w-full rounded-[24px] bg-(--l-sand)/40 p-4"
      role="img"
    >
      <div className="flex items-center gap-3 border-b border-(--l-sand) px-2 pb-3">
        <Logo size={32} />
        <div>
          <p className="text-[15px] font-medium">Caishen</p>
          <p className="text-[13px] text-(--l-muted)">exemplo de conversa</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-1 pt-4 text-[15px]">
        <Bubble mine>gastei 87,50 no mercado hoje</Bubble>
        <Bubble>
          <p>Anotei assim, confere?</p>
          <div className="mt-2 rounded-xl bg-(--l-surface) p-3 text-[14px]">
            <p className="font-medium">Gasto · R$ 87,50</p>
            <p className="text-(--l-muted)">Mercado · hoje</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[14px] font-medium">
            <span className="rounded-lg bg-(--l-ink) py-1.5 text-white">Confirmar</span>
            <span className="rounded-lg border border-(--l-sand) py-1.5">Cancelar</span>
          </div>
        </Bubble>
        <Bubble mine>quanto sobrou esse mês?</Bubble>
        <Bubble>
          Até agora entraram R$ 6.200,00 e saíram R$ 4.870,00. Sobram R$ 1.330,00, e a fatura do
          cartão vence dia 10.
        </Bubble>
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

const FEATURES: { icon: LucideIcon; text: string; title: string }[] = [
  {
    icon: FileUp,
    text: 'Importe o extrato em OFX, CSV, Excel ou PDF. Cada linha entra uma vez só, mesmo que você mande o arquivo de novo.',
    title: 'Extrato em segundos',
  },
  {
    icon: LineChart,
    text: 'O fluxo de caixa do mês ou de qualquer período: entradas, saídas, gastos por categoria e o que ainda vai vencer.',
    title: 'Fluxo de caixa',
  },
  {
    icon: Repeat,
    text: 'Aluguel, assinaturas, impostos e contas fixas, com o vencimento de cada uma no lugar certo do mês.',
    title: 'Gastos recorrentes',
  },
  {
    icon: CreditCard,
    text: 'Cada cartão com suas faturas e o que é cobrado nele, sem contar o mesmo gasto duas vezes.',
    title: 'Cartões e faturas',
  },
  {
    icon: TrendingDown,
    text: 'Empréstimos e financiamentos com juros, saldo e um plano para quitar tudo, mostrando o mês da última parcela.',
    title: 'Sair das dívidas',
  },
  {
    icon: Calculator,
    text: 'Price ou SAC, e alugar ou financiar, com os números lado a lado antes de assinar qualquer contrato.',
    title: 'Calculadoras',
  },
];

function Features() {
  return (
    <section aria-labelledby="recursos-title" className="scroll-mt-16 py-16 md:py-24" id="recursos">
      <Container>
        <SectionTitle
          id="recursos-title"
          lead="Tudo o que você precisa para saber para onde vai o seu dinheiro, num lugar só."
        >
          O que o Caishen faz
        </SectionTitle>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, text, title }) => (
            <li className="rounded-[20px] bg-(--l-surface) p-6" key={title}>
              <Icon aria-hidden className="size-6 text-(--l-seal)" />
              <h3 className="mt-4 text-[18px] font-medium">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-(--l-muted)">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- chat

const CHAT_POINTS = [
  'Conte um gasto numa frase e ele vira lançamento depois que você confirma.',
  'Pergunte quanto sobrou, o que vence na semana ou quanto custa quitar um empréstimo antes.',
  'No app, mande uma foto, planilha ou PDF na conversa e o Caishen lê para você.',
  'Nada é gravado sem o seu “Confirmar”. O Caishen nunca movimenta dinheiro.',
];

function Chat() {
  return (
    <section aria-labelledby="chat-title" className="bg-(--l-dark) py-16 text-white md:py-24">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="flex gap-2 text-white/70">
            <MessageCircle aria-hidden className="size-6" />
            <Send aria-hidden className="size-6" />
          </div>
          <h2
            className="mt-5 font-display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.05] font-light tracking-[-0.02em]"
            id="chat-title"
          >
            Fale com suas finanças pelo WhatsApp ou Telegram
          </h2>
          <p className="mt-4 max-w-[48ch] text-(length:--step-body) text-white/70">
            O mesmo assistente do app, na conversa que você já usa todo dia. Vincule seu número em
            um minuto, pela página de Integrações.
          </p>
        </div>
        <ul className="flex flex-col gap-4 self-center">
          {CHAT_POINTS.map(point => (
            <li className="flex gap-3 text-(length:--step-body)" key={point}>
              <Check aria-hidden className="mt-1 size-5 shrink-0 text-(--l-seal-light)" />
              {point}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- comparison

const ROWS: { caishen: boolean | string; label: string; sheet: boolean | string }[] = [
  { caishen: 'Minutos', label: 'Tempo para começar', sheet: 'Horas montando' },
  { caishen: true, label: 'Importa o extrato do banco', sheet: 'Copiar e colar' },
  { caishen: true, label: 'Separa o que vence em cada mês', sheet: false },
  { caishen: true, label: 'Plano para quitar as dívidas', sheet: false },
  { caishen: true, label: 'Responde no WhatsApp e no Telegram', sheet: false },
  { caishen: true, label: 'Funciona no celular', sheet: 'Mais ou menos' },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <>{value}</>;
  return value ? (
    <Check aria-label="Sim" className="size-5 text-(--l-seal)" />
  ) : (
    <X aria-label="Não" className="size-5 text-(--l-rule)" />
  );
}

function Comparison() {
  return (
    <section aria-labelledby="comparacao-title" className="py-16 md:py-24">
      <Container>
        <SectionTitle id="comparacao-title">Melhor que a planilha</SectionTitle>
        <div className="mt-10 overflow-hidden rounded-[20px] border border-(--l-sand)">
          <Table className="text-[15px]">
            <TableHeader>
              <TableRow className="bg-(--l-surface) hover:bg-(--l-surface)">
                <TableHead className="h-12 px-5" />
                <TableHead className="h-12 px-5 font-medium text-(--l-ink)">Caishen</TableHead>
                <TableHead className="h-12 px-5 font-medium text-(--l-muted)">Planilha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map(row => (
                <TableRow key={row.label}>
                  <TableCell className="px-5 py-4 whitespace-normal">{row.label}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Cell value={row.caishen} />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-(--l-muted)">
                    <Cell value={row.sheet} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- pricing

interface PlanCard {
  cta?: string;
  features: string[];
  highlight?: boolean;
  name: string;
  note: string;
  price: string;
  soon?: boolean;
}

/** The Limits are those of `PLANS` in `services/billing/plans.ts`. */
const PLANS: PlanCard[] = [
  {
    cta: 'Começar grátis',
    features: [
      '300 mensagens ao Caishen por mês',
      '30 Workflows por mês',
      'Importação de extratos',
      'Fluxo de caixa, gastos e cartões',
      'WhatsApp e Telegram',
    ],
    name: 'Gratuito',
    note: 'para sempre',
    price: 'R$ 0',
  },
  {
    cta: 'Assinar o Pro',
    features: [
      '5.000 mensagens ao Caishen por mês',
      '500 Workflows por mês',
      'Tudo do Gratuito',
      'Cancele quando quiser',
    ],
    highlight: true,
    name: 'Pro',
    note: 'por mês',
    price: 'R$ 19',
  },
  {
    features: [
      'Contratos e receita recorrente',
      'MRR, churn e margem por cliente',
      'DRE e fluxo de caixa da empresa',
      'Mais de um CNPJ e de um usuário',
    ],
    name: 'Empresas',
    note: 'por mês',
    price: 'R$ 49',
    soon: true,
  },
];

function Pricing() {
  return (
    <section
      aria-labelledby="precos-title"
      className="scroll-mt-16 bg-(--l-surface) py-16 md:py-24"
      id="precos"
    >
      <Container>
        <SectionTitle id="precos-title" lead="Comece grátis. Pague só se quiser mais.">
          Preços simples
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
                <h3 className="text-[18px] font-medium">{plan.name}</h3>
                {plan.highlight && (
                  <Badge className="bg-(--l-seal) text-white">Mais escolhido</Badge>
                )}
                {plan.soon && <Badge variant="secondary">Em breve</Badge>}
              </div>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-[3rem] leading-none font-light tabular-nums">
                  {plan.price}
                </span>
                <span className="text-(--l-muted)">{plan.note}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-[15px]">
                {plan.features.map(feature => (
                  <li className="flex gap-2.5" key={feature}>
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-(--l-seal)" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.cta ? (
                <Button
                  asChild
                  className="mt-8 h-11"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  <Link to={SIGN_UP}>{plan.cta}</Link>
                </Button>
              ) : (
                <Button className="mt-8 h-11" disabled variant="outline">
                  Em breve
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

const QUESTIONS: { answer: string; question: string }[] = [
  {
    answer:
      'Não. Você importa o extrato que baixa do próprio banco. O Caishen só lê o arquivo, nunca pede senha de banco e nunca movimenta dinheiro.',
    question: 'Preciso dar a senha do meu banco?',
  },
  {
    answer:
      'OFX, CSV, Excel (.xlsx) e PDF com texto. A maioria dos bancos oferece pelo menos um deles. Linhas repetidas são ignoradas, então pode mandar o mesmo arquivo de novo sem medo.',
    question: 'Quais arquivos posso importar?',
  },
  {
    answer:
      'Na página de Integrações, gere um código e mande para o número do Caishen (ou abra o link do Telegram). A partir daí é só conversar. Qualquer lançamento proposto só é salvo quando você toca em Confirmar.',
    question: 'Como funciona o WhatsApp e o Telegram?',
  },
  {
    answer:
      'Sim. O plano Pro é mensal, sem fidelidade. Você cancela pela página Plano e continua no Gratuito, com seus dados.',
    question: 'Posso cancelar quando quiser?',
  },
  {
    answer:
      'Ainda não. A conexão automática com os bancos está em testes e chega em breve. Por enquanto, a importação de extratos faz o mesmo papel.',
    question: 'Tem Open Finance?',
  },
  {
    answer:
      'Ainda não. O plano Empresas, com contratos, receita recorrente e DRE, está sendo construído. Crie sua conta grátis e avisamos quando abrir.',
    question: 'Serve para minha empresa?',
  },
  {
    answer:
      'Os dados são seus. Você pode excluir a conta e tudo o que está nela a qualquer momento, pela página Perfil. Os detalhes estão na Política de Privacidade.',
    question: 'Meus dados estão seguros?',
  },
];

function Questions() {
  return (
    <section
      aria-labelledby="perguntas-title"
      className="scroll-mt-16 py-16 md:py-24"
      id="perguntas"
    >
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionTitle id="perguntas-title">Perguntas frequentes</SectionTitle>
        <Accordion collapsible type="single">
          {QUESTIONS.map(item => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-5 text-[17px] font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-(--l-muted)">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- close

const PROMISES = ['Plano gratuito para sempre', 'Sem cartão de crédito', 'Cancele quando quiser'];

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
  return (
    <DarkSection className="py-24 md:py-36" title="comece-title">
      <p className="text-[15px] font-medium text-(--l-seal-light)">Comece hoje</p>
      <h2
        className="mx-auto mt-6 font-display text-(length:--step-head) leading-[1.02] font-light tracking-[-0.025em]"
        id="comece-title"
      >
        Seu dinheiro merece mais
        <br />
        que uma <Highlight dark>planilha esquecida</Highlight>.
      </h2>
      <p className="mx-auto mt-8 text-(length:--step-lead) text-white/75">
        Mande o extrato e veja seu mês inteiro. Você só decide.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-14 bg-white px-8 text-[16px] text-(--l-ink) hover:bg-white/90">
          <Link to={SIGN_UP}>
            Criar conta grátis <ArrowRight />
          </Link>
        </Button>
      </div>
      <Checks dark items={PROMISES} />
    </DarkSection>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_GROUPS: { links: { href: string; label: string }[]; title: string }[] = [
  {
    links: [
      { href: '#recursos', label: 'Recursos' },
      { href: '#precos', label: 'Preços' },
      { href: '#perguntas', label: 'Perguntas' },
    ],
    title: 'Produto',
  },
  {
    links: [
      { href: '/sign-in', label: 'Entrar' },
      { href: SIGN_UP, label: 'Criar conta' },
    ],
    title: 'Caishen',
  },
  {
    links: [
      { href: '/terms', label: 'Termos de Uso' },
      { href: '/privacy', label: 'Privacidade' },
    ],
    title: 'Legal',
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = 'text-(--l-muted) hover:text-(--l-ink)';
  return href.startsWith('#') ? (
    <a className={className} href={href}>
      {label}
    </a>
  ) : (
    <Link className={className} to={href}>
      {label}
    </Link>
  );
}

function Footer() {
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
              Finanças organizadas para quem não quer viver de planilha.
            </p>
          </div>
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
            {FOOTER_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-[15px] font-medium">{group.title}</p>
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
        <div className="mt-14 flex flex-col gap-4 border-t border-(--l-sand) pt-6 text-(length:--step-small) text-(--l-muted) md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              {COMPANY.name} · CNPJ {COMPANY.cnpj} · {COMPANY.city}
            </p>
            <p>
              O Caishen não é uma instituição financeira, não oferece crédito nem recomenda
              investimentos, e nunca movimenta dinheiro.
            </p>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} Caishen. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
