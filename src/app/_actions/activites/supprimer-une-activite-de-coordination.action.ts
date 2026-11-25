'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ERRORS } from '@/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.errors'
import { SupprimerUneActiviteDeCoordinationValidation } from '@/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.validation'
import { supprimerUneActiviteDeCoordination } from '@/features/activites/abilities/supprimer-une-activite-de-coordination/implementations/prisma/supprimer-une-activite-de-coordination.mutation'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
  UtilisateurId,
} from '@/features/activites/domain'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

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
          auteurId: UtilisateurId(user.id),
        }),
      { onError: SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ERRORS },
    ),
  )
