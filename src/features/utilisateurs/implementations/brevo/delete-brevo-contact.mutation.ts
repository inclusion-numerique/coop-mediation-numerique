import axios from 'axios'
import { signaler } from '@/configuration/telemetry/serveur'
import { cleApiBrevo } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from './brevo-api-throttle.client'

const deleteContactImmediate = async (email: string): Promise<void> => {
  try {
    await axios.delete(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          'api-key': cleApiBrevo,
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
