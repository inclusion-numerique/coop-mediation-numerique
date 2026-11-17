'use server'

import { z } from 'zod'
import { utilisateurDuPartage } from '@/composition/statistiques/partage'
import { perimetreDesEmployeusesDe } from '@/composition/statistiques/perimetre'
import { actionBuilder } from '@/configuration/nextjs'
import {
  EmployeuseId,
  rechercherLesEmployeusesDesActivites,
} from '@/features/activites/abilities/rechercher-les-employeuses-des-activites'
import { RechercherLesEmployeusesDesActivitesValidation } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { optionsDEmployeuses } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
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
          await utilisateurDuPartage(lien.data),
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
