import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Provide minimum required env vars so env.ts does not throw on import
    env: {
      DATABASE_URL: 'file:./test.db',
      AUTH_SECRET: 'test-secret-key-for-vitest-only',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_URL_INTERNAL: 'http://localhost:3000',
      NODE_ENV: 'test',
    },
  },
})
