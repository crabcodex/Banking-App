import postgres, { type Sql } from 'postgres';
import { drizzle as pgDrizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { injectable } from 'tsyringe';
import * as schema from './schemas/index';

export type ReadDb = PostgresJsDatabase<typeof schema>;

/**
 * Proveedor de Drizzle para la base de datos de LECTURA.
 *
 * Gestiona las proyecciones (read models) y sus checkpoints.
 *
 * - Con connectionUrl: PostgreSQL real (Neon / producción).
 * - Sin connectionUrl: PGlite en memoria (tests).
 *
 * Las migraciones se aplican explícitamente con `pnpm db:migrate`.
 */
@injectable()
export class ReadDrizzleProvider {
  private sql: Sql | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PGlite solo se importa dinámicamente en tests
  private pgliteClient: any = null;
  private _db: ReadDb | null = null;

  get db(): ReadDb {
    if (!this._db) throw new Error('ReadDrizzleProvider no inicializado. Llamar initialize() primero.');
    return this._db;
  }

  async initialize(connectionUrl?: string): Promise<void> {
    if (connectionUrl) {
      this.sql = postgres(connectionUrl);
      this._db = pgDrizzle(this.sql, { schema });
    } else {
      // PGlite en memoria para tests — aplica migraciones automáticamente
      const { PGlite } = await import('@electric-sql/pglite');
      const pgliteDrizzle = await import('drizzle-orm/pglite');
      const pgliteMigrator = await import('drizzle-orm/pglite/migrator');
      const path = await import('path');
      const client = new PGlite();
      this.pgliteClient = client;
      this._db = pgliteDrizzle.drizzle(client, { schema }) as unknown as ReadDb;
      const migrationsFolder = path.join(import.meta.dirname, '..', 'drizzle');
      await pgliteMigrator.migrate(this._db as never, { migrationsFolder });
    }
  }

  /** Aplica migraciones en PGlite (solo tests). No-op si es PostgreSQL real. */
  async runMigrations(folder: string): Promise<void> {
    if (!this._db) throw new Error('ReadDrizzleProvider no inicializado.');
    if (this.sql) return; // PostgreSQL real — migraciones se aplican con db:migrate
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(this._db as never, { migrationsFolder: folder });
  }

  async close(): Promise<void> {
    if (this.sql) {
      await this.sql.end();
      this.sql = null;
    }
    if (this.pgliteClient) {
      await this.pgliteClient.close();
      this.pgliteClient = null;
    }
    this._db = null;
  }
}
