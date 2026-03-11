import { DomainEvent } from './DomainEvent';
import { StreamVersion } from './types';

/**
 * Snapshot del estado de un agregado en un punto especifico.
 * Permite reconstruir el estado sin reproducir todos los eventos.
 */
export interface AggregateSnapshot {
  readonly aggregateId: string;
  readonly version: StreamVersion;
  readonly state: Record<string, unknown>;
}

/**
 * Raiz de agregado con soporte para Event Sourcing.
 *
 * Patron:
 * - apply(event) registra un evento no confirmado y muta el estado via when().
 * - when(event) es puro: aplica la mutacion de estado.
 * - loadFromHistory(events) reconstruye el estado reproduciendo eventos.
 * - takeSnapshot() / restoreFromSnapshot() para optimizar streams largos.
 */
export abstract class AggregateRoot<TEvent extends DomainEvent> {
  private _uncommittedEvents: TEvent[] = [];
  private _version: StreamVersion = -1;

  get uncommittedEvents(): ReadonlyArray<TEvent> {
    return this._uncommittedEvents;
  }

  get version(): StreamVersion {
    return this._version;
  }

  /** Aplica un evento: muta estado y lo marca como no confirmado. */
  protected apply(event: TEvent): void {
    this.when(event);
    this._uncommittedEvents.push(event);
  }

  /** Mutacion pura de estado. Cada agregado concreto implementa su logica. */
  protected abstract when(event: TEvent): void;

  /** Limpia eventos no confirmados tras persistir en el EventStore. */
  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  /** Reconstruye el agregado reproduciendo una secuencia de eventos historicos. */
  loadFromHistory(events: TEvent[], version: StreamVersion): void {
    for (const event of events) {
      this.when(event);
    }
    this._version = version;
  }

  /** Serializa el estado actual para snapshot. Cada agregado define que serializar. */
  abstract takeSnapshot(): AggregateSnapshot;

  /** Restaura estado desde un snapshot. */
  abstract restoreFromSnapshot(snapshot: AggregateSnapshot): void;

  /** Restaura la version del stream tras cargar snapshot. */
  protected setVersion(version: StreamVersion): void {
    this._version = version;
  }
}
