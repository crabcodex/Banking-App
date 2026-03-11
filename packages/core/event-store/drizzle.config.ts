import { defineConfig } from 'drizzle-kit';
import path from 'path';

const base = path.resolve(import.meta.dirname);

export default defineConfig({
  schema: path.join(base, 'src/schemas/index.ts'),
  out: path.join(base, 'drizzle'),
  dialect: 'postgresql',
});
