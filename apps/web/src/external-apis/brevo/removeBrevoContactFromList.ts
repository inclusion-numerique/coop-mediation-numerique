import { errorReporter } from '@app/web/configuration/telemetry/error-reporter/server'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'
import { brevoApiThrottle } from './createBrevoContact'

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
          'api-key': ServerWebAppConfig.Brevo.apiKey,
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

export const deploymentCanRemoveBrevoContactFromList = () =>
  PublicWebAppConfig.isMain && !PublicWebAppConfig.isE2e
