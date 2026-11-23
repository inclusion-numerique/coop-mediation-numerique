'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { RechercherLesLieuxDesStatistiquesValidation } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { GenreDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/domain/index'
import { rechercherLesLieuxDesStatistiques } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-des-statistiques.query'
import { optionDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import { PERIMETRE_NATIONAL } from '@/features/activites/domain'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withInput } from '@/libraries/nextjs'

export const rechercherLesLieuxNationauxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherLesLieuxDesStatistiquesValidation))
  .execute(async ({ input: { genre, recherche } }) =>
    (
      await rechercherLesLieuxDesStatistiques({
        perimetre: PERIMETRE_NATIONAL,
        genre: GenreDeLieu(genre),
        recherche,
      })
    ).map(optionDeLieu),
  )
