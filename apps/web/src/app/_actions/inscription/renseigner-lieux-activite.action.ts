'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  RENSEIGNER_LIEUX_ACTIVITE_ERRORS,
  RenseignerLieuxActiviteValidation,
} from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import { renseignerLieuxActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/renseigner-lieux-activite'
import { trouverStructuresCarto } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const renseignerLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RenseignerLieuxActiviteValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        renseignerLieuxActivite({
          command: {
            userId: UserId(user.id),
            lieuxActivite: input.lieuxActivite,
          },
          trouverStructuresCarto,
          maintenant: new Date(),
        }),
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
