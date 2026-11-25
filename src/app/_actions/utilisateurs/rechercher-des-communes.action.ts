'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherDesCommunesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations/prisma/communes-des-employeuses.query'
import { optionsDesCommunes } from '@/features/employeuse/abilities/rechercher-employeuse/ui/presenters/option-de-la-commune.presenter'
import { RechercherDesCommunesValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-communes.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesCommunesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesCommunesValidation))
  .execute(async ({ input: { recherche } }) =>
    optionsDesCommunes(
      await rechercherDesCommunesDesEmployeuses({ recherche, limite: 20 }),
    ),
  )
