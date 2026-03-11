import { PGlite } from '@electric-sql/pglite';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { injectable } from 'tsyringe';
import { mkdirSync } from 'fs';
import path from 'path';
import * as schema from './schemas/index';

export type WriteDb = PgliteDatabase<typeof schema>;

const migrationsFolder = path.join(import.meta.dirname, '..', 'drizzle');

/**
 * Proveedor de Drizzle sobre PGlite para la base de datos de ESCRITURA.
 *
 * Gestiona el Event Store (events + snapshots).
 *
 * - Sin dataDir: base de datos en memoria (ideal para tests).
 * - Con dataDir: persiste en disco (desarrollo local).
 *
 * Aplica migraciones generadas por drizzle-kit (npm run db:generate:write).
 */
@injectable()
export class WriteDrizzleProvider {
  private client: PGlite | null = null;
  private _db: WriteDb | null = null;

  get db(): WriteDb {
    if (!this._db) throw new Error('WriteDrizzleProvider no inicializado. Llamar initialize() primero.');
    return this._db;
  }

  async initialize(dataDir?: string): Promise<void> {
    if (dataDir) mkdirSync(dataDir, { recursive: true });
    this.client = new PGlite(dataDir);
    this._db = drizzle(this.client, { schema });
    await migrate(this._db, { migrationsFolder });
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this._db = null;
    }
  }
}
