'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withActeurDeLaCoop } from '@/features/authentification/middlewares/with-acteur-de-la-coop'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { ModifierLaFicheDuLieuValidation } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.validation'
import { depuisLaSaisie } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/saisie-de-la-fiche.transfer'
import { modifierLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/modifier-la-fiche-du-lieu.mutation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
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
          par: UtilisateurId(user.id),
        }),
      { onError: MODIFIER_LA_FICHE_DU_LIEU_ERRORS },
    ),
  )
