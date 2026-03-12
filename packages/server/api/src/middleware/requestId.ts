import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Agrega un requestId unico a cada peticion.
 * Disponible en req.headers['x-request-id'] para trazabilidad.
 */
export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = randomUUID();
  }
  next();
}
