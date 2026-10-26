'use server'

import { withAuth } from '@app/web/features/authentification'
import { retirerUnMembre } from '@app/web/features/equipe/abilities/retirer-un-membre'
import { RETIRER_UN_MEMBRE_ERRORS } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.errors'
import { RetirerUnMembreValidation } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.validation'
import {
  CoordinateurId,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const retirerUnMembreAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RetirerUnMembreValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        retirerUnMembre({
          mediateurId: MediateurId(input.mediateurId),
          coordinateurId: CoordinateurId(input.coordinateurId),
          gestionnaire: gestionnaireDe(user),
          auteurId: UtilisateurId(user.id),
        }),
      { onError: RETIRER_UN_MEMBRE_ERRORS },
    ),
  )
