import * as Sentry from '@sentry/nextjs'
import { initializeSentry } from '@app/web/sentry'

initializeSentry()

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
