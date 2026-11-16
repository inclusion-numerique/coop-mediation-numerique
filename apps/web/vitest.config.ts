import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const depuisIci = (chemin: string) =>
  fileURLToPath(new URL(chemin, import.meta.url))

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^server-only$/,
        replacement: depuisIci('./src/libraries/server-only-cli/index.ts'),
      },
    ],
    conditions: ['react-server', 'node'],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    environment: 'node',
    isolate: false,
    setupFiles: ['./vitest.setup.ts'],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: depuisIci('../../junit/web-unit.xml') },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.integration.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/generated/**',
      ],
      reporter: [
        'json',
        ['lcov', { projectRoot: depuisIci('../..') }],
        'text-summary',
      ],
      reportsDirectory: './coverage',
    },
  },
})
