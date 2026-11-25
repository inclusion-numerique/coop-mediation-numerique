'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherDesLieuxAChoisir } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/lieux-a-choisir.query'
import { RechercherDesLieuxValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-lieux.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesLieuxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesLieuxValidation))
  .execute(({ input: { recherche } }) =>
    rechercherDesLieuxAChoisir({ recherche, limite: 20 }),
  )
