import { pgTable, text, bigint, timestamp } from 'drizzle-orm/pg-core';

/** Tabla de checkpoints para proyecciones catch-up. */
export const projectionCheckpoints = pgTable('projection_checkpoints', {
  projectionName: text('projection_name').primaryKey(),
  lastPosition: bigint('last_position', { mode: 'number' }).notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
