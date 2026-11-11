import { describe, expect, it } from 'vitest';

import { readSpend } from './landingSpend';

describe('readSpend', () => {
  it('reads whole reais, cents and the R$ sign', () => {
    expect(readSpend('gastei 32 no ifood')).toEqual({ cents: 3200, place: 'Ifood' });
    expect(readSpend('gastei 32,90 no mercado')).toEqual({ cents: 3290, place: 'Mercado' });
    expect(readSpend('R$ 32,9 na padaria')).toEqual({ cents: 3290, place: 'Padaria' });
    expect(readSpend('paguei 1.250,00 de aluguel')?.cents).toBe(125000);
  });

  it('reads the place in English too, and none when not said', () => {
    expect(readSpend('spent 50 at the market')).toEqual({ cents: 5000, place: 'Market' });
    expect(readSpend('gastei 12')).toEqual({ cents: 1200, place: null });
  });

  it('gives up without an amount', () => {
    expect(readSpend('oi')).toBeNull();
    expect(readSpend('gastei 0 no bar')).toBeNull();
  });
});
