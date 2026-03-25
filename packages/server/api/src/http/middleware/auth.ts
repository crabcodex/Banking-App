import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ITokenVerifier, TokenPayload } from '@bank/shared';
import { ApiResponse } from '../shared/ApiResponse';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware factory de autenticación.
 * Recibe un ITokenVerifier — no conoce la implementación concreta (JWT, opaque, etc.).
 * La responsabilidad de verificar tokens pertenece al contexto de Identity.
 */
export function requireAuth(tokenVerifier: ITokenVerifier): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      const requestId = req.headers['x-request-id'] as string;
      res.status(401).json(
        ApiResponse.fail('Token no proporcionado', [
          { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' },
        ]).withRequestId(requestId),
      );
      return;
    }

    try {
      req.user = await tokenVerifier.verify(header.slice(7));
      next();
    } catch {
      const requestId = req.headers['x-request-id'] as string;
      res.status(401).json(
        ApiResponse.fail('Token inválido o expirado', [
          { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' },
        ]).withRequestId(requestId),
      );
    }
  };
}

/**
 * Middleware que verifica que el usuario autenticado tenga uno de los roles requeridos.
 * Debe usarse después de requireAuth.
 */
export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const requestId = req.headers['x-request-id'] as string;
      res.status(401).json(
        ApiResponse.fail('No autenticado', [
          { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' },
        ]).withRequestId(requestId),
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      const requestId = req.headers['x-request-id'] as string;
      res.status(403).json(
        ApiResponse.fail('Acceso denegado', [
          { code: 'FORBIDDEN', message: 'No tiene permisos para esta operación' },
        ]).withRequestId(requestId),
      );
      return;
    }

    next();
  };
}
