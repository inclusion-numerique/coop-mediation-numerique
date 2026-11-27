import { getServerUrl } from '@/configuration/projet/serveur'
import {
  rdvspOAuthClientId,
  rdvspOAuthHostname,
} from '@/features/rdvsp/implementations/oauth/rdvsp-oauth.client'
import { encodeSerializableState } from '@/libraries/etat-encode'

export const rdvServicePublicOauthCallbackUrl = getServerUrl(
  '/api/rdv-service-public/auth/callback',
  { absolutePath: true },
)

export const rdvServicePublicOAuthConfig = {
  clientId: rdvspOAuthClientId,
  redirectUri: rdvServicePublicOauthCallbackUrl,
  oauthHostname: rdvspOAuthHostname,
  responseType: 'code',
  scope: 'write',
}

const rdvOauthLinkAccountSuccessCallbackPath =
  '/coop/mes-outils/rdv-service-public/connexion-reussie'

const rdvOauthLinkAccountErrorCallbackPath =
  '/coop/mes-outils/rdv-service-public/connexion-erreur'

export type EtatDeLaLiaisonDuCompte = {
  redirectToSuccess?: string
  redirectToError?: string
}

const rdvOauthLinkAccountFlowUrl = (options: EtatDeLaLiaisonDuCompte) => {
  const state = encodeSerializableState(options)

  return `https://${rdvServicePublicOAuthConfig.oauthHostname}/oauth/authorize?client_id=${
    rdvServicePublicOAuthConfig.clientId
  }&redirect_uri=${rdvServicePublicOAuthConfig.redirectUri}&response_type=${rdvServicePublicOAuthConfig.responseType}&scope=${rdvServicePublicOAuthConfig.scope}&state=${state}`
}

export const lienDeConnexionARdvServicePublic = (): string =>
  rdvOauthLinkAccountFlowUrl({
    redirectToSuccess: rdvOauthLinkAccountSuccessCallbackPath,
    redirectToError: rdvOauthLinkAccountErrorCallbackPath,
  })
