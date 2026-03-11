import { inject, injectable } from 'tsyringe';
import { eq } from 'drizzle-orm';
import type { ISnapshotStore, AggregateSnapshot } from '@bank/shared';
import { DrizzleProvider } from './DrizzleProvider';
import { snapshots } from './schemas/index';

/**
 * Implementacion de ISnapshotStore con Drizzle + PGlite.
 * Usa upsert (onConflictDoUpdate) para mantener un solo snapshot por agregado.
 */
@injectable()
export class DrizzleSnapshotStore implements ISnapshotStore {
  constructor(@inject('DrizzleProvider') private readonly provider: DrizzleProvider) {}

  async load(aggregateId: string): Promise<AggregateSnapshot | null> {
    const rows = await this.provider.db
      .select()
      .from(snapshots)
      .where(eq(snapshots.aggregateId, aggregateId));

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      aggregateId: row.aggregateId,
      version: row.version,
      state: row.state as Record<string, unknown>,
    };
  }

  async save(snapshot: AggregateSnapshot): Promise<void> {
    await this.provider.db
      .insert(snapshots)
      .values({
        aggregateId: snapshot.aggregateId,
        version: snapshot.version,
        state: snapshot.state,
      })
      .onConflictDoUpdate({
        target: snapshots.aggregateId,
        set: {
          version: snapshot.version,
          state: snapshot.state,
          createdAt: new Date(),
        },
      });
  }
}
