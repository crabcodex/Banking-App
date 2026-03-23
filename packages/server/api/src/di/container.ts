import 'reflect-metadata';
import { container } from 'tsyringe';
import pino from 'pino';
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore, InMemoryEventBus } from '@bank/event-store';
import { ReadDrizzleProvider, ProjectionRunner, DrizzleProjectionCheckpoint } from '@bank/projection-engine';
import { registerAccountsContext } from '@bank/accounts';
import { CommandBus } from '../infrastructure/CommandBus';
import { LoggingMiddleware } from '../infrastructure/middleware/LoggingMiddleware';
import type { EnvConfig } from '../config/env';

/**
 * Configura el contenedor DI raiz.
 * Se invoca una sola vez al iniciar la aplicacion.
 */
export async function setupContainer(config: EnvConfig): Promise<void> {
  const start = performance.now();

  // Inicializar ambas DBs en paralelo
  const writeProvider = new WriteDrizzleProvider();
  const readProvider = new ReadDrizzleProvider();
  await Promise.all([
    writeProvider.initialize(config.PGLITE_WRITE_DIR),
    readProvider.initialize(config.PGLITE_READ_DIR),
  ]);

  console.log(`DBs inicializadas en ${(performance.now() - start).toFixed(0)}ms`);

  container.register('WriteDrizzleProvider', { useValue: writeProvider });
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

  // -- Bounded Contexts --
  await registerAccountsContext();

  // -- CommandBus con pipeline de middlewares --
  const logger = pino({ level: config.NODE_ENV === 'test' ? 'silent' : 'info' });
  const commandBus = new CommandBus(container);
  commandBus.use(new LoggingMiddleware(logger));
  commandBus.register('OpenAccount', 'OpenAccountHandler');
  container.register('ICommandBus', { useValue: commandBus });
}
