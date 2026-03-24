import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { brevoApiThrottle } from './createBrevoContact'

type BrevoContactResponse = {
  email: string
  id: number
  listIds: number[]
  attributes: Record<string, unknown>
}

const getContactListsImmediate = async (
  email: string,
): Promise<number[] | null> => {
  try {
    const response = await axios.get<BrevoContactResponse>(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          'api-key': ServerWebAppConfig.Brevo.apiKey,
        },
      },
    )
    return response.data.listIds
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    Sentry.captureException?.(error)
    throw error
  }
}

export const getBrevoContactLists = brevoApiThrottle(getContactListsImmediate)
