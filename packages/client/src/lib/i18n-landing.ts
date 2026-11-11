import { APP_NAME } from '@zapbots/finance';
import type { Language } from './i18n';

/**
 * The strings of the landing page: the caveman's short talk ("Caveguy anota.") only in the titles;
 * the sample replies, buttons, answers and the fine print in plain words, as the app talks
 * (docs/adr/0039). Prices stay in reais.
 */
export const LANDING_STRINGS = {
  'landing.skip': { en: 'Skip to content', pt: 'Pular para o conteúdo' },

  'landing.nav.agents': { en: 'Agents', pt: 'Agentes' },
  'landing.nav.pricing': { en: 'Pricing', pt: 'Planos' },
  'landing.nav.questions': { en: 'Questions', pt: 'Perguntas' },
  'landing.nav.signIn': { en: 'Sign in', pt: 'Entrar' },
  'landing.nav.signUp': { en: 'Start free', pt: 'Começar grátis' },
  'landing.nav.sections': { en: 'Sections', pt: 'Seções' },

  'landing.hero.title1': {
    en: `${APP_NAME} writes down.`,
    pt: `${APP_NAME} anota.`,
  },
  'landing.hero.title2': {
    en: `${APP_NAME} remembers.`,
    pt: `${APP_NAME} lembra.`,
  },
  'landing.hero.lead': {
    en: `Send one message. ${APP_NAME} takes care of your money, your schedule and your training.`,
    pt: `Mande uma mensagem. O ${APP_NAME} cuida do seu dinheiro, da sua agenda e do seu treino.`,
  },
  'landing.hero.start': { en: 'Start free', pt: 'Começar grátis' },
  'landing.hero.plans': { en: 'See plans', pt: 'Ver planos' },

  'landing.nav.how': { en: 'How it works', pt: 'Como funciona' },
  'landing.nav.trust': { en: 'Security', pt: 'Segurança' },

  'landing.agents.title': {
    en: `One ${APP_NAME}, three Agents.`,
    pt: `Um ${APP_NAME}, três Agentes.`,
  },
  'landing.agents.try': { en: 'Type a spend', pt: 'Digite um gasto' },
  'landing.agents.tryHint': {
    en: 'An example on this page: nothing is sent or saved.',
    pt: 'Um exemplo nesta página: nada é enviado nem salvo.',
  },
  'landing.agents.trySample': { en: 'spent 32 at the market', pt: 'gastei 32 no mercado' },
  'landing.agents.tryReply': {
    en: '{amount} at {place}, today. Shall I save it?',
    pt: '{amount} em {place}, hoje. Posso salvar?',
  },
  'landing.agents.tryReplyNoPlace': {
    en: '{amount}, today. Where did it go?',
    pt: '{amount}, hoje. Foi em quê?',
  },
  'landing.agents.tryMissing': {
    en: 'I could not find the amount. Try “spent 32 at the market”.',
    pt: 'Não achei o valor. Tente “gastei 32 no mercado”.',
  },
  'landing.agents.send': { en: 'Send', pt: 'Enviar' },
  'landing.ui.ledger1': { en: 'Market', pt: 'Mercado' },
  'landing.ui.ledger1.when': { en: 'Today · Market', pt: 'Hoje · Mercado' },
  'landing.ui.ledger2': { en: 'Pharmacy', pt: 'Farmácia' },
  'landing.ui.ledger2.when': { en: 'Yesterday · Pharmacy', pt: 'Ontem · Farmácia' },
  'landing.ui.ledger3': { en: 'Bakery', pt: 'Padaria' },
  'landing.ui.ledger3.when': { en: 'Yesterday · Bakery', pt: 'Ontem · Padaria' },
  'landing.how.waAsk': { en: 'how much is left this month?', pt: 'quanto sobra este mês?' },
  'landing.how.waSay': {
    en: 'R$ 1.240,00 is left until the 30th.',
    pt: 'Sobram R$ 1.240,00 até o dia 30.',
  },
  'landing.ui.transactions': { en: 'Transactions', pt: 'Transações' },
  'landing.ui.expense': { en: 'Expense', pt: 'Gasto' },
  'landing.ui.amount': { en: 'Amount', pt: 'Valor' },
  'landing.ui.place': { en: 'Category', pt: 'Categoria' },
  'landing.ui.day': { en: 'Day', pt: 'Dia' },
  'landing.ui.today': { en: 'today', pt: 'hoje' },
  'landing.ui.confirm': { en: 'Confirm', pt: 'Confirmar' },
  'landing.ui.cancel': { en: 'Cancel', pt: 'Cancelar' },
  'landing.ui.tomorrow': { en: 'Tomorrow', pt: 'Amanhã' },
  'landing.ui.dentist': { en: 'Dentist', pt: 'Dentista' },
  'landing.ui.tasks': { en: 'Open tasks', pt: 'Tarefas abertas' },
  'landing.ui.condo': { en: 'Pay the condo fee', pt: 'Pagar condomínio' },
  'landing.ui.condoDue': { en: 'due 15/11', pt: 'vence 15/11' },
  'landing.ui.bread': { en: 'Buy bread', pt: 'Comprar pão' },
  'landing.ui.workout': { en: 'Workout A · today', pt: 'Treino A · hoje' },
  'landing.ui.squat': { en: 'Squat', pt: 'Agachamento' },
  'landing.ui.bench': { en: 'Bench press', pt: 'Supino' },
  'landing.ui.row': { en: 'Row', pt: 'Remada' },
  'landing.ui.next': { en: 'Next: Workout B, Friday', pt: 'Próximo: Treino B, sexta' },

  'landing.how.title': { en: 'One message is enough.', pt: 'Uma mensagem basta.' },
  'landing.how.lead': {
    en: `Write in the app or on WhatsApp, the way you talk. ${APP_NAME} shows what it understood and only saves when you confirm.`,
    pt: `Escreva no app ou no WhatsApp, do jeito que você fala. O ${APP_NAME} mostra o que entendeu e só salva quando você confirma.`,
  },
  'landing.how.you': { en: 'You write', pt: 'Você escreve' },
  'landing.how.you.1': { en: '“spent 32 at the market”', pt: '“gastei 32 no mercado”' },
  'landing.how.it': { en: `${APP_NAME} understands`, pt: `O ${APP_NAME} entende` },
  'landing.how.it.1': {
    en: 'Reads the amount, the place and the day',
    pt: 'Lê o valor, o lugar e o dia',
  },
  'landing.how.it.2': {
    en: 'Shows R$ 32,00 at Market, today',
    pt: 'Mostra R$ 32,00 em Mercado, hoje',
  },
  'landing.how.decide': { en: 'You decide', pt: 'Você decide' },
  'landing.how.decide.1': {
    en: 'Tap Confirm, or fix it first',
    pt: 'Toca em Confirmar, ou corrige antes',
  },
  'landing.how.total': { en: 'Saved in Transactions', pt: 'Salvo em Transações' },
  'landing.how.totalTime': { en: 'under a minute', pt: 'menos de 1 minuto' },
  'landing.how.whatsapp': { en: 'The same on WhatsApp', pt: 'O mesmo no WhatsApp' },
  'landing.agents.how': {
    en: 'In the app or on WhatsApp. Nothing is saved until you tap Confirm.',
    pt: 'No app ou no WhatsApp. Nada é salvo antes de você tocar em Confirmar.',
  },
  'landing.agents.example': { en: 'Example', pt: 'Exemplo' },
  'landing.agents.finance': { en: 'Finance', pt: 'Financeiro' },
  'landing.agents.finance.does': {
    en: 'Knows what is left until the end of the month, what falls due this week and when your debts end.',
    pt: 'Sabe quanto sobra até o fim do mês, o que vence na semana e quando suas dívidas acabam.',
  },
  'landing.agents.personal': { en: 'Personal', pt: 'Pessoal' },
  'landing.agents.personal.does': {
    en: 'Knows what you have tomorrow, what fell behind and where you want to get.',
    pt: 'Sabe o que você tem amanhã, o que ficou para trás e aonde você quer chegar.',
  },
  'landing.agents.fitness': { en: 'Fitness', pt: 'Fitness' },
  'landing.agents.fitness.does': {
    en: 'Knows which workout is today and which comes next. Your weight and sleep stay away from the AI.',
    pt: 'Sabe qual treino é hoje e qual vem depois. Seu peso e seu sono ficam longe da IA.',
  },

  'landing.trust.title1': { en: 'Safe', pt: 'Seguro' },
  'landing.trust.title2': { en: 'by default.', pt: 'por padrão.' },
  'landing.trust.what': { en: 'What', pt: 'O quê' },
  'landing.trust.how': { en: 'How', pt: 'Como' },
  'landing.trust.where': { en: 'Where', pt: 'Onde' },
  'landing.trust.read.w': { en: 'Every Agent', pt: 'Todos os Agentes' },
  'landing.trust.confirm.w': { en: 'App and WhatsApp', pt: 'App e WhatsApp' },
  'landing.trust.keys.w': { en: 'Integrations', pt: 'Integrações' },
  'landing.trust.twoFactor.w': { en: 'Profile', pt: 'Perfil' },
  'landing.trust.health.w': { en: 'Fitness', pt: 'Fitness' },
  'landing.trust.lgpd.w': { en: 'Profile', pt: 'Perfil' },
  'landing.ui.aiKeys': { en: 'AI models', pt: 'Modelos de IA' },
  'landing.ui.sealed': { en: 'Saved encrypted', pt: 'Guardada cifrada' },
  'landing.trust.lead': {
    en: 'Your money and your routine are serious. This is how we look after them.',
    pt: 'Seu dinheiro e sua rotina são assunto sério. É assim que cuidamos deles.',
  },
  'landing.trust.read': { en: 'It never moves money', pt: 'Nunca mexe no seu dinheiro' },
  'landing.trust.read.a': {
    en: 'The Agents read what you give them to answer. No payments, no transfers, nothing done outside the app.',
    pt: 'Os Agentes leem o que você dá a eles para responder. Nada de pagamentos, transferências ou ações fora do app.',
  },
  'landing.trust.confirm': { en: 'You confirm everything', pt: 'Você confirma tudo' },
  'landing.trust.confirm.a': {
    en: 'A new expense, a correction or a deletion is only saved when you tap Confirm.',
    pt: 'Um gasto novo, uma correção ou uma exclusão só é salvo quando você toca em Confirmar.',
  },
  'landing.trust.keys': { en: 'Secrets locked away', pt: 'Segredos trancados' },
  'landing.trust.keys.a': {
    en: 'Keys you paste in are stored encrypted with AES-256-GCM, and only their last four characters are ever shown.',
    pt: 'As chaves que você cola ficam guardadas cifradas com AES-256-GCM, e só os quatro últimos caracteres aparecem.',
  },
  'landing.trust.twoFactor': { en: 'Two-step verification', pt: 'Verificação em duas etapas' },
  'landing.trust.twoFactor.a': {
    en: 'Turn it on in your Profile: after the password, a code from your authenticator app.',
    pt: 'Ative no Perfil: depois da senha, um código do seu app autenticador.',
  },
  'landing.trust.health': { en: 'Health stays out of the AI', pt: 'Saúde fica longe da IA' },
  'landing.trust.health.a': {
    en: 'Weight, sleep and measurements never go to an AI model.',
    pt: 'Peso, sono e medidas nunca vão para um modelo de IA.',
  },
  'landing.trust.lgpd': { en: 'Your data is yours', pt: 'Seus dados são seus' },
  'landing.trust.lgpd.a': {
    en: "Under Brazil's LGPD: delete your account on the Profile page and everything in it goes too.",
    pt: 'Pela LGPD: exclua a conta na página Perfil e tudo o que está nela vai junto.',
  },
  'landing.pricing.free.flows': { en: '30 Workflows a month', pt: '30 Workflows por mês' },
  'landing.pricing.pro.flows': { en: '500 Workflows a month', pt: '500 Workflows por mês' },
  'landing.pricing.max.flows': { en: '1,500 Workflows a month', pt: '1.500 Workflows por mês' },

  'landing.pricing.title': {
    en: `${APP_NAME} charges little.`,
    pt: `${APP_NAME} cobra pouco.`,
  },
  'landing.pricing.free': { en: 'Free', pt: 'Gratuito' },
  'landing.pricing.pro': { en: 'Pro', pt: 'Pro' },
  'landing.pricing.max': { en: 'Max', pt: 'Max' },
  'landing.pricing.forever': { en: 'forever', pt: 'para sempre' },
  'landing.pricing.month': { en: 'a month', pt: 'por mês' },
  'landing.pricing.free.messages': { en: '300 messages a month', pt: '300 mensagens por mês' },
  'landing.pricing.free.agents': {
    en: 'Every Agent',
    pt: 'Todos os Agentes',
  },
  'landing.pricing.free.import': { en: 'Statement import', pt: 'Importação de extratos' },
  'landing.pricing.free.chat': { en: 'WhatsApp', pt: 'WhatsApp' },
  'landing.pricing.pro.messages': { en: '5,000 messages a month', pt: '5.000 mensagens por mês' },
  'landing.pricing.pro.cancel': { en: 'Cancel anytime', pt: 'Cancele quando quiser' },
  'landing.pricing.subscribe': { en: 'Start with Pro', pt: 'Começar com o Pro' },
  'landing.pricing.subscribeMax': { en: 'Start with Max', pt: 'Começar com o Max' },
  'landing.pricing.max.messages': { en: '15,000 messages a month', pt: '15.000 mensagens por mês' },
  'landing.pricing.max.custom': {
    en: 'Make up to ten Agents of your own',
    pt: 'Crie até dez Agentes seus',
  },

  'landing.questions.title': {
    en: `${APP_NAME} answers.`,
    pt: `${APP_NAME} responde.`,
  },
  'landing.q.voice': {
    en: 'Why a caveman?',
    pt: 'Por que um homem das cavernas?',
  },
  'landing.q.voice.a': {
    en: 'Because looking after money, a schedule and training should be simple. The drawing is only the face: the answers are plain, with amounts, dates and names always exact.',
    pt: 'Porque cuidar de dinheiro, agenda e treino deveria ser simples. O desenho é só o rosto: as respostas são diretas, com valores, datas e nomes sempre exatos.',
  },
  'landing.q.password': { en: 'Bank password needed?', pt: 'Pede senha do banco?' },
  'landing.q.password.a': {
    en: `No. You import the statement you download from your own bank. ${APP_NAME} only reads the file and never moves money.`,
    pt: `Não. Você importa o extrato que baixa do próprio banco. O ${APP_NAME} só lê o arquivo e nunca movimenta dinheiro.`,
  },
  'landing.q.health': {
    en: 'Does the AI see my health data?',
    pt: 'A IA vê meus dados de saúde?',
  },
  'landing.q.health.a': {
    en: 'No. The Fitness Agent only knows your workout plans. Weight, sleep and measurements never go to the AI.',
    pt: 'Não. O Fitness só conhece suas Fichas de treino. Peso, sono e medidas nunca vão para a IA.',
  },
  'landing.q.chat': { en: 'How do I use WhatsApp?', pt: 'Como uso o WhatsApp?' },
  'landing.q.chat.a': {
    en: 'On the Integrations page, make a code and send it to our number. From then on, just talk to Finance.',
    pt: 'Na página de Integrações, gere um código e mande para o nosso número. A partir daí é só falar com o Financeiro.',
  },
  'landing.q.cancel': { en: 'Can I cancel anytime?', pt: 'Posso cancelar quando quiser?' },
  'landing.q.cancel.a': {
    en: 'Yes. Pro is monthly, with no commitment. You cancel on the Plan page and stay on Free, with your data.',
    pt: 'Sim. O Pro é mensal, sem fidelidade. Você cancela pela página Plano e continua no Gratuito, com seus dados.',
  },
  'landing.q.data': { en: 'Is my data mine?', pt: 'Meus dados são meus?' },
  'landing.q.data.a': {
    en: 'Yes. You can delete the account and everything in it at any time, on the Profile page. The details are in the Privacy Policy.',
    pt: 'Sim. Você pode excluir a conta e tudo o que está nela a qualquer momento, pela página Perfil. Os detalhes estão na Política de Privacidade.',
  },

  'landing.q.phone': { en: 'Does it work on my phone?', pt: 'Funciona no celular?' },
  'landing.q.phone.a': {
    en: 'Yes. The app opens in the phone’s browser, and Finance also answers on WhatsApp.',
    pt: 'Sim. O app abre no navegador do celular, e o Financeiro também responde no WhatsApp.',
  },
  'landing.q.banks': { en: 'Which banks?', pt: 'Quais bancos?' },
  'landing.q.banks.a': {
    en: 'Any of them: you import the statement as OFX, CSV, a spreadsheet or a PDF with text, and importing it again adds nothing twice.',
    pt: 'Qualquer um: você importa o extrato em OFX, CSV, planilha ou PDF com texto, e importar de novo não duplica nada.',
  },

  'landing.cta.lead': {
    en: 'Your e-mail and a password. Free has no credit card and no end date.',
    pt: 'Seu e-mail e uma senha. O Gratuito não pede cartão nem tem prazo.',
  },
  'landing.cta.dialog': { en: 'Create account', pt: 'Criar conta' },
  'landing.cta.title': {
    en: `${APP_NAME} waits for you.`,
    pt: `${APP_NAME} espera você.`,
  },
  'landing.cta.email': { en: 'you@email.com', pt: 'voce@email.com' },
  'landing.cta.emailLabel': { en: 'Your e-mail', pt: 'Seu e-mail' },
  'landing.cta.go': { en: 'Create account', pt: 'Criar conta' },
  'landing.cta.free': {
    en: 'Free forever, no credit card',
    pt: 'Gratuito para sempre, sem cartão',
  },

  'landing.footer.rights': { en: 'All rights reserved.', pt: 'Todos os direitos reservados.' },
  'landing.footer.terms': { en: 'Terms of Use', pt: 'Termos de Uso' },
  'landing.footer.privacy': { en: 'Privacy Policy', pt: 'Política de Privacidade' },
  'landing.footer.contact': { en: 'Contact', pt: 'Contato' },
} satisfies Record<string, Record<Language, string>>;
