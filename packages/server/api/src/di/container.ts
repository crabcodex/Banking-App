import 'reflect-metadata';
import { container } from 'tsyringe';
import pino from 'pino';
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore, InMemoryEventBus } from '@bank/event-store';
import { ReadDrizzleProvider, ProjectionRunner, DrizzleProjectionCheckpoint } from '@bank/projection-engine';
import { registerAccountsContext } from '@bank/accounts';
import { RabbitMQConnection, OutboxRelay } from '@bank/messaging';
import { CommandBus } from '../bus/CommandBus';
import { LoggingMiddleware } from '../bus/middleware/LoggingMiddleware';
import { JoseTokenVerifier } from '../adapters/JoseTokenVerifier';
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
    writeProvider.initialize(config.DATABASE_WRITE_URL),
    readProvider.initialize(config.DATABASE_READ_URL),
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

  // Fijar como singleton para que todos los bounded contexts compartan la misma instancia
  const runner = container.resolve(ProjectionRunner);
  container.register(ProjectionRunner, { useValue: runner });

  // -- Bounded Contexts --
  await registerAccountsContext();

  // Iniciar polling de proyecciones (catch-up desde event store → read model)
  runner.startPolling(config.PROJECTION_POLL_MS);

  // -- Token Verifier --
  // TODO(@bank/identity): Reemplazar JoseTokenVerifier por la implementación real
  // del contexto de Identity cuando esté lista. Solo cambiar este binding.
  const tokenVerifier = new JoseTokenVerifier(config.JWT_PUBLIC_KEY_PATH);
  container.register('ITokenVerifier', { useValue: tokenVerifier });

  // -- CommandBus con pipeline de middlewares --
  const logger = pino({ level: config.NODE_ENV === 'test' ? 'silent' : 'info' });
  const commandBus = new CommandBus(container);
  commandBus.use(new LoggingMiddleware(logger));
  commandBus.register('OpenAccount', 'OpenAccountHandler');
  container.register('ICommandBus', { useValue: commandBus });

  // -- RabbitMQ + Outbox Relay (solo si AMQP_URL está configurada) --
  if (config.AMQP_URL) {
    const rabbitConnection = new RabbitMQConnection({ url: config.AMQP_URL });
    await rabbitConnection.connect();
    container.register('RabbitMQConnection', { useValue: rabbitConnection });

    const eventStore = container.resolve<DrizzleEventStore>('IEventStore');
    const outboxRelay = new OutboxRelay(eventStore, rabbitConnection, writeProvider, {
      pollIntervalMs: config.OUTBOX_POLL_MS,
      batchSize: config.OUTBOX_BATCH_SIZE,
    });
    await outboxRelay.start();
    container.register('OutboxRelay', { useValue: outboxRelay });

    console.log('RabbitMQ conectado + OutboxRelay iniciado');
  } else {
    console.log('AMQP_URL no configurada — OutboxRelay desactivado');
  }
}
