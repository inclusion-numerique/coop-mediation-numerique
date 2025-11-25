import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import * as Sentry from '@sentry/nextjs'

// Routes à ignorer pour le tracing (haut volume, peu d'intérêt)
const ignoredTraceRoutes = [
  '/monitoring', // tunnel Sentry
  '/_next/',
  '/favicon',
  '/dsfr/',
  '/images/',
]

export const initializeSentry = ({ replay }: { replay?: boolean } = {}) => {
  if (!PublicWebAppConfig.Sentry.dsn || process.env.NODE_ENV !== 'production') {
    return
  }

  Sentry.init({
    dsn: PublicWebAppConfig.Sentry.dsn,
    environment: PublicWebAppConfig.Sentry.environment,
    tracesSampler: ({ name, parentSampled }) => {
      // Toujours hériter du parent si défini
      if (parentSampled !== undefined) {
        return parentSampled
      }

      // Ignorer complètement certaines routes à haut volume / peu intéressantes
      if (ignoredTraceRoutes.some((route) => name.includes(route))) {
        return 0
      }

      // Sample rate bas par défaut (1%)
      return 0.01
    },
    integrations: replay ? [Sentry.replayIntegration()] : [],
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1,
  })
}
