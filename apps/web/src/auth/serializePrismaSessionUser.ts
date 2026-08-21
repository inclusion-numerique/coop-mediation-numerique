import type {
  PrismaSessionUser,
  PrismaSessionUsupper,
} from '@app/web/auth/getSessionUserFromSessionToken'
import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  employeuseSessionEmplois,
  personneEstConseillerNumerique,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import { splitMediateursCoordonnes } from '@app/web/features/mediateurs/splitMediateursCoordonnes'
import { statutIntegrationDeLaSession } from '@app/web/features/rdvsp/db/statut-integration'

/**
 * This is the session user that will be publicly sent to the client.
 * DO NOT INCLUDE ANY SECRET DATA IN THIS OBJECT
 */
export const serializePrismaSessionUser = (
  prismaSessionUser: PrismaSessionUser,
  usurper?: PrismaSessionUsupper,
): SessionUser => ({
  ...prismaSessionUser,
  // Employeuse COURANTE lue en pur main (ADR-002 périmètre élargi). Forme `emplois` historique
  // conservée (0 ou 1 élément) pour ne pas impacter les consommateurs (`emplois.at(0).structure`,
  // `.length`).
  emplois: employeuseSessionEmplois(
    personneToEmployeuseActuelle(prismaSessionUser.personneMain),
  ),
  // Dispositif conseiller numérique DÉRIVÉ de l'affectation `idposte` active, et non plus lu dans
  // la colonne `coop.users.is_conseiller_numerique` qu'une synchro nocturne recopiait. La session
  // charge déjà `personneMain` pour l'employeuse : la dérivation ne coûte pas une requête de plus,
  // et la fin d'un contrat conum est vue à la connexion suivante au lieu de la nuit d'après.
  isConseillerNumerique: personneEstConseillerNumerique(
    prismaSessionUser.personneMain,
  ),
  coordinateur: splitMediateursCoordonnes(prismaSessionUser.coordinateur),
  emailVerified: prismaSessionUser.emailVerified?.toISOString() ?? null,
  created: prismaSessionUser.created.toISOString(),
  updated: prismaSessionUser.updated.toISOString(),
  hasSeenOnboarding: prismaSessionUser.hasSeenOnboarding?.toISOString() ?? null,
  inscriptionValidee:
    prismaSessionUser.inscriptionValidee?.toISOString() ?? null,
  structureEmployeuseRenseignee:
    prismaSessionUser.structureEmployeuseRenseignee?.toISOString() ?? null,
  lieuxActiviteRenseignes:
    prismaSessionUser.lieuxActiviteRenseignes?.toISOString() ?? null,
  usurper: usurper ?? null,
  rdvAccount: prismaSessionUser.rdvAccount
    ? {
        id: prismaSessionUser.rdvAccount.id,
        hasOauthTokens: !!(
          prismaSessionUser.rdvAccount.accessToken &&
          prismaSessionUser.rdvAccount.refreshToken
        ),
        error: prismaSessionUser.rdvAccount.error ?? null,
        // Calculé ici une fois pour toutes : les écrans n'ont pas de quoi le
        // redériver, la session ne leur transmettant aucun jeton.
        statut: statutIntegrationDeLaSession(
          prismaSessionUser.rdvAccount,
          new Date(),
        ),
        includeRdvsInActivitesList:
          prismaSessionUser.rdvAccount.includeRdvsInActivitesList,
        created: prismaSessionUser.rdvAccount.created.toISOString(),
        updated: prismaSessionUser.rdvAccount.updated.toISOString(),
        syncFrom: prismaSessionUser.rdvAccount.syncFrom?.toISOString() ?? null,
        lastSynced:
          prismaSessionUser.rdvAccount.lastSynced?.toISOString() ?? null,
        organisations: prismaSessionUser.rdvAccount.organisations.map(
          ({ organisation }) => organisation,
        ),
        invalidWebhookOrganisationIds:
          prismaSessionUser.rdvAccount.invalidWebhookOrganisationIds ?? [],
      }
    : null,
})
