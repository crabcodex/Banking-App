import { describe, it, expect } from 'vitest';
import { AccountId } from '../../../../src/domain/value-objects/AccountId';
import { InvalidAccountIdError } from '../../../../src/domain/errors';

describe('AccountId', () => {
  it('debe generar UUID válido', () => {
    const id = AccountId.generate();
    expect(id.value).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('debe aceptar UUID válido', () => {
    const id = new AccountId('550e8400-e29b-41d4-a716-446655440000');
    expect(id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('debe rechazar formato inválido', () => {
    expect(() => new AccountId('no-es-uuid')).toThrow(InvalidAccountIdError);
  });
});
