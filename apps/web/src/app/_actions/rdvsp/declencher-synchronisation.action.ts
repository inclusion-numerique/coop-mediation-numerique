'use server'

import { withAuth } from '@app/web/features/authentification'
import { DECLENCHER_SYNCHRONISATION_ERRORS } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.errors'
import { DeclencherSynchronisationValidation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/declencher-synchronisation.validation'
import { declencherSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/declencher-synchronisation'
import { lancerSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/lancer-synchronisation.adapter'
import { compteACible } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/prisma/marquer-echec.mutation'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import * as Sentry from '@sentry/nextjs'

const declencher = declencherSynchronisation({
  compteACible,
  lancer: lancerSynchronisation,
  marquerEchec: marquerEchecDeSynchronisation(),
  signaler: (erreur) => Sentry.captureException?.(erreur),
})

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
