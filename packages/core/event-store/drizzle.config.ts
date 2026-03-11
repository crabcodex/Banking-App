import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  schema: path.join(import.meta.dirname, 'src/schemas/index.ts'),
  out: path.join(import.meta.dirname, 'drizzle'),
  dialect: 'postgresql',
});
