'use server'

import { perimetreDesEmployeusesDe } from '@/composition/statistiques/perimetre'
import { actionBuilder } from '@/configuration/nextjs'
import {
  EmployeuseId,
  rechercherLesEmployeusesDesActivites,
} from '@/features/activites/abilities/rechercher-les-employeuses-des-activites'
import { RechercherLesEmployeusesDesActivitesValidation } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { optionsDEmployeuses } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui'
import { withAuth } from '@/features/authentification'
import { withInput } from '@/libraries/nextjs'

export const rechercherEmployeusesDesActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherLesEmployeusesDesActivitesValidation))
  .execute(async ({ user, input: { recherche, exclues } }) =>
    optionsDEmployeuses(
      await rechercherLesEmployeusesDesActivites({
        perimetre: perimetreDesEmployeusesDe(user),
        recherche,
        exclues: exclues.flatMap((id) => {
          const employeuseId = EmployeuseId.safe(Number(id))
          return employeuseId === null ? [] : [employeuseId]
        }),
      }),
    ),
  )
