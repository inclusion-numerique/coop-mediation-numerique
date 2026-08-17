'use server'

import { withAuth } from '@app/web/features/authentification'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { declencherSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/declencher-synchronisation'
import { lancerSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/lancer-synchronisation.adapter'
import { compteACible } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/prisma/marquer-echec.mutation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'
import * as Sentry from '@sentry/nextjs'

const declencher = declencherSynchronisation({
  compteACible,
  lancer: lancerSynchronisation,
  marquerEchec: marquerEchecDeSynchronisation(),
  signaler: (erreur) => Sentry.captureException?.(erreur),
})

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
