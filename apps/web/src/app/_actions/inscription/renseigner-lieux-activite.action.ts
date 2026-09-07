'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  RENSEIGNER_LIEUX_ACTIVITE_ERRORS,
  RenseignerLieuxActiviteValidation,
} from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import { depuisLaSaisie } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/action/depuis-la-saisie'
import { renseignerLieuxActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/renseigner-lieux-activite'
import type {
  AdresseNonValidee,
  RenseignerLieuxActiviteError,
} from '@app/web/features/inscription/abilities/renseigner-lieux-activite/domain'
import { trouverStructuresCarto } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import type { Result } from '@app/web/libraries/result'

export const renseignerLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RenseignerLieuxActiviteValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<
        Result<void, RenseignerLieuxActiviteError | AdresseNonValidee>
      > => {
        const lieuxActivite = depuisLaSaisie(input.lieuxActivite)

        if (!lieuxActivite.success) return lieuxActivite

        return renseignerLieuxActivite({
          command: {
            userId: UserId(user.id),
            lieuxActivite: lieuxActivite.data,
          },
          trouverStructuresCarto,
          maintenant: new Date(),
        })
      },
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
