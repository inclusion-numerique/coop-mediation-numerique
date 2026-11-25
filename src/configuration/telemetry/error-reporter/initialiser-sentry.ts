import * as Sentry from '@sentry/nextjs'
import { environnementClient } from '@/configuration/environnement'

// Routes à ignorer pour le tracing (haut volume, peu d'intérêt)
const ignoredTraceRoutes = [
  '/monitoring', // tunnel Sentry
  '/_next/',
  '/favicon',
  '/images/',
]

export const initialiserSentry = (): void => {
  if (
    !environnementClient().NEXT_PUBLIC_SENTRY_DSN ||
    environnementClient().NODE_ENV !== 'production'
  ) {
    return
  }

  Sentry.init({
    dsn: environnementClient().NEXT_PUBLIC_SENTRY_DSN,
    environment: environnementClient().NEXT_PUBLIC_SENTRY_ENVIRONMENT,
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
  })
}
