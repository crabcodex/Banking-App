import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { DomainError, ValidationError } from '@bank/shared';

function mockReq(): Request {
  return { headers: { 'x-request-id': 'req-err' } } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('errorHandler', () => {
  it('debe mapear DomainError a su httpStatus', () => {
    const err = new DomainError('ACCOUNT_NOT_FOUND', 'Cuenta no encontrada', 404);
    const res = mockRes();

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: [{ code: 'ACCOUNT_NOT_FOUND', message: 'Cuenta no encontrada' }],
        requestId: 'req-err',
      }),
    );
  });

  it('debe mapear ValidationError con errores detallados', () => {
    const err = new ValidationError([
      { field: 'type', message: 'invalido' },
      { field: 'amount', message: 'requerido' },
    ]);
    const res = mockRes();

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([
          { code: 'VALIDATION_ERROR', message: 'type: invalido' },
          { code: 'VALIDATION_ERROR', message: 'amount: requerido' },
        ]),
      }),
    );
  });

  it('debe responder 500 para errores no controlados', () => {
    const err = new Error('algo raro');
    const res = mockRes();

    // Suprimir console.error en tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq(), res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }],
      }),
    );
  });
});
