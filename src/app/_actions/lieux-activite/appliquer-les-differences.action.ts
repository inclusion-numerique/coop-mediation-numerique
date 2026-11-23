'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withActeurDeLaCoop, withAuth } from '@/features/authentification'
import { appliquerLesDifferences } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import { AppliquerLesDifferencesValidation } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/appliquer-les-differences.validation'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { LieuId } from '@/features/lieux-activite/domain/lieu-id'
import { UserId } from '@/features/lieux-activite/domain/user-id'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const appliquerLesDifferencesAction = actionBuilder()
  .use(withAuth())
  .use(withActeurDeLaCoop())
  .use(withMaintenance())
  .use(withInput(AppliquerLesDifferencesValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        appliquerLesDifferences({
          id: LieuId(input.id),
          choix: input.choix,
          par: UserId(user.id),
        }),
      { onError: MODIFIER_LA_FICHE_DU_LIEU_ERRORS },
    ),
  )
