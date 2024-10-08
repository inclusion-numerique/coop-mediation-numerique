import { defineConfig } from 'cypress'
// import 'tsconfig-paths/register'
// eslint-disable-next-line import/no-relative-packages
import { cypressProjectId } from '../config/src/config'
// eslint-disable-next-line import/no-relative-packages
import { tasks } from './cypress/support/tasks'

export default defineConfig({
  projectId: cypressProjectId,
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  video: true,
  videoCompression: true,
  viewportWidth: 1024,
  viewportHeight: 768,

  e2e: {
    setupNodeEvents(on) {
      on('task', tasks)
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          // eslint-disable-next-line no-param-reassign
          launchOptions.preferences['ui.prefersReducedMotion'] = 1
        }
        if (browser.family === 'chromium') {
          launchOptions.args.push('--force-prefers-reduced-motion')
        }
        // Electron does not supports that kind of options.
        // eslint-disable-next-line no-param-reassign
        launchOptions.env.ELECTRON_EXTRA_LAUNCH_ARGS =
          '--force-prefers-reduced-motion'

        return launchOptions
      })
    },
    env: {},
    baseUrl:
      process.env.CYPRESS_BASE_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`,
    chromeWebSecurity: false,
  },
})
