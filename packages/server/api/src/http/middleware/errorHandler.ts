import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError } from '@bank/shared';
import { ApiResponse } from '../shared/ApiResponse';

/**
 * Middleware global de errores.
 * Mapea DomainError -> HTTP status code usando ApiResponse estandarizado.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof ValidationError) {
    const errors = err.errors.map(e => ({ code: 'VALIDATION_ERROR', message: `${e.field}: ${e.message}` }));
    const response = ApiResponse.fail(err.message, errors).withRequestId(requestId);
    res.status(err.httpStatus).json(response);
    return;
  }

  if (err instanceof DomainError) {
    const response = ApiResponse.fail(err.message, [{ code: err.code, message: err.message }]).withRequestId(requestId);
    res.status(err.httpStatus).json(response);
    return;
  }

  // Error no controlado
  console.error('Error no controlado:', err);
  const response = ApiResponse.fail(
    'Error interno del servidor',
    [{ code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }],
  ).withRequestId(requestId);
  res.status(500).json(response);
}
