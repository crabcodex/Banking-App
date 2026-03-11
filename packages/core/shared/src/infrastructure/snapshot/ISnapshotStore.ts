import { AggregateSnapshot } from '../../domain/AggregateRoot';

/**
 * Contrato del Snapshot Store.
 * Almacena y recupera snapshots para evitar reproducir streams completos.
 */
export interface ISnapshotStore {
  load(aggregateId: string): Promise<AggregateSnapshot | null>;
  save(snapshot: AggregateSnapshot): Promise<void>;
}
