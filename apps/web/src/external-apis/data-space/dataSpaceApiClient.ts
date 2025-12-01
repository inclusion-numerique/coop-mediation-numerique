import axios, { AxiosError } from 'axios'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

/**
 * Documentation: https://gitlab.com/incubateur-territoires/startups/data-space-societe-numerique/scripts/-/wikis/api/coop
 */

const dataspaceApiBaseUrl = 'https://api.inclusion-numerique.anct.gouv.fr/rpc'

// ============================================================================
// Types
// ============================================================================

export type DataspaceMediateurAdresse = {
  nom_voie: string
  code_insee: string
  repetition: string | null
  code_postal: string
  nom_commune: string
  numero_voie: number
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

export type DataspaceContrat = {
  type: string
  date_fin: string
  date_debut: string
  date_rupture: string | null
}

export type DataspaceStructureEmployeuse = {
  nom: string
  siret: string
  contact: DataspaceContact | null
  adresse: DataspaceMediateurAdresse
  contrats: DataspaceContrat[]
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

export type DataspaceMediateur = {
  id: number
  is_coordinateur: boolean
  is_conseiller_numerique: boolean
  structures_employeuses: DataspaceStructureEmployeuse[]
  lieux_activite: DataspaceLieuActivite[]
  conseillers_numeriques_coordonnes: DataspaceConseillerNumeriqueCoordonne[]
}

export type DataspaceApiError = {
  error: {
    statusCode: number
    message: string
  }
}

export type DataspaceApiResult<T> = T | DataspaceApiError

export const isDataspaceApiError = <T>(
  result: DataspaceApiResult<T>,
): result is DataspaceApiError =>
  typeof result === 'object' &&
  result !== null &&
  'error' in result &&
  typeof (result as DataspaceApiError).error === 'object'

export const getMediateurFromDataspaceApi = async ({
  email,
}: {
  email: string
}): Promise<DataspaceApiResult<DataspaceMediateur>> => {
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
    const response = await axios.get<DataspaceMediateur>(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        error: {
          statusCode: error.response?.status ?? 500,
          message:
            error.response?.data?.message ??
            error.message ??
            'Unknown error from Data Space API',
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
