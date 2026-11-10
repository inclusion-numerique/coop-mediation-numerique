'use server'

import { supprimerUneActiviteDeMediation } from '@app/web/features/activites/abilities/supprimer-une-activite-de-mediation'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ERRORS } from '@app/web/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.errors'
import { SupprimerUneActiviteDeMediationValidation } from '@app/web/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.validation'
import {
  ActiviteId,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/activites/domain'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

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
