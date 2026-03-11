import { DomainError } from './DomainError';

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Accion no permitida') {
    super('FORBIDDEN', message, 403);
  }
}
