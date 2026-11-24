import axios from 'axios'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { cleApiBrevo } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from './brevo-api-throttle.client'

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
          'api-key': cleApiBrevo,
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

export const listesDeContactsBrevo = brevoApiThrottle(getContactListsImmediate)
