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

// TODO replace with specific link for rdv integration when ready
export const rdvIntegrationEnSavoirPlusLink =
  'https://docs.numerique.gouv.fr/docs/49af7c6f-94c8-4160-b154-91b05ba2295a/'

export const rdvWebsiteLink = PublicWebAppConfig.isMain
  ? 'https://rdv.anct.gouv.fr'
  : 'https://demo.rdv.anct.gouv.fr'

export const rdvServicePublicGettingStartedLink = `https://aide.rdv-service-public.fr/demarrer-sur-rdv-service-public/configurer-son-espace`

export const rdvServicePublicRdvsLink = ({
  organisationId,
}: {
  organisationId: number
}) => `${rdvWebsiteLink}/admin/organisations/${organisationId}/rdvs`

export const rdvMyHomepageLink = `${rdvWebsiteLink}/agents/agenda`

export const rdvSupportEmail = 'support@rdv-service-public.fr'

export const rdvOauthApplicationsIntegrationsManagementUrl = `${rdvWebsiteLink}/oauth/authorized_applications`

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
