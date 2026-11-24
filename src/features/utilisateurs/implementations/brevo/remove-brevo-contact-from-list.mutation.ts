import axios from 'axios'
import { errorReporter } from '@/configuration/telemetry/error-reporter/server'
import { cleApiBrevo } from '@/features/utilisateurs/implementations/brevo/brevo-api.client'
import { brevoApiThrottle } from './brevo-api-throttle.client'

const CONTACT_ABSENT_DE_LA_LISTE =
  'Contact already removed from list and/or does not exist'

const estAbsentDeLaListe = (error: unknown): boolean =>
  axios.isAxiosError(error) &&
  (error.response?.status === 404 ||
    (error.response?.status === 400 &&
      error.response.data?.message === CONTACT_ABSENT_DE_LA_LISTE))

const removeContactFromListImmediate = async (
  email: string,
  listId: number,
): Promise<boolean> => {
  try {
    await axios.post(
      `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`,
      {
        emails: [email],
      },
      {
        headers: {
          'api-key': cleApiBrevo,
          'Content-Type': 'application/json',
        },
      },
    )
    return true
  } catch (error) {
    if (estAbsentDeLaListe(error)) return false
    errorReporter.captureException({
      error: error instanceof Error ? error : new Error(String(error)),
      attributes: {
        reponseBrevo: JSON.stringify(
          axios.isAxiosError(error) ? error.response?.data : null,
        ),
      },
    })
    throw error
  }
}

export const removeBrevoContactFromList = brevoApiThrottle(
  removeContactFromListImmediate,
)
