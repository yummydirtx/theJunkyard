import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Configure test environment to better handle React updates
    pool: 'forks',
    // Increase timeout for async operations
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
