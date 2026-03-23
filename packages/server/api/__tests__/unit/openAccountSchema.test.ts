import { describe, it, expect } from 'vitest';
import { openAccountSchema } from '../../src/schemas/openAccountSchema';

describe('openAccountSchema', () => {
  const validBody = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    type: 'AHORRO',
    currency: 'MXN',
    alias: 'Mi Ahorro',
    initialBalance: 1000,
  };

  it('debe aceptar un body válido', () => {
    const result = openAccountSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('debe rechazar customerId que no sea UUID', () => {
    const result = openAccountSchema.safeParse({ ...validBody, customerId: 'no-uuid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('UUID');
    }
  });

  it('debe rechazar tipo de cuenta inválido', () => {
    const result = openAccountSchema.safeParse({ ...validBody, type: 'CRIPTO' });
    expect(result.success).toBe(false);
  });

  it('debe rechazar moneda inválida', () => {
    const result = openAccountSchema.safeParse({ ...validBody, currency: 'EUR' });
    expect(result.success).toBe(false);
  });

  it('debe rechazar alias vacío', () => {
    const result = openAccountSchema.safeParse({ ...validBody, alias: '' });
    expect(result.success).toBe(false);
  });

  it('debe rechazar alias mayor a 50 caracteres', () => {
    const result = openAccountSchema.safeParse({ ...validBody, alias: 'x'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('debe rechazar saldo inicial negativo', () => {
    const result = openAccountSchema.safeParse({ ...validBody, initialBalance: -100 });
    expect(result.success).toBe(false);
  });

  it('debe rechazar saldo inicial cero', () => {
    const result = openAccountSchema.safeParse({ ...validBody, initialBalance: 0 });
    expect(result.success).toBe(false);
  });

  it('debe rechazar campos faltantes', () => {
    const result = openAccountSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('debe aceptar todos los tipos de cuenta válidos', () => {
    const tipos = ['AHORRO', 'CHEQUES', 'NOMINA', 'INVERSION', 'EMPRESARIAL'];
    for (const type of tipos) {
      const result = openAccountSchema.safeParse({ ...validBody, type });
      expect(result.success).toBe(true);
    }
  });
});
