'use server'

import { perimetreDeLUtilisateur } from '@app/web/composition/statistiques/perimetre'
import {
  GenreDeLieu,
  rechercherLesLieuxDesStatistiques,
} from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { RechercherLesLieuxDesStatistiquesValidation } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { optionDeLieu } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import { withAuth } from '@app/web/features/authentification'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

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
