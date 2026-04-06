import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core';

/** Modelo de lectura: lista de cuentas. Proyección desde AccountOpened (y futuros eventos). */
export const accountsReadModel = pgTable('accounts_read', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  type: text('type').notNull(),
  clabe: text('clabe').notNull(),
  currency: text('currency').notNull(),
  balance: numeric('balance', { precision: 18, scale: 2 }).notNull(),
  dailyLimit: numeric('daily_limit', { precision: 18, scale: 2 }).notNull(),
  status: text('status').notNull(),
  alias: text('alias').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull(),
});
