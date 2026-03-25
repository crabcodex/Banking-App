import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['../../../vitest.setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    passWithNoTests: true,
    hookTimeout: 90000,
    testTimeout: 90000,
  },
});
