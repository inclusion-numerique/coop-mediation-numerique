'use server'

import {
  GenreDeLieu,
  rechercherLesLieuxDesStatistiques,
} from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { RechercherLesLieuxDesStatistiquesValidation } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { optionDeLieu } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import { PERIMETRE_NATIONAL } from '@app/web/features/activites/domain'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

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
