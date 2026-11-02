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
  ShieldCheck,
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

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="py-16 md:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1
            className="font-display text-(length:--step-head) leading-[0.98] font-light tracking-[-0.025em]"
            id="hero-title"
          >
            Suas finanças organizadas. Sem planilha.
          </h1>
          <p className="mt-6 max-w-[48ch] text-(length:--step-lead) text-(--l-muted)">
            Mande o extrato do banco e veja o mês inteiro: o que entrou, o que saiu, o que vence e
            quanto falta para quitar suas dívidas. E pergunte o que quiser ao Caishen, no app, no
            WhatsApp ou no Telegram.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-12 px-6 text-[15px]">
              <Link to={SIGN_UP}>
                Começar grátis <ArrowRight />
              </Link>
            </Button>
            <Button asChild className="h-12 px-6 text-[15px]" variant="outline">
              <a href="#precos">Ver preços</a>
            </Button>
          </div>
          <p className="mt-4 text-(length:--step-small) text-(--l-muted)">
            Plano gratuito para sempre. Pro por R$ 19 por mês. Sem cartão para começar.
          </p>
        </div>
        <ChatMock />
      </Container>
    </section>
  );
}

/** A sample conversation: a Gasto told in a message, proposed back and saved on confirmation. */
function ChatMock() {
  return (
    <div
      aria-label="Exemplo de conversa com o Caishen"
      className="mx-auto w-full max-w-[400px] rounded-[28px] border border-(--l-sand) bg-(--l-surface) p-4 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.35)]"
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

function Close() {
  return (
    <section aria-labelledby="comece-title" className="bg-(--l-seal) py-16 text-white md:py-20">
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            className="font-display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.05] font-light tracking-[-0.02em]"
            id="comece-title"
          >
            Comece pelo extrato.
          </h2>
          <p className="mt-3 text-(length:--step-body) text-white/85">
            Crie a conta grátis e veja o seu mês organizado em poucos minutos.
          </p>
        </div>
        <Button asChild className="h-12 bg-white px-6 text-[15px] text-(--l-ink) hover:bg-white/90">
          <Link to={SIGN_UP}>
            Criar conta grátis <ArrowRight />
          </Link>
        </Button>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------- footer

const FOOTER_LINKS = [
  { href: '/sign-in', label: 'Entrar' },
  { href: SIGN_UP, label: 'Criar conta' },
  { href: '/terms', label: 'Termos' },
  { href: '/privacy', label: 'Privacidade' },
];

function Footer() {
  return (
    <footer className="py-10 text-(length:--step-small)">
      <Container>
        <p className="flex max-w-[70ch] gap-2 text-(--l-muted)">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
          O Caishen não é uma instituição financeira, não oferece crédito nem recomenda
          investimentos, e nunca movimenta dinheiro. Os cálculos partem dos dados que você informa;
          confira sempre os valores com a sua instituição.
        </p>
        <div className="mt-8 flex flex-col gap-3 border-t border-(--l-sand) pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-(--l-muted)">
            © {new Date().getFullYear()} {COMPANY.name}, CNPJ {COMPANY.cnpj}
          </p>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-1">
            {FOOTER_LINKS.map(link => (
              <Link className="underline-offset-4 hover:underline" key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
