'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { declencherSynchronisationAvec } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/declencher-synchronisation.binding'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { fromResult } from '@/libraries/nextjs'

const declencher = declencherSynchronisationAvec(
  creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
)

/**
 * Rattrapage au chargement d'un écran, pour son propre compte : seules les
 * organisations dont le webhook n'a pas pu être posé sont parcourues, les autres
 * arrivant par notification.
 *
 * `derive` vaut zéro quand rien n'a bougé — c'est ce qui dispense l'écran de se
 * rafraîchir.
 */
export const rattraperRdvsSansWebhookAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      async ({ user }) =>
        declencher({
          demandeur: { id: UtilisateurCoopId(user.id), role: user.role },
          utilisateurId: UtilisateurCoopId(user.id),
          seulementSansWebhook: true,
        }),
      { onError: DECLENCHER_SYNCHRONISATION_ERRORS },
    ),
  )
