import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const depuisIci = (chemin: string) =>
  fileURLToPath(new URL(chemin, import.meta.url))

const paquet = (name: string, root: string) => ({
  extends: true,
  test: {
    name,
    root: depuisIci(root),
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
  },
})

export default defineConfig({
  resolve: { tsconfigPaths: true },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
    isolate: false,
    setupFiles: [depuisIci('./vitest.setup.ts')],
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: depuisIci('./junit/packages.xml') },
    projects: [
      paquet('cli', './apps/cli'),
      paquet('config', './packages/config'),
      paquet('emails', './packages/emails'),
      paquet('fixtures', './packages/fixtures'),
      paquet('ui', './packages/ui'),
    ],
    coverage: {
      provider: 'v8',
      include: [
        'apps/cli/src/**/*.{ts,tsx}',
        'packages/{config,emails,fixtures,ui}/src/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.spec.{ts,tsx}', '**/*.stories.{ts,tsx}'],
      reporter: ['json', 'lcov', 'text-summary'],
      reportsDirectory: depuisIci('./coverage'),
    },
  },
})
