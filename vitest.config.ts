import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import {
  FICHIERS_COUVERTS,
  FICHIERS_EXCLUS,
} from './scripts/couverture/perimetre.mjs'

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
      include: FICHIERS_COUVERTS,
      exclude: FICHIERS_EXCLUS,
      reporter: ['json', 'lcov', 'text-summary'],
      reportsDirectory: depuisIci('./coverage'),
    },
  },
})
