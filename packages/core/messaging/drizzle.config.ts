import { defineConfig } from 'drizzle-kit';

/** Migraciones para el checkpoint del Outbox Relay (vive en la Write DB). */
export default defineConfig({
  schema: './packages/core/messaging/src/schemas/index.ts',
  out: './packages/core/messaging/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_WRITE_URL!,
  },
});
