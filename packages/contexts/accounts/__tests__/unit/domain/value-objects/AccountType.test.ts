import { describe, it, expect } from 'vitest';
import { AccountType } from '../../../../src/domain/value-objects/AccountType';
import { InvalidAccountTypeError } from '../../../../src/domain/errors';

describe('AccountType', () => {
  it.each(['AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL'])(
    'debe aceptar tipo válido: %s',
    (type) => {
      const vo = AccountType.fromString(type);
      expect(vo.value).toBe(type);
    },
  );

  it('debe rechazar tipo inválido', () => {
    expect(() => AccountType.fromString('CRIPTO')).toThrow(InvalidAccountTypeError);
  });

  it('debe ser inmutable', () => {
    const vo = AccountType.fromString('AHORRO');
    expect(() => { (vo as any).value = 'CHEQUES'; }).toThrow();
  });

  it('debe ser igual por valor', () => {
    const a = AccountType.fromString('AHORRO');
    const b = AccountType.fromString('AHORRO');
    expect(a.equals(b)).toBe(true);
  });
});
