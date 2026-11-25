'use server'

import { actionBuilder } from '@/configuration/nextjs'
import {
  type RechercheDeLieuxDesStatistiques,
  RechercherLesLieuxDuPartageValidation,
} from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/action/rechercher-les-lieux-des-statistiques.validation'
import { GenreDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/domain/index'
import { rechercherLesLieuxDesStatistiques } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-des-statistiques.query'
import { optionDeLieu } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/options-de-lieux.presenter'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre.query'
import { utilisateurDeLaSessionParId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/resoudre-un-lien-de-partage.query'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import { withInput } from '@/libraries/nextjs'

const rechercherDansLePartage = actionBuilder()
  .use(withInput(RechercherLesLieuxDuPartageValidation))
  .execute(async ({ input: { partage, genre, recherche } }) => {
    const lien = await resoudreUnLienDePartage(partage)
    if (!lien.success) return []
    const perimetre = perimetreDeLUtilisateur(
      utilisateurDuPartage(
        lien.data.proprietaire,
        await utilisateurDeLaSessionParId(lien.data.utilisateurId),
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
  input: RechercheDeLieuxDesStatistiques,
) => rechercherDansLePartage({ ...input, partage })
