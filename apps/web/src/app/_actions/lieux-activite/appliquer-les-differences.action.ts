'use server'

import { withAuth } from '@app/web/features/authentification'
import { appliquerLesDifferences } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import { AppliquerLesDifferencesValidation } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/appliquer-les-differences.validation'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const appliquerLesDifferencesAction = actionBuilder()
  .use(withAuth())
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
