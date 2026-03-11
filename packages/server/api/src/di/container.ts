import 'reflect-metadata';
import { container } from 'tsyringe';
import { DrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore, InMemoryEventBus } from '@bank/event-store';
import { ProjectionRunner, DrizzleProjectionCheckpoint } from '@bank/projection-engine';
import type { EnvConfig } from '../config/env';

/**
 * Configura el contenedor DI raiz.
 * Se invoca una sola vez al iniciar la aplicacion.
 */
export async function setupContainer(config: EnvConfig): Promise<void> {
  // Base de datos Drizzle + PGlite
  const drizzleProvider = new DrizzleProvider();
  await drizzleProvider.initialize(config.PGLITE_DATA_DIR);
  container.register('DrizzleProvider', { useValue: drizzleProvider });

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
