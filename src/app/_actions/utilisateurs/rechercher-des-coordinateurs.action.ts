'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesCoordinateursValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-coordinateurs.validation'
import { rechercherDesCoordinateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/coordinateurs-a-choisir.query'
import { optionDuCoordinateur } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/presenters/coordinateur-a-choisir.presenter'
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
