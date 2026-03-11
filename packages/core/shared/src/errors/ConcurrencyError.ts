import { DomainError } from './DomainError';

/**
 * Error de concurrencia optimista (OCC).
 * Se lanza cuando la version esperada del stream no coincide con la actual.
 */
export class ConcurrencyError extends DomainError {
  constructor(aggregateId: string, expectedVersion: number, actualVersion: number) {
    super(
      'CONCURRENCY_CONFLICT',
      `Conflicto de concurrencia en agregado ${aggregateId}: esperada version ${expectedVersion}, actual ${actualVersion}`,
      409,
    );
  }
}
