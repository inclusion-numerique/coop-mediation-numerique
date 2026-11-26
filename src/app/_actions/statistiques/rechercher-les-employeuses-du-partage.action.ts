'use server'

import { actionBuilder } from '@/configuration/nextjs'
import {
  type RechercheDEmployeusesDesActivites,
  RechercherLesEmployeusesDuPartageValidation,
} from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { rechercherLesEmployeusesDesActivites } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/implementations/prisma/rechercher-les-employeuses-des-activites.query'
import { optionsDEmployeuses } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses.presenter'
import { EmployeuseId } from '@/features/activites/domain/index'
import { perimetreDesEmployeusesDe } from '@/features/activites/implementations/session/perimetre.query'
import { utilisateurDeLaSessionParId } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/domain'
import { lireLePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/partage.query'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import { withInput } from '@/libraries/nextjs'

const rechercherDansLePartage = actionBuilder()
  .use(withInput(RechercherLesEmployeusesDuPartageValidation))
  .execute(async ({ input: { partage, recherche, exclues } }) => {
    const lien = await resoudreUnLienDePartage({ lirePartage: lireLePartage })({
      lien: partage,
    })
    if (!lien.success) return []
    return optionsDEmployeuses(
      await rechercherLesEmployeusesDesActivites({
        perimetre: perimetreDesEmployeusesDe(
          utilisateurDuPartage(
            lien.data.proprietaire,
            await utilisateurDeLaSessionParId(lien.data.utilisateurId),
          ),
        ),
        recherche,
        exclues: exclues.flatMap((id) => {
          const employeuseId = EmployeuseId.safe(Number(id))
          return employeuseId === null ? [] : [employeuseId]
        }),
      }),
    )
  })

export const rechercherLesEmployeusesDuPartageAction = async (
  partage: string,
  input: RechercheDEmployeusesDesActivites,
) => rechercherDansLePartage({ ...input, partage })
