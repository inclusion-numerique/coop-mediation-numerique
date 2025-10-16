import { PublicWebAppConfig } from '../PublicWebAppConfig'

// TODO replace with specific link for rdv integration when ready
export const rdvIntegrationEnSavoirPlusLink =
  'https://docs.numerique.gouv.fr/docs/49af7c6f-94c8-4160-b154-91b05ba2295a/'

export const rdvWebsiteLink = PublicWebAppConfig.isMain
  ? 'https://rdv.anct.gouv.fr'
  : 'https://demo.rdv.anct.gouv.fr'

export const rdvServicePublicGettingStartedLink = `https://aide.rdv-service-public.fr/demarrer-sur-rdv-service-public/configurer-son-espace`

export const rdvServicePublicRdvsLink = ({
  organisationId,
  status,
}: {
  organisationId: number
  status?: 'unknown_past' // todo other statuses filters if needed
}) => {
  const queryParams = new URLSearchParams()
  if (status) {
    queryParams.set('status', status)
  }
  const rdvsUrl = `${rdvWebsiteLink}/admin/organisations/${organisationId}/rdvs`

  return queryParams.size > 0 ? `${rdvsUrl}?${queryParams.toString()}` : rdvsUrl
}

export const rdvMyHomepageLink = `${rdvWebsiteLink}/agents/agenda`

export const rdvSupportEmail = 'support@rdv-service-public.fr'

export const rdvOauthApplicationsIntegrationsManagementUrl = `${rdvWebsiteLink}/oauth/authorized_applications`
