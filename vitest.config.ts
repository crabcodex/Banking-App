import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/**/src/**/*.ts'],
      exclude: ['**/index.ts', '**/*.d.ts'],
      thresholds: {
        statements: 80,
      },
    },
  },
});
