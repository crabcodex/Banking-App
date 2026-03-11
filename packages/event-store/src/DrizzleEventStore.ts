import { inject, injectable } from 'tsyringe';
import { eq, gt, asc } from 'drizzle-orm';
import type { IEventStore, StoredEvent, EventStream, DomainEvent, StreamVersion } from '@bank/shared';
import { ConcurrencyError } from '@bank/shared';
import { DrizzleProvider } from './PgliteDbProvider';
import { events } from './schema';

/**
 * Implementacion de IEventStore con Drizzle + PGlite.
 *
 * OCC: appendToStream verifica que stream_version sea contiguo.
 * Si existe conflicto en UNIQUE(stream_id, stream_version), lanza ConcurrencyError.
 */
@injectable()
export class DrizzleEventStore implements IEventStore {
  constructor(@inject('DrizzleProvider') private readonly provider: DrizzleProvider) {}

  async loadStream(streamId: string): Promise<EventStream<StoredEvent>> {
    const rows = await this.provider.db
      .select()
      .from(events)
      .where(eq(events.streamId, streamId))
      .orderBy(asc(events.streamVersion));

    const mapped: StoredEvent[] = rows.map((r) => ({
      globalPosition: r.globalPosition,
      streamId: r.streamId,
      streamVersion: r.streamVersion,
      eventType: r.eventType,
      data: r.data as Record<string, unknown>,
      metadata: r.metadata as Record<string, unknown> as any,
      occurredOn: r.occurredOn,
    }));

    const version = mapped.length > 0 ? mapped[mapped.length - 1].streamVersion : -1;
    return { events: mapped, version };
  }

  async appendToStream(
    streamId: string,
    domainEvents: DomainEvent[],
    expectedVersion: StreamVersion,
  ): Promise<void> {
    for (let i = 0; i < domainEvents.length; i++) {
      const event = domainEvents[i];
      const nextVersion = expectedVersion + 1 + i;

      try {
        await this.provider.db.insert(events).values({
          streamId,
          streamVersion: nextVersion,
          eventType: event.eventType,
          data: event.data,
          metadata: event.metadata as any,
          occurredOn: event.occurredOn,
        });
      } catch (error: any) {
        if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
          const current = await this.loadStream(streamId);
          throw new ConcurrencyError(streamId, expectedVersion, current.version);
        }
        throw error;
      }
    }
  }

  async readAllFromPosition(position: number, limit: number): Promise<StoredEvent[]> {
    const rows = await this.provider.db
      .select()
      .from(events)
      .where(gt(events.globalPosition, position))
      .orderBy(asc(events.globalPosition))
      .limit(limit);

    return rows.map((r) => ({
      globalPosition: r.globalPosition,
      streamId: r.streamId,
      streamVersion: r.streamVersion,
      eventType: r.eventType,
      data: r.data as Record<string, unknown>,
      metadata: r.metadata as Record<string, unknown> as any,
      occurredOn: r.occurredOn,
    }));
  }
}
