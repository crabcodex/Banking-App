import { DomainEvent } from '../../domain/DomainEvent';
import { EventMetadata } from '../../domain/types';

/**
 * Evento tal como se almacena en el Event Store.
 * Incluye posicion global para proyecciones catch-up.
 */
export interface StoredEvent {
  readonly globalPosition: number;
  readonly streamId: string;
  readonly streamVersion: number;
  readonly eventType: string;
  readonly data: Record<string, unknown>;
  readonly metadata: EventMetadata;
  readonly occurredOn: Date;
}
