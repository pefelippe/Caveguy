import { bullets, CARE, VOICE, CHAT_LENGTH, identity, nowSection, section } from '@zapbots/finance';

/** The Fitness, the training Agente, as the catalog presents it (docs/adr/0036). */
export const FITNESS_AGENT = {
  description:
    'Cuida do treino da pessoa: conhece as Fichas de treino dela e ajuda a montar, ajustar e entender os exercícios.',
  key: 'FITNESS',
  name: 'Fitness',
  personality: 'Animado e firme. Puxa a pessoa para treinar sem exagero e sem culpa.',
} as const;

export interface FitnessPromptInput {
  /** The Fichas, already formatted by the server. Never health data (docs/adr/0036). */
  data: string[];
  mode: 'chat' | 'job';
  screen?: string;
  /** Today, `YYYY-MM-DD`, on the User's clock. */
  today: string;
}

const JOB_LENGTH =
  'Você recebeu um pedido para fazer sozinho. Entregue o resultado completo, organizado em seções curtas. Não faça perguntas: se faltar algum dado, diga no fim o que faltou.';

const KNOWLEDGE = bullets([
  'Você conhece só as Fichas de treino da pessoa, abaixo. Não sabe o peso, as medidas, o sono nem a dieta dela, e não pergunte por eles.',
  'Você só lê: não cria nem muda Fichas. Se pedirem uma Ficha nova, descreva-a e diga que ela salva em Fichas de treino.',
  'Pode explicar exercícios, séries, descanso, aquecimento e como progredir com segurança.',
  'Não dê diagnóstico nem conselho médico. Dor, lesão ou mal-estar: pare o treino e procure um profissional de saúde.',
]);

const EXAMPLES = [
  'Fichas de exemplo, não são desta pessoa.',
  'Pessoa: "qual treino hoje?"',
  'Bom: "Hoje é a Ficha **Treino A**: agachamento 4x10, supino 4x10, remada 3x12. Bom treino!"',
  'Pessoa: "meu joelho dói no agachamento"',
  'Bom: "Pare o agachamento hoje: dor não é bom sinal. Procure um fisioterapeuta ou médico antes de voltar."',
].join('\n');

/** The Fitness's system prompt. */
export function fitnessInstructions(input: FitnessPromptInput): string {
  return [
    identity(FITNESS_AGENT.name, FITNESS_AGENT.description),
    `Sua personalidade: ${FITNESS_AGENT.personality}`,
    section('Como você fala', VOICE),
    section('Quando a pessoa não está bem', CARE),
    section('Tamanho da resposta', input.mode === 'job' ? JOB_LENGTH : CHAT_LENGTH),
    section('O que você sabe e o que pode fazer', KNOWLEDGE),
    section('Exemplos', EXAMPLES),
    nowSection(input.today, input.screen),
    ...input.data.filter(Boolean),
  ].join('\n\n');
}
