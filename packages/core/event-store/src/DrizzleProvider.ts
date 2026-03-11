import { PGlite } from '@electric-sql/pglite';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';
import { injectable } from 'tsyringe';
import * as schema from './schemas';

export type DrizzleDb = PgliteDatabase<typeof schema>;

/**
 * Proveedor de Drizzle sobre PGlite.
 *
 * - Sin dataDir: base de datos en memoria (ideal para tests).
 * - Con dataDir: persiste en disco (desarrollo local).
 *
 * Crea las tablas con push directo del schema Drizzle.
 * Cuando se migre a PostgreSQL, se reemplaza PGlite por node-postgres
 * y se usa drizzle-kit migrate en vez de push.
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
    await this.pushSchema();
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this._db = null;
    }
  }

  /** Crea tablas directamente desde el schema Drizzle (desarrollo/tests). */
  private async pushSchema(): Promise<void> {
    if (!this.client) return;

    await this.client.query(`
      CREATE TABLE IF NOT EXISTS events (
        global_position BIGSERIAL PRIMARY KEY,
        stream_id       TEXT    NOT NULL,
        stream_version  INTEGER NOT NULL,
        event_type      TEXT    NOT NULL,
        data            JSONB   NOT NULL,
        metadata        JSONB   NOT NULL,
        occurred_on     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (stream_id, stream_version)
      );
      CREATE INDEX IF NOT EXISTS idx_events_stream_id ON events (stream_id, stream_version);
      CREATE INDEX IF NOT EXISTS idx_events_event_type ON events (event_type);

      CREATE TABLE IF NOT EXISTS snapshots (
        aggregate_id TEXT    PRIMARY KEY,
        version      INTEGER NOT NULL,
        state        JSONB   NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projection_checkpoints (
        projection_name TEXT   PRIMARY KEY,
        last_position   BIGINT NOT NULL DEFAULT 0,
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
}
