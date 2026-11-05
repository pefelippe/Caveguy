import type { Viewer } from '@zapbots/auth';
import { db, schema } from '@zapbots/database';
import {
  amortizationSchedule,
  annualToMonthlyRate,
  Decimal,
  formatCnpj,
  outstandingBalance,
  parseMoney,
  parsePercent,
  prepaymentEffect,
  READ_TOOLS,
  rentVsBuy,
  today,
} from '@zapbots/finance';
import { eq } from 'drizzle-orm';

import { CnpjError, lookupCnpj, type CompanyRegistry, type RegimeOption } from '../cnpj';
import type { AgentTool, AgentToolCall } from '../models';
import { MAX_PERIOD_DAYS, periodStatement } from '../month';
import { payoffPlanFor, scheduleInputFor } from '../obligations';
import { viewerHolder } from '../viewerHolder';

/**
 * The tools a Bot reads and simulates with (docs/adr/0021). They only read the Viewer's own
 * Finanças, through its Holder, and public company data at the Receita (docs/adr/0024), and
 * answer with money already formatted (docs/adr/0004): the Model cites, it never computes.
 */
export const READ_AGENT_TOOLS: AgentTool[] = READ_TOOLS;

const READ_TOOL_NAMES = new Set(READ_TOOLS.map(entry => entry.name));
export const isReadTool = (name: string) => READ_TOOL_NAMES.has(name);

const brl = new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' });
const money = (cents: number) => brl.format(cents / 100);
const day = (iso: string) => iso.split('-').reverse().join('/');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LISTED = 40;
const TOP_EXPENSES = 10;

/** A refusal the Model reads and can act on, e.g. by asking the User. */
class ToolInputError extends Error {}

function period(args: Record<string, unknown>): { from: string; to: string } {
  const { from, to } = args;
  if (
    typeof from !== 'string' ||
    typeof to !== 'string' ||
    !ISO_DATE.test(from) ||
    !ISO_DATE.test(to)
  ) {
    throw new ToolInputError('Datas inválidas: mande from e to no formato AAAA-MM-DD.');
  }
  if (from > to) throw new ToolInputError('A data inicial vem depois da final.');
  if ((Date.parse(to) - Date.parse(from)) / DAY_MS > MAX_PERIOD_DAYS) {
    throw new ToolInputError('O período passa de dois anos. Divida em partes menores.');
  }
  return { from, to };
}

function amountOf(raw: unknown, what: string): number {
  const cents = typeof raw === 'string' || typeof raw === 'number' ? parseMoney(raw) : null;
  if (!cents) throw new ToolInputError(`${what} inválido: mande em reais, ex.: "5000,00".`);
  return cents;
}

const sumOf = (lines: { amountCents: number }[]) =>
  lines.reduce((total, line) => total + line.amountCents, 0);

const categoryOf = (category: string | null) => category?.trim() || 'Sem categoria';

async function periodSummary(viewer: Viewer, args: Record<string, unknown>): Promise<string> {
  const { from, to } = period(args);
  const holder = await viewerHolder(viewer);
  const statement = await periodStatement(holder.id, from, to);
  const byCategory = new Map<string, { cents: number; count: number }>();
  for (const expense of statement.expenses) {
    const entry = byCategory.get(categoryOf(expense.category)) ?? { cents: 0, count: 0 };
    entry.cents += expense.amountCents;
    entry.count++;
    byCategory.set(categoryOf(expense.category), entry);
  }
  const categories = [...byCategory].sort((a, b) => b[1].cents - a[1].cents);
  const top = [...statement.expenses]
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, TOP_EXPENSES);
  return [
    `Período de ${day(from)} a ${day(to)}:`,
    `- Receitas: ${money(statement.incomeCents)}`,
    `- Compromissos (Parcelas, Faturas, Impostos e Gastos recorrentes): ${money(statement.commitmentsCents)}`,
    `- Gastos: ${money(statement.expensesCents)} em ${statement.expenses.length} lançamento(s)`,
    `- Sobra: ${money(statement.balanceCents)}`,
    ...(categories.length
      ? [
          'Gastos por categoria, do maior para o menor:',
          ...categories.map(
            ([name, { cents, count }]) => `- ${name}: ${money(cents)} (${count} lançamento(s))`
          ),
          'Maiores Gastos:',
          ...top.map(
            expense =>
              `- ${day(expense.date)} ${expense.description} (${categoryOf(expense.category)}): ${money(expense.amountCents)}`
          ),
        ]
      : ['Nenhum Gasto lançado no período.']),
    ...(statement.onCard.length
      ? [
          `No cartão, já dentro das Faturas e fora da soma: ${statement.onCard
            .map(line => `${line.label} ${money(line.amountCents)}`)
            .join(', ')}.`,
        ]
      : []),
  ].join('\n');
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

