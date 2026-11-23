'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherDesCommunesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations'
import { RechercherDesCommunesValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-communes.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesCommunesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesCommunesValidation))
  .execute(({ input: { recherche } }) =>
    rechercherDesCommunesDesEmployeuses({ recherche, limite: 20 }),
  )
