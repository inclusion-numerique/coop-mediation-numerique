import { createSentryReporter } from '@arckit/telemetry/error-reporter'
import * as Sentry from '@sentry/nextjs'
import { initialiserSentry } from '../initialiser-sentry'

export const errorReporter = createSentryReporter()

export const register = (): void => initialiserSentry()

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
