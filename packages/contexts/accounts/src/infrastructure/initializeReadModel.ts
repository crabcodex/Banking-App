import { migrate } from 'drizzle-orm/pglite/migrator';
import type { ReadDrizzleProvider } from '@bank/projection-engine';
import path from 'path';

const migrationsFolder = path.join(import.meta.dirname, '..', '..', 'drizzle');

/**
 * Aplica las migraciones del read model de cuentas.
 * Usa drizzle-kit migrations (misma estrategia que event-store y projection-engine).
 * Se invoca durante el registro del bounded context (composición).
 */
export async function migrateAccountsReadModel(readProvider: ReadDrizzleProvider): Promise<void> {
  await migrate(readProvider.db, { migrationsFolder });
}
