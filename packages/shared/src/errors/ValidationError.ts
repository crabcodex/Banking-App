import { DomainError } from './DomainError';

/**
 * Error de validacion. Soporta multiples errores de campo.
 */
export class ValidationError extends DomainError {
  constructor(
    readonly errors: Array<{ field: string; message: string }>,
  ) {
    super('VALIDATION_ERROR', `Errores de validacion: ${errors.map((e) => e.message).join(', ')}`, 400);
  }
}
