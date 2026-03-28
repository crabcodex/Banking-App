import { describe, it, expect } from 'vitest';
import { searchAccountsSchema } from '../../src/http/schemas/searchAccountsSchema';

describe('searchAccountsSchema', () => {
  const validBody = {
    filters: [{ field: 'customerId', operator: 'EQUALS', value: 'cust-1' }],
    limit: 20,
    offset: 0,
  };

  it('debe aceptar un body válido con un filtro', () => {
    const result = searchAccountsSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('debe aceptar body con order opcional', () => {
    const result = searchAccountsSchema.safeParse({
      ...validBody,
      order: { field: 'openedAt', direction: 'DESC' },
    });
    expect(result.success).toBe(true);
  });

  it('debe aceptar filtros vacíos (listado general)', () => {
    const result = searchAccountsSchema.safeParse({ ...validBody, filters: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filters).toEqual([]);
    }
  });

  it('debe rechazar campo de filtro inválido', () => {
    const result = searchAccountsSchema.safeParse({
      ...validBody,
      filters: [{ field: 'balance', operator: 'EQUALS', value: '100' }],
    });
    expect(result.success).toBe(false);
  });

  it('debe rechazar operador inválido', () => {
    const result = searchAccountsSchema.safeParse({
      ...validBody,
      filters: [{ field: 'customerId', operator: 'GT', value: 'cust-1' }],
    });
    expect(result.success).toBe(false);
  });

  it('debe aceptar operador IN con array de valores', () => {
    const result = searchAccountsSchema.safeParse({
      ...validBody,
      filters: [{ field: 'type', operator: 'IN', value: ['AHORRO', 'CHEQUES'] }],
    });
    expect(result.success).toBe(true);
  });

  it('debe aplicar default de limit=20 si no se envía', () => {
    const { filters } = validBody;
    const result = searchAccountsSchema.safeParse({ filters });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });

  it('debe rechazar limit mayor a 50', () => {
    const result = searchAccountsSchema.safeParse({ ...validBody, limit: 100 });
    expect(result.success).toBe(false);
  });

  it('debe rechazar limit menor a 1', () => {
    const result = searchAccountsSchema.safeParse({ ...validBody, limit: 0 });
    expect(result.success).toBe(false);
  });

  it('debe rechazar offset negativo', () => {
    const result = searchAccountsSchema.safeParse({ ...validBody, offset: -1 });
    expect(result.success).toBe(false);
  });

  it('debe aceptar múltiples filtros', () => {
    const result = searchAccountsSchema.safeParse({
      filters: [
        { field: 'customerId', operator: 'EQUALS', value: 'cust-1' },
        { field: 'type', operator: 'IN', value: ['AHORRO', 'CHEQUES'] },
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
      ],
      limit: 10,
      offset: 0,
    });
    expect(result.success).toBe(true);
  });
});
