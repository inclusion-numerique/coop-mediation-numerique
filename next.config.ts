import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['html-minifier-terser', 'mjml', 'mjml-core'],
  typescript: {
    ignoreBuildErrors: true,
  },
}

const enableRelease = process.env.SENTRY_ENABLE_RELEASE === 'true'

export default withSentryConfig(nextConfig, {
  silent: false,
  tunnelRoute: '/monitoring',
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_CI_TOKEN,
  release: { create: enableRelease },
  sourcemaps: {
    disable: !enableRelease,
  },
})
