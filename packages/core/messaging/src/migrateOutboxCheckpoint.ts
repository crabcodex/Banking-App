import type { WriteDrizzleProvider } from '@bank/event-store';
import path from 'path';

const migrationsFolder = path.join(import.meta.dirname, '..', 'drizzle');

/**
 * Aplica las migraciones del outbox checkpoint en la Write DB.
 * Se invoca durante setupContainer() antes de iniciar el OutboxRelay.
 */
export async function migrateOutboxCheckpoint(writeProvider: WriteDrizzleProvider): Promise<void> {
  await writeProvider.runMigrations(migrationsFolder);
}
