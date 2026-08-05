import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'
// Extension explicite : depuis Jest 30, les fichiers de configuration TypeScript sont chargés
// par le résolveur ESM de Node (le dépôt est en "type": "module"), qui n'accepte plus les
// spécificateurs relatifs sans extension. La contrainte se propage à toute la chaîne d'imports
// traversée au chargement de la configuration.
import { createNodeModulesTransformIgnorePattern } from './transformIgnore.ts'

// Jest 29 chargeait ce fichier en CommonJS, où `__dirname` existait et `import.meta` non.
// Jest 30 le charge en module ES : c'est exactement l'inverse.
const dotenvFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../.env',
)

export const testDotenvConfig = () => {
  dotenv.config({ path: dotenvFile })
}

/**
 * Swc jest is not compatible with spy and jest mock. For mocking add the modules in mockableFilePatterns.
 * This will at some point be addressed by @swc/jest and we will remove this compatibility layer.
 */
export const packageJestConfig = ({
  transformIgnorePackages = [],
  testPathIgnorePatterns = [],
  mockableFilePatterns = [],
  customExportConditions,
  testMatch,
}: {
  transformIgnorePackages?: string[]
  testPathIgnorePatterns?: string[]
  mockableFilePatterns?: string[]
  testMatch?: string[]
  customExportConditions?: string[]
}) => {
  testDotenvConfig()

  // Swc jest is not compatible with spy and jest mock. For mocking add the modules here.
  // See https://github.com/swc-project/swc/issues/5059
  // '^.+packages/foo/src/common/cache\\.ts$': 'ts-jest',
  const tsJestTransformPattern = mockableFilePatterns.join('|')

  const transform = tsJestTransformPattern
    ? {
        [tsJestTransformPattern]: 'ts-jest',
        '^.+\\.(t|j)sx?$': '@swc/jest',
      }
    : {
        '^.+\\.(t|j)sx?$': '@swc/jest',
      }

  return {
    moduleFileExtensions: ['js', 'ts', 'tsx'],
    transform,
    transformIgnorePatterns: [
      createNodeModulesTransformIgnorePattern(transformIgnorePackages),
    ],
    setupFilesAfterEnv: ['<rootDir>/../../packages/test/src/jest.setup.ts'],
    testMatch: testMatch ?? [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.integration.ts',
      '**/*.integration.tsx',
    ],
    moduleNameMapper: {
      '@sentry/nextjs':
        '<rootDir>/../../packages/test/src/mocks/sentry.jest.ts',
      '\\.module\\.css$': 'identity-obj-proxy', // Mock CSS modules
      '^@app/web/(.*)$': '<rootDir>/../../apps/web/src/$1',
      '^@app/cli/(.*)$': '<rootDir>/../../apps/cli/src/$1',
      '^@app/cdk/(.*)$': '<rootDir>/../../packages/cdk/src/$1',
      '^@app/config/(.*)$': '<rootDir>/../../packages/config/src/$1',
      '^@app/fixtures/(.*)$': '<rootDir>/../../packages/fixtures/src/$1',
      '^@prisma/client$':
        '<rootDir>/../../apps/web/node_modules/@prisma/client',
      '^@app/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
      '^@app/emails/(.*)$': '<rootDir>/../../packages/emails/src/$1',
      '^@app/lint/(.*)$': '<rootDir>/../../packages/lint/src/$1',
      '^@app/storybook/(.*)$': '<rootDir>/../../packages/storybook/src/$1',
      '^@app/test/(.*)$': '<rootDir>/../../packages/test/src/$1',
    },
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      ...testPathIgnorePatterns,
    ],
    testEnvironment: 'node',
    testEnvironmentOptions: {
      customExportConditions: customExportConditions ?? [
        'react-server',
        'node',
        'node-addons',
      ],
    },
    globals: {
      'ts-jest': {
        tsconfig: {
          sourceMap: true,
          inlineSources: false,
        },
      },
    },
    // Coverage configuration
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['json', 'lcov', 'text-summary'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.spec.{ts,tsx}',
      '!src/**/*.integration.{ts,tsx}',
      '!src/**/*.stories.{ts,tsx}',
    ],
  }
}
