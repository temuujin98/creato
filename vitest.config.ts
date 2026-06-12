import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    // Mock 'server-only' so tests can import server modules without Next.js runtime
    alias: {
      'server-only': resolve(__dirname, 'src/__tests__/__mocks__/server-only.ts'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'server-only': resolve(__dirname, 'src/__tests__/__mocks__/server-only.ts'),
    },
  },
})
