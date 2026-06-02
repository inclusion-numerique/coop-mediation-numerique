import { initializeSentry } from '@app/web/sentry'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'

/**
 * See https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * and
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
export async function register() {
  initializeSentry()

  axios.interceptors.request.use((config) => {
    console.info(`[axios] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  })
}

export const onRequestError = Sentry.captureRequestError
