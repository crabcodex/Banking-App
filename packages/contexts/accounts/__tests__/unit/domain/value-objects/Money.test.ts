import { describe, it, expect } from 'vitest';
import { Money } from '../../../../src/domain/value-objects/Money';
import { NegativeAmountError } from '../../../../src/domain/errors';

describe('Money', () => {
  it('debe crear con monto válido', () => {
    const money = Money.of(1000, 'MXN');
    expect(money.amount).toBe(1000);
    expect(money.currency).toBe('MXN');
  });

  it('debe aceptar monto cero', () => {
    const money = Money.of(0, 'MXN');
    expect(money.amount).toBe(0);
  });

  it('debe rechazar monto negativo', () => {
    expect(() => Money.of(-1, 'MXN')).toThrow(NegativeAmountError);
  });

  it('debe ser igual por valor', () => {
    const a = Money.of(500, 'MXN');
    const b = Money.of(500, 'MXN');
    expect(a.equals(b)).toBe(true);
  });

  it('debe ser diferente si monto o moneda difieren', () => {
    expect(Money.of(500, 'MXN').equals(Money.of(500, 'USD'))).toBe(false);
    expect(Money.of(500, 'MXN').equals(Money.of(100, 'MXN'))).toBe(false);
  });
});
