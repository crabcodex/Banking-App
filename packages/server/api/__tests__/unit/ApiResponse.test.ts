import { describe, it, expect } from 'vitest';
import type { Request, Response } from 'express';
import { ApiResponse } from '../../src/shared/ApiResponse';

describe('ApiResponse', () => {
  it('debe crear respuesta exitosa con ok()', () => {
    const response = ApiResponse.ok({ id: '1' }, 'Creado');

    expect(response.success).toBe(true);
    expect(response.message).toBe('Creado');
    expect(response.data).toEqual({ id: '1' });
    expect(response.errors).toEqual([]);
  });

  it('debe crear respuesta fallida con fail()', () => {
    const errors = [{ code: 'ERR', message: 'algo salió mal' }];
    const response = ApiResponse.fail('Error', errors);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Error');
    expect(response.data).toBeNull();
    expect(response.errors).toEqual(errors);
  });

  it('debe agregar requestId con withRequestId()', () => {
    const response = ApiResponse.ok(null).withRequestId('req-789');

    expect(response.requestId).toBe('req-789');
    expect(response.success).toBe(true);
  });

  it('ok() debe tener mensaje por defecto "OK"', () => {
    const response = ApiResponse.ok({ x: 1 });
    expect(response.message).toBe('OK');
  });
});
