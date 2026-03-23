import { defineConfig } from 'drizzle-kit';

/** Migraciones para el read model del bounded context Accounts. */
export default defineConfig({
  schema: './packages/contexts/accounts/src/infrastructure/schemas/accountsReadModel.ts',
  out: './packages/contexts/accounts/drizzle',
  dialect: 'postgresql',
});
