import { environnementServeur } from '@/configuration/environnement/serveur'
import { getServerUrl } from '@/configuration/projet/serveur'
import {
  rdvspOAuthClientId,
  rdvspOAuthHostname,
} from '../oauth/rdvsp-oauth.client'

export const configurationOAuthRdvsp = () => ({
  hostname: rdvspOAuthHostname,
  clientId: rdvspOAuthClientId,
  clientSecret: environnementServeur().RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
})

export const configurationRdvServicePublic = () => ({
  ...configurationOAuthRdvsp(),
  webhookUrl: getServerUrl('/api/rdv-service-public/webhook', {
    absolutePath: true,
  }),
  webhookSecret: environnementServeur().RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
})
