'use server'

import { z } from 'zod'
import { actionBuilder } from '@/configuration/nextjs'
import {
  GenreDeLieu,
  rechercherLesLieuxDesStatistiques,
} from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques'
import { RechercherLesLieuxDesStatistiquesValidation } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { optionDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/statistiques'
import { getSessionUserFromId } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { utilisateurDuPartage } from '@/features/statistiques/implementations/utilisateur-du-partage'
import { withInput } from '@/libraries/nextjs'

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
      utilisateurDuPartage(
        lien.data.proprietaire,
        await getSessionUserFromId(lien.data.utilisateurId),
      ),
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
