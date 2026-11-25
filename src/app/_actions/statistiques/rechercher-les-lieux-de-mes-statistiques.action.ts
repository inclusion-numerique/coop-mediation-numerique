'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { RechercherLesLieuxDesStatistiquesValidation } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { GenreDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/domain/index'
import { rechercherLesLieuxDesStatistiques } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-des-statistiques.query'
import { optionDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withInput } from '@/libraries/nextjs'

export const rechercherLesLieuxDeMesStatistiquesAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherLesLieuxDesStatistiquesValidation))
  .execute(async ({ user, input: { genre, recherche } }) => {
    const perimetre = perimetreDeLUtilisateur(user)
    return perimetre === null
      ? []
      : (
          await rechercherLesLieuxDesStatistiques({
            perimetre,
            genre: GenreDeLieu(genre),
            recherche,
          })
        ).map(optionDeLieu)
  })
