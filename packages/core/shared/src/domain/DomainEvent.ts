import { EventMetadata } from './types';

/**
 * Clase base para eventos de dominio en Event Sourcing.
 * Cada evento representa un hecho que ya ocurrio en el sistema.
 */
export abstract class DomainEvent {
  readonly occurredOn: Date;

  constructor(
    readonly eventType: string,
    readonly aggregateId: string,
    readonly data: Record<string, unknown>,
    readonly metadata: EventMetadata,
  ) {
    this.occurredOn = new Date();
  }
}
