'use server'

import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/auth/mediateursCoordonnes'
import { searchStructuresEmployeuses } from '@app/web/features/activites/use-cases/list/db/getStructuresEmployeusesOptions'
import { withAuth } from '@app/web/features/authentification'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

export const rechercherEmployeusesDesActivitesAction = actionBuilder()
  .use(withAuth())
  .use(
    withInput(
      z.object({
        recherche: z.string(),
        exclues: z.array(z.string().regex(/^\d+$/)),
      }),
    ),
  )
  .execute(async ({ user, input: { recherche, exclues } }) => {
    const { items } = await searchStructuresEmployeuses({
      query: recherche,
      excludeIds: exclues,
      mediateurIds: [
        ...(user.mediateur?.id ? [user.mediateur.id] : []),
        ...mediateurCoordonnesEtAnciensIdsFor(user),
      ],
      coordinateurId: user.coordinateur?.id,
    })

    return items
  })
