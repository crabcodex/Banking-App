import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super('NOT_FOUND', `${entity} con id ${id} no encontrado`, 404);
  }
}
