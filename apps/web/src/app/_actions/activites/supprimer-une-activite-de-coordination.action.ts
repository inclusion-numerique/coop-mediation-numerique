'use server'

import { supprimerUneActiviteDeCoordination } from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination'
import { SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ERRORS } from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.errors'
import { SupprimerUneActiviteDeCoordinationValidation } from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.validation'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@app/web/features/activites/domain'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const supprimerUneActiviteDeCoordinationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUneActiviteDeCoordinationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUneActiviteDeCoordination({
          activiteId: ActiviteDeCoordinationId(input.activiteId),
          coordinateurId:
            user.coordinateur == null
              ? null
              : CoordinateurId(user.coordinateur.id),
          auteurId: user.id,
        }),
      { onError: SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ERRORS },
    ),
  )
