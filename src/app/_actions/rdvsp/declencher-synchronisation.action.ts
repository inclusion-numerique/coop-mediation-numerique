'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { DeclencherSynchronisationValidation } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.validation'
import { declencherSynchronisationAvec } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/declencher-synchronisation.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult, withInput } from '@/libraries/nextjs'

const declencher = declencherSynchronisationAvec(
  creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
)

/**
 * Synchronisation complète, déclenchée à la main : le bouton de la modale de
 * gestion, et celui de l'écran d'administration pour un tiers.
 *
 * Ne rend que la date de la passe : l'ancienne procédure tRPC renvoyait
 * l'utilisateur de session entier, jetons OAuth compris, jusque dans le
 * navigateur.
 */
export const declencherSynchronisationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(DeclencherSynchronisationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        declencher({
          demandeur: { id: UtilisateurCoopId(user.id), role: user.role },
          utilisateurId: input.utilisateurId,
          seulementSansWebhook: false,
        }),
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
