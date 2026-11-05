/**
 * The tools the Caishen reads and simulates with (docs/adr/0021): name, description and arguments
 * as JSON Schema. What each one does lives in `apps/server`, which reads the data; these only say
 * what the Model may ask for.
 */
export interface ToolSpec {
  description: string;
  name: string;
  parameters: {
    properties: Record<string, unknown>;
    required?: string[];
    type: 'object';
  };
}

const DATE = { description: 'Data no formato AAAA-MM-DD.', type: 'string' } as const;
const AMOUNT = (what: string) =>
  ({ description: `${what}, em reais (ex.: "5000,00").`, type: 'string' }) as const;

export const PERIOD_SUMMARY: ToolSpec = {
  description:
    'Resume um período: quanto entrou (Receitas), quanto foi para Compromissos (Parcelas, Faturas, Impostos, Gastos recorrentes), quanto foi em Gastos e em quais categorias, e o que sobrou. Até dois anos.',
  name: 'period_summary',
  parameters: {
    properties: {
      from: { ...DATE, description: 'Primeiro dia do período, AAAA-MM-DD.' },
      to: { ...DATE, description: 'Último dia do período, AAAA-MM-DD.' },
    },
    required: ['from', 'to'],
    type: 'object',
  },
};

export const LIST_EXPENSES: ToolSpec = {
  description:
    'Lista os Gastos de um período, do maior para o menor, com o total. Filtra por categoria ou por um texto da descrição.',
  name: 'list_expenses',
  parameters: {
    properties: {
      category: { description: 'Só desta categoria, ex.: "Mercado".', type: 'string' },
      from: { ...DATE, description: 'Primeiro dia, AAAA-MM-DD.' },
      search: {
        description: 'Só os que têm este texto na descrição, ex.: "ifood".',
        type: 'string',
      },
      to: { ...DATE, description: 'Último dia, AAAA-MM-DD.' },
    },
    required: ['from', 'to'],
    type: 'object',
  },
};

export const SIMULATE_PREPAYMENT: ToolSpec = {
  description:
    'Simula pagar amanhã um valor a mais numa Operação de Crédito (Amortização Extraordinária): quanto de juros e quantas Parcelas se economiza.',
  name: 'simulate_prepayment',
  parameters: {
    properties: {
      amount: AMOUNT('O valor a mais'),
      operation: {
        description: 'O nome da Operação como aparece nos dados, ex.: "Empréstimo Itaú".',
        type: 'string',
      },
    },
    required: ['operation', 'amount'],
    type: 'object',
  },
};

export const PAYOFF_PLAN: ToolSpec = {
  description:
    'Plano de Quitação: pagando um valor a mais por mês, sempre na Operação de maior taxa, quando cada dívida acaba, quando fica sem dívidas e quanto de juros economiza.',
  name: 'payoff_plan',
  parameters: {
    properties: { monthlyExtra: AMOUNT('O valor a mais por mês') },
    required: ['monthlyExtra'],
    type: 'object',
  },
};

const RATE = (what: string) =>
  ({ description: `${what}, em % (ex.: "1,5" para 1,5%).`, type: 'string' }) as const;

export const COMPARE_FINANCING: ToolSpec = {
  description:
    'Calculadora de financiamento: para um valor, uma taxa e um prazo, compara Price (parcela fixa) e SAC (parcela que cai): primeira e última parcela, total pago e total de juros. Não usa os dados da pessoa.',
  name: 'compare_financing',
  parameters: {
    properties: {
      amount: AMOUNT('O valor financiado'),
      months: { description: 'O prazo em meses, ex.: 360.', type: 'integer' },
      rate: RATE('A taxa de juros'),
      ratePeriod: {
        description: 'Se a taxa é ao mês ou ao ano.',
        enum: ['mensal', 'anual'],
        type: 'string',
      },
    },
    required: ['amount', 'rate', 'ratePeriod', 'months'],
    type: 'object',
  },
};

export const RENT_VS_BUY: ToolSpec = {
  description:
    'Calculadora de alugar ou financiar um imóvel: os dois gastam o mesmo por mês e quem paga menos investe a diferença. Diz quem termina com mais patrimônio e a partir de quando comprar fica à frente. Os valores que a pessoa não deu usam premissas, que a resposta lista.',
  name: 'rent_vs_buy',
  parameters: {
    properties: {
      appreciation: RATE('Valorização do imóvel ao ano (padrão 4)'),
      closingCosts: AMOUNT('ITBI, cartório e taxas (padrão 5% do imóvel)'),
      downPayment: AMOUNT('A entrada'),
      financingRate: RATE('Juros do financiamento ao ano'),
      investmentReturn: RATE('Rendimento líquido do que se investe, ao ano (padrão 8)'),
      months: { description: 'Prazo do financiamento em meses, ex.: 360.', type: 'integer' },
      property: AMOUNT('O preço do imóvel'),
      rent: AMOUNT('O aluguel por mês'),
      rentAdjustment: RATE('Reajuste do aluguel ao ano (padrão 4)'),
    },
    required: ['property', 'downPayment', 'rent', 'financingRate', 'months'],
    type: 'object',
  },
};

export const COMPANY_LOOKUP: ToolSpec = {
  description:
    'Consulta um CNPJ na Receita (dados públicos): razão social, situação cadastral, atividade (CNAE), abertura, cidade e se é optante do Simples Nacional ou MEI, com as datas. Sem CNPJ, consulta a empresa da pessoa, se ela tiver cadastrado.',
  name: 'company_lookup',
  parameters: {
    properties: {
      cnpj: {
        description: 'O CNPJ, com ou sem pontuação. Vazio para a empresa da pessoa.',
        type: 'string',
      },
    },
    type: 'object',
  },
};

export const READ_TOOLS: ToolSpec[] = [
  PERIOD_SUMMARY,
  LIST_EXPENSES,
  SIMULATE_PREPAYMENT,
  PAYOFF_PLAN,
  COMPARE_FINANCING,
  RENT_VS_BUY,
  COMPANY_LOOKUP,
];
