'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherDesCoordinateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs'
import { RechercherDesCoordinateursValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-coordinateurs.validation'
import { optionDuCoordinateur } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesCoordinateursAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesCoordinateursValidation))
  .execute(async ({ input: { recherche } }) =>
    (await rechercherDesCoordinateurs({ recherche, limite: 20 })).map(
      optionDuCoordinateur,
    ),
  )
