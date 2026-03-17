import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const customerProjection = pgTable("customer_projection", {
  customerId: text("customer_id").primaryKey(),
  email: text("email").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
});