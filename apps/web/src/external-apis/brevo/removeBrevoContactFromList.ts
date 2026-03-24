import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { brevoApiThrottle } from './createBrevoContact'

const removeContactFromListImmediate = async (
  email: string,
  listId: number,
): Promise<void> => {
  try {
    await axios.post(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`,
      {
        emails: [email],
      },
      {
        headers: {
          'api-key': ServerWebAppConfig.Brevo.apiKey,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return
    Sentry.captureException?.(error)
    throw error
  }
}

export const removeBrevoContactFromList = brevoApiThrottle(
  removeContactFromListImmediate,
)

export const deploymentCanRemoveBrevoContactFromList = () =>
  PublicWebAppConfig.isMain && !PublicWebAppConfig.isE2e
