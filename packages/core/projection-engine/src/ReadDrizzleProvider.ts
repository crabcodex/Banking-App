import { PGlite } from '@electric-sql/pglite';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { injectable } from 'tsyringe';
import path from 'path';
import * as schema from './schemas/index';

export type ReadDb = PgliteDatabase<typeof schema>;

const migrationsFolder = path.join(import.meta.dirname, '..', 'drizzle');

/**
 * Proveedor de Drizzle sobre PGlite para la base de datos de LECTURA.
 *
 * Gestiona las proyecciones (read models) y sus checkpoints.
 *
 * - Sin dataDir: base de datos en memoria (ideal para tests).
 * - Con dataDir: persiste en disco (desarrollo local).
 *
 * Aplica migraciones generadas por drizzle-kit (npm run db:generate:read).
 */
@injectable()
export class ReadDrizzleProvider {
  private client: PGlite | null = null;
  private _db: ReadDb | null = null;

  get db(): ReadDb {
    if (!this._db) throw new Error('ReadDrizzleProvider no inicializado. Llamar initialize() primero.');
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
