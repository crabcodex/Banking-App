import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError } from '@bank/shared';

/**
 * Middleware global de errores.
 * Mapea DomainError -> HTTP status code. Errores desconocidos -> 500.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof ValidationError) {
    res.status(err.httpStatus).json({
      success: false,
      message: err.message,
      data: null,
      errors: err.errors,
      requestId,
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(err.httpStatus).json({
      success: false,
      message: err.message,
      data: null,
      errors: [{ code: err.code, message: err.message }],
      requestId,
    });
    return;
  }

  // Error no controlado
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    data: null,
    errors: [{ code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }],
    requestId,
  });
}