async function listExpenses(viewer: Viewer, args: Record<string, unknown>): Promise<string> {
  const { from, to } = period(args);
  const category =
    typeof args.category === 'string' && args.category.trim() ? fold(args.category) : null;
  const search = typeof args.search === 'string' && args.search.trim() ? fold(args.search) : null;
  const holder = await viewerHolder(viewer);
  const { expenses } = await periodStatement(holder.id, from, to);
  const found = expenses
    .filter(expense => !category || fold(categoryOf(expense.category)) === category)
    .filter(expense => !search || fold(expense.description).includes(search))
    .sort((a, b) => b.amountCents - a.amountCents);
  if (!found.length) return `Nenhum Gasto encontrado de ${day(from)} a ${day(to)} com esse filtro.`;
  return [
    `${found.length} Gasto(s) de ${day(from)} a ${day(to)}, total ${money(sumOf(found))}:`,
    ...found
      .slice(0, MAX_LISTED)
      .map(
        expense =>
          `- ${day(expense.date)} ${expense.description} (${categoryOf(expense.category)}): ${money(expense.amountCents)}`
      ),
    ...(found.length > MAX_LISTED ? [`… e mais ${found.length - MAX_LISTED}, menores.`] : []),
  ].join('\n');
}

async function simulatePrepayment(viewer: Viewer, args: Record<string, unknown>): Promise<string> {
  const amountCents = amountOf(args.amount, 'Valor');
  const name = typeof args.operation === 'string' ? fold(args.operation.trim()) : '';
  const holder = await viewerHolder(viewer);
  const operations = await db
    .select()
    .from(schema.creditOperation)
    .where(eq(schema.creditOperation.holderId, holder.id));
  const operation =
    operations.find(candidate => fold(candidate.name) === name) ??
    operations.find(candidate => name && fold(candidate.name).includes(name));
  if (!operation) {
    return `Operação não encontrada. As cadastradas são: ${operations.map(candidate => candidate.name).join(', ') || 'nenhuma'}.`;
  }
  const asOf = today();
  const input = await scheduleInputFor(operation);
  const balance = outstandingBalance(amortizationSchedule(input), operation.principalCents, asOf);
  if (balance <= 0) return `${operation.name} já está quitada.`;
  const effect = prepaymentEffect(input, asOf, amountCents);
  return [
    `Pagando ${money(Math.min(amountCents, balance))} a mais amanhã em ${operation.name} (Saldo Devedor hoje ${money(balance)}):`,
    `- economiza ${money(effect.interestSavedCents)} de juros`,
    `- e ${effect.installmentsSaved} Parcela(s).`,
    ...(amountCents > balance
      ? ['O valor passa do Saldo Devedor; a simulação usou o saldo inteiro.']
      : []),
  ].join('\n');
}

