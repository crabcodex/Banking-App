import { pgTable, text, integer, bigserial, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

/** Tabla de eventos - append-only, un evento por fila. */
export const events = pgTable(
  'events',
  {
    globalPosition: bigserial('global_position', { mode: 'number' }).primaryKey(),
    streamId: text('stream_id').notNull(),
    streamVersion: integer('stream_version').notNull(),
    eventType: text('event_type').notNull(),
    data: jsonb('data').notNull(),
    metadata: jsonb('metadata').notNull(),
    occurredOn: timestamp('occurred_on', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_stream_version').on(table.streamId, table.streamVersion),
    index('idx_events_stream_id').on(table.streamId, table.streamVersion),
    index('idx_events_event_type').on(table.eventType),
  ],
);
