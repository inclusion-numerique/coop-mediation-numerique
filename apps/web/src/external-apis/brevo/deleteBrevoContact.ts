import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { brevoApiThrottle } from './createBrevoContact'

const deleteContactImmediate = async (email: string): Promise<void> => {
  try {
    await axios.delete(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          'api-key': ServerWebAppConfig.Brevo.apiKey,
        },
      },
    )
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return
    Sentry.captureException(error)
  }
}

export const deleteBrevoContact = brevoApiThrottle(deleteContactImmediate)

export const deploymentCanDeleteBrevoContact = () =>
  PublicWebAppConfig.isMain && !PublicWebAppConfig.isE2e
