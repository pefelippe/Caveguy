import type { Language } from './i18n';

/** The strings of the landing page. Prices stay in reais in both languages. */
export const LANDING_STRINGS = {
  'landing.skip': { en: 'Skip to content', pt: 'Pular para o conteúdo' },

  'landing.nav.features': { en: 'Features', pt: 'Funcionalidades' },
  'landing.nav.pricing': { en: 'Pricing', pt: 'Planos' },
  'landing.nav.questions': { en: 'Questions', pt: 'Perguntas' },
  'landing.nav.signIn': { en: 'Sign in', pt: 'Entrar' },
  'landing.nav.signUp': { en: 'Start free', pt: 'Criar conta grátis' },
  'landing.nav.sections': { en: 'Sections', pt: 'Seções' },

  'landing.hero.title1': { en: 'Your money,', pt: 'Suas finanças,' },
  'landing.hero.title2': { en: 'made simple.', pt: 'descomplicadas.' },
  'landing.hero.lead': {
    en: 'The Caishen helps you keep track of your spending, your income and your bills: tell it in a sentence or import your statement, and see how much is left in the month.',
    pt: 'O Caishen ajuda você a controlar seus gastos, suas entradas e suas contas: conte numa frase ou importe o extrato, e veja quanto sobra no mês.',
  },
  'landing.hero.start': { en: 'Start free', pt: 'Começar grátis' },
  'landing.hero.pricing': { en: 'See pricing', pt: 'Ver planos' },

  'landing.show.title': { en: 'Your whole month', pt: 'O seu mês inteiro' },
  'landing.features.statements': { en: 'Statements', pt: 'Extratos' },
  'landing.features.flow': { en: 'Cash flow', pt: 'Fluxo de caixa' },
  'landing.features.recurring': {
    en: 'Recurring bills',
    pt: 'Gastos recorrentes',
  },
  'landing.features.cards': {
    en: 'Cards and statements',
    pt: 'Cartões e faturas',
  },
  'landing.features.debts': { en: 'Get out of debt', pt: 'Sair das dívidas' },
  'landing.features.income': { en: 'Income', pt: 'Entradas' },
  'landing.features.statements.text': {
    en: 'OFX, CSV, Excel or PDF. Each line goes in once, even if you send the file again.',
    pt: 'OFX, CSV, Excel ou PDF. Cada linha entra uma vez só, mesmo que você mande o arquivo de novo.',
  },
  'landing.features.flow.text': {
    en: 'The month or any period: income, spending by category and what is still due.',
    pt: 'O mês ou qualquer período: entradas, gastos por categoria e o que ainda vai vencer.',
  },
  'landing.features.recurring.text': {
    en: 'Rent, subscriptions, taxes and fixed bills, each on its day of the month.',
    pt: 'Aluguel, assinaturas, impostos e contas fixas, cada um no seu dia do mês.',
  },
  'landing.features.cards.text': {
    en: 'Each card with its statements, without counting the same expense twice.',
    pt: 'Cada cartão com suas faturas, sem contar o mesmo gasto duas vezes.',
  },
  'landing.features.debts.text': {
    en: 'Loans and financing with interest and balance, and the month of the last payment.',
    pt: 'Empréstimos e financiamentos com juros e saldo, e o mês da última parcela.',
  },
  'landing.features.income.text': {
    en: 'Salary and other income on their paydays, even in dollars, converted at the PTAX.',
    pt: 'Salário e outras rendas nos seus dias de pagamento, até em dólar, convertidas pela PTAX.',
  },

  'landing.chat.note': { en: 'Note it in a sentence', pt: 'Anote numa frase' },
  'landing.chat.note.text': {
    en: 'It becomes an expense, with its amount, category and day.',
    pt: 'Vira um gasto, com valor, categoria e dia.',
  },
  'landing.chat.note.bubble': {
    en: 'spent 50 at the market',
    pt: 'gastei 50 no mercado',
  },
  'landing.chat.ask': { en: 'Ask anything', pt: 'Pergunte o que quiser' },
  'landing.chat.ask.text': {
    en: 'What is left, what is due, what is missing.',
    pt: 'Quanto sobrou, o que vence, quanto falta.',
  },
  'landing.chat.ask.bubble': { en: 'what is due?', pt: 'o que vence?' },
  'landing.chat.files': { en: 'Send files', pt: 'Mande arquivos' },
  'landing.chat.files.text': {
    en: 'Photo, spreadsheet or PDF, right in the app.',
    pt: 'Foto, planilha ou PDF, direto no app.',
  },
  'landing.chat.confirm': { en: 'You confirm', pt: 'Você confirma' },
  'landing.chat.confirm.text': {
    en: 'Nothing is saved without your yes.',
    pt: 'Nada é salvo sem o seu sim.',
  },
  'landing.chat.phone.label': {
    en: 'Sample conversation with the Caishen on WhatsApp',
    pt: 'Exemplo de conversa com o Caishen no WhatsApp',
  },
  'landing.chat.phone.sample': { en: 'example', pt: 'exemplo' },
  'landing.chat.phone.proposal': {
    en: 'Expense: $50.00 · Groceries · today. Save it?',
    pt: 'Gasto: R$ 50,00 · Mercado · hoje. Posso salvar?',
  },
  'landing.chat.phone.confirm': { en: 'Confirm', pt: 'Confirmar' },
  'landing.chat.phone.cancel': { en: 'Cancel', pt: 'Cancelar' },
  'landing.chat.phone.saved': {
    en: 'Saved. $1,242.50 left this month.',
    pt: 'Salvo. Sobram R$ 1.242,50 no mês.',
  },
  'landing.chat.phone.due': {
    en: 'This week: internet, $99.90 on Thursday, and the card bill, $1,240.00 on Friday.',
    pt: 'Esta semana: internet, R$ 99,90 na quinta, e a fatura do cartão, R$ 1.240,00 na sexta.',
  },

  'landing.name.title': {
    en: 'Named after the god of wealth',
    pt: 'O nome vem do deus da riqueza',
  },
  'landing.name.text': {
    en: 'In Chinese tradition, Caishen brings prosperity to whoever looks after what they have. Ours only reads: it puts your month in order and answers, without touching your money.',
    pt: 'Na tradição chinesa, Caishen traz prosperidade a quem cuida do que tem. O nosso só lê: põe o seu mês em ordem e responde, sem tocar no seu dinheiro.',
  },
  'landing.name.password': {
    en: 'Never asks for your bank password',
    pt: 'Nunca pede a senha do seu banco',
  },
  'landing.name.money': {
    en: 'Never moves money',
    pt: 'Nunca movimenta dinheiro',
  },
  'landing.name.confirm': {
    en: 'Nothing is saved without your yes',
    pt: 'Nada é salvo sem o seu sim',
  },
  'landing.name.delete': {
    en: 'Delete the account and everything in it, whenever you want',
    pt: 'Exclua a conta e tudo o que há nela, quando quiser',
  },
  'landing.name.caption': {
    en: 'Caishen in Dehua porcelain, Ming dynasty, c. 1600–1644. Royal Ontario Museum. Photo: Daderot, CC0, Wikimedia Commons.',
    pt: 'Caishen em porcelana de Dehua, dinastia Ming, c. 1600–1644. Royal Ontario Museum. Foto: Daderot, CC0, Wikimedia Commons.',
  },
  'landing.name.alt': {
    en: 'White porcelain statue of Caishen, seated, in a robe and a tall hat',
    pt: 'Estátua de porcelana branca de Caishen, sentado, de túnica e chapéu alto',
  },

  'landing.pricing.title': { en: 'Simple pricing', pt: 'Preços simples' },
  'landing.pricing.lead': {
    en: 'Start free. Pay only if you want more.',
    pt: 'Comece grátis. Pague só se quiser mais.',
  },
  'landing.pricing.soon': { en: 'Coming soon', pt: 'Em breve' },
  'landing.pricing.forever': { en: 'forever', pt: 'para sempre' },
  'landing.pricing.month': { en: 'a month', pt: 'por mês' },
  'landing.pricing.free': { en: 'Free', pt: 'Gratuito' },
  'landing.pricing.pro': { en: 'Pro', pt: 'Pro' },
  'landing.pricing.business': { en: 'Business', pt: 'Empresas' },
  'landing.pricing.subscribe': { en: 'Get Pro', pt: 'Assinar o Pro' },
  'landing.pricing.free.messages': {
    en: '300 messages to the Caishen a month',
    pt: '300 mensagens ao Caishen por mês',
  },
  'landing.pricing.free.jobs': {
    en: '30 Workflows a month',
    pt: '30 Workflows por mês',
  },
  'landing.pricing.free.import': {
    en: 'Statement import',
    pt: 'Importação de extratos',
  },
  'landing.pricing.free.flow': {
    en: 'Cash flow, spending and cards',
    pt: 'Fluxo de caixa, gastos e cartões',
  },
  'landing.pricing.free.chat': {
    en: 'WhatsApp and Telegram',
    pt: 'WhatsApp e Telegram',
  },
  'landing.pricing.pro.messages': {
    en: '5,000 messages to the Caishen a month',
    pt: '5.000 mensagens ao Caishen por mês',
  },
  'landing.pricing.pro.jobs': {
    en: '500 Workflows a month',
    pt: '500 Workflows por mês',
  },
  'landing.pricing.pro.all': {
    en: 'Everything in Free',
    pt: 'Tudo do Gratuito',
  },
  'landing.check.cancel': { en: 'Cancel anytime', pt: 'Cancele quando quiser' },
  'landing.pricing.business.contracts': {
    en: 'Contracts and recurring revenue',
    pt: 'Contratos e receita recorrente',
  },
  'landing.pricing.business.metrics': {
    en: 'MRR, churn and margin per client',
    pt: 'MRR, churn e margem por cliente',
  },
  'landing.pricing.business.reports': {
    en: "The company's income statement and cash flow",
    pt: 'DRE e fluxo de caixa da empresa',
  },
  'landing.pricing.business.team': {
    en: 'More than one company and one user',
    pt: 'Mais de um CNPJ e de um usuário',
  },

  'landing.questions.title': {
    en: 'Frequently asked questions',
    pt: 'Perguntas frequentes',
  },
  'landing.q.password': {
    en: 'Do I need to give my bank password?',
    pt: 'Preciso dar a senha do meu banco?',
  },
  'landing.q.password.a': {
    en: 'No. You import the statement you download from your own bank. The Caishen only reads the file, never asks for a bank password and never moves money.',
    pt: 'Não. Você importa o extrato que baixa do próprio banco. O Caishen só lê o arquivo, nunca pede senha de banco e nunca movimenta dinheiro.',
  },
  'landing.q.files': {
    en: 'Which files can I import?',
    pt: 'Quais arquivos posso importar?',
  },
  'landing.q.files.a': {
    en: 'OFX, CSV, Excel (.xlsx) and PDF with text. Most banks offer at least one of them. Repeated lines are ignored, so you can send the same file again.',
    pt: 'OFX, CSV, Excel (.xlsx) e PDF com texto. A maioria dos bancos oferece pelo menos um deles. Linhas repetidas são ignoradas, então pode mandar o mesmo arquivo de novo sem medo.',
  },
  'landing.q.chat': {
    en: 'How do WhatsApp and Telegram work?',
    pt: 'Como funciona o WhatsApp e o Telegram?',
  },
  'landing.q.chat.a': {
    en: "On the Integrations page, make a code and send it to the Caishen's number (or open the Telegram link). From then on, just talk. Anything proposed is saved only when you tap Confirm.",
    pt: 'Na página de Integrações, gere um código e mande para o número do Caishen (ou abra o link do Telegram). A partir daí é só conversar. Qualquer lançamento proposto só é salvo quando você toca em Confirmar.',
  },
  'landing.q.cancel': {
    en: 'Can I cancel anytime?',
    pt: 'Posso cancelar quando quiser?',
  },
  'landing.q.cancel.a': {
    en: 'Yes. Pro is monthly, with no commitment. You cancel on the Plan page and stay on Free, with your data.',
    pt: 'Sim. O plano Pro é mensal, sem fidelidade. Você cancela pela página Plano e continua no Gratuito, com seus dados.',
  },
  'landing.q.openFinance': {
    en: 'Is there Open Finance?',
    pt: 'Tem Open Finance?',
  },
  'landing.q.openFinance.a': {
    en: 'Not yet. The automatic bank connection is being tested and comes soon. Until then, importing statements does the same job.',
    pt: 'Ainda não. A conexão automática com os bancos está em testes e chega em breve. Por enquanto, a importação de extratos faz o mesmo papel.',
  },
  'landing.q.business': {
    en: 'Does it work for my company?',
    pt: 'Serve para minha empresa?',
  },
  'landing.q.business.a': {
    en: 'Not yet. The Business plan, with contracts, recurring revenue and an income statement, is being built. Create your free account and we will let you know when it opens.',
    pt: 'Ainda não. O plano Empresas, com contratos, receita recorrente e DRE, está sendo construído. Crie sua conta grátis e avisamos quando abrir.',
  },
  'landing.q.data': { en: 'Is my data safe?', pt: 'Meus dados estão seguros?' },
  'landing.q.data.a': {
    en: 'Your data is yours. You can delete the account and everything in it at any time, on the Profile page. The details are in the Privacy Policy.',
    pt: 'Os dados são seus. Você pode excluir a conta e tudo o que está nela a qualquer momento, pela página Perfil. Os detalhes estão na Política de Privacidade.',
  },

  'landing.pricing.free.text': {
    en: 'Everything you need to put the month in order, with no time limit.',
    pt: 'Tudo para pôr o mês em ordem, sem prazo para acabar.',
  },
  'landing.pricing.pro.text': {
    en: 'For whoever talks to the Caishen every day.',
    pt: 'Para quem conversa com o Caishen todo dia.',
  },
  'landing.pricing.business.text': {
    en: 'For your company, when it opens.',
    pt: 'Para a sua empresa, quando abrir.',
  },

  'landing.cta.title': {
    en: 'Start with your e-mail',
    pt: 'Comece pelo seu e-mail',
  },
  'landing.cta.email': { en: 'you@email.com', pt: 'voce@email.com' },
  'landing.cta.emailLabel': { en: 'Your e-mail', pt: 'Seu e-mail' },
  'landing.cta.go': { en: 'Create account', pt: 'Criar conta' },
  'landing.cta.free': { en: 'The Free plan is forever', pt: 'O plano Gratuito é para sempre' },
  'landing.cta.noCard': { en: 'No credit card', pt: 'Sem cartão de crédito' },

  'landing.footer.rights': { en: 'All rights reserved.', pt: 'Todos os direitos reservados.' },
  'landing.footer.terms': { en: 'Terms of Use', pt: 'Termos de Uso' },
  'landing.footer.privacy': { en: 'Privacy Policy', pt: 'Política de Privacidade' },
  'landing.footer.contact': { en: 'Contact', pt: 'Contato' },
} satisfies Record<string, Record<Language, string>>;
