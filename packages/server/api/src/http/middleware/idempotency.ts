import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiResponse } from '../shared/ApiResponse';

interface CachedResponse {
  statusCode: number;
  body: unknown;
  timestamp: number;
}

/**
 * Middleware de idempotencia para operaciones de mutación.
 * Requiere header `Idempotency-Key` en POST/PUT/PATCH.
 *
 * Comportamiento:
 *  - Primera vez con la key: procesa normalmente, cachea respuesta exitosa.
 *  - Key repetida (ya cacheada): retorna la respuesta cacheada sin re-ejecutar.
 *  - Key en vuelo (aún procesando): retorna 409 Conflict.
 *  - Error del handler: limpia el estado para permitir reintentos.
 *
 * Almacenamiento en memoria con TTL. En producción, reemplazar por Redis.
 */
export function idempotency(options?: { ttlMs?: number }): RequestHandler {
  const ttl = options?.ttlMs ?? 24 * 60 * 60 * 1000;
  const cache = new Map<string, CachedResponse | 'processing'>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache) {
      if (value !== 'processing' && now - value.timestamp > ttl) {
        cache.delete(key);
      }
    }
  }, Math.min(ttl / 2, 60_000));
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      next();
      return;
    }

    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    if (!idempotencyKey) {
      const requestId = req.headers['x-request-id'] as string;
      res.status(400).json(
        ApiResponse.fail('Se requiere Idempotency-Key para operaciones de mutación', [
          { code: 'MISSING_IDEMPOTENCY_KEY', message: 'Header Idempotency-Key es requerido' },
        ]).withRequestId(requestId),
      );
      return;
    }

    const cached = cache.get(idempotencyKey);

    if (cached === 'processing') {
      const requestId = req.headers['x-request-id'] as string;
      res.status(409).json(
        ApiResponse.fail('Solicitud en proceso', [
          { code: 'REQUEST_IN_FLIGHT', message: 'La solicitud con esta Idempotency-Key está siendo procesada' },
        ]).withRequestId(requestId),
      );
      return;
    }

    if (cached) {
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    cache.set(idempotencyKey, 'processing');

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(idempotencyKey, {
          statusCode: res.statusCode,
          body,
          timestamp: Date.now(),
        });
      } else {
        cache.delete(idempotencyKey);
      }
      return originalJson(body);
    }) as typeof res.json;

    next();
  };
}
