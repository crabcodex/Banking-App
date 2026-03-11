import { PGlite } from '@electric-sql/pglite';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { injectable } from 'tsyringe';
import path from 'path';
import * as schema from './schemas/index';

export type DrizzleDb = PgliteDatabase<typeof schema>;

const migrationsFolder = path.join(import.meta.dirname, '..', 'drizzle');

/**
 * Proveedor de Drizzle sobre PGlite.
 *
 * - Sin dataDir: base de datos en memoria (ideal para tests).
 * - Con dataDir: persiste en disco (desarrollo local).
 *
 * Aplica migraciones generadas por drizzle-kit (npm run db:generate).
 * Los schemas en src/schemas/ son la fuente de verdad.
 */
@injectable()
export class DrizzleProvider {
  private client: PGlite | null = null;
  private _db: DrizzleDb | null = null;

  get db(): DrizzleDb {
    if (!this._db) throw new Error('DrizzleProvider no inicializado. Llamar initialize() primero.');
    return this._db;
  }

  async initialize(dataDir?: string): Promise<void> {
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