async function payoffPlan(viewer: Viewer, args: Record<string, unknown>): Promise<string> {
  const monthlyExtraCents = amountOf(args.monthlyExtra, 'Valor por mês');
  const holder = await viewerHolder(viewer);
  const plan = await payoffPlanFor(holder.id, monthlyExtraCents, today());
  if (!plan.payoffs.length || !plan.debtFreeOn) return 'Não há dívidas em aberto para planejar.';
  return [
    `Com ${money(monthlyExtraCents)} por mês a mais, sempre na Operação de maior taxa:`,
    `- sem dívidas em ${day(plan.debtFreeOn)}` +
      (plan.debtFreeWithoutPlanOn ? `, em vez de ${day(plan.debtFreeWithoutPlanOn)}` : ''),
    `- economiza ${money(plan.interestSavedCents)} de juros`,
    `- ordem: ${plan.payoffs.map(payoff => `${payoff.name} (${day(payoff.paidOffOn)})`).join(', ')}.`,
  ].join('\n');
}

function rateOf(raw: unknown, what: string): Decimal {
  const rate = typeof raw === 'string' || typeof raw === 'number' ? parsePercent(raw) : null;
  if (!rate || rate.gte(10)) throw new ToolInputError(`${what} inválida: mande em %, ex.: "1,5".`);
  return rate;
}

function monthsOf(raw: unknown): number {
  const months = Number(raw);
  if (!Number.isInteger(months) || months < 1 || months > 600) {
    throw new ToolInputError('Prazo inválido: mande os meses, de 1 a 600.');
  }
  return months;
}

const percentText = (fraction: Decimal) =>
  `${fraction.times(100).toDecimalPlaces(2).toString().replace('.', ',')}%`;

/** Price against SAC for one loan: no data of the User's, only the numbers given. */
async function compareFinancing(_: Viewer, args: Record<string, unknown>): Promise<string> {
  const principalCents = amountOf(args.amount, 'Valor');
  const rate = rateOf(args.rate, 'Taxa');
  const monthlyRate = args.ratePeriod === 'anual' ? annualToMonthlyRate(rate) : rate;
  const termMonths = monthsOf(args.months);
  const line = (system: 'PRICE' | 'SAC') => {
    const rows = amortizationSchedule({
      firstDueDate: today(),
      monthlyRate,
      principalCents,
      system,
      termMonths,
    });
    const paid = rows.reduce((total, row) => total + row.installmentCents, 0);
    const interest = rows.reduce((total, row) => total + row.interestCents, 0);
    return `- ${system === 'PRICE' ? 'Price' : 'SAC'}: 1ª parcela ${money(rows[0]!.installmentCents)}, última ${money(rows.at(-1)!.installmentCents)}, total pago ${money(paid)}, juros ${money(interest)}.`;
  };
  return [
    `${money(principalCents)} em ${termMonths} meses a ${percentText(monthlyRate)} ao mês:`,
    line('PRICE'),
    line('SAC'),
  ].join('\n');
}

/** Renting against financing a home, as the Calculadoras did: the same money out each month. */
async function rentOrBuy(_: Viewer, args: Record<string, unknown>): Promise<string> {
  const propertyCents = amountOf(args.property, 'Preço do imóvel');
  const downPaymentCents =
    typeof args.downPayment === 'string' || typeof args.downPayment === 'number'
      ? (parseMoney(args.downPayment) ?? 0)
      : 0;
  const rentCents = amountOf(args.rent, 'Aluguel');
  const optional = (raw: unknown, fallback: string, what: string) =>
    raw === undefined || raw === null || raw === '' ? new Decimal(fallback) : rateOf(raw, what);
  const closingCostsCents =
    args.closingCosts === undefined || args.closingCosts === null || args.closingCosts === ''
      ? Math.round(propertyCents * 0.05)
      : amountOf(args.closingCosts, 'Custos de compra');
  const input = {
    appreciationRate: optional(args.appreciation, '0.04', 'Valorização'),
    closingCostsCents,
    downPaymentCents,
    financingRate: rateOf(args.financingRate, 'Taxa do financiamento'),
    investmentRate: optional(args.investmentReturn, '0.08', 'Rendimento'),
    propertyCents,
    rentAdjustmentRate: optional(args.rentAdjustment, '0.04', 'Reajuste'),
    rentCents,
    system: 'SAC' as const,
    termMonths: monthsOf(args.months),
  };
  if (downPaymentCents > propertyCents) return 'A entrada passa do preço do imóvel.';
  const outcome = rentVsBuy(input);
  if (!outcome) return 'Não deu para calcular com esses valores.';
  const last = outcome.points.at(-1)!;
  const span = (months: number) =>
    months % 12 ? `${months} meses` : `${months / 12} ano${months === 12 ? '' : 's'}`;
  return [
    `Em ${span(input.termMonths)}, gastando o mesmo por mês:`,
    `- comprando (SAC): patrimônio de ${money(last.buyerWealthCents)}; paga ${money(outcome.totalInstallmentsCents)} em parcelas, ${money(outcome.totalInterestCents)} de juros`,
    `- alugando e investindo: patrimônio de ${money(last.renterWealthCents)}; paga ${money(outcome.totalRentCents)} de aluguel`,
    outcome.buyerAheadFrom
      ? `- comprar fica à frente a partir do mês ${outcome.buyerAheadFrom}.`
      : '- comprar não fica à frente em nenhum momento do prazo.',
    `Premissas: valorização ${percentText(input.appreciationRate)} ao ano, rendimento ${percentText(input.investmentRate)} ao ano, reajuste do aluguel ${percentText(input.rentAdjustmentRate)} ao ano, custos de compra ${money(closingCostsCents)}.`,
  ].join('\n');
}

