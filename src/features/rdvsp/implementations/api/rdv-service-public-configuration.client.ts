import { environnementClient } from '@/configuration/environnement'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { getServerUrl } from '@/configuration/projet/serveur'

export const configurationOAuthRdvsp = () => ({
  hostname: environnementClient().NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME,
  clientId:
    environnementClient().NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID,
  clientSecret: environnementServeur().RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
})

export const configurationRdvServicePublic = () => ({
  ...configurationOAuthRdvsp(),
  webhookUrl: getServerUrl('/api/rdv-service-public/webhook', {
    absolutePath: true,
  }),
  webhookSecret: environnementServeur().RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
})
