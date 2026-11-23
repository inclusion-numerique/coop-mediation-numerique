'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { rechercherDesCommunesDesEmployeuses } from '@/features/employeuse/server'
import { RechercherDesCommunesValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-communes.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesCommunesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesCommunesValidation))
  .execute(({ input: { recherche } }) =>
    rechercherDesCommunesDesEmployeuses({ recherche, limite: 20 }),
  )
