import 'reflect-metadata';
import { container } from 'tsyringe';
import { Argon2Service } from "@bank/identity";
import { WriteDrizzleProvider, DrizzleEventStore, DrizzleSnapshotStore, InMemoryEventBus } from '@bank/event-store';
import { ReadDrizzleProvider, ProjectionRunner, DrizzleProjectionCheckpoint } from '@bank/projection-engine';
import type { EnvConfig } from '../config/env';
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "path";
import { fileURLToPath } from "url";


/**
 * Configura el contenedor DI raiz.
 * Se invoca una sola vez al iniciar la aplicacion.
 */
export async function setupContainer(config: EnvConfig): Promise<void> {
  const start = performance.now();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const migrationsPath = path.resolve(__dirname, "../../../../../drizzle");
  // Inicializar ambas DBs en paralelo
  const writeProvider = new WriteDrizzleProvider();
  const readProvider = new ReadDrizzleProvider();
  await Promise.all([
    writeProvider.initialize(config.PGLITE_WRITE_DIR),
    readProvider.initialize(config.PGLITE_READ_DIR),
  ]);

  console.log("MIGRATIONS PATH:", migrationsPath);

  await migrate(readProvider.db, {
  migrationsFolder: migrationsPath
});

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

   // 🔐 Password Hashing
  container.registerSingleton("Argon2Service", Argon2Service);
  

}
