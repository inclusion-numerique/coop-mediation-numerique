import { estMain } from '@/configuration/projet'

export const rdvIntegrationEnSavoirPlusLink =
  'https://docs.numerique.gouv.fr/docs/49af7c6f-94c8-4160-b154-91b05ba2295a/'

export const rdvWebsiteLink = estMain
  ? 'https://rdv.anct.gouv.fr'
  : 'https://demo.rdv.anct.gouv.fr'

export const rdvServicePublicGettingStartedLink = `https://aide.rdv-service-public.fr/demarrer-sur-rdv-service-public/configurer-son-espace`

export const lienDeMonAgendaRdv = `${rdvWebsiteLink}/agents/agenda`

export const rdvSupportEmail = 'support@rdv-service-public.fr'

export const hrefDuCompteRdvEnAdministration = (id: string | number) =>
  `/administration/fonctionnalites/rdvsp/${id}` as const
