import axios from 'axios'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { brevoApiThrottle } from './brevoApiThrottle'

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
    signaler(error)
    throw error
  }
}

export const deleteBrevoContact = brevoApiThrottle(deleteContactImmediate)
