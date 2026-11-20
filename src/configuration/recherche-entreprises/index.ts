import { environnementServeur } from '@/configuration/environnement/serveur'
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
  environnementServeur.IS_E2E
    ? rechercheApiEntrepriseE2e(queryParams)
    : rechercherSurLApi(queryParams, retryOptions)
