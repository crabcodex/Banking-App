import { describe, it, expect } from 'vitest';
import { DailyLimit } from '../../../../src/domain/value-objects/DailyLimit';
import { AccountType } from '../../../../src/domain/value-objects/AccountType';
import { InvalidDailyLimitError } from '../../../../src/domain/errors';

describe('DailyLimit', () => {
  it('debe crear con valor positivo', () => {
    expect(new DailyLimit(50_000).value).toBe(50_000);
  });

  it('debe rechazar cero', () => {
    expect(() => new DailyLimit(0)).toThrow(InvalidDailyLimitError);
  });

  it('debe rechazar negativo', () => {
    expect(() => new DailyLimit(-1)).toThrow(InvalidDailyLimitError);
  });

  it('debe retornar default correcto por tipo', () => {
    const limit = DailyLimit.defaultForType(AccountType.fromString('EMPRESARIAL'));
    expect(limit.value).toBe(1_000_000);
  });
});
