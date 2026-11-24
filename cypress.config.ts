import { defineConfig } from 'cypress'
import cypressSplit from 'cypress-split'
import { taskManager } from './e2e/support/task-manager'
import { cypressProjectId } from './src/configuration/projet/config'

const cheminLitteral = (chemin: string): string =>
  chemin.replace(/[()[\]]/g, '\\$&')

const cheminsLitteraux = (specPattern: string | string[]): string | string[] =>
  Array.isArray(specPattern) ? specPattern.map(cheminLitteral) : specPattern

export default defineConfig({
  projectId: cypressProjectId,
  fixturesFolder: 'e2e/fixtures',
  screenshotsFolder: 'e2e/screenshots',
  downloadsFolder: 'e2e/downloads',
  video: false,
  viewportWidth: 1024,
  viewportHeight: 768,

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.tsx',
    supportFile: 'e2e/support/component.ts',
    indexHtmlFile: 'e2e/support/component-index.html',
    setupNodeEvents(on, config) {
      cypressSplit(on, config)
      return { ...config, specPattern: cheminsLitteraux(config.specPattern) }
    },
  },

  e2e: {
    specPattern: [
      'e2e/*.e2e.ts',
      'src/app/**/page.test.ts',
      'src/app/**/route.test.ts',
    ],
    supportFile: 'e2e/support/e2e.ts',
    setupNodeEvents(on, config) {
      on('task', taskManager)
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.preferences['ui.prefersReducedMotion'] = 1
        }
        if (browser.family === 'chromium') {
          launchOptions.args.push('--force-prefers-reduced-motion')
        }
        launchOptions.env['ELECTRON_EXTRA_LAUNCH_ARGS'] =
          '--force-prefers-reduced-motion'

        return launchOptions
      })
      cypressSplit(on, config)
      return { ...config, specPattern: cheminsLitteraux(config.specPattern) }
    },
    baseUrl:
      process.env['CYPRESS_BASE_URL'] ??
      `http://localhost:${process.env.PORT ?? 3000}`,
    chromeWebSecurity: false,
  },
})
