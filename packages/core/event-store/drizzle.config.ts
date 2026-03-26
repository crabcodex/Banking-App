import { defineConfig } from 'drizzle-kit';

/** Migraciones para la Write DB (Event Store: events + snapshots). */
export default defineConfig({
  schema: './packages/core/event-store/src/schemas/index.ts',
  out: './packages/core/event-store/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_WRITE_URL!,
  },
});
