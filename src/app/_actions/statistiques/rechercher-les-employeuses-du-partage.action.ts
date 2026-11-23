'use server'

import { z } from 'zod'
import { actionBuilder } from '@/configuration/nextjs'
import { RechercherLesEmployeusesDesActivitesValidation } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { rechercherLesEmployeusesDesActivites } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/implementations/prisma/rechercher-les-employeuses-des-activites.query'
import { optionsDEmployeuses } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses.presenter'
import { EmployeuseId } from '@/features/activites/domain/index'
import { perimetreDesEmployeusesDe } from '@/features/activites/implementations/statistiques'
import { getSessionUserFromId } from '@/features/authentification/implementations/session/session-user-from-session-token'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/resoudre-un-lien-de-partage.query'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import { withInput } from '@/libraries/nextjs'

const rechercherDansLePartage = actionBuilder()
  .use(
    withInput(
      RechercherLesEmployeusesDesActivitesValidation.extend({
        partage: z.string(),
      }),
    ),
  )
  .execute(async ({ input: { partage, recherche, exclues } }) => {
    const lien = await resoudreUnLienDePartage(partage)
    if (!lien.success) return []
    return optionsDEmployeuses(
      await rechercherLesEmployeusesDesActivites({
        perimetre: perimetreDesEmployeusesDe(
          utilisateurDuPartage(
            lien.data.proprietaire,
            await getSessionUserFromId(lien.data.utilisateurId),
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
  input: z.input<typeof RechercherLesEmployeusesDesActivitesValidation>,
) => rechercherDansLePartage({ ...input, partage })
