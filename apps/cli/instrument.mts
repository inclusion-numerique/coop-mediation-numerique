import * as Sentry from '@sentry/node'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'local'

if (dsn && environment !== 'local') {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: 0,
    integrations: [],
  })
}
