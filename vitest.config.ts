import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 30000, // 30 seconds for integration tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
