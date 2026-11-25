import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import './src/configuration/environnement'
import {
  environnementOutillage,
  verifierEnvironnementServeurWeb,
} from './src/configuration/environnement/serveur'

verifierEnvironnementServeurWeb()

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
  ...(environnementOutillage.SENTRY_CI_TOKEN === undefined
    ? {}
    : { authToken: environnementOutillage.SENTRY_CI_TOKEN }),
  release: { create: environnementOutillage.SENTRY_ENABLE_RELEASE },
  sourcemaps: {
    disable: !environnementOutillage.SENTRY_ENABLE_RELEASE,
  },
})
