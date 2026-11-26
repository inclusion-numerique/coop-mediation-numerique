'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withActeurDeLaCoop } from '@/features/authentification/middlewares/with-acteur-de-la-coop'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { APPLIQUER_LES_DIFFERENCES_ERRORS } from '@/features/lieux-activite/abilities/appliquer-les-differences/action/appliquer-les-differences.errors'
import { AppliquerLesDifferencesValidation } from '@/features/lieux-activite/abilities/appliquer-les-differences/action/appliquer-les-differences.validation'
import { appliquerLesDifferences } from '@/features/lieux-activite/abilities/appliquer-les-differences/domain/appliquer-les-differences'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/consulter-la-fiche-du-lieu.query'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { UtilisateurId } from '@/features/lieux-activite/domain/identifiants/utilisateur-id'
import { enregistrerLesSections } from '@/features/lieux-activite/implementations/prisma/enregistrer-les-sections.mutation'
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
      { onError: APPLIQUER_LES_DIFFERENCES_ERRORS },
    ),
  )
