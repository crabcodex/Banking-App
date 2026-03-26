import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { ApiResponse } from '../shared/ApiResponse';

export interface RateLimitOptions {
  windowMs?: number;
  limit?: number;
}

/**
 * Factory de rate limiter configurable.
 * Usa draft-7 standard headers (RateLimit-*).
 */
export function createRateLimiter(options: RateLimitOptions = {}): RequestHandler {
  const { windowMs = 60_000, limit = 100 } = options;

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: ApiResponse.fail(
      'Demasiadas solicitudes',
      [{ code: 'RATE_LIMIT_EXCEEDED', message: 'Se ha excedido el límite de solicitudes. Intente de nuevo más tarde.' }],
    ),
  });
}

/**
 * Rate limiter para operaciones sensibles: 20 req/min.
 * Aplicar a rutas de mutación financiera (abrir cuenta, transferencias, etc.)
 */
export function sensitiveRateLimiter(): RequestHandler {
  return createRateLimiter({ windowMs: 60_000, limit: 20 });
}
