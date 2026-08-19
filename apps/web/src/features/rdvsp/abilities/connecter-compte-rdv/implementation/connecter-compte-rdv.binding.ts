import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { rdvServicePublicApiBinding } from '../../../implementation/rdv-service-public.bindings'
import {
  rdvServicePublicOAuthConfig,
  rdvServicePublicOauthCallbackUrl,
} from '../../../oauth'
import { echangerCodeAutorisation } from './api/echanger-code-autorisation'
import { connecterCompteRdv } from './connecter-compte-rdv'
import { compteRdvExistant } from './prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from './prisma/enregistrer-compte-connecte.mutation'

/**
 * Composition de l'ability avec la configuration OAuth de l'application. Elle
 * tire la configuration serveur : à importer par ce chemin explicite, jamais
 * depuis un composant client.
 */
export const connecterCompteRdvBinding = connecterCompteRdv({
  echangerCode: echangerCodeAutorisation({
    hostname: PublicWebAppConfig.RdvServicePublic.OAuth.hostname,
    clientId: rdvServicePublicOAuthConfig.clientId,
    clientSecret: ServerWebAppConfig.RdvServicePublic.OAuth.clientSecret,
    redirectUri: rdvServicePublicOauthCallbackUrl,
  }),
  identifierAgent: rdvServicePublicApiBinding.identifierAgent,
  compteExistant: compteRdvExistant,
  enregistrer: enregistrerCompteConnecte,
})
