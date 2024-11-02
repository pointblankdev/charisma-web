import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    // Add test file patterns
    include: ['**/*.test.ts', '**/*.test.tsx']
  }
});
