'use server'

import { utilisateurDuPartage } from '@app/web/composition/statistiques/partage'
import { perimetreDesEmployeusesDe } from '@app/web/composition/statistiques/perimetre'
import {
  EmployeuseId,
  rechercherLesEmployeusesDesActivites,
} from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites'
import { RechercherLesEmployeusesDesActivitesValidation } from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { optionsDEmployeuses } from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites/ui'
import { resoudreUnLienDePartage } from '@app/web/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

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
