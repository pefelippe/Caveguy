import { MASCOT_NAME } from '@zapbots/finance';
import type { Language } from './i18n';

/**
 * The strings of the landing page: Brutus talks like the Hulk ("Brutus anota.") in the titles and
 * balloons; buttons, answers and the fine print (docs/adr/0035). Prices stay in reais.
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
    en: `${MASCOT_NAME} writes down.`,
    pt: `${MASCOT_NAME} anota.`,
  },
  'landing.hero.title2': {
    en: `${MASCOT_NAME} remembers.`,
    pt: `${MASCOT_NAME} lembra.`,
  },
  'landing.hero.lead': {
    en: `Send one message. ${MASCOT_NAME} takes care of your money, your schedule and your training.`,
    pt: `Mande uma mensagem. O ${MASCOT_NAME} cuida do seu dinheiro, da sua agenda e do seu treino.`,
  },
  'landing.hero.start': { en: 'Start free', pt: 'Começar grátis' },
  'landing.hero.plans': { en: 'See plans', pt: 'Ver planos' },

  'landing.agents.title': {
    en: `Pick ${MASCOT_NAME}.`,
    pt: `Escolha ${MASCOT_NAME}.`,
  },
  'landing.agents.lead': {
    en: 'One caveman, three personalities.',
    pt: 'Um homem das cavernas, três personalidades.',
  },
  'landing.agents.how': {
    en: 'In the app or on WhatsApp. Nothing is saved until you tap Confirm.',
    pt: 'No app ou no WhatsApp. Nada é salvo antes de você tocar em Confirmar.',
  },
  'landing.hero.wall': {
    en: 'Hands painted on the rock, Cueva de las Manos, Argentina',
    pt: 'Mãos pintadas na rocha, Cueva de las Manos, Argentina',
  },
  'landing.flows.picture': {
    en: 'Horses painted in ochre and charcoal, replica of Lascaux',
    pt: 'Cavalos pintados com ocre e carvão, réplica de Lascaux',
  },
  'landing.pricing.bone': {
    en: 'The Ishango bone, Upper Paleolithic: someone was already counting in notches.',
    pt: 'Osso de Ishango, Paleolítico Superior: alguém já contava em riscos.',
  },
  'landing.questions.picture': {
    en: 'A giant deer over a row of dots, replica of Lascaux',
    pt: 'Um cervo gigante sobre uma fileira de pontos, réplica de Lascaux',
  },
  'landing.footer.pictures': { en: 'Pictures', pt: 'Fotos' },
  'landing.agents.example': { en: 'Example', pt: 'Exemplo' },
  'landing.agents.type': { en: 'Write a message…', pt: 'Escreva uma mensagem…' },
  'landing.agents.finance': { en: 'Finance', pt: 'Financeiro' },
  'landing.agents.finance.does': {
    en: 'Knows what is left until the end of the month, what falls due this week and when your debts end.',
    pt: 'Sabe quanto sobra até o fim do mês, o que vence na semana e quando suas dívidas acabam.',
  },
  'landing.agents.finance.ask': { en: 'spent 50 at the market', pt: 'gastei 50 no mercado' },
  'landing.agents.finance.say': {
    en: `${MASCOT_NAME} writes down R$ 50,00 at Market, today. Confirm?`,
    pt: `${MASCOT_NAME} anota R$ 50,00 em Mercado, hoje. Confirma?`,
  },
  'landing.agents.personal': { en: 'Personal', pt: 'Pessoal' },
  'landing.agents.personal.does': {
    en: 'Knows what you have tomorrow, what fell behind and where you want to get.',
    pt: 'Sabe o que você tem amanhã, o que ficou para trás e aonde você quer chegar.',
  },
  'landing.agents.personal.ask': { en: 'what do I have tomorrow?', pt: 'o que tenho amanhã?' },
  'landing.agents.personal.say': {
    en: `Tomorrow dentist at 14:00. ${MASCOT_NAME} sees two tasks open.`,
    pt: `Amanhã dentista às 14:00. ${MASCOT_NAME} vê duas tarefas abertas.`,
  },
  'landing.agents.fitness': { en: 'Fitness', pt: 'Fitness' },
  'landing.agents.fitness.does': {
    en: 'Knows which workout is today and which comes next. Your weight and sleep stay away from the AI.',
    pt: 'Sabe qual treino é hoje e qual vem depois. Seu peso e seu sono ficam longe da IA.',
  },
  'landing.agents.fitness.ask': { en: 'which workout today?', pt: 'qual treino hoje?' },
  'landing.agents.fitness.say': {
    en: `Today Workout A: squat 4x10, bench 4x10. ${MASCOT_NAME} trains too.`,
    pt: `Hoje Treino A: agachamento 4x10, supino 4x10. ${MASCOT_NAME} treina junto.`,
  },

  'landing.flows.title': {
    en: 'AI reached the Stone Age.',
    pt: 'A IA chegou na idade da pedra.',
  },
  'landing.flows.lead': {
    en: `Ask once. Every Monday or every 1st, ${MASCOT_NAME} does the work and hands it in ready, without you remembering.`,
    pt: `Peça uma vez. Toda segunda ou todo dia 1, o ${MASCOT_NAME} faz o trabalho e entrega pronto, sem você lembrar.`,
  },
  'landing.flows.weekly.text': {
    en: 'Every Monday: what falls due this week.',
    pt: 'Toda segunda: o que vence na semana.',
  },
  'landing.flows.monthly.text': {
    en: 'Every 1st: last month, by category.',
    pt: 'Todo dia 1: o mês passado, por categoria.',
  },
  'landing.flows.once.text': {
    en: 'Once: a plan to get out of debt.',
    pt: 'Uma vez: um plano para sair das dívidas.',
  },
  'landing.nav.flows': { en: 'Workflows', pt: 'Workflows' },
  'landing.pricing.free.flows': { en: '30 Workflows a month', pt: '30 Workflows por mês' },
  'landing.pricing.pro.flows': { en: '500 Workflows a month', pt: '500 Workflows por mês' },
  'landing.pricing.max.flows': { en: '1,500 Workflows a month', pt: '1.500 Workflows por mês' },

  'landing.pricing.title': {
    en: `${MASCOT_NAME} charges little.`,
    pt: `${MASCOT_NAME} cobra pouco.`,
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
    en: `${MASCOT_NAME} answers.`,
    pt: `${MASCOT_NAME} responde.`,
  },
  'landing.q.voice': {
    en: `Why does ${MASCOT_NAME} talk like that?`,
    pt: `Por que ${MASCOT_NAME} fala assim?`,
  },
  'landing.q.voice.a': {
    en: 'He is a man of few words. Amounts, dates and names always come out exact. And if you are not well, he drops the act and talks plainly.',
    pt: 'Ele é de poucas palavras. Valores, datas e nomes saem sempre exatos. E se você não estiver bem, ele larga o personagem e fala normal.',
  },
  'landing.q.password': { en: 'Bank password needed?', pt: 'Pede senha do banco?' },
  'landing.q.password.a': {
    en: `No. You import the statement you download from your own bank. ${MASCOT_NAME} only reads the file and never moves money.`,
    pt: `Não. Você importa o extrato que baixa do próprio banco. O ${MASCOT_NAME} só lê o arquivo e nunca movimenta dinheiro.`,
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

  'landing.cta.title': {
    en: `${MASCOT_NAME} waits for you.`,
    pt: `${MASCOT_NAME} espera você.`,
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
