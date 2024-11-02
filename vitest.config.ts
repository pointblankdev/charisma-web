import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: path.resolve(__dirname, './vitest.setup.ts'),
    // Add test file patterns
    include: ['**/*.test.ts', '**/*.test.tsx'],
    alias: {
      '@lib': path.resolve(__dirname, './lib'),
      '@components': path.resolve(__dirname, './components'),
      '@public': path.resolve(__dirname, './public')
    }
  }
});
