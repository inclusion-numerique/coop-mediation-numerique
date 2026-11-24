import { environnementServeur } from '@/configuration/environnement/serveur'
import { getServerUrl } from '@/configuration/projet/base-url'
import {
  rdvspOAuthClientId,
  rdvspOAuthHostname,
} from '@/features/rdvsp/implementations/oauth/rdvsp-oauth.client'
import { rdvServicePublicApi, revoquerJetons } from './api'
import { enregistrerLesJetons } from './prisma/jetons-du-compte.mutation'
import { jetonsCourants } from './prisma/jetons-du-compte.query'

/**
 * Composition de l'adaptateur RDV Service Public avec la configuration de
 * l'application. Volontairement hors du baril de la feature : il tire la
 * configuration serveur et le client Prisma, qu'un composant client ne doit
 * jamais embarquer — `tsc` ne verrait pas la fuite, seul le build de production
 * la révélerait. Les appelants l'importent par ce chemin explicite.
 */
export const rdvServicePublicApiBinding = rdvServicePublicApi({
  hostname: rdvspOAuthHostname,
  clientId: rdvspOAuthClientId,
  clientSecret: environnementServeur.RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
  webhookUrl: getServerUrl('/api/rdv-service-public/webhook', {
    absolutePath: true,
  }),
  webhookSecret: environnementServeur.RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
  onJetonsRenouveles: enregistrerLesJetons,
  jetonsCourants,
})

export const revoquerJetonsBinding = revoquerJetons({
  hostname: rdvspOAuthHostname,
  clientId: rdvspOAuthClientId,
  clientSecret: environnementServeur.RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
})
