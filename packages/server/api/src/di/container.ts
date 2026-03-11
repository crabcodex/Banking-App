import 'reflect-metadata';
import { container } from 'tsyringe';
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore, InMemoryEventBus } from '@bank/event-store';
import { ReadDrizzleProvider, ProjectionRunner, DrizzleProjectionCheckpoint } from '@bank/projection-engine';
import type { EnvConfig } from '../config/env';

/**
 * Configura el contenedor DI raiz.
 * Se invoca una sola vez al iniciar la aplicacion.
 */
export async function setupContainer(config: EnvConfig): Promise<void> {
  // Write DB — Event Store (events + snapshots)
  const writeProvider = new WriteDrizzleProvider();
  await writeProvider.initialize(config.PGLITE_WRITE_DIR);
  container.register('WriteDrizzleProvider', { useValue: writeProvider });

  // Read DB — Proyecciones (read models + checkpoints)
  const readProvider = new ReadDrizzleProvider();
  await readProvider.initialize(config.PGLITE_READ_DIR);
  container.register('ReadDrizzleProvider', { useValue: readProvider });

  // Event Store
  container.register('IEventStore', { useClass: DrizzleEventStore });

  // Snapshot Store
  container.register('ISnapshotStore', { useClass: DrizzleSnapshotStore });

  // Event Bus
  container.register('IEventBus', { useClass: InMemoryEventBus });

  // Projection Engine
  container.register(DrizzleProjectionCheckpoint, { useClass: DrizzleProjectionCheckpoint });
  container.register(ProjectionRunner, { useClass: ProjectionRunner });
}
