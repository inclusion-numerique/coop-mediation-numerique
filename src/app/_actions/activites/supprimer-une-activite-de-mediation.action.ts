'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ERRORS } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.errors'
import { SupprimerUneActiviteDeMediationValidation } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.validation'
import { supprimerUneActiviteDeMediation } from '@/features/activites/abilities/supprimer-une-activite-de-mediation/implementations/prisma/supprimer-une-activite-de-mediation.mutation'
import {
  ActiviteId,
  MediateurId,
  UtilisateurId,
} from '@/features/activites/domain'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'

export const supprimerUneActiviteDeMediationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUneActiviteDeMediationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUneActiviteDeMediation({
          activiteId: ActiviteId(input.activiteId),
          mediateurId:
            user.mediateur == null ? null : MediateurId(user.mediateur.id),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ERRORS },
    ),
  )
