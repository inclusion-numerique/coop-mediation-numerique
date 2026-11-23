'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withActeurDeLaCoop, withAuth } from '@/features/authentification'
import { modifierLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import { depuisLaSaisie } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/depuis-la-saisie'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { ModifierLaFicheDuLieuValidation } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.validation'
import { LieuId } from '@/features/lieux-activite/domain/lieu-id'
import { UserId } from '@/features/lieux-activite/domain/user-id'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const modifierLaFicheDuLieuAction = actionBuilder()
  .use(withAuth())
  .use(withActeurDeLaCoop())
  .use(withMaintenance())
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
