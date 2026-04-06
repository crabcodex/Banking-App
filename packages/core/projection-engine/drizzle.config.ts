import { defineConfig } from 'drizzle-kit';

/** Migraciones para la Read DB (Proyecciones: checkpoints + read models). */
export default defineConfig({
  schema: './packages/core/projection-engine/src/schemas/index.ts',
  out: './packages/core/projection-engine/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_READ_URL!,
  },
});
