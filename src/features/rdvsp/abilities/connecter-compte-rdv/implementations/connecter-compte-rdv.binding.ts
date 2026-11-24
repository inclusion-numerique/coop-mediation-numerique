import { environnementServeur } from '@/configuration/environnement/serveur'
import { rdvspOAuthHostname } from '@/features/rdvsp/implementations/oauth/client'
import { rdvServicePublicApiBinding } from '../../../implementations/api/rdv-service-public.binding'
import {
  rdvServicePublicOAuthConfig,
  rdvServicePublicOauthCallbackUrl,
} from '../../../implementations/oauth/oauth'
import { connecterCompteRdv } from '../domain/connecter-compte-rdv'
import { echangerCodeAutorisation } from './api/echanger-code-autorisation'
import { compteRdvExistant } from './prisma/compte-rdv-existant.query'
import { enregistrerCompteConnecte } from './prisma/enregistrer-compte-connecte.mutation'

/**
 * Composition de l'ability avec la configuration OAuth de l'application. Elle
 * tire la configuration serveur : à importer par ce chemin explicite, jamais
 * depuis un composant client.
 */
export const connecterCompteRdvBinding = connecterCompteRdv({
  echangerCode: echangerCodeAutorisation({
    hostname: rdvspOAuthHostname,
    clientId: rdvServicePublicOAuthConfig.clientId,
    clientSecret: environnementServeur.RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
    redirectUri: rdvServicePublicOauthCallbackUrl,
  }),
  identifierAgent: rdvServicePublicApiBinding.identifierAgent,
  compteExistant: compteRdvExistant,
  enregistrer: enregistrerCompteConnecte,
})
