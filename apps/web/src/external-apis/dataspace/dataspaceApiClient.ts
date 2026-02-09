import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import axios, { AxiosError } from 'axios'
import { getMediateurFromDataspaceApiMock } from './dataspaceApiClientMock'

/**
 * Documentation: https://gitlab.com/incubateur-territoires/startups/data-space-societe-numerique/scripts/-/wikis/api/coop
 */

const dataspaceApiBaseUrl = 'https://api.inclusion-numerique.anct.gouv.fr/rpc'

export type DataspaceMediateurAdresse = {
  nom_voie: string | null
  code_insee: string
  repetition: string | null
  code_postal: string
  nom_commune: string
  numero_voie: number | null
}

export type DataspaceContact = {
  nom: string
  prenom: string
  courriels: {
    mail_gestionnaire?: string
    mail_pro?: string
  }
  telephone?: string
}

/**
 * Raw contract type from API - all fields can be null due to flaky API data
 */
export type DataspaceContratRaw = {
  type: string | null // e.g. 'CDI'
  date_fin: string | null
  date_debut: string | null // should never be null but API sometimes returns null
  date_rupture: string | null
}

/**
 * Validated contract type - date_debut is guaranteed to exist
 * Invalid contracts (with null date_debut) are filtered out at API response level
 */
export type DataspaceContrat = {
  type: string | null
  date_fin: string | null
  date_debut: string
  date_rupture: string | null
}

/**
 * Filter out invalid contracts (those with null date_debut)
 * These are invalid data from the API that would cause 1970-01-01 dates
 */
const filterValidContracts = (
  contrats: DataspaceContratRaw[] | null,
): DataspaceContrat[] | null => {
  if (!contrats) return null
  return contrats.filter(
    (contrat): contrat is DataspaceContrat => contrat.date_debut !== null,
  )
}

export type DataspaceStructureIds = {
  coop: string | null
  dataspace: number | null
  pg_id: number | null
  aidant_connect: string | null
}

/**
 * Raw structure employeuse from API - contrats may contain invalid entries
 */
type DataspaceStructureEmployeuseRaw = {
  nom: string
  siret: string
  ids: DataspaceStructureIds | null
  contact: DataspaceContact | null
  adresse: DataspaceMediateurAdresse
  contrats: DataspaceContratRaw[] | null
}

/**
 * Validated structure employeuse - invalid contracts have been filtered out
 */
export type DataspaceStructureEmployeuse = {
  nom: string
  siret: string
  ids: DataspaceStructureIds | null
  contact: DataspaceContact | null
  adresse: DataspaceMediateurAdresse
  contrats: DataspaceContrat[] | null
}

export type DataspaceLieuActivite = {
  nom: string
  siret: string
  adresse: DataspaceMediateurAdresse
  contact: DataspaceContact | null
}

export type DataspaceConseillerNumeriqueIds = {
  coop: string | null
  cn_pg: string | null
  dataspace: number | null
  aidant_connect: string | null
  conseiller_numerique: string | null
}

export type DataspaceConseillerNumeriqueCoordonneContact = {
  courriels: {
    mail_pro?: string
  }
  telephone?: string
}

export type DataspaceConseillerNumeriqueCoordonne = {
  ids: DataspaceConseillerNumeriqueIds
  nom: string
  prenom: string
  contact: DataspaceConseillerNumeriqueCoordonneContact
}

/**
 * Raw mediateur type from API - may contain invalid contract data
 */
type DataspaceMediateurRaw = {
  id: number
  is_coordinateur: boolean
  is_conseiller_numerique: boolean
  pg_id: number | null
  structures_employeuses?: DataspaceStructureEmployeuseRaw[] | null
  lieux_activite?: DataspaceLieuActivite[] | null
  conseillers_numeriques_coordonnes: DataspaceConseillerNumeriqueCoordonne[]
}

/**
 * Validated mediateur type - invalid contracts have been filtered out
 */
export type DataspaceMediateur = {
  id: number
  is_coordinateur: boolean
  is_conseiller_numerique: boolean
  pg_id: number | null
  structures_employeuses?: DataspaceStructureEmployeuse[] | null
  lieux_activite?: DataspaceLieuActivite[] | null
  conseillers_numeriques_coordonnes: DataspaceConseillerNumeriqueCoordonne[]
}

/**
 * Sanitize raw mediateur data from API
 * Filters out invalid contracts (those with null date_debut)
 */
const sanitizeMediateurData = (
  raw: DataspaceMediateurRaw,
): DataspaceMediateur => ({
  ...raw,
  structures_employeuses: raw.structures_employeuses?.map((structure) => ({
    ...structure,
    contrats: filterValidContracts(structure.contrats),
  })),
})

export type DataspaceApiError = {
  error: {
    statusCode: number
    message: string
  }
}

// Result can be data, null (not found), or error
export type DataspaceApiResult<T> = T | null | DataspaceApiError

export const isDataspaceApiError = <T>(
  result: DataspaceApiResult<T>,
): result is DataspaceApiError =>
  typeof result === 'object' &&
  result !== null &&
  'error' in result &&
  typeof (result as DataspaceApiError).error === 'object'

export const isDataspaceApiNotFound = <T>(
  result: DataspaceApiResult<T>,
): result is null => result === null

let mockDataspaceApiEnabled = ServerWebAppConfig.Dataspace.isMocked
export const forceMockDataspaceApi = ({ mocked }: { mocked: boolean }) => {
  mockDataspaceApiEnabled = mocked
}

export const resetMockDataspaceApiFromEnv = () => {
  mockDataspaceApiEnabled = ServerWebAppConfig.Dataspace.isMocked
}
/**
 * Fetch mediateur data from Dataspace API by email
 * Returns null if the mediateur is not found (404)
 * Returns DataspaceApiError for other errors
 *
 * Uses mock implementation when ServerWebAppConfig.Dataspace.isMocked is true
 * (automatically enabled for e2e tests, or when DATASPACE_API_MOCK=1)
 */
export const getMediateurFromDataspaceApi = async ({
  email,
}: {
  email: string
}): Promise<DataspaceApiResult<DataspaceMediateur>> => {
  // Use mock implementation if enabled
  if (mockDataspaceApiEnabled) {
    return getMediateurFromDataspaceApiMock({ email })
  }

  const apiKey = ServerWebAppConfig.Dataspace.apiKey

  if (!apiKey) {
    return {
      error: {
        statusCode: 500,
        message: 'Data Space API key is not configured',
      },
    }
  }

  const url = new URL(`${dataspaceApiBaseUrl}/get_mediateur`)
  url.searchParams.append('email', email.toLowerCase().trim())

  try {
    const response = await axios.get<DataspaceMediateurRaw[]>(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    // Handle unexpected empty array response from Dataspace API
    // API returns [] instead of 404 when mediateur is not found
    if (!Array.isArray(response.data)) {
      return null
    }

    const rawData = response.data.at(0)
    if (!rawData) {
      return null
    }

    // Sanitize data: filter out invalid contracts with null date_debut
    return sanitizeMediateurData(rawData)
  } catch (error) {
    if (error instanceof AxiosError) {
      // 404 means mediateur not found - return null instead of error
      if (error.response?.status === 404) {
        return null
      }

      return {
        error: {
          statusCode: error.response?.status ?? 500,
          message:
            error.response?.data?.message ??
            error.message ??
            'Unknown error from Dataspace API',
        },
      }
    }

    return {
      error: {
        statusCode: 500,
        message: (error as Error).message ?? 'Unknown error',
      },
    }
  }
}
