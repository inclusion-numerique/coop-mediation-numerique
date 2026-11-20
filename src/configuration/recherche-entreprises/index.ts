import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import {
  type RechercheApiEntrepriseQueryParams,
  type RechercheApiEntrepriseRetryOptions,
  type RechercheApiResponse,
  rechercheApiEntreprise as rechercherSurLApi,
} from '@/libraries/recherche-entreprises/rechercheApiEntreprise'
import { rechercheApiEntrepriseE2e } from './rechercheApiEntreprise.e2e'

export const rechercheApiEntreprise = async (
  queryParams: RechercheApiEntrepriseQueryParams,
  retryOptions?: RechercheApiEntrepriseRetryOptions,
): Promise<RechercheApiResponse> =>
  ServerWebAppConfig.isE2e
    ? rechercheApiEntrepriseE2e(queryParams)
    : rechercherSurLApi(queryParams, retryOptions)
