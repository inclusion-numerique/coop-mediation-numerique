import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dotenvVariables = () => {
  const dotenvFile = path.resolve(dirname, '../../../.env')
  if (!existsSync(dotenvFile)) {
    return null
  }
  return parse(readFileSync(dotenvFile))
}

// See https://github.com/storybookjs/storybook/blob/111edc3929eb8afff1b58285b0b9c49dd493ae85/code/frameworks/nextjs/README.md
export default {
  stories: [
    '../../../apps/web/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  // Storybook 9 a absorbé dans son cœur ce que fournissaient `addon-essentials`,
  // `addon-interactions` et `addon-viewport` : ces paquets n'existent plus, et leurs
  // fonctionnalités restent disponibles sans être déclarées ici.
  addons: ['@storybook/addon-links', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: path.resolve(
        dirname,
        '../../../apps/web/next.config.mjs',
      ),
    },
  },
  staticDirs: ['../../../apps/web/public', '../public'],
  // Storybook dérivait ses alias des `paths` du tsconfig, ce qui supposait `baseUrl`. Or
  // TypeScript 7 a supprimé cette option : les alias sont donc déclarés ici, explicitement.
  // C'est plus lisible que la dérivation implicite, et ça ne dépend plus d'un réglage du
  // compilateur pour faire fonctionner le bundler.
  webpackFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@app/web': path.resolve(dirname, '../../../apps/web/src'),
        '@app/ui': path.resolve(dirname, '../../../packages/ui/src'),
        '@app/storybook': path.resolve(dirname, '../src'),
        '@app/config': path.resolve(dirname, '../../../packages/config/src'),
        '@app/fixtures': path.resolve(
          dirname,
          '../../../packages/fixtures/src',
        ),
      },
    },
  }),
  docs: {},
  env: (config) => ({
    ...config,
    ...dotenvVariables(),
  }),
}
