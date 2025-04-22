import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'

export const rdvServicePublicOauthCallbackUrl = getServerUrl(
  '/api/rdv-service-public/auth/callback',
  { absolutePath: true },
)

export const rdvServicePublicOAuthConfig = {
  clientId: PublicWebAppConfig.RdvServicePublic.OAuth.clientId,
  redirectUri: rdvServicePublicOauthCallbackUrl,
  oauthHostname: PublicWebAppConfig.RdvServicePublic.OAuth.hostname,
  responseType: 'code',
  scope: 'write',
}

export const rdvServicePublicOAuthTokenEndpoint = `https://${rdvServicePublicOAuthConfig.oauthHostname}/oauth/token`

export const rdvOauthLinkAccountSuccessCallbackPath =
  '/coop/mes-outils/rdv-service-public/connexion-reussie'

export const rdvOauthLinkAccountErrorCallbackPath =
  '/coop/mes-outils/rdv-service-public/connexion-erreur'

export type RdvOauthLinkAccountState = {
  redirectToSuccess?: string
  redirectToError?: string
}

export const rdvOauthLinkAccountFlowUrl = (
  options: RdvOauthLinkAccountState,
) => {
  // Configuration de l'OAuth
  const state = encodeSerializableState(options)

  // Construction de l'URL
  return `https://${rdvServicePublicOAuthConfig.oauthHostname}/oauth/authorize?client_id=${
    rdvServicePublicOAuthConfig.clientId
  }&redirect_uri=${rdvServicePublicOAuthConfig.redirectUri}&response_type=${rdvServicePublicOAuthConfig.responseType}&scope=${rdvServicePublicOAuthConfig.scope}&state=${state}`
}
