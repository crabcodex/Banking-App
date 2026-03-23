import { pgTable, text, bigint, timestamp } from 'drizzle-orm/pg-core';

/**
 * Checkpoint del Outbox Relay.
 * Registra la última posición global del Event Store publicada a RabbitMQ.
 * Vive en la Write DB para consistencia con la tabla de eventos.
 */
export const outboxCheckpoint = pgTable('outbox_checkpoint', {
  id: text('id').primaryKey().default('outbox'),
  lastPosition: bigint('last_position', { mode: 'number' }).notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
