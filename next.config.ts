import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import { environnementClient } from './src/configuration/environnement'
import {
  environnementOutillage,
  verifierEnvironnementServeurWeb,
} from './src/configuration/environnement/serveur'

environnementClient()
verifierEnvironnementServeurWeb()

const outillage = environnementOutillage()

const nextConfig: NextConfig = {
  output: 'standalone',
  typedRoutes: true,
  poweredByHeader: false,
  serverExternalPackages: ['html-minifier-terser', 'mjml', 'mjml-core'],
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withSentryConfig(nextConfig, {
  silent: false,
  tunnelRoute: '/monitoring',
  widenClientFileUpload: true,
  ...(outillage.SENTRY_CI_TOKEN === undefined
    ? {}
    : { authToken: outillage.SENTRY_CI_TOKEN }),
  release: { create: outillage.SENTRY_ENABLE_RELEASE },
  sourcemaps: {
    disable: !outillage.SENTRY_ENABLE_RELEASE,
  },
})
