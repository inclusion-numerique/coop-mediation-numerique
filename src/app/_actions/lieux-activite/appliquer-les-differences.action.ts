'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withActeurDeLaCoop } from '@/features/authentification/middlewares/with-acteur-de-la-coop'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { AppliquerLesDifferencesValidation } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/appliquer-les-differences.validation'
import { MODIFIER_LA_FICHE_DU_LIEU_ERRORS } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/modifier-la-fiche-du-lieu.errors'
import { appliquerLesDifferences } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/domain/appliquer-les-differences'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/consulter-la-fiche-du-lieu.query'
import { enregistrerLesSections } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/enregistrer-les-sections.mutation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
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
          consulter: consulterLaFicheDuLieu,
          enregistrer: enregistrerLesSections,
        })({
          id: LieuId(input.id),
          choix: input.choix,
          par: UtilisateurId(user.id),
          maintenant: new Date(),
        }),
      { onError: MODIFIER_LA_FICHE_DU_LIEU_ERRORS },
    ),
  )
