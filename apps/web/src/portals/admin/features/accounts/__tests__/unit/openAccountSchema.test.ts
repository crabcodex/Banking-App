import { describe, it, expect } from 'vitest';
import { openAccountSchema } from '../../schemas/openAccountSchema';

const VALID_DATA = {
  customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  type: 'AHORRO' as const,
  currency: 'MXN' as const,
};

describe('openAccountSchema', () => {
  it('acepta datos validos', () => {
    const result = openAccountSchema.safeParse(VALID_DATA);
    expect(result.success).toBe(true);
  });

  describe('customerId', () => {
    it('rechaza string vacio', () => {
      const result = openAccountSchema.safeParse({ ...VALID_DATA, customerId: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El ID de cliente debe ser un UUID válido');
      }
    });

    it('rechaza UUID invalido', () => {
      const result = openAccountSchema.safeParse({ ...VALID_DATA, customerId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('rechaza undefined', () => {
      const { customerId: _, ...rest } = VALID_DATA;
      const result = openAccountSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe('type', () => {
    it.each(['AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL'] as const)(
      'acepta tipo %s',
      (type) => {
        const result = openAccountSchema.safeParse({ ...VALID_DATA, type });
        expect(result.success).toBe(true);
      },
    );

    it('rechaza tipo invalido', () => {
      const result = openAccountSchema.safeParse({ ...VALID_DATA, type: 'CRIPTO' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Selecciona un tipo de cuenta');
      }
    });

    it('rechaza undefined', () => {
      const { type: _, ...rest } = VALID_DATA;
      const result = openAccountSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe('currency', () => {
    it.each(['MXN', 'USD'] as const)('acepta moneda %s', (currency) => {
      const result = openAccountSchema.safeParse({ ...VALID_DATA, currency });
      expect(result.success).toBe(true);
    });

    it('rechaza moneda invalida', () => {
      const result = openAccountSchema.safeParse({ ...VALID_DATA, currency: 'EUR' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Selecciona una moneda');
      }
    });
  });
});
