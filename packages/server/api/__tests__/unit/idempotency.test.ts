import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { idempotency } from '../../src/middleware/idempotency';

function mockReq(method: string, headers: Record<string, string> = {}): Request {
  return {
    method,
    headers: { 'x-request-id': 'req-idem', ...headers },
  } as unknown as Request;
}

function mockRes(statusCode = 200) {
  const res = {
    statusCode,
    status: vi.fn().mockImplementation(function (this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('idempotency middleware', () => {
  let middleware: ReturnType<typeof idempotency>;

  beforeEach(() => {
    middleware = idempotency({ ttlMs: 60_000 });
  });

  it('debe pasar GET requests sin Idempotency-Key', () => {
    const req = mockReq('GET');
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe retornar 400 para POST sin Idempotency-Key', () => {
    const req = mockReq('POST');
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: [expect.objectContaining({ code: 'MISSING_IDEMPOTENCY_KEY' })],
      }),
    );
  });

  it('debe retornar 400 para PUT sin Idempotency-Key', () => {
    const req = mockReq('PUT');
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('debe procesar primera solicitud normalmente y llamar next()', () => {
    const req = mockReq('POST', { 'idempotency-key': 'key-1' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe cachear respuesta exitosa y retornarla en solicitud duplicada', () => {
    // Primera solicitud
    const req1 = mockReq('POST', { 'idempotency-key': 'key-2' });
    const res1 = mockRes();
    const next1: NextFunction = vi.fn();

    middleware(req1, res1, next1);
    // Simular respuesta exitosa del handler
    res1.statusCode = 201;
    res1.json({ success: true, data: { id: 'acc-1' } });

    // Segunda solicitud con la misma key
    const req2 = mockReq('POST', { 'idempotency-key': 'key-2' });
    const res2 = mockRes();
    const next2: NextFunction = vi.fn();

    middleware(req2, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(201);
    expect(res2.json).toHaveBeenCalledWith({ success: true, data: { id: 'acc-1' } });
  });

  it('debe retornar 409 si la solicitud original está en vuelo', () => {
    // Primera solicitud (aún procesando, no se llamó res.json)
    const req1 = mockReq('POST', { 'idempotency-key': 'key-3' });
    const res1 = mockRes();
    const next1: NextFunction = vi.fn();

    middleware(req1, res1, next1);

    // Segunda solicitud inmediata con la misma key
    const req2 = mockReq('POST', { 'idempotency-key': 'key-3' });
    const res2 = mockRes();
    const next2: NextFunction = vi.fn();

    middleware(req2, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(409);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [expect.objectContaining({ code: 'REQUEST_IN_FLIGHT' })],
      }),
    );
  });

  it('debe NO cachear respuestas de error (permite reintentos)', () => {
    // Primera solicitud con error
    const req1 = mockReq('POST', { 'idempotency-key': 'key-4' });
    const res1 = mockRes();
    const next1: NextFunction = vi.fn();

    middleware(req1, res1, next1);
    // Simular respuesta de error
    res1.statusCode = 500;
    res1.json({ success: false, message: 'Error interno' });

    // Reintento con la misma key (debe procesarse de nuevo)
    const req2 = mockReq('POST', { 'idempotency-key': 'key-4' });
    const res2 = mockRes();
    const next2: NextFunction = vi.fn();

    middleware(req2, res2, next2);

    expect(next2).toHaveBeenCalledOnce();
  });

  it('debe incluir requestId en respuestas de error', () => {
    const req = mockReq('POST');
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-idem' }),
    );
  });

  it('debe pasar PATCH requests que incluyan Idempotency-Key', () => {
    const req = mockReq('PATCH', { 'idempotency-key': 'key-5' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
