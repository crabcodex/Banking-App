import { pgTable, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

/** Tabla de snapshots - un snapshot por agregado (upsert). */
export const snapshots = pgTable('snapshots', {
  aggregateId: text('aggregate_id').primaryKey(),
  version: integer('version').notNull(),
  state: jsonb('state').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
