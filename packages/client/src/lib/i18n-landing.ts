import type { Language } from './i18n';

/** The strings of the landing page. Prices stay in reais in both languages. */
export const LANDING_STRINGS = {
  'landing.skip': { en: 'Skip to content', pt: 'Pular para o conteúdo' },
  'landing.language': { en: 'Language', pt: 'Idioma' },

  'landing.nav.features': { en: 'Features', pt: 'Funcionalidades' },
  'landing.nav.pricing': { en: 'Pricing', pt: 'Planos' },
  'landing.nav.questions': { en: 'Questions', pt: 'Perguntas' },
  'landing.nav.signIn': { en: 'Sign in', pt: 'Entrar' },
  'landing.nav.signUp': { en: 'Start free', pt: 'Criar conta grátis' },
  'landing.nav.sections': { en: 'Sections', pt: 'Seções' },

  'landing.menu.overview': { en: 'Overview', pt: 'Visão geral' },
  'landing.menu.home': { en: 'Home', pt: 'Página inicial' },
  'landing.menu.home.text': {
    en: 'The month, the calendar and what is due, on one screen',
    pt: 'O mês, a agenda e o que vence, numa tela',
  },
  'landing.menu.agent': { en: 'AI agent', pt: 'Agente com IA' },
  'landing.menu.agent.text': {
    en: 'Ask anything about your money',
    pt: 'Pergunte qualquer coisa sobre o seu dinheiro',
  },
  'landing.menu.finance': { en: 'Finance', pt: 'Finanças' },
  'landing.menu.flow': { en: 'Cash flow', pt: 'Fluxo de caixa' },
  'landing.menu.flow.text': {
    en: 'Income, spending and what is still due',
    pt: 'Entradas, saídas e o que ainda vence',
  },
  'landing.menu.statements': { en: 'Statements', pt: 'Extratos' },
  'landing.menu.statements.text': { en: 'OFX, CSV, Excel and PDF', pt: 'OFX, CSV, Excel e PDF' },
  'landing.menu.recurring': { en: 'Recurring bills', pt: 'Gastos recorrentes' },
  'landing.menu.recurring.text': {
    en: 'Rent, subscriptions and taxes',
    pt: 'Aluguel, assinaturas e impostos',
  },
  'landing.menu.cards': { en: 'Cards and statements', pt: 'Cartões e faturas' },
  'landing.menu.cards.text': {
    en: 'What each card charges, counted once',
    pt: 'O que cada cartão cobra, contado uma vez',
  },
  'landing.menu.debts': { en: 'Get out of debt', pt: 'Sair das dívidas' },
  'landing.menu.debts.text': {
    en: 'A plan and the month of the last payment',
    pt: 'Um plano e o mês da última parcela',
  },
  'landing.menu.calculators': { en: 'Calculators', pt: 'Calculadoras' },
  'landing.menu.calculators.text': {
    en: 'Price, SAC, and rent or finance',
    pt: 'Price, SAC, e alugar ou financiar',
  },
  'landing.menu.organize': { en: 'Organize', pt: 'Organização' },
  'landing.menu.calendar': { en: 'Calendar', pt: 'Agenda' },
  'landing.menu.calendar.text': {
    en: 'Events and booking links',
    pt: 'Eventos e links de agendamento',
  },
  'landing.menu.tasks': { en: 'Tasks', pt: 'Tarefas' },
  'landing.menu.tasks.text': {
    en: 'Lists, due dates and repeats',
    pt: 'Listas, prazos e repetições',
  },
  'landing.menu.notes': { en: 'Notes and goals', pt: 'Notas e metas' },
  'landing.menu.notes.text': {
    en: 'What to remember and where to get to',
    pt: 'O que lembrar e aonde chegar',
  },
  'landing.menu.channels': { en: 'Channels', pt: 'Canais' },
  'landing.menu.whatsapp.text': { en: 'Talk to the Caishen', pt: 'Converse com o Caishen' },
  'landing.menu.telegram.text': { en: 'The same, on Telegram', pt: 'O mesmo, no Telegram' },
  'landing.menu.automation': { en: 'Automation', pt: 'Automação' },
  'landing.menu.automation.text': { en: 'Zapier, Make and n8n', pt: 'Zapier, Make e n8n' },
  'landing.menu.business': { en: 'Business', pt: 'Empresas' },
  'landing.menu.contracts': { en: 'Contracts and MRR', pt: 'Contratos e MRR' },
  'landing.menu.contracts.text': {
    en: 'Recurring revenue per client',
    pt: 'Receita recorrente por cliente',
  },
  'landing.menu.reports': { en: 'Reports', pt: 'Relatórios' },
  'landing.menu.reports.text': { en: 'Income statement and cash flow', pt: 'DRE e fluxo de caixa' },

  'landing.hero.kicker': { en: 'Personal finance with AI', pt: 'Finanças pessoais com IA' },
  'landing.hero.title': { en: 'Your finances in order.', pt: 'Suas finanças organizadas.' },
  'landing.hero.highlight': { en: 'No spreadsheet', pt: 'Sem planilha' },
  'landing.hero.lead': {
    en: 'Send your bank statement and see your whole month. Ask on WhatsApp.',
    pt: 'Mande o extrato e veja seu mês inteiro. Tire dúvidas pelo WhatsApp.',
  },
  'landing.hero.start': { en: 'Start free', pt: 'Começar grátis' },
  'landing.hero.pricing': { en: 'See pricing', pt: 'Ver preços' },
  'landing.hero.check.pro': { en: 'Pro for R$ 19 a month', pt: 'Pro por R$ 19 por mês' },
  'landing.check.noCard': { en: 'No credit card', pt: 'Sem cartão de crédito' },
  'landing.hero.check.noPassword': { en: 'No bank password', pt: 'Sem senha de banco' },

  'landing.preview.month': { en: 'Left in March', pt: 'Sobra em março' },
  'landing.preview.sample': { en: 'example', pt: 'exemplo' },
  'landing.preview.label': { en: 'Example of the month summary', pt: 'Exemplo do resumo do mês' },
  'landing.preview.inOut': {
    en: 'In R$ 6.200,00 · Out R$ 4.870,00',
    pt: 'Entrou R$ 6.200,00 · Saiu R$ 4.870,00',
  },
  'landing.preview.housing': { en: 'Housing', pt: 'Moradia' },
  'landing.preview.groceries': { en: 'Groceries', pt: 'Mercado' },
  'landing.preview.transport': { en: 'Transport', pt: 'Transporte' },
  'landing.preview.leisure': { en: 'Leisure', pt: 'Lazer' },
  'landing.preview.rent': { en: 'Rent', pt: 'Aluguel' },
  'landing.preview.card': { en: 'Card statement', pt: 'Fatura do cartão' },
  'landing.preview.internet': { en: 'Internet', pt: 'Internet' },

  'landing.chatMock.label': {
    en: 'Example of a conversation with the Caishen',
    pt: 'Exemplo de conversa com o Caishen',
  },
  'landing.chatMock.sample': { en: 'sample conversation', pt: 'exemplo de conversa' },
  'landing.chatMock.spent': {
    en: 'spent 87,50 at the supermarket today',
    pt: 'gastei 87,50 no mercado hoje',
  },
  'landing.chatMock.check': { en: 'Noted like this, right?', pt: 'Anotei assim, confere?' },
  'landing.chatMock.expense': { en: 'Expense · R$ 87,50', pt: 'Gasto · R$ 87,50' },
  'landing.chatMock.where': { en: 'Supermarket · today', pt: 'Mercado · hoje' },
  'landing.chatMock.confirm': { en: 'Confirm', pt: 'Confirmar' },
  'landing.chatMock.cancel': { en: 'Cancel', pt: 'Cancelar' },
  'landing.chatMock.ask': { en: 'how much is left this month?', pt: 'quanto sobrou esse mês?' },
  'landing.chatMock.answer': {
    en: 'So far R$ 6.200,00 came in and R$ 4.870,00 went out. R$ 1.330,00 is left, and the card statement is due on the 10th.',
    pt: 'Até agora entraram R$ 6.200,00 e saíram R$ 4.870,00. Sobram R$ 1.330,00, e a fatura do cartão vence dia 10.',
  },

  'landing.features.title': { en: 'What the Caishen does', pt: 'O que o Caishen faz' },
  'landing.features.lead': {
    en: 'Everything you need to know where your money goes, in one place.',
    pt: 'Tudo o que você precisa para saber para onde vai o seu dinheiro, num lugar só.',
  },
  'landing.features.statements': { en: 'Statements in seconds', pt: 'Extrato em segundos' },
  'landing.features.statements.text': {
    en: 'Import your statement as OFX, CSV, Excel or PDF. Each line goes in once, even if you send the file again.',
    pt: 'Importe o extrato em OFX, CSV, Excel ou PDF. Cada linha entra uma vez só, mesmo que você mande o arquivo de novo.',
  },
  'landing.features.flow.text': {
    en: 'The cash flow of the month or any period: income, spending by category and what is still due.',
    pt: 'O fluxo de caixa do mês ou de qualquer período: entradas, saídas, gastos por categoria e o que ainda vai vencer.',
  },
  'landing.features.recurring.text': {
    en: 'Rent, subscriptions, taxes and fixed bills, each due date in the right place of the month.',
    pt: 'Aluguel, assinaturas, impostos e contas fixas, com o vencimento de cada uma no lugar certo do mês.',
  },
  'landing.features.cards.text': {
    en: 'Each card with its statements and what is charged on it, without counting the same expense twice.',
    pt: 'Cada cartão com suas faturas e o que é cobrado nele, sem contar o mesmo gasto duas vezes.',
  },
  'landing.features.debts.text': {
    en: 'Loans and financing with interest, balance and a plan to pay it all off, showing the month of the last payment.',
    pt: 'Empréstimos e financiamentos com juros, saldo e um plano para quitar tudo, mostrando o mês da última parcela.',
  },
  'landing.features.calculators.text': {
    en: 'Price or SAC, and rent or finance, with the numbers side by side before you sign anything.',
    pt: 'Price ou SAC, e alugar ou financiar, com os números lado a lado antes de assinar qualquer contrato.',
  },

  'landing.chat.title': { en: 'Your finances on WhatsApp', pt: 'Suas finanças no WhatsApp' },
  'landing.chat.lead': {
    en: 'The same Caishen as in the app, also on Telegram.',
    pt: 'O mesmo Caishen do app, também no Telegram.',
  },
  'landing.chat.note': { en: 'Note it in a sentence', pt: 'Anote numa frase' },
  'landing.chat.note.text': {
    en: '“spent 50 at the supermarket” becomes an expense.',
    pt: '“gastei 50 no mercado” vira um gasto.',
  },
  'landing.chat.ask': { en: 'Ask anything', pt: 'Pergunte o que quiser' },
  'landing.chat.ask.text': {
    en: 'What is left, what is due, what is missing.',
    pt: 'Quanto sobrou, o que vence, quanto falta.',
  },
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

  'landing.compare.title': { en: 'Better than a spreadsheet', pt: 'Melhor que a planilha' },
  'landing.compare.sheet': { en: 'With a spreadsheet', pt: 'Na planilha' },
  'landing.compare.caishen': { en: 'With the Caishen', pt: 'No Caishen' },
  'landing.compare.sheet.start': { en: 'Hours setting it up', pt: 'Horas montando antes de usar' },
  'landing.compare.sheet.import': {
    en: 'Copying the statement line by line',
    pt: 'Copiar o extrato linha por linha',
  },
  'landing.compare.sheet.due': {
    en: 'You work out what is due',
    pt: 'Você mesmo descobre o que vence',
  },
  'landing.compare.sheet.debts': {
    en: 'No plan for your debts',
    pt: 'Nenhum plano para as dívidas',
  },
  'landing.compare.sheet.phone': { en: 'Awkward on the phone', pt: 'Difícil de usar no celular' },
  'landing.compare.caishen.start': { en: 'Ready in minutes', pt: 'Pronto em minutos' },
  'landing.compare.caishen.import': {
    en: 'Reads the bank statement for you',
    pt: 'Lê o extrato do banco para você',
  },
  'landing.compare.caishen.due': {
    en: 'Shows what is due each month',
    pt: 'Mostra o que vence em cada mês',
  },
  'landing.compare.caishen.debts': {
    en: 'A plan to pay off every debt',
    pt: 'Um plano para quitar cada dívida',
  },
  'landing.compare.caishen.phone': {
    en: 'Answers on WhatsApp, on the phone',
    pt: 'Responde no WhatsApp, no celular',
  },

  'landing.pricing.title': { en: 'Simple pricing', pt: 'Preços simples' },
  'landing.pricing.lead': {
    en: 'Start free. Pay only if you want more.',
    pt: 'Comece grátis. Pague só se quiser mais.',
  },
  'landing.pricing.popular': { en: 'Most chosen', pt: 'Mais escolhido' },
  'landing.pricing.soon': { en: 'Coming soon', pt: 'Em breve' },
  'landing.pricing.forever': { en: 'forever', pt: 'para sempre' },
  'landing.pricing.month': { en: 'a month', pt: 'por mês' },
  'landing.pricing.free': { en: 'Free', pt: 'Gratuito' },
  'landing.pricing.business': { en: 'Business', pt: 'Empresas' },
  'landing.pricing.subscribe': { en: 'Get Pro', pt: 'Assinar o Pro' },
  'landing.pricing.free.messages': {
    en: '300 messages to the Caishen a month',
    pt: '300 mensagens ao Caishen por mês',
  },
  'landing.pricing.free.jobs': { en: '30 Workflows a month', pt: '30 Workflows por mês' },
  'landing.pricing.free.import': { en: 'Statement import', pt: 'Importação de extratos' },
  'landing.pricing.free.flow': {
    en: 'Cash flow, spending and cards',
    pt: 'Fluxo de caixa, gastos e cartões',
  },
  'landing.pricing.free.chat': { en: 'WhatsApp and Telegram', pt: 'WhatsApp e Telegram' },
  'landing.pricing.pro.messages': {
    en: '5,000 messages to the Caishen a month',
    pt: '5.000 mensagens ao Caishen por mês',
  },
  'landing.pricing.pro.jobs': { en: '500 Workflows a month', pt: '500 Workflows por mês' },
  'landing.pricing.pro.all': { en: 'Everything in Free', pt: 'Tudo do Gratuito' },
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

  'landing.questions.title': { en: 'Frequently asked questions', pt: 'Perguntas frequentes' },
  'landing.q.password': {
    en: 'Do I need to give my bank password?',
    pt: 'Preciso dar a senha do meu banco?',
  },
  'landing.q.password.a': {
    en: 'No. You import the statement you download from your own bank. The Caishen only reads the file, never asks for a bank password and never moves money.',
    pt: 'Não. Você importa o extrato que baixa do próprio banco. O Caishen só lê o arquivo, nunca pede senha de banco e nunca movimenta dinheiro.',
  },
  'landing.q.files': { en: 'Which files can I import?', pt: 'Quais arquivos posso importar?' },
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
  'landing.q.cancel': { en: 'Can I cancel anytime?', pt: 'Posso cancelar quando quiser?' },
  'landing.q.cancel.a': {
    en: 'Yes. Pro is monthly, with no commitment. You cancel on the Plan page and stay on Free, with your data.',
    pt: 'Sim. O plano Pro é mensal, sem fidelidade. Você cancela pela página Plano e continua no Gratuito, com seus dados.',
  },
  'landing.q.openFinance': { en: 'Is there Open Finance?', pt: 'Tem Open Finance?' },
  'landing.q.openFinance.a': {
    en: 'Not yet. The automatic bank connection is being tested and comes soon. Until then, importing statements does the same job.',
    pt: 'Ainda não. A conexão automática com os bancos está em testes e chega em breve. Por enquanto, a importação de extratos faz o mesmo papel.',
  },
  'landing.q.business': { en: 'Does it work for my company?', pt: 'Serve para minha empresa?' },
  'landing.q.business.a': {
    en: 'Not yet. The Business plan, with contracts, recurring revenue and an income statement, is being built. Create your free account and we will let you know when it opens.',
    pt: 'Ainda não. O plano Empresas, com contratos, receita recorrente e DRE, está sendo construído. Crie sua conta grátis e avisamos quando abrir.',
  },
  'landing.q.data': { en: 'Is my data safe?', pt: 'Meus dados estão seguros?' },
  'landing.q.data.a': {
    en: 'Your data is yours. You can delete the account and everything in it at any time, on the Profile page. The details are in the Privacy Policy.',
    pt: 'Os dados são seus. Você pode excluir a conta e tudo o que está nela a qualquer momento, pela página Perfil. Os detalhes estão na Política de Privacidade.',
  },

  'landing.close.kicker': { en: 'Start today', pt: 'Comece hoje' },
  'landing.close.title': { en: 'Your money deserves more', pt: 'Seu dinheiro merece mais' },
  'landing.close.than': { en: 'than a', pt: 'que uma' },
  'landing.close.highlight': { en: 'forgotten spreadsheet', pt: 'planilha esquecida' },
  'landing.close.lead': {
    en: 'Send your statement and see your whole month. You just decide.',
    pt: 'Mande o extrato e veja seu mês inteiro. Você só decide.',
  },
  'landing.close.check.free': { en: 'Free plan forever', pt: 'Plano gratuito para sempre' },

  'landing.footer.tagline': {
    en: 'Finances in order, for people who do not want to live in a spreadsheet.',
    pt: 'Finanças organizadas para quem não quer viver de planilha.',
  },
  'landing.footer.product': { en: 'Product', pt: 'Produto' },
  'landing.footer.legal': { en: 'Legal', pt: 'Legal' },
  'landing.footer.signUp': { en: 'Create account', pt: 'Criar conta' },
  'landing.footer.terms': { en: 'Terms of Use', pt: 'Termos de Uso' },
  'landing.footer.privacy': { en: 'Privacy', pt: 'Privacidade' },
  'landing.footer.label': { en: 'Footer', pt: 'Rodapé' },
  'landing.footer.notice': {
    en: 'Not a financial institution. Never moves money.',
    pt: 'Não é instituição financeira. Nunca movimenta dinheiro.',
  },
} satisfies Record<string, Record<Language, string>>;