const regimeLine = (name: string, option: RegimeOption | null) => {
  if (!option) return `- ${name}: a Receita não informa.`;
  if (option.opted)
    return `- ${name}: optante${option.since ? ` desde ${day(option.since)}` : ''}.`;
  return option.until
    ? `- ${name}: não optante; saiu em ${day(option.until)}${option.since ? ` (entrou em ${day(option.since)})` : ''}.`
    : `- ${name}: não optante.`;
};

/** A CNPJ at the Receita (docs/adr/0024); without one, the Titular's own company. */
async function companyLookup(viewer: Viewer, args: Record<string, unknown>): Promise<string> {
  let cnpj = typeof args.cnpj === 'string' ? args.cnpj.trim() : '';
  if (!cnpj) {
    const holder = await viewerHolder(viewer);
    if (!holder.companyCnpj) {
      return 'A pessoa não cadastrou o CNPJ da empresa. Ela pode informar o CNPJ aqui na conversa.';
    }
    cnpj = holder.companyCnpj;
  }
  let company: CompanyRegistry;
  try {
    company = await lookupCnpj(cnpj);
  } catch (error) {
    if (error instanceof CnpjError) return error.message;
    throw error;
  }
  return [
    `${company.legalName}${company.tradeName ? ` (${company.tradeName})` : ''}, CNPJ ${formatCnpj(company.cnpj)}:`,
    `- Situação cadastral: ${company.status}`,
    ...(company.openedOn ? [`- Aberta em ${day(company.openedOn)}`] : []),
    ...(company.cnae
      ? [`- Atividade principal: ${company.cnae.code} - ${company.cnae.description}`]
      : []),
    ...(company.city ? [`- Cidade: ${company.city}`] : []),
    regimeLine('Simples Nacional', company.simples),
    regimeLine('MEI', company.mei),
  ].join('\n');
}

const RUN: Record<string, (viewer: Viewer, args: Record<string, unknown>) => Promise<string>> = {
  company_lookup: companyLookup,
  compare_financing: compareFinancing,
  rent_vs_buy: rentOrBuy,
  list_expenses: listExpenses,
  payoff_plan: payoffPlan,
  period_summary: periodSummary,
  simulate_prepayment: simulatePrepayment,
};

/** Runs one read tool call for the Viewer and answers the Model in words. */
export async function runReadTool(viewer: Viewer, call: AgentToolCall): Promise<string> {
  const run = RUN[call.name];
  if (!run) return `Ferramenta desconhecida: ${call.name}.`;
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(call.arguments || '{}') as Record<string, unknown>;
  } catch {
    return 'Argumentos ilegíveis. Tente de novo.';
  }
  try {
    return await run(viewer, args);
  } catch (error) {
    if (error instanceof ToolInputError) return error.message;
    throw error;
  }
}
