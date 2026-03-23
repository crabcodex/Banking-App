import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['../../../vitest.setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    passWithNoTests: true,
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
