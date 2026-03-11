import { DomainError } from './DomainError';

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'No autenticado') {
    super('UNAUTHORIZED', message, 401);
  }
}
