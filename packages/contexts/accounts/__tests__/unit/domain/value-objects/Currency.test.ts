import { describe, it, expect } from 'vitest';
import { Currency } from '../../../../src/domain/value-objects/Currency';
import { InvalidCurrencyError } from '../../../../src/domain/errors';

describe('Currency', () => {
  it.each(['MXN', 'USD'])('debe aceptar moneda válida: %s', (cur) => {
    expect(Currency.fromString(cur).value).toBe(cur);
  });

  it('debe rechazar moneda inválida', () => {
    expect(() => Currency.fromString('EUR')).toThrow(InvalidCurrencyError);
  });
});
