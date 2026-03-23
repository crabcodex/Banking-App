import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { ITokenVerifier, TokenPayload } from '@bank/shared';
import { requireAuth, requireRole } from '../../src/middleware/auth';

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers: { 'x-request-id': 'req-auth', ...headers } } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function fakeVerifier(result?: TokenPayload, error?: Error): ITokenVerifier {
  return {
    verify: result
      ? vi.fn<(token: string) => Promise<TokenPayload>>().mockResolvedValue(result)
      : vi.fn<(token: string) => Promise<TokenPayload>>().mockRejectedValue(error ?? new Error('invalid')),
  };
}

describe('requireAuth', () => {
  it('debe retornar 401 si no hay header Authorization', async () => {
    const verifier = fakeVerifier({ sub: 'u1', role: 'customer' });
    const middleware = requireAuth(verifier);
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: [expect.objectContaining({ code: 'UNAUTHORIZED' })],
      }),
    );
  });

  it('debe retornar 401 si el header no empieza con Bearer', async () => {
    const verifier = fakeVerifier({ sub: 'u1', role: 'customer' });
    const middleware = requireAuth(verifier);
    const req = mockReq({ authorization: 'Basic abc123' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('debe retornar 401 cuando el verifier rechaza el token', async () => {
    const verifier = fakeVerifier(undefined, new Error('Token inválido'));
    const middleware = requireAuth(verifier);
    const req = mockReq({ authorization: 'Bearer invalid.token.here' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [expect.objectContaining({ message: 'Token inválido o expirado' })],
      }),
    );
  });

  it('debe llamar next() y asignar req.user con token válido', async () => {
    const payload: TokenPayload = { sub: 'user-42', role: 'customer' };
    const verifier = fakeVerifier(payload);
    const middleware = requireAuth(verifier);
    const req = mockReq({ authorization: 'Bearer valid-token' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(verifier.verify).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual(payload);
  });

  it('debe incluir requestId en respuestas de error', async () => {
    const verifier = fakeVerifier({ sub: 'u1', role: 'customer' });
    const middleware = requireAuth(verifier);
    const req = mockReq();
    const res = mockRes();

    await middleware(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-auth' }),
    );
  });
});

describe('requireRole', () => {
  it('debe retornar 401 si no hay req.user', () => {
    const middleware = requireRole('admin');
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('debe retornar 403 si el rol no coincide', () => {
    const middleware = requireRole('admin');
    const req = mockReq();
    (req as any).user = { sub: 'user-1', role: 'customer' };
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [expect.objectContaining({ code: 'FORBIDDEN' })],
      }),
    );
  });

  it('debe llamar next() si el rol coincide', () => {
    const middleware = requireRole('admin', 'manager');
    const req = mockReq();
    (req as any).user = { sub: 'user-1', role: 'admin' };
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('debe aceptar múltiples roles válidos', () => {
    const middleware = requireRole('customer', 'admin');
    const req = mockReq();
    (req as any).user = { sub: 'user-1', role: 'customer' };
    const res = mockRes();
    const next: NextFunction = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
