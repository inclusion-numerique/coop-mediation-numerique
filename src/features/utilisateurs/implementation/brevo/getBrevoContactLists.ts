import axios from 'axios'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { brevoApiThrottle } from './brevoApiThrottle'

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
    signaler(error)
    throw error
  }
}

export const getBrevoContactLists = brevoApiThrottle(getContactListsImmediate)
