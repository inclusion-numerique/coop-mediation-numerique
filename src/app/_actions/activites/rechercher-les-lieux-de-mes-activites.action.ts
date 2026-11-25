'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { RechercherLesLieuxDesStatistiquesValidation } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { GenreDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/domain/index'
import { rechercherLesLieuxDesStatistiques } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-des-statistiques.query'
import { optionDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import { MediateurId } from '@/features/activites/domain'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withInput } from '@/libraries/nextjs'

export const rechercherLesLieuxDeMesActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherLesLieuxDesStatistiquesValidation))
  .execute(async ({ user, input: { genre, recherche } }) =>
    user.mediateur === null
      ? []
      : (
          await rechercherLesLieuxDesStatistiques({
            perimetre: {
              type: 'Mediateur',
              mediateur: MediateurId(user.mediateur.id),
            },
            genre: GenreDeLieu(genre),
            recherche,
          })
        ).map(optionDeLieu),
  )
