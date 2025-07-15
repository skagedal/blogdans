import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    projects: [
      // Browser tests
      {
        test: {
          name: 'browser',
          setupFiles: ['./vitest.setup.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
            headless: true,
          },
          globals: true,
          include: ['**/*.browser.test.{ts,tsx}'],
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
        esbuild: {
          jsx: 'automatic',
        },
      },
      // Node.js tests
      {
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['**/*.node.test.ts'],
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
        esbuild: {
          jsx: 'automatic',
        },
      },
    ],
  },
  optimizeDeps: {
    include: [ 'react/jsx-dev-runtime' ]
  }
})