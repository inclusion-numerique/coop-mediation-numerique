import { createSentryReporter } from '@arckit/telemetry/error-reporter'
import * as Sentry from '@sentry/nextjs'
import { initialiserSentry } from '../initialiser-sentry'

export const errorReporter = createSentryReporter()

export const register = async (): Promise<void> => initialiserSentry()

export const onRequestError = Sentry.captureRequestError

export const flush = (delai: number): Promise<boolean> => Sentry.flush(delai)
