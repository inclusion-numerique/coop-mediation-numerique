import { environnementServeur } from '@/configuration/environnement/serveur'
import {
  type RechercheApiEntrepriseQueryParams,
  type RechercheApiEntrepriseRetryOptions,
  type RechercheApiResponse,
  rechercheApiEntreprise as rechercherSurLApi,
} from '@/libraries/recherche-entreprises/rechercheApiEntreprise'
import { rechercheApiEntrepriseSimulee } from './rechercheApiEntreprise.simulee'

export const rechercheApiEntreprise = async (
  queryParams: RechercheApiEntrepriseQueryParams,
  retryOptions?: RechercheApiEntrepriseRetryOptions,
): Promise<RechercheApiResponse> =>
  environnementServeur.IS_E2E
    ? rechercheApiEntrepriseSimulee(queryParams)
    : rechercherSurLApi(queryParams, retryOptions)
