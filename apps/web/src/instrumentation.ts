import * as Sentry from '@sentry/nextjs'
import { initializeSentry } from '@app/web/sentry'

/**
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * and
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
export async function register() {
  initializeSentry()
}

export const onRequestError = Sentry.captureRequestError
