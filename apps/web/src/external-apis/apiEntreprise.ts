import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios from 'axios'

const stagingApiUrl = 'https://staging.entreprise.api.gouv.fr'
const productionApiUrl = 'https://entreprise.api.gouv.fr'

const siretAnct = '13002603200016'
const contexte = 'France Numérique Ensemble'

export const fetchFromApiEntreprise = async <T>({
  staging,
  path,
  object,
}: {
  // Path of api , include version and first "/"
  path: string
  staging?: boolean
  // For legally tracking the request
  object: string
}): Promise<
  | T
  | {
      error: {
        statusCode: number
        message: string
      }
    }
> => {
  const baseUrl = staging ? stagingApiUrl : productionApiUrl
  const token = staging
    ? ServerWebAppConfig.ApiEntreprise.stagingToken
    : ServerWebAppConfig.ApiEntreprise.token

  const url = new URL(`${baseUrl}${path}`)
  url.searchParams.append('object', object)
  url.searchParams.append('recipient', siretAnct)
  url.searchParams.append('context', contexte)

  try {
    const response = await axios.get<T>(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const body = response.data
    if (!response.status.toString().startsWith('2')) {
      const bodyWithErrors = body as {
        errors?: [{ code: string; detail: string; title: string }]
      }
      return {
        error: {
          statusCode: response.status,
          message: Array.isArray(bodyWithErrors.errors)
            ? bodyWithErrors.errors[0].detail
            : 'Unknown error',
        },
      }
    }

    return body
  } catch (error) {
    return {
      error: {
        statusCode: 500,
        message: (error as Error).message,
      },
    }
  }
}
