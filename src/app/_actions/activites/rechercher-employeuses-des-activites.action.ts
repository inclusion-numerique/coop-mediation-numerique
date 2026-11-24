'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { RechercherLesEmployeusesDesActivitesValidation } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { rechercherLesEmployeusesDesActivites } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/implementations/prisma/rechercher-les-employeuses-des-activites.query'
import { optionsDEmployeuses } from '@/features/activites/abilities/rechercher-les-employeuses-des-activites/ui/presenters/options-d-employeuses.presenter'
import { EmployeuseId } from '@/features/activites/domain/index'
import { perimetreDesEmployeusesDe } from '@/features/activites/implementations/session/perimetre.query'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
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
