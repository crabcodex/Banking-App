import { describe, it, expect } from 'vitest';
import { CLABE } from '../../../../src/domain/value-objects/CLABE';
import { InvalidCLABEError } from '../../../../src/domain/errors';

describe('CLABE', () => {
  it('debe aceptar 18 dígitos válidos', () => {
    const clabe = new CLABE('012345678901234567');
    expect(clabe.value).toBe('012345678901234567');
  });

  it('debe rechazar cadena con menos de 18 dígitos', () => {
    expect(() => new CLABE('12345')).toThrow(InvalidCLABEError);
  });

  it('debe rechazar cadena con letras', () => {
    expect(() => new CLABE('01234567890123456A')).toThrow(InvalidCLABEError);
  });

  it('debe rechazar cadena con más de 18 dígitos', () => {
    expect(() => new CLABE('0123456789012345678')).toThrow(InvalidCLABEError);
  });
});
