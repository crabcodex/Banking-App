import { DomainEvent } from '../../domain/DomainEvent';
import { StreamVersion, EventStream } from '../../domain/types';
import { StoredEvent } from './StoredEvent';

/**
 * Contrato del Event Store.
 *
 * - loadStream: carga todos los eventos de un stream (agregado).
 * - appendToStream: persiste eventos nuevos con OCC (Optimistic Concurrency Control).
 *   Si expectedVersion no coincide con la version actual, lanza ConcurrencyError.
 * - readAllFromPosition: lectura global para proyecciones catch-up.
 */
export interface IEventStore {
  loadStream(streamId: string): Promise<EventStream<StoredEvent>>;
  appendToStream(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: StreamVersion,
  ): Promise<void>;
  readAllFromPosition(position: number, limit: number): Promise<StoredEvent[]>;
}
