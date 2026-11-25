import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const depuisIci = (chemin: string) =>
  fileURLToPath(new URL(chemin, import.meta.url))

process.loadEnvFile(depuisIci('./.env'))

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^server-only$/,
        replacement: depuisIci('./src/libraries/server-only-cli'),
      },
    ],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
    isolate: false,
    server: { deps: { inline: ['@arckit/nextjs'] } },
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: depuisIci('./junit/web.xml') },
    projects: [
      {
        extends: true,
        resolve: { conditions: ['react-server', 'node'] },
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['src/**/*.integration.ts'],
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.integration.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.steps.ts',
        'src/**/*.cucumber.ts',
        'src/app/**/page.test.ts',
        'src/app/**/route.test.ts',
        'src/**/*.cy.tsx',
        'src/generated/**',
      ],
      reporter: ['json', 'lcov', 'text-summary'],
      reportsDirectory: depuisIci('./coverage'),
    },
  },
})
