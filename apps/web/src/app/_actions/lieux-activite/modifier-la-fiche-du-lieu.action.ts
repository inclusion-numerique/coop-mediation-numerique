'use server'

import { withAuth } from '@app/web/features/authentification'
import { modifierLaFicheDuLieu } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import { depuisLaSaisie } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/depuis-la-saisie'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { ModifierLaFicheDuLieuValidation } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.validation'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const modifierLaFicheDuLieuAction = actionBuilder()
  .use(withAuth())
  .use(withInput(ModifierLaFicheDuLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        modifierLaFicheDuLieu({
          id: LieuId(input.id),
          modification: depuisLaSaisie(input.modification),
          par: UserId(user.id),
        }),
      { onError: MODIFIER_LA_FICHE_DU_LIEU_ERRORS },
    ),
  )
