'use server'

import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/auth/mediateursCoordonnes'
import {
  CoordinateurId,
  EmployeuseId,
  MediateurId,
  rechercherLesEmployeusesDesActivites,
} from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites'
import { RechercherLesEmployeusesDesActivitesValidation } from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites/action/rechercher-les-employeuses-des-activites.validation'
import { optionsDEmployeuses } from '@app/web/features/activites/abilities/rechercher-les-employeuses-des-activites/ui'
import { withAuth } from '@app/web/features/authentification'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const rechercherEmployeusesDesActivitesAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherLesEmployeusesDesActivitesValidation))
  .execute(async ({ user, input: { recherche, exclues } }) =>
    optionsDEmployeuses(
      await rechercherLesEmployeusesDesActivites({
        perimetre: {
          mediateurs: [
            ...(user.mediateur?.id ? [user.mediateur.id] : []),
            ...mediateurCoordonnesEtAnciensIdsFor(user),
          ].map((id) => MediateurId(id)),
          coordinateurId: user.coordinateur?.id
            ? CoordinateurId(user.coordinateur.id)
            : null,
        },
        recherche,
        exclues: exclues.flatMap((id) => {
          const employeuseId = EmployeuseId.safe(Number(id))
          return employeuseId === null ? [] : [employeuseId]
        }),
      }),
    ),
  )
