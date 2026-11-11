import { describe, expect, it } from 'vitest';

import {
  availableCents,
  byCategory,
  categoryMark,
  cumulative,
  nextCharge,
  niceStep,
  previousMonth,
  spentByDay,
} from './overview';

describe('spentByDay', () => {
  it('sums each day and leaves out own transfers and other months', () => {
    const days = spentByDay(
      [
        { amountCents: 100, date: '2026-02-01' },
        { amountCents: 50, date: '2026-02-01' },
        { amountCents: 999, date: '2026-02-03', ownTransfer: true },
        { amountCents: 70, date: '2026-03-01' },
        { amountCents: 30, date: '2026-02-28' },
      ],
      '2026-02'
    );
    expect(days).toHaveLength(28);
    expect(days[0]).toBe(150);
    expect(days[2]).toBe(0);
    expect(days[27]).toBe(30);
    expect(cumulative(days).at(-1)).toBe(180);
  });
});

describe('previousMonth', () => {
  it('crosses the year', () => {
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(previousMonth('2026-11')).toBe('2026-10');
  });
});

describe('nextCharge', () => {
  it('is this month when the day is still ahead, else next month', () => {
    expect(nextCharge({ cycle: 'MONTHLY', dueDay: 25 }, '2026-11-11')).toBe('2026-11-25');
    expect(nextCharge({ cycle: 'MONTHLY', dueDay: 3 }, '2026-12-11')).toBe('2027-01-03');
  });

  it('falls on the last day of a short month', () => {
    expect(nextCharge({ cycle: 'MONTHLY', dueDay: 31 }, '2026-02-10')).toBe('2026-02-28');
  });

  it('is next year for a yearly charge already past', () => {
    expect(nextCharge({ cycle: 'YEARLY', dueDay: 5, dueMonth: 3 }, '2026-11-11')).toBe(
      '2027-03-05'
    );
  });

  it('is null once cancelled', () => {
    expect(
      nextCharge({ cycle: 'MONTHLY', dueDay: 25, endsOn: '2026-11-20' }, '2026-11-11')
    ).toBeNull();
  });
});

describe('niceStep', () => {
  it('rounds a quarter of the top up to 1, 2, 2.5 or 5 times a power of ten', () => {
    expect(niceStep(3_600_000)).toBe(1_000_000);
    expect(niceStep(3_000_000)).toBe(1_000_000);
    expect(niceStep(700_000)).toBe(200_000);
    expect(niceStep(0)).toBeGreaterThan(0);
  });
});

describe('availableCents', () => {
  it('takes what is in use off the limit, never below zero', () => {
    expect(availableCents(500_000, 120_000)).toBe(380_000);
    expect(availableCents(100_000, 150_000)).toBe(0);
  });
});

describe('byCategory', () => {
  it('sums by category, biggest first, with no own transfers and the blank under Outros', () => {
    expect(
      byCategory([
        { amountCents: 100, category: 'Mercado', date: '2026-02-01' },
        { amountCents: 300, category: ' ', date: '2026-02-02' },
        { amountCents: 50, category: 'Mercado', date: '2026-02-03' },
        { amountCents: 999, category: 'Mercado', date: '2026-02-03', ownTransfer: true },
      ])
    ).toEqual([
      { amountCents: 300, category: 'Outros' },
      { amountCents: 150, category: 'Mercado' },
    ]);
  });
});

describe('categoryMark', () => {
  it('finds a mark by the words in the name, accents aside', () => {
    expect(categoryMark('Restaurantes, bares e lanchonetes')).toBe('🍽️');
    expect(categoryMark('Saúde')).toBe('💊');
    expect(categoryMark(null)).toBe('📦');
  });
});
