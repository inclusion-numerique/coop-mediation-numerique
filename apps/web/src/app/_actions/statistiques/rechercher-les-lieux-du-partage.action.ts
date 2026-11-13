'use server'

import { utilisateurDuPartage } from '@app/web/composition/statistiques/partage'
import { perimetreDeLUtilisateur } from '@app/web/composition/statistiques/perimetre'
import {
  GenreDeLieu,
  rechercherLesLieuxDesStatistiques,
} from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { RechercherLesLieuxDesStatistiquesValidation } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { optionDeLieu } from '@app/web/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

const rechercherDansLePartage = actionBuilder()
  .use(
    withInput(
      RechercherLesLieuxDesStatistiquesValidation.extend({
        partage: z.string(),
      }),
    ),
  )
  .execute(async ({ input: { partage, genre, recherche } }) => {
    const lien = await resoudreUnLienDePartage(partage)
    if (!lien.success) return []
    const perimetre = perimetreDeLUtilisateur(
      await utilisateurDuPartage(lien.data),
    )
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

export const rechercherLesLieuxDuPartageAction = async (
  partage: string,
  input: z.input<typeof RechercherLesLieuxDesStatistiquesValidation>,
) => rechercherDansLePartage({ ...input, partage })
