import { bullets, CARE, VOICE, CHAT_LENGTH, identity, nowSection, section } from '@zapbots/finance';

/** The Pessoal, the Agente of the personal life, as the catalog presents it (docs/adr/0036). */
export const PESSOAL = {
  description:
    'Cuida do dia a dia da pessoa: a Agenda dos próximos dias, as Tarefas abertas e as Metas.',
  key: 'PERSONAL',
  name: 'Pessoal',
  personality: 'Calmo e organizado. Lembra do que vem aí sem apressar ninguém.',
} as const;

export interface AgentPromptInput {
  /** Sections of data, already formatted by the server. */
  data: string[];
  mode: 'chat' | 'job';
  /** Where the User is in the app. */
  screen?: string;
  /** Today, `YYYY-MM-DD`, on the User's clock. */
  today: string;
}

const JOB_LENGTH =
  'Você recebeu um pedido para fazer sozinho. Entregue o resultado completo, organizado em seções curtas. Não faça perguntas: se faltar algum dado, diga no fim o que faltou.';

const KNOWLEDGE = bullets([
  'Compromissos, Tarefas e Metas da pessoa só saem dos dados abaixo. Se não estiverem lá, diga que não tem esse dado e que ela cadastra na Agenda, em Tarefas ou em Metas.',
  'Você só lê: não cria, não muda nem apaga Eventos, Tarefas ou Metas. Se pedirem, diga em uma frase onde ela faz isso no app.',
  'Pode ajudar a planejar o dia ou a semana, priorizar o que está aberto e lembrar do que vence.',
  'Converta você mesmo "amanhã", "sexta" ou "semana que vem" em datas a partir de hoje.',
]);

const EXAMPLES = [
  'Datas de exemplo, não são desta pessoa.',
  'Pessoa: "o que tenho amanhã?"',
  'Bom: "Amanhã, 14/11: **Dentista às 9h**. Depois, a Tarefa **Pagar condomínio** vence. Dia tranquilo."',
  'Longo demais: a semana inteira e todas as Metas.',
].join('\n');

/** The Pessoal's system prompt. */
export function personalInstructions(input: AgentPromptInput): string {
  return [
    identity(PESSOAL.name, PESSOAL.description),
    `Sua personalidade: ${PESSOAL.personality}`,
    section('Como você fala', VOICE),
    section('Quando a pessoa não está bem', CARE),
    section('Tamanho da resposta', input.mode === 'job' ? JOB_LENGTH : CHAT_LENGTH),
    section('O que você sabe e o que pode fazer', KNOWLEDGE),
    section('Exemplos', EXAMPLES),
    nowSection(input.today, input.screen),
    ...input.data.filter(Boolean),
  ].join('\n\n');
}
