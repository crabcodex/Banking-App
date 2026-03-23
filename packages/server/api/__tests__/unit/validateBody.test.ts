import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { validateBody } from '../../src/middleware/validateBody';
import { openAccountSchema } from '../../src/schemas/openAccountSchema';

function mockReq(body: unknown): Request {
  return { body, headers: { 'x-request-id': 'req-123' } } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('validateBody middleware', () => {
  const middleware = validateBody(openAccountSchema);

  it('debe llamar a next() con body válido', () => {
    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Test',
      initialBalance: 1000,
    });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe responder 400 con body inválido', () => {
    const req = mockReq({ customerId: 'invalid' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Errores de validación',
        errors: expect.arrayContaining([
          expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        ]),
      }),
    );
  });

  it('debe reemplazar req.body con datos parseados', () => {
    const req = mockReq({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'AHORRO',
      currency: 'MXN',
      alias: 'Test',
      initialBalance: 1000,
      extraField: 'should-be-stripped',
    });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).not.toHaveProperty('extraField');
  });

  it('debe incluir requestId en la respuesta de error', () => {
    const req = mockReq({});
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-123' }),
    );
  });
});
